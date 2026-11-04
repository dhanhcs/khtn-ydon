import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Download,
  Upload,
  CheckCircle2,
  X,
  FileCheck,
  Send,
  Paperclip,
  Award,
  FileSpreadsheet,
  Edit,
  Trash2,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { HomeworkItem, HomeworkSubmission, FileAttachment } from '../../types';
import * as XLSX from 'xlsx';
import {
  processUploadedFile,
  getStoredHomeworkSubmissions,
  saveHomeworkSubmission,
  gradeHomeworkSubmission,
  recordMediaDownload,
} from '../../utils/examStorage';
import { getActiveStudentRoster, normalizeVietnameseText } from '../../utils/studentRoster';
import { AttachmentList, InteractiveCommentSection, ItemActivityLogBar } from '../AttachmentAndCommentSection';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const SAMPLE_HOMEWORKS: HomeworkItem[] = [
  {
    id: 'hw-1',
    title: 'Bài tập tuần 10: Chuyên đề Phản ứng trao đổi trong dung dịch chất điện li',
    description:
      'Yêu cầu các em hoàn thành 10 bài toán xác định chất kết tủa, tính khối lượng muối sau phản ứng và nồng độ mol dung dịch. Học sinh nộp bài bằng file Word hoặc chụp ảnh vở bài làm rõ nét.',
    classGroup: 'H9.1',
    assignedDate: '12/10/2026',
    dueDate: '19/10/2026',
    fileName: 'Phieu_Bai_Tap_Tuan_10_H91.docx',
  },
  {
    id: 'hw-2',
    title: 'Bài tập Hóa 8: Tính toán theo phương trình hóa học và hiệu suất phản ứng',
    description:
      'Áp dụng định luật bảo toàn khối lượng và phương pháp giải nhanh của Thầy Hành để giải các bài toán nung đá vôi và nhiệt phân KMnO₄.',
    classGroup: 'H8.1',
    assignedDate: '10/10/2026',
    dueDate: '17/10/2026',
    fileName: 'Bai_Tap_H81_Tuan_9.docx',
  },
  {
    id: 'hw-3',
    title: 'Đề luyện đội tuyển HSG: Bài toán Hỗn hợp kim loại tác dụng axit HNO₃ và H₂SO₄ đặc',
    description:
      'Chuyên đề bồi dưỡng học sinh giỏi cấp Tỉnh, Thành phố. Sử dụng phương pháp bảo toàn electron và bảo toàn nguyên tố.',
    classGroup: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
    assignedDate: '14/10/2026',
    dueDate: '21/10/2026',
    fileName: 'De_Boi_Duong_HSG_Tuan_10.docx',
  },
  {
    id: 'hw-4',
    title: 'Bài tập KHTN 7: Lập công thức hóa học dựa vào hóa trị và phần trăm khối lượng',
    description:
      'Hoàn thành bảng hóa trị các nguyên tố thường gặp và lập công thức của các oxit, muối.',
    classGroup: 'H7.1',
    assignedDate: '08/10/2026',
    dueDate: '15/10/2026',
    fileName: 'KHTN7_Lap_CTHH.docx',
  },
];

