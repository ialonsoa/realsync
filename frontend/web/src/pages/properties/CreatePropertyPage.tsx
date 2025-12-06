import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PropertyForm from '../../components/properties/PropertyForm';
import { CreatePropertyInput } from '../../types/property';
import { propertiesService } from '../../services/properties';

export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePropertyInput) => {
    try {
      setIsLoading(true);
      const newProperty = await propertiesService.createProperty(data);
      navigate(`/properties/${newProperty.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error al crear la propiedad. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/properties')}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Propiedad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Completa la información de la propiedad
          </p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
    </div>
  );
}
