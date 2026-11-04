import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Pin,
  PlusCircle,
  X,
  User,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { AnnouncementItem, FileAttachment } from '../../types';
import { processUploadedFile } from '../../utils/examStorage';
import { AttachmentList, InteractiveCommentSection, ItemActivityLogBar } from '../AttachmentAndCommentSection';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const SAMPLE_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Thông Báo Lịch Thi Khảo Sát Định Kỳ & Khai Giảng Đội Tuyển HSG Hóa Học Năm Học Mới',
    content:
      'Thầy Nguyễn Đình Hành xin gửi thông báo đến toàn thể phụ huynh và học sinh về kế hoạch tổ chức kỳ thi khảo sát chất lượng định kỳ tháng 10. Kỳ thi nhằm đánh giá năng lực tư duy hóa học thực nghiệm, phân loại học lực và chọn lọc học sinh vào lớp Bồi dưỡng Học sinh giỏi cấp tỉnh, thành phố.\n\nThời gian: 14h00 Chủ Nhật, ngày 25/10/2026.\nĐịa điểm: Phòng học chuyên môn số 806/4/2 Quang Trung, An Bình, Gia Lai.\nHọc sinh mang theo máy tính cầm tay, bút và thước kẻ.',
    targetClasses: 'Tất cả các lớp',
    isPinned: true,
    authorName: 'Thầy Nguyễn Đình Hành',
    createdAt: '10/10/2026',
  },
  {
    id: 'ann-2',
    title: 'Phát Hành Tài Liệu Chuyên Đề: Bí Quyết Giải Nhanh Bài Toán Hỗn Hợp Oxit & Axit',
    content:
      'Thầy đã hoàn thiện bộ tài liệu chuyên sâu 50 trang hướng dẫn các phương pháp giải độc quyền: quy đổi hỗn hợp, phương pháp đường chéo và định luật bảo toàn khối lượng. Học sinh các lớp H8.1, H9.1 và Bồi dưỡng HSG cấp tỉnh, thành phố có thể tải tài liệu tại mục Tài liệu tham khảo hoặc nhận bản in trực tiếp tại lớp học.',
    targetClasses: 'H8.1, H9.1, Bồi dưỡng HSG cấp tỉnh, thành phố',
    isPinned: false,
    authorName: 'Thầy Nguyễn Đình Hành',
    createdAt: '08/10/2026',
  },
];

