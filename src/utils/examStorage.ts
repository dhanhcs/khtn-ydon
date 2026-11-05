import {
  QuizItem,
  QuizQuestionMultipleChoice,
  QuizQuestionTrueFalse,
  QuizQuestionFillInBlank,
  QuizQuestionEssay,
  FileAttachment,
  QuizSubmission,
  HomeworkSubmission,
  ExamResultRecord,
  AnnouncementComment,
  MaterialItem,
  VideoExperimentItem,
  MediaActivityEntry,
  MediaActivityLog,
  YoutubeChannelData,
  YoutubeLessonLink,
  YoutubePostItem,
  OnlineClassSessionItem,
  OnlineMeetingLink,
} from '../types';
import mammoth from 'mammoth';
import {
  getActiveStudentRoster,
  verifyStudentInRoster,
  normalizeVietnamese,
} from './studentRoster';
import {
  readPersistedKey,
  writePersistedKey,
  cacheAttachmentInMemoryAndIDB,
  resolveAttachmentDataUrl,
  markItemDeleted,
  hasViewedInCurrentSession,
  initCloudPersistence,
  pushAttachmentToCloud,
} from './cloudPersistence';

export const DEFAULT_EXAM_BANK: QuizItem[] = [
  {
    id: 'quiz-default-1',
    title: 'Đề Khảo Sát Kiến Thức Hóa Học 8 & 9 - Chuyên Đề Phản Ứng & Hợp Chất Vô Cơ',
    grade: 'Khối 8-9',
    topic: 'Oxit, Axit, Bazơ, Muối và Kim Loại',
    chapter: 'Chương 1 - Các loại hợp chất vô cơ',
    durationMinutes: 45,
    totalPoints: 10,
    status: 'published',
    targetClasses: 'Tất cả các lớp H8, H9',
    openTime: '',
    closeTime: '',
    isTimeRestricted: false,
    createdAt: new Date().toISOString(),
    multipleChoice: [
      {
        id: 1,
        question: 'Dãy oxit nào sau đây đều là oxit bazơ?',
        options: ['A. Na₂O, CaO, BaO, CuO', 'B. SO₂, CO₂, P₂O₅, N₂O₅', 'C. CaO, CO₂, Al₂O₃, Fe₂O₃', 'D. SO₃, BaO, Na₂O, K₂O'],
        correctOptionIndex: 0,
        explanation: 'Na₂O, CaO, BaO, CuO là các oxit bazơ tác dụng với axit tạo thành muối và nước.',
        points: 0.25,
      },
      {
        id: 2,
        question: 'Chất nào sau đây làm đổi màu quỳ tím ẩm thành đỏ?',
        options: ['A. Dung dịch NaOH', 'B. Dung dịch HCl', 'C. Dung dịch NaCl', 'D. Nước cất'],
        correctOptionIndex: 1,
        explanation: 'Dung dịch axit (HCl, H₂SO₄, HNO₃) làm quỳ tím chuyển sang màu đỏ.',
        points: 0.25,
      },
      {
        id: 3,
        question: 'Để nhận biết hai dung dịch không màu HCl và H₂SO₄, người ta dùng thuốc thử nào?',
        options: ['A. Quỳ tím', 'B. Dung dịch phenolphtalein', 'C. Dung dịch BaCl₂', 'D. Kim loại Cu'],
        correctOptionIndex: 2,
        explanation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ (kết tủa trắng không tan) + 2HCl. BaCl₂ không phản ứng với HCl.',
        points: 0.25,
      },
      {
        id: 4,
        question: 'Cho mẩu sắt (Fe) vào ống nghiệm chứa dung dịch CuSO₄, hiện tượng quan sát được là:',
        options: [
          'A. Sắt tan ra, có khí thoát ra mạnh',
          'B. Dung dịch chuyển sang màu đỏ tím, không có kết tủa',
          'C. Có chất rắn màu đỏ (Cu) bám ngoài mẩu sắt, màu xanh lam của dung dịch nhạt dần',
          'D. Không có hiện tượng gì xảy ra',
        ],
        correctOptionIndex: 2,
        explanation: 'Fe + CuSO₄ → FeSO₄ + Cu↓ (Cu màu đỏ bám trên đinh sắt, màu xanh của ion Cu²⁺ nhạt dần).',
        points: 0.25,
      },
      {
        id: 5,
        question: 'Dung dịch nào sau đây phản ứng được với Al nhưng không phản ứng được với Cu?',
        options: ['A. Dung dịch HCl loãng', 'B. Dung dịch AgNO₃', 'C. Dung dịch H₂SO₄ đặc nóng', 'D. Dung dịch HNO₃ loãng'],
        correctOptionIndex: 0,
        explanation: 'Al đứng trước H trong dãy hoạt động hóa học nên tác dụng với HCl loãng. Cu đứng sau H nên không phản ứng.',
        points: 0.25,
      },
      {
        id: 6,
        question: 'Công thức hóa học của vôi sống là:',
        options: ['A. CaCO₃', 'B. Ca(OH)₂', 'C. CaO', 'D. CaSO₄'],
        correctOptionIndex: 2,
        explanation: 'Vôi sống là Canxi oxit (CaO). Canxi cacbonat (CaCO₃) là đá vôi, Canxi hidroxit (Ca(OH)₂) là vôi tôi.',
        points: 0.25,
      },
      {
        id: 7,
        question: 'Khí nào sau đây là nguyên nhân chủ yếu gây ra hiện tượng mưa axit?',
        options: ['A. Khí O₂ và N₂', 'B. Khí SO₂ và NO₂', 'C. Khí H₂ và CH₄', 'D. Khí He và Ne'],
        correctOptionIndex: 1,
        explanation: 'Khí SO₂ và các oxit nitơ (NOx) tan trong nước mưa tạo thành axit sunfuric và axit nitric gây mưa axit.',
        points: 0.25,
      },
      {
        id: 8,
        question: 'Kim loại nào sau đây dẫn điện và dẫn nhiệt tốt nhất?',
        options: ['A. Nhôm (Al)', 'B. Đồng (Cu)', 'C. Bạc (Ag)', 'D. Sắt (Fe)'],
        correctOptionIndex: 2,
        explanation: 'Bạc (Ag) dẫn điện, dẫn nhiệt tốt nhất, tiếp theo là Đồng (Cu), Vàng (Au), Nhôm (Al), Sắt (Fe).',
        points: 0.25,
      },
      {
        id: 9,
        question: 'Phản ứng giữa axit và bazơ luôn tạo thành:',
        options: ['A. Muối và nước', 'B. Muối và khí hidro', 'C. Bazơ mới và axit mới', 'D. Kim loại và oxit axit'],
        correctOptionIndex: 0,
        explanation: 'Phản ứng trung hòa: Axit + Bazơ → Muối + Nước.',
        points: 0.25,
      },
      {
        id: 10,
        question: 'Nung hoàn toàn 10 gam CaCO₃ thì thu được bao nhiêu lít khí CO₂ ở đktc?',
        options: ['A. 1,12 lít', 'B. 2,24 lít', 'C. 3,36 lít', 'D. 4,48 lít'],
        correctOptionIndex: 1,
        explanation: 'CaCO₃ → CaO + CO₂↑. n_CaCO₃ = 10 / 100 = 0,1 mol. n_CO₂ = 0,1 mol -> V = 0,1 * 22,4 = 2,24 lít.',
        points: 0.25,
      },
      {
        id: 11,
        question: 'Để trung hòa hoàn toàn 200 ml dung dịch NaOH 1M, cần bao nhiêu ml dung dịch HCl 1M?',
        options: ['A. 100 ml', 'B. 200 ml', 'C. 300 ml', 'D. 400 ml'],
        correctOptionIndex: 1,
        explanation: 'HCl + NaOH → NaCl + H₂O. n_NaOH = 0,2 * 1 = 0,2 mol -> n_HCl = 0,2 mol -> V_HCl = 0,2 / 1 = 0,2 lít = 200 ml.',
        points: 0.25,
      },
      {
        id: 12,
        question: 'Chất nào sau đây không tan trong nước?',
        options: ['A. Na₂CO₃', 'B. K₂SO₄', 'C. BaSO₄', 'D. CuCl₂'],
        correctOptionIndex: 2,
        explanation: 'BaSO₄ là kết tủa trắng đặc trưng không tan trong nước và axit loãng.',
        points: 0.25,
      },
    ],
    trueFalse: [
      {
        id: 21,
        scenario: 'Thí nghiệm: Cho mẩu kim loại Natri (Na) bằng hạt đậu xanh vào cốc thủy tinh chứa 100 ml nước có thêm 2 giọt dung dịch phenolphtalein.',
        statements: [
          { label: 'a', text: 'Mẩu natri nóng chảy thành giọt tròn chạy nhanh trên mặt nước.', isCorrect: true },
          { label: 'b', text: 'Phản ứng sinh ra chất khí có mùi hắc làm xanh quỳ tím ẩm.', isCorrect: false },
          { label: 'c', text: 'Dung dịch thu được trong cốc chuyển sang màu hồng đậm.', isCorrect: true },
          { label: 'd', text: 'Phương trình hóa học là 2Na + 2H₂O → 2NaOH + H₂↑, phản ứng tỏa nhiều nhiệt.', isCorrect: true },
        ],
        explanation: 'Natri phản ứng với nước tạo bazơ NaOH (làm hồng phenolphtalein) và khí H₂ không màu, không mùi.',
      },
    ],
    fillInBlank: [
      {
        id: 23,
        text: 'Nhiệt phân hoàn toàn 15,8 gam thuốc tím KMnO₄ ở nhiệt độ cao, thu được [blank1] gam muối K₂MnO₄ và [blank2] lít khí O₂ ở điều kiện tiêu chuẩn (đktc).',
        blanks: [
          { index: 1, answer: '9.85', unit: 'gam' },
          { index: 2, answer: '1.12', unit: 'lít' },
        ],
        explanation: '2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑. M_KMnO₄ = 158 g/mol -> n = 0,1 mol. n_K₂MnO₄ = 0,05 mol -> m = 0,05 * 197 = 9,85 gam. n_O₂ = 0,05 mol -> V = 0,05 * 22,4 = 1,12 lít.',
      },
    ],
    essay: [
      {
        id: 25,
        question: 'Hòa tan hoàn toàn 16 gam hỗn hợp gồm bột Fe và Fe₂O₃ bằng lượng vừa đủ dung dịch axit clohidric HCl 14,6%, sau phản ứng thu được 2,24 lít khí H₂ (ở đktc). Hãy tính thành phần phần trăm theo khối lượng của mỗi chất trong hỗn hợp ban đầu và khối lượng dung dịch HCl đã dùng.',
        solutionGuide: 'Fe + 2HCl → FeCl₂ + H₂↑ (1); Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O (2). Từ n_H₂ = 0,1 mol -> n_Fe = 0,1 mol -> m_Fe = 5,6g (35%); m_Fe₂O₃ = 10,4g (65%). n_HCl tổng = 0,2 + 0,39 = 0,59 mol -> m_dd HCl = (0,59 * 36,5 / 14,6%) = 147,5 gam.',
        points: 1.0,
      },
    ],
  },
  {
    id: 'quiz-default-2',
    title: 'Đề Thi Thử Học Kỳ I Môn Hóa Học Lớp 9 - Đề Số 01',
    grade: 'Khối 9',
    topic: 'Tổng Hợp Axit - Bazơ - Muối & Kim Loại',
    chapter: 'Học kỳ I',
    durationMinutes: 60,
    totalPoints: 10,
    status: 'published',
    targetClasses: 'Khối 9 (H9.1, H9.2, H9.3)',
    openTime: '',
    closeTime: '',
    isTimeRestricted: false,
    createdAt: new Date().toISOString(),
    multipleChoice: [
      {
        id: 1,
        question: 'Dung dịch axit clohidric tác dụng với chất nào sau đây tạo ra khí màu vàng lục có mùi hắc?',
        options: ['A. CaCO₃', 'B. MnO₂ (khi đun nóng)', 'C. Cu', 'D. FeO'],
        correctOptionIndex: 1,
        explanation: 'MnO₂ + 4HCl (đặc, nóng) → MnCl₂ + Cl₂↑ + 2H₂O. Khí clo có màu vàng lục.',
        points: 0.5,
      },
      {
        id: 2,
        question: 'Cho 0,1 mol Al tác dụng hoàn toàn với dung dịch NaOH dư. Thể tích khí H₂ thu được ở đktc là:',
        options: ['A. 2,24 lít', 'B. 3,36 lít', 'C. 4,48 lít', 'D. 6,72 lít'],
        correctOptionIndex: 1,
        explanation: '2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑. n_H₂ = 1,5 * n_Al = 0,15 mol -> V = 0,15 * 22,4 = 3,36 lít.',
        points: 0.5,
      },
      {
        id: 3,
        question: 'Để làm khô khí SO₂ ẩm, người ta dẫn khí qua bình chứa hóa chất nào sau đây?',
        options: ['A. Dung dịch NaOH đặc', 'B. CaO sống', 'C. H₂SO₄ đặc', 'D. Dung dịch Ca(OH)₂'],
        correctOptionIndex: 2,
        explanation: 'SO₂ là oxit axit nên không phản ứng với H₂SO₄ đặc (axit có tính háo nước mạnh), làm khô an toàn.',
        points: 0.5,
      },
    ],
    trueFalse: [],
    fillInBlank: [],
    essay: [
      {
        id: 1,
        question: 'Cho 10 gam hỗn hợp Fe và Cu vào dung dịch H₂SO₄ loãng dư, thu được 2,24 lít khí H₂ (đktc). Tính phần trăm khối lượng Cu trong hỗn hợp.',
        solutionGuide: 'Chỉ Fe phản ứng với H₂SO₄ loãng: Fe + H₂SO₄ → FeSO₄ + H₂. n_Fe = n_H₂ = 0,1 mol -> m_Fe = 5,6 gam -> m_Cu = 10 - 5,6 = 4,4 gam -> %Cu = 44%.',
        points: 2.0,
      },
    ],
  },
  {
    id: 'quiz-default-3',
    title: 'Đề Tuyển Chọn Học Sinh Giỏi Hóa Học THCS Cấp Tỉnh, Thành Phố - Năm 2025-2026',
    grade: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
    topic: 'Toán Hóa Chuyên Sâu & Nhận Biết Phức Hợp',
    chapter: 'Chuyên đề Bồi Dưỡng HSG Cấp Tỉnh, Thành Phố',
    durationMinutes: 90,
    totalPoints: 10,
    status: 'published',
    targetClasses: 'Đội tuyển HSG Cấp Tỉnh, Thành Phố NĐH',
    openTime: '',
    closeTime: '',
    isTimeRestricted: false,
    createdAt: new Date().toISOString(),
    multipleChoice: [
      {
        id: 1,
        question: 'Hòa tan m gam hỗn hợp gồm Al và Fe vào dung dịch HNO₃ loãng dư, thu được 4,48 lít khí NO duy nhất (đktc). Tổng số mol electron nhường của hỗn hợp kim loại là:',
        options: ['A. 0,2 mol', 'B. 0,4 mol', 'C. 0,6 mol', 'D. 0,8 mol'],
        correctOptionIndex: 2,
        explanation: 'n_NO = 0,2 mol. N⁺⁵ + 3e → N⁺² (NO) -> n_e nhận = 0,2 * 3 = 0,6 mol = n_e nhường.',
        points: 1.0,
      },
    ],
    trueFalse: [],
    fillInBlank: [],
    essay: [
      {
        id: 1,
        question: 'Dẫn khí CO dư đi qua ống sứ chứa 15,2 gam hỗn hợp FeO và Fe₂O₃ nung nóng. Khí sinh ra dẫn vào dung dịch Ca(OH)₂ dư thu được 25 gam kết tủa trắng. Tính phần trăm khối lượng FeO trong hỗn hợp ban đầu.',
        solutionGuide: 'n_CO₂ = n_CaCO₃ = 25/100 = 0,25 mol. n_O(trong oxit) = n_CO₂ = 0,25 mol. Gọi n_FeO = x, n_Fe₂O₃ = y. Ta có: 72x + 160y = 15,2 và x + 3y = 0,25 -> x = 0,1; y = 0,05. m_FeO = 7,2g (47,37%); m_Fe₂O₃ = 8g (52,63%).',
        points: 4.0,
      },
    ],
  },
];

