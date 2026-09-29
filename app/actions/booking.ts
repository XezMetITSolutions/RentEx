'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { hashPassword, setSession, getSession } from "@/lib/auth";
import { getAdminSession } from "@/lib/adminAuth";
import { auditLog } from "@/lib/audit";
import { BUSINESS_TIME_ZONE, calculateChargeableDays, parseBookingDateTime, todayInBusinessTimeZone } from "@/lib/bookingUtils";
import { SITE_URL } from "@/lib/config";
import { isCarAvailable, lockCarForBooking } from "@/lib/availability";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { sendEmail, emailTemplates, COMPANY_EMAIL } from "@/lib/notificationTemplates";
import { COUPON_REASON_PREFIX, evaluateCoupon } from "@/lib/coupons";
import { cancelUnpaidOnlineBooking, releaseOwnAbandonedAttempts } from "@/lib/bookingLifecycle";
import { createSessionToken } from "@/lib/sessionToken";
import { priceRental } from "@/lib/pricing";
import { BOOKABLE_CAR_STATUSES } from "@/lib/publicCar";
import { UPLOAD_PRESETS, validateUpload } from "@/lib/fileValidation";

/** File extension from the detected content type, never from the user's file name. */
const LICENSE_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    'image/heic': '.heic', 'image/heif': '.heif', 'application/pdf': '.pdf',
};


function parseDateOfBirth(dateStr: string): Date | null {
    if (!dateStr) return null;
    const normalized = dateStr.replace(/[\.\-]/g, '/').trim();
    const parts = normalized.split('/');
    if (parts.length !== 3) return null;

    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);

    if (year < 100) {
        const currentYearShort = new Date().getFullYear() % 100;
        if (year > currentYearShort + 5) {
            year += 1900;
        } else {
            year += 2000;
        }
    }

    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
}

/** Expected booking failures that are reported to the user instead of thrown. */
class BookingConflictError extends Error {}

const BOOKING_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
/** Stripe's minimum is 30 minutes; the extra minute covers clock skew. */
const STRIPE_SESSION_TTL_SECONDS = 31 * 60;

const formatViennaDate = (date: Date) =>
    date.toLocaleDateString('de-AT', { timeZone: BUSINESS_TIME_ZONE });

