# Sprint 3: Data Design - Position Tracking & Portfolio Management

## Overview

**Date**: January 28, 2026 (Sprint 3 Day 1-2)  
**Phase**: Data Design  
**Sprint Goal**: Enable users to track their prediction market positions and portfolio performance  
**Status**: **IN PROGRESS** 📋

Based on reference analysis findings, this document defines all data structures, APIs, and schemas required for position tracking implementation.

## Core Data Interfaces

### Position & Portfolio Types

```typescript
// ==============================================================================
// POSITION CORE INTERFACES
// ==============================================================================

interface UserPosition {
  // Identification
  id: string;
  userId: string;
  walletAddress: string;

  // Token Information
  mint: string; // Outcome token mint address
  balance: number; // Token balance (human readable)
  balanceRaw: string; // Raw token balance (with decimals)
  decimals: number; // Token decimal places

  // Market Information
  marketId: string; // Market ticker/identifier
  marketTitle: string; // Human readable market title
  outcome: OutcomeType; // Position outcome type
  baseMint: string; // Base token (USDC, etc.)

  // Position Metrics
  entryPrice: number; // Average entry price per token
  currentPrice: number; // Current market price
  marketPrice: number; // Latest market price for outcome
  estimatedValue: number; // Current position value in base token
  unrealizedPnL: number; // Unrealized profit/loss
  unrealizedPnLPercent: number; // P&L as percentage

  // Status & Classification
  marketStatus: MarketStatus; // ACTIVE, RESOLVED, SETTLED
  isRedeemable: boolean; // Can be redeemed now
  positionType: PositionType; // PREDICTION, BINARY, CATEGORICAL

  // Risk & Performance
  costBasis: number; // Total amount invested
  riskLevel: RiskLevel; // HIGH, MEDIUM, LOW
  daysHeld: number; // Days since position opened

  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
  lastPriceUpdate: Date;
}

interface PortfolioSummary {
  // Basic Metrics
  totalPositions: number;
  activePositions: number;
  resolvedPositions: number;

  // Value Metrics
  totalValue: number; // Sum of all position values
  totalCostBasis: number; // Total amount invested
  availableBalance: number; // USDC balance available for trading

  // P&L Metrics
  totalUnrealizedPnL: number; // Total unrealized P&L
  totalRealizedPnL: number; // Total realized P&L (from completed trades)
  netPnL: number; // Total P&L (realized + unrealized)
  portfolioReturn: number; // Overall portfolio return percentage

  // Redeemable Positions
  redeemablePositions: number; // Number of redeemable positions
  redeemableValue: number; // Value of positions that can be redeemed

  // Performance Metrics
  winRate: number; // Percentage of winning positions
  averagePositionSize: number; // Average position value
  largestPosition: number; // Largest single position value
  averageHoldingPeriod: number; // Average days positions are held

  // Risk Metrics
  portfolioRisk: RiskLevel; // Overall portfolio risk level
  diversificationScore: number; // Portfolio diversification (0-100)

  // Time-based Metrics
  dailyPnL: number; // P&L change today
  weeklyPnL: number; // P&L change this week
  monthlyPnL: number; // P&L change this month
}

interface PortfolioHistory {
  id: string;
  userId: string;
  date: Date;
  totalValue: number;
  dailyPnL: number;
  cumulativePnL: number;
  positionCount: number;
  netDeposits: number; // Cumulative deposits minus withdrawals
}

// ==============================================================================
// POSITION TRACKING INTERFACES
// ==============================================================================

interface PositionCalculationResult {
  position: UserPosition;
  priceData: PriceData;
  calculationMetadata: {
    entryPriceSource: 'TRADE_HISTORY' | 'ESTIMATED';
    lastTradeDate?: Date;
    tradeCount: number;
    calculationTimestamp: Date;
  };
}

interface PriceData {
  marketId: string;
  outcome: OutcomeType;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  lastUpdated: Date;
  source: 'DFLOW_API' | 'CALCULATED' | 'CACHED';
}

interface TokenAccountInfo {
  mint: string;
  owner: string;
  balance: string; // Raw balance
  decimals: number;
  uiAmount: number; // Human readable amount
  isToken2022: boolean; // Token 2022 program
  associatedAccount?: string; // ATA address
}

// ==============================================================================
// REDEMPTION INTERFACES
// ==============================================================================

interface RedemptionRequest {
  positionId: string;
  amount?: number; // Optional partial redemption
  slippageBps?: number; // Optional slippage tolerance
  userPublicKey: string;
}

interface RedemptionResult {
  success: boolean;
  transactionSignature?: string;
  redeemOrder?: DFlowOrderResponse;
  amountRedeemed?: number;
  amountReceived?: number;
  error?: TradingError;
}

interface RedemptionHistory {
  id: string;
  positionId: string;
  amountRedeemed: number;
  amountReceived: number;
  transactionSignature: string;
  redemptionDate: Date;
  marketResolutionDate: Date;
  profitLoss: number;
}

// ==============================================================================
// TRADE HISTORY INTERFACES
// ==============================================================================

interface PositionTrade {
  id: string;
  positionId: string;
  transactionSignature: string;
  type: TradeType; // BUY, SELL
  amount: number; // Token amount
  price: number; // Execution price
  fee: number; // Trading fee paid
  timestamp: Date;

  // Order Information
  orderId?: string;
  executionMode: ExecutionMode; // SYNC, ASYNC
  slippageBps: number;
  priceImpact: number;
}

// ==============================================================================
// ENUM TYPES
// ==============================================================================

enum OutcomeType {
  YES = 'YES',
  NO = 'NO',
}

enum MarketStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

enum PositionType {
  PREDICTION = 'PREDICTION',
  BINARY = 'BINARY',
  CATEGORICAL = 'CATEGORICAL',
}

enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
  REDEMPTION = 'REDEMPTION',
}
```

