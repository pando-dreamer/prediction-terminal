import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('🔍 Testing GET /api/v1/search...');

  try {
    // Test search with a common query
    const searchQuery = 'Trump';
    const response = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/search?q=${encodeURIComponent(searchQuery)}&limit=10&withNestedMarkets=true&withNestedAccounts=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to perform search');
    }

    const data = await response.json();
    console.log(
      `Search Results for "${searchQuery}":`,
      JSON.stringify(data, null, 2)
    );
    const searchData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'search.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Search completed for "${searchQuery}"`);
    console.log('📁 Saved response to responses/search.json');

    // Display search results summary
    if (searchData.markets) {
      console.log(
        `Found ${searchData.markets.length} markets matching "${searchQuery}"`
      );
      searchData.markets.slice(0, 5).forEach((market: any, index: number) => {
        console.log(`  ${index + 1}. ${market.title} (${market.ticker})`);
      });
    } else if (searchData.results) {
      console.log(
        `Found ${searchData.results.length} results matching "${searchQuery}"`
      );
      searchData.results.slice(0, 5).forEach((result: any, index: number) => {
        console.log(
          `  ${index + 1}. ${result.title || result.name} (${result.ticker || result.id})`
        );
      });
    } else {
      console.log('Search completed but no specific results structure found');
    }
  } catch (error) {
    console.error('❌ Error performing search:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
