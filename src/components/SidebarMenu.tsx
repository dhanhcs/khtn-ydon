import React from 'react';
import { useApp, ActivePage } from '../context/AppContext';
import {
  FileText,
  MousePointerClick,
  FileCheck2,
  BookOpenCheck,
  Film,
  Receipt,
  Video,
  UserPlus,
  Bot,
  CalendarOff,
  Trophy,
  Youtube,
} from 'lucide-react';

interface MenuItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultIconColor: string;
}

export const SIDEBAR_ITEMS: MenuItem[] = [
  {
    id: 'homework',
    label: '1. Bài tập về nhà',
    icon: FileText,
    defaultIconColor: 'text-sky-600',
  },
  {
    id: 'interactive-quiz',
    label: '2. Bài tập tương tác',
    icon: MousePointerClick,
    defaultIconColor: 'text-teal-600',
  },
  {
    id: 'mock-exams',
    label: '3. Đề kiểm tra thử',
    icon: FileCheck2,
    defaultIconColor: 'text-indigo-600',
  },
  {
    id: 'materials',
    label: '4. Tài liệu tham khảo',
    icon: BookOpenCheck,
    defaultIconColor: 'text-emerald-600',
  },
  {
    id: 'experiments',
    label: '5. Địa chỉ các video thí nghiệm',
    icon: Film,
    defaultIconColor: 'text-amber-600',
  },
  {
    id: 'tuition',
    label: '6. Thông báo học phí',
    icon: Receipt,
    defaultIconColor: 'text-cyan-600',
  },
  {
    id: 'online-classes',
    label: '7. Học trực tuyến',
    icon: Video,
    defaultIconColor: 'text-blue-600',
  },
  {
    id: 'registration',
    label: '8. Đăng ký trực tuyến',
    icon: UserPlus,
    defaultIconColor: 'text-violet-600',
  },
  {
    id: 'ai-assistant',
    label: '9. Trợ lý AI',
    icon: Bot,
    defaultIconColor: 'text-purple-600',
  },
  {
    id: 'leave-requests',
    label: '10. Báo cáo xin phép',
    icon: CalendarOff,
    defaultIconColor: 'text-orange-600',
  },
  {
    id: 'exam-results',
    label: '11. Kết quả thi thử',
    icon: Trophy,
    defaultIconColor: 'text-rose-600',
  },
  {
    id: 'youtube-channel',
    label: '12. Youtube thầy Hành',
    icon: Youtube,
    defaultIconColor: 'text-red-600',
  },
];

export const SidebarMenu: React.FC = () => {
  const { activePage, setActivePage } = useApp();

  return (
    <aside className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-sky-700 text-white px-4 py-3 border-b-2 border-cyan-800 flex items-center justify-between">
        <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase drop-shadow-sm">
          MÊ NU CHÍNH
        </h2>
        <span className="text-[11px] bg-cyan-900/50 text-cyan-200 px-2 py-0.5 rounded font-mono">
          12 Mục
        </span>
      </div>

      {/* Menu List */}
      <nav className="p-2 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full group text-left px-3.5 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 cursor-pointer text-xs sm:text-sm font-semibold select-none ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md transform translate-x-1'
                  : 'text-slate-700 bg-slate-50/70 hover:bg-red-600 hover:text-white hover:shadow-sm hover:translate-x-0.5'
              }`}
            >
              <div
                className={`p-1.5 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-red-700 text-white'
                    : `bg-white group-hover:bg-red-700 group-hover:text-white shadow-xs ${item.defaultIconColor}`
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              </div>
              <span className="flex-1 font-medium">{item.label}</span>
              <span
                className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                  isSelected ? 'opacity-100 text-white font-bold' : 'text-slate-300 group-hover:text-white'
                }`}
              >
                ▶
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
