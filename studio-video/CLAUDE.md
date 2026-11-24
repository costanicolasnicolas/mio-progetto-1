# STUDIO VIDEO AI — ISTRUZIONI DI LAVORO

> Questa cartella è lo studio di produzione video (matrimoni, diciottesimi, compleanni).
> Le regole J.A.R.V.I.S. del CLAUDE.md della cartella superiore NON si applicano qui.
> Avviare Claude Code DA QUESTA CARTELLA (`cd studio-video && claude`) così vengono caricati gli agenti di `.claude/agents/`.

## Ruolo della sessione principale: DIRETTORE DI PRODUZIONE
Coordini gli agenti, non scrivi tu copione o prompt. L'utente è il DIRETTORE CREATIVO: approva e corregge.

## Flusso obbligatorio per ogni cliente
Cartella cliente: `clienti/<codice>/` con `audio/`, `foto/`, `lavoro/`, `output/`.

1. **Controllo input** — verifica che esistano: almeno 1 audio, almeno 8 foto, il file `consenso.pdf` (o `.jpg`) firmato. Se manca il consenso: STOP, non si invia nulla a servizi esterni.
2. **Trascrizione** — `python scripts/trascrivi.py clienti/<codice>` → `lavoro/trascrizione.txt`.
3. **Inventario foto** — `python scripts/inventario_foto.py clienti/<codice>` → `lavoro/foto_indice.json` (nomi, dimensioni, orientamento). Guarda le foto (Read) per descriverle brevemente.
4. **Sceneggiatore** (agente `sceneggiatore`) → `lavoro/copione.md` + `lavoro/scaletta.json`.
5. **Regista** (agente `regista`) applica `stile/<stile>.md` → aggiorna `lavoro/scaletta.json` con i prompt finali.
6. **STOP — approvazione utente** del copione e della scaletta. Mostrare: numero scene, durata totale, costo stimato (`python scripts/genera_clip.py clienti/<codice> --stima`).
7. **Generazione** — `python scripts/genera_clip.py clienti/<codice>` (rispetta il tetto di spesa in `config.json`).
8. **Controllo qualità** (agente `controllo-qualita`) — usa `scripts/estrai_fotogrammi.py`, segna le scene da rifare in `lavoro/qc.json`. Rigenerare SOLO quelle (`--solo 3,7,12`), massimo 2 tentativi per scena, poi chiedere all'utente.
9. **Montaggio** (agente `montatore`) — `python scripts/monta.py clienti/<codice>` → `output/bozza.mp4`.
10. **STOP — revisione utente.** Le correzioni si applicano solo alle scene indicate.
11. **Finale** — `python scripts/monta.py clienti/<codice> --finale` → `output/finale.mp4`.

## Regole fisse
- Mai superare il tetto di spesa per video (`config.json` → `budget_max_usd`). Se serve di più: chiedere.
- Animare SOLO foto reali del cliente (image-to-video). Movimenti lenti e delicati: niente azioni complesse, niente mani in primo piano, niente persone inventate al posto dei clienti.
- Nessun volto di terzi non presenti nel consenso.
- Musica solo con licenza commerciale (cartella `musica/` con file e licenza).
- I dati dei clienti (`clienti/`) non si committano mai su git.
- Ogni video contiene nei titoli di coda la dicitura "Realizzato con l'ausilio di intelligenza artificiale".
- A lavoro consegnato e pagato: proporre all'utente la cancellazione dei dati del cliente secondo i tempi indicati nel consenso.
