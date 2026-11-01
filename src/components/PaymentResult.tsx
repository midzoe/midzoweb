import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatMoney, useCurrency } from '../pricing/currency';


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
  useCurrency();
  const { t } = useTranslation('ui');
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
      <Shell icon={<XCircleIcon className="h-12 w-12 text-gray-400" />} title={t('pay.cancel_title')}>
        <p>{t('pay.cancel_text')}</p>
        <Actions />
      </Shell>
    );
  }
  if (state === 'loading') return <Shell title={t('pay.loading_title')}><p>{t('pay.loading_text')}</p></Shell>;
  if (state === 'error') {
    return (
      <Shell icon={<XCircleIcon className="h-12 w-12 text-red-400" />} title={t('pay.error_title')}>
        <p>{user ? t('pay.error_text') : t('pay.error_login')}</p>
        <Actions />
      </Shell>
    );
  }
  const plan = purchase && purchase.installments > 1
    ? t('pay.plan', { count: purchase.installments, amount: formatMoney(Math.round(purchase.amount_cents / purchase.installments), purchase.currency) })
    : null;
  return (
    <Shell icon={<CheckCircleIcon className="h-12 w-12 text-emerald-500" />} title={state === 'paid' ? t('pay.paid_title') : t('pay.pending_title')}>
      {purchase && (
        <dl className="text-sm text-left bg-gray-50 rounded-xl p-4 space-y-1 my-4" data-testid="payment-summary">
          <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('pay.offer')}</dt><dd className="font-medium">{purchase.offer_label ?? '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('pay.amount')}</dt><dd className="font-medium">{formatMoney(purchase.amount_cents, purchase.currency)}</dd></div>
          {plan && <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('pay.payment')}</dt><dd className="font-medium">{plan}</dd></div>}
        </dl>
      )}
      <p>{state === 'paid'
        ? t('pay.paid_text')
        : t('pay.pending_text')}</p>
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

const Actions = () => {
  const { t } = useTranslation('ui');
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium">{t('pay.dashboard')}</Link>
      <Link to="/contact" className="px-5 py-2.5 rounded-xl border border-primary text-primary font-medium">{t('pay.contact')}</Link>
    </div>
  );
};

export default PaymentResult;
