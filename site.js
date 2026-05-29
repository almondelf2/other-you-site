/* ═══════════════════════════════════════
   OTHER YOU · Shared site JavaScript

   HOW THIS FILE IS ORGANIZED
   ──────────────────────────
   Each feature is wrapped in an IIFE — an
   "Immediately Invoked Function Expression."
   That looks like: (function() { ... })();

   This pattern keeps each feature's variables
   private so they don't accidentally collide
   with each other. Think of each IIFE as its
   own sealed room.
═══════════════════════════════════════ */


/* ══════════════════════════════
   CANVAS AMBIENT BACKGROUND
   Draws an animated starfield using the HTML
   <canvas> element. Canvas lets you draw
   shapes, paths, and pixels in JavaScript.

   Key concepts used here:
   · requestAnimationFrame — the browser calls
     our draw() function ~60 times per second,
     synced to the screen's refresh rate.
   · Radial gradients — soft glowing blobs of
     color that give the background depth.
   · Star drift — each star slowly floats upward
     and fades in/out, creating a living sky.
══════════════════════════════ */
(function () {
  const canvas = document.getElementById('site-bg');
  if (!canvas) return;               /* exit early if canvas isn't on this page */

  const ctx = canvas.getContext('2d');
  const isDark = () => !window.matchMedia('(prefers-color-scheme: light)').matches;

  let W, H, stars, raf;             /* W/H = canvas dimensions, raf = animation frame ID */

  /* Match the canvas pixel size to the browser window size */
  function resize() {
    W = canvas.width  = innerWidth;
    H = canvas.height = innerHeight;
  }

  /* Create one star with random properties */
  function mkStar() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.1 + .2,          /* radius between 0.2 and 1.3px */
      a:  Math.random(),                      /* current opacity */
      da: (Math.random() - .5) * .003,        /* opacity change per frame (twinkle) */
      dy: -Math.random() * .12                /* upward drift speed */
    };
  }

  /* Set up the canvas and create all stars */
  function init() {
    resize();
    stars = Array.from({ length: 90 }, mkStar);
    if (raf) cancelAnimationFrame(raf);       /* stop any previous animation loop */
    draw();
  }

  /* Draw one frame — called ~60 times per second */
  function draw() {
    ctx.clearRect(0, 0, W, H);               /* wipe the previous frame */
    const dark = isDark();

    /* Ambient glow 1 — top-left iris purple */
    const g1 = ctx.createRadialGradient(W * .15, H * .25, 0, W * .15, H * .25, W * .45);
    g1.addColorStop(0, dark ? 'rgba(91,58,140,.07)' : 'rgba(155,126,200,.1)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    /* Ambient glow 2 — bottom-right portal purple */
    const g2 = ctx.createRadialGradient(W * .85, H * .7, 0, W * .85, H * .7, W * .4);
    g2.addColorStop(0, dark ? 'rgba(124,58,237,.05)' : 'rgba(124,58,237,.07)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    /* Draw each star */
    const sc = dark ? '200,184,232' : '91,58,140';  /* star color: light or dark mode */
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;  /* reverse opacity direction at bounds */
      s.y += s.dy;
      if (s.y < -2) s.y = H + 2;             /* wrap star from top back to bottom */

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sc},${(s.a * .5).toFixed(2)})`;
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);        /* schedule the next frame */
  }

  /* Re-initialize when the window is resized */
  window.addEventListener('resize', init);

  /* Update the browser tab color when the user switches light/dark mode */
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  function updateTheme(e) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = e.matches ? '#f4f0ff' : '#0d0818';
  }
  mq.addEventListener('change', updateTheme);
  updateTheme(mq);

  init();
})();


/* ══════════════════════════════
   MOBILE NAVIGATION
   The hamburger button (☰) toggles a full-width
   nav drawer on small screens.

   Accessibility notes:
   · aria-expanded tells screen readers whether
     the menu is open or closed.
   · aria-controls links the button to the element
     it controls, so screen readers understand the
     relationship.
   · We also close the drawer when the user clicks
     outside it or taps any link inside it.
══════════════════════════════ */
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');

    /* Keep ARIA in sync with visual state */
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  /* Close when a link inside the drawer is tapped */
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    });
  });

  /* Close when the user clicks anywhere outside the drawer or button */
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    }
  });

  /* Close when the user presses Escape — standard keyboard pattern */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      hamburger.focus();    /* return focus to the button that opened the menu */
    }
  });
})();


/* ══════════════════════════════
   SCROLL-TRIGGERED REVEAL ANIMATIONS
   Elements with class="reveal" start invisible
   (opacity: 0, translated down). This observer
   watches each element and adds class="revealed"
   when 12% of the element enters the viewport.

   The CSS transition in site.css handles the
   actual animation — JS just toggles the class.

   IntersectionObserver is more efficient than
   listening to the scroll event because the browser
   runs it off the main thread.
══════════════════════════════ */
(function () {
  /* Bail out gracefully in very old browsers */
  if (!('IntersectionObserver' in window)) {
    /* Make all reveal elements visible immediately as a fallback */
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); /* stop watching once revealed */
      }
    });
  }, { threshold: 0.12 }); /* trigger when 12% of the element is visible */

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
