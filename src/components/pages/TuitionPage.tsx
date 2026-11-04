import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet,
  QrCode,
  Building2,
  Copy,
  Check,
  Settings,
  UserCheck,
  Image as ImageIcon,
  Save,
  Edit,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { TuitionRecord, StudentRecord, FileAttachment } from '../../types';
import * as XLSX from 'xlsx';
import {
  getActiveStudentRoster,
  getSavedTuitionRecords,
  saveTuitionRecords,
  syncTuitionPaymentToRoster,
  syncStudentRosterFromServer,
  saveActiveStudentRoster,
  deleteStudentFromRoster,
  clearStudentRoster,
} from '../../utils/studentRoster';
import { processLogoFileToDataUrl } from '../HoaHocNdhLogo';
import { processUploadedFile } from '../../utils/examStorage';
import { AttachmentList } from '../AttachmentAndCommentSection';

export const SAMPLE_TUITIONS: TuitionRecord[] = [];

const POPULAR_BANKS = [
  'Vietcombank (Ngân hàng Ngoại thương VN)',
  'BIDV (Ngân hàng Đầu tư & Phát triển VN)',
  'Agribank (NH Nông nghiệp & PTNT)',
  'VietinBank (NH Công thương VN)',
  'MB Bank (Ngân hàng Quân đội)',
  'Techcombank (NH Kỹ thương VN)',
  'ACB (Ngân hàng Á Châu)',
  'Sacombank (NH Sài Gòn Thương Tín)',
  'VPBank (NH Việt Nam Thịnh Vượng)',
  'TPBank (Ngân hàng Tiên Phong)',
  'SHB (Ngân hàng Sài Gòn - Hà Nội)',
  'HDBank (NH Phát triển TP.HCM)',
  'LPBank (Ngân hàng Lộc Phát)',
  'VIB (Ngân hàng Quốc tế)',
  'MSB (Ngân hàng Hàng Hải)',
  'OCB (Ngân hàng Phương Đông)',
];

const QUICK_TUITION_AMOUNTS = [400000, 500000, 600000, 700000, 800000, 1000000];

