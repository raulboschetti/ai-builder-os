"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { NewProjectForm } from "../components/NewProjectForm";
import { ProjectCard } from "../components/ProjectCard";
import {
  ApiError,
  createProject,
  createWorkspace,
  getAccessToken,
  listProjects,
  listWorkspaces,
  me,
  MeResponse,
  Project,
  Workspace,
} from "../lib/api";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    async function bootstrap() {
      try {
        const meResponse = await me();
        setSession(meResponse);

        let workspaces = await listWorkspaces();

        // Primera visita: no hay ningún workspace todavía, se crea uno por
        // defecto de forma transparente — el usuario no técnico no debería
        // tener que pensar en "workspaces", solo en su negocio/proyecto.
        if (workspaces.length === 0) {
          const created = await createWorkspace("General");
          workspaces = [created];
        }

        const activeWorkspace = workspaces[0];

        if (!activeWorkspace) {
          throw new Error("No se pudo crear el workspace");
        }

        setWorkspace(activeWorkspace);

        const projectList = await listProjects(activeWorkspace.id);
        setProjects(projectList);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("No se ha podido cargar tu panel");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [router]);

  async function handleCreateProject(data: {
    name: string;
    businessVertical?: string;
    description?: string;
  }) {
    if (!workspace) return;
    const project = await createProject(workspace.id, data);
    setProjects((prev) => [...prev, project]);
    setShowForm(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
        Cargando tu plano de trabajo…
      </main>
    );
  }

  if (error || !session || !workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-red-400">
        {error ?? "Algo ha ido mal"}
      </main>
    );
  }

  return (
    <main className="blueprint-grid min-h-screen bg-ink-950 px-6 py-12 md:px-16">
      <header className="mx-auto mb-10 flex max-w-4xl items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
            {session.organization.name}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-paper-50">
            Tus proyectos
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500"
          >
            + Nuevo proyecto
          </button>
        )}
      </header>

      <div className="mx-auto max-w-4xl space-y-4">
        {showForm && (
          <NewProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setShowForm(false)}
          />
        )}

        {projects.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed border-grid-500 p-10 text-center">
            <p className="text-paper-200/70">
              Todavía no tienes ningún proyecto. Describe tu negocio y
              empezamos a construirlo.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500"
            >
              Crear el primero
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
