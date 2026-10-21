# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service health |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Manage demo session |
| GET/POST | `/api/appointments` | Demo session | List or create synthetic bookings |
| GET | `/api/queue` | Demo session | Return bookings and recent audit events |
| PATCH | `/api/queue` | Demo session | Apply one valid queue transition |

Appointment creation accepts a doctor id, synthetic alias, future ISO start, and 10–240 minute duration. Queue actions are `check_in`, `start_consultation`, and `complete`.
