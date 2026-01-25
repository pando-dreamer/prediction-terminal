import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('📦 Testing POST /api/v1/markets/batch...');

  try {
    // First get some market tickers to test with
    const marketsResponse = await fetch(
      `${METADATA_API}/api/v1/markets?limit=5`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!marketsResponse.ok) {
      throw new Error('Failed to fetch markets list');
    }

    const initialMarketsData = await marketsResponse.json();
    const initialMarkets = initialMarketsData as any;

    if (initialMarkets.markets && initialMarkets.markets.length > 0) {
      const tickers = initialMarkets.markets
        .slice(0, 3)
        .map((market: any) => market.ticker);
      console.log(`Testing batch request with tickers: ${tickers.join(', ')}`);

      // Get markets batch
      const response = await fetch(`${METADATA_API}/api/v1/markets/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Markets Batch Response:', JSON.stringify(data, null, 2));
      const marketsData = data as any;

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'markets-batch.json'),
        JSON.stringify(data, null, 2)
      );

      console.log(
        `✅ Retrieved ${marketsData.markets?.length || 0} markets in batch`
      );
      console.log(`📁 Saved response to responses/markets-batch.json`);
    } else {
      console.log('⚠️ No markets found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching markets batch:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
