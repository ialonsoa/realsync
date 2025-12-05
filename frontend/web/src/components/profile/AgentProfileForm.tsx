import { PERU_REGIONS, EXPERTISE_AREAS } from '../../types/profile';
import type { CreateAgentProfileData } from '../../types/profile';

interface AgentProfileFormProps {
  data: CreateAgentProfileData;
  onChange: (data: CreateAgentProfileData) => void;
}

export default function AgentProfileForm({ data, onChange }: AgentProfileFormProps) {
  const handleInputChange = (field: keyof CreateAgentProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleRegion = (region: string) => {
    const current = data.service_regions || [];
    if (current.includes(region)) {
      handleInputChange(
        'service_regions',
        current.filter((r) => r !== region)
      );
    } else {
      handleInputChange('service_regions', [...current, region]);
    }
  };

  const toggleExpertise = (area: string) => {
    const current = data.expertise_areas || [];
    if (current.includes(area)) {
      handleInputChange(
        'expertise_areas',
        current.filter((a) => a !== area)
      );
    } else {
      handleInputChange('expertise_areas', [...current, area]);
    }
  };

  return (
    <div className="space-y-6">
      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Licencia
        </label>
        <input
          type="text"
          value={data.license_number || ''}
          onChange={(e) => handleInputChange('license_number', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="ABC12345678"
        />
        <p className="mt-1 text-sm text-gray-500">
          Tu licencia será verificada por nuestro equipo
        </p>
      </div>

      {/* Brokerage Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Inmobiliaria
        </label>
        <input
          type="text"
          value={data.brokerage_name || ''}
          onChange={(e) => handleInputChange('brokerage_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nombre de la inmobiliaria"
        />
      </div>

      {/* Years of Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Años de Experiencia
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={data.years_experience || ''}
          onChange={(e) =>
            handleInputChange('years_experience', parseInt(e.target.value) || 0)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Service Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Regiones de Servicio
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Selecciona las regiones donde ofreces tus servicios
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
          {PERU_REGIONS.map((region) => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.service_regions || []).includes(region)}
                onChange={() => toggleRegion(region)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Expertise Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Áreas de Especialización
        </label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERTISE_AREAS.map((area) => (
            <label key={area.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.expertise_areas || []).includes(area.value)}
                onChange={() => toggleExpertise(area.value)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{area.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Biografía Profesional
        </label>
        <textarea
          value={data.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Cuéntanos sobre tu experiencia y lo que te hace destacar como agente inmobiliario..."
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sitio Web
        </label>
        <input
          type="url"
          value={data.website_url || ''}
          onChange={(e) => handleInputChange('website_url', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://www.ejemplo.com"
        />
      </div>
    </div>
  );
}
