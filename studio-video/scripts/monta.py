"""Monta il film: clip + transizioni + colore + titoli + musica (con ducking) + voci + effetti.

Uso:
  python scripts/monta.py clienti/<codice> --timeline   # solo lavoro/timeline.json (inizio di ogni scena)
  python scripts/monta.py clienti/<codice>              # → output/bozza.mp4 (veloce)
  python scripts/monta.py clienti/<codice> --finale     # → output/finale.mp4 (qualità alta)

Campi letti da lavoro/scaletta.json:
  scena: durata, secondi_validi [a, b], colore {contrasto, saturazione, luminosita, gamma}
  musica: "musica/brano.mp3"
  montaggio: transizione, durata_transizione, titolo_iniziale, titoli_coda, volume_musica,
             musica_inizio, colore {contrasto, saturazione, luminosita, gamma, lut},
             voci [{file, inizio, volume}], effetti [{file, inizio, volume}]
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from comune import RADICE, carica_config, cartella_cliente, leggi_json, nome_clip, scrivi_json

FONT_TITOLI = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
DICITURA_AI = "Realizzato con l'ausilio di intelligenza artificiale"
DURATA_TITOLO, DURATA_CODA = 4.0, 5.0


def esegui(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"ERRORE ffmpeg:\n{r.stderr[-2000:]}")


def esc(percorso):
    return str(percorso).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")


def font():
    for f in (RADICE / "font" / "titoli.ttf", Path(FONT_TITOLI), Path("C:/Windows/Fonts/georgia.ttf")):
        if f.exists():
            return esc(f)
    sys.exit("ERRORE: nessun font trovato: metti un file .ttf in studio-video/font/titoli.ttf")


def trova(cli, rel):
    p = Path(rel)
    if p.is_absolute():
        return p
    for base in (cli, RADICE):
        if (base / rel).exists():
            return base / rel
    sys.exit(f"ERRORE: file non trovato: {rel}")


def cartello(testo, secondi, dest, w, h, fps, tmp):
    righe = testo.split("\n")
    fs, passo = h // 16, int(h // 16 * 1.5)
    y0 = (h - passo * len(righe)) // 2
    filtri = []
    for i, riga in enumerate(righe):
        if not riga.strip():
            continue
        f_riga = Path(tmp) / f"{dest.stem}_{i}.txt"  # textfile evita problemi di escape
        f_riga.write_text(riga, encoding="utf-8")
        filtri.append(f"drawtext=fontfile='{font()}':textfile='{esc(f_riga)}':fontcolor=white:"
                      f"fontsize={fs}:x=(w-text_w)/2:y={y0 + i * passo}")
    esegui(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c=black:s={w}x{h}:r={fps}:d={secondi}",
            "-vf", ",".join(filtri) or "null", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])


def filtro_colore(globale, scena, lut):
    g, s = globale or {}, scena or {}
    contrasto = g.get("contrasto", 1.0) * s.get("contrasto", 1.0)
    saturazione = g.get("saturazione", 1.0) * s.get("saturazione", 1.0)
    luminosita = g.get("luminosita", 0.0) + s.get("luminosita", 0.0)
    gamma = g.get("gamma", 1.0) * s.get("gamma", 1.0)
    f = f"eq=contrast={contrasto:.3f}:saturation={saturazione:.3f}:brightness={luminosita:.3f}:gamma={gamma:.3f}"
    if lut:
        f += f",lut3d=file='{esc(lut)}'"
    return f


def normalizza(sorgente, scena, colore_globale, lut, dest, w, h, fps):
    durata = float(scena.get("durata", 5))
    inizio = 0.0
    if scena.get("secondi_validi"):
        a, b = scena["secondi_validi"]
        inizio, durata = float(a), min(durata, float(b) - float(a))
    vf = (f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black,"
          f"fps={fps},setsar=1,{filtro_colore(colore_globale, scena.get('colore'), lut)},"
          f"tpad=stop_mode=clone:stop_duration={durata},format=yuv420p")  # clip corte: allunga l'ultimo fotogramma
    esegui(["ffmpeg", "-v", "error", "-y", "-ss", f"{inizio}", "-i", str(sorgente), "-t", f"{durata}", "-an",
            "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", str(dest)])
    return durata


def correggi_loudness(video, obiettivo):
    """Secondo passaggio: misura la loudness integrata e corregge il guadagno (solo audio, video copiato)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True)
    valori = [l.split()[1] for l in r.stderr.splitlines() if l.strip().startswith("I:")]
    if not valori:
        return None
    misurato = float(valori[-1])
    delta = obiettivo - misurato
    if abs(delta) > 0.5:
        tmp = video.with_suffix(".tmp.mp4")
        esegui(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-c:v", "copy",
                "-af", f"volume={delta:.2f}dB,alimiter=limit=0.84:level=false",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(tmp)])
        tmp.replace(video)
    return misurato


