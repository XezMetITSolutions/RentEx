
import { createWorker } from 'tesseract.js';

export async function detectMileageFromImage(file: File): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
        const worker = await createWorker('eng');
        const imageUrl = await preprocessImage(file);

        // Attempt 1: Strict whitelist (best for clean images)
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789'
        });

        let { data: { text } } = await worker.recognize(imageUrl);
        let mileage = extractBestNumber(text);

        // Attempt 2: Relaxed (if Attempt 1 failed to find a plausible number)
        // If we found nothing, or a very short number (like '0' or '25'), try without whitelist
        if (!mileage || mileage.length < 3) {
            await worker.setParameters({
                tessedit_char_whitelist: '' // Clear whitelist to see context
            });
            const result = await worker.recognize(imageUrl);
            const mileage2 = extractBestNumber(result.data.text);

            // If second attempt found a longer number, prefer it
            if (mileage2 && mileage2.length > (mileage?.length || 0)) {
                mileage = mileage2;
            }
        }

        await worker.terminate();
        return mileage;
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
}

function extractBestNumber(text: string): string | null {
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length === 0) return null;

    // Sort by length desc
    const sorted = numbers.sort((a: string, b: string) => b.length - a.length);

    // Return the longest number found
    return sorted[0];
}

function preprocessImage(file: File): Promise<string> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                // Limit size to speed up OCR and reduce memory (max 2000px width)
                const scale = Math.min(1, 2000 / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(url); return; }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to grayscale
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;     // R
                    data[i + 1] = avg; // G
                    data[i + 2] = avg; // B
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            } catch (e) {
                console.warn('Image preprocessing failed, using original', e);
                resolve(url);
            }
        };
        img.onerror = () => resolve(url);
        img.src = url;
    });
}
