import { useState } from 'react';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export default function EstimatorPage() {
  const [propertyValue, setPropertyValue] = useState('450000');
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { user } = useAuthStore();

  // Peru tax calculations
  const UIT_2024 = 5150; // UIT value for 2024 in Peru
  const propertyValueNum = parseFloat(propertyValue) || 0;

  // Alcabala (buyer pays): 3% of value exceeding 10 UIT
  const alcabalaExemption = 10 * UIT_2024;
  const alcabalaTaxable = Math.max(0, propertyValueNum - alcabalaExemption);
  const alcabala = alcabalaTaxable * 0.03;

  // Impuesto a la Renta (seller pays): 5% of sale value or 1.5% cost basis
  // For demo, using 5% simplified calculation
  const impuestoRenta = propertyValueNum * 0.05;

  // Notary and registry fees (estimated)
  const notaryFees = propertyValueNum * 0.01; // ~1%
  const registryFees = propertyValueNum * 0.003; // ~0.3%

  // Total costs
  const buyerCosts = alcabala + notaryFees * 0.5;
  const sellerCosts = impuestoRenta + notaryFees * 0.5 + registryFees;
  const totalCosts = buyerCosts + sellerCosts;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    setSaveSuccess(false);
    setSaveError('');

    // Save calculation to database
    if (!user) {
      setSaveError('Usuario no autenticado');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving calculation for user:', user.id);
      console.log('Property value:', propertyValueNum);

      const { data, error } = await supabase
        .from('estimator_calculations')
        .insert([
          {
            user_id: user.id,
            property_value: propertyValueNum,
            buyer_costs: buyerCosts,
            seller_costs: sellerCosts,
            total_costs: totalCosts,
            calculation_details: {
              alcabala,
              impuestoRenta,
              notaryFees,
              registryFees,
              UIT_2024,
            },
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        setSaveError(error.message);
      } else {
        console.log('Calculation saved successfully:', data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving calculation:', err);
      setSaveError('Error al guardar el cálculo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estimador de Impuestos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Calcula los impuestos y costos asociados a la compra-venta de propiedades en Perú
        </p>
      </div>

      {/* UIT Information Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-900">
              Valor UIT 2024: S/ {UIT_2024.toLocaleString()}
            </h3>
            <p className="mt-1 text-sm text-primary-800">
              Todos los cálculos están basados en la normativa tributaria vigente del Perú para el año 2024.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CalculatorIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Datos de la Propiedad</h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700 mb-2">
                Valor de la Propiedad (S/)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">S/</span>
                </div>
                <input
                  type="number"
                  id="propertyValue"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="450000"
                  step="1000"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: Av. Conquistadores 456 - S/ 450,000
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              {isSaving ? 'Guardando...' : 'Calcular Impuestos'}
            </button>
            {saveSuccess && (
              <p className="text-sm text-success-600 text-center mt-2">
                ✓ Cálculo guardado exitosamente
              </p>
            )}
            {saveError && (
              <p className="text-sm text-red-600 text-center mt-2">
                ✗ Error: {saveError}
              </p>
            )}
          </form>

          {/* Tax Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información Tributaria</h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <p className="font-medium text-gray-700">Alcabala (Comprador)</p>
                <p>3% sobre el exceso de 10 UIT (S/ {alcabalaExemption.toLocaleString()})</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Impuesto a la Renta (Vendedor)</p>
                <p>5% del valor de venta (calculado sobre costo de adquisición)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Gastos Notariales</p>
                <p>Aproximadamente 1% del valor de la propiedad</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Gastos Registrales</p>
                <p>Aproximadamente 0.3% del valor de la propiedad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {showResults ? (
            <>
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg rounded-lg p-6 text-white">
                <h2 className="text-lg font-medium mb-4">Resumen de Costos</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-primary-100 text-sm">Valor de Propiedad</p>
                    <p className="text-3xl font-bold">S/ {propertyValueNum.toLocaleString()}</p>
                  </div>
                  <div className="pt-3 border-t border-primary-400">
                    <p className="text-primary-100 text-sm">Costos Totales</p>
                    <p className="text-2xl font-semibold">S/ {totalCosts.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-primary-200 mt-1">
                      ({((totalCosts / propertyValueNum) * 100).toFixed(2)}% del valor)
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer Costs */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Costos del Comprador</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Impuesto de Alcabala</p>
                      <p className="text-xs text-gray-500">3% sobre {(alcabalaTaxable).toLocaleString()}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      S/ {alcabala.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gastos Notariales (50%)</p>
                      <p className="text-xs text-gray-500">Compartido con vendedor</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      S/ {(notaryFees * 0.5).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 bg-success-50 -mx-6 px-6 py-3 rounded-b-lg">
                    <p className="text-sm font-bold text-gray-900">Total Comprador</p>
                    <p className="text-xl font-bold text-success-600">
                      S/ {buyerCosts.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller Costs */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Costos del Vendedor</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Impuesto a la Renta</p>
                      <p className="text-xs text-gray-500">5% del valor de venta</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      S/ {impuestoRenta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gastos Notariales (50%)</p>
                      <p className="text-xs text-gray-500">Compartido con comprador</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      S/ {(notaryFees * 0.5).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gastos Registrales</p>
                      <p className="text-xs text-gray-500">Registro en Sunarp</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      S/ {registryFees.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 bg-warning-50 -mx-6 px-6 py-3 rounded-b-lg">
                    <p className="text-sm font-bold text-gray-900">Total Vendedor</p>
                    <p className="text-xl font-bold text-warning-600">
                      S/ {sellerCosts.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  <strong>Nota:</strong> Estos cálculos son estimados y pueden variar según la situación específica de cada transacción.
                  Se recomienda consultar con un asesor tributario para obtener información precisa. Los cálculos se basan en
                  normativa vigente del 2024.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <CalculatorIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ingresa el valor de la propiedad
              </h3>
              <p className="text-sm text-gray-500">
                Completa el formulario y haz click en "Calcular Impuestos" para ver el desglose detallado de costos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
