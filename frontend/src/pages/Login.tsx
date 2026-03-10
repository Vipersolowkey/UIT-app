import { useState } from 'react';
import { loginAPI } from '../api/login';
import logoUit from '../assets/logo_uit.png';

// Bắt buộc phải có cái này để App.tsx biết mà chuyển trang nhé
interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');

    if (!mssv.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ MSSV và Mật khẩu!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginAPI({ mssv, password });
      
      if (response.success) {
        if (response.token) localStorage.setItem('token', response.token);
        if (response.student) localStorage.setItem('studentName', response.student.name);
        
        // Gọi hàm báo cho App.tsx là đăng nhập thành công rồi!
        onLoginSuccess(); 
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans animate-fade-in">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center p-2 mb-4 border border-blue-100">
           <img src={logoUit} alt="UIT Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-[22px] font-black text-[#00529c] mb-1">UIT AI Portal</h1>
        <p className="text-[13px] text-slate-500 font-medium mb-8">Hệ thống Luyện đề & Hỗ trợ học tập</p>

        <form onSubmit={handleLogin} autoComplete="off" className="w-full flex flex-col gap-5">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Tài khoản (MSSV)</label>
            {/* Đã sửa lỗi dư dấu ngoặc nhọn ở đây */}
            <input 
              type="text" 
              value={mssv}
              onChange={(e) => setMssv(e.target.value)}
              placeholder="Ví dụ: 24520089"
              autoComplete="off" 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00529c] transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password" 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00529c] transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 tracking-widest"
            />
          </div>
         
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00529c] hover:bg-blue-800 text-white font-bold text-[15px] py-3.5 rounded-xl transition-all shadow-md shadow-[#00529c]/20 mt-2 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Đăng nhập'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}