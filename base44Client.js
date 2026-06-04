import { createClient } from '@base44/sdk';
import { appParams } from './app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: import.meta.env.VITE_API_BASE_URL || 'https://share-a-meal-production-0b7a.up.railway.app',
  requiresAuth: false,
  appBaseUrl
});
