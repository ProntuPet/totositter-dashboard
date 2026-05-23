import type { DeviceEvent } from "@/lib/types";

const SNACK_LIMIT = 3;

type Props = { todayEvents: DeviceEvent[] };

export function SnackAlertBanner({ todayEvents }: Props) {
  const snacks = todayEvents.filter((e) => e.type === "snack").length;
  if (snacks <= SNACK_LIMIT) return null;

  return (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {snacks} snacks já liberados hoje — limite recomendado: {SNACK_LIMIT}
    </div>
  );
}
