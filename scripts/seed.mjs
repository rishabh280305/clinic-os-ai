const baseUrl = process.env.BASE_URL ?? "https://clinic-os-ai-xi.vercel.app";
const auth = await fetch(`${baseUrl}/api/auth/demo`, { method: "POST" });
if (!auth.ok) throw new Error(`Demo authentication failed: HTTP ${auth.status}`);
const cookie = auth.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Demo session cookie was not returned");
const current = await fetch(`${baseUrl}/api/appointments`, { headers: { Cookie: cookie } }).then(response => response.json());
if (!current.items?.some(item => item.patient_alias === "Synthetic Seed C-001")) {
  const startsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const response = await fetch(`${baseUrl}/api/appointments`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ doctorId: "dr-seed", patientAlias: "Synthetic Seed C-001", startsAt, durationMinutes: 30 }) });
  if (!response.ok) throw new Error(`Seed failed: HTTP ${response.status} ${await response.text()}`);
}
console.log("Verified the synthetic clinic appointment seed through the authenticated API.");
