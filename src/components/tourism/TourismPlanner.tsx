import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { countryName, originCountryGroups } from '../../data/africanCountries';
import { Chip, InfoCard, Section, externalHref, fieldClass, toggle } from '../projects/plannerUi';
import { usePricing } from '../../pricing/usePricing';
import PricingStep, { useServiceName } from '../../pricing/PricingStep';
import { goToCheckout, loginToPayHref, RESUME_PAY_PARAM } from '../../pricing/checkout';
import { usePaymentEligibility } from '../../pricing/paymentRules';
import TermsCheckbox from '../legal/TermsCheckbox';
import { computeSnapshot, snapshotLabel } from '../../pricing/priceChoice';
import { quoteSelection } from '../../pricing/pricingEngine';
import {
  INTERESTS, TOURISM_SERVICES, TourismProject, TourismStop,
  clearTourismDraft, emptyTourismProject, loadTourismDraft, loadTourismProject, nightsBetween,
  saveTourismDraft, saveTourismToAccount, tourismSummary, tourismTitle, stopsLabel, syncedStops, itineraryText,
} from './tourismProject';
import { formatMoney, useCurrency } from '../../pricing/currency';
import { withColon } from '../common/catalogKit';
import { visaVerdict } from '../visa/VisaChecker';

// Parcours « Composer mon voyage » : profil → voyage → ce que propose le catalogue →
// services (T1..T10) → prix (à la carte, packages Tourism, paiement) → enregistrement / demande.

interface TourismCountry {
  id: number; name: string; nameFr?: string | null; flag?: string | null; description?: string | null;
  currency?: string | null; language?: string | null; bestTime?: string | null; avgBudgetPerDay?: string | null;
  topAttractions?: string[] | null; visaForAfricans?: string | null; processingTimeVisa?: string | null;
  directFlightsFrom?: string[] | null;
}

interface CatalogItem { id: number; name?: string; title?: string; city?: string | null; country?: string; description?: string | null; priceRange?: string | null; price?: string | null; link?: string | null; website?: string | null }

const today = () => new Date().toISOString().slice(0, 10);

