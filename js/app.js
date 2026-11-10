/* =========================================================
   MediNexo · Vistas y lógica del prototipo (sin backend)
   Principios: poca información por pantalla, tablas cortas y
   el detalle en modales (divulgación progresiva).
   ========================================================= */

const S = { role: null, view: 'dashboard', inv: 'all', pub: null, notif: false, cat: { q: '', type: 'Todos', exp: 'any', city: 'Todas' } };

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const me = () => ROLES[S.role];
const myInst = () => me().inst;
const inst = id => INST[id];
const item = id => ITEMS.find(i => i.id === id);
const short = i => i.name.split(' (')[0];
const lotOf = i => (i.lot !== '—' ? i.lot : i.pn);
const fmt$ = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt$0 = n => '$' + Math.round(n).toLocaleString('en-US');
const fmtDate = d => d.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const val = i => i.qty * i.price;
const sum = a => a.reduce((s, i) => s + val(i), 0);
const atRisk = i => i.exp != null && i.exp <= 30;
const sugg = i => (i.exp == null ? 0 : i.exp <= 15 ? .35 : i.exp <= 30 ? .25 : i.exp <= 60 ? .15 : 0);
const stepNames = ['Solicitud enviada', 'Aceptada', 'En tránsito', 'Recibida y verificada'];
const ownItems = () => ITEMS.filter(i => i.inst === myInst());
const riskItems = () => ownItems().filter(i => atRisk(i) && !i.pub);
const myReqs = () => (S.role === 'plat' ? REQS : REQS.filter(r => r.buyer === myInst() || r.seller === myInst()));
const pendingActions = () => S.role === 'plat' ? 0 : myReqs().filter(r => (r.seller === myInst() && r.status === 0) || (r.buyer === myInst() && r.status === 2)).length;
const savedBase = () => 4350 + Math.round(sum(ownItems().filter(i => atRisk(i) && i.pub)) * .85);

/* ---------- Iconos ---------- */
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  swap: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 013-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 01-3 3H3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  bell: '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a6 6 0 01-7.9 7.9l-6.9 6.9a2.1 2.1 0 01-3-3l6.9-6.9a6 6 0 017.9-7.9z"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a2 2 0 002 3h12a2 2 0 002-3l-6-10V3"/>',
  pill: '<path d="M10.5 20.5l10-10a4.95 4.95 0 00-7-7l-10 10a4.95 4.95 0 007 7zM8.5 8.5l7 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  file: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
  building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/>',
  snow: '<path d="M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8z"/><path d="M7 7h.01"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 14l2 2 4-4"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/>'
};
const ic = (n, cls = 'w-5 h-5') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- Componentes ---------- */
const BADGE = {
  bad: 'bg-bad/10 text-bad ring-bad/25', warn: 'bg-warn/15 text-amber-700 ring-warn/30', ok: 'bg-ok/10 text-ok ring-ok/25',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200', brand: 'bg-sky text-brand-dark ring-brand/25', info: 'bg-info/10 text-info ring-info/25'
};
const badge = (t, c = 'slate', icon) => `<span class="badge ${BADGE[c]}">${icon ? ic(icon, 'w-3 h-3') : ''}${t}</span>`;
const expBadge = i => i.exp == null ? badge('Sin caducidad') : badge(`Vence en ${i.exp} d`, i.exp <= 30 ? 'bad' : i.exp <= 90 ? 'warn' : 'ok', 'clock');
const typeChip = t => `<span class="badge ring-0" style="background:color-mix(in srgb,${TYPES[t].c} 12%,white);color:${TYPES[t].c}">${t}</span>`;
const thumb = (it, s = 'w-10 h-10') => { const t = TYPES[it.type]; return `<div class="${s} shrink-0 rounded-lg grid place-items-center" style="background:color-mix(in srgb,${t.c} 12%,white);color:${t.c}">${ic(t.icon, 'w-1/2 h-1/2')}</div>`; };
const TONE = { brand: 'bg-sky text-brand', bad: 'bg-bad/10 text-bad', warn: 'bg-warn/15 text-amber-700', ok: 'bg-ok/10 text-ok', info: 'bg-info/10 text-info', navy: 'bg-navy/10 text-navy' };
const kpi = (label, value, sub, icon, tone = 'brand') => `<div class="card p-5"><div class="flex items-start justify-between gap-2"><div class="text-xs font-medium text-muted">${label}</div><div class="w-9 h-9 shrink-0 rounded-lg grid place-items-center ${TONE[tone]}">${ic(icon, 'w-5 h-5')}</div></div><div class="mt-3 text-2xl font-bold text-navy leading-none">${value}</div><div class="mt-2 text-xs text-muted">${sub}</div></div>`;
const panel = (title, body, act = '') => `<section class="card overflow-hidden"><div class="flex items-center justify-between gap-3 px-5 pt-4 pb-3"><h3 class="font-semibold text-navy">${title}</h3>${act}</div>${body}</section>`;
const empty = (t, s) => `<div class="px-5 pb-8 pt-4 text-center"><div class="mx-auto w-10 h-10 rounded-full bg-sky text-brand grid place-items-center">${ic('check')}</div><div class="mt-3 font-medium text-navy text-sm">${t}</div><div class="text-xs text-muted mt-1">${s}</div></div>`;
const pageHead = (title, sub, actions = '') => `<div class="flex flex-wrap items-end justify-between gap-4 mb-7"><div><div class="text-xs font-semibold tracking-widest uppercase text-clay-dark">${me().inst ? esc(inst(me().inst).name) : 'MediNexo'}</div><h1 class="mt-1 text-3xl font-bold tracking-tight text-navy">${title}</h1><p class="text-sm text-muted mt-1.5 max-w-xl">${sub}</p></div><div class="flex gap-2 flex-wrap">${actions}</div></div>`;
const linkBtn = (t, v) => `<button class="btn btn-ghost btn-sm" onclick="go('${v}')">${t}</button>`;
const stBadge = s => badge(stepNames[s], ['info', 'brand', 'warn', 'ok'][s]);
const progress = s => `<div class="min-w-[140px]"><div class="flex gap-1">${[0, 1, 2, 3].map(n => `<span class="h-1.5 flex-1 rounded-full ${n <= s ? (s === 3 ? 'bg-ok' : 'bg-brand') : 'bg-slate-200'}"></span>`).join('')}</div><div class="text-[11px] mt-1.5 font-medium ${s === 3 ? 'text-ok' : 'text-muted'}">${stepNames[s]}</div></div>`;
const hero = ({ eyebrow, title, sub, cta, stats }) => `<section class="hero rounded-2xl text-white p-6 sm:p-8 lg:p-10 mb-8"><div class="grid lg:grid-cols-5 gap-8 items-center"><div class="lg:col-span-2"><div class="text-xs font-semibold tracking-widest uppercase text-clay">${eyebrow}</div><h1 class="mt-2 text-3xl sm:text-4xl font-bold leading-tight">${title}</h1><p class="mt-3 text-slate-300 text-[15px] leading-relaxed">${sub}</p>${cta ? `<div class="mt-6">${cta}</div>` : ''}</div><div class="lg:col-span-3 grid grid-cols-3 gap-px rounded-xl overflow-hidden" style="background:rgba(255,255,255,.15)">${stats.map(t => `<div class="p-4 sm:p-5" style="background:#1F2F46"><div class="text-[11px] sm:text-xs text-slate-300 leading-tight">${t[0]}</div><div class="mt-2 text-2xl sm:text-3xl font-bold ${t[3] || ''}">${t[1]}</div><div class="mt-1 text-[11px] text-slate-400">${t[2]}</div></div>`).join('')}</div></div></section>`;
const verified = () => badge('Verificada', 'ok', 'shield');

