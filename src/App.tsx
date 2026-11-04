import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp, ActivePage } from './context/AppContext';
import { Banner } from './components/Banner';
import { TickerBar } from './components/TickerBar';
import { TopNav } from './components/TopNav';
import { SidebarMenu } from './components/SidebarMenu';
import { AuthModal } from './components/AuthModal';
import { PwaModal } from './components/PwaModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

// Pages
import { HomePage } from './components/pages/HomePage';
import { HomeworkPage } from './components/pages/HomeworkPage';
import { InteractiveQuizPage } from './components/pages/InteractiveQuizPage';
import { MockExamsPage } from './components/pages/MockExamsPage';
import { MaterialsPage } from './components/pages/MaterialsPage';
import { ExperimentsPage } from './components/pages/ExperimentsPage';
import { TuitionPage } from './components/pages/TuitionPage';
import { OnlineClassesPage } from './components/pages/OnlineClassesPage';
import { RegistrationPage } from './components/pages/RegistrationPage';
import { AiAssistantPage } from './components/pages/AiAssistantPage';
import { LeaveRequestsPage } from './components/pages/LeaveRequestsPage';
import { ExamResultsPage } from './components/pages/ExamResultsPage';
import { ClassManagementPage } from './components/pages/ClassManagementPage';
import { SchedulePage } from './components/pages/SchedulePage';
import { AnnouncementsPage } from './components/pages/AnnouncementsPage';
import { OmrScannerPage } from './components/pages/OmrScannerPage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { StudentManagementPage } from './components/pages/StudentManagementPage';
import { ExportAndSyncAppPage } from './components/pages/ExportAndSyncAppPage';
import { YoutubeChannelPage } from './components/pages/YoutubeChannelPage';

import { MapPin, Phone, Mail, Award, BookOpen, CheckCircle, AlertCircle, Info, Heart } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, toasts, removeToast } = useApp();
  const { isAdmin } = useAuth();

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'homework':
        return <HomeworkPage />;
      case 'interactive-quiz':
        return <InteractiveQuizPage />;
      case 'mock-exams':
        return <MockExamsPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'experiments':
        return <ExperimentsPage />;
      case 'tuition':
        return <TuitionPage />;
      case 'online-classes':
        return <OnlineClassesPage />;
      case 'registration':
        return <RegistrationPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'leave-requests':
        return <LeaveRequestsPage />;
      case 'exam-results':
        return <ExamResultsPage />;
      case 'classes':
        return <ClassManagementPage />;
      case 'schedules':
        return <SchedulePage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'omr-scanner':
        return <OmrScannerPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'students-roster':
        return <StudentManagementPage />;
      case 'export-sync-app':
        return <ExportAndSyncAppPage />;
      case 'youtube-channel':
        return <YoutubeChannelPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF2EE] flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-500 selection:text-white">
      {/* 1. Top Banner */}
      <Banner />

      {/* 2. Running Marquee Announcement Bar */}
      <TickerBar />

      {/* 3. Horizontal Navigation Menu */}
      <TopNav />

      {/* 4. Main Body: 2-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column (1/4 width on desktop): MÊ NU CHÍNH */}
          <div className="lg:col-span-1 lg:sticky lg:top-20 z-20">
            <SidebarMenu />
          </div>

          {/* Right Column (3/4 width on desktop): Main Page Content */}
          <div className="lg:col-span-3 min-w-0">
            {renderActivePage()}
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                CHINH PHỤC MÔN HÓA THCS- NĐH
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Hệ thống giáo dục trực tuyến chất lượng cao môn Hóa học cấp THCS (Lớp 6, 7, 8, 9 và Bồi dưỡng học sinh giỏi cấp tỉnh, thành phố) do Thầy Nguyễn Đình Hành trực tiếp phụ trách chuyên môn.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                Thông Tin Giảng Dạy & Liên Hệ
              </h4>
              <div className="space-y-1.5 text-xs text-slate-400">
                <p><strong>Giáo viên:</strong> Thầy Nguyễn Đình Hành</p>
                <p><strong>Địa chỉ:</strong> 806/4/2 Quang Trung, Phường An Bình, tỉnh Gia Lai</p>
                <p><strong>Điện thoại:</strong> 0988 275 288</p>
                <p><strong>Email:</strong> n.dhanhcs2006@gmail.com</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                Cam Kết Chất Lượng
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                “Trách nhiệm - Uy tín - Chất lượng”<br />
                Đồng hành cùng học sinh vượt qua nỗi sợ môn Hóa học, khơi dậy niềm đam mê khoa học thực nghiệm và chinh phục các kỳ thi học sinh giỏi cấp tỉnh, thành phố.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              © {new Date().getFullYear()} CHINH PHỤC MÔN HÓA THCS- NĐH. Bản quyền thuộc về Thầy Nguyễn Đình Hành.
            </span>
            <span className="flex items-center gap-1">
              Phát triển với sự tận tâm <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> vì thế hệ trẻ yêu Hóa học.
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal />
      <ChangePasswordModal />
      <PwaModal />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-start gap-2.5 cursor-pointer animate-in slide-in-from-bottom-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500 backdrop-blur-md'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-red-100 border-red-500 backdrop-blur-md'
                : 'bg-slate-900/95 text-cyan-100 border-cyan-500 backdrop-blur-md'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
