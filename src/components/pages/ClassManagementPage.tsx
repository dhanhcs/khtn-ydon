import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Upload,
  Download,
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Users,
  Edit,
  Trash2,
  X,
  ShieldAlert,
  ChevronDown,
  Lock,
  QrCode,
  Save,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { StudentRecord, TuitionRecord } from '../../types';
import * as XLSX from 'xlsx';
import {
  getActiveStudentRoster,
  saveActiveStudentRoster,
  deleteStudentFromRoster,
  deleteMultipleStudentsFromRoster,
  clearStudentRoster,
  syncStudentRosterFromServer,
  getLastRosterSavedTime,
  getSavedTuitionRecords,
  normalizeVietnamese,
  parseStudentsFromDocx,
  downloadAllClassesTemplateExcel,
  parseMultiClassStudentsFromWorkbook,
  TUITION_MONTH_COLUMNS,
  TuitionMonthColumn,
  ensureMonthlyTuitionMap,
  updateStudentMonthTuition,
  exportStudentsToStandardExcel,
  deriveGradeFromClass,
} from '../../utils/studentRoster';

const ROADMAP_STAGES = [
  'Đang học đúng lộ trình',
  'Vượt tiến độ - Tốt',
  'Đội tuyển mũi nhọn HSG',
  'Cần kèm thêm',
];

const SELECTED_CLASS_STORAGE_KEY = 'ndh_selected_class_view';

