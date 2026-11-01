import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { bucketOf, FilterSelect, monthsOf, presentBuckets, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Prestataires de légalisation servis par le backend
// (ServiceProvider, serviceType = "legalization").
interface LegalizationService {
  id: number;
  provider: string;
  country: string;
  services?: string[];
  processingTime?: string;
  price?: string;
  requirements?: string[];
  features?: string[];
  successRate?: string;
  documentTypes?: string[];
}

// Délais ramenés en semaines : moins de 2, 2 à 4, plus de 4.
const WEEK_EDGES = [2, 4];
const weeksOf = (text?: string) => {
  const months = monthsOf(text);
  return months == null ? null : Math.round(months * 4.3 * 10) / 10;
};

const DocumentLegalization: React.FC = () => {
  const { t, val, duration, options, countryOptions, country: countryLabel, bucketOptions, colon } = useCatalog();
  const [country, setCountry] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: providers, loading, error } = useApiList<LegalizationService>(
    () => apiService.getServiceProviders({ type: 'legalization' }),
    [],
    { errorMessage: t('common.error') }
  );

  const inCountry = useMemo(() => providers.filter(p => !country || p.country === country), [providers, country]);
  const filteredServices = inCountry.filter(p =>
    (!documentType || (p.documentTypes ?? []).includes(documentType))
    && (!service || (p.services ?? []).includes(service))
    && (!processingTime || bucketOf(weeksOf(p.processingTime), WEEK_EDGES) === processingTime)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('pro_docs.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={country}
              onChange={v => { setCountry(v); setDocumentType(''); setService(''); }} options={countryOptions(providers.map(p => p.country))} />
            <FilterSelect label={t('common.document_type')} all={t('common.all_documents')} value={documentType} onChange={setDocumentType}
              options={options(inCountry.flatMap(p => p.documentTypes ?? []))} />
            <FilterSelect label={t('common.services')} all={t('common.all_services')} value={service} onChange={setService}
              options={options(inCountry.flatMap(p => p.services ?? []))} />
            <FilterSelect label={t('common.processing_time')} all={t('common.all_processing_times')} value={processingTime} onChange={setProcessingTime}
              options={bucketOptions(presentBuckets(inCountry.map(p => weeksOf(p.processingTime)), WEEK_EDGES), n => duration(`${n} weeks`))} />
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
          {filteredServices.length > 0 ? (
            filteredServices.map(provider => (
              <div key={provider.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{provider.provider}</h3>
                      <p className="text-gray-600">{countryLabel(provider.country)}</p>
                    </div>
                    {provider.successRate && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {t('common.success_rate', { rate: provider.successRate })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {(provider.services ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.services')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(provider.services ?? []).map((type, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {val(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(provider.documentTypes ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.document_type')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(provider.documentTypes ?? []).map((doc, idx) => (
                            <li key={idx}>{val(doc)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(provider.features ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.features')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(provider.features ?? []).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(provider.requirements ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.requirements')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(provider.requirements ?? []).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.processing_time'))}</span> {duration(provider.processingTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.price'))}</span> {provider.price}
                      </p>
                    </div>
                  </div>

                  <ActionButton href={(provider as any).link} service={`Légalisation de documents — ${provider.provider}`} className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    {t('pro_docs.start')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={providers.length} service="Légalisation de documents professionnels" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLegalization;
