import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getCompleteAnalytics } from '../../services/analytics';
import type { CompleteAnalytics } from '../../types/analytics';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CompleteAnalytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getCompleteAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando propiedades para ver analíticas
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Propiedades Totales',
      value: analytics.stats.total_properties.toString(),
      change: `${analytics.stats.active_properties} activas`,
      changeType: 'neutral',
      icon: HomeIcon,
    },
    {
      name: 'Ventas Este Mes',
      value: analytics.stats.sales_this_month.toString(),
      change: `${analytics.stats.sold_properties} total`,
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Precio Promedio',
      value: `S/ ${(analytics.stats.average_price / 1000).toFixed(0)}K`,
      change: analytics.stats.average_price > 0 ? 'Activo' : 'N/A',
      changeType: 'neutral',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Tiempo Promedio',
      value: analytics.stats.average_days_to_sell > 0 ? `${analytics.stats.average_days_to_sell} días` : 'N/A',
      change: analytics.stats.sold_properties > 0 ? 'Vendidas' : 'Sin ventas',
      changeType: 'neutral',
      icon: ChartBarIcon,
    },
  ];

  const maxSalesCount =
    analytics.monthly_sales.length > 0
      ? Math.max(...analytics.monthly_sales.map((d) => d.sales_count))
      : 1;
  const maxSalesValue =
    analytics.monthly_sales.length > 0
      ? Math.max(...analytics.monthly_sales.map((d) => d.total_value))
      : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Métricas de rendimiento y estadísticas de tu cartera de propiedades
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-success-600'
                            : stat.changeType === 'negative'
                            ? 'text-danger-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ventas Mensuales</h2>
          {analytics.monthly_sales.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthly_sales.map((data) => (
                <div key={data.month}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{data.month}</span>
                    <span className="text-gray-500">
                      {data.sales_count} {data.sales_count === 1 ? 'venta' : 'ventas'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${(data.sales_count / maxSalesCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay ventas registradas aún
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Valor Total Mensual</h2>
          {analytics.monthly_sales.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthly_sales.map((data) => (
                <div key={data.month}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{data.month}</span>
                    <span className="text-gray-500">
                      S/ {data.total_value > 0 ? (data.total_value / 1000000).toFixed(1) : '0'}M
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success-500 h-2 rounded-full transition-all"
                      style={{ width: `${(data.total_value / maxSalesValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay datos de ingresos aún
            </div>
          )}
        </div>
      </div>

      {/* Top Properties */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Propiedades Destacadas</h2>
        </div>
        {analytics.top_properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.top_properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {property.address}
                      {property.district && (
                        <span className="block text-xs text-gray-500">{property.district}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      S/ {property.asking_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'SOLD'
                            ? 'bg-success-100 text-success-800'
                            : property.status === 'UNDER_OFFER'
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-primary-100 text-primary-800'
                        }`}
                      >
                        {property.status === 'SOLD'
                          ? 'Vendida'
                          : property.status === 'UNDER_OFFER'
                          ? 'En Oferta'
                          : 'Activa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.days_listed} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{property.progress_percentage}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${property.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No hay propiedades para mostrar
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Métricas de Rendimiento</h2>
        {analytics.performance_metrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.performance_metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-gray-500 mb-2">{metric.label}</div>
                <div
                  className={`text-xs ${
                    metric.status === 'success'
                      ? 'text-success-600'
                      : metric.status === 'warning'
                      ? 'text-warning-600'
                      : 'text-danger-600'
                  }`}
                >
                  {metric.status === 'success' ? '✓' : metric.status === 'warning' ? '⚠' : '✗'} Meta:{' '}
                  {metric.target}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No hay suficientes datos para calcular métricas
          </div>
        )}
      </div>

      {/* District Insights */}
      {analytics.district_insights.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Insights por Distrito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.district_insights.map((district) => (
              <div key={district.district} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{district.district}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Propiedades:</span> {district.property_count}
                  </p>
                  <p>
                    <span className="font-medium">Precio Promedio:</span> S/{' '}
                    {district.average_price.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Días Promedio:</span> {district.average_days_listed}{' '}
                    días
                  </p>
                  <p>
                    <span className="font-medium">Vendidas:</span> {district.sold_count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document & Timeline Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Analytics */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Documentos</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">
                {analytics.document_analytics.total_documents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verificados</span>
              <span className="font-semibold text-success-600">
                {analytics.document_analytics.verified_documents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="font-semibold text-warning-600">
                {analytics.document_analytics.pending_documents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Verificación</span>
              <span className="font-semibold text-primary-600">
                {analytics.document_analytics.verification_rate}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Analytics */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Actividad Timeline</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Eventos</span>
              <span className="font-semibold text-gray-900">
                {analytics.timeline_analytics.total_events}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-primary-600">
                {analytics.timeline_analytics.events_this_month}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Propiedades con Eventos</span>
              <span className="font-semibold text-gray-900">
                {analytics.timeline_analytics.properties_with_events}
              </span>
            </div>
            {analytics.timeline_analytics.most_common_event_type && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Evento Más Común</span>
                <span className="font-semibold text-gray-900 text-xs">
                  {analytics.timeline_analytics.most_common_event_type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {(analytics.district_insights.length > 0 || analytics.stats.total_properties > 0) && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-primary-900 mb-3">Insights Clave</h3>
          <ul className="space-y-2 text-sm text-primary-800">
            {analytics.district_insights.length > 0 && (
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>
                  Distrito con más propiedades: {analytics.district_insights[0].district} (
                  {analytics.district_insights[0].property_count} propiedades)
                </span>
              </li>
            )}
            {analytics.stats.total_value > 0 && (
              <li className="flex items-start">
                <span className="mr-2">💰</span>
                <span>
                  Valor total del portafolio: S/ {(analytics.stats.total_value / 1000000).toFixed(2)}M
                </span>
              </li>
            )}
            {analytics.stats.average_days_to_sell > 0 && (
              <li className="flex items-start">
                <span className="mr-2">⏱️</span>
                <span>
                  Tiempo promedio de venta: {analytics.stats.average_days_to_sell} días
                </span>
              </li>
            )}
            {analytics.performance_metrics.length > 0 &&
              analytics.performance_metrics[0].status === 'success' && (
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  <span>
                    Tasa de conversión {analytics.performance_metrics[0].value} supera la meta
                  </span>
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
}
