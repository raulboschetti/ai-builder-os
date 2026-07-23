"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Blocks,
  CreditCard,
  Database,
  Home,
  LayoutGrid,
  LineChart,
  Map,
  Menu,
  Rocket,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import { SpainSkyline } from "./SpainSkyline";

const LIVE_ITEMS = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Proyectos", icon: LayoutGrid, href: "/" },
  { label: "Roadmap 90 días", icon: Map, href: "/herramientas/roadmap" },
  { label: "Configuración", icon: Settings, href: "/settings" },
];

const UPCOMING_ITEMS = [
  { label: "IA Builder", icon: Sparkles },
  { label: "Base de datos", icon: Database },
  { label: "Integraciones", icon: Blocks },
  { label: "Despliegue", icon: Rocket },
  { label: "Analíticas", icon: LineChart },
  { label: "Facturación", icon: CreditCard },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-grid-500/60 bg-ink-900 text-paper-50 md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Fondo oscuro al abrir en móvil */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-grid-500/50 bg-ink-900 px-4 py-6 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-paper-50">
            KROQUI<span className="text-amber-400">X</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-paper-200/60 hover:text-paper-50 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {LIVE_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-200/80 transition hover:bg-ink-800 hover:text-paper-50"
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="mb-2 mt-6 px-3 font-mono text-[10px] uppercase tracking-wide text-grid-400">
          Próximamente
        </p>
        <nav className="flex flex-col gap-1">
          {UPCOMING_ITEMS.map((item) => (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-200/30"
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </span>
          ))}
        </nav>

        <div className="mt-auto overflow-hidden rounded-lg border border-grid-500/50">
          <div className="bg-ink-950 px-3 pt-3">
            <SpainSkyline />
          </div>
          <div className="px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-amber-400">
              🇪🇸 Hecho en España
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
