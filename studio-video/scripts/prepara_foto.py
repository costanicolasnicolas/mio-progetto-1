"""Prepara le foto per il video: raddrizza (EXIF), usa la versione restaurata se esiste,
inquadra nel formato di uscita con fondo sfocato e ridimensiona. Tutto in locale, gratis.

Uso:
  python scripts/prepara_foto.py clienti/<codice>
  python scripts/prepara_foto.py clienti/<codice> --scarta-restauro a.jpg,b.jpg   # usa l'originale
Uscita: lavoro/foto_pronte/<nome>.jpg
"""
import argparse
import subprocess
import sys
from pathlib import Path

from comune import ESTENSIONI_FOTO, carica_config, cartella_cliente, file_con_estensioni


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--scarta-restauro", default="")
    a = ap.parse_args()

    cfg = carica_config()["uscita"]
    w, h = cfg["larghezza"], cfg["altezza"]
    cli = cartella_cliente(a.cliente)
    scarta = {x.strip() for x in a.scarta_restauro.split(",") if x.strip()}
    dest_dir = cli / "lavoro" / "foto_pronte"
    dest_dir.mkdir(parents=True, exist_ok=True)

    vf = (f"split[a][b];"
          f"[a]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=30:3,eq=brightness=-0.08[sf];"
          f"[b]scale={w}:{h}:force_original_aspect_ratio=decrease[pp];"
          f"[sf][pp]overlay=(W-w)/2:(H-h)/2")
    foto = file_con_estensioni(cli / "foto", ESTENSIONI_FOTO)
    if not foto:
        sys.exit("ERRORE: nessuna foto in foto/")
    restaurate = 0
    for f in foto:
        rest = cli / "lavoro" / "foto_restaurate" / (f.stem + ".jpg")
        src = rest if rest.exists() and f.name not in scarta else f
        restaurate += src == rest
        dest = dest_dir / (f.stem + ".jpg")
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", vf,
                            "-frames:v", "1", "-q:v", "2", str(dest)], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"ERRORE su {f.name}: {r.stderr.strip()[-300:]}")
    print(f"OK → {len(foto)} foto pronte in {dest_dir} ({restaurate} da versione restaurata)")


if __name__ == "__main__":
    main()
