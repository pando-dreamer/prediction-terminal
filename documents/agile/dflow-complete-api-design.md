# DFlow API Integration - Comprehensive Design Solution

## API Endpoint Analysis

Based on exploration of DFlow's complete API surface, here's the comprehensive design for integrating their prediction market platform:

### 1. DFlow Metadata API (prediction-markets-api.dflow.net)

#### Markets Endpoints

```
GET /api/v1/markets
- Query: limit, cursor, isInitialized, status, sort
- Response: {markets: Market[], cursor: number}

GET /api/v1/markets/{market_ticker}
- Response: Market details

POST /api/v1/markets/batch
- Body: {tickers: string[]}
- Response: {markets: Market[]}

POST /api/v1/filter_outcome_mints
- Body: {addresses: string[]}
- Response: {outcomeMints: string[]}
```

#### Events Endpoints

```
GET /api/v1/events
- Query: limit, cursor, withNestedMarkets, seriesTickers, isInitialized, status, sort
- Response: {events: Event[], cursor: number}

GET /api/v1/events/{event_ticker}
- Response: Event details with nested markets
```

#### Series Endpoints

```
GET /api/v1/series
- Query: category, tags, isInitialized, status
- Response: {series: Series[]}

GET /api/v1/series/{series_ticker}
- Response: Series template details
```

#### Trading Data Endpoints

```
GET /api/v1/orderbook/{market_ticker}
- Response: Orderbook with bids/asks

GET /api/v1/trades
- Query: limit, cursor, ticker, minTs, maxTs
- Response: {trades: Trade[], cursor: string}
```

### 2. DFlow Trade API (quote-api.dflow.net)

#### Order Endpoints

```
GET /order
- Query: userPublicKey, inputMint, outputMint, amount, slippageBps, predictionMarketSlippageBps
- Response: Quote + optionally signed transaction

GET /order/{order_id}/status
- Response: Order execution status
```

## Data Type Design

### Core Market Data Types

