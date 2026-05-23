"use client";

import { useEffect, useRef, useState } from "react";
import {
  off,
  onValue,
  query,
  ref,
  limitToLast,
  type DataSnapshot,
} from "firebase/database";
import { getDb } from "./firebase";
import type { DeviceEvent, DeviceState, EventType, IntensitySample } from "./types";

const EVENTS_PATH = "/totositter/events";
const STATE_PATH = "/totositter/state";
const EVENTS_LIMIT = 2000;
// Heartbeat lands every 5s -> 17_280 samples per 24h. Cap a bit above that
// so the 24h Latido view can backfill from a single session.
const INTENSITY_BUFFER_MAX = 20_000;

export function useDeviceState(): DeviceState | null {
  const [state, setState] = useState<DeviceState | null>(null);

  useEffect(() => {
    const db = getDb();
    const r = ref(db, STATE_PATH);
    const handler = (snap: DataSnapshot) => {
      const v = snap.val();
      if (v && typeof v === "object") setState(v as DeviceState);
    };
    onValue(r, handler);
    return () => off(r, "value", handler);
  }, []);

  return state;
}

// Heartbeats overwrite a single RTDB node, so historical intensity must be
// accumulated client-side. Samples are deduped by (ts, uptime_ms).
export function useIntensityBuffer(): IntensitySample[] {
  const [samples, setSamples] = useState<IntensitySample[]>([]);
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    const db = getDb();
    const r = ref(db, STATE_PATH);
    const handler = (snap: DataSnapshot) => {
      const v = snap.val();
      if (!v || typeof v !== "object") return;
      const s = v as DeviceState;
      const key = `${s.ts}:${s.uptime_ms}`;
      if (seenRef.current === key) return;
      seenRef.current = key;
      const pct =
        s.mic_peak > 0
          ? Math.min(100, Math.max(0, (s.mic_rms / s.mic_peak) * 100))
          : 0;
      // Prefer wall-clock ts when NTP is synced, otherwise the client's now
      // is the only meaningful x-axis value.
      const tsSec = s.ts > 0 ? s.ts : Math.floor(Date.now() / 1000);
      setSamples((prev) => {
        const next = [...prev, { ts: tsSec, pct }];
        if (next.length > INTENSITY_BUFFER_MAX) {
          next.splice(0, next.length - INTENSITY_BUFFER_MAX);
        }
        return next;
      });
    };
    onValue(r, handler);
    return () => off(r, "value", handler);
  }, []);

  return samples;
}

export function useDeviceEvents(): DeviceEvent[] {
  const [events, setEvents] = useState<DeviceEvent[]>([]);

  useEffect(() => {
    const db = getDb();
    const q = query(ref(db, EVENTS_PATH), limitToLast(EVENTS_LIMIT));
    const handler = (snap: DataSnapshot) => {
      const v = snap.val();
      if (!v || typeof v !== "object") {
        setEvents([]);
        return;
      }
      const list: DeviceEvent[] = Object.entries(v as Record<string, unknown>)
        .map(([id, raw]): DeviceEvent | null => {
          if (!raw || typeof raw !== "object") return null;
          const e = raw as Record<string, unknown>;
          const type = e.type as EventType | undefined;
          if (!type) return null;
          return {
            id,
            type,
            ts: typeof e.ts === "number" ? e.ts : 0,
            uptime_ms: typeof e.uptime_ms === "number" ? e.uptime_ms : 0,
            data: (e.data as DeviceEvent["data"]) ?? undefined,
          };
        })
        .filter((e): e is DeviceEvent => e !== null)
        .sort((a, b) => {
          if (a.ts !== b.ts) return a.ts - b.ts;
          return a.uptime_ms - b.uptime_ms;
        });
      setEvents(list);
    };
    onValue(q, handler);
    return () => off(q, "value", handler);
  }, []);

  return events;
}
