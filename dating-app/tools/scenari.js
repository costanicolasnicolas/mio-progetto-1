#!/usr/bin/env node
/**
 * Simulatore economico: 1.000 / 10.000 / 100.000 utenti PAGANTI, regime stazionario mensile → annuo.
 * Tutte le ipotesi sono qui sotto: modificale e rilancia `node tools/scenari.js`.
 * Le stime fiscali sono SEMPLIFICATE (SRL italiana, IRES 24% + IRAP 3,9% su base approssimata = EBIT):
 * vanno validate da un commercialista. Le cifre non sono una promessa di risultato.
 */

const A = {
  iva: 0.22,                         // prezzi al consumatore IVA inclusa
  mix: { premium: { price: 9.99, share: 0.7 }, plus: { price: 19.99, share: 0.3 } },
  storeShare: 0.6,                   // quota di abbonamenti venduti tramite App Store / Google Play
  stripePct: 0.015 + 0.007, stripeFixed: 0.25, // carta EEA standard + Stripe Billing (verificare tariffe vigenti)
  paidConversion: 0.05,              // paganti / utenti attivi mensili (MAU)
  churnPaid: 0.15,                   // abbonati persi ogni mese (strutturale: chi trova qualcuno se ne va)
  aiCostPerCall: 0.008,              // € per suggerimento (≈600 token in + 300 out su claude-opus-5-5; ~40x meno su claude-haiku-5-5)
  aiCallsPerPayer: 30, aiCallsPerFree: 3,
  ires: 0.24, irap: 0.039,
};

const SCENARI = [
  { nome: '1.000 paganti',   payers: 1_000,   storeFee: 0.15, infraFixed: 400,    infraPerMau: 0.040, tsPerMau: 0.030, team: 7_000,   gna: 1_500,  cac: 30 },
  { nome: '10.000 paganti',  payers: 10_000,  storeFee: 0.15, infraFixed: 2_000,  infraPerMau: 0.035, tsPerMau: 0.025, team: 55_000,  gna: 6_000,  cac: 28 },
  { nome: '100.000 paganti', payers: 100_000, storeFee: 0.22, infraFixed: 10_000, infraPerMau: 0.030, tsPerMau: 0.020, team: 260_000, gna: 30_000, cac: 25 },
];
// storeFee: 15% sotto ~1 M$/anno (programmi small business) e sugli abbonamenti oltre il primo anno; mix più alto su scala.
// team: costo aziendale mensile del personale (1: founder + freelance; 2: ~9 persone; 3: ~40 persone).
// cac: costo medio per nuovo PAGANTE, già mediato tra canali a pagamento e passaparola.

const NF = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0, useGrouping: 'always' });
const eur = (x) => (x < 0 ? '−' : '') + '€ ' + NF.format(Math.round(Math.abs(x)));

function simula(s, over = {}) {
  const a = { ...A, ...over };
  const sc = { ...s, ...over };
  const mau = sc.payers / a.paidConversion;
  const grossPerPayer = a.mix.premium.price * a.mix.premium.share + a.mix.plus.price * a.mix.plus.share;
  const grossM = sc.payers * grossPerPayer;                 // incassato dai clienti, IVA inclusa
  const ricaviM = grossM / (1 + a.iva);                      // fatturato netto IVA
  const storeFeesM = ricaviM * a.storeShare * sc.storeFee;
  const webPayers = sc.payers * (1 - a.storeShare);
  const stripeM = ricaviM * (1 - a.storeShare) * a.stripePct + webPayers * a.stripeFixed;
  const infraM = sc.infraFixed + mau * sc.infraPerMau;
  const aiM = (sc.payers * a.aiCallsPerPayer + (mau - sc.payers) * a.aiCallsPerFree) * a.aiCostPerCall;
  const tsM = mau * sc.tsPerMau;                              // moderazione, verifica identità, supporto
  const mktM = sc.payers * a.churnPaid * sc.cac;              // solo per RIMPIAZZARE chi se ne va (crescita zero)
  const costiM = storeFeesM + stripeM + infraM + aiM + tsM + mktM + sc.team + sc.gna;
  const ebitY = (ricaviM - costiM) * 12;
  const ires = Math.max(0, ebitY) * a.ires;
  const irap = Math.max(0, ebitY) * a.irap;
  return {
    mau, ricaviY: ricaviM * 12, ivaY: (grossM - ricaviM) * 12,
    voci: { 'Commissioni store': storeFeesM, 'Commissioni Stripe': stripeM, 'Infrastruttura cloud': infraM, 'AI (API)': aiM,
      'Trust & safety / supporto': tsM, 'Marketing (rimpiazzo churn)': mktM, 'Personale': sc.team, 'Legale, contabile, assicurazioni': sc.gna },
    costiY: costiM * 12, ebitY, ires, irap, utileNettoY: ebitY - ires - irap,
  };
}

const rows = SCENARI.map((s) => [s, simula(s)]);
let md = `| Voce (annua) | ${rows.map(([s]) => s.nome).join(' | ')} |\n|---|${rows.map(() => '---:').join('|')}|\n`;
md += `| Utenti attivi mensili (MAU) stimati | ${rows.map(([, r]) => NF.format(Math.round(r.mau))).join(' | ')} |\n`;
md += `| IVA incassata e versata (non è ricavo) | ${rows.map(([, r]) => eur(r.ivaY)).join(' | ')} |\n`;
md += `| **Fatturato (netto IVA)** | ${rows.map(([, r]) => '**' + eur(r.ricaviY) + '**').join(' | ')} |\n`;
for (const k of Object.keys(rows[0][1].voci)) md += `| − ${k} | ${rows.map(([, r]) => eur(r.voci[k] * 12)).join(' | ')} |\n`;
md += `| **Costi totali** | ${rows.map(([, r]) => '**' + eur(r.costiY) + '**').join(' | ')} |\n`;
md += `| **Utile ante imposte (EBIT)** | ${rows.map(([, r]) => '**' + eur(r.ebitY) + '**').join(' | ')} |\n`;
md += `| − IRES 24% (stima) | ${rows.map(([, r]) => eur(r.ires)).join(' | ')} |\n`;
md += `| − IRAP 3,9% (stima, base approssimata) | ${rows.map(([, r]) => eur(r.irap)).join(' | ')} |\n`;
md += `| **Utile netto** | ${rows.map(([, r]) => '**' + eur(r.utileNettoY) + '**').join(' | ')} |\n`;
md += `| Margine netto su fatturato | ${rows.map(([, r]) => ((r.utileNettoY / r.ricaviY) * 100).toFixed(1) + '%').join(' | ')} |\n`;

let sens = `\n**Sensibilità dell'utile ante imposte annuo (scenario 10.000 paganti) a churn mensile e CAC:**\n\n| churn \\ CAC | €15 | €28 | €45 | €70 |\n|---|---:|---:|---:|---:|\n`;
for (const churn of [0.08, 0.15, 0.25]) sens += `| ${churn * 100}% | ${[15, 28, 45, 70].map((cac) => eur(simula(SCENARI[1], { churnPaid: churn, cac }).ebitY)).join(' | ')} |\n`;

const be = (() => { // pareggio con struttura dello scenario 1
  for (let p = 100; p < 50_000; p += 50) if (simula({ ...SCENARI[0], payers: p }).ebitY >= 0) return p;
  return null;
})();

console.log(md + sens + `\nPareggio operativo con la struttura di costi dello scenario 1: circa **${NF.format(be)} paganti**.`);
console.log(`\nIpotesi: ${JSON.stringify(A)}`);
