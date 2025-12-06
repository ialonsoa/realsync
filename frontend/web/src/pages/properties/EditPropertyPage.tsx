import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PropertyForm from '../../components/properties/PropertyForm';
import { CreatePropertyInput, Property } from '../../types/property';
import { propertiesService } from '../../services/properties';

export default function EditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await propertiesService.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Error al cargar la propiedad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreatePropertyInput) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await propertiesService.updateProperty({ id, ...data });
      navigate(`/properties/${id}`);
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error al actualizar la propiedad. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/properties/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <p className="text-error-800">{error || 'Propiedad no encontrada'}</p>
        <button
          onClick={() => navigate('/properties')}
          className="mt-2 text-sm font-medium text-error-600 hover:text-error-700"
        >
          Volver a propiedades
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/properties/${id}`)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Propiedad</h1>
          <p className="mt-1 text-sm text-gray-500">{property.address}</p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm
        property={property}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
