import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('🔍 Testing POST /api/v1/filter_outcome_mints...');

  try {
    // First get some market data to extract mint addresses
    const marketsResponse = await fetch(
      `${METADATA_API}/api/v1/markets?limit=10`,
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
      const sampleMints: string[] = [];

      // Collect mint addresses from markets
      marketsList.markets.forEach((market: any) => {
        if (market.accounts?.yesMint) sampleMints.push(market.accounts.yesMint);
        if (market.accounts?.noMint) sampleMints.push(market.accounts.noMint);
      });

      // Add some non-outcome mint addresses to test filtering
      sampleMints.push(
        '11111111111111111111111111111111', // System program
        'So11111111111111111111111111111111111111112', // Wrapped SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
      );

      console.log(`Testing filter with ${sampleMints.length} addresses`);

      // Filter outcome mints
      const response = await fetch(
        `${METADATA_API}/api/v1/filter_outcome_mints`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.DFLOW_API_KEY || '',
          },
          body: JSON.stringify({ addresses: sampleMints.slice(0, 50) }), // Max 200
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        'Filter Outcome Mints Response:',
        JSON.stringify(data, null, 2)
      );
      const resultData = data as any;

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'filter-outcome-mints.json'),
        JSON.stringify(
          {
            input: sampleMints.slice(0, 50),
            output: data,
          },
          null,
          2
        )
      );

      console.log(
        `✅ Found ${resultData.outcomeMints?.length || 0} outcome mints out of ${sampleMints.slice(0, 50).length} addresses`
      );
      console.log(`📁 Saved response to responses/filter-outcome-mints.json`);
    } else {
      console.log('⚠️ No markets found to extract mint addresses from');
    }
  } catch (error) {
    console.error('❌ Error filtering outcome mints:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
