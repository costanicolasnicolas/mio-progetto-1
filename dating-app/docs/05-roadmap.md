# 5. Piano operativo: dalla prima riga di codice al lancio

Tempi realistici per **te + Claude Code + alcuni professionisti esterni**, con te disponibile a tempo pieno o quasi.

| Fase | Durata | Obiettivo | Chi fa cosa |
|---|---|---|---|
| **0. Già fatto** | — | Prototipo web funzionante, test, architettura, business plan | Claude Code (questo repository) |
| **1. Validazione** | 2–4 settimane | Scegliere nicchia e città. Landing page con lista d'attesa. 20–30 interviste. Nome e verifica del marchio | **Tu**: interviste, decisioni, registrazione dominio. **Claude**: landing page, form, analisi delle risposte. **Avvocato**: ricerca anteriorità del marchio |
| **2. MVP di produzione** | 8–12 settimane | PostgreSQL+PostGIS, foto su storage privato, Redis, app React Native (iOS+Android), push, RevenueCat+Stripe in test, fornitore di verifica identità, moderazione foto, CI/CD, monitoraggio | **Claude**: quasi tutto il codice e i test. **Tu**: account (Apple, Google, Stripe, cloud, Anthropic), test sui tuoi telefoni, decisioni di prodotto. **Designer**: logo e identità di marca (1–2 settimane) |
| **3. Legale e sicurezza** | in parallelo, 4–6 settimane | Privacy policy, termini, DPIA (art. 35 GDPR), registro dei trattamenti, procedure DSA (segnalazioni e motivazioni), contratti con i fornitori (art. 28), penetration test | **Avvocato/DPO** e **società di sicurezza**. Claude prepara bozze tecniche, inventario dei dati e correzioni |
| **4. Beta chiusa** | 4–8 settimane | 300–1.000 utenti in **una** area, con equilibrio di genere curato (inviti, eventi). Misurare: conversazioni avviate, churn, conversione, CAC | **Tu**: community, eventi, partner locali, moderazione iniziale. **Claude**: correzioni rapide, dashboard delle metriche, test A/B |
| **5. Lancio commerciale** | 2–4 settimane | Pubblicazione sugli store, pagamenti reali, campagne locali, supporto | **Tu**: approvazione store, marketing, assistenza. **Claude**: rilasci, monitoraggio, correzioni |

**Totale realistico: 5–8 mesi** dalla validazione al lancio commerciale in una città. Meno di così significa saltare legale, sicurezza o beta: in una dating app è un errore grave (truffe, minori, dati sensibili).

## Budget

| Voce | Minimo (lean) | Consigliato |
|---|---:|---:|
| Account store, dominio, email | 200 € | 500 € |
| Legale: privacy, termini, DPIA, marchio, freedom-to-operate brevetti | 6.000 € | 20.000 € |
| Design di marca e UI | 2.000 € | 12.000 € |
| Penetration test | 4.000 € | 12.000 € |
| Cloud + AI + verifica identità (12 mesi, scala beta) | 4.000 € | 15.000 € |
| Moderazione (part-time, poi outsourcing) | 6.000 € | 30.000 € |
| Marketing di lancio locale (eventi, social, influencer locali) | 15.000 € | 80.000 € |
| Commercialista, costituzione SRL, assicurazione | 4.000 € | 10.000 € |
| Personale (sviluppatore senior part-time per revisione e reperibilità; community manager) | 0 € (solo founder) | 120.000 € |
| **Totale primo anno** | **≈ 41.000 €** | **≈ 300.000 €** |

Il minimo funziona solo se **tu** fai prodotto, community e moderazione iniziale, e io scrivo il codice. Con il budget consigliato si arriva a 2–3 città e a dati sufficienti per una raccolta fondi.

## Tecnologie

TypeScript ovunque · React Native + Expo (mobile) · Node.js (Fastify/NestJS) · PostgreSQL + PostGIS · Redis · S3/R2 + CDN · Stripe + RevenueCat · FCM/APNs · API Claude · Sentry · GitHub Actions · hosting gestito (Fly.io, Render, AWS o GCP).

## Cosa devi fare tu (non delegabile)

1. Scegliere nicchia, città, nome; costituire la società.
2. Aprire gli account a tuo nome: Apple Developer, Google Play, Stripe, cloud, Anthropic, fornitore di verifica identità.
3. Incaricare avvocato/DPO, commercialista, designer, penetration tester.
4. Reclutare i primi utenti e partner locali; organizzare eventi.
5. Decidere ogni rilascio in produzione e ogni spesa.
6. Garantire la moderazione umana, almeno all'inizio in prima persona.

## Prossimo passo concreto con me

Fase 2, primo blocco (1–2 settimane di lavoro con Claude Code): migrare a TypeScript + PostgreSQL/PostGIS mantenendo tutti i 21 test, aggiungere Redis per la chat multi-istanza e scrivere lo scheletro dell'app Expo con login, Scopri e chat collegati alle API esistenti.
