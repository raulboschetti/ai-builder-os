"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { clearSession } from "../lib/api";

export function DashboardHeader({
  name,
  organizationName,
}: {
  name: string;
  organizationName: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-grid-500/50 bg-ink-950 px-8 py-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-paper-50">
          Bienvenido de nuevo, {name} 👋
        </h1>
        <p className="text-sm text-paper-200/60">{organizationName}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-grid-500 font-mono text-sm text-paper-50"
        >
          {name.charAt(0).toUpperCase()}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-lg border border-grid-500/60 bg-ink-900 py-1 shadow-xl">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-paper-200/80 hover:bg-ink-800 hover:text-paper-50"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
