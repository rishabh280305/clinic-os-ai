# Architecture

The Next.js application uses a signed demo session, Zod-validated route handlers, and Neon Postgres schema `clinic_os`. A GiST exclusion constraint over doctor id and half-open timestamp ranges is the final concurrency boundary for bookings; application prechecks are not trusted.

Queue transitions are a small explicit state machine. Each API mutation conditionally updates only the expected prior state and inserts its audit event through one data-modifying CTE, so concurrent or repeated actions return HTTP 409 instead of skipping states or duplicating audit history.
