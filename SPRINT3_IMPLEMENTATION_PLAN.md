# Sprint 3 Implementation Plan

## Goal
Transform RealSync from a demo app to a fully functional MVP with Supabase backend, Stripe payments, and real user authentication.

## Phase 1: Supabase Setup (Day 1)

### Step 1.1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Create new project: "RealSync"
4. Note down:
   - Project URL
   - Anon Public Key
   - Service Role Key (for admin operations)

### Step 1.2: Set Up Database Schema
Run SQL migrations in Supabase SQL Editor to create tables:
- users (Supabase handles this with auth.users)
- properties
- transactions
- documents
- messages
- notifications

### Step 1.3: Configure Authentication
- Enable Email authentication
- Configure email templates
- Set up redirect URLs for Vercel

## Phase 2: Frontend Supabase Integration (Day 1-2)

### Step 2.1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2.2: Create Supabase Client
- Create `src/lib/supabase.ts`
- Initialize Supabase client with env variables
- Set up auth state listener

### Step 2.3: Replace Auth Store
- Update Zustand store to use Supabase auth
- Remove mock auto-login
- Implement real login/logout

### Step 2.4: Update Auth Pages
- Connect LoginPage to Supabase
- Connect RegisterPage to Supabase
- Add password reset flow

## Phase 3: Remove Demo Mode (Day 2)

### Step 3.1: Update App.tsx
- Remove auto-login useEffect
- Add auth state checking
- Redirect to login if not authenticated

### Step 3.2: Update Protected Routes
- Check real auth state
- Handle session expiry
- Implement token refresh

## Phase 4: Connect Real Data (Day 2-3)

### Step 4.1: Properties Feature
- Create properties table
- Add CRUD API functions
- Update dashboard to fetch real properties

### Step 4.2: Timeline Feature
- Create timeline_events table
- Fetch real events from database
- Add ability to create new events

### Step 4.3: Documents Feature
- Set up Supabase Storage bucket
- Implement file upload
- List real documents

### Step 4.4: Chat Feature
- Create messages table
- Implement real-time subscriptions
- Enable sending messages

## Phase 5: Stripe Integration (Day 3-4)

### Step 5.1: Create Stripe Account
- Sign up at https://stripe.com
- Get API keys (test mode)
- Create products/prices

### Step 5.2: Install Stripe
```bash
npm install @stripe/stripe-js stripe
```

### Step 5.3: Create Subscription Tiers
Free Tier:
- 1 property
- Basic features

Pro Tier ($29/month):
- Unlimited properties
- All features
- Priority support

### Step 5.4: Implement Checkout
- Create pricing page
- Add Stripe checkout
- Handle success/cancel

### Step 5.5: Webhook Handler
- Create webhook endpoint
- Handle subscription events
- Update user tier in database

## Phase 6: Testing (Day 4-5)

### Step 6.1: Manual Testing
- [ ] Sign up new user
- [ ] Log in
- [ ] Create property
- [ ] Upload document
- [ ] Send message
- [ ] Subscribe to Pro tier
- [ ] Log out

### Step 6.2: Edge Cases
- [ ] Invalid email
- [ ] Wrong password
- [ ] Duplicate email
- [ ] Payment failure
- [ ] Session expiry

## Phase 7: Deployment (Day 5)

### Step 7.1: Environment Variables
Add to Vercel:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_STRIPE_PUBLISHABLE_KEY

### Step 7.2: Deploy
- Commit changes
- Push to GitHub
- Vercel auto-deploys
- Test production build

## Success Criteria

- [ ] User can sign up with email
- [ ] User can log in
- [ ] User can create a property
- [ ] User can upload a document
- [ ] User can subscribe to Pro tier
- [ ] All data persists in Supabase
- [ ] App deployed and accessible

## Timeline

- Day 1: Supabase setup + Auth integration
- Day 2: Remove demo mode + Real data
- Day 3-4: Stripe integration
- Day 5: Testing + Deployment

Total: ~5 days of focused work
