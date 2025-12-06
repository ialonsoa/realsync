# Feature Specification: User Profiles for RealSync

**Feature Branch**: `001-user-profiles`
**Created**: 2025-01-11
**Status**: Draft
**Input**: User description: "User profiles for RealSync with role-based architecture supporting owners, buyers, and agents"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Profile Creation After Signup (Priority: P1)

A new user completes the signup process and is prompted to create their basic profile by selecting their role (owner, buyer, or agent) and providing essential information like name, phone number, and location preferences.

**Why this priority**: This is the foundation for all user interactions in RealSync. Without a profile, users cannot access role-specific features, participate in transactions, or receive personalized notifications. This is the minimum viable functionality.

**Independent Test**: Can be fully tested by creating a new account, selecting a role, filling in required profile fields, and verifying the profile is saved and displayed correctly. Delivers immediate value by allowing users to identify themselves and access basic platform features.

**Acceptance Scenarios**:

1. **Given** a new user has just completed email verification, **When** they are redirected to the profile creation page, **Then** they see options to select their role (Owner, Buyer, or Agent) with brief descriptions of each
2. **Given** a user selects "Buyer" as their role, **When** they fill in required fields (full name, phone number, preferred location), **Then** their profile is created and they are redirected to the buyer dashboard
3. **Given** a user attempts to create a profile without filling required fields, **When** they click "Continue", **Then** they see validation errors highlighting missing fields
4. **Given** a user's profile is successfully created, **When** they navigate to their profile page, **Then** they see all their entered information displayed correctly

---

### User Story 2 - Agent Profile with Credentials (Priority: P1)

An agent creates a profile by providing professional credentials including real estate license number, brokerage affiliation, areas of expertise, and service regions in Peru. Their profile serves as their professional identity visible to owners and buyers.

**Why this priority**: Agent credibility is critical for marketplace trust. Verified agent profiles enable property owners and buyers to confidently engage with real estate professionals. This is essential for the platform's core transaction flow.

**Independent Test**: Can be fully tested by signing up as an agent, entering license credentials, uploading verification documents, and confirming the profile displays professional information. Delivers value by establishing agent credibility and enabling client discovery.

**Acceptance Scenarios**:

1. **Given** a user selects "Agent" as their role, **When** they reach the profile form, **Then** they see additional required fields: license number, brokerage name, service regions (dropdown of Peru provinces), and areas of expertise (property types)
2. **Given** an agent enters their license number, **When** the system validates it, **Then** the license status is checked against Peru's Registro Nacional de Proveedores (if available) or marked as "pending verification"
3. **Given** an agent completes their profile, **When** they submit it, **Then** their profile is created with "Unverified" status and they receive notification about verification process timeline
4. **Given** an agent's profile is approved by admin, **When** they log in, **Then** their profile shows "Verified Agent" badge and they can access agent-specific features (property listings, client management)

---

### User Story 3 - Profile Viewing and Privacy Controls (Priority: P2)

Users can view their own profile, see how their profile appears to others based on their role, and control visibility settings for contact information and activity history.

**Why this priority**: Privacy controls build user trust and comply with data protection regulations (GDPR, Peru Ley N° 29733). Users need transparency about what information is shared with other platform participants.

**Independent Test**: Can be fully tested by creating a profile, adjusting privacy settings, and viewing the profile in "public preview" mode. Delivers value by giving users control over their personal information exposure.

**Acceptance Scenarios**:

1. **Given** a user is on their profile page, **When** they click "Preview Public Profile", **Then** they see their profile as it appears to other users based on their privacy settings
2. **Given** a buyer wants to hide their phone number, **When** they toggle "Show phone to agents only" setting, **Then** their phone number is hidden from property owners but visible to agents they interact with
3. **Given** an owner views an agent's public profile, **When** they see the agent's information, **Then** they see the agent's name, photo, license number, service regions, recent listings, and reviews (if enabled)
4. **Given** a user has privacy setting "Show activity history", **When** another user views their profile, **Then** they see recent activity like property views, saved searches, and transaction milestones (non-sensitive data only)

---

### User Story 4 - Profile Editing and Updates (Priority: P2)

Users can edit their profile information at any time, update their photo, modify role-specific details, and receive confirmation that changes are saved. Certain sensitive changes (like role transition or license number) require re-verification.

