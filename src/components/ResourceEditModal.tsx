import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  FileCode, 
  Video, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  BookOpen, 
  GraduationCap, 
  User, 
  ShieldCheck,
  Film,
  Sparkles,
  Info
} from 'lucide-react';
import { DigitalFileType, GradeLevel, LearningResource, SubjectType, UserSession } from '../types';
import { readFileToDataUrl, normalizeUrl } from '../utils/fileUtils';

interface ResourceEditModalProps {
  isOpen: boolean;
  category: 'study_corner' | 'homework' | 'prep_guide' | 'digital_products' | 'digital_tools' | 'hsg_prep';
  resourceToEdit: LearningResource | null;
  currentUser: UserSession | null;
  onClose: () => void;
  onSave: (resource: LearningResource) => void;
}

export function ResourceEditModal({
  isOpen,
  category,
  resourceToEdit,
  currentUser,
  onClose,
  onSave
}: ResourceEditModalProps) {
  const isEditing = !!resourceToEdit;
  const isDigitalProduct = category === 'digital_products';
  const isFileSupportedCategory = category === 'study_corner' || category === 'prep_guide' || category === 'digital_products';

  // Form states
  const [title, setTitle] = useState(resourceToEdit?.title || '');
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'biology'>(resourceToEdit?.subject || 'physics');
  const [grade, setGrade] = useState<GradeLevel>(resourceToEdit?.grade || 8);
  const [description, setDescription] = useState(resourceToEdit?.description || '');
  const [contentUrl, setContentUrl] = useState(resourceToEdit?.contentUrl || '');
  const [documentContent, setDocumentContent] = useState(resourceToEdit?.documentContent || '');
  
  // Author info
  const [authorName, setAuthorName] = useState(
    resourceToEdit?.authorName || currentUser?.adminName || currentUser?.name || ''
  );
  const [authorClass, setAuthorClass] = useState(
    resourceToEdit?.authorClass || currentUser?.className || '8A1'
  );

  // File states: Word, PDF, PPT, Ảnh, Video ngắn 1 phút
  const [fileType, setFileType] = useState<DigitalFileType>(resourceToEdit?.fileType || (isFileSupportedCategory ? 'word' : 'link'));
  const [fileName, setFileName] = useState(resourceToEdit?.fileName || '');
  const [fileSize, setFileSize] = useState(resourceToEdit?.fileSize || '');
  const [fileData, setFileData] = useState<string>(resourceToEdit?.fileData || '');
  const [videoDuration, setVideoDuration] = useState<number>(resourceToEdit?.videoDurationSeconds || 60);

  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  // File upload handler - resilient with multiple fallbacks
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect type based on extension
    const nameLower = file.name.toLowerCase();
    let detectedType: DigitalFileType = fileType;
    if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) detectedType = 'word';
    else if (nameLower.endsWith('.pdf')) detectedType = 'pdf';
    else if (nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx')) detectedType = 'ppt';
    else if (nameLower.match(/\.(png|jpe?g|webp|gif|svg)$/)) detectedType = 'image';
    else if (nameLower.match(/\.(mp4|webm|mov|m4v|mkv)$/)) detectedType = 'video';

    // File size check: 25MB max
    if (file.size > 25 * 1024 * 1024) {
      setFormError('Dung lượng tệp tối đa cho phép là 25MB. Nếu tệp lớn hơn, bạn có thể dán đường link Google Drive ở ô bên dưới.');
      return;
    }

    setFileName(file.name);
    const sizeKB = Math.round(file.size / 1024);
    setFileSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
    setFileType(detectedType);

    setIsUploading(true);
    setFormError('');

    // If video, inspect duration safely
    if (detectedType === 'video') {
      try {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = function() {
          window.URL.revokeObjectURL(videoElement.src);
          const duration = Math.round(videoElement.duration);
          if (!isNaN(duration) && duration > 0) {
            setVideoDuration(duration);
            if (duration > 90) {
              setFormError(`Video dài ${duration}s. Bạn vẫn có thể tải lên, hoặc ưu tiên trích đoạn ngắn 60s để xem nhanh.`);
            }
          }
        };
        videoElement.src = URL.createObjectURL(file);
      } catch (vidErr) {
        console.warn('Video duration inspection skipped:', vidErr);
      }
    }

    try {
      const dataUrl = await readFileToDataUrl(file);
      setFileData(dataUrl);
      setIsUploading(false);
    } catch (err: any) {
      console.warn('File reading error, fallback active:', err);
      // Even if binary reading fails, generate safe object URL so user is never blocked
      try {
        const blobUrl = URL.createObjectURL(file);
        setFileData(blobUrl);
        setIsUploading(false);
      } catch (fatalErr) {
        setIsUploading(false);
        setFormError(
          'Không thể đọc trực tiếp tệp này từ thiết bị. Bạn có thể dán đường liên kết (Google Drive / OneDrive / YouTube) ở ô bên dưới thay thế.'
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Vui lòng nhập tiêu đề và nội dung mô tả.');
      return;
    }

    // Role verification:
    // study_corner, prep_guide, digital_products: both Teacher and Student can post
    // other categories (digital_tools, hsg_prep): only admin
    if (!isFileSupportedCategory && !isAdmin) {
      setFormError('Chỉ Giáo viên bộ môn mới có quyền đăng bài và chỉnh sửa trong mục này.');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const finalUrl = contentUrl.trim() ? normalizeUrl(contentUrl.trim()) : undefined;

    const updated: LearningResource = {
      id: resourceToEdit?.id || `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      subject,
      grade,
      category,
      description: description.trim(),
      contentUrl: finalUrl,
      documentContent: documentContent.trim() || undefined,
      date: resourceToEdit?.date || dateStr,
      authorName: authorName.trim() || (isAdmin ? (currentUser?.adminName || 'Giáo viên bộ môn') : (currentUser?.name || 'Học sinh Y Đôn')),
      authorRole: isAdmin ? 'admin' : 'student',
      authorClass: (!isAdmin ? authorClass : undefined),
      fileType: isFileSupportedCategory ? fileType : (category === 'digital_tools' ? 'link' : fileType),
      fileName: fileName || undefined,
      fileSize: fileSize || undefined,
      fileData: fileData || undefined,
      videoDurationSeconds: fileType === 'video' ? videoDuration : undefined,
      grading: resourceToEdit?.grading,
      comments: resourceToEdit?.comments || []
    };

    onSave(updated);
    onClose();
  };

  const getModalTitle = () => {
    if (category === 'study_corner') {
      return isEditing ? 'Chỉnh Sửa Bài Viết Góc Học Tập' : 'Gửi Bài Góc Học Tập (Word, Ảnh, PPT, Video ngắn, PDF)';
    }
    if (category === 'prep_guide') {
      return isEditing ? 'Chỉnh Sửa Hướng Dẫn Soạn Bài' : 'Gửi Bài Soạn / Hướng Dẫn Soạn Bài (Word, Ảnh, PPT, Video ngắn, PDF)';
    }
    if (category === 'digital_products') {
      return isEditing ? 'Chỉnh Sửa Sản Phẩm Số' : 'Gửi Sản Phẩm Số Mới (Word, Ảnh, PPT, Video ngắn, PDF)';
    }
    if (category === 'digital_tools') {
      return isEditing ? 'Chỉnh Sửa Link Công Cụ Số' : 'Thêm Link Công Cụ Số (Dành cho GV)';
    }
    return isEditing ? 'Chỉnh Sửa Học Liệu' : 'Đăng Học Liệu Mới';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isFileSupportedCategory ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800'
            }`}>
              {isFileSupportedCategory ? (
                <>
                  <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dành cho Giáo viên & Học sinh • Đính kèm tệp</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quyền Giáo Viên / Quản Trị Viên</span>
                </>
              )}
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {getModalTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Author identification */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Người đăng bài:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="Họ và tên..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                />
                {isAdmin && (
                  <span className="shrink-0 px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold">
                    GV
                  </span>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lớp (đối với Học sinh):
                </label>
                <select
                  value={authorClass}
                  onChange={(e) => setAuthorClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                >
                  {['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'].map(cls => (
                    <option key={cls} value={cls}>Lớp {cls}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu đề bài viết / tài liệu: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                category === 'study_corner' ? "Ví dụ: Sơ đồ tư duy & Tóm tắt Định luật bảo toàn khối lượng..." :
                category === 'prep_guide' ? "Ví dụ: Hướng dẫn soạn bài & trả lời câu hỏi bài Áp suất chất lỏng..." :
                category === 'digital_products' ? "Ví dụ: Video mô phỏng phản ứng cháy của Magie trong khí Oxygen..." :
                "Nhập tiêu đề học liệu..."
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>

          {/* Subject & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phân môn KHTN:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
              >
                <option value="physics">Vật lí</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Khối lớp:
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
              >
                <option value={6}>Khối 6</option>
                <option value={7}>Khối 7</option>
                <option value={8}>Khối 8</option>
                <option value={9}>Khối 9</option>
              </select>
            </div>
          </div>

          {/* Attachment Section: File OR Link (NOT requiring both) */}
          <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Laptop className="w-4 h-4 text-blue-600" />
                HỌC LIỆU / TÀI LIỆU ĐÍNH KÈM (KHÔNG BẮT BUỘC CẢ HAI)
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Tệp tải lên HOẶC Đường link trực tuyến
              </span>
            </div>

            {/* Explanatory Notice */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Lưu ý về hình thức đính kèm:</p>
                <p className="text-[11px] text-blue-800 font-normal leading-relaxed">
                  • <strong>Cách 1:</strong> Chỉ cần tải tệp từ máy (Word, Ảnh, PPT, Video ngắn, PDF) — <em>không cần dán link</em>.<br />
                  • <strong>Cách 2:</strong> Hoặc chỉ dán đường link (Google Drive, Canva, YouTube, v.v.) — <em>không cần tải tệp</em>.<br />
                  • <strong>Cách 3:</strong> Hoặc chỉ cần viết nội dung tóm tắt lý thuyết ở ô văn bản bên dưới.
                </p>
              </div>
            </div>

            {/* File attachment section */}
            {isFileSupportedCategory && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                    <span>1. Đính kèm Tệp từ thiết bị (Word, Ảnh, PPT, Video, PDF):</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Tùy chọn</span>
                </div>

                {/* Type pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'word', label: 'Word (.doc/.docx)', icon: FileText },
                    { id: 'image', label: 'Ảnh (.png/.jpg)', icon: ImageIcon },
                    { id: 'ppt', label: 'PowerPoint (.pptx)', icon: Laptop },
                    { id: 'video', label: 'Video ngắn (1-2p)', icon: Film },
                    { id: 'pdf', label: 'Tệp PDF (.pdf)', icon: FileCode },
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFileType(t.id as DigitalFileType)}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                          fileType === t.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* File upload input */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".doc,.docx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.m4v"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang đọc tệp...' : `Chọn tệp ${fileType.toUpperCase()} từ máy`}</span>
                    </button>

                    {fileName && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                        <span className="text-emerald-800 font-bold text-[11px]">
                          ✓ {fileName} ({fileSize})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFileName('');
                            setFileSize('');
                            setFileData('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-black ml-1 cursor-pointer"
                          title="Hủy tệp này"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {fileType === 'video' && (
                    <div className="text-[11px] text-purple-800 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      ⏱ Thời lượng: {videoDuration}s
                    </div>
                  )}
                </div>

                {/* Preview image or video */}
                {fileData && fileType === 'image' && (
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Xem trước ảnh đính kèm:</span>
                    <img src={fileData} alt="Xem trước" className="max-h-40 rounded-xl border border-slate-300 object-contain bg-white shadow-xs" />
                  </div>
                )}

                {fileData && fileType === 'video' && (
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Xem trước video ngắn:</span>
                    <video src={fileData} controls className="max-h-40 rounded-xl border border-slate-300 bg-black shadow-xs" />
                  </div>
                )}
              </div>
            )}

            {/* Link URL (especially for digital_tools or cloud drive files) */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="block font-bold text-slate-700 text-xs">
                  {category === 'digital_tools' 
                    ? '2. Đường dẫn liên kết Công cụ số / Thí nghiệm ảo (URL):' 
                    : '2. Hoặc Dán liên kết trực tuyến (Google Drive / Canva / YouTube - Tùy chọn):'}
                </label>
                <span className="text-[10px] text-slate-500 italic">
                  Không bắt buộc nếu đã tải tệp
                </span>
              </div>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="https://drive.google.com/... hoặc dán link bất kỳ"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mô tả tóm tắt nội dung: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tóm tắt nội dung chính, mục tiêu bài học, ý nghĩa thực tiễn hoặc hướng dẫn sử dụng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Detailed Document Content (Optional) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội dung văn bản chi tiết / Hướng dẫn học tập (Tùy chọn):
            </label>
            <textarea
              rows={3}
              placeholder="Nhập nội dung tóm lược lý thuyết, các câu hỏi chuẩn bị bài hoặc lưu ý khi thực hiện..."
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 resize-none font-medium leading-relaxed"
            />
          </div>

          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Footer buttons */}
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
              disabled={isUploading}
              className={`px-5 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 ${
                isDigitalProduct ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi' : (category === 'study_corner' ? 'Gửi Bài Góc Học Tập' : category === 'prep_guide' ? 'Gửi Bài Soạn' : category === 'digital_products' ? 'Gửi Sản Phẩm Số' : 'Đăng Bài Viết')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
