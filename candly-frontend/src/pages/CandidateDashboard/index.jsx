/**
 * CandidateDashboard
 * Candly – Candidate dashboard with application tracking, timeline,
 * status stats, and recommended jobs panel.
 *
 * Uses mock data. Replace with API calls to:
 *   GET /api/applications        → application list
 *   GET /api/jobs/recommended    → recommended jobs
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Total envoyées",   value: 12, color: "#22D3EE", delta: "+3 ce mois-ci",       glow: true },
  { label: "En examen",        value: 4,  color: "#F59E0B", delta: "Réponse sous 5 jours", glow: false },
  { label: "Acceptées",        value: 2,  color: "#10B981", delta: "Taux : 16.6%",         glow: true },
  { label: "Refusées",         value: 6,  color: "#F43F5E", delta: "Restez persévérant !",  glow: false },
];

const MOCK_APPLICATIONS = [
  {
    id: 1, status: "review",
    title: "Développeur Full-Stack Laravel",
    company: "SoftFusion", location: "Paris",
    tags: ["Laravel 12", "React", "CDI"],
    date: "28 avr. 2025",
    logoColor: "#22D3EE", logoBg: "rgba(34,211,238,0.12)", initials: "SF",
  },
  {
    id: 2, status: "accepted",
    title: "Designer UI/UX Senior",
    company: "Axelio Studio", location: "Lyon",
    tags: ["Figma", "Design System"],
    date: "20 avr. 2025",
    logoColor: "#10B981", logoBg: "rgba(16,185,129,0.12)", initials: "AX",
  },
  {
    id: 3, status: "pending",
    title: "DevOps Engineer – AWS",
    company: "Nexora Cloud", location: "Bordeaux",
    tags: ["AWS", "Docker", "Freelance"],
    date: "15 avr. 2025",
    logoColor: "#F59E0B", logoBg: "rgba(245,158,11,0.12)", initials: "NX",
  },
  {
    id: 4, status: "accepted",
    title: "Lead Frontend React",
    company: "TechCore", location: "Toulouse",
    tags: ["React", "TypeScript", "CDI"],
    date: "10 avr. 2025",
    logoColor: "#67e8f9", logoBg: "rgba(34,211,238,0.1)", initials: "TC",
  },
  {
    id: 5, status: "rejected",
    title: "Ingénieur Data · Python",
    company: "DataFlow", location: "Nantes",
    tags: ["Python", "Spark", "CDI"],
    date: "2 avr. 2025",
    logoColor: "#F43F5E", logoBg: "rgba(244,63,94,0.12)", initials: "DF",
  },
];

const MOCK_TIMELINE = [
  { label: "Candidature envoyée", date: "28 avr. 2025", state: "done" },
  { label: "Profil examiné",      date: "30 avr. 2025", state: "done" },
  { label: "Entretien planifié",  date: "5 mai 2025 · 14h00", state: "current" },
  { label: "Décision finale",     date: "En attente",   state: "todo" },
];

const MOCK_RECOMMENDED = [
  { title: "Backend Python Engineer", company: "Vortex Tech · Remote",    salary: "52 000 – 65 000 €", color: "#F43F5E", bg: "rgba(244,63,94,0.1)",   initials: "VT" },
  { title: "Product Designer · SaaS", company: "DigitalSpark · Paris",     salary: "44 000 – 55 000 €", color: "#22D3EE", bg: "rgba(34,211,238,0.1)",  initials: "DS" },
  { title: "Tech Lead Node.js",       company: "GreenLoop · Lyon",          salary: "58 000 – 72 000 €", color: "#10B981", bg: "rgba(16,185,129,0.1)",  initials: "GL" },
];

// ─── Filter config ────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "all",      label: "Toutes" },
  { id: "pending",  label: "En attente" },
  { id: "accepted", label: "Acceptées" },
  { id: "rejected", label: "Refusées" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getBadge(status) {
  const map = {
    review:   { label: "En revue",    cls: "badge-review" },
    pending:  { label: "En attente",  cls: "badge-pending" },
    accepted: { label: "✓ Acceptée",  cls: "badge-accepted" },
    rejected: { label: "Refusée",     cls: "badge-rejected" },
  };
  return map[status] ?? { label: status, cls: "badge-pending" };
}

function matchesFilter(app, filter) {
  if (filter === "all")      return true;
  if (filter === "pending")  return app.status === "pending" || app.status === "review";
  return app.status === filter;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated stat card */
function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card p-5"
      style={{ "--card-color": stat.color }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: stat.color,
            boxShadow: stat.glow ? `0 0 6px ${stat.color}` : "none",
          }}
        />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
          {stat.label}
        </span>
      </div>
      <p className="font-heading font-black text-4xl leading-none mb-2" style={{ color: stat.color }}>
        {stat.value}
      </p>
      <p className="text-xs" style={{ color: "#64748b" }}>{stat.delta}</p>
    </motion.div>
  );
}

