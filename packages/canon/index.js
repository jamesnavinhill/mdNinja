/**
 * Canonical living-canon scaffolding & configuration contract.
 *
 * SINGLE SOURCE OF TRUTH for:
 *  - the `.mdninja/config.json` shape the runtime actually honors, and
 *  - scaffolding the canonical `mdninja/` directory layout.
 *
 * Consumed by BOTH the CLI (`packages/cli`) and the web API scaffold route
 * (`apps/web/src/app/api/scaffold/route.ts`). Do NOT fork this contract into
 * per-consumer copies — that is the exact upstream source of doc/system drift
 * (three partial implementations, three divergent scaffolds).
 *
 * Contract rule: scaffold ONLY what the runtime reads. The runtime
 * (`apps/web/src/lib/scanner.ts#getProjectConfig`) honors `canon` and `name`.
 * Fields like `include` / `exclude` / `preferences.pinned` are NOT implemented
 * anywhere and must not be advertised as live config.
 */

const fs = require("fs").promises;
const path = require("path");

/** Canonical sub-directories of the living canon (order = canonical order). */
const CANON_SUBDIRS = [
  "audits",
  "changelog",
  "decisions",
  "diagrams",
  "notes",
  "research",
  "roadmaps",
  "standards",
];

/**
 * Build the config object the runtime actually honors.
 * Intentionally excludes unimplemented fields (include/exclude/pinned) so the
 * committed artifact never advertises config the scanner ignores.
 *
 * @param {string} targetDir  Absolute path of the project being initialized.
 */
function buildCanonConfig(targetDir) {
  return {
    $schema: "https://mdninja.navinhill.com/schema.json",
    name: path.basename(targetDir),
    canon: "./mdninja",
  };
}

/**
 * Scaffold `.mdninja/config.json` and the canonical `mdninja/` directory layout.
 *
 * @param {string} targetDir  Project root to initialize.
 * @param {{force?: boolean}} options  `force` overwrites an existing config.
 * @returns {Promise<{createdConfig: boolean, createdDirs: string[]}>}
 */
async function initCanon(targetDir = process.cwd(), options = {}) {
  const result = { createdConfig: false, createdDirs: [] };

  // 1. .mdninja/config.json
  const dotMdNinja = path.join(targetDir, ".mdninja");
  await fs.mkdir(dotMdNinja, { recursive: true });
  const configPath = path.join(dotMdNinja, "config.json");

  let shouldWrite = true;
  try {
    await fs.access(configPath);
    shouldWrite = !!options.force; // exists -> only rewrite on --force
  } catch {
    shouldWrite = true; // missing -> write
  }

  if (shouldWrite) {
    await fs.writeFile(
      configPath,
      JSON.stringify(buildCanonConfig(targetDir), null, 2),
      "utf8"
    );
    result.createdConfig = true;
  }

  // 2. Canonical mdninja/ directories
  const canonRoot = path.join(targetDir, "mdninja");
  for (const dir of CANON_SUBDIRS) {
    const dirPath = path.join(canonRoot, dir);
    const existed = fs
      .access(dirPath)
      .then(() => true)
      .catch(() => false);
    await fs.mkdir(dirPath, { recursive: true });
    if (!(await existed)) result.createdDirs.push(`mdninja/${dir}`);
  }

  return result;
}

module.exports = { initCanon, buildCanonConfig, CANON_SUBDIRS };
