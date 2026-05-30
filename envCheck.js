/**
 * Simple environment validator for AI and external integrations.
 * Logs warnings when required environment variables are missing.
 */
export function validateAIEnv() {
  const missing = [];

  // Base44 integration
  if (!process.env.VITE_BASE44_APP_BASE_URL && !process.env.BASE44_API_KEY) {
    missing.push('VITE_BASE44_APP_BASE_URL or BASE44_API_KEY');
  }

  // Google Sign-In client ID for the front-end (used by SignIn/SignUp)
  if (!process.env.VITE_GOOGLE_CLIENT_ID) {
    missing.push('VITE_GOOGLE_CLIENT_ID');
  }

  if (missing.length > 0) {
    console.warn('[envCheck] Missing environment variables:', missing.join(', '));
    return { ok: false, missing };
  }

  return { ok: true };
}

export default { validateAIEnv };
