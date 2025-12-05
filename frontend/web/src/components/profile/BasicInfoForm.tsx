import { PhotoIcon } from '@heroicons/react/24/outline';
import { useState, useRef } from 'react';

interface BasicInfoFormProps {
  data: {
    full_name: string;
    phone: string;
    preferred_language: 'es' | 'en';
  };
  onChange: (data: any) => void;
  profilePhoto: File | null;
  onPhotoChange: (file: File | null) => void;
}

export default function BasicInfoForm({
  data,
  onChange,
  profilePhoto,
  onPhotoChange,
}: BasicInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto de Perfil (Opcional)
        </label>
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {photoPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG o WebP. Máx. 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          value={data.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Juan Pérez García"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          value={data.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="+51 999 999 999"
        />
        <p className="mt-1 text-sm text-gray-500">
          Incluye el código de país (+51 para Perú)
        </p>
      </div>

      {/* Preferred Language */}
      <div>
        <label
          htmlFor="preferred_language"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Idioma Preferido
        </label>
        <select
          id="preferred_language"
          value={data.preferred_language}
          onChange={(e) =>
            handleInputChange('preferred_language', e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
