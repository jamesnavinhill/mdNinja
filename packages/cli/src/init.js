const fs = require("fs/promises");
const path = require("path");
const { initCanon: scaffoldCanon } = require("@mdninja/canon");

const ADR_TEMPLATE = `# ADR [Number]: [Title]

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

const ROADMAP_TEMPLATE = `# Living Roadmap

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

/**
 * Initialize the living canon in `targetDir`.
 * The config shape + canonical directory layout come from the shared
 * `@mdninja/canon` contract (single source of truth). This CLI layer only adds
 * friendly logging and optional seed documents (ADR template + roadmap).
 */
async function initCanon(targetDir = process.cwd(), options = {}) {
  console.log(`\n🥷 Initializing mdNinja Living Canon at: ${targetDir}\n`);

  // Single source of truth: contract + directory scaffold.
  const { createdConfig } = await scaffoldCanon(targetDir, { force: options.force });
  console.log(
    createdConfig
      ? `  + Created .mdninja/config.json`
      : `  ✓ .mdninja/config.json already exists (skipping)`
  );

  const canonRoot = path.join(targetDir, "mdninja");

  // Seed ADR template (only if missing).
  const templatePath = path.join(canonRoot, "decisions", "0000-template.md");
  try {
    await fs.access(templatePath);
  } catch {
    await fs.writeFile(templatePath, ADR_TEMPLATE, "utf8");
    console.log(`  + Created mdninja/decisions/0000-template.md`);
  }

  // Seed roadmap template (only if missing).
  const roadmapPath = path.join(canonRoot, "roadmaps", "roadmap.md");
  try {
    await fs.access(roadmapPath);
  } catch {
    await fs.writeFile(roadmapPath, ROADMAP_TEMPLATE, "utf8");
    console.log(`  + Created mdninja/roadmaps/roadmap.md`);
  }

  console.log(`\n✨ mdNinja Living Canon initialized successfully!`);
  console.log(`Run 'npx @mdninja/cli' to start viewing your canon.\n`);
}

module.exports = { initCanon };
