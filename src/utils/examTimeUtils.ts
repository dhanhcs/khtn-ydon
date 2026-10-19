import { Exam } from '../types';

export interface ExamScheduleStatus {
  status: 'upcoming' | 'open' | 'expired';
  isOpen: boolean;
  isExpired: boolean;
  isUpcoming: boolean;
  openTimeMs: number;
  closeTimeMs: number;
  openTimeFormatted: string;
  closeTimeFormatted: string;
  badgeLabel: string;
  message: string;
  remainingMinutes?: number;
}

/**
 * Định dạng thời gian dạng dd/mm/yyyy hh:mm:ss chuẩn tiếng Việt
 */
export function formatDateTimeVi(dateOrIso: string | number | Date): string {
  try {
    const d = new Date(dateOrIso);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${hh}:${min}:${ss} ngày ${dd}/${mm}/${yyyy}`;
    }
  } catch {}
  return String(dateOrIso);
}

/**
 * Kiểm tra trạng thái thời gian mở/đóng/hết giờ của đề kiểm tra
 * - Chưa đến giờ: Date.now() < openTime
 * - Đang mở thi: openTime <= Date.now() <= closeTime
 * - Đã hết giờ (đóng đề thi): Date.now() > closeTime
 */
export function getExamScheduleStatus(exam: Exam): ExamScheduleStatus {
  if (!exam.isActive) {
    return {
      status: 'expired',
      isOpen: false,
      isExpired: true,
      isUpcoming: false,
      openTimeMs: 0,
      closeTimeMs: 0,
      openTimeFormatted: 'Đang khóa',
      closeTimeFormatted: 'Đang khóa',
      badgeLabel: 'Tạm khóa',
      message: 'Đề kiểm tra hiện đang tạm khóa bởi Quản trị viên.'
    };
  }

  // Chế độ 1: Tự do (Nếu còn sót)
  if (exam.mode === 'mode_1') {
    return {
      status: 'open',
      isOpen: true,
      isExpired: false,
      isUpcoming: false,
      openTimeMs: 0,
      closeTimeMs: Infinity,
      openTimeFormatted: 'Mọi lúc',
      closeTimeFormatted: 'Mọi lúc',
      badgeLabel: 'Mọi lúc',
      message: 'Học sinh có thể làm bài tự do mọi lúc.'
    };
  }

  const openStr = exam.openAt || exam.openTime;
  const duration = exam.durationMinutes || 15;

  const openTimeMs = openStr ? new Date(openStr).getTime() : Date.now();

  // Thời gian đóng đề thi: Nếu có closeAt/closeTime thì dùng, nếu không mặc định = openTime + durationMinutes
  let closeTimeMs: number;
  if (exam.closeAt || exam.closeTime) {
    closeTimeMs = new Date(exam.closeAt || exam.closeTime!).getTime();
  } else {
    closeTimeMs = openTimeMs + duration * 60 * 1000;
  }

  const now = Date.now();
  const openTimeFormatted = formatDateTimeVi(openTimeMs);
  const closeTimeFormatted = formatDateTimeVi(closeTimeMs);

  // 1. Chưa đến thời gian mở đề
  if (now < openTimeMs) {
    return {
      status: 'upcoming',
      isOpen: false,
      isExpired: false,
      isUpcoming: true,
      openTimeMs,
      closeTimeMs,
      openTimeFormatted,
      closeTimeFormatted,
      badgeLabel: 'Chưa đến giờ',
      message: `Chưa đến thời gian mở đề! Đề kiểm tra bắt đầu lúc ${openTimeFormatted}. Vui lòng quay lại đúng giờ.`
    };
  }

  // 2. Sau khi hết giờ: Hệ thống tự động đóng chế độ mở và báo cáo hết giờ
  if (now > closeTimeMs) {
    return {
      status: 'expired',
      isOpen: false,
      isExpired: true,
      isUpcoming: false,
      openTimeMs,
      closeTimeMs,
      openTimeFormatted,
      closeTimeFormatted,
      badgeLabel: 'Đã hết giờ',
      message: `BÁO CÁO HẾT GIỜ: Đề kiểm tra này đã kết thúc thời gian làm bài (hết giờ lúc ${closeTimeFormatted}). Học sinh không được phép vào thi sau khi đã hết giờ.`
    };
  }

  // 3. Đang trong thời gian mở đề
  const remainingMinutes = Math.max(1, Math.ceil((closeTimeMs - now) / 60000));
  return {
    status: 'open',
    isOpen: true,
    isExpired: false,
    isUpcoming: false,
    openTimeMs,
    closeTimeMs,
    openTimeFormatted,
    closeTimeFormatted,
    remainingMinutes,
    badgeLabel: 'Đang mở thi',
    message: `Đang mở làm bài! Thời gian kết thúc lúc ${closeTimeFormatted} (còn khoảng ${remainingMinutes} phút).`
  };
}

/**
 * Giáo viên mở lại đề kiểm tra khi cần thiết (Gia hạn thời gian mở đề)
 */
export function reopenExamWithDuration(exam: Exam, additionalMinutes: number = 15): Exam {
  const now = Date.now();
  const newOpenAt = new Date(now).toISOString();
  const newCloseAt = new Date(now + additionalMinutes * 60 * 1000).toISOString();

  return {
    ...exam,
    mode: 'mode_2',
    openAt: newOpenAt,
    openTime: newOpenAt,
    closeAt: newCloseAt,
    closeTime: newCloseAt,
    isActive: true
  };
}
