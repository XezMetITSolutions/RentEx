
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../lib/s3';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Simple mime type map
const getMimeType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.webp': return 'image/webp';
        case '.gif': return 'image/gif';
        default: return 'application/octet-stream';
    }
};

async function migrate() {
    console.log('Starting migration to R2...');

    // Check credentials
    if (!process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID === 'MISSING') {
        console.error('ERROR: R2 credentials are missing in .env file.');
        process.exit(1);
    }

    const cars = await prisma.car.findMany();
    console.log(`Found ${cars.length} cars to check.`);

    let updatedCount = 0;

    for (const car of cars) {
        let changed = false;
        let newImageUrl = car.imageUrl;
        let newImages = car.images;

        // 1. Check main imageUrl
        if (car.imageUrl && car.imageUrl.startsWith('/') && !car.imageUrl.startsWith('//')) {
            // It's a local path, likely starting with /assets/...
            // Construct absolute local path
            // public folder is in root
            const localPath = path.join(process.cwd(), 'public', car.imageUrl);

            try {
                // Check if file exists
                await fs.access(localPath);

                console.log(`Uploading ${car.imageUrl} for car ${car.id}...`);
                const buffer = await fs.readFile(localPath);
                const contentType = getMimeType(localPath);
                const filename = path.basename(localPath);
                const key = `car-images/${filename}`;

                await r2.send(new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                }));

                const r2Url = R2_PUBLIC_URL
                    ? `${R2_PUBLIC_URL}/${key}`
                    : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

                newImageUrl = r2Url;
                changed = true;
                console.log(`Values updated: ${car.imageUrl} -> ${newImageUrl}`);

            } catch (err) {
                console.warn(`Could not find or upload local file: ${localPath}. Skipping.`);
            }
        }

        // 2. Check images array (if it's a JSON string of array)
        if (car.images) {
            try {
                let imagesArray = JSON.parse(car.images);
                if (Array.isArray(imagesArray)) {
                    let arrayChanged = false;
                    const newArray = [];

                    for (const imgPath of imagesArray) {
                        if (typeof imgPath === 'string' && imgPath.startsWith('/') && !imgPath.startsWith('//')) {
                            const localPath = path.join(process.cwd(), 'public', imgPath);

                            try {
                                await fs.access(localPath);
                                console.log(`Uploading gallery image ${imgPath}...`);

                                const buffer = await fs.readFile(localPath);
                                const contentType = getMimeType(localPath);
                                const filename = path.basename(localPath);
                                const key = `car-images/${filename}`;

                                await r2.send(new PutObjectCommand({
                                    Bucket: R2_BUCKET_NAME,
                                    Key: key,
                                    Body: buffer,
                                    ContentType: contentType,
                                }));

                                const r2Url = R2_PUBLIC_URL
                                    ? `${R2_PUBLIC_URL}/${key}`
                                    : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

                                newArray.push(r2Url);
                                arrayChanged = true;
                            } catch (err) {
                                console.warn(`Could not find gallery image: ${localPath}. Keeping as is.`);
                                newArray.push(imgPath);
                            }
                        } else {
                            newArray.push(imgPath);
                        }
                    }

                    if (arrayChanged) {
                        newImages = JSON.stringify(newArray);
                        changed = true;
                    }
                }
            } catch (e) {
                // Ignore parse errors, maybe not JSON
            }
        }

        if (changed) {
            await prisma.car.update({
                where: { id: car.id },
                data: {
                    imageUrl: newImageUrl,
                    images: newImages
                }
            });
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} cars.`);
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
