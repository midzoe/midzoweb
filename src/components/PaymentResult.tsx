import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatEuros } from '../pricing/pricingEngine';

interface Confirmed {
  status: string;
  offer_label: string | null;
  amount_cents: number;
  currency: string;
  installments: number;
  installments_paid: number;
}

/** Retour de Stripe : /payment/success?session_id=… (confirmation serveur) ou /payment/cancel. */
const PaymentResult: React.FC<{ outcome: 'success' | 'cancel' }> = ({ outcome }) => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'paid' | 'pending' | 'error'>(outcome === 'success' ? 'loading' : 'error');
  const [purchase, setPurchase] = useState<Confirmed | null>(null);
  const sessionId = params.get('session_id') ?? '';

  useEffect(() => {
    if (outcome !== 'success') return;
    if (!sessionId || !user) { setState('error'); return; }
    let alive = true;
    // Le webhook peut arriver après le retour : on relit la session côté serveur (idempotent).
    const check = async (attempt: number) => {
      try {
        const res = await apiService.confirmPayment(sessionId);
        if (!alive) return;
        setPurchase(res?.purchase ?? null);
        if (res?.purchase?.status === 'paid') setState('paid');
        else if (attempt < 5) setTimeout(() => check(attempt + 1), 2000);
        else setState('pending');
      } catch {
        if (alive) setState('error');
      }
    };
    check(0);
    return () => { alive = false; };
  }, [outcome, sessionId, user]);

  if (outcome === 'cancel') {
    return (
      <Shell icon={<XCircleIcon className="h-12 w-12 text-gray-400" />} title="Paiement annulé">
        <p>Aucun montant n’a été débité. Votre projet reste enregistré : vous pouvez payer plus tard ou demander un accompagnement.</p>
        <Actions />
      </Shell>
    );
  }
  if (state === 'loading') return <Shell title="Confirmation du paiement…"><p>Nous vérifions votre paiement auprès de Stripe.</p></Shell>;
  if (state === 'error') {
    return (
      <Shell icon={<XCircleIcon className="h-12 w-12 text-red-400" />} title="Paiement introuvable">
        <p>{user ? 'Nous n’avons pas pu vérifier ce paiement. S’il a été débité, il apparaîtra dans votre dashboard d’ici quelques minutes.' : 'Connectez-vous pour voir la confirmation de votre paiement.'}</p>
        <Actions />
      </Shell>
    );
  }
  const plan = purchase && purchase.installments > 1
    ? `${purchase.installments} échéances de ${formatEuros(Math.round(purchase.amount_cents / purchase.installments), purchase.currency)} (1re réglée)`
    : null;
  return (
    <Shell icon={<CheckCircleIcon className="h-12 w-12 text-emerald-500" />} title={state === 'paid' ? 'Paiement confirmé' : 'Paiement en cours de confirmation'}>
      {purchase && (
        <dl className="text-sm text-left bg-gray-50 rounded-xl p-4 space-y-1 my-4" data-testid="payment-summary">
          <div className="flex justify-between gap-4"><dt className="text-gray-500">Offre</dt><dd className="font-medium">{purchase.offer_label ?? '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-gray-500">Montant</dt><dd className="font-medium">{formatEuros(purchase.amount_cents, purchase.currency)}</dd></div>
          {plan && <div className="flex justify-between gap-4"><dt className="text-gray-500">Paiement</dt><dd className="font-medium">{plan}</dd></div>}
        </dl>
      )}
      <p>{state === 'paid'
        ? 'Votre dossier est ouvert : un conseiller MIDZOE vous contacte et suit chaque étape. Vous recevez aussi un email de confirmation.'
        : 'Stripe finalise la transaction : elle apparaîtra dans votre dashboard d’ici quelques minutes.'}</p>
      <Actions />
    </Shell>
  );
};

const Shell: React.FC<{ icon?: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="min-h-[60vh] bg-gray-50 py-16 px-4">
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-600">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
      {children}
    </div>
  </div>
);

const Actions = () => (
  <div className="flex flex-wrap justify-center gap-3 mt-6">
    <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium">Mon dashboard</Link>
    <Link to="/contact" className="px-5 py-2.5 rounded-xl border border-primary text-primary font-medium">Contacter un conseiller</Link>
  </div>
);

export default PaymentResult;
