"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { InviteMembers } from "../../components/InviteMembers";
import { ProfileSettings } from "../../components/ProfileSettings";
import { Sidebar } from "../../components/Sidebar";
import { UserMenu } from "../../components/UserMenu";
import {
  ApiError,
  getAccessToken,
  Invitation,
  listInvitations,
  listOrganizationUsers,
  me,
  MeResponse,
  SessionUser,
} from "../../lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [members, setMembers] = useState<SessionUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    Promise.all([me(), listOrganizationUsers(), listInvitations()])
      .then(([meResponse, users, pending]) => {
        setSession(meResponse);
        setMembers(users);
        setInvitations(pending);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError("No se ha podido cargar la configuración");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleUserChange(updatedUser: SessionUser) {
    if (!session) return;
    setSession({ ...session, user: updatedUser });
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedUser.id ? updatedUser : m)),
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-paper-50">
            Configuración
          </h1>
          {session && (
            <UserMenu
              name={session.user.name ?? session.user.email}
              image={session.user.image}
            />
          )}
        </div>

        {loading && (
          <p className="mt-4 font-mono text-sm text-grid-400">Cargando…</p>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {session && (
          <div className="mt-8 max-w-2xl space-y-6">
            <ProfileSettings
              user={session.user}
              onUserChange={handleUserChange}
            />

            <section className="rounded-xl border border-grid-500/60 bg-ink-900 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
                Tu organización
              </p>
              <p className="mt-3 text-lg text-paper-50">
                {session.organization.name}
              </p>
              <p className="mt-1 font-mono text-xs text-grid-400">
                {session.organization.slug}
              </p>
            </section>

            <section className="rounded-xl border border-grid-500/60 bg-ink-900 p-6">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-amber-400" />
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
                  Miembros del equipo
                </p>
              </div>

              <ul className="mt-4 divide-y divide-grid-500/40">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-grid-500 font-mono text-xs text-paper-50">
                      {(member.name ?? member.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-paper-50">
                        {member.name ?? member.email}
                      </p>
                      <p className="text-xs text-paper-200/50">
                        {member.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <InviteMembers
              invitations={invitations}
              onInvitationsChange={setInvitations}
            />

            <div className="rounded-xl border border-dashed border-grid-500 p-6 text-center">
              <p className="text-sm text-paper-200/60">
                Cambiar el nombre de la organización y gestionar roles
                todavía no están conectados — están en el roadmap.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
