'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { registerCashRegister } from '@/lib/bmf';
import crypto from 'crypto';

import { startOfDay, endOfDay, differenceInDays, addDays } from 'date-fns';

export async function getActivityLogs() {
    const logs = await prisma.activityLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
    });

    return logs.map(log => ({
        id: String(log.id),
        userName: log.userName ?? undefined,
        action: log.action,
        entityType: log.entityType,
        description: log.description,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress ?? undefined,
        metadata: log.metadata ?? undefined,
        userAgent: log.userAgent ?? undefined
    }));
}

export async function getTodayEvents() {
    const today = new Date();
    const startDay = startOfDay(today);
    const endDay = endOfDay(today);

    const rentals = await prisma.rental.findMany({
        where: {
            OR: [
                {
                    startDate: {
                        gte: startDay,
                        lte: endDay
                    },
                    status: 'Pending'
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
            time: new Intl.DateTimeFormat('de-AT', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Vienna'
            }).format(
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

/** Weist alle Fahrzeuge dem Standort "Rent-Ex Feldkirch" zu (locationId + homeLocationId). Kennzeichen werden nicht geändert. */
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

import { getAdminSession } from '@/lib/adminAuth';

/** Get current mileage of a car */
export async function getCarCurrentMileage(carId: number): Promise<number> {
    const car = await prisma.car.findUnique({
        where: { id: carId },
        select: { currentMileage: true }
    });
    return car?.currentMileage || 0;
}

/** Fahrtenbuch-Eintrag anlegen (Finanzamt) */
export async function createFahrtenbuchEntry(formData: FormData) {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

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

    const entry = await prisma.fahrtenbuchEntry.create({
        data: {
            carId,
            rentalId: rentalId && !Number.isNaN(rentalId) ? rentalId : undefined,
            datum,
            startKm,
            endKm,
            zweck: zweck === 'PRIVATFAHRT' ? 'PRIVATFAHRT' : 'DIENSTFAHRT',
            fahrtzweck,
        },
        include: { car: true }
    });

    // Create Audit Log
    await prisma.activityLog.create({
        data: {
            userId: String(session.id),
            userName: session.name,
            action: 'CREATE',
            entityType: 'FahrtenbuchEntry',
            entityId: entry.id,
            description: `Fahrtenbuch-Eintrag erstellt: ${entry.car.brand} ${entry.car.model} (${entry.car.plate}), ${startKm} - ${endKm} km`,
            metadata: JSON.stringify({ carId, startKm, endKm, zweck, fahrtzweck })
        }
    });

    // Update car's current mileage if this is the highest mileage
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (car && endKm > (car.currentMileage || 0)) {
        await prisma.car.update({
            where: { id: carId },
            data: { currentMileage: endKm }
        });
    }

    revalidatePath('/admin/fahrtenbuch');
    return { success: true };
}

/** Fahrtenbuch-Eintrag aktualisieren */
export async function updateFahrtenbuchEntry(id: number, formData: FormData) {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

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

    const oldEntry = await prisma.fahrtenbuchEntry.findUnique({
        where: { id },
        include: { car: true }
    });
    if (!oldEntry) return { error: 'Eintrag nicht gefunden.' };

    const entry = await prisma.fahrtenbuchEntry.update({
        where: { id },
        data: {
            carId,
            rentalId: rentalId && !Number.isNaN(rentalId) ? rentalId : null,
            datum,
            startKm,
            endKm,
            zweck: zweck === 'PRIVATFAHRT' ? 'PRIVATFAHRT' : 'DIENSTFAHRT',
            fahrtzweck,
        },
        include: { car: true }
    });

    // Create Audit Log
    await prisma.activityLog.create({
        data: {
            userId: String(session.id),
            userName: session.name,
            action: 'UPDATE',
            entityType: 'FahrtenbuchEntry',
            entityId: entry.id,
            description: `Fahrtenbuch-Eintrag aktualisiert #${id}: ${entry.car.brand} ${entry.car.model} (${entry.car.plate}), ${startKm} - ${endKm} km`,
            metadata: JSON.stringify({
                before: { startKm: oldEntry.startKm, endKm: oldEntry.endKm, zweck: oldEntry.zweck, fahrtzweck: oldEntry.fahrtzweck },
                after: { startKm, endKm, zweck, fahrtzweck }
            })
        }
    });

    // Update car's current mileage if necessary
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (car && endKm > (car.currentMileage || 0)) {
        await prisma.car.update({
            where: { id: carId },
            data: { currentMileage: endKm }
        });
    }

    revalidatePath('/admin/fahrtenbuch');
    return { success: true };
}

/** Fahrtenbuch-Eintrag löschen */
export async function deleteFahrtenbuchEntry(id: number) {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

    const entry = await prisma.fahrtenbuchEntry.findUnique({
        where: { id },
        include: { car: true }
    });
    if (!entry) return { error: 'Eintrag nicht gefunden.' };

    await prisma.fahrtenbuchEntry.delete({ where: { id } });

    // Create Audit Log
    await prisma.activityLog.create({
        data: {
            userId: String(session.id),
            userName: session.name,
            action: 'DELETE',
            entityType: 'FahrtenbuchEntry',
            entityId: id,
            description: `Fahrtenbuch-Eintrag gelöscht #${id}: ${entry.car.brand} ${entry.car.model} (${entry.car.plate}), ${entry.startKm} - ${entry.endKm} km`,
            metadata: JSON.stringify(entry)
        }
    });

    revalidatePath('/admin/fahrtenbuch');
    return { success: true };
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

import { createSevDeskInvoice } from '@/lib/sevdesk';

/** Rechnung für eine Miete erstellen (Registrierkassa-ready) */
export async function createInvoiceForRental(rentalId: number) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { 
            car: true, 
            customer: true,
            options: {
                include: {
                    option: true
                }
            }
        },
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

    try {
        const optionsList = rental.options.map(o => o.option).filter(Boolean);
        const sevdeskResult = await createSevDeskInvoice(rental, rental.customer, optionsList);

        const total = Number(rental.totalAmount);
        const taxRate = 20; // Österreich USt 20 %
        const subtotal = Math.round((total / (1 + taxRate / 100)) * 100) / 100;
        const taxAmount = Math.round((total - subtotal) * 100) / 100;

        await prisma.invoice.create({
            data: {
                rentalId,
                invoiceNumber: sevdeskResult.invoiceNumber,
                subtotal,
                taxRate,
                taxAmount,
                total,
                status: 'ISSUED',
                pdfPath: `https://my.sevdesk.de/#/default/invoice/view;id=${sevdeskResult.id}`,
                registrierkassaBelegId: sevdeskResult.id
            },
        });
    } catch (err: any) {
        console.error('Error creating SevDesk invoice:', err);
        redirect(`/admin/rechnungen?error=sevdesk_failed&message=${encodeURIComponent(err.message || '')}`);
        return;
    }

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

export async function updateTask(taskId: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string | null;
    assignedTo?: string | null;
}) {
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
