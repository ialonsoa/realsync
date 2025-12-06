import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import {
  getCompleteProfile,
  getUserRoleProfiles,
  setPrimaryRole
} from '@/lib/profileApi';
import type {
  UserProfile,
  RoleProfile,
  AgentProfile,
  BuyerProfile,
  OwnerProfile
} from '@/types/profile';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  HomeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ViewProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<RoleProfile[]>([]);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get complete profile
      const completeProfile = await getCompleteProfile(user!.id);

      if (completeProfile) {
        setProfile(completeProfile);
      }

      // Get role profiles
      const roleProfiles = await getUserRoleProfiles(user!.id);
      setRoles(roleProfiles);

      // Set role-specific profiles from roleProfiles array
      if (completeProfile?.roleProfiles) {
        for (const roleProfile of completeProfile.roleProfiles) {
          if (roleProfile.role_type === 'AGENT' && (roleProfile as any).agentProfile) {
            setAgentProfile((roleProfile as any).agentProfile);
          }
          if (roleProfile.role_type === 'BUYER' && (roleProfile as any).buyerProfile) {
            setBuyerProfile((roleProfile as any).buyerProfile);
          }
          if (roleProfile.role_type === 'OWNER' && (roleProfile as any).ownerProfile) {
            setOwnerProfile((roleProfile as any).ownerProfile);
          }
        }
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryRole = async (roleId: string, roleType: string) => {
    try {
      await setPrimaryRole(user!.id, roleId);
      toast.success(`Rol principal cambiado a ${roleType}`);
      loadProfile(); // Reload to update UI
    } catch (error) {
      console.error('Error setting primary role:', error);
      toast.error('Error al cambiar el rol principal');
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'AGENT':
        return BriefcaseIcon;
      case 'OWNER':
        return HomeIcon;
      case 'BUYER':
        return ShoppingBagIcon;
      default:
        return UserCircleIcon;
    }
  };

  const getRoleLabel = (roleType: string) => {
    switch (roleType) {
      case 'AGENT':
        return 'Agente';
      case 'OWNER':
        return 'Propietario';
      case 'BUYER':
        return 'Comprador';
      default:
        return roleType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay perfil</h3>
          <p className="mt-1 text-sm text-gray-500">
            Necesitas crear un perfil para empezar
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/profile/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Crear Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tu información personal y preferencias
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/profile/edit')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            Editar
          </button>
          <button
            onClick={() => navigate('/profile/privacy')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Privacidad
          </button>
        </div>
      </div>

      {/* Profile Photo & Basic Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.full_name}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <UserCircleIcon className="h-20 w-20 text-gray-400" />
              </div>
            )}
            <div className="ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-sm text-gray-500">
                Miembro desde {new Date(profile.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center text-gray-700">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center text-gray-700">
                <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                <span>{profile.phone}</span>
                {profile.phone_verified && (
                  <CheckBadgeIcon className="h-5 w-5 ml-2 text-green-500" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roles Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Roles</h3>
        {roles.length === 0 ? (
          <p className="text-sm text-gray-500">No tienes roles asignados</p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = getRoleIcon(role.role_type);
              return (
                <div
                  key={role.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    role.is_primary
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-6 w-6 mr-3 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{getRoleLabel(role.role_type)}</p>
                      {role.is_primary && (
                        <p className="text-xs text-primary-600">Rol Principal</p>
                      )}
                    </div>
                  </div>
                  {!role.is_primary && (
                    <button
                      onClick={() => handleSetPrimaryRole(role.id, getRoleLabel(role.role_type))}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Hacer Principal
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent Profile Details */}
      {agentProfile && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Perfil de Agente</h3>
            {agentProfile.verification_status === 'VERIFIED' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckBadgeIcon className="h-4 w-4 mr-1" />
                Verificado
              </span>
            )}
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Licencia</dt>
              <dd className="mt-1 text-sm text-gray-900">{agentProfile.license_number || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Años de experiencia</dt>
              <dd className="mt-1 text-sm text-gray-900">{agentProfile.years_experience || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Agencia</dt>
              <dd className="mt-1 text-sm text-gray-900">{agentProfile.brokerage_name || 'Independiente'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Regiones</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {agentProfile.service_regions?.join(', ') || 'No especificado'}
              </dd>
            </div>
            {agentProfile.expertise_areas && agentProfile.expertise_areas.length > 0 && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Áreas de Experiencia</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {agentProfile.expertise_areas.map((area: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {area}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Buyer Profile Details */}
      {buyerProfile && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil de Comprador</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Presupuesto</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {buyerProfile.budget_min && buyerProfile.budget_max
                  ? `$${buyerProfile.budget_min.toLocaleString()} - $${buyerProfile.budget_max.toLocaleString()}`
                  : 'No especificado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo de propiedad</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {buyerProfile.property_types_interested?.join(', ') || 'No especificado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ubicaciones preferidas</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {buyerProfile.preferred_locations?.join(', ') || 'No especificado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Financiamiento</dt>
              <dd className="mt-1 text-sm text-gray-900">{buyerProfile.financing_status || 'No especificado'}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Owner Profile Details */}
      {ownerProfile && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil de Propietario</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Propiedades en venta</dt>
              <dd className="mt-1 text-sm text-gray-900">{ownerProfile.properties_count || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Línea de tiempo</dt>
              <dd className="mt-1 text-sm text-gray-900">{ownerProfile.selling_timeline || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Método de contacto preferido</dt>
              <dd className="mt-1 text-sm text-gray-900">{ownerProfile.preferred_contact_method || 'No especificado'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
