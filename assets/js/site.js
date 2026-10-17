/* ==========================================================================
   Angelo Guarnerio — site interactions (no dependencies)
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (e0, e1, x) => { const k = clamp((x - e0) / (e1 - e0)); return k * k * (3 - 2 * k); };
  const gauss = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));

  // Deterministic PRNG so generated graphics look the same on every visit
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(TAU * r());

  // Run `cb(visible)` whenever `el` enters / leaves the viewport
  const watch = (el, cb, margin = '0px') => {
    if (!el) return;
    new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: margin }).observe(el);
  };

  /* ------------------------------------------------------------------ signals */
  const ecg = (t) => {
    const tt = t + 0.05 * Math.sin(TAU * 0.25 * t);          // respiratory sinus arrhythmia
    const T = 60 / 62, ph = (((tt % T) + T) % T) / T;
    return 0.12 * gauss(ph, 0.18, 0.025) - 0.10 * gauss(ph, 0.335, 0.010)
         + 1.00 * gauss(ph, 0.36, 0.012) - 0.22 * gauss(ph, 0.385, 0.012)
         + 0.28 * gauss(ph, 0.60, 0.045) + 0.02 * Math.sin(t * 1.7);
  };
  const eeg = (t, seed = 0) => {
    const env = 0.6 + 0.4 * Math.sin(t * 0.9 + seed) * Math.sin(t * 0.37 + 1 + seed);
    return 0.42 * env * Math.sin(TAU * 10.2 * t + seed)
         + 0.24 * Math.sin(TAU * 5.8 * t + 1.3 + seed * 2)
         + 0.14 * Math.sin(TAU * 21.7 * t + 0.4 + seed)
         + 0.10 * Math.sin(TAU * 2.1 * t + seed)
         + 0.07 * Math.sin(TAU * 37.3 * t + seed * 3)
         + 0.05 * Math.sin(TAU * 53.1 * t + 2);
  };
  const slowState = (t) => 0.5 * Math.sin(TAU * 0.11 * t) + 0.3 * Math.sin(TAU * 0.047 * t + 1) + 0.12 * Math.sin(TAU * 0.31 * t);

  // Beat train with realistic variability, used for the PPG + HRV visual
  const BEATS = (() => {
    const out = []; let acc = 0;
    for (let k = 0; k < 2000; k++) {
      const rr = 0.92 + 0.06 * Math.sin(k * 0.7) + 0.03 * Math.sin(k * 1.9 + 1) + 0.015 * Math.sin(k * 4.1);
      out.push({ t: acc, rr }); acc += rr;
    }
    return { list: out, total: acc };
  })();
  const beatAt = (tau) => {
    const L = BEATS.list; let lo = 0, hi = L.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (L[mid].t <= tau) lo = mid; else hi = mid - 1; }
    return lo;
  };
  const ppg = (tau) => {
    const b = BEATS.list[beatAt(tau)], ph = (tau - b.t) / b.rr;
    return gauss(ph, 0.22, 0.085) + 0.38 * gauss(ph, 0.52, 0.07) - 0.15;
  };

  // Canvas with DPR handling
  const setupCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const size = { w: 0, h: 0 };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      size.w = canvas.clientWidth; size.h = canvas.clientHeight;
      canvas.width = Math.round(size.w * dpr); canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    new ResizeObserver(resize).observe(canvas);
    return { ctx, size };
  };

  // Run a draw loop only while `el` is on screen
  const loop = (el, draw) => {
    let raf = 0, on = false;
    const frame = (ms) => { draw(ms / 1000); if (on) raf = requestAnimationFrame(frame); };
    watch(el, (v) => {
      on = v && !reduceMotion;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(frame); else draw(performance.now() / 1000);
    });
  };

  /* ------------------------------------------------------------------ nav */
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const onScrollNav = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.nav-links a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
    }));
  }
  // highlight current section
  const navMap = new Map($$('.nav-links a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
  if (navMap.size) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const a = navMap.get(e.target.id);
      if (a && e.isIntersecting) { navMap.forEach((x) => x.classList.remove('active')); a.classList.add('active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------ reveal + counters */
  const countUp = (el) => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1100;
    if (reduceMotion) { el.textContent = end; return; }
    const step = (now) => {
      const k = clamp((now - t0) / dur);
      el.textContent = Math.round(end * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = 0; requestAnimationFrame(step);
  };
  const revealIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    revealIO.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ------------------------------------------------------------------ statement: words light up */
  const statement = $('#statement');
  if (statement) {
    const frag = document.createDocumentFragment();
    statement.childNodes.forEach((node) => {
      const cls = node.nodeType === 1 ? node.className : '';
      node.textContent.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.append(' '); return; }
        const s = document.createElement('span');
        s.className = 'w' + (cls ? ' ' + cls : ''); s.textContent = tok; frag.append(s);
      });
    });
    statement.replaceChildren(frag);
    const words = $$('.w', statement);
    const update = () => {
      const r = statement.getBoundingClientRect(), vh = innerHeight;
      const p = reduceMotion ? 1 : clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
  }

  /* ------------------------------------------------------------------ research focus: live bedside-monitor sweep */
  const scopeCanvas = $('#scope-canvas');
  if (scopeCanvas) {
    const { ctx, size } = setupCanvas(scopeCanvas);
    const traces = [
      { fn: ecg,       rgb: '255,55,95',   y: 0.40, amp: 0.20, lw: 1.8 },
      { fn: eeg,       rgb: '191,90,242',  y: 0.66, amp: 0.08, lw: 1.4 },
      { fn: slowState, rgb: '100,210,255', y: 0.86, amp: 0.06, lw: 1.6 },
    ];
    const speed = 150; // px per second
    const draw = (t) => {
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);
      const span = w / speed, head = ((t * speed) % w), chunk = 14;
      traces.forEach((tr) => {
        const base = tr.y * h, A = tr.amp * h;
        ctx.lineWidth = tr.lw; ctx.lineJoin = 'round';
        for (let x0 = 0; x0 < w; x0 += chunk) {
          // age of the sample at x0: 0 at the sweep head, growing behind it
          const age = ((head - x0) / speed + span) % span;
          if (age > span - 0.12) continue;            // gap just ahead of the head
          ctx.strokeStyle = `rgba(${tr.rgb},${(0.85 * (1 - age / span)).toFixed(3)})`;
          ctx.beginPath();
          for (let x = x0; x <= Math.min(x0 + chunk, w); x += 2) {
            const a = ((head - x) / speed + span) % span;
            if (a > span - 0.12) break;
            const y = base - tr.fn(t - a) * A;
            x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // glowing write head
        const y = base - tr.fn(t) * A;
        const g = ctx.createRadialGradient(head, y, 0, head, y, 14);
        g.addColorStop(0, `rgba(${tr.rgb},.9)`); g.addColorStop(1, `rgba(${tr.rgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head, y, 14, 0, TAU); ctx.fill();
      });
    };
    loop(scopeCanvas, draw);

    // slowly drifting HUD readouts
    const hr = $('#hud-hr'), al = $('#hud-alpha'), st = $('#hud-state');
    const r = rng(7);
    setInterval(() => {
      if (document.hidden) return;
      hr.textContent = `${Math.round(60 + r() * 6)} bpm`;
      al.textContent = `α ${(9.8 + r() * 0.8).toFixed(1)} Hz`;
      st.textContent = `calm ${(0.64 + r() * 0.14).toFixed(2)}`;
    }, 1400);
  }

  /* ------------------------------------------------------------------ IDUN: looping in-ear EEG strip */
  const eegPath = $('#eeg-path');
  if (eegPath) {
    // frequencies are integer multiples of the 400-unit period, so the loop is seamless
    const P = 400, f = (x) => {
      const k = TAU * x / P, env = 0.65 + 0.35 * Math.sin(2 * k);
      return 35 - 22 * (0.45 * env * Math.sin(24 * k) + 0.25 * Math.sin(11 * k + 1) + 0.15 * Math.sin(47 * k) + 0.12 * Math.sin(3 * k) + 0.06 * Math.sin(83 * k));
    };
    let d = '';
    for (let x = 0; x <= 2 * P; x += 1.5) d += (x ? 'L' : 'M') + x.toFixed(1) + ' ' + f(x).toFixed(2);
    eegPath.setAttribute('d', d);
  }

  /* ------------------------------------------------------------------ story: wrist → brain → state */
  const story = $('#story');
  const storyCanvas = $('#story-canvas');
  if (story && storyCanvas) {
    const { ctx, size } = setupCanvas(storyCanvas);
    const steps = $$('.story-step', story);
    const bars = $$('.story-progress i', story);
    const labels = $$('.story-labels span', story);
    let progress = 0, current = -1;

    const N = 170, pr = rng(42);
    const centers = [
      { x: 0.32, y: 0.60, rgb: '48,209,88',   label: 'calm' },
      { x: 0.70, y: 0.42, rgb: '255,55,95',   label: 'stressed' },
      { x: 0.52, y: 0.30, rgb: '100,210,255', label: 'focused' },
    ];
    const particles = Array.from({ length: N }, (_, i) => {
      const c = i % 7 < 3 ? 0 : i % 7 < 5 ? 2 : 1;
      return { c, dx: normal(pr) * 0.06, dy: normal(pr) * 0.05, ph: pr() * TAU, s: 1.2 + pr() * 1.6 };
    });

    const mono = '500 11px "SF Mono", "JetBrains Mono", ui-monospace, monospace';
    const text = (s, x, y, rgba, align = 'left') => { ctx.fillStyle = rgba; ctx.font = mono; ctx.textAlign = align; ctx.fillText(s, x, y); };

    const drawWrist = (t, a, w, h) => {
      if (a <= 0.01) return;
      ctx.save(); ctx.globalAlpha = a;
      const top = 82, bottom = h * 0.56, win = 5.5, tt = (t % (BEATS.total - 20)) + 10, s = tt - win;
      const X = (tau) => ((tau - s) / win) * w;
      const Y = (v) => bottom - ((v + 0.15) / 1.15) * (bottom - top);
      // waveform
      ctx.strokeStyle = 'rgba(255,55,95,.95)'; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= w; x += 2) { const v = ppg(s + (x / w) * win); x ? ctx.lineTo(x, Y(v)) : ctx.moveTo(x, Y(v)); }
      ctx.stroke();
      // peaks + RR brackets
      let k = beatAt(s); const peaks = [];
      for (; BEATS.list[k] && BEATS.list[k].t < tt; k++) {
        const b = BEATS.list[k], pt = b.t + 0.22 * b.rr;
        if (pt > s && pt < tt) peaks.push({ x: X(pt), y: Y(ppg(pt)), rr: b.rr });
      }
      peaks.forEach((p, i) => {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, TAU); ctx.fill();
        const n = peaks[i + 1];
        if (n) {
          const yb = top - 12;
          ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.beginPath();
          ctx.moveTo(p.x, yb + 6); ctx.lineTo(p.x, yb); ctx.lineTo(n.x, yb); ctx.lineTo(n.x, yb + 6); ctx.stroke();
          if (n.x - p.x > 54) text(`${Math.round(p.rr * 1000)} ms`, (p.x + n.x) / 2, yb - 6, 'rgba(255,255,255,.55)', 'center');
        }
      });
      // tachogram
      const tb = h * 0.64, th = h - 50 - tb, nB = 32, bw = w / nB;
      text('RR INTERVALS → HRV', 20, tb - 8, 'rgba(255,255,255,.4)');
      const last = beatAt(tt);
      for (let i = 0; i < nB; i++) {
        const b = BEATS.list[Math.max(0, last - nB + 1 + i)];
        const v = clamp((b.rr - 0.82) / 0.2), bh = 6 + v * (th - 6);
        ctx.fillStyle = `rgba(255,55,95,${0.25 + 0.6 * (i / nB)})`;
        ctx.beginPath(); ctx.roundRect(i * bw + 3, tb + th - bh, bw - 6, bh, 3); ctx.fill();
      }
      const hrNow = Math.round(60 / BEATS.list[last].rr);
      text(`HR ${hrNow} bpm   RMSSD 42 ms   SDNN 51 ms`, 20, h - 18, 'rgba(255,255,255,.75)');
      ctx.restore();
    };

    const eegY = (i, x, t, w, h) => {
      const top = 78 + i * h * 0.17, tau = t - (1 - x / w) * 3;
      return top + 30 - eeg(tau, i * 1.7) * Math.min(26, h * 0.06);
    };
    const drawBrain = (t, a, w, h) => {
      if (a <= 0.01) return;
      ctx.save(); ctx.globalAlpha = a;
      ['IN-EAR · L', 'IN-EAR · R'].forEach((lab, i) => {
        text(lab, 20, 70 + i * h * 0.17, 'rgba(255,255,255,.4)');
        ctx.strokeStyle = i ? 'rgba(191,90,242,.6)' : 'rgba(191,90,242,.95)'; ctx.lineWidth = 1.6; ctx.beginPath();
        for (let x = 0; x <= w; x += 2) { const y = eegY(i, x, t, w, h); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      });
      // band power
      const bands = [['δ', 0.35], ['θ', 0.5], ['α', 0.9], ['β', 0.45], ['γ', 0.2]];
      const by = h * 0.58, bh = h * 0.28, gap = 14, bw = (w - 40 - gap * 4) / 5;
      text('BAND POWER', 20, by - 10, 'rgba(255,255,255,.4)');
      bands.forEach(([n, v], i) => {
        const val = clamp(v + 0.08 * Math.sin(t * (1.1 + i * 0.4) + i));
        const x = 20 + i * (bw + gap), hh = val * bh;
        const g = ctx.createLinearGradient(0, by + bh, 0, by + bh - hh);
        g.addColorStop(0, 'rgba(191,90,242,.25)'); g.addColorStop(1, n === 'α' ? 'rgba(191,90,242,1)' : 'rgba(191,90,242,.6)');
        ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.roundRect(x, by, bw, bh, 8); ctx.fill();
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, by + bh - hh, bw, hh, 8); ctx.fill();
        text(n, x + bw / 2, by + bh + 20, n === 'α' ? '#fff' : 'rgba(255,255,255,.5)', 'center');
      });
      ctx.restore();
    };

    const drawState = (t, k, a, w, h) => {
      if (k <= 0.001) return;
      const area = { x: 30, y: 70, w: w - 60, h: h - 110 };
      // particles morph from the EEG trace into the embedding space
      particles.forEach((p, i) => {
        const sx = (i / (N - 1)) * w, sy = eegY(0, sx, t, w, h);
        const c = centers[p.c];
        const ex = area.x + (c.x + p.dx + 0.008 * Math.sin(t * 0.8 + p.ph)) * area.w;
        const ey = area.y + (c.y + p.dy + 0.008 * Math.cos(t * 0.7 + p.ph)) * area.h;
        const kk = smooth(0, 1, k * 1.15 - (i / N) * 0.15);
        const x = lerp(sx, ex, kk), y = lerp(sy, ey, kk);
        const rgb = kk < 0.5 ? '191,90,242' : c.rgb;
        ctx.fillStyle = `rgba(${rgb},${0.55 + 0.35 * kk})`;
        ctx.beginPath(); ctx.arc(x, y, p.s * (0.8 + 0.6 * kk), 0, TAU); ctx.fill();
      });
      if (a <= 0.01) return;
      ctx.save(); ctx.globalAlpha = a;
      centers.forEach((c) => text(c.label.toUpperCase(), area.x + c.x * area.w, area.y + (c.y - 0.16) * area.h, `rgba(${c.rgb},.9)`, 'center'));
      text('EMBEDDING SPACE', 20, h - 18, 'rgba(255,255,255,.4)');
      // current state: a point wandering between clusters, with a trail
      const pos = (tt) => {
        const m = 0.5 + 0.5 * Math.sin(tt * 0.45);
        return {
          x: area.x + (lerp(centers[0].x, centers[1].x, m) + 0.05 * Math.sin(tt * 1.3)) * area.w,
          y: area.y + (lerp(centers[0].y, centers[1].y, m) + 0.06 * Math.cos(tt * 1.1)) * area.h, m,
        };
      };
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let j = 0; j <= 40; j++) { const q = pos(t - (40 - j) * 0.05); j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
      ctx.stroke();
      const now = pos(t);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(now.x, now.y, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(now.x, now.y, 12 + 3 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      // gauge
      const gx = w - 74, gy = h - 40, R = 44, v = 0.15 + 0.7 * now.m;
      ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(gx, gy, R, Math.PI, TAU); ctx.stroke();
      const gg = ctx.createLinearGradient(gx - R, 0, gx + R, 0);
      gg.addColorStop(0, '#30d158'); gg.addColorStop(0.5, '#ffd60a'); gg.addColorStop(1, '#ff375f');
      ctx.strokeStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, R, Math.PI, Math.PI + v * Math.PI); ctx.stroke();
      ctx.lineCap = 'butt';
      text(v.toFixed(2), gx, gy - 8, '#fff', 'center');
      text('STRESS INDEX', gx, gy + 16, 'rgba(255,255,255,.5)', 'center');
      ctx.restore();
    };

    const draw = (t) => {
      const { w, h } = size; if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const p = progress;
      drawWrist(t, 1 - smooth(0.27, 0.37, p), w, h);
      drawBrain(t, smooth(0.30, 0.40, p) * (1 - smooth(0.62, 0.70, p)), w, h);
      drawState(t, smooth(0.62, 0.82, p), smooth(0.76, 0.86, p), w, h);
    };

    const onScroll = () => {
      const r = story.getBoundingClientRect(), total = story.offsetHeight - innerHeight;
      progress = clamp(-r.top / total);
      const s = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;
      if (s !== current) {
        current = s;
        steps.forEach((el, i) => el.classList.toggle('active', i === s));
        labels.forEach((el, i) => el.classList.toggle('on', i === s));
      }
      bars.forEach((b, i) => { b.style.transform = `scaleX(${clamp((progress - i / 3) * 3)})`; });
      if (reduceMotion) draw(0);
    };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
    loop(story, draw);
  }

  /* ------------------------------------------------------------------ tile graphics (generated SVG) */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const label = (parent, x, y, s, fill = 'rgba(255,255,255,.45)', anchor = 'start', size = 11) => {
    const t = el('text', { x, y, fill, 'text-anchor': anchor, 'font-size': size, 'font-family': 'SF Mono, JetBrains Mono, ui-monospace, monospace' }, parent);
    t.textContent = s; return t;
  };
  const pathFrom = (fn, x0, x1, step = 2) => {
    let d = ''; for (let x = x0; x <= x1; x += step) d += (x === x0 ? 'M' : 'L') + x.toFixed(1) + ' ' + fn(x).toFixed(2);
    return d;
  };

  const viz = {
    stress(svg) {
      // inputs → encoder → stress gauge
      const ins = [
        { lab: 'PPG', rgb: '#ff375f', f: (x) => 52 - 22 * ppg(x / 40) },
        { lab: 'EDA', rgb: '#ffd60a', f: (x) => 128 - 10 * Math.sin(x / 30) - 8 * Math.sin(x / 11) },
        { lab: 'ACC', rgb: '#64d2ff', f: (x) => 200 - 9 * Math.sin(x / 4) * Math.sin(x / 23) },
      ];
      ins.forEach((s, i) => {
        label(svg, 0, 22 + i * 74, s.lab);
        el('path', { d: pathFrom(s.f, 0, 150), stroke: s.rgb, 'stroke-width': 1.8, fill: 'none', opacity: .9 }, svg);
      });
      const defs = el('defs', {}, svg);
      const lg = el('linearGradient', { id: 'enc', x1: 0, x2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#bf5af2', 'stop-opacity': .55 }, lg);
      el('stop', { offset: 1, 'stop-color': '#64d2ff', 'stop-opacity': .55 }, lg);
      [0, 1, 2, 3].forEach((i) => {
        const hh = 210 - i * 44, x = 178 + i * 30;
        el('rect', { x, y: 128 - hh / 2, width: 20, height: hh, rx: 7, fill: 'url(#enc)', opacity: .35 + i * .18 }, svg);
      });
      label(svg, 238, 262, 'NormWear', 'rgba(255,255,255,.6)', 'middle');
      el('path', { d: 'M150 128 H172 M280 128 H318', stroke: 'rgba(255,255,255,.25)', 'stroke-dasharray': '3 4', fill: 'none' }, svg);
      // gauge
      const cx = 400, cy = 160, R = 62;
      const arc = (a0, a1) => `M${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}`;
      const gg = el('linearGradient', { id: 'gauge', x1: 0, x2: 1 }, defs);
      [['0', '#30d158'], ['.5', '#ffd60a'], ['1', '#ff375f']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gg));
      el('path', { d: arc(Math.PI, TAU), stroke: 'rgba(255,255,255,.1)', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, svg);
      el('path', { d: arc(Math.PI, TAU), stroke: 'url(#gauge)', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', opacity: .9 }, svg);
      const needle = el('line', { x1: cx, y1: cy, x2: cx - R + 14, y2: cy, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      needle.style.transformOrigin = `${cx}px ${cy}px`;
      needle.style.transition = 'transform 1.6s cubic-bezier(.22,.61,.36,1)';
      el('circle', { cx, cy, r: 6, fill: '#fff' }, svg);
      const val = label(svg, cx, cy + 40, '0.00', '#fff', 'middle', 22);
      label(svg, cx, cy + 62, 'STRESS INDEX', 'rgba(255,255,255,.5)', 'middle');
      watch(svg, (v) => {
        if (!v) return;
        const target = 0.34;
        needle.style.transform = `rotate(${target * 180}deg)`;
        const t0 = performance.now();
        const tick = (now) => { const k = clamp((now - t0) / 1600); val.textContent = (target * (1 - (1 - k) ** 3)).toFixed(2); if (k < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    },

    clusters(svg) {
      const r = rng(3);
      const cs = [
        { x: 110, y: 120, c: '#bf5af2', n: 'A' }, { x: 250, y: 70, c: '#64d2ff', n: 'B' }, { x: 370, y: 140, c: '#ff375f', n: 'C' },
      ];
      cs.forEach((c) => {
        el('ellipse', { cx: c.x, cy: c.y, rx: 72, ry: 50, fill: 'none', stroke: c.c, 'stroke-opacity': .35, 'stroke-dasharray': '3 5' }, svg);
        label(svg, c.x, c.y - 60, `PHENOTYPE ${c.n}`, c.c, 'middle', 10);
        for (let i = 0; i < 38; i++) {
          el('circle', { cx: c.x + normal(r) * 26, cy: c.y + normal(r) * 17, r: 2 + r() * 2.2, fill: c.c, opacity: .45 + r() * .5 }, svg);
        }
      });
      label(svg, 0, 214, 'VAE LATENT SPACE · z₁ / z₂');
    },

    rings(svg) {
      const cx = 110, cy = 110, rs = [[86, '#ff375f', .82, 'HRV'], [64, '#30d158', .64, 'Activity'], [42, '#64d2ff', .9, 'Diet']];
      rs.forEach(([R, c, v, n], i) => {
        el('circle', { cx, cy, r: R, stroke: c, 'stroke-opacity': .18, 'stroke-width': 16, fill: 'none' }, svg);
        const len = TAU * R;
        const ring = el('circle', { cx, cy, r: R, stroke: c, 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': `${len} ${len}`, 'stroke-dashoffset': len, transform: `rotate(-90 ${cx} ${cy})` }, svg);
        ring.style.transition = `stroke-dashoffset 1.6s cubic-bezier(.22,.61,.36,1) ${i * .15}s`;
        ring.dataset.target = len * (1 - v);
        el('circle', { cx: 236, cy: 46 + i * 26, r: 5, fill: c }, svg);
        label(svg, 248, 50 + i * 26, n.toUpperCase(), 'rgba(255,255,255,.6)');
      });
      // weekly wellness index
      const days = 'MTWTFSS'.split(''), vals = [.62, .7, .55, .78, .74, .86, .8];
      days.forEach((d, i) => {
        const x = 236 + i * 34, hh = vals[i] * 80;
        el('rect', { x, y: 200 - hh, width: 22, height: hh, rx: 6, fill: i === 5 ? '#fff' : 'rgba(255,255,255,.22)' }, svg);
        label(svg, x + 11, 216, d, 'rgba(255,255,255,.4)', 'middle', 10);
      });
      watch(svg, (v) => { if (v) $$('circle[data-target]', svg).forEach((c) => c.setAttribute('stroke-dashoffset', c.dataset.target)); });
    },

    calendar(svg) {
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'], colW = 88, x0 = 20, y0 = 70;
      const col = (s) => s < .35 ? '#30d158' : s < .6 ? '#ffd60a' : '#ff375f';
      const ev = [
        [0, 0, 2, .2], [0, 3, 2, .5], [1, 0, 1, .7], [1, 2, 3, .45], [2, 1, 2, .3], [2, 4, 2, .2],
        [3, 0, 3, .8], [3, 4, 1, .35], [4, 1, 1, .25], [4, 3, 3, .15],
      ];
      // forecasted stress curve
      const f = (x) => 40 - 18 * (0.5 + 0.5 * Math.sin((x - 20) / 70)) * (0.7 + 0.3 * Math.sin(x / 23));
      el('path', { d: pathFrom(f, 20, 460), stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '4 4' }, svg);
      label(svg, 20, 14, 'FORECAST STRESS ↗', 'rgba(255,255,255,.45)');
      days.forEach((d, i) => label(svg, x0 + i * colW + 4, y0 - 8, d, 'rgba(255,255,255,.4)', 'start', 10));
      ev.forEach(([d, s, len, stress]) => {
        el('rect', { x: x0 + d * colW, y: y0 + s * 34, width: colW - 8, height: len * 34 - 6, rx: 8, fill: col(stress), 'fill-opacity': .22, stroke: col(stress), 'stroke-opacity': .6 }, svg);
      });
    },
  };
  $$('[data-viz]').forEach((svg) => viz[svg.dataset.viz] && viz[svg.dataset.viz](svg));

  /* ------------------------------------------------------------------ tile spotlight */
  $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`);
    t.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ------------------------------------------------------------------ project filters */
  const filters = $$('.filter');
  filters.forEach((b) => b.addEventListener('click', () => {
    filters.forEach((x) => x.setAttribute('aria-pressed', x === b));
    const k = b.dataset.filter;
    $$('.card[data-kind]').forEach((c) => c.classList.toggle('hide', k !== 'all' && c.dataset.kind !== k));
  }));

  /* ------------------------------------------------------------------ "live" state monitor (for fun) */
  const monitor = $('#monitor');
  if (monitor) {
    const r = rng(11);
    const set = (k, v, txt) => { $(`[data-bar="${k}"]`, monitor).style.width = `${v * 100}%`; $(`[data-m="${k}"]`, monitor).textContent = txt; };
    const tick = () => {
      const c = 0.72 + r() * 0.24, s = 0.24 + r() * 0.3;
      set('coffee', c, `${Math.round(c * 100)}%`);
      set('stress', s, s.toFixed(2));
      set('curiosity', 1, '100%');
    };
    let id = 0;
    watch(monitor, (v) => { clearInterval(id); if (v) { tick(); id = setInterval(tick, 2600); } });
  }

  /* ------------------------------------------------------------------ latest writing */
  const writing = $('#writing-list');
  if (writing) {
    fetch('posts/index.json').then((r) => r.json()).then((posts) => {
      if (!Array.isArray(posts) || !posts.length) return;
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      writing.innerHTML = `<div class="posts">${posts.slice(0, 3).map((p) => `
        <article class="post-card">
          <time datetime="${esc(p.date)}"><svg class="i"><use href="assets/icons.svg#calendar"/></svg>${fmt(p.date)}</time>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <a class="link stretched" href="blog/post.html?post=${encodeURIComponent(p.slug)}">Read <svg class="i"><use href="assets/icons.svg#arrow-right"/></svg></a>
        </article>`).join('')}</div>`;
    }).catch(() => {});
  }

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
