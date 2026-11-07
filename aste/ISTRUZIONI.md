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

**Esclusioni automatiche** (in tabella con l'esito, mai tra le consigliate): quota indivisa senza accordo con i comproprietari, nuda proprietà, abusi non sanabili che toccano la parte principale, costo totale oltre 45.000 € (budget + 30% di costi), vendita già scaduta.

**Consigliate**: punteggio ≥ 60, ordinate per punteggio. Massimo 5. Per ognuna indica l'operazione suggerita (rivendita dopo i lavori, affitto lungo, affitto breve, box o magazzino a reddito) e l'offerta massima consigliata.

## 6. Output

Scrivi `aste/report/data.json` con questa struttura (campi esistenti in `aste/report/index.html`):

```json
{
  "generato_il": "AAAA-MM-GG", "ora": "HH:MM", "nota_giornata": "frase breve",
  "statistiche": {"annunci_letti": 0, "nel_raggio_budget": 0, "perizie_lette": 0},
  "consigliate": [{
    "titolo": "", "indirizzo": "", "distanza_m": 0, "mq": 0, "punteggio": 0,
    "etichette": ["Libero", "Conforme", "Nuova", "2° ribasso"],
    "prezzo_base": 0, "offerta_minima": 0, "valore_perizia": 0, "valore_mercato": 0,
    "costo_totale": 0, "margine_netto": 0, "data_asta": "AAAA-MM-GG", "termine_offerte": "AAAA-MM-GG",
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

- Mai inventare dati. Ogni numero viene da un documento o da un calcolo dichiarato.
- Se una perizia non è scaricabile, scrivilo tra le criticità e abbassa il punteggio.
- Il report è un supporto decisionale: aggiungi sempre la raccomandazione di verificare con un professionista abilitato e di fare un sopralluogo.
