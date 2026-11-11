# 4. Modello di business, concorrenza e scenari

> Le cifre sono **stime con ipotesi dichiarate**, non previsioni. La parte fiscale è semplificata: va validata da un commercialista. Se vuoi un'analisi fiscale e societaria verificata con fonti (forma societaria, regime startup innovativa, IVA OSS sulle vendite web UE), il sistema J.A.R.V.I.S. di questo repository è fatto apposta.

## 4.1 Prima, una verità scomoda sul "messaggi illimitati"

Nelle app leader (Tinder, Hinge, Bumble) **scrivere ai propri match è già gratis**. Si paga per like illimitati, per vedere chi ti ha messo like, per boost e filtri. Il limite ai messaggi esiste soprattutto in altri modelli, dove senza abbonamento non si può scrivere o leggere (le condizioni attuali dei singoli concorrenti vanno verificate prima di usarle nel marketing).

Quindi **"messaggi illimitati" da solo non è un vantaggio competitivo**: è una promessa che i leader già mantengono. Diventa credibile solo dentro una promessa più ampia: *"qui non paghi per comunicare, e ti diciamo esattamente cosa paghi e perché"*.

## 4.2 Concorrenti principali

| Gruppo | App | Posizionamento |
|---|---|---|
| Match Group | Tinder, Hinge, Meetic, OkCupid, Plenty of Fish | Volume (Tinder), relazioni serie (Hinge, Meetic) |
| Bumble Inc. | Bumble, Badoo | Prima mossa alle donne (Bumble), volume Europa (Badoo) |
| Indipendenti | Happn (incroci fisici), Grindr (LGBTQ+), Feeld (non convenzionale), Lovoo, Inner Circle | Nicchie |

Sono aziende con centinaia di milioni di budget marketing e network effect consolidati. **Non si vince "contro Tinder" in generale.** Si vince in una **nicchia o in un'area geografica** dove si arriva per primi alla massa critica.

## 4.3 Problemi irrisolti delle dating app (documentati da anni da utenti e stampa)

1. **Burnout da swipe**: tanti match, poche conversazioni, pochi incontri.
2. **Profili falsi e truffe sentimentali**, spesso con investimenti crypto o richieste di denaro.
3. **Paywall percepiti come manipolativi**: funzioni chiave bloccate, prezzi variabili e poco chiari.
4. **Squilibrio di attenzione**: pochi profili ricevono la maggior parte dei like, molti utenti quasi nessuno.
5. **Algoritmi opachi**: nessuno sa perché vede chi vede.
6. **Ghosting e conversazioni che non partono.**

## 4.4 Vantaggio competitivo realmente difendibile

Il codice **non** è difendibile: chiunque può copiarlo, me compreso. Quello che resta difendibile:

1. **Densità locale (network effect)**: lanciare **una città o area alla volta** (es. Catania–Taormina–Messina) fino alla massa critica, con eventi dal vivo e partner locali. È lento e costoso da copiare.
2. **Fiducia verificabile**: verifica obbligatoria del profilo per scrivere (o filtro "solo verificati"), antifrode trasparente, motivazione per ogni provvedimento. Una reputazione costruita nel tempo non si compra.
3. **Trasparenza come marchio**: prezzi fissi e pubblici, nessun paywall sui messaggi, "perché vedi questo profilo", algoritmo con equità di esposizione. È credibile solo se resta vera a lungo.
4. **AI che porta a parlare, non a scorrere**: metriche di successo = conversazioni con almeno 10 scambi e appuntamenti dichiarati, non swipe.

Nicchie da valutare prima di decidere (serve ricerca con utenti): fascia 30–45 anni con intenzioni serie; un territorio specifico; comunità con interessi forti (sport, outdoor, cultura); persone che si trasferiscono in una nuova città.

## 4.5 Piani e ricavi

| Piano | Prezzo (IVA incl.) | Cosa include |
|---|---|---|
| Free | 0 € | Messaggi **illimitati**, 40 like/giorno, 3 suggerimenti AI/giorno |
| Premium | 9,99 €/mese | Like illimitati, chi ti ha messo like, filtro solo verificati, 20 AI/giorno, 1 boost/mese |
| Plus | 19,99 €/mese | Tutto Premium + coach AI illimitato + 4 boost/mese (in futuro: modalità viaggio, priorità nei suggerimenti) |

Il prototipo implementa già tutti questi limiti (`server/src/plans.js`).

**Ricavi aggiuntivi** (in ordine di coerenza con il posizionamento):
1. **Eventi dal vivo a pagamento** per iscritti verificati: rafforzano anche la densità locale.
2. **Partnership con locali** (aperitivo/cena "primo appuntamento" con sconto e commissione).
3. Acquisti singoli: boost, super like.
4. Abbonamenti trimestrali e annuali con sconto: riducono il churn e la quota alle commissioni store.
5. **Da evitare**: pubblicità profilata e vendita di dati. Contraddicono la promessa di fiducia e i dati trattati includono categorie particolari (GDPR art. 9).

## 4.6 Costi principali

