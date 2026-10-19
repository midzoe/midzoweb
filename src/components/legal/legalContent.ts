/**
 * Documents légaux de Midzo (FR fait foi ; EN et DE sont des traductions).
 * {{clé}} = donnée de société (src/config/company.ts) ; vide → affichée « à compléter ».
 * À faire relire par un juriste avant l'ouverture de la vente (statut d'agence de voyages,
 * médiateur, droit applicable).
 */
export type LegalLang = 'fr' | 'en' | 'de';
export type LegalDocId = 'cgv' | 'refund' | 'notice' | 'terms' | 'privacy';
export interface LegalSection { h: string; p: string[] }
export interface LegalDoc { title: string; intro?: string; sections: LegalSection[] }

export const LEGAL_UPDATED = '2026-10-19';

export const LEGAL_UI: Record<LegalLang, { updated: string; missing: string; reviewNote: string; others: string }> = {
  fr: { updated: 'Dernière mise à jour', missing: 'à compléter', reviewNote: 'Version de travail : les éléments surlignés seront complétés avant l’ouverture de la vente.', others: 'Autres documents' },
  en: { updated: 'Last updated', missing: 'to be completed', reviewNote: 'Working version: highlighted items will be completed before sales open. The French version prevails.', others: 'Other documents' },
  de: { updated: 'Zuletzt aktualisiert', missing: 'zu ergänzen', reviewNote: 'Arbeitsfassung: Markierte Angaben werden vor Verkaufsstart ergänzt. Maßgeblich ist die französische Fassung.', others: 'Weitere Dokumente' },
};

export const LEGAL_PATHS: Record<LegalDocId, string> = {
  cgv: '/cgv', refund: '/remboursement', notice: '/mentions-legales', terms: '/terms', privacy: '/privacy',
};

