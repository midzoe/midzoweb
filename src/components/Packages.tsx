import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AcademicCapIcon, SunIcon, SparklesIcon, CheckIcon, ArrowRightIcon,
  DocumentCheckIcon, BuildingLibraryIcon, ChatBubbleLeftRightIcon, HomeIcon,
  PaperAirplaneIcon, HomeModernIcon, MapIcon, UserGroupIcon,
  ShieldCheckIcon, LifebuoyIcon, GlobeAltIcon, Squares2X2Icon, HeartIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

/**
 * Grille commerciale publique — reprise de la plaquette « MIDZOE PACKAGES ».
 *
 * Les PALIERS et leurs prix viennent de la base (`/packages/showcase`, famille non nulle) :
 * un tarif se change depuis l'admin, jamais en redéployant le front. Les PILIERS de services
 * affichés au-dessus des cartes sont, eux, du contenu éditorial traduit (i18n) : ils décrivent
 * la promesse d'une famille et pointent vers les pages de service existantes.
 *
 * La page ne calcule aucun prix : elle affiche `price_from_cents` tel quel. Le calcul à la
 * carte reste l'affaire du constructeur `/premium` (moteur de devis, story 3.2).
 */

type Family = 'study' | 'tourism' | 'mix';

interface ShowcasePackage {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  family: string | null;
  tagline: string | null;
  service_label: string | null;
  price_from_cents: number;
  billing_period: string;
  currency: string;
  features: string[];
  badge: string | null;
  is_highlighted: boolean;
}

/**
 * Identité visuelle par famille — elle reprend le code couleur des univers du site :
 * vert « primary » pour les études (pages /services/*, cf. components/study), or « gold »
 * pour le tourisme (cf. TourismHome), et le mariage des deux pour le mix.
 */
const THEME: Record<Family | 'consultation', {
  text: string; bg: string; ring: string; bar: string; button: string; softText: string;
}> = {
  study: {
    text: 'text-primary-dark',
    bg: 'bg-primary/10',
    ring: 'ring-primary/25',
    bar: 'bg-primary',
    button: 'bg-primary hover:bg-primary-dark',
    softText: 'text-primary-dark/70',
  },
  tourism: {
    text: 'text-gold-700',
    bg: 'bg-gold-100',
    ring: 'ring-gold-400/40',
    bar: 'bg-gold-500',
    button: 'bg-gold-600 hover:bg-gold-700',
    softText: 'text-gold-700/70',
  },
  mix: {
    text: 'text-primary-dark',
    bg: 'bg-gradient-to-r from-primary/10 to-gold-200/60',
    ring: 'ring-gold-400/30',
    bar: 'bg-gradient-to-r from-primary to-gold-500',
    button: 'bg-gradient-to-r from-primary to-gold-600 hover:opacity-90',
    softText: 'text-stone-500',
  },
  consultation: {
    text: 'text-stone-800',
    bg: 'bg-stone-100',
    ring: 'ring-stone-300',
    bar: 'bg-stone-800',
    button: 'bg-stone-900 hover:bg-stone-800',
    softText: 'text-stone-500',
  },
};

const FAMILY_TABS: { id: Family; labelKey: string; icon: React.ElementType }[] = [
  { id: 'study', labelKey: 'family_study', icon: AcademicCapIcon },
  { id: 'tourism', labelKey: 'family_tourism', icon: SunIcon },
  { id: 'mix', labelKey: 'family_mix', icon: Squares2X2Icon },
];

/** Piliers de service de la plaquette : 5 par famille, avec la page de service correspondante. */
const PILLARS: Record<'study' | 'tourism', { icon: React.ElementType; key: string; href: string }[]> = {
  study: [
    { icon: DocumentCheckIcon, key: 'study_1', href: '/services/document-legalization' },
    { icon: BuildingLibraryIcon, key: 'study_2', href: '/services/university-finder' },
    { icon: ChatBubbleLeftRightIcon, key: 'study_3', href: '/services/language-center' },
    { icon: HomeIcon, key: 'study_4', href: '/services/student-accommodation' },
    { icon: PaperAirplaneIcon, key: 'study_5', href: '/services/student-visa' },
  ],
  tourism: [
    { icon: HomeModernIcon, key: 'tourism_1', href: '/services/accommodation' },
    { icon: PaperAirplaneIcon, key: 'tourism_2', href: '/flights' },
    { icon: MapIcon, key: 'tourism_3', href: '/services/tourist-sites' },
    { icon: UserGroupIcon, key: 'tourism_4', href: '/services/tourism-partners' },
    { icon: ChatBubbleLeftRightIcon, key: 'tourism_5', href: '/services/language-center' },
  ],
};

