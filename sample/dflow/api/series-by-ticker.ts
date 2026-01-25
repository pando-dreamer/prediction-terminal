import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('🎯 Testing GET /api/v1/series/{ticker}...');

  try {
    // First get a series ticker to test with
    const seriesResponse = await fetch(
      `${METADATA_API}/api/v1/series?isInitialized=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!seriesResponse.ok) {
      throw new Error('Failed to fetch series list');
    }

    const seriesData = await seriesResponse.json();
    const seriesList = seriesData as any;

    if (seriesList.series && seriesList.series.length > 0) {
      const sampleTicker = seriesList.series[0].ticker;
      console.log(`Using sample series ticker: ${sampleTicker}`);

      // Get series details by ticker
      const response = await fetch(
        `${METADATA_API}/api/v1/series/${sampleTicker}`,
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
      console.log('Series Details Response:', JSON.stringify(data, null, 2));

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'series-by-ticker.json'),
        JSON.stringify(data, null, 2)
      );

      console.log(`✅ Retrieved series details for ${sampleTicker}`);
      console.log(`📁 Saved response to responses/series-by-ticker.json`);
    } else {
      console.log('⚠️ No series found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching series by ticker:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
