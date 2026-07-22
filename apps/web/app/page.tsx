"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Rocket, Users } from "lucide-react";

import { DashboardHeader } from "../components/DashboardHeader";
import { NewProjectForm } from "../components/NewProjectForm";
import { ProjectCard } from "../components/ProjectCard";
import { Sidebar } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";
import {
  ApiError,
  createProject,
  createWorkspace,
  getAccessToken,
  listOrganizationUsers,
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
  const [teamSize, setTeamSize] = useState(1);
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

        if (meResponse.organization.role === "CLIENT") {
          router.replace("/client");
          return;
        }

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

        const [projectList, users] = await Promise.all([
          listProjects(activeWorkspace.id),
          listOrganizationUsers(),
        ]);
        setProjects(projectList);
        setTeamSize(users.length);
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

  const deployedCount = projects.filter(
    (p) => p.buildStage === "DEPLOYED",
  ).length;

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      <div className="flex-1">
        <DashboardHeader
          name={session.user.name ?? session.user.email}
          organizationName={session.organization.name}
          image={session.user.image}
        />

        <main className="px-8 py-8">
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Proyectos"
              value={projects.length}
              icon={FolderKanban}
            />
            <StatCard
              label="Publicados"
              value={deployedCount}
              icon={Rocket}
            />
            <StatCard
              label="Miembros del equipo"
              value={teamSize}
              icon={Users}
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-paper-50">
              Tus proyectos
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500"
              >
                + Nuevo proyecto
              </button>
            )}
          </div>

          <div className="space-y-4">
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
