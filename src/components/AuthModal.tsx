import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  LogIn,
  UserPlus,
  ShieldAlert,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  GraduationCap,
} from 'lucide-react';
import { HoaHocNdhLogo } from './HoaHocNdhLogo';
import { syncStudentRosterFromServer, normalizeClassName } from '../utils/studentRoster';

const COMMON_CLASSES = [
  'H6.1',
  'H7.1',
  'H7.2',
  'H8.1',
  'H8.2',
  'H9.1',
  'H9.2',
  'Bồi dưỡng HSG cấp tỉnh, thành phố',
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, settings, setActivePage } = useApp();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAdminMaster,
    resetAdminMasterPassword,
    resetPassword,
    syncRegisteredAccounts,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'admin' | 'forgot'>('login');

  // Login & Register fields (always cleared on open/close for student privacy)
  const [loginFullName, setLoginFullName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerFullName, setRegisterFullName] = useState('');
  const [registerClass, setRegisterClass] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [forgotIdentifier, setForgotIdentifier] = useState('');

  // Admin fields
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [isResettingAdmin, setIsResettingAdmin] = useState(false);
  const [resetMasterPass, setResetMasterPass] = useState('');

  // Show/hide password toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showResetAdminPassword, setShowResetAdminPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const clearAllSensitiveFields = () => {
    setLoginFullName('');
    setLoginPassword('');
    setRegisterFullName('');
    setRegisterClass('');
    setRegisterPassword('');
    setForgotIdentifier('');
    setAdminPassword('');
    setResetMasterPass('');
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowAdminPassword(false);
    setShowResetAdminPassword(false);
  };

  // Every time the modal opens or closes:
  // 1. Clear all student name/password inputs so no previous student's name is ever left behind
  // 2. Silently sync roster & accounts from Cloud Firestore in background so Netlify & AI Studio are 100% up to date
  useEffect(() => {
    clearAllSensitiveFields();
    setErrorMsg('');
    setSuccessMsg('');
    if (isAuthModalOpen) {
      syncStudentRosterFromServer().catch(() => {});
      syncRegisteredAccounts().catch(() => {});
    }
  }, [isAuthModalOpen, syncRegisteredAccounts]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    clearAllSensitiveFields();
    setErrorMsg('');
    setSuccessMsg('');
    setIsResettingAdmin(false);
    setIsAuthModalOpen(false);
  };

  const switchTab = (nextTab: 'login' | 'register' | 'admin' | 'forgot') => {
    clearAllSensitiveFields();
    setErrorMsg('');
    setSuccessMsg('');
    setIsResettingAdmin(false);
    setTab(nextTab);
  };

  const mapFirebaseError = (err: any): string => {
    const code = err?.code || '';
    const msg = err?.message || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Họ và tên hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    }
    if (code === 'auth/user-not-found') {
      return 'Tài khoản này chưa được đăng ký. Vui lòng bấm qua mục "Đăng ký".';
    }
    if (code === 'auth/too-many-requests') {
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Tên miền hiện tại chưa được thêm vào Authorized Domains của Google. Vui lòng dùng đăng nhập bằng Họ và tên + Mật khẩu bên trên.';
    }
    return msg || 'Đã xảy ra lỗi xác thực. Vui lòng thử lại.';
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      handleClose();
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = loginFullName.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanName) {
      setErrorMsg('Vui lòng nhập đầy đủ Họ và tên học sinh.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('Vui lòng nhập Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginWithEmail(cleanName, cleanPass);
      // Clear inputs immediately so no student name remains in the dialog
      clearAllSensitiveFields();

      const classLabel = profile.enrolledClass ? ` — Lớp ${profile.enrolledClass}` : '';
      setSuccessMsg(`Đăng nhập thành công: ${profile.fullName}${classLabel}`);
      setTimeout(() => {
        handleClose();
      }, 350);
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = registerFullName.trim();
    const cleanClass = registerClass.trim();
    const cleanPass = registerPassword.trim();

    if (!cleanName) {
      setErrorMsg('Bắt buộc nhập đầy đủ "Họ và tên" học sinh.');
      return;
    }
    if (!cleanClass) {
      setErrorMsg('Bắt buộc nhập hoặc chọn "Lớp" đang theo học.');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setErrorMsg('Bắt buộc nhập "Mật khẩu" (tối thiểu 4 ký tự).');
      return;
    }

    setLoading(true);
    try {
      const normalizedCls = normalizeClassName(cleanClass, cleanClass);
      const result = await registerWithEmail(
        '',
        cleanPass,
        cleanName,
        'student',
        normalizedCls
      );

      // Clear inputs immediately after registration for security
      clearAllSensitiveFields();

      const displayCls = result.enrolledClass || normalizedCls;
      if (result.isOfficial) {
        setSuccessMsg(
          `Đăng ký & đồng bộ thành công! Học sinh: ${result.profile.fullName} — Lớp ${displayCls}. Đang vào lớp...`
        );
      } else {
        setSuccessMsg(
          `Đã tạo tài khoản cho ${result.profile.fullName} (Lớp ${displayCls}). Đang vào ứng dụng...`
        );
      }
      setTimeout(() => {
        handleClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!adminPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu Quản trị viên.');
      return;
    }
    setLoading(true);
    try {
      await loginAdminMaster(adminPassword, adminUsername);
      clearAllSensitiveFields();
      setSuccessMsg('Đăng nhập Quản trị viên (QTV-Nguyễn Đình Hành) thành công!');
      setTimeout(() => {
        handleClose();
        setActivePage('admin-dashboard');
      }, 350);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Tên đăng nhập hoặc mật khẩu quản trị không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!resetMasterPass || resetMasterPass.trim().length < 4) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }
    setLoading(true);
    try {
      await resetAdminMasterPassword(resetMasterPass);
      setIsResettingAdmin(false);
      clearAllSensitiveFields();
      setSuccessMsg('Đã đặt lại mật khẩu Quản trị viên và đăng nhập thành công!');
      setTimeout(() => {
        handleClose();
        setActivePage('admin-dashboard');
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể đặt lại mật khẩu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotIdentifier.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên học sinh cần hỗ trợ mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotIdentifier.trim());
      clearAllSensitiveFields();
      setSuccessMsg(
        'Đã đặt lại mật khẩu mặc định là 123456. Em có thể quay lại mục Đăng nhập ngay!'
      );
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <HoaHocNdhLogo logoUrl={settings.logoUrl} sizePx={40} shape={settings.logoShape} />
            <div>
              <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-cyan-300">
                Cổng Học Tập Hóa Học NĐH
              </h2>
              <p className="text-[11px] text-slate-300">
                Bảo mật thông tin học sinh • Đồng bộ thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Clear Navigation Tabs: Đăng nhập | Đăng ký | Quản trị */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-3 bg-slate-100 p-1.5 gap-1 border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('admin')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'admin'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* Status Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* MỤC 1: ĐĂNG NHẬP (Chỉ cần "Họ và tên" và "Mật khẩu", bảo mật tuyệt đối, không lưu tên cũ, không hiện danh sách HS) */}
          {tab === 'login' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-slate-800">
                  Đăng nhập tài khoản học sinh
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập chính xác <strong>Họ và tên</strong> và <strong>Mật khẩu</strong> để vào lớp học với đầy đủ họ tên và lớp của em.
                </p>
              </div>

              <form onSubmit={handleStudentLogin} autoComplete="off" className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="ndh_student_login_fullname"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={loginFullName}
                    onChange={(e) => setLoginFullName(e.target.value)}
                    placeholder="Nhập đầy đủ Họ và tên học sinh..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchTab('forgot')}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      name="ndh_student_login_password"
                      autoComplete="new-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Chế độ bảo mật: Không lưu lại tên học sinh trên hộp thoại sau khi đăng nhập.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Đang xác thực & vào lớp...' : 'Đăng nhập'}</span>
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Chưa đăng ký mật khẩu?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Bấm vào đây để Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* MỤC 2: ĐĂNG KÝ (Bắt buộc 3 trường: "Họ và tên", "Lớp", "Mật khẩu" — Không hiện danh sách học sinh) */}
          {tab === 'register' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-slate-800">
                  Đăng ký tài khoản học sinh
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điền đầy đủ <strong>Họ và tên</strong>, <strong>Lớp</strong> và{' '}
                  <strong>Mật khẩu</strong> để kích hoạt tài khoản học tập.
                </p>
              </div>

              <form onSubmit={handleRegister} autoComplete="off" className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="ndh_student_register_fullname"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    placeholder="Nhập đầy đủ Họ và tên học sinh..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="ndh_student_register_class"
                      autoComplete="off"
                      value={registerClass}
                      onChange={(e) => setRegisterClass(e.target.value)}
                      placeholder="Nhập hoặc chọn lớp (VD: H7.1, H8.1, H9.1...)"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {COMMON_CLASSES.map((cls) => {
                      const isSelected =
                        registerClass.trim().toLowerCase() === cls.toLowerCase();
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setRegisterClass(cls)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {cls.startsWith('Bồi dưỡng') ? 'Bồi dưỡng HSG' : cls}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Tối thiểu 4 ký tự</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      name="ndh_student_register_password"
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Nhập mật khẩu tự chọn..."
                      className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow transition mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {loading ? 'Đang đăng ký & đồng bộ...' : 'Hoàn tất Đăng ký & Đăng nhập'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* MỤC 3: QUẢN TRỊ */}
          {tab === 'admin' && (
            <div className="bg-red-50/60 p-4 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-extrabold text-sm">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Khu vực Quản trị viên (Thầy Nguyễn Đình Hành)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Tài khoản toàn quyền quản lý hệ thống: danh sách học sinh, bài tập, học phí, thời khóa biểu và xuất bản ứng dụng.
              </p>

              {isResettingAdmin ? (
                <form onSubmit={handleResetMasterPassword} className="space-y-3">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-2">
                    Đặt lại mật khẩu cho tài khoản Quản trị viên <strong>admin</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu mới mong muốn
                    </label>
                    <div className="relative">
                      <input
                        type={showResetAdminPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        value={resetMasterPass}
                        onChange={(e) => setResetMasterPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetAdminPassword(!showResetAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showResetAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResettingAdmin(false)}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer"
                    >
                      {loading ? 'Đang lưu...' : 'Xác nhận đặt lại'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 font-mono font-bold"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Tên hiển thị:{' '}
                        <strong className="text-red-700">QTV-Nguyễn Đình Hành</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminUsername('admin')}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        (Mặc định: admin)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu quản trị
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm shadow transition mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {loading ? 'Đang xác thực bảo mật...' : 'Đăng nhập Quản trị viên'}
                    </span>
                  </button>

                  <div className="pt-2 border-t border-red-200 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResettingAdmin(true);
                        setErrorMsg('');
                      }}
                      className="text-red-700 hover:underline font-medium cursor-pointer"
                    >
                      Quên / Thiết lập lại mật khẩu QTV?
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Google Admin
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MỤC PHỤ: QUÊN MẬT KHẨU */}
          {tab === 'forgot' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="Quay lại đăng nhập"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-extrabold text-slate-800">Khôi phục mật khẩu</h3>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Nhập chính xác Họ và tên học sinh đã đăng ký để khôi phục mật khẩu.
              </p>

              <form onSubmit={handleForgotPass} autoComplete="off" className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Nhập đầy đủ Họ và tên học sinh..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer"
                  >
                    {loading ? 'Đang xử lý...' : 'Khôi phục mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