export async function createBooking(prevState: any, formData: FormData) {
    const adminSession = await getAdminSession();
    const customerSession = await getSession();


    // 1. Extract Data
    const carId = parseInt(formData.get('carId') as string);
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const pickupTimeStr = formData.get('pickupTime') as string || '10:00';
    const returnTimeStr = formData.get('returnTime') as string || '10:00';
    const optionsParam = (formData.get('options') as string) || '';

    const startDate = parseBookingDateTime(startDateStr, pickupTimeStr);
    const endDate = parseBookingDateTime(endDateStr, returnTimeStr);
    const optionIds = optionsParam.split(',').filter(Boolean).map(Number).filter(Number.isInteger);
    const couponCode = (formData.get('couponCode') as string)?.trim().toUpperCase() || null;
    const isMobile = formData.get('isMobile') === 'true';

    if (!Number.isInteger(carId) || !startDate || !endDate || endDate <= startDate) {
        return { success: false, error: 'Ungültiger Buchungszeitraum.' };
    }
    if (startDateStr < todayInBusinessTimeZone()) {
        return { success: false, error: 'Das Abholdatum liegt in der Vergangenheit.' };
    }

    // Customer Data
    const email = ((formData.get('email') as string) || '').trim().toLowerCase();
    const firstName = ((formData.get('firstName') as string) || '').trim();
    const lastName = ((formData.get('lastName') as string) || '').trim();
    const paymentMethod = formData.get('paymentMethod') as string;
    const password = formData.get('password') as string;

    // The AGB/Datenschutz checkbox is required — and recorded below as proof of consent.
    if (!adminSession && formData.get('agbAccepted') !== 'yes') {
        return { success: false, error: 'Bitte akzeptieren Sie die AGB und die Datenschutzerklärung.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !firstName || !lastName) {
        return { success: false, error: 'Bitte geben Sie Vorname, Nachname und eine gültige E-Mail-Adresse an.' };
    }

    // 2. Resolve the customer (read-only) and check who may book for them
    const existingCustomer = await prisma.customer.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
    });
    const isAdmin = !!adminSession;
    const isSelf = !!existingCustomer && customerSession === existingCustomer.id;
    // Guest customers (no password) can book again with the same e-mail; their
    // stored profile is then only completed, never overwritten.
    const isGuestRecord = !!existingCustomer && !existingCustomer.passwordHash;

    if (existingCustomer && !isSelf && !isAdmin && !isGuestRecord) {
        return {
            success: false,
            error: `Ein Konto mit ${email} existiert bereits. Bitte melden Sie sich an.`
        };
    }
    if (existingCustomer?.isBlacklisted && !isAdmin) {
        return { success: false, error: 'Eine Online-Buchung ist für dieses Konto nicht möglich. Bitte kontaktieren Sie uns.' };
    }

    // A retry after an abandoned or failed online payment must not be blocked
    // by the customer's own earlier attempt.
    if (existingCustomer) {
        await releaseOwnAbandonedAttempts(existingCustomer.id, carId, startDate, endDate);
    }

    // Early, unlocked check so we fail before uploading files or writing the customer.
    // The authoritative check runs again under a row lock when the rental is created.
    if (!(await isCarAvailable(carId, startDate, endDate))) {
        return { success: false, error: 'Fahrzeug ist in diesem Zeitraum bereits gebucht.' };
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
        return { success: false, error: 'Fahrzeug nicht gefunden.' };
    }
    // Deactivated cars or cars in the workshop are not offered, even via a direct link.
    if (!isAdmin && (!car.isActive || !BOOKABLE_CAR_STATUSES.includes(car.status))) {
        return { success: false, error: 'Dieses Fahrzeug ist derzeit nicht buchbar.' };
    }

    // License photo: this form is public, so the upload is checked by content
    // (magic bytes) — otherwise anyone could host e.g. HTML on our R2 domain.
    const licenseFile = formData.get('licensePhoto');
    let validatedLicense: { buffer: Buffer; mime: string } | null = null;
    if (licenseFile instanceof File && licenseFile.size > 0) {
        const v = await validateUpload({ file: licenseFile, allowed: UPLOAD_PRESETS.IMAGES_AND_PDF, maxBytes: 10 * 1024 * 1024 });
        if (!v.ok) {
            return { success: false, error: `Führerschein-Foto: ${v.error}` };
        }
        validatedLicense = { buffer: v.buffer!, mime: v.mime };
    }

    // Handle License Photo File Upload to Cloudflare R2
    async function saveLicenseFile() {
        if (!validatedLicense) return null;
        try {
            const fileExtension = LICENSE_EXTENSIONS[validatedLicense.mime] ?? '.jpg';
            const fileName = `${Date.now()}-${crypto.randomUUID()}${fileExtension}`;
            const key = `customer-docs/licenses/${fileName}`;

            await r2.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: validatedLicense.buffer,
                ContentType: validatedLicense.mime,
            }));

            const publicUrl = R2_PUBLIC_URL
                ? `${R2_PUBLIC_URL}/${key}`
                : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

            return publicUrl;
        } catch (error) {
            console.error('License upload to R2 error:', error);
            return null;
        }
    }

    const fields = {
        firstName,
        lastName,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        postalCode: formData.get('postalCode') as string,
        country: formData.get('country') as string,
        customerType: formData.get('customerType') as string,
        company: formData.get('company') as string,
        taxId: formData.get('taxId') as string,
        dateOfBirth: parseDateOfBirth(formData.get('dateOfBirth') as string),
        licenseNumber: formData.get('licenseNumber') as string,
        licenseCountry: formData.get('licenseCountry') as string || null,
        licenseExpiryDate: parseDateOfBirth(formData.get('licenseExpiryDate') as string),
        licensePhotoUrl: await saveLicenseFile(),
    };
    // Proof of consent (AGB + privacy policy) at the time of this booking.
    const consentVersion = (await prisma.agbVersion.findFirst({ where: { isActive: true }, select: { version: true } }))?.version ?? null;
    const consent = adminSession ? {} : {
        agbAcceptedAt: new Date(),
        agbAcceptedVersion: consentVersion,
        gdprConsentDate: new Date(),
        gdprConsentVersion: consentVersion,
    };

    // 3. Create or update the customer
    let customer;
    if (!existingCustomer) {
        customer = await prisma.customer.create({
            data: {
                ...fields,
                ...consent,
                email,
                passwordHash: password && password.length >= 6 ? hashPassword(password) : undefined
            }
        });
        // Auto-login if account was created with a password
        if (password && password.length >= 6) {
            await setSession(customer.id);
        }

        await auditLog({
            userId: adminSession?.id || customer.id,
            userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
            action: 'CREATE',
            entityType: 'Customer',
            entityId: customer.id,
            description: `Customer account created during booking: ${customer.email}`
        });
    } else if (isSelf || isAdmin) {
        customer = await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
                firstName: fields.firstName,
                lastName: fields.lastName,
                phone: fields.phone,
                address: fields.address,
                city: fields.city,
                postalCode: fields.postalCode,
                country: fields.country,
                customerType: fields.customerType,
                company: fields.company,
                taxId: fields.taxId,
                dateOfBirth: fields.dateOfBirth || undefined,
                licenseNumber: fields.licenseNumber || undefined,
                licenseCountry: fields.licenseCountry || undefined,
                licensePhotoUrl: fields.licensePhotoUrl || undefined,
                licenseExpiryDate: fields.licenseExpiryDate || undefined,
                ...consent,
            }
        });

        await auditLog({
            userId: adminSession?.id || customer.id,
            userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: customer.id,
            description: `Customer details updated during booking: ${customer.email}`
        });
    } else {
        // Unauthenticated guest re-booking: only fill in what is still missing.
        const missing = Object.fromEntries(
            Object.entries(fields).filter(([key, value]) =>
                value != null && value !== '' && (existingCustomer as Record<string, unknown>)[key] == null
            )
        );
        customer = await prisma.customer.update({ where: { id: existingCustomer.id }, data: { ...missing, ...consent } });
    }

    // 4. Price the rental
    const days = calculateChargeableDays(startDateStr, pickupTimeStr, endDateStr, returnTimeStr);

    // Only active options that are generic templates or belong to this car.
    const selectedOptions = await prisma.option.findMany({
        where: {
            id: { in: optionIds },
            status: 'active',
            OR: [{ carId: null }, { carId }],
        }
    });

    const {
        baseTotal,
        extrasCost,
        insuranceCost,
        insuranceType: selectedInsuranceType,
        includedKm,
    } = priceRental(car, selectedOptions, days);
    const coupon = await evaluateCoupon(couponCode, baseTotal);
    const discountAmount = coupon?.discountAmount ?? 0;
    const discountReason = coupon ? `${COUPON_REASON_PREFIX}${coupon.code}` : null;
    const couponId = coupon?.couponId ?? null;

    const totalAmount = Math.max(0, baseTotal - discountAmount);
    // Nothing to charge (e.g. a 100 % coupon): skip Stripe, which rejects 0 € sessions.
    const payOnline = paymentMethod === 'online' && totalAmount > 0;

    let rental;
    try {
        rental = await prisma.$transaction(async (tx) => {
            await lockCarForBooking(tx, carId);
            if (!(await isCarAvailable(carId, startDate, endDate, tx))) {
                throw new BookingConflictError('Fahrzeug ist in diesem Zeitraum bereits gebucht.');
            }

            if (couponId != null) {
                // Atomic claim: only succeeds while the coupon is still under its usage limit.
                const claimed = await tx.discountCoupon.updateMany({
                    where: {
                        id: couponId,
                        isActive: true,
                        OR: [
                            { usageLimit: null },
                            { usedCount: { lt: prisma.discountCoupon.fields.usageLimit } },
                        ],
                    },
                    data: { usedCount: { increment: 1 } },
                });
                if (claimed.count === 0) {
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
                    totalAmount,
                    discountAmount: discountAmount || undefined,
                    discountReason: discountReason || undefined,
                    status: 'Pending',
                    paymentStatus: 'Pending',
                    extrasCost: extrasCost,
                    insuranceCost: insuranceCost,
                    insuranceType: selectedInsuranceType,
                    pickupLocationId: car.locationId,
                    returnLocationId: car.locationId,
                    paymentMethod: payOnline ? 'Online' : 'arrival',
                    includedKm: includedKm
                }
            });

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
    // Grants the (possibly not logged-in) customer access to their confirmation page.
    const bookingToken = await createSessionToken('booking', rental.id, BOOKING_TOKEN_TTL_SECONDS);

    await auditLog({
        userId: adminSession?.id || customer.id,
        userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
        action: 'CREATE',
        entityType: 'Rental',
        entityId: rental.id,
        description: `Booking created for car ${car.brand} ${car.model}. Contract: ${contractNumber}`,
        metadata: { totalAmount, days, carId }
    });

    // 5. Create Notification
    await prisma.notification.create({
        data: {
            type: 'System',
            subject: 'Neue Reservierung erhalten',
            message: `Neue Buchung für ${car.brand} ${car.model} von ${firstName} ${lastName} erhalten. Vertragsnummer: ${contractNumber}`,
            status: 'Pending',
            relatedType: 'Rental',
            relatedId: rental.id,
            recipient: 'Admin'
        }
    });

    if (payOnline) {
        const baseUrl = SITE_URL;
        let sessionUrl = null;
        try {
            // Cancelling payment returns the customer to the form with their selection intact.
            const retryParams = new URLSearchParams({
                startDate: startDateStr,
                endDate: endDateStr,
                pickupTime: pickupTimeStr,
                returnTime: returnTimeStr,
                options: optionsParam,
            });
            if (couponCode) retryParams.set('couponCode', couponCode);

            let successUrl = `${baseUrl}/checkout/success/${rental.id}?t=${bookingToken}&session_id={CHECKOUT_SESSION_ID}`;
            let cancelUrl = `${baseUrl}/checkout?carId=${carId}&${retryParams}`;
            if (isMobile) {
                successUrl = `${baseUrl}/mobile/payment/success?rentalId=${rental.id}&t=${bookingToken}&session_id={CHECKOUT_SESSION_ID}`;
                cancelUrl = `${baseUrl}/mobile/payment/${carId}?${retryParams}`;
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'] as any,
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `${car.brand} ${car.model} Miete`,
                                description: `${days} Tage Miete (${formatViennaDate(startDate)} - ${formatViennaDate(endDate)})`,
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: customer.email,
                expires_at: Math.floor(Date.now() / 1000) + STRIPE_SESSION_TTL_SECONDS,
                metadata: {
                    rentalId: rental.id.toString(),
                },
            });

            await prisma.rental.update({
                where: { id: rental.id },
                data: { stripeSessionId: session.id }
            });

            sessionUrl = session.url;
        } catch (error: any) {
            console.error("Stripe Session Error:", error);
            // Don't leave a booking behind that blocks the car and uses up the coupon.
            await cancelUnpaidOnlineBooking(rental.id).catch((cleanupError) =>
                console.error(`[booking] Failed to cancel rental ${rental.id} after Stripe error:`, cleanupError)
            );
            return { success: false, error: 'Die Online-Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut oder wählen Sie „Bezahlung vor Ort“.' };
        }

        if (sessionUrl) {
            redirect(sessionUrl);
        }
    } else {
        // Send booking confirmation email for Pay-on-Arrival
        try {
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
                    totalAmount,
                },
            };
            await sendEmail(customer.email, emailTemplates.bookingConfirmation(templateData));
            // Send a copy to the company email address
            await sendEmail(COMPANY_EMAIL, {
                ...emailTemplates.bookingConfirmation(templateData),
                subject: `[NEUE RESERVIERUNG] ${templateData.contractNumber} - ${templateData.customer.firstName} ${templateData.customer.lastName}`
            });
        } catch (emailError) {
            console.error("Failed to send pay-on-arrival booking confirmation email:", emailError);
        }
    }

    if (isMobile) {
        redirect(`/mobile/payment/success?rentalId=${rental.id}&t=${bookingToken}`);
    } else {
        redirect(`/checkout/success/${rental.id}?t=${bookingToken}`);
    }
}
