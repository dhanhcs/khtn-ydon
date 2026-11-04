import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarOff, PlusCircle, CheckCircle, XCircle, Clock, AlertCircle, Phone, X, Send } from 'lucide-react';
import { LeaveRequestItem } from '../../types';

export const SAMPLE_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: 'lr-1',
    studentName: 'Nguyễn Văn An',
    classGroup: 'H8.1',
    reason: 'Em bị sốt và đau họng cần đi khám bệnh tại bệnh viện, em xin phép Thầy nghỉ buổi học Hóa chiều thứ Hai ngày 13/10.',
    dateFrom: '13/10/2026',
    dateTo: '13/10/2026',
    parentPhone: '0912 345 678',
    status: 'approved',
    adminNote: 'Thầy đã nhận đơn. Em nhớ giữ gìn sức khỏe và mượn vở bạn ghi chép lại phần cân bằng phương trình nhé.',
    createdAt: '12/10/2026 18:30',
  },
  {
    id: 'lr-2',
    studentName: 'Lê Hoàng Nam',
    classGroup: 'H8.2',
    reason: 'Gia đình em có việc bận về quê thăm ông bà vào cuối tuần, xin phép Thầy cho em nghỉ học buổi chiều thứ Bảy.',
    dateFrom: '18/10/2026',
    dateTo: '18/10/2026',
    parentPhone: '0987 654 321',
    status: 'pending',
    createdAt: '15/10/2026 09:15',
  },
];

export const LeaveRequestsPage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { isAdmin, userProfile } = useAuth();

  const [requests, setRequests] = useState<LeaveRequestItem[]>(() => {
    const saved = localStorage.getItem('ndh_leave_requests');
    return saved ? JSON.parse(saved) : SAMPLE_LEAVE_REQUESTS;
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentName: userProfile?.fullName || '',
    classGroup: userProfile?.enrolledClass || 'H8.1',
    reason: '',
    dateFrom: '',
    dateTo: '',
    parentPhone: '',
  });

  useEffect(() => {
    localStorage.setItem('ndh_leave_requests', JSON.stringify(requests));
  }, [requests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.reason || !form.dateFrom || !form.parentPhone) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    const newItem: LeaveRequestItem = {
      id: 'lr-' + Date.now(),
      studentName: form.studentName.trim(),
      classGroup: form.classGroup,
      reason: form.reason.trim(),
      dateFrom: form.dateFrom,
      dateTo: form.dateTo || form.dateFrom,
      parentPhone: form.parentPhone.trim(),
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setRequests([newItem, ...requests]);
    setShowModal(false);
    showToast('Đã gửi đơn xin phép nghỉ học đến Thầy Nguyễn Đình Hành!', 'success');
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected', note?: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              adminNote: note || (status === 'approved' ? 'Thầy đã duyệt đơn xin nghỉ.' : 'Không được duyệt.'),
            }
          : r
      )
    );
    showToast(status === 'approved' ? 'Đã duyệt đơn xin phép.' : 'Đã từ chối đơn.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 mb-1">
            <CalendarOff className="w-3.5 h-3.5" />
            Mục số 10 trong Mê nu chính: Báo cáo xin phép
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Gửi Đơn & Quản Lý Yêu Cầu Xin Phép Nghỉ Học
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Học sinh và phụ huynh gửi thông báo nghỉ học hoặc đăng ký học bù trực tuyến để giáo viên nắm sĩ số lớp.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Lập đơn xin phép mới
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{r.studentName}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  Lớp {r.classGroup}
                </span>
                <span className="text-xs text-slate-400">({r.createdAt})</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong>Lý do:</strong> {r.reason}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  <strong>Thời gian nghỉ:</strong> {r.dateFrom} {r.dateTo && r.dateTo !== r.dateFrom ? `đến ${r.dateTo}` : ''}
                </span>
                <span>
                  <strong>SĐT phụ huynh:</strong> {r.parentPhone}
                </span>
              </div>

              {r.adminNote && (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                  <strong>Thầy Nguyễn Đình Hành phản hồi:</strong> {r.adminNote}
                </div>
              )}
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {r.status === 'approved' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Đã phê duyệt
                </span>
              ) : r.status === 'rejected' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  Từ chối
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Đang chờ duyệt
                </span>
              )}

              {isAdmin && r.status === 'pending' && (
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(r.id || '', 'approved')}
                    className="px-2.5 py-1 rounded bg-green-600 text-white text-[11px] font-bold hover:bg-green-500 shadow-2xs"
                  >
                    Duyệt đơn
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(r.id || '', 'rejected')}
                    className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 shadow-2xs"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leave Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <CalendarOff className="w-5 h-5 text-orange-600" />
                Lập Đơn Xin Phép Nghỉ Học
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhóm lớp</label>
                  <select
                    value={form.classGroup}
                    onChange={(e) => setForm({ ...form, classGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SĐT phụ huynh</label>
                  <input
                    type="tel"
                    required
                    placeholder="0988 275 288"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghỉ từ ngày</label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/YYYY"
                    value={form.dateFrom}
                    onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đến ngày</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={form.dateTo}
                    onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do xin nghỉ</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ lý do (sốt, gia đình bận, tham gia giải thi đấu...)"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Gửi đơn xin nghỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
