import { MapPin, UserCheck, Users, School, Sparkles, BookOpen } from 'lucide-react';
import { SystemConfig } from '../types';

interface FooterProps {
  systemConfig: SystemConfig;
}

export function Footer({ systemConfig }: FooterProps) {
  return (
    <footer id="main-footer" className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: School & App */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <School className="w-6 h-6 text-blue-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {systemConfig.schoolName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cổng thông tin học tập, kiểm tra đánh giá định kỳ và thường xuyên môn Khoa học Tự nhiên. 
              Áp dụng công nghệ chuyển đổi số trong giáo dục phổ thông.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Năm học {systemConfig.schoolYear}
              </span>
            </div>
          </div>

          {/* Column 2: Department & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Tổ Chuyên Môn & Địa Chỉ
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-300">
              <li className="flex items-baseline gap-1">
                <span className="text-slate-400 font-medium shrink-0">Tổ CM:</span>
                <strong className="text-amber-300 font-semibold">
                  {systemConfig.department.replace(/^Tổ\s*(CM:?\s*)?/i, '').trim()}
                </strong>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{systemConfig.address}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Quản Trị & Kỹ Thuật
            </h4>
            <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/60 space-y-1">
              <div className="text-[11px] text-slate-400">Giáo viên phụ trách kỹ thuật:</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {systemConfig.leadTeacher}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Phụ trách triển khai kho đề kiểm tra ma trận 18 câu & hệ thống số hóa bài giảng.
              </div>
            </div>
          </div>

          {/* Column 4: Teaching Faculty */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Nhóm Giáo Viên Giảng Dạy
            </h4>
            <ul className="grid grid-cols-1 gap-1.5 text-xs">
              {systemConfig.teachingTeam.map((teacher, idx) => (
                <li 
                  key={idx} 
                  className="flex items-center gap-2 bg-slate-800/40 px-2.5 py-1 rounded border border-slate-800 text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="font-medium">{teacher}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © 2026 {systemConfig.schoolName} — {systemConfig.appName}. Mọi quyền được bảo lưu.
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Hệ thống chuẩn ma trận 18 câu (16 TN + 1 Đ/S + 1 TLN)
          </div>
        </div>
      </div>
    </footer>
  );
}
