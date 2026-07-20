"use client";

import { FormEvent, useRef, useState } from "react";
import { Camera, KeyRound, User as UserIcon } from "lucide-react";

import {
  ApiError,
  avatarUrl,
  changePassword,
  SessionUser,
  updateProfile,
  uploadAvatar,
} from "../lib/api";

export function ProfileSettings({
  user,
  onUserChange,
}: {
  user: SessionUser;
  onUserChange: (user: SessionUser) => void;
}) {
  return (
    <section className="rounded-xl border border-grid-500/60 bg-ink-900 p-6">
      <div className="flex items-center gap-2">
        <UserIcon size={14} className="text-amber-400" />
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
          Tu perfil
        </p>
      </div>

      <AvatarUploader user={user} onUserChange={onUserChange} />
      <NameForm user={user} onUserChange={onUserChange} />
      <PasswordForm />
    </section>
  );
}

function AvatarUploader({
  user,
  onUserChange,
}: {
  user: SessionUser;
  onUserChange: (user: SessionUser) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const image = avatarUrl(user.image ?? null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const updated = await uploadAvatar(file);
      onUserChange(updated);
    } catch {
      setError("No se ha podido subir la foto");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-4 flex items-center gap-4">
      <div className="relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-grid-500 font-mono text-xl text-paper-50">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-ink-950 transition hover:bg-amber-500 disabled:opacity-50"
          title="Cambiar foto"
        >
          <Camera size={12} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm text-paper-50">{user.name ?? user.email}</p>
        <p className="text-xs text-paper-200/50">
          {loading ? "Subiendo…" : "PNG o JPG, máx. 5MB"}
        </p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

function NameForm({
  user,
  onUserChange,
}: {
  user: SessionUser;
  onUserChange: (user: SessionUser) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const updated = await updateProfile({ name });
      onUserChange(updated);
      setSaved(true);
    } catch {
      setError("No se ha podido guardar el nombre");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-grid-500/40 pt-6">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
          Nombre
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full max-w-sm rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 outline-none focus:border-amber-400"
        />
      </label>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {saved && <p className="mt-2 text-xs text-cyan-400">Guardado.</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-lg border border-grid-500 px-4 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar nombre"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se ha podido cambiar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-grid-500/40 pt-6">
      <div className="flex items-center gap-2">
        <KeyRound size={13} className="text-grid-400" />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-grid-400">
          Cambiar contraseña
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 max-w-sm">
        <input
          type="password"
          placeholder="Contraseña actual"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-lg border border-grid-500 bg-ink-950 px-3 py-2 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {saved && (
        <p className="mt-2 text-xs text-cyan-400">Contraseña actualizada.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-lg border border-grid-500 px-4 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50 disabled:opacity-50"
      >
        {loading ? "Cambiando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
