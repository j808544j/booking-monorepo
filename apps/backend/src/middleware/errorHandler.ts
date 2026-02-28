import type { ErrorRequestHandler } from "express";
import {
  SlotAlreadyBookedError,
  NotFoundError,
  ConflictError,
  ValidationError,
  AppError
} from "../errors";
import { ZodError } from "zod";
import { logger } from "../logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error("Unhandled error", {
    errorName: err?.name,
    errorMessage: err instanceof Error ? err.message : String(err)
  });

  if (err instanceof SlotAlreadyBookedError) {
    res.status(409).json({ error: "Slot already booked" });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({
      error: "Invalid input",
      details: err.details
    });
    return;
  }

  if (err.name === "ZodError") {
    const zodErr = err as ZodError;
    res.status(400).json({
      error: "Invalid input",
      details: zodErr.errors
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details !== undefined && { details: err.details })
    });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};
