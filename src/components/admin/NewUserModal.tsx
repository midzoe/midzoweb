import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { ALL_COUNTRIES } from '../../data/countryNames';
import { Field, Modal, PrimaryButton, SecondaryButton, Select, TextInput } from './ui';

/**
 * Compte créé par l'équipe pour un client reçu en agence ou au téléphone. Le client reçoit
 * un email d'invitation avec un code pour choisir son mot de passe (aucun mot de passe ne
 * transite par l'admin).
 */
const NewUserModal: React.FC<{ onClose: () => void; onCreated: (email: string) => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', nationality: '', country_of_residence: '', is_premium: false, send_invite: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string | boolean) => setForm({ ...form, [k]: v });

  const save = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Email invalide.'); return; }
    setBusy(true);
    try {
      await apiService.adminCreateUser({ ...form, email: form.email.trim() });
      onCreated(form.email.trim());
    } catch (e: any) {
      setError(e?.status === 409 ? 'Un compte existe déjà avec cet email.' : 'Création impossible.');
      setBusy(false);
    }
  };

  return (
    <Modal title="Nouveau client" onClose={onClose} maxWidth="max-w-2xl"
      footer={<><SecondaryButton onClick={onClose}>Annuler</SecondaryButton><PrimaryButton onClick={save} disabled={busy}>{busy ? 'Création…' : 'Créer le compte'}</PrimaryButton></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Prénom"><TextInput aria-label="Prénom" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></Field>
        <Field label="Nom"><TextInput aria-label="Nom" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></Field>
        <Field label="Email" required><TextInput aria-label="Email du nouveau client" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Téléphone"><TextInput aria-label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+228 ..." /></Field>
        <Field label="Nationalité">
          <Select aria-label="Nationalité du client" value={form.nationality} onChange={e => set('nationality', e.target.value)}>
            <option value="">—</option>{ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Pays de résidence">
          <Select aria-label="Résidence du client" value={form.country_of_residence} onChange={e => set('country_of_residence', e.target.value)}>
            <option value="">—</option>{ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input type="checkbox" checked={form.send_invite} onChange={e => set('send_invite', e.target.checked)} />
        Envoyer l’invitation par email (le client choisit son mot de passe)
      </label>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </Modal>
  );
};

export default NewUserModal;
