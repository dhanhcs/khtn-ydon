import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.resolve(__dirname, 'app-settings.json');
const ROSTER_FILE = path.resolve(__dirname, 'ndh-roster.json');
const USERS_FILE = path.resolve(__dirname, 'ndh-users.json');
const FIREBASE_CONFIG_FILE = path.resolve(__dirname, 'firebase-applet-config.json');

// Initialize Cloud Firestore on Backend Server to bridge AI Studio (ais-dev) & Published App (ais-pre)
let serverDb: ReturnType<typeof getFirestore> | null = null;
try {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
    const fbApp = getApps().length === 0 ? initializeApp(fbConfig) : getApp();
    serverDb = fbConfig.firestoreDatabaseId
      ? getFirestore(fbApp, fbConfig.firestoreDatabaseId)
      : getFirestore(fbApp);
  }
} catch (err) {
  console.warn('Server Firestore init warning:', err);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Shared Gemini client setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Admin credentials store
let adminCredentials = {
  username: 'admin',
  passwordHash: '888@ydon',
  displayName: 'QTV-Nguyễn Đình Hành',
  mustChangePassword: false,
  isInitialized: true,
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_INITIAL_PASSWORDS = [
  '888@ydon',
  'admin',
  'admin123',
  '123456',
  'ndh@2026!chem',
  process.env.ADMIN_INITIAL_PASSWORD,
].filter(Boolean);

// --- API Endpoints ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CHINH PHỤC MÔN HÓA THCS- NĐH',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    adminMustChangePassword: adminCredentials.mustChangePassword,
  });
});

// 1b. Persistent App Settings & Logo store + automatic Favicon sync
function syncFaviconFilesFromSettings(settingsObj: any) {
  try {
    const logoDataUrl = settingsObj?.logoUrl;
    if (typeof logoDataUrl === 'string' && logoDataUrl.startsWith('data:image/')) {
      const commaIdx = logoDataUrl.indexOf(',');
      if (commaIdx > 0) {
        const base64Data = logoDataUrl.slice(commaIdx + 1);
        const buf = Buffer.from(base64Data, 'base64');
        if (buf.length > 100) {
          const publicDir = path.resolve(__dirname, 'public');
          fs.mkdirSync(publicDir, { recursive: true });
          fs.writeFileSync(path.join(publicDir, 'favicon.png'), buf);
          fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
          fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf);
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync favicon files from logoUrl:', err);
  }
}

try {
  if (fs.existsSync(SETTINGS_FILE)) {
    const initialSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    syncFaviconFilesFromSettings(initialSettings);
  }
} catch {}

app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return res.json(JSON.parse(raw));
    }
  } catch (err) {
    console.warn('Error reading app-settings.json:', err);
  }
  return res.json({});
});

app.post('/api/settings', (req, res) => {
  try {
    let existing = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      } catch {
        existing = {};
      }
    }
    const merged = { ...existing, ...(req.body || {}) };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    syncFaviconFilesFromSettings(merged);
    return res.json({ success: true, settings: merged });
  } catch (err: any) {
    console.error('Error saving app-settings.json:', err);
    return res.status(500).json({ error: err?.message || 'Lỗi lưu cấu hình' });
  }
});

function normalizeStudentTuitionMonths(student: any): any {
  if (!student || typeof student !== 'object') return student;
  if (student.monthlyTuition && typeof student.monthlyTuition === 'object') {
    const mt = { ...student.monthlyTuition };
    const th07Val = mt['Th07'] || mt['Th 07'] || '';
    if (th07Val) {
      mt['Th07'] = th07Val;
      mt['Th 07'] = th07Val;
    }
    return { ...student, monthlyTuition: mt };
  }
  return student;
}

// 1b-2. Persistent Student Roster store (syncs teacher's uploaded student list across devices & environments)
function readServerRoster(): any[] {
  try {
    if (fs.existsSync(ROSTER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ROSTER_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeStudentTuitionMonths);
      }
    }
  } catch (e) {
    console.warn('Error reading ndh-roster.json:', e);
  }
  return [];
}

let serverRosterUpdatedAt = (() => {
  try {
    if (fs.existsSync(ROSTER_FILE)) {
      return fs.statSync(ROSTER_FILE).mtimeMs;
    }
  } catch {}
  return Date.now();
})();

function normalizeServerStr(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

app.get('/api/roster', async (req, res) => {
  let students = readServerRoster();
  let updatedAt = serverRosterUpdatedAt;

  // Also check Cloud Firestore if available so Published (ais-pre) and Dev (ais-dev) always return latest cloud roster
  if (serverDb) {
    try {
      const snap = await getDoc(doc(serverDb, 'app_settings', 'student_roster'));
      if (snap.exists()) {
        const fsData = snap.data();
        const cloudUpdatedAt = Number(fsData?.updatedAt || 0);
        const cloudStudents = Array.isArray(fsData?.students)
          ? fsData.students.map(normalizeStudentTuitionMonths)
          : [];
        if (
          cloudUpdatedAt > updatedAt ||
          (students.length === 0 && cloudStudents.length > 0 && !fsData?.explicitlyCleared)
        ) {
          students = cloudStudents;
          updatedAt = cloudUpdatedAt || Date.now();
          serverRosterUpdatedAt = updatedAt;
          try {
            fs.writeFileSync(ROSTER_FILE, JSON.stringify(students, null, 2), 'utf-8');
          } catch {}
        } else if (students.length > 0 && cloudStudents.length === 0 && !fsData?.explicitlyCleared) {
          // Push server roster to Cloud Firestore
          await setDoc(
            doc(serverDb, 'app_settings', 'student_roster'),
            {
              students,
              count: students.length,
              updatedAt,
              explicitlyCleared: false,
              updatedAtIso: new Date(updatedAt).toISOString(),
            },
            { merge: false }
          );
        }
      } else if (students.length > 0) {
        // Seed Cloud Firestore from server file so Phone & Published app immediately receive it
        await setDoc(
          doc(serverDb, 'app_settings', 'student_roster'),
          {
            students,
            count: students.length,
            updatedAt,
            explicitlyCleared: false,
            updatedAtIso: new Date(updatedAt).toISOString(),
          },
          { merge: false }
        );
      }
    } catch (e) {
      console.warn('GET /api/roster cloud check warning:', e);
    }
  }

  return res.json({ students, count: students.length, updatedAt });
});

app.post('/api/roster', async (req, res) => {
  try {
    const rawIncoming = Array.isArray(req.body?.students)
      ? req.body.students
      : Array.isArray(req.body)
      ? req.body
      : [];
    const incoming = rawIncoming.map(normalizeStudentTuitionMonths);
    const now = Number(req.body?.updatedAt) || Date.now();
    serverRosterUpdatedAt = now;

    fs.writeFileSync(ROSTER_FILE, JSON.stringify(incoming, null, 2), 'utf-8');

    if (serverDb) {
      try {
        await setDoc(
          doc(serverDb, 'app_settings', 'student_roster'),
          {
            students: incoming,
            count: incoming.length,
            updatedAt: now,
            explicitlyCleared: incoming.length === 0,
            updatedAtIso: new Date(now).toISOString(),
          },
          { merge: false }
        );
      } catch (e) {
        console.warn('POST /api/roster cloud write warning:', e);
      }
    }

    return res.json({
      success: true,
      count: incoming.length,
      updatedAt: now,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi lưu danh sách học sinh' });
  }
});

app.delete('/api/roster', async (req, res) => {
  try {
    const classFilter = String(req.query.className || req.body?.className || '').trim();
    const now = Date.now();
    serverRosterUpdatedAt = now;

    let remaining: any[] = [];
    if (classFilter && classFilter !== 'all') {
      const current = readServerRoster();
      remaining = current.filter((s: any) => s.enrolledClass !== classFilter);
    } else {
      remaining = [];
    }

    fs.writeFileSync(ROSTER_FILE, JSON.stringify(remaining, null, 2), 'utf-8');

    if (serverDb) {
      try {
        await setDoc(
          doc(serverDb, 'app_settings', 'student_roster'),
          {
            students: remaining,
            count: remaining.length,
            updatedAt: now,
            explicitlyCleared: remaining.length === 0,
            updatedAtIso: new Date(now).toISOString(),
          },
          { merge: false }
        );
      } catch (e) {
        console.warn('DELETE /api/roster cloud write warning:', e);
      }
    }

    return res.json({
      success: true,
      count: remaining.length,
      students: remaining,
      updatedAt: now,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi xóa danh sách học sinh' });
  }
});

// 1b-3. Student / Parent / Teacher Account Registration & Login (prevents Firebase auth/operation-not-allowed)
function normalizeEmailServer(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '')
    .trim();
}

function readRegisteredUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading ndh-users.json:', e);
  }
  return [];
}

function writeRegisteredUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error writing ndh-users.json:', e);
  }
  if (serverDb) {
    setDoc(
      doc(serverDb, 'app_settings', 'registered_users'),
      {
        users,
        count: users.length,
        updatedAt: Date.now(),
      },
      { merge: false }
    ).catch(() => {});
  }
}

