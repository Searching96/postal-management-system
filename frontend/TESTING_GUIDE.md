# Frontend Testing Guide

This guide explains the testing infrastructure and patterns used in the postal management system frontend.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Testing Framework Setup](#testing-framework-setup)
3. [Test Files](#test-files)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Install Testing Dependencies
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### Run Tests
```bash
npm test
```

### Run Tests for ShipperPickupPage
```bash
npm test -- ShipperPickupPage
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Testing Framework Setup

### Tools Used
- **Vitest**: Fast unit test framework (Vue/React compatible)
- **React Testing Library**: User-centric testing utilities
- **jsdom**: DOM simulation for Node.js

### Configuration Files

#### 1. `vitest.config.ts`
Main Vitest configuration with:
- jsdom environment for DOM testing
- Setup files for global test utilities
- Coverage configuration

#### 2. `src/test/setup.ts`
Global test setup that:
- Cleans up after each test
- Mocks window.matchMedia for responsive tests
- Mocks IntersectionObserver API

#### 3. `src/test/test-utils.tsx`
Reusable test utilities including:
- Mock data factories
- Custom render functions
- Service mock helpers
- Common test data

## Test Files

### ShipperPickupPage Test Suite
**Location**: `frontend/src/pages/shipper/__tests__/ShipperPickupPage.test.tsx`

**Statistics**:
- Lines of code: 895
- Test cases: 47+
- Test categories: 11

**Coverage Areas**:
1. Component rendering
2. API integration
3. Order display
4. Search functionality
5. Pagination
6. Pickup action
7. Fail pickup action
8. Navigation actions
9. Call actions
10. Responsive behavior
11. Edge cases

See `ShipperPickupPage.test.tsx` and `frontend/src/pages/shipper/__tests__/TEST_DOCUMENTATION.md` for detailed information.

## Writing Tests

### Basic Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Mocking Dependencies
```typescript
// Mock a service
vi.mock('../services/orderService');

// Mock a component
vi.mock('../components/MapPanel', () => ({
  MapPanel: () => <div data-testid="map">Map</div>
}));

// Mock window methods
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
});
```

### Testing Async Operations
```typescript
it('should handle async data', async () => {
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  const user = userEvent.setup();
  render(<Component />);

  const input = screen.getByPlaceholderText('Search');
  await user.type(input, 'search term');

  expect(input).toHaveValue('search term');
});
```

### Testing Search with Debounce
```typescript
it('should debounce search', async () => {
  vi.useFakeTimers();
  render(<Component />);

  const input = screen.getByPlaceholderText(/search/i);
  await userEvent.type(input, 'test');

  // Should not have called API yet
  expect(mockService).not.toHaveBeenCalled();

  // Advance past debounce time
  vi.advanceTimersByTime(300);

  // Now API should be called
  await waitFor(() => {
    expect(mockService).toHaveBeenCalled();
  });

  vi.useRealTimers();
});
```

### Testing Pagination
```typescript
it('should navigate to next page', async () => {
  render(<Component />);

  const nextButton = screen.getByText('Next');
  fireEvent.click(nextButton);

  await waitFor(() => {
    expect(mockService).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });
});
```

### Testing Dialogs/Modals
```typescript
it('should open dialog when button clicked', async () => {
  render(<Component />);

  const button = screen.getByText('Open Dialog');
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });
});
```

### Testing Error Handling
```typescript
it('should show error message on API failure', async () => {
  mockService.mockRejectedValue(new Error('API Error'));

  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});
```

### Using Test Utilities
```typescript
import {
  createMockOrder,
  createMockPageResponse,
  setupOrderServiceMocks,
  findButtonsByText,
  TEST_DATA,
} from '../test/test-utils';

it('should display orders', () => {
  const orders = [
    createMockOrder({ trackingNumber: 'TRK001' }),
    createMockOrder({ trackingNumber: 'TRK002' }),
  ];
  const pageResponse = createMockPageResponse(orders);

  render(<Component data={pageResponse} />);

  expect(screen.getByText('TRK001')).toBeInTheDocument();
  expect(screen.getByText('TRK002')).toBeInTheDocument();
});
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- ShipperPickupPage
```

### Run Tests Matching Pattern
```bash
npm test -- --grep "pagination"
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

