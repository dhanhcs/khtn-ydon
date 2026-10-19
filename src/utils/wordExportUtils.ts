/**
 * Tiện ích tạo và xuất File Mẫu Đề Kiểm Tra định dạng Microsoft Word (.docx / .doc / .txt)
 * Trường THCS và THPT Y Đôn
 * Cấu trúc chuẩn Ma trận Đề kiểm tra thường xuyên GDPT 2018 (Tổng 10 điểm):
 * - Phần 1: Trắc nghiệm nhiều lựa chọn (16 câu, 8 điểm - mỗi câu 0.5 điểm)
 * - Phần 2: Trắc nghiệm đúng sai (1 câu, 4 nhận định, mức độ thông hiểu, 1 điểm)
 * - Phần 3: Trả lời ngắn (1 câu, 2 chỗ điền số, mức vận dụng thấp, 1 điểm)
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle,
  ShadingType
} from 'docx';
import { SubjectType } from '../types';

export interface ExamTemplateData {
  title: string;
  grade: number;
  subject: SubjectType;
  durationMinutes: number;
  mcqs: Array<{
    num: number;
    question: string;
    options: [string, string, string, string];
    correctLetter: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }>;
  tf: {
    num: number;
    prompt: string;
    statements: Array<{ sub: 'a' | 'b' | 'c' | 'd'; text: string; answer: 'Đúng' | 'Sai' }>;
    explanation: string;
  };
  sa: {
    num: number;
    prompt: string;
    blank1: string;
    blank2: string;
    explanation: string;
  };
}

export function getExamTemplateData(subject: SubjectType | 'all' = 'physics'): ExamTemplateData {
  const isChem = subject === 'chemistry';
  const isBio = subject === 'biology';

  if (isChem) {
    return {
      title: 'Đề 2 - Hóa học 8: Phản ứng hóa học, Định luật bảo toàn khối lượng và Mol',
      grade: 8,
      subject: 'chemistry',
      durationMinutes: 15,
      mcqs: [
        {
          num: 1,
          question: 'Dấu hiệu chính xác nhất chứng tỏ có phản ứng hóa học xảy ra là gì?',
          options: [
            'Có chất mới sinh ra với tính chất khác chất ban đầu',
            'Chất chỉ bị biến đổi hình dạng bên ngoài',
            'Chất chỉ chuyển từ thể lỏng sang thể hơi',
            'Thể tích của hệ tăng nhẹ'
          ],
          correctLetter: 'A',
          explanation: 'Phản ứng hóa học là quá trình biến đổi chất này thành chất khác có tính chất mới.'
        },
        {
          num: 2,
          question: 'Trong một phản ứng hóa học, đại lượng nào sau đây luôn được bảo toàn?',
          options: [
            'Số phân tử của mỗi chất',
            'Tổng khối lượng các chất và số nguyên tử của mỗi nguyên tố',
            'Thể tích của các chất khí',
            'Màu sắc của các chất'
          ],
          correctLetter: 'B',
          explanation: 'Theo định luật bảo toàn khối lượng, số nguyên tử mỗi nguyên tố không đổi nên khối lượng được bảo toàn.'
        },
        {
          num: 3,
          question: 'Một mol chất chứa bao nhiêu hạt vi mô (nguyên tử hoặc phân tử)?',
          options: [
            '6,022 × 10²³ hạt (Hằng số Avogadro)',
            '6,022 × 10²² hạt',
            '1,0 × 10²³ hạt',
            '3,14 × 10²³ hạt'
          ],
          correctLetter: 'A',
          explanation: 'Số Avogadro N_A ≈ 6,022 × 10²³ hạt/mol.'
        },
        {
          num: 4,
          question: 'Khối lượng mol (M) của khí Oxygen (O₂) là bao nhiêu g/mol? (Cho O = 16)',
          options: ['16 g/mol', '32 g/mol', '8 g/mol', '64 g/mol'],
          correctLetter: 'B',
          explanation: 'M(O₂) = 16 × 2 = 32 g/mol.'
        },
        {
          num: 5,
          question: 'Ở điều kiện chuẩn (25°C và 1 bar), thể tích mol của một mol chất khí bất kì là:',
          options: ['22,4 lít', '24,79 lít', '24,0 lít', '25,0 lít'],
          correctLetter: 'B',
          explanation: 'Theo quy chuẩn SGK GDPT 2018, thể tích mol chất khí ở đkc là 24,79 L.'
        },
        {
          num: 6,
          question: 'Công thức tính số mol (n) khi biết khối lượng chất (m) và khối lượng mol (M) là:',
          options: ['n = m / M', 'n = m × M', 'n = M / m', 'm = n / M'],
          correctLetter: 'A',
          explanation: 'n = m / M (mol).'
        },
        {
          num: 7,
          question: 'Đốt cháy hoàn toàn 2,4 g Magie (Mg) trong khí oxy thu được 4,0 g Magie oxit (MgO). Khối lượng oxy đã tham gia phản ứng là:',
          options: ['1,6 g', '2,0 g', '1,4 g', '6,4 g'],
          correctLetter: 'A',
          explanation: 'm(O₂) = m(MgO) - m(Mg) = 4,0 - 2,4 = 1,6 g.'
        },
        {
          num: 8,
          question: 'Khí nào sau đây nhẹ hơn không khí (khối lượng mol trung bình không khí ≈ 29 g/mol)?',
          options: ['CO₂ (M = 44)', 'O₂ (M = 32)', 'CH₄ (M = 16)', 'SO₂ (M = 64)'],
          correctLetter: 'C',
          explanation: 'M(CH₄) = 16 < 29 nên nhẹ hơn không khí.'
        },
        {
          num: 9,
          question: 'Phản ứng tỏa nhiệt là phản ứng có đặc điểm gì sau đây?',
          options: [
            'Giải phóng năng lượng dưới dạng nhiệt ra môi trường xung quanh',
            'Hấp thu năng lượng nhiệt làm môi trường lạnh đi',
            'Không làm thay đổi nhiệt độ của hệ',
            'Chỉ xảy ra khi có ánh sáng mặt trời chiếu vào'
          ],
          correctLetter: 'A',
          explanation: 'Phản ứng tỏa nhiệt giải phóng nhiệt năng ra môi trường.'
        },
        {
          num: 10,
          question: 'Quá trình nào sau đây là một phản ứng thu nhiệt?',
          options: [
            'Nung đá vôi (CaCO₃) thành vôi sống (cần cấp nhiệt liên tục)',
            'Đốt cháy khí gas khi nấu ăn',
            'Đốt cồn y tế trong đĩa sứ',
            'Than đá cháy rực trong lò sưởi'
          ],
          correctLetter: 'A',
          explanation: 'Nung đá vôi cần cấp nhiệt lượng lớn và liên tục.'
        },
        {
          num: 11,
          question: 'Số mol của 5,6 gam kim loại Sắt (Fe) là bao nhiêu? (Biết M_Fe = 56 g/mol)',
          options: ['0,1 mol', '0,2 mol', '0,05 mol', '1,0 mol'],
          correctLetter: 'A',
          explanation: 'n = 5,6 / 56 = 0,1 mol.'
        },
        {
          num: 12,
          question: 'Thể tích ở điều kiện chuẩn (25°C, 1 bar) của 0,2 mol khí Hydrogen (H₂) là:',
          options: ['4,958 lít', '4,48 lít', '2,479 lít', '5,6 lít'],
          correctLetter: 'A',
          explanation: 'V = n × 24,79 = 0,2 × 24,79 = 4,958 lít.'
        },
        {
          num: 13,
          question: 'Để tăng tốc độ của phản ứng hóa học, ta có thể áp dụng biện pháp nào sau đây?',
          options: [
            'Tăng nhiệt độ, tăng diện tích tiếp xúc và dùng chất xúc tác phù hợp',
            'Giảm nồng độ các chất tham gia',
            'Làm lạnh nhanh bình phản ứng',
            'Để chất rắn ở dạng khối to nguyên vẹn'
          ],
          correctLetter: 'A',
          explanation: 'Tăng nhiệt độ, nồng độ, diện tích tiếp xúc và dùng xúc tác làm tăng tốc độ phản ứng.'
        },
        {
          num: 14,
          question: 'Chất xúc tác có vai trò quan trọng nào trong phản ứng hóa học?',
          options: [
            'Làm tăng tốc độ phản ứng nhưng không bị tiêu hao sau phản ứng',
            'Làm giảm khối lượng chất sản phẩm tạo thành',
            'Làm phản ứng ngừng lại ngay lập tức',
            'Bị biến đổi hoàn toàn thành chất khác'
          ],
          correctLetter: 'A',
          explanation: 'Chất xúc tác thúc đẩy phản ứng diễn ra nhanh hơn và không bị tiêu hao sau phản ứng.'
        },
        {
          num: 15,
          question: 'Nồng độ mol (CM) của dung dịch được xác định bằng công thức nào?',
          options: ['CM = n / V (mol/lít)', 'CM = m / V', 'CM = V / n', 'CM = n × V'],
          correctLetter: 'A',
          explanation: 'CM = n / V_dd (mol/lít hoặc M).'
        },
        {
          num: 16,
          question: 'Dung dịch nào sau đây làm quỳ tím chuyển sang màu đỏ đặc trưng?',
          options: ['Dung dịch axit clohiđric (HCl)', 'Dung dịch kiềm NaOH', 'Dung dịch muối ăn NaCl', 'Nước cất tinh khiết'],
          correctLetter: 'A',
          explanation: 'Dung dịch axit làm quỳ tím hóa đỏ.'
        }
      ],
      tf: {
        num: 17,
        prompt: 'Xét phản ứng phân hủy thuốc tím (KMnO₄) khi đun nóng trong phòng thí nghiệm thu được khí Oxygen: 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑. Hãy đánh giá tính Đúng/Sai của các nhận định sau:',
        statements: [
          { sub: 'a', text: 'Đây là phản ứng phân hủy vì từ một chất ban đầu sinh ra nhiều chất mới.', answer: 'Đúng' },
          { sub: 'b', text: 'Khí Oxygen thu được có thể nhận biết bằng tàn đóm đỏ (làm que đóm bùng cháy).', answer: 'Đúng' },
          { sub: 'c', text: 'Tổng khối lượng chất rắn sau phản ứng luôn bằng đúng khối lượng KMnO₄ ban đầu.', answer: 'Sai' },
          { sub: 'd', text: 'Số nguyên tử của mỗi nguyên tố trước và sau phản ứng luôn được bảo toàn.', answer: 'Đúng' }
        ],
        explanation: 'Ý a, b, d đúng. Ý c sai vì có khí O₂ bay ra khỏi bình nên khối lượng chất rắn còn lại nhỏ hơn khối lượng ban đầu.'
      },
      sa: {
        num: 18,
        prompt: 'Cho 6,5 gam kim loại Kẽm (Zn) tác dụng hoàn toàn với dung dịch axit clohiđric (HCl) dư theo phương trình: Zn + 2HCl → ZnCl₂ + H₂↑. Cho khối lượng mol của Zn = 65 g/mol.\n(1) Tính số mol kim loại Kẽm (Zn) đã tham gia phản ứng (theo đơn vị mol)?\n(2) Tính thể tích khí Hydrogen (H₂) thu được ở điều kiện chuẩn (25°C, 1 bar) theo đơn vị lít (lấy 3 chữ số thập phân)?',
        blank1: '0.1',
        blank2: '2.479',
        explanation: 'Chỗ điền 1: n_Zn = 6,5 / 65 = 0,1 mol (0.5 điểm).\nChỗ điền 2: V_H₂ = 0,1 × 24,79 = 2,479 lít (0.5 điểm).'
      }
    };
  }

  if (isBio) {
    return {
      title: 'Đề 3 - Sinh học 8: Hệ tuần hoàn, máu và miễn dịch cơ thể',
      grade: 8,
      subject: 'biology',
      durationMinutes: 15,
      mcqs: [
        {
          num: 1,
          question: 'Đơn vị cấu trúc và chức năng cơ bản của mọi cơ thể sống là gì?',
          options: ['Tế bào', 'Mô', 'Cơ quan', 'Hệ cơ quan'],
          correctLetter: 'A',
          explanation: 'Mọi sinh vật đều được cấu tạo từ một hoặc nhiều tế bào.'
        },
        {
          num: 2,
          question: 'Bào quan nào sau đây đóng vai trò là "nhà máy năng lượng" của tế bào?',
          options: ['Ti thể (Mitochondria)', 'Không bào', 'Lưới nội chất', 'Bộ máy Golgi'],
          correctLetter: 'A',
          explanation: 'Ti thể hô hấp tế bào để giải phóng năng lượng ATP.'
        },
        {
          num: 3,
          question: 'Quá trình quang hợp ở thực vật diễn ra chủ yếu ở bào quan nào?',
          options: ['Lục lạp (Chứa diệp lục)', 'Ti thể', 'Nhân tế bào', 'Màng sinh chất'],
          correctLetter: 'A',
          explanation: 'Lục lạp hấp thụ ánh sáng để quang hợp tổng hợp chất hữu cơ.'
        },
        {
          num: 4,
          question: 'Máu người gồm hai thành phần chính cấu thành là:',
          options: ['Huyết tương (khoảng 55%) và các tế bào máu (khoảng 45%)', 'Nước và hồng cầu', 'Huyết thanh và bạch cầu', 'Tiểu cầu và lipid'],
          correctLetter: 'A',
          explanation: 'Máu gồm huyết tương và các tế bào máu.'
        },
        {
          num: 5,
          question: 'Loại tế bào máu có chức năng chính vận chuyển oxy (O₂) và CO₂ trong cơ thể là:',
          options: ['Hồng cầu (Chứa hemoglobin)', 'Bạch cầu', 'Tiểu cầu', 'Tế bào lympho'],
          correctLetter: 'A',
          explanation: 'Hồng cầu chứa hemoglobin kết hợp thuận nghịch với oxy và CO₂.'
        },
        {
          num: 6,
          question: 'Trái tim người bình thường có cấu tạo gồm mấy ngăn (buồng tim)?',
          options: ['4 ngăn (2 tâm nhĩ và 2 tâm thất)', '2 ngăn', '3 ngăn', '5 ngăn'],
          correctLetter: 'A',
          explanation: 'Tim người có 4 ngăn: tâm nhĩ phải, tâm nhĩ trái, tâm thất phải, tâm thất trái.'
        },
        {
          num: 7,
          question: 'Quá trình tiêu hóa hóa học thức ăn bắt đầu sớm nhất tại cơ quan nào trong ống tiêu hóa?',
          options: ['Khoang miệng (Nhờ enzyme amylase nước bọt)', 'Dạ dày', 'Ruột non', 'Thực quản'],
          correctLetter: 'A',
          explanation: 'Amylase nước bọt phân giải tinh bột chín thành đường maltose tại miệng.'
        },
        {
          num: 8,
          question: 'Ở người, chất dinh dưỡng được hấp thụ chủ yếu vào máu tại bộ phận nào?',
          options: ['Ruột non (Nhờ hệ thống lông ruột)', 'Dạ dày', 'Ruột già', 'Thực quản'],
          correctLetter: 'A',
          explanation: 'Ruột non có bề mặt hấp thụ lớn và nhiều mao mạch.'
        },
        {
          num: 9,
          question: 'Cơ quan nào đóng vai trò thực hiện trao đổi khí chính của hệ hô hấp ở người?',
          options: ['Phổi (Các phế nang)', 'Khí quản', 'Thanh quản', 'Khoang mũi'],
          correctLetter: 'A',
          explanation: 'Phế nang là nơi diễn ra khuếch tán O₂ và CO₂ với máu.'
        },
        {
          num: 10,
          question: 'Tuyến nội tiết nào được ví như "nhạc trưởng" điều hòa hoạt động của các tuyến nội tiết khác?',
          options: ['Tuyến yên (Pituitary gland)', 'Tuyến giáp', 'Tuyến tụy', 'Tuyến thượng thận'],
          correctLetter: 'A',
          explanation: 'Tuyến yên tiết các hormone kích thích các tuyến nội tiết khác.'
        },
        {
          num: 11,
          question: 'Đặc điểm nào sau đây giúp bề mặt phổi trao đổi khí đạt hiệu quả tối ưu nhất?',
          options: ['Có hàng trăm triệu phế nang tạo diện tích bề mặt rất rộng lớn', 'Phế nang có thành dày nhiều lớp', 'Không có mạch máu bao quanh', 'Có dịch đờm đặc bao phủ'],
          correctLetter: 'A',
          explanation: 'Diện tích tiếp xúc rộng giúp khuếch tán khí nhanh chóng.'
        },
        {
          num: 12,
          question: 'Nhóm máu nào sau đây được gọi là nhóm máu chuyên cho trong hệ nhóm máu ABO?',
          options: ['Nhóm máu O (Không có kháng nguyên A và B trên hồng cầu)', 'Nhóm máu AB', 'Nhóm máu A', 'Nhóm máu B'],
          correctLetter: 'A',
          explanation: 'Nhóm máu O không có kháng nguyên A, B nên không bị ngưng kết khi truyền cho các nhóm khác.'
        },
        {
          num: 13,
          question: 'Khi cơ thể bị vết thương chảy máu, quá trình đông máu có tác dụng sinh học gì?',
          options: ['Ngăn cản sự mất máu liên tục và bảo vệ cơ thể', 'Làm hạ huyết áp', 'Tăng tốc độ tuần hoàn máu', 'Làm tan các tế bào máu'],
          correctLetter: 'A',
          explanation: 'Đông máu giúp bịt kín vết thương để tránh mất máu.'
        },
        {
          num: 14,
          question: 'Tiêm vắc xin (vaccine) phòng bệnh có tác dụng gì đối với cơ thể người?',
          options: ['Kích thích hệ miễn dịch chủ động sinh ra kháng thể đặc hiệu', 'Tiêu diệt vi khuẩn ngay lập tức', 'Cung cấp năng lượng trực tiếp cho tế bào', 'Làm tăng nhiệt độ cơ thể vĩnh viễn'],
          correctLetter: 'A',
          explanation: 'Vắc xin kích hoạt phản ứng miễn dịch tạo trí nhớ miễn dịch và kháng thể.'
        },
        {
          num: 15,
          question: 'Cơ quan nào sau đây là nơi lọc máu và hình thành nước tiểu ở người?',
          options: ['Thận (Đơn vị thận - Nephron)', 'Bóng đái (Bàng quang)', 'Ống dẫn nước tiểu', 'Gan'],
          correctLetter: 'A',
          explanation: 'Thận lọc máu để tạo thành nước tiểu đầu và nước tiểu chính thức.'
        },
        {
          num: 16,
          question: 'Huyết áp ở người bình thường khi nghỉ ngơi thường ở mức khoảng bao nhiêu?',
          options: ['110 - 120 / 70 - 80 mmHg', '180 / 120 mmHg', '60 / 40 mmHg', '200 / 100 mmHg'],
          correctLetter: 'A',
          explanation: 'Huyết áp chuẩn của thanh thiếu niên/người lớn bình thường khoảng 120/80 mmHg.'
        }
      ],
      tf: {
        num: 17,
        prompt: 'Khi tìm hiểu về hệ tuần hoàn máu và các biện pháp bảo vệ tim mạch, hãy đánh giá tính Đúng/Sai của các nhận định sau:',
        statements: [
          { sub: 'a', text: 'Vận tốc máu chảy trong mao mạch là chậm nhất giúp quá trình trao đổi chất diễn ra hiệu quả.', answer: 'Đúng' },
          { sub: 'b', text: 'Huyết áp trong hệ mạch giảm dần từ động mạch đến mao mạch và thấp nhất ở tĩnh mạch.', answer: 'Đúng' },
          { sub: 'c', text: 'Ăn nhiều muối, mỡ động vật và lười vận động là những yếu tố nguy cơ dẫn đến bệnh tăng huyết áp.', answer: 'Đúng' },
          { sub: 'd', text: 'Hệ tuần hoàn nhỏ vận chuyển máu giàu oxy đi nuôi tất cả các tế bào trong cơ thể.', answer: 'Sai' }
        ],
        explanation: 'Ý a, b, c đúng. Ý d sai vì hệ tuần hoàn lớn mới đưa máu giàu oxy đi nuôi các cơ quan; hệ tuần hoàn nhỏ đưa máu lên phổi để trao đổi O₂ và CO₂.'
      },
      sa: {
        num: 18,
        prompt: 'Ở một người trưởng thành khỏe mạnh bình thường khi nghỉ ngơi, tim đập trung bình khoảng 75 nhịp mỗi phút (chu kỳ tim kéo dài 0,8 giây). Mỗi lần tâm thất co bóp tống vào động mạch chủ một lượng máu khoảng 70 mL.\n(1) Tính số pha hoạt động trong một chu kỳ co dãn của tim (pha co tâm nhĩ, co tâm thất, dãn chung)?\n(2) Tính lưu lượng máu (lượng máu tim bơm đi) trong thời gian 1 phút theo đơn vị mililít (mL)?',
        blank1: '3',
        blank2: '5250',
        explanation: 'Chỗ điền 1: Mỗi chu kỳ tim gồm đúng 3 pha: co tâm nhĩ (0,1s), co tâm thất (0,3s) và dãn chung (0,4s) → Nhập: 3 (0.5 điểm).\nChỗ điền 2: Lưu lượng máu trong 1 phút: Q = 75 × 70 = 5250 mL (0.5 điểm).'
      }
    };
  }

  // Default: Physics 8
  return {
    title: 'Đề 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
    grade: 8,
    subject: 'physics',
    durationMinutes: 15,
    mcqs: [
      {
        num: 1,
        question: 'Đơn vị đo của áp suất trong hệ đo lường quốc tế SI là gì?',
        options: ['Newton (N)', 'Pascal (Pa)', 'Joule (J)', 'Kilôgam (kg)'],
        correctLetter: 'B',
        explanation: 'Đơn vị chuẩn của áp suất là Pascal (Pa), tương đương 1 N/m².'
      },
      {
        num: 2,
        question: 'Công thức tính áp suất chất lỏng tại một điểm có độ sâu h là gì?',
        options: ['p = d . h', 'p = d / h', 'p = h / d', 'p = d + h'],
        correctLetter: 'A',
        explanation: 'Áp suất chất lỏng p = d . h, với d là trọng lượng riêng, h là độ sâu.'
      },
      {
        num: 3,
        question: 'Một vật chìm hoàn toàn trong chất lỏng chịu lực đẩy Archimedes có phương và chiều như thế nào?',
        options: [
          'Phương thẳng đứng, chiều từ dưới lên trên',
          'Phương thẳng đứng, chiều từ trên xuống dưới',
          'Phương nằm ngang, chiều từ trái sang phải',
          'Cùng hướng với trọng lực'
        ],
        correctLetter: 'A',
        explanation: 'Lực đẩy Archimedes luôn có phương thẳng đứng hướng từ dưới lên trên.'
      },
      {
        num: 4,
        question: 'Độ lớn của lực đẩy Archimedes được tính theo công thức nào?',
        options: ['FA = d . V', 'FA = P / V', 'FA = m . V', 'FA = d / V'],
        correctLetter: 'A',
        explanation: 'FA = d . V, với V là thể tích phần chất lỏng bị vật chiếm chỗ.'
      },
      {
        num: 5,
        question: 'Vật sẽ chìm xuống trong chất lỏng khi nào?',
        options: ['P > FA (hoặc dvật > dchất lỏng)', 'P < FA', 'P = FA', 'dvật < dchất lỏng'],
        correctLetter: 'A',
        explanation: 'Khi trọng lượng lớn hơn lực đẩy Archimedes vật sẽ chìm xuống đáy.'
      },
      {
        num: 6,
        question: 'Để tăng áp suất tác dụng lên mặt bị ép, người ta có thể làm cách nào?',
        options: [
          'Tăng áp lực và giảm diện tích bị ép',
          'Giảm áp lực và tăng diện tích bị ép',
          'Giữ nguyên áp lực và tăng diện tích bị ép',
          'Giảm cả áp lực và diện tích bị ép'
        ],
        correctLetter: 'A',
        explanation: 'Vì p = F/S nên tăng F và giảm S làm áp suất tăng mạnh nhất.'
      },
      {
        num: 7,
        question: 'Mũi đinh nhọn sắc để làm gì trong thực tế đời sống?',
        options: [
          'Giảm diện tích tiếp xúc để tăng áp suất dễ đóng vào gỗ',
          'Tăng diện tích tiếp xúc để giảm áp suất',
          'Giảm áp lực',
          'Làm cho đinh nặng hơn'
        ],
        correctLetter: 'A',
        explanation: 'Đầu nhọn giảm diện tích S giúp tăng áp suất p dễ đóng vào vật.'
      },
      {
        num: 8,
        question: 'Một người đứng trên sàn nhà bằng hai chân tạo áp suất p. Khi co một chân lên thì áp suất tác dụng lên sàn sẽ:',
        options: ['Tăng lên gấp đôi', 'Giảm đi một nửa', 'Không thay đổi', 'Bằng 0'],
        correctLetter: 'A',
        explanation: 'Diện tích tiếp xúc giảm một nửa trong khi áp lực P không đổi nên p tăng gấp đôi.'
      },
      {
        num: 9,
        question: 'Trong bình thông nhau chứa cùng một chất lỏng đứng yên, các mực chất lỏng ở các nhánh luôn:',
        options: ['Ở cùng một độ cao', 'Nhánh to cao hơn nhánh nhỏ', 'Nhánh nhỏ cao hơn nhánh to', 'Thay đổi liên tục'],
        correctLetter: 'A',
        explanation: 'Đặc điểm bình thông nhau chứa một chất lỏng đứng yên là mực chất lỏng ở các nhánh luôn ngang nhau.'
      },
      {
        num: 10,
        question: 'Khí quyển có áp suất là do nguyên nhân nào sau đây?',
        options: ['Do không khí có trọng lượng', 'Do không khí chuyển động nhiệt', 'Do bức xạ mặt trời', 'Do hơi nước bay lên'],
        correctLetter: 'A',
        explanation: 'Lớp khí quyển dày có trọng lượng tác dụng áp suất lên mọi vật trên Trái Đất.'
      },
      {
        num: 11,
        question: 'Áp suất khí quyển tiêu chuẩn ở ngang mực nước biển xấp xỉ bằng bao nhiêu mmHg?',
        options: ['760 mmHg', '100 mmHg', '500 mmHg', '1000 mmHg'],
        correctLetter: 'A',
        explanation: 'Thí nghiệm Torricelli đo áp suất chuẩn bằng cột thủy ngân cao 760 mm.'
      },
      {
        num: 12,
        question: 'Tàu ngầm lặn xuống hoặc nổi lên được là nhờ cơ chế nào?',
        options: [
          'Thay đổi lượng nước trong các khoang dằn để thay đổi trọng lượng tàu',
          'Thay đổi hình dạng vỏ tàu',
          'Tăng giảm công suất chân vịt',
          'Dùng động cơ kéo phụ'
        ],
        correctLetter: 'A',
        explanation: 'Bơm nước vào khoang dằn làm tăng P để chìm, xả nước ra để giảm P nổi lên.'
      },
      {
        num: 13,
        question: 'Một thỏi nhôm và một thỏi sắt có cùng thể tích nhúng chìm hoàn toàn trong nước. So sánh lực đẩy Archimedes:',
        options: ['FA tác dụng lên hai thỏi bằng nhau', 'FA sắt lớn hơn', 'FA nhôm lớn hơn', 'Không xác định được'],
        correctLetter: 'A',
        explanation: 'Cùng thể tích V chiếm chỗ và cùng d_nước nên FA = d × V bằng nhau.'
      },
      {
        num: 14,
        question: 'Hiện tượng nào sau đây giải thích tác dụng của áp suất khí quyển?',
        options: [
          'Hút sữa từ hộp giấy bằng ống hút',
          'Giọt nước đọng trên lá sen',
          'Thước kẻ cọ xát hút giấy vụn',
          'Kim nam châm tự định hướng'
        ],
        correctLetter: 'A',
        explanation: 'Áp suất trong khoang miệng giảm, áp suất khí quyển ép sữa dâng lên ống hút.'
      },
      {
        num: 15,
        question: 'Khi đặt bàn chân trần lên đệm mút thì đệm bị lún sâu hơn khi nằm ngả lưng là vì:',
        options: [
          'Diện tích tiếp xúc khi đứng nhỏ hơn nhiều nên áp suất lớn hơn',
          'Trọng lượng khi đứng lớn hơn khi nằm',
          'Đệm hút chân mạnh hơn',
          'Áp lực khi đứng lớn hơn'
        ],
        correctLetter: 'A',
        explanation: 'Cùng trọng lượng nhưng diện tích tiếp xúc khi đứng nhỏ hơn nên áp suất lớn hơn.'
      },
      {
        num: 16,
        question: 'Một khối gỗ có thể tích 0,002 m³ nhúng chìm hoàn toàn trong nước (d = 10 000 N/m³). Lực đẩy Archimedes tác dụng lên khối gỗ là:',
        options: ['20 N', '2 N', '200 N', '0,2 N'],
        correctLetter: 'A',
        explanation: 'FA = d × V = 10 000 × 0,002 = 20 N.'
      }
    ],
    tf: {
      num: 17,
      prompt: 'Một học sinh làm thí nghiệm khảo sát áp suất chất lỏng và lực đẩy Archimedes trong phòng thực hành KHTN. Hãy đánh giá tính Đúng/Sai của các nhận định sau:',
      statements: [
        { sub: 'a', text: 'Chất lỏng gây ra áp suất theo mọi phương lên đáy bình, thành bình và các vật nhúng trong lòng chất lỏng.', answer: 'Đúng' },
        { sub: 'b', text: 'Độ lớn lực đẩy Archimedes bằng trọng lượng của phần chất lỏng bị vật chiếm chỗ: FA = d . V.', answer: 'Đúng' },
        { sub: 'c', text: 'Khi một vật nổi cân bằng trên mặt chất lỏng thì độ lớn lực đẩy Archimedes đúng bằng trọng lượng của vật: FA = P.', answer: 'Đúng' },
        { sub: 'd', text: 'Càng lên đỉnh núi cao thì áp suất khí quyển càng tăng lên do không khí loãng hơn.', answer: 'Sai' }
      ],
      explanation: 'Ý a, b, c đúng. Ý d sai vì càng lên cao thì lớp không khí bên trên càng mỏng, mật độ không khí giảm nên áp suất khí quyển giảm dần.'
    },
    sa: {
      num: 18,
      prompt: 'Một khối kim loại hình hộp có thể tích V = 0,004 m³ và khối lượng m = 10,8 kg được nhúng chìm hoàn toàn trong một bể nước (cho trọng lượng riêng của nước d_nước = 10 000 N/m³; lấy gia tốc trọng trường g = 10 m/s²).\n(1) Độ lớn lực đẩy Archimedes tác dụng lên khối kim loại bằng bao nhiêu Newton (N)?\n(2) Trọng lượng của khối kim loại này ngoài không khí bằng bao nhiêu Newton (N)?',
      blank1: '40',
      blank2: '108',
      explanation: 'Chỗ điền 1: FA = d × V = 10 000 × 0,004 = 40 N (0.5 điểm).\nChỗ điền 2: P = 10 × m = 10 × 10,8 = 108 N (0.5 điểm).'
    }
  };
}

/**
 * Tạo chuỗi văn bản thuần (Plain Text) chuẩn ma trận GDPT 2018
 */
