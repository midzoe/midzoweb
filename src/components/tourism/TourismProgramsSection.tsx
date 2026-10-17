import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

// Story 6.1/6.5 : section réutilisable affichant les programmes tourisme réels (backend),
// filtrés par sous-catégorie (safari/sport). Injectée dans SafariAfrica et SportsTourism.
interface TourismProgram {
  id: number;
  title: string;
  subcategory: string;
  country: string;
  city?: string;
  description?: string;
  itinerary?: string;
  transport?: string;
  price?: number;
  currency?: string;
  images?: string[];
}

const TourismProgramsSection: React.FC<{ subcategory: string; heading?: string }> = ({ subcategory, heading }) => {
  const [programs, setPrograms] = useState<TourismProgram[]>([]);

  useEffect(() => {
    apiService.getTourismPrograms(subcategory)
      .then(res => setPrograms(res.data ?? []))
      .catch(() => {});
  }, [subcategory]);

  if (programs.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{heading ?? 'Programs'}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map(p => {
          const cover = p.images && p.images.length > 0 ? p.images[0] : null;
          return (
            <div key={p.id} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              {cover && (
                <div className="h-40 overflow-hidden">
                  <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{[p.city, p.country].filter(Boolean).join(', ')}</p>
                {p.description && <p className="text-slate-700 text-sm mb-3 font-light">{p.description}</p>}
                <div className="mt-auto space-y-1 text-sm text-slate-600">
                  {p.itinerary && <p><span className="font-medium">Itinerary:</span> {p.itinerary}</p>}
                  {p.transport && <p><span className="font-medium">Transport:</span> {p.transport}</p>}
                  {p.price != null && <p><span className="font-medium">From:</span> {p.price} {p.currency ?? 'EUR'}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TourismProgramsSection;
