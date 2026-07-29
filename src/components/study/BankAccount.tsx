import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

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

const BankAccount: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [monthlyFee, setMonthlyFee] = useState<string>("");
  const [cardType, setCardType] = useState<string>("");
  
  const { countries: allCountries } = useCountries();
  const accountTypes = ["Basic Student", "Basic", "Plus", "Premium", "International"];
  const monthlyFees = ["Free", "Up to €5", "Up to €10", "Above €10"];
  const cardTypes = ["Visa Debit", "Visa Gold", "Visa Platinum", "Mastercard", "Girocard", "Carte Bancaire"];

  // Le pays filtre côté serveur ; type de compte et carte portent sur les comptes
  // imbriqués, donc affinés ici.
  const { items: banks, loading, error } = useApiList<Bank>(
    () => apiService.getBanks({ country }),
    [country],
    { errorMessage: 'Unable to load bank offers. Please try again later.' }
  );

  const filteredBanks = banks.filter(bank => {
    const accounts = bank.accountTypes ?? [];
    if (accountType) {
      const hasMatchingAccount = accounts.some(acc =>
        acc.name.toLowerCase().includes(accountType.toLowerCase())
      );
      if (!hasMatchingAccount) return false;
    }
    if (cardType) {
      const hasMatchingCard = accounts.some(acc =>
        (acc.cardType ?? '').toLowerCase().includes(cardType.toLowerCase())
      );
      if (!hasMatchingCard) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Student Bank Account</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fee
              </label>
              <select
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Ranges</option>
                {monthlyFees.map(fee => (
                  <option key={fee} value={fee}>{fee}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Card Types</option>
                {cardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading bank offers...</p>
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
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {account.monthlyFee}/month
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {(account.features ?? []).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Student Perks</h5>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {account.studentPerks?.map((perk, idx) => (
                                <li key={idx}>{perk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {(account.requirements ?? []).map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <p className="text-gray-600">
                              <span className="font-medium">Card Type:</span> {account.cardType}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Minimum Deposit:</span> {account.minimumDeposit}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Withdrawal Limit:</span> {account.withdrawalLimit}
                            </p>
                          </div>
                        </div>

                        <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                          Open Account
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No banks found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default BankAccount;