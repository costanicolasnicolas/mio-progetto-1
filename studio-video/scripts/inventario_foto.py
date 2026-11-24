"""Crea lavoro/foto_indice.json con l'elenco delle foto del cliente.

Uso: python scripts/inventario_foto.py clienti/<codice>
Il campo "descrizione" lo compila poi Claude guardando le foto.
"""
import subprocess
import sys

from comune import ESTENSIONI_FOTO, cartella_cliente, file_con_estensioni, scrivi_json


def dimensioni(percorso):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height", "-of", "csv=p=0", str(percorso)],
            capture_output=True, text=True, check=True).stdout.strip()
        w, h = (int(x) for x in out.split(",")[:2])
        return w, h
    except Exception:
        return None, None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cli = cartella_cliente(sys.argv[1])
    foto = file_con_estensioni(cli / "foto", ESTENSIONI_FOTO)
    if len(foto) < 8:
        print(f"ATTENZIONE: solo {len(foto)} foto (consigliate almeno 15)")
    indice = []
    for f in foto:
        w, h = dimensioni(f)
        indice.append({
            "file": f"foto/{f.name}",
            "larghezza": w,
            "altezza": h,
            "orientamento": None if not w else ("orizzontale" if w >= h else "verticale"),
            "bassa_risoluzione": bool(w and min(w, h) < 720),
            "descrizione": "",
            "persone": None,
            "diagnosi": "",
            "utilizzabile": True,
            "priorita": 2,
        })
    scrivi_json(cli / "lavoro" / "foto_indice.json", indice)
    basse = sum(1 for x in indice if x["bassa_risoluzione"])
    print(f"OK → {len(indice)} foto indicizzate, {basse} a bassa risoluzione")


if __name__ == "__main__":
    main()