export const AnnouncementsPage: React.FC = () => {
  const { showToast } = useApp();
  const { isAdmin } = useAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const saved = localStorage.getItem('ndh_announcements');
      return saved ? JSON.parse(saved) : SAMPLE_ANNOUNCEMENTS;
    } catch {
      return SAMPLE_ANNOUNCEMENTS;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetClasses: 'Tất cả các lớp',
    isPinned: false,
    attachments: [] as FileAttachment[],
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const isRemoteAnnRef = useRef(false);
  const isFirstAnnMountRef = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem('ndh_announcements', JSON.stringify(announcements));
    } catch {}
    if (isFirstAnnMountRef.current) {
      isFirstAnnMountRef.current = false;
      return;
    }
    if (isRemoteAnnRef.current) {
      isRemoteAnnRef.current = false;
      return;
    }
    const now = Date.now();
    try {
      localStorage.setItem('ndh_announcements_updated_at', String(now));
    } catch {}
    setDoc(
      doc(db, 'app_settings', 'announcements_list'),
      { items: announcements, updatedAt: now },
      { merge: false }
    ).catch(() => {});
  }, [announcements]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'app_settings', 'announcements_list'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data || !Array.isArray(data.items)) return;
        const cloudUpdatedAt = Number(data.updatedAt || 0);
        const localUpdatedAt = Number(localStorage.getItem('ndh_announcements_updated_at') || 0);
        if (cloudUpdatedAt >= localUpdatedAt || localUpdatedAt === 0) {
          isRemoteAnnRef.current = true;
          setAnnouncements(data.items);
          try {
            localStorage.setItem('ndh_announcements', JSON.stringify(data.items));
            localStorage.setItem('ndh_announcements_updated_at', String(cloudUpdatedAt || Date.now()));
          } catch {}
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploaded],
      }));
      showToast(`Đã đính kèm ${uploaded.length} tệp (Word/Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      showToast('Vui lòng điền tiêu đề và nội dung thông báo', 'error');
      return;
    }

    const created: AnnouncementItem = {
      id: 'ann-' + Date.now(),
      title: form.title,
      content: form.content,
      targetClasses: form.targetClasses,
      isPinned: form.isPinned,
      attachments: form.attachments,
      authorName: 'Thầy Nguyễn Đình Hành',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setAnnouncements([created, ...announcements]);
    setForm({
      title: '',
      content: '',
      targetClasses: 'Tất cả các lớp',
      isPinned: false,
      attachments: [],
    });
    setShowAddModal(false);
    showToast('Đã đăng thông báo mới thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200 mb-1">
            <Bell className="w-3.5 h-3.5" />
            Mục số 8: Thông Báo & Trao Đổi Bình Luận (Hỗ trợ gửi Word, Ảnh)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Bảng Tin & Thông Báo Chính Thức Thầy Nguyễn Đình Hành
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật lịch thi, tài liệu mới và trao đổi bình luận (đính kèm file Word, Ảnh) cùng phụ huynh, học sinh.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Đăng thông báo mới (Word/Ảnh)
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-5">
        {announcements.map((ann) => {
          const annId = ann.id || 'default-id';
          return (
            <div
              key={annId}
              className={`bg-white rounded-2xl shadow-xs border transition p-6 space-y-4 ${
                ann.isPinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
              }`}
            >
              {/* Header of Announcement */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.isPinned && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1 border border-amber-300">
                      <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                      Ghim lên đầu
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                    Lớp: {ann.targetClasses}
                  </span>
                  <span className="text-xs text-slate-400">Ngày đăng: {ann.createdAt}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-bold text-slate-700">{ann.authorName}</span>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('Xóa thông báo này?')) {
                          setAnnouncements(announcements.filter((i) => (i.id || '') !== annId));
                          showToast('Đã xóa thông báo.', 'info');
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1 ml-2 cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {ann.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              {ann.attachments && ann.attachments.length > 0 && (
                <AttachmentList attachments={ann.attachments} parentTargetId={`ann-${annId}`} />
              )}

              {/* Automatic Student Interaction Bar (Xem, viết bài, tải) */}
              <ItemActivityLogBar
                targetId={`ann-${annId}`}
                label="Danh sách Học sinh tương tác thông báo này (Tự động • Đúng danh sách lớp)"
                compact
              />

              {/* Interactive Comments Section with Word & Image Support */}
              <InteractiveCommentSection
                targetId={`ann-${annId}`}
                title="Trao đổi & Bình luận của Học sinh / Phụ huynh (Hỗ trợ gửi Word, Ảnh)"
              />
            </div>
          );
        })}
      </div>

      {/* Add Modal (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-600" />
                Đăng Thông Báo Mới (Quản Trị)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề thông báo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kế hoạch thi giữa kỳ..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhóm lớp nhận thông báo
                </label>
                <input
                  type="text"
                  value={form.targetClasses}
                  onChange={(e) => setForm({ ...form, targetClasses: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Soạn nội dung thông báo gửi đến phụ huynh và học sinh..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Đính kèm File Word (.docx), Ảnh (.jpg, .png) hoặc PDF
                  </span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Chọn file</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".doc,.docx,image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {form.attachments.length > 0 && (
                  <AttachmentList
                    attachments={form.attachments}
                    onRemove={(id) =>
                      setForm((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter((a) => a.id !== id),
                      }))
                    }
                    compact
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="pin" className="font-semibold text-slate-700">
                  Ghim thông báo này lên đầu trang
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow cursor-pointer"
                >
                  Đăng thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
