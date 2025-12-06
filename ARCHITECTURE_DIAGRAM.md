# RealSync - Application Architecture Diagram

## Complete Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph "Frontend - React Application"
        UI[User Interface<br/>React 18 + TypeScript<br/>Tailwind CSS]

        subgraph "Pages"
            LOGIN[Login/Register]
            DASH[Dashboard]
            PROFILE[Profile Management]
            PROPS[Properties]
            ESTIMATE[Tax Estimator]
            DOCS[Documents]
            TIMELINE[Timeline]
            PRICING[Pricing/Payments]
            ANALYTICS[Analytics]
        end

        subgraph "State Management"
            ZUSTAND[Zustand Store<br/>- Auth State<br/>- User Profile]
        end

        subgraph "API Clients"
            SUPA_CLIENT[Supabase Client<br/>- Auth<br/>- Database<br/>- Storage]
            PROFILE_API[Profile API<br/>20+ functions]
            STRIPE_CLIENT[Stripe.js<br/>Payment SDK]
        end
    end

    subgraph "External Services"
        subgraph "Vercel - Hosting"
            VERCEL[Vercel Platform<br/>Frontend Deployment<br/>CDN + Edge Network]
        end

        subgraph "Supabase - Backend as a Service"
            SUPA_AUTH[Supabase Auth<br/>JWT Tokens<br/>Email Verification]
            SUPA_DB[PostgreSQL Database<br/>Row-Level Security]
            SUPA_STORAGE[Supabase Storage<br/>Profile Photos<br/>Documents]
            SUPA_RLS[RLS Policies<br/>Security Layer]
        end

        subgraph "Stripe - Payments"
            STRIPE[Stripe API<br/>Subscriptions<br/>Checkout]
        end
    end

    subgraph "Database Schema - PostgreSQL"
        subgraph "Authentication & Users"
            AUTH_USERS[auth.users<br/>- id<br/>- email<br/>- encrypted_password]
            USER_PROFILES[user_profiles<br/>- id<br/>- full_name<br/>- phone<br/>- profile_photo_url<br/>- subscription_tier<br/>- stripe_customer_id]
        end

        subgraph "Profile System (Multi-Role)"
            ROLE_PROFILES[role_profiles<br/>- id<br/>- user_profile_id<br/>- role_type<br/>- is_primary]
            AGENT_PROFILES[agent_profiles<br/>- license_number<br/>- brokerage_name<br/>- service_regions<br/>- verification_status]
            BUYER_PROFILES[buyer_profiles<br/>- property_types_interested<br/>- budget_min/max<br/>- financing_status]
            OWNER_PROFILES[owner_profiles<br/>- properties_count<br/>- selling_timeline<br/>- preferred_contact]
            PRIVACY_SETTINGS[profile_privacy_settings<br/>- phone_visibility<br/>- email_visibility<br/>- show_on_search]
        end

        subgraph "Core Features"
            PROPERTIES[properties<br/>- title<br/>- address<br/>- price<br/>- bedrooms/bathrooms<br/>- property_type<br/>- status]
            ESTIMATOR[estimator_calculations<br/>- property_value<br/>- buyer_costs<br/>- seller_costs<br/>- calculation_details]
            DOCUMENTS[documents<br/>- name<br/>- file_path<br/>- file_size<br/>- status]
            TIMELINE_EVENTS[timeline_events<br/>- title<br/>- event_type<br/>- status<br/>- property_id]
        end

        subgraph "Compliance"
            ACCESS_LOGS[profile_access_logs<br/>- profile_user_id<br/>- accessor_user_id<br/>- accessed_fields<br/>- ip_address]
        end
    end

    subgraph "Technology Stack"
        FRONTEND_TECH["Frontend<br/>━━━━━━━━━━<br/>• React 18<br/>• TypeScript 5<br/>• Vite 5<br/>• Tailwind CSS 3<br/>• React Router 6<br/>• Zustand<br/>• Heroicons"]
        BACKEND_TECH["Backend<br/>━━━━━━━━━━<br/>• Supabase<br/>• PostgreSQL 14<br/>• Row-Level Security<br/>• JWT Authentication<br/>• Storage Buckets"]
        SERVICES_TECH["Services<br/>━━━━━━━━━━<br/>• Vercel (Hosting)<br/>• Stripe (Payments)<br/>• Supabase (BaaS)"]
    end

    %% User Flows
    UI -->|Navigate| LOGIN
    UI -->|Navigate| DASH
    UI -->|Navigate| PROFILE
    UI -->|Navigate| PROPS
    UI -->|Navigate| ESTIMATE
    UI -->|Navigate| PRICING

    %% State Management
    LOGIN -.->|Update Auth| ZUSTAND
    PROFILE -.->|Update Profile| ZUSTAND

    %% API Calls
    LOGIN -->|Auth Request| SUPA_CLIENT
    PROFILE -->|CRUD Operations| PROFILE_API
    ESTIMATE -->|Save Calculation| SUPA_CLIENT
    PRICING -->|Checkout| STRIPE_CLIENT

    %% External Service Connections
    SUPA_CLIENT -->|API Calls| SUPA_AUTH
    SUPA_CLIENT -->|Queries| SUPA_DB
    SUPA_CLIENT -->|Upload/Download| SUPA_STORAGE
    STRIPE_CLIENT -->|Payment Intent| STRIPE

    %% Database Relationships
    AUTH_USERS -->|1:1| USER_PROFILES
    USER_PROFILES -->|1:N| ROLE_PROFILES
    ROLE_PROFILES -->|1:1| AGENT_PROFILES
    ROLE_PROFILES -->|1:1| BUYER_PROFILES
    ROLE_PROFILES -->|1:1| OWNER_PROFILES
    USER_PROFILES -->|1:1| PRIVACY_SETTINGS
    USER_PROFILES -->|1:N| PROPERTIES
    USER_PROFILES -->|1:N| ESTIMATOR
    USER_PROFILES -->|1:N| DOCUMENTS
    USER_PROFILES -->|1:N| ACCESS_LOGS

    %% Security Layer
    SUPA_DB -.->|Enforces| SUPA_RLS
    SUPA_RLS -.->|Protects| USER_PROFILES
    SUPA_RLS -.->|Protects| ROLE_PROFILES
    SUPA_RLS -.->|Protects| PROPERTIES

    %% Deployment
    VERCEL -.->|Serves| UI

    style UI fill:#3b82f6,stroke:#1e40af,color:#fff
    style SUPA_DB fill:#10b981,stroke:#059669,color:#fff
    style STRIPE fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style VERCEL fill:#000,stroke:#333,color:#fff
    style SUPA_RLS fill:#ef4444,stroke:#dc2626,color:#fff
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase Auth
    participant PostgreSQL
    participant Email Service

    User->>Frontend: Enter email & password
    Frontend->>Supabase Auth: signUp() / signIn()
    Supabase Auth->>Supabase Auth: Hash password
    Supabase Auth->>PostgreSQL: Create/verify user in auth.users

    alt Registration
        Supabase Auth->>Email Service: Send verification email
        Email Service->>User: Verification link
        User->>Supabase Auth: Click verification link
        Supabase Auth->>PostgreSQL: Update email_confirmed_at
        PostgreSQL->>PostgreSQL: Trigger: create user_profiles entry
    end

    Supabase Auth->>Frontend: Return JWT access token
    Frontend->>Frontend: Store token in localStorage
    Frontend->>PostgreSQL: Fetch user profile (with JWT)
    PostgreSQL->>PostgreSQL: RLS: Verify auth.uid() = user_id
    PostgreSQL->>Frontend: Return user profile data
    Frontend->>User: Redirect to dashboard
