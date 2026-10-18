import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { formatEuros } from '../pricing/pricingEngine';

interface Dossier {
  is_premium: boolean;
  case: { status: string; assigned_to: string | null; client_message: string | null; next_step: string | null; updated_at: string } | null;
  purchases: { id: number; offer_label: string; amount_cents: number; currency: string; installments: number; installments_paid: number; method: string; status: string; paid_at: string | null }[];
  services: { total: number; done: number };
}

const CASE_LABELS: Record<string, { label: string; className: string }> = {
  open: { label: 'Dossier ouvert', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En cours de traitement', className: 'bg-amber-100 text-amber-800' },
  closed: { label: 'Dossier clôturé', className: 'bg-gray-100 text-gray-600' },
};
const METHOD_LABELS: Record<string, string> = { stripe: 'carte', transfer: 'virement', mobile_money: 'Mobile Money', cash: 'espèces', other: 'autre' };
const PURCHASE_STATUS: Record<string, string> = { paid: 'réglé', past_due: 'échéance en retard', cancelled: 'annulé' };

/**
 * « Mon accompagnement » : ce que l'équipe a fait du dossier (statut, conseiller, message,
 * prochaine étape), les achats et l'avancement des services. Les notes internes n'y figurent pas.
 */
const DossierCard: React.FC = () => {
  const [dossier, setDossier] = useState<Dossier | null>(null);

  useEffect(() => {
    let alive = true;
    apiService.getMyDossier().then(r => alive && setDossier(r?.data ?? null)).catch(() => alive && setDossier(null));
    return () => { alive = false; };
  }, []);

  if (!dossier || (!dossier.case && !dossier.purchases.length && !dossier.is_premium)) return null;
  const status = dossier.case ? CASE_LABELS[dossier.case.status] ?? CASE_LABELS.open : null;
  const pct = dossier.services.total ? Math.round((dossier.services.done / dossier.services.total) * 100) : 0;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-testid="dossier-card" aria-labelledby="dossier-title">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="dossier-title" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-gray-400" /> Mon accompagnement
        </h2>
        {status && <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`} data-testid="dossier-status">{status.label}</span>}
      </div>

      {dossier.case?.assigned_to && <p className="text-sm text-gray-600">Votre conseiller : <strong>{dossier.case.assigned_to}</strong></p>}
      {dossier.case?.client_message && (
        <p className="mt-3 text-sm text-gray-800 bg-emerald-50 border border-emerald-100 rounded-lg p-3 whitespace-pre-line" data-testid="dossier-message">
          {dossier.case.client_message}
        </p>
      )}
      {dossier.case?.next_step && <p className="mt-3 text-sm text-gray-700"><span className="text-gray-500">Prochaine étape : </span><strong data-testid="dossier-next-step">{dossier.case.next_step}</strong></p>}

      {dossier.services.total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Services réalisés</span><span>{dossier.services.done}/{dossier.services.total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      {dossier.purchases.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm" data-testid="dossier-purchases">
          {dossier.purchases.map(p => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border border-gray-100 rounded-lg px-3 py-2">
              <span className="font-medium text-gray-900">{p.offer_label}</span>
              <span className="text-gray-600">
                {formatEuros(p.amount_cents, p.currency)}
                {p.installments > 1 ? ` · ${p.installments_paid}/${p.installments} échéances` : ''}
                {` · ${METHOD_LABELS[p.method] ?? p.method}`}
                {` · ${PURCHASE_STATUS[p.status] ?? p.status}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/my-trips" className="mt-4 inline-block text-xs font-medium text-primary hover:underline">Voir mes voyages et services →</Link>
    </section>
  );
};

export default DossierCard;
