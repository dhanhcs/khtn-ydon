import * as XLSX from 'xlsx';
import { StudentRecord, GradeLevel } from '../types';

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
