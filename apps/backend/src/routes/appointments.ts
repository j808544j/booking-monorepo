import { Router } from "express";
import { z } from "zod";
import * as appointmentService from "../services/appointmentService";
import { ValidationError } from "../errors";

export const appointmentsRouter = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

function parseIdParam(rawId: string): number {
  const result = idParamSchema.safeParse({ id: rawId });

  if (!result.success) {
    throw new ValidationError("Invalid id parameter", result.error.errors);
  }

  return result.data.id;
}

appointmentsRouter.get("/", async (_req, res, next) => {
  try {
    const appointments = await appointmentService.listAppointments();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const appointment = await appointmentService.getAppointment(id);
    if (!appointment) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.post("/", async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.post("/:id/cancel", async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const appointment = await appointmentService.cancelAppointment(id);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});
