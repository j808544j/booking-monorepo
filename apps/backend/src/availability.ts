import { config } from "./config";
import type { TimeSlot } from "./models";

function toIso(date: Date): string {
  return date.toISOString();
}

export function generateSlots(from: Date, to: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { slotMinutes, workdayStartHour, workdayEndHour } = config.availability;

  const cursor = new Date(from);
  cursor.setSeconds(0, 0);

  while (cursor < to) {
    const dayStart = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate(),
      workdayStartHour,
      0,
      0,
      0
    );
    const dayEnd = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate(),
      workdayEndHour,
      0,
      0,
      0
    );

    let slotStart = new Date(dayStart);
    while (slotStart < dayEnd) {
      const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60_000);
      if (slotStart >= from && slotEnd <= to) {
        slots.push({
          start: toIso(slotStart),
          end: toIso(slotEnd)
        });
      }
      slotStart = new Date(slotStart.getTime() + slotMinutes * 60_000);
    }

    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }

  return slots;
}
