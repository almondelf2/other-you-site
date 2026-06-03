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
// Last audited: 2026-06-03 — added gradient caching to avoid ~120 object allocations/sec in draw loop


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
  /* Cache the MediaQueryList — reused by isDark() every frame AND by updateTheme() below.
     Calling window.matchMedia() once and storing the result is more efficient
     than calling it 60 times per second inside the draw loop. */
  const darkMQ = window.matchMedia('(prefers-color-scheme: light)');
  const isDark  = () => !darkMQ.matches;

  /*
    WCAG 2.3.3 — Motion: some users have a system setting called "Reduce Motion"
    because animations can cause dizziness or nausea (vestibular disorders).
    CSS handles our transitions and reveals automatically, but this canvas animation
    runs entirely in JavaScript so we must check the preference here manually.
    If the user prefers reduced motion, we draw the stars once (static) and stop.
  */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, stars, raf;             /* W/H = canvas dimensions, raf = animation frame ID */
  let cachedGrad1, cachedGrad2;     /* ambient gradients — rebuilt only on resize or theme change */

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

  /*
    Build the two ambient radial gradients and cache them.
    Called from init() (after resize sets W/H) and from updateTheme()
    (when the color scheme changes). Avoids recreating gradient objects
    inside draw(), which ran at ~60fps = ~120 allocations/sec.
  */
  function buildGradients() {
    const dark = isDark();
    cachedGrad1 = ctx.createRadialGradient(W * .15, H * .25, 0, W * .15, H * .25, W * .45);
    cachedGrad1.addColorStop(0, dark ? 'rgba(91,58,140,.07)' : 'rgba(155,126,200,.1)');
    cachedGrad1.addColorStop(1, 'transparent');
    cachedGrad2 = ctx.createRadialGradient(W * .85, H * .7, 0, W * .85, H * .7, W * .4);
    cachedGrad2.addColorStop(0, dark ? 'rgba(124,58,237,.05)' : 'rgba(124,58,237,.07)');
    cachedGrad2.addColorStop(1, 'transparent');
  }

  /* Set up the canvas and create all stars */
  function init() {
    resize();
    buildGradients();
    stars = Array.from({ length: 90 }, mkStar);
    if (raf) cancelAnimationFrame(raf);       /* stop any previous animation loop */
    draw();
  }

  /* Draw one frame — called ~60 times per second */
  function draw() {
    ctx.clearRect(0, 0, W, H);               /* wipe the previous frame */
    const dark = isDark();

    /* Ambient glow 1 — top-left iris purple (gradient built once in buildGradients()) */
    ctx.fillStyle = cachedGrad1;
    ctx.fillRect(0, 0, W, H);

    /* Ambient glow 2 — bottom-right portal purple */
    ctx.fillStyle = cachedGrad2;
    ctx.fillRect(0, 0, W, H);

    /* Draw each star */
    const sc = dark ? '200,184,232' : '91,58,140';  /* star color: light or dark mode */
    stars.forEach(s => {
      /* Only animate (drift + twinkle) when the user hasn't requested reduced motion */
      if (!prefersReducedMotion) {
        s.a += s.da;
        if (s.a <= 0 || s.a >= 1) s.da *= -1;  /* reverse opacity direction at bounds */
        s.y += s.dy;
        if (s.y < -2) s.y = H + 2;             /* wrap star from top back to bottom */
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sc},${(s.a * .5).toFixed(2)})`;
      ctx.fill();
    });

    /* Keep animating only if the user is OK with motion */
    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(draw);      /* schedule the next frame */
    }
  }

  /* Debounce the resize handler.
     The 'resize' event fires dozens of times per second during a window drag.
     Without debouncing, init() would thrash — cancelling and restarting the
     animation loop and recreating all 90 stars continuously.
     Waiting 150ms after the last event fires once, cleanly. */
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(init, 150);
  });

  /* Pause animation when the browser tab is in the background.
     requestAnimationFrame already throttles in hidden tabs, but this stops
     it entirely — no CPU/battery use when the user has switched away. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
    } else if (!prefersReducedMotion) {
      draw();
    }
  });

  /* Reuse darkMQ (declared above) — no need for a second matchMedia call.
     Also rebuilds gradient cache so ambient glow colors update with the theme. */
  function updateTheme(e) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = e.matches ? '#f4f0ff' : '#0d0818';
    if (cachedGrad1) buildGradients(); /* cachedGrad1 is null before init() runs */
  }
  darkMQ.addEventListener('change', updateTheme);
  updateTheme(darkMQ);

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

    /*
      When the menu opens, move keyboard focus to the first link inside it.
      WHY: After activating the hamburger button, keyboard users expect Tab to
      enter the newly visible menu. Without this, focus stays on the hamburger
      and users must Tab past it (and any other elements) before reaching the
      menu links. Moving focus immediately makes the menu feel intentional and
      avoids the "where did my focus go?" problem that affects screen reader users.
      requestAnimationFrame delays the focus until the browser has painted the
      newly opened menu, so the focus move is visible and not cancelled by the
      display transition.
    */
    if (isOpen) {
      const firstLink = mobileNav.querySelector('a');
      if (firstLink) requestAnimationFrame(() => firstLink.focus());
    }
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