export const HomeworkPage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { isAdmin, isTeacher, userProfile, currentUser, loginAdminMaster } = useAuth();
  const canManageHw = isAdmin || isTeacher;

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem('ndh_homeworks');
      return saved ? JSON.parse(saved) : SAMPLE_HOMEWORKS;
    } catch {
      return SAMPLE_HOMEWORKS;
    }
  });

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() =>
    getStoredHomeworkSubmissions()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [activeTab, setActiveTab] = useState<'list' | 'admin-grading'>('list');
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  // Admin: Add / Edit Homework Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHw, setEditingHw] = useState<HomeworkItem | null>(null);
  const [adminQuickPass, setAdminQuickPass] = useState('');
  const [newHw, setNewHw] = useState<Partial<HomeworkItem>>({
    title: '',
    description: '',
    classGroup: 'H8.1',
    assignedDate: new Date().toLocaleDateString('vi-VN'),
    dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('vi-VN'),
    fileName: '',
    attachments: [],
  });
  const adminHwFileRef = useRef<HTMLInputElement>(null);

  // Student: Submit Homework Modal (Word / Image)
  const [submittingHw, setSubmittingHw] = useState<HomeworkItem | null>(null);
  const [studentSubForm, setStudentSubForm] = useState({
    studentName: userProfile?.fullName || '',
    studentCode: userProfile?.studentCode || '',
    classGroup: userProfile?.enrolledClass || 'H8.1',
    contentNote: '',
  });
  const [studentAttachments, setStudentAttachments] = useState<FileAttachment[]>([]);
  const [uploadingStudentFile, setUploadingStudentFile] = useState(false);
  const studentFileRef = useRef<HTMLInputElement>(null);

  // Admin: Grade Submission Modal
  const [gradingSub, setGradingSub] = useState<HomeworkSubmission | null>(null);
  const [gradeForm, setGradeForm] = useState({
    scoreInput: '9.0',
    teacherFeedback: 'Bài làm trình bày rõ ràng, lập phương trình hóa học và tính số mol chính xác.',
  });

  const isRemoteHwUpdateRef = useRef(false);
  const isFirstHwMountRef = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem('ndh_homeworks', JSON.stringify(homeworks));
    } catch {}
    if (isFirstHwMountRef.current) {
      isFirstHwMountRef.current = false;
      return;
    }
    if (isRemoteHwUpdateRef.current) {
      isRemoteHwUpdateRef.current = false;
      return;
    }
    const now = Date.now();
    try {
      localStorage.setItem('ndh_homeworks_updated_at', String(now));
    } catch {}
    setDoc(
      doc(db, 'app_settings', 'homeworks_list'),
      { items: homeworks, updatedAt: now },
      { merge: false }
    ).catch(() => {});
  }, [homeworks]);

  useEffect(() => {
    const refreshSubs = () => setSubmissions(getStoredHomeworkSubmissions());
    window.addEventListener('ndh-hw-submissions-updated', refreshSubs);

    const unsubHw = onSnapshot(
      doc(db, 'app_settings', 'homeworks_list'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data || !Array.isArray(data.items)) return;
        const cloudUpdatedAt = Number(data.updatedAt || 0);
        const localUpdatedAt = Number(localStorage.getItem('ndh_homeworks_updated_at') || 0);
        if (cloudUpdatedAt >= localUpdatedAt || localUpdatedAt === 0) {
          isRemoteHwUpdateRef.current = true;
          setHomeworks(data.items);
          try {
            localStorage.setItem('ndh_homeworks', JSON.stringify(data.items));
            localStorage.setItem('ndh_homeworks_updated_at', String(cloudUpdatedAt || Date.now()));
          } catch {}
        }
      },
      () => {}
    );

    return () => {
      window.removeEventListener('ndh-hw-submissions-updated', refreshSubs);
      unsubHw();
    };
  }, []);

  // Admin: Attach Word/PDF/Image to Homework Assignment in Modal
  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const processed: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        processed.push(await processUploadedFile(files[i]));
      }
      const firstFileTitle = processed[0]?.name
        ? processed[0].name.replace(/\.(docx|doc|pdf|jpg|jpeg|png|webp)$/i, '').replace(/[_-]+/g, ' ')
        : '';
      setNewHw((prev) => ({
        ...prev,
        title: prev.title?.trim() ? prev.title : firstFileTitle,
        fileName: processed[0]?.name || prev.fileName,
        attachments: [...(prev.attachments || []), ...processed],
      }));
      showToast(
        `Đã tải lên ${processed.length} tệp đề bài (Word / PDF / Ảnh)! Nội dung sẽ hiển thị trực tiếp trên ứng dụng.`,
        'success'
      );
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Admin: Quick-upload Word/PDF/Image directly onto an existing Homework card
  const handleQuickUploadToHomework = async (
    hwId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const processed: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        processed.push(await processUploadedFile(files[i]));
      }
      setHomeworks((prev) =>
        prev.map((hw) => {
          if ((hw.id || 'hw-default') === hwId) {
            const existing = buildEffectiveHomeworkAttachments(hw);
            return {
              ...hw,
              fileName: processed[0]?.name || hw.fileName,
              attachments: [...existing, ...processed],
            };
          }
          return hw;
        })
      );
      showToast(
        `Đã up thêm ${processed.length} file (Word / PDF / Ảnh) vào bài tập! Có thể bấm "Xem" hoặc "Tải" ngay.`,
        'success'
      );
    } catch {
      showToast('Không thể tải tệp lên bài tập.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Remove a specific attachment from a Homework card (Admin)
  const handleRemoveHomeworkAttachment = (hwId: string, attId: string) => {
    setHomeworks((prev) =>
      prev.map((hw) => {
        if ((hw.id || 'hw-default') === hwId) {
          const existing = buildEffectiveHomeworkAttachments(hw);
          const nextAtts = existing.filter((a) => a.id !== attId);
          return {
            ...hw,
            fileName: nextAtts[0]?.name || '',
            attachments: nextAtts,
          };
        }
        return hw;
      })
    );
    showToast('Đã xóa tệp đính kèm khỏi bài tập.', 'info');
  };

  // Ensure even default homework items with only `fileName` have a viewable & downloadable FileAttachment
  const buildEffectiveHomeworkAttachments = (hw: HomeworkItem): FileAttachment[] => {
    if (hw.attachments && hw.attachments.length > 0) {
      return hw.attachments;
    }
    if (!hw.fileName) return [];

    const lower = hw.fileName.toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(lower);
    const fullText = `PHIẾU BÀI TẬP HÓA HỌC THCS - THẦY NGUYỄN ĐÌNH HÀNH\n==================================================\nTiêu đề: ${hw.title}\nLớp áp dụng: ${hw.classGroup}\nNgày giao: ${hw.assignedDate} | Hạn nộp: ${hw.dueDate}\n\nNỘI DUNG ĐỀ BÀI & YÊU CẦU:\n${hw.description}\n\nCÂU HỎI TỰ LUYỆN TRỌNG TÂM:\nCâu 1 (3,0 điểm): Hoàn thành các phương trình hóa học theo sơ đồ chuyển hóa và ghi rõ điều kiện phản ứng (nếu có).\nCâu 2 (4,0 điểm): Bài toán tính theo phương trình hóa học kết hợp định luật bảo toàn khối lượng và nồng độ mol dung dịch.\nCâu 3 (3,0 điểm): Bài toán vận dụng cao rèn kỹ năng giải nhanh Hóa học NĐH.\n\nHướng dẫn nộp bài:\nHọc sinh làm bài ra vở (chụp ảnh rõ nét) hoặc trình bày trên file Word (.docx) rồi bấm nút "Gửi bài tập (File Word / Ảnh)" trên hệ thống để Thầy chấm điểm.`;

    const encoded = encodeURIComponent(fullText);
    const dataUrl = `data:application/msword;charset=utf-8,${encoded}`;

    return [
      {
        id: `default-att-${hw.id || hw.fileName}`,
        name: hw.fileName,
        type: isPdf ? 'pdf' : isImg ? 'image' : 'word',
        mimeType: isPdf ? 'application/pdf' : 'application/msword',
        dataUrl,
        sizeLabel: '24 KB',
        extractedText: fullText,
      },
    ];
  };

  // Admin: Save Homework
  const handleSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageHw) {
      if (!adminQuickPass.trim()) {
        showToast('Vui lòng nhập mật khẩu Quản trị viên để đăng bài tập.', 'error');
        return;
      }
      try {
        await loginAdminMaster(adminQuickPass.trim(), 'admin');
      } catch (err: any) {
        showToast(err?.message || 'Mật khẩu Quản trị viên không đúng.', 'error');
        return;
      }
    }

    const effectiveTitle =
      newHw.title?.trim() ||
      newHw.attachments?.[0]?.name?.replace(/\.(docx|doc|pdf|jpg|jpeg|png|webp)$/i, '') ||
      '';
    const effectiveDueDate =
      newHw.dueDate?.trim() ||
      new Date(Date.now() + 7 * 86400000).toLocaleDateString('vi-VN');

    if (!effectiveTitle) {
      showToast('Vui lòng nhập tiêu đề bài tập hoặc chọn tệp đề bài (Word, PDF, Ảnh).', 'error');
      return;
    }

    if (editingHw) {
      const updated = homeworks.map((h) =>
        h.id === editingHw.id
          ? ({
              ...h,
              ...newHw,
              title: effectiveTitle,
              dueDate: effectiveDueDate,
            } as HomeworkItem)
          : h
      );
      setHomeworks(updated);
      showToast('Đã cập nhật bài tập và hiển thị trực tiếp trên ứng dụng!', 'success');
    } else {
      const created: HomeworkItem = {
        id: 'hw-' + Date.now(),
        title: effectiveTitle,
        description:
          newHw.description ||
          'Học sinh xem trực tiếp nội dung đề bài đính kèm bên dưới và bấm nút "Gửi bài tập (File Word / PDF / Ảnh)" để nộp bài làm.',
        classGroup: newHw.classGroup || 'H8.1',
        assignedDate: newHw.assignedDate || new Date().toLocaleDateString('vi-VN'),
        dueDate: effectiveDueDate,
        fileName: newHw.fileName || (newHw.attachments?.[0]?.name ?? ''),
        attachments: newHw.attachments || [],
        createdAt: new Date().toISOString(),
      };
      setHomeworks([created, ...homeworks]);
      showToast('Đã up bài tập mới thành công! Bài tập đã hiển thị trực tiếp trên app.', 'success');
    }

    setAdminQuickPass('');
    setShowAddModal(false);
    setEditingHw(null);
  };

  // Student: Open Submit Homework Modal
  const handleOpenStudentSubmit = (hw: HomeworkItem) => {
    setSubmittingHw(hw);
    setStudentSubForm({
      studentName: userProfile?.fullName || '',
      studentCode: userProfile?.studentCode || '',
      classGroup: userProfile?.enrolledClass || hw.classGroup || 'H8.1',
      contentNote: '',
    });
    setStudentAttachments([]);
  };

  // Student: Upload Word / Image files for homework submission
  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingStudentFile(true);
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setStudentAttachments((prev) => [...prev, ...uploaded]);
      showToast(`Đã tải lên ${uploaded.length} tệp bài làm (Word/Ảnh)!`, 'success');
    } catch {
      showToast('Lỗi khi tải tệp bài làm.', 'error');
    } finally {
      setUploadingStudentFile(false);
      e.target.value = '';
    }
  };

  // Student: Submit Homework
  const handleStudentSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;
    if (!studentSubForm.studentName.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh.', 'error');
      return;
    }
    if (!studentSubForm.contentNote.trim() && studentAttachments.length === 0) {
      showToast('Vui lòng đính kèm file bài làm (Word hoặc Ảnh) hoặc nhập nội dung bài giải.', 'error');
      return;
    }

    let verifiedName = studentSubForm.studentName.trim();
    let verifiedCode = studentSubForm.studentCode.trim() || 'NDH-HS';
    let verifiedClass = studentSubForm.classGroup;

    if (!isAdmin) {
      const roster = getActiveStudentRoster();
      const normInput = normalizeVietnameseText(verifiedName);
      const matched = roster.find(
        (s) => normalizeVietnameseText(s.fullName) === normInput
      );
      if (!matched) {
        showToast(
          'Họ và tên học sinh không nằm trong danh sách lớp chính thức. Vui lòng đăng nhập tài khoản học sinh để nộp bài.',
          'error'
        );
        return;
      }
      verifiedName = matched.fullName;
      verifiedCode = matched.studentCode || verifiedCode;
      verifiedClass = matched.enrolledClass || verifiedClass;
    }

    const newSub: HomeworkSubmission = {
      id: 'hwsub-' + Date.now(),
      homeworkId: submittingHw.id || 'hw',
      homeworkTitle: submittingHw.title,
      studentId: currentUser?.uid || 'student',
      studentCode: verifiedCode,
      studentName: verifiedName,
      classGroup: verifiedClass,
      contentNote: studentSubForm.contentNote.trim(),
      attachments: studentAttachments,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'submitted',
      maxScore: 10,
    };

    const next = saveHomeworkSubmission(newSub);
    setSubmissions(next);
    setSubmittingHw(null);
    showToast(
      `Đã gửi bài tập "${submittingHw.title}" thành công! Đã ghi nhận tên HS ${verifiedName} (${verifiedClass}).`,
      'success'
    );
  };

  // Admin: Save Grade for Student Submission
  const handleConfirmGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    const scoreNum = Number(gradeForm.scoreInput.replace(',', '.'));
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      showToast('Vui lòng nhập điểm hợp lệ từ 0 đến 10.', 'error');
      return;
    }

    const next = gradeHomeworkSubmission(
      gradingSub.id,
      scoreNum,
      gradeForm.teacherFeedback.trim()
    );
    setSubmissions(next);
    setGradingSub(null);
    showToast(
      `Đã chấm bài của HS ${gradingSub.studentName}: ${scoreNum}/10 điểm và đồng bộ lên Bảng điểm!`,
      'success'
    );
  };

  // Admin: Export Homework Grades to Excel
  const handleExportHomeworkGrades = () => {
    if (submissions.length === 0) {
      showToast('Chưa có bài nộp nào để tải file điểm.', 'info');
      return;
    }
    const rows = submissions.map((s, idx) => ({
      STT: idx + 1,
      'Mã HS': s.studentCode || '',
      'Họ và tên học sinh': s.studentName,
      'Lớp': s.classGroup,
      'Tên bài tập': s.homeworkTitle,
      'Thời gian nộp': s.submittedAt,
      'Số tệp đính kèm': s.attachments.length,
      'Trạng thái': s.status === 'graded' ? 'Đã chấm' : 'Chờ chấm',
      'Điểm số (thang 10)': s.score ?? '',
      'Nhận xét của Giáo viên': s.teacherFeedback || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diem_Bai_Tap');
    XLSX.writeFile(wb, `Bang_Diem_Bai_Tap_NDH_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Đã tải xuống file điểm bài tập (.XLSX) thành công!', 'success');
  };

  // Admin: Upload Homework Grades from Excel
  const handleImportHomeworkGrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        let updatedCount = 0;
        rows.forEach((r: any) => {
          const name = String(r['Họ và tên học sinh'] || r['Họ tên'] || '').trim();
          const scoreVal = Number(r['Điểm số (thang 10)'] ?? r['Điểm số'] ?? r['Điểm']);
          const feedback = String(r['Nhận xét của Giáo viên'] || r['Nhận xét'] || 'Hoàn thành bài tập tốt.');
          const hwTitle = String(r['Tên bài tập'] || homeworks[0]?.title || 'Bài tập về nhà');
          const cls = String(r['Lớp'] || 'H8.1');

          if (name && Number.isFinite(scoreVal)) {
            const existingSub = submissions.find(
              (s) => s.studentName.toLowerCase() === name.toLowerCase()
            );
            if (existingSub) {
              gradeHomeworkSubmission(existingSub.id, scoreVal, feedback);
            } else {
              const createdSub: HomeworkSubmission = {
                id: 'hwsub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                homeworkId: homeworks[0]?.id || 'hw-1',
                homeworkTitle: hwTitle,
                studentId: 'student',
                studentCode: String(r['Mã HS'] || 'NDH-HS'),
                studentName: name,
                classGroup: cls,
                contentNote: 'Nhập điểm từ file Excel của Giáo viên',
                attachments: [],
                submittedAt: new Date().toLocaleString('vi-VN'),
                status: 'graded',
                score: scoreVal,
                maxScore: 10,
                teacherFeedback: feedback,
                gradedAt: new Date().toLocaleString('vi-VN'),
              };
              saveHomeworkSubmission(createdSub);
              gradeHomeworkSubmission(createdSub.id, scoreVal, feedback);
            }
            updatedCount++;
          }
        });

        setSubmissions(getStoredHomeworkSubmissions());
        showToast(
          `Đã up file điểm và cập nhật điểm cho ${updatedCount} học sinh!`,
          'success'
        );
      } catch {
        showToast('Không thể đọc file Excel điểm bài tập.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Download sample homework file when student clicks "Tải đề" on default items
  const handleDownloadDefaultHomeworkDoc = (hw: HomeworkItem) => {
    if (hw.attachments && hw.attachments.length > 0) return;
    recordMediaDownload(`hw-${hw.id || 'hw'}`, {
      userName: userProfile?.fullName || '',
      userClass: userProfile?.enrolledClass || '',
      userRole: isAdmin ? 'admin' : userProfile?.role || 'student',
    });
    const content = `PHIẾU BÀI TẬP HÓA HỌC THCS - THẦY NGUYỄN ĐÌNH HÀNH\n==================================================\nTiêu đề: ${hw.title}\nLớp áp dụng: ${hw.classGroup}\nNgày giao: ${hw.assignedDate} | Hạn nộp: ${hw.dueDate}\n\nNội dung & Yêu cầu:\n${hw.description}\n\nHướng dẫn nộp bài:\nHọc sinh làm bài ra vở (chụp ảnh rõ nét) hoặc trình bày trên file Word (.docx) rồi bấm nút "Gửi bài tập (Word / Ảnh)" trên hệ thống để Thầy chấm điểm.`;
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = hw.fileName || `Bai_Tap_${hw.classGroup}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã tải phiếu bài tập: ${hw.title}`, 'success');
  };

  const filteredHw = homeworks.filter((hw) => {
    if (filterClass !== 'all' && hw.classGroup !== filterClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        hw.title.toLowerCase().includes(q) ||
        hw.description.toLowerCase().includes(q) ||
        hw.classGroup.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 mb-1">
            <FileText className="w-3.5 h-3.5" />
            Mục số 1: Giao Bài Tập, Nộp Bài (Word/Ảnh) & Chấm Bài Chuyên Nghiệp
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Nhiệm Vụ & Bài Tập Về Nhà Các Lớp Hóa Học NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Chế độ Quản trị viên: Ra đề bài tập (đính kèm Word/Ảnh), chấm bài học sinh nộp, tải file điểm và up file điểm.'
              : 'Dành cho Học sinh: Tải đề bài tập, gửi bài tập đã làm (file Word hoặc Ảnh chụp bài giải) và bình luận trao đổi.'}
          </p>
        </div>

        {/* Admin Upload & Toolbar + Student Info */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingHw(null);
              setAdminQuickPass('');
              setNewHw({
                title: '',
                description: '',
                classGroup: 'H8.1',
                assignedDate: new Date().toLocaleDateString('vi-VN'),
                dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('vi-VN'),
                fileName: '',
                attachments: [],
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Quản trị Up Bài Tập (Word, PDF, Ảnh)</span>
          </button>

          {canManageHw && (
            <>
              <button
                onClick={() =>
                  setActiveTab(activeTab === 'admin-grading' ? 'list' : 'admin-grading')
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin-grading'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Chấm bài học sinh nộp ({submissions.length})</span>
              </button>

              <button
                onClick={handleExportHomeworkGrades}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải file điểm (.XLSX)</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Up file điểm (.XLSX)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportHomeworkGrades}
                  className="hidden"
                />
              </label>
            </>
          )}

          {!canManageHw && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Học sinh: Xem đề trực tiếp & Gửi bài tập (Word / PDF / Ảnh)</span>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN GRADING PANEL (WHEN ACTIVE OR FOR ADMIN OVERVIEW) */}
      {isAdmin && activeTab === 'admin-grading' && (
        <div className="bg-white rounded-2xl shadow-md border-2 border-indigo-200 overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 py-4 bg-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>QUẢN TRỊ CHẤM BÀI TẬP HỌC SINH NỘP (FILE WORD & ẢNH)</span>
              </h3>
              <p className="text-xs text-indigo-200">
                Xem trực tiếp bài làm (Word/Ảnh) của học sinh, chấm điểm và tự động đồng bộ sang Bảng điểm khảo thí.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer self-start sm:self-auto"
            >
              ← Quay lại Danh sách bài tập
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Học sinh nộp bài</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Bài tập</th>
                  <th className="py-3 px-3">Bài làm & Tệp đính kèm (Word / Ảnh)</th>
                  <th className="py-3 px-3">Thời gian nộp</th>
                  <th className="py-3 px-3 text-center">Điểm số</th>
                  <th className="py-3 px-3">Nhận xét của Thầy</th>
                  <th className="py-3 px-4 text-center">Thao tác Chấm bài</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Chưa có bài nộp nào từ học sinh. Khi học sinh bấm "Gửi bài tập (Word/Ảnh)", bài làm sẽ hiển thị tại đây để Thầy chấm điểm.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {sub.studentName}
                        {sub.studentCode && (
                          <span className="block text-[10px] font-mono text-slate-400">
                            {sub.studentCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-cyan-800">{sub.classGroup}</td>
                      <td className="py-3 px-3 font-semibold max-w-xs">{sub.homeworkTitle}</td>
                      <td className="py-3 px-3 max-w-sm">
                        {sub.contentNote && (
                          <p className="text-slate-700 mb-1 whitespace-pre-wrap">
                            {sub.contentNote}
                          </p>
                        )}
                        <AttachmentList attachments={sub.attachments} compact />
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {sub.submittedAt}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sub.status === 'graded' && sub.score !== undefined ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm">
                            {sub.score} / 10
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Chờ chấm
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 italic text-slate-600 max-w-xs">
                        {sub.teacherFeedback || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setGradingSub(sub);
                            setGradeForm({
                              scoreInput: sub.score !== undefined ? String(sub.score) : '9.0',
                              teacherFeedback:
                                sub.teacherFeedback ||
                                'Bài làm đúng phương pháp, trình bày rõ ràng.',
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{sub.status === 'graded' ? 'Sửa điểm' : 'Chấm bài'}</span>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập theo tên, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs font-semibold">
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
      </div>

      {/* Homework Cards List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredHw.map((hw) => {
          const hwId = hw.id || 'hw-default';
          const hwSubmissions = submissions.filter((s) => s.homeworkId === hwId);
          const mySubmissions = hwSubmissions.filter(
            (s) =>
              (userProfile?.fullName &&
                s.studentName.toLowerCase() === userProfile.fullName.toLowerCase()) ||
              (currentUser?.uid && s.studentId === currentUser.uid)
          );
          const isCommentsOpen = expandedCommentsId === hwId;

          return (
            <div
              key={hwId}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-cyan-400 shadow-xs transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black px-3 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                    Lớp {hw.classGroup}
                  </span>
                  <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Hạn nộp: {hw.dueDate}
                  </span>
                  <span className="text-xs text-slate-400">
                    Ngày giao: {hw.assignedDate}
                  </span>
                </div>

                {/* Admin Edit/Delete Controls */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('admin-grading');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs cursor-pointer"
                    >
                      Đã nộp: {hwSubmissions.length} bài
                    </button>
                    <button
                      onClick={() => {
                        setEditingHw(hw);
                        setNewHw({ ...hw });
                        setShowAddModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                      title="Sửa bài tập (QTV)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Xóa bài tập này?')) {
                          setHomeworks(homeworks.filter((i) => i.id !== hw.id));
                          showToast('Đã xóa bài tập.', 'info');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Xóa bài tập (QTV)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg mb-1.5">
                  {hw.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {hw.description}
                </p>

                {/* Attached Teacher Files (Word / PDF / Image) displayed directly in-app */}
                {(() => {
                  const effectiveAtts = buildEffectiveHomeworkAttachments(hw);
                  return (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
                          <span>
                            Nội dung đề bài đính kèm (Word, PDF, Ảnh) — Hiển thị & Xem trực tiếp tại App:
                          </span>
                        </span>

                        {canManageHw && (
                          <label className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1.5 cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>+ Up file đề (Word / PDF / Ảnh)</span>
                            <input
                              type="file"
                              multiple
                              accept=".doc,.docx,.pdf,image/*"
                              onChange={(e) => handleQuickUploadToHomework(hwId, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {effectiveAtts.length > 0 ? (
                        <AttachmentList
                          attachments={effectiveAtts}
                          showInlinePreview={true}
                          parentTargetId={`hw-${hwId}`}
                          onRemove={
                            canManageHw
                              ? (attId) => handleRemoveHomeworkAttachment(hwId, attId)
                              : undefined
                          }
                        />
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Chưa có file đính kèm. Bấm "+ Quản trị Up Bài Tập (Word, PDF, Ảnh)" để tải tệp lên.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Automatic Roster-Verified Student Interaction Log Bar (Xem, Viết/Nộp bài, Tải) */}
                <ItemActivityLogBar
                  targetId={`hw-${hwId}`}
                  label="Học sinh tương tác bài tập này (Tự động: Đã xem, Đã viết/nộp bài, Đã tải)"
                  compact
                />
              </div>

              {/* Show Student's Own Submitted Work & Teacher's Grade if submitted */}
              {mySubmissions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs">
                  {mySubmissions.map((mySub) => (
                    <div key={mySub.id} className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đã gửi bài tập ({mySub.submittedAt}) — Học sinh: {mySub.studentName}
                        </span>
                        {mySub.status === 'graded' && mySub.score !== undefined ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                            Điểm Thầy chấm: {mySub.score} / 10
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            Đang chờ Thầy chấm điểm
                          </span>
                        )}
                      </div>
                      {mySub.contentNote && (
                        <p className="text-slate-700">Ghi chú bài làm: {mySub.contentNote}</p>
                      )}
                      <AttachmentList attachments={mySub.attachments} compact />
                      {mySub.teacherFeedback && (
                        <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-medium">
                          <strong>Nhận xét của Thầy Nguyễn Đình Hành:</strong> “{mySub.teacherFeedback}”
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Action Bar: Student Submit Homework (Word/Image), Toggle Comments */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCommentsId(isCommentsOpen ? null : hwId)
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-600" />
                    <span>Bình luận & Hỏi đáp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Student Interaction: Gửi bài tập (Word, Ảnh) */}
                  <button
                    type="button"
                    onClick={() => handleOpenStudentSubmit(hw)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi bài tập (File Word / Ảnh)</span>
                  </button>
                </div>
              </div>

              {/* Interactive Comments Section (Supports Word & Image attachments) */}
              {isCommentsOpen && (
                <InteractiveCommentSection
                  targetId={`hw-${hwId}`}
                  title="Bình luận & Trao đổi bài tập (Gửi câu hỏi, file Word hoặc Ảnh)"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          STUDENT MODAL: SUBMIT HOMEWORK (ATTACH WORD / IMAGE FILES)
         ===================================================================== */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-cyan-600" />
                  <span>Gửi Bài Tập Về Nhà Cho Thầy Hành</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {submittingHw.title}
                </p>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmitHomework} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Nhập họ và tên học sinh..."
                    value={studentSubForm.studentName}
                    onChange={(e) =>
                      setStudentSubForm({ ...studentSubForm, studentName: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp theo học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentSubForm.classGroup}
                    onChange={(e) =>
                      setStudentSubForm({ ...studentSubForm, classGroup: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Box: Word (.doc, .docx) & Images (.jpg, .png) */}
              <div className="p-4 rounded-xl bg-cyan-50/60 border-2 border-dashed border-cyan-300 text-center space-y-2">
                <Paperclip className="w-7 h-7 text-cyan-600 mx-auto" />
                <div className="font-extrabold text-slate-800">
                  Tải lên File Bài Tập Đã Làm (File Word hoặc Ảnh chụp vở)
                </div>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ: File Word (.doc, .docx), Ảnh chụp bài giải (.jpg, .png, .webp) hoặc PDF
                </p>
                <button
                  type="button"
                  onClick={() => studentFileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingStudentFile ? 'Đang tải tệp...' : 'Chọn File Word / Ảnh từ máy'}
                  </span>
                </button>
                <input
                  ref={studentFileRef}
                  type="file"
                  multiple
                  accept=".doc,.docx,image/*,.pdf"
                  onChange={handleStudentFileUpload}
                  className="hidden"
                />
              </div>

              {studentAttachments.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Tệp bài làm đã đính kèm ({studentAttachments.length}):
                  </span>
                  <AttachmentList
                    attachments={studentAttachments}
                    onRemove={(id) =>
                      setStudentAttachments((prev) => prev.filter((a) => a.id !== id))
                    }
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trình bày tóm tắt đáp số / Ghi chú gửi Thầy
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập đáp số hoặc lời giải của em tại đây..."
                  value={studentSubForm.contentNote}
                  onChange={(e) =>
                    setStudentSubForm({ ...studentSubForm, contentNote: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp Bài Tập Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL: GRADE STUDENT HOMEWORK SUBMISSION
         ===================================================================== */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Chấm Bài Tập Học Sinh: {gradingSub.studentName}</span>
              </h3>
              <button
                onClick={() => setGradingSub(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">
                  Bài tập: {gradingSub.homeworkTitle} ({gradingSub.classGroup})
                </div>
                {gradingSub.contentNote && (
                  <p className="text-slate-700 whitespace-pre-wrap">
                    <strong>Lời giải / Ghi chú của HS:</strong> {gradingSub.contentNote}
                  </p>
                )}
                {gradingSub.attachments.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-600 block mb-1">
                      Tệp bài làm học sinh nộp (Bấm biểu tượng Mắt để xem trực tiếp hoặc Tải về):
                    </span>
                    <AttachmentList attachments={gradingSub.attachments} />
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmGrade} className="space-y-3">
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">
                    Điểm số chấm (Thang điểm 10) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={gradeForm.scoreInput}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, scoreInput: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-black text-base text-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-800 mb-1">
                    Nhận xét sư phạm của Thầy Nguyễn Đình Hành
                  </label>
                  <textarea
                    rows={3}
                    value={gradeForm.teacherFeedback}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, teacherFeedback: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setGradingSub(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow cursor-pointer"
                  >
                    Lưu Điểm & Công Bố Lên Bảng Điểm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL: ADD / EDIT HOMEWORK ASSIGNMENT (WITH WORD / IMAGE UPLOAD)
         ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-600" />
                {editingHw ? 'Chỉnh Sửa Bài Tập Về Nhà' : 'Giao Bài Tập Về Nhà Mới (Quản Trị)'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHomework} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài tập tuần 11 - Chuyên đề Kim loại..."
                  value={newHw.title}
                  onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp nhận bài</label>
                  <select
                    value={newHw.classGroup}
                    onChange={(e) => setNewHw({ ...newHw, classGroup: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày giao</label>
                  <input
                    type="text"
                    value={newHw.assignedDate}
                    onChange={(e) => setNewHw({ ...newHw, assignedDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hạn nộp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/YYYY"
                    value={newHw.dueDate}
                    onChange={(e) => setNewHw({ ...newHw, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung đề bài và yêu cầu chi tiết
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập đề bài hoặc hướng dẫn các em làm bài..."
                  value={newHw.description}
                  onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-4 rounded-xl bg-cyan-50/70 border-2 border-dashed border-cyan-300 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-slate-800 block">
                      Tải lên File Đề Bài Tập (Word .doc/.docx, PDF .pdf, Ảnh .jpg/.png)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Bài tải lên sẽ hiển thị và xem trực tiếp ngay tại ứng dụng cho học sinh làm bài.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminHwFileRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn file Word / PDF / Ảnh</span>
                  </button>
                  <input
                    ref={adminHwFileRef}
                    type="file"
                    multiple
                    accept=".doc,.docx,image/*,.pdf"
                    onChange={handleAdminFileUpload}
                    className="hidden"
                  />
                </div>

                {newHw.attachments && newHw.attachments.length > 0 && (
                  <AttachmentList
                    attachments={newHw.attachments}
                    showInlinePreview={true}
                    onRemove={(id) =>
                      setNewHw((prev) => ({
                        ...prev,
                        attachments: (prev.attachments || []).filter((a) => a.id !== id),
                      }))
                    }
                  />
                )}
              </div>

              {!canManageHw && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
                  <label className="block font-extrabold text-red-800 text-xs">
                    Xác thực Quản trị viên (Nhập mật khẩu Quản trị để đăng bài):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminQuickPass}
                    onChange={(e) => setAdminQuickPass(e.target.value)}
                    placeholder="Nhập mật khẩu Quản trị viên..."
                    className="w-full p-2 border border-red-300 rounded-lg bg-white font-bold text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow cursor-pointer"
                >
                  {editingHw ? 'Lưu cập nhật & Hiển thị' : 'Đăng bài tập & Hiển thị trực tiếp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
