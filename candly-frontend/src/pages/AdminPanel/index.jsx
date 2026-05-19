import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router";
import api from "../../utils/api";
import { useNotifications } from "../../hooks/useNotifications";
import { ROUTES } from "../../routes/paths";

const TABS = [
  { id: "dashboard", label: "Tableau de bord", path: ROUTES.ADMIN },
  { id: "jobs", label: "Gestion des offres", path: ROUTES.ADMIN_OFFRES },
  { id: "apps", label: "Revue des candidatures", path: ROUTES.ADMIN_CANDIDATURES },
  { id: "users", label: "Gestion des candidats", path: ROUTES.ADMIN_CANDIDATS },
];

const STATUS_LABEL = {
  published: "Publiée",
  draft: "Brouillon",
  closed: "Fermée",
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
  active: "Active",
  inactive: "Inactif",
};

function StatusBadge({ status }) {
  const map = {
    published: { label: STATUS_LABEL.published, cls: "badge-accepted" },
    draft: { label: STATUS_LABEL.draft, cls: "badge-pending" },
    closed: { label: STATUS_LABEL.closed, cls: "badge-rejected" },
    pending: { label: STATUS_LABEL.pending, cls: "badge-pending" },
    accepted: { label: STATUS_LABEL.accepted, cls: "badge-accepted" },
    rejected: { label: STATUS_LABEL.rejected, cls: "badge-rejected" },
    active: { label: STATUS_LABEL.active, cls: "badge-accepted" },
    inactive: { label: STATUS_LABEL.inactive, cls: "badge-rejected" },
  };
  const badge = map[status] ?? { label: status, cls: "badge-pending" };
  return <span className={`badge ${badge.cls}`}>{badge.label}</span>;
}

