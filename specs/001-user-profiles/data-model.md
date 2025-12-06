# Data Model: User Profiles for RealSync

**Created**: 2025-01-11
**Phase**: 1 - Design & Contracts
**Status**: Complete

## Overview

This document defines the complete database schema for the User Profiles feature using Prisma ORM with PostgreSQL. The design follows the table-per-role pattern established in research.md and aligns with the Role-Based Architecture principle from the constitution.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │ (Supabase Auth)
│   - id (UUID)       │
│   - email           │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────────────┐
│   user_profiles             │
│   - id (UUID) PK            │
│   - user_id (UUID) FK       │◄─────┐
│   - full_name               │      │
│   - phone                   │      │ 1:1
│   - phone_verified          │      │
│   - profile_photo_url       │      │
│   - preferred_language      │      │
│   - created_at              │      │
│   - updated_at              │      │
│   - last_active_at          │      │
└──────────┬──────────────────┘      │
           │                         │
           │ 1:N                     │
           ▼                         │
┌─────────────────────────────┐     │
│   role_profiles             │     │
│   - id (UUID) PK            │     │
│   - user_profile_id (UUID) FK     │
│   - role_type (ENUM)        │     │
│   - is_primary (BOOL)       │     │
│   - created_at              │     │
│   - updated_at              │     │
└──────┬────┬────┬─────────────┘     │
       │    │    │                   │
  1:1  │    │    │ 1:1               │
       ▼    │    ▼                   │
    ┌──────┴────────┐                │
    │               │                │
    ▼               ▼                ▼
┌─────────┐  ┌─────────┐  ┌─────────────┐
│ agent_  │  │ buyer_  │  │ owner_      │
│ profiles│  │ profiles│  │ profiles    │
└─────────┘  └─────────┘  └─────────────┘

         1:1
         ▼
┌──────────────────────────────┐
│ profile_privacy_settings     │
│ - id (UUID) PK               │
│ - user_profile_id (UUID) FK  │
│ - phone_visibility           │
│ - email_visibility           │
│ - activity_visibility        │
│ - show_on_search             │
│ - updated_at                 │
└──────────────────────────────┘

         1:N
         ▼
┌──────────────────────────────┐
│ profile_access_logs          │
│ - id (UUID) PK               │
│ - profile_user_id (UUID) FK  │
│ - accessor_user_id (UUID)    │
│ - accessed_fields (ARRAY)    │
│ - access_timestamp           │
│ - ip_address                 │
│ - user_agent                 │
└──────────────────────────────┘
```

---

## Complete Prisma Schema

```prisma
// =============================================================================
// ENUMS
// =============================================================================

enum RoleType {
  OWNER
  BUYER
  AGENT
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
  EXPIRED
}

enum VisibilityLevel {
  PUBLIC
  CONTACTS_ONLY
  AGENTS_ONLY
  HIDDEN
}

enum FinancingStatus {
  PRE_APPROVED
  CASH
  SEEKING_FINANCING
  NOT_SPECIFIED
}

enum UrgencyLevel {
  ACTIVELY_LOOKING
  RESEARCHING
  FUTURE_PLANNING
}

enum SellingTimeline {
  IMMEDIATE
  WITHIN_3_MONTHS
  WITHIN_6_MONTHS
  WITHIN_YEAR
  EXPLORING
}

enum PreferredContactMethod {
  PHONE
  EMAIL
  WHATSAPP
  SMS
}

// =============================================================================
// BASE PROFILE
// =============================================================================

model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")  // FK to auth.users
  fullName          String   @map("full_name")
  phone             String
  phoneVerified     Boolean  @default(false) @map("phone_verified")
  profilePhotoUrl   String?  @map("profile_photo_url")
  preferredLanguage String   @default("es") @map("preferred_language") // "es" or "en"
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  lastActiveAt      DateTime @default(now()) @map("last_active_at")
  deletedAt         DateTime? @map("deleted_at")  // Soft delete for 30-day grace period

  roleProfiles      RoleProfile[]
  privacySettings   ProfilePrivacySettings?
  accessLogs        ProfileAccessLog[]

  @@index([userId])
  @@index([phone])
  @@map("user_profiles")
}

// =============================================================================
// ROLE PROFILES (Multi-role support)
// =============================================================================

model RoleProfile {
  id            String   @id @default(uuid())
  userProfileId String   @map("user_profile_id")
  roleType      RoleType @map("role_type")
  isPrimary     Boolean  @default(false) @map("is_primary")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  userProfile   UserProfile    @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  agentProfile  AgentProfile?
  buyerProfile  BuyerProfile?
  ownerProfile  OwnerProfile?

  @@unique([userProfileId, roleType])  // One role of each type per user
  @@index([userProfileId])
  @@index([roleType])
  @@map("role_profiles")
}

// =============================================================================
// AGENT PROFILE
// =============================================================================

