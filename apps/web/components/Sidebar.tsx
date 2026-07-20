"use client";

import {
  Blocks,
  CreditCard,
  Database,
  Home,
  LayoutGrid,
  LineChart,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react";

const LIVE_ITEMS = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Proyectos", icon: LayoutGrid, href: "/" },
  { label: "Configuración", icon: Settings, href: "/" },
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
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-grid-500/50 bg-ink-900 px-4 py-6">
      <div className="mb-8 px-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-paper-50">
        KROQUI<span className="text-amber-400">X</span>
      </div>

      <nav className="flex flex-col gap-1">
        {LIVE_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-200/80 transition hover:bg-ink-800 hover:text-paper-50"
          >
            <item.icon size={16} strokeWidth={1.75} />
            {item.label}
          </a>
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
    </aside>
  );
}
