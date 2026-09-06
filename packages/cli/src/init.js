const fs = require("fs/promises");
const path = require("path");

async function initCanon(targetDir = process.cwd(), options = {}) {
  console.log(`\n🥷 Initializing mdNinja Living Canon at: ${targetDir}\n`);

  // 1. Create .mdninja/config.json
  const dotMdNinja = path.join(targetDir, ".mdninja");
  await fs.mkdir(dotMdNinja, { recursive: true });
  const configPath = path.join(dotMdNinja, "config.json");

  let createdConfig = false;
  try {
    if (options.force) throw new Error("Force overwrite");
    await fs.access(configPath);
    console.log(`  ✓ .mdninja/config.json already exists (skipping)`);
  } catch {
    const configData = {
      $schema: "https://mdninja.navinhill.com/schema.json",
      name: path.basename(targetDir),
      canon: "./mdninja",
      include: [
        "mdninja/**/*.md",
        "docs/**/*.md",
        ".agents/**/*.md",
        "*.md"
      ],
      exclude: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        "**/dist/**",
        "**/build/**"
      ],
      preferences: {
        defaultLayout: "single",
        pinned: [
          "mdninja/roadmaps/roadmap.md",
          "mdninja/diagrams/architecture.md"
        ]
      }
    };
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2), "utf8");
    console.log(`  + Created .mdninja/config.json`);
    createdConfig = true;
  }

  // 2. Create canonical directories
  const canonRoot = path.join(targetDir, "mdninja");
  const subDirs = [
    "decisions",
    "roadmaps",
    "diagrams",
    "standards",
    "audits",
    "changelog",
    "notes",
    "research"
  ];

  for (const dir of subDirs) {
    const dirPath = path.join(canonRoot, dir);
    await fs.mkdir(dirPath, { recursive: true });
  }
  console.log(`  + Scaffolded mdninja/ canonical directories (${subDirs.join(", ")})`);

  // 3. Create ADR 0000 template if missing
  const templatePath = path.join(canonRoot, "decisions", "0000-template.md");
  try {
    await fs.access(templatePath);
  } catch {
    const templateContent = `# ADR [Number]: [Title]

**Date:** YYYY-MM-DD  
**Status:** [Proposed | Accepted | Superseded | Deprecated]  

## 1. Context

[Explain the problem, constraints, and alternatives considered. Why is this decision being made now?]

## 2. Decision

[State the exact decision clearly: "We will use X instead of Y to achieve Z."]

## 3. Consequences

### Positive
* [Benefit 1]
* [Benefit 2]

### Negative
* [Trade-off or technical debt incurred]
* [Added complexity or limitation]

## 4. 🤖 Agent Enforcement

[Directives for AI assistants and coding agents. What should the agent ALWAYS do or NEVER do based on this decision?]

* **DO:** [e.g., Always use X syntax when generating components]
* **DO NOT:** [e.g., Never import Y library, as it violates this architecture]
`;
    await fs.writeFile(templatePath, templateContent, "utf8");
    console.log(`  + Created mdninja/decisions/0000-template.md`);
  }

  // 4. Create initial roadmap template if missing
  const roadmapPath = path.join(canonRoot, "roadmaps", "roadmap.md");
  try {
    await fs.access(roadmapPath);
  } catch {
    const roadmapContent = `# Living Roadmap

## 📊 Visual Timeline

\`\`\`mermaid
gantt
    title Delivery Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Core Architecture      :done, m1, 2026-09-01, 3d
    Implementation         :active, m2, after m1, 5d
\`\`\`

## 📋 Milestones

### Phase 1: Foundation
- [x] Scaffold repository canon structure.
- [ ] Implement core features.
`;
    await fs.writeFile(roadmapPath, roadmapContent, "utf8");
    console.log(`  + Created mdninja/roadmaps/roadmap.md`);
  }

  console.log(`\n✨ mdNinja Living Canon initialized successfully!`);
  console.log(`Run 'npx mdninja' to start viewing your canon.\n`);
}

module.exports = { initCanon };
