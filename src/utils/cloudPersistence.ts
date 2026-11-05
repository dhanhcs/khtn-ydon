import { FileAttachment } from '../types';

/**
 * Unified Persistent Storage & Cross-Domain Cloud Sync Engine
 * - Solves browser localStorage 5MB QuotaExceededError by storing all data & binary attachments (Word/PDF/Image) in IndexedDB (`ndh_persistent_db`).
 * - Solves cross-device & next-day data persistence across Vercel (`https://hoahoc-thcs-ndh.vercel.app`),
 *   Netlify (`https://hoahoc-thcs-ndh.netlify.app`), and AI Studio by syncing with `/api/cloud-store`
 *   (backed by GitHub `ndh-cloud-data` branch + server disk + debounced Firestore).
 */

const IDB_NAME = 'ndh_persistent_db';
const IDB_VERSION = 2;
const KV_STORE = 'kv_store';
const ATT_STORE = 'att_store';

const VERCEL_CLOUD_API = 'https://hoahoc-thcs-ndh.vercel.app/api/cloud-store';
const DELETED_IDS_KEY = 'ndh_deleted_item_ids';

export interface CloudKeyEntry {
  data: any;
  updatedAt: number;
}

// In-memory hot cache for synchronous reads (`readPersistedKey`)
const memStore: Record<string, any> = {};
const memUpdatedAt: Record<string, number> = {};
const attachmentMemCache: Record<string, FileAttachment> = {};
const sessionViewedTargets = new Set<string>();

// Key-specific custom event mapping so UI components re-render immediately when IndexedDB or Cloud hydrates
export const KEY_EVENT_MAP: Record<string, string> = {
  ndh_homeworks: 'ndh-homeworks-updated',
  ndh_announcements: 'ndh-announcements-updated',
  ndh_exam_bank: 'ndh-exams-updated',
  ndh_exam_results: 'ndh-results-updated',
  ndh_quiz_submissions: 'ndh-quiz-submissions-updated',
  ndh_homework_submissions: 'ndh-hw-submissions-updated',
  ndh_reference_materials: 'ndh-materials-updated',
  ndh_video_experiments: 'ndh-experiments-updated',
  ndh_youtube_channel_data: 'ndh-youtube-updated',
  ndh_online_class_sessions: 'ndh-online-sessions-updated',
  ndh_item_comments: 'ndh-comments-updated',
  ndh_media_activity_logs: 'ndh-media-activity-updated',
  ndh_leave_requests: 'ndh-leave-requests-updated',
  ndh_schedules: 'ndh-schedules-updated',
  ndh_registrations: 'ndh-registrations-updated',
  ndh_students: 'ndh-roster-updated',
  ndh_tuitions: 'ndh-tuition-updated',
  ndh_registered_users: 'ndh-users-updated',
  ndh_app_settings_v2: 'ndh-settings-updated',
};

export const ALL_SYNCED_KEYS = Object.keys(KEY_EVENT_MAP);

// ============================================================================
// 1. DELETED ITEM TRACKER (Prevents deleted posts from coming back during merge)
// ============================================================================
export function getDeletedItemIds(): Set<string> {
  try {
    if (Array.isArray(memStore[DELETED_IDS_KEY])) {
      return new Set<string>(memStore[DELETED_IDS_KEY]);
    }
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memStore[DELETED_IDS_KEY] = parsed;
        return new Set<string>(parsed);
      }
    }
  } catch {}
  return new Set<string>();
}

export function markItemDeleted(id: string): void {
  if (!id) return;
  const set = getDeletedItemIds();
  if (set.has(id)) return;
  set.add(id);
  const arr = Array.from(set).slice(-1000);
  const now = Date.now();
  memStore[DELETED_IDS_KEY] = arr;
  memUpdatedAt[DELETED_IDS_KEY] = now;
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(arr));
    localStorage.setItem(DELETED_IDS_KEY + '_updated_at', String(now));
  } catch {}
  idbPut(KV_STORE, DELETED_IDS_KEY, { data: arr, updatedAt: now }).catch(() => {});
  scheduleCloudPush(DELETED_IDS_KEY, arr, now);
}

