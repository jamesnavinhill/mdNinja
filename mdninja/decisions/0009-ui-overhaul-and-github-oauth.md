# ADR 0009: UI Overhaul, Design Token Defaults & GitHub OAuth Completion

**Date:** 2026-09-06
**Status:** Implemented & verified

## 5. Implementation Status (verified 2026-09-06)

All 13 items landed and were verified end-to-end on the running app:

- [x] **GitHub OAuth completes.** Root cause: `apps/web` had no env file, and `.env` only defined `SITE_URL` while the code read `NEXT_PUBLIC_APP_URL`. Added three-tier fallback (`NEXT_PUBLIC_APP_URL` → `SITE_URL` → request origin) in `apps/web/src/app/api/auth/github/route.ts` and created `apps/web/.env.local`. Verified: `/api/auth/github` now returns a well-formed GitHub authorize URL with a real `client_id` and correct `redirect_uri` (HTTP 307, no more "not configured" 500).
- [x] **Settings slop removed** — mock accounts ("James Hill/"Pro"), fake repos, dead toggles, "git hooks / sync protocol" copy, "tailor visual…", "adapts to dark &…", "live accent color for…", and the "icon engine architecture" blurb all deleted. Verified in browser.
- [x] **GitHub tab empty-state** — real "No GitHub accounts connected yet" + Connect button; repos list is populated from the GitHub API after OAuth. No mock data remains.
- [x] **Fonts load via `next/font`** — Inter, Geist (`geist` package), Outfit, JetBrains Mono exposed as CSS variables; every picker option renders distinct. Default = System Sans. Build logs confirm `Environments: .env.local` and clean compile.
- [x] **Design-token defaults applied** — accent `#cea1ce`, 14px, line-height 1.65, max-width 960px, System Sans, in both `:root` CSS and React defaults.
- [x] **Light mode legible** — code color no longer hardcoded to `#e2e8f0`; uses theme-aware variables. Verified by screenshot in light theme.
- [x] **Accent checkboxes** — custom accent-fill checkboxes (`#cea1ce` fill, dark check) in `markdown.css`.
- [x] **Multi-library icons** — `apps/web/src/lib/icons.tsx` registry with Lucide + Phosphor packs, per-folder glyph overrides, persisted to localStorage, live-updating via a `mdninja:icons-changed` event.
- [x] **Panel UX** — "Saved" indicator is now a transient toast that auto-hides; Edit/Split are icon-only.
- [x] **Search surfaces matches** — searching now auto-expands the collapsed parent directories/sections so the matched file is revealed.
- [x] **Canonical file-tree order** — `audit, changelog, decisions, diagrams, notes, research, roadmaps, standards`, then `docs`, `.agents`, `root`.
- [x] **Build green** — `next build` compiles with zero type errors.

**Deployment nuance (owner action in Vercel, not code):** `NEXT_PUBLIC_APP_URL` must equal the exact origin registered on the GitHub OAuth App. The registered callback per `.env.example` is the apex `https://mdninja.navinhill.com/api/auth/callback/github`. If production serves on `www.mdninja.navinhill.com`, either register that exact callback URL on the GitHub OAuth App too, or set `NEXT_PUBLIC_APP_URL` to the apex. The code now derives `redirect_uri` from this value at request time, so GitHub will only "trust" it if it byte-for-byte matches a registered callback.

## 4. 🤖 Agent Enforcement

## 1. Context

The notes in `mdninja/notes/design-edits.md` catalogued 13 defects and feature gaps in the workspace UI. Investigation confirmed these were not cosmetic — several were real source-level defects:

* **GitHub OAuth "URL not trusted":** The auth route reads `NEXT_PUBLIC_APP_URL`, but the environment only defined `SITE_URL`. Worse, `apps/web` had **no env file at all**, so the deployed/local app had no `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` at request time. The popup therefore built a redirect from an undefined/wrong base URL and GitHub rejected it.
* **Fonts are broken:** None of Inter / Geist / Outfit / JetBrains Mono were ever loaded. Only System Sans and a generic `monospace` token resolved, so three picker options silently fell back to System Sans.
* **Light-mode code blocks illegible:** `markdown.css` hardcodes inline-code `color:#e2e8f0` and checkbox styling relied on the OS-native widget, both of which break on a light background.
* **Mock/slop data everywhere:** Settings and the profile popover shipped with fake accounts ("James Hill"), fake repos, dead toggles, and marketing copy, presenting a toy instead of a tool.
* **Search-as-filter only:** With the tree collapsed, the search box filtered but never surfaced the matched file.

This ADR formalizes the holistic fix so the changes are traceable and durable.

## 2. Decision

We will fix all 13 items in one coordinated pass, at the source:

1. **GitHub OAuth (complete):** Provide env at the correct layer (`apps/web/.env.local`, Vercel project env), make the auth route resolve base URL defensively (`NEXT_PUBLIC_APP_URL` → `SITE_URL` → request origin). Strip all mock accounts/repos and dead toggles; render a real empty-state when disconnected; keep the real OAuth + live repo-fetch flow.
2. **Fonts:** Self-host Inter, Geist, Outfit and JetBrains Mono via `next/font` CSS variables. Expose `--font-sans` and `--font-mono` from loaded fonts so every picker option renders distinct. Default = System Sans.
3. **Design-token defaults:** accent `#cea1ce`, font System Sans, size 14px, line-height 1.65, doc max-width 960px — applied in both the CSS root and the React state defaults, and persisted.
4. **Light mode:** Replace hardcoded code color with theme-aware `var(--text-primary)`; ensure code blocks invert correctly in light theme.
5. **Checkboxes:** Custom accent-styled checkboxes (accent fill + contrasting check) instead of OS-native widgets.
6. **Settings slop:** Remove all marketing copy, fake white/black blocks, random dots, and the "icon engine architecture" blurb.
7. **Icons (multi-library):** Install `@phosphor-icons/react` alongside `lucide-react`; introduce an icon registry that supports multiple packs and lets the user change sidebar/folder icons.
8. **Panel UX:** The "Saved" indicator auto-hides after a short confirmation toast; Edit and Split become icon-only buttons.
9. **Search:** On a search hit, auto-expand the collapsed parent directories so the matched file is surfaced (not just filtered).
10. **File tree canonical order:** Present the living canon sections in the canonical order (`audit, changelog, decisions, diagrams, notes, research, roadmaps, standards`) then `docs`, `.agents`, `root`.

## 3. Consequences

### Positive
* Single coherent UI that matches the design-intent notes exactly; no more toy/slop.
* GitHub connection actually completes and lists the operator's real repos.
* Every font option is real and visually distinct; typography defaults match spec.
* Light mode is fully legible; accent is consistent across accent-driven UI.
* Icon system is extensible (new packs drop in without touching nav components).

### Negative
* Adds one runtime dependency (`@phosphor-icons/react`) and four self-hosted font payloads.
* Icon registry introduces a small mapping layer that must be kept curated.
* Custom checkbox CSS must be maintained across both themes.

## 4. 🤖 Agent Enforcement

* **DO:** Source all UI strings from real state only — never ship mock/placeholder accounts, repos, or marketing copy anywhere in the product UI.
* **DO:** Keep design tokens (accent, size, line-height, width) defined once and consumed via CSS variables; never hardcode a second source of truth.
* **DO:** Load every selectable font through `next/font`; a picker option must correspond to a font that actually renders.
* **DO:** Route icons through the central icon registry so new packs integrate without touching navigation/tree components.
* **DO NOT:** Reintroduce hardcoded foreground colors (e.g. `#e2e8f0`) for content that must theme across dark/light — always use theme variables.
* **DO NOT:** Add env vars under a new name (e.g. `SITE_URL`) for values the code already reads under an existing name (`NEXT_PUBLIC_APP_URL`); fix at the read site or the env, not both drifted.
