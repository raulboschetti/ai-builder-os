"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { AnalysisPanel } from "../../../components/AnalysisPanel";
import { BuildStageTimeline } from "../../../components/BuildStageTimeline";
import { EditProjectForm } from "../../../components/EditProjectForm";
import { InviteClient } from "../../../components/InviteClient";
import { Sidebar } from "../../../components/Sidebar";
import { HeaderActions } from "../../../components/HeaderActions";
import {
  ApiError,
  deleteProject,
  getAccessToken,
  getLatestAnalysis,
  getProject,
  Invitation,
  listInvitations,
  me,
  Project,
  ProjectAnalysis,
  SessionUser,
  updateProject,
} from "../../../lib/api";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

    Promise.all([
      getProject(workspaceId, params.id),
      me(),
      getLatestAnalysis(workspaceId, params.id),
      listInvitations(),
    ])
      .then(([projectData, meResponse, analysisData, invitationsData]) => {
        setProject(projectData);
        setUser(meResponse.user);
        setAnalysis(analysisData);
        setInvitations(invitationsData);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("No se ha podido cargar el proyecto");
      })
      .finally(() => setLoading(false));
  }, [router, workspaceId, params.id]);

  async function handleUpdate(data: {
    name: string;
    businessVertical?: string;
    description?: string;
  }) {
    if (!workspaceId || !project) return;
    const updated = await updateProject(workspaceId, project.id, data);
    setProject(updated);
    setEditing(false);
  }

  async function handleDelete() {
    if (!workspaceId || !project) return;
    if (!confirm(`¿Seguro que quieres eliminar "${project.name}"?`)) return;

    setDeleting(true);
    try {
      await deleteProject(workspaceId, project.id);
      router.push("/");
    } catch {
      setError("No se ha podido eliminar el proyecto");
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      <main className="flex-1 px-8 py-8 pt-16 md:pt-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-paper-200/60 hover:text-paper-50"
          >
            <ArrowLeft size={14} />
            Volver a proyectos
          </Link>
          {user && (
            <HeaderActions name={user.name ?? user.email} image={user.image} />
          )}
        </div>

        {loading && (
          <p className="font-mono text-sm text-grid-400">Cargando…</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {project && !editing && (
          <div className="max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                {project.businessVertical && (
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
                    {project.businessVertical}
                  </p>
                )}
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-paper-50">
                  {project.name}
                </h1>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-grid-500 px-3 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50"
                >
                  <Pencil size={12} />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-700 hover:text-red-300 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {deleting ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>

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

            {workspaceId && (
              <AnalysisPanel
                workspaceId={workspaceId}
                projectId={project.id}
                initialAnalysis={analysis}
              />
            )}

            {workspaceId && (
              <InviteClient
                workspaceId={workspaceId}
                projectId={project.id}
                invitations={invitations}
                onInvitationsChange={setInvitations}
              />
            )}
          </div>
        )}

        {project && editing && (
          <div className="max-w-2xl">
            <EditProjectForm
              project={project}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
