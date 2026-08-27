/* =====================================================
   Mavmovti — Main JavaScript
   ===================================================== */

/* ============================================
   1. HERO LOAD-IN
   ============================================ */
const hero = document.getElementById('hero');
requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('loaded')));

/* ============================================
   2. TYPEWRITER EFFECT FOR HERO HEADLINE
   ============================================ */
const typewriterText = document.getElementById('typewriterText');
const cursorBlink = document.querySelector('.cursor-blink');

const fullText = 'كل لحظاتكِ الجميله،<br><em>مفيش اجمل من </em>كده';

let typewriterIndex = 0;
let isTypewriterComplete = false;
let typewriterTimer = null;
let isTyping = false;

function startTypewriter(speed = 80) {
  if (isTyping) return;
  isTyping = true;
  isTypewriterComplete = false;
  typewriterIndex = 0;
  typewriterText.innerHTML = '';
  cursorBlink.classList.add('active');

  let textToType = typewriterText.dataset.fullText || fullText;
  const chars = textToType.split('');
  let htmlBuffer = '';

  function typeNextChar() {
    if (typewriterIndex >= chars.length) {
      isTypewriterComplete = true;
      isTyping = false;
      return;
    }

    const char = chars[typewriterIndex];

    if (char === '<') {
      let tagBuffer = '<';
      typewriterIndex++;
      while (typewriterIndex < chars.length && chars[typewriterIndex] !== '>') {
        tagBuffer += chars[typewriterIndex];
        typewriterIndex++;
      }
      if (typewriterIndex < chars.length && chars[typewriterIndex] === '>') {
        tagBuffer += '>';
        typewriterIndex++;
      }
      htmlBuffer += tagBuffer;
      typewriterText.innerHTML = htmlBuffer;
      typewriterTimer = setTimeout(typeNextChar, speed);
      return;
    }

    htmlBuffer += char;
    typewriterText.innerHTML = htmlBuffer;
    typewriterIndex++;

    const nextSpeed = speed + (Math.random() * 40 - 20);
    typewriterTimer = setTimeout(typeNextChar, Math.max(30, nextSpeed));
  }

  setTimeout(typeNextChar, 500);
}

function resetTypewriter(newText) {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
  isTyping = false;
  isTypewriterComplete = false;
  typewriterIndex = 0;

  if (newText) {
    typewriterText.dataset.fullText = newText;
  }

  startTypewriter(80);
}

setTimeout(() => {
  typewriterText.innerHTML = '';
  typewriterText.dataset.fullText = fullText;
  startTypewriter(80);
}, 800);

/* ============================================
   3. HERO SPOTLIGHT (mouse-following bright layer)
   ============================================ */
const bright = document.getElementById('brightLayer');
let mx = 50, my = 32, tx = 50, ty = 32;
let userActive = false, idleTimer = null;

function setTarget(xPct, yPct) {
  tx = xPct; ty = yPct;
}

hero.addEventListener('mousemove', (e) => {
  const r = hero.getBoundingClientRect();
  const xPct = ((e.clientX - r.left) / r.width) * 100;
  const yPct = ((e.clientY - r.top) / r.height) * 100;
  setTarget(xPct, yPct);
  userActive = true;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => userActive = false, 2200);
});

hero.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  const r = hero.getBoundingClientRect();
  const xPct = ((t.clientX - r.left) / r.width) * 100;
  const yPct = ((t.clientY - r.top) / r.height) * 100;
  setTarget(xPct, yPct);
  userActive = true;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => userActive = false, 2200);
}, { passive: true });

let t = 0;
function animate() {
  t += 0.0032;
  if (!userActive) {
    tx = 50 + Math.sin(t) * 34;
    ty = 34 + Math.sin(t * 1.7) * 16;
  }
  mx += (tx - mx) * 0.06;
  my += (ty - my) * 0.06;
  bright.style.setProperty('--mx', mx + '%');
  bright.style.setProperty('--my', my + '%');
  requestAnimationFrame(animate);
}
animate();

/* ============================================
   4. FIREFLIES
   ============================================ */
const fireflyLayer = document.getElementById('fireflies');
const NUM_FIREFLIES = 22;
for (let i = 0; i < NUM_FIREFLIES; i++) {
  const f = document.createElement('div');
  f.className = 'firefly';
  const left = Math.random() * 100;
  const delay = Math.random() * 9;
  const duration = 7 + Math.random() * 6;
  const dx = (Math.random() * 60 - 30) + 'px';
  f.style.left = left + '%';
  f.style.animationDelay = delay + 's';
  f.style.animationDuration = duration + 's';
  f.style.setProperty('--dx', dx);
  fireflyLayer.appendChild(f);
}

/* ============================================
   5. CURSOR FIREFLY TRAILS
   ============================================ */
(function() {
  const cursorTrailLayer = document.getElementById('cursorTrailLayer');
  if (!cursorTrailLayer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const leader = document.createElement('div');
  leader.className = 'cursor-leader';
  cursorTrailLayer.appendChild(leader);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let lastSpawnX = targetX;
  let lastSpawnY = targetY;
  let isActive = false;
  let hideTimer = null;
  let lastMoveTime = 0;

  function updateTarget(x, y) {
    targetX = x;
    targetY = y;
    if (!isActive) {
      isActive = true;
      leader.classList.add('active');
    }
    lastMoveTime = Date.now();
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      isActive = false;
      leader.classList.remove('active');
    }, 900);
  }

  window.addEventListener('mousemove', (e) => { updateTarget(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchstart', (e) => {
    if (e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function spawnFly(x, y, isFast) {
    const el = document.createElement('div');
    const isRose = Math.random() < 0.3;
    el.className = 'trail-fly' + (isRose ? ' rose' : '');
    const size = isFast ? (4 + Math.random() * 6) : (2.4 + Math.random() * 3.8);
    const glow = size * 1.9 + Math.random() * 7;
    el.style.setProperty('--size', size + 'px');
    el.style.setProperty('--glow', glow + 'px');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    cursorTrailLayer.appendChild(el);

    const driftX = (Math.random() - 0.5) * (isFast ? 140 : 70);
    const driftY = (Math.random() - 0.5) * (isFast ? 120 : 60) - 12;
    const scaleEnd = 0.15 + Math.random() * 0.45;
    const duration = (isFast ? 600 : 850) + Math.random() * 750;

    const anim = el.animate([
      { transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 0.95 },
      { transform: `translate(-50%,-50%) translate(${driftX * 0.28}px, ${driftY * 0.28}px) scale(1)`, opacity: 0.88, offset: 0.22 },
      { transform: `translate(-50%,-50%) translate(${driftX}px, ${driftY}px) scale(${scaleEnd})`, opacity: 0 }
    ], {
      duration,
      easing: 'cubic-bezier(.22,.61,.36,1)',
      fill: 'forwards'
    });
    anim.onfinish = () => el.remove();
    setTimeout(() => { if (el.parentNode) el.remove(); }, duration + 120);
  }

  function burstAt(x, y) {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnFly(x + (Math.random() - 0.5) * 18, y + (Math.random() - 0.5) * 18, true), i * 28);
    }
  }

  window.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .polaroid, .envelope-card')) return;
    burstAt(e.clientX, e.clientY);
  });

  function loop() {
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;
    leader.style.left = currentX + 'px';
    leader.style.top = currentY + 'px';

    const dist = Math.hypot(targetX - lastSpawnX, targetY - lastSpawnY);
    const movingRecently = Date.now() - lastMoveTime < 120;

    if (movingRecently && dist > 4) {
      const speed = Math.min(dist, 42);
      const isFast = speed > 16;
      const count = isFast ? 2 : 1;

      for (let i = 0; i < count; i++) {
        const jx = targetX + (Math.random() - 0.5) * 10;
        const jy = targetY + (Math.random() - 0.5) * 10;
        spawnFly(jx, jy, isFast);
      }

      if (Math.random() < 0.22) {
        const behindX = currentX + (targetX - currentX) * -0.18 + (Math.random() - 0.5) * 12;
        const behindY = currentY + (targetY - currentY) * -0.18 + (Math.random() - 0.5) * 12;
        spawnFly(behindX, behindY, false);
      }

      if (isFast && Math.random() < 0.45) {
        spawnFly(targetX, targetY, true);
      }

      lastSpawnX = targetX;
      lastSpawnY = targetY;
    }

    requestAnimationFrame(loop);
  }
  loop();
})();