export const TuitionPage: React.FC = () => {
  const { classes, showToast, settings, updateSettings, setActivePage } = useApp();
  const { isAdmin, userProfile } = useAuth();

  const [records, setRecords] = useState<TuitionRecord[]>(() => getSavedTuitionRecords());
  const [roster, setRoster] = useState<StudentRecord[]>(() => getActiveStudentRoster());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const currentMonthStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;

  // Admin Bank & Tuition Config State (editable both inline and in modal)
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: settings.bankName || 'Vietcombank',
    bankAccountNumber: settings.bankAccountNumber || '',
    bankAccountHolder: settings.bankAccountHolder || 'NGUYỄN ĐÌNH HÀNH',
    bankBranch: settings.bankBranch || 'Gia Lai',
    tuitionQrUrl: settings.tuitionQrUrl || '',
    defaultTuitionAmountInput: String(settings.defaultTuitionAmount || 600000),
    tuitionPaymentNote: settings.tuitionPaymentNote || 'Họ tên HS - Lớp - Đóng học phí',
  });
  const [isEditingBankInline, setIsEditingBankInline] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Online Tuition Payment Form for Parents & Students (and Admin)
  const [onlineForm, setOnlineForm] = useState({
    studentName: userProfile?.role === 'student' ? userProfile.fullName : '',
    classGroup: userProfile?.enrolledClass || classes[0]?.name || 'H8.1',
    school: userProfile?.school || '',
    phone: userProfile?.phone || '',
    bankName: settings.bankName || 'Vietcombank',
    month: currentMonthStr,
    amountPaidInput: String(settings.defaultTuitionAmount || 600000),
    notes: '',
    confirmedTransfer: true,
  });
  const [receiptAttachments, setReceiptAttachments] = useState<FileAttachment[]>([]);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  const [lastOnlineReceipt, setLastOnlineReceipt] = useState<{
    studentName: string;
    classGroup: string;
    month: string;
    amount: number;
    bankName: string;
    date: string;
    studentCode: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual / Edit payment modal state (Admin)
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState({
    studentName: '',
    classGroup: 'H8.1',
    school: '',
    phone: '',
    bankName: settings.bankName || 'Vietcombank',
    month: currentMonthStr,
    amountDueInput: String(settings.defaultTuitionAmount || 600000),
    amountPaidInput: String(settings.defaultTuitionAmount || 600000),
    paymentMethod: 'Chuyển khoản Online (QR)',
    notes: '',
  });

  // Sync initial settings when not actively typing in bankForm
  useEffect(() => {
    if (!isEditingBankInline && !showBankConfigModal) {
      setBankForm({
        bankName: settings.bankName || 'Vietcombank',
        bankAccountNumber: settings.bankAccountNumber || '',
        bankAccountHolder: settings.bankAccountHolder || 'NGUYỄN ĐÌNH HÀNH',
        bankBranch: settings.bankBranch || 'Gia Lai',
        tuitionQrUrl: settings.tuitionQrUrl || '',
        defaultTuitionAmountInput: String(settings.defaultTuitionAmount || 600000),
        tuitionPaymentNote: settings.tuitionPaymentNote || 'Họ tên HS - Lớp - Đóng học phí',
      });
    }
  }, [settings, isEditingBankInline, showBankConfigModal]);

  const [savingRoster, setSavingRoster] = useState(false);

  useEffect(() => {
    syncStudentRosterFromServer().then((synced) => {
      if (Array.isArray(synced)) {
        setRoster(synced);
      }
    });
    const refresh = () => {
      setRecords(getSavedTuitionRecords());
      setRoster(getActiveStudentRoster());
    };
    window.addEventListener('ndh-tuition-updated', refresh);
    window.addEventListener('ndh-roster-updated', refresh);
    return () => {
      window.removeEventListener('ndh-tuition-updated', refresh);
      window.removeEventListener('ndh-roster-updated', refresh);
    };
  }, []);

  const handleSaveRosterExplicit = async () => {
    setSavingRoster(true);
    try {
      await saveActiveStudentRoster(roster);
      showToast(
        `Đã lưu danh sách ${roster.length} học sinh vào Hệ thống & Đám mây thành công!`,
        'success'
      );
    } catch {
      showToast('Đã lưu danh sách học sinh!', 'success');
    } finally {
      setSavingRoster(false);
    }
  };

  const handleDeleteSingleStudentInTuition = (stu: StudentRecord) => {
    const next = deleteStudentFromRoster(roster, stu);
    setRoster(next);
    showToast(`Đã xóa học sinh "${stu.fullName}" khỏi danh sách lớp ${stu.enrolledClass}!`, 'info');
  };

  const handleClearRosterInTuition = async () => {
    const targetClass = filterClass === 'all' ? 'all' : filterClass;
    const removedCount =
      targetClass === 'all'
        ? roster.length
        : roster.filter((s) => s.enrolledClass === targetClass).length;
    const next = await clearStudentRoster(roster, targetClass);
    setRoster(next);
    showToast(
      targetClass === 'all'
        ? `Đã xóa toàn bộ danh sách (${removedCount} học sinh)!`
        : `Đã xóa danh sách lớp ${targetClass} (${removedCount} học sinh)!`,
      'info'
    );
  };

  const parseAmountNumber = (val: string | number, fallback = 600000): number => {
    const cleaned = String(val).replace(/[^\d]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Đã sao chép ${label}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Admin QR Image Upload
  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const dataUrl = await processLogoFileToDataUrl(file, 700);
      setBankForm((prev) => ({ ...prev, tuitionQrUrl: dataUrl }));
      await updateSettings({ tuitionQrUrl: dataUrl });
      showToast('Đã tải lên ảnh Mã QR ngân hàng thành công!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải ảnh Mã QR.', 'error');
    } finally {
      setUploadingQr(false);
      e.target.value = '';
    }
  };

  // Save Admin Bank & Default Tuition Amount Settings
  const handleSaveBankConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanBankName = bankForm.bankName.trim() || 'Vietcombank';
    const cleanTuitionAmount = parseAmountNumber(bankForm.defaultTuitionAmountInput, 600000);

    await updateSettings({
      bankName: cleanBankName,
      bankAccountNumber: bankForm.bankAccountNumber.trim(),
      bankAccountHolder: bankForm.bankAccountHolder.trim() || 'NGUYỄN ĐÌNH HÀNH',
      bankBranch: bankForm.bankBranch.trim(),
      tuitionQrUrl: bankForm.tuitionQrUrl,
      defaultTuitionAmount: cleanTuitionAmount,
      tuitionPaymentNote: bankForm.tuitionPaymentNote.trim(),
    });

    // Also update onlineForm defaults so student/parent form immediately reflects teacher's new bank & fee
    setOnlineForm((prev) => ({
      ...prev,
      bankName: cleanBankName,
      amountPaidInput: String(cleanTuitionAmount),
    }));

    setIsEditingBankInline(false);
    setShowBankConfigModal(false);
    showToast(
      `Đã lưu Tên Ngân hàng (${cleanBankName}), Số TK và Mức học phí (${cleanTuitionAmount.toLocaleString('vi-VN')} VNĐ)!`,
      'success'
    );
  };

  // Handle receipt file upload (Word / Image)
  const handleReceiptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setReceiptAttachments((prev) => [...prev, ...uploaded]);
      showToast('Đã đính kèm tệp biên lai / xác nhận thanh toán!', 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Handle Parent / Student Online Tuition Payment Submission
  const handleOnlineTuitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineForm.studentName.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh.', 'error');
      return;
    }
    if (!onlineForm.classGroup) {
      showToast('Vui lòng chọn lớp học của học sinh.', 'error');
      return;
    }
    if (!onlineForm.bankName.trim()) {
      showToast('Vui lòng điền tên Ngân hàng thanh toán.', 'error');
      return;
    }

    const paidAmount = parseAmountNumber(
      onlineForm.amountPaidInput,
      settings.defaultTuitionAmount || 600000
    );

    if (!onlineForm.confirmedTransfer) {
      showToast('Vui lòng tích xác nhận đã chuyển khoản thanh toán học phí.', 'error');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const chosenBank = onlineForm.bankName.trim();

    const newRecord: TuitionRecord = {
      id: 't-' + Date.now(),
      studentName: onlineForm.studentName.trim(),
      classGroup: onlineForm.classGroup,
      month: onlineForm.month.trim() || currentMonthStr,
      amountDue: paidAmount,
      amountPaid: paidAmount,
      bankName: chosenBank,
      status: 'paid',
      paymentDate: todayStr,
      paymentMethod: `Chuyển khoản (${chosenBank})`,
      notes:
        onlineForm.notes.trim() ||
        `NH: ${chosenBank} | SĐT: ${onlineForm.phone || '—'} | Trường: ${onlineForm.school || 'THCS'}`,
      confirmedBy: 'Thanh toán Online (QR)',
      receiptAttachment: receiptAttachments[0],
      updatedAt: new Date().toISOString(),
    };

    const nextRecords = [newRecord, ...records];
    setRecords(nextRecords);
    saveTuitionRecords(nextRecords);

    // Automatically update the student in the Student Roster & Class Management
    const syncedStudent = syncTuitionPaymentToRoster({
      studentName: onlineForm.studentName.trim(),
      classGroup: onlineForm.classGroup,
      school: onlineForm.school.trim(),
      phone: onlineForm.phone.trim(),
      month: newRecord.month,
      amountPaid: paidAmount,
      bankName: chosenBank,
      status: 'paid',
      paymentDate: todayStr,
      paymentMethod: `Chuyển khoản (${chosenBank})`,
      notes: onlineForm.notes.trim(),
    });

    setRoster(getActiveStudentRoster());
    setReceiptAttachments([]);
    setLastOnlineReceipt({
      studentName: syncedStudent.fullName,
      classGroup: syncedStudent.enrolledClass,
      month: newRecord.month,
      amount: paidAmount,
      bankName: chosenBank,
      date: todayStr,
      studentCode: syncedStudent.studentCode,
    });

    showToast(
      `Đã xác nhận đóng học phí (${paidAmount.toLocaleString('vi-VN')}đ qua ${chosenBank}) và cập nhật "Đã đóng học phí" cho HS ${syncedStudent.fullName}!`,
      'success'
    );
  };

  // Auto-fill school & phone if student name matches an existing student in the selected class
  const handleSelectStudentFromRoster = (nameValue: string) => {
    setOnlineForm((prev) => {
      const matched = roster.find(
        (s) =>
          s.fullName.toLowerCase() === nameValue.trim().toLowerCase() &&
          (s.enrolledClass === prev.classGroup || !prev.classGroup)
      );
      if (matched) {
        return {
          ...prev,
          studentName: nameValue,
          classGroup: matched.enrolledClass || prev.classGroup,
          school: matched.school || prev.school,
          phone: matched.phone || prev.phone,
        };
      }
      return { ...prev, studentName: nameValue };
    });
  };

  // Filtering
  const filteredRecords = records.filter((rec) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.studentName.toLowerCase().includes(q) ||
        rec.classGroup.toLowerCase().includes(q) ||
        (rec.bankName && rec.bankName.toLowerCase().includes(q)) ||
        rec.month.includes(q);
      if (!match) return false;
    }

    if (filterClass !== 'all' && rec.classGroup !== filterClass) return false;
    if (filterStatus !== 'all' && rec.status !== filterStatus) return false;

    return true;
  });

  // Aggregations
  const totalDue = filteredRecords.reduce((sum, r) => sum + r.amountDue, 0);
  const totalPaid = filteredRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalUnpaid = Math.max(0, totalDue - totalPaid);
  const paidStudentsCount = roster.filter((s) => s.tuitionStatus === 'paid').length;

  // Open Manual / Edit Modal (Admin)
  const handleOpenManualModal = (recordToEdit?: TuitionRecord) => {
    if (recordToEdit) {
      setEditingRecordId(recordToEdit.id || null);
      setModalForm({
        studentName: recordToEdit.studentName,
        classGroup: recordToEdit.classGroup,
        school: '',
        phone: '',
        bankName: recordToEdit.bankName || settings.bankName || 'Vietcombank',
        month: recordToEdit.month,
        amountDueInput: String(recordToEdit.amountDue),
        amountPaidInput: String(recordToEdit.amountPaid),
        paymentMethod: recordToEdit.paymentMethod || 'Chuyển khoản Online (QR)',
        notes: recordToEdit.notes || '',
      });
    } else {
      setEditingRecordId(null);
      const defaultFee = String(settings.defaultTuitionAmount || 600000);
      setModalForm({
        studentName: '',
        classGroup: 'H8.1',
        school: '',
        phone: '',
        bankName: settings.bankName || 'Vietcombank',
        month: currentMonthStr,
        amountDueInput: defaultFee,
        amountPaidInput: defaultFee,
        paymentMethod: 'Chuyển khoản Online (QR)',
        notes: '',
      });
    }
    setShowManualModal(true);
  };

  // Handle Manual Payment Submission (Admin)
  const handleSaveManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.studentName.trim()) {
      showToast('Vui lòng nhập họ tên học sinh', 'error');
      return;
    }

    const amountDue = parseAmountNumber(modalForm.amountDueInput, 600000);
    const amountPaid = Number(String(modalForm.amountPaidInput).replace(/[^\d]/g, '')) || 0;

    const isPaidInFull = amountPaid >= amountDue && amountDue > 0;
    const isZero = amountPaid <= 0;
    const statusValue: 'paid' | 'unpaid' | 'partial' = isPaidInFull
      ? 'paid'
      : isZero
      ? 'unpaid'
      : 'partial';
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const cleanBank = modalForm.bankName.trim() || settings.bankName || 'Vietcombank';

    const newRecord: TuitionRecord = {
      id: editingRecordId || 't-' + Date.now(),
      studentName: modalForm.studentName.trim(),
      classGroup: modalForm.classGroup,
      month: modalForm.month,
      amountDue,
      amountPaid,
      bankName: cleanBank,
      status: statusValue,
      paymentDate: todayStr,
      paymentMethod: modalForm.paymentMethod,
      notes: modalForm.notes,
      confirmedBy: 'QTV-Nguyễn Đình Hành',
      updatedAt: new Date().toISOString(),
    };

    const nextRecords = editingRecordId
      ? records.map((r) => (r.id === editingRecordId ? newRecord : r))
      : [newRecord, ...records];

    setRecords(nextRecords);
    saveTuitionRecords(nextRecords);

    // Sync to student roster as well
    syncTuitionPaymentToRoster({
      studentName: newRecord.studentName,
      classGroup: newRecord.classGroup,
      school: modalForm.school,
      phone: modalForm.phone,
      month: newRecord.month,
      amountPaid: newRecord.amountPaid,
      bankName: cleanBank,
      status: statusValue,
      paymentDate: todayStr,
      paymentMethod: `${newRecord.paymentMethod} (${cleanBank})`,
      notes: newRecord.notes,
    });
    setRoster(getActiveStudentRoster());

    setShowManualModal(false);
    showToast(
      `Đã lưu thông tin học phí (${amountPaid.toLocaleString('vi-VN')}đ - ${cleanBank}) cho học sinh ${newRecord.studentName}!`,
      'success'
    );
  };

  // Export to Real Excel
  const handleExportExcel = () => {
    const dataToExport = filteredRecords.map((r, i) => ({
      STT: i + 1,
      'Họ và tên học sinh': r.studentName,
      'Nhóm lớp': r.classGroup,
      'Tháng thu': r.month,
      'Ngân hàng': r.bankName || settings.bankName || 'Vietcombank',
      'Học phí phải nộp (VNĐ)': r.amountDue,
      'Đã nộp (VNĐ)': r.amountPaid,
      'Trạng thái':
        r.status === 'paid'
          ? 'Đã đóng học phí'
          : r.status === 'partial'
          ? 'Nộp một phần'
          : 'Chưa đóng',
      'Ngày thu': r.paymentDate || '',
      'Phương thức': r.paymentMethod || '',
      'Người xác nhận': r.confirmedBy || '',
      'Ghi chú': r.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Học Phí');
    XLSX.writeFile(
      workbook,
      `Bao_Cao_Hoc_Phi_NDH_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Đã xuất báo cáo học phí ra tệp Excel thành công!', 'success');
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên học sinh': 'Nguyễn Văn A',
        'Nhóm lớp': 'H8.1',
        'Tháng thu': currentMonthStr,
        'Ngân hàng': settings.bankName || 'Vietcombank',
        'Học phí phải nộp': settings.defaultTuitionAmount || 600000,
        'Đã nộp': settings.defaultTuitionAmount || 600000,
        'Trạng thái': 'Đã đóng học phí',
        'Phương thức': 'Chuyển khoản Online (QR)',
        'Ghi chú': '',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hoc_Phi');
    XLSX.writeFile(wb, 'Mau_Nhap_Hoc_Phi_NDH.xlsx');
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let count = 0;
        const newItems: TuitionRecord[] = [];
        const todayStr = new Date().toLocaleDateString('vi-VN');
        const defaultFee = settings.defaultTuitionAmount || 600000;

        data.forEach((row: any) => {
          const name = row['Họ và tên học sinh'] || row['Họ tên'] || row['studentName'];
          if (name) {
            const isPaid =
              row['Trạng thái'] === 'Đã nộp' ||
              row['Trạng thái'] === 'Đã đóng' ||
              row['Trạng thái'] === 'Đã đóng học phí';
            const rowBank = String(row['Ngân hàng'] || settings.bankName || 'Vietcombank').trim();
            const dueVal = Number(row['Học phí phải nộp'] || row['Mức học phí'] || defaultFee);
            const paidVal = Number(row['Đã nộp'] || (isPaid ? dueVal : 0));

            const item: TuitionRecord = {
              id: 't-' + Math.random().toString(36).substring(2, 9),
              studentName: String(name).trim(),
              classGroup: String(row['Nhóm lớp'] || row['Lớp'] || 'H8.1').trim(),
              month: String(row['Tháng thu'] || currentMonthStr),
              bankName: rowBank,
              amountDue: dueVal,
              amountPaid: paidVal,
              status: isPaid ? 'paid' : 'unpaid',
              paymentDate: todayStr,
              paymentMethod: row['Phương thức'] || `Chuyển khoản (${rowBank})`,
              confirmedBy: 'QTV-Nguyễn Đình Hành',
            };
            newItems.push(item);

            syncTuitionPaymentToRoster({
              studentName: item.studentName,
              classGroup: item.classGroup,
              month: item.month,
              amountPaid: item.amountPaid,
              bankName: rowBank,
              status: item.status,
              paymentDate: todayStr,
              paymentMethod: item.paymentMethod || 'Excel',
            });
            count++;
          }
        });

        const nextRecords = [...newItems, ...records];
        setRecords(nextRecords);
        saveTuitionRecords(nextRecords);
        setRoster(getActiveStudentRoster());
        showToast(
          `Nhập dữ liệu thành công ${count} bản ghi học phí từ Excel và đã đồng bộ vào danh sách học sinh!`,
          'success'
        );
      } catch {
        showToast('Lỗi khi đọc file Excel. Vui lòng dùng đúng mẫu tải xuống.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const suggestedTransferNote = `${onlineForm.studentName.trim() || 'Ho ten HS'} - ${onlineForm.classGroup} - HP ${onlineForm.month}`;
  const classRosterSuggestions = roster.filter(
    (s) => !onlineForm.classGroup || s.enrolledClass === onlineForm.classGroup
  );

  return (
    <div className="space-y-6">
      {/* Shared Datalist for Bank Names (Allows choosing from list OR typing any custom bank name) */}
      <datalist id="vietnam-bank-options">
        {POPULAR_BANKS.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200 mb-1">
            <QrCode className="w-3.5 h-3.5" />
            Mục số 6: Đóng Học Phí Online & Sổ Theo Dõi Học Phí
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Đóng Học Phí Trực Tuyến (QR) & Sổ Theo Dõi Học Phí NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Giáo viên quản trị cài đặt Tên Ngân hàng, Số tài khoản, Mã QR và Mức học phí. Phụ huynh và học sinh điền thông tin xác nhận để tự động cập nhật vào danh sách lớp.
          </p>
        </div>

        {/* Admin Action Controls */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBankConfigModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Cài đặt Ngân Hàng, Mã QR & Mức Học Phí</span>
            </button>

            <button
              onClick={() => handleOpenManualModal()}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thu / Vào học phí</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Tải file danh sách học phí Excel"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Học phí (.XLSX)</span>
            </button>

            <label className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Up file Học phí (.XLSX)</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDownloadTemplate}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              title="Tải mẫu Excel để nhập dữ liệu"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          ONLINE TUITION PAYMENT SECTION (QR + BANK ACCOUNT + STUDENT FORM)
         ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white rounded-2xl shadow-lg border border-cyan-800/60 overflow-hidden">
        <div className="bg-cyan-950/80 border-b border-cyan-800/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                ĐÓNG HỌC PHÍ ONLINE QUA MÃ QR & TÀI KHOẢN NGÂN HÀNG
              </h3>
              <p className="text-xs text-cyan-200">
                Bước 1: Quét mã QR hoặc chuyển khoản • Bước 2: Điền tên Ngân hàng, Mức học phí và Thông tin học sinh để xác nhận
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsEditingBankInline(!isEditingBankInline)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span>
                {isEditingBankInline
                  ? 'Đóng khung sửa nhanh'
                  : 'Sửa trực tiếp Tên Ngân hàng, Số TK & Mức Học Phí'}
              </span>
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Bank QR Code, Bank Name, Account Info & Default Tuition Fee */}
          <div className="lg:col-span-5 bg-white text-slate-800 rounded-2xl p-5 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-700" />
                <span className="font-extrabold text-sm text-slate-900 uppercase">
                  Thông Tin Ngân Hàng, Mã QR & Mức Học Phí
                </span>
              </div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsEditingBankInline(!isEditingBankInline)}
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>{isEditingBankInline ? 'Đang sửa' : 'Sửa thông tin'}</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Chính thức
                </span>
              )}
            </div>

            {/* QR Image Display Box */}
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border-2 border-dashed border-cyan-200">
              {settings.tuitionQrUrl ? (
                <div className="space-y-2 text-center">
                  <img
                    src={settings.tuitionQrUrl}
                    alt="Mã QR Đóng Học Phí Hóa Học NĐH"
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto rounded-lg bg-white p-2 shadow-xs border border-slate-200"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Mở ứng dụng Ngân hàng trên điện thoại để quét mã QR
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Đổi ảnh Mã QR khác
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-6 px-4 text-center space-y-2">
                  <QrCode className="w-14 h-14 text-cyan-600/40 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    {isAdmin
                      ? 'Quản trị viên chưa tải ảnh Mã QR lên'
                      : 'Quý phụ huynh vui lòng chuyển khoản theo Số tài khoản bên dưới'}
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      className="mt-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingQr ? 'Đang tải...' : 'Tải ảnh Mã QR lên ngay'}</span>
                    </button>
                  )}
                </div>
              )}

              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrFileUpload}
                className="hidden"
              />
            </div>

            {/* ADMIN INLINE DIRECT EDITOR OR DISPLAY */}
            {isAdmin && isEditingBankInline ? (
              <form
                onSubmit={handleSaveBankConfig}
                className="p-4 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-3 text-xs animate-in fade-in duration-150"
              >
                <div className="font-extrabold text-amber-950 uppercase text-xs flex items-center justify-between">
                  <span>Chỉnh sửa trực tiếp Ngân hàng & Học phí (Quản trị)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    1. Tên Ngân hàng thụ hưởng (Gõ tự do hoặc chọn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="vietnam-bank-options"
                    placeholder="Nhập tên ngân hàng: VD Vietcombank, BIDV, Agribank, MB Bank..."
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. Số tài khoản ngân hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập số tài khoản..."
                      value={bankForm.bankAccountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-black text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      3. Chi nhánh (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Gia Lai"
                      value={bankForm.bankBranch}
                      onChange={(e) => setBankForm({ ...bankForm, bankBranch: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      4. Chủ tài khoản
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankAccountHolder}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountHolder: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      5. Mức học phí quy định (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 600000"
                      value={bankForm.defaultTuitionAmountInput}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          defaultTuitionAmountInput: e.target.value.replace(/[^\d]/g, ''),
                        })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-extrabold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick amount buttons for Teacher */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 font-bold">Chọn nhanh mức HP:</span>
                  {QUICK_TUITION_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setBankForm({ ...bankForm, defaultTuitionAmountInput: String(amt) })
                      }
                      className="px-2 py-0.5 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      {(amt / 1000).toLocaleString('vi-VN')}k
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU TÊN NGÂN HÀNG, SỐ TK & MỨC HỌC PHÍ</span>
                </button>
              </form>
            ) : (
              /* Bank Account Details Display */
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Ngân hàng thụ hưởng</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {settings.bankName || 'Vietcombank'}
                      {settings.bankBranch ? ` (${settings.bankBranch})` : ''}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingBankInline(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer shrink-0"
                    >
                      Đổi Ngân hàng
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-cyan-800 font-semibold block">
                      Số tài khoản ngân hàng
                    </span>
                    <span className="font-mono font-black text-base sm:text-lg text-cyan-900 tracking-wider">
                      {settings.bankAccountNumber || 'Chưa cập nhật số TK'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBankInline(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-cyan-800 border border-cyan-300 font-bold text-xs cursor-pointer"
                      >
                        Sửa
                      </button>
                    )}
                    {settings.bankAccountNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankAccountNumber || '', 'Số tài khoản')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'Số tài khoản' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Sao chép</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Chủ tài khoản</span>
                    <span className="font-extrabold text-slate-900 text-sm uppercase">
                      {settings.bankAccountHolder || 'NGUYỄN ĐÌNH HÀNH'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block">
                      Mức học phí quy định (Giáo viên cài đặt)
                    </span>
                    <span className="font-black text-sm sm:text-base text-emerald-700">
                      {Number(settings.defaultTuitionAmount || 600000).toLocaleString('vi-VN')} VNĐ / tháng
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingBankInline(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shrink-0"
                    >
                      Sửa mức HP
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-amber-800 font-semibold block">
                      Nội dung chuyển khoản tự động
                    </span>
                    <span className="font-mono font-bold text-xs text-amber-950 truncate block">
                      {suggestedTransferNote}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(suggestedTransferNote, 'Nội dung chuyển khoản')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Chép</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Student Information & Payment Confirmation Form */}
          <div className="lg:col-span-7 bg-white text-slate-800 rounded-2xl p-6 shadow-md border border-slate-200">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Điền Thông Tin Học Sinh, Ngân Hàng & Mức Học Phí Thanh Toán</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phụ huynh, học sinh hoặc giáo viên điền tên Ngân hàng, mức học phí và thông tin học sinh để cập nhật ngay vào Danh sách lớp.
                </p>
              </div>
            </div>

            {lastOnlineReceipt && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>ĐÃ CẬP NHẬT ĐÓNG HỌC PHÍ THÀNH CÔNG!</span>
                  </div>
                  <button
                    onClick={() => setLastOnlineReceipt(null)}
                    className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                  >
                    Đóng thông báo
                  </button>
                </div>
                <p className="text-xs leading-relaxed">
                  Hệ thống đã ghi nhận học sinh{' '}
                  <strong>{lastOnlineReceipt.studentName}</strong> (Mã HS:{' '}
                  <span className="font-mono font-bold">{lastOnlineReceipt.studentCode}</span> — Lớp{' '}
                  <strong>{lastOnlineReceipt.classGroup}</strong>) đã thanh toán học phí tháng{' '}
                  <strong>{lastOnlineReceipt.month}</strong> qua ngân hàng{' '}
                  <strong>{lastOnlineReceipt.bankName}</strong> với mức học phí{' '}
                  <strong>{lastOnlineReceipt.amount.toLocaleString('vi-VN')} VNĐ</strong> và tự động cập nhật trạng thái{' '}
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                    Đã đóng học phí
                  </span>{' '}
                  vào danh sách học sinh của lớp.
                </p>
              </div>
            )}

            <form onSubmit={handleOnlineTuitionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Chọn lớp theo học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={onlineForm.classGroup}
                    onChange={(e) =>
                      setOnlineForm({ ...onlineForm, classGroup: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="roster-student-names"
                    placeholder="Nhập đúng họ và tên học sinh..."
                    value={onlineForm.studentName}
                    onChange={(e) => handleSelectStudentFromRoster(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <datalist id="roster-student-names">
                    {classRosterSuggestions.map((s) => (
                      <option key={s.id || s.studentCode} value={s.fullName}>
                        {s.studentCode} - {s.school}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Số điện thoại Phụ huynh / Học sinh
                  </label>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0988 275 288"
                    value={onlineForm.phone}
                    onChange={(e) => setOnlineForm({ ...onlineForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Trường THCS đang học
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THCS Quang Trung"
                    value={onlineForm.school}
                    onChange={(e) => setOnlineForm({ ...onlineForm, school: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* NEW: EDITABLE BANK NAME & TUITION AMOUNT */}
              <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1">
                      5. Tên Ngân hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      list="vietnam-bank-options"
                      placeholder="Điền tên Ngân hàng (VD: Vietcombank, BIDV, Agribank...)"
                      value={onlineForm.bankName}
                      onChange={(e) => setOnlineForm({ ...onlineForm, bankName: e.target.value })}
                      className="w-full p-2.5 border border-cyan-300 rounded-xl bg-white font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1">
                      6. Học phí tháng / đợt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 10/2026"
                      value={onlineForm.month}
                      onChange={(e) => setOnlineForm({ ...onlineForm, month: e.target.value })}
                      className="w-full p-2.5 border border-cyan-300 rounded-xl bg-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1">
                      7. Mức học phí đóng (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Điền số tiền (VD: 600000)"
                      value={onlineForm.amountPaidInput}
                      onChange={(e) =>
                        setOnlineForm({
                          ...onlineForm,
                          amountPaidInput: e.target.value.replace(/[^\d]/g, ''),
                        })
                      }
                      className="w-full p-2.5 border border-cyan-300 rounded-xl bg-white font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick select tuition amounts + formatted preview */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600">Chọn nhanh mức học phí:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setOnlineForm({
                          ...onlineForm,
                          amountPaidInput: String(settings.defaultTuitionAmount || 600000),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Mức GV: {Number(settings.defaultTuitionAmount || 600000).toLocaleString('vi-VN')}đ
                    </button>
                    {QUICK_TUITION_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() =>
                          setOnlineForm({ ...onlineForm, amountPaidInput: String(amt) })
                        }
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                          Number(onlineForm.amountPaidInput) === amt
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {amt.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-extrabold text-emerald-800">
                    Thành tiền:{' '}
                    {parseAmountNumber(onlineForm.amountPaidInput, 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block font-bold text-slate-700 mb-1">
                    8. Ghi chú thanh toán (Thời gian chuyển khoản / Ghi chú thêm)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phụ huynh em Khôi đã chuyển khoản..."
                    value={onlineForm.notes}
                    onChange={(e) => setOnlineForm({ ...onlineForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="button"
                    onClick={() => receiptFileInputRef.current?.click()}
                    className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Đính kèm Ảnh/Word biên lai</span>
                  </button>
                  <input
                    ref={receiptFileInputRef}
                    type="file"
                    accept="image/*,.doc,.docx,.pdf"
                    onChange={handleReceiptFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {receiptAttachments.length > 0 && (
                <AttachmentList
                  attachments={receiptAttachments}
                  onRemove={(id) =>
                    setReceiptAttachments((prev) => prev.filter((a) => a.id !== id))
                  }
                  compact
                />
              )}

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlineForm.confirmedTransfer}
                  onChange={(e) =>
                    setOnlineForm({ ...onlineForm, confirmedTransfer: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="text-xs text-emerald-950 font-semibold leading-snug">
                  Tôi xác nhận đã hoàn tất chuyển khoản học phí qua Mã QR / Tài khoản ngân hàng của Thầy Nguyễn Đình Hành. Hệ thống sẽ cập nhật ngay trạng thái <strong>"Đã đóng học phí"</strong> vào danh sách học sinh.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>XÁC NHẬN ĐÃ THANH TOÁN XONG & CẬP NHẬT DANH SÁCH HỌC SINH</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Summary Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tổng số lượt đóng học phí</div>
          <div className="text-base sm:text-xl font-black text-slate-900 mt-1">
            {filteredRecords.length} biên lai
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tổng học phí đã thu
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-700 mt-1">
            {totalPaid.toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200 shadow-xs">
          <div className="text-xs text-cyan-800 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
            HS đã đóng trong danh sách lớp
          </div>
          <div className="text-base sm:text-xl font-black text-cyan-700 mt-1">
            {paidStudentsCount} học sinh
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Còn nợ / Chưa tất toán
          </div>
          <div className="text-base sm:text-xl font-black text-amber-700 mt-1">
            {totalUnpaid.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tra cứu tên học sinh, lớp, ngân hàng, tháng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-semibold">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã đóng học phí</option>
            <option value="unpaid">Chưa đóng</option>
            <option value="partial">Nộp một phần</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setActivePage('classes')}
              className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold cursor-pointer"
            >
              Xem theo từng Lớp học →
            </button>
          )}
        </div>
      </div>

      {/* Tuition Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase">
            Danh Sách Học Sinh Đã Đóng & Theo Dõi Học Phí
          </h3>
          <span className="text-[11px] text-slate-500">
            Đồng bộ tự động với Danh sách học sinh & Quản lý lớp học
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Họ và tên học sinh</th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-3">Tháng thu</th>
                <th className="py-3 px-3">Ngân hàng</th>
                <th className="py-3 px-3">Mức học phí</th>
                <th className="py-3 px-3">Đã thanh toán</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Ngày đóng</th>
                <th className="py-3 px-3">Ghi chú / Biên lai</th>
                {isAdmin && <th className="py-3 px-4 text-center">Quản trị</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-xs text-slate-600">
                      Chưa có biên lai đóng học phí nào trong bộ lọc hiện tại.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Khi phụ huynh/học sinh xác nhận thanh toán Online ở trên, thông tin sẽ lập tức hiển thị tại đây và trong danh sách lớp.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                    <td className="py-3 px-3 font-semibold text-cyan-800">{r.classGroup}</td>
                    <td className="py-3 px-3 font-mono">{r.month}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {r.bankName || settings.bankName || 'Vietcombank'}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {r.amountDue.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {r.amountPaid.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-3">
                      {r.status === 'paid' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã đóng học phí
                        </span>
                      ) : r.status === 'partial' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Nộp một phần
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Chưa đóng
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{r.paymentDate || '—'}</td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs">
                      <div className="truncate italic">{r.notes || '—'}</div>
                      {r.receiptAttachment && (
                        <AttachmentList attachments={[r.receiptAttachment]} compact />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenManualModal(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                            title="Sửa Ngân hàng / Mức học phí"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = records.filter((item) => item.id !== r.id);
                              setRecords(next);
                              saveTuitionRecords(next);
                              showToast(`Đã xóa bản ghi học phí của ${r.studentName}.`, 'info');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-red-600 cursor-pointer"
                            title="Xóa bản ghi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          12-MONTH STUDENT ROSTER & TUITION TRACKING TABLE (WITH SAVE / DELETE)
         ===================================================================== */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-xs sm:text-sm uppercase text-amber-300">
                Bảng Danh Sách Học Sinh & Theo Dõi Đóng Học Phí 12 Tháng (Th06 → Th05)
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Tự động lưu & đồng bộ với Quản lý lớp học. Có nút Lưu danh sách, Xóa danh sách và Xóa từng học sinh.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                X = Đã đóng học phí
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                Ch = Chưa đóng
              </span>
              <button
                type="button"
                onClick={handleSaveRosterExplicit}
                disabled={savingRoster}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingRoster ? 'Đang lưu...' : 'Lưu danh sách HS'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearRosterInTuition}
                disabled={roster.length === 0}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {filterClass === 'all' ? 'Xóa toàn bộ DS' : `Xóa DS lớp ${filterClass}`}
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white uppercase font-bold text-[11px]">
                  <th rowSpan={2} className="py-2.5 px-2.5 border border-slate-700 text-center w-10">
                    STT
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 border border-slate-700 min-w-[200px]">
                    Họ và tên HS
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2.5 border border-slate-700 min-w-[130px]">
                    HS trường
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2.5 border border-slate-700 text-center w-24">
                    Lớp học thêm
                  </th>
                  <th colSpan={12} className="py-2 px-2 border border-slate-700 text-center bg-cyan-900 text-amber-300 tracking-wide">
                    Theo dõi đóng học phí (Click chọn "X" hoặc "Ch")
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2.5 border border-slate-700 text-center w-20">
                    Xóa HS
                  </th>
                </tr>
                <tr className="bg-slate-700 text-amber-200 font-extrabold text-[10px] text-center">
                  {['Th06', 'Th 07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12', 'Th01', 'Th02', 'Th03', 'Th04', 'Th05'].map((label, i) => {
                    const key = ['Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12', 'Th01', 'Th02', 'Th03', 'Th04', 'Th05'][i];
                    return (
                      <th key={key} className="py-1.5 px-1.5 border border-slate-600 min-w-[44px]">
                        {label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roster
                  .filter((s) => filterClass === 'all' || s.enrolledClass === filterClass)
                  .filter((s) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      s.fullName.toLowerCase().includes(q) ||
                      s.enrolledClass.toLowerCase().includes(q) ||
                      (s.school && s.school.toLowerCase().includes(q))
                    );
                  })
                  .map((stu, idx) => (
                    <tr key={stu.id || stu.studentCode || idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-2.5 border border-slate-200 text-center font-bold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900">
                        <div className="flex items-center justify-between gap-2">
                          <span>{stu.fullName}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleStudentInTuition(stu)}
                            className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-[10px] font-bold transition cursor-pointer shrink-0"
                            title={`Xóa học sinh ${stu.fullName}`}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 border border-slate-200 text-slate-700">
                        {stu.school || '—'}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-200 text-center font-extrabold text-cyan-800">
                        {stu.enrolledClass}
                      </td>
                      {(['Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12', 'Th01', 'Th02', 'Th03', 'Th04', 'Th05'] as const).map((mKey) => {
                        const val = stu.monthlyTuition?.[mKey] || '';
                        return (
                          <td key={mKey} className="p-1 border border-slate-200 text-center">
                            <div className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5 gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = val === 'X' ? '' : 'X';
                                  const updated = roster.map((item) => {
                                    if (item.studentCode === stu.studentCode) {
                                      const nextMap = { ...(item.monthlyTuition || {}), [mKey]: nextVal as 'X' | 'Ch' | '' };
                                      const hasAnyX = Object.values(nextMap).some((v) => v === 'X');
                                      return {
                                        ...item,
                                        monthlyTuition: nextMap,
                                        tuitionStatus: hasAnyX ? ('paid' as const) : ('unpaid' as const),
                                      };
                                    }
                                    return item;
                                  });
                                  setRoster(updated);
                                  saveActiveStudentRoster(updated);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                                  val === 'X'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-emerald-700 hover:bg-white'
                                }`}
                              >
                                X
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = val === 'Ch' ? '' : 'Ch';
                                  const updated = roster.map((item) => {
                                    if (item.studentCode === stu.studentCode) {
                                      const nextMap = { ...(item.monthlyTuition || {}), [mKey]: nextVal as 'X' | 'Ch' | '' };
                                      const hasAnyX = Object.values(nextMap).some((v) => v === 'X');
                                      return {
                                        ...item,
                                        monthlyTuition: nextMap,
                                        tuitionStatus: hasAnyX ? ('paid' as const) : ('unpaid' as const),
                                      };
                                    }
                                    return item;
                                  });
                                  setRoster(updated);
                                  saveActiveStudentRoster(updated);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                                  val === 'Ch'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'text-slate-400 hover:text-amber-700 hover:bg-white'
                                }`}
                              >
                                Ch
                              </button>
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 border border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleStudentInTuition(stu)}
                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold text-[10px] inline-flex items-center gap-1 transition cursor-pointer"
                          title={`Xóa học sinh ${stu.fullName}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL: UPLOAD QR CODE, BANK NAME & TUITION AMOUNT CONFIGURATION
         ===================================================================== */}
      {showBankConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-600" />
                <span>Cài Đặt Ngân Hàng, Mã QR & Mức Học Phí (Quản Trị)</span>
              </h3>
              <button
                onClick={() => setShowBankConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankConfig} className="space-y-4 text-xs">
              {/* QR Image Upload */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                <label className="block font-extrabold text-slate-800 text-xs uppercase">
                  1. Tải lên ảnh Mã QR Ngân hàng của Thầy
                </label>

                {bankForm.tuitionQrUrl ? (
                  <div className="space-y-2">
                    <img
                      src={bankForm.tuitionQrUrl}
                      alt="Preview QR"
                      className="w-44 h-44 object-contain mx-auto rounded-xl border border-slate-300 bg-white p-2 shadow-xs"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Đổi ảnh Mã QR khác
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankForm({ ...bankForm, tuitionQrUrl: '' })}
                        className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs cursor-pointer"
                      >
                        Xóa ảnh QR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => qrFileInputRef.current?.click()}
                    className="py-6 border-2 border-dashed border-cyan-300 rounded-xl bg-white hover:bg-cyan-50/40 transition cursor-pointer space-y-1.5"
                  >
                    <ImageIcon className="w-8 h-8 text-cyan-600 mx-auto" />
                    <div className="font-bold text-cyan-700">
                      {uploadingQr ? 'Đang xử lý ảnh QR...' : 'Bấm vào đây để chọn ảnh Mã QR từ máy'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hỗ trợ ảnh PNG, JPG, WEBP rõ nét
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Ngân hàng (Điền tự do hoặc chọn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="vietnam-bank-options"
                    placeholder="VD: Vietcombank, BIDV, Agribank, MB Bank..."
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số tài khoản ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số tài khoản..."
                    value={bankForm.bankAccountNumber}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-extrabold text-cyan-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chủ tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankAccountHolder}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bankAccountHolder: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mức học phí quy định (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số tiền (VD: 600000)"
                    value={bankForm.defaultTuitionAmountInput}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        defaultTuitionAmountInput: e.target.value.replace(/[^\d]/g, ''),
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-extrabold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chi nhánh ngân hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chi nhánh Gia Lai"
                  value={bankForm.bankBranch}
                  onChange={(e) => setBankForm({ ...bankForm, bankBranch: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBankConfigModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Lưu Ngân Hàng, Mã QR & Mức Học Phí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual / Edit Payment Modal (Admin) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-600" />
                {editingRecordId ? 'Chỉnh Sửa Biên Lai Học Phí' : 'Thu / Vào Học Phí Học Sinh'}
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="roster-student-names"
                  placeholder="Ví dụ: Nguyễn Minh Khôi"
                  value={modalForm.studentName}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, studentName: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhóm lớp</label>
                  <select
                    value={modalForm.classGroup}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, classGroup: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tháng thu</label>
                  <input
                    type="text"
                    required
                    value={modalForm.month}
                    onChange={(e) => setModalForm({ ...modalForm, month: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên Ngân hàng thanh toán
                </label>
                <input
                  type="text"
                  list="vietnam-bank-options"
                  placeholder="Nhập tên Ngân hàng (VD: Vietcombank, BIDV, Agribank...)"
                  value={modalForm.bankName}
                  onChange={(e) => setModalForm({ ...modalForm, bankName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mức học phí phải nộp (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={modalForm.amountDueInput}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        amountDueInput: e.target.value.replace(/[^\d]/g, ''),
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mức học phí thực nộp (VNĐ)
                  </label>
                  <input
                    type="text"
                    value={modalForm.amountPaidInput}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        amountPaidInput: e.target.value.replace(/[^\d]/g, ''),
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-extrabold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phương thức thu
                </label>
                <select
                  value={modalForm.paymentMethod}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, paymentMethod: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Chuyển khoản Online (QR)">Chuyển khoản Online (QR)</option>
                  <option value="Tiền mặt tại lớp">Tiền mặt tại lớp</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phụ huynh nộp tháng 10..."
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Lưu xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
