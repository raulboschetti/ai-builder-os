"use client";

import { HeaderActions } from "./HeaderActions";

export function DashboardHeader({
  name,
  organizationName,
  image,
}: {
  name: string;
  organizationName: string;
  image?: string | null;
}) {
  return (
    <header className="flex items-center justify-between border-b border-grid-500/50 bg-ink-950 px-8 py-5 pl-16 md:pl-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-paper-50">
          Bienvenido de nuevo, {name} 👋
        </h1>
        <p className="text-sm text-paper-200/60">{organizationName}</p>
      </div>

      <HeaderActions name={name} image={image} />
    </header>
  );
}
