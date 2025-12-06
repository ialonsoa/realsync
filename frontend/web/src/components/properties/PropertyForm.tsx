import { useState } from 'react';
import { Property, PropertyType, PropertyStatus, CreatePropertyInput } from '../../types/property';
import ImageUpload from './ImageUpload';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: CreatePropertyInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PropertyForm({
  property,
  onSubmit,
  onCancel,
  isLoading = false,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<CreatePropertyInput>({
    address: property?.address || '',
    district: property?.district || '',
    city: property?.city || 'Lima',
    region: property?.region || 'Lima',
    postal_code: property?.postal_code || '',
    property_type: property?.property_type || undefined,
    area_sqm: property?.area_sqm || undefined,
    bedrooms: property?.bedrooms || undefined,
    bathrooms: property?.bathrooms || undefined,
    parking_spaces: property?.parking_spaces || undefined,
    asking_price: property?.asking_price || 0,
    currency: property?.currency || 'PEN',
    status: property?.status || 'ACTIVE',
    description: property?.description || '',
    images: property?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.asking_price || formData.asking_price <= 0) {
      newErrors.asking_price = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.address
                  ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-error-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              Distrito
            </label>
            <input
              type="text"
              name="district"
              id="district"
              value={formData.district}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Ciudad *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.city
                  ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-error-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Región
            </label>
            <input
              type="text"
              name="region"
              id="region"
              value={formData.region}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Código Postal
            </label>
            <input
              type="text"
              name="postal_code"
              id="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Property Characteristics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Características</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
              Tipo de Propiedad
            </label>
            <select
              name="property_type"
              id="property_type"
              value={formData.property_type || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="house">Casa</option>
              <option value="apartment">Departamento</option>
              <option value="land">Terreno</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>

          <div>
            <label htmlFor="area_sqm" className="block text-sm font-medium text-gray-700">
              Área (m²)
            </label>
            <input
              type="number"
              name="area_sqm"
              id="area_sqm"
              value={formData.area_sqm || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
              Habitaciones
            </label>
            <input
              type="number"
              name="bedrooms"
              id="bedrooms"
              value={formData.bedrooms || ''}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
              Baños
            </label>
            <input
              type="number"
              name="bathrooms"
              id="bathrooms"
              value={formData.bathrooms || ''}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="parking_spaces" className="block text-sm font-medium text-gray-700">
              Estacionamientos
            </label>
            <input
              type="number"
              name="parking_spaces"
              id="parking_spaces"
              value={formData.parking_spaces || ''}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Información Financiera</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="asking_price" className="block text-sm font-medium text-gray-700">
              Precio de Venta *
            </label>
            <input
              type="number"
              name="asking_price"
              id="asking_price"
              value={formData.asking_price || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.asking_price
                  ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            />
            {errors.asking_price && (
              <p className="mt-1 text-sm text-error-600">{errors.asking_price}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Moneda
            </label>
            <select
              name="currency"
              id="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="PEN">PEN (Soles)</option>
              <option value="USD">USD (Dólares)</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="ACTIVE">Activa</option>
              <option value="UNDER_OFFER">En Oferta</option>
              <option value="SOLD">Vendida</option>
              <option value="WITHDRAWN">Retirada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Describe la propiedad, sus características especiales, ubicación, etc."
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            images={formData.images || []}
            onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
            maxImages={10}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : property ? 'Actualizar' : 'Crear Propiedad'}
        </button>
      </div>
    </form>
  );
}
