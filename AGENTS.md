# AGENTS.md: prePLANCKS

Astro 7 static site for prePLANCKS, the Italian preselection for PLANCKS (organised by AISF, Associazione Italiana Studenti di Fisica). Content is edited in Pages CMS, hosting is GitHub Pages. Site text is Italian only.
Repo: `github.com/dariozar/preplancks` (branch `main`, private for now). Final address: `ai-sf.it/preplancks`.
`DECISIONS.md` records what was decided and why. `README.md` (Italian) is the human guide; keep it in step when behaviour changes.

## Commands

- `npm run dev -- --host 0.0.0.0` (or `astro dev --background`), `npm run build`, `npm run preview -- --host 0.0.0.0 --port 4321`. Always run `npm run build` before finishing.
- Local URLs carry the base: `http://localhost:4321/preplancks/`.
- `python3 scripts/migrate.py <old Jekyll repo>`: re-imports editions 2017 to 2026 (idempotent, overwrites `src/content/editions/*.md` and `public/editions/`). Do not run it after CMS edits to those files. Needs Pillow and PyYAML.

## Content model (Pages CMS)

- `.pages.yml` and `src/content.config.ts` mirror each other 1:1. A field only in the schema breaks the build when absent; a field only in `.pages.yml` is dropped on the next CMS save. Change both together.
- `editions`: one file per year, `src/content/editions/<year>.md`, front matter only. The highest year is the current edition and drives the home page. Fields: dates (`event_date`, `registration_opens`, `registration_closes`), `registration_url`, `host`, `host_url`, `who`, `who_detail`, `where`, `hero_line`, `logos`, `theme`, `art`, `documents`, `gallery`.
- `site`: `src/data/site.yml`, one object, loaded by an inline loader in `content.config.ts` (not `file()`, which wants an array or a keyed record).
- Media sources in `.pages.yml`: `editions` (`public/editions` to `/editions`) and `logos` (`public/logos` to `/logos`). Paths in content are root-absolute strings: always render them through `u()` from `src/lib/url.ts`, because the site is served under `base: '/preplancks'`. A bare `/edizioni/` link works in dev and breaks on Pages.
- Pages CMS has no colour field: colours are hex strings validated by a regex. Dates are written as `yyyy-MM-dd`; the schema accepts string or Date and normalises to a string.
- Pages CMS docs: https://pagescms.org/docs/configuration/ (field pages live under `/docs/configuration/fields/<type>/`). Check them before using an option you have not used here.

## Seasons

`src/lib/season.ts` derives the home state from the current edition's dates, in Europe/Rome, at build time: `upcoming`, `open`, `closed`, `live`, `done`. It also produces the one sentence under the title and the primary button. `hero_line` overrides the sentence. The registration section is hidden when the state is `done`. The deploy workflow rebuilds daily at 03:00 UTC so the state follows the calendar; there is no client-side script. Italian dates use "1°" for the first of the month.

## Design rules

The look is the chosen direction A2 (`design-options/a2.html`, reference only, not built). Rules that came out of the design work:

- Edition-led: each edition sets `theme.{paper,accent,accent_ink}` (CSS variables on `<html>`) and four images in `art`: `banner` and `banner_mobile` (with title and logos), `background` and `background_mobile` (art only). Paper must be dark; text is light. All other surfaces derive from the three tokens with `color-mix`.
- Home hero (desktop): the live title over `background`, scrim from the left. The full `banner` sits in the showcase section beside Chi / Quando / Dove, on every screen size.
- Home hero (mobile): contrast was bad with text on the art. Fixed by layout, not by darkening: the art is its own block on top, and the title, logos, sentence and buttons sit below it on the dark page colour. Never put text on the art on mobile.
- The hero title is live text, so `background` must not contain the title.
- Logos in the hero: the edition's `logos` first, then `site.logos` (IAPS, AISF). Light logos on transparent. Sources: IAPS press kit (dark-background PNG), AISF brand drive (white, "Al tratto"), PLANCKS 2026 site (`Logo-wit.svg`).
- Fonts: Dela Gothic One (titles) and Hanken Grotesk (text) from `@fontsource`; no CDN. One stylesheet, `src/styles/global.css`, plain CSS with tokens. No Tailwind.
- The stylesheet starts with the Hallmark stamp comment; keep it as the first lines. Every colour and font goes through a token at `:root`; no literal colours elsewhere (the linter enforces it).
- Past-edition art differs per year (2025 orange, 2024 magenta, 2023 black). Do not hard-code red or yellow anywhere.
- Section `padding-block` applies to every `<section>`. Hero, edition head and archive head reset it to 0; remember that for new sections that should not have it.

