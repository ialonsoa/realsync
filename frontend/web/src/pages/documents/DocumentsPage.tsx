import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import {
  getUserDocuments,
  uploadDocument,
  viewDocument,
  deleteDocument,
  getDocumentStats,
} from '../../services/documents';
import {
  createSignature,
  getDocumentSignatureInfo,
} from '../../services/signatures';
import type { DocumentWithUrl, CreateDocumentData, DocumentStats } from '../../types/document';
import type { SignatureType, SignerRole, DocumentWithSignatures } from '../../types/signature';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, formatFileSize } from '../../types/document';
import SignatureModal from '../../components/documents/SignatureModal';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithUrl[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProperty] = useState<string | null>(null);

  // Signature state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [documentToSign, setDocumentToSign] = useState<DocumentWithUrl | null>(null);
  const [documentSignatures, setDocumentSignatures] = useState<Map<string, DocumentWithSignatures>>(new Map());

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [selectedProperty]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docs, docStats] = await Promise.all([
        getUserDocuments(selectedProperty),
        getDocumentStats(selectedProperty),
      ]);
      setDocuments(docs);
      setStats(docStats);

      // Load signature info for each document
      const signaturesMap = new Map<string, DocumentWithSignatures>();
      await Promise.all(
        docs.map(async (doc) => {
          const sigInfo = await getDocumentSignatureInfo(doc.id);
          if (sigInfo) {
            signaturesMap.set(doc.id, sigInfo);
          }
        })
      );
      setDocumentSignatures(signaturesMap);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX, JPG, PNG.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`El archivo es demasiado grande. Máximo ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }

    setUploading(true);

    try {
      const uploadData: CreateDocumentData = {
        name: file.name,
        property_id: selectedProperty,
        file,
      };

      await uploadDocument(uploadData);
      toast.success('Documento subido exitosamente');

      // Reload documents
      await loadDocuments();

      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc: DocumentWithUrl) => {
    try {
      await viewDocument(doc.id);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Error al abrir documento');
    }
  };

  const handleOpenSignModal = (doc: DocumentWithUrl) => {
    setDocumentToSign(doc);
    setSignatureModalOpen(true);
  };

  const handleSign = async (
    signatureData: string,
    signatureType: SignatureType,
    role?: SignerRole
  ) => {
    if (!documentToSign) return;

    try {
      await createSignature({
        document_id: documentToSign.id,
        signature_type: signatureType,
        signature_data: signatureData,
        signer_role: role,
      });

      toast.success('Documento firmado exitosamente');

      // Reload documents and signatures
      await loadDocuments();

      setSignatureModalOpen(false);
      setDocumentToSign(null);
    } catch (error: any) {
      console.error('Error signing document:', error);
      toast.error(error.message || 'Error al firmar documento');
      throw error;
    }
  };

  const handleDelete = async (doc: DocumentWithUrl) => {
    if (!confirm(`¿Estás seguro de eliminar "${doc.name}"?`)) {
      return;
    }

    try {
      await deleteDocument(doc.id);
      toast.success('Documento eliminado');
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error al eliminar documento');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'bg-success-100 text-success-800',
          icon: CheckCircleIcon,
          text: 'Verificado',
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircleIcon,
          text: 'Rechazado',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: ClockIcon,
          text: 'Pendiente',
        };
    }
  };

  const documentStats = [
    { name: 'Verificados', count: stats.verified, color: 'text-success-600 bg-success-100' },
    { name: 'Pendientes', count: stats.pending, color: 'text-gray-600 bg-gray-100' },
    { name: 'Rechazados', count: stats.rejected, color: 'text-red-600 bg-red-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de documentos para tus transacciones inmobiliarias
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
        <label
          htmlFor="file-upload"
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer block ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept={ALLOWED_FILE_TYPES.join(',')}
          />
          {uploading ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Subiendo documento...</p>
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click para subir</span> o arrastra
                archivos aquí
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG hasta {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </>
          )}
        </label>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Documentos Subidos ({documents.length})
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza subiendo tu primer documento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => {
              const statusBadge = getStatusBadge(doc.status);
              const StatusIcon = statusBadge.icon;
              const sigInfo = documentSignatures.get(doc.id);
              const hasSigned = sigInfo?.my_signature !== undefined;
              const requiresSignature = sigInfo?.requires_my_signature || false;

              return (
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
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusBadge.text}
                          </span>
                          {hasSigned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <PencilSquareIcon className="h-3 w-3 mr-1" />
                              Firmado
                            </span>
                          )}
                          {requiresSignature && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Requiere Firma
                            </span>
                          )}
                          {sigInfo && sigInfo.signatures.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {sigInfo.signatures.length} firma(s)
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          {doc.document_type && <span>Tipo: {doc.document_type}</span>}
                          {doc.document_type && <span>•</span>}
                          <span>Subido por: {doc.uploaded_by}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.created_at).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span>{doc.displaySize}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Ver documento"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {!hasSigned && (
                        <button
                          onClick={() => handleOpenSignModal(doc)}
                          className={`p-2 transition-colors ${
                            requiresSignature
                              ? 'text-yellow-600 hover:text-yellow-700 animate-pulse'
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                          title="Firmar documento"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleView(doc)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Descargar"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-warning-900 mb-3">
          Documentos Requeridos para Transacciones Inmobiliarias
        </h3>
        <ul className="space-y-2 text-sm text-warning-800">
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-success-600 mr-2 flex-shrink-0" />
            <span>Título de Propiedad (Partida Registral SUNARP)</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-success-600 mr-2 flex-shrink-0" />
            <span>Certificado de Libertad de Gravámenes</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2 flex-shrink-0" />
            <span>Planos de Distribución Aprobados</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2 flex-shrink-0" />
            <span>Recibos de Servicios (Luz, Agua - últimos 3 meses)</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2 flex-shrink-0" />
            <span>DNI del Propietario</span>
          </li>
          <li className="flex items-center">
            <ClockIcon className="h-4 w-4 text-warning-600 mr-2 flex-shrink-0" />
            <span>Certificado de Parámetros Urbanísticos (opcional)</span>
          </li>
        </ul>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false);
          setDocumentToSign(null);
        }}
        onSign={handleSign}
        documentName={documentToSign?.name || ''}
      />
    </div>
  );
}
