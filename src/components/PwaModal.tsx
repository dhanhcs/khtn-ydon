import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ArrowDownToLine,
  Globe,
  Copy,
  Check,
  QrCode,
  Save,
  Info,
  Download,
  FileArchive,
  Rocket,
  Smartphone,
} from 'lucide-react';

export const PwaModal: React.FC = () => {
  const {
    isPwaModalOpen,
    setIsPwaModalOpen,
    pwaModalMode,
    setPwaModalMode,
    showToast,
    settings,
    updateSettings,
    setActivePage,
  } = useApp();
  const { isAdmin } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadingDeploy, setDownloadingDeploy] = useState(false);
  const [downloadingSource, setDownloadingSource] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const activeUrl =
    settings.customDomainUrl && settings.customDomainUrl !== 'https://hochoandh.ai.studio'
      ? settings.customDomainUrl
      : currentOrigin;

  const [customUrlInput, setCustomUrlInput] = useState(
    settings.customDomainUrl && settings.customDomainUrl !== 'https://hochoandh.ai.studio'
      ? settings.customDomainUrl
      : ''
  );

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isPwaModalOpen) return null;

  // Non-admins can NEVER see the 'publish' mode
  const effectiveMode: 'install' | 'publish' = isAdmin ? pwaModalMode : 'install';

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Đang cài đặt ứng dụng ra màn hình chính...', 'success');
        setIsPwaModalOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      showToast('Trình duyệt hiện tại đang dùng hướng dẫn thủ công bên dưới.', 'info');
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    showToast('Đã sao chép đường dẫn!', 'success');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleSaveCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    updateSettings({
      ...settings,
      customDomainUrl: trimmed,
    });
    showToast('Đã lưu địa chỉ Web chính thức của cổng học tập!', 'success');
  };

  const handleDownloadZip = async (type: 'deploy' | 'source') => {
    try {
      if (type === 'deploy') setDownloadingDeploy(true);
      else setDownloadingSource(true);

      const endpoint = type === 'deploy' ? '/api/export/deploy-zip' : '/api/export/source-zip';
      const filename =
        type === 'deploy' ? 'hochoandh-web-xuat-ban-ngay.zip' : 'hochoandh-ma-nguon-day-du.zip';

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('Không thể tải gói tệp tin từ máy chủ.');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        type === 'deploy'
          ? 'Đã tải xuống gói Web xuất bản ngay (hochoandh-web-xuat-ban-ngay.zip)!'
          : 'Đã tải xuống toàn bộ mã nguồn (hochoandh-ma-nguon-day-du.zip)!',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải tệp ZIP.', 'error');
    } finally {
      if (type === 'deploy') setDownloadingDeploy(false);
      else setDownloadingSource(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`text-white p-4 flex items-center justify-between sticky top-0 z-10 ${
            effectiveMode === 'publish'
              ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-700'
              : 'bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {effectiveMode === 'publish' ? (
              <Globe className="w-5 h-5 text-amber-200" />
            ) : (
              <Smartphone className="w-5 h-5 text-cyan-200" />
            )}
            <h3 className="font-extrabold text-base">
              {effectiveMode === 'publish'
                ? 'Xuất Bản Trang Web & Tải Mã Nguồn (Quản Trị Viên)'
                : 'Tải & Cài Đặt App Hóa Học NĐH'}
            </h3>
          </div>
          <button
            onClick={() => setIsPwaModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tab (Visible ONLY to Admin) */}
        {isAdmin && (
          <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex gap-2">
            <button
              onClick={() => setPwaModalMode('install')}
              className={`px-4 py-2 rounded-t-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                effectiveMode === 'install'
                  ? 'bg-white text-cyan-800 border-t border-x border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải App (Giao diện mọi người)</span>
            </button>
            <button
              onClick={() => setPwaModalMode('publish')}
              className={`px-4 py-2 rounded-t-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                effectiveMode === 'publish'
                  ? 'bg-white text-amber-800 border-t border-x border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Xuất bản Web (Chỉ Quản trị)</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* ADMIN ONLY: Web Publish & Source Code Export View */}
          {isAdmin && effectiveMode === 'publish' && (
            <>
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Rocket className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-1">
                    <div className="font-extrabold text-sm text-emerald-900">
                      Tải Trực Tiếp Gói Web Để Xuất Bản Miễn Phí (Chỉ 30 giây)
                    </div>
                    <p className="leading-relaxed">
                      Vì nút <strong>Publish</strong> của Google AI Studio yêu cầu tài khoản Google Cloud doanh nghiệp riêng, thầy có thể dùng <strong>2 nút tải trực tiếp dành riêng cho Quản trị viên</strong> dưới đây để xuất bản miễn phí:
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsPwaModalOpen(false);
                    setActivePage('export-sync-app');
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Rocket className="w-4 h-4 shrink-0" />
                  <span>Mở Thư Mục: Xuất và đồng bộ app (Đầy đủ 3 Cách Netlify & GitHub .APK)</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleDownloadZip('deploy')}
                    disabled={downloadingDeploy}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {downloadingDeploy
                        ? 'Đang đóng gói Web...'
                        : '1. Tải Gói Web Xuất Bản Ngay (.ZIP)'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDownloadZip('source')}
                    disabled={downloadingSource}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileArchive className="w-4 h-4 shrink-0 text-amber-300" />
                    <span>
                      {downloadingSource
                        ? 'Đang nén mã nguồn...'
                        : '2. Tải Toàn Bộ Mã Nguồn (.ZIP)'}
                    </span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-[11px] text-slate-700 space-y-1.5">
                  <div className="font-extrabold text-emerald-900">
                    Cách lấy link web công khai miễn phí trong 30 giây:
                  </div>
                  <div>
                    <strong>Bước 1:</strong> Bấm nút màu xanh <strong>"1. Tải Gói Web Xuất Bản Ngay (.ZIP)"</strong> ở trên để tải tệp <code>hochoandh-web-xuat-ban-ngay.zip</code> về máy.
                  </div>
                  <div>
                    <strong>Bước 2:</strong> Mở trang <strong>app.netlify.com/drop</strong> (hoặc <strong>tiiny.host</strong>), kéo thả tệp ZIP vừa tải vào khung giữa màn hình. Hệ thống sẽ cấp ngay đường link web công khai (đã kết nối sẵn cơ sở dữ liệu Firebase của thầy) để gửi cho học sinh!
                  </div>
                </div>
              </div>

              {/* Admin input to save real deployed URL */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Cập nhật Link Web Chính Thức cho Mã QR:</strong> Sau khi có đường link thật, thầy dán vào ô dưới đây để tự động đồng bộ Mã QR cho toàn bộ học sinh và phụ huynh:
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="Dán link web sau khi xuất bản vào đây (VD: https://hochoandh.netlify.app)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleSaveCustomUrl}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Link</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* EVERYONE: App Installation & QR Share View */}
          {effectiveMode === 'install' && (
            <>
              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-teal-800 mb-2">
                    Thiết bị của bạn hỗ trợ cài đặt App trực tiếp chỉ với 1 chạm!
                  </span>
                  <button
                    onClick={handleInstallClick}
                    className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Cài đặt App ra Màn hình chính ngay</span>
                  </button>
                </div>
              )}

              {/* Active URL & QR Code */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 space-y-3">
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-slate-800">
                    Đường dẫn truy cập Cổng học tập Hóa Học NĐH:
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-cyan-300 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-900 truncate">
                      {activeUrl}
                    </span>
                    <button
                      onClick={() => handleCopyLink(activeUrl)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* QR Code for the Website Link */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      activeUrl
                    )}`}
                    alt="QR Code Trang Web Hóa Học NĐH"
                    className="w-28 h-28 rounded-lg border border-slate-200 p-1 shrink-0"
                  />
                  <div className="space-y-1.5 text-xs text-slate-600 text-center sm:text-left">
                    <div className="font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4 h-4 text-cyan-600" />
                      <span>Quét Mã QR Để Mở & Tải App Trên Điện Thoại</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      Mở Camera điện thoại hoặc Zalo quét mã QR bên cạnh để mở nhanh Cổng học tập và cài đặt biểu tượng App Hóa Học NĐH ra màn hình chính.
                    </p>
                  </div>
                </div>
              </div>

              {/* OS Tabs for PWA Installation */}
              <div>
                <div className="text-xs font-extrabold text-slate-800 mb-2 uppercase">
                  Hướng dẫn cài đặt App ra màn hình chính điện thoại & máy tính:
                </div>
                <div className="flex border-b border-slate-200 mb-3 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('android')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'android'
                        ? 'border-cyan-600 text-cyan-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Android (Samsung, Oppo...)
                  </button>
                  <button
                    onClick={() => setActiveTab('ios')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'ios'
                        ? 'border-cyan-600 text-cyan-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    iPhone / iPad (iOS)
                  </button>
                  <button
                    onClick={() => setActiveTab('pc')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'pc'
                        ? 'border-cyan-600 text-cyan-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Máy tính (Windows / Mac)
                  </button>
                </div>

                {activeTab === 'android' && (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Mở Cổng học tập bằng trình duyệt <strong>Google Chrome</strong> trên điện thoại.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Bấm vào biểu tượng <strong>Ba chấm (⋮)</strong> ở góc trên bên phải màn hình trình duyệt.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Mở trang web bằng trình duyệt <strong>Safari</strong> trên iPhone / iPad.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Bấm vào nút <strong>Chia sẻ (Share)</strong> hình ô vuông có mũi tên chỉ lên ở thanh dưới đáy màn hình.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> rồi bấm <strong>Thêm</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'pc' && (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Mở trang web trên máy tính bằng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Bấm vào biểu tượng <strong>Cài đặt ứng dụng</strong> ở phía cuối thanh địa chỉ (URL) và chọn <strong>Cài đặt</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsPwaModalOpen(false)}
              className="py-2 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
