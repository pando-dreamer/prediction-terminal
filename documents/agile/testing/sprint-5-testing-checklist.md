# Sprint 5: Testing Implementation Checklist

## Overview

**Sprint**: Sprint 5 (March 10 - March 21, 2026)  
**Goal**: Implement automated testing infrastructure and achieve 60%+ coverage  
**Status**: Ready for Implementation 📋

> **Note**: This checklist was moved from Sprint 4 to Sprint 5 to prioritize **Mobile-First UI Refactoring**. The mobile-first codebase will be tested with this infrastructure.

---

## Week 1: Infrastructure & Unit Tests

### Day 1 (Monday, Mar 10) - Infrastructure Setup

#### Morning: Backend Testing Setup

- [ ] Install Jest and dependencies
  ```bash
  cd apps/backend
  pnpm add -D jest ts-jest @types/jest @nestjs/testing supertest
  ```
- [ ] Create `jest.config.js` with TypeScript preset
- [ ] Configure coverage thresholds (80% for critical paths)
- [ ] Create test database setup script
- [ ] Add test scripts to `package.json`
- [ ] Verify tests run: `pnpm test`

#### Afternoon: Frontend Testing Setup

- [ ] Install React Testing Library
  ```bash
  cd apps/frontend
  pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
  ```
- [ ] Create `jest.config.js` with jsdom environment
- [ ] Create `setupTests.ts` file
- [ ] Add test scripts to `package.json`
- [ ] Create sample component test
- [ ] Verify tests run: `pnpm test`

#### Evening: CI/CD Setup

- [ ] Create `.github/workflows/test.yml`
- [ ] Configure test database service in workflow
- [ ] Add unit test job
- [ ] Add coverage upload to Codecov
- [ ] Test workflow with dummy test
- [ ] Document CI/CD setup

**Deliverables**: ✅ Complete testing infrastructure

---

### Day 2 (Tuesday, Mar 11) - Test Fixtures & Position Tests (Part 1)

#### Morning: Test Fixtures

- [ ] Create `apps/backend/src/__tests__/fixtures/` directory
- [ ] Implement `position.fixture.ts` with builder pattern
- [ ] Implement `market.fixture.ts`
- [ ] Implement `wallet.fixture.ts`
- [ ] Implement `trade.fixture.ts`
- [ ] Implement `price.fixture.ts`
- [ ] Document fixture usage in README

#### Afternoon: Position Tracking Tests (Discovery)

- [ ] Create `position-tracking.service.spec.ts`
- [ ] Test suite setup with mocks
- [ ] Tests for `discoverNewPositions()`
  - [ ] Should fetch Token 2022 accounts
  - [ ] Should filter outcome mints
  - [ ] Should handle empty wallet
  - [ ] Should handle API errors
  - [ ] Should cache results
- [ ] Run tests: `pnpm test position-tracking`

**Deliverables**: ✅ Test fixtures + position discovery tests

---

### Day 3 (Wednesday, Mar 12) - Position Tests (Part 2)

#### Morning: Position Calculation Tests

- [ ] Tests for `calculatePosition()`
  - [ ] Should calculate entry price from trades
  - [ ] Should compute unrealized P&L correctly
  - [ ] Should handle zero balance positions
  - [ ] Should calculate P&L percentage
  - [ ] Should determine redeemable status
  - [ ] Should assess risk level
- [ ] Run tests and verify coverage: `pnpm test:coverage`

#### Afternoon: Portfolio Summary Tests

- [ ] Tests for `calculatePortfolioSummary()`
  - [ ] Should sum total portfolio value
  - [ ] Should calculate total P&L
  - [ ] Should compute win rate
  - [ ] Should identify largest position
  - [ ] Should handle empty portfolio
  - [ ] Should calculate diversification
- [ ] Run full test suite
- [ ] Check coverage report

**Deliverables**: ✅ 50%+ coverage on PositionTrackingService

---

### Day 4 (Thursday, Mar 13) - Redemption & DFlow Tests

#### Morning: Redemption Service Tests

- [ ] Create `redemption.service.spec.ts`
- [ ] Tests for `createRedemptionOrder()`
  - [ ] Should validate position is redeemable
  - [ ] Should create order via DFlow
  - [ ] Should handle slippage protection
  - [ ] Should track transaction signature
  - [ ] Should handle failed redemptions
- [ ] Tests for status tracking
- [ ] Run tests: `pnpm test redemption`

