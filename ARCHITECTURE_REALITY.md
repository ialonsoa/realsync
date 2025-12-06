# RealSync Architecture - Current Reality

**Last Updated:** November 21, 2024
**Sprint:** 4
**Status:** Production MVP

---

## Executive Summary

RealSync is a **Backend-as-a-Service (BaaS) application** using Supabase for all backend functionality. Despite the presence of `docker-compose.yml` defining 11 microservices, the actual running application uses a simpler, more efficient architecture appropriate for our current scale.

**Current Users:** 0-100 (MVP launch phase)
**Architecture Capacity:** 1,000-10,000 concurrent users
**Monthly Cost:** $0-25 (free tiers)

---

## What's Actually Running

### 1. Frontend Application
**Technology:** React 18 + TypeScript + Vite
**Hosting:** Vercel (vercel.com)
**URL:** https://realsync.vercel.app
**Lines of Code:** ~2,800 lines

**Components:**
- 13 page views (Login, Register, Dashboard, Estimator, etc.)
- Role-based dashboards (Agent, Owner, Buyer)
- Tax estimator (main feature - Peru property taxes)
- Document management UI
- Analytics charts
- Pricing/subscription page

**Key Libraries:**
- React Router (navigation)
- Zustand (state management)
- Tailwind CSS (styling)
- Chart.js (analytics)
- Heroicons (UI icons)

---

### 2. Backend Services (Supabase)
**Provider:** Supabase (supabase.com)
**Hosting:** AWS (managed by Supabase)
**Architecture Type:** Backend-as-a-Service (BaaS)

**Services Provided:**

#### A. Authentication
- User signup/login
- JWT token generation
- Password hashing (bcrypt)
- Email verification
- Session management

**API Endpoints Used:**
```
POST /auth/v1/signup
POST /auth/v1/token?grant_type=password
GET  /auth/v1/user
POST /auth/v1/logout
```

#### B. PostgreSQL Database
- 5 tables with Row Level Security (RLS)
- Auto-generated REST API
- Real-time subscriptions

**Tables:**
1. `user_profiles` - User account info
2. `properties` - Property listings
3. `estimator_calculations` - Tax calculation history
4. `documents` - Document metadata
5. `timeline_events` - Transaction milestones

**API Endpoints (Auto-generated):**
```
GET/POST/PATCH/DELETE /rest/v1/{table_name}
```

#### C. Storage Service
- File uploads (PDFs, images)
- Secure signed URLs
- CDN delivery

**Bucket:** `documents`

---

### 3. External Integrations

