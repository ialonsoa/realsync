import { supabase } from '../lib/supabase';
import type {
  DocumentSignature,
  SignatureRequest,
  CreateSignatureData,
  CreateSignatureRequestData,
  UpdateSignatureRequestData,
  DocumentWithSignatures,
  SignatureStats,
} from '../types/signature';

/**
 * Signatures Service - handles all document signature operations
 */

// ============================================================================
// Signature CRUD Operations
// ============================================================================

/**
 * Create a signature on a document
 */
export async function createSignature(
  data: CreateSignatureData
): Promise<DocumentSignature | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get user profile for signer info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create signature
    const { data: signature, error } = await supabase
      .from('document_signatures')
      .insert({
        document_id: data.document_id,
        signer_user_id: user.id,
        signature_type: data.signature_type,
        signature_data: data.signature_data,
        signer_name: profile?.full_name || user.email || 'Usuario',
        signer_email: user.email || '',
        signer_role: data.signer_role || null,
        consent_given: data.consent_given ?? true,
        consent_text: data.consent_text || null,
        ip_address: null, // Could be captured server-side
        user_agent: navigator.userAgent,
      })
      .select()
      .single();

    if (error) throw error;

    return signature;
  } catch (error) {
    console.error('Error creating signature:', error);
    throw error;
  }
}

/**
 * Get all signatures for a document
 */
export async function getDocumentSignatures(
  documentId: string
): Promise<DocumentSignature[]> {
  try {
    const { data, error } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('document_id', documentId)
      .order('signed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching document signatures:', error);
    return [];
  }
}

/**
 * Check if current user has signed a document
 */
export async function hasUserSignedDocument(
  documentId: string
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from('document_signatures')
      .select('id')
      .eq('document_id', documentId)
      .eq('signer_user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error) {
    console.error('Error checking signature status:', error);
    return false;
  }
}

/**
 * Get user's signature on a document
 */
export async function getUserSignature(
  documentId: string
): Promise<DocumentSignature | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('document_id', documentId)
      .eq('signer_user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user signature:', error);
    return null;
  }
}

// ============================================================================
// Signature Request Operations
// ============================================================================

/**
 * Request a signature from another user
 */
export async function requestSignature(
  data: CreateSignatureRequestData
): Promise<SignatureRequest | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data: request, error } = await supabase
      .from('document_signature_requests')
      .insert({
        document_id: data.document_id,
        requested_by_user_id: user.id,
        requested_from_user_id: data.requested_from_user_id,
        request_message: data.request_message || null,
        required_role: data.required_role || null,
        due_date: data.due_date || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send email notification to the requested user

    return request;
  } catch (error) {
    console.error('Error requesting signature:', error);
    throw error;
  }
}

/**
 * Get signature requests for a document
 */
export async function getDocumentSignatureRequests(
  documentId: string
): Promise<SignatureRequest[]> {
  try {
    const { data, error } = await supabase
      .from('document_signature_requests')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching signature requests:', error);
    return [];
  }
}

/**
 * Get pending signature requests for current user
 */
export async function getMyPendingSignatureRequests(): Promise<SignatureRequest[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('document_signature_requests')
      .select('*')
      .eq('requested_from_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

/**
 * Update a signature request (complete, decline, etc.)
 */
export async function updateSignatureRequest(
  requestId: string,
  updates: UpdateSignatureRequestData
): Promise<SignatureRequest | null> {
  try {
    const { data, error } = await supabase
      .from('document_signature_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating signature request:', error);
    throw error;
  }
}

/**
 * Decline a signature request
 */
export async function declineSignatureRequest(
  requestId: string,
  reason?: string
): Promise<boolean> {
  try {
    await updateSignatureRequest(requestId, {
      status: 'declined',
      declined_reason: reason || 'Declined by user',
    });
    return true;
  } catch (error) {
    console.error('Error declining signature request:', error);
    return false;
  }
}

// ============================================================================
// Document Signature Info
// ============================================================================

/**
 * Get complete signature information for a document
 */
export async function getDocumentSignatureInfo(
  documentId: string
): Promise<DocumentWithSignatures | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get all signatures
    const signatures = await getDocumentSignatures(documentId);

    // Get pending signature requests
    const allRequests = await getDocumentSignatureRequests(documentId);
    const pendingRequests = allRequests.filter((req) => req.status === 'pending');

    // Check if user needs to sign
    const mySignature = user
      ? signatures.find((sig) => sig.signer_user_id === user.id)
      : undefined;

    const requiresMySignature = user
      ? pendingRequests.some((req) => req.requested_from_user_id === user.id)
      : false;

    // Check if fully signed (all pending requests completed)
    const isFullySigned = pendingRequests.length === 0 && signatures.length > 0;

    return {
      document_id: documentId,
      signatures,
      pending_requests: pendingRequests,
      is_fully_signed: isFullySigned,
      requires_my_signature: requiresMySignature && !mySignature,
      my_signature: mySignature,
    };
  } catch (error) {
    console.error('Error fetching document signature info:', error);
    return null;
  }
}

/**
 * Get signature statistics for current user
 */
export async function getSignatureStats(): Promise<SignatureStats> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total_signatures: 0,
        pending_requests: 0,
        completed_requests: 0,
        my_pending_signatures: 0,
      };
    }

    // Count signatures I've made
    const { count: totalSignatures } = await supabase
      .from('document_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('signer_user_id', user.id);

    // Count pending requests TO me
    const { count: myPendingSignatures } = await supabase
      .from('document_signature_requests')
      .select('*', { count: 'exact', head: true })
      .eq('requested_from_user_id', user.id)
      .eq('status', 'pending');

    // Count all requests I've made
    const { count: pendingRequests } = await supabase
      .from('document_signature_requests')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by_user_id', user.id)
      .eq('status', 'pending');

    const { count: completedRequests } = await supabase
      .from('document_signature_requests')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by_user_id', user.id)
      .eq('status', 'completed');

    return {
      total_signatures: totalSignatures || 0,
      pending_requests: pendingRequests || 0,
      completed_requests: completedRequests || 0,
      my_pending_signatures: myPendingSignatures || 0,
    };
  } catch (error) {
    console.error('Error fetching signature stats:', error);
    return {
      total_signatures: 0,
      pending_requests: 0,
      completed_requests: 0,
      my_pending_signatures: 0,
    };
  }
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify a signature (admin/system function)
 */
export async function verifySignature(signatureId: string): Promise<boolean> {
  try {
    // Log verification event
    const { data: signature } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (!signature) throw new Error('Signature not found');

    await supabase.from('document_signature_audit_log').insert({
      document_id: signature.document_id,
      user_id: signature.signer_user_id,
      event_type: 'signature_verified',
      event_data: { signature_id: signatureId },
      user_agent: navigator.userAgent,
    });

    return true;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Get signature audit log for a document
 */
export async function getSignatureAuditLog(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('document_signature_audit_log')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}
