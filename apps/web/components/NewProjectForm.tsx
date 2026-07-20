import { FormEvent, useState } from "react";

export function NewProjectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    name: string;
    businessVertical?: string;
    description?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [businessVertical, setBusinessVertical] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        name,
        businessVertical: businessVertical || undefined,
        description: description || undefined,
      });
    } catch {
      setError("No se ha podido crear el proyecto");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-amber-400/40 bg-ink-900 p-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
        Describe tu negocio
      </p>

      <input
        autoFocus
        required
        placeholder="Nombre del proyecto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-3 w-full rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
      />

      <input
        placeholder="Vertical de negocio (ej: dentista, fontanero…)"
        value={businessVertical}
        onChange={(e) => setBusinessVertical(e.target.value)}
        className="mt-2 w-full rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
      />

      <textarea
        placeholder="Cuéntanos qué necesita tu negocio…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear proyecto"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-paper-200/70 hover:text-paper-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
