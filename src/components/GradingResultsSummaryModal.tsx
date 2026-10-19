import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  Award, 
  TrendingUp, 
  Users, 
  BarChart2, 
  Trash2,
  CheckCircle2,
  Hash
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentSubmission } from '../types';
import { schoolClasses } from '../data/mockData';

interface GradingResultsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: StudentSubmission[];
  examTitle?: string;
  onDeleteSubmission?: (id: string) => void;
}

export function GradingResultsSummaryModal({
  isOpen,
  onClose,
  submissions,
  examTitle = 'Kiểm tra định kỳ môn KHTN',
  onDeleteSubmission
}: GradingResultsSummaryModalProps) {
  if (!isOpen) return null;

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedCodeFilter, setSelectedCodeFilter] = useState<string>('all');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique exam codes
  const allCodes = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach(s => {
      // If student submission has exam code in note or answers or id
      const codeMatch = s.id.match(/code-([0-9]{4})/i) || s.examTitle.match(/([0-9]{4})/);
      if (codeMatch) set.add(codeMatch[1]);
      else set.add('0101');
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Class filter
      if (selectedClassFilter !== 'all' && sub.className !== selectedClassFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = sub.studentName.toLowerCase().includes(q);
        const matchClass = sub.className.toLowerCase().includes(q);
        if (!matchName && !matchClass) return false;
      }
      // Rank filter
      if (selectedRankFilter !== 'all') {
        const score = sub.totalScore;
        if (selectedRankFilter === 'gioi' && score < 8.0) return false;
        if (selectedRankFilter === 'kha' && (score < 6.5 || score >= 8.0)) return false;
        if (selectedRankFilter === 'tb' && (score < 5.0 || score >= 6.5)) return false;
        if (selectedRankFilter === 'yeu' && score >= 5.0) return false;
      }
      return true;
    });
  }, [submissions, selectedClassFilter, selectedRankFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const count = filteredSubmissions.length;
    if (count === 0) {
      return {
        count: 0,
        avg: 0,
        max: 0,
        min: 0,
        gioiCount: 0,
        khaCount: 0,
        tbCount: 0,
        yeuCount: 0,
        gioiPct: 0,
        khaPct: 0,
        tbPct: 0,
        yeuPct: 0
      };
    }
    const scores = filteredSubmissions.map(s => s.totalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / count) * 10) / 10;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const gioiCount = scores.filter(s => s >= 8.0).length;
    const khaCount = scores.filter(s => s >= 6.5 && s < 8.0).length;
    const tbCount = scores.filter(s => s >= 5.0 && s < 6.5).length;
    const yeuCount = scores.filter(s => s < 5.0).length;

    return {
      count,
      avg,
      max,
      min,
      gioiCount,
      khaCount,
      tbCount,
      yeuCount,
      gioiPct: Math.round((gioiCount / count) * 100),
      khaPct: Math.round((khaCount / count) * 100),
      tbPct: Math.round((tbCount / count) * 100),
      yeuPct: Math.round((yeuCount / count) * 100)
    };
  }, [filteredSubmissions]);

  const getRankBadge = (score: number) => {
    if (score >= 8.0) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Giỏi</span>;
    }
    if (score >= 6.5) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Khá</span>;
    }
    if (score >= 5.0) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Trung bình</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Chưa đạt</span>;
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary List
    const rows: any[] = [];
    rows.push(['SỞ GD&ĐT GIA LAI', '', 'TRƯỜNG THCS & THPT Y ĐÔN']);
    rows.push(['BẢNG TỔNG HỢP KẾT QUẢ CHẤM BÀI KIỂM TRA ĐỊNH KỲ']);
    rows.push([`Môn thi: Khoa học Tự nhiên • ${examTitle}`]);
    rows.push([`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} • Tổng số bài: ${stats.count}`]);
    rows.push([]);

    // Header row
    rows.push([
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Mã đề',
      'Điểm Phần I (TN /4.0đ)',
      'Điểm Phần II (Đ/S /2.8đ)',
      'Điểm Phần III (TLN /1.5đ)',
      'Điểm Tự luận (/2.5đ)',
      'Tổng điểm (Thang 10)',
      'Xếp loại',
      'Thời gian chấm'
    ]);

    filteredSubmissions.forEach((sub, idx) => {
      const p1 = sub.mcqScore ?? 0;
      const p2 = sub.tfScore ?? 0;
      const p3 = sub.saScore ?? 0;
      const total = sub.totalScore ?? 0;
      const essay = Math.max(0, Math.round((total - p1 - p2 - p3) * 10) / 10);
      const rank = total >= 8.0 ? 'Giỏi' : total >= 6.5 ? 'Khá' : total >= 5.0 ? 'Trung bình' : 'Chưa đạt';

      rows.push([
        idx + 1,
        sub.studentName,
        sub.className,
        '0101',
        p1,
        p2,
        p3,
        essay,
        total,
        rank,
        sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN') + ' ' + new Date(sub.submittedAt).toLocaleDateString('vi-VN') : ''
      ]);
    });

    rows.push([]);
    rows.push(['THỐNG KÊ CHẤT LƯỢNG:']);
    rows.push(['Điểm trung bình:', stats.avg, 'Điểm cao nhất:', stats.max, 'Điểm thấp nhất:', stats.min]);
    rows.push(['Loại Giỏi (≥ 8.0):', `${stats.gioiCount} HS (${stats.gioiPct}%)`]);
    rows.push(['Loại Khá (6.5 - 7.9):', `${stats.khaCount} HS (${stats.khaPct}%)`]);
    rows.push(['Loại Trung bình (5.0 - 6.4):', `${stats.tbCount} HS (${stats.tbPct}%)`]);
    rows.push(['Loại Chưa đạt (< 5.0):', `${stats.yeuCount} HS (${stats.yeuPct}%)`]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Ket_Qua_Cham_Thi');
    XLSX.writeFile(wb, `Tong_Hop_Ket_Qua_Cham_Thi_KHTN_Y_Don_${Date.now()}.xlsx`);
  };

  // Export to Word (.doc)
  const handleExportWord = () => {
    const tableRows = filteredSubmissions.map((sub, idx) => {
      const p1 = sub.mcqScore ?? 0;
      const p2 = sub.tfScore ?? 0;
      const p3 = sub.saScore ?? 0;
      const total = sub.totalScore ?? 0;
      const essay = Math.max(0, Math.round((total - p1 - p2 - p3) * 10) / 10);
      const rank = total >= 8.0 ? 'Giỏi' : total >= 6.5 ? 'Khá' : total >= 5.0 ? 'Trung bình' : 'Chưa đạt';

      return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${sub.studentName}</strong></td>
          <td style="text-align: center;">${sub.className}</td>
          <td style="text-align: center;">0101</td>
          <td style="text-align: center;">${p1}</td>
          <td style="text-align: center;">${p2}</td>
          <td style="text-align: center;">${p3}</td>
          <td style="text-align: center;">${essay}</td>
          <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${total}</td>
          <td style="text-align: center;">${rank}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Bảng Tổng Hợp Kết Quả Chấm Thi - Trường Y Đôn</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.35; margin: 1.5cm; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .header-table td { vertical-align: top; text-align: center; font-size: 11pt; }
          .title { text-align: center; font-weight: bold; font-size: 15pt; text-transform: uppercase; margin-top: 10px; margin-bottom: 5px; }
          .sub { text-align: center; font-style: italic; margin-bottom: 15px; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; font-size: 10pt; }
          .data-table th, .data-table td { border: 1px solid #000; padding: 5px 6px; }
          .data-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .stats-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%;">
              <strong>SỞ GD&ĐT GIA LAI</strong><br/>
              <strong>TRƯỜNG THCS & THPT Y ĐÔN</strong><br/>
              <em>Tổ Khoa học Tự nhiên</em>
            </td>
            <td style="width: 55%;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
              <em>Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em>
            </td>
          </tr>
        </table>

        <div class="title">BẢNG TỔNG HỢP KẾT QUẢ CHẤM THI TRẮC NGHIỆM ĐỊNH KỲ</div>
        <div class="sub">${examTitle} • Chuẩn ma trận GDPT 2018</div>

        <div class="stats-box">
          <strong>THỐNG KÊ CHẤT LƯỢNG CHẤM THI:</strong><br/>
          - Tổng số bài thi đã chấm: <strong>${stats.count} bài</strong><br/>
          - Điểm trung bình: <strong>${stats.avg} điểm</strong> | Điểm cao nhất: <strong>${stats.max}</strong> | Điểm thấp nhất: <strong>${stats.min}</strong><br/>
          - Loại Giỏi (≥ 8.0đ): <strong>${stats.gioiCount} HS (${stats.gioiPct}%)</strong><br/>
          - Loại Khá (6.5 - 7.9đ): <strong>${stats.khaCount} HS (${stats.khaPct}%)</strong><br/>
          - Loại Trung bình (5.0 - 6.4đ): <strong>${stats.tbCount} HS (${stats.tbPct}%)</strong><br/>
          - Loại Chưa đạt (&lt; 5.0đ): <strong>${stats.yeuCount} HS (${stats.yeuPct}%)</strong>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th>Họ và tên học sinh</th>
              <th style="width: 50px;">Lớp</th>
              <th style="width: 55px;">Mã đề</th>
              <th style="width: 60px;">Phần I (TN)</th>
              <th style="width: 60px;">Phần II (Đ/S)</th>
              <th style="width: 60px;">Phần III (TLN)</th>
              <th style="width: 60px;">Tự luận</th>
              <th style="width: 65px;">Tổng điểm</th>
              <th style="width: 75px;">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <table style="width: 100%; margin-top: 35px; border-collapse: collapse; text-align: center;">
          <tr>
            <td style="width: 33%;"><strong>NGƯỜI CHẤM THI</strong><br/><br/><br/><br/><em>(Ký và ghi rõ họ tên)</em></td>
            <td style="width: 33%;"><strong>TỔ TRƯỞNG CHUYÊN MÔN</strong><br/><br/><br/><br/><em>(Ký và ghi rõ họ tên)</em></td>
            <td style="width: 33%;"><strong>HIỆU TRƯỞNG DUYỆT</strong><br/><br/><br/><br/><em>(Ký tên và đóng dấu)</em></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Tong_Hop_Diem_KHTN_Y_Don_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white font-mono">
                  BÁO CÁO KHOA HỌC
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Danh Sách Tổng Hợp Kết Quả Chấm Bài Trắc Nghiệm KTĐK
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Xuất file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Xuất file Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Xuất Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="In trực tiếp"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">In Báo Cáo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase">Tổng số bài chấm</div>
              <div className="text-xl font-black text-slate-900">{stats.count} <span className="text-xs font-normal text-slate-500">bài</span></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase">Điểm trung bình</div>
              <div className="text-xl font-black text-amber-600">{stats.avg} <span className="text-xs font-normal text-slate-500">/ 10</span></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase">Giỏi & Khá (≥6.5)</div>
              <div className="text-xl font-black text-emerald-600">
                {stats.gioiCount + stats.khaCount} <span className="text-xs font-normal text-slate-500">({stats.gioiPct + stats.khaPct}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase">Cao nhất / Thấp nhất</div>
              <div className="text-base font-black text-slate-800">
                {stats.max}đ <span className="text-xs text-slate-400 font-normal">/</span> {stats.min}đ
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên học sinh hoặc lớp..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả các lớp (16 lớp)</option>
              {schoolClasses.map(c => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </select>

            <select
              value={selectedRankFilter}
              onChange={(e) => setSelectedRankFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả xếp loại</option>
              <option value="gioi">Giỏi (≥ 8.0đ)</option>
              <option value="kha">Khá (6.5 - 7.9đ)</option>
              <option value="tb">Trung bình (5.0 - 6.4đ)</option>
              <option value="yeu">Chưa đạt (&lt; 5.0đ)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Hiển thị <span className="text-blue-900 font-black">{filteredSubmissions.length}</span> / {submissions.length} bài đã chấm
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4">
          {filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">Chưa có bài kiểm tra nào được chấm hoặc không khớp với bộ lọc.</p>
              <p className="text-xs text-slate-400 mt-1">Dùng tính năng Chấm Camera OMR để quét các bài thi và lưu vào hệ thống.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3 text-center">Lớp</th>
                    <th className="py-2.5 px-3 text-center">Mã đề</th>
                    <th className="py-2.5 px-3 text-center">Phần I (TN)</th>
                    <th className="py-2.5 px-3 text-center">Phần II (Đ/S)</th>
                    <th className="py-2.5 px-3 text-center">Phần III (TLN)</th>
                    <th className="py-2.5 px-3 text-center">Tự luận</th>
                    <th className="py-2.5 px-3 text-center font-black">Tổng điểm</th>
                    <th className="py-2.5 px-3 text-center">Xếp loại</th>
                    <th className="py-2.5 px-3 text-center">Thời gian chấm</th>
                    {onDeleteSubmission && <th className="py-2.5 px-3 text-center w-10">Xóa</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub, idx) => {
                    const p1 = sub.mcqScore ?? 0;
                    const p2 = sub.tfScore ?? 0;
                    const p3 = sub.saScore ?? 0;
                    const total = sub.totalScore ?? 0;
                    const essay = Math.max(0, Math.round((total - p1 - p2 - p3) * 10) / 10);

                    return (
                      <tr key={sub.id} className="hover:bg-blue-50/50 transition">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {sub.id.slice(-8)}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 text-[11px]">
                            {sub.className}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                          0101
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{p1.toFixed(1)}đ</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{p2.toFixed(1)}đ</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{p3.toFixed(1)}đ</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">{essay.toFixed(1)}đ</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-lg font-black text-sm bg-blue-50 text-blue-800 font-mono">
                            {total.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {getRankBadge(total)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[11px] text-slate-500 font-mono">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                        </td>
                        {onDeleteSubmission && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onDeleteSubmission(sub.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Xóa kết quả này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Dữ liệu được bảo toàn tự động trong CSDL trường THCS & THPT Y Đôn.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Đóng bảng tổng hợp
          </button>
        </div>

      </div>
    </div>
  );
}
