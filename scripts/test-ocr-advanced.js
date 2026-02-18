
const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

async function testOCR() {
    const imagePath = path.resolve('tachomanipulation-tachostand-davor-2008_ooi5lx.webp');
    const logFile = path.resolve('ocr-results.txt');

    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    }

    log(`Testing image: ${imagePath}`);

    const psms = [3, 4, 6, 7, 11, 13];

    for (const psm of psms) {
        log(`\n--- Testing PSM ${psm} (with whitelist) ---`);
        try {
            const worker = await createWorker('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789',
                tessedit_pageseg_mode: String(psm) // Sometimes expects string enum in older versions, but int usually works
            });

            const { data: { text, confidence } } = await worker.recognize(imagePath);
            log(`Text: "${text.replace(/\n/g, '\\n')}"`);
            log(`Confidence: ${confidence}`);
            await worker.terminate();
        } catch (e) {
            log(`Error: ${e.message}`);
        }
    }

    // Test without whitelist
    log(`\n--- Testing PSM 3 WITHOUT whitelist ---`);
    try {
        const worker = await createWorker('eng');
        await worker.setParameters({
            tessedit_pageseg_mode: '3'
        });

        const { data: { text } } = await worker.recognize(imagePath);
        log(`Text: "${text.replace(/\n/g, '\\n')}"`);
        await worker.terminate();
    } catch (e) {
        log(`Error: ${e.message}`);
    }

    fs.writeFileSync(logFile, output);
}

testOCR();
