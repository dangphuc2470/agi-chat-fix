# AGI Chat Fix

All-in-one UX enhancement and bug-fix suite for **Antigravity IDE**.

---

## Key UX Fixes & Enhancements

1. **Clipboard & Text Selection**:
   - Fixes reliable copying (`Ctrl+C` / `Cmd+C`) from AI responses, user messages, and code blocks.
   - Fixes keyboard pasting (`Ctrl+V` / `Cmd+V`) and system clipboard history directly into the prompt input.

2. **Right-Click Context Menu**:
   - Restores native context menu (**Cut**, **Copy**, **Paste**, **Select All**) across the agent chat panel.

3. **Workspace Chat History (Windows)**:
   - Resolves missing or intermittent conversation history caused by URI encoding (`%3A` vs `:`) and drive letter case mismatches (`D:` vs `d:`).

4. **Conversation Forking (Branch in New Chat)**:
   - Unlocks built-in conversation branching with a `fork_left` icon under every response to explore alternate prompts without losing context.

5. **Multi-Window Notification Focus**:
   - Directs task completion notifications to the exact window running the task, instead of opening duplicate chats in whichever window is currently active.

6. **Cross-Workspace Chat Switch & QuickPick**:
   - Preserves the QuickPick prompt (*"Open in current window"* vs *"Open in workspace"*).
   - When choosing to open in the other workspace, automatically switches to that workspace window and auto-loads the selected conversation immediately, even if that window was already open in the background.

7. **Integrity & Auto-Patch Management**:
   - Synchronizes `product.json` checksums to silence the *"Your installation appears to be corrupted"* warning.
   - Automatically detects unpatched files after IDE updates and offers a 1-click *"Apply All Fixes & Reload"*.

---

## Installation

### Install via Antigravity IDE (VSIX)

1. Download the latest `.vsix` from [Releases](https://github.com/dangphuc2470/agi-chat-fix/releases).
2. Open Extensions (`Ctrl + Shift + X` or `Cmd + Shift + X`).
3. Click More Actions (**`...`**) in the Extensions panel title bar.
4. Select **Install from VSIX...** and pick the downloaded package.
5. Reload window (`Ctrl + Shift + P` -> **Developer: Reload Window**).

---

## Commands

Access via Command Palette (`Ctrl + Shift + P` / `Cmd + Shift + P`) by searching **`agi`**:

| Command | Description |
|---|---|
| `AGI Chat Fix: Apply All Fixes & Sync Checksums` | Applies all patches and synchronizes checksums |
| `AGI Chat Fix: Dismiss Corrupted Warning (Sync Checksums)` | Synchronizes checksums with `product.json` without modifying code |
| `AGI Chat Fix: Remove All Fixes (Restore Original)` | Restores unmodified IDE files and original checksums |

---

## License

[MIT](LICENSE.txt) &copy; 2026 dangphuc2470
