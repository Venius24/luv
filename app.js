"use strict";

const RELATIONSHIP_START = new Date("2024-10-29T00:00:00");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rand = (a, b) => a + Math.random() * (b - a);

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.1, s * 0.1, -s * 0.6, -s * 0.8, 0, -s * 0.2);
  ctx.bezierCurveTo(s * 0.6, -s * 0.8, s * 1.1, s * 0.1, 0, s * 0.9);
  ctx.closePath();
}

const heartsCanvas = document.getElementById("hearts-canvas");
const hctx = heartsCanvas.getContext("2d");
let floaters = [];

function sizeHearts() {
  heartsCanvas.width = innerWidth * devicePixelRatio;
  heartsCanvas.height = innerHeight * devicePixelRatio;
  hctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
sizeHearts();
addEventListener("resize", sizeHearts);

if (!REDUCED) {
  setInterval(() => {
    if (document.hidden || floaters.length > 34) return;
    floaters.push({
      x: rand(0, innerWidth),
      y: innerHeight + 20,
      s: rand(5, 13),
      vy: rand(0.35, 0.95),
      sway: rand(0.4, 1.4),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.12, 0.4),
      hue: Math.random() < 0.25 ? "255,207,143" : "255,94,138"
    });
  }, 650);

  (function loopHearts() {
    hctx.clearRect(0, 0, innerWidth, innerHeight);
    const t = performance.now() / 1000;
    floaters = floaters.filter(f => f.y > -40);
    for (const f of floaters) {
      f.y -= f.vy;
      const x = f.x + Math.sin(t * f.sway + f.phase) * 18;
      hctx.save();
      hctx.translate(x, f.y);
      hctx.fillStyle = `rgba(${f.hue},${f.alpha})`;
      heartPath(hctx, f.s);
      hctx.fill();
      hctx.restore();
    }
    requestAnimationFrame(loopHearts);
  })();
}

const starsCanvas = document.getElementById("stars-canvas");
const sctx = starsCanvas.getContext("2d");
let stars = [];

function sizeStars() {
  const hero = document.querySelector(".hero");
  starsCanvas.width = hero.clientWidth * devicePixelRatio;
  starsCanvas.height = hero.clientHeight * devicePixelRatio;
  sctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  stars = Array.from({ length: 130 }, () => ({
    x: Math.random() * hero.clientWidth,
    y: Math.random() * hero.clientHeight,
    r: rand(0.4, 1.7),
    sp: rand(0.4, 1.6),
    ph: rand(0, Math.PI * 2)
  }));
}
sizeStars();
addEventListener("resize", sizeStars);

if (!REDUCED) {
  (function loopStars() {
    sctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    const t = performance.now() / 1000;
    for (const st of stars) {
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph));
      sctx.beginPath();
      sctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      sctx.fillStyle = `rgba(255,240,250,${a})`;
      sctx.fill();
    }
    requestAnimationFrame(loopStars);
  })();
}

const typeText = document.getElementById("type-text");
const phrases = ["Привет, любимая.", "Я сделал это для тебя.", "Здесь живёт немного нашей истории…"];
if (REDUCED) {
  typeText.textContent = phrases[0];
} else {
  let pi = 0, ci = 0, deleting = false;
  (function tick() {
    const cur = phrases[pi];
    if (!deleting) {
      ci++;
      typeText.textContent = cur.slice(0, ci);
      if (ci === cur.length) {
        deleting = true;
        setTimeout(tick, pi === phrases.length - 1 ? 3200 : 2000);
        return;
      }
      setTimeout(tick, rand(45, 75));
    } else {
      ci--;
      typeText.textContent = cur.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 500);
        return;
      }
      setTimeout(tick, 26);
    }
  })();
}

const tD = document.getElementById("t-days"),
      tH = document.getElementById("t-hours"),
      tM = document.getElementById("t-mins"),
      tS = document.getElementById("t-secs");

function pad(n) { return String(n).padStart(2, "0"); }

function updateTimer() {
  let diff = Math.max(0, Date.now() - RELATIONSHIP_START.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);
  tD.textContent = d;
  tH.textContent = pad(h);
  tM.textContent = pad(m);
  tS.textContent = pad(s);
}
updateTimer();
setInterval(updateTimer, 1000);

