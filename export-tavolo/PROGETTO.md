# Progetto Tavolo: documento completo

Versione del 27 novembre 2026. Il documento raccoglie le conclusioni del Collegio J.A.R.V.I.S. (round 1 e 2) e il piano tecnico per costruire sito e app con Claude Code.

"Tavolo" è un nome di lavoro, da verificare nelle banche dati dei marchi prima di usarlo.

Legenda:
- [V] = dato con fonte controllata
- [S] = stima o ipotesi da validare
- [NV] = norma o dato non verificato sul testo ufficiale

Report online collegati:
- Business plan: https://claude.ai/artifact/7RhfBuxeuUNSViN6itjrLU
- Piano di lancio Italia: https://claude.ai/artifact/SBdd6b8fENewdUzJ55FCEp

---

## 1. Il progetto in una pagina

**Cos'è.** Un servizio di incontri dal vivo per adulti dai 30 anni in su. Nessuno swipe e nessuna chat infinita. L'utente riceve da 1 a 3 proposte al giorno, sceglie un locale convenzionato tra tre e incontra l'altra persona davanti a un drink.

**Per chi.** Adulti dai 30 ai 60 anni. "Ricominciare dopo una separazione" è il racconto del brand, non un filtro di accesso.

**Come guadagna.** 15 EUR a persona per incontro, con una consumazione a testa inclusa: circa 7,50 EUR vanno al locale. Si paga **solo dopo l'incontro avvenuto**. A questo si aggiungono le serate di gruppo a 15-20 EUR.

**Come parte.**
- Lista d'attesa nazionale.
- Apertura di **una città alla volta**: prima Catania come laboratorio, poi Milano, Bologna, Roma.
- Una città apre con almeno **450 iscritti verificati**.

**Cosa lo distingue da Breeze.**
- Pagamento solo dopo l'incontro.
- Garanzia: se l'altra persona non si presenta, non paghi e hai un incontro in omaggio.
- Scelta tra 3 locali invece di uno.
- Profilo di 5 domande più una nota vocale.

**Numeri chiave** [S]:

| Voce | Valore |
|---|---|
| Margine per persona per incontro | 4,30-7,00 EUR |
| Validazione senza partita IVA | sotto 5.000 EUR |
| Prima città aperta | circa 13.000 EUR (si scende verso 10.000 partendo dalla web app) |
| Pareggio, scenario base | mese 33-36 |
| Web app con pagamenti | 12-16 settimane |
| App sugli store, solo piano Pro | circa 10 mesi |

---

## 2. Regole del prodotto

### 2.1 Flusso utente

1. **Lista d'attesa.** L'utente lascia telefono, città, età ed email. Vede il contatore della città (es. "Catania: 312 su 450") e un link per invitare altre persone.
2. **Verifica.** Codice via SMS, CAPTCHA invisibile, limiti per dispositivo. I casi dubbi passano a revisione manuale.
3. **5 domande rapide.** Cosa cerchi, età, zona, sere disponibili, figli sì o no.
4. **Nota vocale facoltativa** di 2-3 minuti, per esempio "Raccontaci cosa ti fa stare bene con una persona".
   - La voce viene trascritta e l'utente rilegge e corregge il testo.
   - L'AI scrive un breve ritratto con l'etichetta "Riassunto generato da IA, modificabile da te".
   - L'audio si cancella entro 24-72 ore dalla conferma.
5. **Proposte del giorno.** Da 1 a 3, alle 19:00. Ogni proposta contiene foto, età, zona, 2-3 righe e il motivo dell'abbinamento. Le proposte scadono e non si accumulano.
6. **Abbinamento.** Se entrambi dicono sì, si sceglie tra 3 locali e 3 fasce orarie.
7. **Carta salvata.** Al momento dell'abbinamento l'utente salva la carta con autenticazione forte. Nessun addebito.
8. **Chat.** Si apre 2 ore prima dell'incontro e si chiude dopo.
9. **Incontro.** Entrambi scansionano il QR al locale (doppio check-in). Solo a quel punto parte l'addebito di 15 EUR.
10. **Recap il giorno dopo.** Facoltativo, massimo 3 domande, scritto o vocale. Serve per puntualità, rispetto ed eventuali segnalazioni.

### 2.2 Regole operative

