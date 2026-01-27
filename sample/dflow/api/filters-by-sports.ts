import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('🏈 Testing GET /api/v1/filters-by-sports...');

  try {
    // Get sports filters
    const response = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/filters_by_sports`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sports filters');
    }

    const data = await response.json();
    const filtersData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'filters-by-sports.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Retrieved sports filters`);
    console.log('📁 Saved response to responses/filters-by-sports.json');

    // Display sports categories if available
    if (filtersData.sports) {
      console.log('Available sports categories:');
      Object.keys(filtersData.sports)
        .slice(0, 10)
        .forEach((sport, index) => {
          console.log(`  ${index + 1}. ${sport}`);
        });
    } else if (Array.isArray(filtersData)) {
      console.log(`Found ${filtersData.length} sports filters`);
      filtersData.slice(0, 5).forEach((filter: any, index: number) => {
        console.log(`  ${index + 1}. ${filter.name || filter.sport || filter}`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching sports filters:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
