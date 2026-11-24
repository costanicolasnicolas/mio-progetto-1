"""Genera le clip video (image-to-video) per ogni scena di lavoro/scaletta.json.

Uso:
  python scripts/genera_clip.py clienti/<codice> --stima        # solo costo stimato, nessuna chiamata
  python scripts/genera_clip.py clienti/<codice> --prova        # simula tutto senza spendere
  python scripts/genera_clip.py clienti/<codice>                # genera le scene mancanti
  python scripts/genera_clip.py clienti/<codice> --solo 3,7     # rigenera solo queste scene

Chiave API: variabile d'ambiente FAL_KEY. Tetto di spesa: config.json → budget_max_usd.
La spesa effettiva viene registrata in lavoro/spesa.json: superato il tetto, lo script si ferma.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime

from comune import carica_config, cartella_cliente, leggi_json, nome_clip, scrivi_json

CODA = "https://queue.fal.run/"
LIMITE_FOTO_MB = 8


def durata_ammessa(richiesta, ammesse):
    """La durata ammessa più piccola che copre quella richiesta (altrimenti la massima)."""
    for d in sorted(ammesse):
        if d >= richiesta:
            return d
    return max(ammesse)


def piano(scaletta, config, solo=None):
    righe = []
    for s in scaletta["scene"]:
        if solo and s["id"] not in solo:
            continue
        m = config["modelli"][s.get("livello", "standard")]
        d = durata_ammessa(s.get("durata", 5), m["durate_ammesse"])
        righe.append({"scena": s, "modello": m, "durata": d,
                      "costo": round(d * m["prezzo_usd_secondo"], 3)})
    return righe


def data_uri(percorso):
    dimensione = percorso.stat().st_size / 1e6
    if dimensione > LIMITE_FOTO_MB:
        sys.exit(f"ERRORE: {percorso.name} pesa {dimensione:.1f} MB: riducila sotto {LIMITE_FOTO_MB} MB")
    tipo = mimetypes.guess_type(percorso.name)[0] or "image/jpeg"
    return f"data:{tipo};base64," + base64.b64encode(percorso.read_bytes()).decode()


def http(metodo, url, chiave, corpo=None):
    req = urllib.request.Request(url, method=metodo, data=json.dumps(corpo).encode() if corpo else None)
    req.add_header("Authorization", f"Key {chiave}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} su {url}: {e.read().decode()[:500]}") from None


def scarica(url, destinazione):
    with urllib.request.urlopen(url, timeout=300) as r, open(destinazione, "wb") as f:
        f.write(r.read())


def genera(riga, cli, chiave):
    s, m = riga["scena"], riga["modello"]
    corpo = {
        "prompt": s["prompt"],
        m["campo_immagine"]: data_uri(cli / s["foto"]),
        "duration": str(riga["durata"]),
        **m.get("parametri_extra", {}),
    }
    if s.get("negative_prompt"):
        corpo["negative_prompt"] = s["negative_prompt"]

    inviata = http("POST", CODA + m["id"], chiave, corpo)
    stato_url, risultato_url = inviata["status_url"], inviata["response_url"]
    inizio = time.time()
    while True:
        stato = http("GET", stato_url, chiave)
        if stato.get("status") == "COMPLETED":
            break
        if time.time() - inizio > 900:
            raise RuntimeError("timeout 15 minuti")
        time.sleep(6)
    risultato = http("GET", risultato_url, chiave)
    video = risultato.get("video") or {}
    if not video.get("url"):
        raise RuntimeError(f"risposta senza video: {json.dumps(risultato)[:300]}")
    scarica(video["url"], cli / "lavoro" / "clip" / nome_clip(s["id"]))
    return inviata.get("request_id")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--stima", action="store_true")
    ap.add_argument("--prova", action="store_true")
    ap.add_argument("--solo", default="")
    a = ap.parse_args()

    config = carica_config()
    cli = cartella_cliente(a.cliente)
    scaletta = leggi_json(cli / "lavoro" / "scaletta.json")
    if not scaletta:
        sys.exit("ERRORE: manca lavoro/scaletta.json (prima sceneggiatore + regista)")
    solo = {int(x) for x in a.solo.split(",") if x.strip()} or None
    (cli / "lavoro" / "clip").mkdir(parents=True, exist_ok=True)

    righe = piano(scaletta, config, solo)
    if not solo:  # senza --solo salta le scene già generate
        righe = [r for r in righe if not (cli / "lavoro" / "clip" / nome_clip(r["scena"]["id"])).exists()]

    spesa = leggi_json(cli / "lavoro" / "spesa.json", {"totale_usd": 0.0, "voci": []})
    tetto = config["budget_max_usd"]
    stimato = sum(r["costo"] for r in righe)
    print(f"Scene da generare: {len(righe)} | costo stimato: ${stimato:.2f} | "
          f"già speso: ${spesa['totale_usd']:.2f} | tetto: ${tetto:.2f}")
    if a.stima:
        for r in righe:
            print(f"  scena {r['scena']['id']:>2}  {r['scena'].get('livello','standard'):8} "
                  f"{r['durata']:>2}s  ${r['costo']:.2f}")
        return

    for r in righe:
        if not r["scena"].get("prompt"):
            sys.exit(f"ERRORE: scena {r['scena']['id']} senza prompt (manca il passaggio del regista)")
        if not (cli / r["scena"]["foto"]).exists():
            sys.exit(f"ERRORE: foto mancante per la scena {r['scena']['id']}: {r['scena']['foto']}")

    chiave = os.environ.get("FAL_KEY")
    if not chiave and not a.prova:
        sys.exit("ERRORE: imposta la variabile d'ambiente FAL_KEY")

    tentativi = {str(v["scena"]): 0 for v in spesa["voci"]}
    for v in spesa["voci"]:
        tentativi[str(v["scena"])] += 1

    for r in righe:
        sid = r["scena"]["id"]
        if spesa["totale_usd"] + r["costo"] > tetto:
            print(f"STOP: la scena {sid} farebbe superare il tetto di ${tetto:.2f}. Chiedere all'utente.")
            break
        if tentativi.get(str(sid), 0) >= config["tentativi_max_per_scena"] + 1:
            print(f"SALTO scena {sid}: tentativi esauriti. Chiedere all'utente.")
            continue
        print(f"Scena {sid}: {r['modello']['id']} {r['durata']}s (${r['costo']:.2f}) ...", flush=True)
        if a.prova:
            print("  [prova] nessuna chiamata eseguita")
            continue
        try:
            req_id = genera(r, cli, chiave)
            esito = "ok"
        except Exception as e:  # registra comunque: la chiamata può essere stata addebitata
            req_id, esito = None, f"errore: {e}"
            print(f"  {esito}")
        spesa["totale_usd"] = round(spesa["totale_usd"] + r["costo"], 3)
        spesa["voci"].append({"scena": sid, "modello": r["modello"]["id"], "costo_usd": r["costo"],
                              "esito": esito, "request_id": req_id,
                              "quando": datetime.now().isoformat(timespec="seconds")})
        tentativi[str(sid)] = tentativi.get(str(sid), 0) + 1
        scrivi_json(cli / "lavoro" / "spesa.json", spesa)
        if esito == "ok":
            print(f"  OK → lavoro/clip/{nome_clip(sid)}")

    print(f"Spesa totale registrata: ${spesa['totale_usd']:.2f}")


if __name__ == "__main__":
    main()
