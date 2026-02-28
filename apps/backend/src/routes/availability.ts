import { Router } from "express";
import * as availabilityService from "../services/availabilityService";

export const availabilityRouter = Router();

availabilityRouter.get("/", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const slots = await availabilityService.listAvailability({
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});