/* ============================================
   6. AMBIENT ROSE PETALS
   ============================================ */
const petalLayer = document.getElementById('ambientPetals');
const NUM_PETALS = 32;

for (let i = 0; i < NUM_PETALS; i++) {
  const p = document.createElement('div');
  p.className = 'petal';

  const size = 8 + Math.random() * 8;
  const left = Math.random() * 100;
  const delay = Math.random() * 18;
  const duration = 14 + Math.random() * 14;
  const swayMid = (Math.random() * 70 - 35) + 'px';
  const swayEnd = (Math.random() * 110 - 55) + 'px';
  const rotStart = (Math.random() * 360) + 'deg';
  const opacity = 0.28 + Math.random() * 0.22;

  p.style.left = left + '%';
  p.style.setProperty('--pw', size + 'px');
  p.style.setProperty('--sway-mid', swayMid);
  p.style.setProperty('--sway-end', swayEnd);
  p.style.setProperty('--rot-start', rotStart);
  p.style.setProperty('--petal-opacity', opacity.toFixed(2));
  p.style.animationDelay = delay + 's';
  p.style.animationDuration = duration + 's';

  petalLayer.appendChild(p);
}

/* ============================================
   7. HEADLINE SWIPE BUTTON
   ============================================ */
const headlinePhrases = [
  { headline: 'كل لحظاتكِ الصغيرة،<br><em>دفعة</em> واحدة', subtext: 'كل يوم بشوفك بتبقي احلا من اليوم اللي قبلو' },
  { headline: 'كل ضحكة، وكل تفصيلة<br>صغيرة <em>فيكي</em>', subtext: 'مفكيش غلطة واحده' },
  { headline: 'كلّكِ،<br><em>دائماً</em>', subtext: 'كل يوم بتفرج علي صورك اللي بتبعتيهالي' },
  { headline: 'أجمل شخص<br>دخل <em>حياتي</em>', subtext: 'انتي مينفعش تتقارني ب اي بنت عشان مفيش منك اتنين' }
];
let headlineIndex = 0;
let headlineAnimating = false;
const headlineEl = document.getElementById('headlineText');
const subtextEl = document.getElementById('subtextText');
const headlineBtn = document.getElementById('headlineBtn');

headlineBtn.addEventListener('click', function(e) {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
  isTyping = false;

  if (headlineAnimating) return;
  headlineAnimating = true;

  headlineEl.classList.add('out-left');
  subtextEl.classList.add('out-left');

  setTimeout(() => {
    headlineIndex = (headlineIndex + 1) % headlinePhrases.length;
    const newHeadlineHTML = headlinePhrases[headlineIndex].headline;
    subtextEl.innerHTML = headlinePhrases[headlineIndex].subtext;

    typewriterText.dataset.fullText = newHeadlineHTML;
    typewriterText.innerHTML = '';
    typewriterIndex = 0;
    isTypewriterComplete = false;

    startTypewriter(80);

    headlineEl.classList.remove('out-left');
    subtextEl.classList.remove('out-left');
    headlineEl.classList.add('in-right');
    subtextEl.classList.add('in-right');

    void headlineEl.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        headlineEl.classList.remove('in-right');
        subtextEl.classList.remove('in-right');
      });
    });

    setTimeout(() => { headlineAnimating = false; }, 700);
  }, 600);
});

/* ============================================
   8. TOGETHER COUNTER (from Nov 23, 2025)
   ============================================ */
const TOGETHER_START = new Date(2025, 10, 23, 0, 0, 0, 0);
const togetherDays = document.getElementById('togetherDays');
const togetherHours = document.getElementById('togetherHours');
const togetherMins = document.getElementById('togetherMins');

function updateTogetherCounter() {
  const diff = Math.max(0, Date.now() - TOGETHER_START.getTime());
  togetherDays.textContent = Math.floor(diff / 86400000);
  togetherHours.textContent = Math.floor((diff % 86400000) / 3600000);
  togetherMins.textContent = Math.floor((diff % 3600000) / 60000);
}

updateTogetherCounter();
setInterval(updateTogetherCounter, 1000);

/* ============================================
   9. PROPOSAL — DODGING "NO" BUTTON
   ============================================ */
const noPhrases = [
  "لأ", "استني، لأ", "لحظة...", "خليني افكر", "في الحقيقة...",
  "همم", "لا ابدا", "جرب تاني", "مش بالظبط", "قربت اوي",
  "محاولة حلوة", "!كدا كدا", "بتسخن", "بتبرد", "فكر تاني",
  "متأكد؟", "جد؟", "فكر تاني كمان", "الفرصة الأخيرة", "متأكد من كده؟",
  "ده غلط املائي", "التصحيح التلقائي: أيوه", "404", "ده مش الزرار", "اجابة غلط",
  "دخول مرفوض", "بس برضو محاولة حلوة", "مش هيحصل", "مش فاكر", "أيوه هناك ←"
];
let noIndex = 0;
const stage = document.getElementById('stage');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const proposalResult = document.getElementById('proposalResult');

let lastDodgeAt = 0;
const DODGE_COOLDOWN = 650;
let prevSpot = null;

function pickFarSpot(stageRect, btnRect, mouseX, mouseY) {
  const yesRect = yesBtn.getBoundingClientRect();
  const w = btnRect.width, h = btnRect.height;
  const maxLeft = Math.max(8, stageRect.width - w - 8);
  const maxTop = Math.max(8, stageRect.height - h - 8);

  const yesCenterX = (yesRect.left - stageRect.left) + yesRect.width / 2;
  const yesCenterY = (yesRect.top - stageRect.top) + yesRect.height / 2;
  const mouseLocalX = mouseX - stageRect.left;
  const mouseLocalY = mouseY - stageRect.top;

  const minGapFromYes = (w + yesRect.width) / 2 + 46;
  const minGapFromPrev = Math.min(stageRect.width, stageRect.height) * 0.45;
  const cursorBuffer = 30;

  const candidates = [];
  for (let i = 0; i < 80; i++) {
    const left = 8 + Math.random() * (maxLeft - 8);
    const top = 8 + Math.random() * (maxTop - 8);
    const centerX = left + w / 2;
    const centerY = top + h / 2;
    const distFromYes = Math.hypot(centerX - yesCenterX, centerY - yesCenterY);
    const distFromMouse = Math.hypot(centerX - mouseLocalX, centerY - mouseLocalY);
    const distFromPrev = prevSpot
      ? Math.hypot(centerX - (prevSpot.left + w / 2), centerY - (prevSpot.top + h / 2))
      : Infinity;
    const cursorInside =
      mouseLocalX >= left - cursorBuffer && mouseLocalX <= left + w + cursorBuffer &&
      mouseLocalY >= top - cursorBuffer && mouseLocalY <= top + h + cursorBuffer;
    candidates.push({ left, top, distFromYes, distFromMouse, distFromPrev, cursorInside });
  }

  const safe = candidates.filter(c => !c.cursorInside);
  const pool = safe.length ? safe : candidates.sort((a, b) => b.distFromMouse - a.distFromMouse);

  let pick = pool
    .filter(c => c.distFromYes >= minGapFromYes && c.distFromPrev >= minGapFromPrev)
    .sort((a, b) => b.distFromMouse - a.distFromMouse)[0];

  if (!pick) {
    pick = pool
      .filter(c => c.distFromYes >= minGapFromYes)
      .sort((a, b) => b.distFromPrev - a.distFromPrev)[0];
  }

  if (!pick) {
    pick = pool.sort((a, b) => b.distFromYes - a.distFromYes)[0];
  }

  prevSpot = { left: pick.left, top: pick.top };
  return pick;
}

