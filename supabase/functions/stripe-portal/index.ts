// stripe-portal/index.ts
// Creates a Stripe Customer Portal session so subscribers can manage
// their billing, update payment methods, or cancel their subscription.

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Look up the Stripe customer ID from Supabase
    const { data, error } = await supabase
      .from('user_data')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    if (error || !data?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No Stripe customer found for this user.' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const RETURN_URL = 'https://seth1477.github.io/construct-check/project.html';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   data.stripe_customer_id,
      return_url: RETURN_URL,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[stripe-portal]', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
