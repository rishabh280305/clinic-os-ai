# Clinic OS AI

Clinic OS is a small-clinic operations portfolio product focused on reliable scheduling and visit flow. All displayed patient identities are synthetic.

## Verified capabilities

- Authenticated persistent appointment booking
- Postgres exclusion constraint that rejects overlapping doctor slots with HTTP 409
- Forward-only scheduled → waiting → in-consultation → completed queue state machine
- Conditional transitions and append-only audit inserts in one SQL statement
- Signed receptionist, doctor, and administrator roles with server-tested permission boundaries
- Persistent synthetic patient directory, seeded doctor resources, cancellation, rescheduling, no-shows, and waitlist
- Database-backed consultation types, doctor weekly availability, and searchable synthetic patient history
- Doctor-authored consultation note drafts, provider-backed redacted summarization when configured, and explicit human approval
- In-app notification records, Resend email delivery with honest sent/failed status when configured, and a daily reminder job
- Administrator analytics computed from application rows, average waiting-time events, utilization, and CSV export
- Unit-tested transition policy, cloud CI, and production Playwright booking/check-in flow

Billing is outside this clinic-operations portfolio scope. AI and email provider calls stay disabled with visible setup-required responses until their credentials are configured; no template is relabeled as AI output.

Commands: `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed`. See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md).