const STORAGE_KEY = 'ndh_exam_bank';

/**
 * Retrieve exams from localStorage, initialized with DEFAULT_EXAM_BANK
 */
export function getStoredExams(): QuizItem[] {
  const parsed = readPersistedKey<QuizItem[]>(STORAGE_KEY, DEFAULT_EXAM_BANK);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed;
  }
  return DEFAULT_EXAM_BANK;
}

/**
 * Save all exams into IndexedDB, localStorage AND Universal Cloud Store for cross-device sync
 */
export function saveAllExams(exams: QuizItem[]): void {
  writePersistedKey(STORAGE_KEY, exams, { eventName: 'ndh-exams-updated' });
}

/**
 * Save or update a single exam in storage
 */
export function saveExamItem(quiz: QuizItem): QuizItem[] {
  const current = getStoredExams();
  const existingIdx = current.findIndex((q) => q.id === quiz.id);

  let updated: QuizItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...quiz };
  } else {
    const newQuiz = {
      ...quiz,
      id: quiz.id || 'quiz-' + Date.now(),
      createdAt: quiz.createdAt || new Date().toISOString(),
    };
    updated = [newQuiz, ...current];
  }

  saveAllExams(updated);
  return updated;
}

/**
 * Delete an exam by ID
 */
export function deleteExamItem(quizId: string): QuizItem[] {
  markItemDeleted(quizId);
  const current = getStoredExams();
  const updated = current.filter((q) => q.id !== quizId);
  saveAllExams(updated);
  return updated;
}

/**
 * Toggle exam status between 'published' and 'closed'
 */
export function toggleExamStatus(quizId: string): { updatedExams: QuizItem[]; newStatus: 'published' | 'closed' } {
  const current = getStoredExams();
  let newStatus: 'published' | 'closed' = 'published';

  const updated = current.map((q) => {
    if (q.id === quizId) {
      newStatus = q.status === 'published' ? 'closed' : 'published';
      return { ...q, status: newStatus };
    }
    return q;
  });

  saveAllExams(updated);
  return { updatedExams: updated, newStatus };
}

/**
 * Check if an exam is currently open based on status and optional timing window
 */
export function isExamAccessible(quiz: QuizItem): { isOpen: boolean; reason?: string } {
  if (quiz.status === 'closed') {
    return { isOpen: false, reason: 'Đề kiểm tra đang tạm khóa bởi Thầy Nguyễn Đình Hành.' };
  }

  if (quiz.status === 'draft') {
    return { isOpen: false, reason: 'Đề kiểm tra đang ở chế độ bản nháp (chưa mở).' };
  }

  const now = new Date();

  if (quiz.isTimeRestricted) {
    if (quiz.openTime) {
      const openDate = new Date(quiz.openTime);
      if (now < openDate) {
        return {
          isOpen: false,
          reason: `Đề thi chưa mở. Thời gian mở thi: ${openDate.toLocaleString('vi-VN')}`,
        };
      }
    }

    if (quiz.closeTime) {
      const closeDate = new Date(quiz.closeTime);
      if (now > closeDate) {
        return {
          isOpen: false,
          reason: `Đề thi đã hết hạn vào lúc: ${closeDate.toLocaleString('vi-VN')}`,
        };
      }
    }
  }

  return { isOpen: true };
}

/**
 * Intelligent parser for text copied from Word or plain text files
 * Handles format:
 * Câu 1: [Câu hỏi]
 * A. [Lựa chọn 1]
 * B. [Lựa chọn 2]
 * C. [Lựa chọn 3]
 * D. [Lựa chọn 4]
 * Đáp án: A (hoặc ĐA: A, Key: A, Đáp án đúng: A)
 * Lời giải: [Giải thích chi tiết]
 */
