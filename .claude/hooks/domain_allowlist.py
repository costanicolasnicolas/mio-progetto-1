#!/usr/bin/env python3
"""PreToolUse hook per WebFetch e WebSearch.

Unica fonte dei domini consentiti: stato/whitelist_fonti.json.
- Voce senza percorso (es. "normattiva.it"): vale per il dominio e tutti i sottodomini.
- Voce con percorso (es. "reddit.com/r/Avvocati"): vale solo per quel percorso.
- Voce con suffisso (es. "*.gov.it"): vale per ogni dominio che termina con quel suffisso.
- WebFetch: l'URL deve corrispondere a una voce.
- WebSearch: la ricerca deve indicare "allowed_domains", tutti presenti in whitelist
  come voci senza percorso (o loro sottodomini).
Se la whitelist manca o non è leggibile, tutto viene bloccato (fail-closed).
"""
import json
import os
import sys
from urllib.parse import urlparse

WHITELIST = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", "."), "stato", "whitelist_fonti.json")
SKIP_KEYS = {"agenti", "_mappa_agenti", "agenti_prioritari", "esclusi_non_trovati"}


def deny(reason: str) -> None:
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}, ensure_ascii=False))
    sys.exit(0)


def collect(node, out):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_KEYS:
                continue
            if k == "dominio" and isinstance(v, str):
                out.add(v)
            else:
                collect(v, out)
    elif isinstance(node, list):
        for v in node:
            if isinstance(v, str):
                out.add(v)
            else:
                collect(v, out)


def load_entries():
    with open(WHITELIST, encoding="utf-8") as f:
        raw = set()
        collect(json.load(f), raw)
    entries = []
    for e in raw:
        e = e.strip().lower()
        if not e or " " in e or "." not in e:
            continue
        host, _, path = e.partition("/")
        entries.append((strip_www(host), ("/" + path.rstrip("/")) if path else ""))
    return entries


def strip_www(host: str) -> str:
    host = host.lower().rstrip(".")
    return host[4:] if host.startswith("www.") else host


def host_match(host: str, dom: str) -> bool:
    if dom.startswith("*."):
        return host.endswith(dom[1:])
    return host == dom or host.endswith("." + dom)


def path_match(path: str, prefix: str) -> bool:
    if not prefix:
        return True
    path = (path or "/").lower()
    return path == prefix or path.startswith(prefix + "/")


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        deny("Input dell'hook non leggibile: richiesta bloccata per sicurezza.")
    tool = data.get("tool_name", "")
    tin = data.get("tool_input") or {}
    try:
        entries = load_entries()
    except Exception as exc:
        deny(f"Whitelist {WHITELIST} mancante o non valida ({exc}): accesso web bloccato.")

    if tool == "WebFetch":
        u = urlparse(tin.get("url", ""))
        host = strip_www(u.hostname or "")
        if host and any(host_match(host, h) and path_match(u.path, p) for h, p in entries):
            sys.exit(0)
        deny(
            f"URL '{tin.get('url', '')}' fuori dalla whitelist (stato/whitelist_fonti.json). "
            "Cerca la stessa informazione su una fonte della whitelist della tua sezione e attiva il "
            "Rapid Resolution Protocol, Tipo 1 (documentale). Non riprovare lo stesso URL."
        )

    if tool == "WebSearch":
        allowed = tin.get("allowed_domains") or []
        domain_entries = [h for h, p in entries if not p]
        bad = [d for d in allowed
               if not any(host_match(strip_www(d), h) for h in domain_entries)]
        if allowed and not bad:
            sys.exit(0)
        if not allowed:
            deny(
                "WebSearch consentita solo se limitata alla whitelist: ripeti la ricerca indicando "
                "'allowed_domains' con i domini della tua sezione di stato/whitelist_fonti.json "
                "(es. [\"normattiva.it\", \"agenziaentrate.gov.it\"])."
            )
        deny(
            f"Domini non presenti in whitelist (o presenti solo con percorso): {', '.join(bad)}. "
            "Ripeti la ricerca usando solo domini della tua sezione di stato/whitelist_fonti.json."
        )

    sys.exit(0)


if __name__ == "__main__":
    main()
