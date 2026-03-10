// ==============================
// 1) Khuôn mẫu dữ liệu cho một tin nhắn (UI dùng)
// ==============================
export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date | string; // ✅ future-proof (Date hoặc string)
  citations?: Citation[];
}

// ==============================
// 2) Citation type (optional)
// ==============================
export interface Citation {
  source: string;
  chunk_id?: string | null;
  excerpt?: string | null;
  score?: number | null;
}

// ==============================
// 3) Lịch sử trò chuyện ban đầu
// ==============================
export const initialChatHistory: ChatMessage[] = [
  {
    id: "msg_0",
    sender: "bot",
    text: "Chào bạn Vinh đẹp zai! 👋\nMình là em trợ lí của bạn. Bạn cần mình hỗ trợ gì về việc học tập hay luyện đề hôm nay?",
    timestamp: new Date(),
  },
];

// ==============================
// 4) Mock history (MVP OK)
// ==============================
export const fetchChatHistoryAPI = async (): Promise<ChatMessage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(initialChatHistory), 500);
  });
};

// ==============================
// 5) API config
// ==============================
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://uit-app.onrender.com";

// ✅ chỉnh đúng theo Swagger:
// - "/chat" nếu endpoint là POST /chat
// - "/chat/chat" nếu endpoint là POST /chat/chat
const CHAT_PATH = "/chat";
const CHAT_ENDPOINT = `${API_BASE}${CHAT_PATH}`;

// ==============================
// 6) Backend types
// ==============================
type BackendChatRequest = {
  question: string;
};

type BackendChatResponse = {
  answer: string;
  citations?: Citation[];
};

// ==============================
// 7) Safe error parser
// ==============================
async function safeErrorText(res: Response) {
  const text = await res.text();
  try {
    const j = text ? JSON.parse(text) : null;
    return (j && (j.detail || j.message)) || text || `HTTP ${res.status}`;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

// ==============================
// 8) Send message to backend thật
// ==============================
export const sendMessageToAI = async (
  userMessage: string
): Promise<ChatMessage> => {
  const payload: BackendChatRequest = { question: userMessage };

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await safeErrorText(res);
      throw new Error(detail);
    }

    const data = (await res.json()) as BackendChatResponse;

    return {
      id: `msg_${Date.now()}`,
      sender: "bot",
      text: data.answer ?? "Mình chưa nhận được câu trả lời.",
      timestamp: new Date(),
      citations: data.citations ?? [],
    };
  } catch (e: any) {
    return {
      id: `msg_${Date.now()}`,
      sender: "bot",
      text:
        "⚠️ Không gọi được server chatbot (backend chưa chạy / sai endpoint / CORS).\n" +
        `Chi tiết: ${e?.message ?? "unknown error"}`,
      timestamp: new Date(),
    };
  }
};