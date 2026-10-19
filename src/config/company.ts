/**
 * Identité légale de Midzo — UN SEUL ENDROIT à compléter (ou variables VITE_COMPANY_* sur Vercel).
 * Tant qu'une valeur est vide, les pages légales l'affichent surlignée « à compléter » :
 * aucune donnée inventée n'est publiée.
 */
const env = (key: string) => ((import.meta.env as Record<string, string | undefined>)[key] ?? '').trim();

export const COMPANY = {
  legalName: env('VITE_COMPANY_LEGAL_NAME'),            // ex. « Midzo SAS » / « Midzo UG (haftungsbeschränkt) »
  legalForm: env('VITE_COMPANY_LEGAL_FORM'),            // forme juridique et capital
  address: env('VITE_COMPANY_ADDRESS'),                 // adresse du siège
  registration: env('VITE_COMPANY_REGISTRATION'),       // RCS / Handelsregister + numéro
  vat: env('VITE_COMPANY_VAT'),                         // numéro de TVA intracommunautaire
  director: env('VITE_COMPANY_DIRECTOR'),               // directeur de la publication / gérant
  email: env('VITE_COMPANY_EMAIL'),                     // email de contact
  phone: env('VITE_COMPANY_PHONE'),
  travelLicence: env('VITE_COMPANY_TRAVEL_LICENCE'),    // immatriculation agence de voyages (ex. Atout France IM…)
  financialGuarantor: env('VITE_COMPANY_GUARANTOR'),    // garant financier (insolvabilité, directive 2015/2302)
  insurer: env('VITE_COMPANY_INSURER'),                 // assureur responsabilité civile professionnelle
  mediator: env('VITE_COMPANY_MEDIATOR'),               // médiateur de la consommation
  law: env('VITE_COMPANY_LAW'),                         // droit applicable (pays du siège)
  /** Part remboursée du service « Visa » en cas de refus de visa (politique de remboursement). */
  visaRefusalRefundPct: Number(env('VITE_VISA_REFUSAL_REFUND_PCT') || 50),
};

export type CompanyKey = keyof typeof COMPANY;
