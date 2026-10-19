import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Clock, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  CalendarClock,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { 
  Exam, 
  GradeLevel, 
  SubjectType, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion,
  EssayQuestion,
  ExamQuestion 
} from '../types';
import { compressAndOptimizeImage } from '../utils/fileUtils';
import { FormulaText } from './FormulaText';

interface ExamEditModalProps {
  exam: Exam;
  isOpen: boolean;
  isAdmin?: boolean;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updatedExam: Exam) => void;
  onDelete?: (examId: string) => void;
}

export function ExamEditModal({ exam, isOpen, isAdmin = true, isNew = false, onClose, onSave, onDelete }: ExamEditModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  // Form states
  const [title, setTitle] = useState(exam.title);
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(exam.subject);
  const [grade, setGrade] = useState<GradeLevel>(exam.grade);
  const [testNumber, setTestNumber] = useState<string>(exam.testNumber || 'TX1');
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 15);
  const [isActive, setIsActive] = useState(exam.isActive ?? true);
  
  // Chế độ mở đề: Ấn định ngày mở (Quy định chuẩn: Sau khi hết giờ tự đóng, GV có thể mở lại)
  const [mode, setMode] = useState<'mode_1' | 'mode_2'>('mode_2');

  // Parse existing openAt or fallback to current datetime
  const initialOpenAt = exam.openAt || exam.openTime || new Date(Date.now() + 3600000).toISOString().slice(0, 19);
  
  const parseDatePart = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    } catch {}
    return new Date().toISOString().slice(0, 10);
  };

  const parseTimePart = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${min}:${ss}`;
      }
    } catch {}
    return '08:00:00';
  };

  const [openDate, setOpenDate] = useState(parseDatePart(initialOpenAt));
  const [openTime, setOpenTime] = useState(parseTimePart(initialOpenAt));

  // Questions state
  const [questions, setQuestions] = useState<ExamQuestion[]>(JSON.parse(JSON.stringify(exam.questions || [])));
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  // Helper to format scheduled time for preview
  const getFormattedSchedule = () => {
    if (mode === 'mode_1') {
      return 'Mở mọi lúc (Học sinh có thể làm bài bất kỳ lúc nào)';
    }
    if (!openDate) return 'Chưa chọn ngày mở';
    const [year, month, day] = openDate.split('-');
    return `Mở lúc ${openTime || '08:00:00'} ngày ${day}/${month}/${year}`;
  };

  // Check if open date/time is in future
  const isScheduledInFuture = () => {
    if (mode !== 'mode_2' || !openDate) return false;
    const combined = new Date(`${openDate}T${openTime || '00:00:00'}`);
    return combined.getTime() > Date.now();
  };

  // Handle question updates
  const handleUpdateMCQ = (qIndex: number, updatedFields: Partial<MultipleChoiceQuestion>) => {
    setQuestions(prev => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], ...updatedFields } as MultipleChoiceQuestion;
      return next;
    });
  };

  const handleUpdateTF = (qIndex: number, statementIdx: number, isCorrect: boolean) => {
    setQuestions(prev => {
      const next = [...prev];
      const tfQ = { ...next[qIndex] } as TrueFalseQuestion;
      const stmts = [...tfQ.statements] as [any, any, any, any];
      stmts[statementIdx] = { ...stmts[statementIdx], isCorrect };
      tfQ.statements = stmts;
      next[qIndex] = tfQ;
      return next;
    });
  };

  const handleUpdateTFText = (qIndex: number, statementIdx: number, text: string) => {
    setQuestions(prev => {
      const next = [...prev];
      const tfQ = { ...next[qIndex] } as TrueFalseQuestion;
      const stmts = [...tfQ.statements] as [any, any, any, any];
      stmts[statementIdx] = { ...stmts[statementIdx], text };
      tfQ.statements = stmts;
      next[qIndex] = tfQ;
      return next;
    });
  };

  const handleUpdateSA = (qIndex: number, answersText: string) => {
    setQuestions(prev => {
      const next = [...prev];
      const saQ = { ...next[qIndex] } as ShortAnswerQuestion;
      saQ.acceptableAnswers = answersText.split(',').map(s => s.trim()).filter(Boolean);
      next[qIndex] = saQ;
      return next;
    });
  };

  const handleChangeQuestionType = (idx: number, newType: string) => {
    const currentQ = questions[idx];
    if (currentQ.type === newType) return;

    let converted: ExamQuestion;
    const baseQuestion = currentQ.question;
    const baseImage = currentQ.imageUrl;

    if (newType === 'multiple_choice') {
      converted = {
        id: currentQ.id || `m_q_${Date.now()}_${idx + 1}`,
        type: 'multiple_choice',
        question: baseQuestion,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: 0,
        explanation: currentQ.explanation || 'Giải thích cho đáp án đúng.',
        imageUrl: baseImage
      };
    } else if (newType === 'true_false') {
      converted = {
        id: currentQ.id || `m_tf_${Date.now()}_${idx + 1}`,
        type: 'true_false',
        question: baseQuestion,
        statements: [
          { subId: 'a', text: 'Nhận định a...', isCorrect: true },
          { subId: 'b', text: 'Nhận định b...', isCorrect: false },
          { subId: 'c', text: 'Nhận định c...', isCorrect: true },
          { subId: 'd', text: 'Nhận định d...', isCorrect: false }
        ],
        explanation: currentQ.explanation || 'Giải thích chi tiết 4 ý nhận định.',
        imageUrl: baseImage
      };
    } else if (newType === 'short_answer') {
      converted = {
        id: currentQ.id || `m_sa_${Date.now()}_${idx + 1}`,
        type: 'short_answer',
        question: baseQuestion,
        acceptableAnswers: ['10', '20'],
        blanks: [
          { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10', '10.0', '10,0'], unit: '', points: 0.5 },
          { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20', '20.0', '20,0'], unit: '', points: 0.5 }
        ],
        explanation: currentQ.explanation || 'Giải thích chi tiết 2 chỗ điền số.',
        imageUrl: baseImage
      };
    } else {
      converted = {
        id: currentQ.id || `m_essay_${Date.now()}_${idx + 1}`,
        type: 'essay',
        question: baseQuestion,
        points: 1.0,
        sampleAnswer: 'Hướng dẫn đáp án mẫu tự luận.',
        gradingGuide: 'Thang điểm chi tiết.',
        imageUrl: baseImage
      };
    }

    setQuestions(prev => {
      const next = [...prev];
      next[idx] = converted;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert('Chỉ quản trị viên (Admin) mới có quyền chỉnh sửa đề kiểm tra!');
      return;
    }

    const combinedOpenAt = `${openDate}T${openTime || '08:00:00'}`;
    const openMs = new Date(combinedOpenAt).getTime();
    const duration = Number(durationMinutes) || 15;
    const combinedCloseAt = !isNaN(openMs) ? new Date(openMs + duration * 60000).toISOString() : undefined;

    const updatedExam: Exam = {
      ...exam,
      title: title.trim() || exam.title,
      subject,
      grade,
      testNumber,
      durationMinutes: duration,
      isActive,
      mode: 'mode_2',
      openAt: combinedOpenAt,
      openTime: combinedOpenAt,
      closeAt: combinedCloseAt,
      closeTime: combinedCloseAt,
      password: undefined, // Bỏ mật khẩu hoàn toàn
      questions
    };

    onSave(updatedExam);
    onClose();
  };

  return (
    <div 
      id="exam-edit-modal-overlay" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="exam-edit-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-snug text-white">
                {isNew ? 'Tạo Đề Kiểm Tra Mới (Admin)' : 'Chỉnh Sửa Đề Kiểm Tra'}
              </h3>
              <p className="text-[11px] text-sky-200">
                {isNew 
                  ? 'Khởi tạo bộ đề thi mới, thiết lập thời gian mở và câu hỏi' 
                  : `Mã đề: ${exam.id} • Phân môn: ${subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>1. Cài đặt & Chế độ mở đề</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Nội dung câu hỏi ({questions.length} câu)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Chuẩn ma trận 16 MCQ + 1 Đ/S + 1 TLN
          </span>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          {activeTab === 'settings' ? (
            <div className="space-y-5">
              {/* Tiêu đề */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu đề đề kiểm tra: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đề 1 - Vật lí 8: Áp suất chất lỏng..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Grid 4 thông số: Phân môn, Khối lớp, Đề kiểm tra, Thời lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân môn:</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    <option value="physics">Vật lí</option>
                    <option value="chemistry">Hóa học</option>
                    <option value="biology">Sinh học</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    <option value={6}>Lớp 6</option>
                    <option value={7}>Lớp 7</option>
                    <option value={8}>Lớp 8</option>
                    <option value={9}>Lớp 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn Đề kiểm tra:</label>
                  <select
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    <option value="TX1">Đề 1 (TX1)</option>
                    <option value="TX2">Đề 2 (TX2)</option>
                    <option value="TX3">Đề 3 (TX3)</option>
                    <option value="TX4">Đề 4 (TX4)</option>
                    <option value="TX5">Đề 5 (TX5)</option>
                    <option value="TX6">Đề 6 (TX6)</option>
                    <option value="TX7">Đề 7 (TX7)</option>
                    <option value="TX8">Đề 8 (TX8)</option>
                    <option value="TX9">Đề 9 (Mở rộng)</option>
                    <option value="TX10">Đề 10 (Mở rộng)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={5}
                      max={90}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-blue-600 text-center"
                    />
                    <span className="text-slate-500 font-bold shrink-0">phút</span>
                  </div>
                </div>
              </div>

              {/* Trạng thái hoạt động */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Trạng thái đề thi:</span>
                  <span className="text-[11px] text-slate-500">
                    {isActive ? 'Đề đang mở cho học sinh tiếp cận' : 'Đề đang tạm khóa (ẩn khỏi danh sách làm bài)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isActive ? 'Đang kích hoạt' : 'Tạm khóa'}
                </button>
              </div>

              {/* PHẦN CHẾ ĐỘ MỞ ĐỀ: 2 CHẾ ĐỘ RÕ RÀNG (BỎ MẬT KHẨU) */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/40 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-blue-900">
                      Chế Độ Mở Đề Kiểm Tra (2 Chế Độ)
                    </h4>
                    <p className="text-[11px] text-blue-700">
                      Hệ thống áp dụng trực tiếp, không yêu cầu mật khẩu mở đề.
                    </p>
                  </div>
                </div>

                {/* Chế độ ấn định thời gian mở đề & Mở lại đề thi */}
                <div className="p-4 rounded-xl border-2 border-blue-400 bg-white shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-black text-slate-900 text-xs sm:text-[13px] flex items-center gap-1.5">
                        <CalendarClock className="w-4 h-4 text-blue-600" />
                        <span>Chế độ 2: Ấn định thời gian mở đề</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sau khi hết giờ làm bài, hệ thống tự động đóng chế độ mở và báo cáo hết giờ. Học sinh không được vào thi sau khi đã hết giờ.
                      </p>
                    </div>

                    {/* Nút Giáo viên mở lại đề thi nhanh */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const yyyy = now.getFullYear();
                          const mm = String(now.getMonth() + 1).padStart(2, '0');
                          const dd = String(now.getDate()).padStart(2, '0');
                          const hh = String(now.getHours()).padStart(2, '0');
                          const min = String(now.getMinutes()).padStart(2, '0');
                          const ss = String(now.getSeconds()).padStart(2, '0');
                          setOpenDate(`${yyyy}-${mm}-${dd}`);
                          setOpenTime(`${hh}:${min}:${ss}`);
                          setDurationMinutes(15);
                          setIsActive(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                        title="Đặt thời gian mở lại từ thời điểm hiện tại và gia hạn 15 phút"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mở lại ngay (+15p)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const yyyy = now.getFullYear();
                          const mm = String(now.getMonth() + 1).padStart(2, '0');
                          const dd = String(now.getDate()).padStart(2, '0');
                          const hh = String(now.getHours()).padStart(2, '0');
                          const min = String(now.getMinutes()).padStart(2, '0');
                          const ss = String(now.getSeconds()).padStart(2, '0');
                          setOpenDate(`${yyyy}-${mm}-${dd}`);
                          setOpenTime(`${hh}:${min}:${ss}`);
                          setDurationMinutes(30);
                          setIsActive(true);
                        }}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                        title="Đặt thời gian mở lại từ thời điểm hiện tại và gia hạn 30 phút"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mở lại ngay (+30p)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mode 2 Configuration Fields */}
                {mode === 'mode_2' && (
                  <div className="p-4 bg-white rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Thiết lập ngày, tháng, năm và giờ, phút, giây mở đề:
                      </span>
                      {isScheduledInFuture() ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Chưa đến giờ (Sắp mở)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Đã đến giờ mở
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Chọn Ngày, Tháng, Năm */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Ngày - Tháng - Năm bắt đầu mở: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={openDate}
                          onChange={(e) => setOpenDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-blue-600"
                        />
                      </div>

                      {/* Chọn Giờ, Phút, Giây */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Giờ : Phút : Giây bắt đầu làm bài: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          step="1"
                          required
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
                      <span>
                        Thời gian mở đề đã ấn định: <strong>{getFormattedSchedule()}</strong>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (Chuẩn múi giờ Việt Nam GMT+7)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Soạn thảo nội dung câu hỏi */
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Danh sách câu hỏi trong bộ đề ({questions.length} câu)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bấm vào từng câu để xem và chỉnh sửa câu hỏi, đáp án, lời giải thích.
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Tổng: 10.0 điểm
                </span>
              </div>

              <div className="space-y-2.5">
                {questions.map((q, idx) => {
                  const isExpanded = expandedQId === q.id || (expandedQId === null && idx === 0);

                  if (q.type === 'multiple_choice') {
                    const mcq = q as MultipleChoiceQuestion;
                    return (
                      <div key={q.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-2 transition-colors">
                          <button
                            type="button"
                            onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <select
                              value={q.type}
                              onChange={(e) => handleChangeQuestionType(idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-blue-900 cursor-pointer outline-none shrink-0"
                            >
                              <option value="multiple_choice">TN nhiều lựa chọn</option>
                              <option value="true_false">TN đúng sai</option>
                              <option value="short_answer">Điền ngắn</option>
                              <option value="essay">Tự luận</option>
                            </select>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              <FormulaText text={mcq.question} />
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (questions.length <= 1) {
                                  alert('Đề thi phải có ít nhất 1 câu hỏi!');
                                  return;
                                }
                                setQuestions(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa câu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                              className="p-1 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi:</label>
                              <textarea
                                rows={2}
                                value={mcq.question}
                                onChange={(e) => handleUpdateMCQ(idx, { question: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-blue-600"
                              />
                            </div>

                            {/* Ảnh minh họa cho câu hỏi */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Ảnh minh họa cho câu hỏi:</span>
                                </span>
                                {mcq.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMCQ(idx, { imageUrl: undefined })}
                                    className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                                  >
                                    ✕ Xóa ảnh
                                  </button>
                                )}
                              </div>

                              {mcq.imageUrl ? (
                                <div className="relative group max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-2">
                                  <img src={mcq.imageUrl} alt="Minh họa" className="max-h-44 max-w-full object-contain mx-auto" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-blue-200 transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Tải ảnh minh họa từ máy</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const optimized = await compressAndOptimizeImage(file);
                                          handleUpdateMCQ(idx, { imageUrl: optimized });
                                        }
                                      }}
                                    />
                                  </label>
                                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block font-bold text-slate-700">
                                4 Phương án lựa chọn (Click nút tròn để chọn đáp án đúng):
                              </label>
                              {(['A', 'B', 'C', 'D'] as const).map((optKey, optIdx) => (
                                <div key={optKey} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMCQ(idx, { correctAnswer: optIdx })}
                                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                      mcq.correctAnswer === optIdx
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={`Đặt ${optKey} là đáp án đúng`}
                                  >
                                    {optKey}
                                  </button>
                                  <input
                                    type="text"
                                    value={mcq.options[optIdx] || ''}
                                    onChange={(e) => {
                                      const newOpts = [...mcq.options] as [string, string, string, string];
                                      newOpts[optIdx] = e.target.value;
                                      handleUpdateMCQ(idx, { options: newOpts });
                                    }}
                                    className={`w-full px-3 py-1.5 border rounded-lg text-xs outline-none ${
                                      mcq.correctAnswer === optIdx
                                        ? 'border-emerald-500 bg-emerald-50/40 font-semibold'
                                        : 'border-slate-300'
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Giải thích đáp án:</label>
                              <input
                                type="text"
                                value={mcq.explanation || ''}
                                onChange={(e) => handleUpdateMCQ(idx, { explanation: e.target.value })}
                                placeholder="Giải thích chi tiết..."
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (q.type === 'true_false') {
                    const tfQ = q as TrueFalseQuestion;
                    return (
                      <div key={q.id} className="border border-purple-200 rounded-xl overflow-hidden bg-white">
                        <div className="w-full px-4 py-2.5 bg-purple-50 hover:bg-purple-100/70 flex items-center justify-between gap-2 transition-colors">
                          <button
                            type="button"
                            onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <select
                              value={q.type}
                              onChange={(e) => handleChangeQuestionType(idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-purple-300 text-purple-900 cursor-pointer outline-none shrink-0"
                            >
                              <option value="multiple_choice">TN nhiều lựa chọn</option>
                              <option value="true_false">TN đúng sai</option>
                              <option value="short_answer">Điền ngắn</option>
                              <option value="essay">Tự luận</option>
                            </select>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {tfQ.question}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (questions.length <= 1) {
                                  alert('Đề thi phải có ít nhất 1 câu hỏi!');
                                  return;
                                }
                                setQuestions(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa câu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                              className="p-1 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-3 border-t border-purple-200 bg-white">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Đoạn văn dẫn / Tình huống:</label>
                              <textarea
                                rows={2}
                                value={tfQ.question}
                                onChange={(e) => {
                                  setQuestions(prev => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], question: e.target.value } as TrueFalseQuestion;
                                    return next;
                                  });
                                }}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
                              />
                            </div>

                            {/* Ảnh minh họa cho câu hỏi Đúng / Sai */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-purple-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Ảnh minh họa (sơ đồ, hình vẽ tình huống):</span>
                                </span>
                                {tfQ.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuestions(prev => {
                                        const next = [...prev];
                                        next[idx] = { ...next[idx], imageUrl: undefined } as TrueFalseQuestion;
                                        return next;
                                      });
                                    }}
                                    className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                                  >
                                    ✕ Xóa ảnh
                                  </button>
                                )}
                              </div>

                              {tfQ.imageUrl ? (
                                <div className="relative group max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-2">
                                  <img src={tfQ.imageUrl} alt="Minh họa" className="max-h-44 max-w-full object-contain mx-auto" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-purple-200 transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Tải ảnh minh họa từ máy</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const optimized = await compressAndOptimizeImage(file);
                                          setQuestions(prev => {
                                            const next = [...prev];
                                            next[idx] = { ...next[idx], imageUrl: optimized } as TrueFalseQuestion;
                                            return next;
                                          });
                                        }
                                      }}
                                    />
                                  </label>
                                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block font-bold text-slate-700">
                                4 Phát biểu a, b, c, d (Click nút Đúng/Sai để đổi):
                              </label>
                              {tfQ.statements.map((stmt, sIdx) => (
                                <div key={stmt.subId} className="flex items-center gap-2">
                                  <span className="font-bold text-purple-900 w-5 text-center uppercase">
                                    {stmt.subId})
                                  </span>
                                  <input
                                    type="text"
                                    value={stmt.text}
                                    onChange={(e) => handleUpdateTFText(idx, sIdx, e.target.value)}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateTF(idx, sIdx, !stmt.isCorrect)}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                                      stmt.isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-rose-600 text-white'
                                    }`}
                                  >
                                    {stmt.isCorrect ? 'Đúng' : 'Sai'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (q.type === 'short_answer') {
                    const saQ = q as ShortAnswerQuestion;
                    return (
                      <div key={q.id} className="border border-amber-200 rounded-xl overflow-hidden bg-white">
                        <div className="w-full px-4 py-2.5 bg-amber-50 hover:bg-amber-100/70 flex items-center justify-between gap-2 transition-colors">
                          <button
                            type="button"
                            onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <select
                              value={q.type}
                              onChange={(e) => handleChangeQuestionType(idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-amber-300 text-amber-900 cursor-pointer outline-none shrink-0"
                            >
                              <option value="multiple_choice">TN nhiều lựa chọn</option>
                              <option value="true_false">TN đúng sai</option>
                              <option value="short_answer">Điền ngắn</option>
                              <option value="essay">Tự luận</option>
                            </select>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {saQ.question}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (questions.length <= 1) {
                                  alert('Đề thi phải có ít nhất 1 câu hỏi!');
                                  return;
                                }
                                setQuestions(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa câu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                              className="p-1 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-3 border-t border-amber-200 bg-white">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi bài toán:</label>
                              <textarea
                                rows={2}
                                value={saQ.question}
                                onChange={(e) => {
                                  setQuestions(prev => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], question: e.target.value } as ShortAnswerQuestion;
                                    return next;
                                  });
                                }}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
                              />
                            </div>

                            {/* Ảnh minh họa cho câu hỏi Trả lời ngắn */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-amber-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Ảnh minh họa bài toán (hình vẽ, sơ đồ thí nghiệm):</span>
                                </span>
                                {saQ.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuestions(prev => {
                                        const next = [...prev];
                                        next[idx] = { ...next[idx], imageUrl: undefined } as ShortAnswerQuestion;
                                        return next;
                                      });
                                    }}
                                    className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                                  >
                                    ✕ Xóa ảnh
                                  </button>
                                )}
                              </div>

                              {saQ.imageUrl ? (
                                <div className="relative group max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-2">
                                  <img src={saQ.imageUrl} alt="Minh họa" className="max-h-44 max-w-full object-contain mx-auto" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-amber-200 transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Tải ảnh minh họa từ máy</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const optimized = await compressAndOptimizeImage(file);
                                          setQuestions(prev => {
                                            const next = [...prev];
                                            next[idx] = { ...next[idx], imageUrl: optimized } as ShortAnswerQuestion;
                                            return next;
                                          });
                                        }
                                      }}
                                    />
                                  </label>
                                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                                </div>
                              )}
                            </div>

                            {saQ.blanks && saQ.blanks.length > 0 ? (
                              <div className="space-y-2">
                                <label className="block font-bold text-slate-700">
                                  2 Chỗ điền số (mỗi chỗ 0.5 điểm):
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {saQ.blanks.map((b, bIdx) => (
                                    <div key={b.id || bIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                                      <span className="font-bold text-[11px] text-slate-700">
                                        {b.label || `Chỗ điền (${bIdx + 1})`}:
                                      </span>
                                      <input
                                        type="text"
                                        value={b.acceptableAnswers.join('; ')}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const answers = val.split(/[;|]+/).map(s => s.trim()).filter(Boolean);
                                          setQuestions(prev => {
                                            const next = [...prev];
                                            const targetQ = { ...(next[idx] as ShortAnswerQuestion) };
                                            const targetBlanks = [...(targetQ.blanks || [])];
                                            targetBlanks[bIdx] = { ...targetBlanks[bIdx], acceptableAnswers: answers.length > 0 ? answers : [val] };
                                            targetQ.blanks = targetBlanks;
                                            targetQ.acceptableAnswers = targetBlanks.flatMap(tb => tb.acceptableAnswers);
                                            next[idx] = targetQ;
                                            return next;
                                          });
                                        }}
                                        placeholder="Ví dụ: 14,8; 14.8"
                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono font-bold"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                  Các đáp án chấp nhận đúng (ngăn cách bằng dấu phẩy):
                                </label>
                                <input
                                  type="text"
                                  value={saQ.acceptableAnswers.join(', ')}
                                  onChange={(e) => handleUpdateSA(idx, e.target.value)}
                                  placeholder="Ví dụ: 10, 10.0, 10,0"
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (q.type === 'essay') {
                    const essayQ = q as EssayQuestion;
                    return (
                      <div key={q.id} className="border border-indigo-200 rounded-xl overflow-hidden bg-white">
                        <div className="w-full px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100/70 flex items-center justify-between gap-2 transition-colors">
                          <button
                            type="button"
                            onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <select
                              value={q.type}
                              onChange={(e) => handleChangeQuestionType(idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-indigo-300 text-indigo-900 cursor-pointer outline-none shrink-0"
                            >
                              <option value="multiple_choice">TN nhiều lựa chọn</option>
                              <option value="true_false">TN đúng sai</option>
                              <option value="short_answer">Điền ngắn</option>
                              <option value="essay">Tự luận</option>
                            </select>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {essayQ.question}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (questions.length <= 1) {
                                  alert('Đề thi phải có ít nhất 1 câu hỏi!');
                                  return;
                                }
                                setQuestions(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa câu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                              className="p-1 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-3 border-t border-indigo-200 bg-white">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi tự luận:</label>
                              <textarea
                                rows={3}
                                value={essayQ.question}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setQuestions(prev => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], question: text } as EssayQuestion;
                                    return next;
                                  });
                                }}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                                placeholder="Nhập nội dung câu hỏi tự luận..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Điểm số câu này:</label>
                                <input
                                  type="number"
                                  step="0.25"
                                  min="0.25"
                                  max="5"
                                  value={essayQ.points ?? 1.0}
                                  onChange={(e) => {
                                    const pts = parseFloat(e.target.value) || 1.0;
                                    setQuestions(prev => {
                                      const next = [...prev];
                                      next[idx] = { ...next[idx], points: pts } as EssayQuestion;
                                      return next;
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">Thang điểm chi tiết:</label>
                                <input
                                  type="text"
                                  value={essayQ.gradingGuide || ''}
                                  onChange={(e) => {
                                    const guide = e.target.value;
                                    setQuestions(prev => {
                                      const next = [...prev];
                                      next[idx] = { ...next[idx], gradingGuide: guide } as EssayQuestion;
                                      return next;
                                    });
                                  }}
                                  placeholder="VD: Ý 1 (0.5đ), ý 2 (0.5đ)..."
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Đáp án mẫu / Hướng dẫn giải:</label>
                              <textarea
                                rows={2}
                                value={essayQ.sampleAnswer || ''}
                                onChange={(e) => {
                                  const ans = e.target.value;
                                  setQuestions(prev => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], sampleAnswer: ans } as EssayQuestion;
                                    return next;
                                  });
                                }}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                                placeholder="Nhập đáp án mẫu..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Add new question buttons (MCQ, TF, SA, Essay) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newQ: MultipleChoiceQuestion = {
                        id: `q_mcq_${Date.now()}`,
                        type: 'multiple_choice',
                        question: `Câu ${questions.length + 1}: Nhập nội dung câu hỏi trắc nghiệm mới...`,
                        options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
                        correctAnswer: 0,
                        explanation: 'Giải thích đáp án đúng...'
                      };
                      setQuestions(prev => {
                        const firstNonMcq = prev.findIndex(q => q.type !== 'multiple_choice');
                        if (firstNonMcq === -1) return [...prev, newQ];
                        const next = [...prev];
                        next.splice(firstNonMcq, 0, newQ);
                        return next;
                      });
                      setExpandedQId(newQ.id);
                    }}
                    className="py-2.5 border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50/60 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Câu Trắc Nghiệm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (questions.some(q => q.type === 'true_false')) {
                        alert('Mỗi đề kiểm tra thường xuyên chuẩn chỉ có tối đa 1 câu Đúng/Sai!');
                        return;
                      }
                      const newTf: TrueFalseQuestion = {
                        id: `q_tf_${Date.now()}`,
                        type: 'true_false',
                        question: `Câu ${questions.length + 1}: Cho các nhận định sau, chọn Đúng hoặc Sai:`,
                        statements: [
                          { subId: 'a', text: 'Nhận định a...', isCorrect: true },
                          { subId: 'b', text: 'Nhận định b...', isCorrect: false },
                          { subId: 'c', text: 'Nhận định c...', isCorrect: true },
                          { subId: 'd', text: 'Nhận định d...', isCorrect: false }
                        ],
                        explanation: 'Giải thích chi tiết 4 nhận định.'
                      };
                      setQuestions(prev => {
                        const saIdx = prev.findIndex(q => q.type === 'short_answer');
                        if (saIdx === -1) return [...prev, newTf];
                        const next = [...prev];
                        next.splice(saIdx, 0, newTf);
                        return next;
                      });
                      setExpandedQId(newTf.id);
                    }}
                    className="py-2.5 border-2 border-dashed border-purple-300 text-purple-700 hover:bg-purple-50/60 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Câu Đúng/Sai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (questions.some(q => q.type === 'short_answer')) {
                        alert('Mỗi đề kiểm tra thường xuyên chuẩn chỉ có tối đa 1 câu Điền ngắn (2 chỗ điền số)!');
                        return;
                      }
                      const newSa: ShortAnswerQuestion = {
                        id: `q_sa_${Date.now()}`,
                        type: 'short_answer',
                        question: `Câu ${questions.length + 1}: Tính toán và điền số vào 2 chỗ trống:`,
                        acceptableAnswers: ['10', '20'],
                        blanks: [
                          { id: '1', label: 'Chỗ điền (1)', acceptableAnswers: ['10'], unit: '', points: 0.5 },
                          { id: '2', label: 'Chỗ điền (2)', acceptableAnswers: ['20'], unit: '', points: 0.5 }
                        ],
                        explanation: 'Giải thích chi tiết 2 chỗ điền số.'
                      };
                      setQuestions(prev => [...prev, newSa]);
                      setExpandedQId(newSa.id);
                    }}
                    className="py-2.5 border-2 border-dashed border-amber-300 text-amber-800 hover:bg-amber-50/60 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Câu Điền Ngắn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newEssay: EssayQuestion = {
                        id: `q_essay_${Date.now()}`,
                        type: 'essay',
                        question: `Câu ${questions.length + 1} (Tự luận - 1,0 điểm): Nhập nội dung câu hỏi tự luận...`,
                        points: 1.0,
                        sampleAnswer: 'Hướng dẫn đáp án mẫu chi tiết...',
                        gradingGuide: 'Thang điểm chấm chi tiết...'
                      };
                      setQuestions(prev => [...prev, newEssay]);
                      setExpandedQId(newEssay.id);
                    }}
                    className="py-2.5 border-2 border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/60 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Câu Tự Luận</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white">
            <div className="text-[11px] text-slate-500">
              Chế độ hiện tại: <strong>{getFormattedSchedule()}</strong>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && onDelete && !isNew && (
                <button
                  type="button"
                  id="delete-exam-modal-btn"
                  onClick={() => {
                    const ok = window.confirm 
                      ? window.confirm(`Thầy/Cô có chắc chắn muốn xóa vĩnh viễn đề kiểm tra "${exam.title}" khỏi hệ thống không?`)
                      : true;
                    if (ok) {
                      onDelete(exam.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-rose-300 transition-colors cursor-pointer mr-2"
                  title="Xóa vĩnh viễn đề thi này"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa Đề Này</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isAdmin ? 'Hủy bỏ' : 'Đóng'}
              </button>
              {isAdmin && (
                <button
                  type="submit"
                  id="save-exam-btn"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNew ? '+ Tạo & Lưu Đề Kiểm Tra Mới' : 'Lưu Thay Đổi Đề Thi'}</span>
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
