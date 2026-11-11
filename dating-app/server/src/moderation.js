/**
 * Moderazione testuale euristica (v1). NON blocca i messaggi (niente limiti artificiali):
 * li segnala per revisione e mostra un avviso di sicurezza al destinatario.
 * In produzione va affiancata da un classificatore (es. modello AI) e da moderatori umani.
 */
const RULES = [
  { reason: 'richiesta_denaro',  re: /\b(bonifico|ricarica|postepay|western union|moneygram|prestit[oi]|mandami (dei )?soldi|gift ?card|iban)\b/i },
  { reason: 'investimenti_crypto', re: /\b(crypto|bitcoin|btc|usdt|trading|forex|investiment[oi]|rendimento garantito)\b/i },
  { reason: 'fuori_piattaforma', re: /\b(whats ?app|telegram|signal|snap(chat)?|scrivimi (su|al))\b/i },
  { reason: 'link_esterno',      re: /\bhttps?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}/i },
  { reason: 'numero_telefono',   re: /(\+?\d[\s.-]?){9,}/ },
];

export function classifyMessage(text) {
  const reasons = RULES.filter((r) => r.re.test(text)).map((r) => r.reason);
  return reasons.length ? reasons.join(',') : null;
}

export const AUTO_SUSPEND_REPORTS = 3; // segnalazioni da utenti distinti → sospensione cautelativa
