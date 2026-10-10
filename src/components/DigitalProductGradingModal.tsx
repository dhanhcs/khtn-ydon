import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { DigitalProductGrading, LearningResource, UserSession } from '../types';

interface DigitalProductGradingModalProps {
  resource: LearningResource;
  isOpen: boolean;
  currentUser: UserSession | null;
  onClose: () => void;
  onSaveGrading: (resourceId: string, grading: DigitalProductGrading) => void;
}

export function DigitalProductGradingModal({
  resource,
  isOpen,
  currentUser,
  onClose,
  onSaveGrading
}: DigitalProductGradingModalProps) {
  const existingGrading = resource.grading;

  const [score, setScore] = useState<number>(existingGrading?.score ?? 9.0);
  const [feedback, setFeedback] = useState<string>(
    existingGrading?.feedback ?? 'Sản phẩm số có tính ứng dụng cao, trình bày khoa học, hình ảnh và dữ liệu trực quan rõ ràng. Khuyến khích tiếp tục phát triển!'
  );
  
  // Determine default grading teacher name
  const defaultTeacherName = currentUser?.adminName || currentUser?.name || (
    resource.subject === 'physics' ? 'Thầy Nguyễn Đình Hành' :
    resource.subject === 'chemistry' ? 'Cô Nguyễn Thị Cẩm Lệ' :
    'Cô Đặng Thị Xuân Sang'
  );

  const [gradedBy, setGradedBy] = useState<string>(existingGrading?.gradedBy || defaultTeacherName);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Check matching subject permission
  const userAdminSubject = currentUser?.adminSubject;
  const isCorrectSubjectAdmin = !userAdminSubject || userAdminSubject === 'all' || userAdminSubject === resource.subject;

  const subjectLabel = resource.subject === 'physics' ? 'Vật lí' : resource.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 0 || score > 10) {
      setErrorMsg('Điểm số phải nằm trong khoảng từ 0.0 đến 10.0.');
      return;
    }
    if (!feedback.trim()) {
      setErrorMsg('Vui lòng nhập nhận xét và đánh giá cho sản phẩm số.');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const gradingData: DigitalProductGrading = {
      score: Number(score.toFixed(1)),
      feedback: feedback.trim(),
      gradedBy: gradedBy.trim() || defaultTeacherName,
      teacherSubject: resource.subject,
      gradedAt: timeStr
    };

    onSaveGrading(resource.id, gradingData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Chấm Điểm Sản Phẩm Số • Phân môn {subjectLabel}
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {resource.title}
            </h3>
            <div className="text-xs text-slate-500">
              Tác giả: <strong className="text-slate-800">{resource.authorName || 'Học sinh'}</strong> {resource.authorClass ? `(Lớp ${resource.authorClass})` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice if not correct admin */}
        {!isAdmin ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Quyền quản trị phân môn
            </div>
            <p>
              Chỉ Quản trị viên phụ trách phân môn <strong>{subjectLabel}</strong> mới có quyền lưu điểm và nhận xét cho sản phẩm số này. Vui lòng đăng nhập tài khoản Giáo viên bộ môn.
            </p>
          </div>
        ) : !isCorrectSubjectAdmin ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Lưu ý phân công bộ môn
            </div>
            <p>
              Tài khoản hiện tại của Thầy/Cô phụ trách phân môn khác ({userAdminSubject === 'physics' ? 'Vật lí' : userAdminSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'}). 
              Tuy nhiên với vai trò Giáo viên / Quản trị trong Tổ Lí-Hóa-Sinh-CN, Thầy/Cô vẫn có thể chấm duyệt nếu được phân công.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Xác thực: <strong>{currentUser?.adminName || currentUser?.name}</strong> - Quản trị phân môn <strong>{subjectLabel}</strong>.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Điểm số */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Điểm đánh giá (Thang điểm 10.0):
              </label>
              <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {score.toFixed(1)} / 10.0
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                step="0.25"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>0 (Chưa đạt)</span>
              <span>5.0 (Trung bình)</span>
              <span>7.0 (Khá)</span>
              <span>8.5 (Giỏi)</span>
              <span>10.0 (Xuất sắc)</span>
            </div>
          </div>

          {/* Nhận xét của Quản trị phân môn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lời nhận xét & góp ý của Giáo viên quản trị phân môn:
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhận xét chi tiết về nội dung khoa học, tính sáng tạo, hình thức thể hiện, khả năng ứng dụng và hướng hoàn thiện..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 leading-relaxed resize-none font-medium"
            />
          </div>

          {/* Người chấm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Giáo viên chấm bài:
              </label>
              <input
                type="text"
                required
                value={gradedBy}
                onChange={(e) => setGradedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Phân môn quản trị:
              </label>
              <input
                type="text"
                readOnly
                value={`Bộ môn ${subjectLabel} - Tổ Lí-Hóa-Sinh-CN`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Điểm & Nhận Xét</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