```typescript
// === MARKET ENTITIES ===
export interface DFlowMarket {
  // Basic Information
  ticker: string;
  eventTicker: string;
  title: string;
  subtitle: string;
  noSubTitle: string;
  yesSubTitle: string;

  // Market Mechanics
  marketType: string;
  status: DFlowMarketStatus;
  canCloseEarly: boolean;
  earlyCloseCondition?: string;

  // Timing
  openTime: number; // Unix timestamp
  closeTime: number; // Unix timestamp
  expirationTime: number; // Unix timestamp

  // Financial Data
  volume: number;
  volume24h?: number;
  openInterest: number;
  liquidity?: number;

  // Pricing
  yesAsk: string;
  yesBid: string;
  noAsk: string;
  noBid: string;

  // Settlement
  result?: string; // Market outcome if resolved
  rulesPrimary: string;
  rulesSecondary?: string;

  // Technical Details
  accounts: {
    yesMint: string;
    noMint: string;
    marketLedger: string;
    [key: string]: any;
  };
}

export enum DFlowMarketStatus {
  INITIALIZED = 'initialized',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed',
  DETERMINED = 'determined',
  FINALIZED = 'finalized',
}

export interface DFlowEvent {
  ticker: string;
  seriesTicker: string;
  title: string;
  subtitle: string;
  competition: string;
  competitionScope: string;

  // Timing
  strikeDate: number; // Unix timestamp
  strikePeriod: string;

  // Financial Aggregates
  volume: number;
  volume24h: number;
  openInterest: number;
  liquidity: number;

  // Nested Markets (if withNestedMarkets=true)
  markets?: DFlowMarket[];

  // Settlement Sources
  settlementSources: Array<{
    name: string;
    url: string;
  }>;

  // Media
  imageUrl?: string;
}

export interface DFlowSeries {
  ticker: string;
  title: string;
  category: string;
  frequency: string;

  // Fee Structure
  feeType: string;
  feeMultiplier: number;

  // Legal/Compliance
  contractUrl?: string;
  contractTermsUrl?: string;
  additionalProhibitions?: string[];

  // Settlement Sources
  settlementSources: Array<{
    name: string;
    url: string;
  }>;

  // Categorization
  tags: string[];
  productMetadata?: unknown;
}

// === TRADING DATA TYPES ===
export interface DFlowTrade {
  tradeId: string;
  ticker: string;
  createdTime: number; // Unix timestamp
  count: number; // Trade size

  // Pricing
  price: number; // Trade price (0-1)
  yesPrice: number;
  noPrice: number;
  yesPriceDollars: string; // Formatted price string
  noPriceDollars: string;

  takerSide: 'yes' | 'no'; // Which side initiated
}

export interface DFlowOrderbook {
  ticker: string;
  bids: Array<{
    price: number;
    size: number;
  }>;
  asks: Array<{
    price: number;
    size: number;
  }>;
  lastUpdated: number;
}

// === TRADING EXECUTION TYPES ===
export interface DFlowOrderRequest {
  userPublicKey: string;
  inputMint: string; // Token being sold
  outputMint: string; // Token being bought
  amount: string; // Input amount (scaled integer)

  // Slippage Configuration
  slippageBps: number | 'auto';
  predictionMarketSlippageBps?: number | 'auto';

  // Execution Preferences
  allowSyncExec?: boolean;
  allowAsyncExec?: boolean;
  onlyDirectRoutes?: boolean;
  maxRouteLength?: number;

  // Fee Configuration
  platformFeeBps?: number;
  platformFeeMode?: 'inputMint' | 'outputMint';
  feeAccount?: string;

  // Advanced Options
  prioritizationFeeLamports?: number | 'auto' | 'medium' | 'high' | 'veryHigh';
  predictionMarketInitPayer?: string;
  destinationTokenAccount?: string;
  wrapAndUnwrapSol?: boolean;
}

export interface DFlowOrderResponse {
  // Execution Details
  executionMode: 'sync' | 'async';
  contextSlot: number;

  // Amounts
  inAmount: string; // Actual input amount
  outAmount: string; // Expected output amount
  minOutAmount: string; // Minimum guaranteed output
  otherAmountThreshold: string;

  // Token Details
  inputMint: string;
  outputMint: string;
  revertMint?: string; // For async orders

  // Pricing
  priceImpactPct: string; // "0.01" = 1%
  slippageBps: number;
  predictionMarketSlippageBps?: number;

  // Transaction Details
  transaction?: string; // Base64 encoded signed transaction
  computeUnitLimit?: number;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;

  // Route Information
  routePlan?: DFlowRouteLeg[];

  // Prediction Market Specific
  initPredictionMarketCost?: number;
  predictionMarketInitPayerMustSign?: boolean;

  // Fees
  platformFee?: {
    amount: string;
    mint: string;
  };
}

export interface DFlowRouteLeg {
  venue: string; // Exchange/AMM name
  inputMint: string;
  outputMint: string;
  inputMintDecimals: number;
  outputMintDecimals: number;
  inAmount: string;
  outAmount: string;
  marketKey?: string; // For prediction markets
  data: string; // Route-specific data
}

// === USER POSITION TYPES ===
export interface DFlowUserPosition {
  // Token Account Details
  tokenAccount: string; // User's token account address
  mint: string; // Outcome token mint address
  balance: string; // Token balance (scaled)
  decimals: number;

  // Market Context
  market: DFlowMarket; // Associated market data
  side: 'yes' | 'no'; // Position side

  // Financial Calculations
  currentValue: number; // Current USD value
  entryPrice?: number; // Average entry price (if tracked)
  unrealizedPnl?: number; // Current P&L

  // Metadata
  lastUpdated: number; // Unix timestamp
}

// === API RESPONSE WRAPPERS ===
export interface DFlowApiResponse<T> {
  data: T;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}

export interface DFlowPaginatedResponse<T> {
  data: T[];
  cursor?: number | string; // Next pagination cursor
  hasMore?: boolean;
  total?: number;
}

// === FILTER & QUERY TYPES ===
export interface DFlowMarketFilters {
  limit?: number; // Max results (default: 100)
  cursor?: number; // Pagination offset
  isInitialized?: boolean; // Has market ledger
  status?: DFlowMarketStatus | DFlowMarketStatus[];
  sort?: 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate';
}

export interface DFlowEventFilters {
  limit?: number;
  cursor?: number;
  withNestedMarkets?: boolean;
  seriesTickers?: string[]; // Filter by series (max 25)
  isInitialized?: boolean;
  status?: DFlowMarketStatus | DFlowMarketStatus[];
  sort?: 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate';
}

export interface DFlowSeriesFilters {
  category?: string; // Politics, Economics, Entertainment, etc
  tags?: string[]; // Filter by tags
  isInitialized?: boolean;
  status?: DFlowMarketStatus | DFlowMarketStatus[];
}

export interface DFlowTradeFilters {
  limit?: number; // 1-1000, default 100
  cursor?: string; // Trade ID for pagination
  ticker?: string; // Specific market
  minTs?: number; // Unix timestamp filter
  maxTs?: number; // Unix timestamp filter
}
```

