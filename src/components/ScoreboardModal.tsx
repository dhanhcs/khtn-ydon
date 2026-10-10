import React, { useState } from 'react';
import { 
  Award, 
  X, 
  Search, 
  Filter, 
  ShieldAlert, 
  Eye, 
  Calendar, 
  User, 
  Building2 
} from 'lucide-react';
import { StudentSubmission, Exam } from '../types';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  exams: Exam[];
  onViewSubmission: (submission: StudentSubmission) => void;
}

export function ScoreboardModal({
  isOpen,
  onClose,
  submissions,
  exams,
  onViewSubmission
}: ScoreboardModalProps) {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchName, setSearchName] = useState<string>('');

  if (!isOpen) return null;

  const filtered = submissions.filter((sub) => {
    if (filterSubject !== 'all' && sub.subject !== filterSubject) return false;
    if (filterClass !== 'all' && sub.className !== filterClass) return false;
    if (searchName.trim() && !sub.studentName.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  // Extract unique classes
  const classList = Array.from(new Set(submissions.map(s => s.className))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                BẢNG ĐIỂM KIỂM TRA THƯỜNG XUYÊN (KTTX)
              </h3>
              <p className="text-xs text-blue-200">
                Tổng hợp kết quả làm bài của học sinh các khối lớp • THCS & THPT Y Đôn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Phân môn:</span>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium outline-none"
              >
                <option value="all">Tất cả môn</option>
                <option value="physics">Vật lí</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
              </select>
            </div>

            {/* Class filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Lớp:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium outline-none"
              >
                <option value="all">Tất cả lớp</option>
                {classList.map(c => (
                  <option key={c} value={c}>Lớp {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tên học sinh..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Chưa có kết quả nộp bài nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Học sinh</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Bài kiểm tra</th>
                    <th className="p-3">Phân môn</th>
                    <th className="p-3 text-center">Điểm số</th>
                    <th className="p-3">Giám sát vi phạm</th>
                    <th className="p-3">Thời gian nộp</th>
                    <th className="p-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sub) => {
                    const score = sub.totalScore;
                    const isPassed = score >= 5.0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>{sub.studentName}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                            {sub.className}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate font-medium text-slate-800">
                          {sub.examTitle}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            sub.subject === 'physics' ? 'bg-blue-100 text-blue-800' :
                            sub.subject === 'chemistry' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sub.subject === 'physics' ? 'Vật lí' : sub.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-sm ${
                            score >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                            score >= 5.0 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {score.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          {sub.violationsCount && sub.violationsCount > 0 ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                              sub.penaltyApplied === 'locked_zero' 
                                ? 'bg-black text-white' 
                                : sub.penaltyApplied === 'minus_50_percent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              <ShieldAlert className="w-3 h-3" />
                              {sub.penaltyApplied === 'locked_zero' 
                                ? 'Khóa bài (0đ)' 
                                : sub.penaltyApplied === 'minus_50_percent'
                                ? 'Trừ 50% điểm'
                                : 'Nhắc nhở 1 lần'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-medium">
                              ✓ Nghiêm túc
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {sub.submittedAt}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              onViewSubmission(sub);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số lượt nộp: <strong>{filtered.length}</strong> bài làm</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
