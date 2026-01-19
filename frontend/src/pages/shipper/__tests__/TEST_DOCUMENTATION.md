# ShipperPickupPage Test Documentation

## Overview
This document describes the comprehensive test suite for the `ShipperPickupPage` component. The test file contains 895 lines of code covering all major functionality and edge cases.

## Test File Location
```
frontend/src/pages/shipper/__tests__/ShipperPickupPage.test.tsx
```

## Test Framework & Dependencies
- **Test Runner**: Vitest
- **UI Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event

### Mocked Dependencies
- `orderService.getShipperAssignedOrders()` - Fetches assigned orders for shipper
- `orderService.markOrderDelivered()` - Marks an order as picked up
- `orderService.markOrderDeliveryFailed()` - Records failed pickup with reason
- `sonner.toast` - Toast notifications (success/error)
- `ShipperDeliveryMapPanel` - Map component

## Test Coverage Summary

### 1. Component Rendering (3 tests)
- ✓ Component renders without errors
- ✓ Displays loading spinner during initial load
- ✓ Shows page title, description, and element count

### 2. API Integration (4 tests)
- ✓ Calls `getShipperAssignedOrders` on mount
- ✓ Passes correct pagination parameters
- ✓ Handles API errors gracefully with toast notifications
- ✓ Handles canceled requests without showing errors

### 3. Order Display (6 tests)
- ✓ Displays all orders from API response
- ✓ Shows sender information (name, phone, address, ward, province)
- ✓ Displays COD badge when `codAmount > 0`
- ✓ Hides COD badge when `codAmount = 0`
- ✓ Shows delivery instructions when present
- ✓ Displays empty state message when no orders

### 4. Search Functionality (5 tests)
- ✓ Search input field is available
- ✓ API called with search query after 300ms debounce
- ✓ Debouncing works correctly (prevents multiple rapid calls)
- ✓ Whitespace is trimmed from search query
- ✓ Page resets to 0 when searching

### 5. Pagination (5 tests)
- ✓ Pagination controls shown when `totalPages > 1`
- ✓ Navigation to next page works
- ✓ Navigation to previous page works
- ✓ Previous button disabled on first page
- ✓ Next button disabled on last page

### 6. Pickup Action (8 tests)
- ✓ Pickup button is clickable
- ✓ Shows confirmation dialog before action
- ✓ Cancels action if user declines confirmation
- ✓ Calls `markOrderDelivered` API with correct orderId
- ✓ Shows success toast notification
- ✓ Shows error toast on failure
- ✓ Shows error toast on network error
- ✓ Disables button during processing
- ✓ Refreshes order list after successful pickup

### 7. Fail Pickup Action (9 tests)
- ✓ Opens fail dialog when fail button clicked
- ✓ Displays order tracking number in dialog
- ✓ Has textarea for entering fail reason
- ✓ Disables confirm button when reason is empty
- ✓ Enables confirm button when reason provided
- ✓ Calls `markOrderDeliveryFailed` with correct parameters
- ✓ Shows success toast after recording failure
- ✓ Closes dialog after successful action
- ✓ Allows canceling the dialog

### 8. Navigation Actions (2 tests)
- ✓ Opens Google Maps with address
- ✓ Properly encodes address for URL

### 9. Call Actions (1 test)
- ✓ Opens phone call link with correct phone number

### 10. Responsive Behavior (1 test)
- ✓ Has both mobile and desktop layout variants

### 11. Edge Cases (3 tests)
- ✓ Handles empty/whitespace-only search
- ✓ Handles orders with missing optional fields
- ✓ Handles API errors with generic messages

## Key Test Patterns

### Mocking API Responses
```typescript
(orderService.orderService.getShipperAssignedOrders as any).mockResolvedValue({
    content: [mockOrder, mockOrder2],
    totalPages: 2,
    totalElements: 15,
    currentPage: 0,
    pageSize: 10,
});
```

### Testing Async Operations
```typescript
await waitFor(() => {
    expect(orderService.orderService.getShipperAssignedOrders).toHaveBeenCalled();
});
```

### Simulating User Input
```typescript
const searchInput = screen.getByPlaceholderText(/Tìm kiếm/);
await userEvent.type(searchInput, 'TRK123456');
```

### Testing Debounce
```typescript
vi.useFakeTimers();
// ... perform actions
vi.advanceTimersByTime(300);
// ... assert
vi.useRealTimers();
```

