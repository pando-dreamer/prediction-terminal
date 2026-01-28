# Sprint 3: Reference Analysis - Position Tracking & Redemption

## Overview

**Date**: January 28, 2026 (Sprint 3 Day 1)  
**Phase**: Reference Analysis  
**Sprint Goal**: Enable users to track their prediction market positions and portfolio performance  
**Status**: **IN PROGRESS** 📊

## API Flow Analysis

### Position Fetching Flow ✅ **VALIDATED**

Based on DFlow documentation: https://pond.dflow.net/quickstart/user-prediction-positions#filter-prediction-market-tokens

#### **Step 1: Fetch User Token Accounts (Token 2022)**

```typescript
// Fetch all Token 2022 accounts for user wallet
const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  userWallet,
  { programId: TOKEN_2022_PROGRAM_ID }
);
```

**Key Findings:**

- Use **Token 2022 Program** (not original Token Program)
- Fetch ALL token accounts for the user
- Extract mint addresses and balances from accounts

#### **Step 2: Filter Outcome Mints**

```typescript
// API Call to filter which mints are prediction market tokens
const response = await fetch('/api/v1/filter_outcome_mints', {
  method: 'POST',
  body: JSON.stringify({
    addresses: userMintAddresses, // All user's token mint addresses
  }),
});
```

**API Response Structure:**

```typescript
{
  outcomeMints: string[] // Array of mint addresses that are prediction market tokens
}
```

#### **Step 3: Calculate Positions**

For each outcome mint:

- **Match with token balance**: Find user's balance for this mint
- **Get market information**: Lookup market details for the mint
- **Calculate position metrics**: Entry price, current value, P&L

### Redemption Flow ✅ **DOCUMENTED**

Based on DFlow documentation: https://pond.dflow.net/quickstart/redeem-outcome-tokens

#### **Redemption Process**

```typescript
// Similar to making a trade order
const redeemOrder = await createOrder({
  inputMint: outcomeMint, // YES/NO token to redeem
  outputMint: baseMint, // USDC or other base token
  amount: tokenBalance, // Full position amount
  slippageBps: 0, // Redemption typically has no slippage
  userPublicKey: wallet.publicKey,
});
```

**Key Findings:**

- **Redemption = Trade Order**: Uses same trading API with outcome tokens as input
- **Full Position**: Typically redeem entire position (amount = full balance)
- **Zero Slippage**: Redemption orders usually have minimal/zero slippage
- **Market Resolution Required**: Can only redeem after market is resolved

## Data Structure Analysis

### Position Data Interface

```typescript
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
  outcome: 'YES' | 'NO'; // Position outcome type
  baseMint: string; // Base token (USDC, etc.)

  // Position Metrics
  entryPrice: number; // Average entry price per token
  currentPrice: number; // Current market price
  estimatedValue: number; // Current position value in base token
  unrealizedPnL: number; // Unrealized profit/loss
  unrealizedPnLPercent: number; // P&L as percentage

  // Status
  marketStatus: MarketStatus; // ACTIVE, RESOLVED, SETTLED
  isRedeemable: boolean; // Can be redeemed now

  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
}

interface PortfolioSummary {
  totalPositions: number;
  activePositions: number;
  totalValue: number; // Sum of all position values
  totalUnrealizedPnL: number; // Total unrealized P&L
  totalRealizedPnL: number; // Total realized P&L (from completed trades)
  redeemableValue: number; // Value of positions that can be redeemed

  // Performance Metrics
  winRate: number; // Percentage of winning positions
  averagePositionSize: number; // Average position value
  largestPosition: number; // Largest single position value
  portfolioReturn: number; // Overall portfolio return percentage
}
```

### Token Account Structure

```typescript
interface TokenAccount {
  mint: string; // Token mint address
  owner: string; // Wallet address
  balance: string; // Raw balance string
  decimals: number; // Decimal places
  uiAmount: number; // Human readable amount
  program: string; // Token program (should be Token 2022)
}
```

## Position Calculation Logic

### Entry Price Calculation

```typescript
// Calculate weighted average entry price from trade history
const calculateEntryPrice = (trades: Trade[]): number => {
  const buyTrades = trades.filter(t => t.direction === 'BUY');
  const totalTokens = buyTrades.reduce((sum, t) => sum + t.amount, 0);
  const totalCost = buyTrades.reduce((sum, t) => sum + t.amount * t.price, 0);
  return totalCost / totalTokens;
};
```

### Current Value Calculation

