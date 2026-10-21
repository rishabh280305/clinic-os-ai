CREATE SCHEMA IF NOT EXISTS clinic_os;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE IF NOT EXISTS clinic_os.appointments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  doctor_id text NOT NULL,
  patient_alias text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
DO $block$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinic_appointments_no_overlap') THEN
    ALTER TABLE clinic_os.appointments ADD CONSTRAINT clinic_appointments_no_overlap
    EXCLUDE USING gist (doctor_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
    WHERE (status = 'booked');
  END IF;
END $block$;
