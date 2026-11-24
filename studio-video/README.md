# STUDIO VIDEO AI

Il cliente manda **audio + foto + consenso firmato** → gli agenti di Claude Code producono copione, prompt, clip, controllo qualità e montaggio → tu approvi e correggi.

## Installazione sul PC (una volta sola)
1. Installa Python 3.10+, ffmpeg e Claude Code.
2. `pip install faster-whisper`
3. Crea un account su fal.ai, ricarica qualche dollaro e imposta la chiave:
   - Windows (PowerShell): `setx FAL_KEY "la-tua-chiave"` (poi riapri il terminale)
4. **Prima del primo uso reale**: apri la pagina dei due modelli scelti in `config.json` su fal.ai e controlla
   il nome del campo immagine (`image_url` o `start_image_url`), le durate ammesse e il prezzo al secondo. Correggi `config.json` se diversi.

## Ogni nuovo cliente
```
studio-video/clienti/sposi_rossi_2027/
  audio/      ← vocali WhatsApp del cliente
  foto/       ← 15-30 foto
  consenso.pdf
```
Poi da dentro `studio-video/`:
```
claude
> nuovo cliente: clienti/sposi_rossi_2027, stile cinematico_caldo
```
Il direttore di produzione segue il flusso di `CLAUDE.md` e si ferma due volte per la tua approvazione:
1. copione + scaletta + costo stimato
2. bozza video

## Comandi manuali
| Passo | Comando |
|---|---|
| Trascrizione | `python scripts/trascrivi.py clienti/X` |
| Indice foto | `python scripts/inventario_foto.py clienti/X` |
| Costo stimato | `python scripts/genera_clip.py clienti/X --stima` |
| Simulazione | `python scripts/genera_clip.py clienti/X --prova` |
| Generazione | `python scripts/genera_clip.py clienti/X` |
| Rifare scene | `python scripts/genera_clip.py clienti/X --solo 3,7` |
| Fotogrammi QC | `python scripts/estrai_fotogrammi.py clienti/X` |
| Bozza | `python scripts/monta.py clienti/X` |
| Finale | `python scripts/monta.py clienti/X --finale` |

## Sicurezza costi e dati
- Tetto di spesa per video in `config.json` (`budget_max_usd`, predefinito 30 $). Spesa reale in `lavoro/spesa.json`.
- `clienti/` e `musica/` sono esclusi da git: foto e voci dei clienti non finiscono mai online nel repository.
- Il modulo di consenso privacy va fatto redigere da un professionista abilitato (dati inviati a servizi esterni, anche extra-UE).
