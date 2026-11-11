# 1. Cosa può fare Claude Code, e cosa no

Le risposte valgono per questo progetto. Dove scrivo "provato" esiste codice in questo repository e un test o una prova nel browser che lo dimostra.

## 1.1 Cosa posso realizzare da solo

| Area | Posso farlo? | Stato in questo repository |
|---|---|---|
| Backend (API, logica di business) | Sì, da zero | **Provato**: `server/src/app.js`, 21 test automatici superati |
| Database (schema, query, indici, migrazioni) | Sì | **Provato**: `server/src/schema.sql` (SQLite), piano di passaggio a PostgreSQL in `03-database.md` |
| Registrazione e autenticazione | Sì | **Provato**: password con scrypt, token firmati HMAC, rate limit sul login, blocco dei minori |
| Chat in tempo reale | Sì | **Provato**: WebSocket, consegna istantanea, "sta scrivendo", conferme di lettura; un test invia 600 messaggi da un account Free |
| Algoritmo di matching | Sì | **Provato**: filtri reciproci, punteggio spiegabile, smorzamento della popolarità (`matching.js`) |
| AI per suggerimenti di conversazione | Sì | **Provato solo in parte**: la chiamata al modello Claude è scritta e raggiunge l'API (risposta 401 con chiave fittizia, poi fallback). **Una risposta reale non l'ho vista** perché qui non c'è una chiave API. Il fallback a regole locali funziona ed è testato |
| Pagamenti ricorrenti | Il codice sì; l'attivazione no | **Provato**: flusso simulato e verifica della firma dei webhook Stripe con idempotenza. **Non provato** contro i server Stripe: serve il tuo account |
| Verifica profili, antifrode, moderazione | Sì per il software; servono persone e fornitori | **Provato**: selfie con gesto casuale e revisione admin, filtro antitruffa sui messaggi, sospensione automatica dopo 3 segnalazioni, motivazione obbligatoria per ogni provvedimento |
| Pannello amministratore | Sì | **Provato**: KPI, segnalazioni, verifiche, foto, messaggi sospetti, gestione utenti |
| Web app | Sì | **Provato**: SPA mobile-first, provata in Chromium con emulazione iPhone |
| App Android e iOS | Il codice sì; la pubblicazione no | **Non fatto in questo prototipo**. Posso scrivere l'app in React Native/Expo riusando le stesse API, ma non posso compilare per iOS senza un Mac/EAS, firmare l'app con i tuoi certificati, né pubblicarla sugli store |
| Test, sicurezza, documentazione, CI | Sì | Test con `node:test`, controlli e documentazione in `docs/` |
| Business plan e simulazioni | Sì, come stima | `tools/scenari.js`: ipotesi esplicite e modificabili. Non è consulenza fiscale |

## 1.2 Cosa NON posso fare (e chi deve farlo)

- **Firmare contratti, aprire conti, essere il titolare**: account Apple Developer (99 $/anno) e Google Play (25 $ una tantum), Stripe, dominio, cloud, fornitore AI. Lo fai **tu**.
- **Agire sul mondo reale senza di te**: pubblicare sugli store, mandare in produzione, spendere budget pubblicitario. Lo faccio solo se mi dai accesso e autorizzazione esplicita, una cosa alla volta.
- **Testare con persone vere**: il product-market fit si misura con utenti reali. Servono test con utenti, beta chiusa ed eventi di lancio locali.
- **Moderare 24/7**: la moderazione dei contenuti di una dating app richiede **persone** (anche in outsourcing) e procedure. Il software filtra e mette in coda, ma la decisione finale spetta a una persona.
- **Garantire conformità legale**: posso preparare bozze tecniche e checklist, ma privacy policy, termini, DPIA, verifica del marchio e analisi brevetti vanno validati da **avvocato e DPO**.
- **Penetration test indipendente**: posso fare revisioni di sicurezza del codice, ma prima del lancio serve una verifica di terze parti.
- **Design di brand professionale**: posso produrre interfacce pulite (vedi `07-schermate.md`), ma logo e identità di marca di livello commerciale sono lavoro da designer.
- **Ricordare tra sessioni senza documentazione**: ogni sessione riparte dal repository. Per questo tutto è scritto in `docs/` e nei test.

## 1.3 Risposta alla domanda fondamentale

**Sì, possiamo costruire insieme il prodotto software fino a una versione pronta per il mercato.** La parte tecnica (backend, web, app mobile, matching, chat, pagamenti, moderazione, AI) è alla portata, e questo repository lo dimostra con codice funzionante e testato.

**Non posso garantire il successo commerciale.** Nelle dating app il rischio non è tecnico. Il rischio è avere abbastanza persone nello stesso posto nello stesso momento (la "liquidità" del mercato). Senza abbastanza profili vicini l'app è vuota e gli utenti se ne vanno. Il collo di bottiglia sono distribuzione, fiducia e budget di acquisizione, non il codice. Vedi `04-business-e-scenari.md`.
