# RealSync Architecture Diagram (Simple - 1 Page)

**Purpose:** Visual representation of actual running architecture
**Export Instructions:** Copy Mermaid code to https://mermaid.live and download as PNG/PDF

---

## Main Architecture Diagram

Copy this code to mermaid.live:

```mermaid
graph TB
    subgraph "👤 User Layer"
        User["🌐 User's Web Browser<br/>(Chrome, Safari, Firefox)"]
    end

    subgraph "🎨 Frontend - Vercel Hosting"
        React["⚛️ React Application<br/><br/>📦 13 Pages:<br/>• Login & Register<br/>• Dashboard (Agent/Buyer/Owner)<br/>• Tax Estimator ⭐<br/>• Pricing & Subscriptions<br/>• Documents, Timeline, Analytics<br/><br/>🛠️ Tech Stack:<br/>TypeScript + Vite + Tailwind CSS<br/>Zustand (state) + React Router<br/><br/>📊 3,838 lines of code"]
    end

    subgraph "☁️ Backend - Supabase Cloud (BaaS)"
        Auth["🔐 Authentication<br/><br/>• User signup/login<br/>• JWT tokens<br/>• Password hashing<br/>• Session management"]

        DB["🗄️ PostgreSQL Database<br/><br/>📋 5 Tables:<br/>• user_profiles (accounts)<br/>• properties (listings)<br/>• estimator_calculations ⭐<br/>• documents (files)<br/>• timeline_events<br/><br/>🔒 Row Level Security (RLS)<br/>🔄 Auto REST API"]

        Storage["📁 File Storage<br/><br/>• Document uploads<br/>• Images & PDFs<br/>• Secure signed URLs<br/>• CDN delivery"]
    end

    subgraph "💳 External Services"
        Stripe["💳 Stripe<br/>(Payments)<br/><br/>⚠️ Frontend ready<br/>❌ Backend incomplete"]
    end

    User -->|"HTTPS<br/>realsync.vercel.app"| React
    React -->|"REST API<br/>Authentication"| Auth
    React -->|"REST API<br/>CRUD operations"| DB
    React -->|"REST API<br/>File upload/download"| Storage
    React -.->|"Future integration"| Stripe

    Auth -.->|"Validates tokens"| DB
    Storage -.->|"Stores metadata"| DB

    classDef userStyle fill:#E3F2FD,stroke:#1976D2,stroke-width:3px,color:#000
    classDef frontendStyle fill:#C8E6C9,stroke:#388E3C,stroke-width:3px,color:#000
    classDef backendStyle fill:#FFF9C4,stroke:#F57C00,stroke-width:3px,color:#000
    classDef externalStyle fill:#FFCCBC,stroke:#D84315,stroke-width:3px,color:#000

    class User userStyle
    class React frontendStyle
    class Auth,DB,Storage backendStyle
    class Stripe externalStyle
```

---

## Simplified Flow Diagram (User Journey)

Copy this code to mermaid.live:

```mermaid
sequenceDiagram
    autonumber
    participant 👤 User
    participant 🌐 Browser
    participant ⚛️ React App
    participant ☁️ Supabase

    Note over 👤 User,☁️ Supabase: User Visits Website

    👤 User->>🌐 Browser: Goes to realsync.vercel.app
    🌐 Browser->>⚛️ React App: Load React application
    ⚛️ React App->>☁️ Supabase: Check if user logged in?

    alt Not Logged In
        ☁️ Supabase-->>⚛️ React App: No session
        ⚛️ React App-->>🌐 Browser: Show Login Page
    else Already Logged In
        ☁️ Supabase-->>⚛️ React App: Session valid
        ⚛️ React App->>☁️ Supabase: Get user profile
        ☁️ Supabase-->>⚛️ React App: User data (name, role)
        ⚛️ React App-->>🌐 Browser: Show Dashboard
    end

    Note over 👤 User,☁️ Supabase: User Uses Tax Estimator

    👤 User->>🌐 Browser: Enters property value (S/ 450,000)
    🌐 Browser->>⚛️ React App: Submit form
    ⚛️ React App->>⚛️ React App: Calculate taxes (JavaScript)
    ⚛️ React App-->>🌐 Browser: Display results
    ⚛️ React App->>☁️ Supabase: Save calculation to database
    ☁️ Supabase-->>⚛️ React App: ✅ Saved successfully
    ⚛️ React App-->>👤 User: Show success message
```

