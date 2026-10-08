/* ==========================================================
   LA LONJA — interacciones
   Reloj de subasta (intro y menú del día), lotes en portada,
   pizarra de 5 tapas con bandeja, galería horizontal de
   lotes, panel LED de lo más comentado y carta.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const watchdog = (tl, ms) => { setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, ms); return tl; };
const pad2 = (n) => String(n).padStart(2, '0');

/* ----------------------------------------------------------
   DATOS · pizarras de la entrada y lo más pedido
   ---------------------------------------------------------- */
const TAPAS = [
  ['Tortilla española', 'Truita espanyola', '#F0C552'], ['Croquetas de cangrejo', 'Croquetes de cranc', '#D9A04A'],
  ['Morcilla / butifarra', '', '#4E2420'], ['Ensaladilla rusa', 'Amanida russa', '#F3E4B4'],
  ['Jamón serrano', 'Pernil serrà', '#C4626A'], ['Queso manchego', 'Formatge manxec', '#F2D88E'],
  ['Pan con tomate', 'Pa amb tomàquet', '#D8644A'], ['Chorizo', 'Xoriço', '#B8402A'],
  ['Patatas bravas', 'Patates braves', '#E07A3A'], ['Croquetas de carne', 'Croquetes de carn', '#C98A3A'],
  ['Champiñones', 'Xampinyons', '#BFA488'], ['Boquerones en vinagre', 'Anxoves en vinagre', '#D9DEE0'],
  ['Buñuelos de bacalao', 'Bunyols de bacallà', '#D8A856'], ['Calamares empanados', 'Calamars arrebossats', '#E3B35E']
];
const FIRST = [['Gazpacho andaluz', 'Gazpacho'], ['Pescaditos fritos', 'Pescaditos'], ['Surtido de 4 tapas', '4 tapas'],
  ['Ensalada de queso de cabra', 'Queso de cabra'], ['Espaguetis a la carbonara', 'Carbonara'], ['Mejillones al ajillo', 'Mejillones']];
const SECOND = [['Bistec de ternera a la parrilla', 'Bistec'], ['Merluza fresca a la plancha con verduras', 'Merluza'],
  ['Cazuela de pescados y mariscos', 'Cazuela'], ['Salmón a la sal con verduras', 'Salmón'],
  ['Conejo a la parrilla con patatas fritas', 'Conejo'], ['Arroz meloso con sepia y almejas (mín. 2 pers.)', 'Arroz meloso']];
const HOUSE = [['Paella de marisco', 'con cigalas y mejillones'], ['Arroz caldoso con almejas y sepia', ''], ['Arroz negro', ''],
  ['Arroz con bogavante', ''], ['Fideuá', ''], ['Mariscada', 'para compartir'], ['Parrillada de marisco', ''],
  ['Zarzuela de mariscos', ''], ['Mejillones', ''], ['Calamares', ''], ['Pescaíto frito', ''], ['Crema catalana', 'de postre']];
const LOTS = [
  ['paella-cigalas.jpg', 'Paella de marisco', 'Facebook', 1300, 1298], ['mariscada.jpg', 'Mariscada', 'Facebook', 1500, 1500],
  ['caldoso-cazuela.jpg', 'Arroz caldoso', 'Google', 1050, 1400], ['paella-marinera.jpg', 'Paella marinera', 'Google', 1050, 1400],
  ['mejillones.jpg', 'Mejillones', 'Google', 1050, 1400], ['parrillada-marisco.jpg', 'Parrillada de marisco', 'Google', 787, 1400],
  ['pescaito.jpg', 'Pescaíto frito', 'Google', 1050, 1400], ['caldoso-plato.jpg', 'Caldoso, al plato', 'Google', 1050, 1400],
  ['mariscada-sangria.jpg', 'Mariscada y sangría', 'Google', 1400, 1050], ['bravas.jpg', 'Patatas bravas', 'Google', 787, 1400],
  ['tapas.jpg', 'Pan con tomate, jamón y queso', 'Google', 1050, 1400], ['calamares.jpg', 'Calamares', 'Google', 787, 1400],
  ['padron.jpg', 'Padrón, boquerones y melón', 'Facebook', 486, 1000], ['paella-servir.jpg', 'Al centro de la mesa', 'Google', 787, 1400],
  ['crema-catalana.jpg', 'Crema catalana', 'Google', 1050, 1400]
];
const TOPICS = [['Mariscada', 21], ['El callejón', 18], ['Arroz caldoso', 14], ['Cava', 14], ['Fideuá', 12], ['Arroz con bogavante', 9], ['Conejo', 9], ['Cangrejo', 7], ['Zarzuela de mariscos', 6]];

