import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Search,
  Play,
  AlertTriangle,
  Upload,
  Trash2,
  Edit,
  PlusCircle,
  FileText,
  ExternalLink,
  X,
  MessageSquare,
} from 'lucide-react';
import { VideoExperimentItem, FileAttachment } from '../../types';
import {
  getStoredExperiments,
  saveExperimentItem,
  deleteExperimentItem,
  processUploadedFile,
  toYoutubeEmbedUrl,
  recordMediaView,
} from '../../utils/examStorage';
import {
  AttachmentList,
  InteractiveCommentSection,
  ItemActivityLogBar,
} from '../AttachmentAndCommentSection';

export const ExperimentsPage: React.FC = () => {
  const { showToast } = useApp();
  const { userProfile, currentUser, isAdmin, isTeacher, loginAdminMaster } = useAuth();
  const canManage = isAdmin || isTeacher;

  const [experiments, setExperiments] = useState<VideoExperimentItem[]>(() =>
    getStoredExperiments()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExp, setSelectedExp] = useState<VideoExperimentItem | null>(() => {
    const all = getStoredExperiments();
    return all.length > 0 ? all[0] : null;
  });

  // Admin Create / Edit Experiment Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [gradeInput, setGradeInput] = useState('Hóa học 8 & 9');
  const [categoryInput, setCategoryInput] = useState('Phản ứng Hóa học & Thực nghiệm');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [equationInput, setEquationInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [safetyInput, setSafetyInput] = useState('');
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
    const refresh = () => {
      const stored = getStoredExperiments();
      setExperiments(stored);
      setSelectedExp((prev) => {
        if (!prev) return stored[0] || null;
        return stored.find((e) => e.id === prev.id) || stored[0] || null;
      });
    };
    window.addEventListener('ndh-experiments-updated', refresh);
    return () => window.removeEventListener('ndh-experiments-updated', refresh);
  }, []);

  // Automatically record view when a student selects and views an experiment
  const handleSelectExperiment = (item: VideoExperimentItem) => {
    setSelectedExp(item);
    if (item.id) {
      recordMediaView(`exp-${item.id}`, actor);
    }
  };

  const filtered = experiments.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.chemicalEquation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitleInput('');
    setGradeInput('Hóa học 8 & 9');
    setCategoryInput('Phản ứng Hóa học & Thực nghiệm');
    setVideoUrlInput('');
    setEquationInput('');
    setDescriptionInput('');
    setSafetyInput('Tuân thủ quy tắc an toàn phòng thí nghiệm, đeo kính bảo hộ và găng tay.');
    setAttachmentsInput([]);
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (exp: VideoExperimentItem) => {
    setEditingId(exp.id || null);
    setTitleInput(exp.title);
    setGradeInput(exp.grade);
    setCategoryInput(exp.category);
    setVideoUrlInput(exp.videoUrl || '');
    setEquationInput(exp.chemicalEquation || '');
    setDescriptionInput(exp.description || '');
    setSafetyInput(exp.safetyNotes || '');
    setAttachmentsInput(exp.attachments || []);
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
        setTitleInput(`Thí nghiệm & Tài liệu: ${cleanName}`);
      }
      showToast(`Đã tải lên ${uploaded.length} tệp (Word / PDF / Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleSaveExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      const ok = loginAdminMaster(adminQuickPass.trim(), 'admin');
      if (!ok) {
        showToast('Mật khẩu Quản trị viên không đúng (Mặc định: Hanh1962@)', 'error');
        return;
      }
    }
    if (!titleInput.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết / video thí nghiệm!', 'error');
      return;
    }

    const newItem: VideoExperimentItem = {
      id: editingId || `exp-${Date.now()}`,
      title: titleInput.trim(),
      grade: gradeInput.trim() || 'Hóa học THCS',
      category: categoryInput.trim() || 'Thí nghiệm thực hành',
      videoUrl: videoUrlInput.trim() ? toYoutubeEmbedUrl(videoUrlInput.trim()) : '',
      chemicalEquation: equationInput.trim() || 'Phương trình phản ứng trong bài viết',
      description:
        descriptionInput.trim() ||
        'Quan sát hiện tượng thực nghiệm và trả lời các câu hỏi trong tài liệu đính kèm.',
      safetyNotes:
        safetyInput.trim() ||
        'Thực hiện đúng hướng dẫn an toàn phòng thí nghiệm của Thầy Nguyễn Đình Hành.',
      attachments: attachmentsInput,
      author: 'Thầy Nguyễn Đình Hành',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updated = saveExperimentItem(newItem);
    setExperiments(updated);
    setSelectedExp(newItem);
    setShowEditorModal(false);
    showToast(
      editingId
        ? 'Đã cập nhật bài viết & video thí nghiệm!'
        : 'Đã đăng bài viết, video thí nghiệm & tệp đính kèm (Word/PDF/Ảnh)!',
      'success'
    );
  };

  const handleQuickUploadToExp = async (
    exp: VideoExperimentItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      const updatedExp: VideoExperimentItem = {
        ...exp,
        attachments: [...(exp.attachments || []), ...uploaded],
      };
      const updatedList = saveExperimentItem(updatedExp);
      setExperiments(updatedList);
      setSelectedExp(updatedExp);
      showToast(
        `Đã đính kèm thêm ${uploaded.length} tệp (Word/PDF/Ảnh) vào bài thí nghiệm!`,
        'success'
      );
    } catch {
      showToast('Lỗi khi tải tệp lên.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveExpAttachment = (exp: VideoExperimentItem, attId: string) => {
    const updatedExp: VideoExperimentItem = {
      ...exp,
      attachments: (exp.attachments || []).filter((a) => a.id !== attId),
    };
    const updatedList = saveExperimentItem(updatedExp);
    setExperiments(updatedList);
    setSelectedExp(updatedExp);
    showToast('Đã xóa tệp đính kèm khỏi bài thí nghiệm.', 'info');
  };

  const handleDeleteExperiment = (exp: VideoExperimentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!exp.id) return;
    const updated = deleteExperimentItem(exp.id);
    setExperiments(updated);
    if (selectedExp?.id === exp.id) {
      setSelectedExp(updated[0] || null);
    }
    showToast(`Đã xóa bài thí nghiệm: "${exp.title}"`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 mb-1">
            <Film className="w-3.5 h-3.5" />
            Mục số 5 trong Mê nu chính: Địa chỉ các video thí nghiệm
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Thư Viện Video, Bài Viết & Tài Liệu Thí Nghiệm Hóa Học THCS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị viên viết bài, dán link video thí nghiệm, đính kèm file Word, PDF, Ảnh hiển thị trực tiếp và theo dõi người đã xem, đã tải.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Quản trị Viết Bài, Đăng Video & Up File (Word, PDF, Ảnh)</span>
          </button>
        </div>
      </div>

      {/* Main Video Stage & Sidebar List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center Column: Selected Experiment Video, Article, Attachments & Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          {selectedExp ? (
            <>
              {/* Video Player Box (if videoUrl is present) */}
              {selectedExp.videoUrl && (
                <div
                  className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 aspect-video relative flex items-center justify-center"
                  onClick={() =>
                    selectedExp.id && recordMediaView(`exp-${selectedExp.id}`, actor)
                  }
                >
                  {selectedExp.videoUrl.includes('embed') ? (
                    <iframe
                      src={selectedExp.videoUrl}
                      title={selectedExp.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-white text-center p-6 space-y-3">
                      <Play className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                      <p className="text-sm font-bold">{selectedExp.title}</p>
                      <a
                        href={selectedExp.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          selectedExp.id && recordMediaView(`exp-${selectedExp.id}`, actor)
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở xem Video thí nghiệm trực tiếp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Experiment Article, Equation, Attachments & Activity Tracker Card */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-extrabold text-amber-700">{selectedExp.grade}</span>
                      <span>·</span>
                      <span className="font-semibold">{selectedExp.category}</span>
                      {selectedExp.createdAt && (
                        <>
                          <span>·</span>
                          <span>Ngày đăng: {selectedExp.createdAt}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {selectedExp.title}
                    </h3>
                  </div>

                  {/* Admin Controls on Selected Experiment */}
                  {canManage && (
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <label
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Đính kèm thêm file Word, PDF hoặc Ảnh cho bài thí nghiệm này"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>+ Up file (Word/PDF/Ảnh)</span>
                        <input
                          type="file"
                          multiple
                          accept=".doc,.docx,.pdf,image/*"
                          onChange={(e) => handleQuickUploadToExp(selectedExp, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(selectedExp)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Sửa bài</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteExperiment(selectedExp)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Chemical Equation Box */}
                {selectedExp.chemicalEquation && (
                  <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl">
                    <span className="text-[11px] font-black text-cyan-800 uppercase block mb-1">
                      Phương trình hóa học cân bằng:
                    </span>
                    <div className="text-sm sm:text-base font-black font-mono text-cyan-950">
                      {selectedExp.chemicalEquation}
                    </div>
                  </div>
                )}

                {/* Phenomenon & Article Content */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-1">
                    Nội dung bài viết & Hiện tượng quan sát được:
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedExp.description}
                  </div>
                </div>

                {/* Safety Guidelines */}
                {selectedExp.safetyNotes && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Lưu ý an toàn thí nghiệm: </strong>
                      <span>{selectedExp.safetyNotes}</span>
                    </div>
                  </div>
                )}

                {/* Direct Inline Preview of Attached Word, PDF, Image Files */}
                {selectedExp.attachments && selectedExp.attachments.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      Tài liệu / Hình ảnh thí nghiệm đính kèm (Word, PDF, Ảnh) — Xem trực tiếp tại app:
                    </span>
                    <AttachmentList
                      attachments={selectedExp.attachments}
                      showInlinePreview={true}
                      parentTargetId={`exp-${selectedExp.id}`}
                      onRemove={
                        canManage
                          ? (attId) => handleRemoveExpAttachment(selectedExp, attId)
                          : undefined
                      }
                    />
                  </div>
                )}

                {/* Viewer & Downloader Tracking Log */}
                <ItemActivityLogBar
                  targetId={`exp-${selectedExp.id}`}
                  label="Danh sách người đã xem video & đã tải tài liệu thí nghiệm này:"
                />

                {/* Comments & Discussion Section */}
                <div className="pt-2 border-t border-slate-100">
                  <InteractiveCommentSection
                    targetId={`exp-cmt-${selectedExp.id}`}
                    title="Bình luận & Báo cáo kết quả quan sát thí nghiệm (Hỗ trợ gửi Word, PDF, Ảnh)"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              Chưa có bài viết hoặc video thí nghiệm nào. Quản trị viên có thể bấm nút "+ Quản trị Viết Bài, Đăng Video & Up File" để thêm mới.
            </div>
          )}
        </div>

        {/* Right Column: Video & Experiment Articles Playlist */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên thí nghiệm, phương trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = selectedExp?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectExperiment(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] gap-2">
                    <span className="font-bold text-amber-800">
                      {item.grade}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.attachments && item.attachments.length > 0 && (
                        <span className="text-emerald-700 font-bold">
                          {item.attachments.length} tệp đính kèm
                        </span>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteExperiment(item, e)}
                          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Xóa bài thí nghiệm này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="text-[11px] font-mono text-cyan-700 truncate">
                    {item.chemicalEquation}
                  </div>
                  <ItemActivityLogBar targetId={`exp-${item.id}`} compact />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Write Experiment Article & Upload Files (Word, PDF, Image) Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingId
                      ? 'Chỉnh Sửa Bài Thí Nghiệm & Tài Liệu'
                      : 'Quản Trị Viết Bài, Đăng Video Thí Nghiệm & Up File (Word, PDF, Ảnh)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dán link YouTube/video, viết bài mô tả hiện tượng và tải lên file Word, PDF, Ảnh xem trực tiếp
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

            <form onSubmit={handleSaveExperiment} className="space-y-4 text-xs">
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
                  Tên bài thí nghiệm / Tiêu đề bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="VD: Thí nghiệm Đồng (Cu) tác dụng với H₂SO₄ đặc nóng..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <input
                    type="text"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="VD: Hóa học 8 & 9"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên đề</label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="VD: Kim loại & Axit"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đường dẫn (Link) Video YouTube hoặc Video Thí nghiệm
                  </label>
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="VD: https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phương trình hóa học
                  </label>
                  <input
                    type="text"
                    value={equationInput}
                    onChange={(e) => setEquationInput(e.target.value)}
                    placeholder="VD: Cu + 2H₂SO₄ (đặc) → CuSO₄ + SO₂↑ + 2H₂O"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết / Mô tả hiện tượng & Giải thích
                </label>
                <textarea
                  rows={4}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Viết bài hướng dẫn chi tiết cách tiến hành, hiện tượng quan sát được và câu hỏi thảo luận..."
                  className="w-full p-3 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lưu ý an toàn phòng thí nghiệm
                </label>
                <input
                  type="text"
                  value={safetyInput}
                  onChange={(e) => setSafetyInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Upload Word / PDF / Image Files for the Experiment */}
              <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-dashed border-amber-400 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-amber-950 text-sm block">
                      Đính kèm File Tài liệu / Phiếu thực hành (Word, PDF, Ảnh)
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Hỗ trợ chọn file Word (.doc, .docx), PDF (.pdf), Ảnh chụp thí nghiệm (.jpg, .png)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
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
                  <div className="pt-2 border-t border-amber-200">
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
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{editingId ? 'Lưu Cập Nhật' : 'Đăng Bài & Video Thí Nghiệm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
