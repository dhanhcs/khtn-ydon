import * as XLSX from 'xlsx';
import { StudentRecord, GradeLevel, StudentSubmission } from '../types';

/**
 * Standard column headers for School Roster Excel template
 */
export const EXCEL_STUDENT_COLUMNS = [
  'Mã học sinh',
  'Họ và tên',
  'Lớp',
  'Khối',
  'Giới tính',
  'Ngày sinh',
  'Ghi chú'
];

/**
 * Generates and downloads the official standard Excel roster template (.xlsx)
 */
export function downloadStudentExcelTemplate(existingStudents: StudentRecord[] = []) {
  // Sample data row to guide teachers
  const sampleRows = existingStudents.length > 0
    ? existingStudents.map((st, i) => ({
        'STT': i + 1,
        'Mã học sinh': st.id,
        'Họ và tên': st.name,
        'Lớp': st.className,
        'Khối': st.grade,
        'Giới tính': st.gender,
        'Ngày sinh': st.dob || '2012-01-15',
        'Ghi chú': 'Học sinh chính thức Trường THCS Y Đôn'
      }))
    : [
        {
          'STT': 1,
          'Mã học sinh': 'HS01',
          'Họ và tên': 'Nguyễn Văn An',
          'Lớp': '8A1',
          'Khối': 8,
          'Giới tính': 'Nam',
          'Ngày sinh': '2012-05-10',
          'Ghi chú': 'Mẫu học sinh trường THCS Y Đôn'
        },
        {
          'STT': 2,
          'Mã học sinh': 'HS02',
          'Họ và tên': 'Trần Thị Mai',
          'Lớp': '8A1',
          'Khối': 8,
          'Giới tính': 'Nữ',
          'Ngày sinh': '2012-08-22',
          'Ghi chú': 'Mẫu học sinh'
        },
        {
          'STT': 3,
          'Mã học sinh': 'HS03',
          'Họ và tên': 'Lê Hoàng Nam',
          'Lớp': '9A2',
          'Khối': 9,
          'Giới tính': 'Nam',
          'Ngày sinh': '2011-03-14',
          'Ghi chú': 'Mẫu học sinh'
        }
      ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);

  // Set column widths for nice appearance
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã học sinh
    { wch: 25 }, // Họ và tên
    { wch: 10 }, // Lớp
    { wch: 8 },  // Khối
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 35 }  // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_HocSinh_YDon');

  const fileName = `Mau_Danh_Sach_Hoc_Sinh_THCS_YDon_${new Date().getFullYear()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exports current student roster to Excel file (.xlsx)
 */
export function exportStudentsToExcel(students: StudentRecord[], schoolName: string = 'THCS Y Đôn') {
  const rows = students.map((st, i) => ({
    'STT': i + 1,
    'Mã học sinh': st.id,
    'Họ và tên': st.name,
    'Lớp': st.className,
    'Khối': st.grade,
    'Giới tính': st.gender,
    'Ngày sinh': st.dob || '',
    'Trường': schoolName
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 26 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 14 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Hoc_Sinh');

  const dateStr = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(workbook, `Danh_sach_Hoc_Sinh_YDon_${dateStr}.xlsx`);
}

/**
 * Parses uploaded Excel file (.xlsx, .xls, .csv) into validated StudentRecord[]
 */
export async function parseStudentsExcelFile(file: File): Promise<{
  students: StudentRecord[];
  errors: string[];
  totalRows: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ students: [], errors: ['Tệp Excel rỗng hoặc không có trang tính (Sheet).'], totalRows: 0 });
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const students: StudentRecord[] = [];
        const errors: string[] = [];
        let autoIdCounter = 1;

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          
          // Flexibly detect fields regardless of minor header naming differences
          const nameVal = row['Họ và tên'] || row['Họ và Tên'] || row['Họ tên'] || row['Name'] || row['Tên'] || '';
          const classVal = row['Lớp'] || row['Class'] || row['Lớp học'] || '';
          const gradeVal = row['Khối'] || row['Grade'] || '';
          const genderVal = row['Giới tính'] || row['Giới Tính'] || row['Gender'] || 'Nam';
          const idVal = row['Mã học sinh'] || row['Mã HS'] || row['Mã'] || row['ID'] || '';
          const dobVal = row['Ngày sinh'] || row['DOB'] || '';

          const name = String(nameVal).trim();
          if (!name) {
            // Ignore completely empty rows
            return;
          }

          let className = String(classVal).trim().toUpperCase();
          if (!className) {
            className = '8A1';
          }

          // Parse Grade: from grade column or derived from class name (e.g., "8A1" -> 8)
          let grade: GradeLevel = 8;
          const parsedGrade = parseInt(String(gradeVal).replace(/\D/g, ''), 10);
          if (parsedGrade === 6 || parsedGrade === 7 || parsedGrade === 8 || parsedGrade === 9) {
            grade = parsedGrade as GradeLevel;
          } else {
            const classGradeNum = parseInt(className.replace(/\D/g, '')[0] || '8', 10);
            if (classGradeNum === 6 || classGradeNum === 7 || classGradeNum === 8 || classGradeNum === 9) {
              grade = classGradeNum as GradeLevel;
            }
          }

          let gender: 'Nam' | 'Nữ' = 'Nam';
          const genderStr = String(genderVal).toLowerCase().trim();
          if (genderStr === 'nữ' || genderStr === 'nu' || genderStr === 'female' || genderStr === 'f') {
            gender = 'Nữ';
          }

          const studentId = idVal ? String(idVal).trim() : `HS${String(autoIdCounter++).padStart(3, '0')}`;

          students.push({
            id: studentId,
            name,
            className,
            grade,
            gender,
            dob: dobVal ? String(dobVal).trim() : undefined
          });
        });

        resolve({
          students,
          errors,
          totalRows: rawJson.length
        });
      } catch (err: any) {
        reject(new Error('Lỗi khi phân tích tệp Excel: ' + (err?.message || 'Định dạng không hợp lệ')));
      }
    };

    reader.onerror = () => reject(new Error('Không thể đọc tệp Excel. Vui lòng thử lại.'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Normalizes Vietnamese names for robust matching (e.g., removing accents and punctuation)
 */
export function normalizeNameForMatch(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a given student name & class belongs to the school roster
 */
export function checkStudentInSchoolRoster(
  studentName: string,
  className: string,
  roster: StudentRecord[]
): { isEnrolled: boolean; matchedStudent?: StudentRecord } {
  if (!studentName.trim() || !roster || roster.length === 0) {
    return { isEnrolled: false };
  }

  const normInputName = normalizeNameForMatch(studentName);
  const normInputClass = className.trim().toUpperCase().replace(/\s+/g, '');

  // Exact or normalized match
  const matched = roster.find(st => {
    const normStName = normalizeNameForMatch(st.name);
    const normStClass = st.className.trim().toUpperCase().replace(/\s+/g, '');

    const nameMatches = normStName === normInputName;
    const classMatches = !normInputClass || normStClass === normInputClass;

    return nameMatches && classMatches;
  });

  if (matched) {
    return { isEnrolled: true, matchedStudent: matched };
  }

  // Fallback: match by name only if unique in roster
  const nameOnlyMatches = roster.filter(st => normalizeNameForMatch(st.name) === normInputName);
  if (nameOnlyMatches.length === 1) {
    return { isEnrolled: true, matchedStudent: nameOnlyMatches[0] };
  }

  return { isEnrolled: false };
}

export interface StudentValidationDiagnostic {
  isValid: boolean;
  matchedStudent?: StudentRecord;
  errorType?: 'empty' | 'no_roster' | 'wrong_class' | 'spelling_typo' | 'not_found';
  message: string;
  suggestedName?: string;
  suggestedClass?: string;
  classRoster?: StudentRecord[];
}

/**
 * Validates a student name and class against the uploaded roster and returns
 * detailed, helpful reminders explaining the exact mistake so the student can fix it.
 */
export function validateStudentNameWithHelpfulErrors(
  inputName: string,
  selectedClass: string,
  roster: StudentRecord[]
): StudentValidationDiagnostic {
  const trimmedName = inputName.trim();
  if (!trimmedName) {
    return {
      isValid: false,
      errorType: 'empty',
      message: 'Vui lòng nhập đầy đủ họ và tên học sinh.'
    };
  }

  if (!roster || roster.length === 0) {
    return {
      isValid: false,
      errorType: 'no_roster',
      message: 'Hệ thống hiện chưa có danh sách học sinh được tải lên từ Thầy/Cô. Vui lòng liên hệ Thầy/Cô phụ trách để tải danh sách lớp lên trước.'
    };
  }

  const normInput = normalizeNameForMatch(trimmedName);
  const normSelectedClass = selectedClass.trim().toUpperCase().replace(/\s+/g, '');

  const classStudents = roster.filter(
    s => !normSelectedClass || s.className.trim().toUpperCase().replace(/\s+/g, '') === normSelectedClass
  );

  // 1. Exact match in selected class
  const exactInClass = classStudents.find(
    s => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (exactInClass) {
    return {
      isValid: true,
      matchedStudent: exactInClass,
      message: `Học sinh hợp lệ: ${exactInClass.name} (Lớp ${exactInClass.className})`
    };
  }

  // 2. Normalized match in selected class (e.g. slight accent or casing difference)
  const normInClass = classStudents.find(
    s => normalizeNameForMatch(s.name) === normInput
  );
  if (normInClass) {
    return {
      isValid: true,
      matchedStudent: normInClass,
      message: `Học sinh hợp lệ: ${normInClass.name} (Lớp ${normInClass.className})`
    };
  }

  // 3. Check if this student exists in ANOTHER class
  const matchInOtherClass = roster.find(
    s => normalizeNameForMatch(s.name) === normInput || s.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (matchInOtherClass) {
    return {
      isValid: false,
      errorType: 'wrong_class',
      suggestedClass: matchInOtherClass.className,
      suggestedName: matchInOtherClass.name,
      message: `Lỗi sai Lớp học: Học sinh "${matchInOtherClass.name}" thuộc Lớp ${matchInOtherClass.className} (Khối ${matchInOtherClass.grade}), không phải Lớp ${selectedClass}. Vui lòng chọn lại đúng Lớp ${matchInOtherClass.className} để đăng nhập!`
    };
  }

  // 4. Check for similar/closest name in this class (spelling typo)
  const partialMatch = classStudents.find(s => {
    const normS = normalizeNameForMatch(s.name);
    return normS.includes(normInput) || normInput.includes(normS);
  });
  if (partialMatch) {
    return {
      isValid: false,
      errorType: 'spelling_typo',
      suggestedName: partialMatch.name,
      message: `Lỗi sai chính tả họ và tên: Trong danh sách Lớp ${selectedClass} có học sinh "${partialMatch.name}". Bạn đang nhập "${trimmedName}". Vui lòng gõ đầy đủ và đúng chính tả có dấu như trong danh sách lớp.`
    };
  }

  // 5. Completely not found in roster for this class
  return {
    isValid: false,
    errorType: 'not_found',
    classRoster: classStudents,
    message: `Họ và tên "${trimmedName}" không trùng với tên trong danh sách học sinh Lớp ${selectedClass} đã tải lên app. Vui lòng kiểm tra: (1) Viết đúng chính tả tiếng Việt có dấu; (2) Chọn đúng Khối và Lớp của mình; (3) Hoặc báo Thầy/Cô nếu bạn chưa có tên trong danh sách.`
  };
}

export interface ScoreboardExportOptions {
  subjectFilter?: string;
  classFilter?: string;
  testNumberFilter?: string;
  examTitleFilter?: string;
  schoolName?: string;
}

/**
 * Xuất bảng điểm Kiểm tra thường xuyên (KTTX) ra file Excel .xlsx chuẩn hóa
 */
export function exportScoreboardToExcel(
  submissions: StudentSubmission[],
  options: ScoreboardExportOptions = {}
) {
  const {
    subjectFilter = 'all',
    classFilter = 'all',
    testNumberFilter = 'all',
    examTitleFilter,
    schoolName = 'Trường THCS & THPT Y Đôn'
  } = options;

  // Sheet 1: Chi tiết từng bài làm của học sinh
  const detailRows = submissions.map((sub, index) => {
    const score = sub.totalScore;
    let rank = 'Chưa đạt';
    if (score >= 9.0) rank = 'Xuất sắc';
    else if (score >= 8.0) rank = 'Giỏi';
    else if (score >= 6.5) rank = 'Khá';
    else if (score >= 5.0) rank = 'Trung bình';

    let discipline = 'Vật lí';
    if (sub.subject === 'chemistry') discipline = 'Hóa học';
    else if (sub.subject === 'biology') discipline = 'Sinh học';

    let violationText = 'Nghiêm túc';
    if (sub.penaltyApplied === 'locked_zero') {
      violationText = 'Khóa bài (0đ) do vi phạm';
    } else if (sub.penaltyApplied === 'minus_50_percent') {
      violationText = 'Trừ 50% điểm (chuyển tab nhiều lần)';
    } else if (sub.penaltyApplied === 'warning') {
      violationText = 'Nhắc nhở 1 lần';
    }

    return {
      'STT': index + 1,
      'Họ và tên học sinh': sub.studentName,
      'Lớp': sub.className,
      'Khối': sub.grade ? `Khối ${sub.grade}` : '',
      'Phân môn': discipline,
      'Tên bài kiểm tra': sub.examTitle,
      'Điểm trắc nghiệm (8.0đ)': sub.mcqScore !== undefined ? Number(sub.mcqScore.toFixed(1)) : '',
      'Điểm Đúng/Sai (1.0đ)': sub.tfScore !== undefined ? Number(sub.tfScore.toFixed(2)) : '',
      'Điểm TL ngắn (1.0đ)': sub.saScore !== undefined ? Number(sub.saScore.toFixed(1)) : '',
      'Tổng điểm (thang 10)': Number(sub.totalScore.toFixed(1)),
      'Xếp loại': rank,
      'Giám sát vi phạm': violationText,
      'Thời gian nộp bài': sub.submittedAt || '',
      'Thời gian làm (giây)': sub.timeSpentSeconds || '',
      'Trường': schoolName
    };
  });

  const detailSheet = XLSX.utils.json_to_sheet(detailRows);
  detailSheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 25 }, // Họ và tên
    { wch: 10 }, // Lớp
    { wch: 10 }, // Khối
    { wch: 12 }, // Phân môn
    { wch: 45 }, // Tên bài kiểm tra
    { wch: 16 }, // Điểm TN
    { wch: 16 }, // Điểm ĐS
    { wch: 16 }, // Điểm TLN
    { wch: 16 }, // Tổng điểm
    { wch: 14 }, // Xếp loại
    { wch: 26 }, // Giám sát
    { wch: 22 }, // Thời gian nộp
    { wch: 16 }, // Thời gian làm
    { wch: 25 }  // Trường
  ];

  // Sheet 2: Thống kê tổng hợp phân phối điểm theo từng lớp
  const classMap = new Map<string, {
    total: number;
    sum: number;
    gioi: number;
    kha: number;
    tb: number;
    duoi5: number;
  }>();

  submissions.forEach(sub => {
    const cls = sub.className || 'Chưa rõ';
    const curr = classMap.get(cls) || { total: 0, sum: 0, gioi: 0, kha: 0, tb: 0, duoi5: 0 };
    curr.total++;
    curr.sum += sub.totalScore;
    if (sub.totalScore >= 8.0) curr.gioi++;
    else if (sub.totalScore >= 6.5) curr.kha++;
    else if (sub.totalScore >= 5.0) curr.tb++;
    else curr.duoi5++;
    classMap.set(cls, curr);
  });

  const summaryRows = Array.from(classMap.entries()).map(([cls, stat], i) => {
    const avg = stat.total > 0 ? Number((stat.sum / stat.total).toFixed(1)) : 0;
    const passCount = stat.gioi + stat.kha + stat.tb;
    const passRate = stat.total > 0 ? Number(((passCount / stat.total) * 100).toFixed(1)) : 0;
    return {
      'STT': i + 1,
      'Lớp': cls,
      'Tổng số bài nộp': stat.total,
      'Điểm trung bình': avg,
      'Tỉ lệ đạt (>= 5.0)': `${passRate}%`,
      'Giỏi (8.0 - 10đ)': stat.gioi,
      'Khá (6.5 - 7.9đ)': stat.kha,
      'Trung bình (5.0 - 6.4đ)': stat.tb,
      'Dưới 5.0 (Chưa đạt)': stat.duoi5
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'BangDiem_KTTX_ChiTiet');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'ThongKe_TheoLop');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const subjTag = subjectFilter === 'all' ? 'TatCaMon' : subjectFilter;
  const testTag = testNumberFilter === 'all' ? 'TatCaDe' : `De${testNumberFilter}`;
  const classTag = classFilter === 'all' ? 'TatCaLop' : `Lop_${classFilter}`;
  const examTag = examTitleFilter 
    ? `_${examTitleFilter.replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, '_').substring(0, 30)}`
    : '';
  const filename = `Bang_Diem_KTTX_YDon_${subjTag}_${testTag}${examTag}_${classTag}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

