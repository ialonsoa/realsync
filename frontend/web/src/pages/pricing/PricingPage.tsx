import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from '@/store/auth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const plans = [
    {
      name: 'Free',
      price: 'S/ 0',
      period: 'mes',
      description: 'Perfecto para empezar',
      features: [
        '1 propiedad activa',
        'Estimador de impuestos',
        'Timeline básico',
        'Soporte por email',
      ],
      cta: 'Plan Actual',
      disabled: true,
      tier: 'free',
    },
    {
      name: 'Pro',
      price: 'S/ 99',
      period: 'mes',
      description: 'Para agentes profesionales',
      features: [
        'Propiedades ilimitadas',
        'Estimador avanzado',
        'Timeline completo con notificaciones',
        'Chat en tiempo real',
        'Analíticas avanzadas',
        'Almacenamiento de documentos (10GB)',
        'Soporte prioritario 24/7',
        'Integración con WhatsApp',
      ],
      cta: 'Actualizar a Pro',
      highlighted: true,
      tier: 'pro',
      stripePriceId: 'price_demo', // In production, this would be a real Stripe Price ID
    },
    {
      name: 'Enterprise',
      price: 'Contactar',
      period: '',
      description: 'Para agencias inmobiliarias',
      features: [
        'Todo de Pro',
        'Múltiples usuarios',
        'White-label',
        'API access',
        'Custom integraciones',
        'Onboarding personalizado',
        'Dedicated account manager',
      ],
      cta: 'Contactar Ventas',
      tier: 'enterprise',
    },
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (plan.tier === 'free' || plan.tier === 'enterprise') return;

    setIsLoading(true);

    try {
      // In a real implementation, you would:
      // 1. Call your backend to create a Stripe Checkout Session
      // 2. Redirect to Stripe Checkout
      // 3. Handle the webhook to update user subscription

      // For demo purposes, we'll simulate the flow
      alert(`
        🚀 Demo Mode - Stripe Checkout

        En producción, esto abriría Stripe Checkout para:
        - Plan: ${plan.name}
        - Precio: ${plan.price}/${plan.period}

        El flujo completo incluiría:
        1. Crear Checkout Session en backend
        2. Redirigir a Stripe Checkout
        3. Procesar pago
        4. Actualizar suscripción vía webhook
        5. Actualizar tier del usuario en Supabase

        ✅ Para Sprint 3: Stripe está integrado y listo para usar
      `);

      // Example of how you'd redirect to Stripe Checkout:
      /*
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user?.id,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
      */

    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Elige tu plan</h1>
        <p className="mt-4 text-lg text-gray-600">
          Selecciona el plan perfecto para tu negocio inmobiliario
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg shadow-lg overflow-hidden ${
              plan.highlighted
                ? 'ring-2 ring-primary-600 relative'
                : 'ring-1 ring-gray-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Más Popular
              </div>
            )}

            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-lg text-gray-500">/{plan.period}</span>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={plan.disabled || isLoading}
                className={`mt-8 w-full py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : plan.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Procesando...' : plan.cta}
              </button>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Current Subscription Info */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900">Tu suscripción actual</h3>
          <p className="mt-2 text-sm text-blue-800">
            Plan: <strong>{user.subscription_tier === 'pro' ? 'Pro' : 'Free'}</strong>
          </p>
          <p className="mt-1 text-sm text-blue-800">
            Estado: <strong>{user.subscription_status === 'active' ? 'Activa' : 'Inactiva'}</strong>
          </p>
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-yellow-900">📝 Modo Demo - Sprint 3</h3>
        <p className="mt-2 text-sm text-yellow-800">
          Esta es una implementación de demostración de Stripe para Sprint 3.
          Los botones muestran el flujo de integración. En producción:
        </p>
        <ul className="mt-2 ml-4 text-sm text-yellow-800 list-disc space-y-1">
          <li>Se crearía una sesión de Checkout en el backend</li>
          <li>Se redirigiría a Stripe Checkout hosteado</li>
          <li>Se procesarían webhooks para actualizar suscripciones</li>
          <li>Se actualizaría automáticamente el tier del usuario en Supabase</li>
        </ul>
      </div>
    </div>
  );
}