```typescript
// Current position value based on market price
const calculateCurrentValue = (
  balance: number,
  currentPrice: number
): number => {
  return balance * currentPrice;
};
```

### P&L Calculation

```typescript
// Unrealized P&L calculation
const calculateUnrealizedPnL = (
  balance: number,
  entryPrice: number,
  currentPrice: number
): number => {
  return balance * (currentPrice - entryPrice);
};
```

## API Integration Points

### Required DFlow APIs

1. **Markets API**: Get market information and current prices
2. **Filter Outcome Mints API**: Identify prediction market tokens
3. **Trading API**: For redemption orders
4. **Order Status API**: Track redemption order status

### Solana RPC Integration

1. **Token Account Queries**: Fetch user's Token 2022 accounts
2. **Balance Monitoring**: Real-time balance updates
3. **Transaction Monitoring**: Track redemption transactions

## Performance Considerations

### Caching Strategy

```typescript
interface PositionCache {
  userPositions: Map<string, UserPosition[]>; // Cache by wallet address
  marketPrices: Map<string, number>; // Cache current prices
  marketInfo: Map<string, MarketInfo>; // Cache market metadata
  lastRefresh: Map<string, Date>; // Track cache freshness
}
```

### Optimization Patterns

1. **Batch Token Account Queries**: Fetch all accounts in single RPC call
2. **Parallel API Calls**: Filter mints while fetching market data
3. **Incremental Updates**: Only refresh changed positions
4. **Price Caching**: Cache market prices with TTL

## Risk Assessment & Mitigation

### High Risk Items

1. **Token 2022 Compatibility**
   - **Risk**: Different behavior from original Token Program
   - **Mitigation**: Test thoroughly with Token 2022 specific libraries

2. **Position Calculation Accuracy**
   - **Risk**: Incorrect P&L calculations affecting user trust
   - **Mitigation**: Comprehensive unit tests, manual verification

3. **API Rate Limits**
   - **Risk**: Solana RPC and DFlow API rate limiting
   - **Mitigation**: Implement caching, request batching, retry logic

### Medium Risk Items

1. **Real-time Update Performance**
   - **Risk**: Slow position updates with many positions
   - **Mitigation**: Efficient caching, incremental updates

2. **Market Resolution Edge Cases**
   - **Risk**: Position status confusion during market resolution
   - **Mitigation**: Clear status indicators, proper error handling

## Implementation Recommendations

### Database Schema Design

```sql
-- Positions table
CREATE TABLE user_positions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address VARCHAR(44) NOT NULL,
  mint VARCHAR(44) NOT NULL,
  market_id VARCHAR(100) NOT NULL,
  outcome VARCHAR(3) NOT NULL, -- YES/NO
  balance DECIMAL(20,9) NOT NULL,
  entry_price DECIMAL(20,6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, mint)
);

-- Position history for tracking changes
CREATE TABLE position_history (
  id UUID PRIMARY KEY,
  position_id UUID REFERENCES user_positions(id),
  balance_before DECIMAL(20,9),
  balance_after DECIMAL(20,9),
  change_type VARCHAR(20), -- TRADE, REDEMPTION, SETTLEMENT
  transaction_signature VARCHAR(88),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Service Architecture

```typescript
class PositionTrackingService {
  async fetchUserPositions(walletAddress: string): Promise<UserPosition[]>;
  async refreshPositionPrices(
    positions: UserPosition[]
  ): Promise<UserPosition[]>;
  async calculatePortfolioSummary(
    positions: UserPosition[]
  ): Promise<PortfolioSummary>;
  async redeemPosition(
    positionId: string,
    amount?: number
  ): Promise<RedemptionResult>;
}
```

## Success Metrics

### Performance Targets

- **Position Load Time**: <2 seconds for up to 100 positions
- **Price Update Latency**: <500ms for real-time updates
- **API Success Rate**: >99% for position fetching
- **Accuracy**: P&L calculations within 0.01 USDC precision

### User Experience Goals

- **Complete Portfolio View**: All positions visible in single view
- **Real-time Updates**: Automatic price and P&L updates
- **Redemption Flow**: One-click redemption for resolved markets
- **Historical Tracking**: Position history and performance metrics

---

**Reference Analysis Status**: ✅ **COMPLETE**  
**Next Phase**: Data Design (Day 1-2)  
**Key Findings**: Position fetching flow validated, redemption process documented, performance considerations identified

**Date**: January 28, 2026  
**Completed By**: Development Team
