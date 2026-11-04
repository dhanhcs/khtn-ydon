import React from 'react';
import { Video, Calendar, Clock, ExternalLink, ShieldCheck, UserCheck, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OnlineClassesPage: React.FC = () => {
  const { classes } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
          <Video className="w-3.5 h-3.5" />
          Mục số 7 trong Mê nu chính: Học trực tuyến
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
          Phòng Học Trực Tuyến & Bài Giảng Trực Tiếp NĐH
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Kết nối trực tiếp với lớp học trực tuyến qua Google Meet và Zoom cùng Thầy Nguyễn Đình Hành.
        </p>
      </div>

      {/* Live Classroom Alert Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-yellow-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            Phòng Học Google Meet Chính Thức
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            Lớp Trực Tuyến: Bồi Dưỡng Học Sinh Giỏi & Chuyên Đề Nâng Cao
          </h3>
          <p className="text-xs text-cyan-100 mt-1">
            Mã phòng học: <strong>meet.google.com/ndh-chem-live</strong> | ID Zoom: <strong>988 275 2888</strong>
          </p>
        </div>

        <a
          href="https://meet.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Vào phòng học ngay</span>
        </a>
      </div>

      {/* Class Schedule Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          Lịch Phát Trực Tiếp Các Lớp Trong Tuần
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-blue-800 text-sm">Lớp {c.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {c.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {c.schedule}
                </span>
                <span className="text-emerald-700 font-bold text-[11px]">HD Online</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
