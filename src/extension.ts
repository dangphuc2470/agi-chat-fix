import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

// Unique marker embedded in the patched code
const PATCH_MARKER = '/* agy-chat-fixed */';
const LEGACY_MARKER = '/* agy-clipboard-fixed */';

// ==========================================
// Module 1: Clipboard & Context Menu
// ==========================================
const ORIGINAL_PSR = 'PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation()}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&t.key==="a"}function Zvf(t){const e=t.ctrlKey||t.metaKey,i=t.shiftKey&&t.key==="Insert";return e&&["c","v","x"].includes(t.key)||i}function Xvf(t){return(t.ctrlKey||t.metaKey)&&["z","y"].includes(t.key)}';
const V1_PATCHED_PSR = `/* agy-clipboard-fixed */PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65);if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;
const PATCHED_PSR = `${PATCH_MARKER}PSr=class extends oe{constructor(e,i){super(),this._domNode=e,this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65),isV=m&&(k==="v"||c===86)||(e.shiftKey&&(k==="insert"||c===45));if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}else if(isV){let p=!1;try{p=bI().execCommand("paste")}catch(t){}if(!p){kn.navigator.clipboard?.readText().then(t=>{if(!t)return;let el=e.target;const ed=x=>x&&(x.tagName==="TEXTAREA"||x.tagName==="INPUT"||x.isContentEditable||x.getAttribute?.("contenteditable")==="true"||x.getAttribute?.("role")==="textbox");if(!ed(el)){const act=bI().activeElement;el=ed(act)?act:(this._domNode?.querySelector?.('[contenteditable="true"],textarea,input')||el)}if(!el)return;if(typeof el.focus==="function"&&bI().activeElement!==el)el.focus();if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){const r=el.selectionStart||0,s=el.selectionEnd||0,proto=Object.getPrototypeOf(el),set=Object.getOwnPropertyDescriptor(proto,"value")?.set,val=el.value.substring(0,r)+t+el.value.substring(s);set?set.call(el,val):(el.value=val),el.selectionStart=el.selectionEnd=r+t.length,el.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}))}else{let h=!1;try{const dt=new DataTransfer();dt.setData("text/plain",t);const pe=new ClipboardEvent("paste",{clipboardData:dt,bubbles:!0,cancelable:!0});el.dispatchEvent(pe),h=pe.defaultPrevented}catch(t){}if(!h)bI().execCommand("insertText",!1,t)}}).catch(()=>{})}}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;

const ORIGINAL_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n))return;Ds.stop(i,!0);const r=new Ou(e,i);';
const OLD_PATCHED_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n)&&!bI().getSelection()?.toString()&&!n?.closest?.(".antigravity-agent-side-panel"))return;Ds.stop(i,!0);const r=new Ou(e,i);';
const PATCHED_CM = 'onContextMenu(e,i){if(i.defaultPrevented)return;const n=i.target;if(!Yot(n)&&!_an(n)&&!(n?.closest?.(".antigravity-agent-side-panel")&&bI().getSelection()?.toString()))return;Ds.stop(i,!0);const r=new Ou(e,i);';

// ==========================================
// Module 2: Windows Workspace URI Normalization
// ==========================================
const ORIGINAL_B5U = 'function B5u(t,e,i){return Object.entries(t.summaries).sort((n,r)=>Number((r[1].lastUserInputTime&&kb(r[1].lastUserInputTime))?.getTime()??0)-Number((n[1].lastUserInputTime&&kb(n[1].lastUserInputTime))?.getTime()??0)).filter(([,n])=>i&&n.trajectoryMetadata?.parentConversationId?!1:n.workspaces.map(r=>r.workspaceFolderAbsoluteUri).some(r=>e.includes(r))).map(([n])=>n)}';
const PATCHED_B5U = 'function B5u(t,e,i){let _n=u=>{try{return decodeURIComponent(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}catch{return String(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}};let _E=(e||[]).map(_n);return Object.entries(t.summaries).sort((n,r)=>Number((r[1].lastUserInputTime&&kb(r[1].lastUserInputTime))?.getTime()??0)-Number((n[1].lastUserInputTime&&kb(n[1].lastUserInputTime))?.getTime()??0)).filter(([,n])=>i&&n.trajectoryMetadata?.parentConversationId?!1:n.workspaces.map(r=>_n(r.workspaceFolderAbsoluteUri)).some(r=>_E.includes(r))).map(([n])=>n)}';

