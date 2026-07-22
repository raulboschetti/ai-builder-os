import { LucideIcon } from "lucide-react";

export function ServiceStatusCard({
  icon: Icon,
  label,
  status,
  active,
}: {
  icon: LucideIcon;
  label: string;
  status: string;
  active: boolean;
}) {
  return (
    <div className="rounded-xl border border-grid-500/60 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            active ? "bg-cyan-400/10 text-cyan-400" : "bg-ink-800 text-grid-400"
          }`}
        >
          <Icon size={16} />
        </div>
        <span
          className={`h-2 w-2 rounded-full ${active ? "bg-cyan-400" : "bg-grid-500"}`}
        />
      </div>
      <p className="mt-3 text-sm text-paper-50">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-grid-400">
        {status}
      </p>
    </div>
  );
}
