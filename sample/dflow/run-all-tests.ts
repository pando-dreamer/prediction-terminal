import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// List of all test files
const testFiles = [
  'category.ts',
  'markets.ts',
  'markets-batch.ts',
  'events.ts',
  'series.ts',
  'series-by-ticker.ts',
  'orderbook-by-ticker.ts',
  'trades.ts',
  'filter-outcome-mints.ts',
  'event.ts',
  'market-by-mint.ts',
  'market.ts',
  'orderbook-by-mint.ts',
  'trades-by-mint.ts',
  'filters-by-sports.ts',
  'search.ts',
];

const runTest = (
  filename: string
): Promise<{ success: boolean; output: string }> => {
  return new Promise(resolve => {
    console.log(`\n🚀 Running ${filename}...`);

    const child = spawn('npx', ['ts-node', `api/${filename}`], {
      cwd: __dirname,
      stdio: 'pipe',
    });

    let output = '';
    let error = '';

    child.stdout.on('data', data => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', data => {
      const text = data.toString();
      error += text;
      process.stderr.write(text);
    });

    child.on('close', code => {
      const success = code === 0;
      const fullOutput = output + (error ? `\nSTDERR:\n${error}` : '');

      console.log(
        `${success ? '✅' : '❌'} ${filename} ${success ? 'completed' : 'failed'}`
      );
      resolve({ success, output: fullOutput });
    });

    child.on('error', err => {
      console.log(`❌ ${filename} error:`, err.message);
      resolve({ success: false, output: err.message });
    });
  });
};

const main = async () => {
  console.log('🔧 DFlow API Test Runner');
  console.log('========================');

  const results: Array<{ file: string; success: boolean; output: string }> = [];

  // Check if responses directory exists, create if not
  const responsesDir = path.join(__dirname, 'responses');
  try {
    await fs.access(responsesDir);
  } catch {
    await fs.mkdir(responsesDir, { recursive: true });
    console.log('📁 Created responses directory');
  }

  // Run tests sequentially to avoid rate limiting
  for (const testFile of testFiles) {
    const filePath = path.join(__dirname, 'api', testFile);

    try {
      await fs.access(filePath);
      const result = await runTest(testFile);
      results.push({
        file: testFile,
        success: result.success,
        output: result.output,
      });
    } catch {
      console.log(`⚠️ ${testFile} not found, skipping...`);
      results.push({
        file: testFile,
        success: false,
        output: 'File not found',
      });
    }
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   ${r.file}`));

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   ${r.file}`));
  }

  // Save detailed results
  await fs.writeFile(
    path.join(responsesDir, 'test-results.json'),
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
        },
        results: results.map(r => ({
          file: r.file,
          success: r.success,
          // Truncate output for summary
          output:
            r.output.length > 500
              ? r.output.substring(0, 500) + '...'
              : r.output,
        })),
      },
      null,
      2
    )
  );

  console.log(`\n📁 Detailed results saved to responses/test-results.json`);
  console.log(
    `\n🎯 Overall Success Rate: ${Math.round((successful.length / results.length) * 100)}%`
  );
};

main().catch(console.error);
