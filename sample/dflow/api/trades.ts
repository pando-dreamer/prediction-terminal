import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('📈 Testing GET /api/v1/trades...');

  try {
    // Get trades list
    const response = await fetch(`${METADATA_API}/api/v1/trades?limit=20`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DFLOW_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Trades Response:', JSON.stringify(data, null, 2));
    const tradesData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'trades.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Found ${tradesData.trades?.length || 0} trades`);
    console.log(`📁 Saved response to responses/trades.json`);

    // Display trade details
    if (tradesData.trades) {
      tradesData.trades.slice(0, 5).forEach((trade: any, index: number) => {
        console.log(
          `  Trade ${index + 1}: ${trade.ticker} - ${trade.takerSide}`
        );
        console.log(
          `    Price: ${trade.price} (YES: ${trade.yesPrice}, NO: ${trade.noPrice})`
        );
        console.log(`    Count: ${trade.count}`);
        console.log(
          `    Time: ${new Date(trade.createdTime * 1000).toISOString()}`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error fetching trades:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