function barChart(vals, labels, h = 170) {
  const max = Math.max(...vals) * 1.1, ph = h - 26;
  return `<div class="px-5 pb-5"><div class="flex items-end gap-3" style="height:${h}px">${vals.map((v, i) => `<div class="flex-1 flex flex-col items-center justify-end"><div class="text-[11px] font-medium text-navy mb-1">${fmt$0(v)}</div><div class="w-full rounded-t ${i === vals.length - 1 ? 'bg-brand' : 'bg-brand/25'}" style="height:${Math.max(6, v / max * ph)}px"></div></div>`).join('')}</div><div class="flex gap-3 mt-2">${labels.map(l => `<div class="flex-1 text-center text-[11px] text-muted capitalize">${l}</div>`).join('')}</div></div>`;
}
const monthLabels = n => Array.from({ length: n }, (_, k) => new Date(TODAY.getFullYear(), TODAY.getMonth() - (n - 1 - k), 1).toLocaleDateString('es-EC', { month: 'short' }).replace('.', ''));

function toast(msg, o = {}) {
  const el = document.createElement('div');
  el.className = 'pointer-events-auto fade-in flex items-center gap-3 rounded-lg bg-navy text-white px-4 py-3 shadow-xl text-sm max-w-sm';
  el.innerHTML = `<span class="text-accent shrink-0">${ic(o.icon || 'check')}</span><span>${msg}</span>${o.label ? `<button class="ml-1 font-medium text-accent hover:underline shrink-0">${o.label}</button>` : ''}`;
  if (o.label) el.querySelector('button').onclick = () => { o.fn(); el.remove(); };
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), o.ms || 4200);
}
function openModal(html, wide) {
  const m = $('#modal'); m.innerHTML = `<div class="card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-auto fade-in">${html}</div>`;
  m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden';
}
function closeModal() { const m = $('#modal'); m.classList.add('hidden'); m.classList.remove('flex'); m.innerHTML = ''; document.body.style.overflow = ''; }
const modalHead = (t, sub = '') => `<div class="flex items-start justify-between gap-4 px-6 py-4 border-b border-line"><div><h3 class="text-lg font-semibold text-navy leading-snug">${t}</h3>${sub ? `<div class="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted">${sub}</div>` : ''}</div><button class="btn btn-ghost !px-2" onclick="closeModal()" aria-label="Cerrar">${ic('x')}</button></div>`;
const dl = (k, v) => `<div class="py-2.5 border-b border-line last:border-0"><dt class="text-xs text-muted">${k}</dt><dd class="text-sm font-medium text-ink mt-0.5">${v}</dd></div>`;

