import type { PoolClient } from "pg";
import { z } from "zod";
import { withTransaction, pool } from "../db";
import type { Appointment } from "../models";
import { SlotAlreadyBookedError, NotFoundError } from "../errors";
import * as appointmentRepository from "../repositories/appointmentRepository";
import * as notificationRepository from "../repositories/notificationRepository";

export const createAppointmentSchema = z.object({
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
  name: z.string().min(1),
  email: z.string().email(),
  note: z.string().max(500).optional()
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export { SlotAlreadyBookedError };

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  const parsed = createAppointmentSchema.parse(input);

  return withTransaction(async (client: PoolClient) => {
    try {
      const appointment = await appointmentRepository.insert(client, {
        slot_start: parsed.slotStart,
        slot_end: parsed.slotEnd,
        customer_name: parsed.name,
        customer_email: parsed.email,
        note: parsed.note ?? null,
        status: "booked"
      });

      await notificationRepository.createForAppointment(client, appointment.id);

      await client.query(
        "SELECT graphile_worker.add_job($1, $2::json)",
        ["send_notification", JSON.stringify({ appointmentId: appointment.id })]
      );

      return appointment;
    } catch (err: unknown) {
      const pgErr = err as { code?: string };
      if (pgErr?.code === "23505") {
        throw new SlotAlreadyBookedError("Slot already booked");
      }
      throw err;
    }
  });
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  return withTransaction(async (client: PoolClient) => {
    const existing = await appointmentRepository.findById(client, id, true);

    if (!existing) {
      throw new NotFoundError("Appointment not found");
    }

    if (existing.status === "cancelled") {
      return existing;
    }

    return appointmentRepository.updateStatus(client, id, "cancelled");
  });
}

export async function getAppointment(id: number): Promise<Appointment | null> {
  return appointmentRepository.findById(pool, id);
}

export async function listAppointments(): Promise<Appointment[]> {
  return appointmentRepository.list(pool);
}
