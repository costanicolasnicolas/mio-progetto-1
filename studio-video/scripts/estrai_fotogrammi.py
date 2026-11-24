"""Estrae 3 fotogrammi (inizio, metà, fine) da ogni clip per il controllo qualità.

Uso: python scripts/estrai_fotogrammi.py clienti/<codice> [--solo 3,7]
"""
import argparse
import subprocess

from comune import cartella_cliente


def durata(percorso):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(percorso)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--solo", default="")
    a = ap.parse_args()
    cli = cartella_cliente(a.cliente)
    solo = {int(x) for x in a.solo.split(",") if x.strip()}
    dest = cli / "lavoro" / "fotogrammi"
    dest.mkdir(parents=True, exist_ok=True)

    clip = sorted((cli / "lavoro" / "clip").glob("scena_*.mp4"))
    for c in clip:
        sid = int(c.stem.split("_")[1])
        if solo and sid not in solo:
            continue
        d = durata(c)
        for nome, t in (("inizio", 0.2), ("meta", d / 2), ("fine", max(d - 0.3, 0))):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(c),
                            "-frames:v", "1", "-q:v", "3", str(dest / f"{c.stem}_{nome}.jpg")], check=True)
    print(f"OK → fotogrammi di {len(clip)} clip in {dest}")


if __name__ == "__main__":
    main()
