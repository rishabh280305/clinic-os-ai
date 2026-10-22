# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service health |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Manage a signed receptionist, doctor, or admin session |
| GET/POST/PATCH | `/api/appointments` | Role-scoped | List, book, cancel, reschedule, or record a no-show |
| GET | `/api/resources` | Any role | Doctors, synthetic patients, and waitlist |
| POST | `/api/waitlist` | Receptionist/admin | Add a validated waitlist request |
| GET/PATCH | `/api/queue` | Role-scoped | Read flow/audit or apply a permitted transition |
| GET/POST/PATCH | `/api/notes` | Doctor/admin read; doctor writes | Draft, provider-summarize, and approve notes |
| GET/POST | `/api/reminders` | Any read; receptionist/admin send | Delivery log and Resend-backed reminder attempt |
| GET | `/api/analytics` | Admin | Live operational metrics; `?format=csv` exports CSV |
| GET | `/api/cron/reminders` | Vercel cron | Queue deduplicated next-day in-app reminders |

Appointment creation accepts a doctor id, synthetic alias, future ISO start, and 10–240 minute duration. Queue actions are `check_in`, `start_consultation`, and `complete`.

Receptionists check patients in; doctors start and complete consultations; administrators can perform all queue actions. Note summarization returns HTTP 503 with `setupRequired` until `CLINIC_AI_ENDPOINT` and `CLINIC_AI_TOKEN` exist. Email attempts always write a `sent` or `failed` row.
