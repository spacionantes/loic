# BROOKE — Filmmaker Portfolio

Cinematic, motion-first portfolio for a freelance filmmaker. One metaphor: **film as neural transmission**. Every project is a signal. Every transition is a data transfer.

## Tech stack

Vanilla HTML / CSS / JavaScript — **zero runtime dependencies, zero build step**.

| Layer | Choice | Rationale |
|---|---|---|
| Markup | Semantic HTML5 | Clean, accessible, SEO-ready |
| Styles | CSS custom properties + cascade | No preprocessor needed at this scale |
| Motion | Canvas 2D (`neural.js`) + CSS animations | Lighter than Three.js for node/filament density |
| i18n | Hand-rolled dict (`i18n.js`) | Tiny, localStorage-persistent, no library overhead |
| Fonts | Google Fonts CDN | Bodoni Moda (display) · Inter (body) · JetBrains Mono (mono) |

## Features

- **Neural canvas background** — 68 nodes, organic sine-drift, cursor attraction (200 px radius), idle breathing, pulse signals, reduced-motion static fallback
- **Custom cursor** — luminous node with lagged smoothing, 50-particle red-orange trail, expands on interactive elements, disabled on touch
- **Glitch typography** — character-scramble on viewport entry (IntersectionObserver), RGB-split on card title hover, both skip under `prefers-reduced-motion`
- **FR / EN toggle** — full string dictionary, persisted in `localStorage`, updates all `data-i18n` elements + meta tags
- **Editorial project grid** — 12-col asymmetric layout, nth-child rhythm, hover scanline + filament sweep
- **Case-study overlay** — slide-in panel with red sweep transition, project data, stills, credits
- **Signal sweep transition** — left-to-right red gradient bar on nav clicks and overlay open
- **Smooth inertial scroll** — lightweight custom implementation, no Lenis dependency
- **Live HUD** — real-time timecode, active section node, cursor coordinates
- **Credit rotator** — cycles event names with fade-slide transition every 2.5 s
- **Fully responsive** — 768 px tablet, 480 px mobile reflows; neural canvas reduces density on mobile
- **Accessibility** — `prefers-reduced-motion` respected everywhere, 4.5:1 contrast on body text, visible focus rings (`--orange-flash`), keyboard-navigable overlay and grid, skip link, ARIA roles

## Local development

No build step. Any static server works:

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code: Live Server extension → right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8080`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel → **Framework Preset: Other** (auto-detected as static).
3. No build command. No output directory setting needed.
4. `vercel.json` handles caching headers automatically.

## Adding a project

Open `js/projects.js` and add an entry to the `PROJECTS` array:

```js
{
  id:      'my-project',          // URL-safe slug
  title:   'MY PROJECT TITLE',
  client:  'Client Name',
  year:    '2025',
  format:  '4K · STEREO',
  role:    'Director / DP',
  signal:  3,                     // 1–4 signal strength bars
  thumb:   'assets/thumb-my-project.jpg',   // 16:10 thumbnail
  preview: 'assets/preview-my-project.mp4', // short muted loop (optional)
  heroImg: 'assets/hero-my-project.jpg',    // overlay hero (16:9)
  stills:  ['assets/still-1.jpg'],           // overlay stills grid
  video:   '',                              // embed URL or path (optional)
  desc:    'One paragraph about the project.',
  credits: ['Direction — NAME', 'DP — NAME'],
},
```

Drop the corresponding media files into `assets/`. That's it.

## Placeholder assets

The repo ships without media (no video, no photos). Replace these files in `assets/` to activate all sections:

| File | Used by |
|---|---|
| `reel.mp4` | Showreel autoplay loop |
| `reel-poster.jpg` | Reel video poster frame |
| `og.jpg` | Open Graph social preview |
| `thumb-*.jpg` | Project card thumbnails |
| `hero-*.jpg` | Overlay hero images |
| `still-*.jpg` | Overlay stills grid |

## Credits

Design & development — Claude (Anthropic) for spacionantes/loic  
Brand name — BROOKE (placeholder, replace throughout)  
Typefaces — Bodoni Moda, Inter, JetBrains Mono via Google Fonts
