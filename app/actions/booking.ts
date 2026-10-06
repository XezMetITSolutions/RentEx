'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { stripe } from "@/lib/stripe";
import { hashPassword, setSession, getSession, grantBookingView } from "@/lib/auth";
import { getAdminSession } from "@/lib/adminAuth";
import { auditLog } from "@/lib/audit";
import path from 'path';
import { calculateChargeableDays, isOutsideOpeningHours, parseBookingDateTime } from "@/lib/bookingUtils";
import { BUSINESS, PENDING_PAYMENT_TTL_MINUTES, RENTAL_TERMS, SITE_URL } from "@/lib/config";
import { CAR_BUSY_MESSAGE, isBookableCar, isCarAvailable, lockCarForBooking, overlapWhere, UNPAID_ONLINE } from "@/lib/availability";
import { bookingRejectedReason, onlineAmountRejected } from "@/lib/rentalGuards";
import { bookableOptions, quoteBooking, resolveSelection, type PriceOption } from "@/lib/bookingPrice";
import { findUsableCoupon, releaseCouponUse } from "@/lib/coupons";
import { rateLimit, getClientIpFromHeaders, rateLimitErrorMessage } from "@/lib/rateLimit";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { sendEmail, emailTemplates, COMPANY_EMAIL } from "@/lib/notificationTemplates";

const MIN_PASSWORD_LENGTH = 8;
const MAX_LICENSE_PHOTO_BYTES = 10 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts "15/08/1990", "15.08.1990", "15-08-90" and ISO "1990-08-15". */
function parseFlexibleDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const value = dateStr.trim();
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
        const d = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
        return isNaN(d.getTime()) ? null : d;
    }

    const parts = value.replace(/[.\-]/g, '/').split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) {
        const currentYearShort = new Date().getFullYear() % 100;
        year += year > currentYearShort + 5 ? 1900 : 2000;
    }
    const d = new Date(Date.UTC(year, month, day));
    // Reject roll-overs such as 31/02.
    if (isNaN(d.getTime()) || d.getUTCDate() !== day || d.getUTCMonth() !== month) return null;
    return d;
}

function ageOn(birth: Date, on: Date): number {
    let age = on.getUTCFullYear() - birth.getUTCFullYear();
    const m = on.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && on.getUTCDate() < birth.getUTCDate())) age--;
    return age;
}

const text = (formData: FormData, key: string) => ((formData.get(key) as string | null) ?? '').trim();

async function uploadLicensePhoto(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name) || '.jpg';
    const key = `customer-docs/licenses/${Date.now()}-${crypto.randomUUID()}${fileExtension}`;
    await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'image/jpeg',
    }));
    return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;
}

/** Bookable options of a car as plain numbers. */
async function loadBookableOptions(carId: number): Promise<PriceOption[]> {
    const raw = await prisma.option.findMany({
        where: { status: 'active', OR: [{ carId: null }, { carId }] },
    });
    return bookableOptions(raw.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        price: Number(o.price),
        type: o.type,
        isPerDay: o.isPerDay,
        maxPrice: o.maxPrice != null ? Number(o.maxPrice) : null,
        maxDays: o.maxDays,
        isMandatory: o.isMandatory,
        carId: o.carId,
    })), carId);
}

/** Expected booking failures that are reported to the user instead of thrown. */
class BookingConflictError extends Error {}

type BookingState = { success: false; error: string } | null;

