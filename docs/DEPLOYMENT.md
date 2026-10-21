# Deployment

Vercel needs managed `DATABASE_URL` and secret `AUTH_SECRET` values. Neon must permit `btree_gist`, which is enabled idempotently before the overlap constraint is created. `AI_PROVIDER_API_KEY` and `RESEND_API_KEY` remain unset; their features are not represented as working.

Cloud CI runs lint, unit tests, type checking, and the production build. The manual **Production E2E** workflow books a synthetic patient, refreshes the queue, and records a check-in against the stable deployment.
