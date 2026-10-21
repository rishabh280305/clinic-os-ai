ALTER TABLE clinic_os.appointments
  ADD COLUMN IF NOT EXISTS queue_state text NOT NULL DEFAULT 'scheduled'
  CHECK (queue_state IN ('scheduled', 'waiting', 'in_consultation', 'completed'));

CREATE TABLE IF NOT EXISTS clinic_os.audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id bigint NOT NULL REFERENCES clinic_os.appointments(id) ON DELETE CASCADE,
  actor_user_id text NOT NULL,
  event_type text NOT NULL,
  from_state text NOT NULL,
  to_state text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
