import { Exam, LearningResource, StudentRecord, StudentSubmission, SystemConfig } from '../types';

export const initialSystemConfig: SystemConfig = {
  appName: 'KHOA HỌC TỰ NHIÊN - Y ĐÔN',
  schoolName: 'THCS và THPT Y Đôn',
  department: 'Lí - Hóa - Sinh - CN',
  address: 'Thôn 2, xã Đak Pơ, tỉnh Gia Lai',
  leadTeacher: 'Thầy Nguyễn Đình Hành (Phụ trách kỹ thuật & chuyên môn)',
  teachingTeam: [
    'Nguyễn Đình Hành',
    'Nguyễn Thị Cẩm Lệ',
    'Đặng Thị Xuân Sang',
    'Phạm Ngọc Tiến'
  ],
  schoolYear: '2026-2027',
  bannerTitle: 'HỆ THỐNG HỌC TẬP & KIỂM TRA TRỰC TUYẾN KHOA HỌC TỰ NHIÊN',
  bannerSubtitle: 'Khám phá thế giới tự nhiên - Nâng cao tư duy thực nghiệm và khoa học sáng tạo',
  logoUrl: ''
};

export const sampleStudents: StudentRecord[] = [
  { id: 'HS01', name: 'Đinh Thị Mai Lan', className: '8A', grade: 8, gender: 'Nữ' },
  { id: 'HS02', name: 'Nguyễn Văn Tuấn', className: '8A', grade: 8, gender: 'Nam' },
  { id: 'HS03', name: 'Rơ Châm H’Yên', className: '8A', grade: 8, gender: 'Nữ' },
  { id: 'HS04', name: 'Trần Gia Huy', className: '8A', grade: 8, gender: 'Nam' },
  { id: 'HS05', name: 'Lê Hoàng Yến', className: '8B', grade: 8, gender: 'Nữ' },
  { id: 'HS06', name: 'Võ Minh Quân', className: '8B', grade: 8, gender: 'Nam' },
  { id: 'HS07', name: 'Đinh H’Bích', className: '7A', grade: 7, gender: 'Nữ' },
  { id: 'HS08', name: 'Nguyễn Tiến Đạt', className: '7A', grade: 7, gender: 'Nam' },
  { id: 'HS09', name: 'Phạm Quỳnh Như', className: '9A', grade: 9, gender: 'Nữ' },
  { id: 'HS10', name: 'Hoàng Quốc Việt', className: '9A', grade: 9, gender: 'Nam' },
  { id: 'HS11', name: 'Ksor Thanh', className: '6A', grade: 6, gender: 'Nam' },
  { id: 'HS12', name: 'Bùi Ánh Dương', className: '6A', grade: 6, gender: 'Nữ' }
];

