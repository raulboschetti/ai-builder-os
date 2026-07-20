"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthLayout } from "../../components/AuthLayout";
import { FormField } from "../../components/FormField";
import { ApiError, login, storeSession } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = await login(email, password);
      storeSession(auth);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se ha podido iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Módulo: Autenticación"
      title="Accede a tu organización"
      subtitle="Continúa levantando lo que ya has empezado a construir."
      footer={
        <>
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="text-amber-400 hover:underline">
            Crea tu organización
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Correo"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Contraseña"
          type="password"
          required
          autoComplete="current-password"
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
          disabled={loading}
          className="mt-2 rounded-lg bg-ink-950 px-4 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "Accediendo…" : "Iniciar sesión"}
        </button>
      </form>
    </AuthLayout>
  );
}
