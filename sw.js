/* ================================================================
   📖 STUDY GUIDE — sw.js
   Other You: Multiverse Date Night
   ================================================================

   WHAT THIS FILE DOES
   -------------------
   This is your app's offline superpower. sw.js is a Service Worker
   — a special JavaScript file that runs invisibly in the background
   and intercepts every network request your app makes. It decides
   whether to pull a file from a local stockpile (the cache) or fetch
   it fresh from the internet. Without it, Other You would break with
   no Wi-Fi, couldn't be installed on a phone's home screen, and would
   load slower on every single visit.

   WHAT YOU'LL LEARN IN THIS FILE
   --------------------------------
   By reading through this file, you'll understand:
   - What a Service Worker is and why browsers invented it
   - The three-phase SW lifecycle: Install → Activate → Fetch
   - How to control browser caching with JavaScript
   - The "Cache First" offline strategy
   - How JavaScript Promises and .then() chains work in practice
   - Why you sometimes have to clone an HTTP response

   HOW THIS FILE CONNECTS TO THE REST OF THE APP
   -----------------------------------------------
   index.html registers this file with one line near the bottom:
   navigator.serviceWorker.register('/sw.js'). After that, the
   browser keeps sw.js running in the background across sessions.
   index.html also listens for a 'controllerchange' event — when a
   new version of this SW activates, the page reloads automatically
   so users always get the freshest version of the app.

   PREREQUISITES
   -------------
   Before this file will make full sense, it helps to understand:
   - What an HTTP GET request is (the browser "asking" a server for
     a file by its URL)
   - The basic idea of JavaScript variables and functions
   We'll introduce Promises right here in this file — no prior
   knowledge needed.

================================================================ */


/* ┌─────────────────────────────────────────────────────────────┐
   │  💡 CONCEPT: The Service Worker                             │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  Normally, your browser talks directly to the internet:     │
   │  "Hey server, give me that image." The server responds.     │
   │  Done. You had no say in what happened.                     │
   │                                                             │
   │  A Service Worker makes you the middleman. Picture it as    │
   │  a mail sorting room that every package passes through.     │
   │  You can deliver packages from your own stockroom (cache),  │
   │  send someone to pick it up fresh (network), or — if the    │
   │  post office is closed (no internet) — still serve what's   │
   │  already in the stockroom.                                  │
   │                                                             │
   │  This is what makes "Progressive Web Apps" (PWAs) special:  │
   │  they load instantly, work offline, and can be installed on  │
   │  your phone's home screen like a native app.                │
   │                                                             │
   │  Important rule: Service Workers run in their OWN thread,   │
   │  completely separate from the page. They can't touch the    │
   │  HTML (the DOM). Their only superpower is intercepting       │
   │  network requests and managing caches.                      │
   │                                                             │
   │  In our app: sw.js is that sorting room for every file      │
   │  Other You needs — the HTML, images, icons, everything.     │
   └─────────────────────────────────────────────────────────────┘ */


/* ================================================================
   📚 SECTION 1: Configuration
   ================================================================

   WHAT THIS SECTION DOES
   -----------------------
   Declares two constants that drive the entire caching system:
   a versioned name for our cache storage, and a list of files to
   download into the cache during installation — before the app
   even gets its first visitor.

   KEY CONCEPTS IN THIS SECTION
   -----------------------------
   → const (constant)
     A variable whose value is set once and never changed. We use
     const here because these are configuration values — they should
     stay fixed while the app is running. If we tried to reassign
     CACHE_NAME later, JavaScript would throw an error.

   → The Browser Cache API
     The browser gives us a key-value storage system called the
     Cache API. Think of it as a labeled filing cabinet:
     - The cabinet has a name (CACHE_NAME — like the label on the
       cabinet door)
     - Each drawer holds one pair: a URL (the request) and the
       file that goes with it (the response)
     You can open a cabinet by name, add files to it, look things
     up by URL, or delete the entire cabinet. That's the Cache API.

   WHY WE DID IT THIS WAY
   -----------------------
   Putting a version number in the cache name ('other-you-v5') is
   the secret to seamless app updates. When you deploy a new version,
   you bump the number to 'other-you-v6'. The browser sees sw.js has
   changed, installs a fresh cache, and automatically deletes the old
   one in the activate step below. Without this, users could be stuck
   with stale cached files indefinitely — even after you push a fix.

================================================================ */

