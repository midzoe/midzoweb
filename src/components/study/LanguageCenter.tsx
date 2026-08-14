import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { isVisaOriginCountry, africanCountryLabel } from '../../data/africanCountries';

/**
 * Story 5.4 → 5.14 : centres de langue servis par le backend.
 *
 * Cible de redirection depuis la vérification d'exigence de langue université
 * (story 5.3) : quand le niveau de l'étudiant est insuffisant, on l'envoie ici avec
 * ?language=&country=&level=&university=. `country` est le pays de l'université, dans
 * le même vocabulaire que le catalogue universités.
 *
 * Le catalogue mêle deux moments : se mettre à niveau **avant le départ** (centres
 * situés dans les pays d'origine du visa) ou **à destination**. Le filtre « Où
 * apprendre » sépare les deux, car ce sont deux décisions différentes.
 */
interface LanguageCenter {
  id: number;
  name: string;
  country: string;
  city?: string | null;
  language: string;
  levels?: string | null;
  link?: string | null;
  description?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  registrationUrl?: string | null;
  image?: string | null;
  levelsOffered?: string[] | null;
  courseTypes?: string[] | null;
  examsPrepared?: string[] | null;
  accreditations?: string[] | null;
  universityPartners?: string[] | null;
  priceFrom?: number | null;
  priceUnit?: string | null;
  currency?: string | null;
  weeklyHours?: number | null;
  classSize?: number | null;
  startDates?: string | null;
  offersVisaSupport: boolean;
  offersAccommodation: boolean;
  offersPathway: boolean;
  isPartner: boolean;
}

interface Facets {
  countries: { name: string; count: number }[];
  cities: string[];
  languages: { name: string; count: number }[];
  levels: string[];
  courseTypes: string[];
  exams: string[];
  total: number;
}

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Pays affichés en français côté étudiant ; la valeur envoyée à l'API reste l'anglais du catalogue. */
const COUNTRY_FR: Record<string, string> = {
  Germany: 'Allemagne', France: 'France', 'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis', Canada: 'Canada', Netherlands: 'Pays-Bas',
  Spain: 'Espagne', Italy: 'Italie', Switzerland: 'Suisse', Sweden: 'Suède',
  Portugal: 'Portugal', China: 'Chine', Belgium: 'Belgique', Luxembourg: 'Luxembourg',
  Morocco: 'Maroc', Senegal: 'Sénégal', Austria: 'Autriche', Ireland: 'Irlande',
};
/** Destination connue, sinon pays d'origine africain, sinon la valeur brute. */
const countryLabel = (c: string) => COUNTRY_FR[c] ?? africanCountryLabel(c);

const formatPrice = (c: LanguageCenter) => {
  if (c.priceFrom == null) return null;
  const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(c.priceFrom);
  const symbol = c.currency === 'EUR' ? '€' : c.currency === 'GBP' ? '£' : c.currency === 'USD' ? '$' : (c.currency ?? '');
  return `dès ${amount} ${symbol}${c.priceUnit ? ` / ${c.priceUnit}` : ''}`;
};

const withProtocol = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

/** Facettes recalculées côté client quand l'endpoint dédié n'est pas disponible. */
const deriveFacets = (list: LanguageCenter[]): Facets => {
  const countries = new Map<string, number>();
  const languages = new Map<string, number>();
  const cities = new Set<string>();
  const levels = new Set<string>();
  const courseTypes = new Set<string>();
  const exams = new Set<string>();

  for (const c of list) {
    countries.set(c.country, (countries.get(c.country) ?? 0) + 1);
    languages.set(c.language, (languages.get(c.language) ?? 0) + 1);
    if (c.city) cities.add(c.city);
    c.levelsOffered?.forEach(l => levels.add(l));
    c.courseTypes?.forEach(t => courseTypes.add(t));
    c.examsPrepared?.forEach(e => exams.add(e));
  }

  const byCount = (m: Map<string, number>) =>
    [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const sorted = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b));

  return {
    countries: byCount(countries),
    cities: sorted(cities),
    languages: byCount(languages),
    levels: sorted(levels),
    courseTypes: sorted(courseTypes),
    exams: sorted(exams),
    total: list.length,
  };
};

