// 1. CÁC KHUÔN MẪU DỮ LIỆU (Chỉ có Sinh viên)
export interface LoginCredentials {
  mssv: string;
  password: string;
}

export interface StudentInfo {
  mssv: string;
  name: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string; 
  student?: StudentInfo;
}

// 2. MOCK DATABASE - CƠ SỞ DỮ LIỆU SINH VIÊN GIẢ LẬP
const mockStudents = [
  {
    mssv: '24520089',
    password: '1', // Pass là 1 cho lẹ nha =))
    name: 'Hoàng Anh',
  },
  {
    mssv: '23520000',
    password: '1',
    name: 'Nguyễn Văn A',
  }
];

// 3. HÀM GỌI API ĐĂNG NHẬP
export const loginAPI = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return new Promise((resolve) => {
    // Giả lập hệ thống đang xử lý trong 1 giây
    setTimeout(() => {
      // Tìm sinh viên khớp MSSV và Password
      const student = mockStudents.find(
        (s) => s.mssv === credentials.mssv && s.password === credentials.password
      );

      if (student) {
        resolve({
          success: true,
          message: 'Đăng nhập thành công!',
          token: `fake-jwt-token-${student.mssv}`, 
          student: {
            mssv: student.mssv,
            name: student.name,
          }
        });
      } else {
        // Sai thì báo lỗi
        resolve({
          success: false,
          message: 'Tài khoản (MSSV) hoặc mật khẩu không chính xác!'
        });
      }
    }, 1000); 
  });
};