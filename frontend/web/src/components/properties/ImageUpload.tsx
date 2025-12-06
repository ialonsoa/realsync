import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      setUploading(true);
      setUploadProgress(`Subiendo ${filesToUpload.length} imagen(es)...`);

      const uploadPromises = filesToUpload.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      onChange([...images, ...uploadedUrls]);
      setUploadProgress('');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes de la Propiedad
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Sube hasta {maxImages} imágenes ({maxImages - images.length} restantes)
        </p>

        {/* Upload Button */}
        {images.length < maxImages && (
          <label
            htmlFor="image-upload"
            className={`
              relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-gray-300
              hover:border-primary-500 transition-colors p-6 flex flex-col items-center justify-center
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {uploading ? uploadProgress : 'Haz clic para subir imágenes'}
            </span>
            <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Property image ${index + 1}`}
                className="h-32 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-error-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
