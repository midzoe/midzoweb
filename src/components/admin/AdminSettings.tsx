import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Field, TextInput, PrimaryButton } from './ui';

// Story 9.9 (FR40/FR41) : settings self-service — mot de passe, email (re-vérif), préférences.
const AdminSettings: React.FC = () => {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwdBusy, setPwdBusy] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const submitPassword = async () => {
    setPwdBusy(true); setPwdMsg(null);
    try {
      await apiService.changePassword(oldPassword, newPassword);
      setPwdMsg({ type: 'ok', text: 'Mot de passe mis à jour.' });
      setOldPassword(''); setNewPassword('');
    } catch (e: any) {
      setPwdMsg({ type: 'err', text: e?.message || 'Échec.' });
    } finally { setPwdBusy(false); }
  };

  const submitEmail = async () => {
    setEmailBusy(true); setEmailMsg(null);
    try {
      await apiService.changeEmail(email, emailPassword);
      setEmailMsg({ type: 'ok', text: 'Email mis à jour — un code de vérification a été envoyé à la nouvelle adresse.' });
      setEmailPassword('');
    } catch (e: any) {
      setEmailMsg({ type: 'err', text: e?.message || 'Échec.' });
    } finally { setEmailBusy(false); }
  };

  const Msg = ({ m }: { m: { type: 'ok' | 'err'; text: string } | null }) =>
    m ? <p className={`text-sm mt-1 ${m.type === 'ok' ? 'text-primary' : 'text-rose-600'}`}>{m.text}</p> : null;

  return (
    <div className="max-w-xl">
      <PageHeader title="Paramètres du compte" subtitle="Gérez votre mot de passe et votre adresse email." />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-4">Mot de passe</h2>
          <div className="space-y-3">
            <Field label="Mot de passe actuel">
              <TextInput type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            </Field>
            <Field label="Nouveau mot de passe">
              <TextInput type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" />
            </Field>
            <PrimaryButton onClick={submitPassword} disabled={pwdBusy || !oldPassword || newPassword.length < 6}>
              {pwdBusy ? '...' : 'Changer le mot de passe'}
            </PrimaryButton>
            <Msg m={pwdMsg} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-1">Adresse email</h2>
          <p className="text-xs text-stone-500 mb-4">Changer l'email nécessite une re-vérification de la nouvelle adresse.</p>
          <div className="space-y-3">
            <Field label="Nouvel email">
              <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field label="Mot de passe (confirmation)">
              <TextInput type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} />
            </Field>
            <PrimaryButton onClick={submitEmail} disabled={emailBusy || !email || !emailPassword}>
              {emailBusy ? '...' : "Changer l'email"}
            </PrimaryButton>
            <Msg m={emailMsg} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

