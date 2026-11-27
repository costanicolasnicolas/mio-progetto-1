# Guida per iniziare: dal download alla prima sessione

Tempo totale la prima volta: circa 1-2 ore. Segui le fasi in ordine. Se una schermata è diversa da come è descritta qui (GitHub e Claude cambiano spesso i nomi dei pulsanti), cerca un pulsante con lo stesso significato oppure fai uno screenshot e chiedi aiuto.

---

## Fase A: scarica i file (5 minuti)

1. Scarica i file allegati nella conversazione:
   - `CLAUDE.md`: le regole per Claude Code, va nel repository;
   - `PROGETTO.md`: il progetto completo, va nel repository;
   - `Progetto_Tavolo.pdf`: lo stesso contenuto da leggere, resta a te;
   - `GUIDA_INIZIO.md`: questa guida, resta a te.
2. Mettili in una cartella che ritrovi, per esempio `Documenti/Tavolo`.
3. Controlla i nomi: devono essere esattamente `CLAUDE.md` e `PROGETTO.md`, senza aggiunte come `(1)`.

---

## Fase B: crea il repository su GitHub (5 minuti)

Il repository è la cartella online dove vivrà il codice dell'app.

1. Vai su **github.com** ed entra. Se non hai un account: "Sign up", poi email, password e nome utente.
2. In alto a destra premi **+**, poi **New repository**.
3. Compila così:
   - Repository name: `tavolo-app`
   - Private: selezionato
   - Add a README file: spuntato
4. Premi **Create repository**.

---

## Fase C: carica i file (10 minuti)

**C1. `CLAUDE.md` nella cartella principale**

1. Nel repository premi **Add file**, poi **Upload files**.
2. Trascina `CLAUDE.md` nella pagina.
3. Lascia selezionato "Commit directly to the main branch".
4. Premi **Commit changes**.

**C2. `PROGETTO.md` dentro la cartella `docs`**

1. Premi **Add file**, poi **Create new file**.
2. Nel campo del nome scrivi `docs/`. Appena scrivi la barra, `docs` diventa una cartella.
3. Subito dopo scrivi `PROGETTO.md`. Il percorso deve risultare `docs/PROGETTO.md`.
4. Apri `PROGETTO.md` sul computer con Blocco note (Windows) o TextEdit (Mac).
5. Seleziona tutto (Ctrl+A o Cmd+A), copia e incolla nel riquadro grande di GitHub.
6. Premi **Commit changes**, poi di nuovo **Commit changes** nella finestra che si apre.

**C3. Controlla**

Nella pagina del repository devi vedere `README.md`, `CLAUDE.md` e la cartella `docs`. Dentro `docs` deve esserci `PROGETTO.md`.

---

## Fase D: dai accesso a Claude (5 minuti)

Senza questa fase Claude Code non vede il nuovo repository.

1. Apri https://github.com/apps/claude/installations/select_target
2. Scegli il tuo account.
3. Premi **Configure** se l'app è già installata, oppure **Install** se non lo è.
4. In "Repository access":
   - se è selezionato "Only select repositories", aggiungi `tavolo-app` e lascia anche quelli che c'erano già;
   - se è selezionato "All repositories", non devi fare nulla.
5. Premi **Save** (oppure Install).
6. Se non l'hai mai fatto, collega GitHub a Claude da https://claude.ai/connect-github

---

## Fase E: prima sessione con Claude Code (30-60 minuti)

**E1. Avvia una sessione nuova**

1. Vai su **claude.ai/code**.
2. Avvia una **nuova sessione**, non una conversazione già aperta.
3. Scegli il repository **tavolo-app**. Se non compare, ricarica la pagina; se manca ancora, ripeti la fase D.
4. Come ambiente lascia quello predefinito.

**E2. Incolla questo messaggio**

```
Leggi CLAUDE.md e la sezione 7 di docs/PROGETTO.md. Poi esegui solo la sessione 1 della tabella al capitolo 8: crea un progetto Expo con Expo Router e TypeScript, pronto per web, iOS e Android, con lint e un test di esempio. Prima mostrami un piano di massimo 10 righe e aspetta il mio ok.
```

**E3. Rispondi al piano**

- Se il piano riguarda solo il progetto base, scrivi: `ok, procedi`.
- Se propone altro (login, database, pagamenti), scrivi: `solo la sessione 1, il resto dopo`.

**E4. Mentre lavora**

- Se ti chiede il permesso per comandi come `npm install` o `npx`, puoi approvarli: in questa fase sono normali.
- Non aggiungere altre richieste finché non ha finito.

**E5. Controlla il risultato**

Nella sessione cloud non puoi aprire tu l'anteprima. Chiedi:

```
Avvia la versione web, fai uno screenshot della pagina iniziale e mandamelo. Poi esegui lint e test e dimmi l'esito.
```

La sessione è riuscita se vedi lo screenshot e lint e test risultano passati.

---

## Fase F: salva il lavoro su main (5 minuti)

Nelle sessioni cloud Claude lavora su un ramo separato, con un nome tipo `claude/...`. Va unito a `main`, altrimenti la sessione successiva non trova il lavoro.

1. Scrivi a Claude:

   ```
   Fai il commit, fai il push e crea una pull request verso main con una descrizione breve.
   ```

2. Apri il link della pull request che ti dà.
3. Su GitHub premi **Merge pull request**, poi **Confirm merge**.
4. Torna alla pagina principale di `tavolo-app`: devi vedere i file nuovi (`app`, `package.json` e altri).

---

## Le sessioni successive

- Una **sessione nuova** per ogni riga della tabella al capitolo 8 di `PROGETTO.md`.
- Usa lo stesso messaggio, cambiando il numero: "esegui solo la sessione 2 della tabella al capitolo 8".
- Alla fine di ogni sessione ripeti la fase F.

**Prima della sessione 2: progetto Supabase**

1. Vai su **supabase.com**, registrati e premi **New project**.
2. Nome `tavolo`. Regione europea, per esempio Frankfurt. Scegli una password del database e conservala.
3. Dalle impostazioni API copia **Project URL** e **anon public key**: questi due puoi darli a Claude.
4. **Non incollare mai in chat la chiave service_role né la password del database.** Chiedi a Claude come impostarle come variabili d'ambiente.

---

## Problemi comuni

| Problema | Causa | Soluzione |
|---|---|---|
| Il repository non compare nella sessione | Claude non ha accesso | Ripeti la fase D |
| La sessione nuova non trova il lavoro fatto | Pull request non unita | Ripeti la fase F |
| Hai incollato una chiave segreta in chat | Errore | Rigenera subito la chiave dal pannello di Supabase |
| Claude finisce il limite a metà | Limite del piano Pro | Chiedigli di fare commit e push di quello che ha fatto, poi riprendi dopo il reset |
| Una sessione dura troppo | Compito troppo grande | Dividilo in due sessioni |

---

## In parallelo, senza codice (settimana 1)

- Elenco di 60 locali di Catania con zona, voto, fascia di prezzo e titolare.
- Controllo del nome: banche dati UIBM e TMview, dominio `.it` e `.com`, nome libero su Instagram e TikTok.
- Visita ai primi 3-5 locali, solo per parlare, con il testo del capitolo 5.2 di `PROGETTO.md`.