export const ClassManagementPage: React.FC = () => {
  const { classes, showToast, setActivePage, setIsAuthModalOpen, settings } = useApp();
  const { isAdmin } = useAuth();

  // Remember selected class in localStorage, defaulting to 'all' so uploaded lists across any class are immediately visible
  const [selectedClassName, setSelectedClassName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_CLASS_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTuition, setFilterTuition] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');

  const [students, setStudents] = useState<StudentRecord[]>(() => getActiveStudentRoster());
  const [tuitions, setTuitions] = useState<TuitionRecord[]>(() => getSavedTuitionRecords());
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => getLastRosterSavedTime());
  const [isSavingRoster, setIsSavingRoster] = useState(false);

  const [lastUploadClassBreakdown, setLastUploadClassBreakdown] = useState<
    Record<string, number> | null
  >(null);

  // Multi-select checkboxes for deleting multiple individual students
  const [selectedStudentKeys, setSelectedStudentKeys] = useState<Set<string>>(new Set());

  // Undo backup when deleting 1 student, multiple students, or clearing a list
  const [undoBackup, setUndoBackup] = useState<{
    label: string;
    previousRoster: StudentRecord[];
  } | null>(null);

  // Custom modal for "Xóa danh sách" (avoids window.confirm which is blocked in sandboxed iframes)
  const [showClearRosterModal, setShowClearRosterModal] = useState(false);

  // Quick inline row directly in the class table
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

  // Add/Edit Student in Class Modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState({
    studentCode: '',
    fullName: '',
    school: '',
    phone: '',
    enrolledClass: classes[0]?.name || 'H8.1',
    roadmapStage: 'Đang học đúng lộ trình',
    roadmapProgress: 85,
    roadmapNote: '',
    monthlyTuition: ensureMonthlyTuitionMap(),
  });

  // Sync with server & listen for real-time updates
  useEffect(() => {
    syncStudentRosterFromServer().then((synced) => {
      setStudents(synced);
      setLastSavedTime(getLastRosterSavedTime());
    });

    const refreshData = () => {
      setStudents(getActiveStudentRoster());
      setTuitions(getSavedTuitionRecords());
      setLastSavedTime(getLastRosterSavedTime());
    };
    window.addEventListener('ndh-roster-updated', refreshData);
    window.addEventListener('ndh-tuition-updated', refreshData);
    return () => {
      window.removeEventListener('ndh-roster-updated', refreshData);
      window.removeEventListener('ndh-tuition-updated', refreshData);
    };
  }, []);

  // Persist selectedClassName & keep quickRow class in sync when dropdown changes
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_CLASS_STORAGE_KEY, selectedClassName);
    } catch {}
    if (selectedClassName !== 'all') {
      setQuickRow((prev) => ({ ...prev, enrolledClass: selectedClassName }));
    }
    setSelectedStudentKeys(new Set());
  }, [selectedClassName]);

  const currentClassObj = classes.find((c) => c.name === selectedClassName);

  // Build complete list of classes (including any custom class names from uploaded Excel)
  const allClassOptions = React.useMemo(() => {
    const standardNames = new Set(classes.map((c) => c.name));
    const extraClasses: string[] = [];
    students.forEach((s) => {
      if (s.enrolledClass && !standardNames.has(s.enrolledClass) && !extraClasses.includes(s.enrolledClass)) {
        extraClasses.push(s.enrolledClass);
      }
    });
    return {
      standard: classes,
      extra: extraClasses,
    };
  }, [classes, students]);

  // Check if a student has paid tuition (either any 'X' in monthlyTuition, or on their StudentRecord / TuitionRecords)
  const getStudentTuitionInfo = (st: StudentRecord) => {
    const monthly = ensureMonthlyTuitionMap(st);
    const paidMonths = TUITION_MONTH_COLUMNS.filter((col) => monthly[col] === 'X');
    if (paidMonths.length > 0 || st.tuitionStatus === 'paid') {
      return {
        isPaid: true,
        month: paidMonths[paidMonths.length - 1] || st.tuitionMonth || 'Hiện tại',
        amount: st.tuitionAmount || settings.defaultTuitionAmount || 600000,
        date: st.tuitionPaidDate || '',
        method: st.tuitionPaymentMethod || 'Online QR / Chuyển khoản',
      };
    }

    const normStName = normalizeVietnamese(st.fullName);
    const matchedTuition = tuitions.find(
      (t) =>
        t.status === 'paid' &&
        normalizeVietnamese(t.studentName) === normStName &&
        (!t.classGroup || t.classGroup === st.enrolledClass)
    );

    if (matchedTuition) {
      return {
        isPaid: true,
        month: matchedTuition.month,
        amount: matchedTuition.amountPaid,
        date: matchedTuition.paymentDate || '',
        method: matchedTuition.paymentMethod || 'Chuyển khoản',
      };
    }

    return {
      isPaid: false,
      month:
        st.tuitionMonth ||
        `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`,
      amount: 0,
      date: '',
      method: '',
    };
  };

  // Filter students by selected class from dropdown
  const classStudents = students.filter((s) => {
    if (selectedClassName !== 'all' && s.enrolledClass !== selectedClassName) {
      return false;
    }
    const tuitionInfo = getStudentTuitionInfo(s);
    if (filterTuition === 'paid' && !tuitionInfo.isPaid) return false;
    if (filterTuition === 'unpaid' && tuitionInfo.isPaid) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        (s.school && s.school.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.roadmapNote && s.roadmapNote.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalInClass = classStudents.length;
  const paidInClass = classStudents.filter((s) => getStudentTuitionInfo(s).isPaid).length;
  const unpaidInClass = Math.max(0, totalInClass - paidInClass);
  const goodRoadmapCount = classStudents.filter(
    (s) => !s.roadmapStage || s.roadmapStage !== 'Cần kèm thêm'
  ).length;

  // Explicit "LƯU DANH SÁCH" button handler
  const handleManualSaveRoster = async () => {
    setIsSavingRoster(true);
    try {
      let rosterToSave = [...students];

      // If teacher typed a student name in the quick inline row and clicked "Lưu danh sách", include it automatically!
      if (quickRow.fullName.trim()) {
        const cls =
          quickRow.enrolledClass || (selectedClassName !== 'all' ? selectedClassName : 'H8.1');
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
          roadmapProgress: 85,
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
      const timeStr = getLastRosterSavedTime();
      setLastSavedTime(timeStr);
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
    setStudents(restored);
    await saveActiveStudentRoster(restored);
    setLastSavedTime(getLastRosterSavedTime());
    showToast(`Đã khôi phục ${undoBackup.label}!`, 'success');
    setUndoBackup(null);
  };

  // Toggle selection checkbox for a single student
  const toggleSelectStudent = (key: string) => {
    setSelectedStudentKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Toggle select all visible students in current filter
  const toggleSelectAllVisible = () => {
    if (classStudents.length === 0) return;
    const allVisibleSelected = classStudents.every((s) =>
      selectedStudentKeys.has(s.id || s.studentCode)
    );
    if (allVisibleSelected) {
      setSelectedStudentKeys(new Set());
    } else {
      const next = new Set<string>();
      classStudents.forEach((s) => next.add(s.id || s.studentCode));
      setSelectedStudentKeys(next);
    }
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

  // Add quick inline row from table
  const handleAddQuickRowStudent = () => {
    if (!quickRow.fullName.trim()) {
      showToast('Vui lòng nhập Họ và tên HS vào dòng thêm nhanh.', 'error');
      return;
    }
    const cls =
      quickRow.enrolledClass || (selectedClassName !== 'all' ? selectedClassName : 'H8.1');
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
      roadmapProgress: 85,
      monthlyTuition: { ...quickRow.monthlyTuition },
      tuitionStatus: anyPaid ? 'paid' : 'unpaid',
      tuitionMonth: paidMonths[paidMonths.length - 1] || 'Th06',
      tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
      tuitionPaidDate: anyPaid ? today : '',
      createdAt: today,
    };

    const next = [...students, newRecord];
    setStudents(next);
    saveActiveStudentRoster(next);
    setLastSavedTime(getLastRosterSavedTime());
    setQuickRow({
      fullName: '',
      school: quickRow.school,
      enrolledClass: cls,
      monthlyTuition: ensureMonthlyTuitionMap(),
    });
    showToast(`Đã thêm và lưu học sinh "${newRecord.fullName}" vào lớp ${cls}!`, 'success');
  };

  // Quick update learning roadmap stage inline
  const handleChangeRoadmapStage = (st: StudentRecord, newStage: string) => {
    const updatedRoster = students.map((item) =>
      item.id === st.id ? { ...item, roadmapStage: newStage } : item
    );
    setStudents(updatedRoster);
    saveActiveStudentRoster(updatedRoster);
    setLastSavedTime(getLastRosterSavedTime());
    showToast(`Đã lưu lộ trình học tập cho ${st.fullName}`, 'success');
  };

  const handleOpenAddStudent = () => {
    const targetClass = selectedClassName === 'all' ? 'H8.1' : selectedClassName;
    setEditingStudent(null);
    setForm({
      studentCode: `NDH-${targetClass.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${String(
        students.length + 1
      ).padStart(2, '0')}`,
      fullName: '',
      school: '',
      phone: '',
      enrolledClass: targetClass,
      roadmapStage: 'Đang học đúng lộ trình',
      roadmapProgress: 85,
      roadmapNote: 'Nắm vững kiến thức trọng tâm, làm đầy đủ BTVN',
      monthlyTuition: ensureMonthlyTuitionMap(),
    });
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (st: StudentRecord) => {
    setEditingStudent(st);
    setForm({
      studentCode: st.studentCode,
      fullName: st.fullName,
      school: st.school || '',
      phone: st.phone || '',
      enrolledClass: st.enrolledClass,
      roadmapStage: st.roadmapStage || 'Đang học đúng lộ trình',
      roadmapProgress: st.roadmapProgress ?? 85,
      roadmapNote: st.roadmapNote || st.notes || '',
      monthlyTuition: ensureMonthlyTuitionMap(st),
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh.', 'error');
      return;
    }

    const today = new Date().toLocaleDateString('vi-VN');
    const monthly = ensureMonthlyTuitionMap({ monthlyTuition: form.monthlyTuition });
    const paidMonths = TUITION_MONTH_COLUMNS.filter((col) => monthly[col] === 'X');
    const anyPaid = paidMonths.length > 0;

    if (editingStudent) {
      const updatedRoster = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              studentCode: form.studentCode.trim(),
              fullName: form.fullName.trim(),
              school: form.school.trim() || 'THCS',
              phone: form.phone.trim(),
              enrolledClass: form.enrolledClass,
              grade: deriveGradeFromClass(form.enrolledClass),
              roadmapStage: form.roadmapStage,
              roadmapProgress: Number(form.roadmapProgress),
              roadmapNote: form.roadmapNote.trim(),
              notes: form.roadmapNote.trim(),
              monthlyTuition: monthly,
              tuitionStatus: anyPaid ? ('paid' as const) : ('unpaid' as const),
              tuitionMonth: paidMonths[paidMonths.length - 1] || s.tuitionMonth,
              tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
              tuitionPaidDate: anyPaid ? s.tuitionPaidDate || today : '',
            }
          : s
      );
      setStudents(updatedRoster);
      saveActiveStudentRoster(updatedRoster);
      setLastSavedTime(getLastRosterSavedTime());
      showToast(`Đã lưu cập nhật hồ sơ & học phí 12 tháng của ${form.fullName}!`, 'success');
    } else {
      const newStudent: StudentRecord = {
        id: 'st-' + Date.now(),
        studentCode: form.studentCode.trim() || `NDH-${Date.now().toString().slice(-4)}`,
        fullName: form.fullName.trim(),
        school: form.school.trim() || 'THCS',
        phone: form.phone.trim(),
        enrolledClass: form.enrolledClass,
        grade: deriveGradeFromClass(form.enrolledClass),
        status: 'studying',
        roadmapStage: form.roadmapStage,
        roadmapProgress: Number(form.roadmapProgress),
        roadmapNote: form.roadmapNote.trim(),
        notes: form.roadmapNote.trim(),
        monthlyTuition: monthly,
        tuitionStatus: anyPaid ? 'paid' : 'unpaid',
        tuitionMonth: paidMonths[paidMonths.length - 1] || 'Th06',
        tuitionAmount: anyPaid ? settings.defaultTuitionAmount || 600000 : 0,
        tuitionPaidDate: anyPaid ? today : '',
        createdAt: today,
      };
      const updatedRoster = [...students, newStudent];
      setStudents(updatedRoster);
      saveActiveStudentRoster(updatedRoster);
      setLastSavedTime(getLastRosterSavedTime());
      showToast(
        `Đã thêm và lưu học sinh ${newStudent.fullName} vào lớp ${newStudent.enrolledClass}!`,
        'success'
      );
    }

    setShowStudentModal(false);
  };

  // Upload Excel or Word Roster (Supports 1 file containing ALL classes -> auto-filters into each class & saves immediately)
  const handleImportClassRosterExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetClass = selectedClassName === 'all' ? 'H8.1' : selectedClassName;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (ext === 'docx') {
      try {
        const parsed = await parseStudentsFromDocx(file, targetClass);
        if (parsed.length === 0) {
          showToast('Không tìm thấy danh sách học sinh hợp lệ trong file Word (.docx).', 'error');
          e.target.value = '';
          return;
        }
        const currentRoster = uploadMode === 'replace' ? [] : [...students];
        let addedCount = 0;
        let updatedCount = 0;
        const breakdown: Record<string, number> = {};

        parsed.forEach((st) => {
          breakdown[st.enrolledClass] = (breakdown[st.enrolledClass] || 0) + 1;
          const existingIdx = currentRoster.findIndex(
            (s) =>
              normalizeVietnamese(s.fullName) === normalizeVietnamese(st.fullName) &&
              s.enrolledClass === st.enrolledClass
          );
          if (existingIdx >= 0) {
            currentRoster[existingIdx] = {
              ...currentRoster[existingIdx],
              ...st,
              id: currentRoster[existingIdx].id,
            };
            updatedCount++;
          } else {
            currentRoster.push(st);
            addedCount++;
          }
        });

        setStudents(currentRoster);
        await saveActiveStudentRoster(currentRoster);
        setLastSavedTime(getLastRosterSavedTime());
        setLastUploadClassBreakdown(breakdown);

        const uploadedClasses = Object.keys(breakdown);
        if (uploadedClasses.length === 1) {
          setSelectedClassName(uploadedClasses[0]);
        } else if (selectedClassName !== 'all' && !breakdown[selectedClassName]) {
          setSelectedClassName('all');
        }

        const summaryStr = Object.entries(breakdown)
          .map(([cls, count]) => `${cls} (${count} HS)`)
          .join(', ');
        showToast(
          `Đã lưu danh sách học sinh từ file Word vào ${uploadedClasses.length} lớp [${summaryStr}]: Thêm mới ${addedCount}, Cập nhật ${updatedCount}!`,
          'success'
        );
      } catch {
        showToast('Lỗi khi đọc file Word (.docx) danh sách lớp.', 'error');
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
          targetClass,
          settings.defaultTuitionAmount || 600000
        );

        if (parsedList.length === 0) {
          showToast('Không tìm thấy dữ liệu học sinh hợp lệ trong file Excel.', 'error');
          return;
        }

        let addedCount = 0;
        let updatedCount = 0;
        const currentRoster = uploadMode === 'replace' ? [] : [...students];

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

        setStudents(currentRoster);
        await saveActiveStudentRoster(currentRoster);
        setLastSavedTime(getLastRosterSavedTime());
        setLastUploadClassBreakdown(classCounts);

        const uploadedClasses = Object.keys(classCounts);
        if (uploadedClasses.length === 1) {
          setSelectedClassName(uploadedClasses[0]);
        } else if (selectedClassName !== 'all' && !classCounts[selectedClassName]) {
          setSelectedClassName('all');
        }

        const summaryStr = Object.entries(classCounts)
          .map(([cls, count]) => `${cls}: ${count} HS`)
          .join(' | ');

        showToast(
          `Đã lưu danh sách học sinh vào ${uploadedClasses.length} lớp (${summaryStr}) — Thêm mới ${addedCount}, Cập nhật ${updatedCount}!`,
          'success'
        );
      } catch {
        showToast('Lỗi khi đọc file danh sách lớp. Vui lòng kiểm tra định dạng file.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Download single template Excel containing ALL classes
  const handleDownloadClassTemplate = () => {
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

  // Export selected class to Excel with the exact standard layout:
  // STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06..Th05)
  const handleExportClassExcel = () => {
    exportStudentsToStandardExcel(
      classStudents,
      `Danh_Sach_Lop_${selectedClassName.replace(/\s+/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`,
      `Lop_${selectedClassName.replace(/[^a-zA-Z0-9.]/g, '')}`
    );
    showToast(
      `Đã xuất danh sách lớp ${selectedClassName} ra Excel theo chuẩn bảng (STT / Họ và tên HS / HS trường / Lớp học thêm / Th06..Th05)!`,
      'success'
    );
  };

  // Non-admin protection: Do not display individual classes to students
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">
          Khu Vực Quản Lý Các Lớp Học (Dành Cho Quản Trị Viên)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Phần <strong>Quản lý các lớp học</strong> dành riêng cho Quản trị viên (Thầy Nguyễn Đình Hành) để úp danh sách lớp, lưu danh sách, xóa danh sách và theo dõi đóng học phí của học sinh.
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
            onClick={() => setActivePage('tuition')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Chuyển đến Đóng Học Phí Online</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Admin Header & Action Buttons */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                Quản trị viên: Úp danh sách lớp, Lưu danh sách & Theo dõi học phí 12 tháng
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Đã lưu trên hệ thống: <strong>{students.length} học sinh</strong>
                  {lastSavedTime ? ` (Lúc ${lastSavedTime})` : ''}
                </span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Quản Lý Các Lớp Học & Theo Dõi Học Phí NĐH
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bảng chuẩn: <strong>STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06 → Th05)</strong>. Có đầy đủ nút <strong>Lưu danh sách</strong>, <strong>Xóa danh sách</strong> và nút <strong>Xóa</strong> từng học sinh.
            </p>
          </div>

          {/* Upload, Save, Delete List & Export Action Buttons for Admin */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualSaveRoster}
              disabled={isSavingRoster}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Lưu toàn bộ danh sách học sinh vào Máy chủ & Cloud"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingRoster ? 'Đang lưu...' : `Lưu danh sách (${students.length} HS)`}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearRosterModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Xóa danh sách lớp đang chọn hoặc xóa toàn bộ danh sách"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa danh sách</span>
            </button>

            <label className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Úp DS các lớp (Tự lọc & Tự lưu)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .docx"
                onChange={handleImportClassRosterExcel}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadClassTemplate}
              className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Tải 1 file Excel mẫu chuẩn bảng (STT / Họ và tên HS / HS trường / Lớp học thêm / Th06..Th05)"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              <span>Tải mẫu Excel</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddStudent}
              className="px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm HS</span>
            </button>

            <button
              type="button"
              onClick={handleExportClassExcel}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Xuất danh sách theo dõi ra Excel"
            >
              <Download className="w-4 h-4" />
              <span>Tải DS (.XLSX)</span>
            </button>
          </div>
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
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã lưu & tự động lọc học sinh vào từng lớp (Click để xem):
              </span>
              <button
                type="button"
                onClick={() => setSelectedClassName('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                  selectedClassName === 'all'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Tất cả ({students.length} HS)
              </button>
              {Object.entries(lastUploadClassBreakdown).map(([cls, count]) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassName(cls)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                    selectedClassName === cls
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
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Prominent Class Dropdown Selection Bar + Upload Mode Option */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5 shrink-0">
              <GraduationCap className="w-5 h-5 text-cyan-700" />
              <span>Chọn lớp học (Danh sách xổ xuống):</span>
            </label>

            <div className="relative flex-1 max-w-md">
              <select
                value={selectedClassName}
                onChange={(e) => setSelectedClassName(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 border-cyan-600 bg-white text-slate-900 font-extrabold text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">-- Tất cả các lớp ({students.length} học sinh) --</option>
                {allClassOptions.standard.map((c) => {
                  const count = students.filter((s) => s.enrolledClass === c.name).length;
                  return (
                    <option key={c.id} value={c.name}>
                      Lớp {c.name} — {c.grade} ({count} học sinh)
                    </option>
                  );
                })}
                {allClassOptions.extra.map((clsName) => {
                  const count = students.filter((s) => s.enrolledClass === clsName).length;
                  return (
                    <option key={clsName} value={clsName}>
                      Lớp {clsName} ({count} học sinh)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-5 h-5 text-cyan-700 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Chế độ khi úp file mới:</span>
            <select
              value={uploadMode}
              onChange={(e) => setUploadMode(e.target.value as 'merge' | 'replace')}
              className="p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 cursor-pointer"
            >
              <option value="merge">Gộp & cập nhật vào danh sách đang có</option>
              <option value="replace">Xóa danh sách cũ & thay bằng file mới</option>
            </select>

            {selectedClassName !== 'all' && totalInClass > 0 && (
              <button
                type="button"
                onClick={() => handleConfirmClearRoster(selectedClassName)}
                className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa DS lớp {selectedClassName} ({totalInClass} HS)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats for the Selected Class */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Sĩ số đang hiển thị</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            {totalInClass} học sinh
          </div>
        </div>

        <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 shadow-xs">
          <div className="text-xs text-sky-800 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>Đạt & Vượt lộ trình học tập</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-sky-700 mt-1">
            {goodRoadmapCount}/{totalInClass} HS
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã đóng học phí (X)</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-1">
            {paidInClass} học sinh
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Chưa đóng học phí (Ch)</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-700 mt-1">
            {unpaidInClass} học sinh
          </div>
        </div>
      </div>

      {/* Search, Bulk Delete & Tuition Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm học sinh theo Họ và tên HS, HS trường, Lớp..."
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            X = Đã đóng
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            Ch = Chưa đóng
          </span>
          <select
            value={filterTuition}
            onChange={(e) => setFilterTuition(e.target.value as any)}
            className="p-2 border border-slate-300 rounded-lg bg-white cursor-pointer"
          >
            <option value="all">Tất cả trạng thái học phí</option>
            <option value="paid">Đã đóng học phí (X)</option>
            <option value="unpaid">Chưa đóng học phí (Ch)</option>
          </select>

          <button
            onClick={() => setActivePage('tuition')}
            className="px-3 py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-700" />
            <span>Mở trang QR & Thu học phí Online</span>
          </button>
        </div>
      </div>

      {/* Class Roster Table:
          STT / Họ và tên HS / HS trường / Lớp học thêm / Theo dõi đóng học phí (Th06..Th05) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-sm">
              Bảng Danh Sách Học Sinh & Theo Dõi Đóng Học Phí —{' '}
              <span className="text-cyan-400">
                {selectedClassName === 'all'
                  ? `Tất cả các lớp (${classStudents.length} HS)`
                  : `Lớp ${selectedClassName} (${classStudents.length} HS)`}
              </span>
            </h3>
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
                      classStudents.length > 0 &&
                      classStudents.every((s) =>
                        selectedStudentKeys.has(s.id || s.studentCode)
                      )
                    }
                    onChange={toggleSelectAllVisible}
                    className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer"
                  />
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2 border border-slate-600 text-center w-11"
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
                  className="py-2.5 px-3 border border-slate-600 min-w-[130px]"
                >
                  HS trường
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 border border-slate-600 text-center min-w-[105px]"
                >
                  Lớp học thêm
                </th>
                <th
                  colSpan={12}
                  className="py-2 px-3 border border-slate-600 text-center bg-cyan-900 text-cyan-100 uppercase tracking-wider"
                >
                  Theo dõi đóng học phí (Click chọn &quot;X&quot; hoặc &quot;Ch&quot;)
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-3 border border-slate-600 min-w-[150px]"
                >
                  Lộ trình học tập
                </th>
                <th
                  rowSpan={2}
                  className="py-2.5 px-2.5 border border-slate-600 text-center min-w-[95px]"
                >
                  Xóa / Sửa HS
                </th>
              </tr>
              <tr className="bg-slate-700 text-slate-100">
                {TUITION_MONTH_COLUMNS.map((monthCol) => (
                  <th
                    key={monthCol}
                    className="py-2 px-1.5 border border-slate-600 text-center font-extrabold min-w-[52px]"
                  >
                    {monthCol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classStudents.map((st, idx) => {
                const monthly = ensureMonthlyTuitionMap(st);
                const rowKey = st.id || st.studentCode;
                const isSelected = selectedStudentKeys.has(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className={`transition ${
                      isSelected ? 'bg-red-50/60' : 'hover:bg-slate-50/80'
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
                        <span className="font-bold text-slate-900">{st.fullName}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(st)}
                            className="px-1.5 py-0.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold text-[10px] cursor-pointer transition"
                            title="Sửa thông tin học sinh"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(st)}
                            className="px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer transition"
                            title={`Xóa học sinh ${st.fullName}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-700">
                      {st.school || 'THCS'}
                    </td>
                    <td className="py-2 px-2 border border-slate-200 text-center">
                      <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-extrabold text-[11px]">
                        {st.enrolledClass}
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
                                st,
                                colKey,
                                e.target.value as 'X' | 'Ch'
                              )
                            }
                            title={`${st.fullName} - ${colKey}: Click chọn X hoặc Ch`}
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
                    <td className="py-1.5 px-2 border border-slate-200">
                      <select
                        value={st.roadmapStage || 'Đang học đúng lộ trình'}
                        onChange={(e) => handleChangeRoadmapStage(st, e.target.value)}
                        className={`w-full p-1 rounded border text-[11px] font-bold cursor-pointer ${
                          st.roadmapStage === 'Cần kèm thêm'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : st.roadmapStage === 'Vượt tiến độ - Tốt' ||
                              st.roadmapStage === 'Đội tuyển mũi nhọn HSG'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        {ROADMAP_STAGES.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 border border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(st)}
                          className="p-1.5 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition cursor-pointer"
                          title="Sửa hồ sơ & học phí"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(st)}
                          className="px-2 py-1 text-white bg-red-600 hover:bg-red-500 rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="Xóa học sinh này khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Quick Inline Entry Row directly inside the class table */}
              <tr className="bg-cyan-50/50">
                <td
                  colSpan={2}
                  className="py-2 px-2 border border-slate-200 text-center font-mono font-bold text-cyan-700"
                >
                  +{classStudents.length + 1}
                </td>
                <td className="py-1.5 px-2 border border-slate-200">
                  <input
                    type="text"
                    placeholder="Nhập Họ và tên HS mới..."
                    value={quickRow.fullName}
                    onChange={(e) => setQuickRow({ ...quickRow, fullName: e.target.value })}
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
                    onChange={(e) => setQuickRow({ ...quickRow, school: e.target.value })}
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
                <td
                  colSpan={2}
                  className="py-1.5 px-2 border border-slate-200 text-center"
                >
                  <button
                    type="button"
                    onClick={handleAddQuickRowStudent}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    + Lưu dòng vào lớp
                  </button>
                </td>
              </tr>
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
              Chọn xóa danh sách học sinh của <strong>từng lớp cụ thể</strong> hoặc xóa <strong>toàn bộ danh sách tất cả các lớp</strong> để úp lại từ đầu:
            </p>

            {/* Delete by specific class */}
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

            {/* Delete all classes */}
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

      {/* Modal Add / Edit Student Roadmap & 12-Month Tuition in Selected Class */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-600" />
                <span>
                  {editingStudent
                    ? 'Cập Nhật Hồ Sơ, Lộ Trình & Học Phí 12 Tháng'
                    : `Thêm Học Sinh Vào Lớp ${form.enrolledClass}`}
                </span>
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
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
                    placeholder="Ví dụ: Nguyễn Minh Khôi"
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

              {/* 12-Month Tuition Grid: Click chọn "X" hoặc "Ch" */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 uppercase text-[11px]">
                    Theo dõi đóng học phí 12 tháng (Click chọn &quot;X&quot; hoặc &quot;Ch&quot;)
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    <strong>X</strong> = Đã đóng • <strong>Ch</strong> = Chưa đóng
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TUITION_MONTH_COLUMNS.map((colKey) => {
                    const val = form.monthlyTuition[colKey] || 'Ch';
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
                                monthlyTuition: { ...form.monthlyTuition, [colKey]: 'X' },
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
                                monthlyTuition: { ...form.monthlyTuition, [colKey]: 'Ch' },
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

              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
                <div className="font-extrabold text-sky-900 uppercase text-[11px]">
                  Theo dõi lộ trình học tập
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Đánh giá tiến độ lộ trình
                    </label>
                    <select
                      value={form.roadmapStage}
                      onChange={(e) => setForm({ ...form, roadmapStage: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {ROADMAP_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số điện thoại PH / HS
                    </label>
                    <input
                      type="tel"
                      placeholder="0988..."
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nhận xét chuyên đề & lộ trình học tập
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đã hoàn thành Chuyên đề 2, điểm kiểm tra 9.0"
                    value={form.roadmapNote}
                    onChange={(e) => setForm({ ...form, roadmapNote: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Lưu vào danh sách lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
