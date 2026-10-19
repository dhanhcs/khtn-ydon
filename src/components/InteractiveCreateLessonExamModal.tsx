import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Sliders, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import mammoth from 'mammoth';
import { InteractiveLessonExam, MultipleChoiceQuestion, ShortAnswerQuestion, EssayQuestion, GradeLevel, SubjectType } from '../types';
import { 
  generateNativeDocxExamTemplateBlob, 
  generateExamWordTemplateBlob, 
  downloadBlob 
} from '../utils/wordExportUtils';
import { extractTextFromExamFile, parseExamContentText } from '../utils/examFileParser';

interface InteractiveCreateLessonExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (exam: InteractiveLessonExam) => void;
  initialSubject?: SubjectType;
  initialGrade?: string;
}

export function InteractiveCreateLessonExamModal({
  isOpen,
  onClose,
  onSaveExam,
  initialSubject = 'all',
  initialGrade = 'all'
}: InteractiveCreateLessonExamModalProps) {
  const [activeMethod, setActiveMethod] = useState<'manual' | 'ai' | 'upload_file'>('ai');

  // Metadata
  const [lessonTitle, setLessonTitle] = useState<string>('Bài 15: Áp suất chất lỏng - Lực đẩy Archimedes');
  const [title, setTitle] = useState<string>('Đề Tương Tác Nhóm: Bài 15 - Áp suất chất lỏng & Lực đẩy Archimedes');
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(
    initialSubject !== 'all' ? (initialSubject as 'physics' | 'chemistry' | 'biology') : 'physics'
  );
  const [grade, setGrade] = useState<GradeLevel>(
    initialGrade !== 'all' ? (Number(initialGrade) as GradeLevel) : 8
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

  // AI Generation State
  const [aiTopic, setAiTopic] = useState<string>('Áp suất chất lỏng và lực đẩy Archimedes');
  const [aiCount, setAiCount] = useState<number>(10);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual questions state
  const [manualQuestions, setManualQuestions] = useState<MultipleChoiceQuestion[]>([
    {
      id: `manual_q_1`,
      type: 'multiple_choice',
      question: 'Công thức tính lực đẩy Archimedes tác dụng lên một vật chìm trong chất lỏng là:',
      options: ['F_A = d . V', 'F_A = p . S', 'F_A = m . g', 'F_A = d / V'],
      correctAnswer: 0,
      explanation: 'F_A = d . V (d là trọng lượng riêng chất lỏng, V là thể tích phần chất lỏng bị chiếm chỗ).'
    },
    {
      id: `manual_q_2`,
      type: 'multiple_choice',
      question: 'Khi một vật nổi trên mặt nước, độ lớn của lực đẩy Archimedes bằng:',
      options: [
        'Trọng lượng P của vật',
        'Lớn hơn trọng lượng P của vật',
        'Nhỏ hơn trọng lượng P của vật',
        'Bằng không'
      ],
      correctAnswer: 0,
      explanation: 'Khi vật nổi cân bằng thì F_A = P.'
    }
  ]);

  // File Upload State
  const [uploadedQuestions, setUploadedQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Download Word template (.docx / .doc)
  const handleDownloadTemplate = async () => {
    try {
      const blob = await generateNativeDocxExamTemplateBlob(subject);
      downloadBlob(blob, `Mau_De_Tuong_Tac_Bai_Hoc_${subject}.docx`);
    } catch {
      const blob = generateExamWordTemplateBlob(subject);
      downloadBlob(blob, `Mau_De_Tuong_Tac_Bai_Hoc_${subject}.doc`);
    }
  };

  // AI Generation
  const handleGenerateWithAI = async () => {
    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/create-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${lessonTitle} - ${aiTopic}`,
          grade,
          subject,
          testNumber: 'Tương tác nhóm',
          durationMinutes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.exam) {
        throw new Error(data.error || 'Không thể tạo đề bằng AI.');
      }

      const rawQuestions = data.exam.questions || [];
      const mcqs: MultipleChoiceQuestion[] = rawQuestions.filter((q: any) => q.type === 'multiple_choice');

      if (mcqs.length > 0) {
        setManualQuestions(mcqs.slice(0, aiCount));
        setActiveMethod('manual');
      } else {
        throw new Error('AI không tạo được câu hỏi trắc nghiệm hợp lệ.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi kết nối với máy chủ AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle File Upload (.docx / .doc / .txt)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccessInfo(null);

    try {
      const text = await extractTextFromExamFile(file);
      const result = parseExamContentText(text);

      if (result.questions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi nào trong file Word. Vui lòng tải file mẫu để xem cấu trúc chuẩn.');
      }

      // Convert questions to MultipleChoiceQuestion format needed for interactive lesson
      const mcqs: MultipleChoiceQuestion[] = result.questions.map((q, idx) => {
        if (q.type === 'multiple_choice') {
          return q;
        }
        if (q.type === 'true_false') {
          return {
            id: q.id,
            type: 'multiple_choice' as const,
            question: q.question,
            options: [
              `a) ${q.statements[0]?.text || ''} (${q.statements[0]?.isCorrect ? 'Đúng' : 'Sai'})`,
              `b) ${q.statements[1]?.text || ''} (${q.statements[1]?.isCorrect ? 'Đúng' : 'Sai'})`,
              `c) ${q.statements[2]?.text || ''} (${q.statements[2]?.isCorrect ? 'Đúng' : 'Sai'})`,
              `d) ${q.statements[3]?.text || ''} (${q.statements[3]?.isCorrect ? 'Đúng' : 'Sai'})`
            ],
            correctAnswer: 0,
            explanation: q.explanation || 'Câu hỏi Đúng/Sai từ đề kiểm tra.'
          };
        }
        if (q.type === 'short_answer') {
          const saQ = q as ShortAnswerQuestion;
          return {
            id: saQ.id,
            type: 'multiple_choice' as const,
            question: saQ.question,
            options: [
              `Đáp án 1: ${saQ.blanks?.[0]?.acceptableAnswers[0] || '10'}`,
              `Đáp án 2: ${saQ.blanks?.[1]?.acceptableAnswers[0] || '20'}`,
              'Phương án khác',
              'Không xác định'
            ],
            correctAnswer: 0,
            explanation: saQ.explanation || 'Câu hỏi Trả lời ngắn từ đề kiểm tra.'
          };
        }
        // essay
        const essayQ = q as EssayQuestion;
        return {
          id: essayQ.id,
          type: 'multiple_choice' as const,
          question: essayQ.question,
          options: [
            essayQ.sampleAnswer || 'Đáp án mẫu tự luận 1',
            'Phương án B',
            'Phương án C',
            'Phương án D'
          ],
          correctAnswer: 0,
          explanation: essayQ.gradingGuide || essayQ.sampleAnswer || 'Câu hỏi tự luận.'
        };
      });

      setUploadedQuestions(mcqs);
      setUploadSuccessInfo(`Đã bóc tách thành công ${mcqs.length} câu hỏi từ file Word (${result.summary.mcqCount} trắc nghiệm, ${result.summary.tfCount} đúng/sai, ${result.summary.saCount} điền số)!`);
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi đọc file Word.');
    } finally {
      e.target.value = '';
    }
  };

  const handleFinalSave = () => {
    let finalQuestions: MultipleChoiceQuestion[] = [];
    if (activeMethod === 'upload_file') {
      if (uploadedQuestions.length === 0) {
        alert('Chưa có câu hỏi nào được nạp từ file Word!');
        return;
      }
      finalQuestions = uploadedQuestions;
    } else {
      if (manualQuestions.length === 0) {
        alert('Vui lòng thêm ít nhất 1 câu hỏi trắc nghiệm!');
        return;
      }
      finalQuestions = manualQuestions;
    }

    const newExam: InteractiveLessonExam = {
      id: `lesson_exam_${Date.now()}`,
      lessonTitle: lessonTitle.trim(),
      lessonCode: lessonTitle.split(':')[0]?.trim() || 'Bài học',
      title: title.trim() || `Đề Tương Tác Nhóm: ${lessonTitle}`,
      subject,
      grade,
      durationMinutes,
      totalPoints: 10,
      questions: finalQuestions,
      createdAt: new Date().toISOString().substring(0, 10),
      createdBy: 'Giáo viên bộ môn KHTN'
    };

    onSaveExam(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Mục Hướng Dẫn Soạn Bài
                </span>
                <span className="text-xs text-indigo-200">
                  Tương Tác Danh Nghĩa 8 Nhóm
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Tạo Đề Tương Tác Theo Bài Học Mới
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-indigo-200 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Creation Mode Buttons (Tương tự như trong đề KTTX) */}
        <div className="bg-slate-100 p-2 sm:p-3 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMethod('ai')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMethod === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>1. Tạo tự động bằng AI Gemini</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('manual')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMethod === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Soạn thủ công theo bài học</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('upload_file')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMethod === 'upload_file'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Nạp từ file Word mẫu (.docx / .doc)</span>
          </button>
        </div>

        {/* Common Meta Inputs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên bài học (VD: Bài 15: Áp suất chất lỏng...):</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-600"
            />
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
            <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              {[6, 7, 8, 9].map(g => (
                <option key={g} value={g}>Khối {g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: AI GENERATION */}
          {activeMethod === 'ai' && (
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="font-black text-sm text-purple-950">
                  AI Gemini Soạn Đề Tương Tác Theo Bài Học Tự Động
                </h4>
              </div>
              <p className="text-purple-900 leading-relaxed">
                Hệ thống AI sẽ phân tích nội dung bài học trong chương trình GDPT 2018 và soạn bộ câu hỏi trắc nghiệm tương tác sinh động cho 8 nhóm học sinh.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề trọng tâm bài học:</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ví dụ: Áp suất chất lỏng và lực đẩy Archimedes..."
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng câu hỏi:</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value={6}>6 câu (Khởi động nhanh)</option>
                    <option value={10}>10 câu (Tiêu chuẩn bài học)</option>
                    <option value={15}>15 câu (Luyện tập chuyên sâu)</option>
                  </select>
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isAiLoading}
                onClick={handleGenerateWithAI}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI Đang Soạn Đề Tương Tác Cho Bài Học...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Bấm Để AI Soạn Đề & Chuyển Sang Xem Lại</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: MANUAL EDITING */}
          {activeMethod === 'manual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700">
                  Danh sách {manualQuestions.length} câu hỏi trắc nghiệm:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newQ: MultipleChoiceQuestion = {
                      id: `manual_q_${Date.now()}`,
                      type: 'multiple_choice',
                      question: `Câu ${manualQuestions.length + 1}: Điền câu hỏi ở đây...`,
                      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
                      correctAnswer: 0,
                      explanation: 'Giải thích đáp án đúng...'
                    };
                    setManualQuestions(prev => [...prev, newQ]);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Câu Hỏi Mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {manualQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-indigo-900">Câu {qIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setManualQuestions(prev => prev.filter((_, i) => i !== qIdx))}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded cursor-pointer"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, question: val } : item));
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-800"
                    />

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl border flex items-center gap-2 ${
                              isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={isCorrect}
                              onChange={() => {
                                setManualQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, correctAnswer: optIdx } : item));
                              }}
                              className="accent-emerald-600 cursor-pointer"
                            />
                            <span className="font-black text-slate-600">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setManualQuestions(prev => prev.map((item, i) => {
                                  if (i !== qIdx) return item;
                                  const newOpts = [...item.options] as [string, string, string, string];
                                  newOpts[optIdx] = val;
                                  return { ...item, options: newOpts };
                                }));
                              }}
                              className="flex-1 bg-transparent outline-none font-medium text-slate-800"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORD FILE UPLOAD */}
          {activeMethod === 'upload_file' && (
            <div className="p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                    W
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-blue-950">
                      Tạo Đề Từ File Mẫu Microsoft Word (.docx / .doc)
                    </h4>
                    <p className="text-[11px] text-blue-700">
                      Tải mẫu Word về soạn thảo trên máy rồi tải lên hệ thống
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File Mẫu Word Chuẩn (.doc)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-blue-300 rounded-2xl bg-white/80 text-center space-y-2 relative shadow-2xs">
                <input
                  type="file"
                  accept=".docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-black text-lg">
                  W
                </div>
                <p className="text-xs font-black text-slate-800">
                  Bấm để chọn file Word (.docx, .doc) hoặc kéo thả vào đây
                </p>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ định dạng Microsoft Word chuẩn (.docx, .doc)
                </p>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessInfo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessInfo}</span>
                </div>
              )}
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
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleFinalSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu & Tạo Đề Tương Tác Bài Học</span>
          </button>
        </div>

      </div>
    </div>
  );
}
