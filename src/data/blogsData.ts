export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  image: string;
  excerpt: string;
  body: string;
  published_at: string;
  is_published: boolean;
}

export const blogsData: BlogItem[] = [
  {
    id: 1,
    title: "Comment obtenir une bourse pour étudier en France en 2026",
    slug: "bourse-etudier-france-2026",
    category: "Études",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800",
    excerpt: "Tout ce que vous devez savoir sur les bourses Eiffel, Campus France et AFD pour financer vos études en France.",
    body: "Étudier en France est le rêve de millions d'étudiants africains. Chaque année, plusieurs programmes de bourses permettent de financer entièrement ou partiellement ce projet.\n\n## La Bourse Eiffel\nLa bourse d'excellence Eiffel est attribuée par Campus France aux étudiants internationaux en Master ou Doctorat.\n\n## Campus France\nLe programme Campus France accompagne les étudiants dans leur démarche de candidature auprès des universités françaises.\n\n## Nos conseils\n1. Commencez vos démarches 12 mois à l'avance\n2. Préparez un dossier solide avec lettre de motivation en français\n3. Contactez directement les universités pour les bourses internes",
    published_at: "2026-01-10",
    is_published: true
  },
  {
    id: 2,
    title: "Top 5 des destinations touristiques africaines sous-estimées",
    slug: "top-5-destinations-africaines-sous-estimees",
    category: "Tourisme",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    excerpt: "Le Rwanda, le Botswana, la Namibie, le Lesotho et São Tomé méritent d'être sur votre liste de voyages.",
    body: "L'Afrique regorge de destinations magnifiques qui restent méconnues du grand public.\n\n## 1. Le Rwanda\nKigali est aujourd'hui l'une des villes les plus propres et sécurisées d'Afrique.\n\n## 2. Le Botswana\nLe delta de l'Okavango est classé au patrimoine mondial de l'UNESCO.\n\n## 3. La Namibie\nLe désert du Namib offre des paysages lunaires à couper le souffle.",
    published_at: "2026-01-20",
    is_published: true
  },
  {
    id: 3,
    title: "Étudier en Allemagne gratuitement : le guide complet",
    slug: "etudier-allemagne-gratuitement-guide",
    category: "Études",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
    excerpt: "Les universités publiques allemandes sont quasi gratuites pour tous. Voici comment en profiter.",
    body: "L'Allemagne est l'une des rares destinations où l'enseignement supérieur est accessible à des frais minimes.\n\n## Combien ça coûte vraiment ?\nLes frais de scolarité dans les universités publiques sont de 0€ dans la plupart des Länder.\n\n## Les conditions d'admission\n- Baccalauréat avec de bons résultats\n- Niveau B2 en allemand (TestDaF 4) OU étudier en anglais\n- Ouvrir un blocked account de 11 208€\n\n## La bourse DAAD\nLe DAAD propose des bourses couvrant les frais de vie.",
    published_at: "2026-02-05",
    is_published: true
  },
  {
    id: 4,
    title: "Visa Schengen depuis l'Afrique : nos astuces pour maximiser vos chances",
    slug: "visa-schengen-afrique-astuces",
    category: "Visa",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
    excerpt: "Le visa Schengen est obtenu à plus de 80% quand le dossier est bien préparé.",
    body: "Le visa Schengen permet de visiter 27 pays européens avec un seul visa.\n\n## Les documents indispensables\n1. Passeport valide 6 mois après le retour\n2. Réservation d'hôtel\n3. Billet d'avion aller-retour\n4. Assurance voyage (min. 30 000€)\n5. Relevés bancaires des 3 derniers mois\n\n## Les erreurs à éviter\n- Ne jamais mentir sur vos revenus\n- Toujours avoir un lien avec votre pays d'origine",
    published_at: "2026-02-15",
    is_published: true
  },
  {
    id: 5,
    title: "Dubai en 7 jours : l'itinéraire parfait",
    slug: "dubai-7-jours-itineraire",
    category: "Tourisme",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    excerpt: "Comment profiter de Dubai en une semaine avec un budget maîtrisé.",
    body: "Dubai est la destination numéro 1 des voyageurs africains vers le Moyen-Orient.\n\n## Jour 1-2 : Old Dubai\nAl Fahidi, les souks de l'or et des épices.\n\n## Jour 3-4 : Le Dubai Moderne\nBurj Khalifa, Dubai Mall, Dubai Fountain.\n\n## Jour 5 : Safari dans le désert\nSable roux, coucher de soleil, dîner bédouin.",
    published_at: "2026-03-01",
    is_published: true
  },
  {
    id: 6,
    title: "Témoignage : mon expérience d'étudiant africain au Canada",
    slug: "temoignage-etudiant-africain-canada",
    category: "Témoignage",
    author: "Kofi Mensah (Ghana)",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    excerpt: "J'ai quitté Accra pour Montréal en 2023. Voici ce que personne ne vous dit.",
    body: "Quand j'ai reçu ma lettre d'admission de l'Université de Montréal, j'avais l'impression que la vie allait changer.\n\n## Les bonnes surprises\nLe bilinguisme est un atout énorme. J'ai trouvé un stage 3 mois après mon arrivée.\n\n## Les défis cachés\nL'hiver montréalais est brutal. -30°C en janvier.\n\n## Mes conseils\n1. Arrivez 2 semaines avant les cours\n2. Rejoignez les associations africaines\n3. Travaillez à temps partiel (max 20h/semaine)",
    published_at: "2026-03-10",
    is_published: true
  },
  {
    id: 7,
    title: "Comment économiser sur son billet d'avion depuis l'Afrique",
    slug: "economiser-billet-avion-afrique",
    category: "Conseils",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
    excerpt: "Réserver 3 mois à l'avance et utiliser les bons outils peut diviser votre budget vol par deux.",
    body: "Le billet d'avion représente souvent la plus grande dépense d'un voyage.\n\n## Quand réserver ?\nLe sweet spot est entre 6 et 10 semaines avant le départ.\n\n## Les meilleurs outils\n- Google Flights (alertes de prix)\n- Skyscanner (comparaison)\n- Kayak (flexibilité de dates)\n\n## Les hubs africains les moins chers\n- Casablanca → Europe\n- Addis-Abeba → monde entier\n- Nairobi → Asie et Amériques",
    published_at: "2026-03-20",
    is_published: true
  },
  {
    id: 8,
    title: "Les 10 erreurs à éviter quand on postule dans une université étrangère",
    slug: "erreurs-candidature-universite-etrangere",
    category: "Études",
    author: "Équipe Midzoe",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800",
    excerpt: "Un dossier mal préparé peut ruiner des années de travail. Voici les pièges à éviter.",
    body: "Chaque année, des milliers de candidatures excellentes sont rejetées à cause d'erreurs évitables.\n\n## Erreur 1 : Même lettre de motivation partout\nChaque université veut se sentir unique.\n\n## Erreur 2 : Attendre la dernière minute\nLes meilleures places se remplissent dès octobre.\n\n## Erreur 3 : Négliger la traduction officielle\nVos documents doivent être traduits par un traducteur assermenté.\n\n## Erreur 4 : Oublier le plan B\nCandidatez dans au moins 5 établissements.",
    published_at: "2026-04-01",
    is_published: true
  }
];
