"use client";

import { Bell, HelpCircle } from "lucide-react";

import { UserMenu } from "./UserMenu";

export function HeaderActions({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        title="Notificaciones (todavía no hay ninguna)"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-paper-200/60 transition hover:bg-ink-800 hover:text-paper-50"
      >
        <Bell size={17} strokeWidth={1.75} />
      </button>
      <button
        title="Ayuda"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-paper-200/60 transition hover:bg-ink-800 hover:text-paper-50"
      >
        <HelpCircle size={17} strokeWidth={1.75} />
      </button>
      <UserMenu name={name} image={image} />
    </div>
  );
}
