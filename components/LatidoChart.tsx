"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DeviceEvent, IntensitySample } from "@/lib/types";

// Firmware constant: bark triggers at mic_rms / mic_peak >= 0.75. A bark event
// in Firebase therefore proves intensity was >= 75% at that moment, but
// doesn't carry the exact value (state heartbeats are overwritten, so the
// peak is lost). Pinning the bucket here is the honest lower bound.
const BARK_THRESHOLD_PCT = 75;

type LatidoRange = "30min" | "1h" | "24h";

const RANGE_OPTIONS: { key: LatidoRange; label: string; minutes: number }[] = [
  { key: "30min", label: "30 min", minutes: 30 },
  { key: "1h", label: "1 h", minutes: 60 },
  { key: "24h", label: "24 h", minutes: 24 * 60 },
];

const BUCKET_MS = 60_000; // 1 minute

const COLOR_GREEN = "#22c55e";
const COLOR_YELLOW = "#eab308";
const COLOR_ORANGE = "#f97316";
const COLOR_RED = "#ef4444";

function colorForPct(p: number): string {
  if (p <= 25) return COLOR_GREEN;
  if (p <= 50) return COLOR_YELLOW;
  if (p <= 75) return COLOR_ORANGE;
  return COLOR_RED;
}

type Stop = { offset: number; color: string };

// One gradient stop per bucket at its X offset, colored by the bucket's
// own intensity band. Empty minutes are 0% (green), so quiet stretches
// stay green and the area dips between bark spikes.
function buildGradientStops(data: Bucket[]): Stop[] {
  if (data.length === 0) return [];
  return data.map((b, i) => ({
    offset: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
    color: colorForPct(b.pct),
  }));
}

type Bucket = { ts: number; pct: number; hasData: boolean };

function buildBuckets(
  samples: IntensitySample[],
  barkEvents: DeviceEvent[],
  minutes: number,
): Bucket[] {
  const now = Date.now();
  const endBucketMs = Math.floor(now / BUCKET_MS) * BUCKET_MS;
  const startBucketMs = endBucketMs - (minutes - 1) * BUCKET_MS;

  // Peak per minute from live heartbeats — bark intensity is about how loud
  // the spikes are, so max per bucket is more informative than mean.
  const peaks = new Map<number, number>();
  for (const s of samples) {
    const tMs = s.ts * 1000;
    if (tMs < startBucketMs) continue;
    if (tMs > endBucketMs + BUCKET_MS) continue;
    const bucket = Math.floor(tMs / BUCKET_MS) * BUCKET_MS;
    const cur = peaks.get(bucket);
    if (cur === undefined || s.pct > cur) peaks.set(bucket, s.pct);
  }

  // Bark events are persistent in /totositter/events, so they survive page
  // refreshes. Pin every bark's bucket to >= BARK_THRESHOLD_PCT — heartbeat
  // data, when present, will already be higher and won't be overridden.
  for (const e of barkEvents) {
    if (e.type !== "bark" || !e.ts) continue;
    const tMs = e.ts * 1000;
    if (tMs < startBucketMs) continue;
    if (tMs > endBucketMs + BUCKET_MS) continue;
    const bucket = Math.floor(tMs / BUCKET_MS) * BUCKET_MS;
    const cur = peaks.get(bucket);
    if (cur === undefined || cur < BARK_THRESHOLD_PCT) {
      peaks.set(bucket, BARK_THRESHOLD_PCT);
    }
  }

  const buckets: Bucket[] = [];
  for (let t = startBucketMs; t <= endBucketMs; t += BUCKET_MS) {
    const pct = peaks.get(t);
    buckets.push({
      ts: t,
      pct: pct ?? 0,
      hasData: pct !== undefined,
    });
  }
  return buckets;
}

function formatTick(tsMs: number): string {
  const d = new Date(tsMs);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  samples: IntensitySample[];
  events: DeviceEvent[];
};

export function LatidoChart({ samples, events }: Props) {
  const [range, setRange] = useState<LatidoRange>("30min");
  const minutes =
    RANGE_OPTIONS.find((r) => r.key === range)?.minutes ?? 30;
  const data = buildBuckets(samples, events, minutes);
  const hasAny = data.some((b) => b.hasData);

  return (
    <div className="rounded-2xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Latido</h2>
          <p className="text-xs text-muted">intensidade por minuto</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-panelAlt p-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-0.5 text-xs rounded-full transition ${
                range === r.key
                  ? "bg-ink text-bg font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        {!hasAny ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            aguardando heartbeat do dispositivo…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
            >
              <defs>
                {/* Horizontal gradient: one stop per bucket at its X offset,
                    colored by that bucket's intensity band. The gradient
                    follows time, so the area's color at minute T reflects
                    the intensity at T (not the chart-height position). */}
                <linearGradient
                  id="latido-x"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  {buildGradientStops(data).map((s, i) => (
                    <stop
                      key={i}
                      offset={`${s.offset}%`}
                      stopColor={s.color}
                    />
                  ))}
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="ts"
                tickFormatter={(t: number) => formatTick(t)}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval="preserveStartEnd"
                minTickGap={32}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  color: "#0f172a",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                }}
                labelStyle={{ color: "#64748b" }}
                labelFormatter={(t: number) => formatTick(t)}
                formatter={(v) => {
                  if (v === null || v === undefined) return ["—", "sem dados"];
                  const n = typeof v === "number" ? v : Number(v);
                  return [`${n.toFixed(0)}%`, "intensidade"];
                }}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="url(#latido-x)"
                strokeWidth={2}
                fill="url(#latido-x)"
                fillOpacity={0.4}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <LegendDot color={COLOR_GREEN} label="até 25%" />
        <LegendDot color={COLOR_YELLOW} label="até 50%" />
        <LegendDot color={COLOR_ORANGE} label="até 75%" />
        <LegendDot color={COLOR_RED} label="acima de 75%" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
