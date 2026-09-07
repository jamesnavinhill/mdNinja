# Configuration

mdNinja separates **tool configuration** (hidden, machine-read) from **repository documentation** (visible, human-read). Three surfaces cover it: a project config file, environment variables, and browser-side user preferences.

## 1. `.mdninja/config.json`

Lives at your project root. The single source of truth for its shape is [`packages/canon/index.js`](../packages/canon/index.js) (`@mdninja/canon`) — both `mdninja init` and the in-app scaffold route write the identical artifact, and the runtime reads exactly what's below.

```json
{
  "$schema": "https://mdninja.navinhill.com/schema.json",
  "name": "My Project",
  "canon": "./mdninja"
}
```

| Field | Default | Effect |
| :--- | :--- | :--- |
| `name` | folder name | Display name in the sidebar project picker. |
| `canon` | `./mdninja` | Relative path to the living-canon folder. |

Scanning is directory-based over the canon folder, `docs/`, `.agents/`, and root Markdown. If `docs/` doesn't exist in your repo, it won't appear in the tree.

## 2. Environment variables

Used when self-hosting the web deployment (Vercel or a local server). Copy from [`.env.example`](../.env.example).

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | production | `http://localhost:3000` | Canonical app origin. Must byte-for-byte match the origin registered on your GitHub OAuth App, because the callback URL derives from it. |
| `GITHUB_CLIENT_ID` | for GitHub connect | `""` | GitHub OAuth App client ID. |
| `GITHUB_CLIENT_SECRET` | for GitHub connect | `""` | GitHub OAuth App client secret. |

GitHub is the only optional feature that needs env config; the rest of the app runs with zero environment.

With `NEXT_PUBLIC_APP_URL` left at its localhost default, connect-a-repo simply won't fire — there's no registered callback to redirect to.

## 3. GitHub OAuth App setup

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Application name: anything you like. Homepage URL: your app origin (e.g. `https://mdninja.navinhill.com`).
3. Authorization callback URL: `<your origin>/api/auth/callback/github`.
4. Generate the client secret, then set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your Vercel project (or `.env.local` for local serving).

Token flow: the callback route performs the code exchange, hands the account to your browser via `postMessage`, and retains nothing. Tokens, profiles, and repo lists live in your browser's `localStorage`. See [ADR 0004](../mdninja/decisions/0004-zero-leak-multi-user-isolation.md).

## 4. Browser-side user preferences

Settings → **Styling, Themes & Comfort** holds the reading experience: reading palette, accent color, font family/size, line height, document max width, and the folder icon engine. These are per-visitor UI state — they never touch your repo.
