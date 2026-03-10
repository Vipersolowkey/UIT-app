import { useEffect, useMemo, useState } from "react";
import { fetchJobsAPI } from "../api/jobs";
import type { JobItem } from "../api/jobs";

const PAGE_SIZE = 6;

type JobModalProps = {
  job: JobItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (url: string) => void;
};

function JobDetailModal({ job, onClose, isSaved, onToggleSave }: JobModalProps) {
  if (!job) return null;

  const isHot =
    job.tags?.some((tag) =>
      ["fresher", "intern", "urgent", "hot", "gấp", "remote"].includes(tag.toLowerCase())
    ) ?? false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-[101] w-full max-w-4xl h-auto max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-white/60 flex flex-col overflow-hidden animate-[fadeIn_0.25s_ease]">
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-xl font-extrabold text-slate-800 leading-snug">
                  {job.title}
                </h2>

                {isHot && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                    HOT
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {job.tags?.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-[#00529c] text-[12px] font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 w-11 h-11 rounded-full bg-white border border-gray-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          <div className="mb-5">
            <div className="text-sm font-extrabold text-slate-800 mb-2">Nội dung tuyển dụng</div>
            <div className="text-[14px] leading-7 text-slate-600 whitespace-pre-line break-words rounded-2xl border border-gray-200 bg-white p-4">
              {job.content || "Chưa có nội dung chi tiết."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center px-4 py-3 rounded-2xl bg-[#00529c] text-white font-extrabold hover:bg-blue-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Xem bài gốc trên forum
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(job.url);
                window.alert("Đã sao chép link tuyển dụng");
              }}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
            >
              Sao chép link
            </button>

            <button
              onClick={() => onToggleSave(job.url)}
              className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all border ${
                isSaved
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-gray-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isSaved ? "Đã lưu tin" : "Lưu tin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("savedJobs") || "[]");
  });

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await fetchJobsAPI();
        setJobs(data);
      } catch (error) {
        console.error("Lỗi khi tải tin tuyển dụng:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedJob(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleSaveJob = (url: string) => {
    const updated = savedJobs.includes(url)
      ? savedJobs.filter((item) => item !== url)
      : [...savedJobs, url];

    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    jobs.forEach((job) => {
      job.tags?.forEach((tag) => tags.add(tag));
    });
    return ["all", ...Array.from(tags)];
  }, [jobs]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const saved = savedJobs.length;
    const hot = jobs.filter((job) =>
      job.tags?.some((tag) =>
        ["fresher", "intern", "urgent", "hot", "gấp", "remote"].includes(tag.toLowerCase())
      )
    ).length;

    return { total, saved, hot };
  }, [jobs, savedJobs]);

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchKeyword =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.content.toLowerCase().includes(q) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(q));

      const matchTag =
        selectedTag === "all" ||
        job.tags?.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());

      const matchSaved = !showSavedOnly || savedJobs.includes(job.url);

      return matchKeyword && matchTag && matchSaved;
    });
  }, [jobs, keyword, selectedTag, showSavedOnly, savedJobs]);

  useEffect(() => {
    setPage(1);
  }, [keyword, selectedTag, showSavedOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, page]);

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-transparent to-slate-50/70 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-[#00529c] text-white p-2.5 rounded-xl shadow-sm shadow-blue-900/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13V7a2 2 0 00-2-2h-3V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H5a2 2 0 00-2 2v6m18 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m18 0a24.246 24.246 0 01-18 0"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  Bản tin tuyển dụng UIT
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Tổng hợp tin tuyển dụng từ forum UIT
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center transition-all hover:-translate-y-0.5">
              <div className="text-lg font-extrabold text-slate-800">{stats.total}</div>
              <div className="text-[12px] text-slate-500 font-semibold">Tổng tin</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center transition-all hover:-translate-y-0.5">
              <div className="text-lg font-extrabold text-orange-700">{stats.hot}</div>
              <div className="text-[12px] text-orange-600 font-semibold">Tin nổi bật</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center transition-all hover:-translate-y-0.5">
              <div className="text-lg font-extrabold text-amber-700">{stats.saved}</div>
              <div className="text-[12px] text-amber-600 font-semibold">Đã lưu</div>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề, nội dung, tag..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00529c]/20 focus:border-[#00529c] transition-all"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-all">
            <input
              type="checkbox"
              checked={showSavedOnly}
              onChange={(e) => setShowSavedOnly(e.target.checked)}
              className="w-4 h-4 text-[#00529c]"
            />
            Chỉ xem tin đã lưu
          </label>
        </div>

        <div className="relative mt-4 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? "bg-[#00529c] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 border border-gray-200 hover:bg-slate-100"
              }`}
            >
              {tag === "all" ? "Tất cả" : tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative min-h-[320px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-[#00529c] rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-slate-500">Đang tải tin tuyển dụng...</p>
          </div>
        )}

        {!loading && paginatedJobs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 13h6m2 8H7a2 2 0 01-2-2V7a2 2 0 012-2h3.586a1 1 0 00.707-.293l.414-.414A1 1 0 0112.414 4h3.172a1 1 0 01.707.293l.414.414A1 1 0 0016.414 5H20a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-semibold text-sm">Không tìm thấy tin tuyển dụng phù hợp.</p>
          </div>
        )}

        {!loading && paginatedJobs.length > 0 && (
          <>
            <div className="divide-y divide-gray-100">
              {paginatedJobs.map((job, index) => {
                const isHot =
                  job.tags?.some((tag) =>
                    ["fresher", "intern", "urgent", "hot", "gấp", "remote"].includes(
                      tag.toLowerCase()
                    )
                  ) ?? false;

                const isSaved = savedJobs.includes(job.url);

                return (
                  <div
                    key={`${job.url}-${index}`}
                    className="p-5 hover:bg-slate-50/80 hover:-translate-y-0.5 transition-all duration-200 animate-[fadeIn_0.35s_ease]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="text-[17px] font-extrabold text-slate-800 leading-snug">
                            {job.title}
                          </h3>

                          {isHot && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                              HOT
                            </span>
                          )}

                          {isSaved && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                              ĐÃ LƯU
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-[14px] leading-relaxed text-slate-600 line-clamp-3">
                          {job.content}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.tags?.map((tag, tagIndex) => (
                            <span
                              key={`${job.url}-${tag}-${tagIndex}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#00529c] text-[12px] font-bold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 text-[13px] text-slate-500 font-medium">
                          Nguồn: Forum UIT
                        </div>
                      </div>

                      <div className="xl:w-[240px] flex xl:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="flex-1 px-4 py-3 rounded-xl bg-[#00529c] text-white font-extrabold hover:bg-blue-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                          Xem nhanh
                        </button>

                        <button
                          onClick={() => toggleSaveJob(job.url)}
                          className={`flex-1 px-4 py-3 rounded-xl font-bold border transition-all ${
                            isSaved
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-white border-gray-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isSaved ? "Bỏ lưu" : "Lưu tin"}
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(job.url);
                            window.alert("Đã sao chép link tuyển dụng");
                          }}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
                        >
                          Copy link
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-500 font-semibold">
                Trang <span className="text-slate-800 font-extrabold">{page}</span> / {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 font-bold disabled:opacity-50 hover:bg-slate-50 transition-all"
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-extrabold transition-all ${
                        page === pageNum
                          ? "bg-[#00529c] text-white shadow-md"
                          : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 font-bold disabled:opacity-50 hover:bg-slate-50 transition-all"
                >
                  Sau →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.url) : false}
        onToggleSave={toggleSaveJob}
      />
    </div>
  );
}