// 1. Khuôn mẫu dữ liệu chuẩn xác để vẽ Ma trận
export interface ScheduleItem {
  id: string;
  courseCode: string;
  courseName: string;
  room: string;
  lecturer: string;
  dateRange: string;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  startPeriod: number; // Tiết bắt đầu (Quan trọng để vẽ lưới)
  endPeriod: number;   // Tiết kết thúc
  type: 'blue' | 'green'; // Loại môn học để lên màu
}

// 2. Database y hệt ảnh bạn chụp
const mockScheduleData: ScheduleItem[] = [
  // THỨ 2
  { id: '1', courseCode: 'STAT3013.Q21', courseName: 'Phân tích thống kê - EN', room: 'P. E03.2', lecturer: 'Trần Văn Hải Triều', dateRange: '26/01 -> 02/05', dayOfWeek: 'Thứ 2', startPeriod: 1, endPeriod: 3, type: 'blue' },
  { id: '2', courseCode: 'SS009.Q22', courseName: 'Chủ nghĩa xã hội khoa học - VN', room: 'P. B4.18', lecturer: 'Đặng Kiều Diễm', dateRange: '26/01 -> 30/05', dayOfWeek: 'Thứ 2', startPeriod: 9, endPeriod: 10, type: 'blue' },
  
  // THỨ 3
  { id: '3', courseCode: 'MSIS2433.Q21.1', courseName: 'Lập trình hướng đối tượng - EN', room: 'P. B2.18 (PM)', lecturer: 'Trương Minh Châu', dateRange: '02/03 -> 16/05', dayOfWeek: 'Thứ 3', startPeriod: 1, endPeriod: 3, type: 'green' },
  { id: '4', courseCode: 'ACCT5123.Q21.1', courseName: 'Hoạch định nguồn lực doanh nghiệp', room: 'P. B2.22 (PM)', lecturer: 'Lê Võ Đình Kha', dateRange: '02/03 -> 16/05', dayOfWeek: 'Thứ 3', startPeriod: 6, endPeriod: 8, type: 'blue' },

  // THỨ 4
  { id: '5', courseCode: 'MSIS2433.Q21', courseName: 'Lập trình hướng đối tượng - EN', room: 'P. E03.4', lecturer: 'Nguyễn Tuấn Nam', dateRange: '26/01 -> 02/05', dayOfWeek: 'Thứ 4', startPeriod: 2, endPeriod: 4, type: 'blue' },
  { id: '6', courseCode: 'MSIS4013.Q21', courseName: 'Thiết kế, quản lý và quản trị hệ CSDL', room: 'P. E03.2', lecturer: 'Cao Thị Nhạn', dateRange: '26/01 -> 02/05', dayOfWeek: 'Thứ 4', startPeriod: 6, endPeriod: 8, type: 'blue' },

  // THỨ 5
  { id: '7', courseCode: 'MSIS4013.Q21.1', courseName: 'Thiết kế, quản lý và quản trị hệ CSDL', room: 'P. B2.18 (PM)', lecturer: 'Dương Phi Long', dateRange: '02/03 -> 16/05', dayOfWeek: 'Thứ 5', startPeriod: 1, endPeriod: 3, type: 'green' },
  { id: '8', courseCode: 'MSIS3033.Q21.1', courseName: 'Quản lý dự án hệ thống thông tin', room: 'P. B2.06 (PM)', lecturer: 'Huỳnh Đức Huy', dateRange: '02/03 -> 16/05', dayOfWeek: 'Thứ 5', startPeriod: 6, endPeriod: 8, type: 'green' },

  // THỨ 6
  { id: '9', courseCode: 'ACCT5123.Q21', courseName: 'Hoạch định nguồn lực doanh nghiệp', room: 'P. E04.4', lecturer: 'Trần Văn Hải Triều', dateRange: '26/01 -> 02/05', dayOfWeek: 'Thứ 6', startPeriod: 1, endPeriod: 4, type: 'blue' },
  { id: '10', courseCode: 'MSIS3033.Q21', courseName: 'Quản lý dự án hệ thống thông tin', room: 'P. E03.2', lecturer: 'Trần Hưng Nghiệp', dateRange: '26/01 -> 02/05', dayOfWeek: 'Thứ 6', startPeriod: 6, endPeriod: 8, type: 'blue' },

  // THỨ 7
  { id: '11', courseCode: 'STAT3013.Q21.1', courseName: 'Phân tích thống kê - EN', room: 'P. B3.04 (PM)', lecturer: 'Nguyễn Minh Nhựt', dateRange: '02/03 -> 16/05', dayOfWeek: 'Thứ 7', startPeriod: 1, endPeriod: 3, type: 'blue' },
  { id: '12', courseCode: 'SS010.Q27', courseName: 'Lịch sử Đảng Cộng sản Việt Nam', room: 'P. B1.14', lecturer: 'Trịnh Thị Phương', dateRange: '26/01 -> 30/05', dayOfWeek: 'Thứ 7', startPeriod: 6, endPeriod: 9, type: 'blue' }
];

export const fetchScheduleAPI = async (): Promise<ScheduleItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockScheduleData), 600);
  });
};