import { ScrapedPrice, ScraperResult } from './types';

export async function scrapeEuropcar(): Promise<ScraperResult> {
    try {
        const response = await fetch('https://www.europcar.at/en/car-rental', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        if (!response.ok) {
            return {
                success: false,
                company: 'Europcar',
                prices: [],
                error: `HTTP ${response.status}`,
            };
        }

        const html = await response.text();
        const prices = parseEuropcarHTML(html);

        return {
            success: true,
            company: 'Europcar',
            prices,
        };
    } catch (error) {
        console.error('[Europcar Scraper Error]', error);
        return {
            success: false,
            company: 'Europcar',
            prices: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function parseEuropcarHTML(html: string): ScrapedPrice[] {
    const prices: ScrapedPrice[] = [];

    try {
        // Try to extract JSON-LD structured data
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
        if (jsonLdMatch) {
            try {
                const jsonData = JSON.parse(jsonLdMatch[1]);
                // Parse structured data if available
            } catch (e) {
                // Continue with regex parsing
            }
        }

        // Europcar typically uses patterns like:
        // <article class="vehicle">...<h4>Mercedes E-Class</h4>...<span class="daily-price">€120/day</span>
        const priceMatches = html.matchAll(
            /<article[^>]*class="[^"]*vehicle[^"]*"[^>]*>.*?<h[234][^>]*>([^<]+)<\/h[234]>.*?<span[^>]*class="[^"]*(?:daily-price|price)[^"]*"[^>]*>€?(\d+(?:,\d+)?)<\/span>/gs
        );

        for (const match of priceMatches) {
            const modelName = match[1].trim();
            const dailyRate = parseFloat(match[2].replace(',', '.'));

            const parts = modelName.split(/\s+/);
            if (parts.length >= 2) {
                const brand = parts[0];
                const model = parts.slice(1).join(' ');

                if (brand && model && !isNaN(dailyRate)) {
                    prices.push({
                        brand: brand.trim(),
                        model: model.trim(),
                        dailyRate,
                        source: 'europcar.at',
                        scrapedAt: new Date(),
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Europcar Parse Error]', error);
    }

    return prices;
}
