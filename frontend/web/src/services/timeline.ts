import { supabase } from '../lib/supabase';
import type {
  TimelineEvent,
  CreateTimelineEventData,
  TransactionProgress,
  TimelineWithProgress,
  TransactionStage,
} from '../types/timeline';
import {
  calculateProgress,
  getCurrentStage,
  getCompletedStages,
  NEXT_STEPS_BY_STAGE,
} from '../types/timeline';

/**
 * Timeline Service - handles all timeline-related operations
 */

// ============================================================================
// Timeline Event CRUD Operations
// ============================================================================

/**
 * Create a timeline event
 */
export async function createTimelineEvent(
  data: CreateTimelineEventData
): Promise<TimelineEvent | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get user profile for created_by_name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { data: event, error } = await supabase
      .from('timeline_events')
      .insert({
        user_id: user.id,
        property_id: data.property_id || null,
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        status: data.status || 'completed',
        created_by_name: profile?.full_name || user.email || 'Usuario',
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return event;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    throw error;
  }
}

/**
 * Get timeline events for a specific property
 */
export async function getPropertyTimelineEvents(
  propertyId: string
): Promise<TimelineEvent[]> {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching property timeline events:', error);
    return [];
  }
}

/**
 * Get all timeline events for the current user
 */
export async function getUserTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user timeline events:', error);
    return [];
  }
}

/**
 * Get timeline events with property information
 */