#### Afternoon: DFlow Service Tests

- [ ] Create `dflow.service.spec.ts`
- [ ] Tests for `getDFlowEvents()`
  - [ ] Should fetch events with pagination
  - [ ] Should handle search queries
  - [ ] Should filter by status
  - [ ] Should cache responses
- [ ] Tests for `getDFlowMarkets()`
- [ ] Tests for `createOrder()`
- [ ] Run tests: `pnpm test dflow`

**Deliverables**: ✅ Redemption + DFlow service tests

---

### Day 5 (Friday, Mar 14) - Frontend Tests & Review

#### Morning: Portfolio Component Tests

- [ ] Create `PortfolioOverview.spec.tsx`
  - [ ] Should render portfolio value
  - [ ] Should display P&L with color coding
  - [ ] Should show win rate
  - [ ] Should handle loading state
  - [ ] Should handle error state
- [ ] Create `PositionCard.spec.tsx`
  - [ ] Should render position details
  - [ ] Should show P&L
  - [ ] Should display redemption button
  - [ ] Should handle click events
- [ ] Run tests: `pnpm test`

#### Afternoon: Review & Coverage Check

- [ ] Run full test suite (backend + frontend)
- [ ] Generate coverage report
- [ ] Review coverage gaps
- [ ] Add tests for uncovered critical paths
- [ ] Document week 1 progress
- [ ] Create list of remaining tests for week 2

**Deliverables**: ✅ 60%+ unit test coverage

---

## Week 2: Integration Tests & E2E Setup

### Day 6 (Monday, Mar 17) - Backend Integration Setup

#### Morning: Test Database Setup

- [ ] Create test database docker-compose service
- [ ] Implement database seeding utilities
- [ ] Create `TestDatabase` helper class
- [ ] Test database setup/teardown
- [ ] Document database testing approach

#### Afternoon: Position Tracking Integration

- [ ] Create `position-tracking.integration.spec.ts`
- [ ] Test full position discovery flow
  - [ ] Should discover → calculate → persist
  - [ ] Should update existing positions
  - [ ] Should handle concurrent updates
  - [ ] Should maintain data consistency
- [ ] Run integration tests: `pnpm test:integration`

**Deliverables**: ✅ Test database + position flow tests

---

### Day 7 (Tuesday, Mar 18) - GraphQL Integration Tests

#### Morning: GraphQL Test Setup

- [ ] Configure supertest for NestJS
- [ ] Create GraphQL test utilities
- [ ] Implement mock DFlow responses

#### Afternoon: GraphQL Query Tests

- [ ] Create `graphql.integration.spec.ts`
- [ ] Test position queries
  - [ ] userPositions with filters
  - [ ] portfolioSummary with calculations
  - [ ] redeemablePositions
- [ ] Test events queries
  - [ ] dflowEvents with pagination
  - [ ] tagsByCategories
  - [ ] seriesByTags
- [ ] Run tests: `pnpm test:integration`

**Deliverables**: ✅ GraphQL integration tests

---

### Day 8 (Wednesday, Mar 19) - GraphQL Mutations & Frontend

#### Morning: Mutation Tests

- [ ] Test `refreshUserPositions`
  - [ ] Should trigger position sync
  - [ ] Should update database
  - [ ] Should return updated count
- [ ] Test `redeemPosition`
  - [ ] Should create redemption order
  - [ ] Should update position status
  - [ ] Should track transaction
- [ ] Run integration tests

#### Afternoon: Frontend Integration

- [ ] Create `apollo.integration.spec.tsx`
- [ ] Test query execution and caching
- [ ] Test mutation updates
- [ ] Test optimistic updates
- [ ] Test error handling
- [ ] Run tests: `pnpm test`

**Deliverables**: ✅ Mutation + frontend integration tests

---

### Day 9 (Thursday, Mar 20) - E2E Setup & Critical Flows

#### Morning: Playwright Setup

- [ ] Install Playwright
  ```bash
  pnpm add -D playwright @playwright/test
  pnpm exec playwright install
  ```
- [ ] Create `playwright.config.ts`
- [ ] Set up test fixtures and helpers
- [ ] Create first E2E test (smoke test)

#### Afternoon: Critical E2E Tests

- [ ] Create `e2e/position-discovery.spec.ts`
  - [ ] Should connect wallet
  - [ ] Should load positions
  - [ ] Should display portfolio summary
  - [ ] Should filter positions
