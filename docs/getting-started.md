# Getting Started with mdNinja

Welcome to **mdNinja**—the zero-constraint visual Markdown workbench and living canon viewer for modern engineering repositories.

---

## 1. Quick Start Options

### Option A: Explore the Public Live Demo
Visit the production deployment at [mdninja.navinhill.com](https://mdninja.navinhill.com) to view the live open-source canon, roadmaps, architecture diagrams, and ADRs with zero install.

### Option B: Run Locally in Any Repository
Run the following command from the root of any repository:

```bash
# Clone the repository
git clone https://github.com/jamesnavinhill/projectmd.git
cd projectmd

# Install dependencies
npm install

# Start the local workbench
npm run dev
```

Open `http://localhost:3000` in your browser. All local edits write directly to disk with zero lag.

---

## 2. Self-Hosting mdNinja

Because **mdNinja** requires **zero external databases** (the filesystem and Git *are* the database), self-hosting is instant and zero-maintenance.

### Deploying to Vercel (1-Click)

1. Fork or push the `projectmd` repository to your GitHub account.
2. In Vercel, click **Add New Project** and select your repository.
3. Configure the **Monorepo Settings**:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** `apps/web`
4. Set your Environment Variables:
   * `NEXT_PUBLIC_APP_URL`: Your deployment domain (e.g. `https://docs.yourcompany.com`)
   * `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
   * `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
5. Click **Deploy**.

---

## 3. The Living Canon (`projectmd/`)

`mdNinja` surfaces a dedicated, structured home for your project's living history:

* `projectmd/decisions/`: Architecture Decision Records (ADRs) with AI agent enforcement directives.
* `projectmd/roadmaps/`: Living Gantt charts and progress tasklists.
* `projectmd/diagrams/`: Interactive Mermaid vector maps with smooth 60fps pan and zoom.
* `projectmd/research/`: Technical evaluations, benchmarks, and spikes.
* `projectmd/audits/`: Performance metrics, bundle sizes, and security audits.
* `projectmd/standards/`: Engineering guidelines, UI philosophy, and code conventions.
* `docs/`: Product, API, and user-facing documentation.
* `.agents/`: AI agent instructions, operational directives, and executable skills.

---

## 4. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + \` / `Ctrl + \` | Toggle Equal Dual-Panel Split View |
| `Cmd + B` / `Ctrl + B` | Toggle File Explorer Sidebar |
| `Cmd + S` / `Ctrl + S` | Save active document directly to disk |
| `Double Click` | Activate inline block editor in preview mode |