| Regola | Dettaglio |
|---|---|
| Un incontro alla volta | Nessuna nuova proposta finché l'incontro non avviene o viene annullato |
| L'altro non si presenta | Non paghi; ricevi un incontro in omaggio oppure il rimborso, a tua scelta |
| Tu non ti presenti senza avvisare 24 ore prima | I 15 EUR restano dovuti, salvo giustificato motivo |
| Due cancellazioni di fila | Pausa di 7 giorni dalle nuove proposte, con motivazione scritta e possibilità di contestare |
| Blocchi e sospensioni | Sempre motivati e rivisti da una persona (DSA art. 17, GDPR art. 22) |
| Reputazione visibile | Al massimo 3 segnali positivi (es. "Identità verificata", "Sempre puntuale"), mai voci negative |
| Prenotazione al locale | A nome discreto o con un codice, mai "tavolo dell'app di incontri" |

### 2.3 Regola d'età

- **Intervallo = 15% dell'età, con un minimo di 3 anni.** Esempi:

| Età | Intervallo | Vede profili tra |
|---|---|---|
| 22 | ±3 | 19-25 |
| 30 | ±5 | 25-35 |
| 40 | ±6 | 34-46 |
| 50 | ±8 | 42-58 |

- **Blocco di sicurezza:** chi ha tra 18 e 25 anni non viene mai abbinato con chi ne ha più di 35.
- La regola vale in entrambe le direzioni.
- L'utente può restringere l'intervallo, non allargarlo oltre il limite.
- Nelle città con pochi iscritti, dopo N giorni senza proposte, l'intervallo si allarga di 1-2 anni.

### 2.4 Rimborso: clausola da far rivedere a un avvocato

> Se l'incontro non avviene per cause non imputabili a te (assenza dell'altra persona, indisponibilità del locale, cancellazione da parte nostra), ti restituiamo l'importo sullo stesso metodo di pagamento entro 14 giorni oppure, a tua scelta, lo trasformiamo in un credito di pari valore valido almeno 12 mesi e rimborsabile a richiesta. Se non ti presenti senza avvisare almeno 24 ore prima, l'importo resta dovuto salvo giustificato motivo.

### 2.5 Parole da usare e da evitare

- **Mai** "gratis". È vietato se poi si paga (Cod. Consumo art. 23 lett. v [V]).
- **Usa** "Iscrizione senza costi. Paghi 15 EUR solo dopo l'incontro."
- Il pulsante di pagamento deve dire "ordine con obbligo di pagare" o una formula equivalente (art. 51 c. 2 [V]).
- Non usare "caparra" (art. 1385 c.c.).
- Di' "consumazione", non "drink alcolico", e prevedi sempre un'alternativa analcolica.

---

## 3. Mercato e concorrenti

| Fatto | Stato |
|---|---|
| Tinder: 9,26 mln di utenti paganti nel Q3 2025; gruppo Match: 14,5 mln (-5%) | [V] |
| Bumble: ricavi -10%, paganti -16% nel Q3 2025 | [V] |
| FTC contro Match Group: accordo da 14 mln USD (agosto 2025) su pubblicità ingannevole e disdetta difficile | [V] |
| Breeze: partito solo a Delft e Leiden, poi 6 città, poi BE, DE, UK, FR e New York; oltre 300.000 incontri | [V parziale] |
| Breeze su Trustpilot: 2,0 su 5 (152 recensioni). Critiche su costo, poca scelta di drink e luoghi, annullamenti | [V] |
| Known (USA): circa 9,7 mln USD raccolti, solo San Francisco, 30 USD a testa, intervista vocale AI | [V parziale] |
| Separazioni in Italia nel 2023: 82.392; divorzi: 79.875 (ISTAT) | [V] |

**Tre lezioni da Breeze.**
1. La densità di utenti viene prima della copertura geografica.
2. L'annullamento all'ultimo momento è la prima causa di recensioni negative.
3. Il pagamento anticipato a gettoni viene percepito come caro.

---

## 4. Modello economico

### 4.1 Margine per incontro, per persona

