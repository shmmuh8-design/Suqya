// سُقيا — الواجهة الجديدة: التبويبات، الرئيسية، خريطة الصهاريج، الحاسبة، طلباتي، المفضّلة
(function(){
const ICON = {
  home:'<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"/>',
  truck:'<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3v3h-7z"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
  list:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 14h7M8.5 18h4"/>',
  user:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-3.7 4-5.5 7.5-5.5s6.3 1.8 7.5 5.5"/>',
  drop:'<path d="M12 3.2S5.8 10.4 5.8 14.5a6.2 6.2 0 0 0 12.4 0C18.2 10.4 12 3.2 12 3.2z"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><rect x="8" y="6" width="8" height="3.5" rx="1"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/>',
  pin:'<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  star:'<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z"/>'
};
const ic = (k, cls) => `<svg class="ico ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]||''}</svg>`;
const mk = (tag, cls, text) => { const e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; };
function sheet(build){
  const s = mk('div','ssheet'), b = mk('div','ssheet-in'); b.setAttribute('role','dialog'); b.setAttribute('aria-modal','true');
  const close = () => s.remove(); s.onclick = e => { if(e.target === s) close(); };
  build(b, close); s.append(b); document.body.append(s);
}
const closeB = close => { const b = mk('button','btn ghost wide', L('إغلاق','Close')); b.type = 'button'; b.onclick = close; return b; };

/* ---------- المفضّلة ---------- */
const favs = () => new Set(store.get('suqya-fav', []));
window.SUI_isFav = d => favs().has(dkey(d));
window.SUI_toggleFav = d => { const f = favs(), k = dkey(d); f.has(k) ? f.delete(k) : f.add(k); store.set('suqya-fav', [...f]); toast(f.has(k) ? L('⭐ انضاف للمفضّلة','⭐ Added to favourites') : L('انشال من المفضّلة','Removed from favourites')); renderDrivers(); };

/* ---------- سجل الطلبات ---------- */
window.SUI_log = (d, via) => {
  const h = store.get('suqya-hist', []);
  h.unshift({ t: Date.now(), gov:S.gov, area:S.area, gal:S.gal, type:S.type, k:dkey(d), name:d.name, phone:d.phone, price:d.prices[String(S.gal)], via });
  store.set('suqya-hist', h.slice(0, 50));
};

/* ---------- خريطة عُمان ---------- */
const OMAN = [[56.38,24.98],[56.47,24.74],[56.75,24.36],[57.1,23.98],[57.44,23.85],[57.88,23.71],[58.18,23.68],[58.6,23.62],[58.92,23.26],[59.25,22.82],[59.53,22.57],[59.8,22.52],[59.83,22.4],[59.58,21.85],[59.3,21.4],[58.7,20.75],[58.3,20.45],[57.85,19.95],[57.7,19.66],[57.82,19.05],[57.2,18.9],[56.6,18.55],[55.6,17.9],[55.27,17.45],[55.07,17.05],[54.69,16.99],[54.4,17.04],[54.09,17.02],[53.75,16.88],[53.42,16.74],[53.1,16.66],[52.99,16.65],[52.75,17.1],[52.4,17.9],[52.0,19.0],[53.4,19.5],[55.0,20.0],[55.67,22.0],[55.2,22.7],[55.55,23.4],[55.75,24.0],[55.8,24.25],[56.0,24.6],[56.2,24.8]];
const MASIRAH = [[58.95,20.7],[58.84,20.5],[58.68,20.2],[58.76,20.14],[58.9,20.38],[58.98,20.62]];
const MUSANDAM = [[56.08,26.05],[56.15,26.22],[56.24,26.4],[56.38,26.38],[56.45,26.25],[56.42,26.05],[56.35,25.88],[56.37,25.62],[56.27,25.62],[56.15,25.82]];
const WC = {"مسقط":[58.59,23.6],"مطرح":[58.56,23.63],"بوشر":[58.4,23.56],"السيب":[58.18,23.66],"العامرات":[58.5,23.5],"قريات":[58.91,23.26],
 "صلالة":[54.09,17.03],"طاقة":[54.4,17.05],"مرباط":[54.69,17.0],"رخيوت":[53.42,16.76],"ثمريت":[54.03,17.67],"ضلكوت":[53.25,16.72],"المزيونة":[52.67,17.85],"مقشن":[54.89,19.56],"شليم وجزر الحلانيات":[55.6,17.95],"سدح":[55.07,17.06],
 "خصب":[56.25,26.18],"دبا":[56.27,25.64],"بخا":[56.15,26.14],"مدحاء":[56.32,25.28],
 "البريمي":[55.79,24.25],"محضة":[55.97,24.4],"السنينة":[55.91,23.69],
 "نزوى":[57.53,22.93],"بهلاء":[57.3,22.97],"منح":[57.6,22.79],"الحمراء":[57.29,23.11],"أدم":[57.53,22.38],"إزكي":[57.77,22.93],"سمائل":[57.98,23.3],"بدبد":[58.13,23.41],"الجبل الأخضر":[57.67,23.07],
 "صحار":[56.71,24.34],"شناص":[56.47,24.74],"لوى":[56.57,24.53],"صحم":[56.89,24.17],"الخابورة":[57.1,23.97],"السويق":[57.44,23.84],
 "الرستاق":[57.42,23.39],"العوابي":[57.53,23.3],"نخل":[57.83,23.39],"وادي المعاول":[57.75,23.48],"بركاء":[57.89,23.68],"المصنعة":[57.63,23.77],
 "صور":[59.52,22.56],"الكامل والوافي":[59.2,22.22],"جعلان بني بو حسن":[59.33,22.1],"جعلان بني بو علي":[59.35,21.98],"مصيرة":[58.87,20.67],
 "إبراء":[58.53,22.69],"المضيبي":[58.12,22.57],"بدية":[58.8,22.45],"القابل":[58.7,22.57],"وادي بني خالد":[59.09,22.62],"دماء والطائيين":[58.66,23.06],
 "عبري":[56.51,23.23],"ينقل":[56.54,23.59],"ضنك":[56.26,23.55],
 "هيماء":[56.28,19.96],"محوت":[58.2,20.65],"الدقم":[57.7,19.66],"الجازر":[57.0,18.95]};
const PX = ([lo, la]) => [(lo - 51.7) * 93, (26.7 - la) * 100];
const FULL = [0, 0, 780, 1040];
let VB = FULL.slice(), mapGov = null, anim = 0;
const poly = pts => 'M' + pts.map(p => PX(p).map(v => v.toFixed(1)).join(',')).join('L') + 'Z';
const G = () => DATA.governorates || {};
const govOf = w => Object.keys(G()).find(g => G()[g].includes(w));
function countIn(w){ const g = govOf(w), hid = hiddenSet(); return DATA.drivers.filter(d => !hid.has(dkey(d)) && (d.areas.includes(w) || d.areas.includes('gov:' + g))).length; }
function govBox(g){
  const pts = G()[g].map(w => PX(WC[w] || [57, 22]));
  const x0 = Math.min(...pts.map(p => p[0])), x1 = Math.max(...pts.map(p => p[0])), y0 = Math.min(...pts.map(p => p[1])), y1 = Math.max(...pts.map(p => p[1]));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = Math.max(x1 - x0 + 90, 150), h = Math.max(y1 - y0 + 110, w * 1.3);
  return [cx - w / 2, cy - h / 2, w, h];
}
function zoomTo(box){
  const from = VB.slice(), t0 = performance.now(), dur = 420; cancelAnimationFrame(anim);
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); VB = from.map((v, i) => v + (box[i] - v) * e); drawMap(); if(k < 1) anim = requestAnimationFrame(step); };
  anim = requestAnimationFrame(step);
}
function drawMap(){
  const svg = document.getElementById('omMap'); if(!svg) return;
  const r = svg.getBoundingClientRect(), s = Math.max(VB[2] / (r.width || 350), VB[3] / (r.height || 460)) * 0.9;
  svg.setAttribute('viewBox', VB.map(v => v.toFixed(1)).join(' '));
  const out = [];
  Object.keys(WC).forEach(w => {
    const [x, y] = PX(WC[w]), n = countIn(w), sel = w === S.area, tr = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`;
    if(n) out.push(`<g class="pin${sel?' sel':''}" data-w="${w}" transform="${tr}">${sel?'<circle r="26" class="pulse"/>':''}<path d="M0 0C-9-12-16-19-16-28a16 16 0 0 1 32 0c0 9-7 16-16 28z" class="pp"/><text y="-23" text-anchor="middle">${n}</text></g>`);
    else out.push(`<g class="dot${sel?' sel':''}" data-w="${w}" transform="${tr}">${sel?'<circle r="18" class="pulse"/>':''}<circle r="${sel?7:4.5}"/><circle r="14" fill="transparent"/></g>`);
    if(sel) out.push(`<g transform="translate(${x.toFixed(1)} ${(y + 22 * s).toFixed(1)}) scale(${s.toFixed(3)})"><text class="lbl" text-anchor="middle">${gn(w)}</text></g>`);
  });
  document.getElementById('omPins').innerHTML = out.join('');
}
function mapView(){
  const box = $('mapBox');
  if(!box.dataset.ok){
    box.dataset.ok = 1;
    box.innerHTML = `<svg id="omMap" viewBox="${FULL.join(' ')}" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f4a8a"/><stop offset="1" stop-color="#072a55"/></linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="rgba(120,200,255,.07)"/></pattern></defs>
      <rect x="-400" y="-400" width="1600" height="1900" fill="url(#grid)"/>
      <g filter="url(#glow)"><path d="${poly(OMAN)}" fill="url(#land)" stroke="#5fd0ff" stroke-width="2.4" stroke-linejoin="round"/><path d="${poly(MUSANDAM)}" fill="url(#land)" stroke="#5fd0ff" stroke-width="2"/><path d="${poly(MASIRAH)}" fill="url(#land)" stroke="#5fd0ff" stroke-width="1.6"/></g>
      <g id="omPins"></g></svg>`;
    $('omMap').addEventListener('click', e => { const g = e.target.closest('[data-w]'); if(!g) return; const w = g.dataset.w; S.gov = govOf(w); S.area = w; renderControls(); renderDrivers(); mapInfo(); });
  }
  const chip = (t, on, f) => { const b = mk('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(on)); b.onclick = f; return b; };
  $('govChips').replaceChildren(chip(L('كل عُمان','All Oman'), !mapGov, () => { mapGov = null; zoomTo(FULL); mapView(); }),
    ...Object.keys(G()).map(g => chip(gn(g), mapGov === g, () => { mapGov = g; zoomTo(govBox(g)); mapView(); })));
  drawMap(); mapInfo();
}
function mapInfo(){
  const box = $('mapInfo'); if(!box) return; box.replaceChildren();
  if(!S.area){ box.append(mk('span','muted', L('اضغط على ولاية في الخريطة 📍','Tap a wilayat on the map 📍'))); return; }
  const n = countIn(S.area), t = mk('div'); t.append(mk('b', null, '📍 ' + gn(S.area) + ' · ' + gn(S.gov)), mk('span','muted', n ? (EN ? n + ' tanker' + (n > 1 ? 's' : '') : n + (n > 2 ? ' صهاريج' : n === 2 ? ' صهريجين' : ' صهريج')) : L('ما فيه صهاريج مسجّلة للحين','No tankers yet')));
  const b = mk('button','btn sm', L('اطلب هنا ←','Order here →')); b.type = 'button'; b.onclick = () => { go('order'); setTimeout(() => $('drivers').scrollIntoView({ behavior:'smooth', block:'start' }), 200); };
  box.append(t, b);
}

/* ---------- حاسبة احتياج المياه ---------- */
function calc(){
  sheet((b, close) => {
    const st = store.get('suqya-calc', { n:5, use:150 });
    b.append(mk('h3', null, L('🧮 حاسبة احتياج المياه','🧮 Water needs calculator')), mk('p','muted', L('تقدير تقريبي يساعدك تختار حجم الصهريج.','A rough estimate to help you pick a tanker size.')));
    const row = mk('div','calc-row'), lab = mk('label', null, L('عدد أفراد البيت','People at home')), num = mk('div','stepper');
    const minus = mk('button', null, '−'), val = mk('b','num'), plus = mk('button', null, '+'); minus.type = plus.type = 'button';
    num.append(minus, val, plus); row.append(lab, num);
    const useBox = mk('div','seg3'); const U = [[100, L('اقتصادي','Light')], [150, L('عادي','Normal')], [220, L('كثير (حديقة/غسيل)','Heavy (garden/washing)')]];
    const out = mk('div','calc-out');
    const paint = () => {
      val.textContent = st.n; store.set('suqya-calc', st);
      useBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.v === st.use)));
      const daily = st.n * st.use / 4.5;
      const sizes = DATA.sizes.map(s => ({ gal:s.gal, days: s.gal / daily }));
      const rec = (sizes.find(s => s.days >= 4) || sizes[sizes.length - 1]);
      out.replaceChildren(
        el2('div','calc-big', [mk('span', null, L('احتياجك اليومي تقريبًا','Daily need, roughly')), mk('b','num', Math.round(daily).toLocaleString('en') + ' ' + L('جالون','gal'))]),
        ...sizes.map(s => el2('div','calc-line' + (s.gal === rec.gal ? ' rec' : ''), [mk('span', null, '💧 ' + s.gal.toLocaleString('en') + ' ' + L('جالون','gal')), mk('b', null, fmtDays(s.days))])),
        (() => { const go1 = mk('button','btn wide', L('اطلب صهريج ','Order a ') + rec.gal.toLocaleString('en') + L(' جالون ←',' gal tanker →')); go1.type = 'button'; go1.onclick = () => { S.gal = rec.gal; renderControls(); renderDrivers(); close(); go('order'); }; return go1; })());
    };
    minus.onclick = () => { st.n = Math.max(1, st.n - 1); paint(); }; plus.onclick = () => { st.n = Math.min(40, st.n + 1); paint(); };
    U.forEach(([v, t]) => { const x = mk('button', null, t); x.type = 'button'; x.dataset.v = v; x.onclick = () => { st.use = v; paint(); }; useBox.append(x); });
    b.append(row, mk('label','calc-l', L('الاستهلاك','Usage')), useBox, out, mk('p','muted small', L('الحساب: الفرد يستهلك تقريبًا 100 إلى 220 لتر باليوم، والجالون 4.5 لتر تقريبًا.','Based on roughly 100–220 litres per person per day; one gallon ≈ 4.5 litres.')), closeB(close));
    paint();
  });
}
const el2 = (tag, cls, kids) => { const e = mk(tag, cls); kids.forEach(k => k && e.append(k)); return e; };
const fmtDays = d => d < 1 ? L('أقل من يوم','Under a day') : EN ? '≈ ' + Math.round(d) + ' day' + (Math.round(d) > 1 ? 's' : '') : (Math.round(d) === 1 ? 'يوم تقريبًا' : Math.round(d) === 2 ? 'يومين تقريبًا' : '≈ ' + Math.round(d) + ' أيام');

/* ---------- طلباتي ---------- */
function histView(){
  const box = $('histBody'); box.replaceChildren();
  const f = favs(), fl = DATA.drivers.filter(d => f.has(dkey(d)));
  box.append(mk('h3','sec', L('⭐ سايقي المفضّل','⭐ My favourite drivers')));
  if(!fl.length) box.append(mk('div','empty', L('اضغط ⭐ على أي صهريج في قائمة الطلب عشان يطلع هنا وأول القائمة.','Tap ⭐ on any tanker in the order list to keep it here and at the top.')));
  fl.forEach(d => {
    const c = mk('div','glass hrow');
    const t = el2('div', null, [mk('b', null, d.name), mk('span','muted', areaText(d))]);
    const b = mk('button','btn sm', L('اطلب منه','Order')); b.type = 'button';
    b.onclick = () => { if(!S.area || !covers(d)){ const a = d.areas[0] || ''; if(a.startsWith('gov:')){ S.gov = a.slice(4); S.area = G()[S.gov][0]; } else if(a){ S.area = a; S.gov = govOf(a); } } renderControls(); renderDrivers(); go('order'); setTimeout(() => $('drivers').scrollIntoView({ behavior:'smooth', block:'start' }), 200); };
    c.append(t, b); box.append(c);
  });
  const h = store.get('suqya-hist', []);
  box.append(mk('h3','sec', L('📋 طلباتي السابقة','📋 Past orders')));
  if(!h.length) box.append(mk('div','empty', L('لما تطلب صهريج، يتسجّل هنا وتقدر تعيد نفس الطلب بضغطة 🔁','When you order a tanker it shows here, and you can repeat it in one tap 🔁')));
  h.forEach(o => {
    const ty = DATA.types.find(t => t.id === o.type);
    const c = mk('div','glass hrow');
    const dt = new Date(o.t).toLocaleDateString(EN ? 'en-GB' : 'ar-OM', { day:'numeric', month:'long', year:'numeric' });
    const t = el2('div', null, [mk('b', null, '💧 ' + o.gal.toLocaleString('en') + ' ' + L('جالون','gal') + ' · ' + (ty ? tyLabel(ty) : '')), mk('span','muted', o.name + ' · ' + gn(o.area) + ' · ' + omr(o.price) + ' ' + OMR), mk('span','muted small', dt)]);
    const b = mk('button','btn sm', L('🔁 اطلب نفسه','🔁 Reorder')); b.type = 'button';
    b.onclick = () => { S.gov = o.gov; S.area = o.area; S.gal = o.gal; S.type = o.type; renderControls(); renderDrivers(); go('order'); setTimeout(() => $('drivers').scrollIntoView({ behavior:'smooth', block:'start' }), 200); toast(L('رجّعنا نفس طلبك، حدد موقعك واطلب 👍','Your order is filled in — add your location and order 👍')); };
    c.append(t, b); box.append(c);
  });
  if(h.length){ const clr = mk('button','linkb', L('مسح السجل','Clear history')); clr.type = 'button'; clr.onclick = e => { if(!e.target.dataset.sure){ e.target.dataset.sure = 1; e.target.textContent = L('اضغط مرة ثانية للتأكيد','Tap again to confirm'); return; } store.set('suqya-hist', []); histView(); }; box.append(clr); }
  box.append(mk('p','muted small center', L('طلباتك ومفضّلتك محفوظة في جوالك بس.','Your orders and favourites are saved on your phone only.')));
}

/* ---------- الرئيسية ---------- */
function homeDraw(){
  if(!$('stN')) return;
  const hid = hiddenSet(), all = DATA.drivers.filter(d => !hid.has(dkey(d)) && !d.demo);
  const cov = new Set(); all.forEach(d => d.areas.forEach(a => a.startsWith('gov:') ? (G()[a.slice(4)] || []).forEach(w => cov.add(w)) : cov.add(a)));
  const p2 = all.map(d => d.prices['2000']).filter(v => v > 0);
  $('stN').textContent = all.length; $('stW').textContent = cov.size; $('stP').textContent = p2.length ? omr(Math.min(...p2)) : '—';
}

/* ---------- التبويبات ---------- */
let CUR = 'home';
function go(name){
  if(name === 'acct'){ openReg(); return; }
  CUR = name;
  document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== 'v-' + name);
  document.querySelectorAll('#tabbar [data-go]').forEach(b => b.setAttribute('aria-current', b.dataset.go === name ? 'page' : 'false'));
  window.scrollTo({ top:0 });
  if(name === 'map') mapView();
  if(name === 'hist') histView();
  if(name === 'home') homeDraw();
}
window.go = go;
const items = [['home','home',L('الرئيسية','Home')],['map','truck',L('الصهاريج','Tankers')],['order','drop',L('طلب جديد','New order')],['hist','list',L('طلباتي','My orders')],['acct','user',L('حسابي','Account')]];
$('tabbar').innerHTML = items.map(([k, i, t]) => `<button type="button" data-go="${k}" class="${k==='order'?'mid':''}">${k==='order'?'<span class="bubble">'+ic(i)+'</span>':ic(i)}<span>${t}</span></button>`).join('');
$('tabbar').onclick = e => { const b = e.target.closest('[data-go]'); if(b) go(b.dataset.go); };
$('heroGo').onclick = () => go('order');
$('mapCta').onclick = () => go('map');
const tiles = [['calc',L('حاسبة احتياج المياه','Water calculator'),calc],['truck',L('الصهاريج المتاحة','Available tankers'),()=>go('map')],['list',L('طلباتي','My orders'),()=>go('hist')],['star',L('سايقي المفضّل','Favourite drivers'),()=>go('hist')]];
$('tiles').replaceChildren(...tiles.map(([i, t, f]) => { const b = mk('button','tile'); b.type = 'button'; b.onclick = f; b.innerHTML = `<span class="tile-i">${ic(i)}</span>`; b.append(mk('span', null, t)); return b; }));
window.SUI = {
  after(){ homeDraw(); if(CUR === 'map'){ drawMap(); mapInfo(); } if(CUR === 'hist') histView(); }
};
SUI.after();
go(/^#(order|map|hist)$/.test(location.hash) ? location.hash.slice(1) : 'home');
})();
