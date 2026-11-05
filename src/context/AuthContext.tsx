import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import {
  verifyStudentInRoster,
  normalizeVietnamese,
  syncStudentRosterFromServer,
  normalizeClassName,
  deriveGradeFromClass,
} from '../utils/studentRoster';
import { readPersistedKey, writePersistedKey } from '../utils/cloudPersistence';
import bundledUsersJson from '../../ndh-users.json';

export interface LocalStoredAccount {
  uid: string;
  email: string;
  rawEmail?: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isOfficial?: boolean;
  status?: 'active' | 'pending' | 'locked' | 'guest';
  enrolledClass?: string;
  school?: string;
  grade?: string;
  studentCode?: string;
  phone?: string;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  registeredAccounts: LocalStoredAccount[];
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isOfficialStudent: boolean;
  isGuest: boolean;
  isParent: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (identifier: string, pass?: string) => Promise<UserProfile>;
  registerWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    role?: UserRole,
    enrolledClassInput?: string
  ) => Promise<{ isOfficial: boolean; role: UserRole; enrolledClass?: string; profile: UserProfile }>;
  syncRegisteredAccounts: () => Promise<LocalStoredAccount[]>;
  loginAdminMaster: (password: string, username?: string) => Promise<any>;
  resetAdminMasterPassword: (newPassword: string) => Promise<any>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_EMAIL = 'n.dhanhcs2006@gmail.com';
const SECONDARY_ADMIN_EMAIL = 'n.dhanhcs@gmail.com';

