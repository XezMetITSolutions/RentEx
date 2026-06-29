'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { hashPassword, setSession, getSession } from "@/lib/auth";
import { getAdminSession } from "@/lib/adminAuth";
import { auditLog } from "@/lib/audit";
import fs from 'fs';
import path from 'path';
import { calculateChargeableDays } from "@/lib/bookingUtils";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { sendEmail, emailTemplates, COMPANY_EMAIL } from "@/lib/notificationTemplates";


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

export async function createBooking(prevState: any, formData: FormData) {
    const adminSession = await getAdminSession();
    const customerSession = await getSession();


    // 1. Extract Data
    const carId = parseInt(formData.get('carId') as string);
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const pickupTimeStr = formData.get('pickupTime') as string || '10:00';
    const returnTimeStr = formData.get('returnTime') as string || '10:00';

    const startDate = new Date(`${startDateStr}T${pickupTimeStr}:00`);
    const endDate = new Date(`${endDateStr}T${returnTimeStr}:00`);
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
    const parsedDob = parseDateOfBirth(dateOfBirth);
    const licenseNumber = formData.get('licenseNumber') as string;
    const licenseCountry = formData.get('licenseCountry') as string || null;
    const licenseExpiryDateStr = formData.get('licenseExpiryDate') as string;
    const parsedLicenseExpiry = parseDateOfBirth(licenseExpiryDateStr);

    // Handle License Photo File Upload to Cloudflare R2
    async function saveLicenseFile(file: any) {
        if (!file || !(file instanceof File) || file.size === 0) return null;
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExtension = path.extname(file.name) || '.jpg';
            const fileName = `${Date.now()}-${crypto.randomUUID()}${fileExtension}`;
            const key = `customer-docs/licenses/${fileName}`;

            await r2.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type || 'image/jpeg',
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

    const licensePhotoFile = formData.get('licensePhoto');
    const licensePhotoUrl = await saveLicenseFile(licensePhotoFile);

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
                dateOfBirth: parsedDob,
                licenseNumber,
                licenseCountry,
                licenseExpiryDate: parsedLicenseExpiry,
                licensePhotoUrl,
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
                dateOfBirth: parsedDob || undefined,
                licenseNumber: licenseNumber || undefined,
                licenseCountry: licenseCountry || undefined,
                licensePhotoUrl: licensePhotoUrl || undefined,
                licenseExpiryDate: parsedLicenseExpiry || undefined
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
    const days = calculateChargeableDays(startDateStr, pickupTimeStr, endDateStr, returnTimeStr);

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new Error("Car not found");

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

    if (paymentMethod === 'online') {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rent-ex.at');
        let sessionUrl = null;
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'] as any,
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

            sessionUrl = session.url;
        } catch (error: any) {
            console.error("Stripe Session Error:", error);
            return { success: false, error: `Stripe Fehler: ${error.message || 'Unbekannter Fehler'}` };
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

    redirect(`/checkout/success/${rental.id}`);
}
