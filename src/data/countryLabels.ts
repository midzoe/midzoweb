/**
 * Noms de pays traduits pour l'affichage. La base et l'API utilisent des noms anglais
 * (« Germany », « Ivory Coast ») : on les relie à un code ISO puis on laisse le navigateur
 * (Intl.DisplayNames) donner le nom dans la langue du site. La valeur envoyée à l'API ne change pas.
 */
const ALIASES: Record<string, string> = {
  'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI', 'DR Congo': 'CD', 'Congo': 'CG', 'Dubai': 'AE', 'UAE': 'AE',
  'Czech Republic': 'CZ', 'Bosnia': 'BA', 'Palestine': 'PS', 'North Korea': 'KP', 'South Korea': 'KR',
  'Cape Verde': 'CV', 'Eswatini': 'SZ', 'Swaziland': 'SZ', 'Macedonia': 'MK', 'Burma': 'MM', 'Myanmar': 'MM',
  'Russia': 'RU', 'Syria': 'SY', 'Laos': 'LA', 'Vietnam': 'VN', 'Iran': 'IR', 'Bolivia': 'BO', 'Venezuela': 'VE',
  'Tanzania': 'TZ', 'Moldova': 'MD', 'USA': 'US', 'United States': 'US', 'UK': 'GB', 'United Kingdom': 'GB',
};

let byEnglishName: Map<string, string> | null = null;

function codeOf(name: string): string | null {
  if (ALIASES[name]) return ALIASES[name];
  if (!byEnglishName) {
    byEnglishName = new Map();
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      const A = 65;
      for (let i = 0; i < 26; i++) {
        for (let j = 0; j < 26; j++) {
          const code = String.fromCharCode(A + i) + String.fromCharCode(A + j);
          const label = dn.of(code);
          if (label && label !== code) byEnglishName.set(label.toLowerCase(), code);
        }
      }
    } catch { /* navigateur sans Intl.DisplayNames : noms anglais conservés */ }
  }
  return byEnglishName.get(name.toLowerCase()) ?? null;
}

const cache = new Map<string, Intl.DisplayNames | null>();

/** « Germany » → « Allemagne » (fr) / « Deutschland » (de) ; inchangé si inconnu. */
export function countryLabel(name: string, lang: string): string {
  if (!name) return name;
  const code = codeOf(name);
  if (!code) return name;
  const l = lang.slice(0, 2);
  if (!cache.has(l)) {
    try { cache.set(l, new Intl.DisplayNames([l], { type: 'region' })); } catch { cache.set(l, null); }
  }
  return cache.get(l)?.of(code) ?? name;
}

/** Liste triée selon le nom affiché, valeur d'origine conservée. */
export function localizedCountryOptions(names: string[], lang: string): { value: string; label: string }[] {
  return names
    .map(n => ({ value: n, label: countryLabel(n, lang) }))
    .sort((a, b) => a.label.localeCompare(b.label, lang));
}
