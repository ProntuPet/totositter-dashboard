"use client";

import type { DeviceEvent } from "@/lib/types";

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

type DayBar = { label: string; barks: number; isToday: boolean };

function build(events: DeviceEvent[], now: Date = new Date()): DayBar[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayStart = Math.floor(today.getTime() / 1000);

  // Week starts Monday: Mon..Fri (matches mockup: seg ter qua qui sex)
  const monday = new Date(today);
  const dow = today.getDay(); // 0 sun, 1 mon, ...
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  monday.setDate(monday.getDate() + diffToMon);

  const bars: DayBar[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dayStart = Math.floor(d.getTime() / 1000);
    const dayEnd = dayStart + 86_400;
    const barks = events.filter(
      (e) => e.type === "bark" && e.ts >= dayStart && e.ts < dayEnd,
    ).length;
    bars.push({
      label: WEEKDAY_LABELS[d.getDay()],
      barks,
      isToday: dayStart === todayStart,
    });
  }
  return bars;
}

type Props = { events: DeviceEvent[] };

export function ResumoHoje({ events }: Props) {
  const bars = build(events);
  const max = Math.max(1, ...bars.map((b) => b.barks));

  return (
    <div className="rounded-2xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">resumo de hoje</h2>
        <span className="text-xs text-muted">latidos por dia</span>
      </div>
      <div className="flex h-32 items-end gap-3">
        {bars.map((b) => {
          const h = Math.round((b.barks / max) * 100);
          return (
            <div key={b.label} className="flex flex-1 items-end">
              <div
                className={`w-full rounded-md transition-all ${
                  b.isToday ? "bg-accent" : "bg-slate-300"
                }`}
                style={{ height: `${h}%`, minHeight: 2 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {bars.map((b) => (
          <div
            key={b.label}
            className="flex flex-1 flex-col items-center gap-0.5"
          >
            <div className="text-[10px] uppercase tracking-wide text-muted">
              {b.label}
            </div>
            <div className="text-xs tabular-nums text-ink">{b.barks}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
