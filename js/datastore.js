// datastore.js — Supabase-backed data store for Construct Check
// Primary store: Supabase PostgreSQL (cross-device, authoritative)
// Local cache: IndexedDB + localStorage (fast render, offline fallback)

const DataStore = {
  DB_NAME: 'construct_check_db',
  DB_VERSION: 2,
  _db: null,
  _ready: false,

  // ─── IndexedDB (local cache) ──────────────────────────────────

  async open() {
    if (this._db && this._ready) return this._db;
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('user_data')) {
            db.createObjectStore('user_data', { keyPath: 'key' });
          }
        };
        req.onsuccess = (e) => {
          this._db = e.target.result;
          this._ready = true;
          resolve(this._db);
        };
        req.onerror = (e) => {
          console.error('[DataStore] IndexedDB open error:', e.target?.error);
          reject(e.target?.error);
        };
      } catch (err) {
        console.error('[DataStore] IndexedDB not available:', err);
        reject(err);
      }
    });
  },

  async _idbPut(key, value) {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('user_data', 'readwrite');
        const store = tx.objectStore('user_data');
        store.put({ key, value, updatedAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      return false;
    }
  },

  async _idbGet(key) {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('user_data', 'readonly');
        const store = tx.objectStore('user_data');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  },

  // ─── Supabase helpers ─────────────────────────────────────────

  async _getSbUserId() {
    try {
      if (!window.CC_SB) return null;
      const { data: { session } } = await CC_SB.auth.getSession();
      return session?.user?.id || null;
    } catch (e) {
      return null;
    }
  },

  async _sbUpsert(fields) {
    try {
      const userId = await this._getSbUserId();
      if (!userId || !window.CC_SB) return false;
      const { error } = await CC_SB.from('user_data')
        .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() },
                 { onConflict: 'user_id' });
      if (error) { console.error('[DataStore] Supabase upsert error:', error.message); return false; }
      return true;
    } catch (e) {
      console.error('[DataStore] _sbUpsert exception:', e);
      return false;
    }
  },

  async _sbSelect(column) {
    try {
      const userId = await this._getSbUserId();
      if (!userId || !window.CC_SB) return null;
      const { data, error } = await CC_SB.from('user_data')
        .select(column)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) { console.error('[DataStore] Supabase select error:', error.message); return null; }
      return data ? data[column] : null;
    } catch (e) {
      console.error('[DataStore] _sbSelect exception:', e);
      return null;
    }
  },

  // ─── Local key helper ─────────────────────────────────────────

  _userKey(email, type) {
    return `${type}_${(email || 'guest').toLowerCase()}`;
  },

  // ─── Projects ─────────────────────────────────────────────────

  async saveProjects(email, projects) {
    // 1. localStorage cache — sync render on next load
    try { localStorage.setItem(`cc_projects_${email}`, JSON.stringify(projects)); } catch (e) {}
    // 2. IndexedDB cache
    this._idbPut(this._userKey(email, 'projects'), projects).catch(() => {});
    // 3. Supabase — authoritative
    const saved = await this._sbUpsert({ projects });
    if (saved) console.log(`[DataStore] Saved ${projects.length} projects to Supabase`);
    return true;
  },

  loadProjectsSync(email) {
    try {
      const ls = localStorage.getItem(`cc_projects_${email}`);
      return ls ? JSON.parse(ls) : null;
    } catch (e) { return null; }
  },

  async loadProjects(email) {
    // 1. Supabase — authoritative, cross-device
    const sbData = await this._sbSelect('projects');
    if (sbData && sbData.length > 0) {
      console.log(`[DataStore] Loaded ${sbData.length} projects from Supabase`);
      // Refresh caches
      try { localStorage.setItem(`cc_projects_${email}`, JSON.stringify(sbData)); } catch (e) {}
      this._idbPut(this._userKey(email, 'projects'), sbData).catch(() => {});
      return sbData;
    }
    // 2. IndexedDB
    const idbData = await this._idbGet(this._userKey(email, 'projects'));
    if (idbData && idbData.length > 0) return idbData;
    // 3. localStorage
    return this.loadProjectsSync(email);
  },

  // ─── Schedule Versions ────────────────────────────────────────

  // Strip fields that are large and only needed locally (comparison/diagnostics).
  // activityLookup (all activities × 12 fields) and wbsLookup can be MB per version;
  // 20 versions would easily exceed Supabase's API payload limit and localStorage quota.
  _leanVersion(v) {
    const { activityLookup, wbsLookup, ...lean } = v;
    return lean;
  },

  async saveVersions(email, versions) {
    // 1. IndexedDB — full data, no size limit, MUST be awaited before page redirects
    const idbOk = await this._idbPut(this._userKey(email, 'versions'), versions).catch(() => false);
    if (idbOk) console.log(`[DataStore] Saved ${versions.length} versions (full) to IDB`);

    // 2. Lean versions for size-limited stores (drops activityLookup/wbsLookup)
    const lean = versions.map(v => this._leanVersion(v));

    // 3. localStorage — lean only, stays well under 5 MB quota
    try { localStorage.setItem(`cc_versions_${email}`, JSON.stringify(lean)); } catch (e) {}

    // 4. Supabase — lean only, stays under API payload limits for cross-device sync
    const sbOk = await this._sbUpsert({ versions: lean }).catch(() => false);
    if (sbOk) console.log(`[DataStore] Saved ${versions.length} versions (lean) to Supabase`);

    if (!idbOk && !sbOk) console.warn('[DataStore] All version saves failed — data may be lost on reload');
    return true;
  },

  async loadVersions(email) {
    // 1. IndexedDB — full data preferred (has activityLookup for comparison/diagnostics)
    const idbData = await this._idbGet(this._userKey(email, 'versions')).catch(() => null);
    if (idbData && idbData.length > 0) {
      console.log(`[DataStore] Loaded ${idbData.length} versions (full) from IDB`);
      return idbData;
    }
    // 2. Supabase — lean data (no activityLookup, but dashboard still works)
    const sbData = await this._sbSelect('versions').catch(() => null);
    if (sbData && sbData.length > 0) {
      console.log(`[DataStore] Loaded ${sbData.length} versions (lean) from Supabase — re-upload to restore full data`);
      // Seed IDB with lean data so future loads are fast
      this._idbPut(this._userKey(email, 'versions'), sbData).catch(() => {});
      return sbData;
    }
    // 3. localStorage — lean fallback
    try {
      const ls = localStorage.getItem(`cc_versions_${email}`);
      const parsed = ls ? JSON.parse(ls) : null;
      if (parsed && parsed.length > 0) console.log(`[DataStore] Loaded ${parsed.length} versions (lean) from localStorage`);
      return parsed;
    } catch (e) { return null; }
  },

  // ─── Legacy aliases (used by old code paths) ──────────────────

  async put(key, value) { return this._idbPut(key, value); },
  async get(key) { return this._idbGet(key); },
};

window.DataStore = DataStore;
