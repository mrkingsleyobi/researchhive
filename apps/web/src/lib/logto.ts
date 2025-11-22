import { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  // Logto app credentials (you'll need to create a Logto app)
  appId: process.env.LOGTO_APP_ID || 'demo-app-id',
  appSecret: process.env.LOGTO_APP_SECRET || 'demo-app-secret',
  endpoint: process.env.LOGTO_ENDPOINT || 'https://demo.logto.app',

  // Base URL of your application
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Cookie settings
  cookieSecret: process.env.LOGTO_COOKIE_SECRET || 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',

  // Resources and scopes
  resources: [],
  scopes: ['email', 'profile'],
};