// ============================================================================
// 2. INDEXEDDB ENGINE (Unlimited Browser Persistence for Word, PDF, Images)
// ============================================================================
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openPersistentDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(KV_STORE)) {
          db.createObjectStore(KV_STORE);
        }
        if (!db.objectStoreNames.contains(ATT_STORE)) {
          db.createObjectStore(ATT_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet<T = any>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openPersistentDB();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function idbGetAllKeys(storeName: string): Promise<string[]> {
  const db = await openPersistentDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result || []).map(String));
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function idbPut(storeName: string, key: string, value: any): Promise<void> {
  const db = await openPersistentDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ============================================================================
// 3. ATTACHMENT OFFLOADING & REHYDRATION (Prevents 5MB localStorage Quota Error)
// ============================================================================
export function cacheAttachmentInMemoryAndIDB(att: FileAttachment): void {
  if (!att || !att.id) return;
  if (att.dataUrl && !att.dataUrl.startsWith('__idb_att__:')) {
    attachmentMemCache[att.id] = { ...att };
    idbPut(ATT_STORE, att.id, { ...att, updatedAt: Date.now() }).catch(() => {});
  }
}

export async function resolveAttachmentDataUrl(att: FileAttachment): Promise<string> {
  if (!att) return '';
  if (att.dataUrl && !att.dataUrl.startsWith('__idb_att__:')) {
    return att.dataUrl;
  }
  const attId = att.id || att.dataUrl.replace('__idb_att__:', '');
  if (attachmentMemCache[attId]?.dataUrl && !attachmentMemCache[attId].dataUrl.startsWith('__idb_att__:')) {
    return attachmentMemCache[attId].dataUrl;
  }
  const fromIdb = await idbGet<FileAttachment>(ATT_STORE, attId);
  if (fromIdb?.dataUrl && !fromIdb.dataUrl.startsWith('__idb_att__:')) {
    attachmentMemCache[attId] = fromIdb;
    return fromIdb.dataUrl;
  }
  // Fetch from cloud-store if not yet in local IDB
  const fromCloud = await fetchCloudAttachment(attId);
  if (fromCloud?.dataUrl) {
    attachmentMemCache[attId] = fromCloud;
    await idbPut(ATT_STORE, attId, fromCloud);
    return fromCloud.dataUrl;
  }
  return '';
}

function extractAndCacheAttachments(node: any, stripLargeForLocalStorage = false): any {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) {
    return node.map((item) => extractAndCacheAttachments(item, stripLargeForLocalStorage));
  }

  // Detect FileAttachment object
  if (
    typeof node.id === 'string' &&
    node.id.startsWith('att-') &&
    typeof node.name === 'string' &&
    typeof node.dataUrl === 'string'
  ) {
    if (!node.dataUrl.startsWith('__idb_att__:') && node.dataUrl.length > 0) {
      cacheAttachmentInMemoryAndIDB(node as FileAttachment);
      if (stripLargeForLocalStorage && node.dataUrl.length > 25000) {
        return {
          ...node,
          dataUrl: `__idb_att__:${node.id}`,
        };
      }
    }
    return node;
  }

  const clone: Record<string, any> = {};
  for (const k of Object.keys(node)) {
    clone[k] = extractAndCacheAttachments(node[k], stripLargeForLocalStorage);
  }
  return clone;
}

function rehydrateAttachmentsSync(node: any): any {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) {
    return node.map(rehydrateAttachmentsSync);
  }

  if (
    typeof node.id === 'string' &&
    node.id.startsWith('att-') &&
    typeof node.dataUrl === 'string' &&
    node.dataUrl.startsWith('__idb_att__:')
  ) {
    const attId = node.id;
    const cached = attachmentMemCache[attId];
    if (cached && cached.dataUrl && !cached.dataUrl.startsWith('__idb_att__:')) {
      return {
        ...node,
        dataUrl: cached.dataUrl,
        extractedHtml: node.extractedHtml || cached.extractedHtml,
        extractedText: node.extractedText || cached.extractedText,
      };
    }
    return node;
  }

  const clone: Record<string, any> = {};
  for (const k of Object.keys(node)) {
    clone[k] = rehydrateAttachmentsSync(node[k]);
  }
  return clone;
}

