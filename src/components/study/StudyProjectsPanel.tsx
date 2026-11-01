import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  SavedStudyProject, StudyProject, STUDY_SERVICES,
  deleteAccountProject, domainLabels, levelLabel, projectTitle, syncedDestinations,
} from './studyProject';
import { snapshotLabel } from '../../pricing/priceChoice';

// Dashboard : projets d'études enregistrés dans le compte, et brouillon resté sur
// l'appareil (parcours sans compte, ou projet pas encore enregistré).

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending: { label: 'projects.status_pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  done: { label: 'projects.status_done', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
};

const ProjectFacts: React.FC<{ project: StudyProject }> = ({ project }) => {
  const { t } = useTranslation('ui');
  const st = (key: string, fallback: string) => t(`study:${key}`, { defaultValue: fallback });
  return (
    <p className="text-xs text-gray-500 mt-1">
      {[
        project.level && st(`level.${project.level}.label`, levelLabel(project.level)),
        [...project.domains.map(id => st(`domain.${id}`, domainLabels([id])[0] ?? id)), project.fieldQuery].filter(Boolean).join(', '),
        syncedDestinations(project).flatMap(d => d.cities).join(', '),
        project.startMonth && t('projects.start', { month: project.startMonth }),
      ].filter(Boolean).join(' · ') || t('projects.incomplete')}
    </p>
  );
};

interface Props {
  isLoggedIn: boolean;
  projects: SavedStudyProject[];
  loading: boolean;
  error: string;
  draft: StudyProject | null;
  onChanged: () => void;
}

const StudyProjectsPanel: React.FC<Props> = ({ isLoggedIn, projects, loading, error, draft, onChanged }) => {
  const { t } = useTranslation('ui');
  const serviceLabel = (s: { id: string; label: string }) => t(`study:service.${s.id}.label`, { defaultValue: s.label });
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
        <h2 className="text-base font-semibold text-gray-900">🎓 {t('projects.title')}</h2>
        <Link to="/study" className="text-sm text-primary hover:text-primary/80 font-medium">+ {t('projects.new')}</Link>
      </div>

      {showDraft && draft && (
        <div className="border border-dashed border-amber-300 bg-amber-50/60 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {draft.tripId ? t('study:status.unsaved') : t('study:status.draft')}
              </p>
              <h3 className="font-semibold text-gray-900 text-sm mt-1">{projectTitle(draft)}</h3>
              <ProjectFacts project={draft} />
              {draft.services.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {t('projects.services')} : {STUDY_SERVICES.filter(s => draft.services.includes(s.id)).map(serviceLabel).join(', ')}
                </p>
              )}
            </div>
            <Link to="/study" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">
              {isLoggedIn ? t('projects.resume_save') : t('projects.resume')}
            </Link>
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-gray-600 mt-3">
              <Link to="/login?redirect=%2Fstudy" className="text-secondary underline">{t('projects.login')}</Link> {t('projects.or')}{' '}
              <Link to="/register?redirect=%2Fstudy" className="text-secondary underline">{t('projects.register')}</Link>{' '}
              {t('projects.keep_everywhere')}
            </p>
          )}
        </div>
      )}

      {!isLoggedIn ? (
        !showDraft && (
          <p className="text-sm text-gray-500">
            {t('projects.none_device')} <Link to="/study" className="text-secondary underline">{t('projects.start_project')}</Link>.
          </p>
        )
      ) : loading ? (
        <p className="text-sm text-gray-500">{t('projects.loading')}</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : projects.length === 0 ? (
        !showDraft && (
          <p className="text-sm text-gray-500">
            {t('projects.none_saved')} <Link to="/study" className="text-secondary underline">{t('study:hero.title')}</Link>.
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
                  {project.requestSentAt ? t('projects.sent_on', { date: formatDate(project.requestSentAt) }) : t('projects.saved')}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {STUDY_SERVICES.filter(s => project.services.includes(s.id)).map(s => {
                  const style = STATUS_STYLE[serviceStatus[s.id]] ?? STATUS_STYLE.pending;
                  return (
                    <span key={s.id} className={`px-2 py-0.5 rounded-full text-xs border ${style.className}`}>
                      {serviceLabel(s)} · {t(style.label)}
                    </span>
                  );
                })}
                {project.services.length === 0 && <span className="text-xs text-gray-400">{t('projects.no_service')}</span>}
              </div>

              <p className="text-xs text-gray-600 mt-2" data-testid="project-package">
                {t('projects.offer')} : {project.price.snapshot ? snapshotLabel(project.price.snapshot, k => t(`study:${k}`)) : <span className="text-gray-400">{t('projects.tbd')}</span>}
              </p>
              {project.offerShortlist.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {t('projects.ausbildung')} : {project.offerShortlist.map(o => `${o.employer} (${o.city})`).join(' ; ')}
                </p>
              )}
              {project.shortlist.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {t('projects.shortlist')} : {project.shortlist.map(u => u.name).join(' ; ')}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm">
                <Link to={`/study?project=${tripId}`} className="text-primary font-medium hover:text-primary/80">{t('projects.edit')}</Link>
                {confirmId === tripId ? (
                  <span className="flex items-center gap-2 text-xs">
                    {t('projects.delete_confirm')}
                    <button type="button" onClick={() => remove(tripId)} disabled={deleting === tripId} className="text-red-600 font-medium">
                      {deleting === tripId ? t('projects.deleting') : t('projects.yes')}
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="text-gray-500">{t('projects.no')}</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmId(tripId)} className="text-gray-400 hover:text-red-600 text-xs">{t('projects.delete')}</button>
                )}
                {project.savedAt && <span className="ml-auto text-xs text-gray-400">{t('projects.updated_on', { date: formatDate(project.savedAt) })}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyProjectsPanel;
