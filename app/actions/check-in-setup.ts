'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function getCheckInFolders() {
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

export async function getTemplateMapping(templateName: string) {
    try {
        const folderPath = path.join(process.cwd(), 'Check-in', templateName);
        const files = await fs.readdir(folderPath);

        const mapping: Record<string, string> = {};
        const sides = ['front', 'back', 'left', 'right'];
        const keywords: Record<string, string[]> = {
            front: ['front', 'vorn'],
            back: ['back', 'rear', 'heck'],
            left: ['left', 'links'],
            right: ['right', 'rechts']
        };

        for (const side of sides) {
            const match = files.find(f => {
                const lower = f.toLowerCase();
                return keywords[side].some(kw => lower.includes(kw));
            });
            if (match) {
                mapping[side] = `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match)}`;
            }
        }

        return mapping;
    } catch (error) {
        console.error("Mapping error:", error);
        return {};
    }
}

