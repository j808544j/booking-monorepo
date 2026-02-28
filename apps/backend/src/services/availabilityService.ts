import { z } from "zod";
import { pool } from "../db";
import type { TimeSlot } from "../models";
import { config } from "../config";
import { generateSlots } from "../availability";
import * as appointmentRepository from "../repositories/appointmentRepository";
import { ValidationError } from "../errors";

const availabilityInputSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  })
  .refine(
    (value) => {
      if (!value.from || !value.to) {
        return true;
      }
      return new Date(value.from).getTime() <= new Date(value.to).getTime();
    },
    {
      message: "from must be before or equal to to",
      path: ["to"]
    }
  );

export async function listAvailability(input?: {
  from?: string;
  to?: string;
}): Promise<TimeSlot[]> {
  const parsedResult = availabilityInputSchema.safeParse(input ?? {});

  if (!parsedResult.success) {
    throw new ValidationError(
      "Invalid availability query parameters",
      parsedResult.error.errors
    );
  }

  const now = new Date();
  const from = parsedResult.data.from
    ? new Date(parsedResult.data.from)
    : now;
  const to =
    parsedResult.data.to ??
    new Date(
      now.getTime() + config.availability.daysAhead * 24 * 60 * 60_000
    ).toISOString();

  const toDate = new Date(to);

  const client = await pool.connect();
  try {
    const allSlots = generateSlots(from, toDate);
    const booked = await appointmentRepository.getBookedSlotsInRange(
      client,
      from,
      toDate
    );

    const available = allSlots.filter((slot) => {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();

      return !booked.some((b) => {
        const bookedStart = new Date(b.slot_start).getTime();
        const bookedEnd = new Date(b.slot_end).getTime();
        return !(slotEnd <= bookedStart || slotStart >= bookedEnd);
      });
    });

    return available;
  } finally {
    client.release();
  }
}
