import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('📅 Testing GET /api/v1/events...');

  try {
    // Get events list
    const response = await fetch(
      `${METADATA_API}/api/v1/events?limit=10&sort=volume&withNestedMarkets=true`,
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
    console.log('Events Response:', JSON.stringify(data, null, 2));
    const eventsData = data as any;

    // Save response to file
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'events.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Found ${eventsData.events?.length || 0} events`);
    console.log(`📁 Saved response to responses/events.json`);

    // Display event details
    if (eventsData.events) {
      eventsData.events.forEach((event: any, index: number) => {
        console.log(`  Event ${index + 1}: ${event.title} (${event.ticker})`);
        console.log(`    Markets: ${event.markets?.length || 0}`);
        console.log(`    Volume: ${event.volume}`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching events:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
