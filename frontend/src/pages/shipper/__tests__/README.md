# ShipperPickupPage Test Suite

## Welcome!

This directory contains a comprehensive test suite for the `ShipperPickupPage` component. Whether you're a developer new to this codebase or looking to understand the testing approach, this README will guide you.

## Quick Links

- **Main Test File**: [ShipperPickupPage.test.tsx](./ShipperPickupPage.test.tsx) (895 lines, 47+ tests)
- **Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - For quick lookups
- **Detailed Docs**: [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) - Complete breakdown
- **Testing Guide**: [../../../TESTING_GUIDE.md](../../../TESTING_GUIDE.md) - Overall testing approach

## What's Tested?

### The Basics
- Component renders without crashing
- Loading states work correctly
- Page title and description display

### API Integration
- Correct endpoint called: `getShipperAssignedOrders`
- Pagination parameters passed correctly
- Error handling works gracefully

### User Interactions
- **Search**: 300ms debounce, whitespace trimming
- **Pagination**: Next/previous navigation, boundary states
- **Pickup**: Confirmation dialog, success/error toasts
- **Fail Recording**: Dialog with reason input
- **Navigation**: Google Maps and phone calling

### Edge Cases
- Empty/whitespace search handling
- Missing optional order fields
- API error recovery
- Request cancellation

## Running the Tests

### First Time Setup
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
npm test
```

### Run Tests
```bash
npm test                           # All tests
npm test -- ShipperPickupPage      # Just this component
npm test -- --watch                # Watch mode
npm test -- --coverage             # Coverage report
npm test -- --ui                   # Visual runner
```

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Component Rendering | 3 | ✓ Complete |
| API Integration | 4 | ✓ Complete |
| Order Display | 6 | ✓ Complete |
| Search Functionality | 5 | ✓ Complete |
| Pagination | 5 | ✓ Complete |
| Pickup Action | 8 | ✓ Complete |
| Fail Pickup Action | 9 | ✓ Complete |
| Navigation Actions | 2 | ✓ Complete |
| Call Actions | 1 | ✓ Complete |
| Responsive Design | 1 | ✓ Complete |
| Edge Cases | 3 | ✓ Complete |
| **TOTAL** | **47+** | **✓ 100%** |

## Important Facts

### Component Details
- **Location**: `frontend/src/pages/shipper/ShipperPickupPage.tsx`
- **Responsibility**: Display orders for shipper pickup
- **Layout**: Mobile-responsive with map integration on desktop
- **State Management**: React hooks only

### Key Differences from ShipperDeliveryPage

This component is similar to ShipperDeliveryPage but:
- Uses **`getShipperAssignedOrders`** endpoint (pickup orders)
- Displays **sender** information (not receiver)
- Has labels like "Lấy hàng" (pickup) vs "Giao hàng" (delivery)

### Test Data
All tests use realistic Vietnamese data:
```typescript
{
  trackingNumber: 'TRK123456',
  senderName: 'Nguyễn Văn A',
  senderPhone: '0901234567',
  senderAddressLine1: '123 Đường Láng',
  senderWardName: 'Phường Láng Hạ',
  senderProvinceName: 'Hà Nội',
  // ... complete order data
}
```

## Test Structure

```typescript
describe('ShipperPickupPage', () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
    // ... mock setup
  });

  // Test categories
  describe('Component Rendering', () => {
    it('should render without errors', () => { /* ... */ });
  });

  describe('API Integration', () => {
    it('should call getShipperAssignedOrders', () => { /* ... */ });
  });

  // ... more categories
});
```

## Common Test Patterns

### Testing API Calls
```typescript
await waitFor(() => {
  expect(orderService.orderService.getShipperAssignedOrders)
    .toHaveBeenCalledWith(expect.objectContaining({
      page: 0,
      size: expect.any(Number),
      search: 'TRK123456'
    }));
});
```

### Testing User Actions
```typescript
const button = screen.getByText('Xong'); // Pickup button
fireEvent.click(button);

await waitFor(() => {
  expect(toast.success).toHaveBeenCalledWith('Đơn hàng đã được lấy');
});
```

### Testing Search Debounce
```typescript
vi.useFakeTimers();
const input = screen.getByPlaceholderText(/Tìm kiếm/);
await userEvent.type(input, 'TRK123456');

// Not called yet (debounce delay)
expect(mockService).not.toHaveBeenCalled();

vi.advanceTimersByTime(300);

// Now it's called
expect(mockService).toHaveBeenCalled();
vi.useRealTimers();
```

## File Structure

```
frontend/src/pages/shipper/__tests__/
├── README.md                          # This file
├── ShipperPickupPage.test.tsx          # Main test file (895 lines)
├── TEST_DOCUMENTATION.md               # Detailed test documentation
├── QUICK_REFERENCE.md                  # Quick lookup guide

