import React, { useState, useMemo } from 'react';
import { 
  Atom, 
  FlaskConical, 
  Dna, 
  Layers, 
  Sparkles, 
  Clock, 
  Play, 
  Search, 
  Award,
  KeyRound,
  X,
  FileCheck2,
  TableProperties,
  Edit3,
  CalendarClock
} from 'lucide-react';
import { 
  initialSystemConfig, 
  sampleExams, 
  sampleStudents, 
  sampleSubmissions, 
  sampleLearningResources,
  sampleExemplaryPosts
} from './data/mockData';
import { additionalExams } from './data/additionalExams';
import { 
  Exam, 
  GradeLevel, 
  StudentRecord, 
  StudentSubmission, 
  SubjectType, 
  SystemConfig,
  ExemplaryPost,
  UserSession,
  LearningResource
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AtomGraphic } from './components/AtomGraphic';
import { DnaGraphic } from './components/DnaGraphic';
import { ExamTakingModal } from './components/ExamTakingModal';
import { ExamReviewModal } from './components/ExamReviewModal';
import { ExamEditModal } from './components/ExamEditModal';
import { AdminPanel } from './components/AdminPanel';
import { LearningResourcesView } from './components/LearningResourcesView';
import { StudentTasksMenu } from './components/StudentTasksMenu';
import { ExemplaryView } from './components/ExemplaryView';
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { HomeworkView } from './components/HomeworkView';
import { ScoreboardModal } from './components/ScoreboardModal';
import { GuestNoticeModal } from './components/GuestNoticeModal';
import { checkStudentInSchoolRoster } from './utils/excelUtils';