// Bootstrap Server <-> Cloud Firestore real-time synchronization on startup
async function bootstrapServerCloudSync() {
  if (!serverDb) return;
  try {
    // 1. Sync Student Roster between ndh-roster.json and Cloud Firestore app_settings/student_roster
    const localRoster = readServerRoster();
    const rosterRef = doc(serverDb, 'app_settings', 'student_roster');
    const rosterSnap = await getDoc(rosterRef);

    if (rosterSnap.exists()) {
      const fsData = rosterSnap.data();
      const cloudStudents = Array.isArray(fsData?.students)
        ? fsData.students.map(normalizeStudentTuitionMonths)
        : [];
      const cloudUpdatedAt = Number(fsData?.updatedAt || 0);

      if (
        cloudStudents.length > 0 &&
        (cloudUpdatedAt > serverRosterUpdatedAt || localRoster.length === 0)
      ) {
        serverRosterUpdatedAt = cloudUpdatedAt || Date.now();
        fs.writeFileSync(ROSTER_FILE, JSON.stringify(cloudStudents, null, 2), 'utf-8');
      } else if (localRoster.length > 0 && (cloudStudents.length === 0 || serverRosterUpdatedAt > cloudUpdatedAt)) {
        await setDoc(
          rosterRef,
          {
            students: localRoster,
            count: localRoster.length,
            updatedAt: serverRosterUpdatedAt,
            explicitlyCleared: false,
            updatedAtIso: new Date(serverRosterUpdatedAt).toISOString(),
          },
          { merge: false }
        );
      }
    } else if (localRoster.length > 0) {
      await setDoc(
        rosterRef,
        {
          students: localRoster,
          count: localRoster.length,
          updatedAt: serverRosterUpdatedAt,
          explicitlyCleared: false,
          updatedAtIso: new Date(serverRosterUpdatedAt).toISOString(),
        },
        { merge: false }
      );
    }

    // Listen for real-time updates to student_roster in Cloud Firestore
    onSnapshot(
      rosterRef,
      (snap) => {
        if (!snap.exists()) return;
        const fsData = snap.data();
        const cloudUpdatedAt = Number(fsData?.updatedAt || 0);
        if (cloudUpdatedAt > serverRosterUpdatedAt && Array.isArray(fsData?.students)) {
          serverRosterUpdatedAt = cloudUpdatedAt;
          const normalized = fsData.students.map(normalizeStudentTuitionMonths);
          try {
            fs.writeFileSync(ROSTER_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
          } catch {}
        }
      },
      () => {}
    );

    // 2. Sync Registered Student Accounts between ndh-users.json and Cloud Firestore app_settings/registered_users
    const localUsers = readRegisteredUsers();
    const usersRef = doc(serverDb, 'app_settings', 'registered_users');
    const usersSnap = await getDoc(usersRef);
    if (usersSnap.exists()) {
      const fsUsers = Array.isArray(usersSnap.data()?.users) ? usersSnap.data().users : [];
      if (fsUsers.length > localUsers.length) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(fsUsers, null, 2), 'utf-8');
      } else if (localUsers.length > fsUsers.length) {
        await setDoc(usersRef, { users: localUsers, count: localUsers.length, updatedAt: Date.now() });
      }
    } else if (localUsers.length > 0) {
      await setDoc(usersRef, { users: localUsers, count: localUsers.length, updatedAt: Date.now() });
    }

    onSnapshot(
      usersRef,
      (snap) => {
        if (!snap.exists()) return;
        const fsUsers = Array.isArray(snap.data()?.users) ? snap.data().users : [];
        if (fsUsers.length > 0) {
          try {
            fs.writeFileSync(USERS_FILE, JSON.stringify(fsUsers, null, 2), 'utf-8');
          } catch {}
        }
      },
      () => {}
    );
  } catch (err) {
    console.warn('bootstrapServerCloudSync warning:', err);
  }
}

bootstrapServerCloudSync();

function enrichUserWithRoster(u: any, serverRoster: any[]): any {
  const normName = normalizeServerStr(u.fullName || '');
  const normEmail = normalizeEmailServer(u.email || '');
  const matchedStudent = serverRoster.find(
    (s: any) =>
      (normName && s.fullName && normalizeServerStr(s.fullName) === normName) ||
      (normEmail && s.email && normalizeEmailServer(s.email) === normEmail)
  );
  if (matchedStudent && (u.role === 'student' || u.role === 'guest' || !u.role)) {
    return {
      ...u,
      fullName: matchedStudent.fullName || u.fullName,
      isOfficial: true,
      role: 'student',
      status: 'active',
      enrolledClass: matchedStudent.enrolledClass || u.enrolledClass || '',
      school: matchedStudent.school || u.school || 'THCS',
      grade: matchedStudent.grade || u.grade || '',
      studentCode: matchedStudent.studentCode || u.studentCode || '',
      phone: matchedStudent.phone || u.phone || '',
    };
  }
  return u;
}

// Return all registered accounts (synchronized with teacher's roster) so client login can sync immediately
app.get('/api/auth/users', (req, res) => {
  try {
    const serverRoster = readServerRoster();
    const users = readRegisteredUsers();
    let updated = false;
    const syncedUsers = users.map((u: any) => {
      const enriched = enrichUserWithRoster(u, serverRoster);
      const cleanEmail = normalizeEmailServer(enriched.email || '');
      if (
        enriched.isOfficial !== u.isOfficial ||
        enriched.enrolledClass !== u.enrolledClass ||
        (cleanEmail && cleanEmail !== u.email)
      ) {
        updated = true;
      }
      return {
        ...enriched,
        email: cleanEmail || enriched.email,
        rawEmail: u.rawEmail || u.email,
      };
    });
    if (updated) {
      writeRegisteredUsers(syncedUsers);
    }
    return res.json({ users: syncedUsers });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi tải danh sách tài khoản.' });
  }
});

