import {
  Exam,
  ExamQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  ShortAnswerQuestion,
  StudentSubmission
} from '../types';

/**
 * Chuẩn hóa chuỗi văn bản để đối chiếu câu hỏi / phương án / phát biểu
 */
function normalizeText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/^(?:Câu\s*\d+\s*[:.]?\s*)/i, '')
    .replace(/^(?:\([a-dA-D]\)|\[[a-dA-D]\]|[a-dA-D][.:\)-])\s*/i, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Khôi phục & chuẩn hóa danh sách đáp án trả lời ngắn (đặc biệt xử lý trường hợp số thập phân dấu phẩy như 2,5 bị tách thành ["2", "5"] hoặc ["2.5", "2", "5"])
 */
export function repairAcceptableAnswersList(rawList?: string[]): string[] {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];
  const trimmed = rawList.map(s => (s || '').trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  let baseAnswers: string[] = [...trimmed];

  // Trường hợp ["2.5", "2", "5"] do chuỗi "2.5, 2,5" bị split(',')
  if (
    trimmed.length === 3 &&
    /^-?\d+\.\d+$/.test(trimmed[0]) &&
    /^-?\d+$/.test(trimmed[1]) &&
    /^\d+$/.test(trimmed[2]) &&
    trimmed[0] === `${trimmed[1]}.${trimmed[2]}`
  ) {
    baseAnswers = [trimmed[0], `${trimmed[1]},${trimmed[2]}`];
  }
  // Trường hợp ["2", "5"] do giáo viên nhập 1 số thập phân "2,5" bị split(',')
  else if (
    trimmed.length === 2 &&
    /^-?\d+$/.test(trimmed[0]) &&
    /^\d+$/.test(trimmed[1])
  ) {
    const dotDec = `${trimmed[0]}.${trimmed[1]}`;
    const commaDec = `${trimmed[0]},${trimmed[1]}`;
    baseAnswers = [dotDec, commaDec, ...trimmed];
  }

  const expanded = new Set<string>();
  baseAnswers.forEach(ans => {
    expanded.add(ans);
    expanded.add(ans.replace(',', '.'));
    expanded.add(ans.replace('.', ','));
  });

  return Array.from(expanded).filter(Boolean);
}

/**
 * Chuẩn hóa giá trị số / đơn vị của học sinh để so sánh chính xác với đáp án chuẩn
 */
function cleanShortAnswerValue(val?: string, unit?: string): string {
  if (!val) return '';
  let s = val.trim().toLowerCase();
  if (unit) {
    const u = unit.trim().toLowerCase();
    if (u && s.endsWith(u)) {
      s = s.slice(0, s.length - u.length).trim();
    }
  }
  // Loại bỏ các đơn vị phổ biến nếu học sinh ghi kèm đơn vị vào ô số
  s = s.replace(/\s*(?:gam|g|kg|mol|lít|lit|l|ml|cm3|cm|m|mm|%|°c|j|kj|w|n|pa)\s*$/i, '').trim();
  return s;
}

