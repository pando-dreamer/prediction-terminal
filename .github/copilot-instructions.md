# Copilot Instructions for Prediction Terminal

## Project Overview

A TypeScript monorepo for a prediction market trading platform. Users can create markets, place YES/NO bets, and earn profits from correct predictions.

## Architecture

### Monorepo Structure

```
prediction-terminal/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   └── frontend/         # React + Tailwind UI
├── documents/            # Architecture, API, development docs
└── docker-compose.yml    # PostgreSQL for development
```

### Tech Stack

- **Backend**: NestJS + GraphQL + TypeORM + PostgreSQL
- **Frontend**: React + Apollo Client + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with decimal precision for financial data
- **Package Manager**: pnpm (required)
- **Development**: Local services + Docker PostgreSQL

## Development Workflows

### CRITICAL: Always Follow This Order

1. **Make code changes**
2. **Format code**: `pnpm format`
3. **Build project**: `pnpm build`
4. **Commit changes**

### Starting Development

```bash
pnpm install                  # Install all dependencies
pnpm db:up                   # Start PostgreSQL only
pnpm dev                     # Start both frontend & backend locally
```

### Key Commands

- `pnpm dev` - Start both frontend & backend locally (port 3000 & 3001)
- `pnpm db:up` - Start PostgreSQL container only
- `pnpm build` - Build all applications (ALWAYS run after changes)
- `pnpm format` - Format all code with Prettier (ALWAYS run after changes)
- `pnpm format:check` - Check formatting without fixing
- GraphQL Playground: `http://localhost:3001/graphql`

### Environment Configuration

Environment variables are read in this priority order:

1. `.env.local` (local development, gitignored)
2. `.env` (shared config, gitignored)
3. `.env.example` (template, committed)

Copy `.env.example` to `.env.local` for development.

### Adding Features

#### Backend (NestJS)

1. Generate module: `nest g module feature`
2. Create entity in `entities/` with proper decorators
3. Add service with business logic
4. Create GraphQL resolver with proper DTOs
5. Update module imports and exports
6. **ALWAYS format**: `pnpm format`
7. **ALWAYS build**: `pnpm build`

#### Frontend (React)

1. Create components in `src/components/`
2. Use shadcn/ui components as base building blocks
3. Write GraphQL queries/mutations with proper TypeScript types
4. Use Apollo hooks: `useQuery`, `useMutation`
5. Apply Tailwind classes following design system
6. **ALWAYS format**: `pnpm format`
7. **ALWAYS build**: `pnpm build`

## Critical Code Patterns

### Financial Precision

```typescript
// Backend: Use decimal columns
@Column('decimal', { precision: 15, scale: 2 })
balance: number;

// Use decimal.js for calculations (not implemented yet)
import { Decimal } from 'decimal.js';
```

### GraphQL Best Practices

```typescript
// Input validation with DTOs
@InputType()
export class CreateMarketInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => MarketCategory)
  @IsEnum(MarketCategory)
  category: MarketCategory;
}
```

### Frontend State Management

```typescript
// Apollo Client queries
const { loading, error, data } = useQuery(GET_ACTIVE_MARKETS);

// Proper error handling
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

### Component Composition

```typescript
// Use shadcn/ui + Tailwind
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Consistent styling with cn() utility
className={cn("base-classes", conditionalClasses)}
```

## Database Considerations

### Relationship Patterns

- User → Positions (one-to-many)
- Market → Positions (one-to-many)
- Use UUID primary keys
- Proper foreign key constraints

### Development Database

- Auto-sync enabled in development
- Use TypeORM entity changes for schema updates
- Reset: `docker-compose down -v && docker-compose up -d`

## Important Context

### File Structure

- Backend modules: auth, markets, users
- Frontend pages: Markets, MarketDetail, Portfolio
- Shared UI components in `components/ui/`
- GraphQL types auto-generated from schema

### Current State

- Basic CRUD operations for markets and users
- Authentication scaffolded but not fully implemented
- Trading/position logic exists but needs completion
- Real-time subscriptions planned but not implemented

### Next Development Steps

1. Complete trading system with balance checks
2. Add JWT authentication middleware
3. Implement real-time price updates
4. Add comprehensive error handling
5. Create market resolution mechanisms
