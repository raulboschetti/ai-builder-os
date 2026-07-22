"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppWindow, Globe, MessageCircle, Phone } from "lucide-react";

import { AnalysisPanel } from "../../components/AnalysisPanel";
import { BuildStageTimeline } from "../../components/BuildStageTimeline";
import { ServiceStatusCard } from "../../components/ServiceStatusCard";
import { UserMenu } from "../../components/UserMenu";
import {
  ApiError,
  ClientProject,
  getAccessToken,
  getClientAnalysis,
  getClientProject,
  me,
  ProjectAnalysis,
  SessionUser,
} from "../../lib/api";

export default function ClientPage() {
  const router = useRouter();
  const [project, setProject] = useState<ClientProject | null>(null);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    Promise.all([me(), getClientProject()])
      .then(([meResponse, projectData]) => {
        setUser(meResponse.user);
        setProject(projectData);
        return getClientAnalysis();
      })
      .then(setAnalysis)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("No se ha podido cargar tu panel");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
        Cargando…
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-red-400">
        {error ?? "No se ha encontrado tu proyecto"}
      </main>
    );
  }

  const appActive = project.buildStage === "DEPLOYED";

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex items-center justify-between border-b border-grid-500/50 px-8 py-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
            {project.organizationName}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-xl text-paper-50">
            {project.name}
          </h1>
        </div>
        {user && <UserMenu name={user.name ?? user.email} image={user.image} />}
      </header>

      <main className="mx-auto max-w-3xl px-8 py-8">
        <div className="rounded-xl border border-grid-500/60 bg-ink-900 p-6">
          <BuildStageTimeline current={project.buildStage} />
        </div>

        <h2 className="mb-4 mt-8 font-[family-name:var(--font-display)] text-lg text-paper-50">
          Tus servicios
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ServiceStatusCard
            icon={Globe}
            label="API"
            status={appActive ? "Activa" : "Próximamente"}
            active={appActive}
          />
          <ServiceStatusCard
            icon={AppWindow}
            label="App / Web"
            status={appActive ? "Publicada" : "En construcción"}
            active={appActive}
          />
          <ServiceStatusCard
            icon={MessageCircle}
            label="Agente WhatsApp"
            status="Próximamente"
            active={false}
          />
          <ServiceStatusCard
            icon={Phone}
            label="Agente de llamadas"
            status="Próximamente"
            active={false}
          />
        </div>

        <AnalysisPanel
          workspaceId={project.workspaceId}
          projectId={project.id}
          initialAnalysis={analysis}
          readOnly
        />
      </main>
    </div>
  );
}
