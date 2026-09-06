# ADR 0008: Tauri 2.0 Desktop Application Integration

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

Developers and technical writers working with living canon repositories often prefer a dedicated, standalone desktop application over browser tabs. The desktop app provides offline accessibility, tight OS window management, native file dialogues, and zero browser tab clutter.

Traditional solutions like Electron introduce significant memory overhead (150MB–300MB+ baseline RAM) and massive binary sizes (80MB+). Tauri 2.0 offers native OS webview rendering (WebView2 on Windows, WebKit on macOS/Linux), sub-15MB binaries, and minimal memory usage (<30MB baseline RAM).

## 2. Decision

1. **Tauri 2.0 Framework:**
   - House the native desktop crate in `apps/web/src-tauri` using Tauri 2.0.
   - Configure bundle identifier as `com.navinhill.mdninja` and product name as `mdNinja`.
2. **Unified Next.js Frontend:**
   - Reuse the exact same `@mdninja/web` React/Next.js codebase for both web browser and desktop environments.
   - Configure `devUrl: "http://localhost:3000"` for instant hot-module-reloading during development.
   - Configure `frontendDist: "../out"` for offline static desktop packaging.
3. **Capabilities & Security:**
   - Configure explicit capabilities under `src-tauri/capabilities/default.json` restricting permissions to core defaults and opener plugin.

## 3. Consequences

### Positive
* Sub-20MB installation footprint and near-instant cold launch times.
* Single frontend codebase to maintain across Web, Mobile/PWA, and Desktop.
* Native Windows installer (`.msi` / `.exe`), macOS (`.dmg` / `.app`), and Linux (`.deb` / AppImage) targets supported out of the box.

### Negative
* Requires local Rust toolchain (`rustc` / `cargo`) for desktop binary compilation.

## 4. 🤖 Agent Enforcement

* **DO:** Maintain shared UI logic between web and desktop targets in `apps/web/src`.
* **DO:** Validate Tauri crate integrity using `cargo check --manifest-path apps/web/src-tauri/Cargo.toml`.
* **DO NOT:** Introduce platform-specific dependencies that break browser or desktop interoperability without abstraction.
