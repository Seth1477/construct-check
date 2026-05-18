/*!
 * ConstructCheck Feedback Widget v1.0
 * =====================================
 * Floating "Report an Issue" button on every page.
 * Stores tickets in Supabase + sends emails via EmailJS.
 *
 * ─── ONE-TIME SETUP ───────────────────────────────────────────────────────────
 *
 * STEP 1 — Supabase SQL  (run once in your Supabase SQL Editor)
 * ─────────────────────────────────────────────────────────────
 *   CREATE TABLE IF NOT EXISTS support_tickets (
 *     id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
 *     ticket_number  TEXT        UNIQUE NOT NULL,
 *     user_name      TEXT,
 *     user_email     TEXT        NOT NULL,
 *     issue_type     TEXT,
 *     subject        TEXT,
 *     description    TEXT,
 *     page_url       TEXT,
 *     screenshot_url TEXT,
 *     status         TEXT        DEFAULT 'open',
 *     created_at     TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public insert"    ON support_tickets FOR INSERT TO anon WITH CHECK (true);
 *   CREATE POLICY "Admin select all" ON support_tickets FOR SELECT TO authenticated USING (true);
 *
 *   Then in Supabase → Storage → create bucket "support-screenshots" (Public access ON).
 *
 * STEP 2 — EmailJS  (https://emailjs.com — free 200 emails/month)
 * ────────────────────────────────────────────────────────────────
 *   a) Create account → Add Email Service → connect constructcheck@gmail.com → note Service ID
 *
 *   b) Create template "Admin Notification"  (Template ID → paste in CFG.ejsAdminTpl)
 *      · To email:  constructcheck@gmail.com
 *      · Subject:   [ConstructCheck] New {{issue_type}} — Ticket {{ticket_number}}
 *      · Body (HTML):
 *          <h2>New Support Ticket: {{ticket_number}}</h2>
 *          <table>
 *            <tr><td><b>Type:</b></td><td>{{issue_type}}</td></tr>
 *            <tr><td><b>Subject:</b></td><td>{{subject}}</td></tr>
 *            <tr><td><b>From:</b></td><td>{{user_name}} &lt;{{user_email}}&gt;</td></tr>
 *            <tr><td><b>Page:</b></td><td>{{page_url}}</td></tr>
 *            <tr><td><b>Submitted:</b></td><td>{{submitted_at}}</td></tr>
 *          </table>
 *          <hr>
 *          <p><b>Description:</b></p>
 *          <p>{{description}}</p>
 *          <p><b>Screenshot:</b> {{screenshot_url}}</p>
 *
 *   c) Create template "User Confirmation"  (Template ID → paste in CFG.ejsUserTpl)
 *      · To email:  {{user_email}}
 *      · Subject:   [ConstructCheck] Ticket {{ticket_number}} Received
 *      · Body (HTML):
 *          <p>Hi {{user_name}},</p>
 *          <p>Thanks for reaching out! Your support ticket has been received.</p>
 *          <table>
 *            <tr><td><b>Ticket Number:</b></td><td>{{ticket_number}}</td></tr>
 *            <tr><td><b>Issue Type:</b></td><td>{{issue_type}}</td></tr>
 *            <tr><td><b>Subject:</b></td><td>{{subject}}</td></tr>
 *            <tr><td><b>Submitted:</b></td><td>{{submitted_at}}</td></tr>
 *          </table>
 *          <p>We typically respond within 1–2 business days.</p>
 *          <p>Best,<br>The ConstructCheck Team</p>
 *
 *   d) Copy your Public Key from emailjs.com → Account → General → Public Key
 *
 * STEP 3 — Fill in CFG below
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── CONFIG — fill these in after EmailJS setup ──────────────────────────
  const CFG = {
    ejsPublicKey : 'P6TWXAd0RXTm8EYRC',
    ejsServiceId : 'service_far0y0p',
    ejsAdminTpl  : 'template_2mbkewo',
    ejsUserTpl   : 'template_vb46un6',
    adminEmail   : 'constructcheck@gmail.com',
    sbBucket     : 'support-screenshots',
  };

  // ─── LOAD EMAILJS DYNAMICALLY ────────────────────────────────────────────
  let _ejsReady = false;
  function loadEmailJS() {
    if (typeof emailjs !== 'undefined') {
      if (CFG.ejsPublicKey) emailjs.init({ publicKey: CFG.ejsPublicKey });
      _ejsReady = true;
      return;
    }
    if (!CFG.ejsPublicKey) return; // not configured, skip
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => { emailjs.init({ publicKey: CFG.ejsPublicKey }); _ejsReady = true; };
    document.head.appendChild(s);
  }

  // ─── TICKET NUMBER ───────────────────────────────────────────────────────
  function genTicket() {
    const d  = new Date();
    const ds = d.getFullYear() +
               String(d.getMonth() + 1).padStart(2, '0') +
               String(d.getDate()).padStart(2, '0');
    const r  = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CC-${ds}-${r}`;
  }

  function fmtDate(d) {
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  // ─── SUPABASE: save ticket ────────────────────────────────────────────────
  async function saveTicket(row) {
    if (!window.CC_SB) { console.log('[Feedback] Supabase unavailable — ticket not persisted.'); return; }
    const { error } = await window.CC_SB.from('support_tickets').insert(row);
    if (error) console.warn('[Feedback] Ticket save error:', error.message);
  }

  // ─── SUPABASE: upload screenshot ─────────────────────────────────────────
  async function uploadScreenshot(file, ticketNo) {
    if (!file || !window.CC_SB) return null;
    try {
      const ext  = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${ticketNo}.${ext}`;
      const { error } = await window.CC_SB.storage
        .from(CFG.sbBucket).upload(path, file, { upsert: true });
      if (error) { console.warn('[Feedback] Screenshot upload failed:', error.message); return null; }
      const { data } = window.CC_SB.storage.from(CFG.sbBucket).getPublicUrl(path);
      return data?.publicUrl || null;
    } catch (e) { console.warn('[Feedback] Screenshot error:', e); return null; }
  }

  // ─── EMAILJS: send admin + user emails ───────────────────────────────────
  async function sendEmails(params) {
    if (!_ejsReady || !CFG.ejsServiceId) {
      console.log('[Feedback] EmailJS not configured — emails skipped. Fill in CFG to enable.');
      return;
    }
    const base = { ...params };
    try {
      await emailjs.send(CFG.ejsServiceId, CFG.ejsAdminTpl, { ...base, to_email: CFG.adminEmail });
    } catch (e) { console.warn('[Feedback] Admin email error:', e); }
    if (CFG.ejsUserTpl && params.user_email) {
      try {
        await emailjs.send(CFG.ejsServiceId, CFG.ejsUserTpl, { ...base, to_email: params.user_email });
      } catch (e) { console.warn('[Feedback] User confirmation email error:', e); }
    }
  }

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const CSS = `
    #cc-fb-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9900;
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #7c6fe0, #5b4ec4);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(124,111,224,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #cc-fb-btn:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 8px 28px rgba(124,111,224,0.55); }
    #cc-fb-btn:active { transform: scale(0.96); }

    #cc-fb-tooltip {
      position: fixed; bottom: 88px; right: 22px; z-index: 9899;
      background: #1e1b4b; color: #fff;
      font-size: 12px; font-weight: 600; font-family: inherit;
      padding: 6px 12px; border-radius: 8px; white-space: nowrap;
      opacity: 0; transform: translateY(5px);
      transition: opacity 0.18s, transform 0.18s; pointer-events: none;
    }
    #cc-fb-tooltip::after {
      content: ''; position: absolute; top: 100%; right: 17px;
      border: 5px solid transparent; border-top-color: #1e1b4b;
    }
    #cc-fb-btn:hover ~ #cc-fb-tooltip { opacity: 1; transform: translateY(0); }

    #cc-fb-overlay {
      position: fixed; inset: 0; z-index: 9950;
      background: rgba(13,11,30,0.55); backdrop-filter: blur(3px);
      display: flex; align-items: flex-end; justify-content: flex-end;
      padding: 0 28px 92px;
      opacity: 0; pointer-events: none; transition: opacity 0.22s;
    }
    #cc-fb-overlay.cc-fb-open { opacity: 1; pointer-events: all; }

    #cc-fb-modal {
      background: #fff; border-radius: 20px;
      width: min(460px, calc(100vw - 20px));
      max-height: min(700px, calc(100vh - 110px));
      display: flex; flex-direction: column;
      box-shadow: 0 24px 80px rgba(0,0,0,0.28);
      transform: translateY(28px) scale(0.97);
      transition: transform 0.3s cubic-bezier(0.34,1.4,0.64,1);
      overflow: hidden;
    }
    #cc-fb-overlay.cc-fb-open #cc-fb-modal { transform: translateY(0) scale(1); }

    .cc-fb-head {
      background: linear-gradient(135deg, #1a1535, #0d0b1e);
      padding: 18px 20px 16px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .cc-fb-head-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(124,111,224,0.3);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cc-fb-head-text h3 { margin:0; font-size:14px; font-weight:700; color:#fff; }
    .cc-fb-head-text p  { margin:2px 0 0; font-size:11px; color:#94a3b8; }
    .cc-fb-close {
      margin-left: auto; background: rgba(255,255,255,0.1);
      border: none; color: #fff; width: 28px; height: 28px;
      border-radius: 50%; font-size: 17px; line-height: 1;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .cc-fb-close:hover { background: rgba(255,255,255,0.22); }

    .cc-fb-body { overflow-y: auto; padding: 18px 20px; flex: 1; }

    .cc-fb-field { margin-bottom: 13px; }
    .cc-fb-field label {
      display: block; font-size: 11.5px; font-weight: 600;
      color: #374151; margin-bottom: 5px; font-family: inherit;
    }
    .cc-fb-field label .cc-req { color: #ef4444; margin-left: 2px; }
    .cc-fb-field input,
    .cc-fb-field select,
    .cc-fb-field textarea {
      width: 100%; padding: 9px 12px;
      border: 1.5px solid #e2e8f0; border-radius: 9px;
      font-size: 13px; font-family: inherit; color: #1e293b;
      background: #fff; outline: none; box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .cc-fb-field input:focus,
    .cc-fb-field select:focus,
    .cc-fb-field textarea:focus {
      border-color: #7c6fe0; box-shadow: 0 0 0 3px rgba(124,111,224,0.12);
    }
    .cc-fb-field input[readonly] {
      background: #f8fafc; color: #94a3b8; cursor: default; font-size: 11px;
    }
    .cc-fb-field textarea { resize: vertical; min-height: 88px; }

    .cc-fb-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 400px) { .cc-fb-row { grid-template-columns: 1fr; } }

    .cc-fb-drop {
      border: 2px dashed #cbd5e1; border-radius: 9px;
      padding: 14px 12px; text-align: center; cursor: pointer;
      position: relative; transition: border-color 0.15s, background 0.15s;
    }
    .cc-fb-drop:hover, .cc-fb-drop.cc-fb-drag { border-color: #7c6fe0; background: #faf9ff; }
    .cc-fb-drop input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer;
      width: 100%; height: 100%; border: none; padding: 0; margin: 0;
    }
    .cc-fb-drop-lbl span { display: block; font-size: 12px; color: #64748b; line-height: 1.55; }
    .cc-fb-drop-lbl .cc-fb-drop-main { font-size: 12px; font-weight: 600; color: #374151; }

    .cc-fb-preview-row {
      display: flex; align-items: center; gap: 10px;
      background: #f8fafc; border-radius: 8px; padding: 8px 10px; margin-top: 6px;
    }
    .cc-fb-preview-row img {
      width: 38px; height: 38px; object-fit: cover;
      border-radius: 6px; border: 1px solid #e2e8f0; flex-shrink: 0;
    }
    .cc-fb-preview-name {
      flex: 1; font-size: 12px; color: #374151; font-weight: 500;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .cc-fb-preview-rm {
      background: none; border: none; color: #94a3b8;
      font-size: 19px; line-height: 1; cursor: pointer; padding: 0 3px;
    }
    .cc-fb-preview-rm:hover { color: #ef4444; }

    .cc-fb-err-box {
      background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
      border-radius: 8px; padding: 10px 13px; font-size: 12px; margin-bottom: 12px;
      font-family: inherit;
    }

    .cc-fb-foot {
      display: flex; gap: 10px; justify-content: flex-end;
      padding-top: 2px; margin-top: 4px;
    }
    .cc-fb-cancel {
      padding: 9px 18px; background: #f8fafc;
      border: 1.5px solid #e2e8f0; border-radius: 9px;
      font-size: 13px; font-weight: 600; color: #64748b;
      cursor: pointer; font-family: inherit;
      transition: background 0.15s;
    }
    .cc-fb-cancel:hover { background: #f1f5f9; }
    .cc-fb-submit {
      padding: 9px 22px;
      background: linear-gradient(135deg, #7c6fe0, #5b4ec4);
      border: none; border-radius: 9px;
      font-size: 13px; font-weight: 700; color: #fff;
      cursor: pointer; font-family: inherit;
      display: flex; align-items: center; gap: 8px;
      transition: opacity 0.15s, transform 0.12s;
      min-width: 130px; justify-content: center;
    }
    .cc-fb-submit:hover { opacity: 0.91; }
    .cc-fb-submit:active { transform: scale(0.98); }
    .cc-fb-submit:disabled { opacity: 0.55; cursor: not-allowed; }

    .cc-fb-spin {
      width: 13px; height: 13px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: ccFbSpin 0.65s linear infinite;
    }
    @keyframes ccFbSpin { to { transform: rotate(360deg); } }

    /* Success state */
    .cc-fb-success {
      text-align: center; padding: 16px 12px 8px;
    }
    .cc-fb-success-ring {
      width: 66px; height: 66px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 8px 24px rgba(34,197,94,0.28);
    }
    .cc-fb-success h4 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
    .cc-fb-success p  { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 8px; }
    .cc-fb-tkt-badge {
      display: inline-block; background: #ede9fe; color: #5b4ec4;
      font-size: 13px; font-weight: 800; padding: 5px 16px;
      border-radius: 20px; margin-bottom: 14px; letter-spacing: 0.5px;
    }
    .cc-fb-done {
      padding: 10px 30px;
      background: linear-gradient(135deg, #7c6fe0, #5b4ec4);
      border: none; border-radius: 9px;
      font-size: 13px; font-weight: 700; color: #fff;
      cursor: pointer; font-family: inherit; margin-top: 6px;
      transition: opacity 0.15s;
    }
    .cc-fb-done:hover { opacity: 0.9; }

    @media (max-width: 500px) {
      #cc-fb-overlay { padding: 0 10px 86px; }
      #cc-fb-btn { bottom: 20px; right: 20px; }
    }
  `;

  // ─── HTML ─────────────────────────────────────────────────────────────────
  const HTML = `
    <button id="cc-fb-btn" aria-label="Report an Issue">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
           stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <span id="cc-fb-tooltip">Report an Issue</span>

    <div id="cc-fb-overlay" role="dialog" aria-modal="true" aria-labelledby="cc-fb-title">
      <div id="cc-fb-modal">

        <div class="cc-fb-head">
          <div class="cc-fb-head-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                 stroke="#a593f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
            </svg>
          </div>
          <div class="cc-fb-head-text">
            <h3 id="cc-fb-title">Report an Issue</h3>
            <p>Help us improve ConstructCheck</p>
          </div>
          <button class="cc-fb-close" id="cc-fb-close" aria-label="Close">&#x2715;</button>
        </div>

        <div class="cc-fb-body">

          <!-- ── Success view (hidden by default) ── -->
          <div class="cc-fb-success" id="cc-fb-success" style="display:none">
            <div class="cc-fb-success-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                   stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h4>Ticket Submitted!</h4>
            <div class="cc-fb-tkt-badge" id="cc-fb-tkt-num"></div>
            <p>Your issue has been logged. A confirmation email is on its way to you.</p>
            <p style="font-size:11.5px;color:#94a3b8;">We typically respond within 1–2 business days.</p>
            <button class="cc-fb-done" id="cc-fb-done">Done</button>
          </div>

          <!-- ── Form view ── -->
          <form id="cc-fb-form" novalidate>
            <div class="cc-fb-field">
              <label for="cc-fb-type">Issue Type</label>
              <select id="cc-fb-type">
                <option value="Bug Report">🐛  Bug Report</option>
                <option value="Feature Request">💡  Feature Request</option>
                <option value="Question">❓  General Question</option>
                <option value="Other">📝  Other</option>
              </select>
            </div>

            <div class="cc-fb-field">
              <label for="cc-fb-subject">Subject <span class="cc-req">*</span></label>
              <input id="cc-fb-subject" type="text" placeholder="Brief description of the issue" autocomplete="off">
            </div>

            <div class="cc-fb-field">
              <label for="cc-fb-desc">Description <span class="cc-req">*</span></label>
              <textarea id="cc-fb-desc"
                placeholder="Describe the issue in detail — steps to reproduce, what you expected vs. what happened, etc."></textarea>
            </div>

            <div class="cc-fb-row">
              <div class="cc-fb-field">
                <label for="cc-fb-name">Your Name</label>
                <input id="cc-fb-name" type="text" placeholder="Jane Smith" autocomplete="name">
              </div>
              <div class="cc-fb-field">
                <label for="cc-fb-email">Email <span class="cc-req">*</span></label>
                <input id="cc-fb-email" type="email" placeholder="you@company.com" autocomplete="email">
              </div>
            </div>

            <div class="cc-fb-field">
              <label>Screenshot <span style="color:#94a3b8;font-weight:400;">(optional)</span></label>
              <div class="cc-fb-drop" id="cc-fb-drop">
                <input type="file" id="cc-fb-file" accept="image/*" tabindex="-1">
                <div class="cc-fb-drop-lbl" id="cc-fb-drop-lbl">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                       stroke="#94a3b8" stroke-width="1.8"
                       style="display:block;margin:0 auto 7px">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span class="cc-fb-drop-main">Click to upload or drag &amp; drop</span>
                  <span>PNG, JPG, GIF — max 5 MB</span>
                </div>
                <div class="cc-fb-preview-row" id="cc-fb-prev-row" style="display:none">
                  <img id="cc-fb-prev-img" src="" alt="preview">
                  <span class="cc-fb-preview-name" id="cc-fb-prev-name"></span>
                  <button type="button" class="cc-fb-preview-rm" id="cc-fb-rm">&#x2715;</button>
                </div>
              </div>
            </div>

            <div class="cc-fb-field">
              <label for="cc-fb-page">Reported From</label>
              <input id="cc-fb-page" type="text" readonly>
            </div>

            <div class="cc-fb-err-box" id="cc-fb-err" style="display:none"></div>

            <div class="cc-fb-foot">
              <button type="button" class="cc-fb-cancel" id="cc-fb-cancel">Cancel</button>
              <button type="submit" class="cc-fb-submit" id="cc-fb-submit">
                <span id="cc-fb-submit-lbl">Submit Ticket</span>
                <div class="cc-fb-spin" id="cc-fb-spin" style="display:none"></div>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `;

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('cc-fb-btn')) return; // already mounted

    // Inject styles
    const st = document.createElement('style');
    st.id = 'cc-fb-styles';
    st.textContent = CSS;
    document.head.appendChild(st);

    // Inject HTML
    const wrap = document.createElement('div');
    wrap.innerHTML = HTML;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    // ── DOM refs ────────────────────────────────────────────────────────────
    const btn       = document.getElementById('cc-fb-btn');
    const overlay   = document.getElementById('cc-fb-overlay');
    const closeBtn  = document.getElementById('cc-fb-close');
    const cancelBtn = document.getElementById('cc-fb-cancel');
    const doneBtn   = document.getElementById('cc-fb-done');
    const form      = document.getElementById('cc-fb-form');
    const fileInput = document.getElementById('cc-fb-file');
    const dropZone  = document.getElementById('cc-fb-drop');
    const rmBtn     = document.getElementById('cc-fb-rm');
    const submitBtn = document.getElementById('cc-fb-submit');
    const spinner   = document.getElementById('cc-fb-spin');
    const submitLbl = document.getElementById('cc-fb-submit-lbl');
    const errBox    = document.getElementById('cc-fb-err');
    const pageInput = document.getElementById('cc-fb-page');

    let selectedFile = null;

    // Pre-fill logged-in user
    function prefillUser() {
      const u = window.CC?.Auth?.currentUser?.();
      if (u) {
        const nm = document.getElementById('cc-fb-name');
        const em = document.getElementById('cc-fb-email');
        if (nm && !nm.value) nm.value = u.name || '';
        if (em && !em.value) em.value = u.email || '';
      }
    }

    function openModal() {
      pageInput.value = window.location.href;
      prefillUser();
      overlay.classList.add('cc-fb-open');
      setTimeout(() => document.getElementById('cc-fb-subject').focus(), 280);
    }

    function closeModal() {
      overlay.classList.remove('cc-fb-open');
    }

    function resetForm() {
      form.reset();
      clearFile();
      errBox.style.display = 'none';
      document.getElementById('cc-fb-form').style.display = '';
      document.getElementById('cc-fb-success').style.display = 'none';
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      submitLbl.style.display = '';
      prefillUser();
    }

    function showErr(msg) {
      errBox.textContent = msg;
      errBox.style.display = 'block';
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function setLoading(on) {
      submitBtn.disabled = on;
      spinner.style.display = on ? 'block' : 'none';
      submitLbl.style.display = on ? 'none' : '';
    }

    // ── File handling ────────────────────────────────────────────────────────
    function showPreview(file) {
      if (!file || !file.type.startsWith('image/')) return;
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('cc-fb-prev-img').src = e.target.result;
        document.getElementById('cc-fb-prev-name').textContent = file.name;
        document.getElementById('cc-fb-drop-lbl').style.display = 'none';
        document.getElementById('cc-fb-prev-row').style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }

    function clearFile() {
      selectedFile = null;
      fileInput.value = '';
      document.getElementById('cc-fb-drop-lbl').style.display = '';
      document.getElementById('cc-fb-prev-row').style.display = 'none';
      document.getElementById('cc-fb-prev-img').src = '';
    }

    fileInput.addEventListener('change', e => { if (e.target.files[0]) showPreview(e.target.files[0]); });
    rmBtn.addEventListener('click', e => { e.stopPropagation(); clearFile(); });

    dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('cc-fb-drag'); });
    dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('cc-fb-drag'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('cc-fb-drag');
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith('image/')) showPreview(f);
    });

    // ── Form submit ──────────────────────────────────────────────────────────
    form.addEventListener('submit', async e => {
      e.preventDefault();
      errBox.style.display = 'none';

      const subject  = document.getElementById('cc-fb-subject').value.trim();
      const desc     = document.getElementById('cc-fb-desc').value.trim();
      const email    = document.getElementById('cc-fb-email').value.trim();
      const name     = document.getElementById('cc-fb-name').value.trim() || 'Anonymous';
      const issueType= document.getElementById('cc-fb-type').value;
      const pageUrl  = pageInput.value;

      if (!subject)           { showErr('Please enter a subject.'); return; }
      if (!desc)              { showErr('Please describe the issue.'); return; }
      if (!email)             { showErr('Please enter your email address so we can follow up.'); return; }
      if (!/\S+@\S+\.\S+/.test(email)) { showErr('Please enter a valid email address.'); return; }

      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        showErr('Screenshot must be under 5 MB. Please choose a smaller image.');
        return;
      }

      setLoading(true);

      const ticketNo = genTicket();
      const now      = fmtDate(new Date());

      // Upload screenshot (non-blocking if it fails)
      let screenshotUrl = null;
      if (selectedFile) screenshotUrl = await uploadScreenshot(selectedFile, ticketNo);

      // Save ticket to Supabase
      await saveTicket({
        ticket_number:  ticketNo,
        user_name:      name,
        user_email:     email,
        issue_type:     issueType,
        subject,
        description:    desc,
        page_url:       pageUrl,
        screenshot_url: screenshotUrl,
        status:         'open',
      });

      // Send emails
      await sendEmails({
        ticket_number:  ticketNo,
        user_name:      name,
        user_email:     email,
        issue_type:     issueType,
        subject,
        description:    desc,
        page_url:       pageUrl,
        screenshot_url: screenshotUrl || '(no screenshot)',
        submitted_at:   now,
      });

      // Show success
      setLoading(false);
      document.getElementById('cc-fb-form').style.display = 'none';
      document.getElementById('cc-fb-tkt-num').textContent = ticketNo;
      document.getElementById('cc-fb-success').style.display = 'block';
    });

    // ── Button/overlay events ────────────────────────────────────────────────
    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', () => { closeModal(); setTimeout(resetForm, 320); });
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('cc-fb-open')) closeModal();
    });
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────
  loadEmailJS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
