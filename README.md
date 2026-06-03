# Other You · Marketing Site

The static marketing website for Other You: Multiverse Date Night, served at `other-you.app`. It introduces the app to new users, explains how it works, shows the roadmap, and links to the live PWA at `pwa.other-you.app`.

Hand-coded static site — no CMS, no framework, no build step.

---

## Project Structure

```
site/
├── README.md
├── manifest.json               # PWA manifest for the marketing site
├── index.html                  # Homepage
├── how-it-works.html           # Full user guide — install, personas, connect, dating, backup, FAQ
├── roadmap.html                # Product roadmap — phased timeline with status indicators
├── contact.html                # Contact / feedback form
├── privacy-policy.html         # Privacy policy
├── terms.html                  # Terms and conditions
├── assets/
│   ├── og-image.png            # Open Graph social share image
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── logos/
│       └── logo-icon.svg       # App logomark used in hero and nav
├── css/
│   ├── tokens.css              # Design tokens — brand colors, spacing, type scale
│   └── site.css                # All site styles — nav, layout, sections, components, animations
└── js/
    └── site.js                 # Navigation (hamburger menu, active states), scroll reveal animations, canvas background
```

---

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Hero, what-it-is cards, how-it-works steps, feature grid, install instructions, CTA |
| `how-it-works.html` | `/how-it-works` | Full guide — installing, getting started, personas, connecting, dating, history, sync, disconnect, privacy, backup, device requirements, FAQ |
| `roadmap.html` | `/roadmap` | Phased timeline — Phase 1 (complete), Phase 2 (in progress), Phases 3–4 (planned) |
| `contact.html` | `/contact` | Feedback and contact form |
| `privacy-policy.html` | `/privacy-policy` | Privacy policy |
| `terms.html` | `/terms` | Terms and conditions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Vanilla HTML — one file per page |
| Styles | Vanilla CSS — `tokens.css` + `site.css` |
| Scripts | Vanilla JavaScript — `site.js` (no framework, no build step) |
| Fonts | Google Fonts — Cormorant Garamond + DM Sans |
| Background | Canvas-based animated starfield (in `site.js`) |
| Animations | Intersection Observer scroll-reveal (CSS classes + `site.js`) |
| Hosting | Static file host (cPanel deployment via File Manager) |

---

## Design System

The site shares brand tokens with the app:

- **Primary dark background:** `#0d0818`
- **Surface:** `#1a0e2e`
- **Gold accent:** `#9e7a2e` (rendered as `var(--gold)`)
- **Text:** cream / mist / dim hierarchy via CSS custom properties
- **Typography:** Cormorant Garamond (display/headings) + DM Sans (body/UI)

Tokens are defined in `css/tokens.css` and consumed throughout `css/site.css`.

---

## Running Locally

No build step. Open any HTML file directly in a browser, or serve with a local server for accurate relative path resolution:

**Python:**
```bash
cd site
python -m http.server 8080
```
Open `http://localhost:8080`

**Node.js:**
```bash
npx serve site
```

**VS Code:** right-click any `.html` file → *Open with Live Server*

---

## Deployment

Deployed via cPanel File Manager — upload the contents of `site/` to the web root of `other-you.app`. No build or compile step.

---

## Accessibility

WCAG 2.1 AA compliance:

- Skip navigation link on every page
- All nav links and icon buttons have descriptive `aria-label` attributes
- `aria-current="page"` on the active nav item
- `aria-expanded` and `aria-controls` on the hamburger menu button
- Canvas background has `aria-hidden="true"`
- Semantic landmarks: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`
- `<meta name="color-scheme" content="dark light">` on every page — ensures browser-native UI elements render in the correct theme
- `role="list"` on all lists with `list-style: none` — preserves list announcements in Safari/VoiceOver
- Inline prose links (`.lead a`) are visually distinguished from body text via `--mist-aa` color and underline — satisfies WCAG 1.4.1 (Use of Color, Level A)
- Legal page TOC links use `display: block` with padding to meet WCAG 2.5.8 minimum touch-target size

---

## URLs

- **Marketing site:** `https://www.other-you.app` (also `https://other-you.app`)
- **Live PWA:** `https://pwa.other-you.app`

---

## License

Private — Huemanatee Group. All rights reserved.