## GraphQL Schema Extensions

### Position Tracking Schema

```graphql
# ==============================================================================
# POSITION QUERIES & MUTATIONS
# ==============================================================================

extend type Query {
  # Position Queries
  userPositions(walletAddress: String!): [UserPosition!]!
  portfolioSummary(walletAddress: String!): PortfolioSummary!
  positionHistory(positionId: ID!, limit: Int, offset: Int): [PositionTrade!]!
  portfolioHistory(walletAddress: String!, days: Int): [PortfolioHistory!]!

  # Redemption Queries
  redeemablePositions(walletAddress: String!): [UserPosition!]!
  redemptionHistory(walletAddress: String!): [RedemptionHistory!]!

  # Price & Market Data
  positionPrices(mints: [String!]!): [PriceData!]!
  marketPriceHistory(marketId: String!, days: Int): [PriceData!]!
}

extend type Mutation {
  # Position Management
  refreshUserPositions(walletAddress: String!): RefreshResult!
  updatePositionPrices(positionIds: [ID!]): Boolean!

  # Redemption Operations
  createRedemptionOrder(request: RedemptionRequestInput!): RedemptionResult!
  redeemPosition(positionId: ID!, amount: Float): RedemptionResult!

  # Portfolio Management
  updatePortfolioSettings(settings: PortfolioSettingsInput!): Boolean!
}

extend type Subscription {
  # Real-time Position Updates
  positionUpdates(walletAddress: String!): UserPosition
  portfolioUpdates(walletAddress: String!): PortfolioSummary
  priceUpdates(mints: [String!]!): PriceData

  # Redemption Updates
  redemptionUpdates(walletAddress: String!): RedemptionResult
}

# ==============================================================================
# POSITION TYPES
# ==============================================================================

type UserPosition {
  id: ID!
  userId: String!
  walletAddress: String!

  # Token Information
  mint: String!
  balance: Float!
  balanceRaw: String!
  decimals: Int!

  # Market Information
  marketId: String!
  marketTitle: String!
  outcome: OutcomeType!
  baseMint: String!

  # Position Metrics
  entryPrice: Float!
  currentPrice: Float!
  marketPrice: Float!
  estimatedValue: Float!
  unrealizedPnL: Float!
  unrealizedPnLPercent: Float!

  # Status
  marketStatus: MarketStatus!
  isRedeemable: Boolean!
  positionType: PositionType!

  # Risk & Performance
  costBasis: Float!
  riskLevel: RiskLevel!
  daysHeld: Int!

  # Timestamps
  createdAt: DateTime!
  lastUpdated: DateTime!
  lastPriceUpdate: DateTime!
}

type PortfolioSummary {
  # Basic Metrics
  totalPositions: Int!
  activePositions: Int!
  resolvedPositions: Int!

  # Value Metrics
  totalValue: Float!
  totalCostBasis: Float!
  availableBalance: Float!

  # P&L Metrics
  totalUnrealizedPnL: Float!
  totalRealizedPnL: Float!
  netPnL: Float!
  portfolioReturn: Float!

  # Redeemable
  redeemablePositions: Int!
  redeemableValue: Float!

  # Performance
  winRate: Float!
  averagePositionSize: Float!
  largestPosition: Float!
  averageHoldingPeriod: Float!

  # Risk
  portfolioRisk: RiskLevel!
  diversificationScore: Float!

  # Time-based
  dailyPnL: Float!
  weeklyPnL: Float!
  monthlyPnL: Float!
}

type RedemptionResult {
  success: Boolean!
  transactionSignature: String
  amountRedeemed: Float
  amountReceived: Float
  error: TradingError
}

type RefreshResult {
  success: Boolean!
  positionsFound: Int!
  positionsUpdated: Int!
  errors: [String!]
  lastRefresh: DateTime!
}

# ==============================================================================
# INPUT TYPES
# ==============================================================================

input RedemptionRequestInput {
  positionId: ID!
  amount: Float
  slippageBps: Int
  userPublicKey: String!
}

input PortfolioSettingsInput {
  walletAddress: String!
  autoRefreshInterval: Int
  priceAlerts: Boolean
  emailNotifications: Boolean
}

# ==============================================================================
# ENUMS
# ==============================================================================

enum OutcomeType {
  YES
  NO
}

enum MarketStatus {
  ACTIVE
  RESOLVED
  SETTLED
  CANCELLED
}

enum PositionType {
  PREDICTION
  BINARY
  CATEGORICAL
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}
```

