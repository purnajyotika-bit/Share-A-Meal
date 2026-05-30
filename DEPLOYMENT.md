# Deployment Checklist - Share-A-Meal AI Insights

## Pre-Deployment

### Security
- [x] Password hashing: Replaced `btoa` with `bcryptjs` (10 rounds)
- [x] Environment variables validated via `envCheck.js`
- [x] No hardcoded secrets or credentials in code
- [ ] SSL/TLS certificates configured for production
- [ ] CORS policies reviewed and restricted to known domains
- [ ] Rate limiting configured on auth endpoints
- [ ] CSRF protection enabled
- [ ] SQL injection / NoSQL injection protections verified

### Performance
- [x] Response caching implemented (5-minute TTL in-memory)
- [x] AI chat debounced (700ms) to reduce rapid requests
- [x] App state snapshot memoized for performance
- [ ] Bundle size analyzed (`npm run build` + `npm run typecheck`)
- [ ] Production build tested locally
- [ ] Lighthouse audit score > 80 (Perf, Accessibility, Best Practices)

### Code Quality
- [x] Unit tests for `prepareAppStateData` pass (`npm test`)
- [x] E2E tests for AI chat flow created (`npm run test:e2e`)
- [ ] Linter passes (`npm run lint`)
- [ ] TypeScript strict mode enabled (if applicable)
- [ ] No console.error/warn in production build

### Environment Configuration
- [ ] `VITE_GOOGLE_CLIENT_ID` set to production Google OAuth client ID
- [ ] `VITE_BASE44_APP_BASE_URL` or `BASE44_API_KEY` configured
- [ ] Database URL configured (Base44 or custom backend)
- [ ] Email service configured (if password reset is enabled)
- [ ] Logging/telemetry endpoint configured
- [ ] CDN configured for static assets

### Documentation
- [x] README_AI.md created with AI feature docs
- [x] E2E test README created (`tests/e2e/README.md`)
- [x] Deployment checklist (this file)
- [ ] API documentation updated
- [ ] User guide / FAQ updated

### Testing
- [x] Unit tests pass (`npm test`)
- [x] E2E tests pass (`npm run test:e2e`)
- [ ] Manual smoke test on staging environment
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Accessibility check (WCAG 2.1 AA)

### Database Migration
- [ ] User password migration plan (if migrating from btoa to bcrypt)
  - Option 1: Force password reset via email link
  - Option 2: Accept both formats temporarily, re-hash on next login
  - Option 3: Bulk migration if plaintext passwords available
- [ ] Backup current user data before migration

## Deployment

### Build
```bash
npm install
npm run build
npm run lint
npm test
npm run test:e2e
```

### Deploy
1. Push to production branch
2. Run CI/CD pipeline
3. Deploy to hosting (Vercel, Netlify, AWS, etc.)
4. Run smoke tests on production
5. Monitor error logs and performance metrics

### Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, Datadog, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Enable performance monitoring (Real User Monitoring)
- [ ] Set up alerts for high error rates

### Rollback Plan
- [ ] Version control set up for quick rollback
- [ ] Rollback procedure documented
- [ ] Database backup and restore procedure tested

### Analytics
- [ ] Track AI chat usage (questions asked, response times)
- [ ] Monitor cache hit rate
- [ ] Track user registration/login success rates
- [ ] Monitor 401/403 auth errors

## Required Environment Variables

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Base44 Integration (one of these required)
VITE_BASE44_APP_BASE_URL=https://api.base44.example
# OR
BASE44_API_KEY=sk_...

# Optional: Logging/Telemetry
VITE_SENTRY_DSN=https://...
VITE_ANALYTICS_ENDPOINT=https://...
```

## Rollback Procedure

If issues occur after deployment:

1. Revert to previous git tag: `git checkout v1.0.0`
2. Rebuild: `npm install && npm run build`
3. Redeploy previous version
4. Review logs to identify root cause
5. Fix issue and re-test before re-deploying

## Support & Contacts

- **AI Issues**: Check `README_AI.md` and `tests/e2e/README.md`
- **Auth Issues**: Check `AuthContext.jsx` and environment variables
- **Performance Issues**: Check browser DevTools and Lighthouse
- **Error Tracking**: Review Sentry/Datadog dashboards

## Sign-Off

- [ ] QA Lead: ___________________  Date: _______
- [ ] Security Lead: ___________________  Date: _______
- [ ] DevOps Lead: ___________________  Date: _______
- [ ] Product Owner: ___________________  Date: _______
