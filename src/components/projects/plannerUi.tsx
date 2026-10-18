import React from 'react';

// Briques de mise en page communes aux parcours Study et Tourisme.

export const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter(v => v !== value) : [...list, value];

export const externalHref = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

// ── Petits composants de mise en page ─────────────────────────────────────────

export const Section: React.FC<{ step: number; title: string; subtitle?: string; id?: string; children: React.ReactNode }> = ({
  step, title, subtitle, id, children,
}) => (
  <section id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
    <div className="flex items-start gap-4 mb-6">
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center">
        {step}
      </span>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

export const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
    }`}
  >
    {children}
  </button>
);

export const InfoCard: React.FC<{ title: string; children: React.ReactNode; tone?: 'default' | 'warning' }> = ({ title, children, tone = 'default' }) => (
  <div className={`rounded-xl border p-5 ${tone === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
    <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
    <div className="text-sm text-gray-700 space-y-2">{children}</div>
  </div>
);

export const LinkList: React.FC<{ links: { label: string; url: string }[] }> = ({ links }) =>
  links.length ? (
    <ul className="space-y-1">
      {links.map(l => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary underline">
            {l.label} ↗
          </a>
        </li>
      ))}
    </ul>
  ) : null;

export const fieldClass = 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary';

