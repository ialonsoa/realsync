import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import {
  getCompleteProfile,
  updateUserProfile,
  updateAgentProfile,
  updateBuyerProfile,
  updateOwnerProfile,
  uploadProfilePhoto
} from '@/lib/profileApi';
import type {
  UserProfile,
  AgentProfile,
  BuyerProfile,
  OwnerProfile,
  CreateAgentProfileData,
  CreateBuyerProfileData,
  CreateOwnerProfileData
} from '@/types/profile';
import toast from 'react-hot-toast';
import BasicInfoForm from '@/components/profile/BasicInfoForm';
import AgentProfileForm from '@/components/profile/AgentProfileForm';
import BuyerProfileForm from '@/components/profile/BuyerProfileForm';
import OwnerProfileForm from '@/components/profile/OwnerProfileForm';

export default function EditProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'agent' | 'buyer' | 'owner'>('basic');

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);

  // Form data
  const [basicFormData, setBasicFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    profile_photo_url: '',
  });

  const [agentFormData, setAgentFormData] = useState<CreateAgentProfileData>({});
  const [buyerFormData, setBuyerFormData] = useState<CreateBuyerProfileData>({});
  const [ownerFormData, setOwnerFormData] = useState<CreateOwnerProfileData>({});

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const completeProfile = await getCompleteProfile(user!.id);

      if (completeProfile) {
        setProfile(completeProfile);
        setBasicFormData({
          full_name: completeProfile.full_name || '',
          phone: completeProfile.phone || '',
          bio: '',
          profile_photo_url: completeProfile.profile_photo_url || '',
        });

        // Extract role-specific profiles from roleProfiles array
        if (completeProfile.roleProfiles) {
          for (const roleProfile of completeProfile.roleProfiles) {
            if (roleProfile.role_type === 'AGENT' && (roleProfile as any).agentProfile) {
              const agentData = (roleProfile as any).agentProfile;
              setAgentProfile(agentData);
              setAgentFormData({
                license_number: agentData.license_number,
                brokerage_name: agentData.brokerage_name,
                service_regions: agentData.service_regions,
                expertise_areas: agentData.expertise_areas,
                years_experience: agentData.years_experience,
                bio: agentData.bio,
                website_url: agentData.website_url,
              });
            }
            if (roleProfile.role_type === 'BUYER' && (roleProfile as any).buyerProfile) {
              const buyerData = (roleProfile as any).buyerProfile;
              setBuyerProfile(buyerData);
              setBuyerFormData({
                property_types_interested: buyerData.property_types_interested,
                preferred_locations: buyerData.preferred_locations,
                budget_min: buyerData.budget_min,
                budget_max: buyerData.budget_max,
                financing_status: buyerData.financing_status,
                urgency_level: buyerData.urgency_level,
                notes: buyerData.notes,
              });
            }
            if (roleProfile.role_type === 'OWNER' && (roleProfile as any).ownerProfile) {
              const ownerData = (roleProfile as any).ownerProfile;
              setOwnerProfile(ownerData);
              setOwnerFormData({
                properties_count: ownerData.properties_count,
                property_types_owned: ownerData.property_types_owned,
                selling_timeline: ownerData.selling_timeline,
                preferred_contact_method: ownerData.preferred_contact_method,
                notes: ownerData.notes,
              });
            }
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

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);

      // Upload photo if changed
      let photoUrl = basicFormData.profile_photo_url;
      if (photoFile) {
        const newPhotoUrl = await uploadProfilePhoto(user!.id, photoFile);
        if (newPhotoUrl) {
          photoUrl = newPhotoUrl;
        }
      }

      // Update profile (without bio as it's not part of UserProfile)
      await updateUserProfile(user!.id, {
        full_name: basicFormData.full_name,
        phone: basicFormData.phone,
      });

      // Refresh the user profile in the auth store to update the sidebar
      await useAuthStore.getState().refreshProfile();

      toast.success('Perfil actualizado correctamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgentProfile = async () => {
    if (!agentProfile) return;

    try {
      setSaving(true);
      await updateAgentProfile(agentProfile.id, agentFormData);
      toast.success('Perfil de agente actualizado');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving agent profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBuyerProfile = async () => {
    if (!buyerProfile) return;

    try {
      setSaving(true);
      await updateBuyerProfile(buyerProfile.id, buyerFormData);
      toast.success('Perfil de comprador actualizado');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving buyer profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOwnerProfile = async () => {
    if (!ownerProfile) return;

    try {
      setSaving(true);
      await updateOwnerProfile(ownerProfile.id, ownerFormData);
      toast.success('Perfil de propietario actualizado');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving owner profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
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
          <p className="text-gray-600">No se encontró el perfil</p>
          <button
            onClick={() => navigate('/profile/create')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Crear Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Actualiza tu información personal y preferencias
          </p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'basic'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información Básica
            </button>
            {agentProfile && (
              <button
                onClick={() => setActiveTab('agent')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'agent'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfil de Agente
              </button>
            )}
            {buyerProfile && (
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'buyer'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfil de Comprador
              </button>
            )}
            {ownerProfile && (
              <button
                onClick={() => setActiveTab('owner')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'owner'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfil de Propietario
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <BasicInfoForm
                data={{
                  full_name: basicFormData.full_name,
                  phone: basicFormData.phone,
                  preferred_language: 'es'
                }}
                onChange={(newData) => setBasicFormData({ ...basicFormData, ...newData })}
                profilePhoto={photoFile}
                onPhotoChange={setPhotoFile}
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBasicInfo}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Agent Profile Tab */}
          {activeTab === 'agent' && agentProfile && (
            <div className="space-y-6">
              <AgentProfileForm
                data={agentFormData}
                onChange={setAgentFormData}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAgentProfile}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Buyer Profile Tab */}
          {activeTab === 'buyer' && buyerProfile && (
            <div className="space-y-6">
              <BuyerProfileForm
                data={buyerFormData}
                onChange={setBuyerFormData}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBuyerProfile}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Owner Profile Tab */}
          {activeTab === 'owner' && ownerProfile && (
            <div className="space-y-6">
              <OwnerProfileForm
                data={ownerFormData}
                onChange={setOwnerFormData}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveOwnerProfile}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
