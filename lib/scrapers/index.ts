import { scrapeHertz } from './hertz';
import { scrapeAvis } from './avis';
import { scrapeEnterprise } from './enterprise';
import { scrapeEuropcar } from './europcar';
import { ScraperResult } from './types';
import prisma from '@/lib/prisma';

export { scrapeHertz, scrapeAvis, scrapeEnterprise, scrapeEuropcar };

export async function runAllScrapers(): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];

    console.log('[Scrapers] Starting all scrapers...');

    // Run all scrapers in parallel
    const scraperPromises = [
        scrapeHertz(),
        scrapeAvis(),
        scrapeEnterprise(),
        scrapeEuropcar(),
    ];

    const scraperResults = await Promise.allSettled(scraperPromises);

    for (const result of scraperResults) {
        if (result.status === 'fulfilled') {
            results.push(result.value);
        } else {
            results.push({
                success: false,
                company: 'Unknown',
                prices: [],
                error: result.reason?.message || 'Unknown error',
            });
        }
    }

    // Store scraped prices in database
    for (const scraperResult of results) {
        if (scraperResult.success && scraperResult.prices.length > 0) {
            try {
                for (const price of scraperResult.prices) {
                    // Find competitor company by name
                    const company = await prisma.competitorCompany.findUnique({
                        where: { name: scraperResult.company },
                    });

                    if (company) {
                        // Check if price record already exists for today
                        const existingPrice = await prisma.competitorPrice.findUnique({
                            where: {
                                competitorId_brand_model_recordedAt: {
                                    competitorId: company.id,
                                    brand: price.brand,
                                    model: price.model,
                                    recordedAt: new Date(new Date().toDateString()),
                                },
                            },
                        });

                        if (!existingPrice) {
                            await prisma.competitorPrice.create({
                                data: {
                                    competitorId: company.id,
                                    brand: price.brand,
                                    model: price.model,
                                    dailyRate: price.dailyRate,
                                    weeklyRate: price.weeklyRate,
                                    monthlyRate: price.monthlyRate,
                                    recordedAt: new Date(),
                                },
                            });
                        }
                    }
                }
                console.log(`[Scrapers] Successfully stored prices for ${scraperResult.company}`);
            } catch (error) {
                console.error(`[Scrapers] Error storing prices for ${scraperResult.company}:`, error);
            }
        }
    }

    console.log('[Scrapers] All scrapers completed');
    return results;
}
