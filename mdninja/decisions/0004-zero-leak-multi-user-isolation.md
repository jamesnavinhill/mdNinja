# ADR 0004: Zero-Leak Client-Isolated Authentication & State

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

`mdNinja` is designed both as a local CLI workbench (`npx mdninja`) and as an open-source hosted public demo (e.g. `https://mdninja.navinhill.com`). 

In a hosted environment, multiple anonymous visitors browse the open-source repository simultaneously. Additionally, visitors may choose to connect their personal GitHub accounts to browse their private repositories, inspect external projects, or test live synchronization.

Traditional multi-tenant web applications store user accounts, OAuth refresh tokens, and session states in a centralized server-side database (e.g., PostgreSQL, Redis). However, for a documentation lens and visual workbench:
1. Storing third-party GitHub tokens with `repo` scope on a server creates an enormous security liability and compliance burden.
2. Any bug in multi-tenant session isolation could accidentally leak one user's private code or tokens to another visitor.
3. Requiring an external database contradicts the foundational philosophy of `mdNinja`: **"No database silos—the filesystem and Git *are* the database."**

## 2. Decision

We will implement a **Zero-Leak Client-Isolated Architecture**:
1. **Ephemeral Server Handshake:**
   * `/api/auth/github` constructs the GitHub OAuth URL with minimal required scopes (`repo,read:user`).
   * `/api/auth/callback/github` receives the temporary authorization code, exchanges it server-side for an access token, fetches the user's basic profile, and immediately returns a self-closing HTML payload.
   * This HTML payload executes `window.opener.postMessage({ type: "GH_AUTH_SUCCESS", account }, "*")` and closes itself.
   * **Zero tokens, user profiles, or session identifiers are ever stored in server memory, disk, or databases.**
2. **Browser-Local Credential Persistence:**
   * The client application receives the `postMessage` event and stores the user account details and repository selections strictly inside the visitor's private browser `localStorage` (`mdninja_gh_accounts`, `mdninja_repos`).
   * All subsequent GitHub API operations (fetching repositories, viewing commit trees, committing changes) are executed directly from the client's browser to `api.github.com` using the bearer token held in client memory.

## 3. Consequences

### Positive
* **Absolute Security & Isolation:** It is physically impossible for one visitor to view or access another visitor's GitHub tokens, accounts, or repositories.
* **Zero Infrastructure Overhead:** No PostgreSQL, Redis, Supabase, or vector databases to manage, secure, or pay for.
* **100% Self-Hosting Parity:** A user can self-host the Docker image or Vercel instance without configuring any database credentials.
* **Offline & Privacy-Preserving:** If the server is offline or disconnected, all local client state remains completely intact.

### Negative
* If a user clears their browser cookies and site storage, their connected GitHub session in `mdNinja` is cleared and must be reconnected.

## 4. 🤖 Agent Enforcement

* **DO:** Ensure all user authentication tokens and private repository lists are stored exclusively in client-side state (`localStorage`).
* **DO NOT:** Introduce server-side sessions, cookies holding auth tokens, or persistent database tables for user data.
* **DO NOT:** Log GitHub access tokens in serverless logs or API responses.
