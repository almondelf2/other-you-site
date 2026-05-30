# Other You · Multiverse Date Night

A private Progressive Web App (PWA) for couples to build alternate personas and go on "multiverse date nights" — dating each other's alternate selves, the roads not taken, the versions that almost were.

---

## What It Does

Other You lets two people each create an alternate persona — a different name, backstory, traits, and vibe — then share a private, encrypted session to role-play a date night as those characters. Each date night is logged in a personal history so you can revisit your favorite alternate universes.

**Core screens:**

| Screen | Purpose |
|---|---|
| Setup | First-run onboarding and name entry |
| Personas | Browse and select an alternate persona |
| Create | Build a new persona from scratch |
| Match | See your partner's persona matched with yours |
| Connect | Generate or scan an invite QR code to pair with your partner |
| Home | The active date night hub |
| Settings | Theme, sync, and account options |
| History | Log of past date nights |

---

## Tech Stack

This app is intentionally simple — no build tools, no frameworks, no install step.

| Layer | Technology |
|---|---|
| App | Vanilla HTML, CSS, and JavaScript (single `index.html`) |
| Fonts | Google Fonts — Cormorant Garamond + DM Sans |
| Sync | [Supabase](https://supabase.com) (Postgres + Realtime) |
| Encryption | Web Crypto API — AES-256-GCM end-to-end |
| QR Codes | QRCode.js via CDN |
| Offline | Service Worker (cache-first strategy) |
| Install | Web App Manifest (`manifest.json`) |

**Privacy model:** The encryption key is embedded in the URL `#hash` fragment. It never leaves the device and never touches the Supabase server, so even the sync backend cannot read your data.

---

## Project Structure

```
app/
├── index.html        # Entire app — markup, styles, and logic in one file
├── sw.js             # Service worker — handles offline caching
├── manifest.json     # PWA manifest — icons, theme, install metadata
└── assets/
    ├── favicon.ico
    ├── apple-touch-icon.png
    ├── icon-192.png
    ├── icon-512.png
    ├── logo-icon.svg
    └── og-image.png
```

---

## Running Locally

No build step needed. Just serve the files over HTTP (browsers block Service Workers on raw `file://` URLs).

**Option A — Python (built-in):**
```bash
cd app
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Option B — Node.js (`npx serve`):**
```bash
npx serve app
```

**Option C — VS Code Live Server extension:** right-click `index.html` → *Open with Live Server*.

---

## Supabase Setup

The app uses Supabase for optional cross-device sync. The credentials in `index.html` are placeholders — replace them with your own project values before deploying.

1. Create a free project at [supabase.com](https://supabase.com).
2. In `index.html`, find the two placeholder constants and replace them:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. In the Supabase dashboard, run the SQL migration to create the required tables (see the project wiki or setup docs for the schema).

Sync is completely optional — the app works fully offline using `localStorage` without any Supabase credentials.

---

## PWA Installation

Other You is installable as a native-feeling app on any device:

- **Android / Chrome:** tap the browser menu → *Add to Home Screen*
- **iOS / Safari:** tap the Share icon → *Add to Home Screen*
- **Desktop / Chrome or Edge:** click the install icon in the address bar

Once installed the app loads instantly and works offline.

---

## Accessibility

The app targets WCAG 2.1 AA compliance:

- Pinch-to-zoom is never blocked (WCAG 1.4.4)
- All form inputs have associated `<label>` elements
- Skip navigation link for keyboard users
- Focus-visible styles on all interactive elements
- Modal dialogs have `role="dialog"`, `aria-modal`, focus trapping, and close on Escape
- Navigation tabs carry `aria-current="page"` on the active item
- Toast notifications use `role="alert"` and `aria-live="polite"`
- All emoji/icon buttons have descriptive `aria-label` text

---

## Browser Support

Any modern browser that supports ES Modules and the Web Crypto API:

- Chrome / Edge 80+
- Firefox 75+
- Safari 14+ (iOS 14+)

---

## Live URL

`https://pwa.other-you.app`

---

## License

Private project — Huemanatee Group. All rights reserved.
