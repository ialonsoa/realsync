import { BellIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          Mis Propiedades
        </h2>
        <div className="flex items-center space-x-4">
          {/* Subscription Badge */}
          {user?.subscription_tier === 'free' ? (
            <Link
              to="/pricing"
              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-full hover:from-yellow-100 hover:to-orange-100 transition-all"
            >
              <SparklesIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700">Plan Free</span>
              <span className="text-xs text-yellow-600">→ Upgrade</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-primary-50 border border-purple-300 rounded-full">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">Plan Pro</span>
            </div>
          )}

          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
