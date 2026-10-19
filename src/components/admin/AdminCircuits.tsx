import React, { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { formatEuros } from '../../pricing/pricingEngine';
import { TOURISM_SERVICES } from '../tourism/tourismProject';
import { Badge, Card, Field, Modal, PageHeader, PrimaryButton, SecondaryButton, TextArea, TextInput } from './ui';

/**
 * Circuits types : itinéraire (étapes pays / villes / nuits), services inclus, publication.
 * Le prix « à partir de » n'est pas saisi : il est calculé depuis la grille tarifaire.
 */
interface Stop { country: string; label: string; cities: string; nights: string }
const emptyForm = { id: 0, slug: '', title: '', summary: '', description: '', image: '', duration_days: '8', best_time: '', highlights: '', services: [] as string[], travelers_base: '2', is_published: false, order: '0', stops: [{ country: '', label: '', cities: '', nights: '' }] as Stop[] };

const AdminCircuits: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const r = await apiService.adminGetCircuits().catch(() => null);
    setRows(r?.data ?? []);
  }, []);
  useEffect(() => { load(); apiService.getTourismCountries().then(r => setCountries(r?.data ?? [])).catch(() => {}); }, [load]);

  const edit = (c?: any) => {
    setError('');
    setForm(c ? {
      id: c.id, slug: c.slug, title: c.title, summary: c.summary ?? '', description: c.description ?? '', image: c.image ?? '',
      duration_days: String(c.duration_days), best_time: c.best_time ?? '', highlights: (c.highlights ?? []).join('\n'), services: c.services ?? [],
      travelers_base: String(c.travelers_base ?? 2), is_published: c.is_published, order: String(c.order ?? 0),
      stops: c.stops.map((s: any) => ({ country: s.country, label: s.label ?? '', cities: (s.cities ?? []).join(', '), nights: s.nights ? String(s.nights) : '' })),
    } : { ...emptyForm, stops: [{ country: '', label: '', cities: '', nights: '' }] });
  };

  const save = async () => {
    if (!form) return;
    const payload = {
      slug: form.slug, title: form.title, summary: form.summary, description: form.description, image: form.image || null,
      duration_days: Number(form.duration_days), best_time: form.best_time, highlights: form.highlights.split('\n').map(x => x.trim()).filter(Boolean),
      services: form.services, travelers_base: Number(form.travelers_base) || 2, is_published: form.is_published, order: Number(form.order) || 0,
      stops: form.stops.filter(s => s.country).map(s => ({ country: s.country, label: s.label || undefined, cities: s.cities.split(',').map(x => x.trim()).filter(Boolean), nights: Number(s.nights) || undefined })),
    };
    try {
      if (form.id) await apiService.adminUpdateCircuit(form.id, payload);
      else await apiService.adminCreateCircuit(payload);
      setForm(null);
      load();
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible');
    }
  };

  const setStop = (i: number, k: keyof Stop, v: string) => form && setForm({ ...form, stops: form.stops.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  return (
    <div>
      <PageHeader title="Circuits types" subtitle="Itinéraires d’inspiration publiés sur /tourism/circuits ; prix calculé depuis la grille."
        actions={<PrimaryButton onClick={() => edit()}>+ Nouveau circuit</PrimaryButton>} />
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-stone-800">{c.title}</p>
              <Badge tone={c.is_published ? 'green' : 'slate'}>{c.is_published ? 'Publié' : 'Brouillon'}</Badge>
            </div>
            <p className="text-sm text-stone-500 mt-1">{c.duration_days} jours · {c.stops.map((s: any) => s.label).join(' → ')}</p>
            <p className="text-sm text-stone-700 mt-1">Dès {c.price_from ? formatEuros(c.price_from.price_cents) : '—'} ({c.price_from?.label ?? 'aucun service'}) pour {c.travelers_base} voyageurs</p>
            <div className="mt-3 flex gap-2">
              <SecondaryButton onClick={() => edit(c)}>Modifier</SecondaryButton>
              <SecondaryButton onClick={async () => { await apiService.adminUpdateCircuit(c.id, { is_published: !c.is_published }); load(); }}>{c.is_published ? 'Dépublier' : 'Publier'}</SecondaryButton>
              <SecondaryButton onClick={async () => { if (window.confirm(`Supprimer « ${c.title} » ?`)) { await apiService.adminDeleteCircuit(c.id); load(); } }}>Supprimer</SecondaryButton>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-stone-500">Aucun circuit.</p>}
      </div>

      {form && (
        <Modal title={form.id ? 'Modifier le circuit' : 'Nouveau circuit'} onClose={() => setForm(null)} maxWidth="max-w-3xl"
          footer={<><SecondaryButton onClick={() => setForm(null)}>Annuler</SecondaryButton><PrimaryButton onClick={save}>Enregistrer</PrimaryButton></>}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Titre" required><TextInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Identifiant (URL)" required><TextInput value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="kenya-safari-plage" /></Field>
            <Field label="Durée (jours)" required><TextInput type="number" min={1} value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })} /></Field>
            <Field label="Voyageurs de base (prix affiché)"><TextInput type="number" min={1} value={form.travelers_base} onChange={e => setForm({ ...form, travelers_base: e.target.value })} /></Field>
            <Field label="Meilleure période"><TextInput value={form.best_time} onChange={e => setForm({ ...form, best_time: e.target.value })} /></Field>
            <Field label="Image (URL)"><TextInput value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></Field>
          </div>
          <Field label="Résumé"><TextArea rows={2} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></Field>
          <Field label="Description"><TextArea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Points forts (un par ligne)"><TextArea rows={3} value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} /></Field>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-1">Étapes</p>
            {form.stops.map((s, i) => (
              <div key={i} className="grid grid-cols-[1.2fr_1fr_2fr_0.6fr] gap-2 mb-2">
                <select aria-label={`Pays de l’étape ${i + 1}`} value={s.country} onChange={e => setStop(i, 'country', e.target.value)} className="border border-stone-300 rounded-lg px-2 text-sm">
                  <option value="">Pays…</option>
                  {countries.map(c => <option key={c.name} value={c.name}>{c.nameFr || c.name}</option>)}
                </select>
                <TextInput aria-label="Libellé" placeholder="Libellé (facultatif)" value={s.label} onChange={e => setStop(i, 'label', e.target.value)} />
                <TextInput aria-label="Villes" placeholder="Villes, séparées par des virgules" value={s.cities} onChange={e => setStop(i, 'cities', e.target.value)} />
                <TextInput aria-label="Nuits" type="number" min={1} placeholder="Nuits" value={s.nights} onChange={e => setStop(i, 'nights', e.target.value)} />
              </div>
            ))}
            <SecondaryButton onClick={() => setForm({ ...form, stops: [...form.stops, { country: '', label: '', cities: '', nights: '' }] })}>+ Étape</SecondaryButton>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-1">Services inclus (prix calculé depuis la grille)</p>
            <div className="grid sm:grid-cols-2 gap-1">
              {TOURISM_SERVICES.map(sv => (
                <label key={sv.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" checked={form.services.includes(sv.id)} onChange={() => setForm({ ...form, services: form.services.includes(sv.id) ? form.services.filter(x => x !== sv.id) : [...form.services, sv.id] })} />
                  {sv.id} — {sv.label}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} /> Publié</label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </Modal>
      )}
    </div>
  );
};

export default AdminCircuits;