| Voce | Unica prestazione IVA 22% | Mandato, regime ordinario | Mandato, forfettario |
|---|---|---|---|
| Pagato dall'utente | 15,00 | 15,00 | 15,00 |
| Consumazione al locale | -7,50 | -7,50 | -7,50 |
| IVA a tuo carico | -2,70 | -1,35 | 0 |
| Stripe | -0,47 | -0,47 | -0,47 |
| **Margine** | **4,33** | **5,68** | **7,03** |

**Attenzione.** Con 2 drink *a testa* il margine diventa negativo. Il modello regge solo con 15 EUR a persona e una consumazione a testa.

### 4.2 Prezzi

- 15 EUR a incontro, pagati dopo.
- Serate di gruppo a 15-20 EUR.
- Nessun abbonamento al lancio.
- Dopo il mese 6, eventualmente una membership da 9,90 EUR al mese senza incontri inclusi, disdicibile in un clic.

### 4.3 Scenari a 36 mesi (dal business plan) [S]

| | Prudente | Base | Ottimista |
|---|---|---|---|
| Utenti attivi a M12 / M36 | 250 / 350 | 450 / 1.500 | 900 / 4.000 |
| Incontri per attivo al mese | 0,5 | 0,7 | 0,9 |
| Risultato operativo mensile a M36 | -1.855 EUR | +350 EUR | +16.000 EUR |
| Pareggio | mai | mese 33-36 | mese 10-12 |

La leva decisiva è **quanti incontri fa ogni utente**, non il prezzo.

---

## 5. Lancio

### 5.1 Fasi

| Fase | Periodo [S] | Cosa | Per andare avanti |
|---|---|---|---|
| 0. Validazione | settimane 1-6 | Pagina con lista d'attesa, 60 locali in elenco, 10 visitati, prima serata di prova | Almeno 3 locali interessati, 300 iscritti, almeno 60 persone alla serata |
| 1. Demo cliccabile | settimane 2-4 | Schermate finte da mostrare a locali e creator | Locali e creator capiscono il servizio in 1 minuto |
| 2. Web app senza pagamenti | settimane 5-12 | Iscrizione, verifica, profilo, proposte, abbinamento, QR | Beta con 20-50 persone a Catania |
| 3. Web app con pagamenti | settimane 12-16 | Carta salvata, addebito al check-in, rimborsi | Margine positivo per incontro |
| 4. Professionisti | in parallelo | DPIA, termini d'uso, privacy, contratti, commercialista, SUAP | Pareri scritti prima di raccogliere dati reali |
| 5. App sugli store | dopo la validazione | Expo per iOS e Android | La città funziona già sul web |

### 5.2 Locali: i primi 30-40 per città

Come sceglierli:
- Parti da 60 candidati e visitali di persona.
- Zona centrale, recensioni Google da 4,2 in su con almeno 100 voti.
- Prezzo medio, ambiente tranquillo, locale vuoto tra martedì e giovedì.
- Titolare raggiungibile.

Cosa dire:
> "Porto clienti nuovi dal martedì al giovedì, quando il locale è più vuoto. Non c'è nessun costo fisso e nessuno sconto: ogni coppia consuma due drink a prezzo concordato e arriva già prenotata. Per iniziare vi mando 4-6 coppie al mese. Proviamo un mese, e se non vi conviene chiudiamo senza problemi."

Cosa deve dire la convenzione scritta:
- tavolo garantito;
- prezzo della consumazione e pagamento mensile;
- assicurazione RC del locale;
- divieto di usare i dati dei clienti;
- penale se il tavolo non c'è;
- clausole onerose firmate due volte (art. 1341 c.c.).

### 5.3 La prima serata

- Un locale, una data, 16-20 posti divisi a metà tra uomini e donne.
- Iscrizione dalla pagina; la serata si fa solo se si raggiunge il minimo di iscritti.
- È il primo "prodotto" vero da far raccontare ai creator.

### 5.4 Creator da 30.000 a 150.000 follower

- Non si sponsorizza un sito: si promuove una serata vera, con data, locale e posti limitati.
- Tariffe di mercato [S]: storia 100-250 EUR, post 350-1.000 EUR. Per 15 creator in una città sono circa 10.000 EUR, quindi non sostenibile.
- Cosa offrire invece:
  - serata come ospite più un accompagnatore;
  - codice personale per i follower;
  - 1-2 EUR per iscritto verificato [S];
  - eventualmente 1 EUR a persona per ogni incontro dei suoi follower [S].
