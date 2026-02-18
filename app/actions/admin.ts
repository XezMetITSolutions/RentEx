cör'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { registerCashRegister } from '@/lib/bmf';
import crypto from 'crypto';

/** Tüm araçları "Rent-Ex Feldkirch" standortuna atar (locationId + homeLocationId). Plakalar değiştirilmez. */
export async function assignAllCarsToFeldkirch(): Promise<{ ok: boolean; message: string; count?: number }> {
    const feldkirch = await prisma.location.findFirst({
        where: {
            OR: [
                { name: 'Rent-Ex Feldkirch' },
                { code: 'FK-01' }
            ]
        }
    });

    if (!feldkirch) {
        return { ok: false, message: 'Standort "Rent-Ex Feldkirch" nicht gefunden.' };
    }

    const result = await prisma.car.updateMany({
        data: {
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    });

    revalidatePath('/admin/fleet');
    revalidatePath('/admin/locations');
    return { ok: true, message: `${result.count} Fahrzeuge dem Standort Rent-Ex Feldkirch zugewiesen.`, count: result.count };
}

export async function createTask(formData: FormData) {
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
        return { error: 'Titel ist erforderlich.' };
    }
    const description = (formData.get('description') as string)?.trim() || null;
    const priority = (formData.get('priority') as string) || 'medium';
    const status = (formData.get('status') as string) || 'todo';
    const dueDateStr = formData.get('dueDate') as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const assignedTo = (formData.get('assignedTo') as string)?.trim() || null;
    const relatedCarIdStr = formData.get('relatedCarId') as string;
    const relatedCarId = relatedCarIdStr ? parseInt(relatedCarIdStr, 10) : null;

    await prisma.task.create({
        data: {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            relatedCarId: relatedCarId != null && !Number.isNaN(relatedCarId) ? relatedCarId : undefined,
        },
    });
    revalidatePath('/admin/tasks');
    redirect('/admin/tasks');
}

export async function createCoupon(formData: FormData) {
    const code = (formData.get('code') as string)?.trim().toUpperCase();
    if (!code) {
        return { error: 'Gutscheincode ist erforderlich.' };
    }
    const existing = await prisma.discountCoupon.findUnique({ where: { code } });
    if (existing) {
        return { error: 'Dieser Code existiert bereits.' };
    }
    const discountType = (formData.get('discountType') as string) || 'PERCENTAGE';
    const discountValue = parseFloat((formData.get('discountValue') as string) || '0');
    if (discountValue <= 0 || (discountType === 'PERCENTAGE' && discountValue > 100)) {
        return { error: 'Ungültiger Rabattwert.' };
    }
    const description = (formData.get('description') as string)?.trim() || null;
    const validFromStr = formData.get('validFrom') as string;
    const validUntilStr = formData.get('validUntil') as string;
    const validFrom = validFromStr ? new Date(validFromStr) : null;
    const validUntil = validUntilStr ? new Date(validUntilStr) : null;
    const usageLimitStr = formData.get('usageLimit') as string;
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
    const isActive = formData.get('isActive') === 'on';

    await prisma.discountCoupon.create({
        data: {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            usageLimit: usageLimit ?? undefined,
            isActive,
        },
    });
    revalidatePath('/admin/marketing');
    redirect('/admin/marketing');
}

/** Fahrtenbuch-Eintrag anlegen (Finanzamt) */
export async function createFahrtenbuchEntry(formData: FormData) {
    const carId = parseInt(formData.get('carId') as string);
    const datum = new Date(formData.get('datum') as string);
    const startKm = parseInt(formData.get('startKm') as string);
    const endKm = parseInt(formData.get('endKm') as string);
    const zweck = (formData.get('zweck') as string) || 'DIENSTFAHRT';
    const fahrtzweck = (formData.get('fahrtzweck') as string)?.trim() || null;
    const rentalIdStr = formData.get('rentalId') as string;
    const rentalId = rentalIdStr ? parseInt(rentalIdStr, 10) : null;

    if (!carId || isNaN(startKm) || isNaN(endKm) || endKm < startKm) {
        return { error: 'Ungültige Daten (Fahrzeug, Start-/End-Kilometer).' };
    }

    await prisma.fahrtenbuchEntry.create({
        data: {
            carId,
            rentalId: rentalId && !Number.isNaN(rentalId) ? rentalId : undefined,
            datum,
            startKm,
            endKm,
            zweck: zweck === 'PRIVATFAHRT' ? 'PRIVATFAHRT' : 'DIENSTFAHRT',
            fahrtzweck,
        },
    });
    revalidatePath('/admin/fahrtenbuch');
    redirect('/admin/fahrtenbuch');
}