export function parseWordExamContent(rawText: string): {
  title: string;
  durationMinutes: number;
  grade: string;
  multipleChoice: QuizQuestionMultipleChoice[];
  unparsedNotice?: string;
} {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());

  let title = 'Đề thi Hóa Học THCS (Tải từ file Word)';
  let durationMinutes = 45;
  let grade = 'Khối 8-9';

  // Try extracting header info
  for (const line of lines.slice(0, 10)) {
    if (/tiêu đề|tên đề|đề thi/i.test(line) && line.includes(':')) {
      title = line.split(':')[1].trim() || title;
    }
    if (/thời gian/i.test(line) && /\d+/.test(line)) {
      const m = line.match(/(\d+)/);
      if (m) durationMinutes = parseInt(m[1], 10);
    }
    if (/khối|lớp/i.test(line) && line.includes(':')) {
      grade = line.split(':')[1].trim() || grade;
    }
  }

  // Regex splitter for questions: matches "Câu 1:", "Câu 2.", "1.", "Bài 1:"
  const questionBlocks: string[] = [];
  let currentBlock: string[] = [];

  const questionHeaderRegex = /^(câu\s*\d+[\.:]|bài\s*\d+[\.:]|\d+\.\s+)/i;

  for (const line of lines) {
    if (questionHeaderRegex.test(line)) {
      if (currentBlock.length > 0) {
        questionBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    }
    currentBlock.push(line);
  }
  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock.join('\n'));
  }

  const multipleChoice: QuizQuestionMultipleChoice[] = [];

  questionBlocks.forEach((block, idx) => {
    const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (blockLines.length === 0) return;

    let questionText = blockLines[0].replace(questionHeaderRegex, '').trim();
    let options: string[] = [];
    let correctOptionIndex = 0;
    let explanation = '';

    for (let i = 1; i < blockLines.length; i++) {
      const l = blockLines[i];

      // Match Option A., B., C., D.
      if (/^[A-D]\.\s*/i.test(l)) {
        options.push(l);
      }
      // Match Answer line: "Đáp án: A", "ĐA: B", "Key: C", "Đáp án đúng: D"
      else if (/^(đáp\s*án|đa|key|đáp\s*án\s*đúng)\s*[:=]\s*([A-D])/i.test(l)) {
        const match = l.match(/^(?:đáp\s*án|đa|key|đáp\s*án\s*đúng)\s*[:=]\s*([A-D])/i);
        if (match && match[1]) {
          const letter = match[1].toUpperCase();
          if (letter === 'A') correctOptionIndex = 0;
          else if (letter === 'B') correctOptionIndex = 1;
          else if (letter === 'C') correctOptionIndex = 2;
          else if (letter === 'D') correctOptionIndex = 3;
        }
      }
      // Match explanation: "Lời giải: ...", "Giải thích: ..."
      else if (/^(lời\s*giải|giải\s*thích|hướng\s*dẫn)\s*[:=]/i.test(l)) {
        explanation = l.replace(/^(?:lời\s*giải|giải\s*thích|hướng\s*dẫn)\s*[:=]\s*/i, '').trim();
      } else if (options.length === 0 && !explanation) {
        // Continue multi-line question text
        questionText += ' ' + l;
      } else if (explanation) {
        explanation += ' ' + l;
      }
    }

    // Default 4 fallback options if not detected properly
    if (options.length < 2) {
      options = [
        'A. Phương án A',
        'B. Phương án B',
        'C. Phương án C',
        'D. Phương án D',
      ];
    }

    multipleChoice.push({
      id: idx + 1,
      question: questionText || `Câu hỏi số ${idx + 1}`,
      options,
      correctOptionIndex,
      explanation: explanation || 'Lời giải chi tiết do Thầy Nguyễn Đình Hành biên soạn.',
      points: 0.25,
    });
  });

  return {
    title,
    durationMinutes,
    grade,
    multipleChoice,
    unparsedNotice: multipleChoice.length === 0 ? 'Chưa nhận diện được cấu trúc câu hỏi. Hãy kiểm tra định dạng "Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A".' : undefined,
  };
}

/**
 * Extract raw text from Word .docx file using mammoth in browser
 */
export async function extractTextFromDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Generate and trigger download of standard Word sample template (.txt / .docx compliant)
 */