- Nicchie da provare: food della città, lifestyle locale, relazioni, comici locali, creator con più di 35 anni.
- **Obbligo:** ogni contenuto va segnalato come pubblicità ("#adv", "in collaborazione con"), anche se è uno scambio.

Messaggio di contatto:
> "Ciao [nome], sono [nome], sto aprendo a [città] un servizio di incontri dal vivo: un profilo al giorno, niente chat infinite, un drink in un locale della città. Il [data] facciamo la prima serata al [locale]. Ti invito come ospite con un'altra persona: se ti piace la racconti, ti do un codice per i tuoi follower e 1 EUR per ogni iscritto verificato che arriva da te. Ti va?"

### 5.5 Ordine delle città

1. Catania
2. Milano
3. Bologna
4. Roma
5. Torino e Napoli
6. Firenze e Palermo

La lista d'attesa è nazionale. Ogni città apre solo con **450 iscritti verificati**, di cui almeno il 40% del genere meno numeroso.

---

## 6. Legale e fiscale: checklist

**Richiede validazione umana prima dell'attuazione.** Verificare con avvocato, consulente privacy e commercialista abilitati.

### 6.1 Privacy e AI

- [ ] DPIA prima di raccogliere dati reali (GDPR art. 35).
- [ ] Registro dei trattamenti (art. 30).
- [ ] Consenso esplicito separato per i dati sensibili (art. 9).
  - La preferenza di genere rivela l'orientamento sessuale (CGUE C-184/20 [V parziale]).
  - Caso Grindr: 65 mln NOK di sanzione in Norvegia [V parziale].
- [ ] Audio cancellato dopo la trascrizione; nessuna deduzione di emozioni dalla voce.
- [ ] Avviso "stai usando un'AI" (AI Act art. 50, dal 2 agosto 2026 [V parziale]).
- [ ] Fornitori AI con contratto ex art. 28, divieto di addestramento sui dati, garanzie per i trasferimenti fuori UE.
- [ ] Niente confronto biometrico del volto al lancio. Se lo si introduce dopo: consenso, alternativa per chi non vuole, DPIA.
- [ ] Solo maggiorenni: data di nascita con blocco e controllo documento a campione.

### 6.2 Consumatori

- [ ] Prezzo totale visibile prima dell'abbinamento (art. 49).
- [ ] Recesso escluso solo per l'incontro a data fissa (art. 59 lett. n [V]), da comunicare in modo chiaro.
- [ ] Nessuna penale eccessiva (art. 33 c. 2 lett. f [NV sul testo]).
- [ ] Rimborso in denaro quando la colpa non è dell'utente.

### 6.3 Piattaforma

- [ ] Procedura di segnalazione e motivazione dei blocchi (DSA art. 17).
- [ ] Pulsante segnala e blocca (richiesto anche da Apple, regola 1.2 [V parziale]).
- [ ] Chiedere al SUAP del Comune se serve la pratica come agenzia d'affari (art. 115 TULPS) [V parziale].

### 6.4 Concorrenti e marchio

- [ ] Ispirarsi alle idee di Breeze e Known sì; copiare testi, grafica, icone, nome e interfaccia riconoscibile no (art. 2598 c.c.).
- [ ] Conservare le bozze con le date come prova di creazione indipendente.
- [ ] Marchio: UIBM 101 EUR per una classe più 34 EUR per ogni classe in più [V parziale]; poi EUIPO entro 6 mesi mantenendo la priorità. Classi consigliate: 9, 35, 41, 42, 45.

### 6.5 Fisco

- [ ] **Forfettario dal 2027.** Le regole della L. 190/2014 risultano abrogate dal D.Lgs. 117/2026 dal 1° gennaio 2027; il regime passa negli artt. 231-243 [NV: testo non letto]. Soglia, aliquota del 5% e requisiti vanno confermati dal commercialista.
- [ ] **Resto al Sud 2.0** (under 35, Sicilia ammessa). Secondo le fonti la partita IVA va aperta nel mese precedente o nello stesso mese della domanda, senza fatture [V parziale]. Coordinare l'apertura con la domanda.
- [ ] **Schema IVA.** Mandato con rappresentanza col locale: si incassa la consumazione per conto del locale e si paga l'IVA solo sulla commissione.
- [ ] **INPS commercianti.** Circa 4.500 EUR l'anno, circa 2.950 con la riduzione del 35% [S]: è dovuto anche senza guadagni. Per questo la validazione si fa prima della partita IVA.
- [ ] **ATECO** 96.99.92 "servizi di incontro ed eventi simili" [V parziale]: da confermare col commercialista.

