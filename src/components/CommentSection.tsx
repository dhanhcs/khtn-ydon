import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  X, 
  User, 
  ShieldCheck, 
  Clock, 
  Maximize2 
} from 'lucide-react';
import { PostComment, UserSession } from '../types';

interface CommentSectionProps {
  comments?: PostComment[];
  onAddComment: (comment: PostComment) => void;
  currentUser: UserSession | null;
  onRequireLogin?: () => void;
  targetTitle?: string;
}

export function CommentSection({
  comments = [],
  onAddComment,
  currentUser,
  targetTitle
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestClass, setGuestClass] = useState('8A1');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Dung lượng ảnh tối đa là 5MB');
        return;
      }
      setErrorMsg('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !attachedImage) {
      setErrorMsg('Vui lòng nhập nội dung bình luận hoặc gửi kèm ảnh.');
      return;
    }

    let author = currentUser?.name || guestName.trim() || 'Học sinh Y Đôn';
    let authorRole: 'student' | 'admin' | 'guest' = currentUser?.role || 'student';
    let authorClass = currentUser?.className || (authorRole === 'student' ? guestClass : undefined);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const newComment: PostComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: author,
      authorRole,
      authorClass,
      authorSubject: currentUser?.adminSubject === 'all' ? undefined : currentUser?.adminSubject,
      content: commentText.trim(),
      imageUrl: attachedImage || undefined,
      createdAt: timeStr
    };

    onAddComment(newComment);
    setCommentText('');
    setAttachedImage(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Bình luận & Thảo luận ({comments.length})</span>
        </h4>
        <span className="text-[11px] text-slate-500">
          Học sinh có thể hỏi đáp và gửi ảnh bài làm / minh chứng
        </span>
      </div>

      {/* Input box */}
      <form onSubmit={handleSendComment} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
        {/* If guest, allow quick name & class entry */}
        {!currentUser && (
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Tên của bạn:
            </span>
            <input
              type="text"
              placeholder="Nhập họ và tên..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 font-medium"
            />
            <span className="text-slate-600 font-bold">Lớp:</span>
            <select
              value={guestClass}
              onChange={(e) => setGuestClass(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 font-medium"
            >
              {['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        )}

        {currentUser && (
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              {currentUser.role === 'admin' ? (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Giáo viên: {currentUser.adminName || currentUser.name}
                </span>
              ) : currentUser.role === 'guest' ? (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Khách tham quan: {currentUser.name} (Chỉ xem)
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Học sinh: {currentUser.name} ({currentUser.className || 'Lớp KHTN'})
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {currentUser.role === 'guest' ? 'Chế độ chỉ xem' : 'Đăng bình luận với tư cách trên'}
            </span>
          </div>
        )}

        {currentUser?.role === 'guest' ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            ⚠️ Bạn đang ở chế độ <strong>Khách (chỉ xem)</strong> do chưa thuộc danh sách HS trường Y Đôn nên không thể gửi bình luận tương tác.
          </div>
        ) : (
          <>
            <div className="relative">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Viết bình luận, đặt câu hỏi thắc mắc hoặc gửi ảnh minh chứng${targetTitle ? ` cho "${targetTitle}"` : ''}...`}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 placeholder-slate-400 resize-none font-normal leading-relaxed"
          />
        </div>

        {/* Attached image preview */}
        {attachedImage && (
          <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden bg-white p-1 shadow-xs">
            <img 
              src={attachedImage} 
              alt="Ảnh đính kèm bình luận" 
              className="h-20 w-auto object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
              title="Xóa ảnh"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="text-rose-600 text-[11px] font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="comment-image-upload-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đính kèm ảnh bài làm, sơ đồ, minh họa"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Gửi kèm ảnh</span>
            </button>
            {attachedImage && (
              <span className="text-[10px] text-emerald-600 font-bold">
                ✓ Đã chọn ảnh
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi bình luận</span>
          </button>
        </div>
        </>
        )}
      </form>

      {/* List of comments */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-5 text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc gửi ảnh phản hồi!
          </div>
        ) : (
          comments.map((cmt) => (
            <div 
              key={cmt.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    cmt.authorRole === 'admin' 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {cmt.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-xs text-slate-900">
                      {cmt.authorName}
                    </span>
                    {cmt.authorRole === 'admin' ? (
                      <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold">
                        Giáo viên {cmt.authorSubject ? `(Bộ môn ${cmt.authorSubject === 'physics' ? 'Vật lí' : cmt.authorSubject === 'chemistry' ? 'Hóa học' : 'Sinh học'})` : ''}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold">
                        {cmt.authorClass || 'Học sinh'}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {cmt.createdAt}
                </span>
              </div>

              {/* Text content */}
              {cmt.content && (
                <p className="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-line">
                  {cmt.content}
                </p>
              )}

              {/* Attached image if any */}
              {cmt.imageUrl && (
                <div className="pl-8 pt-1">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                       onClick={() => setPreviewModalImage(cmt.imageUrl || null)}>
                    <img 
                      src={cmt.imageUrl} 
                      alt="Ảnh đính kèm bình luận" 
                      className="max-h-48 rounded-lg object-contain bg-slate-50"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>Xem phóng to</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox / Image Preview Modal */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 p-2 rounded-2xl border border-slate-700"
               onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-900 rounded-full p-1.5 shadow-xl hover:bg-slate-200 cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={previewModalImage} 
              alt="Ảnh phóng to" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
