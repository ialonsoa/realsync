import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Initialize Supabase Admin Client (for service role operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId } = req.body;

    // Validate input
    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing priceId or userId' });
    }

    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get user email from auth.users
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name || user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });

      customerId = customer.id;

      // Update user profile with Stripe customer ID
      await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: userId,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
      // Subscription data
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
    });

    // Return session ID to redirect user to Stripe Checkout
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}
