// admin-analytics/index.ts
// Aggregates signup, subscription, revenue, and engagement metrics
// for the admin dashboard. Verifies caller against a hardcoded admin
// email allowlist, then uses the service-role key to bypass RLS.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAILS = ['speterson1477@gmail.com'];
const PRO_PRICE_USD = 20;

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function startOfDay(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}

function rangeStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case 'day':   return addDays(startOfDay(now), -1);
    case 'week':  return addDays(startOfDay(now), -7);
    case 'month': return addDays(startOfDay(now), -30);
    case 'year':  return addDays(startOfDay(now), -365);
    default:      return new Date(0);   // 'all'
  }
}

function bucketKey(d: Date, granularity: string): string {
  const yr = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  switch (granularity) {
    case 'day':   return `${yr}-${mo}-${da}`;
    case 'month': return `${yr}-${mo}`;
    case 'year':  return `${yr}`;
    default:      return `${yr}-${mo}-${da}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // ── Verify caller is admin ────────────────────────────────────
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Missing auth token' }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Invalid token' }, 401);
    const callerEmail = userData.user.email?.toLowerCase() || '';
    if (!ADMIN_EMAILS.includes(callerEmail)) {
      return json({ error: 'Forbidden — admin only' }, 403);
    }

    // ── Parse params ──────────────────────────────────────────────
    const url         = new URL(req.url);
    const range       = url.searchParams.get('range')       || 'month';   // day|week|month|year|all
    const granularity = url.searchParams.get('granularity') || 'day';      // day|month|year
    const since       = rangeStart(range);

    // ── 1. SIGNUPS — fetched from auth.users via admin API ────────
    const { data: usersList, error: usersErr } = await admin.auth.admin.listUsers({
      page: 1, perPage: 10000,
    });
    if (usersErr) throw usersErr;
    const allUsers = usersList?.users || [];

    // ── 2. USER DATA — plan + Stripe state for all users ─────────
    const { data: ud, error: udErr } = await admin
      .from('user_data')
      .select('user_id, plan, stripe_status, stripe_current_period_end, updated_at');
    if (udErr) throw udErr;
    const udMap = new Map((ud || []).map((r: any) => [r.user_id, r]));

    // ── 3. ANALYTICS — page views + session lengths ──────────────
    const { data: events, error: evErr } = await admin
      .from('analytics_events')
      .select('user_id, event_type, page, session_id, duration_seconds, created_at')
      .gte('created_at', since.toISOString())
      .limit(50000);
    if (evErr) throw evErr;
    const evs = events || [];

    // ── Aggregations ──────────────────────────────────────────────
    const totalUsers = allUsers.length;
    let freeCount = 0, trialCount = 0, proCount = 0, churnedCount = 0;
    const now = Date.now();
    const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
    const recentSignupsRaw = [...allUsers].sort(
      (a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at)
    );

    for (const u of allUsers) {
      const row = udMap.get(u.id) as any;
      const plan = row?.plan || 'free';
      const status = row?.stripe_status || null;
      if (plan === 'pro' && (status === 'active' || status === 'trialing')) {
        proCount++;
      } else if (status === 'canceled' || status === 'past_due') {
        churnedCount++;
      } else {
        const createdAt = +new Date(u.created_at);
        if (now - createdAt < TRIAL_MS) trialCount++;
        else freeCount++;
      }
    }

    const mrr = proCount * PRO_PRICE_USD;
    const arr = mrr * 12;
    const conversionRate = totalUsers > 0
      ? Math.round((proCount / totalUsers) * 1000) / 10
      : 0;

    // ── Signup chart buckets ──────────────────────────────────────
    const signupBuckets: Record<string, number> = {};
    for (const u of allUsers) {
      const created = new Date(u.created_at);
      if (created < since) continue;
      const k = bucketKey(created, granularity);
      signupBuckets[k] = (signupBuckets[k] || 0) + 1;
    }
    const signupChart = Object.entries(signupBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, count]) => ({ bucket, count }));

    // ── Page view chart buckets ───────────────────────────────────
    const pageViewBuckets: Record<string, number> = {};
    const pageViewByPage: Record<string, number> = {};
    let pageViewCount = 0;
    for (const e of evs) {
      if (e.event_type !== 'page_view') continue;
      pageViewCount++;
      const created = new Date(e.created_at);
      const k = bucketKey(created, granularity);
      pageViewBuckets[k] = (pageViewBuckets[k] || 0) + 1;
      const page = (e.page || '/').replace(/^\//, '').replace(/\.html$/, '') || 'home';
      pageViewByPage[page] = (pageViewByPage[page] || 0) + 1;
    }
    const pageViewChart = Object.entries(pageViewBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, count]) => ({ bucket, count }));
    const topPages = Object.entries(pageViewByPage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // ── Session metrics ───────────────────────────────────────────
    const sessions = evs.filter((e: any) => e.event_type === 'session_end' && e.duration_seconds);
    const totalSessions = sessions.length;
    const totalSeconds  = sessions.reduce((s: number, e: any) => s + (e.duration_seconds || 0), 0);
    const avgSessionSec = totalSessions > 0 ? Math.round(totalSeconds / totalSessions) : 0;

    // Active users (DAU/WAU/MAU within the requested window — approx using page_view events)
    const uniq = (mins: number) => {
      const cutoff = Date.now() - mins * 60 * 1000;
      const set = new Set<string>();
      for (const e of evs) {
        if (e.event_type !== 'page_view') continue;
        if (+new Date(e.created_at) >= cutoff && e.user_id) set.add(e.user_id);
      }
      return set.size;
    };
    const dau = uniq(60 * 24);
    const wau = uniq(60 * 24 * 7);
    const mau = uniq(60 * 24 * 30);

    // ── Recent signups list ───────────────────────────────────────
    const recentSignups = recentSignupsRaw.slice(0, 25).map((u: any) => {
      const row = udMap.get(u.id) as any;
      return {
        email:      u.email,
        signed_up:  u.created_at,
        plan:       row?.plan || 'free',
        status:     row?.stripe_status || null,
        period_end: row?.stripe_current_period_end || null,
      };
    });

    return json({
      generated_at: new Date().toISOString(),
      range, granularity,
      summary: {
        total_users:     totalUsers,
        free_count:      freeCount,
        trial_count:     trialCount,
        pro_count:       proCount,
        churned_count:   churnedCount,
        mrr_usd:         mrr,
        arr_usd:         arr,
        conversion_rate: conversionRate,
        page_views:      pageViewCount,
        total_sessions:  totalSessions,
        avg_session_sec: avgSessionSec,
        total_time_sec:  totalSeconds,
        dau, wau, mau,
      },
      signup_chart:    signupChart,
      pageview_chart:  pageViewChart,
      top_pages:       topPages,
      recent_signups:  recentSignups,
    });
  } catch (err) {
    console.error('[admin-analytics]', err);
    return json({ error: (err as Error).message }, 500);
  }
});
