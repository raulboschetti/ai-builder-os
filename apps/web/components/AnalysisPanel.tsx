"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateAnalysis, ProjectAnalysis } from "../lib/api";

const VIABILITY_COLOR: Record<string, string> = {
  viable: "text-cyan-400",
  default: "text-amber-400",
};

function viabilityColor(viability: string) {
  return viability.toLowerCase().includes("viable") &&
    !viability.toLowerCase().includes("matices")
    ? VIABILITY_COLOR.viable
    : VIABILITY_COLOR.default;
}

export function AnalysisPanel({
  workspaceId,
  projectId,
  initialAnalysis,
}: {
  workspaceId: string;
  projectId: string;
  initialAnalysis: ProjectAnalysis | null;
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    try {
      const result = await generateAnalysis(workspaceId, projectId);
      setAnalysis(result);
    } catch {
      setError(
        "No se ha podido generar el análisis. Inténtalo de nuevo en un momento.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!analysis) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-grid-500 p-6 text-center">
        <p className="text-sm text-paper-200/60">
          Deja que la IA analice si este negocio es viable como aplicación,
          antes de empezar a construirlo.
        </p>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
        >
          <Sparkles size={14} />
          {loading ? "Analizando…" : "Analizar con IA"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
          Análisis de viabilidad (IA)
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          title="Volver a analizar"
          className="flex items-center gap-1.5 text-xs text-paper-200/60 transition hover:text-paper-50 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Analizando…" : "Repetir"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <CheckCircle2 size={16} className={viabilityColor(analysis.viability)} />
        <p className={`font-medium ${viabilityColor(analysis.viability)}`}>
          {analysis.viability}
        </p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-paper-200/80">
        {analysis.summary}
      </p>

      {analysis.keyFeatures.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-grid-400">
            Funcionalidades clave
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.keyFeatures.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-paper-200/80"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.risks.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-grid-400">
            A tener en cuenta
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.risks.map((risk, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-paper-200/70"
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400/70" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.marketCostEstimate && (
        <div className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
          <div className="flex items-center gap-1.5">
            <PiggyBank size={13} className="text-cyan-400" />
            <p className="font-mono text-[10px] uppercase tracking-wide text-cyan-400">
              Coste si lo contrataras fuera
            </p>
          </div>
          <p className="mt-1.5 text-sm text-paper-200/80">
            {analysis.marketCostEstimate}
          </p>
          <p className="mt-2 text-xs text-paper-200/50">
            Referencia de precio de mercado — no es lo que vas a pagar tú,
            ni de lejos.
          </p>
        </div>
      )}

      {analysis.recommendation && (
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-amber-400">
            Siguiente paso
          </p>
          <p className="mt-1.5 text-sm text-paper-50">
            {analysis.recommendation}
          </p>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
