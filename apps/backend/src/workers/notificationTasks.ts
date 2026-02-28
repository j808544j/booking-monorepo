import { pool } from "../db";
import * as notificationRepository from "../repositories/notificationRepository";
import { logger } from "../logger";

export async function sendNotificationTask(payload: unknown): Promise<void> {
  const { appointmentId } = payload as { appointmentId: number };
  const client = await pool.connect();

  try {
    logger.info("Notification sent", { appointmentId });
    await notificationRepository.markSentByAppointmentId(client, appointmentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Notification send failed", {
      appointmentId,
      errorMessage: message
    });
    await notificationRepository.markFailedByAppointmentId(
      client,
      appointmentId,
      message
    );
    throw err;
  } finally {
    client.release();
  }
}

