import { supabase } from '../lib/supabase';
import { Property, CreatePropertyInput, UpdatePropertyInput } from '../types/property';

export const propertiesService = {
  /**
   * Get all properties for the current agent
   */
  async getProperties(): Promise<Property[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    return data as Property[];
  },

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Property not found
        return null;
      }
      console.error('Error fetching property:', error);
      throw error;
    }

    return data as Property;
  },

  /**
   * Create a new property
   */
  async createProperty(input: CreatePropertyInput): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const propertyData = {
      agent_id: user.id,
      address: input.address,
      district: input.district || null,
      city: input.city,
      region: input.region || null,
      postal_code: input.postal_code || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      property_type: input.property_type || null,
      area_sqm: input.area_sqm || null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      parking_spaces: input.parking_spaces || null,
      asking_price: input.asking_price,
      currency: input.currency || 'PEN',
      status: input.status || 'ACTIVE',
      description: input.description || null,
      features: input.features || null,
      images: input.images || null,
      owner_id: input.owner_id || null,
      metadata: {},
      deleted_at: null,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }

    return data as Property;
  },

  /**
   * Update an existing property
   */
  async updateProperty(input: UpdatePropertyInput): Promise<Property> {
    const { id, ...updates } = input;

    const updateData: any = {};

    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.district !== undefined) updateData.district = updates.district || null;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.region !== undefined) updateData.region = updates.region || null;
    if (updates.postal_code !== undefined) updateData.postal_code = updates.postal_code || null;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude || null;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude || null;
    if (updates.property_type !== undefined) updateData.property_type = updates.property_type || null;
    if (updates.area_sqm !== undefined) updateData.area_sqm = updates.area_sqm || null;
    if (updates.bedrooms !== undefined) updateData.bedrooms = updates.bedrooms || null;
    if (updates.bathrooms !== undefined) updateData.bathrooms = updates.bathrooms || null;
    if (updates.parking_spaces !== undefined) updateData.parking_spaces = updates.parking_spaces || null;
    if (updates.asking_price !== undefined) updateData.asking_price = updates.asking_price;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.features !== undefined) updateData.features = updates.features || null;
    if (updates.images !== undefined) updateData.images = updates.images || null;
    if (updates.owner_id !== undefined) updateData.owner_id = updates.owner_id || null;

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    return data as Property;
  },

  /**
   * Soft delete a property
   */
  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  /**
   * Search properties
   */
  async searchProperties(query: string): Promise<Property[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', user.id)
      .is('deleted_at', null)
      .or(`address.ilike.%${query}%,city.ilike.%${query}%,district.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching properties:', error);
      throw error;
    }

    return data as Property[];
  },
};
