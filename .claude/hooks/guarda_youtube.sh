#!/usr/bin/env bash
# Guarda un video YouTube con la skill watch (motore Gemini).
# Prova più modelli e riprova se i server Google sono sovraccarichi.
# Uso: guarda_youtube.sh "<link>" ["<domanda>"]
set -u
URL="${1:?manca il link}"
DOMANDA="${2:-Riassumi il video in italiano: argomento, punti chiave con timestamp, conclusioni.}"

WATCH=""
for d in /home/user/SKILL/.claude/skills/watch "$HOME/.claude/skills/watch" "${CLAUDE_PROJECT_DIR:-.}/../SKILL/.claude/skills/watch"; do
  [ -f "$d/scripts/watch.py" ] && WATCH="$d" && break
done
[ -z "$WATCH" ] && { echo "Skill watch non trovata."; exit 2; }

export PYTHONDONTWRITEBYTECODE=1   # niente file __pycache__ nel repository SKILL
MODELLI="gemini-3.8-flash gemini-3.7-flash gemini-3.6-flash gemini-flash-latest gemini-3.5-flash"

for giro in 1 2 3; do
  for m in $MODELLI; do
    OUT=$(WATCH_GEMINI_MODEL="$m" timeout 600 python3 "$WATCH/scripts/watch.py" "$URL" --engine gemini --question "$DOMANDA" 2>&1)
    if grep -q "Answer (from Gemini)" <<<"$OUT"; then
      echo "$OUT"
      exit 0
    fi
    echo "[$m, giro $giro] $(grep -o 'HTTP [0-9]*' <<<"$OUT" | head -1)" >&2
  done
  [ "$giro" -lt 3 ] && sleep 30
done
echo "Nessun modello Gemini ha risposto (server sovraccarichi o video non accessibile)."
exit 1
