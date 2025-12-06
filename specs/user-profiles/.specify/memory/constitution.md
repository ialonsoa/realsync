<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0
- Initial constitution created for User Profiles feature
- Principles established: Privacy & Data Protection, Role-Based Architecture, Security-First, Scalability & Performance, Test-Driven Development
- Templates requiring updates: ✅ All templates will align with new constitution
- Follow-up TODOs: None
-->

# User Profiles Feature Constitution

## Core Principles

### I. Privacy & Data Protection (NON-NEGOTIABLE)
User profile data MUST comply with GDPR and Peru's Personal Data Protection Law (Ley N° 29733). All implementations must:
- Apply data minimization: collect only necessary profile information
- Obtain explicit user consent for data collection and processing
- Implement encryption at rest for sensitive profile fields (PII, contact info, documents)
- Support user rights: data access, correction, deletion, and portability requests
- Log all profile data access for audit compliance

**Rationale**: RealSync handles sensitive personal and financial information for real estate transactions. Privacy violations could result in legal penalties and loss of user trust in the Peruvian and LATAM markets.

### II. Role-Based Architecture
User profiles MUST maintain clear separation between owner, buyer, and agent roles. Implementation requirements:
- Each role has distinct profile schema with role-specific fields (e.g., agent license number, buyer pre-approval status)
- Role transitions require explicit workflow and data migration
- Profile queries MUST filter by role to prevent unauthorized cross-role data access
- Shared fields (name, contact, preferences) live in base user profile; role-specific data in extensions

**Rationale**: RealSync serves three distinct user types with different needs, permissions, and workflows. Clean role separation enables independent evolution of role features without breaking changes.

### III. Security-First
All profile operations MUST enforce security at multiple layers:
- Authentication: Supabase JWT validation required for all profile endpoints
- Authorization: Row-Level Security (RLS) policies enforce user can only access own profile unless admin/agent with permission
- Input validation: Strict schema validation with Zod/Joi, sanitization against XSS/SQL injection
- Audit logging: All profile mutations logged with user ID, timestamp, IP, changed fields
- Rate limiting: Profile update endpoints limited to prevent abuse

**Rationale**: Profiles are the foundation of user identity in RealSync. Compromised profiles could lead to unauthorized property access, fraudulent transactions, and platform-wide security breaches.

### IV. Scalability & Performance
Profile system MUST support LATAM expansion (target: 100K+ users by 2026):
- Database indexes: Composite indexes on (user_id, role), (email), (agent_license_number)
- Caching: Redis cache for frequently accessed profiles (TTL: 5 min), cache invalidation on updates
- Query optimization: Use SELECT specific fields, avoid N+1 queries, paginate large result sets
- Connection pooling: PgBouncer for PostgreSQL connection management
- Profile avatars: Store in S3/CloudFlare R2, serve via CDN with aggressive caching

**Rationale**: As RealSync scales across Peru and LATAM, profile queries will increase exponentially. Poor performance degrades user experience and increases infrastructure costs.

### V. Test-Driven Development (NON-NEGOTIABLE)
TDD mandatory for all profile feature development:
1. **Write tests first**: Unit, integration, and E2E tests must be written and approved before implementation
2. **Red-Green-Refactor cycle**: Tests fail → Implement minimum code to pass → Refactor
3. **Test coverage targets**: Minimum 90% coverage for profile service, 100% for security-critical paths (auth, permissions)
4. **Test types required**:
   - Unit: Profile validation logic, role transition rules, field transformations
   - Integration: Profile API endpoints, database transactions, Supabase RLS policies
   - E2E: Complete user flows (signup → profile creation → role assignment → profile update)

**Rationale**: Profiles are foundational to RealSync. Breaking changes or security gaps would cascade across all services. TDD ensures correctness, prevents regressions, and serves as living documentation.

## Database & Integration Constraints

### Shared Database Architecture
User profiles use RealSync's shared PostgreSQL database:
- **Schema**: `public.user_profiles` (base), `public.owner_profiles`, `public.buyer_profiles`, `public.agent_profiles` (role extensions)
- **Migrations**: Prisma migrations versioned with semantic versioning
- **Foreign keys**: Profile tables reference `auth.users` (Supabase Auth)
- **Transactions**: Use database transactions for multi-table operations (e.g., role transition updates base + role table)
- **Read replicas**: Profile reads can use read replicas; writes must go to primary

### Service Integration
Profiles integrate with existing RealSync services:
- **Auth Service**: Supabase Auth owns user credentials; profiles extend with business data
- **Property Service**: Agent profiles linked to property listings via foreign keys
- **Transaction Service**: Buyer/owner profiles linked to deals
- **Document Service**: Profile documents (IDs, licenses) stored with profile_id metadata
- **Notification Service**: Profile contact preferences control notification routing

## Development Workflow

### Feature Development Process
1. **Spec-driven**: Use Specify workflow (`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`)
2. **Branch strategy**: Feature branches from `dev`, PRs require approval + passing CI
3. **Code review checklist**: Security review, test coverage check, database migration review, performance impact assessment
4. **Deployment**: Staging deployment → manual QA → production deploy with feature flags

### Quality Gates
All PRs must pass:
- ✅ All tests passing (unit, integration, E2E)
- ✅ Test coverage ≥ 90%
- ✅ Linting + type checking (ESLint, TypeScript strict mode)
- ✅ Database migrations reviewed by DBA or tech lead
- ✅ Security review for authentication/authorization changes
- ✅ Performance benchmarks for queries (max 100ms P95 latency)

## Governance

### Amendment Process
This constitution supersedes all other development practices for the User Profiles feature. Amendments require:
1. Proposal documented in GitHub Discussion with rationale
2. Approval from Product Owner (Alonso Inca Roca) + Tech Lead
3. Impact analysis: affected code, migration plan, rollback strategy
4. Version bump following semantic versioning (MAJOR/MINOR/PATCH)
5. Update to all dependent templates and documentation

### Compliance & Enforcement
- All PRs MUST verify compliance with constitution principles
- Complexity or deviations MUST be explicitly justified in PR description
- Regular constitution audits during sprint retrospectives
- Non-compliance blocks PR approval; repeated violations trigger architecture review

### Living Document
This constitution is versioned and maintained in `.specify/memory/constitution.md`. For runtime development guidance during implementation, refer to AI agent context files in `.claude/` directory.

**Version**: 1.0.0 | **Ratified**: 2025-01-11 | **Last Amended**: 2025-01-11