export async function getTimelineEventsWithProperties(): Promise<any[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('timeline_events')
      .select(`
        *,
        properties (
          id,
          title,
          address,
          city,
          district
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching timeline events with properties:', error);
    return [];
  }
}

/**
 * Update a timeline event
 */
export async function updateTimelineEvent(
  eventId: string,
  updates: Partial<CreateTimelineEventData>
): Promise<TimelineEvent | null> {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating timeline event:', error);
    throw error;
  }
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    throw error;
  }
}

// ============================================================================
// Transaction Progress Operations
// ============================================================================

/**
 * Get transaction progress for a property
 */
export async function getTransactionProgress(
  propertyId: string
): Promise<TransactionProgress> {
  try {
    const events = await getPropertyTimelineEvents(propertyId);

    const currentStage = getCurrentStage(events);
    const completedStages = getCompletedStages(events);
    const progressPercentage = calculateProgress(completedStages);

    return {
      current_stage: currentStage,
      completed_stages: completedStages,
      progress_percentage: progressPercentage,
    };
  } catch (error) {
    console.error('Error getting transaction progress:', error);
    return {
      current_stage: 'listing' as TransactionStage,
      completed_stages: [],
      progress_percentage: 0,
    };
  }
}

/**
 * Get complete timeline with progress for a property
 */
export async function getPropertyTimelineWithProgress(
  propertyId: string
): Promise<TimelineWithProgress> {
  try {
    const events = await getPropertyTimelineEvents(propertyId);
    const progress = await getTransactionProgress(propertyId);
    const nextSteps = NEXT_STEPS_BY_STAGE[progress.current_stage] || [];

    return {
      events,
      progress,
      next_steps: nextSteps,
    };
  } catch (error) {
    console.error('Error getting timeline with progress:', error);
    return {
      events: [],
      progress: {
        current_stage: 'listing' as TransactionStage,
        completed_stages: [],
        progress_percentage: 0,
      },
      next_steps: [],
    };
  }
}

// ============================================================================
// Helper Functions for Auto-Creating Events
// ============================================================================

/**
 * Create timeline event for property creation
 * (This is handled by database trigger, but can be called manually if needed)
 */
export async function createPropertyListedEvent(
  propertyId: string,
  propertyTitle: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Propiedad publicada',
      description: `La propiedad "${propertyTitle}" ha sido publicada en el sistema`,
      event_type: 'property_listed',
      status: 'completed',
    });
  } catch (error) {
    console.error('Error creating property listed event:', error);
    return null;
  }
}

/**
 * Create timeline event for visit scheduling
 */
export async function createVisitScheduledEvent(
  propertyId: string,
  visitDate: string,
  clientName?: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Visita agendada',
      description: clientName
        ? `Visita programada con ${clientName} para el ${visitDate}`
        : `Visita programada para el ${visitDate}`,
      event_type: 'visit_scheduled',
      status: 'pending',
      metadata: { visit_date: visitDate, client_name: clientName },
    });
  } catch (error) {
    console.error('Error creating visit scheduled event:', error);
    return null;
  }
}

/**
 * Create timeline event for offer made
 */
export async function createOfferMadeEvent(
  propertyId: string,
  offerAmount: number,
  buyerName?: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Oferta recibida',
      description: buyerName
        ? `${buyerName} hizo una oferta de S/ ${offerAmount.toLocaleString()}`
        : `Oferta recibida por S/ ${offerAmount.toLocaleString()}`,
      event_type: 'offer_made',
      status: 'pending',
      metadata: { offer_amount: offerAmount, buyer_name: buyerName },
    });
  } catch (error) {
    console.error('Error creating offer made event:', error);
    return null;
  }
}

/**
 * Create timeline event for offer acceptance
 */
export async function createOfferAcceptedEvent(
  propertyId: string,
  finalAmount: number
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Oferta aceptada',
      description: `Acuerdo alcanzado en S/ ${finalAmount.toLocaleString()} - Iniciando proceso de cierre`,
      event_type: 'offer_accepted',
      status: 'completed',
      metadata: { final_amount: finalAmount },
    });
  } catch (error) {
    console.error('Error creating offer accepted event:', error);
    return null;
  }
}

/**
 * Create timeline event for document verification
 */
export async function createDocumentVerifiedEvent(
  propertyId: string,
  documentName: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Documento verificado',
      description: `El documento "${documentName}" ha sido verificado`,
      event_type: 'documents_verified',
      status: 'completed',
      metadata: { document_name: documentName },
    });
  } catch (error) {
    console.error('Error creating document verified event:', error);
    return null;
  }
}

/**
 * Create timeline event for inspection
 */
export async function createInspectionScheduledEvent(
  propertyId: string,
  inspectionDate: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: 'Inspección técnica programada',
      description: `Inspección de la propiedad programada para el ${inspectionDate}`,
      event_type: 'inspection_scheduled',
      status: 'pending',
      metadata: { inspection_date: inspectionDate },
    });
  } catch (error) {
    console.error('Error creating inspection scheduled event:', error);
    return null;
  }
}

/**
 * Create custom note event
 */
export async function createNoteEvent(
  propertyId: string,
  noteTitle: string,
  noteDescription: string
): Promise<TimelineEvent | null> {
  try {
    return await createTimelineEvent({
      property_id: propertyId,
      title: noteTitle,
      description: noteDescription,
      event_type: 'note_added',
      status: 'completed',
    });
  } catch (error) {
    console.error('Error creating note event:', error);
    return null;
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get timeline statistics for current user
 */
export async function getTimelineStats() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total_events: 0,
        pending_events: 0,
        completed_events: 0,
        active_properties: 0,
      };
    }

    const { count: totalEvents } = await supabase
      .from('timeline_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: pendingEvents } = await supabase
      .from('timeline_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    const { count: completedEvents } = await supabase
      .from('timeline_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Get count of properties with timeline events
    const { data: activeProperties } = await supabase
      .from('timeline_events')
      .select('property_id')
      .eq('user_id', user.id)
      .not('property_id', 'is', null);

    const uniqueProperties = new Set(
      (activeProperties || []).map((e: any) => e.property_id)
    );

    return {
      total_events: totalEvents || 0,
      pending_events: pendingEvents || 0,
      completed_events: completedEvents || 0,
      active_properties: uniqueProperties.size,
    };
  } catch (error) {
    console.error('Error fetching timeline stats:', error);
    return {
      total_events: 0,
      pending_events: 0,
      completed_events: 0,
      active_properties: 0,
    };
  }
}
