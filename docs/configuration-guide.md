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
> All tokens exchanged via this OAuth application are passed directly into the user's local browser `localStorage`. No credentials or private repository information are ever stored on the server (see [ADR 0004](file:///c:/Users/james/projects/projectmd/projectmd/decisions/0004-zero-leak-multi-user-isolation.md)).

---

## 3. Tool Configuration (`.projectmd/config.json`)

The `.projectmd/config.json` file lives in your project root to customize repository scanning and layout defaults:

```json
{
  "$schema": "https://projectmd.dev/schema.json",
  "name": "My Project",
  "canon": "./projectmd",
  "include": [
    "projectmd/**/*.md",
    "docs/**/*.md",
    ".agents/**/*.md",
    "*.md"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/.git/**",
    "**/.next/**"
  ],
  "preferences": {
    "defaultLayout": "single",
    "pinned": [
      "projectmd/roadmaps/roadmap.md",
      "projectmd/diagrams/architecture.md"
    ]
  }
}
```

### Property Reference

* `name`: The display name of the repository displayed in the sidebar dropdown.
* `canon`: Relative path to your living canon folder (defaults to `./projectmd`).
* `include`: Glob patterns of Markdown files to aggregate into the file tree.
* `exclude`: Glob patterns to ignore during repository scanning.
* `preferences.pinned`: Array of relative file paths that will appear pinned at the top of the file tree for instant 1-click access.
