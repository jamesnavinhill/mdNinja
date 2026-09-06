# Configuration Guide

`mdNinja` strictly separates **tool configuration** (hidden) from **repository documentation** (visible). 

---

## 1. Environment Variables

When self-hosting or deploying to Vercel, define the following variables:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes (in prod) | `http://localhost:3000` | Canonical application URL used for OAuth callback generation (e.g. `https://mdninja.navinhill.com`). |
| `GITHUB_CLIENT_ID` | Optional | `""` | GitHub OAuth App Client ID for multi-repo GitHub integration. |
| `GITHUB_CLIENT_SECRET` | Optional | `""` | GitHub OAuth App Client Secret for ephemeral code exchange. |

---

## 2. GitHub OAuth Application Setup

To enable multi-repo browsing and GitHub synchronization:

1. Navigate to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in the application details:
   * **Application name:** `mdNinja`
   * **Homepage URL:** `https://mdninja.navinhill.com` (or your domain)
   * **Authorization callback URL:** `https://mdninja.navinhill.com/api/auth/callback/github`
3. Generate a new Client Secret and drop both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` into your `.env.local` or Vercel Environment Variables.

> [!NOTE]
> All tokens exchanged via this OAuth application are passed directly into the user's local browser `localStorage`. No credentials or private repository information are ever stored on the server (see [ADR 0004](../mdninja/decisions/0004-zero-leak-multi-user-isolation.md)).

---

## 3. Tool Configuration (`.mdninja/config.json`)

The `.mdninja/config.json` file lives in your project root.

> **Single source of truth:** the canonical contract and scaffolding live in
> [`packages/canon/index.js`](../packages/canon/index.js) (`@mdninja/canon`). Both the
> CLI (`mdninja init`) and the in-app scaffold route write the **same** artifact, so
> the documented fields below are exactly what the runtime reads — nothing more.

### What the runtime **actually honors** (today)

The scanner reads only these two fields (see `apps/web/src/lib/scanner.ts#getProjectConfig`):

```json
{
  "$schema": "https://mdninja.navinhill.com/schema.json",
  "name": "My Project",
  "canon": "./mdninja"
}
```

* `name`: display name shown in the sidebar project picker (defaults to the folder name).
* `canon`: relative path to your living-canon folder (defaults to `./mdninja`).

Scanning is directory-based over `mdninja/`, `docs/`, `.agents/`, and root Markdown —
`docs/` must exist for those files to appear.

### Not yet implemented (do NOT rely on these)

Earlier drafts advertised richer configuration that no code path reads. `mdninja init`
no longer writes these, and the scanner ignores them if present:

* `include` / `exclude` glob patterns (custom scan filtering)
* `preferences.pinned` (pinned files at the top of the file tree)
* `preferences.defaultLayout` (persisted panel layout)

These are intentional, planned capabilities — tracked in the roadmap / an ADR before
they become documented config. Until then they are not a contract.