## Database Schema Design

### Core Tables

```sql
-- ==============================================================================
-- USER POSITIONS TABLE
-- ==============================================================================

CREATE TABLE user_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,

    -- Token Information
    mint VARCHAR(44) NOT NULL,
    balance DECIMAL(20,9) NOT NULL,
    balance_raw VARCHAR(100) NOT NULL,
    decimals SMALLINT NOT NULL,

    -- Market Information
    market_id VARCHAR(100) NOT NULL,
    market_title TEXT NOT NULL,
    outcome VARCHAR(3) NOT NULL CHECK (outcome IN ('YES', 'NO')),
    base_mint VARCHAR(44) NOT NULL,

    -- Position Metrics
    entry_price DECIMAL(20,6),
    current_price DECIMAL(20,6),
    market_price DECIMAL(20,6),
    estimated_value DECIMAL(20,6),
    unrealized_pnl DECIMAL(20,6),
    unrealized_pnl_percent DECIMAL(8,4),

    -- Status
    market_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_redeemable BOOLEAN DEFAULT FALSE,
    position_type VARCHAR(20) DEFAULT 'PREDICTION',

    -- Risk & Performance
    cost_basis DECIMAL(20,6),
    risk_level VARCHAR(10) DEFAULT 'MEDIUM',
    days_held INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_price_update TIMESTAMP,

    -- Constraints
    UNIQUE(wallet_address, mint),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_positions_wallet ON user_positions(wallet_address);
CREATE INDEX idx_user_positions_market ON user_positions(market_id);
CREATE INDEX idx_user_positions_status ON user_positions(market_status);
CREATE INDEX idx_user_positions_redeemable ON user_positions(is_redeemable) WHERE is_redeemable = true;

-- ==============================================================================
-- POSITION TRADES TABLE (History)
-- ==============================================================================

CREATE TABLE position_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES user_positions(id) ON DELETE CASCADE,
    transaction_signature VARCHAR(88) NOT NULL,

    -- Trade Information
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('BUY', 'SELL', 'REDEMPTION')),
    amount DECIMAL(20,9) NOT NULL,
    price DECIMAL(20,6) NOT NULL,
    fee DECIMAL(20,6) DEFAULT 0,

    -- Order Information
    order_id VARCHAR(100),
    execution_mode VARCHAR(10) DEFAULT 'SYNC',
    slippage_bps INTEGER DEFAULT 0,
    price_impact DECIMAL(8,4),

    -- Timestamps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_position_trades_position ON position_trades(position_id);
CREATE INDEX idx_position_trades_timestamp ON position_trades(timestamp);
CREATE INDEX idx_position_trades_signature ON position_trades(transaction_signature);

-- ==============================================================================
-- PORTFOLIO HISTORY TABLE
-- ==============================================================================

CREATE TABLE portfolio_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL,

    -- Daily Snapshot
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(20,6) NOT NULL,
    daily_pnl DECIMAL(20,6) DEFAULT 0,
    cumulative_pnl DECIMAL(20,6) DEFAULT 0,
    position_count INTEGER DEFAULT 0,
    net_deposits DECIMAL(20,6) DEFAULT 0,

    -- Performance Metrics
    win_rate DECIMAL(5,2),
    portfolio_return DECIMAL(8,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(wallet_address, snapshot_date)
);

CREATE INDEX idx_portfolio_history_wallet_date ON portfolio_history(wallet_address, snapshot_date);

-- ==============================================================================
-- REDEMPTION HISTORY TABLE
-- ==============================================================================

CREATE TABLE redemption_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES user_positions(id),
    transaction_signature VARCHAR(88) NOT NULL,

    -- Redemption Details
    amount_redeemed DECIMAL(20,9) NOT NULL,
    amount_received DECIMAL(20,6) NOT NULL,
    profit_loss DECIMAL(20,6),

    -- Dates
    redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    market_resolution_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_redemption_history_position ON redemption_history(position_id);
CREATE INDEX idx_redemption_history_date ON redemption_history(redemption_date);

-- ==============================================================================
-- PRICE CACHE TABLE
-- ==============================================================================

CREATE TABLE price_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id VARCHAR(100) NOT NULL,
    outcome VARCHAR(3) NOT NULL,

    -- Price Data
    current_price DECIMAL(20,6) NOT NULL,
    price_change_24h DECIMAL(20,6) DEFAULT 0,
    price_change_percent_24h DECIMAL(8,4) DEFAULT 0,
    volume_24h DECIMAL(20,6) DEFAULT 0,

    -- Cache Metadata
    source VARCHAR(20) DEFAULT 'DFLOW_API',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    -- Constraints
    UNIQUE(market_id, outcome)
);

CREATE INDEX idx_price_cache_market ON price_cache(market_id);
CREATE INDEX idx_price_cache_expires ON price_cache(expires_at);
```