---

## 7. Piano tecnico

### 7.1 Stack consigliato

| Parte | Scelta | Perché |
|---|---|---|
| App e web | Expo (React Native) con Expo Router | Un solo codice per iOS, Android e web |
| Sito vetrina e lista d'attesa | Pagina web dentro lo stesso progetto Expo, oppure Next.js separato | Va online in pochi giorni |
| Database e login | Supabase (regione UE) con Row Level Security | Login via SMS, database Postgres, storage, funzioni |
| Pagamenti | Stripe: SetupIntent all'abbinamento, PaymentIntent off-session al check-in, Stripe Connect per i locali | Pagamento solo dopo; i soldi del locale restano separati |
| Trascrizione | Servizio speech-to-text su audio registrato (non in tempo reale) | 0,03-0,10 EUR per utente [S] |
| Ritratto AI | Modello Claude tramite API, con prompt fisso e uscita in formato JSON | Ritratto breve e motivo dell'abbinamento |
| SMS | Twilio Verify o un servizio simile, collegato a Supabase Auth | 0,05-0,12 EUR per SMS in Italia [S] |
| Anti-bot | Cloudflare Turnstile | Gratuito |
| Email | Un servizio transazionale (es. Resend) | Conferme e promemoria |
| Errori | Sentry (piano gratuito) | Per vedere i problemi degli utenti |

### 7.2 Dati principali (tabelle)

- `users`: id, telefono, email, data_nascita, genere, cerca_genere, città, zona, stato (in_attesa, verificato, attivo, sospeso), creato_il
- `waitlist`: id, user_id, città, posizione, invitato_da, creato_il
- `profiles`: user_id, risposte_5_domande (json), trascrizione_approvata, ritratto_ai, foto, preferenza_età_min, preferenza_età_max
- `consents`: user_id, tipo (servizio, dati_sensibili, voce, marketing), versione, accettato_il, revocato_il
- `venues`: id, città, nome, indirizzo, prezzo_consumazione, fasce_orarie, stripe_account_id, attivo
- `daily_proposals`: id, user_id, proposto_user_id, data, motivo, risposta (sì, no, scaduta)
- `matches`: id, user_a, user_b, stato, creato_il
- `meetings`: id, match_id, venue_id, data_ora, stato, checkin_a, checkin_b, payment_a, payment_b
- `reports`: id, da_user, su_user, meeting_id, motivo, stato, decisione, motivazione
- `credits`: user_id, importo, origine, scadenza

### 7.3 Stati dell'incontro

`proposto → accettato_da_entrambi → carta_salvata → locale_scelto → confermato → chat_aperta (2 ore prima) → check-in → completato`

Rami alternativi:
- `annullato_da_utente` (con o senza le 24 ore di preavviso)
- `assenza_altra_persona`, con rimborso o credito a scelta
- `locale_non_disponibile`, con rimborso
- `segnalato`, con revisione umana

### 7.4 Algoritmo delle proposte (lavoro notturno)

```
per ogni utente attivo U senza incontri in corso:
  candidati = utenti attivi C tali che
    stessa città e zona compatibile
    genere di C è tra i generi cercati da U, e viceversa
    |età U - età C| <= intervallo(U) e <= intervallo(C)
    non (età in 18-25 e l'altra età > 35)
    C non già proposto a U negli ultimi 60 giorni
    nessun blocco o segnalazione tra U e C
  ordina i candidati per compatibilità (risposte + ritratto) e affidabilità
  prendi da 1 a 3 candidati e salva il motivo dell'abbinamento
intervallo(età) = max(3, arrotonda(0,15 * età))
```

### 7.5 Pagamento (Stripe)

1. Abbinamento: si crea un SetupIntent con autenticazione forte e si salva il metodo di pagamento con il mandato.
2. Check-in di entrambi via QR: si crea un PaymentIntent off-session da 15 EUR a persona.
3. Assenza dell'altra persona: nessun addebito e credito omaggio, oppure rimborso.
4. Assenza senza preavviso di 24 ore: addebito di 15 EUR.
5. Locale: con Stripe Connect riceve la sua quota a fine mese.
6. Il pagamento avviene **sul web**, non dentro l'app, per non rischiare le commissioni degli store del 15-30% [S].

