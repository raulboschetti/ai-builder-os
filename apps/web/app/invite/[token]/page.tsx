"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthLayout } from "../../../components/AuthLayout";
import { FormField } from "../../../components/FormField";
import {
  acceptInvitation,
  ApiError,
  getInvitation,
  InvitationPreview,
  storeSession,
} from "../../../lib/api";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();

  const [invitation, setInvitation] = useState<InvitationPreview | null>(
    null,
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvitation(params.token)
      .then(setInvitation)
      .catch(() =>
        setError("Esta invitación no es válida o ya ha caducado."),
      )
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const auth = await acceptInvitation(params.token, { name, password });
      storeSession(auth);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se ha podido aceptar la invitación",
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
        Comprobando invitación…
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <AuthLayout
      eyebrow="Invitación"
      title={`Únete a ${invitation.organizationName}`}
      subtitle="Crea tu contraseña para entrar al equipo."
      footer={<>Vas a entrar con {invitation.email}</>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Correo"
          type="email"
          value={invitation.email}
          disabled
        />
        <FormField
          label="Tu nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Contraseña"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-ink-950 px-4 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-ink-800 disabled:opacity-50"
        >
          {submitting ? "Uniéndote…" : "Unirme al equipo"}
        </button>
      </form>
    </AuthLayout>
  );
}
