# Sprint 2: Data Design Phase

## Overview

**Phase**: Data Design (Day 1-2)  
**Sprint**: Sprint 2 - Trading Integration  
**Date**: January 27, 2026

Based on reference analysis, this document defines all TypeScript interfaces, GraphQL schemas, and API contracts required for trading integration.

## TypeScript Interfaces

### Core Trading Interfaces

```typescript
// ==============================================================================
// QUOTE INTERFACES
// ==============================================================================

interface DFlowQuoteRequest {
  inputMint: string; // Token mint address (e.g., USDC)
  outputMint: string; // Target token mint (e.g., YES token)
  amount: string; // Amount in micro units (string for precision)
  slippageBps: number; // Slippage tolerance in basis points
  userPublicKey: string; // User's wallet public key
}

interface DFlowQuoteResponse {
  inputMint: string;
  inAmount: string; // Actual input amount (micro units)
  outputMint: string;
  outAmount: string; // Expected output amount (micro units)
  otherAmountThreshold: string; // Minimum acceptable output
  minOutAmount: string; // Absolute minimum output
  slippageBps: number; // Actual slippage applied
  predictionMarketSlippageBps: number; // Market-specific slippage
  platformFee: string | null; // Platform fee amount
  priceImpactPct: string; // Price impact percentage
  contextSlot: number; // Solana slot context
  executionMode: ExecutionMode; // 'sync' | 'async'
  revertMint: string; // Fallback mint
  transaction: string; // Base64 encoded transaction
  lastValidBlockHeight: number; // Transaction expiry
  prioritizationFeeLamports: number; // Priority fee
  computeUnitLimit: number; // Compute budget
  prioritizationType?: {
    computeBudget: {
      microLamports: number;
      estimatedMicroLamports: number;
    };
  };
}

// ==============================================================================
// ORDER INTERFACES
// ==============================================================================

interface DFlowOrderRequest extends DFlowQuoteRequest {
  // Same as quote request - order creation uses same params
}

interface DFlowOrderResponse extends DFlowQuoteResponse {
  // Same as quote response - includes transaction to sign
}

interface DFlowOrderStatus {
  signature: string;
  status: OrderStatus;
  fills: DFlowOrderFill[];
  timestamp: string;
  error?: string;
}

interface DFlowOrderFill {
  fillId: string;
  inputAmount: string; // Amount of input token filled
  outputAmount: string; // Amount of output token received
  price: string; // Execution price
  timestamp: string; // Fill timestamp
  transactionSignature?: string;
}

// ==============================================================================
// TRADING OPERATION INTERFACES
// ==============================================================================

interface TradeRequest {
  market: string; // Market identifier (ticker or ID)
  outcome: OutcomeType; // 'YES' | 'NO'
  direction: TradeDirection; // 'BUY' | 'SELL'
  amount: number; // Human-readable amount (USDC)
  slippageBps: number; // Slippage tolerance
  userPublicKey: string; // User's wallet address
}

interface TradeResponse {
  success: boolean;
  signature?: string; // Transaction signature if successful
  quote?: DFlowQuoteResponse; // Quote used for trade
  error?: TradingError; // Error details if failed
  estimatedGas?: number; // Gas estimate
}

// ==============================================================================
// WALLET INTERFACES
// ==============================================================================

interface WalletConnection {
  publicKey: string; // Base58 encoded public key
  connected: boolean; // Connection status
  wallet?: {
    adapter: string; // Wallet adapter name (Phantom, Solflare, etc.)
    name: string; // Display name
    icon: string; // Icon URL
  };
}

interface TokenBalance {
  mint: string; // Token mint address
  balance: string; // Balance in micro units
  decimals: number; // Token decimals
  symbol?: string; // Token symbol (USDC, YES, NO)
  name?: string; // Token name
}

interface WalletBalances {
  publicKey: string;
  balances: TokenBalance[];
  totalUsdValue?: number; // Total portfolio value in USD
}

// ==============================================================================
// TRANSACTION INTERFACES
// ==============================================================================

interface TransactionRequest {
  transaction: string; // Base64 encoded transaction
  signature?: string; // Pre-computed signature
}

interface TransactionResponse {
  signature: string; // Transaction signature
  status: TransactionStatus;
  slot?: number; // Confirmation slot
  error?: string; // Error message if failed
}

interface TransactionResult {
  signature: string;
  confirmed: boolean;
  slot?: number;
  error?: string;
  logs?: string[]; // Transaction logs
}

// ==============================================================================
// MARKET DATA INTERFACES
// ==============================================================================

interface MarketMints {
  baseMint: string; // USDC mint
  yesMint: string; // YES token mint
  noMint: string; // NO token mint
  marketId: string; // Market identifier
}

interface MarketQuote {
  marketId: string;
  yesPrice: number; // YES token price (0-1)
  noPrice: number; // NO token price (0-1)
  volume24h: number; // 24h volume in USDC
  liquidity: number; // Available liquidity
  lastUpdate: string; // Last price update
}

// ==============================================================================
// ERROR INTERFACES
// ==============================================================================

interface TradingError {
  code: TradingErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: any;
}

// ==============================================================================
// ENUMS
// ==============================================================================

enum ExecutionMode {
  SYNC = 'sync',
  ASYNC = 'async',
}

enum OrderStatus {
  OPEN = 'open',
  PENDING_CLOSE = 'pendingClose',
  CLOSED = 'closed',
  FAILED = 'failed',
}

enum OutcomeType {
  YES = 'YES',
  NO = 'NO',
}

enum TradeDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

enum TradingErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_MARKET = 'INVALID_MARKET',
  API_ERROR = 'API_ERROR',
}

// ==============================================================================
// UTILITY TYPES
// ==============================================================================

type MarketIdentifier = string; // ticker or mint address
type WalletAddress = string; // Base58 encoded
type TokenMint = string; // Token mint address
type MicroAmount = string; // Amount in micro units (for precision)
type Signature = string; // Transaction signature

// ==============================================================================
// CONFIGURATION INTERFACES
// ==============================================================================

interface TradingConfig {
  defaultSlippageBps: number; // Default slippage (100 = 1%)
  maxSlippageBps: number; // Maximum allowed slippage
  quoteRefreshIntervalMs: number; // Quote refresh rate
  statusPollIntervalMs: number; // Status polling rate
  transactionTimeoutMs: number; // Transaction timeout
  retryAttempts: number; // Retry attempts for failed operations
}

interface NetworkConfig {
  rpcUrl: string; // Solana RPC endpoint
  commitment: 'processed' | 'confirmed' | 'finalized';
  network: 'mainnet-beta' | 'devnet' | 'testnet';
}
```