const ORIGINAL_OCC1 = 'if(F.length===1&&F[0]===d.workspaceUris[0])';
const PATCHED_OCC1 = 'let _n2=u=>{try{return decodeURIComponent(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}catch{return String(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}};if(F.length===1&&_n2(F[0])===_n2(d.workspaceUris[0]))';

// ==========================================
// Module 3: Unlock Fork/Branch Conversation
// ==========================================
const ORIGINAL_FORK_FLAG = 'conversationForking")?.enabled??!1';
const PATCHED_FORK_FLAG = 'conversationForking")?.enabled??!0';

const ORIGINAL_FORK_BTN = 'i&&ue&&E(fxu,{steps:t})';
const PATCHED_FORK_BTN = 'ue&&E(fxu,{steps:t})';

// ==========================================
// Module 4: Full Context Archive Link
// ==========================================
const ORIGINAL_IXU = 'var ixu=({steps:t})=>txu(t)?E("div",{className:"flex items-center gap-2.5 p-4 my-2 bg-secondary/50 border border-border rounded-md",children:[E($e,{name:"info",size:16,className:"flex-shrink-0 text-secondary-foreground"}),E("p",{className:"text-sm",children:"The server cleared a prefix of the conversation as it grew too large."})]}):null';
const PATCHED_IXU = 'var ixu=({steps:t})=>{if(!txu(t))return null;let _id=wC(),{workspaceInfo:{homeDirUri:_h}={},stepHandler:{openFile:_op}={}}=co(),_uri=(_h?_h+"/.gemini/conversations/":"file:///C:/Users/phucdnh/.gemini/conversations/")+_id+".md";return E("div",{className:"flex flex-col gap-2 p-3 my-2 bg-secondary/50 border border-border rounded-md",children:[E("div",{className:"flex items-center gap-2.5",children:[E($e,{name:"info",size:16,className:"flex-shrink-0 text-secondary-foreground"}),E("p",{className:"text-sm font-medium",children:"Hội thoại đã đầy ngữ cảnh và được tự động lưu trữ."})]}),E("div",{className:"flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline pl-6",onClick:()=>{_op?.(_uri)},children:[E($e,{name:"description",size:14}),E("span",{children:"Bấm vào đây để mở toàn bộ lịch sử (.md)"})]})]})}';

// ==========================================
// Module 5: Multi-Window Notification Focus (in main.js)
// ==========================================
const ORIGINAL_NOTIF_PAYLOAD = 'payload:{cascadeId:t,type:"request_action",workspaceUri:void 0}';
const PATCHED_NOTIF_PAYLOAD = 'payload:{cascadeId:t,type:"request_action",workspaceUri:r?.workspaces?.[0]?.workspaceFolderAbsoluteUri}';


function getWorkbenchPath(appRoot: string): string {
    return path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
}

