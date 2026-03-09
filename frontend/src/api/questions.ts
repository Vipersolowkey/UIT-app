// src/api/questions.ts

export interface ExamCounts {
  mcq: number;
  essay: number;
  coding: number;
}

export interface ExamCard {
  id: string;
  title: string;
  counts: ExamCounts;
}

export interface ExamGroup {
  timing: "midterm" | "final";
  label: string;
  exams: ExamCard[];
}

export interface Subject {
  id: string;
  name: string;
  iconType: string;
}

export type QuestionType = "mcq" | "essay" | "coding";

export interface MCQQuestion {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answer?: string;
  explain?: string;
}

export interface EssayQuestion {
  id: string;
  type: "essay";
  question: string;
  rubric?: string[];
  maxScore?: number;
}

export interface CodingProblem {
  id: string;
  type: "coding";
  title: string;
  description: string;
  languageTemplates?: Record<string, string>;
  samples?: { input: string; output: string }[];
}

export interface ExamDetail {
  exam_id: string;
  subject: string;
  timing: "midterm" | "final";
  items: Array<any>;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

// 1) subjects
export async function fetchSubjectsAPI(): Promise<Subject[]> {
  const res = await fetch(`${API_BASE}/questions/subjects`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Failed to load subjects");
  }
  const data = await res.json(); // {subjects:[]}
  return (data.subjects || []).map((sid: string) => ({
    id: sid,
    name: sid.toUpperCase(),
    iconType: sid,
  }));
}

// 2) exam groups (midterm/final)
export async function fetchExamGroupsAPI(subject: string): Promise<ExamGroup[]> {
  const res = await fetch(`${API_BASE}/questions/exams?subject=${encodeURIComponent(subject)}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Failed to load exams");
  }
  const data = await res.json(); // {subject, groups}
  return data.groups || [];
}

// 3) exam detail
export async function fetchExamDetailAPI(examId: string): Promise<ExamDetail> {
  const res = await fetch(`${API_BASE}/questions/exam/${encodeURIComponent(examId)}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Failed to load exam detail");
  }
  return await res.json();
}

// 4) judge submit
export async function judgeSubmitAPI(payload: {
  problemId: string;
  language: string;
  sourceCode: string;
  mode: "sample" | "tests";
}) {
  const res = await fetch(`${API_BASE}/judge/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Judge submit failed");
  }
  return await res.json();
}

// 5) submit essay
export async function submitEssayAPI(payload: { questionId: string; answerText: string }) {
  const res = await fetch(`${API_BASE}/attempts/submit-essay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.detail || err?.message || err?.raw || "Submit essay failed");
  }
  return await res.json();
}