### 7.6 Schermate

1. Pagina pubblica: titolo, come funziona in 3 passi, città con contatore, iscrizione.
2. Iscrizione: telefono, codice SMS, consensi separati.
3. 5 domande.
4. Nota vocale: registra, rileggi, conferma.
5. Ritratto: anteprima modificabile.
6. Proposte del giorno: schede con il motivo dell'abbinamento.
7. Abbinamento: scelta di locale e orario, salvataggio della carta.
8. Incontro: dettagli, chat (aperta 2 ore prima), QR.
9. Recap.
10. Profilo e impostazioni: preferenze d'età, pausa, cancellazione dell'account (obbligatoria per Apple).
11. Pannello del locale: incontri del giorno, scansione QR, riepilogo mensile.
12. Pannello admin: verifiche, segnalazioni, città, locali, rimborsi.

### 7.7 Sicurezza minima

- Row Level Security su tutte le tabelle: ogni utente vede solo i propri dati e le proposte che lo riguardano.
- Dati sensibili (trascrizioni, consensi) in tabelle separate con accessi minimi.
- Chiavi solo sul server, mai nell'app.
- Backup giornaliero e doppia autenticazione per l'admin.
- Limiti di frequenza e un tetto di spesa giornaliero su SMS e API AI.
- Test di sicurezza esterno prima del lancio a pagamento.
- Piano di notifica al Garante entro 72 ore in caso di violazione dei dati.

---

## 8. Costruire con Claude Code: sessioni una per una

Ogni riga è una sessione breve: un compito solo, poi `/clear`. Prima di scrivere codice, chiedi a Claude un piano di massimo 10 righe (modalità piano).

| # | Richiesta a Claude Code | Fatto quando |
|---|---|---|
| 1 | "Crea un progetto Expo con Expo Router e TypeScript, pronto per web, iOS e Android. Aggiungi lint e un test di esempio." | `npx expo start` apre la pagina |
| 2 | "Collega Supabase (regione UE). Crea la tabella waitlist con RLS." | Inserimento di prova riuscito |
| 3 | "Pagina pubblica con lista d'attesa: titolo, 3 passi, contatore per città, modulo, Turnstile." | Ti iscrivi e vedi il contatore salire |
| 4 | "Link di invito personale e posizione in lista." | L'invito fa salire chi ha invitato |
| 5 | "Pubblica il sito su un dominio." | Il sito è online |
| 6 | "Demo cliccabile delle schermate 6-8 con dati finti." | La mostri a un locale |
| 7 | "Login con codice SMS via Supabase Auth e consensi separati." | Registrazione completa |
| 8 | "5 domande e salvataggio del profilo." | Profilo salvato |
| 9 | "Registrazione della nota vocale, trascrizione, correzione, cancellazione dell'audio." | L'audio sparisce dopo la conferma |
| 10 | "Ritratto AI da trascrizione e risposte, in JSON, modificabile." | Il ritratto appare ed è modificabile |
| 11 | "Algoritmo delle proposte come nella sezione 7.4, con test." | I test sull'età passano |
| 12 | "Schermata delle proposte e risposta sì o no." | Nasce l'abbinamento |
| 13 | "Scelta di locale e orario, tabella venues." | Incontro confermato |
| 14 | "Chat che si apre 2 ore prima e si chiude dopo." | La chat rispetta gli orari |
| 15 | "QR e pannello del locale." | Il check-in funziona |
| 16 | "Stripe: SetupIntent, addebito al doppio check-in, rimborso." | Prova in modalità test riuscita |
| 17 | "Segnalazioni, blocco e pannello admin." | La segnalazione arriva all'admin |
| 18 | "Recap del giorno dopo." | Recap salvato |
| 19 | "Cancellazione account ed esportazione dei dati." | Funzionano entrambe |
| 20 | "Build per TestFlight e test chiuso Google." | Gli inviti partono |

---

## 9. Risparmiare token con Claude Code

