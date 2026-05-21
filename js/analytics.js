/**
 * analytics.js — Construct Check usage tracking
 *
 * Records:
 *   - page_view       — fired once per page load
 *   - session_start   — fired once per browser session (sessionStorage-scoped)
 *   - session_end     — fired on tab close / hidden, with duration_seconds
 *
 * Requires CC_SB (Supabase client) and an authenticated session.
 * No-op for anonymous users or when Supabase isn't configured.
 */
(function () {
  'use strict';

  if (typeof window.CC_SB === 'undefined' || window.CC_SB === null) return;

  const SESSION_KEY    = 'cc_analytics_session';
  const SESSION_START  = 'cc_analytics_session_start';
  const HEARTBEAT_MS   = 30 * 1000;          // refresh activity every 30s
  const IDLE_TIMEOUT   = 5 * 60 * 1000;      // 5 min of no activity = end session

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getOrCreateSession() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = uuid();
      sessionStorage.setItem(SESSION_KEY, sid);
      sessionStorage.setItem(SESSION_START, String(Date.now()));
      return { sid, isNew: true };
    }
    return { sid, isNew: false };
  }

  async function getUserId() {
    try {
      const { data } = await CC_SB.auth.getUser();
      return data?.user?.id || null;
    } catch (e) { return null; }
  }

  async function record(eventType, extra) {
    const userId = await getUserId();
    if (!userId) return;  // anonymous = no-op

    const session = getOrCreateSession();
    const payload = Object.assign({
      user_id:    userId,
      event_type: eventType,
      page:       window.location.pathname,
      session_id: session.sid,
      metadata:   { referrer: document.referrer || null, ua: navigator.userAgent },
    }, extra || {});

    try {
      await CC_SB.from('analytics_events').insert(payload);
    } catch (e) {
      // silent — never block the user on analytics failures
    }
  }

  async function endSession() {
    const sid    = sessionStorage.getItem(SESSION_KEY);
    const start  = parseInt(sessionStorage.getItem(SESSION_START) || '0', 10);
    if (!sid || !start) return;
    const ended  = sessionStorage.getItem('cc_analytics_session_ended');
    if (ended === sid) return;  // already ended this session
    sessionStorage.setItem('cc_analytics_session_ended', sid);

    const durationSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    // Use sendBeacon-compatible insert via fetch keepalive (Supabase doesn't have a beacon helper)
    try {
      const userId = await getUserId();
      if (!userId) return;
      const url = `${window.CC_SB.supabaseUrl}/rest/v1/analytics_events`;
      const key = window.CC_SB.supabaseKey;
      const body = JSON.stringify({
        user_id:          userId,
        event_type:       'session_end',
        page:             window.location.pathname,
        session_id:       sid,
        duration_seconds: durationSeconds,
      });
      // Try fetch with keepalive (works during unload in modern browsers)
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        key,
          'Authorization': 'Bearer ' + (await CC_SB.auth.getSession()).data.session?.access_token,
          'Prefer':        'return=minimal',
        },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }

  // ── Bootstrap on each page load ─────────────────────────────────
  function init() {
    const session = getOrCreateSession();
    if (session.isNew) {
      record('session_start');
    }
    record('page_view');

    // Heartbeat: keep updating the session_start time so we measure active time
    let heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Re-record page view periodically so engagement stays warm in metrics
      }
    }, HEARTBEAT_MS);

    // End session on tab close or when hidden for long
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenAt) {
        if (Date.now() - hiddenAt > IDLE_TIMEOUT) {
          // Came back after long idle — start a fresh session
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_START);
          sessionStorage.removeItem('cc_analytics_session_ended');
          endSession();
          const ns = getOrCreateSession();
          if (ns.isNew) record('session_start');
        }
        hiddenAt = 0;
      }
    });

    window.addEventListener('beforeunload', endSession);
    window.addEventListener('pagehide',     endSession);
  }

  // Wait for auth to settle before recording
  if (window.CC?.Auth?.whenReady) {
    window.CC.Auth.whenReady().then(session => {
      if (session) init();
    });
  } else {
    // auth.js not yet loaded — defer
    document.addEventListener('DOMContentLoaded', () => {
      if (window.CC?.Auth?.whenReady) {
        window.CC.Auth.whenReady().then(s => { if (s) init(); });
      }
    });
  }
})();
