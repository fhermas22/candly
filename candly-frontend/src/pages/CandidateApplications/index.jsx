/**
 * CandidateApplications
 * Affiche les candidatures du candidat et permet de retirer une candidature.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';

import api from '../../utils/api';
import { auth } from '../../utils/auth';
import { ROUTES } from '../../routes/paths';

const getBadge = (status) => {
  const map = {
    pending: { label: 'En attente', cls: 'badge-pending' },
    accepted: { label: 'Acceptée', cls: 'badge-accepted' },
    rejected: { label: 'Refusée', cls: 'badge-rejected' },
  };
  return map[status] || { label: status, cls: 'badge-pending' };
};

export default function CandidateApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await api.get('/candidate/applications');
      setApplications(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Impossible de charger vos candidatures.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate(`${ROUTES.AUTH}?mode=login`, { replace: true });
      return;
    }

    const loadApplications = async () => {
      try {
        setError('');
        setLoading(true);
        const response = await api.get('/candidate/applications');
        setApplications(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Impossible de charger vos candidatures.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadApplications();
  }, [navigate]);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Souhaitez-vous vraiment retirer cette candidature ?')) {
      return;
    }

    try {
      setRefreshing(true);
      await api.delete(`/candidate/applications/${applicationId}`);
      await fetchApplications();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      setError('Impossible de retirer la candidature.');
    }
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'pending').length;
    const accepted = applications.filter((app) => app.status === 'accepted').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;

    return [
      { label: 'Total', value: total, detail: `${total} candidatures` },
      { label: 'En attente', value: pending, detail: `${pending} restantes` },
      { label: 'Acceptées', value: accepted, detail: `${accepted} succès` },
      { label: 'Refusées', value: rejected, detail: `${rejected} refusées` },
    ];
  }, [applications]);

  return (
    <div className="p-8 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight mb-1" style={{ color: '#f1f5f9' }}>
            Mes candidatures
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Suivez l'état de vos candidatures et retirez celles qui ne sont plus d'actualité.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.OFFRES} className="btn-secondary text-sm">
            Rechercher des offres
          </Link>
          <button onClick={fetchApplications} className="btn-primary text-sm" disabled={loading || refreshing}>
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
              {stat.label}
            </p>
            <p className="font-heading font-black text-3xl text-white mb-1">{stat.value}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{stat.detail}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-400">Chargement en cours...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchApplications} className="btn-primary text-sm">Réessayer</button>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-400">Vous n'avez aucune candidature active pour le moment.</p>
          <Link to={ROUTES.OFFRES} className="btn-primary mt-6 inline-flex">
            Explorer les offres
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const badge = getBadge(app.status);
            return (
              <div key={app.id} className="glass-card p-5 md:flex md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-white text-base mb-2 truncate">{app.job_title}</p>
                  <p className="text-xs text-slate-400 mb-2">Candidature envoyée le {new Date(app.applied_at).toLocaleDateString('fr-FR')}</p>
                  {app.moderator_name && <p className="text-xs text-slate-500">Modéré par {app.moderator_name}</p>}
                </div>
                <div className="flex flex-col gap-3 items-start sm:items-end">
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  {app.status === 'pending' ? (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      disabled={refreshing}
                      className="btn-danger text-sm"
                    >
                      Retirer
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Aucune action possible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