export const sampleExams: Exam[] = [
  {
    id: 'exam-phy-8-01',
    title: 'KTTX Số 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
    subject: 'physics',
    grade: 8,
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-10',
    questions: [
      // 16 MCQs (0.5 pts each)
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Đơn vị đo áp suất trong hệ đo lường SI là gì?',
        options: ['Pascal (Pa)', 'Newton (N)', 'Joule (J)', 'Kilôgam (kg)'],
        correctAnswer: 0,
        explanation: '1 Pa = 1 N/m².'
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Công thức tính áp suất chất lỏng tại độ sâu h là:',
        options: ['p = d.h', 'p = d / h', 'p = F / S', 'p = m.g.h'],
        correctAnswer: 0,
        explanation: 'Trong đó d là trọng lượng riêng của chất lỏng, h là chiều cao của cột chất lỏng.'
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Lực đẩy Archimedes tác dụng lên một vật nhúng trong chất lỏng có phương và chiều như thế nào?',
        options: [
          'Phương thẳng đứng, chiều từ dưới lên trên',
          'Phương thẳng đứng, chiều từ trên xuống dưới',
          'Phương nằm ngang, chiều từ trái sang phải',
          'Cùng phương và chiều với trọng lực'
        ],
        correctAnswer: 0,
        explanation: 'Lực đẩy Archimedes luôn có phương thẳng đứng, hướng từ dưới lên trên.'
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'Độ lớn của lực đẩy Archimedes được tính theo công thức nào?',
        options: ['FA = d.V', 'FA = P / V', 'FA = m.V', 'FA = d / V'],
        correctAnswer: 0,
        explanation: 'FA = d.V với V là thể tích phần chất lỏng bị vật chiếm chỗ.'
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        question: 'Vật sẽ chìm xuống trong chất lỏng khi nào?',
        options: ['P > FA (hoặc dvật > dchất lỏng)', 'P < FA', 'P = FA', 'dvật < dchất lỏng'],
        correctAnswer: 0,
        explanation: 'Khi trọng lượng lớn hơn lực đẩy Archimedes vật sẽ chìm.'
      },
      {
        id: 'q6',
        type: 'multiple_choice',
        question: 'Để tăng áp suất tác dụng lên mặt bị ép, người ta có thể làm cách nào sau đây?',
        options: [
          'Tăng áp lực và giảm diện tích bị ép',
          'Giảm áp lực và tăng diện tích bị ép',
          'Giữ nguyên áp lực và tăng diện tích bị ép',
          'Giảm cả áp lực và diện tích bị ép cùng tỉ lệ'
        ],
        correctAnswer: 0,
        explanation: 'Vì p = F/S nên tăng F và giảm S sẽ làm tăng p nhiều nhất.'
      },
      {
        id: 'q7',
        type: 'multiple_choice',
        question: 'Mũi đinh nhọn sắc để làm gì trong thực tế đời sống?',
        options: ['Giảm diện tích tiếp xúc để tăng áp suất dễ đóng vào gỗ', 'Tăng diện tích tiếp xúc để giảm áp suất', 'Giảm áp lực', 'Làm cho đinh nặng hơn'],
        correctAnswer: 0
      },
      {
        id: 'q8',
        type: 'multiple_choice',
        question: 'Tại sao khi lặn xuống biển sâu, người thợ lặn phải mặc áo lặn chuyên dụng chịu áp suất cao?',
        options: [
          'Vì càng xuống sâu thì áp suất nước biển càng lớn gây nguy hiểm',
          'Để chống lạnh và nhìn rõ sinh vật biển',
          'Để giảm lực cản của nước',
          'Để tăng lực đẩy Archimedes'
        ],
        correctAnswer: 0
      },
      {
        id: 'q9',
        type: 'multiple_choice',
        question: 'Trong bình thông nhau chứa cùng một chất lỏng đứng yên, các mực chất lỏng ở các nhánh luôn:',
        options: ['Ở cùng một độ cao', 'Nhánh to có mực nước cao hơn', 'Nhánh nhỏ có mực nước cao hơn', 'Tùy thuộc vào hình dạng nhánh'],
        correctAnswer: 0
      },
      {
        id: 'q10',
        type: 'multiple_choice',
        question: 'Một thỏi nhôm và một thỏi sắt có cùng thể tích được nhúng chìm hoàn toàn trong nước. So sánh lực đẩy Archimedes tác dụng lên hai thỏi:',
        options: ['FA tác dụng lên hai thỏi là như nhau', 'FA sắt lớn hơn', 'FA nhôm lớn hơn', 'Không xác định được'],
        correctAnswer: 0,
        explanation: 'Vì V như nhau và cùng chất lỏng nước nên FA = d.V bằng nhau.'
      },
      {
        id: 'q11',
        type: 'multiple_choice',
        question: 'Khí quyển có áp suất là do nguyên nhân nào sau đây?',
        options: ['Do không khí có trọng lượng', 'Do không khí chuyển động nhiệt hỗn loạn', 'Do bức xạ mặt trời', 'Do hơi nước bay lên'],
        correctAnswer: 0
      },
      {
        id: 'q12',
        type: 'multiple_choice',
        question: 'Áp suất khí quyển tiêu chuẩn ở ngang mực nước biển xấp xỉ bằng bao nhiêu mmHg?',
        options: ['760 mmHg', '100 mmHg', '500 mmHg', '1000 mmHg'],
        correctAnswer: 0
      },
      {
        id: 'q13',
        type: 'multiple_choice',
        question: 'Tàu ngầm lặn xuống hoặc nổi lên được là nhờ cơ chế nào?',
        options: [
          'Thay đổi lượng nước trong các khoang dằn để thay đổi trọng lượng tàu',
          'Thay đổi thể tích ngoài của tàu',
          'Tăng giảm công suất động cơ chân vịt',
          'Thả bớt hàng hóa ra ngoài'
        ],
        correctAnswer: 0
      },
      {
        id: 'q14',
        type: 'multiple_choice',
        question: 'Một vật nổi một phần trên mặt nước, độ lớn lực đẩy Archimedes bằng:',
        options: ['Trọng lượng của chính vật đó', 'Lớn hơn trọng lượng vật', 'Nhỏ hơn trọng lượng vật', 'Bằng 0'],
        correctAnswer: 0,
        explanation: 'Khi vật nổi cân bằng thì FA = P.'
      },
      {
        id: 'q15',
        type: 'multiple_choice',
        question: 'Dụng cụ dùng để đo áp suất khí quyển được gọi là:',
        options: ['Khí áp kế', 'Nhiệt kế', 'Lực kế', 'Vôn kế'],
        correctAnswer: 0
      },
      {
        id: 'q16',
        type: 'multiple_choice',
        question: 'Khi xách một xô nước trong không khí ta cảm thấy nặng hơn khi xô nước còn chìm trong nước là vì:',
        options: [
          'Trong nước có lực đẩy Archimedes hướng lên nâng đỡ xô nước',
          'Trong nước khối lượng của xô giảm đi',
          'Nước có tính nhớt',
          'Không khí có lực cản lớn hơn'
        ],
        correctAnswer: 0
      },
      // 1 True/False with 4 statements (1.0 pt)
      {
        id: 'q17',
        type: 'true_false',
        question: 'Cho thí nghiệm: Thả một viên bi đặc có thể tích 20 cm³ và khối lượng riêng 7800 kg/m³ vào một bình tràn đầy nước (trọng lượng riêng của nước dn = 10000 N/m³). Hãy xác định tính đúng/sai của các nhận định sau:',
        statements: [
          { subId: 'a', text: 'Viên bi sẽ chìm hoàn toàn xuống đáy bình.', isCorrect: true },
          { subId: 'b', text: 'Lực đẩy Archimedes tác dụng lên viên bi có độ lớn là 0.2 N.', isCorrect: true },
          { subId: 'c', text: 'Thể tích nước tràn ra khỏi bình là 40 cm³.', isCorrect: false },
          { subId: 'd', text: 'Nếu thay nước bằng dầu hỏa (d = 8000 N/m³), lực đẩy Archimedes lên viên bi sẽ tăng lên.', isCorrect: false }
        ],
        explanation: 'a Đúng vì dviên bi > dnước; b Đúng: FA = 10000 * 20*10^-6 = 0.2N; c Sai vì V tràn = V bi = 20cm³; d Sai vì ddầu < dnước nên FA giảm.'
      },
      // 1 Short answer (1.0 pt)
      {
        id: 'q18',
        type: 'short_answer',
        question: 'Một khối gỗ hình hộp chữ nhật diện tích đáy S = 50 cm² nhúng chìm trong nước ở độ sâu cách mặt thoáng h = 0.4 m. Biết trọng lượng riêng của nước là d = 10000 N/m². Tính áp suất của nước tác dụng lên đáy khối gỗ theo đơn vị Pascal (chỉ nhập giá trị số)?',
        acceptableAnswers: ['4000', '4000 Pa', '4.000'],
        unit: 'Pa',
        explanation: 'p = d.h = 10000 * 0.4 = 4000 Pa.'
      }
    ]
  },
  {
    id: 'exam-chem-8-01',
    title: 'KTTX Số 1 - Hóa học 8: Phản ứng hóa học, Định luật bảo toàn khối lượng và Mol',
    subject: 'chemistry',
    grade: 8,
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-11',
    questions: [
      {
        id: 'c1',
        type: 'multiple_choice',
        question: 'Dấu hiệu nào sau đây chắc chắn chứng tỏ có phản ứng hóa học xảy ra?',
        options: ['Có sự tạo thành chất mới có tính chất khác biệt', 'Chất chỉ đổi trạng thái từ rắn sang lỏng', 'Chất bị nghiền nhỏ', 'Chất hòa tan thành dung dịch'],
        correctAnswer: 0
      },
      {
        id: 'c2',
        type: 'multiple_choice',
        question: 'Nội dung của định luật bảo toàn khối lượng khẳng định:',
        options: [
          'Tổng khối lượng các chất sản phẩm bằng tổng khối lượng các chất phản ứng',
          'Khối lượng chất sản phẩm luôn lớn hơn chất tham gia',
          'Khối lượng chất sản phẩm luôn nhỏ hơn chất tham gia',
          'Số phân tử trước và sau phản ứng luôn luôn bằng nhau'
        ],
        correctAnswer: 0
      },
      {
        id: 'c3',
        type: 'multiple_choice',
        question: 'Một mol chất chứa bao nhiêu nguyên tử hoặc phân tử của chất đó (số Avogadro)?',
        options: ['6,022 × 10²³', '6,022 × 10²²', '6,022 × 10²⁴', '3,14 × 10²³'],
        correctAnswer: 0
      },
      {
        id: 'c4',
        type: 'multiple_choice',
        question: 'Ở điều kiện chuẩn (25 °C và 1 bar), 1 mol chất khí bất kì chiếm thể tích là bao nhiêu lít?',
        options: ['24,79 lít', '22,4 lít', '24,0 lít', '22,79 lít'],
        correctAnswer: 0,
        explanation: 'Theo chương trình KHTN mới theo chuẩn IUPAC là 24,79 lít ở 25°C, 1 bar.'
      },
      {
        id: 'c5',
        type: 'multiple_choice',
        question: 'Khối lượng mol của khí Carbon dioxide (CO₂) là:',
        options: ['44 g/mol', '28 g/mol', '32 g/mol', '18 g/mol'],
        correctAnswer: 0,
        explanation: 'M = 12 + 16*2 = 44 g/mol.'
      },
      {
        id: 'c6',
        type: 'multiple_choice',
        question: 'Tỉ khối của khí Methane (CH₄) so với không khí (Mkk ≈ 29) cho biết khí Methane:',
        options: ['Nhẹ hơn không khí (16/29)', 'Nặng hơn không khí', 'Nặng bằng không khí', 'Không so sánh được'],
        correctAnswer: 0
      },
      {
        id: 'c7',
        type: 'multiple_choice',
        question: 'Nung 100g CaCO₃ thu được 56g CaO và V lít khí CO₂. Theo định luật bảo toàn khối lượng, khối lượng CO₂ thu được là:',
        options: ['44 gam', '56 gam', '156 gam', '22 gam'],
        correctAnswer: 0,
        explanation: 'mCO₂ = 100 - 56 = 44 gam.'
      },
      {
        id: 'c8',
        type: 'multiple_choice',
        question: 'Hiện tượng nào sau đây là hiện tượng hóa học?',
        options: ['Đinh sắt để trong không khí ẩm bị gỉ sét', 'Băng tan chảy thành nước', 'Hòa tan muối ăn vào nước', 'Cắt đôi thanh nhôm'],
        correctAnswer: 0
      },
      {
        id: 'c9',
        type: 'multiple_choice',
        question: 'Hệ số cân bằng đúng của phương trình: Fe + O₂ → Fe₃O₄ là:',
        options: ['3Fe + 2O₂ → Fe₃O₄', 'Fe + O₂ → Fe₃O₄', '2Fe + 3O₂ → Fe₃O₄', '3Fe + O₂ → Fe₃O₄'],
        correctAnswer: 0
      },
      {
        id: 'c10',
        type: 'multiple_choice',
        question: 'Số mol của 5,6 gam sắt (Fe, M = 56 g/mol) là:',
        options: ['0,1 mol', '0,01 mol', '1 mol', '0,5 mol'],
        correctAnswer: 0
      },
      {
        id: 'c11',
        type: 'multiple_choice',
        question: 'Nồng độ mol (CM) của dung dịch được tính bằng công thức:',
        options: ['CM = n / V (lít)', 'CM = m / V', 'CM = n . V', 'CM = m chất tan / m dung dịch'],
        correctAnswer: 0
      },
      {
        id: 'c12',
        type: 'multiple_choice',
        question: 'Phản ứng tỏa nhiệt là phản ứng hóa học:',
        options: ['Giải phóng năng lượng dưới dạng nhiệt ra môi trường', 'Hấp thụ năng lượng nhiệt từ môi trường', 'Làm cho nhiệt độ môi trường giảm đi', 'Không làm thay đổi nhiệt độ'],
        correctAnswer: 0
      },
      {
        id: 'c13',
        type: 'multiple_choice',
        question: 'Để tăng tốc độ của một phản ứng giữa chất rắn và chất khí, ta có thể:',
        options: ['Tăng diện tích tiếp xúc của chất rắn', 'Giảm nhiệt độ', 'Giảm nồng độ', 'Dùng cục chất rắn có kích thước lớn'],
        correctAnswer: 0
      },
      {
        id: 'c14',
        type: 'multiple_choice',
        question: 'Công thức hóa học đúng của Acid Sulfuric là:',
        options: ['H₂SO₄', 'HCl', 'HNO₃', 'H₂SO₃'],
        correctAnswer: 0
      },
      {
        id: 'c15',
        type: 'multiple_choice',
        question: 'Chất chỉ thị màu giấy quỳ tím khi nhúng vào dung dịch kiềm (Base như NaOH) sẽ chuyển sang màu:',
        options: ['Xanh', 'Đỏ', 'Vàng', 'Không đổi màu'],
        correctAnswer: 0
      },
      {
        id: 'c16',
        type: 'multiple_choice',
        question: 'Kim loại nào sau đây phản ứng mãnh liệt với nước ở nhiệt độ thường sinh ra khí Hydrogen?',
        options: ['Natri (Na)', 'Đồng (Cu)', 'Vàng (Au)', 'Bạc (Ag)'],
        correctAnswer: 0
      },
      {
        id: 'c17',
        type: 'true_false',
        question: 'Đốt cháy hoàn toàn 6 gam Carbon (C) trong khí Oxygen dư thu được khí Carbon dioxide (CO₂). Cho biết: C = 12; O = 16. Xét tính đúng/sai của các phát biểu sau:',
        statements: [
          { subId: 'a', text: 'Số mol carbon tham gia phản ứng là 0,5 mol.', isCorrect: true },
          { subId: 'b', text: 'Phương trình hóa học xảy ra là: C + O₂ → CO₂.', isCorrect: true },
          { subId: 'c', text: 'Khối lượng khí CO₂ sinh ra là 44 gam.', isCorrect: false },
          { subId: 'd', text: 'Khí CO₂ thu được có thể tích ở đkc (25 °C, 1 bar) là 12,395 lít.', isCorrect: true }
        ],
        explanation: 'a Đúng (6/12=0.5 mol); b Đúng; c Sai (mCO₂ = 0.5 * 44 = 22g); d Đúng (V = 0.5 * 24.79 = 12.395 l).'
      },
      {
        id: 'c18',
        type: 'short_answer',
        question: 'Hòa tan hoàn toàn 2,4 gam Magie (Mg, M=24) vào dung dịch axit Clohiđric (HCl) dư thu được muối MgCl₂ và khí H₂. Tính khối lượng khí H₂ (theo gam) sinh ra sau phản ứng (chỉ nhập số)?',
        acceptableAnswers: ['0.2', '0,2', '0.2g', '0,2g'],
        unit: 'gam',
        explanation: 'nMg = 2.4/24 = 0.1 mol => nH₂ = 0.1 mol => mH₂ = 0.1 * 2 = 0.2 gam.'
      }
    ]
  },
  {
    id: 'exam-bio-8-01',
    title: 'KTTX Số 1 - Sinh học 8: Khái quát cơ thể người, Hệ vận động và Hệ tuần hoàn',
    subject: 'biology',
    grade: 8,
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-12',
    questions: [
      {
        id: 'b1',
        type: 'multiple_choice',
        question: 'Đơn vị cấu tạo và chức năng cơ bản của cơ thể sinh vật và cơ thể người là:',
        options: ['Tế bào', 'Mô', 'Cơ quan', 'Hệ cơ quan'],
        correctAnswer: 0
      },
      {
        id: 'b2',
        type: 'multiple_choice',
        question: 'Cơ quan nào sau đây thuộc hệ tuần hoàn ở người?',
        options: ['Tim và hệ mạch máu', 'Phổi và khí quản', 'Dạ dày và ruột', 'Thận và bàng quang'],
        correctAnswer: 0
      },
      {
        id: 'b3',
        type: 'multiple_choice',
        question: 'Xương có tính chất mềm dẻo và bền chắc là nhờ sự kết hợp hài hòa giữa hai thành phần nào?',
        options: ['Chất hữu cơ (cốt giao) và chất vô cơ (chất khoáng)', 'Chất béo và canxi', 'Nước và vitamin', 'Collagen và sắt'],
        correctAnswer: 0
      },
      {
        id: 'b4',
        type: 'multiple_choice',
        question: 'Khớp xương nào sau đây thuộc loại khớp động?',
        options: ['Khớp đầu gối', 'Khớp giữa các đốt sống', 'Khớp nối giữa các xương sọ', 'Khớp bán động chậu'],
        correctAnswer: 0
      },
      {
        id: 'b5',
        type: 'multiple_choice',
        question: 'Tế bào máu nào đóng vai trò chính trong việc vận chuyển khí Oxygen (O₂) và CO₂?',
        options: ['Hồng cầu', 'Bạch cầu', 'Tiểu cầu', 'Huyết tương'],
        correctAnswer: 0
      },
      {
        id: 'b6',
        type: 'multiple_choice',
        question: 'Chất nào trong hồng cầu tạo nên màu đỏ đặc trưng và có khả năng kết hợp thuận nghịch với O₂ và CO₂?',
        options: ['Hemoglobin (Hb)', 'Albumin', 'Fibrinogen', 'Globulin'],
        correctAnswer: 0
      },
      {
        id: 'b7',
        type: 'multiple_choice',
        question: 'Chức năng miễn dịch bảo vệ cơ thể khỏi các vi khuẩn, mầm bệnh xâm nhập là của loại tế bào máu nào?',
        options: ['Bạch cầu', 'Hồng cầu', 'Tiểu cầu', 'Tế bào cơ tim'],
        correctAnswer: 0
      },
      {
        id: 'b8',
        type: 'multiple_choice',
        question: 'Tiểu cầu có vai trò chính gì đối với sự sống của cơ thể người?',
        options: ['Tham gia vào quá trình đông máu chống mất máu khi bị thương', 'Tiêu hóa thức ăn', 'Dẫn truyền xung thần kinh', 'Điều hòa thân nhiệt'],
        correctAnswer: 0
      },
      {
        id: 'b9',
        type: 'multiple_choice',
        question: 'Nhóm máu nào được coi là nhóm máu chuyên cho trong hệ nhóm máu ABO?',
        options: ['Nhóm máu O', 'Nhóm máu AB', 'Nhóm máu A', 'Nhóm máu B'],
        correctAnswer: 0
      },
      {
        id: 'b10',
        type: 'multiple_choice',
        question: 'Nhóm máu nào có thể nhận được máu từ tất cả các nhóm máu trong hệ ABO khi cấp cứu?',
        options: ['Nhóm máu AB', 'Nhóm máu O', 'Nhóm máu A', 'Nhóm máu B'],
        correctAnswer: 0
      },
      {
        id: 'b11',
        type: 'multiple_choice',
        question: 'Tim người có cấu tạo gồm mấy ngăn?',
        options: ['4 ngăn (2 tâm nhĩ, 2 tâm thất)', '2 ngăn', '3 ngăn', '5 ngăn'],
        correctAnswer: 0
      },
      {
        id: 'b12',
        type: 'multiple_choice',
        question: 'Máu từ tâm thất trái được bơm vào đâu để đi nuôi khắp các cơ quan trong cơ thể?',
        options: ['Động mạch chủ', 'Động mạch phổi', 'Tĩnh mạch chủ', 'Tĩnh mạch phổi'],
        correctAnswer: 0
      },
      {
        id: 'b13',
        type: 'multiple_choice',
        question: 'Biện pháp nào sau đây giúp rèn luyện và bảo vệ hệ vận động phát triển khỏe mạnh?',
        options: [
          'Ngồi học đúng tư thế, thường xuyên tập thể dục vừa sức và ăn đủ canxi, vitamin D',
          'Ngồi cúi gập lưng sát mặt bàn',
          'Thường xuyên mang vác vật quá nặng lệch về một bên vai',
          'Hạn chế vận động tối đa'
        ],
        correctAnswer: 0
      },
      {
        id: 'b14',
        type: 'multiple_choice',
        question: 'Huyết áp là áp lực của dòng máu tác dụng lên đâu?',
        options: ['Thành mạch máu', 'Các van tim', 'Xương sườn', 'Hồng cầu'],
        correctAnswer: 0
      },
      {
        id: 'b15',
        type: 'multiple_choice',
        question: 'Vòng tuần hoàn nhỏ ở người có nhiệm vụ chính là:',
        options: [
          'Đưa máu đến phổi để trao đổi khí lấy O₂ và thải CO₂',
          'Đưa máu đi nuôi các mô tế bào khắp cơ thể',
          'Dẫn máu về thận để lọc nước tiểu',
          'Dẫn chất dinh dưỡng từ ruột về gan'
        ],
        correctAnswer: 0
      },
      {
        id: 'b16',
        type: 'multiple_choice',
        question: 'Khi bị gãy xương cẳng tay, sơ cứu ban đầu đúng đắn nhất là gì?',
        options: [
          'Cố định tạm thời đoạn xương gãy bằng nẹp rồi đưa ngay đến cơ sở y tế',
          'Cố gắng nắn bóp thật mạnh để xương về vị trí cũ',
          'Bôi dầu nóng xoa bóp liên tục',
          'Để học sinh tự do cử động tay'
        ],
        correctAnswer: 0
      },
      {
        id: 'b17',
        type: 'true_false',
        question: 'Khi nói về cấu tạo và hoạt động của hệ tuần hoàn ở người, hãy xác định tính đúng/sai của các nhận định dưới đây:',
        statements: [
          { subId: 'a', text: 'Máu chảy trong động mạch luôn luôn là máu giàu Oxygen (đỏ tươi).', isCorrect: false },
          { subId: 'b', text: 'Tâm thất trái có thành cơ tim dày nhất vì phải co bóp tống máu đi khắp vòng tuần hoàn lớn.', isCorrect: true },
          { subId: 'c', text: 'Mao mạch là nơi diễn ra sự trao đổi chất và trao đổi khí trực tiếp giữa máu và các tế bào.', isCorrect: true },
          { subId: 'd', text: 'Người có nhóm máu O trên bề mặt hồng cầu có cả hai kháng nguyên A và B.', isCorrect: false }
        ],
        explanation: 'a Sai vì động mạch phổi mang máu nghèo O₂; b Đúng; c Đúng; d Sai vì hồng cầu nhóm O không có kháng nguyên A và B.'
      },
      {
        id: 'b18',
        type: 'short_answer',
        question: 'Một người khỏe mạnh lúc nghỉ ngơi có nhịp tim trung bình là 75 nhịp/phút. Hỏi mỗi chu kì co dãn của tim (gồm pha nhĩ co, thất co và pha dãn chung) kéo dài bao nhiêu giây (chỉ ghi số thập phân)?',
        acceptableAnswers: ['0.8', '0,8', '0.8s', '0,8s'],
        unit: 'giây',
        explanation: 'Thời gian 1 chu kì tim = 60 / 75 = 0.8 giây.'
      }
    ]
  }
];

