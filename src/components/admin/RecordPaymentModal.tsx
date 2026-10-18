import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { usePricing } from '../../pricing/usePricing';
import { formatEuros, paymentPlan } from '../../pricing/pricingEngine';
import { Field, Modal, PrimaryButton, SecondaryButton, Select, TextArea, TextInput } from './ui';

/**
 * Paiement reçu HORS LIGNE (virement, Mobile Money, espèces) : rattache l'offre de la grille au
 * client, active le premium, ouvre le dossier et prévient le client — comme un paiement carte.
 * Sans `userId`, l'admin cherche le client par email.
 */
const METHODS = [
  { value: 'transfer', label: 'Virement' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cash', label: 'Espèces' },
  { value: 'other', label: 'Autre' },
];

const RecordPaymentModal: React.FC<{ userId?: number; userLabel?: string; onClose: () => void; onSaved: () => void }> = ({ userId, userLabel, onClose, onSaved }) => {
  const { pricing } = usePricing();
  const [clientEmail, setClientEmail] = useState('');
  const [client, setClient] = useState<{ id: number; label: string } | null>(userId ? { id: userId, label: userLabel ?? '' } : null);
  const [packageSlug, setPackageSlug] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState(1);
  const [paidCount, setPaidCount] = useState(1);
  const [method, setMethod] = useState('transfer');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const tiers = (pricing?.packages ?? []).filter(p => p.family);
  const tier = tiers.find(p => p.slug === packageSlug);

  // Choisir un palier remplit le libellé et le montant (remise selon le nombre d'échéances).
  useEffect(() => {
    if (!tier || !pricing) return;
    const option = pricing.payment_options.find(o => o.installments === installments) ?? { installments, discount_pct: 0 };
    setLabel(tier.name);
    setAmount(String(paymentPlan(tier.price_from_cents, option).totalCents / 100));
  }, [packageSlug, installments, pricing]); // eslint-disable-line react-hooks/exhaustive-deps

  const findClient = async () => {
    setError('');
    try {
      const res = await apiService.adminGetUsers(1, 5, clientEmail.trim());
      const list = res?.users ?? res?.data ?? [];
      const u = list.find((x: any) => x.email?.toLowerCase() === clientEmail.trim().toLowerCase()) ?? list[0];
      if (!u) { setError('Aucun client avec cet email.'); return; }
      setClient({ id: u.id, label: `${[u.firstName ?? u.first_name, u.lastName ?? u.last_name].filter(Boolean).join(' ')} — ${u.email}` });
    } catch { setError('Recherche impossible.'); }
  };

  const save = async () => {
    setError('');
    const cents = Math.round(Number(String(amount).replace(',', '.')) * 100);
    if (!client) { setError('Choisissez le client.'); return; }
    if (!label.trim()) { setError('Indiquez l’offre réglée.'); return; }
    if (!Number.isFinite(cents) || cents <= 0) { setError('Montant invalide.'); return; }
    setBusy(true);
    try {
      await apiService.adminRecordPurchase({
        user_id: client.id, offer_label: label.trim(), offer_id: tier?.slug ?? undefined, package_id: tier?.id,
        amount_cents: cents, installments, installments_paid: Math.min(paidCount, installments), method,
        reference: reference || undefined, note: note || undefined,
      });
      onSaved();
    } catch (e: any) { setError(e?.message || 'Enregistrement impossible.'); setBusy(false); }
  };

  return (
    <Modal title="Enregistrer un paiement reçu" onClose={onClose} maxWidth="max-w-2xl"
      footer={<><SecondaryButton onClick={onClose}>Annuler</SecondaryButton><PrimaryButton onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer le paiement'}</PrimaryButton></>}>
      {client ? (
        <p className="text-sm text-stone-700">Client : <strong>{client.label}</strong>
          {!userId && <button type="button" className="ml-2 text-xs underline text-stone-500" onClick={() => setClient(null)}>changer</button>}</p>
      ) : (
        <div className="flex gap-2 items-end">
          <Field label="Email du client"><TextInput aria-label="Email du client" value={clientEmail} onChange={e => setClientEmail(e.target.value)} /></Field>
          <SecondaryButton onClick={findClient}>Rechercher</SecondaryButton>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Package de la grille">
          <Select aria-label="Package de la grille" value={packageSlug} onChange={e => setPackageSlug(e.target.value)}>
            <option value="">— Autre / à la carte —</option>
            {tiers.map(p => <option key={p.id} value={p.slug ?? ''}>{p.name} ({formatEuros(p.price_from_cents)})</option>)}
          </Select>
        </Field>
        <Field label="Offre réglée" required><TextInput aria-label="Offre réglée" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex. Study Plus" /></Field>
        <Field label="Paiement en">
          <Select aria-label="Nombre d’échéances" value={installments} onChange={e => setInstallments(Number(e.target.value))}>
            {[1, 3, 6, 12].map(n => <option key={n} value={n}>{n === 1 ? '1 fois' : `${n} fois`}</option>)}
          </Select>
        </Field>
        <Field label="Montant total (€)" required><TextInput aria-label="Montant total" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        {installments > 1 && (
          <Field label="Échéances déjà reçues">
            <TextInput aria-label="Échéances reçues" type="number" min={1} max={installments} value={paidCount} onChange={e => setPaidCount(Number(e.target.value))} />
          </Field>
        )}
        <Field label="Moyen de paiement">
          <Select aria-label="Moyen de paiement" value={method} onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </Field>
        <Field label="Référence"><TextInput aria-label="Référence du paiement" value={reference} onChange={e => setReference(e.target.value)} placeholder="N° de virement, transaction Mobile Money…" /></Field>
      </div>
      <Field label="Note interne"><TextArea aria-label="Note interne" rows={2} value={note} onChange={e => setNote(e.target.value)} /></Field>
      <p className="text-xs text-stone-500">Le client passe premium, son dossier est ouvert et il reçoit une confirmation (notification + email).</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </Modal>
  );
};

export default RecordPaymentModal;
