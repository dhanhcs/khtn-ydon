import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Send, 
  Calendar, 
  Clock, 
  BookOpen, 
  Building2, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import { ExamReminderNotification, SubjectType, UserSession, GradeLevel } from '../types';
import { schoolClasses } from '../data/mockData';

interface ExamReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ExamReminderNotification[];
  currentUser: UserSession | null;
  onSendNotification: (notification: ExamReminderNotification) => void;
  onDeleteNotification: (id: string) => void;
}

export function ExamReminderModal({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onSendNotification,
  onDeleteNotification
}: ExamReminderModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'compose'>('list');

  // Compose form states
  const [targetClass, setTargetClass] = useState<string>('all');
  const [subject, setSubject] = useState<SubjectType>('physics');
  const [title, setTitle] = useState<string>('Nhắc nhở kiểm tra thường xuyên môn KHTN');
  const [examDate, setExamDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [examTime, setExamTime] = useState<string>('08:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [contentNote, setContentNote] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
  const studentClass = currentUser?.className;

  // Filter notifications relevant to current user
  const relevantNotifications = notifications.filter(n => {
    if (isAdmin) return true;
    if (n.targetClass === 'all') return true;
    if (studentClass && n.targetClass === studentClass) return true;
    return false;
  });

  const handleSendForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentNote.trim() || !examDate) {
      setFormError('Vui lòng điền đầy đủ tiêu đề, ngày kiểm tra và nội dung dặn dò.');
      return;
    }

    const newNotification: ExamReminderNotification = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      targetClass,
      subject,
      examDate,
      examTime,
      durationMinutes,
      contentNote: contentNote.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.adminName || currentUser?.name || 'Giáo viên bộ môn KHTN'
    };

    onSendNotification(newNotification);
    setContentNote('');
    setFormError('');
    setActiveTab('list');
  };

  return (
    <div 
      className="fixed inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-sky-200 px-2 py-0.5 rounded-full">
                  LỊCH KIỂM TRA & NHẮC NHỞ
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Thông Báo Lịch Kiểm Tra Cho Học Sinh
              </h3>
              <p className="text-xs text-blue-100 font-normal">
                Nhắc nhở ngày giờ, phân môn và nội dung ôn tập trọng tâm trước giờ kiểm tra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (if admin can compose) */}
        {isAdmin && (
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Danh Sách Tin Nhắn ({relevantNotifications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'compose'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Soạn Tin Nhắn Nhắc Lịch Mới (GV)</span>
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LIST NOTIFICATIONS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {relevantNotifications.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700">
                    Hiện chưa có thông báo lịch kiểm tra nào
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isAdmin 
                      ? 'Thầy Cô hãy nhấp vào nút "Soạn Tin Nhắn Nhắc Lịch Mới" bên trên để gửi thông báo cho các lớp.'
                      : 'Khi Thầy Cô lên lịch kiểm tra hoặc dặn dò ôn tập, tin nhắn sẽ xuất hiện ở đây.'}
                  </p>
                </div>
              ) : (
                relevantNotifications.map((notif) => {
                  const subjectLabel = notif.subject === 'physics' ? 'Vật lí' : notif.subject === 'chemistry' ? 'Hóa học' : notif.subject === 'biology' ? 'Sinh học' : 'KHTN';
                  const subjectColor = notif.subject === 'physics' ? 'bg-sky-100 text-sky-800 border-sky-300' : notif.subject === 'chemistry' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300';

                  return (
                    <div 
                      key={notif.id}
                      className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${subjectColor}`}>
                              {subjectLabel}
                            </span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                              {notif.targetClass === 'all' ? 'Toàn trường' : `Lớp ${notif.targetClass}`}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Người gửi: {notif.createdBy}
                            </span>
                          </div>

                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            {notif.title}
                          </h4>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteNotification(notif.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="Xóa thông báo này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Exam Schedule Badge */}
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex flex-wrap items-center gap-4 text-xs font-bold text-amber-950">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-700" />
                          <span>Ngày kiểm tra: <strong>{notif.examDate}</strong></span>
                        </div>
                        {notif.examTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-700" />
                            <span>Giờ: <strong>{notif.examTime}</strong></span>
                          </div>
                        )}
                        {notif.durationMinutes && (
                          <div className="flex items-center gap-1.5">
                            <span>Thời gian làm: <strong>{notif.durationMinutes} phút</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Content Notes */}
                      <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                        {notif.contentNote}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: COMPOSE NEW NOTIFICATION (TEACHER ONLY) */}
          {activeTab === 'compose' && isAdmin && (
            <form onSubmit={handleSendForm} className="space-y-4 text-xs">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gửi cho lớp:</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    <option value="all">Tất cả các lớp (Toàn trường)</option>
                    {schoolClasses.map(cls => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân môn kiểm tra:</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    <option value="physics">Vật lí</option>
                    <option value="chemistry">Hóa học</option>
                    <option value="biology">Sinh học</option>
                    <option value="all">Khoa học Tự nhiên chung</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề tin nhắn:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhắc nhở kiểm tra thường xuyên TX2 - Vật lí 8"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày kiểm tra:</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung dặn dò ôn tập & căn dặn học sinh:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Các em ôn kỹ công thức tính áp suất chất lỏng p = d.h, lực đẩy Archimedes Fa = d.V và bài tập vận dụng trang 45 SGK KHTN 8. Chuẩn bị máy tính và vào hệ thống đúng giờ."
                  value={contentNote}
                  onChange={(e) => setContentNote(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Thông Báo Ngay</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống học tập THCS & THPT Y Đôn</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