## GraphQL Schema Extensions

```graphql
# ==============================================================================
# INPUT TYPES
# ==============================================================================

input DFlowQuoteRequestInput {
  inputMint: String!
  outputMint: String!
  amount: String!
  slippageBps: Int!
  userPublicKey: String!
}

input DFlowTradeRequestInput {
  market: String!
  outcome: OutcomeType!
  direction: TradeDirection!
  amount: Float!
  slippageBps: Int!
  userPublicKey: String!
}

input TransactionRequestInput {
  transaction: String!
  signature: String
}

# ==============================================================================
# RESPONSE TYPES
# ==============================================================================

type DFlowQuoteResponse {
  inputMint: String!
  inAmount: String!
  outputMint: String!
  outAmount: String!
  otherAmountThreshold: String!
  minOutAmount: String!
  slippageBps: Int!
  predictionMarketSlippageBps: Int!
  platformFee: String
  priceImpactPct: String!
  contextSlot: Int!
  executionMode: ExecutionMode!
  revertMint: String!
  transaction: String!
  lastValidBlockHeight: Int!
  prioritizationFeeLamports: Int!
  computeUnitLimit: Int!
}

type DFlowOrderStatus {
  signature: String!
  status: OrderStatus!
  fills: [DFlowOrderFill!]!
  timestamp: String!
  error: String
}

type DFlowOrderFill {
  fillId: String!
  inputAmount: String!
  outputAmount: String!
  price: String!
  timestamp: String!
  transactionSignature: String
}

type TradeResponse {
  success: Boolean!
  signature: String
  quote: DFlowQuoteResponse
  error: TradingError
  estimatedGas: Int
}

type WalletConnection {
  publicKey: String!
  connected: Boolean!
  wallet: WalletInfo
}

type WalletInfo {
  adapter: String!
  name: String!
  icon: String!
}

type TokenBalance {
  mint: String!
  balance: String!
  decimals: Int!
  symbol: String
  name: String
}

type WalletBalances {
  publicKey: String!
  balances: [TokenBalance!]!
  totalUsdValue: Float
}

type TransactionResponse {
  signature: String!
  status: TransactionStatus!
  slot: Int
  error: String
}

type MarketMints {
  baseMint: String!
  yesMint: String!
  noMint: String!
  marketId: String!
}

type MarketQuote {
  marketId: String!
  yesPrice: Float!
  noPrice: Float!
  volume24h: Float!
  liquidity: Float!
  lastUpdate: String!
}

type TradingError {
  code: TradingErrorCode!
  message: String!
  details: String
  timestamp: String!
}

# ==============================================================================
# ENUMS
# ==============================================================================

enum ExecutionMode {
  SYNC
  ASYNC
}

enum OrderStatus {
  OPEN
  PENDING_CLOSE
  CLOSED
  FAILED
}

enum OutcomeType {
  YES
  NO
}

enum TradeDirection {
  BUY
  SELL
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
  EXPIRED
}

enum TradingErrorCode {
  WALLET_NOT_CONNECTED
  INSUFFICIENT_BALANCE
  SLIPPAGE_EXCEEDED
  TRANSACTION_FAILED
  NETWORK_ERROR
  INVALID_MARKET
  API_ERROR
}

# ==============================================================================
# QUERIES
# ==============================================================================

extend type Query {
  # Get quote for a trade
  getDFlowQuote(request: DFlowQuoteRequestInput!): DFlowQuoteResponse!

  # Get order status by signature
  dflowOrderStatus(signature: String!): DFlowOrderStatus

  # Get wallet balances
  dflowWalletBalances(publicKey: String!): WalletBalances!

  # Get market mints for trading
  dflowMarketMints(marketId: String!): MarketMints!

  # Get current market quotes
  dflowMarketQuote(marketId: String!): MarketQuote!
}

# ==============================================================================
# MUTATIONS
# ==============================================================================

extend type Mutation {
  # Execute a trade (creates order and returns transaction to sign)
  executeDFlowTrade(request: DFlowTradeRequestInput!): TradeResponse!

  # Submit signed transaction to network
  submitDFlowTransaction(
    request: TransactionRequestInput!
  ): TransactionResponse!

  # Cancel an open order
  cancelDFlowOrder(signature: String!): Boolean!
}

# ==============================================================================
# SUBSCRIPTIONS (Future)
# ==============================================================================

extend type Subscription {
  # Subscribe to order status updates
  orderStatusUpdates(signature: String!): DFlowOrderStatus!

  # Subscribe to market quote updates
  marketQuoteUpdates(marketId: String!): MarketQuote!
}
```

