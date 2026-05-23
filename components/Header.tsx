"use client";

import type { RangeKey } from "@/lib/types";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
];

type Props = {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  online: boolean;
};

export function Header({ range, onRangeChange, online }: Props) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-border bg-panel/60 px-6 py-4 backdrop-blur">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          TotoSitter
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${
            online
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              : "border-zinc-400/40 bg-zinc-400/10 text-zinc-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              online ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
            }`}
          />
          {online ? "online" : "offline"}
        </span>
      </div>

      <nav className="flex items-center gap-1 rounded-full border border-border bg-panelAlt p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onRangeChange(r.key)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              range === r.key
                ? "bg-ink text-bg font-medium"
                : "text-muted hover:text-ink"
            }`}
          >
            {r.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4 text-sm text-muted">
        <button type="button" className="hover:text-ink transition">
          dispositivos
        </button>
        <button type="button" className="hover:text-ink transition">
          ajustes
        </button>
      </div>
    </header>
  );
}
