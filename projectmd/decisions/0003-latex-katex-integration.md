# ADR 0003: KaTeX Pipeline for LaTeX Formula Rendering

**Date:** 2026-09-05  
**Status:** Accepted  

## 1. Context

Modern engineering specs, AI research notes, and performance audits frequently contain mathematical notation (loss functions, token economics, latency curves). We evaluated MathJax vs KaTeX.

## 2. Decision

We will use KaTeX via `remark-math` and `rehype-katex`:
* Inline math delimited by single dollars: `$E = mc^2$`
* Display math delimited by double dollars: `$$\dots$$`

## 3. Consequences

### Positive
* KaTeX is significantly faster than MathJax and renders pure HTML/CSS synchronously without cumulative layout shifts.
* Fully compatible with GitHub Flavored Markdown math standards.

### Negative
* Some complex legacy LaTeX packages (e.g. `xy-pic`) are not supported in KaTeX.

## 4. 🤖 Agent Enforcement

* **DO:** Use `$` and `$$` delimiters for mathematical notation in markdown.
* **DO NOT:** Install heavy client-side MathJax scripts.