export const sampleSubmissions: StudentSubmission[] = [
  {
    id: 'sub-01',
    examId: 'exam-phy-8-01',
    examTitle: 'KTTX Số 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
    subject: 'physics',
    grade: 8,
    studentName: 'Đinh Thị Mai Lan',
    className: '8A',
    startedAt: '2026-09-12 08:00:00',
    submittedAt: '2026-09-12 08:12:45',
    timeSpentSeconds: 765,
    mcqScore: 8.0,
    tfScore: 1.0,
    saScore: 1.0,
    totalScore: 10.0,
    answers: {
      mcq: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0, q11: 0, q12: 0, q13: 0, q14: 0, q15: 0, q16: 0 },
      tf: { q17: { a: true, b: true, c: false, d: false } },
      sa: { q18: '4000' }
    }
  },
  {
    id: 'sub-02',
    examId: 'exam-chem-8-01',
    examTitle: 'KTTX Số 1 - Hóa học 8: Phản ứng hóa học, Định luật bảo toàn khối lượng và Mol',
    subject: 'chemistry',
    grade: 8,
    studentName: 'Nguyễn Văn Tuấn',
    className: '8A',
    startedAt: '2026-09-12 08:30:00',
    submittedAt: '2026-09-12 08:44:10',
    timeSpentSeconds: 850,
    mcqScore: 7.5,
    tfScore: 0.5,
    saScore: 1.0,
    totalScore: 9.0,
    answers: {
      mcq: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c8: 0, c9: 0, c10: 0, c11: 0, c12: 0, c13: 0, c14: 0, c15: 0, c16: 1 },
      tf: { c17: { a: true, b: true, c: true, d: true } },
      sa: { c18: '0.2' }
    }
  },
  {
    id: 'sub-03',
    examId: 'exam-bio-8-01',
    examTitle: 'KTTX Số 1 - Sinh học 8: Khái quát cơ thể người, Hệ vận động và Hệ tuần hoàn',
    subject: 'biology',
    grade: 8,
    studentName: 'Rơ Châm H’Yên',
    className: '8A',
    startedAt: '2026-09-12 09:00:00',
    submittedAt: '2026-09-12 09:13:30',
    timeSpentSeconds: 810,
    mcqScore: 8.0,
    tfScore: 1.0,
    saScore: 1.0,
    totalScore: 10.0,
    answers: {
      mcq: { b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, b6: 0, b7: 0, b8: 0, b9: 0, b10: 0, b11: 0, b12: 0, b13: 0, b14: 0, b15: 0, b16: 0 },
      tf: { b17: { a: false, b: true, c: true, d: false } },
      sa: { b18: '0.8' }
    }
  },
  {
    id: 'sub-04',
    examId: 'exam-phy-8-01',
    examTitle: 'KTTX Số 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
    subject: 'physics',
    grade: 8,
    studentName: 'Lê Hoàng Yến',
    className: '8B',
    startedAt: '2026-09-12 10:00:00',
    submittedAt: '2026-09-12 10:14:05',
    timeSpentSeconds: 845,
    mcqScore: 7.0,
    tfScore: 0.5,
    saScore: 1.0,
    totalScore: 8.5,
    answers: {
      mcq: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 1, q11: 0, q12: 0, q13: 0, q14: 0, q15: 0, q16: 0 },
      tf: { q17: { a: true, b: true, c: false, d: true } },
      sa: { q18: '4000' }
    }
  }
];

