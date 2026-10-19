import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TEXT = {
  fr: ['J’accepte les ', 'conditions générales de vente', ' et la ', 'politique d’annulation et de remboursement', '.'],
  en: ['I accept the ', 'terms of sale', ' and the ', 'cancellation & refund policy', '.'],
  de: ['Ich akzeptiere die ', 'AGB', ' und die ', 'Stornierungs- und Erstattungsrichtlinie', '.'],
};

/** Acceptation des CGV avant paiement (exigée aussi côté serveur). */
const TermsCheckbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id?: string }> = ({ checked, onChange, id = 'accept-terms' }) => {
  const { i18n } = useTranslation();
  const lang = (['fr', 'en', 'de'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'en') as keyof typeof TEXT;
  const [a, cgv, b, refund, c] = TEXT[lang];
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300" data-testid="accept-terms" />
      <span>{a}<Link to="/cgv" target="_blank" className="underline text-primary">{cgv}</Link>{b}<Link to="/remboursement" target="_blank" className="underline text-primary">{refund}</Link>{c}</span>
    </label>
  );
};

export default TermsCheckbox;
