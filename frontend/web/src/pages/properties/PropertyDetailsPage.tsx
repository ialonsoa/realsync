import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Property, PropertyStatus } from '../../types/property';
import { propertiesService } from '../../services/properties';

export default function PropertyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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


  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      try {
        await propertiesService.deleteProperty(id);
        navigate('/properties');
      } catch (error) {
        console.error('Error deleting property:', error);
        setError('Error al eliminar la propiedad');
      }
    }
  };

  const getStatusBadgeColor = (status: PropertyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800';
      case 'UNDER_OFFER':
        return 'bg-warning-100 text-warning-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      case 'WITHDRAWN':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PropertyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'UNDER_OFFER':
        return 'En Oferta';
      case 'SOLD':
        return 'Vendida';
      case 'WITHDRAWN':
        return 'Retirada';
      default:
        return status;
    }
  };

  const getPropertyTypeLabel = (type?: string) => {
    switch (type) {
      case 'house':
        return 'Casa';
      case 'apartment':
        return 'Departamento';
      case 'land':
        return 'Terreno';
      case 'commercial':
        return 'Comercial';
      default:
        return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <p className="text-error-800">{error}</p>
        <button
          onClick={loadProperty}
          className="mt-2 text-sm font-medium text-error-600 hover:text-error-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Propiedad no encontrada</h3>
        <div className="mt-6">
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Volver a Propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/properties')}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {property.district}, {property.city}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/properties/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="md:col-span-2">
              <img
                src={property.images[0]}
                alt="Main property image"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            {property.images.slice(1).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Property image ${index + 2}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 h-96 flex items-center justify-center">
            <div className="text-center">
              <HomeIcon className="mx-auto h-24 w-24 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Sin imágenes disponibles</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Información General</h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                  property.status
                )}`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {getPropertyTypeLabel(property.property_type)}
                </p>
              </div>
              {property.bedrooms && (
                <div>
                  <p className="text-sm text-gray-500">Habitaciones</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <p className="text-sm text-gray-500">Baños</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{property.bathrooms}</p>
                </div>
              )}
              {property.area_sqm && (
                <div>
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{property.area_sqm} m²</p>
                </div>
              )}
              {property.parking_spaces !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Estacionamientos</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {property.parking_spaces}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Descripción</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Características</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary-600"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Ubicación</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Dirección:</span> {property.address}
              </p>
              {property.district && (
                <p className="text-gray-700">
                  <span className="font-medium">Distrito:</span> {property.district}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-medium">Ciudad:</span> {property.city}
              </p>
              {property.region && (
                <p className="text-gray-700">
                  <span className="font-medium">Región:</span> {property.region}
                </p>
              )}
              {property.postal_code && (
                <p className="text-gray-700">
                  <span className="font-medium">Código Postal:</span> {property.postal_code}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Precio</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {property.currency === 'USD' ? '$' : 'S/'}{' '}
              {property.asking_price.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500">{property.currency}</p>
          </div>

          {/* Property Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">ID de Propiedad</dt>
                <dd className="mt-1 font-medium text-gray-900">{property.id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fecha de Creación</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {new Date(property.created_at).toLocaleDateString('es-PE')}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Última Actualización</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {new Date(property.updated_at).toLocaleDateString('es-PE')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
