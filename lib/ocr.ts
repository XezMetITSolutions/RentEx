import { createWorker, PSM } from 'tesseract.js';

export interface MileageDetectionResult {
    success: boolean;
    detectedMileage: string | null;
    allDetectedNumbers: string[];
    isPlausible: boolean;
    confidenceNote: string;
}

/**
 * Advanced vehicle cluster / odometer detector:
 * Scans image for numbers, odometer patterns, and validates against expected minimum mileage.
 */
export async function detectMileageAdvanced(file: File, expectedMinMileage: number = 0): Promise<MileageDetectionResult> {
    if (typeof window === 'undefined') {
        return {
            success: false,
            detectedMileage: null,
            allDetectedNumbers: [],
            isPlausible: false,
            confidenceNote: 'Server side execution'
        };
    }

    try {
        const worker = await createWorker('eng');
        const imageUrl = await preprocessImage(file);

        // Run recognition
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789kmKM./ ',
            tessedit_pageseg_mode: PSM.SPARSE_TEXT
        });

        const { data: { text } } = await worker.recognize(imageUrl);
        await worker.terminate();

        const rawNumbers = text.match(/\d+/g) || [];
        const cleanNumbers = rawNumbers
            .map(n => n.replace(/^0+/, '')) // remove leading zeros if any
            .filter(n => n.length >= 3 && n.length <= 7);

        // Find candidate closest to or higher than expectedMinMileage
        let bestCandidate: string | null = null;
        let isPlausible = false;

        if (cleanNumbers.length > 0) {
            if (expectedMinMileage > 0) {
                const reasonable = cleanNumbers.filter(n => {
                    const val = Number(n);
                    return val >= expectedMinMileage * 0.8 && val <= (expectedMinMileage + 500000);
                });

                if (reasonable.length > 0) {
                    bestCandidate = reasonable[0];
                    isPlausible = true;
                } else {
                    bestCandidate = cleanNumbers[0];
                }
            } else {
                bestCandidate = cleanNumbers[0];
                isPlausible = true;
            }
        }

        return {
            success: !!bestCandidate,
            detectedMileage: bestCandidate,
            allDetectedNumbers: cleanNumbers,
            isPlausible,
            confidenceNote: bestCandidate
                ? `Tachowert ${bestCandidate} km erkannt`
                : 'Keine Tachometer-Ziffern im Bild gefunden'
        };
    } catch (error) {
        console.error('Advanced Mileage Detection Error:', error);
        return {
            success: false,
            detectedMileage: null,
            allDetectedNumbers: [],
            isPlausible: false,
            confidenceNote: 'Fehler bei der Bildanalyse'
        };
    }
}

export async function detectMileageFromImage(file: File): Promise<string | null> {
    const res = await detectMileageAdvanced(file);
    return res.detectedMileage;
}

export async function detectStrafzettelData(file: File) {
    if (typeof window === 'undefined') return null;

    try {
        const worker = await createWorker(['deu', 'eng']);
        const imageUrl = await preprocessImage(file);
        
        const { data: { text } } = await worker.recognize(imageUrl);
        await worker.terminate();

        const plateRegex = /[A-Z]{1,2}-[0-9]{3,5}\s?[A-Z]{1,2}/g;
        const plateMatch = text.match(plateRegex);

        const dateRegex = /\d{2}\.\d{2}\.\d{4}/g;
        const dateMatch = text.match(dateRegex);
        
        let incidentDate = null;
        if (dateMatch && dateMatch.length > 0) {
            const parsedDates = dateMatch.map(d => {
                const parts = d.split('.');
                return { str: d, val: new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() };
            }).filter(d => !isNaN(d.val));
            
            if (parsedDates.length > 0) {
                incidentDate = parsedDates.reduce((min, curr) => curr.val < min.val ? curr : min).str;
            } else {
                incidentDate = dateMatch[0];
            }
        }

        const timeRegex = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/g;
        const timeMatch = text.match(timeRegex);

        const amountRegex = /(?:€|EUR|Euro)\s?(\d+(?:[.,]\d{2})?)/gi;
        const amountMatch = [...text.matchAll(amountRegex)];

        const refRegex = /(?:Zahl:|Aktenzeichen:)\s?([A-Z0-9\/]{5,30})/i;
        const refMatch = text.match(refRegex);

        const ortRegex = /Ort:\s*([^\n]*(?:\n[^\n]*)?)(?=\nBetroffenes|\nSie haben|\nEs wurde)/i;
        const ortMatch = text.match(ortRegex);
        let incidentLocation = ortMatch ? ortMatch[1].replace(/\n/g, ' ').trim() : null;

        const authorityRegex = /(Bezirkshauptmannschaft\s+[A-Za-zäöüß]+|Magistrat\s+[A-Za-zäöüß]+|Landespolizeidirektion\s+[A-Za-zäöüß]+)/i;
        const authorityMatch = text.match(authorityRegex);
        let authority = authorityMatch ? authorityMatch[1].trim() : null;

        return {
            plate: plateMatch ? plateMatch[0].replace(/\s/g, '') : null,
            date: incidentDate,
            time: timeMatch ? timeMatch[0] : null,
            amount: amountMatch.length > 0 ? amountMatch[0][1].replace(',', '.') : null,
            referenceNumber: refMatch ? refMatch[1] : null,
            incidentLocation,
            authority,
            fullText: text
        };
    } catch (error) {
        console.error('OCR Strafzettel Error:', error);
        return null;
    }
}

function preprocessImage(file: File): Promise<string> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const scale = Math.min(1, 2000 / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(url); return; }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Grayscale + Contrast tuning for odometer/dashboard recognition
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                    const contrastVal = avg > 110 ? Math.min(255, avg * 1.2) : avg * 0.8;
                    data[i] = contrastVal;
                    data[i + 1] = contrastVal;
                    data[i + 2] = contrastVal;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            } catch (e) {
                console.warn('Image preprocessing fallback', e);
                resolve(url);
            }
        };
        img.onerror = () => resolve(url);
        img.src = url;
    });
}