## Service Architecture Design

### Position Tracking Service

```typescript
interface PositionTrackingService {
  // Core Position Operations
  fetchUserPositions(walletAddress: string): Promise<UserPosition[]>;
  calculatePositionMetrics(
    position: UserPosition,
    marketData: any
  ): Promise<UserPosition>;
  refreshPositionPrices(positions: UserPosition[]): Promise<UserPosition[]>;

  // Portfolio Operations
  calculatePortfolioSummary(
    positions: UserPosition[]
  ): Promise<PortfolioSummary>;
  updatePortfolioHistory(walletAddress: string): Promise<void>;

  // Position Discovery
  discoverNewPositions(walletAddress: string): Promise<UserPosition[]>;
  syncWithTokenAccounts(walletAddress: string): Promise<SyncResult>;

  // Price Management
  updatePriceCache(marketIds: string[]): Promise<void>;
  subscribeToPriceUpdates(marketIds: string[]): Promise<void>;
}

interface RedemptionService {
  // Redemption Operations
  createRedemptionOrder(request: RedemptionRequest): Promise<RedemptionResult>;
  redeemPosition(
    positionId: string,
    amount?: number
  ): Promise<RedemptionResult>;
  checkRedemptionStatus(
    transactionSignature: string
  ): Promise<RedemptionResult>;

  // Redemption Analysis
  getRedeemablePositions(walletAddress: string): Promise<UserPosition[]>;
  calculateRedemptionValue(position: UserPosition): Promise<number>;
  estimateRedemptionFees(position: UserPosition): Promise<number>;
}
```

