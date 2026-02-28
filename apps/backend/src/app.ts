import express from "express";
import cors from "cors";
import { mountRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config";

const app = express();

const allowedOrigins = config.cors.allowedOrigins;

if (allowedOrigins.includes("*")) {
  app.use(cors());
} else if (allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      }
    })
  );
} else {
  app.use(
    cors({
      origin: false
    })
  );
}

app.use(express.json());

mountRoutes(app);

app.use(errorHandler);

export { app };