/* ---------- Ingreso, roles y navegación ---------- */
const AVC = ['#2F5D8C', '#1F2F46', '#5F6B7A'];
function initLogin() {
  $('#roleCards').innerHTML = Object.entries(ROLES).map(([k, r], n) => `
    <button onclick="enter('${k}')" class="group text-left card p-5 hover:border-brand hover:bg-sky/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand flex items-center gap-4">
      <div class="w-12 h-12 rounded-full grid place-items-center text-white text-sm font-semibold shrink-0" style="background:${AVC[n]}">${r.ini}</div>
      <div class="min-w-0 flex-1"><div class="font-semibold text-navy">${r.persona}</div><div class="text-sm text-ink mt-0.5">${r.name} · ${r.title}</div><div class="text-[13px] text-muted mt-1 leading-snug">${r.blurb}</div></div>
      <span class="text-muted group-hover:text-brand shrink-0">${ic('arrow')}</span>
    </button>`).join('');
}
function resetState() { S.view = 'dashboard'; S.inv = 'all'; S.pub = null; S.notif = false; S.cat = { q: '', type: 'Todos', exp: 'any', city: 'Todas' }; }
function enter(k) { S.role = k; resetState(); $('#login').classList.add('hidden'); $('#app').classList.remove('hidden'); render(true); window.scrollTo(0, 0); }
function switchRole(k) { S.role = k; resetState(); closeModal(); render(true); toast(`Ahora ves MediNexo como <b>${me().persona}</b>`, { icon: 'users' }); }
function logout() { closeModal(); $('#app').classList.add('hidden'); $('#login').classList.remove('hidden'); window.scrollTo(0, 0); }
function toggleNav(o) { const m = $('#mnav'); if (!m) return; if (o === undefined) m.classList.toggle('hidden'); else m.classList.toggle('hidden', !o); }
function go(v) { S.view = v; S.notif = false; toggleNav(false); closeModal(); render(true); window.scrollTo(0, 0); }
function closePops() { S.notif = false; $('#notifPanel')?.classList.add('hidden'); $('#menuPanel')?.classList.add('hidden'); }
function toggleNotif() { const o = !S.notif; closePops(); S.notif = o; $('#notifPanel').classList.toggle('hidden', !o); }
function toggleMenu() { const h = $('#menuPanel').classList.contains('hidden'); closePops(); $('#menuPanel').classList.toggle('hidden', !h); }
document.addEventListener('click', e => { if (!e.target.closest('#notifWrap') && !e.target.closest('#menuWrap')) closePops(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function notifs() {
  const out = [];
  if (S.role === 'plat') { if (PENDING_INST.length) out.push({ ic: 'shield', t: `${PENDING_INST.length} instituciones esperan verificación`, go: 'verification' }); return out; }
  riskItems().forEach(i => out.push({ ic: 'clock', t: `${esc(short(i))} vence en ${i.exp} días`, go: 'inventory' }));
  myReqs().forEach(r => {
    if (r.seller === myInst() && r.status === 0) out.push({ ic: 'swap', t: `Nueva solicitud ${r.id} de ${esc(inst(r.buyer).name)}`, go: 'negotiations', id: r.id });
    if (r.buyer === myInst() && r.status === 2) out.push({ ic: 'truck', t: `${r.id} en tránsito: confirma la recepción`, go: 'negotiations', id: r.id });
  });
  return out;
}
function notifClick(i) { const n = notifs()[i]; go(n.go); if (n.id) openNeg(n.id); }

function renderShell() {
  const r = me(), I = r.inst ? inst(r.inst) : null, n = notifs(), keys = Object.keys(ROLES);
  const badgeFor = k => k === 'negotiations' ? pendingActions() : k === 'verification' ? PENDING_INST.length : 0;
  const cnt = k => { const b = badgeFor(k); return b ? `<span class="min-w-[18px] h-[18px] px-1 rounded-full bg-clay text-navy text-[10px] font-bold grid place-items-center">${b}</span>` : ''; };
  const tabs = r.nav.map(k => `<button class="navtab ${S.view === k ? 'navtab-on' : ''}" onclick="go('${k}')">${ic(NAV[k].icon, 'w-[18px] h-[18px]')}<span>${r.labels[k] || NAV[k].label}</span>${cnt(k)}</button>`).join('');
  const mtabs = r.nav.map(k => `<button class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${S.view === k ? 'bg-white/10 text-white' : 'text-slate-300'}" onclick="go('${k}')">${ic(NAV[k].icon, 'w-[18px] h-[18px]')}<span class="flex-1 text-left">${r.labels[k] || NAV[k].label}</span>${cnt(k)}</button>`).join('');
  $('#top').innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
      <button class="lg:hidden p-2 -ml-2 rounded-md hover:bg-white/10" onclick="toggleNav()" aria-label="Menú">${ic('menu')}</button>
      <button class="flex items-center gap-2.5 shrink-0" onclick="go('dashboard')" aria-label="Inicio"><span class="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/20 grid place-items-center"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="text-lg font-bold tracking-tight">MediNexo</span></button>
      <nav class="hidden lg:flex items-center ml-6 flex-1 overflow-x-auto">${tabs}</nav>
      <div class="flex-1 lg:hidden"></div>
      <div id="notifWrap" class="relative">
        <button class="relative p-2 rounded-lg hover:bg-white/10" onclick="toggleNotif()" aria-label="Notificaciones">${ic('bell')}${n.length ? `<span class="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-clay text-navy text-[10px] font-bold grid place-items-center">${n.length}</span>` : ''}</button>
        <div id="notifPanel" class="hidden absolute right-0 mt-2 w-80 max-w-[85vw] card shadow-xl overflow-hidden text-ink">
          <div class="px-4 py-3 border-b border-line font-semibold text-navy text-sm">Notificaciones</div>
          <div class="max-h-80 overflow-y-auto">${n.length ? n.map((x, i) => `<button class="w-full text-left flex gap-3 px-4 py-3 hover:bg-app border-b border-line last:border-0" onclick="notifClick(${i})"><span class="mt-0.5 w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-sky text-brand">${ic(x.ic, 'w-4 h-4')}</span><span class="text-[13px] leading-snug">${x.t}</span></button>`).join('') : '<div class="p-6 text-center text-sm text-muted">Sin notificaciones.</div>'}</div>
        </div>
      </div>
      <div id="menuWrap" class="relative">
        <button class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/10" onclick="toggleMenu()" aria-label="Cuenta">
          <span class="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold text-navy" style="background:#D08A57">${r.ini}</span>
          <span class="hidden md:block text-left leading-tight"><span class="block text-[13px] font-medium">${esc(r.name)}</span><span class="block text-[11px] text-slate-400">${esc(r.persona)}</span></span>${ic('chevron', 'w-4 h-4 text-slate-400')}
        </button>
        <div id="menuPanel" class="hidden absolute right-0 mt-2 w-72 card shadow-xl overflow-hidden text-ink">
          <div class="px-4 py-3 border-b border-line"><div class="text-sm font-semibold text-navy">${esc(r.name)}</div><div class="text-xs text-muted">${I ? esc(I.name) + ' · ' + I.city : 'Operación de la plataforma'}</div></div>
          <div class="py-1.5"><div class="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Cambiar de perfil</div>
            ${keys.map(k => `<button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-app text-left" onclick="switchRole('${k}')"><span class="w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold text-white" style="background:${AVC[keys.indexOf(k)]}">${ROLES[k].ini}</span><span class="flex-1 text-sm">${ROLES[k].persona}</span>${k === S.role ? `<span class="text-ok">${ic('check', 'w-4 h-4')}</span>` : ''}</button>`).join('')}</div>
          <button class="w-full flex items-center gap-3 px-4 py-3 border-t border-line text-sm text-muted hover:bg-app" onclick="logout()">${ic('logout', 'w-4 h-4')}Salir de la demo</button>
        </div>
      </div>
    </div>
    <nav id="mnav" class="hidden lg:hidden border-t border-white/10 px-3 py-2 grid">${mtabs}</nav>`;
}

/* =========================================================
   VISTAS
   ========================================================= */
const alertRows = (items, n = 4) => items.length ? `<ul class="divide-y divide-line">${items.slice(0, n).map(i => `<li class="px-5 py-3 flex items-center gap-3">${thumb(i)}<div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${esc(short(i))}</div><div class="text-xs text-muted">Lote ${lotOf(i)} · ${i.qty} ${i.unit}</div></div>${expBadge(i)}${i.pub ? badge('En red', 'brand') : `<button class="btn btn-primary btn-sm" onclick="publishItem(${i.id})">Publicar en red</button>`}</li>`).join('')}</ul>` : empty('Sin alertas de vencimiento', 'Tu inventario está al día.');
const expiring = () => ownItems().filter(i => i.exp != null && i.exp <= 60).sort((a, b) => a.exp - b.exp);

/* Tabla de negociaciones / transacciones */
function reqTable(list) {
  if (!list.length) return empty('Sin negociaciones', 'Solicita un insumo desde el catálogo para comenzar.');
  const plat = S.role === 'plat';
  return `<div class="overflow-x-auto"><table class="w-full min-w-[640px]"><thead><tr><th class="th">N.º</th><th class="th">Producto</th><th class="th">${plat ? 'Vendedor → comprador' : 'Contraparte'}</th><th class="th text-right">Monto</th><th class="th">Estado</th></tr></thead><tbody>${list.map(r => {
    const it = item(r.item), mine = r.buyer === myInst();
    return `<tr class="cursor-pointer hover:bg-app" onclick="openNeg('${r.id}')"><td class="td font-medium text-brand">${r.id}</td><td class="td"><div class="font-medium max-w-[260px] truncate">${esc(short(it))}</div><div class="text-xs text-muted">${r.qty} ${it.unit}</div></td><td class="td">${plat ? `${esc(inst(r.seller).name)} → ${esc(inst(r.buyer).name)}` : `<div>${esc(inst(mine ? r.seller : r.buyer).name)}</div><div class="text-xs text-muted">${mine ? 'Compra' : 'Venta'}${r.mode === 'Intercambio' ? ' · Intercambio' : ''}</div>`}</td><td class="td text-right font-medium">${fmt$(r.qty * it.price)}</td><td class="td">${progress(r.status)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
const recentReqs = () => myReqs().slice().sort((a, b) => a.ago - b.ago).slice(0, 4);

/* ---------- Panel ---------- */
function vDashboard() { return ({ admin: dashAdmin, gestor: dashGestor, plat: dashPlat })[S.role](); }
const first = () => me().name.split(' ')[0];
const instName = () => (me().inst ? esc(inst(me().inst).name) : 'MediNexo · Plataforma');

function dashAdmin() {
  const mine = ownItems(), risk = riskItems();
  return hero({
    eyebrow: instName(), title: `Buen día, ${first()}`,
    sub: risk.length ? `Tienes ${fmt$0(sum(risk))} en lotes que caducan en menos de 30 días. Publícalos en la red antes de perderlos.` : 'Tu inventario está al día. Revisa el ahorro generado este mes.',
    cta: risk.length ? `<button class="btn btn-accent" onclick="publishRisk()">${ic('tag', 'w-4 h-4')}Publicar ${risk.length} lotes en la red</button>` : `<button class="btn btn-accent" onclick="go('reports')">Ver reporte de ahorro</button>`,
    stats: [['Capital en riesgo (≤ 30 d)', fmt$0(sum(risk)), `${risk.length} lotes sin publicar`, 'text-clay'], ['Ahorro del mes', fmt$0(savedBase()), 'capital recuperado'], ['Inventario valorizado', fmt$0(sum(mine)), `${mine.length} lotes`]]
  }) + `<div class="grid lg:grid-cols-2 gap-5">
      ${panel('Alertas de vencimiento', alertRows(expiring()), linkBtn('Ver inventario', 'inventory'))}
      ${panel('Ahorro por mes', barChart([2100, 3200, 4100, 3800, 5600, savedBase()], monthLabels(6)), linkBtn('Ver reporte', 'reports'))}
    </div>`;
}
function dashGestor() {
  const mine = ownItems(), risk = riskItems(), act = pendingActions();
  return hero({
    eyebrow: instName(), title: `Buen día, ${first()}`,
    sub: act ? `Tienes ${act} ${act === 1 ? 'pedido que requiere' : 'pedidos que requieren'} tu atención y ${risk.length} lotes por publicar antes de que caduquen.` : `${risk.length} lotes por publicar antes de que caduquen. Busca lo que necesitas en el catálogo.`,
    cta: `<button class="btn btn-accent" onclick="go('catalog')">${ic('search', 'w-4 h-4')}Buscar en el catálogo</button>`,
    stats: [['Lotes por vencer (≤ 30 d)', mine.filter(atRisk).length, `${risk.length} sin publicar`, 'text-clay'], ['Solicitudes en curso', myReqs().filter(r => r.status < 3).length, 'compras y ventas'], ['Publicaciones activas', mine.filter(i => i.pub).length, 'visibles en la red']]
  }) + `<div class="grid lg:grid-cols-2 gap-5">
      ${panel('Alertas de vencimiento', alertRows(expiring()), linkBtn('Ver inventario', 'inventory'))}
      ${panel('Solicitudes recientes', `<ul class="divide-y divide-line">${recentReqs().map(r => { const it = item(r.item); return `<li><button class="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-app" onclick="openNeg('${r.id}')">${thumb(it)}<div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${esc(short(it))}</div><div class="text-xs text-muted">${r.id} · ${r.buyer === myInst() ? 'Compra' : 'Venta'}</div></div>${stBadge(r.status)}</button></li>`; }).join('')}</ul>`, linkBtn('Ver todas', 'negotiations'))}
    </div>`;
}
function dashPlat() {
  return hero({
    eyebrow: instName(), title: `Buen día, ${first()}`,
    sub: `${PENDING_INST.length} instituciones esperan verificación. Solo las que cumplen con la documentación pueden operar en la red.`,
    cta: `<button class="btn btn-accent" onclick="go('verification')">${ic('shield', 'w-4 h-4')}Revisar verificaciones</button>`,
    stats: [['Instituciones verificadas', PLAT.verified, 'habilitadas para operar'], ['Pendientes', PENDING_INST.length, 'revisión documental', 'text-clay'], ['Comisión del mes', fmt$0(PLAT.volume * FEE), `2,5 % de ${fmt$0(PLAT.volume)}`]]
  }) + `<div class="grid lg:grid-cols-2 gap-5">
      ${panel('Cola de verificación', PENDING_INST.length ? `<ul class="divide-y divide-line">${PENDING_INST.slice(0, 4).map(v => `<li class="px-5 py-3 flex items-center gap-3"><div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${v.name}</div><div class="text-xs text-muted">${v.city} · ${v.type}</div></div>${Object.values(v.docs).every(Boolean) ? badge('Completo', 'ok') : badge('Incompleto', 'warn')}<button class="btn btn-primary btn-sm" onclick="openVerif('${v.id}')">Revisar</button></li>`).join('')}</ul>` : empty('Cola vacía', 'No hay instituciones pendientes.'), linkBtn('Ver todo', 'verification'))}
      ${panel('Transacciones recientes', `<ul class="divide-y divide-line">${recentReqs().map(r => { const it = item(r.item); return `<li><button class="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-app" onclick="openNeg('${r.id}')"><div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${esc(short(it))}</div><div class="text-xs text-muted truncate">${esc(inst(r.seller).name)} → ${esc(inst(r.buyer).name)}</div></div>${stBadge(r.status)}</button></li>`; }).join('')}</ul>`, linkBtn('Ver todas', 'negotiations'))}
    </div>`;
}

/* ---------- Reportes de ahorro (administrador) ---------- */
function vReports() {
  const mine = ownItems(), fees = REQS.filter(r => r.status === 3 && (r.buyer === myInst() || r.seller === myInst())).reduce((s, r) => s + r.qty * item(r.item).price * FEE, 0) + 380;
  return pageHead('Reportes de ahorro', 'Capital recuperado y pérdidas evitadas gracias a la venta de excedentes antes de su caducidad.', `<button class="btn btn-outline" onclick="toast('Reporte exportado (simulado)')">${ic('download', 'w-4 h-4')}Exportar</button>`) +
    `<div class="grid sm:grid-cols-3 gap-4">
      ${kpi('Ahorro del mes', fmt$0(savedBase()), 'capital recuperado', 'chart', 'ok')}
      ${kpi('Pérdida evitada acumulada', fmt$0(savedBase() + 18800), 'últimos 6 meses', 'shield', 'brand')}
      ${kpi('Comisión pagada', fmt$(fees), '2,5 % por transacción', 'tag', 'navy')}
    </div>
    <div class="grid lg:grid-cols-2 gap-5 mt-5">
      ${panel('Ahorro generado por mes', barChart([2100, 3200, 4100, 3800, 5600, savedBase()], monthLabels(6), 190))}
      ${panel('Publicado en la red por tipo', `<table class="w-full"><thead><tr><th class="th">Tipo de insumo</th><th class="th text-right">Lotes en red</th><th class="th text-right">Valor</th></tr></thead><tbody>${Object.keys(TYPES).map(t => { const l = mine.filter(i => i.type === t && i.pub); return `<tr><td class="td">${typeChip(t)}</td><td class="td text-right">${l.length}</td><td class="td text-right font-medium">${fmt$0(sum(l))}</td></tr>`; }).join('')}</tbody></table>`)}
    </div>`;
}

/* ---------- Inventario ---------- */
function vInventory() {
  const all = ownItems().slice().sort((a, b) => (a.exp ?? 9999) - (b.exp ?? 9999)), f = S.inv;
  const a = f === 'risk' ? all.filter(atRisk) : f === 'net' ? all.filter(i => i.pub) : all;
  const chip = (k, t, n) => `<button class="chip ${f === k ? 'chip-on' : ''}" onclick="S.inv='${k}';render()">${t} <span class="opacity-70">${n}</span></button>`;
  return pageHead('Inventario', 'Lotes de tu institución. Publica en la red los que estén próximos a vencer.',
    (riskItems().length ? `<button class="btn btn-outline" onclick="publishRisk()">Publicar todos los próximos a vencer</button>` : '') + `<button class="btn btn-primary" onclick="openPublish()">${ic('plus', 'w-4 h-4')}Publicar insumo</button>`) +
    `<div class="flex flex-wrap gap-2 mb-4">${chip('all', 'Todos', all.length)}${chip('risk', 'Por vencer (≤ 30 d)', all.filter(atRisk).length)}${chip('net', 'En red', all.filter(i => i.pub).length)}</div>
    <div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[720px]"><thead><tr><th class="th">Producto</th><th class="th">Cantidad</th><th class="th">Caducidad</th><th class="th">Estado</th><th class="th"></th></tr></thead><tbody>
    ${a.map(i => `<tr class="hover:bg-app"><td class="td"><div class="flex items-center gap-3">${thumb(i)}<div class="min-w-0"><div class="font-medium max-w-[320px] truncate">${esc(short(i))}</div><div class="text-xs text-muted">${i.lot !== '—' ? 'Lote ' + i.lot : 'N.º de parte ' + i.pn}</div></div></div></td>
      <td class="td">${i.qty} ${i.unit}</td><td class="td">${i.exp == null ? '<span class="text-muted">No aplica</span>' : `<div>${fmtDate(addDays(i.exp))}</div><div class="mt-1">${expBadge(i)}</div>`}</td>
      <td class="td">${i.pub ? badge('En red', 'brand') : badge('Solo interno')}${i.disc ? `<div class="text-[11px] text-amber-700 mt-1">−${Math.round(i.disc * 100)} % liquidación</div>` : ''}</td>
      <td class="td text-right">${i.pub ? `<button class="btn btn-outline btn-sm" onclick="unpublish(${i.id})">Retirar</button>` : `<button class="btn btn-primary btn-sm" onclick="publishItem(${i.id})">Publicar en red</button>`}</td></tr>`).join('') || `<tr><td class="td" colspan="5">${empty('Sin resultados', 'Prueba con otro filtro.')}</td></tr>`}
    </tbody></table></div></div>`;
}
function publishItem(id, quiet) {
  const it = item(id), d = sugg(it);
  if (d && !it.disc) { it.price = +(it.price * (1 - d)).toFixed(2); it.disc = d; }
  it.pub = true;
  if (!quiet) { toast(`<b>${esc(short(it))}</b> publicado en la red${d ? ` con ${d * 100} % de descuento sugerido` : ''}`, { icon: 'tag' }); render(); }
}
function publishRisk() { const l = riskItems(); l.forEach(i => publishItem(i.id, true)); toast(`<b>${l.length} lotes</b> publicados en la red`, { icon: 'tag' }); render(); }
function unpublish(id) { item(id).pub = false; toast('Publicación retirada de la red', { icon: 'x' }); render(); }

/* ---------- Publicar insumo (modal) ---------- */
const pubDefault = () => ({ type: 'Reactivo', name: 'Calibrador HbA1c nivel 1', lot: 'CB-2291', reg: 'ARCSA-RS-4410-IVD', qty: 5, price: 74, expDate: iso(addDays(21)), cold: true, mode: 'Venta / Intercambio' });
function openPublish() {
  if (!S.pub) S.pub = pubDefault(); const p = S.pub, rep = p.type === 'Repuesto';
  const f = (l, k, o = {}) => `<div class="${o.span || ''}"><label class="lbl">${l}</label><input class="input" type="${o.type || 'text'}" ${o.step ? `step="${o.step}"` : ''} value="${esc(p[k])}" ${o.ph ? `placeholder="${o.ph}"` : ''} oninput="S.pub.${k}=${o.num ? '+this.value' : 'this.value'}"></div>`;
  openModal(`${modalHead('Publicar insumo', 'Se publicará para instituciones verificadas')}
    <div class="px-6 py-5 grid sm:grid-cols-2 gap-4">
      <div><label class="lbl">Tipo de insumo</label><select class="input" onchange="setPubType(this.value)">${Object.keys(TYPES).map(t => `<option ${p.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div><label class="lbl">Modalidad</label><select class="input" onchange="S.pub.mode=this.value">${['Venta', 'Venta / Intercambio'].map(t => `<option ${p.mode === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      ${f('Nombre del producto', 'name', { span: 'sm:col-span-2' })}
      ${f(rep ? 'N.º de parte' : 'Lote', 'lot')}
      ${rep ? '' : f('Registro sanitario ARCSA', 'reg', { ph: 'ARCSA-RS-0000-IVD' })}
      ${f('Cantidad', 'qty', { type: 'number', num: true })}${f('Precio unitario (USD)', 'price', { type: 'number', step: '0.01', num: true })}
      ${rep ? '' : f('Fecha de caducidad', 'expDate', { type: 'date' })}
      ${rep ? '' : `<label class="flex items-center gap-2 text-sm cursor-pointer sm:self-end sm:pb-2"><input type="checkbox" class="accent-brand w-4 h-4" ${p.cold ? 'checked' : ''} onchange="S.pub.cold=this.checked">Requiere cadena de frío (2–8 °C)</label>`}
      <div id="perr" class="sm:col-span-2 text-sm text-bad hidden"></div>
    </div>
    <div class="px-6 py-4 border-t border-line flex justify-end gap-2"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="submitPub()">Publicar</button></div>`);
}
function setPubType(t) { S.pub.type = t; if (t === 'Repuesto') { S.pub.cold = false; } openPublish(); }
function submitPub() {
  const p = S.pub, rep = p.type === 'Repuesto', er = [], d = p.expDate ? Math.round((new Date(p.expDate + 'T00:00:00') - TODAY) / DAY) : null;
  if (!p.name.trim()) er.push('Indica el nombre del producto.');
  if (!p.lot.trim()) er.push(rep ? 'Indica el número de parte.' : 'Indica el lote.');
  if (!rep && !/^ARCSA-[A-Z]{2}-\d{3,5}(-[A-Z]{2,4})?$/i.test(p.reg.trim())) er.push('El registro sanitario ARCSA no tiene un formato válido.');
  if (!rep && (d == null || d < 15)) er.push('La caducidad debe ser mayor a 15 días.');
  if (!(p.qty > 0) || !(p.price > 0)) er.push('Cantidad y precio deben ser mayores a cero.');
  if (er.length) { const e = $('#perr'); e.innerHTML = er.map(x => '• ' + x).join('<br>'); e.classList.remove('hidden'); return; }
  ITEMS.push({ id: Math.max(...ITEMS.map(i => i.id)) + 1, name: p.name, type: p.type, brand: inst(myInst()).name, lot: rep ? '—' : p.lot, pn: rep ? p.lot : undefined, reg: p.reg, qty: p.qty, unit: 'unidades', price: p.price, exp: rep ? null : d, inst: myInst(), cold: p.cold ? '2–8 °C' : null, mode: p.mode, pub: true });
  const nm = p.name; S.pub = null; S.inv = 'all'; closeModal(); render(); toast(`<b>${esc(nm)}</b> publicado en la red`, { icon: 'tag' });
}

/* ---------- Catálogo B2B ---------- */
function catItems() {
  const f = S.cat, t = norm(f.q).split(/\s+/).filter(Boolean);
  let a = ITEMS.filter(i => i.pub && i.inst !== myInst() && t.every(w => norm([i.name, i.brand, i.lot, i.pn, i.reg].join(' ')).includes(w)));
  if (f.type !== 'Todos') a = a.filter(i => i.type === f.type);
  if (f.city !== 'Todas') a = a.filter(i => inst(i.inst).city === f.city);
  const e = f.exp;
  if (e === '30') a = a.filter(i => i.exp != null && i.exp <= 30); else if (e === '90') a = a.filter(i => i.exp != null && i.exp <= 90); else if (e === '180') a = a.filter(i => i.exp != null && i.exp <= 180); else if (e === 'none') a = a.filter(i => i.exp == null);
  return a.sort((x, y) => (x.exp ?? 99999) - (y.exp ?? 99999));
}
function catResults() {
  const a = catItems();
  return `<div class="text-sm text-muted mb-4">${a.length} resultado${a.length === 1 ? '' : 's'}</div>` + (a.length ? `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${a.map(i => `<article class="group card p-5 flex flex-col cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg hover:border-brand/40" onclick="openItem(${i.id})"><div class="flex items-start justify-between gap-2">${thumb(i, 'w-12 h-12')}${expBadge(i)}</div><h3 class="mt-4 font-semibold text-navy leading-snug">${esc(short(i))}</h3><div class="text-xs text-muted mt-1.5">${esc(inst(i.inst).name)} · ${inst(i.inst).city}</div><div class="mt-auto pt-5 flex items-end justify-between"><div><div class="text-2xl font-bold text-navy leading-none">${fmt$(i.price)}</div><div class="text-[11px] text-muted mt-1.5">${i.qty} ${i.unit} disponibles</div></div><span class="w-9 h-9 rounded-full bg-sky text-brand grid place-items-center group-hover:bg-brand group-hover:text-white transition">${ic('arrow', 'w-4 h-4')}</span></div></article>`).join('')}</div>` : `<div class="card py-10">${empty('Sin resultados', 'Prueba quitando algún filtro.')}</div>`);
}
const TYPE_CHIPS = [['Todos', 'Todos', 'grid'], ['Reactivo', 'Reactivos', 'flask'], ['Medicamento', 'Medicamentos', 'pill'], ['Repuesto', 'Repuestos', 'wrench'], ['Insumo', 'Insumos', 'box']];
const catChips = () => TYPE_CHIPS.map(([v, t, i]) => `<button class="chip ${S.cat.type === v ? 'chip-on' : ''}" onclick="setCat('type','${v}')">${ic(i, 'w-4 h-4')}${t}</button>`).join('');
function setCat(k, v) { S.cat[k] = v; $('#catChips').innerHTML = catChips(); $('#catRes').innerHTML = catResults(); }
function vCatalog() {
  const f = S.cat, cities = ['Todas', ...new Set(ITEMS.filter(i => i.pub).map(i => inst(i.inst).city))].sort((a, b) => a === 'Todas' ? -1 : a.localeCompare(b));
  const sel = (k, opts) => `<select class="input !w-auto !py-2" onchange="setCat('${k}',this.value)" aria-label="${k}">${opts.map(([v, t]) => `<option value="${v}" ${f[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  return `<section class="hero rounded-2xl text-white p-6 sm:p-8 lg:p-10 mb-8"><div class="text-xs font-semibold tracking-widest uppercase text-clay">Catálogo B2B</div><h1 class="mt-2 text-3xl sm:text-4xl font-bold leading-tight max-w-2xl">Encuentra el insumo que necesitas, en instituciones verificadas.</h1>
    <div class="mt-6 relative max-w-2xl"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">${ic('search')}</span><input id="cq" class="w-full rounded-xl bg-white text-ink pl-12 pr-4 py-3.5 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20" placeholder="Busca por nombre, marca o lote" value="${esc(f.q)}" oninput="setCat('q',this.value)" aria-label="Buscar"></div></section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6"><div id="catChips" class="flex flex-wrap gap-2">${catChips()}</div>
      <div class="flex flex-wrap gap-2">${sel('exp', [['any', 'Cualquier caducidad'], ['30', '≤ 30 días'], ['90', '≤ 90 días'], ['180', '≤ 180 días'], ['none', 'Sin caducidad']])}${sel('city', cities.map(c => [c, c === 'Todas' ? 'Todas las ciudades' : c]))}</div></div>
    <div id="catRes">${catResults()}</div>`;
}

/* ---------- Detalle de lote (modal) ---------- */
function openItem(id) {
  const i = item(id), I = inst(i.inst), rep = i.type === 'Repuesto';
  openModal(`${modalHead(esc(short(i)), `${typeChip(i.type)} ${expBadge(i)}`)}
    <div class="px-6 py-2"><dl class="grid sm:grid-cols-2 sm:gap-x-8">
      ${dl(rep ? 'N.º de parte' : 'Lote', lotOf(i))}
      ${dl(rep ? 'Fabricante' : 'Registro sanitario ARCSA', rep ? esc(i.brand) : `${i.reg} ${badge('Vigente', 'ok', 'check')}`)}
      ${dl('Caducidad', i.exp == null ? 'No aplica' : fmtDate(addDays(i.exp)))}
      ${dl('Disponible', `${i.qty} ${i.unit}`)}
      ${dl('Cadena de frío', i.cold ? `${i.cold} ${badge('Sin excursiones', 'ok', 'snow')}` : 'No requiere')}
      ${dl('Institución', `${esc(I.name)} ${verified()}<div class="text-xs text-muted font-normal mt-0.5">${I.city}</div>`)}
    </dl></div>
    <div class="px-6 py-4 border-t border-line bg-app/60">
      ${S.role === 'plat' ? '' : `<div class="flex flex-wrap items-end gap-4"><div class="w-28"><label class="lbl" for="qty">Cantidad</label><input id="qty" type="number" min="1" max="${i.qty}" value="1" class="input" oninput="updQty(${i.id})"></div><div class="flex-1 min-w-[180px] text-sm"><div class="text-xs text-muted">Total (incluye comisión de 2,5 %)</div><div id="qt" class="text-xl font-bold text-navy"></div></div></div>`}
      <div class="mt-4 flex flex-wrap items-center justify-between gap-2"><button class="btn btn-ghost" onclick="openTrace(${i.id})">${ic('activity', 'w-4 h-4')}Ver trazabilidad</button>
        ${S.role === 'plat' ? '' : `<div class="flex gap-2">${i.mode.includes('Intercambio') ? `<button class="btn btn-outline" onclick="createReq(${i.id},'Intercambio')">Proponer intercambio</button>` : ''}<button class="btn btn-primary" onclick="createReq(${i.id},'Compra')">Solicitar compra</button></div>`}</div></div>`);
  if (S.role !== 'plat') updQty(i.id);
}
function updQty(id) { const i = item(id), q = Math.max(1, Math.min(i.qty, +$('#qty').value || 1)); $('#qt').textContent = fmt$(q * i.price * (1 + FEE)); }
function createReq(id, mode) {
  const it = item(id), q = Math.max(1, Math.min(it.qty, +$('#qty').value || 1)), n = 'R-' + (1050 + REQS.filter(r => +r.id.slice(2) >= 1050).length);
  REQS.unshift({ id: n, item: id, qty: q, buyer: myInst(), seller: it.inst, status: 0, ago: 0, mode });
  closeModal(); render(); toast(`${mode === 'Compra' ? 'Solicitud' : 'Propuesta'} <b>${n}</b> enviada a ${esc(inst(it.inst).name)}`, { label: 'Ver', fn: () => { go('negotiations'); openNeg(n); } });
}

/* ---------- Negociaciones ---------- */
function vNegotiations() {
  const list = myReqs().slice().sort((a, b) => a.ago - b.ago || b.id.localeCompare(a.id));
  return pageHead(me().labels.negotiations || 'Negociaciones', 'Selecciona una fila para ver el detalle, los documentos y las acciones.') + `<div class="card overflow-hidden">${reqTable(list)}</div>`;
}
function openNeg(id) {
  const r = REQS.find(x => x.id === id), it = item(r.item), sub = r.qty * it.price, fee = sub * FEE, isB = r.buyer === myInst(), isS = r.seller === myInst(), plat = S.role === 'plat';
  const step = (n, t) => `<div class="flex-1 min-w-0"><div class="flex items-center"><div class="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold ${r.status >= n ? 'bg-brand text-white' : 'bg-slate-100 text-muted'}">${r.status >= n ? ic('check', 'w-4 h-4') : n + 1}</div>${n < 3 ? `<div class="flex-1 h-0.5 mx-1 ${r.status > n ? 'bg-brand' : 'bg-slate-200'}"></div>` : ''}</div><div class="text-[11px] mt-1.5 leading-tight pr-1 ${r.status >= n ? 'text-navy font-medium' : 'text-muted'}">${t}</div></div>`;
  let act = '';
  if (!plat) {
    const sim = lbl => `<button class="btn btn-outline" onclick="negAdvance('${r.id}',true)">Simular: ${lbl}</button>`;
    if (r.status === 0) act = isS ? `<button class="btn btn-primary" onclick="negAdvance('${r.id}')">Aceptar solicitud</button>` : sim('respuesta del vendedor');
    if (r.status === 1) act = isS ? `<button class="btn btn-primary" onclick="negAdvance('${r.id}')">Marcar como despachado</button>` : sim('despacho del vendedor');
    if (r.status === 2) act = isB ? `<button class="btn btn-primary" onclick="openReceive('${r.id}')">Confirmar recepción</button>` : sim('recepción del comprador');
  }
  const docs = [['Factura electrónica', 1], ['Guía de remisión', 2], ['Acta de recepción', 3]].map(([n, s]) => `<button class="chip ${r.status >= s ? '' : 'opacity-40 pointer-events-none'}" onclick="toast('Descarga simulada: ${n}')">${ic('file', 'w-3.5 h-3.5')}${n}</button>`).join('');
  openModal(`${modalHead(esc(short(it)), `${r.id} · ${r.mode} · ${r.qty} ${it.unit}`)}
    <div class="px-6 pt-5"><div class="flex">${stepNames.map((t, n) => step(n, t)).join('')}</div></div>
    <div class="px-6 py-3"><dl class="grid sm:grid-cols-2 sm:gap-x-8">
      ${dl('Comprador', esc(inst(r.buyer).name))}${dl('Vendedor', `${esc(inst(r.seller).name)} ${verified()}`)}
      ${dl('Subtotal', fmt$(sub))}${dl('Comisión (2,5 %)', fmt$(fee))}
    </dl><div class="flex justify-between items-center py-3 border-t border-line"><span class="text-sm font-medium">Total</span><span class="text-lg font-bold text-navy">${fmt$(sub + fee)}</span></div>
    <div class="text-xs text-muted mb-2">Documentos de respaldo</div><div class="flex flex-wrap gap-2">${docs}</div></div>
    <div class="px-6 py-4 border-t border-line flex flex-wrap items-center justify-between gap-2"><div class="flex gap-1"><button class="btn btn-ghost" onclick="openTrace(${it.id})">${ic('activity', 'w-4 h-4')}Trazabilidad</button>${isB && r.status >= 2 ? `<button class="btn btn-ghost" onclick="openIncident('${r.id}')">Reportar problema</button>` : ''}</div><div class="flex gap-2">${act}</div></div>`);
}
function negAdvance(id, sim) {
  const r = REQS.find(x => x.id === id); r.status++;
  const msg = ['', 'Solicitud aceptada. Factura electrónica emitida.', 'Pedido en tránsito. Guía de remisión generada.', 'Recepción verificada. Acta generada y transacción cerrada.'][r.status];
  render(); openNeg(id); toast(sim ? `Simulación: ${msg}` : msg, { icon: r.status === 2 ? 'truck' : 'check' });
}
function openReceive(id) {
  const r = REQS.find(x => x.id === id), it = item(r.item);
  const checks = [`Lote y caducidad coinciden con la ficha (${lotOf(it)})`, it.cold ? `Cadena de frío íntegra (${it.cold})` : 'Embalaje sin daños', `Cantidad conforme (${r.qty} ${it.unit})`];
  openModal(`${modalHead('Confirmar recepción', `${r.id} · ${esc(short(it))}`)}<div class="px-6 py-5"><p class="text-sm text-muted mb-4">Verifica el pedido antes de cerrar la operación. Se generará el acta de recepción.</p><ul class="space-y-2.5">${checks.map(t => `<li><label class="flex gap-3 items-start cursor-pointer rounded-lg border border-line p-3 hover:bg-app"><input type="checkbox" class="rc accent-brand w-4 h-4 mt-0.5" onchange="chkRecv()"><span class="text-sm">${t}</span></label></li>`).join('')}</ul></div>
    <div class="px-6 py-4 border-t border-line flex justify-end gap-2"><button class="btn btn-outline" onclick="openNeg('${r.id}')">Volver</button><button id="rcb" class="btn btn-primary" disabled onclick="negAdvance('${r.id}')">Confirmar y cerrar</button></div>`);
}
const chkRecv = () => { $('#rcb').disabled = ![...document.querySelectorAll('.rc')].every(x => x.checked); };
function openIncident(id) {
  openModal(`${modalHead('Reportar un problema', `Transacción ${id}`)}<div class="px-6 py-5 space-y-4"><div><label class="lbl">Motivo</label><select class="input">${['El producto no coincide con la ficha', 'Cadena de frío comprometida', 'Pieza defectuosa o incompatible', 'Cantidad incorrecta'].map(t => `<option>${t}</option>`).join('')}</select></div><div><label class="lbl">Detalle</label><textarea class="input" rows="3" placeholder="Describe lo ocurrido…"></textarea></div><p class="text-xs text-muted">MediNexo mediará entre las instituciones para resolver el caso.</p></div>
    <div class="px-6 py-4 border-t border-line flex justify-end gap-2"><button class="btn btn-outline" onclick="openNeg('${id}')">Volver</button><button class="btn btn-danger" onclick="closeModal();toast('Reporte enviado. MediNexo contactará al vendedor.',{icon:'alert'})">Enviar reporte</button></div>`);
}

/* ---------- Trazabilidad ---------- */
function traceEvents(it) {
  const I = inst(it.inst), t = it.cold ? ' · 4,1 °C' : '';
  const ev = [
    { d: -150, a: `Fabricante · ${it.brand}`, x: `Liberación del lote ${lotOf(it)}${t}`, ic: 'flask' },
    { d: -112, a: 'Importadora autorizada', x: 'Registro sanitario verificado' + (it.cold ? ' · cadena de frío sellada' : ''), ic: 'truck' },
    { d: -96, a: I.name, x: 'Recepción en bodega' + t, ic: 'building' },
    { d: -1, a: 'MediNexo', x: 'Publicación validada: institución verificada', ic: 'shield' }
  ];
  REQS.filter(r => r.item === it.id).forEach(r => ev.push({ d: -r.ago, a: inst(r.buyer).name, x: `${r.id}: ${stepNames[r.status]}`, ic: 'swap' }));
  return ev.sort((a, b) => a.d - b.d);
}
function openTrace(id) {
  const it = item(id);
  openModal(`${modalHead('Trazabilidad del lote', `${esc(short(it))} · ${lotOf(it)}`)}
    <div class="px-6 py-5"><div class="flex flex-wrap gap-2 mb-5">${it.reg ? badge('Registro sanitario ' + it.reg, 'ok', 'check') : ''}${it.cold ? badge('Cadena de frío íntegra · ' + it.cold, 'ok', 'snow') : ''}</div>
    <ol class="relative border-l-2 border-line ml-3 space-y-5">${traceEvents(it).map(e => `<li class="ml-6 relative"><span class="absolute -left-[2.1rem] top-0 w-7 h-7 rounded-full grid place-items-center bg-sky text-brand ring-4 ring-white">${ic(e.ic, 'w-3.5 h-3.5')}</span><div class="text-[11px] text-muted">${fmtDate(addDays(e.d))}</div><div class="text-sm font-medium text-navy">${esc(e.a)}</div><div class="text-[13px] text-muted">${esc(e.x)}</div></li>`).join('')}</ol></div>
    <div class="px-6 py-4 border-t border-line flex justify-end"><button class="btn btn-outline" onclick="closeModal()">Cerrar</button></div>`);
}
function vTrace() {
  const ids = new Set([...ownItems().map(i => i.id), ...myReqs().map(r => r.item)]), list = [...ids].map(item);
  return pageHead('Trazabilidad', 'Lotes de tu institución y de tus transacciones. Selecciona uno para ver su historial.') +
    `<div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[680px]"><thead><tr><th class="th">Producto</th><th class="th">Lote / N.º de parte</th><th class="th">Institución</th><th class="th">Cadena de frío</th><th class="th"></th></tr></thead><tbody>${list.map(i => `<tr class="hover:bg-app"><td class="td"><div class="font-medium max-w-[280px] truncate">${esc(short(i))}</div></td><td class="td text-muted">${lotOf(i)}</td><td class="td">${esc(inst(i.inst).name)}</td><td class="td">${i.cold ? badge(i.cold, 'info', 'snow') : '<span class="text-muted">No requiere</span>'}</td><td class="td text-right"><button class="btn btn-outline btn-sm" onclick="openTrace(${i.id})">Ver historial</button></td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- Verificación de instituciones (plataforma) ---------- */
function vVerification() {
  return pageHead('Verificación de instituciones', 'Solo las instituciones con documentación válida pueden operar en la red.') +
    `<div class="card overflow-hidden">${PENDING_INST.length ? `<div class="overflow-x-auto"><table class="w-full min-w-[640px]"><thead><tr><th class="th">Institución</th><th class="th">Ciudad</th><th class="th">Tipo</th><th class="th">Documentos</th><th class="th"></th></tr></thead><tbody>${PENDING_INST.map(v => { const n = Object.values(v.docs).filter(Boolean).length; return `<tr class="hover:bg-app"><td class="td font-medium">${v.name}</td><td class="td">${v.city}</td><td class="td text-muted">${v.type}</td><td class="td">${n === 3 ? badge('3 de 3', 'ok') : badge(n + ' de 3', 'warn')}</td><td class="td text-right"><button class="btn btn-primary btn-sm" onclick="openVerif('${v.id}')">Revisar</button></td></tr>`; }).join('')}</tbody></table></div>` : empty('Cola vacía', 'No hay instituciones pendientes de verificación.')}</div>`;
}
function openVerif(id) {
  const v = PENDING_INST.find(x => x.id === id), full = Object.values(v.docs).every(Boolean);
  const doc = (ok, t, s) => `<li class="flex items-center gap-3 rounded-lg border border-line p-3"><span class="w-7 h-7 rounded-full grid place-items-center ${ok ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad'}">${ic(ok ? 'check' : 'x', 'w-4 h-4')}</span><div class="flex-1"><div class="text-sm font-medium text-navy">${t}</div><div class="text-xs text-muted">${ok ? s : 'Documento faltante o ilegible'}</div></div></li>`;
  openModal(`${modalHead(v.name, `${v.type} · ${v.city} · RUC ${v.ruc}`)}<div class="px-6 py-5"><ul class="space-y-2.5">${doc(v.docs.ruc, 'RUC y razón social', 'Coincide con el registro del SRI')}${doc(v.docs.permiso, 'Permiso de funcionamiento', 'Vigente')}${doc(v.docs.resp, 'Responsable técnico', v.resp)}</ul></div>
    <div class="px-6 py-4 border-t border-line flex flex-wrap justify-end gap-2"><button class="btn btn-outline" onclick="rejectInst('${v.id}')">Rechazar</button>${full ? '' : `<button class="btn btn-outline" onclick="requestDocs('${v.id}')">Solicitar documentos</button>`}<button class="btn btn-primary" ${full ? '' : 'disabled'} onclick="approveInst('${v.id}')">Aprobar y verificar</button></div>`);
}
function dropInst(id) { const i = PENDING_INST.findIndex(x => x.id === id), v = PENDING_INST[i]; PENDING_INST.splice(i, 1); closeModal(); render(); return v; }
function approveInst(id) { const v = dropInst(id); PLAT.verified++; toast(`<b>${esc(v.name)}</b> ya es una institución verificada`, { icon: 'shield' }); }
function rejectInst(id) { const v = dropInst(id); toast(`Solicitud de ${esc(v.name)} rechazada`, { icon: 'x' }); }
function requestDocs(id) { const v = PENDING_INST.find(x => x.id === id); closeModal(); toast(`Se notificó a ${esc(v.name)} para completar los documentos`, { icon: 'alert' }); }

/* ---------- Render principal ---------- */
const VIEWS = { dashboard: vDashboard, reports: vReports, inventory: vInventory, catalog: vCatalog, negotiations: vNegotiations, trace: vTrace, verification: vVerification };
function render(anim) {
  renderShell(); const m = $('#main'); m.innerHTML = VIEWS[S.view]();
  if (anim) { m.classList.remove('fade-in'); void m.offsetWidth; m.classList.add('fade-in'); }
}
initLogin();