// 📌 WHAT: A version-stamped name for our cache storage cabinet.
// 📌 WHY:  When we deploy updates, we increment this number (v5 → v6).
//          The activate event uses it to identify which caches are
//          "old" and should be deleted. Rule: bump this every deploy.
const CACHE_NAME = 'other-you-v5';

// 📌 WHAT: The list of files to cache the moment the SW installs.
// 📌 WHY:  These are the files the app absolutely needs to load —
//          even with zero internet connection. We're pre-stocking
//          the pantry before the first visitor arrives.
//
//          Notice: Google Fonts and CDN scripts (like QRCode.js)
//          are NOT listed here. Those files live on other servers
//          (different "origins"). Caching them during install can
//          fail silently due to cross-origin restrictions. Instead,
//          the fetch handler below caches them automatically on
//          first use.
//
//          Also notice: we list '/' but not '/index.html'. On a web
//          server, '/' automatically serves index.html — they refer
//          to the same file. Caching '/' is the correct way to
//          capture it.
const PRECACHE = [
  '/',                            // the app itself (serves index.html)
  '/manifest.json',               // PWA metadata for install prompts
  '/assets/icon-192.png',         // home screen icon (small)
  '/assets/icon-512.png',         // home screen icon (large)
  '/assets/favicon.ico',          // browser tab icon
  '/assets/apple-touch-icon.png', // iPhone home screen icon
  '/assets/logo-icon.svg',        // app logo used in the UI
  '/assets/og-image.png',         // social share preview image
];

/* ================================================================
   ✅ SECTION 1 REVIEW
   ================================================================

   You just read through Configuration. Here's what to remember:

   1. CACHE_NAME is a versioned label — bump the number on every
      deploy to force users to receive fresh files.
   2. PRECACHE is your app's survival kit — these files get loaded
      into the cache before any user ever visits.
   3. Cross-origin files (Google Fonts, CDN scripts) can't be
      pre-cached safely, so we let the fetch handler handle them.

   COMMON MISTAKES TO AVOID
   -------------------------
   ⚠️  Don't forget to bump CACHE_NAME when you deploy. If you
       change a CSS rule but leave the cache name the same, users
       will keep getting the old CSS from cache and wonder why
       nothing looks different.
   ⚠️  Don't add external URLs (https://fonts.googleapis.com/...)
       to PRECACHE. They can fail and break the entire install step.

   COMING UP NEXT
   --------------
   In the next section we'll look at the Install event, where we
   actually open the cache and load these files into it for the
   first time.

================================================================ */


/* ================================================================
   📚 SECTION 2: The Install Event
   ================================================================

   WHAT THIS SECTION DOES
   -----------------------
   Runs once when the browser first downloads this sw.js file (or
   detects a new version of it). It opens our named cache and loads
   every file in PRECACHE into it. If any file fails to download,
   the entire install fails — ensuring we never activate a SW with
   an incomplete cache.

   KEY CONCEPTS IN THIS SECTION
   -----------------------------
   → Event Listeners (addEventListener)
     In JavaScript, "events" are things that happen: a button click,
     a page load, a network request. addEventListener says: "When
     THIS event fires, run THIS function." Service Workers have their
     own special events — install, activate, and fetch — that the
     browser fires at key moments in the SW lifecycle.

   → self
     Inside a Service Worker, 'self' refers to the SW itself —
     the way 'window' refers to the browser tab in regular JS. It's
     how the SW listens for its own lifecycle events.

   → event.waitUntil()
     This is crucial. Without it, the browser might declare the
     install "done" and move on before the files finish downloading.
     waitUntil() says: "Hold on. Don't mark this event complete until
     this Promise resolves." If the Promise rejects (a file fails to
     download), the install fails too — which is exactly what we want.
     A broken SW should never activate and take over from a working one.

   WHY WE DID IT THIS WAY
   -----------------------
   cache.addAll() is all-or-nothing: if any single file in the list
   fails to download, the entire Promise rejects and the install is
   aborted. This is intentional. We'd rather have no SW at all than
   a SW that's missing critical files and serves a broken app.

================================================================ */


