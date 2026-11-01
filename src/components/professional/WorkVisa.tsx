import React, { useMemo, useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Prestataires de visa travail servis par le backend
// (ServiceProvider, serviceType = "work_visa").
interface VisaService {
  id: number;
  provider: string;
  country: string;
  visaTypes?: string[];
  processingTime?: string;
  price?: string;
  requirements?: string[];
  features?: string[];
  successRate?: string;
}

const WorkVisa: React.FC = () => {
  const { t, val, duration, options, countryOptions, country: countryLabel, colon } = useCatalog();
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [visaType, setVisaType] = useState<string>("");

  // Tout le catalogue est chargé une fois : les menus ne proposent que ce qui existe.
  const { items: services, loading, error } = useApiList<VisaService>(
    () => apiService.getServiceProviders({ type: 'work_visa' }),
    [],
    { errorMessage: t('common.error') }
  );

  const inCountry = useMemo(() => services.filter(s => !destinationCountry || s.country === destinationCountry), [services, destinationCountry]);
  const filteredServices = visaType ? inCountry.filter(s => (s.visaTypes ?? []).includes(visaType)) : inCountry;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('work_visa.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterSelect label={t('common.destination_country')} all={t('common.all_countries')} value={destinationCountry}
              onChange={v => { setDestinationCountry(v); setVisaType(''); }} options={countryOptions(services.map(s => s.country))} />
            <FilterSelect label={t('work_visa.visa_type')} all={t('work_visa.all_visa_types')} value={visaType} onChange={setVisaType}
              options={options(inCountry.flatMap(s => s.visaTypes ?? []))} />
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
                    <div>
                      <h3 className="text-xl font-bold text-primary">{service.provider}</h3>
                      <p className="text-gray-600">{countryLabel(service.country)}</p>
                    </div>
                    {service.successRate && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {t('common.success_rate', { rate: service.successRate })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {(service.visaTypes ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('work_visa.visa_type')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(service.visaTypes ?? []).map((type, idx) => (
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

                    {(service.requirements ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.requirements')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(service.requirements ?? []).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(service.features ?? []).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('common.features')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(service.features ?? []).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.processing_time'))}</span> {duration(service.processingTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{colon(t('common.price'))}</span> {service.price}
                      </p>
                    </div>
                  </div>

                  <ActionButton href={(service as any).link} service={`Visa de travail — ${service.provider}`} className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    {t('work_visa.start')}
                  </ActionButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <CatalogEmpty total={services.length} service="Visa de travail" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default WorkVisa;
