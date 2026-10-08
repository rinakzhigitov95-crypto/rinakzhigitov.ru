// Анимации при прокрутке. Без библиотек, уважает prefers-reduced-motion.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Появление блоков ------------------------------------------------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduce) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  revealEls.forEach((el) => io.observe(el));
}

/* 2. Цифры набегают от нуля ------------------------------------------- */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const fmt = new Intl.NumberFormat('ru-RU');

function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count ?? 0);
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const dur = 1300;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = prefix + fmt.format(Math.round(to * easeOut(p))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll<HTMLElement>('[data-count]');
if (reduce) {
  countEls.forEach((el) => {
    el.textContent = (el.dataset.prefix ?? '') + fmt.format(Number(el.dataset.count)) + (el.dataset.suffix ?? '');
  });
} else {
  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          countUp(e.target as HTMLElement);
          cio.unobserve(e.target);
        }
      }
    },
    { threshold: 0.6 },
  );
  countEls.forEach((el) => cio.observe(el));
}

/* 3. Параллакс и компактная шапка ------------------------------------- */
const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
const header = document.querySelector<HTMLElement>('[data-header]');

let lastY = window.scrollY;
let velocity = 0;
let ticking = false;

function onFrame() {
  const y = window.scrollY;
  velocity = y - lastY;
  lastY = y;

  if (!reduce) {
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const k = Number(el.dataset.parallax ?? 0.2);
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * k).toFixed(1)}px, 0)`;
    }
  }

  if (header) {
    // фон и компактный вид — сразу после начала прокрутки
    header.classList.toggle('is-compact', y > 40);
  }
  ticking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      requestAnimationFrame(onFrame);
      ticking = true;
    }
  },
  { passive: true },
);
onFrame();

/* 4. Лента логотипов: едет сама, ускоряется от прокрутки, под курсором — останавливается,
      её можно тянуть мышью/пальцем и крутить колесом ------------------------------------ */
const track = document.querySelector<HTMLElement>('[data-marquee]');
const marquee = track?.parentElement as HTMLElement | null;
if (track && marquee) {
  let x = 0;
  let boost = 0;
  let paused = false;
  let dragging = false;
  let startX = 0;
  let startOffset = 0;
  const base = 0.5; // px за кадр
  const half = () => track.scrollWidth / 2;
  const wrap = () => {
    const h = half();
    if (-x >= h) x += h;
    if (x > 0) x -= h;
  };
  const render = () => {
    wrap();
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  };
  if (!reduce) {
    const step = () => {
      if (!paused && !dragging) {
        boost += (Math.min(Math.abs(velocity), 40) * 0.12 - boost) * 0.08;
        x -= base + boost;
        render();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // пауза под курсором
  marquee.addEventListener('pointerenter', () => (paused = true));
  marquee.addEventListener('pointerleave', () => {
    paused = false;
    dragging = false;
    marquee.classList.remove('is-dragging');
  });
  // перетаскивание мышью и пальцем
  marquee.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startOffset = x;
    marquee.setPointerCapture(e.pointerId);
    marquee.classList.add('is-dragging');
  });
  marquee.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    x = startOffset + (e.clientX - startX);
    render();
  });
  const endDrag = () => {
    dragging = false;
    marquee.classList.remove('is-dragging');
  };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);
  // колесо мыши / трекпад: горизонтальный жест или колесо с Shift
  marquee.addEventListener(
    'wheel',
    (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      x -= dx;
      render();
    },
    { passive: false },
  );
  // клик по логотипу после перетаскивания не должен срабатывать как клик
  track.addEventListener('click', (e) => {
    if (Math.abs(x - startOffset) > 4) e.preventDefault();
  });
}

/* 5. Прогресс чтения на странице кейса -------------------------------- */
const progress = document.querySelector<HTMLElement>('[data-progress]');
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
