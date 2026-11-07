# Radar Aste Villa Bellini — procedura giornaliera

Esegui questa procedura ogni mattina. Lavora in autonomia: nessuno risponde alle domande durante l'esecuzione.

## 1. Obiettivo

Trovare le aste immobiliari:
- con **base d'asta oppure offerta minima tra 5.000 € e 35.000 €** (budget dell'utente, costi accessori esclusi). Se la base supera 35.000 € ma l'offerta minima (75%) rientra, includila e segnalalo;
- con l'immobile **nel Comune di Catania entro 1 km dal centro di Villa Bellini** (37.5110114, 15.0835021);
- con la vendita **ancora aperta** (data asta futura, termine offerte non scaduto).

Poi leggere **tutti i documenti** di ogni asta che passa i filtri, scegliere le migliori e pubblicare il report.

## 2. Filtro geografico

L'asta è nel raggio se vale almeno una di queste condizioni:
1. la via dell'immobile è nell'elenco `aste/vie_villa_bellini_1km.csv` (449 vie da OpenStreetMap). Confronta i nomi normalizzati: minuscole, senza accenti, "V." = "Via", "P.zza" = "Piazza", "Umberto I" = "Umberto Primo", "Vittorio Emanuele II" = "Vittorio Emanuele Secondo", "XX Settembre" = "Venti Settembre";
2. le coordinate dell'annuncio, o quelle ottenute geocodificando l'indirizzo con Nominatim (`https://nominatim.openstreetmap.org/search?format=json&q=...`, User-Agent generico, massimo 1 richiesta al secondo), sono a ≤ 1.000 m (formula di Haversine).

Per le vie lunghe (Via Etnea, Corso Italia, Viale Regina Margherita, Via Vittorio Emanuele II, Via Garibaldi, ecc.) controlla anche il **numero civico** con la geocodifica: solo una parte della via è dentro il raggio. Il campo `distanza_m` del CSV è la distanza minima del tratto più vicino, non dell'intera via.

## 3. Portali da controllare

| # | Portale | URL | Note |
|---|---|---|---|
| 1 | Portale Vendite Pubbliche (Min. Giustizia) | https://pvp.giustizia.it/pvp/ | Fonte principale: ogni asta giudiziaria deve stare qui per legge. Cerca immobili, Catania (CT). Il sito usa chiamate JSON interne: individuale dal codice della pagina e usale per scaricare l'elenco. |
| 2 | Demanio – Beni dello Stato | https://benidellostato.agenziademanio.it/AsteDemanio/sito.php | Spesso non raggiungibile dal container: segnala lo stato. |
| 3 | Demanio – Vendita immobili | https://venditaimmobili.agenziademanio.it/AsteDemanio/sito.php | Filtra Sicilia / Catania. |
| 4 | INPS – Aste immobiliari | https://www.inps.it/it/it/avvisi-bandi-e-fatturazione/aste-immobiliari-inps.html | |
| 5 | INPS – Bandi in corso | https://www.inps.it/it/it/avvisi-bandi-e-fatturazione/aste-immobiliari-inps/bandi-d-asta-in-corso.html | |
| 6 | Notariato – Rete Aste Notarili | https://www.notariato.it/it/ran/ | Spesso non raggiungibile: segnala lo stato. |
| 7 | Avvisi Notarili | https://avvisinotarili.notariato.it/beni-immobili/ | |
| 8 | INVIMIT | https://www.invimit.it/ | |
| 9 | ANBSC – Beni sequestrati e confiscati | https://benisequestraticonfiscati.it/ | |
| 10 | Agenzia delle Entrate | https://www.agenziaentrate.gov.it/ | Usa anche le **quotazioni OMI** per il valore di mercato. |
| 11 | Agenzia Entrate-Riscossione | https://www.agenziaentrateriscossione.gov.it/ | Sezione vendite immobili / aste. |
| 12 | Ministero della Difesa | https://www.difesa.it/ | Alienazioni immobili. |
| 13 | INAIL | https://www.inail.it/ | Dismissioni immobiliari. |
| 14 | Siti autorizzati (Min. Giustizia) | https://www.giustizia.it/giustizia/page/it/siti_web_aste_giudiziarie | Da qui: astegiudiziarie.it, astalegale.net, asteannunci.it e altri. Servono per scaricare perizie e allegati quando il PVP non li mostra. |

