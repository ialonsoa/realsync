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
  OwnerProfile
} from '@/types/profile';
import { UserCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
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

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const completeProfile = await getCompleteProfile(user!.id);

      if (completeProfile.userProfile) {
        setProfile(completeProfile.userProfile);
        setBasicFormData({
          full_name: completeProfile.userProfile.full_name || '',
          phone: completeProfile.userProfile.phone || '',
          bio: completeProfile.userProfile.bio || '',
          profile_photo_url: completeProfile.userProfile.profile_photo_url || '',
        });
        setPhotoPreview(completeProfile.userProfile.profile_photo_url || '');
      }

      setAgentProfile(completeProfile.agentProfile || null);
      setBuyerProfile(completeProfile.buyerProfile || null);
      setOwnerProfile(completeProfile.ownerProfile || null);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);

      // Upload photo if changed
      let photoUrl = basicFormData.profile_photo_url;
      if (photoFile) {
        photoUrl = await uploadProfilePhoto(user!.id, photoFile);
      }

      // Update profile
      await updateUserProfile(user!.id, {
        full_name: basicFormData.full_name,
        phone: basicFormData.phone,
        bio: basicFormData.bio,
        profile_photo_url: photoUrl,
      });

      toast.success('Perfil actualizado correctamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgentProfile = async (data: Partial<AgentProfile>) => {
    if (!agentProfile) return;

    try {
      setSaving(true);
      await updateAgentProfile(agentProfile.id, data);
      toast.success('Perfil de agente actualizado');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving agent profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBuyerProfile = async (data: Partial<BuyerProfile>) => {
    if (!buyerProfile) return;

    try {
      setSaving(true);
      await updateBuyerProfile(buyerProfile.id, data);
      toast.success('Perfil de comprador actualizado');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving buyer profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOwnerProfile = async (data: Partial<OwnerProfile>) => {
    if (!ownerProfile) return;

    try {
      setSaving(true);
      await updateOwnerProfile(ownerProfile.id, data);
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
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de Perfil
                </label>
                <div className="flex items-center space-x-6">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    Cambiar Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <BasicInfoForm
                formData={basicFormData}
                onChange={setBasicFormData}
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
                onSubmit={handleSaveAgentProfile}
                initialData={agentProfile}
                isEditing={true}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Buyer Profile Tab */}
          {activeTab === 'buyer' && buyerProfile && (
            <div className="space-y-6">
              <BuyerProfileForm
                onSubmit={handleSaveBuyerProfile}
                initialData={buyerProfile}
                isEditing={true}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Owner Profile Tab */}
          {activeTab === 'owner' && ownerProfile && (
            <div className="space-y-6">
              <OwnerProfileForm
                onSubmit={handleSaveOwnerProfile}
                initialData={ownerProfile}
                isEditing={true}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
