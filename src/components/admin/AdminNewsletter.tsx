import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

// Story 9.6 (FR33) : envoi de campagnes newsletter segmentées (study|tourism).
const AdminNewsletter: React.FC = () => {
  const [type, setType] = useState<'study' | 'tourism'>('study');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const send = async () => {
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await apiService.adminSendNewsletter({ type, subject, body });
      setResult(res?.data);
      setSubject('');
      setBody('');
    } catch (e: any) {
      setError(e?.message || 'Échec de l’envoi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Campagne newsletter</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {result && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Campagne envoyée — {result.sent}/{result.recipients} destinataire(s){result.failed ? `, ${result.failed} échec(s)` : ''}.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
          <select value={type} onChange={e => setType(e.target.value as any)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="study">Études</option>
            <option value="tourism">Tourisme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={send} disabled={sending || !subject || !body}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
          <PaperAirplaneIcon className="h-4 w-4" />
          {sending ? 'Envoi...' : 'Envoyer la campagne'}
        </button>
      </div>
    </div>
  );
};

export default AdminNewsletter;
