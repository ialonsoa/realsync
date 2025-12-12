import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  HomeIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { getPropertyTimelineWithProgress, getUserTimelineEvents } from '../../services/timeline';
import { getUserDocuments } from '../../services/documents';
import type { TimelineWithProgress, TimelineEvent, TimelineEventType } from '../../types/timeline';
import { PERU_TRANSACTION_STAGES, STAGE_ORDER } from '../../types/timeline';

// Icon mapping for event types
const EVENT_TYPE_ICONS: Record<TimelineEventType, any> = {
  property_listed: HomeIcon,
  property_updated: HomeIcon,
  property_photos_added: HomeIcon,
  visit_scheduled: UserGroupIcon,
  visit_completed: CheckCircleIcon,
  inquiry_received: UserGroupIcon,
  offer_made: BanknotesIcon,
  offer_accepted: CheckCircleIcon,
  offer_rejected: XCircleIcon,
  counter_offer_made: BanknotesIcon,
  arras_contract_signed: DocumentTextIcon,
  arras_payment_received: BanknotesIcon,
  arras_payment_confirmed: CheckCircleIcon,
  documents_uploaded: DocumentTextIcon,
  documents_verified: CheckCircleIcon,
  documents_rejected: XCircleIcon,
  document_signed: DocumentTextIcon,
  inspection_scheduled: ClockIcon,
  inspection_completed: CheckCircleIcon,
  valuation_ordered: BanknotesIcon,
  valuation_completed: CheckCircleIcon,
  financing_applied: BanknotesIcon,
  financing_approved: CheckCircleIcon,
  financing_rejected: XCircleIcon,
  notary_scheduled: BuildingLibraryIcon,
  escritura_signed: DocumentTextIcon,
  escritura_completed: CheckCircleIcon,
  sunarp_submission: DocumentTextIcon,
  sunarp_in_progress: ClockIcon,
  sunarp_completed: CheckCircleIcon,
  keys_delivered: KeyIcon,
  transaction_completed: CheckCircleIcon,
  note_added: DocumentTextIcon,
  status_changed: ClockIcon,
};

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<TimelineWithProgress | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      loadPropertyTimeline(selectedPropertyId);
    } else {
      loadAllTimeline();
    }
  }, [selectedPropertyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user's properties
      const props = await getUserDocuments();
      setProperties(props);

      // Load all timeline events
      const events = await getUserTimelineEvents();
      setAllEvents(events);

      // If there's at least one property, select the first one
      if (props.length > 0 && props[0].property_id) {
        setSelectedPropertyId(props[0].property_id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyTimeline = async (propertyId: string) => {
    try {
      const data = await getPropertyTimelineWithProgress(propertyId);
      setTimelineData(data);
    } catch (error) {
      console.error('Error loading property timeline:', error);
      toast.error('Error al cargar timeline');
    }
  };

  const loadAllTimeline = () => {
    // When no property is selected, show all events
    setTimelineData({
      events: allEvents,
      progress: {
        current_stage: 'listing',
        completed_stages: [],
        progress_percentage: 0,
      },
      next_steps: [],
    });
  };

  const getEventIcon = (eventType: TimelineEventType) => {
    return EVENT_TYPE_ICONS[eventType] || DocumentTextIcon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-500';
      case 'in_progress':
        return 'bg-warning-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const events = timelineData?.events || [];
  const progress = timelineData?.progress || {
    current_stage: 'listing',
    completed_stages: [],
    progress_percentage: 0,
  };
  const nextSteps = timelineData?.next_steps || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timeline de Transacción</h1>
        <p className="mt-1 text-sm text-gray-500">
          Seguimiento completo del proceso de venta inmobiliaria
        </p>
      </div>

      {/* Property Selector */}
      {properties.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Propiedad
          </label>
          <select
            value={selectedPropertyId || ''}
            onChange={(e) => setSelectedPropertyId(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las propiedades</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.property_id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Progress Bar */}
      {selectedPropertyId && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Progreso de la Transacción</h2>
            <span className="text-sm font-medium text-primary-600">
              {progress.progress_percentage}% Completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress_percentage}%` }}
            ></div>
          </div>

          {/* Transaction Stages */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            {STAGE_ORDER.map((stage) => {
              const stageInfo = PERU_TRANSACTION_STAGES[stage];
              const isCompleted = progress.completed_stages.includes(stage);
              const isCurrent = progress.current_stage === stage;

              return (
                <div key={stage} className="relative">
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isCompleted
                        ? 'text-success-600'
                        : isCurrent
                        ? 'text-primary-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {stageInfo.name}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-success-600'
                        : isCurrent
                        ? 'text-primary-600 animate-pulse'
                        : 'text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : isCurrent ? '⚬' : '○'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Historial de Actividades</h2>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los eventos aparecerán aquí a medida que progresa la transacción
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {events.map((event, eventIdx) => {
                const EventIcon = getEventIcon(event.event_type);
                const statusColor = getStatusColor(event.status);

                return (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== events.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${statusColor}`}
                          >
                            <EventIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              Por: {event.created_by_name || 'Sistema'}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={event.created_at}>
                              {new Date(event.created_at).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                            <p className="text-xs text-gray-400">
                              {new Date(event.created_at).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Next Steps */}
      {selectedPropertyId && nextSteps.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-primary-900 mb-3">Próximos Pasos</h3>
          <ul className="space-y-2 text-sm text-primary-800">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Stage Info */}
      {selectedPropertyId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Etapa Actual: {PERU_TRANSACTION_STAGES[progress.current_stage].name}
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            {PERU_TRANSACTION_STAGES[progress.current_stage].description}
          </p>
          <p className="text-xs text-blue-700">
            Duración típica: {PERU_TRANSACTION_STAGES[progress.current_stage].typical_duration}
          </p>
        </div>
      )}
    </div>
  );
}
