import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Image,
  Users,
  GraduationCap,
  CreditCard,
  Calendar,
  Bell,
  FileText,
  BookOpenCheck,
  Film,
  Trophy,
  CalendarOff,
  UserPlus,
  ScanLine,
  Settings,
  Sparkles,
  ArrowRight,
  KeyRound,
  Download,
  FileArchive,
  Rocket,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { setActivePage, showToast, setIsChangePasswordModalOpen, setIsPwaModalOpen, setPwaModalMode } = useApp();
  const [downloadingDeploy, setDownloadingDeploy] = useState(false);
  const [downloadingSource, setDownloadingSource] = useState(false);

  const handleDownloadZip = async (type: 'deploy' | 'source') => {
    try {
      if (type === 'deploy') setDownloadingDeploy(true);
      else setDownloadingSource(true);

      const endpoint = type === 'deploy' ? '/api/export/deploy-zip?rebuild=1' : '/api/export/source-zip';
      const filename =
        type === 'deploy'
          ? 'hoahoc-thcs-ndh-netlify-build-san.zip'
          : 'hoahoc-thcs-ndh-github-source.zip';

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Không thể tải gói tệp tin từ máy chủ.');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        type === 'deploy'
          ? 'Đã tải Gói Kéo-Thả Netlify (Đã Build sẵn)!'
          : 'Đã tải Gói Mã Nguồn GitHub (.ZIP)!',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải tệp ZIP.', 'error');
    } finally {
      if (type === 'deploy') setDownloadingDeploy(false);
      else setDownloadingSource(false);
    }
  };

  const adminModules = [
    { id: 1, title: '1. Quản lý banner và logo', desc: 'Đổi tiêu đề, khẩu hiệu, logo, kích thước logo, màu sắc hoặc hình nền banner', icon: Image, page: 'home', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { id: 2, title: '2. Quản lý tài khoản & Mật khẩu', desc: 'Đổi mật khẩu QTV, phân quyền giáo viên và học sinh', icon: KeyRound, action: () => setIsChangePasswordModalOpen(true), color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 3, title: '3. Quản lý danh sách học sinh', desc: 'Thêm sửa xóa, nhập và xuất bảng tính Excel học sinh toàn hệ thống', icon: Users, page: 'students-roster', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 4, title: '4. Quản lý các lớp học', desc: 'Úp danh sách lớp, chọn lớp trong danh sách xổ xuống, xem lộ trình học tập & đóng học phí (H6.1→H9.3, Bồi dưỡng HSG cấp tỉnh, thành phố)', icon: GraduationCap, page: 'classes', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 5, title: '5. Quản lý & Đóng học phí Online', desc: 'Up Mã QR & Số TK ngân hàng, tự động cập nhật đã đóng học phí vào danh sách học sinh', icon: CreditCard, page: 'tuition', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 6, title: '6. Quản lý thời khóa biểu', desc: 'Tải lên ảnh, PDF thời khóa biểu từng kỳ và tuần học', icon: Calendar, page: 'schedules', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 7, title: '7. Quản lý thông báo', desc: 'Đăng tin tức, ghim thông báo quan trọng, kiểm duyệt bình luận', icon: Bell, page: 'announcements', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 8, title: '8. Quản lý bài tập & đề kiểm tra', desc: 'Soạn bài tập tương tác, tạo tự động bằng AI Gemini, ngân hàng đề', icon: FileText, page: 'interactive-quiz', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 9, title: '9. Quản lý tài liệu tham khảo', desc: 'Sách chuyên khảo của Thầy Nguyễn Đình Hành, đề thi HSG cấp tỉnh, thành phố', icon: BookOpenCheck, page: 'materials', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 10, title: '10. Quản lý video thí nghiệm', desc: 'Danh mục video thí nghiệm trực quan, phương trình phản ứng cân bằng', icon: Film, page: 'experiments', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 11, title: '11. Quản lý kết quả thi thử', desc: 'Bảng vàng vinh danh, điểm thi khảo sát và nhận xét học sinh', icon: Trophy, page: 'exam-results', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 12, title: '12. Quản lý yêu cầu xin phép', desc: 'Phê duyệt đơn xin phép nghỉ học và đăng ký học bù', icon: CalendarOff, page: 'leave-requests', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { id: 13, title: '13. Quản lý đăng ký trực tuyến', desc: 'Tiếp nhận học sinh mới đăng ký các khóa học Hóa học', icon: UserPlus, page: 'registration', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { id: 14, title: '14. Quản lý bài thi quét bằng camera', desc: 'Chấm phiếu trắc nghiệm 20 câu bằng Gemini Vision và camera', icon: ScanLine, page: 'omr-scanner', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
    { id: 15, title: '15. Xuất và đồng bộ app', desc: '3 cách xuất bản lên Netlify (Kéo-Thả gói Build sẵn 3s, Xuất bản tự động 1 chạm 5s, Kết nối GitHub kèm xuất file .APK) & tự động đồng bộ từ Google AI Studio', icon: Rocket, page: 'export-sync-app', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { id: 16, title: '16. Mã QR & Hướng dẫn Cài đặt App', desc: 'Lấy mã QR chia sẻ trang web và hướng dẫn học sinh cài đặt ứng dụng ra màn hình chính', icon: Settings, action: () => { setPwaModalMode('publish'); setIsPwaModalOpen(true); }, color: 'bg-slate-50 text-slate-700 border-slate-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 via-rose-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-red-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 text-yellow-300 text-xs font-bold border border-red-700 mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            Bảng Điều Khiển Quản Trị Hệ Thống NĐH
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Khu Vực Quản Trị Viên: Thầy Nguyễn Đình Hành
          </h2>
          <p className="text-xs text-rose-200 mt-1 max-w-xl">
            Toàn quyền quản trị nội dung, úp danh sách lớp, theo dõi lộ trình học tập, học phí online và xuất bản đồng bộ tự động lên Netlify / GitHub.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActivePage('export-sync-app')}
            className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer ring-2 ring-white/40"
          >
            <Rocket className="w-4 h-4" />
            <span>Xuất và đồng bộ app (3 Cách Netlify)</span>
          </button>
          <button
            onClick={() => handleDownloadZip('deploy')}
            disabled={downloadingDeploy}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingDeploy ? 'Đang đóng gói...' : '⬇ Gói Kéo-Thả Netlify (Build sẵn)'}</span>
          </button>
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs border border-white/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Đổi mật khẩu Quản trị</span>
          </button>
        </div>
      </div>

      {/* 15 Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (mod.action) {
                  mod.action();
                } else if (mod.page) {
                  setActivePage(mod.page as any);
                }
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-lg transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-slate-300 group-hover:text-red-600 transition">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-red-700 transition mb-1">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-cyan-700">
                <span>Mở quản trị</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
