import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing, we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed', message: error.message });
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    console.error('No user ID in checkout session metadata');
    return;
  }

  console.log(`Checkout completed for user ${userId}`);

  // The subscription creation will be handled by customer.subscription.created event
  // Here we can log the successful checkout or send a confirmation email
}

// Handle subscription creation or update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to get user from customer ID
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!profile) {
      console.error('No user found for customer:', customerId);
      return;
    }
  }

  const finalUserId = userId || (await getUserIdFromCustomer(customerId));

  if (!finalUserId) {
    console.error('Could not determine user ID for subscription:', subscription.id);
    return;
  }

  // Determine plan tier from price
  const priceId = subscription.items.data[0]?.price.id;
  const planTier = getPlanTierFromPriceId(priceId);

  // Upsert subscription in database
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: finalUserId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status: subscription.status,
      plan_tier: planTier,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (subError) {
    console.error('Error upserting subscription:', subError);
  } else {
    console.log(`Subscription ${subscription.id} updated for user ${finalUserId}`);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for deleted subscription');
    return;
  }

  // Update subscription status to canceled
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free tier
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription ${subscription.id} canceled for user ${userId}`);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceSubscription = (invoice as any).subscription;
  if (!invoiceSubscription) return;

  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for payment');
    return;
  }

  // Get subscription from database
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', invoiceSubscription as string)
    .single();

  const paymentIntent = (invoice as any).payment_intent as string;

  // Record payment in payment_history
  await supabaseAdmin
    .from('payment_history')
    .insert({
      user_id: userId,
      subscription_id: subscription?.id || null,
      stripe_payment_intent_id: paymentIntent,
      amount: (invoice as any).amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      payment_method: paymentIntent ? 'card' : 'unknown',
      receipt_url: (invoice as any).hosted_invoice_url,
    });

  console.log(`Payment succeeded for user ${userId}, amount: ${(invoice as any).amount_paid / 100}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceSubscription = (invoice as any).subscription;
  if (!invoiceSubscription) return;

  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for failed payment');
    return;
  }

  // Update user profile status to past_due
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // TODO: Send email notification to user about failed payment

  console.log(`Payment failed for user ${userId}`);
}

// Helper: Get user ID from Stripe customer ID
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return profile?.id || null;
}

// Helper: Determine plan tier from Stripe price ID
function getPlanTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  // In production, you'd have a mapping of price IDs to tiers
  // For now, we'll use a simple check
  if (priceId.includes('pro') || priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }
  if (priceId.includes('enterprise') || priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    return 'enterprise';
  }
  return 'free';
}
