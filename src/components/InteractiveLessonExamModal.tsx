import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  Send,
  HelpCircle,
  Building2,
  ChevronRight,
  RefreshCw,
  Trophy,
  Medal,
  Star,
  User,
  GraduationCap
} from 'lucide-react';
import { InteractiveLessonExam, GroupNumber, GroupSubmission, MultipleChoiceQuestion, UserSession } from '../types';
import { schoolClasses } from '../data/mockData';

interface InteractiveLessonExamModalProps {
  exam: InteractiveLessonExam;
  currentUser?: UserSession | null;
  initialMode?: 'group' | 'individual';
  onClose: () => void;
  onSubmitGroupExam: (sub: GroupSubmission) => void;
}

export function InteractiveLessonExamModal({
  exam,
  currentUser,
  initialMode = 'group',
  onClose,
  onSubmitGroupExam
}: InteractiveLessonExamModalProps) {
  // Interaction mode: 'group' (Nhóm 1 - 8) or 'individual' (Cá nhân từng HS)
  const [interactionMode, setInteractionMode] = useState<'group' | 'individual'>(initialMode);

  // Step 1: Info selection, Step 2: Taking exam, Step 3: Result & Cup honors
  const [step, setStep] = useState<'pick_group' | 'in_progress' | 'completed'>('pick_group');
  
  // Group selection state
  const [selectedGroup, setSelectedGroup] = useState<GroupNumber>(1);
  const [selectedClass, setSelectedClass] = useState<string>(currentUser?.className || '8A');
  const [leaderName, setLeaderName] = useState<string>(currentUser?.name || '');
  const [membersNote, setMembersNote] = useState<string>('');

  // Individual mode student name
  const [individualStudentName, setIndividualStudentName] = useState<string>(currentUser?.name || '');

  // Exam progress state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const totalSeconds = (exam.durationMinutes || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const startTimeRef = useRef<number>(Date.now());

  // Result submission
  const [finalSubmission, setFinalSubmission] = useState<GroupSubmission | null>(null);

  // Countdown timer during taking exam
  useEffect(() => {
    if (step !== 'in_progress') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const handleStartExam = () => {
    if (interactionMode === 'individual' && !individualStudentName.trim()) {
      alert('Vui lòng nhập họ và tên của em trước khi bắt đầu làm bài tương tác cá nhân.');
      return;
    }
    startTimeRef.current = Date.now();
    setStep('in_progress');
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleAutoSubmit = () => {
    calculateAndSubmit();
  };

  const calculateAndSubmit = () => {
    const questions = exam.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    const totalScore = Number(rawScore.toFixed(1));

    // Determine trophy
    let trophy: 'gold' | 'silver' | 'bronze' | 'effort' = 'effort';
    if (totalScore >= 8.5) trophy = 'gold';
    else if (totalScore >= 7.0) trophy = 'silver';
    else if (totalScore >= 5.0) trophy = 'bronze';

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const isIndiv = interactionMode === 'individual';
    const submissionName = isIndiv 
      ? (individualStudentName.trim() || 'Học sinh cá nhân')
      : `Nhóm ${selectedGroup}`;

    const submission: GroupSubmission = {
      id: `grp_sub_${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      lessonTitle: exam.lessonTitle,
      groupNumber: isIndiv ? 1 : selectedGroup,
      groupName: submissionName,
      className: selectedClass,
      leaderName: isIndiv ? submissionName : (leaderName.trim() || undefined),
      membersNote: isIndiv ? 'Tương tác cá nhân' : (membersNote.trim() || undefined),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeSpentSeconds: timeSpent,
      totalScore,
      trophy,
      correctCount,
      totalQuestions,
      answers
    };

    setFinalSubmission(submission);
    setStep('completed');
    onSubmitGroupExam(submission);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = exam.questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              {interactionMode === 'individual' ? (
                <User className="w-5 h-5 text-slate-900" />
              ) : (
                <Users className="w-5 h-5 text-slate-900" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                  {interactionMode === 'individual' ? 'Tương Tác Cá Nhân' : 'Tương Tác Nhóm 1 - 8'}
                </span>
                <span className="text-xs text-indigo-200">
                  {exam.lessonTitle}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate max-w-xl">
                {exam.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: PICK GROUP OR INDIVIDUAL */}
        {step === 'pick_group' && (
          <div className="p-5 sm:p-8 space-y-6 overflow-y-auto">
            
            {/* Mode Switcher Tabs */}
            <div className="flex justify-center">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 shadow-inner max-w-md w-full">
                <button
                  type="button"
                  onClick={() => setInteractionMode('group')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    interactionMode === 'group'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>1. Thi Đua Nhóm (1 - 8)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInteractionMode('individual')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    interactionMode === 'individual'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>2. Tương Tác Cá Nhân</span>
                </button>
              </div>
            </div>

            {/* Intro text */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                interactionMode === 'individual' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {interactionMode === 'individual'
                  ? 'Tự Học & Tự Đánh Giá Kiến Thức Cá Nhân'
                  : 'Hoạt Động Tương Tác Nhóm Trên Lớp Học'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {interactionMode === 'individual'
                  ? 'Nhập Thông Tin Cá Nhân Để Tham Gia'
                  : 'Chọn Danh Nghĩa Nhóm Tham Gia (1 - 8)'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Trả lời <strong>{exam.questions.length} câu hỏi</strong> củng cố bài học trong <strong>{exam.durationMinutes} phút</strong> để rinh Cúp Vàng 🏆 về cho {interactionMode === 'individual' ? 'chính mình' : 'nhóm'} nhé!
              </p>
            </div>

            {/* GROUP SELECTION UI (Only if mode === 'group') */}
            {interactionMode === 'group' && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider text-center">
                  Chọn Nhóm Của Bạn (Từ Nhóm 1 đến Nhóm 8):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {([1, 2, 3, 4, 5, 6, 7, 8] as GroupNumber[]).map((num) => {
                    const isSelected = selectedGroup === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedGroup(num)}
                        className={`p-4 rounded-2xl border-2 font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? 'border-indigo-600 bg-gradient-to-b from-indigo-50 to-blue-50 text-indigo-900 shadow-md scale-102 ring-2 ring-indigo-400'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                          isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {num}
                        </div>
                        <span className="text-sm font-black">Nhóm {num}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã chọn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETAILS FORM */}
            <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp học (16 lớp Y Đôn):</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-600"
                >
                  {schoolClasses.map(cls => (
                    <option key={cls} value={cls}>Lớp {cls}</option>
                  ))}
                </select>
              </div>

              {interactionMode === 'individual' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên của em: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={individualStudentName}
                    onChange={(e) => setIndividualStudentName(e.target.value)}
                    placeholder="Ví dụ: Đinh Thị Mai Lan"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nhóm trưởng / Đại diện nhóm (Tùy chọn):</label>
                    <input
                      type="text"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      placeholder="Ví dụ: Đinh Thị Mai Lan"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú thành viên (Tùy chọn):</label>
                    <input
                      type="text"
                      value={membersNote}
                      onChange={(e) => setMembersNote(e.target.value)}
                      placeholder="Ví dụ: Lan, Huy, Yến, Bảo, Thắng..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-700 outline-none focus:border-indigo-600"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Start Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleStartExam}
                className={`px-8 py-3.5 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2 ${
                  interactionMode === 'individual'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-blue-700'
                }`}
              >
                <span>
                  {interactionMode === 'individual'
                    ? `Bắt Đầu Làm Bài Tương Tác Cá Nhân (${individualStudentName || 'Học sinh'})`
                    : `Bắt Đầu Tương Tác Với Danh Nghĩa Nhóm ${selectedGroup}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TAKING EXAM */}
        {step === 'in_progress' && currentQ && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-header with group tag / individual tag, question progress & timer */}
            <div className="bg-slate-100 p-3 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-white font-black text-xs rounded-xl shadow-xs ${
                  interactionMode === 'individual' ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}>
                  {interactionMode === 'individual' 
                    ? `👤 ${individualStudentName || 'Cá nhân'} • Lớp ${selectedClass}`
                    : `👥 Nhóm ${selectedGroup} • Lớp ${selectedClass}`}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Câu {currentQIndex + 1} / {exam.questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  Đã trả lời: <strong className="text-indigo-700">{answeredCount}/{exam.questions.length}</strong>
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-black shadow-xs ${
                  secondsRemaining < 60 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-white text-indigo-900 border border-indigo-200'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Main Question Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                    interactionMode === 'individual' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {currentQIndex + 1}
                  </span>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {currentQ.question}
                    </h3>
                  </div>
                </div>

                {/* 4 Large Interactive Option Buttons */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const letter = ['A', 'B', 'C', 'D'][optIdx];
                    const isSelected = answers[currentQ.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-98 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-sm ring-2 ring-indigo-400'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-medium'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm leading-relaxed flex-1">
                          {opt}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Navigator Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {exam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-sm'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Submit Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQIndex < exam.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={calculateAndSubmit}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp Bài & Nhận Điểm</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED - TROPHY CEREMONY & EXPLANATIONS */}
        {step === 'completed' && finalSubmission && (
          <div className="p-6 sm:p-10 space-y-6 overflow-y-auto text-center">
            
            {/* Golden / Silver / Bronze Trophy Badge Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border-2 relative overflow-hidden shadow-xl ${
              finalSubmission.trophy === 'gold'
                ? 'bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-200 border-amber-400 text-amber-950'
                : finalSubmission.trophy === 'silver'
                ? 'bg-gradient-to-b from-slate-100 via-gray-50 to-slate-200 border-slate-300 text-slate-900'
                : finalSubmission.trophy === 'bronze'
                ? 'bg-gradient-to-b from-orange-100 via-amber-50 to-orange-200 border-orange-300 text-orange-950'
                : 'bg-gradient-to-b from-blue-50 to-indigo-100 border-indigo-200 text-indigo-950'
            }`}>
              
              <div className="text-5xl sm:text-7xl mb-3 animate-bounce">
                {finalSubmission.trophy === 'gold' && '🏆'}
                {finalSubmission.trophy === 'silver' && '🥈'}
                {finalSubmission.trophy === 'bronze' && '🥉'}
                {finalSubmission.trophy === 'effort' && '🎖️'}
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                finalSubmission.trophy === 'gold' ? 'bg-amber-500 text-slate-950' :
                finalSubmission.trophy === 'silver' ? 'bg-slate-400 text-white' :
                finalSubmission.trophy === 'bronze' ? 'bg-orange-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {finalSubmission.trophy === 'gold' && 'VINH DANH CÚP VÀNG XUẤT SẮC'}
                {finalSubmission.trophy === 'silver' && 'VINH DANH CÚP BẠC GIỎI'}
                {finalSubmission.trophy === 'bronze' && 'VINH DANH CÚP ĐỒNG KHÁ'}
                {finalSubmission.trophy === 'effort' && 'HOÀN THÀNH BÀI TƯƠNG TÁC'}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black mb-1">
                {finalSubmission.totalScore.toFixed(1)} / 10.0 Điểm
              </h2>

              <p className="text-sm sm:text-base font-bold">
                {interactionMode === 'individual' ? (
                  <>Chúc mừng em <strong>{finalSubmission.groupName}</strong> (Lớp {finalSubmission.className})!</>
                ) : (
                  <>Chúc mừng <strong>{finalSubmission.groupName}</strong> (Lớp {finalSubmission.className})!</>
                )}
              </p>

              <p className="text-xs text-slate-600 mt-2">
                Đã trả lời đúng <strong>{finalSubmission.correctCount} / {finalSubmission.totalQuestions} câu</strong> trong thời gian <strong>{formatTime(finalSubmission.timeSpentSeconds)}</strong>
              </p>
            </div>

            {/* Detailed Answers Review */}
            <div className="text-left space-y-3">
              <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Xem lại kết quả & giải thích chi tiết từng câu:</span>
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {exam.questions.map((q, idx) => {
                  const studentAns = answers[q.id];
                  const isCorrect = studentAns === q.correctAnswer;
                  const letterStudent = studentAns !== undefined ? ['A', 'B', 'C', 'D'][studentAns] : 'Chưa chọn';
                  const letterCorrect = ['A', 'B', 'C', 'D'][q.correctAnswer];

                  return (
                    <div 
                      key={q.id || idx}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                        isCorrect 
                          ? 'bg-emerald-50/70 border-emerald-200' 
                          : 'bg-rose-50/70 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          Câu {idx + 1}: {q.question}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {isCorrect ? 'ĐÚNG ✓' : 'CHƯA ĐÚNG ✗'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-[11px] font-semibold">
                        <span>Đã chọn: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{letterStudent}</strong></span>
                        <span>Đáp án đúng: <strong className="text-blue-700">{letterCorrect}</strong></span>
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-100">
                          💡 <strong>Giải thích:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setCurrentQIndex(0);
                  setSecondsRemaining(totalSeconds);
                  setFinalSubmission(null);
                  setStep('pick_group');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm Lại Bài Tương Tác</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
              >
                Hoàn Tất & Đóng
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
