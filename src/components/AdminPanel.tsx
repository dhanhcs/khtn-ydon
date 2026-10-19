import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Users, 
  CalendarClock, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Search, 
  CheckCircle, 
  XCircle, 
  KeyRound, 
  Lock, 
  Unlock,
  AlertTriangle,
  Edit3,
  Calendar,
  FileCheck2,
  FileUp,
  FileDown,
  Info,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Plus,
  RefreshCw,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Bell,
  Send,
  Clock,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Cloud,
  ExternalLink,
  Archive,
  FileCode,
  ArrowRight,
  Zap,
  FolderArchive
} from 'lucide-react';
import { 
  Exam, 
  ExamQuestion,
  StudentSubmission, 
  StudentRecord, 
  SystemConfig, 
  SubjectType, 
  GradeLevel, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion,
  ExamReminderNotification,
  UserSession
} from '../types';
import { ExamEditModal } from './ExamEditModal';
import { CreateExamModal } from './CreateExamModal';
import { FormulaText } from './FormulaText';
import { schoolClasses } from '../data/mockData';
import { 
  generateNativeDocxExamTemplateBlob, 
  generateExamWordTemplateBlob, 
  generateExamPlainTextTemplate, 
  downloadBlob 
} from '../utils/wordExportUtils';
import { extractTextFromExamFile, parseExamContentText } from '../utils/examFileParser';
import { downloadStudentExcelTemplate, exportStudentsToExcel, parseStudentsExcelFile, checkStudentInSchoolRoster } from '../utils/excelUtils';
import { getExamScheduleStatus, reopenExamWithDuration } from '../utils/examTimeUtils';
import { regradeAllSubmissions, regradeSubmissionWithExam } from '../utils/examRegrader';

interface AdminPanelProps {
  systemConfig: SystemConfig;
  setSystemConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  submissions: StudentSubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<StudentSubmission[]>>;
  students: StudentRecord[];
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>;
  onViewSubmission: (sub: StudentSubmission) => void;
  onOpenSyncRestore?: () => void;
  notifications?: ExamReminderNotification[];
  onSendNotification?: (notif: ExamReminderNotification) => void;
  onDeleteNotification?: (id: string) => void;
  currentUser?: UserSession | null;
  onDeleteExam?: (id: string) => void;
}

