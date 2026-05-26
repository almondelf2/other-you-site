/* ═══════════════════════════════════════
   OTHER YOU · Shared site JS
═══════════════════════════════════════ */

// ── CANVAS AMBIENT BACKGROUND ──
(function () {
  const canvas = document.getElementById('site-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isDark = () => !window.matchMedia('(prefers-color-scheme: light)').matches;
  let W, H, stars, raf;

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  function mkStar() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.1 + .2,
      a: Math.random(), da: (Math.random() - .5) * .003,
      dy: -Math.random() * .12
    };
  }
  function init() {
    resize();
    stars = Array.from({ length: 90 }, mkStar);
    if (raf) cancelAnimationFrame(raf);
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();
    const g1 = ctx.createRadialGradient(W * .15, H * .25, 0, W * .15, H * .25, W * .45);
    g1.addColorStop(0, dark ? 'rgba(91,58,140,.07)' : 'rgba(155,126,200,.1)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * .85, H * .7, 0, W * .85, H * .7, W * .4);
    g2.addColorStop(0, dark ? 'rgba(124,58,237,.05)' : 'rgba(124,58,237,.07)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    const sc = dark ? '200,184,232' : '91,58,140';
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.y += s.dy;
      if (s.y < -2) s.y = H + 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sc},${(s.a * .5).toFixed(2)})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', init);

  const mq = window.matchMedia('(prefers-color-scheme: light)');
  function updateTheme(e) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = e.matches ? '#f4f0ff' : '#0d0818';
  }
  mq.addEventListener('change', updateTheme);
  updateTheme(mq);
  init();
})();

// ── MOBILE NAV ──
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });
})();

// ── SCROLL-TRIGGERED FADE-INS ──
(function () {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
})();

// ── ACTIVE NAV LINK ──
(function () {
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '');
    if (href === path || (path === '' && href === '/index.html') ||
        (path.endsWith('index') && href === '/') ) {
      a.classList.add('active');
    }
  });
})();
