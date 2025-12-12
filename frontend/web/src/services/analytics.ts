import { supabase } from '../lib/supabase';
import type {
  AnalyticsStats,
  MonthlySalesData,
  PropertyPerformance,
  PerformanceMetric,
  DistrictInsight,
  TimelineAnalytics,
  DocumentAnalytics,
  CompleteAnalytics,
} from '../types/analytics';
import { getTimelineStats } from './timeline';
import { getDocumentStats } from './documents';

/**
 * Analytics Service - calculates real-time analytics from properties, timeline, and documents
 */

// ============================================================================
// Main Analytics
// ============================================================================

/**
 * Get complete analytics dashboard data
 */
export async function getCompleteAnalytics(): Promise<CompleteAnalytics> {
  try {
    const [
      stats,
      monthlySales,
      topProperties,
      performanceMetrics,
      districtInsights,
      timelineAnalytics,
      documentAnalytics,
    ] = await Promise.all([
      getAnalyticsStats(),
      getMonthlySalesData(),
      getTopProperties(),
      getPerformanceMetrics(),
      getDistrictInsights(),
      getTimelineAnalytics(),
      getDocumentAnalytics(),
    ]);

    return {
      stats,
      monthly_sales: monthlySales,
      top_properties: topProperties,
      performance_metrics: performanceMetrics,
      district_insights: districtInsights,
      timeline_analytics: timelineAnalytics,
      document_analytics: documentAnalytics,
    };
  } catch (error) {
    console.error('Error getting complete analytics:', error);
    throw error;
  }
}

// ============================================================================
// Property Analytics
// ============================================================================

/**
 * Get high-level property statistics
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get all properties for the user
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null);

    if (error) throw error;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: AnalyticsStats = {
      total_properties: properties?.length || 0,
      active_properties: properties?.filter((p) => p.status === 'ACTIVE').length || 0,
      sold_properties: properties?.filter((p) => p.status === 'SOLD').length || 0,
      under_offer_properties: properties?.filter((p) => p.status === 'UNDER_OFFER').length || 0,
      sales_this_month:
        properties?.filter(
          (p) =>
            p.status === 'SOLD' &&
            new Date(p.updated_at) >= thisMonthStart
        ).length || 0,
      average_price:
        properties && properties.length > 0
          ? Math.round(
              properties.reduce((sum, p) => sum + (p.asking_price || 0), 0) / properties.length
            )
          : 0,
      average_days_to_sell: await calculateAverageDaysToSell(user.id),
      total_value:
        properties?.reduce((sum, p) => sum + (p.asking_price || 0), 0) || 0,
    };

    return stats;
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    return {
      total_properties: 0,
      active_properties: 0,
      sold_properties: 0,
      under_offer_properties: 0,
      sales_this_month: 0,
      average_price: 0,
      average_days_to_sell: 0,
      total_value: 0,
    };
  }
}

/**
 * Calculate average days to sell for sold properties
 */
async function calculateAverageDaysToSell(userId: string): Promise<number> {
  try {
    const { data: soldProperties } = await supabase
      .from('properties')
      .select('created_at, updated_at')
      .eq('owner_id', userId)
      .eq('status', 'SOLD')
      .is('deleted_at', null);

    if (!soldProperties || soldProperties.length === 0) return 0;

    const totalDays = soldProperties.reduce((sum, prop) => {
      const created = new Date(prop.created_at);
      const sold = new Date(prop.updated_at);
      const days = Math.floor((sold.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / soldProperties.length);
  } catch (error) {
    console.error('Error calculating average days to sell:', error);
    return 0;
  }
}

/**
 * Get monthly sales data for the last 6 months
 */
export async function getMonthlySalesData(): Promise<MonthlySalesData[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: properties } = await supabase
      .from('properties')
      .select('asking_price, updated_at, status')
      .eq('owner_id', user.id)
      .eq('status', 'SOLD')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (!properties) return [];

    // Group by month
    const monthlyData = new Map<string, { count: number; total: number }>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, { count: 0, total: 0 });
    }

    // Aggregate sales by month
    properties.forEach((prop) => {
      const date = new Date(prop.updated_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData.has(monthKey)) {
        const current = monthlyData.get(monthKey)!;
        monthlyData.set(monthKey, {
          count: current.count + 1,
          total: current.total + (prop.asking_price || 0),
        });
      }
    });

    // Convert to array
    const result: MonthlySalesData[] = [];
    monthlyData.forEach((data, key) => {
      const [year, month] = key.split('-');
      result.push({
        month: monthNames[parseInt(month) - 1],
        sales_count: data.count,
        total_value: data.total,
        average_price: data.count > 0 ? Math.round(data.total / data.count) : 0,
      });
    });

    return result;
  } catch (error) {
    console.error('Error getting monthly sales data:', error);
    return [];
  }
}

