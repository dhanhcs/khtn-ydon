import { StudentRecord, TuitionRecord } from '../types';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import bundledRosterJson from '../../ndh-roster.json';

export const DEFAULT_STUDENT_ROSTER: StudentRecord[] = Array.isArray(bundledRosterJson)
  ? (bundledRosterJson as any[])
  : [];

const LEGACY_MOCK_IDS = new Set([
  's-1',
  's-2',
  's-3',
  's-4',
  's-5',
  's-6',
  's-7',
  's-8',
  's-9',
  's-10',
]);

const LOCAL_ROSTER_KEY = 'ndh_students';
const LOCAL_ROSTER_UPDATED_KEY = 'ndh_students_updated_at';
const LOCAL_ROSTER_USER_MODIFIED_KEY = 'ndh_students_user_modified_at';
const LOCAL_ROSTER_CLEARED_KEY = 'ndh_students_explicitly_cleared';
const LOCAL_TUITION_UPDATED_KEY = 'ndh_tuitions_updated_at';

function normalizeMonthlyTuitionRecord(s: any): StudentRecord {
  if (!s || typeof s !== 'object') return s;
  if (s.monthlyTuition && typeof s.monthlyTuition === 'object') {
    const mt = { ...s.monthlyTuition };
    const th07 = mt['Th07'] || mt['Th 07'] || '';
    if (th07) {
      mt['Th07'] = th07;
      mt['Th 07'] = th07;
    }
    return { ...s, monthlyTuition: mt };
  }
  return s;
}

/**
 * Remove accents and normalize Vietnamese strings for flexible name matching
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Retrieve the active student roster uploaded by the teacher
 */
export function getActiveStudentRoster(): StudentRecord[] {
  try {
    const explicitlyCleared = localStorage.getItem(LOCAL_ROSTER_CLEARED_KEY);
    const local = localStorage.getItem(LOCAL_ROSTER_KEY) || localStorage.getItem('ndh_student_roster_v1');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .filter((s: any) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id))
          .map(normalizeMonthlyTuitionRecord);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(cleaned));
        }
        if (cleaned.length > 0 || explicitlyCleared) {
          return cleaned;
        }
      }
    }
    if (!explicitlyCleared && DEFAULT_STUDENT_ROSTER.length > 0) {
      const seeded = DEFAULT_STUDENT_ROSTER.filter(
        (s: any) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id)
      ).map(normalizeMonthlyTuitionRecord);
      if (seeded.length > 0) {
        localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(seeded));
        return seeded;
      }
    }
  } catch (e) {
    console.warn('Error reading local student roster:', e);
  }
  return [];
}

/**
 * Get the last saved timestamp for the student roster
 */
export function getLastRosterSavedTime(): string {
  try {
    const ts = localStorage.getItem(LOCAL_ROSTER_UPDATED_KEY);
    if (ts) {
      const date = new Date(Number(ts));
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }
    }
  } catch {}
  return '';
}

/**
 * Save updated student roster (after teacher upload, manual save, edit, delete, or online tuition payment)
 * and sync to backend /api/roster AND Firestore so the list is permanently saved across reloads and devices.
 */
export async function saveActiveStudentRoster(roster: StudentRecord[]): Promise<boolean> {
  const cleanRoster = Array.isArray(roster)
    ? roster
        .filter((s) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id))
        .map(normalizeMonthlyTuitionRecord)
    : [];
  const now = Date.now();

  try {
    localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(cleanRoster));
    localStorage.setItem(LOCAL_ROSTER_UPDATED_KEY, String(now));
    localStorage.setItem(LOCAL_ROSTER_USER_MODIFIED_KEY, String(now));
    if (cleanRoster.length === 0) {
      localStorage.setItem(LOCAL_ROSTER_CLEARED_KEY, String(now));
    } else {
      localStorage.removeItem(LOCAL_ROSTER_CLEARED_KEY);
    }
    window.dispatchEvent(new CustomEvent('ndh-roster-updated'));
  } catch (e) {
    console.warn('Error saving local student roster:', e);
  }

  let serverOk = false;

  // 1. Write to Cloud Firestore first (shared across PC, Mobile, AI Studio preview, and Published Cloud Run)
  try {
    await setDoc(
      doc(db, 'app_settings', 'student_roster'),
      {
        students: cleanRoster,
        count: cleanRoster.length,
        updatedAt: now,
        explicitlyCleared: cleanRoster.length === 0,
        updatedAtIso: new Date(now).toISOString(),
      },
      { merge: false }
    );
    serverOk = true;
  } catch (e) {
    console.warn('Error syncing roster to Cloud Firestore:', e);
  }

  // 2. Write to Backend /api/roster
  try {
    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: cleanRoster, updatedAt: now }),
    });
    if (res.ok) {
      serverOk = true;
    }
  } catch (e) {
    console.warn('Error syncing roster to /api/roster:', e);
  }

  return serverOk;
}

/**
 * Delete a single student from the roster by id, studentCode, or fullName+class and persist immediately.
 */
export function deleteStudentFromRoster(
  currentRoster: StudentRecord[],
  targetStudent: StudentRecord
): StudentRecord[] {
  const targetId = targetStudent.id;
  const targetCode = (targetStudent.studentCode || '').trim().toLowerCase();
  const targetNameNorm = normalizeVietnamese(targetStudent.fullName);
  const targetClass = targetStudent.enrolledClass;

  let removedOnce = false;
  const nextRoster = currentRoster.filter((s) => {
    if (removedOnce) return true;
    if (targetId && s.id === targetId) {
      removedOnce = true;
      return false;
    }
    if (targetCode && s.studentCode && s.studentCode.trim().toLowerCase() === targetCode) {
      removedOnce = true;
      return false;
    }
    if (
      normalizeVietnamese(s.fullName) === targetNameNorm &&
      s.enrolledClass === targetClass
    ) {
      removedOnce = true;
      return false;
    }
    return true;
  });

  saveActiveStudentRoster(nextRoster);
  return nextRoster;
}

/**
 * Delete multiple students by their IDs or codes and persist immediately.
 */
