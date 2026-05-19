/**
 * JobDetail
 * Candly – Job detail page for candidates.
 * Shows full job info and apply button.
 */

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";

import { ROUTES, AUTH_MODE } from "../../routes/paths";
import api from "../../utils/api";
import { auth } from "../../utils/auth";
import { useNotifications } from "../../hooks/useNotifications";

// ─── Main Component ──────────────────────────────────────────────────────────
export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const { pushNotification } = useNotifications();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Impossible de charger l\'offre');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!auth.isAuthenticated()) {
      navigate(`${ROUTES.AUTH}?mode=${AUTH_MODE.LOGIN}`, { replace: true });
      return;
    }

    setApplying(true);
    try {
      await api.post('/candidate/applications', { job_id: jobId });
      setApplied(true);
      pushNotification({ message: 'Votre candidature a bien été envoyée.', type: 'success' });
    } catch (err) {
      console.error('Failed to apply:', err);
      pushNotification({ message: 'Erreur lors de l’envoi de la candidature.', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Offre non trouvée'}</p>
          <Link to={ROUTES.OFFRES} className="btn-primary">
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to={ROUTES.OFFRES}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux offres
          </Link>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xl"
              style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)" }}
            >
              C
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-black text-white mb-2">
                {job.title}
              </h1>
              <p className="text-slate-400 text-lg mb-4">Candly · {job.location}</p>
              <div className="flex items-center gap-6 mb-6">
                <span className="text-cyan-400 font-medium">
                  {job.salary_range || 'À négocier'}
                </span>
                <span className="text-slate-500">
                  Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <button
                onClick={handleApply}
                disabled={applying || applied}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applied ? 'Candidature envoyée' : applying ? 'Envoi...' : 'Postuler'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-heading font-bold text-white mb-6">
            Description du poste
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}