function dodgeNoButton(clientX, clientY) {
  if (stage.hidden || stage.dataset.settled) return;

  const stageRect = stage.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;
  const dist = Math.hypot(clientX - btnCenterX, clientY - btnCenterY);
  const threshold = 100;
  if (dist >= threshold) return;

  const now = Date.now();
  const isDirectlyOver = clientX >= btnRect.left && clientX <= btnRect.right &&
    clientY >= btnRect.top && clientY <= btnRect.bottom;
  if (now - lastDodgeAt < DODGE_COOLDOWN && !isDirectlyOver) return;
  lastDodgeAt = now;

  if (!noBtn.classList.contains('roaming')) {
    noBtn.style.left = (btnRect.left - stageRect.left) + 'px';
    noBtn.style.top = (btnRect.top - stageRect.top) + 'px';
    noBtn.classList.add('roaming');
    void noBtn.offsetWidth;
  }

  const spot = pickFarSpot(stageRect, btnRect, clientX, clientY);
  noBtn.style.left = spot.left + 'px';
  noBtn.style.top = spot.top + 'px';

  noIndex = (noIndex + 1) % noPhrases.length;
  noBtn.textContent = noPhrases[noIndex];
}

document.addEventListener('mousemove', (e) => dodgeNoButton(e.clientX, e.clientY));
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  dodgeNoButton(t.clientX, t.clientY);
}, { passive: false });

/* ============================================
   10. HEART BURST & PETAL FALL (Proposal)
   ============================================ */
function spawnHeartBurst(originEl) {
  const rect = originEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  for (let i = 0; i < 16; i++) {
    const h = document.createElement('div');
    h.className = 'burst-heart';
    h.textContent = '♥';
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 90;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 40;
    h.style.left = originX + 'px';
    h.style.top = originY + 'px';
    h.style.setProperty('--tx', tx + 'px');
    h.style.setProperty('--ty', ty + 'px');
    h.style.fontSize = (14 + Math.random() * 10) + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }
}

function spawnPetalFall() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = 46;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const isRibbon = Math.random() < 0.35;
    p.className = 'petal ' + (isRibbon ? 'shape-ribbon' : 'shape-oval');
    const startX = Math.random() * window.innerWidth;
    const duration = 2.8 + Math.random() * 1.8;
    const delay = Math.random() * 0.7;
    const drift = (Math.random() * 160 - 80) + 'px';
    const spin = (Math.random() * 360 + 180) + 'deg';
    p.style.left = startX + 'px';
    p.style.setProperty('--drift', drift);
    p.style.setProperty('--spin', spin);
    p.style.animationDuration = duration + 's';
    p.style.animationDelay = delay + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), (duration + delay) * 1000 + 200);
  }
}

const questionButtons = document.getElementById('questionButtons');

yesBtn.addEventListener('click', () => {
  stage.dataset.settled = 'true';
  spawnHeartBurst(yesBtn);
  spawnPetalFall();
  questionButtons.style.opacity = '0';
  questionButtons.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    questionButtons.hidden = true;
    proposalResult.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => proposalResult.classList.add('in')));
  }, 380);
});

/* ============================================
   11. PHOTO CAROUSEL (Scrapbook Polaroids)
   ============================================ */
const carouselViewport = document.querySelector('.carousel-viewport');
const polaroidTrack = document.getElementById('polaroidTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let carouselOffset = 0;

function stepSize() {
  const first = polaroidTrack.children[0];
  const gap = parseFloat(getComputedStyle(polaroidTrack).gap) || 26;
  return first.getBoundingClientRect().width + gap;
}

function maxOffset() {
  return Math.max(0, polaroidTrack.scrollWidth - carouselViewport.clientWidth);
}

function updateCarousel() {
  carouselOffset = Math.min(Math.max(carouselOffset, 0), maxOffset());
  polaroidTrack.style.transform = `translateX(-${carouselOffset}px)`;
  prevBtn.disabled = carouselOffset <= 0;
  nextBtn.disabled = carouselOffset >= maxOffset() - 1;
}

prevBtn.addEventListener('click', () => { carouselOffset -= stepSize(); updateCarousel(); });
nextBtn.addEventListener('click', () => { carouselOffset += stepSize(); updateCarousel(); });
window.addEventListener('resize', updateCarousel);
updateCarousel();

/* ============================================
   12. OUR STORY — TAP THE ORB
   ============================================ */
const storyData = [
  { date: '٢٣ نوفمبر ٢٠٢٥', message: 'أول رسالة بعتها لكي في يوم ميلادك، وضحكنا مع بعض كتير، وشوفتك شخص جميل وطيّب وبيحب الهزار، ومش واخد الكلام على قلبه، وقفلنا اليوم ده على كده.' },
  { date: '٢٤ نوفمبر ٢٠٢٥', message: 'متكلمناش وقتها، بس كنت شايف ستوريهاتك الكتير ساعتها وبرضو قلت: خلاص، البنت دي بتفرح وبتحب الناس وكلامها حلو.' },
  { date: '٢٥ نوفمبر ٢٠٢٥', message: 'من هنا بدأنا نتكلم، بعت لك على عيد ميلادك وبردو فضلنا نهزر كتير، واتعرفت على الجميل اللي بكلمه، وقعدنا نتكلم معظم الوقت مع بعض.' },
  { date: '٢٥ ديسمبر ٢٠٢٥', message: 'جيت وقلت لك إني معجب بيكي وعايزك تبقي ليا، وحبيت كل حاجة فيكي من أول يوم اتكلمنا فيه، وأنا شايف ملاك مفيهوش غلطة، وحسيت إن لازم أخش وأقولك إني بحبك وعايز يبقى في بينا حاجة.' },
  { date: 'مارس ٢٠٢٦', message: 'مرينا بأوقات صعبة، ومكناش عارفين هنكمل ولا لأ. حبيت الكلام معاكي جدًا بس كنت خايف عليكي جدًا من أي حاجة، حتى من نفسي. واتعلمت إن أي حاجة بتحبها لازم تخلي بالك منها، وأنا محبتش في يوم أكون سبب في إني أشوفك زعلانة أو متأذية بسببي.' },
  { date: 'أبريل ٢٠٢٦', message: 'جربت كل حاجة عشان أرجعك تاني، تبقي ليا، وحاربت عشانك وعملت حاجات كتير أوي. وأول ما عرفت إني كسبت، جيت واتقدمت لك من أول وجديد، مع إنك كنتِ مضايقة من إن بقالنا شهر مش بنتكلم. بس أنا مكنتش مضايق من نفسي، على قد ما كنت ممكن أبقى مضايق أوي لو كنت سبب في إنك تكوني متأذية. وحاولت على قد ما أقدر أرجعك تاني ليا، وأشيل الزعل اللي كان بسبب الشهر اللي متكلمناش فيه، وفي الآخر بقيتي ليا وبتاعتي كمان.' }
];
let storyIndex = 0;
let storyBusy = false;
const storyStage = document.getElementById('storyStage');
const storyOrb = document.getElementById('storyOrb');
const storyContent = document.getElementById('storyContent');
const storyDateEl = document.getElementById('storyDate');
const storyMessageEl = document.getElementById('storyMessage');

function moveStoryOrb() {
  const stageRect = storyStage.getBoundingClientRect();
  const orbSize = 70;
  const maxX = Math.max(0, stageRect.width / 2 - orbSize / 2 - 20);
  const maxY = Math.max(0, stageRect.height / 2 - orbSize / 2 - 20);
  const x = (Math.random() * 2 - 1) * maxX;
  const y = (Math.random() * 2 - 1) * maxY;
  storyOrb.style.left = `calc(50% + ${x}px)`;
  storyOrb.style.top = `calc(50% + ${y}px)`;
}

storyOrb.addEventListener('click', () => {
  if (storyBusy) return;
  storyBusy = true;
  storyOrb.classList.add('is-hidden');

  const entry = storyData[storyIndex];
  storyDateEl.textContent = entry.date;
  storyMessageEl.textContent = entry.message;
  storyMessageEl.classList.toggle('is-long', entry.message.length > 55);
  storyContent.classList.add('show');

  setTimeout(() => {
    storyContent.classList.remove('show');
    setTimeout(() => {
      storyIndex++;

      if (storyIndex >= storyData.length) {
        showStoryRecap();
        return;
      }

      moveStoryOrb();
      storyOrb.classList.remove('is-hidden');
      storyBusy = false;
    }, 600);
  }, 15000);
});

function showStoryRecap() {
  const storyRecap = document.getElementById('storyRecap');
  const leftItems = storyData.slice(0, 3);
  const rightItems = storyData.slice(3, 6);

  const renderItem = (entry) => `
    <div class="story-recap-item">
      <div class="story-recap-date">${entry.date}</div>
      <p class="story-recap-message">${entry.message}</p>
    </div>
  `;

  storyRecap.innerHTML = `
    <div class="story-recap-col">${leftItems.map(renderItem).join('')}</div>
    <div class="story-recap-col">${rightItems.map(renderItem).join('')}</div>
    <div class="story-recap-final-col">
      <div class="story-recap-final">ومن هنا،<br>للأبد. ♥</div>
    </div>
  `;
  storyStage.style.opacity = '0';
  setTimeout(() => {
    storyStage.hidden = true;
    storyRecap.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => storyRecap.classList.add('in')));
  }, 500);
}

