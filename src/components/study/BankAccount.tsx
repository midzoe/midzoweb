import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Bank {
  name: string;
  country: string;
  accountTypes: {
    name: string;
    features: string[];
    monthlyFee: string;
    requirements: string[];
    minimumDeposit: string;
    cardType: string;
    withdrawalLimit: string;
    onlineBanking: boolean;
    studentPerks?: string[];
  }[];
  image: string;
  description: string;
}

const mockBanks: Bank[] = [
  {
    name: "UK Student Bank",
    country: "United Kingdom",
    accountTypes: [
      {
        name: "Basic Student",
        features: [
          "Free International Transfers",
          "Mobile Banking",
          "Student Discounts",
          "Overdraft up to £500"
        ],
        monthlyFee: "£0",
        requirements: ["Student ID", "Proof of Address", "Passport"],
        minimumDeposit: "£0",
        cardType: "Visa Debit",
        withdrawalLimit: "£300/day",
        onlineBanking: true,
        studentPerks: [
          "Free Amazon Prime Student for 6 months",
          "10% off at selected stores",
          "Free railcard for 4 years"
        ]
      },
      {
        name: "Student Plus",
        features: [
          "Free International Transfers",
          "Mobile Banking",
          "Premium Student Discounts",
          "Overdraft up to £2000",
          "Travel Insurance",
          "Mobile Phone Insurance"
        ],
        monthlyFee: "£5",
        requirements: [
          "Student ID",
          "Proof of Address",
          "Passport",
          "Minimum Course Duration 2 years"
        ],
        minimumDeposit: "£500",
        cardType: "Visa Debit Gold",
        withdrawalLimit: "£500/day",
        onlineBanking: true,
        studentPerks: [
          "Free Amazon Prime Student for 1 year",
          "20% off at selected stores",
          "Free railcard for 4 years",
          "Airport lounge access"
        ]
      },
      {
        name: "International Student Premium",
        features: [
          "Free Worldwide Transfers",
          "Mobile Banking",
          "Premium Student Discounts",
          "Overdraft up to £3000",
          "Comprehensive Travel Insurance",
          "Mobile Phone Insurance",
          "Priority Customer Service"
        ],
        monthlyFee: "£10",
        requirements: [
          "Student ID",
          "Proof of Address",
          "Passport",
          "Minimum Course Duration 2 years",
          "Proof of Funds"
        ],
        minimumDeposit: "£1000",
        cardType: "Visa Platinum",
        withdrawalLimit: "£1000/day",
        onlineBanking: true,
        studentPerks: [
          "Free Amazon Prime Student for 1 year",
          "30% off at selected stores",
          "Free railcard for 4 years",
          "Priority airport lounge access",
          "Dedicated international student advisor"
        ]
      }
    ],
    image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Leading UK bank offering comprehensive student banking solutions with excellent digital services."
  },
  {
    name: "Deutsche Student Bank",
    country: "Germany",
    accountTypes: [
      {
        name: "Basis Studentenkonto",
        features: [
          "Free ATM Withdrawals",
          "Online Banking",
          "Student Card",
          "Basic Insurance"
        ],
        monthlyFee: "€0",
        requirements: ["University Enrollment", "Registration Certificate", "Passport"],
        minimumDeposit: "€0",
        cardType: "Girocard",
        withdrawalLimit: "€500/day",
        onlineBanking: true,
        studentPerks: [
          "Public transport discounts",
          "Museum passes",
          "Study materials discount"
        ]
      },
      {
        name: "Komfort Studentenkonto",
        features: [
          "Free ATM Withdrawals Worldwide",
          "Online Banking",
          "Premium Student Card",
          "Travel Insurance",
          "Study Abroad Support"
        ],
        monthlyFee: "€5",
        requirements: [
          "University Enrollment",
          "Registration Certificate",
          "Passport",
          "Proof of Regular Income"
        ],
        minimumDeposit: "€250",
        cardType: "Visa Debit",
        withdrawalLimit: "€1000/day",
        onlineBanking: true,
        studentPerks: [
          "Public transport annual pass discount",
          "Culture pass",
          "Study materials allowance",
          "Language course discounts"
        ]
      }
    ],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Trusted German bank providing student-friendly accounts with nationwide ATM network."
  },
  {
    name: "Banque Étudiante",
    country: "France",
    accountTypes: [
      {
        name: "Compte Étudiant Basique",
        features: [
          "Free Bank Card",
          "Mobile App",
          "Insurance Package",
          "Student Discounts"
        ],
        monthlyFee: "€0",
        requirements: ["Student Card", "Residence Permit", "ID Card"],
        minimumDeposit: "€20",
        cardType: "Carte Bancaire",
        withdrawalLimit: "€300/day",
        onlineBanking: true,
        studentPerks: [
          "Cinema discounts",
          "Public transport benefits",
          "Book store discounts"
        ]
      },
      {
        name: "Compte Étudiant Premium",
        features: [
          "Premium Bank Card",
          "Mobile App",
          "Comprehensive Insurance",
          "International Transfers",
          "Travel Assistance"
        ],
        monthlyFee: "€7",
        requirements: [
          "Student Card",
          "Residence Permit",
          "ID Card",
          "Proof of Income/Scholarship"
        ],
        minimumDeposit: "€100",
        cardType: "Carte Premier",
        withdrawalLimit: "€800/day",
        onlineBanking: true,
        studentPerks: [
          "Theater and cinema passes",
          "Annual transport card",
          "Bookstore allowance",
          "Sports facility access"
        ]
      }
    ],
    image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "French banking institution specializing in international student services with comprehensive coverage."
  }
];

const BankAccount: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [monthlyFee, setMonthlyFee] = useState<string>("");
  const [cardType, setCardType] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
  const accountTypes = ["Basic Student", "Basic", "Plus", "Premium", "International"];
  const monthlyFees = ["Free", "Up to €5", "Up to €10", "Above €10"];
  const cardTypes = ["Visa Debit", "Visa Gold", "Visa Platinum", "Mastercard", "Girocard", "Carte Bancaire"];

  const filteredBanks = mockBanks.filter(bank => {
    if (country && bank.country !== country) return false;
    if (accountType) {
      const hasMatchingAccount = bank.accountTypes.some(acc => 
        acc.name.toLowerCase().includes(accountType.toLowerCase())
      );
      if (!hasMatchingAccount) return false;
    }
    if (cardType) {
      const hasMatchingCard = bank.accountTypes.some(acc => 
        acc.cardType.toLowerCase().includes(cardType.toLowerCase())
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

        {/* Results */}
        <div className="space-y-8">
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={bank.image}
                    alt={bank.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">{bank.name}</h3>
                  <p className="text-gray-600 mb-6">{bank.description}</p>

                  <div className="space-y-6">
                    {bank.accountTypes.map((account, accIndex) => (
                      <div 
                        key={accIndex}
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
                              {account.features.map((feature, idx) => (
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
                              {account.requirements.map((req, idx) => (
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
      </div>
    </div>
  );
};

export default BankAccount;