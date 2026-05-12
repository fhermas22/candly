/**
 * JobSearch
 * Candly – Job search page for candidates.
 * Lists all open jobs with search and filters.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";

import { ROUTES } from "../../routes/paths";
import api from "../../utils/api";

// ─── Job Card Component ───────────────────────────────────────────────────────
function JobCard({ job }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-400/30 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white font-bold"
          style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)" }}
        >
          C
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-lg text-white mb-1 truncate">
            {job.title}
          </h3>
          <p className="text-slate-400 text-sm mb-2">Candly · {job.location}</p>
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {job.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 font-medium text-sm">
                {job.salary_range || 'À négocier'}
              </span>
              <span className="text-slate-500 text-xs">
                {new Date(job.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <Link
              to={`${ROUTES.OFFRES}/${job.id}`}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Voir l'offre
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError('Impossible de charger les offres');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-black text-white mb-2">
                Recherche d'emplois
              </h1>
              <p className="text-slate-400">
                Découvrez les dernières opportunités et postulez aux offres qui vous intéressent.
              </p>
            </div>
            <Link
              to={ROUTES.DASHBOARD}
              className="btn-ghost"
            >
              Mon tableau de bord
            </Link>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Rechercher des emplois..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Chargement des offres...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-400">
                {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Aucune offre trouvée.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}