/** Nächste Rechnungsnummer (RE-JJJJ-NNNNN) */
async function getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RE-${year}-`;
    const last = await prisma.invoice.findFirst({
        where: { invoiceNumber: { startsWith: prefix } },
        orderBy: { id: 'desc' },
        select: { invoiceNumber: true },
    });
    const nextNum = last
        ? parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1
        : 1;
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

/** Rechnung erstellen (aus Formular: rentalId im FormData) */
export async function createInvoiceFormAction(formData: FormData) {
    const rentalId = parseInt(formData.get('rentalId') as string);
    if (Number.isNaN(rentalId)) {
        redirect('/admin/rechnungen?error=invalid');
        return;
    }
    await createInvoiceForRental(rentalId);
}

/** Rechnung für eine Miete erstellen (Registrierkassa-ready) */
export async function createInvoiceForRental(rentalId: number) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { car: true, customer: true },
    });
    if (!rental) {
        redirect('/admin/rechnungen?error=notfound');
        return;
    }

    const existing = await prisma.invoice.findUnique({
        where: { rentalId },
    });
    if (existing) {
        redirect('/admin/rechnungen?error=duplicate');
        return;
    }

    const total = Number(rental.totalAmount);
    const taxRate = 20; // Österreich USt 20 %
    const subtotal = Math.round((total / (1 + taxRate / 100)) * 100) / 100;
    const taxAmount = Math.round((total - subtotal) * 100) / 100;

    const invoiceNumber = await getNextInvoiceNumber();

    await prisma.invoice.create({
        data: {
            rentalId,
            invoiceNumber,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status: 'ISSUED',
        },
    });
    revalidatePath('/admin/rechnungen');
    revalidatePath(`/admin/reservations`);
    redirect('/admin/rechnungen');
}

/** Registrierkasse bei FinanzOnline (BMF) anmelden */
export async function registerKasseWithBMF() {
    const tid = await prisma.systemSettings.findUnique({ where: { key: 'bmf_tid' } });
    const benid = await prisma.systemSettings.findUnique({ where: { key: 'bmf_benid' } });
    const pin = await prisma.systemSettings.findUnique({ where: { key: 'bmf_pin' } });
    const kassenId = (await prisma.systemSettings.findUnique({ where: { key: 'bmf_kassen_id' } }))?.value || 'K1';
    let aesKey = (await prisma.systemSettings.findUnique({ where: { key: 'bmf_aes_key' } }))?.value;

    if (!tid?.value || !benid?.value || !pin?.value) {
        return { error: 'FinanzOnline Zugangsdaten unvollständig (TID, BENID, PIN fehlen).' };
    }

    // Falls kein AES Key da ist, generieren wir einen (32 bytes = 256 bit)
    if (!aesKey) {
        const genKey = crypto.randomBytes(32).toString('base64');
        await prisma.systemSettings.upsert({
            where: { key: 'bmf_aes_key' },
            create: { key: 'bmf_aes_key', value: genKey, category: 'Finanzen' },
            update: { value: genKey }
        });
        aesKey = genKey;
    }

    try {
        const result = await registerCashRegister(kassenId, aesKey);

        if (result.success) {
            // Erfolg in den Settings vermerken (optional)
            await prisma.systemSettings.upsert({
                where: { key: 'bmf_registered_at' },
                create: { key: 'bmf_registered_at', value: new Date().toISOString(), category: 'Finanzen' },
                update: { value: new Date().toISOString() }
            });
            revalidatePath('/admin/settings');
            return { success: true, message: 'Registrierkasse erfolgreich beim BMF angemeldet.' };
        } else {
            return { error: result.message };
        }
    } catch (err: any) {
        return { error: err.message || 'Verbindungsfehler zum BMF.' };
    }
}

export async function updateTaskStatus(taskId: number, newStatus: string) {
    if (!['todo', 'in_progress', 'done'].includes(newStatus)) {
        return { error: 'Ungültiger Status' };
    }

    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus }
        });
        revalidatePath('/admin/tasks');
        return { success: true };
    } catch (e) {
        return { error: 'Fehler beim Aktualisieren des Status' };
    }
}