/* ┌─────────────────────────────────────────────────────────────┐
   │  💡 CONCEPT: Promises and .then() Chains                    │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  Many operations in JavaScript take time — fetching a file, │
   │  reading from storage, waiting on the network. These        │
   │  operations return a Promise: an object that says "I don't  │
   │  have the result yet, but I promise I'll have it soon."     │
   │                                                             │
   │  When the result arrives, the Promise "resolves." You can   │
   │  attach a .then() callback to run code with that result:    │
   │                                                             │
   │    fetchFile('photo.jpg')         // returns a Promise      │
   │      .then(file => show(file))    // runs when it resolves  │
   │      .catch(err => warn(err))     // runs if it fails       │
   │                                                             │
   │  You can chain .then() calls — each one receives the        │
   │  previous one's return value and passes its own result      │
   │  forward. Think of it as an assembly line: station 1 opens  │
   │  the cache, station 2 loads the files, station 3 activates. │
   │                                                             │
   │  In this file: every event handler uses Promise chains to   │
   │  sequence async operations without freezing the browser.    │
   │  You'll see .then() throughout — once you understand it     │
   │  here, the rest of the file is just this same pattern.      │
   └─────────────────────────────────────────────────────────────┘ */


/* ----------------------------------------------------------------
   EVENT LISTENER: install
   ----------------------------------------------------------------
   WHAT IT DOES:
   Opens the versioned cache and downloads every file in PRECACHE
   into it. Then calls skipWaiting() to activate the new SW
   immediately rather than waiting for old tabs to close.

   PARAMETERS:
   → event  [InstallEvent]  Provided automatically by the browser.
                            We use event.waitUntil() to hold the
                            install open until our async work is done.

   RETURNS: nothing directly.
   (Communicates with the browser via event.waitUntil().)

   CALLED BY: the browser automatically, once, when sw.js is first
   downloaded or when the browser detects a new version of it.

   MENTOR NOTE:
   The .then() chain here reads like a recipe in order:
     Step 1 — open the cache cabinet by name
     Step 2 — download all PRECACHE files into it
     Step 3 — tell this new SW to activate right away
   Each step only runs after the previous one succeeds.
---------------------------------------------------------------- */
self.addEventListener('install', event => {
  event.waitUntil(
    // 📌 WHAT: Open (or create) the cache cabinet named CACHE_NAME.
    // 📌 WHY:  caches.open() returns a Promise. When it resolves,
    //          it hands us a Cache object we can put files into.
    caches.open(CACHE_NAME)

      // 📌 WHAT: Download every URL in the PRECACHE array into the cache.
      // 📌 WHY:  cache.addAll() fetches each URL from the network and
      //          stores the request+response pair. If ANY single file
      //          fails, the entire Promise rejects — install aborts.
      //          This "all or nothing" approach prevents a broken SW
      //          from ever taking control.
      .then(cache => cache.addAll(PRECACHE))

      // 📌 WHAT: Tell this new SW to skip the normal waiting period.
      // 📌 WHY:  Normally, a newly installed SW waits until ALL tabs
      //          using the OLD SW are closed before it activates. That
      //          could be days if the user never refreshes.
      //          self.skipWaiting() cuts that wait entirely — the new
      //          SW activates the moment installation finishes.
      //          Paired with clients.claim() in activate, this means
      //          users get updates silently and automatically.
      .then(() => self.skipWaiting())
  );
});

