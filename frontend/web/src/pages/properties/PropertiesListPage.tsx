import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { Property, PropertyStatus } from '../../types/property';
import { propertiesService } from '../../services/properties';

export default function PropertiesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertiesService.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Error al cargar las propiedades');
    } finally {
      setIsLoading(false);
    }
  };


  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          onClick={loadProperties}
          className="mt-2 text-sm font-medium text-error-600 hover:text-error-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todas tus propiedades en un solo lugar
          </p>
        </div>
        <Link
          to="/properties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Nueva Propiedad
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por dirección, distrito o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'ALL')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activa</option>
              <option value="UNDER_OFFER">En Oferta</option>
              <option value="SOLD">Vendida</option>
              <option value="WITHDRAWN">Retirada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Property Image Placeholder */}
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <HomeIcon className="h-16 w-16 text-gray-400" />
              </div>

              {/* Property Details */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {property.address}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {property.district}, {property.city}
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeColor(
                      property.status
                    )}`}
                  >
                    {getStatusLabel(property.status)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    S/ {property.asking_price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getPropertyTypeLabel(property.property_type)}
                  </p>
                </div>

                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  {property.bedrooms && (
                    <span>{property.bedrooms} hab.</span>
                  )}
                  {property.bathrooms && (
                    <span>{property.bathrooms} baños</span>
                  )}
                  {property.area_sqm && (
                    <span>{property.area_sqm} m²</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay propiedades
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No se encontraron propiedades con los filtros seleccionados'
              : 'Comienza creando tu primera propiedad'}
          </p>
          {!searchQuery && statusFilter === 'ALL' && (
            <div className="mt-6">
              <Link
                to="/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nueva Propiedad
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
