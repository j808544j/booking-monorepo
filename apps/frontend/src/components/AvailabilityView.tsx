import { useEffect, useMemo, useState } from "react";
import { TimeSlot } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface AvailabilityViewProps {
  slots: TimeSlot[];
  loading: boolean;
  onSelectSlot: (slot: TimeSlot) => void;
  onRefresh: () => void;
}

export function AvailabilityView({
  slots,
  loading,
  onSelectSlot,
  onRefresh
}: AvailabilityViewProps) {
  const grouped = useMemo(() => {
    const byDay = new Map<string, TimeSlot[]>();
    for (const slot of slots) {
      const date = new Date(slot.start);
      const key = date.toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(slot);
    }
    return Array.from(byDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [slots]);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Availability (next 7 days)</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading slots…</p>}
        {!loading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No available slots.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map(([day, daySlots]) => (
            <div key={day} className="space-y-2">
              <div className="text-sm font-medium">
                {new Date(day).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <Button
                    key={slot.start}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectSlot(slot)}
                  >
                    {new Date(slot.start).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

