import { useEffect, useMemo, useState } from "react";

type ScheduleItem = {
  time: string; // "09:00"
  subject: string;
  room: string;
  durationMin?: number; // mặc định 120
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function parseTimeToDateToday(timeHHMM: string) {
  const [hh, mm] = timeHHMM.split(":").map((x) => Number(x));
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}

function formatVietnameseDay(d: Date) {
  const map = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return map[d.getDay()];
}

function formatDateVN(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function diffMs(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Đang diễn ra";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function TodayScheduleCard() {
  // TODO: sau này thay bằng API
  const schedule: ScheduleItem[] = [
    { time: "09:00", subject: "Quản trị dự án CNTT", room: "Phòng B2.1", durationMin: 120 },
    { time: "13:00", subject: "Lập trình hướng đối tượng", room: "Phòng E03.4", durationMin: 120 },
  ];

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nowStr = useMemo(() => {
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  }, [now]);

  const dayLabel = useMemo(() => formatVietnameseDay(now), [now]);
  const dateLabel = useMemo(() => formatDateVN(now), [now]);

  const scheduleWithTimes = useMemo(() => {
    return schedule
      .map((x) => {
        const start = parseTimeToDateToday(x.time);
        const end = new Date(start.getTime() + (x.durationMin ?? 120) * 60 * 1000);
        return { ...x, start, end };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [schedule]);

  const summary = useMemo(() => {
    const totalMin = scheduleWithTimes.reduce((acc, x) => acc + (x.durationMin ?? 120), 0);
    const uniqueRooms = new Set(scheduleWithTimes.map((x) => x.room)).size;
    return {
      count: scheduleWithTimes.length,
      hours: (totalMin / 60).toFixed(totalMin % 60 === 0 ? 0 : 1),
      rooms: uniqueRooms,
    };
  }, [scheduleWithTimes]);

  const nextClass = useMemo(() => {
    const candidates = scheduleWithTimes.filter((x) => x.end.getTime() > now.getTime());
    if (candidates.length === 0) return null;

    const current = candidates.find((x) => x.start.getTime() <= now.getTime() && now.getTime() <= x.end.getTime());
    if (current) {
      return {
        kind: "current" as const,
        item: current,
        countdownMs: diffMs(current.end, now),
      };
    }

    const upcoming = candidates.find((x) => x.start.getTime() > now.getTime());
    if (!upcoming) return null;

    return {
      kind: "upcoming" as const,
      item: upcoming,
      countdownMs: diffMs(upcoming.start, now),
    };
  }, [scheduleWithTimes, now]);

  const getStatus = (start: Date, end: Date) => {
    const t = now.getTime();
    if (t < start.getTime()) return "upcoming";
    if (t >= start.getTime() && t <= end.getTime()) return "ongoing";
    return "done";
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-[#00529c] border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <div className="text-[13px] text-slate-500 font-semibold">
              {dayLabel} • {dateLabel}
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Lịch học hôm nay</h2>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[12px] text-slate-500 font-semibold">Giờ hiện tại</div>
          <div className="font-extrabold text-[#00529c] text-base tabular-nums">{nowStr}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00529c]" />
          <span>{summary.count} môn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{summary.hours} giờ học</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>{summary.rooms} phòng</span>
        </div>
      </div>

      {/* Next class */}
      <div className="mt-4">
        {nextClass ? (
          <div className="bg-white/80 backdrop-blur border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-black tracking-wider text-blue-600">
                {nextClass.kind === "current" ? "ĐANG HỌC" : "MÔN TIẾP THEO"}
              </div>
              <div className="font-extrabold text-slate-900 truncate">{nextClass.item.subject}</div>
              <div className="text-sm text-slate-600 font-semibold mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  {nextClass.item.time}
                </span>
                <span className="text-slate-400">•</span>
                <span className="truncate">{nextClass.item.room}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[12px] text-slate-500 font-semibold">
                {nextClass.kind === "current" ? "Còn lại" : "Bắt đầu sau"}
              </div>
              <div className="text-lg font-extrabold text-[#00529c] tabular-nums">
                {formatCountdown(nextClass.countdownMs)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-600 font-semibold">
            Hôm nay bạn đã học xong hết rồi 🎉
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-5 space-y-5 flex-1">
        {scheduleWithTimes.map((item, i) => {
          const st = getStatus(item.start, item.end);

          const dotClass =
            st === "done"
              ? "bg-slate-300"
              : st === "ongoing"
              ? "bg-emerald-500 animate-pulse"
              : "bg-[#00529c]";

          const badge =
            st === "done" ? (
              <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                Đã qua
              </span>
            ) : st === "ongoing" ? (
              <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang học
              </span>
            ) : (
              <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Sắp tới
              </span>
            );

          return (
            <div key={`${item.time}_${item.subject}`} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${dotClass}`} />
                {i !== scheduleWithTimes.length - 1 && <div className="w-[2px] h-12 bg-gray-200" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-700 font-extrabold tabular-nums">{item.time}</div>
                  {badge}
                </div>

                <div className="mt-1 font-extrabold text-slate-800 text-sm">{item.subject}</div>
                <div className="text-slate-500 text-xs mt-1 font-semibold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item.room}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-4 py-2 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm">
          Xem thời khóa biểu
        </button>
        <button className="px-4 py-2 rounded-xl font-bold bg-blue-50 text-[#00529c] hover:bg-blue-100 transition-colors border border-blue-100 text-sm">
          Mở tài liệu môn
        </button>
      </div>
    </div>
  );
}