function getMainJsPath(appRoot: string): string {
    return path.join(appRoot, 'out', 'main.js');
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

function setupAutoArchiveHook(): void {
    const homeDir = os.homedir();
    const geminiDir = path.join(homeDir, '.gemini');
    const scriptsDir = path.join(geminiDir, 'scripts');
    const configDir = path.join(geminiDir, 'config');
    const convDir = path.join(geminiDir, 'conversations');

    try {
        fs.mkdirSync(scriptsDir, { recursive: true });
        fs.mkdirSync(configDir, { recursive: true });
        fs.mkdirSync(convDir, { recursive: true });

        const scriptContent = `import json
import os
import glob
import sqlite3
import sys

GEMINI_DIR = r'${geminiDir.replace(/\\/g, '/')}'
CONV_DIR = os.path.join(GEMINI_DIR, 'conversations')
BRAIN_DIR = os.path.join(GEMINI_DIR, 'antigravity-ide', 'brain')
DB_DIR = os.path.join(GEMINI_DIR, 'antigravity-ide', 'conversations')

os.makedirs(CONV_DIR, exist_ok=True)

def export_conversation(cid):
    transcript_path = os.path.join(BRAIN_DIR, cid, '.system_generated', 'logs', 'transcript.jsonl')
    if not os.path.exists(transcript_path):
        return None
    
    out_md = os.path.join(CONV_DIR, f"{cid}.md")
    turns = []
    current_turn = None
    
    with open(transcript_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            try:
                step = json.loads(line)
            except Exception:
                continue
            
            step_type = step.get('type')
            content = step.get('content') or ''
            step_idx = step.get('step_index', 0)
            tool_calls = step.get('tool_calls', [])
            
            if step_type == 'USER_INPUT':
                if current_turn is not None:
                    turns.append(current_turn)
                current_turn = {'step': step_idx, 'user': content.strip(), 'assistant': [], 'tools': []}
            elif current_turn is not None:
                if step_type == 'PLANNER_RESPONSE':
                    if content.strip():
                        current_turn['assistant'].append(content.strip())
                    for tc in tool_calls:
                        t_name = tc.get('tool_name', 'tool')
                        t_desc = tc.get('tool_summary') or tc.get('tool_action') or t_name
                        current_turn['tools'].append(f"Step {step_idx}: **{t_name}** - {t_desc}")
    
    if current_turn is not None:
        turns.append(current_turn)
        
    if not turns:
        return None
        
    with open(out_md, 'w', encoding='utf-8') as out:
        out.write(f"# Lịch sử hội thoại: {cid}\\n\\n")
        out.write(f"- **Conversation ID:** \`{cid}\`\\n")
        out.write(f"- **Số lượt hỏi đáp:** {len(turns)}\\n")
        out.write(f"- **Tự động lưu trữ lúc:** Full context / CLEARED\\n\\n---\\n\\n")
        
        for i, turn in enumerate(turns, 1):
            out.write(f"## Lượt {i} (Step {turn['step']})\\n\\n")
            out.write("### User\\n\\n" + turn['user'] + "\\n\\n")
            if turn['assistant']:
                out.write("### Assistant\\n\\n" + "\\n\\n".join(turn['assistant']) + "\\n\\n")
            else:
                out.write("### Assistant\\n\\n*(Không có phản hồi văn bản)*\\n\\n")
            if turn['tools']:
                out.write(f"<details><summary>Thao tác công cụ ({len(turn['tools'])})</summary>\\n\\n")
                for t in turn['tools']:
                    out.write(f"- {t}\\n")
                out.write("\\n</details>\\n\\n")
            out.write("---\\n\\n")
    return out_md

def scan_all_cleared():
    dbs = glob.glob(os.path.join(DB_DIR, '*.db'))
    for db_path in dbs:
        cid = os.path.splitext(os.path.basename(db_path))[0]
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("SELECT count(*) FROM steps WHERE status = 5")
            cleared_cnt = cur.fetchone()[0]
            if cleared_cnt > 0:
                export_conversation(cid)
        except Exception:
            pass

if __name__ == '__main__':
    cid_from_input = None
    if not sys.stdin.isatty():
        try:
            raw = sys.stdin.read().strip()
            if raw:
                hook_data = json.loads(raw)
                cid_from_input = hook_data.get('conversationId')
        except Exception:
            pass
    if cid_from_input:
        export_conversation(cid_from_input)
    else:
        scan_all_cleared()
    print("{}")
`;
        const scriptFile = path.join(scriptsDir, 'archive_cleared_conversations.py');
        fs.writeFileSync(scriptFile, scriptContent, 'utf8');

        const hooksFile = path.join(configDir, 'hooks.json');
        let hooksConfig: any = {};
        if (fs.existsSync(hooksFile)) {
            try {
                hooksConfig = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
            } catch {}
        }
        hooksConfig["auto-archive-full-context"] = {
            "Stop": [
                {
                    "type": "command",
                    "command": `python "${scriptFile.replace(/\\/g, '/')}"`,
                    "timeout": 30
                }
            ]
        };
        fs.writeFileSync(hooksFile, JSON.stringify(hooksConfig, null, 2), 'utf8');
    } catch (e) {
        console.warn('Failed to setup auto-archive hook:', e);
    }
}

async function applyFix(silent: boolean = false): Promise<boolean> {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const mainPath = getMainJsPath(appRoot);

    if (!fs.existsSync(wbPath)) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: File not found: ${wbPath}`);
        }
        return false;
    }

    let wbContent: string;
    try {
        wbContent = fs.readFileSync(wbPath, 'utf8');
    } catch (e) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: Cannot read ${wbPath} - ${e}`);
        }
        return false;
    }

    // Create backups if not already present
    const wbBakPath = `${wbPath}.bak`;
    if (!fs.existsSync(wbBakPath)) {
        try { fs.copyFileSync(wbPath, wbBakPath); } catch {}
    }

    const mainBakPath = `${mainPath}.bak`;
    if (fs.existsSync(mainPath) && !fs.existsSync(mainBakPath)) {
        try { fs.copyFileSync(mainPath, mainBakPath); } catch {}
    }

    let wbModified = false;

    // Module 1: Clipboard & Context Menu
    if (!wbContent.includes(PATCH_MARKER)) {
        if (wbContent.includes(V1_PATCHED_PSR)) {
            wbContent = wbContent.replace(V1_PATCHED_PSR, PATCHED_PSR);
            wbModified = true;
        } else if (wbContent.includes(ORIGINAL_PSR)) {
            wbContent = wbContent.replace(ORIGINAL_PSR, PATCHED_PSR);
            wbModified = true;
        }
        if (wbContent.includes(OLD_PATCHED_CM)) {
            wbContent = wbContent.replace(OLD_PATCHED_CM, PATCHED_CM);
            wbModified = true;
        } else if (wbContent.includes(ORIGINAL_CM)) {
            wbContent = wbContent.replace(ORIGINAL_CM, PATCHED_CM);
            wbModified = true;
        }
    }

    // Module 2: Windows Workspace URI Normalization
    if (wbContent.includes(ORIGINAL_B5U)) {
        wbContent = wbContent.replace(ORIGINAL_B5U, PATCHED_B5U);
        wbModified = true;
    }
    if (wbContent.includes(ORIGINAL_OCC1)) {
        wbContent = wbContent.replace(ORIGINAL_OCC1, PATCHED_OCC1);
        wbModified = true;
    }

    // Module 3: Unlock Fork/Branch Conversation
    if (wbContent.includes(ORIGINAL_FORK_FLAG)) {
        wbContent = wbContent.split(ORIGINAL_FORK_FLAG).join(PATCHED_FORK_FLAG);
        wbModified = true;
    }
    if (wbContent.includes(ORIGINAL_FORK_BTN)) {
        wbContent = wbContent.replace(ORIGINAL_FORK_BTN, PATCHED_FORK_BTN);
        wbModified = true;
    }

    // Module 4: Full Context Archive Link
    if (wbContent.includes(ORIGINAL_IXU)) {
        wbContent = wbContent.replace(ORIGINAL_IXU, PATCHED_IXU);
        wbModified = true;
    }

    if (wbModified) {
        try {
            fs.writeFileSync(wbPath, wbContent, 'utf8');
        } catch (e) {
            if (!silent) {
                vscode.window.showErrorMessage(`AGI Chat Fix: Failed to write ${wbPath}: ${e}`);
            }
            return false;
        }
    }

    // Module 5: Multi-Window Notification Focus in main.js
    let mainModified = false;
    if (fs.existsSync(mainPath)) {
        try {
            let mainContent = fs.readFileSync(mainPath, 'utf8');
            if (mainContent.includes(ORIGINAL_NOTIF_PAYLOAD)) {
                mainContent = mainContent.replace(ORIGINAL_NOTIF_PAYLOAD, PATCHED_NOTIF_PAYLOAD);
                fs.writeFileSync(mainPath, mainContent, 'utf8');
                mainModified = true;
            }
        } catch (e) {
            console.warn('Failed to patch main.js:', e);
        }
    }

    // Setup auto-archive hook
    setupAutoArchiveHook();

    // Sync product.json checksums
    const newBuf = Buffer.from(wbContent, 'utf8');
    const newHash = computeSha256Base64(newBuf);
    updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', newHash);

    if (!silent) {
        const message = mainModified
            ? 'All AGI Chat Fixes applied! Restart IDE to complete main process update.'
            : 'All AGI Chat Fixes applied! Reload window to take effect.';
        const choice = await vscode.window.showInformationMessage(message, 'Reload Window');
        if (choice === 'Reload Window') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
    return true;
}

