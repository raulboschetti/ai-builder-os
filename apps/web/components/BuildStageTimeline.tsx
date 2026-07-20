import type { ProjectBuildStage } from "../lib/api";

const STAGES: { key: ProjectBuildStage; label: string }[] = [
  { key: "INTAKE", label: "Descrito" },
  { key: "ARCHITECTURE_GENERATED", label: "Arquitectura" },
  { key: "BUILDING", label: "Construyendo" },
  { key: "DEPLOYED", label: "Publicado" },
];

export function BuildStageTimeline({
  current,
}: {
  current: ProjectBuildStage;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, index) => {
        const reached = index <= currentIndex;
        const isLast = index === STAGES.length - 1;

        return (
          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full border ${
                  reached
                    ? "border-amber-400 bg-amber-400"
                    : "border-grid-500 bg-transparent"
                }`}
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-wide ${
                  reached ? "text-amber-400" : "text-grid-400"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 mb-5 h-px flex-1 ${
                  index < currentIndex ? "bg-amber-400" : "bg-grid-500"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
