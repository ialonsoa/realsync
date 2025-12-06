# RealSync Architecture Diagrams

## Introduction

This document contains visual architecture diagrams for your RealSync application using Mermaid syntax. These diagrams show how all components connect and interact.

**How to view these diagrams:**
1. **GitHub:** Automatically renders Mermaid diagrams
2. **VS Code:** Install "Markdown Preview Mermaid Support" extension
3. **Online:** Copy code to https://mermaid.live
4. **Export:** Use mermaid.live to export as PNG/SVG/PDF

---

## Diagram 1: High-Level System Architecture

This diagram shows the overall system architecture and how users interact with your application.

```mermaid
graph TB
    subgraph "User Devices"
        Browser["🌐 Web Browser<br/>(Chrome, Safari, Firefox)"]
    end

    subgraph "Frontend - Hosted on Vercel"
        ReactApp["⚛️ React Application<br/>TypeScript + Vite"]
        Router["🗺️ React Router<br/>(Client-side routing)"]
        Store["📦 Zustand Store<br/>(Auth state)"]
        SupaClient["🔌 Supabase Client<br/>(API wrapper)"]

        ReactApp --> Router
        ReactApp --> Store
        ReactApp --> SupaClient
    end

    subgraph "Backend - Supabase Cloud"
        SupaAuth["🔐 Supabase Auth<br/>(JWT tokens)"]
        SupaDB["🗄️ PostgreSQL Database<br/>(Auto REST API)"]
        SupaStorage["📁 Storage<br/>(File uploads)"]
        SupaRealtime["⚡ Realtime<br/>(WebSocket)"]
    end

    subgraph "External Services"
        Stripe["💳 Stripe<br/>(Payments - Planned)"]
        Email["📧 Email Service<br/>(Future)"]
    end

    subgraph "Database Tables"
        UserProfiles["👤 user_profiles"]
        Properties["🏠 properties"]
        Calculations["🧮 estimator_calculations"]
        Documents["📄 documents"]
        Timeline["📅 timeline_events"]
    end

    Browser -->|"HTTPS"| ReactApp
    SupaClient -->|"REST API"| SupaAuth
    SupaClient -->|"REST API"| SupaDB
    SupaClient -->|"REST API"| SupaStorage
    SupaClient -->|"WebSocket"| SupaRealtime

    SupaDB --> UserProfiles
    SupaDB --> Properties
    SupaDB --> Calculations
    SupaDB --> Documents
    SupaDB --> Timeline

    ReactApp -.->|"Future"| Stripe
    SupaAuth -.->|"Future"| Email

    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#3ECF8E,stroke:#333,stroke-width:2px,color:#000
    classDef external fill:#FFB84D,stroke:#333,stroke-width:2px,color:#000
    classDef database fill:#336791,stroke:#333,stroke-width:2px,color:#fff

    class ReactApp,Router,Store,SupaClient frontend
    class SupaAuth,SupaDB,SupaStorage,SupaRealtime backend
    class Stripe,Email external
    class UserProfiles,Properties,Calculations,Documents,Timeline database
```

---

## Diagram 2: Frontend Application Structure

This diagram shows how the React frontend is organized and how components interact.