export function deleteMultipleStudentsFromRoster(
  currentRoster: StudentRecord[],
  selectedKeys: Set<string>
): StudentRecord[] {
  if (!selectedKeys || selectedKeys.size === 0) return currentRoster;
  const nextRoster = currentRoster.filter((s) => {
    const key = s.id || s.studentCode;
    return !selectedKeys.has(key);
  });
  saveActiveStudentRoster(nextRoster);
  return nextRoster;
}

/**
 * Clear either a specific class's student list or the entire student roster across all classes.
 */
export async function clearStudentRoster(
  currentRoster: StudentRecord[],
  className: string | 'all' = 'all'
): Promise<StudentRecord[]> {
  const nextRoster =
    className && className !== 'all'
      ? currentRoster.filter((s) => s.enrolledClass !== className)
      : [];

  await saveActiveStudentRoster(nextRoster);

  try {
    const query =
      className && className !== 'all'
        ? `?className=${encodeURIComponent(className)}`
        : '';
    await fetch(`/api/roster${query}`, { method: 'DELETE' });
  } catch {}

  return nextRoster;
}

function getRosterSignature(list: StudentRecord[]): string {
  if (!Array.isArray(list) || list.length === 0) return 'empty';
  return `${list.length}:${list
    .slice(0, 15)
    .map((s) => `${s.studentCode || ''}-${s.fullName}-${s.enrolledClass}-${s.tuitionStatus || ''}`)
    .join('|')}`;
}

/**
 * Synchronize student roster across Cloud Firestore, Server (/api/roster), and Local Device (PC / Mobile).
 * Guarantees that whatever was uploaded on the Computer immediately syncs to the Phone and Published App.
 */
export async function syncStudentRosterFromServer(
  forcePullFromCloud = false
): Promise<StudentRecord[]> {
  const localCurrent = getActiveStudentRoster();
  const userModifiedAt = Number(localStorage.getItem(LOCAL_ROSTER_USER_MODIFIED_KEY) || 0);
  const clearedRaw = localStorage.getItem(LOCAL_ROSTER_CLEARED_KEY);
  const localClearedAt = clearedRaw === 'true' ? 0 : Number(clearedRaw || 0);

  let cloudStudents: StudentRecord[] = [];
  let cloudUpdatedAt = 0;
  let cloudExplicitlyCleared = false;

  // 1. Check Cloud Firestore (shared between AI Studio dev, Published app, PC, and Mobile)
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'student_roster'));
    if (snap.exists()) {
      const fsData = snap.data();
      if (fsData && Array.isArray(fsData.students)) {
        cloudStudents = fsData.students
          .filter((s: any) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id))
          .map(normalizeMonthlyTuitionRecord);
        cloudUpdatedAt = Number(fsData.updatedAt || 0);
        cloudExplicitlyCleared = Boolean(fsData.explicitlyCleared);
      }
    }
  } catch {}

  // 2. Check Backend /api/roster (only if JSON response, ignoring Netlify SPA HTML fallback)
  let serverStudents: StudentRecord[] = [];
  let serverUpdatedAt = 0;
  try {
    const res = await fetch('/api/roster');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.students)) {
        serverStudents = data.students
          .filter((s: any) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id))
          .map(normalizeMonthlyTuitionRecord);
        serverUpdatedAt = Number(data.updatedAt || 0);
      }
    }
  } catch {}

  // Pick the newest remote source between Cloud Firestore and Server /api/roster
  let bestRemoteStudents = cloudStudents;
  let bestRemoteUpdatedAt = cloudUpdatedAt;
  let bestRemoteCleared = cloudExplicitlyCleared;

  if (
    serverStudents.length > 0 &&
    (serverUpdatedAt > cloudUpdatedAt || (cloudStudents.length === 0 && !cloudExplicitlyCleared))
  ) {
    bestRemoteStudents = serverStudents;
    bestRemoteUpdatedAt = serverUpdatedAt || Date.now();
    bestRemoteCleared = false;

    // Also push server's newer roster to Cloud Firestore so Mobile & Published app get it immediately
    if (serverUpdatedAt > cloudUpdatedAt || cloudStudents.length === 0) {
      setDoc(
        doc(db, 'app_settings', 'student_roster'),
        {
          students: serverStudents,
          count: serverStudents.length,
          updatedAt: bestRemoteUpdatedAt,
          explicitlyCleared: false,
          updatedAtIso: new Date(bestRemoteUpdatedAt).toISOString(),
        },
        { merge: false }
      ).catch(() => {});
    }
  }

  // If THIS device has un-synced user edits (e.g. Teacher's Computer where file was uploaded before cloud sync was active)
  // and Cloud Firestore is empty or older than userModifiedAt, push localCurrent to Cloud Firestore!
  if (
    !forcePullFromCloud &&
    localCurrent.length > 0 &&
    (bestRemoteStudents.length === 0 || (userModifiedAt > 0 && userModifiedAt > bestRemoteUpdatedAt))
  ) {
    const pushTime = Math.max(userModifiedAt, Date.now());
    localStorage.setItem(LOCAL_ROSTER_UPDATED_KEY, String(pushTime));
    setDoc(
      doc(db, 'app_settings', 'student_roster'),
      {
        students: localCurrent,
        count: localCurrent.length,
        updatedAt: pushTime,
        explicitlyCleared: false,
        updatedAtIso: new Date(pushTime).toISOString(),
      },
      { merge: false }
    ).catch(() => {});

    fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: localCurrent, updatedAt: pushTime }),
    }).catch(() => {});

    return localCurrent;
  }

  // Otherwise, if Remote (Cloud Firestore / Server) has students, adopt Remote on this device (e.g. Phone)!
  if (bestRemoteStudents.length > 0) {
    const diffSignature =
      getRosterSignature(bestRemoteStudents) !== getRosterSignature(localCurrent);
    const shouldPullRemote =
      forcePullFromCloud ||
      localCurrent.length === 0 ||
      userModifiedAt === 0 ||
      bestRemoteUpdatedAt >= userModifiedAt ||
      diffSignature;

    if (shouldPullRemote && !(localClearedAt > bestRemoteUpdatedAt)) {
      localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(bestRemoteStudents));
      localStorage.setItem(
        LOCAL_ROSTER_UPDATED_KEY,
        String(bestRemoteUpdatedAt || Date.now())
      );
      localStorage.removeItem(LOCAL_ROSTER_CLEARED_KEY);
      window.dispatchEvent(new CustomEvent('ndh-roster-updated'));

      if (serverStudents.length === 0 || bestRemoteUpdatedAt > serverUpdatedAt) {
        fetch('/api/roster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            students: bestRemoteStudents,
            updatedAt: bestRemoteUpdatedAt,
          }),
        }).catch(() => {});
      }
      return bestRemoteStudents;
    }
  } else if (bestRemoteCleared && bestRemoteUpdatedAt >= userModifiedAt) {
    localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_ROSTER_UPDATED_KEY, String(bestRemoteUpdatedAt));
    localStorage.setItem(LOCAL_ROSTER_CLEARED_KEY, String(bestRemoteUpdatedAt));
    window.dispatchEvent(new CustomEvent('ndh-roster-updated'));
    return [];
  }

  return localCurrent;
}

