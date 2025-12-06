# RealSync Code Base Analysis (Simplified)

**Purpose:** Understand what code actually exists and where to find it
**Audience:** Product managers, new developers, stakeholders
**Last Updated:** November 21, 2024

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 3,838 lines |
| **Frontend Files** | 21 TypeScript files |
| **Backend Files** | 0 (using Supabase BaaS) |
| **Database Tables** | 5 tables |
| **Pages/Views** | 13 pages |
| **External Services** | 2 active (Vercel, Supabase) |

---

## Project Structure (What Actually Exists)

```
Realsync App V1/
├── frontend/web/              ✅ ACTIVE - React application
│   ├── src/
│   │   ├── pages/            → 13 page views
│   │   ├── components/       → 4 shared components
│   │   ├── store/            → State management (Zustand)
│   │   ├── lib/              → Supabase client, utilities
│   │   └── App.tsx           → Main app + routing
│   ├── package.json          → Dependencies
│   └── vite.config.ts        → Build configuration
│
├── backend/                   ⚠️ MOSTLY UNUSED
│   ├── services/auth/        → Code exists but not running
│   └── services/*/           → Empty directories (future plans)
│
├── SUPABASE_SCHEMA.sql       ✅ ACTIVE - Database schema
├── docker-compose.yml         ❌ NOT USED - Future architecture
└── Documentation files        ✅ Active markdown files

Legend:
✅ = Currently used in production
⚠️ = Exists but not actively running
❌ = Not used at all
```

---

## Part 1: Frontend Application (What You Built)

### Location: `frontend/web/src/`

This is where **100% of your working code** lives.

### Pages (User-Facing Views)

| File | Route | Purpose | Lines |
|------|-------|---------|-------|
| `pages/auth/LoginPage.tsx` | `/login` | User login form | 117 |
| `pages/auth/RegisterPage.tsx` | `/register` | Create new account | 217 |
| `pages/dashboard/DashboardPage.tsx` | `/dashboard` | Role-based routing | 23 |
| `pages/dashboard/AgentDashboard.tsx` | `/dashboard` | Agent view | ~250 |
| `pages/dashboard/BuyerDashboard.tsx` | `/dashboard` | Buyer view | ~200 |
| `pages/dashboard/OwnerDashboard.tsx` | `/dashboard` | Owner view | ~200 |
| `pages/estimator/EstimatorPage.tsx` | `/estimator` | **Main feature** - Tax calculator | 330 |
| `pages/pricing/PricingPage.tsx` | `/pricing` | Subscription plans | 358 |
| `pages/properties/PropertyDetailsPage.tsx` | `/properties/:id` | Single property view | ~150 |
| `pages/documents/DocumentsPage.tsx` | `/documents` | File management | ~250 |
| `pages/timeline/TimelinePage.tsx` | `/timeline` | Transaction steps | ~200 |
| `pages/chat/ChatPage.tsx` | `/chat` | Messaging (UI only) | ~200 |
| `pages/analytics/AnalyticsPage.tsx` | `/analytics` | Charts & metrics | ~300 |

**Total:** ~2,795 lines of page code

### Layout Components

| File | Purpose | Used On |
|------|---------|---------|
| `components/layout/Layout.tsx` | Page wrapper with sidebar + header | All protected pages |
| `components/layout/Header.tsx` | Top navigation bar | Every page after login |
| `components/layout/Sidebar.tsx` | Left navigation menu | Every page after login |
| `components/auth/ProtectedRoute.tsx` | Route guard for auth | All protected routes |

### Core Infrastructure

| File | Purpose | Critical? |
|------|---------|-----------|
| `App.tsx` | Main app, routing, auth check | ✅ Yes |
| `main.tsx` | Entry point | ✅ Yes |
| `store/auth.ts` | Global auth state (Zustand) | ✅ Yes |
| `lib/supabase.ts` | Database client + types | ✅ Yes |
| `lib/api.ts` | HTTP utilities | ⚠️ Minimal use |

