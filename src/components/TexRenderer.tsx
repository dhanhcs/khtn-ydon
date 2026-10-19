import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface TexRendererProps {
  content: string;
  className?: string;
}

export function TexRenderer({ content, className = '' }: TexRendererProps) {
  // Render LaTeX math string safely with KaTeX
  const renderMathSafely = (tex: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(tex.trim(), {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
    } catch {
      return tex;
    }
  };

  // Parse markdown + LaTeX blocks
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Step 1: Pre-process block math $$...$$ and \[...\] that may span multiple lines
    // We can replace them with placeholder tokens or parse systematically
    const blockMathRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
    
    // We split by block math first
    const sections: Array<{ type: 'math' | 'text'; content: string }> = [];
    let lastIdx = 0;
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = blockMathRegex.exec(content)) !== null) {
      if (blockMatch.index > lastIdx) {
        sections.push({ type: 'text', content: content.slice(lastIdx, blockMatch.index) });
      }
      const mathCode = blockMatch[1] || blockMatch[2] || '';
      sections.push({ type: 'math', content: mathCode });
      lastIdx = blockMatch.index + blockMatch[0].length;
    }
    if (lastIdx < content.length) {
      sections.push({ type: 'text', content: content.slice(lastIdx) });
    }

    const parts: React.ReactNode[] = [];

    sections.forEach((sec, secIdx) => {
      if (sec.type === 'math') {
        const html = renderMathSafely(sec.content, true);
        parts.push(
          <div
            key={`block-math-${secIdx}`}
            className="my-3 p-3 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/30 border border-indigo-100/80 rounded-2xl overflow-x-auto text-center font-serif text-sm shadow-xs"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        return;
      }

      // Split text section into lines
      const lines = sec.content.split('\n');
      let inList = false;
      let listItems: React.ReactNode[] = [];

      const flushList = (keyPrefix: string) => {
        if (inList && listItems.length > 0) {
          parts.push(
            <ul key={`${keyPrefix}-list`} className="list-disc pl-5 my-1.5 space-y-1">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
      };

      lines.forEach((line, lineIdx) => {
        const trimmed = line.trim();

        // Heading 1, 2, 3
        if (trimmed.startsWith('### ')) {
          flushList(`h3-${secIdx}-${lineIdx}`);
          parts.push(
            <h4 key={`h3-${secIdx}-${lineIdx}`} className="font-extrabold text-sm text-indigo-950 mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full inline-block" />
              {renderInline(trimmed.substring(4))}
            </h4>
          );
          return;
        }
        if (trimmed.startsWith('## ')) {
          flushList(`h2-${secIdx}-${lineIdx}`);
          parts.push(
            <h3 key={`h2-${secIdx}-${lineIdx}`} className="font-black text-sm sm:text-base text-blue-950 mt-3 mb-1.5 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-4 bg-blue-600 rounded-full inline-block" />
              {renderInline(trimmed.substring(3))}
            </h3>
          );
          return;
        }
        if (trimmed.startsWith('# ')) {
          flushList(`h1-${secIdx}-${lineIdx}`);
          parts.push(
            <h2 key={`h1-${secIdx}-${lineIdx}`} className="font-black text-base sm:text-lg text-blue-900 mt-3.5 mb-2">
              {renderInline(trimmed.substring(2))}
            </h2>
          );
          return;
        }

        // Bullet points
        if (/^[-*•]\s+/.test(trimmed)) {
          inList = true;
          const textWithoutBullet = trimmed.replace(/^[-*•]\s+/, '');
          listItems.push(
            <li key={`li-${secIdx}-${lineIdx}`} className="text-xs leading-relaxed text-slate-800">
              {renderInline(textWithoutBullet)}
            </li>
          );
          return;
        }

        // Numbered lists (1. , 2. )
        if (/^\d+\.\s+/.test(trimmed)) {
          flushList(`num-${secIdx}-${lineIdx}`);
          const textWithoutNum = trimmed.replace(/^\d+\.\s+/, '');
          const num = trimmed.match(/^(\d+)\./)?.[1] || '1';
          parts.push(
            <div key={`num-item-${secIdx}-${lineIdx}`} className="flex items-start gap-1.5 my-1 text-xs">
              <span className="font-bold text-blue-700 shrink-0 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">{num}</span>
              <div className="flex-1 text-slate-800 leading-relaxed">{renderInline(textWithoutNum)}</div>
            </div>
          );
          return;
        }

        // Empty line
        if (!trimmed) {
          flushList(`empty-${secIdx}-${lineIdx}`);
          parts.push(<div key={`sp-${secIdx}-${lineIdx}`} className="h-1.5" />);
          return;
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          flushList(`bq-${secIdx}-${lineIdx}`);
          parts.push(
            <blockquote key={`bq-${secIdx}-${lineIdx}`} className="p-2.5 my-1.5 border-l-4 border-indigo-500 bg-indigo-50/60 rounded-r-xl text-slate-700 italic text-xs leading-relaxed">
              {renderInline(trimmed.substring(2))}
            </blockquote>
          );
          return;
        }

        // Regular paragraph
        flushList(`p-${secIdx}-${lineIdx}`);
        parts.push(
          <p key={`p-${secIdx}-${lineIdx}`} className="text-xs leading-relaxed text-slate-800 my-0.5">
            {renderInline(line)}
          </p>
        );
      });

      flushList(`final-${secIdx}`);
    });
    return parts;
  }, [content]);

  // Render inline formatting: $math$, **bold**, *italic*, `code`
  function renderInline(text: string): React.ReactNode {
    if (!text) return null;

    // Match inline math $...$ or \(...\)
    const inlineTokens = text.split(/(\$[^$\n]+\$|\\\([^\n]+?\\\))/g);

    return inlineTokens.map((token, idx) => {
      // Check if token is inline math
      if ((token.startsWith('$') && token.endsWith('$') && token.length > 2) ||
          (token.startsWith('\\(') && token.endsWith('\\)') && token.length > 4)) {
        const mathTex = token.startsWith('$') ? token.slice(1, -1) : token.slice(2, -2);
        const mathHtml = renderMathSafely(mathTex, false);
        return (
          <span
            key={`math-inline-${idx}`}
            className="inline-block px-1 font-serif text-[13px] text-blue-900"
            dangerouslySetInnerHTML={{ __html: mathHtml }}
          />
        );
      }

      // Format markdown bold & code inside non-math text
      return <span key={`text-${idx}`}>{formatMarkdownSubTokens(token)}</span>;
    });
  }

  function formatMarkdownSubTokens(subText: string): React.ReactNode {
    // Split by bold **bold**
    const boldTokens = subText.split(/(\*\*[^*]+?\*\*)/g);

    return boldTokens.map((bToken, bIdx) => {
      if (bToken.startsWith('**') && bToken.endsWith('**') && bToken.length > 4) {
        return (
          <strong key={`b-${bIdx}`} className="font-black text-slate-950">
            {bToken.slice(2, -2)}
          </strong>
        );
      }

      // Code blocks `code`
      const codeTokens = bToken.split(/(`[^`]+?`)/g);
      return codeTokens.map((cToken, cIdx) => {
        if (cToken.startsWith('`') && cToken.endsWith('`') && cToken.length > 2) {
          return (
            <code key={`c-${cIdx}`} className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 font-mono text-[11px] rounded border border-slate-200">
              {cToken.slice(1, -1)}
            </code>
          );
        }
        return renderChemicalAndPlainText(cToken, `p-${bIdx}-${cIdx}`);
      });
    });
  }

  // Helper: định dạng công thức hóa học: chỉ số lệch xuống dưới bên phải (<sub>), hệ số cao bằng ký hiệu
  function renderChemicalAndPlainText(raw: string, keyPrefix: string): React.ReactNode {
    if (!raw) return null;

    // Chuẩn hóa mũi tên phản ứng
    const normalized = raw.replace(/\s*-->\s*|\s*->\s*/g, ' → ');

    // Nhận diện các cụm công thức hóa học hoặc phương trình hóa học
    // Ví dụ: 2H2 + O2 → 2H2O, H2SO4, Ca(OH)2, Al2(SO4)3, CO2, Fe2O3, KMnO4, CuSO4.5H2O
    // Phân tách thành các token từ để giữ nguyên từ ngữ tiếng Việt thông thường
    const words = normalized.split(/(\s+|[+→=])/);

    return words.map((word, wIdx) => {
      // Kiểm tra xem từ này có phải là công thức hóa học chứa chữ hoa và số chỉ số không
      // Điều kiện: Bắt đầu bằng hệ số (tùy chọn) + ký hiệu nguyên tố hóa học viết hoa (H, O, C, N, Na, Fe, Al, Cu, Ca, Ba, K, Cl, S, P, Mg, Zn, Ag, Au...)
      const chemRegex = /^(\d*)([A-Z][a-z]?(?:\d+|[A-Z][a-z]?|\([A-Za-z0-9]+\)\d*)+)$/;
      const match = word.match(chemRegex);

      if (match && !/^(THCS|THPT|KHTN|GDPT|BGD|SGK|QTV|TP|TX\d*|K\d+)$/i.test(word)) {
        const coefficient = match[1]; // Hệ số (cao bằng ký hiệu)
        const formulaBody = match[2]; // Phần công thức chứa nguyên tố và chỉ số

        // Tách nhỏ phần formulaBody thành các mảnh nguyên tố/nhóm và chỉ số
        // Regex bắt: (Ký hiệu nguyên tố hoặc nhóm ngoặc) kèm (chỉ số số nếu có)
        const subParts: React.ReactNode[] = [];
        const partRegex = /([A-Z][a-z]?|\([A-Za-z0-9]+\))(\d*)/g;
        let pMatch: RegExpExecArray | null;
        let lastPos = 0;

        while ((pMatch = partRegex.exec(formulaBody)) !== null) {
          if (pMatch.index > lastPos) {
            subParts.push(formulaBody.slice(lastPos, pMatch.index));
          }
          const elementOrGroup = pMatch[1];
          const indexNum = pMatch[2];

          // Nếu bên trong ngoặc có chỉ số con (ví dụ (SO4)2)
          let renderedElement: React.ReactNode = elementOrGroup;
          if (elementOrGroup.startsWith('(') && elementOrGroup.endsWith(')')) {
            const inner = elementOrGroup.slice(1, -1);
            const innerParts: React.ReactNode[] = [];
            const innerRegex = /([A-Z][a-z]?)(\d*)/g;
            let inMatch: RegExpExecArray | null;
            let inLast = 0;
            while ((inMatch = innerRegex.exec(inner)) !== null) {
              if (inMatch.index > inLast) innerParts.push(inner.slice(inLast, inMatch.index));
              innerParts.push(inMatch[1]);
              if (inMatch[2]) {
                innerParts.push(<sub key={`in-sub-${inMatch.index}`} className="text-[9px] font-semibold text-indigo-900 translate-y-0.5">{inMatch[2]}</sub>);
              }
              inLast = inMatch.index + inMatch[0].length;
            }
            if (inLast < inner.length) innerParts.push(inner.slice(inLast));
            renderedElement = <>({innerParts})</>;
          }

          subParts.push(
            <span key={`chem-${pMatch.index}`}>
              {renderedElement}
              {indexNum && (
                <sub className="text-[9px] font-bold text-indigo-900 inline-block align-baseline translate-y-0.5 ml-0.5 mr-0.5">
                  {indexNum}
                </sub>
              )}
            </span>
          );
          lastPos = pMatch.index + pMatch[0].length;
        }

        if (lastPos < formulaBody.length) {
          subParts.push(formulaBody.slice(lastPos));
        }

        return (
          <span key={`chem-word-${keyPrefix}-${wIdx}`} className="font-semibold text-indigo-950 inline-block mx-0.5">
            {coefficient && <span className="font-bold text-indigo-900">{coefficient}</span>}
            {subParts}
          </span>
        );
      }

      // Xử lý các ký tự chỉ số unicode nếu có sẵn (ví dụ H₂SO₄)
      if (/[₀-₉]/.test(word)) {
        return (
          <span key={`uni-chem-${keyPrefix}-${wIdx}`} className="font-semibold text-indigo-950 inline-block mx-0.5">
            {word}
          </span>
        );
      }

      return <span key={`w-${keyPrefix}-${wIdx}`}>{word}</span>;
    });
  }

  return (
    <div className={`tex-content space-y-1 ${className}`}>
      {renderedContent}
    </div>
  );
}
