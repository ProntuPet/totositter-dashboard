"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { StatCards } from "@/components/StatCards";
import { ResumoHoje } from "@/components/ResumoHoje";
import { LatidoChart } from "@/components/LatidoChart";
import { SnackVsFeedChart } from "@/components/SnackVsFeedChart";
import { EventsList } from "@/components/EventsList";
import { SnackAlertBanner } from "@/components/SnackAlertBanner";
import {
  useDeviceEvents,
  useDeviceState,
  useIntensityBuffer,
} from "@/lib/useDashboard";
import { filterEventsInRange, isToday } from "@/lib/time";
import type { RangeKey } from "@/lib/types";

const STATE_FRESH_MS = 30_000;

export default function Page() {
  const [range, setRange] = useState<RangeKey>("24h");
  const state = useDeviceState();
  const events = useDeviceEvents();
  const intensity = useIntensityBuffer();

  const rangeEvents = useMemo(() => filterEventsInRange(events, range), [events, range]);
  const todayEvents = useMemo(() => events.filter((e) => isToday(e.ts)), [events]);

  const online = !!state && Date.now() / 1000 - state.ts < STATE_FRESH_MS / 1000;

  return (
    <main className="min-h-screen">
      <Header range={range} onRangeChange={setRange} online={online} />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <SnackAlertBanner todayEvents={todayEvents} />
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-ink">
          visão geral
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-5">
            <StatCards state={state} todayEvents={todayEvents} />
            <ResumoHoje events={events} />
            <SnackVsFeedChart events={rangeEvents} range={range} />
          </section>
          <section className="space-y-5">
            <LatidoChart samples={intensity} events={events} />
            <EventsList events={rangeEvents} />
          </section>
        </div>
      </div>
    </main>
  );
}
