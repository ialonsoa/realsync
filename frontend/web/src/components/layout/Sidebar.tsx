import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CalculatorIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';

export default function Sidebar() {
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['AGENT', 'OWNER', 'BUYER'] },
    { name: 'Timeline', href: '/timeline', icon: ClockIcon, roles: ['AGENT', 'OWNER', 'BUYER'] },
    { name: 'Documentos', href: '/documents', icon: DocumentTextIcon, roles: ['AGENT', 'OWNER', 'BUYER'] },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, roles: ['AGENT', 'OWNER', 'BUYER'] },
    { name: 'Estimador', href: '/estimator', icon: CalculatorIcon, roles: ['AGENT', 'OWNER'] },
    { name: 'Analíticas', href: '/analytics', icon: ChartBarIcon, roles: ['AGENT', 'ADMIN_AGENCY'] },
  ];

  const bottomNavigation = [
    { name: 'Planes y Precios', href: '/pricing', icon: SparklesIcon, highlight: true },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-primary-600">RealSync</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </NavLink>
            ))}

            {/* Separator */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Bottom Navigation */}
            {bottomNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.highlight
                      ? isActive
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                        : 'bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600'
                      : isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
                {user?.subscription_tier === 'free' && (
                  <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded">
                    Upgrade
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
