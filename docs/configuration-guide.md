# Configuration Guide (`.projectmd/config.json`)

`projectmd` separates tool configuration (hidden) from repository documentation (visible). The `.projectmd/config.json` file lives in your project root to customize paths and preferences.

## Schema Reference

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

### Properties

* `name`: The display name of the repository shown in the sidebar header.
* `canon`: Relative path to your living canon folder (defaults to `./projectmd`).
* `include`: Glob patterns of Markdown files to aggregate into the file tree.
* `exclude`: Glob patterns to ignore during repository scanning.
* `preferences.pinned`: Array of relative file paths that will appear at the top of the file tree for instant 1-click access.
