# Technical Research: User Profiles for RealSync

**Created**: 2025-01-11
**Phase**: 0 - Research & Technical Decisions
**Status**: Complete

## Overview

This document captures technical research and architectural decisions for the User Profiles feature. All decisions align with the constitution principles and support the functional requirements from spec.md.

---

## Decision 1: Prisma Schema Design for Role-Based Profiles

**Context**: Need to design database schema that supports base profiles with role-specific extensions (Owner, Buyer, Agent) while maintaining referential integrity and query performance.

**Decision**: Use **table-per-role pattern** with foreign keys

**Rationale**:
- Clear separation of concerns matches Role-Based Architecture principle
- Each role table contains only role-specific fields, avoiding nullable fields in a single table
- Supports independent evolution of role schemas without breaking changes
- Foreign key constraints ensure data integrity
- Enables efficient queries (SELECT from specific role table vs filtering large unified table)

**Schema Structure**:
```prisma
// Base profile (shared across all roles)
model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")  // FK to auth.users
  fullName          String   @map("full_name")
  phone             String
  phoneVerified     Boolean  @default(false) @map("phone_verified")
  profilePhotoUrl   String?  @map("profile_photo_url")
  preferredLanguage String   @default("es") @map("preferred_language")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  lastActiveAt      DateTime @default(now()) @map("last_active_at")

  roleProfiles      RoleProfile[]
  privacySettings   ProfilePrivacySettings?
  accessLogs        ProfileAccessLog[]

  @@map("user_profiles")
}

// Role linkage (supports multi-role)
model RoleProfile {
  id           String   @id @default(uuid())
  userProfileId String  @map("user_profile_id")
  roleType     RoleType @map("role_type")
  isPrimary    Boolean  @default(false) @map("is_primary")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  userProfile   UserProfile    @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  agentProfile  AgentProfile?
  buyerProfile  BuyerProfile?
  ownerProfile  OwnerProfile?

  @@unique([userProfileId, roleType])
  @@index([userProfileId])
  @@map("role_profiles")
}

enum RoleType {
  OWNER
  BUYER
  AGENT
}
```

**Alternatives Considered**:
1. **Single Table Inheritance (STI)**: All roles in one table with nullable fields
   - Rejected: Violates data minimization (many null fields), harder to evolve role-specific features
2. **JSON Column for role data**: Store role-specific data in JSONB column
   - Rejected: Loses type safety, harder to query/index, poor performance at scale

**Implementation Notes**:
- Use Prisma migrations for schema changes
- Add composite indexes on (userProfileId, roleType) for multi-role queries
- Enable cascading deletes (when user_profile deleted, all role_profiles cascade)

---

## Decision 2: Supabase Row-Level Security (RLS) Policies

**Context**: Must enforce security at database level to prevent unauthorized profile access, as required by Security-First principle.

**Decision**: Implement **role-specific RLS policies** with JWT claims

**Rationale**:
- RLS provides defense-in-depth (security at DB layer, not just application layer)
- Supabase JWT contains user_id claim for identity verification
- Policies automatically apply to all queries (SELECT, INSERT, UPDATE, DELETE)
- Supports fine-grained access control (users can only access own profiles)
- Admin/agent access can be granted via JWT role claims

**Policy Patterns**:
```sql
-- User Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Role Profiles: Users can manage their own roles
CREATE POLICY "Users can view own roles"
ON public.role_profiles
FOR SELECT
USING (
  user_profile_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

-- Agent Profiles: Public read for verified agents, write for owner
CREATE POLICY "Anyone can view verified agent profiles"
ON public.agent_profiles
FOR SELECT
USING (verification_status = 'VERIFIED');

CREATE POLICY "Agents can update own profile"
ON public.agent_profiles
FOR UPDATE
USING (
  role_profile_id IN (
    SELECT rp.id FROM role_profiles rp
    JOIN user_profiles up ON rp.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
  )
);

-- Admin Override: Allow admin users to access all profiles
CREATE POLICY "Admins can access all profiles"
ON public.user_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
```

