# Testing Quick Start Guide

## Overview

Quick reference for developers to start writing and running tests in the Prediction Terminal project.

---

## Setup (One-Time)

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Verify Setup

```bash
# Backend tests
cd apps/backend
pnpm test --version

# Frontend tests
cd apps/frontend
pnpm test --version

# E2E tests
pnpm exec playwright --version
```

---

## Running Tests

### Backend Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test position-tracking.service.spec.ts

# Debug tests
pnpm test:debug
```

### Frontend Tests

```bash
cd apps/frontend

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Specific component
pnpm test Portfolio
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (interactive)
pnpm exec playwright test --ui

# Run specific test
pnpm exec playwright test position-discovery

# Generate report
pnpm exec playwright show-report
```

---

## Writing Tests

### Backend Unit Test Template

```typescript
// apps/backend/src/module/__tests__/service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from '../my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('myMethod', () => {
    it('should return expected result', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = service.myMethod(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Frontend Component Test Template

```typescript
// apps/frontend/src/components/__tests__/MyComponent.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Template

```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000');
    
    // Perform actions
    await page.click('button[data-testid="connect-wallet"]');
    
    // Assert results
    await expect(page.locator('.portfolio-value')).toBeVisible();
  });
});
```

---

## Testing Best Practices

### ✅ Do's

- Write tests alongside feature code
- Use descriptive test names: "should do X when Y"
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios
- Keep tests focused and independent
- Use test fixtures for complex data

### ❌ Don'ts

- Don't test implementation details
- Don't write tests that depend on other tests
- Don't hardcode dates/times (use mocks)
- Don't test external APIs directly
- Don't skip error handling tests
- Don't commit `.only()` or `.skip()`

---

## Common Testing Patterns

### Mocking DFlow Service

```typescript
const mockDFlowService = {
  getDFlowEvents: jest.fn().mockResolvedValue([]),
  getDFlowMarket: jest.fn().mockResolvedValue(mockMarket),
  createOrder: jest.fn().mockResolvedValue({ signature: 'abc123' }),
};
```

### Testing Async Functions

```typescript
it('should fetch positions asynchronously', async () => {
  const positions = await service.fetchUserPositions('wallet123');
  expect(positions).toHaveLength(3);
});
```

### Testing Error Handling

```typescript
it('should handle API errors gracefully', async () => {
  mockDFlowService.getDFlowEvents.mockRejectedValue(new Error('API Error'));
  
  await expect(service.getEvents()).rejects.toThrow('API Error');
});
```

### Testing React Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '@apollo/client';

it('should fetch data with hook', async () => {
  const { result } = renderHook(() => useQuery(GET_POSITIONS));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toBeDefined();
});
```

---

## Coverage Reports

### View Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Targets

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **Critical Paths**: 100% coverage

---

## CI/CD Integration

### Pre-commit Hook

Tests run automatically before commits. To bypass (not recommended):

```bash
git commit --no-verify
```

### Pull Request Checks

All PRs must pass:
- ✅ Unit tests
- ✅ Integration tests
- ✅ Coverage thresholds
- ✅ Linting

---

## Debugging Tests

### Backend Tests

```bash
# VS Code debugger
# Add breakpoint in test file
# Run "Jest: Debug" from command palette

# Or use Node debugger
node --inspect-brk -r ts-node/register node_modules/.bin/jest --runInBand
```

### Frontend Tests

```bash
# Run with debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Run with UI mode for debugging
pnpm exec playwright test --ui

# Run with headed browser
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test --debug position-discovery.spec.ts
```

---

## Useful Commands Reference

```bash
# Install test dependencies
pnpm add -D jest ts-jest @types/jest

# Update snapshots
pnpm test -- -u

# Run tests matching pattern
pnpm test -- --testNamePattern="should calculate"

# Run tests in specific file
pnpm test position-tracking

# Clear Jest cache
pnpm test -- --clearCache

# List all tests
pnpm test -- --listTests
```

---

## Getting Help

- **Documentation**: See [automation-testing-plan.md](./automation-testing-plan.md)
- **Examples**: Check `__tests__/` directories for examples
- **Team**: Ask in development channel
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Playwright**: https://playwright.dev/docs/intro

---

**Quick Links**:
- [Full Testing Plan](./automation-testing-plan.md)
- [Jest Configuration](../../apps/backend/jest.config.js)
- [Playwright Configuration](../../playwright.config.ts)
- [Test Fixtures](../../apps/backend/src/__tests__/fixtures/)
