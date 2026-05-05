import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'suv';
  const puDate = searchParams.get('puDate') || '2026-06-01';
  const doDate = searchParams.get('doDate') || '2026-06-05';

  const pickupTime = `${puDate}T12:00`;
  const returnTime = `${doDate}T12:00`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // Bot koruması kalkanı
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const sixtUrl = `https://www.sixt.at/betafunnel/#/offerlist?zen_pu_location=7f54d6df-5496-44ab-9a4c-15b73ef53cda&zen_do_location=7f54d6df-5496-44ab-9a4c-15b73ef53cda&zen_pu_time=${encodeURIComponent(pickupTime)}&zen_do_time=${encodeURIComponent(returnTime)}&zen_pickup_country_code=AT&zen_point_of_sale=AT`;

    console.log(`🚀 Sixt Tarama Başladı: ${sixtUrl}`);
    
    await page.goto(sixtUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 1. Çerez Banner'ını hallet
    try {
      await page.waitForSelector('#uc-btn-accept-banner', { timeout: 5000 });
      await page.click('#uc-btn-accept-banner');
      console.log("✅ Çerezler kabul edildi.");
    } catch (e) {
      console.log("ℹ️ Çerez banner'ı çıkmadı veya otomatik kapandı.");
    }

    // 2. Kategori filtresini manuel tetikle (URL bazen tam algılanmıyor)
    try {
      await page.waitForSelector('button[class*="filter"]', { timeout: 10000 });
      console.log("✅ Filtre menüsü hazır.");
    } catch (e) {
      console.log("⚠️ Filtre menüsü bulunamadı.");
    }

    // 3. Teklif kartlarını bekle (Selector güncellendi)
    try {
      await page.waitForSelector('div[class*="OfferCard"], div[data-testid="offer-card"]', { timeout: 25000 });
    } catch (e) {
      console.log("❌ Teklifler hala yüklenmedi.");
    }

    // 4. Verileri topla
    const offers = await page.evaluate((targetCat) => {
      const cards = document.querySelectorAll('div[data-testid="offer-card"], div[class*="OfferCard"]');
      return Array.from(cards).map(card => {
        const htmlCard = card as HTMLElement;
        const model = (card.querySelector('h4') as HTMLElement)?.innerText || 'Araç Modeli';
        const price = (card.querySelector('span[class*="price-value"]') as HTMLElement)?.innerText || '0';
        const currency = (card.querySelector('span[class*="currency"]') as HTMLElement)?.innerText || '€';
        const group = (card.querySelector('p[class*="vehicle-group"]') as HTMLElement)?.innerText || '';
        const transmission = htmlCard.innerText.includes('Manuell') ? 'Manuel' : 'Otomatik';
        const image = (card.querySelector('img') as HTMLImageElement)?.src || '';

        return {
          id: Math.random().toString(36),
          model,
          price: `${price} ${currency}`,
          daily: `${(parseFloat(price.replace(',', '.')) / 5).toFixed(2)} ${currency}`,
          image,
          transmission,
          group
        };
      });
    }, category);

    console.log(`✅ İşlem tamamlandı. Bulunan araç sayısı: ${offers.length}`);

    await browser.close();
    return NextResponse.json(offers);

  } catch (error: any) {
    console.error('❌ Scraper Hatası:', error.message);
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