- **Commissioni store**: di norma 15% sugli abbonamenti per gli sviluppatori sotto 1 M$/anno e dopo il primo anno di abbonamento, fino al 30% altrimenti (verificare i programmi vigenti di Apple e Google). La vendita via web con Stripe costa circa l'1,5% + 0,25 € per carta UE standard, più Billing.
- **IVA 22%**: non è un ricavo. Per le vendite tramite store l'IVA è gestita di norma dallo store; per le vendite web a consumatori UE serve il regime **OSS**. Da validare con il commercialista.
- **Cloud**, **AI**, **verifica identità** (indicativamente 1–2 € per verifica con fornitori dedicati), **moderazione umana**, **personale**, **legale e contabilità**.
- **Marketing**: è la voce dominante. Il churn degli abbonati è strutturale: chi trova una persona se ne va. Ogni mese bisogna rimpiazzare una parte consistente degli abbonati solo per restare fermi.

## 4.7 Simulazione: 1.000 / 10.000 / 100.000 utenti paganti

Generata da [`tools/scenari.js`](../tools/scenari.js). Ipotesi principali: mix 70% Premium / 30% Plus; 60% venduto via store; conversione 5% (20 utenti attivi per ogni pagante); churn dei paganti 15%/mese; costo per nuovo pagante (CAC, media tra canali pagati e passaparola) 30 / 28 / 25 €; marketing calcolato **solo per mantenere** i paganti (crescita zero); personale da 1 founder + freelance fino a ~40 persone. Imposte: IRES 24% + IRAP 3,9% su base approssimata, nessuna imposta in perdita (le perdite sono riportabili).

| Voce (annua) | 1.000 paganti | 10.000 paganti | 100.000 paganti |
|---|---:|---:|---:|
| Utenti attivi mensili (MAU) stimati | 20.000 | 200.000 | 2.000.000 |
| IVA incassata e versata (non è ricavo) | € 28.110 | € 281.095 | € 2.810.951 |
| **Fatturato (netto IVA)** | **€ 127.770** | **€ 1.277.705** | **€ 12.777.049** |
| − Commissioni store | € 11.499 | € 114.993 | € 1.686.570 |
| − Commissioni Stripe | € 2.324 | € 23.244 | € 232.438 |
| − Infrastruttura cloud | € 14.400 | € 108.000 | € 840.000 |
| − AI (API) | € 8.352 | € 83.520 | € 835.200 |
| − Trust & safety / supporto | € 7.200 | € 60.000 | € 480.000 |
| − Marketing (rimpiazzo churn) | € 54.000 | € 504.000 | € 4.500.000 |
| − Personale | € 84.000 | € 660.000 | € 3.120.000 |
| − Legale, contabile, assicurazioni | € 18.000 | € 72.000 | € 360.000 |
| **Costi totali** | **€ 199.776** | **€ 1.625.757** | **€ 12.054.209** |
| **Utile ante imposte (EBIT)** | **−€ 72.005** | **−€ 348.052** | **€ 722.841** |
| − IRES 24% (stima) | € 0 | € 0 | € 173.482 |
| − IRAP 3,9% (stima, base approssimata) | € 0 | € 0 | € 28.191 |
| **Utile netto** | **−€ 72.005** | **−€ 348.052** | **€ 521.168** |
| Margine netto su fatturato | −56,4% | −27,2% | 4,1% |

**Sensibilità dell'utile ante imposte (scenario 10.000 paganti) a churn mensile e CAC:**

| churn \ CAC | €15 | €28 | €45 | €70 |
|---|---:|---:|---:|---:|
| 8% | € 11.948 | −€ 112.852 | −€ 276.052 | −€ 516.052 |
| 15% | −€ 114.052 | −€ 348.052 | −€ 654.052 | −€ 1.104.052 |
| 25% | −€ 294.052 | −€ 684.052 | −€ 1.194.052 | −€ 1.944.052 |

Pareggio operativo con la struttura di costi dello scenario 1: circa **3.100 paganti**.

### Come leggere questi numeri

- **Con queste ipotesi, 1.000 e 10.000 paganti sono in perdita.** Il motivo non è la tecnologia: è il marketing necessario a rimpiazzare il churn, più il personale.
- **Le leve che contano davvero**: (1) **CAC basso** grazie a passaparola, eventi e densità locale; (2) **churn più basso** con abbonamenti trimestrali e annuali e un prodotto che porta a incontri veri, che fanno pubblicità; (3) **più vendite web** per pagare meno commissioni store; (4) **costo AI**: con `claude-haiku-5-5` al posto di `claude-opus-5-5` la voce AI scende di circa 40 volte (da ~835 k€ a ~21 k€ nello scenario 3). La scelta va fatta dopo un test di qualità.
- Nello scenario 3 il margine è sottile (4%). Con churn 8% e CAC 15 € la stessa azienda sarebbe ampiamente profittevole. **Tutto il business plan si gioca su queste due variabili**: vanno misurate nella beta prima di investire in marketing.
- Lo scenario 2 con churn 8% e CAC 15 € è vicino al pareggio: è l'obiettivo realistico da dimostrare prima di cercare investitori.
- Stime fiscali: l'IRAP ha una base imponibile diversa dall'EBIT e può essere dovuta anche in perdita in certi casi; esistono agevolazioni per le startup innovative. Serve un commercialista.

## 4.8 Espansione internazionale

Il codice è facile da tradurre (testi da centralizzare in file di localizzazione), quindi la parte tecnica pesa poco. Il vincolo è sempre la **densità locale**: ogni nuova città è un nuovo lancio con nuovo marketing. Strategia: dominare un'area, replicare il metodo in città simili (Sud Italia → Spagna, Portogallo, Grecia: stagionalità turistica e cultura simili), poi capitali. Ogni Paese porta lingua, pagamenti locali, adempimenti DSA/GDPR già armonizzati in UE, ma IVA, tutela dei consumatori e protezione dei minori variano.