/* ============================================
   13. PARALLAX DEPTH ON SCROLL
   ============================================ */
const heroParallax = document.getElementById('heroParallax');
const parallaxCards = document.querySelectorAll('.reason-card');
let parallaxTicking = false;

function updateParallax() {
  const heroRect = hero.getBoundingClientRect();
  heroParallax.style.transform = `translateY(${heroRect.top * -0.15}px)`;

  parallaxCards.forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    const speed = 0.05 + (i % 3) * 0.03;
    const distanceFromCenter = (window.innerHeight / 2) - (rect.top + rect.height / 2);
    const drift = Math.max(-26, Math.min(26, distanceFromCenter * speed));
    card.style.setProperty('--drift', drift.toFixed(1) + 'px');
  });

  parallaxTicking = false;
}

window.addEventListener('scroll', () => {
  if (!parallaxTicking) {
    requestAnimationFrame(updateParallax);
    parallaxTicking = true;
  }
}, { passive: true });

updateParallax();

/* ============================================
   14. POLAROID LIGHTBOX
   ============================================ */
const lightbox = document.getElementById('lightbox');
const lightboxPhoto = document.getElementById('lightboxPhoto');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const allPolaroids = Array.from(document.querySelectorAll('.polaroid[data-photo]'));
let lightboxIndex = 0;

function openLightbox(index) {
  lightboxIndex = (index + allPolaroids.length) % allPolaroids.length;
  const item = allPolaroids[lightboxIndex];
  lightboxCaption.classList.remove('active');
  lightboxPhoto.style.backgroundImage = `url('${item.dataset.photo}')`;
  lightboxCaption.textContent = item.dataset.caption || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

allPolaroids.forEach((item, index) => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightboxPrev.addEventListener('click', () => openLightbox(lightboxIndex - 1));
lightboxNext.addEventListener('click', () => openLightbox(lightboxIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
  if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
});

/* ============================================
   15. MUSIC TOGGLE
   ============================================ */
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const MUSIC_TARGET_VOLUME = 0.35;
let musicFadeInterval = null;

function fadeMusic(target, duration, onDone) {
  clearInterval(musicFadeInterval);
  const startVolume = bgMusic.volume;
  const startTime = performance.now();
  musicFadeInterval = setInterval(() => {
    const progress = Math.min((performance.now() - startTime) / duration, 1);
    bgMusic.volume = startVolume + (target - startVolume) * progress;
    if (progress >= 1) {
      clearInterval(musicFadeInterval);
      if (onDone) onDone();
    }
  }, 40);
}

const musicPlaylist = ['song.mp3', 'song2.mp3'];
let musicTrackIndex = 0;

bgMusic.addEventListener('ended', () => {
  musicTrackIndex = (musicTrackIndex + 1) % musicPlaylist.length;
  bgMusic.src = musicPlaylist[musicTrackIndex];
  bgMusic.play().catch(() => {});
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.volume = 0;
    bgMusic.play().catch(() => {});
    fadeMusic(MUSIC_TARGET_VOLUME, 1800);
    musicToggle.classList.add('playing');
    musicToggle.setAttribute('aria-label', 'pause music');
  } else {
    fadeMusic(0, 900, () => bgMusic.pause());
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-label', 'play soft music');
  }
});

/* ============================================
   16. ENVELOPE CARDS — OPEN/CLOSE
   ============================================ */
const envelopeCards = document.querySelectorAll('.envelope-card');

envelopeCards.forEach((card) => {
  const envelope = card.querySelector('.envelope');
  envelope.addEventListener('click', function(e) {
    e.stopPropagation();
    if (card.classList.contains('opened')) return;
    card.classList.add('opened');
  });

  const letter = card.querySelector('.envelope-letter');
  letter.addEventListener('click', function(e) {
    e.stopPropagation();
    card.classList.remove('opened');
  });
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.envelope-card')) {
    envelopeCards.forEach(card => {
      card.classList.remove('opened');
    });
  }
});

/* ============================================
   17. LOCKED FUTURE LETTER — BIRTHDAY COUNTDOWN
   ============================================ */
const letterLocked = document.getElementById('letterLocked');
const letterUnlocked = document.getElementById('letterUnlocked');
const letterDaysEl = document.getElementById('letterDays');
const letterHoursEl = document.getElementById('letterHours');
const letterMinsEl = document.getElementById('letterMins');
const letterSecsEl = document.getElementById('letterSecs');
let letterInterval = null;
let letterIsUnlocked = false;

function getNextBirthday() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 10, 23, 0, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target = new Date(now.getFullYear() + 1, 10, 23, 0, 0, 0, 0);
  }
  return target;
}

function spawnStarBurst(originEl) {
  const rect = originEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('div');
    s.className = 'burst-star';
    s.textContent = '✦';
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 110;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 50;
    s.style.left = originX + 'px';
    s.style.top = originY + 'px';
    s.style.setProperty('--tx', tx + 'px');
    s.style.setProperty('--ty', ty + 'px');
    s.style.fontSize = (12 + Math.random() * 12) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

const spotlightOverlay = document.getElementById('spotlightOverlay');
const futureLetterSection = document.getElementById('futureLetter');

const spotlightObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (letterIsUnlocked && entry.isIntersecting) {
      spotlightOverlay.classList.add('active');
      futureLetterSection.classList.add('spotlight-active');
    } else {
      spotlightOverlay.classList.remove('active');
      futureLetterSection.classList.remove('spotlight-active');
    }
  });
}, { threshold: 0.35 });
spotlightObserver.observe(futureLetterSection);

function unlockLetter() {
  if (letterInterval) clearInterval(letterInterval);
  letterIsUnlocked = true;
  spotlightOverlay.classList.add('active');
  futureLetterSection.classList.add('spotlight-active');

  const seal = document.getElementById('letterSeal');
  seal.classList.add('cracking');
  spawnStarBurst(seal);

  setTimeout(() => {
    letterLocked.style.opacity = '0';
    setTimeout(() => {
      letterLocked.hidden = true;
      letterUnlocked.hidden = false;

      letterUnlocked.classList.add('in');
      const paper = document.getElementById('letterPaper');

      paper.classList.remove('unfold-in');
      const allLines = paper.querySelectorAll('.letter-line');
      allLines.forEach(line => {
        line.classList.remove('ink-in');
      });
      const readAgainBtn = document.getElementById('readAgainBtn');
      readAgainBtn.classList.remove('in');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        paper.classList.add('unfold-in');

        setTimeout(() => {
          const lines = paper.querySelectorAll('.letter-line');
          lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('ink-in'), i * 4000);
          });
          setTimeout(() => {
            readAgainBtn.classList.add('in');
          }, lines.length * 4000 + 500);
        }, 700);
      }));
    }, 400);
  }, 650);
}

