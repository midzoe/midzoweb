import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Orientation = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';

  const labels = {
    en: {
      title: 'Orientation',
      subtitle: 'Before you travel, study, or work abroad — get the right guidance. Midzoe\'s orientation service helps you make informed decisions about your international project.',
      paths: [
        {
          id: 'school',
          icon: '🏫',
          title: 'School Orientation',
          description: 'Not sure which school, country, or program to choose? Our advisors assess your profile, goals, and budget to recommend the best educational path for you.',
          steps: [
            'Profile assessment (academic background, goals, budget)',
            'Country & school recommendation',
            'Program selection & eligibility check',
            'Application timeline & checklist',
            'Visa, accommodation & pre-departure briefing',
            'Premium: in-person or virtual session with a specialist'
          ],
          cta: 'Start School Orientation',
          link: '/contact'
        },
        {
          id: 'career',
          icon: '💼',
          title: 'Career Orientation',
          description: 'Looking to work abroad or pivot your career internationally? We assess your skills, map out international job markets, and guide you toward the right opportunities.',
          steps: [
            'Skills & experience assessment',
            'International job market mapping',
            'CV & LinkedIn international formatting',
            'Target country & sector recommendation',
            'Work visa guidance',
            'Introduction to relevant professional networks'
          ],
          cta: 'Start Career Orientation',
          link: '/contact'
        },
        {
          id: 'training',
          icon: '📚',
          title: 'Training Orientation',
          description: 'Looking for a professional training program abroad? We help you find the right course, certification, or vocational training that matches your career goals.',
          steps: [
            'Training needs assessment',
            'International training program search',
            'Certification & accreditation verification',
            'Country & institution recommendation',
            'Visa & accommodation support',
            'Premium: dedicated advisor for full program setup'
          ],
          cta: 'Start Training Orientation',
          link: '/contact'
        }
      ],
      premium_title: 'Premium Orientation — Corporate & Training Centers',
      premium_desc: 'For companies sending teams abroad for training, conferences, or work assignments — Midzoe handles the complete orientation: visa, accommodation location, local logistics, and on-ground support.',
      premium_cta: 'Request Corporate Orientation',
      process_title: 'Our Process',
      step1: 'Initial Consultation',
      step1_desc: 'Free 30-minute call to understand your situation and goals.',
      step2: 'Personalized Report',
      step2_desc: 'We produce a detailed orientation report with recommendations and action plan.',
      step3: 'Implementation Support',
      step3_desc: 'We stay with you throughout the process — visa, bookings, paperwork.'
    },
    fr: {
      title: 'Orientation',
      subtitle: 'Avant de voyager, étudier ou travailler à l\'étranger — obtenez les bons conseils. Le service d\'orientation Midzoe vous aide à prendre des décisions éclairées sur votre projet international.',
      paths: [
        {
          id: 'school',
          icon: '🏫',
          title: 'Orientation École',
          description: 'Pas sûr de l\'école, du pays ou du programme à choisir? Nos conseillers évaluent votre profil, vos objectifs et votre budget pour recommander le meilleur établissement scolaire.',
          steps: [
            'Évaluation du profil (parcours académique, objectifs, budget)',
            'Recommandation pays & école',
            'Sélection du programme & vérification d\'éligibilité',
            'Calendrier & liste de contrôle candidature',
            'Visa, logement & briefing pré-départ',
            'Premium : session en personne ou virtuelle avec un spécialiste'
          ],
          cta: 'Démarrer l\'Orientation École',
          link: '/contact'
        },
        {
          id: 'career',
          icon: '💼',
          title: 'Orientation Carrière',
          description: 'Vous souhaitez travailler à l\'étranger ou réorienter votre carrière? Nous évaluons vos compétences, cartographions les marchés internationaux et vous guidons vers les bonnes opportunités.',
          steps: [
            'Évaluation des compétences & de l\'expérience',
            'Cartographie du marché du travail international',
            'Formatage CV & LinkedIn à l\'international',
            'Recommandation pays & secteur cible',
            'Conseils visa de travail',
            'Introduction aux réseaux professionnels pertinents'
          ],
          cta: 'Démarrer l\'Orientation Carrière',
          link: '/contact'
        },
        {
          id: 'training',
          icon: '📚',
          title: 'Orientation Formation',
          description: 'Vous cherchez une formation professionnelle à l\'étranger? Nous vous aidons à trouver le bon programme, certification ou formation technique qui correspond à vos objectifs de carrière.',
          steps: [
            'Évaluation de vos besoins en formation',
            'Recherche de programmes de formation internationaux',
            'Vérification des certifications & accréditations',
            'Recommandation pays & institution',
            'Accompagnement visa & logement',
            'Premium : conseiller dédié pour la mise en place complète'
          ],
          cta: 'Démarrer l\'Orientation Formation',
          link: '/contact'
        }
      ],
      premium_title: 'Orientation Premium — Entreprises & Centres de Formation',
      premium_desc: 'Pour les entreprises envoyant des équipes à l\'étranger pour des formations, conférences ou missions — Midzoe gère l\'orientation complète : visa, localisation hébergement, logistique locale et support terrain.',
      premium_cta: 'Demander l\'Orientation Corporate',
      process_title: 'Notre Processus',
      step1: 'Consultation Initiale',
      step1_desc: 'Appel gratuit de 30 minutes pour comprendre votre situation et vos objectifs.',
      step2: 'Rapport Personnalisé',
      step2_desc: 'Nous produisons un rapport d\'orientation détaillé avec recommandations et plan d\'action.',
      step3: 'Support à l\'Implémentation',
      step3_desc: 'Nous restons avec vous tout au long du processus — visa, réservations, paperasse.'
    },
    de: {
      title: 'Orientierung',
      subtitle: 'Bevor Sie ins Ausland reisen, studieren oder arbeiten — holen Sie sich die richtige Beratung. Midzoes Orientierungsservice hilft Ihnen, fundierte Entscheidungen über Ihr internationales Projekt zu treffen.',
      paths: [
        {
          id: 'school',
          icon: '🏫',
          title: 'Schul-Orientierung',
          description: 'Nicht sicher, welche Schule, welches Land oder Programm Sie wählen sollen? Unsere Berater bewerten Ihr Profil und empfehlen die beste Bildungseinrichtung.',
          steps: [
            'Profilbewertung (akademischer Hintergrund, Ziele, Budget)',
            'Land & Schulempfehlung',
            'Programmauswahl & Eignungsprüfung',
            'Bewerbungszeitplan & Checkliste',
            'Visum, Unterkunft & Vor-Reise-Briefing',
            'Premium: Persönliche oder virtuelle Sitzung mit einem Spezialisten'
          ],
          cta: 'Schul-Orientierung Starten',
          link: '/contact'
        },
        {
          id: 'career',
          icon: '💼',
          title: 'Karriere-Orientierung',
          description: 'Möchten Sie im Ausland arbeiten oder Ihre Karriere international neu ausrichten? Wir bewerten Ihre Fähigkeiten und führen Sie zu den richtigen Möglichkeiten.',
          steps: [
            'Fähigkeiten- & Erfahrungsbewertung',
            'Internationales Arbeitsmarkt-Mapping',
            'Internationales CV & LinkedIn-Format',
            'Zielland & Sektorempfehlung',
            'Arbeitsvisum-Beratung',
            'Einführung in relevante berufliche Netzwerke'
          ],
          cta: 'Karriere-Orientierung Starten',
          link: '/contact'
        },
        {
          id: 'training',
          icon: '📚',
          title: 'Ausbildungs-Orientierung',
          description: 'Suchen Sie eine Berufsausbildung im Ausland? Wir helfen Ihnen, das richtige Programm, die richtige Zertifizierung oder Berufsausbildung für Ihre Karriereziele zu finden.',
          steps: [
            'Bewertung Ihres Ausbildungsbedarfs',
            'Internationale Ausbildungsprogramm-Suche',
            'Überprüfung von Zertifikaten & Akkreditierungen',
            'Land & Institutionsempfehlung',
            'Visum & Unterkunft-Support',
            'Premium: Dedizierter Berater für vollständige Programmeinrichtung'
          ],
          cta: 'Ausbildungs-Orientierung Starten',
          link: '/contact'
        }
      ],
      premium_title: 'Premium Orientierung — Unternehmen & Schulungszentren',
      premium_desc: 'Für Unternehmen, die Teams ins Ausland für Schulungen, Konferenzen oder Arbeitseinsätze entsenden — Midzoe übernimmt die vollständige Orientierung: Visum, Unterkunftsstandort, lokale Logistik und Vor-Ort-Support.',
      premium_cta: 'Corporate Orientierung Anfragen',
      process_title: 'Unser Prozess',
      step1: 'Erstgespräch',
      step1_desc: 'Kostenloses 30-Minuten-Gespräch, um Ihre Situation und Ziele zu verstehen.',
      step2: 'Personalisierter Bericht',
      step2_desc: 'Wir erstellen einen detaillierten Orientierungsbericht mit Empfehlungen und Aktionsplan.',
      step3: 'Implementierungs-Support',
      step3_desc: 'Wir begleiten Sie durch den gesamten Prozess — Visum, Buchungen, Papierkram.'
    }
  };

  const t = labels[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Midzoe
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-4">{t.title}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      {/* Process */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-primary text-center mb-10">{t.process_title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: t.step1, desc: t.step1_desc },
              { num: '02', title: t.step2, desc: t.step2_desc },
              { num: '03', title: t.step3, desc: t.step3_desc }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orientation Paths */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {t.paths.map((path) => (
            <div key={path.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-primary p-6">
                <span className="text-4xl">{path.icon}</span>
                <h2 className="text-xl font-bold text-white mt-3">{path.title}</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{path.description}</p>
                <ul className="space-y-2 mb-6">
                  {path.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-secondary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {step}
                    </li>
                  ))}
                </ul>
                <Link
                  to={path.link}
                  className="block text-center py-3 bg-secondary hover:bg-primary text-white rounded-full font-semibold text-sm transition-colors duration-300"
                >
                  {path.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Corporate */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-10 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">Premium</span>
            <h2 className="text-2xl font-bold mb-4">{t.premium_title}</h2>
            <p className="text-white/80 mb-8 leading-relaxed">{t.premium_desc}</p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-white text-primary hover:bg-secondary hover:text-white rounded-full font-bold transition-colors duration-300"
            >
              {t.premium_cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orientation;