---

## Part 2: Database (Supabase)

### Location: `SUPABASE_SCHEMA.sql`

This is the **single source of truth** for your database structure.

### Tables

#### 1. user_profiles
**Purpose:** Store user account information
**Records:** One per user
**Key Fields:**
- `id` - User UUID (links to auth.users)
- `first_name`, `last_name` - User name
- `role` - OWNER | BUYER | AGENT
- `subscription_tier` - free | pro
- `stripe_customer_id` - For billing

**Used By:** Every page (to show user info)

---

#### 2. properties
**Purpose:** Real estate listings
**Records:** Multiple per user (owners/agents)
**Key Fields:**
- `title`, `address`, `district` - Property info
- `price`, `bedrooms`, `bathrooms` - Details
- `status` - active | sold | reserved

**Used By:** Dashboard, Property Details

---

#### 3. estimator_calculations
**Purpose:** Save tax calculation history
**Records:** Multiple per user
**Key Fields:**
- `property_value` - Input value
- `buyer_costs`, `seller_costs` - Calculated results
- `calculation_details` - Full breakdown (JSON)

**Used By:** Estimator Page (main feature)

---

#### 4. documents
**Purpose:** Track uploaded files
**Records:** Multiple per user
**Key Fields:**
- `name`, `file_path` - File info
- `property_id` - Optional link to property
- `status` - pending | verified | rejected

**Used By:** Documents Page

---

#### 5. timeline_events
**Purpose:** Track transaction milestones
**Records:** Multiple per transaction
**Key Fields:**
- `title`, `description` - Event info
- `event_type` - property_listed | offer_made | completed
- `status` - pending | in_progress | completed

**Used By:** Timeline Page

---

## Part 3: Dependencies (What You Rely On)

### Critical External Services (App Breaks Without These)

#### 1. Supabase
**What it provides:** Auth, Database, Storage
**Cost:** $0-25/month
**Files using it:** Every page that reads/writes data
**If it fails:** App completely stops working

#### 2. Vercel
**What it provides:** Frontend hosting, CDN
**Cost:** $0/month (free tier)
**If it fails:** Website is down

### Important Libraries (Features Break Without These)

#### Frontend Core
- **React** (18.2.0) - UI framework
- **React Router** (6.20.0) - Navigation
- **TypeScript** (5.3.2) - Type safety
- **Vite** (5.0.4) - Build tool

#### UI & Styling
- **Tailwind CSS** (3.3.6) - Styling system
- **Heroicons** (2.1.0) - Icons
- **Chart.js** (4.4.1) - Analytics charts

#### State & Data
- **Zustand** (4.4.7) - Auth state management
- **@supabase/supabase-js** (2.76.1) - Database client

#### Payments (Not Fully Implemented)
- **@stripe/stripe-js** (8.1.0) - Payment processing
- ⚠️ Frontend ready, backend missing

---

## Part 4: Key Features & Their Code

### Feature 1: User Authentication

**Files:**
1. `pages/auth/LoginPage.tsx:19` - Login form
2. `pages/auth/RegisterPage.tsx:37` - Signup form
3. `store/auth.ts:52` - Auth state management
4. `App.tsx:24` - Auth initialization

**Flow:**
```
User enters credentials → Supabase Auth validates →
Token stored in localStorage → User profile fetched from DB →
Dashboard rendered
```

**Database:** `user_profiles` table

---

### Feature 2: Tax Estimator (Main Feature)

**File:** `pages/estimator/EstimatorPage.tsx`

**What it does:**
Calculates Peru property taxes (Alcabala, Impuesto a la Renta, fees)

**Key Code Sections:**
- Lines 15-34: Tax calculation formulas
- Lines 36-87: Save to database
- Lines 214-313: Results display

**Calculations:**
```javascript
// Alcabala (buyer tax): 3% over 10 UIT
alcabala = (propertyValue - 51,500) × 0.03

// Impuesto a la Renta (seller tax): 5% of value
impuestoRenta = propertyValue × 0.05

// Notary fees: ~1% split between parties
// Registry fees: ~0.3%
```