/**
 * Retrieve all tuition records
 */
export function getSavedTuitionRecords(): TuitionRecord[] {
  try {
    const saved = localStorage.getItem('ndh_tuitions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (r: any) => r.id && !['t-1', 't-2', 't-3', 't-4', 't-5'].includes(r.id)
        );
      }
    }
  } catch (e) {
    console.warn('Error reading tuitions:', e);
  }
  return [];
}

/**
 * Save tuition records to localStorage AND Cloud Firestore for cross-device sync
 */
export function saveTuitionRecords(records: TuitionRecord[]) {
  const now = Date.now();
  try {
    localStorage.setItem('ndh_tuitions', JSON.stringify(records));
    localStorage.setItem(LOCAL_TUITION_UPDATED_KEY, String(now));
    window.dispatchEvent(new CustomEvent('ndh-tuition-updated'));
  } catch (e) {
    console.warn('Error saving tuitions:', e);
  }

  setDoc(
    doc(db, 'app_settings', 'tuition_records'),
    {
      records,
      count: records.length,
      updatedAt: now,
    },
    { merge: false }
  ).catch(() => {});
}

// Start real-time Firestore listeners on module load so Phone & Computer stay 100% synchronized live
let realtimeRosterInitialized = false;
export function initRealtimeRosterSync() {
  if (typeof window === 'undefined' || realtimeRosterInitialized) return;
  realtimeRosterInitialized = true;

  syncStudentRosterFromServer().catch(() => {});

  // 1. Real-time listener for Student Roster
  try {
    onSnapshot(
      doc(db, 'app_settings', 'student_roster'),
      (snap) => {
        if (!snap.exists()) return;
        const fsData = snap.data();
        if (!fsData || !Array.isArray(fsData.students)) return;

        const cloudUpdatedAt = Number(fsData.updatedAt || 0);
        const userModifiedAt = Number(localStorage.getItem(LOCAL_ROSTER_USER_MODIFIED_KEY) || 0);
        const localCurrent = getActiveStudentRoster();

        const incoming = fsData.students
          .filter((s: any) => s && s.fullName && !LEGACY_MOCK_IDS.has(s.id))
          .map(normalizeMonthlyTuitionRecord);

        const sigChanged = getRosterSignature(incoming) !== getRosterSignature(localCurrent);

        if (
          cloudUpdatedAt >= userModifiedAt ||
          userModifiedAt === 0 ||
          (localCurrent.length === 0 && incoming.length > 0 && !fsData.explicitlyCleared) ||
          (sigChanged && cloudUpdatedAt >= userModifiedAt)
        ) {
          localStorage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(incoming));
          localStorage.setItem(
            LOCAL_ROSTER_UPDATED_KEY,
            String(cloudUpdatedAt || Date.now())
          );
          if (incoming.length === 0 && fsData.explicitlyCleared) {
            localStorage.setItem(LOCAL_ROSTER_CLEARED_KEY, String(cloudUpdatedAt));
          } else {
            localStorage.removeItem(LOCAL_ROSTER_CLEARED_KEY);
          }
          window.dispatchEvent(new CustomEvent('ndh-roster-updated'));
        }
      },
      () => {}
    );
  } catch {}

  // 2. Real-time listener for Tuition Records
  try {
    onSnapshot(
      doc(db, 'app_settings', 'tuition_records'),
      (snap) => {
        if (!snap.exists()) {
          const localTuitions = getSavedTuitionRecords();
          if (localTuitions.length > 0) {
            saveTuitionRecords(localTuitions);
          }
          return;
        }
        const fsData = snap.data();
        if (!fsData || !Array.isArray(fsData.records)) return;
        const cloudUpdatedAt = Number(fsData.updatedAt || 0);
        const localUpdatedAt = Number(localStorage.getItem(LOCAL_TUITION_UPDATED_KEY) || 0);
        const localTuitions = getSavedTuitionRecords();

        if (
          cloudUpdatedAt >= localUpdatedAt ||
          localUpdatedAt === 0 ||
          (localTuitions.length === 0 && fsData.records.length > 0)
        ) {
          localStorage.setItem('ndh_tuitions', JSON.stringify(fsData.records));
          localStorage.setItem(
            LOCAL_TUITION_UPDATED_KEY,
            String(cloudUpdatedAt || Date.now())
          );
          window.dispatchEvent(new CustomEvent('ndh-tuition-updated'));
        }
      },
      () => {}
    );
  } catch {}
}

if (typeof window !== 'undefined') {
  initRealtimeRosterSync();
}

export function deriveGradeFromClass(cls: string, fallback?: string): string {
  if (fallback) return fallback;
  const upper = (cls || '').toUpperCase();
  if (upper.startsWith('H6') || upper.includes('6')) return 'Khối 6';
  if (upper.startsWith('H7') || upper.includes('7')) return 'Khối 7';
  if (upper.startsWith('H8') || upper.includes('8')) return 'Khối 8';
  if (upper.startsWith('H9') || upper.includes('9')) return 'Khối 9';
  return 'Bồi dưỡng HSG cấp tỉnh, thành phố';
}

export const TUITION_MONTH_COLUMNS = [
  'Th06',
  'Th 07',
  'Th08',
  'Th09',
  'Th10',
  'Th11',
  'Th12',
  'Th01',
  'Th02',
  'Th03',
  'Th04',
  'Th05',
] as const;

