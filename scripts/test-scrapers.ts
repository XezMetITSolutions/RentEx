import { scrapeHertz, scrapeAvis, scrapeEnterprise, scrapeEuropcar } from '@/lib/scrapers';

async function testScrapers() {
    console.log('🚀 Testing all scrapers...\n');

    try {
        console.log('📍 Testing Hertz...');
        const hertzResult = await scrapeHertz();
        console.log('Hertz Result:', JSON.stringify(hertzResult, null, 2));
        console.log('\n');
    } catch (error) {
        console.error('❌ Hertz Error:', error);
    }

    try {
        console.log('📍 Testing Avis...');
        const avisResult = await scrapeAvis();
        console.log('Avis Result:', JSON.stringify(avisResult, null, 2));
        console.log('\n');
    } catch (error) {
        console.error('❌ Avis Error:', error);
    }

    try {
        console.log('📍 Testing Enterprise...');
        const enterpriseResult = await scrapeEnterprise();
        console.log('Enterprise Result:', JSON.stringify(enterpriseResult, null, 2));
        console.log('\n');
    } catch (error) {
        console.error('❌ Enterprise Error:', error);
    }

    try {
        console.log('📍 Testing Europcar...');
        const europcarResult = await scrapeEuropcar();
        console.log('Europcar Result:', JSON.stringify(europcarResult, null, 2));
        console.log('\n');
    } catch (error) {
        console.error('❌ Europcar Error:', error);
    }

    console.log('✅ All scrapers tested!');
}

testScrapers();
