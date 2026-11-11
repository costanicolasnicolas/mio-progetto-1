const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const date = (t) => (t ? new Date(t).toLocaleString('it-IT') : '—');
let token = (() => { try { return localStorage.getItem('token'); } catch { return null; } })();

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || res.status); e.status = res.status; throw e; }
  return data;
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 3000); }

async function load() {
  try {
    const s = await api('/api/admin/stats');
    $('#login').classList.add('hidden'); $('#dash').classList.remove('hidden');
    const k = [['Utenti', s.users], ['Attivi 24h', s.activeToday], ['Paganti', s.paying], ['Premium', s.premium], ['Plus', s.plus], ['MRR lordo €', s.mrrEur.toLocaleString('it-IT')],
      ['Match', s.matches], ['Messaggi 24h', s.messages24h], ['Segnalazioni aperte', s.openReports], ['Verifiche', s.pendingVerifications], ['Msg sospetti', s.flaggedMessages], ['Sospesi', s.suspended]];
    $('#kpis').innerHTML = k.map(([l, v]) => `<div class="kpi"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('');
    await Promise.all([reports(), verifications(), photos(), flagged(), users()]);
  } catch (e) {
    if (e.status === 401 || e.status === 403) { $('#login').classList.remove('hidden'); $('#dash').classList.add('hidden'); } else toast(e.message);
  }
}

async function reports() {
  const rows = await api('/api/admin/reports');
  $('#reports').innerHTML = `<tr><th>Data</th><th>Segnalato</th><th>Da</th><th>Motivo</th><th>Dettagli</th><th>Stato</th><th>Azione</th></tr>` + (rows.map((r) => `<tr>
    <td>${date(r.created_at)}</td><td>${esc(r.reported_name)} <span class="status-${esc(r.reported_status)}">(${esc(r.reported_status)})</span><br><span class="muted">${r.total_reports} segnalazioni totali</span></td>
    <td>${esc(r.reporter_name)}</td><td>${esc(r.reason)}</td><td>${esc(r.details)}</td><td>${esc(r.status)}${r.resolution ? `<br><span class="muted">${esc(r.resolution)}</span>` : ''}</td>
    <td>${r.status === 'open' ? ['dismiss', 'suspend', 'ban', 'reinstate'].map((a) => `<button class="btn small ${a === 'ban' ? '' : 'secondary'}" data-r="${r.id}" data-a="${a}">${{ dismiss: 'Archivia', suspend: 'Sospendi', ban: 'Banna', reinstate: 'Riattiva' }[a]}</button>`).join('') : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Nessuna segnalazione</td></tr>');
  for (const b of document.querySelectorAll('[data-r]')) b.onclick = async () => {
    const resolution = prompt('Motivazione (sarà comunicata all\'utente interessato):'); if (!resolution) return;
    await api(`/api/admin/reports/${b.dataset.r}`, { method: 'POST', body: { action: b.dataset.a, resolution } }); toast('Fatto'); load();
  };
}

async function verifications() {
  const rows = await api('/api/admin/verifications');
  $('#verif').innerHTML = `<tr><th>Utente</th><th>Gesto richiesto</th><th>Selfie</th><th>Foto profilo</th><th>Azione</th></tr>` + (rows.map((v) => `<tr>
    <td>${esc(v.name)}<br><span class="muted">${date(v.created_at)}</span></td><td><b>${esc(v.gesture)}</b></td><td class="thumbs"><img src="${esc(v.selfie_url)}" alt="selfie"></td>
    <td class="thumbs">${v.photos.map((u) => `<img src="${esc(u)}" alt="">`).join('')}</td>
    <td><button class="btn small" data-v="${v.id}" data-ok="1">Approva</button><button class="btn small secondary" data-v="${v.id}" data-ok="">Rifiuta</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Nessuna richiesta</td></tr>');
  for (const b of document.querySelectorAll('[data-v]')) b.onclick = async () => { await api(`/api/admin/verifications/${b.dataset.v}`, { method: 'POST', body: { approve: Boolean(b.dataset.ok) } }); load(); };
}

async function photos() {
  const rows = await api('/api/admin/photos');
  $('#photos').innerHTML = `<tr><th>Utente</th><th>Foto</th><th>Azione</th></tr>` + (rows.map((p) => `<tr><td>${esc(p.name)}<br><span class="muted">${date(p.created_at)}</span></td>
    <td class="thumbs"><img src="${esc(p.url)}" alt=""></td><td><button class="btn small" data-p="${p.id}" data-ok="1">Approva</button><button class="btn small secondary" data-p="${p.id}" data-ok="">Rifiuta</button></td></tr>`).join('') || '<tr><td colspan="3" class="muted">Nessuna foto in coda</td></tr>');
  for (const b of document.querySelectorAll('[data-p]')) b.onclick = async () => { await api(`/api/admin/photos/${b.dataset.p}`, { method: 'POST', body: { approve: Boolean(b.dataset.ok) } }); load(); };
}

async function flagged() {
  const rows = await api('/api/admin/flagged');
  $('#flagged').innerHTML = `<tr><th>Data</th><th>Mittente</th><th>Messaggio</th><th>Segnali</th></tr>` + (rows.map((m) => `<tr><td>${date(m.created_at)}</td>
    <td>${esc(m.sender_name)} <span class="status-${esc(m.sender_status)}">(${esc(m.sender_status)})</span></td><td>${esc(m.body)}</td><td>${esc(m.flagged)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nessun messaggio sospetto</td></tr>');
}

async function users() {
  const rows = await api(`/api/admin/users?q=${encodeURIComponent($('#q').value)}`);
  $('#users').innerHTML = `<tr><th>ID</th><th>Nome</th><th>Email</th><th>Città</th><th>Piano</th><th>Stato</th><th>Segnalazioni</th><th>Azione</th></tr>` + rows.map((u) => `<tr>
    <td>${u.id}</td><td>${esc(u.name)} ${u.verified ? '✓' : ''}</td><td>${esc(u.email)}</td><td>${esc(u.city)}</td><td>${esc(u.plan)}</td><td class="status-${esc(u.status)}">${esc(u.status)}</td><td>${u.reports}</td>
    <td>${['active', 'suspended', 'banned'].filter((s) => s !== u.status).map((s) => `<button class="btn small secondary" data-u="${u.id}" data-s="${s}">${{ active: 'Riattiva', suspended: 'Sospendi', banned: 'Banna' }[s]}</button>`).join('')}</td></tr>`).join('');
  for (const b of document.querySelectorAll('[data-u]')) b.onclick = async () => { await api(`/api/admin/users/${b.dataset.u}/status`, { method: 'POST', body: { status: b.dataset.s } }); load(); };
}

$('#q').oninput = () => users();
$('#lf').onsubmit = async (e) => {
  e.preventDefault();
  try {
    const out = await api('/api/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
    token = out.token; try { localStorage.setItem('token', token); } catch { /* */ } load();
  } catch (err) { toast(err.message); }
};
load();
