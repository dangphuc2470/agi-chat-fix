import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Unique marker embedded in the patched code
const PATCH_MARKER = '/* agy-clipboard-fixed */';

// Target 1: PSr class and helper functions in workbench.desktop.main.js
const ORIGINAL_PSR = 'PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation()}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&t.key==="a"}function Zvf(t){const e=t.ctrlKey||t.metaKey,i=t.shiftKey&&t.key==="Insert";return e&&["c","v","x"].includes(t.key)||i}function Xvf(t){return(t.ctrlKey||t.metaKey)&&["z","y"].includes(t.key)}';

const PATCHED_PSR = `${PATCH_MARKER}PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65);if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;

// Target 2: Context menu enablement for chat panel text selection
const ORIGINAL_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n))return;Ds.stop(i,!0);const r=new Ou(e,i);';
const OLD_PATCHED_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n)&&!bI().getSelection()?.toString()&&!n?.closest?.(".antigravity-agent-side-panel"))return;Ds.stop(i,!0);const r=new Ou(e,i);';
const PATCHED_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n)&&!(n?.closest?.(".antigravity-agent-side-panel")&&bI().getSelection()?.toString()))return;Ds.stop(i,!0);const r=new Ou(e,i);';


function getWorkbenchPath(appRoot: string): string {
    return path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
}

function getProductJsonPath(appRoot: string): string {
    return path.join(appRoot, 'product.json');
}

function computeSha256Base64(buf: Buffer): string {
    return crypto.createHash('sha256').update(buf).digest('base64').replace(/=+$/, '');
}

function updateChecksumInProductJson(appRoot: string, fileRelativePath: string, newHash: string): boolean {
    const productPath = getProductJsonPath(appRoot);
    if (!fs.existsSync(productPath)) return false;
    try {
        const raw = fs.readFileSync(productPath, 'utf8');
        const json = JSON.parse(raw);
        if (!json.checksums) {
            json.checksums = {};
        }
        json.checksums[fileRelativePath] = newHash;
        fs.writeFileSync(productPath, JSON.stringify(json, null, '\t'), 'utf8');
        return true;
    } catch (e) {
        console.error('Failed to update product.json:', e);
        return false;
    }
}

async function applyFix(silent: boolean = false): Promise<boolean> {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);

    if (!fs.existsSync(wbPath)) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: File not found: ${wbPath}`);
        }
        return false;
    }

    let content: string;
    try {
        content = fs.readFileSync(wbPath, 'utf8');
    } catch (e) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: Cannot read ${wbPath} - ${e}`);
        }
        return false;
    }

    if (content.includes(PATCH_MARKER)) {
        let updated = false;
        if (content.includes(OLD_PATCHED_CM)) {
            content = content.replace(OLD_PATCHED_CM, PATCHED_CM);
            try {
                fs.writeFileSync(wbPath, content, 'utf8');
                updated = true;
            } catch (e) {
                console.error('Failed to update context menu patch:', e);
            }
        }
        // Already patched! Just make sure product.json checksum is in sync
        const curBuf = Buffer.from(content, 'utf8');
        const curHash = computeSha256Base64(curBuf);
        updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', curHash);
        if (!silent) {
            if (updated) {
                const choice = await vscode.window.showInformationMessage(
                    'AGI Chat Fix updated to latest version! Reload window to take effect.',
                    'Reload Window'
                );
                if (choice === 'Reload Window') {
                    await vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            } else {
                vscode.window.showInformationMessage('AGI Chat Fix: Already applied and checksums verified!');
            }
        }
        return true;
    }

    // Create backup if not already present
    const bakPath = `${wbPath}.bak`;
    if (!fs.existsSync(bakPath)) {
        try {
            fs.copyFileSync(wbPath, bakPath);
        } catch (e) {
            console.warn('Could not create backup file:', e);
        }
    }

    if (!content.includes(ORIGINAL_PSR)) {
        if (!silent) {
            vscode.window.showWarningMessage('AGI Chat Fix: Target pattern not found. Antigravity IDE version may have changed.');
        }
        return false;
    }

    let newContent = content.replace(ORIGINAL_PSR, PATCHED_PSR);
    if (newContent.includes(OLD_PATCHED_CM)) {
        newContent = newContent.replace(OLD_PATCHED_CM, PATCHED_CM);
    } else if (newContent.includes(ORIGINAL_CM)) {
        newContent = newContent.replace(ORIGINAL_CM, PATCHED_CM);
    }

    try {
        fs.writeFileSync(wbPath, newContent, 'utf8');
    } catch (e) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: Failed to write ${wbPath}. Permission denied? (${e})`);
        }
        return false;
    }

    // Update product.json checksum so "installation appears to be corrupted" never triggers
    const newBuf = Buffer.from(newContent, 'utf8');
    const newHash = computeSha256Base64(newBuf);
    updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', newHash);

    if (!silent) {
        const choice = await vscode.window.showInformationMessage(
            'AGI Chat Fix applied successfully! Reload window to take effect.',
            'Reload Window'
        );
        if (choice === 'Reload Window') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
    return true;
}