export function generateExamPlainTextTemplate(subject: SubjectType | 'all' = 'physics'): string {
  const data = getExamTemplateData(subject);
  const subCode = data.subject;

  let text = `[TIÊU ĐỀ: ${data.title}]\n`;
  text += `[KHỐI: ${data.grade}]\n`;
  text += `[MÔN: ${subCode}]\n`;
  text += `[THỜI GIAN: ${data.durationMinutes}]\n\n`;

  text += `=======================================================================\n`;
  text += `HƯỚNG DẪN CẤU TRÚC MA TRẬN ĐỀ KIỂM TRA THƯỜNG XUYÊN GDPT 2018 (TỔNG 10 ĐIỂM):\n`;
  text += `- PHẦN 1: 16 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (8.0 ĐIỂM - 0.5 ĐIỂM/CÂU)\n`;
  text += `- PHẦN 2: 1 CÂU TRẮC NGHIỆM ĐÚNG/SAI (4 NHẬN ĐỊNH A, B, C, D - 1.0 ĐIỂM)\n`;
  text += `- PHẦN 3: 1 CÂU TRẢ LỜI NGẮN (2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM: 0.5 ĐIỂM/CHỖ ĐIỀN)\n`;
  text += `=======================================================================\n\n`;

  text += `PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (16 CÂU - 8.0 ĐIỂM)\n`;
  text += `(Thí sinh chọn một phương án đúng duy nhất A, B, C hoặc D)\n\n`;

  data.mcqs.forEach((q) => {
    text += `Câu ${q.num}: ${q.question}\n`;
    text += `A. ${q.options[0]}\n`;
    text += `B. ${q.options[1]}\n`;
    text += `C. ${q.options[2]}\n`;
    text += `D. ${q.options[3]}\n`;
    text += `Đáp án: ${q.correctLetter}\n`;
    text += `Giải thích: ${q.explanation}\n\n`;
  });

  text += `PHẦN 2: CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI (1 CÂU - 4 NHẬN ĐỊNH - 1.0 ĐIỂM)\n`;
  text += `(Mức độ: Thông hiểu. Thí sinh chọn Đúng hoặc Sai cho mỗi nhận định a, b, c, d)\n\n`;
  text += `Câu ${data.tf.num}: ${data.tf.prompt}\n`;
  data.tf.statements.forEach((st) => {
    text += `${st.sub}) ${st.text} - Đáp án: ${st.answer}\n`;
  });
  text += `Giải thích: ${data.tf.explanation}\n\n`;

  text += `PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (1 CÂU - 2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM)\n`;
  text += `(Mức độ: Vận dụng thấp. Thí sinh tính toán và điền đáp số dạng số vào 2 chỗ trống)\n\n`;
  text += `Câu ${data.sa.num}: ${data.sa.prompt}\n`;
  text += `Chỗ điền 1: ${data.sa.blank1}\n`;
  text += `Chỗ điền 2: ${data.sa.blank2}\n`;
  text += `Giải thích:\n${data.sa.explanation}\n`;

  return text;
}

