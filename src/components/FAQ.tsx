import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "General",
    question: "What is Midzoe?",
    answer: "Midzoe is a comprehensive travel companion platform that provides services for study, work, tourism, and business across the globe. We help users with everything from visa applications to accommodation booking."
  },
  {
    category: "General",
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Login' button in the top right corner and selecting 'Sign Up'. Follow the simple registration process by providing your email and creating a password."
  },
  {
    category: "Study",
    question: "How can I find universities abroad?",
    answer: "Our University Finder service helps you search and filter universities based on your preferences, including location, program, language of instruction, and budget. You can access this service through the Study section."
  },
  {
    category: "Study",
    question: "What documents do I need for studying abroad?",
    answer: "Required documents typically include your passport, academic transcripts, language proficiency certificates, and acceptance letter. The exact requirements vary by country and institution."
  },
  {
    category: "Tourism",
    question: "Can I book flights through Midzoe?",
    answer: "Yes, we offer flight booking services with competitive rates and special deals. You can search and compare flights in our Tourism section under 'Flight Booking'."
  },
  {
    category: "Tourism",
    question: "Do you provide travel insurance?",
    answer: "Yes, we offer comprehensive travel insurance packages that cover medical emergencies, trip cancellations, lost baggage, and more. You can find these under our Tourism services."
  },
  {
    category: "Business",
    question: "What business travel services do you offer?",
    answer: "We offer corporate accommodation booking, business visa assistance, transportation services, meeting venue arrangements, and business networking event access."
  },
  {
    category: "Business",
    question: "How can I organize a business event abroad?",
    answer: "Our business services team can help you arrange venues, catering, transportation, and accommodation for your business events. Contact our business services department for detailed assistance."
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and various digital payment methods. Payment options may vary depending on your location and the service selected."
  },
  {
    category: "Payment",
    question: "Are there any hidden fees?",
    answer: "No, we believe in transparent pricing. All fees and charges are clearly displayed before you confirm any booking or service."
  }
];

const FAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...new Set(faqItems.map(item => item.category))];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h1>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {filteredFAQs.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-lg font-semibold">
                      Q
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                    <p className="mt-2 text-gray-600">{item.answer}</p>
                    <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs found matching your criteria. Please try a different search or category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;