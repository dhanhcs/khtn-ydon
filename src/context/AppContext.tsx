import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, ChemistryClass } from '../types';
import { readPersistedKey, writePersistedKey } from '../utils/cloudPersistence';

export const INITIAL_CLASSES: ChemistryClass[] = [
  { id: 'h6-1', name: 'H6.1', grade: 'Khối 6', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 2 - Thứ 5 (17h30 - 19h00)', description: 'Chuyên đề Khoa học Tự nhiên 6 - Phân môn Chất và Sự biến đổi của chất', studentCount: 22 },
  { id: 'h6-2', name: 'H6.2', grade: 'Khối 6', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 3 - Thứ 6 (17h30 - 19h00)', description: 'Lớp nâng cao KHTN 6, phát triển tư duy thực nghiệm', studentCount: 20 },
  { id: 'h6-3', name: 'H6.3', grade: 'Khối 6', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 7 - CN (08h00 - 09h30)', description: 'Lớp cơ bản KHTN 6, củng cố kiến thức và bài tập', studentCount: 18 },
  { id: 'h7-1', name: 'H7.1', grade: 'Khối 7', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 2 - Thứ 5 (19h15 - 20h45)', description: 'Chuyên đề Nguyên tử, Bảng tuần hoàn các nguyên tố hóa học KHTN 7', studentCount: 25 },
  { id: 'h7-2', name: 'H7.2', grade: 'Khối 7', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 3 - Thứ 6 (19h15 - 20h45)', description: 'Phân tử, Liên kết hóa học và Hóa trị - Luyện giải bài tập nâng cao', studentCount: 24 },
  { id: 'h7-3', name: 'H7.3', grade: 'Khối 7', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 7 - CN (09h45 - 11h15)', description: 'Rèn kỹ năng lập công thức hóa học và tính toán theo hóa trị', studentCount: 21 },
  { id: 'h8-1', name: 'H8.1', grade: 'Khối 8', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 2 - Thứ 4 (17h30 - 19h00)', description: 'Hóa học 8 chuyên sâu: Phản ứng hóa học, Định luật bảo toàn khối lượng, Mol', studentCount: 28 },
  { id: 'h8-2', name: 'H8.2', grade: 'Khối 8', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 3 - Thứ 5 (17h30 - 19h00)', description: 'Tính toán theo phương trình hóa học, nồng độ dung dịch C% và C_M', studentCount: 26 },
  { id: 'h8-3', name: 'H8.3', grade: 'Khối 8', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 7 - CN (14h00 - 15h30)', description: 'Oxi - Hidro - Nước và các hợp chất vô cơ cơ bản', studentCount: 23 },
  { id: 'h9-1', name: 'H9.1', grade: 'Khối 9', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 2 - Thứ 4 (19h15 - 20h45)', description: 'Luyện thi vào 10 chuyên và công lập: Oxit, Axit, Bazơ, Muối nâng cao', studentCount: 30 },
  { id: 'h9-2', name: 'H9.2', grade: 'Khối 9', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 3 - Thứ 5 (19h15 - 20h45)', description: 'Kim loại, Phi kim, Bảng tuần hoàn và các phương pháp giải nhanh', studentCount: 28 },
  { id: 'h9-3', name: 'H9.3', grade: 'Khối 9', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Thứ 7 - CN (15h45 - 17h15)', description: 'Hóa học Hữu cơ: Hiđrocacbon, Dẫn xuất, Rượu etylic, Axit axetic', studentCount: 25 },
  { id: 'h-hsg', name: 'Bồi dưỡng HSG cấp tỉnh, thành phố', grade: 'Bồi dưỡng HSG cấp tỉnh, thành phố', teacher: 'Thầy Nguyễn Đình Hành', schedule: 'Chủ Nhật (17h30 - 20h30)', description: 'Đội tuyển Bồi dưỡng HSG cấp tỉnh, thành phố và Chuyên Hóa - Tác giả Thầy Nguyễn Đình Hành trực tiếp huấn luyện', studentCount: 16 },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  bannerTitle: 'CHINH PHỤC MÔN HÓA THCS- NĐH',
  bannerSubtitle: 'Trách nhiệm - Uy tín - Chất lượng',
  bannerBgColor: 'linear-gradient(135deg, #1877F2 0%, #166FE5 50%, #0d5cb8 100%)',
  bannerImageUrl: '',
  logoUrl: '/favicon.png',
  logoSize: 100,
  logoShape: 'original',
  tickerText: 'Chào mừng phụ huynh và học sinh đến Cổng học tập trực tuyến Hóa học của thầy Nguyễn Đình Hành',
  tickerEnabled: true,
  phone: '0988 275 288',
  email: 'n.dhanhcs2006@gmail.com',
  address: '806/4/2 Quang Trung, Phường An Bình, tỉnh Gia Lai',
  teacherName: 'Thầy Nguyễn Đình Hành',
  teacherTitle: 'Tác giả của nhiều sách tham khảo lĩnh vực Hóa học',
  bankName: 'Vietcombank',
  bankAccountNumber: '',
  bankAccountHolder: 'NGUYỄN ĐÌNH HÀNH',
  bankBranch: 'Gia Lai',
  tuitionQrUrl: '',
  defaultTuitionAmount: 600000,
  tuitionPaymentNote: 'Họ tên HS - Lớp - Đóng học phí',
  customDomainUrl: '',
};

export type ActivePage =
  | 'home'
  | 'homework'
  | 'interactive-quiz'
  | 'mock-exams'
  | 'materials'
  | 'experiments'
  | 'tuition'
  | 'online-classes'
  | 'registration'
  | 'ai-assistant'
  | 'leave-requests'
  | 'exam-results'
  | 'classes'
  | 'schedules'
  | 'announcements'
  | 'omr-scanner'
  | 'admin-dashboard'
  | 'students-roster'
  | 'export-sync-app'
  | 'youtube-channel';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  classes: ChemistryClass[];
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedClassFilter: string;
  setSelectedClassFilter: (className: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isPwaModalOpen: boolean;
  setIsPwaModalOpen: (open: boolean) => void;
  pwaModalMode: 'install' | 'publish';
  setPwaModalMode: (mode: 'install' | 'publish') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_SETTINGS_KEY = 'ndh_app_settings_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = readPersistedKey<Partial<AppSettings> | null>(LOCAL_SETTINGS_KEY, null);
    if (saved && typeof saved === 'object') {
      return { ...DEFAULT_APP_SETTINGS, ...saved };
    }
    return DEFAULT_APP_SETTINGS;
  });
  const [classes] = useState<ChemistryClass[]>(INITIAL_CLASSES);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [pwaModalMode, setPwaModalMode] = useState<'install' | 'publish'>('install');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  // Sync settings with Backend /api/settings + Universal Cloud Store across PC, Mobile, Vercel & Netlify
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return res.ok && ct.includes('application/json') ? res.json() : ({} as Record<string, any>);
      })
      .then((serverData: Record<string, any>) => {
        if (serverData && Object.keys(serverData).length > 0) {
          setSettings((prev) => {
            const merged: AppSettings = {
              ...DEFAULT_APP_SETTINGS,
              ...prev,
              ...serverData,
              logoUrl: serverData.logoUrl || prev.logoUrl || '/favicon.png',
              tuitionQrUrl: serverData.tuitionQrUrl || prev.tuitionQrUrl || '',
              bankName: serverData.bankName || prev.bankName || 'Vietcombank',
              bankAccountNumber: serverData.bankAccountNumber ?? prev.bankAccountNumber ?? '',
              bankAccountHolder:
                serverData.bankAccountHolder || prev.bankAccountHolder || 'NGUYỄN ĐÌNH HÀNH',
              defaultTuitionAmount: Number(
                serverData.defaultTuitionAmount || prev.defaultTuitionAmount || 600000
              ),
            };
            writePersistedKey(LOCAL_SETTINGS_KEY, merged, { fromRemote: true });
            return merged;
          });
        }
      })
      .catch(() => {});

    const handleCloudSettingsUpdate = () => {
      const latest = readPersistedKey<Partial<AppSettings> | null>(LOCAL_SETTINGS_KEY, null);
      if (latest && typeof latest === 'object') {
        setSettings((prev) => ({
          ...DEFAULT_APP_SETTINGS,
          ...prev,
          ...latest,
          logoUrl: latest.logoUrl || prev.logoUrl || '/favicon.png',
          tuitionQrUrl: latest.tuitionQrUrl || prev.tuitionQrUrl || '',
          bankAccountNumber: latest.bankAccountNumber ?? prev.bankAccountNumber ?? '',
          bankName: latest.bankName || prev.bankName || 'Vietcombank',
          bankAccountHolder:
            latest.bankAccountHolder || prev.bankAccountHolder || 'NGUYỄN ĐÌNH HÀNH',
          defaultTuitionAmount: Number(
            latest.defaultTuitionAmount || prev.defaultTuitionAmount || 600000
          ),
          logoSize: latest.logoSize || prev.logoSize || 100,
          logoShape: latest.logoShape || prev.logoShape || 'original',
        }));
      }
    };
    window.addEventListener('ndh-settings-updated', handleCloudSettingsUpdate);
    return () => window.removeEventListener('ndh-settings-updated', handleCloudSettingsUpdate);
  }, []);

  // Automatically sync Browser Tab Favicon, Apple Touch Icon & Document Title with App Logo & Banner Title
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (settings.bannerTitle && settings.bannerTitle.trim()) {
      document.title = settings.bannerTitle.trim();
    }

    const applyFaviconHref = (href: string, mimeType: string) => {
      const relList = [
        { id: 'app-favicon-png', rel: 'icon', type: mimeType },
        { id: 'app-favicon-ico', rel: 'icon', type: mimeType },
        { id: 'app-shortcut-icon', rel: 'shortcut icon', type: mimeType },
        { id: 'app-apple-touch-icon', rel: 'apple-touch-icon', type: mimeType },
      ];
      relList.forEach(({ id, rel, type }) => {
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.id = id;
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.type = type;
        link.href = href;
      });
    };

    const customLogo = settings.logoUrl?.trim() || '/favicon.png?v=ndh2026';

    // Render crisp square 128x128 favicon from customLogo so browser tabs never stretch non-square logos
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          applyFaviconHref(customLogo, 'image/png');
          return;
        }
        ctx.clearRect(0, 0, size, size);

        if (settings.logoShape === 'circle') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.clip();
        } else if (settings.logoShape === 'rounded') {
          const r = 24;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(r, 2);
          ctx.lineTo(size - r, 2);
          ctx.quadraticCurveTo(size - 2, 2, size - 2, r);
          ctx.lineTo(size - 2, size - r);
          ctx.quadraticCurveTo(size - 2, size - 2, size - r, size - 2);
          ctx.lineTo(r, size - 2);
          ctx.quadraticCurveTo(2, size - 2, 2, size - r);
          ctx.lineTo(2, r);
          ctx.quadraticCurveTo(2, 2, r, 2);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.clip();
        }

        const iw = img.naturalWidth || img.width || size;
        const ih = img.naturalHeight || img.height || size;
        const scale = Math.min((size - 8) / iw, (size - 8) / ih);
        const dw = Math.round(iw * scale);
        const dh = Math.round(ih * scale);
        const dx = Math.round((size - dw) / 2);
        const dy = Math.round((size - dh) / 2);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dw, dh);

        if (settings.logoShape === 'circle' || settings.logoShape === 'rounded') {
          ctx.restore();
        }

        applyFaviconHref(canvas.toDataURL('image/png'), 'image/png');
      } catch {
        applyFaviconHref(customLogo, 'image/png');
      }
    };
    img.onerror = () => {
      applyFaviconHref(customLogo, 'image/png');
    };
    img.src = customLogo;
  }, [settings.logoUrl, settings.logoShape, settings.bannerTitle]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const now = Date.now();
    let updatedSnapshot: AppSettings = { ...settings, ...newSettings };
    setSettings((prev) => {
      updatedSnapshot = { ...prev, ...newSettings };
      return updatedSnapshot;
    });

    writePersistedKey(LOCAL_SETTINGS_KEY, updatedSnapshot, { updatedAt: now });

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedSnapshot, updatedAt: now }),
      });
    } catch (e) {
      console.warn('Could not save settings to /api/settings:', e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        classes,
        activePage,
        setActivePage,
        selectedClassFilter,
        setSelectedClassFilter,
        toasts,
        showToast,
        removeToast,
        isPwaModalOpen,
        setIsPwaModalOpen,
        pwaModalMode,
        setPwaModalMode,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
