import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck,
  Clock,
  Users,
  PlusCircle,
  Play,
  Award,
  Paperclip,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';
import { FileAttachment, HomeworkSubmission } from '../../types';

interface ExamItem {
  id: string;
  title: string;
  grade: string;
  durationMinutes: number;
  questionCount: number;
  status: 'open' | 'closed';
  participants: number;
  attachments?: FileAttachment[];
}
import {
  processUploadedFile,
  getSavedHomeworkSubmissions,
  saveHomeworkSubmission,
  gradeHomeworkSubmission,
} from '../../utils/examStorage';
import {
  AttachmentList,
  InteractiveCommentSection,
} from '../AttachmentAndCommentSection';
import * as XLSX from 'xlsx';

const MOCK_EXAMS_STORAGE_KEY = 'ndh_mock_exams_v1';

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    title: 'Đề Thi Thử HSG Hóa Học 9 Cấp Tỉnh, Thành Phố - Lần 1',
    grade: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
    durationMinutes: 120,
    questionCount: 25,
    status: 'open',
    participants: 42,
    attachments: [],
  },
  {
    id: 'ex-2',
    title: 'Kiểm Tra Định Kỳ Giữa Học Kỳ 1 - Hóa Học 8',
    grade: 'Khối 8',
    durationMinutes: 45,
    questionCount: 20,
    status: 'open',
    participants: 38,
    attachments: [],
  },
  {
    id: 'ex-3',
    title: 'Đề Ôn Tập Chuyên Đề: Tốc Độ Phản Ứng & Cân Bằng Hóa Học',
    grade: 'Khối 8',
    durationMinutes: 60,
    questionCount: 30,
    status: 'open',
    participants: 55,
    attachments: [],
  },
];

