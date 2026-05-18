// stripe-webhook/index.ts
// Receives Stripe events and updates user plan status in Supabase.
// Handles: checkout.session.completed, subscription updated/deleted,
//          invoice.payment_failed

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

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body      = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId       = session.client_reference_id;
        const customerId   = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) { console.error('No client_reference_id on session'); break; }

        // Retrieve full subscription to get period end
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(userId, customerId, subscriptionId, 'active', sub.current_period_end);
        break;
      }

      case 'customer.subscription.updated': {
        const sub      = event.data.object as Stripe.Subscription;
        const userId   = sub.metadata?.supabase_user_id || await getUserIdByCustomer(sub.customer as string);
        if (!userId) break;

        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
        await upsertSubscription(userId, sub.customer as string, sub.id, status, sub.current_period_end);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id || await getUserIdByCustomer(sub.customer as string);
        if (!userId) break;

        await upsertSubscription(userId, sub.customer as string, sub.id, 'canceled', sub.current_period_end);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice  = event.data.object as Stripe.Invoice;
        const subId    = invoice.subscription as string;
        if (!subId) break;

        const sub    = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.supabase_user_id || await getUserIdByCustomer(sub.customer as string);
        if (!userId) break;

        await upsertSubscription(userId, sub.customer as string, sub.id, 'past_due', sub.current_period_end);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// ── Helpers ────────────────────────────────────────────────────────────────────

async function upsertSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string,
  status: string,
  periodEnd: number,
) {
  const plan = (status === 'active' || status === 'trialing') ? 'pro' : 'free';
  const periodEndTs = new Date(periodEnd * 1000).toISOString();

  const { error } = await supabase
    .from('user_data')
    .update({
      plan,
      stripe_customer_id:       customerId,
      stripe_subscription_id:   subscriptionId,
      stripe_status:            status,
      stripe_current_period_end: periodEndTs,
      updated_at:               new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[stripe-webhook] upsertSubscription error:', error);
    throw error;
  }
  console.log(`[stripe-webhook] Updated user ${userId} → plan=${plan} status=${status}`);
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) { console.warn('[stripe-webhook] Customer not found:', customerId); return null; }
  return data.user_id;
}