export async function createBooking(prevState: BookingState, formData: FormData): Promise<BookingState> {
    const adminSession = await getAdminSession();
    const customerSession = await getSession();

    // 1. Booking period (wall-clock times in Feldkirch)
    const carId = parseInt(text(formData, 'carId'), 10);
    const startDateStr = text(formData, 'startDate');
    const endDateStr = text(formData, 'endDate');
    const pickupTimeStr = text(formData, 'pickupTime') || '10:00';
    const returnTimeStr = text(formData, 'returnTime') || '10:00';

    const startDate = parseBookingDateTime(startDateStr, pickupTimeStr);
    const endDate = parseBookingDateTime(endDateStr, returnTimeStr);
    const optionIds = text(formData, 'options').split(',').filter(Boolean).map(Number).filter(Number.isInteger);
    const couponCode = text(formData, 'couponCode').toUpperCase() || null;
    const isMobile = formData.get('isMobile') === 'true';

    if (!Number.isInteger(carId) || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
        return { success: false, error: 'Ungültiger Buchungszeitraum.' };
    }
    // A few minutes of slack for slow form submits.
    if (startDate.getTime() < Date.now() - 15 * 60_000) {
        return { success: false, error: 'Der Abholzeitpunkt liegt in der Vergangenheit.' };
    }

    // 2. Customer data
    const firstName = text(formData, 'firstName');
    const lastName = text(formData, 'lastName');
    const email = text(formData, 'email').toLowerCase();
    const phone = text(formData, 'phone');
    const address = text(formData, 'address');
    const city = text(formData, 'city');
    const postalCode = text(formData, 'postalCode');
    const country = text(formData, 'country') || 'Österreich';
    const paymentMethod = text(formData, 'paymentMethod') === 'online' ? 'online' : 'arrival';
    const customerType = text(formData, 'customerType') === 'Business' ? 'Business' : 'Private';
    const company = text(formData, 'company');
    const taxId = text(formData, 'taxId');
    const password = (formData.get('password') as string | null) ?? '';
    const passwordRepeat = formData.get('passwordRepeat') as string | null;

    if (text(formData, 'agbAccepted') !== 'yes') {
        return { success: false, error: 'Bitte akzeptieren Sie die AGB und die Datenschutzerklärung.' };
    }
    if (!firstName || !lastName || !address || !city || !postalCode) {
        return { success: false, error: 'Bitte füllen Sie alle Pflichtfelder aus.' };
    }
    if (!EMAIL_RE.test(email)) {
        return { success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
    }
    if (phone.replace(/\D/g, '').length < 6) {
        return { success: false, error: 'Bitte geben Sie eine gültige Telefonnummer ein.' };
    }
    if (customerType === 'Business' && !company) {
        return { success: false, error: 'Bitte geben Sie den Firmennamen an.' };
    }
    if (isOutsideOpeningHours(startDateStr, pickupTimeStr) && paymentMethod !== 'online') {
        return { success: false, error: 'Außerhalb der Öffnungszeiten ist nur die Online-Zahlung möglich. Die Übergabe stimmen wir telefonisch ab.' };
    }
    if (!adminSession) {
        const ip = await getClientIpFromHeaders();
        const rl = rateLimit(`booking:${ip}`, { limit: 8, windowSeconds: 60 * 10 });
        if (!rl.allowed) return { success: false, error: rateLimitErrorMessage(rl, 'Buchung') };
    }

    const existing = await prisma.customer.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existing?.isBlacklisted && !adminSession) {
        return { success: false, error: 'Eine Online-Buchung ist leider nicht möglich. Bitte kontaktieren Sie uns telefonisch.' };
    }
    const isSelf = !!existing && customerSession === existing.id;
    const isAdmin = !!adminSession;
    const isGuestRecord = !!existing && !existing.passwordHash;

    // Accounts with a password are protected; guest records (earlier bookings
    // without an account) may book again with the same e-mail.
    if (existing && !isSelf && !isAdmin && !isGuestRecord) {
        return { success: false, error: `Für ${email} gibt es bereits ein Kundenkonto. Bitte melden Sie sich an.` };
    }

    const parsedDob = parseFlexibleDate(text(formData, 'dateOfBirth')) ?? existing?.dateOfBirth ?? null;
    if (!parsedDob) {
        return { success: false, error: 'Bitte geben Sie Ihr Geburtsdatum an (TT/MM/JJJJ).' };
    }
    if (ageOn(parsedDob, startDate) < RENTAL_TERMS.MIN_DRIVER_AGE) {
        return { success: false, error: `Der Fahrer muss bei Mietbeginn mindestens ${RENTAL_TERMS.MIN_DRIVER_AGE} Jahre alt sein.` };
    }

    const licenseNumber = text(formData, 'licenseNumber') || existing?.licenseNumber || '';
    const licenseCountry = text(formData, 'licenseCountry') || existing?.licenseCountry || null;
    const licenseExpiry = parseFlexibleDate(text(formData, 'licenseExpiryDate')) ?? existing?.licenseExpiryDate ?? null;
    if (!licenseNumber || !licenseExpiry) {
        return { success: false, error: 'Bitte geben Sie Führerscheinnummer und Ablaufdatum an.' };
    }
    if (licenseExpiry < endDate) {
        return { success: false, error: 'Ihr Führerschein muss bis zum Ende der Miete gültig sein.' };
    }

    const licensePhotoFile = formData.get('licensePhoto');
    const hasNewPhoto = licensePhotoFile instanceof File && licensePhotoFile.size > 0;
    if (hasNewPhoto) {
        const okType = licensePhotoFile.type.startsWith('image/') || licensePhotoFile.type === 'application/pdf';
        if (!okType) return { success: false, error: 'Bitte laden Sie den Führerschein als Bild oder PDF hoch.' };
        if (licensePhotoFile.size > MAX_LICENSE_PHOTO_BYTES) return { success: false, error: 'Das Führerscheinfoto darf höchstens 10 MB groß sein.' };
    } else if (!existing?.licensePhotoUrl) {
        return { success: false, error: 'Bitte laden Sie ein Foto Ihres Führerscheins (Vorderseite) hoch.' };
    }

    const wantsAccount = !existing && password.length > 0;
    if (wantsAccount) {
        if (password.length < MIN_PASSWORD_LENGTH) {
            return { success: false, error: `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.` };
        }
        if (passwordRepeat != null && passwordRepeat !== password) {
            return { success: false, error: 'Die Passwörter stimmen nicht überein.' };
        }
    }

    // 3. Car, options, price
    const car = await prisma.car.findUnique({
        where: { id: carId },
        include: { currentLocation: true },
    });
    if (!car || !isBookableCar(car)) {
        return { success: false, error: 'Dieses Fahrzeug ist nicht buchbar.' };
    }

    const days = calculateChargeableDays(startDateStr, pickupTimeStr, endDateStr, returnTimeStr);
    const rejected = bookingRejectedReason(car, endDate, days);
    if (rejected) return { success: false, error: rejected };
    const selectedOptions = resolveSelection(await loadBookableOptions(carId), optionIds);

    let coupon: Awaited<ReturnType<typeof findUsableCoupon>> | null = null;
    if (couponCode) {
        coupon = await findUsableCoupon(couponCode, { customerId: existing?.id ?? null });
        if (!coupon.ok) return { success: false, error: coupon.error };
    }
    const usableCoupon = coupon?.ok ? coupon : null;

    const quote = quoteBooking(car, selectedOptions, days, usableCoupon, startDate);
    if (paymentMethod === 'online') {
        const tooSmall = onlineAmountRejected(quote.total);
        if (tooSmall) return { success: false, error: tooSmall };
    }
    if (usableCoupon?.minOrderAmount != null && quote.baseTotal < usableCoupon.minOrderAmount) {
        return { success: false, error: `Dieser Gutschein gilt ab einem Mietpreis von €${usableCoupon.minOrderAmount.toFixed(2)}.` };
    }
    if (paymentMethod !== 'online' && existing) {
        const openArrival = await prisma.rental.count({
            where: {
                customerId: existing.id,
                status: 'Pending',
                paymentStatus: { notIn: ['Paid', 'Refunded'] },
                paymentMethod: { in: ['arrival', 'Cash', 'Bar'] },
            },
        });
        if (openArrival >= 1) {
            return { success: false, error: 'Sie haben bereits eine offene Reservierung zur Zahlung bei Abholung. Bitte schließen Sie diese ab oder bezahlen Sie online.' };
        }
    }
    if (existing && !adminSession) {
        const openUnpaid = await prisma.rental.count({
            where: {
                customerId: existing.id,
                status: 'Pending',
                paymentStatus: { notIn: ['Paid', 'Refunded'] },
            },
        });
        if (openUnpaid >= 2) {
            return { success: false, error: 'Sie haben bereits zwei offene, unbezahlte Reservierungen. Bitte schließen Sie eine davon ab.' };
        }
    }

    // 4. A customer retrying after abandoning Stripe must not be blocked by
    //    their own unpaid checkout for the same car.
    if (existing) {
        const abandoned = await prisma.rental.findMany({
            where: { ...UNPAID_ONLINE, customerId: existing.id, carId },
            select: { id: true, stripeSessionId: true, discountReason: true },
        });
        for (const rental of abandoned) {
            if (rental.stripeSessionId) {
                try {
                    await stripe.checkout.sessions.expire(rental.stripeSessionId);
                } catch {
                    // Already expired or completed; the status update below is conditional anyway.
                }
            }
            const released = await prisma.rental.updateMany({
                where: { id: rental.id, ...UNPAID_ONLINE },
                data: { status: 'Cancelled', notes: 'Storniert: Kunde hat die Buchung neu gestartet.' },
            });
            if (released.count > 0) await releaseCouponUse(rental.discountReason);
        }
    }

    // Early, unlocked check so we fail before creating/updating the customer.
    // The authoritative check runs again under a row lock when the rental is created.
    if (!(await isCarAvailable(carId, startDate, endDate))) {
        return { success: false, error: CAR_BUSY_MESSAGE };
    }

    // 5. License photo (validated above)
    let licensePhotoUrl: string | null = null;
    if (hasNewPhoto) {
        try {
            licensePhotoUrl = await uploadLicensePhoto(licensePhotoFile);
        } catch (error) {
            console.error('License upload to R2 error:', error);
            return { success: false, error: 'Das Führerscheinfoto konnte nicht hochgeladen werden. Bitte erneut versuchen.' };
        }
    }

    // 6. Find or create the customer
    let customer;
    if (!existing) {
        customer = await prisma.customer.create({
            data: {
                firstName, lastName, email, phone, address, city, postalCode, country,
                customerType, company, taxId,
                dateOfBirth: parsedDob,
                licenseNumber,
                licenseCountry,
                licenseExpiryDate: licenseExpiry,
                licensePhotoUrl,
                passwordHash: wantsAccount ? hashPassword(password) : undefined,
                agbAcceptedAt: new Date(),
            }
        });
        if (wantsAccount) await setSession(customer.id);

        await auditLog({
            userId: adminSession?.id || customer.id,
            userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
            action: 'CREATE',
            entityType: 'Customer',
            entityId: customer.id,
            description: `Customer created during booking: ${customer.email}`
        });
    } else if (isSelf || isAdmin) {
        customer = await prisma.customer.update({
            where: { id: existing.id },
            data: {
                firstName, lastName, phone, address, city, postalCode, country,
                customerType, company, taxId,
                dateOfBirth: parsedDob,
                licenseNumber,
                licenseCountry: licenseCountry || undefined,
                licensePhotoUrl: licensePhotoUrl || undefined,
                licenseExpiryDate: licenseExpiry,
                agbAcceptedAt: existing.agbAcceptedAt ?? new Date(),
            }
        });
    } else {
        // Guest record: nobody is signed in, so only fill gaps and refresh the
        // licence — never overwrite stored contact data on an unauthenticated request.
        customer = await prisma.customer.update({
            where: { id: existing.id },
            data: {
                firstName: existing.firstName || firstName,
                lastName: existing.lastName || lastName,
                phone: existing.phone || phone,
                address: existing.address || address,
                city: existing.city || city,
                postalCode: existing.postalCode || postalCode,
                country: existing.country || country,
                company: existing.company || company || undefined,
                taxId: existing.taxId || taxId || undefined,
                dateOfBirth: existing.dateOfBirth ?? parsedDob,
                licenseNumber,
                licenseCountry: licenseCountry || undefined,
                licenseExpiryDate: licenseExpiry,
                licensePhotoUrl: licensePhotoUrl || undefined,
                agbAcceptedAt: existing.agbAcceptedAt ?? new Date(),
            }
        });
    }

    // 7. Create the rental
    let rental;
    try {
        rental = await prisma.$transaction(async (tx) => {
            await lockCarForBooking(tx, carId);
            if (!(await isCarAvailable(carId, startDate, endDate, tx))) {
                throw new BookingConflictError(CAR_BUSY_MESSAGE);
            }

            if (usableCoupon) {
                // Atomic claim: only succeeds while the coupon is still under its usage limit.
                const claimed = await tx.$executeRaw`
                    UPDATE "DiscountCoupon"
                    SET "usedCount" = "usedCount" + 1
                    WHERE "id" = ${usableCoupon.id}
                      AND "isActive" = true
                      AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")
                `;
                if (claimed === 0) {
                    throw new BookingConflictError('Der Gutschein ist nicht mehr verfügbar.');
                }
            }

            const created = await tx.rental.create({
                data: {
                    carId,
                    customerId: customer.id,
                    startDate,
                    endDate,
                    dailyRate: car.dailyRate,
                    totalDays: days,
                    totalAmount: quote.total,
                    discountAmount: quote.discount || undefined,
                    discountReason: usableCoupon ? `Gutschein ${usableCoupon.code}` : undefined,
                    status: 'Pending',
                    paymentStatus: 'Pending',
                    extrasCost: quote.extrasCost,
                    insuranceCost: quote.insuranceCost,
                    insuranceType: quote.insuranceName,
                    pickupLocationId: car.locationId,
                    returnLocationId: car.locationId,
                    paymentMethod: paymentMethod === 'online' ? 'Online' : 'arrival',
                    includedKm: quote.includedKm,
                }
            });

            if (selectedOptions.length > 0) {
                await tx.rentalOption.createMany({
                    data: selectedOptions.map((opt) => ({ rentalId: created.id, optionId: opt.id })),
                });
            }

            // Derived from the id so it is unique without a racy count(); 7 digits
            // keeps it distinct from the legacy 6-digit count-based numbers.
            return tx.rental.update({
                where: { id: created.id },
                data: { contractNumber: `RNT-${new Date().getFullYear()}-${String(created.id).padStart(7, '0')}` },
            });
        });
    } catch (error) {
        if (error instanceof BookingConflictError) {
            return { success: false, error: error.message };
        }
        throw error;
    }
    const contractNumber = rental.contractNumber!;

    await auditLog({
        userId: adminSession?.id || customer.id,
        userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
        action: 'CREATE',
        entityType: 'Rental',
        entityId: rental.id,
        description: `Booking created for car ${car.brand} ${car.model}. Contract: ${contractNumber}`,
        metadata: { totalAmount: quote.total, days, carId }
    });

    await prisma.notification.create({
        data: {
            type: 'System',
            subject: 'Neue Reservierung erhalten',
            message: `Neue Buchung für ${car.brand} ${car.model} von ${customer.firstName} ${customer.lastName} erhalten. Vertragsnummer: ${contractNumber}`,
            status: 'Pending',
            relatedType: 'Rental',
            relatedId: rental.id,
            recipient: 'Admin'
        }
    });

    // 8. Payment
    if (paymentMethod === 'online') {
        const retryParams = new URLSearchParams({
            carId: String(carId),
            startDate: startDateStr,
            endDate: endDateStr,
            pickupTime: pickupTimeStr,
            returnTime: returnTimeStr,
            options: selectedOptions.map((o) => o.id).join(','),
        });
        if (couponCode) retryParams.set('couponCode', couponCode);

        let successUrl = `${SITE_URL}/checkout/success/${rental.id}?session_id={CHECKOUT_SESSION_ID}`;
        let cancelUrl = `${SITE_URL}/checkout?${retryParams.toString()}`;
        if (isMobile) {
            successUrl = `${SITE_URL}/mobile/payment/success?rentalId=${rental.id}&session_id={CHECKOUT_SESSION_ID}`;
            cancelUrl = `${SITE_URL}/mobile/payment/${carId}?${retryParams.toString()}`;
        }

        const fmt = (d: Date) => formatInTimeZone(d, BUSINESS.TIME_ZONE, 'dd.MM.yyyy HH:mm');
        let sessionUrl: string | null = null;
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `${car.brand} ${car.model} Miete`,
                                description: `${days} ${days === 1 ? 'Tag' : 'Tage'} · ${fmt(startDate)} – ${fmt(endDate)} · ${contractNumber}`,
                            },
                            unit_amount: Math.round(quote.total * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                // The car stays reserved only for the payment window.
                expires_at: Math.floor(Date.now() / 1000) + PENDING_PAYMENT_TTL_MINUTES * 60 + 60,
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: customer.email,
                locale: 'de',
                metadata: {
                    rentalId: rental.id.toString(),
                },
            });

            await prisma.rental.update({
                where: { id: rental.id },
                data: { stripeSessionId: session.id }
            });
            sessionUrl = session.url;
        } catch (error) {
            console.error("Stripe Session Error:", error);
            // Release the car right away instead of holding it for the payment window.
            await prisma.rental.update({
                where: { id: rental.id },
                data: { status: 'Cancelled', notes: 'Storniert: Stripe-Zahlung konnte nicht gestartet werden.' },
            });
            await releaseCouponUse(rental.discountReason);
            return { success: false, error: 'Die Online-Zahlung konnte nicht gestartet werden. Bitte erneut versuchen oder „Bezahlung bei Abholung“ wählen.' };
        }

        if (sessionUrl) {
            await grantBookingView(rental.id);
            redirect(sessionUrl);
        }
    } else {
        // Send booking confirmation email for Pay-on-Arrival
        try {
            const outsideHours = isOutsideOpeningHours(startDateStr, pickupTimeStr) || isOutsideOpeningHours(endDateStr, returnTimeStr);
            const place = car.currentLocation?.name;
            const templateData = {
                contractNumber,
                customer: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                },
                car: {
                    brand: car.brand,
                    model: car.model,
                    plate: car.plate,
                },
                rental: {
                    startDate,
                    endDate,
                    totalAmount: quote.total,
                    pickupLocation: place,
                    returnLocation: place,
                    handoverNote: outsideHours
                        ? `Abholung oder Rückgabe liegt außerhalb der Öffnungszeiten. Bitte rufen Sie uns unter ${BUSINESS.PHONE} an, damit wir die Übergabe abstimmen.`
                        : undefined,
                    depositNote: car.depositAmount != null
                        ? `Kaution €${Number(car.depositAmount).toFixed(2)} wird bei Abholung hinterlegt und ist nicht im Gesamtbetrag enthalten.`
                        : undefined,
                },
            };
            await sendEmail(customer.email, emailTemplates.bookingConfirmation(templateData));
            await sendEmail(COMPANY_EMAIL, {
                ...emailTemplates.bookingConfirmation(templateData),
                subject: `[NEUE RESERVIERUNG] ${templateData.contractNumber} - ${templateData.customer.firstName} ${templateData.customer.lastName}`
            });
        } catch (emailError) {
            console.error("Failed to send pay-on-arrival booking confirmation email:", emailError);
        }
    }

    await grantBookingView(rental.id);
    if (isMobile) {
        redirect(`/mobile/payment/success?rentalId=${rental.id}`);
    } else {
        redirect(`/checkout/success/${rental.id}`);
    }
    return null;
}

