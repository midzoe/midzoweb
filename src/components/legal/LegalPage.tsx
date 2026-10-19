import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COMPANY, CompanyKey } from '../../config/company';
import { LEGAL, LEGAL_PATHS, LEGAL_UI, LEGAL_UPDATED, LegalDocId, LegalLang } from './legalContent';

/** Remplace {{clé}} par la donnée de société ; vide → surligné « à compléter ». */
function fill(text: string, missing: string): React.ReactNode[] {
  return text.split(/(\{\{\w+\}\})/g).map((part, i) => {
    const m = part.match(/^\{\{(\w+)\}\}$/);
    if (!m) return part;
    const value = COMPANY[m[1] as CompanyKey];
    if (value !== undefined && value !== '' && !(typeof value === 'number' && Number.isNaN(value))) return String(value);
    return <mark key={i} className="bg-amber-100 text-amber-900 px-1 rounded" data-missing={m[1]}>[{missing}]</mark>;
  });
}

const LegalPage: React.FC<{ doc: LegalDocId }> = ({ doc }) => {
  const { i18n } = useTranslation();
  const lang = (['fr', 'en', 'de'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'en') as LegalLang;
  const content = LEGAL[lang][doc];
  const ui = LEGAL_UI[lang];
  const hasMissing = JSON.stringify(content).match(/\{\{(\w+)\}\}/g)?.some(k => {
    const v = COMPANY[k.slice(2, -2) as CompanyKey];
    return v === '' || v === undefined;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{ui.updated} : {new Date(LEGAL_UPDATED).toLocaleDateString(lang)}</p>
        {hasMissing && <p className="mb-6 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-900 p-3">{ui.reviewNote}</p>}
        {content.intro && <p className="text-gray-700 mb-6">{fill(content.intro, ui.missing)}</p>}
        {content.sections.map(s => (
          <section key={s.h} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.h}</h2>
            {s.p.map((p, i) => <p key={i} className="text-gray-700 mb-2 leading-relaxed">{fill(p, ui.missing)}</p>)}
          </section>
        ))}
        <nav className="mt-10 pt-6 border-t border-gray-100 text-sm" aria-label={ui.others}>
          <p className="text-gray-500 mb-2">{ui.others}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {(Object.keys(LEGAL_PATHS) as LegalDocId[]).filter(d => d !== doc).map(d => (
              <Link key={d} to={LEGAL_PATHS[d]} className="text-primary underline">{LEGAL[lang][d].title}</Link>
            ))}
          </div>
        </nav>
      </article>
    </div>
  );
};

export default LegalPage;
