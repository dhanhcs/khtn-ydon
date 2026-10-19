import { StudentSubmission } from '../types';

export type CupType = 'gold' | 'silver' | 'bronze' | null;

export interface CupAward {
  cup: CupType;
  title: string;
  badge: string;
  colorClass: string;
  bgGradient: string;
  borderClass: string;
  icon: string;
  rank: number;
  description: string;
}

/**
 * Xác định Cúp vàng, bạc, đồng vinh danh cho học sinh sau bài kiểm tra TX
 * Tiêu chí kết hợp: Xếp hạng trong bài thi (Top 1, Top 2, Top 3) và Điểm số đạt được
 */
export function calculateExamCup(
  submission: StudentSubmission,
  allSubmissionsForExam: StudentSubmission[] = []
): CupAward {
  const sameExamSubs = allSubmissionsForExam.filter(s => s.examId === submission.examId);
  
  // Sort descending by totalScore, then ascending by timeSpentSeconds
  const sorted = (sameExamSubs.length > 0 ? [...sameExamSubs] : [submission]).sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });

  const rank = Math.max(1, sorted.findIndex(s => s.id === submission.id) + 1);
  const score = submission.totalScore;

  // Top 1 hoặc điểm tuyệt đối >= 9.5
  if ((rank === 1 && score >= 8.0) || score >= 9.5) {
    return {
      cup: 'gold',
      title: 'CÚP VÀNG VINH DANH',
      badge: 'Cúp Vàng 🏆',
      icon: '🏆',
      colorClass: 'text-amber-800',
      bgGradient: 'from-amber-400 via-yellow-400 to-amber-500',
      borderClass: 'border-amber-400 ring-2 ring-amber-300',
      rank,
      description: 'Xuất sắc dẫn đầu bài kiểm tra thường xuyên! Thành tích nổi bật môn Khoa học Tự nhiên.'
    };
  }

  // Top 2 hoặc điểm giỏi >= 8.5
  if ((rank === 2 && score >= 7.5) || (score >= 8.5 && score < 9.5)) {
    return {
      cup: 'silver',
      title: 'CÚP BẠC VINH DANH',
      badge: 'Cúp Bạc 🥈',
      icon: '🥈',
      colorClass: 'text-slate-800',
      bgGradient: 'from-slate-200 via-slate-100 to-slate-300',
      borderClass: 'border-slate-300 ring-2 ring-slate-200',
      rank,
      description: 'Thành tích xuất sắc! Giữ vững phong độ học tập tốt môn Khoa học Tự nhiên.'
    };
  }

  // Top 3 hoặc điểm khá giỏi >= 7.5
  if ((rank === 3 && score >= 7.0) || (score >= 7.5 && score < 8.5)) {
    return {
      cup: 'bronze',
      title: 'CÚP ĐỒNG VINH DANH',
      badge: 'Cúp Đồng 🥉',
      icon: '🥉',
      colorClass: 'text-amber-900',
      bgGradient: 'from-amber-200 via-orange-100 to-amber-300',
      borderClass: 'border-amber-500/50 ring-1 ring-amber-400',
      rank,
      description: 'Kết quả tốt! Tiếp tục phát huy trong các đợt kiểm tra tiếp theo.'
    };
  }

  return {
    cup: null,
    title: 'HOÀN THÀNH BÀI THI',
    badge: 'Đã hoàn thành',
    icon: '🎖️',
    colorClass: 'text-blue-800',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderClass: 'border-blue-200',
    rank,
    description: 'Đã hoàn thành bài kiểm tra. Hãy ôn tập kỹ hơn các câu sai để bứt phá đạt Cúp trong bài tới!'
  };
}
