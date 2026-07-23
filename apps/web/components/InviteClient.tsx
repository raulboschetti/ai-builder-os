"use client";

import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";

import { ApiError, createInvitation, Invitation } from "../lib/api";

export function InviteClient({
  projectId,
  invitations,
  onInvitationsChange,
}: {
  projectId: string;
  invitations: Invitation[];
  onInvitationsChange: (invitations: Invitation[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientInvitations = invitations.filter(
    (inv) => inv.role === "CLIENT" && inv.projectId === projectId,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const invitation = await createInvitation(email, {
        role: "CLIENT",
        projectId,
      });
      onInvitationsChange([invitation, ...invitations]);
      setEmail("");
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se ha podido invitar",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
          Acceso del cliente
        </p>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-grid-500 px-3 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50"
          >
            <UserPlus size={12} />
            Invitar cliente
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="email"
            required
            autoFocus
            placeholder="email-del-cliente@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Invitar"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {clientInvitations.length > 0 && (
        <ul className="mt-3 divide-y divide-grid-500/40">
          {clientInvitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
            >
              <p className="text-sm text-paper-50">{invitation.email}</p>
              <p className="font-mono text-[10px] uppercase text-grid-400">
                Pendiente
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-paper-200/50">
        El cliente solo verá este proyecto — nada más de tu cuenta.
      </p>
    </div>
  );
}
