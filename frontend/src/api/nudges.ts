// frontend/src/api/nudges.ts
export type NudgeType = "practice_mcq" | "practice_essay" | "practice_coding" | "review" | "mixed";
export type ExamTiming = "midterm" | "final";

export interface NudgeItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  nudge_type: NudgeType;
  timing?: ExamTiming | null;
  topic?: string | null;
  num_questions: number;
  priority: number;
  icon?: string | null;
  meta?: Record<string, any>;
}

export interface NudgeListResponse {
  items: NudgeItem[];
  generated_at: string;
}

export interface AcceptNudgeRequest {
  nudge_id: string;
  subject?: string;
  topic?: string | null;
  timing?: ExamTiming | null;
  want_materials?: boolean;
  want_practice?: boolean;
  num_questions?: number;
}

export interface AcceptNudgeResponse {
  nudge_id: string;
  materials: { title: string; url: string }[];
  practice: any[];
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "https://uit-app.onrender.com";
  
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

export async function fetchTodayNudgesAPI(): Promise<NudgeItem[]> {
  const res = await fetch(`${API_BASE}/nudges/today`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Failed to load nudges");
  }
  const data = (await res.json()) as NudgeListResponse;
  return data.items || [];
}

export async function acceptNudgeAPI(payload: AcceptNudgeRequest): Promise<AcceptNudgeResponse> {
  const res = await fetch(`${API_BASE}/nudges/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      want_materials: true,
      want_practice: true,
      num_questions: 10,
      ...payload,
    }),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Failed to accept nudge");
  }
  return res.json();
}