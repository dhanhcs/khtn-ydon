import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Youtube,
  Play,
  ExternalLink,
  PlusCircle,
  Trash2,
  Edit,
  Link2,
  Upload,
  FileText,
  Eye,
  X,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import {
  YoutubeChannelData,
  YoutubePostItem,
  YoutubeLessonLink,
  FileAttachment,
} from '../../types';
import {
  getStoredYoutubeChannelData,
  saveYoutubeChannelData,
  processUploadedFile,
  toYoutubeEmbedUrl,
  recordMediaView,
} from '../../utils/examStorage';
import {
  AttachmentList,
  InteractiveCommentSection,
  ItemActivityLogBar,
} from '../AttachmentAndCommentSection';

export const YoutubeChannelPage: React.FC = () => {
  const { showToast } = useApp();
  const { userProfile, currentUser, isAdmin, isTeacher, loginAdminMaster } = useAuth();
  const canManage = isAdmin || isTeacher;

  const [channelData, setChannelData] = useState<YoutubeChannelData>(() =>
    getStoredYoutubeChannelData()
  );

  // Popup Window State when Student clicks into Youtube Thầy Hành or clicks a Post
  const [isPopupWindowOpen, setIsPopupWindowOpen] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<YoutubePostItem | null>(() => {
    const initial = getStoredYoutubeChannelData();
    return initial.posts && initial.posts.length > 0 ? initial.posts[0] : null;
  });
  const [activePlayingUrl, setActivePlayingUrl] = useState<string>(() => {
    const initial = getStoredYoutubeChannelData();
    if (initial.posts?.[0]?.videoUrl) return toYoutubeEmbedUrl(initial.posts[0].videoUrl);
    if (initial.globalLessonLinks?.[0]?.url)
      return toYoutubeEmbedUrl(initial.globalLessonLinks[0].url);
    return '';
  });

  // Admin: Post Create / Edit Modal State
  const [showPostEditorModal, setShowPostEditorModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postGrade, setPostGrade] = useState('Khối 8, 9 & Bồi dưỡng HSG');
  const [postContent, setPostContent] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postLessonLinks, setPostLessonLinks] = useState<YoutubeLessonLink[]>([]);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonGrade, setNewLessonGrade] = useState('Hóa THCS');
  const [postAttachments, setPostAttachments] = useState<FileAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [adminQuickPass, setAdminQuickPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin: Channel & Global Lesson Link Quick Form State
  const [showChannelConfigModal, setShowChannelConfigModal] = useState(false);
  const [mainChannelNameInput, setMainChannelNameInput] = useState(
    channelData.mainChannelName
  );
  const [mainChannelUrlInput, setMainChannelUrlInput] = useState(
    channelData.mainChannelUrl
  );
  const [mainChannelDescInput, setMainChannelDescInput] = useState(
    channelData.mainChannelDescription
  );
  const [globalLinkTitleInput, setGlobalLinkTitleInput] = useState('');
  const [globalLinkUrlInput, setGlobalLinkUrlInput] = useState('');
  const [globalLinkGradeInput, setGlobalLinkGradeInput] = useState('Hóa 8, 9 & HSG');

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
      const latest = getStoredYoutubeChannelData();
      setChannelData(latest);
      setSelectedPost((prev) => {
        if (!prev) return latest.posts[0] || null;
        return latest.posts.find((p) => p.id === prev.id) || latest.posts[0] || null;
      });
    };
    window.addEventListener('ndh-youtube-updated', refresh);
    return () => window.removeEventListener('ndh-youtube-updated', refresh);
  }, []);

  // Record view on channel when page opens
  useEffect(() => {
    recordMediaView('yt-channel-main', actor);
  }, []);

  const ensureAdminAuthenticated = (): boolean => {
    if (canManage) return true;
    const ok = loginAdminMaster(adminQuickPass.trim(), 'admin');
    if (!ok) {
      showToast('Mật khẩu Quản trị viên chưa đúng (Mặc định: Hanh1962@)', 'error');
      return false;
    }
    return true;
  };

  // When Student clicks on a Post Card -> Open Popup Window with Main Channel Link + Attached Lesson Links
  const handleStudentClickPost = (post: YoutubePostItem) => {
    recordMediaView(`yt-post-${post.id}`, actor);
    setSelectedPost(post);
    const firstVideo =
      post.videoUrl ||
      post.lessonLinks?.[0]?.url ||
      channelData.globalLessonLinks?.[0]?.url ||
      '';
    if (firstVideo) {
      setActivePlayingUrl(toYoutubeEmbedUrl(firstVideo));
    }
    setIsPopupWindowOpen(true);
  };

  // Play a specific lesson link inside the window
  const handlePlayLessonLink = (link: YoutubeLessonLink, parentPostId?: string) => {
    recordMediaView(`yt-link-${link.id}`, actor);
    if (parentPostId) {
      recordMediaView(`yt-post-${parentPostId}`, actor);
    }
    setActivePlayingUrl(toYoutubeEmbedUrl(link.url));
  };

  // Admin: Delete a Global Lesson Link
  const handleDeleteGlobalLessonLink = (linkId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated: YoutubeChannelData = {
      ...channelData,
      globalLessonLinks: channelData.globalLessonLinks.filter((l) => l.id !== linkId),
    };
    setChannelData(saveYoutubeChannelData(updated));
    showToast('Đã xóa link bài học khỏi danh sách đính kèm!', 'info');
  };

  // Admin: Delete a Lesson Link inside a specific Post
  const handleDeletePostLessonLink = (
    postId: string,
    linkId: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const updatedPosts = channelData.posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        lessonLinks: (p.lessonLinks || []).filter((l) => l.id !== linkId),
      };
    });
    const updated: YoutubeChannelData = {
      ...channelData,
      posts: updatedPosts,
    };
    setChannelData(saveYoutubeChannelData(updated));
    if (selectedPost?.id === postId) {
      const refreshed = updatedPosts.find((p) => p.id === postId) || null;
      setSelectedPost(refreshed);
    }
    showToast('Đã xóa link bài học đính kèm trong bài viết!', 'info');
  };

  // Admin: Delete an entire Post
  const handleDeletePost = (postId: string, postTitleText: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedPosts = channelData.posts.filter((p) => p.id !== postId);
    const updated: YoutubeChannelData = {
      ...channelData,
      posts: updatedPosts,
    };
    setChannelData(saveYoutubeChannelData(updated));
    if (selectedPost?.id === postId) {
      setSelectedPost(updatedPosts[0] || null);
    }
    showToast(`Đã xóa bài viết: "${postTitleText}"`, 'info');
  };

  // Admin: Open Create Post Modal
  const handleOpenCreatePostModal = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostGrade('Khối 8, 9 & Bồi dưỡng HSG');
    setPostContent('');
    setPostVideoUrl('');
    setPostLessonLinks([]);
    setNewLessonTitle('');
    setNewLessonUrl('');
    setPostAttachments([]);
    setShowPostEditorModal(true);
  };

  // Admin: Open Edit Post Modal
  const handleOpenEditPostModal = (post: YoutubePostItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostGrade(post.grade);
    setPostContent(post.content);
    setPostVideoUrl(post.videoUrl || '');
    setPostLessonLinks(post.lessonLinks || []);
    setNewLessonTitle('');
    setNewLessonUrl('');
    setPostAttachments(post.attachments || []);
    setShowPostEditorModal(true);
  };

  // Admin: Add lesson link to the post form
  const handleAddLessonLinkToPostForm = () => {
    if (!newLessonUrl.trim()) {
      showToast('Vui lòng dán đường link video YouTube của bài học!', 'error');
      return;
    }
    const newLink: YoutubeLessonLink = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title:
        newLessonTitle.trim() || `Bài giảng video YouTube #${postLessonLinks.length + 1}`,
      url: newLessonUrl.trim(),
      grade: newLessonGrade.trim() || postGrade,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setPostLessonLinks((prev) => [...prev, newLink]);
    setNewLessonTitle('');
    setNewLessonUrl('');
    showToast('Đã thêm link bài học vào bài viết!', 'success');
  };

  // Admin: Upload files (Word, PDF, Image) to Post Form
  const handleSelectPostFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const uploaded: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await processUploadedFile(files[i]));
      }
      setPostAttachments((prev) => [...prev, ...uploaded]);
      showToast(`Đã tải lên ${uploaded.length} tệp (Word / PDF / Ảnh)!`, 'success');
    } catch {
      showToast('Không thể đọc tệp đính kèm.', 'error');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  // Admin: Save Post (Create or Update)
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureAdminAuthenticated()) return;
    if (!postTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết!', 'error');
      return;
    }

    // If admin typed a link in the pending input box without clicking "+ Thêm link", include it automatically
    const finalLessonLinks = [...postLessonLinks];
    if (newLessonUrl.trim()) {
      finalLessonLinks.push({
        id: `pl-${Date.now()}`,
        title:
          newLessonTitle.trim() || `Bài giảng video: ${postTitle.trim()}`,
        url: newLessonUrl.trim(),
        grade: newLessonGrade.trim() || postGrade,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      });
    }

    const primaryVideoUrl = postVideoUrl.trim() || finalLessonLinks[0]?.url || '';

    const savedPost: YoutubePostItem = {
      id: editingPostId || `yt-post-${Date.now()}`,
      title: postTitle.trim(),
      content:
        postContent.trim() ||
        'Các em nhấn vào từng link bài học bên dưới để xem video bài giảng trên kênh YouTube của Thầy Nguyễn Đình Hành.',
      grade: postGrade.trim() || 'Hóa học THCS',
      videoUrl: primaryVideoUrl ? toYoutubeEmbedUrl(primaryVideoUrl) : '',
      lessonLinks: finalLessonLinks,
      attachments: postAttachments,
      author: 'Thầy Nguyễn Đình Hành',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    const existingIdx = channelData.posts.findIndex((p) => p.id === savedPost.id);
    let nextPosts: YoutubePostItem[];
    if (existingIdx >= 0) {
      nextPosts = [...channelData.posts];
      nextPosts[existingIdx] = savedPost;
    } else {
      nextPosts = [savedPost, ...channelData.posts];
    }

    const updatedData: YoutubeChannelData = {
      ...channelData,
      posts: nextPosts,
    };

    setChannelData(saveYoutubeChannelData(updatedData));
    setSelectedPost(savedPost);
    if (savedPost.videoUrl) {
      setActivePlayingUrl(toYoutubeEmbedUrl(savedPost.videoUrl));
    }
    setShowPostEditorModal(false);
    showToast(
      editingPostId
        ? 'Đã cập nhật bài viết & link YouTube!'
        : 'Đã đăng bài viết & đính kèm link bài học YouTube thành công!',
      'success'
    );
  };

  // Admin: Save Channel Config & Add Global Lesson Link
  const handleSaveChannelConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureAdminAuthenticated()) return;

    let nextGlobalLinks = [...channelData.globalLessonLinks];
    if (globalLinkUrlInput.trim()) {
      nextGlobalLinks = [
        {
          id: `yt-link-${Date.now()}`,
          title:
            globalLinkTitleInput.trim() ||
            `Bài giảng YouTube #${nextGlobalLinks.length + 1}`,
          url: globalLinkUrlInput.trim(),
          grade: globalLinkGradeInput.trim() || 'Hóa THCS',
          createdAt: new Date().toLocaleDateString('vi-VN'),
        },
        ...nextGlobalLinks,
      ];
    }

    const updatedData: YoutubeChannelData = {
      ...channelData,
      mainChannelName:
        mainChannelNameInput.trim() ||
        'Kênh YouTube Chính Thức: Thầy Nguyễn Đình Hành - Chinh Phục Môn Hóa THCS',
      mainChannelUrl:
        mainChannelUrlInput.trim() || 'https://www.youtube.com/@ThayNguyenDinhHanhHoaTHCS',
      mainChannelDescription: mainChannelDescInput.trim(),
      globalLessonLinks: nextGlobalLinks,
    };

    setChannelData(saveYoutubeChannelData(updatedData));
    setGlobalLinkTitleInput('');
    setGlobalLinkUrlInput('');
    setShowChannelConfigModal(false);
    showToast('Đã lưu cấu hình Kênh YouTube chính & danh sách link bài học!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-1">
            <Youtube className="w-4 h-4 text-red-600" />
            Mục số 12 trong Mê nu chính: Youtube thầy Hành
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Kênh YouTube Thầy Nguyễn Đình Hành & Bài Giảng Video Đính Kèm
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Khi học sinh click chuột vào bài viết sẽ hiển thị cửa sổ gồm Link kênh YouTube chính và danh sách Link các bài học do Quản trị đính kèm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPopupWindowOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Youtube className="w-4 h-4" />
            <span>Mở Cửa Sổ Kênh Chính & Link Bài Học</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreatePostModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Quản trị Đăng Bài & Dán Link YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainChannelNameInput(channelData.mainChannelName);
              setMainChannelUrlInput(channelData.mainChannelUrl);
              setMainChannelDescInput(channelData.mainChannelDescription);
              setShowChannelConfigModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-4 h-4 text-amber-400" />
            <span>+ Thêm Link Bài Học / Sửa Kênh Chính</span>
          </button>
        </div>
      </div>

      {/* Main Channel Card & Attached Lesson Links Overview */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-red-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Kênh YouTube Chính Thức Của Thầy Nguyễn Đình Hành</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {channelData.mainChannelName}
            </h3>
            <p className="text-xs text-rose-100 leading-relaxed max-w-3xl">
              {channelData.mainChannelDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={channelData.mainChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordMediaView('yt-channel-main', actor)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg border border-red-400 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Truy cập Kênh YouTube Chính ↗</span>
            </a>

            <button
              type="button"
              onClick={() => setIsPopupWindowOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition"
            >
              <Play className="w-4 h-4" />
              <span>Xem Cửa Sổ Bài Học Đính Kèm</span>
            </button>
          </div>
        </div>

        {/* Global Attached Lesson Links Bar */}
        {channelData.globalLessonLinks.length > 0 && (
          <div className="pt-4 border-t border-white/15 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                Danh sách Link các bài học do Quản trị đính kèm ({channelData.globalLessonLinks.length} link):
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {channelData.globalLessonLinks.map((link) => (
                <div
                  key={link.id}
                  onClick={() => {
                    handlePlayLessonLink(link);
                    setIsPopupWindowOpen(true);
                  }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-between gap-2 cursor-pointer transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white truncate">
                      ▶ {link.title}
                    </div>
                    <div className="text-[11px] text-rose-200 truncate font-mono">
                      {link.url}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        recordMediaView(`yt-link-${link.id}`, actor);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mở link</span>
                    </a>

                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteGlobalLessonLink(link.id, e)}
                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-700 text-red-200 hover:text-white cursor-pointer"
                        title="Xóa link bài học này"
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
      </div>

      {/* Activity Tracker for Main YouTube Channel */}
      <ItemActivityLogBar
        targetId="yt-channel-main"
        label="Danh sách học sinh & thành viên đã xem Kênh YouTube Thầy Hành:"
      />

      {/* Posts List ("Khi học sinh click chuột vào sẽ hiển thị một cửa sổ trong đó có link kênh chính và link các bài học do quản trị đính kèm") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <span>Các Bài Viết & Chuyên Đề Video YouTube Thầy Hành (Click vào bài để mở cửa sổ xem)</span>
          </h3>
        </div>

        {channelData.posts.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            Chưa có bài viết nào. Quản trị viên bấm nút "+ Quản trị Đăng Bài & Dán Link YouTube" để tạo bài mới.
          </div>
        ) : (
          channelData.posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleStudentClickPost(post)}
              className="bg-white rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:shadow-md transition p-5 space-y-4 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-extrabold text-red-600">{post.grade}</span>
                    <span>·</span>
                    <span>Ngày đăng: {post.createdAt}</span>
                    <span>·</span>
                    <span>Tác giả: {post.author}</span>
                    <span>·</span>
                    <span className="text-indigo-600 font-bold">
                      👆 Click chuột vào bài để mở cửa sổ Kênh chính & Link bài học
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-base sm:text-lg">
                    {post.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {post.content}
                  </p>
                </div>

                {/* Admin Post Controls: Edit, Delete Post */}
                <div
                  className="flex flex-wrap items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleStudentClickPost(post)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Mở cửa sổ xem bài học</span>
                  </button>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditPostModal(post, e)}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Sửa bài / Thêm link</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeletePost(post.id, post.title, e)}
                        className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Attached Lesson Links Preview inside Post Card */}
              {post.lessonLinks && post.lessonLinks.length > 0 && (
                <div
                  className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-extrabold text-rose-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-red-600" />
                      Link các bài học đính kèm trong bài viết ({post.lessonLinks.length}):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {post.lessonLinks.map((lnk) => (
                      <div
                        key={lnk.id}
                        className="p-2.5 rounded-lg bg-white border border-rose-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPost(post);
                            handlePlayLessonLink(lnk, post.id);
                            setIsPopupWindowOpen(true);
                          }}
                          className="text-left font-bold text-slate-800 hover:text-red-600 truncate flex-1 cursor-pointer"
                        >
                          ▶ {lnk.title}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => recordMediaView(`yt-post-${post.id}`, actor)}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                          >
                            YouTube ↗
                          </a>
                          {canManage && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleDeletePostLessonLink(post.id, lnk.id, e)
                              }
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
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

              {/* Attached Word, PDF, Image Files */}
              {post.attachments && post.attachments.length > 0 && (
                <div
                  className="pt-2 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AttachmentList
                    attachments={post.attachments}
                    showInlinePreview={true}
                    parentTargetId={`yt-post-${post.id}`}
                  />
                </div>
              )}

              {/* Activity Log Bar showing who viewed and downloaded */}
              <div onClick={(e) => e.stopPropagation()}>
                <ItemActivityLogBar
                  targetId={`yt-post-${post.id}`}
                  label="Danh sách học sinh đã xem & đã tải bài học này:"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* =====================================================================
          POPUP WINDOW WHEN STUDENT CLICKS ("Cửa sổ hiển thị Link kênh chính & Link các bài học do quản trị đính kèm")
         ===================================================================== */}
      {isPopupWindowOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setIsPopupWindowOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border-2 border-red-500 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Top Bar */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Youtube className="w-6 h-6 text-white shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base truncate">
                    CỬA SỔ YOUTUBE THẦY NGUYỄN ĐÌNH HÀNH — KÊNH CHÍNH & LINK BÀI HỌC
                  </h3>
                  <p className="text-[11px] text-rose-100 truncate">
                    Nhấn vào Link kênh chính hoặc chọn bất kỳ Link bài học đính kèm bên dưới để học ngay
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPopupWindowOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
                <span>Đóng cửa sổ</span>
              </button>
            </div>

            {/* Window Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50">
              {/* SECTION 1: LINK KÊNH YOUTUBE CHÍNH */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-red-950 text-white border border-red-400/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                    1. LINK KÊNH YOUTUBE CHÍNH CỦA THẦY HÀNH:
                  </span>
                  <div className="font-extrabold text-sm sm:text-base text-white truncate">
                    {channelData.mainChannelName}
                  </div>
                  <a
                    href={channelData.mainChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordMediaView('yt-channel-main', actor)}
                    className="text-xs font-mono text-cyan-300 hover:underline break-all block"
                  >
                    {channelData.mainChannelUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={channelData.mainChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordMediaView('yt-channel-main', actor)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Kênh YouTube Chính ↗</span>
                  </a>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        setMainChannelNameInput(channelData.mainChannelName);
                        setMainChannelUrlInput(channelData.mainChannelUrl);
                        setMainChannelDescInput(channelData.mainChannelDescription);
                        setShowChannelConfigModal(true);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs cursor-pointer"
                    >
                      Sửa kênh
                    </button>
                  )}
                </div>
              </div>

              {/* Embedded Video Player inside the Window */}
              {activePlayingUrl && (
                <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 aspect-video">
                  {activePlayingUrl.includes('embed') ? (
                    <iframe
                      src={activePlayingUrl}
                      title="YouTube Thầy Nguyễn Đình Hành"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 space-y-3">
                      <Youtube className="w-12 h-12 text-red-500" />
                      <a
                        href={activePlayingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở xem video trực tiếp trên YouTube</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: LINK CÁC BÀI HỌC DO QUẢN TRỊ ĐÍNH KÈM */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
                      2. DANH SÁCH LINK CÁC BÀI HỌC DO QUẢN TRỊ ĐÍNH KÈM:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Bấm vào bài học để phát video trực tiếp hoặc mở trên YouTube
                    </span>
                  </div>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setShowChannelConfigModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Thêm Link Bài Học</span>
                    </button>
                  )}
                </div>

                {/* Selected Post's Lesson Links */}
                {selectedPost &&
                  selectedPost.lessonLinks &&
                  selectedPost.lessonLinks.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-slate-800">
                        Link bài học thuộc chuyên đề: "{selectedPost.title}"
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedPost.lessonLinks.map((lnk) => (
                          <div
                            key={lnk.id}
                            className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900">
                                🎬 {lnk.title}
                              </div>
                              <div className="text-[11px] font-mono text-rose-700 truncate">
                                {lnk.url}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handlePlayLessonLink(lnk, selectedPost.id)
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 text-amber-400" />
                                <span>Phát tại đây</span>
                              </button>

                              <a
                                href={lnk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                  recordMediaView(`yt-post-${selectedPost.id}`, actor)
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Mở YouTube ↗</span>
                              </a>

                              {canManage && (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleDeletePostLessonLink(
                                      selectedPost.id,
                                      lnk.id,
                                      e
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa link</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Global Lesson Links */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-800">
                    Link bài học chung của Kênh YouTube Thầy Hành ({channelData.globalLessonLinks.length}):
                  </div>
                  {channelData.globalLessonLinks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Chưa có link bài học chung.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {channelData.globalLessonLinks.map((lnk) => (
                        <div
                          key={lnk.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900">
                              ▶ {lnk.title}{' '}
                              {lnk.grade && (
                                <span className="text-cyan-700 font-semibold">
                                  ({lnk.grade})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              {lnk.url}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlayLessonLink(lnk)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 text-amber-400" />
                              <span>Phát tại đây</span>
                            </button>

                            <a
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => recordMediaView(`yt-link-${lnk.id}`, actor)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Mở YouTube ↗</span>
                            </a>

                            {canManage && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteGlobalLessonLink(lnk.id, e)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa link</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: SELECTED POST CONTENT & ATTACHMENTS */}
              {selectedPost && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-red-600 uppercase">
                        Nội dung bài viết hướng dẫn của Thầy Hành:
                      </span>
                      <h4 className="font-black text-slate-900 text-base">
                        {selectedPost.title}
                      </h4>
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleDeletePost(selectedPost.id, selectedPost.title, e)
                        }
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài viết này</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedPost.content}
                  </div>

                  {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                    <AttachmentList
                      attachments={selectedPost.attachments}
                      showInlinePreview={true}
                      parentTargetId={`yt-post-${selectedPost.id}`}
                    />
                  )}

                  <ItemActivityLogBar
                    targetId={`yt-post-${selectedPost.id}`}
                    label="Người đã xem & đã tải bài học này:"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL 1: WRITE YOUTUBE POST & ATTACH VIDEO LINKS / FILES
         ===================================================================== */}
      {showPostEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingPostId
                      ? 'Sửa Bài Viết & Quản Lý Link Bài Học YouTube'
                      : 'Quản Trị Đăng Bài Viết & Dán Link Video YouTube'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đăng bài viết mới, đính kèm các link bài học YouTube và file tài liệu (Word, PDF, Ảnh)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPostEditorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiêu đề bài viết / chuyên đề YouTube <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="VD: Chuyên đề Video: Giải nhanh bài toán Kim loại tác dụng Axit..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <input
                    type="text"
                    value={postGrade}
                    onChange={(e) => setPostGrade(e.target.value)}
                    placeholder="VD: Hóa 8, 9 & HSG"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Link Video YouTube chính của bài viết (tùy chọn)
                </label>
                <input
                  type="text"
                  value={postVideoUrl}
                  onChange={(e) => setPostVideoUrl(e.target.value)}
                  placeholder="Dán link YouTube: https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết / Hướng dẫn học tập
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết, hướng dẫn các bước học qua video và dặn dò học sinh..."
                  className="w-full p-3 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              {/* Add Multiple Attached Lesson Links to this Post */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="font-black text-rose-950 text-sm">
                  Đính kèm danh sách Link các bài học YouTube cho bài viết này:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="Tên bài học (VD: Bài 1 - Lý thuyết...)"
                    className="sm:col-span-5 p-2 bg-white border border-rose-300 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={newLessonUrl}
                    onChange={(e) => setNewLessonUrl(e.target.value)}
                    placeholder="Dán link YouTube (https://youtu.be/...)"
                    className="sm:col-span-5 p-2 bg-white border border-rose-300 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddLessonLinkToPostForm}
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black cursor-pointer"
                  >
                    + Thêm link
                  </button>
                </div>

                {postLessonLinks.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {postLessonLinks.map((lnk) => (
                      <div
                        key={lnk.id}
                        className="p-2 rounded-lg bg-white border border-rose-200 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <strong className="text-slate-800">{lnk.title}:</strong>{' '}
                          <span className="font-mono text-slate-500">{lnk.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPostLessonLinks((prev) =>
                              prev.filter((item) => item.id !== lnk.id)
                            )
                          }
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa link</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Word / PDF / Image Attachments */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Đính kèm thêm tài liệu bài giảng (Word, PDF, Ảnh):
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
                    onChange={handleSelectPostFiles}
                    className="hidden"
                  />
                </div>
                {postAttachments.length > 0 && (
                  <AttachmentList
                    attachments={postAttachments}
                    showInlinePreview={true}
                    onRemove={(id) =>
                      setPostAttachments((prev) => prev.filter((a) => a.id !== id))
                    }
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostEditorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{editingPostId ? 'Lưu Cập Nhật Bài Viết' : 'Đăng Bài Viết & Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADMIN MODAL 2: CONFIG MAIN CHANNEL LINK & ADD/DELETE GLOBAL LESSON LINKS
         ===================================================================== */}
      {showChannelConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <Link2 className="w-5 h-5 text-red-600" />
                <span>Quản Lý Link Kênh Chính & Thêm/Xóa Link Bài Học</span>
              </div>
              <button
                onClick={() => setShowChannelConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannelConfig} className="space-y-4 text-xs">
              {!canManage && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                  <label className="block font-extrabold text-amber-900">
                    Xác thực Quản trị viên (Nhập mật khẩu Quản trị):
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
                  Tên Kênh YouTube Chính
                </label>
                <input
                  type="text"
                  value={mainChannelNameInput}
                  onChange={(e) => setMainChannelNameInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường dẫn (Link) Kênh YouTube Chính <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mainChannelUrlInput}
                  onChange={(e) => setMainChannelUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/@..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-red-700"
                />
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                <div className="font-black text-rose-950">
                  + Thêm nhanh 1 Link bài học YouTube vào Cửa sổ chung:
                </div>
                <input
                  type="text"
                  value={globalLinkTitleInput}
                  onChange={(e) => setGlobalLinkTitleInput(e.target.value)}
                  placeholder="Tên bài giảng (VD: Chuyên đề Giải toán Оxit axit...)"
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-bold"
                />
                <input
                  type="text"
                  value={globalLinkUrlInput}
                  onChange={(e) => setGlobalLinkUrlInput(e.target.value)}
                  placeholder="Dán link video YouTube (https://www.youtube.com/watch?v=...)"
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-mono"
                />
                <input
                  type="text"
                  value={globalLinkGradeInput}
                  onChange={(e) => setGlobalLinkGradeInput(e.target.value)}
                  placeholder="Khối lớp (VD: Hóa 8, 9 & HSG)"
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChannelConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow cursor-pointer"
                >
                  Lưu Kênh Chính & Thêm Link Bài Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
