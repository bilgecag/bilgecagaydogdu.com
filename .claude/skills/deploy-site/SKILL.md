---
name: deploy-site
description: Publish and verify changes to bilgecagaydogdu.com. Use whenever the site content in public/index.html (or any file under public/) has changed and needs to go live on Cloudflare, or when confirming what is currently deployed. Covers commit conventions, the wrangler deploy command, and how to verify the live site past Cloudflare's edge cache.
---

# Deploying bilgecagaydogdu.com

The site is a static `public/` directory served by a Cloudflare Worker
(`bilgecagaydogdu-com`) on the custom domains `bilgecagaydogdu.com` and
`www.bilgecagaydogdu.com`. **Cloudflare is not connected to GitHub** — pushing
to git does not publish. Publishing is a manual `wrangler deploy`.

## Procedure

1. **Make the edit** in `public/index.html` (the whole site is this one static
   HTML file). Keep content in the HTML source — never a JS-rendered shell.

2. **Verify locally before deploying** (see the verification notes below).

3. **Commit — with NO co-author trailer** (standing user preference: commits are
   attributed to the user alone):
   ```bash
   git add -A
   git commit -m "Concise summary of the change"
   ```

4. **Push** (keeps GitHub in sync; does not deploy on its own):
   ```bash
   git push origin main
   ```

5. **Deploy** from the repo root:
   ```bash
   npx wrangler deploy
   ```
   Expected tail: `Deployed bilgecagaydogdu-com triggers` and both custom-domain
   lines. If `npx` fails with an npm-cache `EACCES`, retry with
   `npm_config_cache=/tmp/npmcache npx wrangler deploy`.

   The first `wrangler deploy` after custom domains were attached disabled the
   `*.workers.dev` preview URL — that's expected; the site lives only on the
   custom domain now.

## Verify the deploy went live

Cloudflare edge-caches the HTML, so a fetch **immediately** after deploy can
return the previous version from a not-yet-updated edge node
(`cf-cache-status: HIT` even though the HTML says `max-age=0`). Always cache-bust,
and re-fetch once if it looks stale:

```bash
curl -sS -H 'Cache-Control: no-cache' "https://bilgecagaydogdu.com/?v=$RANDOM" -o /tmp/live.html
grep -c "some text you just added" /tmp/live.html
```

Newly uploaded images can 404 for a few seconds during propagation — retry
before concluding anything is wrong. Check an image with:
```bash
curl -sS -o /dev/null -w "%{http_code}\n" "https://bilgecagaydogdu.com/pictures/NAME.png?v=$RANDOM"
```

## Verifying rendering (the preview pane has a trap)

The in-app browser preview **cannot screenshot deep-scroll positions** on this
tall page — it returns blank white frames after any programmatic scroll. A blank
screenshot is a capture artifact, **not** evidence the section is broken.

- Local preview server serves the **repo root** → open
  `http://localhost:8765/public/index.html`, not `/`.
- Before measuring in a headless/background tab, force reveal animations on:
  `document.querySelectorAll('[data-reveal]').forEach(e=>e.style.opacity='1')`.
- Confirm layout with `getBoundingClientRect()` and text with `element.innerText`
  (both paint-independent). These are the reliable checks.
- Top-of-page screenshots (header/hero) do render fine.

## Known open item

There is no cache rule bypassing edge-caching for the HTML, so every deploy has a
brief window where some regions serve the old version. If asked to make changes
propagate instantly, set up a Cloudflare cache rule to bypass cache for the HTML
document (keep images/fonts cached), or purge cache after each deploy.
