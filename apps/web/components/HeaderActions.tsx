"use client";

import { useEffect, useState } from "react";
import { Bell, HelpCircle } from "lucide-react";

import {
  listNotifications,
  markAllNotificationsRead,
  Notification,
} from "../lib/api";
import { UserMenu } from "./UserMenu";

export function HeaderActions({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    listNotifications()
      .then(setNotifications)
      .catch(() => {
        // Si falla, simplemente no mostramos notificaciones — no es crítico.
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((prev) => !prev);

    if (!open && unreadCount > 0) {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={handleOpen}
          title="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-paper-200/60 transition hover:bg-ink-800 hover:text-paper-50"
        >
          <Bell size={17} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 rounded-lg border border-grid-500/60 bg-ink-900 py-1 shadow-xl">
            <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-grid-400">
              Notificaciones
            </p>
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-paper-200/50">
                No tienes notificaciones todavía.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border-t border-grid-500/30 px-3 py-2.5 text-sm text-paper-200/80"
                  >
                    {n.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