/* ----------------------------------------------------------
   SCROLL SUAVE + NAVEGACIÓN
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open); links.classList.toggle('is-open', open);
});
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : document.body;
  if (!t) return;
  e.preventDefault();
  burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open');
  if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -60, duration: 1.4 });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* ----------------------------------------------------------
   ¿ABIERTO? · cada día de 12:00 a 24:00 (hora de Lloret)
   ---------------------------------------------------------- */
const madridNow = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
};
const paintLive = () => {
  const { d, m } = madridNow(), open = m >= 720;
  const txt = open ? 'Abierto · hasta medianoche' : 'Cerrado · abre a las 12:00';
  $$('[data-live]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('[data-live-text]', el).textContent = txt; });
  $$('#hours li').forEach((li) => li.classList.toggle('is-today', +li.dataset.day === d));
};
paintLive(); setInterval(paintLive, 60000);

/* ----------------------------------------------------------
   INTRO · el reloj de la lonja cuenta hacia atrás
   ---------------------------------------------------------- */
const intro = $('#intro'), introClock = $('#introClock');
let ih = '';
for (let i = 0; i < 100; i++) {
  const a = (i * 3.6 - 90) * Math.PI / 180;
  ih += `<circle cx="${(200 + 178 * Math.cos(a)).toFixed(1)}" cy="${(200 + 178 * Math.sin(a)).toFixed(1)}" r="4.2" fill="#FFAE3D"/>`;
}
introClock.innerHTML = `<circle cx="200" cy="200" r="196" fill="none" stroke="#C59A4A" stroke-width="1.5" opacity=".5"/>${ih}`;
const introDots = $$('circle[r="4.2"]', introClock);
const heroIn = () => {
  if (!motion) return;
  gsap.from('.hero__title .line > span', { yPercent: 105, duration: 1.4, ease: 'expo.out' });
  gsap.from('.hero .eyebrow, .hero__lead, .hero__cta, .hero__lot', { y: 26, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .08, delay: .3 });
};
if (!motion) intro.remove();
else {
  lock(true); scrollTo(0, 0);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    gsap.to(intro, { clipPath: 'circle(0% at 50% 50%)', duration: 1.1, ease: 'expo.inOut', onComplete: () => { intro.remove(); lock(false); ScrollTrigger.refresh(); } });
    setTimeout(heroIn, 300);
  };
  gsap.set(intro, { clipPath: 'circle(75% at 50% 50%)' });
  const c = { n: 100 }, num = $('#introNum');
  const tl = gsap.timeline({ delay: .3, onComplete: finish });
  tl.from(introDots, { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .004 })
    .to(c, { n: 0, duration: 1.7, ease: 'power2.inOut', onUpdate: () => {
      const n = Math.round(c.n); num.textContent = n;
      introDots.forEach((d, i) => d.setAttribute('opacity', i < n ? 1 : .12));
    } }, '-=.1')
    .from('.intro__name span', { yPercent: 110, duration: .8, ease: 'expo.out' }, '-=.5')
    .to({}, { duration: .35 });
  watchdog(tl, 6000);
  intro.addEventListener('click', () => { tl.kill(); finish(); });
}

/* ----------------------------------------------------------
   PORTADA · lotes que van pasando
   ---------------------------------------------------------- */
