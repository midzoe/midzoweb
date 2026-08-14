import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import {
  InformationCircleIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  IdentificationIcon,
  CameraIcon,
  UserIcon,
  MapPinIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface EmbassyBlock {
  id: number;
  country: string;
  name: string;
  location: string | null;
  link: string | null;
  email: string | null;
  phone: string | null;
  // Story 4.8 : où se trouve la mission compétente pour CE couple origine → destination.
  type: string | null;
  hostCountry: string | null;
  city: string | null;
  address: string | null;
  mapsUrl: string | null;
  /** true quand la mission est dans un autre pays que celui du demandeur. */
  isAbroad: boolean;
}

/** Fiche visa détaillée renvoyée par travel/check (story 4.7). */
interface Requirements {
  visaType: string;
  costs: {
    cost: number | null;
    currency: string | null;
    processingTime: string | null;
    visaValidity: string | null;
    entriesType: string | null;
    maxStay: string | null;
  };
  documents: {
    list: string[];
    passportValidity: string | null;
    photoSpec: string | null;
    applicationFormUrl: string | null;
  };
  personal: {
    fundsAmount: string | null;
    proofOfFunds: string | null;
    accommodationProof: string | null;
    insuranceRequired: boolean;
    insuranceMinCoverage: string | null;
    languageRequirement: string | null;
    admissionLetterRequired: boolean;
    guarantorRequired: boolean;
    criminalRecordRequired: boolean;
    medicalExamRequired: boolean;
    vaccinations: string | null;
    returnTicketRequired: boolean;
  };
  procedure: {
    whereToApply: string | null;
    appointmentUrl: string | null;
    biometricsRequired: boolean;
    interviewRequired: boolean;
    steps: string[];
  };
  goodToKnow: {
    commonRefusalReasons: string[];
    notes: string | null;
    officialSourceUrl: string | null;
    lastVerifiedAt: string | null;
  };
}

interface TravelCheckResult {
  visaRequired: boolean | null;
  message: string;
  embassy: EmbassyBlock | null;
  requirements: Requirements | null;
}

/* ── Blocs de présentation ──────────────────────────────────────────────────── */

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({
  title, icon: Icon, children,
}) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
      <Icon className="h-4 w-4 text-primary" /> {title}
    </h4>
    {children}
  </section>
);

