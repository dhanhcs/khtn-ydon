import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  MousePointerClick,
  UserPlus,
  Bot,
  GraduationCap,
  Sparkles,
  Award,
  ChevronRight,
  ShieldAlert,
  QrCode,
  TrendingUp,
  CheckCircle2,
  BookOpenCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActivePage } = useApp();
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-yellow-300 text-xs font-bold mb-3 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Năm học 2025 - 2026 | Khối 6, 7, 8, 9 & Bồi Dưỡng HSG Cấp Tỉnh, Thành Phố
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Chào mừng bạn đến với CHINH PHỤC MÔN HÓA THCS- NĐH
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed mb-4">
            Hệ thống đào tạo và khảo thí chuyên biệt môn Hóa học THCS do{' '}
            <strong>Thầy Nguyễn Đình Hành</strong> trực tiếp giảng dạy. Nâng cao tư duy thực nghiệm, phương pháp giải nhanh và ôn luyện đội tuyển Bồi dưỡng học sinh giỏi cấp tỉnh, thành phố.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActivePage('interactive-quiz')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <MousePointerClick className="w-4 h-4 text-slate-900" />
              Làm bài tập tương tác
            </button>
            <button
              onClick={() => setActivePage('tuition')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Đóng học phí Online (Mã QR)
            </button>
            <button
              onClick={() => setActivePage('ai-assistant')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs border border-white/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-200" />
              Hỏi Trợ lý AI Hóa học
            </button>
            <button
              onClick={() => setActivePage('registration')}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-xs sm:text-sm shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Đăng ký nhập học
            </button>
          </div>
        </div>

        {/* Decorative background chemical molecule hint */}
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none text-white font-mono text-9xl font-black">
          H₂SO₄
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shrink-0">
            6-9
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Chương trình đào tạo</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800">
              Khối 6-9 & HSG Tỉnh, TP
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
            20+
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đề tương tác & thi thử</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800">
              Chấm điểm tự động
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
            QR
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đóng học phí Online</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800">
              Cập nhật tự động
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
            AI
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Trợ lý Gemini NĐH</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800">Hỗ trợ 24/7</div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap & Online Tuition Quick Access Block (Without listing individual classes to students) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
              Chương Trình Học Tập & Tiện Ích Trực Tuyến Hóa Học NĐH
            </h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setActivePage('classes')}
              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Quản trị viên: Úp danh sách & Chọn lớp theo dõi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActivePage('materials')}
            className="p-4 rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50/70 hover:bg-cyan-50/30 transition cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-sm">
              <BookOpenCheck className="w-4 h-4 shrink-0" />
              <span>KHTN 6, 7 & Hóa Học 8, 9</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xây dựng nền tảng vững chắc theo chương trình GDPT mới, nắm vững bản chất phản ứng hóa học và kỹ năng giải toán theo từng chuyên đề.
            </p>
          </div>

          <div
            onClick={() => setActivePage('mock-exams')}
            className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/30 transition cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Bồi Dưỡng HSG Cấp Tỉnh, Thành Phố</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Huấn luyện chuyên sâu đội tuyển học sinh giỏi Hóa học cấp tỉnh, thành phố và ôn thi vào lớp 10 Chuyên Hóa với hệ thống chuyên đề nâng cao.
            </p>
          </div>

          <div
            onClick={() => setActivePage('tuition')}
            className="p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50 transition cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <QrCode className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Đóng Học Phí Online Qua Mã QR</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Phụ huynh và học sinh quét mã QR ngân hàng, điền thông tin học sinh để hệ thống tự động cập nhật trạng thái đã đóng học phí vào danh sách lớp.
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Profile & Reference Books by Teacher Nguyen Dinh Hanh */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-md p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shrink-0 border-2 border-cyan-400">
            NĐH
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/60 text-cyan-300 text-xs font-bold border border-cyan-700">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Thầy Nguyễn Đình Hành - Giáo viên Chuyên môn Hóa học THCS
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Tác giả của nhiều bộ sách tham khảo Hóa học THCS & Bồi dưỡng HSG cấp tỉnh, thành phố
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Với nhiều năm kinh nghiệm bồi dưỡng học sinh giỏi và luyện thi vào các trường THPT Chuyên, Thầy Nguyễn Đình Hành đã biên soạn nhiều đầu sách chuyên đề bám sát chương trình Giáo dục Phổ thông mới, giúp học sinh phát triển năng lực tư duy hóa học thực nghiệm và đạt thành tích cao trong các kỳ thi học sinh giỏi cấp tỉnh, thành phố và Chuyên Hóa.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-xs bg-slate-800 text-amber-300 px-3 py-1 rounded-full border border-slate-700">
                ★ Chuyên đề Bồi dưỡng HSG cấp tỉnh, thành phố
              </span>
              <span className="text-xs bg-slate-800 text-cyan-300 px-3 py-1 rounded-full border border-slate-700">
                ★ Phương pháp giải nhanh bài toán Hóa học
              </span>
              <span className="text-xs bg-slate-800 text-teal-300 px-3 py-1 rounded-full border border-slate-700">
                ★ 100 Đề thi chọn HSG Hóa học cấp tỉnh, thành phố có lời giải
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
