# Automation Testing Plan - Prediction Terminal

## Overview

**Document Date**: January 31, 2026  
**Status**: **PLANNING** 📋  
**Priority**: **HIGH** - Critical technical debt from Sprints 2 & 3  
**Target Completion**: Sprint 5 (March 10 - March 21, 2026)

> **Note**: Testing was originally planned for Sprint 4 but has been deferred to Sprint 5 to prioritize **Mobile-First UI Refactoring** in Sprint 4. This strategic decision ensures optimal dApp user experience on mobile devices before building automated test coverage.

---

## Executive Summary

After successful delivery of core features in Sprints 2 and 3 with **zero defects**, we've identified automation testing as a critical gap. While manual testing has been effective, automated testing is essential for:

- **Preventing regressions** as the codebase grows
- **Faster feedback loops** during development
- **Confidence in refactoring** and optimization
- **CI/CD pipeline** integration for production deployment
- **Long-term maintainability** and code quality

This plan outlines a comprehensive approach to implement automated testing across unit, integration, and end-to-end layers.

---

## Current State Assessment

### What We Have ✅

- High-quality, type-safe TypeScript code
- Comprehensive error handling
- Zero production defects (manual testing)
- Clean architecture with separation of concerns
- GraphQL API with well-defined contracts

### What We're Missing ❌

- **Zero automated tests** across the entire codebase
- No CI/CD testing pipeline
- No test coverage metrics
- No regression prevention
- Manual testing only (time-consuming)

### Risk Assessment

**Current Risk Level**: 🟡 **MEDIUM**
- Code quality is high, reducing immediate risk
- Manual testing catches issues before deployment
- **Future Risk**: As codebase grows, manual testing becomes unsustainable

---

## Testing Strategy

### Testing Pyramid Approach

```
           /\
          /E2E\      10% - Critical user journeys
         /------\
        /  INT   \   30% - API & service integration
       /----------\
      /   UNIT     \ 60% - Business logic & utilities
     /--------------\
```

### Coverage Targets

| Layer | Target Coverage | Priority | Timeline |
|-------|----------------|----------|----------|
| Unit Tests | 80%+ | High | Sprint 5 Week 1 |
| Integration Tests | 70%+ | High | Sprint 5 Week 2 |
| E2E Tests | Critical flows | Medium | Sprint 6 |

### Test Distribution Goals

- **600+ unit tests** covering core business logic
- **100+ integration tests** for API endpoints
- **20+ E2E tests** for critical user flows
- **Total**: 720+ automated tests

---

## Testing Infrastructure Setup

### Backend Testing Stack

#### Framework & Tools

```json
{
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "@types/jest": "^29.5.11",
  "supertest": "^6.3.3",
  "@nestjs/testing": "^10.3.0"
}
```

**Rationale**:
- **Jest**: Industry standard, excellent TypeScript support
- **ts-jest**: Native TypeScript compilation for tests
- **supertest**: HTTP integration testing for NestJS
- **@nestjs/testing**: NestJS testing utilities

#### Configuration Files

**jest.config.js** (Backend):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Frontend Testing Stack

#### Framework & Tools

```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "jest-environment-jsdom": "^29.7.0",
  "@apollo/client": "^3.8.8"
}
```

**Rationale**:
- **Testing Library**: Best practices for React component testing
- **jest-dom**: Custom matchers for DOM testing
- **user-event**: Realistic user interaction simulation

#### Configuration Files

