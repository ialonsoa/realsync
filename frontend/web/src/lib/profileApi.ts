import { supabase } from './supabase';
import type {
  UserProfile,
  RoleProfile,
  AgentProfile,
  BuyerProfile,
  OwnerProfile,
  ProfilePrivacySettings,
  CompleteProfile,
  CreateUserProfileData,
  CreateAgentProfileData,
  CreateBuyerProfileData,
  CreateOwnerProfileData,
  UpdatePrivacySettingsData,
  RoleType,
} from '../types/profile';

/**
 * Profile API Client - handles all profile-related operations with Supabase
 */

// ============================================================================
// User Profile Operations
// ============================================================================

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get complete profile with all role-specific data
 */
export async function getCompleteProfile(
  userId: string
): Promise<CompleteProfile | null> {
  try {
    // Get base profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get role profiles
    const { data: roleProfiles, error: roleError } = await supabase
      .from('role_profiles')
      .select('*')
      .eq('user_profile_id', userId);

    if (roleError) throw roleError;

    // Get role-specific profiles
    const enrichedRoles = await Promise.all(
      (roleProfiles || []).map(async (roleProfile) => {
        const enriched: any = { ...roleProfile };

        // Fetch agent profile if applicable
        if (roleProfile.role_type === 'AGENT') {
          const { data } = await supabase
            .from('agent_profiles')
            .select('*')
            .eq('role_profile_id', roleProfile.id)
            .single();
          if (data) enriched.agentProfile = data;
        }

        // Fetch buyer profile if applicable
        if (roleProfile.role_type === 'BUYER') {
          const { data } = await supabase
            .from('buyer_profiles')
            .select('*')
            .eq('role_profile_id', roleProfile.id)
            .single();
          if (data) enriched.buyerProfile = data;
        }

        // Fetch owner profile if applicable
        if (roleProfile.role_type === 'OWNER') {
          const { data } = await supabase
            .from('owner_profiles')
            .select('*')
            .eq('role_profile_id', roleProfile.id)
            .single();
          if (data) enriched.ownerProfile = data;
        }

        return enriched;
      })
    );

    // Get privacy settings
    const { data: privacySettings } = await supabase
      .from('profile_privacy_settings')
      .select('*')
      .eq('user_profile_id', userId)
      .single();

    return {
      ...profile,
      roleProfiles: enrichedRoles,
      privacySettings: privacySettings || undefined,
    };
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<CreateUserProfileData>
): Promise<UserProfile | null> {
  try {
    const updateData: any = {};

    if (updates.full_name) updateData.full_name = updates.full_name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.preferred_language)
      updateData.preferred_language = updates.preferred_language;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// ============================================================================
// Role Profile Operations
// ============================================================================

/**
 * Create a new role profile for a user
 */
export async function createRoleProfile(
  userId: string,
  roleType: RoleType,
  isPrimary: boolean = false
): Promise<RoleProfile | null> {
  try {
    const { data, error } = await supabase
      .from('role_profiles')
      .insert({
        user_profile_id: userId,
        role_type: roleType,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating role profile:', error);
    throw error;
  }
}

/**
 * Get user's role profiles
 */
export async function getUserRoleProfiles(
  userId: string
): Promise<RoleProfile[]> {
  try {
    const { data, error } = await supabase
      .from('role_profiles')
      .select('*')
      .eq('user_profile_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching role profiles:', error);
    return [];
  }
}

/**
 * Set primary role for user
 */
export async function setPrimaryRole(
  userId: string,
  roleProfileId: string
): Promise<boolean> {
  try {
    // First, set all roles to non-primary
    await supabase
      .from('role_profiles')
      .update({ is_primary: false })
      .eq('user_profile_id', userId);

    // Then set the selected role as primary
    const { error } = await supabase
      .from('role_profiles')
      .update({ is_primary: true })
      .eq('id', roleProfileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting primary role:', error);
    return false;
  }
}

// ============================================================================
// Agent Profile Operations
// ============================================================================

/**
 * Create agent profile
 */
export async function createAgentProfile(
  roleProfileId: string,
  data: CreateAgentProfileData
): Promise<AgentProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('agent_profiles')
      .insert({
        role_profile_id: roleProfileId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error creating agent profile:', error);
    throw error;
  }
}

/**
 * Update agent profile
 */
export async function updateAgentProfile(
  agentProfileId: string,
  updates: Partial<CreateAgentProfileData>
): Promise<AgentProfile | null> {
  try {
    const { data, error } = await supabase
      .from('agent_profiles')
      .update(updates)
      .eq('id', agentProfileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating agent profile:', error);
    throw error;
  }
}

/**
 * Get verified agents (public search)
 */
export async function getVerifiedAgents(filters?: {
  service_regions?: string[];
  expertise_areas?: string[];
}): Promise<AgentProfile[]> {
  try {
    let query = supabase
      .from('agent_profiles')
      .select('*')
      .eq('verification_status', 'VERIFIED');

    if (filters?.service_regions && filters.service_regions.length > 0) {
      query = query.overlaps('service_regions', filters.service_regions);
    }

    if (filters?.expertise_areas && filters.expertise_areas.length > 0) {
      query = query.overlaps('expertise_areas', filters.expertise_areas);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching verified agents:', error);
    return [];
  }
}

// ============================================================================
// Buyer Profile Operations
// ============================================================================

/**
 * Create buyer profile
 */
export async function createBuyerProfile(
  roleProfileId: string,
  data: CreateBuyerProfileData
): Promise<BuyerProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('buyer_profiles')
      .insert({
        role_profile_id: roleProfileId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error creating buyer profile:', error);
    throw error;
  }
}

/**
 * Update buyer profile
 */
export async function updateBuyerProfile(
  buyerProfileId: string,
  updates: Partial<CreateBuyerProfileData>
): Promise<BuyerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('buyer_profiles')
      .update(updates)
      .eq('id', buyerProfileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating buyer profile:', error);
    throw error;
  }
}

// ============================================================================
// Owner Profile Operations
// ============================================================================

/**
 * Create owner profile
 */
export async function createOwnerProfile(
  roleProfileId: string,
  data: CreateOwnerProfileData
): Promise<OwnerProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('owner_profiles')
      .insert({
        role_profile_id: roleProfileId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error creating owner profile:', error);
    throw error;
  }
}

/**
 * Update owner profile
 */
export async function updateOwnerProfile(
  ownerProfileId: string,
  updates: Partial<CreateOwnerProfileData>
): Promise<OwnerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('owner_profiles')
      .update(updates)
      .eq('id', ownerProfileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating owner profile:', error);
    throw error;
  }
}

// ============================================================================
// Privacy Settings Operations
// ============================================================================

/**
 * Get privacy settings
 */
export async function getPrivacySettings(
  userId: string
): Promise<ProfilePrivacySettings | null> {
  try {
    const { data, error } = await supabase
      .from('profile_privacy_settings')
      .select('*')
      .eq('user_profile_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return null;
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  userId: string,
  updates: UpdatePrivacySettingsData
): Promise<ProfilePrivacySettings | null> {
  try {
    const { data, error } = await supabase
      .from('profile_privacy_settings')
      .update(updates)
      .eq('user_profile_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
}

// ============================================================================
// Profile Photo Operations
// ============================================================================

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

    // Update user profile with photo URL
    await supabase
      .from('user_profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('id', userId);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Delete profile photo
 */
export async function deleteProfilePhoto(userId: string): Promise<boolean> {
  try {
    // Get current photo URL to extract file path
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_photo_url')
      .eq('id', userId)
      .single();

    if (!profile?.profile_photo_url) return true;

    // Delete from storage
    const fileName = `${userId}/profile.jpg`; // Assuming jpg, adjust as needed

    await supabase.storage.from('profile-photos').remove([fileName]);

    // Update profile to remove photo URL
    await supabase
      .from('user_profiles')
      .update({ profile_photo_url: null })
      .eq('id', userId);

    return true;
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return false;
  }
}

// ============================================================================
// Access Logging
// ============================================================================

/**
 * Log profile access for audit compliance
 */
export async function logProfileAccess(
  profileUserId: string,
  accessedFields: string[]
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('profile_access_logs').insert({
      profile_user_id: profileUserId,
      accessor_user_id: user?.id || null,
      accessed_fields: accessedFields,
      ip_address: null, // Would need to get from request headers
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging profile access:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}