**Alternatives Considered**:
1. **Application-layer only security**: Check permissions in API code
   - Rejected: Vulnerable to bugs, doesn't protect against direct DB access
2. **View-based security**: Create views for different access levels
   - Rejected: Less flexible than RLS policies, harder to maintain

**Implementation Notes**:
- Define policies in Prisma migrations as raw SQL
- Test policies thoroughly in integration tests
- Use Supabase client library (respects RLS automatically)
- Admin role assigned via Supabase Auth metadata

---

## Decision 3: Redis Caching Strategy

**Context**: Need to cache frequently accessed profiles to meet <1 second P95 load time goal for 100K+ users.

**Decision**: **Cache-aside pattern** with TTL-based invalidation

**Rationale**:
- Cache-aside (lazy loading) is simple and widely proven
- 5-minute TTL balances freshness vs performance
- Redis provides fast in-memory lookups (sub-millisecond)
- Explicit invalidation on profile updates ensures consistency
- Supports horizontal scaling (Redis Cluster for LATAM expansion)

**Caching Strategy**:
```typescript
// Cache key pattern
const PROFILE_CACHE_KEY = (userId: string) => `profile:${userId}`;
const PROFILE_TTL = 300; // 5 minutes

// Read pattern (cache-aside)
async function getProfile(userId: string) {
  // 1. Check cache
  const cached = await redis.get(PROFILE_CACHE_KEY(userId));
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Query database
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { roleProfiles: true, privacySettings: true }
  });

  // 3. Write to cache
  if (profile) {
    await redis.setex(
      PROFILE_CACHE_KEY(userId),
      PROFILE_TTL,
      JSON.stringify(profile)
    );
  }

  return profile;
}

// Write pattern (cache invalidation)
async function updateProfile(userId: string, data: any) {
  // 1. Update database
  const updated = await prisma.userProfile.update({
    where: { userId },
    data
  });

  // 2. Invalidate cache
  await redis.del(PROFILE_CACHE_KEY(userId));

  return updated;
}
```

**Cache Invalidation Triggers**:
- Profile update (name, phone, photo, preferences)
- Role addition/removal
- Privacy settings change
- Profile deletion (soft delete)

**Alternatives Considered**:
1. **Write-through caching**: Update cache and DB simultaneously
   - Rejected: Adds complexity, not needed for profile data access patterns
2. **No caching**: Query DB every time
   - Rejected: Cannot meet <1 second P95 performance target at scale

**Implementation Notes**:
- Use ioredis client (supports clustering, pipelining)
- Set Redis max memory policy to `allkeys-lru` (evict least recently used)
- Monitor cache hit rate (target >80%), adjust TTL if needed
- Use Redis Sentinel for high availability in production

---

## Decision 4: Photo Upload & Resize Workflow

**Context**: Users upload profile photos up to 5MB. Need to resize, optimize, and serve via CDN while meeting <5 second upload goal.

**Decision**: **Client-side resize + Supabase Storage** with lazy thumbnails

**Rationale**:
- Client-side resize (using browser Canvas API) reduces upload size/time
- Supabase Storage provides S3-compatible storage with automatic CDN
- Lazy thumbnail generation (on first access) avoids blocking upload
- Sharp library (Node.js) for server-side optimization maintains quality
- CDN caching reduces load on backend for repeated profile views

**Upload Workflow**:
```
1. User selects photo in browser
2. Client-side JavaScript:
   - Validate format (JPEG/PNG/WebP) and size (<5MB)
   - Resize to 800x800px using Canvas API
   - Convert to WebP format (smaller size, modern browser support)
   - Compress to target ~300KB
3. Upload to Supabase Storage bucket via presigned URL
   - Bucket: `profile-photos/{userId}/original.webp`
   - Public read access (respects privacy settings via middleware)
4. Backend receives upload success webhook
   - Generate 400x400px thumbnail using Sharp
   - Store thumbnail at `profile-photos/{userId}/thumb.webp`
   - Update user_profiles.profile_photo_url
5. CDN serves photos with aggressive caching (1 year)
   - Cache invalidation via versioned URLs (append ?v={timestamp})
```

