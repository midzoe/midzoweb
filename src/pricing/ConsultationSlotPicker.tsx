import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

// Choix du créneau de la consultation (25 €). Les horaires de Midzo sont tenus en heure
// d'Allemagne (réglables dans l'admin) ; chaque créneau s'affiche d'abord à l'heure du
// visiteur (Dakar, Douala, Paris…), avec l'heure d'Allemagne en second. Le serveur
// revérifie le créneau au paiement et ne le vend qu'une fois.

interface Slot { start: string; available: boolean }

/** Fuseau du navigateur, envoyé au paiement pour écrire l'heure du client dans les emails. */
export const visitorTimeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { return null; }
};

const ConsultationSlotPicker: React.FC<{ value?: string | null; onChange: (slot: string | null) => void }> = ({ value, onChange }) => {
  const { t, i18n } = useTranslation('study');
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [weekly, setWeekly] = useState<Record<string, [string, string][]>>({});
  const [midzoTz, setMidzoTz] = useState('Europe/Berlin');
  const [error, setError] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const lang = i18n.language?.slice(0, 2) || 'fr';
  const localTz = visitorTimeZone() ?? undefined;

  useEffect(() => {
    let mounted = true;
    apiService.getConsultationSlots()
      .then(r => {
        if (!mounted) return;
        setSlots(Array.isArray(r?.slots) ? r.slots : []);
        setWeekly(r?.weekly ?? {});
        if (typeof r?.timezone === 'string') setMidzoTz(r.timezone);
      })
      .catch(() => mounted && setError(true));
    return () => { mounted = false; };
  }, []);

  // Jours et heures à l'heure du visiteur.
  const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: localTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    (slots ?? []).forEach(s => map.set(dayKey(s.start), [...(map.get(dayKey(s.start)) ?? []), s]));
    return [...map.entries()].filter(([, list]) => list.some(s => s.available));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  // Un créneau enregistré mais devenu indisponible (passé, pris) est oublié.
  useEffect(() => {
    if (!slots || !value) return;
    if (!slots.some(s => s.start === value && s.available)) onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const time = (iso: string, timeZone?: string) => new Intl.DateTimeFormat(lang, { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  const sameAsMidzo = (iso: string) => time(iso, localTz) === time(iso, midzoTz);
  const zoneName = midzoTz === 'Europe/Berlin' ? t('slots.germany') : midzoTz;
  const localZone = (localTz ?? '').split('/').pop()?.replace(/_/g, ' ');

  /** « lun.–ven. 18:00–21:00 · sam. 08:00–20:00 · dim. 17:00–21:00 », jours consécutifs regroupés. */
  const hoursText = useMemo(() => {
    const dayName = (d: number) => new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 10, 1 + d)));
    const order = [1, 2, 3, 4, 5, 6, 0];
    const groups: { days: number[]; text: string }[] = [];
    order.forEach(d => {
      const text = (weekly[String(d)] ?? []).map(([a, b]) => `${a}–${b}`).join(', ');
      if (!text) return;
      const last = groups[groups.length - 1];
      if (last && last.text === text && order.indexOf(last.days[last.days.length - 1]) === order.indexOf(d) - 1) last.days.push(d);
      else groups.push({ days: [d], text });
    });
    return groups.map(g => `${g.days.length > 1 ? `${dayName(g.days[0])}–${dayName(g.days[g.days.length - 1])}` : dayName(g.days[0])} ${g.text}`).join(' · ');
  }, [weekly, lang]);

  if (error) return <p className="text-sm text-red-600">{t('slots.error')}</p>;
  if (!slots) return <p className="text-sm text-gray-500">{t('slots.loading')}</p>;
  if (!days.length) return <p className="text-sm text-gray-600">{t('slots.none')}</p>;

  const activeDay = day ?? (value ? dayKey(value) : days[0]?.[0] ?? null);
  const dayLabel = (iso: string) => new Intl.DateTimeFormat(lang, { timeZone: localTz, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));

  return (
    <div className="space-y-3" data-testid="consultation-slots">
      <div>
        <p className="text-sm font-medium text-gray-700">{t('slots.title')}</p>
        <p className="text-xs text-gray-500">
          {localZone ? t('slots.shown_local', { zone: localZone }) : t('slots.shown_local_generic')}
          {' '}{t('slots.hours', { hours: hoursText, zone: zoneName })}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('slots.days')}>
        {days.map(([key, list]) => (
          <button key={key} type="button" role="tab" aria-selected={key === activeDay} onClick={() => setDay(key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm border transition-colors ${key === activeDay ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
            {dayLabel(list[0].start)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label={t('slots.times')}>
        {(days.find(([key]) => key === activeDay)?.[1] ?? []).map(s => {
          const active = s.start === value;
          return (
            <button key={s.start} type="button" disabled={!s.available} aria-pressed={active} onClick={() => onChange(active ? null : s.start)}
              className={`px-2 py-2 rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:line-through ${active ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-gray-200 hover:border-primary/50'}`}>
              {time(s.start, localTz)}
              {!sameAsMidzo(s.start) && <span className="block text-[11px] text-gray-500">{t('slots.midzo_time', { time: time(s.start, midzoTz), zone: zoneName })}</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-600" data-testid="consultation-slot-choice">
        {value
          ? t(sameAsMidzo(value) ? 'slots.chosen_same' : 'slots.chosen', {
            date: new Intl.DateTimeFormat(lang, { timeZone: localTz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value)),
            time: time(value, localTz),
            midzo: time(value, midzoTz),
            zone: zoneName,
          })
          : t('slots.pick')}
      </p>
    </div>
  );
};

export default ConsultationSlotPicker;
