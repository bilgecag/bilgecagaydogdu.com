---
name: edit-site-content
description: Add, edit, trim, or reorder content on bilgecagaydogdu.com — publications (journal figure-cards, list entries), the PhD thesis card, activities (invited talks, conference presentations, coverage), figures/diagrams, and images. Use when changing what the page says or shows. Provides the exact HTML templates and conventions so edits match the existing design. Pair with the deploy-site skill to publish.
---

# Editing content on bilgecagaydogdu.com

Everything is in **`public/index.html`**, plain static HTML. Match the surrounding
markup exactly — the design relies on shared inline-style patterns, CSS variables,
`style-hover` (JS-wired hover), and `data-reveal` (scroll fade-in). See `CLAUDE.md`
for the palette and fonts.

Because inline styles repeat verbatim, the safest way to insert/replace/remove a
block is a small **Python script** that matches a unique anchor (a title, DOI, or
venue string), expands to the enclosing element by its boundary markers, and
asserts the match count before writing. Prefer this over fragile hand-typed
`old_string` blocks.

## Sections and order

`hero` (`.hero`) → `#about` → `#cv` → `#publications` → `#activities` → `#contact`.
Nav links and the hero "See selected work" button mirror these ids. Each real
section is `<section id="…" style="…display:grid;grid-template-columns:120px
minmax(0,1fr);gap:32px" data-reveal="1">` with an `h2` label in the left column and
content in the right. Copy an existing section wrapper when adding one.

## Publications

Subsection order: **Journal articles** (figure cards) → **PhD thesis** (cover card)
→ **Book chapters** → **Conference proceedings** → **Policy reports**. Each
subsection is:
```html
<div style="display:flex;flex-direction:column;gap:2px">
  <h3 style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--ink);color:var(--ink)">LABEL</h3>
  …entries…
</div>
```

### Plain list entry (book chapters, conference proceedings, policy reports)
```html
<div style="display:grid;grid-template-columns:64px minmax(0,1fr);gap:16px;padding:14px 0;border-bottom:1px solid var(--line2)">
  <span style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--ink3);padding-top:3px">YEAR</span>
  <div style="display:flex;flex-direction:column;gap:5px">
    <p style="margin:0;font-size:16px;line-height:1.5;font-weight:500;color:var(--ink)"><a href="DOI" target="_blank" rel="noopener" style="color:var(--ink);border-bottom:1px solid transparent" style-hover="color:var(--accent);border-bottom-color:var(--accent)">TITLE</a></p>
    <p style="margin:0;font-size:13.5px;color:var(--ink3);line-height:1.55">AUTHORS. <em>Venue</em>, vol, pages.</p>
  </div>
</div>
```
Omit the `<a>` wrapper for items with no link (plain title text). Use `&amp;` for `&`.

### Journal figure-card (the featured "selected work")
The four journal articles are cards in a `class="cards"` grid, each with a
**hand-built SVG diagram** (`fig. 01–04`). The SVG source is in
`material/svg-figures.html`. Card shell:
```html
<div class="cards" style="display:grid;gap:1px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));background:var(--line);border:1px solid var(--line);margin-top:8px">
  <article style="background:var(--panel);display:flex;flex-direction:column;transition:background .2s ease" style-hover="background:var(--paper)">
    <div style="padding:22px 24px 12px;border-bottom:1px solid var(--line2)">
      <svg …>…</svg>   <!-- or an <img>; see below -->
      <p style="margin:10px 0 0;font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.04em;color:var(--ink3)">fig. 0N — caption</p>
    </div>
    <div style="padding:22px 24px 26px;display:flex;flex-direction:column;gap:12px;flex:1">
      <p style="…mono eyebrow…;color:var(--accent)">CATEGORY</p>
      <h3 style="font-family:'Source Serif 4',Georgia,serif;font-weight:500;font-size:20px;…"><a href="DOI" …>TITLE</a>OPEN_ACCESS_BADGE?</h3>
      <p style="…;color:var(--ink2);font-size:15px;…">Description.</p>
      <p style="margin:0;font-size:13px;color:var(--ink3);line-height:1.55">AUTHORS. <em>Venue</em>, …</p>
      <a href="DOI" …>Read the paper →</a>
    </div>
  </article>
  …
</div>
```
Card ↔ figure ↔ image mapping (kept in sync historically):
| Card / paper | fig. | photo (if used instead of SVG) |
|---|---|---|
| A novel activity space approach (EPJ Data Science) | 01 | epj_data_science.png |
| Combining Twitter and mobile phone data (J. Comp. Soc. Sci.) | 02 | computation_social_science.png |
| Analyzing international airtime top-up transfers (IJDSA) | 03 | jdsa.png |
| Mobile phone data for anticipating displacements (Data & Policy) | 04 | data_and_policy.png |

To use a **photo instead of the SVG**, swap the `<svg>…</svg>` (and its `fig.`
caption) for `<img src="pictures/NAME.png" alt="…" loading="lazy" style="width:100%;height:auto;display:block">` inside a wrapper
`<div style="border-bottom:1px solid var(--line2);background:#fff;line-height:0">`.
To go back to diagrams, restore the figure block from `material/svg-figures.html`.

### OPEN ACCESS badge (appended inside the title `<p>`/`<h3>`, after the `</a>`)
```html
<span style="display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:0.08em;background:var(--accent-soft);color:var(--accent);padding:2px 6px;margin-left:8px;vertical-align:2px;font-weight:500">OPEN ACCESS</span>
```

### PhD thesis card (`class="cvcard"`, portrait cover beside text)
Uses `pictures/thesis.png` in an `<a>`-wrapped image on the left (grid
`200px minmax(0,1fr)`) and title/description/citation/"Read the thesis →" on the
right. Copy the existing one; it inherits the `.cvcard` mobile-stack rule.

## Activities

Three subsections: **Invited talks** → **Conference presentations** → **Coverage**,
each using the same plain list-entry template above (year + title + venue line).
Order newest-first. Editorial guidance the site owner has applied: prefer full
papers over posters, don't list the same talk at two venues (keep the stronger
one), and keep invited talks even if seminar-level (being invited is the
credential).

## Images

- Put photos in `public/pictures/`. Reference as `pictures/NAME.png` (relative).
- **Optimize before committing.** Originals can be many MB; display size is small.
  Back up the original, then downscale:
  ```bash
  cp public/pictures/NAME.png material/original-images/   # gitignored backup
  sips -Z 1200 public/pictures/NAME.png    # landscape figures
  sips -Z 1000 public/pictures/NAME.png    # portrait covers
  ```
  Target well under ~1 MB each; all images are `loading="lazy"`.
- Remove images that are no longer referenced (`git rm`) to keep the deploy lean.

## After any edit

Publish and verify with the **deploy-site** skill. Verify rendering via DOM
geometry / `innerText`, not deep-scroll screenshots (the preview pane returns
blank frames far down the page).