// Two-way sync of registered student accounts between client localStorage and server ndh-users.json
app.post('/api/auth/sync-users', (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.users) ? req.body.users : [];
    const serverRoster = readServerRoster();
    const existing = readRegisteredUsers();

    incoming.forEach((inc: any) => {
      if (!inc || (!inc.fullName && !inc.email)) return;
      const cleanEmail = normalizeEmailServer(inc.email || '');
      const normName = normalizeServerStr(inc.fullName || '');
      const idx = existing.findIndex(
        (u: any) =>
          (cleanEmail && normalizeEmailServer(u.email) === cleanEmail) ||
          (normName && normalizeServerStr(u.fullName) === normName)
      );
      const enriched = enrichUserWithRoster(
        {
          ...inc,
          email: cleanEmail || inc.email,
          rawEmail: inc.rawEmail || inc.email,
        },
        serverRoster
      );
      if (idx >= 0) {
        existing[idx] = {
          ...existing[idx],
          ...enriched,
          passwordHash: enriched.passwordHash || existing[idx].passwordHash || '123456',
        };
      } else {
        existing.push({
          ...enriched,
          uid:
            enriched.uid ||
            'ndh-user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          passwordHash: enriched.passwordHash || '123456',
          createdAt: enriched.createdAt || new Date().toISOString(),
        });
      }
    });

    writeRegisteredUsers(existing);
    return res.json({ success: true, users: existing });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi đồng bộ tài khoản.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const {
      email = '',
      password = '',
      fullName = '',
      role = 'student',
      isOfficial: clientIsOfficial,
      enrolledClass: clientClass,
      school: clientSchool,
      grade: clientGrade,
      studentCode: clientCode,
      phone: clientPhone,
    } = req.body || {};

    const cleanName = String(fullName).trim();
    const rawEmail = String(email).trim().toLowerCase();
    const cleanEmail =
      normalizeEmailServer(rawEmail) ||
      `${normalizeServerStr(cleanName)}@hoahocndh.edu.vn`;
    const cleanPass = String(password).trim() || '123456';

    if (!cleanName) {
      return res.status(400).json({ error: 'Vui lòng nhập họ và tên học sinh.' });
    }

    // Match against server-side roster if available
    const serverRoster = readServerRoster();
    const normName = normalizeServerStr(cleanName);
    const matchedStudent = serverRoster.find(
      (s: any) =>
        (s.fullName && normalizeServerStr(s.fullName) === normName) ||
        (cleanEmail && s.email && normalizeEmailServer(s.email) === cleanEmail)
    );

    const isOfficial = Boolean(clientIsOfficial || matchedStudent);
    const assignedRole =
      role === 'student' ? (isOfficial ? 'student' : 'guest') : role;

    const users = readRegisteredUsers();
    const existingIdx = users.findIndex(
      (u: any) =>
        (u.email && normalizeEmailServer(u.email) === cleanEmail) ||
        (u.fullName && normalizeServerStr(u.fullName) === normName)
    );

    const userRecord = {
      uid:
        existingIdx >= 0
          ? users[existingIdx].uid
          : 'ndh-user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      rawEmail: rawEmail || cleanEmail,
      passwordHash: cleanPass,
      fullName: matchedStudent?.fullName || cleanName,
      role: assignedRole,
      isOfficial,
      status: isOfficial ? 'active' : 'guest',
      enrolledClass: matchedStudent?.enrolledClass || clientClass || '',
      school: matchedStudent?.school || clientSchool || 'THCS',
      grade: matchedStudent?.grade || clientGrade || '',
      studentCode: matchedStudent?.studentCode || clientCode || '',
      phone: matchedStudent?.phone || clientPhone || '',
      createdAt:
        existingIdx >= 0 ? users[existingIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      users[existingIdx] = userRecord;
    } else {
      users.push(userRecord);
    }
    writeRegisteredUsers(users);

    const { passwordHash: _omitted, ...publicProfile } = userRecord;
    return res.json({
      success: true,
      user: publicProfile,
      accountWithPass: userRecord,
      isOfficial,
      role: assignedRole,
      enrolledClass: userRecord.enrolledClass,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi khi đăng ký tài khoản.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email = '', identifier = '', password = '' } = req.body || {};
    const rawInput = String(email || identifier).trim();
    const cleanIdentifier = rawInput.toLowerCase();
    const normEmailInput = normalizeEmailServer(rawInput);
    const normEmailPrefix = normEmailInput.split('@')[0];
    const normIdentifier = normalizeServerStr(rawInput);
    const cleanPass = String(password).trim();

    if (!rawInput) {
      return res.status(400).json({ error: 'Vui lòng nhập Email hoặc Họ và tên học sinh.' });
    }

    const serverRoster = readServerRoster();
    const users = readRegisteredUsers();

    // 1. Find in registered users by email (with or without accents), email prefix, fullName, uid, or studentCode
    let foundIdx = users.findIndex((u: any) => {
      const uEmailNorm = normalizeEmailServer(u.email || '');
      const uRawEmailNorm = normalizeEmailServer(u.rawEmail || '');
      const uEmailPrefix = uEmailNorm.split('@')[0];
      const uNameNorm = normalizeServerStr(u.fullName || '');
      const uCodeNorm = normalizeServerStr(u.studentCode || '');

      return (
        u.uid === rawInput ||
        (u.email && String(u.email).toLowerCase() === cleanIdentifier) ||
        (u.rawEmail && String(u.rawEmail).toLowerCase() === cleanIdentifier) ||
        (normEmailInput && (uEmailNorm === normEmailInput || uRawEmailNorm === normEmailInput)) ||
        (normEmailPrefix && normEmailPrefix.length >= 3 && uEmailPrefix === normEmailPrefix) ||
        (normIdentifier && uNameNorm === normIdentifier) ||
        (normIdentifier && uCodeNorm && uCodeNorm === normIdentifier)
      );
    });

    // 2. If found in registered users, sync with latest roster and return session
    if (foundIdx >= 0) {
      let found = enrichUserWithRoster(users[foundIdx], serverRoster);
      // Update password if user entered a new password, or keep existing passwordHash
      if (cleanPass && cleanPass.length >= 3) {
        found.passwordHash = cleanPass;
      }
      found.email = normalizeEmailServer(found.email) || found.email;
      users[foundIdx] = found;
      writeRegisteredUsers(users);

      const { passwordHash: _omitted, ...publicProfile } = found;
      return res.json({
        success: true,
        user: publicProfile,
        accountWithPass: found,
      });
    }

    // 3. If not yet in registered users, check if student exists in Teacher's uploaded roster (ndh-roster.json)
    const matchedStudent = serverRoster.find((s: any) => {
      const sNameNorm = normalizeServerStr(s.fullName || '');
      const sCodeNorm = normalizeServerStr(s.studentCode || '');
      const sEmailNorm = normalizeEmailServer(s.email || '');
      return (
        (normIdentifier && sNameNorm === normIdentifier) ||
        (normIdentifier && sCodeNorm && sCodeNorm === normIdentifier) ||
        (normEmailInput && sEmailNorm && sEmailNorm === normEmailInput)
      );
    });

    if (matchedStudent) {
      const autoEmail =
        rawInput.includes('@')
          ? normalizeEmailServer(rawInput)
          : `${normalizeServerStr(matchedStudent.fullName)}@hoahocndh.edu.vn`;
      const autoUser = {
        uid: 'ndh-user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        email: autoEmail,
        rawEmail: rawInput,
        passwordHash: cleanPass || '123456',
        fullName: matchedStudent.fullName,
        role: 'student',
        isOfficial: true,
        status: 'active',
        enrolledClass: matchedStudent.enrolledClass || '',
        school: matchedStudent.school || 'THCS',
        grade: matchedStudent.grade || '',
        studentCode: matchedStudent.studentCode || '',
        phone: matchedStudent.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(autoUser);
      writeRegisteredUsers(users);

      const { passwordHash: _omitted, ...publicProfile } = autoUser;
      return res.json({
        success: true,
        user: publicProfile,
        accountWithPass: autoUser,
      });
    }

    return res.status(401).json({
      error:
        'Không tìm thấy tài khoản học sinh này. Vui lòng kiểm tra lại Họ và tên / Email hoặc bấm sang tab "Đăng ký" để tạo tài khoản mới.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi khi đăng nhập.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email = '', newPassword = '' } = req.body || {};
    const cleanEmail = normalizeEmailServer(email);
    const normName = normalizeServerStr(email);
    if (!cleanEmail && !normName) {
      return res.status(400).json({ error: 'Vui lòng nhập email hoặc họ tên tài khoản.' });
    }
    const users = readRegisteredUsers();
    const idx = users.findIndex(
      (u: any) =>
        normalizeEmailServer(u.email) === cleanEmail ||
        normalizeServerStr(u.fullName) === normName
    );
    if (idx >= 0 && newPassword && String(newPassword).length >= 4) {
      users[idx].passwordHash = String(newPassword).trim();
      writeRegisteredUsers(users);
      return res.json({ success: true, message: 'Đã đặt lại mật khẩu mới thành công!' });
    }
    return res.json({
      success: true,
      message: 'Nếu tài khoản tồn tại trên hệ thống, yêu cầu đặt lại mật khẩu đã được ghi nhận.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Lỗi đặt lại mật khẩu.' });
  }
});

const SYNC_CONFIG_FILE = path.resolve(__dirname, 'ndh-sync-config.json');

interface SyncConfigData {
  siteName?: string;
  siteId?: string;
  siteUrl?: string;
  netlifyToken?: string;
  netlifyBuildHookUrl?: string;
  vercelSiteName?: string;
  vercelToken?: string;
  vercelUrl?: string;
  lastVercelDeployedAt?: string;
  githubRepo?: string;
  githubToken?: string;
  githubBranch?: string;
  autoSyncOnEdit?: boolean;
  lastDeployedAt?: string;
  lastGithubSyncedAt?: string;
  lastSourceMtime?: number;
  deployCount?: number;
}

function readSyncConfig(): SyncConfigData {
  try {
    if (fs.existsSync(SYNC_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_CONFIG_FILE, 'utf-8')) || {};
    }
  } catch {}
  return {
    siteName: 'hoahoc-thcs-ndh',
    vercelSiteName: 'hoahoc-thcs-ndh',
    githubBranch: 'main',
    autoSyncOnEdit: true,
    deployCount: 0,
  };
}

function writeSyncConfig(data: Partial<SyncConfigData>): SyncConfigData {
  const current = readSyncConfig();
  const merged: SyncConfigData = { ...current, ...data };
  try {
    fs.writeFileSync(SYNC_CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch {}
  if (serverDb) {
    setDoc(
      doc(serverDb, 'app_settings', 'netlify_sync_config'),
      { ...merged, updatedAt: Date.now() },
      { merge: true }
    ).catch(() => {});
  }
  return merged;
}

function getLatestSourceMtime(dirPath: string): number {
  let latest = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name.endsWith('.zip') ||
        entry.name === 'ndh-sync-config.json'
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subLatest = getLatestSourceMtime(fullPath);
        if (subLatest > latest) latest = subLatest;
      } else {
        const stat = fs.statSync(fullPath);
        if (stat.mtimeMs > latest) latest = stat.mtimeMs;
      }
    }
  } catch {}
  return latest;
}

async function buildPrebuiltNetlifyZip(forceRebuild = false): Promise<string> {
  const { execSync, execFileSync } = await import('child_process');
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  const srcMtime = getLatestSourceMtime(path.resolve(__dirname, 'src'));
  const distMtime = fs.existsSync(indexHtmlPath) ? fs.statSync(indexHtmlPath).mtimeMs : 0;

  if (forceRebuild || !fs.existsSync(indexHtmlPath) || srcMtime > distMtime) {
    execSync('npm run build', { cwd: __dirname, stdio: 'ignore' });
  }

  // Write SPA routing rules for Netlify, Cloudflare Pages, and Vercel directly inside dist/
  fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200\n', 'utf-8');
  fs.writeFileSync(
    path.join(distDir, 'netlify.toml'),
    `[build]\n  publish = "."\n\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200\n`,
    'utf-8'
  );
  fs.writeFileSync(
    path.join(distDir, 'vercel.json'),
    JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2),
    'utf-8'
  );

  const zipPath = '/tmp/hochoandh-web-deploy.zip';
  const pyScript = [
    'import os, zipfile',
    `dist_dir = ${JSON.stringify(distDir)}`,
    `zip_path = ${JSON.stringify(zipPath)}`,
    "with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:",
    '    for root, dirs, files in os.walk(dist_dir):',
    '        for file in files:',
    '            full_path = os.path.join(root, file)',
    '            rel_path = os.path.relpath(full_path, dist_dir)',
    '            zf.write(full_path, rel_path)',
  ].join('\n');
  execFileSync('python3', ['-c', pyScript]);
  return zipPath;
}