export interface ScoreboardImportResult {
  submissions: StudentSubmission[];
  errors: string[];
  totalRows: number;
  detectedFormat?: string;
}

/**
 * Phân tích tệp Excel (.xlsx, .xls) hoặc CSV bảng điểm để nhập danh sách bài nộp
 */
export async function parseScoreboardExcelFile(file: File): Promise<ScoreboardImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Ưu tiên sheet BangDiem_KTTX_ChiTiet nếu có, nếu không lấy sheet đầu tiên
        let targetSheetName = workbook.SheetNames[0];
        if (workbook.SheetNames.includes('BangDiem_KTTX_ChiTiet')) {
          targetSheetName = 'BangDiem_KTTX_ChiTiet';
        }

        if (!targetSheetName) {
          resolve({ submissions: [], errors: ['Tệp Excel rỗng hoặc không có trang tính.'], totalRows: 0 });
          return;
        }

        const sheet = workbook.Sheets[targetSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const submissions: StudentSubmission[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, idx) => {
          // Tìm trường tên học sinh
          const nameVal = row['Họ và tên học sinh'] || row['Họ và tên'] || row['Họ và Tên'] || 
                         row['Họ tên'] || row['Tên học sinh'] || row['Học sinh'] || row['Name'] || '';
          
          const studentName = String(nameVal).trim();
          if (!studentName || studentName.toLowerCase().includes('thống kê') || studentName.toLowerCase().includes('tổng số')) {
            return;
          }

          // Lớp
          const classVal = row['Lớp'] || row['Class'] || row['Lớp học'] || '8A1';
          const className = String(classVal).trim().toUpperCase();

          // Khối
          let grade: GradeLevel = 8;
          const gradeVal = row['Khối'] || row['Grade'] || '';
          const parsedGrade = parseInt(String(gradeVal).replace(/\D/g, ''), 10);
          if (parsedGrade === 6 || parsedGrade === 7 || parsedGrade === 8 || parsedGrade === 9) {
            grade = parsedGrade as GradeLevel;
          } else {
            const classGradeNum = parseInt(className.replace(/\D/g, '')[0] || '8', 10);
            if (classGradeNum === 6 || classGradeNum === 7 || classGradeNum === 8 || classGradeNum === 9) {
              grade = classGradeNum as GradeLevel;
            }
          }

          // Phân môn
          const subjVal = String(row['Phân môn'] || row['Môn'] || row['Môn học'] || row['Subject'] || '').toLowerCase();
          let subject: 'physics' | 'chemistry' | 'biology' = 'physics';
          if (subjVal.includes('hóa') || subjVal.includes('chem')) subject = 'chemistry';
          else if (subjVal.includes('sinh') || subjVal.includes('bio')) subject = 'biology';

          // Tên bài kiểm tra
          const examTitle = String(
            row['Tên bài kiểm tra'] || row['Tên đề'] || row['Tên bài'] || row['Bài kiểm tra'] || row['Đề kiểm tra'] || 'Bài kiểm tra KHTN'
          ).trim();

          // Điểm
          const totalVal = row['Tổng điểm (thang 10)'] ?? row['Tổng điểm'] ?? row['Điểm'] ?? row['Điểm thi'] ?? row['Score'] ?? '0';
          let totalScore = parseFloat(String(totalVal).replace(',', '.'));
          if (isNaN(totalScore)) totalScore = 0;
          totalScore = Math.max(0, Math.min(10, totalScore));

          const mcqVal = row['Điểm trắc nghiệm (8.0đ)'] ?? row['Điểm TN'] ?? row['mcqScore'];
          let mcqScore = mcqVal !== undefined && mcqVal !== '' ? parseFloat(String(mcqVal).replace(',', '.')) : Math.min(8.0, totalScore);
          if (isNaN(mcqScore)) mcqScore = Math.min(8.0, totalScore);

          const tfVal = row['Điểm Đúng/Sai (1.0đ)'] ?? row['Điểm ĐS'] ?? row['tfScore'];
          let tfScore = tfVal !== undefined && tfVal !== '' ? parseFloat(String(tfVal).replace(',', '.')) : 0;
          if (isNaN(tfScore)) tfScore = 0;

          const saVal = row['Điểm TL ngắn (1.0đ)'] ?? row['Điểm TLN'] ?? row['saScore'];
          let saScore = saVal !== undefined && saVal !== '' ? parseFloat(String(saVal).replace(',', '.')) : 0;
          if (isNaN(saScore)) saScore = 0;

          // Thời gian nộp
          const submitVal = String(row['Thời gian nộp bài'] || row['Thời gian nộp'] || row['Thời gian'] || '').trim();
          const submittedAt = submitVal || new Date().toISOString().replace('T', ' ').substring(0, 19);

          // Thời gian làm
          const timeVal = row['Thời gian làm (giây)'] ?? row['Thời gian làm'] ?? 300;
          let timeSpentSeconds = parseInt(String(timeVal), 10);
          if (isNaN(timeSpentSeconds) || timeSpentSeconds <= 0) timeSpentSeconds = 300;

          // Vi phạm
          const violVal = String(row['Giám sát vi phạm'] || row['Vi phạm'] || '').toLowerCase();
          let penaltyApplied: 'none' | 'warning' | 'minus_50_percent' | 'locked_zero' = 'none';
          if (violVal.includes('khóa') || violVal.includes('0đ')) penaltyApplied = 'locked_zero';
          else if (violVal.includes('50%') || violVal.includes('trừ')) penaltyApplied = 'minus_50_percent';
          else if (violVal.includes('nhắc')) penaltyApplied = 'warning';

          // Tạo ID bài nộp chuẩn
          const id = row['ID'] || `sub-import-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`;
          const examId = row['examId'] || `exam-${subject}-${grade}-auto`;

          submissions.push({
            id,
            examId,
            examTitle,
            subject,
            grade,
            studentName,
            className,
            startedAt: submittedAt,
            submittedAt,
            timeSpentSeconds,
            mcqScore,
            tfScore,
            saScore,
            totalScore,
            answers: { mcq: {}, tf: {}, sa: {} },
            penaltyApplied
          });
        });

        resolve({
          submissions,
          errors,
          totalRows: rawJson.length,
          detectedFormat: 'Excel (.xlsx/.xls)'
        });
      } catch (err: any) {
        reject(new Error('Lỗi khi phân tích tệp Excel bảng điểm: ' + (err?.message || 'Định dạng không hợp lệ')));
      }
    };

    reader.onerror = () => reject(new Error('Không thể đọc tệp Excel. Vui lòng kiểm tra lại tệp tin.'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Phân tích dữ liệu bảng điểm được dán trực tiếp (từ Excel, Google Sheets hoặc bảng văn bản)
 */
export function parseScoreboardFromText(rawText: string): ScoreboardImportResult {
  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { submissions: [], errors: ['Nội dung dán rỗng.'], totalRows: 0 };
  }

  // Thử parse dạng JSON trước nếu người dùng dán chuỗi JSON
  if (lines[0].startsWith('[') || lines[0].startsWith('{')) {
    try {
      return parseScoreboardFromJson(rawText);
    } catch (e) {
      // Tiếp tục parse dạng bảng
    }
  }

  // Tách hàng theo dấu tab hoặc dấu phẩy hoặc chấm phẩy
  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
  
  const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, '')));
  if (matrix.length === 0) {
    return { submissions: [], errors: ['Không tìm thấy dữ liệu.'], totalRows: 0 };
  }

  // Xác định hàng tiêu đề
  const firstRow = matrix[0];
  let headerIndex = -1;
  let nameCol = -1;
  let classCol = -1;
  let scoreCol = -1;
  let examCol = -1;
  let timeCol = -1;

  for (let i = 0; i < Math.min(3, matrix.length); i++) {
    const row = matrix[i].map(c => c.toLowerCase());
    const nIdx = row.findIndex(c => c.includes('tên') || c.includes('họ') || c.includes('học sinh') || c.includes('name'));
    const cIdx = row.findIndex(c => c.includes('lớp') || c.includes('class'));
    const sIdx = row.findIndex(c => c.includes('điểm') || c.includes('score') || c.includes('tổng điểm'));
    
    if (nIdx !== -1 && (cIdx !== -1 || sIdx !== -1)) {
      headerIndex = i;
      nameCol = nIdx;
      classCol = cIdx;
      scoreCol = sIdx;
      examCol = row.findIndex(c => c.includes('đề') || c.includes('bài') || c.includes('exam'));
      timeCol = row.findIndex(c => c.includes('thời gian') || c.includes('ngày') || c.includes('time'));
      break;
    }
  }

  // Nếu không có hàng tiêu đề, tự suy đoán cột
  if (headerIndex === -1) {
    headerIndex = -1; // bắt đầu từ dòng 0
    // Cột nào chứa chữ dài thường là Tên, cột có dạng 8A1 là Lớp, cột có số 0-10 là Điểm
    const sample = matrix[0];
    sample.forEach((col, idx) => {
      const trimmed = col.trim();
      const num = parseFloat(trimmed.replace(',', '.'));
      if (!isNaN(num) && num >= 0 && num <= 10 && scoreCol === -1 && idx > 0) {
        scoreCol = idx;
      } else if (/^[6-9][A-Z]\d*$/i.test(trimmed) && classCol === -1) {
        classCol = idx;
      } else if (trimmed.length > 3 && isNaN(Number(trimmed)) && nameCol === -1) {
        nameCol = idx;
      }
    });
    if (nameCol === -1) nameCol = 1 < matrix[0].length ? 1 : 0;
    if (classCol === -1) classCol = 2 < matrix[0].length ? 2 : 1;
    if (scoreCol === -1) scoreCol = matrix[0].length - 1;
  }

  const submissions: StudentSubmission[] = [];
  const startRow = headerIndex + 1;

  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r];
    if (row.length === 0) continue;

    const studentName = (row[nameCol] || '').trim();
    if (!studentName || studentName.toLowerCase().includes('thống kê') || studentName.toLowerCase().includes('tổng số')) {
      continue;
    }

    const className = (classCol !== -1 ? row[classCol] : '8A1').trim().toUpperCase() || '8A1';
    
    let totalScore = 0;
    if (scoreCol !== -1 && row[scoreCol]) {
      const num = parseFloat(row[scoreCol].replace(',', '.'));
      if (!isNaN(num)) totalScore = Math.max(0, Math.min(10, num));
    }

    const examTitle = examCol !== -1 && row[examCol] ? row[examCol].trim() : 'Bài kiểm tra KHTN';
    const submittedAt = timeCol !== -1 && row[timeCol] ? row[timeCol].trim() : new Date().toISOString().replace('T', ' ').substring(0, 19);

    let grade: GradeLevel = 8;
    const classGradeNum = parseInt(className.replace(/\D/g, '')[0] || '8', 10);
    if (classGradeNum === 6 || classGradeNum === 7 || classGradeNum === 8 || classGradeNum === 9) {
      grade = classGradeNum as GradeLevel;
    }

    submissions.push({
      id: `sub-paste-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`,
      examId: `exam-physics-${grade}-auto`,
      examTitle,
      subject: 'physics',
      grade,
      studentName,
      className,
      startedAt: submittedAt,
      submittedAt,
      timeSpentSeconds: 300,
      mcqScore: Math.min(8.0, totalScore),
      tfScore: 0,
      saScore: 0,
      totalScore,
      answers: { mcq: {}, tf: {}, sa: {} }
    });
  }

  return {
    submissions,
    errors: [],
    totalRows: matrix.length - (headerIndex >= 0 ? 1 : 0),
    detectedFormat: delimiter === '\t' ? 'Bảng tính Excel/Sheets (Tab-separated)' : 'Văn bản phân tách'
  };
}

