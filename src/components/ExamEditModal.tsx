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
  ChevronUp
} from 'lucide-react';
import { 
  Exam, 
  GradeLevel, 
  SubjectType, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion,
  ExamQuestion 
} from '../types';

interface ExamEditModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExam: Exam) => void;
}

export function ExamEditModal({ exam, isOpen, onClose, onSave }: ExamEditModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  // Form states
  const [title, setTitle] = useState(exam.title);
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(exam.subject);
  const [grade, setGrade] = useState<GradeLevel>(exam.grade);
  const [testNumber, setTestNumber] = useState<'TX1' | 'TX2' | 'TX3' | 'TX4'>(exam.testNumber || 'TX1');
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 15);
  const [isActive, setIsActive] = useState(exam.isActive ?? true);
  
  // 2 Opening Modes (No passwords)
  // Mode 1: Mọi lúc (HS làm bài lúc nào cũng được)
  // Mode 2: Ấn định ngày mở (Quản trị đặt ngày, tháng, năm, giờ, phút, giây)
  const [mode, setMode] = useState<'mode_1' | 'mode_2'>(exam.mode || 'mode_1');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedOpenAt = mode === 'mode_2' ? `${openDate}T${openTime || '00:00:00'}` : undefined;

    const updatedExam: Exam = {
      ...exam,
      title: title.trim() || exam.title,
      subject,
      grade,
      testNumber,
      durationMinutes: Number(durationMinutes) || 15,
      isActive,
      mode,
      openAt: combinedOpenAt,
      openTime: combinedOpenAt,
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
                Chỉnh Sửa Đề Kiểm Tra
              </h3>
              <p className="text-[11px] text-sky-200">
                Mã đề: <span className="font-mono">{exam.id}</span> • Phân môn: {subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
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
                  placeholder="Ví dụ: KTTX Số 1 - Vật lí 8: Áp suất chất lỏng..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Grid 4 thông số: Phân môn, Khối lớp, Bài kiểm tra, Thời lượng */}
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
                  <label className="block font-bold text-slate-700 mb-1">Bài kiểm tra:</label>
                  <select
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    <option value="TX1">KTTX Số 1</option>
                    <option value="TX2">KTTX Số 2</option>
                    <option value="TX3">KTTX Số 3</option>
                    <option value="TX4">KTTX Số 4</option>
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

                {/* 2 Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Chế độ 1: Mọi lúc */}
                  <label
                    onClick={() => setMode('mode_1')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      mode === 'mode_1'
                        ? 'border-blue-600 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="exam_mode"
                        checked={mode === 'mode_1'}
                        onChange={() => setMode('mode_1')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-black text-slate-900 text-xs sm:text-[13px]">
                          Chế độ 1: Mọi lúc
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Học sinh có thể vào làm bài lúc nào cũng được (tự do ôn luyện, kiểm tra thường xuyên).
                        </div>
                      </div>
                    </div>
                    {mode === 'mode_1' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                        ✓ Đang chọn: Mở tự do mọi lúc
                      </span>
                    )}
                  </label>

                  {/* Chế độ 2: Ấn định ngày mở */}
                  <label
                    onClick={() => setMode('mode_2')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      mode === 'mode_2'
                        ? 'border-blue-600 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="exam_mode"
                        checked={mode === 'mode_2'}
                        onChange={() => setMode('mode_2')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-black text-slate-900 text-xs sm:text-[13px]">
                          Chế độ 2: Ấn định ngày mở
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Quản trị tự đặt ngày, tháng, năm, giờ, phút, giây bắt đầu làm bài.
                        </div>
                      </div>
                    </div>
                    {mode === 'mode_2' && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                        ✓ Đang chọn: Ấn định thời gian mở
                      </span>
                    )}
                  </label>
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
                        <button
                          type="button"
                          onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                          className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-left transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0">
                              [Trắc nghiệm 4 lựa chọn - 0.5đ]
                            </span>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {mcq.question}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

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
                        <button
                          type="button"
                          onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                          className="w-full px-4 py-2.5 bg-purple-50 hover:bg-purple-100/70 flex items-center justify-between cursor-pointer text-left transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 shrink-0">
                              [Đúng / Sai 4 ý - 1.0đ]
                            </span>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {tfQ.question}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
                        </button>

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
                        <button
                          type="button"
                          onClick={() => setExpandedQId(isExpanded ? '' : q.id)}
                          className="w-full px-4 py-2.5 bg-amber-50 hover:bg-amber-100/70 flex items-center justify-between cursor-pointer text-left transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-600 text-white shrink-0">
                              Câu {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 shrink-0">
                              [Trả lời ngắn - 1.0đ]
                            </span>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {saQ.question}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                        </button>

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
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white">
            <div className="text-[11px] text-slate-500">
              Chế độ hiện tại: <strong>{getFormattedSchedule()}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="save-exam-btn"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi Đề Thi</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
