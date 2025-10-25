import { CheckCircleIcon, ClockIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function TimelinePage() {
  const timelineEvents = [
    {
      id: '1',
      title: 'Propiedad publicada',
      description: 'La propiedad en Av. Conquistadores 456 ha sido publicada en el sistema',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'completed',
      icon: CheckCircleIcon,
      user: 'Demo Usuario',
    },
    {
      id: '2',
      title: 'Primera visita agendada',
      description: 'Visita programada con cliente interesado para el 18 de Enero',
      date: '2024-01-16',
      time: '02:15 PM',
      status: 'completed',
      icon: UserGroupIcon,
      user: 'Demo Usuario',
    },
    {
      id: '3',
      title: 'Documentos de propiedad verificados',
      description: 'Título de propiedad y certificado de gravámenes validados',
      date: '2024-01-18',
      time: '11:00 AM',
      status: 'completed',
      icon: DocumentTextIcon,
      user: 'Sistema',
    },
    {
      id: '4',
      title: 'Oferta recibida',
      description: 'Primera oferta por S/ 430,000 - Pendiente de revisión',
      date: '2024-01-20',
      time: '04:45 PM',
      status: 'completed',
      icon: CheckCircleIcon,
      user: 'Cliente: María García',
    },
    {
      id: '5',
      title: 'Contraoferta enviada',
      description: 'Contraoferta enviada por S/ 445,000',
      date: '2024-01-21',
      time: '10:30 AM',
      status: 'completed',
      icon: DocumentTextIcon,
      user: 'Demo Usuario',
    },
    {
      id: '6',
      title: 'Oferta aceptada',
      description: 'Acuerdo alcanzado en S/ 445,000 - Iniciando proceso de cierre',
      date: '2024-01-22',
      time: '03:20 PM',
      status: 'in-progress',
      icon: CheckCircleIcon,
      user: 'Demo Usuario',
    },
    {
      id: '7',
      title: 'Inspección técnica programada',
      description: 'Inspección de la propiedad programada para el 25 de Enero',
      date: '2024-01-24',
      time: 'Pendiente',
      status: 'pending',
      icon: ClockIcon,
      user: 'Sistema',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timeline de Transacción</h1>
        <p className="mt-1 text-sm text-gray-500">
          Seguimiento completo del proceso de venta - Av. Conquistadores 456
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Progreso de la Transacción</h2>
          <span className="text-sm font-medium text-primary-600">70% Completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '70%' }}></div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Publicación</div>
            <div className="text-sm font-medium text-success-600">✓</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Oferta</div>
            <div className="text-sm font-medium text-success-600">✓</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Inspección</div>
            <div className="text-sm font-medium text-warning-500">En proceso</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Cierre</div>
            <div className="text-sm font-medium text-gray-400">Pendiente</div>
          </div>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Historial de Actividades</h2>
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineEvents.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== timelineEvents.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          event.status === 'completed'
                            ? 'bg-success-500'
                            : event.status === 'in-progress'
                            ? 'bg-warning-500'
                            : 'bg-gray-400'
                        }`}
                      >
                        <event.icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="mt-1 text-xs text-gray-400">Por: {event.user}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={event.date}>{event.date}</time>
                        <p className="text-xs text-gray-400">{event.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-primary-900 mb-3">Próximos Pasos</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Coordinar inspección técnica de la propiedad (25 Enero)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Preparar documentos para escritura pública</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Solicitar tasación bancaria para financiamiento del comprador</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