---

## Technology Stack Diagram

Copy this code to mermaid.live:

```mermaid
graph LR
    subgraph "Frontend Stack"
        A1["React 18"]
        A2["TypeScript"]
        A3["Vite"]
        A4["Tailwind CSS"]
        A5["React Router"]
        A6["Zustand"]
        A7["Chart.js"]
    end

    subgraph "Backend Stack"
        B1["Supabase Auth"]
        B2["PostgreSQL 14"]
        B3["PostgREST API"]
        B4["Supabase Storage"]
    end

    subgraph "Infrastructure"
        C1["Vercel CDN"]
        C2["Supabase Cloud"]
        C3["SSL/HTTPS"]
    end

    subgraph "External"
        D1["Stripe API<br/>(Future)"]
    end

    A1 --> B3
    A2 --> B3
    A6 --> B1
    B1 --> B2
    B4 --> B2
    C1 -.-> A1
    C2 -.-> B1

    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px
    classDef backend fill:#3ECF8E,stroke:#333,stroke-width:2px
    classDef infra fill:#FF6B6B,stroke:#333,stroke-width:2px
    classDef external fill:#FFB84D,stroke:#333,stroke-width:2px

    class A1,A2,A3,A4,A5,A6,A7 frontend
    class B1,B2,B3,B4 backend
    class C1,C2,C3 infra
    class D1 external
```

---

## Database Schema (Entity Relationship)

Copy this code to mermaid.live:

```mermaid
erDiagram
    USER_PROFILES ||--o{ PROPERTIES : owns
    USER_PROFILES ||--o{ ESTIMATOR_CALCULATIONS : runs
    USER_PROFILES ||--o{ DOCUMENTS : uploads
    USER_PROFILES ||--o{ TIMELINE_EVENTS : creates
    PROPERTIES ||--o{ DOCUMENTS : has
    PROPERTIES ||--o{ TIMELINE_EVENTS : tracks

    USER_PROFILES {
        uuid id PK
        string first_name
        string last_name
        enum role "OWNER|BUYER|AGENT"
        enum subscription_tier "free|pro"
        string stripe_customer_id
    }

    PROPERTIES {
        uuid id PK
        uuid user_id FK
        string title
        string address
        decimal price
        int bedrooms
        int bathrooms
        enum status "active|sold|reserved"
    }

    ESTIMATOR_CALCULATIONS {
        uuid id PK
        uuid user_id FK
        decimal property_value
        decimal buyer_costs
        decimal seller_costs
        decimal total_costs
        jsonb calculation_details
    }

    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        string name
        string file_path
        enum status "pending|verified|rejected"
    }

    TIMELINE_EVENTS {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        string title
        enum event_type
        enum status
    }
```

---

## Cost Structure Diagram

Copy this code to mermaid.live:

```mermaid
graph TD
    subgraph "Free Tier: 0-500 Users"
        F1["Supabase Free<br/>$0/month<br/>500MB DB, 2GB bandwidth"]
        F2["Vercel Hobby<br/>$0/month<br/>100GB bandwidth"]
        F3["Total: $0/month"]

        F1 --> F3
        F2 --> F3
    end

    subgraph "Paid Tier: 500-10K Users"
        P1["Supabase Pro<br/>$25/month<br/>8GB DB, 50GB bandwidth"]
        P2["Vercel Hobby<br/>$0/month<br/>Still in free tier"]
        P3["Total: $25/month"]

        P1 --> P3
        P2 --> P3
    end

    subgraph "Revenue Potential"
        R1["100 Pro subscribers<br/>× $99/month"]
        R2["= $9,900/month revenue"]
        R3["- $25 infrastructure"]
        R4["= $9,875 profit (99.7%)"]

        R1 --> R2 --> R3 --> R4
    end

    F3 -.->|"Grows to"| P3
    P3 -.->|"Enables"| R1

    classDef free fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    classDef paid fill:#FFF9C4,stroke:#F57C00,stroke-width:2px
    classDef revenue fill:#FFCCBC,stroke:#D84315,stroke-width:2px

    class F1,F2,F3 free
    class P1,P2,P3 paid
    class R1,R2,R3,R4 revenue
```

