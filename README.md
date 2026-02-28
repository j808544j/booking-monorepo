## BigCircle Booking Monorepo

Minimal appointment booking system, built as a TypeScript monorepo with a React frontend, Express backend, and PostgreSQL, with Docker for local orchestration.

### Stack

- **Monorepo**: pnpm workspaces (`apps/frontend`, `apps/backend`)
- **Backend**: Node v22, Express, PostgreSQL (`pg`), Zod
- **Frontend**: Vite + React + TypeScript + Tailwind + shadcn-style UI components
- **Database**: PostgreSQL 17
- **Containerisation**: Docker + `docker-compose`

### Setup (local without Docker)

- **1. Prerequisites**
  - **Node**
  - **pnpm**
  - **PostgreSQL**: running locally (or use `docker-compose` `db` service only)

- **2. Install dependencies**

```bash
pnpm install
```

- **3. Configure environment**
  - Copy `.env.example` to `.env` at the repo root and adjust if needed (defaults assume local Postgres on `localhost:5432`).

- **4. Run database migrations**

```bash
cd apps/backend
pnpm migrate
```

- **5. Run backend and frontend**

From the repo root:

```bash
pnpm dev
```

This starts:

- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173`

Make sure `VITE_API_BASE` (in `.env`) points to `http://localhost:4000/api`.

### Running with Docker

- **1. Build and start all services**

```bash
docker compose up --build
```

Services:

- `db`: PostgreSQL on `localhost:5432`
- `backend`: API on `http://localhost:4000`
- `frontend`: SPA on `http://localhost:3000`

The backend container runs migrations automatically on startup before serving traffic.

### API Overview

- **Base URL**: `http://localhost:4000/api`

- **GET `/availability`**
  - Returns available time slots for the next 7 days.
  - Response: `[{ start: string, end: string }]`

- **POST `/appointments`**
  - Request body:
    - `slotStart` (ISO string)
    - `slotEnd` (ISO string)
    - `name` (string)
    - `email` (string, email)
    - `note` (optional string)
  - Response: created `Appointment` record.
  - Returns **409** if the slot is already booked (double-booking prevention).

- **POST `/appointments/:id/cancel`**
  - Idempotent: calling multiple times is safe and keeps state consistent.
  - Response: updated `Appointment`.

- **GET `/appointments`**
  - Lists all appointments ordered by `slot_start`.

### Data model overview

- **`appointments`**
  - `id SERIAL PRIMARY KEY`
  - `slot_start TIMESTAMPTZ`
  - `slot_end TIMESTAMPTZ`
  - `customer_name TEXT`
  - `customer_email TEXT`
  - `note TEXT NULL`
  - `status TEXT` (`'booked' | 'cancelled'`)
  - `created_at`, `updated_at` timestamps
  - **Constraints**:
    - `UNIQUE (slot_start, slot_end)` – prevents double booking of the same slot.
    - `slot_end > slot_start` – basic time sanity.
    - `status` check constraint.

- **`notifications`**
  - `id SERIAL PRIMARY KEY`
  - `appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE`
  - `status TEXT` (`'pending' | 'sent' | 'failed'`)
  - `error TEXT NULL`
  - `created_at`, `updated_at`, `sent_at` timestamps

### Key architectural decisions

- **Backend**
  - Layered structure:
    - `config.ts`: runtime configuration (ports, DB connection, availability window).
    - `db.ts`: PostgreSQL connection pool and transaction helper.
    - `models.ts`: TypeScript domain types.
    - `availability.ts`: deterministic slot generation and filtering based on booked appointments.
    - `services.ts`: core domain logic (booking, listing, cancelling, querying).
    - `notificationsWorker.ts`: background loop to simulate async confirmation delivery.
    - `index.ts`: Express app wiring, routing, and error handling.
  - **Invariants & integrity**:
    - Double booking prevented at the **DB layer** via `UNIQUE (slot_start, slot_end)` and handled in services with a specific `SlotAlreadyBookedError`.
    - Cancellation is **idempotent**: cancelling an already-cancelled appointment is a no-op that still returns success.
    - Availability is computed from a deterministic set of time slots minus overlapping `booked` appointments.

- **Notification flow**
  - On successful booking:
    - Within the same DB transaction, a `notifications` row is inserted with `status = 'pending'`.
  - A background worker:
    - Polls/Listen pending notifications every few seconds.
    - Marks them as `sent` and logs to stdout (simulating a real email/SMS integration).
    - Marks failures as `failed` with an error message.

- **Frontend**
  - Single-page React app using shadcn-style primitives:
    - `AvailabilityView`: shows 7-day availability grouped by day and lets the user select a slot.
    - `BookingPanel`: collects name/email/note for the selected slot and submits to the backend.
    - `AppointmentsList`: shows all appointments and allows cancellation.
  - API client in `src/api.ts` with strongly typed DTOs aligned with backend models.
  - Styling: Tailwind CSS with a minimal design system and shadcn-inspired components (`button`, `card`, `input`, `textarea`, `label`).

### Trade-offs

- **Monorepo with pnpm**
  - Chosen for easy shared tooling and consistent TypeScript configuration across frontend and backend.
  - Keeps dependencies isolated per app while allowing workspace-level commands.

- **Data integrity & concurrency**
  - **PostgreSQL constraints** (unique index, check constraints) to enforce critical invariants.
  - Application logic interprets database errors (e.g. unique violation) into domain-specific errors (409 on double booking).
  - All state-changing operations (book, cancel) run in DB transactions.

- **Async notifications**
  - Simulated via a graphile worker which listen/poll Db for new jobs

### Known limitations

### What I would improve with more time

- I would have done Test Driven Development, so that AI has better context and specific requirements.
- Testing and observability tools (end-to-end tests, more unit coverage, metrics and structured logs).
- Use Turborepo.

### AI usage & validation

- AI assistance was used for implementing my HLD subtasks creating basic docker files/linters config etc.
- Outputs were validated by:
  - Manually review.
  - Running TypeScript checks, linters.
  - Exercising the main booking, listing, and cancellation flows end-to-end to ensure invariants are upheld.
