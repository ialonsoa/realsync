# RealSync - Supabase & Stripe Setup Guide

## Part 1: Create Supabase Account & Project

### Step 1: Sign Up for Supabase
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 2: Create New Project
1. Click "New Project"
2. Fill in details:
   - **Name**: RealSync
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., US East, South America)
   - **Pricing Plan**: Select **Free** (0$ /month)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### Step 3: Get Your API Keys
Once project is ready:
1. Click on "Settings" (gear icon in sidebar)
2. Click "API" in the settings menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (long string)
   - **service_role** key: `eyJhbGc...` (long string - keep secret!)

**Copy these three values - you'll need them in a moment!**

### Step 4: Enable Email Authentication
1. Go to "Authentication" in the sidebar
2. Click "Providers"
3. Find "Email" and make sure it's enabled (toggle should be green)
4. **Email templates are optional** - Supabase will use defaults
   - You can customize later under Authentication → Email Templates (if available)
   - For now, skip this step - defaults work fine!

### Step 5: Configure Site URL (for Vercel)
1. Still in Authentication settings
2. Go to "URL Configuration" section
3. Set **Site URL** to: `https://realsync-web-6y7a-git-dev-ialonsoas-projects.vercel.app`
4. Under **Redirect URLs**, click "Add URL" and add these TWO URLs:
   - `https://realsync-web-6y7a-git-dev-ialonsoas-projects.vercel.app/**`
   - `http://localhost:5173/**`
5. Click "Save"

**What are Redirect URLs?**
These tell Supabase where it's safe to redirect users after login/signup. The `**` wildcard means "any path on this domain is allowed".

---

## Part 2: Create Stripe Account

### Step 1: Sign Up for Stripe
1. Go to https://stripe.com
2. Click "Sign in" → "Create account"
3. Enter email and password
4. Complete the form (business name: "RealSync")
5. Verify your email

### Step 2: Activate Test Mode
1. Once logged in, look for the toggle in top-right
2. Make sure it says "Test mode" (should be orange/yellow)
3. We'll use test mode for development

### Step 3: Get Your API Keys
1. Click "Developers" in the top menu
2. Click "API keys"
3. You'll see:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal"

**Copy both keys - you'll need them!**

### Step 4: Create Products (Optional - we can do this in code too)
1. Go to "Products" in sidebar
2. Click "Add product"
3. Create two products:

**Product 1: RealSync Free**
- Name: Free Plan
- Price: $0 / month
- Features: 1 property, basic features

**Product 2: RealSync Pro**
- Name: Pro Plan
- Price: $29 / month
- Features: Unlimited properties, all features

---

## Part 3: What to Do Next

Once you have:
- ✅ Supabase Project URL
- ✅ Supabase anon key
- ✅ Stripe Publishable key
- ✅ Stripe Secret key

**Tell me you're ready and paste your keys**, then I'll:
1. Configure the app to use Supabase
2. Set up the database schema
3. Remove demo mode
4. Integrate real authentication
5. Add Stripe payments
6. Connect all features to real data

---

## Security Note

⚠️ **IMPORTANT**:
- The Supabase **anon** key and Stripe **publishable** key are safe to expose in frontend code
- The Supabase **service_role** key and Stripe **secret** key should NEVER be in frontend code
- We'll only use the safe public keys in the React app

---

## Estimated Time
- Supabase setup: 5-10 minutes
- Stripe setup: 5-10 minutes
- **Total: ~15-20 minutes**

Then I'll handle all the integration code for you!
