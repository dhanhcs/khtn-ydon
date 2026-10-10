import { CheckCircle2, XCircle, Clock, Award, X, HelpCircle } from 'lucide-react';
import { Exam, StudentSubmission, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../types';

interface ExamReviewModalProps {
  submission: StudentSubmission;
  exam: Exam;
  onClose: () => void;
}

export function ExamReviewModal({
  submission,
  exam,
  onClose
}: ExamReviewModalProps) {
  // Use the questions specifically experienced and shuffled for this student attempt if available
  const questionsSource = submission.shuffledQuestions && submission.shuffledQuestions.length > 0
    ? submission.shuffledQuestions
    : exam.questions;

  const mcqQuestions = questionsSource.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[];
  const tfQuestion = questionsSource.find(q => q.type === 'true_false') as TrueFalseQuestion | undefined;
  const saQuestion = questionsSource.find(q => q.type === 'short_answer') as ShortAnswerQuestion | undefined;

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div id="review-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div id="review-modal-container" className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                Kết quả bài làm
              </span>
              <span className="text-xs text-slate-300">
                {submission.studentName} - Lớp {submission.className}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {submission.examTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary Banner */}
        <div className="bg-blue-50/80 border-b border-blue-200 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Tổng điểm
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${
                submission.totalScore >= 8 
                  ? 'text-emerald-600' 
                  : submission.totalScore >= 5 
                  ? 'text-blue-600' 
                  : 'text-rose-600'
              }`}>
                {submission.totalScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 10</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                16 Câu Trắc nghiệm
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">
                {submission.mcqScore.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 8.0</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                1 Câu Đúng/Sai (4 ý)
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">
                {submission.tfScore.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 1.0</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Thời gian làm
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                {formatSeconds(submission.timeSpentSeconds)}
              </div>
              <div className="text-[10px] text-slate-400">Nộp lúc: {submission.submittedAt.substring(11)}</div>
            </div>

          </div>
        </div>

        {/* Detailed Review of All 18 Questions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
          
          {/* Part 1: MCQ Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider bg-blue-100/70 px-3 py-1.5 rounded-lg inline-block">
              PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN (CÂU 1 - 16)
            </h3>

            <div className="space-y-4">
              {mcqQuestions.map((q, idx) => {
                const studentChoice = submission.answers.mcq[q.id];
                const isCorrect = studentChoice === q.correctAnswer;

                return (
                  <div key={q.id} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-sm text-slate-900 leading-relaxed">
                        <span className="text-blue-700 font-bold">Câu {idx + 1}:</span> {q.question}
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Đúng (+0.5đ)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs font-bold">
                            <XCircle className="w-4 h-4" /> Sai (0đ)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isStudent = studentChoice === optIdx;
                        const isKey = q.correctAnswer === optIdx;
                        const label = String.fromCharCode(65 + optIdx);

                        let badgeStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isKey) {
                          badgeStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500';
                        } else if (isStudent && !isKey) {
                          badgeStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                        }

                        return (
                          <div key={optIdx} className={`p-2.5 rounded-lg border flex items-start gap-2 ${badgeStyle}`}>
                            <span className="font-bold">{label}.</span>
                            <span>{opt}</span>
                            {isKey && <span className="ml-auto text-[10px] text-emerald-700 font-bold">Đáp án đúng</span>}
                            {isStudent && !isKey && <span className="ml-auto text-[10px] text-rose-700 font-bold">Em chọn</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 border border-slate-100 flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <div><strong>Giải thích:</strong> {q.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part 2: True/False Review */}
          {tfQuestion && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-100/70 px-3 py-1.5 rounded-lg inline-block">
                PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (CÂU 17)
              </h3>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="font-semibold text-sm text-slate-900">
                  <span className="text-indigo-700 font-bold">Câu 17:</span> {tfQuestion.question}
                </div>

                <div className="space-y-2">
                  {tfQuestion.statements.map((st) => {
                    const studentAns = submission.answers.tf[tfQuestion.id]?.[st.subId];
                    const isRight = studentAns === st.isCorrect;

                    return (
                      <div key={st.subId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg text-xs gap-2 border border-slate-200">
                        <div className="flex items-start gap-2">
                          <span className="font-bold uppercase text-indigo-700">{st.subId})</span>
                          <span>{st.text}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            studentAns === true ? 'bg-emerald-100 text-emerald-800' : studentAns === false ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            Em chọn: {studentAns === true ? 'ĐÚNG' : studentAns === false ? 'SAI' : 'Chưa chọn'}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="font-bold text-slate-700">
                            Đáp án: {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                          </span>
                          {isRight ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tfQuestion.explanation && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 border border-slate-100">
                    <strong>Giải thích chi tiết:</strong> {tfQuestion.explanation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Part 3: Short Answer Review */}
          {saQuestion && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-3 py-1.5 rounded-lg inline-block">
                PHẦN III: CÂU TRẢ LỜI NGẮN (CÂU 18)
              </h3>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="font-semibold text-sm text-slate-900">
                  <span className="text-emerald-700 font-bold">Câu 18:</span> {saQuestion.question}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1">Câu trả lời của em:</span>
                    <span className="text-sm font-bold text-slate-800">
                      {submission.answers.sa[saQuestion.id] || '(Bỏ trống)'}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-700 block mb-1">Đáp án chấp nhận:</span>
                    <span className="text-sm font-bold text-emerald-900">
                      {saQuestion.acceptableAnswers.join(' hoặc ')}
                    </span>
                  </div>
                </div>

                {saQuestion.explanation && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 border border-slate-100">
                    <strong>Hướng dẫn giải:</strong> {saQuestion.explanation}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-white p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Đóng bảng xem lại
          </button>
        </div>

      </div>
    </div>
  );
}
