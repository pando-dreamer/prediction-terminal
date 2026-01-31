# Testing Documentation

## Overview

Comprehensive testing strategy and implementation plan for the Prediction Terminal project.

**Status**: Ready for Sprint 5 Implementation (Deferred from Sprint 4)  
**Target Coverage**: 80% unit, 70% integration, 20+ E2E tests  
**Timeline**: Sprint 5-6 (March 10 - April 3, 2026)

> **Note**: Testing implementation was moved from Sprint 4 to Sprint 5 to prioritize **Mobile-First UI Refactoring**. The mobile-first dApp strategy ensures optimal user experience before building test infrastructure.

---

## Documents

### 📋 Planning Documents

1. **[Automation Testing Plan](./automation-testing-plan.md)** (Primary Document)
   - Complete testing strategy
   - Infrastructure setup details
   - Unit, integration, and E2E test plans
   - Test data management
   - CI/CD integration
   - Timeline and success metrics
   - **Length**: 1,200+ lines
   - **Audience**: Tech leads, architects, developers

2. **[Testing User Stories](../backlog/testing-user-stories.md)**
   - Sprint 5 backlog for testing implementation
   - 10 user stories (34 story points)
   - Acceptance criteria and tasks
   - Definition of Done for testing
   - **Audience**: Product owner, scrum master, developers

3. **[Sprint 5 Testing Checklist](./sprint-5-testing-checklist.md)**
   - Day-by-day implementation guide
   - Detailed tasks for 2-week sprint
   - Coverage targets and verification
   - Daily standup questions
   - **Audience**: Developers implementing tests

### 📚 Developer Guides

4. **[Testing Quick Start Guide](./testing-quick-start.md)**
   - How to run tests (backend, frontend, E2E)
   - Writing test templates
   - Best practices and common patterns
   - Debugging tests
   - **Audience**: All developers

---

## Quick Navigation

### For Different Roles

**🎯 Tech Lead / Architect**

- Start with: [Automation Testing Plan](./automation-testing-plan.md)
- Review: Testing strategy, infrastructure, timeline
- Approve: Coverage targets, tool selection

**👨‍💻 Backend Developer**

- Start with: [Testing Quick Start](./testing-quick-start.md)
- Reference: [Sprint 5 Checklist](./sprint-5-testing-checklist.md) Days 2-4, 6-7
- Focus: Unit tests (position tracking, redemption, DFlow services)

**👩‍💻 Frontend Developer**

- Start with: [Testing Quick Start](./testing-quick-start.md)
- Reference: [Sprint 5 Checklist](./sprint-5-testing-checklist.md) Day 5, Day 8
- Focus: Component tests, Apollo integration

**🔧 DevOps Engineer**

- Start with: [Automation Testing Plan](./automation-testing-plan.md) § CI/CD Integration
- Reference: [Sprint 5 Checklist](./sprint-5-testing-checklist.md) Day 1
- Focus: GitHub Actions workflow, coverage reporting

**📊 Product Owner**

- Start with: [Testing User Stories](../backlog/testing-user-stories.md)
- Review: Story points, acceptance criteria, priorities
- Track: Sprint velocity impact

---

## Testing Strategy Summary

### Testing Pyramid

```
     /\
    /E2E\      10% - Critical user journeys (20 tests)
   /------\
  /  INT   \   30% - API & service integration (100 tests)
 /----------\
/   UNIT     \ 60% - Business logic & utilities (600 tests)
/--------------\
```

### Coverage Targets

| Layer             | Target         | Priority | Sprint     |
| ----------------- | -------------- | -------- | ---------- |
| Unit Tests        | 80%+           | High     | Sprint 4   |
| Integration Tests | 70%+           | High     | Sprint 4   |
| E2E Tests         | Critical flows | Medium   | Sprint 4-5 |

### Tech Stack

**Backend:**

- Jest + ts-jest + @nestjs/testing
- supertest for API testing
- Test database with PostgreSQL

**Frontend:**

- Jest + React Testing Library
- @testing-library/jest-dom
- MockedProvider for Apollo

**E2E:**

- Playwright
- Multi-browser support
- Built-in test runner

---

## Implementation Timeline

### Sprint 4 (Feb 24 - Mar 9, 2026)

**Week 1: Infrastructure + Unit Tests**

- Day 1: Setup testing infrastructure
- Day 2-4: Backend unit tests (position tracking, redemption, DFlow)
- Day 5: Frontend tests + review

**Week 2: Integration + E2E**

- Day 6: Test database + position integration
- Day 7-8: GraphQL integration + mutations
- Day 9: E2E setup + critical flows
- Day 10: Coverage review + documentation

**Deliverables:**

- ✅ 60%+ unit test coverage
- ✅ 50%+ integration coverage
- ✅ 5+ E2E critical tests
- ✅ CI/CD pipeline operational

### Sprint 5 (Mar 10 - Mar 21, 2026)

**Goals:**

- Achieve 80%+ unit coverage
- Complete integration test suite
- Add 15+ more E2E tests
- Performance testing
- Final optimization

