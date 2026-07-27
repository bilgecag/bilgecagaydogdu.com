# bilgecagaydogdu.com — project guide for AI assistants

Personal academic site for **Bilgecag Aydogdu, PhD** (data scientist; mobile
phone data for migration, displacement and official statistics). One static
page, deployed on Cloudflare. No build step, no framework, no server code.

## The one file that matters

**`public/index.html`** *is* the entire website — a single self-contained
static HTML file (~66 KB). Fonts are embedded (`public/fonts`), most graphics
are inline SVG, and the few photos live in `public/pictures/`. Edit this file
directly with normal find/replace — it is plain, readable HTML.

> It was **not** always like this. The site began as a 1.5 MB JavaScript
> "bundle" that rendered content client-side (a `Bundled Page` / `Unpacking…`
> shell). That was un-bundled into today's static HTML so crawlers and AI
> fetchers can read it. **Never reintroduce a JS-rendered shell** — content
> must be in the HTML source, visible with JavaScript disabled.

## Layout of the repo

| Path | What it is |
|---|---|
| `public/index.html` | the whole site — edit here |
| `public/pictures/` | photos referenced by the page (currently just `thesis.png`) |
| `public/fonts/`, `public/cv-preview.png`, `public/Bilgecag_Aydogdu_CV.pdf` | assets served as-is |
| `public/_headers` | security headers (HSTS, nosniff, frame, referrer, permissions) |
| `wrangler.jsonc` | Cloudflare config — serves `./public`, binds the custom domains |
| `material/svg-figures.html` | source of the four hand-built `fig. 01–04` SVG diagrams, kept for reuse |
| `material/original-images/` | pre-optimization image originals (gitignored, local backup) |

Only `public/` is deployed. `CLAUDE.md`, `material/`, `.claude/`, `wrangler.jsonc` are not served.

## Golden rules

1. **Edit `public/index.html` directly.** It's static HTML.
2. **Commits carry NO `Co-Authored-By` trailer.** Attribute to the user alone. (Standing preference.)
3. **Deploy = commit → push → `npx wrangler deploy`.** A `git push` alone does *not* publish (Cloudflare is not git-connected; deploys are CLI-driven). See the `deploy-site` skill.
4. **Verify on the live URL after deploying**, with a cache-buster — edge cache lags a few seconds. See gotchas.
5. **Optimize images before adding them** and keep them small. See the `edit-site-content` skill.

## Deploy, in one breath

```bash
git add -A && git commit -m "…"        # no co-author trailer
git push origin main
npx wrangler deploy                      # publishes public/ to Cloudflare
```

Live at **https://bilgecagaydogdu.com** and **https://www.bilgecagaydogdu.com**
(both custom domains on one Cloudflare Worker named `bilgecagaydogdu-com`).
Full procedure + verification: **`deploy-site` skill**.

## Gotchas that will waste your time if you don't know them

- **Edge-cache lag.** Right after a deploy, some Cloudflare edge nodes serve the
  *previous* HTML for a few seconds (`cf-cache-status: HIT`, even though the HTML
  sends `max-age=0`). A fetch immediately after deploy — or from a different
  region / another AI's fetcher — can look stale or show old content. Verify with
  `curl -H 'Cache-Control: no-cache' "https://bilgecagaydogdu.com/?v=$RANDOM"` and
  re-fetch if it looks wrong. Newly added images can 404 for a few seconds too.
  (A cache rule to bypass HTML edge-caching is still an open to-do.)
- **The browser preview pane can't screenshot deep-scroll positions** on this tall
  page — it returns blank/white frames after programmatic scrolling. Do **not**
  trust a blank screenshot as "the section is broken." Verify with the DOM instead:
  `getBoundingClientRect()` for layout, `element.innerText` for rendered text
  (both paint-independent), or just `curl` the live HTML. Top-of-page screenshots
  render fine.
- **The local preview server serves the repo root**, so open
  `http://localhost:8765/public/index.html`, not `/`.
- **`prefers-reduced-motion` / background tabs** stop the `data-reveal`
  IntersectionObserver from firing, leaving sections at `opacity:0` in headless
  checks. That's a test artifact, not a bug — force `opacity:1` before measuring.
- **npm cache** was once root-owned and broke `npx` with EACCES. If that recurs,
  prefix commands with `npm_config_cache=/tmp/npmcache`.

## Design system (so edits match)

- **Theme-aware.** CSS custom properties are defined twice — light and dark
  (`@media (prefers-color-scheme: dark)`). Always style with the variables, never
  hard-coded colors.
- **Palette (variables):** `--ink` `--ink2` `--ink3` (text, dark→light), `--line`
  `--line2` (borders), `--panel` `--paper` (surfaces), `--accent` `--accent-soft`
  (teal), `--signal` (amber, used in figures).
- **Fonts:** `Source Serif 4` (headings/hero), `IBM Plex Mono` (labels, eyebrows,
  captions, nav), `IBM Plex Sans` (section `h2` labels); system sans for body.
- **`style-hover="…"` attribute** = hover styles, applied by a small inline script
  (`querySelectorAll('[style-hover]')`). Plain CSS `:hover` is not used — copy the
  `style-hover` pattern from a sibling element.
- **`data-reveal="1"`** on a `<section>` = fade-up-on-scroll via IntersectionObserver.
  Add it to new sections for consistency.
- **Responsive** via a single `@media (max-width:820px)` block near the end of the
  file: `main>section`, `.hero`, `.cards`, `.cvcard`, and the header stack. New
  sections using `grid-template-columns:120px minmax(0,1fr)` and card grids using
  `class="cards"` inherit this automatically — no extra work.

## Page anatomy

`header` (logo + nav) → `main` with sections in order:
`#about`(hero, no id — it's the first `.hero` section) …actually the sections are
**hero** (`.hero`), `#about`, `#cv`, `#publications`, `#activities`, `#contact`.
Nav links mirror those ids. The hero "See selected work" button points to
`#publications`.

For the exact markup of publication entries, figure cards, the thesis card, and
activity entries — plus how to add or trim them — use the **`edit-site-content`
skill**.
