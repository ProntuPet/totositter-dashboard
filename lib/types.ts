export type DeviceStateLabel = "idle" | "bark" | "move" | "alert" | string;

export type DeviceState = {
  ts: number;
  uptime_ms: number;
  state: DeviceStateLabel;
  mic_rms: number;
  mic_peak: number;
  mic_level: number;
  prox: number;
  feed_count: number;
  snack_count: number;
  last_feed_ms: number;
  last_snack_ms: number;
  last_bark_ms: number;
  last_move_ms: number;
  bark_active: boolean;
  move_active: boolean;
  correlation_on: boolean;
  rssi: number;
};

export type EventType =
  | "boot"
  | "bark"
  | "movement"
  | "feed"
  | "alert"
  | "snack"
  | "state_change";

export type DeviceEvent = {
  id: string;
  type: EventType;
  ts: number;
  uptime_ms: number;
  data?: {
    source?: "auto" | "button";
    count?: number;
    proximity?: number;
    reason?: string;
    from?: string;
    to?: string;
    fw?: string;
    ip?: string;
    rssi?: number;
  };
};

export type RangeKey = "24h" | "7d" | "30d";

export type IntensitySample = {
  ts: number;
  pct: number;
};
