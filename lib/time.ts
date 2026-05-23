import type { DeviceEvent, RangeKey } from "./types";

const SECONDS_PER_DAY = 86_400;

export function startOfTodayEpoch(now: Date = new Date()): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.floor(start.getTime() / 1000);
}

export function rangeStartEpoch(range: RangeKey, now: Date = new Date()): number {
  const today0 = startOfTodayEpoch(now);
  if (range === "24h") return today0;
  if (range === "7d") return today0 - 6 * SECONDS_PER_DAY;
  return today0 - 29 * SECONDS_PER_DAY;
}

export function isToday(tsSec: number, now: Date = new Date()): boolean {
  if (!tsSec) return false;
  const start = startOfTodayEpoch(now);
  return tsSec >= start && tsSec < start + SECONDS_PER_DAY;
}

export function formatHHMM(tsSec: number): string {
  if (!tsSec) return "--:--";
  const d = new Date(tsSec * 1000);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function filterEventsInRange(
  events: DeviceEvent[],
  range: RangeKey,
  now: Date = new Date(),
): DeviceEvent[] {
  const start = rangeStartEpoch(range, now);
  return events.filter((e) => e.ts >= start);
}
