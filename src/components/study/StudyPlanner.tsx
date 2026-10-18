import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { AFRICAN_COUNTRIES, CountryOption } from '../../data/africanCountries';
import {
  DOMAINS, FORMATS, LEVELS, STUDY_SERVICES, TEACHING_LANGUAGES,
  StudyProject, University, UniversityMatch, VocationalOffer, projectCodes,
  cityKey, cityMatches, clearDraft, emptyProject, fold, levelLabel, loadAccountProject,
  loadDraft, matchUniversities, projectSummary, projectTitle, saveDraft, saveProjectToAccount,
} from './studyProject';
import { COUNTRY_GUIDES, levelGuide } from './studyGuides';
import { Chip, InfoCard, LinkList, Section, externalHref, fieldClass, toggle } from '../projects/plannerUi';
import { usePricing } from '../../pricing/usePricing';
import PricingStep from '../../pricing/PricingStep';
import { goToCheckout } from '../../pricing/checkout';
import { computeSnapshot, snapshotLabel } from '../../pricing/priceChoice';
import { formatEuros, quoteSelection } from '../../pricing/pricingEngine';

// Parcours « MIDZOE Study » : profil → projet → ce que dit le catalogue → services
// → enregistrement (brouillon local sans compte, trip avec compte) → demande.

interface StudyCountry {
  id: number;
  name: string;
  nameFr?: string | null;
  flag?: string | null;
  description?: string | null;
  languageInstruction?: string[] | null;
  tuitionRange?: string | null;
  livingCost?: string | null;
  visaDifficulty?: string | null;
  scholarshipAvailable?: boolean | null;
  popularScholarships?: string[] | null;
  admissionRequirements?: string[] | null;
  processingTimeVisa?: string | null;
}

interface LanguageCenter {
  id: number; name: string; city?: string | null; language?: string | null;
  levelsOffered?: string[] | null; levels?: string | null; courseTypes?: string[] | null;
  examsPrepared?: string[] | null; priceFrom?: number | null; priceUnit?: string | null;
  link?: string | null; registrationUrl?: string | null;
}

interface Accommodation {
  id: number; name: string; city: string; type?: string | null;
  pricePerMonth?: number | null; currency?: string | null; contact?: string | null; description?: string | null;
}

interface RecognitionProvider {
  id: number; provider: string; processingTime?: string | null; price?: string | null;
  requirements?: string[] | null; link?: string | null;
}

interface OrientationResource {
  id: number; title: string; description?: string | null; category?: string | null;
  provider?: string | null; link?: string | null;
}

/** Pays d'origine / de résidence : l'Afrique d'abord (public MIDZOE), puis les autres. */
const OTHER_COUNTRIES: CountryOption[] = [
  { value: 'Germany', label: 'Allemagne' }, { value: 'Belgium', label: 'Belgique' },
  { value: 'Canada', label: 'Canada' }, { value: 'China', label: 'Chine' },
  { value: 'Spain', label: 'Espagne' }, { value: 'United States', label: 'États-Unis' },
  { value: 'France', label: 'France' }, { value: 'Italy', label: 'Italie' },
  { value: 'Luxembourg', label: 'Luxembourg' }, { value: 'Netherlands', label: 'Pays-Bas' },
  { value: 'Portugal', label: 'Portugal' }, { value: 'United Kingdom', label: 'Royaume-Uni' },
  { value: 'Sweden', label: 'Suède' }, { value: 'Switzerland', label: 'Suisse' },
];

const ALL_ORIGINS = [...AFRICAN_COUNTRIES, ...OTHER_COUNTRIES];

function originLabel(value: string): string {
  return ALL_ORIGINS.find(c => c.value === value)?.label ?? value;
}

/** Langue des centres (« Allemand ») à proposer selon la destination. */
const DESTINATION_LANGUAGE: Record<string, string> = {
  Germany: 'Allemand', France: 'Français', Belgium: 'Français', Luxembourg: 'Français',
  Switzerland: 'Français', Italy: 'Italien', Spain: 'Espagnol', Portugal: 'Portugais',
  Netherlands: 'Anglais', Sweden: 'Anglais', 'United Kingdom': 'Anglais', 'United States': 'Anglais',
  Canada: 'Anglais', China: 'Chinois',
};

// ── Page ──────────────────────────────────────────────────────────────────────