```

## Profile Creation Flow (Sprint 4)

```mermaid
sequenceDiagram
    participant User
    participant CreateProfile Page
    participant ProfileAPI
    participant Supabase DB
    participant Supabase Storage

    User->>CreateProfile Page: Navigate to /profile/create
    CreateProfile Page->>User: Show Step 1: Select Role
    User->>CreateProfile Page: Choose role (Agent/Buyer/Owner)

    CreateProfile Page->>User: Show Step 2: Basic Info
    User->>CreateProfile Page: Enter name, phone, language
    User->>CreateProfile Page: Upload profile photo (optional)

    CreateProfile Page->>User: Show Step 3: Role-Specific Form
    User->>CreateProfile Page: Fill role-specific fields

    User->>CreateProfile Page: Click "Complete Profile"

    CreateProfile Page->>ProfileAPI: updateUserProfile(basicInfo)
    ProfileAPI->>Supabase DB: UPDATE user_profiles
    Supabase DB->>Supabase DB: RLS: Check auth.uid()
    Supabase DB->>ProfileAPI: Success

    alt Photo Upload
        CreateProfile Page->>ProfileAPI: uploadProfilePhoto(file)
        ProfileAPI->>Supabase Storage: Upload to profile-photos/{userId}
        Supabase Storage->>ProfileAPI: Return public URL
        ProfileAPI->>Supabase DB: UPDATE user_profiles.profile_photo_url
    end

    CreateProfile Page->>ProfileAPI: createRoleProfile(roleType)
    ProfileAPI->>Supabase DB: INSERT INTO role_profiles
    Supabase DB->>ProfileAPI: Return role_profile_id

    alt Agent Role
        CreateProfile Page->>ProfileAPI: createAgentProfile(data)
        ProfileAPI->>Supabase DB: INSERT INTO agent_profiles
    else Buyer Role
        CreateProfile Page->>ProfileAPI: createBuyerProfile(data)
        ProfileAPI->>Supabase DB: INSERT INTO buyer_profiles
    else Owner Role
        CreateProfile Page->>ProfileAPI: createOwnerProfile(data)
        ProfileAPI->>Supabase DB: INSERT INTO owner_profiles
    end

    Supabase DB->>Supabase DB: Trigger: create privacy_settings
    Supabase DB->>ProfileAPI: Success
    ProfileAPI->>CreateProfile Page: Profile created
    CreateProfile Page->>User: Redirect to /dashboard
