import { useEffect, useState } from "react";
import { acceptNudgeAPI, fetchTodayNudgesAPI, type NudgeItem } from "../../api/nudges";

interface NudgesProps {
  setActiveTab: (tab: string) => void;
}

function Icon({ name }: { name?: string | null }) {
  const common = "w-5 h-5";
  switch (name) {
    case "bolt":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "flag":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5v16M5 5h11l-1 4 1 4H5" />
        </svg>
      );
    case "target":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0 16v-4m10-6h-4M6 12H2m16.95-6.95l-2.83 2.83M7.88 16.12l-2.83 2.83m0-13.9l2.83 2.83m11.24 11.24l2.83 2.83" />
        </svg>
      );
    case "code":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      );
    case "warning":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      );
    default:
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        </svg>
      );
  }
}

export default function Nudges({ setActiveTab }: NudgesProps) {
  const [items, setItems] = useState<NudgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTodayNudgesAPI();
        setItems(data);
      } catch (e: any) {
        console.warn("Không load được nudges:", e?.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAccept = async (n: NudgeItem) => {
    setBusyId(n.id);
    try {
      const res = await acceptNudgeAPI({
        nudge_id: n.id,
        subject: n.subject,
        topic: n.topic ?? null,
        timing: (n.timing as any) ?? null,
        num_questions: n.num_questions,
      });

      // MVP: lưu practice vào localStorage để Practice page đọc lại
      localStorage.setItem("last_nudge_practice", JSON.stringify(res.practice || []));
      localStorage.setItem("last_nudge_materials", JSON.stringify(res.materials || []));
      localStorage.setItem("last_nudge_subject", n.subject);

      // chuyển tab qua "Luyện Đề"
      setActiveTab("Luyện Đề");
      alert("Đã tạo bài luyện từ gợi ý. Mở tab Luyện Đề để làm nhé!");
    } catch (e: any) {
      alert(e?.message ?? "Không accept được nudge");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="bg-blue-50 p-2 rounded-lg text-[#00529c]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Gợi ý hôm nay</h2>
      </div>

      {loading ? (
        <div className="text-slate-500 font-bold">Đang tải gợi ý...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 font-bold">Chưa có gợi ý.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#00529c] flex items-center justify-center shrink-0">
                <Icon name={n.icon} />
              </div>

              <div className="flex-1">
                <div className="font-extrabold text-slate-800">{n.title}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{n.description}</div>

                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {n.subject.toUpperCase()}
                  </span>
                  {n.timing && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {n.timing === "midterm" ? "Giữa kỳ" : "Cuối kỳ"}
                    </span>
                  )}
                  {n.topic && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      {n.topic}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {n.num_questions} câu
                  </span>

                  <button
                    onClick={() => handleAccept(n)}
                    disabled={busyId === n.id}
                    className="ml-auto px-4 py-2 rounded-xl font-bold text-white bg-[#00529c] hover:bg-blue-800 disabled:opacity-60"
                  >
                    {busyId === n.id ? "Đang tạo..." : "Làm ngay"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}