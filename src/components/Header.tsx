import React, { useState } from 'react';
import { 
  Home, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Calendar, 
  ChevronDown, 
  User,
  Sparkles,
  RefreshCw,
  Smartphone,
  Laptop,
  Download,
  Bell,
  GitFork,
  Upload,
  Globe
} from 'lucide-react';
import { SystemConfig, UserSession } from '../types';
import { isTeacherAdmin } from '../utils/permissionUtils';
import { schoolYearOptions } from '../data/mockData';
import { YDonSchoolLogo } from './YDonSchoolLogo';

interface HeaderProps {
  systemConfig: SystemConfig;
  onUpdateSchoolYear: (year: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession | null;
  onOpenAuth: (mode: 'student_login' | 'student_register' | 'admin_login') => void;
  onLogout: () => void;
  onSyncNow?: () => void;
  syncStatus?: { isSyncing: boolean; message: string | null; studentCount?: number };
  onOpenInstallApp?: () => void;
  onOpenReminders?: () => void;
  unreadReminderCount?: number;
  onOpenSyncRestore?: () => void;
}

export function Header({
  systemConfig,
  onUpdateSchoolYear,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onSyncNow,
  syncStatus,
  onOpenInstallApp,
  onOpenReminders,
  unreadReminderCount = 0,
  onOpenSyncRestore
}: HeaderProps) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  return (
    <header 
      id="main-top-header" 
      className="sticky top-0 z-40 bg-gradient-to-r from-sky-800 via-blue-800 to-indigo-900 text-white shadow-md border-b border-sky-900/50"
    >
      {/* Top ribbon: School Motto & School Year selector */}
      <div className="bg-black/25 text-slate-100 text-xs py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* School & Department Identity */}
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs">
            <span className="font-bold tracking-wider uppercase text-amber-300">
              TRƯỜNG THCS VÀ THPT Y ĐÔN
            </span>
          </div>

          {/* School Year Dropdown Selector */}
          <div className="flex items-center gap-2 relative">
            <span className="text-sky-200 font-medium text-[11px]">Năm học:</span>
            
            <div className="relative">
              <button
                type="button"
                id="school-year-selector-btn"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs transition-colors border border-white/30 shadow-xs cursor-pointer"
                title="Bấm để chọn năm học"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-300">{systemConfig.schoolYear}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {yearDropdownOpen && (
                <div 
                  id="school-year-dropdown-menu"
                  className="absolute right-0 top-full mt-1.5 w-36 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    Chọn năm học:
                  </div>
                  {schoolYearOptions.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        onUpdateSchoolYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-sky-50 transition-colors flex items-center justify-between cursor-pointer ${
                        systemConfig.schoolYear === year 
                          ? 'text-blue-700 bg-blue-50 font-bold' 
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{year}</span>
                      {systemConfig.schoolYear === year && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-white/40 hidden sm:inline">•</span>
            
            {/* Multi-Device Cloud Sync Button */}
            <button
              type="button"
              onClick={onSyncNow}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                syncStatus?.isSyncing
                  ? 'bg-amber-400 text-slate-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 hover:text-white border-emerald-400/40'
              }`}
              title="Đồng bộ dữ liệu đa thiết bị: Máy tính ⇄ Điện thoại (iOS / Android / PC)"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus?.isSyncing ? 'animate-spin text-slate-900' : 'text-emerald-300'}`} />
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3 hidden md:inline" />
                <span className="hidden md:inline">⇄</span>
                <Smartphone className="w-3 h-3 hidden md:inline" />
                <span>{syncStatus?.isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Đa thiết bị'}</span>
              </span>
              {typeof syncStatus?.studentCount === 'number' && syncStatus.studentCount > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                  {syncStatus.studentCount} HS
                </span>
              )}
            </button>

            {/* Nút Up bảng điểm lên từ file Excel / JSON / Dán */}
            {onOpenSyncRestore && (
              <button
                type="button"
                onClick={onOpenSyncRestore}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all border border-amber-300 shadow-xs cursor-pointer"
                title="Tải lên bảng điểm từ file Excel, JSON hoặc dán trực tiếp để hệ thống cập nhật kết quả"
              >
                <Upload className="w-3.5 h-3.5 text-slate-950" />
                <span>Up bảng điểm</span>
              </button>
            )}

            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-slate-200 text-[11px] hidden sm:inline">
              Kỹ thuật: <strong className="text-white font-semibold">Thầy Nguyễn Đình Hành</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Main Header Bar with requested soothing blue color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: School Logo & Title */}
          <div 
            id="brand-logo-button"
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => setActiveTab('kttx')}
            title="Trang chủ Khoa học Tự nhiên Y Đôn"
          >
            {/* School official vector circular logo */}
            <div className="transition-transform group-hover:scale-105 duration-200">
              <YDonSchoolLogo size={52} className="ring-2 ring-white/40 shadow-lg" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest">
                  TỔ LÍ-HÓA-SINH-CN
                </span>
                <span className="text-[10px] bg-white/20 text-sky-100 font-semibold px-2 py-0.5 rounded-full">
                  Cấp THCS
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-sky-200 transition-colors">
                KHOA HỌC TỰ NHIÊN - Y ĐÔN
              </h1>
            </div>
          </div>

