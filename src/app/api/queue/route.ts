import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoSession } from "@/lib/session";
import { transitionFor } from "@/lib/queue";
import { canUseQueue } from "@/lib/permissions";

const inputSchema = z.object({
  appointmentId: z.string().regex(/^\d+$/),
  action: z.enum(["check_in", "start_consultation", "complete"]),
});

export async function GET() {
  const session = await getDemoSession();
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const items = await sql`SELECT id, doctor_id, patient_alias, starts_at, ends_at, queue_state
    FROM clinic_os.appointments WHERE status = 'booked'
    ORDER BY starts_at ASC LIMIT 50`;
  const audit = await sql`SELECT e.id, e.appointment_id, e.event_type, e.from_state, e.to_state, e.created_at
    FROM clinic_os.audit_events e JOIN clinic_os.appointments a ON a.id = e.appointment_id
    ORDER BY e.created_at DESC LIMIT 30`;
  return Response.json({ items, audit, role:session.role, concurrency: "Each transition is a conditional update plus audit insert in one SQL statement." });
}

export async function PATCH(request: Request) {
  const session = await getDemoSession();
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Provide an appointment id and valid queue action." }, { status: 400 });
  if(!canUseQueue(session.role,parsed.data.action))return Response.json({error:"This queue action is outside your role permissions."},{status:403});
  const transition = transitionFor(parsed.data.action);
  const sql = await database();
  const [item] = await sql`WITH changed AS (
      UPDATE clinic_os.appointments SET queue_state = ${transition.to}
      WHERE id = ${parsed.data.appointmentId}::bigint AND queue_state = ${transition.from} AND status = 'booked'
      RETURNING id, doctor_id, patient_alias, starts_at, ends_at, queue_state
    ), audited AS (
      INSERT INTO clinic_os.audit_events (appointment_id, actor_user_id, event_type, from_state, to_state)
      SELECT id, ${session.userId}, ${transition.event}, ${transition.from}, ${transition.to} FROM changed
      RETURNING id AS audit_id, appointment_id
    )
    SELECT changed.*, audited.audit_id FROM changed JOIN audited ON audited.appointment_id = changed.id`;
  if (!item) return Response.json({ error: `Transition requires current state “${transition.from}”. Refresh and try again.` }, { status: 409 });
  return Response.json({ item });
}