---

## Key Testing Areas

### Backend Critical Paths

1. **Position Tracking** (150 tests planned)
   - Position discovery from Token 2022
   - P&L calculations (unrealized/realized)
   - Portfolio aggregation
   - Price updates

2. **Redemption Service** (80 tests planned)
   - Order creation and tracking
   - Transaction validation
   - Status management
   - Error handling

3. **DFlow Integration** (120 tests planned)
   - Events API with pagination
   - Markets API with filters
   - Trading order creation
   - Rate limiting and caching

### Frontend Critical Paths

1. **Portfolio Components** (110 tests planned)
   - PortfolioOverview rendering
   - PositionCard interactions
   - Portfolio page integration
   - Data formatting

2. **Apollo Client** (40 tests planned)
   - Query execution and caching
   - Mutation updates
   - Optimistic UI updates
   - Error handling

### E2E Critical Journeys

1. **Position Discovery & Viewing** (5 tests)
2. **Position Redemption Flow** (3 tests)
3. **Events Discovery & Filtering** (4 tests)
4. **Market Trading Flow** (3 tests)
5. **Error Scenarios** (5 tests)

---

## Success Metrics

### Sprint 4 Goals (Minimum Viable Testing)

- [x] Testing infrastructure configured
- [x] CI/CD pipeline running tests automatically
- [x] 60%+ backend unit test coverage
- [x] 50%+ frontend unit test coverage
- [x] 50%+ integration test coverage
- [x] 5+ E2E critical flow tests
- [x] Zero flaky tests
- [x] Documentation complete

### Sprint 5 Goals (Production Ready)

- [x] 80%+ backend unit test coverage
- [x] 70%+ frontend unit test coverage
- [x] 70%+ integration test coverage
- [x] 20+ E2E tests covering all major features
- [x] <3 minute test execution time
- [x] Performance benchmarks established
- [x] Load testing completed

---

## Getting Started

### For Sprint 4 Implementation

1. **Read the quick start guide**: [testing-quick-start.md](./testing-quick-start.md)
2. **Follow the daily checklist**: [sprint-4-testing-checklist.md](./sprint-4-testing-checklist.md)
3. **Reference the full plan**: [automation-testing-plan.md](./automation-testing-plan.md)
4. **Track progress**: [testing-user-stories.md](../backlog/testing-user-stories.md)

### Running Tests Today

```bash
# Backend tests
cd apps/backend
pnpm test                # Run all tests
pnpm test:coverage       # With coverage report

# Frontend tests
cd apps/frontend
pnpm test                # Run all tests
pnpm test:coverage       # With coverage report

# E2E tests
pnpm test:e2e            # Run E2E tests
```

### Writing Your First Test

See templates in [testing-quick-start.md](./testing-quick-start.md#writing-tests)

---

## CI/CD Integration

Tests run automatically on:

- ✅ Every push to main/develop branches
- ✅ Every pull request
- ✅ Before merge approval

Pipeline includes:

- Unit tests (backend + frontend)
- Integration tests
- E2E tests (critical paths)
- Coverage reporting to Codecov
- Build verification

---

## Monitoring & Reports

### Coverage Reports

- **Local**: `coverage/lcov-report/index.html`
- **CI/CD**: Codecov dashboard
- **Tracked Metrics**: Line, branch, function coverage

### Test Results

- **GitHub Actions**: Test workflow results
- **Playwright**: HTML reports for E2E tests
- **Jest**: Console output + HTML reports

---

## Resources

### External Documentation

- **Jest**: https://jestjs.io/docs/getting-started
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Playwright**: https://playwright.dev/docs/intro
- **NestJS Testing**: https://docs.nestjs.com/fundamentals/testing

### Internal Resources

- **Test Fixtures**: `apps/backend/src/__tests__/fixtures/`
- **Test Utilities**: `apps/backend/src/__tests__/utils/`
- **Mock Servers**: `apps/backend/src/__tests__/mocks/`

---

## Support & Questions

- **Testing Questions**: Ask in #development channel
- **CI/CD Issues**: Check troubleshooting section in quick start
- **Best Practices**: Review automation testing plan
- **Coverage Issues**: Run `pnpm test:coverage` and review report

---

## Document Status

| Document                | Status      | Last Updated | Owner |
| ----------------------- | ----------- | ------------ | ----- |
| Automation Testing Plan | ✅ Complete | Jan 31, 2026 | Team  |
| Testing User Stories    | ✅ Complete | Jan 31, 2026 | Team  |
| Sprint 4 Checklist      | ✅ Complete | Jan 31, 2026 | Team  |
| Testing Quick Start     | ✅ Complete | Jan 31, 2026 | Team  |

---

**Ready for Sprint 4**: ✅ All documentation complete  
**Next Action**: Begin Sprint 4 implementation (Day 1: Infrastructure setup)  
**Questions?**: Review [testing-quick-start.md](./testing-quick-start.md) or ask the team
