import Anthropic from '@anthropic-ai/sdk';

/**
 * Suggerimenti di conversazione.
 * - Con ANTHROPIC_API_KEY (o altra credenziale Anthropic configurata): chiamata a Claude con output JSON vincolato.
 * - Senza credenziali o in caso di errore: fallback deterministico basato su interessi comuni.
 * Minimizzazione dei dati (GDPR art. 5): al modello vanno SOLO nome di battesimo, interessi,
 * bio troncata e gli ultimi messaggi; mai email, posizione, foto, orientamento dichiarato.
 * Serve il consenso esplicito dell'utente (users.consent_ai_at) e l'avviso "contenuto generato da AI".
 */

const MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
const hasCredentials = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
let client = null;

const SUGGESTION_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: { text: { type: 'string' }, why: { type: 'string' } },
        required: ['text', 'why'],
        additionalProperties: false,
      },
    },
  },
  required: ['suggestions'],
  additionalProperties: false,
};

const SYSTEM = `Sei il coach di conversazione di una app di incontri italiana.
Proponi 3 messaggi brevi (max 140 caratteri), naturali, rispettosi, in italiano, che l'utente può inviare.
Ancorali a interessi o dettagli reali dei profili. Niente doppi sensi, niente pressioni, niente complimenti sul corpo,
niente richieste di dati personali o di spostarsi su altre app. Il campo "why" spiega in poche parole perché funziona.`;

export function ruleBasedSuggestions({ me, other, history }) {
  const mine = new Set(me.interests);
  const shared = other.interests.filter((i) => mine.has(i));
  const out = [];
  if (shared.length) out.push({ text: `Ho visto che anche a te piace ${shared[0]}: com'è iniziata?`, why: 'Interesse in comune' });
  if (other.city) out.push({ text: `Un posto a ${other.city} che consiglieresti a chiunque?`, why: 'Domanda aperta sul luogo' });
  const extra = other.interests.find((i) => !mine.has(i));
  if (extra) out.push({ text: `Non so molto di ${extra}: da dove mi consigli di partire?`, why: 'Curiosità sincera per un suo interesse' });
  if (history.length === 0) out.push({ text: `Ciao ${other.name}! Qual è stata la parte migliore della tua settimana?`, why: 'Apertura semplice e personale' });
  out.push({ text: 'Weekend ideale: avventura o divano e film?', why: 'Domanda leggera a scelta' });
  return out.slice(0, 3);
}

export async function suggestMessages({ me, other, history }) {
  const fallback = () => ({ source: 'regole', suggestions: ruleBasedSuggestions({ me, other, history }) });
  if (!hasCredentials()) return fallback();
  client ??= new Anthropic();

  const context = {
    io: { nome: me.name, interessi: me.interests, bio: me.bio.slice(0, 300) },
    altra_persona: { nome: other.name, interessi: other.interests, bio: other.bio.slice(0, 300), citta: other.city },
    ultimi_messaggi: history.slice(-6).map((m) => ({ da: m.mine ? 'io' : other.name, testo: m.body.slice(0, 300) })),
  };

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SUGGESTION_SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(context) }],
    }, { timeout: 20_000 });

    if (response.stop_reason === 'refusal') return fallback();
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const parsed = JSON.parse(text);
    const suggestions = parsed.suggestions.slice(0, 3).map((s) => ({ text: s.text.slice(0, 200), why: s.why.slice(0, 120) }));
    return suggestions.length ? { source: 'ai', suggestions } : fallback();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn('[ai] rate limit, uso fallback');
    else if (err instanceof Anthropic.APIError) console.warn(`[ai] errore API ${err.status}, uso fallback`);
    else console.warn('[ai] errore, uso fallback:', err.message);
    return fallback();
  }
}
