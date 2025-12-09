// Document Signature Types

export type SignatureType = 'drawn' | 'typed' | 'uploaded';

export type SignatureRequestStatus = 'pending' | 'completed' | 'declined' | 'expired';

export type SignerRole = 'buyer' | 'seller' | 'agent' | 'witness' | 'other';

// Document Signature
export interface DocumentSignature {
  id: string;
  document_id: string;
  signer_user_id: string;
  signature_type: SignatureType;
  signature_data: string; // Base64 encoded image or typed text
  signer_name: string;
  signer_email: string;
  signer_role: SignerRole | null;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
  consent_given: boolean;
  consent_text: string | null;
  created_at: string;
}

// Signature Request
export interface SignatureRequest {
  id: string;
  document_id: string;
  requested_by_user_id: string;
  requested_from_user_id: string;
  request_message: string | null;
  required_role: SignerRole | null;
  due_date: string | null;
  status: SignatureRequestStatus;
  completed_at: string | null;
  declined_reason: string | null;
  email_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// Signature Field (for positioned signatures)
export interface SignatureField {
  id: string;
  document_id: string;
  page_number: number;
  x_position: number | null;
  y_position: number | null;
  width: number | null;
  height: number | null;
  field_type: 'signature' | 'initial' | 'date' | 'text';
  field_label: string | null;
  required_role: SignerRole | null;
  is_required: boolean;
  filled_by_signature_id: string | null;
  created_at: string;
}

// Audit Log Entry
export interface SignatureAuditLog {
  id: string;
  document_id: string;
  user_id: string | null;
  event_type:
    | 'signature_requested'
    | 'signature_completed'
    | 'signature_declined'
    | 'document_viewed'
    | 'reminder_sent'
    | 'signature_verified';
  event_data: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Create Signature Data
export interface CreateSignatureData {
  document_id: string;
  signature_type: SignatureType;
  signature_data: string; // Base64 image or typed text
  signer_role?: SignerRole;
  consent_given?: boolean;
  consent_text?: string;
}

// Create Signature Request Data
export interface CreateSignatureRequestData {
  document_id: string;
  requested_from_user_id: string;
  request_message?: string;
  required_role?: SignerRole;
  due_date?: string;
}

// Update Signature Request Data
export interface UpdateSignatureRequestData {
  status?: SignatureRequestStatus;
  declined_reason?: string;
}

// Document with Signature Info
export interface DocumentWithSignatures {
  document_id: string;
  signatures: DocumentSignature[];
  pending_requests: SignatureRequest[];
  is_fully_signed: boolean;
  requires_my_signature: boolean;
  my_signature?: DocumentSignature;
}

// Signature Statistics
export interface SignatureStats {
  total_signatures: number;
  pending_requests: number;
  completed_requests: number;
  my_pending_signatures: number;
}

// Consent text for legal compliance (Peru-specific)
export const DEFAULT_SIGNATURE_CONSENT_ES = `
Al firmar este documento, certifico que:
1. He leído y entiendo el contenido completo de este documento
2. Tengo la autoridad legal para firmar este documento
3. Mi firma es auténtica y legalmente vinculante
4. Acepto que esta firma electrónica tiene el mismo valor legal que una firma manuscrita
5. Entiendo que esta firma será registrada con mi información de usuario y fecha/hora

Conforme a la Ley N° 27269 - Ley de Firmas y Certificados Digitales del Perú.
`.trim();

export const DEFAULT_SIGNATURE_CONSENT_EN = `
By signing this document, I certify that:
1. I have read and understand the complete content of this document
2. I have the legal authority to sign this document
3. My signature is authentic and legally binding
4. I accept that this electronic signature has the same legal value as a handwritten signature
5. I understand that this signature will be recorded with my user information and timestamp

In accordance with Law No. 27269 - Law on Digital Signatures and Certificates of Peru.
`.trim();