```mermaid
graph TD
    subgraph "Frontend Application Structure"
        Main["main.tsx<br/>(Entry Point)"]

        subgraph "Application Layer"
            App["App.tsx<br/>- Routing<br/>- Auth initialization"]
        end

        subgraph "State Management"
            AuthStore["store/auth.ts<br/>- User state<br/>- Session<br/>- Login/Logout"]
        end

        subgraph "Infrastructure"
            SupabaseLib["lib/supabase.ts<br/>- DB client<br/>- Type definitions"]
            APILib["lib/api.ts<br/>- HTTP utilities"]
        end

        subgraph "Layout Components"
            Layout["Layout.tsx<br/>- Page wrapper"]
            Header["Header.tsx<br/>- Top navigation"]
            Sidebar["Sidebar.tsx<br/>- Side menu"]
        end

        subgraph "Pages - Auth"
            Login["LoginPage.tsx<br/>- User login form"]
            Register["RegisterPage.tsx<br/>- User signup"]
        end

        subgraph "Pages - Main Features"
            Dashboard["DashboardPage.tsx<br/>- Role-based routing"]
            Estimator["EstimatorPage.tsx<br/>- Tax calculator"]
            Properties["PropertyDetailsPage.tsx<br/>- Property info"]
            Documents["DocumentsPage.tsx<br/>- File management"]
            Timeline["TimelinePage.tsx<br/>- Transaction steps"]
            Analytics["AnalyticsPage.tsx<br/>- Charts & metrics"]
            Pricing["PricingPage.tsx<br/>- Subscription plans"]
            Chat["ChatPage.tsx<br/>- Messaging"]
        end

        Main --> App
        App --> AuthStore
        App --> Layout
        App --> Login
        App --> Register

        Layout --> Header
        Layout --> Sidebar
        Layout --> Dashboard
        Layout --> Estimator
        Layout --> Properties
        Layout --> Documents
        Layout --> Timeline
        Layout --> Analytics
        Layout --> Pricing
        Layout --> Chat

        AuthStore --> SupabaseLib
        Login --> SupabaseLib
        Register --> SupabaseLib
        Estimator --> SupabaseLib
        Documents --> SupabaseLib
        Timeline --> SupabaseLib
    end

    classDef entry fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    classDef app fill:#4ECDC4,stroke:#333,stroke-width:2px,color:#000
    classDef state fill:#FFE66D,stroke:#333,stroke-width:2px,color:#000
    classDef infra fill:#95E1D3,stroke:#333,stroke-width:2px,color:#000
    classDef layout fill:#A8DADC,stroke:#333,stroke-width:2px,color:#000
    classDef page fill:#F1FAEE,stroke:#333,stroke-width:2px,color:#000

    class Main entry
    class App app
    class AuthStore state
    class SupabaseLib,APILib infra
    class Layout,Header,Sidebar layout
    class Login,Register,Dashboard,Estimator,Properties,Documents,Timeline,Analytics,Pricing,Chat page
```

---

## Diagram 3: Database Schema & Relationships

This diagram shows all database tables and their relationships.

```mermaid
erDiagram
    auth_users ||--|| user_profiles : "has profile"
    user_profiles ||--o{ properties : "owns"
    user_profiles ||--o{ estimator_calculations : "runs"
    user_profiles ||--o{ documents : "uploads"
    user_profiles ||--o{ timeline_events : "creates"
    properties ||--o{ documents : "has"
    properties ||--o{ timeline_events : "tracks"

    auth_users {
        uuid id PK
        string email UK
        string encrypted_password
        jsonb raw_user_meta_data
        timestamp created_at
    }

    user_profiles {
        uuid id PK,FK
        string first_name
        string last_name
        enum role "OWNER|BUYER|AGENT"
        string phone
        enum subscription_tier "free|pro"
        enum subscription_status "active|cancelled|past_due"
        string stripe_customer_id
        timestamp created_at
        timestamp updated_at
    }

    properties {
        uuid id PK
        uuid user_id FK
        string title
        string address
        string district
        string city
        decimal price
        int bedrooms
        int bathrooms
        decimal area_m2
        enum property_type "house|apartment|land|commercial"
        enum status "active|sold|reserved|inactive"
        text description
        string image_url
        timestamp created_at
        timestamp updated_at
    }

    estimator_calculations {
        uuid id PK
        uuid user_id FK
        decimal property_value
        decimal buyer_costs
        decimal seller_costs
        decimal total_costs
        jsonb calculation_details
        timestamp created_at
    }

    documents {
        uuid id PK
        uuid user_id FK
        uuid property_id FK "nullable"
        string name
        string file_path
        bigint file_size
        string file_type
        enum status "pending|verified|rejected"
        string uploaded_by
        timestamp created_at
    }

    timeline_events {
        uuid id PK
        uuid user_id FK
        uuid property_id FK "nullable"
        string title
        text description
        enum event_type "property_listed|visit_scheduled|offer_made|completed"
        enum status "pending|in_progress|completed"
        timestamp created_at
    }
```

---

## Diagram 4: Authentication Flow