/**
 * Phân tích tệp JSON hoặc chuỗi JSON chứa danh sách bài nộp
 */
export function parseScoreboardFromJson(jsonString: string): ScoreboardImportResult {
  const parsed = JSON.parse(jsonString.trim());
  let importedSubs: StudentSubmission[] = [];

  if (Array.isArray(parsed)) {
    importedSubs = parsed;
  } else if (parsed && Array.isArray(parsed.submissions)) {
    importedSubs = parsed.submissions;
  } else if (parsed && Array.isArray(parsed.ydon_submissions)) {
    importedSubs = parsed.ydon_submissions;
  } else {
    throw new Error('Định dạng JSON không chứa danh sách bài nộp của học sinh');
  }

  // Đảm bảo dữ liệu tối thiểu hợp lệ
  const validSubs: StudentSubmission[] = importedSubs
    .filter(s => s && typeof s.studentName === 'string' && s.studentName.trim().length > 0)
    .map((s, idx) => ({
      id: s.id || `sub-json-${Date.now()}-${idx}`,
      examId: s.examId || 'exam-auto',
      examTitle: s.examTitle || 'Bài kiểm tra KHTN',
      subject: s.subject || 'physics',
      grade: s.grade || 8,
      studentName: s.studentName.trim(),
      className: (s.className || '8A1').toUpperCase().trim(),
      startedAt: s.startedAt || s.submittedAt || new Date().toISOString(),
      submittedAt: s.submittedAt || new Date().toISOString(),
      timeSpentSeconds: typeof s.timeSpentSeconds === 'number' ? s.timeSpentSeconds : 300,
      mcqScore: typeof s.mcqScore === 'number' ? s.mcqScore : Math.min(8.0, s.totalScore || 0),
      tfScore: typeof s.tfScore === 'number' ? s.tfScore : 0,
      saScore: typeof s.saScore === 'number' ? s.saScore : 0,
      totalScore: typeof s.totalScore === 'number' ? s.totalScore : 0,
      answers: s.answers || { mcq: {}, tf: {}, sa: {} },
      penaltyApplied: s.penaltyApplied || 'none'
    }));

  return {
    submissions: validSubs,
    errors: [],
    totalRows: importedSubs.length,
    detectedFormat: 'Tệp sao lưu JSON (.json)'
  };
}
