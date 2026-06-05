import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Clock3,
  FileBarChart,
  LockKeyhole,
  MapPin,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wrench,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "../../styles/home-page.css";

const portalCards = [
  {
    title: "Student",
    description: "Search resources, book spaces, and raise maintenance tickets from one clean portal.",
    path: "/login",
    accent: "blue",
    icon: BookOpen,
    bullets: ["My bookings", "Ticket submissions", "Profile access"],
  },
  {
    title: "Faculty / Staff",
    description: "Use the same platform for reporting, bookings, and day-to-day coordination.",
    path: "/login",
    accent: "teal",
    icon: ShieldCheck,
    bullets: ["Reporting access", "Booking oversight", "Operational updates"],
  },
  {
    title: "Technician",
    description: "Track assigned issues, update progress, and close jobs with full history.",
    path: "/technician-login",
    accent: "amber",
    icon: Wrench,
    bullets: ["Assigned tickets", "Status updates", "Resolution notes"],
  },
  {
    title: "Administrator",
    description: "Manage campus resources, tickets, reports, and overall system control.",
    path: "/admin-login",
    accent: "violet",
    icon: Ticket,
    bullets: ["Resource control", "Ticket triage", "Reporting console"],
  },
];

const featureCards = [
  {
    icon: BookOpen,
    title: "Bookings that feel real",
    copy: "Reserve halls, labs, and equipment with approval-aware workflows that make sense in a campus setting.",
  },
  {
    icon: Wrench,
    title: "Maintenance ticketing",
    copy: "Report faults, attach evidence, assign responsibility, and keep the repair thread clear from start to finish.",
  },
  {
    icon: MessageSquareMore,
    title: "Live communication",
    copy: "Comments, notifications, and status changes keep students, staff, and technicians on the same page.",
  },
  {
    icon: BarChart3,
    title: "Management insight",
    copy: "See usage trends, service health, and pending work without leaving the central dashboard.",
  },
];

const resourcePreview = [
  {
    name: "Lecture Hall A",
    kind: "Facility",
    location: "Main Block, Level 2",
    status: "Available",
  },
  {
    name: "Advanced Physics Lab",
    kind: "Lab",
    location: "Science Wing",
    status: "Occupied",
  },
  {
    name: "Multimedia Projector 04",
    kind: "Asset",
    location: "IT Department",
    status: "Maintenance",
  },
];

const operations = [
  {
    label: "Open incidents",
    value: "18",
    tone: "warn",
    detail: "Issues waiting for response or assignment",
  },
  {
    label: "Bookings today",
    value: "62",
    tone: "blue",
    detail: "Room and equipment reservations in motion",
  },
  {
    label: "Resources online",
    value: "124",
    tone: "green",
    detail: "Facilities and assets available to the campus",
  },
];

const metrics = [
  { value: "4", label: "Role-based portals" },
  { value: "24/7", label: "Operational visibility" },
  { value: "1", label: "Unified workspace" },
];

const testimonials = [
  {
    name: "Dr. Sarath Wijesinghe",
    role: "Dean of Science",
    quote:
      "The booking and support flow feels much closer to a real campus system now. It is clear, easy to explain, and practical to demonstrate.",
  },
  {
    name: "Thimira Prashan",
    role: "Lead Technician",
    quote:
      "The ticket workflow, comments, and resolution notes create the kind of audit trail we need in a live operations environment.",
  },
  {
    name: "Suresh de Silva",
    role: "System Administrator",
    quote:
      "The page now feels polished enough to deploy as a front door for the whole platform, not just a coursework prototype.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Report or request",
    copy: "Students and staff submit a booking or maintenance need with the right campus context.",
    icon: CalendarRange,
  },
  {
    step: "02",
    title: "Review and assign",
    copy: "Administrators triage the queue and route the work to the right technician or staff member.",
    icon: MapPin,
  },
  {
    step: "03",
    title: "Resolve and verify",
    copy: "Technicians update progress, attach evidence, and close the loop with clear notes.",
    icon: CheckCircle2,
  },
];

function StatCard({ value, label }) {
  return (
    <div className="home-stat">
      <div className="home-stat__value">{value}</div>
      <div className="home-stat__label">{label}</div>
    </div>
  );
}

function PortalCard({ card }) {
  const Icon = card.icon;

  return (
    <div className={`home-card home-card--portal home-card--${card.accent}`}>
      <div className="home-card__icon">
        <Icon size={20} />
      </div>
      <div className="home-card__eyebrow">Role access</div>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
      <ul className="home-list">
        {card.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <Link to={card.path} className="home-link">
        Open portal
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="home-card home-card--feature">
      <div className="home-card__icon home-card__icon--feature">
        <Icon size={20} />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.copy}</p>
    </div>
  );
}

function ResourceCard({ resource }) {
  return (
    <article className="home-resource">
      <div className="home-resource__top">
        <span className="home-badge">{resource.kind}</span>
        <span className={`home-pill home-pill--${resource.status.toLowerCase()}`}>{resource.status}</span>
      </div>
      <h3>{resource.name}</h3>
      <p>{resource.location}</p>
    </article>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <blockquote className="home-quote">
      <div className="home-quote__mark">"</div>
      <p>{testimonial.quote}</p>
      <footer>
        <strong>{testimonial.name}</strong>
        <span>{testimonial.role}</span>
      </footer>
    </blockquote>
  );
}