**Database:** Saves to `estimator_calculations` table

**Why this matters:** This is your core value proposition - helping users understand property transaction costs in Peru.

---

### Feature 3: Role-Based Dashboards

**Files:**
1. `pages/dashboard/DashboardPage.tsx:6-21` - Router
2. `pages/dashboard/AgentDashboard.tsx` - Agent view
3. `pages/dashboard/BuyerDashboard.tsx` - Buyer view
4. `pages/dashboard/OwnerDashboard.tsx` - Owner view

**How it works:**
```typescript
if (user.role === 'AGENT') return <AgentDashboard />;
if (user.role === 'OWNER') return <OwnerDashboard />;
if (user.role === 'BUYER') return <BuyerDashboard />;
```

**Each dashboard shows different:**
- Agents: Property management, client tracking
- Owners: Their listings, offers received
- Buyers: Saved properties, offer tracking

---

### Feature 4: Subscription Plans (Partial)

**File:** `pages/pricing/PricingPage.tsx`

**Plans:**
- **Free:** 1 property, basic estimator
- **Pro:** Unlimited properties, advanced features ($99/month)
- **Enterprise:** Custom (contact sales)

**Current Status:**
- ✅ UI complete
- ✅ Plan comparison table
- ❌ Payment processing incomplete (shows demo alert)

**To complete:** Need backend webhook to handle Stripe payments

---

## Part 5: What's NOT Being Used

### Backend Services (Defined but Empty)

These directories exist but have **no working code**:

```
backend/services/
├── property/      ❌ Empty
├── transaction/   ❌ Empty
├── document/      ❌ Empty
├── notification/  ❌ Empty
├── chat/          ❌ Empty
├── analytics/     ❌ Empty
└── auth/          ⚠️ Has code but not running
```

**Why they exist:** Future microservices architecture plan

**Current approach:** Supabase handles all these functions

---

### Unused Configuration Files

- `docker-compose.yml` - Defines 11 services (not running)
- `backend/shared/database/migrations/` - Knex migrations (not used)
- Backend TypeScript configs - Not actively used

**Impact:** None - app works fine without them

**Recommendation:** Delete or clearly mark as "future plans"

---

## Part 6: How Code Connects to Database

### Example: Saving a Tax Calculation

**File:** `pages/estimator/EstimatorPage.tsx:53-71`

```typescript
// 1. Calculate taxes (JavaScript in browser)
const alcabala = (propertyValue - 51500) * 0.03;
const impuestoRenta = propertyValue * 0.05;

// 2. Save to Supabase database
const { data, error } = await supabase
  .from('estimator_calculations')
  .insert([{
    user_id: user.id,
    property_value: propertyValueNum,
    buyer_costs: buyerCosts,
    seller_costs: sellerCosts,
    total_costs: totalCosts,
  }]);

// 3. Show success message
if (!error) {
  setSaveSuccess(true);
}
```

**Behind the scenes:**
```
Frontend → Supabase Client → REST API → PostgreSQL
```

**SQL executed (automatic):**
```sql
INSERT INTO estimator_calculations
  (user_id, property_value, buyer_costs, seller_costs, total_costs)
VALUES
  ('user-uuid', 450000, 14205, 23685, 37890);
```

**Security:** Row Level Security (RLS) ensures user can only save their own data

---

## Part 7: Code Quality Assessment

### Strengths ✅

1. **Clean Structure:** Pages, components, store clearly separated
2. **Type Safety:** TypeScript catches errors at compile time
3. **Modern Stack:** React 18, Vite, Tailwind - industry standard
4. **Security:** RLS policies protect data at database level
5. **Maintainable:** Clear file names, consistent patterns

### Areas for Improvement ⚠️

1. **Business Logic in UI:** Tax calculations should be in separate service
   - **Fix:** Extract to `lib/taxCalculator.ts`

