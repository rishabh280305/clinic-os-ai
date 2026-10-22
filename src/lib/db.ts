import "server-only";
import { neon } from "@neondatabase/serverless";

function client() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

let initialized: Promise<void> | null = null;
export async function database() {
  const sql = client();
  initialized ??= (async () => {
    await sql`CREATE SCHEMA IF NOT EXISTS clinic_os`;
    await sql`CREATE EXTENSION IF NOT EXISTS btree_gist`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.appointments (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id text NOT NULL,
      doctor_id text NOT NULL,
      patient_alias text NOT NULL,
      starts_at timestamptz NOT NULL,
      ends_at timestamptz NOT NULL,
      status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed')),
      created_at timestamptz NOT NULL DEFAULT now(),
      CHECK (ends_at > starts_at)
    )`;
    await sql`DO $block$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinic_appointments_no_overlap') THEN
        ALTER TABLE clinic_os.appointments ADD CONSTRAINT clinic_appointments_no_overlap
        EXCLUDE USING gist (doctor_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
        WHERE (status = 'booked');
      END IF;
    END $block$`;
    await sql`ALTER TABLE clinic_os.appointments
      ADD COLUMN IF NOT EXISTS queue_state text NOT NULL DEFAULT 'scheduled'
      CHECK (queue_state IN ('scheduled', 'waiting', 'in_consultation', 'completed'))`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.audit_events (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      appointment_id bigint NOT NULL REFERENCES clinic_os.appointments(id) ON DELETE CASCADE,
      actor_user_id text NOT NULL,
      event_type text NOT NULL,
      from_state text NOT NULL,
      to_state text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE clinic_os.appointments ADD COLUMN IF NOT EXISTS consultation_type text NOT NULL DEFAULT 'general'`;
    await sql`ALTER TABLE clinic_os.appointments ADD COLUMN IF NOT EXISTS no_show boolean NOT NULL DEFAULT false`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.doctors (id text PRIMARY KEY, display_name text NOT NULL, specialty text NOT NULL, active boolean NOT NULL DEFAULT true)`;
    await sql`INSERT INTO clinic_os.doctors(id,display_name,specialty) VALUES ('dr-mehta','Dr. Mehta','General medicine'),('dr-rao','Dr. Rao','Family medicine') ON CONFLICT(id) DO NOTHING`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.consultation_types (id text PRIMARY KEY, display_name text NOT NULL, duration_minutes integer NOT NULL CHECK(duration_minutes BETWEEN 10 AND 240), active boolean NOT NULL DEFAULT true)`;
    await sql`INSERT INTO clinic_os.consultation_types(id,display_name,duration_minutes) VALUES('general','General consultation',30),('follow-up','Follow-up',20),('extended','Extended consultation',60) ON CONFLICT(id)DO NOTHING`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.doctor_availability (doctor_id text NOT NULL REFERENCES clinic_os.doctors(id),day_of_week integer NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),starts_at time NOT NULL,ends_at time NOT NULL,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(doctor_id,day_of_week),CHECK(ends_at>starts_at))`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.patients (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, alias text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.waitlist (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, patient_alias text NOT NULL, doctor_id text NOT NULL REFERENCES clinic_os.doctors(id), preferred_date date NOT NULL, status text NOT NULL DEFAULT 'waiting' CHECK(status IN('waiting','offered','booked','cancelled')), created_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.consultation_notes (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, appointment_id bigint NOT NULL REFERENCES clinic_os.appointments(id), author_id text NOT NULL, draft text NOT NULL, summary text, summary_mode text NOT NULL DEFAULT 'manual', approved_at timestamptz, follow_up_on date, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS clinic_os.notifications (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, appointment_id bigint REFERENCES clinic_os.appointments(id), channel text NOT NULL CHECK(channel IN('in_app','email')), recipient text NOT NULL, message text NOT NULL, status text NOT NULL DEFAULT 'queued' CHECK(status IN('queued','sent','failed')), provider_id text, error text, created_at timestamptz NOT NULL DEFAULT now())`;
  })();
  await initialized;
  return sql;
}
