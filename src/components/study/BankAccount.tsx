import React, { useState } from 'react';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';
import ActionButton from '../common/ActionButton';
import { FilterSelect, useCatalog, CatalogEmpty } from '../common/catalogKit';

// Banques et comptes étudiants servis par le backend (Bank + BankAccountType).
interface BankAccountType {
  id: number;
  name: string;
  features?: string[];
  monthlyFee?: string;
  requirements?: string[];
  minimumDeposit?: string;
  cardType?: string;
  withdrawalLimit?: string;
  onlineBanking: boolean;
  studentPerks?: string[];
}

interface Bank {
  id: number;
  name: string;
  country: string;
  image?: string;
  description?: string;
  accountTypes: BankAccountType[];
}

/**
 * Premier nombre de la grille tarifaire (« 0 € pour les étudiants », « $4.95 (offert…) »,
 * « 0 à 2 € selon la formule »). Sert à distinguer un compte gratuit d'un compte payant
 * sans dépendre de la devise, qui change d'un pays à l'autre.
 */
const firstAmount = (fee?: string): number | null => {
  if (!fee) return null;
  const m = fee.replace(/ |\s/g, '').match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',', '.')) : null;
};

const BankAccount: React.FC = () => {
  const { t, countryOptions, country: countryLabel, colon } = useCatalog();
  const [country, setCountry] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [monthlyFee, setMonthlyFee] = useState<string>("");
  const [cardType, setCardType] = useState<string>("");

  // Tout le catalogue est chargé une fois : le menu des pays ne propose que ceux qui ont
  // des banques. Pays, carte, frais et recherche sont filtrés ici.
  const { items: allBanks, loading, error } = useApiList<Bank>(
    () => apiService.getBanks(),
    [],
    { errorMessage: t('common.error') }
  );
  const banks = country ? allBanks.filter(b => b.country === country) : allBanks;

  // Les cartes varient selon le pays (Girocard, UnionPay, Interac…) et chaque banque décrit
  // la sienne à sa façon (« Carte de débit Visa », « Girocard + Visa Debit »). Le filtre porte
  // donc sur le réseau, pas sur le libellé exact — sinon la liste compterait autant d'options
  // que de fiches. Ceux qui ne relèvent d'aucun réseau connu tombent dans « Autre ».
  const NETWORKS = ['Visa', 'Mastercard', 'Girocard', 'Interac', 'UnionPay', 'Maestro'];
  const NO_CARD = 'Sans carte';

  // Le libellé de la carte est traduit (DeepL) : « sans carte » se reconnaît dans les trois langues.
  const noCard = (label: string) => /sans carte|no card|without (a )?card|ohne karte|keine karte/i.test(label);

  const cardLabels = banks.flatMap(b => (b.accountTypes ?? []).map(a => (a.cardType ?? '').trim())).filter(Boolean);
  const matchesNetwork = (label: string, network: string) =>
    network === 'Other'
      ? !noCard(label) && !NETWORKS.some(n => label.toLowerCase().includes(n.toLowerCase()))
      : network === NO_CARD
        ? noCard(label)
        : label.toLowerCase().includes(network.toLowerCase());

  const cardTypes = [...NETWORKS, NO_CARD, 'Other'].filter(n => cardLabels.some(l => matchesNetwork(l, n)));

  const filteredBanks = banks.filter(bank => {
    const accounts = bank.accountTypes ?? [];
    if (cardType && !accounts.some(acc => matchesNetwork((acc.cardType ?? '').trim(), cardType))) return false;
    if (monthlyFee) {
      const matches = accounts.some(acc => {
        const amount = firstAmount(acc.monthlyFee);
        if (amount === null) return false;
        return monthlyFee === 'free' ? amount === 0 : amount > 0;
      });
      if (!matches) return false;
    }
    const q = search.trim().toLowerCase();
    if (q) {
      const haystack = [
        bank.name,
        bank.description ?? '',
        ...accounts.map(a => [a.name, ...(a.features ?? []), ...(a.requirements ?? [])].join(' ')),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('bank.title')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterSelect label={t('common.country')} all={t('common.all_countries')} value={country}
              onChange={v => { setCountry(v); setCardType(''); }}
              options={countryOptions(allBanks.map(b => b.country))} />

            <div>
              <label htmlFor="bank-search" className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.search')}
              </label>
              <input
                id="bank-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('bank.search_ph')}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>

            <FilterSelect label={t('bank.monthly_fee')} all={t('common.all')} value={monthlyFee} onChange={setMonthlyFee}
              options={[{ value: 'free', label: t('bank.fee_free') }, { value: 'paid', label: t('bank.fee_paid') }]} />

            {/* La valeur reste celle du catalogue ; seul l'affichage est traduit. */}
            <FilterSelect label={t('bank.card_type')} all={t('bank.all_cards')} value={cardType} onChange={setCardType}
              options={cardTypes.map(type => ({
                value: type,
                label: type === NO_CARD ? t('bank.no_card') : type === 'Other' ? t('bank.other_card') : type,
              }))} />
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="space-y-8">
          {filteredBanks.length > 0 ? (
            filteredBanks.map(bank => (
              <div key={bank.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {bank.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={bank.image}
                      alt={bank.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">{bank.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{countryLabel(bank.country)}</p>
                  <p className="text-gray-600 mb-6">{bank.description}</p>

                  <div className="space-y-6">
                    {(bank.accountTypes ?? []).map(account => (
                      <div
                        key={account.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {account.name}
                          </h4>
                          {account.monthlyFee && (
                            // Le libellé porte déjà la période et parfois une condition
                            // (« 0 € jusqu'à 30 ans ») : pas de suffixe « /month » ajouté.
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {t('bank.fee_label', { fee: account.monthlyFee })}
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">{t('common.features')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {(account.features ?? []).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>

                          {(account.studentPerks ?? []).length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">{t('bank.perks')}</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {account.studentPerks?.map((perk, idx) => (
                                  <li key={idx}>{perk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">{t('bank.open_requirements')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {(account.requirements ?? []).map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <p className="text-gray-600">
                              <span className="font-medium">{colon(t('bank.card'))}</span> {account.cardType}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">{colon(t('bank.min_deposit'))}</span> {account.minimumDeposit}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">{colon(t('bank.withdrawal'))}</span> {account.withdrawalLimit}
                            </p>
                          </div>
                        </div>

                        <ActionButton href={(account as any).link} service={`Compte bancaire — ${account.name}`} className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                          {t('bank.open')}
                        </ActionButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CatalogEmpty total={allBanks.length} service="Compte bancaire" className="text-gray-500 text-lg" />
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default BankAccount;