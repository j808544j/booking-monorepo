import type { Pool, PoolClient } from "pg";
import type { Appointment } from "../models";

export interface InsertAppointmentRow {
  slot_start: string;
  slot_end: string;
  customer_name: string;
  customer_email: string;
  note: string | null;
  status: "booked";
}

export function insert(
  client: PoolClient,
  row: InsertAppointmentRow
): Promise<Appointment> {
  return client
    .query<Appointment>(
      `
      INSERT INTO appointments
        (slot_start, slot_end, customer_name, customer_email, note, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        row.slot_start,
        row.slot_end,
        row.customer_name,
        row.customer_email,
        row.note,
        row.status
      ]
    )
    .then((res) => res.rows[0]);
}

export function findById(
  client: Pool | PoolClient,
  id: number,
  forUpdate = false
): Promise<Appointment | null> {
  const sql = forUpdate
    ? "SELECT * FROM appointments WHERE id = $1 FOR UPDATE"
    : "SELECT * FROM appointments WHERE id = $1";
  return client.query<Appointment>(sql, [id]).then((res) => res.rows[0] ?? null);
}

export function updateStatus(
  client: PoolClient,
  id: number,
  status: "cancelled"
): Promise<Appointment> {
  return client
    .query<Appointment>(
      `
      UPDATE appointments
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [id, status]
    )
    .then((res) => res.rows[0]);
}

export function list(client: Pool | PoolClient): Promise<Appointment[]> {
  return client
    .query<Appointment>(
      "SELECT * FROM appointments ORDER BY slot_start ASC"
    )
    .then((res) => res.rows);
}

export interface BookedSlotRow {
  slot_start: string;
  slot_end: string;
}

export function getBookedSlotsInRange(
  client: Pool | PoolClient,
  from: Date,
  to: Date
): Promise<BookedSlotRow[]> {
  return client
    .query<BookedSlotRow>(
      `
      SELECT slot_start, slot_end
      FROM appointments
      WHERE status = 'booked'
        AND slot_start >= $1
        AND slot_end <= $2
    `,
      [from.toISOString(), to.toISOString()]
    )
    .then((res) => res.rows);
}
