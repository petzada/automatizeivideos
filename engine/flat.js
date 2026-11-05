// flat.js: the 2D drawing kit for story videos rendered by HyperFrames (HTML -> MP4) and FFmpeg.
// No three.js and no WebGL: everything is drawn on one 2D canvas as a pure function of time.
// The film page draws frame t from a GSAP-driven setter (see film_driver below), so every frame is seekable.
export const W = 1080, H = 1920;

// ---------- small helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const spring = x => x <= 0 ? 0 : 1 - Math.exp(-7 * x) * Math.cos(11 * x);
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function poly(c, pts, fill, stroke, lw = 4) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
}
export function rrect(c, x, y, w, h, r, fill) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); }

// ---------- the film driver: HyperFrames seeks a paused GSAP timeline; a setter draws the frame ----------
// GSAP always writes the tweened property, even when the runtime seeks with callbacks suppressed.
export function filmDriver(gsap, id, total, draw) {
  const P = { _t: 0, get t() { return this._t; }, set t(v) { this._t = v; draw(v); } };
  const tl = gsap.timeline({ paused: true }); tl.to(P, { t: total, duration: total, ease: 'none' }, 0);
  window.__timelines = window.__timelines || {}; window.__timelines[id] = tl; tl.seek(0); draw(0);
  window.seek = draw;                                   // for stills from the browser console
  document.fonts.ready.then(() => draw(P.t));
  return tl;
}

// ---------- the camera: zoom into a scene drawn in its own 1080x1920 space ----------
export function camera(c, cx, cy, zoom, rot = 0) { c.translate(W / 2, H / 2); c.rotate(rot); c.scale(zoom, zoom); c.translate(-cx, -cy); }

// ---------- light, drawn after the scene ----------
// night(): a multiply layer that sets the mood; glow(): an additive light; both are cheap and pure.
export function night(c, color = '#3a4566') { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = color; c.fillRect(0, 0, W, H); c.restore(); }
export function glow(c, x, y, r, color, a = 0.5) {
  if (a <= 0 || r <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = clamp(a, 0, 1); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore();
}
export function beam(c, pts, color, a = 0.35) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; poly(c, pts, color); c.restore(); }
// the lens: vignette and grain (seeded by frame), no ctx.filter
let grainTile = null;
export function lens(c, t, { vignette = 0.55, grain = 0.06 } = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vignette})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (!grainTile) { grainTile = document.createElement('canvas'); grainTile.width = grainTile.height = 256; const gc = grainTile.getContext('2d'), im = gc.createImageData(256, 256), R = rng(77);
    for (let i = 0; i < im.data.length; i += 4) { const v = R() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } gc.putImageData(im, 0, 0); }
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = grain * 2; const f = Math.floor(t * 24), ox = (f * 97) % 256, oy = (f * 61) % 256;
  c.translate(-ox, -oy); c.fillStyle = c.createPattern(grainTile, 'repeat'); c.fillRect(0, 0, W + 256, H + 256); c.restore();
}
// a peephole: a round mask with a bulge, drawn from an offscreen copy of the scene
export function peephole(c, drawScene) {
  if (!peephole.cv) { peephole.cv = document.createElement('canvas'); peephole.cv.width = W; peephole.cv.height = H; }
  const o = peephole.cv.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); drawScene(o);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const R0 = 530, cx = W / 2, cy = H / 2 - 60;
  for (let k = 0; k < 6; k++) {                                      // concentric rings: more zoom in the middle
    const r = R0 * (1 - k / 6), z = 1.0 + 0.32 * (k / 5);
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip(); c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); c.drawImage(peephole.cv, 0, 0); c.restore();
  }
  const g = c.createRadialGradient(cx, cy, R0 * 0.55, cx, cy, R0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.92)');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0, 0, 7); c.fill(); c.restore();
}

