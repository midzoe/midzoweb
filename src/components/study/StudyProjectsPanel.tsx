import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  SavedStudyProject, StudyProject, STUDY_SERVICES,
  deleteAccountProject, domainLabels, levelLabel, projectTitle,
} from './studyProject';

// Dashboard : projets d'études enregistrés dans le compte, et brouillon resté sur
// l'appareil (parcours sans compte, ou projet pas encore enregistré).

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  done: { label: 'Fait', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
};

const ProjectFacts: React.FC<{ project: StudyProject }> = ({ project }) => (
  <p className="text-xs text-gray-500 mt-1">
    {[
      levelLabel(project.level),
      [...domainLabels(project.domains), project.fieldQuery].filter(Boolean).join(', '),
      project.cities.join(', '),
      project.startMonth && `rentrée ${project.startMonth}`,
    ].filter(Boolean).join(' · ') || 'Projet à compléter'}
  </p>
);

interface Props {
  isLoggedIn: boolean;
  projects: SavedStudyProject[];
  loading: boolean;
  error: string;
  draft: StudyProject | null;
  onChanged: () => void;
}

const StudyProjectsPanel: React.FC<Props> = ({ isLoggedIn, projects, loading, error, draft, onChanged }) => {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Brouillon local à proposer : celui d'un projet pas encore enregistré, ou
  // modifié depuis son dernier enregistrement.
  const savedIds = new Set(projects.map(p => p.tripId));
  const showDraft = Boolean(draft && (draft.destination || draft.level) &&
    (!draft.tripId || !savedIds.has(draft.tripId) || (draft.updatedAt && draft.savedAt && draft.updatedAt > draft.savedAt)));

  const remove = async (tripId: number) => {
    setDeleting(tripId);
    try {
      await deleteAccountProject(tripId);
      onChanged();
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-testid="study-projects">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">🎓 Mes projets d'études</h2>
        <Link to="/study" className="text-sm text-primary hover:text-primary/80 font-medium">+ Nouveau projet</Link>
      </div>

      {showDraft && draft && (
        <div className="border border-dashed border-amber-300 bg-amber-50/60 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {draft.tripId ? 'Modifications non enregistrées' : 'Brouillon sur cet appareil'}
              </p>
              <h3 className="font-semibold text-gray-900 text-sm mt-1">{projectTitle(draft)}</h3>
              <ProjectFacts project={draft} />
              {draft.services.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Services : {STUDY_SERVICES.filter(s => draft.services.includes(s.id)).map(s => s.label).join(', ')}
                </p>
              )}
            </div>
            <Link to="/study" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">
              {isLoggedIn ? 'Reprendre et enregistrer' : 'Reprendre'}
            </Link>
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-gray-600 mt-3">
              <Link to="/login?redirect=%2Fstudy" className="text-secondary underline">Connectez-vous</Link> ou{' '}
              <Link to="/register?redirect=%2Fstudy" className="text-secondary underline">créez un compte</Link>{' '}
              pour le retrouver sur tous vos appareils et envoyer votre demande.
            </p>
          )}
        </div>
      )}

      {!isLoggedIn ? (
        !showDraft && (
          <p className="text-sm text-gray-500">
            Aucun projet sur cet appareil. <Link to="/study" className="text-secondary underline">Commencez votre projet d'études</Link>.
          </p>
        )
      ) : loading ? (
        <p className="text-sm text-gray-500">Chargement de vos projets…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : projects.length === 0 ? (
        !showDraft && (
          <p className="text-sm text-gray-500">
            Aucun projet enregistré. <Link to="/study" className="text-secondary underline">Construisez votre projet d'études</Link>.
          </p>
        )
      ) : (
        <div className="space-y-3">
          {projects.map(({ tripId, title, project, serviceStatus }) => (
            <div key={tripId} className="border border-gray-100 rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <ProjectFacts project={project} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  project.requestSentAt ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {project.requestSentAt ? `Demande envoyée le ${formatDate(project.requestSentAt)}` : 'Enregistré'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {STUDY_SERVICES.filter(s => project.services.includes(s.id)).map(s => {
                  const style = STATUS_STYLE[serviceStatus[s.id]] ?? STATUS_STYLE.pending;
                  return (
                    <span key={s.id} className={`px-2 py-0.5 rounded-full text-xs border ${style.className}`}>
                      {s.label} · {style.label}
                    </span>
                  );
                })}
                {project.services.length === 0 && <span className="text-xs text-gray-400">Aucun service choisi</span>}
              </div>

              {project.offerShortlist.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Offres Ausbildung : {project.offerShortlist.map(o => `${o.employer} (${o.city})`).join(' ; ')}
                </p>
              )}
              {project.shortlist.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Présélection : {project.shortlist.map(u => u.name).join(' ; ')}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm">
                <Link to={`/study?project=${tripId}`} className="text-primary font-medium hover:text-primary/80">Modifier</Link>
                {confirmId === tripId ? (
                  <span className="flex items-center gap-2 text-xs">
                    Supprimer ce projet ?
                    <button type="button" onClick={() => remove(tripId)} disabled={deleting === tripId} className="text-red-600 font-medium">
                      {deleting === tripId ? 'Suppression…' : 'Oui'}
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="text-gray-500">Non</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmId(tripId)} className="text-gray-400 hover:text-red-600 text-xs">Supprimer</button>
                )}
                {project.savedAt && <span className="ml-auto text-xs text-gray-400">Mis à jour le {formatDate(project.savedAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyProjectsPanel;
