import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FAQ, FAQ_CATEGORIES, FAQ_UI, FaqLang } from './faqContent';

const FAQPage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = (['fr', 'en', 'de'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'en') as FaqLang;
  const items = FAQ[lang];
  const ui = FAQ_UI[lang];
  const labels = FAQ_CATEGORIES[lang];
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => ['all', ...new Set(items.map(i => i.category))], [items]);
  const q = query.trim().toLowerCase();
  const filtered = items.filter(i => (category === 'all' || i.category === category)
    && (!q || i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">{ui.title}</h1>

        <div className="mb-8 space-y-4">
          <input type="search" aria-label={ui.search} placeholder={ui.search} value={query} onChange={e => setQuery(e.target.value)}
            className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
          <div className="flex flex-wrap gap-2" role="group" aria-label={labels.all}>
            {categories.map(c => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {labels[c] ?? c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map(item => (
            <details key={item.question} className="group bg-white rounded-lg shadow p-5" open={!!q}>
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">{item.question}</h2>
                <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-gray-600">{item.answer}</p>
            </details>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">{ui.empty}</p>}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-700 mb-3">{ui.contact}</p>
          <Link to="/contact" className="inline-block px-5 py-3 rounded-xl bg-primary text-white font-semibold">{ui.contactCta}</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
