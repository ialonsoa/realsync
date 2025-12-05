import { PROPERTY_TYPES } from '../../types/profile';
import type { CreateOwnerProfileData, SellingTimeline, PreferredContactMethod } from '../../types/profile';

interface OwnerProfileFormProps {
  data: CreateOwnerProfileData;
  onChange: (data: CreateOwnerProfileData) => void;
}

export default function OwnerProfileForm({ data, onChange }: OwnerProfileFormProps) {
  const handleInputChange = (field: keyof CreateOwnerProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const togglePropertyType = (type: string) => {
    const current = data.property_types_owned || [];
    if (current.includes(type)) {
      handleInputChange(
        'property_types_owned',
        current.filter((t) => t !== type)
      );
    } else {
      handleInputChange('property_types_owned', [...current, type]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Properties Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Propiedades
        </label>
        <input
          type="number"
          min="0"
          value={data.properties_count || ''}
          onChange={(e) =>
            handleInputChange('properties_count', parseInt(e.target.value) || 0)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          placeholder="¿Cuántas propiedades tienes?"
        />
      </div>

      {/* Property Types Owned */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipos de Propiedades que Posees
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((type) => (
            <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.property_types_owned || []).includes(type.value)}
                onChange={() => togglePropertyType(type.value)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Selling Timeline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cronograma de Venta
        </label>
        <select
          value={data.selling_timeline || 'EXPLORING'}
          onChange={(e) =>
            handleInputChange('selling_timeline', e.target.value as SellingTimeline)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="IMMEDIATE">Inmediato</option>
          <option value="WITHIN_3_MONTHS">Dentro de 3 meses</option>
          <option value="WITHIN_6_MONTHS">Dentro de 6 meses</option>
          <option value="WITHIN_YEAR">Dentro de un año</option>
          <option value="EXPLORING">Solo explorando opciones</option>
        </select>
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Contacto Preferido
        </label>
        <select
          value={data.preferred_contact_method || 'EMAIL'}
          onChange={(e) =>
            handleInputChange('preferred_contact_method', e.target.value as PreferredContactMethod)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="EMAIL">Email</option>
          <option value="PHONE">Teléfono</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="SMS">SMS</option>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          placeholder="Información adicional sobre tus propiedades o intenciones de venta..."
        />
      </div>
    </div>
  );
}