async function executeNetlifyDeployWithToken(
  rawSiteName: string,
  rawToken: string,
  forceRebuild = false
): Promise<{
  siteId: string;
  siteName: string;
  siteUrl: string;
  deployId: string;
  deployedAt: string;
}> {
  const token = String(rawToken || '').trim();
  if (!token) {
    throw new Error('Vui lòng nhập mã Netlify Personal Access Token (bắt đầu bằng nfp_...).');
  }

  // Normalize siteName for Netlify subdomain rules (lowercase letters, digits, hyphens)
  const cleanSiteName = String(rawSiteName || 'hoahoc-thcs-ndh')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'hoahoc-thcs-ndh';

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'HoaHocTHCS-NDH-Deployer/1.0',
  };

  // 1. List user's existing Netlify sites to verify token and check if site already exists
  const listRes = await fetch('https://api.netlify.com/api/v1/sites?per_page=100', {
    method: 'GET',
    headers: authHeaders,
  });

  if (listRes.status === 401 || listRes.status === 403) {
    throw new Error(
      'Mã Netlify Personal Access Token không hợp lệ hoặc đã hết hạn. Vui lòng bấm "Lấy mã Token" trên Netlify và dán lại.'
    );
  }

  const existingSites: any[] = listRes.ok ? await listRes.json() : [];
  const savedCfg = readSyncConfig();

  let targetSite =
    existingSites.find((s: any) => s && s.name && s.name.toLowerCase() === cleanSiteName) ||
    (savedCfg.siteId ? existingSites.find((s: any) => s && s.id === savedCfg.siteId) : null);

  // 2. If site exists but user requested a different cleanSiteName, try renaming it
  if (targetSite && targetSite.name?.toLowerCase() !== cleanSiteName) {
    try {
      const renameRes = await fetch(`https://api.netlify.com/api/v1/sites/${targetSite.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ name: cleanSiteName }),
      });
      if (renameRes.ok) {
        targetSite = await renameRes.json();
      }
    } catch {}
  }

  // 3. If no site exists yet, create a new site on Netlify
  if (!targetSite) {
    const candidateNames = [
      cleanSiteName,
      `${cleanSiteName}-ndh`,
      `${cleanSiteName}-${Math.floor(100 + Math.random() * 899)}`,
      '', // Empty string lets Netlify assign a unique random name if all custom names are taken
    ];

    for (const candidate of candidateNames) {
      const createBody = candidate ? JSON.stringify({ name: candidate }) : JSON.stringify({});
      const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: authHeaders,
        body: createBody,
      });
      if (createRes.ok) {
        targetSite = await createRes.json();
        break;
      }
    }
  }

  if (!targetSite || !targetSite.id) {
    throw new Error('Không thể khởi tạo website trên Netlify. Vui lòng thử tên website khác.');
  }

  // 4. Build fresh pre-built ZIP and upload directly to Netlify Deploy API
  const zipPath = await buildPrebuiltNetlifyZip(forceRebuild);
  const zipBuffer = fs.readFileSync(zipPath);

  const deployRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${targetSite.id}/deploys`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/zip',
        'User-Agent': 'HoaHocTHCS-NDH-Deployer/1.0',
      },
      body: zipBuffer,
    }
  );

  if (!deployRes.ok) {
    const errText = await deployRes.text();
    throw new Error(`Lỗi đẩy bản build lên Netlify (${deployRes.status}): ${errText}`);
  }

  const deployData: any = await deployRes.json();
  const finalSiteName = deployData?.name || targetSite.name;
  const siteUrl =
    targetSite.ssl_url ||
    deployData?.ssl_url ||
    `https://${finalSiteName}.netlify.app`;
  const deployedAt = new Date().toISOString();
  const srcMtime = getLatestSourceMtime(path.resolve(__dirname, 'src'));

  const updatedCfg = writeSyncConfig({
    siteName: finalSiteName,
    siteId: targetSite.id,
    siteUrl,
    netlifyToken: token,
    lastDeployedAt: deployedAt,
    lastSourceMtime: srcMtime,
    deployCount: (savedCfg.deployCount || 0) + 1,
  });

  // Also update customDomainUrl in app_settings/main_config so QR codes point to the live Netlify URL
  if (serverDb && siteUrl) {
    setDoc(
      doc(serverDb, 'app_settings', 'main_config'),
      { customDomainUrl: siteUrl, updatedAt: Date.now() },
      { merge: true }
    ).catch(() => {});
  }

  return {
    siteId: targetSite.id,
    siteName: finalSiteName,
    siteUrl,
    deployId: deployData?.id || '',
    deployedAt: updatedCfg.lastDeployedAt || deployedAt,
  };
}