model AgentProfile {
  id                 String             @id @default(uuid())
  roleProfileId      String             @unique @map("role_profile_id")
  licenseNumber      String             @unique @map("license_number")
  brokerageName      String             @map("brokerage_name")
  serviceRegions     String[]           @map("service_regions")  // Peru provinces
  expertiseAreas     String[]           @map("expertise_areas")  // Property types
  yearsExperience    Int?               @map("years_experience")
  verificationStatus VerificationStatus @default(UNVERIFIED) @map("verification_status")
  verifiedAt         DateTime?          @map("verified_at")
  verifiedByAdminId  String?            @map("verified_by_admin_id")
  bio                String?            // Short professional bio
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  roleProfile RoleProfile @relation(fields: [roleProfileId], references: [id], onDelete: Cascade)

  @@index([licenseNumber])
  @@index([verificationStatus])
  @@index([serviceRegions])
  @@map("agent_profiles")
}

// =============================================================================
// BUYER PROFILE
// =============================================================================

model BuyerProfile {
  id                    String           @id @default(uuid())
  roleProfileId         String           @unique @map("role_profile_id")
  propertyTypesInterested String[]       @map("property_types_interested")  // e.g., ["apartment", "house"]
  preferredLocations    String[]         @map("preferred_locations")        // Peru provinces/districts
  budgetMin             Decimal?         @map("budget_min") @db.Decimal(12, 2)
  budgetMax             Decimal?         @map("budget_max") @db.Decimal(12, 2)
  financingStatus       FinancingStatus  @default(NOT_SPECIFIED) @map("financing_status")
  urgencyLevel          UrgencyLevel     @default(RESEARCHING) @map("urgency_level")
  createdAt             DateTime         @default(now()) @map("created_at")
  updatedAt             DateTime         @updatedAt @map("updated_at")

  roleProfile RoleProfile @relation(fields: [roleProfileId], references: [id], onDelete: Cascade)

  @@index([preferredLocations])
  @@index([urgencyLevel])
  @@map("buyer_profiles")
}

// =============================================================================
// OWNER PROFILE
// =============================================================================

model OwnerProfile {
  id                    String                 @id @default(uuid())
  roleProfileId         String                 @unique @map("role_profile_id")
  propertiesCount       Int                    @default(0) @map("properties_count")
  propertyTypesOwned    String[]               @map("property_types_owned")
  sellingTimeline       SellingTimeline?       @map("selling_timeline")
  preferredContactMethod PreferredContactMethod @default(EMAIL) @map("preferred_contact_method")
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")

  roleProfile RoleProfile @relation(fields: [roleProfileId], references: [id], onDelete: Cascade)

  @@map("owner_profiles")
}

// =============================================================================
// PRIVACY SETTINGS
// =============================================================================

model ProfilePrivacySettings {
  id                String          @id @default(uuid())
  userProfileId     String          @unique @map("user_profile_id")
  phoneVisibility   VisibilityLevel @default(AGENTS_ONLY) @map("phone_visibility")
  emailVisibility   VisibilityLevel @default(HIDDEN) @map("email_visibility")
  activityVisibility Boolean        @default(false) @map("activity_visibility")
  showOnSearch      Boolean         @default(true) @map("show_on_search")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  userProfile UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)

  @@map("profile_privacy_settings")
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

model ProfileAccessLog {
  id               String   @id @default(uuid())
  profileUserId    String   @map("profile_user_id")  // Profile being accessed
  accessorUserId   String   @map("accessor_user_id")  // User accessing profile
  accessedFields   String[] @map("accessed_fields")   // Which fields were accessed
  accessTimestamp  DateTime @default(now()) @map("access_timestamp")
  ipAddress        String   @map("ip_address")
  userAgent        String   @map("user_agent")

  userProfile UserProfile @relation(fields: [profileUserId], references: [id], onDelete: Cascade)

  @@index([profileUserId, accessTimestamp])
  @@index([accessorUserId])
  @@map("profile_access_logs")
}
```

---

## Database Indexes

### Performance-Critical Indexes

```sql
-- User lookups (most common query)
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);

-- Role filtering
CREATE INDEX idx_role_profiles_user_profile_id ON role_profiles(user_profile_id);
CREATE INDEX idx_role_profiles_role_type ON role_profiles(role_type);
CREATE INDEX idx_role_profiles_composite ON role_profiles(user_profile_id, role_type);

-- Agent search
CREATE INDEX idx_agent_profiles_license ON agent_profiles(license_number);
CREATE INDEX idx_agent_profiles_verification ON agent_profiles(verification_status);
CREATE INDEX idx_agent_profiles_regions ON agent_profiles USING GIN(service_regions);

-- Buyer search
CREATE INDEX idx_buyer_profiles_locations ON buyer_profiles USING GIN(preferred_locations);
CREATE INDEX idx_buyer_profiles_urgency ON buyer_profiles(urgency_level);

