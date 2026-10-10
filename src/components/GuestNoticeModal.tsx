import React from 'react';
import { ShieldAlert, UserCheck, FileSpreadsheet, Eye, X } from 'lucide-react';
import { StudentRecord } from '../types';

interface GuestNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  guestClass: string;
  onOpenAdminRoster?: () => void;
}

export function GuestNoticeModal({
  isOpen,
  onClose,
  guestName,
  guestClass,
  onOpenAdminRoster
}: GuestNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-amber-100" />
            </div>
            <div>
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Quy Chế Tham Chiếu Học Sinh
              </span>
              <h3 className="text-base sm:text-lg font-black leading-snug mt-0.5">
                Chế Độ Khách Tham Quan (Chỉ Xem)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-950">
            <p>
              Tài khoản / Họ tên: <strong className="text-slate-900 font-bold">{guestName || 'Khách'}</strong>
              {guestClass && <> — Lớp dự kiến: <strong className="text-slate-900 font-bold">{guestClass}</strong></>}
            </p>
            <p className="text-[11px] text-amber-800">
              Hệ thống đã đối soát với <strong>Danh sách học sinh toàn trường THCS Y Đôn</strong> (được nạp từ tệp Excel chuẩn) và chưa tìm thấy thông tin của bạn.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4 text-blue-600" />
              Quyền hạn của Khách:
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Được xem:</strong> Tự do xem đề kiểm tra, ma trận kiến thức, góc học tập, bài giảng và sản phẩm số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Không tương tác:</strong> Không được vào phòng thi làm bài, không gửi bài thi, không nộp bài tập về nhà và không chấm điểm vào bảng điểm chính thức của trường.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Nếu em là học sinh chính thức của trường THCS Y Đôn nhưng bị nhận diện là khách, vui lòng liên hệ Thầy/Cô bộ môn KHTN hoặc Quản trị viên để cập nhật danh sách qua tệp Excel tham chiếu.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đã hiểu & Tiếp tục xem
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
