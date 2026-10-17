import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useCategories, catalogText, catalogList } from '../../hooks/useCategories';
import { apiService } from '../../services/api';

/**
 * Parcours d'orientation — alimenté par la base.
 *
 * Cette page servait auparavant trois routes distinctes
 * (`/services/orientation-study|career|training`) avec un contenu identique
 * codé en dur en trois langues, alors que les trois services existent en base
 * avec leur libellé, leur description, leur image et leurs étapes.
 *
 * Désormais : les parcours viennent du catalogue (catégorie « orientation »),
 * la route choisit lequel est mis en avant, et les ressources listées en bas
 * viennent des `OrientationResource` saisies en admin. Seul l'habillage
 * éditorial (processus, offre entreprise) reste traduit ici.
 */

const Orientation = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const location = useLocation();
  const { categories, serviceDetails, loading } = useCategories();
  const [resources, setResources] = useState<any[]>([]);

  // Habillage éditorial : ni catalogue ni données, uniquement de la copie traduite.
  const labels = {
    en: {
      title: 'Orientation',
      subtitle: 'Before you travel, study, or work abroad — get the right guidance. Midzoe\'s orientation service helps you make informed decisions about your international project.',
      cta: 'Start',
      premium_title: 'Premium Orientation — Corporate & Training Centers',
      premium_desc: 'For companies sending teams abroad for training, conferences, or work assignments — Midzoe handles the complete orientation: visa, accommodation location, local logistics, and on-ground support.',
      premium_cta: 'Request Corporate Orientation',
      process_title: 'Our Process',
      step1: 'Initial Consultation',
      step1_desc: 'Free 30-minute call to understand your situation and goals.',
      step2: 'Personalized Report',
      step2_desc: 'We produce a detailed orientation report with recommendations and action plan.',
      step3: 'Implementation Support',
      step3_desc: 'We stay with you throughout the process — visa, bookings, paperwork.',
      resources_title: 'Orientation Resources',
      resources_desc: 'Official guides, reference books, training providers and certifications — curated by our advisors and free to browse.',
      resources_cta: 'Browse resources',
      other_paths: 'Other orientation paths',
      empty: 'No orientation path is published yet.',
    },
    fr: {
      title: 'Orientation',
      subtitle: 'Avant de voyager, étudier ou travailler à l\'étranger — obtenez les bons conseils. Le service d\'orientation Midzoe vous aide à prendre des décisions éclairées sur votre projet international.',
      cta: 'Démarrer',
      premium_title: 'Orientation Premium — Entreprises & Centres de Formation',
      premium_desc: 'Pour les entreprises envoyant des équipes à l\'étranger pour des formations, conférences ou missions — Midzoe gère l\'orientation complète : visa, localisation hébergement, logistique locale et support terrain.',
      premium_cta: 'Demander l\'Orientation Corporate',
      process_title: 'Notre Processus',
      step1: 'Consultation Initiale',
      step1_desc: 'Appel gratuit de 30 minutes pour comprendre votre situation et vos objectifs.',
      step2: 'Rapport Personnalisé',
      step2_desc: 'Nous produisons un rapport d\'orientation détaillé avec recommandations et plan d\'action.',
      step3: 'Support à l\'Implémentation',
      step3_desc: 'Nous restons avec vous tout au long du processus — visa, réservations, paperasse.',
      resources_title: 'Ressources d\'orientation',
      resources_desc: 'Guides officiels, ouvrages de référence, organismes de formation et certifications — sélectionnés par nos conseillers et consultables librement.',
      resources_cta: 'Consulter les ressources',
      other_paths: 'Les autres parcours d\'orientation',
      empty: 'Aucun parcours d\'orientation n\'est publié pour le moment.',
    },
    de: {
      title: 'Orientierung',
      subtitle: 'Bevor Sie ins Ausland reisen, studieren oder arbeiten — holen Sie sich die richtige Beratung. Midzoes Orientierungsservice hilft Ihnen, fundierte Entscheidungen über Ihr internationales Projekt zu treffen.',
      cta: 'Starten',
      premium_title: 'Premium-Orientierung — Unternehmen & Bildungszentren',
      premium_desc: 'Für Unternehmen, die Teams für Schulungen, Konferenzen oder Einsätze ins Ausland entsenden — Midzoe übernimmt die komplette Orientierung: Visum, Unterkunft, lokale Logistik und Betreuung vor Ort.',
      premium_cta: 'Corporate-Orientierung anfragen',
      process_title: 'Unser Prozess',
      step1: 'Erstgespräch',
      step1_desc: 'Kostenloses 30-Minuten-Gespräch, um Ihre Situation und Ziele zu verstehen.',
      step2: 'Personalisierter Bericht',
      step2_desc: 'Wir erstellen einen detaillierten Orientierungsbericht mit Empfehlungen und Aktionsplan.',
      step3: 'Implementierungs-Support',
      step3_desc: 'Wir begleiten Sie durch den gesamten Prozess — Visum, Buchungen, Papierkram.',
      resources_title: 'Orientierungsressourcen',
      resources_desc: 'Offizielle Leitfäden, Standardwerke, Bildungsträger und Zertifizierungen — von unseren Beratern ausgewählt und frei zugänglich.',
      resources_cta: 'Ressourcen ansehen',
      other_paths: 'Weitere Orientierungswege',
      empty: 'Es ist noch kein Orientierungsweg veröffentlicht.',
    },
  };

  const l = labels[lang];
  // Traducteur figé sur le namespace du catalogue. Mémoïsé : `getFixedT` renvoie
  // une nouvelle fonction à chaque appel, ce qui invaliderait le useMemo ci-dessous
  // à chaque rendu.
  const tr = useMemo(() => i18n.getFixedT(null, 'services'), [i18n, i18n.language]);

  /** Les parcours du catalogue, dans l'ordre `order` défini en admin. */
  const paths = useMemo(() => {
    const category = categories.find(c => c.id === 'orientation');
    if (!category) return [];
    const details = serviceDetails['orientation'] ?? {};
    return category.services
      .map(name => details[name])
      .filter(Boolean)
      .map(detail => ({
        link: detail.learnMoreLink,
        image: detail.image,
        title: catalogText(tr, `${detail.translationKey}.name`, detail.name),
        description: catalogText(tr, `${detail.translationKey}.description`, detail.description),
        steps: catalogList(tr, `${detail.translationKey}.steps`, detail.steps),
      }));
  }, [categories, serviceDetails, tr]);

  // Route dédiée -> le parcours dont le lien est cette URL devient le sujet de la
  // page ; sans cela, les trois routes affichaient exactement la même page. La
  // correspondance vient de `learnMoreLink` : aucune route n'est codée ici.
  const focused = paths.find(p => p.link === location.pathname);
  const others = focused ? paths.filter(p => p.link !== focused.link) : paths;

  useEffect(() => {
    apiService
      .getOrientation()
      .then(res => setResources((res?.data ?? []).slice(0, 6)))
      .catch(() => setResources([]));
  }, []);

  const heroTitle = focused ? focused.title : l.title;
  const heroSubtitle = focused ? focused.description : l.subtitle;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Midzoe
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-4">{heroTitle}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{heroSubtitle}</p>
        </div>
      </div>

      {/* Étapes du parcours mis en avant — saisies en admin sur la fiche service. */}
      {focused && focused.steps.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <ol className="space-y-3">
              {focused.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <Link
              to="/contact"
              className="mt-8 inline-block px-8 py-3 bg-secondary hover:bg-primary text-white rounded-full font-semibold transition-colors duration-300"
            >
              {l.cta}
            </Link>
          </div>
        </div>
      )}

      {/* Process */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-primary text-center mb-10">{l.process_title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: l.step1, desc: l.step1_desc },
              { num: '02', title: l.step2, desc: l.step2_desc },
              { num: '03', title: l.step3, desc: l.step3_desc },
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

      {/* Parcours d'orientation (catalogue) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {focused && others.length > 0 && (
          <h2 className="text-2xl font-bold text-primary mb-8">{l.other_paths}</h2>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
          </div>
        )}

        {!loading && others.length === 0 && (
          <p className="text-center text-gray-500">{l.empty}</p>
        )}

        <div className="grid gap-10 lg:grid-cols-3">
          {others.map((path) => (
            <div key={path.link} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              {path.image ? (
                <div className="relative h-40">
                  <img src={path.image} alt={path.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-primary/70" />
                  <h2 className="absolute inset-x-0 bottom-0 p-6 text-xl font-bold text-white">{path.title}</h2>
                </div>
              ) : (
                <div className="bg-primary p-6">
                  <h2 className="text-xl font-bold text-white">{path.title}</h2>
                </div>
              )}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{path.description}</p>
                {path.steps.length > 0 && (
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
                )}
                <Link
                  to={path.link}
                  className="block text-center py-3 bg-secondary hover:bg-primary text-white rounded-full font-semibold text-sm transition-colors duration-300"
                >
                  {l.cta} — {path.title}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Catalogue de ressources (story 10.2, alimenté depuis l'admin) */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-3">{l.resources_title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">{l.resources_desc}</p>
          </div>

          {resources.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {resources.map((r: any) => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-secondary font-semibold">{r.type}</p>
                  <h3 className="font-bold text-primary mt-1 text-sm">{r.title}</h3>
                  {r.provider && <p className="text-xs text-gray-500 mt-1">{r.provider}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/orientation"
              className="inline-block px-8 py-3 bg-primary hover:bg-secondary text-white rounded-full font-semibold transition-colors duration-300"
            >
              {l.resources_cta}
            </Link>
          </div>
        </div>

        {/* Premium Corporate */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-10 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">Premium</span>
            <h2 className="text-2xl font-bold mb-4">{l.premium_title}</h2>
            <p className="text-white/80 mb-8 leading-relaxed">{l.premium_desc}</p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-white text-primary hover:bg-secondary hover:text-white rounded-full font-bold transition-colors duration-300"
            >
              {l.premium_cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orientation;