### UI Mode (Visual Test Runner)
```bash
npm test -- --ui
```

### Run Single Test
```typescript
it.only('should test this only', () => {
  // This test will run in isolation
});
```

### Skip Test
```typescript
it.skip('should skip this test', () => {
  // This test won't run
});
```

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// Good: Test what users see
it('should show error message', async () => {
  render(<Component />);
  expect(screen.getByText('Error occurred')).toBeInTheDocument();
});

// Bad: Test internal state
it('should set error state', () => {
  const { getByTestId } = render(<Component />);
  expect(getByTestId('component').state.error).toBe(true);
});
```

### 2. Use Semantic Queries
```typescript
// Good: Semantic queries match user experience
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText(/search/i)

// Bad: Implementation detail queries
screen.getByTestId('button-component')
container.querySelector('.button')
```

### 3. Wait for Async Updates
```typescript
// Good: Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Data')).toBeInTheDocument();
});

// Bad: Don't use arbitrary timeouts
setTimeout(() => {
  expect(screen.getByText('Data')).toBeInTheDocument();
}, 1000);
```

### 4. Clean Up After Tests
```typescript
// Vitest and React Testing Library do this automatically
// via afterEach cleanup, but be explicit with mocks

beforeEach(() => {
  vi.clearAllMocks();
});
```

### 5. Mock External Dependencies
```typescript
// Mock services, APIs, external libraries
vi.mock('../services/api');
vi.mock('sonner'); // Toast library
vi.mock('leaflet'); // Map library
```

### 6. Test Error Cases
```typescript
it('should handle errors gracefully', async () => {
  mockService.mockRejectedValue(new Error('Network error'));
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});
```

### 7. Test Loading States
```typescript
it('should show loading spinner', () => {
  mockService.mockImplementation(
    () => new Promise(r => setTimeout(r, 1000))
  );

  render(<Component />);
  expect(screen.getByText('Loading')).toBeInTheDocument();
});
```

### 8. Use Meaningful Test Names
```typescript
// Good: Describes behavior
it('should disable submit button when form is invalid', () => {});

// Bad: Too vague
it('should work', () => {});
```

### 9. Group Related Tests
```typescript
describe('Search Functionality', () => {
  it('should filter results', () => {});
  it('should debounce input', () => {});
  it('should clear results', () => {});
});
```

### 10. Keep Tests DRY
```typescript
// Use beforeEach for common setup
beforeEach(() => {
  mockService.mockResolvedValue({
    content: [mockOrder],
    totalPages: 1,
  });
});

// Use factories for test data
const order = createMockOrder({ trackingNumber: 'TRK123' });
```

## Troubleshooting

### Issue: Tests Fail with "Cannot find module"
**Solution**: Check import paths and ensure mocks are set up before component import.

### Issue: "waitFor" Timeout
**Solution**: Ensure:
1. Mock is set up correctly
2. Component actually renders the element
3. Async operation is complete

```typescript
// Debug by printing DOM
screen.debug();
```

### Issue: Event Handlers Not Firing
**Solution**: Use fireEvent or userEvent correctly:

```typescript
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// fireEvent: Low-level event
fireEvent.click(button);

// userEvent: More realistic user interactions
await userEvent.click(button);
```

### Issue: "Cannot update component during test"
**Solution**: This usually means:
1. API is being called after unmount
2. Timer is not cleaned up
3. AbortController is not properly implemented

### Issue: Flaky Tests (Sometimes Pass, Sometimes Fail)
**Solution**:
1. Don't use arbitrary timeouts
2. Use proper async/await patterns
3. Use fake timers when testing debounce/throttle
4. Ensure mocks are cleared between tests

### Issue: Tests Run Slowly
**Solution**:
1. Use fake timers for time-based operations
2. Mock external services
3. Run tests in parallel (Vitest default)
4. Use test.concurrent for independent tests

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Contributing

When adding new features:
1. Write tests first (TDD) or alongside code
2. Follow existing test patterns
3. Ensure tests are readable and maintainable
4. Aim for 70%+ code coverage
5. Test behavior, not implementation

## Test Maintenance

- Review tests when refactoring
- Update tests when changing component behavior
- Keep test data realistic
- Remove obsolete tests
- Refactor duplicated test code
