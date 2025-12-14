# OAuth Social Login Setup Guide

This guide explains how to configure Google, Facebook, and Apple OAuth providers in Supabase to enable social login functionality.

## Current Status
✅ Frontend UI implemented with social login buttons
⏳ Backend OAuth configuration pending

## Prerequisites
- Supabase project access
- Developer accounts for each provider you want to enable

---

## Google OAuth Setup

### 1. Google Cloud Console Setup
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

### 2. Configure OAuth Consent Screen (if first time)
- User type: **External**
- App name: **RealSync**
- Support email: Your email
- Developer contact: Your email
- Save and continue through all steps

### 3. Create OAuth Client ID
- Application type: **Web application**
- Name: **RealSync Web**
- **Authorized JavaScript origins**:
  - `http://localhost:5173` (development)
  - `https://your-production-domain.com` (production)
- **Authorized redirect URIs**:
  - Get from Supabase: `https://[your-project-ref].supabase.co/auth/v1/callback`
  - Example: `https://abcdefghijklmn.supabase.co/auth/v1/callback`

### 4. Configure in Supabase
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable the provider
4. Paste **Client ID** from Google
5. Paste **Client Secret** from Google
6. Save changes

---

## Facebook OAuth Setup

### 1. Facebook Developers Setup
1. Go to https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in app details:
   - App name: **RealSync**
   - Contact email: Your email

### 2. Configure Facebook Login
1. In your app dashboard, go to **Products** → Add **Facebook Login**
2. Select **Web** platform
3. In **Facebook Login Settings**:
   - **Valid OAuth Redirect URIs**:
     - Get from Supabase: `https://[your-project-ref].supabase.co/auth/v1/callback`

### 3. Get App Credentials
1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**

### 4. Configure in Supabase
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Facebook** and click to expand
3. Enable the provider
4. Paste **App ID** as Client ID
5. Paste **App Secret** as Client Secret
6. Save changes

---

## Apple OAuth Setup

### 1. Apple Developer Account Setup
1. Go to https://developer.apple.com/account/
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID**:
   - Description: **RealSync**
   - Identifier: `com.yourcompany.realsync.signin` (must be unique)
   - Enable **Sign In with Apple**

### 2. Configure Services ID
1. Click on your Services ID
2. Configure **Sign In with Apple**:
   - Primary App ID: Select your app
   - **Return URLs**:
     - Get from Supabase: `https://[your-project-ref].supabase.co/auth/v1/callback`

### 3. Create a Key
1. Go to **Keys** → Create new key
2. Enable **Sign In with Apple**
3. Download the `.p8` key file (you can only download once!)
4. Note the **Key ID**

### 4. Get Team ID
1. Go to **Membership** in Apple Developer
2. Copy your **Team ID**

### 5. Configure in Supabase
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Apple** and click to expand
3. Enable the provider
4. Fill in:
   - **Services ID**: Your Services ID (e.g., `com.yourcompany.realsync.signin`)
   - **Team ID**: From Apple Developer Membership
   - **Key ID**: From the key you created
   - **Private Key**: Contents of the `.p8` file
5. Save changes

---

## Testing

### Development Testing
1. Make sure your redirect URLs include localhost for testing:
   - Google: Add `http://localhost:5173` to authorized origins
   - Facebook: Add `http://localhost:5173` to app domains
   - Apple: Testing must be done on a real domain (not localhost)

### Production Testing
1. Update all redirect URLs to your production domain
2. Test login flow for each provider
3. Verify user data is correctly saved to `user_profiles` table

---

## Important Notes

- **Redirect URL Format**: Always get the exact callback URL from Supabase Dashboard → Authentication → Providers → [Provider] → Callback URL
- **Email Permissions**: Request email scope for all providers (enabled by default)
- **User Data**: Social logins will create a user in `auth.users` and should trigger the `handle_new_user()` function to create a profile
- **Privacy Policy**: You'll need a privacy policy URL for production apps (required by all providers)
- **Terms of Service**: Recommended for all OAuth providers

---

## Troubleshooting

### "Redirect URI mismatch" error
- Verify the callback URL in the provider settings matches exactly what's in Supabase
- Check for trailing slashes or http vs https mismatches

### "Invalid client" error
- Verify Client ID and Client Secret are correctly copied
- No extra spaces or line breaks in the credentials

### User profile not created
- Check the `handle_new_user()` trigger is active in Supabase
- Verify the trigger function handles social login metadata correctly

---

## Future Enhancements

- [ ] Add more providers (GitHub, Microsoft, etc.)
- [ ] Implement role selection for social signups
- [ ] Add profile picture sync from social accounts
- [ ] Set up email verification for social accounts
