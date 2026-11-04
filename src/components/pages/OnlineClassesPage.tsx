import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  PlusCircle,
  Edit,
  Trash2,
  Link2,
  Copy,
  CheckCircle2,
  Lock,
  Unlock,
  Upload,
  Play,
  X,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  OnlineClassSessionItem,
  OnlineMeetingLink,
  FileAttachment,
} from '../../types';
import {
  getStoredOnlineSessions,
  saveOnlineSessionItem,
  deleteOnlineSessionItem,
  processUploadedFile,
  recordMediaView,
} from '../../utils/examStorage';
import {
  AttachmentList,
  InteractiveCommentSection,
  ItemActivityLogBar,
} from '../AttachmentAndCommentSection';

export const OnlineClassesPage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { userProfile, currentUser, isAdmin, isTeacher, loginAdminMaster } = useAuth();
  const canManage = isAdmin || isTeacher;

  const [sessions, setSessions] = useState<OnlineClassSessionItem[]>(() =>
    getStoredOnlineSessions()
  );
  const [filterClass, setFilterClass] = useState<string>('all');
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  // Student "Vào học" Modal Window State (Shows the Teacher's posted meeting link)
  const [activeJoinSession, setActiveJoinSession] =
    useState<OnlineClassSessionItem | null>(null);

  // Admin Create / Edit Session Announcement Modal State
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [classGroupInput, setClassGroupInput] = useState<string>('Tất cả các lớp');
  const [openTimeInput, setOpenTimeInput] = useState<string>('');
  const [contentInput, setContentInput] = useState<string>('');
  const [primaryUrlInput, setPrimaryUrlInput] = useState<string>('');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<'open' | 'scheduled' | 'closed'>('open');
  const [extraLinksInput, setExtraLinksInput] = useState<OnlineMeetingLink[]>([]);
  const [newExtraLabel, setNewExtraLabel] = useState<string>('');
  const [newExtraUrl, setNewExtraUrl] = useState<string>('');
  const [newExtraRoomCode, setNewExtraRoomCode] = useState<string>('');
  const [attachmentsInput, setAttachmentsInput] = useState<FileAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [adminQuickPass, setAdminQuickPass] = useState<string>('');
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
      const latest = getStoredOnlineSessions();
      setSessions(latest);
      setActiveJoinSession((prev) => {
        if (!prev) return null;
        return latest.find((s) => s.id === prev.id) || null;
      });
    };
    window.addEventListener('ndh-online-sessions-updated', refresh);
    return () => window.removeEventListener('ndh-online-sessions-updated', refresh);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (filterClass === 'all') return true;
    return s.classGroup === 'Tất cả các lớp' || s.classGroup === filterClass;
  });

  // When Student clicks "Vào học" -> Record attendance & display the popup window with Teacher's posted link
  const handleStudentClickJoinClass = (session: OnlineClassSessionItem) => {
    recordMediaView(`online-${session.id}`, actor);
    setActiveJoinSession(session);
  };

  const handleCopyLink = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      showToast('Đã sao chép đường link vào phòng học!', 'success');
    } catch {
      showToast('Đường link: ' + url, 'info');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitleInput('');
    setClassGroupInput('Tất cả các lớp');
    setOpenTimeInput(
      `Mở phòng lúc 19h00 - Học 19h15 đến 20h45 (${new Date().toLocaleDateString('vi-VN')})`
    );
    setContentInput('');
    setPrimaryUrlInput('https://meet.google.com/');
    setRoomCodeInput('');
    setPasscodeInput('');
    setStatusInput('open');
    setExtraLinksInput([]);
    setNewExtraLabel('');
    setNewExtraUrl('');
    setNewExtraRoomCode('');
    setAttachmentsInput([]);
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (session: OnlineClassSessionItem) => {
    setEditingId(session.id);
    setTitleInput(session.title);
    setClassGroupInput(session.classGroup);
    setOpenTimeInput(session.openTimeText);
    setContentInput(session.announcementContent);
    setPrimaryUrlInput(session.primaryMeetingUrl);
    setRoomCodeInput(session.roomCode || '');
    setPasscodeInput(session.passcode || '');
    setStatusInput(session.status);
    setExtraLinksInput(session.meetingLinks || []);
    setNewExtraLabel('');
    setNewExtraUrl('');
    setNewExtraRoomCode('');
    setAttachmentsInput(session.attachments || []);
    setShowEditorModal(true);
  };

  const handleAddExtraLinkToForm = () => {
    if (!newExtraUrl.trim()) {
      showToast('Vui lòng dán đường link phòng học!', 'error');
      return;
    }
    const newLink: OnlineMeetingLink = {
      id: `ml-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: newExtraLabel.trim() || `Link vào phòng học #${extraLinksInput.length + 1}`,
      url: newExtraUrl.trim(),
      roomCode: newExtraRoomCode.trim() || undefined,
    };
    setExtraLinksInput((prev) => [...prev, newLink]);
    setNewExtraLabel('');
    setNewExtraUrl('');
    setNewExtraRoomCode('');
    showToast('Đã thêm link phòng học vào bài thông báo!', 'success');
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
      showToast(`Đã tải lên ${uploaded.length} tệp (Word / PDF / Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      const ok = loginAdminMaster(adminQuickPass.trim(), 'admin');
      if (!ok) {
        showToast('Mật khẩu Quản trị viên chưa đúng (Mặc định: Hanh1962@)', 'error');
        return;
      }
    }
    if (!titleInput.trim()) {
      showToast('Vui lòng nhập tiêu đề thông báo mở phòng học!', 'error');
      return;
    }
    if (!primaryUrlInput.trim() && extraLinksInput.length === 0 && !newExtraUrl.trim()) {
      showToast('Vui lòng dán đường link vào học để học sinh bấm "Vào học"!', 'error');
      return;
    }

    const finalExtraLinks = [...extraLinksInput];
    if (newExtraUrl.trim()) {
      finalExtraLinks.push({
        id: `ml-${Date.now()}`,
        label: newExtraLabel.trim() || 'Link vào học trực tuyến',
        url: newExtraUrl.trim(),
        roomCode: newExtraRoomCode.trim() || undefined,
      });
    }

    const mainUrl = primaryUrlInput.trim() || finalExtraLinks[0]?.url || 'https://meet.google.com/';

    const savedItem: OnlineClassSessionItem = {
      id: editingId || `online-${Date.now()}`,
      title: titleInput.trim(),
      classGroup: classGroupInput,
      openTimeText:
        openTimeInput.trim() || 'Đang mở phòng học trực tuyến — Học sinh vào lớp đúng giờ',
      announcementContent:
        contentInput.trim() ||
        'Các em học sinh bấm nút "Vào học" bên dưới để hiển thị đường link phòng học trực tuyến do Thầy Nguyễn Đình Hành đăng.',
      primaryMeetingUrl: mainUrl,
      roomCode: roomCodeInput.trim() || undefined,
      passcode: passcodeInput.trim() || undefined,
      meetingLinks:
        finalExtraLinks.length > 0
          ? finalExtraLinks
          : [
              {
                id: `ml-main-${Date.now()}`,
                label: 'Link Phòng Học Trực Tuyến Chính Thức',
                url: mainUrl,
                roomCode: roomCodeInput.trim() || undefined,
                passcode: passcodeInput.trim() || undefined,
              },
            ],
      attachments: attachmentsInput,
      status: statusInput,
      author: 'Thầy Nguyễn Đình Hành',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updated = saveOnlineSessionItem(savedItem);
    setSessions(updated);
    setShowEditorModal(false);
    showToast(
      editingId
        ? 'Đã cập nhật bài thông báo mở phòng học & link vào học!'
        : 'Đã đăng thông báo thời gian mở phòng học & link vào học thành công!',
      'success'
    );
  };

  const handleToggleRoomStatus = (session: OnlineClassSessionItem) => {
    const nextStatus: OnlineClassSessionItem['status'] =
      session.status === 'open' ? 'closed' : 'open';
    const updatedItem: OnlineClassSessionItem = {
      ...session,
      status: nextStatus,
    };
    const updated = saveOnlineSessionItem(updatedItem);
    setSessions(updated);
    showToast(
      nextStatus === 'open'
        ? `Đã MỞ phòng học: "${session.title}"`
        : `Đã TẠM ĐÓNG phòng học: "${session.title}"`,
      'info'
    );
  };

  const handleDeleteSession = (session: OnlineClassSessionItem) => {
    const updated = deleteOnlineSessionItem(session.id);
    setSessions(updated);
    if (activeJoinSession?.id === session.id) {
      setActiveJoinSession(null);
    }
    showToast(`Đã xóa bài thông báo phòng học: "${session.title}"`, 'info');
  };

  const handleDeleteMeetingLinkFromSession = (
    session: OnlineClassSessionItem,
    linkId: string
  ) => {
    const updatedLinks = (session.meetingLinks || []).filter((l) => l.id !== linkId);
    const updatedSession: OnlineClassSessionItem = {
      ...session,
      meetingLinks: updatedLinks,
    };
    const updated = saveOnlineSessionItem(updatedSession);
    setSessions(updated);
    if (activeJoinSession?.id === session.id) {
      setActiveJoinSession(updatedSession);
    }
    showToast('Đã xóa đường link khỏi phòng học.', 'info');
  };

  const latestOpenSession =
    sessions.find((s) => s.status === 'open') || sessions[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
            <Video className="w-3.5 h-3.5" />
            Mục số 7 trong Mê nu chính: Học trực tuyến
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Thông Báo Mở Phòng Học Trực Tuyến & Link Vào Học NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị viên đăng bài thông báo thời gian mở phòng học & gắn link phòng học. Học sinh bấm nút <strong>"Vào học"</strong> sẽ hiển thị ngay link vào học do Giáo viên đăng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Quản trị Viết Bài Thông Báo Mở Phòng & Đăng Link Vào Học</span>
          </button>
        </div>
      </div>

      {/* Live Classroom Highlight Banner */}
      {latestOpenSession && (
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-cyan-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-500/40">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>THÔNG BÁO MỞ PHÒNG HỌC TRỰC TUYẾN MỚI NHẤT ({latestOpenSession.classGroup})</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {latestOpenSession.title}
            </h3>
            <div className="text-xs sm:text-sm text-amber-200 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Thời gian mở phòng: {latestOpenSession.openTimeText}</span>
            </div>
            <p className="text-xs text-cyan-100 leading-relaxed line-clamp-2">
              {latestOpenSession.announcementContent}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleStudentClickJoinClass(latestOpenSession)}
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Vào học (Hiển thị Link GV đăng)</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Danh sách Bài thông báo mở phòng học trực tuyến ({filteredSessions.length} thông báo)</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Lọc theo lớp:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name} ({c.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements & Online Room Cards List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            Chưa có bài thông báo mở phòng học nào cho lớp này. Quản trị viên bấm nút "+ Quản trị Viết Bài Thông Báo Mở Phòng & Đăng Link Vào Học" để tạo mới.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isCommentsOpen = expandedCommentsId === session.id;
            const isOpen = session.status !== 'closed';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border-2 transition p-5 sm:p-6 space-y-4 ${
                  isOpen
                    ? 'border-blue-200 hover:border-blue-400 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 opacity-90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-black text-blue-700 uppercase">
                        Lớp: {session.classGroup}
                      </span>
                      <span className="text-slate-300">·</span>
                      {session.status === 'open' ? (
                        <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ĐANG MỞ PHÒNG HỌC
                        </span>
                      ) : session.status === 'scheduled' ? (
                        <span className="font-extrabold text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          SẮP MỞ THEO LỊCH
                        </span>
                      ) : (
                        <span className="font-extrabold text-rose-700 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          PHÒNG TẠM ĐÓNG
                        </span>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">
                        Ngày đăng: {session.createdAt} • {session.author}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {session.title}
                    </h3>

                    {/* Highlighted Opening Time Box */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Thời gian mở phòng học: {session.openTimeText}</span>
                    </div>

                    {/* Teacher's Announcement Post Content */}
                    <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {session.announcementContent}
                    </div>
                  </div>

                  {/* Primary Action Area: Student "Vào học" Button + Admin Controls */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-2 shrink-0">
                    {/* Nút "Vào học" dành cho Học sinh */}
                    <button
                      type="button"
                      onClick={() => handleStudentClickJoinClass(session)}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Vào học</span>
                    </button>

                    {/* Admin Management Buttons */}
                    {canManage && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleRoomStatus(session)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                            session.status === 'open'
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {session.status === 'open' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Đóng phòng</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở phòng</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(session)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa bài / Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa bài</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attached Lesson Files (Word, PDF, Image) if any */}
                {session.attachments && session.attachments.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider block mb-1.5">
                      Tài liệu buổi học trực tuyến đính kèm (Word, PDF, Ảnh):
                    </span>
                    <AttachmentList
                      attachments={session.attachments}
                      showInlinePreview={true}
                      parentTargetId={`online-${session.id}`}
                    />
                  </div>
                )}

                {/* Attendance / Viewer Tracker showing who clicked "Vào học" */}
                <ItemActivityLogBar
                  targetId={`online-${session.id}`}
                  label="Danh sách học sinh đã bấm 'Vào học' / Xem thông báo phòng học này:"
                />

                {/* Bottom Comment Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCommentsId(isCommentsOpen ? null : session.id)
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bình luận & Điểm danh buổi học</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStudentClickJoinClass(session)}
                    className="text-blue-700 hover:text-blue-600 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Bấm "Vào học" để hiển thị Link vào lớp →</span>
                  </button>
                </div>

                {isCommentsOpen && (
                  <InteractiveCommentSection
                    targetId={`online-cmt-${session.id}`}
                    title="Điểm danh & Trao đổi trong buổi học trực tuyến (Hỗ trợ gửi Word, PDF, Ảnh)"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Fixed Weekly Class Schedule Grid with quick "Vào học" button */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          Lịch Học Các Lớp Hóa Học THCS NĐH Trong Tuần
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map((c) => {
            const matchingSession =
              sessions.find((s) => s.classGroup === c.name) ||
              sessions.find((s) => s.classGroup === 'Tất cả các lớp') ||
              sessions[0];

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-blue-800 text-sm">Lớp {c.name}</span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {c.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{c.description}</p>
                  <div className="text-slate-600 font-semibold flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{c.schedule}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-emerald-700 font-bold text-[11px]">
                    Trực tuyến & Trực tiếp
                  </span>
                  {matchingSession && (
                    <button
                      type="button"
                      onClick={() => handleStudentClickJoinClass(matchingSession)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vào học</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          MODAL WINDOW WHEN STUDENT CLICKS "VÀO HỌC"
          ("HS bấm Nút 'vào học' sẽ hiển thị link vào học do GV đăng")
         ===================================================================== */}
      {activeJoinSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setActiveJoinSession(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border-2 border-blue-500 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    CỬA SỔ VÀO PHÒNG HỌC TRỰC TUYẾN ({activeJoinSession.classGroup})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đường link phòng học trực tuyến do Thầy Nguyễn Đình Hành đăng
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveJoinSession(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Info & Opening Time */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
              <div className="font-black text-slate-900 text-sm sm:text-base">
                {activeJoinSession.title}
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Thời gian mở phòng học: {activeJoinSession.openTimeText}</span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {activeJoinSession.announcementContent}
              </p>
            </div>

            {/* Primary Teacher-Posted Meeting Link Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-400/40 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  LINK VÀO HỌC DO GIÁO VIÊN ĐĂNG:
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  ● Đã sẵn sàng kết nối
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <a
                    href={activeJoinSession.primaryMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-mono font-black text-cyan-300 hover:underline break-all block"
                  >
                    {activeJoinSession.primaryMeetingUrl}
                  </a>
                  {(activeJoinSession.roomCode || activeJoinSession.passcode) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100">
                      {activeJoinSession.roomCode && (
                        <span>
                          Mã phòng / ID: <strong>{activeJoinSession.roomCode}</strong>
                        </span>
                      )}
                      {activeJoinSession.passcode && (
                        <span>
                          Mật khẩu phòng: <strong>{activeJoinSession.passcode}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeJoinSession.primaryMeetingUrl)}
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép Link</span>
                  </button>

                  <a
                    href={activeJoinSession.primaryMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Bấm Vào Phòng Học Ngay ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Meeting Links attached by Teacher (if multiple links) */}
            {activeJoinSession.meetingLinks &&
              activeJoinSession.meetingLinks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-800 block">
                    Danh sách các đường link phòng học đính kèm ({activeJoinSession.meetingLinks.length}):
                  </span>
                  <div className="space-y-2">
                    {activeJoinSession.meetingLinks.map((lnk) => (
                      <div
                        key={lnk.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900">{lnk.label}</div>
                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-700 hover:underline break-all block"
                          >
                            {lnk.url}
                          </a>
                          {(lnk.roomCode || lnk.passcode) && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {lnk.roomCode && <span>Mã phòng: {lnk.roomCode} </span>}
                              {lnk.passcode && <span>• Mật khẩu: {lnk.passcode}</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(lnk.url)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] cursor-pointer"
                          >
                            Sao chép
                          </button>

                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Mở Link ↗</span>
                          </a>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMeetingLinkFromSession(
                                  activeJoinSession,
                                  lnk.id
                                )
                              }
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                              title="Xóa link này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Attendance Log */}
            <ItemActivityLogBar
              targetId={`online-${activeJoinSession.id}`}
              label="Học sinh đã bấm 'Vào học' trong buổi học này:"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveJoinSession(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL: WRITE ANNOUNCEMENT FOR ROOM OPENING TIME & POST LINK
         ===================================================================== */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingId
                      ? 'Sửa Thông Báo Phòng Học & Link Vào Học'
                      : 'Quản Trị Viết Bài Thông Báo Thời Gian Mở Phòng Học & Đăng Link'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khi học sinh bấm nút "Vào học", hệ thống sẽ hiển thị đường link phòng học Thầy đăng tại đây
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              {!canManage && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                  <label className="block font-extrabold text-amber-900">
                    Xác thực Quản trị viên (Nhập mật khẩu Quản trị để đăng thông báo):
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
                  Tiêu đề bài thông báo mở phòng học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="VD: Thông báo mở phòng học trực tuyến Lớp H9.1 - Chuyên đề Kim loại..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp học áp dụng
                  </label>
                  <select
                    value={classGroupInput}
                    onChange={(e) => setClassGroupInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Tất cả các lớp">Tất cả các lớp</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Trạng thái phòng học
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="open">Đang mở phòng học (Học sinh vào ngay)</option>
                    <option value="scheduled">Sắp mở theo lịch thông báo</option>
                    <option value="closed">Tạm đóng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thời gian mở phòng học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={openTimeInput}
                  onChange={(e) => setOpenTimeInput(e.target.value)}
                  placeholder="VD: Mở phòng 19h00 - Bắt đầu học 19h15 đến 20h45 Tối nay (Thứ 5)..."
                  className="w-full p-2.5 border border-amber-300 bg-amber-50/40 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết thông báo & dặn dò của Giáo viên
                </label>
                <textarea
                  rows={4}
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="Nhập nội dung thông báo thời gian mở phòng, tài liệu cần chuẩn bị, yêu cầu điểm danh..."
                  className="w-full p-3 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              {/* Primary Meeting Link Input */}
              <div className="p-4 rounded-xl bg-blue-50/80 border-2 border-blue-300 space-y-3">
                <div className="font-black text-blue-950 text-sm">
                  Đường dẫn (Link) vào phòng học do Giáo viên đăng (Hiển thị khi HS bấm "Vào học"):
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link vào học chính (Google Meet / Zoom / Teams / YouTube Live) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryUrlInput}
                    onChange={(e) => setPrimaryUrlInput(e.target.value)}
                    placeholder="Dán link phòng học: https://meet.google.com/xxx-xxxx-xxx hoặc https://zoom.us/j/..."
                    className="w-full p-2.5 bg-white border border-blue-400 rounded-xl font-mono font-bold text-blue-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mã phòng / ID Zoom (Nếu có)
                    </label>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      placeholder="VD: 988 275 2888 hoặc ndh-chem-live"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mật khẩu phòng học (Nếu có)
                    </label>
                    <input
                      type="text"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="VD: 123456"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Optional Extra Meeting Links */}
                <div className="pt-2 border-t border-blue-200 space-y-2">
                  <span className="font-bold text-blue-900 block">
                    Thêm link phòng học phụ / dự phòng (Tùy chọn):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newExtraLabel}
                      onChange={(e) => setNewExtraLabel(e.target.value)}
                      placeholder="Tên phòng (VD: Phòng dự phòng 2)"
                      className="sm:col-span-4 p-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newExtraUrl}
                      onChange={(e) => setNewExtraUrl(e.target.value)}
                      placeholder="Dán link (https://...)"
                      className="sm:col-span-6 p-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraLinkToForm}
                      className="sm:col-span-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                    >
                      + Thêm link
                    </button>
                  </div>

                  {extraLinksInput.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {extraLinksInput.map((lnk) => (
                        <div
                          key={lnk.id}
                          className="p-2 rounded-lg bg-white border border-blue-200 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <strong>{lnk.label}:</strong>{' '}
                            <span className="font-mono text-blue-700">{lnk.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExtraLinksInput((prev) =>
                                prev.filter((item) => item.id !== lnk.id)
                              )
                            }
                            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer shrink-0"
                          >
                            Xóa link
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional File Attachments for the Online Lesson */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Đính kèm tài liệu buổi học trực tuyến (Word, PDF, Ảnh):
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingFiles ? 'Đang tải...' : '+ Chọn File (Word/PDF/Ảnh)'}</span>
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
                  <AttachmentList
                    attachments={attachmentsInput}
                    showInlinePreview={true}
                    onRemove={(id) =>
                      setAttachmentsInput((prev) => prev.filter((a) => a.id !== id))
                    }
                  />
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {editingId
                      ? 'Lưu Cập Nhật Thông Báo & Link'
                      : 'Đăng Thông Báo & Link Vào Học'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
