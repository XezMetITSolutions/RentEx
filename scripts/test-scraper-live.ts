import { runAllScrapers } from '@/lib/scrapers';

async function testScrapersLive() {
    console.log('🚀 Testing scrapers with live data...\n');
    
    const results = await runAllScrapers();
    
    console.log('\n📊 RESULTS:\n');
    results.forEach(result => {
        console.log(`${result.company}:`);
        console.log(`  Success: ${result.success}`);
        console.log(`  Prices found: ${result.prices.length}`);
        if (result.error) {
            console.log(`  Error: ${result.error}`);
        }
        if (result.prices.length > 0) {
            console.log('  Sample prices:');
            result.prices.slice(0, 3).forEach(p => {
                console.log(`    - ${p.brand} ${p.model}: €${p.dailyRate}`);
            });
        }
        console.log();
    });
}

testScrapersLive().catch(console.error).finally(() => process.exit(0));
