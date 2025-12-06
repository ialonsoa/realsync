# Sprint 4: Next Steps - Quick Reference

## Current Status: 60% Complete ✅

**Completed**:
- ✅ Database schema designed
- ✅ TypeScript types created
- ✅ Profile API client built
- ✅ Profile creation wizard implemented
- ✅ App routing integrated

**Remaining**:
- ⏳ Apply database migration
- ⏳ Build profile view page
- ⏳ Build profile edit page
- ⏳ Create privacy settings page
- ⏳ Test complete user flows

---

## Step 1: Apply Database Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Open your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy entire contents of `SPRINT4_USER_PROFILES_SCHEMA.sql`
5. Paste into editor
6. Click **Run**
7. Verify success (should see "Success. No rows returned")

### Option B: Via Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push

# Or run the SQL file directly
psql $DATABASE_URL -f SPRINT4_USER_PROFILES_SCHEMA.sql
```

### Verify Migration Success
Check that these tables exist in Supabase:
- `role_profiles`
- `agent_profiles`
- `buyer_profiles`
- `owner_profiles`
- `profile_privacy_settings`
- `profile_access_logs`

Check storage bucket exists:
- `profile-photos`

---

## Step 2: Test Profile Creation

### Start Dev Server
```bash
cd frontend/web
npm run dev
```

### Test Flow
1. Navigate to `http://localhost:5173/login`
2. Log in with existing account (or create one)
3. Navigate to `http://localhost:5173/profile/create`
4. Complete the 3-step wizard:
   - Step 1: Select a role (Agent, Buyer, or Owner)
   - Step 2: Fill basic info + upload photo (optional)
   - Step 3: Complete role-specific form
5. Click "Completar Perfil"
6. Verify redirect to dashboard

### Verify in Supabase
1. Open Supabase dashboard
2. Go to **Table Editor**
3. Check `user_profiles` - should see updated profile
4. Check `role_profiles` - should see your role
5. Check role-specific table (`agent_profiles`, `buyer_profiles`, or `owner_profiles`)
6. If you uploaded photo, check **Storage** → `profile-photos`

---

## Step 3: Build Remaining Pages

### Priority 1: Profile View Page
Create `frontend/web/src/pages/profile/ViewProfile.tsx`

**Features needed**:
- Display user's complete profile
- Show profile photo
- Display all role-specific information
- Show verification badge for agents
- Show privacy settings status

**Estimated time**: 30-45 min

### Priority 2: Profile Edit Page
Create `frontend/web/src/pages/profile/EditProfile.tsx`

**Features needed**:
- Reuse form components from CreateProfile
- Pre-populate with existing data
- Update instead of create
- Photo change functionality
- Success/error feedback

**Estimated time**: 45-60 min

### Priority 3: Privacy Settings Page
Create `frontend/web/src/pages/profile/PrivacySettings.tsx`

**Features needed**:
- Phone visibility toggle
- Email visibility toggle
- Activity visibility toggle
- Show on search toggle
- Preview public profile button

**Estimated time**: 30-45 min

---

## Step 4: Add Missing Routes

Update `frontend/web/src/App.tsx`:

```tsx
import ViewProfile from './pages/profile/ViewProfile';
import EditProfile from './pages/profile/EditProfile';
import PrivacySettings from './pages/profile/PrivacySettings';

// Inside protected routes section:
<Route path="/profile" element={<ViewProfile />} />
<Route path="/profile/edit" element={<EditProfile />} />
<Route path="/profile/privacy" element={<PrivacySettings />} />
```

---

## Step 5: Integration Testing

### Test Scenarios

#### Scenario 1: New User Profile Creation
1. Create new account
2. Complete profile creation wizard
3. Verify data saved correctly
4. Check photo uploaded

#### Scenario 2: Profile Editing
1. Navigate to profile edit
2. Change some fields
3. Save changes
4. Verify updates in database

