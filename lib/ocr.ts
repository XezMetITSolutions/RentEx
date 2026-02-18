
import { createWorker } from 'tesseract.js';

export async function detectMileageFromImage(file: File): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
        const worker = await createWorker('eng');
        const imageUrl = await preprocessImage(file);

        // Attempt 1: Whitelist + Sparse Text Mode (PSM 11) to avoid merging numbers
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
            tessedit_pageseg_mode: '11' // PSM 11: Sparse text. Finds as much text as possible in no particular order.
        });

        let { data: { text } } = await worker.recognize(imageUrl);
        let mileage = extractBestNumber(text);

        // Attempt 2: Relaxed (if Attempt 1 failed to find a plausible number)
        if (!mileage) {
            await worker.setParameters({
                tessedit_char_whitelist: '', // Clear whitelist
                tessedit_pageseg_mode: '3'   // Default PSM often better for context in relaxed mode
            });
            const result = await worker.recognize(imageUrl);
            const mileage2 = extractBestNumber(result.data.text);

            if (mileage2) mileage = mileage2;
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

    // Filter for reasonable odometer lengths
    // Typically 3 to 7 digits (e.g. 100 to 1,999,999)
    // Exclude super long numbers (likely concatenated duplicates/noise like 80100450)
    const validCandidates = numbers.filter(n => n.length >= 3 && n.length <= 7);

    if (validCandidates.length === 0) return null;

    // Sort by length desc
    const sorted = validCandidates.sort((a: string, b: string) => b.length - a.length);

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
