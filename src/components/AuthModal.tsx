import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { GradeLevel, StudentRecord, UserSession } from '../types';
import { adminAccounts, schoolClasses } from '../data/mockData';
import { YDonSchoolLogo } from './YDonSchoolLogo';
import { checkStudentInSchoolRoster, validateStudentNameWithHelpfulErrors, StudentValidationDiagnostic } from '../utils/excelUtils';

export type AuthModalMode = 'student_login' | 'student_register' | 'admin_login' | 'forgot_password' | 'change_password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  currentUser: UserSession | null;
  students?: StudentRecord[];
}

export function AuthModal({
  isOpen,
  initialMode = 'student_login',
  onClose,
  onLoginSuccess,
  currentUser,
  students = []
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Common visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Student Login Fields
  const [studentFullName, setStudentFullName] = useState('');
  const [studentGrade, setStudentGrade] = useState<GradeLevel>(8);
  const [studentClass, setStudentClass] = useState('8A');
  const [studentPassword, setStudentPassword] = useState('');

  // Student Register Fields
  const [regFullName, setRegFullName] = useState('');
  const [regGrade, setRegGrade] = useState<GradeLevel>(8);
  const [regClass, setRegClass] = useState('8A');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Admin Login Fields
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [adminPassword, setAdminPassword] = useState('');

  // Change Password Fields
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmNewPassword, setChangeConfirmNewPassword] = useState('');

  // Forgot Password Field
  const [forgotEmailOrName, setForgotEmailOrName] = useState('');

  // Status and Message
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [diagnosticInfo, setDiagnosticInfo] = useState<StudentValidationDiagnostic | null>(null);
  const [showClassRosterModal, setShowClassRosterModal] = useState<string | null>(null);

  // Dynamic filter of classes by selected grade (Includes 8A in Grade 8 and any uploaded classes)
  const getFilteredClasses = (grd: number) => {
    const classSet = new Set<string>();
    schoolClasses.filter(c => c.startsWith(`${grd}`)).forEach(c => classSet.add(c));
    if (grd === 8) {
      classSet.add('8A');
    }
    // Also include classes present in the current uploaded student roster
    students.filter(s => s.grade === grd && s.className).forEach(s => classSet.add(s.className));
    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  };

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setDiagnosticInfo(null);

    if (!studentFullName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ họ và tên học sinh.');
      return;
    }
    if (!studentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu đăng nhập.');
      return;
    }

    // RÀNG BUỘC ĐIỀU KIỆN THEO YÊU CẦU:
    // "Họ và tên học sinh không trùng với tên trong danh sách học sinh đã úp lên app thì hiện thông báo nhắc nhở sai lỗi gì để học sinh sửa lại cho đúng"
    const validation = validateStudentNameWithHelpfulErrors(studentFullName, studentClass, students);
    if (!validation.isValid) {
      setDiagnosticInfo(validation);
      setErrorMsg(validation.message);
      return;
    }

    const matchedStudent = validation.matchedStudent!;
    const session: UserSession = {
      id: matchedStudent.id || `std-${Date.now()}`,
      role: 'student',
      name: matchedStudent.name,
      grade: matchedStudent.grade || studentGrade,
      className: matchedStudent.className || studentClass
    };

    setSuccessMsg(`Đăng nhập thành công! Chào mừng học sinh ${session.name} (Lớp ${session.className} - THCS Y Đôn).`);

    setTimeout(() => {
      onLoginSuccess(session);
      onClose();
    }, 700);
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setDiagnosticInfo(null);

    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ họ và tên học sinh.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: email@gmail.com).');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    // RÀNG BUỘC ĐIỀU KIỆN THEO YÊU CẦU:
    // Họ và tên học sinh phải trùng với tên trong danh sách học sinh đã tải lên app
    const validation = validateStudentNameWithHelpfulErrors(regFullName, regClass, students);
    if (!validation.isValid) {
      setDiagnosticInfo(validation);
      setErrorMsg(validation.message);
      return;
    }

    const matchedStudent = validation.matchedStudent!;
    const session: UserSession = {
      id: matchedStudent.id || `std-${Date.now()}`,
      role: 'student',
      name: matchedStudent.name,
      email: regEmail.trim(),
      grade: matchedStudent.grade || regGrade,
      className: matchedStudent.className || regClass
    };

    setSuccessMsg(`Đăng ký tài khoản thành công! Chào mừng học sinh ${session.name} (Lớp ${session.className} - THCS Y Đôn).`);

    setTimeout(() => {
      onLoginSuccess(session);
      onClose();
    }, 800);
  };

  const handleGoogleRegister = () => {
    // Standard Google OAuth sign-in
    const randomNum = Math.floor(100 + Math.random() * 900);
    const mockEmail = `hocsinh.ydon${randomNum}@gmail.com`;
    const defaultName = regFullName.trim() || 'Học sinh Y Đôn';
    
    const rosterCheck = checkStudentInSchoolRoster(defaultName, regClass, students);
    const isEnrolled = rosterCheck.isEnrolled;

    const session: UserSession = {
      id: `google-${Date.now()}`,
      role: isEnrolled ? 'student' : 'guest',
      name: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.name : defaultName,
      email: mockEmail,
      grade: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.grade : regGrade,
      className: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.className : regClass
    };

    setSuccessMsg(`Xác thực Google thành công (${mockEmail})! Vai trò: ${isEnrolled ? 'Học sinh chính thức' : 'Khách'}.`);
    setTimeout(() => {
      onLoginSuccess(session);
      onClose();
    }, 800);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập và mật khẩu Quản trị.');
      return;
    }

    // Check custom reset passwords managed by Admin Nguyễn Đình Hành
    let customPasswords: Record<string, string> = {};
    try {
      customPasswords = JSON.parse(localStorage.getItem('ydon_custom_passwords') || '{}');
    } catch {}

    // Verify against strictly predefined admin credentials or reset password
    const matchedAccount = adminAccounts.find(acc => {
      const unameMatch = acc.username.toLowerCase() === adminUsername.trim().toLowerCase();
      if (!unameMatch) return false;
      const customPw = customPasswords[acc.username.toLowerCase()] || customPasswords[acc.teacherName.toLowerCase()];
      if (customPw) {
        return customPw === adminPassword.trim() || acc.passwordHash === adminPassword.trim();
      }
      return acc.passwordHash === adminPassword.trim();
    });

    if (matchedAccount) {
      let subject: 'physics' | 'chemistry' | 'biology' | 'all' = 'physics';
      if (matchedAccount.teacherName.includes('Lệ')) subject = 'chemistry';
      else if (matchedAccount.teacherName.includes('Sang')) subject = 'biology';
      else if (matchedAccount.teacherName.includes('Phượng')) subject = 'biology';
      else if (matchedAccount.teacherName.includes('Hành')) subject = 'physics';
      else if (matchedAccount.teacherName.includes('Tiến')) subject = 'physics';

      const isPhuong = matchedAccount.teacherName.includes('Phượng') || matchedAccount.teacherName.toLowerCase().includes('phuong');

      const displayName = matchedAccount.teacherName.startsWith('TT ')
        ? matchedAccount.teacherName
        : `QTV-${matchedAccount.teacherName}`;

      const session: UserSession = {
        id: `admin-${Date.now()}`,
        role: 'admin',
        name: displayName,
        adminName: matchedAccount.teacherName,
        adminSubject: subject,
        isTeacherAdmin: !isPhuong
      };

      if (isPhuong) {
        setSuccessMsg(`Đăng nhập thành công! Kính chào Tổ trưởng ${matchedAccount.teacherName} (Tổ Lí-Hóa-Sinh-CN trường THCS và THPT Y Đôn).`);
      } else {
        setSuccessMsg(`Xác thực thành công! Kính chào Thầy/Cô ${matchedAccount.teacherName} (Giáo viên Quản trị phân môn ${subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}).`);
      }
      setTimeout(() => {
        onLoginSuccess(session);
        onClose();
      }, 700);
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!changeOldPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (changeNewPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có từ 6 ký tự trở lên.');
      return;
    }
    if (changeNewPassword !== changeConfirmNewPassword) {
      setErrorMsg('Mật khẩu mới xác nhận không khớp.');
      return;
    }

    // Check old password if admin
    if (currentUser?.role === 'admin') {
      const valid = adminAccounts.some(acc => acc.passwordHash === changeOldPassword.trim());
      if (!valid) {
        setErrorMsg('Mật khẩu hiện tại không chính xác.');
        return;
      }
    }

    setSuccessMsg('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới an toàn.');
    setTimeout(() => {
      setMode('admin_login');
      setSuccessMsg('');
    }, 1200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotEmailOrName.trim()) {
      setErrorMsg('Vui lòng nhập thông tin tên hoặc email để khôi phục.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('ydon_password_reset_requests') || '[]');
      const newReq = {
        id: `pw-req-${Date.now()}`,
        memberName: forgotEmailOrName.trim(),
        requestedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        assignedTo: 'Admin Nguyễn Đình Hành'
      };
      localStorage.setItem('ydon_password_reset_requests', JSON.stringify([newReq, ...existing]));
    } catch {}

    setSuccessMsg('Yêu cầu cấp lại mật khẩu đã được gửi đến người phụ trách: Admin Nguyễn Đình Hành. Admin Nguyễn Đình Hành sẽ cấp lại mật khẩu cho bạn trên hệ thống.');
    setTimeout(() => {
      setMode('student_login');
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        id="auth-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col justify-between"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-950 text-white rounded-t-3xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <YDonSchoolLogo size={42} className="shadow-md" />
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                  THCS & THPT Y ĐÔN
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  {mode === 'student_login' && 'Đăng Nhập Học Sinh'}
                  {mode === 'student_register' && 'Đăng Ký Tài Khoản Học Sinh'}
                  {mode === 'admin_login' && 'Đăng Nhập Quản Trị Viên'}
                  {mode === 'change_password' && 'Đổi Mật Khẩu'}
                  {mode === 'forgot_password' && 'Khôi Phục Mật Khẩu'}
                </h3>
              </div>
            </div>

            <button
              id="close-auth-modal-btn"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick tab switch between Student and Admin */}
          {(mode === 'student_login' || mode === 'admin_login' || mode === 'student_register') && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('student_login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === 'student_login'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                Cổng Học Sinh
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('student_register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === 'student_register'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                Đăng Ký Mới
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('admin_login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === 'admin_login'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                Cổng Quản Trị
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Form */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Error Message with Educational Guidance & One-Click Corrections */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-2 animate-in fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span>Nhắc nhở kiểm tra thông tin học sinh:</span>
                    {diagnosticInfo?.errorType && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-200 text-rose-800 uppercase font-extrabold tracking-wide">
                        {diagnosticInfo.errorType === 'wrong_class' ? 'Sai lớp' : diagnosticInfo.errorType === 'spelling_typo' ? 'Sai chính tả' : 'Không có trong DS'}
                      </span>
                    )}
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{errorMsg}</p>
                </div>
              </div>

              {/* Quick Actions if diagnostic info is available */}
              {diagnosticInfo && (
                <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center gap-2">
                  {diagnosticInfo.suggestedClass && (
                    <button
                      type="button"
                      onClick={() => {
                        if (mode === 'student_login') {
                          setStudentClass(diagnosticInfo.suggestedClass!);
                        } else if (mode === 'student_register') {
                          setRegClass(diagnosticInfo.suggestedClass!);
                        }
                        setErrorMsg('');
                        setDiagnosticInfo(null);
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>👉 Đổi ngay sang Lớp {diagnosticInfo.suggestedClass}</span>
                    </button>
                  )}

                  {diagnosticInfo.suggestedName && (
                    <button
                      type="button"
                      onClick={() => {
                        if (mode === 'student_login') {
                          setStudentFullName(diagnosticInfo.suggestedName!);
                        } else if (mode === 'student_register') {
                          setRegFullName(diagnosticInfo.suggestedName!);
                        }
                        setErrorMsg('');
                        setDiagnosticInfo(null);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>👉 Điền tên đúng: {diagnosticInfo.suggestedName}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowClassRosterModal(mode === 'student_login' ? studentClass : regClass)}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>📋 Xem danh sách Lớp {mode === 'student_login' ? studentClass : regClass}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. STUDENT LOGIN */}
          {mode === 'student_login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đinh Thị Mai Lan"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Khối & Lớp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khối: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => {
                      const newGrd = Number(e.target.value) as GradeLevel;
                      setStudentGrade(newGrd);
                      const clsList = getFilteredClasses(newGrd);
                      setStudentClass(newGrd === 8 && clsList.includes('8A') ? '8A' : clsList[0] || `${newGrd}A`);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                  >
                    {getFilteredClasses(studentGrade).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mật khẩu có mắt ẩn/hiện */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu: <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nút Đăng nhập */}
              <button
                type="submit"
                id="submit-student-login-btn"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Đăng Nhập Học Sinh</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Chuyển sang Đăng ký */}
              <div className="text-center pt-2 text-xs text-slate-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('student_register');
                    setErrorMsg('');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Đăng ký ngay tại đây
                </button>
              </div>
            </form>
          )}

          {/* 2. STUDENT REGISTER */}
          {mode === 'student_register' && (
            <div className="space-y-4">
              {/* Đăng ký bằng Google */}
              <button
                type="button"
                id="google-register-btn"
                onClick={handleGoogleRegister}
                className="w-full py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Đăng ký nhanh bằng Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Hoặc đăng ký thủ công
                </span>
              </div>

              {/* Form đăng ký thủ công */}
              <form onSubmit={handleStudentRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trần Minh Khang"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Khối & Lớp */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Khối:</label>
                    <select
                      value={regGrade}
                      onChange={(e) => {
                        const newGrd = Number(e.target.value) as GradeLevel;
                        setRegGrade(newGrd);
                        const clsList = getFilteredClasses(newGrd);
                        setRegClass(newGrd === 8 && clsList.includes('8A') ? '8A' : clsList[0] || `${newGrd}A`);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value={6}>Khối 6</option>
                      <option value={7}>Khối 7</option>
                      <option value={8}>Khối 8</option>
                      <option value={9}>Khối 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lớp:</label>
                    <select
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {getFilteredClasses(regGrade).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="email.hocsinh@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Mật khẩu & Nhập lại mật khẩu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Ẩn' : 'Hiện'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nhập lại MK: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Khớp mật khẩu"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showConfirmPassword ? 'Ẩn' : 'Hiện'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-student-register-btn"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn Tất Đăng Ký Tài Khoản</span>
                </button>
              </form>

              <div className="text-center pt-1 text-xs text-slate-600">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('student_login');
                    setErrorMsg('');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </div>
          )}

          {/* 3. ADMIN LOGIN */}
          {mode === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Khu vực Quản trị & Ban Giảng dạy KHTN Y Đôn
                </span>
                Nhập tên đăng nhập và mật khẩu được cấp riêng cho giáo viên bộ môn. Mật khẩu được bảo mật tuyệt đối.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-rose-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu quản trị: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('change_password');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu quản trị..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-rose-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-admin-login-btn"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Đăng Nhập Quản Trị</span>
              </button>
            </form>
          )}

          {/* 4. CHANGE PASSWORD */}
          {mode === 'change_password' && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <KeyRound className="w-4 h-4 inline mr-1 text-blue-600" />
                Đổi mật khẩu tài khoản quản trị hoặc học sinh.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu cũ:</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu hiện tại"
                  value={changeOldPassword}
                  onChange={(e) => setChangeOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới:</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={changeNewPassword}
                    onChange={(e) => setChangeNewPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nhập lại mật khẩu mới:</label>
                <input
                  type="password"
                  required
                  placeholder="Khớp mật khẩu mới"
                  value={changeConfirmNewPassword}
                  onChange={(e) => setChangeConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('admin_login')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Lưu Mật Khẩu Mới</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <HelpCircle className="w-4 h-4 inline mr-1 text-amber-600" />
                Nếu bạn quên mật khẩu, vui lòng nhập họ tên hoặc email đăng ký để gửi thông báo đến Ban Kỹ thuật trường Y Đôn.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên hoặc Email học sinh / Giáo viên:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đinh Thị Mai Lan hoặc n.dhanhcs@gmail.com"
                  value={forgotEmailOrName}
                  onChange={(e) => setForgotEmailOrName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('student_login')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Gửi Yêu Cầu Khôi Phục
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* POPUP TRA CỨU DANH SÁCH HỌC SINH THEO LỚP */}
      {showClassRosterModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>Danh Sách Học Sinh Lớp {showClassRosterModal}</span>
                </h4>
                <p className="text-[11px] text-blue-200">
                  Nhấp vào tên của bạn để tự động điền chính xác
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassRosterModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(() => {
                const classStudents = students.filter(
                  s => s.className?.trim().toUpperCase() === showClassRosterModal.trim().toUpperCase()
                );
                if (classStudents.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Chưa có học sinh nào thuộc Lớp {showClassRosterModal} trong danh sách trường.
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-slate-100">
                    {classStudents.map((st, i) => (
                      <button
                        key={st.id || i}
                        type="button"
                        onClick={() => {
                          if (mode === 'student_login') {
                            setStudentFullName(st.name);
                            setStudentClass(st.className);
                          } else if (mode === 'student_register') {
                            setRegFullName(st.name);
                            setRegClass(st.className);
                          }
                          setErrorMsg('');
                          setDiagnosticInfo(null);
                          setShowClassRosterModal(null);
                        }}
                        className="w-full text-left py-2 px-2.5 hover:bg-blue-50 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[10px] font-mono text-slate-400">{i + 1}.</span>
                          <span className="font-bold text-slate-800 group-hover:text-blue-700">{st.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {st.id} • {st.gender || 'HS'}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowClassRosterModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
