import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Download, FileSpreadsheet, Eye, PlusCircle, X, Sparkles } from 'lucide-react';
import { ScheduleItem } from '../../types';
import { readPersistedKey, writePersistedKey } from '../../utils/cloudPersistence';

export const SAMPLE_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    title: 'Thời Khóa Biểu Học Kỳ I - Năm Học 2025-2026 (Áp Dụng Từ 01/10/2025)',
    classGroup: 'Tất cả các lớp',
    semester: 'Học kỳ I',
    fileType: 'image',
    fileUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
    notes: 'Học sinh có mặt trước giờ học 10 phút để ổn định nề nếp và kiểm tra bài tập về nhà.',
    updatedAt: '01/10/2025',
  },
  {
    id: 'sch-2',
    title: 'Lịch Tăng Cường & Bồi Dưỡng Học Sinh Giỏi Hóa Học Cấp Tỉnh, Thành Phố',
    classGroup: 'Bồi dưỡng HSG cấp tỉnh, thành phố',
    semester: 'Đợt 1',
    fileType: 'pdf',
    fileUrl: 'https://example.com/lich-bds-hsg.pdf',
    notes: 'Tập trung chuyên sâu các chuyên đề kim loại tác dụng axit và phương pháp đường chéo.',
    updatedAt: '05/10/2025',
  },
];

export const SchedulePage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { isAdmin } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = readPersistedKey<ScheduleItem[]>('ndh_schedules', SAMPLE_SCHEDULES);
    return Array.isArray(saved) && saved.length > 0 ? saved : SAMPLE_SCHEDULES;
  });
  const [filterClass, setFilterClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    title: '',
    classGroup: 'Tất cả các lớp',
    semester: 'Học kỳ I',
    fileUrl: '',
    notes: '',
  });

  useEffect(() => {
    const refresh = () => {
      const latest = readPersistedKey<ScheduleItem[]>('ndh_schedules', SAMPLE_SCHEDULES);
      if (Array.isArray(latest) && latest.length > 0) {
        setSchedules(latest);
      }
    };
    window.addEventListener('ndh-schedules-updated', refresh);
    return () => window.removeEventListener('ndh-schedules-updated', refresh);
  }, []);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.title) {
      showToast('Vui lòng nhập tên thời khóa biểu', 'error');
      return;
    }

    const newItem: ScheduleItem = {
      id: 'sch-' + Date.now(),
      title: modalForm.title,
      classGroup: modalForm.classGroup,
      semester: modalForm.semester,
      fileUrl: modalForm.fileUrl || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
      fileType: 'image',
      notes: modalForm.notes,
      updatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const next = [newItem, ...schedules];
    setSchedules(next);
    writePersistedKey('ndh_schedules', next, { eventName: 'ndh-schedules-updated' });
    setShowAddModal(false);
    showToast('Đã đăng thời khóa biểu mới thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Thời khóa biểu các lớp Hóa học NĐH
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Lịch Học & Thời Khóa Biểu Cố Định Các Lớp
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu thời gian học của từng lớp, phòng học trực tiếp và tệp ảnh thời khóa biểu công bố.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Đăng thời khóa biểu mới
          </button>
        )}
      </div>

      {/* Quick Weekly Overview Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 overflow-x-auto">
        <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-600" />
          Bảng Tổng Hợp Lịch Học Trong Tuần (13 Lớp)
        </h3>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
              <th className="p-3">Lớp học</th>
              <th className="p-3">Khối</th>
              <th className="p-3">Thời gian học</th>
              <th className="p-3">Giáo viên</th>
              <th className="p-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="p-3 font-bold text-cyan-700">Lớp {c.name}</td>
                <td className="p-3 font-semibold text-slate-600">{c.grade}</td>
                <td className="p-3 font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-600" />
                  {c.schedule}
                </td>
                <td className="p-3 font-semibold text-slate-700">{c.teacher}</td>
                <td className="p-3 text-slate-500 italic max-w-xs truncate">{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Published Timetable Cards with Preview */}
      <div className="space-y-4">
        {schedules.map((sch) => (
          <div key={sch.id} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 mr-2">
                  {sch.semester}
                </span>
                <span className="text-xs text-slate-500">Áp dụng: {sch.classGroup}</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{sch.title}</h3>
              </div>
              <span className="text-xs text-slate-400">Cập nhật: {sch.updatedAt}</span>
            </div>

            {sch.notes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong>Ghi chú từ Thầy Hành:</strong> {sch.notes}
              </p>
            )}

            {sch.fileUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-96 relative group">
                <img src={sch.fileUrl} alt={sch.title} className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <a
                    href={sch.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> Phóng to ảnh
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                Đăng Thời Khóa Biểu Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thời khóa biểu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TKB Học Kỳ II..."
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp áp dụng</label>
                  <select
                    value={modalForm.classGroup}
                    onChange={(e) => setModalForm({ ...modalForm, classGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tất cả các lớp">Tất cả các lớp</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Học kỳ / Đợt</label>
                  <input
                    type="text"
                    value={modalForm.semester}
                    onChange={(e) => setModalForm({ ...modalForm, semester: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Ảnh thời khóa biểu</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={modalForm.fileUrl}
                  onChange={(e) => setModalForm({ ...modalForm, fileUrl: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  placeholder="Lưu ý về giờ giấc, chuẩn bị sách vở..."
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow"
                >
                  Đăng thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
