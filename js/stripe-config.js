// stripe-config.js — Construct Check Stripe client configuration
// FILL IN your keys from the Stripe dashboard before deploying.

window.CC_STRIPE = {
  // Publishable key from Stripe → Developers → API Keys
  publishableKey: 'pk_test_51TYVYOD4YFvr63IJmlnXpxHVUnSS9rhj5fLSUzptYCyYBR5zUuwapPmY13MMejnVwvG1pgYIa89hu1HeDfGSf1Lp0090eQIQTq',

  // Price ID for Construct Check Pro ($20/month)
  priceId: 'price_1TYVchD4YFvr63IJUAghp4bG',

  // Supabase Edge Function base URL
  functionsUrl: 'https://vlpuiguahfnuzbtjtwut.supabase.co/functions/v1',
};
