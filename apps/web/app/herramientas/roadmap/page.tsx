"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { HeaderActions } from "../../../components/HeaderActions";
import { Sidebar } from "../../../components/Sidebar";
import {
  ApiError,
  generateRoadmap,
  getAccessToken,
  me,
  RoadmapResult,
  SessionUser,
} from "../../../lib/api";

export default function RoadmapToolPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [businessVertical, setBusinessVertical] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    me()
      .then((res) => setUser(res.user))
      .catch(() => router.replace("/login"))
      .finally(() => setCheckingSession(false));
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const roadmap = await generateRoadmap({
        businessVertical: businessVertical || undefined,
        description,
      });
      setResult(roadmap);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "No se ha podido generar el roadmap. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
        Cargando…
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-grid-500/50 px-8 py-5 pl-16 md:pl-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
              Herramienta
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-xl text-paper-50">
              Roadmap de 90 días
            </h1>
          </div>
          {user && (
            <HeaderActions name={user.name ?? user.email} image={user.image} />
          )}
        </header>

        <main className="mx-auto max-w-2xl px-8 py-8">
          <p className="text-sm text-paper-200/70">
            Describe tu idea y te generamos un plan realista, en fases, para
            llevarla a producción.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6"
          >
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
                Vertical de negocio (opcional)
              </span>
              <input
                placeholder="ej: dentista, fontanero, seguros…"
                value={businessVertical}
                onChange={(e) => setBusinessVertical(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
              />
            </label>

            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
                Cuéntanos tu idea
              </span>
              <textarea
                required
                minLength={10}
                rows={4}
                placeholder="Quiero una app para que mis pacientes reserven citas online…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
              />
            </label>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {loading ? "Generando roadmap…" : "Generar mi roadmap"}
            </button>
          </form>

          {result && (
            <div className="mt-8 space-y-4">
              {result.phases.map((phase, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-grid-500/60 bg-ink-900 p-6"
                >
                  <p className="font-mono text-xs uppercase tracking-wide text-cyan-400">
                    {phase.days}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-paper-50">
                    {phase.title}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {phase.tasks.map((task, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-paper-200/80"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-6 text-center">
                <p className="text-sm text-paper-50">
                  ¿Quieres que este roadmap se construya solo?
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-amber-500"
                >
                  Crear un proyecto
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