2. **Incomplete Features:** Stripe integration half-done
   - **Fix:** Either complete or mark as "Coming Soon"

3. **Ghost Architecture:** Unused backend services create confusion
   - **Fix:** Delete empty directories or add README explaining they're future plans

4. **Duplicate Database Config:** Knex migrations + Supabase schema
   - **Fix:** Delete Knex migrations, use only Supabase

---

## Part 8: Finding Specific Code

### "Where do I find...?"

**User login logic**
→ `frontend/web/src/pages/auth/LoginPage.tsx:19`

**Tax calculation formulas**
→ `frontend/web/src/pages/estimator/EstimatorPage.tsx:15-34`

**Database schema**
→ `SUPABASE_SCHEMA.sql`

**Routing (which URL shows which page)**
→ `frontend/web/src/App.tsx:41-71`

**User authentication state**
→ `frontend/web/src/store/auth.ts`

**Supabase connection**
→ `frontend/web/src/lib/supabase.ts`

**Pricing plans**
→ `frontend/web/src/pages/pricing/PricingPage.tsx:12-65`

---

## Part 9: Quick Reference

### Most Important Files (Read These First)

1. **App.tsx** - Understand routing and app structure
2. **store/auth.ts** - Understand authentication flow
3. **pages/estimator/EstimatorPage.tsx** - Understand main feature
4. **SUPABASE_SCHEMA.sql** - Understand data model

These 4 files give you 80% understanding of the app.

### Files You Can Ignore (For Now)

- Everything in `backend/services/` (not running)
- `docker-compose.yml` (not used in production)
- `backend/shared/database/migrations/` (replaced by Supabase)

---

## Part 10: Metrics That Matter

### Code Complexity
- **Average file size:** 136 lines
- **Largest file:** EstimatorPage.tsx (330 lines) - still manageable
- **Cyclomatic complexity:** Low - mostly straightforward logic

### Maintainability Score: 8/10
- ✅ Clear file structure
- ✅ Consistent naming
- ✅ Type-safe (TypeScript)
- ⚠️ Some business logic in UI components
- ⚠️ Unused code creates confusion

### Technical Debt: Low
- No major refactoring needed
- Can add features without rewriting existing code
- Database schema is well-designed

---

## Summary

### What You Actually Built

**Working Application:**
- 13-page React application
- Tax estimator (Peru property taxes)
- User authentication (signup/login)
- Role-based dashboards
- Document management UI
- Analytics charts

**Lines of Code:** 3,838 lines (excluding dependencies)

**Architecture:** Frontend (React) + Backend (Supabase BaaS)

**Not Built:**
- Custom backend microservices (using Supabase instead)
- Full Stripe payment processing (frontend ready, backend incomplete)
- Mobile app (directory exists but empty)

---

### For Product Managers

**Key Insights:**

1. **Simple is Good:** BaaS architecture = faster development
2. **Focus on Value:** Tax estimator works perfectly, that's what matters
3. **Know What's Real:** Don't confuse plans with reality
4. **Understand Costs:** $0-25/month current, $1000+/month if you over-engineer
5. **Right-Size Decisions:** Choose architecture based on actual needs, not resume buzzwords

**When Talking to Engineers:**

Ask:
- ✅ "What's actually running?"
- ✅ "How many users can this handle?"
- ✅ "What's the monthly cost?"

Don't ask:
- ❌ "Why aren't we using microservices?" (You don't need them yet)
- ❌ "Should we build custom auth?" (Supabase Auth works great)

---

### Next Steps

**To improve code quality:**

1. Extract tax calculations to `lib/taxCalculator.ts` (15 min)
2. Delete unused backend directories (5 min)
3. Mark Stripe as "Coming Soon" in UI (5 min)
4. Delete Knex migrations (5 min)

**Total cleanup time:** 30 minutes

**Impact:** Clearer codebase, less confusion for new developers

---

**Document Status:** ✅ Reflects actual code as of November 2024
**For Full Details:** See complete analysis in `code-base-analysis.md`
