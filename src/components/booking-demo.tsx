"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Appointment = { id: string; doctor_id: string; patient_alias: string; starts_at: string; ends_at: string; status: string };

export function BookingDemo() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [doctorId, setDoctorId] = useState("dr-mehta");
  const [patientAlias, setPatientAlias] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/appointments", { cache: "no-store" });
    if (response.status === 401) return setAuthenticated(false);
    if (!response.ok) throw new Error("Could not load bookings.");
    const data = await response.json(); setItems(data.items); setAuthenticated(true);
  }, []);
  useEffect(() => {
    const task = window.setTimeout(() => { void load().catch(() => { setAuthenticated(false); setMessage("The scheduling workspace is temporarily unavailable."); }); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function enterWorkspace() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (response.ok) await load(); else setMessage("Demo sign-in is unavailable.");
    setBusy(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const iso = startsAt ? new Date(startsAt).toISOString() : "";
    const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorId, patientAlias, startsAt: iso, durationMinutes }) });
    const data = await response.json();
    if (response.ok) { setPatientAlias(""); setStartsAt(""); setMessage("Appointment booked. Try the same overlapping slot to test the database guard."); await load(); }
    else setMessage(data.error ?? "Could not create the booking.");
    setBusy(false);
  }

  return <section className="mx-auto max-w-7xl px-6 pb-24" aria-labelledby="booking-demo-title"><div className="rounded-3xl border border-[#e5e5ee] bg-white p-6 shadow-[0_30px_80px_rgba(47,45,90,.1)] md:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ececf2] pb-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#635bff]">DATABASE-GUARDED WORKFLOW</p><h2 id="booking-demo-title" className="mt-2 text-3xl font-bold">Book without collisions</h2></div><span className="rounded-xl bg-[#edfbf6] px-3 py-2 text-xs font-semibold text-[#0f8564]">Postgres overlap constraint active</span></div>
    {authenticated===null ? <p className="py-10 text-[#686b7b]">Opening the scheduler…</p> : !authenticated ? <div className="py-10"><p className="max-w-xl leading-7 text-[#686b7b]">Use a signed demo session to create synthetic bookings. Overlapping appointments for the same doctor are rejected atomically by the database.</p><button onClick={enterWorkspace} disabled={busy} className="mt-5 rounded-xl bg-[#171923] px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "OPENING…" : "ENTER DEMO CLINIC"}</button></div> : <div className="grid gap-8 pt-6 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Doctor<select value={doctorId} onChange={e=>setDoctorId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d7d7e1] bg-[#f7f7fb] px-4 py-3"><option value="dr-mehta">Dr. Mehta</option><option value="dr-rao">Dr. Rao</option></select></label><label className="block text-sm font-semibold">Synthetic patient alias<input required minLength={2} maxLength={40} value={patientAlias} onChange={e=>setPatientAlias(e.target.value)} placeholder="Patient B-207" className="mt-2 w-full rounded-xl border border-[#d7d7e1] bg-[#f7f7fb] px-4 py-3 outline-none focus:border-[#635bff]" /></label><div className="grid grid-cols-[1fr_110px] gap-3"><label className="block text-sm font-semibold">Future start<input required type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d7d7e1] bg-[#f7f7fb] px-4 py-3" /></label><label className="block text-sm font-semibold">Minutes<input type="number" min={10} max={240} value={durationMinutes} onChange={e=>setDurationMinutes(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[#d7d7e1] bg-[#f7f7fb] px-4 py-3" /></label></div><button disabled={busy} className="rounded-xl bg-[#171923] px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "BOOKING…" : "BOOK APPOINTMENT"}</button>{message&&<p role="status" className={`text-sm ${message.includes("overlapping") ? "text-red-600" : "text-[#544bd8]"}`}>{message}</p>}</form>
      <div><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8b8d99]">Persisted schedule</p>{items.length===0 ? <p className="rounded-2xl border border-dashed border-[#d7d7e1] p-5 text-[#8b8d99]">No demo appointments yet.</p> : <div className="space-y-3">{items.map(item=><article key={item.id} className="rounded-2xl bg-[#f7f7fb] p-4"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{item.patient_alias}</h3><span className="rounded-lg bg-white px-3 py-1 text-xs capitalize text-[#0f8564]">{item.status}</span></div><p className="mt-2 text-sm text-[#686b7b]">{item.doctor_id.replace("dr-","Dr. ")} · {new Date(item.starts_at).toLocaleString()}–{new Date(item.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></article>)}</div>}</div>
    </div>}
    {!authenticated&&message&&<p role="status" className="pb-5 text-sm text-red-600">{message}</p>}
  </div></section>;
}
