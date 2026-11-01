import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { AFRICAN_COUNTRIES, countryName, originCountryGroups } from '../../data/africanCountries';
import {
  DOMAINS, FORMATS, LEVELS, STUDY_SERVICES, TEACHING_LANGUAGES,
  StudyProject, University, UniversityMatch, VocationalOffer, projectCodes,
  cityKey, cityMatches, clearDraft, emptyProject, fold, levelLabel, loadAccountProject,
  loadDraft, matchUniversities, projectSummary, projectTitle, saveDraft, saveProjectToAccount,
  DIPLOMAS, ALL_DIPLOMAS, PROFILE_LANGUAGES, LANGUAGE_LEVELS, SpokenLanguage, languagesText,
  destinationsLabel, syncedDestinations,
} from './studyProject';
import { COUNTRY_GUIDES, levelGuide } from './studyGuides';
import { Chip, InfoCard, LinkList, Section, externalHref, fieldClass, toggle } from '../projects/plannerUi';
import { usePricing } from '../../pricing/usePricing';
import PricingStep, { useServiceName } from '../../pricing/PricingStep';
import { goToCheckout, loginToPayHref, RESUME_PAY_PARAM } from '../../pricing/checkout';
import { usePaymentEligibility } from '../../pricing/paymentRules';
import TermsCheckbox from '../legal/TermsCheckbox';
import { computeSnapshot, snapshotLabel } from '../../pricing/priceChoice';
import { quoteSelection } from '../../pricing/pricingEngine';
import { formatMoney, useCurrency } from '../../pricing/currency';
import { useContentLabels } from '../../i18n/contentTranslation';
import { withColon } from '../common/catalogKit';
import { visaVerdict } from '../visa/VisaChecker';

// Parcours « MIDZO Study » : profil → projet → ce que dit le catalogue → services
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

