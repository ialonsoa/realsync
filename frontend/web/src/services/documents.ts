import { supabase } from '../lib/supabase';
import type {
  Document,
  DocumentWithUrl,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentStats,
} from '../types/document';
import { formatFileSize, getFileExtension } from '../types/document';

/**
 * Documents Service - handles all document-related operations with Supabase
 */

// ============================================================================
// Document CRUD Operations
// ============================================================================

/**
 * Get all documents for the current user
 */
export async function getUserDocuments(
  propertyId?: string | null
): Promise<DocumentWithUrl[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by property if specified
    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enrich documents with download URLs
    const documentsWithUrls = await Promise.all(
      (data || []).map(async (doc) => {
        const downloadUrl = await getDocumentDownloadUrl(doc.file_path);
        return {
          ...doc,
          downloadUrl,
          displaySize: formatFileSize(doc.file_size),
          displayFormat: getFileExtension(doc.name),
        } as DocumentWithUrl;
      })
    );

    return documentsWithUrls;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(
  documentId: string
): Promise<DocumentWithUrl | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const downloadUrl = await getDocumentDownloadUrl(data.file_path);

    return {
      ...data,
      downloadUrl,
      displaySize: formatFileSize(data.file_size),
      displayFormat: getFileExtension(data.name),
    } as DocumentWithUrl;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

/**
 * Upload a new document
 */
export async function uploadDocument(
  data: CreateDocumentData
): Promise<Document | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedTypes.includes(data.file.type)) {
      throw new Error(
        'Tipo de archivo no permitido. Solo se aceptan PDF, DOC, DOCX, JPG, PNG.'
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (data.file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB.');
    }

    // Generate unique file path
    const fileExt = data.file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}_${data.file.name}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, data.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get user profile for uploaded_by field
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        property_id: data.property_id || null,
        name: data.name,
        file_path: fileName,
        file_size: data.file.size,
        file_type: data.file.type,
        status: 'pending',
        uploaded_by: profile?.full_name || user.email || 'Usuario',
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage.from('documents').remove([fileName]);
      throw dbError;
    }

    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  updates: UpdateDocumentData
): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document (both file and database record)
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    // First, get the document to find its file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;
    if (!document) throw new Error('Document not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============================================================================
// Document URL Operations
// ============================================================================

/**
 * Get download URL for a document
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string> {
  try {
    const {
      data: { publicUrl },
    } = supabase.storage.from('documents').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return '';
  }
}

/**
 * Download a document (triggers browser download)
 */
export async function downloadDocument(
  documentId: string,
  fileName: string
): Promise<void> {
  try {
    const doc = await getDocumentById(documentId);
    if (!doc) throw new Error('Document not found');

    // Get signed URL for private download
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60); // Valid for 60 seconds

    if (error) throw error;
    if (!data) throw new Error('Failed to generate download URL');

    // Trigger download in browser
    const link = window.document.createElement('a');
    link.href = data.signedUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

// ============================================================================
// Document Statistics
// ============================================================================

/**
 * Get document statistics for the current user
 */
export async function getDocumentStats(
  propertyId?: string | null
): Promise<DocumentStats> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    let query = supabase
      .from('documents')
      .select('status', { count: 'exact' })
      .eq('user_id', user.id);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const stats: DocumentStats = {
      total: count || 0,
      verified: 0,
      pending: 0,
      rejected: 0,
    };

    // Count by status
    (data || []).forEach((doc: any) => {
      if (doc.status === 'verified') stats.verified++;
      else if (doc.status === 'pending') stats.pending++;
      else if (doc.status === 'rejected') stats.rejected++;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return { total: 0, verified: 0, pending: 0, rejected: 0 };
  }
}

// ============================================================================
// Document Sharing (Future Enhancement)
// ============================================================================

/**
 * Share document with another user (placeholder for future implementation)
 */
export async function shareDocument(
  documentId: string,
  shareWithUserId: string
): Promise<boolean> {
  // TODO: Implement document sharing
  // This would require a new table: document_shares
  // with fields: id, document_id, shared_by_user_id, shared_with_user_id, permissions, created_at
  console.log('Document sharing not yet implemented');
  return false;
}

/**
 * Get documents shared with the current user (placeholder)
 */
export async function getSharedDocuments(): Promise<DocumentWithUrl[]> {
  // TODO: Implement fetching shared documents
  console.log('Shared documents not yet implemented');
  return [];
}
