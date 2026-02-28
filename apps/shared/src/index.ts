export type IsoDateTimeString = string;

export type AppointmentStatus = "booked" | "cancelled";

export interface Appointment {
  id: number;
  slot_start: IsoDateTimeString;
  slot_end: IsoDateTimeString;
  customer_name: string;
  customer_email: string;
  note: string | null;
  status: AppointmentStatus;
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
}

export interface Notification {
  id: number;
  appointment_id: number;
  status: "pending" | "sent" | "failed";
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
  sent_at: IsoDateTimeString | null;
  error: string | null;
}

export interface TimeSlot {
  start: IsoDateTimeString;
  end: IsoDateTimeString;
}

export interface CreateAppointmentPayload {
  slotStart: IsoDateTimeString;
  slotEnd: IsoDateTimeString;
  name: string;
  email: string;
  note?: string;
}

