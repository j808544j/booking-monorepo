ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_slot_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_slot_unique_booked
  ON appointments (slot_start, slot_end)
  WHERE (status = 'booked');
