import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import {
  createRoleProfile,
  createAgentProfile,
  createBuyerProfile,
  createOwnerProfile,
  updateUserProfile,
  uploadProfilePhoto,
} from '../../lib/profileApi';
import type {
  RoleType,
  CreateAgentProfileData,
  CreateBuyerProfileData,
  CreateOwnerProfileData,
} from '../../types/profile';
import RoleSelector from '../../components/profile/RoleSelector';
import BasicInfoForm from '../../components/profile/BasicInfoForm';
import AgentProfileForm from '../../components/profile/AgentProfileForm';
import BuyerProfileForm from '../../components/profile/BuyerProfileForm';
import OwnerProfileForm from '../../components/profile/OwnerProfileForm';

export default function CreateProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [basicInfo, setBasicInfo] = useState({
    full_name: '',
    phone: '',
    preferred_language: 'es' as 'es' | 'en',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [roleSpecificData, setRoleSpecificData] = useState<
    CreateAgentProfileData | CreateBuyerProfileData | CreateOwnerProfileData
  >({});

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Update basic profile info
      await updateUserProfile(user.id, basicInfo);

      // Upload profile photo if provided
      if (profilePhoto) {
        await uploadProfilePhoto(user.id, profilePhoto);
      }

      // Create role profile
      const roleProfile = await createRoleProfile(user.id, selectedRole, true);
      if (!roleProfile) throw new Error('Failed to create role profile');

      // Create role-specific profile
      if (selectedRole === 'AGENT') {
        await createAgentProfile(
          roleProfile.id,
          roleSpecificData as CreateAgentProfileData
        );
      } else if (selectedRole === 'BUYER') {
        await createBuyerProfile(
          roleProfile.id,
          roleSpecificData as CreateBuyerProfileData
        );
      } else if (selectedRole === 'OWNER') {
        await createOwnerProfile(
          roleProfile.id,
          roleSpecificData as CreateOwnerProfileData
        );
      }

      toast.success('¡Perfil creado exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Error al crear perfil. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Crear tu Perfil
            </h2>
            <span className="text-sm text-gray-600">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Selecciona tu Rol
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Cómo planeas usar RealSync?
              </p>
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Información Básica
              </h3>
              <BasicInfoForm
                data={basicInfo}
                onChange={setBasicInfo}
                profilePhoto={profilePhoto}
                onPhotoChange={setProfilePhoto}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Completa tu Perfil
              </h3>
              {selectedRole === 'AGENT' && (
                <AgentProfileForm
                  data={roleSpecificData as CreateAgentProfileData}
                  onChange={setRoleSpecificData}
                />
              )}
              {selectedRole === 'BUYER' && (
                <BuyerProfileForm
                  data={roleSpecificData as CreateBuyerProfileData}
                  onChange={setRoleSpecificData}
                />
              )}
              {selectedRole === 'OWNER' && (
                <OwnerProfileForm
                  data={roleSpecificData as CreateOwnerProfileData}
                  onChange={setRoleSpecificData}
                />
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Atrás
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedRole) ||
                  (currentStep === 2 && !basicInfo.full_name)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando perfil...' : 'Completar Perfil'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
