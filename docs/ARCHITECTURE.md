# Architecture

The Next.js application uses a signed demo session, Zod-validated route handlers, and Neon Postgres schema `clinic_os`. A GiST exclusion constraint over doctor id and half-open timestamp ranges is the final concurrency boundary for bookings; application prechecks are not trusted.

Queue transitions are a small explicit state machine. Each API mutation conditionally updates only the expected prior state and inserts its audit event through one data-modifying CTE, so concurrent or repeated actions return HTTP 409 instead of skipping states or duplicating audit history.

The signed session includes a fixed synthetic role. Shared permission functions are unit tested, while each mutation checks the role again inside its route. Schedule cancellation and rescheduling preserve the database exclusion constraint as the concurrency boundary. Patients, doctors, waitlist rows, note drafts, and notification attempts are durable Postgres records.

Consultation types and doctors are seeded idempotently as domain tables. Weekly availability is persisted per doctor/day and can only be changed by scheduling roles. Patient-history search uses a parameterized alias query and returns only synthetic operational records.

Provider summarization receives only a locally redacted note through a configurable HTTPS endpoint, stores the response as unapproved, and requires a separate doctor approval action. Resend email uses an idempotency key and never includes the patient alias. Operational analytics aggregate the live tables rather than static cards; waiting time is derived from recorded check-in and consultation-start audit timestamps.
