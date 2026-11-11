// Sintonia — client web (SPA senza framework). Tutto il testo utente passa da esc() per evitare XSS.
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const INTERESTS = ['mare', 'trekking', 'cucina', 'cinema', 'musica live', 'fotografia', 'yoga', 'vino', 'viaggi', 'lettura', 'calcio', 'arte',
  'teatro', 'gaming', 'corsa', 'subacquea', 'jazz', 'volontariato', 'cani', 'gatti', 'etna', 'vela'];
const GENDER_LABEL = { man: 'Uomini', woman: 'Donne', nonbinary: 'Persone non binarie' };
const GENDER_SELF = { man: 'Uomo', woman: 'Donna', nonbinary: 'Non binario/a' };
const WHY_LABEL = { distance: 'Vicino a te', interests: 'Interessi in comune', activity: 'Attivo di recente', completeness: 'Profilo completo', verified: 'Verificato', reciprocity: 'Ti ha già notato' };
const REASONS = { fake: 'Profilo falso', scam: 'Truffa o richiesta di soldi', harassment: 'Molestie', inappropriate: 'Contenuti inappropriati', underage: 'Sembra minorenne', other: 'Altro' };

const state = { token: localStorageGet('token'), me: null, ws: null, deck: [], typingTimer: null, chatMatchId: null };

function localStorageGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function localStorageSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* modalità privata */ } }

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && state.token) { logout(); throw new Error('Sessione scaduta'); }
  if (!res.ok) { const e = new Error(data.error || `Errore ${res.status}`); e.status = res.status; throw e; }
  return data;
}

function toast(msg, ms = 3200) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), ms);
}
function modal(html) {
  const m = $('#modal'); m.innerHTML = `<div class="box">${html}</div>`; m.classList.remove('hidden');
  m.onclick = (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModal(); };
  return m;
}
function closeModal() { $('#modal').classList.add('hidden'); $('#modal').innerHTML = ''; }
/** Le immagini di sfondo si impostano via CSSOM (gli attributi style inline sono bloccati dalla CSP). */
function applyBg(root = document) { for (const el of $$('[data-bg]', root)) el.style.backgroundImage = `url("${el.dataset.bg}")`; }
const photo = (p) => p?.photos?.[0]?.url || '';
const readFileAsDataUrl = (file) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(file); });

function logout() { state.token = null; state.me = null; localStorageSet('token', null); state.ws?.close(); location.hash = '#/accedi'; render(); }

