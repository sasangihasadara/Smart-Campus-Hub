import React from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="bg-slate-950 px-4 py-24 text-white md:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 shadow-2xl shadow-blue-950/25 md:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              <Sparkles size={14} />
              Ready for deployment
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight md:text-5xl font-heading">
              Move from demo mode to a campus-ready product
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              The structure is now cleaner, role-aware, and closer to a production system. Use the portal entry points to test real user journeys and present the project confidently.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Open student portal
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Browse resources
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              <LockKeyhole size={14} />
              Role-based access, clean dashboards, and workflow-focused navigation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