function replayLetter() {
  const paper = document.getElementById('letterPaper');
  const allLines = paper.querySelectorAll('.letter-line');
  const readAgainBtn = document.getElementById('readAgainBtn');

  allLines.forEach(line => { line.classList.remove('ink-in'); });
  readAgainBtn.classList.remove('in');
  paper.classList.remove('unfold-in');

  void paper.offsetWidth;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    paper.classList.add('unfold-in');

    setTimeout(() => {
      allLines.forEach((line, i) => {
        setTimeout(() => line.classList.add('ink-in'), i * 4000);
      });
      setTimeout(() => {
        readAgainBtn.classList.add('in');
      }, allLines.length * 4000 + 500);
    }, 700);
  }));
}

document.getElementById('readAgainBtn').addEventListener('click', replayLetter);

function updateLetterCountdown() {
  const diff = getNextBirthday().getTime() - Date.now();
  if (diff <= 0) {
    if (!letterIsUnlocked) {
      unlockLetter();
    }
    return;
  }
  letterDaysEl.textContent = Math.floor(diff / 86400000);
  letterHoursEl.textContent = Math.floor((diff % 86400000) / 3600000);
  letterMinsEl.textContent = Math.floor((diff % 3600000) / 60000);
  letterSecsEl.textContent = Math.floor((diff % 60000) / 1000);
}

letterInterval = setInterval(updateLetterCountdown, 1000);
updateLetterCountdown();

/* ============================================
   18. WATER RIPPLE HOVER EFFECT (Scrapbook)
   ============================================ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rippleSections = document.querySelectorAll('.scrapbook.has-water-ripple');
  rippleSections.forEach(section => {
    let layer = section.querySelector('.water-ripple-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'water-ripple-layer';
      layer.setAttribute('aria-hidden', 'true');
      section.appendChild(layer);
    }

    let lastX = -100, lastY = -100;
    let lastTime = 0;
    let isHovering = false;

    function getPos(e) {
      const rect = section.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    }

    function spawnWaterRipple(x, y) {
      const group = document.createElement('div');
      group.className = 'ripple-group';
      group.style.left = x + 'px';
      group.style.top = y + 'px';

      const count = 2 + (Math.random() < 0.45 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const r = document.createElement('div');
        r.className = 'ripple gold';
        r.style.animationDelay = (i * 0.16) + 's';
        r.style.animationDuration = (1.4 + i * 0.5 + Math.random() * 0.4) + 's';
        if (i === 1) {
          r.style.width = (10 + Math.random() * 8) + 'px';
          r.style.height = r.style.width;
          r.style.marginLeft = -(parseFloat(r.style.width) / 2) + 'px';
          r.style.marginTop = r.style.marginLeft;
        }
        group.appendChild(r);
      }

      layer.appendChild(group);
      setTimeout(() => group.remove(), 2400);
    }

    section.addEventListener('mouseenter', (e) => {
      isHovering = true;
      section.classList.add('is-hovering');
      const p = getPos(e);
      lastX = p.x; lastY = p.y;
      spawnWaterRipple(p.x, p.y);
    });

    section.addEventListener('mouseleave', () => {
      isHovering = false;
      section.classList.remove('is-hovering');
    });

    section.addEventListener('mousemove', (e) => {
      if (!isHovering) return;
      const now = Date.now();
      if (now - lastTime < 110) return;
      const p = getPos(e);
      const dist = Math.hypot(p.x - lastX, p.y - lastY);
      if (dist < 18) return;
      section.style.setProperty('--rx', p.x + 'px');
      section.style.setProperty('--ry', p.y + 'px');
      if (dist > 40 || Math.random() < 0.7) {
        spawnWaterRipple(p.x, p.y);
        lastX = p.x; lastY = p.y;
        lastTime = now;
      }
    }, { passive: true });

    section.addEventListener('click', (e) => {
      const p = getPos(e);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnWaterRipple(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20), i * 90);
      }
    });

    section.addEventListener('touchstart', (e) => {
      isHovering = true;
      section.classList.add('is-hovering');
      const p = getPos(e);
      spawnWaterRipple(p.x, p.y);
    }, { passive: true });

    section.addEventListener('touchmove', (e) => {
      const now = Date.now();
      if (now - lastTime < 160) return;
      const p = getPos(e);
      spawnWaterRipple(p.x, p.y);
      section.style.setProperty('--rx', p.x + 'px');
      section.style.setProperty('--ry', p.y + 'px');
      lastTime = now;
    }, { passive: true });

    section.addEventListener('touchend', () => {
      isHovering = false;
      section.classList.remove('is-hovering');
    });
  });
})();

/* ============================================
   19. SCROLL REVEAL (Intersection Observer)
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach((el, i) => {
  el.style.transitionDelay = (i % 5) * 0.08 + 's';
  io.observe(el);
});

/* ============================================
   20. MEMORY GAME LOGIC
   ============================================ */
(function() {
  const allImages = [
    '18 Pictures/1.jpg', '18 Pictures/2.jpg', '18 Pictures/3.jpg', '18 Pictures/4.jpg',
    '18 Pictures/5.jpg', '18 Pictures/6.jpg', '18 Pictures/7.jpg', '18 Pictures/8.jpg',
    '18 Pictures/9.jpg', '18 Pictures/10.jpg', '18 Pictures/11.jpg', '18 Pictures/12.jpg',
    '18 Pictures/13.jpg', '18 Pictures/14.jpg', '18 Pictures/15.jpg', '18 Pictures/16.jpg',
    '18 Pictures/17.jpg', '18 Pictures/18.jpg'
  ];

  const pairMessages = [
    "يا لهوي على الجمال! الصورة دي بتفكرني بضحكتك اللي بتنور يومي كله. ♥",
    "لقينا صورتين لست البنات! عيونك دول فيهم سحر مش طبيعي يا قمري. ♥",
    "شاطرة يا روحي! رخامتك وجمالك هما أحلى حاجة في دنيتي. ♥",
    "تفاصيلك الصغيرة كلها بتتحب، مفيش منك اتنين في الدنيا دي بجد. ♥",
    "أطيب وأحن قلب في الدنيا.. بموت فيكي وفي تفاصيلك يا ملكتي. ♥",
    "كل نسخة منك بتجنني، وانتي مقموصة أو فرحانة، انتي دايماً في قلبي وعيني. ♥"
  ];

  const winMessage = "جمعتي كل الذكريات يا روحي! زي ما جمعتي كل حتة من قلبي وبقيتي مالكاه لوحدك. ربنا يخليكي ليا وتفضلي دايماً منورة حياتي يا أجمل ست في الدنيا كلها. بحبك للأبد! ♥";

  let selectedImages = [];
  let cardsArray = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let matches = 0;

  const gridContainer = document.getElementById('memoryGrid');
  const movesEl = document.getElementById('memoryMoves');
  const matchesEl = document.getElementById('memoryMatches');
  const activeMessageEl = document.getElementById('memoryActiveMessage');
  const successMsgContainer = document.getElementById('memorySuccess');
  const successTextEl = document.getElementById('memorySuccessText');
  const resetBtn = document.getElementById('resetMemoryBtn');

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function initGame() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matches = 0;

    movesEl.textContent = '0';
    matchesEl.textContent = '0/6';

    activeMessageEl.classList.remove('active');
    activeMessageEl.textContent = '';

    successMsgContainer.hidden = true;
    successMsgContainer.classList.remove('show');
    gridContainer.innerHTML = '';
    gridContainer.style.display = 'grid';

    const shuffledPool = shuffle([...allImages]);
    selectedImages = shuffledPool.slice(0, 6);

    cardsArray = [];
    selectedImages.forEach((img, index) => {
      cardsArray.push({ id: index + '_a', img: img });
      cardsArray.push({ id: index + '_b', img: img });
    });

    shuffle(cardsArray);

    cardsArray.forEach(cardData => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.image = cardData.img;
      cardEl.dataset.id = cardData.id;

      cardEl.innerHTML = `
        <div class="card-face card-back">
          <span class="card-back-ornament">♥</span>
        </div>
        <div class="card-face card-front">
          <div class="card-img" style="background-image: url('${cardData.img}')"></div>
        </div>
      `;

      cardEl.addEventListener('click', () => flipCard(cardEl));
      gridContainer.appendChild(cardEl);
    });

    const gameRevealEls = document.querySelectorAll('.memory-game .reveal, #memoryGrid .memory-card');
    gameRevealEls.forEach(el => io.observe(el));
  }

  function flipCard(card) {
    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves++;
    movesEl.textContent = moves;

    checkMatch();
  }

  function checkMatch() {
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.style.pointerEvents = 'none';
    secondCard.style.pointerEvents = 'none';

    matches++;
    matchesEl.textContent = `${matches}/6`;

    activeMessageEl.classList.remove('active');
    void activeMessageEl.offsetWidth;
    activeMessageEl.textContent = pairMessages[matches - 1];
    activeMessageEl.classList.add('active');

    if (matches === 6) {
      setTimeout(showWinScreen, 1200);
    } else {
      resetBoard();
    }
  }

  function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function showWinScreen() {
    gridContainer.style.display = 'none';
    successTextEl.textContent = winMessage;
    successMsgContainer.hidden = false;

    void successMsgContainer.offsetWidth;
    successMsgContainer.classList.add('show');

    if (typeof spawnPetalFall === 'function') spawnPetalFall();
    if (typeof spawnHeartBurst === 'function' && resetBtn) spawnHeartBurst(resetBtn);
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
})();

