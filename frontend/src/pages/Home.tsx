import React, { useEffect, useMemo, useState } from "react";
import logoUit from "../assets/logo_uit.png";
import Events from "../components/Events/Events";
import Nudges from "../components/Nudges/Nudges";

import { fetchScheduleAPI } from "../api/schedule";
import type { ScheduleItem } from "../api/schedule";

import { fetchJobsAPI } from "../api/jobs";
import type { JobItem } from "../api/jobs";

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

const TIME_SLOTS = [
  { period: 1, start: "07:30", end: "08:15" },
  { period: 2, start: "08:15", end: "09:00" },
  { period: 3, start: "09:00", end: "09:45" },
  { period: 4, start: "10:00", end: "10:45" },
  { period: 5, start: "10:45", end: "11:30" },
  { period: 6, start: "13:00", end: "13:45" },
  { period: 7, start: "13:45", end: "14:30" },
  { period: 8, start: "14:30", end: "15:15" },
  { period: 9, start: "15:30", end: "16:15" },
  { period: 10, start: "16:15", end: "17:00" },
] as const;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatVNDay(d: Date) {
  const map = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return map[d.getDay()];
}

function formatVNDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatVNTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function mapTodayToScheduleDay(d: Date): ScheduleItem["dayOfWeek"] | null {
  // JS: 0=CN,1=T2,...6=T7
  const day = d.getDay();
  if (day === 0) return null; // Chủ nhật
  return `Thứ ${day + 1}` as ScheduleItem["dayOfWeek"]; // 1->Thứ 2 ... 6->Thứ 7
}

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
  return hh * 60 + mm;
}

function nowToMinutes(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function humanCountdown(mins: number) {
  if (mins <= 0) return "Đang diễn ra";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
}

function periodToTimeRange(startPeriod: number, endPeriod: number) {
  const s = TIME_SLOTS.find((x) => x.period === startPeriod);
  const e = TIME_SLOTS.find((x) => x.period === endPeriod);
  if (!s || !e) return { start: "??:??", end: "??:??" };
  return { start: s.start, end: e.end };
}

type ClassStatus = "current" | "upcoming" | "past";

function computeClassStatus(nowMin: number, startMin: number, endMin: number): ClassStatus {
  if (startMin <= nowMin && nowMin <= endMin) return "current";
  if (nowMin < startMin) return "upcoming";
  return "past";
}

function StatusChip({ status, minutes }: { status: ClassStatus; minutes: number }) {
  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Đang học • còn {humanCountdown(Math.max(0, minutes))}
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 ring-1 ring-blue-500/20">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sắp tới • {humanCountdown(Math.max(0, minutes))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 ring-1 ring-slate-300/60">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      Đã qua
    </span>
  );
}

function isHotJob(job: JobItem) {
  return (
    job.tags?.some((tag) =>
      ["fresher", "intern", "urgent", "hot", "gấp", "remote"].includes(tag.toLowerCase())
    ) ?? false
  );
}

