# Testing Setup Guide for ClickAreas Component

## Prerequisites

To run the tests for the ClickAreas component, you need to install the following dependencies:

### 1. Install Testing Dependencies

Run the following command to install all necessary testing packages:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

### 2. Update package.json

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Configuration Files

The following configuration files have been created:

- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Jest setup file with common mocks
- `src/app/components/home-page/__tests__/click-areas.test.tsx` - Test file for ClickAreas component

## Running Tests

Once the dependencies are installed, you can run the tests using:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test file covers the following scenarios:

### 1. Rendering Tests

- ✅ Renders all menu items correctly
- ✅ Renders navigation links
- ✅ Has proper ARIA labels
- ✅ Has hover states

### 2. Navigation Tests

- ✅ Navigates to public routes without authentication
- ✅ Navigates to map route without authentication

### 3. Authentication Tests

- ✅ Opens login modal when clicking dashboard without authentication
- ✅ Navigates to dashboard when user is authenticated

### 4. Login Flow Tests

- ✅ Handles successful login from home page
- ✅ Closes login modal when close button is clicked

### 5. Error Handling Tests

- ✅ Shows loader when menu is not available
- ✅ Shows loader when menu is not an array
- ✅ Shows error message when menu has less than 4 items
- ✅ Handles missing menu data gracefully
- ✅ Handles empty menu array

### 6. Menu Filtering Tests

- ✅ Filters out invalid menu items

## Test Structure

The test file is organized into logical groups:

```typescript
describe("ClickAreas Component", () => {
  describe("Rendering", () => {
    // Rendering tests
  });

  describe("Navigation", () => {
    // Navigation tests
  });

  describe("Authentication Required Routes", () => {
    // Authentication tests
  });

  describe("Login Flow", () => {
    // Login flow tests
  });

  describe("Error Handling", () => {
    // Error handling tests
  });

  describe("Menu Filtering", () => {
    // Menu filtering tests
  });
});
```

## Mocking Strategy

The tests use comprehensive mocking to isolate the component:

1. **Context Hooks**: Mock `useAuth` and `useMenu` to control component state
2. **Next.js Navigation**: Mock `useRouter` and `usePathname` to avoid navigation issues
3. **Child Components**: Mock `LoginForm` and `CenteredLoader` to focus on ClickAreas logic

## Key Testing Patterns

### 1. Setup and Teardown

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset mock return values
});
```

### 2. Dynamic Mock Updates

```typescript
const { useAuth } = require("@/app/context/AuthContext");
useAuth.mockReturnValue({ user: { id: "user-123" } });
```

### 3. Async Testing

```typescript
await waitFor(() => {
  expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
});
```

### 4. Event Testing

```typescript
fireEvent.click(screen.getByText("Dashboard"));
expect(screen.getByTestId("login-form")).toBeInTheDocument();
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure all dependencies are installed
2. **Jest configuration issues**: Check that `jest.config.js` is in the root directory
3. **TypeScript errors**: Make sure `@types/jest` is installed

### Debugging Tests

To debug tests, you can:

1. Use `console.log` in test files
2. Run tests with `--verbose` flag: `npm test -- --verbose`
3. Use `debug()` from `@testing-library/react`:
   ```typescript
   import { debug } from "@testing-library/react";
   debug(); // This will print the current DOM
   ```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep Tests Simple**: Each test should have a single responsibility
4. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
5. **Mock External Dependencies**: Isolate the component under test

## Extending Tests

To add more tests:

1. Add new test cases within existing `describe` blocks
2. Create new `describe` blocks for new functionality
3. Update mocks as needed for new scenarios
4. Ensure all new functionality is covered

## Integration with CI/CD

To integrate tests with your CI/CD pipeline, add the test command to your build process:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test
```

This setup provides a solid foundation for testing React components in your Next.js application.
