import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'OWNER' | 'BUYER' | 'AGENT';
  phone?: string;
  subscription_tier: 'free' | 'pro';
  subscription_status: 'active' | 'cancelled' | 'past_due';
}

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setSession: (session) => {
    set({ session });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    set({ isLoading: true });

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        set({
          user: {
            id: profile.id,
            email: session.user.email!,
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            phone: profile.phone,
            subscription_tier: profile.subscription_tier,
            subscription_status: profile.subscription_status,
          },
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            user: {
              id: profile.id,
              email: session.user.email!,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: profile.role,
              phone: profile.phone,
              subscription_tier: profile.subscription_tier,
              subscription_status: profile.subscription_status,
            },
            session,
            isAuthenticated: true,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      }
    });
  },
}));