### Caching Strategy

```typescript
interface PositionCacheManager {
  // Position Caching
  getCachedPositions(walletAddress: string): Promise<UserPosition[] | null>;
  setCachedPositions(
    walletAddress: string,
    positions: UserPosition[]
  ): Promise<void>;
  invalidatePositionCache(walletAddress: string): Promise<void>;

  // Price Caching
  getCachedPrices(marketIds: string[]): Promise<Map<string, PriceData>>;
  setCachedPrices(prices: Map<string, PriceData>): Promise<void>;

  // Cache Management
  cleanExpiredCache(): Promise<void>;
  getCacheStats(): Promise<CacheStats>;
}

interface CacheConfig {
  positionTTL: number; // 5 minutes
  priceTTL: number; // 30 seconds
  portfolioTTL: number; // 1 minute
  maxCacheSize: number; // 10MB
}
```

## Performance Optimization

### Query Optimization

```typescript
// Batch operations for efficiency
interface BatchOperations {
  batchFetchPositions(
    walletAddresses: string[]
  ): Promise<Map<string, UserPosition[]>>;
  batchUpdatePrices(marketIds: string[]): Promise<Map<string, PriceData>>;
  batchCalculatePortfolios(
    walletAddresses: string[]
  ): Promise<Map<string, PortfolioSummary>>;
}

// Database query optimization
const OPTIMIZED_QUERIES = {
  userPositionsWithPrices: `
    SELECT p.*, pc.current_price, pc.price_change_24h
    FROM user_positions p
    LEFT JOIN price_cache pc ON p.market_id = pc.market_id AND p.outcome = pc.outcome
    WHERE p.wallet_address = $1 AND p.balance > 0
    ORDER BY p.estimated_value DESC
  `,

  portfolioSummary: `
    SELECT 
      COUNT(*) as total_positions,
      COUNT(*) FILTER (WHERE market_status = 'ACTIVE') as active_positions,
      SUM(estimated_value) as total_value,
      SUM(unrealized_pnl) as total_unrealized_pnl,
      AVG(CASE WHEN unrealized_pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate
    FROM user_positions 
    WHERE wallet_address = $1 AND balance > 0
  `,
};
```

### Real-time Update Strategy

```typescript
interface RealTimeUpdateManager {
  // WebSocket Subscriptions
  subscribeToPositionUpdates(walletAddress: string): Promise<Subscription>;
  subscribeToPortfolioUpdates(walletAddress: string): Promise<Subscription>;
  subscribeToPriceUpdates(marketIds: string[]): Promise<Subscription>;

  // Update Broadcasting
  broadcastPositionUpdate(position: UserPosition): Promise<void>;
  broadcastPortfolioUpdate(summary: PortfolioSummary): Promise<void>;

  // Connection Management
  handleConnectionLoss(): Promise<void>;
  reconnectSubscriptions(): Promise<void>;
}
```

## Error Handling & Validation

### Error Types

```typescript
enum PositionErrorCode {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  POSITION_NOT_FOUND = 'POSITION_NOT_FOUND',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  PRICE_DATA_UNAVAILABLE = 'PRICE_DATA_UNAVAILABLE',
  REDEMPTION_FAILED = 'REDEMPTION_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

interface PositionError extends Error {
  code: PositionErrorCode;
  walletAddress?: string;
  positionId?: string;
  marketId?: string;
  details?: any;
  retryable: boolean;
}
```

### Validation Schema

```typescript
// Input validation schemas
const PositionValidationSchema = {
  walletAddress: {
    type: 'string',
    pattern: '^[A-Za-z0-9]{32,44}$',
    required: true,
  },
  mint: {
    type: 'string',
    pattern: '^[A-Za-z0-9]{32,44}$',
    required: true,
  },
  balance: {
    type: 'number',
    minimum: 0,
    required: true,
  },
};
```

---

**Data Design Status**: ✅ **COMPLETE**  
**Next Phase**: Implementation (Day 3+)  
**Key Deliverables**: Complete data structures, GraphQL schema, database design, service architecture

**Date**: January 28, 2026  
**Completed By**: Development Team