#### Stripe (Partial Integration)
**Status:** ⚠️ Frontend ready, backend incomplete
**Current State:** Demo mode (shows alert, doesn't process payments)
**Impact:** Free tier works, Pro upgrades not functional

**Files:**
- ✅ `frontend/web/src/pages/pricing/PricingPage.tsx` - UI complete
- ❌ Backend webhook handler - Not implemented
- ❌ Checkout session creation - Not implemented

---

## What's NOT Running

### Planned Microservices (Not Implemented)

The following services are **defined in docker-compose.yml** but have **no actual code** and are **not running**:

| Service | Port | Status | Directory Exists? |
|---------|------|--------|-------------------|
| Property Service | 8002 | ❌ Not implemented | Yes (empty) |
| Transaction Service | 8003 | ❌ Not implemented | Yes (empty) |
| Document Service | 8004 | ❌ Not implemented | Yes (empty) |
| Notification Service | 8005 | ❌ Not implemented | Yes (empty) |
| Chat Service | 8007 | ❌ Not implemented | Yes (empty) |
| Analytics Service | 8008 | ❌ Not implemented | Yes (empty) |
| Auth Service | 8001 | ⚠️ Code exists but not used | Yes (implemented but unused) |

**Why they exist:** These represent the **future architecture plan** when we scale beyond 10,000 users or need custom backend logic.

**Current approach:** Supabase handles all these concerns via BaaS.

---

### Unused Infrastructure

#### Knex.js Migrations
**Location:** `backend/shared/database/migrations/`
**Status:** ❌ Not used (Supabase manages schema)
**Why they exist:** Originally planned for self-hosted PostgreSQL

**Source of Truth:** `SUPABASE_SCHEMA.sql` (applied via Supabase dashboard)

#### Docker Compose Services
**File:** `docker-compose.yml`
**Status:** ❌ Not running in production
**Why it exists:** Development environment setup (not currently used)

**Current Development:** Direct connection to Supabase cloud instance

---

## Actual Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              USER'S BROWSER                         │
│  ┌───────────────────────────────────────────────┐  │
│  │   React Application (TypeScript)              │  │
│  │   • 13 pages (Dashboard, Estimator, etc.)     │  │
│  │   • Zustand state (auth)                      │  │
│  │   • React Router (navigation)                 │  │
│  │   • Tailwind CSS (styling)                    │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTPS (REST + WebSocket)
                     │
┌────────────────────▼────────────────────────────────┐
│            SUPABASE CLOUD (BaaS)                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  🔐 Authentication Service                   │   │
│  │  • JWT tokens                                │   │
│  │  • User sessions                             │   │
│  │  • Password hashing                          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  🗄️  PostgreSQL Database                     │   │
│  │  • user_profiles (account info)              │   │
│  │  • properties (listings)                     │   │
│  │  • estimator_calculations (taxes)            │   │
│  │  • documents (metadata)                      │   │
│  │  • timeline_events (milestones)              │   │
│  │  • Row Level Security (RLS)                  │   │
│  │  • Auto REST API                             │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  📁 Storage Service                          │   │
│  │  • Bucket: documents                         │   │
│  │  • File uploads (PDFs, images)               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
             │                          │
             │ (Future)                 │ (Future)
             ▼                          ▼
    ┌────────────────┐        ┌────────────────┐
    │ 💳 Stripe      │        │ 📧 Email       │
    │   Payments     │        │   Service      │
    └────────────────┘        └────────────────┘
```

**Deployment:**
- Frontend: Vercel CDN (global)
- Backend: Supabase Cloud (AWS-hosted)
- Database: Supabase PostgreSQL (managed)

---

## Why This Architecture?

### Advantages of BaaS (Current Approach)

✅ **Speed:** Built full-stack app in 3 weeks
✅ **Cost:** $0-25/month for first 1,000 users
✅ **Security:** Built-in RLS, JWT, password hashing
✅ **Scalability:** Handles 10,000+ users without changes
✅ **Maintenance:** No server management, auto-scaling
✅ **Type Safety:** Auto-generated TypeScript types from schema

### When to Migrate to Microservices

Consider the planned microservices architecture when:

1. **Scale:** Exceeding 10,000 concurrent users
2. **Complex Logic:** Business rules too complex for database triggers/functions
3. **Team Size:** Engineering team grows beyond 5 people
4. **Custom Features:** Need features not supported by Supabase (e.g., complex AI, custom protocols)
5. **Cost:** Supabase costs exceed self-hosted infrastructure savings
6. **Compliance:** Specific data residency requirements

**Current Status:** None of these triggers apply yet ✅

---

## Data Flow Example: User Login

Here's what actually happens when a user logs in:

```
1. User enters email + password in LoginPage.tsx
   ↓
2. Frontend calls: supabase.auth.signInWithPassword()
   ↓
3. Supabase Auth validates credentials
   ↓
4. Supabase returns JWT access token
   ↓
5. Token stored in browser localStorage
   ↓
6. Frontend queries: SELECT * FROM user_profiles WHERE id = user.id
   ↓
7. Zustand store updates: { user, isAuthenticated: true }
   ↓
8. React Router redirects to /dashboard
   ↓
9. DashboardPage.tsx shows role-specific view
```

**No custom backend code required** - all handled by Supabase + React.

---

## Technology Stack (Actual)

### Frontend
- **Framework:** React 18.2.0
- **Language:** TypeScript 5.3.2
- **Build Tool:** Vite 5.0.4
- **Styling:** Tailwind CSS 3.3.6
- **State:** Zustand 4.4.7
- **Routing:** React Router 6.20.0
- **Charts:** Chart.js 4.4.1
- **Icons:** Heroicons 2.1.0

### Backend (BaaS)
- **Provider:** Supabase
- **Database:** PostgreSQL 14
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime (WebSocket)

### Infrastructure
- **Frontend Host:** Vercel
- **Backend Host:** Supabase Cloud (AWS)
- **CDN:** Vercel Edge Network
- **SSL:** Automatic (Vercel + Supabase)

### External Services
- **Payments:** Stripe (planned, not active)
- **Analytics:** Built-in Chart.js (not Google Analytics)
- **Monitoring:** Supabase Dashboard

---

## Cost Breakdown (Current)

### Free Tier (0-500 users)
| Service | Plan | Cost | Limit |
|---------|------|------|-------|
| Supabase | Free | $0 | 500MB DB, 2GB bandwidth |
| Vercel | Hobby | $0 | 100GB bandwidth |
| **Total** | | **$0/month** | |

### Paid Tier (500-10,000 users)
| Service | Plan | Cost | Limit |
|---------|------|------|-------|
| Supabase | Pro | $25 | 8GB DB, 50GB bandwidth |
| Vercel | Hobby | $0 | Still within free tier |
| **Total** | | **$25/month** | |

**Revenue Potential:** 100 Pro subscribers × $99/month = $9,900/month
**Profit Margin:** 99.7% ($9,875 profit on $25 infrastructure)

---

## Project Statistics

### Code Metrics
- **Total Lines:** 3,838 lines (excluding dependencies)
- **Frontend:** 2,800 lines (73%)
- **Backend:** 830 lines (22%) - Auth service (unused)
- **Config:** 208 lines (5%)

### Files
- **Frontend Pages:** 13 files
- **Frontend Components:** 4 files
- **Database Tables:** 5 tables
- **API Endpoints:** 15+ (auto-generated by Supabase)

### Database
- **Tables:** 5
- **Indexes:** 7
- **Triggers:** 2
- **RLS Policies:** 16
- **Storage Buckets:** 1

---

## Migration Path (Future)

If we reach 10,000+ users or need custom backend logic:

### Phase 1: Hybrid (Keep Supabase + Add Custom APIs)
- Add Vercel Serverless Functions for complex logic
- Keep Supabase for auth + database
- Cost: ~$50-100/month

### Phase 2: Partial Microservices
- Move specific features to dedicated services
- Example: Separate analytics service for heavy computations
- Keep Supabase for auth + core database
- Cost: ~$200-500/month

### Phase 3: Full Microservices
- Implement docker-compose.yml architecture
- Replace Supabase with self-hosted PostgreSQL
- API Gateway (Kong) + 7 microservices
- Cost: ~$1,000-2,000/month
- Requires: 3-5 engineers for maintenance

**Current Decision:** Stay on Phase 0 (Pure BaaS) until revenue justifies migration costs.

---

## Key Takeaways for Product Managers

### What This Architecture Teaches

1. **Right-Size Your Architecture:** Don't build for theoretical scale
2. **Use BaaS for MVPs:** 10x faster development
3. **Documentation Should Match Reality:** Don't document what you plan, document what exists
4. **Understand Your Costs:** $0-25/month vs $1,000+/month for microservices
5. **Focus on Value:** Tax estimator works perfectly, doesn't need microservices

### Common PM Mistakes to Avoid
❌ Over-engineering for future scale
❌ Documenting planned features as if they exist
❌ Choosing architecture based on resume buzzwords
❌ Ignoring cost implications of architectural choices

### What Good PMs Do
✅ Choose simplest architecture that works
✅ Document actual state clearly
✅ Know when to scale (user data, not guesses)
✅ Balance speed vs perfection for MVP stage

---

## Questions to Ask Your Engineers

When evaluating architecture decisions:

1. **"What's actually running vs what's planned?"**
2. **"What's our current user capacity?"**
3. **"What's the monthly infrastructure cost?"**
4. **"At what user count do we need to scale?"**
5. **"What's our migration path if we outgrow this?"**

These questions help you separate reality from aspiration.

---

## Summary

**RealSync Current Architecture:**
- Frontend: React app on Vercel
- Backend: Supabase BaaS (auth, database, storage)
- Cost: $0-25/month
- Capacity: 1,000-10,000 users
- Development Speed: Extremely fast
- Maintenance Burden: Minimal

**This is not a weakness** - it's a strategic choice that allows rapid MVP development while maintaining a clear scaling path.

The presence of `docker-compose.yml` and backend service directories represents **architectural vision**, not current implementation. This is fine as long as documentation clearly distinguishes between the two.

---

## Appendix: File Locations

### Active Code
- Frontend: `frontend/web/src/`
- Supabase Schema: `SUPABASE_SCHEMA.sql`
- Environment Config: `.env` (not in Git)

### Inactive/Future Code
- Backend Services: `backend/services/*` (mostly empty)
- Knex Migrations: `backend/shared/database/migrations/` (unused)
- Docker Compose: `docker-compose.yml` (future reference)

### Documentation
- This File: `ARCHITECTURE_REALITY.md`
- Full Analysis: `code-base-analysis.md`, `data-flow-analysis.md`, etc.

---

**Document Status:** ✅ Reflects actual production architecture as of November 2024
**Next Review:** When reaching 1,000 active users or $10K MRR