export function AdminPanel({
  systemConfig,
  setSystemConfig,
  exams,
  setExams,
  submissions,
  setSubmissions,
  students,
  setStudents,
  onViewSubmission,
  onOpenSyncRestore,
  notifications = [],
  onSendNotification,
  onDeleteNotification,
  currentUser,
  onDeleteExam
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'gradebook' | 'students' | 'schedule' | 'create_exam' | 'notifications' | 'system_settings' | 'publish_app'>('gradebook');

  // Publish App & Netlify Export state
  const [buildStatus, setBuildStatus] = useState<{ hasDist: boolean; fileCount: number; totalSizeMB: number; lastBuilt: string | null } | null>(null);
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [isDownloadingPublishZip, setIsDownloadingPublishZip] = useState<boolean>(false);
  const [isDownloadingSourceZip, setIsDownloadingSourceZip] = useState<boolean>(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filters for Gradebook
  const [filterSubject, setFilterSubject] = useState<SubjectType>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('8A1');
  const [newStudentGrade, setNewStudentGrade] = useState<GradeLevel>(8);
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');

  // Excel Roster state & message
  const [excelImportLoading, setExcelImportLoading] = useState(false);
  const [excelStatusMsg, setExcelStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterGrade, setStudentFilterGrade] = useState<string>('all');
  const [studentFilterClass, setStudentFilterClass] = useState<string>('all');
  const [isSyncingServer, setIsSyncingServer] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Create exam form state
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [newExamGrade, setNewExamGrade] = useState<GradeLevel>(8);
  const [newExamMode, setNewExamMode] = useState<'mode_1' | 'mode_2'>('mode_2');
  const [newExamOpenDate, setNewExamOpenDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newExamOpenTime, setNewExamOpenTime] = useState('08:00:00');

  // Exam Edit Modal state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);

  const handleSaveCreatedExam = (newExam: Exam) => {
    setExams(prev => {
      const exists = prev.some(e => e.id === newExam.id);
      const next = exists ? prev.map(e => e.id === newExam.id ? newExam : e) : [newExam, ...prev];
      next.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      fetch('/api/sync/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: next, replace: true })
      }).catch(console.error);
      return next;
    });

    if (newExam.mode === 'mode_2' && (newExam.openAt || newExam.openTime)) {
      const openStr = newExam.openAt || newExam.openTime || '';
      let examDate = new Date().toISOString().substring(0, 10);
      let examTime = '08:00';
      try {
        const d = new Date(openStr);
        if (!isNaN(d.getTime())) {
          examDate = d.toISOString().substring(0, 10);
          examTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
      } catch {}

      const subName = newExam.subject === 'physics' ? 'Vật lí' : newExam.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
      const notif: ExamReminderNotification = {
        id: `notif-exam-${newExam.id}`,
        title: `Lịch kiểm tra sắp diễn ra: ${newExam.title}`,
        targetClass: `Khối ${newExam.grade}`,
        grade: newExam.grade,
        subject: newExam.subject,
        examDate,
        examTime,
        examTitle: newExam.title,
        durationMinutes: newExam.durationMinutes || 15,
        contentNote: `Giáo viên bộ môn đã cập nhật lịch kiểm tra đề "${newExam.title}". Đề kiểm tra sẽ mở vào lúc ${examTime} ngày ${examDate}. Các em chú ý ôn tập và đăng nhập đúng giờ để làm bài.`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên bộ môn KHTN'
      };
      if (onSendNotification) {
        onSendNotification(notif);
      }
    }

    setShowCreateExamModal(false);
  };

  // Notification form state inside AdminPanel (Lưu trữ các thông báo trong tài khoản quản trị)
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifTargetClass, setNewNotifTargetClass] = useState('all');
  const [newNotifSubject, setNewNotifSubject] = useState<SubjectType>('physics');
  const [newNotifDate, setNewNotifDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [newNotifTime, setNewNotifTime] = useState('08:00');
  const [newNotifDuration, setNewNotifDuration] = useState(15);
  const [newNotifNote, setNewNotifNote] = useState('');
  const [notifFormMsg, setNotifFormMsg] = useState<string>('');

  // Tính năng Cấp lại mật khẩu cho các thành viên (Người phụ trách: Admin Nguyễn Đình Hành)
  const [resetMemberName, setResetMemberName] = useState<string>('');
  const [resetMemberNewPw, setResetMemberNewPw] = useState<string>('123456');
  const [resetPwSuccessMsg, setResetPwSuccessMsg] = useState<string>('');

  const handleResetMemberPassword = (targetMemberName: string, newPw: string = '123456') => {
    const cleanName = targetMemberName.trim();
    if (!cleanName) {
      alert('Vui lòng chọn hoặc nhập tên thành viên cần cấp lại mật khẩu.');
      return;
    }
    try {
      const customPws = JSON.parse(localStorage.getItem('ydon_custom_passwords') || '{}');
      customPws[cleanName.toLowerCase()] = newPw.trim() || '123456';
      localStorage.setItem('ydon_custom_passwords', JSON.stringify(customPws));

      // Cập nhật trạng thái yêu cầu nếu có
      const reqs = JSON.parse(localStorage.getItem('ydon_password_reset_requests') || '[]');
      const updatedReqs = reqs.filter((r: any) => r.memberName?.toLowerCase() !== cleanName.toLowerCase());
      localStorage.setItem('ydon_password_reset_requests', JSON.stringify(updatedReqs));
    } catch {}

    setResetPwSuccessMsg(`✅ Admin Nguyễn Đình Hành đã cấp lại mật khẩu cho thành viên "${cleanName}" thành công! Mật khẩu mới: ${newPw.trim() || '123456'}`);
  };

  // Lấy trạng thái bản build dist phục vụ xuất bản Netlify
  const checkBuildStatus = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/build-status');
      if (res.ok) {
        const data = await res.json();
        setBuildStatus(data);
      }
    } catch (err) {
      console.warn('Cannot fetch build status:', err);
    }
  }, []);

  React.useEffect(() => {
    if (adminTab === 'publish_app') {
      checkBuildStatus();
    }
  }, [adminTab, checkBuildStatus]);

  // Biên dịch lại bản web mới nhất
  const handleRebuildDist = async () => {
    try {
      setIsRebuilding(true);
      setPublishStatusMsg({ type: 'info', text: 'Đang tiến hành biên dịch (Vite build) toàn bộ ứng dụng sang thư mục dist... Vui lòng đợi trong giây lát!' });
      const res = await fetch('/api/admin/rebuild-dist', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Biên dịch thất bại');
      }
      setPublishStatusMsg({ type: 'success', text: '✅ Đã biên dịch ứng dụng thành công 100%! Bạn có thể tải ngay tệp ZIP bên dưới để đưa lên Netlify.' });
      await checkBuildStatus();
    } catch (err: any) {
      setPublishStatusMsg({ type: 'error', text: '❌ Lỗi khi biên dịch: ' + err.message });
    } finally {
      setIsRebuilding(false);
    }
  };

  // Tải tệp ZIP xuất bản Netlify (Gói dist hoàn chỉnh)
  const handleDownloadPublishZip = () => {
    try {
      setIsDownloadingPublishZip(true);
      setPublishStatusMsg({ type: 'info', text: 'Đang tải tệp ZIP xuất bản Netlify (khtn-thcs-thpt-ydon-netlify-publish.zip)...' });
      
      const link = document.createElement('a');
      link.href = '/khtn-thcs-thpt-ydon-netlify-publish.zip';
      link.download = 'khtn-thcs-thpt-ydon-netlify-publish.zip';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        setIsDownloadingPublishZip(false);
      }, 250);

      setPublishStatusMsg({
        type: 'success',
        text: '✅ Đã tải tệp ZIP xuất bản Netlify thành công! Hãy mở trang app.netlify.com/drop và kéo thả tệp này vào để website hoạt động ngay.'
      });
      checkBuildStatus();
    } catch {
      window.location.href = '/khtn-thcs-thpt-ydon-netlify-publish.zip';
      setIsDownloadingPublishZip(false);
    }
  };

  // Tải tệp ZIP mã nguồn dự án đầy đủ
  const handleDownloadSourceZip = () => {
    try {
      setIsDownloadingSourceZip(true);
      setPublishStatusMsg({ type: 'info', text: 'Đang tải thư mục mã nguồn của app về máy (.zip)...' });
      
      const link = document.createElement('a');
      link.href = '/ma-nguon-app-khtn-thcs-thpt-ydon.zip';
      link.download = 'ma-nguon-app-khtn-thcs-thpt-ydon.zip';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        setIsDownloadingSourceZip(false);
      }, 250);

      setPublishStatusMsg({
        type: 'success',
        text: '✅ Đã bắt đầu tải thư mục mã nguồn dạng tệp ZIP (ma-nguon-app-khtn-thcs-thpt-ydon.zip) về máy tính thành công! Thầy/Cô hãy kiểm tra thư mục tải xuống (Downloads).'
      });
    } catch {
      window.location.href = '/ma-nguon-app-khtn-thcs-thpt-ydon.zip';
      setIsDownloadingSourceZip(false);
    }
  };

  const handleAdminCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifNote.trim() || !newNotifDate) {
      setNotifFormMsg('Vui lòng điền đầy đủ tiêu đề, ngày kiểm tra và nội dung dặn dò.');
      return;
    }

    const newNotif: ExamReminderNotification = {
      id: `notif-${Date.now()}`,
      title: newNotifTitle.trim(),
      targetClass: newNotifTargetClass,
      subject: newNotifSubject,
      examDate: newNotifDate,
      examTime: newNotifTime,
      durationMinutes: newNotifDuration,
      contentNote: newNotifNote.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên Quản trị KHTN'
    };

    if (onSendNotification) {
      onSendNotification(newNotif);
    }
    setNewNotifTitle('');
    setNewNotifNote('');
    setNotifFormMsg('Đã đăng và lưu thông báo lịch kiểm tra thành công vào tài khoản quản trị!');
    setTimeout(() => setNotifFormMsg(''), 3000);
  };

  // State cho nạp file đề Word và tải file mẫu trực tiếp trong tab Admin
  const [panelSelectedSubject, setPanelSelectedSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [panelUploadedQuestions, setPanelUploadedQuestions] = useState<ExamQuestion[]>([]);
  const [panelUploadedFileText, setPanelUploadedFileText] = useState<string>('');
  const [panelUploadError, setPanelUploadError] = useState<string | null>(null);
  const [panelUploadSuccessInfo, setPanelUploadSuccessInfo] = useState<string | null>(null);
  const [panelIsUploading, setPanelIsUploading] = useState<boolean>(false);
  const [panelIsCopied, setPanelIsCopied] = useState<boolean>(false);
  const [panelShowDirectEditor, setPanelShowDirectEditor] = useState<boolean>(false);
  const [panelCreateMode, setPanelCreateMode] = useState<'upload' | 'quick_form'>('upload');

  const handlePanelDownloadDocx = async (sub: SubjectType = panelSelectedSubject) => {
    try {
      const blob = await generateNativeDocxExamTemplateBlob(sub);
      const subSlug = sub === 'physics' ? 'Vat_Li' : sub === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
      downloadBlob(blob, `Mau_De_Kiem_Tra_KHTN_Y_Don_${subSlug}.docx`);
    } catch {
      handlePanelDownloadDoc(sub);
    }
  };

  const handlePanelDownloadDoc = (sub: SubjectType = panelSelectedSubject) => {
    const blob = generateExamWordTemplateBlob(sub);
    const subSlug = sub === 'physics' ? 'Vat_Li' : sub === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
    downloadBlob(blob, `Mau_De_Kiem_Tra_KHTN_Y_Don_${subSlug}.doc`);
  };

  const handlePanelDownloadTxt = (sub: SubjectType = panelSelectedSubject) => {
    const text = generateExamPlainTextTemplate(sub);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const subSlug = sub === 'physics' ? 'Vat_Li' : sub === 'chemistry' ? 'Hoa_Hoc' : 'Sinh_Hoc';
    downloadBlob(blob, `Mau_De_Kiem_Tra_KHTN_Y_Don_${subSlug}.txt`);
  };

  const handlePanelCopyTemplate = async (sub: SubjectType = panelSelectedSubject) => {
    try {
      const text = generateExamPlainTextTemplate(sub);
      await navigator.clipboard.writeText(text);
      setPanelIsCopied(true);
      setTimeout(() => setPanelIsCopied(false), 2500);
    } catch {
      alert('Không thể tự động sao chép. Thầy/Cô vui lòng tải file mẫu để xem nội dung.');
    }
  };

  const handlePanelParseText = (rawContent: string) => {
    setPanelUploadError(null);
    setPanelUploadSuccessInfo(null);
    try {
      if (!rawContent || rawContent.trim().length < 20) {
        throw new Error('Văn bản quá ngắn hoặc tệp rỗng. Vui lòng kiểm tra lại file Word.');
      }
      const res = parseExamContentText(rawContent);
      if (res.title) setNewExamTitle(res.title);
      if (res.grade) setNewExamGrade(res.grade);
      if (res.subject) {
        setNewExamSubject(res.subject);
        setPanelSelectedSubject(res.subject);
      }
      setPanelUploadedQuestions(res.questions);
      setPanelUploadSuccessInfo(
        `Đã nhận diện thành công ${res.summary.total} câu hỏi (${res.summary.mcqCount} trắc nghiệm 4 lựa chọn, ${res.summary.tfCount} đúng/sai, ${res.summary.saCount} điền số)! ${res.summary.isStandardGDPT2018 ? '⭐ Chuẩn ma trận 100% GDPT 2018.' : ''}`
      );
    } catch (err: any) {
      setPanelUploadError(err.message || 'Lỗi phân tích nội dung file Word.');
    }
  };

  const handlePanelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanelIsUploading(true);
    setPanelUploadError(null);
    setPanelUploadSuccessInfo(null);
    try {
      const text = await extractTextFromExamFile(file);
      setPanelUploadedFileText(text);
      handlePanelParseText(text);
    } catch (err: any) {
      setPanelUploadError('Lỗi đọc tệp đề thi: ' + (err.message || 'Vui lòng kiểm tra lại.'));
    } finally {
      setPanelIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveUploadedExamToSystem = () => {
    if (panelUploadedQuestions.length === 0) {
      alert('Chưa có câu hỏi nào được nạp từ file Word!');
      return;
    }
    const subName = newExamSubject === 'physics' ? 'Vật lí' : newExamSubject === 'chemistry' ? 'Hóa học' : 'Sinh học';
    const finalTitle = newExamTitle.trim() || `Đề kiểm tra thường xuyên - ${subName} ${newExamGrade}`;
    const openAt = newExamMode === 'mode_2' ? `${newExamOpenDate}T${newExamOpenTime || '08:00:00'}` : undefined;

    const newExam: Exam = {
      id: `exam-${newExamSubject}-${newExamGrade}-${Date.now()}`,
      title: finalTitle,
      subject: newExamSubject,
      grade: newExamGrade,
      testNumber: `TX${Math.min(exams.filter(e => e.grade === newExamGrade).length + 1, 10)}`,
      durationMinutes: 15,
      totalPoints: 10.0,
      mode: newExamMode,
      openAt,
      openTime: openAt,
      isActive: true,
      questions: panelUploadedQuestions,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setExams(prev => {
      const next = [newExam, ...prev];
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      fetch('/api/sync/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: next, replace: true })
      }).catch(console.error);
      return next;
    });

    setPanelUploadedQuestions([]);
    setPanelUploadedFileText('');
    setPanelUploadSuccessInfo(null);
    setNewExamTitle('');
    alert(`Đã lưu và đưa đề kiểm tra "${finalTitle}" vào hệ thống thành công!`);
    setAdminTab('schedule');
  };

  // In-app Confirmation Modal State (Reliable inside iframes without window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Sắp xếp các đề kiểm tra theo thứ tự Đề mới tạo gần nhất hiển thị đầu tiên (từ mới nhất đến cũ nhất)
  // Sắp xếp các đề kiểm tra theo thứ tự Đề mới tạo gần nhất hiển thị đầu tiên (từ mới nhất đến cũ nhất)
  const sortedExams = React.useMemo(() => {
    const valid = exams.filter(e => e && e.id);
    return valid.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [exams]);

  // Quản trị viên bấm nút "Chấm điểm lại" cho đề kiểm tra thường xuyên
  const handleRegradeExam = async (targetExam: Exam) => {
    // Tìm toàn bộ bài nộp của đề này
    const relatedSubmissions = submissions.filter(s => 
      s.examId === targetExam.id || 
      (s.examTitle && s.examTitle.trim().toLowerCase() === targetExam.title.trim().toLowerCase())
    );

    if (relatedSubmissions.length === 0) {
      alert(`Chưa có học sinh nào nộp bài cho đề "${targetExam.title}". Không có bài nộp nào cần chấm lại.`);
      return;
    }

    let changedCount = 0;
    const newSubmissions = submissions.map(sub => {
      const isTarget = sub.examId === targetExam.id || 
        (sub.examTitle && sub.examTitle.trim().toLowerCase() === targetExam.title.trim().toLowerCase());
      if (isTarget) {
        const { updatedSubmission, changed } = regradeSubmissionWithExam(sub, targetExam);
        if (changed) changedCount++;
        return updatedSubmission;
      }
      return sub;
    });

    setSubmissions(newSubmissions);
    localStorage.setItem('ydon_submissions', JSON.stringify(newSubmissions));

    // Đồng bộ lên server
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: newSubmissions })
      });
    } catch (err) {
      console.error('Lỗi đồng bộ submissions:', err);
    }

    alert(`✅ ĐÃ CHẤM ĐIỂM LẠI THÀNH CÔNG!\n\nĐã chấm lại toàn bộ ${relatedSubmissions.length} bài làm của học sinh cho đề "${targetExam.title}".\nSố bài có điểm thay đổi: ${changedCount}.\nToàn bộ điểm trắc nghiệm, đúng/sai, điền ngắn của từng học sinh đã được cập nhật mới nhất vào hệ thống!`);
  };

  // Giáo viên mở lại đề thi khi cần thiết (gia hạn thêm phút làm bài)
  const handleReopenExam = (id: string, additionalMinutes: number = 15) => {
    const target = exams.find(e => e.id === id);
    if (!target) return;
    const reopened = reopenExamWithDuration(target, additionalMinutes);
    handleSaveExam(reopened);
    alert(`Đã mở lại đề kiểm tra "${reopened.title}" thêm ${additionalMinutes} phút thành công!`);
  };

  const handleSaveExam = (updatedExam: Exam) => {
    setExams(prev => {
      const exists = prev.some(ex => ex.id === updatedExam.id);
      const next = exists ? prev.map(ex => ex.id === updatedExam.id ? updatedExam : ex) : [updatedExam, ...prev];
      next.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      fetch('/api/sync/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: next, replace: true })
      }).catch(console.error);

      // Chấm lại toàn bộ bài nộp học sinh theo đáp án đã chỉnh sửa và cập nhật điểm
      setSubmissions(prevSubs => {
        const { updatedSubmissions, changedCount } = regradeAllSubmissions(prevSubs, next);
        if (changedCount > 0) {
          localStorage.setItem('ydon_submissions', JSON.stringify(updatedSubmissions));
          fetch('/api/sync/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissions: updatedSubmissions, overwrite: true })
          }).catch(console.error);
        }
        return updatedSubmissions;
      });

      return next;
    });

    // Tự động phát thông báo lịch kiểm tra khi giáo viên cập nhật đề sắp diễn ra kiểm tra
    if (updatedExam.mode === 'mode_2' && (updatedExam.openAt || updatedExam.openTime)) {
      const openStr = updatedExam.openAt || updatedExam.openTime || '';
      let examDate = new Date().toISOString().substring(0, 10);
      let examTime = '08:00';
      try {
        const d = new Date(openStr);
        if (!isNaN(d.getTime())) {
          examDate = d.toISOString().substring(0, 10);
          examTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
      } catch {}

      const subName = updatedExam.subject === 'physics' ? 'Vật lí' : updatedExam.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
      const notif: ExamReminderNotification = {
        id: `notif-exam-${updatedExam.id}`,
        title: `Lịch kiểm tra sắp diễn ra: ${updatedExam.title}`,
        targetClass: `Khối ${updatedExam.grade}`,
        grade: updatedExam.grade,
        subject: updatedExam.subject,
        examDate,
        examTime,
        examTitle: updatedExam.title,
        durationMinutes: updatedExam.durationMinutes || 15,
        contentNote: `Giáo viên bộ môn đã cập nhật lịch kiểm tra đề "${updatedExam.title}". Đề kiểm tra sẽ mở vào lúc ${examTime} ngày ${examDate}. Các em chú ý ôn tập và đăng nhập đúng giờ để làm bài.`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên bộ môn KHTN'
      };
      if (onSendNotification) {
        onSendNotification(notif);
      }
    }

    setEditingExam(null);
  };

  const handleDeleteExam = (id: string) => {
    const target = exams.find(e => e.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Đề Kiểm Tra',
      message: `Bạn có chắc chắn muốn xóa đề kiểm tra "${target?.title || ''}" không? Sau khi xóa, học sinh sẽ không thấy đề này nữa.`,
      confirmText: 'Xóa Đề Thi',
      cancelText: 'Hủy',
      isDanger: true,
      onConfirm: () => {
        // 1. Lưu lại ID đề đã xóa vào ydon_deleted_exam_ids để ngăn tái xuất hiện hoàn toàn
        try {
          const deletedIds: string[] = JSON.parse(localStorage.getItem('ydon_deleted_exam_ids') || '[]');
          if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('ydon_deleted_exam_ids', JSON.stringify(deletedIds));
          }
        } catch {}

        // 2. Xóa hẳn phần tử ra khỏi mảng state và đồng bộ ngay vào localStorage
        setExams(prev => {
          const next = prev.filter(e => e.id !== id);
          localStorage.setItem('ydon_exams', JSON.stringify(next));
          fetch('/api/sync/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exams: next, replace: true })
          }).catch(console.error);
          return next;
        });

        if (onDeleteExam) {
          onDeleteExam(id);
        }

        if (onDeleteNotification) {
          onDeleteNotification(`notif-exam-${id}`);
        }

        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Available classes dynamically extracted from school roster & submissions
  const availableClasses = React.useMemo(() => {
    const set = new Set<string>(schoolClasses);
    students.forEach(s => s.className && set.add(s.className));
    submissions.forEach(s => s.className && set.add(s.className));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students, submissions]);

  // Submissions strictly referencing official student roster
  // HS không thuộc DS HS trong trường thì không hiển thị trong bảng điểm chính thức KTTX
  const rosterReferencedSubmissions = React.useMemo(() => {
    return submissions.filter(sub => {
      const check = checkStudentInSchoolRoster(sub.studentName, sub.className, students);
      return check.isEnrolled;
    });
  }, [submissions, students]);

  // Filter submissions
  const filteredSubmissions = rosterReferencedSubmissions.filter(sub => {
    if (filterSubject !== 'all' && sub.subject !== filterSubject) return false;
    if (filterGrade !== 'all' && sub.grade.toString() !== filterGrade) return false;
    if (filterClass !== 'all' && sub.className !== filterClass) return false;
    if (searchTerm.trim() && !sub.studentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate stats
  const totalScores = filteredSubmissions.map(s => s.totalScore);
  const avgScore = totalScores.length > 0 
    ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2) 
    : '0';
  const goodCount = totalScores.filter(s => s >= 8).length;
  const fairCount = totalScores.filter(s => s >= 6.5 && s < 8).length;
  const passCount = totalScores.filter(s => s >= 5.0 && s < 6.5).length;
  const failCount = totalScores.filter(s => s < 5.0).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên', 'Lớp', 'Khối', 'Phân môn', 'Đề thi', 'Điểm TN (8.0)', 'Điểm Đ/S (1.0)', 'Điểm TLN (1.0)', 'Tổng điểm (10)', 'Thời gian (giây)', 'Ngày giờ nộp'];
    const rows = filteredSubmissions.map((s, idx) => [
      idx + 1,
      `"${s.studentName}"`,
      s.className,
      s.grade,
      s.subject === 'physics' ? 'Vật lí' : s.subject === 'chemistry' ? 'Hóa học' : 'Sinh học',
      `"${s.examTitle}"`,
      s.mcqScore.toFixed(1),
      s.tfScore.toFixed(2),
      s.saScore.toFixed(1),
      s.totalScore.toFixed(1),
      s.timeSpentSeconds,
      s.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_diem_KTTX_YDon_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add new student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const newSt: StudentRecord = {
      id: 'HS' + (students.length + 1).toString().padStart(2, '0'),
      name: newStudentName.trim(),
      className: newStudentClass,
      grade: newStudentGrade,
      gender: newStudentGender
    };
    setStudents(prev => {
      const updated = [...prev, newSt];
      localStorage.setItem('ydon_students', JSON.stringify(updated));
      fetch('/api/sync/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updated, replace: true })
      }).catch(console.error);
      return updated;
    });
    setNewStudentName('');
    setExcelStatusMsg({ type: 'success', text: `Đã thêm học sinh ${newSt.name} (${newSt.className}) vào danh sách và đồng bộ máy chủ!` });
  };

  // Đẩy danh sách học sinh từ máy tính hiện tại lên máy chủ để đồng bộ điện thoại
  const handleSyncPushToServer = async () => {
    setIsSyncingServer(true);
    try {
      const res = await fetch('/api/sync/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, replace: true })
      });
      const data = await res.json();
      if (res.ok) {
        setExcelStatusMsg({
          type: 'success',
          text: `ĐÃ ĐỒNG BỘ THÀNH CÔNG: ${students.length} học sinh trường THCS & THPT Y Đôn đã được lưu lên Máy chủ! Mọi điện thoại (iPhone, Android) khi mở app sẽ nhận danh sách này ngay lập tức.`
        });
      } else {
        throw new Error(data.error || 'Lỗi lưu máy chủ');
      }
    } catch (err: any) {
      setExcelStatusMsg({
        type: 'error',
        text: 'Lỗi khi đồng bộ lên máy chủ: ' + (err.message || 'Kiểm tra kết nối mạng')
      });
    } finally {
      setIsSyncingServer(false);
    }
  };

  // Kéo danh sách học sinh từ máy chủ về thiết bị này
  const handleSyncPullFromServer = async () => {
    setIsSyncingServer(true);
    try {
      const res = await fetch('/api/sync/students');
      const data = await res.json();
      if (res.ok && Array.isArray(data.students)) {
        if (data.students.length === 0) {
          setExcelStatusMsg({
            type: 'info',
            text: 'Máy chủ hiện chưa có danh sách học sinh nào. Thầy/Cô hãy nhấp "Đẩy DS hiện tại lên Máy chủ" hoặc tải lên file Excel.'
          });
        } else {
          setStudents(data.students);
          localStorage.setItem('ydon_students', JSON.stringify(data.students));
          setExcelStatusMsg({
            type: 'success',
            text: `ĐÃ ĐỒNG BỘ THÀNH CÔNG: Đã tải ${data.students.length} học sinh từ máy chủ về thiết bị này!`
          });
        }
      }
    } catch (err: any) {
      setExcelStatusMsg({
        type: 'error',
        text: 'Lỗi kéo dữ liệu từ máy chủ: ' + (err.message || 'Không thể kết nối')
      });
    } finally {
      setIsSyncingServer(false);
    }
  };

  // Excel Roster Actions
  const handleDownloadTemplate = () => {
    try {
      downloadStudentExcelTemplate(students);
      setExcelStatusMsg({ type: 'info', text: 'Đã tải xuống biểu mẫu Excel danh sách học sinh THCS Y Đôn thành công.' });
    } catch (err: any) {
      setExcelStatusMsg({ type: 'error', text: 'Không thể tạo file mẫu: ' + (err?.message || 'Lỗi không xác định') });
    }
  };

  const handleExportStudents = () => {
    try {
      exportStudentsToExcel(students, systemConfig.schoolName || 'THCS Y Đôn');
      setExcelStatusMsg({ type: 'success', text: `Đã xuất danh sách ${students.length} học sinh ra file Excel.` });
    } catch (err: any) {
      setExcelStatusMsg({ type: 'error', text: 'Lỗi xuất Excel: ' + (err?.message || 'Lỗi không xác định') });
    }
  };

  const handleUploadExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelImportLoading(true);
    setExcelStatusMsg(null);

    try {
      const result = await parseStudentsExcelFile(file);
      if (result.students.length === 0) {
        setExcelStatusMsg({ type: 'error', text: 'Không tìm thấy dữ liệu học sinh hợp lệ trong tệp Excel. Vui lòng sử dụng file mẫu chuẩn của hệ thống.' });
      } else {
        // TẢI FILE EXCEL LÊN: Thay thế toàn bộ danh sách cũ bằng danh sách mới tải lên
        // Xóa tất cả học sinh không thuộc danh sách tải lên, đồng thời xóa các kết quả trong bảng điểm KTTX không thuộc danh sách
        const newRoster = result.students;
        setStudents(newRoster);
        localStorage.setItem('ydon_students', JSON.stringify(newRoster));

        // Tự động làm sạch bảng điểm KTTX: chỉ giữ lại bài thi của HS có trong danh sách tải lên
        let removedSubmissionsCount = 0;
        let finalSubs: StudentSubmission[] = [];
        setSubmissions(prevSubs => {
          const validSubs = prevSubs.filter(sub => {
            const check = checkStudentInSchoolRoster(sub.studentName, sub.className, newRoster);
            return check.isEnrolled;
          });
          removedSubmissionsCount = prevSubs.length - validSubs.length;
          finalSubs = validSubs;
          localStorage.setItem('ydon_submissions', JSON.stringify(validSubs));
          return validSubs;
        });

        // Đồng bộ tức thì lên Máy chủ trung tâm (Server Sync) để máy tính và điện thoại có cùng dữ liệu
        fetch('/api/sync/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: newRoster, replace: true })
        }).catch(console.error);

        fetch('/api/sync/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissions: finalSubs })
        }).catch(console.error);

        setExcelStatusMsg({
          type: 'success',
          text: `Đã nhập và đồng bộ thành công ${newRoster.length} học sinh từ file Excel lên Máy chủ Y Đôn! Dữ liệu đã sẵn sàng hiển thị trên mọi thiết bị (máy tính, điện thoại Android, iOS). Loại bỏ ${removedSubmissionsCount} bài nộp ngoài danh sách.`
        });
      }
    } catch (err: any) {
      setExcelStatusMsg({
        type: 'error',
        text: 'Lỗi đọc tệp Excel: ' + (err?.message || 'Vui lòng kiểm tra định dạng tệp .xlsx / .xls')
      });
    } finally {
      setExcelImportLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete single student & clean up student's submissions (Reliable in-app confirmation modal)
  const handleDeleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Học Sinh Khỏi Danh Sách',
      message: `Bạn có chắc muốn xóa học sinh "${target.name} - Lớp ${target.className}" (Mã: ${target.id}) khỏi hệ thống? Mọi kết quả bài làm của học sinh này trong bảng điểm KTTX cũng sẽ được tự động xóa theo quy chế tham chiếu.`,
      confirmText: 'Xác Nhận Xóa',
      cancelText: 'Hủy Bỏ',
      isDanger: true,
      onConfirm: () => {
        const updatedStudents = students.filter(s => s.id !== id);
        setStudents(updatedStudents);
        localStorage.setItem('ydon_students', JSON.stringify(updatedStudents));
        fetch('/api/sync/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: updatedStudents, replace: true })
        }).catch(console.error);

        // Xóa bài nộp tương ứng của học sinh này khỏi bảng điểm
        setSubmissions(prevSubs => {
          const nextSubs = prevSubs.filter(sub => {
            const check = checkStudentInSchoolRoster(sub.studentName, sub.className, updatedStudents);
            return check.isEnrolled;
          });
          localStorage.setItem('ydon_submissions', JSON.stringify(nextSubs));
          return nextSubs;
        });

        setExcelStatusMsg({
          type: 'info',
          text: `Đã xóa học sinh ${target.name} (${target.className}) và cập nhật lại bảng điểm KTTX tham chiếu chính xác.`
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Xóa tất cả học sinh ngoài danh sách tham chiếu (Làm sạch danh sách HS và Bảng điểm theo danh sách chuẩn)
  const handleCleanNonRosterSubmissions = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Lọc & Làm Sạch Bảng Điểm KTTX',
      message: `Hệ thống sẽ rà soát và loại bỏ toàn bộ các bản ghi trong bảng điểm KTTX của những học sinh KHÔNG thuộc danh sách ${students.length} học sinh hiện tại. Tiếp tục?`,
      confirmText: 'Làm Sạch Bảng Điểm',
      cancelText: 'Hủy',
      isDanger: false,
      onConfirm: () => {
        let removed = 0;
        setSubmissions(prevSubs => {
          const validSubs = prevSubs.filter(sub => {
            const check = checkStudentInSchoolRoster(sub.studentName, sub.className, students);
            return check.isEnrolled;
          });
          removed = prevSubs.length - validSubs.length;
          localStorage.setItem('ydon_submissions', JSON.stringify(validSubs));
          return validSubs;
        });
        setExcelStatusMsg({
          type: 'success',
          text: `Đã hoàn tất kiểm tra! Đã loại bỏ ${removed} kết quả bài nộp của học sinh không thuộc danh sách.`
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Xóa toàn bộ danh sách học sinh để tải lại danh sách mới hoàn toàn
  const handleClearAllStudents = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Toàn Bộ Danh Sách Học Sinh',
      message: `CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ ${students.length} học sinh hiện tại khỏi hệ thống? Thao tác này sẽ xóa sạch danh sách học sinh và làm sạch bảng điểm KTTX để Thầy/Cô sẵn sàng tải danh sách mới lên từ đầu.`,
      confirmText: 'Xác Nhận Xóa Hết',
      cancelText: 'Hủy Bỏ',
      isDanger: true,
      onConfirm: () => {
        setStudents([]);
        localStorage.setItem('ydon_students', JSON.stringify([]));
        fetch('/api/sync/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: [], replace: true })
        }).catch(console.error);
        setSubmissions([]);
        localStorage.setItem('ydon_submissions', JSON.stringify([]));
        fetch('/api/sync/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissions: [] })
        }).catch(console.error);
        setExcelStatusMsg({
          type: 'info',
          text: 'Đã xóa toàn bộ danh sách học sinh và làm sạch bảng điểm. Hãy nhấp "Tải Lên File Excel" để nhập danh sách mới.'
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Làm sạch danh sách: Xóa tất cả học sinh không phải trường THCS & THPT Y Đôn (không tự bịa học sinh)
  const handleCleanNonYDonStudents = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Làm Sạch Danh Sách Học Sinh',
      message: `Hệ thống sẽ rà soát và loại bỏ tất cả các học sinh tự bịa cũ (không phải học sinh chính thức trường THCS & THPT Y Đôn) để đảm bảo dữ liệu trung thực 100%. Tiếp tục?`,
      confirmText: 'Làm Sạch Dữ Liệu',
      cancelText: 'Hủy Bỏ',
      isDanger: true,
      onConfirm: () => {
        const cleaned = students.filter(s => s && s.id && s.name && s.name.trim().length > 0);
        setStudents(cleaned);
        localStorage.setItem('ydon_students', JSON.stringify(cleaned));
        fetch('/api/sync/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: cleaned, replace: true })
        }).catch(console.error);
        setExcelStatusMsg({
          type: 'success',
          text: `Đã làm sạch danh sách học sinh trường THCS & THPT Y Đôn (${cleaned.length} học sinh chính thức)!`
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Delete submission
  const handleDeleteSubmission = (id: string) => {
    const targetSub = submissions.find(s => s.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Kết Quả Bài Làm',
      message: `Bạn có chắc muốn xóa kết quả bài làm của học sinh "${targetSub?.studentName || ''} - Lớp ${targetSub?.className || ''}"?`,
      confirmText: 'Xóa Bài Nộp',
      cancelText: 'Hủy',
      isDanger: true,
      onConfirm: () => {
        setSubmissions(prev => {
          const next = prev.filter(s => s.id !== id);
          localStorage.setItem('ydon_submissions', JSON.stringify(next));
          return next;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Toggle Exam Active State
  const toggleExamActive = (id: string) => {
    setExams(prev => prev.map(ex => ex.id === id ? { ...ex, isActive: !ex.isActive } : ex));
  };

  // Switch Exam Mode
  const toggleExamMode = (id: string) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === id) {
        const nextMode = ex.mode === 'mode_1' ? 'mode_2' : 'mode_1';
        return {
          ...ex,
          mode: nextMode,
          openAt: nextMode === 'mode_2' ? (ex.openAt || new Date(Date.now() + 3600000).toISOString().slice(0, 19)) : undefined,
          openTime: nextMode === 'mode_2' ? (ex.openAt || new Date(Date.now() + 3600000).toISOString().slice(0, 19)) : undefined,
          password: undefined
        };
      }
      return ex;
    }));
  };

  // Create Exam with standard 18 questions generated from template
  const handleCreateStandardExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    // Generate 16 standard MCQs
    const mcqs: MultipleChoiceQuestion[] = Array.from({ length: 16 }).map((_, i) => ({
      id: `gen_q${i + 1}`,
      type: 'multiple_choice',
      question: `[${newExamSubject === 'physics' ? 'Vật lí' : newExamSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'} ${newExamGrade}] Câu hỏi kiến thức trọng tâm số ${i + 1} chuẩn bị cho bài kiểm tra thường xuyên:`,
      options: [
        `Lựa chọn A (Đáp án đúng - chính xác theo chương trình SGK)`,
        `Lựa chọn B (Phương án nhiễu 1)`,
        `Lựa chọn C (Phương án nhiễu 2)`,
        `Lựa chọn D (Phương án nhiễu 3)`
      ],
      correctAnswer: 0,
      explanation: `Lời giải thích chi tiết cho câu số ${i + 1}.`
    }));

    // Generate 1 True/False with 4 statements
    const tfQ: TrueFalseQuestion = {
      id: `gen_q17`,
      type: 'true_false',
      question: `Cho tình huống thực nghiệm khoa học tự nhiên thực tế liên quan đến ${newExamSubject === 'physics' ? 'Vật lí' : newExamSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'}. Xác định tính đúng/sai của các phát biểu:`,
      statements: [
        { subId: 'a', text: 'Nhận định a: Hiện tượng phù hợp với quy luật tự nhiên.', isCorrect: true },
        { subId: 'b', text: 'Nhận định b: Kết quả đo đạc chính xác theo lý thuyết.', isCorrect: true },
        { subId: 'c', text: 'Nhận định c: Nhận xét này đi ngược với định luật bảo toàn.', isCorrect: false },
        { subId: 'd', text: 'Nhận định d: Điều này không thể xảy ra trong điều kiện tiêu chuẩn.', isCorrect: false }
      ],
      explanation: 'Giải thích chi tiết cho 4 ý a, b, c, d của câu hỏi Đúng/Sai.'
    };

    // Generate 1 Short Answer Question (1 câu, 2 chỗ điền số, mức vận dụng thấp, 1.0 điểm)
    const saQ: ShortAnswerQuestion = {
      id: `gen_q18`,
      type: 'short_answer',
      question: `Một bài toán tính toán vận dụng thấp môn ${newExamSubject === 'physics' ? 'Vật lí' : newExamSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'}: Hãy tính toán các thông số thực nghiệm và điền 2 kết quả số vào 2 chỗ trống bên dưới (mỗi chỗ điền số đúng được 0.5 điểm):`,
      acceptableAnswers: ['10', '20'],
      blanks: [
        { id: '1', label: 'Chỗ điền (1)', acceptableAnswers: ['10', '10.0', '10,0'], points: 0.5 },
        { id: '2', label: 'Chỗ điền (2)', acceptableAnswers: ['20', '20.0', '20,0'], points: 0.5 }
      ],
      explanation: 'Áp dụng công thức chuẩn: Chỗ điền 1 = 10 (0.5 điểm); Chỗ điền 2 = 20 (0.5 điểm).'
    };

    const openAt = newExamMode === 'mode_2' ? `${newExamOpenDate}T${newExamOpenTime || '08:00:00'}` : undefined;

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: newExamTitle.trim(),
      subject: newExamSubject,
      grade: newExamGrade,
      testNumber: `TX${Math.min(exams.filter(e => e.grade === newExamGrade).length + 1, 10)}`,
      durationMinutes: 15,
      totalPoints: 10.0,
      mode: newExamMode,
      openAt,
      openTime: openAt,
      isActive: true,
      questions: [...mcqs, tfQ, saQ],
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setExams(prev => {
      const next = [newExam, ...prev];
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      fetch('/api/sync/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: next, replace: true })
      }).catch(console.error);
      return next;
    });
    setNewExamTitle('');
    setExcelStatusMsg({ type: 'success', text: 'Đã tạo thành công bộ đề kiểm tra chuẩn ma trận 18 câu!' });
    setAdminTab('schedule');
  };

  return (
    <div id="admin-panel-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Title & Nav Tabs */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Bảng Quản Trị Hệ Thống
            </span>
            <span className="text-xs text-slate-400">Tổ Lí-Hóa-Sinh-CN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Quản Lý Học Tập & Kiểm Tra Trực Tuyến
          </h2>
        </div>

        {/* NÚT TẢI MÃ NGUỒN VÀ XUẤT BẢN APP NGAY ĐẦU TRANG QUẢN TRỊ */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/ma-nguon-app-khtn-thcs-thpt-ydon.zip"
            download="ma-nguon-app-khtn-thcs-thpt-ydon.zip"
            onClick={() => {
              setPublishStatusMsg({ type: 'success', text: '✅ Đang tải thư mục mã nguồn của app về máy (ma-nguon-app-khtn-thcs-thpt-ydon.zip)...' });
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ring-2 ring-indigo-300/60"
            title="Bấm để tải ngay toàn bộ mã nguồn của app (.zip) về máy tính"
          >
            <Download className="w-4 h-4 text-white" />
            <span>TẢI MÃ NGUỒN CỦA APP (.ZIP)</span>
          </a>

          <a
            href="/khtn-thcs-thpt-ydon-netlify-publish.zip"
            download="khtn-thcs-thpt-ydon-netlify-publish.zip"
            onClick={() => {
              setPublishStatusMsg({ type: 'success', text: '✅ Đang tải gói xuất bản Netlify Drop (.zip)...' });
            }}
            className="px-3.5 py-2.5 bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Link tải trực tiếp gói biên dịch Netlify Drop"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải gói Netlify Drop (.zip)</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setAdminTab('publish_app');
              handleDownloadSourceZip();
            }}
            className={`px-3.5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              adminTab === 'publish_app'
                ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-300'
            }`}
            title="Xem chi tiết mục xuất bản app và tải ngay mã nguồn về máy"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mục Xuất Bản App (Tải Mã Nguồn)</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl w-full">
          <button
            id="tab-gradebook-btn"
            onClick={() => setAdminTab('gradebook')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'gradebook' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Bảng điểm KTTX</span>
          </button>

          <button
            id="tab-students-btn"
            onClick={() => setAdminTab('students')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'students' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Danh sách HS</span>
          </button>

          <button
            id="tab-schedule-btn"
            onClick={() => setAdminTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'schedule' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
            <span>Lịch mở đề</span>
          </button>

          <button
            id="tab-notifications-btn"
            onClick={() => setAdminTab('notifications')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'notifications' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-rose-600" />
            <span>Thông báo giáo viên</span>
            {notifications && notifications.length > 0 && (
              <span className="bg-rose-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            id="tab-create-exam-btn"
            onClick={() => setAdminTab('create_exam')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'create_exam' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tạo đề 18 câu</span>
          </button>

          <button
            id="tab-settings-btn"
            onClick={() => setAdminTab('system_settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'system_settings' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-700" />
            <span>Cài đặt hệ thống</span>
          </button>

          <button
            id="tab-publish-app-btn"
            onClick={() => {
              setAdminTab('publish_app');
              handleDownloadSourceZip();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'publish_app'
                ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-xs font-black ring-2 ring-indigo-300'
                : 'text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 font-extrabold'
            }`}
            title="Bấm vào mục này để tải ngay mã nguồn của app về máy dạng đuôi zip và xem hướng dẫn xuất bản Netlify"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            <span>Xuất bản app (Tải mã nguồn)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
              adminTab === 'publish_app' ? 'bg-white text-indigo-900' : 'bg-indigo-600 text-white'
            }`}>
              .ZIP
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: BẢNG ĐIỂM KTTX */}
      {adminTab === 'gradebook' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Lượt nộp bài</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{filteredSubmissions.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Điểm trung bình</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{avgScore}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Giỏi (≥ 8.0)</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{goodCount}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Khá (6.5 - 7.9)</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{fairCount}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Dưới TB (&lt; 5.0)</span>
              <div className="text-2xl font-black text-rose-600 mt-1">{failCount}</div>
            </div>
          </div>

          {/* Filter Bar & Export */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value as SubjectType)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none"
              >
                <option value="all">Tất cả phân môn</option>
                <option value="physics">Vật lí</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
              </select>

              {/* Grade Filter */}
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none"
              >
                <option value="all">Tất cả các khối</option>
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
              </select>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none"
              >
                <option value="all">Tất cả các lớp</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>Lớp {c}</option>
                ))}
              </select>

              {/* Search by Name */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-44 sm:w-56"
                />
              </div>

            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCleanNonRosterSubmissions}
                title="Làm sạch bảng điểm: Xóa các kết quả nộp bài của học sinh không có tên trong danh sách trường"
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Lọc Bỏ Điểm Ngoài DS</span>
              </button>

              {onOpenSyncRestore && (
                <button
                  onClick={onOpenSyncRestore}
                  title="Tải lên bảng điểm từ file Excel, JSON hoặc dán trực tiếp để hệ thống cập nhật kết quả"
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 rounded-lg text-xs font-extrabold shadow-xs cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-950" />
                  <span>Up Bảng Điểm Lên</span>
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Lớp</th>
                  <th className="py-3.5 px-4">Phân môn</th>
                  <th className="py-3.5 px-4">Bộ đề</th>
                  <th className="py-3.5 px-3 text-center">TN (8.0đ)</th>
                  <th className="py-3.5 px-3 text-center">Đ/S (1.0đ)</th>
                  <th className="py-3.5 px-3 text-center">TLN (1.0đ)</th>
                  <th className="py-3.5 px-3 text-center">Tổng điểm</th>
                  <th className="py-3.5 px-4 text-center">Thời gian</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      Chưa có kết quả bài nộp nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, index) => {
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{sub.studentName}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-800">
                            {sub.className}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            sub.subject === 'physics' 
                              ? 'bg-blue-100 text-blue-800' 
                              : sub.subject === 'chemistry' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sub.subject === 'physics' ? 'Vật lí' : sub.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={sub.examTitle}>
                          {sub.examTitle}
                        </td>
                        <td className="py-3 px-3 text-center font-medium">{sub.mcqScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-medium">{sub.tfScore.toFixed(2)}</td>
                        <td className="py-3 px-3 text-center font-medium">{sub.saScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-black text-sm ${
                            sub.totalScore >= 8 
                              ? 'text-emerald-600' 
                              : sub.totalScore >= 5 
                              ? 'text-blue-600' 
                              : 'text-rose-600'
                          }`}>
                            {sub.totalScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {Math.floor(sub.timeSpentSeconds / 60)}p {sub.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewSubmission(sub)}
                              title="Xem chi tiết bài làm"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              title="Xóa bài thi"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH HỌC SINH & NGUỒN DỮ LIỆU THAM CHIẾU TOÀN HỆ THỐNG */}
      {adminTab === 'students' && (
        <div className="space-y-6">
          {/* Banner Giới thiệu Nguồn tham chiếu hệ thống */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Nguồn Dữ Liệu Tham Chiếu Gốc
                </span>
                <span className="text-xs text-blue-200">Trường THCS Y Đôn</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Danh Sách Học Sinh & Quyền Tương Tác Hệ Thống
              </h3>
              <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
                Tất cả học sinh có tên trong danh sách này là học sinh chính thức của trường. Người dùng không thuộc danh sách sẽ được hệ thống xếp vào vai trò <strong>Khách (chỉ xem, không làm bài, không nộp bài, không bình luận)</strong>.
              </p>
            </div>

            {/* Quick Action Buttons: Download Template, Upload Excel, Export Excel */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Tải biểu mẫu Excel chuẩn do hệ thống tạo sẵn"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Tải Mẫu File Excel</span>
              </button>

              <label 
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Tải lên tệp Excel danh sách học sinh để nhập vào hệ thống"
              >
                <FileUp className="w-4 h-4" />
                <span>{excelImportLoading ? 'Đang đọc Excel...' : 'Tải Lên File Excel'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleUploadExcelFile}
                  disabled={excelImportLoading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleExportStudents}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Xuất toàn bộ danh sách học sinh ra file Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Xuất File Excel</span>
              </button>
            </div>
          </div>

          {/* BANNER ĐỒNG BỘ ĐA THIẾT BỊ MÁY TÍNH ⇄ ĐIỆN THOẠI */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-5 h-5 ${isSyncingServer ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    🟢 ĐỒNG BỘ MÁY CHỦ (CLOUD SYNC)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Máy tính (PC/Laptop) ⇄ Điện thoại (iOS / Android)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Đồng Bộ Danh Sách Học Sinh Giữa Máy Tính Và Điện Thoại
                </h4>
                <p className="text-xs text-slate-600 max-w-xl">
                  Thầy/Cô đã dùng quyền Admin tải danh sách học sinh trên máy tính, hệ thống tự động lưu lên máy chủ. Khi mở ứng dụng trên điện thoại, danh sách học sinh sẽ tự động hiển thị đầy đủ!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSyncPushToServer}
                disabled={isSyncingServer}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Đẩy toàn bộ danh sách học sinh hiện tại lên Máy chủ chung"
              >
                <Laptop className="w-4 h-4" />
                <span>Đẩy Lên Máy Chủ</span>
              </button>

              <button
                type="button"
                onClick={handleSyncPullFromServer}
                disabled={isSyncingServer}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Kéo danh sách học sinh mới nhất từ Máy chủ về thiết bị này"
              >
                <Smartphone className="w-4 h-4" />
                <span>Kéo Về Thiết Bị Này</span>
              </button>
            </div>
          </div>

          {/* Status Alert for Excel Operations */}
          {excelStatusMsg && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border ${
              excelStatusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : excelStatusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {excelStatusMsg.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                {excelStatusMsg.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {excelStatusMsg.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
                <span>{excelStatusMsg.text}</span>
              </div>
              <button 
                onClick={() => setExcelStatusMsg(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Thêm học sinh đơn lẻ */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Thêm Học Sinh Thủ Công
              </h3>

              <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên học sinh:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Khối:</label>
                    <select
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                    >
                      <option value={6}>Khối 6</option>
                      <option value={7}>Khối 7</option>
                      <option value={8}>Khối 8</option>
                      <option value={9}>Khối 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lớp:</label>
                    <input
                      type="text"
                      required
                      placeholder="8A1, 8A2, 9A1..."
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính:</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={newStudentGender === 'Nam'}
                        onChange={() => setNewStudentGender('Nam')}
                      />
                      <span>Nam</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={newStudentGender === 'Nữ'}
                        onChange={() => setNewStudentGender('Nữ')}
                      />
                      <span>Nữ</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Lưu học sinh vào danh sách
                </button>
              </form>

              {/* Hướng dẫn nhập Excel */}
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  Mẫu Excel chuẩn hệ thống
                </div>
                <p>
                  1. Nhấp <strong>"Tải Mẫu File Excel"</strong> để nhận file mẫu định dạng .xlsx có sẵn các cột chuẩn.
                </p>
                <p>
                  2. Điền danh sách học sinh theo các cột: <em>STT, Mã học sinh, Họ và tên, Lớp, Khối, Giới tính, Ngày sinh</em>.
                </p>
                <p>
                  3. Nhấp <strong>"Tải Lên File Excel"</strong> để đồng bộ toàn bộ học sinh làm nguồn tham chiếu cho cả hệ thống.
                </p>
              </div>
            </div>

            {/* Bảng danh sách học sinh */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              
              {/* Header with Search and Filter */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Danh Sách Học Sinh Toàn Trường</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-black px-2 py-0.5 rounded-full">
                      {students.length} em
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nguồn tham chiếu định danh học sinh chính thức
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleClearAllStudents}
                    disabled={students.length === 0}
                    title="Xóa toàn bộ danh sách hiện tại để chuẩn bị tải danh sách mới"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa Toàn Bộ DS</span>
                  </button>

                  <button
                    onClick={handleCleanNonYDonStudents}
                    title="Loại bỏ tất cả học sinh bịa đặt (chỉ giữ học sinh chính thức trường THCS và THPT Y Đôn)"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Làm Sạch Dữ Liệu HS</span>
                  </button>

                  {/* Filter grade */}
                  <select
                    value={studentFilterGrade}
                    onChange={(e) => setStudentFilterGrade(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-slate-50"
                  >
                    <option value="all">Tất cả khối</option>
                    <option value="6">Khối 6</option>
                    <option value="7">Khối 7</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                  </select>

                  {/* Filter class: 6A, 6A1, 6A2, 6A3, 7A, 7A1, 7A2, 7A3, 8A, 8A1, 8A2, 8A3, 9A, 9A1, 9A2, 9A3 */}
                  <select
                    value={studentFilterClass}
                    onChange={(e) => setStudentFilterClass(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="all">Tất cả lớp ({availableClasses.length})</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </select>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên / mã / lớp..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[520px] flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Khối</th>
                      <th className="py-2.5 px-3">Giới tính</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Cấp lại MK</th>
                      <th className="py-2.5 px-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const displayedStudents = students.filter(st => {
                        if (studentFilterGrade !== 'all' && st.grade.toString() !== studentFilterGrade) return false;
                        if (studentFilterClass !== 'all' && st.className !== studentFilterClass) return false;
                        if (studentSearchTerm.trim()) {
                          const term = studentSearchTerm.toLowerCase();
                          return st.name.toLowerCase().includes(term) || 
                                 st.className.toLowerCase().includes(term) ||
                                 st.id.toLowerCase().includes(term);
                        }
                        return true;
                      });

                      if (displayedStudents.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="w-8 h-8 text-slate-300" />
                                <p className="font-bold text-slate-600 text-sm">
                                  {students.length === 0 
                                    ? 'Danh sách học sinh đang trống' 
                                    : 'Không tìm thấy học sinh phù hợp'}
                                </p>
                                <p className="text-[11px] text-slate-500 max-w-sm">
                                  {students.length === 0
                                    ? 'Thầy/Cô hãy nhấp "Tải Lên File Excel" để tải danh sách học sinh của trường, hoặc nhấp "Khôi Phục Mẫu" để sử dụng danh sách mẫu trường Y Đôn.'
                                    : 'Vui lòng thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc khối lớp.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return displayedStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">{st.id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>
                          <td className="py-2.5 px-3 font-semibold text-blue-700">{st.className}</td>
                          <td className="py-2.5 px-3">Khối {st.grade}</td>
                          <td className="py-2.5 px-3">{st.gender}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Chính thức
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleResetMemberPassword(st.name, '123456')}
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              title={`Cấp lại mật khẩu mặc định (123456) cho ${st.name} - Phụ trách: Admin Nguyễn Đình Hành`}
                            >
                              Cấp lại MK
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleDeleteStudent(st.id)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title={`Xóa học sinh ${st.name} (${st.className})`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* KHU VỰC CẤP LẠI MẬT KHẨU CHO CÁC THÀNH VIÊN - NGƯỜI PHỤ TRÁCH: ADMIN NGUYỄN ĐÌNH HÀNH */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    QUẢN LÝ TÀI KHOẢN & BẢO MẬT
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    Cấp Lại Mật Khẩu Cho Các Thành Viên — Người phụ trách: Admin Nguyễn Đình Hành
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-300">
                Phụ trách chính: <strong>Admin Nguyễn Đình Hành</strong>
              </span>
            </div>

            {resetPwSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between">
                <span>{resetPwSuccessMsg}</span>
                <button
                  type="button"
                  onClick={() => setResetPwSuccessMsg('')}
                  className="text-emerald-700 hover:text-emerald-900 font-black px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-end">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn hoặc nhập tên Thành viên (GV / Học sinh):
                </label>
                <input
                  type="text"
                  list="member-reset-list"
                  value={resetMemberName}
                  onChange={(e) => setResetMemberName(e.target.value)}
                  placeholder="Nhập họ tên HS hoặc tên tài khoản GV..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
                <datalist id="member-reset-list">
                  <option value="Thầy Nguyễn Đình Hành" />
                  <option value="Thầy Phạm Ngọc Tiến" />
                  <option value="Cô Nguyễn Thị Cẩm Lệ" />
                  <option value="Cô Đặng Thị Xuân Sang" />
                  <option value="TT Trần Thị Phượng" />
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.className}</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu cấp lại mới:
                </label>
                <input
                  type="text"
                  value={resetMemberNewPw}
                  onChange={(e) => setResetMemberNewPw(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleResetMemberPassword(resetMemberName, resetMemberNewPw)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cấp Lại Mật Khẩu Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CÀI ĐẶT LỊCH MỞ ĐỀ (CHẾ ĐỘ 1: MỌI LÚC / CHẾ ĐỘ 2: ẤN ĐỊNH NGÀY MỞ) */}
      {adminTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-800 text-sm">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              Quy Chế Quản Lý Lịch Mở Đề Kiểm Tra (2 Chế Độ Mở)
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong>Chế độ 1: Mọi lúc</strong> — Học sinh làm bài lúc nào cũng được (tự do ôn luyện, kiểm tra thường xuyên mọi lúc).
              </li>
              <li>
                <strong>Chế độ 2: Ấn định ngày mở</strong> — Quản trị tự đặt ngày, tháng, năm, giờ, phút, giây bắt đầu làm bài. Học sinh chỉ được vào làm bài khi đến đúng hoặc sau thời điểm đã ấn định.
              </li>
              <li className="text-emerald-700 font-semibold">
                ✓ Hệ thống không sử dụng mật khẩu mở đề nhằm giúp học sinh vào thi thuận tiện, nhanh chóng và chính xác.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Danh sách đề kiểm tra ({exams.length} đề thi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Toàn bộ các đề từ Đề 1 đến Đề 8 và các đề mở rộng đều có thể sửa nội dung & thời gian mở
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePanelDownloadDocx('physics')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                title="Tải File Đề Mẫu Chuẩn Ma trận GDPT 2018 (18 câu: 16 trắc nghiệm + 1 đúng/sai + 1 điền số)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📥 Tải File Đề Mẫu (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateExamModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tạo Đề Kiểm Tra Mới</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedExams.map((ex) => {
              const openStr = ex.openAt || ex.openTime;
              let scheduleLabel = 'Mở mọi lúc';
              let isFuture = false;
              if (ex.mode === 'mode_2' && openStr) {
                try {
                  const d = new Date(openStr);
                  if (!isNaN(d.getTime())) {
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    const ss = String(d.getSeconds()).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    scheduleLabel = `${hh}:${min}:${ss} ngày ${dd}/${mm}/${yyyy}`;
                    isFuture = d.getTime() > Date.now();
                  }
                } catch {}
              }

              return (
                <div 
                  key={ex.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          ex.subject === 'physics' 
                            ? 'bg-blue-100 text-blue-800' 
                            : ex.subject === 'chemistry' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ex.subject === 'physics' ? 'Vật lí' : ex.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} - Lớp {ex.grade}
                        </span>
                        {ex.testNumber && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {ex.testNumber.startsWith('TX') ? ex.testNumber.replace('TX', 'Đề ') : ex.testNumber}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleExamActive(ex.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          ex.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ex.isActive ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{ex.isActive ? 'Đang mở' : 'Đã đóng'}</span>
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {ex.title}
                    </h4>

                    <div className="text-xs text-slate-500">
                      Thời lượng: <strong>{ex.durationMinutes} phút</strong> | Ma trận: <strong>{ex.questions?.length || 18} câu</strong>
                    </div>
                  </div>

                  {/* Mode Display & Controls */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {(() => {
                      const schedStatus = getExamScheduleStatus(ex);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600">Trạng thái:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              schedStatus.status === 'open'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : schedStatus.status === 'expired'
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {schedStatus.badgeLabel}
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                            schedStatus.status === 'expired'
                              ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                              : schedStatus.status === 'open'
                              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                              : 'bg-blue-50/80 border-blue-200 text-blue-900'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Mở đề:</span>
                              <span className="font-mono font-bold">{schedStatus.openTimeFormatted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Đóng đề:</span>
                              <span className="font-mono font-bold">{schedStatus.closeTimeFormatted}</span>
                            </div>

                            {schedStatus.status === 'expired' && (
                              <div className="pt-1.5 border-t border-rose-200 flex items-center justify-between">
                                <span className="font-bold text-[10px] text-rose-700">Đã hết giờ thi (HS không thể vào)</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleReopenExam(ex.id, 15)}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer shadow-2xs"
                                    title="Mở lại đề kiểm tra thêm 15 phút"
                                  >
                                    +15p
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReopenExam(ex.id, 30)}
                                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] cursor-pointer shadow-2xs"
                                    title="Mở lại đề kiểm tra thêm 30 phút"
                                  >
                                    +30p
                                  </button>
                                </div>
                              </div>
                            )}

                            {schedStatus.status === 'open' && (
                              <div className="pt-1 text-[10px] text-emerald-700 font-bold">
                                ✓ Đang mở thi (còn khoảng {schedStatus.remainingMinutes} phút)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action buttons: Nút Chấm điểm lại, Chỉnh sửa đề & Xóa đề */}
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleRegradeExam(ex)}
                        className="flex-1 min-w-[110px] py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform cursor-pointer"
                        title="Chấm lại toàn bộ bài làm của học sinh theo đáp án mới nhất của đề này"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Chấm điểm lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingExam(ex)}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin đề và đáp án"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa đề</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(ex.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-300 transition-colors cursor-pointer"
                        title="Xóa đề kiểm tra này khỏi hệ thống"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Xóa đề</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TẠO ĐỀ KIỂM TRA CHUẨN MA TRẬN 18 CÂU (TẢI FILE MẪU & NẠP ĐỀ WORD) */}
      {adminTab === 'create_exam' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* HERO BANNER: TẢI FILE ĐỀ MẪU CHUẨN GDPT 2018 (3 PHẦN - 18 CÂU) */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-blue-700 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Download className="w-3.5 h-3.5" />
                  <span>TẢI FILE ĐỀ MẪU CHUẨN MA TRẬN GDPT 2018</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  File Mẫu Đề Kiểm Tra Thường Xuyên (Đủ 3 Phần - 18 Câu - 10 Điểm)
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                  Đã chuẩn hóa ma trận theo quy định: <strong>Phần 1: 16 câu trắc nghiệm nhiều lựa chọn (8.0đ)</strong> + <strong>Phần 2: 1 câu Đúng/Sai 4 nhận định (1.0đ)</strong> + <strong>Phần 3: 1 câu Trả lời ngắn 2 chỗ điền số (1.0đ)</strong>.
                </p>
              </div>

              {/* Subject Selector for Template */}
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col gap-1.5 self-center sm:self-auto">
                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider text-center">
                  Chọn phân môn đề mẫu:
                </span>
                <div className="flex items-center gap-1">
                  {(['physics', 'chemistry', 'biology'] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setPanelSelectedSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        panelSelectedSubject === sub
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {sub === 'physics' ? 'Vật lí 8' : sub === 'chemistry' ? 'Hóa học 8' : 'Sinh học 8'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 Action Buttons to Download & Copy Template */}
            <div className="flex items-center flex-wrap gap-2.5 pt-2 border-t border-white/15">
              <button
                type="button"
                onClick={() => handlePanelDownloadDocx(panelSelectedSubject)}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                title="Tải tệp Microsoft Word chuẩn (.docx) - tương thích Word 2013-2024, Google Docs, WPS"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>📥 Tải File Mẫu Word Chuẩn (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelDownloadDoc(panelSelectedSubject)}
                className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                title="Tải tệp Word (.doc) tương thích nhanh"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>Tải Mẫu (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelDownloadTxt(panelSelectedSubject)}
                className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                title="Tải tệp văn bản thuần (.txt) không lo lỗi font"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tải File (.txt)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelCopyTemplate(panelSelectedSubject)}
                className={`px-3.5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  panelIsCopied
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                }`}
                title="Sao chép toàn bộ nội dung mẫu để dán vào Word"
              >
                {panelIsCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                <span>{panelIsCopied ? '✓ Đã sao chép vào bộ nhớ!' : '📋 Sao chép nội dung mẫu'}</span>
              </button>
            </div>
          </div>

          {/* METHOD SELECTION TABS */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPanelCreateMode('upload')}
              className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                panelCreateMode === 'upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Cách 1: Nạp từ file Word (.docx, .doc, .txt) đã soạn</span>
            </button>

            <button
              type="button"
              onClick={() => setPanelCreateMode('quick_form')}
              className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                panelCreateMode === 'quick_form'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Cách 2: Khởi tạo nhanh khung đề 18 câu</span>
            </button>
          </div>

          {/* CÁCH 1: NẠP FILE WORD ĐÃ SOẠN */}
          {panelCreateMode === 'upload' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">1</span>
                  Kéo Thả Hoặc Chọn File Word Đề Thi Của Thầy/Cô
                </h4>
                <p className="text-xs text-slate-500">
                  Hệ thống tự động đọc và nhận diện 100% nội dung tiếng Việt có dấu, bóc tách chính xác 16 câu trắc nghiệm nhiều lựa chọn, 1 câu Đúng/Sai và 1 câu điền số.
                </p>
              </div>

              {/* Upload Drag & Drop Area */}
              <div className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-3 transition-all relative ${
                panelIsUploading ? 'border-amber-400 bg-amber-50/50' : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer bg-slate-50/50'
              }`}>
                <input
                  type="file"
                  accept=".docx,.doc,.txt"
                  onChange={handlePanelFileUpload}
                  disabled={panelIsUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-black text-xl shadow-xs">
                  {panelIsUploading ? <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" /> : <FileUp className="w-7 h-7" />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    {panelIsUploading ? 'Đang đọc và phân tích cấu trúc đề thi...' : 'Bấm vào đây để chọn file Word (.docx, .doc, .txt) hoặc kéo thả file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ tất cả định dạng Microsoft Word <strong>.docx</strong>, <strong>.doc</strong> và tệp <strong>.txt</strong>
                  </p>
                </div>
              </div>

              {/* Direct Text Editor Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setPanelShowDirectEditor(!panelShowDirectEditor)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer underline"
                >
                  <span>{panelShowDirectEditor ? '▲ Thu gọn ô dán văn bản trực tiếp' : '▼ Hoặc dán / chỉnh sửa trực tiếp nội dung đề thi vào đây'}</span>
                </button>

                {panelShowDirectEditor && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold">Nội dung đề thi (Dán trực tiếp từ Word hoặc Google Docs):</span>
                      <span className="text-[10px] text-slate-400">Tự động giữ nguyên font chữ tiếng Việt</span>
                    </div>
                    <textarea
                      value={panelUploadedFileText}
                      onChange={(e) => setPanelUploadedFileText(e.target.value)}
                      placeholder="Dán nội dung đề thi vào đây theo cấu trúc [TIÊU ĐỀ: ...], Phần 1, Phần 2, Phần 3..."
                      rows={9}
                      className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const text = generateExamPlainTextTemplate(panelSelectedSubject);
                          setPanelUploadedFileText(text);
                          handlePanelParseText(text);
                        }}
                        className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Nạp mẫu đề {panelSelectedSubject === 'physics' ? 'Vật lí' : panelSelectedSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePanelParseText(panelUploadedFileText)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Phân tích văn bản & Cập nhật</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {panelUploadError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{panelUploadError}</span>
                </div>
              )}

              {panelUploadSuccessInfo && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3 font-semibold shadow-2xs">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-black text-emerald-950 text-sm">Nhận diện đề thi thành công!</p>
                    <p>{panelUploadSuccessInfo}</p>
                  </div>
                </div>
              )}

              {/* Preview of Uploaded Questions */}
              {panelUploadedQuestions.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h5 className="font-black text-sm text-slate-800">
                        Xem trước {panelUploadedQuestions.length} câu hỏi đã nạp từ file:
                      </h5>
                      <span className="text-xs text-slate-500">
                        Tiêu đề: <strong>{newExamTitle || 'Đề kiểm tra mới'}</strong> • Khối {newExamGrade} • {newExamSubject === 'physics' ? 'Vật lí' : newExamSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveUploadedExamToSystem}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>💾 Lưu & Đưa Đề Vào Hệ Thống</span>
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 border border-slate-200 p-3 rounded-2xl bg-slate-50/50">
                    {panelUploadedQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-800"><FormulaText text={q.question} /></p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                            {q.type === 'multiple_choice' ? '0.5đ' : q.type === 'true_false' ? '1.0đ' : '1.0đ (0.5đ x 2)'}
                          </span>
                        </div>

                        {q.type === 'multiple_choice' && (
                          <div className="grid grid-cols-2 gap-1.5 pl-2 text-[11px]">
                            {q.options.map((opt, optIdx) => (
                              <span
                                key={optIdx}
                                className={`px-2 py-1 rounded ${
                                  q.correctAnswer === optIdx 
                                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' 
                                    : 'text-slate-600'
                                }`}
                              >
                                {['A', 'B', 'C', 'D'][optIdx]}. <FormulaText text={opt} /> {q.correctAnswer === optIdx && '✓'}
                              </span>
                            ))}
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="space-y-1 pl-2 text-[11px] bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                            <span className="font-bold text-indigo-900 block text-[10px] uppercase">
                              4 Nhận định Đúng/Sai:
                            </span>
                            {q.statements.map((st) => (
                              <div key={st.subId} className="flex items-center justify-between gap-2">
                                <span className="text-slate-700">
                                  <strong className="uppercase mr-1">{st.subId})</strong> <FormulaText text={st.text} />
                                </span>
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                                  st.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'short_answer' && (
                          <div className="space-y-1.5 pl-2 text-[11px] bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                            <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                              2 Chỗ điền số:
                            </span>
                            {q.blanks && q.blanks.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.blanks.map((b, bIdx) => (
                                  <div key={b.id || bIdx} className="bg-white p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                                    <span className="font-semibold text-slate-700"><FormulaText text={b.label || `Chỗ điền (${bIdx + 1})`} />: </span>
                                    <span className="font-mono font-bold text-emerald-700">{b.acceptableAnswers.join(' / ')} {b.unit ? <FormulaText text={b.unit} /> : ''}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white p-2 rounded-lg border border-emerald-200">
                                <span className="text-slate-600">Đáp án: </span>
                                <span className="font-mono font-bold text-emerald-700">{q.acceptableAnswers.join(' / ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveUploadedExamToSystem}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu & Đưa Đề Kiểm Tra Vào Hệ Thống Ngay</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CÁCH 2: KHỞI TẠO NHANH KHUNG ĐỀ 18 CÂU */}
          {panelCreateMode === 'quick_form' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Khởi Tạo Nhanh Khung Đề Chuẩn 18 Câu
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mỗi bộ đề sẽ tự động cấu trúc theo chuẩn: 16 câu trắc nghiệm 4 lựa chọn (8.0đ) + 1 câu Đúng/Sai 4 ý (1.0đ) + 1 câu trả lời ngắn 2 chỗ điền số (1.0đ).
                </p>
              </div>

              <form onSubmit={handleCreateStandardExam} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề đề kiểm tra:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đề 9 - Sinh học 8: Hệ hô hấp và trao đổi khí"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phân môn:</label>
                    <select
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none font-semibold"
                    >
                      <option value="physics">Vật lí</option>
                      <option value="chemistry">Hóa học</option>
                      <option value="biology">Sinh học</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                    <select
                      value={newExamGrade}
                      onChange={(e) => setNewExamGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none font-semibold"
                    >
                      <option value={6}>Khối 6</option>
                      <option value={7}>Khối 7</option>
                      <option value={8}>Khối 8</option>
                      <option value={9}>Khối 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chế độ mở đề:</label>
                    <select
                      value={newExamMode}
                      onChange={(e) => setNewExamMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none font-semibold bg-white"
                    >
                      <option value="mode_2">Chế độ 2: Ấn định ngày giờ mở đề (Chuẩn quy định)</option>
                    </select>
                  </div>
                </div>

                {newExamMode === 'mode_2' && (
                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                    <span className="font-bold text-blue-900 block text-xs">
                      Thiết lập ngày, tháng, năm và giờ, phút, giây bắt đầu làm bài:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu mở:</label>
                        <input
                          type="date"
                          required
                          value={newExamOpenDate}
                          onChange={(e) => setNewExamOpenDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Giờ : Phút : Giây bắt đầu mở:</label>
                        <input
                          type="time"
                          step="1"
                          required
                          value={newExamOpenTime}
                          onChange={(e) => setNewExamOpenTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Ma trận kiểm tra 18 câu chuẩn GDPT 2018:
                  </div>
                  <div>• Phần I: 16 câu Trắc nghiệm 4 lựa chọn (8.0 điểm, 0.5đ/câu)</div>
                  <div>• Phần II: 1 câu Trắc nghiệm Đúng/Sai với 4 nhận định a-b-c-d (1.0 điểm)</div>
                  <div>• Phần III: 1 câu Trả lời ngắn điền số liệu 2 chỗ điền (1.0 điểm, 0.5đ/chỗ)</div>
                  <div>• Thời gian đếm ngược làm bài: 15 phút (900 giây)</div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Khởi Tạo Khung Đề 18 Câu Này
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateExamModal(true)}
                    className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs border border-blue-200 cursor-pointer transition-colors"
                  >
                    Mở Bảng Soạn Đề Chi Tiết / AI
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUẢN LÝ THÔNG BÁO LỊCH KIỂM TRA (LƯU TRONG TÀI KHOẢN QUẢN TRỊ) */}
      {adminTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200 p-5 rounded-2xl text-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm sm:text-base">
              <Bell className="w-5 h-5 text-rose-600 animate-bounce" />
              <span>Các Thông Báo Của Giáo Viên Được Lưu Trong Tài Khoản Quản Trị</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ các thông báo lịch kiểm tra khi giáo viên cập nhật đề sắp diễn ra kiểm tra hoặc thông báo dặn dò học sinh đều được lưu trữ tập trung tại đây và tự động hiển thị dòng thông báo nổi bật trên trang chủ để học sinh và giáo viên theo dõi.
            </p>
          </div>

          {/* Form Soạn Thông Báo Mới */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Tạo / Cập Nhật Thông Báo Lịch Kiểm Tra Sắp Diễn Ra
              </h3>
            </div>

            {notifFormMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{notifFormMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminCreateNotification} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề thông báo lịch kiểm tra: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNotifTitle}
                  onChange={(e) => setNewNotifTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch kiểm tra thường xuyên môn KHTN 8 (Áp suất chất lỏng)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp / Khối áp dụng:</label>
                <select
                  value={newNotifTargetClass}
                  onChange={(e) => setNewNotifTargetClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="all">Tất cả các lớp (Toàn trường)</option>
                  <option value="Khối 6">Toàn bộ Khối 6</option>
                  <option value="Khối 7">Toàn bộ Khối 7</option>
                  <option value="Khối 8">Toàn bộ Khối 8</option>
                  <option value="Khối 9">Toàn bộ Khối 9</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>Lớp {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân môn:</label>
                <select
                  value={newNotifSubject}
                  onChange={(e) => setNewNotifSubject(e.target.value as SubjectType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="physics">Vật lí</option>
                  <option value="chemistry">Hóa học</option>
                  <option value="biology">Sinh học</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày kiểm tra:</label>
                  <input
                    type="date"
                    value={newNotifDate}
                    onChange={(e) => setNewNotifDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ mở đề:</label>
                  <input
                    type="time"
                    value={newNotifTime}
                    onChange={(e) => setNewNotifTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung dặn dò của Giáo viên: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newNotifNote}
                  onChange={(e) => setNewNotifNote(e.target.value)}
                  placeholder="Ví dụ: Các em ôn tập kỹ phần áp suất chất lỏng và lực đẩy Archimedes. Đúng 08:00 ngày mai hệ thống sẽ mở đề kiểm tra thường xuyên 15 phút..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-rose-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Đăng & Lưu Thông Báo Lịch Kiểm Tra</span>
                </button>
              </div>
            </form>
          </div>

          {/* Danh Sách Các Thông Báo Đã Lưu Trong Tài Khoản Quản Trị */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Danh Sách Thông Báo Đã Lưu Trong Tài Khoản Quản Trị ({notifications.length} thông báo)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Thông báo lưu trong tài khoản quản trị và phát lên dòng thông báo lịch kiểm tra của trang chủ
                </p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Chưa có thông báo lịch kiểm tra nào. Khi giáo viên tạo hoặc cập nhật đề sắp kiểm tra, thông báo sẽ tự động lưu tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-rose-300 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {notif.targetClass === 'all' ? 'Toàn trường' : notif.targetClass}
                          </span>
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {notif.subject === 'physics' ? 'Vật lí' : notif.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {notif.examTime || '08:00'} ngày {notif.examDate}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">{notif.title}</h4>
                      </div>

                      {onDeleteNotification && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Thầy/Cô có chắc chắn muốn xóa thông báo này?')) {
                              onDeleteNotification(notif.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {notif.contentNote && (
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed italic">
                        "{notif.contentNote}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-2">
                      <span>Người tạo: <strong className="text-slate-600">{notif.createdBy || 'Giáo viên bộ môn'}</strong></span>
                      <span>Đã lưu vào tài khoản quản trị</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CÀI ĐẶT HỆ THỐNG (LOGO, BANNER, THÔNG TIN TRƯỜNG & TỔ CHUYÊN MÔN) */}
      {adminTab === 'system_settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
              Cấu Hình Hệ Thống
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Thông Tin Trường Học, Tổ Chuyên Môn & Giáo Viên
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên ứng dụng:</label>
              <input
                type="text"
                value={systemConfig.appName}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên trường:</label>
              <input
                type="text"
                value={systemConfig.schoolName}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tổ chuyên môn:</label>
                <input
                  type="text"
                  value={systemConfig.department}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học:</label>
                <input
                  type="text"
                  value={systemConfig.schoolYear}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, schoolYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa chỉ trường:</label>
              <input
                type="text"
                value={systemConfig.address}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách kỹ thuật:</label>
              <input
                type="text"
                value={systemConfig.leadTeacher}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, leadTeacher: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề Banner Trang Chủ:</label>
              <input
                type="text"
                value={systemConfig.bannerTitle}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, bannerTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setExcelStatusMsg({ type: 'success', text: 'Đã lưu cấu hình hệ thống thành công!' })}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Lưu Thay Đổi Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: XUẤT BẢN APP (TẢI TỆP ZIP LÊN NETLIFY) */}
      {adminTab === 'publish_app' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
          {/* HERO BANNER: XUẤT BẢN APP LÊN NETLIFY */}
          <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-800/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Xuất Bản Website Trực Tuyến Toàn Cầu</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Xuất Bản App Lên Netlify Bằng Tệp ZIP
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tính năng này cho phép Quản trị viên tải về trọn bộ gói mã nguồn web đã được biên dịch tối ưu (HTML5, Tailwind CSS, React, KaTeX công thức toán-hóa). Thầy/Cô chỉ cần kéo thả tệp ZIP này lên <strong className="text-teal-300">Netlify Drop</strong> là website của trường THCS & THPT Y Đôn sẽ hoạt động công khai 24/7 hoàn toàn miễn phí.
              </p>
            </div>
          </div>

          {/* STATUS NOTIFICATION (NẾU CÓ) */}
          {publishStatusMsg && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in ${
              publishStatusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
              publishStatusMsg.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
              'bg-blue-50 border-blue-300 text-blue-900'
            }`}>
              <div className="flex items-center gap-2">
                {publishStatusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {publishStatusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {publishStatusMsg.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                <span>{publishStatusMsg.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setPublishStatusMsg(null)}
                className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* STATUS BAR: THÔNG SỐ BẢN BIÊN DỊCH HIỆN TẠI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Trạng thái gói xuất bản</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Sẵn Sàng Xuất Bản
                  </span>
                  {buildStatus && (
                    <span className="text-xs text-slate-600 font-semibold">
                      • {buildStatus.fileCount} tệp tin (~{buildStatus.totalSizeMB} MB)
                      {buildStatus.lastBuilt && ` • Lần build: ${new Date(buildStatus.lastBuilt).toLocaleTimeString('vi-VN')} ${new Date(buildStatus.lastBuilt).toLocaleDateString('vi-VN')}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRebuildDist}
              disabled={isRebuilding}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="Biên dịch lại toàn bộ dự án từ mã nguồn mới nhất"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRebuilding ? 'animate-spin' : ''}`} />
              <span>{isRebuilding ? 'Đang biên dịch lại...' : 'Biên dịch lại bản mới nhất'}</span>
            </button>
          </div>

          {/* 2 MAIN DOWNLOAD OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THẺ 1: TẢI TOÀN BỘ MÃ NGUỒN CỦA APP (ƯU TIÊN HÀNG ĐẦU DÀNH CHO QUẢN TRỊ) */}
            <div className="bg-gradient-to-b from-indigo-50/80 via-white to-blue-50/30 p-6 rounded-3xl border-2 border-indigo-400/90 shadow-lg flex flex-col justify-between space-y-5 relative ring-2 ring-indigo-200/60">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-600 text-white shadow-xs">
                  ⭐ Mã Nguồn Gốc Đầy Đủ
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>Mã Nguồn Của App (.ZIP)</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tải về <strong>100% trọn bộ mã nguồn hoàn chỉnh</strong> của ứng dụng (React SPA, TypeScript, Tailwind CSS, Vite, cơ sở dữ liệu đề thi, danh sách học sinh và cấu hình Netlify) để lưu trữ hoặc xuất bản lên Netlify qua GitHub/GitLab.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-indigo-200/80 space-y-2 text-xs shadow-2xs">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5 text-indigo-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Bộ mã nguồn bao gồm:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>Thư mục <strong>src/</strong> (toàn bộ components, types, dữ liệu trắc nghiệm, OMR)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>Thư mục <strong>public/</strong> (ảnh, font KaTeX, _redirects, netlify.toml)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span><strong>package.json</strong>, <strong>vite.config.ts</strong>, <strong>tsconfig.json</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>Tệp hướng dẫn xuất bản <strong>HUONG_DAN_XUAT_BAN_NETLIFY.txt</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  id="admin-download-source-zip-btn"
                  onClick={handleDownloadSourceZip}
                  disabled={isDownloadingSourceZip}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 active:scale-98 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 ring-2 ring-indigo-300"
                >
                  {isDownloadingSourceZip ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Đang đóng gói mã nguồn...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white" />
                      <span>TẢI MÃ NGUỒN CỦA APP (.ZIP)</span>
                    </>
                  )}
                </button>

                {/* Link Tải Trực Tiếp Mã Nguồn Dự Phòng */}
                <a
                  href="/ma-nguon-app-khtn-thcs-thpt-ydon.zip"
                  download="ma-nguon-app-khtn-thcs-thpt-ydon.zip"
                  className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-indigo-300 transition-colors text-center cursor-pointer"
                  title="Link tải trực tiếp tệp mã nguồn từ máy chủ (ma-nguon-app-khtn-thcs-thpt-ydon.zip)"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Link Tải Trực Tiếp Mã Nguồn Dự Phòng (.ZIP)</span>
                </a>
              </div>
            </div>

            {/* THẺ 2: TẢI GÓI BIÊN DỊCH NETLIFY SẴN DÙNG (KÉO THẢ 1 CHẠM) */}
            <div className="bg-gradient-to-b from-emerald-50/70 to-white p-6 rounded-3xl border-2 border-emerald-400/80 shadow-md flex flex-col justify-between space-y-5 relative">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                  ⚡ Kéo Thả 1 Chạm
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    Gói Biên Dịch Netlify (.ZIP)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Được đóng gói sẵn sàng từ thư mục <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[11px]">dist/</code> đã biên dịch. Kéo thả trực tiếp lên <strong>app.netlify.com/drop</strong> là chạy ngay không cần cài đặt nodejs!
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 space-y-2 text-xs shadow-2xs">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Bộ cấu hình đã tích hợp sẵn:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>index.html</strong> cùng toàn bộ mã tối ưu CSS/JS</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Tệp <strong>_redirects</strong> (chống lỗi 404 khi tải lại trang F5)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Tệp <strong>netlify.toml</strong> cấu hình tối ưu SPA Routing & Cache</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Tệp hướng dẫn <strong>HUONG_DAN_XUAT_BAN_NETLIFY.txt</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  id="admin-publish-zip-download-btn"
                  onClick={handleDownloadPublishZip}
                  disabled={isDownloadingPublishZip}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 ring-2 ring-emerald-300"
                >
                  {isDownloadingPublishZip ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Đang đóng gói tệp ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>TẢI GÓI BIÊN DỊCH NETLIFY (.ZIP)</span>
                    </>
                  )}
                </button>

                {/* Link Tải Trực Tiếp Dự Phòng (Native Browser Download) */}
                <a
                  href="/khtn-thcs-thpt-ydon-netlify-publish.zip"
                  download="khtn-thcs-thpt-ydon-netlify-publish.zip"
                  className="w-full py-2.5 px-3 bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-300 transition-colors text-center cursor-pointer"
                  title="Tải trực tiếp tệp ZIP từ máy chủ (khtn-thcs-thpt-ydon-netlify-publish.zip)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Link Tải Trực Tiếp Gói Biên Dịch (.ZIP)</span>
                </a>
              </div>
            </div>
          </div>

          {/* HƯỚNG DẪN CHI TIẾT 2 CÁCH XUẤT BẢN APP LÊN NETLIFY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider block">
                  Cẩm nang xuất bản website
                </span>
                <h4 className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">
                  Hướng Dẫn Xuất Bản App Lên Netlify Miễn Phí (Chỉ Mất 1 - 2 Phút)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Mở Netlify Drop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://app.netlify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Mở Netlify Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 2 PHƯƠNG PHÁP TRIỂN KHAI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PHƯƠNG PHÁP 1: TRIỂN KHAI TỪ MÃ NGUỒN */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-white p-5 rounded-2xl border border-indigo-200/90 space-y-4">
                <div className="flex items-center gap-2.5 text-indigo-900 font-black text-sm">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                    A
                  </div>
                  <h5>CÁCH 1: XUẤT BẢN TỪ MÃ NGUỒN (KHUYÊN DÙNG)</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Phù hợp khi Thầy/Cô muốn lưu mã nguồn trên GitHub/GitLab. Mỗi khi sửa code, Netlify sẽ tự động biên dịch và cập nhật trang web.
                </p>

                <ol className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                    <span>Bấm nút <strong>"TẢI MÃ NGUỒN CỦA APP (.ZIP)"</strong> ở trên để lưu file <code className="bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-mono text-[10px]">.zip</code> về máy.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                    <span>Tạo một kho lưu trữ mới trên <a href="https://github.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">GitHub</a> hoặc <a href="https://gitlab.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">GitLab</a> và đẩy toàn bộ mã nguồn lên.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                    <span>Vào <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Netlify</a>, chọn <strong>Add new site</strong> → <strong>Import an existing project</strong> → Chọn kho GitHub vừa tạo.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">4</span>
                    <span>Netlify đã được cấu hình tự động sẵn trong <code className="text-indigo-900 font-mono">netlify.toml</code> (Lệnh build: <code className="text-indigo-900 font-mono">npm run build</code>, Thư mục xuất bản: <code className="text-indigo-900 font-mono">dist</code>). Bấm <strong>Deploy</strong> là website chạy ngay!</span>
                  </li>
                </ol>
              </div>

              {/* PHƯƠNG PHÁP 2: TRIỂN KHAI NHANH QUA NETLIFY DROP */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-white p-5 rounded-2xl border border-emerald-200/90 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    B
                  </div>
                  <h5>CÁCH 2: KÉO THẢ NHANH VỚI NETLIFY DROP (1 PHÚT)</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cách đơn giản nhất: Không cần cài đặt nodejs hay github, chỉ việc kéo thả file zip là website hoạt động tức thì.
                </p>

                <ol className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                    <span>Bấm nút <strong>"TẢI GÓI BIÊN DỊCH NETLIFY (.ZIP)"</strong> ở trên (hoặc tải mã nguồn, chạy <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono text-[10px]">npm run build</code> để có thư mục <code className="font-mono">dist</code>).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                    <span>Truy cập trang: <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">app.netlify.com/drop</a> (Đăng nhập bằng tài khoản Google miễn phí).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                    <span>Kéo thả trực tiếp tệp ZIP vừa tải vào khung kéo thả của Netlify Drop.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">4</span>
                    <span>Sau 15 giây, website xuất bản xong! Bấm <strong>Site configuration</strong> → <strong>Change site name</strong> để đổi tên trường THCS & THPT Y Đôn (ví dụ: <code className="text-emerald-800 font-mono font-bold">khtn-thcs-ydon</code>).</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* HƯỚNG DẪN ĐỔI TÊN MIỀN TRƯỜNG Y ĐÔN */}
            <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200/90 flex items-start gap-3 text-xs text-amber-950">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-sm text-amber-900">Cách đổi tên miền trường THCS & THPT Y Đôn hoàn toàn miễn phí:</span>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Khi mới tạo xong, Netlify sẽ cấp một đường link ngẫu nhiên (ví dụ: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">magical-sunflower-123.netlify.app</code>). Thầy/Cô chỉ cần vào mục <strong>Site configuration</strong> → Chọn <strong>Change site name</strong> → Gõ tên trường (ví dụ: <strong className="text-amber-950 font-bold">khtn-thcs-ydon</strong> hoặc <strong className="text-amber-950 font-bold">thcs-thpt-ydon</strong>). Link chính thức của trường sẽ là: <code className="bg-amber-200/70 text-amber-950 font-bold font-mono px-1.5 py-0.5 rounded">https://khtn-thcs-ydon.netlify.app</code>.
                </p>
              </div>
            </div>

            {/* Khung giải thích định tuyến Netlify SPA */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black">Lưu ý quan trọng về tính năng định tuyến SPA:</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Cả gói mã nguồn và gói biên dịch đều đã được cấu hình sẵn tệp <code className="bg-blue-100 font-mono px-1 py-0.5 rounded text-blue-900">_redirects</code> và <code className="bg-blue-100 font-mono px-1 py-0.5 rounded text-blue-900">netlify.toml</code>. Do đó khi học sinh và giáo viên truy cập, chia sẻ đường link hoặc tải lại trang (F5) ở bất kỳ mục nào cũng sẽ không bao giờ bị lỗi 404 Not Found trên Netlify!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA ĐỀ THI */}
      {editingExam && (
        <ExamEditModal
          exam={editingExam}
          isOpen={!!editingExam}
          onClose={() => setEditingExam(null)}
          onSave={handleSaveExam}
          onDelete={handleDeleteExam}
        />
      )}

      {/* MODAL TẠO ĐỀ THI MỚI (THỦ CÔNG / AI / UP FILE) */}
      {showCreateExamModal && (
        <CreateExamModal
          isOpen={showCreateExamModal}
          onClose={() => {
            setShowCreateExamModal(false);
            if (adminTab === 'create_exam') setAdminTab('schedule');
          }}
          onSaveExam={handleSaveCreatedExam}
          currentUser={{ id: 'admin_root', role: 'admin', name: 'Quản trị viên THCS & THPT Y Đôn' }}
          defaultGrade={8}
          defaultSubject="physics"
        />
      )}

      {/* MODAL XÁC NHẬN AN TOÀN TRÊN IFRAME (REPLACES WINDOW.CONFIRM) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${confirmDialog.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                {confirmDialog.isDanger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText || 'Hủy Bỏ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className={`px-4 py-2 font-bold rounded-xl text-xs text-white transition-colors cursor-pointer shadow-xs ${
                  confirmDialog.isDanger 
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {confirmDialog.confirmText || 'Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
