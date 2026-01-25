# DFlow Integration Architecture

## Integration Overview

### Current Architecture vs DFlow Integration

```
Current Architecture:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  GraphQL API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

With DFlow Integration:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  GraphQL API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────┬───────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   DFlow APIs    │
                       │                 │
                       │ • Market Data   │
                       │ • Trade API     │
                       │ • Settlement    │
                       └─────────────────┘
```

## DFlow API Integration Points

Based on DFlow documentation analysis:

### 1. Market Discovery (Prediction Market Metadata API)

```typescript
// New service layer
@Injectable()
export class DFlowMarketService {
  // Discover available markets
  async discoverMarkets(filters: MarketFilters): Promise<DFlowMarket[]>;

  // Get market metadata
  async getMarketMetadata(marketId: string): Promise<DFlowMarketData>;

  // Track market status changes
  async getMarketStatus(marketId: string): Promise<MarketStatus>;
}
```

### 2. Trading Integration (DFlow Trade API)

```typescript
@Injectable()
export class DFlowTradingService {
  // Execute buy/sell orders
  async executeOrder(
    orderRequest: DFlowOrderRequest
  ): Promise<DFlowOrderResponse>;

  // Get trade quotes
  async getQuote(quoteRequest: DFlowQuoteRequest): Promise<DFlowQuote>;

  // Monitor order execution (sync/async)
  async monitorOrderExecution(orderId: string): Promise<OrderStatus>;
}
```

### 3. Position Tracking

```typescript
@Injectable()
export class DFlowPositionService {
  // Get user positions across all markets
  async getUserPositions(userWallet: string): Promise<DFlowPosition[]>;

  // Track position changes
  async subscribeToPositionUpdates(
    userWallet: string
  ): Observable<PositionUpdate>;

  // Calculate position value
  async calculatePositionValue(position: DFlowPosition): Promise<number>;
}
```

### 4. Settlement & Redemption

```typescript
@Injectable()
export class DFlowSettlementService {
  // Check if outcome tokens are redeemable
  async checkRedeemable(position: DFlowPosition): Promise<boolean>;

  // Request redemption for winning positions
  async requestRedemption(
    redemptionRequest: RedemptionRequest
  ): Promise<RedemptionResponse>;

  // Track settlement status
  async getSettlementStatus(marketId: string): Promise<SettlementStatus>;
}
```

## Data Model Extensions

### Enhanced Market Entity

```typescript
@Entity('markets')
export class Market {
  // Existing fields...

  // DFlow integration fields
  @Column({ nullable: true })
  dflowMarketId?: string;

  @Column({ nullable: true })
  dflowSeriesId?: string;

  @Column({ nullable: true })
  dflowEventId?: string;

  @Column({ type: 'json', nullable: true })
  dflowMetadata?: DFlowMarketMetadata;

  @Column({ default: false })
  isDFlowMarket: boolean;

  @Column({ nullable: true })
  settlementMint?: string;

  @Column({ type: 'json', nullable: true })
  outcomeTokens?: DFlowOutcomeToken[];
}
```

### DFlow-Specific Entities

```typescript
@Entity('dflow_positions')
export class DFlowPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Market)
  market: Market;

  @Column()
  walletAddress: string;

  @Column()
  tokenAccount: string;

  @Column('decimal', { precision: 15, scale: 2 })
  tokenBalance: number;

  @Column()
  outcomeTokenMint: string;

  @Column({ type: 'json' })
  dflowMetadata: DFlowPositionMetadata;
}

@Entity('dflow_trades')
export class DFlowTrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Market)
  market: Market;

  @Column()
  dflowOrderId: string;

  @Column({ type: 'enum', enum: TradeType })
  tradeType: 'BUY' | 'SELL';

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 8 })
  price: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column()
  transactionSignature?: string;

  @Column({ type: 'json' })
  dflowOrderData: DFlowOrderData;
}
```

## Configuration & Environment

### DFlow API Configuration

```typescript
// apps/backend/src/config/dflow.config.ts
export const dflowConfig = {
  baseUrl: process.env.DFLOW_API_URL || 'https://api.dflow.net',
  apiKey: process.env.DFLOW_API_KEY,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMs: 1000,
  },
  timeout: 10000, // 10 seconds
};
```

### Environment Variables

