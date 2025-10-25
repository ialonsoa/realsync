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
          user_id: string;
          title: string;
          address: string;
          district: string;
          city: string;
          price: number;
          bedrooms: number;
          bathrooms: number;
          area_m2: number;
          property_type: string;
          status: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
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
