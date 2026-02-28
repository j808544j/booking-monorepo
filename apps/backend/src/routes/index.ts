import type { Express } from "express";
import { healthRouter } from "./health";
import { availabilityRouter } from "./availability";
import { appointmentsRouter } from "./appointments";

export function mountRoutes(app: Express): void {
  app.use("/health", healthRouter);
  app.use("/api/availability", availabilityRouter);
  app.use("/api/appointments", appointmentsRouter);
}
