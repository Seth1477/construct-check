// supabase-config.js — Construct Check Supabase client initialization
// Must load after the Supabase CDN script, before auth.js

(function () {
  const SB_URL = 'https://vlpuiguahfnuzbtjtwut.supabase.co';
  const SB_KEY = 'sb_publishable_DC5PNxmiE0ukqZefafY9YA_4oLfLvvQ';

  try {
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
      console.error('[SupabaseConfig] Supabase CDN not loaded.');
      return;
    }
    window.CC_SB = supabase.createClient(SB_URL, SB_KEY);
    console.log('[SupabaseConfig] Client ready.');
  } catch (e) {
    console.error('[SupabaseConfig] Failed to create client:', e);
  }
})();
