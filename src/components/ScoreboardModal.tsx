import React, { useState, useMemo } from 'react';
import { 
  Award, 
  X, 
  Search, 
  Filter, 
  ShieldAlert, 
  Eye, 
  Calendar, 
  User, 
  Building2,
  Trash2,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  Download,
  FileSpreadsheet,
  Check,
  Trophy,
  Lock,
  Sparkles,
  RefreshCw,
  Upload,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import { StudentSubmission, Exam, StudentRecord, UserSession } from '../types';
import { checkStudentInSchoolRoster, exportScoreboardToExcel } from '../utils/excelUtils';
import { isTeacherAdmin } from '../utils/permissionUtils';
import { schoolClasses } from '../data/mockData';
import { regradeAllSubmissions } from '../utils/examRegrader';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  exams: Exam[];
  students?: StudentRecord[];
  currentUser?: UserSession | null;
  onViewSubmission: (submission: StudentSubmission) => void;
  onDeleteSubmission?: (submissionId: string) => void;
  onClearScoreboard?: (idsToDelete?: string[]) => void;
  onOpenSyncRestore?: () => void;
}

export function ScoreboardModal({
  isOpen,
  onClose,
  submissions,
  exams,
  students = [],
  currentUser,
  onViewSubmission,
  onDeleteSubmission,
  onClearScoreboard,
  onOpenSyncRestore
}: ScoreboardModalProps) {
  const canManageScores = isTeacherAdmin(currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const currentStudentName = isStudent ? (currentUser?.name || '').trim().toLowerCase() : '';

  // Tra cứu cá nhân dành cho khách / chưa đăng nhập
  const [lookupName, setLookupName] = useState<string>('');
  const [searchedName, setSearchedName] = useState<string>('');

  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTestNumber, setFilterTestNumber] = useState<string>('all'); // 'all', '1', '2', ..., '8'
  const [filterExamId, setFilterExamId] = useState<string>('all'); // 'all' or specific exam ID
  const [searchName, setSearchName] = useState<string>('');
  const [deleteTargetSub, setDeleteTargetSub] = useState<StudentSubmission | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Helper to extract or match test number (1..8) from submission or related exam
  const getSubTestNumber = (sub: StudentSubmission): string | null => {
    const matchedExam = exams.find(e => e.id === sub.examId);
    if (matchedExam?.testNumber) {
      const num = matchedExam.testNumber.replace(/\D/g, '');
      if (num && Number(num) >= 1 && Number(num) <= 8) return num;
    }
    const title = (sub.examTitle || matchedExam?.title || '').toLowerCase();
    const match = title.match(/(?:đề\s*(?:số)?|bài\s*(?:số)?|lần|số|kttx|tx)\s*([1-8])/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Helper tính danh hiệu Cúp Vàng, Bạc, Đồng cho từng bài thi
  const getSubTrophy = (totalScore: number) => {
    if (totalScore >= 8.5) {
      return { name: 'Cúp Vàng', icon: '🏆', color: 'text-amber-800 bg-amber-100 border-amber-300 font-black' };
    } else if (totalScore >= 7.0) {
      return { name: 'Cúp Bạc', icon: '🥈', color: 'text-slate-700 bg-slate-100 border-slate-300 font-bold' };
    } else if (totalScore >= 5.0) {
      return { name: 'Cúp Đồng', icon: '🥉', color: 'text-orange-800 bg-orange-100 border-orange-300 font-bold' };
    } else {
      return { name: 'Cố Gắng', icon: '🎖️', color: 'text-blue-700 bg-blue-50 border-blue-200 font-medium' };
    }
  };

  // Chart view states
  const [showChart, setShowChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'grouped' | 'stacked' | 'average'>('grouped');

  // Lọc nghiêm ngặt & luôn chấm lại theo đáp án mới nhất của đề thi
  const rosterReferenced = useMemo(() => {
    const { updatedSubmissions } = regradeAllSubmissions(submissions, exams);
    if (!students || students.length === 0) return updatedSubmissions;
    return updatedSubmissions.filter(sub => {
      const check = checkStudentInSchoolRoster(sub.studentName, sub.className, students);
      return check.isEnrolled;
    });
  }, [submissions, exams, students]);

  // Submissions count for each test number button (TX1 to TX8)
  const testNumberCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      '1': 0, '2': 0, '3': 0, '4': 0,
      '5': 0, '6': 0, '7': 0, '8': 0
    };
    rosterReferenced.forEach(sub => {
      // Bảo mật điểm số cá nhân: Học sinh chỉ tính điểm của chính mình
      if (isStudent && currentStudentName && sub.studentName.trim().toLowerCase() !== currentStudentName) return;
      if (!isAdmin && !isStudent) {
        if (!searchedName.trim() || sub.studentName.trim().toLowerCase() !== searchedName.trim().toLowerCase()) return;
      }
      if (filterSubject !== 'all' && sub.subject !== filterSubject) return;
      if (isAdmin && filterClass !== 'all' && sub.className !== filterClass) return;
      counts.all++;
      const num = getSubTestNumber(sub);
      if (num && counts[num] !== undefined) {
        counts[num]++;
      }
    });
    return counts;
  }, [rosterReferenced, filterSubject, filterClass, exams, isStudent, currentStudentName, isAdmin, searchedName]);

  // Danh sách các đề kiểm tra phục vụ tính năng lọc bảng điểm KTTX theo từng đề kiểm tra
  const examFilterOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string; subject: string; grade?: number; testNumber?: string; count: number }>();

    // 1. Thêm từ kho đề kiểm tra hiện tại của hệ thống
    exams.forEach(ex => {
      map.set(ex.id, {
        id: ex.id,
        title: ex.title,
        subject: ex.subject,
        grade: ex.grade,
        testNumber: ex.testNumber,
        count: 0
      });
    });

    // 2. Tính số lượng bài nộp cho từng đề và bổ sung đề từ bài nộp
    rosterReferenced.forEach(sub => {
      if (isStudent && currentStudentName && sub.studentName.trim().toLowerCase() !== currentStudentName) return;
      if (!isAdmin && !isStudent) {
        if (!searchedName.trim() || sub.studentName.trim().toLowerCase() !== searchedName.trim().toLowerCase()) return;
      }

      if (map.has(sub.examId)) {
        map.get(sub.examId)!.count++;
      } else {
        map.set(sub.examId, {
          id: sub.examId,
          title: sub.examTitle || 'Đề kiểm tra',
          subject: sub.subject,
          grade: sub.grade,
          testNumber: getSubTestNumber(sub) ? `TX${getSubTestNumber(sub)}` : undefined,
          count: 1
        });
      }
    });

    let list = Array.from(map.values());

    // Nếu người dùng chọn môn học cụ thể thì lọc đề theo môn đó
    if (filterSubject !== 'all') {
      list = list.filter(item => item.subject === filterSubject);
    }

    return list.sort((a, b) => {
      if (a.grade !== b.grade) return (a.grade || 0) - (b.grade || 0);
      return a.title.localeCompare(b.title, 'vi');
    });
  }, [exams, rosterReferenced, filterSubject, isStudent, currentStudentName, isAdmin, searchedName]);

  // FILTERED: Học sinh CHỈ xem được kết quả kiểm tra của chính mình
  const filtered = useMemo(() => {
    return rosterReferenced.filter((sub) => {
      // 1. Học sinh đã đăng nhập: CHỈ hiển thị kết quả của học sinh đó
      if (isStudent && currentStudentName) {
        if (sub.studentName.trim().toLowerCase() !== currentStudentName) {
          return false;
        }
      } else if (!isAdmin) {
        // 2. Chưa đăng nhập / Khách: CHỈ hiển thị khi tra cứu đúng tên của mình
        if (!searchedName.trim()) {
          return false;
        }
        if (sub.studentName.trim().toLowerCase() !== searchedName.trim().toLowerCase()) {
          return false;
        }
      }

      if (filterSubject !== 'all' && sub.subject !== filterSubject) return false;
      if (isAdmin && filterClass !== 'all' && sub.className !== filterClass) return false;

      // 3. Lọc theo từng đề kiểm tra cụ thể
      if (filterExamId !== 'all') {
        if (sub.examId !== filterExamId && sub.examTitle !== filterExamId) {
          return false;
        }
      }

      if (filterTestNumber !== 'all') {
        const num = getSubTestNumber(sub);
        if (num !== filterTestNumber) return false;
      }
      if (isAdmin && searchName.trim() && !sub.studentName.toLowerCase().includes(searchName.toLowerCase())) return false;
      return true;
    });
  }, [rosterReferenced, filterSubject, filterClass, filterExamId, filterTestNumber, searchName, exams, isStudent, currentStudentName, isAdmin, searchedName]);

  // Thống kê cúp đạt được cho học sinh hiện tại
  const studentTrophies = useMemo(() => {
    let gold = 0;
    let silver = 0;
    let bronze = 0;
    let effort = 0;
    filtered.forEach(sub => {
      if (sub.totalScore >= 8.5) gold++;
      else if (sub.totalScore >= 7.0) silver++;
      else if (sub.totalScore >= 5.0) bronze++;
      else effort++;
    });
    return { gold, silver, bronze, effort };
  }, [filtered]);

  // Extract unique classes from official students & submissions
  const classList = useMemo(() => {
    const set = new Set<string>(schoolClasses);
    students.forEach(s => s.className && set.add(s.className));
    rosterReferenced.forEach(s => s.className && set.add(s.className));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students, rosterReferenced]);

  // Overall statistics for the filtered dataset
  const overallStats = useMemo(() => {
    if (filtered.length === 0) {
      return {
        total: 0,
        average: 0,
        passRate: 0,
        excellentCount: 0,
        goodCount: 0,
        avgCount: 0,
        belowCount: 0,
        maxScore: 0
      };
    }

    let sum = 0;
    let passed = 0;
    let excellent = 0;
    let good = 0;
    let avg = 0;
    let below = 0;
    let max = -Infinity;

    filtered.forEach(sub => {
      const s = sub.totalScore;
      sum += s;
      if (s >= 5.0) passed++;
      if (s >= 8.0) excellent++;
      else if (s >= 6.5) good++;
      else if (s >= 5.0) avg++;
      else below++;

      if (s > max) max = s;
    });

    return {
      total: filtered.length,
      average: Number((sum / filtered.length).toFixed(1)),
      passRate: Number(((passed / filtered.length) * 100).toFixed(1)),
      excellentCount: excellent,
      goodCount: good,
      avgCount: avg,
      belowCount: below,
      maxScore: max === -Infinity ? 0 : max
    };
  }, [filtered]);

  // Score distribution data by class for Recharts
  const classDistributionData = useMemo(() => {
    if (filterClass === 'all') {
      // Group by class from available classList
      return classList.map(cls => {
        // All submissions in this class matching current subject & test filters
        const classSubs = rosterReferenced.filter(sub => {
          if (filterSubject !== 'all' && sub.subject !== filterSubject) return false;
          if (filterTestNumber !== 'all') {
            const num = getSubTestNumber(sub);
            if (num !== filterTestNumber) return false;
          }
          return sub.className === cls;
        });

        const total = classSubs.length;
        let sum = 0;
        let gioi = 0;
        let kha = 0;
        let trungBinh = 0;
        let duoi5 = 0;

        classSubs.forEach(s => {
          const sc = s.totalScore;
          sum += sc;
          if (sc >= 8.0) gioi++;
          else if (sc >= 6.5) kha++;
          else if (sc >= 5.0) trungBinh++;
          else duoi5++;
        });

        const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;
        const passRate = total > 0 ? Number((((gioi + kha + trungBinh) / total) * 100).toFixed(0)) : 0;

        return {
          name: `Lớp ${cls}`,
          className: cls,
          'Giỏi (8.0-10)': gioi,
          'Khá (6.5-7.9)': kha,
          'Trung bình (5.0-6.4)': trungBinh,
          'Dưới 5.0 (Chưa đạt)': duoi5,
          'Điểm TB': avg,
          total,
          passRate
        };
      }).filter(d => d.total > 0 || classList.length <= 8);
    } else {
      // Single class view: Breakdown into standard educational score tiers
      const singleClassSubs = filtered;
      const total = singleClassSubs.length;

      const tiers = [
        { label: '0.0 - 4.9 (Dưới 5)', min: 0, max: 4.99, color: '#f43f5e' },
        { label: '5.0 - 6.4 (Trung bình)', min: 5, max: 6.49, color: '#f59e0b' },
        { label: '6.5 - 7.9 (Khá)', min: 6.5, max: 7.99, color: '#3b82f6' },
        { label: '8.0 - 8.9 (Giỏi)', min: 8.0, max: 8.99, color: '#10b981' },
        { label: '9.0 - 10.0 (Xuất sắc)', min: 9.0, max: 10.0, color: '#059669' }
      ];

      return tiers.map(t => {
        const count = singleClassSubs.filter(s => s.totalScore >= t.min && s.totalScore <= t.max).length;
        const percent = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
        return {
          name: t.label,
          'Số học sinh': count,
          'Tỉ lệ (%)': percent,
          color: t.color,
          total
        };
      });
    }
  }, [classList, rosterReferenced, filterSubject, filterClass, filterTestNumber, filtered, exams]);

  const handleDownloadScoreboard = () => {
    if (!canManageScores) {
      alert('Chức năng tải bảng điểm kiểm tra chỉ dành riêng cho Giáo viên Quản trị hệ thống. Học sinh, khách và tổ trưởng không có quyền này.');
      return;
    }
    if (filtered.length === 0) {
      alert('Không có dữ liệu bài làm nào phù hợp để tải về.');
      return;
    }
    const currentExamObj = examFilterOptions.find(e => e.id === filterExamId);
    exportScoreboardToExcel(filtered, {
      subjectFilter: filterSubject,
      classFilter: filterClass,
      testNumberFilter: filterTestNumber,
      examTitleFilter: currentExamObj?.title,
      schoolName: 'Trường THCS & THPT Y Đôn'
    });
    setDownloadSuccessToast(true);
    setTimeout(() => {
      setDownloadSuccessToast(false);
    }, 4000);
  };

  // Xóa bảng điểm (toàn bộ hoặc theo bộ lọc đề kiểm tra) - Chỉ dành cho Giáo viên Quản trị
  const handleExecuteClearScoreboard = () => {
    if (!canManageScores) {
      alert('Chức năng xóa bảng điểm chỉ dành riêng cho Giáo viên Quản trị hệ thống. Học sinh, khách và tổ trưởng không có quyền này.');
      return;
    }
    const idsToDelete = filtered.map(s => s.id);
    if (idsToDelete.length === 0) {
      setShowClearConfirmModal(false);
      return;
    }

    if (onClearScoreboard) {
      onClearScoreboard(idsToDelete);
    } else if (onDeleteSubmission) {
      idsToDelete.forEach(id => onDeleteSubmission(id));
    }

    setShowClearConfirmModal(false);
    setActionSuccessToast(`Đã xóa thành công ${idsToDelete.length} kết quả bài làm khỏi bảng điểm!`);
    setTimeout(() => {
      setActionSuccessToast(null);
    }, 4000);
  };

  if (!isOpen) return null;

  // Custom Recharts Tooltip for elegant educational data display
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-amber-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            {payload[0]?.payload?.total !== undefined && (
              <span className="text-[10px] text-slate-400 font-normal">
                Tổng: {payload[0].payload.total} bài
              </span>
            )}
          </p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {item.value} {item.name.includes('TB') ? 'điểm' : item.name.includes('%') ? '%' : 'em'}
              </span>
            </div>
          ))}
          {payload[0]?.payload?.passRate !== undefined && (
            <div className="pt-1 mt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400">
              <span>Tỉ lệ đạt (≥ 5.0đ):</span>
              <span className="font-bold">{payload[0].payload.passRate}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              {isStudent ? <Trophy className="w-6 h-6 text-amber-300" /> : <Award className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 flex-wrap">
                <span>
                  {isStudent
                    ? 'BẢNG KẾT QUẢ KIỂM TRA CÁ NHÂN & CÚP VINH DANH'
                    : 'BẢNG ĐIỂM KIỂM TRA THƯỜNG XUYÊN (KTTX)'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <ShieldCheck className="w-3 h-3" />
                  {isStudent ? `Học sinh: ${currentUser?.name} (${currentUser?.className})` : `Chuẩn danh sách HS (${students.length})`}
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                {isStudent
                  ? '🔒 Chế độ bảo mật điểm số: Em chỉ xem được kết quả và lịch sử bài làm của chính mình'
                  : 'Biểu đồ phân phối điểm số & Bảng kết quả bài làm học sinh • THCS & THPT Y Đôn'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageScores && (
              <button
                onClick={handleDownloadScoreboard}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Tải về bảng điểm KTTX ra file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Tải về Excel</span>
              </button>
            )}
            {canManageScores && onOpenSyncRestore && (
              <button
                onClick={onOpenSyncRestore}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-amber-300"
                title="Tải lên bảng điểm từ file Excel, JSON hoặc dán trực tiếp để hệ thống cập nhật kết quả"
              >
                <Upload className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Up bảng điểm lên</span>
              </button>
            )}
            {canManageScores && (
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                disabled={filtered.length === 0}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title={
                  filterExamId !== 'all'
                    ? `Xóa điểm bài làm đề này (${filtered.length} bài)`
                    : `Xóa kết quả trong bảng điểm (${filtered.length} bài) - Quyền Admin`
                }
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {filterExamId !== 'all' ? 'Xóa điểm đề này' : 'Xóa bảng điểm'}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner Bảo Mật Điểm Số & Vinh Danh Cúp Cho Học Sinh */}
        {isStudent && (
          <div className="p-4 bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 border-b border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                🏆
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                    Bảo Mật Điểm Số Cá Nhân
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentUser?.name} - Lớp {currentUser?.className}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Theo quy định của nhà trường, em chỉ xem được điểm và bài làm của chính mình.
                </p>
              </div>
            </div>

            {/* Thống kê cúp cá nhân */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">Cúp Vàng</span>
                <span className="text-sm font-black text-amber-600">🏆 {studentTrophies.gold}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">Cúp Bạc</span>
                <span className="text-sm font-black text-slate-600">🥈 {studentTrophies.silver}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">Cúp Đồng</span>
                <span className="text-sm font-black text-orange-700">🥉 {studentTrophies.bronze}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">Điểm TB</span>
                <span className="text-sm font-black text-blue-700">{overallStats.average}đ</span>
              </div>
            </div>
          </div>
        )}

        {/* Khung Tra cứu điểm cá nhân nếu chưa đăng nhập hoặc khách */}
        {!isAdmin && !isStudent && (
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>TRA CỨU ĐIỂM KIỂM TRA CÁ NHÂN (BẢO MẬT KẾT QUẢ THEO HỌC SINH)</span>
            </div>
            <p className="text-slate-600">
              Để bảo mật kết quả học tập, học sinh chỉ xem được kết quả kiểm tra của mình chứ không xem được kết quả của học sinh khác. Vui lòng nhập đúng Họ và tên để xem điểm:
            </p>
            <div className="flex items-center gap-2 max-w-md pt-1">
              <input
                type="text"
                placeholder="Nhập đầy đủ Họ và tên học sinh (VD: Đinh Thị Mai Lan)..."
                value={lookupName}
                onChange={(e) => setLookupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchedName(lookupName.trim())}
                className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none font-bold text-slate-800 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setSearchedName(lookupName.trim())}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Tra cứu
              </button>
            </div>
          </div>
        )}

        {/* Download Success Toast Banner */}
        {downloadSuccessToast && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã tải về bảng điểm KTTX thành công! File Excel (.xlsx) đã được lưu vào máy tính gồm 2 Sheet: Điểm chi tiết & Thống kê theo lớp.</span>
            </div>
            <button 
              onClick={() => setDownloadSuccessToast(false)} 
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

          {/* Action Success Toast Banner */}
        {actionSuccessToast && (
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionSuccessToast}</span>
            </div>
            <button 
              onClick={() => setActionSuccessToast(null)} 
              className="text-rose-700 hover:text-rose-900 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Bar: Phân môn, Lớp, Từng đề kiểm tra, Biểu đồ & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Subject filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-slate-600">Phân môn:</span>
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  // Khi đổi phân môn, nếu đề đang lọc không thuộc môn này thì reset đề về 'all'
                  if (filterExamId !== 'all') {
                    const curr = examFilterOptions.find(o => o.id === filterExamId);
                    if (curr && e.target.value !== 'all' && curr.subject !== e.target.value) {
                      setFilterExamId('all');
                    }
                  }
                }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả môn</option>
                <option value="physics">Vật lí</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
              </select>
            </div>

            {/* Class filter (chỉ giáo viên mới cần lọc lớp) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-600">Lớp:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-blue-600"
                >
                  <option value="all">Tất cả lớp ({classList.length} lớp)</option>
                  {classList.map(c => (
                    <option key={c} value={c}>Lớp {c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* TÍNH NĂNG MỚI: LỌC BẢNG ĐIỂM KTTX THEO TỪNG ĐỀ KIỂM TRA */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
              <span className="font-bold text-slate-700 whitespace-nowrap flex items-center gap-1 shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Từng đề kiểm tra:</span>
              </span>
              <div className="relative flex-1">
                <select
                  id="select-filter-specific-exam"
                  value={filterExamId}
                  onChange={(e) => {
                    const newExamId = e.target.value;
                    setFilterExamId(newExamId);
                    if (newExamId !== 'all') {
                      // Nếu chọn đề cụ thể, đồng bộ testNumber nếu có
                      const target = examFilterOptions.find(o => o.id === newExamId);
                      if (target?.testNumber) {
                        const num = target.testNumber.replace(/\D/g, '');
                        if (num) setFilterTestNumber(num);
                      }
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-2.5 pr-8 py-1.5 font-bold text-blue-950 text-xs outline-none focus:border-blue-600 truncate shadow-2xs cursor-pointer"
                  title="Lọc bảng điểm theo từng đề kiểm tra cụ thể trong hệ thống"
                >
                  <option value="all">
                    -- Tất cả đề kiểm tra ({rosterReferenced.length} bài nộp) --
                  </option>
                  {examFilterOptions.map(opt => {
                    const subjName = opt.subject === 'physics' ? 'Vật lí' : opt.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
                    return (
                      <option key={opt.id} value={opt.id}>
                        {opt.grade ? `[K${opt.grade} • ${subjName}] ` : `[${subjName}] `}
                        {opt.title} ({opt.count} bài)
                      </option>
                    );
                  })}
                </select>
                {filterExamId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilterExamId('all')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md flex items-center justify-center cursor-pointer transition-colors"
                    title="Bỏ lọc đề này, xem tất cả đề"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Toggle Chart Button (chỉ giáo viên xem toàn trường) */}
            {isAdmin && (
              <button
                onClick={() => setShowChart(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer shrink-0 ${
                  showChart
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title="Ẩn / Hiện biểu đồ phân phối điểm số"
              >
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>{showChart ? 'Thu gọn biểu đồ' : 'Xem biểu đồ'}</span>
                {showChart ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Search input (chỉ giáo viên tìm kiếm danh sách học sinh) */}
          {isAdmin && (
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên học sinh..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
              />
            </div>
          )}
        </div>

        {/* THÔNG BÁO TRẠNG THÁI: ĐANG LỌC THEO TỪNG ĐỀ KIỂM TRA CỤ THỂ */}
        {filterExamId !== 'all' && (
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-semibold text-slate-700">Đang lọc bảng điểm theo đề:</span>
              <span className="font-black text-blue-950 bg-white px-2.5 py-1 rounded-lg border border-blue-300 shadow-2xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{examFilterOptions.find(e => e.id === filterExamId)?.title || filterExamId}</span>
              </span>
              <span className="bg-blue-600 text-white font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs">
                {filtered.length} bài làm
              </span>
            </div>
            <div className="flex items-center gap-2">
              {canManageScores && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(true)}
                  disabled={filtered.length === 0}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                  title="Xóa toàn bộ điểm của đề kiểm tra này trong bảng điểm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa điểm đề này ({filtered.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setFilterExamId('all')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs cursor-pointer border border-slate-300 shadow-2xs transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xem tất cả đề</span>
              </button>
            </div>
          </div>
        )}

        {/* Nút click chọn đề kiểm tra (Đề 1 đến Đề 8 mỗi phân môn) & Tải về */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-slate-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              ĐỀ KIỂM TRA (ĐỀ 1 - ĐỀ 8):
            </span>

            {/* All tests button */}
            <button
              onClick={() => setFilterTestNumber('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTestNumber === 'all'
                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Tất cả đề</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filterTestNumber === 'all' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {testNumberCounts['all'] || 0}
              </span>
            </button>

            {/* Buttons for Đề 1 đến Đề 8 */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const numStr = String(num);
              const isSelected = filterTestNumber === numStr;
              const count = testNumberCounts[numStr] || 0;

              return (
                <button
                  key={num}
                  id={`scoreboard-filter-test-${num}`}
                  onClick={() => setFilterTestNumber(numStr)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Lọc xem điểm Đề ${num} (${filterSubject === 'all' ? 'Tất cả phân môn' : filterSubject === 'physics' ? 'Vật lí' : filterSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'})`}
                >
                  <span>Đề {num}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected 
                      ? 'bg-indigo-800 text-white' 
                      : count > 0 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Download Scoreboard Button - Chỉ hiển thị cho Giáo viên Quản trị */}
          {canManageScores && (
            <button
              onClick={handleDownloadScoreboard}
              disabled={filtered.length === 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              title="Tải về bảng điểm KTTX ra file Excel (.xlsx) theo bộ lọc lớp, môn, đề"
            >
              <Download className="w-3.5 h-3.5" />
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>
                {filterClass !== 'all' || filterTestNumber !== 'all' || filterSubject !== 'all'
                  ? `Tải điểm ${filterClass !== 'all' ? `Lớp ${filterClass}` : ''} ${filterSubject !== 'all' ? (filterSubject === 'physics' ? 'Vật lí' : filterSubject === 'chemistry' ? 'Hóa học' : 'Sinh học') : ''} ${filterTestNumber !== 'all' ? `Đề ${filterTestNumber}` : ''} (Excel)`
                  : 'Tải về bảng điểm (Excel)'}
              </span>
            </button>
          )}
        </div>

        {/* Scrollable Modal Content: Chart Section + Submissions Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* SECTION: BIỂU ĐỒ CỘT PHÂN PHỐI ĐIỂM SỐ (RECHARTS - DÀNH CHO GIÁO VIÊN) */}
          {isAdmin && showChart && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              
              {/* Chart Card Header */}
              <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Biểu Đồ Phân Phối Điểm Số Các Lớp</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {filterClass === 'all' ? 'Tất cả lớp' : `Lớp ${filterClass}`}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {filterClass === 'all'
                        ? 'Thống kê xếp loại học lực (Giỏi, Khá, TB, Chưa đạt) và điểm trung bình theo từng lớp'
                        : `Chi tiết phân phối các mức điểm của học sinh Lớp ${filterClass}`}
                    </p>
                  </div>
                </div>

                {/* Chart Mode Controls (when viewing all classes) */}
                {filterClass === 'all' && (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
                    <button
                      onClick={() => setChartType('grouped')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        chartType === 'grouped'
                          ? 'bg-white text-blue-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cột phân loại
                    </button>
                    <button
                      onClick={() => setChartType('stacked')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        chartType === 'stacked'
                          ? 'bg-white text-blue-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cột xếp chồng
                    </button>
                    <button
                      onClick={() => setChartType('average')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        chartType === 'average'
                          ? 'bg-white text-blue-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Điểm trung bình
                    </button>
                  </div>
                )}
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Tổng số bài làm</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-900">{overallStats.total}</span>
                    <span className="text-xs text-slate-400 font-medium">lượt nộp</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Điểm trung bình</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-blue-700">{overallStats.average}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Tỉ lệ đạt (≥ 5.0đ)</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-emerald-600">{overallStats.passRate}%</span>
                    <span className="text-xs text-emerald-600 font-bold">đạt chuẩn</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500 block">Giỏi (≥ 8.0đ)</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-emerald-700">{overallStats.excellentCount}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({overallStats.total > 0 ? ((overallStats.excellentCount / overallStats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Render Area */}
              <div className="p-4 sm:p-5">
                {classDistributionData.length === 0 || overallStats.total === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <BarChart3 className="w-8 h-8 text-slate-300" />
                    <span>Chưa có dữ liệu bài làm để vẽ biểu đồ phân phối điểm</span>
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {filterClass === 'all' ? (
                        chartType === 'average' ? (
                          <BarChart data={classDistributionData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
                            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 5, 6, 8, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <ReferenceLine y={5.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Đạt (5.0)', fill: '#d97706', fontSize: 10, position: 'right' }} />
                            <ReferenceLine y={8.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Giỏi (8.0)', fill: '#059669', fontSize: 10, position: 'right' }} />
                            <Bar dataKey="Điểm TB" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={42}>
                              {classDistributionData.map((entry: any, index: number) => {
                                const avg = entry['Điểm TB'];
                                const color = avg >= 8.0 ? '#10b981' : avg >= 6.5 ? '#3b82f6' : avg >= 5.0 ? '#f59e0b' : '#f43f5e';
                                return <Cell key={`cell-${index}`} fill={color} />;
                              })}
                            </Bar>
                          </BarChart>
                        ) : (
                          <BarChart data={classDistributionData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Bar dataKey="Giỏi (8.0-10)" stackId={chartType === 'stacked' ? 'a' : undefined} fill="#10b981" radius={chartType === 'stacked' ? undefined : [4, 4, 0, 0]} maxBarSize={chartType === 'stacked' ? 36 : 22} />
                            <Bar dataKey="Khá (6.5-7.9)" stackId={chartType === 'stacked' ? 'a' : undefined} fill="#3b82f6" radius={chartType === 'stacked' ? undefined : [4, 4, 0, 0]} maxBarSize={chartType === 'stacked' ? 36 : 22} />
                            <Bar dataKey="Trung bình (5.0-6.4)" stackId={chartType === 'stacked' ? 'a' : undefined} fill="#f59e0b" radius={chartType === 'stacked' ? undefined : [4, 4, 0, 0]} maxBarSize={chartType === 'stacked' ? 36 : 22} />
                            <Bar dataKey="Dưới 5.0 (Chưa đạt)" stackId={chartType === 'stacked' ? 'a' : undefined} fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={chartType === 'stacked' ? 36 : 22} />
                          </BarChart>
                        )
                      ) : (
                        <BarChart data={classDistributionData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar dataKey="Số học sinh" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {classDistributionData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Score scale reference legend */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-700">Quy chuẩn xếp loại:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Giỏi (8.0 - 10.0đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Khá (6.5 - 7.9đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Trung bình (5.0 - 6.4đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Chưa đạt (&lt; 5.0đ)
                    </span>
                  </div>
                  <span className="text-slate-400 italic">
                    Biểu đồ tự động đồng bộ theo bộ lọc Phân môn & Lớp học
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: BẢNG KẾT QUẢ BÀI LÀM CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Danh Sách Kết Quả Bài Làm Chi Tiết</span>
                <span className="bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-full text-[10px]">
                  {filtered.length} bài
                </span>
                {filterTestNumber !== 'all' && (
                  <span className="bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                    Đề {filterTestNumber}
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-2">
                {canManageScores && (
                  <button
                    onClick={handleDownloadScoreboard}
                    disabled={filtered.length === 0}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Tải về file Excel"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải Excel</span>
                  </button>
                )}
                {canManageScores && (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirmModal(true)}
                    disabled={filtered.length === 0}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Xóa kết quả trong bảng điểm (Quyền Giáo viên Quản trị)"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>
                      {filterExamId !== 'all' ? `Xóa điểm đề này (${filtered.length})` : `Xóa bảng điểm (${filtered.length})`}
                    </span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Hiển thị học sinh chính thức trường THCS Y Đôn
                </span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500 text-xs flex flex-col items-center justify-center space-y-3.5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 my-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-sm">Chưa có kết quả nộp bài nào hoặc vừa cập nhật phiên bản mới.</p>
                  <p className="text-slate-500 text-xs mt-1 max-w-md">
                    Thầy/Cô hãy bấm <strong>"Up bảng điểm lên"</strong> để tải file Excel (.xlsx), JSON từ app đã xuất bản hoặc dán bảng điểm vào đây để hệ thống cập nhật ngay!
                  </p>
                </div>
                {canManageScores && onOpenSyncRestore && (
                  <button
                    onClick={onOpenSyncRestore}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300 ring-2 ring-amber-300/40"
                  >
                    <Upload className="w-4 h-4 text-slate-950" />
                    <span>Up bảng điểm lên (Excel / JSON / Dán dữ liệu)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Học sinh</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">Đề kiểm tra</th>
                      <th className="p-3">Phân môn</th>
                      <th className="p-3 text-center">Điểm số</th>
                      <th className="p-3">Giám sát vi phạm</th>
                      <th className="p-3">Thời gian nộp</th>
                      <th className="p-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((sub) => {
                      const score = sub.totalScore;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>{sub.studentName}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                              {sub.className}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate font-medium text-slate-800">
                            {sub.examTitle}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.subject === 'physics' ? 'bg-blue-100 text-blue-800' :
                              sub.subject === 'chemistry' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {sub.subject === 'physics' ? 'Vật lí' : sub.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-sm ${
                              score >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                              score >= 5.0 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {score.toFixed(1)}
                            </span>
                          </td>
                          <td className="p-3">
                            {sub.violationsCount && sub.violationsCount > 0 ? (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                                sub.penaltyApplied === 'locked_zero' 
                                  ? 'bg-black text-white' 
                                  : sub.penaltyApplied === 'minus_50_percent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                <ShieldAlert className="w-3 h-3" />
                                {sub.penaltyApplied === 'locked_zero' 
                                  ? 'Khóa bài (0đ)' 
                                  : sub.penaltyApplied === 'minus_50_percent'
                                  ? 'Trừ 50% điểm'
                                  : 'Nhắc nhở 1 lần'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">
                                ✓ Nghiêm túc
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {sub.submittedAt}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  onClose();
                                  onViewSubmission(sub);
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Xem chi tiết bài làm"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Xem</span>
                              </button>
                              {canManageScores && onDeleteSubmission && (
                                <button
                                  onClick={() => setDeleteTargetSub(sub)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition-colors cursor-pointer"
                                  title="Xóa kết quả bài thi này (Quyền Admin)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Tổng số lượt nộp: <strong>{filtered.length}</strong> bài làm</span>
            {filterTestNumber !== 'all' && (
              <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                (Đang lọc: Đề {filterTestNumber})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canManageScores && onOpenSyncRestore && (
              <button
                onClick={onOpenSyncRestore}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs border border-amber-300"
                title="Tải lên bảng điểm từ file Excel, JSON hoặc dán trực tiếp để hệ thống cập nhật kết quả"
              >
                <Upload className="w-3.5 h-3.5 text-slate-950" />
                <span>Up bảng điểm lên</span>
              </button>
            )}
            {canManageScores && (
              <button
                onClick={handleDownloadScoreboard}
                disabled={filtered.length === 0}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tải về bảng điểm (Excel)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      {/* CONFIRM DELETE SUBMISSION MODAL */}
      {deleteTargetSub && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Xóa bài nộp trong bảng điểm?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Xác nhận xóa kết quả bài thi của học sinh <strong>{deleteTargetSub.studentName}</strong> (Lớp {deleteTargetSub.className})? Thao tác không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTargetSub(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSubmission && deleteTargetSub) {
                    onDeleteSubmission(deleteTargetSub.id);
                  }
                  setDeleteTargetSub(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR SCOREBOARD MODAL - CHỈ DÀNH CHO ADMIN */}
      {showClearConfirmModal && canManageScores && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {filterExamId !== 'all' ? 'Xóa điểm của đề kiểm tra?' : 'Xóa dữ liệu bảng điểm KTTX?'}
                </h4>
                <p className="text-xs text-rose-600 font-bold mt-0.5">
                  Quyền thực hiện: Giáo viên Quản trị (Admin)
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-2 leading-relaxed">
              <p>
                Thầy/Cô có chắc chắn muốn xóa <strong>{filtered.length} kết quả bài làm</strong> {
                  filterExamId !== 'all' 
                    ? `của đề "${examFilterOptions.find(e => e.id === filterExamId)?.title || filterExamId}"` 
                    : filterClass !== 'all' 
                    ? `của Lớp ${filterClass}` 
                    : 'trong bảng điểm KTTX'
                }?
              </p>
              <p className="font-bold text-rose-700">
                ⚠️ Cảnh báo an toàn: Thao tác này sẽ xóa vĩnh viễn các lượt nộp này khỏi hệ thống và không thể khôi phục tự động.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteClearScoreboard}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa ({filtered.length} bài)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
