import React, { useState, useRef } from 'react';
import { X, Printer, Download, CheckCircle2, Info, Eye, Sparkles, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PrintableAnswerSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  defaultGrade?: number;
  testNumber?: string;
}

export function PrintableAnswerSheetModal({
  isOpen,
  onClose,
  examTitle,
  defaultGrade = 8,
  testNumber = 'Đề 1'
}: PrintableAnswerSheetModalProps) {
  const [activePage, setActivePage] = useState<'all' | 'page1' | 'page2'>('all');
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-mono">
                  MẪU CHUẨN MỚI 2026 (GDPT 2018)
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Phiếu Trả Lời Trắc Nghiệm Mới Chuẩn Khổ A4 (Phần I, II, III & Tự luận IV)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Page selection buttons */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-700">
              <button
                type="button"
                onClick={() => setActivePage('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePage === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                In 2 Mặt (Tất cả)
              </button>
              <button
                type="button"
                onClick={() => setActivePage('page1')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePage === 'page1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Trang 1 (Trắc nghiệm)
              </button>
              <button
                type="button"
                onClick={() => setActivePage('page2')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePage === 'page2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Trang 2 (Tự luận)
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (Ctrl + P)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEETS CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200 flex flex-col items-center gap-6">
          
          {/* ============================================================== */}
          {/* TRANG 1: PHIẾU TRẢ LỜI TRẮC NGHIỆM (PHẦN I, PHẦN II, PHẦN III) */}
          {/* ============================================================== */}
          {(activePage === 'all' || activePage === 'page1') && (
            <div 
              id="printable-page-1"
              className="w-full max-w-[820px] bg-white p-5 sm:p-7 rounded-sm shadow-xl border border-slate-300 text-black relative font-serif text-[11px] leading-tight print:p-0 print:shadow-none print:border-none print:rounded-none print:w-[210mm] print:h-[297mm] print:overflow-hidden print:page-break-after-always"
              style={{ minHeight: '1120px' }}
            >
              {/* Corner Optical Alignment Markers (4 Black Fiducial Boxes) */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-black" aria-hidden="true" />
              <div className="absolute top-2 right-2 w-4 h-4 bg-black" aria-hidden="true" />
              <div className="absolute bottom-2 left-2 w-4 h-4 bg-black" aria-hidden="true" />
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-black" aria-hidden="true" />

              {/* Side Timing Marks (Vạch đen đồng bộ căn lề OMR) */}
              <div className="absolute top-24 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-36 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-48 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-60 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-72 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-84 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-96 right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-[420px] right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />
              <div className="absolute top-[680px] right-2 w-3.5 h-1.5 bg-black" aria-hidden="true" />

              {/* SECTION: MAIN HEADER */}
              <div className="text-center pb-1">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight uppercase text-black font-sans">
                  PHIẾU TRẢ LỜI TRẮC NGHIỆM
                </h1>
                <div className="flex justify-center items-center gap-1 mt-0.5 text-xs">
                  <span>Kỳ thi:</span>
                  <div className="w-80 border-b border-dotted border-black inline-block h-3" />
                </div>
                <div className="flex justify-between items-center text-xs px-4 mt-1">
                  <div className="flex items-center gap-1 flex-1">
                    <span>Môn thi:</span>
                    <div className="w-56 border-b border-dotted border-black inline-block h-3" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Ngày thi:</span>
                    <span className="font-mono">......./......./ 20.......</span>
                  </div>
                </div>
              </div>

              {/* SECTION: THÔNG TIN THÍ SINH, GIÁM THỊ, SBD VÀ MÃ ĐỀ */}
              <div className="grid grid-cols-12 border border-black mt-1 mb-1">
                
                {/* Cột 1: Giám thị 1 & Giám thị 2 */}
                <div className="col-span-3 border-r border-black flex flex-col justify-between divide-y divide-black text-[10px]">
                  <div className="p-2 h-16 flex flex-col justify-between">
                    <span>Họ tên, chữ ký của Giám thị 1</span>
                    <div className="h-6" />
                  </div>
                  <div className="p-2 h-16 flex flex-col justify-between">
                    <span>Họ tên, chữ ký của Giám thị 2</span>
                    <div className="h-6" />
                  </div>
                </div>

                {/* Cột 2: Thông tin thí sinh (Mục 1 đến 6) */}
                <div className="col-span-5 border-r border-black p-2 space-y-1 text-[10.5px]">
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">1. Hội đồng thi:</span>
                    <div className="flex-1 border-b border-dotted border-black ml-1 h-3" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">2. Điểm thi:</span>
                    <div className="flex-1 border-b border-dotted border-black ml-1 h-3" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">3. Phòng thi số:</span>
                    <div className="flex-1 border-b border-dotted border-black ml-1 h-3" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">4. Họ và tên thí sinh:</span>
                    <div className="flex-1 border-b border-dotted border-black ml-1 h-3" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">5. Ngày sinh:</span>
                    <span className="font-mono text-[10px] ml-1">......../......../..........</span>
                    <span className="ml-1">(Nam/ Nữ).</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="shrink-0 font-medium">6. Chữ ký của thí sinh:</span>
                    <div className="flex-1 border-b border-dotted border-black ml-1 h-3" />
                  </div>
                </div>

                {/* Cột 3: Số báo danh (7) & Mã đề thi (8) */}
                <div className="col-span-4 p-1.5 flex justify-between gap-1 text-[9px] font-sans">
                  
                  {/* Mục 7: Số báo danh (6 chữ số) */}
                  <div className="flex-1 flex flex-col items-center">
                    <span className="font-bold mb-0.5 text-center text-[10px]">7. Số báo danh</span>
                    {/* 6 ô vuông ghi số */}
                    <div className="grid grid-cols-6 border border-black w-full mb-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-4 border-r last:border-r-0 border-black bg-white" />
                      ))}
                    </div>
                    {/* Lưới 6 cột tròn tô số 0-9 */}
                    <div className="grid grid-cols-6 gap-x-0.5 gap-y-0.5 w-full">
                      {Array.from({ length: 10 }).map((_, num) => (
                        <React.Fragment key={num}>
                          {Array.from({ length: 6 }).map((_, col) => (
                            <div
                              key={`${num}-${col}`}
                              className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center text-[8px] font-mono leading-none"
                            >
                              {num}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="w-px bg-black my-1" />

                  {/* Mục 8: Mã đề thi (4 chữ số) */}
                  <div className="w-24 flex flex-col items-center">
                    <span className="font-bold mb-0.5 text-center text-[10px]">8. Mã đề thi</span>
                    {/* 4 ô vuông ghi số */}
                    <div className="grid grid-cols-4 border border-black w-full mb-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 border-r last:border-r-0 border-black bg-white" />
                      ))}
                    </div>
                    {/* Lưới 4 cột tròn tô số 0-9 */}
                    <div className="grid grid-cols-4 gap-x-0.5 gap-y-0.5 w-full">
                      {Array.from({ length: 10 }).map((_, num) => (
                        <React.Fragment key={num}>
                          {Array.from({ length: 4 }).map((_, col) => (
                            <div
                              key={`${num}-${col}`}
                              className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center text-[8px] font-mono leading-none"
                            >
                              {num}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Chú ý cho thí sinh */}
              <div className="text-center italic text-[9.5px] py-0.5">
                <strong>Chú ý:</strong> Thí sinh cần đọc kỹ hướng dẫn ở mặt sau Phiếu này.
              </div>

              {/* ============================================================== */}
              {/* PHẦN I: TRẮC NGHIỆM 40 CÂU (4 CỘT X 10 CÂU) */}
              {/* ============================================================== */}
              <div className="border border-black mt-1">
                <div className="bg-black text-white font-bold px-2 py-0.5 text-[10px] uppercase font-sans flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-black border border-white" />
                  <span>PHẦN I</span>
                </div>

                <div className="grid grid-cols-4 divide-x divide-black p-1 text-[9.5px] font-sans">
                  
                  {/* Cột 1: Câu 1 đến 10 */}
                  <div className="px-1.5">
                    <div className="grid grid-cols-5 text-center font-bold pb-0.5 mb-0.5 border-b border-black">
                      <span className="text-left font-serif"></span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>D</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((qNum) => (
                      <div key={qNum} className="grid grid-cols-5 items-center py-0.5">
                        <span className="font-bold text-left">{qNum}</span>
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <div
                            key={opt}
                            className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Cột 2: Câu 11 đến 20 */}
                  <div className="px-1.5">
                    <div className="grid grid-cols-5 text-center font-bold pb-0.5 mb-0.5 border-b border-black">
                      <span className="text-left font-serif"></span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>D</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 11).map((qNum) => (
                      <div key={qNum} className="grid grid-cols-5 items-center py-0.5">
                        <span className="font-bold text-left">{qNum}</span>
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <div
                            key={opt}
                            className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Cột 3: Câu 21 đến 30 */}
                  <div className="px-1.5">
                    <div className="grid grid-cols-5 text-center font-bold pb-0.5 mb-0.5 border-b border-black">
                      <span className="text-left font-serif"></span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>D</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 21).map((qNum) => (
                      <div key={qNum} className="grid grid-cols-5 items-center py-0.5">
                        <span className="font-bold text-left">{qNum}</span>
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <div
                            key={opt}
                            className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Cột 4: Câu 31 đến 40 */}
                  <div className="px-1.5">
                    <div className="grid grid-cols-5 text-center font-bold pb-0.5 mb-0.5 border-b border-black">
                      <span className="text-left font-serif"></span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>D</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 31).map((qNum) => (
                      <div key={qNum} className="grid grid-cols-5 items-center py-0.5">
                        <span className="font-bold text-left">{qNum}</span>
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <div
                            key={opt}
                            className="w-3.5 h-3.5 mx-auto rounded-full border border-black flex items-center justify-center"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* ============================================================== */}
              {/* PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (8 CÂU, MỖI CÂU 4 Ý a, b, c, d) */}
              {/* ============================================================== */}
              <div className="border border-black mt-2">
                <div className="bg-black text-white font-bold px-2 py-0.5 text-[10px] uppercase font-sans flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-black border border-white" />
                  <span>PHẦN II</span>
                </div>

                <div className="grid grid-cols-4 divide-x divide-black p-1 text-[9px] font-sans">
                  
                  {/* Khối 1: Câu 1 & Câu 2 */}
                  <div className="grid grid-cols-2 divide-x divide-black px-1">
                    {/* Câu 1 */}
                    <div className="pr-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 1</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Câu 2 */}
                    <div className="pl-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 2</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 2: Câu 3 & Câu 4 */}
                  <div className="grid grid-cols-2 divide-x divide-black px-1">
                    {/* Câu 3 */}
                    <div className="pr-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 3</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Câu 4 */}
                    <div className="pl-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 4</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 3: Câu 5 & Câu 6 */}
                  <div className="grid grid-cols-2 divide-x divide-black px-1">
                    {/* Câu 5 */}
                    <div className="pr-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 5</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Câu 6 */}
                    <div className="pl-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 6</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 4: Câu 7 & Câu 8 */}
                  <div className="grid grid-cols-2 divide-x divide-black px-1">
                    {/* Câu 7 */}
                    <div className="pr-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 7</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Câu 8 */}
                    <div className="pl-1">
                      <div className="text-center font-bold border-b border-black pb-0.5">Câu 8</div>
                      <div className="flex justify-end gap-1 text-[8px] font-bold py-0.5 pr-0.5">
                        <span>Đúng</span>
                        <span>Sai</span>
                      </div>
                      {['a)', 'b)', 'c)', 'd)'].map((opt) => (
                        <div key={opt} className="flex items-center justify-between py-0.5">
                          <span className="font-bold">{opt}</span>
                          <div className="flex gap-1.5 pr-0.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ============================================================== */}
              {/* PHẦN III: TRẢ LỜI NGẮN (6 CÂU: CÂU 1 ĐẾN CÂU 6) */}
              {/* ============================================================== */}
              <div className="border border-black mt-2">
                <div className="bg-black text-white font-bold px-2 py-0.5 text-[10px] uppercase font-sans flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-black border border-white" />
                  <span>PHẦN III</span>
                </div>

                <div className="grid grid-cols-6 divide-x divide-black p-1 text-[9px] font-sans">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((qNum) => (
                    <div key={qNum} className="px-1 flex flex-col items-center">
                      <div className="font-bold text-center border-b border-black w-full pb-0.5 mb-1">
                        Câu {qNum}
                      </div>

                      {/* Hàng dấu âm: - */}
                      <div className="flex items-center gap-2 mb-1 w-full justify-start pl-1">
                        <span className="font-bold text-xs">-</span>
                        <div className="w-3.5 h-3.5 rounded-full border border-black" />
                      </div>

                      {/* Hàng dấu phẩy: , */}
                      <div className="flex items-center gap-2 mb-1 w-full justify-start pl-1">
                        <span className="font-bold text-xs">,</span>
                        <div className="flex gap-1 ml-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-black" />
                          <div className="w-3.5 h-3.5 rounded-full border border-black" />
                        </div>
                      </div>

                      {/* Lưới 4 cột số tô từ 0 đến 9 */}
                      <div className="w-full space-y-0.5">
                        {Array.from({ length: 10 }).map((_, num) => (
                          <div key={num} className="flex items-center justify-between px-0.5">
                            <span className="font-bold w-2 text-center">{num}</span>
                            <div className="flex gap-1">
                              <div className="w-3.5 h-3.5 rounded-full border border-black" />
                              <div className="w-3.5 h-3.5 rounded-full border border-black" />
                              <div className="w-3.5 h-3.5 rounded-full border border-black" />
                              <div className="w-3.5 h-3.5 rounded-full border border-black" />
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TRANG 2: PHẦN IV. TỰ LUẬN (THEO CHUẨN MẪU GIẤY THI GDPT 2018) */}
          {/* ============================================================== */}
          {(activePage === 'all' || activePage === 'page2') && (
            <div 
              id="printable-page-2"
              className="w-full max-w-[820px] bg-white p-6 sm:p-8 rounded-sm shadow-xl border border-slate-300 text-black relative font-serif text-xs leading-tight print:p-0 print:shadow-none print:border-none print:rounded-none print:w-[210mm] print:h-[297mm] print:overflow-hidden print:page-break-before-always"
              style={{ minHeight: '1120px' }}
            >
              {/* Outer Border Frame */}
              <div className="border border-black h-full min-h-[1050px] p-5 flex flex-col justify-between">
                
                {/* Title */}
                <div className="mb-4">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide text-black font-sans">
                    PHẦN IV. Tự luận
                  </h2>
                </div>

                {/* Dòng kẻ chấm chấm toàn bộ trang giấy làm bài tự luận */}
                <div className="flex-1 space-y-7 pt-2">
                  {Array.from({ length: 33 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="w-full border-b border-dotted border-black h-1" 
                      aria-hidden="true"
                    />
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-slate-500">
            💡 Gợi ý: Khi in, tại hộp thoại Print chọn <strong>Khổ A4</strong>, lề <strong>None (Không có)</strong> hoặc <strong>Fit to page (Vừa trang)</strong> để mẫu in chính xác 100% như bản gốc.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
