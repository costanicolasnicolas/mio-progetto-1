"""Laboratorio foto: restauro e trasformazione nello stile scelto (image-to-image via fal.ai).

Restauro (restauratore-foto), su foto originali → lavoro/foto_restaurate/:
  python scripts/trasforma_foto.py clienti/<codice> --modo restauro --foto a.jpg,b.jpg [--stima|--prova]

Stile (artista-stile), per le scene della scaletta → lavoro/keyframe/ (+ campo "keyframe" nella scena):
  python scripts/trasforma_foto.py clienti/<codice> --modo stile [--stima|--prova] [--solo 3,7]

Il prompt di stile viene da stile/<stile>.md (riga prompt_trasformazione:); una scena può
sovrascriverlo o arricchirlo con il proprio campo "prompt_trasformazione".
Ogni foto viene stilizzata una sola volta e riusata dalle scene che la condividono.
"""
import argparse
import hashlib
import sys
from pathlib import Path

from comune import (carica_config, cartella_cliente, chiave_fal, data_uri, fal_esegui, foto_pronta,
                    leggi_json, leggi_spesa, leggi_stile, lista_id, registra_spesa, scarica,
                    scrivi_json, tentativi_per, url_risultato)


def lavori_restauro(cli, nomi):
    lavori = []
    for n in nomi:
        src = cli / "foto" / n
        if not src.exists():
            sys.exit(f"ERRORE: foto non trovata: {src}")
        lavori.append({"chiave": f"restauro:{n}", "sorgente": src, "prompt": None,
                       "dest": cli / "lavoro" / "foto_restaurate" / (Path(n).stem + ".jpg"), "scene": []})
    return lavori


def lavori_stile(cli, scaletta, prompt_stile, solo, rifai):
    per_chiave = {}
    for s in scaletta["scene"]:
        if solo and s["id"] not in solo:
            continue
        extra = (s.get("prompt_trasformazione") or "").strip()
        prompt = f"{prompt_stile} {extra}".strip()
        chiave = f"stile:{s['foto']}:{hashlib.md5(prompt.encode()).hexdigest()[:8]}"
        if chiave not in per_chiave:
            fp = foto_pronta(cli, s["foto"])
            src = fp if fp.exists() else cli / s["foto"]
            dest = cli / "lavoro" / "keyframe" / f"{Path(s['foto']).stem}_{chiave[-8:]}.png"
            per_chiave[chiave] = {"chiave": chiave, "sorgente": src, "prompt": prompt, "dest": dest, "scene": []}
        per_chiave[chiave]["scene"].append(s)
    lavori = list(per_chiave.values())
    for l in lavori:  # keyframe già esistenti: collegali alle scene che li usano
        if l["dest"].exists():
            for s in l["scene"]:
                s["keyframe"] = str(l["dest"].relative_to(cli))
    if not rifai:
        lavori = [l for l in lavori if not l["dest"].exists()]
    return lavori


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cliente")
    ap.add_argument("--modo", choices=["restauro", "stile"], required=True)
    ap.add_argument("--foto", default="", help="restauro: nomi file separati da virgola")
    ap.add_argument("--solo", default="", help="stile: id scene da (ri)fare")
    ap.add_argument("--stima", action="store_true")
    ap.add_argument("--prova", action="store_true")
    a = ap.parse_args()

    config = carica_config()
    cli = cartella_cliente(a.cliente)
    modello = config["modelli_immagine"][a.modo]
    solo = lista_id(a.solo)

    if a.modo == "restauro":
        nomi = [x.strip() for x in a.foto.split(",") if x.strip()]
        if not nomi:
            sys.exit("ERRORE: indica le foto da restaurare con --foto a.jpg,b.jpg")
        lavori = lavori_restauro(cli, nomi)
        for l in lavori:
            l["prompt"] = modello["prompt"]
        scaletta = None
    else:
        scaletta = leggi_json(cli / "lavoro" / "scaletta.json")
        if not scaletta:
            sys.exit("ERRORE: manca lavoro/scaletta.json")
        _, campi = leggi_stile(scaletta.get("stile", "realistico_cinematico"))
        prompt_stile = campi.get("prompt_trasformazione", "nessuna")
        if prompt_stile.lower() == "nessuna":
            print(f"Lo stile '{scaletta.get('stile')}' non richiede trasformazione: nessun keyframe.")
            return
        lavori = lavori_stile(cli, scaletta, prompt_stile, solo, rifai=bool(solo))
        if not a.stima and not a.prova:
            scrivi_json(cli / "lavoro" / "scaletta.json", scaletta)

    spesa = leggi_spesa(cli)
    tetto, costo = config["budget_max_usd"], modello["prezzo_usd_immagine"]
    print(f"Immagini da elaborare ({a.modo}): {len(lavori)} | stimato: ${len(lavori) * costo:.2f} | "
          f"già speso: ${spesa['totale_usd']:.2f} | tetto: ${tetto:.2f}")
    if a.stima:
        for l in lavori:
            ids = ",".join(str(s["id"]) for s in l["scene"]) or "-"
            print(f"  {l['sorgente'].name:30} scene [{ids}]  ${costo:.2f}")
        return

    chiave = chiave_fal(obbligatoria=not a.prova)
    max_tentativi = config["tentativi_max_per_elemento"] + 1
    for l in lavori:
        if spesa["totale_usd"] + costo > tetto:
            print(f"STOP: tetto di ${tetto:.2f} raggiunto. Chiedere all'utente.")
            break
        if tentativi_per(spesa, "immagine", l["chiave"]) >= max_tentativi:
            print(f"SALTO {l['sorgente'].name}: tentativi esauriti → cambiare foto o prompt.")
            continue
        print(f"{a.modo}: {l['sorgente'].name} → {l['dest'].relative_to(cli)} ...", flush=True)
        if a.prova:
            print("  [prova] nessuna chiamata eseguita")
            continue
        corpo = {"prompt": l["prompt"], modello["campo_immagine"]: data_uri(l["sorgente"]),
                 **modello.get("parametri_extra", {})}
        try:
            ris = fal_esegui(modello["id"], corpo, chiave, timeout_s=300)
            scarica(url_risultato(ris, "immagine"), l["dest"])
            esito, req = "ok", ris.get("_request_id")
            for s in l["scene"]:
                s["keyframe"] = str(l["dest"].relative_to(cli))
            print("  OK")
        except Exception as e:
            esito, req = f"errore: {e}", None
            print(f"  {esito}")
        registra_spesa(cli, spesa, {"tipo": "immagine", "elemento": l["chiave"], "modello": modello["id"],
                                    "costo_usd": costo, "esito": esito, "request_id": req})
        if scaletta is not None:
            scrivi_json(cli / "lavoro" / "scaletta.json", scaletta)

    print(f"Spesa totale registrata: ${spesa['totale_usd']:.2f}")


if __name__ == "__main__":
    main()