const slides = $$('#slides img');
let si = 0;
const nextSlide = () => {
  slides[si].classList.remove('is-on');
  si = (si + 1) % slides.length;
  slides[si].classList.add('is-on');
  $('#lotNum').textContent = pad2(si + 1);
  $('#lotName').textContent = slides[si].dataset.lot;
  if (motion) gsap.fromTo('#lotNum', { opacity: .2 }, { opacity: 1, duration: .08, repeat: 4, yoyo: true });
};
if (!reduced) setInterval(() => { if (!document.hidden && scrollY < innerHeight) nextSlide(); }, 5200);

/* ----------------------------------------------------------
   LA SUBASTA · reloj con primeros (dentro) y segundos (fuera)
   ---------------------------------------------------------- */
const clock = $('#clock'), C = 260;
const P = (r, a) => [C + r * Math.cos(a * Math.PI / 180), C + r * Math.sin(a * Math.PI / 180)];
const f = (p) => p.map((v) => v.toFixed(2)).join(' ');
const sector = (r1, r2, a1, a2) => `M${f(P(r2, a1))} A${r2} ${r2} 0 0 1 ${f(P(r2, a2))} L${f(P(r1, a2))} A${r1} ${r1} 0 0 0 ${f(P(r1, a1))}Z`;
const textArc = (r, a1, a2) => {
  const mid = ((a1 + a2) / 2 + 360) % 360;
  const lower = mid > 10 && mid < 170; // en la mitad de abajo el texto va al revés
  return lower ? `M${f(P(r, a2))} A${r} ${r} 0 0 0 ${f(P(r, a1))}` : `M${f(P(r, a1))} A${r} ${r} 0 0 1 ${f(P(r, a2))}`;
};
let ch = '';
for (let k = 0; k < 60; k++) { const [x, y] = P(248, k * 6 - 90); ch += `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4"/>`; }
SECOND.forEach(([full, short], i) => {
  const a1 = i * 60 - 120, a2 = a1 + 60;
  ch += `<g class="seg seg--out" data-ring="out" data-i="${i}" tabindex="0" role="button" aria-label="Segundo: ${full}"><path class="seg__bg" d="${sector(172, 234, a1 + .6, a2 - .6)}"/><path id="to${i}" d="${textArc(203, a1 + 4, a2 - 4)}" fill="none"/><text dy="5"><textPath href="#to${i}" startOffset="50%" text-anchor="middle">${short}</textPath></text></g>`;
});
FIRST.forEach(([full, short], i) => {
  const a1 = i * 60 - 90, a2 = a1 + 60;
  ch += `<g class="seg seg--in" data-ring="in" data-i="${i}" tabindex="0" role="button" aria-label="Primero: ${full}"><path class="seg__bg" d="${sector(110, 168, a1 + .6, a2 - .6)}"/><path id="ti${i}" d="${textArc(139, a1 + 3, a2 - 3)}" fill="none"/><text dy="5"><textPath href="#ti${i}" startOffset="50%" text-anchor="middle">${short}</textPath></text></g>`;
});
ch += `<circle class="clock__face" cx="${C}" cy="${C}" r="104"/>
  <text class="clock__lbl" x="${C}" y="${C - 34}">Menú del día</text>
  <text class="clock__price" id="clockPrice" x="${C}" y="${C + 18}">25,90</text>
  <text class="clock__lbl" id="clockState" x="${C}" y="${C + 50}">Euros · IVA incl.</text>`;
