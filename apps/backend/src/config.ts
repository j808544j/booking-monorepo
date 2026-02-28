import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config();
dotenv.config({
  path: path.resolve(process.cwd(), '../.env'),
});

const configSchema = z.object({
  port: z.coerce.number().default(4000),
  databaseUrl: z.string().url(),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  corsOrigins: z.string().optional(),
  availability: z.object({
    daysAhead: z.number().default(7),
    slotMinutes: z.number().default(30),
    workdayStartHour: z.number().default(9),
    workdayEndHour: z.number().default(17),
  }),
});

const parsed = configSchema.parse({
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV,
  corsOrigins: process.env.CORS_ORIGINS,
  availability: {
    daysAhead: 7,
    slotMinutes: 30,
    workdayStartHour: 9,
    workdayEndHour: 17,
  },
});

const parsedCorsOrigins = parsed.corsOrigins
  ? parsed.corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  : [];

export const config = {
  port: parsed.port,
  databaseUrl: parsed.databaseUrl,
  nodeEnv: parsed.nodeEnv,
  cors: {
    allowedOrigins:
      parsedCorsOrigins.length > 0
        ? parsedCorsOrigins
        : parsed.nodeEnv === 'development'
          ? ['*']
          : [],
  },
  availability: parsed.availability,
} as const;
