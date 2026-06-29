import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json({ error: "E-Mail und Passwort eingeben." }, { status: 400 });
        }

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer || !customer.passwordHash) {
            return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 400 });
        }

        if (!verifyPassword(password, customer.passwordHash)) {
            return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 400 });
        }

        if (customer.isBlacklisted) {
            return NextResponse.json({ error: "Konto gesperrt." }, { status: 400 });
        }

        await setSession(customer.id);

        return NextResponse.json({
            success: true,
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                postalCode: customer.postalCode,
                country: customer.country,
                customerType: customer.customerType,
                company: customer.company,
                taxId: customer.taxId,
                dateOfBirth: customer.dateOfBirth,
                licenseNumber: customer.licenseNumber,
                licenseCountry: customer.licenseCountry,
                licensePhotoUrl: customer.licensePhotoUrl,
                licenseExpiryDate: customer.licenseExpiryDate
            }
        });
    } catch (e) {
        console.error("Checkout login error:", e);
        return NextResponse.json({ error: "Serverfehler beim Login." }, { status: 500 });
    }
}