// ============================================================================
// 4. SYNCHRONOUS READ & SAFE WRITE API (Used by all Pages & Storage Helpers)
// ============================================================================
export function readPersistedKey<T>(key: string, defaultVal: T): T {
  if (memStore[key] !== undefined) {
    return rehydrateAttachmentsSync(memStore[key]) as T;
  }
  if (typeof window === 'undefined') return defaultVal;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        memStore[key] = parsed;
        const ts = Number(localStorage.getItem(key + '_updated_at') || 0);
        if (ts > 0) memUpdatedAt[key] = ts;
        return rehydrateAttachmentsSync(parsed) as T;
      }
    }
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
  }
  return defaultVal;
}

export function getPersistedKeyUpdatedAt(key: string): number {
  if (memUpdatedAt[key]) return memUpdatedAt[key];
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(key + '_updated_at') || 0);
}

/**
 * Safely writes to:
 * 1) In-memory hot cache (`memStore`)
 * 2) Browser IndexedDB (`ndh_persistent_db` - unlimited size for Word/PDF/Images)
 * 3) Browser `localStorage` (automatically offloading large binary `dataUrl` if >5MB quota is reached)
 * 4) Universal Cloud Store (`/api/cloud-store` on current origin + `https://hoahoc-thcs-ndh.vercel.app/api/cloud-store`)
 */
export function writePersistedKey(
  key: string,
  value: any,
  options?: {
    updatedAt?: number;
    fromRemote?: boolean;
    eventName?: string;
  }
): void {
  if (typeof window === 'undefined') return;
  const now = options?.updatedAt || Date.now();

  // Extract & cache any attachments into IndexedDB + memory
  extractAndCacheAttachments(value, false);

  memStore[key] = value;
  memUpdatedAt[key] = now;

  // 1. Always save full data (with full binary attachments) to IndexedDB
  idbPut(KV_STORE, key, { data: value, updatedAt: now }).catch(() => {});

  // 2. Save to localStorage with automatic fallback if 5MB quota is exceeded
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(key + '_updated_at', String(now));
  } catch {
    try {
      // Strip large base64 dataUrl strings from localStorage copy (they are safely in IndexedDB & Cloud!)
      const lightweight = extractAndCacheAttachments(value, true);
      localStorage.setItem(key, JSON.stringify(lightweight));
      localStorage.setItem(key + '_updated_at', String(now));
    } catch {
      try {
        // Free up space from old non-critical cache and retry lightweight save
        localStorage.setItem(key + '_updated_at', String(now));
      } catch {}
    }
  }

  // 3. Dispatch event so open components update immediately
  const ev = options?.eventName || KEY_EVENT_MAP[key];
  if (ev) {
    window.dispatchEvent(new CustomEvent(ev));
  }

  // 4. Push to Cloud Store if this write originated from user action on this device
  if (!options?.fromRemote) {
    scheduleCloudPush(key, value, now);
  }
}

export function hasViewedInCurrentSession(targetId: string, actorKey: string): boolean {
  const composite = `${targetId}::${actorKey}`;
  if (sessionViewedTargets.has(composite)) return true;
  sessionViewedTargets.add(composite);
  return false;
}

// ============================================================================
// 5. SMART MERGE LOGIC (Preserves user posts/comments/logs across devices)
// ============================================================================
const DEFAULT_SAMPLE_IDS = new Set([
  'hw-1',
  'hw-2',
  'hw-3',
  'ann-1',
  'ann-2',
  'quiz-default-1',
  'quiz-default-2',
  'quiz-default-3',
  'mat-1',
  'mat-2',
  'mat-3',
  'mat-4',
  'exp-1',
  'exp-2',
  'exp-3',
  'exp-4',
  'online-1',
  'online-2',
  'sch-1',
  'sch-2',
]);

