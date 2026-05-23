"use client";

import type { DeviceEvent, EventType } from "@/lib/types";
import { formatHHMM } from "@/lib/time";

const EVENT_LABELS: Record<EventType, string> = {
  bark: "latido detectado",
  movement: "movimento detectado",
  feed: "ração liberada",
  snack: "snack liberado",
  alert: "alerta (latido + movimento)",
  boot: "dispositivo iniciado",
  state_change: "mudança de estado",
};

const EVENT_COLORS: Record<EventType, string> = {
  bark: "bg-amber-500",
  movement: "bg-sky-500",
  feed: "bg-emerald-500",
  snack: "bg-fuchsia-500",
  alert: "bg-red-500",
  boot: "bg-zinc-500",
  state_change: "bg-zinc-500",
};

function describe(e: DeviceEvent): string {
  const base = EVENT_LABELS[e.type] ?? e.type;
  if (e.type === "feed") {
    return e.data?.source === "button"
      ? "snack liberado manualmente"
      : "ração liberada";
  }
  if (e.type === "state_change" && e.data?.from && e.data?.to) {
    return `${e.data.from} → ${e.data.to}`;
  }
  return base;
}

// state_change events between idle/init and another state are bookkeeping
// noise — every meaningful transition already emits a discrete event
// (bark, movement, feed, snack, alert).
const SUPPRESSED_STATES = new Set(["idle", "init"]);

function isRealEvent(e: DeviceEvent): boolean {
  if (e.type !== "state_change") return true;
  const from = e.data?.from ?? "";
  const to = e.data?.to ?? "";
  return !SUPPRESSED_STATES.has(from) && !SUPPRESSED_STATES.has(to);
}

type Props = { events: DeviceEvent[] };

export function EventsList({ events }: Props) {
  const recent = [...events].reverse().filter(isRealEvent).slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">eventos</h2>
        <span className="text-xs text-muted">últimos {recent.length}</span>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted">sem eventos no período</p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-panelAlt px-3 py-2"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${EVENT_COLORS[e.type] ?? "bg-zinc-500"}`}
              />
              <span className="flex-1 text-sm text-ink">{describe(e)}</span>
              <span className="text-xs tabular-nums text-muted">
                {formatHHMM(e.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
