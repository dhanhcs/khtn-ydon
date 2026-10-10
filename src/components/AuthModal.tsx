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
import { checkStudentInSchoolRoster } from '../utils/excelUtils';

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
  const [studentClass, setStudentClass] = useState('8A1');
  const [studentPassword, setStudentPassword] = useState('');

  // Student Register Fields
  const [regFullName, setRegFullName] = useState('');
  const [regGrade, setRegGrade] = useState<GradeLevel>(8);
  const [regClass, setRegClass] = useState('8A1');
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

  // Dynamic filter of classes by selected grade
  const getFilteredClasses = (grd: number) => {
    return schoolClasses.filter(c => c.startsWith(`${grd}A`));
  };

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!studentFullName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ họ và tên học sinh.');
      return;
    }
    if (!studentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu đăng nhập.');
      return;
    }

    // Check against school roster
    const rosterCheck = checkStudentInSchoolRoster(studentFullName, studentClass, students);
    const isEnrolled = rosterCheck.isEnrolled;

    const session: UserSession = {
      id: `std-${Date.now()}`,
      role: isEnrolled ? 'student' : 'guest',
      name: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.name : studentFullName.trim(),
      grade: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.grade : studentGrade,
      className: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.className : studentClass
    };

    if (isEnrolled) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng học sinh ${session.name} (Lớp ${session.className}).`);
    } else {
      setSuccessMsg(`Chào mừng ${session.name}! Bạn được xác nhận là Khách (chỉ xem, do chưa thuộc danh sách HS trường THCS Y Đôn).`);
    }

    setTimeout(() => {
      onLoginSuccess(session);
      onClose();
    }, 700);
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
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

    // Check against school roster
    const rosterCheck = checkStudentInSchoolRoster(regFullName, regClass, students);
    const isEnrolled = rosterCheck.isEnrolled;

    const session: UserSession = {
      id: `std-${Date.now()}`,
      role: isEnrolled ? 'student' : 'guest',
      name: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.name : regFullName.trim(),
      email: regEmail.trim(),
      grade: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.grade : regGrade,
      className: rosterCheck.matchedStudent ? rosterCheck.matchedStudent.className : regClass
    };

    if (isEnrolled) {
      setSuccessMsg(`Đăng ký tài khoản thành công! Chào mừng học sinh chính thức ${session.name} (Lớp ${session.className}).`);
    } else {
      setSuccessMsg(`Đăng ký thành công với tư cách Khách (${session.name})! Bạn có thể xem đề và tài liệu.`);
    }

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

    // Verify against strictly predefined admin credentials
    const matchedAccount = adminAccounts.find(
      acc => acc.username.toLowerCase() === adminUsername.trim().toLowerCase() && 
             acc.passwordHash === adminPassword.trim()
    );

    if (matchedAccount) {
      let subject: 'physics' | 'chemistry' | 'biology' | 'all' = 'physics';
      if (matchedAccount.teacherName.includes('Lệ')) subject = 'chemistry';
      else if (matchedAccount.teacherName.includes('Sang')) subject = 'biology';
      else if (matchedAccount.teacherName.includes('Hành')) subject = 'physics';
      else if (matchedAccount.teacherName.includes('Tiến')) subject = 'physics';

      const session: UserSession = {
        id: `admin-${Date.now()}`,
        role: 'admin',
        name: `Quản trị viên (${matchedAccount.teacherName})`,
        adminName: matchedAccount.teacherName,
        adminSubject: subject
      };

      setSuccessMsg(`Xác thực thành công! Kính chào Thầy/Cô ${matchedAccount.teacherName} (Quản trị phân môn ${subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}).`);
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

    setSuccessMsg('Yêu cầu đã được gửi đến Ban Quản trị Kỹ thuật (Thầy Nguyễn Đình Hành). Thầy/Cô sẽ hỗ trợ cấp lại mật khẩu cho bạn qua liên hệ trực tiếp hoặc email.');
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
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
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
                      setStudentClass(`${newGrd}A1`);
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
                        setRegClass(`${newGrd}A1`);
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
    </div>
  );
}
