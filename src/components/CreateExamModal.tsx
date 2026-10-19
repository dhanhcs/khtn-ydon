import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Clock, 
  BookOpen, 
  Save, 
  Layers, 
  HelpCircle,
  Copy,
  ChevronRight,
  RefreshCw,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { 
  Exam, 
  GradeLevel, 
  SubjectType, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion,
  EssayQuestion,
  ExamQuestion,
  UserSession 
} from '../types';
import { compressAndOptimizeImage } from '../utils/fileUtils';
import { 
  generateNativeDocxExamTemplateBlob, 
  generateExamWordTemplateBlob, 
  generateExamPlainTextTemplate, 
  downloadBlob 
} from '../utils/wordExportUtils';
import { extractTextFromExamFile, parseExamContentText } from '../utils/examFileParser';
import mammoth from 'mammoth';
import { FormulaText } from './FormulaText';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (newExam: Exam) => void;
  currentUser: UserSession | null;
  defaultGrade?: GradeLevel;
  defaultSubject?: SubjectType;
  initialTab?: 'manual' | 'ai' | 'upload_file';
}

export function CreateExamModal({
  isOpen,
  onClose,
  onSaveExam,
  currentUser,
  defaultGrade = 8,
  defaultSubject = 'physics',
  initialTab = 'manual'
}: CreateExamModalProps) {
  if (!isOpen) return null;

  // Active Creation Method Tab: 1. manual, 2. ai, 3. upload_file
  const [activeMethod, setActiveMethod] = useState<'manual' | 'ai' | 'upload_file'>(initialTab);

  // Common Exam Meta
  const [grade, setGrade] = useState<GradeLevel>(defaultGrade);
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(
    defaultSubject === 'all' ? 'physics' : defaultSubject
  );
  const [examCategory, setExamCategory] = useState<'regular' | 'periodic'>('regular');
  const [testNumber, setTestNumber] = useState<string>('TX1');
  const [title, setTitle] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [mode, setMode] = useState<'mode_1' | 'mode_2'>('mode_2');
  const [openDate, setOpenDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [openTime, setOpenTime] = useState<string>('08:00:00');

  // -------------------------------------------------------------
  // TAB 1: MANUAL QUESTIONS CREATION
  // 1. KTTX: Chuẩn mẫu 18 câu (16 TN 0.5đ + 1 Đ/S 1.0đ + 1 Điền ngắn 1.0đ)
  // 2. KTĐK: Chuẩn mẫu 22 câu (16 TN 0.25đ + 2 Đ/S 1.0đ + 1 Điền ngắn 1.0đ + 3 Tự luận 1.0đ)
  // -------------------------------------------------------------
  const createStandard18Template = (): ExamQuestion[] => {
    const mcqs: MultipleChoiceQuestion[] = Array.from({ length: 16 }, (_, i) => ({
      id: `m_q_${i + 1}`,
      type: 'multiple_choice',
      question: `Câu ${i + 1}: Nhập nội dung câu hỏi trắc nghiệm nhiều lựa chọn...`,
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Giải thích chi tiết cho đáp án đúng.'
    }));

    const tfQ: TrueFalseQuestion = {
      id: 'm_q_17',
      type: 'true_false',
      question: 'Câu 17: Cho các nhận định khoa học sau đây, hãy chọn Đúng hoặc Sai cho mỗi ý a, b, c, d (1,0 điểm):',
      statements: [
        { subId: 'a', text: 'Nhận định a...', isCorrect: true },
        { subId: 'b', text: 'Nhận định b...', isCorrect: false },
        { subId: 'c', text: 'Nhận định c...', isCorrect: true },
        { subId: 'd', text: 'Nhận định d...', isCorrect: false }
      ],
      explanation: 'Giải thích chi tiết cho 4 ý nhận định Đúng/Sai.'
    };

    const saQ: ShortAnswerQuestion = {
      id: 'm_q_18',
      type: 'short_answer',
      question: 'Câu 18: Giải bài toán thực nghiệm và điền giá trị số vào 2 chỗ trống dưới đây (1,0 điểm):',
      acceptableAnswers: ['10', '20'],
      blanks: [
        { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10', '10.0', '10,0'], unit: '', points: 0.5 },
        { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20', '20.0', '20,0'], unit: '', points: 0.5 }
      ],
      explanation: 'Giải thích công thức và cách tính cho 2 chỗ điền số.'
    };

    return [...mcqs, tfQ, saQ];
  };

  const createStandardPeriodicTemplate = (): ExamQuestion[] => {
    // 16 câu trắc nghiệm nhiều lựa chọn (mỗi câu 0,25 điểm = 4,0 điểm)
    const mcqs: MultipleChoiceQuestion[] = Array.from({ length: 16 }, (_, i) => ({
      id: `p_mcq_${i + 1}`,
      type: 'multiple_choice',
      question: `Câu ${i + 1}: Nhập nội dung câu hỏi trắc nghiệm nhiều lựa chọn (0,25 điểm)...`,
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Giải thích chi tiết cho đáp án đúng.'
    }));

    // 2 câu đúng sai (mỗi câu 1đ và 4 nhận định = 2,0 điểm)
    const tf1: TrueFalseQuestion = {
      id: 'p_tf_1',
      type: 'true_false',
      question: 'Câu 17: Cho các nhận định khoa học sau đây, hãy chọn Đúng hoặc Sai cho mỗi ý a, b, c, d (1,0 điểm):',
      statements: [
        { subId: 'a', text: 'Nhận định a...', isCorrect: true },
        { subId: 'b', text: 'Nhận định b...', isCorrect: false },
        { subId: 'c', text: 'Nhận định c...', isCorrect: true },
        { subId: 'd', text: 'Nhận định d...', isCorrect: false }
      ],
      explanation: 'Giải thích chi tiết cho 4 ý nhận định Đúng/Sai.'
    };

    const tf2: TrueFalseQuestion = {
      id: 'p_tf_2',
      type: 'true_false',
      question: 'Câu 18: Cho tình huống thực nghiệm sau, hãy xác định tính Đúng/Sai của các phát biểu a, b, c, d (1,0 điểm):',
      statements: [
        { subId: 'a', text: 'Nhận định a...', isCorrect: false },
        { subId: 'b', text: 'Nhận định b...', isCorrect: true },
        { subId: 'c', text: 'Nhận định c...', isCorrect: false },
        { subId: 'd', text: 'Nhận định d...', isCorrect: true }
      ],
      explanation: 'Giải thích chi tiết cho 4 ý nhận định Đúng/Sai.'
    };

    // 1 câu điền ngắn 1đ (2 chỗ điền số, mỗi chỗ 0,5đ = 1,0 điểm)
    const sa: ShortAnswerQuestion = {
      id: 'p_sa_1',
      type: 'short_answer',
      question: 'Câu 19: Tính toán và điền kết quả số vào 2 chỗ trống sau đây (1,0 điểm):',
      acceptableAnswers: ['10', '20'],
      blanks: [
        { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10', '10.0', '10,0'], unit: '', points: 0.5 },
        { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20', '20.0', '20,0'], unit: '', points: 0.5 }
      ],
      explanation: 'Giải thích chi tiết cách giải và công thức tính.'
    };

    // Phần tự luận 3 câu, mỗi câu 1 điểm = 3,0 điểm
    const essay1: EssayQuestion = {
      id: 'p_essay_1',
      type: 'essay',
      question: 'Câu 20 (Tự luận - 1,0 điểm): Trình bày cơ sở lí thuyết hoặc giải thích hiện tượng thực tiễn...',
      points: 1.0,
      sampleAnswer: 'Hướng dẫn đáp án chi tiết cho Câu 20.',
      gradingGuide: 'Thang điểm chi tiết: Nêu đúng ý 1 (0.5đ), nêu đúng ý 2 (0.5đ).'
    };

    const essay2: EssayQuestion = {
      id: 'p_essay_2',
      type: 'essay',
      question: 'Câu 21 (Tự luận - 1,0 điểm): Vận dụng kiến thức giải bài tập định lượng / viết phương trình...',
      points: 1.0,
      sampleAnswer: 'Hướng dẫn đáp án chi tiết cho Câu 21.',
      gradingGuide: 'Thang điểm chi tiết: Viết công thức (0.25đ), thay số (0.25đ), tính đúng kết quả (0.5đ).'
    };

    const essay3: EssayQuestion = {
      id: 'p_essay_3',
      type: 'essay',
      question: 'Câu 22 (Tự luận - 1,0 điểm): Phân tích dữ liệu thực nghiệm hoặc đề xuất biện pháp khoa học...',
      points: 1.0,
      sampleAnswer: 'Hướng dẫn đáp án chi tiết cho Câu 22.',
      gradingGuide: 'Thang điểm chi tiết: Phân tích đúng (0.5đ), đề xuất giải pháp khả thi (0.5đ).'
    };

    return [...mcqs, tf1, tf2, sa, essay1, essay2, essay3];
  };

  const [manualQuestions, setManualQuestions] = useState<ExamQuestion[]>(() => createStandard18Template());

  // Đổi dạng câu hỏi từ danh sách xổ xuống cho từng câu (TN nhiều lựa chọn, TN đúng sai, Điền ngắn, Tự luận)
  const handleChangeQuestionType = (idx: number, newType: string) => {
    const currentQ = manualQuestions[idx];
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

    setManualQuestions(prev => {
      const next = [...prev];
      next[idx] = converted;
      return next;
    });
  };

  const handleAddManualQuestion = (qType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' = 'multiple_choice') => {
    const nextIdx = manualQuestions.length + 1;
    let newQ: ExamQuestion;
    if (qType === 'multiple_choice') {
      newQ = {
        id: `m_q_${Date.now()}_${nextIdx}`,
        type: 'multiple_choice',
        question: `Câu ${nextIdx}: Nhập nội dung câu hỏi trắc nghiệm nhiều lựa chọn...`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: 0,
        explanation: 'Giải thích cơ sở khoa học.'
      };
    } else if (qType === 'true_false') {
      newQ = {
        id: `m_tf_${Date.now()}_${nextIdx}`,
        type: 'true_false',
        question: `Câu ${nextIdx}: Cho các nhận định sau, hãy chọn Đúng hoặc Sai cho mỗi ý a, b, c, d:`,
        statements: [
          { subId: 'a', text: 'Nhận định a...', isCorrect: true },
          { subId: 'b', text: 'Nhận định b...', isCorrect: false },
          { subId: 'c', text: 'Nhận định c...', isCorrect: true },
          { subId: 'd', text: 'Nhận định d...', isCorrect: false }
        ],
        explanation: 'Giải thích chi tiết 4 nhận định.'
      };
    } else if (qType === 'short_answer') {
      newQ = {
        id: `m_sa_${Date.now()}_${nextIdx}`,
        type: 'short_answer',
        question: `Câu ${nextIdx}: Tính toán và điền kết quả số vào 2 chỗ trống:`,
        acceptableAnswers: ['10', '20'],
        blanks: [
          { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10'], unit: '', points: 0.5 },
          { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20'], unit: '', points: 0.5 }
        ],
        explanation: 'Giải thích chi tiết kết quả 2 chỗ điền số.'
      };
    } else {
      newQ = {
        id: `m_essay_${Date.now()}_${nextIdx}`,
        type: 'essay',
        question: `Câu ${nextIdx} (Tự luận - 1,0 điểm): Nhập nội dung câu hỏi tự luận...`,
        points: 1.0,
        sampleAnswer: 'Hướng dẫn đáp án mẫu chi tiết.',
        gradingGuide: 'Thang điểm chấm chi tiết.'
      };
    }
    setManualQuestions(prev => [...prev, newQ]);
  };

  const handleAddQuestionAfter = (afterIdx: number, qType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' = 'multiple_choice') => {
    const nextIdx = manualQuestions.length + 1;
    let newQ: ExamQuestion;
    if (qType === 'multiple_choice') {
      newQ = {
        id: `m_q_${Date.now()}_${nextIdx}`,
        type: 'multiple_choice',
        question: `Câu hỏi trắc nghiệm mới (nhiều lựa chọn)...`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: 0,
        explanation: 'Giải thích chi tiết cho đáp án đúng.'
      };
    } else if (qType === 'true_false') {
      newQ = {
        id: `m_tf_${Date.now()}_${nextIdx}`,
        type: 'true_false',
        question: `Cho các nhận định khoa học sau, chọn Đúng hoặc Sai cho mỗi ý a, b, c, d:`,
        statements: [
          { subId: 'a', text: 'Nhận định a...', isCorrect: true },
          { subId: 'b', text: 'Nhận định b...', isCorrect: false },
          { subId: 'c', text: 'Nhận định c...', isCorrect: true },
          { subId: 'd', text: 'Nhận định d...', isCorrect: false }
        ],
        explanation: 'Giải thích chi tiết 4 nhận định.'
      };
    } else if (qType === 'short_answer') {
      newQ = {
        id: `m_sa_${Date.now()}_${nextIdx}`,
        type: 'short_answer',
        question: `Tính toán và điền kết quả số vào 2 chỗ trống sau:`,
        acceptableAnswers: ['10', '20'],
        blanks: [
          { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10'], unit: '', points: 0.5 },
          { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20'], unit: '', points: 0.5 }
        ],
        explanation: 'Giải thích chi tiết kết quả 2 chỗ điền số.'
      };
    } else {
      newQ = {
        id: `m_essay_${Date.now()}_${nextIdx}`,
        type: 'essay',
        question: `Câu hỏi tự luận (1,0 điểm)...`,
        points: 1.0,
        sampleAnswer: 'Hướng dẫn đáp án mẫu chi tiết.',
        gradingGuide: 'Thang điểm chấm chi tiết.'
      };
    }
    setManualQuestions(prev => {
      const next = [...prev];
      next.splice(afterIdx + 1, 0, newQ);
      return next;
    });
  };

  const handleRemoveManualQuestion = (idx: number) => {
    if (manualQuestions.length <= 1) {
      alert('Đề kiểm tra cần có ít nhất 1 câu hỏi.');
      return;
    }
    setManualQuestions(manualQuestions.filter((_, i) => i !== idx));
  };

  const handleUpdateManualQuestion = (idx: number, field: string, val: any) => {
    const updated = [...manualQuestions];
    updated[idx] = { ...updated[idx], [field]: val } as ExamQuestion;
    setManualQuestions(updated);
  };

  const handleUpdateManualOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...manualQuestions];
    const target = updated[qIdx];
    if (target.type === 'multiple_choice') {
      const newOptions = [...target.options];
      newOptions[optIdx] = val;
      updated[qIdx] = { ...target, options: newOptions };
      setManualQuestions(updated);
    }
  };

  const handleUpdateManualTfStatement = (qIdx: number, stmtIdx: number, field: 'text' | 'isCorrect', val: any) => {
    const updated = [...manualQuestions];
    const target = updated[qIdx];
    if (target.type === 'true_false') {
      const stmts = [...target.statements] as [any, any, any, any];
      stmts[stmtIdx] = { ...stmts[stmtIdx], [field]: val };
      updated[qIdx] = { ...target, statements: stmts };
      setManualQuestions(updated);
    }
  };

  const handleUpdateManualSaBlank = (qIdx: number, blankIdx: number, rawVal: string, unitVal?: string) => {
    const updated = [...manualQuestions];
    const target = updated[qIdx];
    if (target.type === 'short_answer') {
      const blanks = [...(target.blanks || [
        { id: '1', label: 'Chỗ điền số (1)', acceptableAnswers: ['10'], points: 0.5 },
        { id: '2', label: 'Chỗ điền số (2)', acceptableAnswers: ['20'], points: 0.5 }
      ])];
      const answers = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      blanks[blankIdx] = {
        ...blanks[blankIdx],
        acceptableAnswers: answers.length > 0 ? answers : ['0'],
        ...(unitVal !== undefined ? { unit: unitVal } : {})
      };
      updated[qIdx] = {
        ...target,
        blanks,
        acceptableAnswers: blanks.map(b => b.acceptableAnswers[0] || '0')
      };
      setManualQuestions(updated);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: AI AUTO GENERATION
  // -------------------------------------------------------------
  const [aiTopic, setAiTopic] = useState<string>('Áp suất chất lỏng và Lực đẩy Archimedes');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(10);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiGeneratedExam, setAiGeneratedExam] = useState<Exam | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const sampleTopics: Record<string, string[]> = {
    physics: [
      'Đo độ dài, khối lượng và thời gian (Khối 6)',
      'Lực và biến dạng lò xo, lực ma sát (Khối 6)',
      'Tốc độ chuyển động và đồ thị quãng đường (Khối 7)',
      'Âm thanh, độ to và độ cao của âm (Khối 7)',
      'Áp suất chất lỏng và Lực đẩy Archimedes (Khối 8)',
      'Nhiệt năng và các hình thức truyền nhiệt (Khối 8)',
      'Cơ năng, động năng và thế năng (Khối 9)',
      'Hiện tượng khúc xạ ánh sáng và Thấu kính hội tụ (Khối 9)'
    ],
    chemistry: [
      'Oxygen và Không khí, các thể của chất (Khối 6)',
      'Nguyên tử, nguyên tố và Bảng tuần hoàn (Khối 7)',
      'Phân tử, đơn chất, hợp chất và liên kết hóa học (Khối 7)',
      'Phản ứng hóa học, Định luật bảo toàn khối lượng và Mol (Khối 8)',
      'Dung dịch, độ tan và nồng độ dung dịch (Khối 8)',
      'Acid, Base, Oxide, Muối và Thang pH (Khối 8)',
      'Kim loại và dãy hoạt động hóa học (Khối 9)',
      'Hydrocarbon, nhiên liệu và hợp chất hữu cơ (Khối 9)'
    ],
    biology: [
      'Tế bào - Đơn vị cơ bản của sự sống (Khối 6)',
      'Trao đổi chất và chuyển hóa năng lượng ở thực vật (Khối 7)',
      'Cảm ứng ở sinh vật và tập tính động vật (Khối 7)',
      'Khái quát cơ thể người, hệ tuần hoàn và hô hấp (Khối 8)',
      'Hệ thần kinh, giác quan và các tuyến nội tiết (Khối 8)',
      'Di truyền học Mendel, ADN và Nhiễm sắc thể (Khối 9)',
      'Biến dị, đột biến gen và đột biến NST (Khối 9)',
      'Hệ sinh thái, chuỗi thức ăn và bảo vệ môi trường (Khối 9)'
    ]
  };

  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      alert('Vui lòng nhập chủ đề kiến thức để AI soạn đề.');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);

    try {
      const subName = subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
      const res = await fetch('/api/gemini/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          topic: aiTopic,
          questionCount: aiQuestionCount,
          testNumber,
          durationMinutes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.exam) {
        throw new Error(data.error || 'Không thể tạo đề bằng AI.');
      }

      setAiGeneratedExam(data.exam);
      if (!title) {
        setTitle(data.exam.title || `${testNumber.replace('TX', 'Đề ')} - ${subName} ${grade}: ${aiTopic}`);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi khi kết nối với máy chủ AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: FILE UPLOAD & TEMPLATE PARSING
  // -------------------------------------------------------------
  const [uploadedFileText, setUploadedFileText] = useState<string>('');
  const [uploadedQuestions, setUploadedQuestions] = useState<ExamQuestion[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCopiedTemplate, setIsCopiedTemplate] = useState<boolean>(false);
  const [showDirectEditor, setShowDirectEditor] = useState<boolean>(false);

  // Template text for teacher download & reference
  const sampleTemplateContent = `[TIÊU ĐỀ: Đề 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes]
[KHỐI: 8]
[MÔN: vat_li]
[THỜI GIAN: 15]

PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (16 CÂU - 8.0 ĐIỂM)

Câu 1: Đơn vị đo của áp suất trong hệ đo lường quốc tế SI là gì?
A. Newton (N)
B. Pascal (Pa)
C. Joule (J)
D. Kilôgam (kg)
Đáp án: B
Giải thích: Đơn vị chuẩn của áp suất là Pascal (Pa), tương đương 1 N/m².

Câu 2: Công thức tính áp suất chất lỏng tại một điểm có độ sâu h là gì?
A. p = d . h
B. p = d / h
C. p = h / d
D. p = d + h
Đáp án: A
Giải thích: Áp suất chất lỏng p = d . h, trong đó d là trọng lượng riêng chất lỏng, h là độ sâu tính từ mặt thoáng.

Câu 3: Một vật chìm hoàn toàn trong chất lỏng chịu lực đẩy Archimedes có phương và chiều như thế nào?
A. Phương thẳng đứng, chiều từ dưới lên trên
B. Phương thẳng đứng, chiều từ trên xuống dưới
C. Phương nằm ngang, chiều từ trái sang phải
D. Cùng hướng với trọng lực
Đáp án: A
Giải thích: Lực đẩy Archimedes luôn có phương thẳng đứng hướng từ dưới lên trên.

Câu 4: Độ lớn của lực đẩy Archimedes được tính theo công thức nào?
A. FA = d . V
B. FA = P / V
C. FA = m . V
D. FA = d / V
Đáp án: A
Giải thích: FA = d . V, với V là thể tích phần chất lỏng bị vật chiếm chỗ.

Câu 5: Vật sẽ chìm xuống trong chất lỏng khi nào?
A. P > FA (hoặc dvật > dchất lỏng)
B. P < FA
C. P = FA
D. dvật < dchất lỏng
Đáp án: A
Giải thích: Khi trọng lượng lớn hơn lực đẩy Archimedes vật sẽ chìm xuống đáy.

Câu 6: Để tăng áp suất tác dụng lên mặt bị ép, người ta có thể làm cách nào?
A. Tăng áp lực và giảm diện tích bị ép
B. Giảm áp lực và tăng diện tích bị ép
C. Giữ nguyên áp lực và tăng diện tích bị ép
D. Giảm cả áp lực và diện tích bị ép
Đáp án: A
Giải thích: Vì p = F/S nên tăng F và giảm S làm áp suất tăng mạnh nhất.

Câu 7: Mũi đinh nhọn sắc để làm gì trong thực tế đời sống?
A. Giảm diện tích tiếp xúc để tăng áp suất dễ đóng vào gỗ
B. Tăng diện tích tiếp xúc để giảm áp suất
C. Giảm áp lực
D. Làm cho đinh nặng hơn
Đáp án: A
Giải thích: Diện tích mũi đinh nhỏ tạo áp suất lớn giúp đinh cắm sâu vào gỗ.

Câu 8: Tại sao khi lặn xuống biển sâu, người thợ lặn phải mặc áo lặn chuyên dụng chịu áp suất?
A. Vì càng xuống sâu thì áp suất nước biển càng lớn gây nguy hiểm
B. Để bơi nhanh hơn
C. Để giảm trọng lượng cơ thể
D. Để tăng lực đẩy Archimedes
Đáp án: A
Giải thích: Áp suất p = d.h, độ sâu càng lớn thì áp suất nước biển càng lớn.

Câu 9: Trong bình thông nhau chứa cùng một chất lỏng đứng yên, các mực chất lỏng ở các nhánh luôn:
A. Ở cùng một độ cao mặt thoáng
B. Nhánh to có mực nước cao hơn
C. Nhánh nhỏ có mực nước cao hơn
D. Thay đổi liên tục
Đáp án: A
Giải thích: Các mặt thoáng của chất lỏng đứng yên trong bình thông nhau luôn ở cùng độ cao.

Câu 10: Khí quyển có áp suất là do nguyên nhân nào sau đây?
A. Do không khí có trọng lượng
B. Do không khí chuyển động nhiệt
C. Do bức xạ mặt trời
D. Do hơi nước bay lên
Đáp án: A
Giải thích: Lớp khí quyển dày hàng trăm km có trọng lượng tác dụng áp suất lên mọi vật trên Trái Đất.

Câu 11: Áp suất khí quyển tiêu chuẩn ở ngang mực nước biển xấp xỉ bằng bao nhiêu mmHg?
A. 760 mmHg
B. 100 mmHg
C. 500 mmHg
D. 1000 mmHg
Đáp án: A
Giải thích: Thí nghiệm Torricelli đo áp suất chuẩn bằng cột thủy ngân cao 760 mm.

Câu 12: Tàu ngầm lặn xuống hoặc nổi lên được là nhờ cơ chế nào?
A. Thay đổi lượng nước trong các khoang dằn để thay đổi trọng lượng tàu
B. Thay đổi hình dạng vỏ tàu
C. Tăng giảm công suất chân vịt
D. Dùng động cơ kéo
Đáp án: A
Giải thích: Bơm nước vào khoang dằn làm tăng P để chìm, xả nước ra để giảm P nổi lên.

Câu 13: Một thỏi nhôm và một thỏi sắt có cùng thể tích nhúng chìm hoàn toàn trong nước. So sánh lực đẩy Archimedes:
A. FA tác dụng lên hai thỏi bằng nhau
B. FA sắt lớn hơn
C. FA nhôm lớn hơn
D. Không xác định được
Đáp án: A
Giải thích: Cùng thể tích V chiếm chỗ và cùng d_nước nên FA = d.V bằng nhau.

Câu 14: Hiện tượng nào sau đây giải thích tác dụng của áp suất khí quyển?
A. Hút sữa từ hộp giấy bằng ống hút
B. Giọt nước đọng trên lá sen
C. Thước kẻ cọ xát hút giấy vụn
D. Kim nam châm tự định hướng
Đáp án: A
Giải thích: Áp suất trong khoang miệng giảm, áp suất khí quyển ép sữa dâng lên ống hút.

Câu 15: Khi đặt bàn chân trần lên đệm mút thì đệm bị lún sâu hơn khi nằm ngả lưng là vì:
A. Diện tích tiếp xúc khi đứng nhỏ hơn nhiều nên áp suất lớn hơn
B. Trọng lượng khi đứng lớn hơn khi nằm
C. Đệm hút chân mạnh hơn
D. Áp lực khi đứng lớn hơn
Đáp án: A
Giải thích: Cùng trọng lượng nhưng diện tích tiếp xúc khi đứng nhỏ hơn nên áp suất lớn hơn.

Câu 16: Một khối gỗ có thể tích 0.002 m³ nhúng chìm hoàn toàn trong nước (d = 10000 N/m³). Lực đẩy Archimedes là:
A. 20 N
B. 2 N
C. 200 N
D. 0.2 N
Đáp án: A
Giải thích: FA = d * V = 10000 * 0.002 = 20 N.

PHẦN 2: CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI (1 CÂU - 4 NHẬN ĐỊNH - 1.0 ĐIỂM)

Câu 17: Một học sinh làm thí nghiệm khảo sát áp suất chất lỏng và lực đẩy Archimedes trong phòng thực hành KHTN. Hãy đánh giá tính Đúng/Sai của các nhận định sau:
a) Chất lỏng gây ra áp suất theo mọi phương lên đáy bình, thành bình và các vật nhúng trong lòng chất lỏng. - Đáp án: Đúng
b) Lực đẩy Archimedes có độ lớn bằng trọng lượng của phần chất lỏng bị vật chiếm chỗ. - Đáp án: Đúng
c) Vật nổi cân bằng trên mặt chất lỏng khi trọng lượng của vật bằng độ lớn lực đẩy Archimedes. - Đáp án: Đúng
d) Càng lên cao trên núi cao thì áp suất khí quyển càng tăng lên do không khí loãng hơn. - Đáp án: Sai
Giải thích: Ý a, b, c đúng. Ý d sai vì càng lên cao thì lớp khí quyển bên trên càng mỏng nên áp suất khí quyển giảm dần.

PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (1 CÂU - 2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM)

Câu 18: Một khối kim loại hình hộp có thể tích V = 0.004 m³ và khối lượng m = 10.8 kg được nhúng chìm hoàn toàn trong một bể nước (cho d_nước = 10000 N/m³; lấy g = 10 m/s²).
(1) Độ lớn lực đẩy Archimedes tác dụng lên khối kim loại bằng bao nhiêu Newton (N)?
(2) Trọng lượng của khối kim loại này ngoài không khí bằng bao nhiêu Newton (N)?
Chỗ điền 1: 40
Chỗ điền 2: 108
Giải thích:
- Chỗ điền 1: Độ lớn lực đẩy Archimedes FA = d * V = 10000 * 0.004 = 40 N (0.5 điểm).
- Chỗ điền 2: Trọng lượng khối kim loại P = 10 * m = 10 * 10.8 = 108 N (0.5 điểm).`;

  // Tải file mẫu Microsoft Word (.docx) bản địa theo môn
  const handleDownloadDocx = async (targetSubject: SubjectType = subject) => {
    try {
      const blob = await generateNativeDocxExamTemplateBlob(targetSubject);
      const subSlug = targetSubject === 'physics' ? 'Vat_Li' : targetSubject === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
      downloadBlob(blob, `Mau_De_Kiem_Tra_GDPT_2018_${subSlug}_Khoi_${grade}.docx`);
    } catch (err: any) {
      console.error(err);
      handleDownloadDoc(targetSubject);
    }
  };

  // Tải file mẫu Word (.doc) tương thích theo môn
  const handleDownloadDoc = (targetSubject: SubjectType = subject) => {
    const blob = generateExamWordTemplateBlob(targetSubject);
    const subSlug = targetSubject === 'physics' ? 'Vat_Li' : targetSubject === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
    downloadBlob(blob, `Mau_De_Kiem_Tra_GDPT_2018_${subSlug}_Khoi_${grade}.doc`);
  };

  // Tải file mẫu văn bản thuần (.txt)
  const handleDownloadTxt = (targetSubject: SubjectType = subject) => {
    const text = generateExamPlainTextTemplate(targetSubject);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const subSlug = targetSubject === 'physics' ? 'Vat_Li' : targetSubject === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
    downloadBlob(blob, `Mau_De_Kiem_Tra_GDPT_2018_${subSlug}_Khoi_${grade}.txt`);
  };

  // Sao chép nhanh toàn bộ nội dung mẫu vào bộ nhớ tạm
  const handleCopyTemplate = async () => {
    try {
      const text = generateExamPlainTextTemplate(subject);
      await navigator.clipboard.writeText(text);
      setIsCopiedTemplate(true);
      setTimeout(() => setIsCopiedTemplate(false), 2500);
    } catch {
      alert('Không thể sao chép tự động. Thầy/Cô vui lòng tải file mẫu để xem nội dung.');
    }
  };

  // Phân tích văn bản đề thi (bằng thuật toán bóc tách thông minh)
  const parseUploadedText = (rawContent: string) => {
    setUploadError(null);
    setUploadSuccessInfo(null);

    try {
      if (!rawContent || rawContent.trim().length < 20) {
        throw new Error('Nội dung văn bản quá ngắn hoặc tệp rỗng. Vui lòng kiểm tra lại file Word tải lên.');
      }

      const result = parseExamContentText(rawContent);

      if (result.title) {
        setTitle(result.title);
      }
      if (result.grade) {
        setGrade(result.grade);
      }
      if (result.subject) {
        setSubject(result.subject);
      }
      if (result.durationMinutes) {
        setDurationMinutes(result.durationMinutes);
      }

      setUploadedQuestions(result.questions);

      const { mcqCount, tfCount, saCount, total, isStandardGDPT2018 } = result.summary;
      const matrixNote = isStandardGDPT2018 
        ? ' ⭐ Đạt chuẩn ma trận 100% GDPT 2018 (16 trắc nghiệm + 1 đúng/sai + 1 trả lời ngắn 2 chỗ điền số).' 
        : '';

      setUploadSuccessInfo(
        `Đã nhận diện thành công ${total} câu hỏi (${mcqCount} câu trắc nghiệm nhiều lựa chọn, ${tfCount} câu đúng/sai, ${saCount} câu trả lời ngắn).${matrixNote} Đã tự động cập nhật tiêu đề và phân môn vào hệ thống!`
      );
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi phân tích nội dung đề kiểm tra.');
    }
  };

  // Xử lý nạp file Word (.docx, .doc, .txt)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessInfo(null);

    try {
      const extractedText = await extractTextFromExamFile(file);
      setUploadedFileText(extractedText);
      parseUploadedText(extractedText);
    } catch (err: any) {
      setUploadError('Lỗi đọc tệp đề thi: ' + (err.message || 'Vui lòng kiểm tra lại file Word.'));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleUpdateAiQuestionImage = (index: number, imgUrl?: string) => {
    if (!aiGeneratedExam || !aiGeneratedExam.questions) return;
    const updatedQs = [...aiGeneratedExam.questions];
    updatedQs[index] = { ...updatedQs[index], imageUrl: imgUrl };
    setAiGeneratedExam({ ...aiGeneratedExam, questions: updatedQs });
  };

  const handleUpdateUploadedQuestionImage = (index: number, imgUrl?: string) => {
    setUploadedQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], imageUrl: imgUrl };
      return next;
    });
  };

  // -------------------------------------------------------------
  // SAVE EXAM FINAL HANDLER
  // -------------------------------------------------------------
  const handleFinalSave = () => {
    if (currentUser?.role !== 'admin') {
      alert('Chỉ quản trị viên (Admin) mới có quyền tạo đề kiểm tra mới!');
      return;
    }

    const subName = subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
    const finalTitle = title.trim() || `${testNumber.replace('TX', 'Đề ')} - ${subName} ${grade}: Đề kiểm tra mới`;

    let finalQuestions: ExamQuestion[] = [];

    if (activeMethod === 'manual') {
      if (manualQuestions.length === 0) {
        alert('Vui lòng thêm ít nhất 1 câu hỏi.');
        return;
      }
      finalQuestions = manualQuestions;
    } else if (activeMethod === 'ai') {
      if (!aiGeneratedExam || !aiGeneratedExam.questions || aiGeneratedExam.questions.length === 0) {
        alert('Vui lòng bấm nút "AI Tạo Đề Tự Động" trước khi lưu.');
        return;
      }
      finalQuestions = aiGeneratedExam.questions;
    } else if (activeMethod === 'upload_file') {
      if (uploadedQuestions.length === 0) {
        alert('Chưa có câu hỏi nào được nạp từ file. Vui lòng tải file theo đúng mẫu.');
        return;
      }
      finalQuestions = uploadedQuestions;
    }

    const newExam: Exam = {
      id: `exam-${subject}-${grade}-${Date.now()}`,
      title: finalTitle,
      subject,
      grade,
      testNumber,
      durationMinutes,
      totalPoints: 10.0,
      mode: 'mode_2',
      openAt: `${openDate}T${openTime || '08:00:00'}`,
      openTime: `${openDate}T${openTime || '08:00:00'}`,
      closeAt: new Date(new Date(`${openDate}T${openTime || '08:00:00'}`).getTime() + (durationMinutes || 15) * 60000).toISOString(),
      closeTime: new Date(new Date(`${openDate}T${openTime || '08:00:00'}`).getTime() + (durationMinutes || 15) * 60000).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      questions: finalQuestions
    };

    onSaveExam(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-mono">
                  DÀNH CHO ADMIN
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Thiết Kế & Tạo Đề Kiểm Tra Mới
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-modal-header-download-sample"
              onClick={() => handleDownloadDocx(subject)}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Tải File Đề Mẫu Chuẩn Ma trận GDPT 2018 (.docx) 18 câu về máy tính"
            >
              <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>📥 Tải File Đề Mẫu (.docx)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng bảng tạo đề"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 CREATION TABS (User requirement) */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMethod('manual')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMethod === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Tạo thủ công (Theo mẫu)</span>
          </button>

          <button
            onClick={() => setActiveMethod('ai')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMethod === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>2. Tạo tự động bằng AI</span>
          </button>

          <button
            onClick={() => setActiveMethod('upload_file')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
        <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* HÌNH THỨC KIỂM TRA: THƯỜNG XUYÊN VS ĐỊNH KÌ */}
          <div className="col-span-2 sm:col-span-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-3 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wide">
                Hình thức đề thi:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-slate-200/90 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    if (examCategory !== 'regular') {
                      setExamCategory('regular');
                      setDurationMinutes(15);
                      setManualQuestions(createStandard18Template());
                      setTestNumber('TX1');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examCategory === 'regular'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Kiểm tra thường xuyên (KTTX - 15 phút)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (examCategory !== 'periodic') {
                      setExamCategory('periodic');
                      setDurationMinutes(45);
                      setManualQuestions(createStandardPeriodicTemplate());
                      setTestNumber('DK1');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examCategory === 'periodic'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Kiểm tra định kì (KTĐK - 45/60/90 phút)
                </button>
              </div>
            </div>
            <div className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {examCategory === 'regular'
                ? '⭐ KTTX: 16 câu TN (0,5đ) + 1 câu Đ/S (1đ) + 1 câu Điền ngắn (1đ) = 10,0 điểm'
                : '⭐ KTĐK: 16 câu TN (0,25đ) + 2 câu Đ/S (1đ) + 1 câu Điền ngắn (1đ) + 3 câu Tự luận (1đ) = 10,0 điểm'}
            </div>
          </div>

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
            <label className="block font-bold text-slate-700 mb-1">Mã đề / Lần kiểm tra:</label>
            <select
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              {examCategory === 'regular' ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={`TX${num}`}>Đề {num} (TX{num})</option>
                ))
              ) : (
                [
                  { val: 'DK1', label: 'Kiểm tra Giữa kì 1 (ĐK1)' },
                  { val: 'DK2', label: 'Kiểm tra Cuối kì 1 (ĐK2)' },
                  { val: 'DK3', label: 'Kiểm tra Giữa kì 2 (ĐK3)' },
                  { val: 'DK4', label: 'Kiểm tra Cuối kì 2 (ĐK4)' }
                ].map((item) => (
                  <option key={item.val} value={item.val}>{item.label}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Thời gian (phút):</label>
            <input
              type="number"
              min={5}
              max={120}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            />
          </div>

          <div className="col-span-2 sm:col-span-4">
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu đề đề thi (để trống sẽ tự động đặt tên theo môn & chủ đề):
            </label>
            <input
              type="text"
              placeholder={`Ví dụ: ${testNumber.replace('TX', 'Đề ')} - ${subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} ${grade}: Kiểm tra trọng tâm`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
            />
          </div>

          {/* Mode Mở Thời Gian */}
          <div className="col-span-2 sm:col-span-4 bg-white p-3 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs">Chế độ mở đề:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded text-[11px]">
                Chế độ 2: Ấn định thời gian mở đề
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                (Sau khi hết giờ app sẽ tự động đóng và báo cáo hết giờ, GV có thể mở lại khi cần)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Bắt đầu:</span>
              <input
                type="date"
                required
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs font-bold"
              />
              <input
                type="time"
                step="1"
                required
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Content Body Based on Selected Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: TẠO THỦ CÔNG */}
          {activeMethod === 'manual' && (
            <div className="space-y-4">
              {/* Shortcut Banner to Word Template */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="font-extrabold text-blue-950 block">
                      Thầy/Cô muốn thiết kế đề nhanh bằng Microsoft Word?
                    </span>
                    <span className="text-blue-700 text-[11px]">
                      Tải file đề mẫu chuẩn 3 phần GDPT 2018, soạn trên Word rồi nạp file để hệ thống tự động bóc tách 100%!
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadDocx(subject)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>📥 Tải File Mẫu (.docx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMethod('upload_file')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nạp File Word 👉</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-slate-800">
                    Danh Sách Câu Hỏi ({manualQuestions.length} câu: {manualQuestions.filter(q => q.type === 'multiple_choice').length} TN + {manualQuestions.filter(q => q.type === 'true_false').length} Đ/S + {manualQuestions.filter(q => q.type === 'short_answer').length} Điền ngắn{manualQuestions.filter(q => q.type === 'essay').length > 0 ? ` + ${manualQuestions.filter(q => q.type === 'essay').length} Tự luận` : ''})
                  </h4>
                  <p className="text-xs text-slate-500">
                    {examCategory === 'periodic'
                      ? 'Chuẩn ma trận KTĐK: 16 câu TN (0,25đ) + 2 câu Đ/S (1đ) + 1 câu Điền ngắn (1đ) + 3 câu Tự luận (1đ) = 10,0 điểm.'
                      : 'Chuẩn ma trận KTTX: 16 câu TN (0,5đ) + 1 câu Đ/S (1đ) + 1 câu Điền ngắn (1đ) = 10,0 điểm.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('multiple_choice')}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Câu TN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('true_false')}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Câu Đúng/Sai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('short_answer')}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Câu Điền ngắn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('essay')}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Câu Tự luận</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Khôi phục lại đúng khung 18 câu mẫu chuẩn KTTX (16 TN + 1 Đ/S + 1 Điền ngắn)?')) {
                        setManualQuestions(createStandard18Template());
                        setExamCategory('regular');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title="Khôi phục chuẩn 18 câu KTTX"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mẫu KTTX (18 câu)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Khôi phục lại đúng khung 22 câu mẫu chuẩn KTĐK (16 TN 0.25đ + 2 Đ/S 1đ + 1 Điền ngắn 1đ + 3 Tự luận 1đ)?')) {
                        setManualQuestions(createStandardPeriodicTemplate());
                        setExamCategory('periodic');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-purple-300"
                    title="Khôi phục chuẩn 22 câu KTĐK"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mẫu KTĐK (22 câu)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {manualQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      q.type === 'true_false'
                        ? 'bg-purple-50/50 border-purple-200'
                        : q.type === 'short_answer'
                        ? 'bg-amber-50/50 border-amber-200'
                        : q.type === 'essay'
                        ? 'bg-indigo-50/50 border-indigo-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                          Câu {idx + 1}
                        </span>

                        {/* Nút chọn dạng câu hỏi từ danh sách xổ xuống theo đúng yêu cầu */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs">
                          <label className="text-[11px] font-bold text-slate-600">Dạng câu:</label>
                          <select
                            value={q.type}
                            onChange={(e) => handleChangeQuestionType(idx, e.target.value)}
                            className="bg-transparent text-xs font-bold text-blue-900 outline-none cursor-pointer"
                          >
                            <option value="multiple_choice">
                              TN nhiều lựa chọn ({examCategory === 'periodic' ? '0,25đ' : '0,5đ'})
                            </option>
                            <option value="true_false">
                              TN đúng sai (4 nhận định - 1,0đ)
                            </option>
                            <option value="short_answer">
                              Điền ngắn (2 chỗ điền - 1,0đ)
                            </option>
                            <option value="essay">
                              Tự luận (1,0đ)
                            </option>
                          </select>
                        </div>

                        <span className="text-[11px] font-bold text-slate-500">
                          {q.type === 'multiple_choice' && `(Mỗi câu ${examCategory === 'periodic' ? '0,25' : '0,5'} điểm)`}
                          {q.type === 'true_false' && '(Mỗi câu 1đ và 4 nhận định a, b, c, d)'}
                          {q.type === 'short_answer' && '(Mỗi câu 1đ, 2 chỗ điền số 0,5đ)'}
                          {q.type === 'essay' && '(Mỗi câu 1,0 điểm)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddQuestionAfter(idx, q.type)}
                          className="text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Thêm một câu hỏi mới ngay bên dưới câu này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm câu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveManualQuestion(idx)}
                          className="text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Xóa câu hỏi này khỏi đề thi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa câu hỏi</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nội dung câu hỏi (tự động chuẩn hóa số mũ & công thức hóa học như H2O, SO4^2-, 10^23):
                      </label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateManualQuestion(idx, 'question', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                      <div className="mt-1 text-[11px] text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        <span className="font-bold text-slate-500 mr-1">Hiển thị chuẩn:</span>
                        <FormulaText text={q.question} className="font-semibold text-slate-900" />
                      </div>
                    </div>

                    {/* Ảnh minh họa cho câu hỏi */}
                    <div className="p-2.5 bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ảnh minh họa cho câu hỏi (sơ đồ, hình vẽ, đồ thị...):</span>
                        </span>
                        {q.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleUpdateManualQuestion(idx, 'imageUrl', undefined)}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                          >
                            ✕ Xóa ảnh
                          </button>
                        )}
                      </div>

                      {q.imageUrl ? (
                        <div className="relative group max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                          <img src={q.imageUrl} alt="Ảnh minh họa" className="max-h-44 max-w-full object-contain mx-auto" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-blue-200 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh từ máy / điện thoại</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const optimized = await compressAndOptimizeImage(file);
                                  handleUpdateManualQuestion(idx, 'imageUrl', optimized);
                                }
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, WebP rõ nét</span>
                        </div>
                      )}
                    </div>

                    {/* PHẦN I: 4 LỰA CHỌN A, B, C, D */}
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const letter = ['A', 'B', 'C', 'D'][optIdx];
                          const isCorrect = q.correctAnswer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`flex flex-col gap-1 p-2 rounded-xl border transition-all ${
                                isCorrect 
                                  ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' 
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateManualQuestion(idx, 'correctAnswer', optIdx)}
                                  className={`w-7 h-7 rounded-lg font-black text-xs shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                                    isCorrect 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title={`Chọn ${letter} làm đáp án đúng`}
                                >
                                  {letter}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateManualOption(idx, optIdx, e.target.value)}
                                  className="flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none"
                                  placeholder={`Phương án ${letter}`}
                                />
                                {isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </div>
                              <div className="pl-9 text-[10px] text-slate-500">
                                <FormulaText text={opt} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* PHẦN II: 4 Ý ĐÚNG / SAI (a, b, c, d) */}
                    {q.type === 'true_false' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-purple-900">
                          4 ý nhận định a, b, c, d (Bấm chọn Đúng hoặc Sai cho từng ý):
                        </label>
                        {q.statements.map((st, sIdx) => (
                          <div key={st.subId} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-purple-200">
                            <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0">
                              {st.subId})
                            </span>
                            <input
                              type="text"
                              value={st.text}
                              onChange={(e) => handleUpdateManualTfStatement(idx, sIdx, 'text', e.target.value)}
                              className="flex-1 text-xs font-medium text-slate-800 outline-none border-b border-transparent focus:border-purple-400 py-1"
                              placeholder={`Nội dung nhận định ${st.subId}...`}
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateManualTfStatement(idx, sIdx, 'isCorrect', true)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                  st.isCorrect
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateManualTfStatement(idx, sIdx, 'isCorrect', false)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                  !st.isCorrect
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Sai
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PHẦN III: CÂU ĐIỀN NGẮN (2 CHỖ ĐIỀN SỐ) */}
                    {q.type === 'short_answer' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[0, 1].map((bIdx) => {
                          const blank = q.blanks?.[bIdx] || {
                            id: String(bIdx + 1),
                            label: `Chỗ điền số (${bIdx + 1})`,
                            acceptableAnswers: [q.acceptableAnswers?.[bIdx] || '10'],
                            unit: '',
                            points: 0.5
                          };
                          return (
                            <div key={bIdx} className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                              <label className="block text-[11px] font-bold text-amber-900">
                                Chỗ điền số ({bIdx + 1}) — 0.5 điểm:
                              </label>
                              <input
                                type="text"
                                value={blank.acceptableAnswers.join(', ')}
                                onChange={(e) => handleUpdateManualSaBlank(idx, bIdx, e.target.value, blank.unit)}
                                className="w-full px-2.5 py-1.5 bg-amber-50/40 border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-amber-600"
                                placeholder="Nhập đáp án số (VD: 15, 15.0)"
                              />
                              <input
                                type="text"
                                value={blank.unit || ''}
                                onChange={(e) => handleUpdateManualSaBlank(idx, bIdx, blank.acceptableAnswers.join(', '), e.target.value)}
                                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 outline-none"
                                placeholder="Đơn vị (nếu có, VD: N, m/s, mol, g...)"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* PHẦN IV: CÂU TỰ LUẬN (CHO ĐỀ KIỂM TRA ĐỊNH KÌ HOẶC CÂU TỰ LUẬN) */}
                    {q.type === 'essay' && (
                      <div className="space-y-3 bg-white p-3.5 rounded-xl border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <span>Câu Tự luận — Mặc định 1,0 điểm / câu</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Điểm số:</label>
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              max="5"
                              value={(q as any).points ?? 1.0}
                              onChange={(e) => handleUpdateManualQuestion(idx, 'points', parseFloat(e.target.value) || 1.0)}
                              className="w-16 p-1 bg-indigo-50/50 border border-indigo-200 rounded text-xs font-bold text-indigo-900 text-center"
                            />
                            <span className="text-xs font-bold text-slate-700">điểm</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Hướng dẫn đáp án mẫu / Lời giải chi tiết:
                          </label>
                          <textarea
                            rows={2}
                            value={(q as any).sampleAnswer || ''}
                            onChange={(e) => handleUpdateManualQuestion(idx, 'sampleAnswer', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                            placeholder="Ghi các bước giải mẫu hoặc ý cốt lõi của câu tự luận..."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Thang điểm chi tiết (Grading Guide):
                          </label>
                          <input
                            type="text"
                            value={(q as any).gradingGuide || ''}
                            onChange={(e) => handleUpdateManualQuestion(idx, 'gradingGuide', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                            placeholder="VD: Nêu đúng định luật (0.5đ); Viết đúng công thức & tính ra kết quả (0.5đ)..."
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Giải thích đáp án:</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateManualQuestion(idx, 'explanation', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-600"
                        placeholder="Giải thích vì sao đáp án này đúng..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TẠO TỰ ĐỘNG BẰNG AI */}
          {activeMethod === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-black text-sm text-purple-950">
                    Trợ Lý AI Gemini Soạn Đề Tự Động Theo Chuẩn GDPT 2018
                  </h4>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Hệ thống AI sẽ tự động phân tích chuẩn ma trận kiến thức KHTN của Trường THCS & THPT Y Đôn, tạo đầy đủ câu hỏi, 4 phương án lựa chọn và đáp án chính xác 100%.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Chủ đề bài học / Nội dung kiến thức trọng tâm:
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Ví dụ: Áp suất chất lỏng và Lực đẩy Archimedes..."
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số lượng câu trắc nghiệm:</label>
                    <select
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                    >
                      <option value={10}>10 câu (Tiêu chuẩn KTTX)</option>
                      <option value={16}>16 câu (Chuẩn trắc nghiệm ma trận)</option>
                      <option value={20}>20 câu (Khảo sát toàn diện)</option>
                    </select>
                  </div>
                </div>

                {/* Suggested Topics Pill */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Gợi ý chủ đề chương trình môn {subject === 'physics' ? 'Vật lí' : subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(sampleTopics[subject] || []).map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiTopic(t)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-purple-800 border border-purple-200 transition-colors font-semibold cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isAiLoading}
                    onClick={handleGenerateWithAI}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        <span>AI Đang Soạn Đề Kiểm Tra Chuẩn Sư Phạm...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Bấm Để AI Gemini Soạn Đề Tự Động</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Preview AI Exam Questions */}
              {aiGeneratedExam && aiGeneratedExam.questions && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Đã tạo thành công {aiGeneratedExam.questions.length} câu hỏi trắc nghiệm!
                    </span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {aiGeneratedExam.title}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {aiGeneratedExam.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800"><FormulaText text={q.question} /></p>
                          {q.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateAiQuestionImage(idx, undefined)}
                              className="text-rose-600 hover:text-rose-700 text-[10px] font-bold shrink-0 cursor-pointer"
                            >
                              ✕ Xóa ảnh
                            </button>
                          )}
                        </div>

                        {q.imageUrl && (
                          <div className="relative group max-h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5">
                            <img src={q.imageUrl} alt="Ảnh minh họa" className="max-h-40 max-w-full object-contain mx-auto" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-purple-200">
                            <Upload className="w-3 h-3" />
                            <span>{q.imageUrl ? 'Đổi ảnh minh họa' : '+ Đính kèm ảnh minh họa câu hỏi'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const optimized = await compressAndOptimizeImage(file);
                                  handleUpdateAiQuestionImage(idx, optimized);
                                }
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, WebP</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pl-2">
                          {(q as MultipleChoiceQuestion).options?.map((opt, optIdx) => {
                            const isCorrect = (q as MultipleChoiceQuestion).correctAnswer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`px-2 py-1 rounded text-[11px] ${
                                  isCorrect ? 'bg-emerald-100 font-bold text-emerald-900 border border-emerald-300' : 'text-slate-600'
                                }`}
                              >
                                {['A', 'B', 'C', 'D'][optIdx]}. <FormulaText text={opt} />
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                            💡 Giải thích: <FormulaText text={q.explanation} />
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UP FILE WORD THEO MẪU CỦA APP */}
          {activeMethod === 'upload_file' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      W
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-blue-950">
                        Nạp Đề Từ File Mẫu Microsoft Word Chuẩn GDPT 2018
                      </h4>
                      <span className="text-[11px] text-blue-700 font-medium">
                        Cấu trúc 3 phần: 16 trắc nghiệm nhiều lựa chọn + 1 câu đúng/sai (4 nhận định) + 1 câu trả lời ngắn (2 chỗ điền số)
                      </span>
                    </div>
                  </div>

                  {/* Multi-format Template Download & Copy Action Bar */}
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadDocx(subject)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      title="Tải tệp Word chuẩn (.docx) tương thích mọi phiên bản MS Word 2013-2024"
                    >
                      <Download className="w-4 h-4" />
                      <span>📥 Tải Mẫu Word (.docx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(subject)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Tải tệp Word (.doc) tương thích nhanh"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tải (.doc)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(subject)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Tải tệp văn bản thuần (.txt)"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tải (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className={`px-3 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isCopiedTemplate
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title="Sao chép nội dung mẫu để dán vào Word hoặc Google Docs"
                    >
                      {isCopiedTemplate ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isCopiedTemplate ? 'Đã sao chép!' : 'Sao chép mẫu'}</span>
                    </button>
                  </div>
                </div>

                {/* Subject Selector for Download */}
                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-blue-100/60">
                  <span className="text-[11px] font-bold text-blue-900">Tải file mẫu sẵn theo phân môn:</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocx('physics')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      subject === 'physics'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Vật lí 8 (.docx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocx('chemistry')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      subject === 'chemistry'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Hóa học 8 (.docx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocx('biology')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      subject === 'biology'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Sinh học 8 (.docx)</span>
                  </button>
                </div>

                <div className="text-xs text-blue-900 leading-relaxed bg-white/80 p-3 rounded-xl border border-blue-100 space-y-1">
                  <p>
                    📄 <strong>Hướng dẫn thực hiện:</strong> Thầy/Cô bấm <strong>"Tải Mẫu Word (.docx)"</strong> (hoặc chọn phân môn phía trên), soạn nội dung câu hỏi theo cấu trúc chuẩn rồi kéo thả file Word vào khung bên dưới. Hệ thống sẽ tự động bóc tách 100% nội dung, nhận diện đáp án và đồng bộ vào ngân hàng đề thi!
                  </p>
                </div>

                {/* File Upload Area */}
                <div className={`p-6 border-2 border-dashed rounded-2xl bg-white text-center space-y-2 transition-all relative shadow-2xs ${
                  isUploading ? 'border-amber-400 bg-amber-50/50' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer'
                }`}>
                  <input
                    type="file"
                    accept=".docx,.doc,.txt"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-black text-lg shadow-2xs">
                    {isUploading ? <RefreshCw className="w-6 h-6 animate-spin text-blue-600" /> : 'W'}
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {isUploading ? 'Đang đọc và phân tích cấu trúc file Word...' : 'Bấm để chọn file Word (.docx, .doc, .txt) hoặc kéo thả file vào đây'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tối ưu mọi định dạng <strong>.docx</strong>, <strong>.doc</strong>, <strong>.txt</strong> — Khắc phục triệt để lỗi font chữ tiếng Việt và lỗi cấu trúc.
                  </p>
                </div>

                {/* Direct Text Paste Option (Fail-safe for teachers) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDirectEditor(!showDirectEditor)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer underline"
                  >
                    <span>{showDirectEditor ? '▲ Thu gọn ô nhập văn bản trực tiếp' : '▼ Hoặc dán / chỉnh sửa trực tiếp nội dung đề thi vào đây'}</span>
                  </button>

                  {showDirectEditor && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-bold">Nội dung văn bản đề thi (Dán trực tiếp từ Word / Google Docs):</span>
                        <span className="text-[10px] text-slate-400">Tự động giữ nguyên mã UTF-8 tiếng Việt</span>
                      </div>
                      <textarea
                        value={uploadedFileText}
                        onChange={(e) => setUploadedFileText(e.target.value)}
                        placeholder="Dán nội dung đề thi vào đây theo cấu trúc [TIÊU ĐỀ: ...], Phần 1, Phần 2, Phần 3..."
                        rows={8}
                        className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setUploadedFileText(generateExamPlainTextTemplate(subject))}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Điền mẫu đề thi hiện tại
                        </button>
                        <button
                          type="button"
                          onClick={() => parseUploadedText(uploadedFileText)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Phân tích & Cập nhật vào đề thi</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessInfo && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{uploadSuccessInfo}</div>
                </div>
              )}

              {/* Uploaded Questions Preview */}
              {uploadedQuestions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-extrabold text-xs text-slate-700">
                    Xem trước {uploadedQuestions.length} câu hỏi đã nạp từ file:
                  </h5>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {uploadedQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800"><FormulaText text={q.question} /></p>
                          {q.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateUploadedQuestionImage(idx, undefined)}
                              className="text-rose-600 hover:text-rose-700 text-[10px] font-bold shrink-0 cursor-pointer"
                            >
                              ✕ Xóa ảnh
                            </button>
                          )}
                        </div>

                        {q.imageUrl && (
                          <div className="relative group max-h-44 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5">
                            <img src={q.imageUrl} alt="Ảnh minh họa" className="max-h-40 max-w-full object-contain mx-auto" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-blue-200">
                            <Upload className="w-3 h-3" />
                            <span>{q.imageUrl ? 'Đổi ảnh minh họa' : '+ Đính kèm ảnh minh họa câu hỏi'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const optimized = await compressAndOptimizeImage(file);
                                  handleUpdateUploadedQuestionImage(idx, optimized);
                                }
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, WebP</span>
                        </div>

                        {q.type === 'multiple_choice' && (
                          <div className="grid grid-cols-2 gap-1 pl-2 text-[11px]">
                            {q.options.map((opt, optIdx) => (
                              <span
                                key={optIdx}
                                className={q.correctAnswer === optIdx ? 'font-bold text-emerald-700' : 'text-slate-600'}
                              >
                                {['A', 'B', 'C', 'D'][optIdx]}. <FormulaText text={opt} /> {q.correctAnswer === optIdx && '✓'}
                              </span>
                            ))}
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="space-y-1 pl-2 text-[11px] bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                            <span className="font-bold text-indigo-800 block text-[10px] uppercase">
                              4 Nhận định Đúng/Sai (Thông hiểu - 1.0 điểm):
                            </span>
                            {q.statements.map((st) => (
                              <div key={st.subId} className="flex items-center justify-between gap-2">
                                <span className="text-slate-700">
                                  <strong className="uppercase mr-1">{st.subId})</strong> <FormulaText text={st.text} />
                                </span>
                                <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] shrink-0 ${
                                  st.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'short_answer' && (
                          <div className="space-y-1.5 pl-2 text-[11px] bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                            <span className="font-bold text-emerald-800 block text-[10px] uppercase">
                              2 Chỗ điền số (Vận dụng thấp - 1.0 điểm):
                            </span>
                            {q.blanks && q.blanks.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.blanks.map((b, bIdx) => (
                                  <div key={b.id || bIdx} className="bg-white p-2 rounded border border-emerald-200">
                                    <span className="font-semibold text-slate-700"><FormulaText text={b.label || `Chỗ điền (${bIdx + 1})`} />: </span>
                                    <span className="font-mono font-bold text-emerald-700">{b.acceptableAnswers.join(' / ')} {b.unit ? <FormulaText text={b.unit} /> : ''}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">(0.5đ)</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white p-2 rounded border border-emerald-200">
                                <span className="text-slate-600">Đáp án: </span>
                                <span className="font-mono font-bold text-emerald-700">{q.acceptableAnswers.join(' / ')} {q.unit ? <FormulaText text={q.unit} /> : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleFinalSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu & Tạo Đề Kiểm Tra Vào Hệ Thống</span>
          </button>
        </div>

      </div>
    </div>
  );
}