**Why this priority**: Profiles need to stay current as users' circumstances change (new phone number, address, agent moves to new brokerage). This maintains data accuracy and platform reliability.

**Independent Test**: Can be fully tested by editing various profile fields, uploading a new photo, saving changes, and verifying updates persist across sessions. Delivers value by keeping user information accurate and up-to-date.

**Acceptance Scenarios**:

1. **Given** a user is on their profile page, **When** they click "Edit Profile", **Then** all editable fields become active and they see "Save Changes" and "Cancel" buttons
2. **Given** a user updates their phone number and clicks "Save Changes", **When** the update is successful, **Then** they receive a verification SMS to confirm the new number
3. **Given** an agent changes their brokerage affiliation, **When** they save this change, **Then** their verification status resets to "Pending" and admin is notified for re-verification
4. **Given** a user uploads a new profile photo, **When** the upload completes, **Then** the new photo is displayed immediately and appears across all platform interactions (chat, property listings, transaction timelines)

---

### User Story 5 - Multi-Role Profile Support (Priority: P3)

A user who owns property and also acts as a buyer for investment properties can manage both roles under a single account, switching between "Owner" and "Buyer" views with distinct profiles for each role.

**Why this priority**: Real estate professionals and investors often play multiple roles. Supporting multi-role profiles improves user experience and reduces account management friction.

**Independent Test**: Can be fully tested by creating an account with one role, then requesting to add a second role, filling in role-specific information, and switching between role contexts. Delivers value by eliminating the need for multiple accounts.

**Acceptance Scenarios**:

1. **Given** a user with an existing "Owner" profile, **When** they navigate to account settings and click "Add Another Role", **Then** they see available roles (Buyer, Agent) with explanations
2. **Given** a user adds "Buyer" role to their account, **When** they complete the buyer profile form, **Then** a new buyer profile is created linked to their account
3. **Given** a user has both Owner and Buyer roles, **When** they access the platform, **Then** they see a role switcher in the navigation bar showing "Currently viewing as: Owner" with dropdown to switch to "Buyer"
4. **Given** a user switches from Owner to Buyer role, **When** the role change completes, **Then** they are redirected to the buyer dashboard and all interactions (property searches, saved favorites) are associated with their buyer profile

---

### User Story 6 - Profile Data Export and Deletion (Priority: P3)

Users can request a complete export of their profile data in machine-readable format (JSON) and can initiate account deletion which removes all personal information after a confirmation period.

**Why this priority**: GDPR and Peru's data protection law require data portability and right to deletion. This ensures compliance and builds user trust in data handling practices.

**Independent Test**: Can be fully tested by requesting data export, downloading the file, verifying its contents, then initiating deletion and confirming the account is inaccessible after the grace period. Delivers value by ensuring legal compliance and user rights.

**Acceptance Scenarios**:

1. **Given** a user navigates to Privacy Settings, **When** they click "Export My Data", **Then** they receive an email within 24 hours with a secure download link to a JSON file containing all their profile data
2. **Given** a user downloads their data export, **When** they open the file, **Then** they see structured data including profile fields, activity logs, transaction history, and document metadata (no actual documents for security)
3. **Given** a user clicks "Delete My Account", **When** they confirm deletion, **Then** they see a warning about 30-day grace period and must enter their password to proceed
4. **Given** a user confirmed account deletion 30 days ago, **When** the grace period expires, **Then** all personal data is permanently deleted, profile is anonymized, and transaction records retain only non-identifying audit trails

---

### Edge Cases

- What happens when an agent's license expires? System should flag the profile as "License Expired" and restrict access to client-facing features until renewed
- How does the system handle duplicate license numbers? Reject registration and prompt user to contact support if license is already registered to another account
- What if a user tries to switch to "Agent" role without providing credentials? System should block the role addition and require license verification first
- How are profile photos moderated? New uploads are scanned for inappropriate content; flagged images are reviewed by moderation team within 24 hours
- What happens when a user in an active transaction attempts account deletion? System should prevent deletion and display message about completing or transferring active transactions first
- How does the system handle inactive profiles? Profiles with no login activity for 18 months receive reactivation email; if no response after 90 days, marked as "Inactive" and hidden from search results
- What if a user's personal information conflicts with verification documents? Flag for manual review by support team with notification to user
- How are profile updates during property negotiations handled? Critical fields (name, contact) are locked during active offers; user sees message to contact their agent or transaction coordinator

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select one primary role (Owner, Buyer, or Agent) during initial profile creation
- **FR-002**: System MUST collect base profile information for all users: full name, email (from auth), phone number, profile photo (optional), preferred language (Spanish/English), location preferences
- **FR-003**: System MUST collect role-specific information:
  - **Agents**: License number, brokerage name, service regions (Peru provinces), areas of expertise (residential, commercial, land, luxury), years of experience
  - **Buyers**: Property preferences (types, locations, budget range), financing status (pre-approved, cash, seeking financing), urgency (actively looking, researching, future planning)
  - **Owners**: Property ownership details (number of properties, property types), selling timeline, preferred communication method
