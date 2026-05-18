/**
 * auth.js — Construct Check authentication (Supabase)
 *
 * Uses Supabase Auth when CC_SB is available (supabase-config.js loaded),
 * falls back to localStorage when Supabase is not configured.
 * Public API is identical to the previous Firebase version.
 */
(function () {
  'use strict';

  // ── Supabase detection ──────────────────────────────────────────
  const SB_OK = (function () {
    try { return typeof window.CC_SB !== 'undefined' && window.CC_SB !== null; }
    catch (e) { return false; }
  })();

  // ── Session state ───────────────────────────────────────────────
  let _session = null;        // { name, email, createdAt }
  let _sessionReady = false;
  const _readyCbs = [];

  function _onReady(cb) {
    if (_sessionReady) { cb(_session); return; }
    _readyCbs.push(cb);
  }
  function _setReady(session) {
    _session = session;
    _sessionReady = true;
    _readyCbs.forEach(cb => cb(session));
    _readyCbs.length = 0;
  }

  function _userFromSupabase(u) {
    return {
      name:      u.user_metadata?.name || u.email.split('@')[0],
      email:     u.email,
      createdAt: new Date(u.created_at).getTime(),
    };
  }

  // ── LocalStorage helpers ────────────────────────────────────────
  const LS = { USAGE: 'cc_usage' };
  const lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ── Admin preview-mode helpers ──────────────────────────────────
  // Stores 'pro' (default) or 'free' per admin email so they can
  // preview exactly what a free-tier user sees.
  function _previewKey(email) { return 'cc_preview_' + email.toLowerCase(); }
  function _getPreviewMode(email) {
    return localStorage.getItem(_previewKey(email)) || 'pro';
  }
  function _setPreviewMode(email, mode) {
    localStorage.setItem(_previewKey(email), mode);
  }

  // ── Usage / plan helpers ────────────────────────────────────────
  const ADMIN_EMAILS              = ['speterson1477@gmail.com'];
  const TRIAL_DAYS                = 7;
  const TRIAL_MS                  = TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const FREE_PROJECT_LIMIT        = 2;
  const FREE_UPLOADS_PER_PROJECT  = 4;

  function _usageFor(email) {
    const all  = lsGet(LS.USAGE) || {};
    const base = all[email] || { uploads: 0, plan: 'free' };
    if (ADMIN_EMAILS.includes(email.toLowerCase())) base.plan = 'pro';
    return base;
  }
  function _saveUsage(email, data) {
    const all = lsGet(LS.USAGE) || {};
    all[email] = data;
    lsSet(LS.USAGE, all);
  }
  function _trialStartFor(email) {
    const all   = lsGet(LS.USAGE) || {};
    const usage = all[email] || {};
    if (!usage.trialStartAt) {
      // Prefer Supabase account-creation timestamp; fall back to now
      usage.trialStartAt = _session?.createdAt || Date.now();
      all[email] = { uploads: 0, plan: 'free', ...usage };
      lsSet(LS.USAGE, all);
    }
    return usage.trialStartAt;
  }
  function _isTrialActive(email) {
    if (ADMIN_EMAILS.includes(email.toLowerCase())) return true;
    const usage = _usageFor(email);
    if (usage.plan === 'pro') return true;
    return (Date.now() - _trialStartFor(email)) < TRIAL_MS;
  }

  // ── Resolve initial session ─────────────────────────────────────
  if (SB_OK) {
    // onAuthStateChange fires once on load with the current session (INITIAL_SESSION event)
    CC_SB.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? _userFromSupabase(session.user) : null;
      if (!_sessionReady) {
        _setReady(user);
      } else {
        _session = user;
        // If user was signed out from another tab, redirect to login
        if (!user && !_isPublicPage()) {
          window.location.href = 'login.html';
        }
      }
    });
  } else {
    // localStorage-only fallback
    _setReady(lsGet('cc_session'));
  }

  function _isPublicPage() {
    const path = window.location.pathname;
    return path.includes('index.html') || path.includes('login.html') || path.endsWith('/');
  }

  // ── Public API ──────────────────────────────────────────────────
  const Auth = {

    currentUser() { return _session; },

    whenReady() {
      return new Promise(resolve => _onReady(resolve));
    },

    requireAuth() {
      return new Promise(resolve => {
        _onReady(session => {
          if (!session) {
            window.location.href =
              'login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          } else {
            resolve(session);
          }
        });
      });
    },

    async login(email, password) {
      email = email.toLowerCase().trim();
      if (SB_OK) {
        const { data, error } = await CC_SB.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: _sbErrMsg(error) };
        if (data.user) _session = _userFromSupabase(data.user);
        return { ok: true };
      }
      // localStorage fallback
      const users = lsGet('cc_users') || {};
      const user  = users[email];
      if (!user) return { ok: false, error: 'No account found with that email.' };
      if (user.passwordHash !== _hashPw(password)) return { ok: false, error: 'Incorrect password.' };
      const session = { name: user.name, email: user.email, createdAt: user.createdAt };
      lsSet('cc_session', session);
      _session = session;
      return { ok: true };
    },

    async loginWithGoogle() {
      if (!SB_OK) {
        return { ok: false, error: 'Google sign-in requires cloud configuration. Please use email/password.' };
      }
      const { error } = await CC_SB.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard.html'
        }
      });
      if (error) return { ok: false, error: _sbErrMsg(error) };
      return { ok: true }; // browser will redirect to Google before this returns
    },

    async register(name, email, password) {
      email = email.toLowerCase().trim();
      if (SB_OK) {
        const { data, error } = await CC_SB.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) return { ok: false, error: _sbErrMsg(error) };
        if (data.user) _session = _userFromSupabase(data.user);
        return { ok: true };
      }
      // localStorage fallback
      const users = lsGet('cc_users') || {};
      if (users[email]) return { ok: false, error: 'An account with that email already exists.' };
      if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
      users[email] = { name, email, passwordHash: _hashPw(password), createdAt: Date.now() };
      lsSet('cc_users', users);
      const session = { name, email, createdAt: users[email].createdAt };
      lsSet('cc_session', session);
      _session = session;
      return { ok: true };
    },

    logout() {
      if (SB_OK) {
        CC_SB.auth.signOut().finally(() => { window.location.href = 'index.html'; });
      } else {
        localStorage.removeItem('cc_session');
        _session = null;
        window.location.href = 'index.html';
      }
    },

    async sendPasswordResetEmail(email) {
      email = email.toLowerCase().trim();
      if (SB_OK) {
        const { error } = await CC_SB.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login.html',
        });
        if (error) return { ok: false, error: _sbErrMsg(error) };
        return { ok: true };
      }
      return { ok: false, error: 'supabase_not_configured' };
    },

    async resetPassword(email, newPassword) {
      if (SB_OK) {
        if (newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
        const { error } = await CC_SB.auth.updateUser({ password: newPassword });
        if (error) return { ok: false, error: _sbErrMsg(error) };
        return { ok: true };
      }
      // localStorage fallback
      email = (email || '').toLowerCase().trim();
      const users = lsGet('cc_users') || {};
      if (!users[email]) return { ok: false, error: 'No account found with that email address.' };
      if (newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
      users[email].passwordHash = _hashPw(newPassword);
      lsSet('cc_users', users);
      return { ok: true };
    },

    // ── Usage / Paywall ─────────────────────────────────────────
    recordUpload() {
      const user = this.currentUser();
      if (!user) return { allowed: false };
      const usage = _usageFor(user.email);
      usage.uploads = (usage.uploads || 0) + 1;
      _saveUsage(user.email, usage);
      const trialActive = _isTrialActive(user.email);
      return { allowed: true, uploadsUsed: usage.uploads, limit: Infinity, isPro: usage.plan === 'pro', trialActive };
    },

    getUsage() {
      const user = this.currentUser();
      if (!user) return { uploads: 0, plan: 'free', limit: Infinity, trialActive: false, daysLeft: 0 };
      const usage = _usageFor(user.email);
      return { ...usage, limit: Infinity, trialActive: _isTrialActive(user.email), daysLeft: this.trialDaysLeft() };
    },

    upgradeToPro() {
      const user = this.currentUser();
      if (!user) return;
      const usage = _usageFor(user.email);
      usage.plan = 'pro';
      _saveUsage(user.email, usage);
      window.location.reload();
    },

    isPro() {
      const user = this.currentUser();
      if (!user) return false;
      if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        // Admin in free-preview mode acts as a free-tier user
        return _getPreviewMode(user.email) !== 'free';
      }
      return (_usageFor(user.email).plan === 'pro');
    },

    isTrialActive() {
      const user = this.currentUser();
      if (!user) return false;
      // Admin in free-preview mode simulates an expired trial
      if (ADMIN_EMAILS.includes(user.email.toLowerCase()) && _getPreviewMode(user.email) === 'free') {
        return false;
      }
      return _isTrialActive(user.email);
    },

    getPreviewMode() {
      const user = this.currentUser();
      if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
      return _getPreviewMode(user.email);
    },

    setPreviewMode(mode) {
      const user = this.currentUser();
      if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return;
      _setPreviewMode(user.email, mode);
      window.location.reload();
    },

    isFreeRestricted() {
      // true when trial has expired AND user hasn't upgraded to pro
      const user = this.currentUser();
      if (!user) return true;
      return !this.isPro() && !this.isTrialActive();
    },

    canCreateProject() {
      if (this.isPro() || this.isTrialActive()) return { allowed: true };
      const realProjects = (window.App?._realProjects?.() || []);
      if (realProjects.length >= FREE_PROJECT_LIMIT) {
        return {
          allowed: false,
          reason: `Free accounts are limited to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited projects.`
        };
      }
      return { allowed: true };
    },

    canUploadToProject(projectId, additionalCount = 1) {
      if (this.isPro() || this.isTrialActive()) return { allowed: true };
      const current = (window.App?.scheduleVersions || [])
        .filter(v => v.projectId === projectId && v.isReal && !v.isDemo).length;
      const after = current + additionalCount;
      if (after > FREE_UPLOADS_PER_PROJECT) {
        const remaining = Math.max(0, FREE_UPLOADS_PER_PROJECT - current);
        const msg = current >= FREE_UPLOADS_PER_PROJECT
          ? `Free accounts are limited to ${FREE_UPLOADS_PER_PROJECT} uploads per project. Upgrade to Pro for unlimited uploads.`
          : `This project has ${current} upload${current !== 1 ? 's' : ''}. Free accounts allow ${FREE_UPLOADS_PER_PROJECT} per project — only ${remaining} more allowed.`;
        return { allowed: false, reason: msg };
      }
      return { allowed: true };
    },

    trialDaysLeft() {
      const user = this.currentUser();
      if (!user) return 0;
      if (this.isPro()) return Infinity;
      const ms = TRIAL_MS - (Date.now() - _trialStartFor(user.email));
      return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
    },

    // ── UI helpers ──────────────────────────────────────────────
    renderUserState() {
      const user  = this.currentUser();
      const usage = this.getUsage();

      const avatarEl = document.getElementById('userAvatarInitial');
      if (avatarEl && user) {
        const parts = user.name.trim().split(' ');
        avatarEl.textContent = parts.length > 1
          ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
          : user.name.slice(0, 2).toUpperCase();
      }

      document.querySelectorAll('[data-auth-name]').forEach(el => { el.textContent = user ? user.name : ''; });
      document.querySelectorAll('[data-auth-email]').forEach(el => { el.textContent = user ? user.email : ''; });
      document.querySelectorAll('[data-auth-plan]').forEach(el => {
        const isAdmin  = user && ADMIN_EMAILS.includes(user.email.toLowerCase());
        const daysLeft = this.trialDaysLeft();
        const label    = isAdmin         ? 'Admin ★'
                       : this.isPro()    ? 'Pro'
                       : daysLeft > 0   ? `Trial — ${daysLeft}d left`
                       :                  'Free';
        el.textContent = label;
        el.className   = (el.className || '').replace(/plan-\w+/g, '') +
          (isAdmin || this.isPro() ? ' plan-pro' : daysLeft > 0 ? ' plan-trial' : ' plan-free');
      });
      document.querySelectorAll('[data-auth-uploads]').forEach(el => {
        el.textContent = `${usage.uploads} uploaded`;
      });

      const sidebarUser = document.querySelector('.sidebar-bottom .sidebar-user, .sidebar-user');
      if (sidebarUser && !sidebarUser.dataset.accountBound) {
        sidebarUser.dataset.accountBound = '1';
        sidebarUser.style.cursor = 'pointer';
        sidebarUser.title = 'View account';
        sidebarUser.addEventListener('click', e => {
          if (e.target.closest('.sidebar-logout-btn')) return;
          showAccountPanel();
        });
      }

      // Show/hide the admin free-preview banner
      _renderPreviewBanner(user);
    },
  };

  // ── Admin free-preview banner ───────────────────────────────────
  function _renderPreviewBanner(user) {
    if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return;
    const mode = _getPreviewMode(user.email);
    const BANNER_ID = 'cc-preview-banner';
    let banner = document.getElementById(BANNER_ID);

    if (mode === 'free') {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = BANNER_ID;
        banner.style.cssText = [
          'position:fixed;top:0;left:0;right:0;z-index:10000',
          'background:#f59e0b;color:#1a1a1a',
          'padding:7px 20px',
          'font-size:13px;font-weight:700',
          'display:flex;align-items:center;justify-content:center;gap:14px',
          'box-shadow:0 2px 8px rgba(0,0,0,0.18)'
        ].join(';');
        banner.innerHTML = `
          <span>👁 Admin Preview — viewing as <strong>Free Tier</strong> (trial expired)</span>
          <button onclick="CC.Auth.setPreviewMode('pro')"
            style="background:#1a1a1a;color:#f59e0b;border:none;padding:4px 14px;
                   border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;
                   white-space:nowrap;">
            ↩ Switch back to Pro
          </button>`;
        document.body.prepend(banner);
        // Push page content down so nothing is hidden under the banner
        document.body.style.setProperty('--preview-banner-offset', '38px');
        document.documentElement.style.setProperty('--preview-banner-offset', '38px');
        // Apply offset to common layout elements
        const sidebar = document.querySelector('.sidebar');
        const main    = document.querySelector('.main-content, main, .content');
        if (sidebar) sidebar.style.paddingTop = '38px';
        if (main)    main.style.paddingTop    = (parseInt(getComputedStyle(main).paddingTop) || 0) + 38 + 'px';
      }
    } else if (banner) {
      banner.remove();
    }
  }

  // ── Supabase error messages ─────────────────────────────────────
  function _sbErrMsg(err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('invalid login') || msg.includes('invalid_credentials') || msg.includes('invalid credentials'))
      return 'Incorrect email or password.';
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('email_exists'))
      return 'An account with that email already exists.';
    if (msg.includes('password should be') || msg.includes('weak_password'))
      return 'Password must be at least 6 characters.';
    if (msg.includes('rate limit') || msg.includes('too many'))
      return 'Too many attempts. Please try again later.';
    if (msg.includes('network') || msg.includes('fetch'))
      return 'Network error. Check your connection and try again.';
    return err.message || 'An error occurred. Please try again.';
  }

  function _hashPw(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
    return h.toString(36) + '_' + pw.length;
  }

  // ── Inject hover style for sidebar user block ───────────────────
  (function () {
    const s = document.createElement('style');
    s.textContent = `
      .sidebar-bottom .sidebar-user:hover,
      .sidebar-user:not([data-no-hover]):hover {
        background: rgba(124,111,224,0.15) !important;
        border-radius: 10px;
        transition: background 0.2s;
      }
    `;
    document.head.appendChild(s);
  })();

  // ── Account Panel ───────────────────────────────────────────────
  function showAccountPanel() {
    const existing = document.getElementById('cc-account-panel');
    if (existing) { existing.style.display = 'flex'; return; }

    const user  = Auth.currentUser();
    const usage = Auth.getUsage();
    if (!user) return;

    const isAdmin       = ADMIN_EMAILS.includes(user.email.toLowerCase());
    const isPro         = isAdmin || usage.plan === 'pro';
    const planLabel     = isAdmin ? 'Admin ★' : isPro ? 'Pro' : 'Free Trial';
    const planColor     = isPro ? '#7c6fe0' : '#94a3b8';
    const previewMode   = isAdmin ? _getPreviewMode(user.email) : null;
    const uploadsUsed  = usage.uploads || 0;
    const uploadsLimit = isPro ? null : usage.limit;
    const uploadPct    = uploadsLimit ? Math.min(100, Math.round(uploadsUsed / uploadsLimit * 100)) : 100;
    const joined = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    const parts   = user.name.trim().split(' ');
    const initials = parts.length > 1
      ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
      : user.name.slice(0, 2).toUpperCase();
    const syncBadge = SB_OK
      ? '<span style="background:#e8f5e9;color:#2e7d32;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:700;margin-left:6px;">⚡ Cloud Sync ON</span>'
      : '<span style="background:#fff8e1;color:#f57f17;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:700;margin-left:6px;">⚠ Local Storage Only</span>';

    const overlay = document.createElement('div');
    overlay.id = 'cc-account-panel';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,11,30,0.6);display:flex;align-items:center;justify-content:center;z-index:9500;backdrop-filter:blur(4px);';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:20px;width:min(480px,94vw);max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.25);font-family:inherit;">
        <div style="background:linear-gradient(135deg,#1a1535,#0d0b1e);border-radius:20px 20px 0 0;padding:32px 28px 24px;position:relative;">
          <button id="ccAccountClose" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#7c6fe0,#a593f5);color:#fff;font-size:22px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>
            <div>
              <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:4px;">${user.name}</div>
              <div style="font-size:13px;color:#94a3b8;">${user.email}</div>
              <div style="margin-top:6px;">
                <span style="background:${planColor}22;color:${planColor};border:1px solid ${planColor}55;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;text-transform:uppercase;">${planLabel}</span>
                ${syncBadge}
              </div>
            </div>
          </div>
        </div>
        <div style="padding:24px 28px;display:flex;flex-direction:column;gap:20px;">
          <div style="background:#f8fafc;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;color:#64748b;font-weight:500;">Email</span>
              <span style="font-size:13px;font-weight:600;color:#1e293b;">${user.email}</span>
            </div>
            <div style="height:1px;background:#e2e8f0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;color:#64748b;font-weight:500;">Plan</span>
              <span style="font-size:13px;font-weight:700;color:${planColor};">${planLabel}</span>
            </div>
            <div style="height:1px;background:#e2e8f0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;color:#64748b;font-weight:500;">Member since</span>
              <span style="font-size:13px;font-weight:600;color:#1e293b;">${joined}</span>
            </div>
            <div style="height:1px;background:#e2e8f0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;color:#64748b;font-weight:500;">Auth mode</span>
              <span style="font-size:13px;font-weight:600;color:${SB_OK ? '#2e7d32' : '#f57f17'};">${SB_OK ? 'Supabase (cross-device)' : 'Local storage only'}</span>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:600;color:#374151;">Schedule Uploads</span>
              <span style="font-size:13px;color:#64748b;">${uploadsUsed} / ${uploadsLimit != null ? uploadsLimit : '∞'}</span>
            </div>
            ${uploadsLimit != null ? `
            <div style="height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${uploadPct}%;background:${uploadPct >= 100 ? '#ef4444' : '#7c6fe0'};border-radius:3px;"></div>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:5px;">${uploadsLimit - uploadsUsed > 0 ? `${uploadsLimit - uploadsUsed} upload${uploadsLimit - uploadsUsed !== 1 ? 's' : ''} remaining` : 'Limit reached — upgrade for unlimited'}</div>
            ` : `<div style="font-size:11px;color:#7c6fe0;margin-top:2px;">Unlimited uploads</div>`}
          </div>
          <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <button id="ccPwToggle"
              style="width:100%;padding:14px 18px;background:#f8fafc;border:none;text-align:left;font-size:14px;font-weight:600;color:#374151;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c6fe0" stroke-width="2.2" style="flex-shrink:0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              ▼ Change Password
            </button>
            <div id="ccPwForm" style="display:none;padding:16px 18px;border-top:1px solid #e2e8f0;">
              <div id="ccPwError" style="display:none;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px;"></div>
              <div id="ccPwSuccess" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px;"></div>
              <div style="margin-bottom:10px;">
                <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">New password</label>
                <input id="ccNewPw" type="password" placeholder="At least 6 characters" style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;" />
              </div>
              <div style="margin-bottom:12px;">
                <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Confirm password</label>
                <input id="ccConfirmPw" type="password" placeholder="Repeat new password" style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;" />
              </div>
              <button id="ccSavePw" style="padding:9px 20px;background:#7c6fe0;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Save New Password</button>
            </div>
          </div>
          ${isAdmin ? `
          <div style="background:#0d0b1e;border-radius:12px;padding:18px 20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <span style="font-size:16px;">🧪</span>
              <span style="color:#e2e8f0;font-size:13px;font-weight:700;">Admin — Preview Mode</span>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <button onclick="CC.Auth.setPreviewMode('pro')"
                style="flex:1;padding:10px 8px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;
                       border:2px solid ${previewMode === 'pro' ? '#7c6fe0' : 'rgba(255,255,255,0.15)'};
                       background:${previewMode === 'pro' ? '#7c6fe0' : 'rgba(255,255,255,0.06)'};
                       color:${previewMode === 'pro' ? '#fff' : '#64748b'};">
                ${previewMode === 'pro' ? '✓ ' : ''}Pro View
              </button>
              <button onclick="CC.Auth.setPreviewMode('free')"
                style="flex:1;padding:10px 8px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;
                       border:2px solid ${previewMode === 'free' ? '#f59e0b' : 'rgba(255,255,255,0.15)'};
                       background:${previewMode === 'free' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'};
                       color:${previewMode === 'free' ? '#f59e0b' : '#64748b'};">
                ${previewMode === 'free' ? '👁 ' : ''}Free View
              </button>
            </div>
            <p style="font-size:11px;color:#475569;margin:0;line-height:1.5;">
              Toggle to preview exactly what a free-tier user sees — upload limits, row caps, and export restrictions all apply.
            </p>
          </div>` : ''}
          <button onclick="CC.Auth.logout()" style="width:100%;padding:12px;border:1.5px solid #fecaca;border-radius:10px;background:#fff;color:#dc2626;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.getElementById('ccAccountClose').addEventListener('click', () => { overlay.style.display = 'none'; });

    document.getElementById('ccPwToggle').addEventListener('click', function () {
      const form = document.getElementById('ccPwForm');
      const open = form.style.display === 'none';
      form.style.display = open ? 'block' : 'none';
      this.querySelector('svg').nextSibling.textContent = (open ? '▲' : '▼') + ' Change Password';
    });

    document.getElementById('ccSavePw').addEventListener('click', async () => {
      const pw    = document.getElementById('ccNewPw').value;
      const pw2   = document.getElementById('ccConfirmPw').value;
      const errEl = document.getElementById('ccPwError');
      const okEl  = document.getElementById('ccPwSuccess');
      errEl.style.display = 'none'; okEl.style.display = 'none';
      if (pw !== pw2) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
      const result = await Auth.resetPassword(user.email, pw);
      if (result.ok) {
        okEl.textContent = 'Password updated successfully.';
        okEl.style.display = 'block';
        document.getElementById('ccNewPw').value = '';
        document.getElementById('ccConfirmPw').value = '';
      } else {
        errEl.textContent = result.error;
        errEl.style.display = 'block';
      }
    });
  }

  // ── One-time migration cleanup ──────────────────────────────────
  (function () {
    if (localStorage.getItem('sv_projects')) {
      localStorage.removeItem('sv_projects');
      localStorage.removeItem('sv_versions');
    }
    const migKey = 'cc_migration_v3';
    if (!localStorage.getItem(migKey)) {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('cc_projects_') || k.startsWith('cc_versions_')) localStorage.removeItem(k);
      });
      localStorage.setItem(migKey, '1');
    }
  })();

  // ── Expose globally ─────────────────────────────────────────────
  window.CC        = window.CC || {};
  window.CC.Auth   = Auth;
  window.CC.FB_OK  = SB_OK;  // kept for backward compat
  window.CC.SB_OK  = SB_OK;

  window.CC.showUpgradeModal = function (featureName) {
    const id = 'cc-upgrade-modal';
    const existing = document.getElementById(id);
    if (existing) { existing.style.display = 'flex'; return; }
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,11,30,0.85);display:flex;align-items:center;justify-content:center;z-index:9000;backdrop-filter:blur(4px);';
    const featureText = featureName
      ? `<strong>${featureName}</strong> is a Pro feature.`
      : 'This feature requires a Pro subscription.';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:48px 40px;max-width:480px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.3);">
        <div style="font-size:48px;margin-bottom:16px;">⚡</div>
        <h2 style="font-size:24px;font-weight:800;color:#1e1b4b;margin:0 0 10px">Upgrade to Pro</h2>
        <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px">${featureText} Your 1-week free trial has ended — upgrade to continue with full access.</p>
        <div style="background:#f8f7ff;border:2px solid #7c6fe0;border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:32px;font-weight:800;color:#5b4ec4">$20<span style="font-size:16px;font-weight:500;color:#64748b">/month</span></div>
          <ul style="text-align:left;margin:12px 0 0;padding-left:20px;color:#1e293b;font-size:14px;line-height:2;">
            <li>Unlimited P6 file uploads &amp; comparisons</li>
            <li>Full data views — no row limits</li>
            <li>Excel &amp; CSV export for all reports</li>
            <li>Full DCMA+ diagnostics &amp; narrative reports</li>
            <li>Priority support</li>
          </ul>
        </div>
        <button onclick="window.location.href='index.html#pricing'" style="width:100%;padding:14px;background:#7c6fe0;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:10px;cursor:pointer;margin-bottom:12px;">Upgrade to Pro — $20/mo</button>
        <button onclick="document.getElementById('${id}').style.display='none'" style="width:100%;padding:12px;background:transparent;color:#94a3b8;font-size:14px;border:none;cursor:pointer;">Maybe later</button>
      </div>`;
    document.body.appendChild(overlay);
  };
  // Backward-compat alias
  window.CC.showPaywallModal = function () { window.CC.showUpgradeModal(); };

})();
