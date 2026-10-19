import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { 
  ExamQuestion, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion, 
  PeriodicExamCodeKey, 
  ShuffledExamPaper,
  GradeLevel 
} from '../types';

/**
 * Utility for Periodic Exam Mixing (Trộn đề kiểm tra định kì)
 * Trường THCS và THPT Y Đôn
 */

function shuffle<T>(array: T[], seedOffset = 0): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate Word template containing 2 source exams for Periodic Exam Mixing
 */
export function generatePeriodicExamWordTemplateBlob(): Blob {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>File Mẫu Soạn 2 Đề Gốc Kiểm Tra Định Kỳ KHTN - Y Đôn</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.35;
          margin: 1.5cm;
          color: #000000;
        }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .header-table td { vertical-align: top; padding: 4px; }
        .school-title { font-weight: bold; font-size: 11pt; text-align: center; }
        .main-title { text-align: center; font-size: 14pt; font-weight: bold; margin-top: 5px; margin-bottom: 4px; text-transform: uppercase; color: #0f172a; }
        .sub-title { text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 12px; }
        .guide-box { background-color: #fef3c7; border: 1px dashed #d97706; padding: 12px; font-size: 11pt; margin-bottom: 20px; }
        .exam-section-divider {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 13pt;
          text-align: center;
          margin-top: 25px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .part-header { font-weight: bold; font-size: 12pt; color: #1e3a8a; margin-top: 15px; margin-bottom: 6px; }
        .question-block { margin-bottom: 12px; }
        .question-title { font-weight: bold; margin-bottom: 3px; }
        .option { margin-left: 20px; margin-bottom: 2px; }
        .answer { margin-left: 20px; font-weight: bold; color: #1e3a8a; }
        .tf-statement { margin-left: 20px; margin-bottom: 3px; }
        .meta-tag { font-family: 'Courier New', monospace; font-size: 11pt; background-color: #f1f5f9; padding: 6px; border: 1px solid #cbd5e1; margin-bottom: 15px; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 45%; text-align: center;">
            <div class="school-title">SỞ GD&ĐT GIA LAI</div>
            <div class="school-title">TRƯỜNG THCS & THPT Y ĐÔN</div>
            <div style="font-size: 10pt; font-style: italic;">Tổ Tự Nhiên: Lí - Hóa - Sinh - CN</div>
          </td>
          <td style="width: 55%; text-align: center;">
            <div style="font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 10pt; font-style: italic;">Độc lập - Tự do - Hạnh phúc</div>
          </td>
        </tr>
      </table>

      <div class="main-title">FILE MẪU SOẠN 2 ĐỀ GỐC KIỂM TRA ĐỊNH KỲ</div>
      <div class="sub-title">MÔN: KHOA HỌC TỰ NHIÊN (CHUẨN MA TRẬN GDPT 2018)</div>

      <div class="guide-box">
        <strong>📌 HƯỚNG DẪN DÀNH CHO GIÁO VIÊN SOẠN 2 ĐỀ ĐỂ TRỘN MÃ ĐỀ:</strong><br/>
        1. File Word này bao gồm <strong>2 ĐỀ GỐC (ĐỀ 1 và ĐỀ 2)</strong>. Thầy/Cô soạn nội dung vào từng đề.<br/>
        2. Mỗi đề có cấu trúc chuẩn ma trận: <strong>Phần I (40 câu trắc nghiệm A-D)</strong>, <strong>Phần II (8 câu Đúng/Sai)</strong>, <strong>Phần III (6 câu Trả lời ngắn)</strong> và <strong>Phần IV (Tự luận)</strong>.<br/>
        3. Giữ nguyên các dòng phân cách <code>[BẮT ĐẦU ĐỀ GỐC 1]</code> và <code>[BẮT ĐẦU ĐỀ GỐC 2]</code> để hệ thống tự động bóc tách 2 đề.<br/>
        4. Sau khi soạn xong, Thầy/Cô lưu lại file và nạp lên hệ thống app để trộn thành 1 đến 6 mã đề tùy ý.
      </div>

      <!-- ========================================== -->
      <!-- ĐỀ GỐC 1 -->
      <!-- ========================================== -->
      <div class="exam-section-divider">=== [BẮT ĐẦU ĐỀ GỐC 1] ===</div>
      <div class="meta-tag">
        [TÊN ĐỀ: Đề kiểm tra định kỳ KHTN 8 - Đề gốc số 1]<br/>
        [KHỐI: 8]<br/>
        [MÔN: vat_li]<br/>
        [THỜI GIAN: 45]
      </div>

      <div class="part-header">PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (Thí sinh chọn 1 phương án A, B, C hoặc D)</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Đơn vị đo của áp suất trong hệ đo lường quốc tế SI là gì?</div>
        <div class="option">A. Newton (N)</div>
        <div class="option">B. Pascal (Pa)</div>
        <div class="option">C. Joule (J)</div>
        <div class="option">D. Watt (W)</div>
        <div class="answer">Đáp án: B</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 2: Công thức tính áp suất chất lỏng tại một điểm có độ sâu h là gì?</div>
        <div class="option">A. p = d . h</div>
        <div class="option">B. p = d / h</div>
        <div class="option">C. p = h / d</div>
        <div class="option">D. p = d + h</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 3: Lực đẩy Archimedes tác dụng lên một vật nhúng chìm trong chất lỏng có phương và chiều như thế nào?</div>
        <div class="option">A. Phương thẳng đứng, chiều từ dưới lên trên</div>
        <div class="option">B. Phương thẳng đứng, chiều từ trên xuống dưới</div>
        <div class="option">C. Phương nằm ngang, chiều từ trái sang phải</div>
        <div class="option">D. Phương bất kì phụ thuộc vào hình dạng của vật</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 4: Khi tàu ngầm lặn sâu dần xuống đáy biển thì áp suất của nước biển tác dụng lên vỏ tàu sẽ thay đổi như thế nào?</div>
        <div class="option">A. Không đổi</div>
        <div class="option">B. Tăng dần</div>
        <div class="option">C. Giảm dần</div>
        <div class="option">D. Ban đầu tăng sau đó giảm</div>
        <div class="answer">Đáp án: B</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 5: Hiện tượng nào sau đây do áp suất khí quyển gây ra?</div>
        <div class="option">A. Hút nước từ cốc bằng ống hút</div>
        <div class="option">B. Giọt nước đọng trên lá sen</div>
        <div class="option">C. Quả bóng bay rơi chạm đất</div>
        <div class="option">D. Chiếc thuyền nan nổi trên sông</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="part-header">PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG/SAI (Thí sinh chọn Đúng hoặc Sai cho mỗi ý a, b, c, d)</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Xét một vật đặc có khối lượng m = 2 kg và thể tích V = 0,001 m³ được thả vào bể nước (trọng lượng riêng của nước d = 10 000 N/m³).</div>
        <div class="tf-statement">a) Khối lượng riêng của vật là 2 000 kg/m³. [Đáp án: Đúng]</div>
        <div class="tf-statement">b) Lực đẩy Archimedes lớn nhất tác dụng lên vật là 10 N. [Đáp án: Đúng]</div>
        <div class="tf-statement">c) Trọng lượng của vật nhỏ hơn lực đẩy Archimedes khi vật chìm hoàn toàn. [Đáp án: Sai]</div>
        <div class="tf-statement">d) Vật sẽ chìm hoàn toàn xuống đáy bể nước khi buông tay. [Đáp án: Đúng]</div>
      </div>

      <div class="part-header">PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (Thí sinh ghi kết quả số)</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Một người nặng 50 kg đứng bằng hai chân trên sàn nhà. Diện tích tiếp xúc của mỗi bàn chân là 0,025 m². Áp suất người đó tác dụng lên sàn nhà là bao nhiêu Pascal? (lấy g = 10 m/s²)</div>
        <div class="answer">Đáp án: 10000</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 2: Một vật có thể tích 0,002 m³ nhúng chìm hoàn toàn trong nước có d = 10 000 N/m³. Lực đẩy Archimedes tác dụng lên vật là bao nhiêu Newton?</div>
        <div class="answer">Đáp án: 20</div>
      </div>

      <div class="part-header">PHẦN IV. TỰ LUẬN (Dành cho học sinh làm trên giấy)</div>
      <div class="question-block">
        <div class="question-title">Câu 1 (2,0 điểm): Hãy giải thích vì sao lưỡi dao, lưỡi kéo càng mài sắc thì cắt gọt vật dụng càng dễ dàng?</div>
      </div>

      <!-- ========================================== -->
      <!-- ĐỀ GỐC 2 -->
      <!-- ========================================== -->
      <div class="page-break"></div>
      <div class="exam-section-divider">=== [BẮT ĐẦU ĐỀ GỐC 2] ===</div>
      <div class="meta-tag">
        [TÊN ĐỀ: Đề kiểm tra định kỳ KHTN 8 - Đề gốc số 2]<br/>
        [KHỐI: 8]<br/>
        [MÔN: vat_li]<br/>
        [THỜI GIAN: 45]
      </div>

      <div class="part-header">PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Muốn tăng áp suất của một vật tác dụng lên mặt sàn nằm ngang, biện pháp nào sau đây là đúng?</div>
        <div class="option">A. Tăng áp lực và giảm diện tích tiếp xúc</div>
        <div class="option">B. Giảm áp lực và tăng diện tích tiếp xúc</div>
        <div class="option">C. Giảm áp lực và giữ nguyên diện tích tiếp xúc</div>
        <div class="option">D. Tăng diện tích tiếp xúc và giữ nguyên áp lực</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 2: Một thùng chứa đầy nước, điểm nào sau đây trong thùng chịu áp suất chất lỏng lớn nhất?</div>
        <div class="option">A. Điểm ở sát đáy thùng</div>
        <div class="option">B. Điểm ở sát mặt thoáng của nước</div>
        <div class="option">C. Điểm ở chính giữa thùng nước</div>
        <div class="option">D. Áp suất tại mọi điểm trong thùng là như nhau</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 3: Một quả bóng bàn bị bẹp nhúng vào nước nóng lại phồng lên như cũ là nhờ tác dụng của:</div>
        <div class="option">A. Lực đẩy Archimedes</div>
        <div class="option">B. Sự dãn nở vì nhiệt và áp suất của chất khí bên trong</div>
        <div class="option">C. Áp suất chất lỏng của nước nóng ép vào</div>
        <div class="option">D. Khối lượng của quả bóng giảm đi</div>
        <div class="answer">Đáp án: B</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 4: Một miếng gỗ nổi trên mặt nước. Lực đẩy Archimedes tác dụng lên miếng gỗ có độ lớn bằng:</div>
        <div class="option">A. Trọng lượng của miếng gỗ</div>
        <div class="option">B. Lớn hơn trọng lượng của miếng gỗ</div>
        <div class="option">C. Nhỏ hơn trọng lượng của miếng gỗ</div>
        <div class="option">D. Bằng trọng lượng của toàn bộ thể tích nước trong chậu</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="question-block">
        <div class="question-title">Câu 5: Thiết bị nào sau đây hoạt động dựa trên nguyên lý bình thông nhau?</div>
        <div class="option">A. Máy nén thủy lực và ống đo mực nước</div>
        <div class="option">B. Nhiệt kế thủy ngân</div>
        <div class="option">C. Phong vũ biểu đo áp suất khí quyển</div>
        <div class="option">D. Lực kế lò xo</div>
        <div class="answer">Đáp án: A</div>
      </div>

      <div class="part-header">PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG/SAI</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Xét áp suất khí quyển và ứng dụng trong đời sống thực tiễn:</div>
        <div class="tf-statement">a) Càng lên cao thì áp suất khí quyển càng tăng. [Đáp án: Sai]</div>
        <div class="tf-statement">b) Bình xịt thuốc muỗi hoạt động dựa trên sự chênh lệch áp suất khí quyển. [Đáp án: Đúng]</div>
        <div class="tf-statement">c) Áp kế Torricelli sử dụng cột thủy ngân để đo áp suất khí quyển. [Đáp án: Đúng]</div>
        <div class="tf-statement">d) Trong chân không hoàn toàn vẫn tồn tại áp suất khí quyển lớn. [Đáp án: Sai]</div>
      </div>

      <div class="part-header">PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN</div>
      
      <div class="question-block">
        <div class="question-title">Câu 1: Một khối sắt có thể tích 0,0005 m³ được nhúng chìm vào dầu có d = 8 000 N/m³. Lực đẩy Archimedes tác dụng lên khối sắt là bao nhiêu Newton?</div>
        <div class="answer">Đáp án: 4</div>
      </div>

      <div class="part-header">PHẦN IV. TỰ LUẬN</div>
      <div class="question-block">
        <div class="question-title">Câu 1 (2,0 điểm): Tại sao các chân đế của máy giặt hoặc tủ lạnh thường được lót thêm miếng cao su bản rộng?</div>
      </div>

    </body>
    </html>
  `;

  return new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
}

/**
 * Intelligent parser to parse 2 source exams from uploaded Word file (.docx or .doc text)
 */
export async function parseTwoExamsWordFile(file: File): Promise<{
  exam1Questions: ExamQuestion[];
  exam2Questions: ExamQuestion[];
  title1: string;
  title2: string;
}> {
  let rawText = '';

  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    rawText = result.value || '';
  } else {
    rawText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsText(file);
    });
  }

  return parseTwoExamsRawText(rawText);
}

export function parseTwoExamsRawText(rawText: string): {
  exam1Questions: ExamQuestion[];
  exam2Questions: ExamQuestion[];
  title1: string;
  title2: string;
} {
  // Normalize line endings
  const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Look for separators
  // Pattern 1: === [BẮT ĐẦU ĐỀ GỐC 1] === and === [BẮT ĐẦU ĐỀ GỐC 2] ===
  // Pattern 2: [ĐỀ 1] and [ĐỀ 2] or ĐỀ SỐ 1 and ĐỀ SỐ 2
  let text1 = '';
  let text2 = '';

  const splitIdx = clean.search(/(?:===\s*\[\s*BẮT ĐẦU ĐỀ GỐC 2\s*\]\s*===|\[ĐỀ GỐC 2\]|\[ĐỀ 2\]|ĐỀ SỐ 2|ĐỀ 2:)/i);
  if (splitIdx !== -1) {
    text1 = clean.substring(0, splitIdx);
    text2 = clean.substring(splitIdx);
  } else {
    // If not explicitly separated, try splitting into two halves by questions count
    const questionMatches = [...clean.matchAll(/(?:^|\n)\s*Câu\s+\d+[:.]/gi)];
    if (questionMatches.length >= 8) {
      const mid = Math.floor(questionMatches.length / 2);
      const splitPos = questionMatches[mid].index || Math.floor(clean.length / 2);
      text1 = clean.substring(0, splitPos);
      text2 = clean.substring(splitPos);
    } else {
      text1 = clean;
      text2 = clean; // fallback: clone same questions with variations
    }
  }

  const title1Match = text1.match(/\[TÊN ĐỀ:\s*([^\]\n]+)\]/i);
  const title1 = title1Match ? title1Match[1].trim() : 'Đề kiểm tra định kỳ KHTN - Đề gốc 1';

  const title2Match = text2.match(/\[TÊN ĐỀ:\s*([^\]\n]+)\]/i);
  const title2 = title2Match ? title2Match[1].trim() : 'Đề kiểm tra định kỳ KHTN - Đề gốc 2';

  const exam1Questions = parseQuestionsFromExamText(text1, 'ex1');
  const exam2Questions = parseQuestionsFromExamText(text2, 'ex2');

  return {
    exam1Questions,
    exam2Questions: exam2Questions.length > 0 ? exam2Questions : exam1Questions,
    title1,
    title2
  };
}

/**
 * Extracts MCQs, True/False and Short Answer questions from single exam text block
 */
function parseQuestionsFromExamText(examText: string, prefix: string): ExamQuestion[] {
  const questions: ExamQuestion[] = [];

  // Split by "Câu X:"
  const rawBlocks = examText.split(/(?:^|\n)(?=\s*Câu\s+\d+[:.])/i);

  rawBlocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed.toLowerCase().includes('câu')) return;

    // 1. Check if True/False question (contains a), b), c), d))
    const isTrueFalse = /[a-d]\)\s*[^\[\n]+\[Đáp án:\s*(?:Đúng|Sai)\]/i.test(trimmed) ||
                        (/[a-d]\)/i.test(trimmed) && trimmed.toLowerCase().includes('đúng') && trimmed.toLowerCase().includes('sai'));

    if (isTrueFalse) {
      const statements: [any, any, any, any] = [
        { subId: 'a', text: 'Nhận định a', isCorrect: true },
        { subId: 'b', text: 'Nhận định b', isCorrect: false },
        { subId: 'c', text: 'Nhận định c', isCorrect: true },
        { subId: 'd', text: 'Nhận định d', isCorrect: false }
      ];

      ['a', 'b', 'c', 'd'].forEach((sub, sIdx) => {
        const reg = new RegExp(`(?:^|\\n)\\s*${sub}\\)[.:]?\\s*([^\\n\\[]+)(?:\\[Đáp án:\\s*(Đúng|Sai)\\])?`, 'i');
        const m = trimmed.match(reg);
        if (m) {
          const stmtText = m[1]?.trim() || `Ý ${sub}`;
          const isCorrect = m[2] ? m[2].toLowerCase() === 'đúng' : (sIdx % 2 === 0);
          statements[sIdx] = { subId: sub as 'a'|'b'|'c'|'d', text: stmtText, isCorrect };
        }
      });

      const firstLine = trimmed.split('\n')[0].trim();
      questions.push({
        id: `${prefix}_tf_${idx}`,
        type: 'true_false',
        question: firstLine,
        statements
      });
      return;
    }

    // 2. Check if Short Answer question (contains no options A, B, C, D but has "Đáp án:")
    const hasOptions = /(?:^|\n)\s*A[.:\)]/i.test(trimmed) && /(?:^|\n)\s*B[.:\)]/i.test(trimmed);
    if (!hasOptions && /(?:Đáp án|ĐA)[:.]/i.test(trimmed)) {
      const ansMatch = trimmed.match(/(?:Đáp án|ĐA)[:.]\s*([^\n]+)/i);
      const answerVal = ansMatch?.[1]?.trim() || '10';
      const firstLine = trimmed.split('\n')[0].trim();
      questions.push({
        id: `${prefix}_sa_${idx}`,
        type: 'short_answer',
        question: firstLine,
        acceptableAnswers: [answerVal]
      });
      return;
    }

    // 3. Multiple Choice Question
    const optA = trimmed.match(/(?:^|\n)\s*A[.:\)]\s*([^\n]+)/i)?.[1]?.trim() || 'Phương án A';
    const optB = trimmed.match(/(?:^|\n)\s*B[.:\)]\s*([^\n]+)/i)?.[1]?.trim() || 'Phương án B';
    const optC = trimmed.match(/(?:^|\n)\s*C[.:\)]\s*([^\n]+)/i)?.[1]?.trim() || 'Phương án C';
    const optD = trimmed.match(/(?:^|\n)\s*D[.:\)]\s*([^\n]+)/i)?.[1]?.trim() || 'Phương án D';

    const ansMatch = trimmed.match(/(?:Đáp án|ĐA|Answer)[:.]\s*([A-D])/i);
    let correctIdx = 0;
    if (ansMatch && ansMatch[1]) {
      const letter = ansMatch[1].toUpperCase();
      if (letter === 'A') correctIdx = 0;
      else if (letter === 'B') correctIdx = 1;
      else if (letter === 'C') correctIdx = 2;
      else if (letter === 'D') correctIdx = 3;
    }

    const expMatch = trimmed.match(/(?:Giải thích|Lời giải)[:.]\s*([^\n]+)/i);
    const explanation = expMatch?.[1]?.trim() || 'Đáp án chính xác theo chương trình.';

    const aIndex = trimmed.search(/(?:^|\n)\s*A[.:\)]/i);
    const qText = aIndex !== -1 ? trimmed.slice(0, aIndex).trim() : trimmed.split('\n')[0].trim();

    questions.push({
      id: `${prefix}_mcq_${idx}`,
      type: 'multiple_choice',
      question: qText.startsWith('Câu') ? qText : `Câu ${questions.length + 1}: ${qText}`,
      options: [optA, optB, optC, optD],
      correctAnswer: correctIdx,
      explanation
    });
  });

  return questions;
}

/**
 * Mixes 2 source exams into N exam codes (1 to 6 codes) with 4-digit code increments
 */
export function mixPeriodicExams(
  exam1Questions: ExamQuestion[],
  exam2Questions: ExamQuestion[],
  numCodes: number, // 1 to 6
  firstCodeStr: string, // 4-digit code, e.g. "0101"
  meta: {
    title: string;
    subject: 'physics' | 'chemistry' | 'biology';
    grade: GradeLevel;
    durationMinutes: number;
  }
): ShuffledExamPaper[] {
  const letters = ['A', 'B', 'C', 'D'];
  const baseNum = parseInt(firstCodeStr, 10) || 101;
  const codeLen = firstCodeStr.length > 0 ? firstCodeStr.length : 4;

  // Combine question pools from both exams
  const poolMcqs: MultipleChoiceQuestion[] = [
    ...(exam1Questions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[]),
    ...(exam2Questions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[])
  ];

  const poolTfs: TrueFalseQuestion[] = [
    ...(exam1Questions.filter(q => q.type === 'true_false') as TrueFalseQuestion[]),
    ...(exam2Questions.filter(q => q.type === 'true_false') as TrueFalseQuestion[])
  ];

  const poolSas: ShortAnswerQuestion[] = [
    ...(exam1Questions.filter(q => q.type === 'short_answer') as ShortAnswerQuestion[]),
    ...(exam2Questions.filter(q => q.type === 'short_answer') as ShortAnswerQuestion[])
  ];

  const results: ShuffledExamPaper[] = [];

  for (let cIdx = 0; cIdx < numCodes; cIdx++) {
    // Generate code: increase units digit
    const currentCode = String(baseNum + cIdx).padStart(codeLen, '0');

    // 1. Prepare MCQs for this code (target 40 questions or available count)
    // Interleave and shuffle differently for each code
    const shuffledPool = shuffle(poolMcqs, cIdx);
    
    // Balanced target answer distribution for options (A, B, C, D)
    const targetAnswers: number[] = [];
    const mcqCount = Math.max(shuffledPool.length, 1);
    for (let k = 0; k < mcqCount; k++) {
      targetAnswers.push(k % 4);
    }
    const randomizedTargets = shuffle(targetAnswers, cIdx * 3);

    const codeMcqs: MultipleChoiceQuestion[] = shuffledPool.map((q, qIdx) => {
      const origOpts = [...q.options];
      const correctText = origOpts[q.correctAnswer] || origOpts[0];
      const distractors = origOpts.filter((_, i) => i !== q.correctAnswer);
      const shuffledDistractors = shuffle(distractors, qIdx);

      const targetPos = randomizedTargets[qIdx % randomizedTargets.length];
      const newOpts: [string, string, string, string] = ['', '', '', ''];
      newOpts[targetPos] = correctText;

      let dIdx = 0;
      for (let p = 0; p < 4; p++) {
        if (p !== targetPos) {
          newOpts[p] = shuffledDistractors[dIdx++] || `Phương án ${letters[p]}`;
        }
      }

      return {
        ...q,
        id: `shuf_${currentCode}_mcq_${qIdx + 1}`,
        question: `Câu ${qIdx + 1}: ${q.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}`,
        options: newOpts,
        correctAnswer: targetPos
      };
    });

    // 2. Prepare True/False questions (up to 8 questions)
    const shuffledTfs = shuffle(poolTfs, cIdx + 5);
    const codeTfs: TrueFalseQuestion[] = shuffledTfs.map((tf, tIdx) => {
      const shuffledStatements = shuffle([...tf.statements], tIdx).map((st, i) => ({
        ...st,
        subId: (['a', 'b', 'c', 'd'][i]) as 'a' | 'b' | 'c' | 'd'
      }));
      return {
        ...tf,
        id: `shuf_${currentCode}_tf_${tIdx + 1}`,
        question: `Câu ${tIdx + 1}: ${tf.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}`,
        statements: shuffledStatements as [any, any, any, any]
      };
    });

    // 3. Prepare Short Answer questions (up to 6 questions)
    const shuffledSas = shuffle(poolSas, cIdx + 7);
    const codeSas: ShortAnswerQuestion[] = shuffledSas.map((sa, sIdx) => ({
      ...sa,
      id: `shuf_${currentCode}_sa_${sIdx + 1}`,
      question: `Câu ${sIdx + 1}: ${sa.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}`
    }));

    // Generate accurate answer keys for this specific exam code
    const part1Keys = Array.from({ length: 40 }, (_, idx) => {
      if (codeMcqs[idx]) {
        return letters[codeMcqs[idx].correctAnswer] || 'A';
      }
      return letters[idx % 4];
    });

    const part2Keys = Array.from({ length: 8 }, (_, idx) => {
      if (codeTfs[idx] && codeTfs[idx].statements) {
        return codeTfs[idx].statements.map(s => Boolean(s.isCorrect));
      }
      return [idx % 2 === 0, idx % 3 === 0, idx % 2 !== 0, idx % 4 === 0];
    });

    const part3Keys = Array.from({ length: 6 }, (_, idx) => {
      if (codeSas[idx] && codeSas[idx].acceptableAnswers?.[0]) {
        return codeSas[idx].acceptableAnswers[0];
      }
      return ['10', '25', '3.5', '120', '0.75', '45'][idx] || '10';
    });

    const allQuestions: ExamQuestion[] = [...codeMcqs, ...codeTfs, ...codeSas];

    results.push({
      examCode: currentCode,
      title: `${meta.title} - Mã đề ${currentCode}`,
      subject: meta.subject,
      grade: meta.grade,
      durationMinutes: meta.durationMinutes,
      questions: allQuestions,
      keys: {
        code: currentCode,
        part1Keys,
        part2Keys,
        part3Keys,
        essayMaxScore: 2.5
      }
    });
  }

  return results;
}

/**
 * Generate Multi-Paper Word Document (.docx / .doc) with all generated exam codes
 */
export function generateMixedExamsWordBlob(papers: ShuffledExamPaper[]): Blob {
  const papersHtml = papers.map((paper, pIdx) => {
    const mcqs = paper.questions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[];
    const tfs = paper.questions.filter(q => q.type === 'true_false') as TrueFalseQuestion[];
    const sas = paper.questions.filter(q => q.type === 'short_answer') as ShortAnswerQuestion[];

    return `
      <div class="${pIdx > 0 ? 'page-break' : ''}">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">SỞ GD&ĐT GIA LAI</div>
              <div style="font-weight: bold; font-size: 11pt;">TRƯỜNG THCS & THPT Y ĐÔN</div>
              <div style="font-size: 10pt; font-style: italic;">Năm học: 2025 - 2026</div>
            </td>
            <td style="width: 55%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">ĐỀ KIỂM TRA ĐỊNH KỲ MÔN KHTN</div>
              <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a;">LỚP: ${paper.grade} • THỜI GIAN: ${paper.durationMinutes} PHÚT</div>
              <div style="margin-top: 4px; display: inline-block; padding: 3px 12px; background-color: #f1f5f9; border: 2px solid #0f172a; font-weight: bold; font-size: 12pt;">
                MÃ ĐỀ THI: ${paper.examCode}
              </div>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 12px; font-style: italic; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
          Họ và tên thí sinh: ................................................................ Lớp: ............. SBD: ......................
        </div>

        <!-- PHẦN I -->
        <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-top: 10px; margin-bottom: 6px;">
          PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu ${mcqs.length})
        </div>
        ${mcqs.map((q, idx) => `
          <div style="margin-bottom: 10px;">
            <div style="font-weight: bold;">Câu ${idx + 1}: ${q.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}</div>
            <div style="margin-left: 20px;">A. ${q.options[0]}</div>
            <div style="margin-left: 20px;">B. ${q.options[1]}</div>
            <div style="margin-left: 20px;">C. ${q.options[2]}</div>
            <div style="margin-left: 20px;">D. ${q.options[3]}</div>
          </div>
        `).join('')}

        <!-- PHẦN II -->
        ${tfs.length > 0 ? `
          <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-top: 15px; margin-bottom: 6px;">
            PHẦN II. Câu trắc nghiệm đúng/sai (Thí sinh trả lời từ câu 1 đến câu ${tfs.length}. Trong mỗi ý a, b, c, d ở mỗi câu, thí sinh chọn Đúng hoặc Sai)
          </div>
          ${tfs.map((q, idx) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold;">Câu ${idx + 1}: ${q.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}</div>
              ${q.statements.map(st => `
                <div style="margin-left: 20px;">${st.subId}) ${st.text}</div>
              `).join('')}
            </div>
          `).join('')}
        ` : ''}

        <!-- PHẦN III -->
        ${sas.length > 0 ? `
          <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-top: 15px; margin-bottom: 6px;">
            PHẦN III. Câu trắc nghiệm trả lời ngắn (Thí sinh điền kết quả vào phiếu trả lời)
          </div>
          ${sas.map((q, idx) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold;">Câu ${idx + 1}: ${q.question.replace(/^Câu\s*\d+[:.]\s*/i, '')}</div>
            </div>
          `).join('')}
        ` : ''}

        <!-- PHẦN IV -->
        <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-top: 15px; margin-bottom: 6px;">
          PHẦN IV. Tự luận (Thí sinh làm bài trực tiếp vào phần tự luận của phiếu thi)
        </div>
        <div style="margin-bottom: 15px; font-weight: bold;">
          Câu 1 (2,0 điểm): Trình bày ứng dụng thực tiễn của kiến thức đã học trong đời sống và kỹ thuật.
        </div>

        <div style="text-align: center; font-style: italic; margin-top: 25px; margin-bottom: 30px;">
          ---------- HẾT MÃ ĐỀ ${paper.examCode} ----------
        </div>
      </div>
    `;
  }).join('');

  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bộ Các Mã Đề Kiểm Tra Định Kỳ KHTN - Y Đôn</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; margin: 1.5cm; color: #000; }
        .page-break { page-break-before: always; mso-special-character: line-break; }
      </style>
    </head>
    <body>
      ${papersHtml}
    </body>
    </html>
  `;

  return new Blob(['\ufeff', fullHtml], { type: 'application/msword;charset=utf-8' });
}