/* ================================================================
   ✅ SECTION 2 REVIEW
   ================================================================

   You just read through the Install Event. Here's what to remember:

   1. The install event fires once when the browser first sees this
      SW (or detects a new version of it).
   2. event.waitUntil() holds the install open until the cache is
      fully loaded — an incomplete install is treated as a failure.
   3. cache.addAll() is all-or-nothing: one failed download cancels
      the entire install step.
   4. skipWaiting() lets the new SW skip the line and activate
      without waiting for old tabs to close.

   COMMON MISTAKES TO AVOID
   -------------------------
   ⚠️  If you add a URL to PRECACHE that returns a 404, addAll()
       will reject and the SW will never install. Test your URL list
       after making any changes.
   ⚠️  Don't confuse "cached" with "saved forever." The browser can
       evict caches when storage runs low. The app handles missing
       files gracefully via the fetch handler's network fallback.

   COMING UP NEXT
   --------------
   In the next section we'll look at the Activate event, which runs
   right after install and handles cleaning up old cache versions.

================================================================ */


/* ================================================================
   📚 SECTION 3: The Activate Event
   ================================================================

   WHAT THIS SECTION DOES
   -----------------------
   Runs after installation completes. Its job is cleanup: it scans
   every cache the browser has stored for this app and deletes any
   that don't match the current CACHE_NAME. Then it claims immediate
   control of all open tabs so the new SW starts handling requests
   right away.

   KEY CONCEPTS IN THIS SECTION
   -----------------------------
   → Promise.all()
     Sometimes you need to run multiple async operations at once and
     wait for ALL of them to finish. Promise.all() takes an array of
     Promises and returns a single Promise that resolves only when
     every single one has resolved. Think of it like a group project
     — it's not submitted until every team member has finished.

   → Array .filter() and .map()
     Two of the most useful array methods in JavaScript:
     - .filter(fn) returns a new array containing only items where fn
       returns true. Like a sieve — it keeps what passes, drops the rest.
     - .map(fn) returns a new array where every item has been
       transformed by fn. Like a conveyor belt that changes each item
       as it passes through.
     Here we filter down to old cache names, then map each one into a
     delete operation (which returns a Promise), then pass the whole
     array to Promise.all() to run all deletes at once.

   WHY WE DID IT THIS WAY
   -----------------------
   Each time we deploy and bump CACHE_NAME, old caches accumulate in
   the browser. A user could end up with 'other-you-v1' through
   'other-you-v5' all sitting there unused, eating storage. This step
   cleans house by deleting everything except the current version.

================================================================ */

