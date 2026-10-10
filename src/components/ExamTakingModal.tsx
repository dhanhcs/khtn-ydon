import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  AlertCircle, 
  Send, 
  HelpCircle, 
  User, 
  Building2, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { Exam, StudentSubmission, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../types';
import { shuffleExamQuestions } from '../utils/examShuffler';

interface ExamTakingModalProps {
  exam: Exam;
  studentName: string;
  className: string;
  onClose: () => void;
  onSubmitExam: (submission: StudentSubmission) => void;
}

export function ExamTakingModal({
  exam,
  studentName,
  className,
  onClose,
  onSubmitExam
}: ExamTakingModalProps) {
  // Automatically generate a balanced shuffled exam attempt for this student:
  // - MCQ question order is randomized
  // - Options A, B, C, D are randomized per question
  // - Crucially, correct answers are evenly balanced across A, B, C, D (no bias to one letter)
  const activeQuestions = useMemo(() => {
    return shuffleExamQuestions(exam.questions);
  }, [exam.id]);

  const totalSeconds = (exam.durationMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const startTimeRef = useRef<string>(new Date().toISOString().replace('T', ' ').substring(0, 19));

  // Answers state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});

  // Current Turn / Step:
  // Lượt 1: Câu 1 - 4 (Trắc nghiệm)
  // Lượt 2: Câu 5 - 8 (Trắc nghiệm)
  // Lượt 3: Câu 9 - 12 (Trắc nghiệm)
  // Lượt 4: Câu 13 - 16 (Trắc nghiệm)
  // Lượt 5: Câu 17 (Đúng / Sai 4 ý - xuất hiện 1 mình)
  // Lượt 6: Câu 18 (Trả lời ngắn - xuất hiện 1 mình)
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);

  // ================= ANTI-CHEAT SYSTEM STATE =================
  const [violationCount, setViolationCount] = useState<number>(0);
  const violationCountRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [currentViolationNumber, setCurrentViolationNumber] = useState<number>(1);
  const [isLockedForCheating, setIsLockedForCheating] = useState<boolean>(false);

  // Separate questions by type from the balanced shuffled questions
  const mcqQuestions = useMemo(() => 
    activeQuestions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[],
    [activeQuestions]
  );
  
  const tfQuestion = useMemo(() => 
    activeQuestions.find(q => q.type === 'true_false') as TrueFalseQuestion | undefined,
    [activeQuestions]
  );
  
  const saQuestion = useMemo(() => 
    activeQuestions.find(q => q.type === 'short_answer') as ShortAnswerQuestion | undefined,
    [activeQuestions]
  );

  // Trigger violation handler (Desktop & Mobile)
  const triggerViolation = () => {
    if (isSubmittedRef.current || isLockedForCheating) return;
    const now = Date.now();
    // Cooldown 1500ms to avoid double triggering between blur and visibilitychange
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    const nextCount = violationCountRef.current + 1;
    violationCountRef.current = nextCount;
    setViolationCount(nextCount);
    setCurrentViolationNumber(nextCount);
    setShowViolationModal(true);

    if (nextCount >= 3) {
      setIsLockedForCheating(true);
      isSubmittedRef.current = true;
      // Auto lock and submit 0 points after small delay for student to see modal
      setTimeout(() => {
        handleFinalSubmit(true);
      }, 3000);
    }
  };

  // Anti-cheat event listeners for both PC and Phone
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerViolation();
      }
    };

    const handleWindowBlur = () => {
      triggerViolation();
    };

    const handlePageHide = () => {
      triggerViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isLockedForCheating]);

  // 15-minute Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When timer hits 0, auto-submit once
  useEffect(() => {
    if (secondsRemaining === 0 && !isSubmittedRef.current) {
      isSubmittedRef.current = true;
      handleFinalSubmit();
    }
  }, [secondsRemaining]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check if a question is answered
  const isQuestionAnswered = (index: number) => {
    if (index < 16) {
      const q = mcqQuestions[index];
      return q ? mcqAnswers[q.id] !== undefined : false;
    } else if (index === 16) {
      if (!tfQuestion) return false;
      const tfState = tfAnswers[tfQuestion.id] || {};
      return ['a', 'b', 'c', 'd'].every(sub => tfState[sub] !== undefined);
    } else if (index === 17) {
      if (!saQuestion) return false;
      const val = saAnswers[saQuestion.id];
      return val !== undefined && val.trim().length > 0;
    }
    return false;
  };

  // Chế độ hiển thị: Cộng dồn thêm 4 câu mỗi lần bấm (Mặc định)
  // Lượt 1: Câu 1 - 4 (4 câu)
  // Bấm tiếp tục (Lần 1): Thêm 4 câu (Câu 1 - 8)
  // Bấm tiếp tục (Lần 2): Thêm 4 câu (Câu 1 - 12)
  // Bấm tiếp tục (Lần 3): Thêm 4 câu (Câu 1 - 16) -> 4 lần bấm hết 16 câu TN
  // Lượt 5: Câu 17 Đúng / Sai xuất hiện 1 lần
  // Lượt 6: Câu 18 Điền ngắn xuất hiện 1 lần
  const currentTurnQuestions = useMemo(() => {
    if (currentTurn === 1) return activeQuestions.slice(0, 4);
    if (currentTurn === 2) return activeQuestions.slice(0, 8); // Thêm 4 câu 5..8
    if (currentTurn === 3) return activeQuestions.slice(0, 12); // Thêm 4 câu 9..12
    if (currentTurn === 4) return activeQuestions.slice(0, 16); // Thêm 4 câu 13..16 (hết 16 câu TN)
    if (currentTurn === 5) return tfQuestion ? [tfQuestion] : activeQuestions.slice(16, 17);
    if (currentTurn === 6) return saQuestion ? [saQuestion] : activeQuestions.slice(17, 18);
    return [];
  }, [activeQuestions, currentTurn, tfQuestion, saQuestion]);

  // Turn metadata
  const turnMetadata = useMemo(() => {
    switch (currentTurn) {
      case 1:
        return {
          title: 'LƯỢT 1 / 4 (TN): CÂU 1 ĐẾN CÂU 4',
          sub: '4 câu trắc nghiệm đầu tiên • 0.5 điểm/câu. Bấm Tiếp tục để mở thêm 4 câu tiếp theo.',
          rangeText: 'Câu 1 - 4 (Đang mở 4 câu)',
          nextLabel: 'Tiếp tục (+ Thêm 4 câu: Câu 5 - 8)'
        };
      case 2:
        return {
          title: 'LƯỢT 2 / 4 (TN): CÂU 1 ĐẾN CÂU 8',
          sub: 'Đã mở thêm 4 câu (Câu 5 - 8) • Tổng cộng 8/16 câu trắc nghiệm.',
          rangeText: 'Câu 1 - 8 (Đang mở 8 câu)',
          prevLabel: 'Cuộn về Câu 1 - 4',
          nextLabel: 'Tiếp tục (+ Thêm 4 câu: Câu 9 - 12)'
        };
      case 3:
        return {
          title: 'LƯỢT 3 / 4 (TN): CÂU 1 ĐẾN CÂU 12',
          sub: 'Đã mở thêm 4 câu (Câu 9 - 12) • Tổng cộng 12/16 câu trắc nghiệm.',
          rangeText: 'Câu 1 - 12 (Đang mở 12 câu)',
          prevLabel: 'Cuộn về Câu 5 - 8',
          nextLabel: 'Tiếp tục (+ Thêm 4 câu: Câu 13 - 16)'
        };
      case 4:
        return {
          title: 'LƯỢT 4 / 4 (TN): TRỌN VẸN 16 CÂU TRẮC NGHIỆM',
          sub: 'Đã mở hết 16 câu trắc nghiệm nhiều lựa chọn (8.0 điểm). Bấm Tiếp tục để chuyển sang câu Đúng/Sai.',
          rangeText: 'Câu 1 - 16 (Đã mở hết 16 câu TN)',
          prevLabel: 'Cuộn về Câu 9 - 12',
          nextLabel: 'Tiếp tục (Lần 4 ➔ Câu 17 Đúng / Sai)'
        };
      case 5:
        return {
          title: 'PHẦN II: CÂU 17 (TRẮC NGHIỆM ĐÚNG / SAI)',
          sub: 'Xuất hiện riêng biệt 1 câu 4 ý a, b, c, d • Tối đa 1.0 điểm.',
          rangeText: 'Câu 17 (Xuất hiện 1 mình)',
          prevLabel: 'Quay lại xem 16 câu Trắc nghiệm',
          nextLabel: 'Tiếp tục (➔ Câu 18: Trả lời ngắn)'
        };
      case 6:
        return {
          title: 'PHẦN III: CÂU 18 (TRẢ LỜI NGẮN / ĐIỀN SỐ)',
          sub: 'Xuất hiện riêng biệt 1 câu tính toán / điền kết quả • Tối đa 1.0 điểm.',
          rangeText: 'Câu 18 (Xuất hiện 1 mình)',
          prevLabel: 'Quay lại Câu 17 Đúng/Sai',
          nextLabel: 'Hoàn thành & Nộp bài thi'
        };
      default:
        return {
          title: `LƯỢT ${currentTurn} / 6`,
          sub: '',
          rangeText: '',
          nextLabel: 'Tiếp tục'
        };
    }
  }, [currentTurn]);

  // Turn navigation handlers with smooth scroll to newly revealed questions
  const handleNextTurn = () => {
    if (currentTurn < 6) {
      const nextTurnNum = currentTurn + 1;
      setCurrentTurn(nextTurnNum);
      
      // Auto-scroll to the first newly revealed question
      setTimeout(() => {
        if (nextTurnNum === 2 && activeQuestions[4]) {
          const el = document.getElementById(`q-card-${activeQuestions[4].id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (nextTurnNum === 3 && activeQuestions[8]) {
          const el = document.getElementById(`q-card-${activeQuestions[8].id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (nextTurnNum === 4 && activeQuestions[12]) {
          const el = document.getElementById(`q-card-${activeQuestions[12].id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (mainScrollRef.current) {
          mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handlePrevTurn = () => {
    if (currentTurn > 1) {
      const prevTurnNum = currentTurn - 1;
      setCurrentTurn(prevTurnNum);
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Helper to map question index (0..17) to Turn (1..6)
  const getTurnForQuestionIndex = (idx: number): number => {
    if (idx < 4) return 1;
    if (idx < 8) return 2;
    if (idx < 12) return 3;
    if (idx < 16) return 4;
    if (idx === 16) return 5;
    return 6;
  };

  const jumpToQuestion = (idx: number) => {
    const targetTurn = getTurnForQuestionIndex(idx);
    setCurrentTurn(targetTurn);
    const targetQ = activeQuestions[idx];
    if (targetQ) {
      setHighlightedQuestionId(targetQ.id);
      setTimeout(() => {
        const el = document.getElementById(`q-card-${targetQ.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  };

  // Calculate score and submit
  const handleFinalSubmit = (forceCheatingZero: boolean = false) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const timeSpent = totalSeconds - secondsRemaining;

    // If locked for cheating (3rd violation), award 0.0 total score
    if (forceCheatingZero || violationCountRef.current >= 3 || isLockedForCheating) {
      const lockedSubmission: StudentSubmission = {
        id: 'sub-' + Date.now(),
        examId: exam.id,
        examTitle: exam.title,
        subject: exam.subject,
        grade: exam.grade,
        studentName,
        className,
        startedAt: startTimeRef.current,
        submittedAt: nowStr,
        timeSpentSeconds: timeSpent,
        mcqScore: 0,
        tfScore: 0,
        saScore: 0,
        totalScore: 0,
        shuffledQuestions: activeQuestions,
        violationsCount: Math.max(3, violationCountRef.current),
        penaltyApplied: 'locked_zero',
        isLockedForCheating: true,
        answers: {
          mcq: mcqAnswers,
          tf: tfAnswers,
          sa: saAnswers
        }
      };
      onSubmitExam(lockedSubmission);
      return;
    }

    // 1. Calculate MCQ score (16 * 0.5 = 8.0 pts max)
    let mcqScore = 0;
    mcqQuestions.forEach((q) => {
      if (mcqAnswers[q.id] === q.correctAnswer) {
        mcqScore += 0.5;
      }
    });

    // 2. Calculate True/False score (1.0 pt max)
    // Rule: 1 ý đúng = 0.1đ; 2 ý đúng = 0.25đ; 3 ý đúng = 0.5đ; 4 ý đúng = 1.0đ
    let tfScore = 0;
    if (tfQuestion) {
      const studentTf = tfAnswers[tfQuestion.id] || {};
      let correctSubCount = 0;
      tfQuestion.statements.forEach((st) => {
        if (studentTf[st.subId] === st.isCorrect) {
          correctSubCount += 1;
        }
      });

      if (correctSubCount === 1) tfScore = 0.1;
      else if (correctSubCount === 2) tfScore = 0.25;
      else if (correctSubCount === 3) tfScore = 0.5;
      else if (correctSubCount === 4) tfScore = 1.0;
    }

    // 3. Calculate Short Answer score (1.0 pt max)
    let saScore = 0;
    if (saQuestion) {
      const studentSa = (saAnswers[saQuestion.id] || '').trim().toLowerCase();
      if (studentSa) {
        const isMatch = saQuestion.acceptableAnswers.some(ans => {
          const normAns = ans.trim().toLowerCase();
          return normAns === studentSa || normAns.replace(',', '.') === studentSa.replace(',', '.');
        });
        if (isMatch) {
          saScore = 1.0;
        }
      }
    }

    const rawTotalScore = Math.round((mcqScore + tfScore + saScore) * 100) / 100;
    let finalTotalScore = rawTotalScore;
    let penalty: 'none' | 'warning' | 'minus_50_percent' = 'none';

    // Penalty check:
    // Lần 2: Trừ 50% tổng số điểm
    if (violationCountRef.current === 2) {
      finalTotalScore = Math.round((rawTotalScore * 0.5) * 10) / 10;
      penalty = 'minus_50_percent';
    } else if (violationCountRef.current === 1) {
      penalty = 'warning';
    }

    const submission: StudentSubmission = {
      id: 'sub-' + Date.now(),
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      grade: exam.grade,
      studentName,
      className,
      startedAt: startTimeRef.current,
      submittedAt: nowStr,
      timeSpentSeconds: timeSpent,
      mcqScore,
      tfScore,
      saScore,
      totalScore: finalTotalScore,
      shuffledQuestions: activeQuestions,
      violationsCount: violationCountRef.current,
      penaltyApplied: penalty,
      isLockedForCheating: false,
      answers: {
        mcq: mcqAnswers,
        tf: tfAnswers,
        sa: saAnswers
      }
    };

    onSubmitExam(submission);
  };

  const answeredCount = Array.from({ length: 18 }).filter((_, i) => isQuestionAnswered(i)).length;

  return (
    <div id="exam-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div id="exam-modal-container" className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Top Header Bar with Timer, Anti-Cheat Badge, and Student Info */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/80 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {exam.subject === 'physics' ? 'Vật lí' : exam.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} - Khối {exam.grade}
              </span>
              <span className="text-xs text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                18 câu chuẩn GDPT 2018
              </span>

              {/* Anti-Cheat Active Indicator */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                violationCount === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : violationCount === 1
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                  : 'bg-rose-500/30 text-rose-300 border border-rose-500/60 animate-pulse'
              }`}>
                {violationCount === 0 ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Giám sát chống gian lận: Nghiêm túc</span>
                  </>
                ) : violationCount === 1 ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Đã nhắc nhở vi phạm (1/3)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>Đã trừ 50% điểm (2/3 vi phạm)</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black truncate max-w-xl text-white">
              {exam.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Student metadata */}
            <div className="hidden sm:flex flex-col text-right text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-300 justify-end">
                <User className="w-3.5 h-3.5" />
                <span>{studentName}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 justify-end">
                <Building2 className="w-3 h-3" />
                <span>Lớp: {className}</span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black shadow-inner ${
              secondsRemaining < 180 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-slate-800 text-emerald-400 border border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              id="submit-exam-now-btn"
              disabled={isLockedForCheating}
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content (2 columns: Questions Area on Left & 6-Turn Navigator on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 bg-slate-100">
          
          {/* Main Questions Area (3 cols): Displays 4 questions for Turns 1..4, and 1 question for Turns 5 & 6 */}
          <div 
            ref={mainScrollRef}
            className="lg:col-span-3 p-4 sm:p-6 overflow-y-auto space-y-5"
          >
            
            {/* Current Turn Header Banner */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {turnMetadata.title}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    (Tiến độ: {currentTurn}/6 lượt)
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {turnMetadata.sub}
                </p>
              </div>

              {/* Progress bar across 6 turns */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCurrentTurn(t);
                      if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={`Chuyển sang Lượt ${t}`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      currentTurn === t
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                        : t < currentTurn
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Render questions of the current turn */}
            <div className="space-y-4">
              {currentTurnQuestions.map((q) => {
                const activeIndex = activeQuestions.findIndex(item => item.id === q.id);
                const qNum = activeIndex >= 0 ? activeIndex + 1 : 1;
                const isHighlighted = highlightedQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    id={`q-card-${q.id}`}
                    className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                      isHighlighted 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    
                    {/* 1. Multiple Choice Question Card */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                            <span className="font-extrabold text-blue-700 mr-2 bg-blue-50 px-2 py-0.5 rounded-md">
                              Câu {qNum}:
                            </span>
                            {q.question}
                          </p>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            0.5 điểm
                          </span>
                        </div>

                        {/* Options A, B, C, D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = mcqAnswers[q.id] === optIdx;
                            const label = String.fromCharCode(65 + optIdx); // A, B, C, D

                            return (
                              <button
                                key={optIdx}
                                id={`option-${q.id}-${optIdx}`}
                                disabled={isLockedForCheating}
                                onClick={() => {
                                  setMcqAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                }}
                                className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs ring-2 ring-blue-500/20'
                                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/90 hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                                }`}>
                                  {label}
                                </span>
                                <span className="mt-0.5 leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. True / False Question Card (Turn 5) */}
                    {q.type === 'true_false' && (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                            <span className="font-extrabold text-indigo-700 mr-2 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Câu {qNum} (Đúng / Sai):
                            </span>
                            {q.question}
                          </p>
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full shrink-0 border border-indigo-200">
                            1.0 điểm
                          </span>
                        </div>

                        <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                          * Hướng dẫn: Chọn Đúng hoặc Sai cho từng ý a), b), c), d). (Đúng 1 ý: 0.1đ, 2 ý: 0.25đ, 3 ý: 0.5đ, 4 ý: 1.0đ).
                        </div>

                        <div className="space-y-2.5 pt-1">
                          {q.statements.map((st) => {
                            const currentVal = tfAnswers[q.id]?.[st.subId];

                            return (
                              <div 
                                key={st.subId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-3"
                              >
                                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 flex-1">
                                  <span className="font-black text-indigo-700 uppercase min-w-[24px]">
                                    {st.subId})
                                  </span>
                                  <span className="leading-relaxed">{st.text}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    disabled={isLockedForCheating}
                                    onClick={() => {
                                      setTfAnswers(prev => ({
                                        ...prev,
                                        [q.id]: {
                                          ...(prev[q.id] || {}),
                                          [st.subId]: true
                                        }
                                      }));
                                    }}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      currentVal === true 
                                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400' 
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50'
                                    }`}
                                  >
                                    ĐÚNG
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLockedForCheating}
                                    onClick={() => {
                                      setTfAnswers(prev => ({
                                        ...prev,
                                        [q.id]: {
                                          ...(prev[q.id] || {}),
                                          [st.subId]: false
                                        }
                                      }));
                                    }}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      currentVal === false 
                                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400' 
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-rose-50'
                                    }`}
                                  >
                                    SAI
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Short Answer Question Card (Turn 6) */}
                    {q.type === 'short_answer' && (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                            <span className="font-extrabold text-emerald-700 mr-2 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Câu {qNum} (Trả lời ngắn):
                            </span>
                            {q.question}
                          </p>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0 border border-emerald-200">
                            1.0 điểm
                          </span>
                        </div>

                        <div className="text-xs text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-200 font-medium">
                          * Hướng dẫn: Nhập kết quả tính toán hoặc câu trả lời ngắn gọn vào ô dưới đây (ví dụ số có thể viết dạng thập phân).
                        </div>

                        <div className="pt-2 max-w-lg space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Đáp án bài làm của em:
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="short-answer-input"
                              type="text"
                              disabled={isLockedForCheating}
                              value={saAnswers[q.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSaAnswers(prev => ({ ...prev, [q.id]: val }));
                              }}
                              placeholder="Nhập kết quả hoặc đáp án..."
                              className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl text-sm font-bold outline-none transition-colors"
                            />
                            {q.unit && (
                              <span className="absolute right-3.5 text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {q.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Bottom Turn Navigation Bar: "Quay lại" and "Tiếp tục" */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
              
              {/* Back Button */}
              {currentTurn > 1 ? (
                <button
                  id="btn-prev-turn"
                  onClick={handlePrevTurn}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{turnMetadata.prevLabel || 'Quay lại lượt trước'}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="text-center hidden sm:block">
                <span className="text-xs font-bold text-slate-500">
                  Lượt {currentTurn} / 6 • {turnMetadata.rangeText}
                </span>
              </div>

              {/* Next / Submit Button */}
              {currentTurn < 6 ? (
                <button
                  id="btn-next-turn"
                  onClick={handleNextTurn}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-md transition-transform active:scale-95 ml-auto"
                >
                  <span>{turnMetadata.nextLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-submit-turn-finish"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md transition-transform active:scale-95 ml-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Hoàn Thành & Nộp Bài</span>
                </button>
              )}

            </div>

          </div>

          {/* Right Column: 6-Turn Navigator Palette & Anti-Cheat Summary */}
          <div className="lg:col-span-1 p-4 sm:p-6 overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 bg-white space-y-4">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  <span>6 LƯỢT KIỂM TRA (18 CÂU)</span>
                </h4>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {answeredCount}/18 câu
                </span>
              </div>

              {/* 4 TURNS OF MULTIPLE CHOICE (4 câu / lượt = 16 câu) */}
              {[
                { turn: 1, range: 'Câu 1 - 4', indices: [0, 1, 2, 3] },
                { turn: 2, range: 'Câu 5 - 8', indices: [4, 5, 6, 7] },
                { turn: 3, range: 'Câu 9 - 12', indices: [8, 9, 10, 11] },
                { turn: 4, range: 'Câu 13 - 16', indices: [12, 13, 14, 15] },
              ].map(({ turn, range, indices }) => {
                const isCurrent = currentTurn === turn;
                const turnAnsweredCount = indices.filter(idx => isQuestionAnswered(idx)).length;
                const isTurnComplete = turnAnsweredCount === indices.length;

                return (
                  <div 
                    key={turn}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400/40' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => {
                          setCurrentTurn(turn);
                          if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-left font-bold text-xs text-slate-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {turn}
                        </span>
                        <span>Lượt {turn}: {range}</span>
                      </button>

                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isTurnComplete 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {turnAnsweredCount}/4
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {indices.map((idx) => {
                        const answered = isQuestionAnswered(idx);
                        return (
                          <button
                            key={idx}
                            id={`palette-q-${idx + 1}`}
                            onClick={() => jumpToQuestion(idx)}
                            className={`h-7 rounded-lg font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer ${
                              answered
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* LƯỢT 5: CÂU 17 (ĐÚNG / SAI 4 Ý) */}
              <div 
                className={`p-2.5 rounded-xl border transition-all ${
                  currentTurn === 5
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-400/40' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => {
                      setCurrentTurn(5);
                      if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-left font-bold text-xs text-indigo-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                      currentTurn === 5 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      5
                    </span>
                    <span>Lượt 5: Câu 17 (Đúng/Sai)</span>
                  </button>

                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isQuestionAnswered(16) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isQuestionAnswered(16) ? 'Đã xong' : '1.0đ'}
                  </span>
                </div>

                <button
                  onClick={() => jumpToQuestion(16)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isQuestionAnswered(16)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Câu 17 (4 ý a-b-c-d)</span>
                  <span>{isQuestionAnswered(16) ? '✓' : '...'}</span>
                </button>
              </div>

              {/* LƯỢT 6: CÂU 18 (TRẢ LỜI NGẮN) */}
              <div 
                className={`p-2.5 rounded-xl border transition-all ${
                  currentTurn === 6 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400/40' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => {
                      setCurrentTurn(6);
                      if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-left font-bold text-xs text-emerald-900 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                      currentTurn === 6 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      6
                    </span>
                    <span>Lượt 6: Câu 18 (Điền ngắn)</span>
                  </button>

                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isQuestionAnswered(17) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isQuestionAnswered(17) ? 'Đã xong' : '1.0đ'}
                  </span>
                </div>

                <button
                  onClick={() => jumpToQuestion(17)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isQuestionAnswered(17)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Câu 18 (Điền kết quả)</span>
                  <span>{isQuestionAnswered(17) ? '✓' : '...'}</span>
                </button>
              </div>

            </div>

            {/* Anti-cheat Policy Card */}
            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-800 text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Quy chế giám sát</span>
              </div>
              <ul className="text-[11px] text-rose-900 space-y-1 list-disc list-inside leading-relaxed">
                <li>Lần 1: Cảnh báo nhắc nhở</li>
                <li>Lần 2: Trừ 50% điểm bài làm</li>
                <li>Lần 3: Khóa bài thi, cho điểm 0</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* ================= RED ANTI-CHEAT VIOLATION ALERT MODAL ================= */}
      {showViolationModal && (
        <div 
          id="anti-cheat-violation-alert"
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-red-600 text-center space-y-5">
            
            {/* Pulsing Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
              {currentViolationNumber >= 3 ? (
                <Lock className="w-9 h-9" />
              ) : (
                <AlertTriangle className="w-9 h-9" />
              )}
            </div>

            {/* Red Warning Title */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                HỆ THỐNG GIÁM SÁT KHẢO THÍ TRỰC TUYẾN
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-red-700 pt-2">
                Em vi phạm quy chế kiểm tra, lần thứ {currentViolationNumber}!
              </h3>
            </div>

            {/* Specific penalty rules based on violation number */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs sm:text-sm text-red-950 text-left space-y-2 leading-relaxed">
              {currentViolationNumber === 1 && (
                <>
                  <p className="font-bold text-red-900">
                    ⚠️ HÌNH THỨC XỬ PHẠT: NHẮC NHỞ NGHIÊM KHẮC!
                  </p>
                  <p className="text-slate-700">
                    Hệ thống phát hiện em vừa thoát màn hình sang trang web khác hoặc chuyển sang ứng dụng khác. 
                    Em hãy tập trung làm bài kiểm tra và <strong>tuyệt đối không được rời khỏi màn hình này</strong> nữa nhé!
                  </p>
                </>
              )}

              {currentViolationNumber === 2 && (
                <>
                  <p className="font-bold text-red-900">
                    ⛔ HÌNH THỨC XỬ PHẠT: TRỪ 50% TỔNG SỐ ĐIỂM!
                  </p>
                  <p className="text-slate-700">
                    Em đã tái phạm rời khỏi màn hình kiểm tra lần thứ 2. Hệ thống tự động <strong>trừ 50% tổng số điểm toàn bài</strong> của em!
                  </p>
                  <p className="text-red-700 font-bold bg-white p-2 rounded-lg border border-red-200">
                    Cảnh báo cuối cùng: Nếu vi phạm lần thứ 3, bài thi sẽ bị KHÓA NGAY LẬP TỨC và CHO 0 ĐIỂM TOÀN BÀI!
                  </p>
                </>
              )}

              {currentViolationNumber >= 3 && (
                <>
                  <p className="font-black text-red-900 text-base">
                    🚨 HÌNH THỨC XỬ PHẠT: KHÓA BÀI THI & CHO ĐIỂM 0 TOÀN BÀI!
                  </p>
                  <p className="text-slate-700">
                    Em đã vi phạm quy chế kiểm tra 3 lần liên tiếp. Theo đúng quy định, hệ thống tiến hành <strong>đình chỉ làm bài, khóa bài kiểm tra và chấm 0 điểm toàn bài</strong>.
                  </p>
                </>
              )}
            </div>

            {/* Action button */}
            <div>
              {currentViolationNumber < 3 ? (
                <button
                  onClick={() => setShowViolationModal(false)}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Em đã hiểu và cam kết không vi phạm nữa
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowViolationModal(false);
                    handleFinalSubmit(true);
                  }}
                  className="w-full py-3 px-6 bg-slate-900 text-white font-black text-sm rounded-xl cursor-pointer"
                >
                  Đã bị khóa bài - Nhận kết quả 0 điểm
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal before Manual Submission */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Xác nhận nộp bài kiểm tra?
                </h3>
                <p className="text-xs text-slate-500">
                  Em đã hoàn thành {answeredCount} / 18 câu hỏi.
                </p>
              </div>
            </div>

            {answeredCount < 18 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Chú ý: Vẫn còn {18 - answeredCount} câu chưa trả lời!
                </span>
                <p className="text-slate-600">
                  Em có chắc chắn muốn nộp bài ngay bây giờ hay muốn quay lại làm tiếp?
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                id="confirm-final-submit-btn"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
              >
                Đồng ý nộp bài
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