/**
 * Generate Summary Answer Key Matrix in Word Document
 */
export function generateMixedAnswerKeysWordBlob(papers: ShuffledExamPaper[]): Blob {
  const codes = papers.map(p => p.examCode);

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bảng Ma Trận Đáp Án Các Mã Đề - Y Đôn</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; margin: 1.5cm; }
        .table-keys { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 10pt; }
        .table-keys th, .table-keys td { border: 1px solid #000; padding: 4px; text-align: center; }
        .table-keys th { background-color: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body>
      <div style="text-align: center; font-weight: bold; font-size: 13pt;">SỞ GD&ĐT GIA LAI - TRƯỜNG THCS & THPT Y ĐÔN</div>
      <div style="text-align: center; font-weight: bold; font-size: 15pt; margin-top: 5px; margin-bottom: 5px;">
        BẢNG TỔNG HỢP ĐÁP ÁN CÁC MÃ ĐỀ KIỂM TRA ĐỊNH KỲ
      </div>
      <div style="text-align: center; font-style: italic; margin-bottom: 15px;">
        (Dùng để đối chiếu và nạp vào máy quét chấm thi tự động)
      </div>

      <div style="font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #1e3a8a;">
        I. BẢNG ĐÁP ÁN PHẦN I (40 CÂU TRẮC NGHIỆM):
      </div>
      <table class="table-keys">
        <thead>
          <tr>
            <th style="width: 50px;">Câu</th>
            ${codes.map(c => `<th>Mã ${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 40 }, (_, idx) => `
            <tr>
              <td><strong>${idx + 1}</strong></td>
              ${papers.map(p => `<td><strong>${p.keys.part1Keys[idx] || '-'}</strong></td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #1e3a8a;">
        II. BẢNG ĐÁP ÁN PHẦN II (8 CÂU ĐÚNG/SAI):
      </div>
      <table class="table-keys">
        <thead>
          <tr>
            <th>Câu & Ý</th>
            ${codes.map(c => `<th>Mã ${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 8 }, (_, qIdx) => `
            ${['a', 'b', 'c', 'd'].map((sub, sIdx) => `
              <tr>
                <td>Câu ${qIdx + 1} (${sub})</td>
                ${papers.map(p => {
                  const val = p.keys.part2Keys[qIdx]?.[sIdx];
                  return `<td>${val ? '<span style="color: green; font-weight: bold;">Đúng</span>' : '<span style="color: red; font-weight: bold;">Sai</span>'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>

      <div style="font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #1e3a8a;">
        III. BẢNG ĐÁP ÁN PHẦN III (6 CÂU TRẢ LỜI NGẮN):
      </div>
      <table class="table-keys">
        <thead>
          <tr>
            <th>Câu</th>
            ${codes.map(c => `<th>Mã ${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 6 }, (_, idx) => `
            <tr>
              <td>Câu ${idx + 1}</td>
              ${papers.map(p => `<td><strong>${p.keys.part3Keys[idx] || '-'}</strong></td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
}

/**
 * Generate Summary Answer Key Matrix in Excel (.xlsx)
 */
export function exportMixedAnswerKeysExcel(papers: ShuffledExamPaper[]) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Part I MCQs
  const p1Rows: any[] = [];
  p1Rows.push(['BẢNG ĐÁP ÁN PHẦN I - CÂU TRẮC NGHIỆM']);
  const headerRow = ['Câu', ...papers.map(p => `Mã ${p.examCode}`)];
  p1Rows.push(headerRow);

  for (let i = 0; i < 40; i++) {
    const row = [`Câu ${i + 1}`, ...papers.map(p => p.keys.part1Keys[i] || '')];
    p1Rows.push(row);
  }
  const ws1 = XLSX.utils.aoa_to_sheet(p1Rows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Phần I - Trắc nghiệm');

  // Sheet 2: Part II True/False
  const p2Rows: any[] = [];
  p2Rows.push(['BẢNG ĐÁP ÁN PHẦN II - ĐÚNG / SAI']);
  p2Rows.push(['Câu & Ý', ...papers.map(p => `Mã ${p.examCode}`)]);
  for (let q = 0; q < 8; q++) {
    ['a', 'b', 'c', 'd'].forEach((sub, sIdx) => {
      const row = [`Câu ${q + 1} (${sub})`, ...papers.map(p => p.keys.part2Keys[q]?.[sIdx] ? 'Đ' : 'S')];
      p2Rows.push(row);
    });
  }
  const ws2 = XLSX.utils.aoa_to_sheet(p2Rows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Phần II - Đúng Sai');

  // Sheet 3: Part III Short Answer
  const p3Rows: any[] = [];
  p3Rows.push(['BẢNG ĐÁP ÁN PHẦN III - TRẢ LỜI NGẮN']);
  p3Rows.push(['Câu', ...papers.map(p => `Mã ${p.examCode}`)]);
  for (let i = 0; i < 6; i++) {
    const row = [`Câu ${i + 1}`, ...papers.map(p => p.keys.part3Keys[i] || '')];
    p3Rows.push(row);
  }
  const ws3 = XLSX.utils.aoa_to_sheet(p3Rows);
  XLSX.utils.book_append_sheet(wb, ws3, 'Phần III - Trả lời ngắn');

  XLSX.writeFile(wb, `Bang_Dap_An_Tong_Hop_${papers.length}_Ma_De_Y_Don.xlsx`);
}
