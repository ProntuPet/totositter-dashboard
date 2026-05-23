import { StatCard } from "./StatCard";
import type { DeviceEvent, DeviceState } from "@/lib/types";
import { isToday } from "@/lib/time";

type Props = {
  state: DeviceState | null;
  todayEvents: DeviceEvent[];
};

export function StatCards({ state, todayEvents }: Props) {
  const barks = todayEvents.filter((e) => e.type === "bark").length;
  const snacks = todayEvents.filter((e) => e.type === "snack").length;
  const autoFeeds = todayEvents.filter(
    (e) => e.type === "feed" && e.data?.source === "auto",
  ).length;

  let peakPct = 0;
  for (const e of todayEvents) {
    if (e.type !== "bark") continue;
    // bark events don't carry intensity; treat every bark as ≥75% (the trigger threshold)
    peakPct = Math.max(peakPct, 75);
  }
  if (state && isToday(state.ts) && state.mic_peak > 0) {
    const live = Math.min(100, Math.round((state.mic_rms / state.mic_peak) * 100));
    peakPct = Math.max(peakPct, live);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="latidos" value={barks} hint="hoje" />
      <StatCard label="snacks hoje" value={snacks} />
      <StatCard label="auto-feeds hoje" value={autoFeeds} />
      <StatCard
        label="pico de latidos"
        value={`${peakPct}%`}
        hint={state ? `int. ${state.mic_level}/4` : "—"}
      />
    </div>
  );
}
