import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-grid-500/50 bg-ink-900 p-5">
      <div>
        <p className="text-sm text-paper-200/60">{label}</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-paper-50">
          {value}
        </p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-amber-400">
        <Icon size={18} strokeWidth={1.75} />
      </div>
    </div>
  );
}
