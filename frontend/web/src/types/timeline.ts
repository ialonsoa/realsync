// Timeline Types for Peru Real Estate Transactions

export type TimelineEventType =
  // Property Listing Stage
  | 'property_listed'
  | 'property_updated'
  | 'property_photos_added'

  // Initial Interest Stage
  | 'visit_scheduled'
  | 'visit_completed'
  | 'inquiry_received'

  // Offer/Negotiation Stage (Oferta)
  | 'offer_made'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'counter_offer_made'

  // Arras/Deposit Stage (Peru-specific)
  | 'arras_contract_signed'
  | 'arras_payment_received'
  | 'arras_payment_confirmed'

  // Document Verification Stage
  | 'documents_uploaded'
  | 'documents_verified'
  | 'documents_rejected'
  | 'document_signed'

  // Due Diligence Stage
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'valuation_ordered'
  | 'valuation_completed'

  // Financing Stage
  | 'financing_applied'
  | 'financing_approved'
  | 'financing_rejected'

  // Escritura Pública Stage (Peru Public Deed)
  | 'notary_scheduled'
  | 'escritura_signed'
  | 'escritura_completed'

  // SUNARP Registration Stage (Peru Property Registry)
  | 'sunarp_submission'
  | 'sunarp_in_progress'
  | 'sunarp_completed'

  // Final Stage
  | 'keys_delivered'
  | 'transaction_completed'

  // Other
  | 'note_added'
  | 'status_changed';

export type TimelineEventStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TransactionStage =
  | 'listing'           // Publicación
  | 'prospecting'       // Búsqueda de compradores
  | 'negotiation'       // Negociación y oferta
  | 'arras'            // Contrato de arras (Peru-specific)
  | 'due_diligence'    // Verificación y documentos
  | 'financing'        // Financiamiento
  | 'escritura'        // Escritura pública (Peru notary)
  | 'sunarp'           // Registro en SUNARP (Peru registry)
  | 'completion';      // Cierre y entrega

export interface TimelineEvent {
  id: string;
  user_id: string;
  property_id: string | null;
  title: string;
  description: string;
  event_type: TimelineEventType;
  status: TimelineEventStatus;
  created_at: string;

  // Additional metadata
  created_by_name?: string;
  metadata?: Record<string, any>;
}

export interface CreateTimelineEventData {
  property_id?: string | null;
  title: string;
  description: string;
  event_type: TimelineEventType;
  status?: TimelineEventStatus;
  metadata?: Record<string, any>;
}

export interface TransactionProgress {
  current_stage: TransactionStage;
  completed_stages: TransactionStage[];
  progress_percentage: number;
  estimated_completion_date?: string;
}

export interface TimelineWithProgress {
  events: TimelineEvent[];
  progress: TransactionProgress;
  next_steps: string[];
}

// Peru-specific transaction stages with descriptions
export const PERU_TRANSACTION_STAGES: Record<TransactionStage, {
  name: string;
  description: string;
  typical_duration: string;
}> = {
  listing: {
    name: 'Publicación',
    description: 'Propiedad publicada y activa en el mercado',
    typical_duration: '1-4 semanas',
  },
  prospecting: {
    name: 'Búsqueda',
    description: 'Mostrando propiedad a potenciales compradores',
    typical_duration: '2-8 semanas',
  },
  negotiation: {
    name: 'Negociación',
    description: 'Oferta recibida y en proceso de negociación',
    typical_duration: '1-2 semanas',
  },
  arras: {
    name: 'Contrato de Arras',
    description: 'Firma de contrato de arras y pago de señal',
    typical_duration: '1 semana',
  },
  due_diligence: {
    name: 'Verificación',
    description: 'Revisión de documentos e inspección técnica',
    typical_duration: '2-3 semanas',
  },
  financing: {
    name: 'Financiamiento',
    description: 'Aprobación de crédito hipotecario',
    typical_duration: '3-6 semanas',
  },
  escritura: {
    name: 'Escritura Pública',
    description: 'Firma de escritura pública ante notario',
    typical_duration: '1 semana',
  },
  sunarp: {
    name: 'Registro SUNARP',
    description: 'Inscripción en Registros Públicos',
    typical_duration: '1-2 semanas',
  },
  completion: {
    name: 'Cierre',
    description: 'Entrega de llaves y finalización',
    typical_duration: '1 día',
  },
};