async function removeFix(): Promise<boolean> {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const bakPath = `${wbPath}.bak`;

    if (fs.existsSync(bakPath)) {
        try {
            fs.copyFileSync(bakPath, wbPath);
            const buf = fs.readFileSync(wbPath);
            const hash = computeSha256Base64(buf);
            updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            const choice = await vscode.window.showInformationMessage(
                'AGI Chat Fix removed! Restored from backup.',
                'Reload Window'
            );
            if (choice === 'Reload Window') {
                await vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
            return true;
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to restore from backup: ${e}`);
            return false;
        }
    }

    let content: string;
    try {
        content = fs.readFileSync(wbPath, 'utf8');
    } catch (e) {
        vscode.window.showErrorMessage(`Cannot read ${wbPath}: ${e}`);
        return false;
    }

    if (!content.includes(PATCH_MARKER)) {
        vscode.window.showInformationMessage('AGI Chat Fix: Patch is not currently applied.');
        return true;
    }

    let restored = content.replace(PATCHED_PSR, ORIGINAL_PSR);
    restored = restored.replace(PATCHED_CM, ORIGINAL_CM);
    restored = restored.replace(OLD_PATCHED_CM, ORIGINAL_CM);

    try {
        fs.writeFileSync(wbPath, restored, 'utf8');
        const buf = Buffer.from(restored, 'utf8');
        const hash = computeSha256Base64(buf);
        updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
        const choice = await vscode.window.showInformationMessage(
            'AGI Chat Fix removed successfully!',
            'Reload Window'
        );
        if (choice === 'Reload Window') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return true;
    } catch (e) {
        vscode.window.showErrorMessage(`Failed to revert ${wbPath}: ${e}`);
        return false;
    }
}

async function fixChecksumsOnly(): Promise<void> {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    if (!fs.existsSync(wbPath)) {
        vscode.window.showErrorMessage(`File not found: ${wbPath}`);
        return;
    }
    const buf = fs.readFileSync(wbPath);
    const hash = computeSha256Base64(buf);
    const ok = updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
    if (ok) {
        vscode.window.showInformationMessage('AGI Chat Fix: Checksums updated! Corrupted warning dismissed.');
    } else {
        vscode.window.showErrorMessage('Failed to update product.json checksum.');
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('agi-chat-fix.apply', () => applyFix(false)),
        vscode.commands.registerCommand('agi-chat-fix.remove', () => removeFix()),
        vscode.commands.registerCommand('agi-chat-fix.fixChecksums', () => fixChecksumsOnly()),
        vscode.commands.registerCommand('antigravity-clipboard-fix.apply', () => applyFix(false)),
        vscode.commands.registerCommand('antigravity-clipboard-fix.remove', () => removeFix()),
        vscode.commands.registerCommand('antigravity-clipboard-fix.fixChecksums', () => fixChecksumsOnly())
    );

    // Auto-check on startup
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    if (fs.existsSync(wbPath)) {
        try {
            const content = fs.readFileSync(wbPath, 'utf8');
            if (!content.includes(PATCH_MARKER) && content.includes(ORIGINAL_PSR)) {
                // Patch was lost (e.g. IDE update), offer to reapply
                vscode.window.showInformationMessage(
                    'AGI Chat Fix: IDE was updated or unpatched. Would you like to reapply the clipboard & context-menu fix?',
                    'Apply Fix & Reload'
                ).then(choice => {
                    if (choice === 'Apply Fix & Reload') {
                        applyFix(false);
                    }
                });
            } else if (content.includes(PATCH_MARKER)) {
                // Checksum integrity guard: ensure product.json matches so no corruption warning shows
                const buf = Buffer.from(content, 'utf8');
                const hash = computeSha256Base64(buf);
                updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            }
        } catch {
            // Ignore startup check errors
        }
    }
}

export function deactivate() {}