## Skills and MCP

- `skills-lock.json` pins the skills by hash. `.agents/skills/` holds the installed copies and `.claude/skills/` symlinks to them, so a fresh clone works without a setup step. Skills: `hallmark` (MIT) and `design-taste-frontend` (taste-skill; no licence file in its folder, check upstream before redistributing outside this repo).
- Use `hallmark` for new pages or sections, `design-taste-frontend` for restyles and polish. After visual work, run the linter on the running preview: `node .agents/skills/hallmark/scripts/sloplint.mjs --url http://localhost:4321/preplancks/ --genre editorial`. Fix every FAIL; fix or waive every REFLEX with a real reason. The render tier needs `puppeteer-core`, which is not installed.
- Screenshots: `chromium-browser --headless --no-sandbox --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=1440,900 --screenshot=<path inside the project> <url>`. The snap Chromium cannot write to `/tmp`; write inside the project (git-ignored `design-options/shots/`). Check mobile at 390 wide.
- `mcp.json` adds the Astro docs MCP server (`https://mcp.docs.astro.build/mcp`). Use it for Astro questions. It only adds a server; it does not switch anything off.
- Any prose you write for the site or the README goes through the `avoid-ai-writing` skill.

## Language and commits

- Site copy, `README.md` and commit messages are in Italian. This file, code comments and `DECISIONS.md` are in English.
- Commit messages: short Italian subject in the imperative or descriptive form ("Aggiunge i loghi nella home"), body only when it adds something. No `Co-Authored-By` lines, no session links, no mention of Claude or of AI tools in commits or pull requests.
- Reuse the copy of the old site (`ai-sf/preplancks`, `_data/*.yml`) wherever it exists. Do not invent facts: dates, hosts and results come from the old repo's data and history or from the user.

## Git and deploy

- `origin` is `https://github.com/dariozar/preplancks.git` (HTTPS). This machine has no SSH key for GitHub; push with `git -c credential.helper='!gh auth git-credential' push`. Rewriting published history (force-push) needs the user's explicit go-ahead.
- `.github/workflows/deploy.yml`: official Astro action to GitHub Pages on push to `main`, manual run, and daily at 03:00 UTC. Set the repo variable `SITE_URL` (for example `https://dariozar.github.io`) until `ai-sf.it` is live; unset it for production. `base` is always `/preplancks`. GitHub Pages on a free account needs a public repo.
- Quick shareable preview of a static mockup: `npx surge <dir> <name>.surge.sh` (logged in as the repo owner). `_surge/` is git-ignored.

## Gotchas

- 2023 and 2024 banners are composites (title over an art-only image, placed as the old CSS did: centred, top at 15%) made by `migrate.py`. Replace them in the CMS if the original banners turn up.
- The 2024 event date (2024-02-16) is inferred: the old data said 2023. Registration open dates and PLANCKS host cities are empty for most years; the old repo does not hold them. Palettes for 2023 to 2025 were picked by eye.
- `registration_opens` empty means open from now; with no dates and no form URL the state is `upcoming`.
- IAPS and AISF logos are raster (700 px and 900 px wide). Fine at 64 px high; replace with vectors if they are ever shown larger.
- `<picture>` hero images are absolutely positioned on desktop and in normal flow on mobile (`global.css`, `@media (max-width: 40rem)`). Change both when touching the hero.
- Unlinked old files from the previous site (`program_talks.pdf`, `PROGRAMMA.pdf`, the presidents' guide, the IAPS code of conduct) are not imported; ask which edition they belong to before adding them.
