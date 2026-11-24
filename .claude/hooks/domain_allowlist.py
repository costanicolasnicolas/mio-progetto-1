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
    # Ricerca lavoro Belgio (autorizzati dall'utente, non fonti giuridiche)
    "vdab.be", "indeed.com", "jobat.be", "actiris.brussels", "actiris.be", "leforem.be", "manpower.be",
    "randstad.be", "adecco.be", "startpeople.be", "asap.be", "jobbird.com", "glassdoor.be",
    "havenjobs.com", "jobs-met-drive.be", "poppy.recruitee.com", "poppy.be", "cambio.be", "zity.eu",
    "hiflow.com", "ayvens.com", "athlon.com", "arval.com", "arval.be", "talentfinder.be", "sixt.be",
    "hertz.be", "avis.be", "europcar.be", "synergie.be", "trixxojobs.be", "vivaldis.be",
    "actiefinterim.be", "talent.com", "stepstone.be", "monster.be", "jobrapido.com", "careerjet.be",
    "jobsinbrussels.com", "konvert.be", "unique.be", "ago.jobs", "chauffeurjobs.be", "jooble.org",
    "accentjobs.be", "absolutejobs.be", "dieteren.be", "d-ieteren.be", "cvw.io", "adzuna.be",
    "simplyhired.be", "studentjob.be", "vindazo.be", "joblum.com", "northseaporttalent.eu",
    "werkenbijdeleyn.be", "ico.be", "wwlsolutions.com", "walleniuswilhelmsen.com",
    # Ricerca lavoro Paesi Bassi (autorizzati dall'utente, non fonti giuridiche)
    "werk.nl", "nationalevacaturebank.nl", "werkzoeken.nl", "randstad.nl", "randstad.com",
    "youngcapital.nl", "olympia.nl", "timing.nl", "luba.nl", "easyway.nl", "werkenbijkoopman.nl",
    "teamtailor.com", "nationaleberoepengids.nl", "glassdoor.nl", "glassdoor.com", "pon.com",
    "cldn.com", "grensinfopunt.nl", "djops.nl", "spuigroep.nl", "avisbudgetgroup.com", "sixt.nl",
    "hertz.nl", "europcar.nl", "enterprise.nl", "alphabet.nl", "vanmossel.nl", "louwman.com",
    "udenhout.nl", "careerjet.nl", "stepstone.nl", "monsterboard.nl", "trovit.nl", "adzuna.nl",
    "logistiek.com", "transportwerkt.nl", "techniekwerkt.nl", "productie24.nl", "werkgevers.nl",
    "vacaturebank.nl", "banen.nl", "zeeuwsevacaturebank.nl", "zeelandnet.nl", "autoreset.nl",
    "jobmotive.nl", "inqar.nl", "werkenbijtb.nl", "recruitastudent.nl", "drimble.nl", "werkenbijpon.nl",
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