/** Nom d'un pays d'origine : libellé français de la liste Afrique en français, sinon `Intl`. */
function originLabel(value: string, lang = 'fr'): string {
  const fr = AFRICAN_COUNTRIES.find(c => c.value === value)?.label;
  return lang.startsWith('fr') && fr ? fr : countryName(value, lang, value);
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
  useCurrency();
  const { t, i18n } = useTranslation('study');
  const lang = i18n.language?.slice(0, 2) || 'fr';
  // Nationalité / résidence : l'Afrique d'abord, puis tous les autres pays, triés dans la langue du site.
  const origins = useMemo(() => originCountryGroups(lang), [lang]);
  const isKnownOrigin = (value: string) => [...origins.africa, ...origins.others].some(c => c.value === value);
  const isFr = lang === 'fr';
  /** Valeurs enregistrées en français (formats, langues, diplômes…) : traduites à l'affichage. */
  const tv = (value: string) => (isFr ? value : (t('values', { returnObjects: true }) as Record<string, string>)[value] ?? value);
  const serviceName = useServiceName();
  const { user, updateUserLocally } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [project, setProject] = useState<StudyProject>(() => {
    const draft = loadDraft();
    const country = searchParams.get('country');
    if (searchParams.get('project')) return emptyProject();
    const withCountry = (p: StudyProject): StudyProject => (!country || p.destinations.some(d => d.country === country)
      ? p
      : { ...p, destination: country, cities: [], destinations: [...syncedDestinations(p), { country, label: country, cities: [] }] });
    if (draft) return draft.destination ? draft : withCountry(draft);
    return withCountry(emptyProject());
  });
  const [loadingProject, setLoadingProject] = useState(!!searchParams.get('project'));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [ignoreCities, setIgnoreCities] = useState(false);

  // Catalogue
  const [studyCountries, setStudyCountries] = useState<StudyCountry[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  // Intitulés des programmes dans la langue du site, à l'affichage seulement (la recherche par
  // domaine porte sur les intitulés d'origine).
  const programLabel = useContentLabels(universities.flatMap(u => (u.programs ?? []).map(p => p.name)));
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [languageCenters, setLanguageCenters] = useState<LanguageCenter[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [recognition, setRecognition] = useState<RecognitionProvider[]>([]);
  const [orientation, setOrientation] = useState<OrientationResource[]>([]);
  const [visa, setVisa] = useState<any>(null);
  const [offers, setOffers] = useState<VocationalOffer[]>([]);
  const { pricing, error: pricingError } = usePricing();
  const { firstPurchase } = usePaymentEligibility(user?.id);
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
        else setFeedback({ tone: 'error', text: t('fb.not_found') });
      })
      .catch(() => mounted && setFeedback({ tone: 'error', text: t('fb.load_error') }))
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
      // Verdict dans la langue du site (le serveur ne l'écrit qu'en français et en anglais).
      .then(r => mounted && setVisa(r ? { ...r, message: visaVerdict(r, nationality, project.destination, lang) } : r))
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
  const paymentCtx = { residence: project.profile.residence, firstPurchase };
  const liveSnapshot = pricing ? computeSnapshot(codes, pricing, project.price, 1, paymentCtx) : null;
  const currentProject = project;
  const priceOf = (code: string) => pricing?.services.find(sv => sv.code === code)?.price_cents ?? null;
  const withSnapshot = (p: StudyProject): StudyProject =>
    ({ ...p, price: { ...p.price, snapshot: pricing ? computeSnapshot(projectCodes(p), pricing, p.price, 1, { residence: p.profile.residence, firstPurchase }) : p.price.snapshot } });

  // ── Dérivés ─────────────────────────────────────────────────────────────────

  const country = studyCountries.find(c => c.name === project.destination);
  const countryLabel = isFr ? country?.nameFr || project.destination : countryName(project.destination, lang, country?.name || project.destination);
  const guide = COUNTRY_GUIDES[project.destination];
  const level = LEVELS.find(l => l.id === project.level);
  const isUniversityLevel = !!level?.apiLevel;
  const levelInfo = levelGuide(project.destination, project.level);

  const citySuggestions = useMemo(() => {
    const seen = new Map<string, string>();
    universities.forEach(u => u.city.split(/[/(),]/).map(s => s.trim()).filter(Boolean).forEach(c => {
      if (!seen.has(cityKey(c))) seen.set(cityKey(c), c);
    }));
    return [...seen.values()].sort((a, b) => a.localeCompare(b, lang));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universities, lang]);

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
  if (!project.destination) missing.push(t('missing.destination'));
  if (!project.level) missing.push(t('missing.level'));
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

  // Plusieurs pays : chaque pays garde ses villes ; `destination` est celui affiché dans les résultats.
  const toggleCountry = (name: string, label: string) => {
    const list = syncedDestinations(project);
    if (list.some(d => d.country === name)) {
      const rest = list.filter(d => d.country !== name);
      const next = project.destination === name ? rest[0] : rest.find(d => d.country === project.destination);
      update({ destinations: rest, destination: next?.country ?? '', destinationLabel: next?.label, cities: next?.cities ?? [] });
    } else {
      update({ destinations: [...list, { country: name, label, cities: [] }], destination: name, destinationLabel: label, cities: [] });
    }
    setIgnoreCities(false);
  };
  const showCountry = (name: string) => {
    if (name === project.destination) return;
    const list = syncedDestinations(project);
    const next = list.find(d => d.country === name);
    if (!next) return;
    update({ destinations: list, destination: name, destinationLabel: next.label, cities: next.cities });
    setIgnoreCities(false);
  };

  const setLanguages = (languages: SpokenLanguage[]) =>
    updateProfile({ languages, languageLevel: languagesText(languages) });

  const toggleShortlist = (u: University) => {
    const exists = project.shortlist.some(s => s.id === u.id);
    update({
      shortlist: exists
        ? project.shortlist.filter(s => s.id !== u.id)
        : [...project.shortlist, { id: u.id, name: u.name, city: u.city, country: countryLabel }],
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
      setFeedback({ tone: 'error', text: t('fb.complete_first', { list: missing.join(t('missing.and')) }) });
      return null;
    }
    const project = withSnapshot(projectState);
    if (!user) {
      const stored = saveDraft(project);
      setDirty(false);
      setNeedsAccount(true);
      setFeedback(stored
        ? { tone: 'info', text: t('fb.saved_device') }
        : { tone: 'error', text: t('fb.storage_blocked') });
      return stored;
    }
    setSaving(true);
    try {
      const saved = await saveProjectToAccount(project, countryLabel);
      await syncProfile();
      setProject(saved);
      setDirty(false);
      clearDraft();
      setFeedback({ tone: 'success', text: t('fb.saved_account') });
      return saved;
    } catch (err: any) {
      saveDraft(project);
      setFeedback({
        tone: 'error',
        text: err?.status === 401
          ? t('fb.session_expired')
          : t('fb.save_failed'),
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
      setFeedback({ tone: 'info', text: t('fb.login_to_send') });
      return;
    }
    if (project.services.length === 0) {
      setFeedback({ tone: 'error', text: t('fb.pick_service_send') });
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
      setFeedback({ tone: 'success', text: t('fb.request_sent') });
    } catch {
      setFeedback({ tone: 'error', text: t('fb.request_failed') });
    } finally {
      setSending(false);
    }
  };

  // Paiement en ligne : le projet est d'abord enregistré, puis le serveur recalcule le prix de
  // l'offre choisie (aucun montant n'est envoyé) et ouvre Stripe Checkout. Sans compte, le
  // brouillon est gardé et l'on passe par la connexion (ou l'inscription), qui revient ici
  // avec `?pay=1` : le paiement reprend tout seul.
  const pay = async (termsAccepted = acceptTerms) => {
    if (!user) {
      saveDraft(withSnapshot(project));
      navigate(loginToPayHref('/study'));
      return;
    }
    setPaying(true);
    const saved = await save();
    if (!saved) { setPaying(false); return; }
    const codesToPay = projectCodes(saved);
    if (!codesToPay.length && saved.price.offerId !== 'consultation') {
      setFeedback({ tone: 'error', text: t('fb.pick_service_pay') });
      setPaying(false);
      return;
    }
    const error = await goToCheckout({
      codes: codesToPay,
      offerId: saved.price.snapshot?.offerId ?? saved.price.offerId,
      installments: saved.price.installments,
      tripId: saved.tripId,
      residence: saved.profile.residence,
      consultationSlot: saved.price.consultationSlot,
      acceptTerms: termsAccepted,
    });
    if (error) {
      setFeedback({ tone: 'error', text: error });
      setPaying(false);
    }
  };

  // Retour de connexion après « Payer en ligne » : les CGV avaient été acceptées pour cliquer.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || searchParams.get(RESUME_PAY_PARAM) !== '1' || !user || !pricing || loadingProject) return;
    resumed.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete(RESUME_PAY_PARAM);
    setSearchParams(next, { replace: true });
    setAcceptTerms(true);
    setFeedback({ tone: 'info', text: t('fb.resuming_payment') });
    pay(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pricing, loadingProject, searchParams]);

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
    ? { label: t('status.sent'), className: 'bg-emerald-100 text-emerald-800' }
    : project.tripId && !dirty
      ? { label: t('status.saved'), className: 'bg-emerald-100 text-emerald-800' }
      : project.tripId
        ? { label: t('status.unsaved'), className: 'bg-amber-100 text-amber-800' }
        : { label: user ? t('status.not_saved') : t('status.draft'), className: 'bg-gray-100 text-gray-700' };

  const redirect = encodeURIComponent('/study');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-2">🎓 MIDZO Study</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('hero.title')}</h1>
          <p className="mt-3 text-blue-50 max-w-3xl">
            {t('hero.text')}
            {!user && ` ${t('hero.no_account')}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Profil */}
          <Section step={1} title={t('profile.title')} subtitle={t('profile.subtitle')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sp-nationality" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.nationality')}</label>
                <select id="sp-nationality" value={project.profile.nationality} onChange={e => updateProfile({ nationality: e.target.value })} className={fieldClass}>
                  <option value="">{t('common.choose')}</option>
                  <optgroup label={t('profile.africa')}>{origins.africa.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label={t('profile.other_countries')}>{origins.others.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.nationality && !isKnownOrigin(project.profile.nationality) && (
                    <option value={project.profile.nationality}>{project.profile.nationality}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="sp-residence" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.residence')}</label>
                <select id="sp-residence" value={project.profile.residence} onChange={e => updateProfile({ residence: e.target.value })} className={fieldClass}>
                  <option value="">{t('common.choose')}</option>
                  <optgroup label={t('profile.africa')}>{origins.africa.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label={t('profile.other_countries')}>{origins.others.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.residence && !isKnownOrigin(project.profile.residence) && (
                    <option value={project.profile.residence}>{project.profile.residence}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="sp-diploma" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.diploma')}</label>
                <select id="sp-diploma" value={project.profile.diploma} onChange={e => updateProfile({ diploma: e.target.value })} className={fieldClass}>
                  <option value="">{t('common.choose')}</option>
                  {DIPLOMAS.map(g => (
                    <optgroup key={g.group} label={tv(g.group)}>{g.options.map(o => <option key={o} value={o}>{tv(o)}</option>)}</optgroup>
                  ))}
                  {project.profile.diploma && !ALL_DIPLOMAS.includes(project.profile.diploma) && (
                    <option value={project.profile.diploma}>{project.profile.diploma} {t('profile.old_entry')}</option>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <p className="block text-sm font-medium text-gray-700 mb-1">{t('profile.languages')}</p>
                <div className="space-y-2" role="group" aria-label={t('profile.languages')}>
                  {project.profile.languages.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <select aria-label={t('profile.language_n', { n: i + 1 })} value={l.language} className={fieldClass}
                        onChange={e => setLanguages(project.profile.languages.map((x, j) => (j === i ? { ...x, language: e.target.value } : x)))}>
                        <option value="">{t('profile.language_placeholder')}</option>
                        {PROFILE_LANGUAGES.filter(name => name === l.language || !project.profile.languages.some(x => x.language === name))
                          .map(name => <option key={name} value={name}>{tv(name)}</option>)}
                        {l.language && !PROFILE_LANGUAGES.includes(l.language) && <option value={l.language}>{l.language}</option>}
                      </select>
                      <select aria-label={t('profile.level_n', { n: i + 1 })} value={l.level} className={fieldClass}
                        onChange={e => setLanguages(project.profile.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))}>
                        {LANGUAGE_LEVELS.map(lv => <option key={lv.value} value={lv.value}>{tv(lv.label)}</option>)}
                      </select>
                      <button type="button" aria-label={t('profile.remove_language', { n: i + 1 })} title={t('common.remove')}
                        onClick={() => setLanguages(project.profile.languages.filter((_, j) => j !== i))}
                        className="h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setLanguages([...project.profile.languages, { language: '', level: 'B1' }])}
                    className="text-sm font-medium text-primary hover:underline">+ {t('profile.add_language')}</button>
                </div>
              </div>
            </div>
          </Section>

          {/* 2. Projet */}
          <Section step={2} title={t('project.title')} subtitle={t('project.subtitle')}>
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">{t('project.destination')}</p>
                <p className="text-xs text-gray-500 mb-2">{t('project.destination_hint')}</p>
                {studyCountries.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('project.loading_countries')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('project.destination')}>
                    {studyCountries.map(c => (
                      <Chip key={c.id} active={project.destinations.some(d => d.country === c.name)}
                        onClick={() => toggleCountry(c.name, c.nameFr || c.name)}>
                        {c.flag} {isFr ? c.nameFr || c.name : countryName(c.name, lang)}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('project.level')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label={t('project.level')}>
                  {LEVELS.map(l => (
                    <button key={l.id} type="button" aria-pressed={project.level === l.id}
                      onClick={() => update({
                        level: l.id,
                        domains: l.id === 'medicine_first_year' ? ['medicine']
                          : l.id === 'vocational' && project.domains.length === 0 ? ['nursing'] : project.domains,
                      })}
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        project.level === l.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                      <span className="block font-semibold text-gray-900">{t(`level.${l.id}.label`, { defaultValue: l.label })}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{t(`level.${l.id}.hint`, { defaultValue: l.hint })}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('project.domains')}</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('project.domains')}>
                  {DOMAINS.map(d => (
                    <Chip key={d.id} active={project.domains.includes(d.id)} onClick={() => update({ domains: toggle(project.domains, d.id) })}>
                      {t(`domain.${d.id}`, { defaultValue: d.label })}
                    </Chip>
                  ))}
                </div>
                <input value={project.fieldQuery} onChange={e => update({ fieldQuery: e.target.value })}
                  aria-label={t('project.field_label')} placeholder={t('project.field_placeholder')}
                  className={`${fieldClass} mt-3`} />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('project.cities')}</p>
                {project.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.cities.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {c}
                        <button type="button" aria-label={t('project.remove_city', { city: c })} onClick={() => update({ cities: project.cities.filter(x => x !== c) })}
                          className="ml-1 hover:text-gray-200">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={cityInput} onChange={e => setCityInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(cityInput); setCityInput(''); } }}
                    aria-label={t('project.add_city')} placeholder={project.destination ? t('project.add_city_placeholder') : t('project.pick_country_first')}
                    disabled={!project.destination} list="sp-city-suggestions" className={fieldClass} />
                  <datalist id="sp-city-suggestions">{citySuggestions.map(c => <option key={c} value={c} />)}</datalist>
                  <button type="button" disabled={!cityInput.trim()} onClick={() => { addCity(cityInput); setCityInput(''); }}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40">{t('common.add')}</button>
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
                  <label htmlFor="sp-start" className="block text-sm font-medium text-gray-700 mb-1">{t('project.start')}</label>
                  <input id="sp-start" type="month" value={project.startMonth} onChange={e => update({ startMonth: e.target.value })} className={fieldClass} />
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">{t('project.teaching_language')}</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('project.teaching_language')}>
                    {TEACHING_LANGUAGES.map(l => (
                      <Chip key={l} active={project.preferences.teachingLanguages.includes(l)}
                        onClick={() => updatePreferences({ teachingLanguages: toggle(project.preferences.teachingLanguages, l) })}>{tv(l)}</Chip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">{t('project.format')}</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('project.format')}>
                    {FORMATS.map(f => (
                      <Chip key={f} active={project.preferences.formats.includes(f)}
                        onClick={() => updatePreferences({ formats: toggle(project.preferences.formats, f) })}>{tv(f)}</Chip>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-2 text-sm text-gray-700 md:mt-6">
                  <input type="checkbox" checked={project.preferences.publicOnly}
                    onChange={e => updatePreferences({ publicOnly: e.target.checked })} className="mt-0.5 rounded text-primary focus:ring-primary" />
                  {t('project.public_only')}
                </label>
              </div>
            </div>
          </Section>

          {/* 3. Catalogue */}
          <Section step={3} id="sp-results" title={t('catalog.title')}
            subtitle={project.destination ? `${t('catalog.for', { country: countryLabel })}${level ? ` · ${t(`level.${level.id}.label`, { defaultValue: level.label })}` : ''}` : t('catalog.pick_country')}>
            {project.destinations.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label={t('catalog.results_for')}>
                <span className="text-sm text-gray-500 mr-1">{withColon(t('catalog.results_for'))}</span>
                {project.destinations.map(d => (
                  <button key={d.country} type="button" role="tab" aria-selected={d.country === project.destination}
                    onClick={() => showCountry(d.country)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      d.country === project.destination ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}`}>
                    {isFr ? d.label : countryName(d.country, lang, d.label)}
                  </button>
                ))}
              </div>
            )}
            {!project.destination ? (
              <p className="text-gray-500 text-sm">{t('catalog.select_destination')}</p>
            ) : loadingCatalog ? (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-6" data-testid="catalog-loading">
                <span className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
                {t('catalog.loading', { country: countryLabel })}
              </div>
            ) : (
              <div className="space-y-6">
                {country && (
                  <InfoCard title={`${country.flag ?? ''} ${t('catalog.study_in', { country: countryLabel })}`}>
                    {country.description && <p>{country.description}</p>}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {!!country.languageInstruction?.length && (<div><dt className="font-medium">{t('catalog.teaching_languages')}</dt><dd>{country.languageInstruction.join(', ')}</dd></div>)}
                      {country.tuitionRange && (<div><dt className="font-medium">{t('catalog.tuition')}</dt><dd>{country.tuitionRange}</dd></div>)}
                      {country.livingCost && (<div><dt className="font-medium">{t('catalog.living_cost')}</dt><dd>{country.livingCost}</dd></div>)}
                      {country.processingTimeVisa && (<div><dt className="font-medium">{t('catalog.visa_delay')}</dt><dd>{country.processingTimeVisa}</dd></div>)}
                      {!!country.popularScholarships?.length && (<div><dt className="font-medium">{t('catalog.scholarships')}</dt><dd>{country.popularScholarships.join(', ')}</dd></div>)}
                      {!!country.admissionRequirements?.length && (<div><dt className="font-medium">{t('catalog.admission')}</dt><dd>{country.admissionRequirements.join(', ')}</dd></div>)}
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
                    <h3 className="font-semibold text-gray-900 mb-2">{t('catalog.your_cities')}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {cityCoverage.map(c => (
                        <li key={c.city} className="rounded-lg border border-gray-200 p-3">
                          <span className="font-medium text-gray-900">{c.city}</span>
                          <span className="block text-gray-600">
                            {isVocational
                              ? (c.offers ? t('catalog.city_offers', { count: c.offers }) : t('catalog.city_no_offers'))
                              : c.universities === 0
                                ? t('catalog.city_no_universities')
                                : `${t('catalog.city_universities', { count: c.universities })}${isUniversityLevel ? ` · ${t('catalog.city_matching', { count: c.matching })}` : ''}`}
                            {' · '}{c.housing ? t('catalog.city_housing', { count: c.housing }) : t('catalog.city_no_housing')}
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
                        {t('catalog.universities', { count: matches.length })}
                      </h3>
                      {project.cities.length > 0 && (
                        <button type="button" onClick={() => setIgnoreCities(!ignoreCities)} className="text-sm text-secondary hover:text-primary underline">
                          {ignoreCities ? t('catalog.back_to_cities') : t('catalog.whole_country', { count: countryWideCount })}
                        </button>
                      )}
                    </div>
                    {project.preferences.publicOnly && (
                      <p className="text-xs text-gray-500 mb-3" data-testid="public-filter-note">
                        {t('project.public_only')} : {excludedPrivate > 0 ? t('catalog.private_excluded', { count: excludedPrivate }) : t('catalog.no_private')}
                        {unknownStatus > 0 && ` · ${t('catalog.unknown_status', { count: unknownStatus })}`}.
                      </p>
                    )}
                    {project.preferences.formats.length > 0 && !matches.some(m => m.formatOk) && matches.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        {t('catalog.format_unconfirmed', { formats: project.preferences.formats.map(tv).join(' / ') })}
                      </p>
                    )}
                    {matches.length === 0 ? (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                        {project.cities.length && !ignoreCities ? t('catalog.no_match_cities') : t('catalog.no_match')}
                        {project.cities.length > 0 && !ignoreCities && countryWideCount > 0 && ` ${t('catalog.match_elsewhere', { count: countryWideCount, country: countryLabel })}`}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {[{ list: bestMatches, heading: '' }, {
                          list: otherMatches,
                          heading: otherMatches.some(m => !m.languageOk)
                            ? t('catalog.other_language', { languages: project.preferences.teachingLanguages.map(tv).join(', ') })
                            : t('catalog.format_not_confirmed', { formats: project.preferences.formats.map(tv).join(', ') }),
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
                                            {u.isPublic === true ? t('catalog.public') : u.isPublic === false ? t('catalog.private') : t('catalog.status_unknown')}
                                          </span>
                                          {languageFromProgram && project.preferences.teachingLanguages.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                                              {t('catalog.taught_in', { languages: project.preferences.teachingLanguages.map(tv).join(' / ') })}
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <button type="button" onClick={() => toggleShortlist(u)} aria-pressed={picked}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${picked ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary/10'}`}>
                                        {picked ? `★ ${t('catalog.shortlisted')}` : `☆ ${t('catalog.shortlist')}`}
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3">
                                      {programs.slice(0, 6).map(p => (
                                        <span key={p.id} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                          {programLabel(p.name)} ({p.level}){p.teachingLanguages?.length ? ` · ${p.teachingLanguages.map(tv).join('/')}` : ''}
                                          {p.formats?.length ? ` · ${p.formats.map(tv).join(', ')}` : ''}
                                        </span>
                                      ))}
                                      {programs.length > 6 && <span className="text-xs text-gray-500">+{programs.length - 6}</span>}
                                    </div>
                                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                      {u.requiredLanguage && <div><dt className="inline font-medium">{withColon(t('catalog.language'))} </dt><dd className="inline">{tv(u.requiredLanguage)} {u.requiredLanguageLevel}</dd></div>}
                                      {u.minimumGrade && <div><dt className="inline font-medium">{withColon(t('catalog.min_grade'))} </dt><dd className="inline">{u.minimumGrade}</dd></div>}
                                      {u.admissionRequirements && <div className="sm:col-span-2"><dt className="inline font-medium">{withColon(t('catalog.admission'))} </dt><dd className="inline">{u.admissionRequirements}</dd></div>}
                                    </dl>
                                    <div className="flex gap-3 mt-3 text-sm">
                                      {u.website && <a href={externalHref(u.website)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">{t('catalog.website')} ↗</a>}
                                      {u.applicationUrl && <a href={externalHref(u.applicationUrl)} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">{t('catalog.apply')} ↗</a>}
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
                      {project.cities.length ? t('catalog.ausbildung_in_cities', { count: offersInCities.length }) : t('catalog.ausbildung', { count: offersInCities.length })}
                    </h3>
                    {offersInCities.length === 0 ? (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                        {offersForDomain.length
                          ? t('catalog.ausbildung_elsewhere', { count: offersForDomain.length, country: countryLabel })
                          : t('catalog.ausbildung_none', { country: countryLabel })}
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
                                  {picked ? `★ ${t('catalog.kept')}` : `☆ ${t('catalog.keep')}`}
                                </button>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{o.occupation}</p>
                              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                {o.durationMonths && <div><dt className="inline font-medium">{withColon(t('catalog.duration'))} </dt><dd className="inline">{t('catalog.months', { count: o.durationMonths })}</dd></div>}
                                {o.languageLevel && <div><dt className="inline font-medium">{withColon(t('catalog.german'))} </dt><dd className="inline">{o.languageLevel}</dd></div>}
                                {o.salary && <div className="sm:col-span-2"><dt className="inline font-medium">{withColon(t('catalog.salary'))} </dt><dd className="inline">{o.salary}</dd></div>}
                                {!!o.startDates?.length && <div className="sm:col-span-2"><dt className="inline font-medium">{withColon(t('catalog.intakes'))} </dt><dd className="inline">{o.startDates.join(', ')}</dd></div>}
                                {!!o.documents?.length && <div className="sm:col-span-2"><dt className="inline font-medium">{withColon(t('catalog.documents'))} </dt><dd className="inline">{o.documents.join(' ; ')}</dd></div>}
                              </dl>
                              {o.applicationUrl && (
                                <a href={externalHref(o.applicationUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-secondary hover:text-primary underline">
                                  {t('catalog.employer_site')} ↗
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
                  <InfoCard title={t('catalog.visa_title')}>
                    {!project.profile.nationality ? (
                      <p>{t('catalog.visa_need_nationality')}</p>
                    ) : project.profile.nationality === project.destination ? (
                      <p>{t('catalog.visa_national')}</p>
                    ) : visa?.requirements ? (
                      <>
                        <p>{visa.message}</p>
                        {visa.requirements.costs?.processingTime && <p><span className="font-medium">{withColon(t('catalog.delay'))}</span> {visa.requirements.costs.processingTime}</p>}
                        {visa.requirements.costs?.cost && <p><span className="font-medium">{withColon(t('catalog.cost'))}</span> {visa.requirements.costs.cost} {visa.requirements.costs.currency ?? ''}</p>}
                        {!!visa.requirements.documents?.list?.length && (
                          <ul className="list-disc pl-5">{visa.requirements.documents.list.slice(0, 8).map((d: string) => <li key={d}>{d}</li>)}</ul>
                        )}
                        {visa.embassy && <p><span className="font-medium">{withColon(t('catalog.where_to_apply'))}</span> {visa.embassy.name}{visa.embassy.city ? ` — ${visa.embassy.city}` : ''}</p>}
                      </>
                    ) : visa ? (
                      <p>{t('catalog.visa_missing', { from: originLabel(project.profile.nationality, lang), to: countryLabel })}</p>
                    ) : (
                      <p>{t('catalog.visa_loading')}</p>
                    )}
                    {residenceDiffers && (
                      <p className="bg-white rounded-lg border border-gray-200 p-3">
                        {t('catalog.residence_note', { residence: originLabel(project.profile.residence, lang), country: countryLabel })}
                      </p>
                    )}
                    {guide && <LinkList links={guide.visa} />}
                  </InfoCard>

                  <InfoCard title={t('catalog.recognition_title')}>
                    {project.profile.diploma && <p>{withColon(t('catalog.your_diploma'))} <strong>{tv(project.profile.diploma)}</strong></p>}
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
                      <p>{t('catalog.recognition_none')}</p>
                    )}
                    {guide && <LinkList links={guide.recognition} />}
                    {guide && (<><p className="font-medium pt-2">{t('catalog.application')}</p><LinkList links={guide.application} /></>)}
                  </InfoCard>
                </div>

                {/* Langue et logement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard title={`${t('catalog.language_courses')}${destinationLanguage ? ` (${tv(destinationLanguage).toLowerCase()})` : ''}`}>
                    {relevantCenters.length ? (
                      <ul className="space-y-2">
                        {relevantCenters.slice(0, 4).map(c => {
                          const levels = c.levelsOffered?.length ? c.levelsOffered : (c.levels ? [c.levels] : []);
                          return (
                            <li key={c.id}>
                              <span className="font-medium">{c.name}</span> <span className="text-gray-500">— {c.city}</span>
                              <span className="block text-xs text-gray-500">
                                {[levels.join(' '), c.examsPrepared?.slice(0, 3).join(', '), c.priceFrom ? t('catalog.price_from', { price: c.priceFrom, unit: c.priceUnit ?? t('catalog.course') }) : ''].filter(Boolean).join(' · ')}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p>{t('catalog.language_none')}</p>
                    )}
                    <Link to="/services/language-center" className="text-secondary hover:text-primary underline">{t('catalog.all_language_centers')} →</Link>
                  </InfoCard>

                  <InfoCard title={t('catalog.housing')}>
                    {project.cities.length > 0 && housingInCities.length === 0 && accommodations.length > 0 && (
                      <p>{t('catalog.housing_elsewhere', { country: countryLabel })}</p>
                    )}
                    {housingToShow.length ? (
                      <ul className="space-y-2">
                        {housingToShow.slice(0, 4).map(a => (
                          <li key={a.id}>
                            <span className="font-medium">{a.name}</span> <span className="text-gray-500">— {a.city}</span>
                            {a.pricePerMonth != null && <span className="block text-xs text-gray-500">{t('catalog.rent', { price: a.pricePerMonth, currency: a.currency ?? 'EUR' })}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{t('catalog.housing_none')}</p>
                    )}
                    <Link to="/services/student-accommodation" className="text-secondary hover:text-primary underline">{t('catalog.all_housing')} →</Link>
                  </InfoCard>
                </div>

                {resources.length > 0 && (
                  <InfoCard title={t('catalog.resources')}>
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
          <Section step={4} title={t('services.title')} subtitle={t('services.subtitle')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label={t('services.title')}>
              {STUDY_SERVICES.map(s => {
                const active = project.services.includes(s.id);
                return (
                  <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${active ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input type="checkbox" checked={active} onChange={() => update({ services: toggle(project.services, s.id) })}
                      className="mt-1 rounded text-primary focus:ring-primary" />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900">{t(`service.${s.id}.label`, { defaultValue: s.label })}</span>
                        {priceOf(s.code) != null && <span className="text-sm font-semibold text-primary whitespace-nowrap">{formatMoney(priceOf(s.code)!)}</span>}
                      </span>
                      <span className="block text-xs text-gray-500">{s.code} · {t(`service.${s.id}.description`, { defaultValue: s.description })}</span>
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
                  <span className="font-semibold text-gray-900">{t('services.mix_title')}</span>
                  <span className="block text-xs text-gray-500">
                    {project.tourismServices.length
                      ? t('services.mix_added', { count: project.tourismServices.length })
                      : t('services.mix_hint')}
                  </span>
                </span>
                <span className="text-gray-400">{showTourism ? '−' : '+'}</span>
              </button>
              {showTourism && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4" role="group" aria-label={t('services.tourism')}>
                  {(pricing?.services ?? []).filter(sv => sv.family === 'tourism').map(sv => {
                    const active = project.tourismServices.includes(sv.code);
                    return (
                      <label key={sv.code} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer text-sm ${active ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={active} onChange={() => update({ tourismServices: toggle(project.tourismServices, sv.code) })}
                          className="mt-0.5 rounded text-primary focus:ring-primary" />
                        <span className="flex-1">{serviceName(sv)}</span>
                        <span className="text-primary font-semibold whitespace-nowrap">{formatMoney(sv.price_cents)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <textarea value={project.notes} onChange={e => update({ notes: e.target.value })} rows={3}
              aria-label={t('services.notes_label')} placeholder={t('services.notes_placeholder')}
              className={`${fieldClass} mt-4`} />
          </Section>

          {/* 5. Prix et package */}
          <Section step={5} title={t('price.title')} id="sp-package" subtitle={t('price.subtitle')}>
            <PricingStep pricing={pricing} pricingError={pricingError} codes={codes} choice={project.price}
              onChange={price => update({ price })} requestedSlug={requestedSlug}
              residence={project.profile.residence} firstPurchase={firstPurchase} />
          </Section>
        </div>

        {/* Récapitulatif + actions */}
        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-bold text-gray-900">{t('summary.title')}</h2>
              <span data-testid="project-status" className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
            </div>
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500">{t('summary.destinations', { count: project.destinations.length })}</dt><dd className="font-medium text-gray-900" data-testid="summary-destinations">{(isFr ? destinationsLabel(project, countryLabel) : syncedDestinations(project).map(d => countryName(d.country, lang, d.label)).join(', ')) || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('summary.level')}</dt><dd className="font-medium text-gray-900">{project.level ? t(`level.${project.level}.label`, { defaultValue: levelLabel(project.level) }) : '—'}</dd></div>
              <div><dt className="text-gray-500">{t('summary.domain')}</dt><dd className="font-medium text-gray-900">
                {[...DOMAINS.filter(d => project.domains.includes(d.id)).map(d => t(`domain.${d.id}`, { defaultValue: d.label })), project.fieldQuery].filter(Boolean).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">{t('project.cities')}</dt><dd className="font-medium text-gray-900">
                {syncedDestinations(project).filter(d => d.cities.length)
                  .map(d => `${d.cities.join(', ')}${project.destinations.length > 1 ? ` (${isFr ? d.label : countryName(d.country, lang, d.label)})` : ''}`).join(' ; ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">{t('summary.start')}</dt><dd className="font-medium text-gray-900">{project.startMonth || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('summary.services', { count: project.services.length })}</dt><dd className="font-medium text-gray-900">
                {STUDY_SERVICES.filter(s => project.services.includes(s.id)).map(s => t(`service.${s.id}.label`, { defaultValue: s.label })).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">{t('summary.shortlist', { count: project.shortlist.length })}</dt><dd className="font-medium text-gray-900">
                {project.shortlist.map(s => s.name).join(' ; ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">{t('summary.offer')}</dt><dd className="font-medium text-gray-900" data-testid="summary-package">
                {liveSnapshot ? snapshotLabel(liveSnapshot, t) : '—'}
              </dd></div>
              {project.offerShortlist.length > 0 && (
                <div><dt className="text-gray-500">{t('summary.ausbildung', { count: project.offerShortlist.length })}</dt><dd className="font-medium text-gray-900">
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

            {!canSave && <p className="mt-4 text-xs text-gray-500">{t('summary.to_complete', { list: missing.join(', ') })}</p>}

            <div className="mt-4 space-y-2">
              <button type="button" onClick={save} disabled={saving || sending || paying} data-testid="save-project"
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50">
                {saving ? t('actions.saving') : user ? t('actions.save_project') : t('actions.save_choices')}
              </button>
              <button type="button" onClick={sendRequest} disabled={saving || sending || paying} data-testid="send-request"
                className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 disabled:opacity-50">
                {sending ? t('actions.sending') : project.requestSentAt ? t('actions.resend') : t('actions.request')}
              </button>
              <TermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} />
              <button type="button" onClick={() => pay()} data-testid="pay-online"
                disabled={saving || sending || paying || !acceptTerms || (project.price.offerId === 'consultation' && !project.price.consultationSlot)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50">
                {paying ? t('actions.paying') : user ? t('actions.pay') : t('actions.login_and_pay')}
              </button>
              {!user && <p className="text-xs text-gray-500 text-center">{t('actions.pay_login_hint')}</p>}
              {project.price.offerId === 'consultation' && !project.price.consultationSlot && (
                <p className="text-xs text-amber-700 text-center">{t('actions.pick_slot')}</p>
              )}
              <Link to="/dashboard" className="block text-center w-full py-2 text-sm text-secondary hover:text-primary underline">
                {t('actions.dashboard')}
              </Link>
            </div>

            {(needsAccount || !user) && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
                <p className="font-medium mb-2">{t('account.title')}</p>
                <p className="mb-3">{t('account.text')}</p>
                <div className="flex gap-2">
                  <Link to={`/register?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg bg-secondary text-white font-medium">{t('account.register')}</Link>
                  <Link to={`/login?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg border border-secondary text-secondary font-medium">{t('account.login')}</Link>
                </div>
              </div>
            )}

            {(project.tripId || project.destination) && (
              <button type="button" onClick={startNew} className="mt-4 w-full text-xs text-gray-500 hover:text-red-600">
                {t('actions.new_project')}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudyPlanner;
