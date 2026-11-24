"""Funzioni condivise dagli script dello studio video."""
import json
import os
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
ESTENSIONI_FOTO = {".jpg", ".jpeg", ".png", ".webp"}
ESTENSIONI_AUDIO = {".mp3", ".m4a", ".ogg", ".opus", ".wav", ".aac", ".mp4"}


def carica_config():
    with open(RADICE / "config.json", encoding="utf-8") as f:
        return json.load(f)


def cartella_cliente(arg):
    p = Path(arg)
    if not p.is_absolute():
        p = (Path.cwd() / p).resolve()
    if not p.is_dir():
        sys.exit(f"ERRORE: cartella cliente non trovata: {p}")
    for sub in ("audio", "foto", "lavoro", "output"):
        (p / sub).mkdir(exist_ok=True)
    return p


def leggi_json(percorso, predefinito=None):
    percorso = Path(percorso)
    if not percorso.exists():
        return predefinito
    with open(percorso, encoding="utf-8") as f:
        return json.load(f)


def scrivi_json(percorso, dati):
    percorso = Path(percorso)
    percorso.parent.mkdir(parents=True, exist_ok=True)
    tmp = percorso.with_suffix(percorso.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(dati, f, ensure_ascii=False, indent=2)
    os.replace(tmp, percorso)


def nome_clip(scena_id):
    return f"scena_{int(scena_id):02d}.mp4"


def file_con_estensioni(cartella, estensioni):
    return sorted(p for p in Path(cartella).iterdir() if p.suffix.lower() in estensioni)