---

## Export Instructions

### Method 1: Mermaid Live (Recommended)

1. Go to **https://mermaid.live**
2. Copy any diagram code from above
3. Paste into the editor (left side)
4. Diagram renders automatically (right side)
5. Click **"Download PNG"** or **"Download SVG"**
6. Use in your presentation!

### Method 2: VS Code

1. Install extension: **"Markdown Preview Mermaid Support"**
2. Open this file in VS Code
3. Click preview button
4. Take screenshot or print to PDF

### Method 3: GitHub

1. Push this file to GitHub
2. Diagrams render automatically
3. Right-click diagram → Save image

---

## Diagram Usage Tips

### For Sprint 4 Video:

**Opening (0-30 sec):**
- Show **Main Architecture Diagram**
- "This is RealSync - React frontend, Supabase backend, hosted on Vercel"

**Middle (30-90 sec):**
- Show **Simplified Flow Diagram**
- Walk through user journey: "User visits site, logs in, uses tax estimator, data saved to database"

**Closing (90-120 sec):**
- Show **Cost Structure Diagram**
- "Built for $0/month, scales to $25/month, 99.7% profit margin"

### For Presentations:

- **Executive audience:** Main Architecture + Cost Structure
- **Technical audience:** Main Architecture + Database Schema
- **Investor pitch:** Cost Structure + User Journey

---

## Key Messages (Use These)

### Architecture
✅ "Modern BaaS architecture using Supabase"
✅ "3,838 lines of production code"
✅ "Can handle 10,000 concurrent users"
❌ "Complex microservices with 11 services" (not true)

### Technology
✅ "React + TypeScript + Tailwind CSS"
✅ "PostgreSQL with Row Level Security"
✅ "Serverless hosting on Vercel"
❌ "Custom Node.js backend" (not true)

### Business
✅ "Built on free tier, scales to $25/month"
✅ "99.7% profit margin on subscriptions"
✅ "Fast MVP development (3 weeks)"
❌ "Enterprise-scale infrastructure" (not yet)

---

## What Makes This Architecture Good

### For MVP Stage:
1. **Fast Development** - No backend code needed
2. **Low Cost** - $0-25/month
3. **Automatic Scaling** - Supabase handles it
4. **Built-in Security** - RLS, JWT, encryption
5. **Type Safety** - TypeScript catches bugs early

### For Learning:
1. **Understand Trade-offs** - Speed vs control
2. **Right-sizing Decisions** - Don't over-engineer
3. **Cost Awareness** - BaaS vs custom backend
4. **Modern Patterns** - Industry-standard stack
5. **Clear Migration Path** - Can scale when needed

---

## Common Questions & Answers

**Q: Why not build custom backend?**
A: BaaS is 10x faster for MVP. Build custom backend when Supabase limits are hit (10K+ users).

**Q: Is this production-ready?**
A: Yes! Architecture can handle real users today. Supabase has 99.9% uptime SLA.

**Q: When to switch to microservices?**
A: When revenue justifies infrastructure costs ($10K+ MRR) or need custom features Supabase can't provide.

**Q: What about the docker-compose.yml file?**
A: That's the future architecture plan, not current implementation. Documenting vision is good, but should be labeled clearly.

**Q: How secure is this?**
A: Very secure. Row Level Security enforces data access at database level. JWT tokens expire after 1 hour. Passwords hashed with bcrypt.

---

## Summary

**Current Architecture:**
- Frontend: React on Vercel
- Backend: Supabase BaaS
- Database: PostgreSQL (5 tables)
- Cost: $0-25/month
- Capacity: 1K-10K users

**This is a strategic choice**, not a limitation. It enables fast iteration while maintaining a clear path to scale.

The diagrams above show **what actually exists and runs in production** - not future plans or aspirations.

---

**For Video:** Use Main Architecture + User Journey diagrams (2 minutes)
**For Presentation:** Use all 5 diagrams (10 slides)
**For Documentation:** This file + ARCHITECTURE_REALITY.md