export function downloadSampleWordTemplate(): void {
  const content = `=== ĐỀ THI HÓA HỌC THCS CHUẨN CẤU TRÚC - THẦY NGUYỄN ĐÌNH HÀNH ===
Tiêu đề: Đề Kiểm Tra Khảo Sát Hóa Học THCS - Thầy Nguyễn Đình Hành
Khối: Khối 8-9
Thời gian: 45 phút

Câu 1: Dãy oxit nào sau đây đều là oxit bazơ?
A. Na2O, CaO, BaO, CuO
B. SO2, CO2, P2O5, N2O5
C. CaO, CO2, Al2O3, Fe2O3
D. SO3, BaO, Na2O, K2O
Đáp án: A
Lời giải: Na2O, CaO, BaO, CuO là các oxit bazơ tác dụng với axit tạo thành muối và nước.

Câu 2: Chất nào sau đây làm đổi màu quỳ tím ẩm thành đỏ?
A. Dung dịch NaOH
B. Dung dịch HCl
C. Dung dịch NaCl
D. Nước cất
Đáp án: B
Lời giải: Dung dịch axit (HCl, H2SO4, HNO3) làm quỳ tím chuyển sang màu đỏ.

Câu 3: Để nhận biết hai dung dịch không màu HCl và H2SO4, người ta dùng thuốc thử nào sau đây?
A. Quỳ tím
B. Dung dịch phenolphtalein
C. Dung dịch BaCl2
D. Kim loại Cu
Đáp án: C
Lời giải: BaCl2 + H2SO4 -> BaSO4 kết tủa trắng + 2HCl. BaCl2 không phản ứng với HCl.

Câu 4: Cho mẩu sắt (Fe) vào ống nghiệm chứa dung dịch CuSO4, hiện tượng quan sát được là:
A. Sắt tan ra, có khí thoát ra mạnh
B. Dung dịch chuyển sang màu đỏ tím, không có kết tủa
C. Có chất rắn màu đỏ (Cu) bám ngoài mẩu sắt, màu xanh lam của dung dịch nhạt dần
D. Không có hiện tượng gì xảy ra
Đáp án: C
Lời giải: Fe + CuSO4 -> FeSO4 + Cu (Cu màu đỏ bám trên đinh sắt, màu xanh lam của ion Cu2+ nhạt dần).

Câu 5: Công thức hóa học của vôi sống là:
A. CaCO3
B. Ca(OH)2
C. CaO
D. CaSO4
Đáp án: C
Lời giải: Vôi sống là Canxi oxit CaO. Đá vôi là CaCO3, vôi tôi là Ca(OH)2.
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mau_De_Thi_Word_Hoa_Hoc_NDH.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate intelligent offline AI chemistry exam when network or API key is not ready
 */
export function generateOfflineAiExam(
  grade: string = 'Khối 9',
  topic: string = 'Axit - Bazơ - Muối',
  difficulty: string = 'Vận dụng'
): QuizItem {
  const timestamp = Date.now();
  return {
    id: 'quiz-ai-' + timestamp,
    title: `Bộ Đề Hóa Học ${grade} - Chuyên Đề: ${topic} (${difficulty})`,
    grade,
    topic,
    chapter: `Chuyên đề nâng cao: ${topic}`,
    durationMinutes: 45,
    totalPoints: 10,
    status: 'published',
    targetClasses: `Các lớp ${grade}`,
    openTime: '',
    closeTime: '',
    isTimeRestricted: false,
    createdAt: new Date().toISOString(),
    multipleChoice: [
      {
        id: 1,
        question: `Trong các hợp chất sau, hợp chất nào thuộc loại ${topic.toLowerCase().includes('axit') ? 'axit mạnh' : 'oxit bazơ'}?`,
        options: [
          'A. H₂SO₄',
          'B. NaOH',
          'C. BaCl₂',
          'D. CO₂',
        ],
        correctOptionIndex: 0,
        explanation: 'H₂SO₄ là axit sunfuric - một trong những axit vô cơ mạnh và quan trọng nhất.',
        points: 0.5,
      },
      {
        id: 2,
        question: 'Hiện tượng nào xảy ra khi sục từ từ khí CO₂ đến dư vào dung dịch Ca(OH)₂?',
        options: [
          'A. Xuất hiện kết tủa trắng, sau đó kết tủa tan dần tạo dung dịch trong suốt',
          'B. Chỉ xuất hiện kết tủa trắng và không tan',
          'C. Có khí màu vàng lục thoát ra',
          'D. Dung dịch chuyển sang màu xanh lam',
        ],
        correctOptionIndex: 0,
        explanation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O; khi CO₂ dư: CaCO₃ + CO₂ + H₂O → Ca(HCO₃)₂ (tan).',
        points: 0.5,
      },
      {
        id: 3,
        question: 'Hòa tan hoàn toàn 2,4 gam kim loại Magie (Mg) vào dung dịch axit HCl dư. Thể tích khí H₂ (đktc) thu được là:',
        options: ['A. 1,12 lít', 'B. 2,24 lít', 'C. 3,36 lít', 'D. 4,48 lít'],
        correctOptionIndex: 1,
        explanation: 'Mg + 2HCl → MgCl₂ + H₂↑. n_Mg = 2,4 / 24 = 0,1 mol -> n_H₂ = 0,1 mol -> V = 0,1 * 22,4 = 2,24 lít.',
        points: 0.5,
      },
      {
        id: 4,
        question: 'Dãy kim loại nào sau đây tác dụng được với nước ở nhiệt độ thường tạo thành dung dịch bazơ và giải phóng H₂?',
        options: [
          'A. K, Na, Ba, Ca',
          'B. Fe, Cu, Al, Zn',
          'C. Mg, Al, Fe, Cu',
          'D. Ag, Au, Cu, Hg',
        ],
        correctOptionIndex: 0,
        explanation: 'Các kim loại kiềm và kiềm thổ (K, Na, Ba, Ca) phản ứng mãnh liệt với nước ở nhiệt độ thường.',
        points: 0.5,
      },
      {
        id: 5,
        question: 'Để nhận biết ion sunfat (SO₄²⁻) trong dung dịch, người ta thường dùng thuốc thử nào?',
        options: ['A. Dung dịch BaCl₂ hoặc Ba(OH)₂', 'B. Dung dịch NaOH', 'C. Dung dịch AgNO₃', 'D. Dung dịch HCl'],
        correctOptionIndex: 0,
        explanation: 'Ion Ba²⁺ kết hợp với SO₄²⁻ tạo kết tủa trắng BaSO₄ không tan trong axit mạnh.',
        points: 0.5,
      },
    ],
    trueFalse: [
      {
        id: 21,
        scenario: 'Xét tính chất và ứng dụng của axit sunfuric đặc (H₂SO₄ đặc):',
        statements: [
          { label: 'a', text: 'H₂SO₄ đặc có tính háo nước mạnh và tỏa nhiều nhiệt khi pha loãng với nước.', isCorrect: true },
          { label: 'b', text: 'Khi pha loãng H₂SO₄ đặc, luôn phải rót nhanh nước vào axit.', isCorrect: false },
          { label: 'c', text: 'H₂SO₄ đặc tác dụng với Cu khi đun nóng giải phóng khí SO₂ có mùi hắc.', isCorrect: true },
          { label: 'd', text: 'Dung dịch H₂SO₄ đặc nguội thụ động hóa với Al và Fe.', isCorrect: true },
        ],
        explanation: 'Quy tắc an toàn: Rót từ từ axit vào nước, tuyệt đối không làm ngược lại.',
      },
    ],
    fillInBlank: [
      {
        id: 23,
        text: 'Nung hoàn toàn 50 gam đá vôi chứa 80% CaCO₃, khối lượng vôi sống CaO thu được là [blank1] gam và thể tích khí CO₂ (đktc) là [blank2] lít.',
        blanks: [
          { index: 1, answer: '22.4', unit: 'gam' },
          { index: 2, answer: '8.96', unit: 'lít' },
        ],
        explanation: 'm_CaCO₃ = 40g -> n = 0,4 mol -> m_CaO = 0,4 * 56 = 22,4 gam. V_CO₂ = 0,4 * 22,4 = 8,96 lít.',
      },
    ],
    essay: [
      {
        id: 25,
        question: `Bài toán tự luận (${difficulty}): Cho 11,2 gam bột sắt (Fe) phản ứng vừa đủ với V ml dung dịch axit H₂SO₄ 1M. Sau phản ứng hoàn toàn, tính giá trị của V và nồng độ mol của muối FeSO₄ thu được (coi thể tích dung dịch không đổi).`,
        solutionGuide: 'Phương trình: Fe + H₂SO₄ → FeSO₄ + H₂↑. n_Fe = 11,2 / 56 = 0,2 mol. n_H₂SO₄ = 0,2 mol -> V = 0,2 / 1 = 0,2 lít (200 ml). n_FeSO₄ = 0,2 mol -> C_M = 0,2 / 0,2 = 1M.',
        points: 2.0,
      },
    ],
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '15 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function extractHtmlFromDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value || '';
}

/**
 * Process an uploaded file (Word .doc/.docx, Image .jpg/.png/.webp, PDF, Excel) into a FileAttachment
 * with compressed image preview, PDF dataUrl, or extracted Word HTML/text so it can be viewed directly in-app & downloaded anytime.
 */
export async function processUploadedFile(file: File): Promise<FileAttachment> {
  const lowerName = file.name.toLowerCase();
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(lowerName);
  const isWord =
    /\.(docx|doc)$/i.test(lowerName) ||
    file.type.includes('word') ||
    file.type.includes('officedocument.wordprocessingml');
  const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
  const isExcel = /\.(xlsx|xls|csv)$/i.test(lowerName) || file.type.includes('spreadsheet');

  const fileType: FileAttachment['type'] = isImage
    ? 'image'
    : isWord
    ? 'word'
    : isPdf
    ? 'pdf'
    : isExcel
    ? 'excel'
    : 'other';

  let extractedText = '';
  let extractedHtml = '';
  if (lowerName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const [rawRes, htmlRes] = await Promise.all([
        mammoth.extractRawText({ arrayBuffer }),
        mammoth.convertToHtml({ arrayBuffer }),
      ]);
      extractedText = rawRes.value || '';
      extractedHtml = htmlRes.value || '';
    } catch (e) {
      console.warn('Could not extract text/html from docx:', e);
    }
  } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.doc')) {
    try {
      const txt = await file.text();
      if (txt && !txt.includes('\u0000')) {
        extractedText = txt;
      }
    } catch {}
  }

  // If image, resize to max 1200px so it displays crisply in-app and stores cleanly
  if (isImage) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const imgAtt: FileAttachment = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: file.name,
      type: 'image',
      mimeType: file.type || 'image/jpeg',
      dataUrl,
      sizeLabel: formatFileSize(file.size),
    };
    cacheAttachmentInMemoryAndIDB(imgAtt);
    pushAttachmentToCloud(imgAtt).catch(() => {});
    return imgAtt;
  }

  // For Word / PDF / Excel / Other files, read as DataURL (up to 8MB) so it can be viewed & downloaded directly
  const dataUrl = await new Promise<string>((resolve) => {
    if (file.size > 8 * 1024 * 1024) {
      const fallbackBlob = new Blob([extractedText || `Tệp đính kèm: ${file.name}`], {
        type: 'text/plain;charset=utf-8',
      });
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ''));
      r.readAsDataURL(fallbackBlob);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  const docAtt: FileAttachment = {
    id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: file.name,
    type: fileType,
    mimeType: isPdf ? 'application/pdf' : file.type || 'application/octet-stream',
    dataUrl,
    sizeLabel: formatFileSize(file.size),
    extractedText: extractedText ? extractedText.slice(0, 30000) : undefined,
    extractedHtml: extractedHtml ? extractedHtml.slice(0, 50000) : undefined,
  };
  cacheAttachmentInMemoryAndIDB(docAtt);
  pushAttachmentToCloud(docAtt).catch(() => {});
  return docAtt;
}

/**
 * Trigger browser download for a FileAttachment and record the downloader's name
 */
export function downloadAttachmentFile(att: FileAttachment, parentTargetId?: string): void {
  if (!att) return;
  try {
    recordMediaDownload(`att-${att.id}`);
    if (parentTargetId) {
      recordMediaDownload(parentTargetId);
    }
  } catch {}
  resolveAttachmentDataUrl(att).then((resolvedUrl) => {
    const href = resolvedUrl || att.dataUrl;
    if (!href || href.startsWith('__idb_att__:')) return;
    const a = document.createElement('a');
    a.href = href;
    a.download = att.name || 'Tai_Lieu_Dinh_Kem';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

/**
 * Evaluate score classification
 */
export function evaluateScoreLabel(
  score: number
): 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng' {
  if (score >= 9.0) return 'Xuất sắc';
  if (score >= 8.0) return 'Giỏi';
  if (score >= 6.5) return 'Khá';
  if (score >= 5.0) return 'Đạt';
  return 'Cần cố gắng';
}

// ============================================================================
// EXAM RESULTS STORAGE & SYNCHRONIZATION (`ndh_exam_results`)
// ============================================================================
const EXAM_RESULTS_KEY = 'ndh_exam_results';
const LEGACY_FAKE_RESULT_IDS = new Set(['r-1', 'r-2', 'r-3', 'r-4', 'r-5']);

export const INITIAL_EXAM_RESULTS: ExamResultRecord[] = [];

export function recalculateRanks(records: ExamResultRecord[]): ExamResultRecord[] {
  const sorted = [...records].sort((a, b) => b.score - a.score);
  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    evaluated: evaluateScoreLabel(item.score),
  }));
}

export function getStoredExamResults(): ExamResultRecord[] {
  const parsed = readPersistedKey<ExamResultRecord[]>(EXAM_RESULTS_KEY, []);
  if (Array.isArray(parsed)) {
    const cleaned = parsed.filter(
      (r: any) => r && r.id && !LEGACY_FAKE_RESULT_IDS.has(String(r.id))
    );
    return recalculateRanks(cleaned);
  }
  return [];
}

export function saveExamResults(results: ExamResultRecord[]): ExamResultRecord[] {
  const ranked = recalculateRanks(results);
  writePersistedKey(EXAM_RESULTS_KEY, ranked, { eventName: 'ndh-results-updated' });
  return ranked;
}

export function upsertExamResultRecord(record: Partial<ExamResultRecord> & { studentName: string; examName: string; score: number }): ExamResultRecord[] {
  const current = getStoredExamResults();
  const existingIdx = current.findIndex(
    (r) =>
      (record.id && r.id === record.id) ||
      (record.submissionId && r.submissionId === record.submissionId) ||
      (r.studentName.trim().toLowerCase() === record.studentName.trim().toLowerCase() &&
        r.examName.trim().toLowerCase() === record.examName.trim().toLowerCase())
  );

  const cleanScore = Math.max(0, Math.min(10, Math.round(Number(record.score || 0) * 100) / 100));
  const evaluated = evaluateScoreLabel(cleanScore);
  const today = new Date().toLocaleDateString('vi-VN');

  if (existingIdx >= 0) {
    const updated = [...current];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...record,
      score: cleanScore,
      evaluated,
      gradedDate: record.gradedDate || today,
    };
    return saveExamResults(updated);
  } else {
    const newItem: ExamResultRecord = {
      id: record.id || 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentCode: record.studentCode || `NDH-${String(current.length + 1).padStart(2, '0')}`,
      studentName: record.studentName.trim(),
      classGroup: record.classGroup || 'H8.1',
      examName: record.examName.trim(),
      examType: record.examType || 'Kỳ thi / Khảo sát',
      score: cleanScore,
      maxScore: record.maxScore || 10,
      evaluated,
      feedback:
        record.feedback ||
        (cleanScore >= 8.5
          ? 'Xuất sắc! Nắm vững kiến thức và phương pháp giải nhanh của Thầy Hành.'
          : cleanScore >= 6.5
          ? 'Khá tốt! Cần rèn thêm kỹ năng trình bày và tính toán số mol.'
          : 'Cần ôn tập kỹ lý thuyết và làm đầy đủ bài tập về nhà.'),
      gradedDate: record.gradedDate || today,
      submissionId: record.submissionId,
    };
    return saveExamResults([newItem, ...current]);
  }
}

// ============================================================================
// QUIZ SUBMISSIONS STORAGE & GRADING (`ndh_quiz_submissions`)
// ============================================================================
const QUIZ_SUBMISSIONS_KEY = 'ndh_quiz_submissions';

export function getStoredQuizSubmissions(): QuizSubmission[] {
  const parsed = readPersistedKey<QuizSubmission[]>(QUIZ_SUBMISSIONS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveQuizSubmission(submission: QuizSubmission): QuizSubmission[] {
  const current = getStoredQuizSubmissions();
  const item: QuizSubmission = {
    ...submission,
    id: submission.id || 'qsub-' + Date.now(),
    status: submission.status || 'submitted',
  };
  const next = [item, ...current.filter((s) => s.id !== item.id)];
  writePersistedKey(QUIZ_SUBMISSIONS_KEY, next, {
    eventName: 'ndh-quiz-submissions-updated',
  });

  // Also sync to Exam Results table immediately
  upsertExamResultRecord({
    submissionId: item.id,
    studentCode: item.studentCode || 'NDH-HS',
    studentName: item.studentName,
    classGroup: item.classGroup,
    examName: item.quizTitle,
    examType: 'Bài tập tương tác',
    score: item.score,
    feedback: item.feedback || 'Đã nộp bài kiểm tra trực tuyến.',
  });

  // Automatically record student write/submission interaction
  try {
    const actor = {
      userName: item.studentName,
      userClass: item.classGroup,
      userRole: 'student',
    };
    if (item.quizId) {
      recordMediaWrite(item.quizId, actor);
      recordMediaWrite(`quiz-${item.quizId}`, actor);
    }
  } catch {}

  return next;
}

export function updateAndGradeQuizSubmission(
  submissionId: string,
  newScore: number,
  newFeedback: string
): QuizSubmission[] {
  const current = getStoredQuizSubmissions();
  let targetSub: QuizSubmission | undefined;
  const updated = current.map((sub) => {
    if (sub.id === submissionId) {
      targetSub = {
        ...sub,
        score: Math.max(0, Math.min(10, Math.round(newScore * 100) / 100)),
        feedback: newFeedback,
        essayGraded: true,
        status: 'graded',
      };
      return targetSub;
    }
    return sub;
  });

  writePersistedKey(QUIZ_SUBMISSIONS_KEY, updated, {
    eventName: 'ndh-quiz-submissions-updated',
  });

  if (targetSub) {
    upsertExamResultRecord({
      submissionId: targetSub.id,
      studentCode: targetSub.studentCode || 'NDH-HS',
      studentName: targetSub.studentName,
      classGroup: targetSub.classGroup,
      examName: targetSub.quizTitle,
      examType: 'Bài tập tương tác',
      score: targetSub.score,
      feedback: targetSub.feedback || '',
    });
  }

  return updated;
}

// ============================================================================
// HOMEWORK SUBMISSIONS STORAGE & GRADING (`ndh_homework_submissions`)
// ============================================================================
const HOMEWORK_SUBMISSIONS_KEY = 'ndh_homework_submissions';

export function getStoredHomeworkSubmissions(): HomeworkSubmission[] {
  const parsed = readPersistedKey<HomeworkSubmission[]>(HOMEWORK_SUBMISSIONS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveHomeworkSubmission(sub: HomeworkSubmission): HomeworkSubmission[] {
  const current = getStoredHomeworkSubmissions();
  const next = [sub, ...current.filter((item) => item.id !== sub.id)];
  writePersistedKey(HOMEWORK_SUBMISSIONS_KEY, next, {
    eventName: 'ndh-hw-submissions-updated',
  });

  // Automatically record student homework submission interaction
  try {
    const actor = {
      userName: sub.studentName,
      userClass: sub.classGroup,
      userRole: 'student',
    };
    if (sub.homeworkId) {
      recordMediaWrite(sub.homeworkId, actor);
      recordMediaWrite(`hw-${sub.homeworkId}`, actor);
    }
  } catch {}

  return next;
}

export function gradeHomeworkSubmission(
  submissionId: string,
  score: number,
  teacherFeedback: string
): HomeworkSubmission[] {
  const current = getStoredHomeworkSubmissions();
  let gradedItem: HomeworkSubmission | undefined;
  const cleanScore = Math.max(0, Math.min(10, Math.round(score * 100) / 100));

  const next = current.map((item) => {
    if (item.id === submissionId) {
      gradedItem = {
        ...item,
        score: cleanScore,
        teacherFeedback,
        status: 'graded',
        gradedAt: new Date().toLocaleString('vi-VN'),
      };
      return gradedItem;
    }
    return item;
  });

  writePersistedKey(HOMEWORK_SUBMISSIONS_KEY, next, {
    eventName: 'ndh-hw-submissions-updated',
  });

  if (gradedItem) {
    upsertExamResultRecord({
      submissionId: gradedItem.id,
      studentCode: gradedItem.studentCode || 'NDH-HS',
      studentName: gradedItem.studentName,
      classGroup: gradedItem.classGroup,
      examName: gradedItem.homeworkTitle,
      examType: 'Bài tập về nhà',
      score: cleanScore,
      feedback: teacherFeedback || 'Hoàn thành tốt bài tập về nhà.',
    });
  }

  return next;
}

// ============================================================================
// UNIVERSAL ITEM COMMENTS (`ndh_item_comments`) WITH WORD & IMAGE ATTACHMENTS
// ============================================================================
const ITEM_COMMENTS_KEY = 'ndh_item_comments';

export function getAllItemComments(): Record<string, AnnouncementComment[]> {
  const parsed = readPersistedKey<Record<string, AnnouncementComment[]>>(ITEM_COMMENTS_KEY, {});
  if (parsed && typeof parsed === 'object') {
    const out: Record<string, AnnouncementComment[]> = {};
    for (const k of Object.keys(parsed)) {
      if (Array.isArray(parsed[k])) {
        out[k] = parsed[k].filter((c: any) => c && c.id !== 'c-1');
      }
    }
    return out;
  }
  return {};
}

export function getCommentsForTarget(targetId: string): AnnouncementComment[] {
  const all = getAllItemComments();
  const list = all[targetId] || [];
  return filterCommentsByRoster(list);
}

function filterCommentsByRoster(comments: AnnouncementComment[]): AnnouncementComment[] {
  const roster = getActiveStudentRoster();
  return comments
    .filter((c) => c && c.id !== 'c-1')
    .map((c) => {
      if (
        c.authorRole === 'admin' ||
        c.authorRole === 'teacher' ||
        c.authorName.toLowerCase().includes('thầy') ||
        c.authorName.toLowerCase().includes('quản trị')
      ) {
        return c;
      }
      if (roster.length > 0) {
        const cleanName = c.authorName.replace(/\(.*?\)/g, '').trim();
        const check = verifyStudentInRoster(cleanName, c.authorClass, roster);
        if (check.isMatch && check.matchedStudent) {
          return {
            ...c,
            authorName: check.matchedStudent.fullName,
            authorClass: check.matchedStudent.enrolledClass,
          };
        }
        return null;
      }
      return c;
    })
    .filter(Boolean) as AnnouncementComment[];
}

export function addCommentForTarget(
  targetId: string,
  comment: Omit<AnnouncementComment, 'id' | 'announcementId' | 'createdAt'>
): AnnouncementComment[] {
  const all = getAllItemComments();
  const roster = getActiveStudentRoster();
  let resolvedName = comment.authorName.replace(/\(.*?\)/g, '').trim();
  let resolvedClass = comment.authorClass || '';

  if (comment.authorRole !== 'admin' && comment.authorRole !== 'teacher' && roster.length > 0) {
    const check = verifyStudentInRoster(resolvedName, resolvedClass, roster);
    if (check.isMatch && check.matchedStudent) {
      resolvedName = check.matchedStudent.fullName;
      resolvedClass = check.matchedStudent.enrolledClass;
    }
  }

  const newComment: AnnouncementComment = {
    ...comment,
    authorName: resolvedName,
    authorClass: resolvedClass,
    id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    announcementId: targetId,
    createdAt: new Date().toLocaleString('vi-VN'),
  };
  const nextList = [...(all[targetId] || []), newComment];
  all[targetId] = nextList;
  writePersistedKey(ITEM_COMMENTS_KEY, all, { eventName: 'ndh-comments-updated' });

  // Automatically record write interaction in activity log
  try {
    recordMediaWrite(targetId, {
      userName: resolvedName,
      userClass: resolvedClass,
      userRole: comment.authorRole || 'student',
    });
    const baseId = targetId.replace(/^(hw-|ann-|mat-|exp-|yt-post-|online-|quiz-)/, '');
    if (baseId && baseId !== targetId) {
      recordMediaWrite(baseId, {
        userName: resolvedName,
        userClass: resolvedClass,
        userRole: comment.authorRole || 'student',
      });
    }
  } catch {}

  return filterCommentsByRoster(nextList);
}

export function deleteCommentForTarget(
  targetId: string,
  commentId: string
): AnnouncementComment[] {
  markItemDeleted(commentId);
  const all = getAllItemComments();
  const nextList = (all[targetId] || []).filter((c) => c.id !== commentId);
  all[targetId] = nextList;
  writePersistedKey(ITEM_COMMENTS_KEY, all, { eventName: 'ndh-comments-updated' });
  return filterCommentsByRoster(nextList);
}

export const getSavedHomeworkSubmissions = getStoredHomeworkSubmissions;
export const upsertExamResult = upsertExamResultRecord;

// ============================================================================
// MEDIA VIEW, WRITE & DOWNLOAD ACTIVITY TRACKER (`ndh_media_activity_logs`)
// 100% Automatic & Roster-Verified: Only real students in the uploaded roster
// (and Admin/Teacher) are recorded and displayed. Zero fabricated names.
// ============================================================================
const MEDIA_ACTIVITY_KEY = 'ndh_media_activity_logs';

const GENERIC_GUEST_NAMES = new Set([
  'hocsinhkhach',
  'khach',
  'khachchixem',
  'hocsinh',
  'thanhvien',
  'anonymous',
  'guest',
]);

export function resolveVerifiedActor(customActor?: {
  userName?: string;
  userClass?: string;
  userRole?: string;
}): {
  userName: string;
  userClass?: string;
  userRole?: string;
  isValid: boolean;
} {
  try {
    // 1. Check if Admin/Teacher
    const activeAuthMode = localStorage.getItem('ndh_active_auth_mode');
    const savedAdminSession =
      localStorage.getItem('ndh_admin_session') ||
      sessionStorage.getItem('ndh_admin_session');
    const adminRole = localStorage.getItem('ndh_admin_master_role');
    if (
      customActor?.userRole === 'admin' ||
      adminRole === 'admin' ||
      (activeAuthMode === 'admin_session' && savedAdminSession && !customActor?.userName) ||
      (customActor?.userName &&
        (customActor.userName.toLowerCase().includes('nguyễn đình hành') ||
          customActor.userName.toLowerCase().includes('qtv')))
    ) {
      return {
        userName: 'Thầy Nguyễn Đình Hành (QTV)',
        userClass: 'Quản trị',
        userRole: 'admin',
        isValid: true,
      };
    }
    if (customActor?.userRole === 'teacher' || adminRole === 'teacher') {
      return {
        userName: 'Giáo viên Bộ môn',
        userClass: 'Giáo viên',
        userRole: 'teacher',
        isValid: true,
      };
    }

    // 2. Get candidate student name & class from customActor or active logged-in student session (`ndh_user_session`)
    let candidateName = (customActor?.userName || '').replace(/\(.*?\)/g, '').trim();
    let candidateClass = (customActor?.userClass || '').trim();

    if (!candidateName || GENERIC_GUEST_NAMES.has(normalizeVietnamese(candidateName))) {
      const rawSession =
        localStorage.getItem('ndh_user_session') ||
        sessionStorage.getItem('ndh_user_session') ||
        localStorage.getItem('ndh_active_student_profile_v1');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && parsed.fullName) {
          if (parsed.role === 'admin') {
            return {
              userName: 'Thầy Nguyễn Đình Hành (QTV)',
              userClass: 'Quản trị',
              userRole: 'admin',
              isValid: true,
            };
          }
          candidateName = String(parsed.fullName).replace(/\(.*?\)/g, '').trim();
          candidateClass = parsed.enrolledClass
            ? String(parsed.enrolledClass).trim()
            : candidateClass;
        }
      }
    }

    const normCandidate = normalizeVietnamese(candidateName);
    if (!normCandidate || GENERIC_GUEST_NAMES.has(normCandidate)) {
      return { userName: '', isValid: false };
    }

    // 3. Strictly verify against the uploaded Student Roster (`getActiveStudentRoster()`)
    const roster = getActiveStudentRoster();
    if (roster.length > 0) {
      const check = verifyStudentInRoster(candidateName, candidateClass || undefined, roster);
      if (check.isMatch && check.matchedStudent) {
        return {
          userName: check.matchedStudent.fullName,
          userClass: check.matchedStudent.enrolledClass,
          userRole: 'student',
          isValid: true,
        };
      }
      // Fallback: match by normalized full name in roster even if class wasn't passed
      const nameOnlyMatch = roster.find(
        (s) => normalizeVietnamese(s.fullName) === normCandidate
      );
      if (nameOnlyMatch) {
        return {
          userName: nameOnlyMatch.fullName,
          userClass: nameOnlyMatch.enrolledClass,
          userRole: 'student',
          isValid: true,
        };
      }
      // Not in roster -> do NOT fabricate or record unverified guest name
      return { userName: '', isValid: false };
    }

    // If roster is currently empty, still allow logged-in registered student from ndh_registered_users
    return {
      userName: candidateName,
      userClass: candidateClass || undefined,
      userRole: 'student',
      isValid: true,
    };
  } catch {
    return { userName: '', isValid: false };
  }
}

export function getCurrentActiveActor(): {
  userName: string;
  userClass?: string;
  userRole?: string;
} {
  const resolved = resolveVerifiedActor();
  if (resolved.isValid) {
    return {
      userName: resolved.userName,
      userClass: resolved.userClass,
      userRole: resolved.userRole,
    };
  }
  return {
    userName: '',
    userRole: 'guest',
  };
}

function filterVerifiedEntries(entries: MediaActivityEntry[] = []): MediaActivityEntry[] {
  const roster = getActiveStudentRoster();
  const seen = new Set<string>();
  const result: MediaActivityEntry[] = [];

  for (const item of entries) {
    if (!item || !item.userName) continue;
    const rawName = String(item.userName).replace(/\(.*?\)/g, '').trim();
    const norm = normalizeVietnamese(rawName);
    if (!norm || GENERIC_GUEST_NAMES.has(norm)) continue;

    // Keep Admin / Teacher
    if (
      item.userRole === 'admin' ||
      item.userRole === 'teacher' ||
      rawName.toLowerCase().includes('nguyễn đình hành') ||
      rawName.toLowerCase().includes('qtv')
    ) {
      const key = `admin-${norm}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          ...item,
          userName: 'Thầy Nguyễn Đình Hành (QTV)',
          userClass: 'Quản trị',
          userRole: 'admin',
        });
      }
      continue;
    }

    // Verify against real Student Roster when roster has students
    if (roster.length > 0) {
      const check = verifyStudentInRoster(rawName, item.userClass, roster);
      const matched =
        check.matchedStudent ||
        roster.find((s) => normalizeVietnamese(s.fullName) === norm);
      if (!matched) continue; // Strictly exclude any name not in the student roster!

      const key = `${normalizeVietnamese(matched.fullName)}-${matched.enrolledClass}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          userName: matched.fullName,
          userClass: matched.enrolledClass,
          userRole: 'student',
          timestamp: item.timestamp || '',
        });
      }
    } else {
      const key = `${norm}-${item.userClass || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
  }

  return result;
}

