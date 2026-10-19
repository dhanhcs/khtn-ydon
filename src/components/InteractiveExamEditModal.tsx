import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { InteractiveLessonExam, MultipleChoiceQuestion, GradeLevel, SubjectType } from '../types';

interface InteractiveExamEditModalProps {
  isOpen: boolean;
  exam: InteractiveLessonExam;
  onClose: () => void;
  onSaveUpdatedExam: (updatedExam: InteractiveLessonExam) => void;
}

export function InteractiveExamEditModal({
  isOpen,
  exam,
  onClose,
  onSaveUpdatedExam
}: InteractiveExamEditModalProps) {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = useState<string>(exam.title);
  const [lessonTitle, setLessonTitle] = useState<string>(exam.lessonTitle);
  const [lessonCode, setLessonCode] = useState<string>(exam.lessonCode || '');
  const [grade, setGrade] = useState<GradeLevel>(exam.grade);
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(exam.subject);
  const [durationMinutes, setDurationMinutes] = useState<number>(exam.durationMinutes || 10);

  // Questions state
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>(
    JSON.parse(JSON.stringify(exam.questions || []))
  );

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Question editing handlers
  const handleUpdateQuestion = (idx: number, field: keyof MultipleChoiceQuestion, value: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const handleAddQuestion = () => {
    const newQ: MultipleChoiceQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      type: 'multiple_choice',
      question: `Câu ${questions.length + 1}: Nội dung câu hỏi mới...`,
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Giải thích chi tiết cho câu hỏi này.'
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('Đề tương tác cần có ít nhất 1 câu hỏi.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title.trim() || !lessonTitle.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề đề thi và tên bài học.');
      return;
    }

    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất một câu hỏi vào đề.');
      return;
    }

    const updated: InteractiveLessonExam = {
      ...exam,
      title: title.trim(),
      lessonTitle: lessonTitle.trim(),
      lessonCode: lessonCode.trim() || undefined,
      grade,
      subject,
      durationMinutes,
      questions
    };

    onSaveUpdatedExam(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sliders className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                  QUẢN TRỊ VIÊN
                </span>
                <span className="text-xs text-indigo-200">Chỉnh sửa đề tương tác</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Xem & Chỉnh Sửa Đề Tương Tác: {exam.lessonCode || exam.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1 rounded-xl flex items-center text-xs font-bold border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước ({questions.length} câu)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* General Metadata Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Thông tin chung của bài học & đề thi:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {[6, 7, 8, 9].map((g) => (
                    <option key={g} value={g}>Khối {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân môn:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="physics">Vật lí</option>
                  <option value="chemistry">Hóa học</option>
                  <option value="biology">Sinh học</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (phút):</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 10)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã bài học (ví dụ: Bài 15):</label>
                <input
                  type="text"
                  value={lessonCode}
                  onChange={(e) => setLessonCode(e.target.value)}
                  placeholder="Bài 15..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Tên bài học chuẩn:</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề đề tương tác hiển thị:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
              />
            </div>
          </div>

          {/* EDIT QUESTIONS TAB */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-800">
                  Danh sách câu hỏi trắc nghiệm ({questions.length} câu):
                </h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm câu hỏi mới</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div 
                    key={q.id || qIdx} 
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 relative hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        Câu {qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Nội dung câu hỏi:</label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                      />
                    </div>

                    {/* Options A, B, C, D */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                        <div key={letter} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="flex items-center gap-1 cursor-pointer font-black text-slate-800 shrink-0">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', optIdx)}
                              className="accent-emerald-600 cursor-pointer"
                            />
                            <span className={q.correctAnswer === optIdx ? 'text-emerald-700 font-extrabold' : ''}>
                              {letter}.
                            </span>
                          </label>
                          <input
                            type="text"
                            value={q.options[optIdx] || ''}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            className="flex-1 p-1 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Lời giải thích chi tiết:</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                        placeholder="Giải thích vì sao chọn đáp án này..."
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none"
                      />
                    </div>

                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold rounded-xl text-xs inline-flex items-center gap-2 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm câu hỏi tiếp theo</span>
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-bold">
                Xem trước giao diện đề tương tác với {questions.length} câu hỏi:
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 text-xs">
                    <p className="font-bold text-slate-900 text-sm">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            q.correctAnswer === oIdx 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span>{opt}</span>
                          {q.correctAnswer === oIdx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                        💡 Giải thích: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? 'Đã lưu thay đổi!' : 'Lưu Cập Nhật Đề Tương Tác'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
