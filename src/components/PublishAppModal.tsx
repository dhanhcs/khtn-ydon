import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Globe, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Archive, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  FolderArchive,
  CheckCircle,
  Info
} from 'lucide-react';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublishAppModal({ isOpen, onClose }: PublishAppModalProps) {
  const [buildStatus, setBuildStatus] = useState<{ hasDist: boolean; fileCount: number; totalSizeMB: number; lastBuilt: string | null } | null>(null);
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [isDownloadingPublishZip, setIsDownloadingPublishZip] = useState<boolean>(false);
  const [isDownloadingSourceZip, setIsDownloadingSourceZip] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchBuildStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/build-status');
      if (res.ok) {
        const data = await res.json();
        setBuildStatus(data);
      }
    } catch (err) {
      console.warn('Cannot fetch build status:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBuildStatus();
    }
  }, [isOpen, fetchBuildStatus]);

  // Biên dịch lại bản web mới nhất
  const handleRebuildDist = async () => {
    try {
      setIsRebuilding(true);
      setStatusMsg({ type: 'info', text: 'Đang biên dịch (Vite build) toàn bộ ứng dụng sang thư mục dist... Vui lòng đợi trong giây lát!' });
      const res = await fetch('/api/admin/rebuild-dist', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Biên dịch thất bại');
      }
      setStatusMsg({ type: 'success', text: '✅ Đã biên dịch ứng dụng thành công 100%! Bạn có thể tải ngay tệp ZIP bên dưới để đưa lên Netlify.' });
      await fetchBuildStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: '❌ Lỗi khi biên dịch: ' + err.message });
    } finally {
      setIsRebuilding(false);
    }
  };

  // Tải tệp ZIP xuất bản Netlify (Gói dist hoàn chỉnh)
  const handleDownloadPublishZip = async () => {
    try {
      setIsDownloadingPublishZip(true);
      setStatusMsg({ type: 'info', text: 'Đang đóng gói tệp ZIP xuất bản Netlify (HTML/CSS/JS, _redirects, netlify.toml)...' });
      
      const res = await fetch('/api/admin/export-publish-zip');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Không thể tạo tệp zip xuất bản từ máy chủ');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `khtn-thcs-thpt-ydon-netlify-publish.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMsg({
        type: 'success',
        text: '✅ Đã tải tệp ZIP xuất bản Netlify thành công! Hãy mở trang app.netlify.com/drop và kéo thả tệp này vào để website hoạt động ngay.'
      });
      await fetchBuildStatus();
    } catch (err: any) {
      console.error('Download publish zip error:', err);
      setStatusMsg({ type: 'error', text: '❌ Lỗi tải tệp ZIP: ' + err.message });
    } finally {
      setIsDownloadingPublishZip(false);
    }
  };

  // Tải tệp ZIP mã nguồn dự án đầy đủ
  const handleDownloadSourceZip = async () => {
    try {
      setIsDownloadingSourceZip(true);
      setStatusMsg({ type: 'info', text: 'Đang đóng gói toàn bộ mã nguồn dự án (.zip)...' });
      
      const res = await fetch('/api/admin/export-source-zip');
      if (!res.ok) {
        throw new Error('Không thể tạo tệp zip mã nguồn');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `khtn-thcs-thpt-ydon-source-code.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMsg({
        type: 'success',
        text: '✅ Đã tải tệp ZIP mã nguồn dự án thành công!'
      });
    } catch (err: any) {
      console.error('Download source zip error:', err);
      setStatusMsg({ type: 'error', text: '❌ Lỗi tải mã nguồn: ' + err.message });
    } finally {
      setIsDownloadingSourceZip(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-teal-800/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-mono tracking-wider">
                  XUẤT BẢN APP LÊN NETLIFY
                </span>
                <span className="text-xs text-teal-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white mt-0.5">
                Tải Tệp ZIP Xuất Bản Web Lên Netlify Miễn Phí
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng bảng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800">
          
          {/* Status Message */}
          {statusMsg && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in ${
              statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
              statusMsg.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
              'bg-blue-50 border-blue-300 text-blue-900'
            }`}>
              <div className="flex items-center gap-2">
                {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMsg(null)}
                className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Real-time Status Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Trạng thái gói biên dịch (dist)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Sẵn sàng tải về 100%
                  </span>
                  {buildStatus && (
                    <span className="text-xs text-slate-600 font-semibold">
                      • {buildStatus.fileCount} tệp tin (~{buildStatus.totalSizeMB} MB)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRebuildDist}
              disabled={isRebuilding}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Biên dịch lại toàn bộ dự án từ mã nguồn mới nhất"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRebuilding ? 'animate-spin' : ''}`} />
              <span>{isRebuilding ? 'Đang biên dịch lại...' : 'Biên dịch lại bản mới'}</span>
            </button>
          </div>

          {/* 2 Big Action Download Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* THẺ 1: TẢI TỆP ZIP XUẤT BẢN NETLIFY (KHUYÊN DÙNG) */}
            <div className="bg-gradient-to-b from-emerald-50/80 to-white p-5 rounded-3xl border-2 border-emerald-500/80 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                  ⭐ Khuyên dùng 1 chạm
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Gói ZIP Xuất Bản Netlify (dist)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Đã đóng gói hoàn chỉnh HTML, CSS, JavaScript, KaTeX, Icons. Tích hợp sẵn <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono text-[10px]">_redirects</code> chống lỗi 404 khi F5 trên Netlify!
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chỉ việc kéo thả lên Netlify là chạy ngay</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Kèm tệp _redirects và netlify.toml</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  id="modal-download-publish-zip-btn"
                  onClick={handleDownloadPublishZip}
                  disabled={isDownloadingPublishZip}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 ring-2 ring-emerald-300"
                >
                  {isDownloadingPublishZip ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang đóng gói tệp ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>TẢI TỆP ZIP XUẤT BẢN APP (UP LÊN NETLIFY)</span>
                    </>
                  )}
                </button>

                <a
                  href="/api/admin/export-publish-zip"
                  download="khtn-thcs-thpt-ydon-netlify-publish.zip"
                  className="w-full py-2 px-3 bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-300 transition-colors text-center cursor-pointer"
                  title="Link tải trực tiếp tệp ZIP từ máy chủ (khtn-thcs-thpt-ydon-netlify-publish.zip)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Link Tải Trực Tiếp Dự Phòng (.ZIP)</span>
                </a>
              </div>
            </div>

            {/* THẺ 2: TẢI TOÀN BỘ MÃ NGUỒN */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Toàn Bộ Mã Nguồn Dự Án (.ZIP)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Chứa toàn bộ source code (TypeScript, React, Vite, Tailwind CSS, components) để Thầy/Cô đẩy lên GitHub/GitLab liên kết tự động build trên Netlify.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Thư mục src/, public/, package.json, vite.config.ts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>Đã tự động loại bỏ node_modules (siêu nhẹ)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="modal-download-source-zip-btn"
                onClick={handleDownloadSourceZip}
                disabled={isDownloadingSourceZip}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloadingSourceZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang nén mã nguồn...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>TẢI TOÀN BỘ MÃ NGUỒN (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Steps to Netlify Walkthrough */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">
                  Hướng dẫn triển khai 1 phút
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  4 Bước Đưa Website Lên Netlify Miễn Phí
                </h4>
              </div>
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span>Mở Netlify Drop</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center">1</span>
                <span className="font-bold text-slate-900 block text-xs">Tải Tệp ZIP</span>
                <p className="text-[11px] text-slate-600">Bấm nút "TẢI TỆP ZIP XUẤT BẢN NETLIFY" ở trên về máy tính.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center">2</span>
                <span className="font-bold text-slate-900 block text-xs">Mở Netlify Drop</span>
                <p className="text-[11px] text-slate-600">Truy cập <strong>app.netlify.com/drop</strong> trên trình duyệt.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center">3</span>
                <span className="font-bold text-slate-900 block text-xs">Kéo Thả Tệp ZIP</span>
                <p className="text-[11px] text-slate-600">Kéo file ZIP vừa tải thả vào khung trên trang Netlify.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center">4</span>
                <span className="font-bold text-slate-900 block text-xs">Đổi Tên Miền</span>
                <p className="text-[11px] text-slate-600">Vào Site settings &gt; Change site name để đổi thành tên trường.</p>
              </div>
            </div>

            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Định tuyến SPA:</strong> Tệp zip đã có sẵn <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px]">_redirects</code> chống lỗi 404 khi tải lại trang (F5) trên Netlify.
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