### Finding Elements
```typescript
const pickupButtons = screen.getAllByRole('button').filter(btn =>
    btn.textContent.includes('Xong')
);
```

## Running the Tests

### Prerequisites
First, install testing dependencies in `package.json`:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

### Run All Tests
```bash
npm test
```

### Run ShipperPickupPage Tests Only
```bash
npm test -- ShipperPickupPage
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Setup Configuration Required

### 1. Add Vitest Config
Create `frontend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2. Add Test Setup File
Create `frontend/src/test/setup.ts`:
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### 3. Update package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^22.0.0",
    "vitest": "^0.34.0"
  }
}
```

## Test Data

The tests use realistic Vietnamese-language order data:

```typescript
const mockOrder = {
    orderId: 'order-123',
    trackingNumber: 'TRK123456',
    senderName: 'Nguyễn Văn A',
    senderPhone: '0901234567',
    senderAddressLine1: '123 Đường Láng',
    senderWardName: 'Phường Láng Hạ',
    senderProvinceName: 'Hà Nội',
    // ... other fields
};
```

## Important Notes

### API Endpoint Differences
- **ShipperPickupPage**: Uses `getShipperAssignedOrders()` endpoint
- **ShipperDeliveryPage**: Uses `getShipperDeliveryOrders()` endpoint

This is critical - the tests verify that ShipperPickupPage uses the CORRECT endpoint.

### Component Similarities
Both ShipperPickupPage and ShipperDeliveryPage have very similar structures:
- Same UI layout with mobile/desktop variants
- Same pagination logic
- Same action buttons
- Same state management

The key differences are:
1. API endpoint called
2. Data displayed (sender vs receiver info)
3. Action labels ("Lấy hàng" vs "Giao hàng")

### State Management
The component uses local React hooks for state management:
- `page`: Current pagination page
- `orders`: List of orders
- `totalPages` / `totalElements`: Pagination metadata
- `isLoading`: Loading state
- `selectedOrder`: Currently selected order (for fail dialog)
- `failReason`: Reason text for failed pickup
- `showFailDialog`: Dialog visibility
- `processingId`: ID of order being processed
- `searchQuery`: Search input value
- `pageSize`: Calculated based on screen height

### Abort Controller Pattern
The component uses AbortController to cancel previous API requests when:
- Component unmounts
- New search is initiated
- Page changes

This prevents race conditions and state updates on unmounted components.

## Common Testing Scenarios

### Testing Loading State
```typescript
it('should display loading spinner when first loading', () => {
    (orderService.orderService.getShipperAssignedOrders as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPageResponse), 100))
    );

    render(<ShipperPickupPage />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
});
```

### Testing Error Handling
```typescript
it('should handle API errors gracefully', async () => {
    (orderService.orderService.getShipperAssignedOrders as any).mockRejectedValue(
        new Error('Network error')
    );

    render(<ShipperPickupPage />);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
    });
});
```

### Testing Dialog Interactions
```typescript
it('should open fail dialog when fail button clicked', async () => {
    render(<ShipperPickupPage />);

    await waitFor(() => {
        const failButtons = screen.getAllByRole('button').filter(btn =>
            btn.textContent.includes('Không')
        );
        fireEvent.click(failButtons[0]);
    });

    await waitFor(() => {
        expect(screen.getByText(/Ghi lại lấy hàng thất bại/)).toBeInTheDocument();
    });
});
```

## Debugging Tips

### View DOM During Test
```typescript
import { screen } from '@testing-library/react';

// Print entire DOM
screen.debug();

// Print specific element
screen.debug(screen.getByText('Some text'));
```

### Log Mock Calls
```typescript
console.log(orderService.orderService.getShipperAssignedOrders.mock.calls);
console.log(toast.error.mock.calls);
```

### Test Specific Scenario Only
```typescript
it.only('should test this specific scenario', async () => {
    // This will run only this test
});
```

## Future Improvements

1. **Add screenshot tests** using tools like Percy or Chromatic
2. **Add accessibility tests** using jest-axe
3. **Add integration tests** with real backend
4. **Add performance tests** to ensure no unnecessary re-renders
5. **Add E2E tests** using Cypress or Playwright
6. **Create test helpers** for common operations
7. **Add visual regression testing**

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