async function removeFix(): Promise<boolean> {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const mainPath = getMainJsPath(appRoot);
    const wbBakPath = `${wbPath}.bak`;
    const mainBakPath = `${mainPath}.bak`;

    let restoredAny = false;

    if (fs.existsSync(wbBakPath)) {
        try {
            fs.copyFileSync(wbBakPath, wbPath);
            const buf = fs.readFileSync(wbPath);
            const hash = computeSha256Base64(buf);
            updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            restoredAny = true;
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to restore workbench from backup: ${e}`);
        }
    }

    if (fs.existsSync(mainBakPath) && fs.existsSync(mainPath)) {
        try {
            fs.copyFileSync(mainBakPath, mainPath);
            restoredAny = true;
        } catch (e) {
            console.warn('Failed to restore main.js from backup:', e);
        }
    }

    if (restoredAny) {
        const choice = await vscode.window.showInformationMessage(
            'AGI Chat Fix removed! Restored original files.',
            'Reload Window'
        );
        if (choice === 'Reload Window') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return true;
    }

    vscode.window.showInformationMessage('AGI Chat Fix: No backups found to restore.');
    return false;
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
    const mainPath = getMainJsPath(appRoot);

    if (fs.existsSync(wbPath)) {
        try {
            const wbContent = fs.readFileSync(wbPath, 'utf8');
            let needsPatch = false;

            if (!wbContent.includes(PATCH_MARKER) && wbContent.includes(ORIGINAL_PSR)) {
                needsPatch = true;
            }
            if (wbContent.includes(ORIGINAL_B5U) || wbContent.includes(ORIGINAL_FORK_FLAG)) {
                needsPatch = true;
            }
            if (fs.existsSync(mainPath)) {
                const mainContent = fs.readFileSync(mainPath, 'utf8');
                if (mainContent.includes(ORIGINAL_NOTIF_PAYLOAD)) {
                    needsPatch = true;
                }
            }

            if (needsPatch) {
                vscode.window.showInformationMessage(
                    'AGI Chat Fix: Antigravity IDE has unpatched components. Would you like to apply all fixes?',
                    'Apply All Fixes & Reload'
                ).then((choice: string | undefined) => {
                    if (choice === 'Apply All Fixes & Reload') {
                        applyFix(false);
                    }
                });
            } else {
                // Checksum integrity guard: ensure product.json matches so no corruption warning shows
                const buf = Buffer.from(wbContent, 'utf8');
                const hash = computeSha256Base64(buf);
                updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            }
        } catch {
            // Ignore startup check errors
        }
    }
}

export function deactivate() {}