export type TuitionMonthColumn = (typeof TUITION_MONTH_COLUMNS)[number];

/**
 * Convert a month string like "10/2026", "07/2026", "7", "Th07", "Th 07" into one of TUITION_MONTH_COLUMNS
 */
export function mapMonthStringToColumnKey(monthStr?: string): TuitionMonthColumn {
  const raw = String(monthStr || '').trim();
  const match = raw.match(/(?:th\s*)?0?([1-9]|1[0-2])(?:\b|\/|\-|$)/i);
  const mNum = match ? Number(match[1]) : new Date().getMonth() + 1;
  switch (mNum) {
    case 6:
      return 'Th06';
    case 7:
      return 'Th 07';
    case 8:
      return 'Th08';
    case 9:
      return 'Th09';
    case 10:
      return 'Th10';
    case 11:
      return 'Th11';
    case 12:
      return 'Th12';
    case 1:
      return 'Th01';
    case 2:
      return 'Th02';
    case 3:
      return 'Th03';
    case 4:
      return 'Th04';
    case 5:
      return 'Th05';
    default:
      return 'Th10';
  }
}

/**
 * Normalize a cell value into 'X' (Đã đóng) or 'Ch' (Chưa đóng)
 */
export function normalizeMonthMark(val: any): 'X' | 'Ch' {
  const s = String(val ?? '')
    .trim()
    .toLowerCase();
  if (
    s === 'x' ||
    s === 'đã đóng' ||
    s === 'da dong' ||
    s === 'paid' ||
    s === '1' ||
    s === '✓' ||
    s === 'v'
  ) {
    return 'X';
  }
  return 'Ch';
}

/**
 * Ensure a student record has a complete 12-month map (Th06..Th05 -> 'X' | 'Ch')
 */
export function ensureMonthlyTuitionMap(
  student?: Partial<StudentRecord>
): Record<string, 'X' | 'Ch'> {
  const base: Record<string, 'X' | 'Ch'> = {};
  TUITION_MONTH_COLUMNS.forEach((col) => {
    base[col] = 'Ch';
  });

  if (student?.monthlyTuition) {
    TUITION_MONTH_COLUMNS.forEach((col) => {
      const altKey = col.replace(/\s+/g, '');
      const rawVal =
        student.monthlyTuition?.[col] ??
        student.monthlyTuition?.[altKey] ??
        'Ch';
      base[col] = normalizeMonthMark(rawVal);
    });
  } else if (student?.tuitionStatus === 'paid') {
    const colKey = mapMonthStringToColumnKey(student.tuitionMonth);
    base[colKey] = 'X';
  }

  return base;
}

/**
 * Update a single month column ('Th06'..'Th05') to 'X' or 'Ch' for a student in the roster,
 * persist to localStorage + server, and return the updated roster.
 */
export function updateStudentMonthTuition(
  roster: StudentRecord[],
  studentKey: string,
  monthCol: TuitionMonthColumn,
  mark: 'X' | 'Ch',
  defaultTuitionAmount: number = 600000
): StudentRecord[] {
  const today = new Date().toLocaleDateString('vi-VN');
  const nextRoster = roster.map((st) => {
    const isMatch =
      (st.id && st.id === studentKey) ||
      (st.studentCode && st.studentCode === studentKey);
    if (!isMatch) return st;

    const nextMonthly = ensureMonthlyTuitionMap(st);
    nextMonthly[monthCol] = mark;

    const paidMonths = TUITION_MONTH_COLUMNS.filter((col) => nextMonthly[col] === 'X');
    const anyPaid = paidMonths.length > 0;
    const latestPaidMonth =
      mark === 'X' ? monthCol : paidMonths[paidMonths.length - 1] || monthCol;

    return {
      ...st,
      monthlyTuition: nextMonthly,
      tuitionStatus: anyPaid ? ('paid' as const) : ('unpaid' as const),
      tuitionMonth: latestPaidMonth,
      tuitionAmount: anyPaid ? st.tuitionAmount || defaultTuitionAmount : 0,
      tuitionPaidDate: anyPaid ? st.tuitionPaidDate || today : '',
      tuitionPaymentMethod: anyPaid
        ? st.tuitionPaymentMethod || 'Theo dõi bảng học phí'
        : '',
      updatedAt: new Date().toISOString(),
    };
  });

  saveActiveStudentRoster(nextRoster);
  return nextRoster;
}

/**
 * Synchronize a tuition payment (online QR or manual) directly into the student roster (`ndh_students`).
 * Automatically marks the corresponding month column (Th06..Th05) as 'X' when paid or 'Ch' when unpaid.
 */