- **Repository dedicato** per l'app, con un CLAUDE.md breve: c'è un modello in `CLAUDE.md` accanto a questo file.
- `/clear` tra un compito e l'altro; `/compact` se un compito è lungo.
- `/context` per vedere cosa occupa spazio; `/usage` per vedere quanto limite resta.
- `/model`: un modello più leggero per testi e piccole correzioni.
- Modalità piano (Shift+Tab) prima di ogni funzione nuova.
- Indica i file da modificare per nome; incolla solo le righe dell'errore.
- Blocca la lettura di `node_modules`, `dist` e `build` nelle impostazioni del progetto.
- Git: un commit a ogni passo funzionante; `/rewind` invece di chiedere più volte la stessa correzione.
- Disattiva i connettori MCP che non usi.
- Passa a Max solo se per 2 settimane di fila finisci il limite settimanale prima del giovedì.

I comandi possono cambiare tra una versione e l'altra di Claude Code: controlla con `/help`.

---

## 10. Skill e strumenti su GitHub

Elenco verificato con la ricerca di GitHub il 27 novembre 2026: i repository esistono e le stelle sono riportate a quella data. Il contenuto delle skill non è stato letto riga per riga.

**Prima di installare qualsiasi skill, aprila e leggila.** Le skill possono contenere comandi e hook che girano sul tuo computer. Preferisci quelle ufficiali.

### 10.1 Ufficiali

| Repository | Cosa offre | Stelle |
|---|---|---|
| `anthropics/skills` | Skill ufficiali di Anthropic | ~201.000 |
| `anthropics/claude-code` | Claude Code: documentazione, esempi, segnalazioni | ~157.000 |
| `expo/skills` | Skill per progetti Expo ed Expo Application Services | ~4.200 |
| `supabase/agent-skills` | Skill per usare Supabase con agenti AI | ~3.100 |
| `stripe/ai` | Strumenti Stripe per prodotti con AI (pagamenti) | ~2.100 |
| `vercel-labs/agent-skills` | Raccolta ufficiale di skill di Vercel | ~35.000 |
| `vercel-labs/skills` | Strumento `npx skills` per cercare e installare skill | ~41.000 |
| `remotion-dev/skills` | Skill ufficiali per creare video con Remotion | ~8.100 |
| `getsentry/skills` | Skill del team Sentry per lo sviluppo | ~1.200 |
| `trailofbits/skills` | Sicurezza: ricerca di vulnerabilità e audit | ~8.500 |
| `upstash/context7` | Documentazione aggiornata delle librerie per gli agenti | ~65.500 |

### 10.2 Metodo di lavoro e qualità del codice

| Repository | Cosa offre | Stelle |
|---|---|---|
| `obra/superpowers` | Metodo di sviluppo a skill: pianificazione, test prima del codice, debug sistematico | ~328.000 |
| `wshobson/agents` | Agenti, skill e comandi per Claude Code | ~43.000 |
| `drona23/claude-token-efficient` | Un CLAUDE.md che rende le risposte più sintetiche e riduce i token in uscita | ~6.200 |

### 10.3 Raccolte da consultare

| Repository | Cosa offre | Stelle |
|---|---|---|
| `hesreallyhim/awesome-claude-code` | Raccolta curata di risorse per Claude Code | ~59.000 |
| `travisvn/awesome-claude-skills` | Raccolta di skill per Claude | ~16.000 |
| `VoltAgent/awesome-agent-skills` | Oltre 1.000 skill da team ufficiali e community | ~37.600 |

### 10.4 Design ed estetica

| Repository | Cosa offre | Stelle |
|---|---|---|
| `Leonxlnx/taste-skill` | Gusto visivo per gli agenti: direzione artistica, immagini di riferimento, controllo nel browser (già installata in `mio-progetto-1`) | ~122.000 |
| `nexu-io/open-design` | Spazio di design con AI: prototipi, siti, animazioni (le skill data-report e deck sono già installate) | ~110.000 |
| `ceorkm/mobile-app-ui-design` | Skill di design UI/UX per app mobile | ~600 |
| `draftbit/mobile-taste-skill` | Gusto visivo per app React Native ed Expo | piccola, da valutare |

### 10.5 Video promozionali

