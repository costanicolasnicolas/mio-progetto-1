"""Estrae fotogrammi per il controllo qualità.

Uso:
  python scripts/estrai_fotogrammi.py clienti/<codice> [--solo 3,7]
      → 3 fotogrammi (inizio, metà, fine) per ogni clip in lavoro/fotogrammi/
  python scripts/estrai_fotogrammi.py clienti/<codice> --da-video output/bozza.mp4 [--ogni 4]
      → un fotogramma ogni N secondi del video montato in lavoro/fotogrammi_bozza/
"""
import argparse
import subprocess

from comune import cartella_cliente, lista_id


def durata(percorso):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(percorso)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def fotogramma(video, t, dest):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video),
                    "-frames:v", "1", "-q:v", "3", "-vf", "scale=960:-2", str(dest)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--solo", default="")
    ap.add_argument("--da-video", default="")
    ap.add_argument("--ogni", type=float, default=4.0)
    a = ap.parse_args()
    cli = cartella_cliente(a.cliente)

    if a.da_video:
        video = cli / a.da_video
        dest = cli / "lavoro" / "fotogrammi_bozza"
        dest.mkdir(parents=True, exist_ok=True)
        for f in dest.glob("*.jpg"):
            f.unlink()
        d, t, n = durata(video), 0.5, 0
        while t < d:
            fotogramma(video, t, dest / f"t_{int(t):04d}s.jpg")
            t += a.ogni
            n += 1
        print(f"OK → {n} fotogrammi della bozza in {dest}")
        return

    solo = lista_id(a.solo)
    dest = cli / "lavoro" / "fotogrammi"
    dest.mkdir(parents=True, exist_ok=True)
    n = 0
    for c in sorted((cli / "lavoro" / "clip").glob("scena_*.mp4")):
        sid = int(c.stem.split("_")[1])
        if solo and sid not in solo:
            continue
        d = durata(c)
        for nome, t in (("inizio", 0.2), ("meta", d / 2), ("fine", max(d - 0.3, 0))):
            fotogramma(c, t, dest / f"{c.stem}_{nome}.jpg")
        n += 1
    print(f"OK → fotogrammi di {n} clip in {dest}")


if __name__ == "__main__":
    main()