This diagram shows the complete user authentication process from login to accessing protected pages.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant ReactApp
    participant AuthStore
    participant SupabaseAuth
    participant Database

    Note over User,Database: User Login Flow

    User->>Browser: Enters email + password
    Browser->>ReactApp: Form submission
    ReactApp->>AuthStore: signInWithPassword(email, password)
    AuthStore->>SupabaseAuth: POST /auth/v1/token

    SupabaseAuth->>Database: Query auth.users<br/>WHERE email = ?
    Database-->>SupabaseAuth: User record

    SupabaseAuth->>SupabaseAuth: Verify password hash

    alt Password Valid
        SupabaseAuth->>SupabaseAuth: Generate JWT tokens
        SupabaseAuth-->>AuthStore: {access_token, refresh_token, user}
        AuthStore->>Browser: Store tokens in localStorage
        AuthStore->>Database: SELECT * FROM user_profiles<br/>WHERE id = user.id
        Database-->>AuthStore: User profile data
        AuthStore->>AuthStore: Update state:<br/>{user, isAuthenticated: true}
        AuthStore-->>ReactApp: Auth success
        ReactApp-->>Browser: Navigate to /dashboard
        Browser-->>User: Show dashboard
    else Password Invalid
        SupabaseAuth-->>AuthStore: {error: "Invalid credentials"}
        AuthStore-->>ReactApp: Auth failed
        ReactApp-->>User: Show error message
    end

    Note over User,Database: Automatic Session Check on App Load

    User->>Browser: Visits app URL
    Browser->>ReactApp: Load React app
    ReactApp->>AuthStore: initialize()
    AuthStore->>Browser: Read localStorage tokens

    alt Token exists and valid
        AuthStore->>SupabaseAuth: Validate token
        SupabaseAuth-->>AuthStore: Token valid
        AuthStore->>Database: SELECT user_profiles
        Database-->>AuthStore: Profile data
        AuthStore->>AuthStore: Set isAuthenticated = true
        ReactApp-->>User: Show dashboard
    else No token or expired
        AuthStore->>AuthStore: Set isAuthenticated = false
        ReactApp-->>User: Redirect to /login
    end
```

---

## Diagram 5: Tax Estimator Data Flow

This diagram shows what happens when a user calculates property taxes.

```mermaid
sequenceDiagram
    participant User
    participant EstimatorPage
    participant Browser
    participant SupabaseDB
    participant Database

    Note over User,Database: Tax Calculation Flow

    User->>EstimatorPage: Enters property value<br/>(e.g., S/ 450,000)
    User->>EstimatorPage: Clicks "Calcular Impuestos"

    EstimatorPage->>EstimatorPage: Calculate taxes (JavaScript):<br/>- Alcabala: (450000 - 51500) * 0.03<br/>- Impuesto Renta: 450000 * 0.05<br/>- Notary fees: 450000 * 0.01<br/>- Registry fees: 450000 * 0.003

    EstimatorPage->>EstimatorPage: Update UI:<br/>Show results cards

    EstimatorPage->>Browser: Display calculation results
    Browser-->>User: Show costs breakdown

    Note over EstimatorPage,Database: Save to Database

    EstimatorPage->>SupabaseDB: INSERT INTO estimator_calculations

    rect rgb(240, 240, 255)
        Note right of EstimatorPage: SQL Query:
        Note right of EstimatorPage: INSERT INTO estimator_calculations
        Note right of EstimatorPage: (user_id, property_value,
        Note right of EstimatorPage: buyer_costs, seller_costs,
        Note right of EstimatorPage: total_costs, calculation_details)
        Note right of EstimatorPage: VALUES (...)
    end

    SupabaseDB->>Database: Execute INSERT

    alt Insert Successful
        Database-->>SupabaseDB: {id, created_at}
        SupabaseDB-->>EstimatorPage: Save success
        EstimatorPage-->>User: "✅ Cálculo guardado"
    else Insert Failed
        Database-->>SupabaseDB: {error}
        SupabaseDB-->>EstimatorPage: Error response
        EstimatorPage-->>User: "❌ Error al guardar"
    end

    Note over User,Database: Why Save Calculations?
    Note over User,Database: - User can view history
    Note over User,Database: - Compare multiple properties
    Note over User,Database: - Analytics on popular price ranges