/* ============================================
   21. DRAMATIC 3D FLIP POLISH
   ============================================ */
(function() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.querySelectorAll('.envelope-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
      const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
      card.style.setProperty('--ex', x + '%');
      card.style.setProperty('--ey', y + '%');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--ex', '50%');
      card.style.setProperty('--ey', '50%');
    });

    const envelope = card.querySelector('.envelope');
    if (envelope) {
      envelope.addEventListener('click', () => {
        card.classList.add('flipping');
        clearTimeout(card._flipT);
        card._flipT = setTimeout(() => card.classList.remove('flipping'), 1150);
      }, true);
    }
  });

  document.querySelectorAll('.envelope-card .envelope-letter').forEach(letter => {
    letter.addEventListener('click', () => {
      const card = letter.closest('.envelope-card');
      if (!card) return;
      card.classList.add('closing');
      clearTimeout(card._closeT);
      card._closeT = setTimeout(() => card.classList.remove('closing'), 1450);
    }, true);
  });

  const grid = document.getElementById('memoryGrid');
  if (grid) {
    grid.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.memory-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        return;
      }
      card.style.setProperty('--tilt-x', (dy * -9).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', (dx * 9).toFixed(2) + 'deg');
    });

    grid.addEventListener('pointerleave', () => {
      grid.querySelectorAll('.memory-card').forEach(c => {
        c.style.removeProperty('--tilt-x');
        c.style.removeProperty('--tilt-y');
      });
    });
  }
})();

/* ============================================
   22. HIDDEN LOVE LETTERS (Wax Seals)
   ============================================ */
