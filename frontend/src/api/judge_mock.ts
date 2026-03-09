// src/api/judge_mock.ts
import type { CodingProblem } from "../data/coding_problems";

export type JudgeMode = "sample" | "submit";

export interface JudgeResult {
  status: "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error";
  runtimeMs: number;
  memoryKb: number;
  passed: number;
  total: number;
  stdout?: string;
  stderr?: string;
  details?: Array<{
    ok: boolean;
    input: string;
    expected: string;
    got: string;
  }>;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function quickHeuristic(language: string, code: string) {
  const c = code.toLowerCase();

  // giả lập compile fail
  if (language === "cpp" && c.includes("include") === false) return "Compilation Error";
  if (language === "java" && c.includes("class") === false) return "Compilation Error";
  if (language === "py" && c.includes("def") === false) return "Compilation Error";

  // giả lập runtime error
  if (c.includes("segfault") || c.includes("nullpointer") || c.includes("raise")) return "Runtime Error";

  return null;
}

export async function runJudgeMock(args: {
  problem: CodingProblem;
  language: "cpp" | "java" | "py";
  sourceCode: string;
  mode: JudgeMode;
}): Promise<JudgeResult> {
  const { problem, language, sourceCode, mode } = args;

  // giả lập chạy
  await sleep(mode === "sample" ? 800 : 1200);

  const failType = quickHeuristic(language, sourceCode);
  if (failType) {
    return {
      status: failType as any,
      runtimeMs: 0,
      memoryKb: 0,
      passed: 0,
      total: mode === "sample" ? problem.samples.length : 10,
      stderr: `${failType}: Code thiếu cấu trúc cơ bản.`,
      details: [],
    };
  }

  // heuristics "đúng" dựa vào keyword đơn giản
  const okByKeyword =
    sourceCode.includes("unordered_map") ||
    sourceCode.includes("HashMap") ||
    sourceCode.includes("dict") ||
    sourceCode.includes("stack") ||
    sourceCode.includes("Stack") ||
    sourceCode.includes("set") ||
    sourceCode.includes("while");

  // random but ổn định hơn
  const base = okByKeyword ? 0.85 : 0.55;
  const ok = Math.random() < base;

  const total = mode === "sample" ? problem.samples.length : 10;
  const passed = ok ? total : Math.max(1, Math.floor(total * 0.3));

  const details =
    mode === "sample"
      ? problem.samples.map((s, idx) => ({
          ok: ok ? true : idx < passed,
          input: s.input,
          expected: s.output,
          got: ok ? s.output : idx < passed ? s.output : "???",
        }))
      : Array.from({ length: total }, (_, i) => ({
          ok: ok ? true : i < passed,
          input: `hidden_test_${i + 1}`,
          expected: "hidden",
          got: ok ? "hidden" : i < passed ? "hidden" : "wrong",
        }));

  return {
    status: ok ? "Accepted" : "Wrong Answer",
    runtimeMs: ok ? 35 + Math.floor(Math.random() * 60) : 40 + Math.floor(Math.random() * 120),
    memoryKb: 12000 + Math.floor(Math.random() * 6000),
    passed,
    total,
    stdout: ok ? "Chạy xong ✅" : "Sai một số test ❌",
    stderr: "",
    details,
  };
}