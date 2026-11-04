#!/usr/bin/env bash
# SubagentStart / SubagentStop: registra l'evento in stato/log_subagenti.jsonl
dir="${CLAUDE_PROJECT_DIR:-.}/stato"
mkdir -p "$dir"
jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{timestamp: $ts, evento: .hook_event_name, agent_type: (.agent_type // null), agent_id: (.agent_id // null), session_id: .session_id}' \
  >> "$dir/log_subagenti.jsonl" 2>/dev/null
exit 0