/* ----------------------------------------------------------------
   EVENT LISTENER: activate
   ----------------------------------------------------------------
   WHAT IT DOES:
   Gets the names of all caches this app has ever created, deletes
   any that aren't the current version, then calls clients.claim()
   to immediately take control of every open tab.

   PARAMETERS:
   → event  [ExtendableEvent]  Provided automatically by the browser.
                               We use event.waitUntil() to hold the
                               activation open during cleanup.

   CALLED BY: the browser automatically, once, after a successful
   install, when the new SW is ready to replace any previous version.

   MENTOR NOTE:
   The logic here chains three operations: get all cache names →
   filter to old ones → delete them all in parallel. The
   filter → map → Promise.all pattern is a classic JavaScript move
   you'll use constantly. Read the inline comments slowly and trace
   each transformation step by step.
---------------------------------------------------------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    // 📌 WHAT: Get the names of ALL caches this app has ever created.
    // 📌 WHY:  We need the full list before we can figure out which
    //          ones are outdated. caches.keys() returns a Promise that
    //          resolves to an array of name strings — for example:
    //          ['other-you-v3', 'other-you-v4', 'other-you-v5'].
    caches.keys().then(keys =>
      Promise.all(
        keys
          // 📌 WHAT: Keep only the cache names that are NOT the current version.
          // 📌 WHY:  We want to delete old caches but preserve ours.
          //          .filter() returns a new array containing only items
          //          where the condition is true. If keys is ['v3', 'v4',
          //          'v5'] and CACHE_NAME is 'other-you-v5', filter gives
          //          us ['other-you-v3', 'other-you-v4'] — the old ones only.
          .filter(key => key !== CACHE_NAME)

          // 📌 WHAT: Transform each old cache name into a delete operation.
          // 📌 WHY:  .map() converts every item in the array. caches.delete()
          //          returns a Promise. So .map() turns the array of old cache
          //          name strings into an array of Promises — one delete
          //          operation per old cache. We pass this array to
          //          Promise.all() (wrapping it above) to run them all at once.
          .map(key => caches.delete(key))
      )

    // 📌 WHAT: After all old caches are deleted, claim all open tabs.
    // 📌 WHY:  Without this, tabs that were open BEFORE this SW activated
    //          would still be controlled by the old SW until the user
    //          manually reloads. clients.claim() instantly transfers
    //          control of every open tab to this new SW — no reload needed.
    //          Together with skipWaiting() in the install handler, this
    //          pair makes updates completely seamless and automatic.
    ).then(() => self.clients.claim())
  );
});

/* ================================================================
   ✅ SECTION 3 REVIEW
   ================================================================

   You just read through the Activate Event. Here's what to remember:

   1. Activate runs after install. Its main job is deleting old caches
      so storage doesn't accumulate across deploys.
   2. filter() → map() → Promise.all() is a classic JavaScript pattern:
      narrow down a list, convert each item into an async operation,
      then run them all at once and wait for everything to finish.
   3. clients.claim() + skipWaiting() work as a pair: skip the wait,
      then seize control. Together they make updates instant.

   COMMON MISTAKES TO AVOID
   -------------------------
   ⚠️  If you forget to bump CACHE_NAME between deploys, the filter
       step won't find anything to delete — old cached files will
       survive indefinitely and users will get stale content.
   ⚠️  Don't accidentally delete the current cache. The filter uses
       key !== CACHE_NAME specifically to protect it from deletion.

   COMING UP NEXT
   --------------
   In the next section we'll look at the Fetch event — the heart
   of the whole file. This is where the "Cache First" strategy lives
   and where every single network request gets handled.

================================================================ */


/* ================================================================
   📚 SECTION 4: The Fetch Event
   ================================================================

   WHAT THIS SECTION DOES
   -----------------------
   This event fires for every network request the app makes — loading
   the page, fetching an image, loading a font. It implements the
   "Cache First" strategy: check the cache first and serve instantly
   if found; otherwise go to the network, save the result to cache,
   and return it. If both fail (offline + not cached), return the app
   shell so the user sees Other You instead of a browser error page.

   KEY CONCEPTS IN THIS SECTION
   -----------------------------
   → The Fetch Event and event.respondWith()
     Every time any resource is requested, the browser fires a fetch
     event through this SW. event.respondWith() lets us hand back our
     OWN response instead of the default network one. This is how we
     intercept and redirect requests to the cache.

   → Cache First vs Network First
     Two common caching strategies:
     - Cache First: check cache → serve instantly if found → go to
       network only on a miss. Best for files that rarely change
       (icons, fonts, the app shell). Fastest for the user.
     - Network First: always try the network → fall back to cache if
       offline. Best for data that changes frequently. Slightly slower.
     We use Cache First because Other You is an app shell PWA — the
     core files only change when we deploy (and bump CACHE_NAME).

   → Opaque Responses
     When you fetch a file from ANOTHER website (like Google Fonts),
     the browser blocks you from reading the response details for
     security reasons. These are called "opaque" responses — they
     have a type of 'opaque' and a status code of 0, even if the
     request succeeded. We skip caching them because we can't verify
     whether they're a valid file or an error page.

   WHY WE DID IT THIS WAY
   -----------------------
   Cache First is ideal for our use case because app files only change
   when we deploy. Between deploys, serving from cache is always
   correct AND faster than a network round-trip. The network fallback
   ensures we still get files the user has never loaded before, and
   the navigate fallback gives a graceful offline experience.

================================================================ */


