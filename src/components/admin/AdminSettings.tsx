import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
    m ? <p className={`text-sm mt-2 ${m.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{m.text}</p> : null;

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mot de passe</h2>
        <div className="space-y-3">
          <input type="password" placeholder="Mot de passe actuel" value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Nouveau mot de passe (min. 6)" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={submitPassword} disabled={pwdBusy || !oldPassword || newPassword.length < 6}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
            {pwdBusy ? '...' : 'Changer le mot de passe'}
          </button>
          <Msg m={pwdMsg} />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse email</h2>
        <p className="text-xs text-gray-500 mb-3">Changer l'email nécessite une re-vérification de la nouvelle adresse.</p>
        <div className="space-y-3">
          <input type="email" placeholder="Nouvel email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Mot de passe (confirmation)" value={emailPassword}
            onChange={e => setEmailPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={submitEmail} disabled={emailBusy || !email || !emailPassword}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
            {emailBusy ? '...' : 'Changer l\'email'}
          </button>
          <Msg m={emailMsg} />
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;
