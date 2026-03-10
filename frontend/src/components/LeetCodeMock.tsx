// src/components/LeetCodeMock.tsx
import { useEffect, useMemo, useState } from "react";
import { CODING_PROBLEMS, type CodingProblem } from "../data/coding_problems";
import { runJudgeMock, type JudgeResult } from "../api/judge_mock";

type Lang = "cpp" | "java" | "py";

const LANG_LABEL: Record<Lang, string> = {
  cpp: "C++",
  java: "Java",
  py: "Python",
};

function lsKey(problemId: string, lang: Lang) {
  return `mocklc:${problemId}:${lang}`;
}

export default function LeetCodeMock() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [tag, setTag] = useState<string>("All");

  const allTags = useMemo(() => {
    const s = new Set<string>();
    CODING_PROBLEMS.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return ["All", ...Array.from(s).sort()];
  }, []);

  const filtered = useMemo(() => {
    return CODING_PROBLEMS.filter((p) => {
      const okQuery =
        !query.trim() ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase());
      const okDiff = difficulty === "All" ? true : p.difficulty === difficulty;
      const okTag = tag === "All" ? true : p.tags.includes(tag);
      return okQuery && okDiff && okTag;
    });
  }, [query, difficulty, tag]);

  const [selectedId, setSelectedId] = useState<string>(CODING_PROBLEMS[0]?.id ?? "");
  const problem = useMemo(
    () => CODING_PROBLEMS.find((p) => p.id === selectedId) ?? CODING_PROBLEMS[0],
    [selectedId]
  );

  const [lang, setLang] = useState<Lang>("cpp");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"Description" | "Submissions">("Description");

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);

  const [submissions, setSubmissions] = useState<
    Array<{ time: string; problemId: string; lang: Lang; status: string; runtimeMs: number }>
  >([]);

  // load submissions history
  useEffect(() => {
    const raw = localStorage.getItem("mocklc:submissions");
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // load code khi đổi bài/lang
  useEffect(() => {
    if (!problem) return;

    const saved = localStorage.getItem(lsKey(problem.id, lang));
    if (saved) {
      setCode(saved);
      return;
    }
    setCode(problem.starterCode[lang] ?? "");
  }, [problem?.id, lang]);

  // auto save code
  useEffect(() => {
    if (!problem) return;
    localStorage.setItem(lsKey(problem.id, lang), code);
  }, [code, problem?.id, lang]);

  const badgeColor = (diff: CodingProblem["difficulty"]) => {
    if (diff === "Easy") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (diff === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const run = async (mode: "sample" | "submit") => {
    if (!problem) return;
    setRunning(true);
    setResult(null);

    try {
      const r = await runJudgeMock({
        problem,
        language: lang,
        sourceCode: code,
        mode,
      });
      setResult(r);

      // lưu submissions nếu submit
      if (mode === "submit") {
        const item = {
          time: new Date().toLocaleString(),
          problemId: problem.id,
          lang,
          status: r.status,
          runtimeMs: r.runtimeMs,
        };
        const next = [item, ...submissions].slice(0, 50);
        setSubmissions(next);
        localStorage.setItem("mocklc:submissions", JSON.stringify(next));
        setActiveTab("Submissions");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
      <div className="h-full flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-[360px] bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="font-extrabold text-slate-800 text-lg">Bài Code</div>
            <div className="text-slate-500 text-sm font-medium mt-1">
              Mock LeetCode UI (chưa cần Judge)
            </div>

            <div className="mt-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00529c]/30"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                  p.id === selectedId ? "bg-blue-50/60" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-800">{p.title}</div>
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-lg border ${badgeColor(p.difficulty)}`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {p.tags.slice(0, 3).join(" · ")}
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-6 text-slate-500 font-medium">Không tìm thấy bài nào.</div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN */}
        <main className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="font-extrabold text-[#00529c] text-lg">{problem?.title}</div>
              {problem && (
                <span className={`text-xs font-black px-2 py-1 rounded-lg border ${badgeColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("Description")}
                className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                  activeTab === "Description"
                    ? "bg-[#00529c] text-white border-[#00529c]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("Submissions")}
                className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                  activeTab === "Submissions"
                    ? "bg-[#00529c] text-white border-[#00529c]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Submissions
              </button>
            </div>
          </div>

          {/* SPLIT AREA */}
          <div className="flex-1 grid grid-cols-2 gap-0">
            {/* LEFT PANEL */}
            <section className="border-r border-slate-200 bg-white overflow-y-auto">
              {activeTab === "Description" ? (
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem?.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="text-slate-800 font-bold text-base mb-2">Mô tả</div>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {problem?.statement}
                  </div>

                  <div className="mt-6">
                    <div className="text-slate-800 font-bold text-base mb-2">Ví dụ</div>
                    <div className="space-y-4">
                      {problem?.samples.map((s, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-sm font-bold text-slate-700">Input</div>
                          <div className="font-mono text-sm text-slate-800 mt-1">{s.input}</div>

                          <div className="text-sm font-bold text-slate-700 mt-3">Output</div>
                          <div className="font-mono text-sm text-slate-800 mt-1">{s.output}</div>

                          {s.explain && (
                            <>
                              <div className="text-sm font-bold text-slate-700 mt-3">Giải thích</div>
                              <div className="text-sm text-slate-700 mt-1">{s.explain}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {problem?.constraints?.length ? (
                    <div className="mt-6">
                      <div className="text-slate-800 font-bold text-base mb-2">Constraints</div>
                      <ul className="list-disc pl-6 text-slate-700">
                        {problem.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-6">
                  <div className="font-extrabold text-slate-800 text-lg mb-4">Lịch sử nộp</div>

                  {submissions.length === 0 ? (
                    <div className="text-slate-500 font-medium">Chưa có submission nào.</div>
                  ) : (
                    <div className="space-y-2">
                      {submissions.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800">
                              {s.problemId} · {LANG_LABEL[s.lang]}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1">{s.time}</div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-black ${
                                s.status === "Accepted" ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {s.status}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">{s.runtimeMs} ms</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* RIGHT PANEL */}
            <section className="bg-[#0f172a] flex flex-col">
              {/* editor topbar */}
              <div className="bg-[#111827] border-b border-[#0b1220] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                  </div>

                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className="bg-[#0f172a] text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold"
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="py">Python</option>
                  </select>

                  <span className="text-slate-400 text-xs font-bold ml-2">
                    Auto-save theo bài ✅
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={running}
                    onClick={() => run("sample")}
                    className="px-4 py-2 rounded-xl font-black text-sm bg-slate-200 text-slate-900 hover:bg-white transition disabled:opacity-50"
                  >
                    {running ? "Đang chạy..." : "Run sample"}
                  </button>
                  <button
                    disabled={running}
                    onClick={() => run("submit")}
                    className="px-4 py-2 rounded-xl font-black text-sm bg-emerald-500 text-white hover:bg-emerald-400 transition disabled:opacity-50"
                  >
                    {running ? "Đang chấm..." : "Submit"}
                  </button>
                </div>
              </div>

              {/* editor */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full bg-[#0f172a] text-slate-100 font-mono text-[13px] p-4 outline-none resize-none"
                />
              </div>

              {/* console */}
              <div className="h-[240px] bg-[#0b1220] border-t border-[#0b1220] p-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-200">Console</div>
                  {result && (
                    <div
                      className={`text-sm font-black ${
                        result.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {result.status} · {result.passed}/{result.total}
                    </div>
                  )}
                </div>

                {!result ? (
                  <div className="text-slate-400 text-sm font-medium mt-3">
                    Bấm Run sample hoặc Submit để xem kết quả.
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="text-slate-300 text-sm font-bold">
                      Runtime: {result.runtimeMs} ms · Memory: {result.memoryKb} KB
                    </div>

                    {result.stderr ? (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-rose-200 text-sm font-mono whitespace-pre-wrap">
                        {result.stderr}
                      </div>
                    ) : null}

                    {result.details?.length ? (
                      <div className="space-y-2">
                        {result.details.slice(0, 6).map((d, i) => (
                          <div
                            key={i}
                            className={`rounded-xl border p-3 ${
                              d.ok
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-rose-500/10 border-rose-500/30"
                            }`}
                          >
                            <div className="text-xs font-black text-slate-200">
                              Test {i + 1}: {d.ok ? "OK" : "FAIL"}
                            </div>
                            <div className="mt-2 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                              Input: {d.input}
                            </div>
                            <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                              Expected: {d.expected}
                            </div>
                            <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                              Got: {d.got}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-300 text-sm font-medium">{result.stdout}</div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}