export const sampleLearningResources: LearningResource[] = [
  // 1. Góc học tập (Study Corner)
  {
    id: 'res-01',
    title: 'Sơ đồ tư duy: Cấu trúc nguyên tử và Bảng tuần hoàn các nguyên tố hóa học',
    subject: 'chemistry',
    grade: 7,
    category: 'study_corner',
    description: 'Tóm tắt trực quan hạt proton, neutron, electron; chu kì, nhóm và quy luật biến đổi tính chất kim loại phi kim.',
    date: '2026-09-01'
  },
  {
    id: 'res-02',
    title: 'Cẩm nang ghi nhớ: Định luật Ohm và các công thức mạch nối tiếp, song song',
    subject: 'physics',
    grade: 9,
    category: 'study_corner',
    description: 'Bản đồ khái niệm I = U/R, cách tính điện trở tương đương và ứng dụng giải bài tập thực tế.',
    date: '2026-09-02'
  },
  {
    id: 'res-03',
    title: 'Atlas sinh học: Cấu tạo tế bào nhân sơ và nhân thực',
    subject: 'biology',
    grade: 6,
    category: 'study_corner',
    description: 'Hình ảnh chi tiết các bào quan: màng sinh chất, tế bào chất, nhân, lục lạp, ti thể và vai trò sinh học.',
    date: '2026-09-03'
  },
  // 2. Bài tập về nhà (Homework)
  {
    id: 'res-04',
    title: 'Phiếu bài tập tuần 3: Đòn bẩy và ứng dụng trong cuộc sống thực tế Đak Pơ',
    subject: 'physics',
    grade: 8,
    category: 'homework',
    description: 'Bài tập vận dụng xác định điểm tựa, điểm đặt lực trong kéo gàu nước, bập bênh, kìm bấm.',
    date: '2026-09-08'
  },
  {
    id: 'res-05',
    title: 'Bài tập thực hành: Tính nồng độ phần trăm và nồng độ mol dung dịch NaCl',
    subject: 'chemistry',
    grade: 8,
    category: 'homework',
    description: 'Luyện tập giải toán pha chế dung dịch ứng dụng làm nước muối sinh lý.',
    date: '2026-09-09'
  },
  {
    id: 'res-06',
    title: 'Phiếu quan sát tại vườn nhà: Đa dạng thế giới thực vật và nấm tại Gia Lai',
    subject: 'biology',
    grade: 6,
    category: 'homework',
    description: 'Học sinh quan sát, chụp ảnh mẫu lá cây, phân loại rễ cọc rễ chùm và nộp nhật ký.',
    date: '2026-09-10'
  },
  // 3. Hướng dẫn soạn bài (Prep Guide)
  {
    id: 'res-07',
    title: 'Hướng dẫn soạn bài: Bài 12 - Ánh sáng và sự truyền ánh sáng (KNTT/CTST)',
    subject: 'physics',
    grade: 7,
    category: 'prep_guide',
    description: 'Trả lời các câu hỏi mở đầu, câu hỏi khám phá và chuẩn bị thí nghiệm bóng tối bóng nửa tối.',
    date: '2026-09-05'
  },
  {
    id: 'res-08',
    title: 'Hướng dẫn soạn bài: Bài 8 - Tốc độ phản ứng và chất xúc tác',
    subject: 'chemistry',
    grade: 8,
    category: 'prep_guide',
    description: 'Chuẩn bị câu hỏi tìm hiểu về enzyme tiêu hóa và yếu tố nhiệt độ bảo quản thực phẩm.',
    date: '2026-09-06'
  },
  {
    id: 'res-09',
    title: 'Hướng dẫn chuẩn bị bài: Bài 15 - Quang hợp ở thực vật và vai trò đối với sự sống',
    subject: 'biology',
    grade: 7,
    category: 'prep_guide',
    description: 'Tìm hiểu phương trình quang hợp, thí nghiệm chứng minh tinh bột và khí oxygen thoát ra.',
    date: '2026-09-07'
  },
  // 4. Sản phẩm số (Digital Products) - Cả GV và HS đều có thể đăng (Word, PDF, PPT, Ảnh, Video ngắn 1p)
  {
    id: 'res-10',
    title: 'Video ngắn 1 phút: Mô phỏng quá trình phân bào nguyên phân dưới kính hiển vi điện tử',
    subject: 'biology',
    grade: 9,
    category: 'digital_products',
    description: 'Video ngắn 58 giây ghi lại sinh động các kỳ nguyên phân (Kỳ đầu, kỳ giữa, kỳ sau, kỳ cuối) kèm chú thích khoa học.',
    date: '2026-08-25',
    authorName: 'Lê Hoàng Yến',
    authorRole: 'student',
    authorClass: '9A1',
    fileType: 'video',
    fileName: 'phan_bao_nguyen_phan_60s.mp4',
    fileSize: '12.4 MB',
    videoDurationSeconds: 58,
    grading: {
      score: 9.8,
      feedback: 'Sản phẩm video xuất sắc! Kỹ thuật biên tập video ngắn súc tích, hình ảnh hiển vi rõ nét, chú thích các kỳ phân bào cực kỳ chuẩn xác khoa học. Rất đáng khen ngợi!',
      gradedBy: 'Cô Đặng Thị Xuân Sang',
      teacherSubject: 'biology',
      gradedAt: '09:30 ngày 26/08/2026'
    },
    comments: [
      {
        id: 'cmt-p1',
        authorName: 'Đinh Thị Mai Lan',
        authorRole: 'student',
        authorClass: '8A1',
        content: 'Video của chị Yến làm xịn quá ạ! Xem xong 1 phút là hiểu bài ngay.',
        createdAt: '10:15 - 26/08/2026'
      }
    ]
  },
  {
    id: 'res-11',
    title: 'Báo cáo PPT: Dự án điều chế nước Javel và khử khuẩn trường học an toàn',
    subject: 'chemistry',
    grade: 8,
    category: 'digital_products',
    description: 'Bài thuyết trình PowerPoint 15 slide tóm tắt nguyên lý điện phân dung dịch NaCl có màng ngăn và không có màng ngăn, ứng dụng phòng chống dịch bệnh.',
    date: '2026-08-28',
    authorName: 'Rơ Châm H’Yên & Trần Gia Huy',
    authorRole: 'student',
    authorClass: '8A2',
    fileType: 'ppt',
    fileName: 'nuoc_javel_khu_khuan_8A2.pptx',
    fileSize: '8.2 MB',
    grading: {
      score: 9.5,
      feedback: 'Slide trình bày đẹp mắt, hình ảnh thực hành thí nghiệm tại phòng thực hành Y Đôn rất chân thực. Phương trình hóa học viết chuẩn.',
      gradedBy: 'Cô Nguyễn Thị Cẩm Lệ',
      teacherSubject: 'chemistry',
      gradedAt: '14:20 ngày 29/08/2026'
    },
    comments: []
  },
  {
    id: 'res-12',
    title: 'Tài liệu PDF: Cẩm nang 50 bài toán thực nghiệm Vật lí ứng dụng tại huyện Đak Pơ',
    subject: 'physics',
    grade: 7,
    category: 'digital_products',
    description: 'Tài liệu số hóa dạng PDF biên soạn các bài toán ứng dụng đo đạc đòn bẩy, máy cơ đơn giản và áp suất trong đời sống nông nghiệp địa phương.',
    date: '2026-09-01',
    authorName: 'Thầy Nguyễn Đình Hành',
    authorRole: 'admin',
    fileType: 'pdf',
    fileName: 'cam_nang_vat_li_thuc_nghiem_dakpo.pdf',
    fileSize: '5.6 MB',
    grading: {
      score: 10.0,
      feedback: 'Tài liệu chuyên môn mẫu mực của Tổ CM, có tính sư phạm cao và ứng dụng thực tiễn rất phong phú cho học sinh trường Y Đôn.',
      gradedBy: 'Thầy Nguyễn Đình Hành',
      teacherSubject: 'physics',
      gradedAt: '08:00 ngày 02/09/2026'
    },
    comments: [
      {
        id: 'cmt-p2',
        authorName: 'Phạm Ngọc Tiến',
        authorRole: 'admin',
        authorSubject: 'physics',
        content: 'Tài liệu rất hay và công phu, các em học sinh khối 7 nên tải về ôn tập nhé!',
        createdAt: '08:45 - 02/09/2026'
      }
    ]
  },
  {
    id: 'res-12b',
    title: 'File Word (.docx): Bảng thu hoạch quan sát tế bào thực vật và động vật',
    subject: 'biology',
    grade: 6,
    category: 'digital_products',
    description: 'Phiếu thu hoạch bài học điện tử định dạng Microsoft Word, có sẵn khung vẽ tế bào và bảng so sánh không bào, lục lạp, thành tế bào.',
    date: '2026-09-02',
    authorName: 'Nguyễn Văn Nam',
    authorRole: 'student',
    authorClass: '6A1',
    fileType: 'word',
    fileName: 'phieu_thu_hoach_te_bao_6A1.docx',
    fileSize: '1.8 MB',
    comments: []
  },
  // 5. Link công cụ số (Digital Tools)
  {
    id: 'res-13',
    title: 'PhET Interactive Simulations - Mô phỏng Vật lí & Hóa học tương tác',
    subject: 'physics',
    grade: 8,
    category: 'digital_tools',
    description: 'Phòng thí nghiệm ảo khám phá khúc xạ ánh sáng, lực đẩy, định luật Faraday và liên kết hóa học.',
    contentUrl: 'https://phet.colorado.edu/vi/',
    date: '2026-09-01'
  },
  {
    id: 'res-14',
    title: 'Ptable - Bảng tuần hoàn các nguyên tố hóa học động & trực quan hóa electron',
    subject: 'chemistry',
    grade: 8,
    category: 'digital_tools',
    description: 'Tra cứu cấu hình e, tính chất vật lí hóa học, đồng vị và mô hình 3D orbital.',
    contentUrl: 'https://ptable.com/?lang=vi',
    date: '2026-09-01'
  },
  {
    id: 'res-15',
    title: 'Virtual Microscope - Kính hiển vi quang học ảo và mẫu tiêu bản sinh học 3D',
    subject: 'biology',
    grade: 6,
    category: 'digital_tools',
    description: 'Thực hành điều chỉnh thị kính, vật kính x10, x40, x100 soi tế bào biểu bì vảy hành và giọt nước ao.',
    contentUrl: 'https://www.ncbionetwork.org/iet/microscope/',
    date: '2026-09-01'
  },
  // 6. Học sinh giỏi (HSG Prep)
  {
    id: 'res-16',
    title: 'Chuyên đề Bồi dưỡng HSG KHTN: Bài toán cơ học và nhiệt học nâng cao',
    subject: 'physics',
    grade: 9,
    category: 'hsg_prep',
    description: 'Bộ chuyên đề luyện thi chọn HSG cấp Huyện Đak Pơ và cấp Tỉnh Gia Lai môn KHTN (phần Vật lí).',
    date: '2026-09-04'
  },
  {
    id: 'res-17',
    title: 'Tuyển tập 25 đề thi HSG KHTN: Nhận biết, tách chất và bài toán bảo toàn electron',
    subject: 'chemistry',
    grade: 9,
    category: 'hsg_prep',
    description: 'Tài liệu độc quyền của Tổ Lí - Hóa - Sinh - CN, tuyển chọn các bài toán thực tiễn gắn với Tây Nguyên.',
    date: '2026-09-05'
  },
  {
    id: 'res-18',
    title: 'Chuyên đề HSG: Di truyền học Mendel và các quy luật biến dị sinh thái học',
    subject: 'biology',
    grade: 9,
    category: 'hsg_prep',
    description: 'Phương pháp giải nhanh bài toán lai 1 cặp, 2 cặp tính trạng và sơ đồ phả hệ.',
    date: '2026-09-06'
  }
];

