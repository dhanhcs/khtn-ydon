import { Exam } from '../types';

export const additionalExams: Exam[] = [
  // ================= GRADE 6 EXAMS =================
  {
    id: 'exam-phy-6-01',
    title: 'KTTX Lần 1 - Vật lí 6: Đo độ dài, khối lượng và thời gian',
    subject: 'physics',
    grade: 6,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-01',
    questions: [
      { id: 'p6_1', type: 'multiple_choice', question: 'Đơn vị đo độ dài hợp pháp của nước Việt Nam theo hệ SI là gì?', options: ['Mét (m)', 'Centimét (cm)', 'Milimét (mm)', 'Kilômét (km)'], correctAnswer: 0 },
      { id: 'p6_2', type: 'multiple_choice', question: 'Giới hạn đo (GHĐ) của thước là:', options: ['Độ dài lớn nhất ghi trên thước', 'Độ dài nhỏ nhất ghi trên thước', 'Độ dài giữa hai vạch chia liên tiếp', 'Chiều dài của cái thước'], correctAnswer: 0 },
      { id: 'p6_3', type: 'multiple_choice', question: 'Độ chia nhỏ nhất (ĐCNN) của thước là:', options: ['Độ dài giữa hai vạch chia liên tiếp trên thước', 'Độ dài nhỏ nhất ghi trên thước', 'Vạch số 0 trên thước', 'Khoảng cách giữa vạch 0 và vạch 1'], correctAnswer: 0 },
      { id: 'p6_4', type: 'multiple_choice', question: 'Dụng cụ nào dùng để đo khối lượng của một vật?', options: ['Cân điện tử / Cân Roberval', 'Thước dây', 'Nhiệt kế', 'Bình chia độ'], correctAnswer: 0 },
      { id: 'p6_5', type: 'multiple_choice', question: 'Một kilôgam (1 kg) bằng bao nhiêu gam (g)?', options: ['1000 g', '100 g', '10 g', '10000 g'], correctAnswer: 0 },
      { id: 'p6_6', type: 'multiple_choice', question: 'Đơn vị chuẩn đo thời gian trong hệ đo lường SI là:', options: ['Giây (s)', 'Phút (min)', 'Giờ (h)', 'Ngày'], correctAnswer: 0 },
      { id: 'p6_7', type: 'multiple_choice', question: 'Để đo thời gian chạy 100m của học sinh trong giờ thể dục, người ta dùng:', options: ['Đồng hồ bấm giây', 'Đồng hồ treo tường', 'Đồng hồ cát', 'Đồng hồ quả lắc'], correctAnswer: 0 },
      { id: 'p6_8', type: 'multiple_choice', question: 'Dụng cụ nào dưới đây dùng để đo thể tích chất lỏng?', options: ['Bình chia độ (ống đong)', 'Cân đòn', 'Thước mét', 'Lực kế'], correctAnswer: 0 },
      { id: 'p6_9', type: 'multiple_choice', question: '1 lít (1 L) tương đương với thể tích của:', options: ['1 đềximét khối (1 dm³)', '1 mét khối (1 m³)', '1 centimét khối (1 cm³)', '100 cm³'], correctAnswer: 0 },
      { id: 'p6_10', type: 'multiple_choice', question: 'Khi đọc kết quả đo độ dài bằng thước, mắt cần đặt thế nào?', options: ['Nhìn vuông góc với cạnh thước tại đầu kia của vật', 'Nhìn xiên sang trái', 'Nhìn xiên sang phải', 'Nhìn từ trên chéo xuống'], correctAnswer: 0 },
      { id: 'p6_11', type: 'multiple_choice', question: 'Để đo nhiệt độ cơ thể người, dụng cụ chính xác và tiện lợi là:', options: ['Nhiệt kế y tế', 'Nhiệt kế rượu', 'Nhiệt kế kim loại', 'Nhiệt kế treo tường'], correctAnswer: 0 },
      { id: 'p6_12', type: 'multiple_choice', question: 'Thang nhiệt độ thường dùng ở Việt Nam là thang nhiệt độ nào?', options: ['Thang Celsius (°C)', 'Thang Fahrenheit (°F)', 'Thang Kelvin (K)', 'Thang Rankine'], correctAnswer: 0 },
      { id: 'p6_13', type: 'multiple_choice', question: 'Nhiệt độ sôi của nước tinh khiết ở áp suất tiêu chuẩn là:', options: ['100 °C', '0 °C', '37 °C', '50 °C'], correctAnswer: 0 },
      { id: 'p6_14', type: 'multiple_choice', question: 'Lực nào làm cho quả táo rơi từ trên cành cây xuống đất?', options: ['Trọng lực (lực hút của Trái Đất)', 'Lực ma sát', 'Lực đàn hồi', 'Lực từ'], correctAnswer: 0 },
      { id: 'p6_15', type: 'multiple_choice', question: 'Đơn vị của lực trong hệ SI là:', options: ['Newton (N)', 'Joule (J)', 'Kilôgam (kg)', 'Pascal (Pa)'], correctAnswer: 0 },
      { id: 'p6_16', type: 'multiple_choice', question: 'Một vật có khối lượng m = 2 kg thì có trọng lượng P tương ứng trên mặt đất là khoảng:', options: ['20 N', '2 N', '200 N', '0.2 N'], correctAnswer: 0 },
      // True/False
      {
        id: 'p6_17',
        type: 'true_false',
        question: 'Về các phép đo cơ bản trong môn Khoa học tự nhiên 6, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Thước kẻ có GHĐ 20 cm và ĐCNN 1 mm có thể đo chính xác bề dày của một tờ giấy đơn lẻ.', isCorrect: false },
          { subId: 'b', text: 'Khối lượng của một vật biểu thị lượng chất chứa trong vật đó.', isCorrect: true },
          { subId: 'c', text: 'Khi dùng cân đồng hồ, cần hiệu chỉnh kim chỉ về đúng vạch số 0 trước khi đặt vật lên đĩa cân.', isCorrect: true },
          { subId: 'd', text: '1 tấn bằng 100 kg.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'p6_18',
        type: 'short_answer',
        question: 'Một bình chia độ đang chứa sẵn 50 mL nước. Người ta thả chìm hoàn toàn một hòn sỏi vào bình thì mực nước dâng lên vạch 78 mL. Hỏi thể tích của hòn sỏi bằng bao nhiêu mL?',
        acceptableAnswers: ['28', '28ml', '28 ml'],
        unit: 'mL'
      }
    ]
  },
  {
    id: 'exam-chem-6-01',
    title: 'KTTX Lần 2 - Hóa học 6: Các thể của chất, Oxygen và Không khí',
    subject: 'chemistry',
    grade: 6,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-05',
    questions: [
      { id: 'c6_1', type: 'multiple_choice', question: 'Khí chiếm tỉ lệ thể tích lớn nhất trong không khí là:', options: ['Khí Nitrogen (khoảng 78%)', 'Khí Oxygen (khoảng 21%)', 'Khí Carbon dioxide', 'Hơi nước'], correctAnswer: 0 },
      { id: 'c6_2', type: 'multiple_choice', question: 'Khí Oxygen duy trì quá trình nào dưới đây?', options: ['Sự hô hấp và sự cháy', 'Quang hợp và sự đông đặc', 'Sự bay hơi và ngưng tụ', 'Sự hòa tan'], correctAnswer: 0 },
      { id: 'c6_3', type: 'multiple_choice', question: 'Chất ở thể rắn có đặc điểm nào?', options: ['Có hình dạng và thể tích xác định', 'Có hình dạng thay đổi theo bình chứa', 'Rất dễ bị nén ép', 'Không có thể tích xác định'], correctAnswer: 0 },
      { id: 'c6_4', type: 'multiple_choice', question: 'Quá trình chất chuyển từ thể rắn sang thể lỏng gọi là:', options: ['Sự nóng chảy', 'Sự đông đặc', 'Sự bay hơi', 'Sự ngưng tụ'], correctAnswer: 0 },
      { id: 'c6_5', type: 'multiple_choice', question: 'Quá trình nước đá tan thành nước lỏng ở 0°C là ví dụ về:', options: ['Sự nóng chảy', 'Sự bay hơi', 'Sự thăng hoa', 'Sự hóa hơi'], correctAnswer: 0 },
      { id: 'c6_6', type: 'multiple_choice', question: 'Hiện tượng sương đọng trên lá cây vào sáng sớm là hiện tượng:', options: ['Sự ngưng tụ của hơi nước', 'Sự bay hơi của nước', 'Sự đông đặc của nước', 'Sự sôi của nước'], correctAnswer: 0 },
      { id: 'c6_7', type: 'multiple_choice', question: 'Để dập tắt một đám cháy xăng dầu nhỏ, phương pháp phù hợp nhất là:', options: ['Trùm chăn ướt hoặc dùng cát, bình bọt CO₂', 'Dội thật nhiều nước lạnh', 'Dùng quạt thổi thật mạnh', 'Mở toang các cửa sổ'], correctAnswer: 0 },
      { id: 'c6_8', type: 'multiple_choice', question: 'Hỗn hợp nước muối sinh lí 0.9% là một:', options: ['Dung dịch đồng nhất', 'Huyền phù', 'Nhũ tương', 'Hỗn hợp không đồng nhất'], correctAnswer: 0 },
      { id: 'c6_9', type: 'multiple_choice', question: 'Chất tan trong nước đường là:', options: ['Đường ăn', 'Nước', 'Không khí', 'Cốc thủy tinh'], correctAnswer: 0 },
      { id: 'c6_10', type: 'multiple_choice', question: 'Để tách cát ra khỏi hỗn hợp nước cát, người ta dùng phương pháp nào?', options: ['Phương pháp lọc', 'Phương pháp cô cạn', 'Phương pháp chiết', 'Phương pháp chưng cất'], correctAnswer: 0 },
      { id: 'c6_11', type: 'multiple_choice', question: 'Nước biển sau khi phơi nắng bốc hơi hết nước thì thu được muối ăn. Đó là phương pháp:', options: ['Cô cạn', 'Lọc', 'Chiết', 'Lắng gạn'], correctAnswer: 0 },
      { id: 'c6_12', type: 'multiple_choice', question: 'Oxygen là chất khí có tính chất nào dưới đây?', options: ['Không màu, không mùi, ít tan trong nước, nặng hơn không khí', 'Có màu xanh nhạt, mùi hắc', 'Rất nhẹ hơn không khí', 'Không duy trì sự cháy'], correctAnswer: 0 },
      { id: 'c6_13', type: 'multiple_choice', question: 'Biện pháp nào giúp giảm thiểu ô nhiễm không khí?', options: ['Trồng nhiều cây xanh và sử dụng phương tiện công cộng', 'Đốt rác thải nhựa bừa bãi', 'Chặt phá rừng phòng hộ', 'Xả khí thải công nghiệp chưa qua xử lý'], correctAnswer: 0 },
      { id: 'c6_14', type: 'multiple_choice', question: 'Hỗn hợp gồm dầu ăn và nước khi khuấy đều tạo thành dạng gì?', options: ['Nhũ tương', 'Dung dịch', 'Huyền phù', 'Chất tinh khiết'], correctAnswer: 0 },
      { id: 'c6_15', type: 'multiple_choice', question: 'Bột sắn dây khuấy vào nước lạnh tạo thành dạng gì?', options: ['Huyền phù', 'Dung dịch', 'Nhũ tương', 'Chất rắn tinh khiết'], correctAnswer: 0 },
      { id: 'c6_16', type: 'multiple_choice', question: 'Thành phần phần trăm thể tích của khí Oxygen trong không khí là khoảng:', options: ['21%', '78%', '1%', '0.04%'], correctAnswer: 0 },
      // True/False
      {
        id: 'c6_17',
        type: 'true_false',
        question: 'Khi nói về tính chất của chất và không khí, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Oxygen là chất khí nhẹ hơn không khí nên thường bay lên cao.', isCorrect: false },
          { subId: 'b', text: 'Sự cháy than củi tỏa nhiều nhiệt và tiêu thụ khí Oxygen.', isCorrect: true },
          { subId: 'c', text: 'Nước cất là chất tinh khiết có nhiệt độ sôi xác định ở 100°C (1 atm).', isCorrect: true },
          { subId: 'd', text: 'Không khí là một đơn chất tinh khiết.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'c6_18',
        type: 'short_answer',
        question: 'Trong 500 lít không khí sạch, thể tích khí Oxygen xấp xỉ bằng bao nhiêu lít (biết Oxygen chiếm khoảng 21% thể tích không khí)?',
        acceptableAnswers: ['105', '105 lít', '105L'],
        unit: 'lít'
      }
    ]
  },
  {
    id: 'exam-bio-6-01',
    title: 'KTTX Lần 3 - Sinh học 6: Tế bào - Đơn vị cơ bản của sự sống',
    subject: 'biology',
    grade: 6,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-08',
    questions: [
      { id: 'b6_1', type: 'multiple_choice', question: 'Đơn vị cấu trúc và chức năng cơ bản của mọi cơ thể sống là gì?', options: ['Tế bào', 'Mô', 'Cơ quan', 'Hệ cơ quan'], correctAnswer: 0 },
      { id: 'b6_2', type: 'multiple_choice', question: 'Thành phần nào của tế bào có chức năng điều khiển mọi hoạt động sống?', options: ['Nhân tế bào (hoặc vùng nhân)', 'Màng tế bào', 'Tế bào chất', 'Lục lạp'], correctAnswer: 0 },
      { id: 'b6_3', type: 'multiple_choice', question: 'Bào quan nào chỉ có ở tế bào thực vật giúp thực vật quang hợp?', options: ['Lục lạp', 'Ti thể', 'Ribosome', 'Trung thể'], correctAnswer: 0 },
      { id: 'b6_4', type: 'multiple_choice', question: 'Màng sinh chất có vai trò chính là gì?', options: ['Bảo vệ và kiểm soát các chất ra vào tế bào', 'Tổng hợp protein', 'Chứa dịch tế bào', 'Tiêu hóa nội bào'], correctAnswer: 0 },
      { id: 'b6_5', type: 'multiple_choice', question: 'Tế bào nhân sơ khác tế bào nhân thực ở điểm cơ bản nào?', options: ['Chưa có màng nhân bao bọc vật chất di truyền', 'Không có màng sinh chất', 'Không có tế bào chất', 'Có kích thước lớn hơn nhiều'], correctAnswer: 0 },
      { id: 'b6_6', type: 'multiple_choice', question: 'Cơ thể nào sau đây là cơ thể đơn bào?', options: ['Trùng roi (hoặc vi khuẩn E.coli)', 'Cây phượng vĩ', 'Con mèo', 'Con ếch'], correctAnswer: 0 },
      { id: 'b6_7', type: 'multiple_choice', question: 'Cơ thể nào sau đây là cơ thể đa bào?', options: ['Cây hoa hồng', 'Trùng giày', 'Tảo lam đơn bào', 'Trùng biến hình'], correctAnswer: 0 },
      { id: 'b6_8', type: 'multiple_choice', question: 'Một tế bào sau khi phân chia 1 lần sẽ tạo ra bao nhiêu tế bào con?', options: ['2 tế bào con', '4 tế bào con', '8 tế bào con', '1 tế bào con'], correctAnswer: 0 },
      { id: 'b6_9', type: 'multiple_choice', question: 'Từ 1 tế bào ban đầu, sau 3 lần phân chia liên tiếp sẽ tạo ra bao nhiêu tế bào con?', options: ['8 tế bào', '6 tế bào', '4 tế bào', '16 tế bào'], correctAnswer: 0 },
      { id: 'b6_10', type: 'multiple_choice', question: 'Tập hợp các tế bào có hình dạng, cấu tạo và chức năng giống nhau được gọi là:', options: ['Mô', 'Cơ quan', 'Hệ cơ quan', 'Cơ thể'], correctAnswer: 0 },
      { id: 'b6_11', type: 'multiple_choice', question: 'Cơ quan nào dưới đây thuộc hệ tiêu hóa ở người?', options: ['Dạ dày', 'Phổi', 'Tim', 'Thận'], correctAnswer: 0 },
      { id: 'b6_12', type: 'multiple_choice', question: 'Kính lúp và kính hiển vi quang học dùng để:', options: ['Quan sát các vật thể có kích thước nhỏ và siêu nhỏ', 'Đo nhiệt độ', 'Đo thời gian', 'Cân khối lượng'], correctAnswer: 0 },
      { id: 'b6_13', type: 'multiple_choice', question: 'Vật kính có ghi chữ "40x" trên kính hiển vi có độ phóng đại là:', options: ['40 lần', '4 lần', '400 lần', '4000 lần'], correctAnswer: 0 },
      { id: 'b6_14', type: 'multiple_choice', question: 'Chất diệp lục nằm trong bào quan nào?', options: ['Lục lạp', 'Không bào', 'Nhân', 'Vách tế bào'], correctAnswer: 0 },
      { id: 'b6_15', type: 'multiple_choice', question: 'Thành tế bào thực vật được cấu tạo chủ yếu từ chất nào?', options: ['Cellulose', 'Chitin', 'Lipid', 'Protein'], correctAnswer: 0 },
      { id: 'b6_16', type: 'multiple_choice', question: 'Sự lớn lên và phân chia của tế bào có ý nghĩa gì đối với sinh vật?', options: ['Giúp cơ thể sinh trưởng và phát triển', 'Làm cho tế bào teo nhỏ lại', 'Làm ngừng trao đổi chất', 'Giúp tế bào biến mất'], correctAnswer: 0 },
      // True/False
      {
        id: 'b6_17',
        type: 'true_false',
        question: 'Khi quan sát tế bào biểu bì vảy hành dưới kính hiển vi, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tế bào biểu bì vảy hành có thành tế bào bằng cellulose bao bọc bên ngoài.', isCorrect: true },
          { subId: 'b', text: 'Tế bào biểu bì vảy hành chứa nhiều lục lạp màu xanh lục.', isCorrect: false },
          { subId: 'c', text: 'Nhân tế bào biểu bì vảy hành bắt màu đậm hơn tế bào chất khi nhuộm bằng dung dịch iodine.', isCorrect: true },
          { subId: 'd', text: 'Tế bào động vật cũng có vách tế bào cứng như tế bào vảy hành.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'b6_18',
        type: 'short_answer',
        question: 'Một tế bào vi khuẩn cứ sau 20 phút lại phân chia một lần. Hỏi sau 60 phút (tương ứng 3 lần phân chia), từ 2 tế bào vi khuẩn ban đầu sẽ tạo ra tất cả bao nhiêu tế bào con?',
        acceptableAnswers: ['16', '16 tế bào'],
        unit: 'tế bào'
      }
    ]
  },

  // ================= GRADE 7 EXAMS =================
  {
    id: 'exam-phy-7-01',
    title: 'KTTX Lần 1 - Vật lí 7: Tốc độ chuyển động và Đồ thị quãng đường',
    subject: 'physics',
    grade: 7,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-02',
    questions: [
      { id: 'p7_1', type: 'multiple_choice', question: 'Tốc độ là đại lượng đặc trưng cho:', options: ['Mức độ nhanh hay chậm của chuyển động', 'Quãng đường dài hay ngắn', 'Thời gian đi nhiều hay ít', 'Hướng của chuyển động'], correctAnswer: 0 },
      { id: 'p7_2', type: 'multiple_choice', question: 'Công thức tính tốc độ chuyển động là:', options: ['v = s / t', 'v = s . t', 'v = t / s', 'v = s + t'], correctAnswer: 0 },
      { id: 'p7_3', type: 'multiple_choice', question: 'Đơn vị hợp pháp của tốc độ trong hệ SI là:', options: ['m/s (mét trên giây)', 'km/h', 'cm/s', 'm/phút'], correctAnswer: 0 },
      { id: 'p7_4', type: 'multiple_choice', question: '1 m/s bằng bao nhiêu km/h?', options: ['3.6 km/h', '0.36 km/h', '36 km/h', '18 km/h'], correctAnswer: 0 },
      { id: 'p7_5', type: 'multiple_choice', question: 'Một người đi xe máy với tốc độ 36 km/h, tương ứng với bao nhiêu m/s?', options: ['10 m/s', '20 m/s', '5 m/s', '15 m/s'], correctAnswer: 0 },
      { id: 'p7_6', type: 'multiple_choice', question: 'Dụng cụ nào gắn trên xe máy để hiển thị tốc độ tức thời của xe?', options: ['Tốc kế (đồng hồ đo tốc độ)', 'Vôn kế', 'Nhiệt kế', 'Ampe kế'], correctAnswer: 0 },
      { id: 'p7_7', type: 'multiple_choice', question: 'Trên đồ thị quãng đường - thời gian (s - t), đường biểu diễn chuyển động thẳng đều là:', options: ['Đường thẳng nghiêng', 'Đường cong parabol', 'Đường tròn', 'Đường gấp khúc bất kì'], correctAnswer: 0 },
      { id: 'p7_8', type: 'multiple_choice', question: 'Nếu trên đồ thị s - t có đoạn nằm ngang song song với trục thời gian, điều đó chứng tỏ:', options: ['Vật đang đứng yên', 'Vật chuyển động nhanh dần', 'Vật chuyển động chậm dần', 'Vật quay trở lại điểm xuất phát'], correctAnswer: 0 },
      { id: 'p7_9', type: 'multiple_choice', question: 'Camera bắn tốc độ hoạt động dựa trên nguyên lí đo đại lượng nào?', options: ['Đo thời gian xe chạy qua hai vạch cảm biến có khoảng cách xác định', 'Đo khối lượng xe', 'Đo độ ồn của xe', 'Đo nhiệt độ động cơ'], correctAnswer: 0 },
      { id: 'p7_10', type: 'multiple_choice', question: 'Một học sinh chạy bộ quãng đường s = 120 m hết thời gian t = 20 s. Tốc độ của học sinh là:', options: ['6 m/s', '12 m/s', '2.4 m/s', '60 m/s'], correctAnswer: 0 },
      { id: 'p7_11', type: 'multiple_choice', question: 'Âm thanh được tạo ra từ đâu?', options: ['Sự dao động của các vật phát ra âm', 'Sự bay hơi của không khí', 'Sự đứng yên của vật thể', 'Ánh sáng chiếu vào vật'], correctAnswer: 0 },
      { id: 'p7_12', type: 'multiple_choice', question: 'Âm thanh truyền được trong những môi trường nào?', options: ['Chất rắn, chất lỏng và chất khí', 'Chỉ truyền trong chân không', 'Chỉ truyền trong không khí', 'Chỉ truyền trong nước'], correctAnswer: 0 },
      { id: 'p7_13', type: 'multiple_choice', question: 'Môi trường nào KHÔNG truyền được âm thanh?', options: ['Chân không', 'Thép', 'Nước biển', 'Không khí'], correctAnswer: 0 },
      { id: 'p7_14', type: 'multiple_choice', question: 'Tốc độ truyền âm lớn nhất trong môi trường nào?', options: ['Chất rắn', 'Chất lỏng', 'Chất khí', 'Chân không'], correctAnswer: 0 },
      { id: 'p7_15', type: 'multiple_choice', question: 'Đơn vị đo tần số dao động là:', options: ['Hertz (Hz)', 'Decibel (dB)', 'Newton (N)', 'Joule (J)'], correctAnswer: 0 },
      { id: 'p7_16', type: 'multiple_choice', question: 'Dao động càng nhanh, tần số càng lớn thì âm phát ra càng:', options: ['Càng bổng (cao)', 'Càng trầm (thấp)', 'Càng nhỏ', 'Không đổi'], correctAnswer: 0 },
      // True/False
      {
        id: 'p7_17',
        type: 'true_false',
        question: 'Về tốc độ và đồ thị quãng đường - thời gian, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tốc độ 54 km/h lớn hơn tốc độ 15 m/s.', isCorrect: false },
          { subId: 'b', text: 'Trên đồ thị s - t, đường càng dốc thì tốc độ chuyển động càng lớn.', isCorrect: true },
          { subId: 'c', text: 'Âm thanh truyền trong không khí nhanh hơn truyền trong chất rắn.', isCorrect: false },
          { subId: 'd', text: 'Quy định giới hạn tốc độ nhằm đảm bảo an toàn giao thông cho người và phương tiện.', isCorrect: true }
        ]
      },
      // Short Answer
      {
        id: 'p7_18',
        type: 'short_answer',
        question: 'Một ô tô chạy từ Pleiku đến thị trấn Đak Pơ trên quãng đường dài 72 km hết thời gian 1 giờ 30 phút (1.5 giờ). Tính tốc độ trung bình của ô tô theo đơn vị km/h?',
        acceptableAnswers: ['48', '48 km/h', '48km/h'],
        unit: 'km/h'
      }
    ]
  },
  {
    id: 'exam-chem-7-01',
    title: 'KTTX Lần 2 - Hóa học 7: Nguyên tử, Nguyên tố và Bảng tuần hoàn',
    subject: 'chemistry',
    grade: 7,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-06',
    questions: [
      { id: 'c7_1', type: 'multiple_choice', question: 'Hạt nhân nguyên tử gồm những loại hạt nào?', options: ['Proton (mang điện dương) và neutron (không mang điện)', 'Electron và proton', 'Electron và neutron', 'Chỉ có electron'], correctAnswer: 0 },
      { id: 'c7_2', type: 'multiple_choice', question: 'Vỏ nguyên tử chứa loại hạt nào?', options: ['Electron (mang điện tích âm)', 'Proton', 'Neutron', 'Hạt nhân'], correctAnswer: 0 },
      { id: 'c7_3', type: 'multiple_choice', question: 'Trong một nguyên tử trung hòa về điện luôn có:', options: ['Số proton = Số electron', 'Số proton = Số neutron', 'Số electron = Số neutron', 'Số hạt nhân = 0'], correctAnswer: 0 },
      { id: 'c7_4', type: 'multiple_choice', question: 'Nguyên tố hóa học là tập hợp các nguyên tử có cùng:', options: ['Số proton trong hạt nhân', 'Số neutron', 'Khối lượng', 'Số lớp vỏ'], correctAnswer: 0 },
      { id: 'c7_5', type: 'multiple_choice', question: 'Kí hiệu hóa học của nguyên tố Sắt (Iron) là:', options: ['Fe', 'Cu', 'Al', 'Zn'], correctAnswer: 0 },
      { id: 'c7_6', type: 'multiple_choice', question: 'Kí hiệu hóa học của nguyên tố Đồng (Copper) là:', options: ['Cu', 'Co', 'Cl', 'Ca'], correctAnswer: 0 },
      { id: 'c7_7', type: 'multiple_choice', question: 'Bảng tuần hoàn các nguyên tố hóa học được sắp xếp theo chiều tăng dần của:', options: ['Điện tích hạt nhân nguyên tử (số hiệu nguyên tử Z)', 'Khối lượng nguyên tử', 'Số neutron', 'Bán kính nguyên tử'], correctAnswer: 0 },
      { id: 'c7_8', type: 'multiple_choice', question: 'Số thứ tự chu kì trong bảng tuần hoàn bằng:', options: ['Số lớp electron của nguyên tử', 'Số electron lớp ngoài cùng', 'Số proton', 'Số neutron'], correctAnswer: 0 },
      { id: 'c7_9', type: 'multiple_choice', question: 'Số thứ tự nhóm A trong bảng tuần hoàn thường bằng:', options: ['Số electron ở lớp ngoài cùng', 'Tổng số electron', 'Số proton', 'Số lớp vỏ'], correctAnswer: 0 },
      { id: 'c7_10', type: 'multiple_choice', question: 'Các nguyên tố nhóm IA trong bảng tuần hoàn (trừ Hydrogen) là:', options: ['Kim loại kiềm', 'Khí hiếm', 'Halogen', 'Kim loại chuyển tiếp'], correctAnswer: 0 },
      { id: 'c7_11', type: 'multiple_choice', question: 'Nhóm VIIIA trong bảng tuần hoàn gồm các nguyên tố:', options: ['Khí hiếm (khí trơ)', 'Kim loại kiềm', 'Kim loại kiềm thổ', 'Halogen'], correctAnswer: 0 },
      { id: 'c7_12', type: 'multiple_choice', question: 'Đơn chất là chất được tạo nên từ:', options: ['Một nguyên tố hóa học', 'Hai nguyên tố hóa học trở lên', 'Nhiều phân tử khác nhau', 'Hỗn hợp các chất lỏng'], correctAnswer: 0 },
      { id: 'c7_13', type: 'multiple_choice', question: 'Hợp chất nào dưới đây được tạo thành từ 2 nguyên tố Hydro và Oxi?', options: ['Nước (H₂O)', 'Khí Carbonic (CO₂)', 'Muối ăn (NaCl)', 'Khí Methane (CH₄)'], correctAnswer: 0 },
      { id: 'c7_14', type: 'multiple_choice', question: 'Khối lượng phân tử của nước (H₂O) là (biết H=1, O=16):', options: ['18 amu', '17 amu', '16 amu', '32 amu'], correctAnswer: 0 },
      { id: 'c7_15', type: 'multiple_choice', question: 'Liên kết ion thường được hình thành giữa:', options: ['Kim loại điển hình và phi kim điển hình', 'Hai phi kim với nhau', 'Hai kim loại với nhau', 'Các khí hiếm'], correctAnswer: 0 },
      { id: 'c7_16', type: 'multiple_choice', question: 'Liên kết cộng hóa trị được hình thành do:', options: ['Các cặp electron dùng chung giữa các nguyên tử', 'Lực hút tĩnh điện giữa các ion trái dấu', 'Sự truyền proton', 'Sự mất neutron'], correctAnswer: 0 },
      // True/False
      {
        id: 'c7_17',
        type: 'true_false',
        question: 'Về cấu tạo nguyên tử và bảng tuần hoàn, hãy xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Khối lượng của nguyên tử tập trung chủ yếu ở phần hạt nhân.', isCorrect: true },
          { subId: 'b', text: 'Khí Helium (He) là một kim loại kiềm rất hoạt động.', isCorrect: false },
          { subId: 'c', text: 'Phân tử NaCl được hình thành nhờ liên kết ion giữa Na⁺ và Cl⁻.', isCorrect: true },
          { subId: 'd', text: 'Tất cả các nguyên tố trong cùng một chu kì đều có số electron lớp ngoài cùng như nhau.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'c7_18',
        type: 'short_answer',
        question: 'Nguyên tử Sodium (Natri) có điện tích hạt nhân là +11 và có 12 hạt neutron. Tổng số hạt proton, neutron và electron trong một nguyên tử Sodium là bao nhiêu?',
        acceptableAnswers: ['34', '34 hạt'],
        unit: 'hạt'
      }
    ]
  },

  // ================= GRADE 8 EXTRA EXAM =================
  {
    id: 'exam-phy-8-02',
    title: 'KTTX Lần 4 - Vật lí 8: Tác dụng làm quay của lực và Đòn bẩy',
    subject: 'physics',
    grade: 8,
    testNumber: 'TX4',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-11',
    questions: [
      { id: 'p8_2_1', type: 'multiple_choice', question: 'Tác dụng làm quay của lực lên một vật có trục quay cố định phụ thuộc vào:', options: ['Độ lớn của lực và khoảng cách từ trục quay đến giá của lực', 'Chỉ phụ thuộc vào độ lớn của lực', 'Khối lượng của vật', 'Vận tốc của vật'], correctAnswer: 0 },
      { id: 'p8_2_2', type: 'multiple_choice', question: 'Mômen lực đặc trưng cho:', options: ['Tác dụng làm quay của lực', 'Khả năng nén ép của vật', 'Độ bền của vật', 'Sự biến dạng đàn hồi'], correctAnswer: 0 },
      { id: 'p8_2_3', type: 'multiple_choice', question: 'Đơn vị của mômen lực trong hệ SI là:', options: ['Newton nhân mét (N.m)', 'Joule (J)', 'Watt (W)', 'Pascal (Pa)'], correctAnswer: 0 },
      { id: 'p8_2_4', type: 'multiple_choice', question: 'Đòn bẩy loại 1 có điểm tựa O nằm ở đâu?', options: ['Nằm giữa điểm đặt của lực tác dụng và vật', 'Nằm ở một đầu của đòn bẩy', 'Nằm trùng với vật', 'Không có điểm tựa'], correctAnswer: 0 },
      { id: 'p8_2_5', type: 'multiple_choice', question: 'Vật dụng nào sau đây ứng dụng đòn bẩy?', options: ['Kéo cắt giấy, bập bênh, kìm nhổ đinh', 'Nồi cơm điện', 'Bóng đèn huỳnh quang', 'Gương soi'], correctAnswer: 0 },
      { id: 'p8_2_6', type: 'multiple_choice', question: 'Khi dùng xà bén để bẩy một tảng đá, muốn được lợi về lực thì ta nên:', options: ['Tác dụng lực ở điểm càng xa điểm tựa O càng tốt', 'Tác dụng lực sát điểm tựa', 'Dùng lực thật nhanh', 'Kê điểm tựa sát tay cầm'], correctAnswer: 0 },
      { id: 'p8_2_7', type: 'multiple_choice', question: 'Kéo cắt kim loại thường có đặc điểm:', options: ['Tay cầm dài hơn lưỡi kéo để được lợi về lực', 'Lưỡi kéo dài hơn tay cầm', 'Tay cầm bằng nhựa mềm', 'Hai nhánh kéo bằng nhau'], correctAnswer: 0 },
      { id: 'p8_2_8', type: 'multiple_choice', question: 'Kéo cắt vải hoặc cắt tóc thường có:', options: ['Lưỡi kéo dài hơn tay cầm để được lợi về đường đi', 'Tay cầm rất dài', 'Lưỡi kéo thật ngắn và dày', 'Trục quay lỏng lẻo'], correctAnswer: 0 },
      { id: 'p8_2_9', type: 'multiple_choice', question: 'Trọng tâm của một thước dẹt đồng chất, hình chữ nhật nằm ở đâu?', options: ['Giao điểm của hai đường chéo', 'Một đầu thước', 'Mép ngoài của thước', 'Bên ngoài thước'], correctAnswer: 0 },
      { id: 'p8_2_10', type: 'multiple_choice', question: 'Để mở cánh cửa phòng dễ dàng nhất, ta nên ấn vào vị trí nào?', options: ['Tay nắm ở mép ngoài xa bản lề', 'Sát bản lề cửa', 'Chính giữa bản lề', 'Góc trên cùng sát bản lề'], correctAnswer: 0 },
      { id: 'p8_2_11', type: 'multiple_choice', question: 'Một lực F = 20 N tác dụng vuông góc vào cờ lê tại điểm cách trục quay d = 0.25 m. Mômen lực là:', options: ['5 N.m', '80 N.m', '0.0125 N.m', '50 N.m'], correctAnswer: 0 },
      { id: 'p8_2_12', type: 'multiple_choice', question: 'Khối lượng riêng của một chất là:', options: ['Khối lượng của một đơn vị thể tích chất đó (D = m/V)', 'Thể tích của một đơn vị khối lượng', 'Trọng lượng của vật', 'Tỉ số giữa lực và diện tích'], correctAnswer: 0 },
      { id: 'p8_2_13', type: 'multiple_choice', question: 'Đơn vị chuẩn của khối lượng riêng trong hệ SI là:', options: ['kg/m³', 'g/cm³', 'g/mL', 'kg/L'], correctAnswer: 0 },
      { id: 'p8_2_14', type: 'multiple_choice', question: 'Khối lượng riêng của nước nguyên chất là khoảng:', options: ['1000 kg/m³', '100 kg/m³', '10000 kg/m³', '1 kg/m³'], correctAnswer: 0 },
      { id: 'p8_2_15', type: 'multiple_choice', question: 'Một thỏi nhôm có thể tích V = 0.002 m³ và khối lượng riêng D = 2700 kg/m³. Khối lượng thỏi nhôm là:', options: ['5.4 kg', '2.7 kg', '54 kg', '1.35 kg'], correctAnswer: 0 },
      { id: 'p8_2_16', type: 'multiple_choice', question: 'Áp suất tác dụng lên mặt phẳng bị ép phụ thuộc vào:', options: ['Áp lực và diện tích bề mặt bị ép (p = F/S)', 'Chỉ phụ thuộc diện tích', 'Khối lượng riêng của không khí', 'Nhiệt độ môi trường'], correctAnswer: 0 },
      // True/False
      {
        id: 'p8_2_17',
        type: 'true_false',
        question: 'Về tác dụng làm quay của lực và khối lượng riêng, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Nếu giá của lực đi qua trục quay thì lực không gây ra tác dụng làm quay vật.', isCorrect: true },
          { subId: 'b', text: 'Càng kéo dài cánh tay đòn thì mômen lực càng nhỏ đi.', isCorrect: false },
          { subId: 'c', text: 'Xe máy chở nặng khó giữ thăng bằng hơn xe không tải vì vị trí trọng tâm xe thay đổi.', isCorrect: true },
          { subId: 'd', text: 'Đòn bẩy luôn luôn cho ta lợi về cả lực và quãng đường.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'p8_2_18',
        type: 'short_answer',
        question: 'Dùng một đòn bẩy để nâng một vật nặng có trọng lượng P = 600 N. Biết khoảng cách từ vật đến điểm tựa là d₁ = 20 cm. Hỏi cần tác dụng một lực tối thiểu F bằng bao nhiêu Newton tại điểm cách điểm tựa d₂ = 80 cm để nâng được vật?',
        acceptableAnswers: ['150', '150N', '150 N'],
        unit: 'N'
      }
    ]
  },

  // ================= GRADE 9 EXAMS =================
  {
    id: 'exam-phy-9-01',
    title: 'KTTX Lần 1 - Vật lí 9: Cơ năng, Động năng và Thế năng',
    subject: 'physics',
    grade: 9,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-03',
    questions: [
      { id: 'p9_1', type: 'multiple_choice', question: 'Khi một vật có khả năng thực hiện công cơ học, ta nói vật đó mang:', options: ['Cơ năng', 'Nhiệt độ', 'Khối lượng', 'Điện thế'], correctAnswer: 0 },
      { id: 'p9_2', type: 'multiple_choice', question: 'Dạng năng lượng mà một vật có được do chuyển động gọi là:', options: ['Động năng', 'Thế năng hấp dẫn', 'Thế năng đàn hồi', 'Hóa năng'], correctAnswer: 0 },
      { id: 'p9_3', type: 'multiple_choice', question: 'Động năng của một vật phụ thuộc vào yếu tố nào?', options: ['Khối lượng và tốc độ của vật', 'Chỉ phụ thuộc vào độ cao', 'Thể tích của vật', 'Hình dạng của vật'], correctAnswer: 0 },
      { id: 'p9_4', type: 'multiple_choice', question: 'Thế năng hấp dẫn của một vật phụ thuộc vào:', options: ['Khối lượng của vật và độ cao so với mốc thế năng', 'Tốc độ chuyển động', 'Nhiệt độ của vật', 'Màu sắc của vật'], correctAnswer: 0 },
      { id: 'p9_5', type: 'multiple_choice', question: 'Một chiếc lò xo đang bị nén hoặc bị kéo dãn mang dạng năng lượng nào?', options: ['Thế năng đàn hồi', 'Động năng', 'Hóa năng', 'Quang năng'], correctAnswer: 0 },
      { id: 'p9_6', type: 'multiple_choice', question: 'Đơn vị đo công và cơ năng trong hệ SI là:', options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Volt (V)'], correctAnswer: 0 },
      { id: 'p9_7', type: 'multiple_choice', question: 'Trong quá trình một quả bóng rơi tự do từ trên cao xuống (bỏ qua sức cản không khí):', options: ['Thế năng chuyển hóa dần thành động năng, cơ năng bảo toàn', 'Động năng chuyển hóa thành thế năng', 'Cơ năng giảm dần', 'Cả động năng và thế năng đều tăng'], correctAnswer: 0 },
      { id: 'p9_8', type: 'multiple_choice', question: 'Tại vị trí cao nhất của một vật được ném thẳng đứng lên cao:', options: ['Động năng bằng 0, thế năng đạt giá trị cực đại', 'Thế năng bằng 0, động năng cực đại', 'Cơ năng bằng 0', 'Vận tốc cực đại'], correctAnswer: 0 },
      { id: 'p9_9', type: 'multiple_choice', question: 'Nhà máy thủy điện hoạt động dựa trên sự chuyển hóa năng lượng nào?', options: ['Thế năng của dòng nước trên cao thành động năng làm quay tuabin rồi thành điện năng', 'Hóa năng thành điện năng', 'Năng lượng hạt nhân thành điện năng', 'Quang năng thành nhiệt năng'], correctAnswer: 0 },
      { id: 'p9_10', type: 'multiple_choice', question: 'Công thức tính công cơ học khi lực F cùng hướng với quãng đường dịch chuyển s là:', options: ['A = F . s', 'A = F / s', 'A = F + s', 'A = s / F'], correctAnswer: 0 },
      { id: 'p9_11', type: 'multiple_choice', question: 'Công suất P là đại lượng đặc trưng cho:', options: ['Tốc độ thực hiện công (P = A / t)', 'Độ lớn của lực', 'Quãng đường đi được', 'Hiệu suất của máy'], correctAnswer: 0 },
      { id: 'p9_12', type: 'multiple_choice', question: 'Đơn vị của công suất trong hệ SI là:', options: ['Watt (W)', 'Joule (J)', 'Newton (N)', 'Kilôgam (kg)'], correctAnswer: 0 },
      { id: 'p9_13', type: 'multiple_choice', question: '1 Kilôwatt (1 kW) bằng bao nhiêu Watt?', options: ['1000 W', '100 W', '10000 W', '10 W'], correctAnswer: 0 },
      { id: 'p9_14', type: 'multiple_choice', question: 'Một máy kéo thực hiện công A = 60000 J trong thời gian t = 30 s. Công suất của máy là:', options: ['2000 W', '1800000 W', '500 W', '200 W'], correctAnswer: 0 },
      { id: 'p9_15', type: 'multiple_choice', question: 'Định luật khúc xạ ánh sáng phát biểu: Tia khúc xạ nằm trong mặt phẳng tới và:', options: ['Ở bên kia pháp tuyến so với tia tới', 'Trùng với tia tới', 'Song song với mặt phân cách', 'Vuông góc với mặt phân cách'], correctAnswer: 0 },
      { id: 'p9_16', type: 'multiple_choice', question: 'Thấu kính hội tụ có đặc điểm hình học nào?', options: ['Phần rìa mỏng hơn phần giữa', 'Phần rìa dày hơn phần giữa', 'Mặt kính phẳng hoàn toàn', 'Hình trụ rỗng'], correctAnswer: 0 },
      // True/False
      {
        id: 'p9_17',
        type: 'true_false',
        question: 'Về cơ năng và định luật bảo toàn cơ năng, hãy xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Khi không có ma sát và sức cản, tổng động năng và thế năng của vật là một hằng số.', isCorrect: true },
          { subId: 'b', text: 'Vật có khối lượng càng lớn và chuyển động càng nhanh thì động năng càng nhỏ.', isCorrect: false },
          { subId: 'c', text: 'Công suất 1 Mã lực (HP) xấp xỉ bằng 746 Watt.', isCorrect: true },
          { subId: 'd', text: 'Một vật đang nằm yên trên mặt đất luôn có động năng rất lớn.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'p9_18',
        type: 'short_answer',
        question: 'Một cần cẩu nâng đều một khối bê tông có khối lượng m = 500 kg lên cao h = 12 m trong thời gian t = 20 giây. Lấy gia tốc trọng trường g = 10 m/s². Tính công suất cơ học của cần cẩu theo đơn vị Watt?',
        acceptableAnswers: ['3000', '3000W', '3000 W'],
        unit: 'W'
      }
    ]
  },
  {
    id: 'exam-chem-9-01',
    title: 'KTTX Lần 2 - Hóa học 9: Kim loại và Dãy hoạt động hóa học',
    subject: 'chemistry',
    grade: 9,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-07',
    questions: [
      { id: 'c9_1', type: 'multiple_choice', question: 'Tính chất vật lí chung của kim loại (tính dẻo, dẫn điện, dẫn nhiệt, ánh kim) do yếu tố nào quyết định?', options: ['Các electron tự do trong tinh thể kim loại', 'Các liên kết ion', 'Kích thước hạt nhân', 'Khối lượng riêng'], correctAnswer: 0 },
      { id: 'c9_2', type: 'multiple_choice', question: 'Kim loại nào dẫn điện và dẫn nhiệt tốt nhất?', options: ['Bạc (Ag)', 'Đồng (Cu)', 'Vàng (Au)', 'Nhôm (Al)'], correctAnswer: 0 },
      { id: 'c9_3', type: 'multiple_choice', question: 'Kim loại nào có nhiệt độ nóng chảy thấp nhất, ở thể lỏng ở điều kiện thường?', options: ['Thủy ngân (Hg)', 'Chì (Pb)', 'Thiếc (Sn)', 'Kẽm (Zn)'], correctAnswer: 0 },
      { id: 'c9_4', type: 'multiple_choice', question: 'Kim loại nào có nhiệt độ nóng chảy cao nhất, thường dùng làm dây tóc bóng đèn?', options: ['Vonfram (W)', 'Sắt (Fe)', 'Đồng (Cu)', 'Bạch kim (Pt)'], correctAnswer: 0 },
      { id: 'c9_5', type: 'multiple_choice', question: 'Dãy hoạt động hóa học của kim loại được sắp xếp theo chiều nào?', options: ['Mức độ hoạt động hóa học giảm dần từ trái sang phải', 'Tăng dần từ trái sang phải', 'Khối lượng tăng dần', 'Bán kính tăng dần'], correctAnswer: 0 },
      { id: 'c9_6', type: 'multiple_choice', question: 'Kim loại nào sau đây tác dụng mãnh liệt với nước ở nhiệt độ thường giải phóng khí H₂?', options: ['Natri (Na)', 'Đồng (Cu)', 'Sắt (Fe)', 'Bạc (Ag)'], correctAnswer: 0 },
      { id: 'c9_7', type: 'multiple_choice', question: 'Kim loại nào đứng trước Hydro trong dãy hoạt động hóa học và đẩy được H₂ ra khỏi dung dịch axit loãng (HCl, H₂SO₄ loãng)?', options: ['Kẽm (Zn)', 'Đồng (Cu)', 'Bạc (Ag)', 'Vàng (Au)'], correctAnswer: 0 },
      { id: 'c9_8', type: 'multiple_choice', question: 'Kim loại nào KHÔNG tác dụng với dung dịch axit HCl loãng?', options: ['Đồng (Cu)', 'Sắt (Fe)', 'Nhôm (Al)', 'Magie (Mg)'], correctAnswer: 0 },
      { id: 'c9_9', type: 'multiple_choice', question: 'Hiện tượng xảy ra khi ngâm một đinh sắt sạch vào dung dịch đồng(II) sunfat (CuSO₄) là:', options: ['Có kim loại màu đỏ (Cu) bám ngoài đinh sắt, màu xanh của dung dịch nhạt dần', 'Dung dịch chuyển sang màu tím', 'Không có hiện tượng gì', 'Đinh sắt tan hết ngay lập tức không có chất bám'], correctAnswer: 0 },
      { id: 'c9_10', type: 'multiple_choice', question: 'Nhôm (Al) có màng oxit Al₂O₃ bảo vệ rất bền, vì vậy nhôm không tác dụng với chất nào trong không khí?', options: ['Nước và không khí ẩm ở điều kiện thường', 'Dung dịch axit', 'Dung dịch kiềm', 'Khí clo'], correctAnswer: 0 },
      { id: 'c9_11', type: 'multiple_choice', question: 'Gang và thép là hợp kim quan trọng của nguyên tố nào với carbon?', options: ['Sắt (Fe)', 'Đồng (Cu)', 'Nhôm (Al)', 'Kẽm (Zn)'], correctAnswer: 0 },
      { id: 'c9_12', type: 'multiple_choice', question: 'Hàm lượng Carbon (C) trong thép thường là:', options: ['Dưới 2%', 'Từ 2% đến 5%', 'Trên 10%', '0%'], correctAnswer: 0 },
      { id: 'c9_13', type: 'multiple_choice', question: 'Sự ăn mòn kim loại là hiện tượng kim loại bị phá hủy do:', options: ['Tác dụng hóa học hoặc điện hóa của môi trường xung quanh', 'Va đập cơ học', 'Nung nóng chảy', 'Hòa tan vật lí'], correctAnswer: 0 },
      { id: 'c9_14', type: 'multiple_choice', question: 'Biện pháp nào sau đây giúp bảo vệ kim loại không bị ăn mòn rỉ sét?', options: ['Sơn phủ bề mặt, bôi dầu mỡ hoặc mạ kim loại chống rỉ', 'Ngâm trong nước muối', 'Để ngoài trời mưa nắng thường xuyên', 'Lau bằng dung dịch axit'], correctAnswer: 0 },
      { id: 'c9_15', type: 'multiple_choice', question: 'Kim loại nhôm phản ứng được với cả dung dịch axit và dung dịch kiềm (NaOH), tính chất này thể hiện:', options: ['Hợp chất của nhôm có tính lưỡng tính', 'Nhôm là phi kim', 'Nhôm là kim loại kiềm', 'Nhôm không có tính khử'], correctAnswer: 0 },
      { id: 'c9_16', type: 'multiple_choice', question: 'Quặng bauxite (bô-xít) là nguyên liệu chính để sản xuất kim loại nào?', options: ['Nhôm (Al)', 'Sắt (Fe)', 'Đồng (Cu)', 'Chì (Pb)'], correctAnswer: 0 },
      // True/False
      {
        id: 'c9_17',
        type: 'true_false',
        question: 'Về tính chất và dãy hoạt động hóa học của kim loại, xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Kim loại đứng trước Mg trong dãy hoạt động hóa học tác dụng với nước ở nhiệt độ thường sinh ra dung dịch kiềm và H₂.', isCorrect: true },
          { subId: 'b', text: 'Bạc (Ag) đẩy được Sắt (Fe) ra khỏi dung dịch muối FeSO₄.', isCorrect: false },
          { subId: 'c', text: 'Hợp kim của nhôm nhẹ và bền nên được ứng dụng rộng rãi trong chế tạo máy bay, tàu vũ trụ.', isCorrect: true },
          { subId: 'd', text: 'Kim loại vàng (Au) dễ bị ăn mòn rỉ sét trong không khí ẩm.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'c9_18',
        type: 'short_answer',
        question: 'Cho 6.5 gam kẽm (Zn) tác dụng hoàn toàn với dung dịch axit Clohiđric (HCl) dư thu được muối ZnCl₂ và khí H₂ (ở đkc: 1 mol khí = 24.79 L). Biết nguyên tử khối Zn = 65. Tính thể tích khí H₂ (Lít) thu được (làm tròn 2 chữ số thập phân)?',
        acceptableAnswers: ['2.48', '2,48', '2.48 lít', '2.479'],
        unit: 'lít'
      }
    ]
  },
  {
    id: 'exam-bio-9-01',
    title: 'KTTX Lần 3 - Sinh học 9: Di truyền học Mendel, ADN và Nhiễm sắc thể',
    subject: 'biology',
    grade: 9,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-09',
    questions: [
      { id: 'b9_1', type: 'multiple_choice', question: 'Người đặt nền móng cho Di truyền học hiện đại là nhà khoa học nào?', options: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Thomas Morgan'], correctAnswer: 0 },
      { id: 'b9_2', type: 'multiple_choice', question: 'Mendel đã chọn đối tượng nghiên cứu xuất sắc cho các thí nghiệm lai giống của mình là:', options: ['Cây Đậu Hà Lan', 'Ruồi giấm', 'Chuột bạch', 'Ngô (Bắp)'], correctAnswer: 0 },
      { id: 'b9_3', type: 'multiple_choice', question: 'Cơ thể có kiểu gen chứa hai allele giống nhau (ví dụ: AA hoặc aa) được gọi là:', options: ['Cơ thể đồng hợp tử', 'Cơ thể dị hợp tử', 'Kiểu hình lặn', 'Kiểu hình trội'], correctAnswer: 0 },
      { id: 'b9_4', type: 'multiple_choice', question: 'Khi lai hai cơ thể bố mẹ thuần chủng khác nhau về một cặp tính trạng tương phản (AA x aa), ở thế hệ F1 thu được:', options: ['100% kiểu hình trội mang kiểu gen dị hợp (Aa)', '50% trội : 50% lặn', '75% trội : 25% lặn', '100% đồng hợp lặn'], correctAnswer: 0 },
      { id: 'b9_5', type: 'multiple_choice', question: 'Ở F2 trong phép lai một cặp tính trạng của Mendel, tỉ lệ phân li kiểu hình xấp xỉ là:', options: ['3 trội : 1 lặn', '1 trội : 1 lặn', '9 : 3 : 3 : 1', '1 : 2 : 1'], correctAnswer: 0 },
      { id: 'b9_6', type: 'multiple_choice', question: 'Phép lai phân tích là phép lai giữa cá thể mang tính trạng trội cần xác định kiểu gen với:', options: ['Cá thể mang tính trạng lặn (đồng hợp lặn aa)', 'Cá thể đồng hợp trội (AA)', 'Cá thể dị hợp (Aa)', 'Chính nó'], correctAnswer: 0 },
      { id: 'b9_7', type: 'multiple_choice', question: 'Phân tử ADN được cấu tạo theo nguyên tắc đa phân mà các đơn phân là:', options: ['4 loại nucleotide: A, T, G, C', 'Các amino acid', 'Glucose', 'Acid béo'], correctAnswer: 0 },
      { id: 'b9_8', type: 'multiple_choice', question: 'Theo nguyên tắc bổ sung trong chuỗi xoắn kép ADN, nucleotide loại A liên kết với loại nào?', options: ['T (bằng 2 liên kết hydro)', 'G', 'C', 'U'], correctAnswer: 0 },
      { id: 'b9_9', type: 'multiple_choice', question: 'Nucleotide loại G liên kết với nucleotide loại C bằng:', options: ['3 liên kết hydro', '2 liên kết hydro', '1 liên kết peptide', 'Liên kết cộng hóa trị'], correctAnswer: 0 },
      { id: 'b9_10', type: 'multiple_choice', question: 'Quá trình nhân đôi ADN diễn ra theo những nguyên tắc nào?', options: ['Nguyên tắc bổ sung và nguyên tắc bán bảo toàn (giữ lại một nửa)', 'Nguyên tắc khuôn mẫu và ngẫu nhiên', 'Nguyên tắc bảo toàn hoàn toàn', 'Nguyên tắc tự do'], correctAnswer: 0 },
      { id: 'b9_11', type: 'multiple_choice', question: 'Một đoạn ADN mang thông tin mã hóa cho một chuỗi polypeptide hoặc một phân tử ARN được gọi là:', options: ['Gen (Gene)', 'Codon', 'Nhiễm sắc thể', 'Histone'], correctAnswer: 0 },
      { id: 'b9_12', type: 'multiple_choice', question: 'Bộ nhiễm sắc thể lưỡng bội (2n) ở loài người bình thường gồm bao nhiêu chiếc?', options: ['46 chiếc (23 cặp)', '23 chiếc', '48 chiếc', '44 chiếc'], correctAnswer: 0 },
      { id: 'b9_13', type: 'multiple_choice', question: 'Cặp nhiễm sắc thể giới tính ở người phụ nữ bình thường là:', options: ['XX', 'XY', 'XO', 'YY'], correctAnswer: 0 },
      { id: 'b9_14', type: 'multiple_choice', question: 'Cặp nhiễm sắc thể giới tính ở người nam giới bình thường là:', options: ['XY', 'XX', 'YY', 'XXY'], correctAnswer: 0 },
      { id: 'b9_15', type: 'multiple_choice', question: 'Đột biến gen là những biến đổi trong:', options: ['Cấu trúc của gen liên quan đến một hoặc một số cặp nucleotide', 'Số lượng nhiễm sắc thể', 'Cấu trúc nhiễm sắc thể', 'Hình thái tế bào chất'], correctAnswer: 0 },
      { id: 'b9_16', type: 'multiple_choice', question: 'Người mắc hội chứng Down (Đao) có đặc điểm di truyền tế bào là:', options: ['Thừa 1 chiếc nhiễm sắc thể ở cặp số 21 (có 3 chiếc NST 21, 2n + 1 = 47)', 'Mất 1 NST giới tính X', 'Có 3 NST giới tính XXX', 'Thừa 1 NST ở cặp số 13'], correctAnswer: 0 },
      // True/False
      {
        id: 'b9_17',
        type: 'true_false',
        question: 'Về cấu trúc ADN và di truyền học ở người, hãy xác định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Trong phân tử ADN mạch kép, số lượng nucleotide loại A luôn bằng số nucleotide loại T (A = T).', isCorrect: true },
          { subId: 'b', text: 'Sự thụ tinh giữa tinh trùng mang NST Y với trứng mang NST X sẽ phát triển thành con gái.', isCorrect: false },
          { subId: 'c', text: 'Bệnh mù màu và máu khó đông ở người do gen lặn nằm trên vùng không tương đồng của NST X quy định.', isCorrect: true },
          { subId: 'd', text: 'Đột biến nhiễm sắc thể không bao giờ gây hại cho sức khỏe con người.', isCorrect: false }
        ]
      },
      // Short Answer
      {
        id: 'b9_18',
        type: 'short_answer',
        question: 'Một phân tử ADN mạch kép có tổng số 3000 nucleotide, trong đó số nucleotide loại Adenine (A) là 600 nucleotide. Hỏi số nucleotide loại Guanine (G) của phân tử ADN này là bao nhiêu?',
        acceptableAnswers: ['900', '900 nu', '900 nucleotide'],
        unit: 'nucleotide'
      }
    ]
  }
];
