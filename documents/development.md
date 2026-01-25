# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ (use `node --version` to check)
- pnpm 8+ (use `pnpm --version` to check)
- Docker Desktop
- Git

### Initial Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd prediction-terminal
   pnpm install
   ```

2. **Environment setup**

   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Edit environment variables as needed
   # Never commit .env.local - it contains sensitive data
   ```

3. **Start development environment**
   ```bash
   pnpm db:up      # Starts PostgreSQL only
   pnpm dev        # Starts both frontend and backend locally
   ```

## Security & Environment Variables

### Environment File Hierarchy

Environment variables are loaded in this priority order:

1. `.env.local` (local development, gitignored)
2. `.env` (shared config, gitignored)
3. `.env.example` (template, committed)

### Security Best Practices

- **Never commit sensitive data**: All `.env*` files except `.env.example` are gitignored
- **Use templates**: `.env.example` and `.env.prod.example` contain safe dummy values
- **Docker security**: All Docker services use environment variables (no hardcoded secrets)
- **Production secrets**: Use secure secret management for production (AWS Secrets Manager, etc.)

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_DB=database_name
POSTGRES_USER=username
POSTGRES_PASSWORD=secure_password

# Backend
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=development|production
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001/graphql
```

## Project Structure

```
prediction-terminal/
├── apps/
│   ├── backend/              # NestJS GraphQL API
│   │   ├── src/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── markets/      # Market management
│   │   │   ├── users/        # User management
│   │   │   └── main.ts       # Application entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/             # React application
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── pages/        # Route components
│       │   ├── lib/          # Utilities
│       │   └── index.tsx     # Application entry point
│       ├── Dockerfile
│       └── package.json
├── documents/                # Project documentation
├── docker-compose.yml        # Development environment
├── package.json             # Monorepo configuration
└── README.md
```

## Development Workflows

### Backend Development

#### Adding New Features

1. Create module: `nest g module feature-name`
2. Add entity in `entities/` folder
3. Create service with business logic
4. Add GraphQL resolver
5. Update module imports

#### Database Changes

1. Modify entities
2. Run in development (auto-sync enabled)
3. For production: create migrations

#### Testing

```bash
cd apps/backend
pnpm test          # Unit tests
pnpm test:e2e      # Integration tests
pnpm test:cov      # Coverage report
```

### Frontend Development

#### Component Development

1. Create component in `src/components/`
2. Use shadcn/ui components as base
3. Apply Tailwind classes for styling
4. Export from component index

#### GraphQL Integration

1. Write GraphQL queries/mutations
2. Use Apollo Client hooks
3. Handle loading/error states
4. Update cache as needed

#### Styling Guidelines

- Use Tailwind utility classes
- Follow shadcn/ui design system
- Use CSS variables for theming
- Responsive design mobile-first

## Code Conventions

### TypeScript Standards

- Strict TypeScript enabled
- Use interfaces for data shapes
- Prefer const assertions
- No `any` types

### Backend Conventions

- Use DTOs for input validation
- Entity-first database design
- Service layer for business logic
- GraphQL-first API design

### Frontend Conventions

- Functional components with hooks
- Custom hooks for business logic
- Destructured props
- Named exports preferred

## Common Commands

### Development

```bash
# CRITICAL WORKFLOW: Always format → build → commit
pnpm format                   # Format all code (REQUIRED)
pnpm build                    # Build all apps (REQUIRED)

# Development
pnpm db:up                    # Start PostgreSQL only
pnpm dev                      # Start both apps locally
pnpm dev:backend             # Backend only
pnpm dev:frontend            # Frontend only
```

### Building

```bash
# Code Quality (ALWAYS run after changes)
pnpm format                  # Format all code
pnpm format:check            # Check formatting

# Build
pnpm build                   # Build all apps
pnpm build --filter=@prediction-terminal/backend
pnpm build --filter=@prediction-terminal/frontend
```

### Docker

```bash
# Docker (Database only for local dev)
pnpm db:up                   # Start PostgreSQL
pnpm db:down                 # Stop PostgreSQL
pnpm db:reset                # Reset database (removes data)
```

### Database

```bash
# Connect to PostgreSQL
docker exec -it prediction-terminal_postgres_1 psql -U admin -d prediction_terminal

# Reset database (development only)
docker-compose down -v
docker-compose up -d postgres
```

## Debugging

### Backend Debugging

- Use `console.log()` or debugger statements
- Check GraphQL playground at `http://localhost:3001/graphql`
- Monitor database logs in Docker container

### Frontend Debugging

- React DevTools browser extension
- Apollo Client DevTools
- Browser network tab for API calls
- Console logging with proper log levels

## Deployment

### Environment Variables

```bash
# Production environment
NODE_ENV=production
DATABASE_URL=<production-db-url>
JWT_SECRET=<secure-random-string>
```

### Build Process

```bash
# Build applications
npm run build

# Docker production build
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

**Port conflicts:**

- Change ports in docker-compose.yml
- Update environment variables accordingly

**Database connection issues:**

- Ensure PostgreSQL is running
- Check connection string format
- Verify credentials

**Module resolution errors:**

- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript path mappings
- Verify workspace configuration