- [ ] Create `e2e/position-redemption.spec.ts`
  - [ ] Should redeem winning position
- [ ] Run E2E tests: `pnpm test:e2e`

**Deliverables**: ✅ E2E infrastructure + 5 critical tests

---

### Day 10 (Friday, Mar 21) - Coverage & Documentation

#### Morning: Coverage Review

- [ ] Run full test suite
- [ ] Generate coverage reports
- [ ] Identify gaps in coverage
- [ ] Add tests for critical uncovered paths
- [ ] Verify coverage thresholds met

#### Afternoon: Documentation & Sprint Review

- [ ] Update testing documentation
- [ ] Create developer testing guide
- [ ] Document CI/CD pipeline
- [ ] Prepare sprint demo
- [ ] Create sprint retrospective notes
- [ ] Plan remaining tests for Sprint 6

**Deliverables**: ✅ Sprint 5 complete with documentation

---

## Success Criteria Verification

### At End of Week 1

- [ ] ✅ Testing infrastructure fully configured
- [ ] ✅ All test commands working
- [ ] ✅ CI/CD pipeline running tests
- [ ] ✅ 60%+ unit test coverage (backend)
- [ ] ✅ 50%+ unit test coverage (frontend)

### At End of Week 2

- [ ] ✅ 70%+ unit test coverage (backend)
- [ ] ✅ 60%+ unit test coverage (frontend)
- [ ] ✅ 50%+ integration test coverage
- [ ] ✅ 5+ E2E critical flow tests
- [ ] ✅ Coverage reports in CI/CD
- [ ] ✅ Zero flaky tests

---

## Daily Standup Questions

**What did I test yesterday?**

- List test suites implemented
- Coverage achieved

**What am I testing today?**

- Target test files
- Expected coverage increase

**Any testing blockers?**

- Infrastructure issues
- Mocking challenges
- Coverage gaps

---

## Testing Commands Reference

```bash
# Backend
pnpm test                    # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage
pnpm test:debug             # Debug mode

# Frontend
cd apps/frontend
pnpm test                    # Run all tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage

# E2E
pnpm test:e2e               # Run E2E tests
pnpm exec playwright test --ui  # Interactive mode
pnpm exec playwright show-report  # View report

# CI/CD
git push                     # Triggers test workflow
```

---

## Coverage Monitoring

### Check Coverage Daily

```bash
# Backend coverage
cd apps/backend
pnpm test:coverage
open coverage/lcov-report/index.html

# Frontend coverage
cd apps/frontend
pnpm test:coverage
open coverage/lcov-report/index.html
```

### Coverage Targets by File

| File                         | Target | Status         |
| ---------------------------- | ------ | -------------- |
| position-tracking.service.ts | 80%    | ⏳ In Progress |
| redemption.service.ts        | 80%    | ⏳ In Progress |
| dflow.service.ts             | 75%    | ⏳ In Progress |
| positions.resolver.ts        | 70%    | ⏳ In Progress |
| PortfolioOverview.tsx        | 75%    | ⏳ In Progress |
| PositionCard.tsx             | 75%    | ⏳ In Progress |
| Portfolio.tsx                | 70%    | ⏳ In Progress |

---

## Troubleshooting

### Common Issues

**Tests timeout:**

```typescript
jest.setTimeout(30000); // Increase timeout
```

**Database connection errors:**

```bash
docker-compose -f docker-compose.test.yml up -d
```

**Module resolution errors:**

```typescript
// Add to jest.config.js
moduleNameMapper: {
  '^src/(.*)$': '<rootDir>/src/$1',
}
```

**React Testing Library errors:**

```typescript
// Add to setupTests.ts
import '@testing-library/jest-dom';
```

---

## Sprint 4 End Goals

### Code Coverage

- [x] Backend: 60%+ unit, 50%+ integration
- [x] Frontend: 50%+ unit, 40%+ integration
- [x] E2E: 5+ critical flows

### Infrastructure

- [x] Jest configured and working
- [x] Playwright configured and working
- [x] CI/CD running all tests
- [x] Coverage reports generated

### Documentation

- [x] Testing quick start guide
- [x] Developer testing documentation
- [x] CI/CD troubleshooting guide
- [x] Test fixture documentation

---

**Sprint Status**: Ready for Implementation ✅  
**Next Review**: End of Week 1 (Feb 28, 2026)  
**Final Review**: End of Sprint 4 (Mar 7, 2026)