          {/* RIGHT: Buttons ordered from left to right as requested:
              1. Về trang chủ
              2. Quản trị
              3. Đăng ký
              4. Đăng nhập (thay bằng Đăng xuất sau khi đăng nhập)
          */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            
            {/* 1. Về trang chủ */}
            <button
              id="header-nav-home-btn"
              onClick={() => setActiveTab('kttx')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                activeTab === 'kttx'
                  ? 'bg-white text-blue-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
              }`}
              title="Quay về trang chủ"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span className="hidden xs:inline">Về trang chủ</span>
            </button>

            {/* Trợ lý AI Gemini */}
            <button
              id="header-nav-ai-btn"
              onClick={() => setActiveTab('ai_assistant')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                activeTab === 'ai_assistant'
                  ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white shadow-md ring-2 ring-fuchsia-300'
                  : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
              }`}
              title="Trợ lý AI Gemini: Chatbot & Biến văn bản thành ảnh"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
              <span>Trợ lý AI</span>
            </button>

            {/* Mindmap Sơ đồ tư duy */}
            <button
              id="header-nav-mindmap-btn"
              onClick={() => setActiveTab('mindmap')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                activeTab === 'mindmap'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md ring-2 ring-violet-300'
                  : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
              }`}
              title="Vẽ sơ đồ tư duy Mindmap KHTN theo yêu cầu"
            >
              <GitFork className="w-4 h-4 text-violet-300" />
              <span className="hidden sm:inline">Mindmap</span>
            </button>

            {/* Nhắc lịch kiểm tra */}
            {onOpenReminders && (
              <button
                id="header-nav-reminders-btn"
                onClick={onOpenReminders}
                className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-xs"
                title="Nhắc nhở lịch kiểm tra cho học sinh"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                <span className="hidden md:inline">Lịch thi</span>
                {unreadReminderCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-xs">
                    {unreadReminderCount}
                  </span>
                )}
              </button>
            )}

            {/* Nút Tải App xuống thiết bị */}
            {onOpenInstallApp && (
              <button
                id="header-nav-install-btn"
                onClick={onOpenInstallApp}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer"
                title="Tải ứng dụng KHTN Y Đôn xuống điện thoại / máy tính"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span className="hidden sm:inline">Tải App</span>
              </button>
            )}

            {/* 2. Quản trị - Chỉ vào tab nếu là Giáo viên quản trị */}
            <button
              id="header-nav-admin-btn"
              onClick={() => {
                if (isTeacherAdmin(currentUser)) {
                  setActiveTab('admin');
                } else {
                  onOpenAuth('admin_login');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300/60'
                  : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
              }`}
              title="Khu vực Quản trị Giáo viên (Dành riêng cho Giáo viên Quản trị)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Quản trị</span>
            </button>

            {/* 3. Đăng ký (chỉ hiện khi chưa đăng nhập) */}
            {!currentUser && (
              <button
                id="header-nav-register-btn"
                onClick={() => onOpenAuth('student_register')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
                title="Đăng ký tài khoản học sinh"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký</span>
              </button>
            )}

            {/* 4. Đăng nhập (khi chưa đăng nhập) hoặc User info + Đăng xuất (khi đã đăng nhập) */}
            {!currentUser ? (
              <button
                id="header-nav-login-btn"
                onClick={() => onOpenAuth('student_login')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all cursor-pointer"
                title="Đăng nhập tài khoản"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* User badge visible on mobile and laptop */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/25 rounded-xl border border-white/20 text-xs">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-black flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 ${
                    isTeacherAdmin(currentUser) 
                      ? 'bg-amber-400 text-slate-950 font-black' 
                      : (currentUser.name.includes('Phượng') || currentUser.adminName?.includes('Phượng'))
                      ? 'bg-purple-400 text-slate-950 font-black'
                      : currentUser.role === 'guest'
                      ? 'bg-slate-400 text-slate-950'
                      : 'bg-emerald-400 text-slate-950'
                  }`}>
                    {isTeacherAdmin(currentUser) 
                      ? 'QTV' 
                      : (currentUser.name.includes('Phượng') || currentUser.adminName?.includes('Phượng'))
                      ? 'TT'
                      : currentUser.role === 'guest' 
                      ? 'K' 
                      : 'HS'}
                  </div>
                  <div className="leading-tight text-left">
                    <span className="font-extrabold text-white block truncate max-w-[110px] sm:max-w-[160px] text-[11px] sm:text-xs">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-sky-200 block truncate">
                      {isTeacherAdmin(currentUser) 
                        ? 'Giáo viên Quản trị' 
                        : (currentUser.name.includes('Phượng') || currentUser.adminName?.includes('Phượng'))
                        ? 'Tổ trưởng KHTN'
                        : currentUser.role === 'guest'
                        ? 'Khách tham quan'
                        : `Lớp ${currentUser.className || 'KHTN'}`}
                    </span>
                  </div>
                </div>

                {/* Đăng xuất button */}
                <button
                  id="header-nav-logout-btn"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
