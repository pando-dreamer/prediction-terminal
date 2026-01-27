# Sprint 2: Trading Integration - PLANNING

## Sprint Information

**Sprint Number**: Sprint 2  
**Duration**: January 27, 2026 to February 9, 2026 (2 weeks)  
**Sprint Goal**: Enable users to execute real prediction market trades through DFlow API  
**Status**: **PLANNING** 📋

## Team Capacity

**Available Working Days**: 10 days (2 weeks)  
**Estimated Velocity**: 25 story points  
**Focus Factor**: 0.8 (higher than Sprint 1 due to established patterns)

## Sprint Goal Alignment

> **Primary Goal**: Successfully integrate DFlow Trading API to enable users to buy and sell YES/NO tokens in prediction markets with real wallet transactions.

**Success Criteria:**

- [ ] Users can connect their Solana wallet to the application
- [ ] Users can get real-time quotes for YES/NO token trades
- [ ] Users can execute buy orders for prediction market outcomes
- [ ] Users can execute sell orders for prediction market outcomes
- [ ] Order status monitoring works for both sync and async execution modes
- [ ] Transaction signing and submission to Solana blockchain works
- [ ] Error handling covers all trading failure scenarios
- [ ] Foundation set for position tracking in Sprint 3

## Sprint Startup Rules ⚠️ **NEW PROCESS**

**Before any implementation work begins:**

