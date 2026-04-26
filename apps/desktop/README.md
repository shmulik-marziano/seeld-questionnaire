# Shmuel Desktop

Tauri 2 wrapper that loads `https://shmuel.ai` in a native window.

## Prerequisites

- Rust toolchain (https://rustup.rs)
- macOS: Xcode Command Line Tools
- Windows: WebView2, MSVC toolchain
- Linux: webkit2gtk, libgtk-3-dev

## Develop

```bash
pnpm --filter @shmuel/desktop tauri dev
```

## Build

```bash
pnpm --filter @shmuel/desktop tauri build
```

Outputs to `src-tauri/target/release/bundle/`.

## Code signing

Real builds need:
- macOS: Developer ID certificate, Apple Developer account, notarization
- Windows: Authenticode certificate

Both are configured by setting environment variables; see `tauri.conf.json` and Tauri docs.

## Icons

Drop the five icon files into `src-tauri/icons/` (see the `.gitkeep` file there).
