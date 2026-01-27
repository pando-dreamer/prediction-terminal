import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('🎯 Testing GET /api/v1/market...');

  try {
    // First get a market ticker from markets list
    const marketsResponse = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/markets?limit=5&status=active`,
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
      console.log(`Using sample ticker: ${sampleTicker}`);

      // Get market details
      const response = await fetch(
        `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/market/${sampleTicker}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.DFLOW_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market details');
      }

      const data = await response.json();
      console.log('Market Details Response:', JSON.stringify(data, null, 2));
      const marketData = data as any;

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'market.json'),
        JSON.stringify(data, null, 2)
      );

      console.log(
        `✅ Retrieved market details for ${marketData.market?.title || sampleTicker}`
      );
      console.log('📁 Saved response to responses/market.json');
    } else {
      console.log('⚠️ No markets found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching market details:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
