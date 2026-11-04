import React, { useState } from 'react';
import { useApp, ActivePage } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LogIn,
  LogOut,
  Download,
  ShieldAlert,
  CreditCard,
  Calendar,
  Bell,
  GraduationCap,
  ScanLine,
  Menu,
  X,
  User as UserIcon,
  Sparkles,
  KeyRound,
  Globe,
} from 'lucide-react';
import { HoaHocNdhLogo } from './HoaHocNdhLogo';

export const TopNav: React.FC = () => {
  const {
    settings,
    activePage,
    setActivePage,
    setIsPwaModalOpen,
    setPwaModalMode,
    setIsAuthModalOpen,
    setIsChangePasswordModalOpen,
  } = useApp();
  const { currentUser, userProfile, isAdmin, isOfficialStudent, isGuest, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tuition', label: 'Đóng & Theo dõi học phí', icon: CreditCard },
    { id: 'schedules', label: 'Thời khóa biểu', icon: Calendar },
    { id: 'announcements', label: 'Thông báo', icon: Bell },
    ...(isAdmin ? [{ id: 'classes', label: 'Quản lý lớp học', icon: GraduationCap }] : []),
    { id: 'omr-scanner', label: 'Chấm bài trắc nghiệm', icon: ScanLine },
  ];

  return (
    <nav className="bg-slate-900 text-slate-100 shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand mini icon on left for top nav */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition text-sm sm:text-base shrink-0 cursor-pointer"
          >
            <HoaHocNdhLogo logoUrl={settings.logoUrl} sizePx={34} shape={settings.logoShape} />
            <span className="hidden md:inline font-bold tracking-tight text-white">
              HÓA HỌC <span className="text-cyan-400">NĐH</span>
            </span>
          </button>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1 text-xs xl:text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as ActivePage)}
                  className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Dashboard & Xuất bản web (Only visible if Admin) */}
            {isAdmin && (
              <>
                <button
                  onClick={() => navigateTo('admin-dashboard')}
                  className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activePage === 'admin-dashboard'
                      ? 'bg-red-600 text-white font-bold shadow'
                      : 'bg-red-950/80 text-red-300 hover:bg-red-900 hover:text-white border border-red-700/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Quản trị</span>
                </button>

                <button
                  onClick={() => navigateTo('export-sync-app')}
                  className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 font-extrabold transition-colors border shadow-xs cursor-pointer ${
                    activePage === 'export-sync-app'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-amber-500/90 hover:bg-amber-400 text-slate-950 border-amber-300/60'
                  }`}
                  title="Dành riêng cho Quản trị viên: 3 cách xuất bản lên Netlify & Tự động đồng bộ App"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Xuất và đồng bộ app</span>
                </button>
              </>
            )}

            {/* Tải app (Visible to everyone) */}
            <button
              onClick={() => {
                setPwaModalMode('install');
                setIsPwaModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-teal-300 hover:text-white hover:bg-teal-950/60 border border-teal-800/50 transition-colors cursor-pointer"
              title="Tải và cài đặt App Hóa Học NĐH ra màn hình chính điện thoại, máy tính"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Tải app</span>
            </button>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            {currentUser || userProfile ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                <div
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-right cursor-pointer hover:opacity-90 transition"
                  title="Bấm để chuyển đổi hoặc đăng nhập tài khoản học sinh khác"
                >
                  <div className="text-white font-bold flex items-center justify-end gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="whitespace-nowrap">
                      {userProfile?.fullName || currentUser?.displayName || 'Thành viên'}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-mono font-bold">
                    {isAdmin ? (
                      <span className="text-red-400">Quản trị viên</span>
                    ) : userProfile?.role === 'teacher' ? (
                      <span className="text-purple-300">Giáo viên</span>
                    ) : isOfficialStudent ? (
                      <span className="text-emerald-400">
                        {userProfile?.enrolledClass
                          ? `Lớp ${userProfile.enrolledClass} • HS Chính thức`
                          : 'HS Chính thức'}
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {userProfile?.enrolledClass
                          ? `Lớp ${userProfile.enrolledClass} • Khách`
                          : 'Khách (Chỉ xem)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút Đăng nhập / Đổi tài khoản luôn hiển thị để chuyển nhanh */}
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2 py-1 rounded bg-cyan-700/80 hover:bg-cyan-600 text-white border border-cyan-500/50 flex items-center gap-1 transition text-[11px] font-semibold cursor-pointer"
                  title="Đăng nhập tài khoản học sinh đã đăng ký hoặc đổi tài khoản"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng nhập</span>
                </button>

                {/* Nút Đổi mật khẩu sau khi đăng nhập */}
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition text-[11px] cursor-pointer"
                  title="Đổi mật khẩu tài khoản"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Đổi MK</span>
                </button>

                {/* Nút Đăng xuất hiển thị rõ chữ "Đăng xuất" */}
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-800/70 flex items-center gap-1 transition text-[11px] font-semibold cursor-pointer"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button & logged-in student badge */}
          <div className="flex lg:hidden items-center gap-1.5">
            {currentUser || userProfile ? (
              <>
                <div
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-right pr-1 cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {userProfile?.fullName || currentUser?.displayName || 'Thành viên'}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 leading-tight">
                    {isAdmin
                      ? 'Quản trị viên'
                      : userProfile?.enrolledClass
                      ? `Lớp ${userProfile.enrolledClass}`
                      : isOfficialStudent
                      ? 'HS Chính thức'
                      : 'Khách'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2 py-1 text-xs rounded bg-red-950/90 hover:bg-red-600 text-red-200 hover:text-white border border-red-800/70 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Thoát</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 py-1 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as ActivePage)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <>
              <button
                onClick={() => navigateTo('admin-dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold bg-red-950/80 text-red-300 border border-red-800/60"
              >
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Quản trị hệ thống</span>
              </button>

              <button
                onClick={() => navigateTo('export-sync-app')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              >
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Xuất và đồng bộ app (3 cách Netlify)</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setPwaModalMode('install');
              setIsPwaModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-teal-300 hover:bg-teal-950/50"
          >
            <Download className="w-5 h-5 text-teal-400" />
            <span>Tải app (Cài đặt ra màn hình chính)</span>
          </button>

          {/* User profile on mobile */}
          <div className="pt-3 mt-2 border-t border-slate-800">
            {currentUser || userProfile ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <div className="text-sm font-bold text-white">
                    {userProfile?.fullName || currentUser?.displayName || 'Thành viên'}
                  </div>
                  <div className="text-xs font-semibold">
                    {isAdmin ? (
                      <span className="text-red-400">Quản trị viên NĐH</span>
                    ) : userProfile?.role === 'teacher' ? (
                      <span className="text-purple-300">Giáo viên</span>
                    ) : isOfficialStudent ? (
                      <span className="text-emerald-400">
                        Học sinh chính thức
                        {userProfile?.enrolledClass ? ` — Lớp ${userProfile.enrolledClass}` : ''}
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        Khách (Chỉ xem)
                        {userProfile?.enrolledClass ? ` — Lớp ${userProfile.enrolledClass}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsChangePasswordModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded bg-slate-800 text-blue-300 text-xs font-semibold flex items-center gap-1 hover:bg-slate-700 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-800 text-red-400 text-xs font-semibold flex items-center gap-1 hover:bg-slate-700 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-cyan-600 text-white font-bold text-sm shadow"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
