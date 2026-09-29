# AGI Chat Fix

VS Code extension for **Antigravity IDE** that fixes copy/paste issues and restores the right-click context menu inside the AI chat panel.

---

## The Problem

In Antigravity IDE, the AI chat panel intercepts keydown events to prevent shortcut conflicts with editor tabs. However, it fails to execute the clipboard action, leading to:
- **Cmd+C / Ctrl+C does not copy**: Highlighted text in the chat panel cannot be copied using keyboard shortcuts.
- **Cmd+V / Ctrl+V does not paste**: Pasting text into the chat input box often fails or gets swallowed.
- **No right-click context menu**: Right-clicking on chat text does not show any context menu to copy.
- **Integrity check warning**: Modifying core IDE files manually causes Antigravity to show *"Your installation appears to be corrupted"*.

---

## What This Extension Does

1. **Fixes Copy (`Cmd+C` / `Ctrl+C`)**: Reliable copying of highlighted text in AI responses, user messages, and code snippets.
2. **Fixes Paste (`Cmd+V` / `Ctrl+V`)**: Smooth pasting into the chat prompt input from keyboard shortcuts and clipboard history.
3. **Unlocks Right-Click Menu**: Restores full context menu (**Cut / Copy / Paste / Select All**) anywhere in the chat panel.
4. **Auto-Syncs Checksums**: Recalculates and updates `product.json` checksums automatically, eliminating the *"corrupted installation"* warning.
5. **Auto-Prompts on IDE Updates**: When Google updates Antigravity IDE and overwrites files, the extension detects the missing patch on launch and offers a 1-click *"Apply Fix & Reload"* button.

---

## Installation

### Method 1: Install via Antigravity IDE UI (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/dangphuc2470/agi-chat-fix/releases).
2. Open Antigravity IDE.
3. Open the Extensions view by pressing `Cmd + Shift + X` (macOS) or `Ctrl + Shift + X` (Windows/Linux).
4. Click the three dots menu (**`...`**) in the top right corner of the Extensions panel.
5. Select **Install from VSIX...** and choose the downloaded `.vsix` file.
6. When prompted, reload the window, or press `Cmd + Shift + P` -> **Developer: Reload Window**.

### Method 2: Install via Terminal

```bash
"/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide" --install-extension agi-chat-fix-1.0.0.vsix
```

---

## Usage

Once installed, the extension works automatically on startup.

You can also run commands manually by pressing `Cmd + Shift + P` (or `Ctrl + Shift + P`) and typing **`agi`**, **`chat`**, or **`fix`**:

| Command | Description |
|---|---|
| `AGI Chat Fix: Apply Patch & Fix Checksums` | Applies the clipboard and right-click patch and syncs checksums |
| `AGI Chat Fix: Dismiss Corrupted Warning (Sync Checksums)` | Syncs checksums with `product.json` without modifying files |
| `AGI Chat Fix: Remove Patch (Restore Original)` | Restores the original unmodified IDE files and original checksums |

---

## License

[MIT](LICENSE.txt) &copy; 2026 dangphuc2470
