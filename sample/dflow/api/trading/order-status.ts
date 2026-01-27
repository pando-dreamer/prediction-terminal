import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

/// Base URL for the DFlow Trade API
const API_BASE_URL = process.env.DFLOW_QUOTE_ENDPOINT || '';
const API_KEY = process.env.DFLOW_API_KEY; // Optional

const getOrderStatus = async (signature: string): Promise<any> => {
  console.log(`⏳ Checking status: ${signature}`);
  const queryParams = new URLSearchParams();
  queryParams.append('signature', signature);
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/order-status?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Order not found');
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Save response
    const responsesDir = path.join(__dirname, '../../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, `order-status-${signature}.json`),
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.error('❌ Failed to get status:', error);
    throw error;
  }
};

// Example usage
const main = async () => {
  await getOrderStatus('');
};

if (require.main === module) {
  main().catch(console.error);
}

export { getOrderStatus };
