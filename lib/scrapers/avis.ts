import { ScrapedPrice, ScraperResult } from './types';

export async function scrapeAvis(): Promise<ScraperResult> {
    try {
        const response = await fetch('https://www.avis.at/en/car-rental', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        if (!response.ok) {
            return {
                success: false,
                company: 'Avis',
                prices: [],
                error: `HTTP ${response.status}`,
            };
        }

        const html = await response.text();
        const prices = parseAvisHTML(html);

        return {
            success: true,
            company: 'Avis',
            prices,
        };
    } catch (error) {
        console.error('[Avis Scraper Error]', error);
        return {
            success: false,
            company: 'Avis',
            prices: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function parseAvisHTML(html: string): ScrapedPrice[] {
    const prices: ScrapedPrice[] = [];

    try {
        // Try to extract JSON-LD structured data
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        if (jsonLdMatch) {
            try {
                const jsonData = JSON.parse(jsonLdMatch[1]);
                // Parse structured data if available
            } catch (e) {
                // Continue with regex parsing
            }
        }

        // Avis typically uses patterns like:
        // <div class="offer-card">...<span class="model">BMW 3 Series</span>...<span class="price">€99/day</span>
        const priceMatches = html.matchAll(
            /<div[^>]*class="[^"]*offer[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*model[^"]*"[^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*class="[^"]*price[^"]*"[^>]*>€?(\d+(?:,\d+)?)<\/span>/g
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
                        source: 'avis.at',
                        scrapedAt: new Date(),
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Avis Parse Error]', error);
    }

    return prices;
}