const Fact: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({
  icon: Icon, label, value,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
};

/** Liste à puces cochées — « voici ce que vous devez fournir ». */
const CheckList: React.FC<{ items: string[]; ordered?: boolean }> = ({ items, ordered }) => {
  if (items.length === 0) return null;
  return ordered ? (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex gap-2.5 text-sm text-gray-700">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  ) : (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex gap-2 text-sm text-gray-700">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
};

/**
 * Story 4.5 : vérificateur de visa partagé par TouristVisa et StudentVisa.
 * Story 4.7 : au-delà du « visa requis oui/non », il déplie la fiche complète —
 * dossier à constituer, conditions personnelles à prouver, procédure de dépôt et
 * motifs de refus fréquents — pour que la personne sache exactement quoi préparer.
 */
const VisaChecker: React.FC<{
  nationality: string;
  destination: string;
  /** Type de fiche à charger (« Étudiant » depuis les pages études, « Tourisme » côté voyage). */
  visaType?: string;
}> = ({ nationality, destination, visaType }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const fr = lang === 'fr';

  const [result, setResult] = useState<TravelCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nationality || !destination) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiService
      .checkTravelRequirements(nationality, destination, lang, visaType)
      .then(res => {
        if (cancelled) return;
        setResult({
          visaRequired: res?.visaRequired ?? null,
          message: res?.message ?? '',
          embassy: res?.embassy ?? null,
          requirements: res?.requirements ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nationality, destination, lang, visaType]);

  if (!nationality || !destination) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-3 text-gray-500">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        {fr ? 'Vérification des exigences visa...' : 'Checking visa requirements...'}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-blue-50 rounded-xl shadow p-6 flex items-center gap-3 text-blue-700">
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
        <span>
          {fr
            ? "Aucune donnée visa disponible. Consultez l'ambassade du pays de destination."
            : 'No visa data available. Please contact the destination embassy.'}
        </span>
      </div>
    );
  }

  const required = result.visaRequired === true;
  const embassy = result.embassy;
  const req = result.requirements;

  // Obligations à cocher : présentées comme des exigences, pas comme des cases.
  const obligations = req
    ? ([
        req.personal.insuranceRequired && [
          fr ? 'Assurance maladie obligatoire' : 'Health insurance required',
          req.personal.insuranceMinCoverage,
        ],
        req.personal.admissionLetterRequired && [
          fr ? "Lettre d'admission d'un établissement" : 'Admission letter from an institution',
          null,
        ],
        req.personal.guarantorRequired && [
          fr ? 'Garant ou attestation de prise en charge' : 'Guarantor or sponsorship letter',
          null,
        ],
        req.personal.criminalRecordRequired && [
          fr ? 'Extrait de casier judiciaire' : 'Criminal record extract',
          null,
        ],
        req.personal.medicalExamRequired && [
          fr ? 'Visite médicale' : 'Medical examination',
          null,
        ],
        req.personal.returnTicketRequired && [
          fr ? 'Billet de retour' : 'Return ticket',
          null,
        ],
      ].filter(Boolean) as [string, string | null][])
    : [];

  const costLabel =
    req?.costs.cost !== null && req?.costs.cost !== undefined
      ? `${req.costs.cost} ${req.costs.currency || 'EUR'}`
      : null;

  return (
    <div className="space-y-4">
      {/* Verdict : la réponse en une phrase, plus l'ambassade compétente. */}
      <div
        className={`rounded-xl shadow-lg p-6 border-l-4 ${
          required ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'
        }`}
      >
        <div className="flex items-start gap-3">
          <InformationCircleIcon
            className={`h-6 w-6 mt-0.5 shrink-0 ${required ? 'text-amber-600' : 'text-green-600'}`}
          />
          <div className="flex-1">
            <p className={`text-sm ${required ? 'text-amber-800' : 'text-green-800'}`}>
              {result.message}
            </p>

            {embassy && (
              <div className="mt-4 bg-white/70 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <BuildingLibraryIcon className="h-5 w-5 shrink-0 text-primary" />
                    {embassy.name}
                  </div>
                  {embassy.type && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                      {embassy.type}
                    </span>
                  )}
                </div>

                {/* Pas de représentation sur place : le dire franchement, sinon la
                    personne cherche une adresse qui n'existe pas dans son pays. */}
                {embassy.isAbroad && (
                  <p className="mb-3 flex gap-2 rounded-md bg-amber-100/70 px-3 py-2 text-xs text-amber-900">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                    {fr
                      ? `Il n'y a pas de représentation dans votre pays. C'est cette mission, située ${embassy.city ? `à ${embassy.city} ` : ''}au ${embassy.hostCountry}, qui traite votre dossier — prévoyez le déplacement.`
                      : `There is no mission in your country. This one${embassy.city ? ` in ${embassy.city}` : ''} handles your application — plan to travel there.`}
                  </p>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  {(embassy.city || embassy.location) && (
                    <p>
                      <span className="font-medium">{fr ? 'Ville : ' : 'City: '}</span>
                      {embassy.city || embassy.location}
                      {embassy.hostCountry ? ` (${embassy.hostCountry})` : ''}
                    </p>
                  )}
                  {embassy.address && (
                    <p>
                      <span className="font-medium">{fr ? 'Adresse : ' : 'Address: '}</span>
                      {embassy.address}
                    </p>
                  )}
                  {embassy.email && (
                    <p>
                      <span className="font-medium">Email : </span>
                      <a href={`mailto:${embassy.email}`} className="text-primary hover:underline">
                        {embassy.email}
                      </a>
                    </p>
                  )}
                  {embassy.phone && (
                    <p>
                      <span className="font-medium">{fr ? 'Téléphone : ' : 'Phone: '}</span>
                      <a href={`tel:${embassy.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                        {embassy.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {embassy.mapsUrl && (
                    <a
                      href={embassy.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-dark"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      {fr ? 'Itinéraire' : 'Directions'}
                    </a>
                  )}
                  {embassy.link && (
                    <a
                      href={embassy.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {fr ? 'Site officiel' : 'Official website'}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fiche détaillée : ce qu'il faut savoir et fournir pour obtenir le visa. */}
      {req && (
        <div className="space-y-4">
          <Section title={fr ? 'Coûts et délais' : 'Costs and timing'} icon={BanknotesIcon}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Fact icon={BanknotesIcon} label={fr ? 'Frais' : 'Fee'} value={costLabel} />
              <Fact icon={ClockIcon} label={fr ? 'Délai' : 'Processing time'} value={req.costs.processingTime} />
              <Fact icon={CalendarDaysIcon} label={fr ? 'Validité' : 'Validity'} value={req.costs.visaValidity} />
              <Fact icon={CalendarDaysIcon} label={fr ? 'Séjour autorisé' : 'Allowed stay'} value={req.costs.maxStay} />
              <Fact icon={ArrowRightOnRectangleIcon} label={fr ? 'Entrées' : 'Entries'} value={req.costs.entriesType} />
            </div>
          </Section>

          {(req.documents.list.length > 0 ||
            req.documents.passportValidity ||
            req.documents.photoSpec) && (
            <Section title={fr ? 'Dossier à constituer' : 'Documents to provide'} icon={DocumentTextIcon}>
              <CheckList items={req.documents.list} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Fact icon={IdentificationIcon} label={fr ? 'Passeport' : 'Passport'} value={req.documents.passportValidity} />
                <Fact icon={CameraIcon} label={fr ? 'Photos' : 'Photos'} value={req.documents.photoSpec} />
              </div>
              {req.documents.applicationFormUrl && (
                <a
                  href={req.documents.applicationFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  {fr ? 'Formulaire de demande' : 'Application form'}
                </a>
              )}
            </Section>
          )}

          {(obligations.length > 0 ||
            req.personal.fundsAmount ||
            req.personal.languageRequirement ||
            req.personal.accommodationProof ||
            req.personal.vaccinations) && (
            <Section
              title={fr ? 'Ce que vous devez prouver' : 'What you must prove'}
              icon={UserIcon}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact icon={BanknotesIcon} label={fr ? 'Ressources' : 'Financial means'} value={req.personal.fundsAmount} />
                <Fact icon={DocumentTextIcon} label={fr ? 'Justificatif de ressources' : 'Proof of funds'} value={req.personal.proofOfFunds} />
                <Fact icon={MapPinIcon} label={fr ? 'Hébergement' : 'Accommodation'} value={req.personal.accommodationProof} />
                <Fact icon={IdentificationIcon} label={fr ? 'Niveau de langue' : 'Language level'} value={req.personal.languageRequirement} />
                <Fact icon={ExclamationTriangleIcon} label={fr ? 'Vaccins' : 'Vaccinations'} value={req.personal.vaccinations} />
              </div>
              {obligations.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                  {obligations.map(([label, detail]) => (
                    <li key={label} className="flex gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {label}
                        {detail && <span className="text-gray-500"> — {detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {(req.procedure.whereToApply ||
            req.procedure.steps.length > 0 ||
            req.procedure.biometricsRequired ||
            req.procedure.interviewRequired) && (
            <Section title={fr ? 'Comment déposer la demande' : 'How to apply'} icon={ListBulletIcon}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact icon={MapPinIcon} label={fr ? 'Où déposer' : 'Where to apply'} value={req.procedure.whereToApply} />
                <Fact
                  icon={UserIcon}
                  label={fr ? 'Sur place' : 'In person'}
                  value={
                    [
                      req.procedure.biometricsRequired && (fr ? 'Biométrie' : 'Biometrics'),
                      req.procedure.interviewRequired && (fr ? 'Entretien' : 'Interview'),
                    ]
                      .filter(Boolean)
                      .join(' · ') || null
                  }
                />
              </div>
              {req.procedure.steps.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <CheckList items={req.procedure.steps} ordered />
                </div>
              )}
              {req.procedure.appointmentUrl && (
                <a
                  href={req.procedure.appointmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  {fr ? 'Prendre rendez-vous' : 'Book an appointment'}
                </a>
              )}
            </Section>
          )}

          {req.goodToKnow.commonRefusalReasons.length > 0 && (
            <Section
              title={fr ? 'Motifs de refus fréquents' : 'Common refusal reasons'}
              icon={ExclamationTriangleIcon}
            >
              <ul className="space-y-1.5">
                {req.goodToKnow.commonRefusalReasons.map((reason, i) => (
                  <li key={`${reason}-${i}`} className="flex gap-2 text-sm text-gray-700">
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    {reason}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(req.goodToKnow.notes || req.goodToKnow.officialSourceUrl) && (
            <Section title={fr ? 'Bon à savoir' : 'Good to know'} icon={InformationCircleIcon}>
              {req.goodToKnow.notes && (
                <p className="text-sm leading-relaxed text-gray-600">{req.goodToKnow.notes}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                {req.goodToKnow.officialSourceUrl && (
                  <a
                    href={req.goodToKnow.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    {fr ? 'Source officielle' : 'Official source'}
                  </a>
                )}
                {req.goodToKnow.lastVerifiedAt && (
                  <span>
                    {fr ? 'Informations vérifiées le ' : 'Information verified on '}
                    {new Date(req.goodToKnow.lastVerifiedAt).toLocaleDateString(fr ? 'fr-FR' : 'en-GB')}
                  </span>
                )}
              </div>
            </Section>
          )}

          <p className="text-xs text-gray-400">
            {fr
              ? "Ces informations sont indicatives et peuvent évoluer : confirmez toujours auprès de l'ambassade ou du site officiel avant de déposer votre dossier."
              : 'This information is indicative and may change: always confirm with the embassy or the official website before applying.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VisaChecker;