clock.innerHTML = ch;
const dots = $$('.dot', clock), outSegs = $$('.seg--out', clock), inSegs = $$('.seg--in', clock);
const priceEl = $('#clockPrice'), stateEl = $('#clockState'), bidBtn = $('#bidBtn');
let running = false, outPos = 0, inPos = 0, raf = 0, last = 0, t0 = 0, autoStop = 0, stopping = false;
let pick = { first: null, second: null };
const lotNo = () => String(Math.floor(1000 + Math.random() * 8999));
const hot = () => {
  const k = ((Math.floor(outPos) % 60) + 60) % 60;
  dots.forEach((d, i) => d.classList.toggle('is-on', i === k || i === (k + 59) % 60));
  const so = Math.floor((((k + 5) % 60) / 10)) % 6; // segmento exterior bajo la luz
  outSegs.forEach((s, i) => s.classList.toggle('is-hot', running && i === so));
  const si2 = ((Math.floor(inPos) % 6) + 6) % 6;
  inSegs.forEach((s, i) => s.classList.toggle('is-hot', running && i === si2));
  return [so, si2];
};
const showPick = () => {
  outSegs.forEach((s, i) => s.classList.toggle('is-pick', pick.second === i));
  inSegs.forEach((s, i) => s.classList.toggle('is-pick', pick.first === i));
  $('#pickFirst').textContent = pick.first == null ? 'Toca un primero en el reloj' : FIRST[pick.first][0];
  $('#pickSecond').textContent = pick.second == null ? 'Toca un segundo en el reloj' : SECOND[pick.second][0];
  if (motion) gsap.fromTo('#lotTicket', { rotate: 5, y: -10 }, { rotate: 2, y: 0, duration: .8, ease: 'elastic.out(1, .5)' });
};
const loop = (t) => {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  if (!stopping) { outPos += dt * 32; inPos -= dt * 2.6; }
  const el = (t - t0) / 1000;
  if (!stopping) priceEl.textContent = Math.max(25.9, 40 - el * 3.2).toFixed(2).replace('.', ',');
  hot();
  if (running) raf = requestAnimationFrame(loop);
};
const startBid = () => {
  if (running) return;
  running = true; stopping = false;
  pick = { first: null, second: null }; showPick();
  $('#lotNo').textContent = '—';
  bidBtn.classList.add('is-running'); bidBtn.querySelector('span').textContent = '¡Me lo quedo!';
  stateEl.textContent = 'Subastando…';
  last = t0 = performance.now(); raf = requestAnimationFrame(loop);
  clearTimeout(autoStop); autoStop = setTimeout(stopBid, 6500);
};
function stopBid() {
  if (!running || stopping) return;
  stopping = true; clearTimeout(autoStop);
  const j = Math.floor(Math.random() * 6), m = Math.floor(Math.random() * 6);
  const outT = outPos + 14 + (((j * 10 - (outPos + 14)) % 60) + 60) % 60;
  const inT = inPos - 1.5 - ((((inPos - 1.5) - (m + .5)) % 6) + 6) % 6;
  const done = () => {
    running = false; stopping = false; cancelAnimationFrame(raf);
    const [so, sIn] = hot();
    pick = { second: so, first: sIn };
    dots.forEach((d) => d.classList.remove('is-on'));
    $$('.seg', clock).forEach((s) => s.classList.remove('is-hot'));
    priceEl.textContent = '25,90'; stateEl.textContent = '¡Adjudicado!';
    $('#lotNo').textContent = lotNo();
    bidBtn.classList.remove('is-running'); bidBtn.querySelector('span').textContent = 'Otra subasta';
    showPick();
  };
  if (motion) {
    const o = { a: outPos, b: inPos, p: parseFloat(priceEl.textContent.replace(',', '.')) };
    gsap.to(o, { a: outT, b: inT, p: 25.9, duration: 1.6, ease: 'power3.out', onUpdate: () => { outPos = o.a; inPos = o.b; priceEl.textContent = o.p.toFixed(2).replace('.', ','); }, onComplete: done });
  } else { outPos = outT; inPos = inT; done(); }
}
bidBtn.addEventListener('click', () => (running ? stopBid() : startBid()));
const choose = (g) => {
  if (running) return;
  const i = +g.dataset.i;
  if (g.dataset.ring === 'out') pick.second = i; else pick.first = i;
  if ($('#lotNo').textContent === '—') $('#lotNo').textContent = lotNo();
  stateEl.textContent = 'A tu elección'; showPick();
};
clock.addEventListener('click', (e) => { const g = e.target.closest('.seg'); if (g) choose(g); });
clock.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.seg')) { e.preventDefault(); choose(e.target.closest('.seg')); } });
hot();

/* ----------------------------------------------------------
   TAPAS · pizarra y bandeja de cinco cazuelitas
   ---------------------------------------------------------- */
