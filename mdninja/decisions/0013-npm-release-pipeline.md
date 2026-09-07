# ADR 0013: npm + GitHub Release Pipeline

**Date:** 2026-09-07
**Status:** Implemented (owner action outstanding: add the `NPM_TOKEN` repository secret)

## 1. Context

Two real gaps sat in front of the first publishable release:

- `@mdninja/cli` (intended public, published by `release.yml`) had a hard dependency on `@mdninja/canon`, which was marked `private: true`. Publishing the CLI would have produced a package whose dependency could not be installed from npm. This was a one-line boogeyman, not a real blocker.
- Versioning + changelog + tag creation were informal — the exact class of doc/release drift this repository exists to eliminate.

## 2. Decision

**Publish both workspace packages from the same tag-driven pipeline, and adopt Changesets for versioning.**

- **`@mdninja/canon` is now a public package.** Removed `private`, added `publishConfig.access: public`, `files: ["index.js"]`, and repository metadata. It is the living-canon config contract; external tooling should be able to install and import it. `release.yml` publishes `packages/canon` **before** `packages/cli` in the same run, so the CLI resolves it from npm normally on install.
- **`@mdninja/cli`** gained `publishConfig.access: public` + repository metadata (belt-and-braces alongside the existing `--access public` flag).
- **Changesets** (`@changesets/cli`, devDependency; config at `.changeset/config.json` with `access: "public"`, `baseBranch: "main"`) is the versioning standard. Each change adds a changeset file; `changeset version` bumps versions and writes changelogs in one reviewed step, then a `v*` tag push triggers `release.yml`. Root scripts added: `changeset`, `version-packages`.
- **Provenance is kept.** Both packages publish with `--provenance` and the workflow has `id-token: write`, linking each npm package to the exact repo + workflow + commit.

## 3. Pipeline flow

```
change → changeset file → changeset version (bumps + CHANGELOGs)
       → git tag v<x.y.z> && git push --tags
       → release.yml: npm ci → sync-canon → build → CLI smoke
       → publish @mdninja/canon (public, provenance)
       → publish @mdninja/cli   (public, provenance)
       → create GitHub Release for the tag (auto notes)
```

## 4. One-time owner action (secrets — agent never handles tokens)

1. Create an npm **Granular Access Token** scoped read/write on the `@mdninja` org packages, with 2FA bypassed for automation (or an Automation token).
2. Add it as a repository secret named **`NPM_TOKEN`** (Repo → Settings → Secrets and variables → Actions). The workflow already references `secrets.NPM_TOKEN`.

## 5. 🤖 Agent Enforcement

* Both `@mdninja/*` packages publish from `release.yml`; publish canon before the CLI (dependency order).
* Never reintroduce `private: true` on a package another published package depends on — if a public package depends on it, it ships.
* Version through Changesets, not hand-bumps; keep the `NPM_TOKEN` secret out of source.
* Keep `--provenance` (and `id-token: write`) on publish — it is the supply-chain link back to the repo + workflow + commit.