/* ┌─────────────────────────────────────────────────────────────┐
   │  💡 CONCEPT: The Cache First Strategy                       │
   ├─────────────────────────────────────────────────────────────┤
   │                                                             │
   │  When your app loads, it makes dozens of network requests:  │
   │  the HTML page, images, fonts, icons. Without a strategy,   │
   │  every single one trips to the server — slow every time.    │
   │                                                             │
   │  Cache First flips the order:                               │
   │                                                             │
   │    1. Check the cache. Do we already have this file?        │
   │       YES → return it immediately. Fast. Done.              │
   │       NO  → continue to step 2.                             │
   │                                                             │
   │    2. Ask the network for the file.                         │
   │       SUCCESS → save a copy to cache, return the file.      │
   │       FAIL (offline) → continue to step 3.                  │
   │                                                             │
   │    3. Is this a page navigation (the user opening the app)?  │
   │       YES → return the cached app shell ('/') as a fallback  │
   │             so they see Other You, not a browser error.     │
   │       NO  → let the request fail silently.                  │
   │                                                             │
   │  After the first visit, almost everything loads from cache.  │
   │  The app feels instant. And it works on a plane.            │
   └─────────────────────────────────────────────────────────────┘ */


/* ----------------------------------------------------------------
   EVENT LISTENER: fetch
   ----------------------------------------------------------------
   WHAT IT DOES:
   Intercepts every GET network request made by the app. Tries to
   serve it from cache first (fast + offline-capable). On a cache
   miss, fetches from the network and caches the result for next
   time. If both fail, returns the cached app shell for page
   navigations so the user always sees something useful.

   PARAMETERS:
   → event  [FetchEvent]  Provided automatically by the browser.
                          Contains event.request (the URL being
                          requested) and event.respondWith() (the
                          method we call to substitute our own
                          response).

   NOTE ON NON-GET REQUESTS:
   Only GET requests are intercepted. POST, PUT, DELETE, and PATCH
   go straight through to the network unchanged. This is correct:
   those methods send data TO a server and must never be cached.

   CALLED BY: the browser, automatically, for every fetch() call
   or resource load made by any page this SW controls.

   MENTOR NOTE:
   This is the most layered function in the file — a .then() chain
   nested inside another .then(). Take it slow. Draw it as a
   flowchart if it helps:
     cache hit? → done.
     cache miss → network → success? cache + return. fail? fallback.
---------------------------------------------------------------- */
self.addEventListener('fetch', event => {
  // 📌 WHAT: Ignore any request that isn't a simple GET.
  // 📌 WHY:  POST, PUT, and DELETE requests send data to a server.
  //          Intercepting them would break form submissions, API calls,
  //          and any data-saving operation. The 'return' here exits
  //          the handler early, letting the browser handle it normally.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 📌 WHAT: Search every open cache for a stored copy of this request.
    // 📌 WHY:  caches.match() checks ALL caches at once (not just
    //          CACHE_NAME). It returns a Promise that resolves to the
    //          cached Response, or undefined if nothing matches.
    caches.match(event.request)
      .then(cached => {

        // 📌 WHAT: If we found it in cache, return it immediately.
        // 📌 WHY:  This is the "Cache First" payoff. No network trip,
        //          no waiting — the file was already here. This is what
        //          makes the app feel instant and work offline.
        if (cached) return cached;

        // ── CACHE MISS: the file isn't cached — go to the network ────

        // 📌 WHAT: The file wasn't in cache — ask the network for it.
        // 📌 WHY:  fetch(event.request) re-issues the original request
        //          to the actual server, exactly like a normal browser
        //          would. It returns a Promise that resolves to the
        //          server's Response — or rejects if we're offline.
        return fetch(event.request)
          .then(response => {

            // 📌 WHAT: Guard against responses we should NOT cache.
            // 📌 WHY:  We only want to cache successful responses from
            //          our own server. Three cases to skip:
            //
            //          1. !response — no response at all; something
            //             went wrong at a very low level.
            //          2. response.status !== 200 — a 404 "not found"
            //             or 500 "server error." Don't cache errors or
            //             the user gets stuck with them forever.
            //          3. response.type === 'opaque' — a cross-origin
            //             response we can't inspect. Its status always
            //             reads as 0 even if it's actually an error page.
            //             Too risky to cache.
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response; // pass it back to the page; just don't cache it
            }

            // 📌 WHAT: Make a copy of the response before using it in two places.
            // 📌 WHY:  An HTTP Response is like a garden hose — water only
            //          flows through once. The moment you consume it (send it
            //          to the page), it's empty. But we need to BOTH cache it
            //          AND return it to the page.
            //
            //          response.clone() creates an exact duplicate:
            //          → toCache goes into the cache
            //          → response goes back to the page
            //
            //          Without this, whichever happened second would get
            //          an empty, already-consumed response and silently fail.

            // ⭐ GREAT PATTERN: Using response.clone() before consuming a
            //    Response in two places is standard professional practice.
            //    Getting this right is genuinely good code.
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            return response;
          })

          .catch(() => {
            // 📌 WHAT: Both cache AND network failed — we're offline and
            //          this file was never cached on a previous visit.
            // 📌 WHY:  For page navigations (the user opening the app
            //          directly), returning nothing means the browser shows
            //          its own "No internet" error page — ugly and confusing.
            //          Instead, we return the cached '/' app shell so the
            //          user sees Other You, even if fresh data can't load.
            //
            //          event.request.mode === 'navigate' is true when the
            //          browser is loading a full page (a URL in the address
            //          bar), as opposed to a sub-resource like a script,
            //          image, or stylesheet.
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // 📌 WHAT: For non-navigation requests (images, scripts, fonts),
            //          return nothing and let them fail silently.
            // 📌 WHY:  A broken image or missing icon is acceptable. What
            //          we want to avoid is the whole page disappearing with
            //          a browser error screen. Sub-resource failures are
            //          invisible to the user in most cases.
          });
      })
  );
});