/* ── Carte d'un centre ─────────────────────────────────────────────────────── */
const CenterCard: React.FC<{ center: LanguageCenter; highlightLevel?: string }> = ({ center, highlightLevel }) => {
  const [open, setOpen] = useState(false);
  const price = formatPrice(center);
  // Le niveau visé par l'étudiant redirigé : on signale les centres qui le couvrent.
  const coversLevel = !!highlightLevel && (center.levelsOffered ?? []).includes(highlightLevel);

  return (
    <article className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg">
      {center.image && (
        <img src={center.image} alt="" className="h-40 w-full object-cover" loading="lazy" />
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {countryLabel(center.country)}
          </span>
          {center.city && <span className="text-xs text-gray-500">{center.city}</span>}
          {isVisaOriginCountry(center.country) && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              Avant le départ
            </span>
          )}
          {center.isPartner && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Partenaire Midzo
            </span>
          )}
          {coversLevel && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Prépare le niveau {highlightLevel}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-primary">{center.name}</h3>

        <p className="mt-1 text-sm text-gray-500">
          {center.language}
          {center.levels && <> · niveaux {center.levels}</>}
          {center.weeklyHours != null && <> · {center.weeklyHours} h/semaine</>}
        </p>

        {center.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-3">{center.description}</p>
        )}

        {(center.courseTypes?.length || center.examsPrepared?.length) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(center.courseTypes ?? []).map(t => (
              <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{t}</span>
            ))}
            {(center.examsPrepared ?? []).map(e => (
              <span key={e} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600">{e}</span>
            ))}
          </div>
        )}

        {(center.offersVisaSupport || center.offersAccommodation || center.offersPathway) && (
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {center.offersVisaSupport && <li>✓ Lettre d’inscription pour le dossier de visa</li>}
            {center.offersAccommodation && <li>✓ Aide au logement</li>}
            {center.offersPathway && <li>✓ Passerelle vers l’université (année préparatoire)</li>}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {price && <span className="font-semibold text-gray-800">{price}</span>}
          {center.startDates && <span className="text-gray-500">{center.startDates}</span>}
          {center.classSize != null && <span className="text-gray-500">Classes de {center.classSize} max.</span>}
        </div>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="mt-3 self-start text-sm text-primary hover:underline cursor-pointer"
        >
          {open ? 'Masquer les détails' : 'Plus de détails'}
        </button>

        {open && (
          <dl className="mt-3 space-y-1.5 text-sm border-t border-gray-100 pt-3">
            {!!center.levelsOffered?.length && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">Niveaux</dt>
                <dd className="text-gray-700">{center.levelsOffered.join(' · ')}</dd>
              </div>
            )}
            {center.address && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">Adresse</dt>
                <dd className="text-gray-700">{center.address}</dd>
              </div>
            )}
            {center.email && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">E-mail</dt>
                <dd><a href={`mailto:${center.email}`} className="text-primary hover:underline">{center.email}</a></dd>
              </div>
            )}
            {center.phone && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">Téléphone</dt>
                <dd className="text-gray-700">{center.phone}</dd>
              </div>
            )}
            {!!center.accreditations?.length && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">Accréditations</dt>
                <dd className="text-gray-700">{center.accreditations.join(', ')}</dd>
              </div>
            )}
            {!!center.universityPartners?.length && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-gray-400">Universités partenaires</dt>
                <dd className="text-gray-700">{center.universityPartners.join(', ')}</dd>
              </div>
            )}
            {price && (
              <p className="pt-1 text-xs text-gray-400">
                Tarif indicatif : confirmez le prix exact auprès du centre avant de vous inscrire.
              </p>
            )}
          </dl>
        )}

        <div className="mt-5 flex gap-2">
          {center.registrationUrl && (
            <a
              href={withProtocol(center.registrationUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-center text-sm font-medium"
            >
              S’inscrire
            </a>
          )}
          {center.link && (
            <a
              href={withProtocol(center.link)}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2 px-4 rounded-md text-center text-sm font-medium transition-colors ${
                center.registrationUrl
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'flex-1 bg-primary text-white hover:bg-primary/90'
              }`}
            >
              Site du centre
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

const LanguageCenterPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Contexte de redirection (niveau insuffisant) — optionnel.
  const redirectLanguage = searchParams.get('language') ?? '';
  const redirectLevel = searchParams.get('level') ?? '';
  const redirectUniversity = searchParams.get('university') ?? '';
  const redirectCountry = searchParams.get('country') ?? '';
  const cameFromCheck = !!(redirectLanguage || redirectUniversity);

  const [country, setCountry] = useState(redirectCountry);
  /** Où apprendre : partout, avant le départ (pays d'origine), ou à destination. */
  const [scope, setScope] = useState<'all' | 'origin' | 'study'>('all');
  const [language, setLanguage] = useState(redirectLanguage);
  const [city, setCity] = useState('');
  const [level, setLevel] = useState(redirectLevel);
  const [courseType, setCourseType] = useState('');
  const [exam, setExam] = useState('');
  const [onlyPartners, setOnlyPartners] = useState(false);
  const [query, setQuery] = useState('');

  const [centers, setCenters] = useState<LanguageCenter[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiService.getLanguageCenters({
        ...(language && { language }),
        ...(country && { country }),
        ...(city && { city }),
        ...(level && { level }),
        ...(courseType && { course_type: courseType }),
        ...(exam && { exam }),
        ...(onlyPartners && { partners: true }),
        ...(query.trim() && { q: query.trim() }),
      });
      setCenters(res.data ?? []);
    } catch (err) {
      console.error('Error loading language centers:', err);
      setError('Impossible de charger les centres de langue. Réessayez dans un instant.');
    } finally {
      setLoading(false);
    }
  }, [language, country, city, level, courseType, exam, onlyPartners, query]);

  // Recherche texte : on laisse retomber la frappe avant d'interroger l'API.
  useEffect(() => {
    const t = setTimeout(load, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  useEffect(() => {
    apiService.getLanguageCenterFacets()
      .then(res => setFacets(res.data ?? null))
      .catch(async () => {
        // Backend pas encore redéployé avec la route /facets : on reconstruit les
        // valeurs de filtre depuis le catalogue complet plutôt que d'afficher des
        // listes vides.
        try {
          const res = await apiService.getLanguageCenters();
          setFacets(deriveFacets(res.data ?? []));
        } catch {
          setFacets(null);
        }
      });
  }, []);

  /**
   * « Où apprendre » se joue côté client : l'API ne connaît pas la notion de pays de
   * départ, mais le pays de chaque fiche suffit à trancher.
   */
  const visibleCenters = useMemo(() => {
    if (scope === 'all') return centers;
    return centers.filter(c => isVisaOriginCountry(c.country) === (scope === 'origin'));
  }, [centers, scope]);

  /** Pays des facettes séparés en deux groupes, pour un sélecteur qui raconte le parcours. */
  const countryGroups = useMemo(() => {
    const all = facets?.countries ?? [];
    return {
      origin: all.filter(c => isVisaOriginCountry(c.name)),
      study: all.filter(c => !isVisaOriginCountry(c.name)),
    };
  }, [facets]);

  /** Villes proposées : celles du pays choisi si on en connaît, sinon toutes. */
  const cityOptions = useMemo(() => {
    if (!facets) return [];
    if (!country) return facets.cities;
    const inCountry = centers.filter(c => c.country === country).map(c => c.city).filter(Boolean) as string[];
    return [...new Set(inCountry.length ? inCountry : facets.cities)].sort((a, b) => a.localeCompare(b));
  }, [facets, country, centers]);

  const levelOptions = useMemo(() => {
    const fromFacets = facets?.levels ?? [];
    return fromFacets.length ? fromFacets : CEFR;
  }, [facets]);

  const activeFilters = [country, language, city, level, courseType, exam, query.trim()].filter(Boolean).length
    + (onlyPartners ? 1 : 0) + (scope !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setCountry(''); setLanguage(''); setCity(''); setLevel('');
    setCourseType(''); setExam(''); setOnlyPartners(false); setQuery(''); setScope('all');
  };

  const selectCls = 'w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary focus:border-primary';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Centres de langue</h1>
        <p className="text-gray-600 mb-8">
          Préparez le niveau exigé par votre université : cours, certifications, tarifs et contacts.
        </p>

        {/* Bannière de redirection : niveau de langue insuffisant (story 5.3 → 5.8) */}
        {cameFromCheck && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6">
            <p className="text-amber-800 font-medium">
              {redirectUniversity
                ? `Votre niveau de langue n'atteint pas encore l'exigence de « ${redirectUniversity} ».`
                : 'Votre niveau de langue est insuffisant pour cette université.'}
            </p>
            <p className="text-amber-700 text-sm mt-1">
              {redirectLanguage && `Langue requise : ${redirectLanguage}${redirectLevel ? ` (niveau ${redirectLevel})` : ''}. `}
              Voici les centres qui vous mettent à niveau
              {redirectCountry ? ` en ${countryLabel(redirectCountry)}` : ''}.
            </p>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un centre, une ville…"
            aria-label="Rechercher un centre de langue"
            className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary focus:border-primary mb-4"
          />

          {/* Où apprendre : se mettre à niveau au pays, ou une fois arrivé. */}
          {countryGroups.origin.length > 0 && (
            <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Où apprendre">
              {([
                ['all', 'Partout'],
                ['origin', 'Avant le départ'],
                ['study', 'À destination'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setScope(value); setCountry(''); setCity(''); }}
                  aria-pressed={scope === value}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    scope === value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lc-country" className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
              <select id="lc-country" value={country} onChange={e => { setCountry(e.target.value); setCity(''); }} className={selectCls}>
                <option value="">Tous les pays</option>
                {scope !== 'origin' && countryGroups.study.map(c => (
                  <option key={c.name} value={c.name}>{countryLabel(c.name)} ({c.count})</option>
                ))}
                {scope !== 'study' && countryGroups.origin.length > 0 && (
                  <optgroup label="Avant le départ">
                    {countryGroups.origin.map(c => (
                      <option key={c.name} value={c.name}>{countryLabel(c.name)} ({c.count})</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="lc-language" className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
              <select id="lc-language" value={language} onChange={e => setLanguage(e.target.value)} className={selectCls}>
                <option value="">Toutes les langues</option>
                {(facets?.languages ?? []).map(l => (
                  <option key={l.name} value={l.name}>{l.name} ({l.count})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lc-city" className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <select id="lc-city" value={city} onChange={e => setCity(e.target.value)} className={selectCls}>
                <option value="">Toutes les villes</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="lc-level" className="block text-sm font-medium text-gray-700 mb-1.5">Niveau visé</label>
              <select id="lc-level" value={level} onChange={e => setLevel(e.target.value)} className={selectCls}>
                <option value="">Tous les niveaux</option>
                {levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="lc-format" className="block text-sm font-medium text-gray-700 mb-1.5">Format</label>
              <select id="lc-format" value={courseType} onChange={e => setCourseType(e.target.value)} className={selectCls}>
                <option value="">Tous les formats</option>
                {(facets?.courseTypes ?? []).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="lc-exam" className="block text-sm font-medium text-gray-700 mb-1.5">Examen préparé</label>
              <select id="lc-exam" value={exam} onChange={e => setExam(e.target.value)} className={selectCls}>
                <option value="">Tous les examens</option>
                {(facets?.exams ?? []).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={onlyPartners} onChange={e => setOnlyPartners(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Partenaires Midzo uniquement
            </label>
            {activeFilters > 0 && (
              <button type="button" onClick={resetFilters} className="text-sm text-primary hover:underline cursor-pointer">
                Réinitialiser les filtres ({activeFilters})
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Chargement des centres de langue…</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {visibleCenters.length} centre{visibleCenters.length > 1 ? 's' : ''} trouvé{visibleCenters.length > 1 ? 's' : ''}
              {facets && visibleCenters.length !== facets.total && <span className="text-gray-400"> sur {facets.total}</span>}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCenters.length > 0 ? (
                visibleCenters.map(center => (
                  <CenterCard key={center.id} center={center} highlightLevel={redirectLevel || level} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Aucun centre ne correspond à ces critères.
                  </p>
                  {activeFilters > 0 && (
                    <button type="button" onClick={resetFilters} className="mt-3 text-primary hover:underline cursor-pointer">
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageCenterPage;