export function syncTuitionPaymentToRoster(params: {
  studentCode?: string;
  studentName: string;
  classGroup: string;
  school?: string;
  phone?: string;
  grade?: string;
  month: string;
  amountPaid: number;
  bankName?: string;
  status: 'paid' | 'partial' | 'unpaid';
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
}): StudentRecord {
  const roster = getActiveStudentRoster();
  const normName = normalizeVietnamese(params.studentName);
  const normCode = (params.studentCode || '').trim().toLowerCase();
  const monthColKey = mapMonthStringToColumnKey(params.month);
  const markVal: 'X' | 'Ch' = params.status === 'paid' ? 'X' : 'Ch';

  const existingIndex = roster.findIndex((s) => {
    if (normCode && s.studentCode && s.studentCode.trim().toLowerCase() === normCode) {
      return true;
    }
    const sName = normalizeVietnamese(s.fullName);
    if (sName === normName && (!params.classGroup || s.enrolledClass === params.classGroup)) {
      return true;
    }
    if (sName === normName) {
      return true;
    }
    return false;
  });

  if (existingIndex >= 0) {
    const existing = roster[existingIndex];
    const nextMonthly = ensureMonthlyTuitionMap(existing);
    nextMonthly[monthColKey] = markVal;

    const updated: StudentRecord = {
      ...existing,
      enrolledClass: params.classGroup || existing.enrolledClass,
      phone: params.phone || existing.phone,
      school: params.school || existing.school,
      monthlyTuition: nextMonthly,
      tuitionStatus: params.status,
      tuitionMonth: params.month,
      tuitionAmount: params.amountPaid,
      tuitionPaidDate: params.paymentDate,
      tuitionPaymentMethod: params.paymentMethod,
      tuitionBankName: params.bankName || existing.tuitionBankName,
      updatedAt: new Date().toISOString(),
    };
    const nextRoster = [...roster];
    nextRoster[existingIndex] = updated;
    saveActiveStudentRoster(nextRoster);
    return updated;
  } else {
    const nextMonthly = ensureMonthlyTuitionMap();
    nextMonthly[monthColKey] = markVal;

    const newStudent: StudentRecord = {
      id: 'st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentCode:
        params.studentCode?.trim() ||
        `NDH-${params.classGroup.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${String(roster.length + 1).padStart(2, '0')}`,
      fullName: params.studentName.trim(),
      phone: params.phone?.trim() || '',
      school: params.school?.trim() || 'THCS',
      grade: deriveGradeFromClass(params.classGroup, params.grade),
      enrolledClass: params.classGroup,
      status: 'studying',
      roadmapStage: 'Đang học đúng lộ trình',
      roadmapProgress: 85,
      roadmapNote: 'Theo dõi lộ trình định kỳ',
      monthlyTuition: nextMonthly,
      tuitionStatus: params.status,
      tuitionMonth: params.month,
      tuitionAmount: params.amountPaid,
      tuitionPaidDate: params.paymentDate,
      tuitionPaymentMethod: params.paymentMethod,
      tuitionBankName: params.bankName,
      notes: params.notes || 'Đã đóng học phí trực tuyến',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      updatedAt: new Date().toISOString(),
    };
    const nextRoster = [newStudent, ...roster];
    saveActiveStudentRoster(nextRoster);
    return newStudent;
  }
}

/**
 * Normalize any class string (from Excel column, sheet name, or Word section header)
 * into a canonical class name so students are automatically filtered into the right class.
 */
export function normalizeClassName(rawInput: string, fallbackClass: string = 'H8.1'): string {
  const raw = String(rawInput || '').trim();
  const safeFallback = fallbackClass === 'all' || !fallbackClass ? 'H8.1' : fallbackClass;
  if (!raw) return safeFallback;

  const lower = raw.toLowerCase();
  if (
    lower.includes('hsg') ||
    lower.includes('bồi dưỡng') ||
    lower.includes('boi duong') ||
    lower.includes('đội tuyển') ||
    lower.includes('tỉnh') ||
    lower.includes('thành phố') ||
    lower === 'lop_hsg_tinh_tp'
  ) {
    return 'Bồi dưỡng HSG cấp tỉnh, thành phố';
  }

  // Match patterns like "H8.1", "Lớp H8.1", "8.1", "H9-2", "Lop_H6.1", "Khối 8 - H8.2", "DS 6.1"
  const codeMatch = raw.match(/([6789])\s*[.,\-_]\s*([1-9])/i);
  if (codeMatch) {
    return `H${codeMatch[1]}.${codeMatch[2]}`;
  }

  // Match patterns like "H6A", "6A", "8B", "9C" -> H6.1, H8.2, H9.3
  const letterMatch = raw.match(/(?:h|k|khối|lớp|lop)?\s*([6789])\s*([abc])\b/i);
  if (letterMatch) {
    const subIdx =
      letterMatch[2].toLowerCase() === 'b'
        ? '2'
        : letterMatch[2].toLowerCase() === 'c'
        ? '3'
        : '1';
    return `H${letterMatch[1]}.${subIdx}`;
  }

  // Match grade patterns like "Khối 6", "Lớp 7", "H6", "H7", "H8", "H9", "Hóa 8", "Hóa 9", "KHTN 6"
  const gradeOnlyMatch = raw.match(/(?:khối|lớp|lop|hóa|hoa|khtn|k|h)\s*([6789])\b/i);
  if (gradeOnlyMatch) {
    return `H${gradeOnlyMatch[1]}.1`;
  }

  // Match standalone digit "6", "7", "8", "9"
  if (/^[6789]$/.test(raw)) {
    return `H${raw}.1`;
  }

  return raw;
}

/**
 * Check if a line or row string is a class section header (e.g. "DANH SÁCH LỚP H8.1", "Lớp: H9.2")
 */
function detectClassSectionHeader(text: string): string | null {
  const cleaned = text.trim();
  if (!cleaned || cleaned.length > 75) return null;
  const lower = cleaned.toLowerCase();
  if (
    /^(danh\s*sách\s*(học\s*sinh\s*)?)?(lớp|nhóm\s*lớp|khối)\s*[:\-]?\s*(h?[6789]([.,\-_][1-9])?|bồi\s*dưỡng|hsg)/i.test(
      cleaned
    ) ||
    /^(h?[6789]\.[1-9]|bồi dưỡng hsg cấp tỉnh, thành phố)$/i.test(cleaned)
  ) {
    return normalizeClassName(cleaned, 'H8.1');
  }
  if (
    (lower.startsWith('lớp ') || lower.startsWith('danh sách lớp')) &&
    (lower.includes('hsg') || /[6789]/.test(lower))
  ) {
    return normalizeClassName(cleaned, 'H8.1');
  }
  return null;
}

/**
 * Parse student list from pasted text (copied from Word/Excel) or extracted from a Word (.docx) file.
 * Automatically detects class per student or class section headers and filters students into each class.
 */
