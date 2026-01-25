import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  /// Fetch tags organized by categories
  const response = await fetch(
    `${process.env.DFLOW_PREDITION_ENDPOINT}/api/v1/tags_by_categories`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DFLOW_API_KEY || '',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tags by categories');
  }

  const data = await response.json();
  console.log('Tags by Categories:', data);
  const tagsByCategories = (data as any).tagsByCategories;

  // Save response to file
  const responsesDir = path.join(__dirname, '../responses');
  await fs.mkdir(responsesDir, { recursive: true });
  await fs.writeFile(
    path.join(responsesDir, 'categories.json'),
    JSON.stringify(data, null, 2)
  );
};

main().catch(error => {
  console.error('Error:', error);
});
