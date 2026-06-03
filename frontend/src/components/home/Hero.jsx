import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpen, Sparkles, Ticket, Wrench } from "lucide-react";
import SearchBar from "../common/SearchBar";

const metrics = [
  { value: "4", label: "Role-specific portals" },
  { value: "24/7", label: "Campus operations visibility" },
  { value: "1", label: "Unified workspace" },
];

const highlights = [
  {
    icon: BookOpen,
    title: "Bookings",
    copy: "Reserve labs, halls, and assets with a cleaner approval flow.",
  },
  {
    icon: Ticket,
    title: "Ticketing",
    copy: "Report issues and manage maintenance from one support lane.",
  },
  {
    icon: Wrench,
    title: "Operations",
    copy: "Keep resources, approvals, and maintenance in a single system.",
  },
  {
    icon: BarChart3,
    title: "Insights",
    copy: "Track utilization and trends without jumping between tools.",
  },
];

const Hero = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white px-6 pb-20 pt-24 text-center md:px-8 md:pb-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-0 top-36 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur">
            <Sparkles size={14} />
            Smart campus operations suite
          </div>

          <h1 className="text-[2.2rem] font-extrabold leading-[1.04] tracking-tight text-slate-950 md:text-[4.2rem] font-heading">
            One platform for campus
            <br className="hidden md:block" />
            resources, bookings, and{" "}
            <span className="relative inline-block whitespace-nowrap text-blue-600">
              support.
              <svg
                className="absolute -bottom-3 left-0 h-5 w-full text-sky-300/70 md:-bottom-4 md:h-6"
                viewBox="0 0 300 15"
                preserveAspectRatio="none"
              >
                <path
                  d="M5 10 Q 150 15 295 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M10 12 Q 155 18 290 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
            A polished campus operations hub for students, faculty, technicians, and administrators to manage facilities, raise tickets, and follow clear workflows from one place.
          </p>

          <div className="mx-auto flex w-full max-w-3xl justify-center">
            <SearchBar />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Student portal
            </Link>
            <Link
              to="/admin-login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Admin portal
            </Link>
            <Link
              to="/technician-login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Technician portal
            </Link>
          </div>

          <div className="grid gap-4 pt-6 md:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-white/70 bg-white/85 p-6 text-left shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur"
              >
                <div className="text-3xl font-extrabold tracking-tight text-slate-950">{metric.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-500">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 pt-4 text-left md:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon size={20} />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl items-center justify-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
          <ArrowRight size={14} className="text-sky-600" />
          Built for a real campus workflow: students book, staff approve, technicians resolve, admins oversee.
        </div>
      </div>
    </header>
  );
};

export default Hero;