1. **Reference Analysis Phase** (Day 1)
   - Review all provided references (#sym:trade, response examples)
   - Analyze existing DFlow API patterns and responses
   - Document current API capabilities and limitations

2. **Data Design Phase** (Day 1-2) 
   - Design TypeScript interfaces for all trading data structures
   - Define GraphQL schema extensions for trading operations  
   - Create API endpoint specifications
   - Validate data flows end-to-end

3. **Implementation Phase** (Day 3+)
   - Begin coding only after data types and APIs are approved
   - Follow established patterns from Sprint 1
   - Maintain consistent error handling and caching patterns

**This rule applies to ALL future sprints - no coding without proper design phase.**

## Sprint Backlog

### Selected User Stories

| Story ID | Title | Story Points | Priority | Status | DFlow API |
|----------|-------|--------------|----------|--------|-----------|
| US-007 | Connect Solana wallet for trading | 5 | High | 📋 Planning | Authentication |
| US-008 | Get real-time trading quotes | 4 | High | 📋 Planning | Quote API |
| US-009 | Execute buy orders for YES/NO tokens | 8 | High | 📋 Planning | Create Order API |
| US-010 | Execute sell orders for prediction markets | 6 | High | 📋 Planning | Create Order API |
| US-011 | Monitor order execution status | 2 | High | 📋 Planning | Order Status API |

**Total Story Points**: 25  
**Velocity Alignment**: Slightly above Sprint 1 capacity due to experience gained ✅

## Reference Analysis (Pre-Implementation)

### DFlow Trading Flow Reference Analysis

Based on `#sym:trade` and response `#file:order-prediction-JDJxu7NWnJHckdDPcbuxzokGUQg82RGaJNWpVBrzv8dM.json`:

#### Key Trading Components Identified:

1. **Create Order Flow**:
   ```typescript
   createOrder(publicKey, inputMint, outputMint, amount, slippageBps)
   ```

2. **Transaction Handling**:
   - Deserialize base64 transaction
   - Sign with user's keypair
   - Send to Solana network
   - Handle both sync/async execution modes

3. **Order Status Monitoring**:
   ```typescript
   getOrderStatus(signature) // Returns: status, fills[]
   ```

4. **Order Status Types**:
   - `open` - Order is active and unfilled
   - `pendingClose` - Order ready to close
   - `closed` - Order completed
   - `failed` - Order execution failed

#### API Response Structure Analysis:

```json
{
  "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "outputMint": "GNr3UXmnwokHCBwpe2QWC9qr3M8v3mTjoAUQj6TVTbyP", // YES token
  "inAmount": "999904794", // USDC amount (micro units)
  "outAmount": "1454000000", // Expected tokens out
  "slippageBps": 418, // Actual slippage
  "priceImpactPct": "0.003344303570360624364571497",
  "executionMode": "async", // or "sync"
  "transaction": "base64EncodedTransaction"
}
```

## Data Type Design (Required Before Implementation)

### TypeScript Interfaces

```typescript
// Core trading interfaces
interface DFlowQuoteRequest {
  inputMint: string;
  outputMint: string; 
  amount: string; // In micro units
  slippageBps: number;
  userPublicKey: string;
}

interface DFlowQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  minOutAmount: string;
  slippageBps: number;
  predictionMarketSlippageBps: number;
  priceImpactPct: string;
  contextSlot: number;
  executionMode: 'sync' | 'async';
  revertMint: string;
  transaction: string; // base64
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
}

interface DFlowOrderStatus {
  status: 'open' | 'pendingClose' | 'closed' | 'failed';
  fills: DFlowOrderFill[];
  signature: string;
  timestamp: string;
}

interface DFlowOrderFill {
  fillId: string;
  inputAmount: string;
  outputAmount: string;
  price: string;
  timestamp: string;
}

// Trading operation types
type TradeDirection = 'BUY' | 'SELL';
type OutcomeType = 'YES' | 'NO';

interface TradeParams {
  market: string; // Event ticker or market ID
  outcome: OutcomeType;
  direction: TradeDirection;
  amount: number; // In USDC (human readable)
  slippageBps: number;
  userPublicKey: string;
}
```

### GraphQL Schema Extensions

```graphql
# Trading mutations and queries
type Mutation {
  getDFlowQuote(request: DFlowQuoteRequestInput!): DFlowQuoteResponse!
  executeDFlowTrade(request: DFlowTradeRequestInput!): DFlowTradeResponse!
  submitDFlowTransaction(
    signature: String!
    transaction: String!
  ): DFlowTransactionResponse!
}

type Query {
  dflowOrderStatus(signature: String!): DFlowOrderStatus
  dflowWalletBalance(publicKey: String!): DFlowWalletBalance!
}

# Input types
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

# Response types
type DFlowQuoteResponse {
  inputMint: String!
  inAmount: String!
  outputMint: String!
  outAmount: String!
  slippageBps: Int!
  priceImpactPct: String!
  executionMode: ExecutionMode!
  transaction: String!
  estimatedGas: Int!
}

type DFlowTradeResponse {
  success: Boolean!
  signature: String
  error: String
  quote: DFlowQuoteResponse
}

enum OutcomeType {
  YES
  NO
}

enum TradeDirection {
  BUY
  SELL  
}

enum ExecutionMode {
  SYNC
  ASYNC
}
```

## Detailed Story Breakdown

### US-007: Connect Solana wallet for trading (5 SP)

**Description**: Implement wallet connection functionality for trading operations

**Acceptance Criteria:**

- [ ] Users can connect popular Solana wallets (Phantom, Solflare, etc.)
- [ ] Wallet connection state is managed and persisted
- [ ] User's public key is available for trading operations
- [ ] Wallet balance (USDC) is displayed accurately
- [ ] Wallet disconnection works properly
- [ ] Error handling for wallet connection failures

**Tasks:**

- [ ] Install and configure Solana wallet adapter (3h)
- [ ] Create wallet connection UI components (4h)
- [ ] Implement wallet state management (2h)
- [ ] Add balance fetching functionality (2h)
- [ ] Create wallet disconnect functionality (1h)
- [ ] Add error handling and user feedback (2h)
- [ ] Write tests for wallet integration (3h)

**Technical Notes:**
- Use `@solana/wallet-adapter-react` for wallet integration
- Support multiple wallet types through adapter
- Store wallet state in React context
- Environment vars: `RPC_URL`, `NETWORK`

**Dependencies**: None

### US-008: Get real-time trading quotes (4 SP)

**Description**: Implement quote fetching for buy/sell operations

**Acceptance Criteria:**

- [ ] Users can get quotes for buying YES tokens with USDC
- [ ] Users can get quotes for buying NO tokens with USDC  
- [ ] Users can get quotes for selling YES/NO tokens for USDC
- [ ] Quotes show expected output amount and price impact
- [ ] Quotes include slippage tolerance settings
- [ ] Quote prices update automatically (every 30 seconds)
- [ ] Loading states and error handling for quote requests

**Tasks:**

- [ ] Create DFlow quote API integration (3h)
- [ ] Implement quote request service (2h)
- [ ] Add GraphQL resolver for quotes (2h)
- [ ] Create quote display UI components (3h)
- [ ] Add auto-refresh functionality (2h)
- [ ] Implement slippage tolerance settings (2h)
- [ ] Add comprehensive error handling (2h)

**Technical Notes:**
- Based on reference: `createOrder()` API call
- Quote endpoint: `/api/v1/quote` or similar
- Cache quotes for 30-60 seconds to reduce API calls
- Handle both BUY and SELL quote types

**Dependencies**: US-007 (wallet connection needed for quotes)

### US-009: Execute buy orders for YES/NO tokens (8 SP)

**Description**: Implement complete buy order execution flow

**Acceptance Criteria:**

- [ ] Users can buy YES tokens using USDC
- [ ] Users can buy NO tokens using USDC
- [ ] Transaction is properly signed by user's wallet
- [ ] Transaction is submitted to Solana network
- [ ] Both sync and async execution modes are supported
- [ ] Transaction status is tracked until completion
- [ ] Success/failure feedback is provided to user
- [ ] Gas fees and slippage are clearly displayed before execution

**Tasks:**

- [ ] Implement create order API integration (4h)
- [ ] Add transaction signing flow with wallet (4h)
- [ ] Create buy order UI components (5h)
- [ ] Implement transaction submission logic (3h)
- [ ] Add support for sync/async execution modes (3h)
- [ ] Create transaction status monitoring (4h)
- [ ] Add comprehensive error handling (3h)
- [ ] Implement success/failure user feedback (2h)
- [ ] Write integration tests (4h)

**Technical Notes:**
- Reference: `trade()` function flow in #sym:trade
- Handle VersionedTransaction deserialization and signing
- Monitor transaction confirmation on Solana
- API Response structure from #file:order-prediction example

**Dependencies**: US-007, US-008 (wallet and quotes needed)

### US-010: Execute sell orders for prediction markets (6 SP)

**Description**: Implement sell order execution for existing positions

**Acceptance Criteria:**

- [ ] Users can sell YES tokens for USDC
- [ ] Users can sell NO tokens for USDC
- [ ] Only allows selling tokens user actually owns
- [ ] Shows current holdings before sell confirmation
- [ ] Transaction flow matches buy order patterns
- [ ] Proper validation of sell amounts vs holdings
- [ ] Clear confirmation dialog before executing sells

**Tasks:**

- [ ] Implement token balance checking (3h)
- [ ] Create sell order API integration (3h)
- [ ] Build sell order UI components (4h)
- [ ] Add holdings validation logic (3h)
- [ ] Implement sell transaction flow (4h)
- [ ] Create sell confirmation dialogs (2h)
- [ ] Add error handling for insufficient balance (2h)
- [ ] Write tests for sell operations (3h)

**Technical Notes:**
- Requires checking user's token account balances
- Validate sell amount <= current holdings
- Same transaction flow as buy but different input/output mints
- May need position tracking from Sprint 3 scope

**Dependencies**: US-007, US-008, US-009 (builds on buy order implementation)

### US-011: Monitor order execution status (2 SP)

**Description**: Implement real-time order status monitoring

**Acceptance Criteria:**

- [ ] Order status is polled after transaction submission
- [ ] Status updates show: open, pendingClose, closed, failed
- [ ] Fill information is displayed when available
- [ ] Polling stops when order reaches final state
- [ ] User gets notifications for status changes
- [ ] Historical order status can be checked by signature

**Tasks:**

- [ ] Implement order status polling service (2h)
- [ ] Create status display UI components (2h)
- [ ] Add WebSocket connection for real-time updates (4h)
- [ ] Implement notification system (2h)
- [ ] Add order history functionality (3h)
- [ ] Create status monitoring tests (2h)

**Technical Notes:**
- Reference: `getOrderStatus()` in #sym:trade
- Poll every 2 seconds for active orders
- Stop polling when status is 'closed' or 'failed'
- Consider WebSocket for real-time updates

**Dependencies**: US-009 (needs order execution to monitor)

## API Integration Architecture

### DFlow Trading Service Extensions

```typescript
@Injectable()
export class DFlowTradingService {
  async getQuote(request: DFlowQuoteRequest): Promise<DFlowQuoteResponse>;
  async createOrder(request: DFlowQuoteRequest): Promise<DFlowQuoteResponse>;
  async getOrderStatus(signature: string): Promise<DFlowOrderStatus>;
  async getUserBalances(publicKey: string): Promise<TokenBalance[]>;
  async getMarketMints(marketId: string): Promise<MarketMints>;
}
```

### Wallet Integration Service

```typescript
@Injectable()
export class WalletService {
  async connectWallet(): Promise<WalletConnection>;
  async disconnectWallet(): Promise<void>;
  async getBalance(publicKey: string, mint: string): Promise<number>;
  async signTransaction(transaction: VersionedTransaction): Promise<Uint8Array>;
}
```

### Transaction Service

```typescript
@Injectable()
export class TransactionService {
  async submitTransaction(signedTransaction: Uint8Array): Promise<string>;
  async confirmTransaction(signature: string): Promise<TransactionStatus>;
  async monitorTransaction(signature: string): Promise<TransactionResult>;
}
```

## Risk Assessment

### Identified Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Wallet integration complexity | High | Medium | Use proven wallet adapter libraries, thorough testing |
| Transaction signing failures | High | Medium | Comprehensive error handling, fallback mechanisms |
| Network congestion affects trades | Medium | High | Implement proper retry logic, user communication |
| Slippage exceeding user tolerance | Medium | Medium | Clear slippage warnings, confirmation dialogs |
| Gas fee estimation inaccuracy | Low | Medium | Use latest priority fee recommendations |

### Dependencies

**External Dependencies:**
- [ ] Solana network stability and performance
- [ ] DFlow trading API availability and documentation  
- [ ] Wallet provider compatibility (Phantom, Solflare, etc.)
- [ ] RPC endpoint reliability

**Internal Dependencies:**
- [ ] Sprint 1 event/market discovery functionality working
- [ ] Environment configuration for trading APIs
- [ ] Database schema ready for storing trading data

## Technical Setup Required

### Environment Variables

```bash
# Add to .env.local
RPC_URL=https://api.mainnet-beta.solana.com
DFLOW_TRADE_API_URL=https://api.dflow.net
DFLOW_QUOTE_ENDPOINT=https://quote-api.dflow.net
NETWORK=mainnet-beta
COMMITMENT_LEVEL=confirmed

# Optional for testing
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
TEST_WALLET_PRIVATE_KEY=your-test-key-here
```

### New Dependencies

```bash
# Frontend dependencies  
pnpm add --filter @prediction-terminal/frontend @solana/web3.js
pnpm add --filter @prediction-terminal/frontend @solana/wallet-adapter-react
pnpm add --filter @prediction-terminal/frontend @solana/wallet-adapter-wallets
pnpm add --filter @prediction-terminal/frontend @solana/wallet-adapter-react-ui

# Backend dependencies
pnpm add --filter @prediction-terminal/backend @solana/web3.js
pnpm add --filter @prediction-terminal/backend bs58
```

### Database Extensions

```sql
-- Add tables for trading operations
CREATE TABLE user_trades (
  id UUID PRIMARY KEY,
  user_wallet VARCHAR(44) NOT NULL,
  signature VARCHAR(88) NOT NULL,
  market_id VARCHAR(255) NOT NULL,
  outcome_type VARCHAR(10) NOT NULL, -- YES/NO
  direction VARCHAR(10) NOT NULL, -- BUY/SELL
  amount_usdc DECIMAL(15,6) NOT NULL,
  amount_tokens DECIMAL(15,6) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending/completed/failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_logs (
  id UUID PRIMARY KEY,
  signature VARCHAR(88) NOT NULL,
  status VARCHAR(20) NOT NULL,
  fills JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_trades_wallet ON user_trades(user_wallet);
CREATE INDEX idx_user_trades_signature ON user_trades(signature);
CREATE INDEX idx_order_status_signature ON order_status_logs(signature);
```

## Definition of Ready Checklist

All stories in sprint backlog have:

- [x] Clear acceptance criteria defined with reference to actual API flows
- [x] Technical approach documented using provided references
- [x] DFlow Trading API endpoints identified and analyzed
- [x] TypeScript interfaces designed for all data structures  
- [x] GraphQL schema extensions specified
- [x] Effort estimated with story points based on complexity
- [x] Dependencies identified and manageable within sprint
- [x] Testable requirements specified

## Definition of Done Checklist

For each story to be considered complete:

- [ ] All acceptance criteria met and verified
- [ ] Code follows established patterns from Sprint 1
- [ ] TypeScript interfaces implemented as designed
- [ ] GraphQL resolvers working and tested
- [ ] Error handling covers all identified failure modes
- [ ] UI components responsive and accessible
- [ ] Integration tests passing
- [ ] Code formatted and builds successfully
- [ ] Documentation updated

## Sprint Ceremonies Schedule

**Daily Standups**: 9:00 AM daily  
**Mid-Sprint Review**: Day 5 - Review trading integration progress
**Sprint Review**: February 9, 2026 - Demo working trading functionality  
**Sprint Retrospective**: February 10, 2026 - Reflect on trading complexity
**Sprint 3 Planning**: February 11, 2026 - Plan position tracking sprint

## Success Metrics

**Primary Metrics:**
- [ ] All 5 user stories completed (25/25 story points)
- [ ] End-to-end trade execution working (buy/sell flow)
- [ ] Zero critical bugs in trading functionality
- [ ] Average trade completion time < 30 seconds

**Technical Metrics:**
- [ ] Wallet connection success rate > 95%
- [ ] Quote API response time < 2 seconds
- [ ] Transaction submission success rate > 90%
- [ ] Order status monitoring accuracy 100%

## Open Questions for Sprint Start

**Architecture Questions:**
- Should we store all trade history locally or rely on blockchain queries?
- How should we handle partial fills in async execution mode?
- What's the best UX for displaying gas fees and slippage?

**Integration Questions:**
- Are there rate limits on DFlow trading APIs we need to handle?
- Should we implement trade simulation/preview before actual execution?
- How do we handle wallet disconnection during active trades?

**Research Tasks (Day 1):**
- [ ] Review complete DFlow trading API documentation
- [ ] Test all trading endpoints in development environment
- [ ] Understand gas fee calculation and optimization
- [ ] Research wallet adapter best practices

---

**Sprint 2 Planning Complete - Ready for Reference Analysis Phase** ✅  
**Next Steps**: Begin Day 1 reference analysis and data type design before any implementation

---

## Integration with Copilot Instructions

**New Sprint Startup Rule Added:**

> **CRITICAL Sprint Startup Process**: Before ANY implementation work begins in any sprint:
> 1. **Reference Analysis** - Review all provided examples, existing patterns, API responses
> 2. **Data Design Phase** - Define TypeScript interfaces, GraphQL schemas, API contracts  
> 3. **Implementation Phase** - Code only after data types and APIs are fully designed
> 
> This prevents rework and ensures consistent, well-architected solutions.

**Created By**: Development Team  
**Date**: January 27, 2026  
**Sprint Start**: January 27, 2026  
**Next Action**: Begin reference analysis and data type design