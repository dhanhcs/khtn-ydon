import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  Layers, 
  Sparkles, 
  Clock, 
  Calendar,
  Play, 
  Search, 
  Award,
  KeyRound,
  X,
  FileCheck2,
  TableProperties,
  Edit3,
  CalendarClock,
  Plus,
  Camera,
  Printer,
  RefreshCw,
  Bell,
  Shuffle,
  Upload,
  Trash2,
  RotateCcw,
  Globe,
  Download
} from 'lucide-react';
import { 
  initialSystemConfig, 
  sampleExams, 
  sampleStudents, 
  sampleSubmissions, 
  sampleLearningResources,
  sampleExemplaryPosts,
  schoolClasses
} from './data/mockData';
import { additionalExams, allStandardExams } from './data/additionalExams';
import { 
  Exam, 
  GradeLevel, 
  StudentRecord, 
  StudentSubmission, 
  SubjectType, 
  SystemConfig,
  ExemplaryPost,
  UserSession,
  LearningResource,
  ExamReminderNotification
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AtomGraphic } from './components/AtomGraphic';
import { DnaGraphic } from './components/DnaGraphic';
import { ExamTakingModal } from './components/ExamTakingModal';
import { ExamReviewModal } from './components/ExamReviewModal';
import { ExamEditModal } from './components/ExamEditModal';
import { CreateExamModal } from './components/CreateExamModal';
import { PrintableAnswerSheetModal } from './components/PrintableAnswerSheetModal';
import { CameraOMRScannerModal } from './components/CameraOMRScannerModal';
import { PeriodicExamMixerModal } from './components/PeriodicExamMixerModal';
import { SyncRestoreModal } from './components/SyncRestoreModal';
import { AdminPanel } from './components/AdminPanel';
import { LearningResourcesView } from './components/LearningResourcesView';
import { StudentTasksMenu } from './components/StudentTasksMenu';
import { ExemplaryView } from './components/ExemplaryView';
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { HomeworkView } from './components/HomeworkView';
import { ScoreboardModal } from './components/ScoreboardModal';
import { GuestNoticeModal } from './components/GuestNoticeModal';
import { AIAssistantView } from './components/AIAssistantView';
import { MindmapView } from './components/MindmapView';
import { InstallAppModal } from './components/InstallAppModal';
import { ExamReminderModal } from './components/ExamReminderModal';
import { PublishAppModal } from './components/PublishAppModal';
import { checkStudentInSchoolRoster, validateStudentNameWithHelpfulErrors } from './utils/excelUtils';
import { isTeacherAdmin } from './utils/permissionUtils';
import { getExamScheduleStatus, formatDateTimeVi, reopenExamWithDuration, ExamScheduleStatus } from './utils/examTimeUtils';
import { regradeAllSubmissions, regradeSubmissionWithExam } from './utils/examRegrader';