Se un portale non risponde: riprova 2 volte, poi segnalalo nel report come "non raggiungibile" e vai avanti. Non inventare mai annunci, prezzi o date.

## 4. Documenti da leggere per ogni asta che passa i filtri

**Checklist obbligatoria: `aste/MANUALE_DUE_DILIGENCE.md`.** Leggilo per intero a ogni esecuzione e applica a ogni asta tutte le sue sezioni: i 15 documenti (sezione 1), i controlli urbanistici (2), strutturali e impiantistici (3), giuridici e di occupazione (4), condominiali (5) e le metriche economiche (6). Dove il manuale e questa procedura si sovrappongono, valgono entrambi; in caso di dubbio prevale la regola più prudente del manuale: se una difformità non è sanabile o il titolo di occupazione è problematico, l'asta va scartata, non si alza il budget.

Per ognuno dei 15 documenti della sezione 1 annota nel report se è stato **trovato e letto**, **citato solo in perizia** oppure **mancante**. Un documento mancante non blocca l'asta ma va tra le criticità e abbassa il punteggio. I controlli che dai documenti non si possono fare (strutturali, amianto, impianti) vanno elencati come "da verificare al sopralluogo".

Scarica e leggi davvero: **perizia di stima (CTU)**, **avviso o ordinanza di vendita**, planimetria, foto, eventuali integrazioni della perizia, certificazione notarile se presente. I PDF si leggono con `pdftotext`; per le scansioni serve l'OCR (`pdftoppm` + `tesseract -l ita`, se disponibile).

Estrai e controlla:

