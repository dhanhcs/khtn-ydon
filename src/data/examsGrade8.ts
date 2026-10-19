import { Exam } from '../types';

export const examsGrade8: Exam[] = [
  // ================= ĐỀ 1 - KHỐI 8 =================
  {
    id: 'exam-phy-8-01',
    title: 'Đề 1 - Vật lí 8: Áp suất chất lỏng và Lực đẩy Archimedes',
    subject: 'physics',
    grade: 8,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-01',
    questions: [
      { id: 'p81_1', type: 'multiple_choice', question: 'Đơn vị đo áp suất trong hệ đo lường SI là gì?', options: ['Pascal (Pa)', 'Newton (N)', 'Joule (J)', 'Kilôgam (kg)'], correctAnswer: 0, explanation: '1 Pa = 1 N/m².' },
      { id: 'p81_2', type: 'multiple_choice', question: 'Công thức tính áp suất chất lỏng tại độ sâu h là:', options: ['p = d.h', 'p = d / h', 'p = F / S', 'p = m.g.h'], correctAnswer: 0, explanation: 'Trong đó d là trọng lượng riêng của chất lỏng, h là chiều sâu cột chất lỏng.' },
      { id: 'p81_3', type: 'multiple_choice', question: 'Lực đẩy Archimedes tác dụng lên một vật nhúng trong chất lỏng có phương và chiều như thế nào?', options: ['Phương thẳng đứng, chiều từ dưới lên trên', 'Phương thẳng đứng, chiều từ trên xuống dưới', 'Phương nằm ngang, chiều từ trái sang phải', 'Cùng phương và chiều với trọng lực'], correctAnswer: 0, explanation: 'Lực đẩy Archimedes luôn có phương thẳng đứng, hướng từ dưới lên trên.' },
      { id: 'p81_4', type: 'multiple_choice', question: 'Độ lớn của lực đẩy Archimedes được tính theo công thức nào?', options: ['FA = d.V', 'FA = P / V', 'FA = m.V', 'FA = d / V'], correctAnswer: 0, explanation: 'FA = d.V với V là thể tích phần chất lỏng bị vật chiếm chỗ.' },
      { id: 'p81_5', type: 'multiple_choice', question: 'Vật sẽ chìm xuống trong chất lỏng khi nào?', options: ['P > FA (hoặc dvật > dchất lỏng)', 'P < FA', 'P = FA', 'dvật < dchất lỏng'], correctAnswer: 0, explanation: 'Khi trọng lượng lớn hơn lực đẩy Archimedes vật sẽ chìm.' },
      { id: 'p81_6', type: 'multiple_choice', question: 'Để tăng áp suất tác dụng lên mặt bị ép, người ta có thể làm cách nào sau đây?', options: ['Tăng áp lực và giảm diện tích bị ép', 'Giảm áp lực và tăng diện tích bị ép', 'Giữ nguyên áp lực và tăng diện tích bị ép', 'Giảm cả áp lực và diện tích bị ép cùng tỉ lệ'], correctAnswer: 0, explanation: 'Vì p = F/S nên tăng F và giảm S sẽ làm tăng p nhiều nhất.' },
      { id: 'p81_7', type: 'multiple_choice', question: 'Mũi đinh nhọn sắc để làm gì trong thực tế đời sống?', options: ['Giảm diện tích tiếp xúc để tăng áp suất dễ đóng vào gỗ', 'Tăng diện tích tiếp xúc để giảm áp suất', 'Giảm áp lực', 'Làm cho đinh nặng hơn'], correctAnswer: 0, explanation: 'Diện tích mũi nhỏ giúp tạo áp suất cực lớn với lực đóng vừa phải.' },
      { id: 'p81_8', type: 'multiple_choice', question: 'Tại sao khi lặn xuống biển sâu, người thợ lặn phải mặc áo lặn chuyên dụng chịu áp suất cao?', options: ['Vì càng xuống sâu thì áp suất nước biển càng lớn gây nguy hiểm', 'Để chống lạnh và nhìn rõ sinh vật biển', 'Để giảm lực cản của nước', 'Để tăng lực đẩy Archimedes'], correctAnswer: 0, explanation: 'p = d.h, độ sâu càng lớn thì áp suất biển càng khổng lồ.' },
      { id: 'p81_9', type: 'multiple_choice', question: 'Trong bình thông nhau chứa cùng một chất lỏng đứng yên, các mực chất lỏng ở các nhánh luôn:', options: ['Ở cùng một độ cao', 'Nhánh to có mực nước cao hơn', 'Nhánh nhỏ có mực nước cao hơn', 'Tùy thuộc vào hình dạng nhánh'], correctAnswer: 0, explanation: 'Các mặt thoáng của chất lỏng đứng yên trong bình thông nhau luôn ở cùng độ cao.' },
      { id: 'p81_10', type: 'multiple_choice', question: 'Một thỏi nhôm và một thỏi sắt có cùng thể tích được nhúng chìm hoàn toàn trong nước. So sánh lực đẩy Archimedes tác dụng lên hai thỏi:', options: ['FA tác dụng lên hai thỏi là như nhau', 'FA sắt lớn hơn', 'FA nhôm lớn hơn', 'Không xác định được'], correctAnswer: 0, explanation: 'Vì V chiếm chỗ như nhau và cùng chất lỏng nước nên FA = d.V bằng nhau.' },
      { id: 'p81_11', type: 'multiple_choice', question: 'Khí quyển có áp suất là do nguyên nhân nào sau đây?', options: ['Do không khí có trọng lượng', 'Do không khí chuyển động nhiệt hỗn loạn', 'Do bức xạ mặt trời', 'Do hơi nước bay lên'], correctAnswer: 0, explanation: 'Lớp khí quyển dày hàng trăm km tác dụng trọng lượng lên mọi vật trên bề mặt đất.' },
      { id: 'p81_12', type: 'multiple_choice', question: 'Áp suất khí quyển tiêu chuẩn ở ngang mực nước biển xấp xỉ bằng bao nhiêu mmHg?', options: ['760 mmHg', '100 mmHg', '500 mmHg', '1000 mmHg'], correctAnswer: 0, explanation: 'Thí nghiệm Torricelli đo áp suất chuẩn bằng cột thủy ngân cao 760 mm.' },
      { id: 'p81_13', type: 'multiple_choice', question: 'Tàu ngầm lặn xuống hoặc nổi lên được là nhờ cơ chế nào?', options: ['Thay đổi lượng nước trong các khoang dằn để thay đổi trọng lượng tàu', 'Thay đổi hình dạng vỏ tàu', 'Tăng giảm công suất động cơ chân vịt', 'Thả phao cứu sinh'], correctAnswer: 0, explanation: 'Bơm nước vào khoang dằn làm tăng P để chìm, xả nước ra để giảm P nổi lên.' },
      { id: 'p81_14', type: 'multiple_choice', question: 'Một khối gỗ có thể tích 0.002 m³ nhúng chìm hoàn toàn trong nước có d = 10000 N/m³. Lực đẩy Archimedes tác dụng lên khối gỗ là:', options: ['20 N', '2 N', '200 N', '0.2 N'], correctAnswer: 0, explanation: 'FA = d * V = 10000 * 0.002 = 20 N.' },
      { id: 'p81_15', type: 'multiple_choice', question: 'Đơn vị Torr tương đương với đơn vị áp suất nào sau đây?', options: ['mmHg (milimét thủy ngân)', 'Pascal (Pa)', 'Bar', 'Atmosphere (atm)'], correctAnswer: 0, explanation: '1 Torr = 1 mmHg.' },
      { id: 'p81_16', type: 'multiple_choice', question: 'Khi đặt bàn chân trần lên đệm mút thì đệm bị lún sâu hơn khi nằm ngả lưng trên đệm là vì:', options: ['Diện tích tiếp xúc khi đứng nhỏ hơn nên áp suất tác dụng lớn hơn', 'Trọng lượng khi đứng lớn hơn khi nằm', 'Đệm hút chân mạnh hơn', 'Áp lực khi đứng lớn hơn'], correctAnswer: 0, explanation: 'Cùng trọng lượng P nhưng S_đứng nhỏ hơn S_nằm rất nhiều nên p_đứng > p_nằm.' },
      {
        id: 'p81_17',
        type: 'true_false',
        question: 'Về áp suất và lực đẩy Archimedes trong chất lưu, hãy đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Chất lỏng chỉ gây áp suất theo phương thẳng đứng từ trên xuống đáy bình.', isCorrect: false },
          { subId: 'b', text: 'Lực đẩy Archimedes có độ lớn bằng trọng lượng của phần chất lỏng bị vật chiếm chỗ.', isCorrect: true },
          { subId: 'c', text: 'Vật nổi cân bằng trên mặt chất lỏng khi trọng lượng của vật bằng độ lớn lực đẩy Archimedes.', isCorrect: true },
          { subId: 'd', text: 'Càng lên cao trên núi cao thì áp suất khí quyển càng tăng lên.', isCorrect: false }
        ]
      },
      {
        id: 'p81_18',
        type: 'short_answer',
        question: 'Một vật có thể tích 0.005 m³ nhúng chìm hoàn toàn trong nước tinh khiết (cho d_nước = 10 000 N/m³). Khối lượng của vật là m = 4.5 kg (lấy g = 10 m/s²).\n(1) Lực đẩy Archimedes tác dụng lên vật bằng bao nhiêu Newton (N)?\n(2) Trọng lượng của vật ngoài không khí bằng bao nhiêu Newton (N)?',
        acceptableAnswers: ['50', '45'],
        blanks: [
          { id: '1', label: 'Chỗ điền 1 (Lực đẩy FA)', acceptableAnswers: ['50', '50N', '50 N'], unit: 'N', points: 0.5 },
          { id: '2', label: 'Chỗ điền 2 (Trọng lượng P)', acceptableAnswers: ['45', '45N', '45 N'], unit: 'N', points: 0.5 }
        ],
        explanation: '- Chỗ điền 1: FA = d * V = 10000 * 0.005 = 50 N (0.5 điểm).\n- Chỗ điền 2: P = 10 * m = 10 * 4.5 = 45 N (0.5 điểm).'
      }
    ]
  },

  // ================= ĐỀ 2 - KHỐI 8 =================
  {
    id: 'exam-chem-8-01',
    title: 'Đề 2 - Hóa học 8: Phản ứng hóa học, Định luật bảo toàn khối lượng và Mol',
    subject: 'chemistry',
    grade: 8,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-02',
    questions: [
      { id: 'c82_1', type: 'multiple_choice', question: 'Dấu hiệu chính xác nhất để khẳng định có phản ứng hóa học xảy ra là:', options: ['Có chất mới sinh ra với tính chất khác biệt chất ban đầu', 'Chất chỉ thay đổi hình dạng', 'Chất chuyển từ thể rắn sang lỏng', 'Nhiệt độ phòng tăng nhẹ không sinh chất mới'], correctAnswer: 0, explanation: 'Phản ứng hóa học là quá trình biến đổi chất này thành chất khác.' },
      { id: 'c82_2', type: 'multiple_choice', question: 'Trong một phản ứng hóa học, đại lượng nào sau đây luôn được bảo toàn tuyệt đối?', options: ['Số nguyên tử của mỗi nguyên tố và tổng khối lượng các chất', 'Số lượng phân tử các chất', 'Thể tích của các chất', 'Màu sắc các chất'], correctAnswer: 0, explanation: 'Định luật bảo toàn khối lượng: số nguyên tử mỗi nguyên tố không đổi.' },
      { id: 'c82_3', type: 'multiple_choice', question: 'Nội dung Định luật bảo toàn khối lượng (Lomonosov - Lavoisier) khẳng định:', options: ['Tổng khối lượng các chất tham gia bằng tổng khối lượng các chất sản phẩm', 'Khối lượng sản phẩm luôn lớn hơn chất phản ứng', 'Khối lượng giảm đi do bay hơi', 'Năng lượng biến mất thành khối lượng'], correctAnswer: 0, explanation: 'm_chất tham gia = m_sản phẩm.' },
      { id: 'c82_4', type: 'multiple_choice', question: 'Một mol chất chứa bao nhiêu hạt vi mô (nguyên tử hoặc phân tử)?', options: ['6.022 x 10^23 hạt (Hằng số Avogadro)', '6.022 x 10^22 hạt', '10^23 hạt', '3.14 x 10^23 hạt'], correctAnswer: 0, explanation: 'N_A ≈ 6.022 * 10^23 hạt/mol.' },
      { id: 'c82_5', type: 'multiple_choice', question: 'Khối lượng mol (M) của khí Oxygen (O2) là bao nhiêu g/mol? (Biết O = 16)', options: ['32 g/mol', '16 g/mol', '8 g/mol', '64 g/mol'], correctAnswer: 0, explanation: 'M(O2) = 16 * 2 = 32 g/mol.' },
      { id: 'c82_6', type: 'multiple_choice', question: 'Ở điều kiện chuẩn (25°C và 1 bar), thể tích mol của 1 mol chất khí bất kì là:', options: ['24.79 lít', '22.4 lít', '24.0 lít', '25.0 lít'], correctAnswer: 0, explanation: 'Theo chuẩn IUPAC mới (25°C, 1 bar), V_m = 24.79 L/mol.' },
      { id: 'c82_7', type: 'multiple_choice', question: 'Công thức liên hệ giữa số mol (n), khối lượng chất (m) và khối lượng mol (M) là:', options: ['n = m / M', 'n = m . M', 'n = M / m', 'm = n / M'], correctAnswer: 0, explanation: 'n = m / M.' },
      { id: 'c82_8', type: 'multiple_choice', question: 'Đốt cháy hoàn toàn 2.4 g kim loại Magnesium (Mg) trong khí oxy thu được 4.0 g Magie oxit (MgO). Khối lượng khí oxy đã tham gia phản ứng là:', options: ['1.6 g', '2.0 g', '1.4 g', '6.4 g'], correctAnswer: 0, explanation: 'm(O2) = m(MgO) - m(Mg) = 4.0 - 2.4 = 1.6 g.' },
      { id: 'c82_9', type: 'multiple_choice', question: 'Tỉ khối của khí Methane (CH4) so với không khí (M_kk ≈ 29) xấp xỉ bằng:', options: ['0.55 (nhẹ hơn không khí)', '1.2 (nặng hơn không khí)', '1.0', '2.0'], correctAnswer: 0, explanation: 'd = 16 / 29 ≈ 0.55.' },
      { id: 'c82_10', type: 'multiple_choice', question: 'Hiệu suất của phản ứng hóa học (H) được tính theo công thức nào?', options: ['H = (m_thực tế / m_lí thuyết) x 100%', 'H = (m_lí thuyết / m_thực tế) x 100%', 'H = m_chất phản ứng x 100%', 'H = m_sản phẩm / m_chất dư'], correctAnswer: 0, explanation: 'H = (lượng thực tế / lượng lí thuyết) * 100%.' },
      { id: 'c82_11', type: 'multiple_choice', question: 'Phản ứng tỏa nhiệt là phản ứng hóa học có đặc điểm:', options: ['Giải phóng năng lượng nhiệt ra môi trường xung quanh', 'Hấp thu năng lượng nhiệt từ môi trường làm môi trường lạnh đi', 'Không bao giờ xảy ra tự phát', 'Chỉ xảy ra ở nhiệt độ 0°C'], correctAnswer: 0, explanation: 'Phản ứng tỏa nhiệt nhả nhiệt ra môi trường.' },
      { id: 'c82_12', type: 'multiple_choice', question: 'Ví dụ nào sau đây là phản ứng thu nhiệt?', options: ['Phản ứng nung đá vôi (CaCO3) ở nhiệt độ cao cần cung cấp nhiệt liên tục', 'Đốt cháy than đá', 'Đốt cháy cồn trong đĩa', 'Pháo hoa nổ sáng'], correctAnswer: 0, explanation: 'Nung đá vôi phải cấp nhiệt liên tục suốt phản ứng.' },
      { id: 'c82_13', type: 'multiple_choice', question: 'Số mol của 5.6 g sắt (Fe) là bao nhiêu mol? (Biết M_Fe = 56 g/mol)', options: ['0.1 mol', '0.2 mol', '0.05 mol', '1.0 mol'], correctAnswer: 0, explanation: 'n = 5.6 / 56 = 0.1 mol.' },
      { id: 'c82_14', type: 'multiple_choice', question: 'Thể tích của 0.2 mol khí H2 ở điều kiện chuẩn (25°C, 1 bar) là:', options: ['4.958 lít', '4.48 lít', '2.479 lít', '5.6 lít'], correctAnswer: 0, explanation: 'V = n * 24.79 = 0.2 * 24.79 = 4.958 L.' },
      { id: 'c82_15', type: 'multiple_choice', question: 'Tốc độ phản ứng hóa học tăng lên khi ta áp dụng biện pháp nào sau đây?', options: ['Tăng nồng độ chất phản ứng và tăng diện tích tiếp xúc (nghiền nhỏ)', 'Giảm nhiệt độ của hệ phản ứng', 'Pha loãng dung dịch', 'Làm cho chất phản ứng vón cục to'], correctAnswer: 0, explanation: 'Tăng nhiệt độ, nồng độ, diện tích bề mặt và dùng chất xúc tác giúp tăng tốc độ phản ứng.' },
      { id: 'c82_16', type: 'multiple_choice', question: 'Chất xúc tác có vai trò gì trong phản ứng hóa học?', options: ['Làm tăng tốc độ phản ứng nhưng không bị tiêu hao sau phản ứng', 'Làm chậm phản ứng vĩnh viễn', 'Biến đổi thành sản phẩm mới', 'Làm giảm khối lượng sản phẩm tạo thành'], correctAnswer: 0, explanation: 'Chất xúc tác làm giảm năng lượng hoạt hóa, tăng tốc phản ứng và giữ nguyên sau phản ứng.' },
      {
        id: 'c82_17',
        type: 'true_false',
        question: 'Về định luật bảo toàn khối lượng và mol, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Trong phản ứng hóa học, liên kết giữa các nguyên tử bị thay đổi nhưng số nguyên tử mỗi nguyên tố giữ nguyên.', isCorrect: true },
          { subId: 'b', text: '1 mol phân tử khí CO2 chứa đúng 6.022 x 10^23 phân tử CO2.', isCorrect: true },
          { subId: 'c', text: 'Khi nung đá vôi trong bình hở, khối lượng chất rắn thu được giảm đi chứng tỏ định luật bảo toàn khối lượng bị sai.', isCorrect: false },
          { subId: 'd', text: 'Khí CO2 (M=44) nhẹ hơn không khí (M_kk=29).', isCorrect: false }
        ]
      },
      {
        id: 'c82_18',
        type: 'short_answer',
        question: 'Cho 6.5 g kẽm (Zn) tác dụng hoàn toàn với dung dịch axit HCl vừa đủ: Zn + 2HCl → ZnCl₂ + H₂↑. Cho khối lượng mol của Zn là 65 g/mol.\n(1) Số mol Zn đã phản ứng bằng bao nhiêu mol?\n(2) Khối lượng khí H₂ sinh ra bằng bao nhiêu gam?',
        acceptableAnswers: ['0.1', '0.2'],
        blanks: [
          { id: '1', label: 'Chỗ điền 1 (Số mol Zn)', acceptableAnswers: ['0.1', '0.1 mol', '0.1mol', '0,1'], unit: 'mol', points: 0.5 },
          { id: '2', label: 'Chỗ điền 2 (Khối lượng H₂)', acceptableAnswers: ['0.2', '0.2g', '0.2 g', '0,2', '0,2g'], unit: 'gam', points: 0.5 }
        ],
        explanation: '- Chỗ điền 1: nZn = 6.5 / 65 = 0.1 mol (0.5 điểm).\n- Chỗ điền 2: nH₂ = nZn = 0.1 mol => mH₂ = 0.1 * 2 = 0.2 gam (0.5 điểm).'
      }
    ]
  },

  // ================= ĐỀ 3 - KHỐI 8 =================
  {
    id: 'exam-bio-8-01',
    title: 'Đề 3 - Sinh học 8: Khái quát cơ thể người, Hệ vận động và Hệ tuần hoàn',
    subject: 'biology',
    grade: 8,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-03',
    questions: [
      { id: 'b83_1', type: 'multiple_choice', question: 'Hệ vận động ở người được cấu tạo từ hai thành phần chính nào?', options: ['Bộ xương và hệ cơ (cơ bắp vân)', 'Hệ tuần hoàn và hệ hô hấp', 'Tủy sống và não bộ', 'Hệ tiêu hóa và gan mật'], correctAnswer: 0, explanation: 'Xương làm đòn bẩy vững chắc và cơ co dãn tạo chuyển động.' },
      { id: 'b83_2', type: 'multiple_choice', question: 'Chất hữu cơ (cốt giao) trong xương có vai trò gì?', options: ['Giúp xương có tính mềm dẻo và đàn hồi', 'Giúp xương cứng chắc chịu lực', 'Giúp tạo tế bào hồng cầu mới', 'Chống thoái hóa khớp'], correctAnswer: 0, explanation: 'Chất hữu cơ tạo độ dẻo dai, chất khoáng (canxi, photpho) tạo độ cứng.' },
      { id: 'b83_3', type: 'multiple_choice', question: 'Khớp xương ở đầu gối, khuỷu tay thuộc loại khớp nào sau đây?', options: ['Khớp động', 'Khớp bán động', 'Khớp bất động', 'Khớp sọ'], correctAnswer: 0, explanation: 'Khớp động có bao hoạt dịch giúp cử động linh hoạt.' },
      { id: 'b83_4', type: 'multiple_choice', question: 'Để chống cong vẹo cột sống ở lứa tuổi học sinh, biện pháp quan trọng hàng đầu là:', options: ['Ngồi học đúng tư thế ngay ngắn, bàn ghế phù hợp chiều cao, không đeo cặp lệch 1 bên vai', 'Ngồi cong lưng cho thoải mái', 'Nằm bò ra bàn viết bài', 'Đeo cặp thật nặng lệch vai trái'], correctAnswer: 0, explanation: 'Tư thế ngồi học và mang vác cân đối bảo vệ cột sống.' },
      { id: 'b83_5', type: 'multiple_choice', question: 'Máu ở người gồm hai thành phần cơ bản nào?', options: ['Huyết tương (55%) và các tế bào máu (45%)', 'Chỉ gồm hồng cầu và nước', 'Bạch cầu và tiểu cầu', 'Huyết thanh và mỡ máu'], correctAnswer: 0, explanation: 'Huyết tương chiếm 55% và huyết cầu (hồng cầu, bạch cầu, tiểu cầu) chiếm 45%.' },
      { id: 'b83_6', type: 'multiple_choice', question: 'Tế bào máu nào có hình đĩa lõm hai mặt, không nhân và chứa huyết sắc tố hemoglobin (Hb) vận chuyển oxy?', options: ['Hồng cầu', 'Bạch cầu', 'Tiểu cầu', 'Tế bào lympho T'], correctAnswer: 0, explanation: 'Hồng cầu chứa hemoglobin chuyên trách vận chuyển O2 và CO2.' },
      { id: 'b83_7', type: 'multiple_choice', question: 'Bạch cầu bảo vệ cơ thể chống lại vi khuẩn, virus xâm nhập bằng cơ chế nào?', options: ['Thực bào và tiết kháng thể vô hiệu hóa kháng nguyên', 'Vận chuyển chất dinh dưỡng', 'Làm đông máu tại vết thương', 'Hấp thu chất độc thải ra mồ hôi'], correctAnswer: 0, explanation: 'Bạch cầu thực bào và sinh kháng thể miễn dịch.' },
      { id: 'b83_8', type: 'multiple_choice', question: 'Thành phần tế bào máu tham gia trực tiếp vào quá trình đông máu giúp hàn kín vết thương là:', options: ['Tiểu cầu', 'Hồng cầu', 'Bạch cầu mono', 'Huyết tương'], correctAnswer: 0, explanation: 'Tiểu cầu giải phóng enzym giải phóng sợi huyết fibrin tạo cục máu đông.' },
      { id: 'b83_9', type: 'multiple_choice', question: 'Hệ nhóm máu ABO ở người gồm 4 nhóm máu là:', options: ['A, B, AB và O', 'A, B, C và D', 'O, Rh+, Rh- và M', 'A1, A2, B1 và B2'], correctAnswer: 0, explanation: '4 nhóm máu hệ ABO xác định bởi kháng nguyên A, B trên hồng cầu.' },
      { id: 'b83_10', type: 'multiple_choice', question: 'Người có nhóm máu O được mệnh danh là nhóm máu gì trong truyền máu cấp cứu?', options: ['Nhóm máu chuyên cho (hồng cầu không có kháng nguyên A và B)', 'Nhóm máu chuyên nhận', 'Chỉ truyền được cho nhóm AB', 'Không truyền được cho ai'], correctAnswer: 0, explanation: 'Hồng cầu nhóm O không có kháng nguyên A, B nên không bị ngưng kết khi truyền cho các nhóm khác.' },
      { id: 'b83_11', type: 'multiple_choice', question: 'Tim người có cấu tạo gồm mấy ngăn?', options: ['4 ngăn (2 tâm nhĩ ở trên, 2 tâm thất ở dưới)', '2 ngăn', '3 ngăn', '5 ngăn'], correctAnswer: 0, explanation: 'Tim người có 4 ngăn: tâm nhĩ phải, tâm thất phải, tâm nhĩ trái, tâm thất trái.' },
      { id: 'b83_12', type: 'multiple_choice', question: 'Vòng tuần hoàn lớn (tuần hoàn cơ thể) bắt đầu từ ngăn nào của tim?', options: ['Tâm thất trái', 'Tâm thất phải', 'Tâm nhĩ trái', 'Tâm nhĩ phải'], correctAnswer: 0, explanation: 'Tâm thất trái bơm máu đỏ tươi giàu O2 vào động mạch chủ đi khắp cơ thể.' },
      { id: 'b83_13', type: 'multiple_choice', question: 'Huyết áp là gì?', options: ['Áp lực của dòng máu tác dụng lên thành mạch máu', 'Tốc độ chảy của máu trong mao mạch', 'Số nhịp đập của tim trong 1 phút', 'Lượng hồng cầu trong máu'], correctAnswer: 0, explanation: 'Huyết áp là áp lực của dòng máu ép vào thành mạch.' },
      { id: 'b83_14', type: 'multiple_choice', question: 'Huyết áp tiêu chuẩn của một người trưởng thành khỏe mạnh bình thường vào khoảng:', options: ['120/80 mmHg', '180/100 mmHg', '80/40 mmHg', '200/120 mmHg'], correctAnswer: 0, explanation: '120 mmHg là huyết áp tâm thu, 80 mmHg là huyết áp tâm trương.' },
      { id: 'b83_15', type: 'multiple_choice', question: 'Biện pháp nào giúp rèn luyện hệ tim mạch khỏe mạnh và phòng chống đột quỵ?', options: ['Tập thể dục thể thao đều đặn, ăn nhạt, hạn chế dầu mỡ động vật và không hút thuốc lá', 'Ăn nhiều mỡ động vật', 'Thức khuya chơi game liên tục', 'Uống nhiều rượu bia'], correctAnswer: 0, explanation: 'Vận động thể thao và lối sống lành mạnh bảo vệ tim mạch vững chắc.' },
      { id: 'b83_16', type: 'multiple_choice', question: 'Khi bị gãy xương cẳng tay, hành động sơ cứu khẩn cấp đúng quy cách là:', options: ['Dùng nẹp cố định xương gãy ở tư thế bất động rồi chuyển đến cơ sở y tế', 'Cố gắng nắn bóp thật mạnh cho xương thẳng lại', 'Kéo mạnh cổ tay ra xa', 'Chườm nước sôi nóng'], correctAnswer: 0, explanation: 'Bất động bằng nẹp gỗ/tre chống tổn thương mạch máu thần kinh.' },
      {
        id: 'b83_17',
        type: 'true_false',
        question: 'Về hệ vận động và hệ tuần hoàn ở người, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tâm thất trái có thành cơ tim dày nhất để tạo áp lực đẩy máu đi toàn cơ thể.', isCorrect: true },
          { subId: 'b', text: 'Người có nhóm máu AB có thể nhận máu từ bất kì nhóm máu nào trong hệ ABO nếu tuân thủ nguyên tắc an toàn.', isCorrect: true },
          { subId: 'c', text: 'Xương của người già dẻo dai hơn xương của trẻ em vì chứa nhiều chất hữu cơ.', isCorrect: false },
          { subId: 'd', text: 'Tiểu cầu là thành phần mang kháng thể tiêu diệt virus cúm.', isCorrect: false }
        ]
      },
      {
        id: 'b83_18',
        type: 'short_answer',
        question: 'Trái tim của con người khỏe mạnh bình thường được chia làm bao nhiêu ngăn (buồng tim)?',
        acceptableAnswers: ['4', '4 ngăn', 'bốn', 'bốn ngăn'],
        unit: 'ngăn',
        explanation: 'Trái tim người có 4 ngăn (2 tâm nhĩ và 2 tâm thất).'
      }
    ]
  },

  // ================= ĐỀ 4 - KHỐI 8 =================
  {
    id: 'exam-phy-8-02',
    title: 'Đề 4 - Vật lí 8: Tác dụng làm quay của lực và Đòn bẩy',
    subject: 'physics',
    grade: 8,
    testNumber: 'TX4',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-04',
    questions: [
      { id: 'p84_1', type: 'multiple_choice', question: 'Tác dụng làm quay của lực lên một vật có trục quay cố định phụ thuộc vào:', options: ['Độ lớn của lực và khoảng cách từ trục quay đến giá của lực (cánh tay đòn)', 'Chỉ phụ thuộc vào khối lượng của vật', 'Chỉ phụ thuộc vào màu sắc của vật', 'Nhiệt độ môi trường'], correctAnswer: 0, explanation: 'Moment lực M = F.d phụ thuộc vào lực F và cánh tay đòn d.' },
      { id: 'p84_2', type: 'multiple_choice', question: 'Đại lượng đặc trưng cho tác dụng làm quay của lực quanh một trục gọi là:', options: ['Moment lực', 'Công cơ học', 'Công suất', 'Động năng'], correctAnswer: 0, explanation: 'Moment lực đặc trưng cho tác dụng làm quay của lực.' },
      { id: 'p84_3', type: 'multiple_choice', question: 'Đơn vị đo của Moment lực trong hệ SI là:', options: ['Newton mét (N.m)', 'Joule (J)', 'Watt (W)', 'Newton trên mét (N/m)'], correctAnswer: 0, explanation: 'Đơn vị của moment lực là N.m.' },
      { id: 'p84_4', type: 'multiple_choice', question: 'Khoảng cách từ trục quay đến giá của lực được gọi là:', options: ['Cánh tay đòn của lực', 'Trọng tâm', 'Điểm tựa', 'Trục đối xứng'], correctAnswer: 0, explanation: 'Cánh tay đòn là khoảng cách vuông góc từ trục quay đến giá của lực.' },
      { id: 'p84_5', type: 'multiple_choice', question: 'Một cái đòn bẩy có điểm tựa O, điểm đặt vật chịu lực O1 và điểm tác dụng lực của tay O2. Đòn bẩy cho ta lợi về lực khi nào?', options: ['OO2 > OO1 (cánh tay đòn của lực tác dụng dài hơn cánh tay đòn của lực cản)', 'OO2 < OO1', 'OO2 = OO1', 'Không bao giờ lợi về lực'], correctAnswer: 0, explanation: 'Khi OO2 > OO1 thì F2 < F1, giúp ta được lợi về lực.' },
      { id: 'p84_6', type: 'multiple_choice', question: 'Dụng cụ nào sau đây là ứng dụng của đòn bẩy cho ta lợi về lực?', options: ['Kìm cắt kim loại / Xà beng bẩy đá', 'Đũa ăn cơm', 'Cần câu cá', 'Kẹp gắp than'], correctAnswer: 0, explanation: 'Kìm bấm và xà beng có tay cầm dài hơn lưỡi cắt nên nhân lực gấp nhiều lần.' },
      { id: 'p84_7', type: 'multiple_choice', question: 'Dụng cụ nào là đòn bẩy không cho ta lợi về lực nhưng cho ta lợi về đường đi và sự thuận tiện?', options: ['Cần câu cá / Cái kẹp đá', 'Cái mở nắp chai nước ngọt', 'Kéo cắt sắt', 'Xà beng'], correctAnswer: 0, explanation: 'Cần câu cá giúp giật dây đi xa và nhanh hơn dù phải dùng lực lớn hơn.' },
      { id: 'p84_8', type: 'multiple_choice', question: 'Để mở một bu-lông ốc vít bị siết quá chặt, người thợ sửa xe thường làm cách nào để vặn dễ dàng hơn?', options: ['Lắp thêm một đoạn ống sắt nối dài cán cờ-lê ra', 'Dùng cờ-lê ngắn hơn', 'Nắm tay sát vào đầu ốc', 'Đổ nước lạnh vào bu-lông'], correctAnswer: 0, explanation: 'Kéo dài cán cờ-lê làm tăng cánh tay đòn d, tăng moment lực làm quay ốc.' },
      { id: 'p84_9', type: 'multiple_choice', question: 'Quy tắc moment lực khẳng định: Một vật có trục quay cố định sẽ cân bằng khi:', options: ['Tổng các moment lực làm vật quay theo chiều kim đồng hồ bằng tổng các moment lực làm vật quay ngược chiều kim đồng hồ', 'Lực tác dụng bằng 0', 'Cánh tay đòn bằng nhau', 'Vật có khối lượng không đổi'], correctAnswer: 0, explanation: 'Điều kiện cân bằng tổng moment lực quay thuận bằng tổng moment lực quay ngược.' },
      { id: 'p84_10', type: 'multiple_choice', question: 'Cái bập bênh ở công viên có hai bạn ngồi hai bên. Để bập bênh thăng bằng nằm ngang, bạn nặng hơn phải ngồi thế nào?', options: ['Ngồi gần điểm tựa trục giữa hơn', 'Ngồi xa điểm tựa hơn', 'Ngồi nhảy lên nhảy xuống', 'Ngồi lệch sang mép ngoài'], correctAnswer: 0, explanation: 'P1 * d1 = P2 * d2: bạn nặng hơn (P1 lớn) phải có d1 nhỏ hơn (ngồi gần trục hơn).' },
      { id: 'p84_11', type: 'multiple_choice', question: 'Một lực F = 40 N tác dụng vuông góc vào cờ-lê cách trục quay ốc một khoảng 0.25 m. Moment của lực này là:', options: ['10 N.m', '160 N.m', '4 N.m', '100 N.m'], correctAnswer: 0, explanation: 'M = F * d = 40 * 0.25 = 10 N.m.' },
      { id: 'p84_12', type: 'multiple_choice', question: 'Cánh cửa mở ra vào quanh bản lề. Tay nắm cửa luôn được bố trí ở vị trí nào để mở cửa nhẹ nhàng nhất?', options: ['Ở mép ngoài xa bản lề nhất', 'Ở sát cạnh bản lề', 'Ở chính giữa cửa', 'Ở trên nóc cửa'], correctAnswer: 0, explanation: 'Xa bản lề nhất thì cánh tay đòn lớn nhất, moment quay lớn nhất với lực kéo nhỏ nhất.' },
      { id: 'p84_13', type: 'multiple_choice', question: 'Kéo cắt giấy thường có đặc điểm cấu tạo nào so với kéo cắt kim loại tấm?', options: ['Lưỡi kéo dài hơn tay cầm', 'Tay cầm dài hơn lưỡi kéo rất nhiều', 'Cả hai bằng nhau', 'Lưỡi kéo làm bằng cao su'], correctAnswer: 0, explanation: 'Cắt giấy không tốn lực nên lưỡi dài giúp đường cắt nhanh và thẳng.' },
      { id: 'p84_14', type: 'multiple_choice', question: 'Khối tâm (trọng tâm) của một thước thẳng đồng chất, tiết diện đều nằm ở đâu?', options: ['Chính giữa thước', 'Đầu thước bên trái', 'Đầu thước bên phải', 'Nằm ngoài thước'], correctAnswer: 0, explanation: 'Vật đồng chất hình học đối xứng có trọng tâm tại tâm đối xứng.' },
      { id: 'p84_15', type: 'multiple_choice', question: 'Mái chèo của người chèo thuyền kayak hoạt động theo nguyên lý đòn bẩy loại mấy?', options: ['Đòn bẩy loại 1 hoặc loại 3', 'Mặt phẳng nghiêng', 'Ròng rọc', 'Bánh xe'], correctAnswer: 0, explanation: 'Mái chèo là đòn bẩy truyền lực đẩy thuyền tiến về phía trước.' },
      { id: 'p84_16', type: 'multiple_choice', question: 'Khi tác dụng lực có giá đi qua trục quay của vật thì:', options: ['Lực không có tác dụng làm quay vật', 'Vật quay với tốc độ cực nhanh', 'Trục quay bị gãy ngay lập tức', 'Moment lực đạt giá trị cực đại'], correctAnswer: 0, explanation: 'Khi giá của lực đi qua trục quay thì cánh tay đòn d = 0 nên M = 0 (không làm quay).' },
      {
        id: 'p84_17',
        type: 'true_false',
        question: 'Về tác dụng làm quay của lực và đòn bẩy, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Cánh tay đòn càng dài thì moment lực tác dụng làm quay càng lớn với cùng một lực F.', isCorrect: true },
          { subId: 'b', text: 'Đòn bẩy luôn luôn cho ta lợi về cả lực lẫn đường đi.', isCorrect: false },
          { subId: 'c', text: 'Lực có giá cắt trục quay hoặc song song với trục quay không làm cho vật quay được.', isCorrect: true },
          { subId: 'd', text: 'Kìm bấm đinh là đòn bẩy cho ta thiệt về lực nhưng lợi về đường đi.', isCorrect: false }
        ]
      },
      {
        id: 'p84_18',
        type: 'short_answer',
        question: 'Một người tác dụng một lực F = 50 N vào đầu cờ-lê cách trục quay một khoảng d = 0.4 m theo phương vuông góc. Độ lớn Moment lực tạo ra bằng bao nhiêu Newton mét (N.m)?',
        acceptableAnswers: ['20', '20 N.m', '20Nm', '20 N m'],
        unit: 'N.m',
        explanation: 'M = F * d = 50 * 0.4 = 20 N.m.'
      }
    ]
  },

  // ================= ĐỀ 5 - KHỐI 8 =================
  {
    id: 'exam-phy-8-03',
    title: 'Đề 5 - Vật lí 8: Nhiệt năng và Các hình thức truyền nhiệt',
    subject: 'physics',
    grade: 8,
    testNumber: 'TX5',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-05',
    questions: [
      { id: 'p85_1', type: 'multiple_choice', question: 'Nhiệt năng của một vật là:', options: ['Tổng động năng của các phân tử cấu tạo nên vật', 'Tổng thế năng của vật so với mặt đất', 'Năng lượng ánh sáng vật phát ra', 'Công cơ học mà vật sinh ra'], correctAnswer: 0, explanation: 'Các phân tử chuyển động hỗn loạn không ngừng mang động năng, tổng là nhiệt năng.' },
      { id: 'p85_2', type: 'multiple_choice', question: 'Nhiệt độ của vật càng cao thì các phân tử cấu tạo nên vật:', options: ['Chuyển động càng nhanh và nhiệt năng của vật càng lớn', 'Chuyển động càng chậm lại', 'Dừng hẳn chuyển động', 'Nở to ra gấp 10 lần'], correctAnswer: 0, explanation: 'Nhiệt độ tỉ lệ thuận với tốc độ chuyển động nhiệt của phân tử.' },
      { id: 'p85_3', type: 'multiple_choice', question: 'Có hai cách làm thay đổi nhiệt năng của một vật là:', options: ['Thực hiện công và truyền nhiệt', 'Nén vật và kéo dãn vật', 'Sơn màu và đánh bóng', 'Đưa vật lên cao và hạ xuống thấp'], correctAnswer: 0, explanation: 'Cọ xát (thực hiện công) hoặc nhúng vào nước nóng (truyền nhiệt).' },
      { id: 'p85_4', type: 'multiple_choice', question: 'Hình thức truyền nhiệt chủ yếu trong chất rắn là gì?', options: ['Dẫn nhiệt', 'Đối lưu', 'Bức xạ nhiệt', 'Bay hơi'], correctAnswer: 0, explanation: 'Chất rắn truyền nhiệt chủ yếu bằng dẫn nhiệt từ phân tử này sang phân tử khác.' },
      { id: 'p85_5', type: 'multiple_choice', question: 'Kim loại nào sau đây dẫn nhiệt tốt nhất?', options: ['Bạc (Ag) và Đồng (Cu)', 'Gỗ', 'Thủy tinh', 'Nhựa'], correctAnswer: 0, explanation: 'Bạc và đồng là kim loại dẫn nhiệt và dẫn điện tốt nhất.' },
      { id: 'p85_6', type: 'multiple_choice', question: 'Hình thức truyền nhiệt chủ yếu trong chất lỏng và chất khí là:', options: ['Đối lưu (các dòng chất lỏng hoặc khí nóng bốc lên, lạnh chìm xuống)', 'Dẫn nhiệt', 'Bức xạ nhiệt', 'Truyền sóng'], correctAnswer: 0, explanation: 'Đối lưu là sự truyền nhiệt bằng các dòng chất lỏng hoặc khí.' },
      { id: 'p85_7', type: 'multiple_choice', question: 'Nhiệt năng từ Mặt Trời truyền qua khoảng chân không vũ trụ đến Trái Đất bằng hình thức nào?', options: ['Bức xạ nhiệt (dưới dạng sóng điện từ / tia hồng ngoại)', 'Dẫn nhiệt', 'Đối lưu', 'Dẫn điện'], correctAnswer: 0, explanation: 'Bức xạ nhiệt truyền được trong chân không mà không cần môi trường vật chất.' },
      { id: 'p85_8', type: 'multiple_choice', question: 'Vật có bề mặt xù xì và màu tối sẫm có đặc điểm hấp thụ bức xạ nhiệt như thế nào?', options: ['Hấp thụ bức xạ nhiệt rất tốt', 'Phản xạ hoàn toàn bức xạ nhiệt', 'Không bao giờ nóng lên', 'Tỏa nhiệt nhanh nhất'], correctAnswer: 0, explanation: 'Màu đen sẫm và sần sùi hấp thụ bức xạ nhiệt mạnh nhất.' },
      { id: 'p85_9', type: 'multiple_choice', question: 'Tại sao xoong, nồi nấu bếp thường làm bằng kim loại còn quai cầm lại bọc nhựa hoặc gỗ?', options: ['Đáy kim loại dẫn nhiệt nhanh nấu chín thức ăn, quai nhựa cách nhiệt chống bỏng tay', 'Để giảm giá thành sản xuất', 'Để làm cho nồi nhẹ hơn', 'Để trang trí'], correctAnswer: 0, explanation: 'Kim loại dẫn nhiệt tốt, nhựa/gỗ dẫn nhiệt kém chống bỏng tay.' },
      { id: 'p85_10', type: 'multiple_choice', question: 'Vào mùa đông lạnh giá, mặc nhiều lớp áo mỏng ấm hơn mặc một lớp áo dày vì:', options: ['Giữa các lớp áo có các lớp không khí dẫn nhiệt rất kém (cách nhiệt tốt)', 'Nhiều áo làm tăng cân nặng', 'Các lớp áo tự sinh ra nhiệt', 'Màu sắc các áo phối hợp lại'], correctAnswer: 0, explanation: 'Không khí đứng yên là chất dẫn nhiệt cực kém, giữ ấm cơ thể.' },
      { id: 'p85_11', type: 'multiple_choice', question: 'Phích nước (bình thủy) giữ nước nóng lâu nhờ cấu tạo ruột phích có:', options: ['Hai lớp thủy tinh tráng bạc ngăn bức xạ nhiệt và lớp chân không ở giữa ngăn dẫn nhiệt, đối lưu', 'Lớp đồng dày', 'Lớp cát mịn cách nhiệt', 'Lớp nước đá'], correctAnswer: 0, explanation: 'Lớp chân không và mặt tráng bạc chặn cả 3 hình thức truyền nhiệt.' },
      { id: 'p85_12', type: 'multiple_choice', question: 'Công thức tính nhiệt lượng một vật thu vào để nóng lên là:', options: ['Q = m . c . Δt', 'Q = m / (c . Δt)', 'Q = m . g . h', 'Q = F . s'], correctAnswer: 0, explanation: 'Q = m.c.Δt với c là nhiệt dung riêng của chất.' },
      { id: 'p85_13', type: 'multiple_choice', question: 'Nhiệt dung riêng của nước rất lớn (khoảng 4200 J/kg.K) có ý nghĩa thực tế nào?', options: ['Nước hấp thụ và tỏa nhiệt chậm, giúp điều hòa khí hậu vùng biển mát mẻ', 'Nước sôi ở nhiệt độ rất thấp', 'Nước dẫn nhiệt tốt nhất', 'Nước không bao giờ đóng băng'], correctAnswer: 0, explanation: 'Nước làm chất điều hòa nhiệt độ tuyệt vời trên hành tinh.' },
      { id: 'p85_14', type: 'multiple_choice', question: 'Nguyên lí truyền nhiệt khẳng định nhiệt lượng tự động truyền từ:', options: ['Vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn', 'Vật có khối lượng lớn sang vật nhỏ', 'Vật ở trên cao sang vật ở dưới thấp', 'Vật màu tối sang vật màu sáng'], correctAnswer: 0, explanation: 'Nhiệt chỉ tự truyền từ nơi nhiệt độ cao sang nơi nhiệt độ thấp hơn.' },
      { id: 'p85_15', type: 'multiple_choice', question: 'Phương trình cân bằng nhiệt cho hai vật trao đổi nhiệt hoàn toàn là:', options: ['Q_tỏa = Q_thu', 'Q_tỏa > Q_thu', 'Q_tỏa < Q_thu', 'Q_tỏa + Q_thu = 0'], correctAnswer: 0, explanation: 'Nhiệt lượng vật nóng tỏa ra bằng nhiệt lượng vật lạnh thu vào.' },
      { id: 'p85_16', type: 'multiple_choice', question: 'Khi đun nước trong ấm, ngọn lửa đặt ở đáy ấm là để tận dụng hình thức truyền nhiệt nào?', options: ['Hiện tượng đối lưu làm toàn bộ khối nước trong ấm nóng đều nhanh nhất', 'Hiện tượng dẫn nhiệt xuyên qua nước', 'Bức xạ nhiệt mặt nước', 'Bay hơi nước'], correctAnswer: 0, explanation: 'Nước nóng ở đáy nở ra nhẹ hơn nổi lên, nước lạnh ở trên chìm xuống tạo dòng đối lưu.' },
      {
        id: 'p85_17',
        type: 'true_false',
        question: 'Về nhiệt năng và truyền nhiệt, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Bức xạ nhiệt có thể truyền qua được môi trường chân không.', isCorrect: true },
          { subId: 'b', text: 'Chất khí dẫn nhiệt tốt hơn chất rắn kim loại.', isCorrect: false },
          { subId: 'c', text: 'Nhiệt truyền tự phát từ vật có nhiệt độ thấp sang vật có nhiệt độ cao.', isCorrect: false },
          { subId: 'd', text: 'Nước có nhiệt dung riêng cao nên được dùng làm chất làm mát trong động cơ ô tô.', isCorrect: true }
        ]
      },
      {
        id: 'p85_18',
        type: 'short_answer',
        question: 'Tính nhiệt lượng cần cung cấp để đun nóng 1 kg nước (c = 4200 J/kg.K) tăng thêm 10 °C theo đơn vị Joule (J)?',
        acceptableAnswers: ['42000', '42000J', '42000 J', '42.000'],
        unit: 'J',
        explanation: 'Q = m * c * Δt = 1 * 4200 * 10 = 42 000 J.'
      }
    ]
  },

  // ================= ĐỀ 6 - KHỐI 8 =================
  {
    id: 'exam-chem-8-02',
    title: 'Đề 6 - Hóa học 8: Dung dịch, Độ tan và Nồng độ dung dịch',
    subject: 'chemistry',
    grade: 8,
    testNumber: 'TX6',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-06',
    questions: [
      { id: 'c86_1', type: 'multiple_choice', question: 'Dung dịch là một hệ đồng nhất gồm:', options: ['Chất tan phân tán đều trong dung môi', 'Hai chất rắn trộn lẫn', 'Chất lỏng và chất không tan lơ lửng', 'Hỗn hợp dầu ăn và nước'], correctAnswer: 0, explanation: 'Dung dịch là hỗn hợp đồng nhất giữa chất tan và dung môi.' },
      { id: 'c86_2', type: 'multiple_choice', question: 'Độ tan (S) của một chất trong nước là:', options: ['Số gam chất đó hòa tan tối đa trong 100 gam nước ở nhiệt độ xác định để tạo thành dung dịch bão hòa', 'Số gam chất tan trong 1 lít nước', 'Thể tích chất tan trong dung dịch', 'Khối lượng chất tan không hòa tan được'], correctAnswer: 0, explanation: 'Định nghĩa độ tan: số gam chất tan tối đa trong 100g nước.' },
      { id: 'c86_3', type: 'multiple_choice', question: 'Độ tan của đa số các chất rắn trong nước thay đổi như thế nào khi tăng nhiệt độ?', options: ['Tăng lên', 'Giảm đi', 'Không thay đổi', 'Biến mất hoàn toàn'], correctAnswer: 0, explanation: 'Nhiệt độ tăng làm tăng động năng phân tử, độ tan chất rắn đa số tăng.' },
      { id: 'c86_4', type: 'multiple_choice', question: 'Độ tan của chất khí trong nước thay đổi thế nào khi tăng nhiệt độ và giảm áp suất?', options: ['Giảm đi', 'Tăng lên rất mạnh', 'Không đổi', 'Biến thành chất lỏng'], correctAnswer: 0, explanation: 'Chất khí bay ra khỏi nước khi đun nóng (độ tan giảm).' },
      { id: 'c86_5', type: 'multiple_choice', question: 'Nồng độ phần trăm (C%) của dung dịch cho biết:', options: ['Số gam chất tan có trong 100 gam dung dịch', 'Số mol chất tan trong 1 lít dung dịch', 'Số gam chất tan trong 100 gam nước', 'Thể tích dung dịch'], correctAnswer: 0, explanation: 'C% = (m_ct / m_dd) * 100%.' },
      { id: 'c86_6', type: 'multiple_choice', question: 'Công thức tính nồng độ phần trăm (C%) là:', options: ['C% = (m_ct / m_dd) x 100%', 'C% = (m_dd / m_ct) x 100%', 'C% = m_ct x V_dd', 'C% = n / V'], correctAnswer: 0, explanation: 'm_ct là khối lượng chất tan, m_dd là khối lượng dung dịch.' },
      { id: 'c86_7', type: 'multiple_choice', question: 'Hòa tan 15 g đường vào 85 g nước. Nồng độ phần trăm của dung dịch nước đường thu được là:', options: ['15%', '17.6%', '10%', '20%'], correctAnswer: 0, explanation: 'm_dd = 15 + 85 = 100 g -> C% = (15 / 100) * 100% = 15%.' },
      { id: 'c86_8', type: 'multiple_choice', question: 'Nồng độ mol (CM) của dung dịch cho biết:', options: ['Số mol chất tan có trong 1 lít dung dịch', 'Số gam chất tan trong 100 g dung dịch', 'Số mol chất tan trong 100 g nước', 'Thể tích chất tan'], correctAnswer: 0, explanation: 'C_M = n / V (mol/L hay M).' },
      { id: 'c86_9', type: 'multiple_choice', question: 'Hòa tan 0.5 mol muối NaCl vào nước thu được 250 mL dung dịch. Nồng độ mol của dung dịch NaCl là:', options: ['2.0 M', '0.5 M', '1.0 M', '0.125 M'], correctAnswer: 0, explanation: 'V = 0.25 L -> C_M = 0.5 / 0.25 = 2.0 M.' },
      { id: 'c86_10', type: 'multiple_choice', question: 'Dung dịch bão hòa là dung dịch:', options: ['Không thể hòa tan thêm chất tan đó ở nhiệt độ xác định', 'Có thể hòa tan thêm chất tan', 'Đã chuyển thành chất rắn', 'Bị bốc hơi hết nước'], correctAnswer: 0, explanation: 'Dung dịch bão hòa đã đạt trạng thái cân bằng hòa tan tối đa.' },
      { id: 'c86_11', type: 'multiple_choice', question: 'Nước muối sinh lí dùng để rửa mắt, mũi, súc họng có nồng độ muối NaCl là bao nhiêu %?', options: ['0.9%', '9%', '5%', '0.09%'], correctAnswer: 0, explanation: 'Nước muối sinh lý đẳng trương với dịch cơ thể người là 0.9%.' },
      { id: 'c86_12', type: 'multiple_choice', question: 'Để pha loãng một dung dịch đặc, người ta thêm chất nào vào?', options: ['Thêm dung môi (nước cất)', 'Thêm chất tan đặc', 'Đun sôi cô cạn', 'Lọc qua giấy lọc'], correctAnswer: 0, explanation: 'Thêm nước làm tăng thể tích dung môi, giảm nồng độ.' },
      { id: 'c86_13', type: 'multiple_choice', question: 'Khối lượng dung dịch (m_dd) được tính bằng:', options: ['m_dd = m_chất tan + m_dung môi', 'm_dd = m_chất tan - m_dung môi', 'm_dd = m_chất tan x m_dung môi', 'm_dd = V_dd x 100'], correctAnswer: 0, explanation: 'm_dd = m_ct + m_dm.' },
      { id: 'c86_14', type: 'multiple_choice', question: 'Tại sao khi mở nắp chai nước ngọt có ga lại thấy bọt khí sủi lên ào ạt?', options: ['Vì áp suất trong chai giảm đột ngột làm giảm độ tan của khí CO2 trong nước', 'Vì nước ngọt bị nóng lên tức thì', 'Vì vi khuẩn phát triển nhanh', 'Vì khí oxy tràn vào'], correctAnswer: 0, explanation: 'Độ tan của khí CO2 giảm mạnh khi giảm áp suất.' },
      { id: 'c86_15', type: 'multiple_choice', question: 'Cần bao nhiêu gam NaOH để pha chế được 100 g dung dịch NaOH 10%?', options: ['10 g', '20 g', '5 g', '90 g'], correctAnswer: 0, explanation: 'm_NaOH = (100 * 10) / 100 = 10 g.' },
      { id: 'c86_16', type: 'multiple_choice', question: 'Đơn vị của nồng độ mol kí hiệu là:', options: ['M (hoặc mol/L)', 'g/mL', '%', 'amu'], correctAnswer: 0, explanation: 'Kí hiệu M viết tắt của mol/L (Molar).' },
      {
        id: 'c86_17',
        type: 'true_false',
        question: 'Về dung dịch và nồng độ, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Nồng độ phần trăm C% không phụ thuộc vào thể tích dung môi nước.', isCorrect: false },
          { subId: 'b', text: 'Nước muối sinh lý 0.9% là dung dịch có 0.9 g NaCl trong 100 g dung dịch.', isCorrect: true },
          { subId: 'c', text: 'Khi tăng nhiệt độ thì độ tan của các chất khí như O2, CO2 trong nước tăng lên.', isCorrect: false },
          { subId: 'd', text: 'Thêm nước cất vào dung dịch làm nồng độ mol của dung dịch giảm đi.', isCorrect: true }
        ]
      },
      {
        id: 'c86_18',
        type: 'short_answer',
        question: 'Hòa tan 20 g đường vào 180 g nước cất. Nồng độ phần trăm (C%) của dung dịch đường thu được bằng bao nhiêu phần trăm (%)?',
        acceptableAnswers: ['10', '10%', '10 %'],
        unit: '%',
        explanation: 'm_dd = 20 + 180 = 200 g. C% = (20 / 200) * 100% = 10%.'
      }
    ]
  },

  // ================= ĐỀ 7 - KHỐI 8 =================
  {
    id: 'exam-bio-8-02',
    title: 'Đề 7 - Sinh học 8: Hệ thần kinh, Giác quan và Tuyến nội tiết',
    subject: 'biology',
    grade: 8,
    testNumber: 'TX7',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-07',
    questions: [
      { id: 'b87_1', type: 'multiple_choice', question: 'Đơn vị cấu tạo và chức năng cơ bản của hệ thần kinh là:', options: ['Neuron (tế bào thần kinh)', 'Tế bào cơ tim', 'Tế bào biểu bì', 'Tế bào lympho'], correctAnswer: 0, explanation: 'Neuron là tế bào thần kinh chuyên trách tiếp nhận và dẫn truyền xung thần kinh.' },
      { id: 'b87_2', type: 'multiple_choice', question: 'Bộ phận thần kinh trung ương ở người gồm hai cơ quan nào?', options: ['Não bộ và tủy sống', 'Dây thần kinh và hạch thần kinh', 'Tim và phổi', 'Mắt và tai'], correctAnswer: 0, explanation: 'Não nằm trong hộp sọ và tủy sống nằm trong ống xương sống tạo thành thần kinh trung ương.' },
      { id: 'b87_3', type: 'multiple_choice', question: 'Đại não người có bề mặt nhiều nếp gấp khúc và khe rãnh có tác dụng gì?', options: ['Làm tăng diện tích bề mặt của vỏ não chứa hàng tỉ neuron', 'Làm não nhẹ hơn', 'Để máu lưu thông dễ hơn', 'Chống chấn thương va đập'], correctAnswer: 0, explanation: 'Các nếp nhăn tăng diện tích vỏ não lên đến 2200 cm².' },
      { id: 'b87_4', type: 'multiple_choice', question: 'Cơ quan phân tích thị giác (mắt) có thấu kính sinh học giúp hội tụ ánh sáng là:', options: ['Thể thủy tinh', 'Giác mạc', 'Màng giác', 'Điểm vàng'], correctAnswer: 0, explanation: 'Thể thủy tinh là thấu kính hội tụ trong suốt điều tiết độ cong.' },
      { id: 'b87_5', type: 'multiple_choice', question: 'Tật khúc xạ cận thị ở học sinh là hiện tượng ảnh của vật hội tụ ở đâu khi không điều tiết?', options: ['Ở phía trước màng lưới (võng mạc)', 'Ở phía sau màng lưới', 'Đúng trên điểm vàng', 'Bị tán sắc biến mất'], correctAnswer: 0, explanation: 'Cận thị do trục nhãn cầu dài hoặc thể thủy tinh quá phồng, ảnh rơi trước võng mạc.' },
      { id: 'b87_6', type: 'multiple_choice', question: 'Để khắc phục tật cận thị mắt, người ta phải đeo kính gì?', options: ['Kính phân kì (kính lõm)', 'Kính hội tụ (kính lồi)', 'Kính râm tối màu', 'Kính lúp'], correctAnswer: 0, explanation: 'Thấu kính phân kì kéo ảnh lùi về đúng trên màng lưới.' },
      { id: 'b87_7', type: 'multiple_choice', question: 'Cơ quan phân tích thính giác (tai) tiếp nhận sóng âm thanh nhờ bộ phận thụ cảm nào?', options: ['Cơ quan Corti trong ốc tai', 'Màng nhĩ', 'Vành tai hứng âm', 'Ống tai ngoài'], correctAnswer: 0, explanation: 'Cơ quan Corti chứa tế bào thụ cảm thính giác chuyển rung động thành xung thần kinh.' },
      { id: 'b87_8', type: 'multiple_choice', question: 'Tuyến nội tiết có đặc điểm cấu tạo nổi bật nào phân biệt với tuyến ngoại tiết?', options: ['Không có ống dẫn chất tiết, hormone ngấm thẳng vào dòng máu', 'Có ống dẫn chất tiết ra ngoài da', 'Chỉ tiết ra dịch tiêu hóa', 'Không có mạch máu nuôi'], correctAnswer: 0, explanation: 'Tuyến nội tiết giải phóng hormone trực tiếp vào máu.' },
      { id: 'b87_9', type: 'multiple_choice', question: 'Tuyến nội tiết nào được ví là "nhạc trưởng" chỉ huy hoạt động của nhiều tuyến nội tiết khác?', options: ['Tuyến yên (nằm ở đáy não)', 'Tuyến giáp', 'Tuyến tụy', 'Tuyến thượng thận'], correctAnswer: 0, explanation: 'Tuyến yên tiết các hormone kích thích tuyến giáp, vỏ thượng thận, tuyến sinh dục.' },
      { id: 'b87_10', type: 'multiple_choice', question: 'Hormone Insulin do đảo tụy tiết ra có chức năng điều hòa sinh học quan trọng nào?', options: ['Hạ nồng độ đường glucose trong máu khi đường huyết tăng cao', 'Làm tăng đường huyết khi đói', 'Kích thích phát triển xương dài', 'Tăng nhịp tim'], correctAnswer: 0, explanation: 'Insulin chuyển glucose thành glycogen dự trữ trong gan và cơ.' },
      { id: 'b87_11', type: 'multiple_choice', question: 'Bệnh bướu cổ do thiếu khoáng chất vi lượng nào trong khẩu phần ăn hàng ngày?', options: ['Iodine (I-ốt)', 'Sắt (Fe)', 'Canxi (Ca)', 'Kẽm (Zn)'], correctAnswer: 0, explanation: 'Thiếu I-ốt tuyến giáp không tổng hợp đủ thyroxine phải phì đại tạo bướu cổ.' },
      { id: 'b87_12', type: 'multiple_choice', question: 'Hormone Adrenaline do tủy tuyến thượng thận tiết ra khi con người gặp tình huống căng thẳng hay sợ hãi có tác dụng:', options: ['Tăng nhịp tim, tăng huyết áp, tăng đường huyết giúp cơ thể sẵn sàng chiến đấu hoặc tháo chạy', 'Gây buồn ngủ sâu', 'Hạ nhịp tim xuống thấp', 'Làm giãn cơ bắp hoàn toàn'], correctAnswer: 0, explanation: 'Adrenaline chuẩn bị phản ứng "chiến đấu hoặc bỏ chạy" (fight or flight).' },
      { id: 'b87_13', type: 'multiple_choice', question: 'Giấc ngủ có vai trò sống còn nào đối với hệ thần kinh và sức khỏe?', options: ['Phục hồi chức năng của vỏ não sau một ngày làm việc và tái tạo năng lượng', 'Làm teo neuron thần kinh', 'Tiêu hao calo dự trữ', 'Làm ngừng tuần hoàn'], correctAnswer: 0, explanation: 'Ngủ đủ giấc giúp não đào thải chất cặn bã và củng cố trí nhớ.' },
      { id: 'b87_14', type: 'multiple_choice', question: 'Các chất kích thích như ma túy, rượu bia, thuốc lá gây tác hại nghiêm trọng nào đến hệ thần kinh?', options: ['Gây tổn thương neuron, suy giảm trí nhớ, rối loạn cảm xúc và dẫn đến nghiện ngập', 'Giúp tăng chỉ số thông minh vĩnh viễn', 'Làm mắt sáng hơn', 'Tăng phản xạ vận động'], correctAnswer: 0, explanation: 'Chất kích thích tàn phá hệ thần kinh trung ương và hành vi con người.' },
      { id: 'b87_15', type: 'multiple_choice', question: 'Thói quen nào giúp phòng ngừa tật cận thị học đường?', options: ['Giữ khoảng cách đọc sách từ 25 - 30 cm, đủ ánh sáng và nghỉ ngơi mắt sau mỗi 45 phút', 'Đọc sách khi nằm trên giường thiếu sáng', 'Dùng điện thoại sát mắt trong bóng tối', 'Đọc sách khi xe đang xóc'], correctAnswer: 0, explanation: 'Quy tắc 20-20-20 và tư thế ngồi chuẩn bảo vệ thị lực.' },
      { id: 'b87_16', type: 'multiple_choice', question: 'Tiểu não có chức năng điều hòa hoạt động nào của cơ thể?', options: ['Điều hòa và phối hợp các cử động phức tạp, giữ thăng bằng cho cơ thể', 'Tư duy trừu tượng và ngôn ngữ', 'Nhận biết mùi vị', 'Điều hòa nhịp thở tự động'], correctAnswer: 0, explanation: 'Tiểu não chịu trách nhiệm giữ thăng bằng và định hướng không gian.' },
      {
        id: 'b87_17',
        type: 'true_false',
        question: 'Về hệ thần kinh và tuyến nội tiết, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tuyến nội tiết có ống dẫn đổ chất tiết trực tiếp vào khoang tiêu hóa.', isCorrect: false },
          { subId: 'b', text: 'Insulin là hormone làm hạ đường huyết khi ăn no.', isCorrect: true },
          { subId: 'c', text: 'Người bị cận thị cần đeo thấu kính phân kì để nhìn rõ vật ở xa.', isCorrect: true },
          { subId: 'd', text: 'Sử dụng muối ăn có bổ sung I-ốt giúp phòng chống bệnh bướu cổ đơn thuần.', isCorrect: true }
        ]
      },
      {
        id: 'b87_18',
        type: 'short_answer',
        question: 'Để phòng ngừa tật cận thị học đường, khoảng cách an toàn từ mắt đến trang sách khi ngồi học chuẩn vào khoảng bao nhiêu centimét (cm)?',
        acceptableAnswers: ['25-30', '30', '25', '25 - 30', '25-30cm', '30cm'],
        unit: 'cm',
        explanation: 'Khoảng cách đọc sách tiêu chuẩn là 25 đến 30 cm.'
      }
    ]
  },

  // ================= ĐỀ 8 - KHỐI 8 =================
  {
    id: 'exam-int-8-01',
    title: 'Đề 8 - Hóa học 8: Acid, Base, Oxide, Muối và Thang pH',
    subject: 'chemistry',
    grade: 8,
    testNumber: 'TX8',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-08',
    questions: [
      { id: 'c88_1', type: 'multiple_choice', question: 'Acid là những hợp chất mà phân tử gồm có:', options: ['Một hay nhiều nguyên tử Hydro liên kết với gốc acid', 'Nguyên tử kim loại liên kết với nhóm OH', 'Kim loại liên kết với nguyên tử oxy', 'Chỉ có hai nguyên tố phi kim'], correctAnswer: 0, explanation: 'Acid có dạng H_n A, khi tan trong nước tạo ion H+.' },
      { id: 'c88_2', type: 'multiple_choice', question: 'Dung dịch acid làm đổi màu giấy quỳ tím thành màu gì?', options: ['Màu đỏ (hoặc hồng)', 'Màu xanh', 'Màu vàng', 'Không đổi màu'], correctAnswer: 0, explanation: 'Acid làm quỳ tím hóa đỏ.' },
      { id: 'c88_3', type: 'multiple_choice', question: 'Dung dịch base làm đổi màu giấy quỳ tím và dung dịch phenolphthalein lần lượt thành màu gì?', options: ['Quỳ tím hóa xanh, phenolphthalein hóa hồng', 'Quỳ tím hóa đỏ, phenolphthalein hóa xanh', 'Cả hai đều hóa đỏ', 'Không đổi màu'], correctAnswer: 0, explanation: 'Base làm quỳ tím hóa xanh và phenolphthalein không màu chuyển sang màu hồng tím.' },
      { id: 'c88_4', type: 'multiple_choice', question: 'Thang pH dùng để biểu thị độ acid hay base của dung dịch có giá trị từ:', options: ['0 đến 14', '0 đến 10', '1 đến 7', '0 đến 100'], correctAnswer: 0, explanation: 'Thang pH chuẩn chạy từ 0 đến 14.' },
      { id: 'c88_5', type: 'multiple_choice', question: 'Một dung dịch có pH = 7 ở 25°C là môi trường:', options: ['Trung tính (như nước tinh khiết)', 'Acid mạnh', 'Base mạnh', 'Chất độc hại'], correctAnswer: 0, explanation: 'pH = 7 là môi trường trung tính.' },
      { id: 'c88_6', type: 'multiple_choice', question: 'Dung dịch có pH < 7 là môi trường nào và giá trị pH càng nhỏ thì:', options: ['Môi trường acid, tính acid càng mạnh', 'Môi trường base, tính base càng mạnh', 'Môi trường trung tính', 'Môi trường muối'], correctAnswer: 0, explanation: 'pH < 7 là acid, pH càng nhỏ tính acid càng mạnh.' },
      { id: 'c88_7', type: 'multiple_choice', question: 'Dung dịch acid dạ dày ở người có thành phần chính là acid nào giúp tiêu hóa thức ăn và diệt khuẩn?', options: ['HCl (Acid hydrochloric)', 'H2SO4 đặc', 'HNO3', 'H2S'], correctAnswer: 0, explanation: 'Dịch vị dạ dày chứa acid HCl loãng pH khoảng 1.5 - 2.5.' },
      { id: 'c88_8', type: 'multiple_choice', question: 'Oxide là hợp chất gồm hai nguyên tố, trong đó nhất thiết phải có một nguyên tố là:', options: ['Oxygen (Oxy)', 'Hydrogen', 'Nitrogen', 'Carbon'], correctAnswer: 0, explanation: 'Oxide là hợp chất của 2 nguyên tố, trong đó có 1 nguyên tố là oxy.' },
      { id: 'c88_9', type: 'multiple_choice', question: 'Oxide nào sau đây là basic oxide tác dụng với acid tạo thành muối và nước?', options: ['CaO (Canxi oxit) / Na2O', 'CO2', 'SO2', 'P2O5'], correctAnswer: 0, explanation: 'CaO là oxide của kim loại, là basic oxide.' },
      { id: 'c88_10', type: 'multiple_choice', question: 'Oxide nào sau đây là acidic oxide tác dụng với dung dịch base tạo muối và nước?', options: ['CO2 (Carbon dioxide) / SO2', 'CuO', 'Fe2O3', 'BaO'], correctAnswer: 0, explanation: 'CO2, SO2 là oxide của phi kim, là acidic oxide.' },
      { id: 'c88_11', type: 'multiple_choice', question: 'Phản ứng trung hòa là phản ứng hóa học giữa:', options: ['Acid và Base tạo muối và nước', 'Kim loại và phi kim', 'Nhiên liệu và oxy', 'Muối và oxit'], correctAnswer: 0, explanation: 'Acid + Base -> Muối + Nước (phản ứng trung hòa).' },
      { id: 'c88_12', type: 'multiple_choice', question: 'Để khử chua (giảm độ acid) cho đất nông nghiệp nghèo dinh dưỡng ở vùng chua phèn, nông dân thường bón chất nào?', options: ['Vôi bột (CaO hoặc Ca(OH)2)', 'Muối ăn (NaCl)', 'Acid sulfuric', 'Phân đạm ure đậm đặc'], correctAnswer: 0, explanation: 'Vôi bột có tính base trung hòa bớt acid trong đất chua.' },
      { id: 'c88_13', type: 'multiple_choice', question: 'Khí thải SO2 và NO2 từ các nhà máy nhiệt điện than là nguyên nhân chính gây ra hiện tượng:', options: ['Mưa acid phá hủy rừng cây và công trình kiến trúc đá vôi', 'Thủng tầng ozone cục bộ', 'Băng tan', 'Nước biển dâng'], correctAnswer: 0, explanation: 'SO2 và NO2 kết hợp hơi nước trong mây tạo acid sulfuric và nitric gây mưa acid.' },
      { id: 'c88_14', type: 'multiple_choice', question: 'Muối ăn gia vị hàng ngày có công thức hóa học là:', options: ['NaCl (Sodium chloride)', 'KCl', 'CaCl2', 'CaCO3'], correctAnswer: 0, explanation: 'Muối ăn là natri clorua NaCl.' },
      { id: 'c88_15', type: 'multiple_choice', question: 'Khi kim loại kẽm (Zn) tác dụng với dung dịch acid HCl, hiện tượng quan sát được là:', options: ['Kẽm tan dần và có bọt khí không màu H2 thoát ra', 'Không có hiện tượng gì', 'Tạo kết tủa đen', 'Khí màu nâu bay lên'], correctAnswer: 0, explanation: 'Zn + 2HCl -> ZnCl2 + H2↑.' },
      { id: 'c88_16', type: 'multiple_choice', question: 'Nước vôi trong có công thức hóa học là:', options: ['Ca(OH)2', 'CaO', 'CaCO3', 'CaCl2'], correctAnswer: 0, explanation: 'Nước vôi trong là dung dịch canxi hydroxide Ca(OH)2.' },
      {
        id: 'c88_17',
        type: 'true_false',
        question: 'Về acid, base và thang pH, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Dung dịch có pH = 3 có tính acid mạnh hơn dung dịch có pH = 6.', isCorrect: true },
          { subId: 'b', text: 'Quỳ tím chuyển sang màu xanh khi nhúng vào dung dịch giấm ăn (chứa acid axetic).', isCorrect: false },
          { subId: 'c', text: 'Vôi tôi Ca(OH)2 được dùng để khử chua đất nông nghiệp.', isCorrect: true },
          { subId: 'd', text: 'Nước tinh khiết ở 25°C có giá trị pH = 7 là môi trường trung tính.', isCorrect: true }
        ]
      },
      {
        id: 'c88_18',
        type: 'short_answer',
        question: 'Giá trị pH của nước tinh khiết ở nhiệt độ 25 °C đặc trưng cho môi trường trung tính bằng bao nhiêu?',
        acceptableAnswers: ['7', '7.0', 'bảy'],
        unit: 'pH',
        explanation: 'Môi trường trung tính có pH = 7.'
      }
    ]
  }
];
