import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will expand as we add more tables)
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          agent_id: string;
          owner_id: string | null;
          address: string;
          district: string | null;
          city: string;
          region: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          property_type: string | null;
          area_sqm: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          parking_spaces: number | null;
          asking_price: number;
          currency: string;
          status: string;
          description: string | null;
          features: string[] | null;
          images: string[] | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      estimator_calculations: {
        Row: {
          id: string;
          user_id: string;
          property_value: number;
          buyer_costs: number;
          seller_costs: number;
          total_costs: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['estimator_calculations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['estimator_calculations']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          status: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      timeline_events: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          title: string;
          description: string;
          event_type: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timeline_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>;
      };
    };
  };
};
