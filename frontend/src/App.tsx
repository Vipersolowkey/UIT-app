import React, { useMemo, useState } from "react";

import Header from "./components/Layout/Header";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Practice from "./pages/Practice";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import Result from "./pages/Result";
import Jobs from "./pages/Jobs";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("token") !== null;
  });

  const [activeTab, setActiveTab] = useState<string>("Trang Chủ");

  const currentPage = useMemo(() => {
    switch (activeTab) {
      case "Trang Chủ":
        return <Home setActiveTab={setActiveTab} />;

      case "Chatbot RAG":
        return <Chat />;

      case "Luyện Đề":
        return <Practice />;

      case "Lịch Học":
        return <Schedule />;

      case "Xem Điểm":
        return <Result />;

      case "Tuyển Dụng":
        return <Jobs />;

      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  }, [activeTab]);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
<div className="min-h-screen font-sans text-slate-800 flex flex-col relative overflow-x-hidden">
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-blue-200/20 blur-3xl rounded-full"></div>
    <div className="absolute top-24 right-0 w-[360px] h-[360px] bg-cyan-200/20 blur-3xl rounded-full"></div>
    <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-indigo-200/20 blur-3xl rounded-full"></div>
  </div>      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
        {currentPage}
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#00529c] text-white shadow-lg hover:bg-blue-800 hover:-translate-y-0.5 transition-all flex items-center justify-center"
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        ↑
      </button>
    </div>
  );
}