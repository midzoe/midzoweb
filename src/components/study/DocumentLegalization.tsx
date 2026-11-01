import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Prestataires de légalisation ET de reconnaissance, servis par le backend
// (ServiceProvider, serviceType = "legalization" | "recognition").
interface DocumentService {
  id: number;
  provider: string;
  country: string;
  serviceType: string;
  services?: string[];
  documentTypes?: string[];
  processingTime?: string;
  price?: string;
  rating?: number;
  requirements?: string[];
}

const DocumentServices: React.FC = () => {
  const { t, val, duration, options, countryOptions, country, colon } = useCatalog();
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [serviceType, setServiceType] = useState<'legalization' | 'recognition' | 'all'>('all');

  // Les deux familles sont chargées explicitement : sans filtre, l'API ramènerait aussi les
  // prestataires de visa travail, qui n'ont rien à faire sur cette page.
  const { items: providers, loading, error } = useApiList<DocumentService>(
    () =>
      Promise.all([
        apiService.getServiceProviders({ type: 'legalization' }),
        apiService.getServiceProviders({ type: 'recognition' }),
      ]).then(([legalization, recognition]) => ({
        data: [...(legalization.data ?? []), ...(recognition.data ?? [])],
      })),
    [],
    { errorMessage: t('common.error') }
  );

  const ofType = useMemo(
    () => providers.filter(p => serviceType === 'all' || p.serviceType === serviceType),
    [providers, serviceType]
  );
  const filteredServices = ofType.filter(p =>
    (!destinationCountry || p.country === destinationCountry)
    && (!documentType || (p.documentTypes ?? []).includes(documentType))
  );

  // Cliquer sur la carte déjà choisie revient à « toutes les prestations ».
  const chooseType = (type: 'legalization' | 'recognition') => {
    setServiceType(current => (current === type ? 'all' : type));
    setDocumentType('');
  };

  const steps = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('docs.title')}</h1>

        {/* Service Type Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('docs.choose_type')}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('docs.choose_hint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['legalization', 'recognition'] as const).map(type => (
              <button
                type="button"
                key={type}
                aria-pressed={serviceType === type}
                className={`text-left p-6 rounded-lg border-2 transition-all ${
                  serviceType === type
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => chooseType(type)}
              >
                <h3 className="text-lg font-semibold mb-2">{t(`docs.${type}`)}</h3>
                <p className="text-gray-600 text-sm">{t(`docs.${type}_text`)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterSelect label={t('common.destination_country')} all={t('common.all_countries')} value={destinationCountry} onChange={setDestinationCountry}
              options={countryOptions(ofType.map(p => p.country))} />
            <FilterSelect label={t('common.document_type')} all={t('common.all_documents')} value={documentType} onChange={setDocumentType}
              options={options(ofType.flatMap(p => p.documentTypes ?? []))} />
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
            filteredServices.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary">{service.provider}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.serviceType === 'legalization'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {service.serviceType === 'legalization' ? t('docs.badge_legalization') : t('docs.recognition')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{country(service.country)}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('common.services'))}</span>{" "}
                      {(service.services ?? []).map(s => val(s)).join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('common.processing_time'))}</span>{" "}
                      {duration(service.processingTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('common.price'))}</span>{" "}
                      {service.price}
                    </p>
                    {service.rating != null && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.rating'))}</span>{" "}
                        {service.rating}/5
                      </p>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{colon(t('common.requirements'))}</span>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {(service.requirements ?? []).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <ActionButton href={(service as any).link} service={`Légalisation de documents — ${service.provider}`} className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    {t('docs.get_started')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={providers.length} service="Légalisation et reconnaissance de documents" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}

        {/* Information Sections */}
        <div className="space-y-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('docs.process_title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('docs.legal_steps_title')}</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  {steps('docs.legal_steps').map(step => <li key={step}>{step}</li>)}
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('docs.recog_steps_title')}</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  {steps('docs.recog_steps').map(step => <li key={step}>{step}</li>)}
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t('docs.info_title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('docs.times_title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {steps('docs.times').map(line => <li key={line}>{line}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('docs.docs_title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {steps('docs.docs').map(line => <li key={line}>{line}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentServices;
