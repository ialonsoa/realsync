import { PROPERTY_TYPES, PERU_REGIONS } from '../../types/profile';
import type { CreateBuyerProfileData, FinancingStatus, UrgencyLevel } from '../../types/profile';

interface BuyerProfileFormProps {
  data: CreateBuyerProfileData;
  onChange: (data: CreateBuyerProfileData) => void;
}

export default function BuyerProfileForm({ data, onChange }: BuyerProfileFormProps) {
  const handleInputChange = (field: keyof CreateBuyerProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const togglePropertyType = (type: string) => {
    const current = data.property_types_interested || [];
    if (current.includes(type)) {
      handleInputChange(
        'property_types_interested',
        current.filter((t) => t !== type)
      );
    } else {
      handleInputChange('property_types_interested', [...current, type]);
    }
  };

  const toggleLocation = (location: string) => {
    const current = data.preferred_locations || [];
    if (current.includes(location)) {
      handleInputChange(
        'preferred_locations',
        current.filter((l) => l !== location)
      );
    } else {
      handleInputChange('preferred_locations', [...current, location]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Types Interested */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipos de Propiedades de Interés
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((type) => (
            <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.property_types_interested || []).includes(type.value)}
                onChange={() => togglePropertyType(type.value)}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferred Locations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicaciones Preferidas
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Selecciona las regiones donde buscas propiedad
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
          {PERU_REGIONS.map((region) => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.preferred_locations || []).includes(region)}
                onChange={() => toggleLocation(region)}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rango de Presupuesto (S/)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={data.budget_min || ''}
              onChange={(e) =>
                handleInputChange('budget_min', parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="100,000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Máximo</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={data.budget_max || ''}
              onChange={(e) =>
                handleInputChange('budget_max', parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="500,000"
            />
          </div>
        </div>
      </div>

      {/* Financing Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado de Financiamiento
        </label>
        <select
          value={data.financing_status || 'NOT_SPECIFIED'}
          onChange={(e) =>
            handleInputChange('financing_status', e.target.value as FinancingStatus)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        >
          <option value="NOT_SPECIFIED">No especificado</option>
          <option value="PRE_APPROVED">Pre-aprobado</option>
          <option value="CASH">Pago en efectivo</option>
          <option value="SEEKING_FINANCING">Buscando financiamiento</option>
        </select>
      </div>

      {/* Urgency Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel de Urgencia
        </label>
        <select
          value={data.urgency_level || 'RESEARCHING'}
          onChange={(e) =>
            handleInputChange('urgency_level', e.target.value as UrgencyLevel)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        >
          <option value="ACTIVELY_LOOKING">Buscando activamente</option>
          <option value="RESEARCHING">Investigando opciones</option>
          <option value="FUTURE_PLANNING">Planificando a futuro</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Adicionales
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          placeholder="Cualquier información adicional que quieras compartir sobre lo que buscas..."
        />
      </div>
    </div>
  );
}