// 1c. Direct 1-Click Download of Pre-built Web Bundle (.zip) & Source Code (.zip)
app.get('/api/export/deploy-zip', async (req, res) => {
  try {
    const forceRebuild = req.query.rebuild === '1';
    const zipPath = await buildPrebuiltNetlifyZip(forceRebuild);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="hoahoc-thcs-ndh-netlify-build-san.zip"'
    );
    const stream = fs.createReadStream(zipPath);
    stream.pipe(res);
  } catch (err: any) {
    console.error('Export deploy-zip error:', err);
    res.status(500).json({ error: 'Không thể đóng gói bản xuất bản web: ' + (err?.message || '') });
  }
});

app.get('/api/export/source-zip', async (req, res) => {
  try {
    const { execFileSync } = await import('child_process');
    const zipPath = '/tmp/hochoandh-source-code.zip';
    const pyScript = [
      'import os, zipfile',
      `root_dir = ${JSON.stringify(__dirname)}`,
      `zip_path = ${JSON.stringify(zipPath)}`,
      "exclude_dirs = {'node_modules', '.git', 'dist', '.next', '.aistudio'}",
      "with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:",
      '    for root, dirs, files in os.walk(root_dir):',
      '        dirs[:] = [d for d in dirs if d not in exclude_dirs]',
      '        for file in files:',
      "            if file.endswith('.zip') or file.endswith('.log') or file == 'ndh-sync-config.json':",
      '                continue',
      '            full_path = os.path.join(root, file)',
      '            rel_path = os.path.relpath(full_path, root_dir)',
      '            zf.write(full_path, rel_path)',
    ].join('\n');
    execFileSync('python3', ['-c', pyScript]);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="hoahoc-thcs-ndh-github-source.zip"'
    );
    const stream = fs.createReadStream(zipPath);
    stream.pipe(res);
  } catch (err: any) {
    console.error('Export source-zip error:', err);
    res.status(500).json({ error: 'Không thể nén mã nguồn: ' + (err?.message || '') });
  }
});

// 1d. Sync Configuration & 1-Click Automated Netlify / GitHub Deployment API
app.get('/api/sync-config', async (req, res) => {
  try {
    let cfg = readSyncConfig();
    if (serverDb && !cfg.netlifyToken && !cfg.siteUrl) {
      try {
        const snap = await getDoc(doc(serverDb, 'app_settings', 'netlify_sync_config'));
        if (snap.exists()) {
          cfg = writeSyncConfig(snap.data() as Partial<SyncConfigData>);
        }
      } catch {}
    }
    res.json({ config: cfg });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Không thể tải cấu hình đồng bộ.' });
  }
});

app.post('/api/sync-config', (req, res) => {
  try {
    const incoming = req.body || {};
    const saved = writeSyncConfig(incoming);
    res.json({ success: true, config: saved });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Không thể lưu cấu hình đồng bộ.' });
  }
});

app.post('/api/netlify/deploy-one-click', async (req, res) => {
  try {
    const {
      siteName = 'hoahoc_thcs_ndh',
      token = '',
      autoSyncOnEdit = true,
      netlifyBuildHookUrl = '',
    } = req.body || {};

    const cleanToken = String(token || readSyncConfig().netlifyToken || '').trim();
    writeSyncConfig({
      siteName: String(siteName || 'hoahoc_thcs_ndh').trim(),
      netlifyToken: cleanToken,
      autoSyncOnEdit: Boolean(autoSyncOnEdit),
      netlifyBuildHookUrl: String(netlifyBuildHookUrl || '').trim(),
    });

    // If user provided a Netlify Build Hook URL and no Personal Access Token, trigger the Build Hook
    if (!cleanToken && netlifyBuildHookUrl && netlifyBuildHookUrl.startsWith('https://api.netlify.com/build_hooks/')) {
      const hookRes = await fetch(netlifyBuildHookUrl.trim(), { method: 'POST' });
      if (!hookRes.ok) {
        throw new Error('Không thể kích hoạt Netlify Build Hook. Vui lòng kiểm tra lại đường dẫn Hook.');
      }
      const cleanName = String(siteName || 'hoahoc-thcs-ndh')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
      const siteUrl = readSyncConfig().siteUrl || `https://${cleanName}.netlify.app`;
      const deployedAt = new Date().toISOString();
      const cfg = writeSyncConfig({ siteUrl, lastDeployedAt: deployedAt });
      return res.json({
        success: true,
        siteName: cleanName,
        siteUrl,
        deployedAt,
        config: cfg,
      });
    }

    const result = await executeNetlifyDeployWithToken(siteName, cleanToken, false);
    return res.json({
      success: true,
      ...result,
      config: readSyncConfig(),
    });
  } catch (err: any) {
    console.error('Netlify 1-click deploy error:', err);
    return res.status(400).json({
      error: err?.message || 'Lỗi khi xuất bản tự động lên Netlify.',
    });
  }
});

