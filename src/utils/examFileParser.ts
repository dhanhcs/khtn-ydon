import mammoth from 'mammoth';
import { ExamQuestion, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, GradeLevel, SubjectType } from '../types';

export interface ParsedExamResult {
  title?: string;
  grade?: GradeLevel;
  subject?: SubjectType;
  durationMinutes?: number;
  questions: ExamQuestion[];
  rawText: string;
  summary: {
    total: number;
    mcqCount: number;
    tfCount: number;
    saCount: number;
    isStandardGDPT2018: boolean;
  };
}

/**
 * Giải mã HTML thành văn bản thuần sạch sẽ, giữ nguyên dòng và cấu trúc đoạn văn bản
 */
export function extractCleanTextFromHtml(html: string): string {
  if (!html) return '';

  try {
    // 1. Chạy trong môi trường trình duyệt với DOMParser
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Xóa các thẻ không chứa nội dung đề thi
      doc.querySelectorAll('script, style, head, meta, link, noscript').forEach(el => el.remove());

      const blockTags = new Set([
        'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'TABLE', 'BLOCKQUOTE', 'SECTION', 'ARTICLE'
      ]);

      const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'BR') return '\n';

          let childText = '';
          for (let i = 0; i < node.childNodes.length; i++) {
            childText += walk(node.childNodes[i]);
          }

          if (el.tagName === 'SUB') {
            return `<sub>${childText}</sub>`;
          }
          if (el.tagName === 'SUP') {
            return `<sup>${childText}</sup>`;
          }

          if (blockTags.has(el.tagName)) {
            return '\n' + childText + '\n';
          }
          return childText;
        }
        return '';
      };

      const extracted = walk(doc.body || doc.documentElement);
      return extracted
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/[\u00a0\u200b\u200c\u200d\uFEFF]+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();
    }
  } catch (e) {
    console.warn('DOMParser extraction warning, falling back to regex:', e);
  }

  // 2. Fallback Regex nếu không có DOMParser hoặc gặp lỗi
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|table|blockquote)>/gi, '\n')
    .replace(/<(?!\/?(?:sub|sup)\b)[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u00a0\u200b\u200c\u200d\uFEFF]+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Đọc và trích xuất text từ file đề thi:
 * - DOCX (Office Open XML): Ưu tiên convertToHtml rồi làm sạch để giữ nguyên cấu trúc dòng và bảng
 * - DOC / HTML: Giải mã HTML hoặc OLE compound binary
 * - TXT / Markdown: Đọc text UTF-8 / Windows-1258
 */
export async function extractTextFromExamFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer.slice(0, 8));

  // 1. Kiểm tra magic bytes của tệp ZIP / DOCX (PK\x03\x04) hoặc phần mở rộng .docx
  const isZipDocx = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;

  if (isZipDocx || name.endsWith('.docx')) {
    try {
      // Ưu tiên convertToHtml vì giữ nguyên các ngắt đoạn <p>, hàng bảng <tr>, danh sách
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      if (htmlResult.value && htmlResult.value.trim().length > 20) {
        const clean = extractCleanTextFromHtml(htmlResult.value);
        if (clean.length > 20) {
          return clean;
        }
      }
    } catch (htmlErr) {
      console.warn('Mammoth convertToHtml failed, attempting extractRawText:', htmlErr);
    }

    try {
      const rawResult = await mammoth.extractRawText({ arrayBuffer });
      if (rawResult.value && rawResult.value.trim().length > 20) {
        return rawResult.value.trim();
      }
    } catch (rawErr) {
      console.warn('Mammoth extractRawText failed:', rawErr);
    }
  }

  // 2. Thử giải mã text với UTF-8
  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  let text = utf8Decoder.decode(arrayBuffer);

  // Xóa Byte Order Mark (BOM \ufeff)
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  // 3. Nếu là file HTML (Ví dụ file .doc định dạng HTML từ Word hoặc hệ thống khác)
  if (
    text.includes('<html') ||
    text.includes('<!DOCTYPE') ||
    text.includes('<body') ||
    text.includes('<div') ||
    text.includes('<table') ||
    text.includes('<p')
  ) {
    const cleanText = extractCleanTextFromHtml(text);
    if (cleanText.length > 30) {
      return cleanText;
    }
  }

  // 4. Nếu có dấu hiệu tiếng Việt bị vỡ font do encoding Windows-1258 (ANSI tiếng Việt)
  if (text.includes('\ufffd')) {
    try {
      const winDecoder = new TextDecoder('windows-1258', { fatal: false });
      const winText = winDecoder.decode(arrayBuffer);
      if (!winText.includes('\ufffd') && winText.length > text.length * 0.8) {
        text = winText;
      }
    } catch {}
  }

  // 5. Nếu là file nhị phân doc cũ (OLE compound: \xD0\xCF\x11\xE0)
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    let extracted = '';
    const u16 = new Uint16Array(arrayBuffer);
    for (let i = 0; i < u16.length; i++) {
      const code = u16[i];
      if ((code >= 32 && code < 127) || (code >= 0x00C0 && code <= 0x1EF9) || code === 10 || code === 13) {
        extracted += String.fromCharCode(code);
      } else if (extracted.length > 0 && extracted[extracted.length - 1] !== ' ') {
        extracted += ' ';
      }
    }
    if (extracted.includes('Câu') || extracted.includes('PHẦN') || extracted.includes('đáp án')) {
      return extracted.replace(/[ ]{2,}/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    }
  }

  return text.trim();
}

