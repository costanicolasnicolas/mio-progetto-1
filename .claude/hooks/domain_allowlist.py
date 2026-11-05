#!/usr/bin/env python3
"""PreToolUse hook per WebFetch: consente solo i domini del catalogo fonti (CLAUDE.md, Sez. 3).

Per aggiungere un dominio, inserirlo in ALLOWED (vale anche per i sottodomini).
"""
import json
import sys
from urllib.parse import urlparse

ALLOWED = {
    # Istituzioni italiane
    "normattiva.it", "gazzettaufficiale.it", "cortedicassazione.it", "italgiure.giustizia.it",
    "giustizia.it", "cortecostituzionale.it", "agenziaentrate.gov.it", "finanze.gov.it",
    "giustiziatributaria.gov.it", "mef.gov.it", "rgs.mef.gov.it", "revisionelegale.mef.gov.it",
    "consob.it", "bancaditalia.it", "registroimprese.it", "infocamere.it", "parlamento.it",
    "camera.it", "senato.it", "notariato.it", "consiglionazionaleforense.it", "commercialisti.it",
    "odcec.mi.it", "fondazioneoic.eu", "assonime.it", "governo.it", "dfp.gov.it",
    "mimit.gov.it", "agcom.it", "arbitrobancariofinanziario.it", "ivass.it", "covip.it", "arera.it",
    "inps.it", "lavoro.gov.it", "interno.gov.it", "enac.gov.it", "fitd.it", "trenitalia.com",
    "dt.mef.gov.it", "invitalia.it", "mur.gov.it",
    # Francia (solo per confronto con conoscenza/03-...-FRANCIA.md)
    "legifrance.gouv.fr", "impots.gouv.fr", "urssaf.fr", "service-public.fr", "economie.gouv.fr",
    # UE e internazionali
    "eur-lex.europa.eu", "europa.eu", "curia.europa.eu", "hudoc.echr.coe.int", "echr.coe.int",
    "oecd.org", "ifrs.org", "ibfd.org", "legilux.public.lu", "public.lu", "cc.lu", "lbr.lu",
    "legislation.gov.uk", "bailii.org",
    # Dottrina, stampa e studi professionali (non ufficiali)
    "diritto.it", "ilsole24ore.com", "latribuna.it", "sistemapenale.it", "aptus.ai",
    "deloitte.com", "taxsummaries.pwc.com", "ogier.com", "philippoulaw.com", "costituzionesocieta.it",
    "onelegale.wolterskluwer.it", "dejure.it", "taxnews.bloombergtax.com", "thomsonreuters.com",
    # Community (solo supporto, mai fonte di diritto)
    "fiscoetasse.com", "commercialistatelematico.com", "reddit.com", "linkedin.com", "taxdome.com",
}


def allowed(host: str) -> bool:
    host = host.lower().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    return any(host == d or host.endswith("." + d) for d in ALLOWED)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # input non leggibile: non bloccare
    url = (data.get("tool_input") or {}).get("url", "")
    host = urlparse(url).hostname or ""
    if not host or allowed(host):
        sys.exit(0)
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": (
                f"Dominio '{host}' non presente nel catalogo fonti (CLAUDE.md, Sez. 3). "
                "Cerca la stessa informazione su una fonte del catalogo (priorità alle fonti ufficiali) "
                "e attiva il Rapid Resolution Protocol, Tipo 1 (documentale). "
                "Per autorizzare il dominio, aggiungilo a .claude/hooks/domain_allowlist.py."
            ),
        }
    }))
    sys.exit(0)


if __name__ == "__main__":
    main()
