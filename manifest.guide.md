# 📖 STUDY GUIDE — manifest.json
## Other You: Multiverse Date Night

---

> **Why a separate file?**
> JSON — the format `manifest.json` uses — has no comment syntax. Unlike
> JavaScript or CSS, you cannot write `//` or `/* */` in a JSON file. If you
> try, the browser rejects the file entirely and your PWA breaks. This isn't
> an oversight; JSON was designed to be a pure data format, not a place for
> human notes. So this guide lives alongside it instead of inside it. Open
> both files at the same time — this one explains, that one works.

---

## WHAT THIS FILE DOES

`manifest.json` is your app's identity card. Every Progressive Web App
(PWA) needs one. It tells the browser — and any device that installs the
app — critical facts about Other You: its name, its colors, which icons to
use, how it should behave when launched from the home screen, and more.

Without `manifest.json`, the browser wouldn't know how to present your app
for installation. There would be no "Add to Home Screen" prompt, no splash
screen color, no standalone window — just a regular website.

---

## WHAT YOU'LL LEARN IN THIS FILE

By reading through this guide, you'll understand:

- What JSON is and why it has the rules it does
- How `manifest.json` connects to the service worker to form a complete PWA
- What every field in the manifest controls (and what happens if you leave one out)
- The difference between `name` and `short_name`, and why both exist
- What `display: "standalone"` actually does to a browser window
- Why icons need two separate entries for the same size
- What `theme_color` and `background_color` actually control (they're not the same thing)

---

## HOW THIS FILE CONNECTS TO THE REST OF THE APP

`manifest.json` is referenced in `index.html` with a single line in the
`<head>`:

```html
<link rel="manifest" href="/manifest.json">
```

That link is what tells the browser this app is installable. The browser
reads the manifest to learn everything it needs for installation. Meanwhile,
`sw.js` (the service worker) handles offline behavior. Together, these two
files — the manifest and the service worker — are what make Other You a
"real" PWA.

`manifest.json` is also listed in `sw.js`'s `PRECACHE` array, which means
it gets downloaded and cached at install time. Even offline, the browser
can always access the app's identity.

---

## PREREQUISITES

Before this file will make full sense, it helps to understand:

- What a Progressive Web App (PWA) is — covered in the `sw.js` study guide
- What a URL path like `"/"` means (it refers to the root of the website,
  which serves `index.html`)

---

## 💡 CONCEPT: What Is JSON?

JSON stands for **JavaScript Object Notation**. It's a way of writing
structured data using a format that both humans and computers can read.

Here's the key idea: JSON is just data. No logic, no functions, no
comments. Just organized information in a standard shape:

```json
{
  "key": "value",
  "another_key": 42,
  "a_list": ["item1", "item2"]
}
```

Rules JSON always follows (break these and the file is invalid):
- Keys must be wrapped in double quotes: `"name"` not `name`
- Strings must use double quotes: `"Other You"` not `'Other You'`
- No trailing commas after the last item in a list or object
- No comments — not even `//` on its own line

JSON is used everywhere on the internet to send data between apps and
servers. It's also used for config files like `manifest.json` because
its strict, predictable format makes it easy for machines to parse.

---

## SECTION 1: App Identity

```json
"name": "Other You · Multiverse Date Night",
"short_name": "Other You",
"description": "A private app for couples to date each other's alternate selves — the roads not taken, the versions that almost were.",
```

### What these fields do

**`name`** — The full name of the app. Used in install prompts, the
operating system's app list, and anywhere the OS needs a complete label.

**`short_name`** — A shorter version for space-constrained places — most
importantly, the label underneath your icon on a phone's home screen. Home
screen labels typically have room for 10–15 characters before they get cut
off. "Other You" fits perfectly; "Other You · Multiverse Date Night" would
not.

**`description`** — A plain English sentence explaining the app. Used in
app store listings, browser install banners, and accessibility tools. This
one is beautifully written — clear, specific, and evocative.

### Why we did it this way

Having two separate name fields (`name` and `short_name`) lets us be
precise in both contexts without compromise. The full name is rich and
descriptive for places where it fits. The short name is practical and
clean for the home screen where space is precious.

> ⭐ **Great detail:** The `description` field is often left generic or
> skipped entirely. Yours is specific and genuinely captures what the app
> does and *why* — that matters for accessibility tools and discovery.

---

## SECTION 2: Launch Behavior

```json
"start_url": "/",
"scope": "/",
"display": "standalone",
"orientation": "portrait-primary",
```

### What these fields do

**`start_url`** — The URL that opens when someone launches the installed
app from their home screen. `"/"` means the root of the site — which
serves `index.html`, your main app file. You could set this to a specific
path like `"/onboarding"` if you wanted first-time users to land somewhere
other than the default screen.

**`scope`** — Defines the boundary of your PWA. Any URL within the scope
stays inside the app's standalone window. Any URL outside the scope opens
in the regular browser. `"/"` means the entire site is within scope —
every page on your origin is part of the app experience.

**`display`** — Controls how much of the browser's UI is shown when the
app is running installed. Four options exist:

| Value | What it looks like |
|---|---|
| `"browser"` | Normal browser with address bar, tabs — no different from a website |
| `"minimal-ui"` | A small back/forward button, no address bar |
| `"standalone"` | No browser UI at all — looks exactly like a native app |
| `"fullscreen"` | Full screen, no status bar even — used for games |

We use `"standalone"` because Other You is meant to feel like a real app,
not a website. When you launch it from the home screen, there's no address
bar, no browser tab strip — just the app.

**`orientation`** — Locks the app to a specific screen rotation.
`"portrait-primary"` means it always opens vertically (phone held upright)
and won't rotate sideways. This is the right choice for Other You because
the UI is designed for portrait layout.

### Why we did it this way

`start_url: "/"` is the standard choice for a single-page app like this
one, where all the functionality lives in `index.html`. Locking orientation
to portrait prevents layout issues if a user accidentally rotates their
phone — the app always looks the way it was designed to look.

---

## SECTION 3: Visual Branding

```json
"theme_color": "#0d0818",
"background_color": "#0d0818",
```

### What these fields do

These two fields look similar but control different things:

**`theme_color`** — The color of the browser's UI chrome when your app is
open. On Android, this colors the status bar at the top of the screen (the
bar with your clock and signal strength). On some desktop browsers, it also
tints the window title bar. It gives the whole OS experience a cohesive
look that matches your app.

**`background_color`** — The color shown behind the app icon on the
**splash screen** — the brief loading screen that appears while the app
first starts up (on Android, this is the screen shown between tapping the
icon and the app fully rendering). It should match your app's actual
background color so the transition from splash screen to loaded app feels
seamless instead of jarring.

### Why they're both the same here

`#0d0818` is the deep dark purple-black background that runs throughout
Other You. Using it for both fields means:
- The status bar blends into the app's dark aesthetic
- The splash screen is already the right color, so there's no flash of a
  different background as the app loads

> 📌 **Tip:** If you ever redesign the app with a different background
> color, update both of these fields at the same time. A mismatched
> `background_color` creates a jarring flash on startup.

---

## SECTION 4: App Store Metadata

```json
"categories": ["lifestyle", "social"],
"lang": "en",
```

### What these fields do

**`categories`** — Tags that classify the app for browser-based app
directories and discovery features. The valid values are defined by the
W3C spec (the organization that writes the web standards). `"lifestyle"` and
`"social"` are reasonable fits for a couples app.

**`lang`** — Declares the primary language of the app. `"en"` is the
ISO 639-1 code for English. This helps browsers, search engines, and
screen readers understand the app's content language without having to
guess.

### Why we did it this way

These fields are optional in the sense that the app works without them —
but they're good hygiene. `lang` in particular matters for accessibility:
screen readers adjust their pronunciation and behavior based on the
declared language. A screen reader reading English text in the wrong
language voice sounds like nonsense.

---

## SECTION 5: Icons

```json
"icons": [
  {
    "src": "/assets/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/assets/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "/assets/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/assets/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

### What these fields do

The `icons` array tells the browser which images to use as the app icon
in different contexts — home screen, task switcher, splash screen, app
store listings. Each entry describes one icon file.

**`src`** — The path to the image file.

**`sizes`** — The pixel dimensions of this icon. `"192x192"` and
`"512x512"` are the two sizes required by the PWA standard. 192px covers
most home screen use cases; 512px is used for high-resolution displays
and app store listings.

**`type`** — The image format, declared as a MIME type. `"image/png"` is
PNG format. This helps the browser quickly decide whether it can use this
icon without having to download and inspect the file first.

**`purpose`** — This is the interesting one.

### 💡 CONCEPT: Icon Purpose — `any` vs `maskable`

Different operating systems display app icons differently:

- **iOS** puts your icon in a rounded square. The OS clips the corners.
- **Android (older)** shows your icon as-is, whatever shape it is.
- **Android (newer — "Adaptive Icons")** applies a mask — it can be a
  circle, a squircle, a teardrop, depending on the phone manufacturer.
  The icon is cropped to fit the mask shape.

A `"purpose": "any"` icon is your original icon, used as-is on platforms
that display it without a mask. A `"purpose": "maskable"` icon is a
version designed to be cropped — it has extra padding around the artwork
so the important parts aren't cut off when the mask is applied.

The key rule: **both purpose types need separate entries in the manifest,
even if they use the same image file.** The browser won't infer both
purposes from a single entry — you have to declare them explicitly.

> ⭐ **Great fix from our previous audit:** The original manifest had each
> icon listed once with `"purpose": "any maskable"` in a single entry.
> That older format is deprecated. The current correct approach is exactly
> what you see here — separate entries for each purpose. Well done for
> having this right.

### Why we need two sizes

The spec requires 192×192 and 512×512 as the baseline pair:

- **192px** — used for home screen icons on most Android devices and in
  install prompts
- **512px** — used for splash screens, high-DPI displays, and any context
  where a larger, sharper icon is needed

The browser picks whichever size is most appropriate for the context
automatically — you just provide both and let it decide.

---

## SECTION 6: Optional Fields

```json
"screenshots": [],
"related_applications": [],
"prefer_related_applications": false
```

### What these fields do

**`screenshots`** — An array of screenshot images shown in install prompts
on some browsers (Chrome on Android, for example). When populated, the
install prompt shows a mini preview of the app to help users decide whether
to install it. Currently empty — the app installs fine without them, but
adding screenshots is a nice enhancement.

**`related_applications`** — A list of native app equivalents (like an iOS
App Store or Google Play listing) that the browser might suggest instead of
the PWA. We're not in any app stores, so this is empty.

**`prefer_related_applications`** — If `true`, the browser will suggest
the native app (from `related_applications`) instead of offering to install
the PWA. We want users to install the PWA, so this is `false`.

### Why we kept these

It's good practice to include these fields explicitly even when empty.
Some browser parsers behave differently when fields are absent versus when
they're present but empty — having them declared makes the manifest more
predictable and future-proof if you ever do add screenshots.

---

## ✅ FULL FILE REVIEW

Here's what to remember about `manifest.json`:

1. Every PWA needs a manifest. It's what makes the app installable and
   tells the OS how to present it.
2. `name` is the full label; `short_name` is what appears under the home
   screen icon. Both matter in different places.
3. `display: "standalone"` removes the browser chrome so the app feels
   native. This only takes effect when launched from the home screen.
4. `theme_color` tints the OS status bar; `background_color` fills the
   splash screen. Match both to your app's background to avoid jarring
   flashes.
5. Every icon needs two entries — one `"any"`, one `"maskable"` — for
   different rendering contexts across operating systems.
6. JSON has no comment syntax — that's a format rule, not a limitation of
   the spec or your editor. Use a companion guide like this one.

### Common Mistakes to Avoid

⚠️ Don't put a trailing comma after the last item in a JSON array or object.
   `[1, 2, 3,]` is invalid JSON even though JavaScript allows it.
   One stray comma breaks the entire manifest silently.

⚠️ Don't use single quotes. JSON requires double quotes for all strings.
   `'Other You'` is invalid; `"Other You"` is correct.

⚠️ Don't forget to bump `CACHE_NAME` in `sw.js` when you update
   `manifest.json`. The cached version is what the app uses offline —
   if you update the manifest but not the cache version, installed users
   won't see your changes.

---

## CHAPTER SUMMARY

### What You Learned in This File

- **JSON** — a strict data format with no comments, no single quotes, no
  trailing commas; used everywhere on the web for structured data
- **manifest.json** — the PWA identity card; tells the browser the app's
  name, icon, colors, and launch behavior
- **`name` vs `short_name`** — full label for app lists; short label for
  home screen icons
- **`display: "standalone"`** — removes browser UI when launched installed;
  makes the app feel native
- **`start_url` and `scope`** — where the app opens and what URLs are
  considered "inside" the app
- **`theme_color`** — colors the OS status bar to match the app aesthetic
- **`background_color`** — fills the splash screen; should match the app's
  actual background to avoid a color flash
- **`purpose: "any"` vs `"maskable"`** — different rendering contexts for
  icons; must be declared as separate entries

### How This Fits Into the Bigger Picture

The manifest and the service worker (`sw.js`) are the two required pieces
of a PWA. The manifest defines the app's *identity*; the service worker
defines its *offline behavior*. Together they're what turns a website into
something that can live on your home screen and work without internet.

Next up is `index.html` — the entire app in one file. That's where
everything you've read about so far gets used: the SW is registered there,
the manifest is linked there, and all the HTML, CSS, and JavaScript that
makes Other You actually run lives there.

### Things to Explore on Your Own

- Open Chrome DevTools → Application → Manifest. Chrome parses and
  displays your manifest live — you can see exactly what the browser
  read and whether any fields caused warnings.
- Try changing `display` to `"browser"` temporarily, install the app to
  your home screen, and compare how it looks vs `"standalone"`. Change
  it back when you're done.
- Add a screenshot to the `screenshots` array. The format is similar to
  `icons` — `src`, `sizes`, `type` — plus a `form_factor` field of
  `"narrow"` (phone) or `"wide"` (tablet).
- Look up the Web App Manifest spec on MDN (Mozilla Developer Network)
  to see every field that exists, including ones we didn't use.

---

## GLOSSARY

**`background_color`** — the color shown on the app's splash screen while
it loads; should match the app's actual background to avoid a flash.

**`display`** — controls how much browser UI is visible when the app runs
installed; `"standalone"` removes the address bar and tabs entirely.

**`icons`** — the array of image files the browser uses for the home
screen icon, install prompt, and splash screen.

**ISO 639-1** — a standard system of two-letter codes for languages; `"en"`
is English, `"es"` is Spanish, `"fr"` is French, etc.

**JSON (JavaScript Object Notation)** — a strict text format for structured
data; uses double quotes, curly braces, square brackets; no comments allowed.

**`lang`** — declares the app's primary language; helps screen readers and
search engines interpret content correctly.

**manifest.json** — the PWA identity card; a JSON file that tells the
browser how to install and present the app.

**maskable icon** — an icon version designed with extra padding so it can
be safely cropped into different shapes (circle, squircle) by the OS.

**MIME type** — a standardized label for file formats used on the web;
`"image/png"` means PNG image, `"text/html"` means HTML, etc.

**`name`** — the app's full display name, used in install prompts and the
OS app list.

**`orientation`** — locks the app to a specific screen rotation;
`"portrait-primary"` means vertical (phone held upright).

**Progressive Web App (PWA)** — a website that uses a manifest and service
worker to behave like a native installed app; works offline, installable,
feels native.

**`purpose`** — in the icons array, declares how an icon should be used;
`"any"` means use as-is, `"maskable"` means safe to crop.

**`scope`** — defines which URLs are considered "inside" the PWA; URLs
outside the scope open in the regular browser.

**`short_name`** — a brief version of the app name used where space is
limited, primarily the label under the home screen icon.

**`start_url`** — the URL the app opens when launched from the home screen.

**`theme_color`** — colors the OS status bar (clock, signal) to match the
app's visual style.