function spawnDomHeart(x, y, size, rise) {
  const el = document.createElement("span");
  el.className = "burst-heart";
  const inner = document.createElement("span");
  inner.className = "heart-shape";
  el.appendChild(inner);
  el.style.left = x + "px";
  el.style.top = y + "px";
  inner.style.transform = `scale(${size / 24})`;
  document.body.appendChild(el);
  const dx = rand(-130, 130);
  const dy = rise ? rand(-160, -60) : rand(-130, 130);
  el.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(${rand(0.3, 0.8)})`, opacity: 0 }
    ],
    { duration: rand(700, 1300), easing: "cubic-bezier(0.2,0.7,0.4,1)" }
  ).onfinish = () => el.remove();
}

function burstAt(x, y, n) {
  if (REDUCED) return;
  for (let i = 0; i < n; i++) setTimeout(() => spawnDomHeart(x, y, rand(10, 26), Math.random() < 0.6), i * 24);
}

function burstAtEl(el, n) {
  const r = el.getBoundingClientRect();
  burstAt(r.left + r.width / 2, r.top + r.height / 2, n);
}

const yesBtn = document.getElementById("btn-yes");
const noBtn = document.getElementById("btn-no");
const loveStage = document.getElementById("love-stage");
const loveStatus = document.getElementById("love-status");
const taunts = [
  "Нет? Уверена?",
  "Кнопка «Нет» сегодня не работает…",
  "Она боится тебя расстраивать",
  "Она убегает не просто так",
  "Ну попробуй ещё, вдруг получится",
  "Всё, она сдалась"
];
let dodges = 0;

function dodgeNo() {
  if (dodges >= 6) return;
  dodges++;
  const sr = loveStage.getBoundingClientRect();
  const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
  noBtn.style.position = "absolute";
  noBtn.style.left = rand(6, sr.width - w - 6) + "px";
  noBtn.style.top = rand(6, sr.height - h - 6) + "px";
  noBtn.style.transform = `scale(${Math.max(0.55, 1 - dodges * 0.08)}) rotate(${rand(-8, 8)}deg)`;
  yesBtn.style.transform = `scale(${Math.min(1.5, 1 + dodges * 0.1)})`;
  loveStatus.textContent = taunts[Math.min(dodges - 1, taunts.length - 1)];
  if (dodges === 6) noBtn.textContent = "ладно, да";
}

noBtn.addEventListener("pointerenter", dodgeNo);
noBtn.addEventListener("click", e => {
  e.preventDefault();
  if (dodges >= 6) return loveYes();
  dodgeNo();
});

function loveYes() {
  burstAtEl(yesBtn, 26);
  loveStatus.textContent = "Правильный ответ. Я тоже.";
  noBtn.style.visibility = "hidden";
}

yesBtn.addEventListener("click", loveYes);

const prey = document.getElementById("heart-prey");
const arena = document.getElementById("arena");
const catchStatus = document.getElementById("catch-status");
let caught = 0;
let hopTimer = null;

function hop() {
  const ar = arena.getBoundingClientRect();
  prey.style.left = rand(8, ar.width - 72) + "px";
  prey.style.top = rand(8, ar.height - 68) + "px";
}

function startHop() {
  if (hopTimer || REDUCED) return;
  hopTimer = setInterval(hop, 1100);
}

startHop();

prey.addEventListener("pointerenter", () => { if (caught < 5) hop(); });

prey.addEventListener("click", () => {
  if (caught >= 5) return;
  caught++;
  const r = prey.getBoundingClientRect();
  burstAt(r.left + r.width / 2, r.top + r.height / 2, 8);
  if (caught >= 5) {
    clearInterval(hopTimer);
    hopTimer = null;
    prey.style.display = "none";
    catchStatus.textContent = "Приз: моё сердце и так всегда было твоим.";
    burstAtEl(arena, 34);
  } else {
    catchStatus.textContent = `Поймано: ${caught} / 5`;
    hop();
  }
});

const photos = [
  { src: "photos/p01.jpg", cap: "Наш уют" },
  { src: "photos/p02.jpg", cap: "Просто мы" },
  { src: "photos/p03.jpg", cap: "Весна с тобой" },
  { src: "photos/p04.jpg", cap: "Сирень и ты" },
  { src: "photos/p05.jpg", cap: "Тёплый день" },
  { src: "photos/p06.jpg", cap: "Лучший день" },
  { src: "photos/p07.jpg", cap: "Милая птичка" },
  { src: "photos/p08.jpg", cap: "Этот взгляд" },
  { src: "photos/p09.jpg", cap: "Голубые глаза" },
  { src: "photos/p10.jpg", cap: "Твоя улыбка" },
  { src: "photos/p11.jpg", cap: "Просто красотка" }
];

const polaroids = document.getElementById("polaroids");
photos.forEach(p => {
  const fig = document.createElement("figure");
  fig.className = "polaroid";
  fig.style.transform = `rotate(${rand(-5.5, 5.5)}deg)`;
  const img = document.createElement("img");
  img.src = p.src;
  img.alt = p.cap;
  img.loading = "lazy";
  const cap = document.createElement("figcaption");
  cap.textContent = p.cap;
  fig.append(img, cap);
  polaroids.appendChild(fig);
});

const compliments = [
  "Ты красивее всех закатов, которые я видел.",
  "Твоя улыбка — моя любимая причина терять концентрацию.",
  "С тобой даже понедельники — любимые.",
  "Ты умеешь сделать день лучше одним сообщением.",
  "Твои глаза — мой любимый цвет.",
  "Рядом с тобой время летит, без тебя — ползёт.",
  "Ты смешнее всех мемов интернета.",
  "Твоё «доброе утро» работает лучше кофе.",
  "Ты — причина, по которой я улыбаюсь в телефон как дурачок.",
  "С тобой тишина комфортная, а не неловкая.",
  "Ты красивая. Просто факт. Без «но».",
  "Твой смех — мой любимый трек на повторе.",
  "Ты сильнее, чем думаешь, и нежнее, чем знаешь.",
  "Если бы красота платила налоги, ты была бы миллионершей.",
  "Ты — моё любимое уведомление.",
  "Даже твоё «хм» звучит очаровательно.",
  "Ты делаешь обычные дни незабываемыми.",
  "Лучшее, что я нашёл в интернете, — это ты."
];

const compBtn = document.getElementById("btn-compliment");
const compText = document.getElementById("compliment-text");
let lastComp = -1, compBusy = false;

compBtn.addEventListener("click", () => {
  if (compBusy) return;
  compBusy = true;
  let i;
  do { i = Math.floor(Math.random() * compliments.length); } while (i === lastComp);
  lastComp = i;
  const text = compliments[i];
  compText.textContent = "";
  if (REDUCED) {
    compText.textContent = text;
    compBusy = false;
    return;
  }
  let c = 0;
  (function type() {
    compText.textContent = text.slice(0, ++c);
    if (c < text.length) setTimeout(type, 22);
    else compBusy = false;
  })();
});

const NOTE = {
  G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63,
  F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33,
  E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
};
const melody = [
  ["A4", 1], ["C5", 1], ["E5", 1], ["A5", 1],
  ["G5", 1], ["E5", 1], ["C5", 1], ["E5", 1],
  ["F5", 1], ["A5", 1], ["C6", 1], ["A5", 1],
  ["G5", 1], ["E5", 1], ["C5", 1], ["E5", 1],
  ["D5", 1], ["F5", 1], ["A5", 1], ["F5", 1],
  ["E5", 1], ["D5", 1], ["C5", 1], ["D5", 1],
  ["E5", 2], [null, 1], ["A4", 1]
];
const bass = ["A3", "F4", "G3", "A3"];

const musicBtn = document.getElementById("btn-music");
let audio = null, playing = false, schedTimer = null, nextTime = 0, step = 0;

function ensureAudio() {
  if (audio) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const fb = ctx.createGain();
  fb.gain.value = 0.28;
  const wet = ctx.createGain();
  wet.gain.value = 0.22;
  delay.connect(fb).connect(delay);
  master.connect(ctx.destination);
  master.connect(wet).connect(delay).connect(ctx.destination);
  audio = { ctx, master };
}

function pluck(freq, when, vol, dur) {
  const { ctx, master } = audio;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = freq;
  const o2 = ctx.createOscillator();
  o2.type = "sine";
  o2.frequency.value = freq * 2;
  const g = ctx.createGain();
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vol, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(master);
  o.start(when);
  o2.start(when);
  o.stop(when + dur + 0.05);
  o2.stop(when + dur + 0.05);
}

function schedule() {
  const stepDur = 0.34;
  while (nextTime < audio.ctx.currentTime + 0.2) {
    const [note, beats] = melody[step % melody.length];
    if (note) pluck(NOTE[note], nextTime, 0.32, 1.4 * beats);
    if (step % 8 === 0) pluck(NOTE[bass[(step / 8) % bass.length]], nextTime, 0.18, 2.2);
    nextTime += stepDur * beats;
    step++;
  }
}

musicBtn.addEventListener("click", () => {
  ensureAudio();
  if (!playing) {
    audio.ctx.resume();
    nextTime = audio.ctx.currentTime + 0.1;
    step = 0;
    schedTimer = setInterval(schedule, 60);
    playing = true;
    musicBtn.textContent = "Выключить мелодию";
  } else {
    clearInterval(schedTimer);
    schedTimer = null;
    audio.ctx.suspend();
    playing = false;
    musicBtn.textContent = "Включить мелодию";
  }
});

const finaleBtn = document.getElementById("btn-finale");
const overlay = document.getElementById("finale-overlay");
const closeOverlay = document.getElementById("btn-close-overlay");

finaleBtn.addEventListener("click", () => {
  burstAtEl(finaleBtn, 60);
  setTimeout(() => overlay.classList.remove("hidden"), 450);
});

closeOverlay.addEventListener("click", () => {
  overlay.classList.add("hidden");
  burstAtEl(closeOverlay, 20);
});

overlay.addEventListener("click", e => {
  if (e.target === overlay) overlay.classList.add("hidden");
});

if (!REDUCED && window.matchMedia("(pointer: fine)").matches) {
  let lastTrail = 0;
  addEventListener("mousemove", e => {
    const now = performance.now();
    if (now - lastTrail < 80) return;
    lastTrail = now;
    spawnDomHeart(e.clientX, e.clientY, rand(7, 12), true);
  });
}

const io = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      io.unobserve(en.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => io.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