```

---

## Diagram 6: Payment Flow (Stripe - Future Implementation)

This diagram shows the planned payment flow for Pro plan upgrades.

```mermaid
sequenceDiagram
    participant User
    participant PricingPage
    participant Backend
    participant Stripe
    participant Database

    Note over User,Database: Current Status: Frontend Ready, Backend Not Implemented

    User->>PricingPage: Clicks "Upgrade to Pro"

    rect rgb(255, 240, 240)
        Note over PricingPage: Current Demo Mode:
        PricingPage-->>User: Alert: "Demo - Would open Stripe"
    end

    Note over User,Database: Future Production Flow:

    PricingPage->>Backend: POST /api/create-checkout-session<br/>{priceId, userId}
    Backend->>Stripe: Create Checkout Session
    Stripe-->>Backend: {sessionId, checkout_url}
    Backend-->>PricingPage: {sessionId}
    PricingPage->>Stripe: Redirect to checkout_url

    User->>Stripe: Enters credit card info
    Stripe->>Stripe: Process payment

    alt Payment Successful
        Stripe->>Backend: Webhook: checkout.session.completed
        Backend->>Database: UPDATE user_profiles<br/>SET subscription_tier = 'pro'<br/>WHERE id = userId
        Database-->>Backend: Update success
        Stripe-->>User: Redirect to success_url
        User->>PricingPage: Lands on success page
        PricingPage-->>User: "✅ Welcome to Pro!"
    else Payment Failed
        Stripe-->>User: Show error on Stripe page
        User->>Stripe: Fix card info or cancel
        Stripe-->>User: Redirect to cancel_url
        User->>PricingPage: Back to pricing page
    end

    Note over User,Database: Subscription Management

    loop Monthly Billing
        Stripe->>Stripe: Charge card every month
        alt Charge Success
            Stripe->>Backend: Webhook: invoice.paid
            Backend->>Database: Keep subscription_status = 'active'
        else Charge Failed
            Stripe->>Backend: Webhook: invoice.payment_failed
            Backend->>Database: SET subscription_status = 'past_due'
            Backend->>User: Send email: "Payment failed"
        end
    end
```

---

## Diagram 7: Deployment & Infrastructure

This diagram shows how the application is deployed and hosted.

```mermaid
graph TB
    subgraph "Development Environment"
        Dev["👨‍💻 Developer"]
        Git["📦 Git Repository<br/>(GitHub)"]
    end

    subgraph "CI/CD Pipeline"
        GitHub["GitHub Repository"]
        VercelCI["Vercel CI/CD<br/>- Auto build<br/>- Auto deploy"]
    end

    subgraph "Production Environment - Vercel"
        VercelEdge["🌍 Vercel Edge Network<br/>(Global CDN)"]

        subgraph "Frontend Assets"
            HTML["index.html"]
            JS["React bundle.js"]
            CSS["styles.css"]
            Images["Static images"]
        end
    end

    subgraph "Backend Environment - Supabase"
        SupabaseInfra["☁️ Supabase Cloud<br/>(AWS-hosted)"]

        subgraph "Services"
            Auth["Auth Service"]
            PostgREST["PostgREST API"]
            Postgres["PostgreSQL 14"]
            Storage["Object Storage"]
            Realtime["Realtime Server"]
        end
    end

    subgraph "External Services"
        StripeAPI["💳 Stripe API<br/>(Future)"]
    end

    subgraph "End Users"
        UserBrowser["🌐 User Browser"]
    end

    Dev -->|"git push"| Git
    Git -->|"Webhook"| GitHub
    GitHub -->|"Trigger build"| VercelCI
    VercelCI -->|"Deploy"| VercelEdge

    VercelEdge --> HTML
    VercelEdge --> JS
    VercelEdge --> CSS
    VercelEdge --> Images

    UserBrowser -->|"HTTPS<br/>realsync.vercel.app"| VercelEdge
    UserBrowser -->|"HTTPS<br/>API calls"| SupabaseInfra

    SupabaseInfra --> Auth
    SupabaseInfra --> PostgREST
    SupabaseInfra --> Postgres
    SupabaseInfra --> Storage
    SupabaseInfra --> Realtime

    JS -.->|"Future API calls"| StripeAPI

    classDef dev fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    classDef cicd fill:#4ECDC4,stroke:#333,stroke-width:2px,color:#000
    classDef frontend fill:#95E1D3,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#3ECF8E,stroke:#333,stroke-width:2px,color:#000
    classDef external fill:#FFB84D,stroke:#333,stroke-width:2px,color:#000
    classDef user fill:#A8DADC,stroke:#333,stroke-width:2px,color:#000

    class Dev,Git dev
    class GitHub,VercelCI cicd
    class VercelEdge,HTML,JS,CSS,Images frontend
    class SupabaseInfra,Auth,PostgREST,Postgres,Storage,Realtime backend
    class StripeAPI external
    class UserBrowser user
