import React, { useState, useRef } from 'react';
import { 
  X, 
  RefreshCw, 
  Download, 
  Upload, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  ClipboardPaste,
  Copy, 
  Check, 
  Server,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { StudentSubmission, StudentRecord, Exam } from '../types';
import { 
  parseScoreboardExcelFile, 
  parseScoreboardFromText, 
  parseScoreboardFromJson, 
  exportScoreboardToExcel,
  ScoreboardImportResult 
} from '../utils/excelUtils';

interface SyncRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  exams: Exam[];
  submissions: StudentSubmission[];
  onUpdateSubmissions: (newSubmissions: StudentSubmission[]) => void;
  onUpdateStudents?: (newStudents: StudentRecord[]) => void;
}

export function SyncRestoreModal({
  isOpen,
  onClose,
  students,
  exams,
  submissions,
  onUpdateSubmissions,
  onUpdateStudents
}: SyncRestoreModalProps) {
  // Tabs: 'upload' (Up file Excel/JSON), 'paste' (Dán dữ liệu), 'download' (Tải xuống), 'remote' (Kéo từ link)
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'download' | 'remote'>('upload');
  
  // Import preview state
  const [pendingSubmissions, setPendingSubmissions] = useState<StudentSubmission[] | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Paste text state
  const [pastedText, setPastedText] = useState<string>('');

  // Remote sync state
  const [remoteUrl, setRemoteUrl] = useState<string>('https://ais-pre-oa7thmjdvcmj2zjzooh4cg-659208121969.asia-southeast1.run.app');
  const [isPullingRemote, setIsPullingRemote] = useState<boolean>(false);

  // Copy indicator
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Xử lý khi chọn file Excel (.xlsx, .xls) hoặc JSON (.json) hoặc CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setStatusMessage(null);
    setPendingSubmissions(null);

    try {
      const fileName = file.name.toLowerCase();
      let result: ScoreboardImportResult;

      if (fileName.endsWith('.json')) {
        const text = await file.text();
        result = parseScoreboardFromJson(text);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        result = await parseScoreboardExcelFile(file);
      } else {
        // Mặc định thử đọc dạng text/csv
        const text = await file.text();
        result = parseScoreboardFromText(text);
      }

      if (result.submissions.length === 0) {
        throw new Error('Không tìm thấy bản ghi bài làm nào trong tệp tin vừa chọn. Vui lòng kiểm tra lại định dạng file!');
      }

      setPendingSubmissions(result.submissions);
      setDetectedFormat(result.detectedFormat || file.name);
      setStatusMessage({
        type: 'info',
        text: `Đã đọc thành công ${result.submissions.length} bài nộp của học sinh từ file "${file.name}". Nhấn nút "Lưu và Cập nhật" bên dưới để hoàn tất!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi đọc tệp: ' + (err.message || 'Không thể nhận diện cấu trúc file')
      });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Xử lý khi nhấn nút Phân tích dữ liệu dán trực tiếp
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng dán nội dung bảng điểm hoặc chuỗi dữ liệu trước khi phân tích!' });
      return;
    }

    try {
      const result = parseScoreboardFromText(pastedText);
      if (result.submissions.length === 0) {
        throw new Error('Không nhận diện được dòng bài làm nào. Hãy kiểm tra các cột Họ tên, Lớp, Điểm.');
      }

      setPendingSubmissions(result.submissions);
      setDetectedFormat(result.detectedFormat || 'Dữ liệu dán trực tiếp');
      setStatusMessage({
        type: 'info',
        text: `Đã nhận diện ${result.submissions.length} bài làm học sinh. Nhấn nút "Lưu và Cập nhật" để áp dụng!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi phân tích: ' + (err.message || 'Cú pháp dữ liệu không phù hợp')
      });
    }
  };

  // 3. Áp dụng lưu kết quả vào hệ thống (Ghi đè hoặc Gộp)
  const handleApplyImport = async () => {
    if (!pendingSubmissions || pendingSubmissions.length === 0) return;

    try {
      let finalList: StudentSubmission[] = [];

      if (importMode === 'overwrite') {
        finalList = pendingSubmissions;
      } else {
        // Merge with existing
        const map = new Map<string, StudentSubmission>();
        submissions.forEach(s => map.set(s.id, s));
        pendingSubmissions.forEach(s => map.set(s.id, s));
        finalList = Array.from(map.values());
      }

      // 1. Cập nhật vào React state
      onUpdateSubmissions(finalList);

      // 2. Lưu vào LocalStorage
      localStorage.setItem('ydon_submissions', JSON.stringify(finalList));

      // 3. Đồng bộ lên máy chủ (Sync storage)
      await fetch('/api/sync/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          submissions: finalList, 
          overwrite: importMode === 'overwrite' 
        })
      });

      setStatusMessage({
        type: 'success',
        text: `Hoàn tất! Đã cập nhật thành công ${finalList.length} bài kiểm tra học sinh vào Bảng điểm hệ thống!`
      });
      setPendingSubmissions(null);
      setPastedText('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi khi lưu bảng điểm: ' + err.message
      });
    }
  };

  // 4. Kéo từ link App đã xuất bản
  const handlePullFromRemote = async () => {
    if (!remoteUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập đường link App đã xuất bản!' });
      return;
    }

    setIsPullingRemote(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/sync/pull-from-remote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remoteUrl: remoteUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể kết nối đến máy chủ từ xa');
      }

      if (Array.isArray(data.submissions) && data.submissions.length > 0) {
        onUpdateSubmissions(data.submissions);
        localStorage.setItem('ydon_submissions', JSON.stringify(data.submissions));
      }

      if (Array.isArray(data.students) && data.students.length > 0 && onUpdateStudents) {
        onUpdateStudents(data.students);
        localStorage.setItem('ydon_students', JSON.stringify(data.students));
      }

      setStatusMessage({
        type: 'success',
        text: `Thành công! Đã kéo về ${data.submissionsCount || 0} bài nộp của học sinh từ App đã xuất bản!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Lỗi: ' + (err.message || 'Không thể kết nối máy chủ từ xa. Thầy/Cô vui lòng tải file bảng điểm từ app cũ rồi Up lên tại Tab 1.')
      });
    } finally {
      setIsPullingRemote(false);
    }
  };

  // 5. Tải file sao lưu JSON
  const handleExportJsonBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      school: 'THCS và THPT Y Đôn',
      studentsCount: students.length,
      submissionsCount: submissions.length,
      students,
      submissions
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_BangDiem_YDon_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 6. Sao chép dữ liệu vào Clipboard
  const handleCopyScoreboardData = () => {
    if (submissions.length === 0) {
      alert('Hiện chưa có bài nộp nào trong hệ thống để sao chép.');
      return;
    }

    // Định dạng bảng tab-separated để có thể dán trực tiếp vào Excel
    const header = ['STT', 'Họ và tên học sinh', 'Lớp', 'Khối', 'Phân môn', 'Tên bài kiểm tra', 'Tổng điểm (thang 10)', 'Thời gian nộp'].join('\t');
    const rows = submissions.map((sub, i) => [
      i + 1,
      sub.studentName,
      sub.className,
      sub.grade || '',
      sub.subject === 'physics' ? 'Vật lí' : (sub.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'),
      sub.examTitle,
      sub.totalScore,
      sub.submittedAt || ''
    ].join('\t'));

    const textToCopy = [header, ...rows].join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
              <Upload className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cập Nhật & Up Bảng Điểm Học Sinh</h2>
              <p className="text-xs text-blue-100">
                Tải lên bảng điểm từ file Excel, JSON hoặc dán dữ liệu điểm để hệ thống cập nhật kết quả
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('upload'); setStatusMessage(null); }}
            className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-blue-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>1. Up File Excel / JSON</span>
          </button>

          <button
            onClick={() => { setActiveTab('paste'); setStatusMessage(null); }}
            className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-blue-600'
            }`}
          >
            <ClipboardPaste className="w-4 h-4 text-indigo-600" />
            <span>2. Dán Bảng Điểm Trực Tiếp</span>
          </button>

          <button
            onClick={() => { setActiveTab('download'); setStatusMessage(null); }}
            className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-blue-600'
            }`}
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>3. Tải Xuống / Sao Lưu</span>
          </button>

          <button
            onClick={() => { setActiveTab('remote'); setStatusMessage(null); }}
            className={`pb-3 px-3.5 font-bold text-xs sm:text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'remote'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-blue-600'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-600" />
            <span>4. Kéo Từ App Xuất Bản (URL)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: UP FILE EXCEL / JSON */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-900 leading-relaxed">
                <div className="font-bold flex items-center space-x-1.5 mb-1 text-emerald-950">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Cập nhật bảng điểm từ file Excel hoặc file sao lưu JSON</span>
                </div>
                Thầy/Cô hãy tải file bảng điểm kiểm tra (file <strong>.xlsx</strong> vừa tải từ nút <em>"Tải về Excel"</em> trên App đã xuất bản, hoặc file sao lưu <strong>.json</strong>). Hệ thống sẽ tự động quét toàn bộ bài làm học sinh và cập nhật vào Bảng điểm.
              </div>

              {/* Khu vực chọn file */}
              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-emerald-50/30 transition-all flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Chọn tệp bảng điểm từ máy tính hoặc điện thoại
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ: File Excel (<strong>.xlsx</strong>, <strong>.xls</strong>), File sao lưu (<strong>.json</strong>), hoặc <strong>.csv</strong>
                  </p>
                </div>

                <label className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-sm flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>{isProcessingFile ? 'Đang đọc tệp...' : 'Bấm vào đây để chọn File Up lên'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Xem trước kết quả phân tích & Lựa chọn Ghi đè/Gộp */}
              {pendingSubmissions && pendingSubmissions.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-800">
                        Đã nhận diện: <span className="text-emerald-700 text-base">{pendingSubmissions.length}</span> bài làm học sinh
                      </span>
                      <span className="text-xs text-slate-500 font-mono">({detectedFormat})</span>
                    </div>

                    {/* Tùy chọn Ghi đè hay Gộp */}
                    <div className="flex items-center space-x-3 text-xs bg-white p-1.5 rounded-lg border border-slate-200">
                      <label className="flex items-center space-x-1 cursor-pointer font-bold text-slate-800">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                          className="text-blue-600"
                        />
                        <span>Ghi đè hoàn toàn (Đúng {pendingSubmissions.length} bài)</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer text-slate-600">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-blue-600"
                        />
                        <span>Gộp thêm</span>
                      </label>
                    </div>
                  </div>

                  {/* Danh sách xem trước 5 bài đầu */}
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold">
                        <tr>
                          <th className="p-2">STT</th>
                          <th className="p-2">Họ và tên</th>
                          <th className="p-2">Lớp</th>
                          <th className="p-2">Bài kiểm tra</th>
                          <th className="p-2 text-center">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingSubmissions.slice(0, 8).map((sub, idx) => (
                          <tr key={sub.id || idx} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{sub.studentName}</td>
                            <td className="p-2 font-mono text-slate-700">{sub.className}</td>
                            <td className="p-2 text-slate-600 truncate max-w-[200px]">{sub.examTitle}</td>
                            <td className="p-2 text-center font-bold text-emerald-700">{sub.totalScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pendingSubmissions.length > 8 && (
                    <p className="text-[11px] text-slate-500 italic text-right">
                      ... và {pendingSubmissions.length - 8} bài làm khác của học sinh.
                    </p>
                  )}

                  <button
                    onClick={handleApplyImport}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>⚡ Lưu & Cập Nhật Bảng Điểm Ngay ({pendingSubmissions.length} bài)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DÁN BẢNG ĐIỂM TRỰC TIẾP (KHI KHÔNG CHO TẢI FILE EXCEL) */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs sm:text-sm text-indigo-900 leading-relaxed">
                <div className="font-bold flex items-center space-x-1.5 mb-1 text-indigo-950">
                  <ClipboardPaste className="w-4 h-4 text-indigo-700" />
                  <span>Dán bảng điểm trực tiếp từ Excel hoặc Google Sheets (Không cần tải file)</span>
                </div>
                Nếu trình duyệt hoặc thiết bị của Thầy/Cô hạn chế tải file Excel, Thầy/Cô chỉ cần mở file Excel trên máy:
                <ol className="list-decimal pl-5 mt-1 space-y-0.5">
                  <li>Chọn các dòng hoặc toàn bộ bảng tính trong Excel rồi nhấn <strong>Ctrl + C</strong> (Sao chép).</li>
                  <li>Dán (<strong>Ctrl + V</strong>) trực tiếp vào khung bên dưới rồi nhấn nút <strong>"Phân tích & Cập nhật"</strong>.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Khung dán dữ liệu bảng điểm từ Excel / CSV / JSON:
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Ví dụ sao chép từ Excel rồi dán vào đây:
STT	Họ và tên học sinh	Lớp	Tổng điểm	Tên bài kiểm tra
1	Nguyễn Văn An	8A1	8.5	Đề 1 - Vật lí 8
2	Trần Thị Mai	8A1	9.0	Đề 1 - Vật lí 8
...`}
                  rows={6}
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPastedText('')}
                  disabled={!pastedText}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Xóa khung
                </button>
                <button
                  onClick={handleParsePastedText}
                  disabled={!pastedText.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Phân Tích Dữ Liệu Dán</span>
                </button>
              </div>

              {/* Xem trước kết quả dán */}
              {pendingSubmissions && pendingSubmissions.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Tìm thấy: <strong className="text-emerald-700">{pendingSubmissions.length}</strong> bài làm học sinh</span>
                    </span>

                    <div className="flex items-center space-x-3 text-xs bg-white p-1.5 rounded-lg border border-slate-200">
                      <label className="flex items-center space-x-1 cursor-pointer font-bold text-slate-800">
                        <input
                          type="radio"
                          name="pasteMode"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                          className="text-blue-600"
                        />
                        <span>Ghi đè (Đúng {pendingSubmissions.length} bài)</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer text-slate-600">
                        <input
                          type="radio"
                          name="pasteMode"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-blue-600"
                        />
                        <span>Gộp thêm</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleApplyImport}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>⚡ Lưu & Cập Nhật Bảng Điểm Ngay ({pendingSubmissions.length} bài)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TẢI XUỐNG & SAO LƯU */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Tải về file Excel */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-bold text-sm text-emerald-950 flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Bảng Điểm Excel (.xlsx)</span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Xuất {submissions.length} bài thi ra file Excel chuẩn của nhà trường để in ấn, lưu trữ hoặc nộp ban giám hiệu.
                    </p>
                  </div>
                  <button
                    onClick={() => exportScoreboardToExcel(submissions)}
                    disabled={submissions.length === 0}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Về File Excel (.xlsx)</span>
                  </button>
                </div>

                {/* 2. Tải về file sao lưu JSON */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-bold text-sm text-blue-950 flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Tệp Sao Lưu (.json)</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Tệp sao lưu chứa đầy đủ 100% dữ liệu gốc để có thể nạp lại bất cứ lúc nào trên mọi thiết bị.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJsonBackup}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Về Tệp Sao Lưu (.json)</span>
                  </button>
                </div>

                {/* 3. Sao chép vào Clipboard */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Sao Chép Vào Bộ Nhớ</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Sao chép toàn bộ bảng điểm vào bộ nhớ tạm (Clipboard) để dán trực tiếp vào Excel hoặc Word.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyScoreboardData}
                    disabled={submissions.length === 0}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSuccess ? 'Đã sao chép!' : 'Sao Chép Bảng Điểm'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: KÉO TỪ LINK APP XUẤT BẢN */}
          {activeTab === 'remote' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs sm:text-sm text-sky-900 leading-relaxed">
                <div className="font-bold flex items-center space-x-1.5 mb-1 text-sky-950">
                  <Server className="w-4 h-4 text-sky-700" />
                  <span>Kéo kết quả học sinh trực tiếp từ App đã xuất bản</span>
                </div>
                Nhập đường dẫn App xuất bản của Thầy/Cô. Hệ thống sẽ thử kết nối trực tiếp đến máy chủ từ xa và chuyển kết quả nộp bài của học sinh về phiên bản hiện tại.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Đường dẫn (URL) App đã xuất bản của Thầy/Cô:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://ais-pre-...run.app"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handlePullFromRemote}
                    disabled={isPullingRemote}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPullingRemote ? 'animate-spin' : ''}`} />
                    <span>{isPullingRemote ? 'Đang kết nối...' : 'Kéo Kết Quả Ngay'}</span>
                  </button>
                </div>
              </div>

              {/* Gợi ý các link */}
              <div>
                <span className="text-xs text-slate-500 font-semibold">Chọn nhanh link hệ thống:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    onClick={() => setRemoteUrl('https://ais-pre-oa7thmjdvcmj2zjzooh4cg-659208121969.asia-southeast1.run.app')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    🔗 Link Chia Sẻ (Shared App URL)
                  </button>
                  <button
                    onClick={() => setRemoteUrl('https://ais-dev-oa7thmjdvcmj2zjzooh4cg-659208121969.asia-southeast1.run.app')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    🔗 Link Phát Triển (Dev App URL)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thông báo kết quả trạng thái */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : (statusMessage.type === 'error' 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200')
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-600 shrink-0" />
              ))}
              <div>{statusMessage.text}</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Hiện có: <strong className="text-blue-700 text-sm">{submissions.length}</strong> bài nộp trong Bảng điểm</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
