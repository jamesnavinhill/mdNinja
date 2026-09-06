# Skill: Document Architecture Decision Record (ADR)

Use this workflow whenever a major design choice, dependency change, or architectural pivot is decided.

## Instructions
1. Inspect `projectmd/decisions/` to identify the next sequential number (e.g., `0004-...md`).
2. Read `projectmd/decisions/0000-template.md` for the standard structure.
3. Write the new ADR including:
   - **Context:** Why this choice is necessary.
   - **Decision:** The exact technical approach selected.
   - **Consequences:** Positive and negative trade-offs.
   - **🤖 Agent Enforcement:** Explicit `DO` and `DO NOT` bullet points for AI coding assistants.
4. Save the file to `projectmd/decisions/NNNN-<short-name>.md`.
