import React, { useEffect, useMemo, useState } from "react";
import {
  fetchSubjectsAPI,
  fetchExamGroupsAPI,
  fetchExamDetailAPI,
  judgeSubmitAPI,
  submitEssayAPI,
  type Subject,
  type ExamGroup,
} from "../api/questions";

type ViewState = "subjects" | "exams" | "doing" | "mcq_result";

type MCQResult = {
  total: number;
  correct: number;
  wrongItems: Array<{
    id: string;
    question: string;
    picked?: string;
    answer?: string;
    options: { id: string; text: string }[];
    explain?: string;
    topics?: string[];
  }>;
};

const normalizeQuestionText = (s: string) => {
  if (!s) return "";
  return s.replace(/^\s*c[aâ]u\s*\d+\s*[:.]\s*/i, "").trim();
};

export default function Practice() {
  const [view, setView] = useState<ViewState>("subjects");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examDetail, setExamDetail] = useState<any>(null);
  const [loadingExamDetail, setLoadingExamDetail] = useState(false);

  const [mcqResult, setMcqResult] = useState<MCQResult | null>(null);

  // Load subjects
  useEffect(() => {
    (async () => {
      setLoadingSubjects(true);
      try {
        const data = await fetchSubjectsAPI();

        // ✅ Bạn muốn “ô ôn mới” xuất hiện thêm -> append static subjects ở FE (Cách A)
        const EXTRA: Subject[] = [
          { id: "ctdl", name: "CTDL", iconType: "ctdl" },
          { id: "gt", name: "Giải thuật", iconType: "gt" },
          { id: "csdl", name: "CSDL", iconType: "csdl" },
          { id: "ktlt", name: "KTLT", iconType: "ktlt" },
          { id: "mmt", name: "MMT", iconType: "mmt" },
          { id: "os", name: "Hệ điều hành", iconType: "os" },
        ];

        // tránh trùng id
        const map = new Map<string, Subject>();
        for (const s of data) map.set(s.id, s);
        for (const s of EXTRA) if (!map.has(s.id)) map.set(s.id, s);

        setSubjects(Array.from(map.values()));
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, []);

  // When subject selected -> load groups (midterm/final)
  useEffect(() => {
    if (!selectedSubject) return;
    (async () => {
      setLoadingExams(true);
      try {
        const gs = await fetchExamGroupsAPI(selectedSubject.id);
        setGroups(gs);
        setView("exams");
      } catch (e: any) {
        alert(e?.message ?? "Không load được danh sách đề");
      } finally {
        setLoadingExams(false);
      }
    })();
  }, [selectedSubject]);

  // Start exam -> fetch detail
  const startExam = async (examId: string) => {
    setSelectedExamId(examId);
    setLoadingExamDetail(true);
    try {
      const detail = await fetchExamDetailAPI(examId);
      setExamDetail(detail);
      setMcqResult(null);
      setView("doing");
    } catch (e: any) {
      alert(e?.message ?? "Không load được đề");
    } finally {
      setLoadingExamDetail(false);
    }
  };

  const getSubjectIcon = (type: string) => {
    if (type === "cpp" || type === "cs101") {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  };

  // ====== Doing exam: split items ======
  const items = (examDetail?.items || []) as any[];
  const mcqItems = useMemo(() => items.filter((x) => x.type === "mcq"), [items]);
  const essayItems = useMemo(() => items.filter((x) => x.type === "essay"), [items]);
  const codingItems = useMemo(() => items.filter((x) => x.type === "coding"), [items]);

  // ====== MCQ UI ======
  const MCQInterface = ({ questions, title }: { questions: any[]; title: string }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    useEffect(() => {
      setCurrentQIndex(0);
      setAnswers({});
      setTimeLeft(30 * 60);
    }, [questions]);

    useEffect(() => {
      if (timeLeft <= 0) return;
      const timerId = setInterval(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    if (questions.length === 0) return <div>Không có câu trắc nghiệm.</div>;

    const q = questions[currentQIndex];

    // options backend giữ list string -> map to a,b,c,d
    const options: { id: string; text: string }[] = (q.options || []).map((t: string, i: number) => ({
      id: String.fromCharCode(97 + i),
      text: t,
    }));

    const submit = () => {
      let correct = 0;
      const wrongItems: MCQResult["wrongItems"] = [];

      for (const qq of questions) {
        const picked = answers[qq.id];
        const ans = (qq.answer || "").toString().trim(); // expected a/b/c/d
        const opts = (qq.options || []).map((t: string, i: number) => ({
          id: String.fromCharCode(97 + i),
          text: t,
        }));

        if (picked && ans && picked === ans) {
          correct++;
        } else {
          wrongItems.push({
            id: qq.id,
            question: normalizeQuestionText(qq.question),
            picked,
            answer: ans,
            options: opts,
            explain: qq.explain,
            topics: qq.topics,
          });
        }
      }

      setMcqResult({
        total: questions.length,
        correct,
        wrongItems,
      });
      setView("mcq_result");
    };

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto flex flex-col min-h-[600px] animate-fade-in relative">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#00529c]">{title}</h2>
          <span className="font-bold px-4 py-2 rounded-xl flex items-center gap-2 bg-slate-100 text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thời gian: {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Câu {currentQIndex + 1}: {normalizeQuestionText(q.question)}
          </h3>

          {Array.isArray(q.topics) && q.topics.length > 0 && (
            <div className="text-sm text-slate-500 font-bold mb-5">
              Chủ đề: {q.topics.slice(0, 3).join(", ")}
            </div>
          )}

          <div className="space-y-4">
            {options.map((opt: { id: string; text: string }) => (
              <label
                key={opt.id}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                  answers[q.id] === opt.id
                    ? "border-[#00529c] bg-blue-50/50 ring-1 ring-[#00529c]"
                    : "border-gray-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt.id,
                    }))
                  }
                  className="w-5 h-5 text-[#00529c] focus:ring-[#00529c] border-gray-300 mr-4"
                />
                <span className={`font-medium ${answers[q.id] === opt.id ? "text-[#00529c]" : "text-slate-700"}`}>
                  {opt.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setCurrentQIndex((p) => Math.max(0, p - 1))}
            disabled={currentQIndex === 0}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Câu trước
          </button>

          <div className="text-slate-500 font-bold">
            {currentQIndex + 1} / {questions.length}
          </div>

          {currentQIndex === questions.length - 1 ? (
            <button
              onClick={submit}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md shadow-green-600/20"
            >
              Nộp trắc nghiệm
            </button>
          ) : (
            <button
              onClick={() => setCurrentQIndex((p) => Math.min(questions.length - 1, p + 1))}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#00529c] hover:bg-blue-800 transition-colors shadow-md shadow-[#00529c]/20"
            >
              Câu tiếp theo
            </button>
          )}
        </div>
      </div>
    );
  };

  // ====== MCQ Result Page ======
  const MCQResultPage = ({ result }: { result: MCQResult }) => {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="text-2xl font-extrabold text-[#00529c]">Kết quả Trắc nghiệm</div>
          <div className="mt-3 text-lg font-bold text-slate-700">
            Điểm: {result.correct}/{result.total}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setView("doing")}
              className="px-5 py-2 rounded-xl font-bold text-white bg-[#00529c] hover:bg-blue-800"
            >
              Xem lại đề
            </button>
            <button
              onClick={() => setView("exams")}
              className="px-5 py-2 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Quay lại danh sách đề
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="text-xl font-extrabold text-slate-800 mb-4">Các câu làm sai</div>

          {result.wrongItems.length === 0 ? (
            <div className="text-emerald-700 font-bold">✅ Bạn làm đúng hết!</div>
          ) : (
            <div className="space-y-4">
              {result.wrongItems.map((w, idx) => (
                <div key={w.id} className="border border-gray-100 rounded-2xl p-5">
                  <div className="font-bold text-slate-800">
                    #{idx + 1}. {w.question}
                  </div>

                  {w.topics?.length ? (
                    <div className="text-sm text-slate-500 font-bold mt-1">Chủ đề: {w.topics.slice(0, 5).join(", ")}</div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <div className="font-bold text-red-700">Bạn chọn</div>
                      <div className="text-slate-700 font-medium">
                        {w.picked ? `${w.picked}. ${w.options.find((o) => o.id === w.picked)?.text ?? ""}` : "(chưa chọn)"}
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <div className="font-bold text-emerald-700">Đáp án đúng</div>
                      <div className="text-slate-700 font-medium">
                        {w.answer ? `${w.answer}. ${w.options.find((o) => o.id === w.answer)?.text ?? ""}` : "(không có đáp án)"}
                      </div>
                    </div>
                  </div>

                  {w.explain && (
                    <div className="mt-3 text-slate-700 bg-slate-50 border border-gray-100 rounded-xl p-3">
                      <div className="font-bold mb-1">Giải thích</div>
                      <div>{w.explain}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====== Essay UI (hiện đáp án mẫu dưới textarea sau khi chấm) ======
const EssayInterface = ({ questions }: { questions: any[] }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);

  // lưu kết quả chấm theo từng câu
  const [grades, setGrades] = useState<Record<string, any>>({});

  const gradeOne = async (qid: string) => {
    setGrading(true);
    try {
      const res = await submitEssayAPI({ questionId: qid, answerText: answers[qid] || "" });

      setGrades((prev) => ({ ...prev, [qid]: res }));
    } catch (e: any) {
      alert(e?.message ?? "Chấm tự luận lỗi");
    } finally {
      setGrading(false);
    }
  };

  if (questions.length === 0) return <div>Không có câu tự luận.</div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-[#00529c]">Tự luận</h2>

      {questions.map((q) => {
        const g = grades[q.id]; // kết quả chấm (nếu có)

        return (
          <div key={q.id} className="border border-gray-100 rounded-2xl p-5">
            <div className="font-bold text-slate-800 mb-2">{q.question}</div>

            {Array.isArray(q.rubric) && q.rubric.length > 0 && (
              <div className="text-sm text-slate-500 font-medium mb-3">
                Gợi ý chấm: {q.rubric.join(" • ")}
              </div>
            )}

            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              className="w-full min-h-[140px] border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#00529c]/30"
              placeholder="Nhập bài làm của bạn..."
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              {g ? (
                <div className="font-bold text-slate-700">
                  Điểm: {g.score}/{g.maxScore}{" "}
                  <span className="text-slate-400 font-semibold">
                    (độ gần đúng: {Math.round((g.similarity || 0) * 100)}%)
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 font-bold">Chưa chấm</div>
              )}

              <button
                disabled={grading}
                onClick={() => gradeOne(q.id)}
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#00529c] hover:bg-blue-800 disabled:opacity-60"
              >
                Chấm câu này
              </button>
            </div>

            {/* feedback */}
            {g && (
              <div className="mt-4 bg-slate-50 border border-gray-100 rounded-2xl p-4">
                <div className="font-bold text-slate-800 mb-2">Nhận xét</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {(g.feedback || []).map((x: string, i: number) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>

                {/* keyword breakdown */}
                <div className="mt-3 text-sm">
                  {!!(g.matched_keywords || []).length && (
                    <div className="text-emerald-700 font-bold">
                      Đã có: {(g.matched_keywords || []).join(", ")}
                    </div>
                  )}
                  {!!(g.missing_keywords || []).length && (
                    <div className="text-red-600 font-bold mt-1">
                      Còn thiếu: {(g.missing_keywords || []).slice(0, 12).join(", ")}
                      {(g.missing_keywords || []).length > 12 ? "..." : ""}
                    </div>
                  )}
                </div>

                {/* ✅ suggested answer shown under textarea */}
                {g.suggested_answer && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <div className="font-bold text-slate-800 mb-2">Đáp án gợi ý</div>
                    <div className="text-slate-700 whitespace-pre-wrap">{g.suggested_answer}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

  // ====== Coding UI (LeetCode-lite) ======
  const CodingInterface = ({ problems }: { problems: any[] }) => {
    const [idx, setIdx] = useState(0);
    const prob = problems[idx];

    const langs = Object.keys(prob?.languageTemplates || { cpp: "" });
    const [lang, setLang] = useState(langs[0] || "cpp");
    const [code, setCode] = useState((prob?.languageTemplates?.[lang] as string) || "");
    const [output, setOutput] = useState<any>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      if (!prob) return;
      const ls = Object.keys(prob.languageTemplates || { cpp: "" });
      const first = ls[0] || "cpp";
      setLang(first);
      setCode(prob.languageTemplates?.[first] || "");
      setOutput(null);
    }, [idx]);

    useEffect(() => {
      if (!prob) return;
      setCode(prob.languageTemplates?.[lang] || code);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    const run = async (mode: "sample" | "tests") => {
      setRunning(true);
      try {
        const res = await judgeSubmitAPI({
          problemId: prob.id,
          language: lang,
          sourceCode: code,
          mode,
        });
        setOutput(res);
      } catch (e: any) {
        alert(e?.message ?? "Judge lỗi");
      } finally {
        setRunning(false);
      }
    };

    if (!problems.length) return <div>Không có bài code.</div>;

    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#00529c]">{prob.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIdx((p) => Math.max(0, p - 1))}
                disabled={idx === 0}
                className="px-3 py-1.5 rounded-lg font-bold bg-slate-100 text-slate-700 disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={() => setIdx((p) => Math.min(problems.length - 1, p + 1))}
                disabled={idx === problems.length - 1}
                className="px-3 py-1.5 rounded-lg font-bold bg-slate-100 text-slate-700 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>

          <div className="text-slate-700 mt-3 whitespace-pre-wrap">{prob.description}</div>

          {Array.isArray(prob.samples) && prob.samples.length > 0 && (
            <div className="mt-5">
              <div className="font-bold text-slate-800 mb-2">Ví dụ</div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm">
                <div className="font-bold">Input</div>
                <pre className="whitespace-pre-wrap">{prob.samples[0].input}</pre>
                <div className="font-bold mt-2">Output</div>
                <pre className="whitespace-pre-wrap">{prob.samples[0].output}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1e1e1e] rounded-3xl border border-slate-300 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-[#111]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#1e1e1e] text-[#9cdcfe] border border-[#333] rounded-lg px-3 py-1 text-sm font-bold outline-none"
              >
                {langs.map((l: string) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                disabled={running}
                onClick={() => run("sample")}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
              >
                Run sample
              </button>
              <button
                disabled={running}
                onClick={() => run("tests")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-transparent text-[#d4d4d4] font-mono text-[14px] p-4 resize-none outline-none leading-relaxed"
          />

          <div className="bg-[#111] border-t border-[#222] p-4 text-sm text-slate-200">
            <div className="font-bold mb-2">Kết quả</div>
            {!output ? (
              <div className="text-slate-400">Chưa chạy.</div>
            ) : (
              <div className="space-y-2">
                <div className="font-bold">
                  Status: <span className="text-white">{output.status}</span> — {output.passed}/{output.total}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== Breadcrumb =====
  const backToSubjects = () => {
    setSelectedSubject(null);
    setGroups([]);
    setSelectedExamId(null);
    setExamDetail(null);
    setMcqResult(null);
    setView("subjects");
  };

  const backToExams = () => {
    setSelectedExamId(null);
    setExamDetail(null);
    setMcqResult(null);
    setView("exams");
  };

  return (
    <div className="animate-fade-in font-sans pb-10">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3 text-sm font-bold">
        <button
          onClick={backToSubjects}
          className={`${view === "subjects" ? "text-[#00529c] text-2xl" : "text-slate-400 hover:text-[#00529c]"}`}
        >
          Luyện Đề
        </button>

        {selectedSubject && (
          <>
            <span className="text-slate-300">/</span>
            <button
              onClick={backToExams}
              className={`${view === "exams" ? "text-[#00529c] text-lg" : "text-slate-400 hover:text-[#00529c]"}`}
            >
              {selectedSubject.name}
            </button>
          </>
        )}

        {selectedExamId && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-[#00529c] text-lg">{selectedExamId}</span>
          </>
        )}
      </div>

      {/* VIEW: SUBJECTS */}
      {view === "subjects" && (
        <>
          {loadingSubjects ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00529c] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group flex items-center gap-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#00529c] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-[#00529c] group-hover:text-white transition-all duration-300 shadow-sm">
                    {getSubjectIcon(sub.iconType)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-[#00529c] transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">Chọn để xem Giữa kỳ / Cuối kỳ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW: EXAMS */}
      {view === "exams" && (
        <>
          {loadingExams ? (
            <div className="text-slate-600 font-bold">Đang tải danh sách đề...</div>
          ) : (
            <div className="space-y-6 max-w-5xl">
              {groups.map((g) => (
                <div key={g.timing} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="text-xl font-extrabold text-[#00529c] mb-4">{g.label}</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {g.exams.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => startExam(ex.id)}
                        className="p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="font-bold text-slate-800">{ex.title}</div>
                        <div className="text-sm text-slate-500 font-bold mt-2 flex gap-3">
                          <span>MCQ: {ex.counts.mcq}</span>
                          <span>Tự luận: {ex.counts.essay}</span>
                          <span>Code: {ex.counts.coding}</span>
                        </div>
                        {loadingExamDetail && selectedExamId === ex.id && (
                          <div className="text-sm font-bold text-slate-500 mt-3">Đang tải đề...</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW: DOING */}
      {view === "doing" && (
        <div className="space-y-10">
          {mcqItems.length > 0 && <MCQInterface questions={mcqItems} title="Trắc nghiệm" />}
          {essayItems.length > 0 && <EssayInterface questions={essayItems} />}
          {codingItems.length > 0 && <CodingInterface problems={codingItems} />}

          {mcqItems.length === 0 && essayItems.length === 0 && codingItems.length === 0 && (
            <div className="text-slate-600 font-bold">Đề này đang trống (chưa có câu trong questions.json).</div>
          )}
        </div>
      )}

      {/* VIEW: MCQ RESULT */}
      {view === "mcq_result" && mcqResult && <MCQResultPage result={mcqResult} />}
    </div>
  );
}