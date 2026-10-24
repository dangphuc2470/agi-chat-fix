# AGI Chat Fix

All-in-one fix and enhancement suite for **Antigravity IDE**.

---

## What This Extension Fixes & Enhances

1. **Clipboard & Selection (`Cmd+C` / `Ctrl+C`, `Cmd+V` / `Ctrl+V`)**:
   - Reliable copying of highlighted text in AI responses, user messages, and code snippets.
   - Smooth pasting into the chat prompt input from keyboard shortcuts and clipboard history.
2. **Right-Click Context Menu**:
   - Restores full context menu (**Cut / Copy / Paste / Select All**) anywhere in the chat panel.
3. **Windows Workspace Chat History**:
   - Fixes issue on Windows where recent chat history belonging to the current workspace folder would disappear or intermittently fail to show due to URL encoding differences (`%3A` vs `:`) and drive letter casing (`D:` vs `d:`).
4. **Conversation Forking (Branch in New Chat)**:
   - Unlocks the hidden conversation forking feature across the app.
   - Adds a Git branch icon (`fork_left`) under **every response** so you can branch off into a new conversation from any checkpoint.
5. **Full Context Archive & Link**:
   - When a conversation reaches max context length and the server clears earlier turns, replaces the plain warning with an automatic archive notice plus a direct link to open the full conversation history as a clean Markdown (`.md`) file.
   - Configures automatic archiving of cleared conversations into `~/.gemini/conversations/`.
6. **Multi-Window Notification Focus**:
   - Fixes issue where clicking a task-completed desktop notification opened the chat inside the currently active window instead of switching focus to the original window that ran the task.
7. **Auto-Load Cross-Workspace Chat & Zero Popup**:
   - Eliminates the annoying *"Select where to open the conversation"* dialog when clicking conversations from different workspace folders.
   - Automatically switches to/opens the target workspace window and auto-loads the selected conversation immediately.
8. **Auto-Syncs Checksums & Auto-Prompts on IDE Updates**:
   - Recalculates and updates `product.json` checksums automatically, eliminating the *"Your installation appears to be corrupted"* warning.
   - When Google updates Antigravity IDE and overwrites files, the extension detects the missing patches on launch and offers a 1-click *"Apply All Fixes & Reload"* button.

---

## Installation

### Method 1: Install via Antigravity IDE UI (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/dangphuc2470/agi-chat-fix/releases).
2. Open Antigravity IDE.
3. Open the Extensions view by pressing `Cmd + Shift + X` (macOS) or `Ctrl + Shift + X` (Windows/Linux).
4. Click the three dots menu (**`...`**) in the top right corner of the Extensions panel.
5. Select **Install from VSIX...** and choose the downloaded `.vsix` file.
6. When prompted, reload the window, or press `Cmd + Shift + P` -> **Developer: Reload Window**.

---

## Usage

Once installed, the extension works automatically on startup.

You can also run commands manually by pressing `Cmd + Shift + P` (or `Ctrl + Shift + P`) and typing **`agi`**, **`chat`**, or **`fix`**:

| Command | Description |
|---|---|
| `AGI Chat Fix: Apply All Fixes & Sync Checksums` | Applies all patches and syncs checksums |
| `AGI Chat Fix: Dismiss Corrupted Warning (Sync Checksums)` | Syncs checksums with `product.json` without modifying files |
| `AGI Chat Fix: Remove All Fixes (Restore Original)` | Restores the original unmodified IDE files and original checksums |

---

## License

[MIT](LICENSE.txt) &copy; 2026 dangphuc2470
