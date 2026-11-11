/**
 * Popola il database con profili DEMO fittizi (nessuna persona reale, avatar SVG generati).
 * Uso: npm run seed   → poi npm start
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { openDb } from './db.js';
import { hashPassword } from './auth.js';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data');
const dbFile = process.env.DB_FILE || join(dataDir, 'app.db');
const uploads = join(dataDir, 'uploads');

rmSync(dbFile, { force: true }); rmSync(dbFile + '-wal', { force: true }); rmSync(dbFile + '-shm', { force: true });
rmSync(uploads, { recursive: true, force: true });
mkdirSync(uploads, { recursive: true });
const db = openDb(dbFile);

// PRNG deterministico: il seed produce sempre gli stessi dati.
let s = 42;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const CITIES = [
  ['Catania', 37.5079, 15.083], ['Taormina', 37.8516, 15.2853], ['Acireale', 37.6126, 15.1656],
  ['Messina', 38.1938, 15.554], ['Siracusa', 37.0755, 15.2866], ['Giardini Naxos', 37.8275, 15.2667],
];
const INTERESTS = ['mare', 'trekking', 'cucina', 'cinema', 'musica live', 'fotografia', 'yoga', 'vino', 'viaggi', 'lettura',
  'calcio', 'arte', 'teatro', 'gaming', 'corsa', 'subacquea', 'jazz', 'volontariato', 'cani', 'gatti', 'etna', 'vela'];
const WOMEN = ['Giulia', 'Martina', 'Chiara', 'Sara', 'Alessia', 'Federica', 'Elisa', 'Valentina', 'Noemi', 'Arianna', 'Marta', 'Ilaria', 'Roberta', 'Serena'];
const MEN = ['Luca', 'Marco', 'Andrea', 'Davide', 'Simone', 'Matteo', 'Giuseppe', 'Salvo', 'Antonio', 'Paolo', 'Fabio', 'Dario', 'Enrico', 'Gabriele'];
const BIOS = [
  'Colazione con granita e brioche, poi si decide. Cerco qualcuno con cui esplorare posti nuovi.',
  'Ingegnera di giorno, cuoca improvvisata la sera. Se sai consigliare un buon libro hai già vinto.',
  "Amo l'Etna all'alba e i concerti piccoli. Sincero, curioso, un po' ritardatario.",
  'Insegno, viaggio quando posso, e ho opinioni forti sulla pasta alla Norma.',
  'Fotografo per passione. Mi piace chi ride facilmente e cammina tanto.',
  'Lavoro nel turismo, conosco ogni spiaggia da qui a Siracusa. Ti porto io.',
  'Più cinema d\'autore che serie TV. Cerco conversazioni vere, non solo match.',
];
const COLORS = ['#E8505B', '#F9A826', '#14B1AB', '#5B6CFF', '#9B5DE5', '#00A6ED', '#F15BB5', '#2EC4B6'];

function avatar(name, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#1b1b2f"/></linearGradient></defs>
<rect width="600" height="800" fill="url(#g)"/><circle cx="300" cy="310" r="120" fill="#ffffff" fill-opacity=".22"/>
<rect x="150" y="460" width="300" height="260" rx="150" fill="#ffffff" fill-opacity=".22"/>
<text x="300" y="350" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="#fff" text-anchor="middle">${name[0]}</text></svg>`;
  const file = `seed_${name.toLowerCase()}_${Math.floor(rnd() * 1e9)}.svg`;
  writeFileSync(join(uploads, file), svg);
  return file;
}

const now = Date.now();
const insUser = db.prepare('INSERT INTO users(email, password_hash, role, plan, plan_expires_at, consent_sensitive_at, consent_ai_at, created_at) VALUES (?,?,?,?,?,?,?,?)');
const insProfile = db.prepare(`INSERT INTO profiles(user_id, name, birthdate, gender, interested_in, bio, interests, city, lat, lng, max_distance_km, age_min, age_max, verified, last_active_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const insPhoto = db.prepare(`INSERT INTO photos(user_id, path, position, moderation, created_at) VALUES (?,?,?,'approved',?)`);
const pwd = hashPassword('password-demo-123');

function create({ email, role = 'user', name, gender, interestedIn, plan = 'free', city, age, verified, interests, bio }) {
  const [cname, lat, lng] = city;
  const { lastInsertRowid: id } = insUser.run(email, pwd, role, plan, plan === 'free' ? null : now + 30 * 864e5, now, now, now);
  const birth = new Date(now - (age * 365.25 + rnd() * 300) * 864e5).toISOString().slice(0, 10);
  insProfile.run(id, name, birth, gender, interestedIn, bio, JSON.stringify(interests), cname,
    lat + (rnd() - 0.5) * 0.05, lng + (rnd() - 0.5) * 0.05, 60, 18, 60, verified ? 1 : 0, now - Math.floor(rnd() * 96) * 3.6e6);
  insPhoto.run(id, avatar(name, pick(COLORS)), 0, now);
  return Number(id);
}

const sample = (n) => [...INTERESTS].sort(() => rnd() - 0.5).slice(0, n);

create({ email: 'admin@demo.local', role: 'admin', name: 'Admin', gender: 'nonbinary', interestedIn: 'man,woman,nonbinary', city: CITIES[0], age: 35, verified: true, interests: [], bio: 'Account amministratore demo' });
const demo = create({ email: 'demo@demo.local', name: 'Nicola', gender: 'man', interestedIn: 'woman', city: CITIES[1], age: 31, verified: true,
  interests: ['mare', 'cucina', 'viaggi', 'etna', 'musica live'], bio: 'Account demo: Taormina, cucina siciliana e tramonti dal Teatro Antico.' });

const ids = [];
for (const name of WOMEN) ids.push(create({ email: `${name.toLowerCase()}@demo.local`, name, gender: 'woman', interestedIn: rnd() < 0.85 ? 'man' : 'man,woman',
  plan: rnd() < 0.2 ? 'premium' : 'free', city: pick(CITIES), age: 22 + Math.floor(rnd() * 18), verified: rnd() < 0.5, interests: sample(4 + Math.floor(rnd() * 3)), bio: pick(BIOS) }));
for (const name of MEN) create({ email: `${name.toLowerCase()}@demo.local`, name, gender: 'man', interestedIn: 'woman',
  city: pick(CITIES), age: 22 + Math.floor(rnd() * 18), verified: rnd() < 0.5, interests: sample(4 + Math.floor(rnd() * 3)), bio: pick(BIOS) });

// Alcune utenti hanno già messo like all'account demo: un like ricambiato genera subito un match.
const like = db.prepare(`INSERT INTO swipes(swiper_id, target_id, direction, created_at) VALUES (?,?,'like',?)`);
for (const id of ids.slice(0, 5)) like.run(id, demo, now - 3.6e6);

console.log(`Seed completato: ${2 + WOMEN.length + MEN.length} utenti demo.
  Utente demo: demo@demo.local / password-demo-123
  Admin:       admin@demo.local / password-demo-123`);
