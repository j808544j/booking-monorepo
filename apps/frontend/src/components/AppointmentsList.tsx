import { Appointment, cancelAppointment } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

interface AppointmentsListProps {
  appointments: Appointment[];
  onChange: () => void;
}

export function AppointmentsList({
  appointments,
  onChange
}: AppointmentsListProps) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleCancel(id: number) {
    setBusyId(id);
    try {
      await cancelAppointment(id);
      onChange();
    } catch (err) {
      console.error("Failed to cancel appointment", err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">No appointments yet.</p>
        )}
        <ul className="space-y-2">
          {appointments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="space-y-1">
                <div className="font-medium">
                  {new Date(a.slot_start).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.customer_name} — {a.customer_email}
                </div>
                <div className="text-xs uppercase tracking-wide">
                  Status:{" "}
                  <span
                    className={
                      a.status === "booked"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {a.status}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={a.status === "cancelled" || busyId === a.id}
                onClick={() => handleCancel(a.id)}
              >
                {a.status === "cancelled"
                  ? "Cancelled"
                  : busyId === a.id
                  ? "Cancelling..."
                  : "Cancel"}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

