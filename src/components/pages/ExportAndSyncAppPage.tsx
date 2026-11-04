import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Rocket,
  Download,
  ExternalLink,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Github,
  Smartphone,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Globe,
  FileArchive,
  Zap,
  QrCode,
  Info,
  AlertCircle,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface SyncConfigState {
  siteName: string;
  siteId: string;
  siteUrl: string;
  netlifyToken: string;
  netlifyBuildHookUrl: string;
  githubRepo: string;
  githubToken: string;
  githubBranch: string;
  autoSyncOnEdit: boolean;
  lastDeployedAt: string;
  lastGithubSyncedAt: string;
  deployCount: number;
}

const LOCAL_SYNC_CONFIG_KEY = 'ndh_export_sync_config_v1';

export const ExportAndSyncAppPage: React.FC = () => {
  const { setActivePage, showToast, settings, updateSettings } = useApp();
  const { isAdmin } = useAuth();

  const [config, setConfig] = useState<SyncConfigState>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_SYNC_CONFIG_KEY);
      if (raw) {
        return {
          siteName: 'hoahoc_thcs_ndh',
          siteId: '',
          siteUrl: '',
          netlifyToken: '',
          netlifyBuildHookUrl: '',
          githubRepo: '',
          githubToken: '',
          githubBranch: 'main',
          autoSyncOnEdit: true,
          lastDeployedAt: '',
          lastGithubSyncedAt: '',
          deployCount: 0,
          ...JSON.parse(raw),
        };
      }
    } catch {}
    return {
      siteName: 'hoahoc_thcs_ndh',
      siteId: '',
      siteUrl:
        settings.customDomainUrl && settings.customDomainUrl.includes('.netlify.app')
          ? settings.customDomainUrl
          : '',
      netlifyToken: '',
      netlifyBuildHookUrl: '',
      githubRepo: '',
      githubToken: '',
      githubBranch: 'main',
      autoSyncOnEdit: true,
      lastDeployedAt: '',
      lastGithubSyncedAt: '',
      deployCount: 0,
    };
  });

  const [downloadingDropZip, setDownloadingDropZip] = useState(false);
  const [downloadingGithubZip, setDownloadingGithubZip] = useState(false);
  const [deployingNetlify, setDeployingNetlify] = useState(false);
  const [pushingGithub, setPushingGithub] = useState(false);
  const [savingAutoSync, setSavingAutoSync] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Load saved sync config from backend & Cloud Firestore on mount
  useEffect(() => {
    let mounted = true;
    async function loadRemoteConfig() {
      try {
        const res = await fetch('/api/sync-config');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (mounted && data?.config) {
            setConfig((prev) => {
              const next = { ...prev, ...data.config };
              try {
                localStorage.setItem(LOCAL_SYNC_CONFIG_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
            return;
          }
        }
      } catch {}

      try {
        const snap = await getDoc(doc(db, 'app_settings', 'netlify_sync_config'));
        if (mounted && snap.exists()) {
          const fsData = snap.data() as Partial<SyncConfigState>;
          setConfig((prev) => {
            const next = { ...prev, ...fsData };
            try {
              localStorage.setItem(LOCAL_SYNC_CONFIG_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      } catch {}
    }
    loadRemoteConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const persistSyncConfig = async (partial: Partial<SyncConfigState>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    try {
      localStorage.setItem(LOCAL_SYNC_CONFIG_KEY, JSON.stringify(next));
    } catch {}

    try {
      await fetch('/api/sync-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } catch {}

    try {
      await setDoc(
        doc(db, 'app_settings', 'netlify_sync_config'),
        { ...next, updatedAt: Date.now() },
        { merge: true }
      );
    } catch {}

    return next;
  };

  // Cách 1: Tải Gói Kéo-Thả Netlify (Đã Build sẵn)
  const handleDownloadPrebuiltDropZip = async () => {
    setDownloadingDropZip(true);
    try {
      const res = await fetch('/api/export/deploy-zip?rebuild=1');
      if (!res.ok) {
        throw new Error('Không thể đóng gói bản Build sẵn từ máy chủ.');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'hoahoc-thcs-ndh-netlify-build-san.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        'Đã tải gói Kéo-Thả Netlify (Đã Build sẵn)! Hãy kéo thả file .zip này vào trang app.netlify.com/drop.',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải gói Build sẵn.', 'error');
    } finally {
      setDownloadingDropZip(false);
    }
  };

  // Cách 3: Tải Gói Mã Nguồn GitHub (.ZIP)
  const handleDownloadGithubSourceZip = async () => {
    setDownloadingGithubZip(true);
    try {
      const res = await fetch('/api/export/source-zip');
      if (!res.ok) {
        throw new Error('Không thể tải gói mã nguồn GitHub từ máy chủ.');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'hoahoc-thcs-ndh-github-source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showToast(
        'Đã tải Gói Mã Nguồn GitHub (.ZIP) kèm cấu hình netlify.toml và xuất file .APK tự động!',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải gói mã nguồn GitHub.', 'error');
    } finally {
      setDownloadingGithubZip(false);
    }
  };

  // Cách 2: Xuất bản Tự động 1 Chạm ngay trong App lên Netlify
  const handleOneClickNetlifyDeploy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDeployError(null);

    const cleanToken = config.netlifyToken.trim();
    const cleanHook = config.netlifyBuildHookUrl.trim();
    if (!cleanToken && !cleanHook) {
      const msg =
        'Vui lòng bấm "Lấy mã Token" để tạo mã Personal Access Token (nfp_...) trên Netlify rồi dán vào ô trước khi xuất bản.';
      setDeployError(msg);
      showToast(msg, 'error');
      return;
    }

    setDeployingNetlify(true);
    try {
      const res = await fetch('/api/netlify/deploy-one-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: config.siteName.trim() || 'hoahoc_thcs_ndh',
          token: cleanToken,
          autoSyncOnEdit: config.autoSyncOnEdit,
          netlifyBuildHookUrl: cleanHook,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Không thể đẩy bản build lên Netlify.');
      }

      const liveUrl = data.siteUrl || `https://${data.siteName}.netlify.app`;
      await persistSyncConfig({
        siteName: data.siteName || config.siteName,
        siteId: data.siteId || config.siteId,
        siteUrl: liveUrl,
        lastDeployedAt: data.deployedAt || new Date().toISOString(),
        deployCount: (config.deployCount || 0) + 1,
      });

      updateSettings({
        ...settings,
        customDomainUrl: liveUrl,
      });

      showToast(`Xuất bản tự động thành công! Đường dẫn: ${liveUrl}`, 'success');
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi khi xuất bản tự động lên Netlify.';
      setDeployError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setDeployingNetlify(false);
    }
  };

  // Cách 3 (Nâng cao): Đẩy trực tiếp mã nguồn lên GitHub & kích hoạt tự động đồng bộ
  const handlePushToGithub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGithubError(null);

    if (!config.githubRepo.trim() || !config.githubToken.trim()) {
      const msg =
        'Vui lòng nhập Tên kho GitHub (ví dụ: ten-ban/hoahoc-thcs-ndh) và Mã GitHub Token (ghp_...) để đẩy tự động.';
      setGithubError(msg);
      showToast(msg, 'error');
      return;
    }

    setPushingGithub(true);
    try {
      const res = await fetch('/api/github/push-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubRepo: config.githubRepo.trim(),
          githubToken: config.githubToken.trim(),
          githubBranch: config.githubBranch.trim() || 'main',
          autoSyncOnEdit: config.autoSyncOnEdit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Lỗi khi đồng bộ mã nguồn lên GitHub.');
      }

      await persistSyncConfig({
        githubRepo: data.config?.githubRepo || config.githubRepo,
        lastGithubSyncedAt: data.syncedAt || new Date().toISOString(),
      });

      showToast(
        `Đã đẩy ${data.filesCount || ''} tệp mã nguồn lên GitHub (${data.repoUrl})! Netlify & GitHub APK sẽ tự động cập nhật.`,
        'success'
      );
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể đẩy mã nguồn lên GitHub.';
      setGithubError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setPushingGithub(false);
    }
  };

  const handleToggleAutoSync = async (checked: boolean) => {
    setSavingAutoSync(true);
    try {
      await persistSyncConfig({ autoSyncOnEdit: checked });
      showToast(
        checked
          ? 'Đã BẬT tự động cập nhật lên netlify.app / GitHub mỗi khi chỉnh sửa app trên Google AI Studio!'
          : 'Đã tắt tự động cập nhật nền.',
        'success'
      );
    } finally {
      setSavingAutoSync(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Đã sao chép đường link trang web!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const previewCleanSubdomain = (config.siteName || 'hoahoc_thcs_ndh')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '-');

  const activeLiveUrl =
    config.siteUrl ||
    (settings.customDomainUrl && settings.customDomainUrl.includes('.netlify.app')
      ? settings.customDomainUrl
      : '');

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-lg font-extrabold text-slate-900">
          Khu Vực Dành Riêng Cho Quản Trị Viên
        </h3>
        <p className="text-xs text-slate-600">
          Vui lòng đăng nhập tài khoản Quản trị viên (Thầy Nguyễn Đình Hành) để sử dụng thư mục Xuất và đồng bộ app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 text-xs font-extrabold border border-emerald-600">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>THƯ MỤC QUẢN TRỊ: XUẤT VÀ ĐỒNG BỘ APP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              3 Cách Xuất Bản Lên Netlify & Đồng Bộ Tự Động (Chạy 100%)
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
              Chọn bất kỳ cách nào trong 3 cách dưới đây đều chạy ngay 100%: Học sinh đăng nhập, làm bài kiểm tra, nộp bài tập về nhà và đồng bộ danh sách học sinh thời gian thực trên mọi thiết bị.
            </p>
          </div>

          <button
            onClick={() => setActivePage('admin-dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Bảng Quản Trị</span>
          </button>
        </div>

        {/* Auto-Sync Master Bar (Google AI Studio -> Netlify.app / GitHub) */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-emerald-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-white">
                  Tự động cập nhật lên netlify.app & GitHub mỗi lần chỉnh sửa trên Google AI Studio
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    config.autoSyncOnEdit
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {config.autoSyncOnEdit ? 'Đang BẬT Tự Động' : 'Đang Tắt'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Khi bật tính năng này (và đã nhập Netlify Token ở Cách 2 hoặc kết nối GitHub ở Cách 3), mỗi khi thầy chỉnh sửa giao diện/tính năng trên Google AI Studio, hệ thống sẽ tự động biên dịch và đẩy bản cập nhật mới lên thẳng <strong>.netlify.app</strong> và kho <strong>GitHub</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-emerald-950/90 px-3.5 py-2 rounded-xl border border-emerald-600/60">
              <input
                type="checkbox"
                checked={config.autoSyncOnEdit}
                disabled={savingAutoSync}
                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="text-xs font-extrabold text-emerald-200">
                Tự động đồng bộ khi chỉnh sửa
              </span>
            </label>
          </div>
        </div>

        {/* Live Deployed Link Banner if available */}
        {activeLiveUrl && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                  Đường Link Website Chính Thức Đang Hoạt Động Trên Netlify:
                </div>
                <a
                  href={activeLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base font-black text-white underline hover:text-amber-300 break-all"
                >
                  {activeLiveUrl}
                </a>
                {config.lastDeployedAt && (
                  <div className="text-[11px] text-emerald-200/90 mt-0.5">
                    Cập nhật lần cuối: {new Date(config.lastDeployedAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopyUrl(activeLiveUrl)}
                className="px-3 py-2 rounded-lg bg-white text-slate-900 hover:bg-emerald-50 font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã chép link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-700" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
              <a
                href={activeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Web Ngay</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================================
          3 COLUMNS: CÁCH 1, CÁCH 2, CÁCH 3
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* ===================================================================
            CÁCH 1: KÉO & THẢ TRỰC TIẾP LÊN NETLIFY DROP (NHANH NHẤT - 3 GIÂY)
           =================================================================== */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase">
                  Cách 1 • Khuyên dùng nhanh
                </span>
                <span className="text-[11px] font-bold text-emerald-100">⚡ 3 Giây • Không cần GitHub</span>
              </div>
              <h3 className="text-base font-black leading-snug">
                Cách 1: Kéo & Thả trực tiếp lên Netlify Drop
              </h3>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 leading-relaxed">
                <strong>💡 Lưu ý quan trọng:</strong> Trước đây nếu kéo gói mã nguồn thô thả vào Netlify sẽ không chạy được vì chưa qua bước biên dịch. Nay hệ thống đã tạo riêng <strong>Gói Đã Biên Dịch Sẵn</strong> (chứa sẵn <code>index.html</code>, <code>_redirects</code> và kết nối Cloud Firestore ở ngay gốc file ZIP).
              </div>

              {/* Bước 1 */}
              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Bước 1: Tải file Mã nguồn Đã Build sẵn (.zip)</span>
                </div>
                <button
                  onClick={handleDownloadPrebuiltDropZip}
                  disabled={downloadingDropZip}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {downloadingDropZip
                      ? 'Đang đóng gói bản Build sẵn...'
                      : '⬇ Tải Gói Kéo-Thả Netlify (Đã Build sẵn)'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 italic">
                  Tải về máy tệp <code>hoahoc-thcs-ndh-netlify-build-san.zip</code> (Giữ nguyên file .zip, không cần giải nén).
                </p>
              </div>

              {/* Bước 2 */}
              <div className="space-y-2 pt-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Bước 2: Mở trang kéo thả của Netlify</span>
                </div>
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bước 2: Mở trang app.netlify.com/drop</span>
                </a>
              </div>

              {/* Bước 3 */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-black shrink-0">
                    3
                  </span>
                  <span>Bước 3: Kéo thả file .zip vừa tải vào khung</span>
                </div>
                <p className="text-emerald-900 leading-relaxed pl-6">
                  Kéo nguyên file Mã nguồn đuôi <strong>.zip</strong> vừa tải thả vào khung vòng tròn trên trang Netlify → <strong>Trang web của bạn sẽ chạy ngay lập tức và đăng nhập / chấm bài được ngay!</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 bg-emerald-50/70 border-t border-emerald-100 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
            <span>✔ Đã tích hợp sẵn Firebase & Đăng nhập</span>
            <span>Chạy 100%</span>
          </div>
        </div>

        {/* ===================================================================
            CÁCH 2: XUẤT BẢN TỰ ĐỘNG 1 CHẠM NGAY TRONG APP (5 GIÂY)
           =================================================================== */}
        <div className="bg-white rounded-2xl border-2 border-cyan-500 shadow-md flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase">
                  Cách 2 • Tự động 1 Chạm
                </span>
                <span className="text-[11px] font-bold text-cyan-100">🚀 5 Giây • Tự động cập nhật</span>
              </div>
              <h3 className="text-base font-black leading-snug">
                Cách 2: Xuất bản Tự động 1 Chạm ngay trong App
              </h3>
            </div>

            {/* Card Body */}
            <form onSubmit={handleOneClickNetlifyDeploy} className="p-5 space-y-4 text-xs text-slate-700">
              {/* Bước 1: Nhập tên website */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-black shrink-0">
                    1
                  </span>
                  <span>Nhập tên website bạn muốn:</span>
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  placeholder="Ví dụ: hoahoc_thcs_ndh"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="text-[11px] text-slate-500">
                  Địa chỉ dự kiến:{' '}
                  <strong className="text-cyan-700">
                    https://{previewCleanSubdomain || 'hoahoc-thcs-ndh'}.netlify.app
                  </strong>
                </div>
              </div>

              {/* Bước 2: Lấy mã Token Netlify */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-black shrink-0">
                      2
                    </span>
                    <span>Mã Netlify Personal Access Token:</span>
                  </label>
                  <a
                    href="https://app.netlify.com/user/applications#personal-access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[11px] border border-amber-300 flex items-center gap-1 shrink-0 transition"
                  >
                    <KeyRound className="w-3 h-3 text-amber-700" />
                    <span>Lấy mã Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="password"
                  value={config.netlifyToken}
                  onChange={(e) => setConfig({ ...config, netlifyToken: e.target.value })}
                  placeholder="Dán mã Personal Access Token (nfp_...) vào đây"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bấm <strong>"Lấy mã Token"</strong> → chọn <strong>New access token</strong> trên Netlify → Copy mã bắt đầu bằng <code>nfp_...</code> rồi dán vào ô trên.
                </p>
              </div>

              {/* Bước 3: Nút Xuất bản tự động */}
              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={deployingNetlify}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deployingNetlify ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>Đang đẩy bản Build lên Netlify (5 giây)...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Xuất bản tự động lên Netlify ngay</span>
                    </>
                  )}
                </button>
              </div>

              {deployError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                  {deployError}
                </div>
              )}

              {/* Kết quả đường link ngay sau 5 giây */}
              {activeLiveUrl && (
                <div className="p-3.5 rounded-xl bg-cyan-50 border-2 border-cyan-300 space-y-2">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Website Netlify của thầy đã sẵn sàng:</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-cyan-200 font-mono font-bold text-cyan-800 break-all text-xs">
                    <a href={activeLiveUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      {activeLiveUrl}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(activeLiveUrl)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={activeLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mở Trang Web</span>
                    </a>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="px-5 py-3 bg-cyan-50/70 border-t border-cyan-100 text-[11px] font-bold text-cyan-900 flex items-center justify-between">
            <span>✔ Tự động cập nhật khi sửa trên AI Studio</span>
            <span>1 Chạm</span>
          </div>
        </div>

        {/* ===================================================================
            CÁCH 3: KẾT NỐI KHO GITHUB TỰ ĐỘNG VỚI NETLIFY (KÈM XUẤT FILE .APK)
           =================================================================== */}
        <div className="bg-white rounded-2xl border-2 border-violet-500 shadow-md flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-violet-700 to-indigo-800 text-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase">
                  Cách 3 • GitHub + Android .APK
                </span>
                <span className="text-[11px] font-bold text-violet-200">🔄 CI/CD Tự động 100%</span>
              </div>
              <h3 className="text-base font-black leading-snug">
                Cách 3: Kết nối Kho GitHub tự động với Netlify (Kèm tự động xuất file .APK)
              </h3>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Bước 1: Tải gói mã nguồn GitHub */}
              <div className="space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-violet-700 text-white text-[11px] flex items-center justify-center font-black shrink-0">
                    1
                  </span>
                  <span>Bước 1: Tải Gói Mã Nguồn Chuẩn GitHub (.ZIP)</span>
                </div>
                <button
                  onClick={handleDownloadGithubSourceZip}
                  disabled={downloadingGithubZip}
                  className="w-full py-3.5 px-4 rounded-xl bg-violet-700 hover:bg-violet-600 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileArchive className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    {downloadingGithubZip
                      ? 'Đang nén Mã nguồn GitHub...'
                      : '⬇ Tải Gói Mã Nguồn GitHub (.ZIP)'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Giải nén file vừa tải và đẩy toàn bộ lên kho <strong>GitHub</strong> của thầy (Gói này đã tích hợp sẵn <code>netlify.toml</code> và <code>.github/workflows/build-apk.yml</code> tự động xuất file <strong>.APK</strong>).
                </p>
              </div>

              {/* Bước 2: Kết nối GitHub trên Netlify */}
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 space-y-2">
                <div className="font-extrabold text-violet-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-violet-700 text-white text-[11px] flex items-center justify-center font-black shrink-0">
                    2
                  </span>
                  <span>Bước 2: Kết nối kho GitHub vào Netlify</span>
                </div>
                <p className="text-violet-900 leading-relaxed pl-6">
                  Trên Netlify chọn <strong>Add new site</strong> → <strong>Import an existing project</strong> → <strong>GitHub</strong> → Chọn kho lưu trữ vừa đẩy lên. Netlify tự động nhận cấu hình và kích hoạt toàn bộ tính năng đăng nhập & hoạt động trên app!
                </p>
                <a
                  href="https://app.netlify.com/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Github className="w-3.5 h-3.5 text-violet-300" />
                  <span>Mở Netlify → Import từ GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Bước 3: Tự động đồng bộ từ Google AI Studio lên thẳng GitHub & Xuất APK */}
              <form onSubmit={handlePushToGithub} className="pt-2 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-slate-800" />
                    <span>Đồng bộ tự động từ GG Studio → GitHub:</span>
                  </span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=HoaHocTHCS_NDH_AutoSync"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-0.5"
                  >
                    <span>Lấy GitHub Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="text"
                  value={config.githubRepo}
                  onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
                  placeholder="Tên kho GitHub (VD: nguyendinhhanh/hoahoc-thcs-ndh)"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                />

                <input
                  type="password"
                  value={config.githubToken}
                  onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                  placeholder="Dán GitHub Personal Access Token (ghp_...)"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                />

                <button
                  type="submit"
                  disabled={pushingGithub}
                  className="w-full py-2.5 px-3 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-950 font-extrabold text-xs border border-violet-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {pushingGithub ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang đồng bộ lên kho GitHub...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-violet-700" />
                      <span>🔄 Đẩy & Đồng bộ tự động lên GitHub ngay</span>
                    </>
                  )}
                </button>

                {githubError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                    {githubError}
                  </div>
                )}

                {config.lastGithubSyncedAt && (
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Đã đồng bộ GitHub lúc: {new Date(config.lastGithubSyncedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="px-5 py-3 bg-violet-50/70 border-t border-violet-100 text-[11px] font-bold text-violet-900 flex items-center justify-between">
            <span>✔ Tự động xuất file Android .APK trên GitHub</span>
            <span>GitHub CI/CD</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          BOTTOM SECTION: MÃ QR CHIA SẺ CHO HỌC SINH & CẤU HÌNH ĐỒNG BỘ REAL-TIME
         ======================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cơ Chế Đồng Bộ Dữ Liệu Giữa Google AI Studio, Netlify & Điện Thoại Học Sinh</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Mọi thay đổi danh sách học sinh, học phí, bài tập & đề thi đều đồng bộ tức thì!
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Dữ liệu Học sinh & Học phí 12 tháng:</strong> Khi thầy tải danh sách học sinh hoặc tích học phí trên máy tính (dù ở Google AI Studio hay trên trang <code>.netlify.app</code>), dữ liệu được lưu trực tiếp lên <strong>Cloud Firestore</strong> và hiển thị ngay lập tức trên điện thoại của học sinh.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Chỉnh sửa giao diện & tính năng trên Google AI Studio:</strong> Khi bật <em>"Tự động đồng bộ khi chỉnh sửa"</em> ở thanh trên cùng, mỗi lần chỉnh sửa code trên Google AI Studio sẽ tự động đẩy bản build mới lên địa chỉ <code>.netlify.app</code> và kho <code>GitHub</code> đã kết nối.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nhận file cài đặt Android (.APK):</strong> Sau khi đẩy mã nguồn lên GitHub (Cách 3), thầy mở mục <strong>Actions</strong> trên kho GitHub → bấm vào bản chạy mới nhất → tải ngay gói <code>hoahoc-thcs-ndh-android-apk</code> (chứa file <code>hoahoc-thcs-ndh.apk</code>) để gửi cho học sinh cài đặt.
              </span>
            </li>
          </ul>
        </div>

        {/* QR Code Box for the Deployed Link */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-2">
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-cyan-700" />
            <span>Mã QR Trang Web Của Thầy</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                activeLiveUrl || window.location.origin
              )}`}
              alt="Mã QR Cổng Học Tập"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="text-[11px] font-mono font-bold text-cyan-800 break-all px-2">
            {activeLiveUrl || window.location.origin}
          </div>
          <span className="text-[10px] text-slate-500">
            Học sinh quét mã QR bằng Zalo / Camera để vào học ngay
          </span>
        </div>
      </div>
    </div>
  );
};
