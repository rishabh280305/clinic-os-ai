import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";

const inputSchema = z.object({
  doctorId: z.string().trim().min(2).max(40),
  patientAlias: z.string().trim().min(2).max(40),
  startsAt: z.string().datetime({ offset: true }).refine((value) => new Date(value).getTime() > Date.now(), "Start must be in the future"),
  durationMinutes: z.coerce.number().int().min(10).max(240),
});

export async function GET() {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const items = await sql`SELECT id, doctor_id, patient_alias, starts_at, ends_at, status, queue_state FROM clinic_os.appointments WHERE user_id = ${userId} ORDER BY starts_at ASC`;
  return Response.json({ items, dataPolicy: "Synthetic patient aliases only." });
}

export async function POST(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Provide a doctor, synthetic patient alias, future start, and 10–240 minute duration." }, { status: 400 });
  const endsAt = new Date(new Date(parsed.data.startsAt).getTime() + parsed.data.durationMinutes * 60_000).toISOString();
  try {
    const sql = await database();
    const [item] = await sql`INSERT INTO clinic_os.appointments (user_id, doctor_id, patient_alias, starts_at, ends_at)
      VALUES (${userId}, ${parsed.data.doctorId}, ${parsed.data.patientAlias}, ${parsed.data.startsAt}, ${endsAt})
      RETURNING id, doctor_id, patient_alias, starts_at, ends_at, status, queue_state`;
    return Response.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
    if (code === "23P01") return Response.json({ error: "That doctor already has an overlapping appointment." }, { status: 409 });
    throw error;
  }
}
