# ADR 0006: Rebrand to mdNinja and Dynamic Canon Discovery

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

The project originally used `projectmd` as both product identity and hardcoded directory name (`projectmd/`, `.projectmd/`). As the product evolved to **mdNinja**, hardcoded path references broke when directories were renamed or when users mounted custom living canon folders. Furthermore, using mixed-case names (`mdNinja`) in filesystems creates case-collision risks across Windows, macOS, and Linux (Docker/CI/Vercel) and violates npm package naming conventions (RFC 3986 disallows uppercase).

## 2. Decision

1. **Identifier Lowercase, Brand Styled:**
   - Use lowercase `mdninja` for all filesystem folders (`mdninja/`, `.mdninja/`), npm packages (`@mdninja/cli`, `@mdninja/web`), and CLI binaries (`npx mdninja`).
   - Use stylized **mdNinja** exclusively for visual branding, UI headers, documentation titles, and marketing.
2. **Dynamic Canon Discovery:**
   - Replace all hardcoded directory scans with dynamic discovery. The scanner inspects `.mdninja/config.json` for the `"canon"` path.
   - If not configured, automatically detect existing canon folders (`mdninja`, `docs`).
3. **Internal Markdown Link Interception:**
   - Intercept internal relative `.md` links in `MarkdownRenderer` to load target documents inside the active workspace panel rather than reloading the browser.
4. **Theme Reactivity:**
   - Ensure diagrams in `MermaidViewer` re-render dynamically with appropriate palettes when switching between light and dark themes.

## 3. Consequences

### Positive

* Zero breaking changes when switching between repositories or renaming canon folders.
- 100% compliance with npm registry naming rules for `@mdninja/cli` distribution.
- Safe cross-platform deployment across Windows, macOS, and Linux CI/CD.
- Markdown files can be cross-linked seamlessly in preview mode.

### Negative

- Requires existing repositories to follow `.mdninja` configuration standards.

## 4. 🤖 Agent Enforcement

- **DO:** Always use lowercase `mdninja` for filesystem directories, package names, and CLI invocations.
- **DO:** Maintain dynamic canon discovery via `.mdninja/config.json` rather than hardcoding folder strings.
- **DO NOT:** Commit uppercase directory names like `mdNinja/` to Git.
- **DO NOT:** Hardcode document paths in page state or scanner logic.
