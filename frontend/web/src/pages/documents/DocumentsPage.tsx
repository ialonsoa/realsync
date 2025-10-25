import { DocumentTextIcon, CheckCircleIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function DocumentsPage() {
  const documents = [
    {
      id: '1',
      name: 'Título de Propiedad',
      description: 'Partida registral actualizada de Sunarp',
      type: 'Legal',
      uploadedBy: 'Demo Usuario',
      uploadDate: '2024-01-15',
      status: 'verified',
      size: '2.4 MB',
      format: 'PDF',
    },
    {
      id: '2',
      name: 'Certificado de Gravámenes',
      description: 'Certificado de libertad de gravámenes',
      type: 'Legal',
      uploadedBy: 'Demo Usuario',
      uploadDate: '2024-01-15',
      status: 'verified',
      size: '1.1 MB',
      format: 'PDF',
    },
    {
      id: '3',
      name: 'Planos de Distribución',
      description: 'Planos arquitectónicos aprobados por municipalidad',
      type: 'Técnico',
      uploadedBy: 'Demo Usuario',
      uploadDate: '2024-01-16',
      status: 'verified',
      size: '5.8 MB',
      format: 'PDF',
    },
    {
      id: '4',
      name: 'Recibos de Luz - 3 meses',
      description: 'Últimos 3 recibos de servicio eléctrico',
      type: 'Servicios',
      uploadedBy: 'Propietario',
      uploadDate: '2024-01-17',
      status: 'verified',
      size: '890 KB',
      format: 'PDF',
    },
    {
      id: '5',
      name: 'Recibos de Agua - 3 meses',
      description: 'Últimos 3 recibos de servicio de agua',
      type: 'Servicios',
      uploadedBy: 'Propietario',
      uploadDate: '2024-01-17',
      status: 'verified',
      size: '750 KB',
      format: 'PDF',
    },
    {
      id: '6',
      name: 'DNI del Propietario',
      description: 'Documento de identidad del vendedor',
      type: 'Identificación',
      uploadedBy: 'Propietario',
      uploadDate: '2024-01-18',
      status: 'verified',
      size: '320 KB',
      format: 'PDF',
    },
    {
      id: '7',
      name: 'Contrato de Arras',
      description: 'Contrato de reserva - Oferta S/ 445,000',
      type: 'Contractual',
      uploadedBy: 'Demo Usuario',
      uploadDate: '2024-01-22',
      status: 'pending',
      size: '1.5 MB',
      format: 'PDF',
    },
    {
      id: '8',
      name: 'Informe de Tasación',
      description: 'Tasación comercial de la propiedad',
      type: 'Valuación',
      uploadedBy: 'Sistema',
      uploadDate: '2024-01-20',
      status: 'review',
      size: '3.2 MB',
      format: 'PDF',
    },
  ];

  const documentStats = [
    { name: 'Verificados', count: 6, color: 'text-success-600 bg-success-100' },
    { name: 'En Revisión', count: 1, color: 'text-warning-600 bg-warning-100' },
    { name: 'Pendientes', count: 1, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de documentos para Av. Conquistadores 456, San Isidro
        </p>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {documentStats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Subir Nuevos Documentos</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-primary-600">Click para subir</span> o arrastra archivos aquí
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX hasta 10MB</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Documentos Subidos</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {doc.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === 'verified'
                            ? 'bg-success-100 text-success-800'
                            : doc.status === 'review'
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status === 'verified' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {doc.status === 'review' && <ClockIcon className="h-3 w-3 mr-1" />}
                        {doc.status === 'verified' ? 'Verificado' : doc.status === 'review' ? 'En Revisión' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>Tipo: {doc.type}</span>
                      <span>•</span>
                      <span>Subido por: {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-warning-900 mb-3">Documentos Requeridos para el Cierre</h3>
        <ul className="space-y-2 text-sm text-warning-800">
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-success-600 mr-2" />
            <span className="line-through">Título de Propiedad</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-success-600 mr-2" />
            <span className="line-through">Certificado de Gravámenes</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2" />
            <span>Pre-aprobación de crédito del comprador (Pendiente)</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2" />
            <span>Certificado de parámetros urbanísticos (Pendiente)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
