# mio-progetto-1 — Sistema multi-agente giuridico-economico

Collegio Professionale digitale per Claude Code:

- Agente: J.A.R.V.I.S. — Ruolo: Orchestratore (sessione principale) — File: `CLAUDE.md`
- Agente: F.R.I.D.A.Y. — Ruolo: Avvocato e Notaio — File: `.claude/agents/friday-avvocato-notaio.md`
- Agente: E.D.I.T.H. — Ruolo: Fiscalista e Tributarista — File: `.claude/agents/edith-fiscalista.md`
- Agente: K.A.R.E.N. — Ruolo: Economista e Contabile — File: `.claude/agents/karen-economista.md`
- Agente: V.I.S.I.O.N. — Ruolo: Revisore e CFO — File: `.claude/agents/vision-revisore.md`
- Agente: U.L.T.R.O.N. — Ruolo: Giudice-Verificatore — File: `.claude/agents/ultron-giudice.md`

- Hook: `.claude/settings.json` + script in `.claude/hooks/` (log subagenti, allowlist domini per WebFetch, log fallimenti).
- Stato di sessione: `stato/shared_memory.json` (creato a runtime dal modello `stato/shared_memory.template.json`, non versionato).

## Uso

Apri una sessione Claude Code su questo repository e scrivi il quesito. J.A.R.V.I.S. classifica, delega agli specialisti, fa verificare da U.L.T.R.O.N. e risponde nella struttura definita in `CLAUDE.md`.

Per modificare il comportamento: regole generali in `CLAUDE.md`, competenze di un singolo agente nel suo file in `.claude/agents/`, domini consentiti in `.claude/hooks/domain_allowlist.py`.
