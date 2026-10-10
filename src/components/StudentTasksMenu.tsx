import React from 'react';
import { 
  FileCheck2, 
  BookOpen, 
  FileText, 
  Laptop, 
  ExternalLink, 
  GraduationCap, 
  Award,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

interface StudentTasksMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  examCount?: number;
  exemplaryCount?: number;
}

export function StudentTasksMenu({
  activeTab,
  setActiveTab,
  examCount = 6,
  exemplaryCount = 3
}: StudentTasksMenuProps) {

  const taskItems = [
    {
      id: 'kttx',
      title: 'Kiểm tra TX',
      sub: 'KTTX 15 phút & Đánh giá thường x...',
      icon: FileCheck2,
      // 1. Blue theme
      boxBorder: 'border-blue-400 bg-white',
      boxText: 'text-blue-950',
      iconBg: 'bg-blue-600 text-white',
      chevronColor: 'text-blue-400'
    },
    {
      id: 'study_corner',
      title: 'Góc học tập',
      sub: 'Tư liệu & Chuyên đề bài học',
      icon: BookOpen,
      // 2. Emerald/Green theme
      boxBorder: 'border-emerald-400 bg-white',
      boxText: 'text-emerald-950',
      iconBg: 'bg-emerald-600 text-white',
      chevronColor: 'text-emerald-400'
    },
    {
      id: 'homework',
      title: 'Bài tập về nhà',
      sub: 'Giao và nộp bài tập củng cố',
      icon: ClipboardList,
      // 3. Amber/Orange theme
      boxBorder: 'border-amber-400 bg-white',
      boxText: 'text-amber-950',
      iconBg: 'bg-amber-600 text-white',
      chevronColor: 'text-amber-400'
    },
    {
      id: 'prep_guide',
      title: 'Hướng dẫn soạn bài',
      sub: 'Câu hỏi chuẩn bị & Hướng dẫn học',
      icon: FileText,
      // 4. Teal theme
      boxBorder: 'border-teal-400 bg-white',
      boxText: 'text-teal-950',
      iconBg: 'bg-teal-600 text-white',
      chevronColor: 'text-teal-400'
    },
    {
      id: 'digital_products',
      title: 'Sản phẩm số',
      sub: 'Mô phỏng 3D & Sản phẩm học sinh',
      icon: Laptop,
      // 5. Purple theme
      boxBorder: 'border-purple-400 bg-white',
      boxText: 'text-purple-950',
      iconBg: 'bg-purple-600 text-white',
      chevronColor: 'text-purple-400'
    },
    {
      id: 'digital_tools',
      title: 'Link công cụ số',
      sub: 'PhET, Bảng tuần hoàn & TN ảo',
      icon: ExternalLink,
      // 6. Cyan/Sky theme
      boxBorder: 'border-sky-400 bg-white',
      boxText: 'text-sky-950',
      iconBg: 'bg-sky-600 text-white',
      chevronColor: 'text-sky-400'
    },
    {
      id: 'hsg_prep',
      title: 'Học sinh giỏi',
      sub: 'Bồi dưỡng HSG cấp Huyện, Tỉnh',
      icon: GraduationCap,
      // 7. Indigo theme
      boxBorder: 'border-indigo-400 bg-white',
      boxText: 'text-indigo-950',
      iconBg: 'bg-indigo-600 text-white',
      chevronColor: 'text-indigo-400'
    },
    {
      id: 'exemplary',
      title: 'Gương tiêu biểu',
      sub: 'Vinh danh gương sáng KHTN, đăng bài & ảnh',
      icon: Award,
      // 8. Rose theme
      boxBorder: 'border-rose-400 bg-white',
      boxText: 'text-rose-950',
      iconBg: 'bg-rose-600 text-white',
      chevronColor: 'text-rose-400'
    }
  ];

  return (
    <aside
      id="student-tasks-sidebar-menu"
      className="w-full space-y-2.5"
      aria-label="Nhiệm vụ học tập"
    >
      {/* Menu Header Card: styled like in reference image with Y ĐÔN badge */}
      <div 
        id="menu-header-bar"
        className="flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl shadow-xs border border-slate-800"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-xs font-black tracking-wider uppercase">
            MENU CHÍNH
          </h2>
        </div>
        <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
          Y ĐÔN
        </span>
      </div>

      {/* Subtitle guide */}
      <div className="px-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
        NHIỆM VỤ HỌC TẬP:
      </div>

      {/* 8 Folder Items stacked vertically:
          - Sized identically (h-10, px-2)
          - Compact width wrapped cleanly around button names
          - On hover, transitions to bright emerald green with white text
      */}
      <nav className="space-y-1.5">
        {taskItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`student-task-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              title={item.sub}
              className={`w-full h-10 px-2 rounded-xl border-2 transition-all duration-200 group cursor-pointer relative flex items-center justify-between gap-1.5 shadow-2xs ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                  : `${item.boxBorder} ${item.boxText} hover:bg-emerald-600 hover:border-emerald-600 hover:text-white hover:shadow-md`
              }`}
            >
              {/* Left icon & title */}
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Square Icon Badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                    isActive
                      ? 'bg-white text-emerald-700'
                      : `${item.iconBg} group-hover:bg-white group-hover:text-emerald-700`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Title (Button name) */}
                <span
                  className={`text-xs font-bold tracking-tight leading-none transition-colors whitespace-nowrap ${
                    isActive ? 'text-white' : `${item.boxText} group-hover:text-white`
                  }`}
                >
                  {item.title}
                </span>
              </div>

              {/* Chevron right arrow */}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive
                    ? 'text-white translate-x-0.5'
                    : `${item.chevronColor} group-hover:text-white group-hover:translate-x-0.5`
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Reminder card below menu */}
      <div className="p-2.5 bg-blue-50/90 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-snug">
        <span className="font-bold block text-blue-950 mb-0.5">📌 Lưu ý học sinh:</span>
        Thực hiện nghiêm túc quy chế thi, không rời khỏi màn hình kiểm tra.
      </div>
    </aside>
  );
}