## Database Schema Design

### Enhanced Existing Entities

```sql
-- Extend existing markets table for DFlow integration
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_ticker VARCHAR(255) UNIQUE;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_event_ticker VARCHAR(255);
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_series_ticker VARCHAR(255);
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_market_type VARCHAR(100);
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_accounts JSONB;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS dflow_metadata JSONB;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS is_dflow_market BOOLEAN DEFAULT FALSE;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS can_close_early BOOLEAN DEFAULT FALSE;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS early_close_condition TEXT;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS rules_primary TEXT;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS rules_secondary TEXT;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS settlement_sources JSONB;

-- Add indexes for DFlow lookups
CREATE INDEX IF NOT EXISTS idx_markets_dflow_ticker ON markets(dflow_ticker);
CREATE INDEX IF NOT EXISTS idx_markets_dflow_event ON markets(dflow_event_ticker);
CREATE INDEX IF NOT EXISTS idx_markets_dflow_series ON markets(dflow_series_ticker);
CREATE INDEX IF NOT EXISTS idx_markets_is_dflow ON markets(is_dflow_market);
```

### New DFlow-Specific Tables

```sql
-- DFlow Events table
CREATE TABLE IF NOT EXISTS dflow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(255) UNIQUE NOT NULL,
    series_ticker VARCHAR(255),
    title TEXT NOT NULL,
    subtitle TEXT,
    competition VARCHAR(255),
    competition_scope VARCHAR(255),
    strike_date BIGINT,
    strike_period VARCHAR(100),
    volume DECIMAL(20,2) DEFAULT 0,
    volume_24h DECIMAL(20,2) DEFAULT 0,
    open_interest DECIMAL(20,2) DEFAULT 0,
    liquidity DECIMAL(20,2) DEFAULT 0,
    settlement_sources JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DFlow Series table
CREATE TABLE IF NOT EXISTS dflow_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category VARCHAR(255),
    frequency VARCHAR(100),
    fee_type VARCHAR(100),
    fee_multiplier INTEGER DEFAULT 0,
    contract_url TEXT,
    contract_terms_url TEXT,
    additional_prohibitions JSONB,
    settlement_sources JSONB,
    tags JSONB,
    product_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DFlow User Positions table
CREATE TABLE IF NOT EXISTS dflow_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    token_account VARCHAR(255) NOT NULL,
    mint_address VARCHAR(255) NOT NULL,
    market_ticker VARCHAR(255) NOT NULL,
    balance DECIMAL(20,8) NOT NULL DEFAULT 0,
    decimals INTEGER NOT NULL DEFAULT 6,
    side VARCHAR(10) NOT NULL CHECK (side IN ('yes', 'no')),
    entry_price DECIMAL(10,8),
    current_value DECIMAL(15,2),
    unrealized_pnl DECIMAL(15,2),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token_account, mint_address)
);

-- DFlow Trade History table
CREATE TABLE IF NOT EXISTS dflow_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dflow_trade_id VARCHAR(255),
    market_ticker VARCHAR(255) NOT NULL,
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    side VARCHAR(10) NOT NULL CHECK (side IN ('yes', 'no')),
    input_mint VARCHAR(255) NOT NULL,
    output_mint VARCHAR(255) NOT NULL,
    input_amount DECIMAL(20,8) NOT NULL,
    output_amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(10,8) NOT NULL,
    slippage_bps INTEGER,
    execution_mode VARCHAR(20) CHECK (execution_mode IN ('sync', 'async')),
    transaction_signature VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reverted')),
    dflow_order_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DFlow Market Price History (for caching)
CREATE TABLE IF NOT EXISTS dflow_market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_ticker VARCHAR(255) NOT NULL,
    yes_price DECIMAL(10,8),
    no_price DECIMAL(10,8),
    yes_bid DECIMAL(10,8),
    yes_ask DECIMAL(10,8),
    no_bid DECIMAL(10,8),
    no_ask DECIMAL(10,8),
    volume DECIMAL(20,2),
    open_interest DECIMAL(20,2),
    liquidity DECIMAL(20,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dflow_events_series ON dflow_events(series_ticker);
CREATE INDEX IF NOT EXISTS idx_dflow_events_strike_date ON dflow_events(strike_date);
CREATE INDEX IF NOT EXISTS idx_dflow_series_category ON dflow_series(category);
CREATE INDEX IF NOT EXISTS idx_dflow_positions_user ON dflow_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_dflow_positions_wallet ON dflow_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_dflow_positions_market ON dflow_positions(market_ticker);
CREATE INDEX IF NOT EXISTS idx_dflow_trades_user ON dflow_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_dflow_trades_market ON dflow_trades(market_ticker);
CREATE INDEX IF NOT EXISTS idx_dflow_trades_status ON dflow_trades(status);
CREATE INDEX IF NOT EXISTS idx_dflow_prices_ticker_time ON dflow_market_prices(market_ticker, timestamp);
```

