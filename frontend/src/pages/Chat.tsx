import { useEffect, useMemo, useRef, useState } from "react";
import { fetchChatHistoryAPI, sendMessageToAI } from "../api/chat";
import type { ChatMessage } from "../api/chat";

const QUICK_SUGGESTIONS = [
  "Cho mình hỏi lịch học hôm nay",
  "Có job intern nào phù hợp không?",
  "Tóm tắt thông báo mới từ trường",
  "Gợi ý ôn tập môn OOP",
];

function TypingText({ text, speed = 14 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let index = 0;

    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <div className="whitespace-pre-wrap break-words">{displayed}</div>;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatedBotId, setAnimatedBotId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [inputValue]);

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();

    const rawText = presetText ?? inputValue;
    if (!rawText.trim()) return;

    const userText = rawText.trim();

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
      setAnimatedBotId(botResponse.id);

      setTimeout(() => {
        setAnimatedBotId((current) => (current === botResponse.id ? null : current));
      }, Math.max(1200, botResponse.text.length * 14 + 400));
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);

      const failMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text: "Mình bị lỗi khi gọi server. Bạn thử lại giúp mình nhé.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, failMsg]);
      setAnimatedBotId(failMsg.id);

      setTimeout(() => {
        setAnimatedBotId((current) => (current === failMsg.id ? null : current));
      }, 1800);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const emptyState = useMemo(() => messages.length === 0, [messages.length]);

  return (
    <div className="animate-fade-in font-sans h-[calc(100vh-110px)] flex flex-col w-full max-w-5xl mx-auto">
      <div className="relative bg-white/80 backdrop-blur-xl rounded-[30px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-white/60 flex flex-col flex-1 overflow-hidden">
        {/* nền trang trí */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 blur-3xl rounded-full"></div>
          <div className="absolute top-24 right-0 w-72 h-72 bg-cyan-200/20 blur-3xl rounded-full"></div>
        </div>

        {/* HEADER */}
        <div className="relative px-6 py-5 bg-white/70 backdrop-blur-md z-10 border-b border-white/60 flex items-center justify-between gap-4 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#00529c] to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            </div>

            <div className="min-w-0">
              <h2 className="font-black text-slate-900 text-lg leading-tight truncate">
                Trợ lý ảo xênh zai của bạn
              </h2>
              <p className="text-[13px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                Online • Sẵn sàng hỗ trợ học tập và việc làm
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-500">
              Chat thông minh
            </div>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[12px] font-bold text-[#00529c]">
              UIT Assistant
            </div>
          </div>
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="relative px-4 sm:px-6 pt-4 pb-2 z-[2] bg-transparent">
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item}
                onClick={() => void handleSendMessage(undefined, item)}
                disabled={isTyping}
                className="shrink-0 px-3.5 py-2 rounded-full bg-white/90 border border-gray-200 text-slate-600 text-[12px] font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-[#00529c] transition-all disabled:opacity-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT BODY */}
        <div className="relative flex-1 px-4 sm:px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5 pb-32">
          {emptyState && !isTyping && (
            <div className="flex-1 min-h-[320px] flex items-center justify-center">
              <div className="max-w-xl w-full text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Chào bạn 👋 Mình có thể giúp gì hôm nay?
                </h3>
                <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                  Hỏi mình về lịch học, thông báo từ trường, luyện đề, định hướng ôn tập,
                  hoặc cả tin tuyển dụng phù hợp cho sinh viên UIT.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            const isAnimatedBot = isBot && animatedBotId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-[fadeIn_0.35s_ease] ${
                  isBot ? "flex-row" : "flex-row-reverse"
                }`}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm self-end mb-1 ${
                    isBot
                      ? "bg-white border border-blue-50 text-[#00529c]"
                      : "bg-gradient-to-br from-[#00529c] to-blue-600 text-white border border-transparent"
                  }`}
                >
                  {isBot ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ) : (
                    <span className="text-[11px] font-black">Bạn</span>
                  )}
                </div>

                <div
                  className={`max-w-[88%] sm:max-w-[76%] flex flex-col ${
                    isBot ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`px-5 py-4 rounded-[24px] text-[14.5px] leading-relaxed shadow-sm relative transition-all duration-200 ${
                      isBot
                        ? "bg-white/95 backdrop-blur-sm border border-gray-100 text-slate-700 rounded-bl-md shadow-slate-200/60"
                        : "bg-gradient-to-br from-[#00529c] to-blue-600 text-white rounded-br-md shadow-blue-500/25"
                    }`}
                  >
                    {isAnimatedBot ? (
                      <TypingText text={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    )}

                    <div
                      className={`text-[10px] mt-2 text-right ${
                        isBot ? "text-slate-400" : "text-blue-100/80"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 flex-row items-end animate-[fadeIn_0.25s_ease]">
              <div className="w-9 h-9 rounded-2xl bg-white border border-blue-50 flex items-center justify-center shrink-0 shadow-sm mb-1">
                <svg className="w-4 h-4 text-[#00529c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="px-4 py-3 bg-white border border-gray-100 rounded-[22px] rounded-bl-md shadow-sm flex gap-1.5 items-center h-[44px]">
                <div className="w-2 h-2 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#00529c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-white/80 backdrop-blur-xl border-t border-white/60">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1 bg-white/95 rounded-[26px] border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-black text-slate-500">Nhập tin nhắn</div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Enter để gửi • Shift + Enter xuống dòng
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder={isTyping ? "AI đang soạn phản hồi..." : "Nhập câu hỏi của bạn tại đây..."}
                rows={1}
                className="w-full max-h-[140px] resize-none bg-transparent outline-none text-[14px] font-medium text-slate-700 placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-[56px] w-[56px] shrink-0 bg-gradient-to-r from-[#00529c] to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 transition-all hover:shadow-lg hover:scale-[1.03] active:scale-95 flex items-center justify-center"
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