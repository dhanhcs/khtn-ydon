import { Exam } from '../types';

export const examsGrade6: Exam[] = [
  // ================= ĐỀ 1 - KHỐI 6 =================
  {
    id: 'exam-phy-6-01',
    title: 'Đề 1 - Vật lí 6: Đo độ dài, khối lượng và thời gian',
    subject: 'physics',
    grade: 6,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-01',
    questions: [
      { id: 'p6_1', type: 'multiple_choice', question: 'Đơn vị đo độ dài hợp pháp của nước Việt Nam theo hệ SI là gì?', options: ['Mét (m)', 'Centimét (cm)', 'Milimét (mm)', 'Kilômét (km)'], correctAnswer: 0, explanation: 'Trong hệ SI, đơn vị chuẩn đo độ dài là mét (m).' },
      { id: 'p6_2', type: 'multiple_choice', question: 'Giới hạn đo (GHĐ) của thước là:', options: ['Độ dài lớn nhất ghi trên thước', 'Độ dài nhỏ nhất ghi trên thước', 'Độ dài giữa hai vạch chia liên tiếp', 'Chiều dài của cái thước'], correctAnswer: 0, explanation: 'GHĐ là độ dài lớn nhất ghi trên thước đo.' },
      { id: 'p6_3', type: 'multiple_choice', question: 'Độ chia nhỏ nhất (ĐCNN) của thước là:', options: ['Độ dài giữa hai vạch chia liên tiếp trên thước', 'Độ dài nhỏ nhất ghi trên thước', 'Vạch số 0 trên thước', 'Khoảng cách giữa vạch 0 và vạch 1'], correctAnswer: 0, explanation: 'ĐCNN là độ dài giữa hai vạch chia liên tiếp.' },
      { id: 'p6_4', type: 'multiple_choice', question: 'Dụng cụ nào dùng để đo khối lượng của một vật?', options: ['Cân điện tử / Cân Roberval', 'Thước dây', 'Nhiệt kế', 'Bình chia độ'], correctAnswer: 0, explanation: 'Cân là dụng cụ đo khối lượng.' },
      { id: 'p6_5', type: 'multiple_choice', question: 'Một kilôgam (1 kg) bằng bao nhiêu gam (g)?', options: ['1000 g', '100 g', '10 g', '10000 g'], correctAnswer: 0, explanation: '1 kg = 1000 g.' },
      { id: 'p6_6', type: 'multiple_choice', question: 'Đơn vị chuẩn đo thời gian trong hệ đo lường SI là:', options: ['Giây (s)', 'Phút (min)', 'Giờ (h)', 'Ngày'], correctAnswer: 0, explanation: 'Đơn vị chuẩn đo thời gian trong hệ SI là giây (s).' },
      { id: 'p6_7', type: 'multiple_choice', question: 'Để đo thời gian chạy 100m của học sinh trong giờ thể dục, người ta dùng:', options: ['Đồng hồ bấm giây', 'Đồng hồ treo tường', 'Đồng hồ cát', 'Đồng hồ quả lắc'], correctAnswer: 0, explanation: 'Đồng hồ bấm giây có độ chính xác cao đến phần trăm giây.' },
      { id: 'p6_8', type: 'multiple_choice', question: 'Dụng cụ nào dưới đây dùng để đo thể tích chất lỏng?', options: ['Bình chia độ (ống đong)', 'Cân đòn', 'Thước mét', 'Lực kế'], correctAnswer: 0, explanation: 'Bình chia độ dùng để đo thể tích chất lỏng.' },
      { id: 'p6_9', type: 'multiple_choice', question: '1 lít (1 L) tương đương với thể tích của:', options: ['1 đềximét khối (1 dm³)', '1 mét khối (1 m³)', '1 centimét khối (1 cm³)', '100 cm³'], correctAnswer: 0, explanation: '1 L = 1 dm³ = 1000 cm³.' },
      { id: 'p6_10', type: 'multiple_choice', question: 'Khi đọc kết quả đo độ dài bằng thước, mắt cần đặt thế nào?', options: ['Nhìn vuông góc với cạnh thước tại đầu kia của vật', 'Nhìn xiên sang trái', 'Nhìn xiên sang phải', 'Nhìn từ trên chéo xuống'], correctAnswer: 0, explanation: 'Mắt phải nhìn vuông góc với cạnh thước tại vị trí vạch đo.' },
      { id: 'p6_11', type: 'multiple_choice', question: 'Để đo nhiệt độ cơ thể người, dụng cụ chính xác và tiện lợi là:', options: ['Nhiệt kế y tế', 'Nhiệt kế rượu', 'Nhiệt kế kim loại', 'Nhiệt kế treo tường'], correctAnswer: 0, explanation: 'Nhiệt kế y tế có vạch đo từ khoảng 35°C đến 42°C.' },
      { id: 'p6_12', type: 'multiple_choice', question: 'Thang nhiệt độ thường dùng ở Việt Nam là thang nhiệt độ nào?', options: ['Thang Celsius (°C)', 'Thang Fahrenheit (°F)', 'Thang Kelvin (K)', 'Thang Rankine'], correctAnswer: 0, explanation: 'Việt Nam sử dụng thang Celsius (°C).' },
      { id: 'p6_13', type: 'multiple_choice', question: 'Nhiệt độ sôi của nước tinh khiết ở áp suất tiêu chuẩn là:', options: ['100 °C', '0 °C', '37 °C', '50 °C'], correctAnswer: 0, explanation: 'Nước sôi ở 100°C và đóng băng ở 0°C.' },
      { id: 'p6_14', type: 'multiple_choice', question: 'Lực nào làm cho quả táo rơi từ trên cành cây xuống đất?', options: ['Trọng lực (lực hút của Trái Đất)', 'Lực ma sát', 'Lực đàn hồi', 'Lực từ'], correctAnswer: 0, explanation: 'Trọng lực kéo mọi vật về phía tâm Trái Đất.' },
      { id: 'p6_15', type: 'multiple_choice', question: 'Đơn vị của lực trong hệ SI là:', options: ['Newton (N)', 'Joule (J)', 'Kilôgam (kg)', 'Pascal (Pa)'], correctAnswer: 0, explanation: 'Đơn vị của lực là Newton (N).' },
      { id: 'p6_16', type: 'multiple_choice', question: 'Một vật có khối lượng m = 2 kg thì có trọng lượng P tương ứng trên mặt đất là khoảng:', options: ['20 N', '2 N', '200 N', '0.2 N'], correctAnswer: 0, explanation: 'P ≈ 10 . m = 10 . 2 = 20 N.' },
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
      {
        id: 'p6_18',
        type: 'short_answer',
        question: 'Một bình chia độ đang chứa sẵn 50 mL nước. Người ta thả chìm hoàn toàn một hòn sỏi vào bình thì mực nước dâng lên vạch 78 mL. Hỏi thể tích của hòn sỏi bằng bao nhiêu mL?',
        acceptableAnswers: ['28', '28ml', '28 ml'],
        unit: 'mL',
        explanation: 'V = 78 - 50 = 28 mL.'
      }
    ]
  },

  // ================= ĐỀ 2 - KHỐI 6 =================
  {
    id: 'exam-chem-6-01',
    title: 'Đề 2 - Hóa học 6: Các thể của chất, Oxygen và Không khí',
    subject: 'chemistry',
    grade: 6,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-02',
    questions: [
      { id: 'c6_1', type: 'multiple_choice', question: 'Chất ở thể nào có hình dạng và thể tích xác định?', options: ['Thể rắn', 'Thể lỏng', 'Thể khí', 'Cả thể lỏng và khí'], correctAnswer: 0, explanation: 'Chất rắn có hình dạng và thể tích xác định.' },
      { id: 'c6_2', type: 'multiple_choice', question: 'Quá trình chất chuyển từ thể lỏng sang thể khí gọi là:', options: ['Sự bay hơi (sự sôi)', 'Sự nóng chảy', 'Sự đông đặc', 'Sự ngưng tụ'], correctAnswer: 0, explanation: 'Sự bay hơi là quá trình chuyển từ thể lỏng sang thể khí.' },
      { id: 'c6_3', type: 'multiple_choice', question: 'Quá trình nước đá chuyển thành nước lỏng gọi là hiện tượng gì?', options: ['Nóng chảy', 'Đông đặc', 'Bay hơi', 'Ngưng tụ'], correctAnswer: 0, explanation: 'Rắn sang lỏng là sự nóng chảy.' },
      { id: 'c6_4', type: 'multiple_choice', question: 'Khí nào chiếm thể tích lớn nhất trong thành phần không khí khô?', options: ['Nitrogen (~78%)', 'Oxygen (~21%)', 'Carbon dioxide (~0.03%)', 'Argon (~0.9%)'], correctAnswer: 0, explanation: 'Khí nitrogen chiếm khoảng 78% thể tích không khí.' },
      { id: 'c6_5', type: 'multiple_choice', question: 'Khí oxygen có tính chất vật lí nào sau đây?', options: ['Chất khí không màu, không mùi, ít tan trong nước', 'Chất khí màu vàng lục, mùi hắc', 'Chất khí nhẹ hơn không khí rất nhiều', 'Chất lỏng màu xanh lam ở nhiệt độ phòng'], correctAnswer: 0, explanation: 'Oxygen là chất khí không màu, không mùi, nặng hơn không khí và ít tan trong nước.' },
      { id: 'c6_6', type: 'multiple_choice', question: 'Khí oxygen duy trì hai quá trình sinh vật và hóa học quan trọng nào?', options: ['Sự hô hấp và sự cháy', 'Sự quang hợp và sự đông đặc', 'Sự tiêu hóa và sự lắng đọng', 'Sự thăng hoa và ngưng kết'], correctAnswer: 0, explanation: 'Oxygen duy trì sự sống (hô hấp) và sự cháy.' },
      { id: 'c6_7', type: 'multiple_choice', question: 'Hành động nào góp phần bảo vệ và cải thiện chất lượng bầu không khí?', options: ['Trồng nhiều cây xanh và dùng xe đạp', 'Đốt rơm rạ trên đồng', 'Xả khí thải công nghiệp chưa qua xử lí', 'Chặt phá rừng phòng hộ'], correctAnswer: 0, explanation: 'Trồng cây xanh hấp thụ CO2 và nhả ra O2.' },
      { id: 'c6_8', type: 'multiple_choice', question: 'Chất tinh khiết là chất:', options: ['Chỉ được tạo nên từ một chất duy nhất, có tính chất xác định', 'Được tạo nên từ hai hay nhiều chất trộn lẫn', 'Luôn là chất ở thể rắn', 'Không thể hòa tan trong nước'], correctAnswer: 0, explanation: 'Chất tinh khiết không lẫn chất khác.' },
      { id: 'c6_9', type: 'multiple_choice', question: 'Nước khoáng đóng chai là ví dụ về:', options: ['Hỗn hợp', 'Chất tinh khiết', 'Đơn chất', 'Kim loại'], correctAnswer: 0, explanation: 'Nước khoáng chứa nước và nhiều khoáng chất hòa tan, là hỗn hợp.' },
      { id: 'c6_10', type: 'multiple_choice', question: 'Hỗn hợp nước muối đồng nhất không phân biệt được ranh giới các chất được gọi là:', options: ['Dung dịch', 'Huyền phù', 'Nhũ tương', 'Chất kết tủa'], correctAnswer: 0, explanation: 'Nước muối tan hoàn toàn là một dung dịch đồng nhất.' },
      { id: 'c6_11', type: 'multiple_choice', question: 'Dầu ăn phân tán thành các giọt nhỏ lơ lửng trong nước tạo thành hệ gì?', options: ['Nhũ tương', 'Huyền phù', 'Dung dịch', 'Chất rắn'], correctAnswer: 0, explanation: 'Chất lỏng phân tán trong chất lỏng không tan gọi là nhũ tương.' },
      { id: 'c6_12', type: 'multiple_choice', question: 'Phù sa trong nước sông ngòi vào mùa lũ là ví dụ của:', options: ['Huyền phù', 'Nhũ tương', 'Dung dịch đồng nhất', 'Hợp chất tinh khiết'], correctAnswer: 0, explanation: 'Hạt rắn lơ lửng trong chất lỏng gọi là huyền phù.' },
      { id: 'c6_13', type: 'multiple_choice', question: 'Phương pháp nào dùng để tách muối ăn ra khỏi dung dịch nước biển?', options: ['Cô cạn (bốc hơi nước dưới ánh nắng mặt trời)', 'Lọc qua giấy lọc', 'Chiết', 'Dùng nam châm'], correctAnswer: 0, explanation: 'Làm bay hơi nước để lại muối kết tinh.' },
      { id: 'c6_14', type: 'multiple_choice', question: 'Để tách mạt sắt ra khỏi hỗn hợp mạt sắt và cát, phương pháp đơn giản nhất là:', options: ['Dùng nam châm hút sắt', 'Đun sôi hỗn hợp', 'Lọc qua phễu', 'Hòa tan vào nước'], correctAnswer: 0, explanation: 'Nam châm hút sắt có từ tính.' },
      { id: 'c6_15', type: 'multiple_choice', question: 'Nhiên liệu nào sau đây là nhiên liệu hóa thạch không tái tạo?', options: ['Than đá và dầu mỏ', 'Củi khô', 'Khí sinh học (biogas)', 'Năng lượng mặt trời'], correctAnswer: 0, explanation: 'Than đá và dầu mỏ hình thành qua hàng triệu năm.' },
      { id: 'c6_16', type: 'multiple_choice', question: 'Khi xảy ra cháy xăng dầu nhỏ, tuyệt đối KHÔNG nên dùng chất nào để dập lửa?', options: ['Nước lã', 'Cát khô', 'Bình chữa cháy bọt CO2', 'Chăn ướt trùm lên'], correctAnswer: 0, explanation: 'Xăng dầu nhẹ hơn nước, nổi lên và làm đám cháy lan rộng.' },
      {
        id: 'c6_17',
        type: 'true_false',
        question: 'Về oxygen, không khí và các thể của chất, đánh giá tính Đúng/Sai của các nhận định:',
        statements: [
          { subId: 'a', text: 'Khí oxygen tan rất nhiều trong nước ở điều kiện thường.', isCorrect: false },
          { subId: 'b', text: 'Không khí là một hỗn hợp gồm nhiều chất khí khác nhau.', isCorrect: true },
          { subId: 'c', text: 'Sự ngưng tụ là quá trình chất chuyển từ thể khí sang thể lỏng.', isCorrect: true },
          { subId: 'd', text: 'Khi đun nước sôi, bọt khí xuất hiện chứng tỏ nước đang bị biến đổi hóa học tạo chất mới.', isCorrect: false }
        ]
      },
      {
        id: 'c6_18',
        type: 'short_answer',
        question: 'Trong 100 lít không khí khô ở điều kiện tiêu chuẩn, thể tích của khí oxygen xấp xỉ bằng bao nhiêu lít?',
        acceptableAnswers: ['21', '21 lít', '21 lit', '21L'],
        unit: 'lít',
        explanation: 'Khí oxygen chiếm khoảng 21% thể tích không khí, nên trong 100 L có 21 L O2.'
      }
    ]
  },

  // ================= ĐỀ 3 - KHỐI 6 =================
  {
    id: 'exam-bio-6-01',
    title: 'Đề 3 - Sinh học 6: Tế bào - Đơn vị cơ bản của sự sống',
    subject: 'biology',
    grade: 6,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-03',
    questions: [
      { id: 'b6_1', type: 'multiple_choice', question: 'Đơn vị cấu trúc và chức năng cơ bản nhất của mọi cơ thể sống là:', options: ['Tế bào', 'Mô', 'Cơ quan', 'Hệ cơ quan'], correctAnswer: 0, explanation: 'Tế bào là đơn vị cơ bản cấu tạo nên mọi sự sống.' },
      { id: 'b6_2', type: 'multiple_choice', question: 'Thành phần nào của tế bào có chức năng điều khiển mọi hoạt động sống?', options: ['Nhân tế bào (hoặc vùng nhân)', 'Màng tế bào', 'Tế bào chất', 'Không bào'], correctAnswer: 0, explanation: 'Nhân chứa vật chất di truyền, điều khiển tế bào.' },
      { id: 'b6_3', type: 'multiple_choice', question: 'Màng sinh chất (màng tế bào) có chức năng chính là gì?', options: ['Bảo vệ và kiểm soát các chất ra vào tế bào', 'Quang hợp tạo chất hữu cơ', 'Chứa dịch tế bào tạo vị ngọt', 'Duy trì hình dạng cố định tuyệt đối'], correctAnswer: 0, explanation: 'Màng tế bào kiểm soát sự trao đổi chất qua màng.' },
      { id: 'b6_4', type: 'multiple_choice', question: 'Bào quan nào chỉ có ở tế bào thực vật mà không có ở tế bào động vật?', options: ['Lục lạp (chứa diệp lục)', 'Ti thể', 'Ribosome', 'Màng tế bào'], correctAnswer: 0, explanation: 'Lục lạp giúp thực vật quang hợp.' },
      { id: 'b6_5', type: 'multiple_choice', question: 'Tế bào nhân sơ khác tế bào nhân thực ở điểm cơ bản nào?', options: ['Chưa có màng nhân bao bọc vật chất di truyền', 'Không có màng tế bào', 'Kích thước lớn hơn rất nhiều', 'Có nhiều bào quan có màng'], correctAnswer: 0, explanation: 'Tế bào nhân sơ chỉ có vùng nhân, chưa có màng nhân.' },
      { id: 'b6_6', type: 'multiple_choice', question: 'Sinh vật nào dưới đây là sinh vật đơn bào?', options: ['Trùng roi xanh / Vi khuẩn E. coli', 'Cây bàng', 'Con mèo', 'Cây ngô'], correctAnswer: 0, explanation: 'Trùng roi và vi khuẩn có cơ thể chỉ gồm 1 tế bào.' },
      { id: 'b6_7', type: 'multiple_choice', question: 'Dụng cụ quang học phóng đại giúp quan sát rõ cấu trúc tế bào là:', options: ['Kính hiển vi quang học', 'Kính lúp cầm tay', 'Ống nhòm', 'Kính viễn vọng'], correctAnswer: 0, explanation: 'Kính hiển vi quang học phóng đại từ 40 đến 1000 lần.' },
      { id: 'b6_8', type: 'multiple_choice', question: 'Quá trình phân chia của 1 tế bào ban đầu tạo ra bao nhiêu tế bào con?', options: ['2 tế bào con', '4 tế bào con', '8 tế bào con', '1 tế bào con'], correctAnswer: 0, explanation: '1 tế bào phân chia tạo 2 tế bào con.' },
      { id: 'b6_9', type: 'multiple_choice', question: 'Tế bào lớn lên nhờ quá trình nào?', options: ['Sự trao đổi chất (tổng hợp các chất cấu tạo tế bào)', 'Tế bào hút nước phồng to rồi dừng lại', 'Nhân phân chia liên tục', 'Vỏ tế bào dày lên gấp đôi'], correctAnswer: 0, explanation: 'Trao đổi chất giúp tế bào tăng kích thước.' },
      { id: 'b6_10', type: 'multiple_choice', question: 'Tập hợp các tế bào có cùng hình dạng, cấu tạo và chức năng được gọi là:', options: ['Mô', 'Cơ quan', 'Hệ cơ quan', 'Cơ thể'], correctAnswer: 0, explanation: 'Mô là tập hợp các tế bào cùng chức năng.' },
      { id: 'b6_11', type: 'multiple_choice', question: 'Bộ phận nào của cây xanh là một cơ quan dinh dưỡng?', options: ['Lá cây', 'Hoa', 'Quả', 'Hạt'], correctAnswer: 0, explanation: 'Rễ, thân, lá là cơ quan sinh dưỡng.' },
      { id: 'b6_12', type: 'multiple_choice', question: 'Vi khuẩn thuộc nhóm sinh vật có cấu tạo tế bào gì?', options: ['Nhân sơ', 'Nhân thực', 'Chưa có cấu tạo tế bào', 'Đa bào phức tạp'], correctAnswer: 0, explanation: 'Vi khuẩn là sinh vật nhân sơ đơn bào.' },
      { id: 'b6_13', type: 'multiple_choice', question: 'Virus có đặc điểm nào khác biệt so với vi khuẩn?', options: ['Chưa có cấu tạo tế bào, chỉ sống kí sinh nội bào bắt buộc', 'Có nhân hoàn chỉnh và lục lạp', 'Có kích thước lớn hơn vi khuẩn', 'Tự quang hợp được thức ăn'], correctAnswer: 0, explanation: 'Virus là dạng sống chưa có cấu tạo tế bào.' },
      { id: 'b6_14', type: 'multiple_choice', question: 'Nấm men dùng để làm bánh mì và ủ rượu thuộc giới nào?', options: ['Giới Nấm', 'Giới Thực vật', 'Giới Động vật', 'Giới Khởi sinh'], correctAnswer: 0, explanation: 'Nấm men là nấm đơn bào thuộc giới Nấm.' },
      { id: 'b6_15', type: 'multiple_choice', question: 'Thành phần mang tính quy định thành tế bào thực vật cứng chắc là:', options: ['Cellulose', 'Chitin', 'Peptidoglycan', 'Protein'], correctAnswer: 0, explanation: 'Thành tế bào thực vật cấu tạo từ cellulose.' },
      { id: 'b6_16', type: 'multiple_choice', question: 'Sau 3 lần phân chia liên tiếp từ 1 tế bào ban đầu, số tế bào con tạo thành là:', options: ['8 tế bào', '6 tế bào', '4 tế bào', '16 tế bào'], correctAnswer: 0, explanation: '2^3 = 8 tế bào con.' },
      {
        id: 'b6_17',
        type: 'true_false',
        question: 'Về tế bào và tổ chức cơ thể sống, hãy nhận định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tất cả các loài sinh vật trên Trái Đất đều có cấu tạo đa bào.', isCorrect: false },
          { subId: 'b', text: 'Tế bào thực vật có thành tế bào bằng cellulose và lục lạp.', isCorrect: true },
          { subId: 'c', text: 'Nhân tế bào là trung tâm điều khiển mọi hoạt động sống của tế bào.', isCorrect: true },
          { subId: 'd', text: 'Virus có thể tự sinh sản và phát triển độc lập ngoài môi trường không cần vật chủ.', isCorrect: false }
        ]
      },
      {
        id: 'b6_18',
        type: 'short_answer',
        question: 'Từ 1 tế bào ban đầu trải qua 4 lần sinh sản phân chia liên tiếp sẽ tạo ra tổng cộng bao nhiêu tế bào con?',
        acceptableAnswers: ['16', '16 tế bào', '16 te bao'],
        unit: 'tế bào',
        explanation: 'Số tế bào con = 2^4 = 16 tế bào.'
      }
    ]
  },

  // ================= ĐỀ 4 - KHỐI 6 =================
  {
    id: 'exam-phy-6-04',
    title: 'Đề 4 - Vật lí 6: Lực và tác dụng của lực, Biến dạng lò xo, Lực ma sát',
    subject: 'physics',
    grade: 6,
    testNumber: 'TX4',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-04',
    questions: [
      { id: 'p64_1', type: 'multiple_choice', question: 'Tác dụng đẩy hoặc kéo của vật này lên vật khác được gọi là gì?', options: ['Lực', 'Năng lượng', 'Công', 'Áp suất'], correctAnswer: 0, explanation: 'Lực là tác dụng đẩy, kéo của vật này lên vật khác.' },
      { id: 'p64_2', type: 'multiple_choice', question: 'Khi một quả bóng đang bay đập vào tường và nảy ngược trở lại, lực của tường đã gây ra tác dụng gì?', options: ['Làm biến đổi chuyển động của quả bóng', 'Chỉ làm bóng nặng thêm', 'Chỉ làm tăng nhiệt độ quả bóng', 'Không làm thay đổi chuyển động'], correctAnswer: 0, explanation: 'Lực làm biến đổi vận tốc và hướng chuyển động của quả bóng.' },
      { id: 'p64_3', type: 'multiple_choice', question: 'Dụng cụ dùng để đo độ lớn của lực là:', options: ['Lực kế', 'Cân đồng hồ', 'Nhiệt kế', 'Thước kẹp'], correctAnswer: 0, explanation: 'Lực kế dùng để đo lực.' },
      { id: 'p64_4', type: 'multiple_choice', question: 'Độ dãn của lò xo treo thẳng đứng tỉ lệ với đại lượng nào?', options: ['Khối lượng của vật treo vào lò xo', 'Chiều dài tự nhiên của lò xo', 'Đường kính vòng xoắn', 'Nhiệt độ phòng'], correctAnswer: 0, explanation: 'Độ biến dạng lò xo tỉ lệ với trọng lượng (khối lượng) quả nặng treo.' },
      { id: 'p64_5', type: 'multiple_choice', question: 'Lực ma sát xuất hiện khi nào?', options: ['Khi hai bề mặt vật tiếp xúc và trượt hoặc có xu hướng trượt lên nhau', 'Khi vật đứng yên lơ lửng trong chân không', 'Khi vật chỉ chịu lực hút của Trái Đất', 'Khi vật chuyển động trong không gian vũ trụ'], correctAnswer: 0, explanation: 'Lực ma sát cản trở chuyển động tại bề mặt tiếp xúc.' },
      { id: 'p64_6', type: 'multiple_choice', question: 'Lốp xe máy, ô tô có các rãnh xẻ và khía gai nhằm mục đích gì?', options: ['Tăng lực ma sát bám đường, chống trơn trượt', 'Làm giảm khối lượng bánh xe', 'Tiết kiệm cao su sản xuất', 'Làm đẹp cho xe'], correctAnswer: 0, explanation: 'Gai lốp tăng ma sát bám đường.' },
      { id: 'p64_7', type: 'multiple_choice', question: 'Trường hợp nào lực ma sát có hại và cần phải làm giảm?', options: ['Xích líp xe đạp bị khô dầu kêu cót két và nhanh mòn', 'Bàn chân bước trên đường không bị ngã', 'Quẹt que diêm vào vỏ bao diêm để cháy', 'Phanh xe dừng lại khi gặp đèn đỏ'], correctAnswer: 0, explanation: 'Ma sát làm mòn xích líp, cần tra dầu bôi trơn để giảm.' },
      { id: 'p64_8', type: 'multiple_choice', question: 'Lực tiếp xúc là lực xuất hiện khi nào?', options: ['Vật gây ra lực có sự tiếp xúc trực tiếp hoặc gián tiếp với vật chịu lực', 'Hai vật ở khoảng cách xa nhau', 'Chỉ giữa Trái Đất và Mặt Trời', 'Chỉ tác dụng trong từ trường'], correctAnswer: 0, explanation: 'Lực tiếp xúc đòi hỏi hai vật tiếp xúc với nhau.' },
      { id: 'p64_9', type: 'multiple_choice', question: 'Lực không tiếp xúc xuất hiện trong trường hợp nào sau đây?', options: ['Nam châm hút đinh sắt từ xa', 'Dùng búa đóng đinh vào gỗ', 'Chân sút bóng vào lưới', 'Tay đẩy cánh cửa mở ra'], correctAnswer: 0, explanation: 'Lực từ của nam châm tác dụng không cần tiếp xúc.' },
      { id: 'p64_10', type: 'multiple_choice', question: 'Một lực kế có độ chia nhỏ nhất là 0.1 N. Khi treo vật, kim chỉ vạch số 3.5. Trọng lượng của vật là:', options: ['3.5 N', '35 N', '0.35 N', '350 N'], correctAnswer: 0, explanation: 'Giá trị đọc trên lực kế là 3.5 N.' },
      { id: 'p64_11', type: 'multiple_choice', question: 'Trọng lượng P của một vật có khối lượng m = 500 g trên mặt đất là khoảng:', options: ['5 N', '50 N', '0.5 N', '500 N'], correctAnswer: 0, explanation: '500 g = 0.5 kg -> P ≈ 10 * 0.5 = 5 N.' },
      { id: 'p64_12', type: 'multiple_choice', question: 'Khi kéo một bao cát trên nền nhà gạch hoa ướt dễ hơn nền bê tông ráp là do:', options: ['Lực ma sát trượt trên nền gạch hoa ướt nhỏ hơn', 'Khối lượng bao cát nhẹ hơn', 'Trọng lực giảm đi', 'Bao cát nổi lên'], correctAnswer: 0, explanation: 'Nền trơn nhẵn làm giảm lực ma sát trượt.' },
      { id: 'p64_13', type: 'multiple_choice', question: 'Ổ bi lắp ở trục bánh xe đạp có tác dụng gì?', options: ['Chuyển ma sát trượt thành ma sát lăn để giảm ma sát', 'Làm bánh xe quay chậm lại', 'Tăng khối lượng xe', 'Tăng ma sát trượt'], correctAnswer: 0, explanation: 'Ma sát lăn nhỏ hơn ma sát trượt rất nhiều.' },
      { id: 'p64_14', type: 'multiple_choice', question: 'Biểu diễn một lực cần xác định các yếu tố nào?', options: ['Điểm đặt, phương, chiều và độ lớn', 'Chỉ cần độ lớn và màu sắc', 'Chỉ cần thời gian tác dụng', 'Chỉ cần khối lượng vật'], correctAnswer: 0, explanation: 'Lực là đại lượng vectơ có điểm đặt, phương, chiều và độ lớn.' },
      { id: 'p64_15', type: 'multiple_choice', question: 'Một lò xo có chiều dài tự nhiên 10 cm. Khi treo quả cân 100g lò xo dài 12 cm. Treo thêm 1 quả cân 100g nữa thì chiều dài lò xo là:', options: ['14 cm', '15 cm', '16 cm', '13 cm'], correctAnswer: 0, explanation: 'Mỗi 100g lò xo dãn 2 cm -> 200g dãn 4 cm -> dài 10 + 4 = 14 cm.' },
      { id: 'p64_16', type: 'multiple_choice', question: 'Mặt dưới đế giày dép đi lâu ngày bị mòn phẳng đi là do:', options: ['Tác dụng mài mòn của lực ma sát với mặt đất', 'Áp suất khí quyển ép vào', 'Nhiệt độ nóng của mặt đường', 'Trọng lực làm teo cao su'], correctAnswer: 0, explanation: 'Ma sát trượt mài mòn đế giày dép khi di chuyển.' },
      {
        id: 'p64_17',
        type: 'true_false',
        question: 'Về lực, biến dạng và ma sát, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Lực ma sát luôn luôn có hại trong đời sống con người.', isCorrect: false },
          { subId: 'b', text: 'Trọng lực tác dụng lên một vật là lực không tiếp xúc.', isCorrect: true },
          { subId: 'c', text: 'Độ dãn của lò xo treo thẳng đứng tăng khi khối lượng quả nặng tăng.', isCorrect: true },
          { subId: 'd', text: 'Khi bóp phanh xe đạp, lực ma sát trượt giữa má phanh và vành bánh xe giúp xe dừng lại.', isCorrect: true }
        ]
      },
      {
        id: 'p64_18',
        type: 'short_answer',
        question: 'Một học sinh có khối lượng 45 kg đứng trên mặt đất. Trọng lượng của bạn học sinh đó tương ứng xấp xỉ bằng bao nhiêu Newton (N)?',
        acceptableAnswers: ['450', '450N', '450 N'],
        unit: 'N',
        explanation: 'P = 10 * m = 10 * 45 = 450 N.'
      }
    ]
  },

  // ================= ĐỀ 5 - KHỐI 6 =================
  {
    id: 'exam-chem-6-05',
    title: 'Đề 5 - Hóa học 6: Một số vật liệu, nhiên liệu và Hỗn hợp, Dung dịch',
    subject: 'chemistry',
    grade: 6,
    testNumber: 'TX5',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-05',
    questions: [
      { id: 'c65_1', type: 'multiple_choice', question: 'Kim loại nhôm và đồng được dùng làm dây dẫn điện nhờ tính chất nào?', options: ['Dẫn điện tốt', 'Dẻo và nhẹ', 'Không rỉ sét', 'Dễ nóng chảy'], correctAnswer: 0, explanation: 'Đồng và nhôm dẫn điện rất tốt.' },
      { id: 'c65_2', type: 'multiple_choice', question: 'Vật liệu nào sau đây có tính cách điện, nhẹ, bền nhưng khó phân hủy trong tự nhiên gây ô nhiễm rác thải nhựa?', options: ['Nhựa (plastic)', 'Thủy tinh', 'Gốm sứ', 'Kim loại sắt'], correctAnswer: 0, explanation: 'Nhựa khó phân hủy sinh học, cần tái chế.' },
      { id: 'c65_3', type: 'multiple_choice', question: 'Để làm đồ gốm sứ người ta dùng nguyên liệu chính là:', options: ['Đất sét', 'Cát trắng', 'Quặng sắt', 'Dầu mỏ'], correctAnswer: 0, explanation: 'Đất sét nung ở nhiệt độ cao tạo thành gốm sứ.' },
      { id: 'c65_4', type: 'multiple_choice', question: 'Thủy tinh có tính chất nổi bật nào sau đây?', options: ['Trong suốt, giòn, không dẫn điện', 'Dẫn nhiệt rất tốt', 'Mềm dẻo uốn cong được', 'Dễ cháy trong không khí'], correctAnswer: 0, explanation: 'Thủy tinh trong suốt, cứng nhưng giòn dễ vỡ.' },
      { id: 'c65_5', type: 'multiple_choice', question: 'Khi hòa tan đường vào cốc nước nóng, chất tan là gì và dung môi là gì?', options: ['Chất tan là đường, dung môi là nước', 'Chất tan là nước, dung môi là đường', 'Cả hai đều là dung môi', 'Cả hai đều là chất tan'], correctAnswer: 0, explanation: 'Đường tan vào nước nên đường là chất tan, nước là dung môi.' },
      { id: 'c65_6', type: 'multiple_choice', question: 'Dung dịch chưa bão hòa là dung dịch:', options: ['Có thể hòa tan thêm chất tan ở nhiệt độ xác định', 'Không thể hòa tan thêm chất tan', 'Đã đông đặc thành đá', 'Có chất rắn lắng xuống đáy'], correctAnswer: 0, explanation: 'Chưa bão hòa là còn khả năng hòa tan thêm chất tan.' },
      { id: 'c65_7', type: 'multiple_choice', question: 'Để hòa tan đường nhanh hơn vào nước, cách nào sau đây KHÔNG hiệu quả?', options: ['Cho nước đá lạnh vào cốc', 'Khuấy đều dung dịch', 'Dùng nước nóng', 'Nghiền nhỏ hạt đường'], correctAnswer: 0, explanation: 'Nước đá lạnh làm giảm độ tan và tốc độ hòa tan của đường.' },
      { id: 'c65_8', type: 'multiple_choice', question: 'Tách cát ra khỏi nước cát đục người ta dùng phương pháp nào?', options: ['Lọc qua phễu có giấy lọc', 'Cô cạn đun sôi', 'Chiết', 'Dùng nam châm'], correctAnswer: 0, explanation: 'Hạt cát kích thước lớn bị giữ lại trên giấy lọc.' },
      { id: 'c65_9', type: 'multiple_choice', question: 'Phương pháp chiết được dùng để tách hỗn hợp nào sau đây?', options: ['Hỗn hợp dầu ăn và nước', 'Hỗn hợp muối ăn và nước', 'Hỗn hợp đường và bột mì', 'Hỗn hợp rượu và nước'], correctAnswer: 0, explanation: 'Dầu ăn không tan và nhẹ hơn nước nên tách bằng phễu chiết.' },
      { id: 'c65_10', type: 'multiple_choice', question: 'Nhiên liệu khí nào sinh ra từ hầm ủ chất thải chăn nuôi gia súc được khuyến khích sử dụng ở nông thôn?', options: ['Biogas (khí sinh học)', 'Khí acetylen', 'Khí hydrogen lỏng', 'Khí than đá'], correctAnswer: 0, explanation: 'Khí biogas giải quyết ô nhiễm phân gia súc và cung cấp nhiệt đun nấu.' },
      { id: 'c65_11', type: 'multiple_choice', question: 'Nguồn năng lượng nào sau đây là năng lượng tái tạo, thân thiện với môi trường?', options: ['Năng lượng mặt trời, gió và thủy triều', 'Dầu mỏ', 'Than đá', 'Khí tự nhiên mỏ dầu'], correctAnswer: 0, explanation: 'Năng lượng mặt trời, gió vô tận và sạch.' },
      { id: 'c65_12', type: 'multiple_choice', question: 'Biện pháp nào giúp sử dụng nhiên liệu an toàn và tiết kiệm?', options: ['Cung cấp đủ lượng không khí để nhiên liệu cháy hoàn toàn', 'Bịt kín bếp để không cho gió vào', 'Đốt nhiên liệu ở nơi kín gió không có lối thoát khí', 'Dùng dầu hỏa dội vào bếp củi đang cháy to'], correctAnswer: 0, explanation: 'Đủ oxygen giúp cháy hết nhiệt năng, không sinh khí độc CO.' },
      { id: 'c65_13', type: 'multiple_choice', question: 'Lương thực chính cung cấp tinh bột dồi dào trong bữa ăn của người Việt Nam là:', options: ['Gạo', 'Thịt bò', 'Dầu đậu nành', 'Cải bắp'], correctAnswer: 0, explanation: 'Gạo là lương thực chứa lượng tinh bột cao nhất.' },
      { id: 'c65_14', type: 'multiple_choice', question: 'Chất dinh dưỡng nào giúp xây dựng và tái tạo tế bào cơ thể?', options: ['Protein (chất đạm)', 'Chất béo (lipid)', 'Chất khoáng', 'Vitamin'], correctAnswer: 0, explanation: 'Protein là nguyên liệu xây dựng tế bào, cơ bắp.' },
      { id: 'c65_15', type: 'multiple_choice', question: 'Để bảo quản thịt cá tươi lâu không bị ôi thiu do vi sinh vật phân hủy, người ta dùng cách:', options: ['Đông lạnh hoặc ướp muối', 'Để ngoài trời nắng gắt', 'Ngâm trong nước ấm', 'Đậy kín trong túi nilon kín ở nhiệt độ 30°C'], correctAnswer: 0, explanation: 'Nhiệt độ thấp và nồng độ muối cao ức chế vi khuẩn.' },
      { id: 'c65_16', type: 'multiple_choice', question: 'Quá trình thu hồi muối hạt từ ruộng muối ở vùng duyên hải Miền Trung dựa trên hiện tượng:', options: ['Nước bay hơi dưới ánh nắng mặt trời làm muối kết tinh', 'Nước ngưng tụ', 'Muối nóng chảy', 'Lắng đọng phù sa'], correctAnswer: 0, explanation: 'Bay hơi nước biển làm dung dịch bão hòa và muối kết tinh.' },
      {
        id: 'c65_17',
        type: 'true_false',
        question: 'Về vật liệu, nhiên liệu và dung dịch, hãy đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Nhựa là vật liệu dễ bị han gỉ ăn mòn khi tiếp xúc với không khí ẩm.', isCorrect: false },
          { subId: 'b', text: 'Dung dịch là một hỗn hợp đồng nhất giữa chất tan và dung môi.', isCorrect: true },
          { subId: 'c', text: 'Sử dụng túi vải thay cho túi nilon dùng một lần giúp giảm thiểu rác thải nhựa.', isCorrect: true },
          { subId: 'd', text: 'Có thể tách dầu ăn hòa tan trong nước bằng giấy lọc thông thường.', isCorrect: false }
        ]
      },
      {
        id: 'c65_18',
        type: 'short_answer',
        question: 'Hòa tan hoàn toàn 20 g muối ăn vào 80 g nước tinh khiết. Khối lượng dung dịch nước muối thu được là bao nhiêu gam?',
        acceptableAnswers: ['100', '100g', '100 g'],
        unit: 'gam',
        explanation: 'Khối lượng dung dịch = m_chất tan + m_dung môi = 20 + 80 = 100 g.'
      }
    ]
  },

  // ================= ĐỀ 6 - KHỐI 6 =================
  {
    id: 'exam-bio-6-06',
    title: 'Đề 6 - Sinh học 6: Từ tế bào đến cơ thể, Đa dạng thế giới sinh vật',
    subject: 'biology',
    grade: 6,
    testNumber: 'TX6',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-06',
    questions: [
      { id: 'b66_1', type: 'multiple_choice', question: 'Thứ tự cấp độ tổ chức cơ thể đa bào từ thấp đến cao là:', options: ['Tế bào → Mô → Cơ quan → Hệ cơ quan → Cơ thể', 'Mô → Tế bào → Cơ quan → Cơ thể', 'Tế bào → Cơ quan → Mô → Hệ cơ quan', 'Cơ quan → Mô → Tế bào → Cơ thể'], correctAnswer: 0, explanation: 'Tế bào -> Mô -> Cơ quan -> Hệ cơ quan -> Cơ thể.' },
      { id: 'b66_2', type: 'multiple_choice', question: 'Hệ cơ quan nào ở người có chức năng vận chuyển chất dinh dưỡng và khí oxy đến các tế bào?', options: ['Hệ tuần hoàn', 'Hệ hô hấp', 'Hệ tiêu hóa', 'Hệ thần kinh'], correctAnswer: 0, explanation: 'Tim và mạch máu vận chuyển máu đi khắp cơ thể.' },
      { id: 'b66_3', type: 'multiple_choice', question: 'Dạ dày, gan, ruột non ở người thuộc hệ cơ quan nào?', options: ['Hệ tiêu hóa', 'Hệ bài tiết', 'Hệ tuần hoàn', 'Hệ sinh dục'], correctAnswer: 0, explanation: 'Các cơ quan này tiêu hóa và hấp thu thức ăn.' },
      { id: 'b66_4', type: 'multiple_choice', question: 'Sinh vật nào dưới đây thuộc nhóm động vật không xương sống?', options: ['Con giun đất / Con mực', 'Con cá chép', 'Con chim bồ câu', 'Con ếch đồng'], correctAnswer: 0, explanation: 'Giun đất và mực thân mềm không có cột sống xương.' },
      { id: 'b66_5', type: 'multiple_choice', question: 'Nhóm thực vật nào đã có mạch dẫn nhưng sinh sản bằng bào tử chưa có hạt?', options: ['Dương xỉ', 'Rêu', 'Hạt trần (thông)', 'Hạt kín (lúa)'], correctAnswer: 0, explanation: 'Dương xỉ có mạch dẫn, sinh sản bằng bào tử.' },
      { id: 'b66_6', type: 'multiple_choice', question: 'Cây thông thuộc nhóm thực vật nào sau đây?', options: ['Thực vật Hạt trần', 'Thực vật Hạt kín', 'Rêu', 'Dương xỉ'], correctAnswer: 0, explanation: 'Thông có nón, hạt nằm lộ trên lá noãn hở (hạt trần).' },
      { id: 'b66_7', type: 'multiple_choice', question: 'Thực vật có hoa, hạt được bảo vệ bên trong quả thuộc ngành nào?', options: ['Hạt kín', 'Hạt trần', 'Rêu', 'Tảo'], correctAnswer: 0, explanation: 'Hạt kín có hoa, quả bao bọc hạt, tiến hóa nhất.' },
      { id: 'b66_8', type: 'multiple_choice', question: 'Đặc điểm nào giúp phân biệt nấm với thực vật?', options: ['Nấm không có chất diệp lục, sống dị dưỡng hoại sinh', 'Nấm có khả năng quang hợp', 'Nấm có hoa và quả', 'Tế bào nấm không có màng tế bào'], correctAnswer: 0, explanation: 'Nấm không quang hợp, hấp thụ chất hữu cơ sẵn có.' },
      { id: 'b66_9', type: 'multiple_choice', question: 'Loài nấm nào sau đây là nấm độc cần tránh hái ăn?', options: ['Nấm tán trắng / Nấm độc đỏ', 'Nấm hương', 'Nấm rơm', 'Nấm mộc nhĩ'], correctAnswer: 0, explanation: 'Nấm tán trắng chứa độc tố amatoxin cực độc.' },
      { id: 'b66_10', type: 'multiple_choice', question: 'Côn trùng (Chân khớp) có đặc điểm nhận dạng nổi bật là:', options: ['Cơ thể có 3 phần, có 3 đôi chân (6 chân) và thường có cánh', 'Có cột sống bằng xương', 'Chỉ sống dưới đáy biển sâu', 'Cơ thể mềm có vỏ đá vôi'], correctAnswer: 0, explanation: 'Côn trùng có đầu, ngực, bụng và 3 đôi chân.' },
      { id: 'b66_11', type: 'multiple_choice', question: 'Lớp động vật có xương sống nào đẻ trứng dưới nước, biến thái qua giai đoạn nòng nọc?', options: ['Lưỡng cư (ếch nhái)', 'Bò sát (thằn lằn)', 'Chim', 'Thú'], correctAnswer: 0, explanation: 'Ếch thuộc lớp Lưỡng cư biến thái hoàn toàn.' },
      { id: 'b66_12', type: 'multiple_choice', question: 'Cá heo, cá voi thuộc lớp động vật nào?', options: ['Lớp Thú (động vật có vú, đẻ con và nuôi con bằng sữa)', 'Lớp Cá', 'Lớp Bò sát', 'Lớp Lưỡng cư'], correctAnswer: 0, explanation: 'Cá voi đẻ con, thở bằng phổi, nuôi con bằng sữa mẹ.' },
      { id: 'b66_13', type: 'multiple_choice', question: 'Khóa lưỡng phân là công cụ dùng để làm gì trong sinh học?', options: ['Phân loại và nhận diện các loài sinh vật dựa trên cặp đặc điểm đối lập', 'Đo kích thước tế bào', 'Tính toán tốc độ phân chia tế bào', 'Nuôi cấy vi sinh vật'], correctAnswer: 0, explanation: 'Khóa lưỡng phân chia đôi sinh vật dựa trên đặc điểm đối lập.' },
      { id: 'b66_14', type: 'multiple_choice', question: 'Vai trò quan trọng nhất của rừng đối với môi trường khí hậu Trái Đất là:', options: ['Lá phổi xanh điều hòa khí hậu, giữ đất và chống xói mòn lũ lụt', 'Cung cấp gỗ để đốt củi', 'Mở rộng diện tích xây nhà', 'Thu hút thú hoang dã'], correctAnswer: 0, explanation: 'Rừng quang hợp nhả O2, hấp thụ CO2 và điều tiết nước nguồn.' },
      { id: 'b66_15', type: 'multiple_choice', question: 'Bệnh nào sau đây ở người do virus gây ra?', options: ['Cảm cúm / Sốt xuất huyết / COVID-19', 'Bệnh kiết lị do trùng amip', 'Bệnh lang ben do nấm', 'Bệnh giun đũa'], correctAnswer: 0, explanation: 'Cúm, COVID-19, sốt xuất huyết là bệnh do virus.' },
      { id: 'b66_16', type: 'multiple_choice', question: 'Biện pháp nào phòng tránh bệnh truyền nhiễm do vi khuẩn hiệu quả nhất?', options: ['Rửa tay bằng xà phòng, ăn chín uống sôi và giữ vệ sinh môi trường', 'Uống nhiều nước đá', 'Không tiêm vaccine', 'Ở trong phòng tối không mở cửa'], correctAnswer: 0, explanation: 'Giữ vệ sinh ăn uống và rửa tay diệt trừ vi khuẩn gây bệnh.' },
      {
        id: 'b66_17',
        type: 'true_false',
        question: 'Về đa dạng thế giới sống và tổ chức cơ thể, nhận định Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Rêu là thực vật đã có mạch dẫn hoàn thiện và rễ cọc đâm sâu.', isCorrect: false },
          { subId: 'b', text: 'Cá voi là động vật thuộc lớp Thú, đẻ con và nuôi con bằng sữa.', isCorrect: true },
          { subId: 'c', text: 'Cây lúa nước là thực vật thuộc ngành Hạt kín.', isCorrect: true },
          { subId: 'd', text: 'Nấm có khả năng tự dưỡng quang hợp giống như cây xanh.', isCorrect: false }
        ]
      },
      {
        id: 'b66_18',
        type: 'short_answer',
        question: 'Một con côn trùng trưởng thành (như châu chấu, ong, bướm) có bao nhiêu cái chân (đôi chân)?',
        acceptableAnswers: ['6', '6 chân', '3 đôi', '6 cái chân'],
        unit: 'chân',
        explanation: 'Côn trùng có đúng 3 đôi chân (6 chân).'
      }
    ]
  },

  // ================= ĐỀ 7 - KHỐI 6 =================
  {
    id: 'exam-phy-6-07',
    title: 'Đề 7 - Vật lí 6: Năng lượng, Các dạng năng lượng và Sự bảo toàn năng lượng',
    subject: 'physics',
    grade: 6,
    testNumber: 'TX7',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-07',
    questions: [
      { id: 'p67_1', type: 'multiple_choice', question: 'Đơn vị đo năng lượng trong hệ SI là gì?', options: ['Joule (J)', 'Newton (N)', 'Watt (W)', 'Volt (V)'], correctAnswer: 0, explanation: 'Năng lượng và công đo bằng Joule (J).' },
      { id: 'p67_2', type: 'multiple_choice', question: 'Vật ở trên cao so với mặt đất sở hữu dạng năng lượng nào?', options: ['Thế năng hấp dẫn', 'Động năng', 'Nhiệt năng', 'Hóa năng'], correctAnswer: 0, explanation: 'Vật ở trên cao có thế năng hấp dẫn.' },
      { id: 'p67_3', type: 'multiple_choice', question: 'Vật đang chuyển động với tốc độ v sở hữu dạng năng lượng nào?', options: ['Động năng', 'Thế năng đàn hồi', 'Hóa năng', 'Quang năng'], correctAnswer: 0, explanation: 'Chuyển động gắn liền với động năng.' },
      { id: 'p67_4', type: 'multiple_choice', question: 'Năng lượng lưu trữ trong thức ăn, pin, acquy, que diêm được gọi là:', options: ['Hóa năng', 'Cơ năng', 'Nhiệt năng', 'Điện năng'], correctAnswer: 0, explanation: 'Năng lượng liên kết hóa học là hóa năng.' },
      { id: 'p67_5', type: 'multiple_choice', question: 'Khi quạt điện hoạt động, điện năng chủ yếu chuyển hóa thành dạng năng lượng có ích nào?', options: ['Cơ năng (làm cánh quạt quay tạo gió)', 'Nhiệt năng làm nóng động cơ', 'Quang năng phát sáng', 'Hóa năng'], correctAnswer: 0, explanation: 'Mục đích chính của quạt là quay cánh tạo gió (cơ năng).' },
      { id: 'p67_6', type: 'multiple_choice', question: 'Phần năng lượng hao phí khi bóng đèn dây tóc hoạt động là dạng năng lượng nào?', options: ['Nhiệt năng (làm bóng đèn nóng lên)', 'Quang năng chiếu sáng', 'Cơ năng', 'Âm thanh'], correctAnswer: 0, explanation: 'Nhiệt tỏa ra từ đèn dây tóc là hao phí.' },
      { id: 'p67_7', type: 'multiple_choice', question: 'Định luật bảo toàn năng lượng khẳng định:', options: ['Năng lượng không tự sinh ra và cũng không tự mất đi, chỉ chuyển từ dạng này sang dạng khác hoặc truyền từ vật này sang vật khác', 'Năng lượng luôn tự mất dần đi trong vũ trụ', 'Năng lượng có thể được tạo ra từ hư vô', 'Năng lượng của một vật luôn cố định không đổi'], correctAnswer: 0, explanation: 'Năng lượng bảo toàn toàn phần.' },
      { id: 'p67_8', type: 'multiple_choice', question: 'Nguồn năng lượng nào sau đây gây phát thải khí nhà kính lớn nhất khi khai thác sử dụng?', options: ['Nhiên liệu hóa thạch (than đá, dầu mỏ)', 'Năng lượng gió', 'Năng lượng mặt trời', 'Năng lượng thủy triều'], correctAnswer: 0, explanation: 'Đốt than, dầu thải ra lượng lớn khí CO2.' },
      { id: 'p67_9', type: 'multiple_choice', question: 'Tấm pin quang điện (pin mặt trời) có chức năng chuyển đổi trực tiếp:', options: ['Quang năng thành điện năng', 'Nhiệt năng thành cơ năng', 'Hóa năng thành điện năng', 'Điện năng thành quang năng'], correctAnswer: 0, explanation: 'Pin mặt trời biến đổi ánh sáng (quang năng) thành dòng điện.' },
      { id: 'p67_10', type: 'multiple_choice', question: 'Khi thả rơi một quả bóng từ trên cao xuống, trong quá trình rơi:', options: ['Thế năng giảm dần, động năng tăng dần', 'Thế năng tăng dần, động năng giảm dần', 'Cả hai cùng tăng', 'Cả hai cùng giảm'], correctAnswer: 0, explanation: 'Độ cao giảm làm thế năng giảm, vận tốc tăng làm động năng tăng.' },
      { id: 'p67_11', type: 'multiple_choice', question: 'Hành động nào sau đây thể hiện việc tiết kiệm điện năng trong gia đình?', options: ['Tắt đèn và các thiết bị điện khi ra khỏi phòng', 'Bật bình nóng lạnh cả ngày lẫn đêm', 'Mở cửa sổ khi đang bật điều hòa nhiệt độ', 'Để tivi chạy liên tục dù không có người xem'], correctAnswer: 0, explanation: 'Tắt thiết bị khi không dùng là nguyên tắc tiết kiệm điện cơ bản.' },
      { id: 'p67_12', type: 'multiple_choice', question: 'Năng lượng gió làm quay các cánh turbine gió để sản xuất điện là sự chuyển hóa từ:', options: ['Động năng của gió thành điện năng', 'Thế năng thành nhiệt năng', 'Hóa năng thành quang năng', 'Điện năng thành cơ năng'], correctAnswer: 0, explanation: 'Gió thổi mang động năng làm quay turbine máy phát điện.' },
      { id: 'p67_13', type: 'multiple_choice', question: '1 kilôjoule (1 kJ) tương đương với bao nhiêu Joule (J)?', options: ['1000 J', '100 J', '10 J', '10000 J'], correctAnswer: 0, explanation: '1 kJ = 1000 J.' },
      { id: 'p67_14', type: 'multiple_choice', question: 'Khi cọ xát hai bàn tay vào nhau vào mùa đông, bàn tay ấm lên là do:', options: ['Cơ năng chuyển hóa thành nhiệt năng', 'Hóa năng biến thành điện năng', 'Thế năng biến thành quang năng', 'Nhiệt độ ngoài trời truyền vào'], correctAnswer: 0, explanation: 'Công cơ học cọ xát tạo ra nhiệt do ma sát.' },
      { id: 'p67_15', type: 'multiple_choice', question: 'Năng lượng tái tạo là năng lượng:', options: ['Có sẵn trong tự nhiên, liên tục được tái sinh và không bị cạn kiệt', 'Chỉ dùng được một lần rồi mất vĩnh viễn', 'Tạo ra từ phản ứng hạt nhân', 'Được khai thác từ mỏ quặng sâu trong lòng đất'], correctAnswer: 0, explanation: 'Năng lượng gió, mặt trời, thủy điện tái sinh tự nhiên.' },
      { id: 'p67_16', type: 'multiple_choice', question: 'Bếp từ khi đun nấu có hiệu suất cao hơn bếp gas vì:', options: ['Nhiệt lượng hao phí tỏa ra môi trường xung quanh ít hơn', 'Bếp từ không dùng điện', 'Bếp gas nóng nhanh hơn', 'Khí gas không cháy hết'], correctAnswer: 0, explanation: 'Bếp từ làm nóng trực tiếp đáy nồi nên ít thất thoát nhiệt.' },
      {
        id: 'p67_17',
        type: 'true_false',
        question: 'Về năng lượng và bảo toàn năng lượng, nhận định tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Năng lượng mặt trời là nguồn năng lượng tái tạo sạch.', isCorrect: true },
          { subId: 'b', text: 'Trong mọi quá trình biến đổi năng lượng, không bao giờ có năng lượng hao phí.', isCorrect: false },
          { subId: 'c', text: 'Động cơ xe máy chuyển hóa hóa năng của xăng thành cơ năng chuyển động và nhiệt năng hao phí.', isCorrect: true },
          { subId: 'd', text: 'Năng lượng có thể tự sinh ra từ con số không nếu có máy móc hiện đại.', isCorrect: false }
        ]
      },
      {
        id: 'p67_18',
        type: 'short_answer',
        question: 'Một bóng đèn LED tiêu thụ 500 J năng lượng điện, trong đó có 400 J biến đổi thành năng lượng ánh sáng có ích. Phần năng lượng nhiệt hao phí bằng bao nhiêu Joule?',
        acceptableAnswers: ['100', '100J', '100 J'],
        unit: 'J',
        explanation: 'E_hao phí = 500 - 400 = 100 J.'
      }
    ]
  },

  // ================= ĐỀ 8 - KHỐI 6 =================
  {
    id: 'exam-bio-6-08',
    title: 'Đề 8 - Sinh học 6: Đa dạng sinh học, Thực vật, Động vật và Bảo vệ môi trường',
    subject: 'biology',
    grade: 6,
    testNumber: 'TX8',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-08',
    questions: [
      { id: 'b68_1', type: 'multiple_choice', question: 'Đa dạng sinh học biểu thị sự phong phú về:', options: ['Số lượng loài, nguồn gen và các hệ sinh thái', 'Chỉ riêng số lượng động vật nuôi', 'Số lượng cây gỗ trồng', 'Các loại khoáng sản trong đất'], correctAnswer: 0, explanation: 'Đa dạng sinh học gồm đa dạng loài, di truyền và hệ sinh thái.' },
      { id: 'b68_2', type: 'multiple_choice', question: 'Hệ sinh thái nào sau đây có độ đa dạng sinh học cao nhất trên cạn?', options: ['Rừng mưa nhiệt đới', 'Hoang mạc cát', 'Đồng rêu hàn đới', 'Đồng cỏ khô hạn'], correctAnswer: 0, explanation: 'Rừng mưa nhiệt đới có điều kiện nhiệt ẩm lý tưởng cho nhiều loài sinh sống.' },
      { id: 'b68_3', type: 'multiple_choice', question: 'Hành động nào dưới đây đe dọa trực tiếp đến sự đa dạng sinh học?', options: ['Săn bắt, buôn bán động vật hoang dã trái phép', 'Trồng rừng ngập mặn ven biển', 'Xây dựng vườn quốc gia bảo tồn', 'Ủ phân hữu cơ vi sinh'], correctAnswer: 0, explanation: 'Săn bắt tận diệt làm suy giảm số lượng cá thể loài hoang dã.' },
      { id: 'b68_4', type: 'multiple_choice', question: 'Sách Đỏ Việt Nam và thế giới được lập ra nhằm mục đích gì?', options: ['Công bố danh sách các loài sinh vật quý hiếm có nguy cơ tuyệt chủng để bảo vệ', 'Ghi chép các loại thực phẩm ngon', 'Thống kê sản lượng đánh bắt thủy sản', 'Ghi danh các thợ săn giỏi'], correctAnswer: 0, explanation: 'Sách Đỏ là căn cứ pháp lý bảo vệ các loài nguy cấp.' },
      { id: 'b68_5', type: 'multiple_choice', question: 'Thực vật có vai trò gì đối với nguồn nước ngầm và đất đai?', options: ['Tán lá cản nước mưa, rễ cây giữ đất chống xói mòn và tăng thấm nước ngầm', 'Làm đất khô cằn nhanh chóng', 'Gây ngập úng quanh năm', 'Làm ô nhiễm mạch nước ngầm'], correctAnswer: 0, explanation: 'Rừng phòng hộ đầu nguồn giữ đất và nguồn nước ngầm.' },
      { id: 'b68_6', type: 'multiple_choice', question: 'Hiện tượng hiệu ứng nhà kính tăng lên chủ yếu do sự tích tụ khí nào trong khí quyển?', options: ['Carbon dioxide (CO2)', 'Oxygen (O2)', 'Nitrogen (N2)', 'Argon (Ar)'], correctAnswer: 0, explanation: 'Khí CO2 từ đốt nhiên liệu hóa thạch hấp thụ bức xạ nhiệt.' },
      { id: 'b68_7', type: 'multiple_choice', question: 'Loài động vật đặc hữu nguy cấp nào của Việt Nam sinh sống tại bán đảo Sơn Trà?', options: ['Voọc chà vá chân nâu', 'Gấu Bắc cực', 'Hươu cao cổ', 'Chim cánh cụt'], correctAnswer: 0, explanation: 'Voọc chà vá chân nâu là linh trưởng quý hiếm đặc trưng của miền Trung.' },
      { id: 'b68_8', type: 'multiple_choice', question: 'Biện pháp nào sau đây giúp bảo vệ đa dạng sinh học hiệu quả nhất?', options: ['Thành lập các khu bảo tồn thiên nhiên và vườn quốc gia', 'Khai hoang rừng tự nhiên để trồng cao su', 'Sử dụng thuốc trừ sâu hóa học bừa bãi', 'Du nhập ồ ạt các loài sinh vật ngoại lai'], correctAnswer: 0, explanation: 'Bảo tồn nguyên vị tại vườn quốc gia bảo vệ sinh cảnh tự nhiên.' },
      { id: 'b68_9', type: 'multiple_choice', question: 'Sinh vật ngoại lai xâm hại gây hậu quả nghiêm trọng nào?', options: ['Cạnh tranh thức ăn, nơi ở và tiêu diệt các loài bản địa', 'Làm đất đai màu mỡ hơn', 'Tăng độ đa dạng sinh học bền vững', 'Bảo vệ nguồn nước'], correctAnswer: 0, explanation: 'Ốc bươu vàng, rùa tai đỏ phát triển mạnh phá hoại mùa màng và loài bản địa.' },
      { id: 'b68_10', type: 'multiple_choice', question: 'Khí oxy trong khí quyển Trái Đất được tái tạo chủ yếu nhờ quá trình nào?', options: ['Quang hợp của cây xanh và thực vật phù du dưới đại dương', 'Hô hấp của động vật', 'Cháy rừng tự nhiên', 'Núi lửa phun trào'], correctAnswer: 0, explanation: 'Quang hợp nhả ra khí O2 duy trì sự sống.' },
      { id: 'b68_11', type: 'multiple_choice', question: 'Quy tắc 3R trong bảo vệ môi trường viết tắt của:', options: ['Reduce (Giảm thiểu) - Reuse (Tái sử dụng) - Recycle (Tái chế)', 'Run - Read - Relax', 'Return - Repair - Remove', 'Real - Rapid - Robust'], correctAnswer: 0, explanation: 'Reduce, Reuse, Recycle là nguyên tắc giảm rác thải.' },
      { id: 'b68_12', type: 'multiple_choice', question: 'Ô nhiễm môi trường nước thường dẫn tới hiện tượng nào đối với sinh vật thủy sinh?', options: ['Cá tôm chết hàng loạt do thiếu oxy hoặc nhiễm độc', 'Cá phát triển nhanh đột biến', 'Nước sông trở nên trong lành hơn', 'Rong rêu tự động biến mất'], correctAnswer: 0, explanation: 'Nước ô nhiễm độc hại làm cá chết hàng loạt.' },
      { id: 'b68_13', type: 'multiple_choice', question: 'Rác thải hữu cơ từ nhà bếp (vỏ rau, cuống quả, thức ăn thừa) nên được xử lý bằng cách:', options: ['Ủ thành phân compost bón cho cây trồng', 'Đốt cháy bừa bãi', 'Vứt xuống cống rãnh thoát nước', 'Chôn cùng pin điện tử'], correctAnswer: 0, explanation: 'Ủ compost tạo phân bón hữu cơ tốt cho đất.' },
      { id: 'b68_14', type: 'multiple_choice', question: 'Côn trùng như ong bướm có vai trò sinh thái to lớn nào đối với thực vật?', options: ['Thụ phấn cho hoa giúp tạo quả và duy trì nòi giống thực vật', 'Tiêu diệt toàn bộ hoa', 'Hút hết nhựa làm cây chết', 'Phá hủy rễ cây'], correctAnswer: 0, explanation: 'Ong bướm giúp thụ phấn cho hoa tạo quả và hạt giống.' },
      { id: 'b68_15', type: 'multiple_choice', question: 'Trồng rừng phòng hộ đầu nguồn ở Tây Nguyên và các tỉnh miền núi có tác dụng phòng chống thiên tai nào?', options: ['Lũ quét, sạt lở đất và xói mòn', 'Bão tuyết', 'Sóng thần ven biển', 'Động đất ngầm'], correctAnswer: 0, explanation: 'Rễ cây giữ kết cấu đất, ngăn lũ quét và lở đất mùa mưa.' },
      { id: 'b68_16', type: 'multiple_choice', question: 'Thế nào là tiêu dùng xanh?', options: ['Lựa chọn các sản phẩm thân thiện với môi trường, hạn chế đồ nhựa dùng một lần', 'Chỉ mua đồ có màu xanh lá cây', 'Mua thật nhiều đồ dùng dù không cần thiết', 'Sử dụng thật nhiều bao bì nilon'], correctAnswer: 0, explanation: 'Tiêu dùng xanh ưu tiên sản phẩm bền vững, thân thiện với môi trường.' },
      {
        id: 'b68_17',
        type: 'true_false',
        question: 'Về đa dạng sinh học và môi trường, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Bảo vệ rừng là bảo vệ môi trường sống của muôn loài và nguồn nước ngầm quý giá.', isCorrect: true },
          { subId: 'b', text: 'Thả các loài rùa tai đỏ, ốc bươu vàng ra tự nhiên giúp tăng tính phong phú bản địa an toàn.', isCorrect: false },
          { subId: 'c', text: 'Đốt rơm rạ sau thu hoạch không gây ô nhiễm khói bụi hay suy thoái vi sinh vật đất.', isCorrect: false },
          { subId: 'd', text: 'Mỗi cá nhân có thể góp phần bảo vệ môi trường bằng cách phân loại rác thải tại nguồn.', isCorrect: true }
        ]
      },
      {
        id: 'b68_18',
        type: 'short_answer',
        question: 'Quá trình quang hợp của thực vật hấp thụ khí CO2 và nhả ra khí gì để duy trì sự sống của sinh vật?',
        acceptableAnswers: ['Oxygen', 'oxy', 'khí oxy', 'khi oxy', 'O2', 'khí oxygen'],
        unit: 'khí',
        explanation: 'Quang hợp nhả ra khí oxygen (O2).'
      }
    ]
  }
];
