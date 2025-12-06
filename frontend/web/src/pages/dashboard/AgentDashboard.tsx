import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ClockIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { propertiesService } from '../../services/properties';

export default function AgentDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesService.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Propiedades Activas',
      value: properties?.length || 0,
      icon: HomeIcon,
      color: 'bg-primary-500',
    },
    {
      name: 'En Proceso',
      value: properties?.filter((p: any) => p.status === 'ACTIVE').length || 0,
      icon: ClockIcon,
      color: 'bg-warning-500',
    },
    {
      name: 'Completadas',
      value: properties?.filter((p: any) => p.status === 'SOLD').length || 0,
      icon: CheckCircleIcon,
      color: 'bg-success-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline de Propiedades</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona todas tus propiedades y transacciones en un solo lugar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Propiedades Recientes</h2>
          <Link
            to="/properties"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Ver todas
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {properties && properties.length > 0 ? (
            properties.map((property: any) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {property.address}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {property.city} • S/ {property.asking_price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        property.status === 'ACTIVE'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay propiedades
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primera propiedad
              </p>
              <div className="mt-6">
                <Link
                  to="/properties/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Nueva Propiedad
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
