import { UserIcon, HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { RoleType } from '../../types/profile';

interface RoleSelectorProps {
  selectedRole: RoleType | null;
  onSelectRole: (role: RoleType) => void;
}

const roles = [
  {
    type: 'AGENT' as RoleType,
    title: 'Agente Inmobiliario',
    description: 'Profesional del sector inmobiliario que ayuda a clientes a comprar y vender propiedades',
    icon: UserIcon,
    color: 'blue',
  },
  {
    type: 'BUYER' as RoleType,
    title: 'Comprador',
    description: 'Estoy buscando comprar una propiedad en Perú',
    icon: HomeIcon,
    color: 'green',
  },
  {
    type: 'OWNER' as RoleType,
    title: 'Propietario',
    description: 'Tengo propiedades que deseo vender',
    icon: BuildingOfficeIcon,
    color: 'purple',
  },
];

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.type;

        return (
          <button
            key={role.type}
            onClick={() => onSelectRole(role.type)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-200 text-left
              ${
                isSelected
                  ? `border-${role.color}-600 bg-${role.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {isSelected && (
              <div className="absolute top-4 right-4">
                <div className={`w-6 h-6 bg-${role.color}-600 rounded-full flex items-center justify-center`}>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}

            <Icon className={`h-12 w-12 mb-4 ${isSelected ? `text-${role.color}-600` : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
            <p className="text-sm text-gray-600">{role.description}</p>
          </button>
        );
      })}
    </div>
  );
}
