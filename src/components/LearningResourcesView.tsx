import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Laptop, 
  ExternalLink, 
  GraduationCap, 
  Search, 
  Calendar, 
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  MessageSquare,
  Award,
  Star,
  Download,
  Film,
  FileCode,
  ShieldCheck,
  User,
  AlertCircle,
  Lock,
  CheckCircle2,
  Share2,
  Clock
} from 'lucide-react';
import { 
  LearningResource, 
  PostComment, 
  SubjectType, 
  UserSession, 
  DigitalProductGrading 
} from '../types';
import { CommentSection } from './CommentSection';
import { ResourceEditModal } from './ResourceEditModal';
import { DigitalProductGradingModal } from './DigitalProductGradingModal';

interface LearningResourcesViewProps {
  category: 'study_corner' | 'homework' | 'prep_guide' | 'digital_products' | 'digital_tools' | 'hsg_prep';
  resources: LearningResource[];
  currentUser: UserSession | null;
  onSaveResource: (resource: LearningResource) => void;
  onDeleteResource: (resourceId: string) => void;
  onRequireLogin: () => void;
}

export function LearningResourcesView({ 
  category, 
  resources, 
  currentUser,
  onSaveResource,
  onDeleteResource,
  onRequireLogin
}: LearningResourcesViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [viewingResource, setViewingResource] = useState<LearningResource | null>(null);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [gradingResource, setGradingResource] = useState<LearningResource | null>(null);
  
  // Notice modal / message for student trying to post in teacher-only section
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isDigitalProducts = category === 'digital_products';
  const isSubmissionCategory = category === 'study_corner' || category === 'prep_guide' || category === 'digital_products';

  const getCategoryMeta = () => {
    switch (category) {
      case 'study_corner':
        return {
          title: 'Góc Học Tập - Khoa Học Tự Nhiên',
          desc: 'Tổng hợp sơ đồ tư duy, tóm tắt lý thuyết và cẩm nang kiến thức cốt lõi. Giáo viên và Học sinh đều có thể gửi bài kèm file (Word, Ảnh, PPT, Video ngắn, PDF).',
          icon: BookOpen,
          badgeColor: 'bg-blue-100 text-blue-800',
          teacherOnly: false
        };
      case 'prep_guide':
        return {
          title: 'Hướng Dẫn Soạn Bài KHTN',
          desc: 'Gợi ý phương pháp trả lời câu hỏi mở đầu, hoạt động khám phá và chuẩn bị thí nghiệm. Giáo viên và Học sinh đều có thể gửi bài kèm file (Word, Ảnh, PPT, Video ngắn, PDF).',
          icon: FileText,
          badgeColor: 'bg-purple-100 text-purple-800',
          teacherOnly: false
        };
      case 'digital_products':
        return {
          title: 'Sản Phẩm Số & Học Liệu Đa Phương Tiện',
          desc: 'Không gian sáng tạo số hóa: Cả Giáo viên và Học sinh đều có thể đăng bài (Word, PDF, PPT, Ảnh, Video ngắn 1 phút) và bình luận. Quản trị phân môn chấm điểm và nhận xét.',
          icon: Laptop,
          badgeColor: 'bg-amber-100 text-amber-800',
          teacherOnly: false
        };
      case 'digital_tools':
        return {
          title: 'Link Công Cụ Số & Phòng Thí Nghiệm Ảo',
          desc: 'Truy cập các nền tảng thực hành mô phỏng số: PhET Interactive, Bảng tuần hoàn Ptable, Kính hiển vi ảo do giáo viên cập nhật.',
          icon: ExternalLink,
          badgeColor: 'bg-cyan-100 text-cyan-800',
          teacherOnly: true
        };
      case 'hsg_prep':
        return {
          title: 'Bồi Dưỡng Học Sinh Giỏi KHTN',
          desc: 'Tài liệu chuyên đề nâng cao, tuyển tập đề thi HSG cấp trường, cấp huyện Đak Pơ và tỉnh Gia Lai.',
          icon: GraduationCap,
          badgeColor: 'bg-rose-100 text-rose-800',
          teacherOnly: true
        };
      default:
        return {
          title: 'Tài Liệu Học Tập KHTN',
          desc: 'Học liệu và tài nguyên học tập môn Khoa học Tự nhiên trường THCS và THPT Y Đôn.',
          icon: BookOpen,
          badgeColor: 'bg-slate-100 text-slate-800',
          teacherOnly: true
        };
    }
  };

  const meta = getCategoryMeta();
  const Icon = meta.icon;

  const categoryResources = resources.filter(r => r.category === category);

  const filtered = categoryResources.filter(r => {
    if (selectedSubject !== 'all' && r.subject !== selectedSubject) return false;
    if (selectedGrade !== 'all' && r.grade.toString() !== selectedGrade) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAuthor = r.authorName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor) return false;
    }
    return true;
  });

  // Handler for adding a comment to a resource
  const handleAddComment = (resourceId: string, newComment: PostComment) => {
    const target = resources.find(r => r.id === resourceId);
    if (!target) return;
    const updatedComments = [...(target.comments || []), newComment];
    const updatedResource: LearningResource = {
      ...target,
      comments: updatedComments
    };
    onSaveResource(updatedResource);
    if (viewingResource && viewingResource.id === resourceId) {
      setViewingResource(updatedResource);
    }
  };

  // Handler for saving grading
  const handleSaveGrading = (resourceId: string, grading: DigitalProductGrading) => {
    const target = resources.find(r => r.id === resourceId);
    if (!target) return;
    const updatedResource: LearningResource = {
      ...target,
      grading
    };
    onSaveResource(updatedResource);
    if (viewingResource && viewingResource.id === resourceId) {
      setViewingResource(updatedResource);
    }
  };

  // Click on "Đăng bài" button
  const handleOpenCreatePost = () => {
    if (isSubmissionCategory) {
      // Both Teacher and Enrolled Student can post!
      if (!currentUser) {
        onRequireLogin();
      } else if (currentUser.role === 'guest') {
        setPermissionNotice(
          'Bạn đang đăng nhập với tư cách Khách tham quan (chỉ xem, do chưa thuộc danh sách HS trường THCS Y Đôn). Bạn chỉ được xem sản phẩm số của học sinh trong trường, không được tương tác đăng tải sản phẩm.'
        );
      } else {
        setIsCreatingNew(true);
      }
    } else {
      // Teacher-only post
      if (!isAdmin) {
        setPermissionNotice(
          `Theo quy định, mục "${meta.title}" chỉ dành riêng cho Giáo viên / Quản trị viên bộ môn đăng bài và chỉnh sửa tài liệu. Học sinh có quyền tham gia thảo luận và gửi ảnh tại phần bình luận bên dưới từng bài viết.`
        );
      } else {
        setIsCreatingNew(true);
      }
    }
  };

  const getFileTypeBadge = (res: LearningResource) => {
    if (res.fileType === 'video') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
          <Film className="w-3 h-3 text-purple-600" />
          <span>Video ngắn ({res.videoDurationSeconds ? `${res.videoDurationSeconds}s` : '1p'})</span>
        </span>
      );
    }
    if (res.fileType === 'pdf') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
          <FileCode className="w-3 h-3 text-rose-600" />
          <span>Tệp PDF</span>
        </span>
      );
    }
    if (res.fileType === 'word') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
          <FileText className="w-3 h-3 text-blue-600" />
          <span>Tệp Word (.doc)</span>
        </span>
      );
    }
    if (res.fileType === 'ppt') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
          <Laptop className="w-3 h-3 text-amber-600" />
          <span>Tệp PPT</span>
        </span>
      );
    }
    if (res.fileType === 'image') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Laptop className="w-3 h-3 text-emerald-600" />
          <span>Ảnh đồ họa / Sơ đồ</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div id={`category-view-${category}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Category Banner */}
      <div className={`text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        isDigitalProducts 
          ? 'bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900' 
          : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
      }`}>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-blue-200">
            <Icon className="w-4 h-4" />
            <span>
              {isSubmissionCategory 
                ? 'Không Gian Học Tập & Đăng Bài (GV & HS)' 
                : 'Mục Học Sinh & Quản Trị Giáo Viên'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {meta.title}
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            {meta.desc}
          </p>

          <div className="flex items-center gap-2 pt-1">
            {isSubmissionCategory ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                ✓ Giáo viên & Học sinh đều có thể gửi bài • Hỗ trợ Word, Ảnh, PPT, Video ngắn, PDF
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-400/20 text-blue-200 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Giáo viên đăng & sửa bài | Học sinh bình luận và gửi ảnh
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Post Resource */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id={`create-resource-btn-${category}`}
            onClick={handleOpenCreatePost}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold shadow-lg transition-transform active:scale-95 cursor-pointer text-xs sm:text-sm ${
              isDigitalProducts
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {category === 'digital_products'
                ? '+ Gửi Sản Phẩm Số Mới'
                : category === 'study_corner'
                ? '+ Gửi Bài Góc Học Tập (Đính kèm File)'
                : category === 'prep_guide'
                ? '+ Gửi Bài Soạn (Đính kèm File)'
                : '+ Đăng Bài Mới (Dành cho GV)'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Subject Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Phân môn:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'physics', label: 'Vật lí' },
            { id: 'chemistry', label: 'Hóa học' },
            { id: 'biology', label: 'Sinh học' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id as SubjectType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === s.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Khối:</span>
          {['all', '6', '7', '8', '9'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedGrade === g
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả' : `K${g}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 font-medium"
          />
        </div>

      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-base font-bold text-slate-800">Chưa tìm thấy bài viết hoặc sản phẩm số</div>
            <div className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isDigitalProducts 
                ? 'Hãy là người đầu tiên đăng tải sản phẩm số (Word, PDF, PPT, Ảnh hoặc Video ngắn 1 phút) để Thầy/Cô và các bạn cùng chiêm ngưỡng!'
                : 'Thầy/Cô có thể bấm vào nút "+ Đăng Bài Mới" ở trên để bổ sung học liệu cho học sinh.'}
            </div>
            <button
              onClick={handleOpenCreatePost}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {isDigitalProducts ? '+ Đăng Sản Phẩm Số' : '+ Đăng Bài Mới (GV)'}
            </button>
          </div>
        ) : (
          filtered.map(res => {
            const isTool = category === 'digital_tools' && res.contentUrl;
            const commentsCount = res.comments?.length || 0;
            const hasGrading = !!res.grading;

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Subject, Grade, and File Type */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      res.subject === 'physics' 
                        ? 'bg-blue-100 text-blue-800' 
                        : res.subject === 'chemistry' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {res.subject === 'physics' ? 'Vật lí' : res.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} • Khối {res.grade}
                    </span>

                    {getFileTypeBadge(res)}

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {res.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                    {res.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    {res.authorRole === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        GV: {res.authorName || 'Tổ Lí-Hóa-Sinh-CN'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                        <User className="w-3 h-3" />
                        HS: {res.authorName || 'Học sinh'} {res.authorClass ? `(Lớp ${res.authorClass})` : ''}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Video preview if video */}
                  {res.fileType === 'video' && res.fileData && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-black max-h-36">
                      <video src={res.fileData} controls className="w-full h-32 object-contain" />
                    </div>
                  )}

                  {/* Image preview if image */}
                  {res.fileType === 'image' && res.fileData && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-36">
                      <img src={res.fileData} alt={res.title} className="w-full h-32 object-cover" />
                    </div>
                  )}

                  {/* GRADING BADGE (for Digital Products) */}
                  {isDigitalProducts && (
                    <div className="pt-1">
                      {hasGrading ? (
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-900 flex items-center gap-1 text-xs">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              Điểm: {res.grading?.score.toFixed(1)} / 10.0
                            </span>
                            <span className="text-[10px] font-bold text-amber-700">
                              {res.grading?.gradedBy}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-950 italic line-clamp-2">
                            "{res.grading?.feedback}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Chờ Quản trị phân môn ({res.subject === 'physics' ? 'Vật lí' : res.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}) chấm bài</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Card Footer: Action buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    
                    {/* View Details / Virtual Lab Button */}
                    {isTool ? (
                      <a
                        href={res.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở thí nghiệm ảo</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setViewingResource(res)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem & Thảo luận ({commentsCount})</span>
                      </button>
                    )}

                    {/* Digital Product: Nút Chấm bài (Quản trị phân môn) */}
                    {isDigitalProducts && (
                      <button
                        type="button"
                        id={`grade-product-btn-${res.id}`}
                        onClick={() => setGradingResource(res)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer ${
                          hasGrading 
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300' 
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                        title="Chấm điểm và ghi nhận xét của Quản trị phân môn"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{hasGrading ? 'Sửa điểm' : 'Chấm bài'}</span>
                      </button>
                    )}

                    {/* Teacher / Author Edit & Delete buttons */}
                    <div className="flex items-center gap-1">
                      {(isAdmin || (isSubmissionCategory && currentUser?.name === res.authorName)) && (
                        <button
                          type="button"
                          onClick={() => setEditingResource(res)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Chỉnh sửa bài viết này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa bài "${res.title}"?`)) {
                              onDeleteResource(res.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Xóa bài viết này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Permission Notice Modal */}
      {permissionNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                Quy Định Phân Quyền Mục "{meta.title}"
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
                Đăng Nhập Tài Khoản Giáo Viên / Quản Trị
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

      {/* Resource Detail & Discussion Viewer Modal */}
      {viewingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {viewingResource.subject === 'physics' ? 'Phân môn Vật lí' : viewingResource.subject === 'chemistry' ? 'Phân môn Hóa học' : 'Phân môn Sinh học'} - Lớp {viewingResource.grade}
                  </span>
                  {getFileTypeBadge(viewingResource)}
                  <span className="text-[11px] text-slate-400">Ngày đăng: {viewingResource.date}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {viewingResource.title}
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  Tác giả: <strong className="text-slate-800">{viewingResource.authorName || 'Học sinh'}</strong> {viewingResource.authorClass ? `(Lớp ${viewingResource.authorClass})` : ''}
                </div>
              </div>

              <button
                onClick={() => setViewingResource(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Description & Content */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-800 leading-relaxed border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Mô tả tóm tắt:</h4>
                <p className="whitespace-pre-line">{viewingResource.description}</p>
              </div>

              {/* Extended document content */}
              {viewingResource.documentContent && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-2">
                  <h4 className="font-bold text-blue-900">Nội dung chi tiết:</h4>
                  <p className="whitespace-pre-line">{viewingResource.documentContent}</p>
                </div>
              )}

              {/* Video Player */}
              {viewingResource.fileType === 'video' && viewingResource.fileData && (
                <div className="p-3 bg-black rounded-2xl space-y-2 text-center">
                  <video src={viewingResource.fileData} controls className="max-h-80 w-full object-contain mx-auto rounded-xl" />
                  <span className="text-[11px] text-slate-300 font-medium">
                    Video ngắn mô phỏng khoa học ({viewingResource.videoDurationSeconds ? `${viewingResource.videoDurationSeconds} giây` : '<= 1 phút'})
                  </span>
                </div>
              )}

              {/* Image Preview */}
              {viewingResource.fileType === 'image' && viewingResource.fileData && (
                <div className="p-2 bg-slate-100 rounded-2xl text-center">
                  <img src={viewingResource.fileData} alt={viewingResource.title} className="max-h-96 w-full object-contain mx-auto rounded-xl" />
                </div>
              )}

              {/* Document Download / Open Link */}
              {(viewingResource.fileData || viewingResource.contentUrl) && (
                <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-800">
                        {viewingResource.fileName || 'Tài liệu đính kèm'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {viewingResource.fileSize || 'Định dạng số hóa'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {viewingResource.fileData && (
                      <a
                        href={viewingResource.fileData}
                        download={viewingResource.fileName || `${viewingResource.title}.bin`}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    )}
                    {viewingResource.contentUrl && (
                      <a
                        href={viewingResource.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở liên kết trực tuyến</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* GRADING SECTION (for Digital Products) */}
              {isDigitalProducts && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                      <Award className="w-4 h-4 text-amber-600" />
                      Kết quả chấm bài của Quản trị phân môn:
                    </span>
                    <button
                      onClick={() => setGradingResource(viewingResource)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>{viewingResource.grading ? 'Sửa điểm & nhận xét' : 'Chấm bài ngay'}</span>
                    </button>
                  </div>

                  {viewingResource.grading ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-amber-600">
                          Điểm số: {viewingResource.grading.score.toFixed(1)} / 10.0
                        </span>
                        <span className="text-xs font-bold text-amber-800">
                          Giáo viên: {viewingResource.grading.gradedBy}
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 font-medium whitespace-pre-line leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200">
                        {viewingResource.grading.feedback}
                      </p>
                      <div className="text-[10px] text-amber-700 text-right">
                        Thời gian chấm: {viewingResource.grading.gradedAt}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800 italic pt-1">
                      Chưa có điểm đánh giá. Quản trị phân môn {viewingResource.subject === 'physics' ? 'Vật lí' : viewingResource.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} sẽ sớm chấm điểm và phản hồi nhận xét cho sản phẩm số này!
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS SECTION WITH PHOTO UPLOAD */}
              <CommentSection
                comments={viewingResource.comments}
                currentUser={currentUser}
                targetTitle={viewingResource.title}
                onAddComment={(newCmt) => handleAddComment(viewingResource.id, newCmt)}
                onRequireLogin={onRequireLogin}
              />

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingResource(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(isCreatingNew || editingResource) && (
        <ResourceEditModal
          isOpen={isCreatingNew || !!editingResource}
          category={category}
          resourceToEdit={editingResource}
          currentUser={currentUser}
          onClose={() => {
            setIsCreatingNew(false);
            setEditingResource(null);
          }}
          onSave={(res) => {
            onSaveResource(res);
            setIsCreatingNew(false);
            setEditingResource(null);
          }}
        />
      )}

      {/* GRADING MODAL (FOR DIGITAL PRODUCTS) */}
      {gradingResource && (
        <DigitalProductGradingModal
          resource={gradingResource}
          isOpen={!!gradingResource}
          currentUser={currentUser}
          onClose={() => setGradingResource(null)}
          onSaveGrading={handleSaveGrading}
        />
      )}

    </div>
  );
}
