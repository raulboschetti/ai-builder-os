import { ReactNode } from "react";
import { BlueprintMark } from "./BlueprintMark";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-ink-950">
      {/* Blueprint panel — hidden on small screens */}
      <div className="blueprint-grid relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-grid-500/60 p-12 md:flex">
        <div className="draw-in font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
          AI-BUILDER-OS · DOC 01
        </div>

        <div className="draw-in flex flex-col items-start gap-8">
          <BlueprintMark />
          <div className="max-w-sm">
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-paper-50">
              Describe tu negocio.
              <br />
              Lo construimos nosotros.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-paper-200/70">
              Arquitectura, backend, frontend y despliegue: la IA diseña cada
              plano y lo levanta por ti.
            </p>
          </div>
        </div>

        <div className="draw-in font-mono text-[11px] text-grid-400">
          ESCALA 1:1 · REV. {new Date().getFullYear()}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-ink-900 px-6 py-16 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-amber-400" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400">
              {eyebrow}
            </span>
          </div>

          <div className="rounded-2xl bg-paper-50 p-8 shadow-2xl shadow-black/40">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink-950">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink-700">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>

          <div className="mt-6 text-center text-sm text-paper-200/60">
            {footer}
          </div>
        </div>
      </div>
    </main>
  );
}