// Event type to stage mapping
export const EVENT_TYPE_TO_STAGE: Record<TimelineEventType, TransactionStage> = {
  // Listing
  property_listed: 'listing',
  property_updated: 'listing',
  property_photos_added: 'listing',

  // Prospecting
  visit_scheduled: 'prospecting',
  visit_completed: 'prospecting',
  inquiry_received: 'prospecting',

  // Negotiation
  offer_made: 'negotiation',
  offer_accepted: 'negotiation',
  offer_rejected: 'negotiation',
  counter_offer_made: 'negotiation',

  // Arras
  arras_contract_signed: 'arras',
  arras_payment_received: 'arras',
  arras_payment_confirmed: 'arras',

  // Due Diligence
  documents_uploaded: 'due_diligence',
  documents_verified: 'due_diligence',
  documents_rejected: 'due_diligence',
  document_signed: 'due_diligence',
  inspection_scheduled: 'due_diligence',
  inspection_completed: 'due_diligence',
  valuation_ordered: 'due_diligence',
  valuation_completed: 'due_diligence',

  // Financing
  financing_applied: 'financing',
  financing_approved: 'financing',
  financing_rejected: 'financing',

  // Escritura
  notary_scheduled: 'escritura',
  escritura_signed: 'escritura',
  escritura_completed: 'escritura',

  // SUNARP
  sunarp_submission: 'sunarp',
  sunarp_in_progress: 'sunarp',
  sunarp_completed: 'sunarp',

  // Completion
  keys_delivered: 'completion',
  transaction_completed: 'completion',

  // Other
  note_added: 'listing', // Default to listing stage
  status_changed: 'listing', // Default to listing stage
};

// Stage order for progress calculation
export const STAGE_ORDER: TransactionStage[] = [
  'listing',
  'prospecting',
  'negotiation',
  'arras',
  'due_diligence',
  'financing',
  'escritura',
  'sunarp',
  'completion',
];

// Helper function to calculate progress percentage
export function calculateProgress(completedStages: TransactionStage[]): number {
  if (completedStages.length === 0) return 0;
  return Math.round((completedStages.length / STAGE_ORDER.length) * 100);
}

// Helper function to get current stage
export function getCurrentStage(events: TimelineEvent[]): TransactionStage {
  if (events.length === 0) return 'listing';

  // Get the most recent event
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestEvent = sortedEvents[0];
  return EVENT_TYPE_TO_STAGE[latestEvent.event_type] || 'listing';
}

// Helper function to get completed stages
export function getCompletedStages(events: TimelineEvent[]): TransactionStage[] {
  const stagesSet = new Set<TransactionStage>();

  events.forEach(event => {
    if (event.status === 'completed') {
      const stage = EVENT_TYPE_TO_STAGE[event.event_type];
      if (stage) {
        stagesSet.add(stage);
      }
    }
  });

  // Return stages in order
  return STAGE_ORDER.filter(stage => stagesSet.has(stage));
}

// Peru-specific next steps suggestions
export const NEXT_STEPS_BY_STAGE: Record<TransactionStage, string[]> = {
  listing: [
    'Tomar fotografías profesionales de la propiedad',
    'Preparar documentos básicos (título de propiedad, planos)',
    'Definir precio competitivo basado en tasación',
  ],
  prospecting: [
    'Coordinar visitas con potenciales compradores',
    'Preparar información detallada de la propiedad',
    'Mantener comunicación con interesados',
  ],
  negotiation: [
    'Revisar términos de la oferta',
    'Consultar con asesor legal si es necesario',
    'Preparar contraoferta si aplica',
  ],
  arras: [
    'Revisar contrato de arras con abogado',
    'Acordar monto de la señal (típicamente 10-20%)',
    'Establecer plazos para siguiente etapa',
  ],
  due_diligence: [
    'Programar inspección técnica de la propiedad',
    'Verificar estado legal del inmueble en SUNARP',
    'Obtener certificado de gravámenes actualizado',
    'Verificar recibos de servicios al día',
  ],
  financing: [
    'Solicitar pre-aprobación del crédito hipotecario',
    'Preparar documentación requerida por el banco',
    'Obtener tasación bancaria de la propiedad',
  ],
  escritura: [
    'Coordinar cita con notario público',
    'Preparar documentación para escritura pública',
    'Confirmar asistencia de todas las partes',
    'Verificar pago de impuestos (Alcabala si aplica)',
  ],
  sunarp: [
    'Presentar escritura pública en SUNARP',
    'Pagar derechos registrales',
    'Dar seguimiento al estado de inscripción',
  ],
  completion: [
    'Coordinar entrega de llaves',
    'Hacer inventario de la propiedad',
    'Firmar acta de entrega',
    'Actualizar servicios a nombre del nuevo propietario',
  ],
};
