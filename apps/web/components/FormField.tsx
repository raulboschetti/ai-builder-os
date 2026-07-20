"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function FormField({
  label,
  type,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-700/70">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={isPassword && visible ? "text" : type}
          className="mt-1.5 w-full rounded-lg border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-ink-700/50 hover:text-ink-950"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
}