/** Application row card */
function AppCard({ app, index }) {
  const badge = getBadge(app.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="glass-card flex items-center gap-5 p-5 cursor-pointer"
      whileHover={{ x: 4 }}
    >
      {/* Logo */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-sm shrink-0"
        style={{ background: app.logoBg, color: app.logoColor, border: `1px solid ${app.logoColor}22` }}
      >
        {app.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm mb-0.5 truncate" style={{ color: "#f1f5f9" }}>
          {app.title}
        </p>
        <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
          {app.company} · {app.location}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {app.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
        <span className="text-xs" style={{ color: "#475569" }}>{app.date}</span>
      </div>
    </motion.div>
  );
}

/** Application pipeline timeline */
function Timeline({ steps }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isDone    = step.state === "done";
        const isCurrent = step.state === "current";

        return (
          <div key={step.label} className="flex gap-3.5 relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-3.5 top-8 w-px"
                style={{
                  height: "calc(100% - 12px)",
                  background: isDone
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(34,211,238,0.1)",
                }}
              />
            )}

            {/* Circle */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1.5 text-xs font-bold"
              style={{
                background: isDone
                  ? "rgba(16,185,129,0.12)"
                  : isCurrent
                  ? "rgba(34,211,238,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isDone
                  ? "1.5px solid rgba(16,185,129,0.4)"
                  : isCurrent
                  ? "1.5px solid rgba(34,211,238,0.4)"
                  : "1.5px solid rgba(255,255,255,0.08)",
                color: isDone ? "#10B981" : isCurrent ? "#22D3EE" : "#475569",
                boxShadow: isCurrent ? "0 0 10px rgba(34,211,238,0.25)" : "none",
              }}
            >
              {isDone ? "✓" : isCurrent ? "→" : i + 1}
            </div>

            {/* Content */}
            <div className="pb-5">
              <p className="text-sm font-semibold" style={{ color: isCurrent ? "#f1f5f9" : isDone ? "#94a3b8" : "#475569" }}>
                {step.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isCurrent ? "#22D3EE" : "#475569" }}>
                {step.date}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Recommended job item */
function RecommendedJob({ job }) {
  return (
    <div
      className="flex items-center gap-3.5 py-4"
      style={{ borderBottom: "1px solid rgba(34,211,238,0.06)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-xs shrink-0"
        style={{ background: job.bg, color: job.color }}
      >
        {job.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{job.title}</p>
        <p className="text-xs" style={{ color: "#64748b" }}>{job.company}</p>
        <p className="text-xs font-bold mt-1" style={{ color: "#10B981" }}>{job.salary}</p>
      </div>
      <button className="btn-secondary text-xs px-3 py-1.5 shrink-0">
        Postuler
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredApps = MOCK_APPLICATIONS.filter((a) => matchesFilter(a, activeFilter));

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start mb-8 flex-wrap gap-4"
      >
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight mb-1" style={{ color: "#f1f5f9" }}>
            Tableau de bord
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Bonjour Hermas, voici l'état de vos candidatures
          </p>
        </div>
        <button className="btn-primary text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          Rechercher des offres
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {MOCK_STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* Main content */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Applications list */}
        <div>
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base" style={{ color: "#f1f5f9" }}>
              Mes candidatures
            </h2>
            <div className="flex gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: activeFilter === f.id ? "rgba(34,211,238,0.08)" : "transparent",
                    color:      activeFilter === f.id ? "#22D3EE" : "#64748b",
                    border:     activeFilter === f.id ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(34,211,238,0.1)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, i) => (
                  <AppCard key={app.id} app={app} index={i} />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-10 text-center"
                >
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Aucune candidature dans cette catégorie.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-5">
          {/* Timeline card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card p-6"
          >
            <p className="font-heading font-black text-sm mb-0.5" style={{ color: "#f1f5f9" }}>
              Suivi — SoftFusion
            </p>
            <p className="text-xs mb-5" style={{ color: "#64748b" }}>
              Développeur Full-Stack Laravel
            </p>
            <Timeline steps={MOCK_TIMELINE} />
          </motion.div>

          {/* Recommended jobs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card p-6"
          >
            <p className="font-heading font-black text-sm mb-4" style={{ color: "#f1f5f9" }}>
              Offres recommandées
            </p>
            <div>
              {MOCK_RECOMMENDED.map((job) => (
                <RecommendedJob key={job.title} job={job} />
              ))}
            </div>
            <button className="btn-ghost w-full justify-center text-xs mt-3" style={{ color: "#22D3EE" }}>
              Voir toutes les offres →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