/** Live coupon check for the checkout summary. Rate-limited against code guessing. */
export async function previewCoupon(code: string) {
    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`coupon-preview:${ip}`, { limit: 10, windowSeconds: 60 * 10 });
    if (!rl.allowed) return { ok: false as const, error: rateLimitErrorMessage(rl) };

    const result = await findUsableCoupon(code, { customerId: await getSession() });
    if (!result.ok) return result;
    return { ok: true as const, code: result.code, discountType: result.discountType, discountValue: result.discountValue };
}

/** Live availability check when the customer changes dates in the checkout. */
export async function checkBookingAvailability(carId: number, startDate: string, pickupTime: string, endDate: string, returnTime: string) {
    const start = parseBookingDateTime(startDate, pickupTime);
    const end = parseBookingDateTime(endDate, returnTime);
    if (!Number.isInteger(carId) || isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return { available: false, reason: 'Ungültiger Zeitraum.' };
    }
    if (start.getTime() < Date.now() - 15 * 60_000) {
        return { available: false, reason: 'Der Abholzeitpunkt liegt in der Vergangenheit.' };
    }

    // A signed-in customer's own abandoned checkout is released on submit, so don't report it here.
    const customerId = await getSession();
    const conflicts = await prisma.rental.count({
        where: {
            carId,
            AND: [
                overlapWhere(start, end),
                ...(customerId ? [{ NOT: { ...UNPAID_ONLINE, customerId } }] : []),
            ],
        },
    });
    return conflicts === 0
        ? { available: true as const }
        : { available: false as const, reason: CAR_BUSY_MESSAGE };
}
