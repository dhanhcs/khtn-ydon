import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { HoaHocNdhLogo, processLogoFileToDataUrl } from './HoaHocNdhLogo';
import {
  MapPin,
  Phone,
  Mail,
  Award,
  Edit,
  Check,
  X,
  Sparkles,
  Upload,
  SlidersHorizontal,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';

export const Banner: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoQuickOpen, setIsLogoQuickOpen] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [editForm, setEditForm] = useState({ ...settings });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const currentLogoSize = settings.logoSize || 100;
  const currentLogoShape = settings.logoShape || 'original';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    await updateSettings(editForm);
    setIsEditing(false);
  };

  const handleDirectLogoFile = async (file?: File | null) => {
    if (!isAdmin || !file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp hình ảnh (.png, .jpg, .svg, .webp)', 'error');
      return;
    }
    try {
      const dataUrl = await processLogoFileToDataUrl(file, 560);
      setEditForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      await updateSettings({ logoUrl: dataUrl });
      showToast('Đã cập nhật chính xác ảnh Logo lên Banner!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải ảnh Logo', 'error');
    }
  };

  const handleQuickSizeChange = async (newSize: number) => {
    if (!isAdmin) return;
    const clamped = Math.max(52, Math.min(180, newSize));
    setEditForm((prev) => ({ ...prev, logoSize: clamped }));
    await updateSettings({ logoSize: clamped });
  };

  const handleQuickShapeChange = async (newShape: 'original' | 'circle' | 'rounded') => {
    if (!isAdmin) return;
    setEditForm((prev) => ({ ...prev, logoShape: newShape }));
    await updateSettings({ logoShape: newShape });
  };

  const facebookBlueBg = 'linear-gradient(135deg, #1877F2 0%, #166FE5 50%, #0d5cb8 100%)';

  const bannerBgStyle = settings.bannerImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(24, 119, 242, 0.88), rgba(13, 92, 184, 0.92)), url(${settings.bannerImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: settings.bannerBgColor || facebookBlueBg,
      };

  return (
    <header className="relative text-white shadow-md overflow-hidden border-b-2 border-blue-400">
      {/* Hidden File Input for 1-Click Logo Upload — Strictly Admin Only */}
      {isAdmin && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleDirectLogoFile(file);
            e.target.value = '';
          }}
        />
      )}

      <div style={bannerBgStyle} className="px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all duration-300">
        {/* Top-Right Controls: Quick Logo Customizer + Admin Banner Editor (Strictly Admin Only) */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setIsLogoQuickOpen((prev) => !prev)}
              className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm transition-all border border-white/30 shadow-xs cursor-pointer"
              title="Quản trị viên: Cập nhật ảnh Logo & chỉnh kích thước"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-300" />
              <span>Đổi Logo & Kích thước</span>
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditForm({ ...settings });
                  setIsEditing(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm transition-all border border-white/30 shadow-xs cursor-pointer"
                title="Quản trị viên: Tùy chỉnh Banner & Thông tin"
              >
                <Edit className="w-3 h-3" />
                <span>Đổi Banner</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Logo Upload & Size Popover Panel (Strictly Admin Only) */}
        {isAdmin && isLogoQuickOpen && (
          <div className="mb-3 p-3.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-amber-400/60 text-slate-100 max-w-xl mx-auto shadow-2xl z-30 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-700">
              <h3 className="font-bold text-amber-300 flex items-center gap-2 text-xs sm:text-sm">
                <ImageIcon className="w-4 h-4 text-amber-300" />
                Cập nhật Logo & Chỉnh Kích Thước (Vùng trống bên trái Banner)
              </h3>
              <button
                type="button"
                onClick={() => setIsLogoQuickOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* 1. Upload exact image file from computer */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div>
                  <div className="font-bold text-white">Ảnh Logo (Logo Hoa hoc NDH.png)</div>
                  <div className="text-[11px] text-slate-300">
                    Chọn trực tiếp file ảnh từ máy tính hoặc kéo-thả vào logo bên trái
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold flex items-center gap-1.5 shadow cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn ảnh Logo từ máy</span>
                  </button>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateSettings({ logoUrl: '' })}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1 cursor-pointer transition"
                      title="Khôi phục huy hiệu mặc định"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mặc định</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Size slider + presets */}
              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white">
                    Kích thước Logo: <span className="text-amber-300 font-mono">{currentLogoSize}px</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[
                      { label: '76px', val: 76 },
                      { label: '92px', val: 92 },
                      { label: '104px (Chuẩn)', val: 104 },
                      { label: '120px', val: 120 },
                      { label: '136px', val: 136 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleQuickSizeChange(preset.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                          currentLogoSize === preset.val
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={56}
                  max={168}
                  step={2}
                  value={currentLogoSize}
                  onChange={(e) => handleQuickSizeChange(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* 3. Frame shape option */}
              <div className="flex items-center justify-between bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-white">Kiểu hiển thị viền ảnh:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'original', label: 'Giữ nguyên gốc' },
                    { id: 'circle', label: 'Huy hiệu tròn' },
                    { id: 'rounded', label: 'Khung bo góc' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleQuickShapeChange(opt.id as any)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                        currentLogoShape === opt.id
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Admin Edit Modal / Inline Panel (Strictly Admin Only) */}
        {isAdmin && isEditing && (
          <div className="mb-4 p-4 bg-slate-900/95 backdrop-blur-md rounded-xl border border-blue-400/60 text-slate-100 max-w-3xl mx-auto shadow-2xl z-30 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3 border-b border-blue-500/30 pb-2">
              <h3 className="font-bold text-blue-300 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Quản Trị Viên: Đổi Ảnh Banner, Đổi Logo & Thông Tin Giảng Dạy
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tiêu đề chính banner</label>
                <input
                  type="text"
                  value={editForm.bannerTitle}
                  onChange={(e) => setEditForm({ ...editForm, bannerTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Khẩu hiệu / Slogan</label>
                <input
                  type="text"
                  value={editForm.bannerSubtitle}
                  onChange={(e) => setEditForm({ ...editForm, bannerSubtitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400 font-bold"
                />
              </div>

              {/* Direct Logo File Upload + URL + Size inside Admin Form */}
              <div className="md:col-span-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-amber-300 font-bold">
                    Ảnh Logo (Tải file Logo Hoa hoc NDH.png từ máy hoặc dán URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={modalFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataUrl = await processLogoFileToDataUrl(file, 560);
                          setEditForm((prev) => ({ ...prev, logoUrl: dataUrl }));
                        }
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Hoặc dán URL / DataURL ảnh logo..."
                      value={editForm.logoUrl}
                      onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Kích thước Logo: <strong className="text-amber-300">{editForm.logoSize || 100}px</strong>
                  </label>
                  <input
                    type="range"
                    min={56}
                    max={168}
                    step={2}
                    value={editForm.logoSize || 100}
                    onChange={(e) => setEditForm({ ...editForm, logoSize: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Màu nền Banner (Mặc định Facebook Blue)</label>
                <input
                  type="text"
                  value={editForm.bannerBgColor}
                  onChange={(e) => setEditForm({ ...editForm, bannerBgColor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-amber-300 mb-1 font-bold">Ảnh nền Banner (Tải ảnh từ máy hoặc dán URL)</label>
                <div className="flex items-center gap-1.5">
                  <label className="px-2.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn ảnh Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataUrl = await processLogoFileToDataUrl(file, 1280);
                          setEditForm((prev) => ({ ...prev, bannerImageUrl: dataUrl }));
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="URL ảnh nền banner (để trống nếu dùng nền xanh)..."
                    value={editForm.bannerImageUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, bannerImageUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                  />
                  {editForm.bannerImageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, bannerImageUrl: '' }))}
                      className="px-2 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                      title="Xóa ảnh nền banner"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tên giáo viên</label>
                <input
                  type="text"
                  value={editForm.teacherName}
                  onChange={(e) => setEditForm({ ...editForm, teacherName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Dòng giới thiệu giáo viên</label>
                <input
                  type="text"
                  value={editForm.teacherTitle}
                  onChange={(e) => setEditForm({ ...editForm, teacherTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Địa chỉ giảng dạy</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1 font-medium">Điện thoại liên hệ & Email</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Banner Content */}
        <div className="max-w-7xl mx-auto flex flex-col">
          {/* Upper Banner Area:
              - Left Empty Space Zone (sm:flex-1): Logo placed dead-center horizontally & vertically inside the left empty space
              - Center Zone (shrink-0): Main Title + Slogan centered on the banner
              - Right Balance Zone (md:flex-1): Keeps the Center Zone strictly centered across the banner width */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-1">
            {/* LEFT EMPTY SPACE OF BANNER: Logo centered horizontally and vertically */}
            <div className="w-full sm:w-auto sm:flex-1 flex items-center justify-center">
              <div
                onDragOver={
                  isAdmin
                    ? (e) => {
                        e.preventDefault();
                        setIsDraggingLogo(true);
                      }
                    : undefined
                }
                onDragLeave={isAdmin ? () => setIsDraggingLogo(false) : undefined}
                onDrop={
                  isAdmin
                    ? (e) => {
                        e.preventDefault();
                        setIsDraggingLogo(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleDirectLogoFile(file);
                      }
                    : undefined
                }
                className={`group relative inline-flex items-center justify-center rounded-2xl transition-all ${
                  isAdmin && isDraggingLogo ? 'ring-4 ring-amber-300 bg-white/20 scale-105 p-1' : ''
                }`}
              >
                <HoaHocNdhLogo
                  logoUrl={settings.logoUrl}
                  sizePx={currentLogoSize}
                  shape={currentLogoShape}
                  onClick={isAdmin ? () => fileInputRef.current?.click() : undefined}
                />

                {/* Admin-only Hover Button to Upload Logo Image */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 hover:bg-amber-400 hover:text-slate-950 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/60 shadow-md flex items-center gap-1 cursor-pointer"
                    title="Quản trị viên: Nhấn để chọn ảnh Logo từ máy hoặc kéo-thả ảnh vào đây"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Đổi ảnh Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* CENTER BANNER ZONE: Title + Slogan */}
            <div className="shrink-0 flex flex-col items-center justify-center text-center px-1 sm:px-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {settings.bannerTitle || 'CHINH PHỤC MÔN HÓA THCS- NĐH'}
              </h1>

              {/* Highlighted Slogan: Trách nhiệm - Uy tín - Chất lượng */}
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-4 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-amber-300/70 shadow-[0_0_15px_rgba(250,204,21,0.35)]">
                <span className="text-amber-200 text-xs sm:text-sm font-bold">✦</span>
                <span className="text-xs sm:text-sm md:text-base font-black tracking-wider text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] uppercase">
                  {settings.bannerSubtitle || 'Trách nhiệm — Uy tín — Chất lượng'}
                </span>
                <span className="text-amber-200 text-xs sm:text-sm font-bold">✦</span>
              </div>
            </div>

            {/* RIGHT BALANCE ZONE: Balances sm:flex-1 on desktop so Center Zone remains centered */}
            <div className="hidden md:flex md:flex-1 items-center justify-center pointer-events-none" aria-hidden="true" />
          </div>

          {/* Bottom Info Strip - Phone and Email on the SAME single line (email after phone) */}
          <div className="mt-2.5 pt-2 border-t border-white/25 w-full flex flex-col md:flex-row items-center justify-between gap-1.5 text-xs text-blue-50">
            {/* Left/Center: Address and Phone + Email on 1 single line */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-white/90">
                  <strong className="text-white">Địa chỉ:</strong> {settings.address}
                </span>
              </span>

              <span className="hidden sm:inline text-white/40">•</span>

              {/* Phone and Email on the SAME line (email after phone) */}
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1 hover:text-amber-200 transition font-semibold text-white underline underline-offset-2"
                  title="Gọi ngay"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Điện thoại: {settings.phone}</span>
                </a>

                <span className="text-white/50">•</span>

                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-1 hover:text-amber-200 transition font-semibold text-white underline underline-offset-2"
                  title="Gửi email"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Email: {settings.email}</span>
                </a>
              </div>
            </div>

            {/* Right: Teacher & Title */}
            <div className="flex items-center justify-center md:justify-end gap-2 text-[11px] sm:text-xs text-white/95 shrink-0">
              <span className="flex items-center gap-1 font-bold text-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                {settings.teacherName}
              </span>
              <span className="hidden lg:inline text-blue-100 text-[10px] italic">
                ({settings.teacherTitle})
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