const listEl = $('#tapaList'), trayEl = $('#tray'), msg = $('#trayMsg');
const tray = [];
listEl.innerHTML = TAPAS.map(([es, ca], i) => `<li><button class="tapa" type="button" data-i="${i}"><span><b>${es}</b>${ca ? `<small>${ca}</small>` : ''}</span><span class="tapa__n" data-n="${i}"></span></button></li>`).join('');
trayEl.innerHTML = Array.from({ length: 5 }, (_, i) => `<div class="slot" data-s="${i}"></div>`).join('');
const renderTray = (added) => {
  $$('.slot', trayEl).forEach((s, i) => {
    const t = tray[i];
    s.classList.toggle('is-full', !!t);
    s.setAttribute('role', t ? 'button' : 'presentation');
    s.setAttribute('aria-label', t ? `Quitar ${TAPAS[t][0]}` : '');
    s.innerHTML = t != null ? `<span class="cazuela" style="--food:${TAPAS[t][2]}"></span><span class="slot__lbl">${TAPAS[t][0]}</span>` : '';
  });
  $$('.tapa__n').forEach((n) => { const c = tray.filter((x) => x === +n.dataset.n).length; n.textContent = c ? '×' + c : ''; });
  $('#trayCount').textContent = `${tray.length} / 5`;
  msg.classList.toggle('is-done', tray.length === 5);
  msg.textContent = tray.length === 5 ? '¡Marchando! 5 tapas · 15,50 €' : tray.length ? `Te faltan ${5 - tray.length}` : 'Elige tus tapas';
  if (added != null && motion) {
    gsap.from($(`[data-s="${added}"] .cazuela`, trayEl), { scale: 0, rotate: -120, duration: .7, ease: 'back.out(1.7)' });
    if (tray.length === 5) gsap.fromTo(msg, { scale: .6, rotate: -6 }, { scale: 1, rotate: 0, duration: .8, ease: 'elastic.out(1, .4)' });
  }
};
listEl.addEventListener('click', (e) => {
  const b = e.target.closest('.tapa'); if (!b) return;
  if (tray.length >= 5) {
    msg.textContent = 'Bandeja llena: quita una';
    if (motion) gsap.fromTo(trayEl, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
    return;
  }
  tray.push(+b.dataset.i);
  const slot = $(`[data-s="${tray.length - 1}"]`, trayEl);
  if (motion) {
    const a = b.getBoundingClientRect(), z = slot.getBoundingClientRect();
    const dot = document.createElement('span'); dot.className = 'fly'; dot.style.background = TAPAS[+b.dataset.i][2];
    document.body.appendChild(dot);
    gsap.fromTo(dot, { x: a.left + 20, y: a.top + a.height / 2 - 14, scale: .6 }, { x: z.left + z.width / 2 - 14, y: z.top + z.height / 2 - 14, scale: 1.4, duration: .55, ease: 'power2.inOut', onComplete: () => { dot.remove(); renderTray(tray.length - 1); } });
  } else renderTray();
});
trayEl.addEventListener('click', (e) => { const s = e.target.closest('.slot.is-full'); if (!s) return; tray.splice(+s.dataset.s, 1); renderTray(); });
$('#trayReset').addEventListener('click', () => { tray.length = 0; renderTray(); });
renderTray();

/* ----------------------------------------------------------
   DEL MAR · lotes en horizontal
   ---------------------------------------------------------- */
const seaTrack = $('#seaTrack');
seaTrack.innerHTML = LOTS.map(([src, t, from, w, h], i) => `<figure class="lot" data-src="${src}" data-cap="${t}" style="--r:${(i % 2 ? 3 : -4) + (i % 3) - 1}deg"><div class="lot__img"><img src="assets/img/${src}" alt="${t}" width="${w}" height="${h}" loading="lazy"></div><figcaption class="lot__tag"><span>LOTE ${pad2(i + 1)}</span><b>${t}</b><small>Foto · ${from}</small></figcaption></figure>`).join('');
if (motion) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, seaTrack.scrollWidth - innerWidth);
    gsap.to(seaTrack, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.sea__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
  });
}

