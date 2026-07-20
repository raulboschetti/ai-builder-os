"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { storeTokens } from "../../../lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }

    storeTokens(accessToken, refreshToken);
    router.replace("/");
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 font-mono text-sm text-grid-400">
      Completando el acceso…
    </main>
  );
}
