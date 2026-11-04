export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';

export interface FileAttachment {
  id: string;
  name: string;
  type: 'word' | 'image' | 'pdf' | 'excel' | 'other';
  mimeType: string;
  dataUrl: string;
  sizeLabel?: string;
  extractedText?: string;
  extractedHtml?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  school?: string;
  grade?: string;
  enrolledClass?: string;
  studentCode?: string;
  isOfficial?: boolean; // true = học sinh chính thức trong danh sách giáo viên, false = khách chỉ xem
  status?: 'active' | 'pending' | 'locked' | 'guest';
  createdAt?: string;
  mustChangePassword?: boolean;
}

export interface StudentRecord {
  id?: string;
  studentCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  school: string;
  grade: string; // 6, 7, 8, 9, Bồi dưỡng HSG cấp tỉnh, thành phố
  enrolledClass: string; // H6.1, H6.2, etc.
  status: 'studying' | 'paused' | 'left';
  notes?: string;
  // Theo dõi lộ trình học tập
  roadmapStage?: string;
  roadmapProgress?: number;
  roadmapNote?: string;
  // Theo dõi đóng học phí theo 12 tháng: Th06, Th 07, Th08, Th09, Th10, Th11, Th12, Th01, Th02, Th03, Th04, Th05 ('X' | 'Ch')
  monthlyTuition?: Record<string, 'X' | 'Ch'>;
  // Theo dõi đóng học phí đồng bộ trực tiếp vào danh sách học sinh
  tuitionStatus?: 'paid' | 'unpaid' | 'partial';
  tuitionMonth?: string;
  tuitionAmount?: number;
  tuitionPaidDate?: string;
  tuitionPaymentMethod?: string;
  tuitionBankName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChemistryClass {
  id: string;
  name: string; // H6.1, H6.2, H6.3, H7.1, H7.2, H7.3, H8.1, H8.2, H8.3, H9.1, H9.2, H9.3, BD HSG cấp tỉnh, thành phố
  description: string;
  grade: string;
  teacher: string;
  schedule: string;
  room?: string;
  studentCount?: number;
}

export interface TuitionRecord {
  id?: string;
  studentId?: string;
  studentName: string;
  classGroup: string;
  month: string; // MM/YYYY
  amountDue: number;
  amountPaid: number;
  bankName?: string;
  status: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
  paymentMethod?: string; // Tiền mặt, Chuyển khoản
  notes?: string;
  confirmedBy?: string;
  receiptAttachment?: FileAttachment;
  updatedAt?: string;
}

export interface ScheduleItem {
  id?: string;
  title: string;
  classGroup: string;
  semester: string;
  fileUrl?: string;
  fileType?: 'image' | 'pdf' | 'word' | 'excel' | 'text';
  notes?: string;
  updatedAt?: string;
}

export interface AnnouncementItem {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  attachments?: FileAttachment[];
  targetClasses: string; // All or specific classes
  isPinned?: boolean;
  authorName: string;
  createdAt: string;
}

export interface AnnouncementComment {
  id?: string;
  announcementId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorClass?: string;
  content: string;
  attachments?: FileAttachment[];
  createdAt: string;
  isHidden?: boolean;
}

export interface HomeworkItem {
  id?: string;
  title: string;
  description: string;
  classGroup: string;
  assignedDate: string;
  dueDate: string;
  fileUrl?: string;
  fileName?: string;
  attachments?: FileAttachment[];
  maxScore?: number;
  createdAt?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentCode?: string;
  studentName: string;
  classGroup: string;
  contentNote: string;
  attachments: FileAttachment[];
  submittedAt: string;
  status: 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
  teacherFeedback?: string;
  gradedAt?: string;
}

export interface QuizQuestionMultipleChoice {
  id: number | string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}

export interface QuizQuestionTrueFalseStatement {
  label: string; // a, b, c, d
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionTrueFalse {
  id: number | string;
  scenario: string;
  statements: QuizQuestionTrueFalseStatement[];
  explanation?: string;
}

export interface QuizQuestionBlank {
  index: number;
  answer: string;
  unit?: string;
}

export interface QuizQuestionFillInBlank {
  id: number | string;
  text: string;
  blanks: QuizQuestionBlank[];
  explanation?: string;
}

export interface QuizQuestionEssay {
  id: number | string;
  question: string;
  solutionGuide: string;
  points?: number;
}

export interface QuizItem {
  id?: string;
  title: string;
  grade: string;
  topic: string;
  chapter?: string;
  durationMinutes: number;
  totalPoints: number;
  status: 'draft' | 'published' | 'closed';
  targetClasses: string;
  openTime?: string;
  closeTime?: string;
  isTimeRestricted?: boolean;
  multipleChoice: QuizQuestionMultipleChoice[];
  trueFalse: QuizQuestionTrueFalse[];
  fillInBlank: QuizQuestionFillInBlank[];
  essay: QuizQuestionEssay[];
  attachments?: FileAttachment[];
  createdAt: string;
}

export interface QuizSubmission {
  id?: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentCode?: string;
  studentName: string;
  classGroup: string;
  score: number;
  objectiveScore?: number;
  essayScore?: number;
  maxScore: number;
  multipleChoiceAnswers: Record<string, number>;
  trueFalseAnswers: Record<string, Record<string, boolean>>;
  fillInBlankAnswers: Record<string, Record<number, string>>;
  essayAnswers?: Record<string, string>;
  attachments?: FileAttachment[];
  submittedAt: string;
  feedback?: string;
  essayGraded?: boolean;
  status?: 'submitted' | 'graded';
}

export interface ExamResultRecord {
  id: string;
  studentCode: string;
  studentName: string;
  classGroup: string;
  examName: string;
  examType?: 'Kỳ thi / Khảo sát' | 'Bài tập tương tác' | 'Bài tập về nhà' | 'Chấm phiếu OMR';
  score: number;
  maxScore?: number;
  rank?: number;
  evaluated: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Cần cố gắng';
  feedback: string;
  gradedDate?: string;
  submissionId?: string;
}

export interface MaterialItem {
  id?: string;
  title: string;
  grade: string;
  category: string;
  fileUrl: string;
  fileType?: string;
  attachments?: FileAttachment[];
  description?: string;
  author?: string;
  downloadCount?: number;
  uploadDate?: string;
}

export interface VideoExperimentItem {
  id?: string;
  title: string;
  grade: string;
  category: string;
  videoUrl: string; // YouTube or direct video URL
  description: string;
  chemicalEquation: string;
  safetyNotes: string;
  attachments?: FileAttachment[];
  author?: string;
  createdAt?: string;
}

export interface MediaActivityEntry {
  userName: string;
  userClass?: string;
  userRole?: string;
  timestamp: string;
}

export interface MediaActivityLog {
  targetId: string;
  views: MediaActivityEntry[];
  downloads: MediaActivityEntry[];
  writes?: MediaActivityEntry[];
}

export interface YoutubeLessonLink {
  id: string;
  title: string;
  url: string;
  grade?: string;
  createdAt?: string;
}

export interface YoutubePostItem {
  id: string;
  title: string;
  content: string;
  grade: string;
  videoUrl?: string;
  lessonLinks: YoutubeLessonLink[];
  attachments?: FileAttachment[];
  author: string;
  createdAt: string;
}

export interface YoutubeChannelData {
  mainChannelName: string;
  mainChannelUrl: string;
  mainChannelDescription: string;
  globalLessonLinks: YoutubeLessonLink[];
  posts: YoutubePostItem[];
}

export interface OnlineMeetingLink {
  id: string;
  label: string;
  url: string;
  roomCode?: string;
  passcode?: string;
}

export interface OnlineClassSessionItem {
  id: string;
  title: string;
  classGroup: string;
  openTimeText: string;
  announcementContent: string;
  primaryMeetingUrl: string;
  roomCode?: string;
  passcode?: string;
  meetingLinks: OnlineMeetingLink[];
  attachments?: FileAttachment[];
  status: 'open' | 'scheduled' | 'closed';
  author: string;
  createdAt: string;
}

export interface LeaveRequestItem {
  id?: string;
  studentId?: string;
  studentName: string;
  classGroup: string;
  reason: string;
  dateFrom: string;
  dateTo: string;
  parentPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
}

export interface RegistrationItem {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  school: string;
  currentGrade: string;
  desiredClass: string;
  note?: string;
  status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
  createdAt: string;
}

export interface OmrScanItem {
  id?: string;
  title: string;
  classGroup: string;
  studentName: string;
  imageUrl?: string;
  score: number;
  totalQuestions: number;
  detectedAnswers: Record<string, string>;
  scannedAt: string;
}

export interface AppSettings {
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBgColor: string;
  bannerImageUrl: string;
  logoUrl: string;
  logoSize?: number;
  logoShape?: 'original' | 'circle' | 'rounded';
  tickerText: string;
  tickerEnabled: boolean;
  phone: string;
  email: string;
  address: string;
  teacherName: string;
  teacherTitle: string;
  // Cấu hình đóng học phí online (QR & Tài khoản ngân hàng)
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankBranch?: string;
  tuitionQrUrl?: string;
  defaultTuitionAmount?: number;
  tuitionPaymentNote?: string;
  customDomainUrl?: string;
}