frontend/src/test/
├── setup.ts                            # Global test setup
└── test-utils.tsx                      # Reusable test utilities

frontend/
├── vitest.config.ts                    # Vitest configuration
└── TESTING_GUIDE.md                    # Overall testing guide
```

## What Gets Mocked?

All external dependencies are mocked to isolate component testing:

| Mock | Purpose |
|------|---------|
| `orderService.getShipperAssignedOrders` | Order fetching |
| `orderService.markOrderDelivered` | Pickup confirmation |
| `orderService.markOrderDeliveryFailed` | Failure recording |
| `toast.success/error` | Notifications |
| `ShipperDeliveryMapPanel` | Map component |
| `window.open` | Navigation/calling |

## Key Test Assertions

### API Endpoint Check
```typescript
// The component MUST use this endpoint
expect(orderService.orderService.getShipperAssignedOrders)
  .toHaveBeenCalled();

// And NOT this one
expect(orderService.orderService.getShipperDeliveryOrders)
  .not.toHaveBeenCalled();
```

### Data Display Check
```typescript
// Shows sender info for pickup (not receiver)
expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument(); // Sender
expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument(); // Not receiver
```

### Interaction Check
```typescript
// Buttons work correctly
const pickupButton = screen.getByText('Xong');
expect(pickupButton).not.toBeDisabled();

fireEvent.click(pickupButton);

// Dialog shows confirmation
expect(mockWindowConfirm).toHaveBeenCalledWith('Xác nhận lấy hàng thành công?');
```

## Debugging

### See the DOM
```typescript
screen.debug();
```

### Log specific element
```typescript
screen.debug(screen.getByText('TRK123456'));
```

### Check mock calls
```typescript
console.log(orderService.orderService.getShipperAssignedOrders.mock.calls);
console.log(toast.error.mock.calls);
```

### Run just one test
```typescript
it.only('should test this', () => {
  // Only this test runs
});
```

## Troubleshooting

### Tests don't run
1. Install dependencies: `npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom`
2. Ensure `vitest.config.ts` exists in `frontend/`
3. Ensure `src/test/setup.ts` exists

### Component not rendering
1. Check all mocks are set up before render
2. Use `screen.debug()` to see what's there
3. Look for console errors

### Mock not working
1. Verify mock is before component import
2. Call `vi.clearAllMocks()` in beforeEach
3. Check mock returns correct data structure

### Tests timeout
1. Use `waitFor()` for async operations
2. Verify mocks resolve/reject properly
3. Check that AbortController isn't interfering

## Next Steps

### For First-Time Readers
1. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (5 min)
2. Look at test cases in [ShipperPickupPage.test.tsx](./ShipperPickupPage.test.tsx) (15 min)
3. Run tests: `npm test -- ShipperPickupPage` (1 min)
4. Play with a test - modify it and watch it fail (5 min)

### For Developers
1. Use this as a template for testing other components
2. Refer to [../../../TESTING_GUIDE.md](../../../TESTING_GUIDE.md) for patterns
3. Use `test-utils.tsx` for mock data factories
4. Run tests in watch mode while developing

### For DevOps/CI-CD
1. Add `npm test` to CI pipeline
2. Generate coverage: `npm test -- --coverage`
3. Use HTML coverage reports at `coverage/`
4. Consider enforcing coverage thresholds

## Resources

### Documentation
- [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) - Complete test breakdown
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Commands and patterns
- [../../../TESTING_GUIDE.md](../../../TESTING_GUIDE.md) - Overall testing guide

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## FAQ

### Q: Why use Vitest instead of Jest?
A: Vitest is faster, has better ESM support, and integrates seamlessly with Vite.

### Q: Why mock everything?
A: Unit tests should test component logic in isolation. Mocking dependencies makes tests fast and reliable.

### Q: Can I use these tests as integration tests?
A: These are unit tests. For integration tests, consider adding E2E tests with Cypress or Playwright.

### Q: How do I add more tests?
A: Follow the existing structure, use the test utilities, and refer to the test patterns in TEST_DOCUMENTATION.md.

### Q: Are there any components without tests?
A: Currently, this is the primary component with a full test suite. Use it as a template for others.

## Contributing

When adding features to ShipperPickupPage:
1. Write tests first (TDD) or alongside code
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm test -- --coverage`
4. Follow existing test patterns

## Support

Questions?
- Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- See [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) for detailed examples
- Review the test file itself - it's well-commented
- Refer to [../../../TESTING_GUIDE.md](../../../TESTING_GUIDE.md)

---

**Last Updated**: 2024-01-19
**Test Framework**: Vitest
**Component Status**: Fully Tested ✓
