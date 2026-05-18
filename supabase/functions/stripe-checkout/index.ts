// stripe-checkout/index.ts
// Creates a Stripe Checkout Session and returns the hosted URL.
// Called from the client when a user clicks "Upgrade to Pro".

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { email, user_id } = await req.json();

    if (!email || !user_id) {
      return new Response(JSON.stringify({ error: 'email and user_id required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const PRICE_ID    = Deno.env.get('STRIPE_PRICE_ID')!;
    const SITE_URL    = 'https://seth1477.github.io/construct-check';
    const SUCCESS_URL = `${SITE_URL}/upgrade-success.html?session_id={CHECKOUT_SESSION_ID}`;
    const CANCEL_URL  = `${SITE_URL}/upgrade-cancel.html`;

    // Find or create Stripe customer by email so repeat visits re-use the same customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ email, metadata: { supabase_user_id: user_id } });

    const session = await stripe.checkout.sessions.create({
      customer:            customer.id,
      client_reference_id: user_id,
      line_items:          [{ price: PRICE_ID, quantity: 1 }],
      mode:                'subscription',
      success_url:         SUCCESS_URL,
      cancel_url:          CANCEL_URL,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: user_id },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[stripe-checkout]', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
