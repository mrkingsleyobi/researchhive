# Authentication Setup Guide

This guide explains how to set up Logto authentication for ResearchHive.

## Quick Start (Demo Mode)

The application currently runs in **demo mode** with mock credentials. All users share the same demo account (`demo@researchhive.ai`).

To enable real authentication, follow the steps below.

---

## Setting Up Real Logto Authentication

### 1. Create a Logto Account

1. Go to [https://logto.io](https://logto.io)
2. Sign up for a free account
3. Create a new tenant (or use existing)

### 2. Create a Logto Application

1. In your Logto Console, go to **Applications**
2. Click **Create Application**
3. Choose **Next.js** as the framework
4. Give it a name (e.g., "ResearchHive")
5. Click **Create**

### 3. Configure Application Settings

In your Logto application settings:

**Redirect URIs:**
```
http://localhost:3000/api/logto/callback
https://your-production-domain.com/api/logto/callback
```

**Post Sign-out Redirect URIs:**
```
http://localhost:3000
https://your-production-domain.com
```

**CORS Allowed Origins:**
```
http://localhost:3000
https://your-production-domain.com
```

### 4. Get Your Credentials

From your Logto application page, copy:
- **App ID**
- **App Secret**
- **Endpoint** (your tenant endpoint, e.g., `https://your-tenant.logto.app`)

### 5. Update Environment Variables

Update your `.env` file:

```bash
# Logto Authentication
LOGTO_APP_ID=your_app_id_here
LOGTO_APP_SECRET=your_app_secret_here
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_COOKIE_SECRET=generate_a_random_32_character_string

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure cookie secret:**
```bash
openssl rand -base64 32
```

### 6. Enable Authentication in Code

Once you have real credentials, you can uncomment the authentication checks in:

**`apps/web/src/middleware.ts`:**
```typescript
// Uncomment to enable route protection
const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

if (isProtectedRoute) {
  // Add Logto session check
  // Redirect to sign-in if not authenticated
}
```

**`apps/web/src/components/dashboard/header.tsx`:**
```typescript
// Replace mock user with real Logto session
import { getLogtoContext } from '@logto/next/server-actions';

const user = await getLogtoContext().getIdTokenClaims();
```

### 7. Update API to Use Real Users

**`apps/api/src/router/index.ts`:**

Replace the `getDefaultUser()` function to use actual authenticated users from Logto:

```typescript
async function getCurrentUser(context: Context) {
  // Get user ID from auth token/session
  const userId = context.userId; // From Logto token

  let user = await db.user.findFirst({
    where: { email: context.userEmail },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: context.userEmail,
        name: context.userName,
        role: 'USER',
      },
    });
  }

  return user;
}
```

---

## Testing Authentication

### Sign In Flow
1. Visit `http://localhost:3000/dashboard`
2. Click "Sign In" button
3. You'll be redirected to Logto's auth page
4. Sign in with your credentials
5. You'll be redirected back to the dashboard

### Sign Out Flow
1. Click the logout icon in the header
2. You'll be signed out and redirected to homepage

---

## Production Deployment

When deploying to production:

1. **Update environment variables** with production URLs
2. **Add production redirect URIs** in Logto Console
3. **Enable HTTPS** for secure cookie transmission
4. **Set `NODE_ENV=production`** to enable secure cookies

```bash
# Production .env
NEXT_PUBLIC_APP_URL=https://your-domain.com
LOGTO_ENDPOINT=https://your-tenant.logto.app
NODE_ENV=production
```

---

## Security Best Practices

✅ **Never commit** `.env` file to git
✅ **Use environment-specific** configurations
✅ **Rotate secrets** regularly
✅ **Enable HTTPS** in production
✅ **Set secure cookie** flags in production
✅ **Implement CSRF** protection
✅ **Add rate limiting** to auth endpoints

---

## Troubleshooting

### "Invalid redirect URI"
- Ensure redirect URIs in Logto Console match your app URLs exactly
- Include both HTTP (development) and HTTPS (production)

### "Invalid cookie secret"
- Cookie secret must be at least 32 characters
- Generate a new one with `openssl rand -base64 32`

### "Session not persisting"
- Check that cookies are enabled in browser
- Verify `cookieSecure` setting matches your protocol (HTTP/HTTPS)

### "User not found in database"
- Ensure user creation logic runs after successful Logto authentication
- Check database logs for errors

---

## Additional Resources

- [Logto Documentation](https://docs.logto.io)
- [Logto Next.js SDK](https://docs.logto.io/docs/recipes/integrate-logto/next-js)
- [Logto Console](https://cloud.logto.io)

---

## Current Status

✅ Logto SDK installed
✅ Configuration files created
✅ Auth routes set up
✅ User button component added
✅ Middleware prepared
⏳ **Demo mode active** (using mock credentials)
⏳ Ready for real credentials

To activate real authentication, follow steps 1-6 above!