export function parseStudentsFromText(
  rawText: string,
  defaultClass: string = 'H8.1',
  startingIndex: number = 1
): StudentRecord[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: StudentRecord[] = [];
  const currentMonth = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
  const today = new Date().toLocaleDateString('vi-VN');
  let activeSectionClass = defaultClass === 'all' ? 'H8.1' : defaultClass;

  lines.forEach((line, idx) => {
    const headerCls = detectClassSectionHeader(line);
    if (headerCls) {
      activeSectionClass = headerCls;
      return;
    }

    // Skip common header lines
    const lower = line.toLowerCase();
    if (
      lower.includes('họ và tên') ||
      lower.includes('danh sách học sinh') ||
      lower.startsWith('stt')
    ) {
      return;
    }

    // Remove leading numbering like "1.", "01)", "Câu 1:"
    const cleanedLine = line.replace(/^\d+[\.\)\-\s]+/, '').trim();
    if (!cleanedLine) return;

    // Split by Tab, '|', ';', or ' - '
    const parts = cleanedLine
      .split(/\t|\||;|\s+-\s+|\s+–\s+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    let studentCode = '';
    let fullName = '';
    let enrolledClass = activeSectionClass;
    let school = 'THCS';
    let phone = '';
    let isPaid = false;
    const roadmapStage = 'Đang học đúng lộ trình';

    parts.forEach((part) => {
      const pLower = part.toLowerCase();
      if (/^ndh[-_]/i.test(part) || /^hs[-_]\d+/i.test(part)) {
        studentCode = part.toUpperCase();
      } else if (
        /^(?:lớp\s*)?h?[6789][.,\-_][1-9]$/i.test(part) ||
        pLower.includes('bồi dưỡng') ||
        pLower.includes('hsg')
      ) {
        enrolledClass = normalizeClassName(part, activeSectionClass);
        activeSectionClass = enrolledClass;
      } else if (/^0\d{8,10}$/.test(part.replace(/\s+/g, ''))) {
        phone = part;
      } else if (pLower.includes('thcs') || pLower.includes('trường')) {
        school = part;
      } else if (pLower.includes('đã đóng') || pLower.includes('đã nộp')) {
        isPaid = true;
      } else if (!fullName && part.length >= 2 && !/^\d+$/.test(part)) {
        fullName = part;
      }
    });

    if (!fullName) return;

    if (!studentCode) {
      const clsClean = enrolledClass.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4) || 'NDH';
      studentCode = `NDH-${clsClean}-${String(startingIndex + idx).padStart(2, '0')}`;
    }

    results.push({
      id: 'st-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
      studentCode,
      fullName,
      school,
      grade: deriveGradeFromClass(enrolledClass),
      enrolledClass,
      phone,
      status: 'studying',
      roadmapStage,
      roadmapProgress: 85,
      roadmapNote: 'Nắm vững kiến thức trọng tâm',
      tuitionStatus: isPaid ? 'paid' : 'unpaid',
      tuitionMonth: currentMonth,
      tuitionAmount: isPaid ? 600000 : 0,
      tuitionPaidDate: isPaid ? today : '',
      createdAt: today,
    });
  });

  return results;
}

/**
 * Extract student records from a Word (.docx) file
 */
export async function parseStudentsFromDocxFile(
  file: File,
  defaultClass: string = 'H8.1',
  startingIndex: number = 1
): Promise<StudentRecord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value || '';
  return parseStudentsFromText(text, defaultClass, startingIndex);
}

export const parseStudentsFromDocx = parseStudentsFromDocxFile;

/**
 * Build an XLSX WorkSheet following the exact required layout:
 * Row 1: STT | Họ và tên HS | HS trường | Lớp học thêm | Theo dõi đóng học phí (merged across 12 months)
 * Row 2:     |              |           |              | Th06 | Th 07 | Th08 | Th09 | Th10 | Th11 | Th12 | Th01 | Th02 | Th03 | Th04 | Th05
 */
function buildStandardStudentSheetFromRows(dataRows: any[][]): XLSX.WorkSheet {
  const headerRow1 = [
    'STT',
    'Họ và tên HS',
    'HS trường',
    'Lớp học thêm',
    'Theo dõi đóng học phí',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ];
  const headerRow2 = [
    '',
    '',
    '',
    '',
    ...TUITION_MONTH_COLUMNS,
  ];

  const aoa = [headerRow1, headerRow2, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // STT
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Họ và tên HS
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // HS trường
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Lớp học thêm
    { s: { r: 0, c: 4 }, e: { r: 0, c: 15 } }, // Theo dõi đóng học phí (Th06 -> Th05)
  ];

  ws['!cols'] = [
    { wch: 6 }, // STT
    { wch: 24 }, // Họ và tên HS
    { wch: 22 }, // HS trường
    { wch: 20 }, // Lớp học thêm
    ...TUITION_MONTH_COLUMNS.map(() => ({ wch: 7 })),
  ];

  return ws;
}

/**
 * Export a list of StudentRecord to an Excel file with the exact structure:
 * STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06..Th05: "X" or "Ch")
 */
export function exportStudentsToStandardExcel(
  students: StudentRecord[],
  fileName: string,
  sheetName: string = 'Danh_Sach_HS'
): void {
  const rows = students.map((st, idx) => {
    const monthly = ensureMonthlyTuitionMap(st);
    return [
      idx + 1,
      st.fullName,
      st.school || 'THCS',
      st.enrolledClass,
      ...TUITION_MONTH_COLUMNS.map((col) => monthly[col] || 'Ch'),
    ];
  });

  const ws = buildStandardStudentSheetFromRows(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, fileName);
}

/**
 * Generate and download a SINGLE Excel template containing ALL classes (`Tat_Ca_Cac_Lop` + individual class sheets)
 * designed with the exact table structure:
 * STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06 / Th 07 / Th08 / Th09 / Th10 / Th11 / Th12 / Th01 / Th02 / Th03 / Th04 / Th05)
 * with "X" and "Ch" in each month cell.
 */
