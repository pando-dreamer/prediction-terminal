import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('📊 Testing GET /api/v1/orderbook/{ticker}...');

  try {
    // First get a market ticker to test with
    const marketsResponse = await fetch(
      `${METADATA_API}/api/v1/markets?limit=5&status=active`,
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

    const marketsData = await marketsResponse.json();
    const marketsList = marketsData as any;

    if (marketsList.markets && marketsList.markets.length > 0) {
      const sampleTicker = marketsList.markets[0].ticker;
      console.log(`Using sample market ticker: ${sampleTicker}`);

      // Get orderbook for the market
      const response = await fetch(
        `${METADATA_API}/api/v1/orderbook/${sampleTicker}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.DFLOW_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Orderbook Response:', JSON.stringify(data, null, 2));

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'orderbook-by-ticker.json'),
        JSON.stringify(data, null, 2)
      );

      console.log(`✅ Retrieved orderbook for ${sampleTicker}`);
      console.log(`📁 Saved response to responses/orderbook-by-ticker.json`);
    } else {
      console.log('⚠️ No active markets found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching orderbook by ticker:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
