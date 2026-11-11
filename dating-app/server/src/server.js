import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createApp } from './app.js';

const here = dirname(fileURLToPath(import.meta.url));
const secret = process.env.APP_SECRET || (() => {
  console.warn('[avviso] APP_SECRET non impostato: uso un segreto casuale (i login scadono al riavvio).');
  return randomBytes(32).toString('hex');
})();

const app = createApp({ dbFile: process.env.DB_FILE || join(here, '..', 'data', 'app.db'), secret });
const port = await app.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1');
console.log(`Sintonia in ascolto su http://localhost:${port}  (admin: /admin)`);
