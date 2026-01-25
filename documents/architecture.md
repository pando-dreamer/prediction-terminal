# Architecture Overview

## System Architecture

The Prediction Terminal is built as a modern web application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  GraphQL API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### Frontend (React + Tailwind)

- **Trading Interface**: Market browsing, position management, order placement
- **Real-time Updates**: GraphQL subscriptions for live price feeds
- **User Dashboard**: Portfolio overview, P&L tracking, transaction history

#### Backend (NestJS + GraphQL)

- **Market Engine**: Market creation, pricing algorithms, resolution logic
- **Trading System**: Order matching, position tracking, balance management
- **Data Layer**: TypeORM entities, database operations, caching

#### Database (PostgreSQL)

- **Users**: Authentication, profiles, balances
- **Markets**: Market definitions, outcomes, metadata
- **Positions**: User holdings, entry prices, shares owned
- **Transactions**: Trading history, deposits, withdrawals

## Data Models

### Core Entities

```typescript
// Market entity - represents a prediction market
Market {
  id: string
  title: string
  description: string
  category: MarketCategory
  status: MarketStatus
  currentPrice: number
  totalVolume: number
  expiryDate: Date
  outcome?: boolean
  positions: Position[]
}

// Position entity - user's stake in a market
Position {
  id: string
  user: User
  market: Market
  type: PositionType (YES/NO)
  entryPrice: number
  amount: number
  shares: number
}

// User entity - platform users
User {
  id: string
  email: string
  username: string
  balance: number
  positions: Position[]
}
```

## Key Design Decisions

### Financial Precision

- All monetary calculations use `decimal.js` for precision
- Database stores decimal fields with appropriate precision/scale
- Frontend displays rounded values but preserves precision in calculations

### Event-Driven Architecture

- Markets emit events on price changes, resolution, etc.
- Real-time updates via GraphQL subscriptions
- Audit trail for all financial transactions

### Atomic Operations

- All trading operations wrapped in database transactions
- Balance updates and position changes happen atomically
- Rollback mechanisms for failed operations

## Security Considerations

### Authentication & Authorization

- JWT-based authentication
- Route-level permissions
- User context in GraphQL resolvers

### Data Validation

- Input validation at API layer using class-validator
- Database constraints for data integrity
- Sanitization of user inputs

### Financial Security

- Balance checks before allowing trades
- Position limits and risk controls
- Audit logging for all financial operations
