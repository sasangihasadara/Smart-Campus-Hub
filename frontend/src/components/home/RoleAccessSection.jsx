import { ArrowRight, ShieldCheck, Ticket, UserRound, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    title: "Student",
    tone: "from-blue-50 to-sky-50",
    icon: UserRound,
    path: "/login",
    description: "Search resources, make bookings, and raise support tickets.",
    bullets: ["My bookings", "Ticket submissions", "Resource browsing"],
  },
  {
    title: "Faculty / Staff",
    tone: "from-emerald-50 to-cyan-50",
    icon: ShieldCheck,
    path: "/login",
    description: "Use the same workspace with reporting access and booking oversight.",
    bullets: ["Reports access", "Bookings", "Profile management"],
  },
  {
    title: "Technician",
    tone: "from-amber-50 to-orange-50",
    icon: Wrench,
    path: "/technician-login",
    description: "Work assigned tickets, update resolution status, and keep operations moving.",
    bullets: ["Assigned tickets", "Status updates", "Repair workflow"],
  },
  {
    title: "Administrator",
    tone: "from-fuchsia-50 to-pink-50",
    icon: Ticket,
    path: "/admin-login",
    description: "Manage resources, approvals, tickets, and reports from one admin console.",
    bullets: ["Booking management", "Ticket control", "Campus reports"],
  },
];

export default function RoleAccessSection() {
  return (
    <section className="bg-white px-4 py-24 md:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Role-based access</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl font-heading">
              A clean entry path for every user
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
              The interface is split by role so each user sees only what they need. That keeps the project realistic, easier to demo, and easier to defend in a viva.
            </p>
          </div>

          <Link
            to="/resources"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Browse resources
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <div
                key={role.title}
                className={`rounded-[2rem] border border-slate-100 bg-gradient-to-br ${role.tone} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                  <Icon size={20} />
                </div>
                <div className="text-lg font-bold text-slate-950">{role.title}</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{role.description}</p>
                <ul className="mt-5 space-y-2 text-sm font-medium text-slate-700">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  to={role.path}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-blue-700"
                >
                  Open portal
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
