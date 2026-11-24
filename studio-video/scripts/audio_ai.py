"""Voce narrante ed effetti sonori generati con ElevenLabs.

Uso:
  python scripts/audio_ai.py voce "Era l'estate del 2015..." --uscita clienti/X/lavoro/audio/voce_01.mp3
  python scripts/audio_ai.py sfx "gentle ocean waves on a beach" --durata 4 --uscita clienti/X/lavoro/audio/sfx_01.mp3

Chiave: variabile d'ambiente ELEVENLABS_API_KEY. Voce: config.json → audio_ai.voce_id.
Endpoint e parametri DA VERIFICARE sulla documentazione ElevenLabs prima del primo uso.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from comune import carica_config

BASE = "https://api.elevenlabs.io/v1/"


def chiama(percorso, corpo, chiave, uscita):
    req = urllib.request.Request(BASE + percorso, method="POST", data=json.dumps(corpo).encode())
    req.add_header("xi-api-key", chiave)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "audio/mpeg")
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            dati = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ERRORE HTTP {e.code}: {e.read().decode()[:500]}")
    Path(uscita).parent.mkdir(parents=True, exist_ok=True)
    Path(uscita).write_bytes(dati)
    print(f"OK → {uscita} ({len(dati) // 1024} KB)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tipo", choices=["voce", "sfx"])
    ap.add_argument("testo")
    ap.add_argument("--uscita", required=True)
    ap.add_argument("--durata", type=float, default=None, help="sfx: secondi")
    a = ap.parse_args()

    chiave = os.environ.get("ELEVENLABS_API_KEY")
    if not chiave:
        sys.exit("ERRORE: imposta la variabile d'ambiente ELEVENLABS_API_KEY")
    cfg = carica_config()["audio_ai"]

    if a.tipo == "voce":
        if cfg["voce_id"] == "DA_IMPOSTARE":
            sys.exit("ERRORE: imposta config.json → audio_ai.voce_id (id della voce scelta su ElevenLabs)")
        chiama(f"text-to-speech/{cfg['voce_id']}",
               {"text": a.testo, "model_id": cfg["modello_voce"]}, chiave, a.uscita)
    else:
        corpo = {"text": a.testo}
        if a.durata:
            corpo["duration_seconds"] = a.durata
        chiama("sound-generation", corpo, chiave, a.uscita)


if __name__ == "__main__":
    main()
