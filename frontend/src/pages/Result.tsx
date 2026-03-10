import { useState } from 'react';

interface CourseResult {
  maHP: string;
  tenHP: string;
  tinChi: number;
  diemQT: number | string;
  diemGK: number | string;
  diemTH: number | string;
  diemCK: number | string;
  diemHP: number | string;
  ghiChu: string;
}

export default function Result() {
  // State để chọn Học kỳ (Giả lập filter)
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 1 - Năm học 2025-2026');

    const mockResults: CourseResult[] = [
    { maHP: "IT001", tenHP: "Nhập môn Lập trình", tinChi: 4, diemQT: 8.5, diemGK: 8.0, diemTH: 8.0, diemCK: 8.5, diemHP: 8.0, ghiChu: "" },
    { maHP: "IT002", tenHP: "Cơ sở dữ liệu", tinChi: 4, diemQT: 8.0, diemGK: 7.5, diemTH: 8.5, diemCK: 8.0, diemHP: 8.0, ghiChu: "" },
    { maHP: "IS201", tenHP: "Phân tích thiết kế HTTT", tinChi: 3, diemQT: 9.0, diemGK: 8.5, diemTH: "-", diemCK: 9.0, diemHP: 8.9, ghiChu: "" },
    { maHP: "SS004", tenHP: "Kỹ năng giao tiếp", tinChi: 2, diemQT: 8.0, diemGK: "-", diemTH: "-", diemCK: 7.0, diemHP: 7.5, ghiChu: "" },
    { maHP: "MA003", tenHP: "Đại số tuyến tính", tinChi: 3, diemQT: 7.0, diemGK: 6.5, diemTH: "-", diemCK: 7.0, diemHP: 6.9, ghiChu: "" },
    { maHP: "PE001", tenHP: "Giáo dục thể chất 1", tinChi: 2, diemQT: 8.0, diemGK: "-", diemTH: 8.0, diemCK: 8.5, diemHP: 8.3, ghiChu: "Đạt" },
  ];

  
  const tongTinChi = mockResults.reduce((sum, course) => sum + course.tinChi, 0);
  const diemTrungBinh = 8.0; // Giả lập con số tính sẵn

  return (
    <div className="animate-fade-in font-sans pb-10">
      
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00529c] mb-1">Kết quả học tập</h2>
          <p className="text-sm text-slate-500 font-medium tracking-wide">Mã sinh viên: <span className="text-slate-700 font-bold">24520089</span> | Hoàng Anh</p>
        </div>
        
        
        <div className="relative">
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-slate-700 font-semibold text-sm py-2.5 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-[#00529c] focus:ring-1 focus:ring-[#00529c]/20 cursor-pointer transition-all"
          >
            <option value="Học kỳ 2 - Năm học 2025-2026">Học kỳ 2 - 2025/2026</option>
            <option value="Học kỳ 1 - Năm học 2025-2026">Học kỳ 1 - 2025/2026</option>
            <option value="Học kỳ 2 - Năm học 2024-2025">Học kỳ 2 - 2024/2025</option>
          </select>
          {/* Mũi tên trỏ xuống */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#00529c]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4H9zM19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3-3 3 3 3-3 3 3z" /></svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm TB Học kỳ</p>
            <p className="text-2xl font-black text-slate-800">{diemTrungBinh}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tín chỉ đạt (HK)</p>
             <p className="text-2xl font-black text-slate-800">{tongTinChi}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Xếp loại học lực</p>
             <p className="text-lg font-black text-amber-600 mt-1">Giỏi</p>
          </div>
        </div>
      </div>

      {/* 3. BẢNG ĐIỂM CHI TIẾT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-gray-200 text-[12px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 text-center w-12">STT</th>
                <th className="px-4 py-4">Mã HP</th>
                <th className="px-4 py-4">Tên Học Phần</th>
                <th className="px-4 py-4 text-center">Tín chỉ</th>
                <th className="px-3 py-4 text-center text-slate-500">Đ.QT</th>
                <th className="px-3 py-4 text-center text-slate-500">Đ.GK</th>
                <th className="px-3 py-4 text-center text-slate-500">Đ.TH</th>
                <th className="px-3 py-4 text-center text-slate-500">Đ.CK</th>
                <th className="px-4 py-4 text-center text-[#00529c] font-extrabold">Đ.HP</th>
                <th className="px-4 py-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockResults.map((course, index) => (
                <tr key={course.maHP} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3.5 text-center text-slate-400 font-medium">{index + 1}</td>
                  <td className="px-4 py-3.5 font-bold text-[#00529c]">{course.maHP}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{course.tenHP}</td>
                  <td className="px-4 py-3.5 text-center text-slate-600">{course.tinChi}</td>
                  
                  {/* Các cột điểm thành phần */}
                  <td className="px-3 py-3.5 text-center text-slate-500 font-medium">{course.diemQT}</td>
                  <td className="px-3 py-3.5 text-center text-slate-500 font-medium">{course.diemGK}</td>
                  <td className="px-3 py-3.5 text-center text-slate-500 font-medium">{course.diemTH}</td>
                  <td className="px-3 py-3.5 text-center text-slate-500 font-medium">{course.diemCK}</td>
                  
                  {/* Cột điểm tổng kết (Đ.HP) làm nổi bật */}
                  <td className="px-4 py-3.5 text-center font-bold text-lg text-slate-800 bg-slate-50/50">
                    {course.diemHP}
                  </td>
                  
                  <td className="px-4 py-3.5 text-slate-500 text-[12px] font-medium italic">
                    {course.ghiChu || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer của bảng */}
        <div className="bg-[#f8fafc] border-t border-gray-200 p-4 text-[12px] text-slate-500 flex gap-6">
          <p><strong>Đ.QT:</strong> Điểm Quá trình</p>
          <p><strong>Đ.GK:</strong> Điểm Giữa kỳ</p>
          <p><strong>Đ.TH:</strong> Điểm Thực hành</p>
          <p><strong>Đ.CK:</strong> Điểm Cuối kỳ</p>
          <p className="text-[#00529c]"><strong>Đ.HP:</strong> Điểm Học phần</p>
        </div>
      </div>

    </div>
  );
}