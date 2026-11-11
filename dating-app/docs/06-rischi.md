# 6. Rischi tecnici, legali e commerciali

> Riferimenti normativi indicati per orientamento, **da verificare con avvocato e DPO** prima di qualsiasi lancio. Non è un parere legale.

## Legali

| Rischio | Perché conta | Mitigazione (✅ = già nel prototipo) |
|---|---|---|
| **Dati particolari (GDPR art. 9)** | Preferenze di incontro e orientamento rivelano la vita sessuale: servono consenso esplicito e tutele rafforzate | ✅ consenso esplicito separato; ✅ esportazione e cancellazione dei dati; DPIA (art. 35), DPO, registro dei trattamenti, contratti con i fornitori (art. 28), trasferimenti extra-UE (es. API AI) da valutare |
| **Minori** | Presenza di minori = danno grave e responsabilità | ✅ blocco sotto i 18 anni sulla data dichiarata; ✅ segnalazione "sembra minorenne" con sospensione immediata; verifica dell'età con fornitore dedicato in produzione |
| **Digital Services Act (Reg. UE 2022/2065)** | Obblighi per i servizi di hosting e le piattaforme online: meccanismi di segnalazione, motivazione dei provvedimenti, punto di contatto; alcune esenzioni per micro e piccole imprese | ✅ segnalazioni; ✅ motivazione obbligatoria comunicata all'utente; ✅ audit log; procedura di reclamo e trasparenza da formalizzare |
| **AI Act (Reg. UE 2024/1689)** | Obblighi di trasparenza per i contenuti generati e i sistemi che interagiscono con le persone | ✅ etichetta "suggerimenti generati automaticamente"; ✅ consenso; verificare gli obblighi applicabili alla data di lancio |
| **Codice del Consumo, abbonamenti** | Informazioni precontrattuali, recesso, rinnovo automatico, disdetta semplice | ✅ prezzi IVA inclusa chiari; ✅ disdetta con un clic e piano attivo fino a fine periodo; testi legali da redigere |
| **Proprietà intellettuale rispetto a Tinder** | Nome, marchio, aspetto e testi non vanno imitati. **Match Group ha detenuto brevetti USA sull'interfaccia a carte con scorrimento e li ha fatti valere in passato**, anche contro Bumble (contenzioso chiuso con accordo) | ✅ nome, colori, testi e codice originali; ✅ la carta funziona anche con pulsanti e tastiera; **analisi freedom-to-operate** da parte di un consulente brevetti prima del lancio, soprattutto negli USA |
| **Regole degli store** | Le dating app sono categorie sensibili: moderazione obbligatoria, blocco/segnalazione, policy sui contenuti, pagamenti in-app | ✅ blocco e segnalazione; ✅ moderazione; integrazione IAP via RevenueCat in produzione; rischio di rifiuto alla prima revisione: prevedere 1–3 settimane di margine |
| **Responsabilità per truffe e incontri** | Danni reali tra utenti | ✅ avvisi antitruffa nella chat; ✅ verifica selfie; consigli di sicurezza, termini chiari, assicurazione |

## Tecnici

| Rischio | Mitigazione |
|---|---|
| Scalabilità della chat oltre un server | Redis pub/sub e API stateless (previsti nella fase 2) |
| Ricerca geografica lenta con molti utenti | PostGIS + indice GiST (il prototipo usa bounding box + haversine, adatto fino a decine di migliaia di profili) |
| Deepfake e foto rubate | Verifica con liveness di un fornitore, ricerca per immagini simili, revisione umana |
| Bot e account multipli | Rate limit (✅ login), verifica telefono, device fingerprint, analisi comportamentale |
| Fuga di dati | Cifratura, URL firmati per le foto, principio del minimo privilegio, penetration test, piano di risposta agli incidenti (notifica entro 72 ore, art. 33 GDPR) |
| Dipendenza dal fornitore AI | ✅ fallback locale già implementato: l'app funziona anche senza AI |
| Costi AI fuori controllo | ✅ limiti giornalieri per piano; scelta del modello per costo/qualità |

## Commerciali (i più probabili)

1. **Problema dell'uovo e della gallina**: app vuota = utenti persi. Mitigazione: lancio in una sola area, lista d'attesa, sblocco per città al raggiungimento di una soglia, eventi.
2. **Squilibrio di genere**: tipicamente molti più uomini. Mitigazione: inviti, eventi, verifica obbligatoria, partner femminili e community.
3. **Churn strutturale e CAC alto**: vedi la sensibilità in `04-business-e-scenari.md`.
4. **Concorrenti con budget enormi** possono copiare qualsiasi funzione in poche settimane: il vantaggio deve essere locale, di community e di fiducia.
5. **Reputazione**: un singolo caso grave (truffa, molestia, minore) può uccidere il marchio in una città piccola. La moderazione non è un costo da tagliare.