/**
 * Phân tích nội dung đề kiểm tra chuẩn 3 phần GDPT 2018:
 * - Phần 1: 16 câu trắc nghiệm nhiều lựa chọn (8.0 điểm)
 * - Phần 2: 1 câu trắc nghiệm đúng/sai 4 nhận định (1.0 điểm)
 * - Phần 3: 1 câu trả lời ngắn 2 chỗ điền số (1.0 điểm)
 */
export function parseExamContentText(rawContent: string): ParsedExamResult {
  const normalized = rawContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  let title: string | undefined;
  let grade: GradeLevel | undefined;
  let subject: SubjectType | undefined;
  let durationMinutes: number | undefined;

  // 1. Phân tích các thẻ metadata ở đầu đề thi
  const titleMatch = normalized.match(/\[(?:TIÊU ĐỀ|TÊN ĐỀ|ĐỀ)[:\s]*([^\]\n]+)\]/i) ||
                     normalized.match(/(?:Tiêu đề|Tên đề|Đề bài)[:\s]*([^\n]+)/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  const gradeMatch = normalized.match(/\[(?:KHỐI|LỚP)[:\s]*([6-9])\]/i) ||
                     normalized.match(/(?:Khối|Lớp)[:\s]*([6-9])\b/i);
  if (gradeMatch && gradeMatch[1]) {
    grade = Number(gradeMatch[1]) as GradeLevel;
  }

  const timeMatch = normalized.match(/\[(?:THỜI GIAN|PHÚT)[:\s]*(\d+)\]/i) ||
                    normalized.match(/(?:Thời gian|Thời lượng)[:\s]*(\d+)\s*(?:phút)?/i);
  if (timeMatch && timeMatch[1]) {
    durationMinutes = Number(timeMatch[1]);
  }

  const subMatch = normalized.match(/\[(?:MÔN|PHÂN MÔN)[:\s]*([^\]\n]+)\]/i) ||
                   normalized.match(/(?:Môn|Phân môn)[:\s]*([^\n]+)/i);
  if (subMatch && subMatch[1]) {
    const val = subMatch[1].toLowerCase().trim();
    if (val.includes('vat') || val.includes('vật') || val.includes('lí') || val.includes('ly') || val.includes('physics')) {
      subject = 'physics';
    } else if (val.includes('hoa') || val.includes('hóa') || val.includes('chem')) {
      subject = 'chemistry';
    } else if (val.includes('sinh') || val.includes('bio')) {
      subject = 'biology';
    }
  }

  // 2. Tách các khối câu hỏi:
  // Tìm các câu hỏi bắt đầu bằng "Câu X:", "CÂU X.", "Bài X:", "Câu X -", v.v.
  interface RawBlock {
    qNum: number;
    rawText: string;
  }

  const blocks: RawBlock[] = [];
  
  // Ưu tiên 1: Tách theo định dạng "Câu X" hoặc "Bài X" chuẩn
  const explicitQuestionRegex = /(?:^|\n)\s*(?:(?:PHẦN|Phần)\s*[1-3I|]+[^\n]*\n+)?(?:Câu|Bài|CÂU|BÀI)\s*(\d+)[\s.:-]+/gi;
  const explicitMatches = [...normalized.matchAll(explicitQuestionRegex)];

  if (explicitMatches.length >= 1) {
    for (let i = 0; i < explicitMatches.length; i++) {
      const match = explicitMatches[i];
      const qNum = parseInt(match[1], 10);
      const startIndex = match.index! + match[0].length;
      const endIndex = (i + 1 < explicitMatches.length) ? explicitMatches[i + 1].index! : normalized.length;
      const blockContent = normalized.slice(startIndex, endIndex).trim();
      blocks.push({
        qNum: isNaN(qNum) ? i + 1 : qNum,
        rawText: blockContent
      });
    }
  } else {
    // Ưu tiên 2 (dự phòng): Tách theo số đầu dòng "1.", "2."
    const numberRegex = /(?:^|\n)\s*(\d+)[\.:\)]\s+/g;
    const numMatches = [...normalized.matchAll(numberRegex)];
    if (numMatches.length >= 2) {
      for (let i = 0; i < numMatches.length; i++) {
        const match = numMatches[i];
        const qNum = parseInt(match[1], 10);
        const startIndex = match.index! + match[0].length;
        const endIndex = (i + 1 < numMatches.length) ? numMatches[i + 1].index! : normalized.length;
        blocks.push({
          qNum: isNaN(qNum) ? i + 1 : qNum,
          rawText: normalized.slice(startIndex, endIndex).trim()
        });
      }
    }
  }

  if (blocks.length === 0) {
    throw new Error('Hệ thống không nhận dạng được câu hỏi nào. Vui lòng đảm bảo các câu hỏi bắt đầu bằng "Câu 1:", "Câu 2:"... theo mẫu chuẩn của trường THCS & THPT Y Đôn.');
  }

  const questions: ExamQuestion[] = [];
  const now = Date.now();
  let mcqParsedCount = 0;
  let tfParsedCount = 0;
  let saParsedCount = 0;

  blocks.forEach((blk, idx) => {
    let cleanBlock = blk.rawText;

    // Loại bỏ phần tiêu đề "PHẦN 2:..." hoặc "PHẦN 3:..." bị dính vào cuối câu hỏi hiện tại
    const nextPartIdx = cleanBlock.search(/(?:^|\n)\s*(?:PHẦN|Phần)\s*[1-3I|]+/i);
    if (nextPartIdx > 0) {
      cleanBlock = cleanBlock.slice(0, nextPartIdx).trim();
    }

    const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Quy tắc chuẩn GDPT 2018 của trường:
    // - Đủ 16 câu trắc nghiệm nhiều lựa chọn (Câu 1 -> Câu 16) mới đến câu Đúng/Sai
    // - Chỉ có tối đa 1 câu Đúng/Sai (Câu 17) và tối đa 1 câu Điền ngắn (Câu 18)
    // - Tuyệt đối không để câu hỏi trắc nghiệm nhiều lựa chọn (1-16) bị hiểu nhầm là câu Đúng/Sai
    const isWithinFirst16 = mcqParsedCount < 16 && blk.qNum <= 16;

    // A. Nhận diện PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (2 chỗ điền số) - chỉ khi đã đủ 16 câu TN và tối đa 1 câu điền ngắn
    const rawIsShortAnswer =
      blk.qNum === 18 ||
      /(?:Chỗ điền\s*1|Chỗ điền\s*2|Điền\s*1|Điền\s*2|Chỗ trống\s*1|Chỗ trống\s*2)/i.test(cleanBlock) ||
      (/(?:Trả lời ngắn|Điền số|Điền đáp số)/i.test(cleanBlock) && !/(?:^|\n|\s)[A-D][.:\)]\s+/m.test(cleanBlock));

    const isShortAnswer = !isWithinFirst16 && saParsedCount < 1 && (blk.qNum === 18 || (mcqParsedCount >= 16 && tfParsedCount >= 1) || rawIsShortAnswer);

    // B. Nhận diện PHẦN 2: CÂU HỎI ĐÚNG/SAI (4 nhận định a, b, c, d) - chỉ khi đã đủ 16 câu TN và tối đa 1 câu Đ/S
    const hasLowercaseSubItems =
      /(?:^|\n|\s)(?:\[a\]|\(a\)|a[\)\.:-])\s+/m.test(cleanBlock) &&
      /(?:^|\n|\s)(?:\[b\]|\(b\)|b[\)\.:-])\s+/m.test(cleanBlock) &&
      /(?:^|\n|\s)(?:\[c\]|\(c\)|c[\)\.:-])\s+/m.test(cleanBlock) &&
      /(?:^|\n|\s)(?:\[d\]|\(d\)|d[\)\.:-])\s+/m.test(cleanBlock);

    const isTrueFalse = !isWithinFirst16 && !isShortAnswer && tfParsedCount < 1 && (blk.qNum === 17 || mcqParsedCount === 16 || hasLowercaseSubItems);

    if (isShortAnswer) {
      saParsedCount++;
      // -------------------------------------------------------------
      // PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM)
      // -------------------------------------------------------------
      const b1Match = cleanBlock.match(/(?:Chỗ điền\s*1|Điền\s*1|Chỗ trống\s*1|Ý\s*1)[:.\s]+([^\n;]+)/i);
      const b2Match = cleanBlock.match(/(?:Chỗ điền\s*2|Điền\s*2|Chỗ trống\s*2|Ý\s*2)[:.\s]+([^\n;]+)/i);

      let val1 = b1Match ? b1Match[1].trim() : '';
      let val2 = b2Match ? b2Match[1].trim() : '';

      // Tách giá trị số và đơn vị (Ví dụ: "40 N" -> "40", đơn vị "N")
      const extractNumAndUnit = (raw: string): { num: string; unit?: string } => {
        const m = raw.match(/([+-]?\d+(?:[.,]\d+)?)\s*([a-zA-Z°%µΩ/]+)?/);
        if (m) {
          return { num: m[1], unit: m[2] };
        }
        return { num: raw.replace(/[^\d,.-]/g, '').trim() || raw };
      };

      const p1 = extractNumAndUnit(val1);
      const p2 = extractNumAndUnit(val2);

      // Nếu không khớp theo nhãn "Chỗ điền 1/2", quét tìm theo "Đáp án:"
      if (!val1 && !val2) {
        const daMatch = cleanBlock.match(/(?:Đáp án|ĐA|Kết quả)[:.\s]+([^\n]+)/i);
        if (daMatch && daMatch[1]) {
          const numbers = daMatch[1].match(/[+-]?\d+(?:[.,]\d+)?/g);
          if (numbers && numbers.length >= 2) {
            p1.num = numbers[0];
            p2.num = numbers[1];
          } else if (numbers && numbers.length === 1) {
            p1.num = numbers[0];
            p2.num = '0';
          }
        }
      }

      const num1 = p1.num || '10';
      const num2 = p2.num || '20';

      const expMatch = cleanBlock.match(/(?:Giải thích|Lời giải|Hướng dẫn giải)[:.\s]+([\s\S]+)/i);
      const explanation = expMatch?.[1]?.trim() || 'Giải thích chi tiết cho 2 chỗ điền số.';

      // Tách nội dung câu hỏi
      let qPrompt = lines[0];
      const cutIdx = cleanBlock.search(/(?:Chỗ điền|Điền\s*1|Đáp án[:.]|Hướng dẫn)/i);
      if (cutIdx > 0) {
        qPrompt = cleanBlock.slice(0, cutIdx).trim();
      }

      const acceptable1 = Array.from(new Set([
        num1,
        num1.replace('.', ','),
        num1.replace(',', '.'),
        `${num1} ${p1.unit || ''}`.trim()
      ])).filter(Boolean);

      const acceptable2 = Array.from(new Set([
        num2,
        num2.replace('.', ','),
        num2.replace(',', '.'),
        `${num2} ${p2.unit || ''}`.trim()
      ])).filter(Boolean);

      questions.push({
        id: `up_sa_${now}_${idx + 1}`,
        type: 'short_answer',
        question: `Câu ${blk.qNum}: ${qPrompt}`,
        acceptableAnswers: [num1, num2],
        blanks: [
          {
            id: '1',
            label: 'Chỗ điền (1)',
            acceptableAnswers: acceptable1,
            unit: p1.unit,
            points: 0.5
          },
          {
            id: '2',
            label: 'Chỗ điền (2)',
            acceptableAnswers: acceptable2,
            unit: p2.unit,
            points: 0.5
          }
        ],
        explanation
      });

    } else if (isTrueFalse) {
      tfParsedCount++;
      // -------------------------------------------------------------
      // PHẦN 2: CÂU HỎI TRẮC NGHIỆM ĐÚNG/SAI (4 NHẬN ĐỊNH - 1.0 ĐIỂM)
      // -------------------------------------------------------------
      // Tìm vị trí của các nhận định a, b, c, d bằng vị trí lát cắt (positional slicing)
      const matchA = cleanBlock.match(/(?:^|\n|\s)(?:\[a\]|\(a\)|a[\s.:\)-])\s*/i);
      const matchB = cleanBlock.match(/(?:^|\n|\s)(?:\[b\]|\(b\)|b[\s.:\)-])\s*/i);
      const matchC = cleanBlock.match(/(?:^|\n|\s)(?:\[c\]|\(c\)|c[\s.:\)-])\s*/i);
      const matchD = cleanBlock.match(/(?:^|\n|\s)(?:\[d\]|\(d\)|d[\s.:\)-])\s*/i);

      let textA = '';
      let textB = '';
      let textC = '';
      let textD = '';

      if (matchA && matchB && matchC && matchD &&
          matchA.index! < matchB.index! &&
          matchB.index! < matchC.index! &&
          matchC.index! < matchD.index!) {
        textA = cleanBlock.slice(matchA.index! + matchA[0].length, matchB.index!).trim();
        textB = cleanBlock.slice(matchB.index! + matchB[0].length, matchC.index!).trim();
        textC = cleanBlock.slice(matchC.index! + matchC[0].length, matchD.index!).trim();
        
        const restD = cleanBlock.slice(matchD.index! + matchD[0].length);
        const expStart = restD.match(/(?:^|\n|\s)(?:(?:Giải thích|Lời giải|Hướng dẫn)[:.\s])/i);
        textD = expStart ? restD.slice(0, expStart.index).trim() : restD.trim();
      } else {
        // Fallback tách theo dòng có chữ cái a, b, c, d
        lines.forEach(l => {
          if (/^a[\)\.:-]/i.test(l)) textA = l.replace(/^a[\)\.:-]\s*/i, '');
          if (/^b[\)\.:-]/i.test(l)) textB = l.replace(/^b[\)\.:-]\s*/i, '');
          if (/^c[\)\.:-]/i.test(l)) textC = l.replace(/^c[\)\.:-]\s*/i, '');
          if (/^d[\)\.:-]/i.test(l)) textD = l.replace(/^d[\)\.:-]\s*/i, '');
        });
      }

      // Hàm bóc tách đáp án Đúng / Sai chuẩn xác không bị nhiễu bởi các từ có chữ 's' như Archimedes, Pascal
      const evaluateStatement = (rawText: string, defaultChar: string) => {
        if (!rawText) return { text: `Nhận định ${defaultChar}`, isCorrect: true };

        let isCorrect = true;
        let clean = rawText;

        // Tìm từ khóa chỉ đáp án ở cuối nhận định hoặc sau dấu "-" / ":"
        const explicitAns = rawText.match(/(?:[-–—:\(\[]\s*(?:Đáp án[:.\s]*)?|\s+)(Đúng|Sai|True|False)[\)\]\.]?\s*$/i) ||
                            rawText.match(/\[(Đúng|Sai|True|False)\]/i) ||
                            rawText.match(/\((Đúng|Sai|True|False)\)/i);

        if (explicitAns) {
          const val = explicitAns[1].toLowerCase();
          isCorrect = (val === 'đúng' || val === 'true');
          clean = rawText
            .replace(explicitAns[0], '')
            .replace(/[-–—:]\s*$/g, '')
            .trim();
        } else {
          // Kiểm tra nếu có từ Đúng hoặc Sai
          if (/(?:^|\s+)Sai\b/i.test(rawText) || /\bSai$/i.test(rawText)) {
            isCorrect = false;
          }
        }

        return {
          text: clean || `Nhận định ${defaultChar}`,
          isCorrect
        };
      };

      const stA = evaluateStatement(textA, 'a');
      const stB = evaluateStatement(textB, 'b');
      const stC = evaluateStatement(textC, 'c');
      const stD = evaluateStatement(textD, 'd');

      const expMatch = cleanBlock.match(/(?:Giải thích|Lời giải)[:.\s]+([\s\S]+)/i);
      const explanation = expMatch?.[1]?.trim() || 'Giải thích chi tiết 4 nhận định a, b, c, d.';

      let qPrompt = lines[0];
      if (matchA && matchA.index! > 0) {
        qPrompt = cleanBlock.slice(0, matchA.index!).trim();
      }

      questions.push({
        id: `up_tf_${now}_${idx + 1}`,
        type: 'true_false',
        question: `Câu ${blk.qNum}: ${qPrompt}`,
        statements: [
          { subId: 'a', text: stA.text, isCorrect: stA.isCorrect },
          { subId: 'b', text: stB.text, isCorrect: stB.isCorrect },
          { subId: 'c', text: stC.text, isCorrect: stC.isCorrect },
          { subId: 'd', text: stD.text, isCorrect: stD.isCorrect }
        ],
        explanation
      });

    } else {
      mcqParsedCount++;
      // -------------------------------------------------------------
      // PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (A, B, C, D)
      // -------------------------------------------------------------
      // Thuật toán định vị theo lát cắt (Positional Slicing):
      // Tuyệt đối không dùng character class phủ định [^\nBCD] vì sẽ bị cắt đứt
      // khi gặp từ ngữ tiếng Việt có chữ b, c, d (chất, biến, độ lớn, Archimedes...)
      const matchA = cleanBlock.match(/(?:^|\n|\s)(?:\[A\]|\(A\)|A[\s.:\)-])\s*/i);
      const matchB = cleanBlock.match(/(?:^|\n|\s)(?:\[B\]|\(B\)|B[\s.:\)-])\s*/i);
      const matchC = cleanBlock.match(/(?:^|\n|\s)(?:\[C\]|\(C\)|C[\s.:\)-])\s*/i);
      const matchD = cleanBlock.match(/(?:^|\n|\s)(?:\[D\]|\(D\)|D[\s.:\)-])\s*/i);

      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let qPrompt = lines[0];

      if (matchA && matchB && matchC && matchD &&
          matchA.index! < matchB.index! &&
          matchB.index! < matchC.index! &&
          matchC.index! < matchD.index!) {
        
        qPrompt = cleanBlock.slice(0, matchA.index!).trim();
        optA = cleanBlock.slice(matchA.index! + matchA[0].length, matchB.index!).trim();
        optB = cleanBlock.slice(matchB.index! + matchB[0].length, matchC.index!).trim();
        optC = cleanBlock.slice(matchC.index! + matchC[0].length, matchD.index!).trim();

        const restD = cleanBlock.slice(matchD.index! + matchD[0].length);
        const endOfD = restD.match(/(?:^|\n|\s)(?:(?:Đáp án|ĐA|Key|Answer|Giải thích|Lời giải)[:.\s])/i);
        optD = endOfD ? restD.slice(0, endOfD.index).trim() : restD.trim();
      } else {
        // Fallback theo dòng bắt đầu bằng A., B., C., D.
        lines.forEach(l => {
          if (/^A[\.:\)]\s*/i.test(l)) optA = l.replace(/^A[\.:\)]\s*/i, '').trim();
          if (/^B[\.:\)]\s*/i.test(l)) optB = l.replace(/^B[\.:\)]\s*/i, '').trim();
          if (/^C[\.:\)]\s*/i.test(l)) optC = l.replace(/^C[\.:\)]\s*/i, '').trim();
          if (/^D[\.:\)]\s*/i.test(l)) optD = l.replace(/^D[\.:\)]\s*/i, '').trim();
        });
      }

      // Trích xuất đáp án đúng: A, B, C, D
      const ansMatch = cleanBlock.match(/(?:Đáp án|ĐA|Answer|Key)[:.\s]*([A-D])/i);
      let correctIdx = 0;
      if (ansMatch && ansMatch[1]) {
        const letter = ansMatch[1].toUpperCase();
        if (letter === 'A') correctIdx = 0;
        else if (letter === 'B') correctIdx = 1;
        else if (letter === 'C') correctIdx = 2;
        else if (letter === 'D') correctIdx = 3;
      }

      // Trích xuất lời giải thích
      const expMatch = cleanBlock.match(/(?:Giải thích|Lời giải|Hướng dẫn)[:.\s]+([^\n]+)/i);
      const explanation = expMatch?.[1]?.trim() || 'Đáp án chính xác theo chương trình môn KHTN.';

      // Dọn dẹp nội dung câu hỏi
      qPrompt = qPrompt.replace(/(?:^|\n)\s*Câu\s*\d+[\s.:-]+/gi, '').trim();
      if (!qPrompt && lines.length > 0) {
        qPrompt = lines[0].replace(/(?:^|\n)\s*Câu\s*\d+[\s.:-]+/gi, '').trim();
      }

      questions.push({
        id: `up_mcq_${now}_${idx + 1}`,
        type: 'multiple_choice',
        question: `Câu ${blk.qNum}: ${qPrompt}`,
        options: [
          optA || 'Phương án A',
          optB || 'Phương án B',
          optC || 'Phương án C',
          optD || 'Phương án D'
        ],
        correctAnswer: correctIdx,
        explanation
      });
    }
  });

  const mcqCount = questions.filter(q => q.type === 'multiple_choice').length;
  const tfCount = questions.filter(q => q.type === 'true_false').length;
  const saCount = questions.filter(q => q.type === 'short_answer').length;

  return {
    title,
    grade,
    subject,
    durationMinutes,
    questions,
    rawText: normalized,
    summary: {
      total: questions.length,
      mcqCount,
      tfCount,
      saCount,
      isStandardGDPT2018: mcqCount === 16 && tfCount === 1 && saCount === 1
    }
  };
}
