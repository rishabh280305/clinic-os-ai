import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";
import { transitionFor } from "@/lib/queue";

const inputSchema = z.object({
  appointmentId: z.string().regex(/^\d+$/),
  action: z.enum(["check_in", "start_consultation", "complete"]),
});

export async function GET() {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const items = await sql`SELECT id, doctor_id, patient_alias, starts_at, ends_at, queue_state
    FROM clinic_os.appointments WHERE user_id = ${userId} AND status = 'booked'
    ORDER BY starts_at ASC LIMIT 50`;
  const audit = await sql`SELECT e.id, e.appointment_id, e.event_type, e.from_state, e.to_state, e.created_at
    FROM clinic_os.audit_events e JOIN clinic_os.appointments a ON a.id = e.appointment_id
    WHERE a.user_id = ${userId} ORDER BY e.created_at DESC LIMIT 30`;
  return Response.json({ items, audit, concurrency: "Each transition is a conditional update plus audit insert in one SQL statement." });
}

export async function PATCH(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Provide an appointment id and valid queue action." }, { status: 400 });
  const transition = transitionFor(parsed.data.action);
  const sql = await database();
  const [item] = await sql`WITH changed AS (
      UPDATE clinic_os.appointments SET queue_state = ${transition.to}
      WHERE id = ${parsed.data.appointmentId}::bigint AND user_id = ${userId} AND queue_state = ${transition.from} AND status = 'booked'
      RETURNING id, doctor_id, patient_alias, starts_at, ends_at, queue_state
    ), audited AS (
      INSERT INTO clinic_os.audit_events (appointment_id, actor_user_id, event_type, from_state, to_state)
      SELECT id, ${userId}, ${transition.event}, ${transition.from}, ${transition.to} FROM changed
      RETURNING id AS audit_id, appointment_id
    )
    SELECT changed.*, audited.audit_id FROM changed JOIN audited ON audited.appointment_id = changed.id`;
  if (!item) return Response.json({ error: `Transition requires current state “${transition.from}”. Refresh and try again.` }, { status: 409 });
  return Response.json({ item });
}
