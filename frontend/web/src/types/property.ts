export type PropertyStatus = 'ACTIVE' | 'UNDER_OFFER' | 'SOLD' | 'WITHDRAWN';

export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';

export interface Property {
  id: string;
  agent_id: string;
  owner_id?: string;

  // Property details
  address: string;
  district?: string;
  city: string;
  region?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // Property characteristics
  property_type?: PropertyType;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;

  // Financial
  asking_price: number;
  currency: string;

  // Status
  status: PropertyStatus;

  description?: string;
  features?: string[];
  images?: string[];
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreatePropertyInput {
  address: string;
  district?: string;
  city: string;
  region?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  property_type?: PropertyType;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  asking_price: number;
  currency?: string;
  status?: PropertyStatus;
  description?: string;
  features?: string[];
  images?: string[];
  owner_id?: string;
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  id: string;
}