async function executeVercelDeployWithToken(
  rawSiteName: string,
  rawToken: string,
  forceRebuild = false
): Promise<{
  siteName: string;
  vercelUrl: string;
  deployId: string;
  deployedAt: string;
}> {
  const token = String(rawToken || '').trim();
  if (!token) {
    throw new Error('Vui lòng nhập mã Vercel Access Token (lấy tại vercel.com/account/tokens).');
  }

  const cleanSiteName =
    String(rawSiteName || 'hoahoc-thcs-ndh')
      .trim()
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 52) || 'hoahoc-thcs-ndh';

  // Ensure dist/ is built and contains SPA vercel.json
  await buildPrebuiltNetlifyZip(forceRebuild);
  const distDir = path.resolve(__dirname, 'dist');

  const filesPayload: { file: string; data: string; encoding: 'base64' }[] = [];
  function collectDistFiles(curDir: string) {
    const entries = fs.readdirSync(curDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(curDir, entry.name);
      const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        collectDistFiles(fullPath);
      } else {
        const buf = fs.readFileSync(fullPath);
        filesPayload.push({
          file: relPath,
          data: buf.toString('base64'),
          encoding: 'base64',
        });
      }
    }
  }
  collectDistFiles(distDir);

  const vHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const deployRes = await fetch(
    'https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1',
    {
      method: 'POST',
      headers: vHeaders,
      body: JSON.stringify({
        name: cleanSiteName,
        target: 'production',
        files: filesPayload,
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null,
        },
      }),
    }
  );

  if (!deployRes.ok) {
    const errText = await deployRes.text();
    if (deployRes.status === 401 || deployRes.status === 403) {
      throw new Error(
        'Mã Vercel Token không hợp lệ hoặc đã hết hạn. Vui lòng tạo mã Token mới tại vercel.com/account/tokens (chọn Scope: Full Account).'
      );
    }
    throw new Error(`Không thể đẩy bản build lên Vercel (${deployRes.status}): ${errText}`);
  }

  const deployData: any = await deployRes.json();

  // Disable Vercel Authentication wall (ssoProtection) so students can access the public link directly
  const projectTarget = deployData?.projectId || cleanSiteName;
  const preferredShortDomain = `${cleanSiteName}.vercel.app`;
  try {
    await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectTarget)}`, {
      method: 'PATCH',
      headers: vHeaders,
      body: JSON.stringify({ ssoProtection: null }),
    });
  } catch {}

  // Ensure the short domain (without team suffix like -ndh-2026) is registered on the project and bound to this deployment
  let shortDomainBound = false;
  try {
    await fetch(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectTarget)}/domains`, {
      method: 'POST',
      headers: vHeaders,
      body: JSON.stringify({ name: preferredShortDomain }),
    });
  } catch {}

  if (deployData?.id) {
    try {
      const bindRes = await fetch(
        `https://api.vercel.com/v2/deployments/${encodeURIComponent(deployData.id)}/aliases`,
        {
          method: 'POST',
          headers: vHeaders,
          body: JSON.stringify({ alias: preferredShortDomain }),
        }
      );
      if (bindRes.ok) {
        shortDomainBound = true;
      }
    } catch {}
  }

  const aliasesList: string[] = Array.isArray(deployData?.alias) ? deployData.alias : [];
  const exactMatchInAliases = aliasesList.find(
    (a) => a.toLowerCase() === preferredShortDomain.toLowerCase()
  );
  const shortestAlias =
    aliasesList.length > 0
      ? [...aliasesList].sort((a, b) => a.length - b.length)[0]
      : preferredShortDomain;

  const chosenDomain = preferredShortDomain;
  const finalVercelUrl = chosenDomain.startsWith('http')
    ? chosenDomain
    : `https://${chosenDomain}`;
  const deployedAt = new Date().toISOString();
  const currentCfg = readSyncConfig();

  writeSyncConfig({
    vercelSiteName: cleanSiteName,
    vercelToken: token,
    vercelUrl: finalVercelUrl,
    lastVercelDeployedAt: deployedAt,
    lastSourceMtime: getLatestSourceMtime(path.resolve(__dirname, 'src')),
    deployCount: (currentCfg.deployCount || 0) + 1,
  });

  return {
    siteName: cleanSiteName,
    vercelUrl: finalVercelUrl,
    deployId: deployData?.id || '',
    deployedAt,
  };
}

app.post('/api/vercel/deploy-one-click', async (req, res) => {
  try {
    const {
      vercelSiteName = 'hoahoc_thcs_ndh',
      vercelToken = '',
      autoSyncOnEdit = true,
    } = req.body || {};

    const cleanToken = String(vercelToken || readSyncConfig().vercelToken || '').trim();
    writeSyncConfig({
      vercelSiteName: String(vercelSiteName || 'hoahoc_thcs_ndh').trim(),
      vercelToken: cleanToken,
      autoSyncOnEdit: Boolean(autoSyncOnEdit),
    });

    const result = await executeVercelDeployWithToken(vercelSiteName, cleanToken, false);
    return res.json({
      success: true,
      ...result,
      config: readSyncConfig(),
    });
  } catch (err: any) {
    console.error('Vercel 1-click deploy error:', err);
    return res.status(400).json({
      error: err?.message || 'Lỗi khi xuất bản tự động lên Vercel.',
    });
  }
});

async function executeGithubPushSync(
  rawRepo: string,
  rawToken: string,
  branch: string = 'main'
): Promise<{ repoUrl: string; syncedAt: string; filesCount: number }> {
  const token = String(rawToken || '').trim();
  let repoSlug = String(rawRepo || '')
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');

  if (!token) {
    throw new Error('Vui lòng nhập GitHub Personal Access Token (ghp_...).');
  }
  if (!repoSlug) {
    throw new Error('Vui lòng nhập tên kho GitHub (ví dụ: ten-cua-ban/hoahoc-thcs-ndh).');
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'HoaHocTHCS-NDH-Sync/1.0',
  };

  // If user only typed repo name without owner, look up authenticated user
  if (!repoSlug.includes('/')) {
    const userRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
    if (!userRes.ok) {
      throw new Error('Mã GitHub Token không hợp lệ hoặc không có quyền truy cập.');
    }
    const userData: any = await userRes.json();
    repoSlug = `${userData.login}/${repoSlug}`;
  }

  const [owner, repoName] = repoSlug.split('/');

  // Check if repo exists; if not, create it automatically
  const repoCheck = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
    headers: ghHeaders,
  });
  if (repoCheck.status === 404) {
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        name: repoName,
        description: 'Cổng Học Tập Trực Tuyến Hóa Học THCS NĐH - Thầy Nguyễn Đình Hành',
        private: false,
        auto_init: true,
      }),
    });
    if (!createRepoRes.ok) {
      const errTxt = await createRepoRes.text();
      throw new Error(`Không thể tạo kho GitHub ${repoSlug}: ${errTxt}`);
    }
    // Wait briefly for GitHub to initialize main branch
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Collect all project source files to push
  const excludeDirs = new Set(['node_modules', '.git', 'dist', '.next', '.aistudio']);
  const filesToPush: { relPath: string; contentBase64: string }[] = [];

  function walkProject(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (excludeDirs.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walkProject(fullPath);
      } else {
        if (
          entry.name.endsWith('.zip') ||
          entry.name.endsWith('.log') ||
          entry.name === 'ndh-sync-config.json' ||
          entry.name === '.env'
        ) {
          continue;
        }
        const stat = fs.statSync(fullPath);
        if (stat.size > 2 * 1024 * 1024) continue; // skip files > 2MB
        const buf = fs.readFileSync(fullPath);
        filesToPush.push({ relPath, contentBase64: buf.toString('base64') });
      }
    }
  }
  walkProject(__dirname);

  // Get latest commit SHA on branch
  let baseTreeSha: string | undefined;
  let parentCommitSha: string | undefined;
  const refRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`,
    { headers: ghHeaders }
  );
  if (refRes.ok) {
    const refData: any = await refRes.json();
    parentCommitSha = refData?.object?.sha;
    if (parentCommitSha) {
      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentCommitSha}`,
        { headers: ghHeaders }
      );
      if (commitRes.ok) {
        const commitData: any = await commitRes.json();
        baseTreeSha = commitData?.tree?.sha;
      }
    }
  }

  // Create blobs for each file and build tree
  const treeItems: any[] = [];
  for (const item of filesToPush) {
    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        content: item.contentBase64,
        encoding: 'base64',
      }),
    });
    if (blobRes.ok) {
      const blobData: any = await blobRes.json();
      treeItems.push({
        path: item.relPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }
  }

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      ...(baseTreeSha ? { base_tree: baseTreeSha } : {}),
      tree: treeItems,
    }),
  });
  if (!treeRes.ok) {
    throw new Error('Không thể tạo Git Tree trên GitHub.');
  }
  const treeData: any = await treeRes.json();

  const newCommitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/commits`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Đồng bộ tự động từ Google AI Studio - Hóa Học THCS NĐH (${new Date().toLocaleString('vi-VN')})`,
        tree: treeData.sha,
        parents: parentCommitSha ? [parentCommitSha] : [],
      }),
    }
  );
  if (!newCommitRes.ok) {
    throw new Error('Không thể tạo Commit mới trên GitHub.');
  }
  const newCommitData: any = await newCommitRes.json();

  if (parentCommitSha) {
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: ghHeaders,
      body: JSON.stringify({ sha: newCommitData.sha, force: true }),
    });
  } else {
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommitData.sha }),
    });
  }

  const syncedAt = new Date().toISOString();
  const repoUrl = `https://github.com/${owner}/${repoName}`;
  writeSyncConfig({
    githubRepo: `${owner}/${repoName}`,
    githubToken: token,
    githubBranch: branch,
    lastGithubSyncedAt: syncedAt,
  });

  return { repoUrl, syncedAt, filesCount: treeItems.length };
}

