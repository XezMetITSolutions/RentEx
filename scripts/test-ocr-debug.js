
const { createWorker } = require('tesseract.js');
const path = require('path');

async function testOCR(imagePath) {
    console.log(`Testing OCR on: ${imagePath}`);
    const worker = await createWorker('eng');

    // Test 1: With whitelist
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789'
    });

    let { data: { text } } = await worker.recognize(imagePath);
    console.log('\n--- Result WITH whitelist ---');
    console.log('Raw Text:', text);
    let numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        console.log('Extracted Numbers:', numbers);
        console.log('Best Guess:', numbers.reduce((a, b) => a.length > b.length ? a : b));
    } else {
        console.log('No numbers found.');
    }

    // Test 2: Without whitelist (to see what else it picks up)
    await worker.setParameters({
        tessedit_char_whitelist: '' // Clear whitelist
    });

    ({ data: { text } } = await worker.recognize(imagePath));
    console.log('\n--- Result WITHOUT whitelist ---');
    console.log('Raw Text:', text);
    numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        console.log('Extracted Numbers:', numbers);
        console.log('Best Guess:', numbers.reduce((a, b) => a.length > b.length ? a : b));
    } else {
        console.log('No numbers found.');
    }

    await worker.terminate();
}

const imagePath = path.resolve('tachomanipulation-tachostand-davor-2008_ooi5lx.webp');
testOCR(imagePath).catch(console.error);
