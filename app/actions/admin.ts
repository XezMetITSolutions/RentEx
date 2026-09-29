'use server';

import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { registerCashRegister } from '@/lib/bmf';
import crypto from 'crypto';

import { differenceInDays, addDays } from 'date-fns';
import { BUSINESS_TIME_ZONE, businessTodayBounds, parseBookingDateTime } from '@/lib/bookingUtils';
import { requireAdminArea } from '@/lib/adminAccess';

export async function getActivityLogs() {
    await requireAdminArea('activity');
    const logs = await prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    });

    return logs.map(log => ({
        id: String(log.id),
        userName: log.userName ?? undefined,
        action: log.action,
        entityType: log.entityType,
        description: log.description,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress ?? undefined
    }));
}

export async function getTodayEvents() {
    await requireAdmin();
    // "Today" is the Vienna business day; the server itself runs in UTC.
    const { start: startDay, end: dayEnd } = businessTodayBounds();
    const endDay = new Date(dayEnd.getTime() - 1);

    const rentals = await prisma.rental.findMany({
        where: {
            OR: [
                {
                    startDate: {
                        gte: startDay,
                        lte: endDay
                    },
                    status: { in: ['Pending', 'Confirmed'] }
                },
                {
                    endDate: {
                        gte: startDay,
                        lte: endDay
                    },
                    status: 'Active'
                }
            ]
        },
        include: {
            car: true,
            customer: true,
            pickupLocation: true,
            returnLocation: true
        },
        orderBy: {
            startDate: 'asc'
        }
    });

    return rentals.map(rental => {
        const isPickup = rental.startDate >= startDay && rental.startDate <= endDay;
        const locName = isPickup
            ? rental.pickupLocation?.name
            : rental.returnLocation?.name;

        return {
            id: rental.id,
            type: isPickup ? 'pickup' as const : 'return' as const,
            time: new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: BUSINESS_TIME_ZONE }).format(
                isPickup ? rental.startDate : rental.endDate
            ),
            car: `${rental.car.brand} ${rental.car.model}`,
            customer: `${rental.customer.firstName} ${rental.customer.lastName}`,
            location: locName,
            status: 'upcoming' as const
        };
    });
}

