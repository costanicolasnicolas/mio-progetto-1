# Sintonia: prototipo di dating app con messaggi illimitati e AI

> "Sintonia" è un **nome provvisorio**: prima di usarlo commercialmente va fatta una ricerca di anteriorità del marchio.
> Progetto originale: nessun codice, dato, asset o testo di Tinder o di altre app.

## Avvio rapido (Node.js ≥ 22.13)

```bash
cd dating-app/server
npm install
npm run seed      # 30 profili demo fittizi in Sicilia orientale
npm start         # http://localhost:3000   ·   admin: http://localhost:3000/admin
npm test          # 21 test automatici
```

Account demo: `demo@demo.local` / `password-demo-123` · Admin: `admin@demo.local` / `password-demo-123`

Variabili facoltative: `APP_SECRET` (firma dei token), `ANTHROPIC_API_KEY` (suggerimenti con Claude, altrimenti regole locali),
`AI_MODEL` (default `claude-opus-5-5`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PLUS`
(senza queste chiavi il pagamento è simulato).

## Cosa funziona già (provato)

Registrazione con blocco dei minori e consenso art. 9 GDPR · login sicuro · profilo, foto, interessi, posizione · verifica con selfie e gesto casuale ·
Scopri con matching spiegabile e filtri reciproci · like / pass / super like · match · **chat in tempo reale senza limiti di messaggi** ·
suggerimenti di conversazione (AI o regole) · notifiche · Free / Premium / Plus con limiti reali e pagamento simulato o Stripe ·
blocco e segnalazione · antifrode sui messaggi · sospensione automatica · pannello admin · esportazione e cancellazione dei dati.

## Documentazione

1. [Capacità e limiti di Claude Code](docs/01-capacita-e-limiti.md): la risposta alla domanda "possiamo farlo davvero?"
2. [Architettura tecnica](docs/02-architettura.md): prototipo, produzione, matching, AI, sicurezza
3. [Database](docs/03-database.md)
4. [Business, concorrenza e scenari 1k/10k/100k paganti](docs/04-business-e-scenari.md) (simulatore: `node tools/scenari.js`)
5. [Roadmap, tempi, budget, chi fa cosa](docs/05-roadmap.md)
6. [Rischi tecnici, legali e commerciali](docs/06-rischi.md)
7. [Schermate](docs/07-schermate.md)

## Struttura

```
dating-app/
├── server/
│   ├── src/        app.js (API+WebSocket) · matching.js · plans.js · payments.js · ai.js · moderation.js · auth.js · db.js · schema.sql · seed.js
│   ├── public/     index.html · app.js · styles.css (app web) · admin.html · admin.js
│   └── test/       api.test.js · matching.test.js
├── tools/scenari.js
└── docs/
```

## Limiti del prototipo (dichiarati)

SQLite e un solo processo (la produzione usa PostgreSQL+PostGIS e Redis) · foto servite da cartella locale (in produzione storage privato con URL firmati) ·
nessuna app nativa ancora (pianificata in React Native/Expo sulle stesse API) · Stripe e la chiamata AI reale non provati senza le tue chiavi ·
moderazione testuale a regole · verifica selfie con revisione manuale, senza liveness.
