import { Exam } from '../types';

export const examsGrade9: Exam[] = [
  // ================= ĐỀ 1 - KHỐI 9 =================
  {
    id: 'exam-phy-9-01',
    title: 'Đề 1 - Vật lí 9: Cơ năng, Động năng và Thế năng',
    subject: 'physics',
    grade: 9,
    testNumber: 'TX1',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-01',
    questions: [
      { id: 'p91_1', type: 'multiple_choice', question: 'Cơ năng của một vật là tổng của hai dạng năng lượng nào?', options: ['Động năng và thế năng', 'Nhiệt năng và hóa năng', 'Điện năng và quang năng', 'Năng lượng hạt nhân và cơ năng'], correctAnswer: 0, explanation: 'W = Wđ + Wt (Cơ năng = Động năng + Thế năng).' },
      { id: 'p91_2', type: 'multiple_choice', question: 'Công thức tính động năng của một vật có khối lượng m chuyển động với vận tốc v là:', options: ['Wđ = (1/2) . m . v²', 'Wđ = m . v', 'Wđ = m . g . h', 'Wđ = (1/2) . m . v'], correctAnswer: 0, explanation: 'Động năng Wđ = 1/2 m v².' },
      { id: 'p91_3', type: 'multiple_choice', question: 'Công thức tính thế năng trọng trường của vật có khối lượng m ở độ cao h là:', options: ['Wt = m . g . h', 'Wt = (1/2) . m . h²', 'Wt = m . v²', 'Wt = F . s'], correctAnswer: 0, explanation: 'Thế năng trọng trường Wt = m.g.h.' },
      { id: 'p91_4', type: 'multiple_choice', question: 'Khi một vật rơi tự do từ trên cao xuống đất (bỏ qua sức cản không khí):', options: ['Thế năng chuyển hóa thành động năng, cơ năng được bảo toàn', 'Động năng chuyển hóa thành thế năng', 'Cả động năng và thế năng cùng tăng', 'Cơ năng giảm dần về 0'], correctAnswer: 0, explanation: 'Độ cao giảm làm thế năng giảm biến thành động năng, W = hằng số.' },
      { id: 'p91_5', type: 'multiple_choice', question: 'Định luật bảo toàn cơ năng áp dụng khi nào?', options: ['Khi vật chỉ chịu tác dụng của trọng lực (hoặc lực đàn hồi), bỏ qua ma sát', 'Khi có lực ma sát rất lớn', 'Khi vật bị nung nóng', 'Mọi trường hợp bất kể ma sát'], correctAnswer: 0, explanation: 'Cơ năng chỉ bảo toàn khi không có lực ma sát, lực cản làm tiêu hao năng lượng.' },
      { id: 'p91_6', type: 'multiple_choice', question: 'Một vật có khối lượng m = 2 kg đang chuyển động với vận tốc v = 4 m/s. Động năng của vật là:', options: ['16 J', '8 J', '32 J', '4 J'], correctAnswer: 0, explanation: 'Wđ = 1/2 * 2 * 4² = 16 J.' },
      { id: 'p91_7', type: 'multiple_choice', question: 'Một vật có khối lượng m = 1 kg ở độ cao h = 5 m so với mặt đất (lấy g = 10 m/s²). Thế năng trọng trường của vật là:', options: ['50 J', '25 J', '100 J', '5 J'], correctAnswer: 0, explanation: 'Wt = m * g * h = 1 * 10 * 5 = 50 J.' },
      { id: 'p91_8', type: 'multiple_choice', question: 'Tại vị trí cao nhất trong chuyển động của một con lắc đơn:', options: ['Thế năng đạt cực đại, động năng bằng 0', 'Động năng đạt cực đại', 'Cả hai cùng bằng 0', 'Vận tốc cực đại'], correctAnswer: 0, explanation: 'Ở biên cao nhất, con lắc dừng lại tức thời (v=0) nên Wđ=0, Wt cực đại.' },
      { id: 'p91_9', type: 'multiple_choice', question: 'Tại vị trí cân bằng thấp nhất của con lắc đơn:', options: ['Động năng đạt cực đại, thế năng đạt cực tiểu', 'Thế năng đạt cực đại', 'Vận tốc bằng 0', 'Cơ năng bằng 0'], correctAnswer: 0, explanation: 'Ở vị trí thấp nhất, h=0 nên Wt=0, vận tốc lớn nhất nên Wđ cực đại.' },
      { id: 'p91_10', type: 'multiple_choice', question: 'Nhà máy thủy điện hoạt động dựa trên sự chuyển hóa cơ năng nào?', options: ['Thế năng của dòng nước trên cao thành động năng làm quay tuabin máy phát điện', 'Nhiệt năng thành điện năng', 'Hóa năng thành điện năng', 'Năng lượng hạt nhân'], correctAnswer: 0, explanation: 'Nước ở hồ trên đập cao có thế năng lớn xả xuống làm quay tuabin.' },
      { id: 'p91_11', type: 'multiple_choice', question: 'Khi ô tô phanh gấp dừng lại trên đường, toàn bộ động năng của xe đã chuyển hóa thành dạng năng lượng nào?', options: ['Nhiệt năng làm nóng lốp xe và mặt đường', 'Thế năng', 'Quang năng', 'Hóa năng của xăng'], correctAnswer: 0, explanation: 'Công của lực ma sát hãm biến toàn bộ động năng thành nhiệt lượng.' },
      { id: 'p91_12', type: 'multiple_choice', question: 'Một mũi tên được bắn đi từ cánh cung đang giương căng. Cơ năng của mũi tên ban đầu lấy từ dạng năng lượng nào?', options: ['Thế năng đàn hồi của cánh cung', 'Thế năng trọng trường', 'Nhiệt năng của dây cung', 'Hóa năng của gỗ'], correctAnswer: 0, explanation: 'Dây cung bị biến dạng đàn hồi tích trữ thế năng đàn hồi truyền cho mũi tên.' },
      { id: 'p91_13', type: 'multiple_choice', question: 'Nếu vận tốc của một vật tăng lên gấp đôi thì động năng của vật đó sẽ:', options: ['Tăng lên gấp 4 lần', 'Tăng lên gấp đôi', 'Không đổi', 'Giảm đi 2 lần'], correctAnswer: 0, explanation: 'Vì Wđ tỉ lệ với v², nên (2v)² = 4v² (tăng 4 lần).' },
      { id: 'p91_14', type: 'multiple_choice', question: 'Một vật rơi từ độ cao 20 m xuống đất không vận tốc đầu (lấy g = 10 m/s²). Bỏ qua ma sát không khí, vận tốc của vật khi chạm đất là:', options: ['20 m/s', '10 m/s', '40 m/s', '14.1 m/s'], correctAnswer: 0, explanation: 'v = √(2gh) = √(2 * 10 * 20) = √400 = 20 m/s.' },
      { id: 'p91_15', type: 'multiple_choice', question: 'Đơn vị của công cơ học và cơ năng là:', options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Pascal (Pa)'], correctAnswer: 0, explanation: 'Công và cơ năng đều đo bằng Joule (J).' },
      { id: 'p91_16', type: 'multiple_choice', question: 'Khi con lắc dao động trong không khí, biên độ dao động giảm dần rồi dừng hẳn là do:', options: ['Lực cản của không khí làm tiêu hao cơ năng biến thành nhiệt năng', 'Trọng lực biến mất', 'Khối lượng quả nặng giảm dần', 'Dây treo bị co lại'], correctAnswer: 0, explanation: 'Lực cản môi trường làm cơ năng hao tán thành nhiệt (dao động tắt dần).' },
      {
        id: 'p91_17',
        type: 'true_false',
        question: 'Về cơ năng, động năng và thế năng, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Cơ năng của một vật luôn luôn được bảo toàn trong mọi điều kiện kể cả khi có ma sát lớn.', isCorrect: false },
          { subId: 'b', text: 'Động năng tỉ lệ thuận với bình phương vận tốc của vật.', isCorrect: true },
          { subId: 'c', text: 'Khi vật chuyển động lên cao, thế năng tăng dần còn động năng giảm dần.', isCorrect: true },
          { subId: 'd', text: 'Một vật đứng yên trên đỉnh núi cao không có bất kì dạng năng lượng nào.', isCorrect: false }
        ]
      },
      {
        id: 'p91_18',
        type: 'short_answer',
        question: 'Một vật có khối lượng m = 4 kg chuyển động với vận tốc v = 5 m/s. Động năng của vật bằng bao nhiêu Joule (J)?',
        acceptableAnswers: ['50', '50J', '50 J'],
        unit: 'J',
        explanation: 'Wđ = (1/2) * m * v² = 0.5 * 4 * 25 = 50 J.'
      }
    ]
  },

  // ================= ĐỀ 2 - KHỐI 9 =================
  {
    id: 'exam-chem-9-01',
    title: 'Đề 2 - Hóa học 9: Kim loại và Dãy hoạt động hóa học',
    subject: 'chemistry',
    grade: 9,
    testNumber: 'TX2',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-02',
    questions: [
      { id: 'c92_1', type: 'multiple_choice', question: 'Kim loại nào sau đây có tính dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại?', options: ['Bạc (Ag)', 'Đồng (Cu)', 'Vàng (Au)', 'Nhôm (Al)'], correctAnswer: 0, explanation: 'Bạc dẫn điện và nhiệt tốt nhất, tiếp theo là đồng, vàng, nhôm, sắt.' },
      { id: 'c92_2', type: 'multiple_choice', question: 'Kim loại duy nhất ở thể lỏng ở nhiệt độ phòng (25°C) là:', options: ['Thủy ngân (Hg)', 'Chì (Pb)', 'Thiếc (Sn)', 'Brom (Br)'], correctAnswer: 0, explanation: 'Thủy ngân (Hg) nóng chảy ở -39°C nên ở thể lỏng ở nhiệt độ thường.' },
      { id: 'c92_3', type: 'multiple_choice', question: 'Kim loại nào nhẹ, bền, dẫn điện tốt và được dùng phổ biến làm vỏ máy bay và dây điện cao thế?', options: ['Nhôm (Al)', 'Sắt (Fe)', 'Đồng (Cu)', 'Chì (Pb)'], correctAnswer: 0, explanation: 'Nhôm có khối lượng riêng nhỏ (nhẹ) và màng oxit Al2O3 bảo vệ bề mặt.' },
      { id: 'c92_4', type: 'multiple_choice', question: 'Dãy hoạt động hóa học của kim loại được sắp xếp theo chiều nào sau đây?', options: ['K, Na, Ca, Mg, Al, Zn, Fe, Pb, (H), Cu, Ag, Au', 'Au, Ag, Cu, Fe, Zn, Al, Mg, Na, K', 'Fe, Cu, Al, Zn, Mg, Na, K, Au', 'Na, K, Mg, Al, Ca, Fe, Zn, Cu'], correctAnswer: 0, explanation: 'Thứ tự hoạt động giảm dần: Khi Nào Cần May Áo Giáp Sắt Nhớ Sang Phố Hỏi Cửa Hàng Á Phi Âu.' },
      { id: 'c92_5', type: 'multiple_choice', question: 'Kim loại nào sau đây phản ứng mãnh liệt với nước lạnh ở điều kiện thường giải phóng khí H2?', options: ['Natri (Na) và Kali (K)', 'Sắt (Fe)', 'Đồng (Cu)', 'Bạc (Ag)'], correctAnswer: 0, explanation: 'Kim loại kiềm (K, Na) tan và tác dụng mãnh liệt với nước lạnh.' },
      { id: 'c92_6', type: 'multiple_choice', question: 'Kim loại nào có thể đẩy được đồng (Cu) ra khỏi dung dịch muối CuSO4?', options: ['Sắt (Fe)', 'Bạc (Ag)', 'Vàng (Au)', 'Đồng (Cu)'], correctAnswer: 0, explanation: 'Fe đứng trước Cu trong dãy hoạt động: Fe + CuSO4 -> FeSO4 + Cu↓.' },
      { id: 'c92_7', type: 'multiple_choice', question: 'Kim loại nào đứng sau Hydro (H) trong dãy hoạt động và KHÔNG tác dụng với dung dịch acid HCl loãng?', options: ['Đồng (Cu)', 'Kẽm (Zn)', 'Sắt (Fe)', 'Nhôm (Al)'], correctAnswer: 0, explanation: 'Cu đứng sau H nên không đẩy được H ra khỏi acid HCl, H2SO4 loãng.' },
      { id: 'c92_8', type: 'multiple_choice', question: 'Gang và thép là hợp kim quan trọng của kim loại nào với carbon?', options: ['Sắt (Fe)', 'Đồng (Cu)', 'Nhôm (Al)', 'Chì (Pb)'], correctAnswer: 0, explanation: 'Gang (2-5% C) và thép (<2% C) là hợp kim của sắt.' },
      { id: 'c92_9', type: 'multiple_choice', question: 'Sự ăn mòn kim loại (rỉ sét sắt) xảy ra nhanh nhất trong môi trường nào?', options: ['Không khí ẩm có chứa muối hoặc acid (ven biển)', 'Trong dầu hỏa khô ráo', 'Trong chân không', 'Trong khí nitơ khô'], correctAnswer: 0, explanation: 'Nước, oxy và chất điện li (muối) xúc tác ăn mòn điện hóa cực nhanh.' },
      { id: 'c92_10', type: 'multiple_choice', question: 'Biện pháp nào sau đây giúp bảo vệ kim loại không bị ăn mòn rỉ sét?', options: ['Sơn phủ bề mặt, tra dầu mỡ hoặc mạ kim loại chống rỉ', 'Ngâm kim loại trong dung dịch muối ăn', 'Để kim loại ngoài trời mưa ẩm', 'Cọ xát bề mặt bằng giấy nhám rồi để ẩm'], correctAnswer: 0, explanation: 'Cách ly kim loại với môi trường ẩm bằng sơn, mỡ, mạ kẽm.' },
      { id: 'c92_11', type: 'multiple_choice', question: 'Để sản xuất nhôm trong công nghiệp, người ta dùng phương pháp nào từ quặng bauxite (Al2O3)?', options: ['Điện phân nóng chảy Al2O3 có pha cryolite', 'Nhiệt luyện dùng than cốc khử', 'Thủy luyện', 'Dùng khí H2 khử'], correctAnswer: 0, explanation: 'Điện phân nhôm oxit nóng chảy ở 950°C có cryolite hạ nhiệt độ nóng chảy.' },
      { id: 'c92_12', type: 'multiple_choice', question: 'Hiện tượng gì xảy ra khi nhúng một đinh sắt sạch vào ống nghiệm chứa dung dịch CuSO4 màu xanh lam?', options: ['Dung dịch nhạt màu dần và có lớp đồng màu đỏ bám trên đinh sắt', 'Không có hiện tượng gì', 'Đinh sắt tan hết biến mất ngay', 'Khí màu vàng bay lên'], correctAnswer: 0, explanation: 'Fe + CuSO4 -> FeSO4 (dung dịch nhạt màu) + Cu (màu đỏ bám trên đinh Fe).' },
      { id: 'c92_13', type: 'multiple_choice', question: 'Kim loại có độ cứng cao nhất trong tất cả các kim loại (có thể rạch được thủy tinh) là:', options: ['Crom (Cr)', 'Sắt (Fe)', 'Titan (Ti)', 'Vonfram (W)'], correctAnswer: 0, explanation: 'Crom (Cr) là kim loại cứng nhất (độ cứng 9/10 Mohs).' },
      { id: 'c92_14', type: 'multiple_choice', question: 'Kim loại có nhiệt độ nóng chảy cao nhất được dùng làm dây tóc bóng đèn sợi đốt là:', options: ['Vonfram (W, ~3422°C)', 'Sắt (Fe)', 'Đồng (Cu)', 'Nhôm (Al)'], correctAnswer: 0, explanation: 'Vonfram (Tungsten) chịu được nhiệt độ nóng sáng trên 3000°C mà không nóng chảy.' },
      { id: 'c92_15', type: 'multiple_choice', question: 'Nhôm tác dụng được với cả dung dịch acid và dung dịch kiềm mạnh (NaOH), chứng tỏ nhôm oxit Al2O3 có tính chất:', options: ['Lưỡng tính', 'Chỉ có tính acid', 'Chỉ có tính base', 'Trung tính'], correctAnswer: 0, explanation: 'Al2O3 và Al(OH)3 là hợp chất lưỡng tính tác dụng được với cả acid và base.' },
      { id: 'c92_16', type: 'multiple_choice', question: 'Dãy kim loại nào sau đây đều tan hoàn toàn trong dung dịch acid HCl loãng?', options: ['Mg, Al, Fe, Zn', 'Cu, Ag, Au, Pt', 'Fe, Cu, Ag, Zn', 'Al, Cu, Fe, Pb'], correctAnswer: 0, explanation: 'Tất cả các kim loại đứng trước H (Mg, Al, Fe, Zn) đều tác dụng với HCl loãng.' },
      {
        id: 'c92_17',
        type: 'true_false',
        question: 'Về kim loại và dãy hoạt động hóa học, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Kim loại đồng (Cu) có thể đẩy được sắt (Fe) ra khỏi dung dịch muối sắt.', isCorrect: false },
          { subId: 'b', text: 'Sắt bị rỉ sét nhanh chóng trong môi trường không khí ẩm có muối ăn.', isCorrect: true },
          { subId: 'c', text: 'Kim loại Na phản ứng mãnh liệt với nước sinh ra khí H2 và dung dịch kiềm NaOH.', isCorrect: true },
          { subId: 'd', text: 'Thủy ngân là kim loại có nhiệt độ nóng chảy cao nhất trong các kim loại.', isCorrect: false }
        ]
      },
      {
        id: 'c92_18',
        type: 'short_answer',
        question: 'Cho 5.6 g sắt tác dụng hoàn toàn với dung dịch CuSO4 dư. Khối lượng đồng (Cu, M = 64 g/mol) kim loại màu đỏ sinh ra bám vào đinh sắt là bao nhiêu gam?',
        acceptableAnswers: ['6.4', '6.4g', '6.4 g', '6,4'],
        unit: 'gam',
        explanation: 'n_Fe = 5.6 / 56 = 0.1 mol -> n_Cu = 0.1 mol -> m_Cu = 0.1 * 64 = 6.4 g.'
      }
    ]
  },

  // ================= ĐỀ 3 - KHỐI 9 =================
  {
    id: 'exam-bio-9-01',
    title: 'Đề 3 - Sinh học 9: Di truyền học Mendel, ADN và Nhiễm sắc thể',
    subject: 'biology',
    grade: 9,
    testNumber: 'TX3',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-03',
    questions: [
      { id: 'b93_1', type: 'multiple_choice', question: 'Đối tượng nghiên cứu di truyền học nổi tiếng mà Gregor Mendel sử dụng là:', options: ['Cây Đậu Hà Lan (Pisum sativum)', 'Ruồi giấm', 'Chuột bạch', 'Cây ngô'], correctAnswer: 0, explanation: 'Đậu Hà Lan tự thụ phấn nghiêm ngặt, có nhiều cặp tính trạng tương phản rõ rệt.' },
      { id: 'b93_2', type: 'multiple_choice', question: 'Quy luật phân li của Mendel khẳng định trong quá trình phát sinh giao tử, mỗi nhân tố di truyền trong cặp:', options: ['Phân li về một giao tử và giữ nguyên bản chất như ở cơ thể thuần chủng', 'Hòa lẫn vào nhau biến đổi', 'Tự nhân đôi thành hai cặp', 'Bị tiêu biến'], correctAnswer: 0, explanation: 'Quy luật phân li: mỗi giao tử chỉ chứa 1 alen trong cặp alen.' },
      { id: 'b93_3', type: 'multiple_choice', question: 'Khi lai hai cơ thể bố mẹ thuần chủng khác nhau về một cặp tính trạng tương phản (AA x aa), ở thế hệ F1 thu được:', options: ['100% mang kiểu hình trội (Aa)', '50% trội : 50% lặn', '75% trội : 25% lặn', '100% mang kiểu hình lặn'], correctAnswer: 0, explanation: 'F1 đồng tính mang tính trạng trội (kiểu gen Aa).' },
      { id: 'b93_4', type: 'multiple_choice', question: 'Khi cho F1 tự thụ phấn (Aa x Aa), tỉ lệ phân li kiểu hình ở F2 theo quy luật phân li là:', options: ['3 Trội : 1 Lặn', '1 Trội : 1 Lặn', '9 : 3 : 3 : 1', '100% Trội'], correctAnswer: 0, explanation: 'F2 có tỉ lệ kiểu gen 1 AA : 2 Aa : 1 aa tương ứng 3 trội : 1 lặn.' },
      { id: 'b93_5', type: 'multiple_choice', question: 'Phép lai phân tích là phép lai giữa cá thể mang kiểu hình trội cần xác định kiểu gen với:', options: ['Cá thể mang kiểu hình lặn (đồng hợp lặn aa)', 'Cá thể mang kiểu hình trội thuần chủng (AA)', 'Cá thể dị hợp (Aa)', 'Chính nó'], correctAnswer: 0, explanation: 'Lai phân tích kiểm tra kiểu gen của cá thể trội (nếu phân li 1:1 thì dị hợp, đồng tính thì thuần chủng).' },
      { id: 'b93_6', type: 'multiple_choice', question: 'Phân tử ADN (Axit đeoxiribonucleic) được cấu tạo theo nguyên tắc đa phân mà các đơn phân là:', options: ['4 loại nucleotide: A, T, G, C', 'Các axit amin', 'Các phân tử đường glucose', 'Axit béo'], correctAnswer: 0, explanation: 'Đơn phân của ADN là 4 loại nucleotide: Adenine, Thymine, Guanine, Cytosine.' },
      { id: 'b93_7', type: 'multiple_choice', question: 'Theo nguyên tắc bổ sung trên phân tử ADN mạch kép, các bazơ liên kết với nhau bằng liên kết hydro theo cặp nào?', options: ['A liên kết với T (2 liên kết hydro), G liên kết với C (3 liên kết hydro)', 'A liên kết với G, T liên kết với C', 'A liên kết với C, T liên kết với G', 'A liên kết với U'], correctAnswer: 0, explanation: 'Nguyên tắc bổ sung: A - T, G - C.' },
      { id: 'b93_8', type: 'multiple_choice', question: 'Quá trình tự nhân đôi của ADN diễn ra theo hai nguyên tắc cơ bản nào?', options: ['Nguyên tắc bổ sung và nguyên tắc bán bảo toàn (giữ lại một nửa)', 'Nguyên tắc bảo toàn tuyệt đối', 'Nguyên tắc ngẫu nhiên', 'Nguyên tắc một chiều duy nhất'], correctAnswer: 0, explanation: 'Nhân đôi ADN tuân thủ nguyên tắc bổ sung và bán bảo toàn (mỗi ADN con giữ 1 mạch cũ).' },
      { id: 'b93_9', type: 'multiple_choice', question: 'Gen là một đoạn của phân tử ADN mang thông tin mã hóa cho:', options: ['Một sản phẩm xác định (chuỗi polypeptide hoặc phân tử ARN)', 'Toàn bộ cơ thể sinh vật', 'Một tế bào', 'Một cơ quan'], correctAnswer: 0, explanation: 'Gen là đơn vị chức năng di truyền mã hóa phân tử protein hoặc ARN.' },
      { id: 'b93_10', type: 'multiple_choice', question: 'Phân tử ARN khác với ADN ở đặc điểm nào sau đây?', options: ['Thường có cấu trúc mạch đơn và chứa nucleotide loại U (Uracil) thay cho T', 'Có cấu trúc mạch xoắn kép', 'Chứa đường đeoxiribozo', 'Kích thước lớn hơn ADN rất nhiều'], correctAnswer: 0, explanation: 'ARN là mạch đơn, bazơ nitơ là A, U, G, C.' },
      { id: 'b93_11', type: 'multiple_choice', question: 'Mối quan hệ biểu hiện thông tin di truyền từ nhân tế bào ra tế bào chất tuân theo sơ đồ:', options: ['ADN (gen) → mARN → Chuỗi polypeptide (Protein) → Tính trạng', 'Protein → ADN → ARN → Tính trạng', 'mARN → ADN → Tính trạng', 'Tính trạng → Protein → ADN'], correctAnswer: 0, explanation: 'Mô hình trung tâm: ADN phiên mã ra mARN, mARN dịch mã tạo protein biểu hiện thành tính trạng.' },
      { id: 'b93_12', type: 'multiple_choice', question: 'Bộ nhiễm sắc thể lưỡng bội đặc trưng của loài người (2n) gồm bao nhiêu chiếc nhiễm sắc thể?', options: ['46 chiếc (23 cặp)', '48 chiếc', '23 chiếc', '44 chiếc'], correctAnswer: 0, explanation: 'Ở người 2n = 46 (22 cặp NST thường và 1 cặp NST giới tính).' },
      { id: 'b93_13', type: 'multiple_choice', question: 'Cặp nhiễm sắc thể giới tính ở người phụ nữ bình thường và người nam bình thường lần lượt là:', options: ['XX ở nữ và XY ở nam', 'XY ở nữ và XX ở nam', 'XX ở cả nam và nữ', 'YY ở nam và XX ở nữ'], correctAnswer: 0, explanation: 'Nữ giới có cặp NST giới tính tương đồng XX, nam giới dị hình XY.' },
      { id: 'b93_14', type: 'multiple_choice', question: 'Quá trình nguyên phân từ một tế bào mẹ (2n) tạo ra bao nhiêu tế bào con có bộ NST như thế nào?', options: ['2 tế bào con mang bộ NST lưỡng bội (2n) giống hệt tế bào mẹ', '4 tế bào con mang bộ NST đơn bội (n)', '2 tế bào con mang bộ NST đơn bội (n)', '1 tế bào con mang 4n'], correctAnswer: 0, explanation: 'Nguyên phân giữ nguyên bộ NST 2n, tạo 2 tế bào con.' },
      { id: 'b93_15', type: 'multiple_choice', question: 'Quá trình giảm phân tạo giao tử từ một tế bào mẹ (2n) tạo ra bao nhiêu giao tử có bộ NST thế nào?', options: ['4 tế bào con mang bộ NST đơn bội giảm đi một nửa (n)', '2 tế bào con mang 2n', '4 tế bào con mang 2n', '1 tế bào con mang 2n'], correctAnswer: 0, explanation: 'Giảm phân trải qua 2 lần phân bào liên tiếp, giảm bộ NST từ 2n xuống n.' },
      { id: 'b93_16', type: 'multiple_choice', question: 'Trên một mạch đơn của phân tử ADN có trình tự: - A - T - G - C - A - T -. Trình tự mạch bổ sung với nó là:', options: ['- T - A - C - G - T - A -', '- A - T - G - C - A - T -', '- U - A - C - G - U - A -', '- C - G - T - A - C - G -'], correctAnswer: 0, explanation: 'A liên kết T, T liên kết A, G liên kết C, C liên kết G.' },
      {
        id: 'b93_17',
        type: 'true_false',
        question: 'Về quy luật di truyền và cấu trúc ADN, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Theo nguyên tắc bổ sung trong phân tử ADN mạch kép, số lượng nucleotide loại A luôn bằng số nucleotide loại T (A = T).', isCorrect: true },
          { subId: 'b', text: 'Quá trình giảm phân tạo ra các giao tử có bộ nhiễm sắc thể giữ nguyên vẹn 2n.', isCorrect: false },
          { subId: 'c', text: 'Cặp nhiễm sắc thể giới tính của người nam là XY và người nữ là XX.', isCorrect: true },
          { subId: 'd', text: 'Phân tử ARN có cấu trúc xoắn kép hai mạch giống hệt ADN.', isCorrect: false }
        ]
      },
      {
        id: 'b93_18',
        type: 'short_answer',
        question: 'Bộ nhiễm sắc thể lưỡng bội (2n) trong tế bào sinh dưỡng bình thường của người có bao nhiêu chiếc nhiễm sắc thể?',
        acceptableAnswers: ['46', '46 chiếc', '46 nst', '46NST'],
        unit: 'chiếc',
        explanation: 'Bộ NST lưỡng bội của người là 2n = 46 chiếc.'
      }
    ]
  },

  // ================= ĐỀ 4 - KHỐI 9 =================
  {
    id: 'exam-phy-9-04',
    title: 'Đề 4 - Vật lí 9: Hiện tượng khúc xạ ánh sáng và Thấu kính hội tụ',
    subject: 'physics',
    grade: 9,
    testNumber: 'TX4',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-04',
    questions: [
      { id: 'p94_1', type: 'multiple_choice', question: 'Hiện tượng khúc xạ ánh sáng là hiện tượng tia sáng truyền từ môi trường trong suốt này sang môi trường trong suốt khác bị:', options: ['Gãy khúc tại mặt phân cách giữa hai môi trường', 'Phản xạ quay ngược lại môi trường cũ', 'Hấp thụ hoàn toàn thành nhiệt', 'Phát tán thành bảy sắc cầu vồng'], correctAnswer: 0, explanation: 'Khúc xạ là sự đổi hướng truyền (gãy khúc) của ánh sáng qua mặt phân cách.' },
      { id: 'p94_2', type: 'multiple_choice', question: 'Khi tia sáng truyền từ không khí vào nước với góc tới i > 0, mối quan hệ giữa góc khúc xạ r và góc tới i là:', options: ['Góc khúc xạ nhỏ hơn góc tới (r < i)', 'Góc khúc xạ lớn hơn góc tới (r > i)', 'Góc khúc xạ bằng góc tới (r = i)', 'Tổng hai góc luôn bằng 90°'], correctAnswer: 0, explanation: 'Nước chiết quang hơn không khí nên tia sáng bị bẻ cong lại gần pháp tuyến (r < i).' },
      { id: 'p94_3', type: 'multiple_choice', question: 'Khi nhìn một chiếc đũa cắm nghiêng trong cốc nước trong suốt, ta thấy chiếc đũa dường như bị gãy khúc tại mặt nước là do:', options: ['Hiện tượng khúc xạ ánh sáng truyền từ nước ra không khí', 'Hiện tượng phản xạ toàn phần', 'Đũa bị nước làm mềm đi', 'Hiện tượng tán sắc ánh sáng'], correctAnswer: 0, explanation: 'Tia sáng từ phần đũa trong nước bị khúc xạ tại mặt phân cách nước - không khí.' },
      { id: 'p94_4', type: 'multiple_choice', question: 'Thấu kính hội tụ có đặc điểm hình học nhận dạng là:', options: ['Phần rìa mỏng hơn phần giữa (rìa mỏng)', 'Phần rìa dày hơn phần giữa (rìa dày)', 'Có hai mặt phẳng song song', 'Có dạng hình cầu lõm'], correctAnswer: 0, explanation: 'Thấu kính hội tụ có phần rìa mỏng hơn phần tâm giữa.' },
      { id: 'p94_5', type: 'multiple_choice', question: 'Chùm tia sáng song song với trục chính của thấu kính hội tụ sau khi đi qua thấu kính sẽ:', options: ['Hội tụ tại tiêu điểm chính (F) của thấu kính', 'Phân kì loe rộng ra', 'Tiếp tục truyền thẳng song song', 'Phản xạ ngược trở lại'], correctAnswer: 0, explanation: 'Tia tới song song trục chính cho tia ló đi qua tiêu điểm.' },
      { id: 'p94_6', type: 'multiple_choice', question: 'Tia sáng đi qua quang tâm (O) của bất kì thấu kính nào sẽ:', options: ['Truyền thẳng không đổi hướng', 'Bị gãy khúc một góc 90°', 'Đi qua tiêu điểm F', 'Quay ngược trở lại'], correctAnswer: 0, explanation: 'Tia sáng qua quang tâm O luôn truyền thẳng.' },
      { id: 'p94_7', type: 'multiple_choice', question: 'Một vật đặt ngoài khoảng tiêu cự của thấu kính hội tụ (d > f) sẽ cho ảnh có đặc điểm:', options: ['Ảnh thật, ngược chiều với vật', 'Ảnh ảo, cùng chiều với vật', 'Ảnh ảo, nhỏ hơn vật', 'Không bao giờ có ảnh'], correctAnswer: 0, explanation: 'Khi d > f qua thấu kính hội tụ luôn cho ảnh thật ngược chiều.' },
      { id: 'p94_8', type: 'multiple_choice', question: 'Một vật đặt rất gần thấu kính hội tụ, bên trong khoảng tiêu cự (d < f) sẽ cho ảnh:', options: ['Ảnh ảo, cùng chiều và lớn hơn vật (kính lúp)', 'Ảnh thật, ngược chiều và nhỏ hơn vật', 'Ảnh thật bằng vật', 'Vật bị biến mất'], correctAnswer: 0, explanation: 'Khi d < f, thấu kính hội tụ đóng vai trò kính lúp tạo ảnh ảo phóng đại cùng chiều.' },
      { id: 'p94_9', type: 'multiple_choice', question: 'Kính lúp là một thấu kính hội tụ có tiêu cự f như thế nào?', options: ['Có tiêu cự ngắn (thường vài centimet)', 'Có tiêu cự rất dài (hàng mét)', 'Có tiêu cự âm', 'Không có tiêu điểm'], correctAnswer: 0, explanation: 'Kính lúp có tiêu cự ngắn giúp quan sát các chi tiết nhỏ.' },
      { id: 'p94_10', type: 'multiple_choice', question: 'Máy ảnh kĩ thuật số có ống kính tương đương với loại quang cụ nào?', options: ['Một thấu kính hội tụ tạo ảnh thật nhỏ hơn vật trên cảm biến', 'Một gương phẳng', 'Một thấu kính phân kì', 'Một lăng kính tam giác'], correctAnswer: 0, explanation: 'Ống kính máy ảnh tạo ảnh thật ngược chiều, thu nhỏ trên phim / cảm biến.' },
      { id: 'p94_11', type: 'multiple_choice', question: 'Thấu kính phân kì có đặc điểm hình học là:', options: ['Phần rìa dày hơn phần giữa (rìa dày)', 'Phần rìa mỏng hơn phần giữa', 'Mặt phẳng nhẵn', 'Dạng hình trụ'], correctAnswer: 0, explanation: 'Thấu kính phân kì có phần mép rìa dày hơn phần tâm.' },
      { id: 'p94_12', type: 'multiple_choice', question: 'Ảnh của một vật tạo bởi thấu kính phân kì luôn có tính chất nào sau đây?', options: ['Luôn là ảnh ảo, cùng chiều và nhỏ hơn vật', 'Luôn là ảnh thật, ngược chiều', 'Là ảnh ảo lớn hơn vật', 'Là ảnh thật bằng vật'], correctAnswer: 0, explanation: 'Thấu kính phân kì luôn tạo ảnh ảo cùng chiều, nhỏ hơn vật nằm trong khoảng tiêu cự.' },
      { id: 'p94_13', type: 'multiple_choice', question: 'Một thấu kính hội tụ có tiêu cự f = 10 cm. Điểm 2F cách quang tâm O một khoảng bằng:', options: ['20 cm', '10 cm', '5 cm', '15 cm'], correctAnswer: 0, explanation: 'Khoảng cách 2F = 2 * f = 2 * 10 = 20 cm.' },
      { id: 'p94_14', type: 'multiple_choice', question: 'Khi đặt vật tại đúng vị trí d = 2f của thấu kính hội tụ, ảnh thu được là:', options: ['Ảnh thật, ngược chiều và có kích thước bằng đúng vật', 'Ảnh thật lớn hơn vật', 'Ảnh ảo nhỏ hơn vật', 'Ảnh ở vô cực'], correctAnswer: 0, explanation: 'Tại d = 2f thì d\' = 2f, ảnh thật bằng vật.' },
      { id: 'p94_15', type: 'multiple_choice', question: 'Công thức thấu kính xác định vị trí vật d, ảnh d\' và tiêu cự f là:', options: ['1/f = 1/d + 1/d\'', 'f = d + d\'', '1/f = 1/d - 1/d\'', 'f = d . d\''], correctAnswer: 0, explanation: 'Công thức thấu kính chuẩn 1/f = 1/d + 1/d\'.' },
      { id: 'p94_16', type: 'multiple_choice', question: 'Mắt viễn thị (thường gặp ở người già) nhìn gần bị mờ. Để sửa tật viễn thị cần đeo kính gì?', options: ['Kính hội tụ', 'Kính phân kì', 'Kính râm tối màu', 'Kính phẳng'], correctAnswer: 0, explanation: 'Mắt viễn thị có tiêu cự quá dài nên cần thấu kính hội tụ tăng độ tụ kéo ảnh lại gần.' },
      {
        id: 'p94_17',
        type: 'true_false',
        question: 'Về khúc xạ ánh sáng và thấu kính, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Tia sáng truyền vuông góc với mặt phân cách hai môi trường sẽ truyền thẳng không bị gãy khúc.', isCorrect: true },
          { subId: 'b', text: 'Thấu kính hội tụ có phần rìa dày hơn phần giữa.', isCorrect: false },
          { subId: 'c', text: 'Kính lúp dùng thấu kính hội tụ có tiêu cự ngắn để tạo ảnh ảo cùng chiều phóng đại.', isCorrect: true },
          { subId: 'd', text: 'Thấu kính phân kì có thể tạo ra ảnh thật hứng được trên màn chắn.', isCorrect: false }
        ]
      },
      {
        id: 'p94_18',
        type: 'short_answer',
        question: 'Một thấu kính hội tụ có tiêu cự f = 15 cm. Khoảng cách giữa tiêu điểm F và tiêu điểm F\' nằm ở hai phía quang tâm O bằng bao nhiêu centimét (cm)?',
        acceptableAnswers: ['30', '30cm', '30 cm'],
        unit: 'cm',
        explanation: 'F và F\' đối xứng qua O nên khoảng cách FF\' = 2 * f = 2 * 15 = 30 cm.'
      }
    ]
  },

  // ================= ĐỀ 5 - KHỐI 9 =================
  {
    id: 'exam-chem-9-05',
    title: 'Đề 5 - Hóa học 9: Phi kim, Sơ lược bảng tuần hoàn và Hợp chất Carbon',
    subject: 'chemistry',
    grade: 9,
    testNumber: 'TX5',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-05',
    questions: [
      { id: 'c95_1', type: 'multiple_choice', question: 'Phi kim ở thể lỏng ở điều kiện thường là nguyên tố nào?', options: ['Brom (Br2)', 'Clo (Cl2)', 'Iot (I2)', 'Lưu huỳnh (S)'], correctAnswer: 0, explanation: 'Brom (Br2) là phi kim duy nhất ở thể lỏng màu nâu đỏ.' },
      { id: 'c95_2', type: 'multiple_choice', question: 'Khí clo (Cl2) có màu sắc và mùi đặc trưng nào?', options: ['Khí màu vàng lục, mùi hắc độc hại', 'Khí không màu, không mùi', 'Khí màu nâu đỏ', 'Khí màu tím'], correctAnswer: 0, explanation: 'Clo là khí màu vàng lục, mùi xốc hắc, rất độc hại.' },
      { id: 'c95_3', type: 'multiple_choice', question: 'Nước Gia-ven dùng để tẩy trắng quần áo và sát trùng được điều chế bằng cách cho clo tác dụng với dung dịch nào?', options: ['Dung dịch NaOH ở nhiệt độ thường', 'Dung dịch HCl', 'Dung dịch H2SO4', 'Nước vôi tôi'], correctAnswer: 0, explanation: 'Cl2 + 2NaOH -> NaCl + NaClO (nước Javel) + H2O.' },
      { id: 'c95_4', type: 'multiple_choice', question: 'Các dạng thù hình phổ biến của nguyên tố Carbon trong tự nhiên gồm:', options: ['Kim cương, than chì (graphite) và carbon vô định hình (than củi, than hoạt tính)', 'Chỉ có kim cương', 'Than đá và dầu mỏ', 'Cát và thủy tinh'], correctAnswer: 0, explanation: 'Kim cương (cực cứng), than chì (mềm dẫn điện) là thù hình của C.' },
      { id: 'c95_5', type: 'multiple_choice', question: 'Than hoạt tính có tính chất đặc biệt nào được ứng dụng trong lõi lọc nước và mặt nạ phòng độc?', options: ['Tính hấp phụ màu, mùi và các khí độc hại trên bề mặt xốp', 'Tính dẫn điện cao', 'Khả năng nổ sáng', 'Tính hòa tan trong nước'], correctAnswer: 0, explanation: 'Cấu trúc mao quản xốp giúp than hoạt tính hấp phụ độc tố cực mạnh.' },
      { id: 'c95_6', type: 'multiple_choice', question: 'Khí carbon monoxide (CO) là khí cực độc vì lý do nào sau đây?', options: ['Kết hợp chặt chẽ với hemoglobin trong máu làm máu mất khả năng vận chuyển oxy', 'Làm bỏng niêm mạc ngoài da', 'Phá hủy xương khớp', 'Làm đông đặc dịch tiêu hóa'], correctAnswer: 0, explanation: 'CO tạo carboxyhemoglobin bền vững ngăn O2 đến các mô gây ngạt thở tử vong.' },
      { id: 'c95_7', type: 'multiple_choice', question: 'Khí carbon dioxide (CO2) được ứng dụng trong bình chữa cháy xách tay vì:', options: ['Nặng hơn không khí và không duy trì sự cháy', 'Nhẹ hơn không khí', 'Có tính nổ mạnh', 'Tác dụng mãnh liệt với xăng dầu'], correctAnswer: 0, explanation: 'CO2 làm ngạt ngọn lửa bằng cách phủ lên bề mặt cách ly với oxy.' },
      { id: 'c95_8', type: 'multiple_choice', question: 'Đá vôi có thành phần hóa học chính là hợp chất nào?', options: ['CaCO3 (Calcium carbonate)', 'CaO', 'Ca(OH)2', 'CaSO4'], correctAnswer: 0, explanation: 'Đá vôi, đá cẩm thạch, vỏ sò ốc có thành phần chính là CaCO3.' },
      { id: 'c95_9', type: 'multiple_choice', question: 'Khi nung nóng đá vôi ở nhiệt độ cao khoảng 900 - 1000°C thu được vôi sống (CaO) và khí nào?', options: ['Khí CO2', 'Khí O2', 'Khí CO', 'Khí SO2'], correctAnswer: 0, explanation: 'CaCO3 -(t°)-> CaO + CO2↑.' },
      { id: 'c95_10', type: 'multiple_choice', question: 'Thành phần chính của cát trắng tự nhiên và thủy tinh thông thường là hợp chất:', options: ['SiO2 (Silic đioxit)', 'CaCO3', 'Al2O3', 'Fe2O3'], correctAnswer: 0, explanation: 'SiO2 là nguyên liệu chính trong công nghiệp sản xuất thủy tinh, gốm sứ.' },
      { id: 'c95_11', type: 'multiple_choice', question: 'Trong Bảng tuần hoàn, tính phi kim của các nguyên tố trong cùng một chu kì từ trái sang phải biến đổi thế nào?', options: ['Tăng dần', 'Giảm dần', 'Không thay đổi', 'Biến đổi không quy luật'], correctAnswer: 0, explanation: 'Trong chu kì từ trái sang phải, bán kính nguyên tử giảm, tính phi kim tăng dần.' },
      { id: 'c95_12', type: 'multiple_choice', question: 'Nguyên tố phi kim có tính phi kim hoạt động mạnh nhất trong toàn bộ Bảng tuần hoàn là:', options: ['Fluorine (F)', 'Chlorine (Cl)', 'Oxygen (O)', 'Nitrogen (N)'], correctAnswer: 0, explanation: 'Fluorine (F) có độ âm điện lớn nhất, tính phi kim mạnh nhất.' },
      { id: 'c95_13', type: 'multiple_choice', question: 'Muối NaHCO3 (Natri hidrocacbonat hay baking soda) được ứng dụng trong đời sống để:', options: ['Làm bột nở làm bánh mì và thuốc đau dạ dày', 'Làm xà phòng tẩy rửa mạnh', 'Làm phân bón đạm', 'Làm xi măng xây nhà'], correctAnswer: 0, explanation: 'Baking soda sinh khí CO2 xốp bánh và trung hòa acid dịch vị dạ dày.' },
      { id: 'c95_14', type: 'multiple_choice', question: 'Khí carbonic (CO2) làm đục dung dịch nước vôi trong Ca(OH)2 do tạo thành chất kết tủa trắng nào?', options: ['CaCO3', 'Ca(HCO3)2', 'CaO', 'CaCl2'], correctAnswer: 0, explanation: 'CO2 + Ca(OH)2 -> CaCO3↓ trắng + H2O.' },
      { id: 'c95_15', type: 'multiple_choice', question: 'Đốt than củi trong phòng kín sưởi ấm vào mùa đông dễ gây tử vong do tích tụ khí độc nào?', options: ['Khí CO (Carbon monoxide)', 'Khí N2', 'Khí O2', 'Khí H2'], correctAnswer: 0, explanation: 'Thiếu oxy tạo lượng lớn khí CO độc không màu không mùi gây hôn mê sâu.' },
      { id: 'c95_16', type: 'multiple_choice', question: 'Silicon (Si) là chất bán dẫn quan trọng được ứng dụng rộng rãi nhất trong lĩnh vực nào?', options: ['Sản xuất vi mạch chip điện tử và pin mặt trời', 'Làm thuốc chữa bệnh', 'Làm chất đốt lò cao', 'Làm đồ trang sức'], correctAnswer: 0, explanation: 'Si là nền tảng của toàn bộ ngành công nghiệp bán dẫn và máy tính hiện đại.' },
      {
        id: 'c95_17',
        type: 'true_false',
        question: 'Về phi kim và các hợp chất của carbon, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Khí CO là khí độc, không màu, không mùi có thể gây tử vong nhanh chóng khi hít phải.', isCorrect: true },
          { subId: 'b', text: 'Kim cương và than chì là hai dạng thù hình của cùng nguyên tố Carbon.', isCorrect: true },
          { subId: 'c', text: 'Khí CO2 là khí duy trì sự cháy mãnh liệt hơn cả khí Oxy.', isCorrect: false },
          { subId: 'd', text: 'Baking soda NaHCO3 được sử dụng làm bột nở trong làm bánh ngọt.', isCorrect: true }
        ]
      },
      {
        id: 'c95_18',
        type: 'short_answer',
        question: 'Khi nung hoàn toàn 100 g đá vôi CaCO3 (M = 100 g/mol) thu được vôi sống CaO (M = 56 g/mol). Khối lượng vôi sống CaO thu được tối đa bằng bao nhiêu gam?',
        acceptableAnswers: ['56', '56g', '56 g'],
        unit: 'gam',
        explanation: 'n_CaCO3 = 100 / 100 = 1 mol -> m_CaO = 1 * 56 = 56 g.'
      }
    ]
  },

  // ================= ĐỀ 6 - KHỐI 9 =================
  {
    id: 'exam-bio-9-06',
    title: 'Đề 6 - Sinh học 9: Biến dị, Đột biến gen, Đột biến NST và Di truyền học người',
    subject: 'biology',
    grade: 9,
    testNumber: 'TX6',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-06',
    questions: [
      { id: 'b96_1', type: 'multiple_choice', question: 'Đột biến gen là những biến đổi xảy ra trong cấu trúc của gen, liên quan đến:', options: ['Một hoặc một số cặp nucleotide', 'Toàn bộ nhiễm sắc thể', 'Số lượng tế bào cơ thể', 'Cấu trúc màng tế bào'], correctAnswer: 0, explanation: 'Đột biến gen là biến đổi cấu trúc gen tại 1 hoặc vài cặp nucleotide.' },
      { id: 'b96_2', type: 'multiple_choice', question: 'Các dạng đột biến điểm thường gặp ở gen bao gồm:', options: ['Mất, thêm hoặc thay thế một cặp nucleotide', 'Đảo đoạn, chuyển đoạn NST', 'Lặp đoạn NST', 'Tự đa bội'], correctAnswer: 0, explanation: 'Đột biến điểm gồm mất 1 cặp, thêm 1 cặp hoặc thay thế 1 cặp nucleotit.' },
      { id: 'b96_3', type: 'multiple_choice', question: 'Đột biến cấu trúc nhiễm sắc thể gồm các dạng nào sau đây?', options: ['Mất đoạn, lặp đoạn, đảo đoạn và chuyển đoạn', 'Thêm một nucleotit', 'Tứ bội thể 4n', 'Thể ba 2n+1'], correctAnswer: 0, explanation: 'Các dạng đột biến cấu trúc NST làm thay đổi trật tự hoặc số lượng gen trên NST.' },
      { id: 'b96_4', type: 'multiple_choice', question: 'Bệnh nhân mắc Hội chứng Down ở người có bộ nhiễm sắc thể đặc trưng nào?', options: ['Có 3 nhiễm sắc thể số 21 (thể ba cặp 21, 2n + 1 = 47 chiếc)', 'Có 3 chiếc NST giới tính XXX', 'Chỉ có 1 chiếc NST X (XO)', 'Thừa một NST số 1'], correctAnswer: 0, explanation: 'Hội chứng Down do thừa 1 NST ở cặp số 21 (trisomy 21).' },
      { id: 'b96_5', type: 'multiple_choice', question: 'Hội chứng Turner ở nữ giới có đặc điểm bộ nhiễm sắc thể giới tính là:', options: ['Chỉ có 1 NST X (cặp giới tính dạng XO, 2n - 1 = 45 chiếc)', 'Có 3 NST X (XXX)', 'Có dạng XXY (Klinefelter)', 'Có dạng XYY'], correctAnswer: 0, explanation: 'Hội chứng Turner là thể một nhiễm sắc thể X (XO).' },
      { id: 'b96_6', type: 'multiple_choice', question: 'Thường biến là những biến đổi ở kiểu hình của cùng một kiểu gen phát sinh do:', options: ['Ảnh hưởng trực tiếp của môi trường sống, không di truyền được', 'Đột biến trong nhân tế bào', 'Sự tổ hợp lại các alen của bố mẹ', 'Chất phóng xạ làm hỏng ADN'], correctAnswer: 0, explanation: 'Thường biến là biến dị không di truyền do môi trường tạo nên.' },
      { id: 'b96_7', type: 'multiple_choice', question: 'Hiện tượng lá cây rau mác mọc trên cạn có hình mũi mác, chìm trong nước có hình dải dài là ví dụ của:', options: ['Thường biến (mức phản ứng thích nghi mềm dẻo kiểu hình)', 'Đột biến gen', 'Đột biến NST', 'Thoái hóa giống'], correctAnswer: 0, explanation: 'Cùng kiểu gen nhưng môi trường nước/cạn tạo kiểu hình thích nghi khác nhau.' },
      { id: 'b96_8', type: 'multiple_choice', question: 'Mức phản ứng của một kiểu gen là gì?', options: ['Tập hợp các kiểu hình khác nhau của cùng một kiểu gen tương ứng với các môi trường khác nhau', 'Khả năng chịu đựng thuốc trừ sâu', 'Tốc độ sinh sản của loài', 'Số lượng alen của gen'], correctAnswer: 0, explanation: 'Mức phản ứng do kiểu gen quy định, có giới hạn biến đổi kiểu hình.' },
      { id: 'b96_9', type: 'multiple_choice', question: 'Tại sao Luật Hôn nhân và Gia đình Việt Nam cấm kết hôn giữa những người có quan hệ huyết thống trong phạm vi 3 đời?', options: ['Vì làm tăng xác suất các gen lặn có hại gặp nhau ở trạng thái đồng hợp gây dị tật bẩm sinh', 'Để tránh trùng tên họ', 'Vì giảm số lượng con non', 'Để bảo vệ kinh tế'], correctAnswer: 0, explanation: 'Hôn nhân cận huyết làm tăng tỷ lệ biểu hiện bệnh tật di truyền do gen lặn có hại.' },
      { id: 'b96_10', type: 'multiple_choice', question: 'Bệnh mù màu (đỏ - xanh lục) và bệnh máu khó đông ở người do gen lặn nằm trên nhiễm sắc thể nào quy định?', options: ['Nhiễm sắc thể giới tính X (không có alen tương ứng trên Y)', 'Nhiễm sắc thể giới tính Y', 'Nhiễm sắc thể thường số 1', 'Nhiễm sắc thể thường số 21'], correctAnswer: 0, explanation: 'Gen lặn trên NST X biểu hiện nhiều hơn ở nam giới (XY).' },
      { id: 'b96_11', type: 'multiple_choice', question: 'Phương pháp nghiên cứu phả hệ ở người có mục đích gì?', options: ['Theo dõi sự di truyền của một tính trạng hay bệnh tật qua nhiều thế hệ gia đình', 'Kiểm tra nhóm máu', 'Đo chỉ số IQ', 'Tìm nguồn gốc tổ tiên địa lý'], correctAnswer: 0, explanation: 'Phả hệ giúp xác định gen quy định tính trạng là trội hay lặn, liên kết hay thường.' },
      { id: 'b96_12', type: 'multiple_choice', question: 'Tác nhân nào sau đây có thể gây đột biến gen và đột biến nhiễm sắc thể ở sinh vật?', options: ['Tia phóng xạ, tia tử ngoại UV, hóa chất độc hại (Dioxin) và virus', 'Nước khoáng tinh khiết', 'Ánh sáng đèn huỳnh quang yếu', 'Tập thể dục hàng ngày'], correctAnswer: 0, explanation: 'Tác nhân vật lý (phóng xạ, UV), hóa học (Dioxin), sinh học (virus).' },
      { id: 'b96_13', type: 'multiple_choice', question: 'Hiện tượng ưu thế lai biểu hiện rõ rệt nhất ở thế hệ lai nào?', options: ['Thế hệ F1 (dị hợp tử nhiều cặp gen)', 'Thế hệ F2', 'Thế hệ F3', 'Sau nhiều đời tự thụ phấn'], correctAnswer: 0, explanation: 'F1 tập trung nhiều gen trội có lợi ở trạng thái dị hợp tử (ưu thế lai cao nhất).' },
      { id: 'b96_14', type: 'multiple_choice', question: 'Tại sao người ta không dùng con lai F1 có ưu thế lai cao để làm giống cho vụ mùa sau?', options: ['Vì ở F2 xảy ra hiện tượng phân tính làm giảm năng suất và thoái hóa giống', 'Vì F1 không có khả năng sinh sản', 'Vì hạt giống F1 quá đắt', 'Vì hạt F1 bị lép hoàn toàn'], correctAnswer: 0, explanation: 'Đời F2 phân li tái xuất hiện đồng hợp lặn có hại gây thoái hóa.' },
      { id: 'b96_15', type: 'multiple_choice', question: 'Đột biến đa bội (như tam bội 3n, tứ bội 4n) thường có đặc điểm hình thái nào ở thực vật?', options: ['Cơ quan sinh dưỡng to, quả to, sức chống chịu tốt và thường không có hạt (ở 3n)', 'Cây còi cọc nhanh chết', 'Lá cây bị rụng hết', 'Hoa biến thành gai nhọn'], correctAnswer: 0, explanation: 'Cây đa bội tế bào to, dưa hấu 3n không hạt, nho 4n quả to ngọt.' },
      { id: 'b96_16', type: 'multiple_choice', question: 'Bệnh bạch tạng ở người do đột biến gen lặn trên NST thường làm cơ thể thiếu hụt sắc tố nào?', options: ['Sắc tố Melanin trong da, tóc và mắt', 'Hemoglobin trong máu', 'Chất diệp lục', 'Insulin'], correctAnswer: 0, explanation: 'Thiếu melanin làm da trắng bợt, tóc trắng, mắt hồng nhạy cảm với ánh sáng.' },
      {
        id: 'b96_17',
        type: 'true_false',
        question: 'Về đột biến và di truyền học người, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Bệnh nhân mắc hội chứng Down có 3 chiếc nhiễm sắc thể ở cặp số 21.', isCorrect: true },
          { subId: 'b', text: 'Thường biến là những biến dị di truyền được cho thế hệ con cháu.', isCorrect: false },
          { subId: 'c', text: 'Hôn nhân cận huyết thống làm tăng nguy cơ sinh con mắc các dị tật di truyền do gen lặn có hại.', isCorrect: true },
          { subId: 'd', text: 'Đột biến gen luôn luôn gây hại và giết chết sinh vật ngay lập tức.', isCorrect: false }
        ]
      },
      {
        id: 'b96_18',
        type: 'short_answer',
        question: 'Người mắc hội chứng Down có tổng cộng bao nhiêu chiếc nhiễm sắc thể trong mỗi tế bào sinh dưỡng?',
        acceptableAnswers: ['47', '47 chiếc', '47 NST', '47 chiếc nst'],
        unit: 'chiếc',
        explanation: 'Người bình thường 46 chiếc, người bệnh Down có 2n + 1 = 47 chiếc.'
      }
    ]
  },

  // ================= ĐỀ 7 - KHỐI 9 =================
  {
    id: 'exam-phy-9-07',
    title: 'Đề 7 - Vật lí 9: Điện từ học, Cảm ứng điện từ và Dòng điện xoay chiều',
    subject: 'physics',
    grade: 9,
    testNumber: 'TX7',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-07',
    questions: [
      { id: 'p97_1', type: 'multiple_choice', question: 'Từ trường tồn tại ở không gian xung quanh vật nào sau đây?', options: ['Xung quanh nam châm và xung quanh dây dẫn có dòng điện chạy qua', 'Xung quanh điện tích đứng yên', 'Xung quanh thanh gỗ khô', 'Xung quanh cốc nước'], correctAnswer: 0, explanation: 'Thí nghiệm Oersted chứng minh dòng điện sinh ra từ trường xung quanh nó.' },
      { id: 'p97_2', type: 'multiple_choice', question: 'Dụng cụ dùng để nhận biết sự tồn tại của từ trường và xác định hướng của từ trường là:', options: ['Kim nam châm thử', 'Nhiệt kế', 'Vôn kế', 'Ampe kế'], correctAnswer: 0, explanation: 'Kim nam châm tự do định hướng theo đường sức từ của từ trường.' },
      { id: 'p97_3', type: 'multiple_choice', question: 'Quy ước chiều của đường sức từ bên ngoài nam châm vĩnh cửu là:', options: ['Đi ra từ cực Bắc (N) và đi vào cực Nam (S)', 'Đi ra cực Nam vào cực Bắc', 'Đi tròn đều không có cực', 'Phụ thuộc vào nhiệt độ'], correctAnswer: 0, explanation: 'Quy ước đường sức từ: "Vào Nam Ra Bắc".' },
      { id: 'p97_4', type: 'multiple_choice', question: 'Hiện tượng cảm ứng điện từ do nhà bác học Michael Faraday phát hiện xảy ra khi:', options: ['Số đường sức từ xuyên qua tiết diện cuộn dây dẫn kín biến thiên (tăng hoặc giảm)', 'Cuộn dây đặt bất động trong từ trường đều vĩnh cửu', 'Dây dẫn bị đứt đôi', 'Nhiệt độ cuộn dây tăng'], correctAnswer: 0, explanation: 'Dòng điện cảm ứng xuất hiện khi từ thông (số đường sức từ) biến thiên.' },
      { id: 'p97_5', type: 'multiple_choice', question: 'Dòng điện cảm ứng trong cuộn dây dẫn kín đổi chiều luân phiên được gọi là:', options: ['Dòng điện xoay chiều (AC)', 'Dòng điện một chiều (DC)', 'Dòng điện tĩnh điện', 'Dòng điện siêu dẫn'], correctAnswer: 0, explanation: 'Dòng điện xoay chiều đổi chiều liên tục theo thời gian.' },
      { id: 'p97_6', type: 'multiple_choice', question: 'Máy phát điện xoay chiều hoạt động dựa trên hiện tượng vật lí nào?', options: ['Hiện tượng cảm ứng điện từ', 'Hiện tượng quang điện', 'Hiện tượng mao dẫn', 'Hiện tượng tỏa nhiệt Joule'], correctAnswer: 0, explanation: 'Cuộn dây quay trong từ trường hoặc nam châm quay trước cuộn dây sinh dòng xoay chiều.' },
      { id: 'p97_7', type: 'multiple_choice', question: 'Máy biến thế (máy biến áp) dùng để làm gì trong mạng lưới truyền tải điện năng?', options: ['Thay đổi hiệu điện thế xoay chiều (tăng hoặc giảm áp)', 'Biến đổi dòng xoay chiều thành một chiều', 'Đo công suất điện tiêu thụ', 'Bảo vệ chống sét'], correctAnswer: 0, explanation: 'Máy biến thế biến đổi hiệu điện thế xoay chiều.' },
      { id: 'p97_8', type: 'multiple_choice', question: 'Công thức máy biến áp lý tưởng giữa hiệu điện thế (U) và số vòng dây (N) của cuộn sơ cấp và thứ cấp là:', options: ['U1 / U2 = N1 / N2', 'U1 / U2 = N2 / N1', 'U1 . U2 = N1 . N2', 'U1 + U2 = N1 + N2'], correctAnswer: 0, explanation: 'Tỉ số hiệu điện thế bằng tỉ số số vòng dây tương ứng.' },
      { id: 'p97_9', type: 'multiple_choice', question: 'Công suất hao phí do tỏa nhiệt trên đường dây tải điện tỉ lệ nghịch với đại lượng nào?', options: ['Bình phương hiệu điện thế truyền tải (U²)', 'Hiệu điện thế U', 'Điện trở đường dây R', 'Thời gian truyền điện'], correctAnswer: 0, explanation: 'P_hp = (P² . R) / U², tăng U lên n lần thì hao phí giảm n² lần.' },
      { id: 'p97_10', type: 'multiple_choice', question: 'Để giảm hao phí điện năng trên đường dây tải điện đi xa hàng trăm kilômét, biện pháp kinh tế và tối ưu nhất là:', options: ['Tăng hiệu điện thế ở đầu đường dây truyền tải bằng máy tăng áp', 'Tăng tiết diện dây dẫn lên thật to nặng', 'Dùng dây dẫn bằng vàng nguyên chất', 'Hạ dòng điện xuống 0'], correctAnswer: 0, explanation: 'Dùng đường dây cao thế 500kV giúp giảm hao phí hàng triệu lần.' },
      { id: 'p97_11', type: 'multiple_choice', question: 'Lưới điện sinh hoạt gia đình ở Việt Nam sử dụng dòng điện xoay chiều có hiệu điện thế hiệu dụng và tần số chuẩn là:', options: ['220 V và 50 Hz', '110 V và 60 Hz', '380 V và 50 Hz', '24 V và 100 Hz'], correctAnswer: 0, explanation: 'Chuẩn điện lưới dân dụng Việt Nam là 220V - 50Hz.' },
      { id: 'p97_12', type: 'multiple_choice', question: 'Một máy biến thế có cuộn sơ cấp N1 = 1000 vòng, cuộn thứ cấp N2 = 5000 vòng. Nếu đặt vào sơ cấp U1 = 220 V thì U2 ở thứ cấp là:', options: ['1100 V (máy tăng áp)', '44 V', '2200 V', '550 V'], correctAnswer: 0, explanation: 'U2 = U1 * (N2 / N1) = 220 * (5000 / 1000) = 1100 V.' },
      { id: 'p97_13', type: 'multiple_choice', question: 'Quy tắc bàn tay trái dùng để xác định yếu tố nào của lực điện từ tác dụng lên dây dẫn mang dòng điện?', options: ['Chiều của lực điện từ tác dụng lên đoạn dây dẫn', 'Chiều của dòng điện', 'Chiều của đường sức từ', 'Độ lớn của điện trở'], correctAnswer: 0, explanation: 'Quy tắc bàn tay trái xác định chiều của lực điện từ F.' },
      { id: 'p97_14', type: 'multiple_choice', question: 'Động cơ điện một chiều hoạt động dựa trên tác dụng nào của dòng điện?', options: ['Tác dụng từ của dòng điện lên khung dây dẫn mang dòng điện đặt trong từ trường', 'Tác dụng nhiệt', 'Tác dụng hóa học', 'Tác dụng sinh lý'], correctAnswer: 0, explanation: 'Lực từ tác dụng lên khung dây làm khung dây quay quanh trục.' },
      { id: 'p97_15', type: 'multiple_choice', question: 'Lõi sắt của máy biến thế thường được ghép từ nhiều lá thép kĩ thuật điện mỏng cách điện với nhau nhằm mục đích gì?', options: ['Giảm hao phí do dòng điện Foucault (Fu-cô) gây nóng lõi thép', 'Làm máy nhẹ hơn', 'Làm tăng từ trường gấp 10 lần', 'Tiết kiệm chi phí chế tạo'], correctAnswer: 0, explanation: 'Chia nhỏ thành các lá thép cách điện triệt tiêu dòng xoáy Foucault.' },
      { id: 'p97_16', type: 'multiple_choice', question: 'Dòng điện xoay chiều có các tác dụng nào giống như dòng điện một chiều?', options: ['Tác dụng nhiệt, tác dụng phát quang và tác dụng từ', 'Chỉ có tác dụng nhiệt', 'Không có tác dụng từ', 'Chỉ có tác dụng sinh lí'], correctAnswer: 0, explanation: 'Dòng điện xoay chiều có đầy đủ tác dụng nhiệt, quang, từ và sinh học.' },
      {
        id: 'p97_17',
        type: 'true_false',
        question: 'Về điện từ học và máy biến thế, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Máy biến thế có thể làm thay đổi hiệu điện thế của dòng điện một chiều không đổi (pin, acquy).', isCorrect: false },
          { subId: 'b', text: 'Tăng hiệu điện thế trước khi truyền tải điện đi xa giúp giảm hao phí nhiệt trên đường dây tải.', isCorrect: true },
          { subId: 'c', text: 'Dòng điện cảm ứng xuất hiện trong cuộn dây dẫn kín khi số đường sức từ xuyên qua tiết diện cuộn dây biến thiên.', isCorrect: true },
          { subId: 'd', text: 'Điện lưới sinh hoạt ở Việt Nam là 220V với tần số 50Hz.', isCorrect: true }
        ]
      },
      {
        id: 'p97_18',
        type: 'short_answer',
        question: 'Một máy biến thế có số vòng cuộn sơ cấp là 500 vòng và cuộn thứ cấp là 2500 vòng. Máy biến thế này làm tăng hiệu điện thế lên gấp bao nhiêu lần?',
        acceptableAnswers: ['5', '5 lần', 'năm'],
        unit: 'lần',
        explanation: 'k = N2 / N1 = 2500 / 500 = 5 lần.'
      }
    ]
  },

  // ================= ĐỀ 8 - KHỐI 9 =================
  {
    id: 'exam-chem-9-08',
    title: 'Đề 8 - Hóa học 9: Hydrocarbon, Nhiên liệu và Hợp chất hữu cơ quan trọng',
    subject: 'chemistry',
    grade: 9,
    testNumber: 'TX8',
    durationMinutes: 15,
    totalPoints: 10.0,
    mode: 'mode_1',
    isActive: true,
    createdAt: '2026-09-08',
    questions: [
      { id: 'c98_1', type: 'multiple_choice', question: 'Hợp chất hữu cơ là hợp chất của nguyên tố nào (trừ CO, CO2, muối cacbonat,...)?', options: ['Carbon (C)', 'Nitrogen (N)', 'Oxygen (O)', 'Hydrogen (H)'], correctAnswer: 0, explanation: 'Hợp chất hữu cơ là hợp chất của carbon (trừ một số chất vô cơ đơn giản).' },
      { id: 'c98_2', type: 'multiple_choice', question: 'Khí Methane (CH4) là thành phần chủ yếu có trong nguồn nhiên liệu thiên nhiên nào?', options: ['Khí thiên nhiên, khí mỏ dầu và khí biogas', 'Khí than đá ẩm', 'Không khí ẩm', 'Nước khoáng'], correctAnswer: 0, explanation: 'Khí methane chiếm tới 95% trong khí thiên nhiên và khí bùn ao (biogas).' },
      { id: 'c98_3', type: 'multiple_choice', question: 'Phản ứng đặc trưng của liên kết đơn trong phân tử Methane (CH4) với khí Clo khi có ánh sáng là:', options: ['Phản ứng thế', 'Phản ứng cộng', 'Phản ứng trùng hợp', 'Phản ứng este hóa'], correctAnswer: 0, explanation: 'CH4 + Cl2 -(as)-> CH3Cl + HCl (phản ứng thế đặc trưng của ankan).' },
      { id: 'c98_4', type: 'multiple_choice', question: 'Phân tử Ethylene (C2H4) có chứa liên kết đặc trưng nào làm mất màu dung dịch Brom?', options: ['Liên kết đôi C=C (chứa 1 liên kết kém bền dễ đứt)', 'Liên kết ba', 'Chỉ có liên kết đơn', 'Liên kết ion'], correctAnswer: 0, explanation: 'Liên kết đôi C=C tham gia phản ứng cộng brom làm mất màu nước brom.' },
      { id: 'c98_5', type: 'multiple_choice', question: 'Khí Acetylene (C2H2) có chứa liên kết nào và được ứng dụng trong đèn xì hàn cắt kim loại?', options: ['Liên kết ba C≡C, khi cháy tỏa nhiệt độ rất cao (~3000°C)', 'Liên kết đơn', 'Liên kết đôi', 'Liên kết kim loại'], correctAnswer: 0, explanation: 'Đèn xì oxy-acetylen cháy tỏa nhiệt lượng cực lớn dùng hàn cắt thép.' },
      { id: 'c98_6', type: 'multiple_choice', question: 'Benzene (C6H6) có cấu trúc phân tử đặc biệt nào?', options: ['Vòng 6 cạnh đều với 3 liên kết đôi xen kẽ 3 liên kết đơn', 'Mạch hở không phân nhánh', 'Mạch nhánh chứa oxy', 'Cấu trúc khối lập phương'], correctAnswer: 0, explanation: 'Vòng benzen 6 cạnh đều rất bền vững (vòng thơm).' },
      { id: 'c98_7', type: 'multiple_choice', question: 'Dầu mỏ là một hỗn hợp tự nhiên phức tạp gồm chủ yếu các hợp chất:', options: ['Nhiều loại hydrocarbon khác nhau', 'Các hợp chất vô cơ', 'Chất béo và protein', 'Đường saccarozo'], correctAnswer: 0, explanation: 'Dầu mỏ là hỗn hợp lỏng sánh gồm hàng trăm hydrocarbon.' },
      { id: 'c98_8', type: 'multiple_choice', question: 'Phương pháp chưng cất phân đoạn dầu mỏ dựa trên sự khác nhau về đại lượng nào của các chất?', options: ['Nhiệt độ sôi của các phân đoạn sản phẩm', 'Khối lượng riêng', 'Màu sắc', 'Độ tan trong nước'], correctAnswer: 0, explanation: 'Chưng cất phân đoạn tách xăng, dầu hỏa, diesel theo nhiệt độ sôi.' },
      { id: 'c98_9', type: 'multiple_choice', question: 'Rượu etylic (Ethanol) có công thức phân tử và nhóm chức đặc trưng là:', options: ['C2H5OH, có nhóm hydroxyl (-OH)', 'CH3COOH, có nhóm cacboxyl', 'CH4', 'C6H12O6'], correctAnswer: 0, explanation: 'Ethanol có nhóm -OH quyết định tính chất rượu tác dụng với Na.' },
      { id: 'c98_10', type: 'multiple_choice', question: 'Độ rượu là gì?', options: ['Số mililít rượu etylic nguyên chất có trong 100 mililít dung dịch rượu', 'Khối lượng rượu trong 1 lít nước', 'Nồng độ phần trăm của rượu', 'Độ ngọt của rượu vang'], correctAnswer: 0, explanation: 'Độ rượu = (V_rượu nguyên chất / V_dung dịch) * 100.' },
      { id: 'c98_11', type: 'multiple_choice', question: 'Acid axetic (CH3COOH) có trong giấm ăn làm quỳ tím đổi thành màu gì?', options: ['Màu đỏ (hoặc hồng)', 'Màu xanh lam', 'Màu vàng', 'Không đổi màu'], correctAnswer: 0, explanation: 'Acid axetic là acid hữu cơ làm quỳ tím hóa đỏ.' },
      { id: 'c98_12', type: 'multiple_choice', question: 'Phản ứng giữa rượu etylic và acid axetic khi có mặt H2SO4 đặc đun nóng tạo este mùi thơm gọi là:', options: ['Phản ứng este hóa tạo etyl axetat', 'Phản ứng trùng ngưng', 'Phản ứng tráng gương', 'Phản ứng thủy phân'], correctAnswer: 0, explanation: 'CH3COOH + C2H5OH <=(H2SO4, t°)=> CH3COOC2H5 + H2O.' },
      { id: 'c98_13', type: 'multiple_choice', question: 'Chất béo (dầu mỡ thực vật, mỡ động vật) khi đun nóng với dung dịch kiềm (NaOH) thu được sản phẩm gì?', options: ['Xà phòng và glycerol (glixerol)', 'Acid và cồn', 'Đường glucose', 'Nhựa plastic'], correctAnswer: 0, explanation: 'Phản ứng xà phòng hóa chất béo tạo muối của axit béo (xà phòng) và glycerol.' },
      { id: 'c98_14', type: 'multiple_choice', question: 'Glucose (C6H12O6) có nhiều trong quả chín ngọt và có phản ứng hóa học đặc trưng nào?', options: ['Phản ứng tráng bạc (tráng gương) khi tác dụng với dung dịch AgNO3 trong NH3', 'Phản ứng mất màu quỳ tím', 'Phản ứng nổ mạnh trong tối', 'Phản ứng với đồng kim loại'], correctAnswer: 0, explanation: 'Glucose có nhóm -CHO tham gia phản ứng tráng bạc tạo lớp bạc sáng loáng.' },
      { id: 'c98_15', type: 'multiple_choice', question: 'Tinh bột tác dụng với dung dịch Iodine (I-ốt) tạo ra hợp chất có màu đặc trưng nào?', options: ['Màu xanh tím', 'Màu đỏ gạch', 'Màu vàng chanh', 'Màu đen kịt'], correctAnswer: 0, explanation: 'Thuốc thử hồ tinh bột với iot tạo màu xanh tím đặc trưng.' },
      { id: 'c98_16', type: 'multiple_choice', question: 'Nhựa PE (polyethylene) dùng làm túi màng bọc thực phẩm được tổng hợp từ chất nào bằng phản ứng trùng hợp?', options: ['Khí Ethylene (C2H4)', 'Khí Methane (CH4)', 'Rượu etylic', 'Acid axetic'], correctAnswer: 0, explanation: 'nCH2=CH2 -(t°, p, xt)-> (-CH2-CH2-)n (polyethylene).' },
      {
        id: 'c98_17',
        type: 'true_false',
        question: 'Về hydrocarbon và hóa học hữu cơ, đánh giá tính Đúng/Sai:',
        statements: [
          { subId: 'a', text: 'Ethylene (C2H4) có liên kết đôi làm mất màu dung dịch brom.', isCorrect: true },
          { subId: 'b', text: 'Độ rượu là số gam rượu etylic nguyên chất có trong 100 gam nước.', isCorrect: false },
          { subId: 'c', text: 'Giấm ăn chứa acid axetic (CH3COOH) có nồng độ khoảng 2% đến 5%.', isCorrect: true },
          { subId: 'd', text: 'Tinh bột tác dụng với iot tạo ra dung dịch có màu xanh tím đặc trưng.', isCorrect: true }
        ]
      },
      {
        id: 'c98_18',
        type: 'short_answer',
        question: 'Pha 45 mL rượu etylic nguyên chất vào nước để được 100 mL dung dịch rượu. Dung dịch rượu này có độ rượu bằng bao nhiêu độ (°)?',
        acceptableAnswers: ['45', '45 độ', '45°', '45 do'],
        unit: 'độ',
        explanation: 'Độ rượu = (45 / 100) * 100 = 45°.'
      }
    ]
  }
];
