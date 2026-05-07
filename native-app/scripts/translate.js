const fs = require('fs');
const path = require('path');

const API_KEY = '57d297fb-b5e5-492d-bebc-6cca1dfb8fa6:fx';
const TARGET_LANGS = ['EN-GB', 'TR', 'IT', 'FR'];
const SOURCE_FILE = path.join(__dirname, '../translations/de.json');

async function translate(text, targetLang) {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        target_lang: targetLang,
        source_lang: 'DE',
      }),
    });

    const data = await response.json();
    if (data.translations && data.translations[0]) {
      return data.translations[0].text;
    }
    throw new Error(`Translation failed for ${targetLang}: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error(`Error translating "${text}" to ${targetLang}:`, error);
    return text; // Fallback to source text
  }
}

async function translateObject(obj, targetLang) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang);
    } else {
      console.log(`Translating: ${value} -> ${targetLang}`);
      result[key] = await translate(value, targetLang);
    }
  }
  return result;
}

async function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('Source file not found:', SOURCE_FILE);
    return;
  }
  
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

  for (const lang of TARGET_LANGS) {
    console.log(`\nProcessing language: ${lang}...`);
    const translated = await translateObject(sourceData, lang);
    const langCode = lang.split('-')[0].toLowerCase();
    const outFile = path.join(__dirname, `../translations/${langCode}.json`);
    fs.writeFileSync(outFile, JSON.stringify(translated, null, 2));
    console.log(`Successfully saved ${outFile}`);
  }
}

main().catch(console.error);
