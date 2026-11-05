# prePLANCKS restyle: decisions

Decided 2026-11-04 (user answers):
- Identity: edition-led. The year's key art drives palette; structure follows AISF. 2026 = red / black / yellow.
- Structure: current edition on home + archive of editions 2017 to today, one page per year.
- Archive data: problem and solution PDFs and photos only.
- Registration: external form link; form URL and deadline are CMS fields.
- Stack: Astro + PagesCMS (as aisf-astro / cisf27).

- Direction: A2 (design-options/a2.html). Earlier hero (live title over art-only background) + the edition banner as a poster beside Chi/Quando/Dove. Mobile hero: art block on top, all text on the dark ground below (contrast). Showcase uses the desktop banner on every width.
- Seasons: home state driven by CMS dates (registration open/close, event date, solutions flag).
- Past editions: one page per year (/edizioni/<year>).
- Language: Italian only.
- Hosting: GitHub Pages first, final URL ai-sf.it/preplancks. Astro base '/preplancks', all links through a helper.

Next: scaffold the Astro project, import old YAML/PDFs/photos, PagesCMS config.
Facts used: all copy comes from preplancks/_data/*.yml. 2026 edition is over (6 Mar 2026), solutions published.

## Build (2026-11-05)
- Scaffolded with `npm create astro@latest` (minimal template), plain CSS tokens from the Hallmark mockup (no Tailwind), fonts self-hosted via @fontsource.
- Content: `editions` collection + `site` singleton; PagesCMS config mirrors the zod schemas. See AGENTS.md.
- Data not in the old repo and left empty: registration open dates, host cities for 2017 to 2021/2024/2025 (old 2025 text said Dublin, a stale copy of 2024). 2024 event date inferred (old file said "16 Febbraio 2023").

## Agentic development (2026-11-05)
- Kept in the repo: `skills-lock.json`, `.agents/skills/` (installed copies, 9.6 MB) with `.claude/skills/` symlinks, `mcp.json`, `AGENTS.md` (with `CLAUDE.md` symlink). A fresh clone works without a setup step; hashes in the lock pin the versions.
- Commits and README in Italian; no AI attribution in commits.
