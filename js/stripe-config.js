// stripe-config.js — Construct Check Stripe client configuration
// FILL IN your keys from the Stripe dashboard before deploying.

window.CC_STRIPE = {
  // Publishable key from Stripe → Developers → API Keys
  publishableKey: 'REPLACE_WITH_STRIPE_PUBLISHABLE_KEY',

  // Price ID from Stripe → Products → Construct Check Pro → Pricing
  priceId: 'REPLACE_WITH_STRIPE_PRICE_ID',

  // Supabase Edge Function base URL
  functionsUrl: 'https://vlpuiguahfnuzbtjtwut.supabase.co/functions/v1',
};
