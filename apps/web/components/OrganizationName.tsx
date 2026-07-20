"use client";

import { FormEvent, useState } from "react";

import { updateOrganization } from "../lib/api";

export function OrganizationName({
  name,
  slug,
  onNameChange,
}: {
  name: string;
  slug: string;
  onNameChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await updateOrganization(value);
      onNameChange(updated.name);
      setEditing(false);
    } catch {
      setError("No se ha podido cambiar el nombre");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg text-paper-50">{name}</p>
          <p className="mt-1 font-mono text-xs text-grid-400">{slug}</p>
        </div>
        <button
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          className="rounded-lg border border-grid-500 px-3 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50"
        >
          Renombrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 outline-none focus:border-amber-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-medium text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
      >
        {loading ? "…" : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-paper-200/60 hover:text-paper-50"
      >
        Cancelar
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
