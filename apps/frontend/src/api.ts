import type {
  Appointment,
  AppointmentStatus,
  TimeSlot,
  CreateAppointmentPayload
} from "@booking/shared";

export type {
  Appointment,
  AppointmentStatus,
  TimeSlot,
  CreateAppointmentPayload
};

const API_BASE =
  (
    import.meta as unknown as {
      env: {
        VITE_API_BASE?: string;
      };
    }
  ).env.VITE_API_BASE ?? "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function fetchAvailability(): Promise<TimeSlot[]> {
  return fetch(`${API_BASE}/availability`).then((res) =>
    handle<TimeSlot[]>(res),
  );
}

export function fetchAppointments(): Promise<Appointment[]> {
  return fetch(`${API_BASE}/appointments`).then((res) =>
    handle<Appointment[]>(res),
  );
}

export function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  return fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => handle<Appointment>(res));
}

export function cancelAppointment(id: number): Promise<Appointment> {
  return fetch(`${API_BASE}/appointments/${id}/cancel`, {
    method: "POST",
  }).then((res) => handle<Appointment>(res));
}