## API Endpoint Contracts

### DFlow Trading API Endpoints

```typescript
// ==============================================================================
// QUOTE ENDPOINT
// ==============================================================================

GET /quote
Request: DFlowQuoteRequest
Response: DFlowQuoteResponse
Errors: 400 (Invalid request), 429 (Rate limit), 500 (Server error)

// ==============================================================================
// ORDER CREATION ENDPOINT
// ==============================================================================

GET /order

GET /api/v1/order-status?signature={signature}
Response: DFlowOrderStatus
Errors: 404 (Order not found), 429 (Rate limit)

// ==============================================================================
// MARKET MINTS ENDPOINT
// ==============================================================================

GET /api/v1/market-mints?market={marketId}
Response: MarketMints
Errors: 404 (Market not found), 429 (Rate limit)
```

## Service Architecture Design

### Backend Services

```typescript
// ==============================================================================
// DFLOW TRADING SERVICE
// ==============================================================================

@Injectable()
export class DFlowTradingService {
  // Get quote for a trade
  async getQuote(request: DFlowQuoteRequest): Promise<DFlowQuoteResponse>;

  // Create order (same as quote but committed)
  async createOrder(request: DFlowOrderRequest): Promise<DFlowOrderResponse>;

  // Get order status
  async getOrderStatus(signature: string): Promise<DFlowOrderStatus>;

  // Get market mints for trading
  async getMarketMints(marketId: string): Promise<MarketMints>;

  // Get current market quote/pricing
  async getMarketQuote(marketId: string): Promise<MarketQuote>;
}

// ==============================================================================
// WALLET SERVICE
// ==============================================================================

@Injectable()
export class WalletService {
  // Get token balances for a wallet
  async getBalances(publicKey: string): Promise<TokenBalance[]>;

  // Get specific token balance
  async getTokenBalance(publicKey: string, mint: string): Promise<TokenBalance>;

  // Validate wallet address
  validateAddress(address: string): boolean;
}

// ==============================================================================
// TRANSACTION SERVICE
// ==============================================================================

@Injectable()
export class TransactionService {
  // Submit transaction to Solana network
  async submitTransaction(transaction: string): Promise<TransactionResponse>;

  // Monitor transaction status
  async getTransactionStatus(signature: string): Promise<TransactionResult>;

  // Confirm transaction with retries
  async confirmTransaction(signature: string): Promise<boolean>;
}
```

