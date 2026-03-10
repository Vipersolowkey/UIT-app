import { useEffect, useState } from "react";
import logoUit from "../../assets/logo_uit.png";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const tabs = [
    {
      id: "Trang Chủ",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "Chatbot RAG",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      id: "Luyện Đề",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "Lịch Học",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "Xem Điểm",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "Tuyển Dụng",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 13V7a2 2 0 00-2-2h-3V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H5a2 2 0 00-2 2v6m18 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m18 0a24.246 24.246 0 01-18 0"
          />
        </svg>
      ),
    },
  ];

  const themes = [
    { id: "light", label: "Sáng", icon: "☀️" },
    { id: "dark", label: "Tối", icon: "🌙" },
    { id: "mono", label: "Đen trắng", icon: "⚫" },
  ];

  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const closeMenu = () => setThemeOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <header className="bg-white/85 dark:bg-slate-950/80 mono:bg-black/90 backdrop-blur-xl border-b border-gray-200/70 dark:border-slate-800 mono:border-white/10 sticky top-0 z-50 font-sans shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center h-full min-w-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer mr-4 lg:mr-8 shrink-0"
            onClick={() => setActiveTab("Trang Chủ")}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-blue-50 dark:bg-slate-900 mono:bg-zinc-900 rounded-xl p-1 border border-blue-100 dark:border-slate-700 mono:border-white/10 shadow-sm transition-colors duration-300">
              <img src={logoUit} alt="UIT Logo" className="w-full h-full object-contain" />
            </div>

            <div className="hidden md:block">
              <h1 className="text-[#00529c] dark:text-blue-300 mono:text-white font-extrabold text-[15px] tracking-tight whitespace-nowrap transition-colors duration-300">
                UIT <span className="text-gray-300 dark:text-slate-700 mono:text-white/20 font-normal mx-1">/</span> AI Portal
              </h1>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 h-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 h-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-[#00529c] dark:text-blue-300 mono:text-white"
                      : "text-slate-500 dark:text-slate-400 mono:text-white/65 hover:text-slate-800 dark:hover:text-white mono:hover:text-white"
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-[#00529c] dark:text-blue-300 mono:text-white"
                        : "text-slate-400 dark:text-slate-500 mono:text-white/40"
                    }
                  >
                    {tab.icon}
                  </span>

                  {tab.id}

                  {isActive && (
                    <>
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00529c] dark:bg-blue-300 mono:bg-white rounded-t-md"></span>
                      <span className="absolute inset-x-2 top-2 bottom-2 rounded-xl bg-blue-50 dark:bg-slate-900 mono:bg-white/5 -z-10"></span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Switcher */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setThemeOpen((prev) => !prev)}
              className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-xl border border-gray-200 dark:border-slate-700 mono:border-white/10 bg-white dark:bg-slate-900 mono:bg-zinc-950 text-slate-700 dark:text-slate-200 mono:text-white hover:bg-slate-50 dark:hover:bg-slate-800 mono:hover:bg-zinc-900 transition-all"
              title="Đổi theme"
            >
              <span className="text-sm">
                {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "⚫"}
              </span>
              <span className="text-xs font-bold">
                {theme === "light" ? "Sáng" : theme === "dark" ? "Tối" : "Mono"}
              </span>
            </button>

            {themeOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 dark:border-slate-700 mono:border-white/10 bg-white/95 dark:bg-slate-950/95 mono:bg-black/95 backdrop-blur-xl shadow-xl p-2 animate-fade-in">
                {themes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id);
                      setThemeOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      theme === item.id
                        ? "bg-blue-50 text-[#00529c] dark:bg-slate-900 dark:text-blue-300 mono:bg-white/10 mono:text-white"
                        : "text-slate-600 dark:text-slate-300 mono:text-white/75 hover:bg-slate-50 dark:hover:bg-slate-900 mono:hover:bg-white/5"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="hidden sm:flex text-slate-400 dark:text-slate-500 mono:text-white/50 hover:text-slate-600 dark:hover:text-slate-300 mono:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mono:bg-white/10 hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#f0f4f8] dark:bg-slate-900 mono:bg-zinc-900 text-[#00529c] dark:text-blue-300 mono:text-white flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-slate-700 mono:border-white/10 shadow-sm transition-colors duration-300">
              HA
            </div>
          </div>

          {/* Mobile theme button */}
          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : theme === "dark" ? "mono" : "light")
            }
            className="sm:hidden w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-700 mono:border-white/10 bg-white dark:bg-slate-900 mono:bg-zinc-950 text-slate-600 dark:text-slate-200 mono:text-white hover:bg-slate-50 dark:hover:bg-slate-800 mono:hover:bg-zinc-900 transition-all flex items-center justify-center"
            title="Đổi theme"
          >
            <span>{theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "⚫"}</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-700 mono:border-white/10 bg-white dark:bg-slate-900 mono:bg-zinc-950 text-slate-600 dark:text-slate-200 mono:text-white hover:bg-slate-50 dark:hover:bg-slate-800 mono:hover:bg-zinc-900 transition-all flex items-center justify-center"
            aria-label="Mở menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 mono:border-white/10 bg-white dark:bg-slate-950 mono:bg-black animate-fade-in transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-[#00529c] border border-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:border-slate-700 mono:bg-white/10 mono:text-white mono:border-white/10"
                        : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 mono:bg-white/5 mono:text-white/75 mono:hover:bg-white/10"
                    }`}
                  >
                    <span className={isActive ? "text-[#00529c] dark:text-blue-300 mono:text-white" : "text-slate-400 dark:text-slate-500 mono:text-white/40"}>
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}