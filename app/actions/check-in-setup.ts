'use server';

import { requireAdminModule } from '@/lib/adminAccess';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function getCheckInFolders() {
    await requireAdminModule('Check-In');
    try {
        const checkInDir = path.join(process.cwd(), 'Check-in');
        const items = await fs.readdir(checkInDir, { withFileTypes: true });
        return items
            .filter(item => item.isDirectory())
            .map(item => item.name);
    } catch (error) {
        console.error("Error reading Check-in directory:", error);
        return [];
    }
}

export async function getCarsForMapping() {
    await requireAdminModule('Check-In');
    return await prisma.car.findMany({
        select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            checkInTemplate: true
        },
        orderBy: {
            brand: 'asc'
        }
    });
}

export async function assignTemplateToCars(carIds: number[], templateName: string | null) {
    await requireAdminModule('Check-In');
    await prisma.car.updateMany({
        where: {
            id: { in: carIds }
        },
        data: {
            checkInTemplate: templateName
        }
    });

    // If templateName is provided, ensure public directory exists and we have some mapping
    // In a real production app, we would handle image processing here.
    // For now, we'll assume the files exist in Check-in/[templateName]

    revalidatePath('/admin/check-in-setup');
    revalidatePath('/admin/fleet');
    return { success: true };
}

export async function unassignTemplateFromCar(carId: number) {
    await requireAdminModule('Check-In');
    await prisma.car.update({
        where: { id: carId },
        data: {
            checkInTemplate: null
        }
    });

    revalidatePath('/admin/check-in-setup');
    revalidatePath('/admin/fleet');
    return { success: true };
}

export interface TemplateAnglePreview {
    key: string;
    label: string;
    url: string;
}

export async function getTemplatePreview(templateName: string): Promise<TemplateAnglePreview[]> {
    await requireAdminModule('Check-In');
    try {
        const folderPath = path.join(process.cwd(), 'Check-in', templateName);
        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        const items: TemplateAnglePreview[] = [];
        const sides = [
            { key: 'front', label: 'Frontansicht', keywords: ['front', 'vorn'] },
            { key: 'back', label: 'Heckansicht', keywords: ['back', 'rear', 'heck'] },
            { key: 'left', label: 'Fahrerseite (Links)', keywords: ['left', 'links'] },
            { key: 'right', label: 'Beifahrerseite (Rechts)', keywords: ['right', 'rechts'] },
            { key: 'top', label: 'Dach / Oben', keywords: ['oben', 'top', 'dach'] },
        ];

        for (const side of sides) {
            const match = entries.find(e => {
                const lower = e.name.toLowerCase();
                return side.keywords.some(kw => lower.includes(kw));
            });
            if (match) {
                if (match.isDirectory()) {
                    const subFiles = await fs.readdir(path.join(folderPath, match.name));
                    const img = subFiles.find(f => /\.(jpe?g|png|webp)$/i.test(f));
                    if (img) {
                        items.push({
                            key: side.key,
                            label: side.label,
                            url: `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}/${encodeURIComponent(img)}`
                        });
                    }
                } else if (/\.(jpe?g|png|webp)$/i.test(match.name)) {
                    items.push({
                        key: side.key,
                        label: side.label,
                        url: `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}`
                    });
                }
            }
        }

        if (items.length === 0) {
            for (const entry of entries) {
                if (entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name)) {
                    items.push({
                        key: entry.name,
                        label: entry.name.replace(/\.[^/.]+$/, ''),
                        url: `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(entry.name)}`
                    });
                }
            }
        }

        return items;
    } catch (error) {
        console.error("Template preview error:", error);
        return [];
    }
}

export async function getTemplateMapping(templateName: string) {
    await requireAdminModule('Check-In');
    try {
        const folderPath = path.join(process.cwd(), 'Check-in', templateName);
        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        const mapping: Record<string, string> = {};
        const sides = ['front', 'back', 'left', 'right', 'top'];
        const keywords: Record<string, string[]> = {
            front: ['front', 'vorn'],
            back: ['back', 'rear', 'heck'],
            left: ['left', 'links'],
            right: ['right', 'rechts'],
            top: ['oben', 'top', 'dach']
        };

        for (const side of sides) {
            const match = entries.find(e => {
                const lower = e.name.toLowerCase();
                return keywords[side].some(kw => lower.includes(kw));
            });
            if (match) {
                if (match.isDirectory()) {
                    const subFiles = await fs.readdir(path.join(folderPath, match.name));
                    const img = subFiles.find(f => /\.(jpe?g|png|webp)$/i.test(f));
                    if (img) {
                        mapping[side] = `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}/${encodeURIComponent(img)}`;
                    }
                } else if (/\.(jpe?g|png|webp)$/i.test(match.name)) {
                    mapping[side] = `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}`;
                }
            }
        }

        return mapping;
    } catch (error) {
        console.error("Mapping error:", error);
        return {};
    }
}


