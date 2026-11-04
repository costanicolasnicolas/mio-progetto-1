#!/usr/bin/env bash
# PostToolUseFailure su WebFetch/WebSearch: registra il fallimento in stato/log_fallimenti.jsonl
dir="${CLAUDE_PROJECT_DIR:-.}/stato"
mkdir -p "$dir"
jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{timestamp: $ts, tool: .tool_name, input: .tool_input, errore: (.error // null), protocollo: "Rapid Resolution Tipo 1 (documentale)"}' \
  >> "$dir/log_fallimenti.jsonl" 2>/dev/null
exit 0