export const MockExamsPage: React.FC = () => {
  const { setActivePage, showToast } = useApp();
  const { isAdmin, currentUser } = useAuth();

  const [exams, setExams] = useState<ExamItem[]>(() => {
    try {
      const raw = localStorage.getItem(MOCK_EXAMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_EXAMS;
  });

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() =>
    getSavedHomeworkSubmissions()
  );

  // Admin Create Exam Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGrade, setNewGrade] = useState('Khối 8');
  const [newDuration, setNewDuration] = useState(60);
  const [newQuestionCount, setNewQuestionCount] = useState(20);
  const [newAttachments, setNewAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Student Submit Exam File Modal
  const [submittingExam, setSubmittingExam] = useState<ExamItem | null>(null);
  const [stName, setStName] = useState(currentUser?.displayName || '');
  const [stClass, setStClass] = useState('H8.1');
  const [stContent, setStContent] = useState('');
  const [stFiles, setStFiles] = useState<FileAttachment[]>([]);
  const stFileRef = useRef<HTMLInputElement>(null);

  // Admin View/Grade Submissions Modal
  const [gradingExam, setGradingExam] = useState<ExamItem | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const refresh = () => setSubmissions(getSavedHomeworkSubmissions());
    window.addEventListener('ndh-hw-submissions-updated', refresh);
    return () => window.removeEventListener('ndh-hw-submissions-updated', refresh);
  }, []);

  const persistExams = (next: ExamItem[]) => {
    setExams(next);
    localStorage.setItem(MOCK_EXAMS_STORAGE_KEY, JSON.stringify(next));
  };

  const handleAdminUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const list: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        list.push(await processUploadedFile(files[i]));
      }
      setNewAttachments((prev) => [...prev, ...list]);
      showToast(`Đã đính kèm ${list.length} tệp đề thi (Word / Ảnh / PDF)!`, 'success');
    } catch {
      showToast('Lỗi khi tải tệp đính kèm.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Vui lòng nhập tên kỳ thi / đề kiểm tra.', 'error');
      return;
    }
    const item: ExamItem = {
      id: 'ex-' + Date.now(),
      title: newTitle.trim(),
      grade: newGrade,
      durationMinutes: Number(newDuration) || 45,
      questionCount: Number(newQuestionCount) || 20,
      status: 'open',
      participants: 0,
      attachments: newAttachments,
    };
    persistExams([item, ...exams]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewAttachments([]);
    showToast('Đã tạo đề thi định kỳ thành công!', 'success');
  };

  const handleDeleteExam = (id: string, title: string) => {
    if (confirm(`Xóa kỳ thi "${title}"?`)) {
      persistExams(exams.filter((ex) => ex.id !== id));
      showToast('Đã xóa đề thi.', 'info');
    }
  };

  const handleStudentUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const list: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        list.push(await processUploadedFile(files[i]));
      }
      setStFiles((prev) => [...prev, ...list]);
      showToast(`Đã đính kèm ${list.length} file bài làm (Word / Ảnh)!`, 'success');
    } catch {
      showToast('Lỗi khi đính kèm file bài làm.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleStudentSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingExam) return;
    if (!stName.trim()) {
      showToast('Vui lòng nhập Họ và tên học sinh.', 'error');
      return;
    }
    if (!stContent.trim() && stFiles.length === 0) {
      showToast('Vui lòng nhập bài làm hoặc đính kèm file Word / Ảnh bài làm.', 'error');
      return;
    }
    const sub: HomeworkSubmission = {
      id: 'exsub-' + Date.now(),
      homeworkId: submittingExam.id,
      homeworkTitle: submittingExam.title,
      studentId: currentUser?.uid || 'guest-' + Date.now(),
      studentName: stName.trim(),
      classGroup: stClass,
      submittedAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      contentNote: stContent.trim(),
      attachments: stFiles,
      status: 'submitted',
    };
    saveHomeworkSubmission(sub);
    setSubmissions(getSavedHomeworkSubmissions());
    setSubmittingExam(null);
    setStContent('');
    setStFiles([]);
    showToast('Đã nộp bài thi thành công! Giáo viên sẽ chấm điểm và nhận xét.', 'success');
  };

  const handleSaveGrade = (subId: string) => {
    const score = Number(scoreInputs[subId]);
    if (isNaN(score) || score < 0 || score > 10) {
      showToast('Điểm số hợp lệ từ 0 đến 10.', 'error');
      return;
    }
    gradeHomeworkSubmission(subId, score, commentInputs[subId] || 'Đã chấm bài thi định kỳ');
    setSubmissions(getSavedHomeworkSubmissions());
    showToast('Đã lưu điểm bài thi và đồng bộ sang Bảng điểm!', 'success');
  };

  const handleExportExamGrades = (ex: ExamItem) => {
    const list = submissions.filter((s) => s.homeworkId === ex.id);
    if (list.length === 0) {
      showToast('Chưa có bài nộp nào cho đề thi này.', 'info');
      return;
    }
    const rows = list.map((s, idx) => ({
      STT: idx + 1,
      'Họ và tên học sinh': s.studentName,
      'Lớp': s.classGroup,
      'Kỳ thi': s.homeworkTitle,
      'Thời gian nộp': s.submittedAt,
      'Điểm số': s.score !== undefined ? s.score : 'Chưa chấm',
      'Nhận xét': s.teacherFeedback || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DiemThiDinhKy');
    XLSX.writeFile(wb, `Diem_${ex.title.slice(0, 25).replace(/\s+/g, '_')}.xlsx`);
    showToast('Đã tải file Excel điểm kỳ thi!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200 mb-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            {isAdmin
              ? 'Quản trị viên: Ra đề thi định kỳ, Chấm bài & Tải file điểm'
              : 'Khu vực Học sinh: Làm bài kiểm tra, Nộp bài (Word / Ảnh) & Bình luận'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Thi Thử & Kiểm Tra Định Kỳ Hóa Học NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đề thi bám sát cấu trúc đề thi học kỳ và thi HSG cấp tỉnh, thành phố.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ra Đề Thi Mới (Word / Ảnh)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((ex) => {
          const exSubs = submissions.filter((s) => s.homeworkId === ex.id);
          return (
            <div
              key={ex.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {ex.grade}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ex.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ex.status === 'open' ? 'Đang mở thi' : 'Đã kết thúc'}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteExam(ex.id, ex.title)}
                        className="p-1 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                        title="Xóa đề thi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {ex.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {ex.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-cyan-600" />
                    {ex.questionCount} câu hỏi
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {ex.participants + exSubs.length} lượt thi
                  </span>
                </div>

                {ex.attachments && ex.attachments.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[11px] font-bold text-slate-600 mb-1">
                      Tệp đề thi đính kèm:
                    </div>
                    <AttachmentList attachments={ex.attachments} compact />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActivePage('interactive-quiz')}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Làm bài trắc nghiệm</span>
                  </button>

                  <button
                    onClick={() => setSubmittingExam(ex)}
                    className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Gửi bài làm (Word/Ảnh)</span>
                  </button>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        const sMap: Record<string, string> = {};
                        const cMap: Record<string, string> = {};
                        exSubs.forEach((s) => {
                          if (s.score !== undefined) sMap[s.id] = String(s.score);
                          if (s.teacherFeedback) cMap[s.id] = s.teacherFeedback;
                        });
                        setScoreInputs(sMap);
                        setCommentInputs(cMap);
                        setGradingExam(ex);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Chấm bài nộp ({exSubs.length})</span>
                    </button>
                    <button
                      onClick={() => handleExportExamGrades(ex)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Tải file Excel điểm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>File điểm</span>
                    </button>
                  </div>
                )}

                <InteractiveCommentSection
                  targetId={`mock-exam-${ex.id}`}
                  title="Bình luận & Trao đổi đề thi (Hỗ trợ gửi Word, Ảnh)"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Create Mock Exam Modal */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                Ra Đề Thi Thử / Kiểm Tra Định Kỳ Mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên kỳ thi / đề thi *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Đề Thi Thử HSG Hóa Học 9 Cấp Tỉnh - Lần 2"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối / Cấp độ</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Bồi dưỡng HSG cấp tỉnh, thành phố">
                      Bồi dưỡng HSG cấp tỉnh, thành phố
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số câu hỏi</label>
                  <input
                    type="number"
                    value={newQuestionCount}
                    onChange={(e) => setNewQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đính kèm file đề thi (Word .docx/.doc, Ảnh, PDF)
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 text-cyan-700" />
                  <span>{uploading ? 'Đang tải...' : 'Chọn file Word / Ảnh đề thi'}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".doc,.docx,.pdf,image/*"
                  onChange={handleAdminUploadFile}
                  className="hidden"
                />
                {newAttachments.length > 0 && (
                  <div className="mt-2">
                    <AttachmentList
                      attachments={newAttachments}
                      onRemove={(id) =>
                        setNewAttachments((prev) => prev.filter((a) => a.id !== id))
                      }
                      compact
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Đăng Đề Thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Exam Work Modal */}
      {submittingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase">
                  Nộp bài thi tự luận / phiếu bài giải
                </span>
                <h3 className="font-black text-base text-slate-900">{submittingExam.title}</h3>
              </div>
              <button
                onClick={() => setSubmittingExam(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmitExam} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    value={stName}
                    onChange={(e) => setStName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học</label>
                  <input
                    type="text"
                    value={stClass}
                    onChange={(e) => setStClass(e.target.value)}
                    placeholder="VD: H8.1, H9.1..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài làm / Đáp án tóm tắt
                </label>
                <textarea
                  rows={3}
                  value={stContent}
                  onChange={(e) => setStContent(e.target.value)}
                  placeholder="Ghi trình bày lời giải hoặc đính kèm file Word / Ảnh chụp bài giải bên dưới..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đính kèm file bài làm (Word .docx/.doc hoặc Ảnh chụp bài làm)
                </label>
                <button
                  type="button"
                  onClick={() => stFileRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>{uploading ? 'Đang tải...' : 'Tải lên file Word / Ảnh bài làm'}</span>
                </button>
                <input
                  ref={stFileRef}
                  type="file"
                  multiple
                  accept=".doc,.docx,.pdf,image/*"
                  onChange={handleStudentUploadFile}
                  className="hidden"
                />
                {stFiles.length > 0 && (
                  <div className="mt-2">
                    <AttachmentList
                      attachments={stFiles}
                      onRemove={(id) => setStFiles((prev) => prev.filter((a) => a.id !== id))}
                      compact
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittingExam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow cursor-pointer"
                >
                  Gửi Bài Thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Grade Exam Submissions Modal */}
      {gradingExam && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase">
                  Quản trị viên Chấm bài thi & Đồng bộ bảng điểm
                </span>
                <h3 className="font-black text-base text-slate-900">{gradingExam.title}</h3>
              </div>
              <button
                onClick={() => setGradingExam(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissions.filter((s) => s.homeworkId === gradingExam.id).length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400 italic">
                Chưa có học sinh nào gửi bài làm cho đề thi này.
              </p>
            ) : (
              <div className="space-y-3">
                {submissions
                  .filter((s) => s.homeworkId === gradingExam.id)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-black text-slate-900 text-sm">
                            {sub.studentName}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                            Lớp {sub.classGroup}
                          </span>
                          <span className="ml-2 text-slate-400">{sub.submittedAt}</span>
                        </div>
                        {sub.score !== undefined && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black">
                            Đã chấm: {sub.score}/10 điểm
                          </span>
                        )}
                      </div>

                      {sub.contentNote && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 whitespace-pre-wrap">
                          {sub.contentNote}
                        </div>
                      )}

                      {sub.attachments && sub.attachments.length > 0 && (
                        <AttachmentList attachments={sub.attachments} />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-200 items-center">
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="Điểm (0-10)"
                            value={scoreInputs[sub.id] ?? ''}
                            onChange={(e) =>
                              setScoreInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Nhận xét của giáo viên..."
                            value={commentInputs[sub.id] ?? ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [sub.id]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <button
                            type="button"
                            onClick={() => handleSaveGrade(sub.id)}
                            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow cursor-pointer"
                          >
                            Lưu điểm
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