/**
 * Get top performing properties
 */
export async function getTopProperties(limit: number = 5): Promise<PropertyPerformance[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Get properties with their timeline event counts and document counts
    const { data: properties } = await supabase
      .from('properties')
      .select(`
        id,
        address,
        district,
        city,
        asking_price,
        status,
        created_at
      `)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .order('asking_price', { ascending: false })
      .limit(limit);

    if (!properties) return [];

    // Get timeline event counts and document counts for each property
    const performanceData = await Promise.all(
      properties.map(async (prop) => {
        const [timelineResult, documentsResult] = await Promise.all([
          supabase
            .from('timeline_events')
            .select('id', { count: 'exact', head: true })
            .eq('property_id', prop.id),
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('property_id', prop.id),
        ]);

        const daysListed = Math.floor(
          (new Date().getTime() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Simple progress calculation based on timeline events
        const eventCount = timelineResult.count || 0;
        const progressPercentage = Math.min(Math.round((eventCount / 10) * 100), 100);

        return {
          id: prop.id,
          address: prop.address,
          district: prop.district || '',
          city: prop.city,
          asking_price: prop.asking_price,
          status: prop.status,
          days_listed: daysListed,
          progress_percentage: progressPercentage,
          timeline_events_count: eventCount,
          documents_count: documentsResult.count || 0,
        };
      })
    );

    return performanceData;
  } catch (error) {
    console.error('Error getting top properties:', error);
    return [];
  }
}

// ============================================================================
// Performance Metrics
// ============================================================================

/**
 * Calculate performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetric[]> {
  try {
    const stats = await getAnalyticsStats();
    const timelineStats = await getTimelineStats();
    const documentStats = await getDocumentStats();

    // Conversion rate (sold / total)
    const conversionRate =
      stats.total_properties > 0
        ? Math.round((stats.sold_properties / stats.total_properties) * 100)
        : 0;

    // Document verification rate
    const verificationRate =
      documentStats.total > 0
        ? Math.round((documentStats.verified / documentStats.total) * 100)
        : 0;

    // Timeline activity (events per property)
    const timelineActivity =
      stats.total_properties > 0
        ? (timelineStats.total_events / stats.total_properties).toFixed(1)
        : '0';

    const metrics: PerformanceMetric[] = [
      {
        label: 'Tasa de Conversión',
        value: `${conversionRate}%`,
        target: '65%',
        status: conversionRate >= 65 ? 'success' : conversionRate >= 50 ? 'warning' : 'danger',
        actual_value: conversionRate,
        target_value: 65,
      },
      {
        label: 'Documentos Verificados',
        value: `${verificationRate}%`,
        target: '80%',
        status: verificationRate >= 80 ? 'success' : verificationRate >= 60 ? 'warning' : 'danger',
        actual_value: verificationRate,
        target_value: 80,
      },
      {
        label: 'Actividad Timeline',
        value: `${timelineActivity} eventos/prop`,
        target: '5+ eventos',
        status: parseFloat(timelineActivity) >= 5 ? 'success' : parseFloat(timelineActivity) >= 3 ? 'warning' : 'danger',
        actual_value: parseFloat(timelineActivity),
        target_value: 5,
      },
      {
        label: 'Propiedades Activas',
        value: stats.active_properties.toString(),
        target: '10+',
        status: stats.active_properties >= 10 ? 'success' : stats.active_properties >= 5 ? 'warning' : 'danger',
        actual_value: stats.active_properties,
        target_value: 10,
      },
    ];

    return metrics;
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return [];
  }
}

// ============================================================================
// District Insights
// ============================================================================

/**
 * Get insights by district
 */
export async function getDistrictInsights(): Promise<DistrictInsight[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: properties } = await supabase
      .from('properties')
      .select('district, asking_price, status, created_at')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .not('district', 'is', null);

    if (!properties) return [];

    // Group by district
    const districtMap = new Map<string, {
      count: number;
      totalPrice: number;
      soldCount: number;
      totalDays: number;
    }>();

    properties.forEach((prop) => {
      const district = prop.district!;
      const current = districtMap.get(district) || {
        count: 0,
        totalPrice: 0,
        soldCount: 0,
        totalDays: 0,
      };

      const daysListed = Math.floor(
        (new Date().getTime() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      districtMap.set(district, {
        count: current.count + 1,
        totalPrice: current.totalPrice + (prop.asking_price || 0),
        soldCount: current.soldCount + (prop.status === 'SOLD' ? 1 : 0),
        totalDays: current.totalDays + daysListed,
      });
    });

    // Convert to array and calculate averages
    const insights: DistrictInsight[] = [];
    districtMap.forEach((data, district) => {
      insights.push({
        district,
        property_count: data.count,
        average_price: Math.round(data.totalPrice / data.count),
        average_days_listed: Math.round(data.totalDays / data.count),
        sold_count: data.soldCount,
      });
    });

    // Sort by property count descending
    insights.sort((a, b) => b.property_count - a.property_count);

    return insights;
  } catch (error) {
    console.error('Error getting district insights:', error);
    return [];
  }
}

// ============================================================================
// Timeline Analytics
// ============================================================================

/**
 * Get timeline analytics
 */
export async function getTimelineAnalytics(): Promise<TimelineAnalytics> {
  try {
    const stats = await getTimelineStats();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total_events: 0,
        events_this_month: 0,
        most_common_event_type: '',
        properties_with_events: 0,
      };
    }

    // Get events this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const { data: eventsThisMonth } = await supabase
      .from('timeline_events')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', thisMonthStart.toISOString());

    // Get most common event type
    const { data: events } = await supabase
      .from('timeline_events')
      .select('event_type')
      .eq('user_id', user.id);

    let mostCommonType = '';
    if (events && events.length > 0) {
      const typeCounts = new Map<string, number>();
      events.forEach((e) => {
        typeCounts.set(e.event_type, (typeCounts.get(e.event_type) || 0) + 1);
      });

      let maxCount = 0;
      typeCounts.forEach((count, type) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonType = type;
        }
      });
    }

    return {
      total_events: stats.total_events,
      events_this_month: eventsThisMonth?.length || 0,
      most_common_event_type: mostCommonType,
      properties_with_events: stats.active_properties,
    };
  } catch (error) {
    console.error('Error getting timeline analytics:', error);
    return {
      total_events: 0,
      events_this_month: 0,
      most_common_event_type: '',
      properties_with_events: 0,
    };
  }
}

// ============================================================================
// Document Analytics
// ============================================================================

/**
 * Get document analytics
 */
export async function getDocumentAnalytics(): Promise<DocumentAnalytics> {
  try {
    const stats = await getDocumentStats();

    return {
      total_documents: stats.total,
      verified_documents: stats.verified,
      pending_documents: stats.pending,
      rejected_documents: stats.rejected,
      verification_rate:
        stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting document analytics:', error);
    return {
      total_documents: 0,
      verified_documents: 0,
      pending_documents: 0,
      rejected_documents: 0,
      verification_rate: 0,
    };
  }
}
