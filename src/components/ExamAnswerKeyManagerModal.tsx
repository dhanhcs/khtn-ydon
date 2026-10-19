import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Key, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Sparkles, 
  Layers, 
  Hash, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { PeriodicExamCodeKey } from '../types';

interface ExamAnswerKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  codeKeys: Record<string, PeriodicExamCodeKey>;
  activeCode: string;
  onSaveCodeKeys: (newKeys: Record<string, PeriodicExamCodeKey>, activeCode: string) => void;
}

export function ExamAnswerKeyManagerModal({
  isOpen,
  onClose,
  examTitle = 'Kiểm tra định kỳ KHTN',
  codeKeys,
  activeCode,
  onSaveCodeKeys
}: ExamAnswerKeyManagerModalProps) {
  if (!isOpen) return null;

  // Local copy of codeKeys for editing
  const [localKeys, setLocalKeys] = useState<Record<string, PeriodicExamCodeKey>>(() => {
    if (Object.keys(codeKeys).length > 0) return JSON.parse(JSON.stringify(codeKeys));
    // Default 4 codes
    const defaults: Record<string, PeriodicExamCodeKey> = {};
    ['0101', '0102', '0103', '0104'].forEach((code, idx) => {
      defaults[code] = createDefaultCodeKey(code, idx);
    });
    return defaults;
  });

  const [currentCode, setCurrentCode] = useState<string>(() => {
    if (activeCode && codeKeys[activeCode]) return activeCode;
    return Object.keys(codeKeys)[0] || '0101';
  });

  const [activePart, setActivePart] = useState<'p1' | 'p2' | 'p3'>('p1');
  const [quickPasteText, setQuickPasteText] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  function createDefaultCodeKey(code: string, offset = 0): PeriodicExamCodeKey {
    const letters = ['A', 'B', 'C', 'D'];
    const p1 = Array.from({ length: 40 }, (_, i) => letters[(i + offset) % 4]);
    const p2: boolean[][] = Array.from({ length: 8 }, (_, qIdx) => [
      (qIdx + offset) % 2 === 0,
      (qIdx + offset) % 3 === 0,
      (qIdx + offset) % 2 !== 0,
      (qIdx + offset) % 4 === 0
    ]);
    const p3 = ['10', '25', '3.5', '120', '0.75', '45'];
    return {
      code,
      part1Keys: p1,
      part2Keys: p2,
      part3Keys: p3,
      essayMaxScore: 2.5
    };
  }

  const currentKeyData = localKeys[currentCode] || createDefaultCodeKey(currentCode);
  const codesList = Object.keys(localKeys).sort();

  // Add new code (up to 6)
  const handleAddCode = () => {
    if (codesList.length >= 6) {
      alert('Hệ thống hỗ trợ tối đa 6 mã đề cho mỗi kỳ thi kiểm tra định kỳ!');
      return;
    }
    // Determine next code by increasing units digit of last code
    const lastCode = codesList[codesList.length - 1] || '0101';
    const lastNum = parseInt(lastCode, 10) || 101;
    const nextCode = String(lastNum + 1).padStart(lastCode.length, '0');

    setLocalKeys(prev => ({
      ...prev,
      [nextCode]: createDefaultCodeKey(nextCode, codesList.length)
    }));
    setCurrentCode(nextCode);
  };

  // Delete an exam code
  const handleDeleteCode = (codeToDelete: string) => {
    if (codesList.length <= 1) {
      alert('Phải giữ lại ít nhất 1 mã đề để thực hiện chấm thi!');
      return;
    }
    const nextKeys = { ...localKeys };
    delete nextKeys[codeToDelete];
    setLocalKeys(nextKeys);
    if (currentCode === codeToDelete) {
      setCurrentCode(Object.keys(nextKeys)[0]);
    }
  };

  // Update Part 1 key
  const handleUpdateP1Key = (questionIdx: number, letter: string) => {
    const updatedP1 = [...currentKeyData.part1Keys];
    updatedP1[questionIdx] = letter;

    setLocalKeys(prev => ({
      ...prev,
      [currentCode]: {
        ...currentKeyData,
        part1Keys: updatedP1
      }
    }));
  };

  // Quick fill Part 1 from string
  const handleQuickPasteP1 = () => {
    if (!quickPasteText.trim()) return;
    const letters = ['A', 'B', 'C', 'D'];
    const cleaned = quickPasteText.toUpperCase();
    
    // Check if matches format "1A 2B 3C..." or raw letters "ABCD..."
    const matchedLetters: string[] = [];
    const pairMatches = [...cleaned.matchAll(/\d+\s*([A-D])/g)];
    if (pairMatches.length >= 5) {
      pairMatches.forEach(m => matchedLetters.push(m[1]));
    } else {
      // Just extract all characters A, B, C, D
      for (const char of cleaned) {
        if (letters.includes(char)) {
          matchedLetters.push(char);
        }
      }
    }

    if (matchedLetters.length === 0) {
      alert('Không tìm thấy ký tự A, B, C, D nào trong chuỗi nhập. Vui lòng kiểm tra lại!');
      return;
    }

    const updatedP1 = [...currentKeyData.part1Keys];
    for (let i = 0; i < Math.min(40, matchedLetters.length); i++) {
      updatedP1[i] = matchedLetters[i];
    }

    setLocalKeys(prev => ({
      ...prev,
      [currentCode]: {
        ...currentKeyData,
        part1Keys: updatedP1
      }
    }));

    setSaveSuccessMsg(`Đã cập nhật nhanh ${Math.min(40, matchedLetters.length)} câu trắc nghiệm cho Mã đề ${currentCode}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setQuickPasteText('');
  };

  // Update Part 2 key (True / False)
  const handleUpdateP2Key = (questionIdx: number, itemIdx: number, val: boolean) => {
    const updatedP2 = currentKeyData.part2Keys.map((row, q) => {
      if (q === questionIdx) {
        const newRow = [...row];
        newRow[itemIdx] = val;
        return newRow;
      }
      return row;
    });

    setLocalKeys(prev => ({
      ...prev,
      [currentCode]: {
        ...currentKeyData,
        part2Keys: updatedP2
      }
    }));
  };

  // Update Part 3 key (Short Answer)
  const handleUpdateP3Key = (questionIdx: number, val: string) => {
    const updatedP3 = [...currentKeyData.part3Keys];
    updatedP3[questionIdx] = val;

    setLocalKeys(prev => ({
      ...prev,
      [currentCode]: {
        ...currentKeyData,
        part3Keys: updatedP3
      }
    }));
  };

  // Copy keys from another code
  const handleCopyFromCode = (sourceCode: string) => {
    if (!localKeys[sourceCode]) return;
    const copied = JSON.parse(JSON.stringify(localKeys[sourceCode]));
    copied.code = currentCode;

    setLocalKeys(prev => ({
      ...prev,
      [currentCode]: copied
    }));
    setSaveSuccessMsg(`Đã sao chép đáp án từ Mã ${sourceCode} sang Mã ${currentCode}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Final Save
  const handleSaveAll = () => {
    onSaveCodeKeys(localKeys, currentCode);
    setSaveSuccessMsg('Đã lưu thành công đáp án cho tất cả các mã đề vào hệ thống!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white font-mono">
                  QUẢN LÝ ĐÁP ÁN ĐA MÃ ĐỀ (TỐI ĐA 6 MÃ)
                </span>
                <span className="text-xs text-blue-200">Trường Y Đôn</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Cập Nhật Đáp Án Chuẩn Để Chấm Bài Trắc Nghiệm KTĐK
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>LƯU ĐÁP ÁN NGAY</span>
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

        {/* Success toast banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Exam Code Selector Tabs (Up to 6 codes) */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              Chọn Mã Đề ({codesList.length}/6):
            </span>
            {codesList.map((code) => {
              const isActive = code === currentCode;
              return (
                <div key={code} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentCode(code)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center gap-1.5 border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Mã {code}</span>
                  </button>
                  {codesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCode(code)}
                      className="ml-0.5 p-1 text-slate-400 hover:text-rose-600 transition"
                      title={`Xóa mã ${code}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {codesList.length < 6 && (
              <button
                type="button"
                onClick={handleAddCode}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 transition cursor-pointer"
                title="Thêm mã đề mới (tối đa 6 mã)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Mã Đề</span>
              </button>
            )}
          </div>

          {/* Quick copy tool */}
          {codesList.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Chép từ:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleCopyFromCode(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold font-mono"
              >
                <option value="" disabled>Chọn mã khác...</option>
                {codesList.filter(c => c !== currentCode).map(c => (
                  <option key={c} value={c}>Mã {c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Section Tabs (Phần I, II, III) */}
        <div className="bg-white px-4 pt-3 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActivePart('p1')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activePart === 'p1'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
            <span>Phần I: 40 Câu Trắc Nghiệm (A - D)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePart('p2')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activePart === 'p2'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
            <span>Phần II: 8 Câu Đúng/Sai (32 ý a, b, c, d)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePart('p3')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activePart === 'p3'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
            <span>Phần III: 6 Câu Trả Lời Ngắn (Số)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          
          {/* ======================================================== */}
          {/* TAB 1: PHẦN I (40 CÂU TRẮC NGHIỆM) */}
          {/* ======================================================== */}
          {activePart === 'p1' && (
            <div className="space-y-4">
              
              {/* Quick paste bar */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center gap-2">
                <div className="text-xs text-amber-900 font-bold shrink-0 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Nạp nhanh chuỗi đáp án (Ví dụ: 1A 2B 3C... hoặc ABCD...):</span>
                </div>
                <input
                  type="text"
                  value={quickPasteText}
                  onChange={(e) => setQuickPasteText(e.target.value)}
                  placeholder="Dán hoặc gõ chuỗi đáp án 40 câu..."
                  className="flex-1 w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white font-mono focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleQuickPasteP1}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shrink-0"
                >
                  Nạp Chuỗi
                </button>
              </div>

              {/* 40 questions grid: 4 columns of 10 questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((colIdx) => (
                  <div key={colIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-black uppercase text-slate-500 text-center border-b border-slate-200 pb-1">
                      Cột {colIdx + 1}: Câu {colIdx * 10 + 1} - Câu {(colIdx + 1) * 10}
                    </div>
                    {Array.from({ length: 10 }, (_, rowIdx) => {
                      const qNum = colIdx * 10 + rowIdx + 1;
                      const currentAns = currentKeyData.part1Keys[qNum - 1] || 'A';
                      return (
                        <div key={qNum} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="font-mono font-bold text-xs text-slate-700 w-12 pl-1">
                            Câu {qNum}:
                          </span>
                          <div className="flex items-center gap-1">
                            {['A', 'B', 'C', 'D'].map((letter) => {
                              const isSelected = currentAns === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => handleUpdateP1Key(qNum - 1, letter)}
                                  className={`w-7 h-7 rounded-lg font-black text-xs transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PHẦN II (8 CÂU ĐÚNG / SAI) */}
          {/* ======================================================== */}
          {activePart === 'p2' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs text-indigo-900 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Phần II gồm 8 câu hỏi. Mỗi câu có 4 ý a), b), c), d). Thầy/Cô bấm chọn Đúng hoặc Sai cho từng ý.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 8 }, (_, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="font-black text-xs text-indigo-950 flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span>Câu {qIdx + 1} (Phần II)</span>
                      <span className="text-[11px] font-normal text-slate-500 font-mono">Thang điểm GDPT 2018</span>
                    </div>

                    <div className="space-y-2">
                      {['a', 'b', 'c', 'd'].map((sub, sIdx) => {
                        const isCorrect = currentKeyData.part2Keys[qIdx]?.[sIdx] ?? true;
                        return (
                          <div key={sub} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                            <span className="font-bold text-xs text-slate-700 font-mono">
                              Ý {sub})
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateP2Key(qIdx, sIdx, true)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                Đúng (Đ)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateP2Key(qIdx, sIdx, false)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  !isCorrect
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                Sai (S)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PHẦN III (6 CÂU TRẢ LỜI NGẮN) */}
          {/* ======================================================== */}
          {activePart === 'p3' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Phần III gồm 6 câu trả lời ngắn. Thầy/Cô nhập giá trị chuẩn (số nguyên, số thập phân hoặc số âm).</span>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-xs text-slate-800 font-mono">
                      Câu {idx + 1} (Trả lời ngắn):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentKeyData.part3Keys[idx] || ''}
                        onChange={(e) => handleUpdateP3Key(idx, e.target.value)}
                        placeholder="Nhập giá trị số..."
                        className="w-36 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold text-center focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Đang cấu hình đáp án cho <span className="font-bold text-blue-900">Mã đề {currentCode}</span> (Kỳ thi: {examTitle})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Lưu và Áp dụng</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