| Repository | Cosa offre | Stelle |
|---|---|---|
| `remotion-dev/remotion` | Video creati con codice React: animazioni, testi, foto, esportazione in MP4 | ~76.000 |
| `remotion-dev/skills` | Skill ufficiali che insegnano a Claude a usare Remotion | ~8.100 |

Con Remotion si possono creare i video verticali per Instagram e TikTok: per esempio "3 passi: una proposta, un locale, un drink", con foto vere dei locali convenzionati.

---

## 11. Direzione estetica

Il sito breeze.social non è stato analizzato: il dominio è bloccato dal filtro delle fonti del repository di ricerca. Le indicazioni che seguono sono una direzione originale, ispirata al genere "incontri dal vivo, semplici e caldi". Non sono una copia.

- **Sensazione:** calma, adulta, accogliente; una serata in un bel locale, non una discoteca.
- **Foto:** vere, dei locali convenzionati: tavoli, bicchieri, luce calda della sera. Niente foto di stock di coppie in posa.
- **Colori:** una base chiara e neutra, un colore principale preso dal territorio (agrumi, pietra lavica, mare) e un solo colore per i pulsanti.
- **Caratteri:** un carattere da titolo con personalità e uno semplice e molto leggibile per i testi. Massimo due famiglie.
- **Testi:** frasi corte. Esempio: "Una proposta al giorno. Un tavolo vero. Paghi solo dopo."
- **Animazioni:** poche e lente, per esempio la scheda della proposta che si gira.
- **Video:** verticali da 15-30 secondi, con un passo per scena, sottotitoli sempre presenti e la musica a basso volume.
- **Regola legale:** nessun testo, icona, colore distintivo o impaginazione presi da Breeze. Le bozze vanno conservate con le date.

Per analizzare Breeze nel repository di ricerca bisogna aggiungere `breeze.social` all'elenco dei domini consentiti (`.claude/hooks/domain_allowlist.py`). È una decisione tua: non l'ho fatto.

---

## 12. Costi

### 12.1 Mensili in sviluppo [S]

| Voce | Costo |
|---|---|
| Claude Pro | 20 USD (Max 100 USD solo nei mesi intensi) |
| Supabase | 0-25 USD |
| Hosting | 0-20 USD |
| Email, monitoraggio | 0-30 EUR |
| **Totale** | **circa 25-60 EUR** |

### 12.2 Validazione (sotto 5.000 EUR, senza partita IVA) [S]

| Voce | Costo |
|---|---|
| Dominio e servizi | 300 EUR |
| Marchio UIBM | 145 EUR |
| Legale minimo | 800 EUR |
| SMS | 100 EUR |
| Trasferte | 300 EUR |
| Serate di prova | 500 EUR |
| Creator in barter | 700 EUR |
| Pubblicità | 400 EUR |
| Riserva | 400 EUR |
| **Totale** | **circa 4.150 EUR** |

### 12.3 Prima città aperta [S]

Circa **13.000 EUR**, compresi l'INPS minimale (circa 2.950 EUR), il legale completo (circa 2.000 EUR), le assicurazioni, il test di sicurezza e Max per 3 mesi. Si scende verso i 10.000 EUR partendo dalla web app invece che dall'app per gli store, oppure con Resto al Sud 2.0.

### 12.4 Costi nascosti

- INPS dovuto anche senza guadagni.
- 2 EUR di bollo sulle fatture forfettarie oltre 77,47 EUR.
- Stripe: 1,5% + 0,25 EUR per pagamento [V parziale].
- 15-20 EUR per ogni contestazione della carta [S].
- Rimborsi quando l'altra persona non si presenta.
- Apple Developer: 99 USD l'anno [V parziale].
- SMS più cari in Italia.
- Il tuo tempo: 15-20 ore a settimana.

---

## 13. Limiti di questo documento

- **Verdetto del Collegio sul round 2: RESPINTO sulla parte fiscale**, perché il testo del nuovo forfettario (D.Lgs. 117/2026) non è stato letto. Il resto è utilizzabile, con le riserve indicate.
- Tutti i prezzi di fornitori, creator e servizi sono stime da ricontrollare sui listini.
- I numeri del business plan sono ipotesi da validare con la fase 0.
- Non è stato fatto un controllo legale Paese per Paese sui 27 Stati UE.

**Prima di agire, verificare con un professionista abilitato:** avvocato, consulente privacy e commercialista.
