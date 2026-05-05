import { ScrapedPrice, ScraperResult } from './types';

export async function scrapeEnterprise(): Promise<ScraperResult> {
    try {
        const response = await fetch('https://www.enterprise.at/en/car-rental', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        if (!response.ok) {
            return {
                success: false,
                company: 'Enterprise',
                prices: [],
                error: `HTTP ${response.status}`,
            };
        }

        const html = await response.text();
        const prices = parseEnterpriseHTML(html);

        return {
            success: true,
            company: 'Enterprise',
            prices,
        };
    } catch (error) {
        console.error('[Enterprise Scraper Error]', error);
        return {
            success: false,
            company: 'Enterprise',
            prices: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function parseEnterpriseHTML(html: string): ScrapedPrice[] {
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

        // Enterprise typically uses patterns like:
        // <div class="vehicle-card">...<h3>BMW 320</h3>...<div class="rate">€85/day</div>
        const priceMatches = html.matchAll(
            /<div[^>]*class="[^"]*vehicle[^"]*"[^>]*>[\s\S]*?<h[234][^>]*>([^<]+)<\/h[234]>[\s\S]*?<div[^>]*class="[^"]*rate[^"]*"[^>]*>€?(\d+(?:,\d+)?)<\/div>/g
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
                        source: 'enterprise.at',
                        scrapedAt: new Date(),
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Enterprise Parse Error]', error);
    }

    return prices;
}
