import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Trash2,
  Save,
  Sparkles,
  FileText,
  FileCode,
  Upload,
  Download,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Check,
  ToggleLeft,
  ToggleRight,
  ListOrdered,
  FileCheck,
} from 'lucide-react';
import {
  QuizItem,
  QuizQuestionMultipleChoice,
  QuizQuestionTrueFalse,
  QuizQuestionFillInBlank,
  QuizQuestionEssay,
} from '../types';
import {
  parseWordExamContent,
  extractTextFromDocxFile,
  downloadSampleWordTemplate,
  generateOfflineAiExam,
} from '../utils/examStorage';

interface ExamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: QuizItem | null;
  onSave: (exam: QuizItem) => void;
  initialMode?: 'edit' | 'manual' | 'ai' | 'word';
}

export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
  onSave,
  initialMode = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai' | 'word'>('manual');

  // Exam Basic Info Form
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Khối 9');
  const [topic, setTopic] = useState('Oxit, Axit, Bazơ, Muối');
  const [chapter, setChapter] = useState('Chương 1 - Các hợp chất vô cơ');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [targetClasses, setTargetClasses] = useState('Tất cả các lớp');
  const [status, setStatus] = useState<'published' | 'closed' | 'draft'>('published');
  const [isTimeRestricted, setIsTimeRestricted] = useState(false);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');

  // Questions State
  const [multipleChoice, setMultipleChoice] = useState<QuizQuestionMultipleChoice[]>([]);
  const [trueFalse, setTrueFalse] = useState<QuizQuestionTrueFalse[]>([]);
  const [fillInBlank, setFillInBlank] = useState<QuizQuestionFillInBlank[]>([]);
  const [essay, setEssay] = useState<QuizQuestionEssay[]>([]);

  // AI Generation States (Cách 2)
  const [aiGrade, setAiGrade] = useState('Khối 9');
  const [aiTopic, setAiTopic] = useState('Dung dịch & Nồng độ mol');
  const [aiDifficulty, setAiDifficulty] = useState('Vận dụng');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPreviewQuiz, setAiPreviewQuiz] = useState<QuizItem | null>(null);

  // Word Upload States (Cách 3)
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [wordPastedText, setWordPastedText] = useState('');
  const [isWordParsing, setIsWordParsing] = useState(false);
  const [wordParsedResult, setWordParsedResult] = useState<{
    count: number;
    title: string;
    questions: QuizQuestionMultipleChoice[];
    notice?: string;
  } | null>(null);

  // Error/Success state
  const [validationError, setValidationError] = useState('');

  // Initialize form when opening or editing
  useEffect(() => {
    if (!isOpen) return;

    if (examToEdit) {
      setTitle(examToEdit.title || '');
      setGrade(examToEdit.grade || 'Khối 9');
      setTopic(examToEdit.topic || '');
      setChapter(examToEdit.chapter || '');
      setDurationMinutes(examToEdit.durationMinutes || 45);
      setTargetClasses(examToEdit.targetClasses || 'Tất cả các lớp');
      setStatus(examToEdit.status || 'published');
      setIsTimeRestricted(!!examToEdit.isTimeRestricted);
      setOpenTime(examToEdit.openTime || '');
      setCloseTime(examToEdit.closeTime || '');

      setMultipleChoice(examToEdit.multipleChoice ? [...examToEdit.multipleChoice] : []);
      setTrueFalse(examToEdit.trueFalse ? [...examToEdit.trueFalse] : []);
      setFillInBlank(examToEdit.fillInBlank ? [...examToEdit.fillInBlank] : []);
      setEssay(examToEdit.essay ? [...examToEdit.essay] : []);

      setActiveTab('manual');
    } else {
      // New exam default
      setTitle('');
      setGrade('Khối 9');
      setTopic('Oxit, Axit, Bazơ, Muối');
      setChapter('Chương 1 - Hợp chất vô cơ');
      setDurationMinutes(45);
      setTargetClasses('Tất cả các lớp');
      setStatus('published');
      setIsTimeRestricted(false);
      setOpenTime('');
      setCloseTime('');

      setMultipleChoice([
        {
          id: 1,
          question: 'Dãy oxit nào sau đây đều tác dụng được với dung dịch axit clohidric HCl?',
          options: ['A. Na₂O, CuO, Fe₂O₃', 'B. CO₂, SO₂, P₂O₅', 'C. SO₃, SiO₂, N₂O₅', 'D. CO, NO, N₂O'],
          correctOptionIndex: 0,
          explanation: 'Oxit bazơ (Na₂O, CuO, Fe₂O₃) tác dụng với axit tạo thành muối và nước.',
          points: 0.25,
        },
      ]);
      setTrueFalse([]);
      setFillInBlank([]);
      setEssay([]);

      if (initialMode === 'ai') setActiveTab('ai');
      else if (initialMode === 'word') setActiveTab('word');
      else setActiveTab('manual');
    }

    setValidationError('');
    setAiPreviewQuiz(null);
    setWordParsedResult(null);
    setWordFile(null);
    setWordPastedText('');
  }, [isOpen, examToEdit, initialMode]);

  if (!isOpen) return null;

  // Question Management: Add
  const handleAddMultipleChoice = () => {
    const nextId = multipleChoice.length + 1;
    setMultipleChoice((prev) => [
      ...prev,
      {
        id: nextId,
        question: `Câu hỏi trắc nghiệm số ${nextId}...`,
        options: [
          'A. Phương án A',
          'B. Phương án B',
          'C. Phương án C',
          'D. Phương án D',
        ],
        correctOptionIndex: 0,
        explanation: '',
        points: 0.25,
      },
    ]);
  };

  const handleAddTrueFalse = () => {
    const nextId = (multipleChoice.length || 0) + trueFalse.length + 1;
    setTrueFalse((prev) => [
      ...prev,
      {
        id: nextId,
        scenario: 'Tình huống thí nghiệm hóa học...',
        statements: [
          { label: 'a', text: 'Nhận định a...', isCorrect: true },
          { label: 'b', text: 'Nhận định b...', isCorrect: false },
          { label: 'c', text: 'Nhận định c...', isCorrect: true },
          { label: 'd', text: 'Nhận định d...', isCorrect: false },
        ],
        explanation: '',
      },
    ]);
  };

  const handleAddFillInBlank = () => {
    const nextId = (multipleChoice.length || 0) + trueFalse.length + fillInBlank.length + 1;
    setFillInBlank((prev) => [
      ...prev,
      {
        id: nextId,
        text: 'Nhiệt phân hoàn toàn m gam CaCO₃ thu được [blank1] gam CaO và [blank2] lít khí CO₂ ở đktc.',
        blanks: [
          { index: 1, answer: '56', unit: 'gam' },
          { index: 2, answer: '22.4', unit: 'lít' },
        ],
        explanation: '',
      },
    ]);
  };

  const handleAddEssay = () => {
    const nextId = essay.length + 1;
    setEssay((prev) => [
      ...prev,
      {
        id: nextId,
        question: `Bài toán tự luận số ${nextId}: Hòa tan hoàn toàn kim loại vào dung dịch axit...`,
        solutionGuide: 'Phương trình phản ứng: ... Tính toán số mol: ...',
        points: 1.0,
      },
    ]);
  };

  // Question Management: Delete
  const handleDeleteMultipleChoice = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu trắc nghiệm này?')) {
      setMultipleChoice((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteTrueFalse = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu Đúng/Sai này?')) {
      setTrueFalse((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteFillInBlank = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu Điền số này?')) {
      setFillInBlank((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteEssay = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu tự luận này?')) {
      setEssay((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Save Final Exam
  const handleSaveExam = () => {
    if (!title.trim()) {
      setValidationError('Vui lòng nhập Tiêu đề đề thi.');
      return;
    }

    if (multipleChoice.length === 0 && essay.length === 0 && trueFalse.length === 0 && fillInBlank.length === 0) {
      setValidationError('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }

    const examData: QuizItem = {
      id: examToEdit?.id || 'quiz-' + Date.now(),
      title: title.trim(),
      grade,
      topic: topic.trim() || 'Hóa học THCS',
      chapter: chapter.trim(),
      durationMinutes: Number(durationMinutes) || 45,
      totalPoints: 10,
      status,
      targetClasses: targetClasses.trim() || 'Tất cả các lớp',
      openTime: isTimeRestricted ? openTime : '',
      closeTime: isTimeRestricted ? closeTime : '',
      isTimeRestricted,
      multipleChoice,
      trueFalse,
      fillInBlank,
      essay,
      createdAt: examToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(examData);
    onClose();
  };

  // AI Generator Action (Cách 2)
  const handleGenerateWithAi = async () => {
    setIsAiLoading(true);
    setValidationError('');
    try {
      const res = await fetch('/api/gemini/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: aiGrade,
          topic: aiTopic,
          difficulty: aiDifficulty,
        }),
      });

      if (!res.ok) {
        throw new Error('API server không phản hồi, đang chuyển sang bộ sinh dự phòng.');
      }

      const data = await res.json();
      const generated: QuizItem = {
        id: 'quiz-ai-' + Date.now(),
        title: data.title || `Đề Kiểm Tra Hóa Học ${aiGrade} - ${aiTopic}`,
        grade: aiGrade,
        topic: aiTopic,
        chapter: `Chuyên đề ${aiTopic}`,
        durationMinutes: data.durationMinutes || 45,
        totalPoints: 10,
        status: 'published',
        targetClasses: `Các lớp ${aiGrade}`,
        openTime: '',
        closeTime: '',
        isTimeRestricted: false,
        createdAt: new Date().toISOString(),
        multipleChoice: data.multipleChoice || [],
        trueFalse: data.trueFalse || [],
        fillInBlank: data.fillInBlank || [],
        essay: data.essay || [],
      };

      setAiPreviewQuiz(generated);
    } catch (err: any) {
      console.warn('Fallback to offline chemistry generator:', err);
      // Fallback to client-side generator
      const fallbackExam = generateOfflineAiExam(aiGrade, aiTopic, aiDifficulty);
      setAiPreviewQuiz(fallbackExam);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiQuiz = () => {
    if (!aiPreviewQuiz) return;
    setTitle(aiPreviewQuiz.title);
    setGrade(aiPreviewQuiz.grade);
    setTopic(aiPreviewQuiz.topic);
    setChapter(aiPreviewQuiz.chapter || '');
    setDurationMinutes(aiPreviewQuiz.durationMinutes);
    setMultipleChoice(aiPreviewQuiz.multipleChoice || []);
    setTrueFalse(aiPreviewQuiz.trueFalse || []);
    setFillInBlank(aiPreviewQuiz.fillInBlank || []);
    setEssay(aiPreviewQuiz.essay || []);
    setActiveTab('manual');
  };

  // Word Parser Action (Cách 3)
  const handleParseWord = async () => {
    setIsWordParsing(true);
    setValidationError('');
    try {
      let rawText = wordPastedText;

      if (wordFile) {
        if (wordFile.name.endsWith('.docx')) {
          rawText = await extractTextFromDocxFile(wordFile);
        } else {
          rawText = await wordFile.text();
        }
      }

      if (!rawText.trim()) {
        setValidationError('Vui lòng chọn file .docx / .txt hoặc dán nội dung đề thi từ Word vào ô bên dưới.');
        setIsWordParsing(false);
        return;
      }

      const parsed = parseWordExamContent(rawText);
      setWordParsedResult({
        count: parsed.multipleChoice.length,
        title: parsed.title,
        questions: parsed.multipleChoice,
        notice: parsed.unparsedNotice,
      });
    } catch (err: any) {
      setValidationError('Lỗi khi đọc file Word: ' + (err?.message || 'Định dạng không được hỗ trợ'));
    } finally {
      setIsWordParsing(false);
    }
  };

  const handleApplyWordQuiz = () => {
    if (!wordParsedResult || wordParsedResult.questions.length === 0) return;
    setTitle(wordParsedResult.title || 'Đề thi nhập từ file Word');
    setMultipleChoice(wordParsedResult.questions);
    setActiveTab('manual');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Title & 3 Modes */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 text-amber-300 text-[11px] font-bold border border-red-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Khu vực Quản trị viên: Soạn & Chỉnh sửa Đề thi
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              {examToEdit ? 'Chỉnh Sửa Đề Thi Đã Có' : 'Tạo Đề Thi Mới - 3 Cách Linh Hoạt'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Creation Mode Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center gap-2">
          {/* Tab 1: Tạo theo mẫu đúng cấu trúc */}
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Cách 1: Tạo theo mẫu đúng cấu trúc</span>
          </button>

          {/* Tab 2: AI tự tạo theo yêu cầu của GV */}
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cách 2: AI tự tạo theo yêu cầu của GV</span>
          </button>

          {/* Tab 3: Up file word theo mẫu file của app */}
          <button
            type="button"
            onClick={() => setActiveTab('word')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'word'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Cách 3: Up file Word theo mẫu của app</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* TAB 1: CẤU TRÚC VÀ CHỈNH SỬA TOÀN DIỆN */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              {/* Basic Exam Meta Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiêu đề đề kiểm tra / bài thi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Đề Kiểm Tra Khảo Sát Hóa Học 9 - Giữa Học Kỳ I"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Khối 8-9">Khối 8 - 9</option>
                    <option value="Bồi dưỡng HSG">Bồi dưỡng HSG Chuyên Hóa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề kiến thức</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Oxit, Axit, Bazơ, Muối..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (Phút)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp áp dụng</label>
                  <input
                    type="text"
                    value={targetClasses}
                    onChange={(e) => setTargetClasses(e.target.value)}
                    placeholder="H8.1, H9.1 hoặc Tất cả"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* KHÓA / MỞ THỜI GIAN KIỂM TRA (Requirement: Mở thời gian kiểm tra, đóng thời gian) */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Cài đặt Mở / Đóng Thời Gian Kiểm Tra
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Quy định trạng thái cho phép học sinh vào làm bài và nộp bài thi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'published'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      MỞ KIỂM TRA (Đang mở)
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('closed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'closed'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      ĐÓNG THỜI GIAN (Tạm khóa)
                    </button>
                  </div>
                </div>

                {/* Hẹn giờ mở và đóng tự động */}
                <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTimeRestricted}
                      onChange={(e) => setIsTimeRestricted(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Hẹn giờ mở và đóng bài thi tự động</span>
                  </label>

                  {isTimeRestricted && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 font-medium">Từ:</span>
                        <input
                          type="datetime-local"
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 font-medium">Đến:</span>
                        <input
                          type="datetime-local"
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PHẦN 1: CÂU HỎI TRẮC NGHIỆM (Requirement: Nút xóa, thêm từng câu) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      I
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Phần I: Câu hỏi Trắc nghiệm 4 lựa chọn ({multipleChoice.length} câu)
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMultipleChoice}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Thêm câu trắc nghiệm
                  </button>
                </div>

                {multipleChoice.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Câu {qIndex + 1}
                      </span>
                      {/* Nút xóa từng câu */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMultipleChoice(qIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer flex items-center gap-1 text-xs"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa câu này</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMultipleChoice((prev) =>
                          prev.map((item, idx) => (idx === qIndex ? { ...item, question: val } : item))
                        );
                      }}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-medium"
                    />

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOptionIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border transition ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-opt-${qIndex}`}
                              checked={isCorrect}
                              onChange={() => {
                                setMultipleChoice((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIndex ? { ...item, correctOptionIndex: optIdx } : item
                                  )
                                );
                              }}
                              className="w-3.5 h-3.5 text-emerald-600"
                              title="Chọn làm đáp án đúng"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                setMultipleChoice((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIndex ? { ...item, options: newOpts } : item
                                  )
                                );
                              }}
                              className="w-full bg-transparent border-0 focus:outline-none text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="pt-1">
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultipleChoice((prev) =>
                            prev.map((item, idx) => (idx === qIndex ? { ...item, explanation: val } : item))
                          );
                        }}
                        placeholder="Lời giải chi tiết / Phương trình hóa học..."
                        className="w-full px-2 py-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* PHẦN 2: CÂU HỎI ĐÚNG / SAI (Requirement: Nút xóa, thêm từng câu) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      II
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Phần II: Câu hỏi Đúng / Sai ({trueFalse.length} câu)
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTrueFalse}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Thêm câu Đúng/Sai
                  </button>
                </div>

                {trueFalse.map((tf, tfIndex) => (
                  <div
                    key={tfIndex}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        Câu Đúng/Sai {tfIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrueFalse(tfIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa câu này
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={tf.scenario}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTrueFalse((prev) =>
                          prev.map((item, idx) => (idx === tfIndex ? { ...item, scenario: val } : item))
                        );
                      }}
                      placeholder="Mô tả bối cảnh / Thí nghiệm..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />

                    <div className="space-y-1.5 text-xs">
                      {tf.statements.map((st, stIdx) => (
                        <div key={stIdx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="font-bold text-slate-700 uppercase">{st.label})</span>
                          <input
                            type="text"
                            value={st.text}
                            onChange={(e) => {
                              const newSts = [...tf.statements];
                              newSts[stIdx].text = e.target.value;
                              setTrueFalse((prev) =>
                                prev.map((item, idx) => (idx === tfIndex ? { ...item, statements: newSts } : item))
                              );
                            }}
                            className="flex-1 bg-transparent border-0 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSts = [...tf.statements];
                              newSts[stIdx].isCorrect = !newSts[stIdx].isCorrect;
                              setTrueFalse((prev) =>
                                prev.map((item, idx) => (idx === tfIndex ? { ...item, statements: newSts } : item))
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              st.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* PHẦN 3: CÂU HỎI TỰ LUẬN (Requirement: Nút xóa, thêm từng câu) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      III
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Phần III: Bài toán Tự luận ({essay.length} câu)
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEssay}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Thêm câu Tự luận
                  </button>
                </div>

                {essay.map((es, esIndex) => (
                  <div
                    key={esIndex}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Bài tự luận {esIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEssay(esIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa câu này
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={es.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEssay((prev) =>
                          prev.map((item, idx) => (idx === esIndex ? { ...item, question: val } : item))
                        );
                      }}
                      placeholder="Nội dung bài toán tự luận..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />

                    <textarea
                      rows={2}
                      value={es.solutionGuide}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEssay((prev) =>
                          prev.map((item, idx) => (idx === esIndex ? { ...item, solutionGuide: val } : item))
                        );
                      }}
                      placeholder="Hướng dẫn giải / Đáp số chi tiết..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CÁCH 2 - AI TỰ TẠO THEO YÊU CẦU CỦA GIÁO VIÊN */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-1 text-purple-900 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Cách 2: AI Gemini Tự Động Tạo Đề Hóa Học Theo Yêu Cầu</span>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Giáo viên chỉ cần chọn khối lớp, chuyên đề cần khảo sát và độ khó. Trợ lý AI sẽ tự động sinh đề thi chuẩn cấu trúc với công thức hóa học chính xác, đáp án và lời giải chi tiết.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Khối 8">Hóa học 8</option>
                    <option value="Khối 9">Hóa học 9</option>
                    <option value="Bồi dưỡng HSG">Bồi dưỡng HSG Hóa THCS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề kiểm tra</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Oxit, Axit, Bazơ, Muối..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ phân hóa</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Nhận biết - Thông hiểu">Nhận biết & Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng tiêu chuẩn</option>
                    <option value="Vận dụng cao">Vận dụng cao & HSG</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isAiLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAiLoading ? 'AI đang sinh đề thi Hóa học...' : 'Tạo Đề Thi Tự Động Bằng AI'}</span>
              </button>

              {/* AI Generated Preview */}
              {aiPreviewQuiz && (
                <div className="p-4 bg-white rounded-xl border-2 border-purple-300 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <div>
                      <span className="text-[10px] uppercase font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        Đề thi AI tạo thành công
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{aiPreviewQuiz.title}</h4>
                      <p className="text-xs text-slate-500">
                        {aiPreviewQuiz.multipleChoice.length} câu trắc nghiệm • {aiPreviewQuiz.essay.length} câu tự luận
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAiQuiz}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sử dụng & Chuyển sang chỉnh sửa</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs pr-2">
                    {aiPreviewQuiz.multipleChoice.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                        <strong className="text-blue-700">Câu {idx + 1}:</strong> {q.question}
                        <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                          Đáp án đúng: {q.options[q.correctOptionIndex]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CÁCH 3 - UP FILE WORD THEO MẪU CỦA APP */}
          {activeTab === 'word' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-1 text-emerald-900 font-extrabold text-sm">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Cách 3: Tải Lên File Word Theo Mẫu Chuẩn Của App</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Thầy cô có thể tải file mẫu Word (.docx / .txt) về máy để điền đề thi, sau đó tải lên hệ thống. Bộ phân tích tự động sẽ tách các câu hỏi và đáp án vào ngân hàng đề thi.
                </p>

                {/* Download Template Button */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={downloadSampleWordTemplate}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Tệp Mẫu Word (.txt / .docx) Của App Về Máy</span>
                  </button>
                </div>
              </div>

              {/* Upload Input Area */}
              <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-center">
                <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Chọn tệp Word (.docx, .doc, .txt) từ máy tính
                </p>
                <input
                  type="file"
                  accept=".docx,.doc,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setWordFile(f);
                  }}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
                {wordFile && (
                  <span className="mt-2 text-xs font-semibold text-emerald-700">
                    Đã chọn: {wordFile.name}
                  </span>
                )}
              </div>

              {/* Direct Paste Alternative */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hoặc sao chép & dán nội dung file Word vào đây:
                </label>
                <textarea
                  rows={6}
                  value={wordPastedText}
                  onChange={(e) => setWordPastedText(e.target.value)}
                  placeholder={`Câu 1: Dãy oxit nào sau đây đều là oxit bazơ?\nA. Na2O, CaO, BaO, CuO\nB. SO2, CO2, P2O5, N2O5\nC. CaO, CO2, Al2O3, Fe2O3\nD. SO3, BaO, Na2O, K2O\nĐáp án: A\nLời giải: Na2O, CaO...`}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleParseWord}
                disabled={isWordParsing}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>{isWordParsing ? 'Đang phân tích cấu trúc file Word...' : 'Phân Tích & Nhận Diện Đề Thi Từ Word'}</span>
              </button>

              {/* Word Parsed Result */}
              {wordParsedResult && (
                <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div>
                      <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Đã nhận diện {wordParsedResult.count} câu hỏi
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{wordParsedResult.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyWordQuiz}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Áp dụng vào đề thi</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs pr-2">
                    {wordParsedResult.questions.map((q, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                        <strong className="text-emerald-700">Câu {idx + 1}:</strong> {q.question}
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Đáp án đúng: <strong>{q.options[q.correctOptionIndex]}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab === 'manual' && (
              <span>
                Tổng cộng: <strong>{multipleChoice.length + trueFalse.length + fillInBlank.length + essay.length}</strong> câu hỏi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSaveExam}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{examToEdit ? 'Lưu Cập Nhật Đề Thi' : 'Hoàn Tất & Lưu Đề Thi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
