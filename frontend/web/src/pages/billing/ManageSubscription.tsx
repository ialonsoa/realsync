import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan_tier: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url: string | null;
  created_at: string;
}

export default function ManageSubscription() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionData();
    }
  }, [user?.id]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Fetch current subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      setSubscription(subData);

      // Fetch payment history
      const { data: historyData, error: historyError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) {
        throw historyError;
      }

      setPaymentHistory(historyData || []);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error al cargar los datos de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'PEN'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Activa' },
      canceled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelada' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pago Vencido' },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'Prueba' },
      incomplete: { color: 'bg-gray-100 text-gray-800', icon: ArrowPathIcon, text: 'Incompleta' },
    };

    const badge = badges[status] || badges.incomplete;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1.5" />
        {badge.text}
      </span>
    );
  };

  const getPlanName = (tier: string) => {
    const plans: Record<string, string> = {
      free: 'Plan Gratuito',
      pro: 'Plan Pro',
      enterprise: 'Plan Enterprise'
    };
    return plans[tier] || tier;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Suscripción</h1>
        <p className="mt-2 text-gray-600">
          Administra tu plan y revisa tu historial de pagos
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCardIcon className="h-6 w-6 mr-2 text-primary-600" />
            Suscripción Actual
          </h2>
        </div>

        {subscription ? (
          <div className="px-6 py-6 space-y-6">
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Plan
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {getPlanName(subscription.plan_tier)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Estado
                </label>
                <div>{getStatusBadge(subscription.status)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Inicio del Periodo
                </label>
                <p className="text-gray-900">
                  {formatDate(subscription.current_period_start)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Próximo Cobro
                </label>
                <p className="text-gray-900">
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>

            {/* Cancel at period end notice */}
            {subscription.cancel_at_period_end && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tu suscripción se cancelará al final del periodo actual ({formatDate(subscription.current_period_end)})
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <a
                href="/pricing"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Cambiar Plan
              </a>

              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <button
                  onClick={() => {
                    toast.error('La cancelación debe hacerse a través del portal de Stripe');
                    // TODO: Implement cancel subscription functionality
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar Suscripción
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <CreditCardIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No tienes una suscripción activa</p>
            <a
              href="/pricing"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Ver Planes
            </a>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Historial de Pagos
          </h2>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recibo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.receipt_url ? (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Ver Recibo →
                        </a>
                      ) : (
                        <span className="text-gray-400">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No tienes historial de pagos
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Si tienes problemas con tu suscripción o pagos, nuestro equipo está aquí para ayudarte.
        </p>
        <a
          href="mailto:soporte@realsync.com"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Contactar Soporte →
        </a>
      </div>
    </div>
  );
}
