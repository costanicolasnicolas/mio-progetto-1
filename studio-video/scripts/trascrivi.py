"""Trascrive gli audio del cliente in lavoro/trascrizione.txt.

Uso: python scripts/trascrivi.py clienti/<codice> [--modello small|medium|large-v3]

Richiede faster-whisper (gira in locale, gratis):  pip install faster-whisper
Sul PC con scheda NVIDIA usa la GPU in automatico se CUDA è installato, altrimenti CPU.
"""
import argparse
import sys

from comune import ESTENSIONI_AUDIO, cartella_cliente, file_con_estensioni


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--modello", default="medium")
    ap.add_argument("--lingua", default="it")
    a = ap.parse_args()

    cli = cartella_cliente(a.cliente)
    audio = file_con_estensioni(cli / "audio", ESTENSIONI_AUDIO)
    if not audio:
        sys.exit("ERRORE: nessun file audio in audio/")

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("ERRORE: installa faster-whisper →  pip install faster-whisper")

    try:
        modello = WhisperModel(a.modello, device="cuda", compute_type="float16")
    except Exception:
        modello = WhisperModel(a.modello, device="cpu", compute_type="int8")

    parti = []
    for f in audio:
        print(f"Trascrivo {f.name} ...")
        segmenti, _ = modello.transcribe(str(f), language=a.lingua, vad_filter=True)
        testo = " ".join(s.text.strip() for s in segmenti)
        parti.append(f"### {f.name}\n{testo}\n")

    out = cli / "lavoro" / "trascrizione.txt"
    out.write_text("\n".join(parti), encoding="utf-8")
    print(f"OK → {out}  ({sum(len(p.split()) for p in parti)} parole)")


if __name__ == "__main__":
    main()