- **FR-004**: System MUST validate required fields before allowing profile completion: name, phone, role, and role-specific mandatory fields
- **FR-005**: System MUST validate agent license numbers against Peru's professional registry format (alphanumeric, 8-12 characters)
- **FR-006**: System MUST support profile photo uploads with constraints: formats (JPEG, PNG, WebP), maximum size (5MB), minimum resolution (400x400px)
- **FR-007**: System MUST automatically resize and optimize uploaded photos to standard dimensions (400x400px thumbnail, 800x800px full size)
- **FR-008**: System MUST enforce unique constraint on phone numbers within the same role to prevent duplicate profiles
- **FR-009**: System MUST allow users to edit all profile fields except email (controlled by auth service) and role (requires verification workflow)
- **FR-010**: System MUST send verification SMS when phone number is added or changed, requiring confirmation before updating
- **FR-011**: System MUST support adding additional roles to existing profiles with separate verification for each role
- **FR-012**: System MUST provide role-switching interface when user has multiple roles, maintaining separate context for each
- **FR-013**: System MUST implement privacy controls: phone visibility (public, contacts only, agents only, hidden), email visibility (public, hidden), activity visibility (show, hide)
- **FR-014**: System MUST log all profile data access with user ID, accessor ID, timestamp, and accessed fields for audit compliance
- **FR-015**: System MUST support profile data export in JSON format containing all user data within 24 hours of request
- **FR-016**: System MUST implement account deletion with 30-day grace period, during which user can reactivate by logging in
- **FR-017**: System MUST prevent profile deletion if user has active transactions (status: "Pending", "In Progress", "Under Contract")
- **FR-018**: System MUST mark agent profiles as "Verified" or "Unverified" based on admin review of credentials
- **FR-019**: System MUST display verification badge on agent profiles visible to all users when viewing agent listings or transaction details
- **FR-020**: System MUST support profile search by role, location, and keywords (agent name, brokerage, service regions)
- **FR-021**: System MUST redact sensitive profile information (full phone, email) in search results unless viewer has permission
- **FR-022**: System MUST provide public profile view showing role-appropriate information based on privacy settings
- **FR-023**: System MUST enforce Row-Level Security (RLS) policies ensuring users can only modify their own profiles
- **FR-024**: System MUST cache frequently accessed profiles in Redis with 5-minute TTL and invalidate on updates
- **FR-025**: System MUST rate-limit profile update operations to maximum 10 updates per hour per user to prevent abuse

### Key Entities *(include if feature involves data)*

- **User Profile (Base)**: Core user identity shared across all roles
  - Attributes: user_id (FK to auth.users), full_name, phone, phone_verified, profile_photo_url, preferred_language, created_at, updated_at, last_active_at
  - Relationships: One-to-many with RoleProfiles, one-to-many with ProfileAccessLogs

- **Role Profile**: Role-specific extension of base profile
  - Attributes: role_profile_id, user_id (FK), role_type (Owner/Buyer/Agent), is_primary, created_at, updated_at
  - Relationships: Many-to-one with User Profile, one-to-one with role-specific tables (OwnerProfile, BuyerProfile, AgentProfile)

- **Agent Profile**: Professional credentials for real estate agents
  - Attributes: agent_profile_id, role_profile_id (FK), license_number, brokerage_name, service_regions (array), expertise_areas (array), years_experience, verification_status, verified_at, verified_by_admin_id
  - Relationships: One-to-one with RoleProfile, one-to-many with PropertyListings

- **Buyer Profile**: Preferences and status for property buyers
  - Attributes: buyer_profile_id, role_profile_id (FK), property_types_interested (array), preferred_locations (array), budget_min, budget_max, financing_status, urgency_level
  - Relationships: One-to-one with RoleProfile, one-to-many with SavedProperties, one-to-many with Transactions