```bash
# DFlow Integration
DFLOW_API_URL=https://api.dflow.net
DFLOW_API_KEY=your-dflow-api-key
DFLOW_WEBHOOK_SECRET=your-webhook-secret
DFLOW_NETWORK=mainnet  # or devnet for testing

# Wallet Integration (if needed)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your-wallet-private-key
```

## Error Handling & Resilience

### API Error Handling

```typescript
@Injectable()
export class DFlowApiClient {
  async makeRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
    try {
      const response = await this.httpService.request(options);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limiting - implement backoff
        throw new DFlowRateLimitError();
      } else if (error.response?.status >= 500) {
        // Server errors - retry
        throw new DFlowServerError();
      } else {
        // Client errors - don't retry
        throw new DFlowClientError();
      }
    }
  }
}
```

### Fallback Strategies

1. **Cache Strategy**: Cache market data for resilience
2. **Graceful Degradation**: Show last known data when API unavailable
3. **Circuit Breaker**: Temporarily disable DFlow features if persistent failures
4. **Local Market Fallback**: Allow local markets when DFlow unavailable

## GraphQL Schema Extensions

### New Queries

```graphql
type Query {
  # Existing queries...

  # DFlow Market Discovery
  dflowMarkets(filters: DFlowMarketFilters): [DFlowMarket!]!
  dflowMarketById(id: ID!): DFlowMarket

  # User Position Tracking
  userDFlowPositions(walletAddress: String!): [DFlowPosition!]!

  # Trading
  getDFlowQuote(request: DFlowQuoteRequest!): DFlowQuote!
}

type Mutation {
  # Existing mutations...

  # Trading
  executeDFlowTrade(request: DFlowTradeRequest!): DFlowTradeResponse!

  # Settlement
  redeemDFlowTokens(request: RedemptionRequest!): RedemptionResponse!
}

type Subscription {
  # Real-time market updates
  dflowMarketUpdates(marketId: ID!): DFlowMarketUpdate!

  # Position changes
  dflowPositionUpdates(walletAddress: String!): DFlowPositionUpdate!
}
```

## Frontend Integration

### New Components Architecture

```
src/
├── components/
│   ├── dflow/
│   │   ├── DFlowMarketCard.tsx
│   │   ├── DFlowTradingInterface.tsx
│   │   ├── DFlowPositionTracker.tsx
│   │   └── DFlowSettlementPanel.tsx
│   └── ui/
│       ├── WalletConnector.tsx
│       └── TransactionStatus.tsx
├── pages/
│   ├── DFlowMarkets.tsx
│   ├── DFlowTrading.tsx
│   └── DFlowPortfolio.tsx
└── hooks/
    ├── useDFlowMarkets.ts
    ├── useDFlowTrading.ts
    └── useDFlowPositions.ts
```

### State Management Strategy

- **Apollo Client**: GraphQL state management
- **Context API**: Wallet connection state
- **React Query**: DFlow API caching (if needed for direct calls)

## Security Considerations

### API Security

- **API Key Management**: Secure server-side storage
- **Rate Limiting**: Implement client-side rate limiting
- **Request Signing**: If required by DFlow
- **Webhook Validation**: Verify DFlow webhooks

### Wallet Security

- **Private Key Management**: Never expose on frontend
- **Transaction Signing**: Secure signing flow
- **Permission Management**: Minimal required permissions
- **Audit Logging**: Track all financial operations

## Performance Optimization

### Caching Strategy

- **Market Data**: Cache with TTL (5-15 minutes)
- **Position Data**: Cache with shorter TTL (1-2 minutes)
- **Historical Data**: Long-term caching (1+ hours)

### Connection Management

- **Connection Pooling**: Reuse HTTP connections
- **Batch Requests**: Group related API calls
- **Lazy Loading**: Load market details on demand

## Testing Strategy

### Unit Testing

- Mock DFlow API responses
- Test error handling scenarios
- Validate data transformations

### Integration Testing

- Test against DFlow testnet/devnet
- End-to-end trading flows
- Position tracking accuracy

### Performance Testing

- API response time monitoring
- Load testing with multiple concurrent users
- Rate limiting behavior validation

---

**Implementation Priority:**

1. **Sprint 1**: Market Discovery Integration
2. **Sprint 2**: Basic Trading Integration
3. **Sprint 3**: Position Tracking
4. **Sprint 4**: Settlement & Redemption
5. **Sprint 5**: Real-time Updates & Polish
6. **Sprint 6**: Performance & Production Readiness