**jest.config.js** (Frontend):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.tsx', '**/*.spec.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/index.tsx',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

### E2E Testing Stack

#### Framework & Tools

```json
{
  "playwright": "^1.40.1",
  "@playwright/test": "^1.40.1"
}
```

**Rationale**:
- **Playwright**: Modern, fast, reliable E2E testing
- Multi-browser support (Chromium, Firefox, WebKit)
- Built-in test runner and assertions
- Excellent debugging tools

---

## Unit Testing Plan

### Backend Unit Tests

#### 1. Position Tracking Service
**File**: `apps/backend/src/positions/__tests__/position-tracking.service.spec.ts`

**Test Coverage** (~150 tests):

```typescript
describe('PositionTrackingService', () => {
  // Position Discovery (30 tests)
  describe('discoverNewPositions', () => {
    it('should fetch Token 2022 accounts for wallet');
    it('should filter outcome mints via DFlow API');
    it('should handle empty wallet gracefully');
    it('should handle API errors with retry logic');
    it('should cache token accounts for performance');
    // ... 25 more tests
  });

  // Position Calculation (40 tests)
  describe('calculatePosition', () => {
    it('should calculate entry price from trade history');
    it('should compute unrealized P&L correctly');
    it('should handle zero balance positions');
    it('should calculate percentage P&L accurately');
    it('should determine redeemable status');
    it('should assess risk level based on metrics');
    // ... 34 more tests
  });

  // Portfolio Summary (50 tests)
  describe('calculatePortfolioSummary', () => {
    it('should sum total portfolio value');
    it('should calculate total unrealized P&L');
    it('should compute win rate from positions');
    it('should identify largest position');
    it('should calculate diversification score');
    it('should handle empty portfolio');
    // ... 44 more tests
  });

  // Price Updates (30 tests)
  describe('refreshPositionPrices', () => {
    it('should update prices from DFlow API');
    it('should cache prices with TTL');
    it('should handle stale price data');
    it('should batch price requests for efficiency');
    // ... 26 more tests
  });
});
```

**Key Testing Patterns**:
- Mock DFlow API responses
- Test edge cases (empty, zero, negative)
- Validate calculation accuracy (decimal precision)
- Test error handling and recovery
- Performance testing for large portfolios

#### 2. Redemption Service
**File**: `apps/backend/src/positions/__tests__/redemption.service.spec.ts`

**Test Coverage** (~80 tests):

```typescript
describe('RedemptionService', () => {
  // Redemption Creation (40 tests)
  describe('createRedemptionOrder', () => {
    it('should validate position is redeemable');
    it('should create redemption order via DFlow');
    it('should handle slippage protection');
    it('should track transaction signature');
    it('should update position after redemption');
    it('should handle failed redemptions');
    // ... 34 more tests
  });

  // Status Tracking (40 tests)
  describe('trackRedemptionStatus', () => {
    it('should poll transaction status');
    it('should update redemption history');
    it('should handle timeout scenarios');
    it('should retry on network errors');
    // ... 36 more tests
  });
});
```

#### 3. DFlow Service
**File**: `apps/backend/src/dflow/__tests__/dflow.service.spec.ts`

**Test Coverage** (~120 tests):

```typescript
describe('DFlowService', () => {
  // Events API (40 tests)
  describe('getDFlowEvents', () => {
    it('should fetch events with pagination');
    it('should handle search queries');
    it('should filter by status');
    it('should sort by different criteria');
    it('should include nested markets');
    // ... 35 more tests
  });

  // Markets API (40 tests)
  describe('getDFlowMarkets', () => {
    it('should fetch active markets');
    it('should filter by category');
    it('should handle market not found');
    it('should cache market data');
    // ... 36 more tests
  });

  // Trading API (40 tests)
  describe('createOrder', () => {
    it('should validate order parameters');
    it('should create order with slippage');
    it('should handle insufficient balance');
    it('should track order execution');
    // ... 36 more tests
  });
});
```

#### 4. GraphQL Resolvers
**File**: `apps/backend/src/positions/__tests__/positions.resolver.spec.ts`

**Test Coverage** (~60 tests):

```typescript
describe('PositionsResolver', () => {
  describe('userPositions', () => {
    it('should return positions for wallet');
    it('should apply filters correctly');
    it('should handle invalid wallet address');
    it('should require authentication (when enabled)');
    // ... 8 more tests
  });

  describe('portfolioSummary', () => {
    it('should return complete portfolio metrics');
    it('should handle empty portfolio');
    it('should cache results appropriately');
    // ... 7 more tests
  });

  // ... 40 more resolver tests
});
```

### Frontend Unit Tests

#### 1. Portfolio Components
**File**: `apps/frontend/src/components/positions/__tests__/PortfolioOverview.spec.tsx`

**Test Coverage** (~50 tests):

```typescript
describe('PortfolioOverview', () => {
  it('should render portfolio value correctly');
  it('should display P&L with correct color coding');
  it('should show win rate percentage');
  it('should handle loading state');
  it('should handle error state');
  it('should format currency correctly');
  it('should display risk indicators');
  // ... 43 more tests
});
```

#### 2. Position Cards
**File**: `apps/frontend/src/components/positions/__tests__/PositionCard.spec.tsx`

**Test Coverage** (~60 tests):

```typescript
describe('PositionCard', () => {
  it('should render position details');
  it('should show P&L with color coding');
  it('should display redemption button for redeemable positions');
  it('should handle redemption click');
  it('should show market status badge');
  it('should format prices correctly');
  // ... 54 more tests
});
```

#### 3. GraphQL Hooks
**File**: `apps/frontend/src/lib/graphql/__tests__/positions.spec.ts`

**Test Coverage** (~40 tests):

```typescript
describe('Position GraphQL Queries', () => {
  it('should fetch user positions with variables');
  it('should handle network errors');
  it('should cache query results');
  it('should refetch on mutation');
  // ... 36 more tests
});
```

---

## Integration Testing Plan

### Backend Integration Tests

#### 1. Position Tracking Flow
**File**: `apps/backend/src/positions/__tests__/position-tracking.integration.spec.ts`

**Test Coverage** (~40 tests):

```typescript
describe('Position Tracking Integration', () => {
  describe('Full Position Discovery Flow', () => {
    it('should discover, calculate, and persist positions');
    it('should update existing positions on refresh');
    it('should handle concurrent updates');
    it('should maintain data consistency');
    // ... 36 more tests
  });
});
```

**Setup Requirements**:
- Test database with migrations
- Mock DFlow API server
- Sample wallet with test positions

#### 2. GraphQL API Integration
**File**: `apps/backend/src/__tests__/graphql.integration.spec.ts`

**Test Coverage** (~60 tests):

```typescript
describe('GraphQL API Integration', () => {
  describe('Position Queries', () => {
    it('should query userPositions end-to-end');
    it('should query portfolioSummary with calculations');
    it('should filter positions correctly');
    it('should paginate results properly');
    // ... 24 more tests
  });

  describe('Position Mutations', () => {
    it('should refresh positions with API calls');
    it('should redeem position with transaction');
    it('should update prices across positions');
    // ... 12 more tests
  });

  describe('Events Queries', () => {
    it('should fetch events with filters');
    it('should get tags by categories');
    it('should filter series by tags');
    // ... 18 more tests
  });
});
```

**Tools**:
- `supertest` for HTTP requests
- Test GraphQL client
- Database seeding utilities

### Frontend Integration Tests

#### 1. Apollo Client Integration
**File**: `apps/frontend/src/__tests__/apollo.integration.spec.tsx`

**Test Coverage** (~30 tests):

```typescript
describe('Apollo Client Integration', () => {
  it('should fetch and cache positions');
  it('should update cache after mutations');
  it('should handle optimistic updates');
  it('should refetch after errors');
  // ... 26 more tests
});
```

#### 2. Component Integration
**File**: `apps/frontend/src/pages/__tests__/Portfolio.integration.spec.tsx`

**Test Coverage** (~40 tests):

```typescript
describe('Portfolio Page Integration', () => {
  it('should load positions and display them');
  it('should refresh positions on button click');
  it('should filter positions by status');
  it('should redeem position with confirmation');
  // ... 36 more tests
});
```

---

## End-to-End Testing Plan

### Critical User Journeys

#### 1. Position Discovery & Viewing
**File**: `e2e/position-discovery.spec.ts`

```typescript
test.describe('Position Discovery', () => {
  test('should discover and display user positions', async ({ page }) => {
    // Connect wallet
    // Navigate to portfolio
    // Verify positions loaded
    // Check P&L calculations
    // Verify portfolio summary
  });

  test('should filter positions by status', async ({ page }) => {
    // Load portfolio
    // Apply active filter
    // Verify filtered results
    // Apply resolved filter
    // Verify different results
  });
});
```

#### 2. Position Redemption Flow
**File**: `e2e/position-redemption.spec.ts`

```typescript
test.describe('Position Redemption', () => {
  test('should redeem winning position', async ({ page }) => {
    // Connect wallet with redeemable position
    // Navigate to portfolio
    // Click redeem button
    // Confirm redemption
    // Verify success message
    // Check position removed from list
  });
});
```

#### 3. Events Discovery
**File**: `e2e/events-discovery.spec.ts`

```typescript
test.describe('Events Discovery', () => {
  test('should filter events by category', async ({ page }) => {
    // Navigate to events page
    // Click Sports category tab
    // Verify events filtered
    // Search within category
    // Verify search results
  });
});
```

**Total E2E Tests**: ~20 critical flows

---

## Test Data Management

### Test Database Setup

**Strategy**: Isolated test database per test suite

```typescript
// setup/test-db.ts
export class TestDatabase {
  async setup() {
    // Create test database
    // Run migrations
    // Seed initial data
  }

  async teardown() {
    // Clean up test data
    // Drop test database
  }

  async seedPositions(walletAddress: string) {
    // Create sample positions
  }

  async seedMarkets() {
    // Create sample markets
  }
}
```

### Mock DFlow API

**Strategy**: In-memory mock server for consistent responses

```typescript
// mocks/dflow-mock-server.ts
export class DFlowMockServer {
  setupDefaultResponses() {
    // Mock /api/v1/events
    // Mock /api/v1/markets
    // Mock /api/v1/filter_outcome_mints
    // Mock trading endpoints
  }

  setupErrorScenarios() {
    // Mock rate limiting
    // Mock network errors
    // Mock invalid responses
  }
}
```

### Test Fixtures

**Location**: `apps/backend/src/__tests__/fixtures/`

```
fixtures/
├── positions.fixture.ts      # Sample position data
├── markets.fixture.ts         # Sample market data
├── wallets.fixture.ts         # Test wallet addresses
├── trades.fixture.ts          # Sample trade history
└── prices.fixture.ts          # Sample price data
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Automated Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Package Scripts

**Add to root package.json**:

```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:unit": "pnpm -r test:unit",
    "test:integration": "pnpm -r test:integration",
    "test:e2e": "playwright test",
    "test:watch": "pnpm -r test:watch",
    "test:coverage": "pnpm -r test:coverage",
    "test:ci": "pnpm test:unit && pnpm test:integration"
  }
}
```

**Backend package.json**:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.spec\\.ts$",
    "test:integration": "jest --testPathPattern=\\.integration\\.spec\\.ts$",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

**Frontend package.json**:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.spec\\.tsx?$",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Implementation Timeline

### Sprint 4 - Week 1 (February 24-28, 2026)

**Goal**: Testing infrastructure + critical unit tests

| Day | Focus | Deliverables |
|-----|-------|--------------|
| Mon | Setup infrastructure | Jest config, test database, CI/CD |
| Tue | Backend unit tests | Position tracking service (50% coverage) |
| Wed | Backend unit tests | Redemption service + DFlow service |
| Thu | Frontend unit tests | Portfolio components |
| Fri | Review & refine | Coverage report, fix gaps |

**Target**: 60% unit test coverage

### Sprint 4 - Week 2 (March 3-7, 2026)

**Goal**: Integration tests + E2E foundation

| Day | Focus | Deliverables |
|-----|-------|--------------|
| Mon | Backend integration | Position tracking flow |
| Tue | Backend integration | GraphQL API tests |
| Wed | Frontend integration | Apollo client + components |
| Thu | E2E setup | Playwright config, critical flows |
| Fri | Documentation | Testing guide, best practices |

**Target**: 70% integration coverage, 5+ E2E tests

### Sprint 5 - Week 1 (March 10-14, 2026)

**Goal**: Complete coverage + automation

| Day | Focus | Deliverables |
|-----|-------|--------------|
| Mon | Fill unit test gaps | 80% unit coverage |
| Tue | E2E tests | 15+ E2E scenarios |
| Wed | Performance tests | Load testing, benchmarks |
| Thu | CI/CD refinement | Optimize pipeline, parallel tests |
| Fri | Final review | Coverage report, documentation |

**Target**: 80% unit, 70% integration, 20 E2E tests

---

## Success Metrics

### Coverage Targets

| Metric | Current | Target (Sprint 4) | Target (Sprint 5) |
|--------|---------|-------------------|-------------------|
| Unit Test Coverage | 0% | 60% | 80%+ |
| Integration Coverage | 0% | 50% | 70%+ |
| E2E Tests | 0 | 5 | 20+ |
| Test Execution Time | N/A | <5 min | <3 min |
| CI/CD Pass Rate | N/A | 95%+ | 98%+ |

### Quality Metrics

- **Test Reliability**: 95%+ consistent pass rate
- **Build Time**: <10 minutes for full suite
- **Flaky Tests**: <2% flakiness rate
- **Coverage Growth**: +20% per sprint until targets met

---

## Best Practices & Standards

### Test Structure

**Follow AAA Pattern**:
```typescript
describe('Feature', () => {
  it('should do something when condition', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = serviceMethod(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### Naming Conventions

- Test files: `*.spec.ts` (unit), `*.integration.spec.ts` (integration)
- Test suites: Describe the component/service being tested
- Test cases: Start with "should" and describe behavior
- Use descriptive names that explain the test scenario

### Mock Strategy

```typescript
// Use jest.mock for external dependencies
jest.mock('../dflow/dflow.service');

// Use dependency injection for services
const mockDFlowService = {
  getDFlowEvents: jest.fn(),
  createOrder: jest.fn(),
};

// Create test builders for complex objects
const createTestPosition = (overrides?: Partial<UserPosition>) => ({
  id: 'test-id',
  walletAddress: 'test-wallet',
  balance: 100,
  ...overrides,
});
```

### Coverage Rules

- **Critical paths**: 100% coverage required
  - Financial calculations (P&L, prices)
  - Redemption logic
  - Order creation
  
- **Business logic**: 80%+ coverage required
  - Service methods
  - Resolvers
  - Complex utilities

- **UI components**: 70%+ coverage required
  - User interactions
  - State management
  - Error handling

---

## Risk Mitigation

### Identified Risks

1. **Time Investment**
   - Risk: Testing takes significant time from feature development
   - Mitigation: Incremental approach, prioritize critical paths
   - Impact: Medium

2. **Test Maintenance**
   - Risk: Tests become outdated as code evolves
   - Mitigation: Regular test reviews, clear ownership
   - Impact: Low

3. **Flaky Tests**
   - Risk: E2E tests may have timing issues
   - Mitigation: Proper waits, stable selectors, retry logic
   - Impact: Medium

4. **Learning Curve**
   - Risk: Team needs to learn testing best practices
   - Mitigation: Pair programming, code reviews, documentation
   - Impact: Low

---

## Dependencies & Prerequisites

### Infrastructure Requirements

- [x] PostgreSQL test database
- [x] Node.js 18+ environment
- [ ] Mock DFlow API server
- [ ] Test data fixtures

### Tool Installation

```bash
# Backend testing tools
pnpm add -D jest ts-jest @types/jest supertest @nestjs/testing

# Frontend testing tools
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# E2E testing tools
pnpm add -D playwright @playwright/test

# Coverage reporting
pnpm add -D codecov
```

### Documentation

- [ ] Testing guide for developers
- [ ] Best practices document
- [ ] CI/CD troubleshooting guide
- [ ] Mock API documentation

---

## Monitoring & Reporting

### Coverage Reports

- **Tool**: Jest built-in coverage + Codecov
- **Location**: `coverage/` directory (gitignored)
- **Reports**: HTML, LCOV, JSON formats
- **Integration**: Codecov dashboard for trends

### CI/CD Dashboards

- GitHub Actions workflow status
- Test execution time trends
- Flaky test detection
- Coverage change per PR

### Metrics to Track

1. **Test Count**: Total tests, by type
2. **Coverage**: Line, branch, function coverage
3. **Execution Time**: Per test suite
4. **Failure Rate**: Failed tests / total tests
5. **Flakiness**: Tests that fail inconsistently

---

## Team Responsibilities

### Test Ownership

| Area | Owner | Reviewer |
|------|-------|----------|
| Backend Unit Tests | Backend Dev | Tech Lead |
| Backend Integration | Backend Dev | Tech Lead |
| Frontend Unit Tests | Frontend Dev | Tech Lead |
| Frontend Integration | Frontend Dev | Tech Lead |
| E2E Tests | QA/Full Stack | Team |
| CI/CD Pipeline | DevOps/Lead | Team |

### Development Workflow

1. **Feature Development**:
   - Write tests alongside feature code (TDD encouraged)
   - Run tests locally before committing
   - Ensure coverage doesn't decrease

2. **Code Review**:
   - Review test coverage in PRs
   - Verify test quality and relevance
   - Check for proper mocking and assertions

3. **Continuous Improvement**:
   - Refactor tests as code evolves
   - Remove obsolete tests
   - Add tests for bug fixes

---

## Success Criteria

### Sprint 4 Completion

- [x] Testing infrastructure fully configured
- [x] 60%+ unit test coverage on backend
- [x] 50%+ integration test coverage
- [x] 5+ E2E critical flow tests
- [x] CI/CD pipeline running all tests
- [x] Coverage reports generated and tracked

### Long-term Goals (Sprint 5+)

- [x] 80%+ unit test coverage (all critical paths)
- [x] 70%+ integration test coverage
- [x] 20+ E2E tests covering major features
- [x] <3 minute test execution time
- [x] Zero flaky tests
- [x] Automated coverage enforcement in CI/CD

---

## Appendix

### A. Example Test Files

**Position Tracking Service Test**:
```typescript
// apps/backend/src/positions/__tests__/position-tracking.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PositionTrackingService } from '../position-tracking.service';
import { DFlowService } from '../../dflow/dflow.service';
import { createTestPosition } from './fixtures/position.fixture';

describe('PositionTrackingService', () => {
  let service: PositionTrackingService;
  let dflowService: jest.Mocked<DFlowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionTrackingService,
        {
          provide: DFlowService,
          useValue: {
            filterOutcomeMints: jest.fn(),
            getDFlowMarket: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PositionTrackingService>(PositionTrackingService);
    dflowService = module.get(DFlowService);
  });

  describe('calculatePosition', () => {
    it('should calculate unrealized P&L correctly', () => {
      // Arrange
      const position = createTestPosition({
        balance: 100,
        entryPrice: 0.50,
        currentPrice: 0.65,
      });

      // Act
      const pnl = service['calculateUnrealizedPnL'](position);

      // Assert
      expect(pnl).toBe(15); // (0.65 - 0.50) * 100 = 15
    });

    it('should handle negative P&L for losing positions', () => {
      // Arrange
      const position = createTestPosition({
        balance: 100,
        entryPrice: 0.70,
        currentPrice: 0.45,
      });

      // Act
      const pnl = service['calculateUnrealizedPnL'](position);

      // Assert
      expect(pnl).toBe(-25); // (0.45 - 0.70) * 100 = -25
    });
  });
});
```

### B. Test Data Fixtures

```typescript
// apps/backend/src/__tests__/fixtures/position.fixture.ts
import { UserPosition } from '../../positions/entities/user-position.entity';

export const createTestPosition = (
  overrides?: Partial<UserPosition>
): UserPosition => ({
  id: 'test-position-1',
  userId: 'test-user-1',
  walletAddress: '11111111111111111111111111111111',
  mint: 'token-mint-address',
  balance: 100,
  balanceRaw: '100000000000',
  decimals: 9,
  marketId: 'test-market',
  marketTitle: 'Test Market',
  outcome: 'YES',
  baseMint: 'USDC',
  entryPrice: 0.50,
  currentPrice: 0.60,
  marketPrice: 0.60,
  estimatedValue: 60,
  unrealizedPnL: 10,
  unrealizedPnLPercent: 20,
  marketStatus: 'ACTIVE',
  isRedeemable: false,
  positionType: 'PREDICTION',
  costBasis: 50,
  riskLevel: 'MEDIUM',
  daysHeld: 5,
  createdAt: new Date(),
  lastUpdated: new Date(),
  lastPriceUpdate: new Date(),
  trades: [],
  ...overrides,
});
```

### C. CI/CD Troubleshooting

**Common Issues**:

1. **Tests timeout in CI**
   - Increase timeout: `jest.setTimeout(30000)`
   - Check for async issues
   - Verify database connections close

2. **Database conflicts**
   - Use unique database per test suite
   - Clean up after tests
   - Use transactions for isolation

3. **Flaky E2E tests**
   - Add explicit waits
   - Use stable selectors
   - Implement retry logic

---

## Conclusion

This automation testing plan provides a comprehensive roadmap to address the critical testing gap identified in Sprint 3. By implementing this plan incrementally over Sprint 4 and Sprint 5, we will:

1. **Prevent regressions** through comprehensive test coverage
2. **Increase development velocity** with faster feedback loops
3. **Enable confident refactoring** with safety nets
4. **Support CI/CD deployment** with automated quality gates
5. **Maintain long-term code quality** as the project scales

**Next Steps**:
1. Review and approve this plan with the team
2. Begin Sprint 4 with infrastructure setup
3. Implement tests incrementally alongside new features
4. Track progress against coverage targets
5. Iterate and improve testing practices

**Status**: ✅ **READY FOR SPRINT 4 IMPLEMENTATION**

---

**Document Owner**: Development Team  
**Last Updated**: January 31, 2026  
**Next Review**: End of Sprint 4 (March 9, 2026)
