import { UserSession } from '../types';

/**
 * Kiểm tra xem người dùng hiện tại có phải là Giáo viên Quản trị (Admin) hay không.
 * 
 * QUY ĐỊNH PHÂN QUYỀN BẮT BUỘC THEO YÊU CẦU:
 * - Các Tính năng: tải bảng điểm kiểm tra, up bảng điểm, thiết kế đề kiểm tra,
 *   chỉnh sửa đề, xóa đề, trộn đề, chấm bài CHỈ LÀ QUYỀN CỦA GIÁO VIÊN QUẢN TRỊ.
 * - Tất cả các học sinh, khách, tổ trưởng Trần Thị Phượng ĐỀU KHÔNG CÓ QUYỀN NÀY.
 * - Tóm lại, những quyền thuộc quản trị thì CHỈ HIỂN THỊ VÀ CẤP QUYỀN VỚI ADMIN (Giáo viên quản trị).
 * 
 * Giáo viên Quản trị chính thức:
 * 1. Thầy Nguyễn Đình Hành (Phân môn Vật lí)
 * 2. Thầy Phạm Ngọc Tiến (Phân môn Vật lí)
 * 3. Cô Nguyễn Thị Cẩm Lệ (Phân môn Hóa học)
 * 4. Cô Đặng Thị Xuân Sang (Phân môn Sinh học)
 * 
 * Tổ trưởng chuyên môn: TT Trần Thị Phượng (không có các quyền quản trị trên)
 */
export function isTeacherAdmin(user: UserSession | null | undefined): boolean {
  if (!user) return false;
  
  // Học sinh và khách tuyệt đối không có quyền
  if (user.role === 'student' || user.role === 'guest') {
    return false;
  }

  // Nếu cờ isTeacherAdmin được đặt là false
  if (user.isTeacherAdmin === false) {
    return false;
  }

  // Tổ trưởng Trần Thị Phượng tuyệt đối không có quyền quản trị này
  const name = (user.name || '').toLowerCase();
  const adminName = (user.adminName || '').toLowerCase();
  if (name.includes('phượng') || name.includes('phuong') || 
      adminName.includes('phượng') || adminName.includes('phuong')) {
    return false;
  }

  // Phải có vai trò admin
  return user.role === 'admin';
}