app.post('/api/github/push-sync', async (req, res) => {
  try {
    const {
      githubRepo = '',
      githubToken = '',
      githubBranch = 'main',
      autoSyncOnEdit = true,
    } = req.body || {};

    const saved = readSyncConfig();
    const repo = String(githubRepo || saved.githubRepo || '').trim();
    const token = String(githubToken || saved.githubToken || '').trim();
    const branch = String(githubBranch || saved.githubBranch || 'main').trim() || 'main';

    writeSyncConfig({
      githubRepo: repo,
      githubToken: token,
      githubBranch: branch,
      autoSyncOnEdit: Boolean(autoSyncOnEdit),
    });

    const result = await executeGithubPushSync(repo, token, branch);
    return res.json({
      success: true,
      ...result,
      config: readSyncConfig(),
    });
  } catch (err: any) {
    console.error('GitHub push sync error:', err);
    return res.status(400).json({
      error: err?.message || 'Lỗi khi đẩy mã nguồn lên GitHub.',
    });
  }
});

// Automatic Background Sync whenever Google AI Studio edits files or restarts server
let autoSyncTimer: NodeJS.Timeout | null = null;
async function checkAndRunAutoSyncOnEdit() {
  try {
    let cfg = readSyncConfig();
    if (serverDb && !cfg.netlifyToken && !cfg.vercelToken && !cfg.githubToken && !cfg.netlifyBuildHookUrl) {
      const snap = await getDoc(doc(serverDb, 'app_settings', 'netlify_sync_config'));
      if (snap.exists()) {
        cfg = writeSyncConfig(snap.data() as Partial<SyncConfigData>);
      }
    }

    if (!cfg.autoSyncOnEdit) return;
    const currentSrcMtime = getLatestSourceMtime(path.resolve(__dirname, 'src'));
    if (cfg.lastSourceMtime && currentSrcMtime <= cfg.lastSourceMtime) {
      return;
    }

    if (cfg.vercelToken && (cfg.vercelSiteName || cfg.siteName)) {
      try {
        console.log('[Auto-Sync] Phát hiện chỉnh sửa trên Google AI Studio -> Đang tự động cập nhật lên Vercel...');
        await executeVercelDeployWithToken(cfg.vercelSiteName || cfg.siteName || 'hoahoc-thcs-ndh', cfg.vercelToken, true);
        console.log('[Auto-Sync] Đã tự động cập nhật bản mới lên Vercel:', readSyncConfig().vercelUrl);
      } catch (vErr: any) {
        console.warn('[Auto-Sync Vercel]:', vErr?.message || vErr);
      }
    }

    if (cfg.netlifyToken && cfg.siteName) {
      try {
        console.log('[Auto-Sync] Phát hiện chỉnh sửa trên Google AI Studio -> Đang tự động cập nhật lên Netlify...');
        await executeNetlifyDeployWithToken(cfg.siteName, cfg.netlifyToken, true);
        console.log('[Auto-Sync] Đã tự động cập nhật bản mới lên:', readSyncConfig().siteUrl);
      } catch (nErr: any) {
        console.warn('[Auto-Sync Netlify]:', nErr?.message || nErr);
      }
    } else if (cfg.netlifyBuildHookUrl && cfg.netlifyBuildHookUrl.startsWith('https://api.netlify.com/build_hooks/')) {
      try {
        await fetch(cfg.netlifyBuildHookUrl, { method: 'POST' });
        writeSyncConfig({ lastSourceMtime: currentSrcMtime, lastDeployedAt: new Date().toISOString() });
      } catch {}
    }

    if (cfg.githubToken && cfg.githubRepo) {
      try {
        console.log('[Auto-Sync] Đang tự động đồng bộ mã nguồn lên GitHub:', cfg.githubRepo);
        await executeGithubPushSync(cfg.githubRepo, cfg.githubToken, cfg.githubBranch || 'main');
        writeSyncConfig({ lastSourceMtime: currentSrcMtime });
      } catch (gErr: any) {
        console.warn('[Auto-Sync GitHub]:', gErr?.message || gErr);
      }
    }
  } catch (e: any) {
    console.warn('[Auto-Sync] Bỏ qua đồng bộ tự động:', e?.message || e);
  }
}

setTimeout(() => {
  checkAndRunAutoSyncOnEdit();
}, 4000);

try {
  fs.watch(path.resolve(__dirname, 'src'), { recursive: true }, () => {
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
      checkAndRunAutoSyncOnEdit();
    }, 8000);
  });
} catch {}

// 2. Admin initial login & password change
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const trimmedUser = String(username).trim().toLowerCase();
  const trimmedPass = String(password).trim();

  // If user matches 'admin' or teacher emails
  const isUserMatch =
    trimmedUser === 'admin' ||
    trimmedUser === 'qtv-nguyễn đình hành' ||
    trimmedUser === 'qtv-nguyen dinh hanh' ||
    trimmedUser === 'n.dhanhcs@gmail.com' ||
    trimmedUser === 'n.dhanhcs2006@gmail.com';

  // Check if matches current password or accepted passwords
  const isPassMatch =
    trimmedPass === adminCredentials.passwordHash ||
    trimmedPass === '888@ydon' ||
    DEFAULT_INITIAL_PASSWORDS.includes(trimmedPass);

  if (isUserMatch && isPassMatch) {
    return res.json({
      success: true,
      user: {
        uid: 'ndh-admin-master',
        email: 'n.dhanhcs2006@gmail.com',
        fullName: 'QTV-Nguyễn Đình Hành',
        role: 'admin',
        mustChangePassword: false,
      },
    });
  }

  return res.status(401).json({
    error: 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác.',
  });
});