1. **Diritto in vendita**: piena proprietà oppure quota indivisa, nuda proprietà, usufrutto, diritto di superficie. Le quote e la nuda proprietà sono critiche.
2. **Stato di occupazione**: libero; occupato dal debitore (liberazione a cura del custode); locato con contratto opponibile (data certa anteriore al pignoramento); occupato senza titolo.
3. **Conformità urbanistica ed edilizia**: abusi, sanabili o no, costo della sanatoria, condono pendente (art. 40 L. 47/1985 e art. 46 DPR 380/2001 per l'aggiudicatario).
4. **Conformità catastale**: planimetria conforme, costo di eventuali variazioni DOCFA.
5. **Spese condominiali insolute**: l'aggiudicatario risponde dell'anno in corso e del precedente (art. 63 disp. att. c.c.). Contano anche le spese straordinarie deliberate.
6. **Vincoli**: beni culturali (prelazione dello Stato, D.Lgs. 42/2004: frequente nel centro storico di Catania), servitù, uso civico, convenzioni PEEP con prezzo vincolato.
7. **Formalità che restano**: domande giudiziali, trascrizioni non cancellabili dal decreto di trasferimento.
8. **Stato dell'immobile**: superficie commerciale, piano, ascensore, impianti, umidità, lesioni strutturali, APE, costo di ristrutturazione stimato in perizia.
9. **Storia dell'asta**: numero di esperimenti andati deserti e ribassi. Più tentativi andati deserti significano più potere di trattativa, ma chiediti perché nessuno ha comprato.
10. **Modalità**: telematica, sincrona o mista, cauzione (di solito il 10%), termine di deposito, saldo prezzo (di solito 120 giorni), possibilità di mutuo.

## 5. Metriche di valutazione (punteggio 0–100)

Calcola per ogni asta:

- **Valore di mercato stimato (VM)**: €/mq delle quotazioni OMI della zona (Catania centro, ultimo semestre disponibile, stato conservativo coerente) × superficie commerciale. Confrontalo con il valore della perizia; se differiscono più del 25% spiega perché.
- **Costo totale (CT)** = prezzo di aggiudicazione previsto (offerta minima, oppure base se è prevista una gara) + imposte di trasferimento (abitazione da privato: registro 9% sul prezzo-valore catastale oppure 2% se prima casa; minimo 1.000 €; più ipotecaria e catastale fisse 50 + 50 €; se il venditore è un'impresa in regime IVA, verificare) + compenso del delegato a carico dell'aggiudicatario (stima 1.000–1.500 €) + spese condominiali insolute + sanatorie e regolarizzazioni + ristrutturazione + spese di liberazione + un imprevisto del 10% sui lavori.
- **Margine netto (rivendita)** = VM dopo i lavori − CT − costi di rivendita (agenzia 3% + 2.000 €) − imposte sulla plusvalenza se la vendita avviene entro 5 anni.
- **Rendimento affitto lungo** = canone OMI annuo / CT. **Rendimento affitto breve** solo se l'immobile è adatto (centro storico, vicino a Via Etnea e alla villa; serve il CIN e il rispetto delle regole locali).
- **Sconto reale** = 1 − (prezzo previsto / VM).
- **ROI netto** = utile netto / capitale investito (capitale investito = CT).
- **€/m²**: costo totale / superficie commerciale, confrontato con le compravendite comparabili della zona (OMI e annunci di vendita vicini, indicando la fonte).
- **Tempo previsto per rivendere** in mesi (asta + saldo prezzo + decreto di trasferimento + liberazione + lavori + vendita) e **costo del capitale** per quel periodo (stima 5% annuo sul capitale impegnato se non è indicato altro).
- **Utenze e allacciamenti**: includili nel CT (stima 500–1.500 € se gli impianti sono staccati).
- **Rendimento netto da locazione** = (canone annuo − IMU − condominio a carico del proprietario − manutenzione 5% − imposte cedolare 21%) / CT.

Regola del manuale: lo sconto sul prezzo da solo non basta. Un'asta è consigliabile solo se, dopo tutti i costi e tutti i rischi giuridici, urbanistici, tecnici e finanziari, resta un margine adeguato: **ROI netto ≥ 20% per la rivendita** oppure **rendimento netto da locazione ≥ 7%**.

Pesi del punteggio:
| Fattore | Peso |
|---|---|
| Sconto reale sul valore di mercato | 25 |
| Margine netto o rendimento | 20 |
| Stato di occupazione (libero = massimo) | 15 |
| Conformità urbanistica e catastale | 15 |
| Diritto pieno e assenza di vincoli e formalità che restano | 10 |
| Debiti condominiali e costi nascosti bassi | 5 |
| Liquidità della zona e qualità dell'immobile (piano, luce, ascensore) | 5 |
| Tempistica (asta abbastanza lontana da preparare l'offerta, saldo sostenibile) | 5 |

**Esclusioni automatiche** (in tabella con l'esito, mai tra le consigliate): quota indivisa senza accordo con i comproprietari, nuda proprietà, abusi o difformità non sanabili, titolo di occupazione problematico (contratto opponibile di lunga durata o a canone vile, diritto di abitazione, comodato opponibile), costo totale oltre 45.000 € (budget + 30% di costi), vendita già scaduta.

**Consigliate**: punteggio ≥ 60, ordinate per punteggio. Massimo 5. Per ognuna indica l'operazione suggerita (rivendita dopo i lavori, affitto lungo, affitto breve, box o magazzino a reddito) e l'offerta massima consigliata.

## 5-bis. Collegio J.A.R.V.I.S. sulle aste migliori

Dopo il punteggio del punto 5, prendi le **migliori aste candidate (massimo 5, punteggio provvisorio ≥ 50)** e falle esaminare dal Collegio definito in `CLAUDE.md` e `.claude/agents/`. La sessione principale agisce da **J.A.R.V.I.S.** (orchestratore). Le aste sotto soglia restano nella tabella con l'analisi rapida.

**Preparazione (J.A.R.V.I.S.)** — i subagenti non hanno Bash e non vedono la conversazione:
1. per ogni asta crea `stato/aste/<id_asta>/` e salvaci il testo estratto di perizia, avviso, ordinanza e allegati (`perizia.txt`, `avviso.txt`, ...), più `scheda.json` con i dati già raccolti (indirizzo, prezzi, superficie, date, link, valori OMI, calcoli provvisori);
2. nel prompt di delega passa un riepilogo di massimo 500 token, i percorsi dei file da leggere e la checklist pertinente di `aste/MANUALE_DUE_DILIGENCE.md`.

**Esame in parallelo** — lancia nello stesso messaggio, per ogni asta (o una delega per specialista con tutte le aste insieme, se sono più di 2):
| Specialista (`subagent_type`) | Compito sull'asta | Sezioni del manuale |
|---|---|---|
| `friday-avvocato-notaio` | Diritto in vendita, occupazione e opponibilità dei contratti, formalità cancellate o che restano, sanabilità di abusi e difformità (DPR 380/2001, L. 47/1985, art. 40), vincoli, servitù, usi civici, contenziosi | 1, 2, 4 |
| `edith-fiscalista` | Imposte di acquisto (registro o IVA, prima casa, prezzo-valore), ipotecaria e catastale, plusvalenza in caso di rivendita entro 5 anni, IMU, cedolare secca sull'affitto | 6 |
| `karen-economista` | **Responsabile di ristrutturazione e valore dopo i lavori (sezione 5-ter)**: costo dei lavori, valore di vendita ristrutturato, canone di affitto, €/m² di via, zona e area. Poi costo totale, margine netto, ROI netto, tempo di rivendita, costo del capitale, rendimento netto da locazione, offerta massima consigliata | 3, 5, 6 |
| `vision-revisore` | Rischi complessivi (urbanistici, tecnici, condominiali, di liberazione), piano di cassa (cauzione, saldo, lavori), elenco dei controlli da fare al sopralluogo con geometra/avvocato | 3, 5, regola operativa |

Ogni specialista restituisce il JSON della sezione 2.2 di `CLAUDE.md`, citando la pagina della perizia o il documento per ogni dato.

**Verifica** — passa tutti gli output a `ultron-giudice`. U.L.T.R.O.N. controlla che ogni numero e ogni criticità venga da un documento reale o da una fonte verificata, risolve i conflitti tra specialisti ed emette per ogni asta: **APPROVATO / APPROVATO CON RISERVE / RESPINTO**.

**Esito**:
- solo le aste APPROVATE o APPROVATE CON RISERVE vanno tra le **consigliate**, con il punteggio ricalcolato sui dati del Collegio;
- le RESPINTE vanno in tabella con il motivo del verdetto;
- per ogni consigliata salva nel report il parere breve di ogni specialista e il verdetto con le riserve (campi `collegio` e `verdetto_ultron`).

Limiti: concorrenza massima e profondità come in `CLAUDE.md` (sezione 6). Il Collegio vale solo per le aste migliori: il giro rapido sulle altre resta invariato. Se un subagente non risponde o supera i turni, J.A.R.V.I.S. completa quella parte da solo e lo segnala nel campo `collegio`.

## 5-ter. Ristrutturazione e valore dopo i lavori (vendita e affitto)

Lo fa J.A.R.V.I.S. nel giro rapido per tutte le aste nel raggio, e lo approfondisce **K.A.R.E.N.** per le aste del Collegio. **V.I.S.I.O.N.** controlla che le stime dei lavori siano coerenti con i difetti trovati in perizia, **U.L.T.R.O.N.** che ogni prezzo venga da una fonte citata.

**1. Costo di ristrutturazione.** Parti dallo stato descritto in perizia e dalle foto, voce per voce (impianto elettrico, idrico, gas, bagno, cucina, pavimenti, infissi, intonaci e pitture, umidità, copertura o parti comuni a carico). Classifica il livello e usa questi riferimenti (Catania, €/m² di superficie interna, IVA inclusa; sono stime iniziali da sostituire con preventivi reali appena disponibili):
| Livello | Quando | €/m² |
|---|---|---|
| Rinfresco | pitture, piccoli ritocchi, impianti a norma | 100–200 |
| Leggera | bagno o cucina, pavimenti in parte, impianti a norma | 250–450 |
| Media | bagno e cucina, pavimenti, infissi, impianto elettrico | 500–750 |
| Pesante | tutto rifatto, impianti, tramezzi, umidità | 800–1.200 |
Aggiungi a parte: pratiche tecniche (CILA/SCIA, direzione lavori, aggiornamento catastale 1.500–3.000 €), sanatorie, smaltimento amianto, quota di lavori condominiali deliberati, imprevisti 10%. Se la perizia indica già un costo dei lavori, riportalo e confrontalo con la tua stima.

**2. Prezzo di vendita dopo i lavori (€/m²), su tre livelli, dal più vicino al più ampio:**
- **Via**: annunci in vendita e vendite note **nella stessa via** (stesso tratto e civici vicini), su immobiliare.it, idealista.it, casa.it. Usa solo immobili simili (ristrutturati o buono stato, metratura e piano comparabili). Applica uno sconto del 5–10% tra prezzo richiesto e prezzo di vendita reale.
- **Zona**: annunci simili entro 300 m.
- **Area OMI**: quotazioni OMI dell'Agenzia delle Entrate per la zona e la tipologia, stato "ottimo" o "normale" (ultimo semestre disponibile).
Per ogni livello riporta: numero di comparabili, €/m² minimo, medio e massimo, link agli annunci usati. Il **valore dopo i lavori** è la media pesata (via 50%, zona 30%, OMI 20%; se in via ci sono meno di 3 comparabili, sposta il peso sulla zona). Se i tre livelli differiscono più del 20%, spiega perché.

**3. Canone di affitto (€/m² al mese)**, stessi tre livelli:
- **Affitto lungo**: annunci di affitto in via e in zona (4+4 o 3+2 concordato) e valori di locazione OMI. Canone mensile stimato e rendimento netto.
- **Affitto breve**: solo se l'immobile è adatto (posizione, piano, luce, almeno 1 camera). Stima prudente da tariffe di annunci simili in zona, occupazione 55–65%, costi di gestione 25–30%, obbligo di CIN e delle regole del Comune di Catania. Se non ci sono dati affidabili scrivi "non stimato" invece di inventare.

**4. Scelta dell'operazione**: confronta rivendita, affitto lungo e affitto breve e indica la migliore con i numeri (margine e ROI per la vendita, rendimento netto per l'affitto).

Se i portali di annunci non sono raggiungibili, usa solo OMI e perizia e scrivilo; non inventare comparabili.

Nota tecnica: l'hook `domain_allowlist.py` ora consente ai subagenti il WebFetch su immobiliare.it, idealista.it, casa.it e sui portali d'asta. **J.A.R.V.I.S.** raccoglie comunque una prima serie di comparabili e quotazioni OMI in `stato/aste/<id>/comparabili.json` (tipo, indirizzo, m², piano, stato, prezzo o canone, €/m², link); K.A.R.E.N. li legge e può aprire direttamente gli annunci per verificarli o aggiungerne altri. Se un sito blocca gli accessi automatici, si resta sui comparabili già raccolti.

## 6. Output

Scrivi `aste/report/data.json` con questa struttura (campi esistenti in `aste/report/index.html`):

```json
{
  "generato_il": "AAAA-MM-GG", "ora": "HH:MM", "nota_giornata": "frase breve",
  "statistiche": {"annunci_letti": 0, "nel_raggio_budget": 0, "perizie_lette": 0},
  "consigliate": [{
    "titolo": "", "indirizzo": "", "distanza_m": 0, "mq": 0, "punteggio": 0,
    "url_asta": "link diretto alla pagina di questa asta (obbligatorio)", "portale": "", "codice_asta": "RGE / lotto / id annuncio",
    "etichette": ["Libero", "Conforme", "Nuova", "2° ribasso"],
    "prezzo_base": 0, "offerta_minima": 0, "valore_perizia": 0, "valore_mercato": 0,
    "costo_totale": 0, "margine_netto": 0, "data_asta": "AAAA-MM-GG", "termine_offerte": "AAAA-MM-GG",
    "offerta_massima": 0, "roi_netto_pct": 0, "rendimento_locazione_pct": 0, "eur_mq": 0, "eur_mq_comparabili": 0,
    "mesi_rivendita": 0, "costo_capitale": 0,
    "ristrutturazione": {"livello": "Rinfresco | Leggera | Media | Pesante", "costo": 0, "voci": ["bagno 6.000 €", "..."], "fonte": "perizia pag. X + stima"},
    "valore_dopo_lavori": 0,
    "prezzi_zona": [
      {"livello": "Via", "vendita_eur_mq": [0, 0, 0], "affitto_eur_mq_mese": [0, 0, 0], "comparabili": 0, "fonte": "link o OMI"},
      {"livello": "Zona 300 m", "vendita_eur_mq": [0, 0, 0], "affitto_eur_mq_mese": [0, 0, 0], "comparabili": 0, "fonte": ""},
      {"livello": "Area OMI", "vendita_eur_mq": [0, 0, 0], "affitto_eur_mq_mese": [0, 0, 0], "comparabili": 0, "fonte": "OMI zona X, semestre"}
    ],
    "affitto": {"lungo_mese": 0, "breve_mese_netto": 0, "rendimento_lungo_pct": 0, "rendimento_breve_pct": 0},
    "documenti": [{"nome": "Perizia estimativa", "stato": "letto | citato in perizia | mancante"}],
    "da_verificare": ["controlli da fare al sopralluogo o con geometra/avvocato"],
    "collegio": [{"agente": "F.R.I.D.A.Y.", "parere": "2-3 frasi"}, {"agente": "E.D.I.T.H.", "parere": ""}, {"agente": "K.A.R.E.N.", "parere": ""}, {"agente": "V.I.S.I.O.N.", "parere": ""}],
    "verdetto_ultron": {"esito": "APPROVATO | APPROVATO CON RISERVE | RESPINTO", "motivazione": "", "riserve": [""]},
    "punti_forza": [""], "criticita": [""], "operazione": "",
    "link": [{"nome": "Annuncio PVP", "url": ""}, {"nome": "Perizia", "url": ""}]
  }],
  "nessuna_consigliata": "",
  "tutte": [{"indirizzo": "", "tipo": "", "prezzo_base": 0, "offerta_minima": 0, "data_asta": "", "esito": "Consigliata / Scartata: motivo", "portale": "", "url": ""}],
  "portali": [{"nome": "", "stato": "ok | errore | parziale", "dettaglio": "n annunci / non raggiungibile"}]
}
```

Etichetta "Nuova" per le aste che non erano nel report precedente: leggi prima il report pubblicato per confrontare.

Pubblica con il tool Artifact sullo stesso URL (prima `action: "read"` sull'URL, poi publish con `url`, `file_path` = `aste/report/index.html` e `files` = `{"data.json": "aste/report/data.json"}`). Poi manda una notifica breve: numero di aste consigliate e la migliore, con punteggio e indirizzo.

## 7. Regole

- **Link obbligatorio alla singola asta.** Ogni asta consigliata deve avere nel campo `url_asta` il collegamento diretto alla pagina di **quella** asta (per il PVP la pagina di dettaglio dell'annuncio, non la ricerca o la home del portale), e in `link` almeno anche la perizia e l'avviso di vendita. Apri ogni link prima di pubblicare e controlla che porti all'asta giusta (stesso indirizzo, stesso lotto, stessa procedura). Anche ogni riga della tabella "tutte" deve avere `url` alla sua asta. Un'asta senza link diretto funzionante non può stare tra le consigliate.

- Mai inventare dati. Ogni numero viene da un documento o da un calcolo dichiarato.
- Se una perizia non è scaricabile, scrivilo tra le criticità e abbassa il punteggio.
- Il report è un supporto decisionale: aggiungi sempre la raccomandazione di verificare con un professionista abilitato e di fare un sopralluogo.
