import React, { useState, useEffect } from 'react';
import { fetchEventsAPI } from '../../api/events';
import type { UITEvent } from '../../api/events';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'chung', label: 'TB Chung' },
  { id: 'nghi_bu', label: 'Nghỉ, Bù' },
  { id: 'vb2', label: 'Văn bằng 2' },
  { id: 'lien_thong', label: 'Liên thông' }
] as const;

export default function Events() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [eventsData, setEventsData] = useState<UITEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEventsAPI();
        setEventsData(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEvents = activeTab === 'all' 
    ? eventsData 
    : eventsData.filter(event => event.category === activeTab);

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'nghi_bu': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>;
      case 'vb2': 
      case 'lien_thong': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
      default: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
    }
  };

  return (
    <div className="animate-fade-in font-sans">
      
      {/* Tiêu đề Bảng tin */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#00529c] p-2 rounded-lg text-white shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Thông báo từ trường</h2>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        
        {/* THANH TAB DẠNG NÚT (Pill Tabs) - Vuốt ngang cực mượt */}
        <div className="p-3.5 border-b border-gray-100 bg-slate-50/50 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 text-[13px] font-bold whitespace-nowrap rounded-xl transition-all duration-200 ${
                activeTab === cat.id 
                  ? 'bg-[#00529c] text-white shadow-md shadow-blue-900/10' 
                  : 'bg-white text-slate-600 hover:bg-slate-200/50 border border-gray-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* NỘI DUNG THÔNG BÁO */}
        <div className="p-0 min-h-[300px] relative max-h-[500px] overflow-y-auto custom-scrollbar">
          
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#00529c] rounded-full animate-spin"></div>
            </div>
          ) : (
            filteredEvents.length > 0 ? (
              <div className="flex flex-col">
                {filteredEvents.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-5 flex gap-4 items-start group cursor-pointer transition-colors hover:bg-slate-50/80 ${
                      index !== filteredEvents.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    
                    {/* Cột Icon - To và bo góc xịn hơn */}
                    <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                      item.category === 'nghi_bu' ? 'bg-orange-50 text-orange-600' :
                      item.category === 'vb2' || item.category === 'lien_thong' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    
                    {/* Cột Nội dung */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start gap-3">
                        {/* Title dùng line-clamp-2 để giới hạn 2 dòng */}
                        <h3 className="font-bold text-slate-800 text-[14px] sm:text-[15px] leading-snug group-hover:text-[#00529c] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.isNew && (
                          <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-1 rounded ring-1 ring-red-500/20 shrink-0">
                            MỚI
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mt-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {item.date}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                 <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                 <p className="font-semibold text-sm">Chưa có thông báo nào trong chuyên mục này.</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}