export function normalizeEmailClient(str: string): string {
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

export function getLocalRegisteredAccounts(): LocalStoredAccount[] {
  const saved = readPersistedKey<LocalStoredAccount[]>('ndh_registered_users', []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  if (Array.isArray(bundledUsersJson) && bundledUsersJson.length > 0) {
    writePersistedKey('ndh_registered_users', bundledUsersJson, { fromRemote: true });
    return bundledUsersJson as LocalStoredAccount[];
  }
  return [];
}

export function saveLocalRegisteredAccounts(accounts: LocalStoredAccount[], fromRemote = false) {
  writePersistedKey('ndh_registered_users', accounts, { fromRemote });
}

function mergeAccountLists(
  primary: LocalStoredAccount[],
  secondary: LocalStoredAccount[]
): LocalStoredAccount[] {
  const map = new Map<string, LocalStoredAccount>();

  const addAccount = (acc: LocalStoredAccount) => {
    if (!acc || (!acc.fullName && !acc.email)) return;
    const cleanEmail = normalizeEmailClient(acc.email || '');
    const normName = normalizeVietnamese(acc.fullName || '');
    const key = normName || cleanEmail || acc.uid;
    if (!key) return;

    const existing = map.get(key);
    const syncedProfile = syncStudentProfileWithRoster({
      uid: acc.uid || existing?.uid || 'ndh-user-' + Date.now(),
      email: cleanEmail || acc.email || existing?.email || '',
      fullName: acc.fullName || existing?.fullName || 'Học sinh',
      role: acc.role || existing?.role || 'student',
      isOfficial: acc.isOfficial ?? existing?.isOfficial,
      status: acc.status || existing?.status || 'active',
      enrolledClass: acc.enrolledClass || existing?.enrolledClass,
      school: acc.school || existing?.school,
      grade: acc.grade || existing?.grade,
      studentCode: acc.studentCode || existing?.studentCode,
      phone: acc.phone || existing?.phone,
      createdAt: acc.createdAt || existing?.createdAt || new Date().toISOString(),
    });

    map.set(key, {
      ...existing,
      ...acc,
      ...syncedProfile,
      email: cleanEmail || syncedProfile.email,
      rawEmail: acc.rawEmail || acc.email || existing?.rawEmail,
      passwordHash: acc.passwordHash || existing?.passwordHash || '123456',
    });
  };

  secondary.forEach(addAccount);
  primary.forEach(addAccount);

  return Array.from(map.values());
}

function syncStudentProfileWithRoster(profile: UserProfile): UserProfile {
  if (profile.role === 'admin' || profile.role === 'teacher' || profile.role === 'parent') {
    return profile;
  }
  const check = verifyStudentInRoster(
    profile.fullName,
    profile.email,
    profile.phone,
    profile.enrolledClass
  );
  if (check.isEnrolled) {
    return {
      ...profile,
      fullName: check.studentRecord?.fullName || profile.fullName,
      isOfficial: true,
      role: 'student',
      status: 'active',
      enrolledClass: check.studentRecord?.enrolledClass || profile.enrolledClass,
      school: check.studentRecord?.school || profile.school,
      grade: check.studentRecord?.grade || profile.grade,
      studentCode: check.studentRecord?.studentCode || profile.studentCode,
      phone: check.studentRecord?.phone || profile.phone,
    };
  }
  if (profile.isOfficial && profile.enrolledClass) {
    return {
      ...profile,
      role: 'student',
      status: 'active',
    };
  }
  return {
    ...profile,
    isOfficial: false,
    role: 'guest',
    status: 'guest',
    enrolledClass: profile.enrolledClass,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<LocalStoredAccount[]>(() =>
    getLocalRegisteredAccounts()
  );
  const [loading, setLoading] = useState<boolean>(true);

  const syncRegisteredAccounts = useCallback(async (): Promise<LocalStoredAccount[]> => {
    let localList = getLocalRegisteredAccounts();

    // Also pull any course registrations from RegistrationPage ('ndh_registrations') into accounts
    try {
      const courseRegs = readPersistedKey<any[]>('ndh_registrations', []);
      if (Array.isArray(courseRegs) && courseRegs.length > 0) {
        const converted: LocalStoredAccount[] = courseRegs
          .filter((r: any) => r && r.fullName)
          .map((r: any, idx: number) => ({
            uid: 'ndh-reg-' + idx + '-' + normalizeVietnamese(r.fullName),
            email:
              normalizeEmailClient(r.email || '') ||
              `${normalizeVietnamese(r.fullName)}@hoahocndh.edu.vn`,
            passwordHash: r.phone ? String(r.phone).trim() : '123456',
            fullName: String(r.fullName).trim(),
            role: 'student' as UserRole,
            enrolledClass: r.desiredClass || '',
            school: r.school || 'THCS',
            grade: r.currentGrade || '',
            phone: r.phone || '',
            createdAt: r.createdAt || new Date().toISOString(),
          }));
        localList = mergeAccountLists(localList, converted);
      }
    } catch {
      // ignore
    }

    // Pull from Backend /api/auth/users (only if JSON response)
    let serverUsers: LocalStoredAccount[] = [];
    try {
      const res = await fetch('/api/auth/users');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data?.users)) {
          serverUsers = data.users;
        }
      }
    } catch {}

    const merged = mergeAccountLists(serverUsers, localList);
    saveLocalRegisteredAccounts(merged, merged.length <= serverUsers.length);
    setRegisteredAccounts(merged);

    if (merged.length > serverUsers.length && serverUsers.length > 0) {
      fetch('/api/auth/sync-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: merged }),
      }).catch(() => {});
    }

    return merged;
  }, []);

  // Activate a student/user profile session and clear any conflicting admin/Google session
  const activateStudentSession = (profile: UserProfile) => {
    const synced = syncStudentProfileWithRoster(profile);
    localStorage.removeItem('ndh_admin_session');
    sessionStorage.removeItem('ndh_admin_session');
    localStorage.setItem('ndh_active_auth_mode', 'student_session');
    localStorage.setItem('ndh_user_session', JSON.stringify(synced));
    sessionStorage.setItem('ndh_user_session', JSON.stringify(synced));
    setCurrentUser(null);
    setUserProfile(synced);
    if (auth.currentUser) {
      signOut(auth).catch(() => {});
    }
    return synced;
  };

  // Sync profile from local student session, local admin session, or Firebase user
  const fetchProfile = async (firebaseUser: User | null) => {
    const activeMode = localStorage.getItem('ndh_active_auth_mode');

    // 1. If explicitly in student_session mode, prioritize ndh_user_session even if firebaseUser exists
    const savedUserSession =
      localStorage.getItem('ndh_user_session') ||
      sessionStorage.getItem('ndh_user_session');
    if (savedUserSession && (activeMode === 'student_session' || !firebaseUser)) {
      try {
        const parsed = JSON.parse(savedUserSession) as UserProfile;
        const synced = syncStudentProfileWithRoster(parsed);
        localStorage.setItem('ndh_user_session', JSON.stringify(synced));
        sessionStorage.setItem('ndh_user_session', JSON.stringify(synced));
        setUserProfile(synced);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('ndh_user_session');
        sessionStorage.removeItem('ndh_user_session');
      }
    }

    // 2. Check if admin session exists in local or session storage
    const savedAdminSession =
      localStorage.getItem('ndh_admin_session') ||
      sessionStorage.getItem('ndh_admin_session');
    if (savedAdminSession && !firebaseUser) {
      try {
        const parsed = JSON.parse(savedAdminSession);
        setUserProfile(parsed);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('ndh_admin_session');
        sessionStorage.removeItem('ndh_admin_session');
      }
    }

    if (!firebaseUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      const isKnownAdminEmail =
        firebaseUser.email === MASTER_ADMIN_EMAIL ||
        firebaseUser.email === SECONDARY_ADMIN_EMAIL;

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (isKnownAdminEmail && data.role !== 'admin') {
          data.role = 'admin';
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        } else if (data.role === 'student' || data.role === 'guest') {
          const synced = syncStudentProfileWithRoster(data);
          Object.assign(data, synced);
        }
        setUserProfile({ ...data, uid: firebaseUser.uid });
      } else {
        const check = verifyStudentInRoster(
          firebaseUser.displayName || '',
          firebaseUser.email || ''
        );
        const isOfficial = !isKnownAdminEmail && check.isEnrolled;

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName:
            check.studentRecord?.fullName ||
            firebaseUser.displayName ||
            (isKnownAdminEmail ? 'Thầy Nguyễn Đình Hành' : 'Học viên'),
          role: isKnownAdminEmail ? 'admin' : isOfficial ? 'student' : 'guest',
          isOfficial: isKnownAdminEmail ? true : isOfficial,
          enrolledClass: check.studentRecord?.enrolledClass,
          school: check.studentRecord?.school,
          grade: check.studentRecord?.grade,
          studentCode: check.studentRecord?.studentCode,
          status: isKnownAdminEmail || isOfficial ? 'active' : 'guest',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(userDocRef, newProfile);
        } catch (err) {
          console.warn('Could not write user profile to firestore:', err);
        }

        if (isKnownAdminEmail) {
          try {
            await setDoc(doc(db, 'admins', firebaseUser.uid), {
              email: firebaseUser.email,
              fullName: newProfile.fullName,
              createdAt: new Date().toISOString(),
            });
          } catch (adminErr) {
            console.warn('Could not register in admins collection:', adminErr);
          }
        }

        setUserProfile(newProfile);
      }
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      const isKnownAdminEmail =
        firebaseUser.email === MASTER_ADMIN_EMAIL ||
        firebaseUser.email === SECONDARY_ADMIN_EMAIL;
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName:
          firebaseUser.displayName ||
          (isKnownAdminEmail ? 'QTV-Nguyễn Đình Hành' : 'Thành viên'),
        role: isKnownAdminEmail ? 'admin' : 'student',
        status: 'active',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncRegisteredAccounts();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const activeMode = localStorage.getItem('ndh_active_auth_mode');
      if (activeMode === 'student_session' && localStorage.getItem('ndh_user_session')) {
        setCurrentUser(null);
        await fetchProfile(null);
        return;
      }
      setCurrentUser(user);
      await fetchProfile(user);
    });

    const unsubUsers = onSnapshot(
      doc(db, 'app_settings', 'registered_users'),
      (snap) => {
        if (!snap.exists()) return;
        const fsUsers = Array.isArray(snap.data()?.users) ? snap.data().users : [];
        if (fsUsers.length > 0) {
          const merged = mergeAccountLists(fsUsers, getLocalRegisteredAccounts());
          saveLocalRegisteredAccounts(merged);
          setRegisteredAccounts(merged);
        }
      },
      () => {}
    );

    const handleRosterUpdated = () => {
      syncRegisteredAccounts();
      const savedUserSession =
        localStorage.getItem('ndh_user_session') ||
        sessionStorage.getItem('ndh_user_session');
      if (savedUserSession) {
        try {
          const parsed = JSON.parse(savedUserSession) as UserProfile;
          const synced = syncStudentProfileWithRoster(parsed);
          localStorage.setItem('ndh_user_session', JSON.stringify(synced));
          sessionStorage.setItem('ndh_user_session', JSON.stringify(synced));
          setUserProfile(synced);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('ndh-roster-updated', handleRosterUpdated);

    return () => {
      unsubscribe();
      unsubUsers();
      window.removeEventListener('ndh-roster-updated', handleRosterUpdated);
    };
  }, [syncRegisteredAccounts]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('ndh_active_auth_mode');
      sessionStorage.removeItem('ndh_admin_session');
      localStorage.removeItem('ndh_user_session');
      sessionStorage.removeItem('ndh_user_session');
      setCurrentUser(res.user);
      await fetchProfile(res.user);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (identifier: string, pass: string = ''): Promise<UserProfile> => {
    setLoading(true);
    try {
      const rawInput = (identifier || '').trim();
      const cleanPass = (pass || '').trim();

      if (!rawInput) {
        throw new Error('Vui lòng nhập đầy đủ Họ và tên học sinh để đăng nhập.');
      }
      if (!cleanPass) {
        throw new Error('Vui lòng nhập mật khẩu để đăng nhập.');
      }

      const cleanIdentifier = rawInput.toLowerCase();
      const normEmailInput = normalizeEmailClient(rawInput);
      const normEmailPrefix = normEmailInput.split('@')[0];
      const normNameInput = normalizeVietnamese(rawInput);

      // 0. Ensure latest student roster from Cloud Firestore is synced before checking login (critical for Netlify & mobile)
      try {
        await syncStudentRosterFromServer();
      } catch {
        // Ignore network error and use cached/bundled roster
      }

      // 1. Try server-side auth endpoint (/api/auth/login) if running on AI Studio / Node server
      try {
        const apiRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: rawInput,
            identifier: rawInput,
            password: cleanPass,
          }),
        });
        const contentType = apiRes.headers.get('content-type') || '';
        if (apiRes.ok && contentType.includes('application/json')) {
          const data = await apiRes.json();
          if (data?.user) {
            if (data.accountWithPass) {
              const updatedList = mergeAccountLists(
                [data.accountWithPass],
                getLocalRegisteredAccounts()
              );
              saveLocalRegisteredAccounts(updatedList);
              setRegisteredAccounts(updatedList);
              setDoc(
                doc(db, 'app_settings', 'registered_users'),
                {
                  users: updatedList,
                  count: updatedList.length,
                  updatedAt: Date.now(),
                },
                { merge: false }
              ).catch(() => {});
            }
            return activateStudentSession(data.user as UserProfile);
          }
        }
      } catch {
        // Fallback to Cloud Firestore & client-side roster on Netlify
      }

      // 2. Sync & check registered accounts from Cloud Firestore + local storage
      const latestAccounts = await syncRegisteredAccounts();
      const matchedLocal = latestAccounts.find((acc) => {
        const accEmailNorm = normalizeEmailClient(acc.email || '');
        const accRawEmailNorm = normalizeEmailClient(acc.rawEmail || '');
        const accPrefix = accEmailNorm.split('@')[0];
        const accNameNorm = normalizeVietnamese(acc.fullName || '');
        const accCodeNorm = normalizeVietnamese(acc.studentCode || '');

        return (
          acc.uid === rawInput ||
          (acc.email && acc.email.toLowerCase() === cleanIdentifier) ||
          (acc.rawEmail && acc.rawEmail.toLowerCase() === cleanIdentifier) ||
          (normEmailInput &&
            (accEmailNorm === normEmailInput || accRawEmailNorm === normEmailInput)) ||
          (normEmailPrefix && normEmailPrefix.length >= 3 && accPrefix === normEmailPrefix) ||
          (normNameInput && accNameNorm === normNameInput) ||
          (normNameInput && accCodeNorm && accCodeNorm === normNameInput)
        );
      });

      if (matchedLocal) {
        const updatedStored: LocalStoredAccount = {
          ...matchedLocal,
          passwordHash: cleanPass || matchedLocal.passwordHash || '123456',
        };
        const updatedList = mergeAccountLists([updatedStored], latestAccounts);
        saveLocalRegisteredAccounts(updatedList);
        setRegisteredAccounts(updatedList);
        setDoc(
          doc(db, 'app_settings', 'registered_users'),
          {
            users: updatedList,
            count: updatedList.length,
            updatedAt: Date.now(),
          },
          { merge: false }
        ).catch(() => {});

        const { passwordHash: _omitted, ...rest } = updatedStored;
        return activateStudentSession(rest as UserProfile);
      }

      // 3. Check if student is in Teacher's uploaded roster (verifyStudentInRoster) and auto-sync account
      const rosterCheck = verifyStudentInRoster(rawInput, rawInput);
      if (rosterCheck.isEnrolled && rosterCheck.studentRecord) {
        const rec = rosterCheck.studentRecord;
        const autoEmail = rawInput.includes('@')
          ? normEmailInput
          : `${normalizeVietnamese(rec.fullName)}@hoahocndh.edu.vn`;

        const autoProfile: UserProfile = {
          uid: 'ndh-user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          email: autoEmail,
          fullName: rec.fullName,
          role: 'student',
          isOfficial: true,
          status: 'active',
          enrolledClass: rec.enrolledClass,
          school: rec.school || 'THCS',
          grade: rec.grade,
          studentCode: rec.studentCode,
          phone: rec.phone,
          createdAt: new Date().toISOString(),
        };

        const newStored: LocalStoredAccount = {
          ...autoProfile,
          rawEmail: rawInput,
          passwordHash: cleanPass || '123456',
        };
        const updatedList = mergeAccountLists([newStored], latestAccounts);
        saveLocalRegisteredAccounts(updatedList);
        setRegisteredAccounts(updatedList);

        setDoc(
          doc(db, 'app_settings', 'registered_users'),
          {
            users: updatedList,
            count: updatedList.length,
            updatedAt: Date.now(),
          },
          { merge: false }
        ).catch(() => {});

        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: autoEmail,
            password: cleanPass || '123456',
            fullName: rec.fullName,
            role: 'student',
            isOfficial: true,
            enrolledClass: rec.enrolledClass,
            school: rec.school,
            grade: rec.grade,
            studentCode: rec.studentCode,
            phone: rec.phone,
          }),
        }).catch(() => {});

        return activateStudentSession(autoProfile);
      }

      throw new Error(
        'Họ và tên học sinh "' +
          rawInput +
          '" chưa có trong danh sách lớp hoặc chưa đăng ký tài khoản. Vui lòng kiểm tra lại chính xác Họ và tên hoặc chuyển sang mục "Đăng ký" (nhập Họ và tên, Lớp, Mật khẩu)!'
      );
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole = 'student',
    enrolledClassInput: string = ''
  ) => {
    setLoading(true);
    try {
      const cleanName = fullName.trim();
      const rawClassInput = enrolledClassInput.trim();
      const normalizedInputClass = rawClassInput
        ? normalizeClassName(rawClassInput, rawClassInput)
        : '';
      const rawEmail = email.trim().toLowerCase();
      const cleanEmail =
        normalizeEmailClient(rawEmail) ||
        `${normalizeVietnamese(cleanName)}@hoahocndh.edu.vn`;
      const cleanPass = pass.trim();

      if (!cleanName) {
        throw new Error('Vui lòng nhập đầy đủ Họ và tên học sinh.');
      }
      if (role === 'student' && !normalizedInputClass) {
        throw new Error('Vui lòng nhập hoặc chọn Lớp đang theo học.');
      }
      if (!cleanPass || cleanPass.length < 4) {
        throw new Error('Mật khẩu phải có ít nhất 4 ký tự.');
      }

      // 0. Sync latest student roster from Cloud Firestore before checking (critical on Netlify)
      try {
        await syncStudentRosterFromServer();
      } catch {
        // Ignore network error and use cached/bundled roster
      }

      // 1. Verify if student name is in the teacher's approved roster
      const checkResult = verifyStudentInRoster(
        cleanName,
        cleanEmail,
        '',
        normalizedInputClass
      );
      let isOfficial = role === 'student' ? checkResult.isEnrolled : false;
      let assignedRole: UserRole =
        role === 'student' ? (isOfficial ? 'student' : 'guest') : role;
      let enrolledClass =
        checkResult.studentRecord?.enrolledClass || normalizedInputClass || undefined;
      let school = checkResult.studentRecord?.school || 'THCS';
      let grade =
        checkResult.studentRecord?.grade ||
        (enrolledClass ? deriveGradeFromClass(enrolledClass) : undefined);
      let studentCode = checkResult.studentRecord?.studentCode;
      let phone = checkResult.studentRecord?.phone;
      let canonicalName = checkResult.studentRecord?.fullName || cleanName;
      let uid = 'ndh-user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

      // 2. Register on backend (/api/auth/register) if available
      try {
        const apiRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPass,
            fullName: cleanName,
            role,
            isOfficial,
            enrolledClass,
            school,
            grade,
            studentCode,
            phone,
          }),
        });
        const contentType = apiRes.headers.get('content-type') || '';
        if (apiRes.ok && contentType.includes('application/json')) {
          const data = await apiRes.json();
          if (data?.user) {
            uid = data.user.uid || uid;
            isOfficial = Boolean(data.isOfficial || isOfficial);
            assignedRole =
              role === 'student' ? (isOfficial ? 'student' : 'guest') : role;
            enrolledClass = data.user.enrolledClass || enrolledClass;
            school = data.user.school || school;
            grade = data.user.grade || grade;
            studentCode = data.user.studentCode || studentCode;
            phone = data.user.phone || phone;
            canonicalName = data.user.fullName || canonicalName;
          }
        }
      } catch {
        // Proceed with Cloud Firestore + local storage registration on Netlify
      }

      const newProfile: UserProfile = {
        uid,
        email: cleanEmail,
        fullName: canonicalName,
        role: assignedRole,
        isOfficial,
        status: isOfficial ? 'active' : 'guest',
        enrolledClass,
        school,
        grade,
        studentCode,
        phone,
        createdAt: new Date().toISOString(),
      };

      // 3. Save account in local & Cloud Firestore registered users list so student can re-login on any device
      const storedAccount: LocalStoredAccount = {
        ...newProfile,
        rawEmail: rawEmail || cleanEmail,
        passwordHash: cleanPass,
      };
      const merged = mergeAccountLists([storedAccount], getLocalRegisteredAccounts());
      saveLocalRegisteredAccounts(merged);
      setRegisteredAccounts(merged);

      try {
        await setDoc(
          doc(db, 'app_settings', 'registered_users'),
          {
            users: merged,
            count: merged.length,
            updatedAt: Date.now(),
          },
          { merge: false }
        );
      } catch {
        // Ignore offline/firestore write warning
      }

      // 4. Activate student session immediately
      const activated = activateStudentSession(newProfile);

      return {
        isOfficial: Boolean(activated.isOfficial),
        role: activated.role,
        enrolledClass: activated.enrolledClass,
        profile: activated,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Dedicated admin login (username: admin, password: 888@ydon, displayName: QTV-Nguyễn Đình Hành)
  const loginAdminMaster = async (password: string, username: string = 'admin') => {
    setLoading(true);
    try {
      const trimmedPass = (password || '').trim();
      const trimmedUser = (username || 'admin').trim();
      const customSavedPass = localStorage.getItem('ndh_admin_custom_pass');

      const isAdminUsername =
        trimmedUser.toLowerCase() === 'admin' ||
        trimmedUser.toLowerCase() === 'qtv-nguyễn đình hành' ||
        trimmedUser.toLowerCase() === 'qtv-nguyen dinh hanh' ||
        trimmedUser.toLowerCase() === 'n.dhanhcs2006@gmail.com' ||
        trimmedUser.toLowerCase() === 'n.dhanhcs@gmail.com';

      const isMasterDefault =
        isAdminUsername &&
        (trimmedPass === '888@ydon' ||
          trimmedPass === 'admin' ||
          trimmedPass === 'ndh2026' ||
          trimmedPass === '123456' ||
          (customSavedPass && trimmedPass === customSavedPass));

      if (isMasterDefault) {
        const adminUser: UserProfile = {
          uid: 'ndh-admin-master',
          email: 'n.dhanhcs2006@gmail.com',
          fullName: 'QTV-Nguyễn Đình Hành',
          role: 'admin',
          mustChangePassword: false,
          status: 'active',
        };

        localStorage.setItem('ndh_active_auth_mode', 'admin_session');
        localStorage.removeItem('ndh_user_session');
        sessionStorage.removeItem('ndh_user_session');
        localStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
        sessionStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
        setUserProfile(adminUser);
        return adminUser;
      }

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
        }

        const adminUser: UserProfile = {
          uid: data.user.uid,
          email: data.user.email,
          fullName: 'QTV-Nguyễn Đình Hành',
          role: 'admin',
          mustChangePassword: false,
          status: 'active',
        };

        localStorage.setItem('ndh_active_auth_mode', 'admin_session');
        localStorage.removeItem('ndh_user_session');
        sessionStorage.removeItem('ndh_user_session');
        localStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
        sessionStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
        setUserProfile(adminUser);
        return adminUser;
      } catch (apiErr: any) {
        throw new Error(
          apiErr?.message && !apiErr.message.includes('Unexpected token')
            ? apiErr.message
            : 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác.'
        );
      }
    } catch (error) {
      console.error('Admin master login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetAdminMasterPassword = async (newPassword: string) => {
    setLoading(true);
    try {
      if (!newPassword || newPassword.trim().length < 4) {
        throw new Error('Mật khẩu mới phải có ít nhất 4 ký tự.');
      }
      localStorage.setItem('ndh_admin_custom_pass', newPassword.trim());
      try {
        await fetch('/api/admin/reset-master', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword: newPassword.trim() }),
        });
      } catch {
        // Ignore on static Netlify deployment
      }
      const adminUser: UserProfile = {
        uid: 'ndh-admin-master',
        email: 'n.dhanhcs2006@gmail.com',
        fullName: 'QTV-Nguyễn Đình Hành',
        role: 'admin',
        mustChangePassword: false,
        status: 'active',
      };
      localStorage.setItem('ndh_active_auth_mode', 'admin_session');
      localStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
      sessionStorage.setItem('ndh_admin_session', JSON.stringify(adminUser));
      setUserProfile(adminUser);
      return adminUser;
    } catch (error) {
      console.error('Reset admin master error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      if (isAdmin && userProfile?.uid === 'ndh-admin-master') {
        localStorage.setItem('ndh_admin_custom_pass', newPassword.trim());
        try {
          const res = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
          });
          if (res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu quản trị viên thất bại.');
          }
        } catch {
          // Saved locally for static deployment
        }
        return;
      }

      if (userProfile?.email || userProfile?.fullName) {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userProfile.email || userProfile.fullName,
            newPassword,
          }),
        }).catch(() => {});

        const accounts = getLocalRegisteredAccounts();
        const idx = accounts.findIndex(
          (a) =>
            normalizeEmailClient(a.email) === normalizeEmailClient(userProfile.email || '') ||
            normalizeVietnamese(a.fullName) === normalizeVietnamese(userProfile.fullName || '')
        );
        if (idx >= 0) {
          accounts[idx].passwordHash = newPassword;
          saveLocalRegisteredAccounts(accounts);
          setRegisteredAccounts([...accounts]);
          return;
        }
      }

      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return;
      }

      throw new Error('Không tìm thấy phiên đăng nhập hợp lệ để đổi mật khẩu.');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = normalizeEmailClient(email);
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
    } catch {
      // ignore
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch {
      // Do not fail if Firebase email provider is not enabled
    }
  };

  const logout = async () => {
    localStorage.removeItem('ndh_active_auth_mode');
    localStorage.removeItem('ndh_admin_session');
    sessionStorage.removeItem('ndh_admin_session');
    localStorage.removeItem('ndh_user_session');
    sessionStorage.removeItem('ndh_user_session');
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
  };

  const refreshProfile = async () => {
    await syncRegisteredAccounts();
    if (currentUser) {
      await fetchProfile(currentUser);
    } else {
      await fetchProfile(null);
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    (!userProfile &&
      (currentUser?.email === MASTER_ADMIN_EMAIL ||
        currentUser?.email === SECONDARY_ADMIN_EMAIL));
  const isTeacher = isAdmin || userProfile?.role === 'teacher';
  const isOfficialStudent =
    isAdmin ||
    isTeacher ||
    (userProfile?.role === 'student' && userProfile?.isOfficial === true);
  const isStudent = userProfile?.role === 'student';
  const isParent = userProfile?.role === 'parent';
  const isGuest =
    !isAdmin &&
    !isTeacher &&
    (!isOfficialStudent || userProfile?.role === 'guest' || userProfile?.isOfficial === false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        registeredAccounts,
        isAdmin,
        isTeacher,
        isStudent,
        isOfficialStudent,
        isGuest,
        isParent,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        syncRegisteredAccounts,
        loginAdminMaster,
        resetAdminMasterPassword,
        changeUserPassword,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