export function getAllMediaActivityLogs(): Record<string, MediaActivityLog> {
  const parsed = readPersistedKey<Record<string, MediaActivityLog>>(MEDIA_ACTIVITY_KEY, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function getMediaActivityLog(targetId: string): MediaActivityLog {
  const all = getAllMediaActivityLogs();
  const rawLog = all[targetId] || {
    targetId,
    views: [],
    downloads: [],
    writes: [],
  };

  // Automatically aggregate "Viết bài / Nộp bài / Bình luận" from comments, homework submissions, and quiz submissions for this targetId
  const derivedWrites: MediaActivityEntry[] = [...(rawLog.writes || [])];
  try {
    const baseId = targetId.replace(/^(att-|hw-|ann-|mat-|exp-|yt-post-|online-|quiz-)/, '');
    const commentTargets = [targetId, `hw-${baseId}`, `ann-${baseId}`, baseId];
    const allComments = getAllItemComments();
    for (const ct of commentTargets) {
      const cList = allComments[ct] || [];
      for (const c of cList) {
        if (c && c.id !== 'c-1' && c.authorName) {
          derivedWrites.push({
            userName: c.authorName,
            userClass: c.authorClass,
            userRole: c.authorRole,
            timestamp: c.createdAt || '',
          });
        }
      }
    }

    const hwSubs = getStoredHomeworkSubmissions();
    for (const sub of hwSubs) {
      if (sub.homeworkId === targetId || sub.homeworkId === baseId || `hw-${sub.homeworkId}` === targetId) {
        derivedWrites.push({
          userName: sub.studentName,
          userClass: sub.classGroup,
          userRole: 'student',
          timestamp: sub.submittedAt || '',
        });
      }
    }

    const quizSubs = getStoredQuizSubmissions();
    for (const qSub of quizSubs) {
      if (qSub.quizId === targetId || qSub.quizId === baseId || `quiz-${qSub.quizId}` === targetId) {
        derivedWrites.push({
          userName: qSub.studentName,
          userClass: qSub.classGroup,
          userRole: 'student',
          timestamp: qSub.submittedAt || '',
        });
      }
    }
  } catch {}

  const verifiedWrites = filterVerifiedEntries(derivedWrites);
  const verifiedDownloads = filterVerifiedEntries(rawLog.downloads || []);
  // Anyone who wrote/submitted or downloaded also viewed the item
  const combinedViews = filterVerifiedEntries([
    ...(rawLog.views || []),
    ...verifiedWrites,
    ...verifiedDownloads,
  ]);

  return {
    targetId,
    views: combinedViews,
    downloads: verifiedDownloads,
    writes: verifiedWrites,
  };
}

function saveAllMediaActivityLogs(all: Record<string, MediaActivityLog>): void {
  writePersistedKey(MEDIA_ACTIVITY_KEY, all, { eventName: 'ndh-media-activity-updated' });
}

export function recordMediaView(
  targetId: string,
  customActor?: { userName?: string; userClass?: string; userRole?: string }
): MediaActivityLog {
  if (!targetId) return { targetId: '', views: [], downloads: [], writes: [] };
  const resolved = resolveVerifiedActor(customActor);
  if (!resolved.isValid || !resolved.userName) {
    return getMediaActivityLog(targetId);
  }

  const actorKey = `${normalizeVietnamese(resolved.userName)}::${resolved.userClass || ''}`;
  if (hasViewedInCurrentSession(targetId, actorKey)) {
    return getMediaActivityLog(targetId);
  }

  const all = getAllMediaActivityLogs();
  const current: MediaActivityLog = all[targetId] || {
    targetId,
    views: [],
    downloads: [],
    writes: [],
  };

  // Check if this exact student is already in the views list so we don't trigger unnecessary network pushes
  const alreadyViewed = (current.views || []).some(
    (v) =>
      normalizeVietnamese(v.userName) === normalizeVietnamese(resolved.userName) &&
      (v.userClass || '') === (resolved.userClass || '')
  );
  if (alreadyViewed) {
    return getMediaActivityLog(targetId);
  }

  const entry: MediaActivityEntry = {
    userName: resolved.userName,
    userClass: resolved.userClass,
    userRole: resolved.userRole,
    timestamp: new Date().toLocaleString('vi-VN'),
  };

  const filteredViews = (current.views || []).filter(
    (v) =>
      !(
        normalizeVietnamese(v.userName) === normalizeVietnamese(entry.userName) &&
        (v.userClass || '') === (entry.userClass || '')
      )
  );
  const updatedLog: MediaActivityLog = {
    ...current,
    views: [entry, ...filteredViews].slice(0, 200),
  };
  all[targetId] = updatedLog;
  saveAllMediaActivityLogs(all);
  return getMediaActivityLog(targetId);
}

export function recordMediaWrite(
  targetId: string,
  customActor?: { userName?: string; userClass?: string; userRole?: string }
): MediaActivityLog {
  if (!targetId) return { targetId: '', views: [], downloads: [], writes: [] };
  const resolved = resolveVerifiedActor(customActor);
  if (!resolved.isValid || !resolved.userName) {
    return getMediaActivityLog(targetId);
  }

  const all = getAllMediaActivityLogs();
  const current: MediaActivityLog = all[targetId] || {
    targetId,
    views: [],
    downloads: [],
    writes: [],
  };

  const entry: MediaActivityEntry = {
    userName: resolved.userName,
    userClass: resolved.userClass,
    userRole: resolved.userRole,
    timestamp: new Date().toLocaleString('vi-VN'),
  };

  const filteredWrites = (current.writes || []).filter(
    (w) =>
      !(
        normalizeVietnamese(w.userName) === normalizeVietnamese(entry.userName) &&
        (w.userClass || '') === (entry.userClass || '')
      )
  );
  const filteredViews = (current.views || []).filter(
    (v) =>
      !(
        normalizeVietnamese(v.userName) === normalizeVietnamese(entry.userName) &&
        (v.userClass || '') === (entry.userClass || '')
      )
  );

  const updatedLog: MediaActivityLog = {
    ...current,
    views: [entry, ...filteredViews].slice(0, 200),
    writes: [entry, ...filteredWrites].slice(0, 200),
  };
  all[targetId] = updatedLog;
  saveAllMediaActivityLogs(all);
  return getMediaActivityLog(targetId);
}

export function recordMediaDownload(
  targetId: string,
  customActor?: { userName?: string; userClass?: string; userRole?: string }
): MediaActivityLog {
  if (!targetId) return { targetId: '', views: [], downloads: [], writes: [] };
  const resolved = resolveVerifiedActor(customActor);
  if (!resolved.isValid || !resolved.userName) {
    return getMediaActivityLog(targetId);
  }

  const all = getAllMediaActivityLogs();
  const current: MediaActivityLog = all[targetId] || {
    targetId,
    views: [],
    downloads: [],
    writes: [],
  };

  const entry: MediaActivityEntry = {
    userName: resolved.userName,
    userClass: resolved.userClass,
    userRole: resolved.userRole,
    timestamp: new Date().toLocaleString('vi-VN'),
  };

  const filteredDownloads = (current.downloads || []).filter(
    (d) =>
      !(
        normalizeVietnamese(d.userName) === normalizeVietnamese(entry.userName) &&
        (d.userClass || '') === (entry.userClass || '')
      )
  );
  const filteredViews = (current.views || []).filter(
    (v) =>
      !(
        normalizeVietnamese(v.userName) === normalizeVietnamese(entry.userName) &&
        (v.userClass || '') === (entry.userClass || '')
      )
  );
  const updatedLog: MediaActivityLog = {
    ...current,
    views: [entry, ...filteredViews].slice(0, 200),
    downloads: [entry, ...filteredDownloads].slice(0, 200),
  };
  all[targetId] = updatedLog;
  saveAllMediaActivityLogs(all);
  return getMediaActivityLog(targetId);
}

export function clearMediaActivityLog(targetId: string): void {
  const all = getAllMediaActivityLogs();
  delete all[targetId];
  saveAllMediaActivityLogs(all);
}

// ============================================================================
// YOUTUBE URL EMBED HELPER
// ============================================================================
export function toYoutubeEmbedUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.includes('youtube.com/embed/')) return trimmed;

  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/live/ID
  const regExp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return trimmed;
}

