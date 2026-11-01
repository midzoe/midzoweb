
import React, { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS, fr } from 'date-fns/locale';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Offres d'emploi servies par le backend (Job).
interface Job {
  id: number;
  title: string;
  company: string;
  country: string;
  city?: string;
  location: string;
  type: string;
  salary?: string;
  experience?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  applyUrl?: string;
  image?: string;
  postedAt?: string;
}

const DATE_LOCALES = { fr, de, en: enUS };

/** « il y a 2 jours » à partir de la date de publication renvoyée par l'API. */
const postedLabel = (postedAt: string | undefined, lang: string) => {
  if (!postedAt) return '';
  const date = new Date(postedAt);
  return isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true, locale: DATE_LOCALES[lang as keyof typeof DATE_LOCALES] ?? fr });
};

const JobsFinder: React.FC = () => {
  const { t, lang, val, duration, options, countryOptions, colon } = useCatalog();
  const [location, setLocation] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: jobs, loading, error } = useApiList<Job>(
    () => apiService.getJobs({}),
    [],
    { errorMessage: t('common.error') }
  );

  const filteredJobs = useMemo(() => jobs.filter(j =>
    (!location || j.country === location) && (!jobType || j.type === jobType) && (!experience || j.experience === experience)
  ), [jobs, location, jobType, experience]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('jobs.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={location} onChange={setLocation}
              options={countryOptions(jobs.map(j => j.country))} />
            <FilterSelect label={t('jobs.job_type')} all={t('common.all_types')} value={jobType} onChange={setJobType}
              options={options(jobs.map(j => j.type))} />
            <FilterSelect label={t('jobs.experience')} all={t('jobs.all_levels')} value={experience} onChange={setExperience}
              options={options(jobs.map(j => j.experience), v => (v === 'Entry Level' ? val(v) : duration(v)))} />
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                    {job.postedAt && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {postedLabel(job.postedAt, lang)}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('jobs.location'))}</span> {job.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('jobs.job_type'))}</span> {val(job.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('jobs.salary'))}</span> {job.salary}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{colon(t('jobs.experience'))}</span> {job.experience === 'Entry Level' ? val(job.experience) : duration(job.experience)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.requirements')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(job.requirements ?? []).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('jobs.benefits')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(job.benefits ?? []).map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <ActionButton href={job.applyUrl} service={`Candidature — ${job.title} (${job.company})`} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                      {t('jobs.apply')}
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CatalogEmpty total={jobs.length} service="Offres d’emploi" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default JobsFinder;
