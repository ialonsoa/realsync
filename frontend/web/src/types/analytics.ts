// Analytics Types for RealSync

export interface AnalyticsGoals {
  id: string;
  user_id: string;
  monthly_sales_target: number;
  monthly_revenue_target: number;
  conversion_rate_target: number;
  verification_rate_target: number;
  timeline_activity_target: number;
  active_properties_target: number;
  average_days_to_sell_target: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateGoalsInput {
  monthly_sales_target?: number;
  monthly_revenue_target?: number;
  conversion_rate_target?: number;
  verification_rate_target?: number;
  timeline_activity_target?: number;
  active_properties_target?: number;
  average_days_to_sell_target?: number;
}

export interface AnalyticsStats {
  total_properties: number;
  active_properties: number;
  sold_properties: number;
  under_offer_properties: number;
  sales_this_month: number;
  average_price: number;
  average_days_to_sell: number;
  total_value: number;
}

export interface MonthlySalesData {
  month: string;
  sales_count: number;
  total_value: number;
  average_price: number;
}

export interface PropertyPerformance {
  id: string;
  address: string;
  district: string;
  city: string;
  asking_price: number;
  status: string;
  days_listed: number;
  progress_percentage: number;
  timeline_events_count: number;
  documents_count: number;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  target: string;
  status: 'success' | 'warning' | 'danger';
  actual_value?: number;
  target_value?: number;
}

export interface DistrictInsight {
  district: string;
  property_count: number;
  average_price: number;
  average_days_listed: number;
  sold_count: number;
}

export interface TimelineAnalytics {
  total_events: number;
  events_this_month: number;
  most_common_event_type: string;
  properties_with_events: number;
}

export interface DocumentAnalytics {
  total_documents: number;
  verified_documents: number;
  pending_documents: number;
  rejected_documents: number;
  verification_rate: number;
}

export interface CompleteAnalytics {
  stats: AnalyticsStats;
  monthly_sales: MonthlySalesData[];
  top_properties: PropertyPerformance[];
  performance_metrics: PerformanceMetric[];
  district_insights: DistrictInsight[];
  timeline_analytics: TimelineAnalytics;
  document_analytics: DocumentAnalytics;
  goals: AnalyticsGoals;
}
