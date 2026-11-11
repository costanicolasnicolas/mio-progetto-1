# 3. Struttura del database

Lo schema eseguibile è in [`server/src/schema.sql`](../server/src/schema.sql). Qui spiego perché è fatto così.

```
users 1──1 profiles            users 1──* photos
users 1──* swipes *──1 users   (PK swiper_id+target_id: uno swipe per coppia)
users *──* matches             (user_a < user_b, UNIQUE: un solo match per coppia)
matches 1──* messages          (indice match_id,id: paginazione a cursore)
users 1──* blocks, reports, verifications, subscriptions, notifications, usage_counters
payment_events                 (PK provider+event_id: idempotenza dei webhook)
audit_log                      (ogni azione admin e automatica)
```

| Tabella | Contenuto | Note di progetto |
|---|---|---|
| `users` | account, ruolo, stato, piano, consensi | `consent_sensitive_at` registra il consenso al trattamento delle preferenze (dati particolari, art. 9 GDPR); `consent_ai_at` quello all'AI esterna |
| `profiles` | dati pubblici, preferenze e filtri | `interests` in JSON; `lat/lng` mai esposti all'esterno |
| `photos` | foto con stato di moderazione | `pending/approved/rejected` |
| `swipes` | like / pass / superlike | l'indice su `target_id` serve a "chi ti ha messo like" e allo smorzamento di popolarità |
| `matches` | coppie che si sono piaciute | ordinamento canonico `user_a < user_b` per evitare duplicati; `unmatched_at` per lo storico |
| `messages` | chat | `flagged` = motivo antifrode; **nessun limite di numero** |
| `blocks`, `reports` | sicurezza | `reports.resolution` = motivazione obbligatoria del provvedimento (DSA) |
| `verifications` | selfie + gesto richiesto | revisione umana |
| `subscriptions`, `payment_events` | abbonamenti e idempotenza | il piano è attivato solo da eventi verificati |
| `usage_counters` | like e AI usati oggi | limiti Free; i messaggi **non** sono conteggiati |
| `notifications`, `audit_log` | notifiche in app, tracciabilità | |

## Passaggio a PostgreSQL (produzione)

- `profiles.location geography(Point, 4326)` con indice **GiST** al posto di `lat/lng` + bounding box: `ST_DWithin(location, :me, :raggio_m)`.
- `interests text[]` con indice GIN; `jsonb` per i payload.
- `messages` partizionata per mese quando supera le centinaia di milioni di righe; chiavi `bigint`/UUIDv7.
- Tabella `daily_exposure` (impression per profilo) per misurare l'equità del matching.
- Row-Level Security o servizio dati dedicato per l'accesso admin; replica di lettura per l'analisi dei dati.
- Conservazione dei dati: cancellazione definitiva su richiesta (già implementata) e retention limitata per i dati degli account eliminati, da definire nell'informativa privacy (conservazione minima per obblighi di legge e per la gestione degli abusi).
