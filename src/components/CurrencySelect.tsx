import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES, currentCurrency, setCurrency, suggestCurrencyFromCountry, useCurrency } from '../pricing/currency';

/** Nom de la monnaie dans la langue du site (« Franc guinéen », « Guinea Franc », « Guinea-Franc »). */
const currencyName = (code: string, lang: string, fallback: string) => {
  try {
    return new Intl.DisplayNames([lang], { type: 'currency' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
};

/** Monnaie d'affichage (équivalent indicatif ; le paiement reste en euros). */
const CurrencySelect: React.FC<{ className?: string }> = ({ className = '' }) => {
  useCurrency();
  const { t, i18n } = useTranslation('ui');
  const { user } = useAuth();
  useEffect(() => {
    suggestCurrencyFromCountry(user?.country_of_residence || user?.nationality);
  }, [user?.country_of_residence, user?.nationality]);
  return (
    <select aria-label={t('currency.label')} value={currentCurrency()} onChange={e => setCurrency(e.target.value)}
      className={`text-xs bg-transparent border border-gray-200 rounded-md pl-1.5 pr-6 py-1 w-[6.5rem] text-gray-800 hover:border-primary ${className}`}>
      {CURRENCIES.map(c => (
        <option title={currencyName(c.code, i18n.language, c.label)} key={c.code} value={c.code}>
          {c.code === 'XOF' ? 'FCFA UEMOA' : c.code === 'XAF' ? 'FCFA CEMAC' : c.code}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelect;