## API Integration Architecture

### Service Layer Design

```typescript
// === CORE DFLOW CLIENT ===
@Injectable()
export class DFlowApiClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {}

  async makeRequest<T>(
    endpoint: string,
    options: DFlowRequestOptions = {}
  ): Promise<T> {
    // Implementation with retry logic, rate limiting, caching
  }
}

// === MARKET DISCOVERY SERVICE ===
@Injectable()
export class DFlowMarketService {
  // Market Discovery
  async getMarkets(
    filters?: DFlowMarketFilters
  ): Promise<DFlowPaginatedResponse<DFlowMarket>>;
  async getMarketByTicker(ticker: string): Promise<DFlowMarket>;
  async getMarketsBatch(tickers: string[]): Promise<DFlowMarket[]>;

  // Event Management
  async getEvents(
    filters?: DFlowEventFilters
  ): Promise<DFlowPaginatedResponse<DFlowEvent>>;
  async getEventByTicker(ticker: string): Promise<DFlowEvent>;

  // Series Management
  async getSeries(filters?: DFlowSeriesFilters): Promise<DFlowSeries[]>;
  async getSeriesByTicker(ticker: string): Promise<DFlowSeries>;

  // Market Data
  async getOrderbook(ticker: string): Promise<DFlowOrderbook>;
  async getTrades(
    filters?: DFlowTradeFilters
  ): Promise<DFlowPaginatedResponse<DFlowTrade>>;
}

// === TRADING SERVICE ===
@Injectable()
export class DFlowTradingService {
  async getQuote(request: DFlowOrderRequest): Promise<DFlowOrderResponse>;
  async executeOrder(request: DFlowOrderRequest): Promise<DFlowOrderResponse>;
  async getOrderStatus(orderId: string): Promise<DFlowOrderStatus>;
  async monitorOrderExecution(
    orderId: string
  ): Promise<Observable<DFlowOrderUpdate>>;
}

// === POSITION TRACKING SERVICE ===
@Injectable()
export class DFlowPositionService {
  async getUserPositions(walletAddress: string): Promise<DFlowUserPosition[]>;
  async syncUserPositions(userId: string, walletAddress: string): Promise<void>;
  async filterOutcomeMints(addresses: string[]): Promise<string[]>;
  async calculatePositionValues(
    positions: DFlowUserPosition[]
  ): Promise<DFlowUserPosition[]>;
}

// === DATA SYNC SERVICE ===
@Injectable()
export class DFlowSyncService {
  async syncMarkets(): Promise<void>;
  async syncEvents(): Promise<void>;
  async syncSeries(): Promise<void>;
  async syncMarketPrices(): Promise<void>;
  async syncUserPositions(userId: string): Promise<void>;
}
```

### GraphQL Schema Extensions

