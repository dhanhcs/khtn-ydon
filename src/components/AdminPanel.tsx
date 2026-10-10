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
  Info
} from 'lucide-react';
import { Exam, StudentSubmission, StudentRecord, SystemConfig, SubjectType, GradeLevel, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../types';
import { ExamEditModal } from './ExamEditModal';
import { downloadStudentExcelTemplate, exportStudentsToExcel, parseStudentsExcelFile } from '../utils/excelUtils';

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
  onViewSubmission
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'gradebook' | 'students' | 'schedule' | 'create_exam' | 'system_settings'>('gradebook');

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Create exam form state
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [newExamGrade, setNewExamGrade] = useState<GradeLevel>(8);
  const [newExamMode, setNewExamMode] = useState<'mode_1' | 'mode_2'>('mode_1');
  const [newExamOpenDate, setNewExamOpenDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newExamOpenTime, setNewExamOpenTime] = useState('08:00:00');

  // Exam Edit Modal state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const handleSaveExam = (updatedExam: Exam) => {
    setExams(prev => prev.map(ex => ex.id === updatedExam.id ? updatedExam : ex));
    setEditingExam(null);
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
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
      return updated;
    });
    setNewStudentName('');
    setExcelStatusMsg({ type: 'success', text: `Đã thêm học sinh ${newSt.name} (${newSt.className}) vào danh sách!` });
  };

  // Excel Roster Actions
  const handleDownloadTemplate = () => {
    try {
      downloadStudentExcelTemplate(students);
      setExcelStatusMsg({ type: 'info', text: 'Đã tải xuống biểu mẫu Excel danh sách học sinh THCS Y Đôn thành công.' });
    } catch (err: any) {
      alert('Không thể tạo file mẫu: ' + (err?.message || 'Lỗi không xác định'));
    }
  };

  const handleExportStudents = () => {
    try {
      exportStudentsToExcel(students, systemConfig.schoolName || 'THCS Y Đôn');
      setExcelStatusMsg({ type: 'success', text: `Đã xuất danh sách ${students.length} học sinh ra file Excel.` });
    } catch (err: any) {
      alert('Lỗi xuất Excel: ' + (err?.message || 'Lỗi không xác định'));
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
        // Merge or replace roster: update existing or add new
        setStudents(prev => {
          // Keep a map of students
          const studentMap = new Map<string, StudentRecord>();
          // Add existing
          prev.forEach(s => studentMap.set(`${s.name.toLowerCase().trim()}_${s.className.toLowerCase().trim()}`, s));
          // Overwrite/add imported
          result.students.forEach(s => studentMap.set(`${s.name.toLowerCase().trim()}_${s.className.toLowerCase().trim()}`, s));

          const merged = Array.from(studentMap.values());
          localStorage.setItem('ydon_students', JSON.stringify(merged));
          return merged;
        });

        setExcelStatusMsg({
          type: 'success',
          text: `Nhập Excel thành công! Đã cập nhật ${result.students.length} học sinh vào nguồn dữ liệu chuẩn của trường THCS Y Đôn.`
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

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này khỏi danh sách?')) {
      setStudents(prev => {
        const next = prev.filter(s => s.id !== id);
        localStorage.setItem('ydon_students', JSON.stringify(next));
        return next;
      });
    }
  };

  // Delete submission
  const handleDeleteSubmission = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa kết quả bài thi này?')) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
    }
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

    // Generate 1 Short Answer Question
    const saQ: ShortAnswerQuestion = {
      id: `gen_q18`,
      type: 'short_answer',
      question: `Một bài toán tính toán nhanh: Tính giá trị thông số thực nghiệm theo đơn vị tiêu chuẩn (nhập đáp số bằng số)?`,
      acceptableAnswers: ['10', '10.0', '10,0'],
      unit: '',
      explanation: 'Áp dụng công thức chuẩn thu được kết quả = 10.'
    };

    const openAt = newExamMode === 'mode_2' ? `${newExamOpenDate}T${newExamOpenTime || '08:00:00'}` : undefined;

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: newExamTitle.trim(),
      subject: newExamSubject,
      grade: newExamGrade,
      durationMinutes: 15,
      totalPoints: 10.0,
      mode: newExamMode,
      openAt,
      openTime: openAt,
      isActive: true,
      questions: [...mcqs, tfQ, saQ],
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setExams(prev => [newExam, ...prev]);
    setNewExamTitle('');
    alert('Đã tạo thành công bộ đề kiểm tra chuẩn ma trận 18 câu!');
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
            <span className="text-xs text-slate-400">Tổ LÍ - HÓA - SINH - CN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Quản Lý Học Tập & Kiểm Tra Trực Tuyến
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
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
                <option value="6A">Lớp 6A</option>
                <option value="7A">Lớp 7A</option>
                <option value="8A">Lớp 8A</option>
                <option value="8B">Lớp 8B</option>
                <option value="9A">Lớp 9A</option>
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

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel / CSV</span>
            </button>
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

                <div className="flex items-center gap-2">
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

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên / mã / lớp..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 w-36 sm:w-48"
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
                      <th className="py-2.5 px-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(st => {
                        if (studentFilterGrade !== 'all' && st.grade.toString() !== studentFilterGrade) return false;
                        if (studentSearchTerm.trim()) {
                          const term = studentSearchTerm.toLowerCase();
                          return st.name.toLowerCase().includes(term) || 
                                 st.className.toLowerCase().includes(term) ||
                                 st.id.toLowerCase().includes(term);
                        }
                        return true;
                      })
                      .map((st, idx) => (
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
                            onClick={() => handleDeleteStudent(st.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((ex) => {
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
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ex.subject === 'physics' 
                          ? 'bg-blue-100 text-blue-800' 
                          : ex.subject === 'chemistry' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ex.subject === 'physics' ? 'Vật lí' : ex.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} - Lớp {ex.grade}
                      </span>
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Chế độ mở:</span>
                        <button
                          onClick={() => toggleExamMode(ex.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                            ex.mode === 'mode_2' 
                              ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                          title="Bấm để chuyển nhanh giữa Chế độ 1 và Chế độ 2"
                        >
                          <CalendarClock className="w-3 h-3" />
                          <span>{ex.mode === 'mode_2' ? 'Chế độ 2 (Ấn định ngày)' : 'Chế độ 1 (Mọi lúc)'}</span>
                        </button>
                      </div>

                      {ex.mode === 'mode_2' && (
                        <div className="p-2 bg-blue-50/80 rounded-lg border border-blue-200 text-[11px] text-blue-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Thời gian mở:</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isFuture ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {isFuture ? 'Sắp mở' : 'Đã mở'}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-blue-950">
                            {scheduleLabel}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Nút Chỉnh sửa đề */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => setEditingExam(ex)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa đề kiểm tra</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TẠO ĐỀ KIỂM TRA CHUẨN MA TRẬN 18 CÂU */}
      {adminTab === 'create_exam' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                Soạn Thảo Bộ Đề
              </span>
              <span className="text-xs text-slate-500">Chuẩn ma trận 18 câu</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Khởi Tạo Đề Kiểm Tra Thường Xuyên Mới
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi bộ đề sẽ tự động cấu trúc theo chuẩn quy định: 16 câu trắc nghiệm 4 lựa chọn (8.0đ) + 1 câu Đúng/Sai 4 ý (1.0đ) + 1 câu trả lời ngắn (1.0đ).
            </p>
          </div>

          <form onSubmit={handleCreateStandardExam} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề đề kiểm tra:</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: KTTX Số 2 - Sinh học 8: Hệ hô hấp và trao đổi khí"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none font-semibold"
                >
                  <option value="mode_1">Chế độ 1: Mọi lúc (HS làm bài lúc nào cũng được)</option>
                  <option value="mode_2">Chế độ 2: Ấn định ngày mở</option>
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
                Ma trận kiểm tra 18 câu mặc định:
              </div>
              <div>• Phần I: 16 câu Trắc nghiệm khách quan 4 phương diện (8.0 điểm)</div>
              <div>• Phần II: 1 câu hỏi Trắc nghiệm Đúng/Sai với 4 ý a-b-c-d (1.0 điểm)</div>
              <div>• Phần III: 1 câu hỏi Trả lời ngắn điền số liệu (1.0 điểm)</div>
              <div>• Thời gian đếm ngược làm bài: 15 phút (900 giây)</div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Khởi Tạo Đề Kiểm Tra Ma Trận 18 Câu
            </button>
          </form>
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
                onClick={() => alert('Đã lưu cấu hình hệ thống thành công!')}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Lưu Thay Đổi Cấu Hình
              </button>
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
        />
      )}

    </div>
  );
}