## Data Flow Design

### Trading Flow Data Flow

```
1. User Input → TradeRequest
2. TradeRequest → DFlowQuoteRequest (via service transformation)
3. DFlowQuoteRequest → DFlow API → DFlowQuoteResponse
4. User Confirmation → DFlowOrderRequest (same as quote)
5. DFlowOrderRequest → DFlow API → DFlowOrderResponse (with transaction)
6. Transaction → Wallet Signing → Signed Transaction
7. Signed Transaction → Solana Network → Transaction Signature
8. Signature → Status Monitoring → Order Status Updates
```

### Error Flow Design

```
API Error → TradingError → GraphQL Error → Frontend Error Display
Network Error → Retry Logic → Fallback Response
Validation Error → Input Validation → User Feedback
```

## Database Schema Design

```sql
-- ==============================================================================
-- USER TRADES TABLE
-- ==============================================================================

CREATE TABLE user_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(44) NOT NULL,
  signature VARCHAR(88) NOT NULL UNIQUE,
  market_id VARCHAR(255) NOT NULL,
  outcome_type VARCHAR(3) NOT NULL CHECK (outcome_type IN ('YES', 'NO')),
  direction VARCHAR(4) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
  amount_usdc DECIMAL(15,6) NOT NULL,
  amount_tokens DECIMAL(18,6) NOT NULL,
  slippage_bps INTEGER NOT NULL,
  price_impact_pct DECIMAL(10,8),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  execution_mode VARCHAR(10) NOT NULL CHECK (execution_mode IN ('sync', 'async')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  -- Indexes
  INDEX idx_user_trades_wallet (user_wallet),
  INDEX idx_user_trades_signature (signature),
  INDEX idx_user_trades_market (market_id),
  INDEX idx_user_trades_status (status),
  INDEX idx_user_trades_created (created_at DESC)
);

-- ==============================================================================
-- ORDER STATUS LOGS TABLE
-- ==============================================================================

CREATE TABLE order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature VARCHAR(88) NOT NULL,
  status VARCHAR(20) NOT NULL,
  fills JSONB DEFAULT '[]',
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_order_status_signature (signature),
  INDEX idx_order_status_timestamp (timestamp DESC)
);

-- ==============================================================================
-- MARKET MINTS CACHE TABLE
-- ==============================================================================

CREATE TABLE market_mints_cache (
  market_id VARCHAR(255) PRIMARY KEY,
  base_mint VARCHAR(44) NOT NULL,
  yes_mint VARCHAR(44) NOT NULL,
  no_mint VARCHAR(44) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_market_mints_updated (last_updated)
);
```

## Validation Strategy

### Input Validation

```typescript
// ==============================================================================
// TRADE REQUEST VALIDATION
// ==============================================================================

const validateTradeRequest = (request: TradeRequest): ValidationResult => {
  const errors: string[] = [];

  // Validate market ID
  if (!request.market || request.market.length === 0) {
    errors.push('Market ID is required');
  }

  // Validate amount
  if (request.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  // Validate slippage
  if (request.slippageBps < 1 || request.slippageBps > 5000) {
    errors.push('Slippage must be between 0.01% and 50%');
  }

  // Validate wallet address
  if (!validateSolanaAddress(request.userPublicKey)) {
    errors.push('Invalid wallet address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

## Next Steps (Implementation Phase)

With data design complete, we can now proceed to implementation:

1. **Create TypeScript interfaces** in shared types
2. **Extend GraphQL schema** with trading types
3. **Implement backend services** following defined contracts
4. **Create frontend components** using defined interfaces
5. **Implement wallet integration** with Solana adapters

---

**Data Design Phase Complete** ✅  
**All interfaces, schemas, and contracts defined**  
**Ready for Implementation Phase**  
**Design Date**: January 27, 2026
