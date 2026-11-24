# STUDIO VIDEO AI

Il cliente manda **audio + foto + consenso firmato**. Tu scegli **solo lo stile**. Lo studio (18 reparti + Direttore) fa tutto il resto, si autocorregge con il protocollo "cosa posso migliorare?" e ti presenta il video finito.

## Come si usa
```
studio-video/clienti/sposi_rossi_2027/
  audio/        ← vocali del cliente
  foto/         ← 15-30 foto
  consenso.pdf  ← obbligatorio
```
```
cd studio-video
claude
> nuovo cliente: clienti/sposi_rossi_2027, stile cartoon_3d
```
Stili disponibili: vedi `stile/INDICE.md` (realistico_cinematico, cartoon_3d, anime, acquerello, fumetto, vintage_super8, claymation).

Lo studio si ferma a chiederti qualcosa SOLO se: manca il consenso, il costo supera il tetto, lo stile non esiste, mancano materiali indispensabili.

## Organizzazione
- `CLAUDE.md` — istruzioni del Direttore: organigramma, flusso in 4 fasi, 3 checkpoint del Consiglio critico.
- `.claude/agents/` — i 18 reparti, ognuno con micro-ruoli ("cappelli") e checklist di autocritica.
- `protocollo/ciclo_miglioramento.md` — il ciclo "cosa posso migliorare?" con limiti e registro.
- `memoria/lezioni.md` — le lezioni imparate: ogni video migliora il successivo.
- `stile/` — catalogo stili (+ `stile/lut/` per LUT colore `.cube`).
- `musica/`, `sfx/` — brani ed effetti CON licenza (non vanno su git).

## Installazione sul PC (una volta sola)
1. Python 3.10+, ffmpeg, Claude Code.
2. `pip install faster-whisper`
3. Chiavi come variabili d'ambiente (Windows PowerShell, poi riapri il terminale):
   - `setx FAL_KEY "..."` (immagini e video, fal.ai)
   - `setx ELEVENLABS_API_KEY "..."` (voce narrante ed effetti, facoltativo)
4. **Prima del primo uso reale** controlla su fal.ai, per ogni modello in `config.json`: id, nome del campo immagine, durate ammesse, prezzo. Su ElevenLabs scegli una voce italiana e metti il suo id in `config.json → audio_ai.voce_id`.

## Script (usati dai reparti, anche a mano)
| Reparto | Comando |
|---|---|
| Accoglienza | `python scripts/trascrivi.py clienti/X` · `python scripts/inventario_foto.py clienti/X` |
| Restauratore | `python scripts/trasforma_foto.py clienti/X --modo restauro --foto a.jpg --stima` · `python scripts/prepara_foto.py clienti/X` |
| Artista di stile | `python scripts/trasforma_foto.py clienti/X --modo stile [--stima] [--solo 3,7]` |
| Generazione VFX | `python scripts/genera_clip.py clienti/X [--stima] [--prova] [--solo 3,7]` |
| Supervisore VFX | `python scripts/estrai_fotogrammi.py clienti/X` |
| Montatore | `python scripts/monta.py clienti/X --timeline` |
| Voce / Suono | `python scripts/audio_ai.py voce "testo" --uscita ...` · `python scripts/audio_ai.py sfx "descrizione" --durata 4 --uscita ...` |
| Mixer | `python scripts/monta.py clienti/X` (bozza) · `--finale` · `python scripts/estrai_fotogrammi.py clienti/X --da-video output/bozza.mp4` |
| Production manager | `python scripts/stato_lavori.py [clienti/X]` |

## Sicurezza costi e dati
- Tetto di spesa unico per video (immagini + clip) in `config.json → budget_max_usd` (predefinito 40 $). Spesa reale in `lavoro/spesa.json`.
- Massimo 2 rigenerazioni per elemento, poi il reparto deve trovare un'alternativa.
- `clienti/`, `musica/`, `sfx/` esclusi da git.
- Il modulo di consenso privacy va redatto da un professionista abilitato (dati inviati a servizi esterni, anche extra-UE).