```

---

## Diagram 8: Request/Response Flow (Complete User Journey)

This comprehensive diagram shows a complete user journey from initial page load to data retrieval.

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Vercel
    participant React
    participant Zustand
    participant SupabaseClient
    participant SupabaseAPI
    participant PostgreSQL

    Note over Browser,PostgreSQL: Initial Page Load

    Browser->>Vercel: GET https://realsync.vercel.app
    Vercel-->>Browser: HTML + React bundle
    Browser->>React: Execute JavaScript
    React->>Zustand: Initialize auth store
    Zustand->>Browser: Read localStorage for tokens

    alt Token exists in localStorage
        Zustand->>SupabaseClient: Validate session
        SupabaseClient->>SupabaseAPI: GET /auth/v1/user<br/>Authorization: Bearer <token>
        SupabaseAPI->>SupabaseAPI: Verify JWT signature
        SupabaseAPI-->>SupabaseClient: User data
        SupabaseClient->>SupabaseAPI: GET /rest/v1/user_profiles?id=eq.<uuid>
        SupabaseAPI->>PostgreSQL: SELECT * FROM user_profiles WHERE id = ?
        PostgreSQL-->>SupabaseAPI: Profile data
        SupabaseAPI-->>SupabaseClient: {first_name, last_name, role, ...}
        SupabaseClient-->>Zustand: User authenticated
        Zustand-->>React: Update state: isAuthenticated = true
        React-->>Browser: Render Dashboard
    else No token or invalid
        Zustand-->>React: Update state: isAuthenticated = false
        React-->>Browser: Redirect to /login
    end

    Note over Browser,PostgreSQL: User Interacts with Dashboard

    Browser->>React: User navigates to /estimator
    React->>React: Render EstimatorPage.tsx
    React-->>Browser: Show tax calculator form

    Browser->>React: User submits calculation
    React->>React: Calculate taxes (client-side)
    React->>SupabaseClient: Insert calculation
    SupabaseClient->>SupabaseAPI: POST /rest/v1/estimator_calculations<br/>Authorization: Bearer <token><br/>Body: {user_id, property_value, ...}
    SupabaseAPI->>SupabaseAPI: Verify JWT
    SupabaseAPI->>PostgreSQL: Check RLS policy:<br/>auth.uid() = user_id

    alt RLS Policy Passes
        PostgreSQL->>PostgreSQL: INSERT INTO estimator_calculations
        PostgreSQL-->>SupabaseAPI: {id, created_at}
        SupabaseAPI-->>SupabaseClient: Success response
        SupabaseClient-->>React: Calculation saved
        React-->>Browser: Show "✅ Saved successfully"
    else RLS Policy Fails
        PostgreSQL-->>SupabaseAPI: Permission denied
        SupabaseAPI-->>SupabaseClient: 403 Forbidden
        SupabaseClient-->>React: Error
        React-->>Browser: Show "❌ Failed to save"
    end
```

---

## Diagram 9: Technology Stack Layers

This diagram shows the complete technology stack organized by layers.

