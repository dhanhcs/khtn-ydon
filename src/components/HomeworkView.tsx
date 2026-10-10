import React, { useState, useRef } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ChevronRight,
  Send,
  PlusCircle,
  Edit3,
  Trash2,
  Lock,
  ShieldCheck,
  User,
  X,
  CheckCircle2,
  Upload,
  Download,
  Film,
  Image as ImageIcon,
  FileCode,
  Award,
  Sparkles,
  FolderUp,
  ExternalLink,
  Link as LinkIcon,
  Info
} from 'lucide-react';
import { GradeLevel, HomeworkRecord, HomeworkSubmission, DigitalFileType, PostComment, UserSession } from '../types';
import { CommentSection } from './CommentSection';
import { readFileToDataUrl, normalizeUrl, safeLocalStorageSetItem } from '../utils/fileUtils';

interface HomeworkViewProps {
  currentUser: UserSession | null;
  onRequireLogin: () => void;
}

const defaultHomeworkRecords: HomeworkRecord[] = [
  {
    id: 'hw-01',
    title: 'Bài tập tuần 3: Tính toán lực đẩy Archimedes trong thực tiễn',
    subject: 'physics',
    grade: 8,
    teacher: 'Thầy Nguyễn Đình Hành',
    deadline: '20:00 - Chủ Nhật (20/09/2026)',
    description: 'Vận dụng công thức Fa = d.V để giải thích hiện tượng tàu thủy nổi và tính lực đẩy tác dụng lên thỏi đồng chìm trong nước.',
    questions: [
      'Câu 1: Một quả cầu nhôm có thể tích V = 0.005 m³ được nhúng chìm hoàn toàn trong nước. Biết trọng lượng riêng của nước là d = 10000 N/m³. Tính lực đẩy Archimedes tác dụng lên quả cầu?',
      'Câu 2: Tại sao một chiếc đinh sắt nhỏ thả vào nước thì chìm, nhưng con tàu thủy bằng thép nặng hàng ngàn tấn lại nổi được trên mặt nước?'
    ],
    fileType: 'word',
    fileName: 'De_bai_tap_tuan_3_Archimedes.docx',
    fileSize: '48 KB',
    submissions: [
      {
        id: 'sub-01',
        homeworkId: 'hw-01',
        studentName: 'Trần Minh Hoàng',
        className: '8A1',
        submittedAt: '14:30 - 15/09/2026',
        note: 'Em đã hoàn thành 2 câu hỏi tính lực đẩy Archimedes và giải thích nguyên lý tàu thủy vỏ thép nổi trên mặt nước.',
        fileType: 'word',
        fileName: 'Bai_lam_vat_li_TranMinhHoang_8A1.docx',
        fileSize: '65 KB',
        score: 9.5,
        teacherFeedback: 'Bài làm rất tốt, tính toán chính xác đơn vị SI và giải thích hiện tượng tàu thủy rất chặt chẽ. Đáng khen!',
        gradedBy: 'Thầy Nguyễn Đình Hành',
        gradedAt: '16:00 - 15/09/2026'
      },
      {
        id: 'sub-02',
        homeworkId: 'hw-01',
        studentName: 'Đinh Thị Mai Lan',
        className: '8A1',
        submittedAt: '19:45 - 15/09/2026',
        note: 'Em gửi ảnh chụp bài giải trong vở ghi bài tập Vật lí ạ.',
        fileType: 'image',
        fileName: 'anh_bai_lam_mai_lan.jpg',
        fileSize: '1.2 MB',
        score: 9.0,
        teacherFeedback: 'Chữ viết sạch đẹp, trình bày rõ ràng từng bước áp dụng công thức Fa = d.V.',
        gradedBy: 'Thầy Nguyễn Đình Hành',
        gradedAt: '20:10 - 15/09/2026'
      }
    ],
    comments: [
      {
        id: 'cmt-hw-1',
        authorName: 'Đinh Thị Mai Lan',
        authorRole: 'student',
        authorClass: '8A1',
        content: 'Em thưa Thầy, ở câu 1 đơn vị thể tích đã là m³ rồi thì không cần phải đổi đơn vị nữa đúng không ạ?',
        createdAt: '19:15 - 12/09/2026'
      },
      {
        id: 'cmt-hw-2',
        authorName: 'Thầy Nguyễn Đình Hành',
        authorRole: 'admin',
        authorSubject: 'physics',
        content: 'Đúng rồi em nhé! V = 0.005 m³ là đơn vị chuẩn SI, em chỉ cần áp dụng trực tiếp Fa = d * V = 10000 * 0.005 = 50 N là ra đáp số.',
        createdAt: '19:40 - 12/09/2026'
      }
    ],
    createdAt: '2026-09-10'
  },
  {
    id: 'hw-02',
    title: 'Bài tập tuần 3: Lập phương trình hóa học và tính theo phương trình',
    subject: 'chemistry',
    grade: 8,
    teacher: 'Cô Nguyễn Thị Cẩm Lệ',
    deadline: '21:00 - Thứ Bảy (19/09/2026)',
    description: 'Cân bằng các phản ứng kim loại tác dụng với oxygen và acid clohidric, tính thể tích khí thoát ra ở đkc.',
    questions: [
      'Câu 1: Hoàn thành và cân bằng PTHH: Fe + O₂ → Fe₃O₄ và Al + HCl → AlCl₃ + H₂ ↑',
      'Câu 2: Đốt cháy hoàn toàn 6.4 gam lưu huỳnh (S) trong bình chứa khí oxygen. Tính thể tích khí SO₂ sinh ra ở điều kiện chuẩn?'
    ],
    fileType: 'ppt',
    fileName: 'Slide_huong_dan_can_bang_PTHH.pptx',
    fileSize: '3.4 MB',
    submissions: [],
    comments: [],
    createdAt: '2026-09-10'
  },
  {
    id: 'hw-03',
    title: 'Bài tập tuần 3: Sơ đồ tư duy vòng tuần hoàn máu ở người',
    subject: 'biology',
    grade: 8,
    teacher: 'Cô Đặng Thị Xuân Sang',
    deadline: '20:00 - Thứ Hai (21/09/2026)',
    description: 'Vẽ hoặc tóm tắt đường đi của máu trong vòng tuần hoàn lớn và vòng tuần hoàn nhỏ.',
    questions: [
      'Câu 1: Mô tả đường đi của máu từ tâm thất trái đi nuôi cơ thể rồi trở về tâm nhĩ phải?',
      'Câu 2: Tại sao người bị cao huyết áp không nên ăn mặn và vận động quá sức?'
    ],
    fileType: 'pdf',
    fileName: 'So_do_vong_tuan_hoan_mau.pdf',
    fileSize: '820 KB',
    submissions: [],
    comments: [],
    createdAt: '2026-09-09'
  }
];