// ---------- a tiny pinhole camera for exteriors (flat-shaded boxes, no WebGL) ----------
// cam: {pos: [x, y, z], look: [x, y, z], f (px)}; returns [sx, sy, depth] or null behind the camera
export function cam3(pos, look, f = 1100) {
  const fw = norm(sub(look, pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
  return { pos, fw, rt, up, f, p(q) { const d = sub(q, pos), z = dot(d, fw); if (z < 0.05) return null; return [W / 2 + f * dot(d, rt) / z, H / 2 - f * dot(d, up) / z, z]; } };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export function quad3(c, cm, pts, fill, stroke) { const s = pts.map(p => cm.p(p)); if (s.some(q => !q)) return; poly(c, s, fill, stroke, 2); }
// an axis box [x0..x1, y0..y1, z0..z1], yaw around its centre; faces shaded from one light direction
export function box3(c, cm, ctr, size, yaw, color, shade = [1, 0.72, 0.5]) {
  const [w, h, d] = size.map(v => v / 2), cs = Math.cos(yaw), sn = Math.sin(yaw);
  const P = (x, y, z) => [ctr[0] + x * cs - z * sn, ctr[1] + y, ctr[2] + x * sn + z * cs];
  const v = [P(-w, -h, -d), P(w, -h, -d), P(w, h, -d), P(-w, h, -d), P(-w, -h, d), P(w, -h, d), P(w, h, d), P(-w, h, d)];
  const faces = [[[3, 2, 6, 7], [0, 1, 0], 0], [[4, 5, 6, 7], [-sn, 0, cs], 1], [[0, 1, 2, 3], [sn, 0, -cs], 1], [[1, 5, 6, 2], [cs, 0, sn], 2], [[0, 4, 7, 3], [-cs, 0, -sn], 2]];
  const out = [];
  for (const [ix, n, k] of faces) { const ctrF = ix.reduce((a, i) => [a[0] + v[i][0] / 4, a[1] + v[i][1] / 4, a[2] + v[i][2] / 4], [0, 0, 0]);
    if (dot(n, sub(cm.pos, ctrF)) <= 0) continue; out.push({ ix, k, z: dot(sub(ctrF, cm.pos), cm.fw) }); }
  out.sort((a, b) => b.z - a.z);
  for (const f of out) quad3(c, cm, f.ix.map(i => v[i]), shadeColor(color, shade[f.k]));
}
export function shadeColor(hex, k) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`; }

// ---------- the 2D stickman ----------
// Bones in canvas pixels on a 512x1024 card; a pose is joint angles in radians (0 = straight down for limbs, 0 = upright torso).
const BONES = { torso: 230, neck: 30, head: 58, upper: 135, fore: 125, thigh: 170, shin: 165 };
export function ik2(hip, foot, l1, l2, bend = 1) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1]; let d = Math.hypot(dx, dy); d = Math.min(d, l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return [hip[0] + l1 * Math.cos(a - bend * b), hip[1] + l1 * Math.sin(a - bend * b)];
}
export class Stickman {
  // o: {body, outline, mark: {type: 'cap'|'scarf'|'band', color}, eyes}
  constructor(o = {}) { this.o = Object.assign({ body: '#f1ede4', outline: '#15171c', mark: null, eyes: true }, o);
    this.cv = document.createElement('canvas'); this.cv.width = 512; this.cv.height = 1024; this.pose({}); }
  // p: {facing: 1 right / -1 left / 0 front / 'back', lean, headTilt, armL, armR, legL, legR, feet (IK), mood: 'scared', hold(c) extra drawing}
  pose(p) {
    const c = this.cv.getContext('2d'), o = this.o; c.clearRect(0, 0, 512, 1024);
    const hip = [256, 1024 - BONES.thigh - BONES.shin - 14];
    const lean = p.lean || 0, back = p.facing === 'back', f = back ? 0 : (p.facing ?? 1);
    const neck = [hip[0] + Math.sin(lean) * BONES.torso, hip[1] - Math.cos(lean) * BONES.torso];
    const head = [neck[0] + Math.sin(lean + (p.headTilt || 0)) * (BONES.neck + BONES.head), neck[1] - Math.cos(lean + (p.headTilt || 0)) * (BONES.neck + BONES.head)];
    const limb = (root, a1, a2, l1, l2) => { const j = [root[0] + Math.sin(a1) * l1, root[1] + Math.cos(a1) * l1]; return [j, [j[0] + Math.sin(a1 + a2) * l2, j[1] + Math.cos(a1 + a2) * l2]]; };
    const sh = [neck[0] + Math.sin(lean) * -24, neck[1] + Math.cos(lean) * 24];
    const aL = p.armL || [0.25, -0.2], aR = p.armR || [-0.25, 0.2], legL = p.legL || [0.12, -0.05], legR = p.legR || [-0.12, 0.05];
    const AL = limb(sh, aL[0] + lean, aL[1], BONES.upper, BONES.fore), AR = limb(sh, aR[0] + lean, aR[1], BONES.upper, BONES.fore);
    let LL, LR;
    if (p.feet) { const k1 = ik2(hip, p.feet[0], BONES.thigh, BONES.shin, -f || -1), k2 = ik2(hip, p.feet[1], BONES.thigh, BONES.shin, -f || -1); LL = [k1, p.feet[0]]; LR = [k2, p.feet[1]]; }
    else { LL = limb(hip, legL[0], legL[1], BONES.thigh, BONES.shin); LR = limb(hip, legR[0], legR[1], BONES.thigh, BONES.shin); }
    const stroke = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(...pts[0]); for (const q of pts.slice(1)) c.lineTo(...q); c.stroke(); };
    const parts = [[hip, neck], [sh, ...AL], [sh, ...AR], [hip, ...LL], [hip, ...LR]];
    for (const P of parts) stroke(P, 44, o.outline);
    c.fillStyle = o.outline; c.beginPath(); c.arc(head[0], head[1], BONES.head + 11, 0, 7); c.fill();
    for (const P of parts) stroke(P, 24, o.body);
    c.fillStyle = o.body; c.beginPath(); c.arc(head[0], head[1], BONES.head, 0, 7); c.fill();
    if (o.mark) {
      c.fillStyle = o.mark.color;
      if (o.mark.type === 'cap') { c.beginPath(); c.arc(head[0], head[1] - 6, BONES.head + 4, Math.PI, 0); c.fill(); if (!back) c.fillRect(head[0] + (f >= 0 ? 0 : -BONES.head - 30), head[1] - 12, BONES.head + 30, 14); }
      else if (o.mark.type === 'scarf') { stroke([[neck[0] - 30, neck[1] + 10], [neck[0] + 30, neck[1] + 10]], 26, o.mark.color); stroke([[neck[0] + 10 * (f || 1), neck[1] + 10], [neck[0] + 26 * (f || 1), neck[1] + 80]], 18, o.mark.color); }
      else if (o.mark.type === 'band') stroke([[head[0] - BONES.head, head[1] - 18], [head[0] + BONES.head, head[1] - 18]], 16, o.mark.color);
    }
    if (o.eyes && !back) { c.fillStyle = o.outline; const ex = head[0] + (f === 0 ? 0 : f * 18), ey = head[1] - 6, r = p.mood === 'scared' ? 9 : 7;
      if (f === 0) { c.beginPath(); c.arc(ex - 18, ey, r, 0, 7); c.arc(ex + 18, ey, r, 0, 7); c.fill(); } else { c.beginPath(); c.arc(ex + f * 12, ey, r, 0, 7); c.fill(); } }
    if (p.hold) p.hold(c, { hip, neck, head, hands: [AL[1], AR[1]] });
    return this;
  }
  // a walk with planted feet; returns the distance covered (metres) for t seconds at speed m/s
  walk(t, { speed = 0.9, stride = 0.55, facing = 1 } = {}) {
    const px = 512 / 0.875, x = speed * t, ph = x / stride;
    const foot = k => { const s = Math.floor(ph + k * 0.5), u = ph + k * 0.5 - s, stance = u < 0.5, plant = (s + 0.5) * stride - k * 0.5 * stride;
      const fx = stance ? plant : lerp(plant, plant + stride, ease((u - 0.5) * 2)), lift = stance ? 0 : Math.sin((u - 0.5) * 2 * Math.PI) * 40;
      return [256 + (fx - x) * px * facing, 1010 - lift]; };
    this.pose({ facing, feet: [foot(0), foot(1)], armL: [0.35 * Math.sin(ph * Math.PI), -0.3], armR: [-0.35 * Math.sin(ph * Math.PI), 0.3], lean: 0.05 * facing });
    return x;
  }
  // draw the card with its feet at (x, y), hpx pixels tall
  draw(c, x, y, hpx, alpha = 1) { if (hpx <= 1) return; c.save(); c.globalAlpha = alpha; c.drawImage(this.cv, x - hpx * 0.25, y - hpx, hpx * 0.5, hpx); c.restore(); }
}

// ---------- the 2D overlay ----------
export const LABELS = { day: 'DAY', rule: 'RULE #', comment: 'COMMENT BELOW', follow: 'FOLLOW FOR DAY ' };
export const FONTS = ['700 70px Oswald', '700 40px "JetBrains Mono"'];
function txt(c, s, x, y, font, fill, o = {}) {
  c.font = font; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.stroke; c.strokeStyle = o.strokeColor || '#0b0c0f'; c.strokeText(s, x, y); }
  c.fillStyle = fill; c.fillText(s, x, y);
}
export function hud(c, day, clock, k = 1) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = k; c.fillStyle = 'rgba(8,9,12,0.62)'; c.beginPath(); c.roundRect(40, 120, 330, 108, 18); c.fill();
  txt(c, LABELS.day + ' ' + day, 70, 152, '700 34px "JetBrains Mono"', '#f3eee4', { align: 'left' });
  txt(c, clock, 70, 198, '700 40px "JetBrains Mono"', '#ff5a4f', { align: 'left' }); c.restore();
}
export function caption(c, words, y = 1310, accent = '#ffcc4d') {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = '700 74px Oswald'; const parts = words.map(w => ({ ...w, s: w.w.toUpperCase() }));
  const sp = 22, widths = parts.map(p => c.measureText(p.s).width), total = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = 540 - total / 2;
  parts.forEach((p, i) => { txt(c, p.s, x + widths[i] / 2, y, '700 74px Oswald', p.key ? (p.color || accent) : '#ffffff', { stroke: 12 }); x += widths[i] + sp; });
  c.restore();
}
export function ruleSticker(c, n, title, k, y = 520) {
  if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(540, y); c.rotate(-0.06); c.scale(0.6 + 0.4 * clamp(k, 0, 1.2), 0.6 + 0.4 * clamp(k, 0, 1.2));
  c.fillStyle = '#f4f0e6'; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.beginPath(); c.roundRect(-400, -120, 800, 250, 22); c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#d93b30'; c.beginPath(); c.roundRect(-400, -120, 260, 70, [22, 0, 22, 0]); c.fill();
  txt(c, LABELS.rule + n, -270, -84, '700 44px Oswald', '#ffffff');
  const lines = Array.isArray(title) ? title : [title];
  lines.forEach((s, i) => txt(c, s.toUpperCase(), 0, i * 80 - (lines.length - 1) * 30 + 10, '700 72px Oswald', '#14161b'));
  c.restore();
}
export function endCard(c, t0, t, q, optA, optB, nextDay) {
  const k = clamp(spring(t - t0), 0, 1.15);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(6,7,10,0.86)'; c.fillRect(0, 0, W, H);
  c.translate(540, 900); c.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); c.translate(-540, -900);
  (Array.isArray(q) ? q : [q]).forEach((s, i) => txt(c, s.toUpperCase(), 540, 560 + i * 110, '700 104px Oswald', '#ffffff', { stroke: 10 }));
  const opt = (s, y, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(170, y - 70, 740, 140, 30); c.fill(); txt(c, s.toUpperCase(), 540, y, '700 64px Oswald', '#ffffff'); };
  opt(optA, 900, '#2e9e57'); opt(optB, 1080, '#c8372d');
  txt(c, LABELS.comment, 540, 1250, '700 56px Oswald', '#ffffff'); txt(c, LABELS.follow + nextDay, 540, 1330, '700 46px Oswald', '#ffcc4d');
  c.restore();
}
export function phone(c, draw, k = 1) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = k; const x = 260, y = 520, w = 560, h = 1060;
  c.fillStyle = '#0d0e12'; c.beginPath(); c.roundRect(x - 22, y - 22, w + 44, h + 44, 60); c.fill();
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, 44); c.clip(); draw(c, x, y, w, h); c.restore();
  c.strokeStyle = '#15171c'; c.lineWidth = 44; c.lineCap = 'round'; c.beginPath(); c.moveTo(180, 1900); c.lineTo(300, 1500); c.moveTo(900, 1900); c.lineTo(780, 1520); c.stroke();
  c.strokeStyle = '#f1ede4'; c.lineWidth = 24; c.stroke(); c.restore();
}
// a big number that lands: k = 0..1 since it started
export function counter(c, text, sub, k, col = '#ff5a4f', y = 860) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = clamp(k * 3); c.translate(540, y); const s = 0.7 + 0.3 * clamp(spring(k), 0, 1.15); c.scale(s, s);
  txt(c, text, 0, 0, '700 200px Oswald', col, { stroke: 16 }); txt(c, sub, 0, 130, '700 70px Oswald', '#ffffff', { stroke: 12 }); c.restore();
}

// ---------- caption chunks, by meaning ----------
// At most 3 words, broken at punctuation and before a phrase starts, never ending on a function word.
// A time ("2:14 AM") or a number with its unit ("30 dias") stays together. badChunks() lists the ones that end badly.
export const FUNCTION_WORDS = new Set(("a an the to of at for from with by into onto under about after before until behind through and or but nor so if as than that this these those is are was were be been it its it's i i'm you you're they're he she we they me him her us them my your his our their who which what when where while because " +
  "o os um uma uns umas de do da dos das em no na nos nas ao aos à às por pelo pela pelos pelas para pra pro com sem e ou mas que se como é era foi ser seu sua seus suas meu minha meus minhas teu tua nosso nossa você vocês me te lhe desde até entre sobre isso isto esse essa este esta aquele aquela num numa não tá").split(' '));
export const PARTICLES = new Set('in on up off out down back away over'.split(' '));
const bare = s => String(s).toLowerCase().replace(/[^\p{L}0-9':]/gu, '');
export function chunkCaptions(T, keyColor = { red: '#ff5a4f', yellow: '#ffcc4d', amber: '#ffcc4d', green: '#4fe08a', blue: '#5ab4ff' }) {
  const DET = new Set("a an the my your his her their our its this that these those every each some no one two three o os as um uma meu minha seu sua".split(' '));
  const isF = u => u.f, out = [];
  T.lines.forEach((L, li) => {
    if (L.nocap) return;
    const keys = {}; for (const k in (L.key || {})) keys[bare(k)] = L.key[k];
    const raw = L.text.trim().split(/\s+/), same = raw.length === L.words.length, units = [];
    L.words.forEach((x, i) => {
      const brk = /[.,;!:?]$/.test(same ? raw[i] : x.w), d = String(x.w).replace(/[.,;!:?]+$/, ''), k = keys[bare(d)];
      const wd = { w: d, s: x.s, e: x.e, key: !!k, color: k ? (keyColor[k] || k) : undefined }, prev = units[units.length - 1];
      const glue = prev && prev.ws.length === 1 && ((/^(AM|PM)$/i.test(d) && /\d:\d\d$/.test(prev.ws[0].w)) ||
        (/^(liters?|litres?|days?|minutes?|hours?|seconds?|floors?|meters?|metres?|km|miles?|percent|%|litros?|dias?|minutos?|horas?|segundos?|andares|andar|metros?|quilos?|latas?|anos?)$/i.test(d) && /^\d+([.,]\d+)?$/.test(prev.ws[0].w)));
      if (glue) { prev.ws.push(wd); prev.brk = brk; } else units.push({ ws: [wd], brk });
    });
    units.forEach((u, i) => { const b = bare(u.ws[0].w), nx = units[i + 1];
      u.f = u.ws.length === 1 && (FUNCTION_WORDS.has(b) || (PARTICLES.has(b) && !u.brk && !!nx && (DET.has(bare(nx.ws[0].w)) || /^\d/.test(nx.ws[0].w)))); });
    const segs = [[]]; for (const u of units) { segs[segs.length - 1].push(u); if (u.brk) segs.push([]); }
    for (const sg of segs) {
      let cur = [], n = 0;
      for (const u of sg) {
        if (n && n + u.ws.length > 3) {
          let j = -1;
          if (!(isF(u) && !isF(cur[cur.length - 1]))) for (let k = cur.length - 1; k >= 1; k--) if (isF(cur[k]) && !isF(cur[k - 1])) { j = k; break; }
          if (j > 0) { out.push({ li, words: cur.slice(0, j).flatMap(x => x.ws) }); cur = cur.slice(j); }
          else if (!isF(cur[cur.length - 1])) { out.push({ li, words: cur.flatMap(x => x.ws) }); cur = []; }
          n = cur.reduce((a, x) => a + x.ws.length, 0);
        }
        cur.push(u); n += u.ws.length;
      }
      if (cur.length) out.push({ li, words: cur.flatMap(x => x.ws) });
    }
  });
  for (let i = out.length - 1; i > 0; i--) { const a = out[i - 1], b = out[i];
    if (b.words.length === 1 && PARTICLES.has(bare(b.words[0].w)) && a.li === b.li) { a.words.push(b.words[0]); out.splice(i, 1); } }
  out.forEach((c, i) => { c.s = c.words[0].s - 0.04; const nx = out[i + 1]; c.e = nx && nx.li === c.li ? nx.words[0].s - 0.04 : Math.min(T.lines[c.li].end + 0.3, nx ? nx.words[0].s - 0.06 : 1e9); });
  return out;
}
export function badChunks(chunks) { return chunks.filter(c => { const w = c.words.map(x => bare(x.w)); return w.length > 3 || FUNCTION_WORDS.has(w[w.length - 1]) || (w.length === 1 && PARTICLES.has(w[0])); }).map(c => c.words.map(x => x.w).join(' ')); }
export function drawCaptions(c, chunks, t, y = 1310) { const ch = chunks.find(x => t >= x.s && t < x.e); if (ch) caption(c, ch.words, y); }
// a loud banner when the captions break the rules, so a snapshot shows it before any render
export function captionGate(c, bad) { if (!bad.length) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#d00'; c.fillRect(0, 1700, W, 140);
  txt(c, 'CAPTION FAIL: ' + bad.slice(0, 3).join(' | '), 540, 1770, '700 40px Oswald', '#fff'); c.restore(); }
