import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { AFRICAN_COUNTRIES } from '../../data/africanCountries';
import { Chip, InfoCard, Section, externalHref, fieldClass, toggle } from '../projects/plannerUi';
import { usePricing } from '../../pricing/usePricing';
import PricingStep from '../../pricing/PricingStep';
import { goToCheckout } from '../../pricing/checkout';
import { computeSnapshot, snapshotLabel } from '../../pricing/priceChoice';
import { formatEuros, quoteSelection } from '../../pricing/pricingEngine';
import {
  INTERESTS, TOURISM_SERVICES, TourismProject, TourismStop,
  clearTourismDraft, emptyTourismProject, loadTourismDraft, loadTourismProject, nightsBetween,
  saveTourismDraft, saveTourismToAccount, tourismSummary, tourismTitle, stopsLabel, syncedStops, itineraryText,
} from './tourismProject';

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
  const { user, updateUserLocally } = useAuth();
  const [searchParams] = useSearchParams();
  const { pricing, error: pricingError } = usePricing();

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
        else setFeedback({ tone: 'error', text: 'Ce voyage est introuvable dans votre compte.' });
      })
      .catch(() => mounted && setFeedback({ tone: 'error', text: 'Impossible de charger ce voyage. Réessayez plus tard.' }))
      .finally(() => mounted && setLoadingProject(false));
    return () => { mounted = false; };
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
      .then(r => mounted && setVisa(r))
      .catch(() => mounted && setVisa({ error: true }));
    return () => { mounted = false; };
  }, [project.profile.nationality, project.destination]);

  // ── Dérivés ─────────────────────────────────────────────────────────────────

  const country = countries.find(c => c.name === project.destination);
  const countryLabel = country?.nameFr || project.destinationLabel || project.destination;
  const nights = nightsBetween(project.startDate, project.endDate);
  const requestedSlug = searchParams.get('package');
  const codes = project.services;
  const liveSnapshot = pricing ? computeSnapshot(codes, pricing, project.price) : null;
  const priceOf = (code: string) => pricing?.services.find(s => s.code === code)?.price_cents ?? null;

  useEffect(() => {
    if (!requestedSlug || !pricing || project.price.offerId) return;
    const offer = quoteSelection(codes, pricing).offers.find(o => o.lines.some(l => l.slug === requestedSlug));
    if (offer) update({ price: { ...project.price, offerId: offer.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSlug, pricing, codes.join(',')]);

  const dateError =
    project.startDate && project.startDate < today() ? 'La date de départ est passée.'
      : project.startDate && project.endDate && project.endDate < project.startDate ? 'La date de retour précède la date de départ.'
        : '';

  const missing: string[] = [];
  if (!project.destination) missing.push('la destination');
  if (!project.startDate) missing.push('la date de départ');
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
    ({ ...p, price: { ...p.price, snapshot: pricing ? computeSnapshot(p.services, pricing, p.price) : p.price.snapshot } });

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
      setFeedback({ tone: 'error', text: dateError || `Complétez d'abord ${missing.join(' et ')}.` });
      return null;
    }
    const current = withSnapshot(project);
    if (!user) {
      const stored = saveTourismDraft(current);
      setProject(current);
      setDirty(false);
      setFeedback(stored
        ? { tone: 'info', text: 'Voyage enregistré sur cet appareil. Créez un compte (ou connectez-vous) pour le retrouver partout et envoyer votre demande.' }
        : { tone: 'error', text: "Votre navigateur bloque l'enregistrement local. Créez un compte pour sauvegarder votre voyage." });
      return stored;
    }
    setSaving(true);
    try {
      const saved = await saveTourismToAccount(current, countryLabel);
      await syncProfile();
      setProject(saved);
      setDirty(false);
      clearTourismDraft();
      setFeedback({ tone: 'success', text: 'Voyage enregistré dans votre compte. Retrouvez-le dans votre dashboard.' });
      return saved;
    } catch (err: any) {
      saveTourismDraft(current);
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
      saveTourismDraft(withSnapshot(project));
      setFeedback({ tone: 'info', text: 'Pour envoyer une demande, connectez-vous ou créez un compte : votre voyage est conservé.' });
      return;
    }
    if (project.services.length === 0 && project.price.offerId !== 'consultation') {
      setFeedback({ tone: 'error', text: 'Choisissez au moins un service (ou la consultation) avant d’envoyer votre demande.' });
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
      setFeedback({ tone: 'success', text: 'Demande envoyée : un conseiller MIDZOE revient vers vous par email. Elle est suivie dans votre dashboard.' });
    } catch {
      setFeedback({ tone: 'error', text: "L'envoi de la demande a échoué. Votre voyage est enregistré ; réessayez dans un instant." });
    } finally {
      setSending(false);
    }
  };

  // Paiement en ligne : le projet est d'abord enregistré, puis le serveur recalcule le prix de
  // l'offre choisie (aucun montant n'est envoyé) et ouvre Stripe Checkout.
  const pay = async () => {
    if (!user) {
      setFeedback({ tone: 'info', text: 'Pour payer en ligne, connectez-vous ou créez un compte : votre voyage est conservé.' });
      return;
    }
    setPaying(true);
    const saved = await save();
    if (!saved) { setPaying(false); return; }
    const codesToPay = saved.services;
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
    ? { label: 'Demande envoyée', className: 'bg-emerald-100 text-emerald-800' }
    : project.tripId && !dirty
      ? { label: 'Enregistré dans votre compte', className: 'bg-emerald-100 text-emerald-800' }
      : project.tripId
        ? { label: 'Modifications non enregistrées', className: 'bg-amber-100 text-amber-800' }
        : { label: user ? 'Pas encore enregistré dans votre compte' : 'Brouillon sur cet appareil', className: 'bg-gray-100 text-gray-700' };

  const redirect = encodeURIComponent('/tourism/plan');
  const catalogCards: [string, CatalogItem[]][] = [
    ['Hébergements', catalog.stays], ['Restaurants', catalog.restaurants], ['Sites touristiques', catalog.sites],
    ['Programmes (safari, sport…)', catalog.programs], ['Événements', catalog.events],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-orange-100 text-sm font-semibold uppercase tracking-widest mb-2">🌍 MIDZOE Tourism</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Composez votre voyage</h1>
          <p className="mt-3 text-orange-50 max-w-3xl">
            Choisissez une destination, vos dates et les services dont vous avez besoin : nous calculons le prix à la carte,
            le comparons à nos packages et vous conseillons l'offre la plus avantageuse.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section step={1} title="Vos voyageurs" subtitle="La nationalité détermine les formalités (visa).">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tp-nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <select id="tp-nationality" value={project.profile.nationality} onChange={e => update({ profile: { ...project.profile, nationality: e.target.value } })} className={fieldClass}>
                  <option value="">— Choisir —</option>
                  {AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  {project.profile.nationality && !AFRICAN_COUNTRIES.some(c => c.value === project.profile.nationality) && (
                    <option value={project.profile.nationality}>{project.profile.nationality}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="tp-residence" className="block text-sm font-medium text-gray-700 mb-1">Pays de résidence</label>
                <select id="tp-residence" value={project.profile.residence} onChange={e => update({ profile: { ...project.profile, residence: e.target.value } })} className={fieldClass}>
                  <option value="">— Choisir —</option>
                  {AFRICAN_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  {project.profile.residence && !AFRICAN_COUNTRIES.some(c => c.value === project.profile.residence) && (
                    <option value={project.profile.residence}>{project.profile.residence}</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="tp-travelers" className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                <input id="tp-travelers" type="number" min={1} max={50} value={project.travelers}
                  onChange={e => update({ travelers: Math.min(50, Math.max(1, Number(e.target.value) || 1)) })} className={fieldClass} />
              </div>
            </div>
          </Section>

          <Section step={2} title="Votre voyage" subtitle="Destination, étapes, dates et envies.">
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Destinations</p>
                <p className="text-xs text-gray-500 mb-2">Choisissez un ou plusieurs pays : ils forment votre itinéraire, dans l'ordre ci-dessous.</p>
                {countries.length === 0 ? <p className="text-sm text-gray-500">Chargement des destinations…</p> : (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Destination">
                    {countries.map(c => (
                      <Chip key={c.id} active={project.stops.some(st => st.country === c.name)}
                        onClick={() => toggleStop(c.name, c.nameFr || c.name)}>
                        {c.flag} {c.nameFr || c.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
              {project.stops.length > 0 && (
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Votre itinéraire</p>
                  <ol className="space-y-2" aria-label="Itinéraire" data-testid="itinerary">
                    {syncedStops(project).map((st: TourismStop, i, all) => (
                      <li key={st.country} className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 ${st.country === project.destination ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                        <span className="h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <button type="button" onClick={() => showStop(st.country)} className="font-medium text-gray-900 hover:text-orange-600">{st.label}</button>
                        <span className="text-xs text-gray-500 flex-1 min-w-[6rem]">{st.cities.join(', ') || 'villes à préciser'}</span>
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input type="number" min={1} max={365} value={st.nights ?? ''} onChange={e => setStopNights(st.country, e.target.value)}
                            aria-label={`Nuits en ${st.label}`} className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          nuits
                        </label>
                        <button type="button" aria-label={`Monter ${st.label}`} disabled={i === 0} onClick={() => moveStop(i, -1)} className="px-1.5 text-gray-500 disabled:opacity-30">▲</button>
                        <button type="button" aria-label={`Descendre ${st.label}`} disabled={i === all.length - 1} onClick={() => moveStop(i, 1)} className="px-1.5 text-gray-500 disabled:opacity-30">▼</button>
                        <button type="button" aria-label={`Retirer ${st.label} de l’itinéraire`} onClick={() => toggleStop(st.country, st.label)} className="px-1.5 text-gray-400 hover:text-red-600">×</button>
                      </li>
                    ))}
                  </ol>
                  {nights != null && plannedNights > 0 && plannedNights !== nights && (
                    <p className="text-xs text-amber-700 mt-2" data-testid="nights-mismatch">
                      Les étapes totalisent {plannedNights} nuit{plannedNights > 1 ? 's' : ''} pour {nights} nuit{nights > 1 ? 's' : ''} entre vos dates.
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Villes / étapes{project.stops.length > 1 && project.destination ? ` — ${countryLabel}` : ''}</p>
                {project.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.cities.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                        {c}
                        <button type="button" aria-label={`Retirer ${c}`} onClick={() => update({ cities: project.cities.filter(x => x !== c) })}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={cityInput} onChange={e => setCityInput(e.target.value)} disabled={!project.destination}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(cityInput); setCityInput(''); } }}
                    aria-label="Ajouter une étape" placeholder={project.destination ? 'Ajouter une ville (ex. Nairobi)' : 'Choisissez d’abord une destination'} className={fieldClass} />
                  <button type="button" disabled={!cityInput.trim()} onClick={() => { addCity(cityInput); setCityInput(''); }}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium disabled:opacity-40">Ajouter</button>
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
                  <label htmlFor="tp-start" className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                  <input id="tp-start" type="date" min={today()} value={project.startDate} onChange={e => update({ startDate: e.target.value })} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="tp-end" className="block text-sm font-medium text-gray-700 mb-1">Retour</label>
                  <input id="tp-end" type="date" min={project.startDate || today()} value={project.endDate} onChange={e => update({ endDate: e.target.value })} className={fieldClass} />
                </div>
              </div>
              {dateError && <p className="text-sm text-red-600" role="alert">{dateError}</p>}
              {!dateError && nights != null && <p className="text-sm text-gray-600" data-testid="trip-nights">{nights} nuit{nights > 1 ? 's' : ''} sur place</p>}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Envies</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Envies">
                  {INTERESTS.map(i => <Chip key={i} active={project.interests.includes(i)} onClick={() => update({ interests: toggle(project.interests, i) })}>{i}</Chip>)}
                </div>
              </div>
            </div>
          </Section>

          <Section step={3} id="tp-results" title="Ce que propose le catalogue"
            subtitle={project.destination ? `Pour ${countryLabel}` : 'Choisissez une destination pour afficher les informations.'}>
            {project.stops.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label="Informations pour">
                <span className="text-sm text-gray-500 mr-1">Informations pour :</span>
                {project.stops.map(st => (
                  <button key={st.country} type="button" role="tab" aria-selected={st.country === project.destination}
                    onClick={() => showStop(st.country)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      st.country === project.destination ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}>
                    {st.label}
                  </button>
                ))}
              </div>
            )}
            {!project.destination ? (
              <p className="text-gray-500 text-sm">Sélectionnez une destination à l'étape 2.</p>
            ) : loadingCatalog ? (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-6" data-testid="catalog-loading">
                <span className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
                Chargement du catalogue pour {countryLabel}…
              </div>
            ) : (
              <div className="space-y-4">
                {country && (
                  <InfoCard title={`${country.flag ?? ''} ${countryLabel}`}>
                    {country.description && <p>{country.description}</p>}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {country.bestTime && <div><dt className="font-medium">Meilleure période</dt><dd>{country.bestTime}</dd></div>}
                      {country.avgBudgetPerDay && <div><dt className="font-medium">Budget sur place</dt><dd>{country.avgBudgetPerDay} / jour</dd></div>}
                      {country.currency && <div><dt className="font-medium">Monnaie</dt><dd>{country.currency}</dd></div>}
                      {country.language && <div><dt className="font-medium">Langues</dt><dd>{country.language}</dd></div>}
                      {!!country.directFlightsFrom?.length && <div className="sm:col-span-2"><dt className="font-medium">Vols directs depuis</dt><dd>{country.directFlightsFrom.join(', ')}</dd></div>}
                    </dl>
                  </InfoCard>
                )}

                <InfoCard title="Visa et formalités">
                  {!project.profile.nationality ? <p>Indiquez la nationalité des voyageurs (étape 1).</p>
                    : project.profile.nationality === project.destination ? <p>Pas de visa nécessaire pour les ressortissants de ce pays.</p>
                      : visa?.requirements ? (
                        <>
                          <p>{visa.message}</p>
                          {visa.requirements.costs?.processingTime && <p><span className="font-medium">Délai :</span> {visa.requirements.costs.processingTime}</p>}
                        </>
                      ) : (
                        <p data-testid="visa-fallback">
                          Pas de fiche visa tourisme détaillée pour cet itinéraire. Repère général pour les voyageurs africains :
                          {' '}<strong>{country?.visaForAfricans ?? 'à vérifier auprès de l’ambassade'}</strong>
                          {country?.processingTimeVisa ? ` (délai : ${country.processingTimeVisa})` : ''}.
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
                      ) : <p className="text-gray-500">Rien de référencé pour {countryLabel} pour l'instant : le conseiller vous proposera des options.</p>}
                    </InfoCard>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section step={4} title="Vos services" subtitle="Prix à l'unité de la grille MIDZOE, par dossier de voyage.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Services">
              {TOURISM_SERVICES.map(s => {
                const active = project.services.includes(s.id);
                const price = priceOf(s.id);
                return (
                  <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                    <input type="checkbox" checked={active} onChange={() => update({ services: toggle(project.services, s.id) })} className="mt-1 rounded text-orange-500 focus:ring-orange-500" />
                    <span className="flex-1 flex items-baseline justify-between gap-2">
                      <span><span className="block font-semibold text-gray-900">{s.label}</span><span className="text-xs text-gray-500">{s.id}</span></span>
                      {price != null && <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">{formatEuros(price)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <textarea value={project.notes} onChange={e => update({ notes: e.target.value })} rows={3}
              aria-label="Précisions pour le conseiller" placeholder="Précisions pour le conseiller (budget, style de voyage, contraintes…)"
              className={`${fieldClass} mt-4`} />
          </Section>

          <Section step={5} title="Prix et package" id="tp-price" subtitle="À la carte ou package Tourism : nous vous conseillons le moins cher.">
            <PricingStep pricing={pricing} pricingError={pricingError} codes={codes} choice={project.price}
              onChange={price => update({ price })} requestedSlug={requestedSlug} />
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-bold text-gray-900">Mon voyage</h2>
              <span data-testid="project-status" className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
            </div>
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500">Destination{project.stops.length > 1 ? 's' : ''}</dt><dd className="font-medium text-gray-900" data-testid="summary-destinations">{stopsLabel(project, countryLabel) || '—'}</dd></div>
              <div><dt className="text-gray-500">Itinéraire</dt><dd className="font-medium text-gray-900" data-testid="summary-itinerary">{itineraryText(project) || '—'}</dd></div>
              <div><dt className="text-gray-500">Dates</dt><dd className="font-medium text-gray-900">{project.startDate ? `${project.startDate} → ${project.endDate || '?'}` : '—'}</dd></div>
              <div><dt className="text-gray-500">Voyageurs</dt><dd className="font-medium text-gray-900">{project.travelers}</dd></div>
              <div><dt className="text-gray-500">Services ({project.services.length})</dt><dd className="font-medium text-gray-900">
                {TOURISM_SERVICES.filter(s => project.services.includes(s.id)).map(s => s.label).join(', ') || '—'}
              </dd></div>
              <div><dt className="text-gray-500">Offre et prix</dt><dd className="font-medium text-gray-900" data-testid="summary-package">
                {liveSnapshot ? snapshotLabel(liveSnapshot) : '—'}
              </dd></div>
            </dl>

            {feedback && (
              <p role="status" className={`mt-4 text-sm rounded-lg p-3 ${
                feedback.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : feedback.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-800'}`}>
                {feedback.text}
              </p>
            )}
            {!canSave && <p className="mt-4 text-xs text-gray-500">À compléter : {dateError || missing.join(', ')}.</p>}

            <div className="mt-4 space-y-2">
              <button type="button" onClick={save} disabled={saving || sending || paying} data-testid="save-project"
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50">
                {saving ? 'Enregistrement…' : user ? 'Enregistrer mon voyage' : 'Enregistrer mes choix'}
              </button>
              <button type="button" onClick={sendRequest} disabled={saving || sending || paying} data-testid="send-request"
                className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50 disabled:opacity-50">
                {sending ? 'Envoi…' : project.requestSentAt ? 'Renvoyer ma demande' : 'Demander ce voyage'}
              </button>
              <button type="button" onClick={pay} disabled={saving || sending || paying} data-testid="pay-online"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50">
                {paying ? 'Ouverture du paiement…' : 'Payer en ligne (carte bancaire)'}
              </button>
              <Link to="/dashboard" className="block text-center w-full py-2 text-sm text-secondary hover:text-primary underline">Ouvrir mon dashboard</Link>
            </div>

            {!user && (
              <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-900">
                <p className="font-medium mb-2">Sans compte, vos choix restent sur cet appareil.</p>
                <div className="flex gap-2">
                  <Link to={`/register?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg bg-orange-500 text-white font-medium">Créer un compte</Link>
                  <Link to={`/login?redirect=${redirect}`} className="flex-1 text-center py-2 rounded-lg border border-orange-500 text-orange-600 font-medium">Se connecter</Link>
                </div>
              </div>
            )}

            {(project.tripId || project.destination) && (
              <button type="button" onClick={startNew} className="mt-4 w-full text-xs text-gray-500 hover:text-red-600">Composer un nouveau voyage</button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TourismPlanner;