export function isShortAnswerValueMatch(
  userVal: string,
  acceptableAnswers: string[],
  unit?: string
): boolean {
  const cleanedUser = cleanShortAnswerValue(userVal, unit);
  if (!cleanedUser) return false;

  const repairedList = repairAcceptableAnswersList(acceptableAnswers);
  const userDot = cleanedUser.replace(',', '.').replace(/\s+/g, '');
  const userNum = Number(userDot);
  const isUserNumeric = userDot !== '' && !isNaN(userNum) && isFinite(userNum);

  return repairedList.some(ans => {
    const cleanedAns = cleanShortAnswerValue(ans, unit);
    if (!cleanedAns) return false;
    if (cleanedUser === cleanedAns) return true;

    const ansDot = cleanedAns.replace(',', '.').replace(/\s+/g, '');
    if (userDot === ansDot) return true;

    if (isUserNumeric && ansDot !== '') {
      const ansNum = Number(ansDot);
      if (!isNaN(ansNum) && isFinite(ansNum) && Math.abs(userNum - ansNum) < 1e-6) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Tìm đề thi tương ứng với bài nộp của học sinh
 */
export function findMatchingExamForSubmission(
  sub: StudentSubmission,
  exams: Exam[]
): Exam | undefined {
  if (!exams || exams.length === 0) return undefined;

  // 1. Khớp chính xác theo examId
  const exact = exams.find(e => e.id === sub.examId);
  if (exact) return exact;

  // 2. Khớp theo tên đề thi chuẩn hóa
  const subTitleNorm = (sub.examTitle || '').trim().toLowerCase();
  if (subTitleNorm) {
    const byTitle = exams.find(
      e => (e.title || '').trim().toLowerCase() === subTitleNorm &&
           (!sub.grade || Number(e.grade) === Number(sub.grade))
    );
    if (byTitle) return byTitle;
  }

  // 3. Khớp đặc biệt cho bài kiểm tra Hóa học 9 lần 1 (hoặc cùng phân môn + khối + lần kiểm tra)
  const isChem9 =
    (sub.subject === 'chemistry' && Number(sub.grade) === 9) ||
    (/hóa\s*(?:học)?\s*9/i.test(sub.examTitle || ''));

  if (isChem9) {
    const chem9Exams = exams.filter(
      e => (e.subject === 'chemistry' && Number(e.grade) === 9) || /hóa\s*(?:học)?\s*9/i.test(e.title || '')
    );
    if (chem9Exams.length === 1) return chem9Exams[0];
    const lan1 = chem9Exams.find(
      e => /lần\s*1|tx\s*1|đề\s*1/i.test(e.title || '') || e.testNumber === 'TX1'
    );
    if (lan1) return lan1;
  }

  return undefined;
}

/**
 * Chấm lại 1 bài nộp của học sinh theo đáp án đã chỉnh sửa của đề thi
 */
export function regradeSubmissionWithExam(
  sub: StudentSubmission,
  exam: Exam
): { updatedSubmission: StudentSubmission; changed: boolean } {
  if (!exam || !Array.isArray(exam.questions) || exam.questions.length === 0) {
    return { updatedSubmission: sub, changed: false };
  }

  const masterMcqs = exam.questions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[];
  const masterTf = exam.questions.find(q => q.type === 'true_false') as TrueFalseQuestion | undefined;
  const masterSa = exam.questions.find(q => q.type === 'short_answer') as ShortAnswerQuestion | undefined;

  const hasShuffled = Array.isArray(sub.shuffledQuestions) && sub.shuffledQuestions.length > 0;
  const currentShuffled = hasShuffled ? [...sub.shuffledQuestions!] : [];

  const isPeriodicExam = 
    exam.examCategory === 'periodic' || 
    exam.questions.some(q => q.type === 'essay') ||
    exam.questions.filter(q => q.type === 'true_false').length >= 2;
  const mcqPoint = isPeriodicExam ? 0.25 : 0.5;

  // -------------------------------------------------------------
  // 1. CHẤM LẠI PHẦN I: 16 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN
  // (0.5đ/câu cho KTTX hoặc 0.25đ/câu cho KTĐK)
  // -------------------------------------------------------------
  let mcqScore = 0;
  const updatedShuffledMcqs: MultipleChoiceQuestion[] = [];

  if (hasShuffled) {
    const shuffledMcqs = currentShuffled.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[];
    const usedMasterIndices = new Set<number>();
    const sqToMasterMap = new Map<number, MultipleChoiceQuestion>();

    // Pass 1: Khớp theo ID câu hỏi
    shuffledMcqs.forEach((sq, sIdx) => {
      const mIdx = masterMcqs.findIndex((m, idx) => !usedMasterIndices.has(idx) && m.id === sq.id);
      if (mIdx !== -1) {
        usedMasterIndices.add(mIdx);
        sqToMasterMap.set(sIdx, masterMcqs[mIdx]);
      }
    });

    // Pass 2: Khớp theo nội dung câu hỏi
    shuffledMcqs.forEach((sq, sIdx) => {
      if (sqToMasterMap.has(sIdx)) return;
      const sqNorm = normalizeText(sq.question);
      if (!sqNorm) return;
      const mIdx = masterMcqs.findIndex(
        (m, idx) => !usedMasterIndices.has(idx) && normalizeText(m.question) === sqNorm
      );
      if (mIdx !== -1) {
        usedMasterIndices.add(mIdx);
        sqToMasterMap.set(sIdx, masterMcqs[mIdx]);
      }
    });

    // Pass 3: Khớp theo thứ tự còn lại
    shuffledMcqs.forEach((_, sIdx) => {
      if (sqToMasterMap.has(sIdx)) return;
      const mIdx = masterMcqs.findIndex((_, idx) => !usedMasterIndices.has(idx));
      if (mIdx !== -1) {
        usedMasterIndices.add(mIdx);
        sqToMasterMap.set(sIdx, masterMcqs[mIdx]);
      }
    });

    shuffledMcqs.forEach((sq, sIdx) => {
      const masterQ = sqToMasterMap.get(sIdx);
      if (!masterQ) {
        const studentChoice = sub.answers?.mcq?.[sq.id];
        if (studentChoice !== undefined && Number(studentChoice) === Number(sq.correctAnswer)) {
          mcqScore += mcqPoint;
        }
        updatedShuffledMcqs.push(sq);
        return;
      }

      // Ánh xạ 1-1 giữa 4 phương án của masterQ và 4 phương án đã trộn trên màn hình học sinh (sq.options)
      const masterToShuffledOptIdx: Record<number, number> = {};
      const usedShuffledOpt = new Set<number>();

      // Pass 1: Khớp theo nội dung phương án
      for (let mOptIdx = 0; mOptIdx < 4; mOptIdx++) {
        const mOptNorm = normalizeText(masterQ.options[mOptIdx]);
        if (!mOptNorm) continue;
        for (let sOptIdx = 0; sOptIdx < 4; sOptIdx++) {
          if (usedShuffledOpt.has(sOptIdx)) continue;
          if (normalizeText(sq.options[sOptIdx]) === mOptNorm) {
            masterToShuffledOptIdx[mOptIdx] = sOptIdx;
            usedShuffledOpt.add(sOptIdx);
            break;
          }
        }
      }

      // Pass 2: Các phương án còn lại (nếu giáo viên sửa chữ trong phương án)
      for (let mOptIdx = 0; mOptIdx < 4; mOptIdx++) {
        if (masterToShuffledOptIdx[mOptIdx] !== undefined) continue;
        for (let sOptIdx = 0; sOptIdx < 4; sOptIdx++) {
          if (!usedShuffledOpt.has(sOptIdx)) {
            masterToShuffledOptIdx[mOptIdx] = sOptIdx;
            usedShuffledOpt.add(sOptIdx);
            break;
          }
        }
      }

      const newSqOptions: [string, string, string, string] = [...sq.options] as [string, string, string, string];
      for (let mOptIdx = 0; mOptIdx < 4; mOptIdx++) {
        const targetSIdx = masterToShuffledOptIdx[mOptIdx];
        if (targetSIdx !== undefined && masterQ.options[mOptIdx] !== undefined) {
          newSqOptions[targetSIdx] = masterQ.options[mOptIdx];
        }
      }

      const newCorrectAnswerInSq =
        masterToShuffledOptIdx[masterQ.correctAnswer] ?? masterQ.correctAnswer;

      const updatedSq: MultipleChoiceQuestion = {
        ...sq,
        question: masterQ.question,
        options: newSqOptions,
        correctAnswer: newCorrectAnswerInSq,
        explanation: masterQ.explanation ?? sq.explanation,
        imageUrl: masterQ.imageUrl ?? sq.imageUrl
      };
      updatedShuffledMcqs.push(updatedSq);

      const studentChoice = sub.answers?.mcq?.[sq.id] ?? sub.answers?.mcq?.[masterQ.id];
      if (studentChoice !== undefined && Number(studentChoice) === Number(newCorrectAnswerInSq)) {
        mcqScore += mcqPoint;
      }
    });
  } else {
    masterMcqs.forEach(masterQ => {
      const studentChoice = sub.answers?.mcq?.[masterQ.id];
      if (studentChoice !== undefined && Number(studentChoice) === Number(masterQ.correctAnswer)) {
        mcqScore += mcqPoint;
      }
    });
  }

  // -------------------------------------------------------------
  // 2. CHẤM LẠI PHẦN II: CÁC CÂU ĐÚNG / SAI (4 Ý - 1.0 ĐIỂM/CÂU)
  // (1 câu đối với KTTX, 2 câu đối với KTĐK)
  // -------------------------------------------------------------
  let tfScore = 0;
  const masterTfs = exam.questions.filter(q => q.type === 'true_false') as TrueFalseQuestion[];
  const updatedShuffledTfs: TrueFalseQuestion[] = [];

  masterTfs.forEach((masterTf, tfIndex) => {
    const sqTfs = currentShuffled.filter(q => q.type === 'true_false') as TrueFalseQuestion[];
    const sqTf = sqTfs[tfIndex] || sqTfs.find(q => q.id === masterTf.id);

    let updatedTf: TrueFalseQuestion = masterTf;
    if (sqTf && Array.isArray(sqTf.statements) && sqTf.statements.length === 4) {
      const masterToShuffledStmtIdx: Record<number, number> = {};
      const usedShuffledStmt = new Set<number>();

      // Pass 1: Khớp phát biểu theo nội dung
      for (let mIdx = 0; mIdx < 4; mIdx++) {
        const mNorm = normalizeText(masterTf.statements[mIdx]?.text);
        if (!mNorm) continue;
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          if (usedShuffledStmt.has(sIdx)) continue;
          if (normalizeText(sqTf.statements[sIdx]?.text) === mNorm) {
            masterToShuffledStmtIdx[mIdx] = sIdx;
            usedShuffledStmt.add(sIdx);
            break;
          }
        }
      }

      // Pass 2: Khớp phát biểu còn lại theo thứ tự
      for (let mIdx = 0; mIdx < 4; mIdx++) {
        if (masterToShuffledStmtIdx[mIdx] !== undefined) continue;
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          if (!usedShuffledStmt.has(sIdx)) {
            masterToShuffledStmtIdx[mIdx] = sIdx;
            usedShuffledStmt.add(sIdx);
            break;
          }
        }
      }

      const newStatements = [...sqTf.statements] as [any, any, any, any];
      for (let mIdx = 0; mIdx < 4; mIdx++) {
        const sIdx = masterToShuffledStmtIdx[mIdx];
        if (sIdx !== undefined && masterTf.statements[mIdx]) {
          newStatements[sIdx] = {
            ...sqTf.statements[sIdx],
            text: masterTf.statements[mIdx].text,
            isCorrect: Boolean(masterTf.statements[mIdx].isCorrect)
          };
        }
      }

      updatedTf = {
        ...sqTf,
        question: masterTf.question,
        statements: newStatements,
        explanation: masterTf.explanation ?? sqTf.explanation,
        imageUrl: masterTf.imageUrl ?? sqTf.imageUrl
      };
    }

    updatedShuffledTfs.push(updatedTf);

    const studentTf =
      sub.answers?.tf?.[updatedTf.id] ||
      sub.answers?.tf?.[masterTf.id] ||
      (masterTfs.length === 1 ? Object.values(sub.answers?.tf || {})[0] : undefined) ||
      {};

    let correctSubCount = 0;
    updatedTf.statements.forEach(st => {
      if (studentTf[st.subId] !== undefined && Boolean(studentTf[st.subId]) === Boolean(st.isCorrect)) {
        correctSubCount += 1;
      }
    });

    let qTfScore = 0;
    if (correctSubCount === 1) qTfScore = 0.1;
    else if (correctSubCount === 2) qTfScore = 0.25;
    else if (correctSubCount === 3) qTfScore = 0.5;
    else if (correctSubCount === 4) qTfScore = 1.0;

    tfScore += qTfScore;
  });

  // -------------------------------------------------------------
  // 3. CHẤM LẠI PHẦN III: CÂU 18 TRẢ LỜI NGẮN (TỐI ĐA 1.0 ĐIỂM)
  // -------------------------------------------------------------
  let saScore = 0;
  let updatedShuffledSa: ShortAnswerQuestion | undefined = undefined;

  if (masterSa) {
    const sqSa = currentShuffled.find(q => q.type === 'short_answer') as ShortAnswerQuestion | undefined;
    const repairedBlanks = masterSa.blanks?.map(b => ({
      ...b,
      acceptableAnswers: repairAcceptableAnswersList(b.acceptableAnswers)
    }));
    const repairedAcceptable = repairAcceptableAnswersList(masterSa.acceptableAnswers);

    updatedShuffledSa = {
      ...masterSa,
      id: sqSa?.id || masterSa.id,
      acceptableAnswers: repairedAcceptable,
      blanks: repairedBlanks
    };

    const rawSa = (
      sub.answers?.sa?.[updatedShuffledSa.id] ??
      sub.answers?.sa?.[masterSa.id] ??
      Object.values(sub.answers?.sa || {})[0] ??
      ''
    ).trim();

    if (repairedBlanks && repairedBlanks.length > 0) {
      let parsedObj: Record<string, string> = {};
      try {
        parsedObj = JSON.parse(rawSa);
      } catch {
        const parts = rawSa.split(/[;|/]/);
        parts.forEach((p, idx) => {
          parsedObj[String(idx + 1)] = p.trim();
        });
      }

      let earnedSa = 0;
      repairedBlanks.forEach((blank, idx) => {
        const userVal = (parsedObj[blank.id] || parsedObj[String(idx + 1)] || '').trim();
        if (userVal && isShortAnswerValueMatch(userVal, blank.acceptableAnswers, blank.unit)) {
          earnedSa += blank.points ?? 0.5;
        }
      });
      saScore = Math.min(1.0, Math.round(earnedSa * 100) / 100);
    } else if (rawSa) {
      if (rawSa.startsWith('{')) {
        try {
          const parsedObj = JSON.parse(rawSa);
          const vals = [parsedObj['1'], parsedObj['2']].map(v => (v || '').trim()).filter(Boolean);
          if (vals.length > 0) {
            let earned = 0;
            vals.forEach((v, idx) => {
              const targetKeyList =
                repairedAcceptable.length >= 2 && repairedAcceptable[idx]
                  ? [repairedAcceptable[idx], ...repairedAcceptable]
                  : repairedAcceptable;
              if (isShortAnswerValueMatch(v, targetKeyList, masterSa.unit)) {
                earned += vals.length === 1 ? 1.0 : 0.5;
              }
            });
            saScore = Math.min(1.0, Math.round(earned * 100) / 100);
          }
        } catch {}
      } else if (isShortAnswerValueMatch(rawSa, repairedAcceptable, masterSa.unit)) {
        saScore = 1.0;
      }
    }
  }

  // -------------------------------------------------------------
  // 4. TỔNG HỢP ĐIỂM SỐ MỚI & KIỂM TRA THAY ĐỔI
  // -------------------------------------------------------------
  mcqScore = Math.round(mcqScore * 100) / 100;
  tfScore = Math.round(tfScore * 100) / 100;
  saScore = Math.round(saScore * 100) / 100;

  const rawTotalScore = Math.round((mcqScore + tfScore + saScore) * 100) / 100;
  let finalTotalScore = rawTotalScore;

  if (sub.isLockedForCheating || sub.penaltyApplied === 'locked_zero') {
    mcqScore = 0;
    tfScore = 0;
    saScore = 0;
    finalTotalScore = 0;
  } else if (sub.penaltyApplied === 'minus_50_percent' || sub.violationsCount === 2) {
    finalTotalScore = Math.round(rawTotalScore * 0.5 * 10) / 10;
  }

  const nextShuffledQuestions: ExamQuestion[] | undefined = hasShuffled
    ? [
        ...updatedShuffledMcqs,
        ...updatedShuffledTfs,
        ...(updatedShuffledSa ? [updatedShuffledSa] : [])
      ]
    : undefined;

  const scoreChanged =
    Math.abs((sub.mcqScore ?? 0) - mcqScore) > 1e-4 ||
    Math.abs((sub.tfScore ?? 0) - tfScore) > 1e-4 ||
    Math.abs((sub.saScore ?? 0) - saScore) > 1e-4 ||
    Math.abs((sub.totalScore ?? 0) - finalTotalScore) > 1e-4;

  const shuffledChanged =
    hasShuffled &&
    JSON.stringify(sub.shuffledQuestions) !== JSON.stringify(nextShuffledQuestions);

  if (!scoreChanged && !shuffledChanged) {
    return { updatedSubmission: sub, changed: false };
  }

  return {
    updatedSubmission: {
      ...sub,
      mcqScore,
      tfScore,
      saScore,
      totalScore: finalTotalScore,
      shuffledQuestions: nextShuffledQuestions ?? sub.shuffledQuestions
    },
    changed: true
  };
}

/**
 * Chấm lại toàn bộ danh sách bài nộp của học sinh theo các đề thi hiện hành
 */
export function regradeAllSubmissions(
  submissions: StudentSubmission[],
  exams: Exam[]
): { updatedSubmissions: StudentSubmission[]; changedCount: number } {
  if (!Array.isArray(submissions) || submissions.length === 0 || !Array.isArray(exams) || exams.length === 0) {
    return { updatedSubmissions: submissions || [], changedCount: 0 };
  }

  let changedCount = 0;
  const updatedSubmissions = submissions.map(sub => {
    const matchedExam = findMatchingExamForSubmission(sub, exams);
    if (!matchedExam) return sub;
    const { updatedSubmission, changed } = regradeSubmissionWithExam(sub, matchedExam);
    if (changed) changedCount += 1;
    return updatedSubmission;
  });

  return { updatedSubmissions, changedCount };
}