const TourismPlanner: React.FC = () => {
  useCurrency();
  const { t, i18n } = useTranslation('tourism');
  const lang = i18n.language?.slice(0, 2) || 'fr';
  // Même liste que le parcours Study : l'Afrique d'abord, puis tous les autres pays (diaspora).
  const origins = useMemo(() => originCountryGroups(lang), [lang]);
  const isKnownOrigin = (value: string) => [...origins.africa, ...origins.others].some(c => c.value === value);
  const isFr = lang === 'fr';
  const st = (key: string, opts?: Record<string, unknown>) => t(`study:${key}`, opts);
  const serviceName = useServiceName();
  /** Envies enregistrées en français : traduites à l'affichage. */
  const interestLabel = (value: string) => (isFr ? value : (t('interests', { returnObjects: true }) as Record<string, string>)[value] ?? value);
  const countryText = (value: string, fallback?: string) => (isFr ? fallback || value : countryName(value, lang, fallback || value));
  const { user, updateUserLocally } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pricing, error: pricingError } = usePricing();
  const { firstPurchase } = usePaymentEligibility(user?.id);

  const [project, setProject] = useState<TourismProject>(() => {
    const country = searchParams.get('country');
    if (searchParams.get('project')) return emptyTourismProject();
    const draft = loadTourismDraft();
    const withCountry = (p: TourismProject): TourismProject => (!country || p.stops.some(st => st.country === country)
      ? p
      : { ...p, destination: country, cities: [], stops: [...syncedStops(p), { country, label: country, cities: [], nights: null }] });
    if (draft) return draft.destination ? draft : withCountry(draft);
    return withCountry(emptyTourismProject());
  });
  const [loadingProject, setLoadingProject] = useState(!!searchParams.get('project'));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [cityInput, setCityInput] = useState('');

  const [countries, setCountries] = useState<TourismCountry[]>([]);
  const [catalog, setCatalog] = useState<{ stays: CatalogItem[]; restaurants: CatalogItem[]; sites: CatalogItem[]; programs: CatalogItem[]; events: CatalogItem[] }>(
    { stays: [], restaurants: [], sites: [], programs: [], events: [] });
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [visa, setVisa] = useState<any>(null);

  const update = (patch: Partial<TourismProject>) => {
    setProject(prev => ({ ...prev, ...patch }));
    setDirty(true);
    setFeedback(null);
  };

  // Circuit type à personnaliser (?circuit=<slug>) : étapes, villes, nuits, services, voyageurs.
  useEffect(() => {
    const slug = searchParams.get('circuit');
    if (!slug || searchParams.get('project')) return;
    let mounted = true;
    apiService.getCircuit(slug).then(r => {
      const c = r?.data;
      if (!mounted || !c?.stops?.length) return;
      const stops = c.stops.map((st: any) => ({ country: st.country, label: st.label || st.country, cities: st.cities ?? [], nights: st.nights ?? null }));
      setProject(prev => ({
        ...prev,
        stops,
        destination: stops[0].country,
        destinationLabel: stops[0].label,
        cities: stops[0].cities,
        services: (c.services ?? []).filter((code: string) => TOURISM_SERVICES.some(sv => sv.id === code)),
        travelers: c.travelers_base ?? prev.travelers,
        notes: prev.notes || `Circuit type : ${c.title}`,
      }));
      setDirty(true);
      setFeedback({ tone: 'info', text: t('fb.circuit_loaded', { title: c.title }) });
    }).catch(() => { /* circuit introuvable : parcours vide */ });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Projet du compte ouvert depuis le dashboard (?project=<id>).
  useEffect(() => {
    const id = Number(searchParams.get('project'));
    if (!id) return;
    if (!user) { setLoadingProject(false); return; }
    let mounted = true;
    loadTourismProject(id)
      .then(p => {
        if (!mounted) return;
        if (p) { setProject(p); setDirty(false); }
        else setFeedback({ tone: 'error', text: t('fb.not_found') });
      })
      .catch(() => mounted && setFeedback({ tone: 'error', text: t('fb.load_error') }))
      .finally(() => mounted && setLoadingProject(false));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) return;
    setProject(prev => ({
      ...prev,
      profile: {
        nationality: prev.profile.nationality || user.nationality || '',
        residence: prev.profile.residence || user.country_of_residence || '',
      },
    }));
  }, [user]);

  // Brouillon sauvegardé en continu.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (loadingProject || !dirty) return;
    const timer = setTimeout(() => saveTourismDraft(project), 400);
    return () => clearTimeout(timer);
  }, [project, dirty, loadingProject]);

  useEffect(() => {
    apiService.getTourismCountries()
      .then(r => setCountries(r?.data ?? r?.countries ?? []))
      .catch(() => setCountries([]));
  }, []);

  // Catalogue de la destination : tant que tout n'est pas arrivé, on n'affiche pas « aucun résultat ».
  useEffect(() => {
    const country = project.destination;
    setCatalog({ stays: [], restaurants: [], sites: [], programs: [], events: [] });
    if (!country) return;
    let mounted = true;
    setLoadingCatalog(true);
    const list = (r: any) => (r?.data ?? r?.items ?? []) as CatalogItem[];
    const forCountry = (items: CatalogItem[]) => items.filter(i => !i.country || i.country === country);
    Promise.allSettled([
      apiService.getTourismAccommodations({ country }).then(list),
      apiService.getRestaurants({ country }).then(list),
      apiService.getTouristSites({ country }).then(list),
      apiService.getTourismPrograms().then(r => forCountry(list(r))),
      apiService.getTourismEvents().then(r => forCountry(list(r))),
    ]).then(([stays, restaurants, sites, programs, events]) => {
      if (!mounted) return;
      const val = (r: PromiseSettledResult<CatalogItem[]>) => (r.status === 'fulfilled' ? r.value : []);
      setCatalog({ stays: val(stays), restaurants: val(restaurants), sites: val(sites), programs: val(programs), events: val(events) });
    }).finally(() => mounted && setLoadingCatalog(false));
    return () => { mounted = false; };
  }, [project.destination]);

  // Visa : fiche publiée pour nationalité → destination (type « Tourisme »).
  useEffect(() => {
    setVisa(null);
    const { nationality } = project.profile;
    if (!nationality || !project.destination || nationality === project.destination) return;
    let mounted = true;
    apiService.checkTravelRequirements(nationality, project.destination, 'fr', 'Tourisme')
      // Verdict dans la langue du site (le serveur ne l'écrit qu'en français et en anglais).
      .then(r => mounted && setVisa(r ? { ...r, message: visaVerdict(r, nationality, project.destination, lang) } : r))
      .catch(() => mounted && setVisa({ error: true }));
    return () => { mounted = false; };
  }, [project.profile.nationality, project.destination]);

  // ── Dérivés ─────────────────────────────────────────────────────────────────

  const country = countries.find(c => c.name === project.destination);
  const countryLabel = isFr
    ? country?.nameFr || project.destinationLabel || project.destination
    : countryName(project.destination, lang, country?.name || project.destinationLabel || project.destination);
  const nights = nightsBetween(project.startDate, project.endDate);
  const requestedSlug = searchParams.get('package');
  const codes = project.services;
  const liveSnapshot = pricing ? computeSnapshot(codes, pricing, project.price, project.travelers, { residence: project.profile.residence, firstPurchase }) : null;
  const priceOf = (code: string) => pricing?.services.find(s => s.code === code)?.price_cents ?? null;

  useEffect(() => {
    if (!requestedSlug || !pricing || project.price.offerId) return;
    const offer = quoteSelection(codes, pricing, { travelers: project.travelers }).offers.find(o => o.lines.some(l => l.slug === requestedSlug));
    if (offer) update({ price: { ...project.price, offerId: offer.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSlug, pricing, codes.join(',')]);

  const dateError =
    project.startDate && project.startDate < today() ? t('dates.past')
      : project.startDate && project.endDate && project.endDate < project.startDate ? t('dates.order')
        : '';

  const missing: string[] = [];
  if (!project.destination) missing.push(t('missing.destination'));
  if (!project.startDate) missing.push(t('missing.start'));
  const canSave = missing.length === 0 && !dateError;

  // ── Actions ─────────────────────────────────────────────────────────────────

  // Itinéraire multi-destination : chaque étape garde ses villes ; `destination` = étape affichée.
  const toggleStop = (name: string, label: string) => {
    const list = syncedStops(project);
    if (list.some(st => st.country === name)) {
      const rest = list.filter(st => st.country !== name);
      const next = project.destination === name ? rest[0] : rest.find(st => st.country === project.destination);
      update({ stops: rest, destination: next?.country ?? '', destinationLabel: next?.label, cities: next?.cities ?? [] });
    } else {
      update({ stops: [...list, { country: name, label, cities: [], nights: null }], destination: name, destinationLabel: label, cities: [] });
    }
  };
  const showStop = (name: string) => {
    if (name === project.destination) return;
    const list = syncedStops(project);
    const next = list.find(st => st.country === name);
    if (next) update({ stops: list, destination: name, destinationLabel: next.label, cities: next.cities });
  };
  const moveStop = (index: number, delta: number) => {
    const list = syncedStops(project);
    const j = index + delta;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[index], copy[j]] = [copy[j], copy[index]];
    update({ stops: copy });
  };
  const setStopNights = (name: string, value: string) => {
    const n = parseInt(value, 10);
    update({ stops: syncedStops(project).map(st => (st.country === name ? { ...st, nights: Number.isInteger(n) && n > 0 ? Math.min(n, 365) : null } : st)) });
  };
  const plannedNights = project.stops.reduce((sum, st) => sum + (st.nights ?? 0), 0);

  const addCity = (raw: string) => {
    const city = raw.trim();
    if (!city || project.cities.some(c => c.toLowerCase() === city.toLowerCase())) return;
    update({ cities: [...project.cities, city] });
  };

  const withSnapshot = (p: TourismProject): TourismProject =>
    ({ ...p, price: { ...p.price, snapshot: pricing ? computeSnapshot(p.services, pricing, p.price, p.travelers, { residence: p.profile.residence, firstPurchase }) : p.price.snapshot } });

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
      /* le voyage reste enregistré même si le profil ne suit pas */
    }
  };

  const save = async (): Promise<TourismProject | null> => {
    if (!canSave) {
      setFeedback({ tone: 'error', text: dateError || st('fb.complete_first', { list: missing.join(st('missing.and')) }) });
      return null;
    }
    const current = withSnapshot(project);
    if (!user) {
      const stored = saveTourismDraft(current);
      setProject(current);
      setDirty(false);
      setFeedback(stored
        ? { tone: 'info', text: t('fb.saved_device') }
        : { tone: 'error', text: t('fb.storage_blocked') });
      return stored;
    }
    setSaving(true);
    try {
      const saved = await saveTourismToAccount(current, countryLabel);
      await syncProfile();
      setProject(saved);
      setDirty(false);
      clearTourismDraft();
      setFeedback({ tone: 'success', text: t('fb.saved_account') });
      return saved;
    } catch (err: any) {
      saveTourismDraft(current);
      setFeedback({
        tone: 'error',
        text: err?.status === 401
          ? st('fb.session_expired')
          : st('fb.save_failed'),
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const sendRequest = async () => {
    if (!user) {
      saveTourismDraft(withSnapshot(project));
      setFeedback({ tone: 'info', text: t('fb.login_to_send') });
      return;
    }
    if (project.services.length === 0 && project.price.offerId !== 'consultation') {
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
        subject: `Demande de voyage — ${tourismTitle(saved, countryLabel)}${saved.price.snapshot ? ` — ${saved.price.snapshot.offerLabel}` : ''}`,
        category: 'tourism',
        message: tourismSummary(saved, countryLabel),
      });
      const withRequest = await saveTourismToAccount({ ...saved, requestSentAt: new Date().toISOString() }, countryLabel);
      setProject(withRequest);
      setDirty(false);
      setFeedback({ tone: 'success', text: st('fb.request_sent') });
    } catch {
      setFeedback({ tone: 'error', text: t('fb.request_failed') });
    } finally {
      setSending(false);
    }
  };

  // Paiement en ligne : le projet est d'abord enregistré, puis le serveur recalcule le prix de
  // l'offre choisie (aucun montant n'est envoyé) et ouvre Stripe Checkout. Sans compte : brouillon
  // gardé, connexion (ou inscription), puis retour ici avec `?pay=1` et reprise du paiement.
  const pay = async (termsAccepted = acceptTerms) => {
    if (!user) {
      saveTourismDraft(withSnapshot(project));
      navigate(loginToPayHref('/tourism/plan'));
      return;
    }
    setPaying(true);
    const saved = await save();
    if (!saved) { setPaying(false); return; }
    const codesToPay = saved.services;
    if (!codesToPay.length && saved.price.offerId !== 'consultation') {
      setFeedback({ tone: 'error', text: st('fb.pick_service_pay') });
      setPaying(false);
      return;
    }
    const error = await goToCheckout({
      codes: codesToPay,
      offerId: saved.price.snapshot?.offerId ?? saved.price.offerId,
      installments: saved.price.installments,
      tripId: saved.tripId,
      travelers: saved.travelers,
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
    setFeedback({ tone: 'info', text: st('fb.resuming_payment') });
    pay(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pricing, loadingProject, searchParams]);

  const startNew = () => {
    clearTourismDraft();
    setProject({ ...emptyTourismProject(), profile: project.profile });
    setDirty(false);
    setFeedback(null);
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
    ? { label: st('status.sent'), className: 'bg-emerald-100 text-emerald-800' }
    : project.tripId && !dirty
      ? { label: st('status.saved'), className: 'bg-emerald-100 text-emerald-800' }
      : project.tripId
        ? { label: st('status.unsaved'), className: 'bg-amber-100 text-amber-800' }
        : { label: user ? st('status.not_saved') : st('status.draft'), className: 'bg-gray-100 text-gray-700' };

  const redirect = encodeURIComponent('/tourism/plan');
  const catalogCards: [string, CatalogItem[]][] = [
    [t('catalog.stays'), catalog.stays], [t('catalog.restaurants'), catalog.restaurants], [t('catalog.sites'), catalog.sites],
    [t('catalog.programs'), catalog.programs], [t('catalog.events'), catalog.events],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-orange-100 text-sm font-semibold uppercase tracking-widest mb-2">🌍 MIDZO Tourism</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('hero.title')}</h1>
          <p className="mt-3 text-orange-50 max-w-3xl">{t('hero.text')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section step={1} title={t('travelers.title')} subtitle={t('travelers.subtitle')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tp-nationality" className="block text-sm font-medium text-gray-700 mb-1">{st('profile.nationality')}</label>
                <select id="tp-nationality" value={project.profile.nationality} onChange={e => update({ profile: { ...project.profile, nationality: e.target.value } })} className={fieldClass}>
                  <option value="">{st('common.choose')}</option>
                  <optgroup label={st('profile.africa')}>{origins.africa.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label={st('profile.other_countries')}>{origins.others.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.nationality && !isKnownOrigin(project.profile.nationality) && (
                    <option value={project.profile.nationality}>{project.profile.nationality}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="tp-residence" className="block text-sm font-medium text-gray-700 mb-1">{st('profile.residence')}</label>
                <select id="tp-residence" value={project.profile.residence} onChange={e => update({ profile: { ...project.profile, residence: e.target.value } })} className={fieldClass}>
                  <option value="">{st('common.choose')}</option>
                  <optgroup label={st('profile.africa')}>{origins.africa.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  <optgroup label={st('profile.other_countries')}>{origins.others.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>
                  {project.profile.residence && !isKnownOrigin(project.profile.residence) && (
                    <option value={project.profile.residence}>{project.profile.residence}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="tp-travelers" className="block text-sm font-medium text-gray-700 mb-1">{t('travelers.count')}</label>
                <input id="tp-travelers" type="number" min={1} max={50} value={project.travelers}
                  onChange={e => update({ travelers: Math.min(50, Math.max(1, Number(e.target.value) || 1)) })} className={fieldClass} />
              </div>
            </div>
          </Section>

          <Section step={2} title={t('trip.title')} subtitle={t('trip.subtitle')}>
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">{t('trip.destinations')}</p>
                <p className="text-xs text-gray-500 mb-2">{t('trip.destinations_hint')}</p>
                {countries.length === 0 ? <p className="text-sm text-gray-500">{t('trip.loading')}</p> : (
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('trip.destinations')}>
                    {countries.map(c => (
                      <Chip key={c.id} active={project.stops.some(st => st.country === c.name)}
                        onClick={() => toggleStop(c.name, c.nameFr || c.name)}>
                        {c.flag} {countryText(c.name, c.nameFr || c.name)}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
              {project.stops.length > 0 && (
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">{t('trip.itinerary')}</p>
                  <ol className="space-y-2" aria-label={t('trip.itinerary')} data-testid="itinerary">
                    {syncedStops(project).map((stop: TourismStop, i, all) => {
                      const label = countryText(stop.country, stop.label);
                      return (
                        <li key={stop.country} className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 ${stop.country === project.destination ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                          <span className="h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <button type="button" onClick={() => showStop(stop.country)} className="font-medium text-gray-900 hover:text-orange-600">{label}</button>
                          <span className="text-xs text-gray-500 flex-1 min-w-[6rem]">{stop.cities.join(', ') || t('trip.cities_tbd')}</span>
                          <label className="flex items-center gap-1 text-xs text-gray-600">
                            <input type="number" min={1} max={365} value={stop.nights ?? ''} onChange={e => setStopNights(stop.country, e.target.value)}
                              aria-label={t('trip.nights_in', { country: label })} className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm" />
                            {t('trip.nights_word')}
                          </label>
                          <button type="button" aria-label={t('trip.move_up', { country: label })} disabled={i === 0} onClick={() => moveStop(i, -1)} className="px-1.5 text-gray-500 disabled:opacity-30">▲</button>
                          <button type="button" aria-label={t('trip.move_down', { country: label })} disabled={i === all.length - 1} onClick={() => moveStop(i, 1)} className="px-1.5 text-gray-500 disabled:opacity-30">▼</button>
                          <button type="button" aria-label={t('trip.remove_stop', { country: label })} onClick={() => toggleStop(stop.country, stop.label)} className="px-1.5 text-gray-400 hover:text-red-600">×</button>
                        </li>
                      );
                    })}
                  </ol>
                  {nights != null && plannedNights > 0 && plannedNights !== nights && (
                    <p className="text-xs text-amber-700 mt-2" data-testid="nights-mismatch">
                      {t('trip.nights_mismatch', { planned: t('trip.nights', { count: plannedNights }), total: t('trip.nights', { count: nights }) })}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('trip.cities')}{project.stops.length > 1 && project.destination ? ` — ${countryLabel}` : ''}</p>
                {project.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.cities.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                        {c}
                        <button type="button" aria-label={st('project.remove_city', { city: c })} onClick={() => update({ cities: project.cities.filter(x => x !== c) })}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={cityInput} onChange={e => setCityInput(e.target.value)} disabled={!project.destination}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(cityInput); setCityInput(''); } }}
                    aria-label={t('trip.add_stop')} placeholder={project.destination ? t('trip.add_city_placeholder') : t('trip.pick_destination_first')} className={fieldClass} />
                  <button type="button" disabled={!cityInput.trim()} onClick={() => { addCity(cityInput); setCityInput(''); }}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium disabled:opacity-40">{st('common.add')}</button>
                </div>
                {!!country?.topAttractions?.length && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {country.topAttractions.filter(a => !project.cities.includes(a)).map(a => (
                      <button key={a} type="button" onClick={() => addCity(a)} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600">+ {a}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tp-start" className="block text-sm font-medium text-gray-700 mb-1">{t('trip.start')}</label>
                  <input id="tp-start" type="date" min={today()} value={project.startDate} onChange={e => update({ startDate: e.target.value })} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="tp-end" className="block text-sm font-medium text-gray-700 mb-1">{t('trip.end')}</label>
                  <input id="tp-end" type="date" min={project.startDate || today()} value={project.endDate} onChange={e => update({ endDate: e.target.value })} className={fieldClass} />
                </div>
              </div>
              {dateError && <p className="text-sm text-red-600" role="alert">{dateError}</p>}
              {!dateError && nights != null && <p className="text-sm text-gray-600" data-testid="trip-nights">{t('trip.nights_on_site', { nights: t('trip.nights', { count: nights }) })}</p>}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('trip.interests')}</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('trip.interests')}>
                  {INTERESTS.map(i => <Chip key={i} active={project.interests.includes(i)} onClick={() => update({ interests: toggle(project.interests, i) })}>{interestLabel(i)}</Chip>)}
                </div>
              </div>
            </div>
          </Section>

          <Section step={3} id="tp-results" title={st('catalog.title')}
            subtitle={project.destination ? st('catalog.for', { country: countryLabel }) : t('catalog.pick_destination')}>
            {project.stops.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label={t('catalog.info_for')}>
                <span className="text-sm text-gray-500 mr-1">{withColon(t('catalog.info_for'))}</span>
                {project.stops.map(stop => (
                  <button key={stop.country} type="button" role="tab" aria-selected={stop.country === project.destination}
                    onClick={() => showStop(stop.country)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      stop.country === project.destination ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}>
                    {countryText(stop.country, stop.label)}
                  </button>
                ))}
              </div>
            )}
            {!project.destination ? (
              <p className="text-gray-500 text-sm">{t('catalog.select_destination')}</p>
            ) : loadingCatalog ? (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-6" data-testid="catalog-loading">
                <span className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
                {st('catalog.loading', { country: countryLabel })}
              </div>
            ) : (
              <div className="space-y-4">
                {country && (
                  <InfoCard title={`${country.flag ?? ''} ${countryLabel}`}>
                    {country.description && <p>{country.description}</p>}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {country.bestTime && <div><dt className="font-medium">{t('catalog.best_time')}</dt><dd>{country.bestTime}</dd></div>}
                      {country.avgBudgetPerDay && <div><dt className="font-medium">{t('catalog.budget')}</dt><dd>{t('catalog.per_day', { budget: country.avgBudgetPerDay })}</dd></div>}
                      {country.currency && <div><dt className="font-medium">{t('catalog.currency')}</dt><dd>{country.currency}</dd></div>}
                      {country.language && <div><dt className="font-medium">{t('catalog.languages')}</dt><dd>{country.language}</dd></div>}
                      {!!country.directFlightsFrom?.length && <div className="sm:col-span-2"><dt className="font-medium">{t('catalog.direct_flights')}</dt><dd>{country.directFlightsFrom.join(', ')}</dd></div>}
                    </dl>
                  </InfoCard>
                )}

                <InfoCard title={st('catalog.visa_title')}>
                  {!project.profile.nationality ? <p>{t('catalog.visa_need_nationality')}</p>
                    : project.profile.nationality === project.destination ? <p>{t('catalog.visa_national')}</p>
                      : visa?.requirements ? (
                        <>
                          <p>{visa.message}</p>
                          {visa.requirements.costs?.processingTime && <p><span className="font-medium">{withColon(st('catalog.delay'))}</span> {visa.requirements.costs.processingTime}</p>}
                        </>
                      ) : (
                        <p data-testid="visa-fallback">
                          {t('catalog.visa_fallback')}
                          {' '}<strong>{country?.visaForAfricans ?? t('catalog.visa_check_embassy')}</strong>
                          {country?.processingTimeVisa ? ` (${t('catalog.visa_delay', { delay: country.processingTimeVisa })})` : ''}.
                        </p>
                      )}
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogCards.map(([title, items]) => (
                    <InfoCard key={title} title={`${title} (${items.length})`}>
                      {items.length ? (
                        <ul className="space-y-1">
                          {items.slice(0, 4).map(i => {
                            const href = i.link || i.website;
                            const label = i.name || i.title || '';
                            return (
                              <li key={i.id}>
                                {href ? <a href={externalHref(href)} target="_blank" rel="noopener noreferrer" className="text-secondary underline">{label}</a> : <span className="font-medium">{label}</span>}
                                {i.city && <span className="text-gray-500"> — {i.city}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      ) : <p className="text-gray-500">{t('catalog.nothing', { country: countryLabel })}</p>}
                    </InfoCard>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section step={4} title={st('services.title')} subtitle={t('services.subtitle')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label={st('services.title')}>
              {TOURISM_SERVICES.map(s => {
                const active = project.services.includes(s.id);
                const price = priceOf(s.id);
                return (
                  <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                    <input type="checkbox" checked={active} onChange={() => update({ services: toggle(project.services, s.id) })} className="mt-1 rounded text-orange-500 focus:ring-orange-500" />
                    <span className="flex-1 flex items-baseline justify-between gap-2">
                      <span><span className="block font-semibold text-gray-900">{serviceName({ code: s.id, name: s.label })}</span><span className="text-xs text-gray-500">{s.id}</span></span>
                      {price != null && <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">{formatMoney(price)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <textarea value={project.notes} onChange={e => update({ notes: e.target.value })} rows={3}
              aria-label={st('services.notes_label')} placeholder={t('services.notes_placeholder')}
              className={`${fieldClass} mt-4`} />
          </Section>

          <Section step={5} title={st('price.title')} id="tp-price" subtitle={t('price.subtitle')}>
            <PricingStep pricing={pricing} pricingError={pricingError} codes={codes} choice={project.price}
              onChange={price => update({ price })} requestedSlug={requestedSlug} travelers={project.travelers}
              residence={project.profile.residence} firstPurchase={firstPurchase} />
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-bold text-gray-900">{t('summary.title')}</h2>
              <span data-testid="project-status" className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
            </div>
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500">{st('summary.destinations', { count: project.stops.length })}</dt><dd className="font-medium text-gray-900" data-testid="summary-destinations">{(isFr ? stopsLabel(project, countryLabel) : syncedStops(project).map(s => countryText(s.country, s.label)).join(' → ')) || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('trip.itinerary')}</dt><dd className="font-medium text-gray-900" data-testid="summary-itinerary">{itineraryText(project, { country: stop => countryText(stop.country, stop.label), nights: n => t('trip.nights', { count: n }) }) || '—'}</dd></div>
              <div><dt className="text-gray-500">{t('summary.dates')}</dt><dd className="font-medium text-gray-900">{project.startDate ? `${project.startDate} → ${project.endDate || '?'}` : '—'}</dd></div>
              <div><dt className="text-gray-500">{t('travelers.count')}</dt><dd className="font-medium text-gray-900">{project.travelers}</dd></div>
              <div><dt className="text-gray-500">{st('summary.services', { count: project.services.length })}</dt><dd className="font-medium text-gray-900">
                {TOURISM_SERVICES.filter(s => project.services.includes(s.id)).map(s => serviceName({ code: s.id, name: s.label })).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">{st('summary.offer')}</dt><dd className="font-medium text-gray-900" data-testid="summary-package">
                {liveSnapshot ? snapshotLabel(liveSnapshot, st) : '—'}
              </dd></div>
            </dl>

            {feedback && (
              <p role="status" className={`mt-4 text-sm rounded-lg p-3 ${
                feedback.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : feedback.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-800'}`}>
                {feedback.text}
              </p>
            )}
            {!canSave && <p className="mt-4 text-xs text-gray-500">{st('summary.to_complete', { list: dateError || missing.join(', ') })}</p>}

            <div className="mt-4 space-y-2">
              <button type="button" onClick={save} disabled={saving || sending || paying} data-testid="save-project"
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50">
                {saving ? st('actions.saving') : user ? t('actions.save_trip') : st('actions.save_choices')}
              </button>
              <button type="button" onClick={sendRequest} disabled={saving || sending || paying} data-testid="send-request"
                className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50 disabled:opacity-50">
                {sending ? st('actions.sending') : project.requestSentAt ? st('actions.resend') : t('actions.request')}
              </button>
              <TermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} />
              <button type="button" onClick={() => pay()} data-testid="pay-online"
                disabled={saving || sending || paying || !acceptTerms || (project.price.offerId === 'consultation' && !project.price.consultationSlot)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50">
                {paying ? st('actions.paying') : user ? st('actions.pay') : st('actions.login_and_pay')}
              </button>
              {!user && <p className="text-xs text-gray-500 text-center">{st('actions.pay_login_hint')}</p>}
              {project.price.offerId === 'consultation' && !project.price.consultationSlot && (
                <p className="text-xs text-amber-700 text-center">{st('actions.pick_slot')}</p>
              )}
              <Link to="/dashboard" className="block text-center w-full py-2 text-sm text-secondary hover:text-primary underline">{st('actions.dashboard')}</Link>
            </div>

            {!user && (
              <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-900">
                <p className="font-medium mb-2">{st('account.title')}</p>
                <div className="flex gap-2">
                  <Link to={`/register?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg bg-orange-500 text-white font-medium">{st('account.register')}</Link>
                  <Link to={`/login?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg border border-orange-500 text-orange-600 font-medium">{st('account.login')}</Link>
                </div>
              </div>
            )}

            {(project.tripId || project.destination) && (
              <button type="button" onClick={startNew} className="mt-4 w-full text-xs text-gray-500 hover:text-red-600">{t('actions.new_trip')}</button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TourismPlanner;
