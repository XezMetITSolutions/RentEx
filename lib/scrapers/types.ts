export interface ScrapedPrice {
    brand: string;
    model: string;
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    source: string;
    scrapedAt: Date;
}

export interface ScraperResult {
    success: boolean;
    company: string;
    prices: ScrapedPrice[];
    error?: string;
}