/* ----------------------------------------------------------
   PANEL LED · lo más comentado en Google
   ---------------------------------------------------------- */
const max = TOPICS[0][1];
$('#bars').innerHTML = TOPICS.map(([t, n]) => `<li class="bar"><span class="bar__name">${t}</span><span class="bar__track"><span class="bar__fill" style="--w:${(n / max * 100).toFixed(1)}%"></span></span><span class="bar__n">${n}</span></li>`).join('');
if (motion) gsap.from('.bar__fill', { scaleX: 0, duration: 1.4, ease: 'steps(24)', stagger: .08, scrollTrigger: { trigger: '#bars', start: 'top 80%' } });

/* ----------------------------------------------------------
   CARTA
   ---------------------------------------------------------- */
$('#mTapas').innerHTML = TAPAS.map(([es, ca]) => `<li>${es}${ca ? `<small>${ca}</small>` : ''}</li>`).join('');
$('#mFirst').innerHTML = FIRST.map(([t]) => `<li>${t}</li>`).join('');
$('#mSecond').innerHTML = SECOND.map(([t]) => `<li>${t}</li>`).join('');
$('#mHouse').innerHTML = HOUSE.map(([t, s]) => `<li>${t}${s ? `<small>${s}</small>` : ''}</li>`).join('');

/* ----------------------------------------------------------
   RESEÑAS
   ---------------------------------------------------------- */
const voices = $$('.voice'), vnav = $('#voiceNav');
let vi = 0, vt;
voices.forEach((_, i) => vnav.insertAdjacentHTML('beforeend', `<button type="button" aria-label="Reseña ${i + 1}" class="${i ? '' : 'is-on'}"></button>`));
const showVoice = (i) => { vi = (i + voices.length) % voices.length; voices.forEach((v, j) => v.classList.toggle('is-on', j === vi)); $$('button', vnav).forEach((b, j) => b.classList.toggle('is-on', j === vi)); };
const runVoices = () => { clearInterval(vt); vt = setInterval(() => !document.hidden && showVoice(vi + 1), 6500); };
vnav.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { showVoice($$('button', vnav).indexOf(b)); runVoices(); } });
runVoices();

/* ----------------------------------------------------------
   VISOR DE FOTOS
   ---------------------------------------------------------- */
const lb = $('#lb');
const openLB = (src, cap) => { $('img', lb).src = src; $('img', lb).alt = cap; $('figcaption', lb).textContent = cap; lb.hidden = false; lock(true); if (motion) gsap.from('.lb__fig', { scale: .94, opacity: 0, duration: .5, ease: 'power3.out' }); $('.lb__close', lb).focus(); };
const closeLB = () => { lb.hidden = true; lock(false); };
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb__close')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
seaTrack.addEventListener('click', (e) => { const l = e.target.closest('.lot'); if (l) openLB(`assets/img/${l.dataset.src}`, l.dataset.cap); });
$$('.fig img').forEach((im) => { im.style.cursor = 'zoom-in'; im.addEventListener('click', () => openLB(im.src, im.alt)); });

/* ----------------------------------------------------------
   APARICIONES
   ---------------------------------------------------------- */
if (motion) {
  ScrollTrigger.batch('.intro-sec__text > *, .stats li, .auction__head > *, .clock-wrap, .lot-ticket, .chalk__head, .chalk__list li, .tray-wrap, .sea__head > *, .board__head > *, .menu__head > *, .mcol, .visit__info > *, .visit__map', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 44, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .05, overwrite: true })
  });
  gsap.from('.fig--a', { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.intro-sec__figs', start: 'top 80%' } });
  gsap.from('.fig--b', { x: -60, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .3, scrollTrigger: { trigger: '.intro-sec__figs', start: 'top 80%' } });
  gsap.to('.fig--a img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.intro-sec__figs', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.foot__big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
  $$('.nav__links a').forEach((a) => { const sec = $(a.getAttribute('href')); if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) }); });
  addEventListener('load', () => ScrollTrigger.refresh());
}
})();