export async function getMaintenanceAlerts() {
    await requireAdmin();
    interface MaintenanceAlert {
        id: number;
        car: string;
        plate: string;
        type: 'oil' | 'tire' | 'inspection' | 'vignette';
        dueDate: Date;
        urgency: 'critical' | 'warning' | 'info';
        lastService?: Date;
        currentMileage?: number;
    }

    const cars = await prisma.car.findMany({
        where: {
            isActive: true
        }
    });

    const alerts: MaintenanceAlert[] = [];
    const today = new Date();

    for (const car of cars) {
        if (car.nextOilChange) {
            const daysUntil = differenceInDays(car.nextOilChange, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 1,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'oil',
                    dueDate: car.nextOilChange,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    lastService: car.lastOilChange || undefined,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        if (car.nextInspection) {
            const daysUntil = differenceInDays(car.nextInspection, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 2,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'inspection',
                    dueDate: car.nextInspection,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    lastService: car.lastServiceDate || undefined,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        if (car.vignetteValidUntil) {
            const daysUntil = differenceInDays(car.vignetteValidUntil, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 3,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'vignette',
                    dueDate: car.vignetteValidUntil,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        if (car.lastTireChange) {
            const daysSinceChange = differenceInDays(today, car.lastTireChange);
            if (daysSinceChange >= 150) {
                alerts.push({
                    id: car.id * 10 + 4,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'tire',
                    dueDate: addDays(car.lastTireChange, 180),
                    urgency: daysSinceChange >= 180 ? 'warning' : 'info',
                    lastService: car.lastTireChange,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }
    }

    return alerts.sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, info: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
    });
}

/** Tüm araçları "Rent-Ex Feldkirch" standortuna atar (locationId + homeLocationId). Plakalar değiştirilmez. */
export async function assignAllCarsToFeldkirch(): Promise<{ ok: boolean; message: string; count?: number }> {
    await requireAdminArea('fleet-management');
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
    await requireAdmin();
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
    await requireAdminArea('marketing');
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
    // Dates from the form are Vienna calendar days; "valid until" includes the whole last day.
    const validFrom = validFromStr ? parseBookingDateTime(validFromStr, '00:00') : null;
    const validUntilStart = validUntilStr ? parseBookingDateTime(validUntilStr, '23:59') : null;
    const validUntil = validUntilStart ? new Date(validUntilStart.getTime() + 59_999) : null;
    if ((validFromStr && !validFrom) || (validUntilStr && !validUntil)) {
        return { error: 'Ungültiges Datum.' };
    }
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
    await requireAdmin();
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
async function getNextInvoiceNumber(db: Prisma.TransactionClient | typeof prisma = prisma): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RE-${year}-`;
    const last = await db.invoice.findFirst({
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
    await requireAdminArea('rechnungen');
    const rentalId = parseInt(formData.get('rentalId') as string);
    if (Number.isNaN(rentalId)) {
        redirect('/admin/rechnungen?error=invalid');
        return;
    }
    await createInvoiceForRental(rentalId);
}

/** Rechnung für eine Miete erstellen (Registrierkassa-ready) */
export async function createInvoiceForRental(rentalId: number) {
    await requireAdminArea('rechnungen');
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

    // Rent (after discount) plus charges added at return (km, fuel, cleaning …).
    const total = Math.round((Number(rental.totalAmount) + Number(rental.extraCharges ?? 0)) * 100) / 100;
    const taxRate = 20; // Österreich USt 20 %
    const subtotal = Math.round((total / (1 + taxRate / 100)) * 100) / 100;
    const taxAmount = Math.round((total - subtotal) * 100) / 100;

    try {
        await prisma.$transaction(async (tx) => {
            // Serialize numbering: invoice numbers must be sequential without
            // gaps or duplicates, even when two invoices are created at once.
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(72110001)`;
            const invoiceNumber = await getNextInvoiceNumber(tx);
            await tx.invoice.create({
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
        });
    } catch (error) {
        // Unique rentalId: someone created the invoice in the meantime.
        if ((error as { code?: string })?.code === 'P2002') {
            redirect('/admin/rechnungen?error=duplicate');
        }
        throw error;
    }
    revalidatePath('/admin/rechnungen');
    revalidatePath(`/admin/reservations`);
    redirect('/admin/rechnungen');
}

/** Registrierkasse bei FinanzOnline (BMF) anmelden */
export async function registerKasseWithBMF() {
    await requireAdminArea('settings');
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
    await requireAdmin();
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

export async function updateTask(taskId: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string | null;
    assignedTo?: string | null;
}) {
    await requireAdmin();
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                assignedTo: data.assignedTo,
            }
        });
        revalidatePath('/admin/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to update task:', error);
        return { error: 'Fehler beim Aktualisieren der Aufgabe' };
    }
}



export async function markNotificationAsRead(id: number) {
    await requireAdmin();
    try {
        await prisma.notification.update({
            where: { id },
            data: { status: 'Sent' } // In our schema, 'Sent' is considered 'read' for system notifications, or we could add a 'Read' status
        });
        revalidatePath('/admin/notifications');
        return { success: true };
    } catch (error) {
        return { error: 'Fehler beim Aktualisieren' };
    }
}

export async function markAllNotificationsAsRead() {
    await requireAdmin();
    try {
        await prisma.notification.updateMany({
            where: { status: 'Pending' },
            data: { status: 'Sent' }
        });
        revalidatePath('/admin/notifications');
        return { success: true };
    } catch (error) {
        return { error: 'Fehler beim Aktualisieren' };
    }
}

export async function deleteNotification(id: number) {
    await requireAdmin();
    try {
        await prisma.notification.delete({
            where: { id }
        });
        revalidatePath('/admin/notifications');
        return { success: true };
    } catch (error) {
        return { error: 'Fehler beim Löschen' };
    }
}
