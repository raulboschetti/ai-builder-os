"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { BuildStageTimeline } from "../../../components/BuildStageTimeline";
import { Sidebar } from "../../../components/Sidebar";
import { ApiError, getAccessToken, getProject, Project } from "../../../lib/api";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    if (!workspaceId) {
      setError("Falta el workspace del proyecto");
      setLoading(false);
      return;
    }

    getProject(workspaceId, params.id)
      .then(setProject)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("No se ha podido cargar el proyecto");
      })
      .finally(() => setLoading(false));
  }, [router, workspaceId, params.id]);

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-paper-200/60 hover:text-paper-50"
        >
          <ArrowLeft size={14} />
          Volver a proyectos
        </Link>

        {loading && (
          <p className="font-mono text-sm text-grid-400">Cargando…</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {project && (
          <div className="max-w-2xl">
            {project.businessVertical && (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
                {project.businessVertical}
              </p>
            )}
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-paper-50">
              {project.name}
            </h1>

            <div className="mt-8 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
              <BuildStageTimeline current={project.buildStage} />
            </div>

            <div className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
                Descripción del negocio
              </p>
              <p className="mt-2 text-sm leading-relaxed text-paper-200/80">
                {project.description || "Sin descripción todavía."}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-grid-500 p-6 text-center">
              <p className="text-sm text-paper-200/60">
                Aquí es donde la IA va a diseñar la arquitectura y empezar a
                construir tu proyecto. Todavía no está conectado — es el
                siguiente paso del roadmap.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
