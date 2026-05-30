# AI Insights (Share-A-Meal)

This document describes the AI Insights feature and required environment variables.

## Required environment variables
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID used by the Sign In / Sign Up pages.
- `VITE_BASE44_APP_BASE_URL` _or_ `BASE44_API_KEY` — Base44 SDK integration point or API key used to call the integrated LLM via `base44.integrations.Core.InvokeLLM`.

Note: In development, the AI utility will not call the real LLM when `NODE_ENV=test` — it returns a deterministic mock for unit tests.

## Running locally
1. Create a `.env` in the project root with the required variables, e.g.: 

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_BASE44_APP_BASE_URL=https://api.base44.example
# or
BASE44_API_KEY=sk_...
```

2. Start the dev server:

```bash
npm run dev -- --host 0.0.0.0
```

3. Open the app at `http://localhost:5173` and navigate to the page containing the AI Insights panel.

## Testing
Run the small unit test for the app-state preparation logic:

```bash
npm test
```

## Notes & Best Practices
- The AI utility uses a simple in-memory cache (5-minute TTL) to reduce repeated LLM calls.
- For production, replace the in-memory cache with a persistent cache or a proper cache layer (Redis) and add request quotas.
- Review PII handling and ensure no sensitive user data is passed to the LLM unless explicitly permitted.

## Next steps
- Add E2E tests for the chat flow (Playwright/Cypress).
- Add telemetry to record LLM latency and errors.
- Add a privacy + PII checklist before enabling production LLM calls.