/**
 * Tạo file chuẩn Microsoft Word (.docx) bản địa bằng thư viện docx
 */
export async function generateNativeDocxExamTemplateBlob(subject: SubjectType | 'all' = 'physics'): Promise<Blob> {
  const data = getExamTemplateData(subject);
  const subName = data.subject === 'physics' ? 'VẬT LÍ' : data.subject === 'chemistry' ? 'HÓA HỌC' : 'SINH HỌC';

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // Header Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'SỞ GD&ĐT GIA LAI', bold: true, size: 22 }),
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'TRƯỜNG THCS & THPT Y ĐÔN', bold: true, size: 22 })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'Tổ Tự Nhiên: Lí - Hóa - Sinh - CN', italics: true, size: 20 })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 22 })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, italics: true, size: 22 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Exam Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 80 },
            children: [
              new TextRun({
                text: `ĐỀ KIỂM TRA THƯỜNG XUYÊN - MÔN ${subName} 8`,
                bold: true,
                size: 28,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '(Khung chuẩn Ma trận GDPT 2018 - Thời gian: 15 phút - Thang điểm 10.0)',
                italics: true,
                size: 20,
                color: '475569'
              })
            ]
          }),

          // Metadata Tag Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `[TIÊU ĐỀ: ${data.title}]\n`, bold: true, size: 20 }),
                          new TextRun({ text: `[KHỐI: ${data.grade}]\n`, bold: true, size: 20 }),
                          new TextRun({ text: `[MÔN: ${data.subject}]\n`, bold: true, size: 20 }),
                          new TextRun({ text: `[THỜI GIAN: ${data.durationMinutes}]`, bold: true, size: 20 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Section 1 Header
          new Paragraph({
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: 'PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (16 CÂU - 8.0 ĐIỂM)',
                bold: true,
                size: 24,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: 'Thí sinh trả lời từ Câu 1 đến Câu 16. Mỗi câu chỉ chọn một phương án đúng duy nhất (0.5 điểm/câu).',
                italics: true,
                size: 20
              })
            ]
          }),

          // 16 MCQs
          ...data.mcqs.flatMap((q) => [
            new Paragraph({
              spacing: { before: 120, after: 60 },
              children: [
                new TextRun({ text: `Câu ${q.num}: `, bold: true, size: 22 }),
                new TextRun({ text: q.question, size: 22 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `A. ${q.options[0]}`, size: 21 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `B. ${q.options[1]}`, size: 21 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `C. ${q.options[2]}`, size: 21 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `D. ${q.options[3]}`, size: 21 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `Đáp án: ${q.correctLetter}`, bold: true, color: '1E3A8A', size: 21 })
              ]
            }),
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: 120 },
              children: [
                new TextRun({ text: `Giải thích: ${q.explanation}`, italics: true, color: '64748B', size: 20 })
              ]
            })
          ]),

          // Section 2 Header
          new Paragraph({
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: 'PHẦN 2: CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI (1 CÂU - 4 NHẬN ĐỊNH - 1.0 ĐIỂM)',
                bold: true,
                size: 24,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: 'Mức độ: Thông hiểu. Thí sinh trả lời Câu 17. Trong mỗi ý a, b, c, d, chọn Đúng hoặc Sai (Đúng 1 ý = 0.1đ; 2 ý = 0.25đ; 3 ý = 0.5đ; 4 ý = 1.0đ).',
                italics: true,
                size: 20
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: `Câu ${data.tf.num}: `, bold: true, size: 22 }),
              new TextRun({ text: data.tf.prompt, size: 22 })
            ]
          }),
          ...data.tf.statements.map((st) => 
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${st.sub}) ${st.text} `, size: 21 }),
                new TextRun({ text: `- Đáp án: ${st.answer}`, bold: true, color: '059669', size: 21 })
              ]
            })
          ),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 160 },
            children: [
              new TextRun({ text: `Giải thích: ${data.tf.explanation}`, italics: true, color: '64748B', size: 20 })
            ]
          }),

          // Section 3 Header
          new Paragraph({
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: 'PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (1 CÂU - 2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM)',
                bold: true,
                size: 24,
                color: '1E3A8A'
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: 'Mức độ: Vận dụng thấp. Thí sinh trả lời Câu 18 bằng cách tính toán và điền đáp số vào 2 chỗ trống (Mỗi chỗ điền số đúng được 0.5 điểm).',
                italics: true,
                size: 20
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: `Câu ${data.sa.num}: `, bold: true, size: 22 }),
              new TextRun({ text: data.sa.prompt, size: 22 })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            children: [
              new TextRun({ text: `Chỗ điền 1: `, bold: true, size: 21 }),
              new TextRun({ text: data.sa.blank1, bold: true, color: '059669', size: 21 })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            children: [
              new TextRun({ text: `Chỗ điền 2: `, bold: true, size: 21 }),
              new TextRun({ text: data.sa.blank2, bold: true, color: '059669', size: 21 })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 160 },
            children: [
              new TextRun({ text: `Giải thích:\n${data.sa.explanation}`, italics: true, color: '64748B', size: 20 })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Tạo file Word dạng HTML (.doc) mở nhanh tương thích mọi phiên bản
 */
export function generateExamWordTemplateBlob(subject: SubjectType | 'all' = 'physics'): Blob {
  const plainText = generateExamPlainTextTemplate(subject);
  const data = getExamTemplateData(subject);
  const subTitle = data.subject === 'physics' ? 'VẬT LÍ' : data.subject === 'chemistry' ? 'HÓA HỌC' : 'SINH HỌC';

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>File Mẫu Đề Kiểm Tra Thường Xuyên KHTN - Trường THCS & THPT Y Đôn</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.4;
          margin: 1.5cm;
          color: #000000;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .header-table td {
          vertical-align: top;
          padding: 4px;
        }
        .school-name {
          font-weight: bold;
          font-size: 11pt;
          text-align: center;
        }
        .exam-title {
          text-align: center;
          font-size: 15pt;
          font-weight: bold;
          color: #0f172a;
          margin-top: 10px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .part-header {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 6px 12px;
          font-weight: bold;
          font-size: 12pt;
          margin-top: 20px;
          margin-bottom: 12px;
        }
        .meta-box {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 10px;
          margin-bottom: 15px;
          font-family: 'Courier New', monospace;
          font-size: 11pt;
          white-space: pre-wrap;
        }
        .question-block {
          margin-bottom: 16px;
        }
        .question-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .option {
          margin-left: 20px;
          margin-bottom: 3px;
        }
        .answer {
          margin-left: 20px;
          font-weight: bold;
          color: #1e3a8a;
        }
        .explanation {
          margin-left: 20px;
          font-style: italic;
          color: #475569;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 45%; text-align: center;">
            <div class="school-name">SỞ GD&ĐT GIA LAI</div>
            <div class="school-name">TRƯỜNG THCS & THPT Y ĐÔN</div>
            <div style="font-size: 10pt; font-style: italic;">Tổ Tự Nhiên: Lí - Hóa - Sinh - CN</div>
          </td>
          <td style="width: 55%; text-align: center;">
            <div style="font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 10pt; font-style: italic;">Độc lập - Tự do - Hạnh phúc</div>
          </td>
        </tr>
      </table>

      <div class="exam-title">ĐỀ KIỂM TRA THƯỜNG XUYÊN - MÔN ${subTitle} 8</div>
      <div style="text-align: center; font-style: italic; margin-bottom: 15px;">(Khung chuẩn ma trận GDPT 2018 - Thời gian: 15 phút - Thang điểm 10.0)</div>

      <div class="meta-box">[TIÊU ĐỀ: ${data.title}]
[KHỐI: ${data.grade}]
[MÔN: ${data.subject}]
[THỜI GIAN: ${data.durationMinutes}]</div>

      <div class="part-header">PHẦN 1: CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (16 CÂU - 8.0 ĐIỂM)</div>
      <div style="font-style: italic; margin-bottom: 12px;">Thí sinh trả lời từ Câu 1 đến Câu 16. Mỗi câu chỉ chọn một phương án đúng duy nhất (0.5 điểm/câu).</div>
      ${data.mcqs.map(q => `
        <div class="question-block">
          <div class="question-title">Câu ${q.num}: ${q.question}</div>
          <div class="option">A. ${q.options[0]}</div>
          <div class="option">B. ${q.options[1]}</div>
          <div class="option">C. ${q.options[2]}</div>
          <div class="option">D. ${q.options[3]}</div>
          <div class="answer">Đáp án: ${q.correctLetter}</div>
          <div class="explanation">Giải thích: ${q.explanation}</div>
        </div>
      `).join('')}

      <div class="part-header">PHẦN 2: CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI (1 CÂU - 4 NHẬN ĐỊNH - 1.0 ĐIỂM)</div>
      <div style="font-style: italic; margin-bottom: 12px;">Mức độ: Thông hiểu. Thí sinh trả lời Câu 17 (chọn Đúng hoặc Sai cho mỗi nhận định).</div>
      <div class="question-block">
        <div class="question-title">Câu ${data.tf.num}: ${data.tf.prompt}</div>
        ${data.tf.statements.map(st => `
          <div class="option">${st.sub}) ${st.text} - <strong>Đáp án: ${st.answer}</strong></div>
        `).join('')}
        <div class="explanation">Giải thích: ${data.tf.explanation}</div>
      </div>

      <div class="part-header">PHẦN 3: CÂU HỎI TRẢ LỜI NGẮN (1 CÂU - 2 CHỖ ĐIỀN SỐ - 1.0 ĐIỂM)</div>
      <div style="font-style: italic; margin-bottom: 12px;">Mức độ: Vận dụng thấp. Thí sinh tính toán và điền kết quả vào 2 chỗ trống.</div>
      <div class="question-block">
        <div class="question-title">Câu ${data.sa.num}: ${data.sa.prompt.replace(/\n/g, '<br/>')}</div>
        <div class="answer">Chỗ điền 1: ${data.sa.blank1}</div>
        <div class="answer">Chỗ điền 2: ${data.sa.blank2}</div>
        <div class="explanation">Giải thích: ${data.sa.explanation.replace(/\n/g, '<br/>')}</div>
      </div>
    </body>
    </html>
  `;

  return new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
}

/**
 * Helper tải tệp tin Blob an toàn
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