function mergeArrayItemsById(localArr: any[], remoteArr: any[], preferRemoteOrder: boolean): any[] {
  const deletedIds = getDeletedItemIds();
  const primary = preferRemoteOrder ? remoteArr : localArr;
  const secondary = preferRemoteOrder ? localArr : remoteArr;

  const map = new Map<string, any>();
  const orderedIds: string[] = [];

  const getItemKey = (item: any, idx: number): string => {
    if (!item || typeof item !== 'object') return `idx-${idx}`;
    return String(
      item.id ||
        item.uid ||
        item.studentCode ||
        (item.fullName && item.createdAt ? `${item.fullName}-${item.createdAt}` : '') ||
        `idx-${idx}`
    );
  };

  primary.forEach((item, idx) => {
    if (!item) return;
    const k = getItemKey(item, idx);
    if (deletedIds.has(k)) return;
    map.set(k, item);
    orderedIds.push(k);
  });

  secondary.forEach((item, idx) => {
    if (!item) return;
    const k = getItemKey(item, idx);
    if (deletedIds.has(k)) return;
    if (!map.has(k)) {
      // Only re-add a default sample item if primary is completely empty
      if (DEFAULT_SAMPLE_IDS.has(k) && primary.length > 0) {
        return;
      }
      map.set(k, item);
      orderedIds.push(k);
    } else {
      // Merge attachments or fields if primary had stripped attachment placeholder
      const existing = map.get(k);
      if (existing && typeof existing === 'object' && typeof item === 'object') {
        map.set(k, { ...item, ...existing });
      }
    }
  });

  return orderedIds.map((k) => map.get(k)).filter(Boolean);
}

function mergeKeyData(
  key: string,
  localData: any,
  localTs: number,
  remoteData: any,
  remoteTs: number
): { merged: any; updatedAt: number; changedLocal: boolean; shouldPushBackToCloud: boolean } {
  const preferRemote = remoteTs >= localTs;
  const maxTs = Math.max(localTs, remoteTs) || Date.now();

  if (remoteData === undefined || remoteData === null) {
    return {
      merged: localData,
      updatedAt: localTs,
      changedLocal: false,
      shouldPushBackToCloud: localTs > 0 && localData !== undefined,
    };
  }

  if (localData === undefined || localData === null || localTs === 0) {
    return {
      merged: remoteData,
      updatedAt: remoteTs || Date.now(),
      changedLocal: true,
      shouldPushBackToCloud: false,
    };
  }

  // Merge array collections (Homework, Announcements, Exams, Submissions, Materials, Experiments, Online Sessions, Leave Requests, Schedules)
  if (Array.isArray(localData) && Array.isArray(remoteData)) {
    // Special case for student roster (`ndh_students`): use newest timestamp directly when explicitly updated
    if (key === 'ndh_students') {
      const chosen = preferRemote ? remoteData : localData;
      return {
        merged: chosen,
        updatedAt: maxTs,
        changedLocal: JSON.stringify(chosen) !== JSON.stringify(localData),
        shouldPushBackToCloud: localTs > remoteTs,
      };
    }

    const mergedArr = mergeArrayItemsById(localData, remoteData, preferRemote);
    const localStr = JSON.stringify(localData);
    const remoteStr = JSON.stringify(remoteData);
    const mergedStr = JSON.stringify(mergedArr);

    return {
      merged: mergedArr,
      updatedAt: maxTs,
      changedLocal: mergedStr !== localStr,
      shouldPushBackToCloud: mergedStr !== remoteStr && localTs > 0,
    };
  }

  // Merge Comments Map (`ndh_item_comments`)
  if (key === 'ndh_item_comments' && typeof localData === 'object' && typeof remoteData === 'object') {
    const deletedIds = getDeletedItemIds();
    const mergedMap: Record<string, any[]> = {};
    const allTargets = new Set([...Object.keys(remoteData), ...Object.keys(localData)]);
    for (const tId of allTargets) {
      const lList = Array.isArray(localData[tId]) ? localData[tId] : [];
      const rList = Array.isArray(remoteData[tId]) ? remoteData[tId] : [];
      const byId = new Map<string, any>();
      [...rList, ...lList].forEach((c) => {
        if (c && c.id && c.id !== 'c-1' && !deletedIds.has(c.id)) {
          byId.set(c.id, c);
        }
      });
      mergedMap[tId] = Array.from(byId.values());
    }
    return {
      merged: mergedMap,
      updatedAt: maxTs,
      changedLocal: JSON.stringify(mergedMap) !== JSON.stringify(localData),
      shouldPushBackToCloud: JSON.stringify(mergedMap) !== JSON.stringify(remoteData) && localTs > 0,
    };
  }

  // Merge Media Activity Logs (`ndh_media_activity_logs`)
  if (key === 'ndh_media_activity_logs' && typeof localData === 'object' && typeof remoteData === 'object') {
    const mergedLogs: Record<string, any> = {};
    const allTargets = new Set([...Object.keys(remoteData), ...Object.keys(localData)]);
    const dedupeEntries = (a: any[] = [], b: any[] = []) => {
      const seen = new Set<string>();
      const out: any[] = [];
      for (const e of [...a, ...b]) {
        if (!e || !e.userName) continue;
        const k = `${String(e.userName).toLowerCase().trim()}::${String(e.userClass || '').toLowerCase().trim()}`;
        if (!seen.has(k)) {
          seen.add(k);
          out.push(e);
        }
      }
      return out.slice(0, 200);
    };

    for (const tId of allTargets) {
      const lLog = localData[tId] || {};
      const rLog = remoteData[tId] || {};
      const primaryLog = preferRemote ? rLog : lLog;
      const secondaryLog = preferRemote ? lLog : rLog;
      mergedLogs[tId] = {
        targetId: tId,
        views: dedupeEntries(primaryLog.views, secondaryLog.views),
        writes: dedupeEntries(primaryLog.writes, secondaryLog.writes),
        downloads: dedupeEntries(primaryLog.downloads, secondaryLog.downloads),
      };
    }
    return {
      merged: mergedLogs,
      updatedAt: maxTs,
      changedLocal: JSON.stringify(mergedLogs) !== JSON.stringify(localData),
      shouldPushBackToCloud: JSON.stringify(mergedLogs) !== JSON.stringify(remoteData) && localTs > 0,
    };
  }

  // Merge YouTube Channel Data (`ndh_youtube_channel_data`)
  if (key === 'ndh_youtube_channel_data' && typeof localData === 'object' && typeof remoteData === 'object') {
    const primary = preferRemote ? remoteData : localData;
    const secondary = preferRemote ? localData : remoteData;
    const mergedYt = {
      ...secondary,
      ...primary,
      globalLessonLinks: mergeArrayItemsById(
        localData.globalLessonLinks || [],
        remoteData.globalLessonLinks || [],
        preferRemote
      ),
      posts: mergeArrayItemsById(localData.posts || [], remoteData.posts || [], preferRemote),
    };
    return {
      merged: mergedYt,
      updatedAt: maxTs,
      changedLocal: JSON.stringify(mergedYt) !== JSON.stringify(localData),
      shouldPushBackToCloud: JSON.stringify(mergedYt) !== JSON.stringify(remoteData) && localTs > 0,
    };
  }

  // Default object/value merge
  const chosen = preferRemote ? remoteData : localData;
  return {
    merged: chosen,
    updatedAt: maxTs,
    changedLocal: JSON.stringify(chosen) !== JSON.stringify(localData),
    shouldPushBackToCloud: localTs > remoteTs,
  };
}

