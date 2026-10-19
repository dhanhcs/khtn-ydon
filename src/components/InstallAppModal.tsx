import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Apple, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { YDonSchoolLogo } from './YDonSchoolLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onNativeInstall: () => void;
}

export function InstallAppModal({ isOpen, onClose, deferredPrompt, onNativeInstall }: InstallAppModalProps) {
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'ios' | 'pc'>('android');

  // Detect current platform on mount
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      setActivePlatformTab('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActivePlatformTab('ios');
    } else {
      setActivePlatformTab('pc');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="transition-transform hover:scale-105 duration-200 shrink-0">
              <YDonSchoolLogo size={52} className="ring-2 ring-white/50 shadow-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  PWA APP TỰ ĐỘNG
                </span>
                <span className="text-[11px] text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Tải & Cài Đặt App KHTN Y Đôn
              </h3>
              <p className="text-xs text-blue-100 font-normal">
                Sử dụng mượt mà không cần mở trình duyệt, hỗ trợ ngoại tuyến & đồng bộ tức thì
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

        {/* 1-Click Native Install Button (if browser prompt ready) */}
        {deferredPrompt && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Trình duyệt hỗ trợ cài đặt 1-Click trực tiếp!
                </div>
                <div className="text-[11px] text-emerald-800">
                  Nhấp nút bên cạnh để đưa ứng dụng về màn hình ngay.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onNativeInstall}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Cài đặt ngay</span>
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActivePlatformTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'android'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatformTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'ios'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatformTab('pc')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'pc'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Máy tính (PC/Mac)</span>
          </button>
        </div>

        {/* Tab Content: Detailed Instructions */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          {/* ANDROID TAB */}
          {activePlatformTab === 'android' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Cài đặt trên điện thoại Android (Samsung, Oppo, Xiaomi...)
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Sử dụng trình duyệt Google Chrome hoặc Cốc Cốc
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Mở Menu trình duyệt Chrome:</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Nhấp vào biểu tượng <strong>3 dấu chấm đứng (⋮)</strong> ở góc trên bên phải màn hình điện thoại.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Chọn "Thêm vào màn hình chính":</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Trong danh sách menu, tìm và nhấp chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính" (Add to Home screen)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Xác nhận "Cài đặt":</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Bấm nút <strong>Cài đặt</strong>. Biểu tượng App <strong>KHTN Y ĐÔN</strong> sẽ xuất hiện ngay trên màn hình chính của bạn như một ứng dụng thông thường!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activePlatformTab === 'ios' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-sm">
                    Cài đặt trên iPhone & iPad (Hệ điều hành iOS)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Sử dụng trình duyệt <strong>Safari</strong> tích hợp sẵn trên iOS
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Mở nút Chia sẻ trên Safari:</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ở thanh công cụ dưới cùng của trình duyệt Safari, nhấp vào biểu tượng <strong>Chia sẻ (hình vuông có mũi tên hướng lên ⎋)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Chọn "Thêm vào MH chính":</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Cuộn xuống dưới danh sách các tùy chọn và nhấp vào dòng <strong>"Thêm vào MH chính" (Add to Home Screen ⊞)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Nhấp "Thêm" ở góc trên:</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Nhấp nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình. Biểu tượng logo Y Đôn sẽ nằm ngay trên màn hình iPhone để mở 1 chạm!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PC / LAPTOP TAB */}
          {activePlatformTab === 'pc' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-sm">
                    Cài đặt trên Máy tính & Laptop (Windows, macOS)
                  </h4>
                  <p className="text-[11px] text-blue-800">
                    Sử dụng Google Chrome hoặc Microsoft Edge
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Nhấp biểu tượng Cài đặt trên thanh địa chỉ URL:</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ở góc phải của thanh nhập địa chỉ trang web (URL), nhấp vào biểu tượng <strong>máy tính nhỏ có mũi tên xuống (Cài đặt ứng dụng)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Hoặc mở Menu Chrome (3 chấm):</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Bấm Menu (3 chấm) góc trên bên phải → Chọn <strong>"Lưu và chia sẻ"</strong> → Chọn <strong>"Cài đặt trang này dưới dạng ứng dụng..."</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Hoàn tất:</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ứng dụng sẽ có cửa sổ riêng biệt, có icon trên Desktop và thanh Taskbar để thầy cô và học sinh mở tức thì mỗi ngày!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features info pill */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Khởi động siêu tốc 1 chạm</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bảo mật an toàn 100%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            Đã hiểu hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
}
