/**
 * Les 54 pays d'Afrique, en français, triés alphabétiquement.
 *
 * C'est la liste des pays d'ORIGINE d'une fiche visa : Midzo accompagne des personnes
 * qui partent d'Afrique. Le `value` est le nom anglais, car c'est sous cette forme que
 * les pays sont enregistrés en base (`countries.name`, `study_countries.name`) ; le
 * `label` est le nom français affiché à l'admin et sur le site.
 */
export interface CountryOption {
  value: string;
  label: string;
}

export const AFRICAN_COUNTRIES: CountryOption[] = [
  { value: 'South Africa', label: 'Afrique du Sud' },
  { value: 'Algeria', label: 'Algérie' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Benin', label: 'Bénin' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Cameroon', label: 'Cameroun' },
  { value: 'Cape Verde', label: 'Cap-Vert' },
  { value: 'Central African Republic', label: 'Centrafrique' },
  { value: 'Comoros', label: 'Comores' },
  { value: 'Republic of the Congo', label: 'Congo-Brazzaville' },
  { value: 'DR Congo', label: 'RD Congo' },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: 'Djibouti', label: 'Djibouti' },
  { value: 'Egypt', label: 'Égypte' },
  { value: 'Eritrea', label: 'Érythrée' },
  { value: 'Eswatini', label: 'Eswatini' },
  { value: 'Ethiopia', label: 'Éthiopie' },
  { value: 'Gabon', label: 'Gabon' },
  { value: 'Gambia', label: 'Gambie' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Guinea', label: 'Guinée' },
  { value: 'Guinea-Bissau', label: 'Guinée-Bissau' },
  { value: 'Equatorial Guinea', label: 'Guinée équatoriale' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Lesotho', label: 'Lesotho' },
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Libya', label: 'Libye' },
  { value: 'Madagascar', label: 'Madagascar' },
  { value: 'Malawi', label: 'Malawi' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Morocco', label: 'Maroc' },
  { value: 'Mauritius', label: 'Maurice' },
  { value: 'Mauritania', label: 'Mauritanie' },
  { value: 'Mozambique', label: 'Mozambique' },
  { value: 'Namibia', label: 'Namibie' },
  { value: 'Niger', label: 'Niger' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Uganda', label: 'Ouganda' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'São Tomé and Príncipe', label: 'São Tomé-et-Príncipe' },
  { value: 'Senegal', label: 'Sénégal' },
  { value: 'Seychelles', label: 'Seychelles' },
  { value: 'Sierra Leone', label: 'Sierra Leone' },
  { value: 'Somalia', label: 'Somalie' },
  { value: 'Sudan', label: 'Soudan' },
  { value: 'South Sudan', label: 'Soudan du Sud' },
  { value: 'Tanzania', label: 'Tanzanie' },
  { value: 'Chad', label: 'Tchad' },
  { value: 'Togo', label: 'Togo' },
  { value: 'Tunisia', label: 'Tunisie' },
  { value: 'Zambia', label: 'Zambie' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
];

/** Nom français d'un pays d'origine, à défaut le nom reçu (fiche saisie hors liste). */
export function africanCountryLabel(value: string): string {
  return AFRICAN_COUNTRIES.find(c => c.value === value)?.label ?? value;
}

/**
 * Les 20 pays de départ réellement couverts par le module visa (miroir de `ORIGINS`
 * dans `midzobackend/src/scripts/seed-visa-rules.ts`) : Afrique de l'Ouest et Centrale
 * + grands marchés. C'est ce sous-ensemble — et non les 54 pays — qu'on propose partout
 * où l'on décrit une démarche « avant le départ » (centres de langue au pays, etc.),
 * pour ne pas ouvrir des pays sans fiche visa ni ambassade derrière.
 */
const VISA_ORIGIN_VALUES = new Set([
  'Togo', 'Benin', "Côte d'Ivoire", 'Senegal', 'Guinea', 'Mali', 'Burkina Faso',
  'Niger', 'Cameroon', 'Chad', 'Gabon', 'Republic of the Congo', 'DR Congo',
  'Nigeria', 'Ghana', 'Kenya', 'Morocco', 'Tunisia', 'Egypt', 'South Africa',
]);

/** Les pays de départ couverts par le visa, dans l'ordre alphabétique français. */
export const VISA_ORIGIN_COUNTRIES: CountryOption[] =
  AFRICAN_COUNTRIES.filter(c => VISA_ORIGIN_VALUES.has(c.value));

/** Ce pays est-il un pays de départ (par opposition à un pays de destination) ? */
export function isVisaOriginCountry(value: string): boolean {
  return VISA_ORIGIN_VALUES.has(value);
}
