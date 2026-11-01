import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { amountOf, bucketOf, FilterSelect, monthsOf, presentBuckets, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Formations servies par le backend (Training).
interface Training {
  id: number;
  provider: string;
  country: string;
  city?: string;
  course: string;
  duration?: string;
  price?: string;
  certification?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  features?: string[];
  image?: string;
  description?: string;
  link?: string;
}

const DURATION_EDGES = [3, 6, 12]; // mois
const PRICE_EDGES = [2000, 5000, 10000];

const TrainingFinder: React.FC = () => {
  const { t, val, duration: durationText, options, countryOptions, country: countryLabel, money, bucketOptions, colon } = useCatalog();
  const [country, setCountry] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: trainings, loading, error } = useApiList<Training>(
    () => apiService.getTrainings({}),
    [],
    { errorMessage: t('common.error') }
  );

  // La liste des cours suit le pays et la catégorie choisis.
  const scoped = useMemo(() => trainings.filter(tr =>
    (!country || tr.country === country) && (!category || tr.category === category)
  ), [trainings, country, category]);
  const filteredTrainings = scoped.filter(tr =>
    (!course || tr.course === course)
    && (!duration || bucketOf(monthsOf(tr.duration), DURATION_EDGES) === duration)
    && (!priceRange || bucketOf(amountOf(tr.price), PRICE_EDGES) === priceRange)
  );

  const monthsLabel = (n: number) => durationText(`${n} months`);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('trainings.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={country}
              onChange={v => { setCountry(v); setCourse(''); }} options={countryOptions(trainings.map(tr => tr.country))} />
            <FilterSelect label={t('common.category')} all={t('common.all_categories')} value={category}
              onChange={v => { setCategory(v); setCourse(''); }} options={options(trainings.filter(tr => !country || tr.country === country).map(tr => tr.category))} />
            <FilterSelect label={t('trainings.course')} all={t('trainings.all_courses')} value={course} onChange={setCourse}
              options={options(scoped.map(tr => tr.course))} />
            <FilterSelect label={t('trainings.duration')} all={t('trainings.all_durations')} value={duration} onChange={setDuration}
              options={bucketOptions(presentBuckets(scoped.map(tr => monthsOf(tr.duration)), DURATION_EDGES), monthsLabel)} />
            <FilterSelect label={t('common.price_range')} all={t('common.all_prices')} value={priceRange} onChange={setPriceRange}
              options={bucketOptions(presentBuckets(scoped.map(tr => amountOf(tr.price)), PRICE_EDGES), n => money(n))} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.length > 0 ? (
            filteredTrainings.map(training => (
              <div key={training.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {training.image && (
                  <div className="relative h-48">
                    <img
                      src={training.image}
                      alt={training.course}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {training.price}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{training.course}</h3>
                      <p className="text-gray-600">{training.provider} — {countryLabel(training.country)}</p>
                    </div>
                    {training.category && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        training.category === 'Healthcare' ? 'bg-blue-100 text-blue-800' :
                        training.category === 'Technology' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {val(training.category)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{training.description}</p>
                  <div className="space-y-2">
                    {!training.image && training.price && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.price'))}</span> {training.price}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('trainings.duration'))}</span> {durationText(training.duration)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('trainings.certification'))}</span> {training.certification}
                    </p>
                    {training.rating != null && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.rating'))}</span> {training.rating}/5 ({t('common.reviews', { count: training.reviews ?? 0 })})
                      </p>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('common.features'))}</span>
                      <ul className="list-disc list-inside mt-1">
                        {(training.features ?? []).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <ActionButton href={training.link} service={`Formation — ${training.provider}`} className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    {t('trainings.enroll')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={trainings.length} service="Formations professionnelles" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default TrainingFinder;