export function HomeworkView({ currentUser, onRequireLogin }: HomeworkViewProps) {
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>(() => {
    const saved = localStorage.getItem('ydon_homework_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultHomeworkRecords;
  });

  const [selectedHw, setSelectedHw] = useState<HomeworkRecord | null>(null);
  const [editingHw, setEditingHw] = useState<HomeworkRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Student submission modal
  const [submittingHw, setSubmittingHw] = useState<HomeworkRecord | null>(null);
  const [subStudentName, setSubStudentName] = useState(currentUser?.name || '');
  const [subClassName, setSubClassName] = useState(currentUser?.className || '8A1');
  const [subNote, setSubNote] = useState('');
  const [subContentUrl, setSubContentUrl] = useState('');
  const [subFileType, setSubFileType] = useState<DigitalFileType>('word');
  const [subFileName, setSubFileName] = useState('');
  const [subFileSize, setSubFileSize] = useState('');
  const [subFileData, setFileData] = useState<string>('');
  const [subVideoDuration, setSubVideoDuration] = useState<number>(60);
  const [subError, setSubError] = useState('');
  const [subIsUploading, setSubIsUploading] = useState(false);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // Teacher grading modal
  const [gradingSub, setGradingSub] = useState<{ hwId: string; submission: HomeworkSubmission } | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(9.0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'physics' | 'chemistry' | 'biology'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Form state for teacher creating/editing homework
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [formGrade, setFormGrade] = useState<GradeLevel>(8);
  const [formTeacher, setFormTeacher] = useState(currentUser?.adminName || 'Thầy Nguyễn Đình Hành');
  const [formDeadline, setFormDeadline] = useState('20:00 - Chủ Nhật tuần này');
  const [formDescription, setFormDescription] = useState('');
  const [formContentUrl, setFormContentUrl] = useState('');
  const [formQuestionsText, setFormQuestionsText] = useState('');
  const [formFileType, setFormFileType] = useState<DigitalFileType>('word');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formFileData, setFormFileData] = useState<string>('');
  const [formVideoDuration, setFormVideoDuration] = useState<number>(60);
  const [formError, setFormError] = useState('');
  const [formIsUploading, setFormIsUploading] = useState(false);
  const formFileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  const saveHomeworkList = (next: HomeworkRecord[]) => {
    setHomeworkList(next);
    safeLocalStorageSetItem('ydon_homework_list', JSON.stringify(next));
  };

  // Helper to open create modal
  const handleOpenCreate = () => {
    if (!isAdmin) {
      setPermissionNotice(
        'Chỉ Giáo viên bộ môn mới có quyền tạo và chỉnh sửa bài tập về nhà. Học sinh có thể gửi bài làm (đính kèm tệp Word, Ảnh, PPT, Video ngắn, PDF) và bình luận thảo luận.'
      );
      return;
    }
    setFormTitle('');
    setFormSubject('physics');
    setFormGrade(8);
    setFormTeacher(currentUser?.adminName || 'Giáo viên bộ môn');
    setFormDeadline('20:00 - Chủ Nhật (27/09/2026)');
    setFormDescription('');
    setFormContentUrl('');
    setFormQuestionsText('Câu 1: \nCâu 2: ');
    setFormFileType('word');
    setFormFileName('');
    setFormFileSize('');
    setFormFileData('');
    setFormError('');
    setIsCreatingNew(true);
  };

  // Helper to open edit modal
  const handleOpenEdit = (hw: HomeworkRecord) => {
    setEditingHw(hw);
    setFormTitle(hw.title);
    setFormSubject(hw.subject);
    setFormGrade(hw.grade);
    setFormTeacher(hw.teacher);
    setFormDeadline(hw.deadline);
    setFormDescription(hw.description);
    setFormContentUrl(hw.contentUrl || '');
    setFormQuestionsText(hw.questions.join('\n\n'));
    setFormFileType(hw.fileType || 'word');
    setFormFileName(hw.fileName || '');
    setFormFileSize(hw.fileSize || '');
    setFormFileData(hw.fileData || '');
    setFormVideoDuration(hw.videoDurationSeconds || 60);
    setFormError('');
  };

  const handleDeleteHomework = (id: string) => {
    if (window.confirm('Xác nhận xóa bài tập này?')) {
      const next = homeworkList.filter(h => h.id !== id);
      saveHomeworkList(next);
      if (selectedHw?.id === id) setSelectedHw(null);
    }
  };

  // Teacher file upload handler - Resilient with fallback
  const handleTeacherFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    let detectedType: DigitalFileType = formFileType;
    if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) detectedType = 'word';
    else if (nameLower.endsWith('.pdf')) detectedType = 'pdf';
    else if (nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx')) detectedType = 'ppt';
    else if (nameLower.match(/\.(png|jpe?g|webp|gif|svg)$/)) detectedType = 'image';
    else if (nameLower.match(/\.(mp4|webm|mov|m4v|mkv)$/)) detectedType = 'video';

    if (file.size > 25 * 1024 * 1024) {
      setFormError('Dung lượng tệp tối đa cho phép là 25MB. Bạn có thể dán đường link Google Drive ở ô bên dưới.');
      return;
    }

    setFormFileName(file.name);
    const sizeKB = Math.round(file.size / 1024);
    setFormFileSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
    setFormFileType(detectedType);

    setFormIsUploading(true);
    setFormError('');

    if (detectedType === 'video') {
      try {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = function() {
          window.URL.revokeObjectURL(videoElement.src);
          setFormVideoDuration(Math.round(videoElement.duration));
        };
        videoElement.src = URL.createObjectURL(file);
      } catch (vidErr) {
        console.warn('Video duration check skipped:', vidErr);
      }
    }

    try {
      const dataUrl = await readFileToDataUrl(file);
      setFormFileData(dataUrl);
      setFormIsUploading(false);
    } catch (err: any) {
      console.warn('Teacher file read fallback active:', err);
      try {
        const blobUrl = URL.createObjectURL(file);
        setFormFileData(blobUrl);
        setFormIsUploading(false);
      } catch (fatalErr) {
        setFormIsUploading(false);
        setFormError('Không thể đọc tệp này từ thiết bị. Bạn có thể dán link Google Drive bên dưới thay thế.');
      }
    }
  };

  // Student file upload handler - Resilient with fallback
  const handleStudentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    let detectedType: DigitalFileType = subFileType;
    if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) detectedType = 'word';
    else if (nameLower.endsWith('.pdf')) detectedType = 'pdf';
    else if (nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx')) detectedType = 'ppt';
    else if (nameLower.match(/\.(png|jpe?g|webp|gif|svg)$/)) detectedType = 'image';
    else if (nameLower.match(/\.(mp4|webm|mov|m4v|mkv)$/)) detectedType = 'video';

    if (file.size > 25 * 1024 * 1024) {
      setSubError('Dung lượng tệp tối đa cho phép là 25MB. Bạn có thể dán link Google Drive bài làm bên dưới.');
      return;
    }

    setSubFileName(file.name);
    const sizeKB = Math.round(file.size / 1024);
    setSubFileSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
    setSubFileType(detectedType);

    setSubIsUploading(true);
    setSubError('');

    if (detectedType === 'video') {
      try {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = function() {
          window.URL.revokeObjectURL(videoElement.src);
          setSubVideoDuration(Math.round(videoElement.duration));
        };
        videoElement.src = URL.createObjectURL(file);
      } catch (vidErr) {
        console.warn('Video duration check skipped:', vidErr);
      }
    }

    try {
      const dataUrl = await readFileToDataUrl(file);
      setFileData(dataUrl);
      setSubIsUploading(false);
    } catch (err: any) {
      console.warn('Student file read fallback active:', err);
      try {
        const blobUrl = URL.createObjectURL(file);
        setFileData(blobUrl);
        setSubIsUploading(false);
      } catch (fatalErr) {
        setSubIsUploading(false);
        setSubError('Không thể đọc tệp này từ thiết bị. Bạn có thể dán link Google Drive bài làm bên dưới.');
      }
    }
  };

  // Save Teacher Homework Form
  const handleSaveHomeworkForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Vui lòng nhập đầy đủ tiêu đề và hướng dẫn bài tập.');
      return;
    }

    const questionsArray = formQuestionsText
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const finalContentUrl = formContentUrl.trim() ? normalizeUrl(formContentUrl.trim()) : undefined;

    if (editingHw) {
      const updated: HomeworkRecord = {
        ...editingHw,
        title: formTitle.trim(),
        subject: formSubject,
        grade: formGrade,
        teacher: formTeacher.trim(),
        deadline: formDeadline.trim(),
        description: formDescription.trim(),
        contentUrl: finalContentUrl,
        questions: questionsArray.length > 0 ? questionsArray : ['Làm bài theo hướng dẫn của giáo viên'],
        fileType: formFileName ? formFileType : undefined,
        fileName: formFileName || undefined,
        fileSize: formFileSize || undefined,
        fileData: formFileData || undefined,
        videoDurationSeconds: formFileType === 'video' ? formVideoDuration : undefined
      };
      const next = homeworkList.map(h => h.id === updated.id ? updated : h);
      saveHomeworkList(next);
      setEditingHw(null);
      if (selectedHw?.id === updated.id) setSelectedHw(updated);
    } else {
      const newRecord: HomeworkRecord = {
        id: `hw-${Date.now()}`,
        title: formTitle.trim(),
        subject: formSubject,
        grade: formGrade,
        teacher: formTeacher.trim(),
        deadline: formDeadline.trim(),
        description: formDescription.trim(),
        contentUrl: finalContentUrl,
        questions: questionsArray.length > 0 ? questionsArray : ['Làm bài theo hướng dẫn của giáo viên'],
        fileType: formFileName ? formFileType : undefined,
        fileName: formFileName || undefined,
        fileSize: formFileSize || undefined,
        fileData: formFileData || undefined,
        videoDurationSeconds: formFileType === 'video' ? formVideoDuration : undefined,
        submissions: [],
        comments: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      saveHomeworkList([newRecord, ...homeworkList]);
      setIsCreatingNew(false);
    }
  };

  // Open Student Submission Modal
  const handleOpenSubmitModal = (hw: HomeworkRecord) => {
    if (currentUser?.role === 'guest') {
      setPermissionNotice(
        'Bạn đang đăng nhập với tư cách Khách tham quan (chỉ xem, do chưa thuộc danh sách HS trường THCS Y Đôn). Bạn chỉ được xem bài tập và hướng dẫn, không được tương tác nộp bài.'
      );
      return;
    }
    setSubmittingHw(hw);
    setSubStudentName(currentUser?.name || '');
    setSubClassName(currentUser?.className || '8A1');
    setSubNote('');
    setSubContentUrl('');
    setSubFileType('word');
    setSubFileName('');
    setSubFileSize('');
    setFileData('');
    setSubError('');
  };

  // Submit Homework Solution by Student
  const handleSaveStudentSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;

    if (!subStudentName.trim()) {
      setSubError('Vui lòng nhập họ và tên học sinh.');
      return;
    }
    if (!subFileName && !subContentUrl.trim() && !subNote.trim()) {
      setSubError('Vui lòng đính kèm tệp bài làm (Word, Ảnh, PPT, Video, PDF), hoặc dán đường link Google Drive, hoặc nhập nội dung bài giải.');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const finalSubUrl = subContentUrl.trim() ? normalizeUrl(subContentUrl.trim()) : undefined;

    const newSub: HomeworkSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      homeworkId: submittingHw.id,
      studentName: subStudentName.trim(),
      className: subClassName.trim() || '8A1',
      note: subNote.trim() || undefined,
      contentUrl: finalSubUrl,
      submittedAt: timeStr,
      fileType: subFileName ? subFileType : undefined,
      fileName: subFileName || undefined,
      fileSize: subFileSize || undefined,
      fileData: subFileData || undefined,
      videoDurationSeconds: subFileType === 'video' ? subVideoDuration : undefined
    };

    const next = homeworkList.map(h => {
      if (h.id === submittingHw.id) {
        const subs = [...(h.submissions || []), newSub];
        return { ...h, submissions: subs };
      }
      return h;
    });

    saveHomeworkList(next);

    // Update selectedHw if open
    if (selectedHw?.id === submittingHw.id) {
      setSelectedHw(prev => prev ? { ...prev, submissions: [...(prev.submissions || []), newSub] } : null);
    }

    setSubmittingHw(null);
  };

  // Teacher Grade Submission
  const handleOpenGrading = (hwId: string, submission: HomeworkSubmission) => {
    setGradingSub({ hwId, submission });
    setGradeScore(submission.score ?? 9.0);
    setGradeFeedback(submission.teacherFeedback ?? 'Bài làm rất tốt, lập luận rõ ràng!');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;

    const { hwId, submission } = gradingSub;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const next = homeworkList.map(h => {
      if (h.id === hwId) {
        const updatedSubs = (h.submissions || []).map(s => {
          if (s.id === submission.id) {
            return {
              ...s,
              score: Number(gradeScore),
              teacherFeedback: gradeFeedback.trim(),
              gradedBy: currentUser?.adminName || 'Giáo viên bộ môn',
              gradedAt: timeStr
            };
          }
          return s;
        });
        return { ...h, submissions: updatedSubs };
      }
      return h;
    });

    saveHomeworkList(next);

    if (selectedHw?.id === hwId) {
      const updatedSelected = next.find(h => h.id === hwId) || null;
      setSelectedHw(updatedSelected);
    }

    setGradingSub(null);
  };

  // Handler for adding a comment to a homework
  const handleAddComment = (hwId: string, newComment: PostComment) => {
    const next = homeworkList.map(hw => {
      if (hw.id === hwId) {
        const comments = [...(hw.comments || []), newComment];
        return { ...hw, comments };
      }
      return hw;
    });
    saveHomeworkList(next);
    if (selectedHw?.id === hwId) {
      setSelectedHw(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
    }
  };

  const filteredList = homeworkList.filter(hw => {
    if (selectedSubject !== 'all' && hw.subject !== selectedSubject) return false;
    if (selectedGrade !== 'all' && hw.grade.toString() !== selectedGrade) return false;
    return true;
  });

  const renderFileBadge = (fileType?: DigitalFileType, fileName?: string, fileSize?: string, duration?: number) => {
    if (!fileType && !fileName) return null;
    switch (fileType) {
      case 'word':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Tệp Word (.docx) {fileSize ? `• ${fileSize}` : ''}</span>
          </span>
        );
      case 'ppt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <FolderUp className="w-3 h-3 text-amber-600" />
            <span>Tệp PPT (.pptx) {fileSize ? `• ${fileSize}` : ''}</span>
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ImageIcon className="w-3 h-3 text-emerald-600" />
            <span>Ảnh bài làm {fileSize ? `• ${fileSize}` : ''}</span>
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Film className="w-3 h-3 text-purple-600" />
            <span>Video ngắn {duration ? `(${duration}s)` : ''}</span>
          </span>
        );
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <FileCode className="w-3 h-3 text-rose-600" />
            <span>Tệp PDF {fileSize ? `• ${fileSize}` : ''}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3 text-slate-600" />
            <span>Tệp đính kèm</span>
          </span>
        );
    }
  };

  return (
    <div id="homework-view" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                HỌC TẬP TỰ GIÁC • BÀI TẬP VỀ NHÀ (GV & HS)
              </span>
              <span className="text-[11px] font-bold text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                Hỗ trợ Word, Ảnh, PPT, Video ngắn, PDF
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
              BÀI TẬP VỀ NHÀ & NỘP BÀI TRỰC TUYẾN
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-normal">
              Giáo viên giao bài đính kèm tệp • Học sinh nộp bài giải trực tiếp • Thầy Cô chấm điểm & nhận xét
            </p>
          </div>
        </div>

        {/* Add Homework Button (Teacher only) */}
        <button
          onClick={handleOpenCreate}
          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 text-amber-950 font-black rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs sm:text-sm"
        >
          <PlusCircle className="w-4 h-4 text-amber-700" />
          <span>+ Đăng Bài Tập Mới (GV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Phân môn:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'physics', label: 'Vật lí' },
            { id: 'chemistry', label: 'Hóa học' },
            { id: 'biology', label: 'Sinh học' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === s.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Khối:</span>
          {['all', '6', '7', '8', '9'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả' : `K${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Homework items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-base font-bold text-slate-800">Chưa có bài tập về nhà trong danh mục này</div>
            <p className="text-xs text-slate-500">Giáo viên có thể bấm vào nút "+ Đăng Bài Tập Mới" ở trên để giao bài cho học sinh.</p>
          </div>
        ) : (
          filteredList.map((hw) => {
            const subjectLabel = hw.subject === 'physics' ? 'Vật lí' : hw.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
            const subjectColor = 
              hw.subject === 'physics' ? 'bg-blue-100 text-blue-800' :
              hw.subject === 'chemistry' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

            const commentsCount = hw.comments?.length || 0;
            const submissionsCount = hw.submissions?.length || 0;

            return (
              <div 
                key={hw.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${subjectColor}`}>
                      {subjectLabel} • Lớp {hw.grade}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <FolderUp className="w-3 h-3 text-emerald-600" />
                        {submissionsCount} bài nộp
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {commentsCount} thảo luận
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {hw.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {hw.description}
                  </p>

                  {/* Teacher attached file badge */}
                  {(hw.fileName || hw.fileType) && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {renderFileBadge(hw.fileType, hw.fileName, hw.fileSize, hw.videoDurationSeconds)}
                        <span className="text-[11px] font-semibold text-slate-700 truncate">{hw.fileName}</span>
                      </div>
                      {hw.fileData && (
                        <a
                          href={hw.fileData}
                          download={hw.fileName || 'tai_lieu_bai_tap'}
                          className="shrink-0 text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Teacher online link badge if provided */}
                  {hw.contentUrl && (
                    <a
                      href={hw.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-50/70 hover:bg-blue-100/80 rounded-xl border border-blue-200 flex items-center justify-between gap-2 text-blue-700 text-[11px] font-bold transition-colors"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">Tài liệu trực tuyến (Drive / Link)</span>
                      </span>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded shrink-0">Mở</span>
                    </a>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-slate-700">Giáo viên:</span>
                      <span>{hw.teacher}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                      <Calendar className="w-3 h-3" />
                      <span>Hạn nộp: {hw.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {/* Submit Homework Solution Button (For Students) */}
                    <button
                      type="button"
                      onClick={() => handleOpenSubmitModal(hw)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp Bài Làm</span>
                    </button>

                    {/* View Details and Comments */}
                    <button
                      type="button"
                      onClick={() => setSelectedHw(hw)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xem Bài & Thảo Luận</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <button
                        onClick={() => handleOpenEdit(hw)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Chỉnh sửa bài tập này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa đề</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHomework(hw.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Xóa bài tập này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Permission notice modal */}
      {permissionNotice && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                Quy Định Mục Bài Tập Về Nhà
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {permissionNotice}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setPermissionNotice(null);
                  onRequireLogin();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Đăng Nhập Tài Khoản Giáo Viên
              </button>
              <button
                onClick={() => setPermissionNotice(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Homework Detail / Submissions / Discussion Modal */}
      {selectedHw && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                  {selectedHw.subject === 'physics' ? 'Vật lí' : selectedHw.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} - Lớp {selectedHw.grade}
                </span>
                <h3 className="text-base sm:text-xl font-black text-slate-900 mt-1">
                  {selectedHw.title}
                </h3>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-1 flex-wrap">
                  <span>Giáo viên: <strong className="text-slate-700">{selectedHw.teacher}</strong></span>
                  <span className="text-rose-600 font-bold">Hạn nộp: {selectedHw.deadline}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedHw.submissions?.length || 0} bài nộp
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHw(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Instruction description */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1">
              <span className="font-bold text-slate-900">Hướng dẫn bài tập:</span>
              <p className="whitespace-pre-line">{selectedHw.description}</p>
            </div>

            {/* Questions list */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3 text-xs sm:text-sm text-slate-800">
              <span className="font-black block text-amber-950 uppercase text-xs tracking-wider">
                NỘI DUNG CÂU HỎI & BÀI TOÁN CẦN GIẢI:
              </span>
              {selectedHw.questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-amber-200/80 leading-relaxed font-medium">
                  {q}
                </div>
              ))}
            </div>

            {/* Teacher's Attached Assignment File */}
            {(selectedHw.fileName || selectedHw.fileData) && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Tài liệu / Đề bài đính kèm từ Giáo viên:
                  </span>
                  {renderFileBadge(selectedHw.fileType, selectedHw.fileName, selectedHw.fileSize, selectedHw.videoDurationSeconds)}
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                  <div className="text-xs font-semibold text-slate-800">
                    {selectedHw.fileName || 'Tài liệu bài tập'}
                  </div>
                  {selectedHw.fileData && (
                    <a
                      href={selectedHw.fileData}
                      download={selectedHw.fileName || 'bai_tap_dinh_kem'}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về máy</span>
                    </a>
                  )}
                </div>

                {/* Preview image if fileType is image */}
                {selectedHw.fileType === 'image' && selectedHw.fileData && (
                  <div className="pt-2">
                    <img src={selectedHw.fileData} alt="Xem trước đề bài" className="max-h-48 rounded-xl border border-blue-200 object-contain mx-auto bg-white" />
                  </div>
                )}

                {/* Preview video if fileType is video */}
                {selectedHw.fileType === 'video' && selectedHw.fileData && (
                  <div className="pt-2">
                    <video src={selectedHw.fileData} controls className="max-h-48 rounded-xl border border-blue-200 bg-black mx-auto" />
                  </div>
                )}
              </div>
            )}

            {/* Teacher's Online Resource Link (Optional) */}
            {selectedHw.contentUrl && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden text-xs">
                  <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800">Đường liên kết học liệu trực tuyến:</span>
                  <span className="text-blue-700 font-mono text-[11px] truncate">{selectedHw.contentUrl}</span>
                </div>
                <a
                  href={selectedHw.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở liên kết</span>
                </a>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-emerald-950">Gửi bài giải của bạn</h4>
                <p className="text-[11px] text-emerald-800">
                  Hỗ trợ tải lên file Word, Ảnh chụp bài giải trong vở, PPT hoặc Video ngắn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSubmitModal(selectedHw)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>+ Nộp Bài Làm Ngay</span>
              </button>
            </div>

            {/* Student Submissions List & Grading */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <FolderUp className="w-4 h-4 text-emerald-600" />
                  Danh Sách Bài Đã Nộp ({selectedHw.submissions?.length || 0})
                </h4>
                <span className="text-[11px] text-slate-500">Giáo viên chấm điểm & gửi nhận xét</span>
              </div>

              {(!selectedHw.submissions || selectedHw.submissions.length === 0) ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-200 space-y-1">
                  <p className="font-semibold">Chưa có học sinh nào nộp bài cho bài tập này.</p>
                  <p className="text-[11px] text-slate-400">Các em học sinh hãy bấm vào nút "Nộp Bài Làm Ngay" ở trên để gửi bài.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedHw.submissions.map((sub) => {
                    const isGraded = sub.score !== undefined && sub.score !== null;
                    return (
                      <div 
                        key={sub.id}
                        className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                {sub.studentName}
                              </span>
                              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Lớp {sub.className}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {sub.submittedAt}
                              </span>
                            </div>
                            {sub.note && (
                              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                                "{sub.note}"
                              </p>
                            )}
                          </div>

                          {/* Grading Status Badge & Action */}
                          <div className="flex items-center gap-2">
                            {isGraded ? (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black border border-emerald-300">
                                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                                  Điểm: {sub.score?.toFixed(1)} / 10
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Chờ chấm điểm
                              </span>
                            )}

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenGrading(selectedHw.id, sub)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" />
                                <span>{isGraded ? 'Sửa điểm' : 'Chấm bài'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Attached Submission File */}
                        {(sub.fileName || sub.fileData) && (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              {renderFileBadge(sub.fileType, sub.fileName, sub.fileSize, sub.videoDurationSeconds)}
                              <span className="text-xs font-semibold text-slate-800 truncate">{sub.fileName}</span>
                            </div>
                            {sub.fileData && (
                              <a
                                href={sub.fileData}
                                download={sub.fileName || 'bai_lam_hoc_sinh'}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                              >
                                <Download className="w-3 h-3" />
                                <span>Tải bài làm</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Student Online Link if submitted via link */}
                        {sub.contentUrl && (
                          <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden text-xs">
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-emerald-900">Liên kết bài làm:</span>
                              <span className="text-emerald-700 font-mono text-[11px] truncate">{sub.contentUrl}</span>
                            </div>
                            <a
                              href={sub.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Mở link</span>
                            </a>
                          </div>
                        )}

                        {/* Submission image preview if image */}
                        {sub.fileType === 'image' && sub.fileData && (
                          <div className="pt-1">
                            <img src={sub.fileData} alt="Bài làm" className="max-h-48 rounded-xl border border-slate-200 object-contain bg-white" />
                          </div>
                        )}

                        {/* Submission video preview if video */}
                        {sub.fileType === 'video' && sub.fileData && (
                          <div className="pt-1">
                            <video src={sub.fileData} controls className="max-h-48 rounded-xl border border-slate-200 bg-black" />
                          </div>
                        )}

                        {/* Teacher's Feedback */}
                        {isGraded && sub.teacherFeedback && (
                          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px] text-emerald-800">
                              <span>Nhận xét của {sub.gradedBy || 'Giáo viên'}:</span>
                              <span>{sub.gradedAt}</span>
                            </div>
                            <p className="leading-relaxed font-medium">{sub.teacherFeedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comments with photo upload for general questions */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Hỏi Đáp & Bình Luận Bài Tập
              </h4>
              <CommentSection
                comments={selectedHw.comments}
                currentUser={currentUser}
                targetTitle={selectedHw.title}
                onAddComment={(newCmt) => handleAddComment(selectedHw.id, newCmt)}
                onRequireLogin={onRequireLogin}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedHw(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Modal */}
      {submittingHw && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <Upload className="w-3.5 h-3.5" />
                  Nộp Bài Làm Trực Tuyến
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {submittingHw.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmission} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    value={subStudentName}
                    onChange={(e) => setSubStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subClassName}
                    onChange={(e) => setSubClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  >
                    {['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'].map(c => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú / Lời giải tóm tắt bài làm:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú câu trả lời, cách giải hoặc lời nhắn gửi Thầy/Cô..."
                  value={subNote}
                  onChange={(e) => setSubNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 resize-none leading-relaxed"
                />
              </div>

              {/* Flexible Submission Options: File OR Link OR Note (Not requiring both) */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    HÌNH THỨC NỘP BÀI (TÙY CHỌN TỆP HOẶC LINK, KHÔNG BẮT BUỘC CẢ HAI)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Tệp đính kèm HOẶC Đường link
                  </span>
                </div>

                <div className="p-2.5 bg-white/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-800 font-normal leading-relaxed">
                    Học sinh có thể <strong>chọn 1 trong 3 cách</strong>: (1) Tải tệp từ máy (Word, Ảnh chụp vở bài tập, PPT, Video, PDF); hoặc (2) Dán link Google Drive bài làm; hoặc (3) Gõ lời giải trực tiếp vào ô ghi chú. <em>Không bắt buộc phải có cả tệp và link.</em>
                  </p>
                </div>

                {/* Option 1: File types */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Cách 1: Chọn định dạng & Tải tệp từ máy:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'word', label: 'Word (.doc/.docx)', icon: FileText },
                      { id: 'image', label: 'Ảnh chụp vở (.png/.jpg)', icon: ImageIcon },
                      { id: 'ppt', label: 'PPT (.pptx)', icon: FolderUp },
                      { id: 'video', label: 'Video ngắn (1-2p)', icon: Film },
                      { id: 'pdf', label: 'Tệp PDF (.pdf)', icon: FileCode },
                    ].map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSubFileType(t.id as DigitalFileType)}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                            subFileType === t.id
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-100/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Upload button & filename badge */}
                  <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={subFileInputRef}
                        onChange={handleStudentFileChange}
                        accept=".doc,.docx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.m4v"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={subIsUploading}
                        onClick={() => subFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{subIsUploading ? 'Đang đọc tệp...' : `Chọn tệp ${subFileType.toUpperCase()} từ thiết bị`}</span>
                      </button>

                      {subFileName && (
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-300">
                          <span className="text-emerald-900 font-bold text-[11px]">
                            ✓ {subFileName} ({subFileSize})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSubFileName('');
                              setSubFileSize('');
                              setFileData('');
                              if (subFileInputRef.current) subFileInputRef.current.value = '';
                            }}
                            className="text-slate-400 hover:text-rose-600 text-[11px] font-black ml-1 cursor-pointer"
                            title="Hủy tệp"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {subFileType === 'video' && subFileName && (
                      <div className="text-[11px] text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        ⏱ Thời lượng: {subVideoDuration}s
                      </div>
                    )}
                  </div>

                  {/* Image preview */}
                  {subFileData && subFileType === 'image' && (
                    <div className="pt-2">
                      <span className="block text-[11px] font-bold text-slate-600 mb-1">Xem trước ảnh bài giải:</span>
                      <img src={subFileData} alt="Xem trước" className="max-h-36 rounded-xl border border-emerald-200 object-contain bg-white mx-auto shadow-xs" />
                    </div>
                  )}

                  {/* Video preview */}
                  {subFileData && subFileType === 'video' && (
                    <div className="pt-2">
                      <span className="block text-[11px] font-bold text-slate-600 mb-1">Xem trước video bài làm:</span>
                      <video src={subFileData} controls className="max-h-36 rounded-xl border border-emerald-200 bg-black mx-auto shadow-xs" />
                    </div>
                  )}
                </div>

                {/* Option 2: Online Link (Google Drive / Canva / YouTube) */}
                <div className="pt-2 border-t border-emerald-200 space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">
                    Cách 2: Hoặc Dán liên kết bài làm trực tuyến (Google Drive / Canva - Tùy chọn):
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="https://drive.google.com/... (Không bắt buộc nếu đã tải tệp)"
                      value={subContentUrl}
                      onChange={(e) => setSubContentUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {subError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {subError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={subIsUploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nộp Bài Làm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grading Modal */}
      {gradingSub && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Chấm Điểm & Nhận Xét
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Bài làm: {gradingSub.submission.studentName} (Lớp {gradingSub.submission.className})
                </h3>
              </div>
              <button
                onClick={() => setGradingSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Điểm số (Thang điểm 10): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={10}
                  step={0.5}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-amber-700 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lời nhận xét của Thầy/Cô: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi nhận ưu điểm, lưu ý chỗ sai hoặc hướng dẫn bổ sung kiến thức..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-amber-600 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Kết Quả Chấm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Create / Edit Modal */}
      {(isCreatingNew || !!editingHw) && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Quyền Giáo Viên / Quản Trị
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {editingHw ? 'Chỉnh Sửa Bài Tập Về Nhà' : 'Đăng Bài Tập Về Nhà Mới (Đính kèm File)'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingHw(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHomeworkForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài tập: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài tập tuần 4: Định luật Ohm và mạch mắc nối tiếp"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phân môn:
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-600"
                  >
                    <option value="physics">Vật lí</option>
                    <option value="chemistry">Hóa học</option>
                    <option value="biology">Sinh học</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Khối lớp:
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-600"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giáo viên phụ trách:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hạn nộp bài:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="Ví dụ: 20:00 - Chủ Nhật (27/09/2026)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả & Hướng dẫn:
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ghi chú kiến thức trọng tâm hoặc lưu ý khi làm bài..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 resize-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi bài tập (Mỗi câu cách nhau bởi dòng trống):
                </label>
                <textarea
                  rows={4}
                  required
                  value={formQuestionsText}
                  onChange={(e) => setFormQuestionsText(e.target.value)}
                  placeholder="Câu 1: ...&#10;&#10;Câu 2: ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 resize-none font-mono"
                />
              </div>

              {/* Teacher file attachment & online link section (Not requiring both) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                    <FileText className="w-4 h-4 text-amber-600" />
                    ĐÍNH KÈM TÀI LIỆU / ĐỀ BÀI (TÙY CHỌN TỆP HOẶC LINK, KHÔNG BẮT BUỘC CẢ HAI)
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-white px-2.5 py-0.5 rounded-full border border-amber-300">
                    Tệp đính kèm HOẶC Đường link
                  </span>
                </div>

                <div className="p-2.5 bg-white/90 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 font-normal leading-relaxed">
                    Giáo viên có thể: (1) Tải tệp từ thiết bị (Word, PPT, Ảnh, Video ngắn, PDF); hoặc (2) Dán đường link Google Drive tài liệu; hoặc (3) Chỉ cần nhập câu hỏi ở ô bên trên. <em>Không bắt buộc phải có cả tệp và link.</em>
                  </p>
                </div>

                {/* Option 1: File types */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Cách 1: Đính kèm tệp từ thiết bị:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'word', label: 'Word (.doc/.docx)', icon: FileText },
                      { id: 'image', label: 'Ảnh (.png/.jpg)', icon: ImageIcon },
                      { id: 'ppt', label: 'PPT (.pptx)', icon: FolderUp },
                      { id: 'video', label: 'Video ngắn', icon: Film },
                      { id: 'pdf', label: 'Tệp PDF (.pdf)', icon: FileCode },
                    ].map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormFileType(t.id as DigitalFileType)}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                            formFileType === t.id
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                              : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={formFileInputRef}
                        onChange={handleTeacherFileChange}
                        accept=".doc,.docx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.m4v"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={formIsUploading}
                        onClick={() => formFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formIsUploading ? 'Đang đọc tệp...' : `Chọn tệp ${formFileType.toUpperCase()} từ máy`}</span>
                      </button>

                      {formFileName && (
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-amber-300">
                          <span className="text-amber-900 font-bold text-[11px]">
                            ✓ {formFileName} ({formFileSize})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormFileName('');
                              setFormFileSize('');
                              setFormFileData('');
                              if (formFileInputRef.current) formFileInputRef.current.value = '';
                            }}
                            className="text-slate-400 hover:text-rose-600 text-[11px] font-black ml-1 cursor-pointer"
                            title="Hủy tệp"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Image */}
                  {formFileData && formFileType === 'image' && (
                    <div className="pt-1">
                      <img src={formFileData} alt="Xem trước" className="max-h-36 rounded-xl border border-amber-200 object-contain bg-white mx-auto shadow-xs" />
                    </div>
                  )}

                  {/* Preview Video */}
                  {formFileData && formFileType === 'video' && (
                    <div className="pt-1">
                      <video src={formFileData} controls className="max-h-36 rounded-xl border border-amber-200 bg-black mx-auto shadow-xs" />
                    </div>
                  )}
                </div>

                {/* Option 2: Online link (Google Drive / Canva / YouTube) */}
                <div className="pt-2 border-t border-amber-200 space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">
                    Cách 2: Hoặc Dán liên kết tài liệu trực tuyến (Google Drive / Canva / Youtube - Tùy chọn):
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="https://drive.google.com/... (Không bắt buộc nếu đã tải tệp)"
                      value={formContentUrl}
                      onChange={(e) => setFormContentUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingHw(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formIsUploading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingHw ? 'Lưu Cập Nhật' : 'Đăng Bài Tập'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
