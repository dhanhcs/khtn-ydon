export type SubjectType = 'all' | 'physics' | 'chemistry' | 'biology';
export type GradeLevel = 6 | 7 | 8 | 9;

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, 3
  explanation?: string;
}

export interface TrueFalseStatement {
  subId: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  question: string; // Tình huống / đoạn văn bản dẫn
  statements: [TrueFalseStatement, TrueFalseStatement, TrueFalseStatement, TrueFalseStatement];
  explanation?: string;
}

export interface ShortAnswerQuestion {
  id: string;
  type: 'short_answer';
  question: string;
  acceptableAnswers: string[]; // Chấp nhận các dạng nhập tương đương
  unit?: string;
  explanation?: string;
}

export type ExamQuestion = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface Exam {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: GradeLevel;
  testNumber?: 'TX1' | 'TX2' | 'TX3' | 'TX4';
  durationMinutes: number; // Thường là 15 phút KTTX
  totalPoints: number; // 10.0 điểm
  mode: 'mode_1' | 'mode_2'; // Chế độ 1: Mọi lúc (làm lúc nào cũng được) | Chế độ 2: Ấn định ngày mở (đặt ngày, tháng, năm, giờ, phút, giây)
  openAt?: string; // Định dạng thời gian bắt đầu mở đề: YYYY-MM-DDTHH:mm:ss
  openTime?: string; // Tương thích ngược
  closeTime?: string;
  password?: string; // Không còn dùng mật khẩu
  isActive: boolean;
  questions: ExamQuestion[]; // 16 MCQs + 1 TF (4 items) + 1 SA = 18 câu
  createdAt: string;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: GradeLevel;
  studentName: string;
  className: string;
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
  mcqScore: number; // max 8.0 (16 * 0.5)
  tfScore: number; // max 1.0 (1 ý: 0.1, 2 ý: 0.25, 3 ý: 0.5, 4 ý: 1.0)
  saScore: number; // max 1.0
  totalScore: number; // max 10.0
  answers: {
    mcq: Record<string, number>; // questionId -> selectedOption (0..3)
    tf: Record<string, Record<string, boolean>>; // questionId -> { a: true, b: false... }
    sa: Record<string, string>; // questionId -> text
  };
  shuffledQuestions?: ExamQuestion[]; // Snapshot of shuffled questions for this specific attempt
  violationsCount?: number;
  penaltyApplied?: 'none' | 'warning' | 'minus_50_percent' | 'locked_zero';
  isLockedForCheating?: boolean;
}

export interface StudentRecord {
  id: string;
  name: string;
  className: string;
  grade: GradeLevel;
  gender: 'Nam' | 'Nữ';
  dob?: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorRole: 'student' | 'admin' | 'guest';
  authorClass?: string;
  authorSubject?: 'physics' | 'chemistry' | 'biology';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface DigitalProductGrading {
  score: number; // 0.0 - 10.0
  feedback: string;
  gradedBy: string; // Tên Thầy/Cô
  teacherSubject: 'physics' | 'chemistry' | 'biology';
  gradedAt: string;
}

export type DigitalFileType = 'word' | 'pdf' | 'ppt' | 'image' | 'video' | 'link';

export interface LearningResource {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: GradeLevel;
  category: 'study_corner' | 'homework' | 'prep_guide' | 'digital_products' | 'digital_tools' | 'hsg_prep';
  description: string;
  contentUrl?: string;
  documentContent?: string;
  attachments?: string[];
  date: string;
  // Author & role
  authorName?: string;
  authorRole?: 'student' | 'admin';
  authorClass?: string;
  // Specific for digital_products
  fileType?: DigitalFileType;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 data URL for preview/download
  videoDurationSeconds?: number;
  // Grading by subject admin
  grading?: DigitalProductGrading;
  // Comments with image support
  comments?: PostComment[];
}

export interface ExemplaryPost {
  id: string;
  studentName: string;
  className: string;
  grade: GradeLevel;
  title: string;
  achievement: string;
  content: string;
  imageUrl?: string;
  date: string;
  author: string;
  category: 'olympic' | 'khkt' | 'good_student' | 'progress';
  comments?: PostComment[];
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentName: string;
  className: string;
  note?: string;
  submittedAt: string;
  contentUrl?: string; // Optional Google Drive / Cloud link
  fileType?: DigitalFileType;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 data
  videoDurationSeconds?: number;
  score?: number;
  teacherFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface HomeworkRecord {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: GradeLevel;
  teacher: string;
  deadline: string;
  description: string;
  contentUrl?: string; // Optional Google Drive / Cloud link
  questions: string[];
  comments?: PostComment[];
  createdAt: string;
  // Attached file by teacher (Word, PDF, PPT, Image, Video)
  fileType?: DigitalFileType;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  videoDurationSeconds?: number;
  // Student submissions
  submissions?: HomeworkSubmission[];
}

export interface UserSession {
  id: string;
  role: 'guest' | 'student' | 'admin';
  name: string;
  email?: string;
  grade?: GradeLevel;
  className?: string;
  adminName?: string;
  adminSubject?: 'physics' | 'chemistry' | 'biology' | 'all';
}

export interface SystemConfig {
  appName: string;
  schoolName: string;
  department: string;
  address: string;
  leadTeacher: string;
  teachingTeam: string[];
  schoolYear: string;
  bannerTitle: string;
  bannerSubtitle: string;
  logoUrl?: string;
}