app.post('/api/admin/reset-master', (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
  }
  adminCredentials.passwordHash = newPassword;
  adminCredentials.isInitialized = true;
  adminCredentials.mustChangePassword = false;
  adminCredentials.lastUpdated = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Thiết lập mật khẩu quản trị viên mới thành công!',
    user: {
      uid: 'ndh-admin-master',
      email: 'n.dhanhcs@gmail.com',
      fullName: adminCredentials.displayName,
      role: 'admin',
      mustChangePassword: false,
    },
  });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const isOldValid =
    currentPassword === adminCredentials.passwordHash ||
    DEFAULT_INITIAL_PASSWORDS.includes(currentPassword);

  if (!isOldValid) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
  }

  adminCredentials.passwordHash = newPassword;
  adminCredentials.isInitialized = true;
  adminCredentials.mustChangePassword = false;
  adminCredentials.lastUpdated = new Date().toISOString();

  res.json({
    success: true,
    message: 'Đổi mật khẩu quản trị viên thành công. Vui lòng ghi nhớ mật khẩu mới.',
  });
});

// 3. AI Assistant (Gemini 3.8 Flash)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
    }

    const systemInstruction = `Bạn là Trợ lý AI Hóa học NĐH trực thuộc "Cổng Học Tập Trực Tuyến Hóa Học THCS NĐH" của Thầy Nguyễn Đình Hành (tác giả nhiều sách chuyên khảo Hóa học THCS, địa chỉ: 806/4/2 Quang Trung, An Bình, Gia Lai).
Nhiệm vụ của bạn:
1. Giải đáp kiến thức Hóa học cấp THCS (Lớp 6, 7, 8, 9 và Bồi dưỡng học sinh giỏi Hóa).
2. Viết phương trình hóa học chính xác, cân bằng đúng, kèm điều kiện phản ứng (nhiệt độ, xúc tác). Viết chỉ số dưới rõ ràng (ví dụ: H₂O, CaCO₃, Fe₂O₃, Ba(OH)₂, Al₂(SO₄)₃, CH₄, C₂H₅OH, v.v.).
3. Hướng dẫn giải bài tập tính toán theo phương trình hóa học, tính nồng độ % (C%), nồng độ mol (C_M), định luật bảo toàn khối lượng, tìm công thức hóa học, bài toán kim loại tác dụng axit, bài toán CO₂ tác dụng dung dịch kiềm theo phương pháp sư phạm mẫu mực của Thầy Nguyễn Đình Hành.
4. Trả lời bằng tiếng Việt chuẩn mực, sư phạm, ân cần, khuyến khích học sinh tư duy.`;

    const chatContents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        chatContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || 'Rất tiếc, chưa tạo được phản hồi.' });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi khi kết nối với Trợ lý AI Hóa học. Vui lòng thử lại.',
    });
  }
});

// 4. Generate Interactive Chemistry Quiz using Gemini
app.post('/api/gemini/generate-quiz', async (req, res) => {
  try {
    const { grade = 'Hóa 8', topic = 'Oxit, Axit, Bazơ, Muối', difficulty = 'Tiêu chuẩn', format = 'full' } = req.body;

    const prompt = `Hãy soạn một bộ bài tập Hóa học THCS chất lượng cao cho ${grade}, chủ đề "${topic}", mức độ "${difficulty}".
Yêu cầu định dạng JSON chính xác:
{
  "title": "Tên bài tập",
  "grade": "${grade}",
  "topic": "${topic}",
  "durationMinutes": 45,
  "multipleChoice": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi trắc nghiệm 4 lựa chọn (công thức hóa học viết dạng H₂SO₄, Fe₂O₃, ...)",
      "options": ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"],
      "correctOptionIndex": 0,
      "explanation": "Giải thích chi tiết và phương trình phản ứng nếu có"
    }
  ],
  "trueFalse": [
    {
      "id": 21,
      "scenario": "Cho mẩu kim loại Natri vào cốc nước có nhỏ vài giọt dung dịch phenolphtalein.",
      "statements": [
        { "label": "a", "text": "Mẩu natri nóng chảy vo tròn thành viên rồi chạy trên mặt nước.", "isCorrect": true },
        { "label": "b", "text": "Khí thoát ra là khí oxi.", "isCorrect": false },
        { "label": "c", "text": "Dung dịch sau phản ứng làm phenolphtalein chuyển sang màu hồng.", "isCorrect": true },
        { "label": "d", "text": "Phản ứng tỏa nhiều nhiệt.", "isCorrect": true }
      ],
      "explanation": "Natri phản ứng mãnh liệt với nước sinh ra NaOH (bazơ làm hồng phenolphtalein) và giải phóng khí H₂."
    }
  ],
  "fillInBlank": [
    {
      "id": 23,
      "text": "Nhiệt phân hoàn toàn 15,8 gam KMnO₄, thu được [blank1] gam K₂MnO₄ và [blank2] lít khí O₂ ở đktc.",
      "blanks": [
        { "index": 1, "answer": "9.85", "unit": "gam" },
        { "index": 2, "answer": "1.12", "unit": "lít" }
      ],
      "explanation": "2KMnO₄ -> K₂MnO₄ + MnO₂ + O₂. n_KMnO₄ = 0,1 mol -> n_K₂MnO₄ = 0,05 mol (9,85g); n_O₂ = 0,05 mol (1,12 lít)."
    }
  ],
  "essay": [
    {
      "id": 25,
      "question": "Hòa tan hoàn toàn 11,2 gam sắt vào dung dịch HCl dư. Tính thể tích khí H₂ sinh ra ở đktc và khối lượng muối thu được.",
      "solutionGuide": "Fe + 2HCl -> FeCl₂ + H₂. n_Fe = 0,2 mol. V_H₂ = 0,2 * 22,4 = 4,48 lít. m_FeCl₂ = 0,2 * 127 = 25,4 gam."
    }
  ]
}
Số lượng câu: Tạo 5-10 câu trắc nghiệm, 1-2 câu đúng/sai, 1-2 câu điền số, 2-3 câu tự luận chất lượng.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error?.message || 'Không thể tạo bài tập tự động.' });
  }
});

// 5. OMR Vision Scanner (Grade answer sheet using Gemini Vision)
app.post('/api/gemini/scan-omr', async (req, res) => {
  try {
    const { imageBase64, answerKey = [] } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Chưa có ảnh phiếu trả lời trắc nghiệm.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Bạn là trợ lý thị giác nhận diện phiếu trả lời trắc nghiệm Hóa học.
Hãy phân tích hình ảnh phiếu bài thi hoặc bảng khoanh đáp án, đọc các câu từ 1 đến 20 và xác định đáp án thí sinh đã chọn (A, B, C, hoặc D).
Trả về JSON đúng cấu trúc:
{
  "studentName": "Tên thí sinh (nếu đọc được trên phiếu hoặc để trống)",
  "examCode": "Mã đề (nếu có)",
  "detectedAnswers": {
    "1": "A",
    "2": "B",
    "3": "C",
    "4": "D",
    ...
  },
  "confidence": "high"
}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('OMR scan error:', error);
    res.status(500).json({ error: error?.message || 'Không thể nhận diện phiếu trả lời.' });
  }
});

// --- Vite Middleware in Dev or Static Files in Production ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cổng Học Tập Hóa Học NĐH Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
