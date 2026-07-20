"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";

import { avatarUrl, clearSession } from "../lib/api";
import { useClickOutside } from "../lib/useClickOutside";

export function UserMenu({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedImage = avatarUrl(image ?? null);

  useClickOutside(containerRef, () => setMenuOpen(false), menuOpen);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-grid-500 font-mono text-sm text-paper-50"
      >
        {resolvedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-grid-500/60 bg-ink-900 py-1 shadow-xl">
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-paper-200/80 hover:bg-ink-800 hover:text-paper-50"
          >
            <Settings size={14} />
            Configuración
          </Link>
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
  );
}
