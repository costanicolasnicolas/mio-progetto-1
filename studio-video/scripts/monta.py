"""Monta le clip in un unico video con transizioni, titoli e musica.

Uso:
  python scripts/monta.py clienti/<codice>            # → output/bozza.mp4 (veloce, qualità media)
  python scripts/monta.py clienti/<codice> --finale   # → output/finale.mp4 (qualità alta)

Legge da lavoro/scaletta.json i campi "musica" (percorso relativo alla cartella studio-video
o alla cartella cliente) e "montaggio" (transizione, titoli, volume).
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from comune import RADICE, carica_config, cartella_cliente, leggi_json, nome_clip

FONT_TITOLI = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"


def esegui(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"ERRORE ffmpeg:\n{r.stderr[-1500:]}")


def font():
    for f in (RADICE / "font" / "titoli.ttf", Path(FONT_TITOLI), Path("C:/Windows/Fonts/georgia.ttf")):
        if f.exists():
            return str(f).replace("\\", "/").replace(":", "\\:")
    sys.exit("ERRORE: nessun font trovato: metti un file .ttf in studio-video/font/titoli.ttf")


def cartello(testo, secondi, dest, w, h, fps, tmp):
    righe = testo.split("\n")
    fs, passo = h // 16, int(h // 16 * 1.5)
    y0 = (h - passo * len(righe)) // 2
    filtri = []
    for i, riga in enumerate(righe):
        if not riga.strip():
            continue
        f_riga = Path(tmp) / f"{dest.stem}_{i}.txt"  # textfile evita problemi di escape con apostrofi
        f_riga.write_text(riga, encoding="utf-8")
        p = str(f_riga).replace("\\", "/").replace(":", "\\:")
        filtri.append(f"drawtext=fontfile='{font()}':textfile='{p}':fontcolor=white:"
                      f"fontsize={fs}:x=(w-text_w)/2:y={y0 + i * passo}")
    vf = ",".join(filtri) or "null"
    esegui(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c=black:s={w}x{h}:r={fps}:d={secondi}",
            "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])


def normalizza(sorgente, secondi, dest, w, h, fps):
    vf = (f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black,"
          f"fps={fps},setsar=1,format=yuv420p")
    esegui(["ffmpeg", "-v", "error", "-y", "-i", str(sorgente), "-t", f"{secondi}", "-an",
            "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", str(dest)])


def durata(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--finale", action="store_true")
    a = ap.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ERRORE: ffmpeg non installato")
    cfg = carica_config()["uscita"]
    w, h, fps = cfg["larghezza"], cfg["altezza"], cfg["fps"]
    cli = cartella_cliente(a.cliente)
    scaletta = leggi_json(cli / "lavoro" / "scaletta.json")
    if not scaletta:
        sys.exit("ERRORE: manca lavoro/scaletta.json")
    mont = scaletta.get("montaggio") or {}
    T = float(mont.get("durata_transizione", 0.6))
    coda = mont.get("titoli_coda") or "Realizzato con l'ausilio di intelligenza artificiale"
    if "intelligenza artificiale" not in coda.lower():
        coda += "\n\nRealizzato con l'ausilio di intelligenza artificiale"

    mancanti = [s["id"] for s in scaletta["scene"]
                if not (cli / "lavoro" / "clip" / nome_clip(s["id"])).exists()]
    if mancanti:
        sys.exit(f"ERRORE: clip mancanti per le scene {mancanti}")

    with tempfile.TemporaryDirectory() as tmp:
        segmenti = []
        titolo = mont.get("titolo_iniziale") or scaletta.get("titolo")
        if titolo:
            p = Path(tmp) / "00_titolo.mp4"
            cartello(titolo, 4, p, w, h, fps, tmp)
            segmenti.append(p)
        for s in scaletta["scene"]:
            p = Path(tmp) / f"seg_{int(s['id']):02d}.mp4"
            normalizza(cli / "lavoro" / "clip" / nome_clip(s["id"]), s.get("durata", 5), p, w, h, fps)
            segmenti.append(p)
        p = Path(tmp) / "99_coda.mp4"
        cartello(coda, 5, p, w, h, fps, tmp)
        segmenti.append(p)

        durate = [durata(p) for p in segmenti]
        totale = sum(durate) - T * (len(segmenti) - 1)

        cmd = ["ffmpeg", "-v", "error", "-y"]
        for p in segmenti:
            cmd += ["-i", str(p)]
        filtri, prec, offset = [], "[0:v]", 0.0
        for i in range(1, len(segmenti)):
            offset += durate[i - 1] - T
            out = f"[v{i}]"
            filtri.append(f"{prec}[{i}:v]xfade=transition=fade:duration={T}:offset={offset:.3f}{out}")
            prec = out
        filtri.append(f"{prec}fade=t=in:st=0:d=1,fade=t=out:st={totale - 1.5:.3f}:d=1.5[vout]")

        musica = scaletta.get("musica")
        mappa_audio = []
        if musica:
            mp = Path(musica)
            if not mp.is_absolute():
                mp = next((c for c in (RADICE / musica, cli / musica) if c.exists()), RADICE / musica)
            if not mp.exists():
                sys.exit(f"ERRORE: musica non trovata: {musica}")
            cmd += ["-stream_loop", "-1", "-i", str(mp)]
            vol = float(mont.get("volume_musica", 0.8))
            filtri.append(f"[{len(segmenti)}:a]atrim=0:{totale:.3f},volume={vol},afade=t=in:st=0:d=2,"
                          f"afade=t=out:st={totale - 3:.3f}:d=3[aout]")
            mappa_audio = ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"]
        else:
            print("ATTENZIONE: nessuna musica impostata in scaletta.json → video muto")

        qualita = ["-preset", "slow", "-crf", "17"] if a.finale else ["-preset", "veryfast", "-crf", "23"]
        dest = cli / "output" / ("finale.mp4" if a.finale else "bozza.mp4")
        cmd += ["-filter_complex", ";".join(filtri), "-map", "[vout]", *mappa_audio,
                "-c:v", "libx264", *qualita, "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-t", f"{totale:.3f}", str(dest)]
        esegui(cmd)
    print(f"OK → {dest}  (durata {totale:.1f} s, {len(scaletta['scene'])} scene)")


if __name__ == "__main__":
    main()
