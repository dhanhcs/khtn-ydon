import React, { useState, useRef } from 'react';
import { 
  Award, 
  Sparkles, 
  PlusCircle, 
  Search, 
  User, 
  Image as ImageIcon, 
  Calendar, 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Upload,
  Heart,
  Share2,
  Edit3,
  Trash2,
  Lock,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { ExemplaryPost, GradeLevel, PostComment, UserSession } from '../types';
import { schoolClasses } from '../data/mockData';
import { CommentSection } from './CommentSection';

interface ExemplaryViewProps {
  posts: ExemplaryPost[];
  onAddPost: (newPost: ExemplaryPost) => void;
  onUpdatePost?: (updatedPost: ExemplaryPost) => void;
  onDeletePost?: (postId: string) => void;
  currentUser: UserSession | null;
  onRequireLogin: () => void;
}

export function ExemplaryView({ 
  posts, 
  onAddPost, 
  onUpdatePost, 
  onDeletePost, 
  currentUser, 
  onRequireLogin 
}: ExemplaryViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<ExemplaryPost | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<ExemplaryPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Form state for creating/editing post
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('8A1');
  const [grade, setGrade] = useState<GradeLevel>(8);
  const [title, setTitle] = useState('');
  const [achievement, setAchievement] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'olympic' | 'khkt' | 'good_student' | 'progress'>('olympic');
  const [authorName, setAuthorName] = useState(currentUser?.adminName || currentUser?.name || '');
  const [formError, setFormError] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.role === 'admin';

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Dung lượng ảnh tối đa là 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      setPermissionNotice(
        'Chỉ Giáo viên bộ môn mới có quyền đăng bài và chỉnh sửa trong mục Gương tiêu biểu. Học sinh có thể gửi lời chúc mừng và gửi ảnh tại phần bình luận bên dưới từng bài viết.'
      );
      return;
    }
    setEditingPost(null);
    setStudentName('');
    setClassName('8A1');
    setGrade(8);
    setTitle('');
    setAchievement('');
    setContent('');
    setImageUrl('');
    setPreviewImage('');
    setAuthorName(currentUser?.adminName || 'Tổ Lí - Hóa - Sinh - CN');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (post: ExemplaryPost) => {
    if (!isAdmin) {
      setPermissionNotice('Chỉ Giáo viên bộ môn mới có quyền chỉnh sửa bài vinh danh.');
      return;
    }
    setEditingPost(post);
    setStudentName(post.studentName);
    setClassName(post.className);
    setGrade(post.grade);
    setTitle(post.title);
    setAchievement(post.achievement);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
    setPreviewImage(post.imageUrl || '');
    setCategory(post.category);
    setAuthorName(post.author);
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !title.trim() || !content.trim()) {
      setFormError('Vui lòng điền đầy đủ họ tên học sinh, tiêu đề và nội dung bài viết.');
      return;
    }

    const defaultImages = {
      olympic: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
      khkt: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      good_student: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
      progress: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'
    };

    if (editingPost) {
      const updatedPost: ExemplaryPost = {
        ...editingPost,
        studentName: studentName.trim(),
        className,
        grade,
        title: title.trim(),
        achievement: achievement.trim() || 'Học sinh tiêu biểu môn Khoa học Tự nhiên',
        content: content.trim(),
        imageUrl: imageUrl.trim() || defaultImages[category],
        author: authorName.trim() || (currentUser?.adminName || 'Tổ Lí - Hóa - Sinh - CN'),
        category
      };
      if (onUpdatePost) onUpdatePost(updatedPost);
      if (selectedPostDetail?.id === updatedPost.id) setSelectedPostDetail(updatedPost);
    } else {
      const newPost: ExemplaryPost = {
        id: `exp-${Date.now()}`,
        studentName: studentName.trim(),
        className,
        grade,
        title: title.trim(),
        achievement: achievement.trim() || 'Học sinh tiêu biểu môn Khoa học Tự nhiên',
        content: content.trim(),
        imageUrl: imageUrl.trim() || defaultImages[category],
        date: new Date().toISOString().split('T')[0],
        author: authorName.trim() || (currentUser?.adminName || 'Tổ Lí - Hóa - Sinh - CN'),
        category,
        comments: []
      };
      onAddPost(newPost);
    }

    setShowAddModal(false);
    setEditingPost(null);
  };

  const handleAddCommentToPost = (postId: string, newComment: PostComment) => {
    const target = posts.find(p => p.id === postId);
    if (!target) return;
    const comments = [...(target.comments || []), newComment];
    const updatedPost: ExemplaryPost = {
      ...target,
      comments
    };
    if (onUpdatePost) onUpdatePost(updatedPost);
    if (selectedPostDetail && selectedPostDetail.id === postId) {
      setSelectedPostDetail(updatedPost);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedGrade !== 'all' && post.grade.toString() !== selectedGrade) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        post.studentName.toLowerCase().includes(q) ||
        post.title.toLowerCase().includes(q) ||
        post.achievement.toLowerCase().includes(q) ||
        post.className.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="exemplary-students-view" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Banner Gương tiêu biểu */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bảng Vinh Danh • THCS & THPT Y Đôn</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-8 h-8 text-amber-400" />
            Gương Tiêu Biểu Khoa Học Tự Nhiên
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Tuyên dương các tấm gương học sinh Y Đôn chăm ngoan, đạt giải cao trong các kỳ thi Olympic KHTN, cuộc thi Sáng tạo KHKT, và những gương sáng nỗ lực vươn lên trong học tập.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-400/20 text-blue-200 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              Giáo viên đăng & sửa bài vinh danh | Học sinh gửi lời chúc mừng & ảnh tại bình luận
            </span>
          </div>
        </div>

        <button
          id="open-create-exemplary-post-btn"
          onClick={handleOpenCreateModal}
          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer text-xs sm:text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Đăng Bài Vinh Danh (GV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Grade Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">Khối Lớp:</span>
          {['all', '6', '7', '8', '9'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả khối' : `Khối ${g}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, lớp, thành tích..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
          />
        </div>

      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-base font-bold text-slate-800">Chưa tìm thấy gương tiêu biểu phù hợp</div>
            <p className="text-xs text-slate-500">Giáo viên có thể bấm vào nút "+ Đăng Bài Vinh Danh" ở trên để biểu dương học sinh.</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isLiked = !!likedPosts[post.id];
            const commentsCount = post.comments?.length || 0;

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with category badge */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'}
                      alt={post.studentName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900/80 text-amber-300 backdrop-blur-xs border border-white/20 shadow-xs">
                        Lớp {post.className}
                      </span>
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-700">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.studentName}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 line-clamp-2">
                      ★ {post.achievement}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isLiked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                        }`}
                        title="Yêu thích"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => setSelectedPostDetail(post)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Xem & Chúc mừng ({commentsCount})</span>
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleOpenEditModal(post)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Chỉnh sửa bài viết vinh danh"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeletePost && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa bài vinh danh em ${post.studentName}?`)) {
                                  onDeletePost(post.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Xóa bài viết này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Permission notice modal */}
      {permissionNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                Quy Định Mục Gương Tiêu Biểu
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {permissionNotice}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setPermissionNotice(null);
                  onRequireLogin();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Đăng Nhập Tài Khoản Giáo Viên
              </button>
              <button
                onClick={() => setPermissionNotice(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (TEACHER ONLY) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-500" />
                <div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Quyền Giáo Viên / Quản Trị
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {editingPost ? 'Chỉnh Sửa Bài Vinh Danh' : 'Đăng Bài Gương Tiêu Biểu Mới'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPost(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đinh Thị Mai Lan"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khối:</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold bg-white"
                    >
                      <option value={6}>Khối 6</option>
                      <option value={7}>Khối 7</option>
                      <option value={8}>Khối 8</option>
                      <option value={9}>Khối 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lớp:</label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold bg-white"
                    >
                      {['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài vinh danh: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tấm gương sáng vượt khó vươn lên đạt giải Nhất Olympic KHTN"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thành tích nổi bật: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giải Nhất Olympic KHTN cấp Huyện, Điểm tổng kết 9.8"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết vinh danh: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Kể về tinh thần tự giác, phương pháp học tập khoa học, sự giúp đỡ bạn bè..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 leading-relaxed font-normal"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh chân dung / kỷ niệm:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                  {previewImage && (
                    <span className="text-emerald-600 font-bold text-xs">✓ Đã tải ảnh</span>
                  )}
                </div>
                {previewImage && (
                  <div className="mt-2 relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên giới thiệu:</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPost(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPost ? 'Lưu Thay Đổi' : 'Đăng Bài Ngay'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL WITH COMMENT SECTION */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                  ★ Bảng Vinh Danh Y Đôn
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {selectedPostDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPostDetail.imageUrl && (
              <div className="w-full h-72 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={selectedPostDetail.imageUrl}
                  alt={selectedPostDetail.studentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Học sinh: {selectedPostDetail.studentName} - Lớp {selectedPostDetail.className} (Khối {selectedPostDetail.grade})</span>
              </div>
              <p className="text-emerald-800 font-semibold">
                Thành tích: {selectedPostDetail.achievement}
              </p>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedPostDetail.content}
            </div>

            <div className="text-xs text-slate-500 pt-2">
              Đăng ngày: {selectedPostDetail.date} bởi <strong>{selectedPostDetail.author}</strong>
            </div>

            {/* Comment Section with Photo attachment for congratulating */}
            <CommentSection
              comments={selectedPostDetail.comments}
              currentUser={currentUser}
              targetTitle={`bạn ${selectedPostDetail.studentName}`}
              onAddComment={(newCmt) => handleAddCommentToPost(selectedPostDetail.id, newCmt)}
              onRequireLogin={onRequireLogin}
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 cursor-pointer text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
