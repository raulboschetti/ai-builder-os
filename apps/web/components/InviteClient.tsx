"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";

import {
  ApiError,
  createInvitation,
  Invitation,
  listProjectClients,
  ProjectClientAccess,
  revokeClientAccess,
  revokeInvitation,
} from "../lib/api";

export function InviteClient({
  workspaceId,
  projectId,
  invitations,
  onInvitationsChange,
}: {
  workspaceId: string;
  projectId: string;
  invitations: Invitation[];
  onInvitationsChange: (invitations: Invitation[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ProjectClientAccess[]>([]);

  const clientInvitations = invitations.filter(
    (inv) => inv.role === "CLIENT" && inv.projectId === projectId,
  );

  useEffect(() => {
    listProjectClients(workspaceId, projectId)
      .then(setClients)
      .catch(() => {
        // No es crítico si falla — simplemente no se muestra la lista.
      });
  }, [workspaceId, projectId]);

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

  async function handleRevokeInvitation(id: string) {
    await revokeInvitation(id);
    onInvitationsChange(invitations.filter((inv) => inv.id !== id));
  }

  async function handleRevokeAccess(membershipId: string) {
    if (!confirm("¿Quitar el acceso de este cliente al proyecto?")) return;
    await revokeClientAccess(workspaceId, projectId, membershipId);
    setClients((prev) => prev.filter((c) => c.membershipId !== membershipId));
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
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-paper-200/60 hover:text-paper-50"
          >
            Cancelar
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {clientInvitations.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase text-grid-400">
            Invitaciones pendientes
          </p>
          <ul className="mt-1.5 divide-y divide-grid-500/40">
            {clientInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <p className="text-sm text-paper-50">{invitation.email}</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-grid-400">
                    Pendiente
                  </span>
                  <button
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    title="Cancelar invitación (puedes crear otra con el email correcto)"
                    className="flex h-6 w-6 items-center justify-center rounded text-paper-200/50 transition hover:bg-ink-800 hover:text-red-400"
                  >
                    <X size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {clients.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase text-grid-400">
            Con acceso
          </p>
          <ul className="mt-1.5 divide-y divide-grid-500/40">
            {clients.map((client) => (
              <li
                key={client.membershipId}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-paper-50">
                    {client.name ?? client.email}
                  </p>
                  <p className="text-xs text-paper-200/50">{client.email}</p>
                </div>
                <button
                  onClick={() => handleRevokeAccess(client.membershipId)}
                  className="rounded-lg border border-red-900 px-2.5 py-1 text-xs text-red-400 transition hover:border-red-700 hover:text-red-300"
                >
                  Quitar acceso
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-paper-200/50">
        El cliente solo verá este proyecto — nada más de tu cuenta.
      </p>
    </div>
  );
}
