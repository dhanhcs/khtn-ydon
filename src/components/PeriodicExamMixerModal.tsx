import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Shuffle, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Hash, 
  Eye, 
  Printer, 
  ArrowRight,
  BookOpen,
  Sliders,
  Check,
  Send
} from 'lucide-react';
import { ExamQuestion, ShuffledExamPaper, GradeLevel, PeriodicExamCodeKey } from '../types';
import { 
  generatePeriodicExamWordTemplateBlob, 
  parseTwoExamsWordFile, 
  mixPeriodicExams, 
  generateMixedExamsWordBlob, 
  generateMixedAnswerKeysWordBlob, 
  exportMixedAnswerKeysExcel 
} from '../utils/periodicMixerUtils';

interface PeriodicExamMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncKeysToScanner?: (keys: Record<string, PeriodicExamCodeKey>, firstCode: string) => void;
}

export function PeriodicExamMixerModal({
  isOpen,
  onClose,
  onSyncKeysToScanner
}: PeriodicExamMixerModalProps) {
  if (!isOpen) return null;

  // Configuration state
  const [numCodes, setNumCodes] = useState<number>(4); // 1 to 6
  const [firstCode, setFirstCode] = useState<string>('0101'); // 4-digit code
  const [grade, setGrade] = useState<GradeLevel>(8);
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // File upload & parsing state
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [exam1Questions, setExam1Questions] = useState<ExamQuestion[] | null>(null);
  const [exam2Questions, setExam2Questions] = useState<ExamQuestion[] | null>(null);
  const [exam1Title, setExam1Title] = useState<string>('Đề kiểm tra định kỳ KHTN - Đề gốc 1');
  const [exam2Title, setExam2Title] = useState<string>('Đề kiểm tra định kỳ KHTN - Đề gốc 2');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Shuffled output state
  const [shuffledPapers, setShuffledPapers] = useState<ShuffledExamPaper[] | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<string>('0101');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Calculate generated code preview
  const previewCodes = Array.from({ length: numCodes }, (_, idx) => {
    const base = parseInt(firstCode, 10) || 101;
    const len = firstCode.length || 4;
    return String(base + idx).padStart(len, '0');
  });

  // 1. Download Word template containing 2 source exams
  const handleDownloadTemplate = () => {
    const blob = generatePeriodicExamWordTemplateBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'File_Mau_Soan_2_De_Goc_KHTN_Y_Don.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Handle Uploading the Word file containing 2 exams
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    setParseSuccessMsg(null);
    setUploadedFileName(file.name);

    try {
      const result = await parseTwoExamsWordFile(file);
      setExam1Questions(result.exam1Questions);
      setExam2Questions(result.exam2Questions);
      setExam1Title(result.title1);
      setExam2Title(result.title2);

      setParseSuccessMsg(`Tiếp nhận thành công: Đề gốc 1 có ${result.exam1Questions.length} câu, Đề gốc 2 có ${result.exam2Questions.length} câu.`);
    } catch (err: any) {
      console.error('Lỗi phân tích file Word:', err);
      setParseError('Không thể phân tích file Word. Vui lòng tải lại file mẫu hoặc kiểm tra định dạng .docx / .doc.');
    } finally {
      setIsParsing(false);
    }
  };

  // 3. Perform mixing into N exam codes
  const handleDoMixing = () => {
    // If user hasn't uploaded, supply default comprehensive sample questions so they can test immediately
    let q1 = exam1Questions;
    let q2 = exam2Questions;

    if (!q1 || q1.length === 0 || !q2 || q2.length === 0) {
      // Create rich questions from template text
      const blob = generatePeriodicExamWordTemplateBlob();
      // Use fallback built-in questions
      const letters = ['A', 'B', 'C', 'D'];
      q1 = Array.from({ length: 40 }, (_, idx) => ({
        id: `sample1_q_${idx + 1}`,
        type: 'multiple_choice' as const,
        question: `Câu ${idx + 1}: Áp suất chất lỏng tại độ sâu h phụ thuộc vào yếu tố nào? (Đề gốc 1 - Câu ${idx + 1})`,
        options: ['Trọng lượng riêng d và độ sâu h', 'Khối lượng riêng và thể tích', 'Diện tích đáy và chiều cao', 'Nhiệt độ chất lỏng'] as [string, string, string, string],
        correctAnswer: idx % 4,
        explanation: 'Áp suất chất lỏng p = d . h.'
      }));

      q2 = Array.from({ length: 40 }, (_, idx) => ({
        id: `sample2_q_${idx + 1}`,
        type: 'multiple_choice' as const,
        question: `Câu ${idx + 1}: Lực đẩy Archimedes tác dụng lên vật chìm trong nước có phương chiều ra sao? (Đề gốc 2 - Câu ${idx + 1})`,
        options: ['Phương thẳng đứng, chiều từ dưới lên trên', 'Phương nằm ngang từ trái sang phải', 'Phương thẳng đứng từ trên xuống dưới', 'Phương xiên góc 45 độ'] as [string, string, string, string],
        correctAnswer: (idx + 1) % 4,
        explanation: 'Lực đẩy Archimedes luôn hướng thẳng đứng từ dưới lên.'
      }));
    }

    const mixed = mixPeriodicExams(q1, q2, numCodes, firstCode, {
      title: 'Đề kiểm tra định kỳ môn KHTN',
      subject,
      grade,
      durationMinutes
    });

    setShuffledPapers(mixed);
    if (mixed[0]) {
      setActiveCodeTab(mixed[0].examCode);
    }
    setSyncSuccessMsg(null);
  };

  // Download all mixed exams as Word (.doc)
  const handleDownloadMixedWord = () => {
    if (!shuffledPapers) return;
    const blob = generateMixedExamsWordBlob(shuffledPapers);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bo_${shuffledPapers.length}_Ma_De_Thi_KHTN_Y_Don_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Answer Key Matrix as Word (.doc)
  const handleDownloadAnswerKeysWord = () => {
    if (!shuffledPapers) return;
    const blob = generateMixedAnswerKeysWordBlob(shuffledPapers);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Dap_An_${shuffledPapers.length}_Ma_De_Y_Don_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Answer Key Matrix as Excel (.xlsx)
  const handleDownloadAnswerKeysExcel = () => {
    if (!shuffledPapers) return;
    exportMixedAnswerKeysExcel(shuffledPapers);
  };

  // Sync Keys into Official OMR Camera Scanner
  const handleSyncToScanner = () => {
    if (!shuffledPapers) return;

    const keyMap: Record<string, PeriodicExamCodeKey> = {};
    shuffledPapers.forEach(paper => {
      keyMap[paper.examCode] = paper.keys;
    });

    localStorage.setItem('ydon_periodic_code_keys', JSON.stringify(keyMap));

    if (onSyncKeysToScanner) {
      onSyncKeysToScanner(keyMap, shuffledPapers[0]?.examCode || '0101');
    }

    setSyncSuccessMsg(`Đã đồng bộ thành công đáp án ${shuffledPapers.length} mã đề (${shuffledPapers.map(p => p.examCode).join(', ')}) vào Bộ Chấm Thi Camera OMR!`);
  };

  const activePaper = shuffledPapers?.find(p => p.examCode === activeCodeTab) || shuffledPapers?.[0];

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Shuffle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white font-mono">
                  KHẢO THÍ ĐỊNH KỲ • TRỘN ĐỀ TỰ ĐỘNG
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Trộn Đề Kiểm Tra Định Kỳ: Từ 2 Đề Gốc Tạo 1 Đến 6 Mã Đề
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1 & 2: EXPORT & IMPORT WORD FILE WITH 2 EXAMS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Step 1: Download Word Template */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
                  <span>Xuất File Word Mẫu (Chứa 2 Đề Gốc)</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  File Word chuẩn định dạng của Trường Y Đôn gồm sẵn khung <strong>Đề gốc 1</strong> và <strong>Đề gốc 2</strong> (Phần I trắc nghiệm, Phần II Đúng/Sai, Phần III Trả lời ngắn).
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Tải File Word Mẫu 2 Đề Về Máy</span>
              </button>
            </div>

            {/* Step 2: Upload Word File with 2 Exams */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
                  <span>Úp Lại File Word Nội Dung 2 Đề</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sau khi nhập xong 2 đề trên file Word, Thầy/Cô nạp file lên để hệ thống tiếp nhận và phân tích ngân hàng câu hỏi.
                </p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition">
                  <Upload className="w-4 h-4 text-emerald-200" />
                  <span>{uploadedFileName ? `Đã chọn: ${uploadedFileName}` : 'Chọn & Tải Lên File Word 2 Đề (.docx / .doc)'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Parse Notifications */}
          {parseSuccessMsg && (
            <div className="p-3 bg-emerald-100/80 rounded-2xl border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{parseSuccessMsg}</span>
            </div>
          )}

          {parseError && (
            <div className="p-3 bg-rose-100 rounded-2xl border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: MIXER CONFIGURATION (1 TO 6 CODES, FIRST 4-DIGIT CODE) */}
          {/* ======================================================== */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-black">3</span>
              <span>Cấu Hình Tham Số Trộn Mã Đề</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Nút: Số mã đề cần tạo (click từ danh sách 1 đến 6) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Số mã đề cần tạo (chọn 1 đến 6):
                </label>
                <div className="grid grid-cols-6 gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isSelected = numCodes === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumCodes(num)}
                        className={`py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mã đề gồm 4 số do giáo viên quản trị đặt Mã đầu tiên */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Mã đề đầu tiên (4 số do GV đặt):
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={firstCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFirstCode(val);
                  }}
                  placeholder="0101"
                  className="w-full px-3 py-1.5 text-xs font-mono font-black text-blue-900 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs text-center"
                />
              </div>

              {/* Khối lớp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Khối lớp & Thời gian làm bài:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                  >
                    <option value={6}>Lớp 6</option>
                    <option value={7}>Lớp 7</option>
                    <option value={8}>Lớp 8</option>
                    <option value={9}>Lớp 9</option>
                  </select>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                  >
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                    <option value={90}>90 phút</option>
                  </select>
                </div>
              </div>

              {/* Nút hành động Trộn đề */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleDoMixing}
                  className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>TIẾN HÀNH TRỘN ĐỀ</span>
                </button>
              </div>

            </div>

            {/* Hệ thống sẽ tự tạo thêm số của các mã khác bằng cách tăng số hàng đơn vị */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Danh sách các mã đề sẽ được tạo ra:</span>
              {previewCodes.map((c, i) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-mono font-black border border-blue-200 text-xs shadow-2xs"
                >
                  Mã {c}
                </span>
              ))}
              <span className="text-[11px] text-slate-400 italic">
                (Tự động tăng số hàng đơn vị theo đúng quy chuẩn)
              </span>
            </div>

          </div>

          {/* ======================================================== */}
          {/* STEP 4: OUTPUT - VIEW SHUFFLED PAPERS & ANSWER MATRIX */}
          {/* ======================================================== */}
          {shuffledPapers && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Action Buttons Toolbar */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider font-mono">
                    HOÀN THÀNH TRỘN {shuffledPapers.length} MÃ ĐỀ THI
                  </div>
                  <div className="text-sm font-black text-white">
                    Các mã đề: {shuffledPapers.map(p => p.examCode).join(' • ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadMixedWord}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    title="Xuất file Word tất cả các mã đề thi"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>Xuất Word Bộ Đề (.docx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAnswerKeysExcel}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    title="Xuất Excel Bảng ma trận đáp án"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>Xuất Excel Đáp Án (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAnswerKeysWord}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    title="Xuất Word Bảng ma trận đáp án"
                  >
                    <FileText className="w-4 h-4 text-indigo-200" />
                    <span>Xuất Word Đáp Án (.doc)</span>
                  </button>

                  {/* Sync to camera scanner */}
                  <button
                    type="button"
                    onClick={handleSyncToScanner}
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    title="Lưu đáp án vào hệ thống chấm thi Camera OMR"
                  >
                    <Send className="w-4 h-4" />
                    <span>ĐỒNG BỘ SANG BỘ CHẤM THI</span>
                  </button>
                </div>
              </div>

              {/* Sync notification */}
              {syncSuccessMsg && (
                <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}

              {/* Code Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 shrink-0">Xem trước mã đề:</span>
                {shuffledPapers.map(p => {
                  const isActive = p.examCode === activeCodeTab;
                  return (
                    <button
                      key={p.examCode}
                      type="button"
                      onClick={() => setActiveCodeTab(p.examCode)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>Mã {p.examCode}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preview of active paper */}
              {activePaper && (
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">
                        {activePaper.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Số câu hỏi: {activePaper.questions.length} câu • Thời gian: {activePaper.durationMinutes} phút
                      </p>
                    </div>

                    {/* Quick key preview for this paper */}
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-400">Khóa 1-10:</span>
                      <span className="font-black text-blue-700">
                        {activePaper.keys.part1Keys.slice(0, 10).join(' ')}
                      </span>
                    </div>
                  </div>

                  {/* Question listing preview */}
                  <div className="space-y-3 max-h-[360px] overflow-auto pr-2">
                    {activePaper.questions.slice(0, 15).map((q, qIdx) => {
                      if (q.type === 'multiple_choice') {
                        return (
                          <div key={q.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                            <div className="font-bold text-xs text-slate-900">
                              {q.question}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = q.correctAnswer === optIdx;
                                const letters = ['A', 'B', 'C', 'D'];
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-1.5 rounded-lg border text-xs font-medium ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold mr-1">{letters[optIdx]}.</span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {activePaper.questions.length > 15 && (
                      <div className="text-center py-2 text-xs text-slate-400 italic">
                        ... Và còn {activePaper.questions.length - 15} câu hỏi khác (Xuất file Word để xem trọn vẹn).
                      </div>
                    )}
                  </div>

                  {/* Answer Matrix Table */}
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <div className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ma Trận Đáp Án Phần I (40 Câu) Của Tất Cả Các Mã Đề:</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 font-mono">
                          <tr>
                            <th className="py-1.5 px-2 text-left w-16">Câu</th>
                            {shuffledPapers.map(p => (
                              <th key={p.examCode} className="py-1.5 px-2">Mã {p.examCode}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {Array.from({ length: 40 }, (_, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-1 px-2 text-left font-bold text-slate-500">Câu {idx + 1}</td>
                              {shuffledPapers.map(p => (
                                <td key={p.examCode} className="py-1 px-2 font-black text-blue-700">
                                  {p.keys.part1Keys[idx] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Hệ thống xáo trộn đề tuân thủ thuật toán cân bằng phân bố đáp án A, B, C, D của Bộ GD&ĐT.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}
