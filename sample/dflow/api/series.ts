import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('📚 Testing GET /api/v1/series...');

  try {
    // Get series list
    const response = await fetch(
      `${METADATA_API}/api/v1/series?category=Politics&isInitialized=true`,
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
    console.log('Series Response:', JSON.stringify(data, null, 2));
    const seriesData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'series.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Found ${seriesData.series?.length || 0} series`);
    console.log(`📁 Saved response to responses/series.json`);

    // Display series details
    if (seriesData.series) {
      seriesData.series.forEach((series: any, index: number) => {
        console.log(
          `  Series ${index + 1}: ${series.title} (${series.ticker})`
        );
        console.log(`    Category: ${series.category}`);
        console.log(`    Tags: ${series.tags?.join(', ') || 'None'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching series:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