function AdminPanel() {
  const location = useLocation();
  const activeTab = useMemo(() => {
    if (location.pathname.endsWith("/offres")) {
      return "jobs";
    }
    if (location.pathname.endsWith("/candidatures")) {
      return "apps";
    }
    if (location.pathname.endsWith("/candidats")) {
      return "users";
    }
    return "dashboard";
  }, [location.pathname]);

  const [jobs, setJobs] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [newJob, setNewJob] = useState({ title: "", location: "", salary_range: "", description: "" });
  const { pushNotification } = useNotifications();

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchJobs(), fetchPendingApplications()]);
    };
    load();
  }, []);

  async function fetchJobs() {
    setLoadingJobs(true);
    setError("");

    try {
      const response = await api.get("/admin/jobs");
      setJobs(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch admin jobs:", err);
      setError("Impossible de charger les offres.");
    } finally {
      setLoadingJobs(false);
    }
  }

  async function fetchPendingApplications() {
    setLoadingApps(true);

    try {
      const response = await api.get("/admin/applications/pending");
      setPendingApps(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch pending applications:", err);
      setError("Impossible de charger les candidatures en attente.");
    } finally {
      setLoadingApps(false);
    }
  }

  const moderateApplication = async (id, status) => {
    try {
      await api.patch(`/admin/applications/${id}/moderate`, { status });
      const message = `Candidature ${status === "accepted" ? "acceptée" : "rejetée"} avec succès.`;
      setStatusMessage(message);
      pushNotification({ message, type: "success" });
      fetchPendingApplications();
    } catch (err) {
      console.error("Failed to moderate application:", err);
      setError("Impossible de modifier le statut de la candidature.");
      pushNotification({ message: "Impossible de modifier le statut de la candidature.", type: "error" });
    }
  };

  const toggleJobStatus = async (job) => {
    try {
      const endpoint = job.status === "closed" ? "/reopen" : "/close";
      await api.patch(`/admin/jobs/${job.id}${endpoint}`);
      const message = `Offre ${job.status === "closed" ? "réouverte" : "fermée"} avec succès.`;
      setStatusMessage(message);
      pushNotification({ message, type: "success" });
      fetchJobs();
    } catch (err) {
      console.error("Failed to toggle job status:", err);
      setError("Impossible de mettre à jour le statut de l'offre.");
      pushNotification({ message: "Impossible de mettre à jour le statut de l'offre.", type: "error" });
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Supprimer cette offre ?")) {
      return;
    }

    try {
      await api.delete(`/admin/jobs/${id}`);
      const message = "Offre supprimée avec succès.";
      setStatusMessage(message);
      pushNotification({ message, type: "success" });
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete job:", err);
      setError("Impossible de supprimer l'offre.");
      pushNotification({ message: "Impossible de supprimer l'offre.", type: "error" });
    }
  };

  const createJob = async () => {
    if (!newJob.title || !newJob.location || !newJob.description) {
      setError("Veuillez renseigner le titre, le lieu et la description de l'offre.");
      return;
    }

    try {
      await api.post("/admin/jobs", newJob);
      setNewJob({ title: "", location: "", salary_range: "", description: "" });
      const message = "Nouvelle offre publiée avec succès.";
      setStatusMessage(message);
      pushNotification({ message, type: "success" });
      fetchJobs();
    } catch (err) {
      console.error("Failed to create job:", err);
      setError("Impossible de créer l'offre.");
      pushNotification({ message: "Impossible de créer l'offre.", type: "error" });
    }
  };

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter((job) => job.status === "published").length;
    const closedJobs = jobs.filter((job) => job.status === "closed").length;
    const pending = pendingApps.length;
    return [
      { label: "Offres publiées", value: openJobs, detail: `${openJobs} actives` },
      { label: "Offres fermées", value: closedJobs, detail: `${closedJobs} archivées` },
      { label: "Candidatures en attente", value: pending, detail: `${pending} à modérer` },
      { label: "Total offres", value: totalJobs, detail: `${totalJobs} annonces` },
    ];
  }, [jobs, pendingApps]);

  return (
    <div className="p-8 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#22D3EE" }}>Espace administrateur</p>
          <h1 className="font-heading font-black text-3xl tracking-tight mb-2" style={{ color: "#f1f5f9" }}>
            Administration Candly
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Gérez les offres, modérez les candidatures et surveillez les statistiques en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                color: activeTab === tab.id ? "#0f172a" : "#a1a1aa",
                background: activeTab === tab.id ? "#22d3ee" : "rgba(255,255,255,0.03)",
                border: activeTab === tab.id ? "none" : "1px solid rgba(148,163,184,0.16)",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.1)", color: "#fecaca" }}>
          {error}
        </div>
      )}
      {statusMessage && (
        <div className="mb-5 p-4 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", color: "#a7f3d0" }}>
          {statusMessage}
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.75fr]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((card) => (
                <div key={card.label} className="glass-card p-5">
                  <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#94a3b8" }}>
                    {card.label}
                  </p>
                  <p className="font-heading font-black text-4xl mb-2" style={{ color: "#f8fafc" }}>
                    {card.value}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{card.detail}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5">
              <h2 className="font-heading font-bold text-lg mb-3" style={{ color: "#f1f5f9" }}>
                Dernières candidatures en attente
              </h2>
              {loadingApps ? (
                <p className="text-slate-400">Chargement...</p>
              ) : pendingApps.length === 0 ? (
                <p className="text-slate-400">Aucune candidature en attente.</p>
              ) : (
                <div className="space-y-3">
                  {pendingApps.slice(0, 4).map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{app.job_title}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                          Publiée le {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="glass-card p-5">
            <h2 className="font-heading font-bold text-lg mb-3" style={{ color: "#f1f5f9" }}>
              Actions rapides
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              Utilisez l’onglet Gestion des offres pour fermer, rouvrir ou supprimer des annonces. Consultez les candidatures en attente via Modération.
            </p>
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-heading font-bold text-lg" style={{ color: "#f1f5f9" }}>
                    Offres publiées
                  </h2>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    Gérer les offres que les candidats peuvent consulter.
                  </p>
                </div>
                <button onClick={fetchJobs} className="btn-secondary text-sm">
                  Actualiser
                </button>
              </div>

              {loadingJobs ? (
                <p className="text-slate-400">Chargement des offres...</p>
              ) : jobs.length === 0 ? (
                <p className="text-slate-400">Aucune offre trouvée.</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="glass-card p-4 bg-slate-900/80 border border-slate-700/70">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{job.title}</p>
                          <p className="text-xs text-slate-400">{job.location}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={job.status} />
                          <span className="text-xs text-slate-500">{job.salary_range || "À négocier"}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => toggleJobStatus(job)} className="btn-secondary text-xs">
                          {job.status === "closed" ? "Rouvrir" : "Fermer"}
                        </button>
                        <button onClick={() => deleteJob(job.id)} className="btn-danger text-xs">
                          Supprimer
                        </button>
                        <Link to={`${ROUTES.ADMIN}/offres`} className="btn-ghost text-xs">
                          Voir l'offre
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass-card p-5">
              <h3 className="font-heading font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>
                Publier une nouvelle offre
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Titre de l'offre</label>
                  <input value={newJob.title} onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))} className="input-aura w-full" placeholder="Titre du poste" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Localisation</label>
                  <input value={newJob.location} onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))} className="input-aura w-full" placeholder="Paris, France" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Salaire</label>
                  <input value={newJob.salary_range} onChange={(e) => setNewJob((prev) => ({ ...prev, salary_range: e.target.value }))} className="input-aura w-full" placeholder="45 000 – 58 000 €" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                  <textarea value={newJob.description} onChange={(e) => setNewJob((prev) => ({ ...prev, description: e.target.value }))} className="input-aura w-full min-h-[140px]" placeholder="Description détaillée de l'offre..."></textarea>
                </div>
                <button onClick={createJob} className="btn-primary w-full text-sm">
                  Publier l'offre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "apps" && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg" style={{ color: "#f1f5f9" }}>
                Candidatures en attente
              </h2>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Modérez les candidatures reçues et notifiez les candidats.
              </p>
            </div>
            <button onClick={fetchPendingApplications} className="btn-secondary text-sm">
              Actualiser
            </button>
          </div>
          {loadingApps ? (
            <p className="text-slate-400">Chargement des candidatures...</p>
          ) : pendingApps.length === 0 ? (
            <p className="text-slate-400">Aucune nouvelle candidature en attente.</p>
          ) : (
            <div className="space-y-4">
              {pendingApps.map((app) => (
                <div key={app.id} className="glass-card p-4 bg-slate-900/80 border border-slate-700/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{app.job_title}</p>
                      <p className="text-xs text-slate-400">Envoyée le {new Date(app.applied_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => moderateApplication(app.id, "accepted")} className="btn-primary text-xs">
                      Accepter
                    </button>
                    <button onClick={() => moderateApplication(app.id, "rejected")} className="btn-danger text-xs">
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="glass-card p-8 text-center">
          <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#f1f5f9" }}>
            Gestion des candidats
          </h2>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Cette section sera disponible dès que le backend exposera un endpoint <code>/admin/users</code> pour la gestion des comptes.
          </p>
          <div className="mt-6 inline-flex gap-2 items-center justify-center">
            <Link to={ROUTES.ADMIN_OFFRES} className="btn-secondary text-sm">
              Gérer les offres
            </Link>
            <Link to={ROUTES.ADMIN_CANDIDATURES} className="btn-primary text-sm">
              Revue des candidatures
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
