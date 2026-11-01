import React, { useMemo, useState } from 'react';
import { useApiList } from '../hooks/useApiList';
import { apiService } from '../services/api';
import ActionButton from './common/ActionButton';
import { amountOf, bucketOf, FilterSelect, presentBuckets, useCatalog, CatalogEmpty } from './common/catalogKit';

// Offres d'assurance servies par le backend (InsurancePlan, audience = "general").
interface InsurancePlan {
  id: number;
  provider: string;
  country: string;
  coverageTypes?: string[];
  benefits?: string[];
  insuranceTypes?: string[];
  monthlyPremium?: string;
  coverage?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
}

const PRICE_EDGES = [30, 50, 100];

const Insurance: React.FC = () => {
  const { t, val, options, countryOptions, money, bucketOptions, colon } = useCatalog();
  const [country, setCountry] = useState<string>("");
  const [insuranceType, setInsuranceType] = useState<string>("");
  const [coverageType, setCoverageType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: plans, loading, error } = useApiList<InsurancePlan>(
    () => apiService.getInsurancePlans({ audience: 'general' }),
    [],
    { errorMessage: t('common.error') }
  );

  const filteredInsurances = useMemo(() => plans.filter(p =>
    (!country || p.country === country)
    && (!insuranceType || (p.insuranceTypes ?? []).includes(insuranceType))
    && (!coverageType || (p.coverageTypes ?? []).includes(coverageType))
    && (!priceRange || bucketOf(amountOf(p.monthlyPremium), PRICE_EDGES) === priceRange)
  ), [plans, country, insuranceType, coverageType, priceRange]);

  const perMonth = (premium: string) => `${premium} ${t('common.per_month')}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('insurance.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={country} onChange={setCountry}
              options={countryOptions(plans.map(p => p.country))} />
            <FilterSelect label={t('insurance.insurance_type')} all={t('insurance.all_insurance_types')} value={insuranceType} onChange={setInsuranceType}
              options={options(plans.flatMap(p => p.insuranceTypes ?? []))} />
            <FilterSelect label={t('insurance.coverage_type')} all={t('insurance.all_coverages')} value={coverageType} onChange={setCoverageType}
              options={options(plans.flatMap(p => p.coverageTypes ?? []))} />
            <FilterSelect label={t('insurance.monthly_premium')} all={t('common.all_prices')} value={priceRange} onChange={setPriceRange}
              options={bucketOptions(presentBuckets(plans.map(p => amountOf(p.monthlyPremium)), PRICE_EDGES), n => money(n))} />
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
          {filteredInsurances.length > 0 ? (
            filteredInsurances.map(insurance => (
              <div key={insurance.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {insurance.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={insurance.image}
                      alt={insurance.provider}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {insurance.monthlyPremium && (
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                        {perMonth(insurance.monthlyPremium)}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary">{insurance.provider}</h3>
                    {insurance.rating != null && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">
                          {insurance.rating} ({t('common.reviews', { count: insurance.reviews ?? 0 })})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{insurance.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(insurance.insuranceTypes ?? []).map((type, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {val(type)}
                        </span>
                      ))}
                    </div>
                    {!insurance.image && insurance.monthlyPremium && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('insurance.monthly_premium'))}</span>{" "}
                        {perMonth(insurance.monthlyPremium)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('insurance.coverage_amount'))}</span>{" "}
                      {insurance.coverage}
                    </p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('insurance.coverage_types'))}</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {(insurance.coverageTypes ?? []).map((type, idx) => (
                          <li key={idx}>{val(type)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('insurance.benefits'))}</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {(insurance.benefits ?? []).map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <ActionButton href={(insurance as any).link} service={`Assurance — ${insurance.provider}`} className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    {t('insurance.quote')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={plans.length} service="Assurance" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Insurance;
