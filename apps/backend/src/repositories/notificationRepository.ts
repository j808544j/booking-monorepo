import type { PoolClient } from "pg";

export function createForAppointment(
  client: PoolClient,
  appointmentId: number
): Promise<void> {
  return client
    .query(
      `
      INSERT INTO notifications (appointment_id, status)
      VALUES ($1, 'pending')
    `,
      [appointmentId]
    )
    .then(() => undefined);
}

export interface PendingNotificationRow {
  id: number;
  appointment_id: number;
}

export function findPending(
  client: PoolClient,
  limit: number
): Promise<PendingNotificationRow[]> {
  return client
    .query<PendingNotificationRow>(
      `
      SELECT id, appointment_id
      FROM notifications
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1
    `,
      [limit]
    )
    .then((res) => res.rows);
}

export function markSent(client: PoolClient, id: number): Promise<void> {
  return client
    .query(
      `
      UPDATE notifications
      SET status = 'sent', sent_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'pending'
    `,
      [id]
    )
    .then(() => undefined);
}

export function markFailed(
  client: PoolClient,
  id: number,
  error: string
): Promise<void> {
  return client
    .query(
      `
      UPDATE notifications
      SET status = 'failed', error = $2, updated_at = NOW()
      WHERE id = $1
    `,
      [id, error]
    )
    .then(() => undefined);
}

export function markSentByAppointmentId(
  client: PoolClient,
  appointmentId: number
): Promise<void> {
  return client
    .query(
      `
      UPDATE notifications
      SET status = 'sent', sent_at = NOW(), updated_at = NOW()
      WHERE appointment_id = $1 AND status = 'pending'
    `,
      [appointmentId]
    )
    .then(() => undefined);
}

export function markFailedByAppointmentId(
  client: PoolClient,
  appointmentId: number,
  error: string
): Promise<void> {
  return client
    .query(
      `
      UPDATE notifications
      SET status = 'failed', error = $2, updated_at = NOW()
      WHERE appointment_id = $1
    `,
      [appointmentId, error]
    )
    .then(() => undefined);
}
