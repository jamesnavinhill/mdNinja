# npm + GitHub Releases — Publishing Runbook

Status: **runbook**. The pipeline (.github/workflows/release.yml) already ties npm publish to GitHub Releases on `v*` tags. This documents the gaps to close and the one-time owner setup. Verified against GitHub/npm guidance, Sept 2026.

---

## How it works now

Tag push `v*` → GitHub Actions `release.yml`:

1. `actions/setup-node@v4` with `registry-url: https://registry.npmjs.org` + `scope: '@mdninja'` → writes an `.npmrc` that reads `NODE_AUTH_TOKEN`.
2. `npm ci` → `npm run sync-canon` → `npm run build` → CLI smoke test (`--help`, `--version`).
3. `npm publish --access public --provenance` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
4. `softprops/action-gh-release@v2` creates the GitHub Release for the tag with auto-generated notes.

So npm and GitHub Releases are already the same pipeline; the release IS a tagged commit. `--provenance` links the npm package back to the exact repo+workflow+commit (the modern supply-chain chain — requires the `id-token: write` permission, which is set).

---

## Gaps to fix BEFORE the first real tag

1. **`@mdninja/canon` is `private: true` but is a hard dep of the published CLI.**
   Publishing `@mdninja/cli` will produce a tarball whose dependency `@mdninja/canon@1.0.0` cannot be installed from npm. Two clean options:
   - **(a) Publish canon too** (recommended — it's the config contract other tools should import): remove `private`, add `publishConfig.access: public`, add a publish step for `packages/canon` before the CLI step. CLI then resolves it from npm normally.
   - (b) Bundle canon into the CLI at build (rollup/tsup) so the CLI ships self-contained. More moving parts.

2. **`npm ci` needs a root lockfile** covering workspace deps (npm workspaces). The workflow runs `npm ci` at root — confirm `package-lock.json` is committed and current.

3. **Versioning strategy is implicit.** Recommend **changesets** (`@changesets/cli`) so versioning + changelog + tag creation are one reviewed step instead of hand-bumping, OR keep manual: `npm version <semver> -w @mdninja/cli` → push the `v<x.y.z>` tag. Pick one; document it as the ADR.

4. **Provenance requires a public repo + GitHub-hosted runner** — satisfied (ubuntu-latest, public repo).

---

## One-time setup (owner only — secrets & org)

I do not touch tokens or the npm org. From official guidance:

1. **npm token:** npm → profile → Access Tokens → **New Granular Access Token** → scope: read+write on the `@mdninja` org's packages (or an Automation token; classic tokens work but granular is current best practice). `npm publish` from CI needs 2FA **bypassed for automation** (granular token with "bypass 2FA" enabled, or an automation-type token).
2. **Add the secret:** Repo → Settings → Secrets and variables → Actions → **New repository secret** → name `NPM_TOKEN`, value = the token. The workflow already references `secrets.NPM_TOKEN`.
3. **Org:** confirm packages land under the `@mdninja` org with `--access public` (scoped packages default to private on publish; the workflow passes `--access public`).

## Cut a release

```bash
npm version patch -w @mdninja/cli     # bumps CLI version, creates v1.0.1 tag+commit
git push origin main --tags           # pushes the tag → release.yml runs
```

Or push an annotated tag directly: `git tag v1.0.1 && git push origin v1.0.1`.

Verify after: package page shows a **"Provenance"** badge and the GitHub Release lists the tag.

---

## ADR candidate

`0011-npm-release-pipeline.md` — ratify: publish canon (a), adopt changesets vs manual versioning, token type (granular). Reference official GitHub/npm docs as the source.
