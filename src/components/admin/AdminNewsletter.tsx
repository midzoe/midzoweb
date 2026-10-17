import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { PageHeader, Card, Field, TextInput, TextArea, Select, PrimaryButton } from './ui';

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
      setError(e?.message || "Échec de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Campagne newsletter" subtitle="Envoi segmenté aux abonnés (études ou tourisme)." />

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}
      {result && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm">
          Campagne envoyée — {result.sent}/{result.recipients} destinataire(s){result.failed ? `, ${result.failed} échec(s)` : ''}.
        </div>
      )}

      <Card className="p-6 space-y-4">
        <Field label="Segment">
          <Select value={type} onChange={e => setType(e.target.value as any)}>
            <option value="study">Études</option>
            <option value="tourism">Tourisme</option>
          </Select>
        </Field>
        <Field label="Sujet" required>
          <TextInput value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet de l'email" />
        </Field>
        <Field label="Contenu" required>
          <TextArea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder="Corps du message…" />
        </Field>
        <PrimaryButton onClick={send} disabled={sending || !subject || !body}>
          <PaperAirplaneIcon className="h-4 w-4" />
          {sending ? 'Envoi...' : 'Envoyer la campagne'}
        </PrimaryButton>
      </Card>
    </div>
  );
};

export default AdminNewsletter;
