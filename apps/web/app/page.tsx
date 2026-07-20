"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken } from "../lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface MeResponse {
  user: { id: string; name: string | null; email: string };
  organization: { id: string; name: string; slug: string };
}

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setMe)
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
        Cargando plano de sesión…
      </main>
    );
  }

  return (
    <main className="blueprint-grid flex min-h-screen flex-col items-center justify-center gap-2 bg-ink-950 px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
        {me.organization.name}
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-paper-50">
        Hola, {me.user.name ?? me.user.email}
      </h1>
      <p className="max-w-md text-sm text-paper-200/70">
        El panel de proyectos todavía no está construido — vas a ser de los
        primeros en verlo.
      </p>
    </main>
  );
}
