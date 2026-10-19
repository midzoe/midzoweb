import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES, currentCurrency, setCurrency, suggestCurrencyFromCountry, useCurrency } from '../pricing/currency';

/** Monnaie d'affichage (équivalent indicatif ; le paiement reste en euros). */
const CurrencySelect: React.FC<{ className?: string }> = ({ className = '' }) => {
  useCurrency();
  const { user } = useAuth();
  useEffect(() => {
    suggestCurrencyFromCountry(user?.country_of_residence || user?.nationality);
  }, [user?.country_of_residence, user?.nationality]);
  return (
    <select aria-label="Monnaie d’affichage" value={currentCurrency()} onChange={e => setCurrency(e.target.value)}
      className={`text-sm bg-transparent border border-gray-200 rounded-md px-2 py-1 text-gray-800 hover:border-primary ${className}`}>
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code === 'XOF' || c.code === 'XAF' ? `FCFA ${c.code === 'XOF' ? '(UEMOA)' : '(CEMAC)'}` : c.code}</option>)}
    </select>
  );
};

export default CurrencySelect;
