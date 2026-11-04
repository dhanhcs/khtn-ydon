import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Search,
  Filter,
  Award,
  Download,
  Upload,
  PlusCircle,
  Edit,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { ExamResultRecord } from '../../types';
import * as XLSX from 'xlsx';
import {
  getStoredExamResults,
  saveExamResults,
  upsertExamResultRecord,
  evaluateScoreLabel,
  extractTextFromDocxFile,
} from '../../utils/examStorage';
import { getActiveStudentRoster } from '../../utils/studentRoster';
import { InteractiveCommentSection } from '../AttachmentAndCommentSection';

export const ExamResultsPage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { isAdmin } = useAuth();

  const [results, setResults] = useState<ExamResultRecord[]>(() => getStoredExamResults());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const roster = getActiveStudentRoster();

  // Admin Add / Edit Score Modal
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExamResultRecord | null>(null);
  const [form, setForm] = useState({
    studentCode: '',
    studentName: '',
    classGroup: classes[0]?.name || 'H8.1',
    examName: 'Khảo Sát Chất Lượng Định Kỳ Hóa Học NĐH',
    examType: 'Kỳ thi / Khảo sát' as ExamResultRecord['examType'],
    scoreInput: '9.0',
    feedback: 'Nắm vững kiến thức trọng tâm, vận dụng tốt phương pháp bảo toàn khối lượng.',
  });

  useEffect(() => {
    const refresh = () => setResults(getStoredExamResults());
    window.addEventListener('ndh-results-updated', refresh);
    return () => window.removeEventListener('ndh-results-updated', refresh);
  }, []);

  const filtered = results.filter((r) => {
    if (filterClass !== 'all' && r.classGroup !== filterClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentCode.toLowerCase().includes(q) ||
        r.examName.toLowerCase().includes(q) ||
        r.classGroup.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const topScore = filtered.length > 0 ? Math.max(...filtered.map((r) => r.score)) : 0;

  // Admin: Open Add or Edit Modal
  const handleOpenModal = (rec?: ExamResultRecord) => {
    if (rec) {
      setEditingRecord(rec);
      setForm({
        studentCode: rec.studentCode,
        studentName: rec.studentName,
        classGroup: rec.classGroup,
        examName: rec.examName,
        examType: rec.examType || 'Kỳ thi / Khảo sát',
        scoreInput: String(rec.score),
        feedback: rec.feedback,
      });
    } else {
      setEditingRecord(null);
      setForm({
        studentCode: `NDH-${String(results.length + 1).padStart(2, '0')}`,
        studentName: '',
        classGroup: filterClass === 'all' ? classes[0]?.name || 'H8.1' : filterClass,
        examName: 'Khảo Sát Chất Lượng Định Kỳ Hóa Học NĐH',
        examType: 'Kỳ thi / Khảo sát',
        scoreInput: '9.0',
        feedback: 'Nắm vững kiến thức trọng tâm, giải bài tập chính xác.',
      });
    }
    setShowScoreModal(true);
  };

  // Admin: Save Score Record
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim() || !form.examName.trim()) {
      showToast('Vui lòng nhập họ tên học sinh và tên bài thi/khảo sát.', 'error');
      return;
    }

    const scoreVal = Number(form.scoreInput.replace(',', '.'));
    if (!Number.isFinite(scoreVal) || scoreVal < 0 || scoreVal > 10) {
      showToast('Điểm số phải từ 0 đến 10.', 'error');
      return;
    }

    const updated = upsertExamResultRecord({
      id: editingRecord?.id,
      studentCode: form.studentCode.trim() || `NDH-${String(results.length + 1).padStart(2, '0')}`,
      studentName: form.studentName.trim(),
      classGroup: form.classGroup,
      examName: form.examName.trim(),
      examType: form.examType,
      score: scoreVal,
      feedback: form.feedback.trim(),
    });

    setResults(updated);
    setShowScoreModal(false);
    showToast(
      `Đã lưu điểm của học sinh ${form.studentName} (${scoreVal}/10 điểm)!`,
      'success'
    );
  };

  // Admin: Delete Score Record
  const handleDeleteRecord = (id: string, name: string) => {
    if (confirm(`Xóa kết quả điểm của học sinh ${name}?`)) {
      const next = saveExamResults(results.filter((r) => r.id !== id));
      setResults(next);
      showToast(`Đã xóa điểm của ${name}.`, 'info');
    }
  };

  // Admin: Export Grades to Excel ("Tải file điểm")
  const handleExportExcel = () => {
    if (filtered.length === 0) {
      showToast('Không có dữ liệu điểm để xuất.', 'info');
      return;
    }

    const dataToExport = filtered.map((r, idx) => ({
      Hạng: r.rank || idx + 1,
      'Mã học sinh': r.studentCode,
      'Họ và tên học sinh': r.studentName,
      'Lớp': r.classGroup,
      'Kỳ thi / Bài khảo sát': r.examName,
      'Phân loại bài': r.examType || 'Kỳ thi / Khảo sát',
      'Điểm số (Thang 10)': r.score,
      'Xếp loại học lực': r.evaluated,
      'Nhận xét của Giáo viên': r.feedback,
      'Ngày chấm': r.gradedDate || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem_NDH');
    XLSX.writeFile(
      wb,
      `Bang_Diem_Hoa_Hoc_NDH_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Đã tải file điểm (.XLSX) về máy thành công!', 'success');
  };

  // Admin: Download Template Excel ("Tải mẫu file điểm")
  const handleDownloadTemplate = () => {
    const sample = [
      {
        'Mã học sinh': 'NDH-H8-01',
        'Họ và tên học sinh': 'Nguyễn Minh Khôi',
        'Lớp': 'H8.1',
        'Kỳ thi / Bài khảo sát': 'Kiểm Tra Định Kỳ Chương 1',
        'Điểm số': 9.25,
        'Nhận xét của Giáo viên': 'Giải bài toán tính theo phương trình hóa học rất tốt.',
      },
      {
        'Mã học sinh': 'NDH-H9-02',
        'Họ và tên học sinh': 'Trần Bảo Ngọc',
        'Lớp': 'H9.1',
        'Kỳ thi / Bài khảo sát': 'Đề Thi Thử Học Kỳ I',
        'Điểm số': 8.5,
        'Nhận xét của Giáo viên': 'Nắm chắc tính chất hóa học của kim loại và muối.',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Up_File_Diem');
    XLSX.writeFile(wb, 'Mau_File_Diem_Hoa_Hoc_NDH.xlsx');
    showToast('Đã tải file mẫu nhập điểm (.XLSX)!', 'info');
  };

  // Admin: Import Grades from Excel or Word ("Up file điểm")
  const handleImportGradesFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();

    // Support Word (.docx) grade table upload as well as Excel (.xlsx, .xls, .csv)
    if (lowerName.endsWith('.docx')) {
      try {
        const text = await extractTextFromDocxFile(file);
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        let count = 0;
        const added: ExamResultRecord[] = [];
        lines.forEach((line, idx) => {
          // Match lines like "1. Nguyễn Văn An - H8.1 - 9.5 - Xuất sắc"
          const scoreMatch = line.match(/\b(10(?:[.,]0+)?|[0-9](?:[.,][0-9]{1,2})?)\b/);
          if (!scoreMatch) return;
          const scoreVal = Number(scoreMatch[1].replace(',', '.'));
          const parts = line
            .replace(/^\d+[\.\)\s]+/, '')
            .split(/[-–|;\t]/)
            .map((p) => p.trim())
            .filter(Boolean);
          const studentName = parts[0];
          if (!studentName || studentName.toLowerCase().includes('họ và tên')) return;
          added.push({
            id: 'res-w-' + Date.now() + '-' + idx,
            studentCode: `NDH-${String(results.length + idx + 1).padStart(2, '0')}`,
            studentName,
            classGroup: filterClass === 'all' ? 'H8.1' : filterClass,
            examName: file.name.replace(/\.docx$/i, ''),
            examType: 'Kỳ thi / Khảo sát',
            score: scoreVal,
            evaluated: evaluateScoreLabel(scoreVal),
            feedback: 'Cập nhật từ file điểm Word của Giáo viên.',
            gradedDate: new Date().toLocaleDateString('vi-VN'),
          });
          count++;
        });

        if (count > 0) {
          const next = saveExamResults([...added, ...results]);
          setResults(next);
          showToast(`Đã up file điểm Word (.docx) thành công (${count} học sinh)!`, 'success');
        } else {
          showToast('Không tìm thấy dữ liệu điểm trong file Word. Khuyên dùng file Excel (.xlsx).', 'error');
        }
      } catch {
        showToast('Lỗi khi đọc file Word điểm.', 'error');
      }
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        let count = 0;
        const newItems: ExamResultRecord[] = [];
        const today = new Date().toLocaleDateString('vi-VN');

        rows.forEach((row: any, idx: number) => {
          const name = String(
            row['Họ và tên học sinh'] || row['Họ và tên'] || row['Họ tên'] || row['studentName'] || ''
          ).trim();
          const rawScore =
            row['Điểm số (Thang 10)'] ??
            row['Điểm số (thang 10)'] ??
            row['Điểm số'] ??
            row['Điểm'] ??
            row['score'];
          const scoreVal = Number(String(rawScore ?? '').replace(',', '.'));

          if (name && Number.isFinite(scoreVal)) {
            const cleanScore = Math.max(0, Math.min(10, Math.round(scoreVal * 100) / 100));
            newItems.push({
              id: 'res-xl-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
              studentCode: String(
                row['Mã học sinh'] ||
                  row['Mã HS'] ||
                  `NDH-${String(results.length + idx + 1).padStart(2, '0')}`
              ).trim(),
              studentName: name,
              classGroup: String(row['Lớp'] || row['Nhóm lớp'] || 'H8.1').trim(),
              examName: String(
                row['Kỳ thi / Bài khảo sát'] ||
                  row['Tên bài tập'] ||
                  row['Đề kiểm tra'] ||
                  'Khảo Sát Định Kỳ Hóa Học NĐH'
              ).trim(),
              examType: 'Kỳ thi / Khảo sát',
              score: cleanScore,
              evaluated: evaluateScoreLabel(cleanScore),
              feedback: String(
                row['Nhận xét của Giáo viên'] ||
                  row['Nhận xét của Thầy'] ||
                  row['Nhận xét'] ||
                  (cleanScore >= 8.0
                    ? 'Nắm vững kiến thức, tính toán phương trình hóa học chính xác.'
                    : 'Cần ôn tập thêm các dạng bài tập trọng tâm.')
              ).trim(),
              gradedDate: today,
            });
            count++;
          }
        });

        if (count > 0) {
          const next = saveExamResults([...newItems, ...results]);
          setResults(next);
          showToast(`Đã up file điểm thành công (${count} học sinh)!`, 'success');
        } else {
          showToast('Không tìm thấy cột "Họ và tên học sinh" và "Điểm số" hợp lệ trong file.', 'error');
        }
      } catch {
        showToast('Lỗi khi đọc file điểm. Vui lòng sử dụng file Excel (.xlsx) đúng mẫu.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header & Admin Professional Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            Mục số 11: Bảng Điểm Khảo Thí — Chấm Bài, Tải File Điểm & Up File Điểm
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Bảng Vàng Thành Tích & Quản Lý Điểm Số Hóa Học NĐH
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Dành cho Quản trị viên: Vào điểm, chấm bài, tải file điểm (.XLSX) và up file điểm (.XLSX / .DOCX) lên hệ thống.'
              : 'Học sinh & Phụ huynh: Tra cứu điểm kiểm tra, thứ hạng học lực, lời phê của Thầy Hành và gửi bình luận trao đổi.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Chấm / Vào điểm mới</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                title="Tải toàn bộ bảng điểm ra file Excel"
              >
                <Download className="w-4 h-4" />
                <span>Tải file điểm (.XLSX)</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Up file điểm (.XLSX / Word)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.docx"
                  onChange={handleImportGradesFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadTemplate}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                title="Tải file mẫu nhập điểm Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Điểm cao nhất đợt thi: {topScore} Điểm</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tra cứu theo tên, mã học sinh, tên kỳ thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Tất cả các lớp ({results.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center">Hạng</th>
                <th className="py-3 px-3">Mã HS</th>
                <th className="py-3 px-4">Họ và tên học sinh</th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-3">Kỳ thi / Bài khảo sát</th>
                <th className="py-3 px-3 text-center">Điểm số</th>
                <th className="py-3 px-3">Xếp loại</th>
                <th className="py-3 px-4">Nhận xét của Thầy Hành</th>
                {isAdmin && <th className="py-3 px-4 text-center">Quản trị</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Chưa có kết quả điểm phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((r, index) => {
                  const rankNum = r.rank || index + 1;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center">
                        {rankNum === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center text-xs shadow-xs">
                            1
                          </span>
                        ) : rankNum === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black inline-flex items-center justify-center text-xs">
                            2
                          </span>
                        ) : rankNum === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black inline-flex items-center justify-center text-xs">
                            3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500 font-mono">{rankNum}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">
                        {r.studentCode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                      <td className="py-3 px-3 font-semibold text-cyan-800">{r.classGroup}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        <div>{r.examName}</div>
                        {r.examType && (
                          <span className="text-[10px] text-slate-400">{r.examType}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-rose-600 text-sm">
                        {r.score}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.evaluated === 'Xuất sắc'
                              ? 'bg-amber-100 text-amber-800'
                              : r.evaluated === 'Giỏi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.evaluated === 'Khá'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.evaluated}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic text-[11px] leading-relaxed">
                        “{r.feedback}”
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenModal(r)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 cursor-pointer"
                              title="Chỉnh sửa điểm & nhận xét"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(r.id, r.studentName)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-red-600 cursor-pointer"
                              title="Xóa bản ghi điểm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student & Teacher Discussion / Feedback on Exam Results */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <InteractiveCommentSection
          targetId="exam-results-board"
          title="Bình luận & Thắc mắc Kết quả thi / Đề nghị chấm phúc khảo (Đính kèm Word, Ảnh)"
        />
      </div>

      {/* Admin Add / Edit Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-600" />
                {editingRecord ? 'Sửa Điểm & Nhận Xét' : 'Vào Điểm / Chấm Bài Học Sinh'}
              </h3>
              <button
                onClick={() => setShowScoreModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    value={form.studentCode}
                    onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học</label>
                  <select
                    value={form.classGroup}
                    onChange={(e) => setForm({ ...form, classGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="results-student-roster"
                  placeholder="Nhập họ và tên học sinh..."
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                />
                <datalist id="results-student-roster">
                  {roster.map((s) => (
                    <option key={s.id || s.studentCode} value={s.fullName}>
                      {s.studentCode} - {s.enrolledClass}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên kỳ thi / Bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.examName}
                  onChange={(e) => setForm({ ...form, examName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Điểm số (Thang điểm 10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.scoreInput}
                  onChange={(e) => setForm({ ...form, scoreInput: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-black text-base text-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhận xét sư phạm của Thầy Nguyễn Đình Hành
                </label>
                <textarea
                  rows={3}
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow cursor-pointer"
                >
                  Lưu vào Bảng Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
