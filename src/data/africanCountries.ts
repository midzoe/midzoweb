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

/**
 * Code ISO des pays manipulés par les parcours (noms anglais en base) : sert à afficher
 * le nom du pays dans la langue du site via `Intl.DisplayNames`.
 */
const ISO: Record<string, string> = {
  'South Africa': 'ZA', Algeria: 'DZ', Angola: 'AO', Benin: 'BJ', Botswana: 'BW', 'Burkina Faso': 'BF', Burundi: 'BI',
  Cameroon: 'CM', 'Cape Verde': 'CV', 'Central African Republic': 'CF', Comoros: 'KM', 'Republic of the Congo': 'CG',
  'DR Congo': 'CD', "Côte d'Ivoire": 'CI', Djibouti: 'DJ', Egypt: 'EG', Eritrea: 'ER', Eswatini: 'SZ', Ethiopia: 'ET',
  Gabon: 'GA', Gambia: 'GM', Ghana: 'GH', Guinea: 'GN', 'Guinea-Bissau': 'GW', 'Equatorial Guinea': 'GQ', Kenya: 'KE',
  Lesotho: 'LS', Liberia: 'LR', Libya: 'LY', Madagascar: 'MG', Malawi: 'MW', Mali: 'ML', Morocco: 'MA', Mauritius: 'MU',
  Mauritania: 'MR', Mozambique: 'MZ', Namibia: 'NA', Niger: 'NE', Nigeria: 'NG', Uganda: 'UG', Rwanda: 'RW',
  'São Tomé and Príncipe': 'ST', Senegal: 'SN', Seychelles: 'SC', 'Sierra Leone': 'SL', Somalia: 'SO', Sudan: 'SD',
  'South Sudan': 'SS', Tanzania: 'TZ', Chad: 'TD', Togo: 'TG', Tunisia: 'TN', Zambia: 'ZM', Zimbabwe: 'ZW',
  Germany: 'DE', Belgium: 'BE', Canada: 'CA', China: 'CN', Spain: 'ES', 'United States': 'US', France: 'FR', Italy: 'IT',
  Luxembourg: 'LU', Netherlands: 'NL', Portugal: 'PT', 'United Kingdom': 'GB', Sweden: 'SE', Switzerland: 'CH',
  Austria: 'AT', Ireland: 'IE', Poland: 'PL', Czechia: 'CZ', 'Czech Republic': 'CZ', Hungary: 'HU', Finland: 'FI',
  Denmark: 'DK', Norway: 'NO', Turkey: 'TR', Japan: 'JP', 'South Korea': 'KR', Australia: 'AU', Malta: 'MT',
  Afghanistan: 'AF', Albania: 'AL', Argentina: 'AR', Armenia: 'AM', Azerbaijan: 'AZ', Bahrain: 'BH', Bangladesh: 'BD',
  Belarus: 'BY', Bolivia: 'BO', Bosnia: 'BA', Brazil: 'BR', Bulgaria: 'BG', Cambodia: 'KH', Chile: 'CL', Colombia: 'CO',
  Congo: 'CG', 'Costa Rica': 'CR', Croatia: 'HR', Cuba: 'CU', 'Dominican Republic': 'DO', Ecuador: 'EC', 'El Salvador': 'SV',
  Georgia: 'GE', Greece: 'GR', Guatemala: 'GT', Haiti: 'HT', Honduras: 'HN', Iceland: 'IS', India: 'IN', Indonesia: 'ID',
  Iran: 'IR', Iraq: 'IQ', Israel: 'IL', Jamaica: 'JM', Jordan: 'JO', Kazakhstan: 'KZ', Kosovo: 'XK', Kuwait: 'KW', Laos: 'LA',
  Latvia: 'LV', Lebanon: 'LB', Lithuania: 'LT', Malaysia: 'MY', Mexico: 'MX', Moldova: 'MD', Mongolia: 'MN', Myanmar: 'MM',
  Nepal: 'NP', 'New Zealand': 'NZ', Nicaragua: 'NI', 'North Korea': 'KP', Oman: 'OM', Pakistan: 'PK', Palestine: 'PS',
  Panama: 'PA', Paraguay: 'PY', Peru: 'PE', Philippines: 'PH', Qatar: 'QA', Romania: 'RO', Russia: 'RU', 'Saudi Arabia': 'SA',
  Serbia: 'RS', Singapore: 'SG', Slovakia: 'SK', Slovenia: 'SI', 'Sri Lanka': 'LK', Syria: 'SY', Taiwan: 'TW', Thailand: 'TH',
  Ukraine: 'UA', 'United Arab Emirates': 'AE', Uruguay: 'UY', Uzbekistan: 'UZ', Venezuela: 'VE', Vietnam: 'VN', Yemen: 'YE',
  'Ivory Coast': 'CI', Estonia: 'EE', Cyprus: 'CY',
};

/** Nom d'un pays (nom anglais en base) dans la langue demandée ; `fallback` sinon. */
export function countryName(value: string, lang: string, fallback?: string): string {
  const code = ISO[value];
  if (code) {
    try {
      const name = new Intl.DisplayNames([lang], { type: 'region' }).of(code);
      if (name && name !== code) return name;
    } catch { /* navigateur sans Intl.DisplayNames */ }
  }
  return fallback ?? value;
}
