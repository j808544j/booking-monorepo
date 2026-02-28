import { useCallback, useEffect, useState } from "react";
import {
  Appointment,
  TimeSlot,
  fetchAppointments,
  fetchAvailability
} from "@/api";
import { AvailabilityView } from "@/components/AvailabilityView";
import { BookingPanel } from "@/components/BookingPanel";
import { AppointmentsList } from "@/components/AppointmentsList";

function App() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadAvailability = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const data = await fetchAvailability();
      setSlots(data);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } finally {
    }
  }, []);

  const refreshAll = useCallback(() => {
    void loadAvailability();
    void loadAppointments();
  }, [loadAvailability, loadAppointments]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">BigCircle Booking</h1>
            <p className="text-sm text-muted-foreground">
              Minimal appointment booking system demo.
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row">
        <AvailabilityView
          slots={slots}
          loading={loadingSlots}
          onSelectSlot={setSelectedSlot}
          onRefresh={loadAvailability}
        />
        <div className="flex w-full flex-col gap-4 md:max-w-md">
          <BookingPanel
            selectedSlot={selectedSlot}
            onBooked={refreshAll}
          />
          <AppointmentsList
            appointments={appointments}
            onChange={refreshAll}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