```

## Payment Flow (Stripe Integration)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Stripe.js
    participant Stripe API
    participant Supabase

    User->>Frontend: Navigate to /pricing
    Frontend->>User: Display pricing tiers

    User->>Frontend: Click "Upgrade to Pro"
    Frontend->>Stripe.js: Load Stripe checkout
    Stripe.js->>Stripe API: Create checkout session
    Stripe API->>Stripe.js: Return session URL
    Stripe.js->>User: Redirect to Stripe checkout

    User->>Stripe API: Enter payment details
    Stripe API->>Stripe API: Process payment

    alt Payment Success
        Stripe API->>User: Redirect to success URL
        Stripe API->>Frontend: Webhook: checkout.session.completed
        Frontend->>Supabase: UPDATE user_profiles
        Supabase->>Supabase: Set subscription_tier = 'pro'
        Supabase->>Supabase: Set stripe_customer_id
        Frontend->>User: Show success message
    else Payment Failed
        Stripe API->>User: Redirect to cancel URL
        Frontend->>User: Show error message
    end
```

## Tax Estimator Data Flow

```mermaid
sequenceDiagram
    participant User
    participant EstimatorPage
    participant SupabaseClient
    participant PostgreSQL

    User->>EstimatorPage: Navigate to /estimator
    EstimatorPage->>User: Show calculator form

    User->>EstimatorPage: Enter property value
    User->>EstimatorPage: Click "Calculate"

    EstimatorPage->>EstimatorPage: Calculate Peru taxes:<br/>• Alcabala (3% over 10 UIT)<br/>• Impuesto a la Renta (5%)<br/>• Notary fees (~1%)<br/>• Registry fees (~0.3%)

    EstimatorPage->>User: Display breakdown

    EstimatorPage->>SupabaseClient: Save calculation
    SupabaseClient->>PostgreSQL: INSERT INTO estimator_calculations
    PostgreSQL->>PostgreSQL: RLS: Verify user owns data
    PostgreSQL->>SupabaseClient: Success
    SupabaseClient->>EstimatorPage: Saved
    EstimatorPage->>User: Show "✓ Calculation saved"
```

## Security Architecture (Row-Level Security)

```mermaid
---

## Key Statistics

### Database
- **Tables**: 11 tables
  - Authentication: 2 (auth.users, user_profiles)
  - Profiles: 5 (role_profiles, agent_profiles, buyer_profiles, owner_profiles, privacy_settings)
  - Features: 3 (properties, estimator_calculations, documents, timeline_events)
  - Audit: 1 (profile_access_logs)

### Frontend
- **Pages**: 9 pages
- **Components**: 20+ components
- **Lines of Code**: ~3,600 lines (TypeScript + React)

### Features Implemented
- ✅ Authentication (Supabase Auth)
- ✅ User Profiles (Multi-role: Agent/Buyer/Owner)
- ✅ Tax Estimator (Peru-specific calculations)
- ✅ Properties Management
- ✅ Documents (metadata only)
- ✅ Timeline Events
- ✅ Stripe Payments Integration
- ✅ Privacy Controls
- ✅ Profile Photo Upload

### Security
- ✅ Row-Level Security on all tables
- ✅ JWT authentication
- ✅ Email verification
- ✅ Encrypted passwords
- ✅ HTTPS (Vercel)
- ✅ Audit logging

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel
- **Payments**: Stripe
- **Database**: PostgreSQL 14 with RLS
