"use client";

import { FormEvent, useState } from "react";
import { Mail, X } from "lucide-react";

import {
  ApiError,
  createInvitation,
  Invitation,
  revokeInvitation,
} from "../lib/api";

export function InviteMembers({
  invitations,
  onInvitationsChange,
}: {
  invitations: Invitation[];
  onInvitationsChange: (invitations: Invitation[]) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const invitation = await createInvitation(email);
      onInvitationsChange([invitation, ...invitations]);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se ha podido invitar",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    await revokeInvitation(id);
    onInvitationsChange(invitations.filter((inv) => inv.id !== id));
  }

  return (
    <section className="rounded-xl border border-grid-500/60 bg-ink-900 p-6">
      <div className="flex items-center gap-2">
        <Mail size={14} className="text-amber-400" />
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
          Invitar al equipo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          required
          placeholder="email@ejemplo.com"
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

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {invitations.length > 0 && (
        <ul className="mt-4 divide-y divide-grid-500/40">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm text-paper-50">{invitation.email}</p>
                <p className="font-mono text-[10px] uppercase text-grid-400">
                  Pendiente
                </p>
              </div>
              <button
                onClick={() => handleRevoke(invitation.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-paper-200/50 transition hover:bg-ink-800 hover:text-red-400"
                title="Revocar invitación"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
