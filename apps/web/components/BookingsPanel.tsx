"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";

import {
  Appointment,
  BusinessHour,
  cancelAppointment,
  createService,
  deleteService,
  getBusinessHours,
  listAppointments,
  listServices,
  Service,
  setBusinessHours,
} from "../lib/api";

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function BookingsPanel({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<Record<number, BusinessHour>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);

  useEffect(() => {
    Promise.all([
      listServices(workspaceId, projectId),
      getBusinessHours(workspaceId, projectId),
      listAppointments(workspaceId, projectId),
    ])
      .then(([servicesRes, hoursRes, appointmentsRes]) => {
        setServices(servicesRes);
        const map: Record<number, BusinessHour> = {};
        hoursRes.forEach((h) => (map[h.dayOfWeek] = h));
        setHours(map);
        setAppointments(appointmentsRes);
      })
      .finally(() => setLoading(false));
  }, [workspaceId, projectId]);

  async function handleAddService(event: FormEvent) {
    event.preventDefault();
    if (!newServiceName.trim()) return;
    const service = await createService(workspaceId, projectId, {
      name: newServiceName,
      durationMinutes: newServiceDuration,
    });
    setServices((prev) => [...prev, service]);
    setNewServiceName("");
    setNewServiceDuration(30);
  }

  async function handleDeleteService(serviceId: string) {
    await deleteService(workspaceId, projectId, serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  }

  function toggleDay(dayOfWeek: number) {
    setHours((prev) => {
      const next = { ...prev };
      if (next[dayOfWeek]) {
        delete next[dayOfWeek];
      } else {
        next[dayOfWeek] = { dayOfWeek, startTime: "09:00", endTime: "18:00" };
      }
      return next;
    });
  }

  function updateDayTime(
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setHours((prev) => {
      const current = prev[dayOfWeek] ?? {
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
      };
      return { ...prev, [dayOfWeek]: { ...current, [field]: value } };
    });
  }

  async function handleSaveHours() {
    const days = Object.values(hours);
    const saved = await setBusinessHours(workspaceId, projectId, days);
    const map: Record<number, BusinessHour> = {};
    saved.forEach((h) => (map[h.dayOfWeek] = h));
    setHours(map);
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!confirm("¿Cancelar esta cita?")) return;
    await cancelAppointment(workspaceId, projectId, appointmentId);
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
        <p className="font-mono text-sm text-grid-400">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-grid-500/60 bg-ink-900 p-6">
      <div className="flex items-center gap-2">
        <CalendarClock size={14} className="text-amber-400" />
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-400">
          Citas
        </p>
      </div>

      {services.length === 0 && (
        <p className="mt-2 text-xs text-paper-200/50">
          Sin servicios todavía, el agente de WhatsApp no puede reservar
          nada. Añade al menos uno para activar las citas en este proyecto.
        </p>
      )}

      {/* Servicios */}
      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase text-grid-400">
          Servicios
        </p>
        {services.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between rounded-lg border border-grid-500/40 px-3 py-2"
              >
                <span className="text-sm text-paper-50">
                  {service.name}{" "}
                  <span className="text-paper-200/50">
                    ({service.durationMinutes} min)
                  </span>
                </span>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="text-paper-200/50 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddService} className="mt-2 flex gap-2">
          <input
            placeholder="Nombre del servicio"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="flex-1 rounded-lg border border-grid-500 bg-ink-950 px-3 py-1.5 text-sm text-paper-50 placeholder:text-grid-400 outline-none focus:border-amber-400"
          />
          <input
            type="number"
            min={5}
            max={480}
            value={newServiceDuration}
            onChange={(e) => setNewServiceDuration(Number(e.target.value))}
            className="w-20 rounded-lg border border-grid-500 bg-ink-950 px-2 py-1.5 text-sm text-paper-50 outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-amber-500"
          >
            <Plus size={12} />
            Añadir
          </button>
        </form>
      </div>

      {/* Horario semanal */}
      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase text-grid-400">
          Horario semanal
        </p>
        <div className="mt-2 space-y-1.5">
          {DAY_LABELS.map((label, dayOfWeek) => {
            const day = hours[dayOfWeek];
            return (
              <div key={dayOfWeek} className="flex items-center gap-2">
                <label className="flex w-28 items-center gap-2 text-xs text-paper-200/80">
                  <input
                    type="checkbox"
                    checked={!!day}
                    onChange={() => toggleDay(dayOfWeek)}
                  />
                  {label}
                </label>
                {day && (
                  <>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) =>
                        updateDayTime(dayOfWeek, "startTime", e.target.value)
                      }
                      className="rounded-lg border border-grid-500 bg-ink-950 px-2 py-1 text-xs text-paper-50 outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-paper-200/50">a</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) =>
                        updateDayTime(dayOfWeek, "endTime", e.target.value)
                      }
                      className="rounded-lg border border-grid-500 bg-ink-950 px-2 py-1 text-xs text-paper-50 outline-none focus:border-amber-400"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={handleSaveHours}
          className="mt-3 rounded-lg border border-grid-500 px-3 py-1.5 text-xs text-paper-200/80 transition hover:border-grid-400 hover:text-paper-50"
        >
          Guardar horario
        </button>
      </div>

      {/* Citas reservadas */}
      {appointments.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase text-grid-400">
            Próximas citas
          </p>
          <ul className="mt-2 space-y-1.5">
            {appointments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-grid-500/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-paper-50">
                    {a.customerName ?? a.customerPhone} —{" "}
                    {a.service?.name ?? "Servicio"}
                  </p>
                  <p className="text-xs text-paper-200/50">
                    {new Date(a.startAt).toLocaleString("es-ES")}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelAppointment(a.id)}
                  className="rounded-lg border border-red-900 px-2.5 py-1 text-xs text-red-400 transition hover:border-red-700 hover:text-red-300"
                >
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
