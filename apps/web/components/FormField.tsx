import { InputHTMLAttributes } from "react";

export function FormField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-700/70">
        {label}
      </span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
      />
    </label>
  );
}
