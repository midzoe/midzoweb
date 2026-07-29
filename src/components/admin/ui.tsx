import React from 'react';
import { XMarkIcon, CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

/**
 * Primitives UI partagées de l'admin (design « Data-Dense Dashboard »).
 * Objectif : une seule source de vérité pour l'en-tête de page, les cartes, les tuiles
 * KPI et les badges — pour que tous les écrans admin aient le même rendu impeccable.
 * Palette : marque (primary vert #44a46b), neutres slate, contraste AA.
 */

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="mb-8">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-800">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {/* Filet or éditorial */}
    <div className="mt-4 h-px w-full bg-gradient-to-r from-gold-300/70 via-stone-200 to-transparent" />
  </div>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white border border-stone-200/80 rounded-2xl shadow-card ${className}`}>{children}</div>
);

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  tone?: 'default' | 'primary' | 'gold' | 'rose' | 'teal' | 'indigo';
  hint?: string;
}> = ({ label, value, icon: Icon, tone = 'default', hint }) => {
  // Chips discrètes (teinte sur fond clair), palette chaude — accent or/vert dosé.
  const tones: Record<string, string> = {
    default: 'bg-stone-100 text-stone-500',
    primary: 'bg-primary/10 text-primary',
    gold: 'bg-gold-100 text-gold-700',
    rose: 'bg-rose-50 text-rose-500',
    teal: 'bg-teal-50 text-teal-600',
    indigo: 'bg-indigo-50 text-indigo-500',
  };
  return (
    <div className="group bg-white border border-stone-200/80 rounded-2xl shadow-card p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{label}</p>
        {Icon && (
          <div className={`shrink-0 h-9 w-9 rounded-full grid place-items-center ${tones[tone]}`}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-stone-800 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400 truncate">{hint}</p>}
    </div>
  );
};

type BadgeTone = 'slate' | 'green' | 'blue' | 'amber' | 'rose' | 'gold' | 'indigo';

export const Badge: React.FC<{ tone?: BadgeTone; children: React.ReactNode; className?: string }> = ({
  tone = 'slate',
  children,
  className = '',
}) => {
  const tones: Record<BadgeTone, string> = {
    slate: 'bg-stone-100 text-stone-600',
    green: 'bg-primary/10 text-primary',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-gold-100 text-gold-700',
    rose: 'bg-rose-50 text-rose-600',
    gold: 'bg-gold-100 text-gold-800',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

/** Bouton d'action icône discret et cohérent (édition, suppression, etc.). */
export const IconButton: React.FC<{
  onClick?: () => void;
  title?: string;
  tone?: 'slate' | 'blue' | 'rose' | 'green' | 'amber';
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, tone = 'slate', disabled, children }) => {
  const tones: Record<string, string> = {
    slate: 'text-stone-400 hover:bg-stone-100 hover:text-stone-700',
    blue: 'text-blue-600 hover:bg-blue-50',
    rose: 'text-rose-500 hover:bg-rose-50',
    green: 'text-primary hover:bg-primary/10',
    amber: 'text-gold-600 hover:bg-gold-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`inline-grid place-items-center h-8 w-8 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

/** Bouton primaire cohérent. */
export const PrimaryButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, type = 'button', children, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

/** Conteneur de table avec en-tête cohérent. `head` = <tr>…<th/>…</tr>. */
export const TableShell: React.FC<{ head: React.ReactNode; children: React.ReactNode }> = ({ head, children }) => (
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr className="[&>th]:px-4 [&>th]:py-3.5 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.12em] [&>th]:text-stone-500">
            {head}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
    </div>
  </Card>
);

export const EmptyRow: React.FC<{ colSpan: number; children?: React.ReactNode }> = ({ colSpan, children }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-16 text-stone-400 text-sm">
      {children || 'Aucun élément'}
    </td>
  </tr>
);

/** Statut de message de contact → badge. */
export function contactStatusTone(status: string): BadgeTone {
  return status === 'new' ? 'blue' : status === 'archived' ? 'amber' : 'slate';
}

/** Modale cohérente (header sticky, footer d'actions optionnel). */
export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ title, onClose, footer, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-2xl ring-1 ring-stone-900/5 w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <h2 className="font-display text-xl font-semibold text-stone-800">{title}</h2>
        <IconButton onClick={onClose} title="Fermer"><XMarkIcon className="h-5 w-5" /></IconButton>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
      {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/60 rounded-b-2xl">{footer}</div>}
    </div>
  </div>
);

/** Champ de formulaire labellisé + input/textarea/select cohérents. */
const fieldInputCls =
  'w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

export const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-stone-600 mb-1.5">
      {label}{required && <span className="text-rose-500"> *</span>}
    </label>
    {children}
  </div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={fieldInputCls} />
);
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={fieldInputCls} />
);
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select {...props} className={`${fieldInputCls} cursor-pointer`}>{children}</select>
);

/** Bouton secondaire (annuler, etc.). */
export const SecondaryButton: React.FC<{ onClick?: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 text-sm text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors duration-150 cursor-pointer disabled:opacity-50"
  >
    {children}
  </button>
);

/** Rendu booléen « publié / actif » cohérent. */
export const BoolPill: React.FC<{ value: boolean; yes?: string; no?: string }> = ({ value, yes = 'Oui', no = 'Non' }) =>
  value ? (
    <Badge tone="green"><CheckCircleIcon className="h-3.5 w-3.5" /> {yes}</Badge>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-stone-400"><MinusCircleIcon className="h-3.5 w-3.5" /> {no}</span>
  );

