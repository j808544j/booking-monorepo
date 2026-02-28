import { useEffect, useState } from "react";
import { Appointment, TimeSlot, createAppointment } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface BookingPanelProps {
  selectedSlot: TimeSlot | null;
  onBooked: (appointment: Appointment) => void;
}

export function BookingPanel({ selectedSlot, onBooked }: BookingPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [selectedSlot]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const appointment = await createAppointment({
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        name,
        email,
        note: note || undefined
      });
      onBooked(appointment);
      setName("");
      setEmail("");
      setNote("");
    } catch (err: any) {
      setError(err.message ?? "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {selectedSlot
            ? `Book ${
                new Date(selectedSlot.start).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }`
            : "Select a time slot"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!selectedSlot || submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!selectedSlot || submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!selectedSlot || submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedSlot || submitting}
          >
            {submitting ? "Booking..." : "Book appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