export const LEGAL: Record<LegalLang, Record<LegalDocId, LegalDoc>> = {
  fr: {
    cgv: {
      title: 'Conditions générales de vente',
      intro: 'Les présentes conditions s’appliquent à tout achat d’un service d’accompagnement Midzo sur ce site. En validant une commande, le client déclare les avoir lues et acceptées.',
      sections: [
        { h: '1. Vendeur', p: ['{{legalName}}, {{legalForm}}, dont le siège est situé {{address}}, immatriculée {{registration}}, TVA {{vat}}. Contact : {{email}} — {{phone}}.', 'Pour les prestations de voyage : immatriculation au registre des opérateurs de voyages {{travelLicence}} ; garantie financière {{financialGuarantor}} ; assurance responsabilité civile professionnelle {{insurer}}.'] },
        { h: '2. Services', p: ['Midzo propose des services d’accompagnement pour les projets d’études à l’étranger (recherche d’université, candidature, visa, logement, banque, langue, reconnaissance de diplôme, accueil) et pour les voyages (guide, itinéraire, visa, hébergement, activités, transferts), à l’unité ou en packages, ainsi qu’une consultation.', 'Le contenu de chaque service et son prix sont affichés sur le site avant la commande. Midzo est tenue d’une obligation de moyens : l’admission dans un établissement et la délivrance d’un visa relèvent exclusivement des établissements et des autorités consulaires.'] },
        { h: '3. Prix', p: ['Les prix sont indiqués en euros, toutes taxes comprises. Un montant dans une autre monnaie peut être affiché à titre indicatif ; le paiement est effectué en euros.', 'Les services études sont facturés par étudiant. Les services voyage sont facturés par dossier, deux voyageurs inclus ; chaque voyageur supplémentaire ajoute 25 % au prix des services voyage. Le prix final est affiché avant le paiement.', 'Ne sont pas inclus, sauf mention contraire : frais de visa et de dossier consulaire, frais de candidature des établissements, frais de scolarité, billets de transport, hébergement, assurances, compte bloqué et tout montant payé à un tiers.'] },
        { h: '4. Commande', p: ['La commande se fait depuis un compte client : choix des services et de l’offre, choix du nombre d’échéances, acceptation des présentes conditions, paiement. Un email de confirmation est envoyé et un dossier est ouvert dans l’espace client.'] },
        { h: '5. Paiement', p: ['Le paiement en ligne s’effectue par carte bancaire via Stripe. Il peut être réglé en 1, 3, 6 ou 12 fois ; la remise éventuelle liée au nombre d’échéances est affichée avant le paiement. En cas de paiement échelonné, les échéances sont prélevées chaque mois sur la même carte et s’arrêtent automatiquement après la dernière.', 'Un paiement par virement ou Mobile Money peut être convenu avec un conseiller ; il est enregistré dans le dossier du client.', 'En cas d’échéance impayée, Midzo informe le client et peut suspendre les services non encore réalisés jusqu’à régularisation.'] },
        { h: '6. Exécution', p: ['Après le paiement, un conseiller est attribué au dossier. L’avancement de chaque service, les messages et la prochaine étape sont visibles dans « Mon accompagnement ».', 'Le client fournit des informations exactes et des documents authentiques, dans les délais demandés. Midzo ne peut être tenue responsable d’un retard ou d’un refus résultant d’informations inexactes ou de documents fournis tardivement.'] },
        { h: '7. Droit de rétractation', p: ['Le client consommateur dispose de 14 jours à compter de la commande pour se rétracter, sans motif, en écrivant à {{email}} ou depuis le formulaire de contact.', 'Si le client demande que l’exécution commence avant la fin de ce délai, il paie le montant correspondant aux services déjà réalisés à la date de sa rétractation. Un service entièrement exécuté avec l’accord exprès du client avant la fin du délai n’est plus rétractable.', 'Les prestations de voyage (transport, hébergement, activités) fournies à une date déterminée ne sont pas soumises au droit de rétractation ; leurs conditions d’annulation sont précisées dans le devis.'] },
        { h: '8. Annulation et remboursement', p: ['Les conditions d’annulation et de remboursement, y compris en cas de refus de visa, figurent dans la politique « Annulation et remboursement », qui fait partie des présentes conditions.'] },
        { h: '9. Voyages', p: ['Lorsque Midzo vend une combinaison de prestations de voyage constituant un forfait au sens de la directive (UE) 2015/2302, le client reçoit avant la vente le formulaire d’information prévu par la réglementation et bénéficie de la protection contre l’insolvabilité assurée par {{financialGuarantor}}.', 'Les prestations réservées auprès de tiers (compagnies aériennes, hôtels, organisateurs d’activités) sont soumises à leurs propres conditions, communiquées au client.'] },
        { h: '10. Responsabilité', p: ['La responsabilité de Midzo est limitée au montant payé pour le service concerné, sauf faute lourde ou dommage corporel. Midzo n’est pas responsable des décisions des établissements, des consulats et des autorités, ni des événements de force majeure.'] },
        { h: '11. Avis clients', p: ['Seuls les clients ayant payé un accompagnement peuvent publier un avis. Les avis sont relus avant publication, sans modification de leur contenu ; un avis peut être refusé s’il est injurieux, hors sujet ou contient des données personnelles. Les avis sont affichés du plus récent au plus ancien et ne sont pas rémunérés.'] },
        { h: '12. Données personnelles', p: ['Le traitement des données du client est décrit dans la politique de confidentialité.'] },
        { h: '13. Réclamations et médiation', p: ['Toute réclamation est adressée à {{email}}. À défaut de solution amiable dans un délai de 60 jours, le client consommateur peut saisir gratuitement le médiateur de la consommation : {{mediator}}.'] },
        { h: '14. Droit applicable', p: ['Les présentes conditions sont soumises au droit {{law}}, sans priver le client consommateur de la protection que lui assurent les dispositions impératives de la loi de son pays de résidence.'] },
      ],
    },
    refund: {
      title: 'Annulation et remboursement',
      intro: 'Cette politique complète les conditions générales de vente. Les remboursements sont effectués dans un délai de 14 jours, par le moyen de paiement utilisé.',
      sections: [
        { h: 'Avant le début de l’accompagnement', p: ['Tant qu’aucun service n’a été commencé, l’annulation donne lieu au remboursement intégral, dans le délai de rétractation de 14 jours comme au-delà.'] },
        { h: 'Accompagnement commencé', p: ['Les services déjà réalisés restent dus. Les services non commencés sont remboursés au prorata de leur prix à l’unité dans l’offre achetée.', 'En cas de paiement échelonné, l’annulation arrête les échéances futures ; le montant dû correspond aux services réalisés.'] },
        { h: 'Consultation (25 €)', p: ['Remboursée si elle est annulée au moins 24 heures avant le rendez-vous. Elle n’est plus remboursable une fois réalisée.'] },
        { h: 'Refus de visa', p: ['Si le visa est refusé alors que le dossier a été déposé selon nos recommandations et dans les délais, Midzo rembourse {{visaRefusalRefundPct}} % du prix du service « Visa », sur présentation de la décision de refus dans les 30 jours. Les frais consulaires, payés directement au consulat, ne sont pas remboursés par Midzo.', 'Si le refus résulte d’informations inexactes ou de documents non fournis par le client, aucun remboursement n’est dû. Midzo peut proposer de préparer une nouvelle demande.'] },
        { h: 'Refus d’admission', p: ['Les candidatures réalisées restent dues. Le conseiller peut proposer d’autres établissements dans le cadre du service acheté.'] },
        { h: 'Voyages', p: ['Annulation par le client : les services Midzo réalisés et les frais engagés auprès de tiers (billets, hébergements non remboursables) restent dus ; le reste est remboursé. Annulation par Midzo : remboursement intégral.', 'Pour un forfait touristique, les conditions particulières de la directive (UE) 2015/2302 s’appliquent (frais de résolution, circonstances exceptionnelles).'] },
        { h: 'Comment demander un remboursement', p: ['Écrivez à {{email}} ou utilisez le formulaire de contact en indiquant votre dossier. Une réponse est apportée par email et le remboursement apparaît dans « Mon accompagnement ».'] },
      ],
    },
    notice: {
      title: 'Mentions légales',
      sections: [
        { h: 'Éditeur du site', p: ['{{legalName}}, {{legalForm}}, {{address}}. Immatriculation : {{registration}}. TVA : {{vat}}. Contact : {{email}} — {{phone}}.', 'Directeur de la publication : {{director}}.'] },
        { h: 'Activité de voyages', p: ['Immatriculation : {{travelLicence}}. Garant financier : {{financialGuarantor}}. Assurance RC professionnelle : {{insurer}}.'] },
        { h: 'Hébergement', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — vercel.com.'] },
        { h: 'Paiement', p: ['Les paiements en ligne sont traités par Stripe. Midzo ne conserve aucune donnée de carte bancaire.'] },
        { h: 'Propriété intellectuelle', p: ['Les textes, logos et contenus du site sont la propriété de Midzo ou de leurs auteurs. Toute reproduction sans autorisation est interdite. Les informations sur les universités, visas et pays sont fournies à titre indicatif ; les sites officiels font foi.'] },
      ],
    },
    terms: {
      title: 'Conditions d’utilisation',
      sections: [
        { h: '1. Objet', p: ['Ces conditions encadrent l’utilisation du site Midzo, avec ou sans compte. L’achat de services est régi par les conditions générales de vente.'] },
        { h: '2. Compte', p: ['Le compte est personnel. L’utilisateur fournit une adresse email valide, garde son mot de passe confidentiel et peut supprimer son compte à tout moment depuis son profil.'] },
        { h: '3. Informations publiées', p: ['Les informations du catalogue (universités, frais, délais, visas, logements, prix indicatifs) sont mises à jour régulièrement mais peuvent évoluer ; seules les sources officielles font foi. Midzo signale les données indicatives.'] },
        { h: '4. Usage interdit', p: ['Sont interdits : l’usage frauduleux, l’envoi de documents falsifiés, la publication d’avis mensongers, toute tentative d’atteinte à la sécurité du site.'] },
        { h: '5. Responsabilité', p: ['Midzo met tout en œuvre pour assurer la disponibilité du site sans pouvoir la garantir. Les liens vers des sites tiers sont fournis pour information.'] },
        { h: '6. Modification', p: ['Ces conditions peuvent évoluer ; la date de mise à jour figure en haut de page.'] },
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      sections: [
        { h: 'Responsable du traitement', p: ['{{legalName}}, {{address}} — {{email}}.'] },
        { h: 'Données collectées', p: ['Compte : nom, email, téléphone, mot de passe chiffré. Profil : nationalité, pays de résidence, langues et niveau, diplôme. Projets d’études et de voyage, messages échangés avec les conseillers, avis publiés, historique des paiements (montant, offre, statut — jamais les données de carte, traitées par Stripe).', 'Sur l’appareil : jeton de connexion, langue choisie, brouillons de projet (stockage local du navigateur). Pas de publicité ciblée.'] },
        { h: 'Finalités et bases légales', p: ['Exécution du contrat (accompagnement, paiement, suivi), obligations légales (comptabilité), intérêt légitime (sécurité, amélioration du service), consentement (newsletter, révocable à tout moment).'] },
        { h: 'Destinataires', p: ['L’équipe Midzo, et seulement pour les besoins du service : hébergeur (Vercel), base de données, paiement (Stripe), envoi d’emails ; avec votre accord, les établissements, logeurs ou partenaires concernés par votre dossier. Certains prestataires sont situés hors de l’Union européenne et encadrés par des clauses contractuelles types.'] },
        { h: 'Durée de conservation', p: ['Compte : jusqu’à sa suppression. Données de dossier : durée de l’accompagnement puis 3 ans. Pièces comptables : durée légale.'] },
        { h: 'Vos droits', p: ['Accès, rectification, effacement (suppression du compte en libre-service), opposition, limitation, portabilité : écrivez à {{email}}. Vous pouvez saisir l’autorité de protection des données de votre pays.'] },
      ],
    },
  },
  en: {
    cgv: {
      title: 'Terms of sale',
      intro: 'These terms apply to any purchase of a Midzo support service on this site. By confirming an order, the customer declares having read and accepted them. The French version prevails.',
      sections: [
        { h: '1. Seller', p: ['{{legalName}}, {{legalForm}}, registered office {{address}}, registered {{registration}}, VAT {{vat}}. Contact: {{email}} — {{phone}}.', 'For travel services: travel operator registration {{travelLicence}}; financial guarantee {{financialGuarantor}}; professional liability insurance {{insurer}}.'] },
        { h: '2. Services', p: ['Midzo offers support for study-abroad projects (university search, application, visa, housing, bank, language, diploma recognition, arrival) and for travel (guide, itinerary, visa, accommodation, activities, transfers), individually or in packages, as well as a consultation.', 'The content and price of each service are shown before ordering. Midzo has an obligation of means: admission and visa decisions rest solely with institutions and consular authorities.'] },
        { h: '3. Prices', p: ['Prices are in euros, all taxes included. An amount in another currency may be shown for information; payment is made in euros.', 'Study services are charged per student. Travel services are charged per file, two travellers included; each additional traveller adds 25% to the price of travel services. The final price is shown before payment.', 'Not included unless stated: visa and consular fees, application fees, tuition, transport tickets, accommodation, insurance, blocked account and any amount paid to a third party.'] },
        { h: '4. Order', p: ['Orders are placed from a customer account: choice of services and offer, number of instalments, acceptance of these terms, payment. A confirmation email is sent and a file is opened in the customer area.'] },
        { h: '5. Payment', p: ['Online payment is made by card via Stripe, in 1, 3, 6 or 12 instalments; any discount linked to the number of instalments is shown before payment. Instalments are charged monthly to the same card and stop automatically after the last one.', 'Bank transfer or Mobile Money may be agreed with an advisor and recorded in the customer’s file.', 'If an instalment is unpaid, Midzo informs the customer and may suspend services not yet performed until payment.'] },
        { h: '6. Performance', p: ['After payment, an advisor is assigned. Progress, messages and the next step are visible in “My support”.', 'The customer provides accurate information and genuine documents on time. Midzo is not liable for delays or refusals caused by inaccurate information or late documents.'] },
        { h: '7. Right of withdrawal', p: ['Consumers have 14 days from the order to withdraw, without reason, by writing to {{email}} or using the contact form.', 'If the customer asks for performance to start within this period, they pay for the services already performed when they withdraw. A service fully performed with the customer’s express consent before the end of the period can no longer be withdrawn.', 'Travel services (transport, accommodation, activities) provided on a specific date are not subject to the right of withdrawal; their cancellation terms are stated in the quote.'] },
        { h: '8. Cancellation and refunds', p: ['Cancellation and refund conditions, including visa refusal, are set out in the “Cancellation & refunds” policy, which forms part of these terms.'] },
        { h: '9. Travel', p: ['When Midzo sells a combination of travel services forming a package under Directive (EU) 2015/2302, the customer receives the standard information form before the sale and is protected against insolvency by {{financialGuarantor}}.', 'Services booked with third parties (airlines, hotels, activity providers) are subject to their own terms, communicated to the customer.'] },
        { h: '10. Liability', p: ['Midzo’s liability is limited to the amount paid for the service concerned, except for gross negligence or bodily injury. Midzo is not liable for decisions by institutions, consulates and authorities, or for force majeure.'] },
        { h: '11. Customer reviews', p: ['Only customers who paid for support can post a review. Reviews are checked before publication without changing their content; a review may be refused if abusive, off-topic or containing personal data. Reviews are shown newest first and are not paid for.'] },
        { h: '12. Personal data', p: ['Data processing is described in the privacy policy.'] },
        { h: '13. Complaints and mediation', p: ['Complaints go to {{email}}. Without an amicable solution within 60 days, consumers may refer the matter free of charge to the consumer mediator: {{mediator}}.'] },
        { h: '14. Governing law', p: ['These terms are governed by {{law}} law, without depriving consumers of the mandatory protection of the law of their country of residence.'] },
      ],
    },
    refund: {
      title: 'Cancellation & refunds',
      intro: 'This policy supplements the terms of sale. Refunds are made within 14 days using the original payment method. The French version prevails.',
      sections: [
        { h: 'Before support starts', p: ['As long as no service has started, cancellation gives a full refund, within the 14-day withdrawal period and beyond.'] },
        { h: 'Support already started', p: ['Services already performed remain due. Services not started are refunded pro rata to their individual price in the offer purchased.', 'For instalment payments, cancellation stops future instalments; the amount due matches the services performed.'] },
        { h: 'Consultation (€25)', p: ['Refunded if cancelled at least 24 hours before the appointment. Not refundable once held.'] },
        { h: 'Visa refusal', p: ['If the visa is refused although the file was submitted as recommended and on time, Midzo refunds {{visaRefusalRefundPct}}% of the “Visa” service price on presentation of the refusal decision within 30 days. Consular fees paid to the consulate are not refunded by Midzo.', 'If the refusal results from inaccurate information or documents not provided by the customer, no refund is due. Midzo may offer to prepare a new application.'] },
        { h: 'Admission refusal', p: ['Applications made remain due. The advisor may suggest other institutions within the service purchased.'] },
        { h: 'Travel', p: ['Cancellation by the customer: Midzo services performed and costs committed with third parties (non-refundable tickets, accommodation) remain due; the rest is refunded. Cancellation by Midzo: full refund.', 'For package travel, the specific rules of Directive (EU) 2015/2302 apply (termination fees, exceptional circumstances).'] },
        { h: 'How to request a refund', p: ['Write to {{email}} or use the contact form, mentioning your file. You receive an answer by email and the refund appears in “My support”.'] },
      ],
    },
    notice: {
      title: 'Legal notice',
      sections: [
        { h: 'Publisher', p: ['{{legalName}}, {{legalForm}}, {{address}}. Registration: {{registration}}. VAT: {{vat}}. Contact: {{email}} — {{phone}}.', 'Publication director: {{director}}.'] },
        { h: 'Travel activity', p: ['Registration: {{travelLicence}}. Financial guarantor: {{financialGuarantor}}. Professional liability insurance: {{insurer}}.'] },
        { h: 'Hosting', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States — vercel.com.'] },
        { h: 'Payment', p: ['Online payments are processed by Stripe. Midzo does not store any card data.'] },
        { h: 'Intellectual property', p: ['Texts, logos and content belong to Midzo or their authors. Reproduction without permission is prohibited. Information on universities, visas and countries is indicative; official sources prevail.'] },
      ],
    },
    terms: {
      title: 'Terms of use',
      sections: [
        { h: '1. Purpose', p: ['These terms govern the use of the Midzo site, with or without an account. Purchases are governed by the terms of sale.'] },
        { h: '2. Account', p: ['Accounts are personal. Users provide a valid email, keep their password confidential and can delete their account at any time from their profile.'] },
        { h: '3. Published information', p: ['Catalogue information (universities, fees, timing, visas, housing, indicative prices) is updated regularly but may change; only official sources prevail. Midzo flags indicative data.'] },
        { h: '4. Prohibited use', p: ['Fraudulent use, forged documents, false reviews and any attempt to compromise the site’s security are prohibited.'] },
        { h: '5. Liability', p: ['Midzo does its best to keep the site available but cannot guarantee it. Links to third-party sites are provided for information.'] },
        { h: '6. Changes', p: ['These terms may change; the update date is shown at the top of the page.'] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      sections: [
        { h: 'Controller', p: ['{{legalName}}, {{address}} — {{email}}.'] },
        { h: 'Data collected', p: ['Account: name, email, phone, encrypted password. Profile: nationality, country of residence, languages and level, diploma. Study and travel projects, messages with advisors, published reviews, payment history (amount, offer, status — never card data, handled by Stripe).', 'On your device: login token, chosen language, project drafts (browser local storage). No targeted advertising.'] },
        { h: 'Purposes and legal bases', p: ['Contract performance (support, payment, follow-up), legal obligations (accounting), legitimate interest (security, service improvement), consent (newsletter, withdrawable at any time).'] },
        { h: 'Recipients', p: ['The Midzo team, and only as needed for the service: host (Vercel), database, payment (Stripe), email delivery; with your consent, the institutions, landlords or partners concerned by your file. Some providers are outside the EU and covered by standard contractual clauses.'] },
        { h: 'Retention', p: ['Account: until deletion. File data: duration of support, then 3 years. Accounting records: legal period.'] },
        { h: 'Your rights', p: ['Access, rectification, erasure (self-service account deletion), objection, restriction, portability: write to {{email}}. You may contact your country’s data protection authority.'] },
      ],
    },
  },
  de: {
    cgv: {
      title: 'Allgemeine Geschäftsbedingungen',
      intro: 'Diese Bedingungen gelten für jeden Kauf einer Midzo-Begleitleistung auf dieser Website. Mit der Bestellung erklärt der Kunde, sie gelesen und akzeptiert zu haben. Maßgeblich ist die französische Fassung.',
      sections: [
        { h: '1. Verkäufer', p: ['{{legalName}}, {{legalForm}}, Sitz {{address}}, eingetragen {{registration}}, USt-IdNr. {{vat}}. Kontakt: {{email}} — {{phone}}.', 'Für Reiseleistungen: Registrierung als Reiseveranstalter {{travelLicence}}; Insolvenzabsicherung {{financialGuarantor}}; Berufshaftpflichtversicherung {{insurer}}.'] },
        { h: '2. Leistungen', p: ['Midzo bietet Begleitung für Auslandsstudium (Hochschulsuche, Bewerbung, Visum, Unterkunft, Bank, Sprache, Anerkennung, Ankunft) und Reisen (Reiseführer, Route, Visum, Unterkunft, Aktivitäten, Transfers), einzeln oder als Paket, sowie eine Beratung.', 'Inhalt und Preis jeder Leistung werden vor der Bestellung angezeigt. Midzo schuldet eine Bemühung, keinen Erfolg: Über Zulassung und Visum entscheiden allein Hochschulen und Behörden.'] },
        { h: '3. Preise', p: ['Preise in Euro inkl. Steuern. Ein Betrag in anderer Währung dient nur zur Information; gezahlt wird in Euro.', 'Studienleistungen pro Student. Reiseleistungen pro Akte, zwei Reisende inklusive; jeder weitere Reisende +25 % auf die Reiseleistungen. Der Endpreis wird vor der Zahlung angezeigt.', 'Nicht enthalten, sofern nicht angegeben: Visum- und Konsulargebühren, Bewerbungs- und Studiengebühren, Tickets, Unterkunft, Versicherungen, Sperrkonto und Zahlungen an Dritte.'] },
        { h: '4. Bestellung', p: ['Bestellung über ein Kundenkonto: Auswahl von Leistungen und Angebot, Anzahl der Raten, Annahme dieser AGB, Zahlung. Eine Bestätigung wird per E-Mail gesendet und eine Akte eröffnet.'] },
        { h: '5. Zahlung', p: ['Online-Zahlung per Karte über Stripe, in 1, 3, 6 oder 12 Raten; ein Rabatt je nach Ratenzahl wird vorher angezeigt. Raten werden monatlich von derselben Karte abgebucht und enden automatisch nach der letzten.', 'Überweisung oder Mobile Money kann mit einem Berater vereinbart und in der Akte erfasst werden.', 'Bei nicht bezahlter Rate informiert Midzo den Kunden und kann noch nicht erbrachte Leistungen bis zur Zahlung aussetzen.'] },
        { h: '6. Durchführung', p: ['Nach der Zahlung wird ein Berater zugewiesen. Fortschritt, Nachrichten und nächster Schritt sind unter „Meine Begleitung“ sichtbar.', 'Der Kunde liefert richtige Angaben und echte Unterlagen fristgerecht. Midzo haftet nicht für Verzögerungen oder Ablehnungen aufgrund falscher Angaben oder verspäteter Unterlagen.'] },
        { h: '7. Widerrufsrecht', p: ['Verbraucher können binnen 14 Tagen ab Bestellung ohne Angabe von Gründen widerrufen (E-Mail an {{email}} oder Kontaktformular).', 'Verlangt der Kunde den Beginn der Leistung vor Fristablauf, zahlt er die bis zum Widerruf erbrachten Leistungen. Eine mit ausdrücklicher Zustimmung vollständig erbrachte Leistung kann nicht mehr widerrufen werden.', 'Reiseleistungen zu einem bestimmten Termin (Beförderung, Unterkunft, Aktivitäten) unterliegen keinem Widerrufsrecht; ihre Stornobedingungen stehen im Angebot.'] },
        { h: '8. Stornierung und Erstattung', p: ['Die Bedingungen, auch bei Visumablehnung, stehen in der Richtlinie „Stornierung & Erstattung“, die Bestandteil dieser AGB ist.'] },
        { h: '9. Reisen', p: ['Verkauft Midzo eine Pauschalreise im Sinne der Richtlinie (EU) 2015/2302, erhält der Kunde vorab das gesetzliche Formblatt und ist durch {{financialGuarantor}} gegen Insolvenz abgesichert.', 'Bei Dritten gebuchte Leistungen (Airlines, Hotels, Anbieter) unterliegen deren Bedingungen.'] },
        { h: '10. Haftung', p: ['Die Haftung von Midzo ist auf den für die Leistung gezahlten Betrag beschränkt, außer bei grober Fahrlässigkeit oder Personenschaden. Keine Haftung für Entscheidungen von Hochschulen, Konsulaten, Behörden oder höhere Gewalt.'] },
        { h: '11. Kundenbewertungen', p: ['Nur Kunden mit bezahlter Begleitung können bewerten. Bewertungen werden vor Veröffentlichung geprüft, ohne Inhaltsänderung; beleidigende, themenfremde oder personenbezogene Inhalte können abgelehnt werden. Neueste zuerst, keine bezahlten Bewertungen.'] },
        { h: '12. Personenbezogene Daten', p: ['Siehe Datenschutzerklärung.'] },
        { h: '13. Beschwerden und Schlichtung', p: ['Beschwerden an {{email}}. Ohne gütliche Einigung binnen 60 Tagen können Verbraucher kostenlos die Verbraucherschlichtungsstelle anrufen: {{mediator}}.'] },
        { h: '14. Anwendbares Recht', p: ['Es gilt das Recht {{law}}, ohne Verbrauchern den zwingenden Schutz ihres Wohnsitzlandes zu entziehen.'] },
      ],
    },
    refund: {
      title: 'Stornierung & Erstattung',
      intro: 'Diese Richtlinie ergänzt die AGB. Erstattungen erfolgen binnen 14 Tagen über das ursprüngliche Zahlungsmittel. Maßgeblich ist die französische Fassung.',
      sections: [
        { h: 'Vor Beginn der Begleitung', p: ['Solange keine Leistung begonnen hat, wird vollständig erstattet – innerhalb und nach der 14-tägigen Widerrufsfrist.'] },
        { h: 'Begonnene Begleitung', p: ['Erbrachte Leistungen bleiben geschuldet. Nicht begonnene Leistungen werden anteilig zu ihrem Einzelpreis im gekauften Angebot erstattet.', 'Bei Ratenzahlung stoppt die Stornierung künftige Raten; geschuldet sind die erbrachten Leistungen.'] },
        { h: 'Beratung (25 €)', p: ['Erstattet bei Absage mindestens 24 Stunden vor dem Termin. Nach Durchführung nicht erstattbar.'] },
        { h: 'Visumablehnung', p: ['Wird das Visum trotz fristgerechter, empfehlungsgemäßer Antragstellung abgelehnt, erstattet Midzo {{visaRefusalRefundPct}} % des Preises der Leistung „Visum“ gegen Vorlage des Ablehnungsbescheids binnen 30 Tagen. Konsulargebühren werden nicht von Midzo erstattet.', 'Beruht die Ablehnung auf falschen Angaben oder fehlenden Unterlagen des Kunden, besteht kein Erstattungsanspruch.'] },
        { h: 'Zulassungsablehnung', p: ['Erbrachte Bewerbungen bleiben geschuldet. Der Berater kann im Rahmen der gekauften Leistung andere Hochschulen vorschlagen.'] },
        { h: 'Reisen', p: ['Stornierung durch den Kunden: erbrachte Midzo-Leistungen und bei Dritten entstandene Kosten bleiben geschuldet; der Rest wird erstattet. Stornierung durch Midzo: volle Erstattung.', 'Für Pauschalreisen gelten die Regeln der Richtlinie (EU) 2015/2302.'] },
        { h: 'Erstattung beantragen', p: ['Schreiben Sie an {{email}} oder nutzen Sie das Kontaktformular mit Angabe Ihrer Akte.'] },
      ],
    },
    notice: {
      title: 'Impressum',
      sections: [
        { h: 'Anbieter', p: ['{{legalName}}, {{legalForm}}, {{address}}. Registereintrag: {{registration}}. USt-IdNr.: {{vat}}. Kontakt: {{email}} — {{phone}}.', 'Verantwortlich für den Inhalt: {{director}}.'] },
        { h: 'Reisetätigkeit', p: ['Registrierung: {{travelLicence}}. Insolvenzabsicherung: {{financialGuarantor}}. Berufshaftpflicht: {{insurer}}.'] },
        { h: 'Hosting', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA — vercel.com.'] },
        { h: 'Zahlung', p: ['Online-Zahlungen werden von Stripe abgewickelt. Midzo speichert keine Kartendaten.'] },
        { h: 'Urheberrecht', p: ['Texte, Logos und Inhalte gehören Midzo oder ihren Autoren. Vervielfältigung ohne Genehmigung ist untersagt. Angaben zu Hochschulen, Visa und Ländern sind unverbindlich; maßgeblich sind die offiziellen Quellen.'] },
      ],
    },
    terms: {
      title: 'Nutzungsbedingungen',
      sections: [
        { h: '1. Zweck', p: ['Diese Bedingungen regeln die Nutzung der Midzo-Website mit oder ohne Konto. Käufe unterliegen den AGB.'] },
        { h: '2. Konto', p: ['Das Konto ist persönlich. Nutzer geben eine gültige E-Mail an, halten ihr Passwort geheim und können ihr Konto jederzeit im Profil löschen.'] },
        { h: '3. Veröffentlichte Informationen', p: ['Katalogangaben (Hochschulen, Gebühren, Fristen, Visa, Unterkünfte, Richtpreise) werden regelmäßig aktualisiert, können sich aber ändern; maßgeblich sind die offiziellen Quellen.'] },
        { h: '4. Verbotene Nutzung', p: ['Betrug, gefälschte Unterlagen, falsche Bewertungen und Angriffe auf die Sicherheit der Website sind verboten.'] },
        { h: '5. Haftung', p: ['Midzo bemüht sich um die Verfügbarkeit der Website, kann sie aber nicht garantieren. Links zu Drittseiten dienen der Information.'] },
        { h: '6. Änderungen', p: ['Diese Bedingungen können sich ändern; das Aktualisierungsdatum steht oben auf der Seite.'] },
      ],
    },
    privacy: {
      title: 'Datenschutzerklärung',
      sections: [
        { h: 'Verantwortlicher', p: ['{{legalName}}, {{address}} — {{email}}.'] },
        { h: 'Erhobene Daten', p: ['Konto: Name, E-Mail, Telefon, verschlüsseltes Passwort. Profil: Staatsangehörigkeit, Wohnsitzland, Sprachen und Niveau, Abschluss. Studien- und Reiseprojekte, Nachrichten mit Beratern, veröffentlichte Bewertungen, Zahlungshistorie (Betrag, Angebot, Status — nie Kartendaten, die Stripe verarbeitet).', 'Auf Ihrem Gerät: Anmelde-Token, gewählte Sprache, Projektentwürfe (lokaler Browserspeicher). Keine zielgerichtete Werbung.'] },
        { h: 'Zwecke und Rechtsgrundlagen', p: ['Vertragserfüllung (Begleitung, Zahlung, Betreuung), gesetzliche Pflichten (Buchhaltung), berechtigtes Interesse (Sicherheit, Verbesserung), Einwilligung (Newsletter, jederzeit widerrufbar).'] },
        { h: 'Empfänger', p: ['Das Midzo-Team und, nur soweit nötig: Hosting (Vercel), Datenbank, Zahlung (Stripe), E-Mail-Versand; mit Ihrer Zustimmung die an Ihrer Akte beteiligten Hochschulen, Vermieter oder Partner. Einige Anbieter sitzen außerhalb der EU (Standardvertragsklauseln).'] },
        { h: 'Speicherdauer', p: ['Konto: bis zur Löschung. Aktendaten: Dauer der Begleitung plus 3 Jahre. Buchhaltungsunterlagen: gesetzliche Frist.'] },
        { h: 'Ihre Rechte', p: ['Auskunft, Berichtigung, Löschung (Kontolöschung im Profil), Widerspruch, Einschränkung, Übertragbarkeit: an {{email}}. Sie können sich an die Datenschutzbehörde Ihres Landes wenden.'] },
      ],
    },
  },
};
