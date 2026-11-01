import { useTranslation } from 'react-i18next';
import { formatMoney } from './currency';

/**
 * Textes d'un palier (« 1 à 2 services », « Services jusqu’à 200 € de valeur »…). En français,
 * la base fait foi (l'admin peut les retoucher) ; en anglais et en allemand, ils sont
 * reconstruits depuis les champs du palier (nombre de services, plafond, prix).
 */

interface TierLike {
  family: string | null;
  slug?: string | null;
  price_from_cents: number;
  currency?: string;
  service_label?: string | null;
  tagline?: string | null;
  features?: string[];
  min_services?: number | null;
  max_services?: number | null;
  value_cap_cents?: number | null;
}

interface ServiceLike { family: string; price_cents: number }

export function useTierText(services: ServiceLike[] = []) {
  const { t, i18n } = useTranslation('packages');
  const fr = i18n.language?.startsWith('fr');
  const familyValue = (family: string | null) => services
    .filter(s => (family === 'mix' ? s.family === 'study' || s.family === 'tourism' : s.family === family))
    .reduce((n, s) => n + s.price_cents, 0);

  return (tier: TierLike) => {
    if (fr || tier.family === 'consultation' && !tier.features?.length) {
      return { label: tier.service_label ?? '', tagline: tier.tagline ?? '', features: tier.features ?? [] };
    }
    if (tier.family === 'consultation') {
      return { label: t('tier.consultation_label'), tagline: t('tier.consultation_tagline'), features: [t('tier.consultation_f1'), t('tier.consultation_f2'), t('tier.consultation_f3')] };
    }
    const money = (c: number) => formatMoney(c, tier.currency);
    const { min_services: min, max_services: max, value_cap_cents: cap } = tier;
    const value = cap ?? familyValue(tier.family);
    const saving = value > tier.price_from_cents ? money(value - tier.price_from_cents) : null;
    const count = min && max ? t('tier.range', { min, max }) : max ? t('tier.up_to', { max }) : t('tier.all');
    const features = [
      cap ? t('tier.cap', { value: money(cap) })
        : tier.family === 'mix' ? t('tier.all_mix', { value: money(value) })
          : t(tier.family === 'study' ? 'tier.all_study' : 'tier.all_tourism'),
      ...(min || max ? [count] : []),
      ...(tier.family === 'mix' ? [t('tier.mix_rule')] : []),
      ...(saving ? [t('tier.saving', { amount: saving })] : []),
    ];
    return {
      label: count,
      tagline: cap && saving ? t('tier.tagline_cap', { value: money(cap), amount: saving }) : saving ? t('tier.tagline', { amount: saving }) : '',
      features,
    };
  };
}