// ============================================================================
// 6. UNIVERSAL CLOUD STORE API CLIENT (Works on Vercel, Netlify & AI Studio)
// ============================================================================
function getCandidateCloudEndpoints(): string[] {
  if (typeof window === 'undefined') return [];
  const host = window.location.hostname.toLowerCase();
  // On Netlify or other static mirrors, try local /api/cloud-store first only if on vercel/run.app/localhost,
  // and always include VERCEL_CLOUD_API so Netlify & Vercel share the exact same live database!
  if (host.includes('netlify.app')) {
    return [VERCEL_CLOUD_API];
  }
  if (host === 'hoahoc-thcs-ndh.vercel.app') {
    return ['/api/cloud-store'];
  }
  return ['/api/cloud-store', VERCEL_CLOUD_API];
}

const pendingPushQueue: Record<string, { data: any; updatedAt: number }> = {};
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const pushedAttachmentIds = new Set<string>();

function collectAttachmentsToUpload(node: any, out: FileAttachment[] = []): FileAttachment[] {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    node.forEach((item) => collectAttachmentsToUpload(item, out));
    return out;
  }
  if (
    typeof node.id === 'string' &&
    node.id.startsWith('att-') &&
    typeof node.name === 'string'
  ) {
    const cached = attachmentMemCache[node.id] || node;
    if (
      cached &&
      typeof cached.dataUrl === 'string' &&
      !cached.dataUrl.startsWith('__idb_att__:') &&
      cached.dataUrl.length > 0
    ) {
      out.push(cached as FileAttachment);
    }
    return out;
  }
  for (const k of Object.keys(node)) {
    collectAttachmentsToUpload(node[k], out);
  }
  return out;
}