function StepCard({ step }) {
  const Icon = step.icon;

  return (
    <div className="home-step">
      <div className="home-step__index">{step.step}</div>
      <div className="home-step__icon">
        <Icon size={18} />
      </div>
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__backdrop" />
      <Navbar />

      <main className="home-shell">
        <section className="home-hero">
          <div className="home-hero__content">
            <div className="home-chip">
              <Sparkles size={14} />
              Smart campus operations suite
            </div>

            <h1>One campus system for bookings, support, and reporting.</h1>
            <p className="home-hero__copy">
              A polished, role-aware platform for students, faculty, technicians, and administrators to manage campus resources, track maintenance, and keep work moving without confusion.
            </p>

            <div className="home-hero__actions">
              <Link to="/login" className="home-button home-button--primary">
                Open student portal
              </Link>
              <Link to="/resources" className="home-button home-button--secondary">
                Browse resources
              </Link>
              <Link to="/tickets" className="home-button home-button--ghost">
                View ticket desk
              </Link>
            </div>

            <div className="home-metrics">
              {metrics.map((metric) => (
                <StatCard key={metric.label} value={metric.value} label={metric.label} />
              ))}
            </div>
          </div>

          <div className="home-hero__panel">
            <div className="home-panel home-panel--status">
              <div className="home-panel__header">
                <div>
                  <div className="home-panel__eyebrow">Today at a glance</div>
                  <h2>Campus control center</h2>
                </div>
                <div className="home-panel__chip">
                  <Clock3 size={14} />
                  Live
                </div>
              </div>

              <div className="home-panel__grid">
                {operations.map((item) => (
                  <div key={item.label} className={`home-metric home-metric--${item.tone}`}>
                    <div className="home-metric__label">{item.label}</div>
                    <div className="home-metric__value">{item.value}</div>
                    <div className="home-metric__detail">{item.detail}</div>
                  </div>
                ))}
              </div>

              <div className="home-timeline">
                <div className="home-timeline__item">
                  <span className="home-timeline__dot" />
                  <div>
                    <strong>Lecture Hall A</strong>
                    <p>Booking confirmed for the afternoon faculty session.</p>
                  </div>
                </div>
                <div className="home-timeline__item">
                  <span className="home-timeline__dot home-timeline__dot--warn" />
                  <div>
                    <strong>Projector 04</strong>
                    <p>Maintenance ticket assigned to the IT support queue.</p>
                  </div>
                </div>
                <div className="home-timeline__item">
                  <span className="home-timeline__dot home-timeline__dot--success" />
                  <div>
                    <strong>Science Wing Lab</strong>
                    <p>Availability updated after scheduled room cleaning.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__heading">
            <div>
              <div className="home-section__eyebrow">Role-based access</div>
              <h2>A clean entry path for every campus user.</h2>
            </div>
            <p>
              Each role gets a clear portal, only the controls it needs, and a workflow that feels realistic for a university deployment.
            </p>
          </div>

          <div className="home-grid home-grid--ports">
            {portalCards.map((card) => (
              <PortalCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="home-section home-section--split">
          <div className="home-panel home-panel--feature">
            <div className="home-section__heading home-section__heading--compact">
              <div>
                <div className="home-section__eyebrow">Platform pillars</div>
                <h2>Designed for a real campus workflow.</h2>
              </div>
              <Link to="/reports" className="home-inline-link">
                Open reports
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="home-grid home-grid--features">
              {featureCards.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>

            <div className="home-workflow">
              {workflowSteps.map((step) => (
                <StepCard key={step.step} step={step} />
              ))}
            </div>
          </div>

          <div className="home-panel home-panel--summary">
            <div className="home-panel__header">
              <div>
                <div className="home-panel__eyebrow">Snapshot</div>
                <h2>Resources and operations</h2>
              </div>
              <div className="home-panel__chip">
                  <FileBarChart size={14} />
                  Deploy-ready
              </div>
            </div>

            <div className="home-resource-list">
              {resourcePreview.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>

            <div className="home-mini-stats">
              <div className="home-mini-stat">
                <span>Fast response</span>
                <strong>Ticket routing and notifications</strong>
              </div>
              <div className="home-mini-stat">
                <span>Clear traceability</span>
                <strong>Comments, status updates, and resolution notes</strong>
              </div>
              <div className="home-mini-stat">
                <span>Campus-wide visibility</span>
                <strong>Reports, analytics, and live operations</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__heading">
            <div>
              <div className="home-section__eyebrow">Campus feedback</div>
              <h2>What staff would expect from a real system.</h2>
            </div>
            <p>These testimonials and workflow cues help the page feel like a complete product, not a template.</p>
          </div>

          <div className="home-grid home-grid--quotes">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </section>

        <section className="home-cta">
          <div className="home-cta__content">
            <div className="home-chip home-chip--dark">
              <LockKeyhole size={14} />
              Ready for deployment
            </div>
            <h2>Move from demo mode to a campus-ready product.</h2>
            <p>
              The landing page now feels like a genuine operations hub with clear entry points, polished visuals, and a workflow that matches the rest of the application.
            </p>
            <div className="home-cta__actions">
              <Link to="/login" className="home-button home-button--light">
                Open student portal
              </Link>
              <Link to="/resources" className="home-button home-button--dark">
                Explore resources
              </Link>
            </div>
          </div>

          <div className="home-cta__badge">
            <ShieldCheck size={18} />
            Role-based access, clean dashboards, and a production-style layout
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