```mermaid
graph TB
    subgraph "Presentation Layer - User Interface"
        UI1["React Components<br/>- Functional components<br/>- Hooks (useState, useEffect)"]
        UI2["Tailwind CSS<br/>- Utility-first styling<br/>- Responsive design"]
        UI3["Heroicons<br/>- UI icons"]
        UI4["Chart.js<br/>- Data visualization"]
    end

    subgraph "Application Layer - Business Logic"
        App1["React Router<br/>- Client-side routing<br/>- Protected routes"]
        App2["Zustand<br/>- Global state management"]
        App3["Form Validation<br/>- Input validation<br/>- Error handling"]
    end

    subgraph "Integration Layer - APIs & Services"
        Int1["Supabase Client<br/>- Database queries<br/>- Auth methods"]
        Int2["Stripe.js<br/>- Payment integration"]
        Int3["Axios<br/>- HTTP client"]
    end

    subgraph "Backend Layer - Supabase BaaS"
        Back1["Supabase Auth<br/>- User management<br/>- JWT tokens"]
        Back2["PostgREST<br/>- Auto REST API<br/>- Query builder"]
        Back3["Realtime<br/>- WebSocket server<br/>- Live updates"]
        Back4["Storage API<br/>- File uploads<br/>- CDN delivery"]
    end

    subgraph "Data Layer - Database"
        Data1["PostgreSQL 14<br/>- Relational database<br/>- Row Level Security"]
        Data2["Indexes<br/>- Query optimization"]
        Data3["Triggers<br/>- Auto profile creation"]
    end

    subgraph "Infrastructure Layer - Hosting"
        Infra1["Vercel<br/>- Frontend hosting<br/>- CDN<br/>- SSL/HTTPS"]
        Infra2["Supabase Cloud<br/>- AWS-hosted<br/>- Auto-scaling"]
    end

    UI1 --> App1
    UI2 --> App1
    UI3 --> App1
    UI4 --> App1

    App1 --> Int1
    App2 --> Int1
    App3 --> Int1

    Int1 --> Back1
    Int1 --> Back2
    Int1 --> Back3
    Int1 --> Back4
    Int2 -.-> |Future| Back1

    Back1 --> Data1
    Back2 --> Data1
    Back3 --> Data1
    Back4 --> Data1

    Data1 --> Data2
    Data1 --> Data3

    Infra1 -.-> |Hosts| UI1
    Infra2 -.-> |Hosts| Back1

    classDef presentation fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    classDef application fill:#FFE66D,stroke:#333,stroke-width:2px,color:#000
    classDef integration fill:#A8DADC,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#3ECF8E,stroke:#333,stroke-width:2px,color:#000
    classDef data fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    classDef infrastructure fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff

    class UI1,UI2,UI3,UI4 presentation
    class App1,App2,App3 application
    class Int1,Int2,Int3 integration
    class Back1,Back2,Back3,Back4 backend
    class Data1,Data2,Data3 data
    class Infra1,Infra2 infrastructure
```

---

## How to Use These Diagrams

### Viewing Options:

1. **GitHub/GitLab**
   - Mermaid diagrams render automatically
   - Just push this file and view it

2. **VS Code**
   - Install: "Markdown Preview Mermaid Support" extension
   - Open this file and click preview button

3. **Mermaid Live Editor**
   - Go to https://mermaid.live
   - Copy any diagram code
   - Paste and it renders instantly
   - Export as PNG/SVG/PDF

4. **Documentation Sites**
   - Many doc platforms support Mermaid (GitBook, Docusaurus, MkDocs)

### For Your Sprint 4 Presentation:

1. **Export diagrams as images:**
   - Use mermaid.live to convert to PNG
   - Download and add to presentation slides

2. **Print this document:**
   - Open in browser (with Mermaid extension)
   - Print to PDF for physical reference

3. **Video explanation:**
   - Screen record while walking through each diagram
   - Explain each box and arrow
   - Use diagrams as visual aids

---

## Summary

You now have comprehensive visual documentation showing:

1. **High-level architecture** - Overall system design
2. **Frontend structure** - How React app is organized
3. **Database schema** - Tables and relationships
4. **Authentication flow** - Login process step-by-step
5. **Tax estimator flow** - Feature-specific data flow
6. **Payment flow** - Future Stripe integration
7. **Deployment** - How code becomes a live website
8. **Request/response** - Complete user journey
9. **Technology stack** - All layers of the system

These diagrams will help you:
- Explain your architecture to stakeholders
- Onboard new developers
- Plan new features
- Understand system dependencies
- Prepare for technical interviews

**As a product manager**, you can now confidently discuss technical architecture with engineers and make informed decisions about scalability, features, and technical debt!