#### Scenario 3: Multi-Role Support
1. Create profile with one role (e.g., Buyer)
2. Add second role (e.g., Owner)
3. Verify both role profiles exist
4. Switch between roles

#### Scenario 4: Privacy Settings
1. Adjust privacy settings
2. Preview public profile
3. Verify settings respected

#### Scenario 5: Agent Verification
1. Create agent profile
2. Check verification status is "UNVERIFIED"
3. (Admin) Update to "VERIFIED" in database
4. Verify badge shows on profile

---

## Step 6: Optional Enhancements

### Public Agent Search
Create `frontend/web/src/pages/agents/AgentDirectory.tsx`
- Search verified agents
- Filter by region/expertise
- View agent profiles

### Role Switcher Component
Create `frontend/web/src/components/profile/RoleSwitcher.tsx`
- Show in header for multi-role users
- Switch active role context
- Update dashboard view

---

## Useful Commands

### Development
```bash
# Start frontend dev server
cd frontend/web && npm run dev

# Type check
npm run type-check

# Lint code
npm run lint
```

### Database
```bash
# View Supabase logs
# (in dashboard: Logs → API/Database)

# Reset a table (careful!)
# In SQL Editor:
TRUNCATE role_profiles CASCADE;
```

### Git
```bash
# Current branch
git branch

# Commit progress
git add .
git commit -m "feat: implement user profiles (Sprint 4 - 60% complete)"

# Push to remote
git push origin 001-user-profiles
```

---

## Key Files Reference

### Database
- `SPRINT4_USER_PROFILES_SCHEMA.sql` - Migration SQL

### Types
- `frontend/web/src/types/profile.ts` - All TypeScript types

### API
- `frontend/web/src/lib/profileApi.ts` - API client functions

### Pages
- `frontend/web/src/pages/profile/CreateProfile.tsx` - Creation wizard
- `frontend/web/src/pages/profile/ViewProfile.tsx` - ⏳ To create
- `frontend/web/src/pages/profile/EditProfile.tsx` - ⏳ To create
- `frontend/web/src/pages/profile/PrivacySettings.tsx` - ⏳ To create

### Components
- `frontend/web/src/components/profile/RoleSelector.tsx`
- `frontend/web/src/components/profile/BasicInfoForm.tsx`
- `frontend/web/src/components/profile/AgentProfileForm.tsx`
- `frontend/web/src/components/profile/BuyerProfileForm.tsx`
- `frontend/web/src/components/profile/OwnerProfileForm.tsx`

### Documentation
- `SPRINT4_PROGRESS.md` - Detailed progress tracker
- `SPRINT4_SESSION_SUMMARY.md` - Session summary
- `SPRINT4_NEXT_STEPS.md` - This file

---

## Estimated Time to Complete

| Task | Time |
|------|------|
| Apply migration | 15 min |
| Test profile creation | 15 min |
| Build ViewProfile | 45 min |
| Build EditProfile | 60 min |
| Build PrivacySettings | 45 min |
| Integration testing | 30 min |
| **Total** | **3.5 hours** |

---

## Success Criteria

Sprint 4 is complete when:
- ✅ Database migration applied to Supabase
- ✅ Users can create profiles for all 3 roles
- ✅ Users can view their complete profile
- ✅ Users can edit their profile
- ✅ Users can manage privacy settings
- ✅ Profile photos upload successfully
- ✅ Multi-role support works
- ✅ All data persists correctly
- ✅ RLS policies enforce security

---

## Questions or Issues?

### Common Issues

**Q: "Profile creation fails with database error"**
A: Make sure you applied the migration SQL first

**Q: "Photo upload not working"**
A: Check that `profile-photos` storage bucket exists in Supabase

**Q: "Can't see role-specific forms"**
A: Make sure you selected a role in Step 1 of wizard

**Q: "RLS policy errors"**
A: Verify you're logged in and `auth.uid()` returns your user ID

### Debug Tips
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify auth token is valid
4. Check table permissions (RLS policies)

---

**Good luck! You're 60% done with Sprint 4! 🚀**
