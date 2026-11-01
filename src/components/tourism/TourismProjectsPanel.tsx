import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServiceName } from '../../pricing/PricingStep';
import { SavedTourismProject, TourismProject, TOURISM_SERVICES, deleteTourismProject, tourismTitle, itineraryText } from './tourismProject';
import { snapshotLabel } from '../../pricing/priceChoice';

// Dashboard : voyages composés dans « Composer mon voyage » (compte et brouillon de l'appareil).

const facts = (p: TourismProject, travelers: string) =>
  [p.stops.length > 1 ? itineraryText(p) : p.cities.join(', '), p.startDate && `${p.startDate}${p.endDate ? ` → ${p.endDate}` : ''}`, travelers]
    .filter(Boolean).join(' · ');

interface Props {
  isLoggedIn: boolean;
  projects: SavedTourismProject[];
  loading: boolean;
  draft: TourismProject | null;
  onChanged: () => void;
}

const TourismProjectsPanel: React.FC<Props> = ({ isLoggedIn, projects, loading, draft, onChanged }) => {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const { t } = useTranslation('ui');
  const serviceName = useServiceName();
  const factsOf = (p: TourismProject) => facts(p, t('tp.travelers', { count: p.travelers }));
  const savedIds = new Set(projects.map(p => p.tripId));
  const showDraft = Boolean(draft && draft.destination &&
    (!draft.tripId || !savedIds.has(draft.tripId) || (draft.updatedAt && draft.savedAt && draft.updatedAt > draft.savedAt)));

  if (!showDraft && !loading && projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-testid="tourism-projects">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">🌍 {t('trips.mine')}</h2>
          <Link to="/tourism/plan" className="text-sm text-orange-600 font-medium">+ {t('tp.compose')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-testid="tourism-projects">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">🌍 {t('trips.mine')}</h2>
        <Link to="/tourism/plan" className="text-sm text-orange-600 font-medium">+ {t('tp.compose')}</Link>
      </div>

      {showDraft && draft && (
        <div className="border border-dashed border-orange-300 bg-orange-50/60 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            {draft.tripId ? t('study:status.unsaved') : t('study:status.draft')}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm mt-1">{tourismTitle(draft)}</h3>
          <p className="text-xs text-gray-500 mt-1">{factsOf(draft)}</p>
          <Link to="/tourism/plan" className="inline-block mt-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium">
            {isLoggedIn ? t('projects.resume_save') : t('projects.resume')}
          </Link>
        </div>
      )}

      {loading ? <p className="text-sm text-gray-500">{t('trips.loading')}</p> : (
        <div className="space-y-3">
          {projects.map(({ tripId, title, project, serviceStatus }) => (
            <div key={tripId} className="border border-gray-100 rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{factsOf(project)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.requestSentAt ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {project.requestSentAt ? t('study:status.sent') : t('projects.saved')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {TOURISM_SERVICES.filter(s => project.services.includes(s.id)).map(s => (
                  <span key={s.id} className="px-2 py-0.5 rounded-full text-xs border bg-amber-50 text-amber-700 border-amber-200">
                    {serviceName({ code: s.id, name: s.label })} · {serviceStatus[s.id] === 'done' ? t('projects.status_done') : t('projects.status_pending')}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2" data-testid="trip-offer">
                {t('projects.offer')} : {project.price.snapshot ? snapshotLabel(project.price.snapshot, k => t(`study:${k}`)) : <span className="text-gray-400">{t('projects.tbd')}</span>}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <Link to={`/tourism/plan?project=${tripId}`} className="text-orange-600 font-medium">{t('projects.edit')}</Link>
                {confirmId === tripId ? (
                  <span className="flex items-center gap-2 text-xs">
                    {t('tp.delete_confirm')}
                    <button type="button" onClick={async () => { await deleteTourismProject(tripId); setConfirmId(null); onChanged(); }} className="text-red-600 font-medium">{t('projects.yes')}</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="text-gray-500">{t('projects.no')}</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmId(tripId)} className="text-gray-400 hover:text-red-600 text-xs">{t('projects.delete')}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourismProjectsPanel;
