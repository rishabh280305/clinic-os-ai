# Clinic OS AI

Clinic OS is a small-clinic operations portfolio product focused on reliable scheduling and visit flow. All displayed patient identities are synthetic.

## Verified capabilities

- Authenticated persistent appointment booking
- Postgres exclusion constraint that rejects overlapping doctor slots with HTTP 409
- Forward-only scheduled → waiting → in-consultation → completed queue state machine
- Conditional transitions and append-only audit inserts in one SQL statement
- Unit-tested transition policy, cloud CI, and production Playwright booking/check-in flow

Role-specific accounts, consultation notes, AI summarization, reminders, billing, and calculated operations dashboards remain future scope. No AI output is fabricated.

Commands: `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed`. See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md).
