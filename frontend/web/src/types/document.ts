// Document Types

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export type DocumentType =
  | 'Legal'
  | 'Técnico'
  | 'Servicios'
  | 'Identificación'
  | 'Contractual'
  | 'Valuación'
  | 'Otro';

export interface Document {
  id: string;
  user_id: string;
  property_id: string | null;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: DocumentStatus;
  uploaded_by: string;
  created_at: string;

  // Additional metadata
  description?: string;
  document_type?: DocumentType;
}

export interface CreateDocumentData {
  name: string;
  property_id?: string | null;
  description?: string;
  document_type?: DocumentType;
  file: File;
}

export interface UpdateDocumentData {
  name?: string;
  description?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
}

export interface DocumentWithUrl extends Document {
  downloadUrl: string;
  displaySize: string;
  displayFormat: string;
}

export interface DocumentStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

// Peru-specific required documents for real estate transactions
export const REQUIRED_DOCUMENTS = [
  { key: 'titulo_propiedad', name: 'Título de Propiedad', required: true },
  { key: 'certificado_gravamenes', name: 'Certificado de Gravámenes', required: true },
  { key: 'planos', name: 'Planos de Distribución', required: true },
  { key: 'recibos_luz', name: 'Recibos de Luz (3 meses)', required: true },
  { key: 'recibos_agua', name: 'Recibos de Agua (3 meses)', required: true },
  { key: 'dni_propietario', name: 'DNI del Propietario', required: true },
  { key: 'pre_aprobacion', name: 'Pre-aprobación de Crédito', required: false },
  { key: 'parametros', name: 'Certificado de Parámetros Urbanísticos', required: false },
] as const;

// Allowed file types and size limits
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
}