const TRUST = [
  { icon: ShieldCheckIcon, key: 'trust_security' },
  { icon: LifebuoyIcon, key: 'trust_support' },
  { icon: GlobeAltIcon, key: 'trust_network' },
  { icon: SparklesIcon, key: 'trust_flexible' },
  { icon: HeartIcon, key: 'trust_mission' },
];

/**
 * Prix d'appel : les montants de la plaquette sont ronds (150 €, 1 490 €). On n'affiche
 * les centimes que s'il y en a réellement — « 150,00 € » sur une grille tarifaire fait lourd.
 */
function formatPrice(cents: number, currency: string, locale: string): string {
  const hasCents = cents % 100 !== 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(hasCents ? 2 : 0)} ${currency}`;
  }
}

const Packages: React.FC = () => {
  const { t, i18n } = useTranslation('packages');
  const [packages, setPackages] = useState<ShowcasePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [family, setFamily] = useState<Family>('study');

  useEffect(() => {
    let mounted = true;
    apiService
      .getShowcasePackages()
      .then((res: any) => {
        if (!mounted) return;
        setPackages(res?.packages ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const byFamily = useMemo(() => {
    const groups: Record<string, ShowcasePackage[]> = { study: [], tourism: [], mix: [], consultation: [] };
    packages.forEach(p => {
      if (p.family && groups[p.family]) groups[p.family].push(p);
    });
    return groups;
  }, [packages]);

  const tiers = byFamily[family] ?? [];
  const consultation = byFamily.consultation?.[0] ?? null;
  const theme = THEME[family];

  const priceOf = (p: ShowcasePackage) => formatPrice(p.price_from_cents, p.currency, i18n.language);

  /** CTA : la demande passe par le formulaire de contact, pré-rempli avec le package choisi. */
  const chooseHref = (p: ShowcasePackage) => `/contact?package=${encodeURIComponent(p.name)}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* ── En-tête éditorial ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-stone-200/70 bg-gradient-to-b from-white to-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold-300/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <p className="font-display text-sm uppercase tracking-[0.28em] text-gold-600">
            {t('hero_kicker')}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            {t('hero_title')}
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
            {t('hero_subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: LifebuoyIcon, label: t('chip_support') },
              { icon: UserGroupIcon, label: t('chip_experts') },
              { icon: ShieldCheckIcon, label: t('chip_secure') },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-sm backdrop-blur"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Sélecteur de famille ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-stone-200/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl justify-center px-4 py-3 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label={t('hero_title')}
            className="inline-flex w-full max-w-xl items-center gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-sm"
          >
            {FAMILY_TABS.map(({ id, labelKey, icon: Icon }) => {
              const active = family === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFamily(id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? `${THEME[id].button} text-white shadow-sm`
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
          {t(`family_${family}_title`)}
        </h2>
        {family === 'mix' && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-stone-600">{t('family_mix_subtitle')}</p>
        )}

        {/* Piliers de service de la famille (contenu éditorial). */}
        {family !== 'mix' && (
          <section className="mt-10">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              {t('included_services')}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PILLARS[family].map(({ icon: Icon, key, href }, index) => (
                <Link
                  key={key}
                  to={href}
                  className="group flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${theme.bg} ${theme.text}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-lg font-semibold text-stone-300">{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold leading-snug text-stone-800">{t(`${key}_title`)}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-500">{t(`${key}_text`)}</p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${theme.text} opacity-0 transition-opacity group-hover:opacity-100`}>
                    <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Paliers tarifaires (base de données). */}
        <section className="mt-12">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-primary" />
            </div>
          )}

          {!loading && error && (
            <p className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
              {t('load_error')}
            </p>
          )}

          {!loading && !error && tiers.length === 0 && (
            <p className="py-10 text-center text-stone-500">{t('no_packages')}</p>
          )}

          {!loading && !error && tiers.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
                tiers.length >= 5 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-3'
              }`}
            >
              {tiers.map((p, index) => (
                <article
                  key={p.id}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${
                    p.is_highlighted ? `border-transparent ring-2 ${theme.ring}` : 'border-stone-200/80'
                  }`}
                >
                  {/* Filet de gamme : il s'épaissit visuellement du premier au dernier palier. */}
                  <div className={`h-1.5 w-full ${theme.bar}`} style={{ opacity: 0.45 + (0.55 * (index + 1)) / tiers.length }} />

                  <div className="flex flex-1 flex-col p-6">
                    {p.badge && (
                      <span className={`mb-3 self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                        {p.badge}
                      </span>
                    )}

                    <h3 className="font-display text-2xl font-semibold text-stone-900">{p.name}</h3>
                    {p.service_label && (
                      <p className={`mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${theme.softText}`}>
                        {p.service_label}
                      </p>
                    )}
                    {p.tagline && <p className="mt-3 text-sm leading-relaxed text-stone-500">{p.tagline}</p>}

                    <ul className="mt-5 space-y-2.5 border-t border-stone-100 pt-5">
                      {p.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                          <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${theme.text}`} />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex-1" />

                    {/* Repère de gamme : le palier n sur N, lisible d'un coup d'œil. */}
                    <div
                      className="mb-4 flex items-center gap-1"
                      title={t('tier_level', { current: index + 1, total: tiers.length })}
                      aria-label={t('tier_level', { current: index + 1, total: tiers.length })}
                    >
                      {tiers.map((_, dot) => (
                        <span
                          key={dot}
                          className={`h-1 flex-1 rounded-full ${dot <= index ? theme.bar : 'bg-stone-200'}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs uppercase tracking-[0.16em] text-stone-400">{t('price_from')}</p>
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-stone-900">
                      {priceOf(p)}
                      {p.billing_period === 'month' && (
                        <span className="ml-1 text-sm font-normal text-stone-500">{t('per_month')}</span>
                      )}
                    </p>

                    <Link
                      to={chooseHref(p)}
                      className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all ${theme.button}`}
                    >
                      {t('choose')}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Consultation personnalisée ─────────────────────────────────── */}
        {consultation && (
          <section className="mt-16">
            <div className="grid grid-cols-1 gap-6 rounded-3xl border-2 border-dashed border-stone-300 bg-white/70 p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-10">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.22em] text-gold-600">
                  {t('consultation_eyebrow')}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
                  {t('consultation_title')}
                </h2>
                <p className="mt-3 max-w-xl text-stone-600">{t('consultation_text')}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {consultation.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-card">
                <CalendarDaysIcon className="mx-auto h-8 w-8 text-gold-600" />
                <p className="mt-4 font-display text-4xl font-semibold tabular-nums text-stone-900">
                  {formatPrice(consultation.price_from_cents, consultation.currency, i18n.language)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                  {t('consultation_note')}
                </p>
                <Link
                  to={chooseHref(consultation)}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${THEME.consultation.button}`}
                >
                  {t('consultation_cta')}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Package sur mesure : renvoi vers le constructeur à la carte ─── */}
        <section className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-8 text-center shadow-card sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-xl font-semibold text-stone-900">{t('custom_title')}</h2>
            <p className="mt-1 text-sm text-stone-600">{t('custom_text')}</p>
          </div>
          <Link
            to="/premium"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <SparklesIcon className="h-4 w-4" />
            {t('custom_cta')}
          </Link>
        </section>
      </main>

      {/* ── Bandeau de confiance ──────────────────────────────────────────── */}
      <footer className="border-t border-stone-200/70 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {TRUST.map(({ icon: Icon, key }) => (
            <div key={key} className="text-center">
              <Icon className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 text-sm font-semibold text-stone-800">{t(key)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{t(`${key}_text`)}</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Packages;