const StudyPlanner: React.FC = () => {
  const { user, updateUserLocally } = useAuth();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState<StudyProject>(() => {
    const draft = loadDraft();
    const country = searchParams.get('country');
    if (searchParams.get('project')) return emptyProject();
    if (draft) return country && !draft.destination ? { ...draft, destination: country } : draft;
    return { ...emptyProject(), destination: country || '' };
  });
  const [loadingProject, setLoadingProject] = useState(!!searchParams.get('project'));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [ignoreCities, setIgnoreCities] = useState(false);

  // Catalogue
  const [studyCountries, setStudyCountries] = useState<StudyCountry[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [languageCenters, setLanguageCenters] = useState<LanguageCenter[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [recognition, setRecognition] = useState<RecognitionProvider[]>([]);
  const [orientation, setOrientation] = useState<OrientationResource[]>([]);
  const [visa, setVisa] = useState<any>(null);
  const [offers, setOffers] = useState<VocationalOffer[]>([]);
  const { pricing, error: pricingError } = usePricing();
  const [showTourism, setShowTourism] = useState(false);

  const update = (patch: Partial<StudyProject>) => {
    setProject(prev => ({ ...prev, ...patch }));
    setDirty(true);
    setFeedback(null);
  };
  const updateProfile = (patch: Partial<StudyProject['profile']>) =>
    update({ profile: { ...project.profile, ...patch } });
  const updatePreferences = (patch: Partial<StudyProject['preferences']>) =>
    update({ preferences: { ...project.preferences, ...patch } });

  // Projet du compte ouvert depuis le dashboard (?project=<id>).
  useEffect(() => {
    const id = Number(searchParams.get('project'));
    if (!id) return;
    if (!user) { setLoadingProject(false); return; }
    let mounted = true;
    loadAccountProject(id)
      .then(p => {
        if (!mounted) return;
        if (p) { setProject(p); setDirty(false); }
        else setFeedback({ tone: 'error', text: 'Ce projet est introuvable dans votre compte.' });
      })
      .catch(() => mounted && setFeedback({ tone: 'error', text: 'Impossible de charger ce projet. Réessayez plus tard.' }))
      .finally(() => mounted && setLoadingProject(false));
    return () => { mounted = false; };
  }, [searchParams, user]);

  // Profil pré-rempli depuis le compte (sans écraser une saisie).
  useEffect(() => {
    if (!user) return;
    setProject(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        nationality: prev.profile.nationality || user.nationality || '',
        residence: prev.profile.residence || user.country_of_residence || '',
      },
    }));
  }, [user]);

  // Brouillon sauvegardé en continu : fermer l'onglet ne perd rien.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (loadingProject || !dirty) return;
    const timer = setTimeout(() => saveDraft(project), 400);
    return () => clearTimeout(timer);
  }, [project, dirty, loadingProject]);

  // Référentiels chargés une fois.
  useEffect(() => {
    apiService.getStudyCountries().then(r => setStudyCountries(r?.data ?? [])).catch(() => setStudyCountries([]));
    apiService.getOrientation().then(r => setOrientation(r?.data ?? [])).catch(() => setOrientation([]));
  }, []);

  // Données propres à la destination.
  useEffect(() => {
    const country = project.destination;
    setUniversities([]); setLanguageCenters([]); setAccommodations([]); setRecognition([]); setOffers([]);
    if (!country) return;
    let mounted = true;
    // Tant que tout n'est pas arrivé, on n'affiche pas « aucun résultat » : ce serait faux.
    setLoadingCatalog(true);
    Promise.allSettled([
      apiService.getUniversities({ country }).then(r => mounted && setUniversities(r?.data ?? [])),
      apiService.getLanguageCenters({ country }).then(r => mounted && setLanguageCenters(r?.data ?? [])),
      apiService.getAccommodations({ country }).then(r => mounted && setAccommodations(r?.accommodations ?? r?.data ?? [])),
      apiService.getServiceProviders({ type: 'recognition', country }).then(r => mounted && setRecognition(r?.data ?? [])),
      // Offres d'Ausbildung : route récente, absente d'un backend non redéployé (404 → liste vide).
      apiService.getVocationalTrainings({ country }).then(r => mounted && setOffers(r?.data ?? [])),
    ]).finally(() => mounted && setLoadingCatalog(false));
    return () => { mounted = false; };
  }, [project.destination]);

  // Visa : fiche publiée pour le couple nationalité → destination (type « Étudiant »).
  useEffect(() => {
    setVisa(null);
    const { nationality } = project.profile;
    if (!nationality || !project.destination || nationality === project.destination) return;
    let mounted = true;
    apiService.checkTravelRequirements(nationality, project.destination, 'fr', 'Étudiant')
      .then(r => mounted && setVisa(r))
      .catch(() => mounted && setVisa({ error: true }));
    return () => { mounted = false; };
  }, [project.profile.nationality, project.destination]);

  // Arrivée depuis la grille (`/packages` → « Choisir ») : le palier demandé est retenu dès
  // qu'il couvre la sélection ; un palier Mix ouvre l'ajout de services tourisme.
  const requestedSlug = searchParams.get('package');
  const codes = projectCodes(project);
  const codesKey = codes.join(',');
  useEffect(() => {
    if (requestedSlug?.startsWith('mix-')) setShowTourism(true);
  }, [requestedSlug]);
  useEffect(() => {
    if (!requestedSlug || !pricing || project.price.offerId) return;
    const offer = quoteSelection(codes, pricing).offers.find(o => o.lines.some(l => l.slug === requestedSlug));
    if (offer) update({ price: { ...project.price, offerId: offer.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSlug, pricing, codesKey]);

  /** Montants de l'offre retenue (ou conseillée), recalculés à chaque changement. */
  const liveSnapshot = pricing ? computeSnapshot(codes, pricing, project.price) : null;
  const currentProject = project;
  const priceOf = (code: string) => pricing?.services.find(sv => sv.code === code)?.price_cents ?? null;
  const withSnapshot = (p: StudyProject): StudyProject =>
    ({ ...p, price: { ...p.price, snapshot: pricing ? computeSnapshot(projectCodes(p), pricing, p.price) : p.price.snapshot } });

  // ── Dérivés ─────────────────────────────────────────────────────────────────

  const country = studyCountries.find(c => c.name === project.destination);
  const countryLabel = country?.nameFr || project.destination;
  const guide = COUNTRY_GUIDES[project.destination];
  const level = LEVELS.find(l => l.id === project.level);
  const isUniversityLevel = !!level?.apiLevel;
  const levelInfo = levelGuide(project.destination, project.level);

  const citySuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    universities.forEach(u => u.city.split(/[/(),]/).map(s => s.trim()).filter(Boolean).forEach(c => {
      if (!seen.has(cityKey(c))) seen.set(cityKey(c), c);
    }));
    return [...seen.values()].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [universities]);

  const criteria = {
    level: project.level,
    domains: project.domains,
    fieldQuery: project.fieldQuery,
    languages: project.preferences.teachingLanguages,
    publicOnly: project.preferences.publicOnly,
    formats: project.preferences.formats,
  };
  const criteriaKey = JSON.stringify(criteria);
  const matches: UniversityMatch[] = useMemo(
    () => matchUniversities(universities, { ...criteria, cities: ignoreCities ? [] : project.cities }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [universities, criteriaKey, project.cities, ignoreCities],
  );
  const countryWideCount = useMemo(
    () => matchUniversities(universities, { ...criteria, cities: [] }).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [universities, criteriaKey],
  );
  const bestMatches = matches.filter(m => m.languageOk && m.formatOk);
  const otherMatches = matches.filter(m => !(m.languageOk && m.formatOk));
  const excludedPrivate = project.preferences.publicOnly
    ? matchUniversities(universities, { ...criteria, publicOnly: false, cities: ignoreCities ? [] : project.cities }).length - matches.length
    : 0;
  const unknownStatus = matches.filter(m => m.university.isPublic == null).length;

  // Ausbildung : offres du domaine choisi (soins infirmiers par défaut), dans les villes choisies d'abord.
  const isVocational = project.level === 'vocational';
  const offersForDomain = offers.filter(o => project.domains.length === 0 || project.domains.includes(o.domain));
  const offersInCities = project.cities.length
    ? offersForDomain.filter(o => project.cities.some(city => cityMatches(o.city, city)))
    : offersForDomain;

  const cityCoverage = project.cities.map(city => ({
    city,
    universities: universities.filter(u => cityMatches(u.city, city)).length,
    matching: matchUniversities(universities, { ...criteria, cities: [city] }).length,
    housing: accommodations.filter(a => cityMatches(a.city, city)).length,
    offers: offersForDomain.filter(o => cityMatches(o.city, city)).length,
  }));

  const destinationLanguage = DESTINATION_LANGUAGE[project.destination];
  const relevantCenters = languageCenters
    .filter(c => !destinationLanguage || fold(c.language || '') === fold(destinationLanguage))
    .sort((a, b) => Number(project.cities.some(city => cityMatches(b.city, city))) - Number(project.cities.some(city => cityMatches(a.city, city))));
  const housingInCities = project.cities.length
    ? accommodations.filter(a => project.cities.some(city => cityMatches(a.city, city)))
    : [];
  const housingToShow = housingInCities.length ? housingInCities : accommodations.slice(0, 4);

  const countryWords = [project.destination, countryLabel].filter(Boolean).map(fold);
  const resources = orientation.filter(r => {
    const text = fold(`${r.title} ${r.description ?? ''} ${r.category ?? ''}`);
    return countryWords.some(w => w && text.includes(w)) || (project.destination === 'Germany' && text.includes('allemagne'));
  }).slice(0, 6);

  const residenceDiffers =
    !!project.profile.residence && !!project.profile.nationality && project.profile.residence !== project.profile.nationality;

  const missing: string[] = [];
  if (!project.destination) missing.push('le pays de destination');
  if (!project.level) missing.push('le niveau visé');
  const canSave = missing.length === 0;

  // ── Actions ─────────────────────────────────────────────────────────────────

  const addCity = (raw: string) => {
    const city = raw.trim();
    if (!city || project.cities.some(c => cityKey(c) === cityKey(city))) return;
    update({ cities: [...project.cities, city] });
    setIgnoreCities(false);
  };

  const toggleOffer = (o: VocationalOffer) => {
    const exists = project.offerShortlist.some(s => s.id === o.id);
    update({
      offerShortlist: exists
        ? project.offerShortlist.filter(s => s.id !== o.id)
        : [...project.offerShortlist, { id: o.id, employer: o.employer, city: o.city }],
      services: exists || project.services.includes('admission') ? project.services : [...project.services, 'admission'],
    });
  };

  const toggleShortlist = (u: University) => {
    const exists = project.shortlist.some(s => s.id === u.id);
    update({
      shortlist: exists
        ? project.shortlist.filter(s => s.id !== u.id)
        : [...project.shortlist, { id: u.id, name: u.name, city: u.city }],
      services: exists || project.services.includes('university_finder')
        ? project.services
        : [...project.services, 'university_finder'],
    });
  };

  /** Profil du compte complété avec la nationalité / la résidence saisies ici. */
  const syncProfile = async () => {
    if (!user) return;
    const patch: { nationality?: string; country_of_residence?: string } = {};
    if (project.profile.nationality && project.profile.nationality !== user.nationality) patch.nationality = project.profile.nationality;
    if (project.profile.residence && project.profile.residence !== user.country_of_residence) patch.country_of_residence = project.profile.residence;
    if (!Object.keys(patch).length) return;
    try {
      await apiService.updateExtendedProfile(patch);
      updateUserLocally(patch);
    } catch {
      /* le projet reste enregistré même si le profil ne suit pas */
    }
  };

  const save = async (): Promise<StudyProject | null> => {
    const projectState = currentProject;
    if (!canSave) {
      setFeedback({ tone: 'error', text: `Complétez d'abord ${missing.join(' et ')}.` });
      return null;
    }
    const project = withSnapshot(projectState);
    if (!user) {
      const stored = saveDraft(project);
      setDirty(false);
      setNeedsAccount(true);
      setFeedback(stored
        ? { tone: 'info', text: 'Projet enregistré sur cet appareil. Créez un compte (ou connectez-vous) pour le retrouver partout et envoyer votre demande.' }
        : { tone: 'error', text: "Votre navigateur bloque l'enregistrement local. Créez un compte pour sauvegarder votre projet." });
      return stored;
    }
    setSaving(true);
    try {
      const saved = await saveProjectToAccount(project, countryLabel);
      await syncProfile();
      setProject(saved);
      setDirty(false);
      clearDraft();
      setFeedback({ tone: 'success', text: 'Projet enregistré dans votre compte. Retrouvez-le dans votre dashboard.' });
      return saved;
    } catch (err: any) {
      saveDraft(project);
      setFeedback({
        tone: 'error',
        text: err?.status === 401
          ? 'Votre session a expiré : reconnectez-vous pour enregistrer (le brouillon est conservé sur cet appareil).'
          : "L'enregistrement a échoué. Le brouillon est conservé sur cet appareil ; réessayez dans un instant.",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const sendRequest = async () => {
    if (!user) {
      saveDraft(project);
      setNeedsAccount(true);
      setFeedback({ tone: 'info', text: 'Pour envoyer une demande, connectez-vous ou créez un compte : votre projet est conservé.' });
      return;
    }
    if (project.services.length === 0) {
      setFeedback({ tone: 'error', text: 'Choisissez au moins un service avant d’envoyer votre demande.' });
      return;
    }
    setSending(true);
    try {
      const saved = await save();
      if (!saved) return;
      await apiService.sendContact({
        name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
        email: user.email || '',
        subject: `Demande d'accompagnement — ${projectTitle(saved, countryLabel)}${saved.price.snapshot ? ` — ${saved.price.snapshot.offerLabel}` : ''}`,
        category: 'study',
        message: projectSummary(saved, countryLabel),
      });
      const withRequest = await saveProjectToAccount({ ...saved, requestSentAt: new Date().toISOString() }, countryLabel);
      setProject(withRequest);
      setDirty(false);
      setFeedback({ tone: 'success', text: 'Demande envoyée : un conseiller MIDZOE revient vers vous par email. Elle est suivie dans votre dashboard.' });
    } catch {
      setFeedback({ tone: 'error', text: "L'envoi de la demande a échoué. Votre projet est enregistré ; réessayez dans un instant." });
    } finally {
      setSending(false);
    }
  };

  // Paiement en ligne : le projet est d'abord enregistré, puis le serveur recalcule le prix de
  // l'offre choisie (aucun montant n'est envoyé) et ouvre Stripe Checkout.
  const pay = async () => {
    if (!user) {
      setFeedback({ tone: 'info', text: 'Pour payer en ligne, connectez-vous ou créez un compte : votre projet est conservé.' });
      return;
    }
    setPaying(true);
    const saved = await save();
    if (!saved) { setPaying(false); return; }
    const codesToPay = projectCodes(saved);
    if (!codesToPay.length && saved.price.offerId !== 'consultation') {
      setFeedback({ tone: 'error', text: 'Choisissez au moins un service (ou la consultation) avant de payer.' });
      setPaying(false);
      return;
    }
    const error = await goToCheckout({
      codes: codesToPay,
      offerId: saved.price.snapshot?.offerId ?? saved.price.offerId,
      installments: saved.price.installments,
      tripId: saved.tripId,
    });
    if (error) {
      setFeedback({ tone: 'error', text: error });
      setPaying(false);
    }
  };

  const startNew = () => {
    clearDraft();
    setProject({ ...emptyProject(), profile: project.profile });
    setDirty(false);
    setFeedback(null);
    setNeedsAccount(false);
  };

  // ── Rendu ───────────────────────────────────────────────────────────────────

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
      </div>
    );
  }

  const status = project.requestSentAt
    ? { label: 'Demande envoyée', className: 'bg-emerald-100 text-emerald-800' }
    : project.tripId && !dirty
      ? { label: 'Enregistré dans votre compte', className: 'bg-emerald-100 text-emerald-800' }
      : project.tripId
        ? { label: 'Modifications non enregistrées', className: 'bg-amber-100 text-amber-800' }
        : { label: user ? 'Pas encore enregistré dans votre compte' : 'Brouillon sur cet appareil', className: 'bg-gray-100 text-gray-700' };

  const redirect = encodeURIComponent('/study');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-2">🎓 MIDZOE Study</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Construisez votre projet d'études</h1>
          <p className="mt-3 text-blue-50 max-w-3xl">
            Choisissez un pays, un niveau et un domaine : nous croisons votre profil avec notre catalogue
            (universités, visa, langue, logement), puis vous enregistrez vos choix et demandez un accompagnement.
            {!user && ' Aucun compte n’est nécessaire pour explorer.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Profil */}
          <Section step={1} title="Votre profil" subtitle="Il détermine les démarches (visa, reconnaissance du diplôme).">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sp-nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <select id="sp-nationality" value={project.profile.nationality} onChange={e => updateProfile({ nationality: e.target.value })} className={fieldClass}>
                  <option value="">— Choisir —</option>
                  <optgroup label="Afrique">{AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label="Autres pays">{OTHER_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.nationality && !ALL_ORIGINS.some(c => c.value === project.profile.nationality) && (
                    <option value={project.profile.nationality}>{project.profile.nationality}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="sp-residence" className="block text-sm font-medium text-gray-700 mb-1">Pays de résidence</label>
                <select id="sp-residence" value={project.profile.residence} onChange={e => updateProfile({ residence: e.target.value })} className={fieldClass}>
                  <option value="">— Choisir —</option>
                  <optgroup label="Afrique">{AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label="Autres pays">{OTHER_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.residence && !ALL_ORIGINS.some(c => c.value === project.profile.residence) && (
                    <option value={project.profile.residence}>{project.profile.residence}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="sp-diploma" className="block text-sm font-medium text-gray-700 mb-1">Diplôme actuel</label>
                <input id="sp-diploma" value={project.profile.diploma} onChange={e => updateProfile({ diploma: e.target.value })}
                  placeholder="Ex. Bac scientifique, Licence en biologie, WASSCE" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="sp-language" className="block text-sm font-medium text-gray-700 mb-1">Langues et niveau</label>
                <input id="sp-language" value={project.profile.languageLevel} onChange={e => updateProfile({ languageLevel: e.target.value })}
                  placeholder="Ex. Anglais C1, Allemand A2" className={fieldClass} />
              </div>
            </div>
          </Section>

          {/* 2. Projet */}
          <Section step={2} title="Votre projet" subtitle="Pays > niveau > domaine, puis les villes qui vous intéressent.">
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Pays de destination</p>
                {studyCountries.length === 0 ? (
                  <p className="text-sm text-gray-500">Chargement des pays d'études…</p>
                ) : (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Pays de destination">
                    {studyCountries.map(c => (
                      <Chip key={c.id} active={project.destination === c.name}
                        onClick={() => { update({ destination: c.name, destinationLabel: c.nameFr || c.name, cities: [], shortlist: [] }); setIgnoreCities(false); }}>
                        {c.flag} {c.nameFr || c.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Niveau visé</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Niveau visé">
                  {LEVELS.map(l => (
                    <button key={l.id} type="button" aria-pressed={project.level === l.id}
                      onClick={() => update({
                        level: l.id,
                        domains: l.id === 'medicine_first_year' ? ['medicine']
                          : l.id === 'vocational' && project.domains.length === 0 ? ['nursing'] : project.domains,
                      })}
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        project.level === l.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                      <span className="block font-semibold text-gray-900">{l.label}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{l.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Domaine(s)</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Domaines">
                  {DOMAINS.map(d => (
                    <Chip key={d.id} active={project.domains.includes(d.id)} onClick={() => update({ domains: toggle(project.domains, d.id) })}>
                      {d.label}
                    </Chip>
                  ))}
                </div>
                <input value={project.fieldQuery} onChange={e => update({ fieldQuery: e.target.value })}
                  aria-label="Précisez la formation" placeholder="Précisez la formation (optionnel) : ex. Finance, Santé publique"
                  className={`${fieldClass} mt-3`} />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Villes</p>
                {project.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.cities.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {c}
                        <button type="button" aria-label={`Retirer ${c}`} onClick={() => update({ cities: project.cities.filter(x => x !== c) })}
                          className="ml-1 hover:text-gray-200">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={cityInput} onChange={e => setCityInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(cityInput); setCityInput(''); } }}
                    aria-label="Ajouter une ville" placeholder={project.destination ? 'Ajouter une ville (ex. Leipzig)' : 'Choisissez d’abord un pays'}
                    disabled={!project.destination} list="sp-city-suggestions" className={fieldClass} />
                  <datalist id="sp-city-suggestions">{citySuggestions.map(c => <option key={c} value={c} />)}</datalist>
                  <button type="button" disabled={!cityInput.trim()} onClick={() => { addCity(cityInput); setCityInput(''); }}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40">Ajouter</button>
                </div>
                {citySuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {citySuggestions.filter(c => !project.cities.some(x => cityKey(x) === cityKey(c))).map(c => (
                      <button key={c} type="button" onClick={() => addCity(c)}
                        className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary">+ {c}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sp-start" className="block text-sm font-medium text-gray-700 mb-1">Rentrée souhaitée</label>
                  <input id="sp-start" type="month" value={project.startMonth} onChange={e => update({ startMonth: e.target.value })} className={fieldClass} />
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Langue d'enseignement souhaitée</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Langue d'enseignement">
                    {TEACHING_LANGUAGES.map(l => (
                      <Chip key={l} active={project.preferences.teachingLanguages.includes(l)}
                        onClick={() => updatePreferences({ teachingLanguages: toggle(project.preferences.teachingLanguages, l) })}>{l}</Chip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Format</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Format">
                    {FORMATS.map(f => (
                      <Chip key={f} active={project.preferences.formats.includes(f)}
                        onClick={() => updatePreferences({ formats: toggle(project.preferences.formats, f) })}>{f}</Chip>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-2 text-sm text-gray-700 md:mt-6">
                  <input type="checkbox" checked={project.preferences.publicOnly}
                    onChange={e => updatePreferences({ publicOnly: e.target.checked })} className="mt-0.5 rounded text-primary focus:ring-primary" />
                  Universités publiques uniquement
                </label>
              </div>
            </div>
          </Section>

          {/* 3. Catalogue */}
          <Section step={3} id="sp-results" title="Ce que propose le catalogue"
            subtitle={project.destination ? `Pour ${countryLabel}${level ? ` · ${level.label}` : ''}` : 'Choisissez un pays pour afficher les résultats.'}>
            {!project.destination ? (
              <p className="text-gray-500 text-sm">Sélectionnez un pays de destination à l'étape 2.</p>
            ) : loadingCatalog ? (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-6" data-testid="catalog-loading">
                <span className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
                Chargement du catalogue pour {countryLabel}…
              </div>
            ) : (
              <div className="space-y-6">
                {country && (
                  <InfoCard title={`${country.flag ?? ''} Étudier en ${countryLabel}`}>
                    {country.description && <p>{country.description}</p>}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {!!country.languageInstruction?.length && (<div><dt className="font-medium">Langues d'enseignement</dt><dd>{country.languageInstruction.join(', ')}</dd></div>)}
                      {country.tuitionRange && (<div><dt className="font-medium">Frais de scolarité</dt><dd>{country.tuitionRange}</dd></div>)}
                      {country.livingCost && (<div><dt className="font-medium">Coût de la vie</dt><dd>{country.livingCost}</dd></div>)}
                      {country.processingTimeVisa && (<div><dt className="font-medium">Délai visa</dt><dd>{country.processingTimeVisa}</dd></div>)}
                      {!!country.popularScholarships?.length && (<div><dt className="font-medium">Bourses</dt><dd>{country.popularScholarships.join(', ')}</dd></div>)}
                      {!!country.admissionRequirements?.length && (<div><dt className="font-medium">Admission</dt><dd>{country.admissionRequirements.join(', ')}</dd></div>)}
                    </dl>
                    {guide?.fees.map(f => <p key={f}>• {f}</p>)}
                  </InfoCard>
                )}

                {levelInfo && (
                  <InfoCard title={levelInfo.title} tone={project.level === 'vocational' && project.destination !== 'Germany' ? 'warning' : 'default'}>
                    <ul className="list-disc pl-5 space-y-1">{levelInfo.points.map(p => <li key={p}>{p}</li>)}</ul>
                    <LinkList links={levelInfo.links} />
                  </InfoCard>
                )}

                {cityCoverage.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Vos villes dans le catalogue</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {cityCoverage.map(c => (
                        <li key={c.city} className="rounded-lg border border-gray-200 p-3">
                          <span className="font-medium text-gray-900">{c.city}</span>
                          <span className="block text-gray-600">
                            {isVocational
                              ? (c.offers ? `${c.offers} offre(s) d’Ausbildung` : 'Aucune offre d’Ausbildung référencée pour l’instant')
                              : c.universities === 0
                                ? 'Aucune université référencée pour l’instant'
                                : `${c.universities} université(s)${isUniversityLevel ? ` · ${c.matching} pour votre recherche` : ''}`}
                            {' · '}{c.housing ? `${c.housing} logement(s)` : 'pas de logement référencé'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Universités */}
                {isUniversityLevel && (
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900">
                        Universités ({matches.length})
                      </h3>
                      {project.cities.length > 0 && (
                        <button type="button" onClick={() => setIgnoreCities(!ignoreCities)} className="text-sm text-secondary hover:text-primary underline">
                          {ignoreCities ? 'Revenir à mes villes' : `Voir tout le pays (${countryWideCount})`}
                        </button>
                      )}
                    </div>
                    {project.preferences.publicOnly && (
                      <p className="text-xs text-gray-500 mb-3" data-testid="public-filter-note">
                        Universités publiques uniquement : {excludedPrivate > 0 ? `${excludedPrivate} établissement(s) privé(s) écarté(s)` : 'aucun établissement privé dans ces résultats'}
                        {unknownStatus > 0 && ` · ${unknownStatus} au statut non renseigné, conservé(s)`}.
                      </p>
                    )}
                    {project.preferences.formats.length > 0 && !matches.some(m => m.formatOk) && matches.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        Aucune filière n'est encore renseignée au format {project.preferences.formats.join(' / ')} : les résultats ci-dessous sont à confirmer
                        auprès des établissements. Votre préférence est transmise au conseiller.
                      </p>
                    )}
                    {matches.length === 0 ? (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                        Aucune université ne correspond {project.cities.length && !ignoreCities ? 'dans ces villes ' : ''}à ce niveau et ce domaine.
                        {project.cities.length > 0 && !ignoreCities && countryWideCount > 0 && ` ${countryWideCount} correspondent ailleurs en ${countryLabel}.`}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {[{ list: bestMatches, heading: '' }, {
                          list: otherMatches,
                          heading: otherMatches.some(m => !m.languageOk)
                            ? `Langue d'enseignement différente de votre choix (${project.preferences.teachingLanguages.join(', ')})`
                            : `Format non confirmé (${project.preferences.formats.join(', ')})`,
                        }]
                          .filter(g => g.list.length)
                          .map(group => (
                            <div key={group.heading || 'main'} className="space-y-3">
                              {group.heading && <p className="text-sm font-medium text-amber-700">{group.heading}</p>}
                              {group.list.map(({ university: u, programs, languageFromProgram }) => {
                                const picked = project.shortlist.some(s => s.id === u.id);
                                return (
                                  <article key={u.id} className={`rounded-xl border p-4 ${picked ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div>
                                        <h4 className="font-bold text-primary">{u.name}</h4>
                                        <p className="text-sm text-gray-600">
                                          {u.city}
                                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${u.isPublic === true ? 'bg-emerald-50 text-emerald-700' : u.isPublic === false ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {u.isPublic === true ? 'Public' : u.isPublic === false ? 'Privé' : 'Statut non renseigné'}
                                          </span>
                                          {languageFromProgram && project.preferences.teachingLanguages.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                                              Enseigné en {project.preferences.teachingLanguages.join(' / ').toLowerCase()}
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <button type="button" onClick={() => toggleShortlist(u)} aria-pressed={picked}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${picked ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary/10'}`}>
                                        {picked ? '★ Présélectionnée' : '☆ Présélectionner'}
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3">
                                      {programs.slice(0, 6).map(p => (
                                        <span key={p.id} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                          {p.name} ({p.level}){p.teachingLanguages?.length ? ` · ${p.teachingLanguages.join('/')}` : ''}
                                          {p.formats?.length ? ` · ${p.formats.join(', ')}` : ''}
                                        </span>
                                      ))}
                                      {programs.length > 6 && <span className="text-xs text-gray-500">+{programs.length - 6}</span>}
                                    </div>
                                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                      {u.requiredLanguage && <div><dt className="inline font-medium">Langue : </dt><dd className="inline">{u.requiredLanguage} {u.requiredLanguageLevel}</dd></div>}
                                      {u.minimumGrade && <div><dt className="inline font-medium">Note minimale : </dt><dd className="inline">{u.minimumGrade}</dd></div>}
                                      {u.admissionRequirements && <div className="sm:col-span-2"><dt className="inline font-medium">Admission : </dt><dd className="inline">{u.admissionRequirements}</dd></div>}
                                    </dl>
                                    <div className="flex gap-3 mt-3 text-sm">
                                      {u.website && <a href={externalHref(u.website)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">Site officiel ↗</a>}
                                      {u.applicationUrl && <a href={externalHref(u.applicationUrl)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">Candidater ↗</a>}
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Offres d'Ausbildung */}
                {isVocational && (
                  <div data-testid="vocational-offers">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Offres d'Ausbildung ({offersInCities.length}{project.cities.length ? ' dans vos villes' : ''})
                    </h3>
                    {offersInCities.length === 0 ? (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                        {offersForDomain.length
                          ? `Aucune offre dans ces villes ; ${offersForDomain.length} ailleurs en ${countryLabel} : retirez une ville pour les voir.`
                          : `Aucune offre référencée pour ce domaine en ${countryLabel} pour l'instant. Enregistrez votre projet : un conseiller vous orientera.`}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {offersInCities.map(o => {
                          const picked = project.offerShortlist.some(s => s.id === o.id);
                          return (
                            <article key={o.id} className={`rounded-xl border p-4 ${picked ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-bold text-primary">{o.employer}</h4>
                                  <p className="text-sm text-gray-600">{o.city}{o.employerType ? ` · ${o.employerType}` : ''}</p>
                                </div>
                                <button type="button" onClick={() => toggleOffer(o)} aria-pressed={picked}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${picked ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary/10'}`}>
                                  {picked ? '★ Retenue' : '☆ Retenir'}
                                </button>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{o.occupation}</p>
                              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                {o.durationMonths && <div><dt className="inline font-medium">Durée : </dt><dd className="inline">{o.durationMonths} mois</dd></div>}
                                {o.languageLevel && <div><dt className="inline font-medium">Allemand : </dt><dd className="inline">{o.languageLevel}</dd></div>}
                                {o.salary && <div className="sm:col-span-2"><dt className="inline font-medium">Rémunération : </dt><dd className="inline">{o.salary}</dd></div>}
                                {!!o.startDates?.length && <div className="sm:col-span-2"><dt className="inline font-medium">Rentrées : </dt><dd className="inline">{o.startDates.join(', ')}</dd></div>}
                                {!!o.documents?.length && <div className="sm:col-span-2"><dt className="inline font-medium">Documents : </dt><dd className="inline">{o.documents.join(' ; ')}</dd></div>}
                              </dl>
                              {o.applicationUrl && (
                                <a href={externalHref(o.applicationUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-secondary hover:text-primary underline">
                                  Site de l'employeur ↗
                                </a>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Démarches : visa, reconnaissance, candidature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard title="Visa et démarches">
                    {!project.profile.nationality ? (
                      <p>Indiquez votre nationalité (étape 1) pour voir la fiche visa.</p>
                    ) : project.profile.nationality === project.destination ? (
                      <p>Pas de visa nécessaire : vous êtes ressortissant de ce pays.</p>
                    ) : visa?.requirements ? (
                      <>
                        <p>{visa.message}</p>
                        {visa.requirements.costs?.processingTime && <p><span className="font-medium">Délai :</span> {visa.requirements.costs.processingTime}</p>}
                        {visa.requirements.costs?.cost && <p><span className="font-medium">Coût :</span> {visa.requirements.costs.cost} {visa.requirements.costs.currency ?? ''}</p>}
                        {!!visa.requirements.documents?.list?.length && (
                          <ul className="list-disc pl-5">{visa.requirements.documents.list.slice(0, 8).map((d: string) => <li key={d}>{d}</li>)}</ul>
                        )}
                        {visa.embassy && <p><span className="font-medium">Où déposer :</span> {visa.embassy.name}{visa.embassy.city ? ` — ${visa.embassy.city}` : ''}</p>}
                      </>
                    ) : visa ? (
                      <p>Pas encore de fiche visa publiée de {originLabel(project.profile.nationality)} vers {countryLabel}. Les sites officiels ci-dessous font foi.</p>
                    ) : (
                      <p>Recherche de la fiche visa…</p>
                    )}
                    {residenceDiffers && (
                      <p className="bg-white rounded-lg border border-gray-200 p-3">
                        Vous résidez en/au <strong>{originLabel(project.profile.residence)}</strong> : la demande de visa se dépose en principe
                        auprès de la représentation de {countryLabel} compétente pour votre pays de résidence, avec votre titre de séjour en cours de validité.
                      </p>
                    )}
                    {guide && <LinkList links={guide.visa} />}
                  </InfoCard>

                  <InfoCard title="Reconnaissance du diplôme">
                    {project.profile.diploma && <p>Votre diplôme : <strong>{project.profile.diploma}</strong></p>}
                    {recognition.length ? (
                      <ul className="space-y-2">
                        {recognition.slice(0, 3).map(r => (
                          <li key={r.id}>
                            <span className="font-medium">{r.provider}</span>
                            {(r.processingTime || r.price) && <span className="block text-xs text-gray-500">{[r.processingTime, r.price].filter(Boolean).join(' · ')}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucun organisme de reconnaissance référencé dans le catalogue pour ce pays.</p>
                    )}
                    {guide && <LinkList links={guide.recognition} />}
                    {guide && (<><p className="font-medium pt-2">Candidature</p><LinkList links={guide.application} /></>)}
                  </InfoCard>
                </div>

                {/* Langue et logement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard title={`Cours de langue${destinationLanguage ? ` (${destinationLanguage.toLowerCase()})` : ''}`}>
                    {relevantCenters.length ? (
                      <ul className="space-y-2">
                        {relevantCenters.slice(0, 4).map(c => {
                          const levels = c.levelsOffered?.length ? c.levelsOffered : (c.levels ? [c.levels] : []);
                          return (
                            <li key={c.id}>
                              <span className="font-medium">{c.name}</span> <span className="text-gray-500">— {c.city}</span>
                              <span className="block text-xs text-gray-500">
                                {[levels.join(' '), c.examsPrepared?.slice(0, 3).join(', '), c.priceFrom ? `dès ${c.priceFrom} € / ${c.priceUnit ?? 'cours'}` : ''].filter(Boolean).join(' · ')}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p>Aucun centre de langue référencé pour ce pays.</p>
                    )}
                    <Link to="/services/language-center" className="text-secondary hover:text-primary underline">Tous les centres de langue →</Link>
                  </InfoCard>

                  <InfoCard title="Logement">
                    {project.cities.length > 0 && housingInCities.length === 0 && accommodations.length > 0 && (
                      <p>Pas de logement référencé dans vos villes ; voici d'autres offres en {countryLabel}.</p>
                    )}
                    {housingToShow.length ? (
                      <ul className="space-y-2">
                        {housingToShow.slice(0, 4).map(a => (
                          <li key={a.id}>
                            <span className="font-medium">{a.name}</span> <span className="text-gray-500">— {a.city}</span>
                            {a.pricePerMonth != null && <span className="block text-xs text-gray-500">≈ {a.pricePerMonth} {a.currency ?? 'EUR'} / mois (indicatif)</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucun logement étudiant référencé pour ce pays.</p>
                    )}
                    <Link to="/services/student-accommodation" className="text-secondary hover:text-primary underline">Tous les logements →</Link>
                  </InfoCard>
                </div>

                {resources.length > 0 && (
                  <InfoCard title="Ressources officielles utiles">
                    <ul className="space-y-1">
                      {resources.map(r => (
                        <li key={r.id}>
                          {r.link
                            ? <a href={externalHref(r.link)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">{r.title} ↗</a>
                            : r.title}
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
              </div>
            )}
          </Section>

          {/* 4. Services */}
          <Section step={4} title="Vos services" subtitle="Ce sur quoi MIDZOE vous accompagne.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Services">
              {STUDY_SERVICES.map(s => {
                const active = project.services.includes(s.id);
                return (
                  <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input type="checkbox" checked={active} onChange={() => update({ services: toggle(project.services, s.id) })}
                      className="mt-1 rounded text-primary focus:ring-primary" />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900">{s.label}</span>
                        {priceOf(s.code) != null && <span className="text-sm font-semibold text-primary whitespace-nowrap">{formatEuros(priceOf(s.code)!)}</span>}
                      </span>
                      <span className="block text-xs text-gray-500">{s.code} · {s.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Mix : services tourisme ajoutés au projet d'études */}
            <div className="mt-4 rounded-xl border border-gray-200">
              <button type="button" onClick={() => setShowTourism(!showTourism)} aria-expanded={showTourism}
                className="w-full flex items-center justify-between px-4 py-3 text-left">
                <span>
                  <span className="font-semibold text-gray-900">Ajouter un séjour touristique (Mix)</span>
                  <span className="block text-xs text-gray-500">
                    {project.tourismServices.length
                      ? `${project.tourismServices.length} service(s) tourisme ajouté(s) — les packages Mix sont proposés`
                      : 'Découvrir le pays avant ou après la rentrée : les packages Mix combinent études et tourisme.'}
                  </span>
                </span>
                <span className="text-gray-400">{showTourism ? '−' : '+'}</span>
              </button>
              {showTourism && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4" role="group" aria-label="Services tourisme">
                  {(pricing?.services ?? []).filter(t => t.family === 'tourism').map(t => {
                    const active = project.tourismServices.includes(t.code);
                    return (
                      <label key={t.code} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer text-sm ${active ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={active} onChange={() => update({ tourismServices: toggle(project.tourismServices, t.code) })}
                          className="mt-0.5 rounded text-primary focus:ring-primary" />
                        <span className="flex-1">{t.name}</span>
                        <span className="text-primary font-semibold whitespace-nowrap">{formatEuros(t.price_cents)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <textarea value={project.notes} onChange={e => update({ notes: e.target.value })} rows={3}
              aria-label="Précisions pour le conseiller" placeholder="Précisions pour le conseiller (budget, contraintes, questions…)"
              className={`${fieldClass} mt-4`} />
          </Section>

          {/* 5. Prix et package */}
          <Section step={5} title="Prix et package" id="sp-package"
            subtitle="Nous comparons le prix à la carte et nos packages, et vous conseillons l'offre la moins chère.">
            <PricingStep pricing={pricing} pricingError={pricingError} codes={codes} choice={project.price}
              onChange={price => update({ price })} requestedSlug={requestedSlug} />
          </Section>
        </div>

        {/* Récapitulatif + actions */}
        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-bold text-gray-900">Mon projet</h2>
              <span data-testid="project-status" className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
            </div>
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500">Destination</dt><dd className="font-medium text-gray-900">{countryLabel || '—'}</dd></div>
              <div><dt className="text-gray-500">Niveau</dt><dd className="font-medium text-gray-900">{levelLabel(project.level) || '—'}</dd></div>
              <div><dt className="text-gray-500">Domaine</dt><dd className="font-medium text-gray-900">
                {[...DOMAINS.filter(d => project.domains.includes(d.id)).map(d => d.label), project.fieldQuery].filter(Boolean).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">Villes</dt><dd className="font-medium text-gray-900">{project.cities.join(', ') || '—'}</dd></div>
              <div><dt className="text-gray-500">Rentrée</dt><dd className="font-medium text-gray-900">{project.startMonth || '—'}</dd></div>
              <div><dt className="text-gray-500">Services ({project.services.length})</dt><dd className="font-medium text-gray-900">
                {STUDY_SERVICES.filter(s => project.services.includes(s.id)).map(s => s.label).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">Présélection ({project.shortlist.length})</dt><dd className="font-medium text-gray-900">
                {project.shortlist.map(s => s.name).join(' ; ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">Offre et prix</dt><dd className="font-medium text-gray-900" data-testid="summary-package">
                {liveSnapshot ? snapshotLabel(liveSnapshot) : '—'}
              </dd></div>
              {project.offerShortlist.length > 0 && (
                <div><dt className="text-gray-500">Offres Ausbildung ({project.offerShortlist.length})</dt><dd className="font-medium text-gray-900">
                  {project.offerShortlist.map(o => `${o.employer} (${o.city})`).join(' ; ')}
                </dd></div>
              )}
            </dl>

            {feedback && (
              <p role="status" className={`mt-4 text-sm rounded-lg p-3 ${
                feedback.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : feedback.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-800'}`}>
                {feedback.text}
              </p>
            )}

            {!canSave && <p className="mt-4 text-xs text-gray-500">À compléter : {missing.join(', ')}.</p>}

            <div className="mt-4 space-y-2">
              <button type="button" onClick={save} disabled={saving || sending || paying} data-testid="save-project"
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Enregistrement…' : user ? 'Enregistrer mon projet' : 'Enregistrer mes choix'}
              </button>
              <button type="button" onClick={sendRequest} disabled={saving || sending || paying} data-testid="send-request"
                className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 disabled:opacity-50">
                {sending ? 'Envoi…' : project.requestSentAt ? 'Renvoyer ma demande' : "Demander un accompagnement"}
              </button>
              <button type="button" onClick={pay} disabled={saving || sending || paying} data-testid="pay-online"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50">
                {paying ? 'Ouverture du paiement…' : 'Payer en ligne (carte bancaire)'}
              </button>
              <Link to="/dashboard" className="block text-center w-full py-2 text-sm text-secondary hover:text-primary underline">
                Ouvrir mon dashboard
              </Link>
            </div>

            {(needsAccount || !user) && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
                <p className="font-medium mb-2">Sans compte, vos choix restent sur cet appareil.</p>
                <p className="mb-3">Un compte gratuit permet de les retrouver partout et d'envoyer votre demande.</p>
                <div className="flex gap-2">
                  <Link to={`/register?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg bg-secondary text-white font-medium">Créer un compte</Link>
                  <Link to={`/login?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg border border-secondary text-secondary font-medium">Se connecter</Link>
                </div>
              </div>
            )}

            {(project.tripId || project.destination) && (
              <button type="button" onClick={startNew} className="mt-4 w-full text-xs text-gray-500 hover:text-red-600">
                Commencer un nouveau projet
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudyPlanner;
