import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('📈 Testing GET /api/v1/trades-by-mint...');

  try {
    // First get a market to extract mint address
    const marketsResponse = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/markets?limit=5&isInitialized=true`,
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
      // Extract a mint address from market accounts
      let sampleMint = null;
      for (const market of marketsList.markets) {
        if (market.accounts) {
          const accounts = Object.values(market.accounts)[0] as any;
          if (accounts?.yesMint) {
            sampleMint = accounts.yesMint;
            break;
          }
        }
      }

      if (sampleMint) {
        console.log(`Using sample mint: ${sampleMint}`);

        // Get trades by mint
        const response = await fetch(
          `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/trades/by-mint/${sampleMint}?limit=10`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.DFLOW_API_KEY || '',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch trades by mint');
        }

        const data = await response.json();
        console.log('Trades by Mint Response:', JSON.stringify(data, null, 2));
        const tradesData = data as any;

        // Save response to file
        const responsesDir = path.join(__dirname, '../responses');
        await fs.mkdir(responsesDir, { recursive: true });
        await fs.writeFile(
          path.join(responsesDir, 'trades-by-mint.json'),
          JSON.stringify(data, null, 2)
        );

        console.log(
          `✅ Found ${tradesData.trades?.length || 0} trades for mint: ${sampleMint}`
        );
        console.log('📁 Saved response to responses/trades-by-mint.json');

        // Display first 3 trades
        if (tradesData.trades && tradesData.trades.length > 0) {
          tradesData.trades.slice(0, 3).forEach((trade: any, index: number) => {
            console.log(
              `  Trade ${index + 1}: ${trade.ticker} - ${trade.takerSide}`
            );
            console.log(
              `    Price: ${trade.price} (YES: ${trade.yesPrice}, NO: ${trade.noPrice})`
            );
          });
        }
      } else {
        console.log('⚠️ No mint addresses found in markets to test with');
      }
    } else {
      console.log('⚠️ No markets found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching trades by mint:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
