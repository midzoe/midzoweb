/**
 * Classification des filières universitaires en grands secteurs (story 5.10).
 *
 * Les noms de filières sont du **texte libre multilingue** (français, anglais,
 * italien, allemand) saisi au fil des seeds : « Informatique », « Computer Science »,
 * « Ingegneria informatica », « Master en Intelligence artificielle »… Aucun champ
 * de la base ne porte le secteur ; il est donc dérivé par mots-clés.
 *
 * Cette dérivation sert **uniquement à lire le catalogue côté admin**. Aucun
 * contrat métier public ne doit en dépendre : une filière mal classée fausse une
 * statistique de pilotage, jamais une décision produit.
 *
 * L'ordre des règles compte : la première qui correspond gagne. Les secteurs les
 * plus spécifiques passent donc avant les plus génériques (« génie biomédical »
 * doit tomber en Santé, pas en Ingénierie ; « informatique » avant « sciences »).
 */

export const OTHER_SECTOR = 'Autres / non classé';

type Rule = { sector: string; keywords: string[] };

/** Comparaison sans accents ni casse : « Mathématiques » et « mathematiques » matchent. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase();
}

const SECTOR_HUMANITIES = 'Lettres, Arts & Sciences humaines';
const SECTOR_LAW = 'Droit & Sciences politiques';
const SECTOR_BASIC_SCIENCE = 'Sciences fondamentales';

const RULES: Rule[] = [
  // ── Expressions composées, placées en tête ────────────────────────────────
  // Sans elles, « Lettres et sciences humaines » et « Sciences sociales »
  // tombent en Sciences fondamentales sur le seul mot « sciences », et
  // « Biotechnologies » en Ingénierie sur « technolog ».
  { sector: SECTOR_HUMANITIES, keywords: ['sciences humaines', 'sciences sociales', 'sciences de l education', 'scienze sociali', 'social sciences'] },
  { sector: SECTOR_LAW, keywords: ['sciences politiques', 'science politique', 'political science', 'scienze politiche'] },
  { sector: SECTOR_BASIC_SCIENCE, keywords: ['biotechnolog', 'biotecnolog', 'biotechnik'] },

  {
    sector: 'Santé, Médecine & Sport',
    keywords: [
      'medecin', 'medicin', 'medicina', 'medizin', 'sante', 'health', 'pharmac',
      'biomedical', 'biomedic', 'neuroscience', 'neurologi', 'nutrition',
      'infirm', 'dentaire', 'odonto', 'kinesi', 'physique medicale', 'veterin',
      'staps', 'sport',
    ],
  },
  {
    sector: 'Informatique & Numérique',
    keywords: [
      'informatique', 'informatica', 'informatik', 'computer', 'data science',
      'intelligence artificielle', 'artificial intelligence', 'cybersecurity',
      'cybersecurite', 'information security', 'numerique', 'software', 'digital',
    ],
  },
  {
    sector: 'Ingénierie & Technologie',
    keywords: [
      'ingenieur', 'ingenierie', 'ingegneria', 'engineering', 'genie', 'technolog',
      'mecanique', 'meccanica', 'electr', 'elettr', 'aeronaut', 'aerospa',
      'nanotechnolog', 'materiaux', 'materiali', 'robot', 'automat', 'energie',
      'energetica', 'energy', 'telecom',
    ],
  },
  {
    sector: 'Environnement, Territoire & Développement durable',
    keywords: [
      'environnement', 'environmental', 'ambientale', 'durable', 'sustainab',
      'biodiversit', 'ecolog', 'renewable', 'climat', 'geologie', 'geolog',
      'urban', 'urbanis', 'urbaine', 'amenagement', 'territo',
    ],
  },
  {
    sector: SECTOR_BASIC_SCIENCE,
    keywords: [
      'physique', 'fisica', 'physics', 'physik', 'chimie', 'chimica', 'chemistry',
      'mathematique', 'mathematics', 'matematica', 'biologie', 'biological', 'biolog',
      'nanoscience', 'astronom', 'statistic', 'sciences', 'science', 'scienze',
    ],
  },
  {
    sector: SECTOR_LAW,
    keywords: [
      'droit', 'law', 'diritto', 'giurisprudenza', 'jurist', 'politique', 'political',
      'relations internationales', 'international relations', 'relazioni internazional',
      'governance', 'migration', 'public policy', 'administration publique',
      'public administration', 'amministrazione', 'etudes europeennes', 'european studies',
      'etudes europeenne',
    ],
  },
  {
    sector: 'Économie, Gestion & Commerce',
    keywords: [
      'economi', 'economics', 'gestion', 'management', 'finance', 'banking',
      'marketing', 'business', 'entrepreneur', 'commerce', 'comptab', 'aziendale',
      'innovation', 'tourism', 'turism',
    ],
  },
  {
    sector: 'Langues',
    keywords: ['langue', 'lingue', 'linguist', 'language', 'traduction', 'sprach'],
  },
  {
    sector: SECTOR_HUMANITIES,
    keywords: [
      'lettre', 'lettere', 'litterature', 'litterat', 'letterature', 'histoire',
      'history', 'storia', 'philosoph', 'filosofia', 'arts', 'art', 'musicolog',
      'archeolog', 'archaeolog', 'design', 'architect', 'architettura', 'culture',
      'culturel', 'cultural heritage', 'beni culturali', 'patrimoine',
      'journalis', 'communication', 'comunicazione', 'psycholog', 'psicolog',
      'sociolog', 'education', 'anthropolog', 'humaines',
    ],
  },
];

/**
 * Ordre d'affichage stable des secteurs, déclaré à la main : `RULES` place les
 * expressions composées en tête pour des raisons de priorité, ce qui ne donne pas
 * un ordre de lecture pertinent. Le repli reste toujours en dernier.
 */
export const SECTORS: string[] = [
  'Santé, Médecine & Sport',
  'Informatique & Numérique',
  'Ingénierie & Technologie',
  SECTOR_BASIC_SCIENCE,
  'Environnement, Territoire & Développement durable',
  SECTOR_LAW,
  'Économie, Gestion & Commerce',
  SECTOR_HUMANITIES,
  'Langues',
  OTHER_SECTOR,
];

/**
 * Secteur d'une filière. Renvoie `OTHER_SECTOR` si aucun mot-clé ne correspond —
 * un intitulé purement administratif comme « Double diplôme international » n'a
 * pas de discipline et ne doit pas être rangé de force.
 */
export function sectorOf(programName: string): string {
  const text = normalize(programName);
  for (const rule of RULES) {
    if (rule.keywords.some(k => text.includes(k))) return rule.sector;
  }
  return OTHER_SECTOR;
}

/** Secteurs distincts couverts par une université, dans l'ordre d'affichage. */
export function sectorsOfPrograms(programs: { name: string }[]): string[] {
  const found = new Set(programs.map(p => sectorOf(p.name)));
  return SECTORS.filter(s => found.has(s));
}