**Storage Structure**:
```
profile-photos/
├── {userId}/
│   ├── original.webp    # 800x800, ~300KB
│   └── thumb.webp       # 400x400, ~50KB
```

**Alternatives Considered**:
1. **Server-side resize only**: Upload full image, resize on server
   - Rejected: Slow upload times for 5MB images on mobile networks
2. **Supabase Edge Functions**: Use Deno functions for image processing
   - Rejected: Adds cold start latency, Sharp in Node.js is faster
3. **Third-party service (Cloudinary)**: Managed image processing/CDN
   - Rejected: Additional cost, vendor lock-in, Supabase Storage sufficient

**Implementation Notes**:
- Use `browser-image-compression` library for client-side resizing
- Supabase Storage buckets configured with CORS for direct uploads
- Sharp configured with `{ quality: 80, effort: 3 }` for balanced speed/quality
- Content moderation (AWS Rekognition) runs async after upload

---

## Decision 5: Rate Limiting Implementation

**Context**: Must limit profile updates to 10 per hour per user to prevent abuse (FR-025).

**Decision**: **Redis-based sliding window** rate limiter

**Rationale**:
- Sliding window provides accurate rate limiting (vs fixed window)
- Redis sorted sets enable efficient implementation
- Supports distributed rate limiting (multiple backend instances)
- Can extend to other rate limits (photo uploads, search queries)
- Minimal performance overhead (<5ms per request)

**Implementation**:
```typescript
import Redis from 'ioredis';

async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${action}:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();

  // Remove old entries outside window
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count requests in current window
  pipeline.zcard(key);

  // Add current request
  pipeline.zadd(key, now, `${now}:${Math.random()}`);

  // Set expiration
  pipeline.expire(key, Math.ceil(windowMs / 1000));

  const results = await pipeline.exec();
  const count = results[1][1] as number;

  if (count >= limit) {
    // Remove the request we just added (over limit)
    await redis.zpopmax(key);
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - count - 1 };
}

// Usage in Express middleware
app.put('/api/profiles/:id', async (req, res, next) => {
  const { allowed, remaining } = await checkRateLimit(
    req.user.id,
    'profile:update',
    10,
    60 * 60 * 1000 // 1 hour
  );

  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Maximum 10 profile updates per hour.'
    });
  }

  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  next();
});
```

**Rate Limits Defined**:
- Profile updates: 10/hour per user
- Photo uploads: 5/hour per user
- Profile searches: 100/hour per user
- Data export requests: 1/day per user

**Alternatives Considered**:
1. **In-memory rate limiting**: Store counters in Node.js memory
   - Rejected: Doesn't work with multiple backend instances (load balancing)
2. **Database-based rate limiting**: Store requests in PostgreSQL
   - Rejected: Adds DB load, slower than Redis, harder to implement sliding window
3. **express-rate-limit package**: Existing Node.js library
   - Rejected: Uses in-memory store by default, less flexible for custom logic

**Implementation Notes**:
- Use Redis sorted sets (ZSET) for efficient time-based queries
- Return rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Consider IP-based rate limiting for unauthenticated endpoints (profile search)
- Monitor rate limit violations (potential abuse indicators)

---

## Decision 6: Multi-Role Context Switching Architecture

**Context**: Users with multiple roles (e.g., Owner + Buyer) need to switch contexts without logging out. UI must reflect current role, and backend must associate actions with correct role profile.

**Decision**: **JWT-based active role** with frontend state management

**Rationale**:
- Store active role in JWT claims (refreshed on role switch)
- Frontend React Context provides global role state
- Backend middleware extracts active role from JWT
- No need for session storage (stateless architecture)
- Supports real-time role switching without page reload

