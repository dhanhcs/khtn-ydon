import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  X,
  MessageSquare,
  Send,
  Paperclip,
  Trash2,
  User,
  Users,
  CheckCircle2,
} from 'lucide-react';
import mammoth from 'mammoth';
import { FileAttachment, AnnouncementComment, MediaActivityLog } from '../types';
import {
  processUploadedFile,
  downloadAttachmentFile,
  getCommentsForTarget,
  addCommentForTarget,
  deleteCommentForTarget,
  getMediaActivityLog,
  recordMediaView,
  recordMediaDownload,
  clearMediaActivityLog,
} from '../utils/examStorage';
import { resolveAttachmentDataUrl } from '../utils/cloudPersistence';
import { getActiveStudentRoster, verifyStudentInRoster } from '../utils/studentRoster';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

/**
 * Displays the list of official students from the roster who automatically interacted:
 * - Đã xem (Viewed)
 * - Đã viết bài / nộp bài (Wrote post / comment / submitted work)
 * - Đã tải (Downloaded)
 */
export const ItemActivityLogBar: React.FC<{
  targetId: string;
  label?: string;
  compact?: boolean;
}> = ({ targetId, label, compact = false }) => {
  const { userProfile, currentUser, isAdmin, isTeacher } = useAuth();
  const [log, setLog] = useState<MediaActivityLog>(() => getMediaActivityLog(targetId));
  const [showDetailModal, setShowDetailModal] = useState(false);

  const actorName = userProfile?.fullName || currentUser?.displayName || '';
  const actorClass = userProfile?.enrolledClass || '';
  const actorRole = userProfile?.role || (isAdmin ? 'admin' : isTeacher ? 'teacher' : 'guest');

  // Automatically record view whenever an official student in the roster (or Admin/Teacher) views this item
  useEffect(() => {
    if (!targetId) return;
    if (actorName || isAdmin || isTeacher) {
      const updated = recordMediaView(targetId, {
        userName: actorName,
        userClass: actorClass,
        userRole: actorRole,
      });
      setLog(updated);
    } else {
      setLog(getMediaActivityLog(targetId));
    }
  }, [targetId, actorName, actorClass, actorRole, isAdmin, isTeacher]);

  useEffect(() => {
    const refresh = () => setLog(getMediaActivityLog(targetId));
    window.addEventListener('ndh-media-activity-updated', refresh);
    window.addEventListener('ndh-comments-updated', refresh);
    window.addEventListener('ndh-hw-submissions-updated', refresh);
    window.addEventListener('ndh-quiz-submissions-updated', refresh);
    window.addEventListener('ndh-roster-updated', refresh);
    return () => {
      window.removeEventListener('ndh-media-activity-updated', refresh);
      window.removeEventListener('ndh-comments-updated', refresh);
      window.removeEventListener('ndh-hw-submissions-updated', refresh);
      window.removeEventListener('ndh-quiz-submissions-updated', refresh);
      window.removeEventListener('ndh-roster-updated', refresh);
    };
  }, [targetId]);

  const formatEntryName = (e: { userName: string; userClass?: string }) =>
    e.userClass && e.userClass !== 'Quản trị' && e.userClass !== 'Giáo viên'
      ? `${e.userName} (${e.userClass})`
      : e.userName;

  const views = log.views || [];
  const writes = log.writes || [];
  const downloads = log.downloads || [];
  const totalInteractions = views.length + writes.length + downloads.length;

  return (
    <>
      <div
        className={`rounded-xl border border-slate-200 bg-slate-50/90 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2.5 text-xs'
        }`}
      >
        <div className="space-y-1 min-w-0 flex-1">
          {label && (
            <div className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
              {label}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {/* Views list (Tự động) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Eye className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="font-bold text-slate-800 shrink-0">
                Đã xem ({views.length}):
              </span>
              {views.length === 0 ? (
                <span className="text-slate-400 italic">Chưa có HS xem</span>
              ) : (
                <span className="text-cyan-900 font-semibold truncate max-w-[240px] sm:max-w-[360px]">
                  {views.slice(0, 5).map(formatEntryName).join(', ')}
                  {views.length > 5 ? ` (+${views.length - 5} HS khác)` : ''}
                </span>
              )}
            </div>

            {/* Writes / Submissions / Comments list (Tự động) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-800 shrink-0">
                Đã viết bài ({writes.length}):
              </span>
              {writes.length === 0 ? (
                <span className="text-slate-400 italic">Chưa có HS viết bài</span>
              ) : (
                <span className="text-indigo-900 font-semibold truncate max-w-[240px] sm:max-w-[360px]">
                  {writes.slice(0, 5).map(formatEntryName).join(', ')}
                  {writes.length > 5 ? ` (+${writes.length - 5} HS khác)` : ''}
                </span>
              )}
            </div>

            {/* Downloads list (Tự động) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800 shrink-0">
                Đã tải ({downloads.length}):
              </span>
              {downloads.length === 0 ? (
                <span className="text-slate-400 italic">Chưa có HS tải</span>
              ) : (
                <span className="text-emerald-900 font-semibold truncate max-w-[240px] sm:max-w-[360px]">
                  {downloads.slice(0, 5).map(formatEntryName).join(', ')}
                  {downloads.length > 5 ? ` (+${downloads.length - 5} HS khác)` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {totalInteractions > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
            >
              <Users className="w-3 h-3 text-indigo-600" />
              <span>Chi tiết HS tương tác</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal showing full list of Roster-Verified Viewers, Writers, and Downloaders */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 max-h-[88vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <span>Danh Sách Học Sinh Tương Tác (Tự Động • Đúng Danh Sách Lớp)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hệ thống tự động đối chiếu và chỉ hiển thị tên học sinh chính thức có trong danh sách lớp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Viewers Column */}
              <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200 space-y-2">
                <div className="font-extrabold text-cyan-900 flex items-center justify-between border-b border-cyan-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-cyan-600" />
                    Đã xem ({views.length})
                  </span>
                </div>
                {views.length === 0 ? (
                  <p className="text-slate-400 italic py-3">Chưa có học sinh xem mục này.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {views.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white border border-cyan-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{v.userName}</div>
                          {v.userClass && (
                            <div className="text-[10px] font-semibold text-cyan-700">
                              Lớp: {v.userClass}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {v.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Writers / Submitters Column */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="font-extrabold text-indigo-900 flex items-center justify-between border-b border-indigo-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    Đã viết bài / nộp bài ({writes.length})
                  </span>
                </div>
                {writes.length === 0 ? (
                  <p className="text-slate-400 italic py-3">Chưa có học sinh viết/nộp bài.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {writes.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white border border-indigo-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{w.userName}</div>
                          {w.userClass && (
                            <div className="text-[10px] font-semibold text-indigo-700">
                              Lớp: {w.userClass}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {w.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Downloaders Column */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="font-extrabold text-emerald-900 flex items-center justify-between border-b border-emerald-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    Đã tải ({downloads.length})
                  </span>
                </div>
                {downloads.length === 0 ? (
                  <p className="text-slate-400 italic py-3">Chưa có học sinh tải tệp này.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {downloads.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white border border-emerald-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{d.userName}</div>
                          {d.userClass && (
                            <div className="text-[10px] font-semibold text-emerald-700">
                              Lớp: {d.userClass}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {d.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {isAdmin || isTeacher ? (
                <button
                  type="button"
                  onClick={() => {
                    clearMediaActivityLog(targetId);
                    setShowDetailModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs cursor-pointer"
                >
                  Xóa lịch sử xem/tải mục này
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Helper component that renders the content of a single FileAttachment (Word, PDF, or Image)
 * directly inside the app (either inline on the assignment card or inside the full-screen modal).
 */
const AttachmentContentRenderer: React.FC<{
  attachment: FileAttachment;
  isModal?: boolean;
  onExpandModal?: () => void;
}> = ({ attachment, isModal = false, onExpandModal }) => {
  const [resolvedDataUrl, setResolvedDataUrl] = useState<string>(() =>
    attachment.dataUrl && !attachment.dataUrl.startsWith('__idb_att__:')
      ? attachment.dataUrl
      : ''
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [dynamicHtml, setDynamicHtml] = useState<string>(attachment.extractedHtml || '');
  const [dynamicText, setDynamicText] = useState<string>(attachment.extractedText || '');

  useEffect(() => {
    let active = true;
    resolveAttachmentDataUrl(attachment).then((url) => {
      if (active && url) {
        setResolvedDataUrl(url);
      }
    });
    return () => {
      active = false;
    };
  }, [attachment]);

  useEffect(() => {
    setDynamicHtml(attachment.extractedHtml || '');
    setDynamicText(attachment.extractedText || '');

    // If Word (.docx) has base64 dataUrl but no extractedHtml yet, decode it dynamically so it views directly in-app
    if (
      attachment.type === 'word' &&
      !attachment.extractedHtml &&
      resolvedDataUrl &&
      resolvedDataUrl.includes(';base64,') &&
      attachment.name.toLowerCase().endsWith('.docx')
    ) {
      try {
        const base64Part = resolvedDataUrl.split(';base64,')[1] || '';
        const binaryStr = atob(base64Part);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        mammoth
          .convertToHtml({ arrayBuffer })
          .then((res) => {
            if (res.value) setDynamicHtml(res.value);
          })
          .catch(() => {});
        if (!attachment.extractedText) {
          mammoth
            .extractRawText({ arrayBuffer })
            .then((res) => {
              if (res.value) setDynamicText(res.value);
            })
            .catch(() => {});
        }
      } catch {}
    }
  }, [attachment, resolvedDataUrl]);

  useEffect(() => {
    if (attachment.type !== 'pdf' || !resolvedDataUrl) {
      setPdfBlobUrl(null);
      return;
    }

    let createdUrl: string | null = null;
    try {
      if (resolvedDataUrl.startsWith('data:')) {
        const parts = resolvedDataUrl.split(',');
        const byteString = atob(parts[1] || '');
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'application/pdf' });
        createdUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdUrl);
      } else {
        setPdfBlobUrl(resolvedDataUrl);
      }
    } catch {
      setPdfBlobUrl(resolvedDataUrl);
    }

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [attachment.type, resolvedDataUrl]);

  if (attachment.type === 'image') {
    return (
      <div className="bg-slate-900/5 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
        {resolvedDataUrl ? (
          <img
            src={resolvedDataUrl}
            alt={attachment.name}
            onClick={onExpandModal}
            className={`max-w-full object-contain rounded-lg shadow-xs border border-slate-200 bg-white ${
              isModal ? 'max-h-[75vh]' : 'max-h-[460px] cursor-zoom-in'
            }`}
          />
        ) : (
          <div className="py-8 text-xs text-slate-500">Đang tải hình ảnh đính kèm...</div>
        )}
      </div>
    );
  }

  if (attachment.type === 'pdf' && pdfBlobUrl) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
        <iframe
          src={pdfBlobUrl}
          title={attachment.name}
          className={`w-full bg-white ${isModal ? 'h-[75vh]' : 'h-[480px]'}`}
        />
      </div>
    );
  }

  // Word or Text / Document direct viewer
  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 ${
        isModal ? 'max-w-3xl mx-auto' : 'max-h-[420px] overflow-y-auto'
      }`}
    >
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] uppercase shrink-0">
            {attachment.type === 'pdf' ? 'PDF' : 'WORD'}
          </span>
          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
            {attachment.name}
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">
          Xem trực tiếp trên ứng dụng
        </span>
      </div>

      {dynamicHtml ? (
        <div
          className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:p-2"
          dangerouslySetInnerHTML={{ __html: dynamicHtml }}
        />
      ) : (
        <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
          {dynamicText ||
            `Tệp tài liệu "${attachment.name}" đã được đính kèm.\n\nBấm nút "Tải về" để mở toàn bộ định dạng gốc trên máy tính hoặc điện thoại.`}
        </div>
      )}
    </div>
  );
};

export const AttachmentList: React.FC<{
  attachments?: FileAttachment[];
  onRemove?: (id: string) => void;
  compact?: boolean;
  showInlinePreview?: boolean;
  parentTargetId?: string;
}> = ({ attachments, onRemove, compact = false, showInlinePreview, parentTargetId }) => {
  const { userProfile, currentUser, isAdmin } = useAuth();
  const shouldShowInlineByDefault = showInlinePreview ?? !compact;
  const [previewAttachment, setPreviewAttachment] = useState<FileAttachment | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  if (!attachments || attachments.length === 0) return null;

  const actor = {
    userName:
      userProfile?.fullName ||
      currentUser?.displayName ||
      (isAdmin ? 'Thầy Nguyễn Đình Hành (QTV)' : 'Học sinh / Khách'),
    userClass: userProfile?.enrolledClass || (isAdmin ? 'Quản trị' : undefined),
    userRole: userProfile?.role || (isAdmin ? 'admin' : 'guest'),
  };

  const trackView = (attId: string) => {
    recordMediaView(`att-${attId}`, actor);
    if (parentTargetId) {
      recordMediaView(parentTargetId, actor);
    }
  };

  const toggleInline = (id: string) => {
    const currentlyCollapsed = collapsedIds[id] ?? !shouldShowInlineByDefault;
    if (currentlyCollapsed) {
      trackView(id);
    }
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !currentlyCollapsed,
    }));
  };

  return (
    <>
      <div className="space-y-3 mt-2">
        <div className="flex flex-wrap gap-2.5">
          {attachments.map((att) => {
            const isImg = att.type === 'image';
            const isWord = att.type === 'word';
            const isPdf = att.type === 'pdf';
            const isInlineCollapsed = collapsedIds[att.id] ?? !shouldShowInlineByDefault;

            return (
              <div
                key={att.id}
                className="w-full space-y-2"
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl border shadow-2xs transition ${
                    compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2.5 text-xs'
                  } ${
                    isImg
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                      : isWord
                      ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                      : isPdf
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isImg && att.dataUrl && !att.dataUrl.startsWith('__idb_att__:') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        onClick={() => {
                          trackView(att.id);
                          setPreviewAttachment(att);
                        }}
                        className="w-9 h-9 rounded-lg object-cover border border-emerald-300 cursor-pointer shrink-0"
                      />
                    ) : isImg ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                        ẢNH
                      </div>
                    ) : isWord ? (
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                        WORD
                      </div>
                    ) : isPdf ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                        PDF
                      </div>
                    ) : (
                      <FileText className="w-5 h-5 text-slate-600 shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div className="font-bold truncate max-w-[200px] sm:max-w-[360px]" title={att.name}>
                        {att.name}
                      </div>
                      <div className="text-[10px] opacity-75 flex items-center gap-1.5">
                        <span className="uppercase font-semibold">
                          {isWord
                            ? 'File Word (.docx/.doc)'
                            : isPdf
                            ? 'File PDF (.pdf)'
                            : isImg
                            ? 'File Ảnh (.jpg/.png)'
                            : 'Tài liệu'}
                        </span>
                        {att.sizeLabel && <span>• {att.sizeLabel}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleInline(att.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-slate-300 shadow-2xs flex items-center gap-1 cursor-pointer transition"
                      title={
                        isInlineCollapsed
                          ? 'Hiện nội dung bài trực tiếp trên trang'
                          : 'Thu gọn khung xem trực tiếp'
                      }
                    >
                      {isInlineCollapsed ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Xem trực tiếp</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Thu gọn</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        trackView(att.id);
                        setPreviewAttachment(att);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer transition"
                      title="Phóng to xem toàn màn hình"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Phóng to</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadAttachmentFile(att, parentTargetId)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer transition"
                      title="Tải file về máy"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>

                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(att.id)}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer transition"
                        title="Xóa tệp đính kèm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Direct Viewer right inside the App */}
                {!isInlineCollapsed && (
                  <div
                    className="animate-in fade-in duration-150"
                    onClick={() => trackView(att.id)}
                  >
                    <AttachmentContentRenderer
                      attachment={att}
                      isModal={false}
                      onExpandModal={() => {
                        trackView(att.id);
                        setPreviewAttachment(att);
                      }}
                    />
                  </div>
                )}

                {/* Display Names of Viewers and Downloaders for this Attachment */}
                <ItemActivityLogBar targetId={`att-${att.id}`} compact />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Modal for Word, PDF, or Image Content */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {previewAttachment.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <span className="font-bold text-xs sm:text-sm truncate">
                  Xem trực tiếp: {previewAttachment.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadAttachmentFile(previewAttachment)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-100">
              <AttachmentContentRenderer attachment={previewAttachment} isModal={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const InteractiveCommentSection: React.FC<{
  targetId: string;
  title?: string;
  placeholder?: string;
  initialComments?: AnnouncementComment[];
}> = ({
  targetId,
  title = 'Bình luận & Trao đổi học tập (Hỗ trợ gửi file Word, PDF, Ảnh)',
  placeholder = 'Nhập nội dung bình luận, câu hỏi hoặc lời giải... (Có thể đính kèm file Word, PDF hoặc Ảnh)',
  initialComments = [],
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { showToast } = useApp();

  const [comments, setComments] = useState<AnnouncementComment[]>(() => {
    const stored = getCommentsForTarget(targetId);
    return stored.length > 0 ? stored : initialComments;
  });
  const [text, setText] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState(
    userProfile?.fullName || currentUser?.displayName || ''
  );
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile?.fullName) {
      setAuthorNameInput(userProfile.fullName);
    }
  }, [userProfile]);

  useEffect(() => {
    const refresh = () => {
      const stored = getCommentsForTarget(targetId);
      if (stored.length > 0) setComments(stored);
    };
    window.addEventListener('ndh-comments-updated', refresh);
    return () => window.removeEventListener('ndh-comments-updated', refresh);
  }, [targetId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const processed: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const att = await processUploadedFile(files[i]);
        processed.push(att);
      }
      setAttachments((prev) => [...prev, ...processed]);
      showToast(`Đã đính kèm ${processed.length} tệp (Word/PDF/Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) {
      showToast('Vui lòng nhập nội dung bình luận hoặc đính kèm file Word / PDF / Ảnh.', 'error');
      return;
    }

    let resolvedAuthorName = '';
    let resolvedAuthorClass = userProfile?.enrolledClass || '';

    if (isAdmin) {
      resolvedAuthorName = 'Thầy Nguyễn Đình Hành (Quản trị)';
      resolvedAuthorClass = 'Quản trị';
    } else {
      const candidateName = (
        userProfile?.fullName ||
        authorNameInput.trim() ||
        currentUser?.displayName ||
        ''
      )
        .replace(/\(.*?\)/g, '')
        .trim();

      const roster = getActiveStudentRoster();
      if (roster.length > 0) {
        const check = verifyStudentInRoster(candidateName, resolvedAuthorClass || undefined, roster);
        if (!check.isMatch || !check.matchedStudent) {
          showToast(
            'Chỉ học sinh có tên trong Danh sách lớp mới được viết bài / bình luận. Vui lòng đăng nhập tài khoản học sinh hoặc nhập đúng Họ và tên trong danh sách lớp!',
            'error'
          );
          return;
        }
        resolvedAuthorName = check.matchedStudent.fullName;
        resolvedAuthorClass = check.matchedStudent.enrolledClass;
      } else if (!candidateName) {
        showToast('Vui lòng đăng nhập tài khoản học sinh trước khi viết bình luận!', 'error');
        return;
      } else {
        resolvedAuthorName = candidateName;
      }
    }

    const next = addCommentForTarget(targetId, {
      authorId: currentUser?.uid || 'student',
      authorName: resolvedAuthorName,
      authorRole: isAdmin ? 'admin' : userProfile?.role || 'student',
      authorClass: resolvedAuthorClass,
      content: text.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setComments(next);
    setText('');
    setAttachments([]);
    showToast('Đã gửi bài viết / bình luận thành công!', 'success');
  };

  const handleDelete = (commentId?: string) => {
    if (!commentId) return;
    const next = deleteCommentForTarget(targetId, commentId);
    setComments(next);
    showToast('Đã xóa bình luận.', 'info');
  };

  return (
    <div className="pt-3 border-t border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
          <MessageSquare className="w-4 h-4 text-cyan-600" />
          <span>
            {title} ({comments.length})
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Hỗ trợ đính kèm Word (.doc, .docx), PDF (.pdf) & Ảnh (.jpg, .png)
        </span>
      </div>

      {/* Existing Comments List */}
      {comments.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {comments.map((c) => {
            const isTeacherComment =
              c.authorRole === 'admin' ||
              c.authorName.toLowerCase().includes('thầy') ||
              c.authorName.toLowerCase().includes('quản trị');
            return (
              <div
                key={c.id}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                  isTeacherComment
                    ? 'bg-cyan-50/70 border-cyan-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`font-extrabold flex items-center gap-1 ${
                        isTeacherComment ? 'text-cyan-900' : 'text-slate-900'
                      }`}
                    >
                      <User className="w-3 h-3 text-cyan-600" />
                      {c.authorName}
                      {c.authorClass && !isTeacherComment && !c.authorName.includes('(')
                        ? ` (${c.authorClass})`
                        : ''}
                    </span>
                    {isTeacherComment && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold">
                        Giáo viên Quản trị
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                  </div>
                  {c.content && (
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  )}
                  {c.attachments && c.attachments.length > 0 && (
                    <AttachmentList attachments={c.attachments} compact showInlinePreview />
                  )}
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                    title="Xóa bình luận (QTV)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSend} className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        {!isAdmin && !userProfile?.fullName && (
          <div>
            <input
              type="text"
              placeholder="Họ tên học sinh và Lớp (VD: Nguyễn Văn An - H8.1)..."
              value={authorNameInput}
              onChange={(e) => setAuthorNameInput(e.target.value)}
              className="w-full sm:w-72 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
              title="Đính kèm file Word (.doc, .docx), PDF (.pdf) hoặc Ảnh (.jpg, .png)"
            >
              <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
              <span>{uploading ? 'Đang tải...' : 'Đính kèm Word / PDF / Ảnh'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".doc,.docx,image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi bình luận</span>
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <AttachmentList
            attachments={attachments}
            onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
            compact
          />
        )}
      </form>
    </div>
  );
};
