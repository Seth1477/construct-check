// stripe-config.js — Construct Check Stripe client configuration
// FILL IN your keys from the Stripe dashboard before deploying.

window.CC_STRIPE = {
  // Publishable key from Stripe → Developers → API Keys
  publishableKey: 'pk_live_51TYVYGDKvzAi7mXcMBzTha8mRvj8LflIM9N9sdI3MjF49mQtRYVQVVfcnR2incKGIIqu87osmkgCVrJ3opDSAyRH00aCAyXrvu',

  // Price ID for Construct Check Pro ($20/month)
  priceId: 'price_1TYVjyDKvzAi7mXcMwgxGNAz',

  // Supabase Edge Function base URL
  functionsUrl: 'https://vlpuiguahfnuzbtjtwut.supabase.co/functions/v1',
};
