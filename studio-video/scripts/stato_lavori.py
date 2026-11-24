"""Scheda di stato dei lavori (per il production-manager).

Uso:
  python scripts/stato_lavori.py                 # tutti i clienti
  python scripts/stato_lavori.py clienti/<codice> # un cliente in dettaglio
"""
import json
import sys
from pathlib import Path

from comune import (ESTENSIONI_AUDIO, ESTENSIONI_FOTO, RADICE, carica_config, file_con_estensioni,
                    leggi_json, nome_clip)


def scheda(cli, budget):
    lav = cli / "lavoro"
    scal = leggi_json(lav / "scaletta.json") or {}
    scene = scal.get("scene", [])
    n = len(scene)
    qc = leggi_json(lav / "qc.json", {"scene": []})
    spesa = leggi_json(lav / "spesa.json", {"totale_usd": 0.0, "voci": []})
    cicli = []
    if (lav / "miglioramenti.jsonl").exists():
        for riga in (lav / "miglioramenti.jsonl").read_text(encoding="utf-8").splitlines():
            try:
                cicli.append(json.loads(riga))
            except json.JSONDecodeError:
                pass
    aperti = sorted({c.get("reparto", "?") for c in cicli
                     if any(isinstance(v, (int, float)) and v < 4 for v in (c.get("voti") or {}).values())})

    def ok(cond):
        return "OK " if cond else "-- "

    consenso = any((cli / f"consenso{e}").exists() for e in (".pdf", ".jpg", ".jpeg", ".png"))
    righe = [
        f"{ok(consenso)}consenso firmato",
        f"{ok(file_con_estensioni(cli / 'audio', ESTENSIONI_AUDIO))}audio: {len(file_con_estensioni(cli / 'audio', ESTENSIONI_AUDIO))}",
        f"{ok(len(file_con_estensioni(cli / 'foto', ESTENSIONI_FOTO)) >= 8)}foto: {len(file_con_estensioni(cli / 'foto', ESTENSIONI_FOTO))}",
        f"{ok((lav / 'trascrizione.txt').exists())}trascrizione",
        f"{ok((lav / 'foto_indice.json').exists())}indice e diagnosi foto",
        f"{ok((lav / 'foto_pronte').is_dir())}foto pronte (laboratorio)",
        f"{ok(n)}scaletta: {n} scene, stile {scal.get('stile', '?')}",
        f"{ok((lav / 'look.md').exists())}look",
        f"{ok(n and all(s.get('prompt') for s in scene))}prompt: {sum(1 for s in scene if s.get('prompt'))}/{n}",
        f"{ok(n and all(s.get('keyframe') for s in scene))}keyframe di stile: {sum(1 for s in scene if s.get('keyframe'))}/{n}",
        f"{ok(n and all((lav / 'clip' / nome_clip(s['id'])).exists() for s in scene))}clip: "
        f"{sum(1 for s in scene if (lav / 'clip' / nome_clip(s['id'])).exists())}/{n}",
        f"{ok((lav / 'qc.json').exists())}controllo VFX: "
        f"{sum(1 for x in qc['scene'] if x.get('esito') == 'rifare')} da rifare",
        f"{ok((cli / 'output' / 'bozza.mp4').exists())}bozza",
        f"{ok((cli / 'output' / 'finale.mp4').exists())}finale",
        f"    spesa: ${spesa['totale_usd']:.2f} / ${budget:.2f} ({spesa['totale_usd'] / budget:.0%})",
        f"    cicli di miglioramento: {len(cicli)} | reparti con voti < 4: {', '.join(aperti) or 'nessuno'}",
    ]
    return "\n".join(righe)


def main():
    budget = carica_config()["budget_max_usd"]
    if len(sys.argv) > 1:
        cli = Path(sys.argv[1]).resolve()
        print(f"=== {cli.name} ===\n{scheda(cli, budget)}")
        return
    for cli in sorted(p for p in (RADICE / "clienti").iterdir() if p.is_dir()):
        print(f"=== {cli.name} ===\n{scheda(cli, budget)}\n")


if __name__ == "__main__":
    main()