```typescript
// === GRAPHQL TYPES ===
@ObjectType()
export class DFlowMarket {
  @Field() ticker: string;
  @Field() eventTicker: string;
  @Field() title: string;
  @Field() subtitle: string;
  @Field(() => DFlowMarketStatus) status: DFlowMarketStatus;
  @Field() volume: number;
  @Field() openInterest: number;
  @Field() yesPrice: number;
  @Field() noPrice: number;
  @Field(() => Date) openTime: Date;
  @Field(() => Date) closeTime: Date;
  @Field({ nullable: true }) result?: string;
  @Field(() => DFlowMarketAccounts) accounts: DFlowMarketAccounts;
}

@ObjectType()
export class DFlowEvent {
  @Field() ticker: string;
  @Field() seriesTicker: string;
  @Field() title: string;
  @Field() competition: string;
  @Field() volume: number;
  @Field(() => [DFlowMarket]) markets: DFlowMarket[];
}

@ObjectType()
export class DFlowUserPosition {
  @Field() tokenAccount: string;
  @Field() mintAddress: string;
  @Field() balance: number;
  @Field() side: string;
  @Field() currentValue: number;
  @Field({ nullable: true }) unrealizedPnl?: number;
  @Field(() => DFlowMarket) market: DFlowMarket;
}

// === GRAPHQL RESOLVERS ===
@Resolver(() => DFlowMarket)
export class DFlowMarketResolver {
  @Query(() => [DFlowMarket])
  async dflowMarkets(
    @Args('filters', { nullable: true }) filters?: DFlowMarketFiltersInput
  ): Promise<DFlowMarket[]>

  @Query(() => DFlowMarket, { nullable: true })
  async dflowMarket(@Args('ticker') ticker: string): Promise<DFlowMarket>

  @Query(() => [DFlowEvent])
  async dflowEvents(
    @Args('filters', { nullable: true }) filters?: DFlowEventFiltersInput
  ): Promise<DFlowEvent[]>

  @Query(() => [DFlowUserPosition])
  async dflowUserPositions(
    @Args('walletAddress') walletAddress: string
  ): Promise<DFlowUserPosition[]>
}

@Resolver(() => DFlowTrade)
export class DFlowTradingResolver {
  @Mutation(() => DFlowOrderResponse)
  async getDFlowQuote(
    @Args('request') request: DFlowOrderRequestInput
  ): Promise<DFlowOrderResponse>

  @Mutation(() => DFlowOrderResponse)
  async executeDFlowOrder(
    @Args('request') request: DFlowOrderRequestInput
  ): Promise<DFlowOrderResponse>
}
```

### Configuration & Environment

```typescript
// === CONFIGURATION ===
export interface DFlowConfig {
  metadataApiUrl: string;     // https://prediction-markets-api.dflow.net
  tradeApiUrl: string;        // https://quote-api.dflow.net
  apiKey: string;
  network: 'mainnet' | 'devnet';

  // Rate Limiting
  rateLimit: {
    maxRequests: number;      // 100 requests
    windowMs: number;         // per 60 seconds
  };

  // Caching
  cache: {
    marketsTtl: number;       // 300s (5 min)
    pricesTtl: number;        // 60s (1 min)
    eventsTtl: number;        // 900s (15 min)
  };

  // Trading
  trading: {
    defaultSlippageBps: number;           // 500 (5%)
    maxSlippageBps: number;               // 1000 (10%)
    defaultPredictionSlippageBps: number; // 750 (7.5%)
  };

  // Position Sync
  positionSync: {
    intervalMs: number;       // 300000 (5 min)
    batchSize: number;        // 50 positions
  };
}

// === ENVIRONMENT VARIABLES ===
DFLOW_METADATA_API_URL=https://prediction-markets-api.dflow.net
DFLOW_TRADE_API_URL=https://quote-api.dflow.net
DFLOW_API_KEY=your-api-key-here
DFLOW_NETWORK=devnet
DFLOW_RATE_LIMIT_REQUESTS=100
DFLOW_RATE_LIMIT_WINDOW=60000
DFLOW_CACHE_MARKETS_TTL=300
DFLOW_CACHE_PRICES_TTL=60
DFLOW_DEFAULT_SLIPPAGE_BPS=500
DFLOW_POSITION_SYNC_INTERVAL=300000
```

## Implementation Priority

### Phase 1: Market Discovery (Sprint 1)

1. ✅ Market Metadata API integration
2. ✅ Event and Series data fetching
3. ✅ Basic caching and error handling
4. ✅ GraphQL schema extensions

### Phase 2: Trading Integration (Sprint 2-3)

1. Order quote fetching
2. Trade execution (sync/async)
3. Order status monitoring
4. Transaction signing flow

### Phase 3: Position Tracking (Sprint 3-4)

1. Solana token account fetching
2. Outcome mint filtering
3. Position value calculations
4. Real-time position updates

### Phase 4: Advanced Features (Sprint 4-6)

1. Settlement and redemption
2. Real-time price feeds
3. Historical data and analytics
4. Performance optimization

This comprehensive design provides a complete integration solution that handles all aspects of DFlow's prediction market infrastructure while maintaining clean separation of concerns and robust error handling.