// ============================================================================
// REFERENCE MATERIALS STORAGE & SYNC (`ndh_reference_materials`)
// ============================================================================
const REFERENCE_MATERIALS_KEY = 'ndh_reference_materials';

export const DEFAULT_REFERENCE_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-1',
    title: 'Sách Chuyên Đề Bồi Dưỡng Học Sinh Giỏi Hóa Học THCS (Tập 1 - Hóa Vô Cơ)',
    grade: 'Khối 8-9 & HSG',
    category: 'Sách tham khảo xuất bản',
    fileUrl: 'https://example.com/sach-hsg-tap-1.pdf',
    fileType: 'PDF',
    description:
      'Tác giả Thầy Nguyễn Đình Hành. Tổng hợp hệ thống lý thuyết nâng cao, sơ đồ chuyển hóa và 200 bài toán chọn lọc có lời giải chi tiết.',
    author: 'Thầy Nguyễn Đình Hành',
    downloadCount: 1420,
    uploadDate: '01/09/2025',
  },
  {
    id: 'mat-2',
    title:
      'Phương Pháp Giải Nhanh Các Dạng Bài Toán Hóa Học THCS Bằng Phương Trình Đại Số & Bảo Toàn',
    grade: 'Khối 8-9',
    category: 'Phương pháp giải nhanh',
    fileUrl: 'https://example.com/phuong-phap-giai-nhanh.pdf',
    fileType: 'PDF',
    description:
      'Tác giả Thầy Nguyễn Đình Hành. Kỹ thuật sử dụng định luật bảo toàn khối lượng, bảo toàn nguyên tố và đường chéo trong giải bài toán Hóa học.',
    author: 'Thầy Nguyễn Đình Hành',
    downloadCount: 980,
    uploadDate: '15/09/2025',
  },
  {
    id: 'mat-3',
    title: 'Tuyển Tập 50 Đề Thi Học Sinh Giỏi Hóa Học Cấp Tỉnh, Thành Phố (Có Hướng Dẫn Chấm)',
    grade: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
    category: 'Đề thi HSG các năm',
    fileUrl: 'https://example.com/50-de-thi-hsg.pdf',
    fileType: 'PDF',
    description:
      'Bộ đề thi chọn lọc qua các năm học, biên soạn đáp án và thang điểm chuẩn cho kỳ thi Bồi dưỡng HSG cấp tỉnh, thành phố và vào trường Chuyên.',
    author: 'Thầy Nguyễn Đình Hành',
    downloadCount: 1850,
    uploadDate: '20/09/2025',
  },
  {
    id: 'mat-4',
    title: 'Cẩm Nang Tra Cứu Màu Sắc Hợp Chất, Tính Tan Và Phương Trình Phản Ứng Độc Đáo',
    grade: 'Tất cả khối lớp',
    category: 'Sổ tay tra cứu',
    fileUrl: 'https://example.com/cam-nang-hoa-hoc.pdf',
    fileType: 'PDF',
    description:
      'Bảng tra cứu màu sắc kết tủa, khí thoát ra, tính tan của các muối và axit, bazo thường gặp trong chương trình THCS.',
    author: 'Thầy Nguyễn Đình Hành',
    downloadCount: 2310,
    uploadDate: '05/10/2025',
  },
];

