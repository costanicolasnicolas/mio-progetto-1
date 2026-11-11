# 2. Architettura tecnica

## 2.1 Prototipo (questo repository)

Ho scelto componenti con zero infrastruttura, così il progetto parte con un comando e i test girano ovunque.

```
 Browser (SPA vanilla JS, mobile-first)            Pannello admin (/admin)
        │  HTTPS JSON          │ WebSocket /ws               │
        ▼                      ▼                             ▼
 ┌───────────────────────── Node.js 22 (un processo) ─────────────────────────┐
 │ router HTTP ─ auth (scrypt + token HMAC) ─ rate limit ─ header di sicurezza │
 │ profili · foto · matching · swipe/match · chat · blocchi · segnalazioni     │
 │ piani & limiti · pagamenti (mock | Stripe) · notifiche · admin · GDPR       │
 │ moderazione euristica · suggerimenti AI (Claude, fallback a regole)         │
 └──────────────┬──────────────────────────────┬──────────────────────────────┘
                ▼                              ▼
        SQLite (node:sqlite)          cartella uploads/ (foto)
```

Dipendenze: `ws` (WebSocket) e `@anthropic-ai/sdk` (AI). Tutto il resto usa la libreria standard di Node.

## 2.2 Architettura di produzione consigliata

Le scelte privilegiano servizi gestiti e tecnologie "noiose": un team piccolo non deve gestire server.

```
 App iOS / Android (React Native + Expo)      Web (Next.js o la SPA attuale)
            │                                          │
            ├──── API REST/JSON (HTTPS) ───────────────┤
            └──── WebSocket (chat, presenza) ──────────┘
                              │
                   CDN + WAF (Cloudflare)
                              │
          ┌──────── API stateless Node.js/TypeScript (container, autoscaling) ────────┐
          │  stessi moduli del prototipo, separati in servizi solo quando serve       │
          └───┬──────────┬──────────────┬───────────────┬──────────────┬─────────────┘
              ▼          ▼              ▼               ▼              ▼
       PostgreSQL    Redis          Object storage   Coda job       Servizi esterni
       + PostGIS     (sessioni WS,  (foto private,   (moderazione   · Stripe / RevenueCat
       (gestito)     pub/sub chat,  URL firmati,     foto, push,    · FCM / APNs (push)
                     rate limit,    ridimensiona-    email,         · verifica identità/liveness
                     contatori)     mento)           pulizie)       · moderazione immagini
                                                                     · API Claude
                                                                     · email transazionali
```

| Componente | Scelta | Motivo |
|---|---|---|
| Mobile | **React Native + Expo** (EAS Build) | Un solo codice per iOS e Android, TypeScript come il backend, build iOS in cloud senza Mac |
| Web | SPA esistente → Next.js se serve SEO per le landing | Riuso delle stesse API |
| API | Node.js + TypeScript (Fastify o NestJS) | Continuità con il prototipo, un solo linguaggio |
| Database | **PostgreSQL + PostGIS** gestito (Supabase, Neon, AWS RDS) | Query geografiche con indice GiST, transazioni, backup gestiti |
| Tempo reale | WebSocket + **Redis pub/sub** | Più istanze API: il messaggio arriva anche se i due utenti sono connessi a server diversi |
| Foto | Object storage (S3/R2) **privato** + URL firmati a scadenza + CDN | Le foto non devono essere pubbliche né indicizzabili |
| Pagamenti | **RevenueCat** (in-app Apple/Google) + **Stripe** (web) | Per i contenuti digitali venduti dentro l'app gli store richiedono di norma i loro sistemi di pagamento; RevenueCat unifica gli stati degli abbonamenti |
| Push | FCM (Android) + APNs (iOS) via Expo Notifications | Standard |
| Verifica identità | Fornitore di liveness/selfie (es. Veriff, Onfido, AWS Rekognition Face Liveness) | Il gesto casuale del prototipo è una base, ma non resiste ai deepfake |
| Moderazione foto | Classificatore automatico (es. AWS Rekognition, Hive) + coda umana | Nudità, minori, foto rubate (ricerca per immagini simili) |
| AI | API Claude con dati minimizzati e consenso | Vedi 2.4 |
| Osservabilità | Sentry (errori), log strutturati, metriche (Grafana/Datadog) | |
| CI/CD | GitHub Actions: test → build → deploy | Posso configurarla io |

## 2.3 Algoritmo di matching

1. **Filtri duri**: mai violati. Preferenze di genere reciproche, età dentro entrambe le forchette, distanza, blocchi in entrambe le direzioni, account attivo, profili già valutati esclusi, filtro "solo verificati".
2. **Punteggio spiegabile** (pesi in `matching.js`): distanza 25%, interessi in comune (Jaccard) 30%, attività recente 15%, completezza del profilo 10%, verifica 10%, reciprocità (ti ha già messo like) 10%.
3. **Equità di esposizione**: chi riceve molti like nelle ultime 24 ore viene smorzato fino a ×0,4. L'attenzione non si concentra su pochi profili e la maggior parte degli utenti riceve match.
4. **Trasparenza**: ogni carta mostra *perché* la vedi ("Interessi in comune", "Vicino a te"…). Serve anche come differenziazione di marketing.

Evoluzione: quando ci sono dati sufficienti (decine di migliaia di swipe), si aggiunge un modello che stima la probabilità di **conversazione reale** (non solo di like reciproco), si valuta con test A/B e si tengono i vincoli di equità.

## 2.4 AI: cosa fa e con quali regole

- **Suggerimenti di conversazione** (implementati): Claude riceve nome, interessi, bio troncata e ultimi 6 messaggi. **Mai** email, posizione, foto o orientamento. L'output è un JSON vincolato da schema. Se il modello rifiuta, va in errore o manca il consenso, si usano regole locali.
- **Modello**: di default `claude-opus-5-5` con effort `low`, configurabile con `AI_MODEL`. Ho attivato il fallback lato server sui rifiuti (`fallbacks: "default"`). Con il modello di default una chiamata costa circa 0,8 centesimi. Passare a `claude-haiku-5-5` riduce il costo di circa 40 volte (vedi le simulazioni): va valutato con un confronto di qualità.
- **Prossimi usi** (non implementati): punteggio di compatibilità sulle bio, classificatore antitruffa sui messaggi al posto delle sole regole, aiuto alla scrittura della bio, moderazione semantica delle segnalazioni.
- **Obblighi**: consenso esplicito (già nel prototipo), etichetta "contenuto generato automaticamente" (già nel prototipo), obblighi di trasparenza dell'AI Act (Reg. UE 2024/1689) da verificare con il legale.

## 2.5 Sicurezza già presente nel prototipo

Password con scrypt; token firmati con confronto a tempo costante; rate limit sul login; CSP restrittiva senza script inline; escape di tutto il testo utente (XSS); verifica dei magic bytes delle immagini (SVG degli utenti rifiutati); nomi file casuali; coordinate esatte mai esposte (solo distanza arrotondata); controllo di appartenenza al match su ogni messaggio; webhook di pagamento firmati e idempotenti; dati sensibili mai inviati all'AI.

**Da aggiungere in produzione**: refresh token revocabili, 2FA per gli admin, cifratura dei campi sensibili, foto servite solo con URL firmati, ruoli admin granulari con audit, rilevamento di account multipli/bot, penetration test esterno.
