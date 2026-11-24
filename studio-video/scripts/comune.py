"""Funzioni condivise dagli script dello studio video."""
import base64
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
ESTENSIONI_FOTO = {".jpg", ".jpeg", ".png", ".webp"}
ESTENSIONI_AUDIO = {".mp3", ".m4a", ".ogg", ".opus", ".wav", ".aac", ".mp4"}
CODA_FAL = "https://queue.fal.run/"
LIMITE_FOTO_MB = 8


# ---------- file e cartelle ----------

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
    cartella = Path(cartella)
    if not cartella.is_dir():
        return []
    return sorted(p for p in cartella.iterdir() if p.suffix.lower() in estensioni)


def lista_id(testo):
    return {int(x) for x in (testo or "").split(",") if x.strip()}


# ---------- stile ----------

def leggi_stile(nome):
    """Restituisce il testo del file di stile e un dizionario dei campi 'chiave: valore'."""
    p = RADICE / "stile" / f"{nome}.md"
    if not p.exists():
        disponibili = sorted(x.stem for x in (RADICE / "stile").glob("*.md") if x.stem != "INDICE")
        sys.exit(f"ERRORE: stile '{nome}' inesistente. Disponibili: {', '.join(disponibili)}")
    testo = p.read_text(encoding="utf-8")
    campi = {}
    for riga in testo.splitlines():
        m = re.match(r"^([a-z_]+):\s*(.+)$", riga.strip())
        if m and m.group(1) not in campi:
            campi[m.group(1)] = m.group(2).strip()
    return testo, campi


# ---------- immagine sorgente di una scena ----------

def foto_pronta(cli, foto_rel):
    return cli / "lavoro" / "foto_pronte" / (Path(foto_rel).stem + ".jpg")


def sorgente_scena(cli, scena):
    """Ordine di priorità: keyframe stilizzato → foto pronta (restaurata/inquadrata) → foto originale."""
    if scena.get("keyframe") and (cli / scena["keyframe"]).exists():
        return cli / scena["keyframe"]
    fp = foto_pronta(cli, scena["foto"])
    if fp.exists():
        return fp
    return cli / scena["foto"]


# ---------- spesa ----------

def leggi_spesa(cli):
    return leggi_json(cli / "lavoro" / "spesa.json", {"totale_usd": 0.0, "voci": []})


def registra_spesa(cli, spesa, voce):
    spesa["totale_usd"] = round(spesa["totale_usd"] + voce["costo_usd"], 3)
    voce["quando"] = datetime.now().isoformat(timespec="seconds")
    spesa["voci"].append(voce)
    scrivi_json(cli / "lavoro" / "spesa.json", spesa)


def tentativi_per(spesa, tipo, chiave):
    return sum(1 for v in spesa["voci"] if v.get("tipo") == tipo and str(v.get("elemento")) == str(chiave))


# ---------- fal.ai ----------

def data_uri(percorso):
    percorso = Path(percorso)
    mb = percorso.stat().st_size / 1e6
    if mb > LIMITE_FOTO_MB:
        sys.exit(f"ERRORE: {percorso.name} pesa {mb:.1f} MB: riducila sotto {LIMITE_FOTO_MB} MB "
                 f"(python scripts/prepara_foto.py la ridimensiona)")
    tipo = mimetypes.guess_type(percorso.name)[0] or "image/jpeg"
    return f"data:{tipo};base64," + base64.b64encode(percorso.read_bytes()).decode()


def _http(metodo, url, chiave, corpo=None):
    req = urllib.request.Request(url, method=metodo, data=json.dumps(corpo).encode() if corpo else None)
    req.add_header("Authorization", f"Key {chiave}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()[:600]}") from None


def chiave_fal(obbligatoria=True):
    k = os.environ.get("FAL_KEY")
    if not k and obbligatoria:
        sys.exit("ERRORE: imposta la variabile d'ambiente FAL_KEY")
    return k


def fal_esegui(model_id, corpo, chiave, timeout_s=900):
    """Invia una richiesta alla coda fal.ai, attende il completamento e restituisce il JSON del risultato."""
    inviata = _http("POST", CODA_FAL + model_id, chiave, corpo)
    inizio = time.time()
    while True:
        stato = _http("GET", inviata["status_url"], chiave)
        if stato.get("status") == "COMPLETED":
            break
        if time.time() - inizio > timeout_s:
            raise RuntimeError(f"timeout {timeout_s}s (request_id {inviata.get('request_id')})")
        time.sleep(5)
    risultato = _http("GET", inviata["response_url"], chiave)
    risultato["_request_id"] = inviata.get("request_id")
    return risultato


def url_risultato(risultato, tipo):
    """Estrae l'URL del file prodotto (formati di risposta fal più comuni)."""
    if tipo == "video":
        v = risultato.get("video") or {}
        if v.get("url"):
            return v["url"]
    else:
        imgs = risultato.get("images") or []
        if imgs and imgs[0].get("url"):
            return imgs[0]["url"]
        img = risultato.get("image") or {}
        if img.get("url"):
            return img["url"]
    raise RuntimeError(f"risposta senza {tipo}: {json.dumps(risultato)[:300]}")


def scarica(url, destinazione):
    Path(destinazione).parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=300) as r, open(destinazione, "wb") as f:
        f.write(r.read())
