"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DeviceEvent, RangeKey } from "@/lib/types";
import { rangeStartEpoch } from "@/lib/time";

type Point = { label: string; snack: number; autoFeed: number };

// Local-time day offset between two epoch-second timestamps. Floor-dividing
// (today0 - e.ts) / 86400 is wrong for events later-in-day-today (returns -1)
// and for yesterday-morning events (returns 0). Use real date math instead.
function dayOffset(eventTsSec: number, now: Date): number {
  const ed = new Date(eventTsSec * 1000);
  ed.setHours(0, 0, 0, 0);
  const td = new Date(now);
  td.setHours(0, 0, 0, 0);
  return Math.round((td.getTime() - ed.getTime()) / 86_400_000);
}

function buildBuckets(
  events: DeviceEvent[],
  range: RangeKey,
  now: Date = new Date(),
): Point[] {
  const start = rangeStartEpoch(range, now);

  if (range === "24h") {
    const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const todayLabel = days[new Date(now).getDay()];
    let snack = 0;
    let autoFeed = 0;
    for (const e of events) {
      if (e.ts < start) continue;
      if (e.type === "snack") snack++;
      else if (e.type === "feed" && e.data?.source === "auto") autoFeed++;
    }
    return [{ label: todayLabel, snack, autoFeed }];
  }

  const days = range === "7d" ? 7 : 30;
  const buckets: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.push({
      label:
        days <= 7
          ? d
              .toLocaleDateString("pt-BR", { weekday: "short" })
              .replace(".", "")
              .toLowerCase()
          : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      snack: 0,
      autoFeed: 0,
    });
  }
  for (const e of events) {
    if (e.ts < start) continue;
    const idx = days - 1 - dayOffset(e.ts, now);
    if (idx < 0 || idx >= days) continue;
    if (e.type === "snack") buckets[idx].snack++;
    else if (e.type === "feed" && e.data?.source === "auto") buckets[idx].autoFeed++;
  }
  return buckets;
}

type Props = {
  events: DeviceEvent[];
  range: RangeKey;
};

export function SnackVsFeedChart({ events, range }: Props) {
  const data = buildBuckets(events, range);
  return (
    <div className="rounded-2xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">snack vs auto-feed</h2>
        <span className="text-xs text-muted">
          {range === "24h" ? "hoje" : range === "7d" ? "7 dias" : "30 dias"}
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              interval="preserveStartEnd"
              minTickGap={8}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(15,23,42,0.06)" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                color: "#0f172a",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
              }}
              labelStyle={{ color: "#64748b" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Bar
              dataKey="snack"
              name="snack"
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="autoFeed"
              name="auto-feed"
              fill="#22d3ee"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