**Architecture**:
```typescript
// Frontend: Role Context Provider
interface RoleContextValue {
  activeRole: RoleType | null;
  availableRoles: RoleProfile[];
  switchRole: (roleId: string) => Promise<void>;
}

const RoleContext = createContext<RoleContextValue>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<RoleType | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleProfile[]>([]);

  // Load user's roles on mount
  useEffect(() => {
    async function loadRoles() {
      const response = await fetch('/api/profiles/me/roles');
      const roles = await response.json();
      setAvailableRoles(roles);

      // Set primary role as default
      const primary = roles.find(r => r.isPrimary);
      if (primary) setActiveRole(primary.roleType);
    }
    loadRoles();
  }, []);

  // Switch active role
  const switchRole = async (roleId: string) => {
    // Call backend to update JWT with new active role
    const response = await fetch('/api/profiles/me/switch-role', {
      method: 'POST',
      body: JSON.stringify({ roleId }),
      headers: { 'Content-Type': 'application/json' }
    });

    const { token, roleType } = await response.json();

    // Update auth token (causes JWT refresh)
    await supabase.auth.setSession({ access_token: token, refresh_token: ... });

    // Update local state
    setActiveRole(roleType);

    // Redirect to role-specific dashboard
    if (roleType === 'BUYER') router.push('/dashboard/buyer');
    else if (roleType === 'AGENT') router.push('/dashboard/agent');
    else router.push('/dashboard/owner');
  };

  return (
    <RoleContext.Provider value={{ activeRole, availableRoles, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}

// Backend: JWT Claims Structure
interface JWTClaims {
  sub: string;              // user_id
  email: string;
  role: 'user' | 'admin';   // Auth role
  activeRoleId?: string;    // Current role profile ID
  activeRoleType?: RoleType; // Current role type (OWNER/BUYER/AGENT)
}

// Backend: Middleware to extract active role
function extractActiveRole(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET) as JWTClaims;

  req.user = {
    id: decoded.sub,
    activeRoleId: decoded.activeRoleId,
    activeRoleType: decoded.activeRoleType
  };

  next();
}
```

**Database Association**:
```typescript
// When creating a property listing (agent context)
async function createPropertyListing(userId: string, data: PropertyData) {
  // Ensure user is acting as agent
  const activeRole = req.user.activeRoleType;
  if (activeRole !== 'AGENT') {
    throw new Error('Must be in agent role to create listings');
  }

  // Associate listing with agent role profile
  const agentProfile = await prisma.agentProfile.findFirst({
    where: {
      roleProfile: {
        userProfile: { userId },
        roleType: 'AGENT'
      }
    }
  });

  const listing = await prisma.propertyListing.create({
    data: {
      ...data,
      agentProfileId: agentProfile.id
    }
  });

  return listing;
}
```

**Alternatives Considered**:
1. **Session-based role storage**: Store active role in server session
   - Rejected: Requires stateful backend, doesn't scale horizontally
2. **Query parameter**: Pass role in URL (`?role=buyer`)
   - Rejected: Poor UX, easy to manipulate, not secure
3. **Separate accounts per role**: Force users to create multiple accounts
   - Rejected: Terrible UX, violates spec requirement for multi-role support

**Implementation Notes**:
- JWT refresh needed on role switch (generate new token with updated claims)
- Frontend RoleSwitcher component in navigation bar for quick access
- Backend validates activeRoleId matches user's role_profiles
- Audit log records which role was active for each action
- Consider caching user's roles in Redis to avoid DB query on every request

---

## Summary of Decisions

| Decision | Choice | Key Benefit |
|----------|--------|-------------|
| Database Schema | Table-per-role with FKs | Clear separation, type safety, performance |
| Security | Supabase RLS policies | Defense-in-depth, automatic enforcement |
| Caching | Redis cache-aside + TTL | Meets <1s P95 target, simple invalidation |
| Photo Processing | Client resize + Supabase Storage | Fast uploads, CDN distribution |
| Rate Limiting | Redis sliding window | Accurate, distributed, low overhead |
| Multi-Role | JWT claims + React Context | Stateless, real-time switching |

**Research Status**: ✅ Complete - All technical unknowns resolved

**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
