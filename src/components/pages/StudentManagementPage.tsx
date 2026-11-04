import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Download,
  Upload,
  Trash2,
  Edit,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { StudentRecord } from '../../types';
import * as XLSX from 'xlsx';
import {
  DEFAULT_STUDENT_ROSTER,
  saveActiveStudentRoster,
  getActiveStudentRoster,
  deleteStudentFromRoster,
  deleteMultipleStudentsFromRoster,
  clearStudentRoster,
  syncStudentRosterFromServer,
  getLastRosterSavedTime,
  parseStudentsFromDocx,
  normalizeVietnamese,
  downloadAllClassesTemplateExcel,
  parseMultiClassStudentsFromWorkbook,
  TUITION_MONTH_COLUMNS,
  TuitionMonthColumn,
  ensureMonthlyTuitionMap,
  updateStudentMonthTuition,
  exportStudentsToStandardExcel,
  deriveGradeFromClass,
} from '../../utils/studentRoster';

export const INITIAL_STUDENTS: StudentRecord[] = DEFAULT_STUDENT_ROSTER;

export const StudentManagementPage: React.FC = () => {
  const { classes, showToast, setIsAuthModalOpen, setActivePage, settings } = useApp();
  const { isAdmin } = useAuth();

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    return getActiveStudentRoster();
  });
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => getLastRosterSavedTime());
  const [isSavingRoster, setIsSavingRoster] = useState(false);
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [lastUploadClassBreakdown, setLastUploadClassBreakdown] = useState<
    Record<string, number> | null
  >(null);

  // Multi-select checkboxes for deleting multiple students
  const [selectedStudentKeys, setSelectedStudentKeys] = useState<Set<string>>(new Set());

  // Undo backup state
  const [undoBackup, setUndoBackup] = useState<{
    label: string;
    previousRoster: StudentRecord[];
  } | null>(null);

  // Custom modal for "Xóa danh sách"
  const [showClearRosterModal, setShowClearRosterModal] = useState(false);

  // Quick inline row state in the table so teacher can always type & click "X" / "Ch" directly in the table
  const [quickRow, setQuickRow] = useState<{
    fullName: string;
    school: string;
    enrolledClass: string;
    monthlyTuition: Record<string, 'X' | 'Ch'>;
  }>(() => ({
    fullName: '',
    school: 'THCS Quang Trung',
    enrolledClass: classes[0]?.name || 'H8.1',
    monthlyTuition: ensureMonthlyTuitionMap(),
  }));

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState<Partial<StudentRecord>>({
    studentCode: '',
    fullName: '',
    email: '',
    phone: '',
    school: '',
    grade: 'Khối 8',
    enrolledClass: 'H8.1',
    status: 'studying',
    roadmapStage: 'Đang học đúng lộ trình',
    tuitionStatus: 'unpaid',
    monthlyTuition: ensureMonthlyTuitionMap(),
    notes: '',
  });

  useEffect(() => {
    syncStudentRosterFromServer().then((synced) => {
      setStudents(synced);
      setLastSavedTime(getLastRosterSavedTime());
    });

    const refreshRoster = () => {
      setStudents(getActiveStudentRoster());
      setLastSavedTime(getLastRosterSavedTime());
    };
    window.addEventListener('ndh-roster-updated', refreshRoster);
    return () => window.removeEventListener('ndh-roster-updated', refreshRoster);
  }, []);

  const updateAndPersistStudents = async (next: StudentRecord[]) => {
    setStudents(next);
    await saveActiveStudentRoster(next);
    setLastSavedTime(getLastRosterSavedTime());
  };

  // Explicit "LƯU DANH SÁCH" button handler
  const handleManualSaveRoster = async () => {
    setIsSavingRoster(true);
    try {
      let rosterToSave = [...students];

      if (quickRow.fullName.trim()) {
        const cls = quickRow.enrolledClass || (filterClass !== 'all' ? filterClass : 'H8.1');
        const paidMonths = TUITION_MONTH_COLUMNS.filter(
          (col) => quickRow.monthlyTuition[col] === 'X'
        );
        const anyPaid = paidMonths.length > 0;
        const today = new Date().toLocaleDateString('vi-VN');

        const newRecord: StudentRecord = {
          id: 'st-' + Date.now(),
          studentCode: `NDH-${cls.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${String(
            rosterToSave.length + 1
          ).padStart(2, '0')}`,
          fullName: quickRow.fullName.trim(),
          school: quickRow.school.trim() || 'THCS',
          grade: deriveGradeFromClass(cls),
          enrolledClass: cls,
          status: 'studying',
          roadmapStage: 'Đang học đúng lộ trình',
          monthlyTuition: { ...quickRow.monthlyTuition },
          tuitionStatus: anyPaid ? 'paid' : 'unpaid',
          tuitionMonth: paidMonths[paidMonths.length - 1] || 'Th06',
          tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
          tuitionPaidDate: anyPaid ? today : '',
          createdAt: today,
        };
        rosterToSave = [...rosterToSave, newRecord];
        setStudents(rosterToSave);
        setQuickRow({
          fullName: '',
          school: quickRow.school,
          enrolledClass: cls,
          monthlyTuition: ensureMonthlyTuitionMap(),
        });
      }

      await saveActiveStudentRoster(rosterToSave);
      setLastSavedTime(getLastRosterSavedTime());
      showToast(
        `Đã lưu danh sách học sinh (${rosterToSave.length} học sinh) vào hệ thống & đồng bộ Máy chủ thành công!`,
        'success'
      );
    } finally {
      setIsSavingRoster(false);
    }
  };

  // Delete single student immediately (no window.confirm block!) with Undo support
  const handleDeleteStudent = (st: StudentRecord) => {
    setUndoBackup({
      label: `học sinh "${st.fullName}" (Lớp ${st.enrolledClass})`,
      previousRoster: [...students],
    });
    const updated = deleteStudentFromRoster(students, st);
    setStudents(updated);
    setSelectedStudentKeys((prev) => {
      const next = new Set(prev);
      next.delete(st.id || st.studentCode);
      return next;
    });
    setLastSavedTime(getLastRosterSavedTime());
    showToast(
      `Đã xóa học sinh "${st.fullName}" khỏi lớp ${st.enrolledClass} và lưu lại danh sách.`,
      'info'
    );
  };

  // Delete selected students in bulk
  const handleDeleteSelectedStudents = () => {
    if (selectedStudentKeys.size === 0) return;
    const count = selectedStudentKeys.size;
    setUndoBackup({
      label: `${count} học sinh đã chọn`,
      previousRoster: [...students],
    });
    const updated = deleteMultipleStudentsFromRoster(students, selectedStudentKeys);
    setStudents(updated);
    setSelectedStudentKeys(new Set());
    setLastSavedTime(getLastRosterSavedTime());
    showToast(`Đã xóa ${count} học sinh đã chọn và lưu danh sách!`, 'info');
  };

  // Clear entire class list or all classes list
  const handleConfirmClearRoster = async (targetClass: string | 'all') => {
    const isAll = targetClass === 'all';
    const removedCount = isAll
      ? students.length
      : students.filter((s) => s.enrolledClass === targetClass).length;

    if (removedCount === 0) {
      showToast('Danh sách này hiện đang trống.', 'info');
      setShowClearRosterModal(false);
      return;
    }

    setUndoBackup({
      label: isAll
        ? `toàn bộ danh sách (${removedCount} học sinh)`
        : `danh sách lớp ${targetClass} (${removedCount} học sinh)`,
      previousRoster: [...students],
    });

    const updated = await clearStudentRoster(students, targetClass);
    setStudents(updated);
    setSelectedStudentKeys(new Set());
    setLastUploadClassBreakdown(null);
    setShowClearRosterModal(false);
    setLastSavedTime(getLastRosterSavedTime());

    showToast(
      isAll
        ? `Đã xóa toàn bộ danh sách (${removedCount} học sinh) thành công!`
        : `Đã xóa danh sách lớp ${targetClass} (${removedCount} học sinh) thành công!`,
      'info'
    );
  };

  // Restore from Undo backup
  const handleUndoDelete = async () => {
    if (!undoBackup) return;
    const restored = undoBackup.previousRoster;
    await updateAndPersistStudents(restored);
    showToast(`Đã khôi phục ${undoBackup.label}!`, 'success');
    setUndoBackup(null);
  };

  // Click to select "X" or "Ch" in any month column (Th06..Th05)
  const handleSelectMonthTuition = (
    st: StudentRecord,
    monthCol: TuitionMonthColumn,
    mark: 'X' | 'Ch'
  ) => {
    const key = st.id || st.studentCode;
    const updated = updateStudentMonthTuition(
      students,
      key,
      monthCol,
      mark,
      settings.defaultTuitionAmount || 600000
    );
    setStudents(updated);
    setLastSavedTime(getLastRosterSavedTime());
    showToast(
      `Đã lưu học phí ${monthCol} của HS "${st.fullName}" -> "${mark}" (${
        mark === 'X' ? 'Đã đóng' : 'Chưa đóng'
      })`,
      'success'
    );
  };

  // Save quick inline row from table
  const handleAddQuickRowStudent = () => {
    if (!quickRow.fullName.trim()) {
      showToast('Vui lòng nhập Họ và tên HS vào dòng thêm nhanh.', 'error');
      return;
    }
    const cls = quickRow.enrolledClass || (filterClass !== 'all' ? filterClass : 'H8.1');
    const paidMonths = TUITION_MONTH_COLUMNS.filter(
      (col) => quickRow.monthlyTuition[col] === 'X'
    );
    const anyPaid = paidMonths.length > 0;
    const today = new Date().toLocaleDateString('vi-VN');

    const newRecord: StudentRecord = {
      id: 'st-' + Date.now(),
      studentCode: `NDH-${cls.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${String(
        students.length + 1
      ).padStart(2, '0')}`,
      fullName: quickRow.fullName.trim(),
      school: quickRow.school.trim() || 'THCS',
      grade: deriveGradeFromClass(cls),
      enrolledClass: cls,
      status: 'studying',
      roadmapStage: 'Đang học đúng lộ trình',
      monthlyTuition: { ...quickRow.monthlyTuition },
      tuitionStatus: anyPaid ? 'paid' : 'unpaid',
      tuitionMonth: paidMonths[paidMonths.length - 1] || 'Th06',
      tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
      tuitionPaidDate: anyPaid ? today : '',
      createdAt: today,
    };

    updateAndPersistStudents([...students, newRecord]);
    setQuickRow({
      fullName: '',
      school: quickRow.school,
      enrolledClass: cls,
      monthlyTuition: ensureMonthlyTuitionMap(),
    });
    showToast(`Đã thêm và lưu học sinh "${newRecord.fullName}" vào lớp ${cls}!`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const defaultCls = filterClass !== 'all' ? filterClass : 'H8.1';
    setForm({
      studentCode: 'NDH-' + String(students.length + 1).padStart(3, '0'),
      fullName: '',
      email: '',
      phone: '',
      school: '',
      grade: deriveGradeFromClass(defaultCls),
      enrolledClass: defaultCls,
      status: 'studying',
      roadmapStage: 'Đang học đúng lộ trình',
      tuitionStatus: 'unpaid',
      monthlyTuition: ensureMonthlyTuitionMap(),
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st: StudentRecord) => {
    setEditingStudent(st);
    setForm({
      ...st,
      monthlyTuition: ensureMonthlyTuitionMap(st),
    });
    setShowModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.enrolledClass) {
      showToast('Vui lòng điền đủ Họ và tên HS và Lớp học thêm.', 'error');
      return;
    }

    const monthly = ensureMonthlyTuitionMap(form);
    const paidMonths = TUITION_MONTH_COLUMNS.filter((col) => monthly[col] === 'X');
    const anyPaid = paidMonths.length > 0;
    const today = new Date().toLocaleDateString('vi-VN');

    if (editingStudent) {
      const next = students.map((s) =>
        s.id === editingStudent.id
          ? ({
              ...s,
              ...form,
              grade: deriveGradeFromClass(form.enrolledClass!, form.grade),
              monthlyTuition: monthly,
              tuitionStatus: anyPaid ? 'paid' : 'unpaid',
              tuitionMonth: paidMonths[paidMonths.length - 1] || s.tuitionMonth,
            } as StudentRecord)
          : s
      );
      updateAndPersistStudents(next);
      showToast('Đã lưu cập nhật học sinh thành công!', 'success');
    } else {
      const code =
        form.studentCode?.trim() ||
        'NDH-' + String(students.length + 1).padStart(3, '0');

      const newRecord: StudentRecord = {
        id: 'st-' + Date.now(),
        studentCode: code,
        fullName: form.fullName.trim(),
        email: form.email,
        phone: form.phone,
        school: form.school?.trim() || 'THCS',
        grade: deriveGradeFromClass(form.enrolledClass!, form.grade),
        enrolledClass: form.enrolledClass!,
        status: form.status || 'studying',
        roadmapStage: form.roadmapStage || 'Đang học đúng lộ trình',
        monthlyTuition: monthly,
        tuitionStatus: anyPaid ? 'paid' : 'unpaid',
        tuitionMonth: paidMonths[paidMonths.length - 1] || 'Th06',
        tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
        tuitionPaidDate: anyPaid ? today : '',
        notes: form.notes,
        createdAt: today,
      };

      updateAndPersistStudents([...students, newRecord]);
      showToast('Đã thêm và lưu học sinh mới thành công!', 'success');
    }

    setShowModal(false);
  };

  // Export to Excel using exact standard table layout:
  // STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06..Th05)
  const handleExportExcel = () => {
    exportStudentsToStandardExcel(
      filteredStudents,
      `Danh_Sach_Hoc_Sinh_NDH_${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Danh_Sach_HS'
    );
    showToast(
      'Đã xuất danh sách học sinh theo chuẩn bảng (STT / Họ và tên HS / HS trường / Lớp học thêm / Th06..Th05)!',
      'success'
    );
  };

  // Download unified template Excel for ALL classes in 1 file
  const handleDownloadTemplate = () => {
    const classNames =
      classes && classes.length > 0
        ? classes.map((c) => c.name)
        : ['H6.1', 'H7.1', 'H8.1', 'H8.2', 'H9.1', 'H9.2', 'Bồi dưỡng HSG cấp tỉnh, thành phố'];
    downloadAllClassesTemplateExcel(classNames, settings.defaultTuitionAmount || 600000);
    showToast(
      'Đã tải xuống Mẫu DS Học Sinh (STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí Th06..Th05)!',
      'success'
    );
  };

  // Import from Excel or Word (.docx) and automatically filter students into each class & save immediately
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const defaultCls = filterClass !== 'all' ? filterClass : 'H8.1';

    if (ext === 'docx') {
      try {
        const parsed = await parseStudentsFromDocx(file, defaultCls);
        if (parsed.length === 0) {
          showToast('Không tìm thấy học sinh nào trong file Word (.docx).', 'error');
          e.target.value = '';
          return;
        }
        const currentRoster = uploadMode === 'replace' ? [] : [...students];
        let addedCount = 0;
        let updatedCount = 0;
        const breakdown: Record<string, number> = {};

        parsed.forEach((st) => {
          breakdown[st.enrolledClass] = (breakdown[st.enrolledClass] || 0) + 1;
          const idx = currentRoster.findIndex(
            (s) =>
              normalizeVietnamese(s.fullName) === normalizeVietnamese(st.fullName) &&
              s.enrolledClass === st.enrolledClass
          );
          if (idx >= 0) {
            currentRoster[idx] = { ...currentRoster[idx], ...st, id: currentRoster[idx].id };
            updatedCount++;
          } else {
            currentRoster.push(st);
            addedCount++;
          }
        });
        await updateAndPersistStudents(currentRoster);
        setLastUploadClassBreakdown(breakdown);
        const summaryStr = Object.entries(breakdown)
          .map(([cls, count]) => `${cls} (${count} HS)`)
          .join(', ');
        showToast(
          `Đã lưu danh sách học sinh từ file Word vào ${Object.keys(breakdown).length} lớp [${summaryStr}]: Thêm mới ${addedCount}, Cập nhật ${updatedCount}!`,
          'success'
        );
      } catch {
        showToast('Lỗi khi đọc file Word (.docx).', 'error');
      }
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: 'array' });
        const { students: parsedList, classCounts } = parseMultiClassStudentsFromWorkbook(
          wb,
          defaultCls,
          settings.defaultTuitionAmount || 600000
        );

        if (parsedList.length === 0) {
          showToast('Không tìm thấy dữ liệu học sinh hợp lệ trong file Excel.', 'error');
          return;
        }

        const currentRoster = uploadMode === 'replace' ? [] : [...students];
        let addedCount = 0;
        let updatedCount = 0;

        parsedList.forEach((studentData) => {
          const existingIdx = currentRoster.findIndex(
            (s) =>
              (s.studentCode &&
                s.studentCode.toLowerCase() === studentData.studentCode.toLowerCase()) ||
              (normalizeVietnamese(s.fullName) === normalizeVietnamese(studentData.fullName) &&
                s.enrolledClass === studentData.enrolledClass)
          );

          if (existingIdx >= 0) {
            currentRoster[existingIdx] = {
              ...currentRoster[existingIdx],
              ...studentData,
              id: currentRoster[existingIdx].id,
            };
            updatedCount++;
          } else {
            currentRoster.push(studentData);
            addedCount++;
          }
        });

        await updateAndPersistStudents(currentRoster);
        setLastUploadClassBreakdown(classCounts);

        const summaryStr = Object.entries(classCounts)
          .map(([cls, count]) => `${cls}: ${count} HS`)
          .join(' | ');

        showToast(
          `Đã lưu danh sách học sinh vào ${Object.keys(classCounts).length} lớp (${summaryStr}) — Thêm mới ${addedCount}, Cập nhật ${updatedCount}!`,
          'success'
        );
      } catch {
        showToast('Lỗi khi đọc file danh sách học sinh.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const filteredStudents = students.filter((s) => {
    if (filterClass !== 'all' && s.enrolledClass !== filterClass) return false;
    if (filterGrade !== 'all' && s.grade !== filterGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        (s.school && s.school.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }
    return true;
  });

  // Toggle selection checkbox for a single student
  const toggleSelectStudent = (key: string) => {
    setSelectedStudentKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Toggle select all visible students
  const toggleSelectAllVisible = () => {
    if (filteredStudents.length === 0) return;
    const allVisibleSelected = filteredStudents.every((s) =>
      selectedStudentKeys.has(s.id || s.studentCode)
    );
    if (allVisibleSelected) {
      setSelectedStudentKeys(new Set());
    } else {
      const next = new Set<string>();
      filteredStudents.forEach((s) => next.add(s.id || s.studentCode));
      setSelectedStudentKeys(next);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">
          Quản Lý Hồ Sơ & Danh Sách Học Sinh (Dành Cho Quản Trị Viên)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Tính năng úp danh sách học sinh, lưu danh sách, xóa danh sách và quản lý hồ sơ dành riêng cho Quản trị viên. Học sinh vui lòng truy cập mục Làm bài kiểm tra, Gửi bài tập hoặc Đóng học phí.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Đăng nhập Quản trị viên</span>
          </button>
          <button
            onClick={() => setActivePage('interactive-quiz')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
          >
            <span>Làm Bài Kiểm Tra</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200">
              <Users className="w-3.5 h-3.5" />
              Mục số 3 trong Quản trị: Quản lý, Úp & Lưu danh sách học sinh
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Đã lưu: <strong>{students.length} học sinh</strong>
                {lastSavedTime ? ` (Lúc ${lastSavedTime})` : ''}
              </span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Bảng Danh Sách Học Sinh & Theo Dõi Đóng Học Phí (Th06 → Th05)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết kế chuẩn bảng: <strong>STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06 → Th05)</strong>. Tích hợp nút <strong>Lưu danh sách</strong>, <strong>Xóa danh sách</strong> và nút <strong>Xóa</strong> từng học sinh.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualSaveRoster}
              disabled={isSavingRoster}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingRoster ? 'Đang lưu...' : `Lưu danh sách (${students.length} HS)`}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearRosterModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa danh sách</span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Úp DS tất cả các lớp (Tự lọc & Tự lưu)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .docx"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Tải 1 file Excel mẫu chuẩn bảng (STT / Họ và tên HS / HS trường / Lớp học thêm / Th06..Th05)"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              <span>Tải mẫu Excel</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm HS
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải DS (.XLSX)
            </button>
          </div>
        )}
      </div>

      {/* Undo Banner when a student or list was just deleted */}
      {undoBackup && (
        <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Vừa xóa <strong>{undoBackup.label}</strong>. Bạn có muốn khôi phục lại không?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoDelete}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hoàn tác / Khôi phục ngay</span>
            </button>
            <button
              type="button"
              onClick={() => setUndoBackup(null)}
              className="p-1 text-amber-700 hover:text-amber-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-Filtered Class Breakdown Banner after Upload */}
      {lastUploadClassBreakdown && Object.keys(lastUploadClassBreakdown).length > 0 && (
        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã lưu & tự động lọc học sinh vào từng lớp (Click để lọc):
            </span>
            <button
              type="button"
              onClick={() => setFilterClass('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                filterClass === 'all'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Tất cả các lớp ({students.length} HS)
            </button>
            {Object.entries(lastUploadClassBreakdown).map(([cls, count]) => (
              <button
                key={cls}
                type="button"
                onClick={() => setFilterClass(cls)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                  filterClass === cls
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Lớp {cls}: {count} HS
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLastUploadClassBreakdown(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters, Upload Mode & Bulk Delete Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo Họ và tên HS, HS trường, Lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {selectedStudentKeys.size > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelectedStudents}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedStudentKeys.size} học sinh đã chọn</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            X = Đã đóng học phí
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            Ch = Chưa đóng
          </span>
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white font-bold"
          >
            <option value="all">Tất cả các lớp ({students.length} HS)</option>
            {classes.map((c) => {
              const cCount = students.filter((s) => s.enrolledClass === c.name).length;
              return (
                <option key={c.id} value={c.name}>
                  Lớp {c.name} ({cCount} HS)
                </option>
              );
            })}
          </select>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="Khối 6">Khối 6</option>
            <option value="Khối 7">Khối 7</option>
            <option value="Khối 8">Khối 8</option>
            <option value="Khối 9">Khối 9</option>
            <option value="Bồi dưỡng HSG cấp tỉnh, thành phố">
              Bồi dưỡng HSG cấp tỉnh, thành phố
            </option>
          </select>

          <select
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value as 'merge' | 'replace')}
            className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-700"
            title="Chế độ khi úp file danh sách mới"
          >
            <option value="merge">Khi úp file: Gộp vào DS hiện có</option>
            <option value="replace">Khi úp file: Thay thế DS cũ</option>
          </select>
        </div>
      </div>

      {/* Standard 2-Row Header Table:
          STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06..Th05) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-xs sm:text-sm">
              Danh sách đang hiển thị: <span className="text-cyan-400">{filteredStudents.length} học sinh</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualSaveRoster}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setShowClearRosterModal(true)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa danh sách</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-800 text-white font-bold text-[11px]">
              <tr>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 border border-slate-600 text-center w-9"
                  title="Chọn tất cả"
                >
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every((s) =>
                        selectedStudentKeys.has(s.id || s.studentCode)
                      )
                    }
                    onChange={toggleSelectAllVisible}
                    className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer"
                  />
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2.5 border border-slate-600 text-center w-12"
                >
                  STT
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 border border-slate-600 min-w-[210px]"
                >
                  Họ và tên HS (Kèm nút Sửa / Xóa nhanh)
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 border border-slate-600 min-w-[140px]"
                >
                  HS trường
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 border border-slate-600 text-center min-w-[110px]"
                >
                  Lớp học thêm
                </th>
                <th
                  colSpan={12}
                  className="py-2 px-3 border border-slate-600 text-center bg-cyan-900 text-cyan-100 uppercase tracking-wider"
                >
                  Theo dõi đóng học phí (Click từng ô chọn &quot;X&quot; hoặc &quot;Ch&quot;)
                </th>
                {isAdmin && (
                  <th
                    rowSpan={2}
                    className="py-2.5 px-2.5 border border-slate-600 text-center min-w-[95px]"
                  >
                    Xóa / Sửa HS
                  </th>
                )}
              </tr>
              <tr className="bg-slate-700 text-slate-100">
                {TUITION_MONTH_COLUMNS.map((monthCol) => (
                  <th
                    key={monthCol}
                    className="py-2 px-1.5 border border-slate-600 text-center font-extrabold min-w-[54px]"
                  >
                    {monthCol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((s, idx) => {
                const monthly = ensureMonthlyTuitionMap(s);
                const rowKey = s.id || s.studentCode;
                const isSelected = selectedStudentKeys.has(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className={`transition ${
                      isSelected ? 'bg-red-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-2 border border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStudent(rowKey)}
                        className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2 border border-slate-200 text-center font-mono font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{s.fullName}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="px-1.5 py-0.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold text-[10px] cursor-pointer transition"
                            title="Sửa thông tin học sinh"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s)}
                            className="px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer transition"
                            title={`Xóa học sinh ${s.fullName}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-700">
                      {s.school || 'THCS'}
                    </td>
                    <td className="py-2 px-2 border border-slate-200 text-center">
                      <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-extrabold text-[11px]">
                        {s.enrolledClass}
                      </span>
                    </td>
                    {TUITION_MONTH_COLUMNS.map((colKey) => {
                      const mark = monthly[colKey] || 'Ch';
                      return (
                        <td
                          key={colKey}
                          className="py-1.5 px-1 border border-slate-200 text-center"
                        >
                          <select
                            value={mark}
                            onChange={(e) =>
                              handleSelectMonthTuition(
                                s,
                                colKey,
                                e.target.value as 'X' | 'Ch'
                              )
                            }
                            title={`${s.fullName} - ${colKey}: Click chọn X hoặc Ch`}
                            className={`w-12 py-1 rounded font-black text-xs text-center border cursor-pointer transition focus:outline-none focus:ring-2 ${
                              mark === 'X'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400 hover:bg-emerald-200 focus:ring-emerald-500'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 focus:ring-amber-400'
                            }`}
                          >
                            <option value="X" className="bg-white text-emerald-700 font-black">
                              X
                            </option>
                            <option value="Ch" className="bg-white text-amber-700 font-black">
                              Ch
                            </option>
                          </select>
                        </td>
                      );
                    })}
                    {isAdmin && (
                      <td className="py-2 px-2 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg cursor-pointer transition"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s)}
                            className="px-2 py-1 text-white bg-red-600 hover:bg-red-500 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Quick Inline Entry Row directly inside the table */}
              {isAdmin && (
                <tr className="bg-cyan-50/50">
                  <td
                    colSpan={2}
                    className="py-2 px-2 border border-slate-200 text-center font-mono font-bold text-cyan-700"
                  >
                    +{filteredStudents.length + 1}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-200">
                    <input
                      type="text"
                      placeholder="Nhập Họ và tên HS mới..."
                      value={quickRow.fullName}
                      onChange={(e) =>
                        setQuickRow({ ...quickRow, fullName: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddQuickRowStudent();
                        }
                      }}
                      className="w-full px-2 py-1 rounded border border-cyan-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </td>
                  <td className="py-1.5 px-2 border border-slate-200">
                    <input
                      type="text"
                      placeholder="HS trường (VD: THCS Quang Trung)"
                      value={quickRow.school}
                      onChange={(e) =>
                        setQuickRow({ ...quickRow, school: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded border border-cyan-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </td>
                  <td className="py-1.5 px-2 border border-slate-200 text-center">
                    <select
                      value={quickRow.enrolledClass}
                      onChange={(e) =>
                        setQuickRow({ ...quickRow, enrolledClass: e.target.value })
                      }
                      className="w-full px-1.5 py-1 rounded border border-cyan-300 bg-white text-xs font-bold text-cyan-900"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  {TUITION_MONTH_COLUMNS.map((colKey) => {
                    const mark = quickRow.monthlyTuition[colKey] || 'Ch';
                    return (
                      <td
                        key={colKey}
                        className="py-1.5 px-1 border border-slate-200 text-center"
                      >
                        <select
                          value={mark}
                          onChange={(e) =>
                            setQuickRow({
                              ...quickRow,
                              monthlyTuition: {
                                ...quickRow.monthlyTuition,
                                [colKey]: e.target.value as 'X' | 'Ch',
                              },
                            })
                          }
                          title={`Chọn X hoặc Ch cho ${colKey}`}
                          className={`w-12 py-1 rounded font-black text-xs text-center border cursor-pointer ${
                            mark === 'X'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="X">X</option>
                          <option value="Ch">Ch</option>
                        </select>
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-2 border border-slate-200 text-center">
                    <button
                      type="button"
                      onClick={handleAddQuickRowStudent}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      + Lưu dòng
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: XÓA DANH SÁCH HỌC SINH (Theo lớp hoặc Toàn bộ) */}
      {showClearRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-black text-base">
                <Trash2 className="w-5 h-5" />
                <span>Xóa Danh Sách Học Sinh</span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearRosterModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chọn xóa danh sách học sinh của <strong>từng lớp cụ thể</strong> hoặc xóa <strong>toàn bộ danh sách tất cả các lớp</strong>:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="text-[11px] font-extrabold text-slate-700 uppercase">
                1. Xóa danh sách theo từng lớp:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from(new Set(students.map((s) => s.enrolledClass))).map((clsName) => {
                  const count = students.filter((s) => s.enrolledClass === clsName).length;
                  return (
                    <button
                      key={clsName}
                      type="button"
                      onClick={() => handleConfirmClearRoster(clsName)}
                      className="p-2.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <span>Xóa lớp {clsName}</span>
                      <span className="px-2 py-0.5 rounded bg-white/90 text-red-700 font-black text-[11px]">
                        {count} HS
                      </span>
                    </button>
                  );
                })}
                {students.length === 0 && (
                  <div className="col-span-2 text-xs text-slate-400 italic py-2">
                    Hiện chưa có học sinh nào trong danh sách.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-[11px] font-extrabold text-red-700 uppercase">
                2. Xóa sạch toàn bộ danh sách các lớp:
              </div>
              <button
                type="button"
                onClick={() => handleConfirmClearRoster('all')}
                disabled={students.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÓA TOÀN BỘ DANH SÁCH TẤT CẢ CÁC LỚP ({students.length} HỌC SINH)</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowClearRosterModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal with 12-month X / Ch selector */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                {editingStudent ? 'Cập Nhật Hồ Sơ & Học Phí 12 Tháng' : 'Thêm Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên HS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Minh Khang"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HS trường</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THCS Quang Trung"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp học thêm</label>
                  <select
                    value={form.enrolledClass}
                    onChange={(e) => setForm({ ...form, enrolledClass: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 12-Month Tuition Grid inside Modal: Click chọn "X" hoặc "Ch" */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    Theo dõi đóng học phí 12 tháng (Click chọn &quot;X&quot; hoặc &quot;Ch&quot;)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    <strong>X</strong> = Đã đóng • <strong>Ch</strong> = Chưa đóng
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TUITION_MONTH_COLUMNS.map((colKey) => {
                    const currentMap = ensureMonthlyTuitionMap(form);
                    const val = currentMap[colKey] || 'Ch';
                    return (
                      <div
                        key={colKey}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-center space-y-1.5"
                      >
                        <div className="font-extrabold text-slate-700 text-[11px]">{colKey}</div>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                monthlyTuition: { ...currentMap, [colKey]: 'X' },
                              })
                            }
                            className={`px-2 py-1 rounded font-black text-xs cursor-pointer transition ${
                              val === 'X'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-50'
                            }`}
                          >
                            X
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                monthlyTuition: { ...currentMap, [colKey]: 'Ch' },
                              })
                            }
                            className={`px-2 py-1 rounded font-black text-xs cursor-pointer transition ${
                              val === 'Ch'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-amber-50'
                            }`}
                          >
                            Ch
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại liên hệ (Tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
