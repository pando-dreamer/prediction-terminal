import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  console.log('🎪 Testing GET /api/v1/events/{ticker}...');

  try {
    // First get an event ticker from events list
    const eventsResponse = await fetch(
      `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/events?limit=5`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch events list');
    }

    const eventsData = await eventsResponse.json();
    const eventsList = eventsData as any;

    if (eventsList.events && eventsList.events.length > 0) {
      const sampleEventTicker = eventsList.events[0].ticker;
      console.log(`Using sample event ticker: ${sampleEventTicker}`);

      // Get single event details using events/{ticker} pattern
      const response = await fetch(
        `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/event/${sampleEventTicker}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.DFLOW_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      const data = await response.json();
      console.log('Event Details Response:', JSON.stringify(data, null, 2));
      const eventData = data as any;

      // Save response to file
      const responsesDir = path.join(__dirname, '../responses');
      await fs.mkdir(responsesDir, { recursive: true });
      await fs.writeFile(
        path.join(responsesDir, 'event.json'),
        JSON.stringify(data, null, 2)
      );

      console.log(
        `✅ Retrieved event details for ${eventData.event?.title || sampleEventTicker}`
      );
      console.log('📁 Saved response to responses/event.json');
    } else {
      console.log('⚠️ No events found to test with');
    }
  } catch (error) {
    console.error('❌ Error fetching event details:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
