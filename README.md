# mio-progetto-1 — Sistema multi-agente giuridico-economico

Collegio Professionale digitale per Claude Code:

| Agente | Ruolo | File |
|---|---|---|
| J.A.R.V.I.S. | Orchestratore (sessione principale) | `CLAUDE.md` |
| F.R.I.D.A.Y. | Avvocato e Notaio | `.claude/agents/friday-avvocato-notaio.md` |
| E.D.I.T.H. | Fiscalista e Tributarista | `.claude/agents/edith-fiscalista.md` |
| K.A.R.E.N. | Economista e Contabile | `.claude/agents/karen-economista.md` |
| V.I.S.I.O.N. | Revisore e CFO | `.claude/agents/vision-revisore.md` |
| U.L.T.R.O.N. | Giudice-Verificatore | `.claude/agents/ultron-giudice.md` |

- Hook: `.claude/settings.json` + script in `.claude/hooks/` (log subagenti, allowlist domini per WebFetch, log fallimenti).
- Stato di sessione: `stato/shared_memory.json` (creato a runtime dal modello `stato/shared_memory.template.json`, non versionato).

## Uso

Apri una sessione Claude Code su questo repository e scrivi il quesito. J.A.R.V.I.S. classifica, delega agli specialisti, fa verificare da U.L.T.R.O.N. e risponde nella struttura definita in `CLAUDE.md`.

Per modificare il comportamento: regole generali in `CLAUDE.md`, competenze di un singolo agente nel suo file in `.claude/agents/`, domini consentiti in `.claude/hooks/domain_allowlist.py`.