export default function App() {
  // System Config (with persistent school year)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('ydon_system_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSystemConfig;
  });

  // Comprehensive grade 6-9 exams (8 exams per grade = 32 full exams)
  const initialAllExams = useMemo(() => allStandardExams, []);

  // Exams state
  // QUY TẮC BẮT BUỘC THEO YÊU CẦU:
  // 1. Sắp xếp các đề kiểm tra theo thứ tự Đề mới tạo gần nhất hiển thị đầu tiên (từ mới nhất đến cũ nhất).
  // 2. Xóa tất cả các đề do app tự tạo trước ngày 15/10/2026.
  // 3. Xóa tất cả các đề có trên app ở dạng mở tự do (chỉ giữ đề có ấn định thời gian mở đề mode === 'mode_2').
  // 4. Đảm bảo xóa đề triệt để trong localStorage và local state, loại bỏ mọi cơ chế tự nạp lại đề cũ.
  const [exams, setExams] = useState<Exam[]>(() => {
    const deletedIds: string[] = (() => {
      try {
        const s = localStorage.getItem('ydon_deleted_exam_ids');
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    })();

    const isValidExam = (e: any): boolean => {
      if (!e || !e.id) return false;
      if (deletedIds.includes(e.id)) return false;
      return true;
    };

    const saved = localStorage.getItem('ydon_exams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validExams = parsed.filter(isValidExam);
          // Đảm bảo các đề chuẩn hóa luôn hiện diện đầy đủ
          const idSet = new Set(validExams.map(e => e.id));
          allStandardExams.forEach(std => {
            if (!idSet.has(std.id) && !deletedIds.includes(std.id)) {
              validExams.push(std);
            }
          });
          validExams.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime() || 0;
            const timeB = new Date(b.createdAt || 0).getTime() || 0;
            if (timeB !== timeA) return timeB - timeA;
            return (b.id || '').localeCompare(a.id || '');
          });
          localStorage.setItem('ydon_exams', JSON.stringify(validExams));
          return validExams;
        }
      } catch (e) {}
    }

    // Nếu local chưa có: nạp toàn bộ từ allStandardExams
    const validInitial = [...allStandardExams].filter(isValidExam);
    validInitial.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
    localStorage.setItem('ydon_exams', JSON.stringify(validInitial));
    return validInitial;
  });

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('ydon_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((s: StudentRecord) => s && s.id && s.name);
          return valid;
        }
      } catch (e) {}
    }
    return sampleStudents;
  });
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    const saved = localStorage.getItem('ydon_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((s: StudentSubmission) => s && s.id && s.studentName);
          const { updatedSubmissions, changedCount } = regradeAllSubmissions(valid, exams);
          if (changedCount > 0) {
            localStorage.setItem('ydon_submissions', JSON.stringify(updatedSubmissions));
          }
          return updatedSubmissions;
        }
      } catch (e) {}
    }
    return [];
  });

  // Tự động chấm lại toàn bộ bài nộp học sinh theo đáp án đã chỉnh sửa mới nhất của đề thi (đặc biệt Đề kiểm tra Hóa học 9 lần 1)
  useEffect(() => {
    if (!exams || exams.length === 0 || !submissions || submissions.length === 0) return;
    const { updatedSubmissions, changedCount } = regradeAllSubmissions(submissions, exams);
    if (changedCount > 0) {
      setSubmissions(updatedSubmissions);
      localStorage.setItem('ydon_submissions', JSON.stringify(updatedSubmissions));
      fetch('/api/sync/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: updatedSubmissions, overwrite: true })
      }).catch(console.error);
    }
  }, [exams, submissions]);

  // Exemplary posts
  const [exemplaryPosts, setExemplaryPosts] = useState<ExemplaryPost[]>(() => {
    const saved = localStorage.getItem('ydon_exemplary_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return sampleExemplaryPosts;
  });

  // Learning resources (with persistent storage)
  const [learningResources, setLearningResources] = useState<LearningResource[]>(() => {
    const saved = localStorage.getItem('ydon_learning_resources');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return sampleLearningResources;
  });

  // User session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('ydon_user_session');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (parsed && parsed.role === 'admin') {
          if (!parsed.name.startsWith('QTV-') && !parsed.name.startsWith('TT ')) {
            const rawName = parsed.adminName || parsed.name.replace(/^Quản trị viên \((.*?)\)$/, '$1').replace(/^Quản trị viên$/, 'Thầy Nguyễn Đình Hành');
            parsed.name = `QTV-${rawName}`;
          }
        }
        return parsed;
      } catch (e) {}
    }
    return null;
  });

  // Auth modal state
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: AuthModalMode }>({
    isOpen: false,
    mode: 'student_login'
  });

  // Active Main Navigation Tab: 'kttx', 'study_corner', 'homework', 'prep_guide', 'digital_products', 'digital_tools', 'hsg_prep', 'exemplary', 'admin'
  const [activeTab, setActiveTab] = useState<string>('kttx');

  // Filters for Home / KTTX Page
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTestNumber, setSelectedTestNumber] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Exam taking state & modals
  const [activeExamToTake, setActiveExamToTake] = useState<Exam | null>(null);
  const [selectedExamForEntry, setSelectedExamForEntry] = useState<Exam | null>(null);
  const [entryStudentName, setEntryStudentName] = useState<string>(currentUser?.name || '');
  const [entryClassName, setEntryClassName] = useState<string>(currentUser?.className || '8A1');
  const [entryExamPassword, setEntryExamPassword] = useState<string>('');
  const [entryError, setEntryError] = useState<string>('');

  // Exam Review Modal state
  const [reviewSubmission, setReviewSubmission] = useState<{ submission: StudentSubmission; exam: Exam } | null>(null);

  // Scoreboard Modal state
  const [showScoreboardModal, setShowScoreboardModal] = useState<boolean>(false);

  // Guest Notice Modal state
  const [guestNoticeState, setGuestNoticeState] = useState<{
    isOpen: boolean;
    name: string;
    className: string;
  }>({
    isOpen: false,
    name: '',
    className: ''
  });

  // Exam Edit Modal state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isCreatingExam, setIsCreatingExam] = useState<boolean>(false);

  // 3 New Feature Modals requested by user:
  // 1. Create Exam Modal (Manual / AI / File Upload)
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);
  // 2. Printable Bubble Answer Sheet
  const [showPrintSheetModal, setShowPrintSheetModal] = useState<boolean>(false);
  // 3. Camera OMR Scanner
  const [showCameraOMRModal, setShowCameraOMRModal] = useState<boolean>(false);
  // 4. Periodic Exam Mixer (Trộn đề định kỳ 1 - 6 mã đề từ 2 đề gốc)
  const [showPeriodicMixerModal, setShowPeriodicMixerModal] = useState<boolean>(false);
  // 5. Sync & Restore Student Results Modal (Từ App đã xuất bản / thiết bị cũ)
  const [showSyncRestoreModal, setShowSyncRestoreModal] = useState<boolean>(false);
  // 6. Modal Xuất Bản App lên Netlify (Tải tệp ZIP)
  const [showPublishAppModal, setShowPublishAppModal] = useState<boolean>(false);

  // 4. Install App Modal & PWA Prompt
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 5. Exam Reminder Notifications Modal & State
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<ExamReminderNotification[]>(() => {
    const saved = localStorage.getItem('ydon_exam_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'notif-default-1',
        title: 'Lịch kiểm tra thường xuyên môn KHTN (Chuẩn ma trận 18 câu)',
        targetClass: 'all',
        subject: 'physics',
        examDate: '2026-10-16',
        examTime: '08:00',
        examTitle: 'Đề 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
        durationMinutes: 15,
        contentNote: 'Các em học sinh chú ý ôn tập kỹ kiến thức 3 phần: Phần 1 (16 câu trắc nghiệm nhiều lựa chọn), Phần 2 (1 câu đúng sai 4 nhận định), Phần 3 (1 câu trả lời ngắn 2 chỗ điền số). Chúc các em làm bài đạt điểm cao!',
        createdAt: new Date().toISOString(),
        createdBy: 'Thầy Nguyễn Đình Hành - Tổ KHTN'
      }
    ];
  });

  // State cho thông báo lịch kiểm tra khi học sinh đăng nhập app
  const [studentScheduleNotice, setStudentScheduleNotice] = useState<{
    isOpen: boolean;
    studentName: string;
    className: string;
    title: string;
    subjectName: string;
    targetClass: string;
    scheduleTime: string;
    note: string;
    createdBy: string;
  } | null>(null);
  const [dismissedScheduleBar, setDismissedScheduleBar] = useState<boolean>(false);

  // Helper tìm lịch kiểm tra giáo viên đã lên lịch áp dụng cho học sinh
  const getScheduledInfoForUser = useCallback((userClass?: string, userGrade?: number) => {
    // 1. Kiểm tra danh sách thông báo lịch kiểm tra (notifications)
    const matchedNotif = notifications.find(n => {
      if (n.targetClass === 'all') return true;
      if (userClass && n.targetClass.toLowerCase() === userClass.toLowerCase()) return true;
      if (userGrade && n.grade && (n.grade === userGrade || n.grade === 'all')) return true;
      return false;
    });

    if (matchedNotif) {
      const subName = matchedNotif.subject === 'physics' ? 'Vật lí' : matchedNotif.subject === 'chemistry' ? 'Hóa học' : matchedNotif.subject === 'biology' ? 'Sinh học' : 'Khoa học Tự nhiên';
      return {
        title: matchedNotif.title,
        subjectName: subName,
        targetClass: matchedNotif.targetClass === 'all' ? 'Tất cả các lớp' : `Lớp ${matchedNotif.targetClass}`,
        scheduleTime: `${matchedNotif.examTime || '08:00'} ngày ${matchedNotif.examDate}`,
        note: matchedNotif.contentNote,
        createdBy: matchedNotif.createdBy
      };
    }

    // 2. Kiểm tra các đề kiểm tra đang ở Chế độ 2 (mode_2 - Ấn định thời gian mở đề)
    const scheduledEx = exams.find(e => {
      if (e.mode !== 'mode_2' || !e.openAt) return false;
      if (userGrade && e.grade !== userGrade) return false;
      return true;
    });

    if (scheduledEx && scheduledEx.openAt) {
      let timeFormatted = scheduledEx.openAt;
      try {
        const d = new Date(scheduledEx.openAt);
        if (!isNaN(d.getTime())) {
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          timeFormatted = `${hh}:${min} ngày ${dd}/${mm}/${yyyy}`;
        }
      } catch {}

      const subName = scheduledEx.subject === 'physics' ? 'Vật lí' : scheduledEx.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
      return {
        title: scheduledEx.title,
        subjectName: subName,
        targetClass: `Khối ${scheduledEx.grade}`,
        scheduleTime: timeFormatted,
        note: `Giáo viên bộ môn đã ấn định mở đề kiểm tra thường xuyên môn ${subName}. Các em hãy chuẩn bị kiến thức và đăng nhập đúng giờ để làm bài.`,
        createdBy: 'Giáo viên bộ môn KHTN'
      };
    }

    return null;
  }, [notifications, exams]);

  const activeScheduledBanner = useMemo(() => {
    return getScheduledInfoForUser(currentUser?.className, currentUser?.grade);
  }, [getScheduledInfoForUser, currentUser]);

  // Listen to PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(false);
      }
    }
  };

  const handleSendNotification = async (notif: ExamReminderNotification) => {
    setNotifications(prev => {
      const idx = prev.findIndex(n => n.id === notif.id);
      const next = idx >= 0 ? prev.map((n, i) => i === idx ? notif : n) : [notif, ...prev];
      localStorage.setItem('ydon_exam_notifications', JSON.stringify(next));
      return next;
    });

    try {
      await fetch('/api/sync/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: notif })
      });
    } catch (e) {
      console.warn('Sync notification notice:', e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      localStorage.setItem('ydon_exam_notifications', JSON.stringify(next));
      return next;
    });

    try {
      await fetch(`/api/sync/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete notification notice:', e);
    }
  };

  // =========================================================================
  // MULTI-DEVICE CLOUD & SERVER SYNC (MÁY TÍNH ⇄ ĐIỆN THOẠI)
  // Đảm bảo khi Admin tải danh sách HS trên máy tính, mọi điện thoại (iOS, Android)
  // và máy tính khác đều có dữ liệu đồng bộ tức thì qua Máy chủ trung tâm.
  // =========================================================================
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSynced: string | null;
    message: string | null;
    studentCount: number;
  }>({
    isSyncing: false,
    lastSynced: null,
    message: null,
    studentCount: 0
  });

  const syncWithServer = async (forcePushLocal: boolean = false) => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      const res = await fetch('/api/sync/all');
      if (!res.ok) throw new Error('Không thể kết nối máy chủ');
      const data = await res.json();

      const serverStudents: StudentRecord[] = Array.isArray(data.students) ? data.students : [];
      const localSaved = localStorage.getItem('ydon_students');
      let localStudents: StudentRecord[] = [];
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) localStudents = parsed;
        } catch {}
      }

      // TRƯỜNG HỢP 1: Giáo viên đã upload danh sách HS trên máy tính trước đó (local có, server chưa có hoặc forcePushLocal)
      if (forcePushLocal || (localStudents.length > 0 && serverStudents.length === 0)) {
        await fetch('/api/sync/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: localStudents, replace: true })
        });
      } else if (serverStudents.length > 0) {
        // TRƯỜNG HỢP 2: Mở app trên điện thoại (server đã có danh sách học sinh từ máy tính)
        setStudents(serverStudents);
        localStorage.setItem('ydon_students', JSON.stringify(serverStudents));
      }

      // Đồng bộ danh sách đề kiểm tra thường xuyên (KTTX) - ưu tiên bản chỉnh sửa mới nhất trên thiết bị
      const incomingExams = data.exams || data.customExams;
      let latestMergedExams = exams;
      if (Array.isArray(incomingExams)) {
        const deletedIds: string[] = (() => {
          try {
            const s = localStorage.getItem('ydon_deleted_exam_ids');
            return s ? JSON.parse(s) : [];
          } catch {
            return [];
          }
        })();
        const isValidExam = (e: any): boolean => {
          if (!e || !e.id) return false;
          if (deletedIds.includes(e.id)) return false;
          return true;
        };

        setExams(prev => {
          const map = new Map<string, Exam>();
          incomingExams.forEach((e: Exam) => {
            if (isValidExam(e)) {
              map.set(e.id, e);
            }
          });
          // Ưu tiên đề đã chỉnh sửa đáp án trên máy hiện tại (prev)
          prev.forEach(e => {
            if (isValidExam(e)) {
              map.set(e.id, e);
            }
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime() || 0;
            const timeB = new Date(b.createdAt || 0).getTime() || 0;
            if (timeB !== timeA) return timeB - timeA;
            return (b.id || '').localeCompare(a.id || '');
          });
          latestMergedExams = merged;
          localStorage.setItem('ydon_exams', JSON.stringify(merged));
          if (merged.length > incomingExams.length || forcePushLocal) {
            fetch('/api/sync/exams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ exams: merged, replace: true })
            }).catch(console.error);
          }
          return merged;
        });
      }

      // Đồng bộ kết quả bài nộp giữa máy tính và điện thoại + tự động chấm lại theo đáp án mới
      if (Array.isArray(data.submissions)) {
        setSubmissions(prev => {
          const map = new Map<string, StudentSubmission>();
          data.submissions.forEach((s: StudentSubmission) => map.set(s.id, s));
          prev.forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values());
          const { updatedSubmissions, changedCount } = regradeAllSubmissions(merged, latestMergedExams);
          localStorage.setItem('ydon_submissions', JSON.stringify(updatedSubmissions));
          if (changedCount > 0 || updatedSubmissions.length > data.submissions.length || forcePushLocal) {
            fetch('/api/sync/submissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissions: updatedSubmissions, overwrite: true })
            }).catch(console.error);
          }
          return updatedSubmissions;
        });
      }

      // Đồng bộ học liệu và công cụ số
      if (Array.isArray(data.learningResources) && data.learningResources.length > 0) {
        setLearningResources(data.learningResources);
        localStorage.setItem('ydon_learning_resources', JSON.stringify(data.learningResources));
      }

      // Đồng bộ thông báo nhắc lịch kiểm tra từ máy chủ
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        localStorage.setItem('ydon_exam_notifications', JSON.stringify(data.notifications));
      }

      setSyncStatus({
        isSyncing: false,
        lastSynced: new Date().toLocaleTimeString('vi-VN'),
        message: `Đã đồng bộ (${serverStudents.length || localStudents.length} học sinh)`,
        studentCount: serverStudents.length || localStudents.length
      });
    } catch (err: any) {
      console.warn('Sync error:', err);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        message: 'Hoạt động offline cục bộ'
      }));
    }
  };

  useEffect(() => {
    syncWithServer();
    const handleFocus = () => {
      syncWithServer();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    const interval = setInterval(() => {
      syncWithServer();
    }, 15000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // Helper to check if an exam is currently open
  const isExamCurrentlyOpen = (exam: Exam) => {
    if (!exam.isActive) return false;
    if (exam.mode === 'mode_1') return true;
    const openStr = exam.openAt || exam.openTime;
    if (!openStr) return true;
    try {
      const d = new Date(openStr);
      if (!isNaN(d.getTime())) {
        return Date.now() >= d.getTime();
      }
    } catch {}
    return true;
  };

  // Helper to format scheduled opening time
  const formatExamSchedule = (exam: Exam) => {
    if (exam.mode === 'mode_1') {
      return 'Mọi lúc (Tự do)';
    }
    const openStr = exam.openAt || exam.openTime;
    if (!openStr) return 'Ấn định ngày mở';
    try {
      const d = new Date(openStr);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${hh}:${min}:${ss} ngày ${dd}/${mm}/${yyyy}`;
      }
    } catch {}
    return `Mở: ${openStr}`;
  };

  // State xác nhận xóa đề thi
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  // Helper tính Top 1, 2, 3 xếp hạng cúp cho từng đề kiểm tra thường xuyên
  const getTop3ForExam = (examId: string): StudentSubmission[] => {
    const list = submissions.filter(s => s.examId === examId);
    if (list.length === 0) return [];
    return [...list].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.timeSpentSeconds - b.timeSpentSeconds;
    }).slice(0, 3);
  };

  // Tạo đề kiểm tra mới với 3 tính năng (Thủ công / AI / Tải file) - Dành cho Quản trị viên
  const handleOpenCreateExam = () => {
    if (!isTeacherAdmin(currentUser)) {
      return;
    }
    setShowCreateExamModal(true);
  };

  // Lưu đề thi mới được tạo từ CreateExamModal (Sắp xếp đề mới tạo gần nhất hiển thị đầu tiên)
  const handleSaveNewCreatedExam = (newExam: Exam) => {
    setExams((prev) => {
      const exists = prev.some((ex) => ex.id === newExam.id);
      const next = exists 
        ? prev.map((ex) => (ex.id === newExam.id ? newExam : ex))
        : [newExam, ...prev];

      // Sắp xếp đề mới tạo gần nhất hiển thị đầu tiên (từ mới nhất đến cũ nhất)
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

    // Tự động phát thông báo lịch kiểm tra khi giáo viên cập nhật đề sắp diễn ra kiểm tra (Chế độ 2 - ấn định ngày mở)
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
        contentNote: `Giáo viên bộ môn đã cập nhật lịch kiểm tra đề "${newExam.title}". Đề kiểm tra sẽ chính thức diễn ra lúc ${examTime} ngày ${examDate}. Các em chú ý ôn tập và đăng nhập đúng giờ để làm bài.`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên bộ môn KHTN'
      };
      handleSendNotification(notif);
    }

    setShowCreateExamModal(false);
  };

  // Xóa đề kiểm tra khỏi hệ thống - Dành cho Quản trị viên (Đồng bộ hóa chính xác, xóa triệt để không để tái xuất hiện)
  const handleDeleteExam = (examId: string) => {
    // 1. Lưu lại ID đề đã xóa vào ydon_deleted_exam_ids để ngăn tái xuất hiện hoàn toàn
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('ydon_deleted_exam_ids') || '[]');
      if (!deletedIds.includes(examId)) {
        deletedIds.push(examId);
        localStorage.setItem('ydon_deleted_exam_ids', JSON.stringify(deletedIds));
      }
    } catch {}

    // 2. Xóa hẳn phần tử ra khỏi mảng state và đồng bộ ngay lập tức vào localStorage
    setExams((prev) => {
      const next = prev.filter((ex) => ex.id !== examId);
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      // 3. Đồng bộ xóa lên máy chủ trung tâm
      fetch('/api/sync/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: next, replace: true })
      }).catch(console.error);
      return next;
    });

    // 4. Nếu có thông báo lịch kiểm tra liên quan đến đề này, xóa luôn khỏi danh sách thông báo
    handleDeleteNotification(`notif-exam-${examId}`);

    setEditingExam(null);
    setExamToDelete(null);
  };

  // Lưu kết quả bài làm học sinh được chấm tự động qua Camera OMR Scanner (Dành riêng cho Kiểm tra định kỳ - Giữa kỳ & Cuối kỳ)
  const handleSaveGradedSubmissionFromCamera = (newSub: StudentSubmission) => {
    const saved = localStorage.getItem('ydon_periodic_submissions');
    let currentPeriodic: StudentSubmission[] = [];
    if (saved) {
      try { currentPeriodic = JSON.parse(saved); } catch (e) {}
    }
    const next = [newSub, ...currentPeriodic];
    localStorage.setItem('ydon_periodic_submissions', JSON.stringify(next));
    fetch('/api/sync/periodic-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions: [newSub] })
    }).catch(console.error);
  };

  // Save edited exam từ modal chỉnh sửa - chỉ Admin mới được thao tác
  const handleSaveEditedExam = (updatedExam: Exam) => {
    if (currentUser?.role !== 'admin') {
      setEditingExam(null);
      setIsCreatingExam(false);
      return;
    }
    setExams((prev) => {
      const exists = prev.some((ex) => ex.id === updatedExam.id);
      const next = exists 
        ? prev.map((ex) => (ex.id === updatedExam.id ? updatedExam : ex))
        : [updatedExam, ...prev];
      // Sắp xếp đề mới tạo gần nhất hiển thị đầu tiên
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

      // Chấm lại toàn bộ bài nộp học sinh của đề thi vừa chỉnh sửa đáp án và cập nhật điểm
      setSubmissions((prevSubs) => {
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
      handleSendNotification(notif);
    }

    setEditingExam(null);
    setIsCreatingExam(false);
  };

  // Quản trị viên bấm nút "Chấm điểm lại" cho đề kiểm tra thường xuyên
  const handleRegradeExam = async (targetExam: Exam) => {
    if (!isTeacherAdmin(currentUser)) {
      alert('Chỉ Giáo viên Quản trị mới có quyền chấm điểm lại!');
      return;
    }

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

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: newSubmissions })
      });
    } catch (err) {
      console.error('Lỗi đồng bộ submissions:', err);
    }

    alert(`✅ ĐÃ CHẤM ĐIỂM LẠI THÀNH CÔNG!\n\nĐã chấm lại toàn bộ ${relatedSubmissions.length} bài làm của học sinh cho đề "${targetExam.title}".\nSố bài có điểm thay đổi: ${changedCount}.\nToàn bộ điểm số (Trắc nghiệm, Đúng/Sai, Điền ngắn) của từng học sinh đã được cập nhật mới nhất vào hệ thống!`);
  };

  // Giáo viên mở lại đề kiểm tra khi cần thiết (sau khi đã hết giờ)
  const handleReopenExam = (examId: string, additionalMinutes: number = 15) => {
    if (!isTeacherAdmin(currentUser)) {
      alert('Chỉ Giáo viên Quản trị mới có quyền mở lại đề thi!');
      return;
    }
    const target = exams.find(e => e.id === examId);
    if (!target) return;

    const reopened = reopenExamWithDuration(target, additionalMinutes);
    setExams((prev) => {
      const next = prev.map((ex) => (ex.id === examId ? reopened : ex));
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

    // Phát thông báo mở lại đề thi
    const openD = new Date(reopened.openAt!);
    const examTime = `${String(openD.getHours()).padStart(2, '0')}:${String(openD.getMinutes()).padStart(2, '0')}`;
    const examDate = openD.toISOString().substring(0, 10);
    const notif: ExamReminderNotification = {
      id: `notif-exam-${examId}`,
      title: `⚡ Mở lại đề thi: ${reopened.title}`,
      targetClass: `Khối ${reopened.grade}`,
      grade: reopened.grade,
      subject: reopened.subject,
      examDate,
      examTime,
      examTitle: reopened.title,
      durationMinutes: additionalMinutes,
      contentNote: `Giáo viên bộ môn đã gia hạn mở lại đề kiểm tra "${reopened.title}" trong vòng ${additionalMinutes} phút (từ ${examTime} ngày ${examDate}). Các em học sinh chưa kịp hoàn thành hãy nhanh chóng vào làm bài!`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên bộ môn KHTN'
    };
    handleSendNotification(notif);
    alert(`Đã mở lại đề kiểm tra "${reopened.title}" thêm ${additionalMinutes} phút thành công!`);
  };

  // Update School Year handler
  const handleUpdateSchoolYear = (newYear: string) => {
    setSystemConfig((prev) => {
      const updated = { ...prev, schoolYear: newYear };
      localStorage.setItem('ydon_system_config', JSON.stringify(updated));
      return updated;
    });
  };

  // Auth Login success handler
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('ydon_user_session', JSON.stringify(user));
    if (user.role === 'admin') {
      if (!user.name.startsWith('QTV-') && !user.name.startsWith('TT ')) {
        const rawName = user.adminName || user.name.replace(/^Quản trị viên \((.*?)\)$/, '$1').replace(/^Quản trị viên$/, 'Thầy Nguyễn Đình Hành');
        user.name = `QTV-${rawName}`;
      }
      setActiveTab('admin');
    } else {
      if (user.name) setEntryStudentName(user.name);
      if (user.className) setEntryClassName(user.className);

      if (user.role === 'guest') {
        setGuestNoticeState({
          isOpen: true,
          name: user.name,
          className: user.className || ''
        });
      } else if (user.role === 'student') {
        // Tự động kiểm tra lịch kiểm tra giáo viên đã lên lịch và hiển thị thông báo ngay khi học sinh đăng nhập app
        const schedule = getScheduledInfoForUser(user.className, user.grade);
        if (schedule) {
          setStudentScheduleNotice({
            isOpen: true,
            studentName: user.name,
            className: user.className || '',
            ...schedule
          });
        }
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ydon_user_session');
    if (activeTab === 'admin') {
      setActiveTab('kttx');
    }
  };

  // Add new exemplary post
  const handleAddExemplaryPost = (newPost: ExemplaryPost) => {
    setExemplaryPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem('ydon_exemplary_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateExemplaryPost = (updatedPost: ExemplaryPost) => {
    setExemplaryPosts((prev) => {
      const updated = prev.map(p => p.id === updatedPost.id ? updatedPost : p);
      localStorage.setItem('ydon_exemplary_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteExemplaryPost = (id: string) => {
    setExemplaryPosts((prev) => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('ydon_exemplary_posts', JSON.stringify(updated));
      return updated;
    });
  };

  // Learning resource management (Save & Delete)
  const handleSaveResource = (res: LearningResource) => {
    setLearningResources((prev) => {
      const exists = prev.some(r => r.id === res.id);
      const updated = exists ? prev.map(r => r.id === res.id ? res : r) : [res, ...prev];
      localStorage.setItem('ydon_learning_resources', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteResource = (id: string) => {
    setLearningResources((prev) => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('ydon_learning_resources', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered Exams (Sắp xếp đề mới tạo gần nhất hiển thị đầu tiên)
  const filteredExams = useMemo(() => {
    const list = exams.filter((exam) => {
      if (selectedSubject !== 'all' && exam.subject !== selectedSubject) return false;
      if (selectedGrade !== 'all' && exam.grade.toString() !== selectedGrade) return false;
      if (selectedTestNumber !== 'all') {
        if (exam.testNumber && exam.testNumber !== selectedTestNumber) return false;
        if (!exam.testNumber && !exam.title.toLowerCase().includes(selectedTestNumber.toLowerCase())) return false;
      }
      if (searchQuery.trim() && !exam.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Sắp xếp các đề kiểm tra theo thứ tự Đề mới tạo gần nhất hiển thị đầu tiên (mới nhất đến cũ nhất)
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [exams, selectedSubject, selectedGrade, selectedTestNumber, searchQuery]);

  // Student starts exam
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForEntry) return;

    if (!entryStudentName.trim()) {
      setEntryError('Vui lòng nhập họ và tên học sinh.');
      return;
    }

    // Kiểm tra danh sách học sinh toàn trường THCS Y Đôn
    // HS không thuộc DS HS trong trường thì chỉ là khách chỉ xem, không tương tác làm bài
    const rosterCheck = checkStudentInSchoolRoster(entryStudentName, entryClassName, students);
    if (!rosterCheck.isEnrolled && currentUser?.role !== 'admin') {
      // Mark session as guest
      const guestSession: UserSession = {
        id: `guest-${Date.now()}`,
        role: 'guest',
        name: entryStudentName.trim(),
        className: entryClassName.trim()
      };
      setCurrentUser(guestSession);
      localStorage.setItem('ydon_user_session', JSON.stringify(guestSession));

      setSelectedExamForEntry(null);
      setGuestNoticeState({
        isOpen: true,
        name: entryStudentName.trim(),
        className: entryClassName.trim()
      });
      return;
    }

    // Kiểm tra trạng thái thời gian mở đề và hết giờ thi (Quy tắc bắt buộc)
    const schedStatus = getExamScheduleStatus(selectedExamForEntry);
    if (schedStatus.isExpired && currentUser?.role !== 'admin') {
      setEntryError(`BÁO CÁO HẾT GIỜ: Đề kiểm tra đã kết thúc thời gian làm bài lúc ${schedStatus.closeTimeFormatted}. Hệ thống đã tự động đóng chế độ mở. Học sinh không được phép vào thi sau khi đã hết giờ.`);
      return;
    }
    if (schedStatus.isUpcoming && currentUser?.role !== 'admin') {
      setEntryError(`Chưa đến thời gian mở đề! Đề kiểm tra bắt đầu lúc ${schedStatus.openTimeFormatted}. Vui lòng quay lại đúng giờ.`);
      return;
    }

    setActiveExamToTake(selectedExamForEntry);
    setSelectedExamForEntry(null);
    setEntryError('');
    setEntryExamPassword('');
  };

  // Handle student submitting exam
  const handleSubmitExam = (submissionData: StudentSubmission) => {
    setSubmissions((prev) => {
      const updated = [submissionData, ...prev];
      localStorage.setItem('ydon_submissions', JSON.stringify(updated));
      fetch('/api/sync/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: [submissionData] })
      }).catch(console.error);
      return updated;
    });

    setActiveExamToTake(null);

    const targetExam = exams.find(e => e.id === submissionData.examId);
    if (targetExam) {
      setReviewSubmission({
        submission: submissionData,
        exam: targetExam
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
      
      {/* 1. TOP HEADER with official logo, school year dropdown, student/admin login & multi-device sync */}
      <Header
        systemConfig={systemConfig}
        onUpdateSchoolYear={handleUpdateSchoolYear}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onLogout={handleLogout}
        onSyncNow={() => syncWithServer(true)}
        syncStatus={syncStatus}
        onOpenInstallApp={() => setShowInstallModal(true)}
        onOpenReminders={() => setShowReminderModal(true)}
        unreadReminderCount={notifications.length}
        onOpenSyncRestore={() => setShowSyncRestoreModal(true)}
      />

      {/* 1b. DÒNG CHỮ CHẠY NỔI BẬT THEO YÊU CẦU:
             - Vị trí: Vùng trắng giữa hai nền xanh đầu trang (vùng trắng dưới logo trường)
             - Kiểu chữ: Times New Roman, in đậm
             - Màu sắc: Chữ màu đỏ, nền vàng
             - Hướng chạy: Chậm từ phải sang trái (RTL), lặp lại liên tục
      */}
      <div className="w-full bg-white py-2 px-2 sm:px-4 border-b border-slate-200 shadow-2xs">
        <div 
          id="school-marquee-banner"
          className="max-w-7xl mx-auto bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 border-2 border-amber-400 rounded-xl py-1.5 shadow-xs overflow-hidden select-none"
          aria-label="Khẩu hiệu đổi mới sáng tạo tổ Lí-Hóa-Sinh-CN trường THCS và THPT Y Đôn"
        >
          <div className="animate-marquee-rtl flex items-center whitespace-nowrap will-change-transform">
            {Array.from({ length: 8 }).map((_, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center text-red-600 font-times font-bold text-xs sm:text-sm md:text-base tracking-wide px-4 shrink-0"
              >
                <span className="text-amber-700 mr-2 text-xs">★</span>
                Tổ Lí-Hóa-Sinh-CN trường THCS và THPT Y Đôn luôn đổi mới, sáng tạo trong giảng dạy và kiểm tra, đánh giá
                <span className="text-amber-700 ml-2 text-xs">★</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 1c. DÒNG THÔNG BÁO LỊCH KIỂM TRA KHI GIÁO VIÊN CẬP NHẬT ĐỀ SẮP DIỄN RA KIỂM TRA */}
      {activeScheduledBanner && !dismissedScheduleBar && (
        <div 
          id="student-scheduled-exam-alert-bar"
          className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white py-2 px-3 sm:px-6 shadow-md border-b-2 border-amber-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1"
        >
          <div 
            onClick={() => setShowReminderModal(true)}
            className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            title="Bấm để xem đầy đủ chi tiết lịch kiểm tra và dặn dò của Thầy/Cô"
          >
            <div className="flex items-center gap-1.5 shrink-0 bg-yellow-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] tracking-wide uppercase shadow-xs">
              <Bell className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
              <span>THÔNG BÁO LỊCH KIỂM TRA</span>
            </div>
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="font-bold text-yellow-200 truncate">
                {activeScheduledBanner.title}
              </span>
              <span className="hidden sm:inline text-white/70">•</span>
              <span className="hidden sm:inline bg-black/25 px-2 py-0.5 rounded text-[11px] font-mono text-amber-200">
                {activeScheduledBanner.targetClass}
              </span>
              <span className="text-white/70">•</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded text-[11px]">
                {activeScheduledBanner.scheduleTime}
              </span>
              {activeScheduledBanner.note && (
                <span className="hidden md:inline text-amber-100 italic truncate max-w-sm">
                  — Dặn dò: {activeScheduledBanner.note}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowReminderModal(true)}
              className="px-3 py-1 bg-white hover:bg-yellow-100 text-slate-900 font-black rounded-lg text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Xem chi tiết →
            </button>
            <button
              type="button"
              onClick={() => setDismissedScheduleBar(true)}
              className="p-1 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-colors cursor-pointer"
              title="Ẩn dòng thông báo tạm thời"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. BLUE BANNER BOX ("BẢNG MÀU XANH ĐÓ"):
             - Placed right under Header, above "Nhiệm vụ HS"
             - Contains full system title, subject buttons, and score board button
      */}
      <section 
        id="top-blue-system-banner"
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
        aria-label="Hệ thống học tập và kiểm tra trực tuyến"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-xl border border-blue-900/60">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left circular motif */}
            <div className="hidden sm:flex items-center gap-4 shrink-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-amber-500/20 border border-blue-400/40 flex items-center justify-center p-2 shadow-inner">
                <AtomGraphic className="w-16 h-16 text-cyan-300 animate-spin-slow" />
              </div>
            </div>

            {/* Center: System Titles, Standard Pill & Subject Buttons */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/40 text-blue-200 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-wider">
                  THCS & THPT Y ĐÔN
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3" />
                  Chương trình GDPT 2018
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight uppercase">
                  {systemConfig.appName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
                  Cổng học tập, tư liệu giảng dạy & khảo thí trực tuyến môn Khoa học Tự nhiên các khối 6, 7, 8, 9 theo định hướng phát triển phẩm chất và năng lực.
                </p>
              </div>

              {/* 18-question standard pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full border border-white/15 text-[11px] font-semibold text-amber-300 flex-wrap justify-center lg:justify-start">
                <span>⭐ Chuẩn đề 18 câu: 16 trắc nghiệm 4 lựa chọn (8.0đ) • 1 Đúng/Sai 4 ý (1.0đ) • 1 trả lời ngắn (1.0đ)</span>
              </div>

              {/* 4 Interactive Buttons for Subjects + Bảng điểm KTTX */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                
                {/* 1. Vật lí */}
                <button
                  id="blue-banner-physics"
                  onClick={() => {
                    setActiveTab('kttx');
                    setSelectedSubject('physics');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                    activeTab === 'kttx' && selectedSubject === 'physics'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-[1.03]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Atom className="w-4 h-4 text-blue-400" />
                  <span>Phân môn Vật lí</span>
                </button>

                {/* 2. Hóa học */}
                <button
                  id="blue-banner-chemistry"
                  onClick={() => {
                    setActiveTab('kttx');
                    setSelectedSubject('chemistry');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                    activeTab === 'kttx' && selectedSubject === 'chemistry'
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 scale-[1.03]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-amber-400" />
                  <span>Phân môn Hóa học</span>
                </button>

                {/* 3. Sinh học */}
                <button
                  id="blue-banner-biology"
                  onClick={() => {
                    setActiveTab('kttx');
                    setSelectedSubject('biology');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                    activeTab === 'kttx' && selectedSubject === 'biology'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-[1.03]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Dna className="w-4 h-4 text-emerald-400" />
                  <span>Phân môn Sinh học</span>
                </button>

                {/* 4. Cả 3 phân môn */}
                <button
                  id="blue-banner-all"
                  onClick={() => {
                    setActiveTab('kttx');
                    setSelectedSubject('all');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                    activeTab === 'kttx' && selectedSubject === 'all'
                      ? 'bg-white text-slate-900 ring-2 ring-white scale-[1.03]'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Cả 3 phân môn</span>
                </button>

                {/* 5. Bảng điểm KTTX */}
                <button
                  id="blue-banner-scoreboard-btn"
                  onClick={() => setShowScoreboardModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all cursor-pointer border border-emerald-400/50"
                >
                  <TableProperties className="w-4 h-4" />
                  <span>Bảng điểm KTTX</span>
                </button>

                {/* 5b. Up Bảng Điểm Lên (Excel / JSON / Dán) - Chỉ Giáo viên Quản trị */}
                {isTeacherAdmin(currentUser) && (
                  <button
                    id="blue-banner-upload-scoreboard-btn"
                    onClick={() => setShowSyncRestoreModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md transition-all cursor-pointer border border-amber-300 ring-2 ring-amber-300/50"
                    title="Tải lên bảng điểm từ file Excel, JSON hoặc dán trực tiếp để hệ thống cập nhật kết quả (Dành riêng cho Admin)"
                  >
                    <Upload className="w-4 h-4 text-slate-950" />
                    <span>Up Bảng Điểm Lên</span>
                  </button>
                )}

                {/* 6. Chấm bài bằng Camera (OMR Scanner) dành cho KT Định Kỳ - Chỉ Giáo viên Quản trị */}
                {isTeacherAdmin(currentUser) && (
                  <button
                    id="blue-banner-camera-scanner-btn"
                    onClick={() => setShowCameraOMRModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer border border-indigo-400/40"
                    title="Chấm bài thi trắc nghiệm Kiểm tra định kỳ (KTĐK) bằng Camera OMR (Dành riêng cho Admin)"
                  >
                    <Camera className="w-4 h-4 text-emerald-300" />
                    <span>Chấm Camera KTĐK</span>
                  </button>
                )}

                {/* 7. In Phiếu trả lời trắc nghiệm chuẩn KT Định Kỳ */}
                <button
                  id="blue-banner-print-sheet-btn"
                  onClick={() => setShowPrintSheetModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  title="Xem và In Mẫu phiếu trắc nghiệm Kiểm tra định kỳ (KTĐK) chuẩn khổ A4"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Phiếu Thi KTĐK (In)</span>
                </button>

                {/* 8. Trộn Đề Kiểm Tra Định Kỳ (từ 2 đề gốc thành 1 - 6 mã đề) - Chỉ Giáo viên Quản trị */}
                {isTeacherAdmin(currentUser) && (
                  <button
                    id="blue-banner-periodic-mixer-btn"
                    onClick={() => setShowPeriodicMixerModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer border border-amber-300 font-sans"
                    title="Trộn đề kiểm tra định kỳ: Xuất file Word mẫu 2 đề, nạp file và trộn thành 1 - 6 mã đề kèm bảng đáp án (Dành riêng cho Admin)"
                  >
                    <Shuffle className="w-4 h-4 text-slate-950" />
                    <span>Trộn Đề Định Kỳ</span>
                  </button>
                )}

              </div>
            </div>

            {/* Right visual card */}
            <div className="hidden xl:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0 text-center space-y-1.5">
              <DnaGraphic className="w-12 h-12 text-emerald-300 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-200 max-w-[130px] leading-tight block">
                Khoa học Tự nhiên trong kỷ nguyên vươn mình
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PHẦN NỀN TRẮNG CỦA APP (DIVIDED INTO 2 SECTIONS BY A CLEAR VERTICAL LINE):
             - Left 1/5: "NHIỆM VỤ HỌC TẬP" column with 8 compact folder items
             - Clear Vertical Divider Line down to the end
             - Right 4/5: All exams & main view without empty space or overlapping
      */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
          
          <div className="flex flex-col lg:flex-row items-start gap-6 relative">
            
            {/* PHẦN BÊN TRÁI VẠCH PHÂN CÁCH: Thu gọn bề ngang về bên trái vừa vặn bao lấy tên các nút */}
            <div 
              id="sidebar-left-1-5th"
              className="w-full lg:w-[178px] shrink-0 space-y-4"
            >
              <StudentTasksMenu
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                examCount={exams.length}
                exemplaryCount={exemplaryPosts.length}
              />
            </div>

            {/* VẠCH PHÂN CÁCH DỌC RÕ RÀNG XUỐNG ĐẾN CUỐI APP */}
            <div 
              id="layout-vertical-divider"
              className="hidden lg:block w-[1.5px] bg-slate-300 self-stretch my-1 shrink-0" 
              aria-hidden="true"
            />

            {/* PHẦN BÊN PHẢI VẠCH PHÂN CÁCH: 4/5 BỀ NGANG GIAO DIỆN (80%) */}
            <main 
              id="main-right-4-5ths"
              className="w-full lg:flex-1 min-w-0 space-y-5"
            >
              
              {/* VIEW 1: KIỂM TRA THƯỜNG XUYÊN (KTTX) */}
              {activeTab === 'kttx' && (
                <div id="kttx-main-view" className="space-y-4">
                  
                  {/* Header Box styled like in reference image */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
                          KHẢO THÍ ĐỊNH KỲ & THƯỜNG XUYÊN
                        </span>
                        <span className="text-xs text-blue-200">
                          Năm học {systemConfig.schoolYear}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                        HỆ THỐNG KIỂM TRA & ÔN TẬP KHOA HỌC TỰ NHIÊN
                      </h2>
                      <p className="text-xs text-slate-300 font-normal">
                        Đánh giá năng lực học sinh theo chuẩn ma trận 18 câu (16 trắc nghiệm + 1 đúng/sai + 1 trả lời ngắn).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block font-mono text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                        {filteredExams.length} đề thi sẵn sàng
                      </span>

                      {/* Nút Xem & In Mẫu Phiếu Trả Lời Trắc Nghiệm KT Định Kỳ Chuẩn A4 */}
                      <button
                        type="button"
                        id="btn-print-answer-sheet-header"
                        onClick={() => setShowPrintSheetModal(true)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                        title="Xem và In Mẫu phiếu trắc nghiệm Kiểm tra định kỳ (KTĐK) chuẩn khổ A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-300" />
                        <span>Phiếu KTĐK (In)</span>
                      </button>

                      {/* Nút Chấm Bài Trắc Nghiệm KT Định Kỳ Qua Camera - Chỉ Giáo viên Quản trị */}
                      {isTeacherAdmin(currentUser) && (
                        <button
                          type="button"
                          id="btn-camera-scanner-header"
                          onClick={() => setShowCameraOMRModal(true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          title="Chấm bài trắc nghiệm Kiểm tra định kỳ (KTĐK) tự động bằng Camera OMR (Dành riêng cho Admin)"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Chấm Camera KTĐK</span>
                        </button>
                      )}

                      {/* Nút Trộn Đề Kiểm Tra Định Kỳ (tạo 1 đến 6 mã đề từ 2 đề gốc) - Chỉ Giáo viên Quản trị */}
                      {isTeacherAdmin(currentUser) && (
                        <button
                          type="button"
                          id="btn-periodic-mixer-header"
                          onClick={() => setShowPeriodicMixerModal(true)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          title="Trộn đề kiểm tra định kỳ: Tải file Word mẫu 2 đề, tạo 1 - 6 mã đề kèm bảng đáp án (Dành riêng cho Admin)"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-slate-950" />
                          <span>Trộn Đề Định Kỳ</span>
                        </button>
                      )}

                      {/* Tạo Đề Mới - Chỉ dành cho Giáo viên Quản trị (Admin) */}
                      {isTeacherAdmin(currentUser) && (
                        <button
                          type="button"
                          id="btn-admin-create-exam-header"
                          onClick={handleOpenCreateExam}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          title="Tạo đề kiểm tra mới: Thủ công / AI / Up file (Dành riêng cho Admin)"
                        >
                          <Plus className="w-4 h-4 text-slate-900 stroke-[3]" />
                          <span>+ Tạo Đề Mới (Admin)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner Thông báo Lịch kiểm tra cho học sinh */}
                  {notifications.length > 0 && (
                    <div 
                      onClick={() => setShowReminderModal(true)}
                      className="p-3 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-400/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/50 transition-colors shadow-xs"
                      title="Nhấp để xem chi tiết lịch kiểm tra và dặn dò của giáo viên"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Bell className="w-4 h-4 animate-bounce" />
                        </div>
                        <div className="leading-tight truncate">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.2 rounded font-mono">
                              LỊCH KIỂM TRA SẮP TỚI
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {notifications[0].title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            Áp dụng: {notifications[0].targetClass === 'all' ? 'Tất cả các lớp' : `Lớp ${notifications[0].targetClass}`} • Ngày: {notifications[0].examDate} ({notifications[0].examTime || '08:00'}) • {notifications[0].createdBy}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300">
                        Xem chi tiết ({notifications.length}) →
                      </span>
                    </div>
                  )}

                  {/* Filter & Search Bar matching reference image */}
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    
                    {/* Row 1: Khối lớp & Đề KT */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      
                      {/* Khối lớp filter */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-700 uppercase tracking-wider mr-1 text-[11px]">
                          KHỐI LỚP:
                        </span>
                        {['all', '6', '7', '8', '9'].map((g) => (
                          <button
                            key={g}
                            id={`filter-grade-${g}`}
                            onClick={() => setSelectedGrade(g)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              selectedGrade === g
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {g === 'all' ? 'Tất cả khối' : `Khối ${g}`}
                          </button>
                        ))}
                      </div>

                      {/* Đề KT filter: Đề 1 đến Đề 8 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-700 uppercase tracking-wider mr-1 text-[11px]">
                          ĐỀ KIỂM TRA:
                        </span>
                        {['all', 'TX1', 'TX2', 'TX3', 'TX4', 'TX5', 'TX6', 'TX7', 'TX8'].map((t) => (
                          <button
                            key={t}
                            id={`filter-test-${t}`}
                            onClick={() => setSelectedTestNumber(t)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              selectedTestNumber === t
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {t === 'all' ? 'Tất cả đề' : t.replace('TX', 'Đề ')}
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* Row 2: Phân môn & Search input */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                      
                      {/* Subject filters */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-700 uppercase tracking-wider mr-1 text-[11px]">
                          PHÂN MÔN:
                        </span>
                        {[
                          { id: 'all', label: 'Tất cả môn' },
                          { id: 'physics', label: 'Vật lí' },
                          { id: 'chemistry', label: 'Hóa học' },
                          { id: 'biology', label: 'Sinh học' }
                        ].map((s) => (
                          <button
                            key={s.id}
                            id={`filter-subject-${s.id}`}
                            onClick={() => setSelectedSubject(s.id as SubjectType)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              selectedSubject === s.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Search box & Admin create exam button */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm đề kiểm tra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
                          />
                        </div>

                        {isTeacherAdmin(currentUser) && (
                          <button
                            type="button"
                            id="btn-admin-create-exam-filter"
                            onClick={handleOpenCreateExam}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                            title="Tạo đề kiểm tra mới (Admin)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tạo Đề Mới</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* 3-COLUMN EXAM CARDS GRID:
                      - All exams brought up without empty space
                      - Fully responsive (1 col on mobile, 2 on tablet, 3 on desktop)
                  */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredExams.length === 0 ? (
                      <div className="col-span-full bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                          <CalendarClock className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                          Chưa có đề kiểm tra ấn định lịch trong danh mục này
                        </h3>
                        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                          Hệ thống đã dọn dẹp tất cả các đề tự tạo trước ngày 15/10/2026 và các đề mở tự do theo yêu cầu.
                          {isTeacherAdmin(currentUser) 
                            ? ' Thầy/Cô Quản trị viên vui lòng bấm "+ Tạo Đề Mới" ở trên để thiết lập đề kiểm tra có ấn định thời gian mở đề.'
                            : ' Học sinh vui lòng theo dõi thông báo lịch kiểm tra từ Thầy/Cô để biết thời gian mở bài thi sắp diễn ra.'}
                        </p>
                        {isTeacherAdmin(currentUser) && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleOpenCreateExam}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition-transform cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Tạo Đề Mới Có Ấn Định Giờ Mở (Admin)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredExams.map((exam) => {
                        const subjectLabel = 
                          exam.subject === 'physics' ? 'Vật lí' :
                          exam.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
                        
                        const subjectColor = 
                          exam.subject === 'physics' ? 'bg-blue-100 text-blue-800' :
                          exam.subject === 'chemistry' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

                        return (
                          <div
                            key={exam.id}
                            id={`exam-card-${exam.id}`}
                            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                          >
                            <div className="space-y-2.5">
                              {/* Card Header: Subject, Grade & Test Number */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${subjectColor}`}>
                                    {subjectLabel} • Lớp {exam.grade}
                                  </span>
                                  {exam.testNumber && (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                      {exam.testNumber.startsWith('TX') ? exam.testNumber.replace('TX', 'Đề ') : exam.testNumber}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  {exam.durationMinutes}p
                                </span>
                              </div>

                              {/* Exam Title */}
                              <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                                {exam.title}
                              </h3>

                              {/* Matrix pill breakdown */}
                              <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 pt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">16 TN (8.0đ)</span>
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">1 Đ/S (1.0đ)</span>
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">1 TLN (1.0đ)</span>
                              </div>

                              {/* Top 1, 2, 3 Cúp Vàng - Bạc - Đồng của đề thi */}
                              {(() => {
                                const top3 = getTop3ForExam(exam.id);
                                if (top3.length === 0) return null;
                                return (
                                  <div className="p-2 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl border border-amber-200 space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-950 uppercase tracking-wide">
                                      <span className="flex items-center gap-1">
                                        <Award className="w-3 h-3 text-amber-600" />
                                        Xếp hạng Cúp Top 1, 2, 3:
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {top3[0] && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-950 font-bold rounded border border-amber-300 text-[10px]">
                                          🏆 {top3[0].studentName} ({top3[0].totalScore}đ)
                                        </span>
                                      )}
                                      {top3[1] && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-800 font-bold rounded border border-slate-300 text-[10px]">
                                          🥈 {top3[1].studentName} ({top3[1].totalScore}đ)
                                        </span>
                                      )}
                                      {top3[2] && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-950 font-bold rounded border border-orange-300 text-[10px]">
                                          🥉 {top3[2].studentName} ({top3[2].totalScore}đ)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Card Footer: Action & Mode */}
                            <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                              {(() => {
                                const schedStatus = getExamScheduleStatus(exam);
                                return (
                                  <>
                                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        schedStatus.status === 'open'
                                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                                          : schedStatus.status === 'expired'
                                          ? 'text-rose-700 bg-rose-50 border-rose-300'
                                          : 'text-amber-800 bg-amber-50 border-amber-300'
                                      }`}>
                                        {schedStatus.badgeLabel} • {schedStatus.status === 'open' ? `Còn ~${schedStatus.remainingMinutes} phút` : schedStatus.status === 'expired' ? `Hết giờ: ${schedStatus.closeTimeFormatted}` : `Mở: ${schedStatus.openTimeFormatted}`}
                                      </span>

                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* Nút Chấm điểm lại, Chỉnh sửa đề & Xóa đề - Chỉ Giáo viên Quản trị (Admin) mới thao tác được */}
                                        {isTeacherAdmin(currentUser) && (
                                          <>
                                            <button
                                              type="button"
                                              id={`regrade-exam-btn-${exam.id}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRegradeExam(exam);
                                              }}
                                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-amber-300"
                                              title="Chấm lại toàn bộ bài làm của học sinh theo đáp án mới nhất của đề này"
                                            >
                                              <RefreshCw className="w-3 h-3 text-amber-700" />
                                              <span>Chấm điểm lại</span>
                                            </button>
                                            <button
                                              type="button"
                                              id={`edit-exam-btn-${exam.id}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingExam(exam);
                                              }}
                                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                                              title="Chỉnh sửa thông tin, chế độ mở và câu hỏi của đề này (Dành riêng cho Quản trị viên)"
                                            >
                                              <Edit3 className="w-3 h-3 text-blue-600" />
                                              <span>Sửa đề</span>
                                            </button>
                                            <button
                                              type="button"
                                              id={`delete-exam-btn-${exam.id}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExamToDelete(exam);
                                              }}
                                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                                              title="Xóa đề kiểm tra này khỏi hệ thống"
                                            >
                                              <Trash2 className="w-3 h-3 text-rose-600" />
                                              <span>Xóa đề</span>
                                            </button>
                                          </>
                                        )}

                                        {/* Nút Làm bài / Báo cáo hết giờ / Mở lại đề */}
                                        {schedStatus.status === 'open' ? (
                                          <button
                                            type="button"
                                            id={`start-exam-btn-${exam.id}`}
                                            onClick={() => {
                                              if (currentUser?.role === 'guest') {
                                                setGuestNoticeState({
                                                  isOpen: true,
                                                  name: currentUser.name,
                                                  className: currentUser.className || ''
                                                });
                                                return;
                                              }
                                              setSelectedExamForEntry(exam);
                                              setEntryError('');
                                              if (currentUser?.name) setEntryStudentName(currentUser.name);
                                              if (currentUser?.className) setEntryClassName(currentUser.className);
                                            }}
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                                          >
                                            <Play className="w-3 h-3 fill-current" />
                                            <span>Làm bài</span>
                                          </button>
                                        ) : schedStatus.status === 'expired' ? (
                                          <div className="flex items-center gap-1">
                                            {isTeacherAdmin(currentUser) ? (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleReopenExam(exam.id, 15);
                                                }}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                                                title="Giáo viên mở lại đề thi thêm 15 phút"
                                              >
                                                <RotateCcw className="w-3 h-3" />
                                                <span>Mở lại đề (+15p)</span>
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 bg-slate-200 text-slate-500 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-slate-300 cursor-not-allowed"
                                                title="Đề kiểm tra đã hết giờ làm bài, học sinh không thể vào thi"
                                              >
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span>Đã hết giờ</span>
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedExamForEntry(exam);
                                              setEntryError('');
                                            }}
                                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                                            title="Chưa đến giờ mở đề thi"
                                          >
                                            <Clock className="w-3 h-3" />
                                            <span>Chưa đến giờ</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Dòng báo cáo hết giờ tự động */}
                                    {schedStatus.status === 'expired' && (
                                      <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 font-semibold flex items-center justify-between">
                                        <span>⚠️ BÁO CÁO HẾT GIỜ: Đã đóng đề lúc {schedStatus.closeTimeFormatted}.</span>
                                        {isTeacherAdmin(currentUser) && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReopenExam(exam.id, 30);
                                            }}
                                            className="text-emerald-700 hover:underline font-bold ml-1 cursor-pointer"
                                          >
                                            [Gia hạn 30p]
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

              {/* VIEW 2: GÓC HỌC TẬP */}
              {activeTab === 'study_corner' && (
                <LearningResourcesView
                  category="study_corner"
                  resources={learningResources}
                  currentUser={currentUser}
                  onSaveResource={handleSaveResource}
                  onDeleteResource={handleDeleteResource}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 3: BÀI TẬP VỀ NHÀ */}
              {activeTab === 'homework' && (
                <HomeworkView 
                  currentUser={currentUser}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 4: HƯỚNG DẪN SOẠN BÀI */}
              {activeTab === 'prep_guide' && (
                <LearningResourcesView
                  category="prep_guide"
                  resources={learningResources}
                  currentUser={currentUser}
                  onSaveResource={handleSaveResource}
                  onDeleteResource={handleDeleteResource}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 5: SẢN PHẨM SỐ */}
              {activeTab === 'digital_products' && (
                <LearningResourcesView
                  category="digital_products"
                  resources={learningResources}
                  currentUser={currentUser}
                  onSaveResource={handleSaveResource}
                  onDeleteResource={handleDeleteResource}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'student_login' })}
                />
              )}

              {/* VIEW 6: LINK CÔNG CỤ SỐ */}
              {activeTab === 'digital_tools' && (
                <LearningResourcesView
                  category="digital_tools"
                  resources={learningResources}
                  currentUser={currentUser}
                  onSaveResource={handleSaveResource}
                  onDeleteResource={handleDeleteResource}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 7: HỌC SINH GIỎI */}
              {activeTab === 'hsg_prep' && (
                <LearningResourcesView
                  category="hsg_prep"
                  resources={learningResources}
                  currentUser={currentUser}
                  onSaveResource={handleSaveResource}
                  onDeleteResource={handleDeleteResource}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 8: GƯƠNG TIÊU BIỂU */}
              {activeTab === 'exemplary' && (
                <ExemplaryView
                  posts={exemplaryPosts}
                  onAddPost={handleAddExemplaryPost}
                  onUpdatePost={handleUpdateExemplaryPost}
                  onDeletePost={handleDeleteExemplaryPost}
                  currentUser={currentUser}
                  onRequireLogin={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                />
              )}

              {/* VIEW 9: QUẢN TRỊ VIÊN - Dành riêng cho Giáo viên Quản trị */}
              {activeTab === 'admin' && (
                isTeacherAdmin(currentUser) ? (
                  <AdminPanel
                    systemConfig={systemConfig}
                    setSystemConfig={setSystemConfig}
                    exams={exams}
                    setExams={setExams}
                    students={students}
                    setStudents={setStudents}
                    submissions={submissions}
                    setSubmissions={setSubmissions}
                    onViewSubmission={(sub) => {
                      const targetExam = exams.find(e => e.id === sub.examId);
                      if (targetExam) {
                        setReviewSubmission({
                          submission: sub,
                          exam: targetExam
                        });
                      }
                    }}
                    onOpenSyncRestore={() => setShowSyncRestoreModal(true)}
                    notifications={notifications}
                    onSendNotification={handleSendNotification}
                    onDeleteNotification={handleDeleteNotification}
                    currentUser={currentUser}
                    onDeleteExam={handleDeleteExam}
                  />
                ) : (
                  <div className="p-8 max-w-2xl mx-auto text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-amber-300 my-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <KeyRound className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Khu Vực Dành Riêng Cho Giáo Viên Quản Trị</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Các tính năng quản trị: tải bảng điểm kiểm tra, up bảng điểm, thiết kế đề kiểm tra, chỉnh sửa đề, xóa đề, trộn đề, chấm bài chỉ là quyền của Giáo viên Quản trị hệ thống (Thầy Nguyễn Đình Hành, Thầy Phạm Ngọc Tiến, Cô Nguyễn Thị Cẩm Lệ, Cô Đặng Thị Xuân Sang).
                      <br /><br />
                      Tất cả học sinh, khách và tổ trưởng Trần Thị Phượng đều không có quyền thao tác tại khu vực này.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setAuthModalState({ isOpen: true, mode: 'admin_login' })}
                        className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        Đăng nhập Giáo viên Quản trị (Admin)
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* VIEW 10: TRỢ LÝ AI GEMINI & BIẾN VĂN BẢN THÀNH HÌNH ẢNH */}
              {activeTab === 'ai_assistant' && (
                <AIAssistantView
                  systemConfig={systemConfig}
                  currentUser={currentUser}
                />
              )}

              {/* VIEW 11: MINMAP (VẼ SƠ ĐỒ TƯ DUY THEO YÊU CẦU) */}
              {activeTab === 'mindmap' && (
                <MindmapView
                  currentUser={currentUser}
                />
              )}

            </main>

          </div>

        </div>
      </div>

      {/* EXAM ENTRY MODAL */}
      {selectedExamForEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Xác nhận thông tin học sinh
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedExamForEntry.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExamForEntry(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartExam} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An (Nhập đúng tên trong danh sách trường)"
                  value={entryStudentName}
                  onChange={(e) => setEntryStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lớp học (16 lớp trường Y Đôn): <span className="text-red-500">*</span>
                </label>
                <select
                  value={entryClassName}
                  onChange={(e) => setEntryClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-bold bg-white text-slate-900"
                >
                  {schoolClasses.map((cls) => (
                    <option key={cls} value={cls}>Lớp {cls}</option>
                  ))}
                </select>
              </div>

              {/* Thông tin thời gian & Báo cáo đóng đề khi hết giờ */}
              {(() => {
                const entrySched = getExamScheduleStatus(selectedExamForEntry);
                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                          Trạng thái mở đề:
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                          entrySched.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : entrySched.status === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {entrySched.badgeLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span>Thời gian mở: <strong className="text-blue-900">{entrySched.openTimeFormatted}</strong></span>
                        <br />
                        <span>Thời gian đóng đề (hết giờ): <strong className="text-rose-900">{entrySched.closeTimeFormatted}</strong></span>
                      </div>
                    </div>

                    {/* BÁO CÁO HẾT GIỜ: Tự động đóng chế độ mở, HS không được vào thi sau khi đã hết giờ */}
                    {entrySched.status === 'expired' && (
                      <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-black text-rose-800">
                          <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="uppercase tracking-wider">BÁO CÁO HẾT GIỜ LÀM BÀI</span>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                          Đề kiểm tra này đã kết thúc thời gian làm bài (hết giờ lúc <strong>{entrySched.closeTimeFormatted}</strong>). Hệ thống đã tự động đóng chế độ mở. <strong>Học sinh không được phép vào thi sau khi đã hết giờ.</strong>
                        </p>
                        {isTeacherAdmin(currentUser) && (
                          <div className="pt-1.5 border-t border-rose-200/80 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleReopenExam(selectedExamForEntry.id, 15);
                                setSelectedExamForEntry(prev => prev ? reopenExamWithDuration(prev, 15) : null);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Thầy/Cô mở lại đề ngay (+15 phút)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cảnh báo chưa đến giờ */}
                    {entrySched.status === 'upcoming' && (
                      <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px]">
                        ⚠️ Hiện tại chưa đến thời gian mở đề thi. Đề sẽ mở vào lúc {entrySched.openTimeFormatted}. Vui lòng quay lại vào đúng thời điểm đã ấn định!
                      </div>
                    )}

                    {entryError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                        {entryError}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        id="confirm-start-exam-button"
                        disabled={entrySched.status === 'expired' || entrySched.status === 'upcoming'}
                        className={`w-full py-3 font-bold rounded-xl shadow-md transition-colors text-xs uppercase tracking-wider ${
                          entrySched.status === 'expired'
                            ? 'bg-rose-200 text-rose-700 cursor-not-allowed border border-rose-300'
                            : entrySched.status === 'upcoming'
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-98'
                        }`}
                      >
                        {entrySched.status === 'expired'
                          ? 'Đã Hết Giờ Làm Bài (Học Sinh Không Được Vào Thi)'
                          : entrySched.status === 'upcoming'
                          ? 'Chưa Đến Giờ Mở Đề'
                          : 'Bắt Đầu Làm Bài Kiểm Tra (15 Phút)'}
                      </button>
                    </div>
                  </div>
                );
              })()}

            </form>
          </div>
        </div>
      )}

      {/* EXAM EDIT MODAL - CHỈ GIÁO VIÊN QUẢN TRỊ (ADMIN) MỚI ĐƯỢC PHÉP */}
      {editingExam && (
        <ExamEditModal
          exam={editingExam}
          isOpen={!!editingExam}
          isAdmin={isTeacherAdmin(currentUser)}
          isNew={isCreatingExam}
          onClose={() => {
            setEditingExam(null);
            setIsCreatingExam(false);
          }}
          onSave={handleSaveEditedExam}
          onDelete={handleDeleteExam}
        />
      )}

      {/* MODAL XÁC NHẬN XÓA ĐỀ KIỂM TRA (DÀNH CHO GIÁO VIÊN QUẢN TRỊ) */}
      {examToDelete && isTeacherAdmin(currentUser) && (
        <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Xác nhận xóa đề kiểm tra</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ gỡ đề thi khỏi hệ thống</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa đề: <strong className="text-rose-900">"{examToDelete.title}"</strong> không? Sau khi xóa, học sinh sẽ không thể tiếp tục làm bài kiểm tra này.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExam(examToDelete.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa đề</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL (3 TÍNH NĂNG: THỦ CÔNG / AI / UP FILE) - DÀNH CHO GIÁO VIÊN QUẢN TRỊ */}
      {showCreateExamModal && isTeacherAdmin(currentUser) && (
        <CreateExamModal
          isOpen={showCreateExamModal}
          onClose={() => setShowCreateExamModal(false)}
          onSaveExam={handleSaveNewCreatedExam}
          currentUser={currentUser}
          defaultGrade={selectedGrade !== 'all' ? (Number(selectedGrade) as GradeLevel) : 8}
          defaultSubject={selectedSubject !== 'all' ? selectedSubject : 'physics'}
        />
      )}

      {/* PRINTABLE ANSWER SHEET MODAL (MẪU PHIẾU TRẮC NGHIỆM KHỔ A4) */}
      {showPrintSheetModal && (
        <PrintableAnswerSheetModal
          isOpen={showPrintSheetModal}
          onClose={() => setShowPrintSheetModal(false)}
          examTitle={selectedExamForEntry?.title}
          defaultGrade={selectedGrade !== 'all' ? Number(selectedGrade) : 8}
          testNumber={selectedTestNumber !== 'all' ? selectedTestNumber.replace('TX', 'Đề ') : 'Đề 1'}
        />
      )}

      {/* CAMERA OMR SCANNER MODAL (CHẤM BÀI TRẮC NGHIỆM QUA CAMERA) - DÀNH CHO GIÁO VIÊN QUẢN TRỊ */}
      {showCameraOMRModal && isTeacherAdmin(currentUser) && (
        <CameraOMRScannerModal
          isOpen={showCameraOMRModal}
          onClose={() => setShowCameraOMRModal(false)}
          exams={exams}
          students={students}
          submissions={submissions}
          onSaveGradedSubmission={handleSaveGradedSubmissionFromCamera}
          onOpenPrintSheet={() => {
            setShowCameraOMRModal(false);
            setShowPrintSheetModal(true);
          }}
          onOpenMixer={() => {
            setShowCameraOMRModal(false);
            setShowPeriodicMixerModal(true);
          }}
        />
      )}

      {/* PERIODIC EXAM MIXER MODAL (TRỘN ĐỀ KIỂM TRA ĐỊNH KỲ) - DÀNH CHO GIÁO VIÊN QUẢN TRỊ */}
      {showPeriodicMixerModal && isTeacherAdmin(currentUser) && (
        <PeriodicExamMixerModal
          isOpen={showPeriodicMixerModal}
          onClose={() => setShowPeriodicMixerModal(false)}
          onSyncKeysToScanner={() => {
            setShowPeriodicMixerModal(false);
            setShowCameraOMRModal(true);
          }}
        />
      )}

      {/* AUTH MODAL FOR STUDENT LOGIN / REGISTER & ADMIN LOGIN */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        students={students}
      />

      {/* GUEST NOTICE MODAL */}
      <GuestNoticeModal
        isOpen={guestNoticeState.isOpen}
        onClose={() => setGuestNoticeState(prev => ({ ...prev, isOpen: false }))}
        guestName={guestNoticeState.name}
        guestClass={guestNoticeState.className}
        onOpenAdminRoster={() => {
          setGuestNoticeState(prev => ({ ...prev, isOpen: false }));
          if (currentUser?.role === 'admin') {
            setActiveTab('admin');
          } else {
            setAuthModalState({ isOpen: true, mode: 'admin_login' });
          }
        }}
      />

      {/* EXAM TAKING MODAL WITH ANTI-CHEAT ENGINE */}
      {activeExamToTake && (
        <ExamTakingModal
          exam={activeExamToTake}
          studentName={entryStudentName}
          className={entryClassName}
          onClose={() => setActiveExamToTake(null)}
          onSubmitExam={handleSubmitExam}
        />
      )}

      {/* EXAM REVIEW MODAL */}
      {reviewSubmission && (
        <ExamReviewModal
          submission={reviewSubmission.submission}
          exam={reviewSubmission.exam}
          onClose={() => setReviewSubmission(null)}
        />
      )}

      {/* SCOREBOARD MODAL (BẢNG ĐIỂM KTTX) */}
      {showScoreboardModal && (
        <ScoreboardModal
          isOpen={showScoreboardModal}
          onClose={() => setShowScoreboardModal(false)}
          submissions={submissions}
          exams={exams}
          students={students}
          currentUser={currentUser}
          onViewSubmission={(sub) => {
            const targetExam = exams.find(e => e.id === sub.examId);
            if (targetExam) {
              setReviewSubmission({
                submission: sub,
                exam: targetExam
              });
            }
          }}
          onDeleteSubmission={isTeacherAdmin(currentUser) ? (subId) => {
            setSubmissions(prev => {
              const next = prev.filter(s => s.id !== subId);
              localStorage.setItem('ydon_submissions', JSON.stringify(next));
              return next;
            });
          } : undefined}
          onClearScoreboard={isTeacherAdmin(currentUser) ? (idsToDelete) => {
            setSubmissions(prev => {
              let next: StudentSubmission[];
              if (idsToDelete && idsToDelete.length > 0) {
                const idSet = new Set(idsToDelete);
                next = prev.filter(s => !idSet.has(s.id));
              } else {
                next = [];
              }
              localStorage.setItem('ydon_submissions', JSON.stringify(next));
              return next;
            });
          } : undefined}
          onOpenSyncRestore={isTeacherAdmin(currentUser) ? () => setShowSyncRestoreModal(true) : undefined}
        />
      )}

      {/* MODAL KHÔI PHỤC & ĐỒNG BỘ KẾT QUẢ HỌC SINH - DÀNH CHO GIÁO VIÊN QUẢN TRỊ */}
      {showSyncRestoreModal && isTeacherAdmin(currentUser) && (
        <SyncRestoreModal
          isOpen={showSyncRestoreModal}
          onClose={() => setShowSyncRestoreModal(false)}
          students={students}
          exams={exams}
          submissions={submissions}
          onUpdateSubmissions={(newSubs) => {
            setSubmissions(newSubs);
            localStorage.setItem('ydon_submissions', JSON.stringify(newSubs));
          }}
          onUpdateStudents={(newStudents) => {
            setStudents(newStudents);
            localStorage.setItem('ydon_students', JSON.stringify(newStudents));
          }}
        />
      )}

      {/* MODAL CÀI ĐẶT / TẢI ỨNG DỤNG XUỐNG THIẾT BỊ */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onNativeInstall={handleNativeInstall}
      />

      {/* MODAL NHẮC NHỞ LỊCH KIỂM TRA CHO HỌC SINH */}
      <ExamReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        notifications={notifications}
        currentUser={currentUser}
        onSendNotification={handleSendNotification}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* MODAL XUẤT BẢN APP (TẢI TỆP ZIP LÊN NETLIFY) - CHỈ DÀNH CHO QUẢN TRỊ VIÊN */}
      {isTeacherAdmin(currentUser) && (
        <PublishAppModal
          isOpen={showPublishAppModal}
          onClose={() => setShowPublishAppModal(false)}
        />
      )}

      {/* POPUP THÔNG BÁO LỊCH KIỂM TRA KHI HỌC SINH ĐĂNG NHẬP APP */}
      {studentScheduleNotice && studentScheduleNotice.isOpen && (
        <div 
          className="fixed inset-0 z-90 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in"
          onClick={() => setStudentScheduleNotice(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                  <Bell className="w-6 h-6 text-yellow-200 animate-bounce" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-yellow-200 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Calendar className="w-3 h-3" />
                    LỊCH KIỂM TRA TỪ GIÁO VIÊN
                  </div>
                  <h3 className="font-black text-lg text-white leading-tight">
                    Thông Báo Lịch Kiểm Tra
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentScheduleNotice(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                <p className="text-slate-800 leading-relaxed">
                  👋 Chào em <strong className="text-blue-900">{studentScheduleNotice.studentName}</strong> ({studentScheduleNotice.className})!
                  Thầy/Cô đã lên lịch kiểm tra thường xuyên môn Khoa học Tự nhiên:
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-500 min-w-20">Bài kiểm tra:</span>
                  <span className="font-black text-slate-900 flex-1 text-sm text-blue-900">
                    {studentScheduleNotice.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 min-w-20">Phân môn:</span>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {studentScheduleNotice.subjectName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                    {studentScheduleNotice.targetClass}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 min-w-20">Thời gian mở:</span>
                  <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {studentScheduleNotice.scheduleTime}
                  </span>
                </div>
                {studentScheduleNotice.note && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="font-bold text-slate-700 block mb-1">📌 Lời dặn dò của Thầy/Cô:</span>
                    <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 italic leading-relaxed">
                      "{studentScheduleNotice.note}"
                    </p>
                  </div>
                )}
                {studentScheduleNotice.createdBy && (
                  <div className="text-[11px] text-slate-500 pt-1 text-right">
                    Giáo viên: <strong>{studentScheduleNotice.createdBy}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentScheduleNotice(null);
                    setShowReminderModal(true);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Xem Chi Tiết Lịch Kiểm Tra →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentScheduleNotice(null)}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Em Đã Hiểu & Sẵn Sàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer systemConfig={systemConfig} />

    </div>
  );
}
