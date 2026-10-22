import { BookingDemo } from "@/components/booking-demo";
import { QueueDemo } from "@/components/queue-demo";
import { ClinicOperations } from "@/components/clinic-operations";
import { ScheduleResources } from "@/components/schedule-resources";

const agenda = [["09:00","New patient","Confirmed"],["09:30","Follow-up","In clinic"],["10:15","Consultation","Scheduled"]];
export default function Home() {
  return <main className="min-h-screen bg-[#f7f7fb] text-[#171923]">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#635bff] font-bold text-white">C</span><span className="text-xl font-bold">Clinic OS</span></div><span className="text-xs font-semibold uppercase tracking-widest text-[#544bd8]">Verified operations demo</span></nav>
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[.9fr_1.1fr] lg:pt-24"><div><span className="rounded-full bg-[#e8e6ff] px-4 py-2 text-sm font-semibold text-[#544bd8]">Operations, thoughtfully simplified</span><h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-[-.045em] md:text-7xl">A calmer clinic starts here.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#686b7b]">Scheduling, queues, consultation workflows and honest operational analytics in one focused workspace for small clinics.</p><a href="/api/health" className="mt-9 inline-flex rounded-xl bg-[#171923] px-6 py-3 font-semibold text-white">View system status</a></div>
      <div className="rounded-3xl border border-[#e5e5ee] bg-white p-5 shadow-[0_30px_80px_rgba(47,45,90,.12)]"><div className="flex items-center justify-between border-b border-[#ececf2] pb-5"><div><p className="text-sm text-[#8b8d99]">Tuesday schedule</p><h2 className="mt-1 text-xl font-bold">Dr. Mehta’s clinic</h2></div><div className="rounded-xl bg-[#edfbf6] px-3 py-2 text-xs font-semibold text-[#0f8564]">On time</div></div><div className="divide-y divide-[#eeeef4]">{agenda.map(([time,type,status],i)=><div className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-5" key={time}><span className="font-mono text-sm text-[#7b7e8c]">{time}</span><div><p className="font-semibold">{type}</p><p className="text-sm text-[#9a9ca8]">Synthetic patient {i+1}</p></div><span className="rounded-lg bg-[#f3f3f8] px-3 py-2 text-xs">{status}</span></div>)}</div><div className="mt-2 grid grid-cols-3 gap-3">{[["06","Today"],["12m","Avg wait"],["94%","Utilization"]].map(x=><div key={x[1]} className="rounded-xl bg-[#f7f7fb] p-3 text-center"><p className="font-bold">{x[0]}</p><p className="text-xs text-[#8b8d99]">{x[1]}</p></div>)}</div></div>
    </section>
    <BookingDemo />
    <QueueDemo />
    <ClinicOperations />
    <ScheduleResources />
  </main>;
}
