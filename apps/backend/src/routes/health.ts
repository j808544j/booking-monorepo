import { Router } from "express";
import { pool } from "../db";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ ok: true });
});

healthRouter.get("/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (_err) {
    res.status(503).json({ ok: false });
  }
});