(function() {
  const letters = {
    hero: {
      title: "اول حاجة عايز اقولهالك",
      lines: [
        "لو انتي بتقري الكلام ده، يبقى لقيتي اول رسالة مخبية ♥",
        "عملت الموقع ده كله عشانك، كل حتة فيه فيها حاجة بتفكرني بيكي.",
        "مش عارف اقولك قد ايه انتي غالية عندي، بس هحاول اقولهالك بكل طريقة."
      ],
      sign: "بتاعك ♥"
    },
    reasons: {
      title: "سر صغير",
      lines: [
        "في حاجات بحبها فيكي مقدرش اكتبها في ليستة.",
        "زي صوتك وانتي مبسوطة، وطريقتك وانتي بتزعقي، وسكوتك وانتي تعبانة.",
        "كل التفاصيل الصغيرة دي هي اللي خلتني اقع في حبك."
      ],
      sign: "دايمًا ليكي ♥"
    },
    scrapbook: {
      title: "بين الصور",
      lines: [
        "كل صورة هنا ليها حكاية في دماغي انتي متعرفهاش.",
        "في صور بفتحها لوحدي وابتسم من غير سبب.",
        "نفسي نجمع صور اكتر واكتر، لحد ما الالبوم ميكفيش."
      ],
      sign: "مستنيك ♥"
    },
    memory: {
      title: "الذاكرة بتاعتي",
      lines: [
        "انا فاكر كل حاجة، حتى الحاجات اللي انتي نسيتيها.",
        "فاكر اول رسالة، واول مرة ضحكتي، واول مرة زعلتي مني.",
        "كل ده متسجل عندي، مش هينسى ابدًا."
      ],
      sign: "اللي بيفتكر كل حاجة ♥"
    },
    gallery: {
      title: "اخر رسالة",
      lines: [
        "لو وصلتي لحد هنا، يبقى انتي لقيتي كل حاجة خبيتهالك.",
        "زي ما لقيتي الرسايل دي، انتي لقيتي حتة جوايا مكنتش عارف انها موجودة.",
        "شكرًا انك موجودة في حياتي، بجد."
      ],
      sign: "بحبك ♥"
    }
  };

  const STORE_FOUND = 'herLetters.found.v1';
  const STORE_REPLY = 'herLetters.reply.v1';

  const mem = {};
  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; }
  }

  function loadJSON(key, fallback) {
    try { return JSON.parse(lsGet(key)) || fallback; } catch (e) { return fallback; }
  }

  let found = loadJSON(STORE_FOUND, {});
  let replies = loadJSON(STORE_REPLY, {});

  const modal = document.getElementById('dlModal');
  if (!modal) return;
  const sealStage = document.getElementById('dlSealStage');
  const wax = document.getElementById('dlWax');
  const letterWrap = document.getElementById('dlLetter');
  const paper = document.getElementById('dlPaper');
  const titleEl = document.getElementById('dlTitle');
  const bodyEl = document.getElementById('dlBody');
  const signEl = document.getElementById('dlSign');
  const replyEl = document.getElementById('dlReply');
  const savedFlag = document.getElementById('dlSavedFlag');
  const allFound = document.getElementById('dlAllFound');
  const counter = document.getElementById('hlCounter');
  const counterNum = document.getElementById('hlCounterNum');
  const stage = document.getElementById('dlStage');

  const seals = Array.from(document.querySelectorAll('.hidden-letter'));
  const TOTAL = seals.length;
  let activeKey = null;
  let opened = false;

  function arabicDigits(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  }

  function foundCount() {
    return seals.filter(s => found[s.dataset.letter]).length;
  }

  function refreshCounter(pop) {
    const c = foundCount();
    counterNum.textContent = arabicDigits(c) + ' / ' + arabicDigits(TOTAL);
    if (c > 0) counter.classList.add('show');
    if (pop) {
      counter.classList.remove('pop');
      void counter.offsetWidth;
      counter.classList.add('pop');
    }
  }

  seals.forEach(s => {
    if (found[s.dataset.letter]) s.classList.add('found');
    s.addEventListener('click', () => openLetter(s.dataset.letter, s));
  });

  refreshCounter(false);

  function spawnShards(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 16; i++) {
      const sh = document.createElement('span');
      sh.className = 'dl-shard';
      const ang = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 150;
      sh.style.left = cx + 'px';
      sh.style.top = cy + 'px';
      sh.style.setProperty('--sx', Math.cos(ang) * dist + 'px');
      sh.style.setProperty('--sy', (Math.sin(ang) * dist + 70) + 'px');
      sh.style.setProperty('--sr', (Math.random() * 720 - 360) + 'deg');
      sh.style.width = sh.style.height = (6 + Math.random() * 8) + 'px';
      sh.style.animationDelay = (Math.random() * 0.09) + 's';
      document.body.appendChild(sh);
      setTimeout(() => sh.remove(), 1400);
    }
  }

  function openLetter(key, sealEl) {
    activeKey = key;
    const data = letters[key];
    if (!data) return;

    opened = false;
    wax.classList.remove('cracked', 'shake');
    sealStage.classList.remove('gone');
    letterWrap.classList.remove('in');
    paper.classList.remove('unfold');
    allFound.hidden = true;
    savedFlag.classList.remove('show');
    savedFlag.textContent = '';

    titleEl.textContent = data.title;
    signEl.textContent = data.sign;
    bodyEl.innerHTML = data.lines.map(l => '<p class="dl-line">' + l + '</p>').join('');
    replyEl.value = replies[key] || '';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    stage.scrollTop = 0;
    setTimeout(() => wax.focus({ preventScroll: true }), 120);

    modal._returnTo = sealEl || null;
  }

  function crackOpen() {
    if (opened) return;
    opened = true;

    wax.classList.add('shake');
    setTimeout(() => {
      wax.classList.add('cracked');
      spawnShards(wax);

      if (typeof spawnHeartBurst === 'function') {
        try { spawnHeartBurst(wax); } catch (e) { }
      }
    }, 380);

    setTimeout(() => {
      sealStage.classList.add('gone');
      letterWrap.classList.add('in');
      requestAnimationFrame(() => paper.classList.add('unfold'));

      const lines = bodyEl.querySelectorAll('.dl-line');
      lines.forEach((ln, i) => setTimeout(() => ln.classList.add('ink'), 420 + i * 340));

      if (activeKey && !found[activeKey]) {
        found[activeKey] = true;
        lsSet(STORE_FOUND, JSON.stringify(found));
        const s = seals.find(x => x.dataset.letter === activeKey);
        if (s) s.classList.add('found');
        refreshCounter(true);
      }

      if (foundCount() >= TOTAL) {
        const delay = 420 + bodyEl.querySelectorAll('.dl-line').length * 340 + 300;
        setTimeout(() => {
          allFound.hidden = false;
          if (typeof spawnPetalFall === 'function') {
            try { spawnPetalFall(); } catch (e) { }
          }
        }, delay);
      }
    }, 1180);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    const back = modal._returnTo;
    if (back) setTimeout(() => back.focus({ preventScroll: true }), 80);
  }

  wax.addEventListener('click', crackOpen);
  document.getElementById('dlClose').addEventListener('click', closeModal);
  document.getElementById('dlBackdrop').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { closeModal(); }
    else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === wax) {
      e.preventDefault();
      crackOpen();
    }
  });

  function flag(msg) {
    savedFlag.textContent = msg;
    savedFlag.classList.add('show');
    clearTimeout(flag._t);
    flag._t = setTimeout(() => savedFlag.classList.remove('show'), 2600);
  }

  function saveReply(silent) {
    if (!activeKey) return;
    const val = replyEl.value.trim();
    if (val) replies[activeKey] = val;
    else delete replies[activeKey];
    lsSet(STORE_REPLY, JSON.stringify(replies));
    if (!silent) flag(val ? 'اتحفظ ♥ هلاقيه هنا كل ما ترجعي' : 'اتمسح خلاص');
  }

  document.getElementById('dlSave').addEventListener('click', () => saveReply(false));

  document.getElementById('dlClear').addEventListener('click', () => {
    replyEl.value = '';
    saveReply(false);
    replyEl.focus();
  });

  let typeTimer = null;
  replyEl.addEventListener('input', () => {
    clearTimeout(typeTimer);
    typeTimer = setTimeout(() => saveReply(true), 700);
  });

  replyEl.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveReply(false);
    }
  });

  window.addEventListener('beforeunload', () => {
    if (modal.classList.contains('open')) saveReply(true);
  });

  counter.addEventListener('click', () => {
    const next = seals.find(s => !found[s.dataset.letter]) || seals[0];
    if (!next) return;
    next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    next.classList.remove('found');
    void next.offsetWidth;
    if (found[next.dataset.letter]) next.classList.add('found');
    next.style.transition = 'transform 0.5s cubic-bezier(.34,1.4,.5,1)';
    next.style.transform = 'scale(1.5)';
    setTimeout(() => { next.style.transform = ''; }, 620);
  });
})();

/* ============================================
   23. FLOATING PHOTO GALLERY (Chapter V)
   ============================================ */
