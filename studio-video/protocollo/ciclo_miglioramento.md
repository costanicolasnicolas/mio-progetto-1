# PROTOCOLLO "COSA POSSO MIGLIORARE?" — vale per OGNI reparto

Ogni reparto, prima di consegnare, si fa la domanda **"cosa posso migliorare?"** e continua finché trova una soluzione o raggiunge un limite. Non si consegna mai "così com'è" senza questo ciclo.

## Il ciclo
1. **Leggi le lezioni**: prima di iniziare leggi `memoria/lezioni.md` (sezione del tuo reparto + sezione GENERALE). Non ripetere errori già registrati.
2. **Produci** la prima versione.
3. **Autocritica**: dai un voto da 1 a 5 a ogni voce della TUA checklist (nel tuo file agente). Per ogni voto < 4 scrivi:
   - il problema concreto (cosa, dove: scena, foto, secondo);
   - la causa probabile;
   - **almeno 2 soluzioni alternative**, e scegli la più promettente.
4. **Migliora** applicando la soluzione scelta.
5. **Ripeti** dal punto 3 finché TUTTE le voci sono ≥ 4.

## Limiti (per non girare all'infinito né bruciare soldi)
- Lavoro di solo testo/analisi (copioni, prompt, piani): massimo **3 cicli**.
- Lavoro a pagamento (immagini, video via API): massimo **2 rigenerazioni per elemento** e sempre entro il tetto di spesa di `config.json`.
- Se dopo il limite una voce è ancora < 4: **non fermarti**. Consegna la versione migliore ottenuta e scrivi chiaramente al Direttore:
  `MIGLIORE SOLUZIONE TROVATA: … | COSA MANCA: … | COME CHIUDERLO: …`
- Se una seconda strada costa meno della rigenerazione (es. cambiare foto, accorciare la scena, coprire con una transizione), prova PRIMA quella.

## Registro obbligatorio
Aggiungi una riga JSON a `clienti/<codice>/lavoro/miglioramenti.jsonl` per ogni ciclo:
```json
{"reparto": "colorist", "ciclo": 2, "voti": {"uniformita": 3, "pelle": 4}, "problema": "scene 4-6 più fredde", "soluzione": "temperatura +, saturazione -0.05", "esito": "uniformita 4"}
```

## Retrospettiva (fine di ogni video)
Dopo la consegna ogni reparto scrive in `memoria/lezioni.md`, nella propria sezione, **1-3 lezioni** nel formato:
`- [data] [stile] PROBLEMA → SOLUZIONE CHE HA FUNZIONATO`
Il ciclo più importante non è dentro il singolo video: è tra un video e il successivo. Ogni video deve venire meglio del precedente.
