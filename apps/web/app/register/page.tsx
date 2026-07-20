"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthLayout } from "../../components/AuthLayout";
import { FormField } from "../../components/FormField";
import { ApiError, login, register, storeSession } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, organizationName, email, password });
      // El registro crea usuario + organización; encadenamos el login
      // para no pedirle las credenciales dos veces seguidas.
      const auth = await login(email, password);
      storeSession(auth);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se ha podido crear la cuenta",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Módulo: Autenticación"
      title="Crea tu organización"
      subtitle="Un espacio propio y aislado para tu negocio. Empieza a diseñar."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Tu nombre"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Nombre de tu negocio"
          type="text"
          placeholder="Clínica Dental García"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
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
          disabled={loading}
          className="mt-2 rounded-lg bg-ink-950 px-4 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}
