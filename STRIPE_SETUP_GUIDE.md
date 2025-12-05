# Stripe Payment Integration Setup Guide

This guide will help you complete the Stripe payment integration for RealSync.

## Overview

We've implemented a complete Stripe payment system with:
- ✅ Checkout session creation API
- ✅ Webhook handler for subscription events
- ✅ Database schema for subscription tracking
- ✅ Frontend integration with real Stripe checkout

## Step-by-Step Setup

### 1. Apply Database Migration

First, add the subscriptions and payment_history tables to Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `STRIPE_SUBSCRIPTIONS_SCHEMA.sql`
6. Paste and click **Run**
7. Verify success - you should see "Success. No rows returned"

### 2. Create Stripe Product and Prices

1. Go to Stripe Dashboard: https://dashboard.stripe.com (use Test mode)
2. Navigate to **Products** → **Add Product**

**Create Pro Plan:**
- Name: `RealSync Pro`
- Description: `Professional real estate management`
- Pricing:
  - Model: **Recurring**
  - Price: **99 PEN** (or your local currency)
  - Billing period: **Monthly**
- Click **Save product**
- **Copy the Price ID** (starts with `price_...`)

**Create Enterprise Plan (Optional):**
- Name: `RealSync Enterprise`
- Pricing: Contact-based (no price needed for now)

### 3. Get Stripe API Keys

In Stripe Dashboard:

1. Navigate to **Developers** → **API keys**
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`) - Already in your .env
   - **Secret key** (starts with `sk_test_...`) - **NEW, needed for backend**

### 4. Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-app-url.vercel.app/api/stripe-webhook`
   - Replace `your-app-url` with your actual Vercel URL
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`)

### 5. Configure Environment Variables

#### Local Development (.env)

Update `/Users/alonsoincaroca/Realsync App V1/frontend/web/.env`:

```bash
# Existing variables (keep as is)
VITE_SUPABASE_URL=https://rydykhjvgfoqnxkjugzr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SM0O11CenAuKyiUn0rh1yXh2ZEU9pd7wvSA1wvYNHf76tS9diB1EYubV4hWbIPFxIdp4h1zSBlnsQUB0og3gY4100Vt6prucl
VITE_APP_URL=http://localhost:5173

# Add these NEW variables:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
STRIPE_SECRET_KEY=sk_test_your_secret_key_from_stripe
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_stripe
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
```

**To get SUPABASE_SERVICE_ROLE_KEY:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the `service_role` key (under "Project API keys")
3. ⚠️ **NEVER** expose this key to the frontend!

#### Production (Vercel Dashboard)

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = (same as local)
   - `VITE_SUPABASE_ANON_KEY` = (same as local)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = (same as local)
   - `VITE_APP_URL` = `https://your-app.vercel.app`
   - `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase)
   - `STRIPE_SECRET_KEY` = (from Stripe)
   - `STRIPE_WEBHOOK_SECRET` = (from Stripe webhook)
   - `STRIPE_PRO_PRICE_ID` = (from Stripe product)

5. **Important:** Select "Production" for each variable

### 6. Update Price ID in Code

Edit `frontend/web/src/pages/pricing/PricingPage.tsx`:

Find line ~46:
```typescript
stripePriceId: 'price_demo', // In production, this would be a real Stripe Price ID
```

Replace with:
```typescript
stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_1ABC123...',
```

Or hardcode your actual price ID from Step 2.

### 7. Add TypeScript Types for API Routes

Install additional types (optional but recommended):

```bash
cd frontend/web
npm install -D @types/node
```

### 8. Test Local Webhook (Optional)

To test webhooks locally, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5173/api/stripe-webhook

# Use the webhook secret printed by the CLI in your .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 9. Deploy to Vercel

```bash
cd frontend/web
npm run build
git add .
git commit -m "feat: implement Stripe payment integration"
git push

# Vercel will auto-deploy if connected
# Or manually: vercel --prod
```

### 10. Test the Integration

#### Test Checkout Flow:

1. Go to your app at `/pricing`
2. Click "Actualizar a Pro"
3. You should be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete payment
6. You'll be redirected back to dashboard
7. Check your Supabase `subscriptions` table - you should see a new record

#### Test Webhook Events:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. View recent deliveries
4. Should see successful `200` responses

#### Test Subscription Status:

1. In Supabase, check:
   - `subscriptions` table - should have your subscription
   - `user_profiles` table - `subscription_tier` should be 'pro'
   - `payment_history` table - should have payment record

## Troubleshooting

### Webhook returns 400 "Webhook Error"
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly in Vercel
- Ensure the webhook secret matches the one from Stripe Dashboard

### API returns 404
- Ensure `vercel.json` has the API rewrite rule
- Check that `/api` folder exists in your deployment
- Redeploy the app

### "User profile not found" error
- Ensure user is logged in
- Check that `user_profiles` table has a record for the user
- Verify RLS policies allow access

### Subscription not updating in database
- Check webhook deliveries in Stripe Dashboard
- Look for error messages in webhook delivery logs
- Check Vercel function logs in Vercel Dashboard → Project → Logs

### Environment variables not working
- Make sure you've redeployed after adding env vars
- Check variable names match exactly (case-sensitive)
- Verify Production/Preview/Development scopes are set correctly

## Going to Production

When you're ready to go live:

1. **Switch to Live Mode in Stripe:**
   - Get production API keys (start with `pk_live_` and `sk_live_`)
   - Create production products and prices
   - Set up production webhook endpoint
   - Update all Stripe env vars with production values

2. **Update Prices:**
   - Change from PEN to your production currency if needed
   - Adjust pricing based on market research

3. **Add Invoice/Receipt Emails:**
   - Configure email templates in Stripe Dashboard
   - Set up customer billing portal

4. **Legal Requirements:**
   - Add Terms of Service
   - Add Refund Policy
   - Add Privacy Policy
   - Ensure GDPR compliance (if applicable)

5. **Testing Checklist:**
   - ✅ New subscription creation
   - ✅ Successful payment
   - ✅ Failed payment handling
   - ✅ Subscription cancellation
   - ✅ Subscription upgrade/downgrade
   - ✅ Invoice generation
   - ✅ Customer portal access

## Current Status

✅ **Implemented:**
- Checkout session creation API
- Webhook event handlers
- Database schema for subscriptions
- Frontend integration
- Payment history tracking

⏳ **Optional Enhancements:**
- Subscription management page (cancel, upgrade, view invoices)
- Email notifications for payment events
- Customer billing portal integration
- Trial period support
- Discount codes/promotions

## Support

If you run into issues:
1. Check Vercel function logs
2. Check Stripe webhook delivery logs
3. Check Supabase logs
4. Test with Stripe CLI locally

---

**Next Steps:**
1. Apply database migration ✅
2. Configure Stripe products ✅
3. Set environment variables ✅
4. Deploy and test ✅