/* ================================================================
   ✅ SECTION 4 REVIEW
   ================================================================

   You just read through the Fetch Event. Here's what to remember:

   1. The fetch event fires for every GET request. event.respondWith()
      lets us substitute our own response for the browser's default.
   2. Cache First: check cache → cache hit returns instantly. Cache
      miss goes to network → success gets cached for next time.
   3. Never cache opaque (cross-origin) responses — you can't tell
      if they're errors. Never cache non-200 responses — don't let
      users get stuck with a cached 404.
   4. Always clone a Response before using it in two places — it's
      a one-time-read stream, not a reusable value.
   5. The navigate fallback ensures users always see the app shell
      instead of the browser's "No internet" error page.

   COMMON MISTAKES TO AVOID
   -------------------------
   ⚠️  Don't skip response.clone(). Returning a Response to the page
       AND caching it without cloning first will leave one of them
       with an empty, already-consumed response that silently fails.
   ⚠️  Don't cache opaque responses. A CDN error will have status 0
       and type 'opaque' — if you cache it, the user gets that broken
       response served forever, even after they go back online.

================================================================ */


/* ================================================================
   📖 CHAPTER SUMMARY — sw.js
   ================================================================

   WHAT YOU LEARNED IN THIS FILE
   ------------------------------
   - Service Worker — a background JS file that intercepts network
     requests; the engine that makes PWAs work offline
   - SW Lifecycle — Install (cache files) → Activate (clean old
     caches) → Fetch (handle every request)
   - Cache API — browser key-value storage for request/response
     pairs; opened by name, versioned for safe updates
   - PRECACHE — the survival kit of files downloaded at install
     time, before any user ever visits the app
   - event.waitUntil() — holds a lifecycle event open until an
     async operation finishes; prevents partial installs/activates
   - Promises and .then() — the async pattern used throughout;
     each .then() runs after the previous Promise resolves
   - Cache First strategy — serve from cache for speed and offline
     support; fall back to the network only on a miss
   - Promise.all() — runs multiple async operations in parallel and
     waits for ALL of them to finish before continuing
   - .filter() and .map() — array transforms: narrow a list, then
     convert each item into something new
   - response.clone() — required when using a Response in two
     places; HTTP streams can only be consumed once
   - Opaque responses — cross-origin responses with status 0;
     unsafe to cache because you can't verify they succeeded
   - skipWaiting() + clients.claim() — the update pair: skip the
     waiting period, then immediately claim all open tabs

   HOW THIS FITS INTO THE BIGGER PICTURE
   ---------------------------------------
   The service worker is the invisible engine behind Other You's PWA
   powers. Next, look at manifest.json — that file handles the other
   half of the PWA story: how the app presents itself when installed
   on a device (name, theme color, icon, display mode).

   THINGS TO EXPLORE ON YOUR OWN
   --------------------------------
   Want to go deeper? Try these:

   - Open Chrome DevTools → Application → Service Workers. You can
     see your SW's live status (activated, running) and force an
     update to test the new-version flow.

   - In the same DevTools panel, open Cache Storage. You'll see
     'other-you-v5' with every file we pre-cached listed inside it.

   - Try bumping CACHE_NAME to 'other-you-v6', reloading the page,
     and watching the old cache disappear in DevTools. This is the
     deploy update cycle you'll use every time you ship a change.

   - Look up "Workbox" — Google's open-source library that automates
     the exact patterns you just hand-coded here. Once you understand
     what this file does, Workbox will make perfect sense.

   - Research "Stale While Revalidate" — a fourth caching strategy
     that serves from cache instantly while fetching a fresh copy in
     the background. Great for content that changes but isn't critical.

   GLOSSARY FOR THIS FILE
   -----------------------
   Cache API — a browser storage system for saving HTTP responses
     by their request URL; like a personal filing cabinet for files.

   Cache First — a caching strategy where the cache is checked
     before the network; fastest for rarely-changing static files.

   clients.claim() — a SW method that immediately takes control of
     all open browser tabs without waiting for a page reload.

   const — a JavaScript keyword for a variable whose value can
     never be reassigned after it's first set.

   event.respondWith() — tells the browser: "use THIS response
     instead of the one you'd normally fetch from the network."

   event.waitUntil() — tells the browser: "don't mark this lifecycle
     event complete until this Promise resolves."

   .filter(fn) — an array method that returns a new array containing
     only the items where fn returns true; like a sieve.

   .map(fn) — an array method that returns a new array where every
     item has been transformed by fn; like a conveyor belt.

   Opaque response — a cross-origin HTTP response the browser blocks
     you from reading; has type 'opaque' and a status code of 0.

   PRECACHE — the array of file URLs downloaded into cache during
     the install step; the app's offline survival kit.

   Promise — an object representing the eventual result of an async
     operation; like a ticket that says "your result is coming."

   Promise.all() — takes an array of Promises and resolves only
     when every single one has resolved.

   Progressive Web App (PWA) — a website built with web technologies
     that can be installed on a device and work offline; requires a
     manifest.json and a service worker.

   response.clone() — creates an exact copy of an HTTP Response;
     needed when you want to use the same response in two places.

   self — inside a Service Worker, refers to the SW's own global
     scope; equivalent to 'window' in a regular browser page.

   Service Worker (SW) — a background JavaScript file that acts as
     a programmable network proxy; intercepts requests, manages
     caches, and enables offline use for PWAs.

   skipWaiting() — tells a newly installed SW to activate
     immediately, skipping the wait for old tabs to close.

================================================================ */
