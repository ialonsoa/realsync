import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { getPrivacySettings, updatePrivacySettings } from '@/lib/profileApi';
import type { ProfilePrivacySettings } from '@/types/profile';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PrivacySettings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ProfilePrivacySettings | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const privacySettings = await getPrivacySettings(user!.id);
      setSettings(privacySettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast.error('Error al cargar configuración de privacidad');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updatePrivacySettings(user!.id, settings);
      toast.success('Configuración de privacidad actualizada');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ProfilePrivacySettings>(
    key: K,
    value: ProfilePrivacySettings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">No se encontró la configuración de privacidad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Privacidad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Controla quién puede ver tu información personal
          </p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {/* Privacy Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Tu privacidad es importante
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Estas configuraciones te permiten controlar qué información es visible para otros usuarios.
              Los administradores pueden ver toda tu información para propósitos de verificación.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Visibility Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <PhoneIcon className="h-6 w-6 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visibilidad del Teléfono</h3>
            <p className="text-sm text-gray-500">Controla quién puede ver tu número de teléfono</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="phone_visibility"
              value="PUBLIC"
              checked={settings.phone_visibility === 'PUBLIC'}
              onChange={(e) => updateSetting('phone_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Público</span>
              </div>
              <p className="text-sm text-gray-500">Todos pueden ver tu teléfono</p>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="phone_visibility"
              value="CONTACTS_ONLY"
              checked={settings.phone_visibility === 'CONTACTS_ONLY'}
              onChange={(e) => updateSetting('phone_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Solo Contactos</span>
              </div>
              <p className="text-sm text-gray-500">Solo usuarios con los que has interactuado</p>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="phone_visibility"
              value="AGENTS_ONLY"
              checked={settings.phone_visibility === 'AGENTS_ONLY'}
              onChange={(e) => updateSetting('phone_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Solo Agentes Verificados</span>
              </div>
              <p className="text-sm text-gray-500">Solo agentes verificados pueden verlo</p>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="phone_visibility"
              value="HIDDEN"
              checked={settings.phone_visibility === 'HIDDEN'}
              onChange={(e) => updateSetting('phone_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeSlashIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Oculto</span>
              </div>
              <p className="text-sm text-gray-500">Nadie puede ver tu teléfono</p>
            </div>
          </label>
        </div>
      </div>

      {/* Email Visibility Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visibilidad del Email</h3>
            <p className="text-sm text-gray-500">Controla quién puede ver tu email</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="email_visibility"
              value="PUBLIC"
              checked={settings.email_visibility === 'PUBLIC'}
              onChange={(e) => updateSetting('email_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Público</span>
              </div>
              <p className="text-sm text-gray-500">Todos pueden ver tu email</p>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="email_visibility"
              value="HIDDEN"
              checked={settings.email_visibility === 'HIDDEN'}
              onChange={(e) => updateSetting('email_visibility', e.target.value as any)}
              className="h-4 w-4 text-primary-600"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <EyeSlashIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Oculto</span>
              </div>
              <p className="text-sm text-gray-500">Tu email no será visible</p>
            </div>
          </label>
        </div>
      </div>

      {/* Activity & Search Visibility */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Otras Configuraciones</h3>

        <div className="space-y-4">
          {/* Activity Visibility */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Mostrar Actividad</p>
                <p className="text-sm text-gray-500">
                  Permite que otros vean tu actividad reciente
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('show_activity', !settings.show_activity)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.show_activity ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.show_activity ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Search Visibility */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Aparecer en Búsquedas</p>
                <p className="text-sm text-gray-500">
                  Permite que otros te encuentren en búsquedas
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('show_in_search', !settings.show_in_search)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.show_in_search ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.show_in_search ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