export async function pushAttachmentToCloud(att: FileAttachment): Promise<void> {
  if (!att || !att.id || !att.dataUrl || att.dataUrl.startsWith('__idb_att__:')) return;
  if (pushedAttachmentIds.has(att.id)) return;
  // Only upload attachments up to 4MB to cloud-store
  if (att.dataUrl.length > 5_500_000) return;

  pushedAttachmentIds.add(att.id);
  const endpoints = getCandidateCloudEndpoints();
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_attachment',
          attachmentId: att.id,
          attachment: att,
        }),
      });
      if (res.ok) break;
    } catch {}
  }
}

export async function fetchCloudAttachment(attId: string): Promise<FileAttachment | null> {
  if (!attId) return null;
  const endpoints = getCandidateCloudEndpoints();
  for (const ep of endpoints) {
    try {
      const url = `${ep}?attachmentId=${encodeURIComponent(attId)}`;
      const res = await fetch(url);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const json = await res.json();
        if (json?.attachment?.dataUrl) {
          return json.attachment as FileAttachment;
        }
      }
    } catch {}
  }
  return null;
}

function scheduleCloudPush(key: string, data: any, updatedAt: number): void {
  // Upload any embedded attachments separately so the main key payload stays fast and compact
  const atts = collectAttachmentsToUpload(data);
  atts.forEach((att) => {
    pushAttachmentToCloud(att).catch(() => {});
  });

  // For attachments > 80KB, store lightweight reference in cloud key index if needed, or keep inline if < 80KB
  const prepareCloudPayload = (node: any): any => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(prepareCloudPayload);
    if (
      typeof node.id === 'string' &&
      node.id.startsWith('att-') &&
      typeof node.dataUrl === 'string' &&
      node.dataUrl.length > 80000
    ) {
      return {
        ...node,
        dataUrl: `__idb_att__:${node.id}`,
      };
    }
    const out: Record<string, any> = {};
    for (const k of Object.keys(node)) {
      out[k] = prepareCloudPayload(node[k]);
    }
    return out;
  };

  pendingPushQueue[key] = {
    data: prepareCloudPayload(data),
    updatedAt,
  };

  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    flushCloudPushQueue().catch(() => {});
  }, 350);
}

export async function flushCloudPushQueue(): Promise<void> {
  const keysToPush = Object.keys(pendingPushQueue);
  if (keysToPush.length === 0) return;

  const batch: Record<string, CloudKeyEntry> = {};
  for (const k of keysToPush) {
    batch[k] = pendingPushQueue[k];
    delete pendingPushQueue[k];
  }

  const endpoints = getCandidateCloudEndpoints();
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_keys',
          keys: batch,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        // Successfully persisted to Cloud Store!
      }
    } catch {}
  }
}

async function rehydrateMissingAttachmentsFromCloudOrIDB(node: any): Promise<boolean> {
  if (!node || typeof node !== 'object') return false;
  let mutated = false;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (await rehydrateMissingAttachmentsFromCloudOrIDB(node[i])) {
        mutated = true;
      }
    }
    return mutated;
  }

  if (
    typeof node.id === 'string' &&
    node.id.startsWith('att-') &&
    typeof node.dataUrl === 'string' &&
    (node.dataUrl.startsWith('__idb_att__:') || !node.dataUrl)
  ) {
    const resolvedUrl = await resolveAttachmentDataUrl(node as FileAttachment);
    if (resolvedUrl && !resolvedUrl.startsWith('__idb_att__:')) {
      node.dataUrl = resolvedUrl;
      mutated = true;
    }
    return mutated;
  }

  for (const k of Object.keys(node)) {
    if (await rehydrateMissingAttachmentsFromCloudOrIDB(node[k])) {
      mutated = true;
    }
  }
  return mutated;
}

/**
 * Hydrate all keys from Browser IndexedDB first (instant, supports large Word/PDF/Images),
 * then synchronize with Universal Cloud Store (`/api/cloud-store`).
 */