def calcola_timeline(scaletta, T):
    voci, t = [], 0.0
    titolo = (scaletta.get("montaggio") or {}).get("titolo_iniziale") or scaletta.get("titolo")
    if titolo:
        voci.append({"segmento": "titolo", "inizio": 0.0, "durata": DURATA_TITOLO})
        t = DURATA_TITOLO - T
    for s in scaletta["scene"]:
        d = float(s.get("durata", 5))
        if s.get("secondi_validi"):
            d = min(d, float(s["secondi_validi"][1]) - float(s["secondi_validi"][0]))
        voci.append({"segmento": "scena", "id": s["id"], "capitolo": s.get("capitolo"),
                     "inizio": round(t, 2), "durata": d})
        t += d - T
    voci.append({"segmento": "coda", "inizio": round(t, 2), "durata": DURATA_CODA})
    return voci, round(t + DURATA_CODA, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--finale", action="store_true")
    ap.add_argument("--timeline", action="store_true")
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
    transizione = mont.get("transizione", "fade")

    timeline, totale = calcola_timeline(scaletta, T)
    scrivi_json(cli / "lavoro" / "timeline.json", {"durata_totale": totale, "segmenti": timeline})
    if a.timeline:
        print(f"OK → lavoro/timeline.json (durata prevista {totale:.1f} s)")
        return

    mancanti = [s["id"] for s in scaletta["scene"] if not (cli / "lavoro" / "clip" / nome_clip(s["id"])).exists()]
    if mancanti:
        sys.exit(f"ERRORE: clip mancanti per le scene {mancanti}")

    coda = mont.get("titoli_coda") or DICITURA_AI
    if "intelligenza artificiale" not in coda.lower():
        coda += "\n\n" + DICITURA_AI
    colore = mont.get("colore") or {}
    lut = trova(cli, colore["lut"]) if colore.get("lut") else None

    with tempfile.TemporaryDirectory() as tmp:
        segmenti = []
        if timeline[0]["segmento"] == "titolo":
            p = Path(tmp) / "00_titolo.mp4"
            cartello(mont.get("titolo_iniziale") or scaletta.get("titolo"), DURATA_TITOLO, p, w, h, fps, tmp)
            segmenti.append((p, DURATA_TITOLO))
        for s in scaletta["scene"]:
            p = Path(tmp) / f"seg_{int(s['id']):02d}.mp4"
            d = normalizza(cli / "lavoro" / "clip" / nome_clip(s["id"]), s, colore, lut, p, w, h, fps)
            segmenti.append((p, d))
        p = Path(tmp) / "99_coda.mp4"
        cartello(coda, DURATA_CODA, p, w, h, fps, tmp)
        segmenti.append((p, DURATA_CODA))

        cmd = ["ffmpeg", "-v", "error", "-y"]
        for p, _ in segmenti:
            cmd += ["-i", str(p)]
        filtri, prec, offset = [], "[0:v]", 0.0
        for i in range(1, len(segmenti)):
            offset += segmenti[i - 1][1] - T
            filtri.append(f"{prec}[{i}:v]xfade=transition={transizione}:duration={T}:offset={offset:.3f}[v{i}]")
            prec = f"[v{i}]"
        filtri.append(f"{prec}fade=t=in:st=0:d=1,fade=t=out:st={totale - 1.5:.3f}:d=1.5[vout]")

        # ---- audio: base musicale (o silenzio) + voci (con ducking) + effetti ----
        idx = len(segmenti)
        fmt = "aformat=sample_rates=48000:channel_layouts=stereo"
        if scaletta.get("musica"):
            cmd += ["-stream_loop", "-1", "-ss", str(mont.get("musica_inizio", 0)),
                    "-i", str(trova(cli, scaletta["musica"]))]
            filtri.append(f"[{idx}:a]{fmt},atrim=0:{totale:.3f},asetpts=PTS-STARTPTS,"
                          f"volume={mont.get('volume_musica', 0.8)},afade=t=in:st=0:d=2,"
                          f"afade=t=out:st={max(totale - 3, 0):.3f}:d=3[mus]")
        else:
            print("ATTENZIONE: nessuna musica impostata → solo voci/effetti o video muto")
            cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
            filtri.append(f"[{idx}:a]atrim=0:{totale:.3f}[mus]")
        idx += 1

        def tracce(elenco, prefisso):
            nonlocal idx
            etichette = []
            for n, el in enumerate(elenco):
                cmd.extend(["-i", str(trova(cli, el["file"]))])
                ms = int(float(el["inizio"]) * 1000)
                filtri.append(f"[{idx}:a]{fmt},volume={el.get('volume', 1.0)},adelay={ms}:all=1[{prefisso}{n}]")
                etichette.append(f"[{prefisso}{n}]")
                idx += 1
            return etichette

        voci = tracce(mont.get("voci") or [], "vo")
        effetti = tracce(mont.get("effetti") or [], "fx")
        da_mixare = ["[mus]"]
        if voci:
            filtri.append(f"{''.join(voci)}amix=inputs={len(voci)}:duration=longest:normalize=0,asplit[voc1][voc2]")
            filtri.append("[mus][voc1]sidechaincompress=threshold=0.03:ratio=6:attack=50:release=600[musd]")
            da_mixare = ["[musd]", "[voc2]"]
        da_mixare += effetti
        mix = f"amix=inputs={len(da_mixare)}:duration=first:normalize=0," if len(da_mixare) > 1 else ""
        filtri.append(f"{''.join(da_mixare)}{mix}loudnorm=I={cfg.get('loudness_lufs', -16)}:TP=-1.5:LRA=11,"
                      f"{fmt}[aout]")

        qualita = ["-preset", "slow", "-crf", "17"] if a.finale else ["-preset", "veryfast", "-crf", "23"]
        dest = cli / "output" / ("finale.mp4" if a.finale else "bozza.mp4")
        cmd += ["-filter_complex", ";".join(filtri), "-map", "[vout]", "-map", "[aout]",
                "-c:v", "libx264", *qualita, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", "-t", f"{totale:.3f}", str(dest)]
        esegui(cmd)
    obiettivo = cfg.get("loudness_lufs", -16)
    misurato = correggi_loudness(dest, obiettivo)
    print(f"OK → {dest}  (durata {totale:.1f} s, {len(scaletta['scene'])} scene, "
          f"{len(voci)} voci, {len(effetti)} effetti, loudness {misurato} → {obiettivo} LUFS)")


if __name__ == "__main__":
    main()
