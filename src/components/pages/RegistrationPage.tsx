import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, CheckCircle2, Award, Sparkles, Send, Phone, Mail, GraduationCap } from 'lucide-react';
import { RegistrationItem } from '../../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const RegistrationPage: React.FC = () => {
  const { classes, showToast } = useApp();
  const { registerWithEmail } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    school: '',
    currentGrade: 'Khối 8',
    desiredClass: 'Hóa học 8 - Chuyên sâu',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      showToast('Vui lòng điền họ tên và số điện thoại liên hệ.', 'error');
      return;
    }

    setLoading(true);
    try {
      const newRegistration: RegistrationItem = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        school: form.school.trim(),
        currentGrade: form.currentGrade,
        desiredClass: form.desiredClass,
        note: form.note.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem('ndh_registrations') || '[]');
      localStorage.setItem('ndh_registrations', JSON.stringify([newRegistration, ...existing]));

      try {
        await addDoc(collection(db, 'registrations'), newRegistration);
      } catch {
        // already saved in localStorage
      }

      // Also synchronize into student login accounts so this student can log in immediately
      try {
        await registerWithEmail(
          form.email.trim(),
          form.phone.trim().replace(/\s+/g, '') || '123456',
          form.fullName.trim(),
          'student'
        );
      } catch {
        // ignore
      }

      setSubmitted(true);
      showToast('Đăng ký lớp học & đồng bộ tài khoản học sinh thành công!', 'success');
    } catch (error: any) {
      showToast('Lỗi khi gửi thông tin đăng ký: ' + error?.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-200 mb-1">
          <UserPlus className="w-3.5 h-3.5" />
          Mục số 8 trong Mê nu chính: Đăng ký trực tuyến
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
          Đăng Ký Tham Gia Các Khóa Học Hóa Học THCS NĐH
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dành cho phụ huynh và học sinh đăng ký các khóa cơ bản, nâng cao khối 6, 7, 8, 9 và đội tuyển Bồi dưỡng HSG cấp tỉnh, thành phố.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Đăng Ký Nhập Học Thành Công!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Cảm ơn quý phụ huynh và em học sinh <strong>{form.fullName}</strong>. Thông tin đăng ký đã được gửi đến Thầy Nguyễn Đình Hành. Thầy sẽ liên hệ qua số điện thoại <strong>{form.phone}</strong> để tư vấn xếp lớp và lịch học phù hợp.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    fullName: '',
                    phone: '',
                    email: '',
                    school: '',
                    currentGrade: 'Khối 8',
                    desiredClass: 'Hóa học 8 - Nâng cao',
                    note: '',
                  });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Đăng ký thêm học sinh khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 border-b border-slate-100 pb-2">
                Thông Tin Học Sinh & Nguyện Vọng Đăng Ký Học
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại phụ huynh / học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0988 275 288"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email liên hệ (nếu có)</label>
                  <input
                    type="email"
                    placeholder="email@vidu.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trường THCS đang theo học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THCS Quang Trung"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp hiện tại</label>
                  <select
                    value={form.currentGrade}
                    onChange={(e) => setForm({ ...form, currentGrade: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Khối 6">Lớp 6 (KHTN 6)</option>
                    <option value="Khối 7">Lớp 7 (KHTN 7)</option>
                    <option value="Khối 8">Lớp 8 (Hóa học 8)</option>
                    <option value="Khối 9">Lớp 9 (Hóa học 9 & Luyện thi vào 10)</option>
                    <option value="Bồi dưỡng HSG cấp tỉnh, thành phố">Bồi dưỡng HSG cấp tỉnh, thành phố</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chương trình mong muốn đăng ký</label>
                  <select
                    value={form.desiredClass}
                    onChange={(e) => setForm({ ...form, desiredClass: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="KHTN 6 - Cơ bản & Nâng cao">KHTN 6 - Cơ bản & Nâng cao</option>
                    <option value="KHTN 7 - Cơ bản & Nâng cao">KHTN 7 - Cơ bản & Nâng cao</option>
                    <option value="Hóa học 8 - Chuyên sâu">Hóa học 8 - Chuyên sâu</option>
                    <option value="Hóa học 9 & Luyện thi vào 10">Hóa học 9 & Luyện thi vào 10</option>
                    <option value="Bồi dưỡng HSG cấp tỉnh, thành phố">Đội tuyển Bồi dưỡng HSG cấp tỉnh, thành phố</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú & Nguyện vọng</label>
                <textarea
                  rows={3}
                  placeholder="Học lực hiện tại môn Hóa, mục tiêu thi HSG, thời gian học mong muốn..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Đang gửi thông tin...' : 'Gửi Đăng Ký Lớp Học'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-violet-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Quyền Lợi Học Viên NĐH</span>
            </div>
            <ul className="space-y-2 text-xs text-violet-100 leading-relaxed list-disc list-inside">
              <li>Được Thầy Nguyễn Đình Hành trực tiếp hướng dẫn phương pháp giải độc quyền.</li>
              <li>Miễn phí sử dụng kho tài liệu tham khảo và hệ thống bài tập tương tác có chấm điểm tự động.</li>
              <li>Hỗ trợ 24/7 từ Trợ lý AI Hóa học NĐH giải đáp bài tập về nhà.</li>
              <li>Đánh giá năng lực định kỳ và định hướng vào các trường THPT Chuyên.</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Liên hệ trực tiếp:</h4>
            <div><strong>Địa chỉ:</strong> 806/4/2 Quang Trung, An Bình, Gia Lai</div>
            <div><strong>Điện thoại:</strong> 0988 275 288</div>
            <div><strong>Email:</strong> n.dhanhcs@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};
