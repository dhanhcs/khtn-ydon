import { Exam } from '../types';

export const examsGrade7: Exam[] = [
  // ================= ĐỀ 1 - KHỐI 7 =================
  {
    id: 'exam-phy-7-01',
    title: 'Đề 1 - Vật lí 7: Tốc độ chuyển động và Đồ thị quãng đường - thời gian',
    subject: 'physics',
    grade: 7,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-01',
    questions: [
      { id: 'p7_1', type: 'multiple_choice', question: 'Tốc độ chuyển động của một vật cho biết điều gì?', options: ['Mức độ nhanh hay chậm của chuyển động', 'Quãng đường vật đã đi được dài bao nhiêu', 'Vật chuyển động theo hướng nào', 'Khối lượng của vật chuyển động'], correctAnswer: 0, explanation: 'Tốc độ đặc trưng cho mức độ nhanh hay chậm của chuyển động.' },
      { id: 'p7_2', type: 'multiple_choice', question: 'Công thức tính tốc độ chuyển động là:', options: ['v = s / t', 'v = s . t', 'v = t / s', 'v = s + t'], correctAnswer: 0, explanation: 'v = s / t, trong đó s là quãng đường và t là thời gian.' },
      { id: 'p7_3', type: 'multiple_choice', question: 'Đơn vị đo tốc độ hợp pháp trong hệ đo lường SI là:', options: ['Mét trên giây (m/s)', 'Kilômét trên giờ (km/h)', 'Centimét trên giây (cm/s)', 'Dặm trên giờ (mph)'], correctAnswer: 0, explanation: 'Hệ SI quy định đơn vị chuẩn của tốc độ là m/s.' },
      { id: 'p7_4', type: 'multiple_choice', question: 'Tốc độ 36 km/h tương đương với bao nhiêu m/s?', options: ['10 m/s', '15 m/s', '20 m/s', '5 m/s'], correctAnswer: 0, explanation: '36 km/h = 36 / 3.6 = 10 m/s.' },
      { id: 'p7_5', type: 'multiple_choice', question: 'Dụng cụ gắn trên xe máy, ô tô dùng để đo trực tiếp tốc độ tức thời là:', options: ['Tốc kế (đồng hồ tốc độ)', 'Lực kế', 'Nhiệt kế', 'Đồng hồ bấm giây'], correctAnswer: 0, explanation: 'Tốc kế đo trực tiếp tốc độ tức thời của phương tiện.' },
      { id: 'p7_6', type: 'multiple_choice', question: 'Trên đồ thị quãng đường - thời gian (s - t), đoạn đồ thị nằm ngang song song trục thời gian biểu thị vật:', options: ['Đang đứng yên', 'Đang chuyển động đều', 'Đang tăng tốc nhanh dần', 'Đang chuyển động quay'], correctAnswer: 0, explanation: 's không thay đổi theo thời gian nghĩa là vật đứng yên.' },
      { id: 'p7_7', type: 'multiple_choice', question: 'Một người đi bộ với tốc độ 1.5 m/s trong thời gian 20 giây. Quãng đường người đó đi được là:', options: ['30 m', '15 m', '20 m', '45 m'], correctAnswer: 0, explanation: 's = v * t = 1.5 * 20 = 30 m.' },
      { id: 'p7_8', type: 'multiple_choice', question: 'Thiết bị bắn tốc độ mà cảnh sát giao thông sử dụng hoạt động dựa trên nguyên lí nào?', options: ['Phát và thu sóng vô tuyến hoặc laser phản xạ từ xe', 'Đo nhiệt độ bánh xe', 'Chụp ảnh màu thông thường', 'Đo tiếng ồn của động cơ xe'], correctAnswer: 0, explanation: 'Máy bắn tốc độ dùng sóng vô tuyến / laser phản xạ để tính tốc độ.' },
      { id: 'p7_9', type: 'multiple_choice', question: 'Tại sao người điều khiển phương tiện tham gia giao thông phải tuân thủ biển báo tốc độ giới hạn?', options: ['Để đảm bảo an toàn, kịp thời xử lí tình huống nguy hiểm bất ngờ', 'Để tiết kiệm xăng dầu tối đa', 'Để xe không bị mòn lốp', 'Để tránh cảnh sát kiểm tra'], correctAnswer: 0, explanation: 'Tốc độ phù hợp giúp có đủ khoảng cách và thời gian dừng xe an toàn.' },
      { id: 'p7_10', type: 'multiple_choice', question: 'Quy tắc "3 giây" khi lái xe trên đường cao tốc giúp người lái xe điều chỉnh điều gì?', options: ['Khoảng cách an toàn tối thiểu với xe đi phía trước', 'Thời gian bật đèn xi nhan', 'Thời gian đạp chân phanh', 'Thời gian nghỉ ngơi'], correctAnswer: 0, explanation: 'Quy tắc 3 giây giữ khoảng cách an toàn với xe chạy trước.' },
      { id: 'p7_11', type: 'multiple_choice', question: 'Một ô tô chạy từ Pleiku đến Đak Pơ dài 60 km hết 1.5 giờ. Tốc độ trung bình của ô tô là:', options: ['40 km/h', '45 km/h', '50 km/h', '35 km/h'], correctAnswer: 0, explanation: 'v = s / t = 60 / 1.5 = 40 km/h.' },
      { id: 'p7_12', type: 'multiple_choice', question: 'Trên đồ thị quãng đường - thời gian, đường dốc càng đứng chứng tỏ:', options: ['Vật chuyển động với tốc độ càng lớn', 'Vật chuyển động càng chậm', 'Quãng đường đi được càng ngắn', 'Vật sắp dừng lại'], correctAnswer: 0, explanation: 'Độ dốc của đồ thị s - t biểu thị tốc độ: dốc càng lớn thì v càng nhanh.' },
      { id: 'p7_13', type: 'multiple_choice', question: 'Khi trời mưa đường trơn ướt, khoảng cách an toàn giữa hai xe cùng chạy phải:', options: ['Tăng lên so với khi đường khô ráo', 'Giảm đi', 'Giữ nguyên không đổi', 'Không cần quan tâm'], correctAnswer: 0, explanation: 'Đường trơn làm giảm ma sát bám, quãng đường phanh dài hơn nên phải tăng khoảng cách an toàn.' },
      { id: 'p7_14', type: 'multiple_choice', question: 'Một đoàn tàu hỏa chuyển động thẳng đều với tốc độ 20 m/s trong thời gian 1 phút (60s). Quãng đường tàu chạy được là:', options: ['1200 m', '600 m', '120 m', '2000 m'], correctAnswer: 0, explanation: 's = 20 * 60 = 1200 m.' },
      { id: 'p7_15', type: 'multiple_choice', question: 'Chuyển động nào sau đây có thể coi là chuyển động có tốc độ hầu như không đổi?', options: ['Chuyển động của đầu kim đồng hồ khi pin còn tốt', 'Chuyển động của xe bus đón trả khách', 'Chuyển động của hòn đá rơi tự do', 'Chuyển động của chiếc lá rơi nghiêng'], correctAnswer: 0, explanation: 'Kim đồng hồ quay đều đặn với tốc độ không đổi.' },
      { id: 'p7_16', type: 'multiple_choice', question: 'Người chạy bộ đạt tốc độ 5 m/s. Đổi tốc độ này ra đơn vị km/h là:', options: ['18 km/h', '15 km/h', '20 km/h', '10 km/h'], correctAnswer: 0, explanation: '5 * 3.6 = 18 km/h.' },
      {
        id: 'p7_17',
        type: 'true_false',
        question: 'Về tốc độ và an toàn giao thông, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: '1 m/s bằng 3.6 km/h.', isCorrect: true },
          { subId: 'b', text: 'Trên đồ thị s - t, đường nằm ngang thể hiện vật đang chuyển động thẳng đều rất nhanh.', isCorrect: false },
          { subId: 'c', text: 'Khoảng cách an toàn giữa các xe cần được tăng lên khi thời tiết có mưa gió sương mù.', isCorrect: true },
          { subId: 'd', text: 'Tốc kế gắn trên xe hiển thị tốc độ trung bình của toàn bộ chuyến hành trình từ đầu đến cuối.', isCorrect: false }
        ]
      },
      {
        id: 'p7_18',
        type: 'short_answer',
        question: 'Một người đi xe đạp với tốc độ không đổi 12 km/h. Sau 2.5 giờ, người đó đi được quãng đường bao nhiêu kilômét (km)?',
        acceptableAnswers: ['30', '30km', '30 km'],
        unit: 'km',
        explanation: 's = v * t = 12 * 2.5 = 30 km.'
      }
    ]
  },

  // ================= ĐỀ 2 - KHỐI 7 =================
  {
    id: 'exam-chem-7-02',
    title: 'Đề 2 - Hóa học 7: Nguyên tử, Nguyên tố và Bảng tuần hoàn các nguyên tố hóa học',
    subject: 'chemistry',
    grade: 7,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-02',
    questions: [
      { id: 'c7_1', type: 'multiple_choice', question: 'Mô hình nguyên tử Rutherford - Bohr ví nguyên tử giống như hệ thống nào?', options: ['Hệ Mặt Trời thu nhỏ', 'Bánh bông lan nhân nho', 'Một khối cầu đặc rỗng', 'Các lớp sóng biển'], correctAnswer: 0, explanation: 'Các electron quay quanh hạt nhân như các hành tinh quay quanh Mặt Trời.' },
      { id: 'c7_2', type: 'multiple_choice', question: 'Hạt nhân nguyên tử được cấu tạo bởi những loại hạt nào?', options: ['Proton (p) và Neutron (n)', 'Chỉ có electron (e)', 'Proton (p) và electron (e)', 'Neutron (n) và electron (e)'], correctAnswer: 0, explanation: 'Hạt nhân gồm proton mang điện tích dương và neutron không mang điện.' },
      { id: 'c7_3', type: 'multiple_choice', question: 'Hạt electron mang điện tích gì và chuyển động ở đâu?', options: ['Điện tích âm (-), chuyển động ở lớp vỏ nguyên tử', 'Điện tích dương (+), nằm trong hạt nhân', 'Không mang điện, nằm trong hạt nhân', 'Điện tích âm, nằm bất động'], correctAnswer: 0, explanation: 'Electron mang điện tích -1e ở vỏ nguyên tử.' },
      { id: 'c7_4', type: 'multiple_choice', question: 'Nguyên tử trung hòa về điện vì lý do nào sau đây?', options: ['Số hạt proton luôn bằng số hạt electron (p = e)', 'Số proton bằng số neutron', 'Hạt nhân không mang điện', 'Electron không có điện tích'], correctAnswer: 0, explanation: 'Tổng điện tích dương của proton triệt tiêu điện tích âm của electron vì p = e.' },
      { id: 'c7_5', type: 'multiple_choice', question: 'Khối lượng nguyên tử tập trung chủ yếu ở phần nào?', options: ['Hạt nhân nguyên tử', 'Lớp vỏ electron', 'Phần không gian rỗng giữa các lớp', 'Phân bố đều khắp nguyên tử'], correctAnswer: 0, explanation: 'Khối lượng hạt nhân chiếm hơn 99.9% khối lượng nguyên tử vì khối lượng electron rất nhỏ.' },
      { id: 'c7_6', type: 'multiple_choice', question: 'Đơn vị đo khối lượng nguyên tử chuẩn quốc tế là:', options: ['amu (atomic mass unit)', 'gam (g)', 'kilôgam (kg)', 'lit (L)'], correctAnswer: 0, explanation: '1 amu xấp xỉ bằng khối lượng của 1 proton hoặc 1 neutron.' },
      { id: 'c7_7', type: 'multiple_choice', question: 'Tập hợp các nguyên tử có cùng số hạt proton trong hạt nhân thuộc cùng một:', options: ['Nguyên tố hóa học', 'Hợp chất', 'Phân tử', 'Đơn chất kim loại'], correctAnswer: 0, explanation: 'Nguyên tố hóa học là tập hợp các nguyên tử cùng số proton.' },
      { id: 'c7_8', type: 'multiple_choice', question: 'Kí hiệu hóa học của nguyên tố Sắt (Iron) là:', options: ['Fe', 'Cu', 'Al', 'Zn'], correctAnswer: 0, explanation: 'Kí hiệu hóa học của Sắt là Fe (Ferrum).' },
      { id: 'c7_9', type: 'multiple_choice', question: 'Bảng tuần hoàn các nguyên tố hóa học hiện đại được sắp xếp theo chiều tăng dần của:', options: ['Điện tích hạt nhân (số proton)', 'Khối lượng nguyên tử', 'Số lượng neutron', 'Kích thước nguyên tử'], correctAnswer: 0, explanation: 'Các nguyên tố xếp theo chiều tăng dần của điện tích hạt nhân (số hiệu nguyên tử Z).' },
      { id: 'c7_10', type: 'multiple_choice', question: 'Một chu kì trong Bảng tuần hoàn là tập hợp các nguyên tố có cùng đặc điểm gì?', options: ['Cùng số lớp electron trong nguyên tử', 'Cùng số electron ở lớp ngoài cùng', 'Cùng tính chất hóa học', 'Cùng khối lượng'], correctAnswer: 0, explanation: 'Số thứ tự chu kì bằng số lớp electron.' },
      { id: 'c7_11', type: 'multiple_choice', question: 'Nhóm nguyên tố A trong Bảng tuần hoàn gồm các nguyên tố có cùng:', options: ['Số electron ở lớp ngoài cùng', 'Số lớp electron', 'Số proton', 'Số neutron'], correctAnswer: 0, explanation: 'Các nguyên tố cùng nhóm A có cùng số electron lớp ngoài cùng, tính chất hóa học tương tự.' },
      { id: 'c7_12', type: 'multiple_choice', question: 'Đa số các nguyên tố nằm ở phía bên trái và phía dưới của Bảng tuần hoàn là:', options: ['Kim loại', 'Phi kim', 'Khí hiếm', 'Chất phóng xạ'], correctAnswer: 0, explanation: 'Hơn 80% nguyên tố là kim loại, nằm bên trái và giữa bảng.' },
      { id: 'c7_13', type: 'multiple_choice', question: 'Nhóm VIIIA (nhóm 18) trong Bảng tuần hoàn gồm các nguyên tố đặc biệt nào?', options: ['Khí hiếm (khí trơ)', 'Kim loại kiềm', 'Halogen', 'Kim loại chuyển tiếp'], correctAnswer: 0, explanation: 'Khí hiếm có 8 electron lớp ngoài cùng (trừ He có 2e), cấu hình bền vững.' },
      { id: 'c7_14', type: 'multiple_choice', question: 'Nguyên tố Carbon có số hiệu nguyên tử là 6. Số hạt proton và electron trong nguyên tử Carbon lần lượt là:', options: ['6 proton và 6 electron', '6 proton và 12 electron', '12 proton và 6 electron', '6 proton và 0 electron'], correctAnswer: 0, explanation: 'Z = p = e = 6.' },
      { id: 'c7_15', type: 'multiple_choice', question: 'Kí hiệu hóa học của nguyên tố Vàng (Gold) và Bạc (Silver) lần lượt là:', options: ['Au và Ag', 'Ag và Au', 'Cu và Fe', 'Al và Zn'], correctAnswer: 0, explanation: 'Au (Aurum - Vàng), Ag (Argentum - Bạc).' },
      { id: 'c7_16', type: 'multiple_choice', question: 'Nguyên tử Oxygen có 8 electron. Số electron ở lớp ngoài cùng của Oxygen là:', options: ['6 electron', '8 electron', '2 electron', '4 electron'], correctAnswer: 0, explanation: 'Lớp thứ nhất có tối đa 2 electron, lớp thứ hai còn 8 - 2 = 6 electron.' },
      {
        id: 'c7_17',
        type: 'true_false',
        question: 'Về nguyên tử và Bảng tuần hoàn, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Trong nguyên tử, hạt neutron mang điện tích dương và hạt proton mang điện tích âm.', isCorrect: false },
          { subId: 'b', text: 'Số thứ tự của chu kì bằng số lớp electron của nguyên tử nguyên tố đó.', isCorrect: true },
          { subId: 'c', text: 'Tất cả các nguyên tố trong Bảng tuần hoàn đều là phi kim.', isCorrect: false },
          { subId: 'd', text: 'Nguyên tử Sodium (Na) có 11 proton thì cũng có đúng 11 electron.', isCorrect: true }
        ]
      },
      {
        id: 'c7_18',
        type: 'short_answer',
        question: 'Một nguyên tử có 12 proton, 12 neutron và 12 electron. Khối lượng xấp xỉ của nguyên tử đó tính theo đơn vị amu là bao nhiêu amu?',
        acceptableAnswers: ['24', '24 amu', '24amu'],
        unit: 'amu',
        explanation: 'Khối lượng nguyên tử ≈ m_p + m_n = 12 + 12 = 24 amu.'
      }
    ]
  },

  // ================= ĐỀ 3 - KHỐI 7 =================
  {
    id: 'exam-bio-7-03',
    title: 'Đề 3 - Sinh học 7: Trao đổi chất và chuyển hóa năng lượng ở thực vật, động vật',
    subject: 'biology',
    grade: 7,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-03',
    questions: [
      { id: 'b73_1', type: 'multiple_choice', question: 'Quang hợp là quá trình lá cây sử dụng năng lượng ánh sáng để tổng hợp chất hữu cơ từ:', options: ['Nước và khí carbon dioxide (CO2)', 'Khí oxy và đường', 'Chất khoáng và khí nitrogen', 'Phân bón và đất'], correctAnswer: 0, explanation: 'Nước + CO2 + Ánh sáng mặt trời -> Glucose + O2.' },
      { id: 'b73_2', type: 'multiple_choice', question: 'Bào quan thực hiện chức năng quang hợp ở tế bào thực vật là:', options: ['Lục lạp (chứa chất diệp lục)', 'Ti thể', 'Nhân tế bào', 'Lưới nội chất'], correctAnswer: 0, explanation: 'Diệp lục trong lục lạp hấp thụ năng lượng ánh sáng mặt trời.' },
      { id: 'b73_3', type: 'multiple_choice', question: 'Khí nào được thải ra môi trường trong quá trình quang hợp của cây xanh?', options: ['Oxygen (O2)', 'Carbon dioxide (CO2)', 'Nitrogen (N2)', 'Hơi sulfur'], correctAnswer: 0, explanation: 'Quang hợp nhả ra khí O2 làm trong sạch bầu không khí.' },
      { id: 'b73_4', type: 'multiple_choice', question: 'Hô hấp tế bào là quá trình phân giải chất hữu cơ giải phóng năng lượng dưới dạng nào?', options: ['ATP và nhiệt', 'Ánh sáng và cơ năng', 'Hóa năng và điện năng cao thế', 'Điện tích ion'], correctAnswer: 0, explanation: 'Hô hấp tế bào tạo ATP là đồng tiền năng lượng sinh học cho cơ thể.' },
      { id: 'b73_5', type: 'multiple_choice', question: 'Bào quan được ví như "nhà máy năng lượng" của tế bào thực hiện hô hấp là:', options: ['Ti thể', 'Lục lạp', 'Không bào', 'Bộ máy Golgi'], correctAnswer: 0, explanation: 'Ti thể là nơi diễn ra các giai đoạn chính của hô hấp tế bào.' },
      { id: 'b73_6', type: 'multiple_choice', question: 'Khí khổng ở lá cây mở ra và đóng lại chủ yếu nhờ yếu tố nào?', options: ['Sự trương nước hay mất nước của hai tế bào hạt đậu hình kèm khí khổng', 'Nhiệt độ của rễ cây', 'Gió thổi mạnh hay nhẹ', 'Số lượng gân lá'], correctAnswer: 0, explanation: 'Tế bào hạt đậu no nước căng ra làm mở lỗ khí khổng.' },
      { id: 'b73_7', type: 'multiple_choice', question: 'Mạch gỗ (xylem) trong thân cây có chức năng vận chuyển:', options: ['Nước và muối khoáng hòa tan từ rễ lên thân và lá', 'Chất hữu cơ từ lá xuống rễ', 'Khí oxy đi khắp cơ thể', 'Chất béo dự trữ'], correctAnswer: 0, explanation: 'Mạch gỗ vận chuyển dòng đi lên: nước và khoáng từ đất lên lá.' },
      { id: 'b73_8', type: 'multiple_choice', question: 'Mạch rây (phloem) trong cây vận chuyển dòng chất nào?', options: ['Các chất hữu cơ tổng hợp từ lá đến các cơ quan sử dụng hoặc dự trữ', 'Nước từ rễ hút lên', 'Khí CO2 từ không khí', 'Muối khoáng nguyên chất'], correctAnswer: 0, explanation: 'Mạch rây dẫn dòng chất hữu cơ từ lá đi nuôi rễ, củ, quả.' },
      { id: 'b73_9', type: 'multiple_choice', question: 'Hiện tượng thoát hơi nước qua khí khổng ở lá có ý nghĩa gì đối với cây?', options: ['Tạo lực hút kéo dòng nước và khoáng từ rễ lên, làm mát lá', 'Làm cây mau héo úa', 'Thải bớt chất dinh dưỡng thừa', 'Tăng trọng lượng của cây'], correctAnswer: 0, explanation: 'Thoát hơi nước tạo động lực hút của dòng mạch gỗ và hạ nhiệt cho lá khi nắng nóng.' },
      { id: 'b73_10', type: 'multiple_choice', question: 'Ở động vật và người, thức ăn đi vào cơ thể được biến đổi cơ học và hóa học tại hệ nào?', options: ['Hệ tiêu hóa', 'Hệ bài tiết', 'Hệ thần kinh', 'Hệ hô hấp'], correctAnswer: 0, explanation: 'Hệ tiêu hóa biến đổi thức ăn thành chất dinh dưỡng hấp thụ được.' },
      { id: 'b73_11', type: 'multiple_choice', question: 'Chất dinh dưỡng sau khi hấp thu qua niêm mạc ruột non được vận chuyển đi khắp cơ thể nhờ:', options: ['Hệ tuần hoàn (máu và dịch bạch huyết)', 'Hệ bài tiết nước tiểu', 'Hệ hô hấp', 'Ống tiêu hóa'], correctAnswer: 0, explanation: 'Máu tuần hoàn mang oxy và dinh dưỡng đến từng tế bào.' },
      { id: 'b73_12', type: 'multiple_choice', question: 'Cơ quan hô hấp ở cá thực hiện trao đổi khí với môi trường nước là:', options: ['Mang cá', 'Phổi cá', 'Da cá', 'Túi khí'], correctAnswer: 0, explanation: 'Mang cá có nhiều lá mang giàu mao mạch máu trao đổi khí hòa tan trong nước.' },
      { id: 'b73_13', type: 'multiple_choice', question: 'Cơ quan bài tiết quan trọng nhất giúp lọc máu tạo thành nước tiểu ở người là:', options: ['Thận', 'Bàng quang', 'Gan', 'Phổi'], correctAnswer: 0, explanation: 'Hai quả thận chứa hàng triệu đơn vị nephron lọc chất thải tạo nước tiểu.' },
      { id: 'b73_14', type: 'multiple_choice', question: 'Tại sao khi lao động nặng hoặc chạy nhanh, nhịp thở và nhịp tim của chúng ta đều tăng lên?', options: ['Để cung cấp đủ oxy và đào thải nhanh CO2 cho cơ bắp hoạt động mạnh', 'Do cơ thể bị mất nước hoàn toàn', 'Để làm giảm nhiệt độ môi trường', 'Do phổi bị co hẹp lại'], correctAnswer: 0, explanation: 'Tế bào cơ bắp tiêu thụ nhiều ATP cần nhiều O2 và tạo nhiều CO2.' },
      { id: 'b73_15', type: 'multiple_choice', question: 'Cây trồng bị ngập úng rễ lâu ngày sẽ bị vàng lá và chết là do nguyên nhân nào?', options: ['Đất thiếu oxy khiến lông hút ở rễ bị thối hỏng không hô hấp được', 'Cây hút quá nhiều nước làm vỡ tế bào', 'Nước ngập làm ánh sáng mặt trời tắt', 'Rễ cây bị thừa chất đạm'], correctAnswer: 0, explanation: 'Rễ thiếu oxy không hô hấp được, tế bào lông hút chết làm cây không hút được nước.' },
      { id: 'b73_16', type: 'multiple_choice', question: 'Biện pháp nào giúp bảo quản nông sản hạt (lúa, ngô, đỗ) được lâu mà không bị nảy mầm hay mốc hỏng?', options: ['Phơi hoặc sấy khô hạt để giảm hàm lượng nước ức chế hô hấp', 'Ngâm hạt trong nước ấm', 'Ủ hạt trong túi nilon kín ở nơi nóng ẩm', 'Bón thêm phân đạm vào kho'], correctAnswer: 0, explanation: 'Độ ẩm thấp ức chế hô hấp và vi sinh vật gây hại phát triển.' },
      {
        id: 'b73_17',
        type: 'true_false',
        question: 'Về trao đổi chất và chuyển hóa năng lượng, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Quang hợp chỉ xảy ra vào ban ngày khi có ánh sáng mặt trời hoặc ánh sáng nhân tạo phù hợp.', isCorrect: true },
          { subId: 'b', text: 'Hô hấp tế bào là quá trình chỉ xảy ra ở động vật, thực vật không bao giờ hô hấp.', isCorrect: false },
          { subId: 'c', text: 'Thoát hơi nước qua lá giúp điều hòa nhiệt độ bề mặt lá cây khi trời nắng gắt.', isCorrect: true },
          { subId: 'd', text: 'Mạch rây dẫn nước và muối khoáng từ đất lên cành và lá.', isCorrect: false }
        ]
      },
      {
        id: 'b73_18',
        type: 'short_answer',
        question: 'Nguyên liệu khí đầu vào mà lá cây hấp thụ từ không khí để thực hiện quá trình quang hợp là khí gì?',
        acceptableAnswers: ['Carbon dioxide', 'CO2', 'khí cacbonic', 'khi cacbonic', 'cacbonic'],
        unit: 'khí',
        explanation: 'Khí CO2 (carbon dioxide) là nguyên liệu chính của quang hợp.'
      }
    ]
  },

  // ================= ĐỀ 4 - KHỐI 7 =================
  {
    id: 'exam-phy-7-04',
    title: 'Đề 4 - Vật lí 7: Âm thanh, Nguồn âm, Độ to và Độ cao của âm',
    subject: 'physics',
    grade: 7,
    testNumber: 'TX4',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-04',
    questions: [
      { id: 'p74_1', type: 'multiple_choice', question: 'Tất cả các vật phát ra âm thanh (nguồn âm) đều có đặc điểm chung nào?', options: ['Đều dao động', 'Đều phát sáng', 'Đều có nhiệt độ rất cao', 'Đều quay tròn liên tục'], correctAnswer: 0, explanation: 'Mọi vật phát ra âm thanh đều dao động.' },
      { id: 'p74_2', type: 'multiple_choice', question: 'Số dao động mà vật thực hiện được trong một giây gọi là:', options: ['Tần số dao động', 'Biên độ dao động', 'Vận tốc dao động', 'Chu kì phát sáng'], correctAnswer: 0, explanation: 'Tần số là số dao động trong 1 giây.' },
      { id: 'p74_3', type: 'multiple_choice', question: 'Đơn vị đo tần số dao động là:', options: ['Hertz (Hz)', 'Decibel (dB)', 'Newton (N)', 'Joule (J)'], correctAnswer: 0, explanation: 'Đơn vị tần số là Hz (Héc).' },
      { id: 'p74_4', type: 'multiple_choice', question: 'Độ cao (trầm hay bổng) của âm thanh phụ thuộc vào yếu tố nào?', options: ['Tần số dao động', 'Biên độ dao động', 'Vật liệu làm nguồn âm', 'Khoảng cách đến tai người'], correctAnswer: 0, explanation: 'Tần số càng lớn âm càng bổng (cao), tần số càng nhỏ âm càng trầm (thấp).' },
      { id: 'p74_5', type: 'multiple_choice', question: 'Độ lệch lớn nhất của vật dao động so với vị trí cân bằng gọi là:', options: ['Biên độ dao động', 'Tần số dao động', 'Vận tốc cực đại', 'Pha ban đầu'], correctAnswer: 0, explanation: 'Biên độ là khoảng cách lệch lớn nhất so với vị trí cân bằng.' },
      { id: 'p74_6', type: 'multiple_choice', question: 'Độ to của âm thanh phát ra phụ thuộc trực tiếp vào yếu tố nào?', options: ['Biên độ dao động của nguồn âm', 'Tần số dao động', 'Màu sắc của vật', 'Độ ẩm không khí'], correctAnswer: 0, explanation: 'Biên độ dao động càng lớn thì âm phát ra càng to.' },
      { id: 'p74_7', type: 'multiple_choice', question: 'Đơn vị đo độ to của âm (mức áp suất âm) là:', options: ['Decibel (dB)', 'Hertz (Hz)', 'Pascal (Pa)', 'Watt (W)'], correctAnswer: 0, explanation: 'Decibel (dB) là đơn vị đo mức cường độ âm.' },
      { id: 'p74_8', type: 'multiple_choice', question: 'Âm thanh có thể truyền qua được các môi trường nào sau đây?', options: ['Chất rắn, chất lỏng và chất khí', 'Chỉ truyền trong không khí', 'Truyền tốt nhất trong chân không', 'Chỉ truyền trong nước'], correctAnswer: 0, explanation: 'Âm truyền được trong rắn, lỏng, khí nhưng không truyền được trong chân không.' },
      { id: 'p74_9', type: 'multiple_choice', question: 'Vận tốc truyền âm trong các môi trường được sắp xếp theo thứ tự giảm dần là:', options: ['Chất rắn > Chất lỏng > Chất khí', 'Chất khí > Chất lỏng > Chất rắn', 'Chất lỏng > Chất khí > Chất rắn', 'Như nhau trong mọi môi trường'], correctAnswer: 0, explanation: 'Vật chất càng đậm đặc thì âm truyền càng nhanh: rắn > lỏng > khí.' },
      { id: 'p74_10', type: 'multiple_choice', question: 'Tại sao các phi hành gia ngoài không gian vũ trụ không thể nói chuyện trực tiếp bằng lời nói bình thường?', options: ['Vì môi trường chân không không có vật chất để truyền dao động âm thanh', 'Vì bộ quần áo vũ trụ cách âm hoàn toàn', 'Vì tai người bị mất thính lực ngoài vũ trụ', 'Vì không có trọng lực'], correctAnswer: 0, explanation: 'Chân không không có phân tử dao động nên âm thanh không truyền được.' },
      { id: 'p74_11', type: 'multiple_choice', question: 'Hiện tượng âm dội ngược trở lại khi gặp mặt chắn phẳng cứng gọi là:', options: ['Sự phản xạ âm', 'Sự khúc xạ âm', 'Sự hấp thụ âm', 'Sự tán sắc âm'], correctAnswer: 0, explanation: 'Âm dội lại khi gặp vật cản là âm phản xạ.' },
      { id: 'p74_12', type: 'multiple_choice', question: 'Âm phản xạ nghe được cách âm trực tiếp tối thiểu bao nhiêu giây thì tai ta phân biệt được tiếng vang?', options: ['1/15 giây (~0.067s)', '1 giây', '2 giây', '0.001 giây'], correctAnswer: 0, explanation: 'Cần cách biệt tối thiểu 1/15 giây để tai nghe thành 2 âm tách biệt.' },
      { id: 'p74_13', type: 'multiple_choice', question: 'Vật liệu nào sau đây phản xạ âm tốt (hấp thụ âm kém)?', options: ['Bức tường gạch phẳng nhẵn hoặc tấm kính phẳng', 'Tấm xốp cách âm', 'Rèm nhung dày', 'Thảm len xốp'], correctAnswer: 0, explanation: 'Bề mặt cứng, nhẵn phẳng phản xạ âm rất tốt.' },
      { id: 'p74_14', type: 'multiple_choice', question: 'Biện pháp nào giúp chống ô nhiễm tiếng ồn cho khu dân cư gần đường quốc lộ?', options: ['Trồng nhiều cây xanh và lắp tường cách âm / cửa kính cách âm', 'Bấm còi to hơn để báo hiệu', 'Mở to loa nhạc trong nhà', 'Chặt bớt cây ven đường'], correctAnswer: 0, explanation: 'Cây xanh tán lá rậm phân tán âm thanh, cửa cách âm ngăn tiếng ồn.' },
      { id: 'p74_15', type: 'multiple_choice', question: 'Một vật trong 2 giây thực hiện được 100 dao động. Tần số dao động của vật là:', options: ['50 Hz', '200 Hz', '100 Hz', '25 Hz'], correctAnswer: 0, explanation: 'Tần số = 100 / 2 = 50 Hz.' },
      { id: 'p74_16', type: 'multiple_choice', question: 'Ngưỡng đau làm tổn thương màng nhĩ tai người bắt đầu từ khoảng mức cường độ âm nào?', options: ['130 dB', '50 dB', '80 dB', '20 dB'], correctAnswer: 0, explanation: '130 dB là ngưỡng đau tai có thể làm thủng màng nhĩ.' },
      {
        id: 'p74_17',
        type: 'true_false',
        question: 'Về âm thanh và sự truyền âm, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Âm thanh truyền nhanh nhất trong chất rắn và chậm nhất trong chất khí.', isCorrect: true },
          { subId: 'b', text: 'Trong chân không, âm thanh vẫn truyền đi bình thường với tốc độ ánh sáng.', isCorrect: false },
          { subId: 'c', text: 'Âm thanh phát ra càng bổng (cao) khi tần số dao động càng lớn.', isCorrect: true },
          { subId: 'd', text: 'Vật liệu mềm xốp bề mặt gồ ghề phản xạ âm rất tốt.', isCorrect: false }
        ]
      },
      {
        id: 'p74_18',
        type: 'short_answer',
        question: 'Một con muỗi đập cánh 600 lần trong thời gian 2 giây. Tần số dao động của cánh muỗi bằng bao nhiêu Hertz (Hz)?',
        acceptableAnswers: ['300', '300Hz', '300 Hz'],
        unit: 'Hz',
        explanation: 'f = 600 / 2 = 300 Hz.'
      }
    ]
  },

  // ================= ĐỀ 5 - KHỐI 7 =================
  {
    id: 'exam-chem-7-05',
    title: 'Đề 5 - Hóa học 7: Phân tử, Đơn chất, Hợp chất và Liên kết hóa học',
    subject: 'chemistry',
    grade: 7,
    testNumber: 'TX5',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-05',
    questions: [
      { id: 'c75_1', type: 'multiple_choice', question: 'Hạt đại diện cho chất, gồm một số nguyên tử liên kết với nhau và thể hiện đầy đủ tính chất hóa học của chất là:', options: ['Phân tử', 'Electron', 'Proton', 'Neutron'], correctAnswer: 0, explanation: 'Phân tử là hạt đại diện cho chất gồm các nguyên tử liên kết.' },
      { id: 'c75_2', type: 'multiple_choice', question: 'Khối lượng phân tử (PTK) của nước (H2O) bằng bao nhiêu amu? (Biết H = 1 amu, O = 16 amu)', options: ['18 amu', '17 amu', '16 amu', '20 amu'], correctAnswer: 0, explanation: 'PTK = 1 * 2 + 16 = 18 amu.' },
      { id: 'c75_3', type: 'multiple_choice', question: 'Đơn chất là những chất được tạo nên từ:', options: ['Chỉ một nguyên tố hóa học', 'Hai nguyên tố hóa học khác nhau', 'Ba nguyên tố hóa học', 'Chất vô cơ và hữu cơ'], correctAnswer: 0, explanation: 'Đơn chất cấu tạo từ 1 nguyên tố duy nhất.' },
      { id: 'c75_4', type: 'multiple_choice', question: 'Chất nào sau đây là đơn chất phi kim?', options: ['Khí oxygen (O2)', 'Nước (H2O)', 'Muối ăn (NaCl)', 'Khí carbon dioxide (CO2)'], correctAnswer: 0, explanation: 'O2 chỉ tạo từ 1 nguyên tố phi kim O.' },
      { id: 'c75_5', type: 'multiple_choice', question: 'Hợp chất là những chất được tạo nên từ:', options: ['Từ hai hay nhiều nguyên tố hóa học liên kết với nhau', 'Chỉ từ một nguyên tố kim loại', 'Hỗn hợp cát và sỏi', 'Dung môi nước'], correctAnswer: 0, explanation: 'Hợp chất do từ 2 nguyên tố hóa học trở lên tạo thành.' },
      { id: 'c75_6', type: 'multiple_choice', question: 'Chất nào sau đây là hợp chất?', options: ['Khí methane (CH4)', 'Khí nitrogen (N2)', 'Kim loại đồng (Cu)', 'Khí hydrogen (H2)'], correctAnswer: 0, explanation: 'CH4 tạo từ 2 nguyên tố C và H nên là hợp chất.' },
      { id: 'c75_7', type: 'multiple_choice', question: 'Nguyên tử các nguyên tố có xu hướng liên kết với nhau để đạt được cấu hình electron bền vững giống:', options: ['Khí hiếm (8 electron ở lớp ngoài cùng, riêng He có 2e)', 'Kim loại kiềm', 'Phi kim nhóm VIIA', 'Nguyên tử Carbon'], correctAnswer: 0, explanation: 'Quy tắc octet: xu hướng đạt 8 electron lớp ngoài cùng bền vững như khí hiếm.' },
      { id: 'c75_8', type: 'multiple_choice', question: 'Liên kết ion được hình thành do:', options: ['Lực hút tĩnh điện giữa các ion mang điện tích trái dấu', 'Sự dùng chung các cặp electron', 'Sự truyền nhiệt giữa các hạt', 'Lực hấp dẫn vũ trụ'], correctAnswer: 0, explanation: 'Kim loại nhường electron tạo cation, phi kim nhận electron tạo anion hút nhau.' },
      { id: 'c75_9', type: 'multiple_choice', question: 'Muối ăn (NaCl) được hình thành bởi loại liên kết hóa học nào?', options: ['Liên kết ion', 'Liên kết cộng hóa trị', 'Liên kết kim loại', 'Liên kết hydrogen'], correctAnswer: 0, explanation: 'Na+ và Cl- liên kết ion vững chắc.' },
      { id: 'c75_10', type: 'multiple_choice', question: 'Liên kết cộng hóa trị là liên kết được hình thành giữa hai nguyên tử bằng:', options: ['Một hay nhiều cặp electron dùng chung', 'Lực hút giữa ion dương và electron tự do', 'Sự hút tĩnh điện của ion trái dấu', 'Sự tan chảy ở nhiệt độ cao'], correctAnswer: 0, explanation: 'Liên kết cộng hóa trị chia sẻ cặp electron chung.' },
      { id: 'c75_11', type: 'multiple_choice', question: 'Phân tử nào sau đây có liên kết cộng hóa trị?', options: ['Khí hydrogen (H2) và nước (H2O)', 'Muối ăn (NaCl)', 'Canxi clorua (CaCl2)', 'Oxit magie (MgO)'], correctAnswer: 0, explanation: 'Phi kim với phi kim tạo liên kết cộng hóa trị.' },
      { id: 'c75_12', type: 'multiple_choice', question: 'Các hợp chất ion thường có tính chất vật lí chung nào?', options: ['Ở thể rắn, nhiệt độ nóng chảy và nhiệt độ sôi cao, dung dịch dẫn điện', 'Ở thể khí, mùi hắc', 'Dễ bay hơi ở nhiệt độ phòng', 'Không tan trong nước'], correctAnswer: 0, explanation: 'Liên kết ion bền vững nên nhiệt độ nóng chảy rất cao.' },
      { id: 'c75_13', type: 'multiple_choice', question: 'Hóa trị của một nguyên tố trong hợp chất biểu thị:', options: ['Khả năng liên kết của nguyên tử nguyên tố đó với nguyên tử khác', 'Khối lượng của nguyên tử', 'Số lượng neutron trong hạt nhân', 'Số proton trong hạt nhân'], correctAnswer: 0, explanation: 'Hóa trị đo khả năng liên kết của nguyên tử.' },
      { id: 'c75_14', type: 'multiple_choice', question: 'Quy ước hóa trị của nguyên tố H và O lần lượt là:', options: ['H có hóa trị I, O có hóa trị II', 'H có hóa trị II, O có hóa trị I', 'Cả hai đều có hóa trị I', 'H có hóa trị III, O có hóa trị II'], correctAnswer: 0, explanation: 'H hóa trị I, O hóa trị II làm chuẩn.' },
      { id: 'c75_15', type: 'multiple_choice', question: 'Trong phân tử khí carbon dioxide (CO2), nguyên tố Carbon có hóa trị mấy?', options: ['Hóa trị IV', 'Hóa trị II', 'Hóa trị I', 'Hóa trị III'], correctAnswer: 0, explanation: 'Hóa trị C = 2 * II = IV.' },
      { id: 'c75_16', type: 'multiple_choice', question: 'Khối lượng phân tử của khí Methane (CH4) là bao nhiêu amu? (C = 12 amu, H = 1 amu)', options: ['16 amu', '14 amu', '18 amu', '12 amu'], correctAnswer: 0, explanation: '12 + 1 * 4 = 16 amu.' },
      {
        id: 'c75_17',
        type: 'true_false',
        question: 'Về đơn chất, hợp chất và liên kết hóa học, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Nước (H2O) là một hợp chất được cấu tạo từ 2 nguyên tố H và O.', isCorrect: true },
          { subId: 'b', text: 'Liên kết ion hình thành do sự dùng chung các electron giữa hai nguyên tử phi kim.', isCorrect: false },
          { subId: 'c', text: 'Muối ăn (NaCl) dẫn điện tốt khi hòa tan trong nước.', isCorrect: true },
          { subId: 'd', text: 'Đơn chất kim loại như đồng (Cu), sắt (Fe) đều có khả năng dẫn điện tốt.', isCorrect: true }
        ]
      },
      {
        id: 'c75_18',
        type: 'short_answer',
        question: 'Tính khối lượng phân tử của khí Carbon dioxide (CO2) theo đơn vị amu (cho C = 12, O = 16)?',
        acceptableAnswers: ['44', '44 amu', '44amu'],
        unit: 'amu',
        explanation: 'PTK = 12 + 16 * 2 = 44 amu.'
      }
    ]
  },

  // ================= ĐỀ 6 - KHỐI 7 =================
  {
    id: 'exam-bio-7-06',
    title: 'Đề 6 - Sinh học 7: Cảm ứng ở sinh vật và Tập tính của động vật',
    subject: 'biology',
    grade: 7,
    testNumber: 'TX6',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-06',
    questions: [
      { id: 'b76_1', type: 'multiple_choice', question: 'Cảm ứng ở sinh vật là phản ứng của cơ thể sinh vật nhằm:', options: ['Trả lời lại các kích thích từ môi trường để thích nghi và tồn tại', 'Tăng cân nặng nhanh chóng', 'Thu hút kẻ thù tự nhiên', 'Làm rụng lá cây vào mùa hè'], correctAnswer: 0, explanation: 'Cảm ứng giúp sinh vật thích nghi với thay đổi của môi trường.' },
      { id: 'b76_2', type: 'multiple_choice', question: 'Hiện tượng ngọn cây luôn uốn cong vươn về phía có ánh sáng gọi là:', options: ['Tính hướng sáng', 'Tính hướng trọng lực', 'Tính hướng nước', 'Tính hướng hóa'], correctAnswer: 0, explanation: 'Ngọn cây hướng sáng dương để tối ưu hóa quang hợp.' },
      { id: 'b76_3', type: 'multiple_choice', question: 'Rễ cây luôn đâm sâu xuống lòng đất và tìm đến nơi có nguồn nước gọi là:', options: ['Tính hướng đất (hướng trọng lực) và hướng nước', 'Tính hướng sáng', 'Tính ứng động nở hoa', 'Tính hướng tiếp xúc'], correctAnswer: 0, explanation: 'Rễ cây hướng trọng lực dương và hướng nước dương.' },
      { id: 'b76_4', type: 'multiple_choice', question: 'Lá cây trinh nữ (cây xấu hổ) cụp lại khi bị chạm tay vào là ví dụ về:', options: ['Ứng động không sinh trưởng (cảm ứng va chạm)', 'Tính hướng sáng', 'Tính hướng hóa', 'Sự ngủ nghỉ của hạt giống'], correctAnswer: 0, explanation: 'Lực chạm làm thay đổi sức trương nước ở khớp cuống lá.' },
      { id: 'b76_5', type: 'multiple_choice', question: 'Cảm ứng ở thực vật có đặc điểm gì so với động vật?', options: ['Phản ứng diễn ra chậm chạp và khó nhận thấy bằng mắt thường', 'Phản ứng diễn ra tức thì nhờ hệ thần kinh', 'Có thể di chuyển chạy trốn', 'Không có tính thích nghi'], correctAnswer: 0, explanation: 'Thực vật không có hệ thần kinh nên cảm ứng chủ yếu qua sinh trưởng chậm.' },
      { id: 'b76_6', type: 'multiple_choice', question: 'Hệ cơ quan ở động vật đóng vai trò chỉ huy và điều khiển các phản ứng cảm ứng nhanh chóng là:', options: ['Hệ thần kinh', 'Hệ tiêu hóa', 'Hệ tuần hoàn', 'Hệ xương khớp'], correctAnswer: 0, explanation: 'Hệ thần kinh tiếp nhận và xử lý kích thích dẫn truyền xung thần kinh.' },
      { id: 'b76_7', type: 'multiple_choice', question: 'Tập tính bẩm sinh của động vật là loại tập tính:', options: ['Sinh ra đã có, mang tính bản năng di truyền từ bố mẹ', 'Hình thành do học tập và rèn luyện trong đời', 'Dễ dàng thay đổi theo thời gian', 'Chỉ xuất hiện ở người'], correctAnswer: 0, explanation: 'Tập tính bẩm sinh gắn liền với bộ gen của loài.' },
      { id: 'b76_8', type: 'multiple_choice', question: 'Hiện tượng nào sau đây là tập tính bẩm sinh?', options: ['Nhện đan lưới bắt mồi', 'Khỉ biết đi xe đạp biểu diễn xiếc', 'Chó biết sủa mừng khi chủ về', 'Học sinh biết làm bài tập toán'], correctAnswer: 0, explanation: 'Nhện mới nở đã biết giăng tơ đan lưới bẩm sinh.' },
      { id: 'b76_9', type: 'multiple_choice', question: 'Tập tính học được ở động vật được hình thành qua con đường nào?', options: ['Kinh nghiệm sống, học tập và rèn luyện trong đời cá thể', 'Di truyền từ đời trước', 'Đột biến nhiễm sắc thể', 'Cảm ứng của lông hút'], correctAnswer: 0, explanation: 'Tập tính học được dựa trên trải nghiệm và điều kiện hóa.' },
      { id: 'b76_10', type: 'multiple_choice', question: 'Tập tính di cư tránh rét của các đàn chim vào mùa thu là nhằm mục đích gì?', options: ['Tìm nơi ấm áp có nhiều thức ăn để tồn tại và sinh sản', 'Đi du lịch khám phá vùng đất mới', 'Để tìm nơi ngủ đông vĩnh viễn', 'Để thay lông rụng'], correctAnswer: 0, explanation: 'Di cư tránh rét đảm bảo thức ăn và sinh sản của loài.' },
      { id: 'b76_11', type: 'multiple_choice', question: 'Động vật đánh dấu lãnh thổ bằng mùi nước tiểu, phân hoặc chất tiết đặc biệt thể hiện:', options: ['Tập tính bảo vệ lãnh thổ', 'Tập tính kiếm ăn chung', 'Tập tính rủ bạn đi chơi', 'Tập tính ngủ ngày'], correctAnswer: 0, explanation: 'Mùi hương cảnh báo các cá thể khác không xâm phạm lãnh thổ.' },
      { id: 'b76_12', type: 'multiple_choice', question: 'Con chim công đực xòe chiếc đuôi sặc sỡ và nhảy múa trước con công cái là ví dụ của:', options: ['Tập tính sinh sản (tán tỉnh bạn tình)', 'Tập tính đe dọa con mồi', 'Tập tính bảo vệ con non', 'Tập tính bắt chước'], correctAnswer: 0, explanation: 'Công đực khoe sắc vũ điệu để thu hút con cái giao phối.' },
      { id: 'b76_13', type: 'multiple_choice', question: 'Ứng dụng tập tính học được của động vật trong nông nghiệp là:', options: ['Huấn luyện chó chăn cừu, chim ưng đuổi chim hại mùa màng', 'Bắt chim nhốt vào lồng', 'Nuôi cá trong chậu cảnh', 'Để gia súc đi kiếm ăn tự do'], correctAnswer: 0, explanation: 'Huấn luyện động vật phục vụ sản xuất và an ninh.' },
      { id: 'b76_14', type: 'multiple_choice', question: 'Thói quen dậy sớm tập thể dục, rửa tay trước khi ăn của con người thuộc loại tập tính nào?', options: ['Tập tính học được (thói quen tốt được rèn luyện)', 'Tập tính bẩm sinh', 'Phản xạ không điều kiện', 'Cảm ứng tự nhiên'], correctAnswer: 0, explanation: 'Thói quen hình thành qua rèn luyện và ý thức.' },
      { id: 'b76_15', type: 'multiple_choice', question: 'Ong mật chia sẻ thông tin về vị trí nguồn hoa có mật cho đồng loại bằng cách nào?', options: ['Thực hiện "vũ điệu nhảy múa" đặc trưng trong tổ ong', 'Kêu vo ve thật to', 'Cắn vào cánh của các con ong khác', 'Để lại dấu vết trên không trung'], correctAnswer: 0, explanation: 'Vũ điệu tròn hoặc lắc đuôi của ong truyền đạt hướng và cự ly hoa.' },
      { id: 'b76_16', type: 'multiple_choice', question: 'Tua cuốn của cây mướp, bầu, bí quấn chặt vào giàn leo là dạng cảm ứng nào?', options: ['Hướng tiếp xúc', 'Hướng đất', 'Hướng nước', 'Hướng hóa'], correctAnswer: 0, explanation: 'Tua cuốn tiếp xúc với giá thể và quấn quanh giá thể vươn lên cao.' },
      {
        id: 'b76_17',
        type: 'true_false',
        question: 'Về cảm ứng và tập tính sinh vật, hãy đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tập tính bẩm sinh sinh ra đã có và không bị thay đổi theo đời sống cá thể.', isCorrect: true },
          { subId: 'b', text: 'Cây cối có hệ thần kinh điều khiển cảm ứng cực nhanh giống hệt loài báo gấm.', isCorrect: false },
          { subId: 'c', text: 'Tập tính học được giúp động vật thích nghi linh hoạt với môi trường sống luôn biến đổi.', isCorrect: true },
          { subId: 'd', text: 'Ngọn cây có tính hướng sáng âm nên luôn trốn tránh ánh mặt trời.', isCorrect: false }
        ]
      },
      {
        id: 'b76_18',
        type: 'short_answer',
        question: 'Hiện tượng ngọn cây xanh luôn uốn cong phát triển về phía có ánh sáng chiếu vào được gọi là tính hướng gì?',
        acceptableAnswers: ['Hướng sáng', 'tính hướng sáng', 'huong sang'],
        unit: 'tính',
        explanation: 'Tính hướng sáng (phototropism).'
      }
    ]
  },

  // ================= ĐỀ 7 - KHỐI 7 =================
  {
    id: 'exam-phy-7-07',
    title: 'Đề 7 - Vật lí 7: Ánh sáng, Tia sáng và Định luật phản xạ ánh sáng',
    subject: 'physics',
    grade: 7,
    testNumber: 'TX7',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-07',
    questions: [
      { id: 'p77_1', type: 'multiple_choice', question: 'Vật nào sau đây là nguồn sáng (tự phát ra ánh sáng)?', options: ['Mặt Trời / Ngọn nến đang cháy', 'Mặt Trăng', 'Tấm gương soi', 'Quyển sách trên bàn'], correctAnswer: 0, explanation: 'Mặt Trời và ngọn nến tự phát ra ánh sáng, Mặt Trăng chỉ phản chiếu ánh sáng Mặt Trời.' },
      { id: 'p77_2', type: 'multiple_choice', question: 'Mắt ta nhìn thấy một vật khi nào?', options: ['Khi có ánh sáng từ vật đó truyền vào mắt ta', 'Khi mở mắt trong phòng tối om', 'Khi vật đó có kích thước rất lớn', 'Khi ta hướng mắt về phía vật'], correctAnswer: 0, explanation: 'Mắt nhìn thấy vật khi có ánh sáng từ vật đi vào mắt.' },
      { id: 'p77_3', type: 'multiple_choice', question: 'Định luật truyền thẳng của ánh sáng khẳng định trong môi trường trong suốt và đồng tính:', options: ['Ánh sáng truyền đi theo đường thẳng', 'Ánh sáng truyền đi theo đường cong parabol', 'Ánh sáng truyền đi theo đường gấp khúc ziczac', 'Ánh sáng bị dừng lại hoàn toàn'], correctAnswer: 0, explanation: 'Trong môi trường trong suốt và đồng tính, ánh sáng truyền thẳng.' },
      { id: 'p77_4', type: 'multiple_choice', question: 'Đường truyền của ánh sáng được biểu diễn bằng một đường thẳng có mũi tên chỉ chiều gọi là:', options: ['Tia sáng', 'Chùm sáng', 'Quang phổ', 'Góc phản xạ'], correctAnswer: 0, explanation: 'Tia sáng biểu diễn đường truyền thẳng của ánh sáng.' },
      { id: 'p77_5', type: 'multiple_choice', question: 'Bóng tối xuất hiện phía sau vật cản sáng là bằng chứng thực nghiệm của:', options: ['Định luật truyền thẳng của ánh sáng', 'Sự phản xạ ánh sáng', 'Sự khúc xạ ánh sáng', 'Sự tán sắc ánh sáng'], correctAnswer: 0, explanation: 'Ánh sáng truyền thẳng bị vật cản chặn lại tạo vùng bóng tối phía sau.' },
      { id: 'p77_6', type: 'multiple_choice', question: 'Hiện tượng nhật thực xảy ra khi nào?', options: ['Mặt Trăng nằm giữa Mặt Trời và Trái Đất che khuất ánh sáng Mặt Trời', 'Trái Đất nằm giữa Mặt Trời và Mặt Trăng', 'Mặt Trời lặn xuống biển', 'Sao Hỏa đi qua Mặt Trời'], correctAnswer: 0, explanation: 'Mặt Trăng chắn ánh sáng Mặt Trời chiếu xuống Trái Đất.' },
      { id: 'p77_7', type: 'multiple_choice', question: 'Theo định luật phản xạ ánh sáng, góc phản xạ (r) và góc tới (i) có mối quan hệ:', options: ['Góc phản xạ bằng góc tới (r = i)', 'Góc phản xạ lớn hơn góc tới (r > i)', 'Góc phản xạ nhỏ hơn góc tới (r < i)', 'Tổng hai góc luôn bằng 180°'], correctAnswer: 0, explanation: 'Định luật phản xạ: i = r và tia phản xạ nằm trong mặt phẳng tới.' },
      { id: 'p77_8', type: 'multiple_choice', question: 'Nếu một tia sáng tới gương phẳng với góc tới i = 40° thì góc phản xạ r bằng:', options: ['40°', '50°', '80°', '20°'], correctAnswer: 0, explanation: 'r = i = 40°.' },
      { id: 'p77_9', type: 'multiple_choice', question: 'Góc tới là góc hợp bởi giữa tia tới và:', options: ['Pháp tuyến của gương tại điểm tới', 'Mặt phẳng gương phẳng', 'Tia phản xạ', 'Đường chân trời'], correctAnswer: 0, explanation: 'Góc tới đo từ tia tới đến pháp tuyến vuông góc với mặt gương.' },
      { id: 'p77_10', type: 'multiple_choice', question: 'Ảnh của một vật tạo bởi gương phẳng có tính chất nào sau đây?', options: ['Ảnh ảo, không hứng được trên màn chắn, có kích thước bằng vật', 'Ảnh thật, hứng được trên màn chắn', 'Ảnh ảo, lớn hơn vật gấp 2 lần', 'Ảnh thật, ngược chiều và nhỏ hơn vật'], correctAnswer: 0, explanation: 'Gương phẳng tạo ảnh ảo đối xứng, bằng kích thước vật.' },
      { id: 'p77_11', type: 'multiple_choice', question: 'Một người đứng cách gương phẳng 1.5 m. Khoảng cách từ người đó đến ảnh của mình trong gương là:', options: ['3 m', '1.5 m', '4.5 m', '0.75 m'], correctAnswer: 0, explanation: 'd(người - ảnh) = 1.5 + 1.5 = 3.0 m.' },
      { id: 'p77_12', type: 'multiple_choice', question: 'Phản xạ khuếch tán (tán xạ) xảy ra khi ánh sáng chiếu vào bề mặt nào?', options: ['Bề mặt gồ ghề, thô ráp như tờ giấy nhám, mặt đất', 'Mặt gương phẳng nhẵn bóng', 'Mặt nước hồ phẳng lặng không gợn sóng', 'Mặt kính soi hoàn hảo'], correctAnswer: 0, explanation: 'Bề mặt gồ ghề tán xạ tia sáng theo nhiều hướng khác nhau.' },
      { id: 'p77_13', type: 'multiple_choice', question: 'Tốc độ truyền của ánh sáng trong chân không là bao nhiêu?', options: ['Khoảng 300 000 km/s (3.10^8 m/s)', 'Khoảng 340 m/s', 'Khoảng 1500 m/s', 'Khoảng 10 000 km/h'], correctAnswer: 0, explanation: 'c ≈ 3 * 10^8 m/s = 300 000 km/s là tốc độ tối đa trong vũ trụ.' },
      { id: 'p77_14', type: 'multiple_choice', question: 'Gương cầu lồi thường được gắn ở góc cua đường đèo hiểm trở hoặc gương chiếu hậu ô tô vì:', options: ['Vùng nhìn thấy (thị trường) của gương cầu lồi rộng hơn gương phẳng', 'Tạo ra ảnh thật lộn ngược', 'Làm vật nhìn to hơn thực tế rất nhiều', 'Để trang trí cho đẹp'], correctAnswer: 0, explanation: 'Thị trường của gương cầu lồi rộng hơn nhiều so với gương phẳng cùng kích thước.' },
      { id: 'p77_15', type: 'multiple_choice', question: 'Khi tia sáng truyền vuông góc với mặt gương phẳng (trùng với pháp tuyến), góc tới bằng bao nhiêu độ?', options: ['0°', '90°', '45°', '180°'], correctAnswer: 0, explanation: 'Tia tới trùng pháp tuyến thì góc tới i = 0°.' },
      { id: 'p77_16', type: 'multiple_choice', question: 'Kính tiềm vọng dùng trong tàu ngầm hoạt động dựa trên ứng dụng của thiết bị quang học nào?', options: ['Hai gương phẳng đặt nghiêng 45° đối diện nhau', 'Thấu kính hội tụ dày', 'Gương cầu lõm nung nhiệt', 'Lăng kính khúc xạ đơn'], correctAnswer: 0, explanation: 'Hai gương phẳng đổi hướng tia sáng 90° giúp quan sát trên mặt nước.' },
      {
        id: 'p77_17',
        type: 'true_false',
        question: 'Về ánh sáng và gương phẳng, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Mặt Trăng là một nguồn sáng tự phát ra ánh sáng trong đêm.', isCorrect: false },
          { subId: 'b', text: 'Định luật phản xạ ánh sáng khẳng định góc phản xạ luôn bằng góc tới.', isCorrect: true },
          { subId: 'c', text: 'Ảnh của một vật qua gương phẳng là ảnh thật và có thể hứng được trên màn chắn.', isCorrect: false },
          { subId: 'd', text: 'Ánh sáng truyền đi trong nước theo đường thẳng nếu nước đồng tính.', isCorrect: true }
        ]
      },
      {
        id: 'p77_18',
        type: 'short_answer',
        question: 'Chiếu một tia sáng tới mặt gương phẳng sao cho góc tới i = 35°. Góc hợp bởi tia tới và tia phản xạ bằng bao nhiêu độ (°)?',
        acceptableAnswers: ['70', '70°', '70 độ', '70 do'],
        unit: 'độ',
        explanation: 'Góc hợp bởi tia tới và tia phản xạ = i + r = 35° + 35° = 70°.'
      }
    ]
  },

  // ================= ĐỀ 8 - KHỐI 7 =================
  {
    id: 'exam-bio-7-08',
    title: 'Đề 8 - Sinh học 7: Sinh sản ở sinh vật và Điều hòa sinh sản',
    subject: 'biology',
    grade: 7,
    testNumber: 'TX8',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-08',
    questions: [
      { id: 'b78_1', type: 'multiple_choice', question: 'Sinh sản ở sinh vật là quá trình tạo ra các cá thể mới nhằm mục đích gì?', options: ['Đảm bảo sự kế tục và phát triển liên tục của nòi giống loài đó', 'Làm cho bố mẹ trẻ lại', 'Tiêu hao năng lượng dự trữ', 'Làm biến đổi hình thái môi trường sống'], correctAnswer: 0, explanation: 'Sinh sản duy trì sự tồn tại của loài qua các thế hệ.' },
      { id: 'b78_2', type: 'multiple_choice', question: 'Hai hình thức sinh sản chủ yếu ở sinh giới là:', options: ['Sinh sản vô tính và sinh sản hữu tính', 'Sinh sản bằng hạt và bằng củ', 'Đẻ con và đẻ trứng', 'Nguyên phân và giảm phân'], correctAnswer: 0, explanation: 'Vô tính (không kết hợp giao tử) và hữu tính (có thụ tinh).' },
      { id: 'b78_3', type: 'multiple_choice', question: 'Sinh sản vô tính là hình thức sinh sản:', options: ['Chỉ có 1 cá thể mẹ, không có sự kết hợp giữa giao tử đực và cái, con sinh ra giống hệt mẹ', 'Cần có bố và mẹ giao phối', 'Tạo ra con non luôn biến dị rất nhiều', 'Chỉ xuất hiện ở động vật bậc cao'], correctAnswer: 0, explanation: 'Sinh sản vô tính dựa trên nguyên phân, con đồng nhất di truyền với mẹ.' },
      { id: 'b78_4', type: 'multiple_choice', question: 'Sinh sản sinh dưỡng ở thực vật là hình thức cây con phát triển từ cơ quan nào?', options: ['Rễ, thân hoặc lá của cây mẹ', 'Hoa của cây mẹ', 'Hạt phấn và noãn', 'Hạt nảy mầm'], correctAnswer: 0, explanation: 'Sinh sản sinh dưỡng từ cơ quan dinh dưỡng: rễ củ, thân rễ, lá.' },
      { id: 'b78_5', type: 'multiple_choice', question: 'Cây thuốc bỏng (lá bỏng) có thể mọc thành cây con mới từ bộ phận nào?', options: ['Mép của phiến lá già rụng xuống đất ẩm', 'Rễ cọc đâm sâu', 'Hạt nằm trong quả', 'Cánh hoa rụng'], correctAnswer: 0, explanation: 'Lá thuốc bỏng sinh ra chồi con dọc mép lá.' },
      { id: 'b78_6', type: 'multiple_choice', question: 'Phương pháp nhân giống vô tính nào cắt một đoạn thân hoặc cành cắm xuống đất ẩm cho ra rễ?', options: ['Giâm cành', 'Chiết cành', 'Ghép mắt', 'Nuôi cấy mô tế bào'], correctAnswer: 0, explanation: 'Giâm cành là cắt đoạn cành bánh tẻ cắm đất ra rễ.' },
      { id: 'b78_7', type: 'multiple_choice', question: 'Ưu điểm nổi bật của phương pháp chiết cành và ghép cây ăn quả là:', options: ['Rút ngắn thời gian sinh trưởng, cây nhanh cho quả và giữ nguyên đặc tính ngon của giống mẹ', 'Tạo ra giống cây hoàn toàn mới lạ', 'Không bao giờ bị sâu bệnh hại', 'Không cần tưới nước chăm sóc'], correctAnswer: 0, explanation: 'Nhân giống sinh dưỡng giữ nguyên đặc tính quý của cây mẹ.' },
      { id: 'b78_8', type: 'multiple_choice', question: 'Sinh sản hữu tính có đặc trưng cơ bản nào?', options: ['Có sự kết hợp giữa giao tử đực (tinh trùng) và giao tử cái (trứng) tạo thành hợp tử', 'Không cần thụ phấn hay thụ tinh', 'Con sinh ra giống hệt mẹ 100%', 'Chỉ diễn ra ở sinh vật đơn bào'], correctAnswer: 0, explanation: 'Sinh sản hữu tính luôn có quá trình thụ tinh tạo hợp tử.' },
      { id: 'b78_9', type: 'multiple_choice', question: 'Hoa lưỡng tính là hoa có đặc điểm cấu tạo nào sau đây?', options: ['Có cả nhị (sinh hạt phấn) và nhụy (chứa noãn) trên cùng một bông hoa', 'Chỉ có nhị đực', 'Chỉ có nhụy cái', 'Không có tràng hoa cánh màu'], correctAnswer: 0, explanation: 'Hoa lưỡng tính có cả nhị và nhụy (hoa bưởi, hoa cải).' },
      { id: 'b78_10', type: 'multiple_choice', question: 'Hiện tượng hạt phấn rơi vào đầu nhụy của hoa cùng loài được gọi là:', options: ['Sự thụ phấn', 'Sự thụ tinh', 'Sự nảy mầm', 'Sự chín của quả'], correctAnswer: 0, explanation: 'Thụ phấn là hạt phấn tiếp xúc với đầu nhụy.' },
      { id: 'b78_11', type: 'multiple_choice', question: 'Sau khi thụ tinh, noãn phát triển thành hạt còn bầu nhụy phát triển thành:', options: ['Quả', 'Lá cây', 'Cánh hoa', 'Đài hoa'], correctAnswer: 0, explanation: 'Noãn -> Hạt, Bầu nhụy -> Quả.' },
      { id: 'b78_12', type: 'multiple_choice', question: 'Thụ tinh ngoài là hiện tượng trứng và tinh trùng thụ tinh ở đâu?', options: ['Ở môi trường nước bên ngoài cơ thể mẹ (ở cá, ếch nhái)', 'Trong ống dẫn trứng của mẹ', 'Trong tử cung con cái', 'Trên cành cây cao'], correctAnswer: 0, explanation: 'Cá và ếch phóng tinh dịch và trứng vào nước thụ tinh ngoài.' },
      { id: 'b78_13', type: 'multiple_choice', question: 'Lớp động vật nào có hình thức thụ tinh trong và thai sinh (đẻ con, nuôi con bằng sữa)?', options: ['Lớp Thú (Động vật có vú)', 'Lớp Chim', 'Lớp Bò sát', 'Lớp Lưỡng cư'], correctAnswer: 0, explanation: 'Lớp Thú mang thai, đẻ con và nuôi con bằng sữa mẹ tiến hóa nhất.' },
      { id: 'b78_14', type: 'multiple_choice', question: 'Ứng dụng thụ phấn nhân tạo cho cây trồng (ngô, thanh long, sầu riêng) giúp đem lại lợi ích gì?', options: ['Tăng tỉ lệ đậu quả, quả to đều hạt chắc và năng suất vụ mùa cao', 'Làm cây không nở hoa nữa', 'Tiết kiệm nước tưới', 'Làm chín cây sớm hơn 1 năm'], correctAnswer: 0, explanation: 'Thụ phấn bổ sung giúp tỷ lệ đậu quả đạt tối đa.' },
      { id: 'b78_15', type: 'multiple_choice', question: 'Điều hòa sinh sản ở vật nuôi bằng cách thắp đèn chiếu sáng ban đêm cho gà đẻ nhằm:', options: ['Kích thích tuyến yên tiết hormone thúc đẩy gà đẻ nhiều trứng hơn', 'Giúp gà nhìn thấy đường đi ăn đêm', 'Sưởi ấm chuồng trại mùa đông', 'Xua đuổi chuột bọ'], correctAnswer: 0, explanation: 'Ánh sáng kích thích thụ thể mắt tác động tuyến yên tiết hormone kích thích đẻ trứng.' },
      { id: 'b78_16', type: 'multiple_choice', question: 'Thủy tức sinh sản vô tính bằng hình thức đặc trưng nào?', options: ['Mọc chồi', 'Phân đôi', 'Tạo bào tử', 'Tự thụ phấn'], correctAnswer: 0, explanation: 'Thủy tức mọc chồi con trên cơ thể mẹ rồi tách ra.' },
      {
        id: 'b78_17',
        type: 'true_false',
        question: 'Về sinh sản ở sinh vật và ứng dụng, hãy đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Sinh sản vô tính tạo ra các cá thể con mang biến dị tổ hợp phong phú hơn sinh sản hữu tính.', isCorrect: false },
          { subId: 'b', text: 'Chiết cành và giâm cành là các phương pháp sinh sản sinh dưỡng nhân tạo phổ biến.', isCorrect: true },
          { subId: 'c', text: 'Sau khi thụ tinh ở hoa, bầu nhụy phát triển thành quả chứa hạt bên trong.', isCorrect: true },
          { subId: 'd', text: 'Thụ tinh trong có hiệu suất thụ tinh và tỉ lệ sống sót của con non thấp hơn thụ tinh ngoài.', isCorrect: false }
        ]
      },
      {
        id: 'b78_18',
        type: 'short_answer',
        question: 'Sau khi quá trình thụ tinh kép hoàn tất ở thực vật có hoa, bầu nhụy của hoa sẽ phát triển thành bộ phận gì?',
        acceptableAnswers: ['Quả', 'trái', 'trái cây', 'qua'],
        unit: 'cơ quan',
        explanation: 'Bầu nhụy phát triển thành quả.'
      }
    ]
  }
];
