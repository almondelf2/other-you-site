# Other You · Multiverse Date Night

Marketing website for **Other You** — a Progressive Web App that helps couples explore alternate versions of themselves through imaginative, conversation-driven date nights.

## Live Site

[pwa.other-you.app](https://pwa.other-you.app)

## About

Other You lets couples create fictional personas, then "spin" multiverse date nights based on those personas. The PWA handles everything on-device with end-to-end encrypted partner sync — no accounts, no tracking, no data sold.

This repo is the **marketing website** for the app. It explains what the app is, how it works, and where it's headed.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Homepage — hero, features, install guide, CTA |
| `how-it-works.html` | Full user guide covering every feature |
| `roadmap.html` | Four-phase development timeline |
| `contact.html` | Feedback form (powered by Opnform) |

## Tech Stack

- **Vanilla HTML, CSS, and JavaScript** — no frameworks, no build step
- **Google Fonts** — Cormorant Garamond (headings) + DM Sans (body)
- **Canvas API** — animated starfield background
- **IntersectionObserver** — scroll-triggered reveal animations
- **Opnform** — embedded contact form

## Project Structure

```
site/
├── assets/             # Icons, favicon, OG image, logo SVG
├── index.html
├── how-it-works.html
├── roadmap.html
├── contact.html
├── site.css            # All styles
├── tokens.css          # Design tokens (colors, typography)
├── site.js             # Starfield, mobile nav, scroll reveals
└── manifest.json       # PWA web app manifest
```

## Running Locally

No build step required. Just open any `.html` file in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Design

- Dark purple + cream + gold color scheme with light mode support
- Glass-morphism cards with backdrop blur
- Fluid typography via CSS `clamp()`
- WCAG AA accessible — skip link, ARIA labels, keyboard nav, reduced motion support
- Mobile-first responsive layout (hamburger nav below 680px)

## Contact

Questions or feedback → [other-you.app/contact](https://other-you.app/contact)

---

Built by [Huemanatee Group](https://huemanatee.com)
