import { ChartBarIcon, TrendingUpIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const stats = [
    {
      name: 'Propiedades Totales',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: HomeIcon,
    },
    {
      name: 'Ventas Este Mes',
      value: '8',
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUpIcon,
    },
    {
      name: 'Valor Promedio',
      value: 'S/ 485K',
      change: '+8%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Tiempo Promedio',
      value: '45 días',
      change: '-5 días',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
  ];

  const topProperties = [
    { address: 'Malecón Cisneros 567, Miraflores', value: 890000, status: 'ACTIVE', daysListed: 12 },
    { address: 'Calle Los Tulipanes 123, Miraflores', value: 680000, status: 'ACTIVE', daysListed: 8 },
    { address: 'Jr. Las Orquídeas 789, La Molina', value: 520000, status: 'SOLD', daysListed: 32 },
    { address: 'Av. Conquistadores 456, San Isidro', value: 450000, status: 'ACTIVE', daysListed: 15 },
    { address: 'Av. Arequipa 2341, Lince', value: 320000, status: 'ACTIVE', daysListed: 22 },
  ];

  const monthlyData = [
    { month: 'Jul', ventas: 5, valor: 2100000 },
    { month: 'Ago', ventas: 7, valor: 3200000 },
    { month: 'Sep', ventas: 6, valor: 2800000 },
    { month: 'Oct', ventas: 4, valor: 1900000 },
    { month: 'Nov', ventas: 9, valor: 4100000 },
    { month: 'Dic', ventas: 11, valor: 5300000 },
    { month: 'Ene', ventas: 8, valor: 3900000 },
  ];

  const maxVentas = Math.max(...monthlyData.map(d => d.ventas));
  const maxValor = Math.max(...monthlyData.map(d => d.valor));

  const performanceMetrics = [
    { label: 'Tasa de Conversión', value: '68%', target: '65%', status: 'success' },
    { label: 'Satisfacción Cliente', value: '4.8/5', target: '4.5/5', status: 'success' },
    { label: 'Tiempo Respuesta', value: '2.3h', target: '< 4h', status: 'success' },
    { label: 'Propiedades Activas', value: '18', target: '15+', status: 'success' },
  ];

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
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                      }`}>
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
          <div className="space-y-3">
            {monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <span className="text-gray-500">{data.ventas} ventas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(data.ventas / maxVentas) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Valor Total Mensual</h2>
          <div className="space-y-3">
            {monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <span className="text-gray-500">S/ {(data.valor / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full transition-all"
                    style={{ width: `${(data.valor / maxValor) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Properties */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Propiedades Destacadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días Publicado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProperties.map((property, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {property.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    S/ {property.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      property.status === 'SOLD'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-primary-100 text-primary-800'
                    }`}>
                      {property.status === 'SOLD' ? 'Vendida' : 'Activa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.daysListed} días
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Métricas de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm font-medium text-gray-500 mb-2">{metric.label}</div>
              <div className="text-xs text-success-600">
                ✓ Meta: {metric.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-primary-900 mb-3">Insights Clave</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li className="flex items-start">
            <span className="mr-2">📈</span>
            <span>Las propiedades en Miraflores se venden 30% más rápido que el promedio</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💰</span>
            <span>El precio promedio ha aumentado 8% en los últimos 3 meses</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⏱️</span>
            <span>Tu tiempo de respuesta es 40% mejor que el promedio del mercado</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Tasa de conversión superior a la meta establecida (+3%)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
