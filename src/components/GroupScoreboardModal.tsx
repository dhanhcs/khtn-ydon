import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  X, 
  Medal, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  CheckCircle2, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { GroupSubmission, GroupNumber, InteractiveLessonExam } from '../types';

interface GroupScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: GroupSubmission[];
  exams: InteractiveLessonExam[];
  filterLessonExamId?: string;
}

export function GroupScoreboardModal({
  isOpen,
  onClose,
  submissions,
  exams,
  filterLessonExamId
}: GroupScoreboardModalProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(filterLessonExamId || 'all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Filtered submissions
  const filtered = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedExamId !== 'all' && sub.examId !== selectedExamId) return false;
      if (selectedClass !== 'all' && sub.className !== selectedClass) return false;
      return true;
    });
  }, [submissions, selectedExamId, selectedClass]);

  // Aggregate stats per Group 1 to 8
  const groupStats = useMemo(() => {
    const map: Record<GroupNumber, {
      groupNumber: GroupNumber;
      groupName: string;
      testsCount: number;
      totalScoreSum: number;
      avgScore: number;
      goldCount: number;
      silverCount: number;
      bronzeCount: number;
      effortCount: number;
      bestScore: number;
    }> = {
      1: { groupNumber: 1, groupName: 'Nhóm 1', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      2: { groupNumber: 2, groupName: 'Nhóm 2', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      3: { groupNumber: 3, groupName: 'Nhóm 3', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      4: { groupNumber: 4, groupName: 'Nhóm 4', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      5: { groupNumber: 5, groupName: 'Nhóm 5', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      6: { groupNumber: 6, groupName: 'Nhóm 6', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      7: { groupNumber: 7, groupName: 'Nhóm 7', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
      8: { groupNumber: 8, groupName: 'Nhóm 8', testsCount: 0, totalScoreSum: 0, avgScore: 0, goldCount: 0, silverCount: 0, bronzeCount: 0, effortCount: 0, bestScore: 0 },
    };

    filtered.forEach(sub => {
      const g = map[sub.groupNumber];
      if (g) {
        g.testsCount++;
        g.totalScoreSum += sub.totalScore;
        if (sub.totalScore > g.bestScore) g.bestScore = sub.totalScore;
        if (sub.trophy === 'gold') g.goldCount++;
        else if (sub.trophy === 'silver') g.silverCount++;
        else if (sub.trophy === 'bronze') g.bronzeCount++;
        else g.effortCount++;
      }
    });

    Object.values(map).forEach(g => {
      g.avgScore = g.testsCount > 0 ? Number((g.totalScoreSum / g.testsCount).toFixed(1)) : 0;
    });

    // Sort by: Gold cups desc, Silver desc, Bronze desc, Avg score desc
    return Object.values(map).sort((a, b) => {
      if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
      if (b.silverCount !== a.silverCount) return b.silverCount - a.silverCount;
      if (b.bronzeCount !== a.bronzeCount) return b.bronzeCount - a.bronzeCount;
      return b.avgScore - a.avgScore;
    });
  }, [filtered]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-amber-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bảng Vinh Danh Thi Đua
                </span>
                <span className="text-xs text-amber-200">
                  8 Nhóm Học Tập (Nhóm 1 - Nhóm 8)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Bảng Xếp Hạng & Cúp Vinh Danh Các Nhóm
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 p-3 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600">Lọc theo bài học:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none max-w-xs truncate"
            >
              <option value="all">Tất cả bài học</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.lessonTitle} - {e.title}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Tổng cộng: <strong className="text-indigo-700 font-black">{filtered.length} lượt bài nộp</strong>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groupStats.slice(0, 3).map((g, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={g.groupNumber}
                  className={`p-5 rounded-3xl border-2 relative overflow-hidden shadow-md flex flex-col justify-between ${
                    isFirst
                      ? 'bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-200 border-amber-400 order-first md:order-2 md:-translate-y-2 shadow-amber-200'
                      : isSecond
                      ? 'bg-gradient-to-b from-slate-100 via-gray-50 to-slate-200 border-slate-300 order-2 md:order-1'
                      : 'bg-gradient-to-b from-orange-100 via-amber-50 to-orange-200 border-orange-300 order-3'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs ${
                      isFirst ? 'bg-amber-500' : isSecond ? 'bg-slate-400' : 'bg-orange-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-3xl">
                      {isFirst ? '🏆' : isSecond ? '🥈' : '🥉'}
                    </span>
                  </div>

                  <div className="my-3 text-center space-y-1">
                    <h3 className="text-xl font-black text-slate-900">
                      {g.groupName}
                    </h3>
                    <p className="text-xs text-slate-600 font-bold">
                      Điểm TB: <span className="text-indigo-700 font-black text-base">{g.avgScore}</span> • Đỉnh cao: {g.bestScore}đ
                    </p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-2xl border border-white/60 grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Cúp Vàng</div>
                      <div className="font-black text-amber-600 text-sm">🏆 {g.goldCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Cúp Bạc</div>
                      <div className="font-black text-slate-600 text-sm">🥈 {g.silverCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Cúp Đồng</div>
                      <div className="font-black text-orange-700 text-sm">🥉 {g.bronzeCount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Table of All 8 Groups */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Bảng Thống Kê Chi Tiết Cả 8 Nhóm Học Tập
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">Hạng</th>
                    <th className="py-3 px-4">Tên Nhóm</th>
                    <th className="py-3 px-3 text-center">Số bài làm</th>
                    <th className="py-3 px-3 text-center">Điểm TB</th>
                    <th className="py-3 px-3 text-center">Điểm cao nhất</th>
                    <th className="py-3 px-3 text-center text-amber-600">🏆 Cúp Vàng</th>
                    <th className="py-3 px-3 text-center text-slate-500">🥈 Cúp Bạc</th>
                    <th className="py-3 px-3 text-center text-orange-600">🥉 Cúp Đồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupStats.map((g, index) => (
                    <tr key={g.groupNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-black text-indigo-900">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        {g.groupName}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {g.testsCount} bài
                      </td>
                      <td className="py-3 px-3 text-center font-black text-indigo-700 text-sm">
                        {g.avgScore}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {g.bestScore}đ
                      </td>
                      <td className="py-3 px-3 text-center font-black text-amber-600">
                        {g.goldCount > 0 ? `🏆 ${g.goldCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-500">
                        {g.silverCount > 0 ? `🥈 ${g.silverCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-orange-600">
                        {g.bronzeCount > 0 ? `🥉 ${g.bronzeCount}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submissions Feed */}
          {filtered.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                Lịch sử các lượt nộp bài nhóm gần đây:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {filtered.map(sub => (
                  <div key={sub.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-2xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-indigo-900">{sub.groupName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">{sub.className}</span>
                        {sub.trophy === 'gold' && <span title="Cúp Vàng">🏆</span>}
                        {sub.trophy === 'silver' && <span title="Cúp Bạc">🥈</span>}
                        {sub.trophy === 'bronze' && <span title="Cúp Đồng">🥉</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{sub.lessonTitle}</p>
                      {sub.leaderName && (
                        <p className="text-[10px] text-slate-400 italic">Đại diện: {sub.leaderName}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-indigo-700 block">{sub.totalScore.toFixed(1)}đ</span>
                      <span className="text-[10px] text-slate-400">{sub.submittedAt.substring(11, 16)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Đóng bảng xếp hạng
          </button>
        </div>

      </div>
    </div>
  );
}
