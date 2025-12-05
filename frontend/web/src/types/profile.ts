// Profile Types for Sprint 4: User Profiles

export type RoleType = 'OWNER' | 'BUYER' | 'AGENT';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export type VisibilityLevel =
  | 'PUBLIC'
  | 'CONTACTS_ONLY'
  | 'AGENTS_ONLY'
  | 'HIDDEN';

export type FinancingStatus =
  | 'PRE_APPROVED'
  | 'CASH'
  | 'SEEKING_FINANCING'
  | 'NOT_SPECIFIED';

export type UrgencyLevel =
  | 'ACTIVELY_LOOKING'
  | 'RESEARCHING'
  | 'FUTURE_PLANNING';

export type SellingTimeline =
  | 'IMMEDIATE'
  | 'WITHIN_3_MONTHS'
  | 'WITHIN_6_MONTHS'
  | 'WITHIN_YEAR'
  | 'EXPLORING';

export type PreferredContactMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'SMS';

// Base User Profile
export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  profile_photo_url: string | null;
  preferred_language: 'es' | 'en';
  role: string; // Legacy field, kept for backward compatibility
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

// Role Profile (junction table)
export interface RoleProfile {
  id: string;
  user_profile_id: string;
  role_type: RoleType;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Agent Profile
export interface AgentProfile {
  id: string;
  role_profile_id: string;
  license_number: string | null;
  brokerage_name: string | null;
  service_regions: string[];
  expertise_areas: string[];
  years_experience: number | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by_admin_id: string | null;
  bio: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

// Buyer Profile
export interface BuyerProfile {
  id: string;
  role_profile_id: string;
  property_types_interested: string[];
  preferred_locations: string[];
  budget_min: number | null;
  budget_max: number | null;
  financing_status: FinancingStatus;
  urgency_level: UrgencyLevel;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Owner Profile
export interface OwnerProfile {
  id: string;
  role_profile_id: string;
  properties_count: number;
  property_types_owned: string[];
  selling_timeline: SellingTimeline;
  preferred_contact_method: PreferredContactMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Privacy Settings
export interface ProfilePrivacySettings {
  id: string;
  user_profile_id: string;
  phone_visibility: VisibilityLevel;
  email_visibility: VisibilityLevel;
  activity_visibility: boolean;
  show_on_search: boolean;
  created_at: string;
  updated_at: string;
}

// Access Log
export interface ProfileAccessLog {
  id: string;
  profile_user_id: string;
  accessor_user_id: string | null;
  accessed_fields: string[];
  access_timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

// Complete Profile with all role-specific data
export interface CompleteProfile extends UserProfile {
  roleProfiles: (RoleProfile & {
    agentProfile?: AgentProfile;
    buyerProfile?: BuyerProfile;
    ownerProfile?: OwnerProfile;
  })[];
  privacySettings?: ProfilePrivacySettings;
}

// Form data types for creating/updating profiles

export interface CreateUserProfileData {
  full_name: string;
  phone?: string;
  preferred_language?: 'es' | 'en';
  profile_photo?: File;
}

export interface CreateAgentProfileData {
  license_number?: string;
  brokerage_name?: string;
  service_regions?: string[];
  expertise_areas?: string[];
  years_experience?: number;
  bio?: string;
  website_url?: string;
}

export interface CreateBuyerProfileData {
  property_types_interested?: string[];
  preferred_locations?: string[];
  budget_min?: number;
  budget_max?: number;
  financing_status?: FinancingStatus;
  urgency_level?: UrgencyLevel;
  notes?: string;
}

export interface CreateOwnerProfileData {
  properties_count?: number;
  property_types_owned?: string[];
  selling_timeline?: SellingTimeline;
  preferred_contact_method?: PreferredContactMethod;
  notes?: string;
}

export interface UpdatePrivacySettingsData {
  phone_visibility?: VisibilityLevel;
  email_visibility?: VisibilityLevel;
  activity_visibility?: boolean;
  show_on_search?: boolean;
}

// Property type options for forms
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'office', label: 'Oficina' },
  { value: 'warehouse', label: 'Almacén' },
];

// Peru provinces/regions for agent service areas
export const PERU_REGIONS = [
  'Lima',
  'Arequipa',
  'Cusco',
  'La Libertad',
  'Piura',
  'Lambayeque',
  'Junín',
  'Ica',
  'Puno',
  'Ancash',
  'Cajamarca',
  'Loreto',
  'San Martín',
  'Ucayali',
  'Huánuco',
  'Ayacucho',
  'Tacna',
  'Moquegua',
  'Pasco',
  'Tumbes',
  'Amazonas',
  'Apurímac',
  'Huancavelica',
  'Madre de Dios',
  'Callao',
];

// Expertise areas for agents
export const EXPERTISE_AREAS = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'luxury', label: 'Lujo' },
  { value: 'land', label: 'Terrenos' },
  { value: 'investment', label: 'Inversión' },
  { value: 'rural', label: 'Rural' },
];
