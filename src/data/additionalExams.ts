import { Exam } from '../types';
import { examsGrade6 } from './examsGrade6';
import { examsGrade7 } from './examsGrade7';
import { examsGrade8 } from './examsGrade8';
import { examsGrade9 } from './examsGrade9';

export { examsGrade6, examsGrade7, examsGrade8, examsGrade9 };

/**
 * Danh sách toàn bộ 32 đề kiểm tra thường xuyên (Đề 1 đến Đề 8 cho 4 khối 6, 7, 8, 9)
 * Mỗi khối lớp được chuẩn hóa đầy đủ 8 đề từ Đề 1 đến Đề 8 với chuẩn ma trận KHTN.
 */
const rawStandardExams: Exam[] = [
  ...examsGrade6,
  ...examsGrade7,
  ...examsGrade8,
  ...examsGrade9
];

export const allStandardExams: Exam[] = rawStandardExams;

// Tương thích ngược với các file import additionalExams
export const additionalExams: Exam[] = allStandardExams;
