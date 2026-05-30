# E2E Tests for AI Chat Flow

This directory contains end-to-end tests for the AI Insights Chat panel using Playwright.

## Running E2E Tests

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure dev server is running or Playwright will start it automatically:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```

### Run Tests

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run in UI mode (interactive browser window):**
```bash
npm run test:e2e:ui
```

**Run in debug mode (step through tests):**
```bash
npm run test:e2e:debug
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/ai-chat.spec.js
```

## Test Coverage

The E2E test suite (`tests/e2e/ai-chat.spec.js`) covers:

1. **Rendering** - AI Chat panel loads with quick question buttons
2. **Data Snapshot** - Show/hide data snapshot toggle works
3. **Question Input** - Typing and sending questions works
4. **Debouncing** - Rapid clicks are debounced correctly
5. **Loading State** - Loading spinner appears while waiting for response
6. **Error Handling** - Error state displays with retry button
7. **Caching** - Response caching works for identical questions
8. **Copy Function** - Copy button works on error state
9. **Integration** - User context is included in AI data snapshot

## Test Structure

- `tests/e2e/ai-chat.spec.js` - Main test suite with multiple test cases
- `playwright.config.js` - Playwright configuration (baseURL, browsers, web server setup)

## Debugging Tips

1. **View test report after run:**
   ```bash
   npx playwright show-report
   ```

2. **Run in headed mode (see browser):**
   ```bash
   npx playwright test --headed
   ```

3. **Slow down tests (useful for debugging):**
   ```bash
   npx playwright test --headed --workers=1 --debug
   ```

4. **Check test traces:**
   Traces are recorded in `test-results/` folder for failed tests.

## Notes

- Tests run against `http://localhost:5173` (dev server)
- Playwright config auto-starts dev server if not running
- Tests support multiple browsers (Chromium, Firefox) — see `playwright.config.js`
- HTML report generated after each run (open in browser)

## CI/CD Integration

For continuous integration (GitHub Actions, etc.), add:

```bash
npm run test:e2e
```

to your CI pipeline. Playwright will run in headless mode by default.
