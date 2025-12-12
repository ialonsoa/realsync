import { supabase } from '../lib/supabase';
import type { AnalyticsGoals, UpdateGoalsInput } from '../types/analytics';

/**
 * Goals Service - manages user business goals/targets
 */

/**
 * Get or create default goals for the current user
 */
export async function getUserGoals(): Promise<AnalyticsGoals> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Try to get existing goals
    const { data: existingGoals, error: fetchError } = await supabase
      .from('analytics_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingGoals && !fetchError) {
      return existingGoals;
    }

    // Create default goals if they don't exist
    const { data: newGoals, error: createError } = await supabase
      .from('analytics_goals')
      .insert({
        user_id: user.id,
        monthly_sales_target: 5,
        monthly_revenue_target: 1000000,
        conversion_rate_target: 65,
        verification_rate_target: 80,
        timeline_activity_target: 5.0,
        active_properties_target: 10,
        average_days_to_sell_target: 45,
      })
      .select()
      .single();

    if (createError) throw createError;

    return newGoals!;
  } catch (error) {
    console.error('Error getting user goals:', error);
    // Return default goals if all else fails
    return {
      id: '',
      user_id: '',
      monthly_sales_target: 5,
      monthly_revenue_target: 1000000,
      conversion_rate_target: 65,
      verification_rate_target: 80,
      timeline_activity_target: 5.0,
      active_properties_target: 10,
      average_days_to_sell_target: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Update user goals
 */
export async function updateUserGoals(updates: UpdateGoalsInput): Promise<AnalyticsGoals | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get current goals (will create if not exists)
    const currentGoals = await getUserGoals();

    // Update goals
    const { data, error } = await supabase
      .from('analytics_goals')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating goals:', error);
    throw error;
  }
}
