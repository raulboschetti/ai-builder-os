import Link from "next/link";
import type { Project } from "../lib/api";

const STAGE_LABELS: Record<Project["buildStage"], string> = {
  INTAKE: "Recién descrito",
  ARCHITECTURE_GENERATED: "Arquitectura lista",
  BUILDING: "Construyendo",
  DEPLOYED: "Publicado",
};

const STAGE_COLORS: Record<Project["buildStage"], string> = {
  INTAKE: "text-grid-400",
  ARCHITECTURE_GENERATED: "text-amber-400",
  BUILDING: "text-amber-400",
  DEPLOYED: "text-cyan-400",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.id}?workspaceId=${project.workspaceId}`}
      className="block rounded-xl border border-grid-500/60 bg-ink-900 p-5 transition hover:border-grid-400"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-paper-50">
          {project.name}
        </h3>
        <span
          className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${STAGE_COLORS[project.buildStage]}`}
        >
          {STAGE_LABELS[project.buildStage]}
        </span>
      </div>

      {project.businessVertical && (
        <p className="mt-1 font-mono text-xs uppercase tracking-wide text-grid-400">
          {project.businessVertical}
        </p>
      )}

      {project.description && (
        <p className="mt-3 line-clamp-2 text-sm text-paper-200/70">
          {project.description}
        </p>
      )}
    </Link>
  );
}