- **Owner Profile**: Property ownership information
  - Attributes: owner_profile_id, role_profile_id (FK), properties_count, property_types_owned (array), selling_timeline, preferred_contact_method
  - Relationships: One-to-one with RoleProfile, one-to-many with Properties, one-to-many with Transactions

- **Profile Privacy Settings**: User-controlled visibility preferences
  - Attributes: settings_id, user_id (FK), phone_visibility, email_visibility, activity_visibility, show_on_search, updated_at
  - Relationships: One-to-one with User Profile

- **Profile Access Log**: Audit trail for compliance
  - Attributes: log_id, profile_user_id, accessor_user_id, accessed_fields (array), access_timestamp, ip_address, user_agent
  - Relationships: Many-to-one with User Profile

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete basic profile creation (role selection + required fields) in under 3 minutes from signup completion
- **SC-002**: Agent profile verification process (submission to admin review to approval) completes within 48 hours for 90% of submissions
- **SC-003**: Profile update operations (edit name, phone, photo, preferences) complete with visible confirmation to user within 2 seconds
- **SC-004**: System supports 100,000 user profiles with profile page load times under 1 second at 95th percentile
- **SC-005**: Profile search returns relevant results (matching role, location, keywords) within 1 second for 95% of queries
- **SC-006**: Zero unauthorized profile access incidents detected in security audits (verified via access logs)
- **SC-007**: Profile data export requests are fulfilled (email with download link sent) within 24 hours for 99% of requests
- **SC-008**: Account deletion requests complete successfully (all PII removed) within 30-day grace period for 100% of confirmed deletions
- **SC-009**: Profile photo uploads succeed on first attempt for 95% of valid images (correct format and size)
- **SC-010**: Multi-role profile creation (adding second role) can be completed in under 5 minutes by users
- **SC-011**: Profile validation errors (missing required fields, invalid format) are displayed to users with clear, actionable messages immediately upon submission
- **SC-012**: Users can successfully adjust privacy settings and see changes reflected in public profile view within 5 seconds
- **SC-013**: Mobile users can complete profile creation and editing tasks with same success rate as desktop users (>95% task completion)
- **SC-014**: Profile-related support tickets decrease by 40% after feature launch due to clear UX and self-service capabilities
- **SC-015**: Agent profile verification pass rate (approved without requiring additional information) exceeds 70% on initial submission

## Assumptions

1. **Authentication Foundation**: Users have already completed signup and email verification through Supabase Auth before reaching profile creation
2. **Peru Market Focus**: Initial release focuses on Peru-specific requirements (provinces, license formats); LATAM expansion requirements are deferred to future iterations
3. **License Verification**: Manual admin review is acceptable for agent verification MVP; automated registry API integration is a future enhancement
4. **Photo Moderation**: Automated content scanning (nudity, violence detection) via third-party API (e.g., AWS Rekognition) is sufficient for initial release
5. **Language Support**: Spanish and English are the only supported languages in MVP; additional languages added based on expansion markets
6. **Mobile Experience**: Profile features must be fully functional on mobile web; native app-specific optimizations are handled separately
7. **Single Primary Role**: Users must designate one role as "primary" which determines their default dashboard view; multi-role users can switch contexts
8. **Data Retention**: Deleted user profiles retain anonymized transaction audit trails for legal/financial compliance (7 years per Peru regulations)
9. **Performance Targets**: Success criteria latency targets (1-2 seconds) assume standard broadband/4G connections; degraded network performance is acceptable on slower connections
10. **Admin Tools**: Basic admin panel for agent verification is built as part of this feature; comprehensive admin analytics are a separate future feature

## Dependencies

- **Supabase Auth**: Existing authentication service must provide user_id and email for profile creation
- **S3/CloudFlare R2**: Object storage for profile photos must be provisioned and configured
- **Redis Cache**: Caching layer must be deployed for profile data caching
- **SMS Service**: Twilio integration for phone verification must be active
- **Database Migrations**: Prisma migrations must be run in sequence before feature deployment
- **Email Service**: SendGrid integration for data export and deletion confirmation emails
- **Content Moderation API**: AWS Rekognition or similar service for photo content scanning

## Open Questions

None at this time. All critical design decisions have been documented in the constitution and specification.
