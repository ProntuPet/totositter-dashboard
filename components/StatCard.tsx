type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-panel px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
