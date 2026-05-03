/**
 * AdminPanel
 * Candly – Admin supervision panel.
 * Tabs: User Management | Job Management | Application Review | Statistics
 *
 * Replace mock data and handlers with API calls:
 *   GET/PATCH  /api/admin/users
 *   GET/POST/PATCH/DELETE /api/admin/jobs
 *   GET/PATCH  /api/admin/applications
 *   GET        /api/admin/stats
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Active Candidates",      value: "342",  color: "#22D3EE", glow: true,  delta: "↑ +18 this week" },
  { label: "Published Jobs",         value: "28",   color: "#10B981", glow: false, delta: "4 in draft" },
  { label: "Total Applications",     value: "1 204",color: "#F59E0B", glow: false, delta: "↑ +94 this month" },
  { label: "Pending Review",         value: "47",   color: "#F43F5E", glow: false, delta: "Action required" },
];

const initUsers = [
  { id: 1, initials: "HF", color: "#22D3EE", bg: "rgba(34,211,238,0.12)", name: "Hermas Francisco", email: "hermas@candly.io",      apps: 12, status: "active",   joined: "12 jan. 2025" },
  { id: 2, initials: "AS", color: "#10B981", bg: "rgba(16,185,129,0.12)", name: "Amina Sorel",      email: "amina.sorel@mail.fr",    apps: 7,  status: "active",   joined: "3 fév. 2025" },
  { id: 3, initials: "KM", color: "#F43F5E", bg: "rgba(244,63,94,0.12)",  name: "Kévin Moussa",     email: "kevin.m@dev.io",          apps: 3,  status: "inactive", joined: "18 mars 2025" },
  { id: 4, initials: "LC", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", name: "Léa Cardin",       email: "lea.cardin@outlook.com",  apps: 9,  status: "active",   joined: "5 avr. 2025" },
];

const initJobs = [
  { id: 1, title: "Développeur Full-Stack Laravel", company: "SoftFusion",   apps: 34, status: "published", date: "28 avr. 2025" },
  { id: 2, title: "Designer UI/UX Senior",          company: "Axelio Studio", apps: 21, status: "published", date: "20 avr. 2025" },
  { id: 3, title: "DevOps Engineer – AWS",           company: "Nexora Cloud",  apps: 8,  status: "draft",     date: "—" },
  { id: 4, title: "Lead Frontend React",             company: "TechCore",      apps: 47, status: "published", date: "10 avr. 2025" },
];

const initApplications = [
  { id: 1, initials: "HF", color: "#22D3EE", bg: "rgba(34,211,238,0.12)", name: "Hermas Francisco", job: "Dev Full-Stack Laravel",  status: "pending",  date: "28 avr." },
  { id: 2, initials: "LC", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", name: "Léa Cardin",       job: "Designer UI/UX Senior",  status: "pending",  date: "26 avr." },
  { id: 3, initials: "AS", color: "#10B981", bg: "rgba(16,185,129,0.12)", name: "Amina Sorel",      job: "Lead Frontend React",     status: "accepted", date: "20 avr." },
  { id: 4, initials: "KM", color: "#F43F5E", bg: "rgba(244,63,94,0.12)",  name: "Kévin Moussa",     job: "DevOps Engineer – AWS",   status: "rejected", date: "14 avr." },
];

const MONTHLY_DATA = [
  { month: "Jan", pct: 45 },
  { month: "Fév", pct: 60 },
  { month: "Mar", pct: 50 },
  { month: "Avr", pct: 80 },
  { month: "Mai", pct: 100 },
];

const STATUS_DISTRIBUTION = [
  { label: "Pending",    value: 47, pct: 38, color: "#F59E0B" },
  { label: "Accepted",   value: 51, pct: 42, color: "#10B981", glow: true },
  { label: "Rejected",   value: 25, pct: 20, color: "#F43F5E" },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: "users",    label: "User Management" },
  { id: "jobs",     label: "Job Management" },
  { id: "apps",     label: "Application Review" },
  { id: "stats",    label: "Statistics" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    { label: "Active",     cls: "badge-accepted" },
    inactive:  { label: "Inactive",   cls: "badge-rejected" },
    published: { label: "Published",  cls: "badge-review" },
    draft:     { label: "Draft",      cls: "badge-draft" },
    pending:   { label: "Pending",    cls: "badge-pending" },
    accepted:  { label: "Accepted",   cls: "badge-accepted" },
    rejected:  { label: "Rejected",   cls: "badge-rejected" },
  };
  const b = map[status] ?? { label: status, cls: "badge-pending" };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
      {children}
    </p>
  );
}

function TableHeader({ title, count, action }) {
  return (
    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
      <div>
        <h3 className="font-heading font-bold text-sm" style={{ color: "#f1f5f9" }}>{title}</h3>
        {count && <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{count}</p>}
      </div>
      {action}
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ color: "#475569", borderBottom: "1px solid rgba(34,211,238,0.08)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return (
    <td
      className="px-4 py-3.5 text-sm"
      style={{ color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.04)", ...style }}
    >
      {children}
    </td>
  );
}

function UserCell({ user }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
        style={{ background: user.bg, color: user.color, border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {user.initials}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{user.name}</p>
        <p className="text-xs" style={{ color: "#64748b" }}>{user.email}</p>
      </div>
    </div>
  );
}

function ActionBtn({ variant, onClick, children }) {
  const styles = {
    activate:   { bg: "rgba(16,185,129,0.08)",  color: "#10B981", border: "rgba(16,185,129,0.2)",  hover: "rgba(16,185,129,0.18)" },
    deactivate: { bg: "rgba(244,63,94,0.08)",   color: "#F43F5E", border: "rgba(244,63,94,0.2)",   hover: "rgba(244,63,94,0.18)" },
    edit:       { bg: "rgba(34,211,238,0.07)",  color: "#22D3EE", border: "rgba(34,211,238,0.18)", hover: "rgba(34,211,238,0.15)" },
    delete:     { bg: "rgba(244,63,94,0.07)",   color: "#F43F5E", border: "rgba(244,63,94,0.18)",  hover: "rgba(244,63,94,0.16)" },
    publish:    { bg: "rgba(16,185,129,0.08)",  color: "#10B981", border: "rgba(16,185,129,0.2)",  hover: "rgba(16,185,129,0.18)" },
    accept:     { bg: "rgba(16,185,129,0.08)",  color: "#10B981", border: "rgba(16,185,129,0.2)",  hover: "rgba(16,185,129,0.18)" },
    reject:     { bg: "rgba(244,63,94,0.08)",   color: "#F43F5E", border: "rgba(244,63,94,0.2)",   hover: "rgba(244,63,94,0.18)" },
    cv:         { bg: "rgba(34,211,238,0.07)",  color: "#22D3EE", border: "rgba(34,211,238,0.18)", hover: "rgba(34,211,238,0.15)" },
  };
  const s = styles[variant] ?? styles.edit;

  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      onMouseEnter={(e) => (e.currentTarget.style.background = s.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = s.bg)}
    >
      {children}
    </button>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState(initUsers);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
    // TODO: PATCH /api/admin/users/:id { status }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <TableHeader
        title="Registered Candidates"
        count={`${users.length} total accounts`}
        action={
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(34,211,238,0.1)", width: 260 }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#64748b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate…"
              className="bg-transparent border-none outline-none text-xs flex-1"
              style={{ color: "#f1f5f9" }}
            />
          </div>
        }
      />
      <div className="glass-card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr><Th>Candidate</Th><Th>Applications</Th><Th>Status</Th><Th>Joined</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-white/2 transition-colors">
                <Td><UserCell user={user} /></Td>
                <Td>{user.apps}</Td>
                <Td><StatusBadge status={user.status} /></Td>
                <Td style={{ color: "#64748b" }}>{user.joined}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {user.status === "active" ? (
                      <ActionBtn variant="deactivate" onClick={() => toggleStatus(user.id)}>Deactivate</ActionBtn>
                    ) : (
                      <ActionBtn variant="activate" onClick={() => toggleStatus(user.id)}>Activate</ActionBtn>
                    )}
                    <ActionBtn variant="edit">View Profile</ActionBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function JobsTab() {
  const [jobs, setJobs] = useState(initJobs);

  const publishJob = (id) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: "published", date: "Today" } : j));
    // TODO: PATCH /api/admin/jobs/:id { status: "published" }
  };

  const deleteJob = (id) => {
    if (!window.confirm("Delete this job?")) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    // TODO: DELETE /api/admin/jobs/:id
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <TableHeader
        title="Job Offers"
        count={`${jobs.filter((j) => j.status === "published").length} published · ${jobs.filter((j) => j.status === "draft").length} drafts`}
        action={<button className="btn-primary text-xs py-2 px-4">+ Create Job</button>}
      />
      <div className="glass-card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr><Th>Job Title</Th><Th>Company</Th><Th>Applications</Th><Th>Status</Th><Th>Published</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/2 transition-colors">
                <Td style={{ fontWeight: 600, color: "#f1f5f9" }}>{job.title}</Td>
                <Td style={{ color: "#94a3b8" }}>{job.company}</Td>
                <Td>{job.apps}</Td>
                <Td><StatusBadge status={job.status} /></Td>
                <Td style={{ color: "#64748b" }}>{job.date}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {job.status === "draft" && (
                      <ActionBtn variant="publish" onClick={() => publishJob(job.id)}>Publish</ActionBtn>
                    )}
                    <ActionBtn variant="edit">Edit</ActionBtn>
                    <ActionBtn variant="delete" onClick={() => deleteJob(job.id)}>Delete</ActionBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState(initApplications);

  const decide = (id, decision) => {
    setApps((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: decision } : a)
    );
    // TODO: PATCH /api/admin/applications/:id { status: decision }
    console.log(`[Candly] Application ${id} → ${decision}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <TableHeader
        title="Application Review"
        count={`${apps.filter((a) => a.status === "pending").length} pending decisions`}
        action={
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(34,211,238,0.1)", width: 280 }}
          >
            <svg className="w-3.5 h-3.5" style={{ color: "#64748b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Filter by candidate or job…" className="bg-transparent border-none outline-none text-xs flex-1" style={{ color: "#f1f5f9" }} />
          </div>
        }
      />
      <div className="glass-card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr><Th>Candidate</Th><Th>Targeted Job</Th><Th>CV</Th><Th>Status</Th><Th>Date</Th><Th>Decision</Th></tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-white/2 transition-colors">
                <Td><UserCell user={app} /></Td>
                <Td style={{ color: "#e2e8f0" }}>{app.job}</Td>
                <Td><ActionBtn variant="cv">View CV</ActionBtn></Td>
                <Td><StatusBadge status={app.status} /></Td>
                <Td style={{ color: "#64748b" }}>{app.date}</Td>
                <Td>
                  {app.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <ActionBtn variant="accept" onClick={() => decide(app.id, "accepted")}>Accept</ActionBtn>
                      <ActionBtn variant="reject" onClick={() => decide(app.id, "rejected")}>Reject</ActionBtn>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: "#475569" }}>Decided</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function StatsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 gap-5"
    >
      {/* Bar chart */}
      <div className="glass-card p-6">
        <SectionLabel>Applications by Month</SectionLabel>
        <p className="text-xs mb-6" style={{ color: "#64748b" }}>January — May 2025</p>
        <div className="flex items-end gap-3 h-24 mb-3">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full rounded-t-md"
                initial={{ height: 0 }}
                animate={{ height: `${d.pct}%` }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                style={{
                  background: d.pct === 100
                    ? "linear-gradient(180deg,#22D3EE,rgba(34,211,238,0.35))"
                    : "rgba(34,211,238,0.25)",
                  boxShadow: d.pct === 100 ? "0 0 10px rgba(34,211,238,0.3)" : "none",
                  minHeight: 4,
                }}
              />
              <span className="text-xs font-semibold" style={{ color: d.pct === 100 ? "#22D3EE" : "#475569" }}>
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status distribution */}
      <div className="glass-card p-6">
        <SectionLabel>Status Distribution</SectionLabel>
        <div className="space-y-4 mb-6">
          {STATUS_DISTRIBUTION.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "#94a3b8" }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.value} ({s.pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{
                    background: s.color,
                    boxShadow: s.glow ? `0 0 6px ${s.color}66` : "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <hr className="divider-glow mb-5" />

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Acceptance Rate", value: "42%",  color: "#10B981" },
            { label: "Avg Response Time",value: "4.2d", color: "#22D3EE" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-3.5 rounded-xl"
              style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.1)" }}
            >
              <p className="text-xs uppercase tracking-widest font-bold mb-1.5" style={{ color: "#475569" }}>
                {kpi.label}
              </p>
              <p className="font-heading font-black text-2xl" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");

  const TAB_COMPONENTS = {
    users: <UsersTab />,
    jobs:  <JobsTab />,
    apps:  <ApplicationsTab />,
    stats: <StatsTab />,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-8 flex-wrap gap-4"
      >
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight mb-1" style={{ color: "#f1f5f9" }}>
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Manage Candly platform — jobs, candidates and applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Admin badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#10B981",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10B981", boxShadow: "0 0 5px rgba(16,185,129,0.8)" }}
            />
            ADMIN
          </div>
          <button className="btn-primary text-sm">+ New Job</button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {MOCK_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: s.color, boxShadow: s.glow ? `0 0 6px ${s.color}` : "none" }}
              />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
                {s.label}
              </span>
            </div>
            <p className="font-heading font-black text-3xl leading-none mb-2" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "#64748b" }}>{s.delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-0 mb-6"
        style={{ borderBottom: "1px solid rgba(34,211,238,0.08)" }}
      >
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-3 text-sm font-semibold transition-all duration-200"
            style={{
              color: activeTab === tab.id ? "#22D3EE" : "#64748b",
              borderBottom: activeTab === tab.id ? "2px solid #22D3EE" : "2px solid transparent",
              marginBottom: -1,
              background: "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}>
          {TAB_COMPONENTS[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