export function downloadAllClassesTemplateExcel(
  classNames: string[] = [
    'H6.1',
    'H7.1',
    'H8.1',
    'H8.2',
    'H9.1',
    'H9.2',
    'Bồi dưỡng HSG cấp tỉnh, thành phố',
  ],
  _defaultTuitionAmount: number = 600000
): void {
  const sampleNamesByClass: Record<
    string,
    { name: string; school: string; months: Record<string, 'X' | 'Ch'> }[]
  > = {
    'H6.1': [
      {
        name: 'Nguyễn Minh Khang',
        school: 'THCS Quang Trung',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
      {
        name: 'Trần Bảo Ngọc',
        school: 'THCS Nguyễn Du',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'Ch' },
      },
    ],
    'H7.1': [
      {
        name: 'Lê Hoàng Bách',
        school: 'THCS Lê Quý Đôn',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
      {
        name: 'Phạm Hà My',
        school: 'THCS Quang Trung',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'Ch', Th10: 'Ch' },
      },
    ],
    'H8.1': [
      {
        name: 'Võ Quốc Đạt',
        school: 'THCS Nguyễn Trãi',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
      {
        name: 'Đặng Thùy Trang',
        school: 'THCS Quang Trung',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'Ch' },
      },
    ],
    'H8.2': [
      {
        name: 'Hoàng Gia Huy',
        school: 'THCS Chu Văn An',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
    ],
    'H9.1': [
      {
        name: 'Ngô Phương Linh',
        school: 'THCS Lê Quý Đôn',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
      {
        name: 'Bùi Đức Duy',
        school: 'THCS Nguyễn Du',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'Ch', Th10: 'Ch' },
      },
    ],
    'H9.2': [
      {
        name: 'Đỗ Khánh Toàn',
        school: 'THCS Quang Trung',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
    ],
    'Bồi dưỡng HSG cấp tỉnh, thành phố': [
      {
        name: 'Phan Thanh Thảo',
        school: 'THCS Lê Quý Đôn',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
      {
        name: 'Trương Tuấn Kiệt',
        school: 'THCS Chu Văn An',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'X' },
      },
    ],
  };

  const allDataRows: any[][] = [];
  let stt = 1;

  classNames.forEach((cls) => {
    const samples = sampleNamesByClass[cls] || [
      {
        name: `Học sinh mẫu lớp ${cls}`,
        school: 'THCS Quang Trung',
        months: { Th06: 'X', 'Th 07': 'X', Th08: 'X', Th09: 'X', Th10: 'Ch' },
      },
    ];

    samples.forEach((item) => {
      const monthCells = TUITION_MONTH_COLUMNS.map((col) => item.months[col] || 'Ch');
      allDataRows.push([stt++, item.name, item.school, cls, ...monthCells]);
    });
  });

  const wb = XLSX.utils.book_new();
  const wsAll = buildStandardStudentSheetFromRows(allDataRows);
  XLSX.utils.book_append_sheet(wb, wsAll, 'Tat_Ca_Cac_Lop');

  // Also add individual class tabs in the same workbook with the exact same table structure
  classNames.forEach((cls) => {
    const classRows = allDataRows
      .filter((r) => r[3] === cls)
      .map((r, i) => [i + 1, ...r.slice(1)]);
    const sheetTitle = cls.startsWith('Bồi dưỡng')
      ? 'Lop_HSG_Tinh_TP'
      : `Lop_${cls.replace(/[^a-zA-Z0-9.]/g, '')}`.slice(0, 31);
    const wsClass = buildStandardStudentSheetFromRows(classRows);
    XLSX.utils.book_append_sheet(wb, wsClass, sheetTitle);
  });

  XLSX.writeFile(wb, 'Mau_Danh_Sach_HS_Theo_Doi_Hoc_Phi_NDH.xlsx');
}

/**
 * Parse an uploaded Excel workbook (supporting the 2-row header:
 * STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí [Th06..Th05])
 * and automatically filter every student into their corresponding class (`enrolledClass`).
 */
export function parseMultiClassStudentsFromWorkbook(
  wb: XLSX.WorkBook,
  fallbackClass: string = 'H8.1',
  defaultTuitionAmount: number = 600000
): {
  students: StudentRecord[];
  classCounts: Record<string, number>;
} {
  const parsedStudents: StudentRecord[] = [];
  const classCounts: Record<string, number> = {};
  const seenKeys = new Set<string>();
  const currentMonth = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
  const currentMonthCol = mapMonthStringToColumnKey(currentMonth);
  const today = new Date().toLocaleDateString('vi-VN');

  wb.SheetNames.forEach((sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const hasExplicitClassInSheetName =
      /[6789]\s*[.,\-_]\s*[1-9]/i.test(sheetName) ||
      /(?:khối|lớp|lop|hóa|hoa|khtn|k|h)\s*[6789]\b/i.test(sheetName) ||
      /hsg|bồi\s*dưỡng|boi\s*duong/i.test(sheetName);

    const isGeneralSheet =
      !hasExplicitClassInSheetName &&
      /tat_ca|tất_cả|all|sheet|danh_sach|danhsach|mau_nhap/i.test(sheetName);

    const sheetDefaultClass = isGeneralSheet
      ? fallbackClass === 'all'
        ? 'H8.1'
        : fallbackClass
      : normalizeClassName(sheetName, fallbackClass === 'all' ? 'H8.1' : fallbackClass);

    let currentSectionClass = sheetDefaultClass;

    // Read as 2D array to support merged 2-row header (STT | Họ và tên HS | HS trường | Lớp học thêm | Th06..Th05)
    const aoa = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
    if (!aoa || aoa.length === 0) return;

    // Detect column indices from the first 1-4 header rows
    let colNameIdx = 1;
    let colSchoolIdx = 2;
    let colClassIdx = 3;
    const monthColMap: Record<TuitionMonthColumn, number> = {
      Th06: 4,
      'Th 07': 5,
      Th08: 6,
      Th09: 7,
      Th10: 8,
      Th11: 9,
      Th12: 10,
      Th01: 11,
      Th02: 12,
      Th03: 13,
      Th04: 14,
      Th05: 15,
    };

    let dataStartRow = 0;
    for (let r = 0; r < Math.min(5, aoa.length); r++) {
      const rowCells = (aoa[r] || []).map((c) => String(c || '').trim());
      const joined = rowCells.join(' ').toLowerCase();

      // Also check if a title row in row 0 or 1 specifies the class (e.g. "DANH SÁCH HỌC SINH LỚP H9.1")
      for (const cellText of rowCells) {
        const titleCls = detectClassSectionHeader(cellText);
        if (titleCls) {
          currentSectionClass = titleCls;
        }
      }

      const isHeaderRow =
        joined.includes('họ và tên') ||
        joined.includes('họ tên') ||
        joined.includes('hs trường') ||
        joined.includes('lớp học thêm') ||
        joined.includes('th06') ||
        joined.includes('th08') ||
        joined.includes('theo dõi đóng học phí');

      if (isHeaderRow) {
        dataStartRow = Math.max(dataStartRow, r + 1);
        rowCells.forEach((cellText, cIdx) => {
          const lower = cellText.toLowerCase();
          if (lower.includes('họ và tên') || lower.includes('họ tên') || lower === 'fullname') {
            colNameIdx = cIdx;
          } else if (lower.includes('hs trường') || lower.includes('trường')) {
            colSchoolIdx = cIdx;
          } else if (
            lower.includes('lớp học thêm') ||
            lower === 'lớp' ||
            lower === 'nhóm lớp'
          ) {
            colClassIdx = cIdx;
          } else {
            // Check if cell matches a month column (Th06, Th 07, Th07, Th08..Th05)
            const mMatch = cellText.match(/^th\s*0?([1-9]|1[0-2])$/i);
            if (mMatch) {
              const colKey = mapMonthStringToColumnKey(`Th${mMatch[1]}`);
              monthColMap[colKey] = cIdx;
            }
          }
        });
      }
    }

    for (let r = dataStartRow; r < aoa.length; r++) {
      const row = aoa[r];
      if (!row || row.length === 0) continue;

      const rawName = String(row[colNameIdx] ?? '').trim();
      const firstCellVal = String(row[0] ?? '').trim();

      // Check if row is a section header like "LỚP H8.2"
      const possibleHeader = detectClassSectionHeader(rawName || firstCellVal);
      if (possibleHeader && (!rawName || possibleHeader === normalizeClassName(rawName, ''))) {
        currentSectionClass = possibleHeader;
        continue;
      }

      if (
        !rawName ||
        rawName.toLowerCase().includes('họ và tên') ||
        rawName.toLowerCase() === 'stt'
      ) {
        continue;
      }

      const rawSchool = String(row[colSchoolIdx] ?? '').trim() || 'THCS';
      const rawClass = String(row[colClassIdx] ?? '').trim();
      const resolvedClass = rawClass
        ? normalizeClassName(rawClass, currentSectionClass)
        : currentSectionClass;

      // Remember resolvedClass for subsequent rows in case the Excel sheet merged the class cell
      if (rawClass) {
        currentSectionClass = resolvedClass;
      }

      const dedupeKey = `${normalizeVietnamese(rawName)}__${resolvedClass.toLowerCase()}`;
      if (seenKeys.has(dedupeKey)) {
        continue;
      }
      seenKeys.add(dedupeKey);

      const monthlyTuition: Record<string, 'X' | 'Ch'> = {};
      let hasAnyPaidMonth = false;
      let latestPaidMonthCol: TuitionMonthColumn = currentMonthCol;

      TUITION_MONTH_COLUMNS.forEach((colKey) => {
        const cIdx = monthColMap[colKey];
        const cellVal = cIdx !== undefined ? row[cIdx] : 'Ch';
        const mark = normalizeMonthMark(cellVal);
        monthlyTuition[colKey] = mark;
        if (mark === 'X') {
          hasAnyPaidMonth = true;
          latestPaidMonthCol = colKey;
        }
      });

      const isCurrentPaid =
        monthlyTuition[currentMonthCol] === 'X' || hasAnyPaidMonth;

      const cleanCodePrefix = resolvedClass.startsWith('Bồi dưỡng')
        ? 'HSG'
        : resolvedClass.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      const code = `NDH-${cleanCodePrefix}-${String(parsedStudents.length + 1).padStart(2, '0')}`;

      const student: StudentRecord = {
        id: `st-${Date.now()}-${parsedStudents.length}-${Math.random().toString(36).substring(2, 6)}`,
        studentCode: code,
        fullName: rawName,
        school: rawSchool,
        phone: '',
        enrolledClass: resolvedClass,
        grade: deriveGradeFromClass(resolvedClass),
        status: 'studying',
        roadmapStage: 'Đang học đúng lộ trình',
        roadmapProgress: 85,
        roadmapNote: 'Theo dõi định kỳ',
        monthlyTuition,
        tuitionStatus: isCurrentPaid ? 'paid' : 'unpaid',
        tuitionMonth: latestPaidMonthCol,
        tuitionAmount: isCurrentPaid ? defaultTuitionAmount : 0,
        tuitionPaidDate: isCurrentPaid ? today : '',
        tuitionPaymentMethod: isCurrentPaid ? 'Theo bảng đóng học phí' : '',
        createdAt: today,
      };

      parsedStudents.push(student);
      classCounts[resolvedClass] = (classCounts[resolvedClass] || 0) + 1;
    }
  });

  return { students: parsedStudents, classCounts };
}

/**
 * Check if a student name (and optional class / phone / email) is present in the teacher's approved roster.
 */
export function verifyStudentInRoster(
  fullName: string,
  email?: string,
  phone?: string,
  enrolledClassInput?: string
): { isEnrolled: boolean; studentRecord?: StudentRecord } {
  if (!fullName || !fullName.trim()) {
    return { isEnrolled: false };
  }

  const roster = getActiveStudentRoster();
  const normalizedInputName = normalizeVietnamese(fullName);
  const normalizedInputEmail = (email || '').trim().toLowerCase();
  const normalizedInputPhone = (phone || '').replace(/\D/g, '');
  const normalizedTargetClass = enrolledClassInput?.trim()
    ? normalizeClassName(enrolledClassInput.trim(), '')
    : '';

  // Find all candidates matching name, email, or phone
  const candidates = roster.filter((s) => {
    const sName = normalizeVietnamese(s.fullName);
    if (sName && sName === normalizedInputName) return true;

    if (
      normalizedInputEmail &&
      s.email &&
      s.email.trim().toLowerCase() === normalizedInputEmail
    ) {
      return true;
    }

    if (normalizedInputPhone && s.phone) {
      const sPhone = s.phone.replace(/\D/g, '');
      if (sPhone && sPhone === normalizedInputPhone) return true;
    }

    return false;
  });

  if (candidates.length > 0) {
    if (normalizedTargetClass) {
      const exactClassMatch = candidates.find(
        (c) =>
          normalizeClassName(c.enrolledClass || '', '').toLowerCase() ===
          normalizedTargetClass.toLowerCase()
      );
      if (exactClassMatch) {
        return { isEnrolled: true, studentRecord: exactClassMatch };
      }
    }
    return { isEnrolled: true, studentRecord: candidates[0] };
  }

  return { isEnrolled: false };
}
