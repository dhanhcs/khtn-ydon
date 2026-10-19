import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  User,
  Plus, 
  Trophy, 
  Clock, 
  HelpCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Trash2, 
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Sliders,
  Eye
} from 'lucide-react';
import { 
  InteractiveLessonExam, 
  GroupSubmission, 
  SubjectType, 
  GradeLevel, 
  UserSession 
} from '../types';
import { sampleInteractiveLessonExams, sampleGroupSubmissions } from '../data/mockData';
import { InteractiveLessonExamModal } from './InteractiveLessonExamModal';
import { GroupScoreboardModal } from './GroupScoreboardModal';
import { InteractiveCreateLessonExamModal } from './InteractiveCreateLessonExamModal';
import { InteractiveExamEditModal } from './InteractiveExamEditModal';
import { isTeacherAdmin } from '../utils/permissionUtils';

interface InteractiveLessonViewProps {
  currentUser?: UserSession | null;
}

export function InteractiveLessonView({ currentUser }: InteractiveLessonViewProps) {
  // Exams list stored in localStorage
  const [exams, setExams] = useState<InteractiveLessonExam[]>(() => {
    const saved = localStorage.getItem('ydon_interactive_exams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return sampleInteractiveLessonExams;
  });

  // Group & Individual Submissions stored in localStorage
  const [submissions, setSubmissions] = useState<GroupSubmission[]>(() => {
    const saved = localStorage.getItem('ydon_group_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return sampleGroupSubmissions;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ydon_interactive_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('ydon_group_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Filters (tương tự như trong đề KTTX)
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [activeExamToTake, setActiveExamToTake] = useState<{
    exam: InteractiveLessonExam;
    mode: 'group' | 'individual';
  } | null>(null);

  const [editingExam, setEditingExam] = useState<InteractiveLessonExam | null>(null);
  const [showScoreboardModal, setShowScoreboardModal] = useState<boolean>(false);
  const [filterScoreboardExamId, setFilterScoreboardExamId] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (selectedSubject !== 'all' && e.subject !== selectedSubject) return false;
      if (selectedGrade !== 'all' && e.grade.toString() !== selectedGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchLesson = e.lessonTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchLesson) return false;
      }
      return true;
    });
  }, [exams, selectedSubject, selectedGrade, searchQuery]);

  // Handle student group/individual submitting an exam
  const handleSaveGroupSubmission = (newSub: GroupSubmission) => {
    setSubmissions((prev) => {
      const next = [newSub, ...prev];
      localStorage.setItem('ydon_group_submissions', JSON.stringify(next));
      // Sync to backend if endpoint available
      fetch('/api/sync/group-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: [newSub] })
      }).catch(() => {});
      return next;
    });
  };

  // Handle saving new exam created (Admin)
  const handleSaveNewExam = (newExam: InteractiveLessonExam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  // Handle saving updated exam (Admin edit)
  const handleSaveUpdatedExam = (updatedExam: InteractiveLessonExam) => {
    setExams((prev) => prev.map((e) => (e.id === updatedExam.id ? updatedExam : e)));
  };

  // Delete an exam (Chỉ Giáo viên Quản trị)
  const handleDeleteExam = (id: string) => {
    if (!isTeacherAdmin(currentUser)) {
      alert('Chỉ Giáo viên Quản trị mới có quyền xóa đề kiểm tra. Học sinh, khách và tổ trưởng không có quyền này.');
      return;
    }
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa bộ đề tương tác bài học này?')) {
      setExams(prev => prev.filter(e => e.id !== id));
    }
  };

  // Helper to count submissions for an exam
  const getSubmissionsCount = (examId: string) => {
    return submissions.filter(s => s.examId === examId).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Buttons Header (Cấu trúc tương tự KTTX) */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-950 p-5 sm:p-7 rounded-3xl text-white shadow-xl border border-indigo-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Tương Tác Nhóm 1 - 8 & Tương Tác Cá Nhân • Củng Cố Từng Bài Học</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              HỆ THỐNG ĐỀ TƯƠNG TÁC THEO BÀI HỌC KHOA HỌC TỰ NHIÊN
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-normal leading-relaxed">
              Tổ chức thi đua sôi nổi giữa các nhóm trên lớp (Nhóm 1 đến Nhóm 8) hoặc cho từng học sinh tự luyện tập tương tác cá nhân. Đánh giá năng lực, chấm điểm tức thì và vinh danh Cúp Vàng 🏆, Cúp Bạc 🥈, Cúp Đồng 🥉 cho từng bài học!
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-block font-mono text-xs font-bold text-amber-300 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
              {filteredExams.length} đề bài học sẵn sàng
            </span>

            {/* Nút Xem Bảng Điểm & Cúp */}
            <button
              type="button"
              onClick={() => {
                setFilterScoreboardExamId(undefined);
                setShowScoreboardModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>Bảng Điểm & Cúp Vinh Danh</span>
            </button>

            {/* Nút Tạo Đề Tương Tác Mới - Chỉ Giáo viên Quản trị */}
            {isTeacherAdmin(currentUser) && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-indigo-400/50"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Đề Tương Tác Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar (Cấu trúc tương tự như trong đề KTTX) */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 space-y-3 text-xs">
          
          {/* Row 1: Khối Lớp & Phân Môn */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Khối lớp filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-amber-300 uppercase tracking-wider mr-1 text-[11px]">
                KHỐI LỚP:
              </span>
              {['all', '6', '7', '8', '9'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                  }`}
                >
                  {g === 'all' ? 'Tất cả khối' : `Khối ${g}`}
                </button>
              ))}
            </div>

            {/* Phân môn filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-amber-300 uppercase tracking-wider mr-1 text-[11px]">
                PHÂN MÔN:
              </span>
              {[
                { id: 'all', label: 'Tất cả môn' },
                { id: 'physics', label: 'Vật lí' },
                { id: 'chemistry', label: 'Hóa học' },
                { id: 'biology', label: 'Sinh học' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s.id as SubjectType)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSubject === s.id
                      ? 'bg-blue-500 text-white shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

          </div>

          {/* Row 2: Search Input */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-indigo-300 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo tên bài học, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/20 text-white placeholder-indigo-200 border border-white/25 rounded-xl text-xs outline-none focus:bg-white/30 font-medium"
              />
            </div>
            <span className="text-[11px] text-indigo-200 hidden sm:inline">
              Hỗ trợ 2 chế độ: <strong>Tương tác nhóm (1 - 8)</strong> hoặc <strong>Tương tác cá nhân từng HS</strong>
            </span>
          </div>

        </div>

      </div>

      {/* Grid of Interactive Lesson Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-black text-base text-slate-700">Chưa tìm thấy đề tương tác bài học nào</h4>
            <p className="text-xs text-slate-500">
              Thầy/Cô hãy nhấp <strong>"+ Tạo Đề Tương Tác Mới"</strong> để khởi tạo đề tương tác nhóm & cá nhân cho học sinh.
            </p>
          </div>
        ) : (
          filteredExams.map((ex) => {
            const subCount = getSubmissionsCount(ex.id);

            return (
              <div
                key={ex.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                      ex.subject === 'physics'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : ex.subject === 'chemistry'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {ex.subject === 'physics' ? 'Vật lí' : ex.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} • Khối {ex.grade}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {ex.lessonCode || 'Bài học'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {ex.lessonTitle}
                    </p>
                  </div>

                  {/* Meta stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{ex.questions.length} câu trắc nghiệm</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{ex.durationMinutes} phút</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Lượt tham gia:</span>
                    <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      👥 {subCount} lượt làm bài
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  
                  {/* BUTTON 1: TƯƠNG TÁC NHÓM (1 - 8) */}
                  <button
                    type="button"
                    onClick={() => setActiveExamToTake({ exam: ex, mode: 'group' })}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-amber-300" />
                    <span>1. VÀO TƯƠNG TÁC NHÓM (1 - 8)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                  </button>

                  {/* BUTTON 2: TƯƠNG TÁC CÁ NHÂN (YÊU CẦU CỦA NGƯỜI DÙNG) */}
                  <button
                    type="button"
                    onClick={() => setActiveExamToTake({ exam: ex, mode: 'individual' })}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4 text-amber-300" />
                    <span>2. VÀO TƯƠNG TÁC CÁ NHÂN (TỪNG HS)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                  </button>

                  {/* BOTTOM ACTIONS: ADMIN EDIT, SCOREBOARD & DELETE */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterScoreboardExamId(ex.id);
                        setShowScoreboardModal(true);
                      }}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>Bảng điểm</span>
                    </button>

                    {/* GIÁO VIÊN QUẢN TRỊ: XEM VÀ CHỈNH SỬA / XÓA ĐỀ TƯƠNG TÁC */}
                    {isTeacherAdmin(currentUser) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingExam(ex)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 cursor-pointer transition-colors flex items-center gap-1"
                          title="Xem và chỉnh sửa câu hỏi của đề này (Dành riêng cho Giáo viên Quản trị)"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa đề</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteExam(ex.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa đề này (Dành riêng cho Giáo viên Quản trị)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Taking Modal (Supports both group & individual modes) */}
      {activeExamToTake && (
        <InteractiveLessonExamModal
          exam={activeExamToTake.exam}
          currentUser={currentUser}
          initialMode={activeExamToTake.mode}
          onClose={() => setActiveExamToTake(null)}
          onSubmitGroupExam={handleSaveGroupSubmission}
        />
      )}

      {/* Admin: Edit Interactive Lesson Exam Modal */}
      {editingExam && (
        <InteractiveExamEditModal
          isOpen={Boolean(editingExam)}
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaveUpdatedExam={handleSaveUpdatedExam}
        />
      )}

      {/* Group Scoreboard & Trophies Modal */}
      {showScoreboardModal && (
        <GroupScoreboardModal
          isOpen={showScoreboardModal}
          onClose={() => setShowScoreboardModal(false)}
          submissions={submissions}
          exams={exams}
          filterLessonExamId={filterScoreboardExamId}
        />
      )}

      {/* Create New Interactive Lesson Exam Modal */}
      {showCreateModal && (
        <InteractiveCreateLessonExamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaveExam={handleSaveNewExam}
          initialSubject={selectedSubject}
          initialGrade={selectedGrade}
        />
      )}

    </div>
  );
}
