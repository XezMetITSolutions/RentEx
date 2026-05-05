import { ScrapedPrice, ScraperResult } from './types';

export async function scrapeHertz(): Promise<ScraperResult> {
    try {
        // Hertz API'yi çağır (public data)
        const response = await fetch('https://www.hertz.at/rentacar/reservation/index.jsp', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        if (!response.ok) {
            return {
                success: false,
                company: 'Hertz',
                prices: [],
                error: `HTTP ${response.status}`,
            };
        }

        const html = await response.text();
        const prices = parseHertzHTML(html);

        return {
            success: true,
            company: 'Hertz',
            prices,
        };
    } catch (error) {
        console.error('[Hertz Scraper Error]', error);
        return {
            success: false,
            company: 'Hertz',
            prices: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function parseHertzHTML(html: string): ScrapedPrice[] {
    const prices: ScrapedPrice[] = [];

    // Örnek regex patterns - gerçekte HTML parser kullanmalı
    // Bu sadece skeleton'dur
    try {
        // JSON LD structured data arasından veri çek (Hertz'in sitesinde olabilir)
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        if (jsonLdMatch) {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            // Parse JSON data for prices
        }

        // Fallback: Manual parsing rules
        // Hertz genellikle şu pattern'i kullanır:
        // <span class="price">€150/day</span>
        const priceMatches = html.matchAll(
            /<div[^>]*class="[^"]*vehicle[^"]*"[^>]*>[\s\S]*?<h[234][^>]*>([^<]+)<\/h[234]>[\s\S]*?<span[^>]*class="[^"]*price[^"]*"[^>]*>€?(\d+(?:,\d+)?)<\/span>/g
        );

        for (const match of priceMatches) {
            const modelName = match[1].trim(); // "BMW 320i"
            const dailyRate = parseFloat(match[2].replace(',', '.'));

            // Marke'yi extract et (BMW, Mercedes, vb.)
            const [brand, model] = modelName.split(' ');

            if (brand && model && !isNaN(dailyRate)) {
                prices.push({
                    brand: brand.trim(),
                    model: model.trim(),
                    dailyRate,
                    source: 'hertz.at',
                    scrapedAt: new Date(),
                });
            }
        }
    } catch (error) {
        console.error('[Hertz Parse Error]', error);
    }

    return prices;
}