export default function Home({ setActiveTab }: HomeProps) {
  // ===== clock =====
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dayLabel = useMemo(() => formatVNDay(now), [now]);
  const dateLabel = useMemo(() => formatVNDate(now), [now]);
  const timeLabel = useMemo(() => formatVNTime(now), [now]);
  const scheduleDay = useMemo(() => mapTodayToScheduleDay(now), [now]);
  const nowMin = useMemo(() => nowToMinutes(now), [now]);

  // ===== schedule =====
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingSchedule(true);
      try {
        const data = await fetchScheduleAPI();
        setScheduleData(data || []);
      } catch (e) {
        console.error("Lỗi khi tải lịch học:", e);
        setScheduleData([]);
      } finally {
        setLoadingSchedule(false);
      }
    })();
  }, []);

  const todayClasses = useMemo(() => {
    if (!scheduleDay) return [];

    const rows = (scheduleData || [])
      .filter((x) => x.dayOfWeek === scheduleDay)
      .map((x) => {
        const tr = periodToTimeRange(x.startPeriod, x.endPeriod);
        const startMin = timeToMinutes(tr.start);
        const endMin = timeToMinutes(tr.end);
        const status = computeClassStatus(nowMin, startMin, endMin);
        const minutes = status === "current" ? endMin - nowMin : startMin - nowMin;

        return {
          ...x,
          startTime: tr.start,
          endTime: tr.end,
          startMin,
          endMin,
          status,
          minutes,
        };
      })
      .sort((a, b) => a.startPeriod - b.startPeriod);

    return rows as Array<
      ScheduleItem & {
        startTime: string;
        endTime: string;
        startMin: number;
        endMin: number;
        status: ClassStatus;
        minutes: number;
      }
    >;
  }, [scheduleData, scheduleDay, nowMin]);

  const nextCard = useMemo(() => {
    if (!todayClasses.length) return null;

    const current = todayClasses.find((c) => c.status === "current");
    if (current) return { kind: "current" as const, item: current, mins: current.endMin - nowMin };

    const upcoming = todayClasses.find((c) => c.status === "upcoming");
    if (upcoming) return { kind: "upcoming" as const, item: upcoming, mins: upcoming.startMin - nowMin };

    return null;
  }, [todayClasses, nowMin]);

  const summaryCounts = useMemo(() => {
    const current = todayClasses.filter((c) => c.status === "current").length;
    const upcoming = todayClasses.filter((c) => c.status === "upcoming").length;
    const past = todayClasses.filter((c) => c.status === "past").length;
    return { current, upcoming, past };
  }, [todayClasses]);

  // ===== jobs =====
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoadingJobs(true);
      try {
        const data = await fetchJobsAPI();
        setJobs(data || []);
      } catch (e) {
        console.error("Lỗi khi tải job:", e);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    })();
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(saved);
  }, []);

  const hotJobs = useMemo(() => jobs.filter((job) => isHotJob(job)), [jobs]);

  const featuredJob = useMemo(() => {
    if (hotJobs.length > 0) return hotJobs[0];
    if (jobs.length > 0) return jobs[0];
    return null;
  }, [hotJobs, jobs]);

  const statsCards = useMemo(() => {
    return [
      {
        label: "Môn hôm nay",
        value: todayClasses.length,
        sub: scheduleDay ? scheduleDay : "Chủ nhật",
        tone: "blue",
      },
      {
        label: "Job hot",
        value: hotJobs.length,
        sub: "Từ forum UIT",
        tone: "orange",
      },
      {
        label: "Đã lưu",
        value: savedJobs.length,
        sub: "Tin tuyển dụng",
        tone: "amber",
      },
      {
        label: "Sắp tới",
        value: summaryCounts.upcoming,
        sub: "Tiết học",
        tone: "emerald",
      },
    ];
  }, [todayClasses.length, scheduleDay, hotJobs.length, savedJobs.length, summaryCounts.upcoming]);

  return (
    <div className="animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <img src={logoUit} alt="UIT Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#00529c]">Xin chào, Anh Vinh đẹp trai</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Mã SV: 24522014 | Hệ thống Luyện đề và Phát triển khả năng tự học cho sinh viên UIT
            </p>
          </div>
        </div>

        {/* Day + time */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[12px] text-slate-500 font-bold">
              {dayLabel} • {dateLabel}
            </div>
            <div className="text-[#00529c] font-extrabold tabular-nums">{timeLabel}</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card) => {
          const toneClass =
            card.tone === "blue"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : card.tone === "orange"
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : card.tone === "amber"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700";

          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${toneClass}`}
            >
              <div className="text-[12px] font-black uppercase tracking-wide opacity-80">
                {card.label}
              </div>
              <div className="mt-2 text-2xl font-extrabold">{card.value}</div>
              <div className="mt-1 text-[12px] font-semibold opacity-80">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Nudges setActiveTab={setActiveTab} />

        {/* Today schedule */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
          {loadingSchedule && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-[#00529c] rounded-full animate-spin mb-3"></div>
              <div className="text-sm font-bold text-slate-500">Đang tải lịch học...</div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#00529c]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Lịch học hôm nay</h2>
                <div className="text-[12px] text-slate-500 font-semibold">
                  {dayLabel} • {dateLabel}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-bold">Bây giờ</div>
              <div className="text-[#00529c] font-extrabold tabular-nums">{timeLabel}</div>
            </div>
          </div>

          {/* Summary + Next */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-black text-slate-500">TỔNG QUAN</div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white text-slate-700 ring-1 ring-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#00529c]" />
                  {todayClasses.length} môn
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/15">
                  Đang học: {summaryCounts.current}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 ring-1 ring-blue-500/15">
                  Sắp tới: {summaryCounts.upcoming}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 ring-1 ring-slate-300/50">
                  Đã qua: {summaryCounts.past}
                </span>
              </div>

              <div className="mt-2 text-[12px] text-slate-500 font-semibold">
                {scheduleDay ? `Theo lịch: ${scheduleDay}` : "Chủ nhật"}
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
              {nextCard ? (
                <>
                  <div className="text-[11px] font-black text-blue-700">
                    {nextCard.kind === "current" ? "ĐANG HỌC" : "SẮP TỚI"}
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900 line-clamp-1">
                    {nextCard.item.courseName}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 font-bold">
                    {nextCard.kind === "current" ? "Còn lại: " : "Bắt đầu sau: "}
                    <span className="text-[#00529c]">{humanCountdown(nextCard.mins)}</span>
                  </div>
                  <div className="mt-1 text-[12px] text-slate-500 font-semibold">
                    {nextCard.item.startTime}–{nextCard.item.endTime} • {nextCard.item.room}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-black text-blue-700">
                    {todayClasses.length ? "HOÀN THÀNH" : "TRỐNG LỊCH"}
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    {todayClasses.length ? "Không còn tiết học 🎉" : "Hôm nay không có môn nào"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 font-bold">
                    Vào “Luyện Đề” làm MCQ/Essay hoặc thử 1 bài code.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* List */}
          {scheduleDay === null ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400">
              <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
              </svg>
              <p className="font-semibold text-sm">Chủ nhật: thường không có lịch học.</p>
              <button
                onClick={() => setActiveTab("Luyện Đề")}
                className="mt-4 px-4 py-2 rounded-xl font-extrabold bg-[#00529c] text-white hover:bg-blue-800 transition-colors"
              >
                Đi luyện đề
              </button>
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400">
              <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
              </svg>
              <p className="font-semibold text-sm">Hôm nay không có tiết nào.</p>
              <button
                onClick={() => setActiveTab("Luyện Đề")}
                className="mt-4 px-4 py-2 rounded-xl font-extrabold bg-[#00529c] text-white hover:bg-blue-800 transition-colors"
              >
                Đi luyện đề
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {todayClasses.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-start gap-4 p-3 rounded-xl transition-colors border ${
                    c.status === "current"
                      ? "bg-emerald-50/40 border-emerald-200"
                      : c.status === "upcoming"
                      ? "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                      : "bg-slate-50/30 border-transparent hover:bg-slate-50 hover:border-slate-100 opacity-85"
                  }`}
                >
                  <div className="text-center w-14 border-r border-gray-200 pr-3">
                    <span className="block text-sm font-extrabold text-slate-800 tabular-nums">{c.startTime}</span>
                    <span className="block text-[11px] font-bold text-slate-500 tabular-nums">{c.endTime}</span>
                    <span className="block mt-1 text-[11px] font-bold text-slate-400">
                      Tiết {c.startPeriod}-{c.endPeriod}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-slate-400">{c.courseCode}</div>
                        <p className="font-extrabold text-slate-800 text-sm line-clamp-1">{c.courseName}</p>
                      </div>
                      <StatusChip status={c.status} minutes={c.status === "past" ? 0 : c.minutes} />
                    </div>

                    <p className="text-slate-500 text-xs mt-1 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {c.room} • {c.lecturer}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                        {c.dateRange}
                      </div>

                      <button
                        onClick={() => setActiveTab("Luyện Đề")}
                        className="shrink-0 px-3 py-2 rounded-xl text-[12px] font-extrabold bg-[#00529c] text-white hover:bg-blue-800 transition-colors"
                      >
                        Ôn nhanh
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-[12px] font-extrabold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Gợi ý
                </div>
                <div className="text-[12px] text-slate-600 font-semibold mt-1">
                  Sau giờ học, vào “Luyện Đề” làm MCQ/Essay hoặc thử 1 bài code dạng LeetCode để nhớ lâu hơn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13V7a2 2 0 00-2-2h-3V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H5a2 2 0 00-2 2v6m18 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m18 0a24.246 24.246 0 01-18 0"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-slate-800">Gợi ý việc làm hôm nay</h3>

                {loadingJobs ? (
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Đang tải dữ liệu tuyển dụng...
                  </p>
                ) : featuredJob ? (
                  <>
                    <p className="mt-2 text-sm font-extrabold text-slate-800 line-clamp-2">
                      {featuredJob.title}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {featuredJob.tags?.slice(0, 4).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#00529c] text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {featuredJob.content}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Hiện chưa có tin tuyển dụng nổi bật.
                  </p>
                )}
              </div>
            </div>

            {featuredJob && (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-50 text-orange-700 ring-1 ring-orange-200 shrink-0">
                HOT JOB
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab("Tuyển Dụng")}
              className="px-5 py-3 rounded-xl bg-[#00529c] text-white font-extrabold hover:bg-blue-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Xem bảng tin tuyển dụng
            </button>

            <button
              onClick={() => setActiveTab("Chatbot RAG")}
              className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all"
            >
              Hỏi Chatbot về việc làm
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">Việc làm của bạn</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500 font-black">ĐÃ LƯU</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-800">{savedJobs.length}</div>
            </div>

            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3">
              <div className="text-[11px] text-orange-600 font-black">TIN NỔI BẬT</div>
              <div className="mt-1 text-2xl font-extrabold text-orange-700">{hotJobs.length}</div>
            </div>

            <button
              onClick={() => setActiveTab("Tuyển Dụng")}
              className="w-full px-4 py-3 rounded-xl font-extrabold bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              Mở trang tuyển dụng
            </button>
          </div>
        </div>
      </div>

      {/* Bảng tin */}
      <Events />
    </div>
  );
}