export async function hydrateAndSyncFromCloud(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Step 1: Hydrate attachments & keys from IndexedDB into hot memory cache
  try {
    const attKeys = await idbGetAllKeys(ATT_STORE);
    for (const attId of attKeys) {
      const att = await idbGet<FileAttachment>(ATT_STORE, attId);
      if (att && att.dataUrl) {
        attachmentMemCache[attId] = att;
      }
    }

    const kvKeys = await idbGetAllKeys(KV_STORE);
    for (const key of kvKeys) {
      const entry = await idbGet<CloudKeyEntry>(KV_STORE, key);
      if (entry && entry.data !== undefined) {
        const localTs = getPersistedKeyUpdatedAt(key);
        if ((entry.updatedAt || 0) >= localTs || memStore[key] === undefined) {
          const hydrated = rehydrateAttachmentsSync(entry.data);
          memStore[key] = hydrated;
          memUpdatedAt[key] = entry.updatedAt || localTs || Date.now();
          try {
            const lightweight = extractAndCacheAttachments(hydrated, true);
            localStorage.setItem(key, JSON.stringify(lightweight));
            localStorage.setItem(key + '_updated_at', String(memUpdatedAt[key]));
          } catch {}
          if (KEY_EVENT_MAP[key]) {
            window.dispatchEvent(new CustomEvent(KEY_EVENT_MAP[key]));
          }
        }
      }
    }
  } catch (e) {
    console.warn('IndexedDB hydration warning:', e);
  }

  // Step 2: Pull latest snapshot from Universal Cloud Store (`/api/cloud-store`)
  const endpoints = getCandidateCloudEndpoints();
  let cloudKeys: Record<string, CloudKeyEntry> | null = null;

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${ep}?t=${Date.now()}`);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const json = await res.json();
        if (json && json.keys && typeof json.keys === 'object') {
          cloudKeys = json.keys;
          break;
        }
      }
    } catch {}
  }

  if (!cloudKeys) return;

  // Step 3: Merge deleted IDs first
  if (cloudKeys[DELETED_IDS_KEY]?.data && Array.isArray(cloudKeys[DELETED_IDS_KEY].data)) {
    const localDel = getDeletedItemIds();
    cloudKeys[DELETED_IDS_KEY].data.forEach((id: string) => localDel.add(id));
    const mergedDel = Array.from(localDel);
    memStore[DELETED_IDS_KEY] = mergedDel;
    try {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(mergedDel));
    } catch {}
  }

  // Step 4: Merge each application key between Local and Cloud
  const keysToInspect = new Set([...ALL_SYNCED_KEYS, ...Object.keys(cloudKeys)]);
  for (const key of keysToInspect) {
    if (key === DELETED_IDS_KEY || !KEY_EVENT_MAP[key]) continue;

    const localData = readPersistedKey<any>(key, undefined);
    const localTs = getPersistedKeyUpdatedAt(key);
    const remoteEntry = cloudKeys[key];
    const remoteData = remoteEntry?.data;
    const remoteTs = Number(remoteEntry?.updatedAt || 0);

    const { merged, updatedAt, changedLocal, shouldPushBackToCloud } = mergeKeyData(
      key,
      localData,
      localTs,
      remoteData,
      remoteTs
    );

    if (merged !== undefined) {
      // Rehydrate any attachment placeholders from IDB or Cloud
      await rehydrateMissingAttachmentsFromCloudOrIDB(merged);

      if (changedLocal || memStore[key] === undefined) {
        writePersistedKey(key, merged, {
          updatedAt,
          fromRemote: !shouldPushBackToCloud,
        });
      } else if (shouldPushBackToCloud) {
        scheduleCloudPush(key, merged, updatedAt);
      }
    }
  }
}

let persistenceInitialized = false;
export function initCloudPersistence(): void {
  if (typeof window === 'undefined' || persistenceInitialized) return;
  persistenceInitialized = true;

  hydrateAndSyncFromCloud().catch(() => {});

  // Sync whenever user switches back to tab or wakes phone/computer
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      hydrateAndSyncFromCloud().catch(() => {});
    }
  });

  // Periodic background sync every 25 seconds so multi-device interactions stay live without exhausting quotas
  setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      hydrateAndSyncFromCloud().catch(() => {});
    }
  }, 25000);
}

if (typeof window !== 'undefined') {
  initCloudPersistence();
}
