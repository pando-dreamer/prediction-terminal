import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('📊 Testing GET /api/v1/markets...');

  try {
    // Basic markets list
    const response = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/markets?limit=10&sort=volume`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch markets');
    }

    const data = await response.json();
    console.log('Markets Response:', JSON.stringify(data, null, 2));
    const marketsData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'markets.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Found ${marketsData.markets?.length || 0} markets`);
    console.log(`📁 Saved response to responses/markets.json`);
  } catch (error) {
    console.error('❌ Error fetching markets:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