export const schoolYearOptions = [
  '2026-2027',
  '2027-2028',
  '2028-2029',
  '2029-2030',
  '2030-2031',
  '2031-2032'
];

export const schoolClasses = [
  '6A1', '6A2', '6A3',
  '7A1', '7A2', '7A3',
  '8A1', '8A2', '8A3',
  '9A1', '9A2', '9A3'
];

export interface AdminAccountInfo {
  teacherName: string;
  username: string; // 'Admin'
  passwordHash: string; // The specific passwords required
}

export const adminAccounts: AdminAccountInfo[] = [
  {
    teacherName: 'Nguyễn Thị Cẩm Lệ',
    username: 'Admin',
    passwordHash: '333@ydon'
  },
  {
    teacherName: 'Phạm Ngọc Tiến',
    username: 'Admin',
    passwordHash: '666@ydon'
  },
  {
    teacherName: 'Nguyễn Đình Hành',
    username: 'Admin',
    passwordHash: '888@ydon'
  },
  {
    teacherName: 'Đặng Thị Xuân Sang',
    username: 'Admin',
    passwordHash: '999@ydon'
  }
];

export const sampleExemplaryPosts = [
  {
    id: 'exp-01',
    studentName: 'Đinh Thị Mai Lan',
    className: '8A1',
    grade: 8 as const,
    title: 'Giải Nhất Hội thi Thí nghiệm KHTN cấp Huyện Đak Pơ',
    achievement: 'Giải Nhất Thí nghiệm KHTN cấp Huyện & Điểm 10 KTTX môn Hóa học',
    content: 'Em Đinh Thị Mai Lan luôn có niềm đam mê đặc biệt với các hiện tượng hóa học và phản ứng biến đổi chất. Với sự hướng dẫn tận tâm của Cô Nguyễn Thị Cẩm Lệ, Mai Lan đã xuất sắc hoàn thành phần thi thực hành xác định nồng độ dung dịch và đạt điểm số tuyệt đối.',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-10',
    author: 'Tổ Lí - Hóa - Sinh - CN',
    category: 'olympic' as const
  },
  {
    id: 'exp-02',
    studentName: 'Rơ Châm H’Yên & Trần Gia Huy',
    className: '8A2',
    grade: 8 as const,
    title: 'Dự án Sáng tạo KHKT: Thiết bị lọc nước sinh hoạt thông minh cho buôn làng',
    achievement: 'Giải Nhì Cuộc thi Sáng tạo KHKT cấp Trường 2026-2027',
    content: 'Dưới sự bảo trợ của Thầy Nguyễn Đình Hành, nhóm học sinh đã ứng dụng kiến thức về sự thẩm thấu và vật liệu hấp phụ để chế tạo mô hình bình lọc nước từ cát thạch anh, than hoạt tính từ gáo dừa địa phương, góp phần bảo vệ sức khỏe cộng đồng.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-08',
    author: 'Thầy Nguyễn Đình Hành',
    category: 'khkt' as const
  },
  {
    id: 'exp-03',
    studentName: 'Lê Hoàng Yến',
    className: '9A1',
    grade: 9 as const,
    title: 'Gương sáng vượt khó: Thủ khoa vòng chọn Đội tuyển HSG Tỉnh Gia Lai môn Sinh học',
    achievement: 'Giải Nhất HSG KHTN Cấp Huyện - Đội trưởng đội tuyển HSG môn Sinh học',
    content: 'Hoàng Yến là tấm gương tự học kiên trì, say mê nghiên cứu cấu trúc tế bào và di truyền học. Cô Đặng Thị Xuân Sang đánh giá cao tinh thần tự học, khả năng lập luận sắc bén và đức tính khiêm tốn của em.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-05',
    author: 'Cô Đặng Thị Xuân Sang',
    category: 'good_student' as const
  }
];

