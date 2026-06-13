'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { hashPassword, setSession, getSession } from "@/lib/auth";
import { getAdminSession } from "@/lib/adminAuth";
import { auditLog } from "@/lib/audit";


export async function createBooking(prevState: any, formData: FormData) {
    const adminSession = await getAdminSession();
    const customerSession = await getSession();


    // 1. Extract Data
    const carId = parseInt(formData.get('carId') as string);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const optionIds = (formData.get('options') as string)?.split(',').filter(Boolean).map(Number) || [];
    const couponCode = (formData.get('couponCode') as string)?.trim().toUpperCase() || null;

    // Customer Data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;
    const country = formData.get('country') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const licenseNumber = formData.get('licenseNumber') as string;

    // Business Data
    const customerType = formData.get('customerType') as string;
    const company = formData.get('company') as string;
    const taxId = formData.get('taxId') as string;
    const password = formData.get('password') as string;

    // 2. Find or Create Customer
    // Simple check by email for now
    let customer = await prisma.customer.findUnique({
        where: { email }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                postalCode,
                country,
                customerType,
                company,
                taxId,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                licenseNumber,
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
    } else {
        // If customer exists, check if requester has permission to update
        const isSelf = customerSession === customer.id;
        const isAdmin = !!adminSession;

        if (!isSelf && !isAdmin) {
            return { 
                success: false, 
                error: `Ein Konto mit ${email} existiert bereits. Bitte melden Sie sich an.` 
            };
        }

        // Update customer details 
        customer = await prisma.customer.update({
            where: { id: customer.id },
            data: {
                firstName,
                lastName,
                phone,
                address,
                city,
                postalCode,
                country,
                customerType,
                company,
                taxId,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                licenseNumber: licenseNumber || undefined
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
    }

    // 3. Create Rental
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new Error("Car not found");

    // Check for conflicting bookings
    const conflictingRental = await prisma.rental.findFirst({
        where: {
            carId,
            status: { in: ['Pending', 'Confirmed', 'Active'] },
            startDate: { lt: endDate },
            endDate: { gt: startDate }
        }
    });

    if (conflictingRental) {
        return {
            success: false,
            error: "Das Fahrzeug ist im ausgewählten Zeitraum bereits gebucht."
        };
    }

    const year = new Date().getFullYear();
    const count = await prisma.rental.count();
    const contractNumber = `RNT-${year}-${(count + 1).toString().padStart(6, '0')}`;

    const selectedOptions = await prisma.option.findMany({
        where: { id: { in: optionIds } }
    });

    let extrasCost = 0;
    let insuranceCost = 0;
    let selectedInsuranceType = 'Basis';
    let addedKm = 0;

    selectedOptions.forEach(opt => {
        const cost = opt.isPerDay ? (Number(opt.price) * days) : Number(opt.price);
        if (opt.type === 'insurance') {
            insuranceCost += cost;
            selectedInsuranceType = opt.name;
        } else {
            extrasCost += cost;
            // Parse KM from package name if it's a KM package
            if (opt.type === 'package' && opt.name.toLowerCase().includes('km')) {
                const match = opt.name.match(/(\d+)/);
                if (match) {
                    addedKm += parseInt(match[0], 10);
                }
            }
        }
    });

    const includedKm = (Number(car.maxMileagePerDay || 0) * days) + addedKm;

    let baseTotal = Number(car.dailyRate) * days + extrasCost + insuranceCost;
    let discountAmount = 0;
    let discountReason: string | null = null;

    if (couponCode) {
        const coupon = await prisma.discountCoupon.findFirst({
            where: { code: couponCode, isActive: true }
        });
        if (coupon) {
            const now = new Date();
            const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
            const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
            if ((!validFrom || now >= validFrom) && (!validUntil || now <= validUntil)) {
                if (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) {
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = baseTotal * (Number(coupon.discountValue) / 100);
                    } else {
                        discountAmount = Math.min(Number(coupon.discountValue), baseTotal);
                    }
                    discountReason = `Gutschein ${coupon.code}`;
                    await prisma.discountCoupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: coupon.usedCount + 1 }
                    });
                }
            }
        }
    }

    const totalAmount = Math.max(0, baseTotal - discountAmount);

    const rental = await prisma.rental.create({
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
            contractNumber,
            extrasCost: extrasCost,
            insuranceCost: insuranceCost,
            insuranceType: selectedInsuranceType,
            pickupLocationId: car.locationId,
            returnLocationId: car.locationId,
            paymentMethod: paymentMethod === 'online' ? 'Online' : 'arrival',
            includedKm: includedKm
        }
    });

    await auditLog({
        userId: adminSession?.id || customer.id,
        userName: adminSession?.name || `${customer.firstName} ${customer.lastName}`,
        action: 'CREATE',
        entityType: 'Rental',
        entityId: rental.id,
        description: `Booking created for car ${car.brand} ${car.model}. Contract: ${contractNumber}`,
        metadata: { totalAmount, days, carId }
    });

    // 4. Create Notification
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

    // 5. Send booking confirmation email to customer & admin
    try {
        const { emailTemplates, sendEmail } = require('@/lib/notificationTemplates');
        const templateData = {
            contractNumber: rental.contractNumber,
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
                startDate: rental.startDate,
                endDate: rental.endDate,
                totalAmount: Number(rental.totalAmount),
            },
        };
        await sendEmail(customer.email, emailTemplates.bookingConfirmation(templateData));
        console.log(`[createBooking] Confirmation email sent to ${customer.email}`);

        // Send copy / notification to admin
        const adminBody = `Eine neue Buchung wurde empfangen.\n\nVertragsnummer: ${rental.contractNumber}\nKunde: ${customer.firstName} ${customer.lastName} (${customer.email})\nFahrzeug: ${car.brand} ${car.model} (${car.plate})\nMietdauer: ${rental.startDate.toLocaleDateString()} - ${rental.endDate.toLocaleDateString()}\nGesamtbetrag: €${Number(rental.totalAmount).toFixed(2)}\nZahlungsmethode: ${rental.paymentMethod}`;
        const adminHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Reservierung erhalten</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f0f11; padding: 30px 15px;">
        <tr>
            <td>
                <table width="100%" maxWidth="600px" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; border-bottom: 3px solid #dc2626;">
                            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app'}/assets/logo.png" alt="Rent-Ex Logo" style="height: 45px; width: auto; display: block; border: 0;">
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            <!-- Alert Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 15px;">
                                        <span style="color: #ef4444; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px;">NEUE BUCHUNG ERHALTEN</span>
                                        <span style="color: #ffffff; font-size: 16px; font-weight: bold; letter-spacing: 1px;">SPO-VERT-NR: ${rental.contractNumber}</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                Hallo Administrator,<br>
                                soeben ist eine neue Buchung über das Online-Portal eingegangen. Nachfolgend finden Sie die Details der Buchung:
                            </p>

                            <!-- Customer Profile -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Kundenprofil</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #e4e4e7;">
                                            <tr>
                                                <td width="30%" style="color: #a1a1aa; padding-bottom: 6px;">Name:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${customer.firstName} ${customer.lastName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">E-Mail:</td>
                                                <td style="padding-bottom: 6px;"><a href="mailto:${customer.email}" style="color: #dc2626; text-decoration: none;">${customer.email}</a></td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Telefon:</td>
                                                <td style="padding-bottom: 6px;">${customer.phone || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa;">Dokument:</td>
                                                <td>Führerschein-Nr. ${customer.licenseNumber || '-'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeug & Zeit</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #e4e4e7;">
                                            <tr>
                                                <td width="30%" style="color: #a1a1aa; padding-bottom: 6px;">Fahrzeug:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${car.brand} ${car.model}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Kennzeichen:</td>
                                                <td style="padding-bottom: 6px;">${car.plate}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Zeitraum:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${rental.startDate.toLocaleDateString()} - ${rental.endDate.toLocaleDateString()}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa;">Ort:</td>
                                                <td>Rent-Ex Feldkirch</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Cost Breakdown -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Zahlungsmethode</td>
                                                <td align="right" style="color: #ffffff; padding-bottom: 6px; font-weight: bold;">${rental.paymentMethod}</td>
                                            </tr>
                                            <tr style="border-top: 1px solid #27272a;">
                                                <td style="color: #a1a1aa; padding-top: 6px; font-size: 15px;">Umsatzbetrag</td>
                                                <td align="right" style="color: #ffffff; padding-top: 6px; font-size: 18px; font-weight: bold;">€${Number(rental.totalAmount).toFixed(2)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app'}/admin/reservations/${rental.id}" target="_blank" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; letter-spacing: 0.5px;">Im Admin-Dashboard öffnen</a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} RentEx System. Automatische System-Benachrichtigung.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        await sendEmail('rentex@metechnik.at', {
            subject: `Neue Reservierung erhalten - ${rental.contractNumber}`,
            body: adminBody,
            html: adminHtml,
        });
        console.log(`[createBooking] Admin notification email sent to rentex@metechnik.at`);
    } catch (mailError) {
        console.error('[createBooking] Failed to send email:', mailError);
    }

    if (paymentMethod === 'online') {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.at';
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card', 'sepa_debit', 'sofort', 'giropay', 'paypal', 'klarna'] as any,
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `${car.brand} ${car.model} Miete`,
                                description: `${days} Tage Miete (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${baseUrl}/checkout/success/${rental.id}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout?carId=${carId}&startDate=${formData.get('startDate') as string}&endDate=${formData.get('endDate') as string}`,
                customer_email: email,
                metadata: {
                    rentalId: rental.id.toString(),
                },
            });

            await prisma.rental.update({
                where: { id: rental.id },
                data: { stripeSessionId: session.id }
            });

            if (session.url) {
                redirect(session.url);
            }
        } catch (error) {
            console.error("Stripe Session Error:", error);
        }
    }

    redirect(`/checkout/success/${rental.id}`);
}
