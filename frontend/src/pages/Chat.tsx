import React, { useState, useEffect, useRef } from "react";
import { fetchChatHistoryAPI, sendMessageToAI } from "../api/chat";
import type { ChatMessage } from "../api/chat";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialChat = async () => {
      try {
        const history = await fetchChatHistoryAPI();
        setMessages(history);
      } catch (e) {
        console.error("Không load được lịch sử chat:", e);
      }
    };
    loadInitialChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await sendMessageToAI(userText);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);

      const failMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text: "Mình bị lỗi khi gọi server. Bạn thử lại giúp mình nhé.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, failMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ future-proof: timestamp có thể là Date hoặc string
  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Enter gửi, Shift+Enter xuống dòng
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="animate-fade-in font-sans h-[calc(100vh-110px)] flex flex-col w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col flex-1 overflow-hidden relative">
        {/* HEADER */}
        <div className="px-6 py-4 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 flex items-center gap-4 sticky top-0">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-tr from-[#00529c] to-blue-500 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">Trợ lý ảo xênh zai của bạn</h2>
            <p className="text-[13px] text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Đang hoạt động
            </p>
          </div>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto bg-[#f8fafc] custom-scrollbar flex flex-col gap-5 pb-28">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={msg.id} className={`flex gap-3 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
                {/* Avatar Bot */}
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-white border border-blue-50 flex items-center justify-center shrink-0 shadow-sm self-end mb-1">
                    <svg className="w-4 h-4 text-[#00529c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                  <div
                    className={`px-5 py-3.5 rounded-[22px] text-[14.5px] leading-relaxed shadow-sm relative group transition-all ${
                      isBot
                        ? "bg-white border border-gray-100 text-slate-700 rounded-bl-md shadow-slate-200/50"
                        : "bg-gradient-to-br from-[#00529c] to-blue-600 text-white rounded-br-md shadow-blue-500/25 border border-transparent"
                    }`}
                  >
                    {/* ✅ FIX MẤT ĐOẠN: render nguyên text + pre-wrap */}
                    <div className="whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>

                    <div className={`text-[10px] mt-1.5 text-right ${isBot ? "text-slate-400" : "text-blue-100/80"}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 flex-row items-end">
              <div className="w-8 h-8 rounded-full bg-white border border-blue-50 flex items-center justify-center shrink-0 shadow-sm mb-1">
                <svg className="w-4 h-4 text-[#00529c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="px-4 py-3 bg-white border border-gray-100 rounded-[22px] rounded-bl-md shadow-sm flex gap-1.5 items-center h-[42px]">
                <div className="w-1.5 h-1.5 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR (friendly) */}
        <div className="p-4 bg-white/80 backdrop-blur-md absolute bottom-0 left-0 right-0 z-20 border-t border-gray-50">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            {/* input bubble */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-500">Nhập tin nhắn</div>
                <div className="text-[11px] text-slate-400 font-medium">
                </div>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                rows={2}
                className="w-full resize-none bg-transparent outline-none text-[14px] font-medium text-slate-700 placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* send button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-[52px] w-[52px] shrink-0 bg-gradient-to-r from-[#00529c] to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 transition-all hover:shadow-md hover:scale-[1.03] active:scale-95 flex items-center justify-center"
              title="Gửi"
            >
              <svg className="w-6 h-6 ml-0.5 -rotate-45 translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}