/**
 * Repères de démarches par pays de destination, affichés dans le parcours Study
 * à côté des données du catalogue (`/study-countries`, universités, visas…).
 *
 * Ce ne sont que des repères généraux et des liens vers les sites officiels : les
 * fiches visa / ambassade du catalogue restent la source à privilégier dès qu'elles
 * sont publiées. Montants indicatifs, à confirmer auprès des sources citées.
 */

export interface GuideLink { label: string; url: string }

export interface CountryGuide {
  visa: GuideLink[];
  application: GuideLink[];
  recognition: GuideLink[];
  /** Frais et financement propres au pays (complète `tuitionRange` du catalogue). */
  fees: string[];
}

export const COUNTRY_GUIDES: Record<string, CountryGuide> = {
  France: {
    visa: [{ label: 'France-Visas (portail officiel des visas)', url: 'https://france-visas.gouv.fr' }],
    application: [
      { label: 'Campus France — procédure « Études en France »', url: 'https://www.campusfrance.org' },
      { label: 'Parcoursup (1re année, élèves résidant en France ou dans l’UE)', url: 'https://www.parcoursup.gouv.fr' },
    ],
    recognition: [{ label: 'ENIC-NARIC France — attestation de comparabilité', url: 'https://www.france-education-international.fr' }],
    fees: [
      'Universités publiques, étudiants hors UE : droits différenciés de 2 895 €/an en licence et 3 941 €/an en master, avec exonérations possibles selon l’établissement.',
      'Bourses : Bourses du gouvernement français (ambassade de France), programme Eiffel pour le master.',
    ],
  },
  Germany: {
    visa: [
      { label: 'Auswärtiges Amt — visas pour l’Allemagne', url: 'https://www.auswaertiges-amt.de' },
      { label: 'Consular Services Portal (demande de visa en ligne)', url: 'https://digital.diplo.de' },
    ],
    application: [
      { label: 'DAAD — base des programmes d’études', url: 'https://www.daad.de' },
      { label: 'uni-assist — candidature des diplômes étrangers', url: 'https://www.uni-assist.de' },
    ],
    recognition: [
      { label: 'anabin — reconnaissance des diplômes étrangers', url: 'https://anabin.kmk.org' },
      { label: 'Anerkennung in Deutschland — reconnaissance professionnelle', url: 'https://www.anerkennung-in-deutschland.de' },
    ],
    fees: [
      'Universités publiques : pas de frais de scolarité dans la plupart des Länder (Bade-Wurtemberg : 1 500 €/semestre hors UE) ; contribution semestrielle d’environ 100 à 400 €.',
      'Visa d’études : justificatif de ressources, en général via un compte bloqué (Sperrkonto) d’environ 992 €/mois en 2025.',
    ],
  },
  Belgium: {
    visa: [{ label: 'Office des étrangers — séjour étudiant', url: 'https://dofi.ibz.be' }],
    application: [{ label: 'Study in Belgium — candidater dans un établissement', url: 'https://www.studyinbelgium.be' }],
    recognition: [{ label: 'Équivalences — Fédération Wallonie-Bruxelles', url: 'https://www.equivalences.cfwb.be' }],
    fees: [
      'Master : l’admission se décide établissement par établissement (valorisation du bachelor ou de la licence) ; certaines formations exigent une équivalence officielle.',
    ],
  },
  Luxembourg: {
    visa: [{ label: 'Guichet.lu — séjour des étudiants ressortissants de pays tiers', url: 'https://guichet.public.lu' }],
    application: [{ label: 'Université du Luxembourg — candidatures', url: 'https://www.uni.lu' }],
    recognition: [{ label: 'Ministère de l’Enseignement supérieur et de la Recherche', url: 'https://mesr.gouvernement.lu' }],
    fees: ['Université du Luxembourg : frais d’inscription modérés, fixés par semestre (voir le site de l’université).'],
  },
};

/** Repères propres à un niveau d'études dans un pays donné. */
export interface LevelGuide { title: string; points: string[]; links: GuideLink[] }

export function levelGuide(destination: string, level: string): LevelGuide | null {
  if (level === 'medicine_first_year' && destination === 'France') {
    return {
      title: 'Médecine en France : PASS ou LAS',
      points: [
        'La 1re année se fait en PASS (Parcours d’accès spécifique santé) ou en LAS (licence avec option « accès santé ») ; elle ouvre l’accès sélectif à médecine, pharmacie, odontologie, maïeutique et kinésithérapie.',
        'Hors UE, la candidature en 1re année de licence passe par la demande d’admission préalable (DAP), via la procédure « Études en France » de Campus France dans les pays concernés.',
        'Les places en 2e année sont limitées : prévoir un plan B (poursuite de la LAS dans sa discipline).',
      ],
      links: [{ label: 'Campus France — Études en France', url: 'https://www.campusfrance.org' }],
    };
  }
  if (level === 'vocational' && destination === 'Germany') {
    return {
      title: 'Ausbildung en Allemagne',
      points: [
        'Formation en alternance de 2 à 3 ans et demi (3 ans pour les soins infirmiers : Pflegefachfrau / Pflegefachmann), avec un contrat signé avec un employeur ou une école de soins.',
        'Allemand : B1 est en général exigé pour le visa de formation ; B2 est souvent demandé par les établissements de soins.',
        'Rémunération : versée dès la 1re année. Dans les soins, les barèmes conventionnels publics (TVAöD-Pflege) donnent environ 1 300 à 1 600 € brut par mois selon l’année de formation.',
        'Documents usuels : contrat d’Ausbildung, diplôme et relevés de notes traduits, reconnaissance du diplôme scolaire, certificat de langue, CV, preuve de ressources si la rémunération ne suffit pas.',
        'Rentrées fréquentes en avril, août, septembre ou octobre : candidater 6 à 12 mois à l’avance.',
      ],
      links: [
        { label: 'Make it in Germany — formation professionnelle', url: 'https://www.make-it-in-germany.com' },
        { label: 'Bundesagentur für Arbeit — offres d’Ausbildung', url: 'https://www.arbeitsagentur.de' },
        { label: 'Anerkennung in Deutschland — reconnaissance', url: 'https://www.anerkennung-in-deutschland.de' },
      ],
    };
  }
  if (level === 'vocational') {
    return {
      title: 'Formation professionnelle',
      points: [
        'Le catalogue MIDZO ne référence pas encore de formations professionnelles pour ce pays. Enregistrez votre projet : un conseiller vous orientera.',
      ],
      links: [],
    };
  }
  return null;
}
