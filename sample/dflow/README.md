# DFlow API Testing Suite

This directory contains individual test scripts for each DFlow prediction market API endpoint.

## Structure

```
sample/dflow/
├── README.md                    # This file
├── run-all-tests.ts            # Unified test runner
├── responses/                  # Directory for API responses (auto-created)
│   ├── *.json                  # Individual endpoint responses
│   └── test-results.json       # Test execution summary
└── api/                        # Individual endpoint tests
    ├── category.ts             # GET /api/v1/tags_by_categories
    ├── markets.ts              # GET /api/v1/markets
    ├── markets-batch.ts        # POST /api/v1/markets_batch
    ├── events.ts               # GET /api/v1/events
    ├── series.ts               # GET /api/v1/series
    ├── series-by-ticker.ts     # GET /api/v1/series/:ticker
    ├── orderbook-by-ticker.ts  # GET /api/v1/orderbook/:ticker
    ├── trades.ts               # GET /api/v1/trades
    ├── filter-outcome-mints.ts # POST /api/v1/filter_outcome_mints
    ├── event.ts                # GET /api/v1/event
    ├── market-by-mint.ts       # GET /api/v1/market-by-mint
    ├── market.ts               # GET /api/v1/market
    ├── orderbook-by-mint.ts    # GET /api/v1/orderbook-by-mint
    ├── trades-by-mint.ts       # GET /api/v1/trades-by-mint
    ├── filters-by-sports.ts    # GET /api/v1/filters-by-sports
    └── search.ts               # GET /api/v1/search
```

## Environment Setup

Create a `.env` file in the project root with:

```bash
# DFlow API Configuration
DFLOW_PREDITION_ENDPOINT=https://prediction-markets-api.dflow.net
DFLOW_TRADE_ENDPOINT=https://quote-api.dflow.net
DFLOW_API_KEY=your_api_key_here
```

## Running Tests

### Individual Test

```bash
# Run specific endpoint test
npx ts-node category.ts
npx ts-node markets.ts
# ... etc
```

### All Tests

```bash
# Run all endpoint tests sequentially
npx ts-node run-all-tests.ts
```

## API Coverage

### Metadata API (prediction-markets-api.dflow.net)

- ✅ `GET /api/v1/tags_by_categories` - Market categories and tags
- ✅ `GET /api/v1/markets` - List all markets with pagination
- ✅ `GET /api/v1/markets/:ticker` - Get specific market details
- ✅ `POST /api/v1/markets_batch` - Get multiple markets by tickers
- ✅ `GET /api/v1/events` - List all events
- ✅ `GET /api/v1/events/:ticker` - Get specific event details
- ✅ `GET /api/v1/series` - List all series
- ✅ `GET /api/v1/series/:ticker` - Get specific series details
- ✅ `GET /api/v1/orderbook/:ticker` - Get market orderbook
- ✅ `GET /api/v1/trades` - Get recent trades with pagination
- ✅ `POST /api/v1/filter_outcome_mints` - Filter outcome mint addresses

### Trade API (quote-api.dflow.net)

- ✅ `POST /v0/get-quote` - Get trade quote
- ✅ `POST /v0/send-transaction` - Submit signed transaction

## File Pattern

Each test file follows this unified structure:

```typescript
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const main = async () => {
  const API_BASE =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('🔍 Testing ENDPOINT_NAME...');

  try {
    const response = await fetch(`${API_BASE}/api/v1/endpoint`, {
      method: 'GET', // or POST
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DFLOW_API_KEY || '',
      },
      // body: JSON.stringify(data) for POST requests
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    // Save response to file
    const responsesDir = path.join(__dirname, 'responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'endpoint-name.json'),
      JSON.stringify(data, null, 2)
    );

    console.log('✅ Test completed successfully');
    console.log('📁 Saved response to responses/endpoint-name.json');
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
```

## Response Storage

- All API responses are saved to the `responses/` directory
- Files are named after their endpoint (e.g., `markets.json`, `category.json`)
- Responses include both successful data and error cases for reference
- Test execution summary is saved to `test-results.json`

## Usage Notes

1. **Rate Limiting**: Tests run sequentially to avoid API rate limits
2. **Error Handling**: All tests handle errors gracefully and save error responses
3. **Authentication**: Uses API key from environment variables
4. **Sample Data**: Some tests use dynamic sample data from previous requests
5. **Validation**: Each test validates response structure and saves for reference

## Integration with Main Project

These test files serve as:

- Reference for API response structures
- Validation of endpoint availability
- Sample data for frontend development
- Integration testing foundation
- Documentation of API behavior

The saved responses in `responses/` can be used to:

- Generate TypeScript interfaces
- Create mock data for testing
- Validate API integration
- Document expected data structures
