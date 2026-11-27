# Tavolo

App di incontri dal vivo: proposte giornaliere, incontro in un locale convenzionato, pagamento dopo il check-in. Il progetto completo è in `docs/PROGETTO.md`: leggi solo la sezione che serve al compito.

## Stack
- Expo + Expo Router + TypeScript (web, iOS, Android da un solo codice)
- Supabase, regione UE: database, login via SMS, storage, funzioni. RLS su ogni tabella
- Stripe: SetupIntent all'abbinamento, addebito off-session al doppio check-in, Connect per i locali

## Comandi
- Avvio: `npx expo start`
- Test: `npm test`
- Lint: `npm run lint`

## Regole
- Un compito per sessione. Prima un piano di massimo 10 righe, poi il codice.
- Rispondi in italiano, in modo sintetico. Niente riepiloghi lunghi alla fine.
- Modifica solo i file necessari. Non leggere `node_modules`, `dist`, `build`.
- Mai chiavi o segreti nel codice dell'app: solo variabili d'ambiente lato server.
- Ogni funzione nuova ha almeno un test. Esegui i test prima di dire che hai finito.
- Dati sensibili (trascrizioni, consensi) in tabelle separate. L'audio si cancella dopo la conferma.
- Nei testi rivolti all'utente non usare mai la parola "gratis".
- Regola d'età: intervallo = max(3, round(0,15 x età)); mai 18-25 con over 35.