export default function App() {
  // System Config (with persistent school year)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('ydon_system_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSystemConfig;
  });

  // Combine default sample exams with comprehensive grade 6-9 exams
  const initialAllExams = useMemo(() => [...sampleExams, ...additionalExams], []);

  // Exams, students, submissions
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('ydon_exams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialAllExams;
  });

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('ydon_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return sampleStudents;
  });
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    const saved = localStorage.getItem('ydon_submissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return sampleSubmissions;
  });

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
      try { return JSON.parse(saved); } catch (e) {}
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

  // Save edited exam
  const handleSaveEditedExam = (updatedExam: Exam) => {
    setExams((prev) => {
      const next = prev.map((ex) => (ex.id === updatedExam.id ? updatedExam : ex));
      localStorage.setItem('ydon_exams', JSON.stringify(next));
      return next;
    });
    setEditingExam(null);
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

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (selectedSubject !== 'all' && exam.subject !== selectedSubject) return false;
      if (selectedGrade !== 'all' && exam.grade.toString() !== selectedGrade) return false;
      if (selectedTestNumber !== 'all') {
        if (exam.testNumber && exam.testNumber !== selectedTestNumber) return false;
        if (!exam.testNumber && !exam.title.toLowerCase().includes(selectedTestNumber.toLowerCase())) return false;
      }
      if (searchQuery.trim() && !exam.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
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

    // Kiểm tra Chế độ 2: Ấn định ngày mở (không dùng mật khẩu)
    if (selectedExamForEntry.mode === 'mode_2' && !isExamCurrentlyOpen(selectedExamForEntry)) {
      setEntryError(`Chưa đến thời gian mở đề! Đề kiểm tra này ấn định bắt đầu lúc: ${formatExamSchedule(selectedExamForEntry)}. Vui lòng quay lại đúng giờ.`);
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
      return updated;
    });

    let student = students.find(s => s.name === submissionData.studentName && s.className === submissionData.className);
    if (!student) {
      const gradeNum = parseInt(submissionData.className.replace(/\D/g, '') || '8', 10);
      const validGrade: GradeLevel = (gradeNum === 6 || gradeNum === 7 || gradeNum === 8 || gradeNum === 9) ? gradeNum : 8;
      const newStudent: StudentRecord = {
        id: `std-${Date.now()}`,
        name: submissionData.studentName,
        className: submissionData.className,
        grade: validGrade,
        gender: 'Nam',
        dob: '2012-05-10'
      };
      setStudents((prev) => [...prev, newStudent]);
    }

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
      
      {/* 1. TOP HEADER with official logo, school year dropdown, student/admin login */}
      <Header
        systemConfig={systemConfig}
        onUpdateSchoolYear={handleUpdateSchoolYear}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onLogout={handleLogout}
      />

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

                    <div className="text-right">
                      <span className="inline-block font-mono text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                        {filteredExams.length} đề thi sẵn sàng
                      </span>
                    </div>
                  </div>

                  {/* Filter & Search Bar matching reference image */}
                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    
                    {/* Row 1: Khối lớp & Bài KT */}
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

                      {/* Bài KT filter: TX1, TX2, TX3, TX4 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-700 uppercase tracking-wider mr-1 text-[11px]">
                          BÀI KT:
                        </span>
                        {['all', 'TX1', 'TX2', 'TX3', 'TX4'].map((t) => (
                          <button
                            key={t}
                            id={`filter-test-${t}`}
                            onClick={() => setSelectedTestNumber(t)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              selectedTestNumber === t
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {t === 'all' ? 'Tất cả' : t}
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

                      {/* Search box */}
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

                    </div>

                  </div>

                  {/* 3-COLUMN EXAM CARDS GRID:
                      - All exams brought up without empty space
                      - Fully responsive (1 col on mobile, 2 on tablet, 3 on desktop)
                  */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredExams.length === 0 ? (
                      <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                        <Atom className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-700">Chưa có đề kiểm tra phù hợp với bộ lọc</h3>
                        <p className="text-xs text-slate-500">
                          Vui lòng chọn phân môn khác hoặc đổi bộ lọc khối lớp / bài kiểm tra.
                        </p>
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
                                      {exam.testNumber}
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
                            </div>

                            {/* Card Footer: Action & Mode */}
                            <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-1.5">
                                {exam.mode === 'mode_1' ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Mọi lúc (Tự do)
                                  </span>
                                ) : (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    isExamCurrentlyOpen(exam) 
                                      ? 'text-blue-700 bg-blue-50 border-blue-200' 
                                      : 'text-amber-800 bg-amber-50 border-amber-200'
                                  }`}>
                                    {isExamCurrentlyOpen(exam) ? 'Đã mở thi' : 'Chưa đến giờ'} ({formatExamSchedule(exam)})
                                  </span>
                                )}

                                <div className="flex items-center gap-1.5">
                                  {/* Nút Chỉnh sửa đề */}
                                  <button
                                    type="button"
                                    id={`edit-exam-btn-${exam.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingExam(exam);
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Chỉnh sửa thông tin, chế độ mở và câu hỏi của đề này"
                                  >
                                    <Edit3 className="w-3 h-3 text-blue-600" />
                                    <span>Sửa đề</span>
                                  </button>

                                   {/* Nút Làm bài */}
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
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Làm bài</span>
                                  </button>
                                </div>
                              </div>
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

              {/* VIEW 9: QUẢN TRỊ VIÊN */}
              {activeTab === 'admin' && (
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
                  placeholder="Ví dụ: Đinh Thị Mai Lan"
                  value={entryStudentName}
                  onChange={(e) => setEntryStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lớp học: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="8A1"
                  value={entryClassName}
                  onChange={(e) => setEntryClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              {/* Thông tin chế độ mở đề (Không dùng mật khẩu) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                    Chế độ mở đề:
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedExamForEntry.mode === 'mode_1'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isExamCurrentlyOpen(selectedExamForEntry)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedExamForEntry.mode === 'mode_1'
                      ? 'Chế độ 1: Mọi lúc'
                      : 'Chế độ 2: Ấn định ngày mở'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {selectedExamForEntry.mode === 'mode_1' ? (
                    'Học sinh có thể làm bài bất cứ lúc nào.'
                  ) : (
                    <span>Thời gian bắt đầu làm bài: <strong className="text-blue-900">{formatExamSchedule(selectedExamForEntry)}</strong></span>
                  )}
                </div>
                {selectedExamForEntry.mode === 'mode_2' && !isExamCurrentlyOpen(selectedExamForEntry) && (
                  <div className="p-2 bg-amber-100/80 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px] mt-1">
                    ⚠️ Hiện tại chưa đến thời gian mở đề thi. Vui lòng quay lại vào đúng thời điểm đã ấn định!
                  </div>
                )}
              </div>

              {entryError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                  {entryError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  id="confirm-start-exam-button"
                  disabled={selectedExamForEntry.mode === 'mode_2' && !isExamCurrentlyOpen(selectedExamForEntry)}
                  className={`w-full py-3 font-bold rounded-xl shadow-md transition-colors text-xs uppercase tracking-wider ${
                    selectedExamForEntry.mode === 'mode_2' && !isExamCurrentlyOpen(selectedExamForEntry)
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-98'
                  }`}
                >
                  {selectedExamForEntry.mode === 'mode_2' && !isExamCurrentlyOpen(selectedExamForEntry)
                    ? 'Chưa Đến Giờ Mở Đề'
                    : 'Bắt Đầu Làm Bài Kiểm Tra (15 Phút)'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EXAM EDIT MODAL */}
      {editingExam && (
        <ExamEditModal
          exam={editingExam}
          isOpen={!!editingExam}
          onClose={() => setEditingExam(null)}
          onSave={handleSaveEditedExam}
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
      <ScoreboardModal
        isOpen={showScoreboardModal}
        onClose={() => setShowScoreboardModal(false)}
        submissions={submissions}
        exams={exams}
        onViewSubmission={(sub) => {
          const targetExam = exams.find(e => e.id === sub.examId);
          if (targetExam) {
            setReviewSubmission({
              submission: sub,
              exam: targetExam
            });
          }
        }}
      />

      {/* FOOTER */}
      <Footer systemConfig={systemConfig} />

    </div>
  );
}
