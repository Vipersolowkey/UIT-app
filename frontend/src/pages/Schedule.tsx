import { useState, useEffect } from 'react';
import { fetchScheduleAPI } from '../api/schedule';
import type { ScheduleItem } from '../api/schedule';

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const TIME_SLOTS = [
  { period: 1, time: '7:30-8:15' },
  { period: 2, time: '8:15-9:00' },
  { period: 3, time: '9:00-9:45' },
  { period: 4, time: '10:00-10:45' },
  { period: 5, time: '10:45-11:30' },
  { period: 6, time: '13:00-13:45' },
  { period: 7, time: '13:45-14:30' },
  { period: 8, time: '14:30-15:15' },
  { period: 9, time: '15:30-16:15' },
  { period: 10, time: '16:15-17:00' },
];

export default function Schedule() {
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchScheduleAPI();
        setScheduleData(data);
      } catch (error) {
        console.error("Lỗi khi tải lịch học:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getGridStyle = (course: ScheduleItem) => {
    const columnIndex = WEEK_DAYS.indexOf(course.dayOfWeek) + 2; 
    const rowStart = course.startPeriod + 1; 
    const rowSpan = course.endPeriod - course.startPeriod + 1; 
    return {
      gridColumn: columnIndex,
      gridRow: `${rowStart} / span ${rowSpan}`,
    };
  };

  return (
    <div className="animate-fade-in pb-10">
      
      {/* KHUNG HIỂN THỊ */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
             <div className="w-8 h-8 border-4 border-blue-100 border-t-[#00529c] rounded-full animate-spin mb-3"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* LƯỚI MA TRẬN - GAP = 0 ĐỂ VẼ ĐƯỜNG KẺ CHUẨN XÁC */}
          <div 
            className="min-w-[1100px] grid"
            style={{ 
              gridTemplateColumns: '80px repeat(6, minmax(180px, 1fr))', 
              gridTemplateRows: '50px repeat(10, 85px)', // Tăng độ cao mỗi tiết để đủ nhét nội dung
              gap: 0 
            }}
          >
            
            {/* --- LỚP BACKGROUND (CÁC Ô KẺ) --- */}
            {/* Ô góc trên trái */}
            <div className="border-b border-r border-gray-100 flex items-center justify-center font-bold text-slate-600 text-[13px] bg-[#fafafa]" style={{ gridColumn: 1, gridRow: 1 }}>
              Thứ/Tiết
            </div>

            {/* Header Thứ */}
            {WEEK_DAYS.map((day, index) => (
              <div key={day} className="border-b border-r border-gray-100 flex items-center justify-center font-bold text-slate-800 text-sm bg-[#fafafa]" style={{ gridColumn: index + 2, gridRow: 1 }}>
                {day}
              </div>
            ))}

            {/* Cột thời gian (Tiết) */}
            {TIME_SLOTS.map((slot) => (
              <div key={slot.period} className="border-b border-r border-gray-100 flex flex-col items-center justify-center bg-white" style={{ gridColumn: 1, gridRow: slot.period + 1 }}>
                <span className="font-bold text-[13px] text-slate-800">Tiết {slot.period}</span>
                <span className="text-[10px] text-slate-400 font-medium">{slot.time}</span>
              </div>
            ))}

            {/* Các ô trống (Để tạo đường kẻ sọc ngang dọc) */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
               Array.from({ length: 6 }).map((_, colIndex) => (
                 <div 
                   key={`cell-${rowIndex}-${colIndex}`}
                   className="border-b border-r border-gray-100 bg-white"
                   style={{ gridRow: rowIndex + 2, gridColumn: colIndex + 2 }}
                 />
               ))
            ))}

            {/* --- LỚP DATA (CÁC MÔN HỌC) --- */}
            {scheduleData.map((course) => {
              const isBlue = course.type === 'blue';
              
              // Mã màu chuẩn xác giống ảnh 100%
              const bgClass = isBlue ? 'bg-[#f0f7ff] border-[#d6e4f0]' : 'bg-[#f0fdf4] border-[#dcfce7]';
              const codeColor = isBlue ? 'text-[#7b9ab8]' : 'text-[#6b9b82]';
              const titleColor = isBlue ? 'text-[#00529c]' : 'text-[#007b46]';
              const iconColor = isBlue ? 'text-[#8ba7c2]' : 'text-[#7fb097]';

              return (
                <div 
                  key={course.id} 
                  style={getGridStyle(course)}
                  // z-10 để thẻ môn học nổi lên trên lớp đường kẻ, p-1.5 để tạo khe hở quanh thẻ
                  className="z-10 p-1.5" 
                >
                  <div className={`h-full w-full rounded-xl p-3 border shadow-sm flex flex-col justify-start transition-all hover:shadow-md cursor-pointer ${bgClass}`}>
                    
                    {/* Mã môn học */}
                    <div className={`text-[12px] font-bold mb-0.5 ${codeColor}`}>
                      {course.courseCode}
                    </div>
                    
                    {/* Tên môn học */}
                    <h3 className={`font-extrabold text-[13px] leading-[18px] mb-2 ${titleColor}`}>
                      {course.courseName}
                    </h3>
                    
                    {/* Chi tiết (Phòng, GV, Ngày) */}
                    <div className={`mt-auto space-y-1.5 text-[11px] font-bold ${codeColor}`}>
                      
                      {/* Icon Location */}
                      <p className="flex items-center gap-1.5">
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {course.room}
                      </p>
                      
                      {/* Icon User */}
                      <p className="flex items-center gap-1.5">
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {course.lecturer}
                      </p>
                      
                      
                      <p className="flex items-center gap-1.5">
                        <svg className={`w-3.5 h-3.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {course.dateRange}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>
      </div>
    </div>
  );
}