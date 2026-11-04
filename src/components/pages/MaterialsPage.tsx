import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpenCheck,
  Search,
  Filter,
  Download,
  Eye,
  BookOpen,
  FileText,
  PlusCircle,
  Upload,
  Trash2,
  Edit,
  X,
  MessageSquare,
} from 'lucide-react';
import { MaterialItem, FileAttachment } from '../../types';
import {
  getStoredMaterials,
  saveMaterialItem,
  deleteMaterialItem,
  processUploadedFile,
  downloadAttachmentFile,
  recordMediaView,
  recordMediaDownload,
} from '../../utils/examStorage';
import {
  AttachmentList,
  InteractiveCommentSection,
  ItemActivityLogBar,
} from '../AttachmentAndCommentSection';

export const MaterialsPage: React.FC = () => {
  const { showToast } = useApp();
  const { userProfile, currentUser, isAdmin, isTeacher, loginAdminMaster } = useAuth();
  const canManage = isAdmin || isTeacher;

  const [materials, setMaterials] = useState<MaterialItem[]>(() => getStoredMaterials());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  // Admin Create / Edit Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [gradeInput, setGradeInput] = useState('Khối 8-9 & HSG');
  const [categoryInput, setCategoryInput] = useState('Sách tham khảo xuất bản');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [attachmentsInput, setAttachmentsInput] = useState<FileAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [adminQuickPass, setAdminQuickPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const actor = {
    userName:
      userProfile?.fullName ||
      currentUser?.displayName ||
      (isAdmin ? 'Thầy Nguyễn Đình Hành (QTV)' : 'Học sinh / Khách'),
    userClass: userProfile?.enrolledClass || (isAdmin ? 'Quản trị' : undefined),
    userRole: userProfile?.role || (isAdmin ? 'admin' : 'guest'),
  };

  useEffect(() => {
    const refresh = () => setMaterials(getStoredMaterials());
    window.addEventListener('ndh-materials-updated', refresh);
    return () => window.removeEventListener('ndh-materials-updated', refresh);
  }, []);

  const filtered = materials.filter((m) => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.grade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitleInput('');
    setGradeInput('Khối 8-9 & HSG');
    setCategoryInput('Sách tham khảo xuất bản');
    setDescriptionInput('');
    setFileUrlInput('');
    setAttachmentsInput([]);
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (mat: MaterialItem) => {
    setEditingId(mat.id || null);
    setTitleInput(mat.title);
    setGradeInput(mat.grade);
    setCategoryInput(mat.category);
    setDescriptionInput(mat.description || '');
    setFileUrlInput(mat.fileUrl || '');
    setAttachmentsInput(mat.attachments || []);
    setShowEditorModal(true);
  };

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setAttachmentsInput((prev) => [...prev, ...uploaded]);
      if (!titleInput.trim() && uploaded.length > 0) {
        const cleanName = uploaded[0].name.replace(/\.[^/.]+$/, '');
        setTitleInput(`Tài liệu: ${cleanName}`);
      }
      showToast(`Đã tải lên ${uploaded.length} tệp (Word / PDF / Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      const ok = loginAdminMaster(adminQuickPass.trim(), 'admin');
      if (!ok) {
        showToast('Mật khẩu Quản trị viên không đúng (Mặc định: Hanh1962@)', 'error');
        return;
      }
    }
    if (!titleInput.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết / tài liệu!', 'error');
      return;
    }

    const primaryType =
      attachmentsInput[0]?.type === 'word'
        ? 'WORD'
        : attachmentsInput[0]?.type === 'pdf'
        ? 'PDF'
        : attachmentsInput[0]?.type === 'image'
        ? 'ẢNH'
        : 'TÀI LIỆU';

    const newItem: MaterialItem = {
      id: editingId || `mat-${Date.now()}`,
      title: titleInput.trim(),
      grade: gradeInput.trim() || 'Tất cả khối lớp',
      category: categoryInput,
      fileUrl: fileUrlInput.trim() || '#',
      fileType: primaryType,
      attachments: attachmentsInput,
      description:
        descriptionInput.trim() ||
        'Tài liệu chuyên khảo môn Hóa học THCS do Thầy Nguyễn Đình Hành biên soạn và chia sẻ.',
      author: 'Thầy Nguyễn Đình Hành',
      uploadDate: new Date().toLocaleDateString('vi-VN'),
    };

    const updated = saveMaterialItem(newItem);
    setMaterials(updated);
    setShowEditorModal(false);
    showToast(
      editingId
        ? 'Đã cập nhật bài viết & tài liệu tham khảo!'
        : 'Đã đăng bài viết & tải tài liệu (Word/PDF/Ảnh) lên thành công!',
      'success'
    );
  };

  const handleQuickUploadOnCard = async (
    mat: MaterialItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      const updatedItem: MaterialItem = {
        ...mat,
        attachments: [...(mat.attachments || []), ...uploaded],
      };
      const updatedList = saveMaterialItem(updatedItem);
      setMaterials(updatedList);
      showToast(`Đã đính kèm thêm ${uploaded.length} tệp (Word/PDF/Ảnh) vào tài liệu!`, 'success');
    } catch {
      showToast('Lỗi khi tải tệp lên.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveAttachmentFromCard = (mat: MaterialItem, attId: string) => {
    const updatedItem: MaterialItem = {
      ...mat,
      attachments: (mat.attachments || []).filter((a) => a.id !== attId),
    };
    const updatedList = saveMaterialItem(updatedItem);
    setMaterials(updatedList);
    showToast('Đã xóa tệp đính kèm khỏi tài liệu.', 'info');
  };

  const handleDeleteMaterial = (mat: MaterialItem) => {
    if (!mat.id) return;
    const updated = deleteMaterialItem(mat.id);
    setMaterials(updated);
    if (previewMaterial?.id === mat.id) setPreviewMaterial(null);
    showToast(`Đã xóa tài liệu: "${mat.title}"`, 'info');
  };

  const handleViewMaterial = (mat: MaterialItem) => {
    recordMediaView(`mat-${mat.id}`, actor);
    setPreviewMaterial(mat);
  };

  const handleDownloadMaterial = (mat: MaterialItem) => {
    recordMediaDownload(`mat-${mat.id}`, actor);
    if (mat.attachments && mat.attachments.length > 0) {
      mat.attachments.forEach((att) => downloadAttachmentFile(att, `mat-${mat.id}`));
      showToast(`Đang tải ${mat.attachments.length} tệp của tài liệu: ${mat.title}`, 'success');
      return;
    }
    if (mat.fileUrl && mat.fileUrl !== '#' && !mat.fileUrl.includes('example.com')) {
      const a = document.createElement('a');
      a.href = mat.fileUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      showToast(`Đang mở/tải tài liệu: ${mat.title}`, 'success');
      return;
    }
    // Generate a clean downloadable summary document if it is a text post without binary attachment
    const content = `TÀI LIỆU THAM KHẢO HÓA HỌC THCS - THẦY NGUYỄN ĐÌNH HÀNH\n==================================================\nTiêu đề: ${mat.title}\nChuyên mục: ${mat.category} | Khối: ${mat.grade}\nTác giả: ${mat.author || 'Thầy Nguyễn Đình Hành'}\nNgày đăng: ${mat.uploadDate || ''}\n\nNỘI DUNG BÀI VIẾT / TÀI LIỆU:\n${mat.description || ''}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mat.title.slice(0, 50).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã tải bài viết tài liệu: ${mat.title}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1">
            <BookOpenCheck className="w-3.5 h-3.5" />
            Mục số 4 trong Mê nu chính: Tài liệu tham khảo
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Thư Viện Sách & Tài Liệu Chuyên Khảo Thầy Nguyễn Đình Hành
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị viên viết bài, tải lên file Word (.docx), PDF (.pdf), Ảnh (.jpg, .png) xem trực tiếp tại ứng dụng và theo dõi danh sách người đã xem, đã tải.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Quản trị Viết Bài & Up File (Word, PDF, Ảnh)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, bài viết chuyên khảo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Tất cả danh mục ({materials.length})</option>
            <option value="Sách tham khảo xuất bản">Sách tham khảo xuất bản</option>
            <option value="Phương pháp giải nhanh">Phương pháp giải nhanh</option>
            <option value="Đề thi HSG các năm">Đề thi HSG các năm</option>
            <option value="Sổ tay tra cứu">Sổ tay tra cứu</option>
            <option value="Bài viết chuyên đề">Bài viết chuyên đề</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {filtered.map((mat) => {
          const matId = mat.id || 'mat-default';
          const isCommentsOpen = expandedCommentsId === matId;

          return (
            <div
              key={matId}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-extrabold text-emerald-700">{mat.category}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-700">{mat.grade}</span>
                    {mat.uploadDate && (
                      <>
                        <span>·</span>
                        <span>Ngày đăng: {mat.uploadDate}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Tác giả: {mat.author || 'Thầy Nguyễn Đình Hành'}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {mat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    {mat.description}
                  </p>
                </div>

                {/* Admin Management Buttons on each Material Card */}
                {canManage && (
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <label
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                      title="Tải thêm file Word, PDF hoặc Ảnh cho bài viết này"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>+ Up file (Word/PDF/Ảnh)</span>
                      <input
                        type="file"
                        multiple
                        accept=".doc,.docx,.pdf,image/*"
                        onChange={(e) => handleQuickUploadOnCard(mat, e)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(mat)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa bài</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(mat)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa bài</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Inline Display of Attached Files (Word, PDF, Image) */}
              {mat.attachments && mat.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Tệp tài liệu đính kèm (Word, PDF, Ảnh) — Xem trực tiếp trên ứng dụng:
                  </span>
                  <AttachmentList
                    attachments={mat.attachments}
                    showInlinePreview={true}
                    parentTargetId={`mat-${matId}`}
                    onRemove={
                      canManage
                        ? (attId) => handleRemoveAttachmentFromCard(mat, attId)
                        : undefined
                    }
                  />
                </div>
              )}

              {/* Activity Tracker: Who Viewed and Who Downloaded this Material */}
              <ItemActivityLogBar
                targetId={`mat-${matId}`}
                label="Danh sách người đã xem & đã tải tài liệu này:"
              />

              {/* Bottom Action Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExpandedCommentsId(isCommentsOpen ? null : matId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Bình luận & Hỏi đáp</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewMaterial(mat)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-cyan-600" />
                    <span>Xem chi tiết bài viết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadMaterial(mat)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải tài liệu về máy</span>
                  </button>
                </div>
              </div>

              {isCommentsOpen && (
                <InteractiveCommentSection
                  targetId={`mat-cmt-${matId}`}
                  title="Thảo luận về tài liệu tham khảo (Hỗ trợ đính kèm Word, PDF, Ảnh)"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs"
          onClick={() => setPreviewMaterial(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Xem Tài Liệu & Bài Viết Chuyên Khảo</span>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-slate-900 text-base">
                {previewMaterial.title}
              </h4>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                {previewMaterial.description}
              </div>

              {previewMaterial.attachments && previewMaterial.attachments.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Nội dung tệp đính kèm (Word / PDF / Ảnh):
                  </span>
                  <AttachmentList
                    attachments={previewMaterial.attachments}
                    showInlinePreview={true}
                    parentTargetId={`mat-${previewMaterial.id}`}
                  />
                </div>
              )}

              <ItemActivityLogBar
                targetId={`mat-${previewMaterial.id}`}
                label="Người đã xem và người đã tải tài liệu này:"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleDownloadMaterial(previewMaterial)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải bản đầy đủ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Write Post & Upload File (Word, PDF, Image) Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingId
                      ? 'Chỉnh Sửa Bài Viết & Tài Liệu Tham Khảo'
                      : 'Quản Trị Viết Bài & Up Tài Liệu (Word, PDF, Ảnh)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đăng bài viết chuyên đề và đính kèm file Word, PDF, Ảnh hiển thị trực tiếp trên ứng dụng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              {!canManage && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                  <label className="block font-extrabold text-amber-900">
                    Xác thực Quản trị viên (Nhập mật khẩu Quản trị để đăng bài):
                  </label>
                  <input
                    type="password"
                    required
                    value={adminQuickPass}
                    onChange={(e) => setAdminQuickPass(e.target.value)}
                    placeholder="Nhập mật khẩu Quản trị (Mặc định: Hanh1962@)"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài viết / tên tài liệu tham khảo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="VD: Chuyên đề Bảo toàn electron & 50 bài tập vận dụng cao..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Sách tham khảo xuất bản">Sách tham khảo xuất bản</option>
                    <option value="Phương pháp giải nhanh">Phương pháp giải nhanh</option>
                    <option value="Đề thi HSG các năm">Đề thi HSG các năm</option>
                    <option value="Sổ tay tra cứu">Sổ tay tra cứu</option>
                    <option value="Bài viết chuyên đề">Bài viết chuyên đề</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp áp dụng</label>
                  <input
                    type="text"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="VD: Khối 8-9 & Bồi dưỡng HSG"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết / Hướng dẫn chi tiết
                </label>
                <textarea
                  rows={5}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Nhập nội dung bài viết, tóm tắt lý thuyết, phương pháp giải hoặc lời dặn dò học sinh..."
                  className="w-full p-3 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              {/* File Upload Section */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-dashed border-emerald-400 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-emerald-950 text-sm block">
                      Đính kèm File Tài liệu (Word, PDF, Ảnh)
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Hỗ trợ chọn nhiều file .doc, .docx, .pdf, .jpg, .png hiển thị trực tiếp trên trang
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingFiles ? 'Đang tải tệp...' : '+ Chọn File Word / PDF / Ảnh'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".doc,.docx,.pdf,image/*"
                    onChange={handleSelectFiles}
                    className="hidden"
                  />
                </div>

                {attachmentsInput.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200">
                    <AttachmentList
                      attachments={attachmentsInput}
                      showInlinePreview={true}
                      onRemove={(id) =>
                        setAttachmentsInput((prev) => prev.filter((a) => a.id !== id))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{editingId ? 'Lưu Cập Nhật' : 'Đăng Bài & Tài Liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
