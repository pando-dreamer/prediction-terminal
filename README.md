# Prediction Terminal

A monorepo for a prediction market trading platform.

## Project Structure

```
prediction-terminal/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   └── frontend/         # React + Tailwind UI
├── documents/            # Project documentation
└── docker-compose.yml    # PostgreSQL for development
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Development Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Setup environment**

   ```bash
   cp .env.example .env.local
   ```

3. **Start development environment**

   ```bash
   # Start PostgreSQL database only
   pnpm db:up

   # Start both frontend & backend locally
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - GraphQL Playground: http://localhost:3001/graphql

### Available Scripts

- `pnpm dev` - Start both frontend and backend locally
- `pnpm build` - Build all applications
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm db:up` - Start PostgreSQL container only
- `pnpm db:down` - Stop all Docker services

## Technology Stack

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL
- **API**: GraphQL with Apollo Server
- **ORM**: TypeORM
- **Authentication**: JWT + Passport

### Frontend

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Apollo Client
- **Routing**: React Router

## Development Workflow

### Critical: Always Follow This Order

1. **Make code changes**
2. **Format code**: `pnpm format`
3. **Build project**: `pnpm build`
4. **Commit changes**

### Backend Development

```bash
pnpm --filter @prediction-terminal/backend dev
```

### Frontend Development

```bash
pnpm --filter @prediction-terminal/frontend dev
```

## Architecture

This prediction market platform consists of:

- **Markets**: Create and manage prediction markets
- **Trading**: Buy/sell YES/NO positions
- **Positions**: Track user holdings and P&L
- **Settlement**: Resolve markets and distribute payouts

## Environment Variables

Environment variables are read in this priority order:

1. `.env.local` (local development, gitignored)
2. `.env` (shared config, gitignored)
3. `.env.example` (template, committed)

Copy `.env.example` to `.env.local` for development.

## Contributing

1. Create a feature branch
2. Make your changes
3. Format code: `pnpm format`
4. Build: `pnpm build`
5. Run tests: `pnpm test`
6. Submit a pull request

## License

Private - All rights reserved
