/**
 * CandidateDashboard
 * Candly – Candidate dashboard with application tracking, timeline,
 * status stats, and recommended jobs panel.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import api from "../../utils/api";
import { ROUTES } from "../../routes/paths";

// ─── CONFIGURATION & HELPERS ──────────────────────────────────────────────────

const FILTERS = [
  { id: "all",      label: "Toutes" },
  { id: "pending",  label: "En attente" },
  { id: "accepted", label: "Acceptées" },
  { id: "rejected", label: "Refusées" },
];

function getBadge(status) {
  const map = {
    pending:  { label: "En attente",  cls: "badge-pending" },
    accepted: { label: "✓ Acceptée",  cls: "badge-accepted" },
    rejected: { label: "Refusée",     cls: "badge-rejected" },
  };
  return map[status] ?? { label: status, cls: "badge-pending" };
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

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
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-sm shrink-0"
        style={{ background: "rgba(34,211,238,0.12)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.2)" }}
      >
        {app.job_title?.charAt(0).toUpperCase() || "?"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm mb-0.5 truncate" style={{ color: "#f1f5f9" }}>
          {app.job_title}
        </p>
        <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
          Candidature envoyée
        </p>
        {app.moderator_name && (
          <p className="text-xs" style={{ color: "#64748b" }}>
            Modéré par {app.moderator_name}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
        <span className="text-xs" style={{ color: "#475569" }}>
          {new Date(app.applied_at).toLocaleDateString('fr-FR')}
        </span>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get('/candidate/applications');
      const apps = response.data.data || [];
      setApplications(apps);
    } catch (err) {
      setError("Erreur lors du chargement des candidatures");
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchApplications();
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return [
      { label: "Total envoyées", value: total, color: "#22D3EE", delta: `+${total} au total`, glow: true },
      { label: "En examen", value: pending, color: "#F59E0B", delta: "Réponse sous 5 jours", glow: false },
      { label: "Acceptées", value: accepted, color: "#10B981", delta: total > 0 ? `Taux : ${(accepted / total * 100).toFixed(1)}%` : "Taux : 0%", glow: true },
      { label: "Refusées", value: rejected, color: "#F43F5E", delta: "Restez persévérant !", glow: false },
    ];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p style={{ color: "#64748b" }}>Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchApplications} className="btn-primary text-sm">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
            Bonjour, voici l'état de vos candidatures
          </p>
        </div>
        <Link to={ROUTES.OFFRES} className="btn-primary text-sm inline-flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          Rechercher des offres
        </Link>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* Main content */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Applications list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base" style={{ color: "#f1f5f9" }}>
              Mes candidatures
            </h2>
            <div className="flex gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: filter === f.id ? "rgba(34,211,238,0.08)" : "transparent",
                    color:      filter === f.id ? "#22D3EE" : "#64748b",
                    border:     filter === f.id ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(34,211,238,0.1)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, i) => (
                  <AppCard key={app.id} app={app} index={i} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-8 text-center"
                >
                  <p style={{ color: "#64748b" }}>
                    {filter === "all" ? "Aucune candidature trouvée" : `Aucune candidature ${FILTERS.find(f => f.id === filter)?.label.toLowerCase()}`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold text-sm mb-4" style={{ color: "#f1f5f9" }}>
              Dernière activité
            </h3>
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#22D3EE" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#f1f5f9" }}>
                      Candidature pour {app.job_title}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-heading font-bold text-sm mb-4" style={{ color: "#f1f5f9" }}>
              Offres recommandées
            </h3>
            <p className="text-xs mb-4" style={{ color: "#64748b" }}>
              Découvrez des opportunités qui correspondent à votre profil
            </p>
            <button className="btn-primary w-full text-sm">
              Explorer les offres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
