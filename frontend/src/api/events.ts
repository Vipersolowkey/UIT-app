// 1. Khuôn mẫu dữ liệu thông báo mới
export interface UITEvent {
  id: string;
  title: string;
  date: string;
  category: 'chung' | 'nghi_bu' | 'vb2' | 'lien_thong'; // Phân loại chuyên mục
  isNew: boolean;
}

// 2. Database giả lập (Lấy dữ liệu thật từ ảnh của bạn)
const mockEventsData: UITEvent[] = [
  // --- THÔNG BÁO CHUNG ---
  { id: '1', title: 'Kế hoạch xét tốt nghiệp đợt 01 năm 2026', date: '24/02/2026 - 09:31', category: 'chung', isNew: true },
  { id: '2', title: 'Thông báo về việc ban hành Quy định về tổ chức thi trên máy tính của Trường Đại học Công nghệ Thông tin', date: '11/02/2026 - 14:08', category: 'chung', isNew: false },
  
  // --- THÔNG BÁO NGHỈ, BÙ ---
  { id: '3', title: 'Thông báo nghỉ lớp Kỹ năng nghề nghiệp (SS004.Q210) ngày 27/02/2026', date: '26/02/2026 - 15:02', category: 'nghi_bu', isNew: true },
  { id: '4', title: 'Thông báo học bù Cấu trúc rời rạc (MA004.Q224) ngày 01/06/2026', date: '26/02/2026 - 08:47', category: 'nghi_bu', isNew: true },
  { id: '5', title: 'Thông báo học bù Lập trình hướng đối tượng (IT002.Q225) ngày 04/07/2026', date: '26/02/2026 - 08:24', category: 'nghi_bu', isNew: true },

  // --- THÔNG BÁO VĂN BẰNG 2 ---
  { id: '6', title: 'Thông báo Thời khóa biểu học kỳ 2 năm học 2025-2026 các lớp VB2', date: '03/02/2026 - 09:30', category: 'vb2', isNew: false },
  { id: '7', title: 'Thông báo lịch thi cuối học kỳ 1 năm học 2025-2026 các lớp VB2_đợt 2', date: '06/01/2026 - 09:49', category: 'vb2', isNew: false },

  // --- THÔNG BÁO LIÊN THÔNG ---
  { id: '8', title: 'Lịch thi cuối kỳ học phần 2 học kỳ 1 năm học 2025-2026 lớp Liên thông chính quy khóa 2025', date: '06/02/2026 - 10:34', category: 'lien_thong', isNew: false },
  { id: '9', title: 'Thông báo thu học phí học kỳ 1, năm học 2025-2026 trình độ ĐTĐH CT liên kết BCU, VB2CQ, LTĐH, Song ngành', date: '21/11/2025 - 16:31', category: 'lien_thong', isNew: false }
];

// 3. Hàm gọi API
export const fetchEventsAPI = async (): Promise<UITEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEventsData);
    }, 600); 
  });
};