-- Audit compliance
CREATE INDEX idx_access_logs_profile_time ON profile_access_logs(profile_user_id, access_timestamp DESC);
CREATE INDEX idx_access_logs_accessor ON profile_access_logs(accessor_user_id);
```

---

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all profile tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_privacy_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Role Profiles: Users can manage their own roles
CREATE POLICY "Users can view own roles"
  ON role_profiles FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Agent Profiles: Public read for verified agents
CREATE POLICY "Anyone can view verified agent profiles"
  ON agent_profiles FOR SELECT
  USING (verification_status = 'VERIFIED');

CREATE POLICY "Agents can update own profile"
  ON agent_profiles FOR UPDATE
  USING (
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
    )
  );

-- Admin Override: Allow admin users full access
CREATE POLICY "Admins can access all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role')::text = 'admin'
    )
  );
```

---

## Data Validation Rules

### Field Constraints

```typescript
// Validation schemas using Zod (backend + frontend)

const phoneRegex = /^\+?[1-9]\d{1,14}$/;  // E.164 format
const licenseRegex = /^[A-Z0-9]{8,12}$/;   // Peru license format

const UserProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(phoneRegex, "Invalid phone format"),
  preferredLanguage: z.enum(["es", "en"]),
  profilePhotoUrl: z.string().url().optional(),
});

const AgentProfileSchema = z.object({
  licenseNumber: z.string().regex(licenseRegex, "Invalid license format"),
  brokerageName: z.string().min(2).max(200),
  serviceRegions: z.array(z.string()).min(1).max(26),  // Peru has 26 regions
  expertiseAreas: z.array(z.string()).min(1),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  bio: z.string().max(500).optional(),
});

const BuyerProfileSchema = z.object({
  propertyTypesInterested: z.array(z.string()).min(1),
  preferredLocations: z.array(z.string()).min(1),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  financingStatus: z.nativeEnum(FinancingStatus),
  urgencyLevel: z.nativeEnum(UrgencyLevel),
}).refine(data => {
  // Ensure budgetMax > budgetMin if both specified
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax > data.budgetMin;
  }
  return true;
}, "Budget max must be greater than budget min");

const OwnerProfileSchema = z.object({
  propertiesCount: z.number().int().min(0),
  propertyTypesOwned: z.array(z.string()),
  sellingTimeline: z.nativeEnum(SellingTimeline).optional(),
  preferredContactMethod: z.nativeEnum(PreferredContactMethod),
});
```

---

## State Transitions

### Agent Verification Status Flow

```
UNVERIFIED (initial state)
    │
    │ User submits profile
    ▼
PENDING
    │
    ├──► VERIFIED (admin approves)
    │
    ├──► REJECTED (admin rejects)
    │
    └──► EXPIRED (license expires, cron job)
         │
         │ User uploads new license
         ▼
       PENDING
```

### Account Deletion Flow

```
ACTIVE (deletedAt = null)
    │
    │ User requests deletion
    ▼
PENDING_DELETION (deletedAt = now + 30 days)
    │
    ├──► ACTIVE (user reactivates by logging in)
    │
    └──► DELETED (cron job after 30 days)
         - PII data purged
         - Profile anonymized
         - Transactions retain non-identifying audit trail
```

---

## Data Migration Strategy

### Initial Migration

```sql
-- Migration: 001_create_user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_photo_url TEXT,
  preferred_language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Similar migrations for all other tables...
```

### Seeding Test Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users with profiles
  const testAgent = await prisma.userProfile.create({
    data: {
      userId: 'test-agent-uuid',
      fullName: 'María González',
      phone: '+51987654321',
      phoneVerified: true,
      preferredLanguage: 'es',
      roleProfiles: {
        create: {
          roleType: 'AGENT',
          isPrimary: true,
          agentProfile: {
            create: {
              licenseNumber: 'AG12345678',
              brokerageName: 'Lima Propiedades',
              serviceRegions: ['Lima', 'Callao'],
              expertiseAreas: ['residential', 'luxury'],
              yearsExperience: 8,
              verificationStatus: 'VERIFIED',
              bio: 'Agente especializada en propiedades de alto valor en Lima.'
            }
          }
        }
      },
      privacySettings: {
        create: {
          phoneVisibility: 'PUBLIC',
          emailVisibility: 'AGENTS_ONLY'
        }
      }
    }
  });

  console.log('Seed data created:', testAgent);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

## Summary

**Total Entities**: 7
- UserProfile (base)
- RoleProfile (multi-role support)
- AgentProfile, BuyerProfile, OwnerProfile (role-specific)
- ProfilePrivacySettings
- ProfileAccessLog (audit compliance)

**Key Design Decisions**:
- ✅ Table-per-role pattern for clean separation
- ✅ Composite indexes for performance at scale
- ✅ RLS policies for defense-in-depth security
- ✅ Soft deletes with 30-day grace period
- ✅ Audit logging for GDPR compliance
- ✅ Multi-role support via role_profiles linkage table

**Data Model Status**: ✅ Complete and ready for implementation

**Next Artifact**: contracts/openapi.yaml (API specifications)
