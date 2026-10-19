/**
 * Vérification du moteur de prix contre la grille en ligne (GET /api/pricing).
 * Lancement : npx tsx scripts/pricing-check.ts [url de l'API]
 * Sortie non nulle si un cas échoue. Ce n'est pas un test unitaire du build (pas de
 * framework de test dans le projet) : c'est un contrôle à relancer après chaque
 * changement de grille en admin.
 */
import { formatEuros, offerForTier, paymentPlan, PricingData, quoteSelection } from '../src/pricing/pricingEngine';

const API = process.argv[2] ?? 'https://midzobackend.vercel.app/api';
let failures = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — obtenu ${JSON.stringify(got)}, attendu ${JSON.stringify(want)}`}`);
};

(async () => {
  const data: PricingData = await (await fetch(`${API}/pricing`)).json();
  const q = (codes: string[]) => quoteSelection(codes, data);
  const best = (codes: string[]) => q(codes).recommended;
  const opt = (n: number) => data.payment_options.find(o => o.installments === n)!;

  // Prix unitaires et totaux de la grille
  eq('Total études à l’unité = 1 570 €', q(data.services.filter(s => s.family === 'study').map(s => s.code)).valueCents, 157000);
  eq('Total tourisme à l’unité = 810 €', q(data.services.filter(s => s.family === 'tourism').map(s => s.code)).valueCents, 81000);

  // À la carte quand c'est moins cher
  eq('1 service à 40 € (vol) → à la carte 40 €', [best(['S1'])?.id, best(['S1'])?.priceCents], ['alacarte', 4000]);
  eq('S1+S2 = 100 € → à la carte (Start à 180 € plus cher)', best(['S1', 'S2'])?.id, 'alacarte');

  // Paliers études
  eq('S9+S10 = 430 € → Study Plus 550 € ? non : plus cher, à la carte', best(['S9', 'S10'])?.id, 'alacarte');
  eq('S5+S8 = 300 € (2 services) → Study Essential 350 € ? non, à la carte 300 €', best(['S5', 'S8'])?.priceCents, 30000);
  eq('S8+S9+S11 = 610 € → Study Plus 550 €', [best(['S8', 'S9', 'S11'])?.id, best(['S8', 'S9', 'S11'])?.priceCents], ['study-plus', 55000]);
  eq('S3+S4+S5+S9 = 490 € → Study Plus 550 € ? non, à la carte 490 €', best(['S3', 'S4', 'S5', 'S9'])?.id, 'alacarte');
  eq('6 services S6..S11 = 1 160 € → Study FULL 1 290 € ? non ; Premium plafond 1 000 € dépassé → à la carte', best(['S6', 'S7', 'S8', 'S9', 'S10', 'S11'])?.id, 'alacarte');
  eq('S1..S9 (9 services, 1 070 €) → Study Premium ? plafond 1 000 € dépassé → à la carte 1 070 €', best(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'])?.priceCents, 107000);
  const allStudy = data.services.filter(s => s.family === 'study').map(s => s.code);
  eq('Les 11 services études → Study FULL 1 290 € (économie 280 €)', [best(allStudy)?.id, best(allStudy)?.priceCents, best(allStudy)?.savingsCents], ['study-full', 129000, 28000]);
  eq('S1+S5+S8 (340 €) : Study Essential 350 € plus cher → à la carte', best(['S1', 'S5', 'S8'])?.id, 'alacarte');
  eq('S3+S5+S8 (390 €, 3 services) → Study Essential 350 €', [best(['S3', 'S5', 'S8'])?.id, best(['S3', 'S5', 'S8'])?.savingsCents], ['study-essential', 4000]);

  // Paliers tourisme
  const allTourism = data.services.filter(s => s.family === 'tourism').map(s => s.code);
  eq('Les 10 services tourisme → Tourism FULL 670 € (économie 140 €)', [best(allTourism)?.id, best(allTourism)?.priceCents], ['tourism-full', 67000]);
  eq('T6+T10 (240 €) → Tourism Essential 250 € ? non, à la carte 240 €', best(['T6', 'T10'])?.id, 'alacarte');
  eq('T6+T8+T9 (330 €, 3 services) → plafond Essential 300 € dépassé ; Plus 410 € plus cher → à la carte', best(['T6', 'T8', 'T9'])?.id, 'alacarte');
  eq('T5+T6+T7 (250 €) → à la carte ; Tourism Essential 250 € non moins cher', best(['T5', 'T6', 'T7'])?.priceCents, 25000);
  eq('T1+T5+T6+T7 (290 €, 4 services) → Tourism Essential 250 €', best(['T1', 'T5', 'T6', 'T7'])?.id, 'tourism-essential');

  // Mix
  const all = [...allStudy, ...allTourism];
  eq('Tous les services (2 380 €) → Mix XXL 1 690 € (économie 690 €)', [best(all)?.id, best(all)?.priceCents, best(all)?.savingsCents], ['mix-xxl', 169000, 69000]);
  eq('S9+S10 + T6 (520 €) → Mix Essential 620 € ? non ; à la carte 520 €', best(['S9', 'S10', 'T6'])?.priceCents, 52000);
  eq('S8+S9+S11 + T6+T8 (820 €) → Mix Premium ? 1 090 € plus cher ; Study Plus 550 + Tourism à la carte 210 = 760 €', [best(['S8', 'S9', 'S11', 'T6', 'T8'])?.id, best(['S8', 'S9', 'S11', 'T6', 'T8'])?.priceCents], ['study-plus+tourism-alacarte', 76000]);
  eq('S3+S5+S8 + T1 (430 €) → Mix Essential ? 620 € > ; Study Essential 350 + T1 40 = 390 €', best(['S3', 'S5', 'S8', 'T1'])?.priceCents, 39000);
  eq('Un palier Mix exige les deux familles', q(allStudy).offers.some(o => o.lines.some(l => l.kind === 'mix')), false);

  // Palier imposé
  eq('Palier imposé couvrant la sélection → trouvé', offerForTier(q(['S3', 'S5', 'S8']), 'study-essential')?.priceCents, 35000);
  eq('Palier imposé ne couvrant pas (Start, 3 services) → null', offerForTier(q(['S3', 'S5', 'S8']), 'study-start'), null);

  // Options de paiement (exemple de la grille : Mix XXL 1 690 €)
  eq('1× : −10 % → 1 521 €', paymentPlan(169000, opt(1)), { installments: 1, discountPct: 10, perInstallmentCents: 152100, totalCents: 152100 });
  eq('3× : −5 % → 535 € × 3', [paymentPlan(169000, opt(3)).perInstallmentCents, paymentPlan(169000, opt(3)).totalCents], [53500, 160500]);
  eq('6× : −2 % → 276 € × 6', [paymentPlan(169000, opt(6)).perInstallmentCents, paymentPlan(169000, opt(6)).totalCents], [27600, 165600]);
  eq('12× : −1 % → 139 € × 12', [paymentPlan(169000, opt(12)).perInstallmentCents, paymentPlan(169000, opt(12)).totalCents], [13900, 166800]);

  // Voyageurs : services voyage par dossier, N inclus, +X % par voyageur supplémentaire
  const policy = data.traveler_policy ?? { included: 2, extra_pct: 25 };
  const tour = ['T1', 'T2', 'T3', 'T4'];
  const base2 = quoteSelection(tour, data, { travelers: policy.included }).recommended!;
  const base1 = quoteSelection(tour, data, { travelers: 1 }).recommended!;
  const four = quoteSelection(tour, data, { travelers: policy.included + 2 }).recommended!;
  eq(`Tourisme : 1 voyageur = ${policy.included} voyageurs (inclus)`, base1.priceCents, base2.priceCents);
  eq(`Tourisme : ${policy.included + 2} voyageurs → +${2 * policy.extra_pct} %`, four.priceCents, Math.round(base2.priceCents * (1 + 2 * policy.extra_pct / 100) / 100) * 100);
  eq('Études : le nombre de voyageurs ne change rien', quoteSelection(['S8', 'S9', 'S11'], data, { travelers: 6 }).recommended?.priceCents, 55000);
  const mix2 = quoteSelection([...allStudy, 'T1', 'T2'], data, { travelers: 2 }).recommended!;
  const mix5 = quoteSelection([...allStudy, 'T1', 'T2'], data, { travelers: 5 }).recommended!;
  eq('Mix : seule la part voyage augmente (prix 5 voyageurs > 2 voyageurs, < +75 %)', mix5.priceCents > mix2.priceCents && mix5.priceCents < mix2.priceCents * 1.75, true);

  // Robustesse
  eq('Sélection vide → pas d’offre', best([]), null);
  eq('Code inconnu ignoré et signalé', q(['S1', 'X99']).unknownCodes, ['X99']);
  eq('Doublon compté une fois', q(['S1', 'S1']).valueCents, 4000);
  console.log(`\n${failures ? `✗ ${failures} échec(s)` : '✓ tous les cas passent'} — exemple : ${formatEuros(169000)}`);
  process.exitCode = failures ? 1 : 0;
})();
