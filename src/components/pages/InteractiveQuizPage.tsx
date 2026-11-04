import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  MousePointerClick,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  PlusCircle,
  Edit,
  Trash2,
  Award,
  BookOpen,
  Lock,
  Unlock,
  Upload,
  Download,
  Paperclip,
  MessageSquare,
  X,
  UserCheck,
  FileText,
  Eye,
} from 'lucide-react';
import { QuizItem, QuizSubmission, FileAttachment } from '../../types';
import * as XLSX from 'xlsx';
import {
  getStoredExams,
  saveExamItem,
  deleteExamItem,
  toggleExamStatus,
  isExamAccessible,
  getStoredQuizSubmissions,
  saveQuizSubmission,
  updateAndGradeQuizSubmission,
  processUploadedFile,
  parseWordExamContent,
} from '../../utils/examStorage';
import { getActiveStudentRoster } from '../../utils/studentRoster';
import { ExamEditorModal } from '../ExamEditorModal';
import { AttachmentList, InteractiveCommentSection } from '../AttachmentAndCommentSection';

export const InteractiveQuizPage: React.FC = () => {
  const { classes, showToast, setActivePage } = useApp();
  const { userProfile, isAdmin, isTeacher, isOfficialStudent, isGuest, loginAdminMaster } = useAuth();
  const canManageQuiz = isAdmin || isTeacher;

  // Exams Bank State
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => getStoredExams());
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(() => {
    const all = getStoredExams();
    return all.length > 0 ? all[0] : null;
  });

  // Submissions State (for Admin Grading & Student History)
  const [submissions, setSubmissions] = useState<QuizSubmission[]>(() =>
    getStoredQuizSubmissions()
  );
  const [activeViewTab, setActiveViewTab] = useState<'exams' | 'admin-grading'>('exams');
  const [expandedCommentQuizId, setExpandedCommentQuizId] = useState<string | null>(null);

  const roster = getActiveStudentRoster();

  // Quiz Taking States
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [showGuestWarningModal, setShowGuestWarningModal] = useState<boolean>(false);

  // Student Taking Info & Answers State
  const [candidateName, setCandidateName] = useState<string>(userProfile?.fullName || '');
  const [candidateClass, setCandidateClass] = useState<string>(
    userProfile?.enrolledClass || classes[0]?.name || 'H8.1'
  );
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, Record<number, string>>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [examSolutionAttachments, setExamSolutionAttachments] = useState<FileAttachment[]>([]);
  const [uploadingSolutionFile, setUploadingSolutionFile] = useState(false);
  const solutionFileInputRef = useRef<HTMLInputElement>(null);

  const [submittedResult, setSubmittedResult] = useState<QuizSubmission | null>(null);

  // Admin Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<QuizSubmission | null>(null);
  const [gradeScoreInput, setGradeScoreInput] = useState('9.0');
  const [gradeFeedbackInput, setGradeFeedbackInput] = useState('');

  // Admin Exam Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<QuizItem | null>(null);
  const [editorInitialMode, setEditorInitialMode] = useState<'manual' | 'ai' | 'word'>('manual');

  // Direct Admin Upload File (Word, PDF, Image) Modal State
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [uploadExamTitle, setUploadExamTitle] = useState('');
  const [uploadExamGrade, setUploadExamGrade] = useState<'Lớp 8' | 'Lớp 9' | 'Chuyên Hóa'>('Lớp 9');
  const [uploadExamClass, setUploadExamClass] = useState('Tất cả các lớp');
  const [uploadExamDuration, setUploadExamDuration] = useState(45);
  const [uploadExamNote, setUploadExamNote] = useState('');
  const [uploadExamAttachments, setUploadExamAttachments] = useState<FileAttachment[]>([]);
  const [uploadingAdminExamFile, setUploadingAdminExamFile] = useState(false);
  const [adminQuickPass, setAdminQuickPass] = useState('');
  const adminExamFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile?.fullName) setCandidateName(userProfile.fullName);
    if (userProfile?.enrolledClass) setCandidateClass(userProfile.enrolledClass);
  }, [userProfile]);

  const refreshExams = () => {
    const stored = getStoredExams();
    setQuizzes(stored);
    if (!activeQuiz && stored.length > 0) {
      setActiveQuiz(stored[0]);
    } else if (activeQuiz) {
      const updatedActive = stored.find((q) => q.id === activeQuiz.id);
      if (updatedActive) setActiveQuiz(updatedActive);
    }
  };

  useEffect(() => {
    refreshExams();
    const refreshSubs = () => setSubmissions(getStoredQuizSubmissions());
    window.addEventListener('ndh-quiz-submissions-updated', refreshSubs);
    return () => window.removeEventListener('ndh-quiz-submissions-updated', refreshSubs);
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isTakingQuiz && !submittedResult && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTakingQuiz, submittedResult, timeLeft]);

  // Start exam with permission check
  const startQuiz = (quiz: QuizItem) => {
    if (!isAdmin) {
      const check = isExamAccessible(quiz);
      if (!check.isOpen) {
        showToast(check.reason || 'Đề thi hiện đang tạm khóa.', 'error');
        return;
      }
    }

    setActiveQuiz(quiz);
    setMcAnswers({});
    setTfAnswers({});
    setFillAnswers({});
    setEssayAnswers({});
    setExamSolutionAttachments([]);
    setSubmittedResult(null);
    setTimeLeft(quiz.durationMinutes * 60);
    setIsTakingQuiz(true);
  };

  const handleSelectOption = (questionId: string | number, optionIndex: number) => {
    setMcAnswers((prev) => ({ ...prev, [String(questionId)]: optionIndex }));
  };

  const handleSelectTrueFalse = (
    questionId: string | number,
    statementLabel: string,
    value: boolean
  ) => {
    setTfAnswers((prev) => ({
      ...prev,
      [String(questionId)]: {
        ...(prev[String(questionId)] || {}),
        [statementLabel]: value,
      },
    }));
  };

  const handleFillBlank = (questionId: string | number, blankIndex: number, value: string) => {
    setFillAnswers((prev) => ({
      ...prev,
      [String(questionId)]: {
        ...(prev[String(questionId)] || {}),
        [blankIndex]: value,
      },
    }));
  };

  // Student attaches Word / Image file for essay or full solution
  const handleSolutionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingSolutionFile(true);
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setExamSolutionAttachments((prev) => [...prev, ...uploaded]);
      showToast(`Đã đính kèm ${uploaded.length} tệp bài giải (Word/Ảnh)!`, 'success');
    } catch {
      showToast('Không thể tải tệp bài giải.', 'error');
    } finally {
      setUploadingSolutionFile(false);
      e.target.value = '';
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let points = 0;

    // 1. Multiple Choice Grading
    (activeQuiz.multipleChoice || []).forEach((q) => {
      const studentAns = mcAnswers[String(q.id)];
      if (studentAns === q.correctOptionIndex) {
        points += q.points || 0.25;
      }
    });

    // 2. True/False Grading
    (activeQuiz.trueFalse || []).forEach((q) => {
      const stAns = tfAnswers[String(q.id)] || {};
      let statementCorrect = 0;
      (q.statements || []).forEach((st) => {
        if (stAns[st.label] === st.isCorrect) {
          statementCorrect += 1;
        }
      });
      if (statementCorrect === 4) points += 1.0;
      else if (statementCorrect === 3) points += 0.5;
      else if (statementCorrect === 2) points += 0.25;
      else if (statementCorrect === 1) points += 0.1;
    });

    // 3. Fill in Blanks Grading
    (activeQuiz.fillInBlank || []).forEach((q) => {
      const blanksAns = fillAnswers[String(q.id)] || {};
      (q.blanks || []).forEach((b) => {
        const studentVal = (blanksAns[b.index] || '').trim().replace(',', '.');
        if (studentVal === b.answer.trim()) {
          points += 0.5;
        }
      });
    });

    const finalScore = Math.min(10, Math.round(points * 100) / 100);
    const finalName = candidateName.trim() || userProfile?.fullName || 'Học sinh NĐH';
    const finalClass = candidateClass || userProfile?.enrolledClass || 'H8.1';

    const submission: QuizSubmission = {
      id: 'qsub-' + Date.now(),
      quizId: activeQuiz.id || 'default',
      quizTitle: activeQuiz.title,
      studentId: userProfile?.uid || 'student',
      studentCode: userProfile?.studentCode || 'NDH-HS',
      studentName: finalName,
      classGroup: finalClass,
      score: finalScore,
      objectiveScore: finalScore,
      maxScore: 10,
      multipleChoiceAnswers: mcAnswers,
      trueFalseAnswers: tfAnswers,
      fillInBlankAnswers: fillAnswers,
      essayAnswers,
      attachments: examSolutionAttachments.length > 0 ? examSolutionAttachments : undefined,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'submitted',
      feedback:
        finalScore >= 8.5
          ? 'Xuất sắc! Nắm rất chắc lý thuyết và kỹ năng tính toán phương trình hóa học.'
          : finalScore >= 6.5
          ? 'Khá tốt! Cần chú ý cân bằng phương trình và kỹ năng bấm máy tính số mol.'
          : 'Cần ôn lại các phản ứng hóa học cơ bản và phương pháp tính nồng độ dung dịch.',
    };

    const nextSubs = saveQuizSubmission(submission);
    setSubmissions(nextSubs);
    setSubmittedResult(submission);
    setIsTakingQuiz(false);
    showToast(
      `Đã nộp bài kiểm tra thành công! Điểm đạt: ${finalScore}/10 (Đã lưu vào Bảng điểm)`,
      'success'
    );
  };

  // ADMIN ACTION: Grade or update student submission
  const handleAdminConfirmGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !gradingSubmission.id) return;
    const numScore = Number(gradeScoreInput.replace(',', '.'));
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > 10) {
      showToast('Vui lòng nhập điểm số từ 0 đến 10.', 'error');
      return;
    }

    const updated = updateAndGradeQuizSubmission(
      gradingSubmission.id,
      numScore,
      gradeFeedbackInput.trim()
    );
    setSubmissions(updated);
    setGradingSubmission(null);
    showToast(
      `Đã chấm bài của HS ${gradingSubmission.studentName}: ${numScore}/10 điểm và đồng bộ lên Bảng điểm!`,
      'success'
    );
  };

  // ADMIN ACTION: Export Quiz Grades to Excel
  const handleExportQuizGrades = () => {
    if (submissions.length === 0) {
      showToast('Chưa có bài nộp nào để tải file điểm.', 'info');
      return;
    }
    const rows = submissions.map((s, idx) => ({
      STT: idx + 1,
      'Mã HS': s.studentCode || 'NDH-HS',
      'Họ và tên học sinh': s.studentName,
      'Lớp': s.classGroup,
      'Đề kiểm tra': s.quizTitle,
      'Điểm số (thang 10)': s.score,
      'Số tệp đính kèm': s.attachments?.length || 0,
      'Trạng thái': s.status === 'graded' ? 'Đã chấm duyệt' : 'Chấm tự động',
      'Thời gian nộp': s.submittedAt,
      'Nhận xét của Thầy': s.feedback || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diem_Kiem_Tra');
    XLSX.writeFile(
      wb,
      `Bang_Diem_Kiem_Tra_NDH_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Đã tải file điểm kiểm tra (.XLSX) thành công!', 'success');
  };

  // ADMIN ACTION: Import Quiz Grades from Excel
  const handleImportQuizGrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        let count = 0;
        rows.forEach((r: any) => {
          const name = String(r['Họ và tên học sinh'] || r['Họ tên'] || '').trim();
          const scoreVal = Number(r['Điểm số (thang 10)'] ?? r['Điểm số'] ?? r['Điểm']);
          if (name && Number.isFinite(scoreVal)) {
            const sub: QuizSubmission = {
              id: 'qsub-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              quizId: activeQuiz?.id || 'quiz-default-1',
              quizTitle: String(r['Đề kiểm tra'] || activeQuiz?.title || 'Đề kiểm tra Hóa học'),
              studentId: 'student',
              studentCode: String(r['Mã HS'] || 'NDH-HS'),
              studentName: name,
              classGroup: String(r['Lớp'] || 'H8.1'),
              score: scoreVal,
              maxScore: 10,
              multipleChoiceAnswers: {},
              trueFalseAnswers: {},
              fillInBlankAnswers: {},
              submittedAt: new Date().toLocaleString('vi-VN'),
              status: 'graded',
              essayGraded: true,
              feedback: String(
                r['Nhận xét của Thầy'] || r['Nhận xét'] || 'Đã cập nhật từ file điểm Giáo viên.'
              ),
            };
            saveQuizSubmission(sub);
            count++;
          }
        });
        setSubmissions(getStoredQuizSubmissions());
        showToast(`Đã up file điểm thành công (${count} học sinh)!`, 'success');
      } catch {
        showToast('Không thể đọc file Excel điểm kiểm tra.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // ADMIN ACTION: Download Exam as Word (.doc)
  const handleDownloadExamWord = (quiz: QuizItem) => {
    let lines: string[] = [
      `ĐỀ KIỂM TRA HÓA HỌC THCS - TÁC GIẢ: THẦY NGUYỄN ĐÌNH HÀNH`,
      `=========================================================`,
      `Tiêu đề: ${quiz.title}`,
      `Khối/Lớp: ${quiz.grade} (${quiz.targetClasses || 'Tất cả các lớp'})`,
      `Thời gian làm bài: ${quiz.durationMinutes} phút`,
      ``,
      `PHẦN I. TRẮC NGHIỆM KHÁCH QUAN`,
    ];
    (quiz.multipleChoice || []).forEach((q, idx) => {
      lines.push(`Câu ${idx + 1}: ${q.question}`);
      q.options.forEach((opt) => lines.push(`   ${opt}`));
      lines.push(
        `   -> Đáp án đúng: ${['A', 'B', 'C', 'D'][q.correctOptionIndex] || 'A'} | Lời giải: ${q.explanation || ''}`
      );
      lines.push('');
    });
    if ((quiz.essay || []).length > 0) {
      lines.push(`PHẦN II. TỰ LUẬN`);
      quiz.essay.forEach((es, idx) => {
        lines.push(`Bài ${idx + 1}: ${es.question}`);
        lines.push(`   Hướng dẫn giải: ${es.solutionGuide || ''}`);
        lines.push('');
      });
    }
    const blob = new Blob([lines.join('\n')], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `De_Thi_${quiz.grade.replace(/\s+/g, '_')}_NDH.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã tải đề thi "${quiz.title}" ra file Word!`, 'success');
  };

  // ADMIN ACTION: Open Create Exam Modal with chosen method
  const handleOpenCreateModal = (mode: 'manual' | 'ai' | 'word' = 'manual') => {
    setEditingExam(null);
    setEditorInitialMode(mode);
    setIsEditorOpen(true);
  };

  // ADMIN ACTION: Open Edit Exam Modal
  const handleOpenEditModal = (quiz: QuizItem) => {
    setEditingExam(quiz);
    setEditorInitialMode('manual');
    setIsEditorOpen(true);
  };

  // ADMIN ACTION: Delete Exam
  const handleDeleteExam = (quizId: string, title: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn đề thi: "${title}"?\nHọc sinh sẽ không thể làm đề thi này nữa.`
      )
    ) {
      const updated = deleteExamItem(quizId);
      setQuizzes(updated);
      if (activeQuiz?.id === quizId) {
        setActiveQuiz(updated.length > 0 ? updated[0] : null);
      }
      showToast(`Đã xóa đề thi: ${title}`, 'info');
    }
  };

  // ADMIN ACTION: Toggle Exam Status (Mở / Đóng thời gian kiểm tra)
  const handleToggleStatus = (quizId: string) => {
    const { updatedExams, newStatus } = toggleExamStatus(quizId);
    setQuizzes(updatedExams);
    if (activeQuiz?.id === quizId) {
      const updated = updatedExams.find((q) => q.id === quizId);
      if (updated) setActiveQuiz(updated);
    }
    showToast(
      newStatus === 'published'
        ? 'Đã MỞ đề thi cho học sinh làm bài!'
        : 'Đã ĐÓNG (tạm khóa) đề thi đối với học sinh.',
      newStatus === 'published' ? 'success' : 'info'
    );
  };

  // Callback when saving from ExamEditorModal
  const handleSaveFromEditor = (savedExam: QuizItem) => {
    const updated = saveExamItem(savedExam);
    setQuizzes(updated);
    setActiveQuiz(savedExam);
    showToast(`Đã lưu đề thi: "${savedExam.title}" thành công!`, 'success');
  };

  // Admin: Select Word / PDF / Image files for direct interactive assignment upload
  const handleAdminExamFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingAdminExamFile(true);
    try {
      const processed: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        processed.push(await processUploadedFile(files[i]));
      }
      setUploadExamAttachments((prev) => [...prev, ...processed]);
      if (!uploadExamTitle.trim() && processed.length > 0) {
        const cleanName = processed[0].name.replace(/\.[^/.]+$/, '');
        setUploadExamTitle(`Bài tập tương tác: ${cleanName}`);
      }
      showToast(`Đã tải lên ${processed.length} tệp (Word / PDF / Ảnh) thành công!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploadingAdminExamFile(false);
      e.target.value = '';
    }
  };

  // Admin: Publish uploaded Word / PDF / Image interactive assignment
  const handlePublishUploadedExamFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageQuiz) {
      const ok = loginAdminMaster(adminQuickPass.trim(), 'admin');
      if (!ok) {
        showToast('Mật khẩu Quản trị viên chưa đúng (Mặc định: Hanh1962@)', 'error');
        return;
      }
    }
    if (uploadExamAttachments.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 file đề bài (Word, PDF hoặc Ảnh)!', 'error');
      return;
    }

    // Try extracting MC questions if any Word file has standard MC structure
    let parsedMc: QuizItem['multipleChoice'] = [];
    for (const att of uploadExamAttachments) {
      if (att.extractedText) {
        const parsed = parseWordExamContent(att.extractedText);
        if (parsed.multipleChoice.length > 0) {
          parsedMc = [...parsedMc, ...parsed.multipleChoice];
        }
      }
    }

    const newQuiz: QuizItem = {
      id: `exam-file-${Date.now()}`,
      title: uploadExamTitle.trim() || `Đề bài tập: ${uploadExamAttachments[0].name}`,
      grade: uploadExamGrade,
      topic: uploadExamNote.trim() || 'Đề bài đính kèm (Word / PDF / Ảnh) - Xem & Làm bài trực tiếp',
      durationMinutes: Number(uploadExamDuration) || 45,
      status: 'published',
      targetClasses: uploadExamClass,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      attachments: uploadExamAttachments,
      multipleChoice: parsedMc,
      trueFalse: [],
      fillInBlank: [],
      essay: [
        {
          id: 1,
          question:
            uploadExamNote.trim() ||
            'Xem trực tiếp đề bài trong tệp đính kèm (Word / PDF / Ảnh) phía trên, trình bày lời giải vào ô bên dưới hoặc đính kèm file bài làm của em để nộp bài.',
          solutionGuide: 'Thầy Nguyễn Đình Hành sẽ chấm điểm trực tiếp trên hệ thống.',
          points: 10,
        },
      ],
      questionsCount: parsedMc.length + 1,
      questions: parsedMc,
    };

    const updated = saveExamItem(newQuiz);
    setQuizzes(updated);
    setActiveQuiz(newQuiz);
    setUploadExamTitle('');
    setUploadExamNote('');
    setUploadExamAttachments([]);
    setShowUploadFileModal(false);
    showToast('Đã đăng tải bài tập (Word/PDF/Ảnh) và hiển thị trực tiếp trên ứng dụng!', 'success');
  };

  // Admin: Quick attach Word / PDF / Image directly onto an existing quiz card
  const handleQuickAttachToQuiz = async (
    quiz: QuizItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      const updatedQuiz: QuizItem = {
        ...quiz,
        attachments: [...(quiz.attachments || []), ...uploaded],
      };
      const updatedList = saveExamItem(updatedQuiz);
      setQuizzes(updatedList);
      if (activeQuiz?.id === quiz.id) setActiveQuiz(updatedQuiz);
      showToast(`Đã đính kèm ${uploaded.length} tệp (Word/PDF/Ảnh) vào đề "${quiz.title}"!`, 'success');
    } catch {
      showToast('Lỗi khi tải tệp lên đề bài.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveQuizAttachment = (quiz: QuizItem, attachmentId: string) => {
    const updatedQuiz: QuizItem = {
      ...quiz,
      attachments: (quiz.attachments || []).filter((a) => a.id !== attachmentId),
    };
    const updatedList = saveExamItem(updatedQuiz);
    setQuizzes(updatedList);
    if (activeQuiz?.id === quiz.id) setActiveQuiz(updatedQuiz);
    showToast('Đã xóa tệp đính kèm khỏi đề bài.', 'info');
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 mb-1">
            <MousePointerClick className="w-3.5 h-3.5" />
            Mục số 2: Ra Đề, Làm Bài Kiểm Tra, Chấm Bài & Tải/Up File Điểm
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Hệ Thống Khảo Thí & Bài Tập Tương Tác Hóa Học NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Quản trị viên: Ra đề (chuẩn cấu trúc, AI, file Word), chấm bài học sinh nộp (kèm file Word/Ảnh), tải file điểm và up file điểm.'
              : 'Học sinh: Làm bài kiểm tra trực tuyến, đính kèm bài giải tự luận (file Word hoặc Ảnh chụp) và bình luận trao đổi.'}
          </p>
        </div>

        {/* Action Buttons: Always show Admin Upload button + Student Start button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUploadFileModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            title="Quản trị viên tải đề bài Word (.doc, .docx), PDF (.pdf) hoặc Ảnh (.jpg, .png) hiển thị trực tiếp trên ứng dụng"
          >
            <Upload className="w-4 h-4" />
            <span>+ Quản trị Up Bài (Word, PDF, Ảnh)</span>
          </button>

          {canManageQuiz ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleOpenCreateModal('manual')}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="Cách 1: Tạo đề theo mẫu chuẩn cấu trúc"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Ra đề chuẩn</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('ai')}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="Cách 2: AI tự tạo đề theo chuyên đề"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Ra đề bằng AI</span>
              </button>

              <button
                onClick={() =>
                  setActiveViewTab(
                    activeViewTab === 'admin-grading' ? 'exams' : 'admin-grading'
                  )
                }
                className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer ${
                  activeViewTab === 'admin-grading'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Chấm bài nộp ({submissions.length})</span>
              </button>

              <button
                onClick={handleExportQuizGrades}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file điểm</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Up file điểm</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportQuizGrades}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            !isTakingQuiz &&
            activeQuiz && (
              <button
                onClick={() => startQuiz(activeQuiz)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Bắt đầu làm bài kiểm tra ngay</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ADMIN GRADING PANEL FOR QUIZ SUBMISSIONS */}
      {isAdmin && activeViewTab === 'admin-grading' && (
        <div className="bg-white rounded-2xl shadow-md border-2 border-indigo-200 overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 py-4 bg-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>QUẢN TRỊ CHẤM BÀI KIỂM TRA & BÀI TỰ LUẬN (FILE WORD / ẢNH)</span>
              </h3>
              <p className="text-xs text-indigo-200">
                Xem kết quả trắc nghiệm tự động, xem bài giải tự luận (Word/Ảnh) học sinh đính kèm, chấm điểm và cập nhật lên Bảng điểm.
              </p>
            </div>
            <button
              onClick={() => setActiveViewTab('exams')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
            >
              ← Quay lại Ngân hàng đề
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Đề kiểm tra</th>
                  <th className="py-3 px-3">Bài tự luận & File đính kèm (Word/Ảnh)</th>
                  <th className="py-3 px-3 text-center">Điểm số</th>
                  <th className="py-3 px-3">Nhận xét</th>
                  <th className="py-3 px-3">Thời gian nộp</th>
                  <th className="py-3 px-4 text-center">Thao tác Chấm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Chưa có bài kiểm tra nào được nộp. Khi học sinh hoàn thành bài thi, kết quả và file bài giải sẽ hiển thị tại đây.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{sub.studentName}</td>
                      <td className="py-3 px-3 font-bold text-cyan-800">{sub.classGroup}</td>
                      <td className="py-3 px-3 font-semibold max-w-xs">{sub.quizTitle}</td>
                      <td className="py-3 px-3 max-w-sm">
                        {sub.essayAnswers && Object.keys(sub.essayAnswers).length > 0 && (
                          <div className="text-[11px] text-slate-700 space-y-1 mb-1">
                            {Object.entries(sub.essayAnswers).map(([k, val], i) => (
                              <div key={k} className="bg-slate-50 p-1.5 rounded border border-slate-200">
                                <strong>Tự luận {i + 1}:</strong> {val}
                              </div>
                            ))}
                          </div>
                        )}
                        {sub.attachments && sub.attachments.length > 0 && (
                          <AttachmentList attachments={sub.attachments} compact />
                        )}
                        {(!sub.essayAnswers || Object.keys(sub.essayAnswers).length === 0) &&
                          (!sub.attachments || sub.attachments.length === 0) && (
                            <span className="text-slate-400 italic">Bài trắc nghiệm</span>
                          )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm">
                          {sub.score} / 10
                        </span>
                      </td>
                      <td className="py-3 px-3 italic text-slate-600 max-w-xs">
                        {sub.feedback || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {sub.submittedAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeScoreInput(String(sub.score));
                            setGradeFeedbackInput(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Chấm / Sửa điểm</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUIZ TAKING VIEW */}
      {isTakingQuiz && activeQuiz && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sticky Countdown Header */}
          <div className="sticky top-14 z-30 bg-slate-900 text-white p-3.5 rounded-xl shadow-lg border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="truncate max-w-md">
              <span className="text-[11px] text-cyan-400 uppercase font-mono block">
                Đang làm bài kiểm tra:
              </span>
              <span className="text-sm font-bold truncate block">{activeQuiz.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-red-600/90 text-white px-3 py-1.5 rounded-lg font-mono font-black text-base shadow">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                Nộp bài kiểm tra
              </button>
            </div>
          </div>

          {/* Candidate Identification Box */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-cyan-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Họ và tên học sinh làm bài <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoComplete="off"
                placeholder="Nhập họ và tên học sinh..."
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                value={candidateClass}
                onChange={(e) => setCandidateClass(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INLINE PREVIEW OF UPLOADED WORD / PDF / IMAGE EXAM FILES WHILE TAKING QUIZ */}
          {activeQuiz.attachments && activeQuiz.attachments.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-xs border-2 border-cyan-300 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-100 pb-2.5">
                <div className="flex items-center gap-2 text-cyan-900 font-black text-sm">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>ĐỀ BÀI ĐÍNH KÈM (WORD / PDF / ẢNH) — XEM TRỰC TIẾP TẠI ỨNG DỤNG:</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  {activeQuiz.attachments.length} tệp đề bài
                </span>
              </div>
              <AttachmentList
                attachments={activeQuiz.attachments}
                showInlinePreview={true}
              />
            </div>
          )}

          {/* PART I: MULTIPLE CHOICE QUESTIONS */}
          {(activeQuiz.multipleChoice || []).length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    PHẦN I. TRẮC NGHIỆM KHÁCH QUAN ({activeQuiz.multipleChoice.length} Câu - 4 Lựa chọn)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thí sinh chọn 01 phương án đúng nhất trong các phương án A, B, C, D cho mỗi câu hỏi.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-sky-100 text-sky-800">
                  {Math.round(activeQuiz.multipleChoice.length * 0.25 * 10) / 10} Điểm
                </span>
              </div>

              <div className="space-y-6">
                {activeQuiz.multipleChoice.map((q, idx) => {
                  const selectedOpt = mcAnswers[String(q.id)];
                  return (
                    <div
                      key={q.id}
                      id={`mc-${q.id}`}
                      className="p-4 rounded-xl border border-slate-200 hover:border-cyan-300 bg-slate-50/40 transition"
                    >
                      <div className="font-bold text-slate-800 text-sm mb-3">
                        <span className="text-cyan-700 mr-1.5">Câu {idx + 1}:</span>
                        {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIndex) => {
                          const isChosen = selectedOpt === optIndex;
                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIndex)}
                              className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 cursor-pointer ${
                                isChosen
                                  ? 'bg-cyan-50 border-cyan-500 font-bold text-cyan-900 shadow-xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                                  isChosen
                                    ? 'border-cyan-600 bg-cyan-600 text-white'
                                    : 'border-slate-300'
                                }`}
                              >
                                {isChosen ? '✓' : ''}
                              </div>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PART II: TRUE / FALSE QUESTIONS */}
          {(activeQuiz.trueFalse || []).length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    PHẦN II. CÂU HỎI ĐÚNG / SAI ({activeQuiz.trueFalse.length} Câu)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mỗi câu có 4 ý a, b, c, d. Thí sinh chọn Đúng hoặc Sai cho từng nhận định.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {activeQuiz.trueFalse.map((tf, idx) => (
                  <div
                    key={tf.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="font-bold text-slate-800 text-sm">
                      <span className="text-purple-700 mr-1.5">Tình huống {idx + 1}:</span>
                      {tf.scenario}
                    </div>

                    <div className="space-y-2 text-xs">
                      {tf.statements.map((st) => {
                        const userVal = tfAnswers[String(tf.id)]?.[st.label];
                        return (
                          <div
                            key={st.label}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200"
                          >
                            <span className="leading-relaxed">
                              <strong className="uppercase mr-1 text-slate-800">
                                {st.label})
                              </strong>
                              {st.text}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(tf.id, st.label, true)}
                                className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                                  userVal === true
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                ĐÚNG
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(tf.id, st.label, false)}
                                className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                                  userVal === false
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                ))}
              </div>
            </div>
          )}

          {/* PART III: ESSAY QUESTIONS & WORD / IMAGE FILE UPLOAD FOR STUDENT */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-5">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  PHẦN III. BÀI LÀM TỰ LUẬN & ĐÍNH KÈM FILE BÀI GIẢI (WORD / ẢNH)
                </h3>
                <p className="text-xs text-slate-500">
                  Học sinh trình bày lời giải trực tiếp hoặc tải lên file Word (.docx) / Ảnh chụp bài giải (.jpg, .png) để Thầy Hành chấm điểm.
                </p>
              </div>

              <button
                type="button"
                onClick={() => solutionFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
                <span>
                  {uploadingSolutionFile
                    ? 'Đang tải tệp...'
                    : 'Đính kèm File Word / Ảnh bài giải'}
                </span>
              </button>
              <input
                ref={solutionFileInputRef}
                type="file"
                multiple
                accept=".doc,.docx,image/*,.pdf"
                onChange={handleSolutionFileUpload}
                className="hidden"
              />
            </div>

            {(activeQuiz.essay || []).length > 0 && (
              <div className="space-y-4">
                {activeQuiz.essay.map((es, idx) => (
                  <div
                    key={es.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="font-bold text-slate-800 text-sm">
                      <span className="text-teal-700 mr-1.5">Bài {idx + 1}:</span>
                      {es.question}
                    </div>
                    <textarea
                      rows={3}
                      value={essayAnswers[String(es.id)] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEssayAnswers((prev) => ({ ...prev, [String(es.id)]: val }));
                      }}
                      placeholder="Ghi lời giải hoặc đáp số của em vào đây (hoặc đính kèm file Word/Ảnh ở trên)..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {examSolutionAttachments.length > 0 && (
              <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200">
                <span className="text-xs font-bold text-cyan-900 block mb-1">
                  Tệp bài làm đính kèm của học sinh ({examSolutionAttachments.length}):
                </span>
                <AttachmentList
                  attachments={examSolutionAttachments}
                  onRemove={(id) =>
                    setExamSolutionAttachments((prev) => prev.filter((a) => a.id !== id))
                  }
                />
              </div>
            )}
          </div>

          {/* Bottom Submit Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setIsTakingQuiz(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Thoát ra danh sách đề
            </button>

            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              Hoàn tất & Nộp bài kiểm tra
            </button>
          </div>
        </div>
      )}

      {/* SUBMITTED RESULT VIEW */}
      {submittedResult && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2 pb-4 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Kết Quả Bài Làm: {submittedResult.quizTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Học sinh: <strong>{submittedResult.studentName}</strong> • Lớp{' '}
              <strong>{submittedResult.classGroup}</strong>
            </p>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800">
              <span className="text-xs font-bold uppercase tracking-wider">Điểm khảo sát:</span>
              <span className="text-3xl font-black text-emerald-600">
                {submittedResult.score} / {submittedResult.maxScore}
              </span>
            </div>

            {submittedResult.feedback && (
              <p className="text-xs text-slate-600 italic max-w-md mx-auto pt-1">
                "{submittedResult.feedback}"
              </p>
            )}

            {submittedResult.attachments && submittedResult.attachments.length > 0 && (
              <div className="max-w-md mx-auto pt-2">
                <AttachmentList attachments={submittedResult.attachments} compact />
              </div>
            )}
          </div>

          {/* Detailed Explanations */}
          {activeQuiz && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                Đáp Án Chi Tiết & Hướng Dẫn Giải Của Thầy Nguyễn Đình Hành
              </h4>

              <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-2">
                {activeQuiz.multipleChoice.map((q, idx) => {
                  const studentAns = mcAnswers[String(q.id)];
                  const isCorrect = studentAns === q.correctOptionIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-start justify-between">
                        <span>
                          Câu {idx + 1}: {q.question}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-rose-200 text-rose-800'
                          }`}
                        >
                          {isCorrect ? 'Đúng' : 'Chưa đúng'}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        Đáp án đúng:{' '}
                        <strong className="text-emerald-700">
                          {q.options[q.correctOptionIndex]}
                        </strong>
                      </div>
                      {q.explanation && (
                        <div className="text-[11px] text-slate-600 mt-1 italic bg-white/70 p-2 rounded border border-slate-200">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSubmittedResult(null);
                setIsTakingQuiz(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quay lại danh sách đề thi</span>
            </button>
            <button
              onClick={() => setActivePage('exam-results')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              Xem Bảng Điểm Chung →
            </button>
          </div>
        </div>
      )}

      {/* QUIZ BANK LIST (Overview when not taking) */}
      {!isTakingQuiz && !submittedResult && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                Ngân Hàng Đề Kiểm Tra & Khảo Sát NĐH
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các đề thi khảo sát định kỳ, bồi dưỡng học sinh giỏi cấp tỉnh, thành phố và luyện thi THPT Chuyên.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowUploadFileModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>+ Up Đề Bài (Word / PDF / Ảnh)</span>
              </button>

              {canManageQuiz && (
                <button
                  onClick={() => handleOpenCreateModal('manual')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Soạn đề thi mới</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const quizId = quiz.id || 'quiz-default';
              const accessCheck = isExamAccessible(quiz);
              const isClosed = !accessCheck.isOpen;
              const isCommentsOpen = expandedCommentQuizId === quizId;

              return (
                <div
                  key={quizId}
                  className={`p-4 sm:p-5 rounded-xl border transition space-y-3 ${
                    isClosed
                      ? 'bg-slate-50/80 border-slate-200 opacity-90'
                      : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                          {quiz.grade}
                        </span>

                        {quiz.status === 'published' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ĐANG MỞ THI
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-600" />
                            ĐÃ ĐÓNG (TẠM KHÓA)
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-slate-500">
                          {quiz.topic}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {quiz.title}
                      </h4>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3 font-medium">
                        <span>Thời gian: {quiz.durationMinutes} phút</span>
                        <span>•</span>
                        <span>
                          {(quiz.multipleChoice || []).length} trắc nghiệm
                          {(quiz.trueFalse || []).length > 0 &&
                            ` + ${quiz.trueFalse.length} đúng/sai`}
                          {(quiz.essay || []).length > 0 && ` + ${quiz.essay.length} tự luận`}
                        </span>
                        {quiz.targetClasses && (
                          <>
                            <span>•</span>
                            <span>Lớp: {quiz.targetClasses}</span>
                          </>
                        )}
                      </div>

                      {!isAdmin && isClosed && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            {accessCheck.reason || 'Đề thi hiện đang tạm đóng bởi Thầy Hành.'}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Actions Area */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
                      {/* Admin Specific Controls */}
                      {canManageQuiz && (
                        <div className="flex flex-wrap items-center gap-1.5 mr-1">
                          <label
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Đính kèm thêm file Word, PDF, Ảnh cho đề này"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>+ Up file (Word/PDF/Ảnh)</span>
                            <input
                              type="file"
                              multiple
                              accept=".doc,.docx,.pdf,image/*"
                              onChange={(e) => handleQuickAttachToQuiz(quiz, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDownloadExamWord(quiz)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Tải đề thi ra file Word (.doc)"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Word</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(quizId)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              quiz.status === 'published'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {quiz.status === 'published' ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-amber-700" />
                                <span>Đóng đề</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Mở đề</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(quiz)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExam(quizId, quiz.title)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-red-600 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xóa</span>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCommentQuizId(isCommentsOpen ? null : quizId)
                        }
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Bình luận</span>
                      </button>

                      {/* Start Test Button */}
                      <button
                        type="button"
                        disabled={!canManageQuiz && isClosed}
                        onClick={() => startQuiz(quiz)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                          !canManageQuiz && isClosed
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{canManageQuiz && isClosed ? 'Xem thử đề (QTV)' : 'Làm bài kiểm tra'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Inline Display of Attached Exam Files (Word, PDF, Image) */}
                  {quiz.attachments && quiz.attachments.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-extrabold text-cyan-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-600" />
                        Đề bài / Tài liệu đính kèm (Word, PDF, Ảnh) — Xem trực tiếp tại app:
                      </span>
                      <AttachmentList
                        attachments={quiz.attachments}
                        showInlinePreview={true}
                        onRemove={
                          canManageQuiz
                            ? (attId) => handleRemoveQuizAttachment(quiz, attId)
                            : undefined
                        }
                      />
                    </div>
                  )}

                  {/* Interactive Comments for this Quiz */}
                  {isCommentsOpen && (
                    <InteractiveCommentSection
                      targetId={`quiz-${quizId}`}
                      title="Thảo luận & Bình luận đề kiểm tra (Hỗ trợ gửi file Word, Ảnh)"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADMIN MODAL: GRADE / EDIT QUIZ SUBMISSION */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Chấm Bài Kiểm Tra: {gradingSubmission.studentName}</span>
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminConfirmGrade} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">
                  Đề thi: {gradingSubmission.quizTitle} ({gradingSubmission.classGroup})
                </div>
                {gradingSubmission.essayAnswers &&
                  Object.keys(gradingSubmission.essayAnswers).length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-600 block">
                        Bài làm tự luận của học sinh:
                      </span>
                      {Object.entries(gradingSubmission.essayAnswers).map(([k, val], i) => (
                        <div
                          key={k}
                          className="p-2 bg-white rounded border border-slate-200 text-slate-800"
                        >
                          <strong>Bài {i + 1}:</strong> {val}
                        </div>
                      ))}
                    </div>
                  )}
                {gradingSubmission.attachments &&
                  gradingSubmission.attachments.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">
                        File bài giải học sinh đính kèm (Word / Ảnh):
                      </span>
                      <AttachmentList attachments={gradingSubmission.attachments} />
                    </div>
                  )}
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Tổng điểm sau khi chấm (Thang 10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gradeScoreInput}
                  onChange={(e) => setGradeScoreInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-black text-base text-rose-600"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Nhận xét của Thầy Nguyễn Đình Hành
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedbackInput}
                  onChange={(e) => setGradeFeedbackInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow cursor-pointer"
                >
                  Lưu Điểm & Công Bố Bảng Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN DIRECT UPLOAD MODAL FOR INTERACTIVE ASSIGNMENT (WORD, PDF, IMAGE) */}
      {showUploadFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Quản Trị Up Bài Tập Tương Tác / Đề Thi (Word, PDF, Ảnh)
                  </h3>
                  <p className="text-xs text-slate-500">
                    File Word (.doc, .docx), PDF (.pdf) và Ảnh (.jpg, .png) sẽ được hiển thị và xem trực tiếp ngay trên ứng dụng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadFileModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishUploadedExamFile} className="space-y-4 text-xs">
              {!canManageQuiz && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                  <label className="block font-extrabold text-amber-900">
                    Xác thực Quản trị viên (Nhập mật khẩu Quản trị để đăng bài ngay):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminQuickPass}
                    onChange={(e) => setAdminQuickPass(e.target.value)}
                    placeholder="Nhập mật khẩu Quản trị (Mặc định: Hanh1962@)"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              )}

              {/* File Picker Box */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-dashed border-emerald-400 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-emerald-950 text-sm block">
                      1. Chọn file đề bài (Word, PDF, Ảnh) từ máy tính / điện thoại <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Hỗ trợ đầy đủ: Word (.docx, .doc), PDF (.pdf), Ảnh chụp (.jpg, .png). Học sinh xem trực tiếp trên app.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminExamFileRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingAdminExamFile ? 'Đang xử lý...' : '+ Chọn File Word / PDF / Ảnh'}</span>
                  </button>
                  <input
                    ref={adminExamFileRef}
                    type="file"
                    multiple
                    accept=".doc,.docx,.pdf,image/*"
                    onChange={handleAdminExamFileSelect}
                    className="hidden"
                  />
                </div>

                {uploadExamAttachments.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-900 block mb-1.5">
                      Xem trước tệp đề bài đã tải lên ({uploadExamAttachments.length} tệp):
                    </span>
                    <AttachmentList
                      attachments={uploadExamAttachments}
                      showInlinePreview={true}
                      onRemove={(id) =>
                        setUploadExamAttachments((prev) => prev.filter((a) => a.id !== id))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên đề bài tập tương tác / đề kiểm tra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadExamTitle}
                    onChange={(e) => setUploadExamTitle(e.target.value)}
                    placeholder="VD: Đề kiểm tra 45 phút Chương 1 - Lớp 9..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={uploadExamGrade}
                    onChange={(e) => setUploadExamGrade(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Lớp 8">Hóa học Lớp 8</option>
                    <option value="Lớp 9">Hóa học Lớp 9</option>
                    <option value="Chuyên Hóa">Bồi dưỡng HSG & Chuyên Hóa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp áp dụng</label>
                  <select
                    value={uploadExamClass}
                    onChange={(e) => setUploadExamClass(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Tất cả các lớp">Tất cả các lớp</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thời gian làm bài (Phút)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={uploadExamDuration}
                    onChange={(e) => setUploadExamDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú / Yêu cầu làm bài cho học sinh
                </label>
                <textarea
                  rows={2}
                  value={uploadExamNote}
                  onChange={(e) => setUploadExamNote(e.target.value)}
                  placeholder="VD: Các em xem trực tiếp đề bài trong file đính kèm bên trên và làm bài..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadFileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Đăng Bài Tập & Hiển Thị Trực Tiếp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN EXAM EDITOR MODAL */}
      <ExamEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        examToEdit={editingExam}
        onSave={handleSaveFromEditor}
        initialMode={editorInitialMode}
      />
    </div>
  );
};