// ---------- WebSocket con riconnessione ----------
function connectWs() {
  if (!state.token || state.ws?.readyState === 1) return;
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?token=${encodeURIComponent(state.token)}`);
  state.ws = ws;
  ws.onmessage = (e) => onEvent(JSON.parse(e.data));
  ws.onclose = () => { if (state.token) setTimeout(connectWs, 2000); };
}

function onEvent(ev) {
  if (ev.type === 'message') {
    if (state.chatMatchId === ev.message.matchId) { appendMessage(ev.message); if (!ev.message.mine) api(`/api/matches/${ev.message.matchId}/read`, { method: 'POST' }).catch(() => {}); }
    else if (!ev.message.mine) { toast('Nuovo messaggio 💬'); refreshBadges(); }
  } else if (ev.type === 'typing' && state.chatMatchId === ev.matchId) {
    const t = $('#typing'); if (t) { t.textContent = 'sta scrivendo…'; clearTimeout(state.typingTimer); state.typingTimer = setTimeout(() => (t.textContent = ''), 2500); }
  } else if (ev.type === 'notification') {
    refreshBadges();
    if (ev.notification.type === 'match') { const p = ev.notification.payload; setTimeout(() => { if (p.matchId !== state.lastMatchShown) toast(`È un match con ${p.name}! 🎉`); }, 1500); } // la notifica WS può arrivare prima della risposta HTTP
    if (ev.notification.type === 'verification') { toast(ev.notification.payload.approved ? 'Profilo verificato ✅' : 'Verifica non approvata, riprova'); loadMe(); }
  } else if (ev.type === 'unmatch' && state.chatMatchId === ev.matchId) { toast('Questo match non è più attivo'); location.hash = '#/match'; }
}

async function refreshBadges() {
  try {
    const [notifs, matches] = await Promise.all([api('/api/notifications'), api('/api/matches')]);
    const n = notifs.filter((x) => !x.read_at).length; const c = matches.reduce((s, m) => s + m.unread, 0);
    $('#bell-count').textContent = n; $('#bell-count').classList.toggle('hidden', !n);
    $('#chat-count').textContent = c; $('#chat-count').classList.toggle('hidden', !c);
  } catch { /* offline */ }
}
async function loadMe() { state.me = await api('/api/me'); return state.me; }

// ---------- Router ----------
const routes = {
  accedi: viewAuth, scopri: viewDiscover, like: viewLikes, match: viewMatches, chat: viewChat,
  profilo: viewProfile, piani: viewPlans, notifiche: viewNotifications,
};
async function render() {
  const [, name = '', arg] = location.hash.split('/');
  const view = $('#view');
  state.chatMatchId = null;
  if (!state.token) { $('#tabbar').classList.add('hidden'); $('#bell').classList.add('hidden'); return viewAuth(view); }
  if (!state.me) { try { await loadMe(); } catch { return; } connectWs(); refreshBadges(); }
  $('#tabbar').classList.remove('hidden'); $('#bell').classList.remove('hidden');
  const key = routes[name] && name !== 'accedi' ? name : 'scopri';
  for (const a of $$('#tabbar a')) a.classList.toggle('active', a.dataset.tab === (key === 'chat' ? 'match' : key));
  if (state.me.status === 'suspended') { view.innerHTML = `<div class="empty"><div class="icon">⏸️</div><h2>Account sospeso</h2><p>Il team sicurezza sta verificando alcune segnalazioni. Riceverai una motivazione.</p><button class="btn secondary" id="lo">Esci</button></div>`; $('#lo').onclick = logout; return; }
  try { await routes[key](view, arg); } catch (e) { view.innerHTML = `<div class="empty"><div class="icon">⚠️</div><p>${esc(e.message)}</p></div>`; }
}
window.addEventListener('hashchange', render);

// ---------- Accesso / registrazione ----------
function viewAuth(view) {
  let mode = 'register';
  const draw = () => {
    view.innerHTML = `
      <div class="hero"><p class="big">Parla quanto vuoi.<br><em>Nessun limite ai messaggi.</em></p>
      <p class="lead">Profili verificati, un algoritmo che ti spiega perché vedi chi vedi, e prezzi chiari.</p></div>
      <div class="tabs"><button data-m="register" class="${mode === 'register' ? 'on' : ''}">Registrati</button><button data-m="login" class="${mode === 'login' ? 'on' : ''}">Accedi</button></div>
      <form class="panel" id="f" novalidate>
        ${mode === 'register' ? `
          <label for="name">Nome</label><input id="name" name="name" autocomplete="given-name" required maxlength="40">
          <div class="row"><div><label for="birthdate">Data di nascita</label><input id="birthdate" type="date" name="birthdate" required></div>
          <div><label for="gender">Sono</label><select id="gender" name="gender">${Object.entries(GENDER_SELF).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div></div>
          <label>Mi interessano</label><div class="chips" id="ii">${Object.entries(GENDER_LABEL).map(([k, v]) => `<button type="button" class="chip" data-g="${k}">${v}</button>`).join('')}</div>` : ''}
        <label for="email">Email</label><input id="email" type="email" name="email" autocomplete="email" required>
        <label for="password">Password</label><input id="password" type="password" name="password" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" required minlength="10" placeholder="${mode === 'register' ? 'Almeno 10 caratteri' : ''}">
        ${mode === 'register' ? `
          <label class="check"><input type="checkbox" name="consent_terms"> Ho almeno 18 anni e accetto Termini e Informativa privacy.</label>
          <label class="check"><input type="checkbox" name="consent_sensitive"> Acconsento al trattamento dei dati sulle mie preferenze di incontro (dati particolari, art. 9 GDPR) per mostrarmi profili compatibili.</label>` : ''}
        <div class="spacer"></div><br>
        <button class="btn" type="submit">${mode === 'register' ? 'Crea account' : 'Entra'}</button>
        ${mode === 'login' ? '<p class="muted">Demo: demo@demo.local · password-demo-123</p>' : ''}
      </form>`;
    for (const b of $$('.tabs button', view)) b.onclick = () => { mode = b.dataset.m; draw(); };
    for (const c of $$('#ii .chip', view)) c.onclick = () => c.classList.toggle('on');
    $('#f', view).onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
      try {
        let out;
        if (mode === 'register') {
          out = await api('/api/auth/register', { method: 'POST', body: { ...body, consent_terms: fd.has('consent_terms'), consent_sensitive: fd.has('consent_sensitive'),
            interested_in: $$('#ii .chip.on', view).map((c) => c.dataset.g) } });
        } else out = await api('/api/auth/login', { method: 'POST', body });
        state.token = out.token; state.me = out.me; localStorageSet('token', out.token);
        connectWs(); location.hash = mode === 'register' ? '#/profilo' : '#/scopri'; render();
      } catch (err) { toast(err.message); }
    };
  };
  draw();
}

// ---------- Scopri ----------
async function viewDiscover(view) {
  const me = state.me;
  if (!me.profile.lat || !me.photos.length) {
    view.innerHTML = `<div class="empty"><div class="icon">📍</div><h2>Completa il profilo</h2>
      <p>Per vedere persone vicine servono <b>almeno una foto</b> e la <b>tua posizione</b>.</p><a class="btn" href="#/profilo">Vai al profilo</a></div>`;
    return;
  }
  state.deck = await api('/api/discover');
  drawDeck(view);
}

function drawDeck(view) {
  const left = state.me.limits.likesLeftToday;
  if (!state.deck.length) {
    view.innerHTML = `<div class="empty"><div class="icon">🌅</div><h2>Per ora è tutto</h2><p>Hai visto tutte le persone compatibili nel tuo raggio. Prova ad allargare distanza o età.</p>
      <a class="btn secondary" href="#/profilo">Modifica filtri</a></div>`;
    return;
  }
  const c = state.deck[0];
  view.innerHTML = `
    <div class="deck"><div class="card" id="card" data-bg="${esc(photo(c))}">
      <div class="why">${c.why.map((w) => `<span class="pill">${esc(WHY_LABEL[w] || w)}</span>`).join('')}</div>
      <div class="stamp like">LIKE</div><div class="stamp nope">NO</div><div class="shade"></div>
      <div class="info"><h3>${esc(c.name)}, ${c.age}${c.verified ? '<span class="verified" title="Profilo verificato">✓</span>' : ''}</h3>
        <div class="meta">📍 ${esc(c.city)} · a ${c.distanceKm} km</div>
        <div class="bio">${esc(c.bio)}</div>
        <div>${c.interests.slice(0, 5).map((i) => `<span class="pill">${esc(i)}</span>`).join('')}</div></div>
    </div></div>
    <div class="actions">
      <button class="round nope" id="nope" aria-label="Non mi interessa">✕</button>
      <button class="round sm super" id="super" aria-label="Super like">★</button>
      <button class="round like" id="like" aria-label="Mi piace">♥</button>
    </div>
    <p class="muted center">${left == null ? 'Like illimitati' : `Like rimasti oggi: ${left}`} · Messaggi: sempre illimitati</p>`;
  applyBg(view);
  $('#nope').onclick = () => swipe('pass');
  $('#like').onclick = () => swipe('like');
  $('#super').onclick = () => swipe('superlike');
  enableDrag($('#card'));
}

function enableDrag(card) {
  let x0 = null, dx = 0;
  const stamps = { like: $('.stamp.like', card), nope: $('.stamp.nope', card) };
  card.onpointerdown = (e) => { x0 = e.clientX; card.setPointerCapture(e.pointerId); card.classList.add('dragging'); };
  card.onpointermove = (e) => {
    if (x0 == null) return; dx = e.clientX - x0;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    stamps.like.style.opacity = Math.max(0, dx / 100); stamps.nope.style.opacity = Math.max(0, -dx / 100);
  };
  card.onpointerup = () => {
    card.classList.remove('dragging'); x0 = null;
    if (dx > 110) swipe('like'); else if (dx < -110) swipe('pass');
    else { card.style.transform = ''; stamps.like.style.opacity = 0; stamps.nope.style.opacity = 0; }
    dx = 0;
  };
}

async function swipe(direction) {
  const c = state.deck[0]; const card = $('#card'); if (!c || !card) return;
  try {
    const out = await api('/api/swipes', { method: 'POST', body: { targetId: c.id, direction } });
    card.style.transform = `translateX(${direction === 'pass' ? -600 : 600}px) rotate(${direction === 'pass' ? -25 : 25}deg)`; card.style.opacity = 0;
    state.deck.shift();
    if (direction !== 'pass' && state.me.limits.likesLeftToday != null) state.me.limits.likesLeftToday -= 1;
    if (out.match) { state.lastMatchShown = out.match.id; showMatch(out.match); }
    setTimeout(() => drawDeck($('#view')), 230);
  } catch (e) {
    if (e.status === 402) modal(`<h2>Like di oggi finiti</h2><p>${esc(e.message)}</p><a class="btn" href="#/piani" data-close>Scopri Premium</a><button class="btn ghost" data-close>Più tardi</button>`);
    else toast(e.message);
  }
}

function showMatch(match) {
  const m = modal(`<div class="match-anim">È un match!</div><p>Tu e ${esc(match.profile.name)} vi piacete.</p>
    <div class="pair"><div class="avatar" data-bg="${esc(photo(state.me))}"></div><div class="avatar" data-bg="${esc(photo(match.profile))}"></div></div>
    <a class="btn" href="#/chat/${match.id}" data-close>Scrivi un messaggio</a><button class="btn ghost" data-close>Continua a scoprire</button>`);
  applyBg(m);
}

// ---------- Chi ti ha messo like ----------
async function viewLikes(view) {
  const data = await api('/api/likes');
  if (data.locked) {
    view.innerHTML = `<h1>Like ricevuti</h1><div class="panel lockbox"><p class="big">💛 <b>${data.count}</b> ${data.count === 1 ? 'persona ti ha' : 'persone ti hanno'} messo like</p>
      <p class="muted">Con Premium vedi chi sono e ricambi subito. Senza Premium le incontrerai comunque in Scopri.</p><a class="btn" href="#/piani">Vedi chi sono</a></div>
      <div class="grid">${Array.from({ length: Math.min(data.count, 4) }, () => '<div class="tile locked" data-bg="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E"></div>').join('')}</div>`;
    applyBg(view); return;
  }
  view.innerHTML = `<h1>Like ricevuti</h1>${data.profiles.length ? `<div class="grid">${data.profiles.map((p) => `
    <div><div class="tile" data-bg="${esc(photo(p))}"><div class="cap">${esc(p.name)}, ${p.age}</div></div>
    <div class="row"><button class="btn small secondary" data-pass="${p.id}">✕</button><button class="btn small" data-like="${p.id}">♥ Ricambia</button></div></div>`).join('')}</div>`
    : '<div class="empty"><div class="icon">💛</div><p>Nessun nuovo like per ora.</p></div>'}`;
  applyBg(view);
  for (const b of $$('[data-like],[data-pass]', view)) b.onclick = async () => {
    const out = await api('/api/swipes', { method: 'POST', body: { targetId: Number(b.dataset.like || b.dataset.pass), direction: b.dataset.like ? 'like' : 'pass' } });
    if (out.match) { state.lastMatchShown = out.match.id; showMatch(out.match); } viewLikes(view);
  };
}

// ---------- Match ----------
async function viewMatches(view) {
  const list = await api('/api/matches');
  const fresh = list.filter((m) => !m.lastMessage); const convo = list.filter((m) => m.lastMessage);
  view.innerHTML = `<h1>Chat</h1>
    ${fresh.length ? `<h2>Nuovi match</h2><div class="list">${fresh.map(itemHtml).join('')}</div>` : ''}
    <h2>Conversazioni</h2>${convo.length ? `<div class="list">${convo.map(itemHtml).join('')}</div>` : '<p class="muted">Ancora nessuna conversazione. Rompi il ghiaccio: i messaggi non hanno limiti.</p>'}`;
  applyBg(view);
}
const itemHtml = (m) => `<a class="item" href="#/chat/${m.id}"><div class="avatar" data-bg="${esc(photo(m.profile))}"></div>
  <div class="txt"><div class="name">${esc(m.profile.name)}${m.profile.verified ? ' <span class="pill teal">✓ verificato</span>' : ''}</div>
  <div class="last">${m.lastMessage ? esc(m.lastMessage) : 'Nuovo match: scrivi per primo!'}</div></div>${m.unread ? '<span class="dot"></span>' : ''}</a>`;

// ---------- Chat ----------
async function viewChat(view, id) {
  const matchId = Number(id);
  const data = await api(`/api/matches/${matchId}/messages`);
  state.chatMatchId = matchId;
  const p = data.profile;
  view.innerHTML = `<div class="chat">
    <div class="chathead"><a href="#/match" aria-label="Indietro">←</a><div class="avatar" data-bg="${esc(photo(p))}"></div>
      <div class="grow">${esc(p.name)}, ${p.age}<div class="muted">${esc(p.city)}</div></div><button class="btn small ghost" id="menu" aria-label="Opzioni">⋯</button></div>
    <div class="msgs" id="msgs">${data.messages.length ? '' : `<div class="empty"><p>Avete in comune: ${p.interests.filter((i) => state.me.profile.interests.includes(i)).map((i) => `<span class="pill">${esc(i)}</span>`).join('') || '—'}</p><p class="muted">Tocca ✨ per un suggerimento.</p></div>`}</div>
    <div class="typing" id="typing"></div>
    <div class="sugg hidden" id="sugg"></div>
    <form class="composer" id="composer"><button type="button" class="round ai" id="ai" title="Suggerimenti AI">✨</button>
      <input id="text" placeholder="Scrivi un messaggio…" autocomplete="off" maxlength="2000"><button class="round" aria-label="Invia">➤</button></form></div>`;
  applyBg(view);
  for (const m of data.messages) appendMessage(m);
  api(`/api/matches/${matchId}/read`, { method: 'POST' }).then(refreshBadges).catch(() => {});

  $('#composer').onsubmit = async (e) => {
    e.preventDefault(); const input = $('#text'); const body = input.value.trim(); if (!body) return;
    input.value = ''; $('#sugg').classList.add('hidden');
    try { await api(`/api/matches/${matchId}/messages`, { method: 'POST', body: { body } }); } catch (err) { toast(err.message); input.value = body; }
  };
  $('#text').oninput = () => { if (state.ws?.readyState === 1) state.ws.send(JSON.stringify({ type: 'typing', matchId })); };
  $('#ai').onclick = async () => {
    const box = $('#sugg'); box.classList.remove('hidden'); box.innerHTML = '<span class="muted">Sto pensando…</span>';
    try {
      const out = await api(`/api/matches/${matchId}/suggestions`, { method: 'POST' });
      box.innerHTML = out.suggestions.map((s) => `<button type="button">${esc(s.text)}<small>${esc(s.why)}</small></button>`).join('') +
        `<span class="muted">${out.source === 'ai' ? '✨ Generato da AI' : '💡 Suggerimenti automatici'} · ${esc(out.disclaimer)}</span>`;
      $$('button', box).forEach((b, i) => (b.onclick = () => { $('#text').value = out.suggestions[i].text; $('#text').focus(); }));
    } catch (err) { box.innerHTML = `<span class="muted">${esc(err.message)} <a href="#/piani">Vedi i piani</a></span>`; }
  };
  $('#menu').onclick = () => {
    const m = modal(`<h2>${esc(p.name)}</h2>
      <button class="btn secondary" id="rep">Segnala</button><br><br><button class="btn secondary" id="blk">Blocca</button><br><br>
      <button class="btn ghost" id="unm">Annulla match</button><button class="btn ghost" data-close>Chiudi</button>`);
    $('#blk', m).onclick = async () => { await api('/api/blocks', { method: 'POST', body: { userId: p.id } }); closeModal(); toast('Utente bloccato'); location.hash = '#/match'; };
    $('#unm', m).onclick = async () => { await api(`/api/matches/${matchId}`, { method: 'DELETE' }); closeModal(); location.hash = '#/match'; };
    $('#rep', m).onclick = () => {
      const r = modal(`<h2>Segnala ${esc(p.name)}</h2><form id="rf"><select name="reason">${Object.entries(REASONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
        <label>Dettagli (facoltativo)</label><textarea name="details" maxlength="1000"></textarea><br><br>
        <button class="btn">Invia segnalazione</button></form><p class="muted">La persona verrà anche bloccata. La segnalazione è anonima.</p>`);
      $('#rf', r).onsubmit = async (e) => {
        e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target));
        await api('/api/reports', { method: 'POST', body: { userId: p.id, ...fd } }); closeModal(); toast('Grazie, il team sicurezza verificherà.'); location.hash = '#/match';
      };
    };
  };
}

function appendMessage(m) {
  const box = $('#msgs'); if (!box || $(`[data-mid="${m.id}"]`, box)) return;
  $('.empty', box)?.remove();
  if (m.warning) box.insertAdjacentHTML('beforeend', `<div class="safety">⚠️ Attenzione: questo messaggio contiene segnali tipici delle truffe (${esc(m.warning.replaceAll('_', ' '))}). Non inviare mai denaro né dati personali.</div>`);
  box.insertAdjacentHTML('beforeend', `<div class="bubble ${m.mine ? 'me' : 'them'}" data-mid="${m.id}">${esc(m.body)}</div>`);
  box.scrollTop = box.scrollHeight;
}

// ---------- Profilo ----------
async function viewProfile(view) {
  const me = await loadMe(); const p = me.profile;
  view.innerHTML = `
    <h1>Il tuo profilo</h1>
    <div class="panel"><h2>Foto <span class="muted">(max 6)</span></h2><div class="photos">
      ${me.photos.map((ph) => `<div class="ph" data-bg="${esc(ph.url)}"><button data-del="${ph.id}" aria-label="Elimina foto">✕</button><span class="st">${{ pending: 'in revisione', approved: 'ok', rejected: 'rifiutata' }[ph.moderation]}</span></div>`).join('')}
      ${me.photos.length < 6 ? '<label class="add">＋<input type="file" accept="image/png,image/jpeg,image/webp" id="up" hidden></label>' : ''}</div></div>

    <div class="panel"><h2>Verifica ${p.verified ? '<span class="pill teal">✓ verificato</span>' : ''}</h2>
      ${p.verified ? '<p class="muted">Il badge blu aumenta la fiducia e la visibilità.</p>' : me.verification?.status === 'pending'
        ? '<p class="muted">Selfie inviato: in revisione dal team.</p>'
        : '<p class="muted">Scatta un selfie facendo il gesto richiesto: un moderatore lo confronta con le tue foto.</p><button class="btn secondary" id="ver">Verifica il profilo</button>'}</div>

    <form class="panel" id="pf"><h2>Informazioni</h2>
      <label for="pname">Nome</label><input id="pname" name="name" value="${esc(p.name)}" maxlength="40">
      <label for="bio">Bio</label><textarea id="bio" name="bio" maxlength="500" placeholder="Racconta qualcosa di vero su di te">${esc(p.bio)}</textarea>
      <label>Interessi (max 12)</label><div class="chips" id="ints">${INTERESTS.map((i) => `<button type="button" class="chip ${p.interests.includes(i) ? 'on' : ''}" data-i="${esc(i)}">${esc(i)}</button>`).join('')}</div>
      <label>Posizione</label><div class="row"><input name="city" value="${esc(p.city)}" placeholder="Città"><button type="button" class="btn secondary" id="geo">📍 Usa la mia posizione</button></div>
      <p class="muted" id="geoinfo">${p.lat ? 'Posizione salvata. Agli altri mostriamo solo la distanza approssimativa, mai il punto esatto.' : 'Posizione non impostata.'}</p>

      <h2>Chi vuoi vedere</h2>
      <div class="chips" id="gi">${Object.entries(GENDER_LABEL).map(([k, v]) => `<button type="button" class="chip ${p.interested_in.includes(k) ? 'on' : ''}" data-g="${k}">${v}</button>`).join('')}</div>
      <div class="row"><div><label for="amin">Età minima</label><input id="amin" type="number" name="age_min" min="18" max="99" value="${p.age_min}"></div>
        <div><label for="amax">Età massima</label><input id="amax" type="number" name="age_max" min="18" max="99" value="${p.age_max}"></div></div>
      <label for="dist">Distanza massima: <b id="distv">${p.max_distance_km}</b> km</label><input id="dist" type="range" name="max_distance_km" min="1" max="300" value="${p.max_distance_km}">
      <label class="check"><input type="checkbox" name="only_verified" ${p.only_verified ? 'checked' : ''} ${me.limits.advancedFilters ? '' : 'disabled'}> Mostra solo profili verificati ${me.limits.advancedFilters ? '' : '<span class="pill">Premium</span>'}</label>
      <br><button class="btn">Salva</button></form>

    <div class="panel"><h2>Abbonamento</h2><p>Piano attuale: <b>${esc(me.plan.toUpperCase())}</b>${me.planExpiresAt ? ` · ${me.cancelAtPeriodEnd ? 'termina' : 'si rinnova'} il ${new Date(me.planExpiresAt).toLocaleDateString('it-IT')}` : ''}</p>
      <p class="muted">Messaggi: illimitati · Like oggi: ${me.limits.likesLeftToday ?? 'illimitati'} · Suggerimenti AI oggi: ${me.limits.aiLeftToday ?? 'illimitati'}</p><a class="btn secondary" href="#/piani">Gestisci piano</a></div>

    <div class="panel"><h2>Privacy</h2>
      <label class="check"><input type="checkbox" id="cai" ${me.consentAi ? 'checked' : ''}> Usa l'AI esterna per i suggerimenti di conversazione (invia solo nome, interessi, bio e ultimi messaggi della chat). Senza consenso usiamo suggerimenti locali.</label>
      <br><button class="btn ghost" id="exp">⬇️ Scarica i miei dati</button><button class="btn ghost" id="del">🗑️ Elimina account</button>
      ${me.role === 'admin' ? '<a class="btn secondary" href="/admin">Pannello amministratore</a><br><br>' : ''}
      <button class="btn secondary" id="lo">Esci</button></div>`;
  applyBg(view);

  const save = (body, msg = 'Salvato') => api('/api/me/profile', { method: 'PUT', body }).then((m) => { state.me = m; toast(msg); }).catch((e) => toast(e.message));
  for (const c of $$('#ints .chip, #gi .chip', view)) c.onclick = () => c.classList.toggle('on');
  $('#dist').oninput = (e) => ($('#distv').textContent = e.target.value);
  $('#pf').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    save({ name: fd.get('name'), bio: fd.get('bio'), city: fd.get('city'), age_min: Number(fd.get('age_min')), age_max: Number(fd.get('age_max')),
      max_distance_km: Number(fd.get('max_distance_km')), only_verified: fd.has('only_verified'),
      interests: $$('#ints .chip.on').map((c) => c.dataset.i), interested_in: $$('#gi .chip.on').map((c) => c.dataset.g) });
  };
  $('#geo').onclick = () => {
    const fallback = () => save({ lat: 37.8516, lng: 15.2853, city: $('[name=city]').value || 'Taormina' }, 'Posizione demo impostata (Taormina)').then(() => viewProfile(view));
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition((pos) => save({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'Posizione aggiornata').then(() => viewProfile(view)), fallback, { timeout: 6000 });
  };
  $('#up')?.addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { state.me = await api('/api/me/photos', { method: 'POST', body: { dataUrl: await readFileAsDataUrl(f) } }); viewProfile(view); } catch (err) { toast(err.message); }
  });
  for (const b of $$('[data-del]', view)) b.onclick = async () => { await api(`/api/me/photos/${b.dataset.del}`, { method: 'DELETE' }); viewProfile(view); };
  $('#ver')?.addEventListener('click', async () => {
    const { gesture } = await api('/api/verification/gesture');
    const m = modal(`<h2>Verifica il profilo</h2><p>Scatta un selfie con questo gesto:</p><p class="big"><b>${esc(gesture)}</b></p>
      <label class="btn">📷 Scatta o scegli il selfie<input type="file" accept="image/*" capture="user" id="sf" hidden></label><button class="btn ghost" data-close>Annulla</button>`);
    $('#sf', m).onchange = async (e) => {
      try { state.me = await api('/api/me/verification', { method: 'POST', body: { gesture, dataUrl: await readFileAsDataUrl(e.target.files[0]) } }); closeModal(); toast('Selfie inviato!'); viewProfile(view); }
      catch (err) { toast(err.message); }
    };
  });
  $('#cai').onchange = async (e) => { state.me = await api('/api/me/consents', { method: 'PUT', body: { ai: e.target.checked } }); toast('Preferenza salvata'); };
  $('#exp').onclick = async () => {
    const data = await api('/api/me/export');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), download: 'i-miei-dati.json' });
    a.click(); URL.revokeObjectURL(a.href);
  };
  $('#del').onclick = () => {
    const m = modal('<h2>Eliminare l\'account?</h2><p>Profilo, foto, match e messaggi verranno cancellati definitivamente.</p><button class="btn" id="yes">Elimina definitivamente</button><button class="btn ghost" data-close>Annulla</button>');
    $('#yes', m).onclick = async () => { await api('/api/me', { method: 'DELETE' }); closeModal(); logout(); };
  };
  $('#lo').onclick = logout;
}

// ---------- Piani ----------
async function viewPlans(view) {
  const [plans, me] = await Promise.all([api('/api/plans'), loadMe()]);
  const feats = (p) => [
    'Messaggi illimitati con tutti i tuoi match',
    p.likesPerDay ? `${p.likesPerDay} like al giorno` : 'Like illimitati',
    p.seeLikes ? 'Vedi chi ti ha messo like' : null,
    p.advancedFilters ? 'Filtro "solo profili verificati"' : null,
    p.aiPerDay ? `${p.aiPerDay} suggerimenti AI al giorno` : 'Coach AI illimitato',
    p.boostsPerMonth ? `${p.boostsPerMonth} boost al mese` : null,
  ].filter(Boolean);
  view.innerHTML = `<h1>Piani</h1><p class="lead">Prezzi IVA inclusa. Disdici quando vuoi: il piano resta attivo fino a fine periodo già pagato.</p>
    ${plans.map((p) => `<div class="plan ${me.plan === p.id ? 'current' : ''}"><div class="row"><b>${esc(p.label)}</b><div class="price">${p.priceEurMonth ? `€${p.priceEurMonth.toFixed(2).replace('.', ',')}<small>/mese</small>` : 'Gratis'}</div></div>
      <ul>${feats(p).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${me.plan === p.id ? `<span class="pill teal">Il tuo piano</span>${p.id !== 'free' && !me.cancelAtPeriodEnd ? ' <button class="btn small ghost" id="cancel">Disdici rinnovo</button>' : ''}` : p.id === 'free' ? '' : `<button class="btn" data-buy="${p.id}">Passa a ${esc(p.label)}</button>`}</div>`).join('')}
    <div class="notice">Ambiente di prova: il pagamento è simulato. Con le chiavi Stripe configurate si apre il checkout reale.</div>`;
  for (const b of $$('[data-buy]', view)) b.onclick = async () => {
    try {
      const out = await api('/api/billing/checkout', { method: 'POST', body: { plan: b.dataset.buy } });
      if (out.url) { location.href = out.url; return; }
      state.me = out.me; toast(`Benvenuto in ${b.dataset.buy.toUpperCase()} 🎉`); viewPlans(view);
    } catch (e) { toast(e.message); }
  };
  $('#cancel')?.addEventListener('click', async () => { state.me = await api('/api/billing/cancel', { method: 'POST' }); toast('Rinnovo disattivato'); viewPlans(view); });
}

// ---------- Notifiche ----------
async function viewNotifications(view) {
  const list = await api('/api/notifications');
  const label = (n) => ({ match: `Nuovo match con ${n.payload.name} 🎉`, message: `Nuovo messaggio da ${n.payload.from}`, superlike: 'Qualcuno ti ha messo un super like ★',
    subscription: `Abbonamento ${String(n.payload.plan).toUpperCase()} attivo`, verification: n.payload.approved ? 'Profilo verificato ✅' : 'Verifica non approvata',
    moderation: `Provvedimento del team sicurezza: ${n.payload.resolution}` }[n.type] || n.type);
  const link = (n) => (n.payload.matchId ? `#/chat/${n.payload.matchId}` : n.type === 'superlike' ? '#/like' : '#/profilo');
  view.innerHTML = `<h1>Notifiche</h1>${list.length ? `<div class="list">${list.map((n) => `<a class="item" href="${link(n)}"><div class="txt"><div class="name">${esc(label(n))}</div>
    <div class="last">${new Date(n.created_at).toLocaleString('it-IT')}</div></div>${n.read_at ? '' : '<span class="dot"></span>'}</a>`).join('')}</div>` : '<div class="empty"><div class="icon">🔔</div><p>Nessuna notifica.</p></div>'}`;
  await api('/api/notifications/read', { method: 'POST' }); refreshBadges();
}

document.addEventListener('keydown', (e) => {
  if (!location.hash.startsWith('#/scopri') || !$('#card') || $('#modal:not(.hidden)')) return;
  if (e.key === 'ArrowRight') swipe('like'); if (e.key === 'ArrowLeft') swipe('pass'); if (e.key === 'ArrowUp') swipe('superlike');
});

render();