(function() {
  const fgPhotos = [
    { src: "18 Pictures/Float1.jpg", cap: "❤ بوز الحبيبة", note: "حتى وانتي مكشرة اجمل حاجة في الدنيا" },
    { src: "18 Pictures/Float2.jpg", cap: "الاوتفيت ده كسر الدنيا", note: "❤ ماشية كأن الدنيا كلها بتاعتك" },
    { src: "18 Pictures/Float3.jpg", cap: "❤ قمر في وسط التلج", note: "التلج كله ما يساويش دفا ضحكتك" },
    { src: "18 Pictures/Float4.jpg", cap: "مراية البيت اتبسطت", note: "❤ حتى المراية بتتكسف منك" },
    { src: "18 Pictures/Float5.jpg", cap: "❤ ستايل ملكة", note: "لبسك حلو بس انتي احلى منه بكتير" },
    { src: "18 Pictures/Float6.jpg", cap: "طفلة كبيرة ❤", note: "ضحكتك دي بتفكرني اني اسعد واحد" },
    { src: "18 Pictures/Float7.jpg", cap: "الضحكة اللي بتنور", note: "❤ بحب اوي ضحكتك دي" },
    { src: "18 Pictures/Float8.jpg", cap: "❤ شعرها الهيصة", note: "كده كده انتي اجمل واحدة" },
    { src: "18 Pictures/Float9.jpg", cap: "سيلفي نص الليل", note: "❤ نور الاوضة كلها منك انتي" },
    { src: "18 Pictures/Float10.jpg", cap: "❤ النضارة والضحكة", note: "الضحكة دي تكفيني العمر كله" },
    { src: "18 Pictures/Float11.jpg", cap: "الاسانسير محظوظ", note: "❤ كيوت بشكل مش طبيعي" },
    { src: "18 Pictures/Float12.jpg", cap: "قاعدة على راحتها", note: "اهدى منظر شفته في حياتي ❤" },
    { src: "18 Pictures/Float13.jpg", cap: "❤ كريسماس وبرد", note: "الشجرة اتزينت عشانك انتي" },
    { src: "18 Pictures/Float14.jpg", cap: "سرحانة في ايه؟", note: "❤ يارب تكوني بتفكري فيا" },
    { src: "18 Pictures/Float15.jpg", cap: "❤ الهدوء ده", note: "وشك ده بيريحني من الدنيا كلها" },
    { src: "18 Pictures/Float16.jpg", cap: "في وسط اللوحات", note: "❤ وانتي احلى لوحة فيهم" },
    { src: "18 Pictures/Float17.jpg", cap: "هابله يابت ❤", note: "جنانك ده اللي خلاني احبك" },
    { src: "18 Pictures/Float18.jpg", cap: "وقفة الكريسماس", note: "❤ كل مكان بتروحيه بيبقى احلى" }
  ];

  const grid = document.getElementById('fgGrid');
  const viewer = document.getElementById('fgViewer');
  if (!grid || !viewer) return;

  const layerA = document.getElementById('fgLayerA');
  const layerB = document.getElementById('fgLayerB');
  const blurA = document.getElementById('fgBlurA');
  const blurB = document.getElementById('fgBlurB');
  const frame = document.getElementById('fgFrame');
  const frameCap = document.getElementById('fgFrameCaption');
  const titleEl = document.getElementById('fgTitle');
  const noteEl = document.getElementById('fgNote');
  const counterEl = document.getElementById('fgCounter');
  const progressEl = document.getElementById('fgProgressBar');
  const playBtn = document.getElementById('fgPlay');
  const startBtn = document.getElementById('fgSlideshowBtn');
  const closeBtn = document.getElementById('fgClose');

  const SLIDE_MS = 4200;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cards = [];
  let index = 0;
  let playing = false;
  let slideTimer = null;
  let progressRAF = null;
  let progressStart = 0;
  let usingA = true;

  const rots = [-5, 4, -3, 5, -4, 3, -6, 2];
  const lifts = [12, 16, 10, 18, 14, 11, 17, 13];

  fgPhotos.forEach((p, i) => {
    const slot = document.createElement('div');
    slot.className = 'fg-slot';

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'fg-card';
    card.setAttribute('aria-label', p.cap || 'صورة');
    card.style.setProperty('--fg-rot', rots[i % rots.length] + 'deg');
    card.style.setProperty('--fg-tilt', (1.6 + (i % 4) * 0.5).toFixed(2) + 'deg');
    card.style.setProperty('--fg-lift', lifts[i % lifts.length] + 'px');
    card.style.setProperty('--fg-dur', (4.6 + (i % 6) * 0.55).toFixed(2) + 's');
    card.style.setProperty('--fg-delay', (-(i * 0.43) % 3).toFixed(2) + 's');

    card.innerHTML =
      '<div class="fg-photo-wrap">' +
      '<img class="fg-photo" src="' + p.src + '" alt="' + (p.cap || '') + '" loading="lazy" decoding="async">' +
      '</div>' +
      '<span class="fg-cap" dir="rtl">' + (p.cap || '') + '</span>';

    card.addEventListener('click', () => openViewer(i));
    slot.appendChild(card);
    grid.appendChild(slot);
    cards.push(card);
  });

  function markCurrent() {
    cards.forEach((c, i) => c.classList.toggle('is-current', i === index));
  }

  function toArabicDigits(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  }

  function show(i, animate) {
    index = (i + fgPhotos.length) % fgPhotos.length;
    const item = fgPhotos[index];

    const incoming = usingA ? layerB : layerA;
    const outgoing = usingA ? layerA : layerB;
    const blurIn = usingA ? blurB : blurA;
    const blurOut = usingA ? blurA : blurB;
    usingA = !usingA;

    const url = "url('" + item.src + "')";
    incoming.style.backgroundImage = url;
    blurIn.style.backgroundImage = url;

    incoming.classList.remove('ken');
    void incoming.offsetWidth;
    incoming.classList.add('show');
    if (!reduceMotion) incoming.classList.add('ken');
    outgoing.classList.remove('show', 'ken');

    blurIn.classList.add('show');
    blurOut.classList.remove('show');

    if (animate !== false) {
      viewer.classList.add('swapping');
      setTimeout(() => {
        frameCap.textContent = item.cap || '';
        titleEl.textContent = item.cap || '';
        noteEl.textContent = item.note || '';
        viewer.classList.remove('swapping');
      }, 190);
    } else {
      frameCap.textContent = item.cap || '';
      titleEl.textContent = item.cap || '';
      noteEl.textContent = item.note || '';
    }

    counterEl.textContent = toArabicDigits(index + 1) + ' / ' + toArabicDigits(fgPhotos.length);
    markCurrent();

    const nextImg = new Image();
    nextImg.src = fgPhotos[(index + 1) % fgPhotos.length].src;

    if (playing) restartProgress();
  }

  function openViewer(i, autoplay) {
    show(i, false);
    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (autoplay) play(); else stop();
    closeBtn.focus({ preventScroll: true });
  }

  function closeViewer() {
    stop();
    viewer.classList.remove('open');
    document.body.style.overflow = '';
    cards.forEach(c => c.classList.remove('is-current'));
    const back = cards[index];
    if (back) back.focus({ preventScroll: true });
  }

  function restartProgress() {
    cancelAnimationFrame(progressRAF);
    progressStart = performance.now();
    const tick = (now) => {
      const pct = Math.min(100, ((now - progressStart) / SLIDE_MS) * 100);
      progressEl.style.width = pct + '%';
      if (playing) progressRAF = requestAnimationFrame(tick);
    };
    progressRAF = requestAnimationFrame(tick);
  }

  function play() {
    playing = true;
    viewer.classList.add('playing');
    playBtn.setAttribute('aria-label', 'إيقاف السلايد شو');
    clearInterval(slideTimer);
    slideTimer = setInterval(() => show(index + 1), SLIDE_MS);
    restartProgress();
  }

  function stop() {
    playing = false;
    viewer.classList.remove('playing');
    playBtn.setAttribute('aria-label', 'تشغيل السلايد شو');
    clearInterval(slideTimer);
    cancelAnimationFrame(progressRAF);
    progressEl.style.width = '0%';
  }

  function togglePlay() { playing ? stop() : play(); }

  startBtn.addEventListener('click', () => openViewer(0, true));
  playBtn.addEventListener('click', togglePlay);
  closeBtn.addEventListener('click', closeViewer);

  ['fgPrev', 'fgPrevSide'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      show(index - 1);
      if (playing) play();
    });
  });
  ['fgNext', 'fgNextSide'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      show(index + 1);
      if (playing) play();
    });
  });

  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target.classList.contains('fg-scrim') || e.target.classList.contains('fg-blur')) {
      closeViewer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!viewer.classList.contains('open')) return;
    if (e.key === 'Escape') { closeViewer(); }
    else if (e.key === 'ArrowRight') { show(index + 1); if (playing) play(); }
    else if (e.key === 'ArrowLeft') { show(index - 1); if (playing) play(); }
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });

  let touchX = null, touchY = null;
  viewer.addEventListener('touchstart', (e) => {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });

  viewer.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      show(dx < 0 ? index + 1 : index - 1);
      if (playing) play();
    }
    touchX = touchY = null;
  }, { passive: true });

  if (!reduceMotion) {
    viewer.addEventListener('mousemove', (e) => {
      const rx = (e.clientY / window.innerHeight - 0.5) * -5;
      const ry = (e.clientX / window.innerWidth - 0.5) * 6;
      frame.style.transform = 'perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
    viewer.addEventListener('mouseleave', () => { frame.style.transform = ''; });
  }

  let wasPlaying = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wasPlaying = playing; if (playing) stop(); }
    else if (wasPlaying && viewer.classList.contains('open')) { play(); }
  });
})();

/* ============================================
   24. SCROLL PROGRESS INDICATOR
   ============================================ */
(function() {
  const fill = document.getElementById('scrollProgress');
  if (!fill) return;
  function updateProgress() {
    const scroll = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scroll / docHeight) * 100 : 0;
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();

/* ============================================
   25. CURSOR FLOATING HEARTS / STARS / SPARKLES
   ============================================ */
(function() {
  const layer = document.getElementById('cursorTrailLayer');
  if (!layer) return;
  const pieceTypes = [
    { cls: 'heart', char: '♥', colorVar: '--rose' },
    { cls: 'star', char: '✦', colorVar: '--gold' },
    { cls: 'sparkle', char: '✧', colorVar: '--cream' }
  ];

  function spawn(e) {
    const p = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    const el = document.createElement('div');
    el.className = 'cursor-trail-piece ' + p.cls;
    el.textContent = p.char;
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    const dx = (Math.random() - 0.5) * 90 - 20;
    const dy = -30 - Math.random() * 70;
    const rot = (Math.random() - 0.5) * 140;
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');
    el.style.setProperty('--rot', rot + 'deg');
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  document.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (Math.random() < 0.22) spawn(e);
  }, { passive: true });
})();