export function getStoredMaterials(): MaterialItem[] {
  const parsed = readPersistedKey<MaterialItem[]>(
    REFERENCE_MATERIALS_KEY,
    DEFAULT_REFERENCE_MATERIALS
  );
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return DEFAULT_REFERENCE_MATERIALS;
}

export function saveAllMaterials(items: MaterialItem[]): MaterialItem[] {
  writePersistedKey(REFERENCE_MATERIALS_KEY, items, {
    eventName: 'ndh-materials-updated',
  });
  return items;
}

export function saveMaterialItem(item: MaterialItem): MaterialItem[] {
  const current = getStoredMaterials();
  const id = item.id || `mat-${Date.now()}`;
  const normalized: MaterialItem = {
    ...item,
    id,
    uploadDate: item.uploadDate || new Date().toLocaleDateString('vi-VN'),
    author: item.author || 'Thầy Nguyễn Đình Hành',
  };
  const existingIdx = current.findIndex((m) => m.id === id);
  let next: MaterialItem[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = normalized;
  } else {
    next = [normalized, ...current];
  }
  return saveAllMaterials(next);
}

export function deleteMaterialItem(id: string): MaterialItem[] {
  markItemDeleted(id);
  const current = getStoredMaterials();
  const next = current.filter((m) => m.id !== id);
  return saveAllMaterials(next);
}

// ============================================================================
// VIDEO EXPERIMENTS STORAGE & SYNC (`ndh_video_experiments`)
// ============================================================================
const VIDEO_EXPERIMENTS_KEY = 'ndh_video_experiments';

export const DEFAULT_VIDEO_EXPERIMENTS: VideoExperimentItem[] = [
  {
    id: 'exp-1',
    title: 'Thí nghiệm: Kim loại Natri (Na) tác dụng mãnh liệt với nước',
    grade: 'Hóa học 8 & 9',
    category: 'Kim loại kiềm & Nước',
    videoUrl: 'https://www.youtube.com/embed/92MSAYO3OEE',
    description:
      'Mẩu kim loại natri nóng chảy vo tròn thành viên bi sáng chạy nhanh trên mặt nước, có khí hidro thoát ra mạnh và tỏa nhiều nhiệt. Dung dịch tạo thành làm phenolphtalein chuyển sang màu hồng đậm.',
    chemicalEquation: '2Na + 2H₂O → 2NaOH + H₂↑',
    safetyNotes:
      'Chỉ dùng mẩu natri nhỏ bằng hạt đậu xanh. Đeo kính bảo hộ, dùng kẹp gắp và đậy tấm kính lên miệng cốc để tránh dung dịch kiềm bắn ra ngoài.',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: '05/09/2025',
  },
  {
    id: 'exp-2',
    title: 'Thí nghiệm: Dây sắt (Fe) cháy sáng chói trong bình khí Clo (Cl₂)',
    grade: 'Hóa học 9',
    category: 'Phi kim & Kim loại',
    videoUrl: 'https://www.youtube.com/embed/VpA5QcW4e0M',
    description:
      'Dây sắt nung đỏ đưa vào bình chứa khí clo màu vàng lục lập tức bùng cháy sáng chói, tạo ra nhiều khói màu nâu đỏ của hạt muối sắt(III) clorua.',
    chemicalEquation: '2Fe + 3Cl₂ → 2FeCl₃ (to)',
    safetyNotes:
      'Khí clo là khí độc hại đường hô hấp. Bắt buộc thực hiện trong tủ hút khí độc hoặc phòng thí nghiệm thoáng gió.',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: '10/09/2025',
  },
  {
    id: 'exp-3',
    title: 'Thí nghiệm: Nhiệt phân thuốc tím KMnO₄ điều chế khí Oxi trong phòng thí nghiệm',
    grade: 'Hóa học 8',
    category: 'Oxi & Sự oxy hóa',
    videoUrl: 'https://www.youtube.com/embed/cM3oT6FmCg4',
    description:
      'Đun nóng ống nghiệm chứa bột tím KMnO₄, khí oxi sinh ra làm tàn đóm đỏ bùng cháy thành ngọn lửa sáng. Thu khí oxi bằng phương pháp đẩy nước.',
    chemicalEquation: '2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑ (to)',
    safetyNotes:
      'Ống nghiệm phải đặt hơi chúc miệng xuống dưới để tránh hơi nước đọng chảy ngược làm vỡ ống nghiệm. Rút ống dẫn khí ra khỏi chậu nước trước khi tắt đèn cồn.',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: '15/09/2025',
  },
  {
    id: 'exp-4',
    title: 'Thí nghiệm: Khí Cacbon đioxit (CO₂) làm đục dung dịch nước vôi trong',
    grade: 'Hóa học 8 & 9',
    category: 'Oxit axit & Bazơ',
    videoUrl: 'https://www.youtube.com/embed/7VnL0tM2Yy0',
    description:
      'Sục khí CO₂ vào ống nghiệm đựng dung dịch Ca(OH)₂ trong suốt, xuất hiện kết tủa trắng canxi cacbonat (CaCO₃) làm dung dịch vẩn đục như sữa.',
    chemicalEquation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ (trắng) + H₂O',
    safetyNotes:
      'Thí nghiệm an toàn, sinh động. Nếu tiếp tục sục CO₂ dư thì kết tủa trắng sẽ tan dần do tạo Ca(HCO₃)₂ tan.',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: '20/09/2025',
  },
];

export function getStoredExperiments(): VideoExperimentItem[] {
  const parsed = readPersistedKey<VideoExperimentItem[]>(
    VIDEO_EXPERIMENTS_KEY,
    DEFAULT_VIDEO_EXPERIMENTS
  );
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return DEFAULT_VIDEO_EXPERIMENTS;
}

export function saveAllExperiments(items: VideoExperimentItem[]): VideoExperimentItem[] {
  writePersistedKey(VIDEO_EXPERIMENTS_KEY, items, {
    eventName: 'ndh-experiments-updated',
  });
  return items;
}

export function saveExperimentItem(item: VideoExperimentItem): VideoExperimentItem[] {
  const current = getStoredExperiments();
  const id = item.id || `exp-${Date.now()}`;
  const normalized: VideoExperimentItem = {
    ...item,
    id,
    videoUrl: item.videoUrl ? toYoutubeEmbedUrl(item.videoUrl) : '',
    author: item.author || 'Thầy Nguyễn Đình Hành',
    createdAt: item.createdAt || new Date().toLocaleDateString('vi-VN'),
  };
  const existingIdx = current.findIndex((e) => e.id === id);
  let next: VideoExperimentItem[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = normalized;
  } else {
    next = [normalized, ...current];
  }
  return saveAllExperiments(next);
}

export function deleteExperimentItem(id: string): VideoExperimentItem[] {
  markItemDeleted(id);
  const current = getStoredExperiments();
  const next = current.filter((e) => e.id !== id);
  return saveAllExperiments(next);
}

