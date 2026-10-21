export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ service: "clinic-os-ai", status: "ok", stage: "development", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
