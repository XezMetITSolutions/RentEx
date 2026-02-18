
import { createWorker } from 'tesseract.js';

export async function detectMileageFromImage(file: File): Promise<string | null> {
    try {
        const worker = await createWorker('eng');
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789'
        });

        const imageUrl = URL.createObjectURL(file);
        const { data: { text } } = await worker.recognize(imageUrl);

        await worker.terminate();
        URL.revokeObjectURL(imageUrl);

        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            // Return the number with the most digits, assuming mileage is the main number
            return numbers.reduce((a: string, b: string) => a.length > b.length ? a : b);
        }
        return null;
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
}