// ============================================================================
// YOUTUBE THẦY HÀNH CHANNEL & POSTS STORAGE (`ndh_youtube_channel_data`)
// ============================================================================
const YOUTUBE_CHANNEL_KEY = 'ndh_youtube_channel_data';

export const DEFAULT_YOUTUBE_CHANNEL_DATA: YoutubeChannelData = {
  mainChannelName: 'Kênh YouTube Chính Thức: Thầy Nguyễn Đình Hành - Chinh Phục Môn Hóa THCS',
  mainChannelUrl: 'https://www.youtube.com/@ThayNguyenDinhHanhHoaTHCS',
  mainChannelDescription:
    'Hệ thống bài giảng video chuyên sâu KHTN 6, 7, Hóa học 8, 9, phương pháp giải nhanh và bồi dưỡng Học sinh giỏi Hóa học cấp tỉnh, thành phố của Thầy Nguyễn Đình Hành.',
  globalLessonLinks: [
    {
      id: 'yt-link-1',
      title: 'Bài giảng 1: Phương pháp Bảo toàn khối lượng & Bảo toàn nguyên tố trong Hóa THCS',
      url: 'https://www.youtube.com/watch?v=92MSAYO3OEE',
      grade: 'Hóa 8, 9 & HSG',
      createdAt: '01/10/2025',
    },
    {
      id: 'yt-link-2',
      title: 'Bài giảng 2: Chuyên đề Nhận biết các hợp chất vô cơ & Chuỗi phản ứng hóa học',
      url: 'https://www.youtube.com/watch?v=VpA5QcW4e0M',
      grade: 'Hóa 9 & Ôn Chuyên',
      createdAt: '05/10/2025',
    },
    {
      id: 'yt-link-3',
      title: 'Bài giảng 3: Thí nghiệm thực hành điều chế và thu khí Oxi, Hidro chuẩn GDPT 2018',
      url: 'https://www.youtube.com/watch?v=cM3oT6FmCg4',
      grade: 'KHTN 7 & Hóa 8',
      createdAt: '10/10/2025',
    },
  ],
  posts: [
    {
      id: 'yt-post-1',
      title: 'Chuyên đề Video: Kỹ thuật giải nhanh Toán Hóa Học 8, 9 và Bồi dưỡng HSG',
      content:
        'Các em học sinh nhấn vào bài viết này để mở cửa sổ tổng hợp Kênh YouTube chính của Thầy Hành cùng toàn bộ đường link các bài giảng video theo từng chuyên đề. Khi xem bài giảng, các em ghi chép đầy đủ phương trình phản ứng và làm bài tập đính kèm.',
      grade: 'Khối 8, 9 & Bồi dưỡng HSG',
      videoUrl: 'https://www.youtube.com/embed/92MSAYO3OEE',
      lessonLinks: [
        {
          id: 'pl-1',
          title: 'Phần 1: Định luật bảo toàn khối lượng nâng cao',
          url: 'https://www.youtube.com/watch?v=92MSAYO3OEE',
          grade: 'Hóa 8 & 9',
        },
        {
          id: 'pl-2',
          title: 'Phần 2: Bài toán kim loại tác dụng với dung dịch muối',
          url: 'https://www.youtube.com/watch?v=VpA5QcW4e0M',
          grade: 'Hóa 9 & HSG',
        },
      ],
      attachments: [],
      author: 'Thầy Nguyễn Đình Hành',
      createdAt: '12/10/2025',
    },
    {
      id: 'yt-post-2',
      title: 'Tổng hợp Video Thí nghiệm Hóa học trọng tâm và Giải đề thi HSG cấp Tỉnh, Thành phố',
      content:
        'Bài viết tổng hợp các video phân tích hiện tượng thực nghiệm và hướng dẫn giải chi tiết các câu hỏi vận dụng cao trong đề thi chọn Học sinh giỏi cấp tỉnh, thành phố và thi vào lớp 10 Chuyên Hóa.',
      grade: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
      videoUrl: 'https://www.youtube.com/embed/cM3oT6FmCg4',
      lessonLinks: [
        {
          id: 'pl-3',
          title: 'Video 1: Giải chi tiết Đề thi HSG Hóa học cấp Tỉnh - Câu Vô cơ',
          url: 'https://www.youtube.com/watch?v=cM3oT6FmCg4',
          grade: 'HSG Tỉnh, TP',
        },
        {
          id: 'pl-4',
          title: 'Video 2: Phản ứng CO₂ với dung dịch kiềm & Đồ thị hình thang',
          url: 'https://www.youtube.com/watch?v=7VnL0tM2Yy0',
          grade: 'Hóa 9 & HSG',
        },
      ],
      attachments: [],
      author: 'Thầy Nguyễn Đình Hành',
      createdAt: '18/10/2025',
    },
  ],
};

export function getStoredYoutubeChannelData(): YoutubeChannelData {
  const parsed = readPersistedKey<YoutubeChannelData>(
    YOUTUBE_CHANNEL_KEY,
    DEFAULT_YOUTUBE_CHANNEL_DATA
  );
  if (parsed && Array.isArray(parsed.posts)) {
    return {
      ...DEFAULT_YOUTUBE_CHANNEL_DATA,
      ...parsed,
      globalLessonLinks: Array.isArray(parsed.globalLessonLinks)
        ? parsed.globalLessonLinks
        : DEFAULT_YOUTUBE_CHANNEL_DATA.globalLessonLinks,
    };
  }
  return DEFAULT_YOUTUBE_CHANNEL_DATA;
}

export function saveYoutubeChannelData(data: YoutubeChannelData): YoutubeChannelData {
  writePersistedKey(YOUTUBE_CHANNEL_KEY, data, { eventName: 'ndh-youtube-updated' });
  return data;
}

// ============================================================================
// ONLINE CLASS SESSIONS & ROOM LINKS STORAGE (`ndh_online_class_sessions`)
// ============================================================================
const ONLINE_CLASS_SESSIONS_KEY = 'ndh_online_class_sessions';

export const DEFAULT_ONLINE_CLASS_SESSIONS: OnlineClassSessionItem[] = [
  {
    id: 'online-1',
    title: 'Thông Báo Mở Phòng Học Trực Tuyến: Bồi Dưỡng HSG & Chuyên Đề Hóa Học Nâng Cao',
    classGroup: 'Tất cả các lớp',
    openTimeText: 'Mở phòng lúc 19h00 - Bắt đầu học 19h15 (Thứ 3, Thứ 5 & Chủ Nhật hàng tuần)',
    announcementContent:
      'Thầy Nguyễn Đình Hành thông báo thời gian mở phòng học trực tuyến chuyên đề Phương pháp bảo toàn và Giải đề thi Học sinh giỏi cấp tỉnh, thành phố. Các em chuẩn bị sẵn vở ghi, máy tính cầm tay và bấm nút "Vào học" bên dưới để nhận đường link phòng học trực tuyến do Thầy đăng.',
    primaryMeetingUrl: 'https://meet.google.com/ndh-chem-live',
    roomCode: 'meet.google.com/ndh-chem-live',
    passcode: 'NDH2026',
    meetingLinks: [
      {
        id: 'ml-1',
        label: 'Link Phòng Học Chính (Google Meet HD)',
        url: 'https://meet.google.com/ndh-chem-live',
        roomCode: 'ndh-chem-live',
      },
      {
        id: 'ml-2',
        label: 'Link Phòng Học Dự Phòng (Zoom Trực Tuyến)',
        url: 'https://zoom.us/j/9882752888',
        roomCode: '988 275 2888',
        passcode: '123456',
      },
    ],
    attachments: [],
    status: 'open',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: new Date().toLocaleDateString('vi-VN'),
  },
  {
    id: 'online-2',
    title: 'Thông Báo Mở Phòng Học Trực Tuyến: Ôn Tập Trọng Tâm Hóa Học Khối 8 & Khối 9',
    classGroup: 'H9.1',
    openTimeText: 'Mở phòng lúc 17h15 - Học từ 17h30 đến 19h00 (Thứ 2 - Thứ 4 - Thứ 6)',
    announcementContent:
      'Buổi học trực tuyến củng cố chuỗi phản ứng vô cơ, nhận biết các hợp chất và giải bài tập nồng độ dung dịch. Học sinh bấm nút "Vào học" để hiển thị đường link vào lớp trực tuyến.',
    primaryMeetingUrl: 'https://meet.google.com/ndh-hoa89-room',
    roomCode: 'meet.google.com/ndh-hoa89-room',
    passcode: '',
    meetingLinks: [
      {
        id: 'ml-3',
        label: 'Link Vào Học Trực Tiếp Khối 8 & 9 (Google Meet)',
        url: 'https://meet.google.com/ndh-hoa89-room',
        roomCode: 'ndh-hoa89-room',
      },
    ],
    attachments: [],
    status: 'open',
    author: 'Thầy Nguyễn Đình Hành',
    createdAt: new Date().toLocaleDateString('vi-VN'),
  },
];

export function getStoredOnlineSessions(): OnlineClassSessionItem[] {
  const parsed = readPersistedKey<OnlineClassSessionItem[]>(
    ONLINE_CLASS_SESSIONS_KEY,
    DEFAULT_ONLINE_CLASS_SESSIONS
  );
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return DEFAULT_ONLINE_CLASS_SESSIONS;
}

export function saveAllOnlineSessions(
  items: OnlineClassSessionItem[]
): OnlineClassSessionItem[] {
  writePersistedKey(ONLINE_CLASS_SESSIONS_KEY, items, {
    eventName: 'ndh-online-sessions-updated',
  });
  return items;
}

export function saveOnlineSessionItem(
  item: OnlineClassSessionItem
): OnlineClassSessionItem[] {
  const current = getStoredOnlineSessions();
  const id = item.id || `online-${Date.now()}`;
  const normalized: OnlineClassSessionItem = {
    ...item,
    id,
    author: item.author || 'Thầy Nguyễn Đình Hành',
    createdAt: item.createdAt || new Date().toLocaleDateString('vi-VN'),
  };
  const existingIdx = current.findIndex((s) => s.id === id);
  let next: OnlineClassSessionItem[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = normalized;
  } else {
    next = [normalized, ...current];
  }
  return saveAllOnlineSessions(next);
}

export function deleteOnlineSessionItem(id: string): OnlineClassSessionItem[] {
  markItemDeleted(id);
  const current = getStoredOnlineSessions();
  const next = current.filter((s) => s.id !== id);
  return saveAllOnlineSessions(next);
}

export function initExamCloudListeners() {
  initCloudPersistence();
}

if (typeof window !== 'undefined') {
  initExamCloudListeners();
}


