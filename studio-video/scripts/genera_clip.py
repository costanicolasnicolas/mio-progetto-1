"""Genera le clip video (image-to-video) per ogni scena di lavoro/scaletta.json.

Uso:
  python scripts/genera_clip.py clienti/<codice> --stima        # solo costo stimato, nessuna chiamata
  python scripts/genera_clip.py clienti/<codice> --prova        # simula senza spendere
  python scripts/genera_clip.py clienti/<codice>                # genera le scene mancanti
  python scripts/genera_clip.py clienti/<codice> --solo 3,7     # rigenera solo queste scene

Immagine usata per ogni scena: keyframe stilizzato → foto pronta → foto originale.
Tetto di spesa: config.json → budget_max_usd (condiviso con trasforma_foto.py).
"""
import argparse
import sys

from comune import (carica_config, cartella_cliente, chiave_fal, data_uri, fal_esegui, leggi_json,
                    leggi_spesa, lista_id, nome_clip, registra_spesa, scarica, sorgente_scena,
                    tentativi_per, url_risultato)


def durata_ammessa(richiesta, ammesse):
    """La durata ammessa più piccola che copre quella richiesta (altrimenti la massima)."""
    for d in sorted(ammesse):
        if d >= richiesta:
            return d
    return max(ammesse)


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
        sys.exit("ERRORE: manca lavoro/scaletta.json")
    solo = lista_id(a.solo)
    cartella_clip = cli / "lavoro" / "clip"
    cartella_clip.mkdir(parents=True, exist_ok=True)

    righe = []
    for s in scaletta["scene"]:
        if solo and s["id"] not in solo:
            continue
        if not solo and (cartella_clip / nome_clip(s["id"])).exists():
            continue  # senza --solo salta le scene già generate
        m = config["modelli_video"][s.get("livello", "standard")]
        d = durata_ammessa(s.get("durata", 5), m["durate_ammesse"])
        righe.append({"scena": s, "modello": m, "durata": d, "costo": round(d * m["prezzo_usd_secondo"], 3)})

    spesa = leggi_spesa(cli)
    tetto = config["budget_max_usd"]
    stimato = sum(r["costo"] for r in righe)
    print(f"Clip da generare: {len(righe)} | stimato: ${stimato:.2f} | già speso: ${spesa['totale_usd']:.2f} "
          f"| tetto: ${tetto:.2f} | residuo dopo: ${tetto - spesa['totale_usd'] - stimato:.2f}")
    if a.stima:
        for r in righe:
            print(f"  scena {r['scena']['id']:>2}  {r['scena'].get('livello', 'standard'):8} "
                  f"{r['durata']:>2}s  ${r['costo']:.2f}  ← {sorgente_scena(cli, r['scena']).relative_to(cli)}")
        return

    for r in righe:
        s = r["scena"]
        if not s.get("prompt"):
            sys.exit(f"ERRORE: scena {s['id']} senza prompt (manca il passaggio del regista)")
        if not sorgente_scena(cli, s).exists():
            sys.exit(f"ERRORE: immagine mancante per la scena {s['id']}: {s['foto']}")

    chiave = chiave_fal(obbligatoria=not a.prova)
    max_tentativi = config["tentativi_max_per_elemento"] + 1

    for r in righe:
        s, m = r["scena"], r["modello"]
        if spesa["totale_usd"] + r["costo"] > tetto:
            print(f"STOP: la scena {s['id']} farebbe superare il tetto di ${tetto:.2f}. Chiedere all'utente.")
            break
        if tentativi_per(spesa, "video", s["id"]) >= max_tentativi:
            print(f"SALTO scena {s['id']}: tentativi esauriti → semplificare la scena (regista).")
            continue
        sorgente = sorgente_scena(cli, s)
        print(f"Scena {s['id']}: {m['id']} {r['durata']}s (${r['costo']:.2f}) da {sorgente.name} ...", flush=True)
        if a.prova:
            print("  [prova] nessuna chiamata eseguita")
            continue
        corpo = {"prompt": s["prompt"], m["campo_immagine"]: data_uri(sorgente),
                 "duration": str(r["durata"]), **m.get("parametri_extra", {})}
        if s.get("negative_prompt"):
            corpo["negative_prompt"] = s["negative_prompt"]
        try:
            ris = fal_esegui(m["id"], corpo, chiave)
            scarica(url_risultato(ris, "video"), cartella_clip / nome_clip(s["id"]))
            esito, req = "ok", ris.get("_request_id")
            print(f"  OK → lavoro/clip/{nome_clip(s['id'])}")
        except Exception as e:  # registra comunque: la chiamata può essere stata addebitata
            esito, req = f"errore: {e}", None
            print(f"  {esito}")
        registra_spesa(cli, spesa, {"tipo": "video", "elemento": s["id"], "modello": m["id"],
                                    "costo_usd": r["costo"], "esito": esito, "request_id": req})

    print(f"Spesa totale registrata: ${spesa['totale_usd']:.2f}")


if __name__ == "__main__":
    main()
