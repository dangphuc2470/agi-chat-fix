"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
// Unique marker embedded in the patched code
const PATCH_MARKER = '/* agy-chat-fixed */';
const LEGACY_MARKER = '/* agy-clipboard-fixed */';
// ==========================================
// Module 1: Clipboard & Context Menu
// ==========================================
const ORIGINAL_PSR = 'PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation()}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&t.key==="a"}function Zvf(t){const e=t.ctrlKey||t.metaKey,i=t.shiftKey&&t.key==="Insert";return e&&["c","v","x"].includes(t.key)||i}function Xvf(t){return(t.ctrlKey||t.metaKey)&&["z","y"].includes(t.key)}';
const V1_PATCHED_PSR = `/* agy-clipboard-fixed */PSr=class extends oe{constructor(e,i){super(),this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65);if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;
const V2_PATCHED_PSR = `${PATCH_MARKER}PSr=class extends oe{constructor(e,i){super(),this._domNode=e,this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65),isV=m&&(k==="v"||c===86)||(e.shiftKey&&(k==="insert"||c===45));if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}else if(isV){let p=!1;try{p=bI().execCommand("paste")}catch(t){}if(!p){kn.navigator.clipboard?.readText().then(t=>{if(!t)return;let el=e.target;const ed=x=>x&&(x.tagName==="TEXTAREA"||x.tagName==="INPUT"||x.isContentEditable||x.getAttribute?.("contenteditable")==="true"||x.getAttribute?.("role")==="textbox");if(!ed(el)){const act=bI().activeElement;el=ed(act)?act:(this._domNode?.querySelector?.('[contenteditable="true"],textarea,input')||el)}if(!el)return;if(typeof el.focus==="function"&&bI().activeElement!==el)el.focus();if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){const r=el.selectionStart||0,s=el.selectionEnd||0,proto=Object.getPrototypeOf(el),set=Object.getOwnPropertyDescriptor(proto,"value")?.set,val=el.value.substring(0,r)+t+el.value.substring(s);set?set.call(el,val):(el.value=val),el.selectionStart=el.selectionEnd=r+t.length,el.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}))}else{let h=!1;try{const dt=new DataTransfer();dt.setData("text/plain",t);const pe=new ClipboardEvent("paste",{clipboardData:dt,bubbles:!0,cancelable:!0});el.dispatchEvent(pe),h=pe.defaultPrevented}catch(t){}if(!h)bI().execCommand("insertText",!1,t)}}).catch(()=>{})}}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;
const PATCHED_PSR = `${PATCH_MARKER}PSr=class extends oe{constructor(e,i){super(),this._domNode=e,this._terminalService=i,this._register(Ze(e,Gt.KEY_DOWN,this.handleInnerKeydown.bind(this)))}handleInnerKeydown(e){if(Zvf(e)||Xvf(e)||Gvf(e)){if(this._terminalService.getTerminals().some(n=>n.component.domNode.contains(e.target)))return;e.stopPropagation();const m=e.ctrlKey||e.metaKey,k=(e.key||"").toLowerCase(),c=e.keyCode;const isC=m&&(k==="c"||c===67),isX=m&&(k==="x"||c===88),isA=m&&(k==="a"||c===65),isV=m&&(k==="v"||c===86)||(e.shiftKey&&(k==="insert"||c===45));if(isC){const s=bI().getSelection()?.toString();if(s)kn.navigator.clipboard?.writeText(s).catch(()=>{});bI().execCommand("copy")}else if(isX){bI().execCommand("cut")}else if(isA){bI().execCommand("selectAll")}else if(isV){const ed=x=>x&&(x.tagName==="TEXTAREA"||x.tagName==="INPUT"||x.isContentEditable||x.getAttribute?.("contenteditable")==="true"||x.getAttribute?.("role")==="textbox");if(!ed(e.target)&&!ed(bI().activeElement)){const el=this._domNode?.querySelector?.('[contenteditable="true"],textarea,input');if(el){if(typeof el.focus==="function")el.focus();kn.navigator.clipboard?.readText().then(t=>{if(!t)return;if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){const r=el.selectionStart||0,s=el.selectionEnd||0,proto=Object.getPrototypeOf(el),set=Object.getOwnPropertyDescriptor(proto,"value")?.set,val=el.value.substring(0,r)+t+el.value.substring(s);set?set.call(el,val):(el.value=val),el.selectionStart=el.selectionEnd=r+t.length,el.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0}))}else{let h=!1;try{const dt=new DataTransfer();dt.setData("text/plain",t);const pe=new ClipboardEvent("paste",{clipboardData:dt,bubbles:!0,cancelable:!0});el.dispatchEvent(pe),h=pe.defaultPrevented}catch(t){}if(!h)bI().execCommand("insertText",!1,t)}}).catch(()=>{})}}}}};PSr=Uvf([Wvf(1,J1t)],PSr);function Gvf(t){return(t.ctrlKey||t.metaKey)&&!t.shiftKey&&((t.key||"").toLowerCase()==="a"||t.keyCode===65)}function Zvf(t){const e=t.ctrlKey||t.metaKey,k=(t.key||"").toLowerCase(),i=t.shiftKey&&(k==="insert"||t.keyCode===45);return e&&(["c","v","x"].includes(k)||[67,86,88].includes(t.keyCode))||i}function Xvf(t){const k=(t.key||"").toLowerCase();return(t.ctrlKey||t.metaKey)&&(["z","y"].includes(k)||[90,89].includes(t.keyCode))}`;
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
// ==========================================
// Module 6: Auto-Open Workspace & Auto-Load Chat
// ==========================================
const ORIGINAL_SMART_FOCUS_TARGET = 'sn.registerCommand("workbench.action.isAntigravitySnoozed",n=>i.isSnoozed())';
const PATCHED_SMART_FOCUS_TARGET = 'sn.registerCommand("workbench.action.isAntigravitySnoozed",n=>i.isSnoozed()),sn.registerCommand("workbench.action.smartFocusConversation",(t,e)=>{try{t.get(AJ).togglePanelTab?.("conversation",e)}catch{}})';
const ORIGINAL_QUICKPICK = 'l.commands.registerCommand("antigravity.openConversationWorkspaceQuickPick",async e=>{const t=e.workspaceUris,n=e.cascadeId;if(0===t.length)return(0,c.v)(d.Lm,{openInCurrentWindow:!0});const o=[{label:"Open in current window",description:"Continue conversation in the current workspace"},...t.map(e=>({label:"Open in workspace: ",description:l.Uri.parse(e).fsPath}))],i=await l.window.showQuickPick(o,{placeHolder:"Select where to open the conversation",ignoreFocusOut:!1});if(!i||void 0===i.description)return(0,c.v)(d.Lm,{openInCurrentWindow:!1});if("Open in current window"===i.label)return(0,c.v)(d.Lm,{openInCurrentWindow:!0});const r=i.description;try{const e=l.Uri.file(r);return await q.F.getInstance().setWorkspaceCascadeMap(e.toString(),n),await l.commands.executeCommand("vscode.openFolder",e,{forceNewWindow:!0}),(0,c.v)(d.Lm,{openInCurrentWindow:!1})}catch(e){return console.error("Error opening workspace:",e),l.window.showErrorMessage("Failed to open workspace"),(0,c.v)(d.Lm,{openInCurrentWindow:!1})}})';
const PATCHED_QUICKPICK = 'l.commands.registerCommand("antigravity.openConversationWorkspaceQuickPick",async e=>{const t=e.workspaceUris,n=e.cascadeId;if(!t||0===t.length)return(0,c.v)(d.Lm,{openInCurrentWindow:!0});try{const targetUri=l.Uri.parse(t[0]);await q.F.getInstance().setWorkspaceCascadeMap(targetUri.toString(),n);await l.commands.executeCommand("vscode.openFolder",targetUri,{forceNewWindow:!0});return(0,c.v)(d.Lm,{openInCurrentWindow:!1})}catch(err){console.error("Error opening workspace:",err);return(0,c.v)(d.Lm,{openInCurrentWindow:!1})}})';
const ORIGINAL_EXT_STORAGE = 'getCascadeIdForCurrentWorkspace(){const e=this.getStoredValue(i.b.WORKSPACE_CASCADE_MAP),t=o.workspace.workspaceFolders?.[0]?.uri.toString();let n="";return void 0!==t&&void 0!==e&&(n=e[t]),n&&void 0!==t&&this.setWorkspaceCascadeMap(t,void 0),n}';
const PATCHED_EXT_STORAGE = 'getCascadeIdForCurrentWorkspace(){const e=this.getStoredValue(i.b.WORKSPACE_CASCADE_MAP),t=o.workspace.workspaceFolders?.[0]?.uri.toString();let n="";if(void 0!==t&&void 0!==e){let _norm=u=>{try{return decodeURIComponent(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}catch{return String(u||"").toLowerCase().replace(/\\\\/g,"/").replace(/\\/+$/,"")}};let _t=_norm(t);for(let[k,v]of Object.entries(e)){if(_norm(k)===_t){n=v;this.setWorkspaceCascadeMap(k,void 0);break}}}return n}';
const ORIGINAL_EXT_ACT = 'q.F.initialize(e),ce.end()';
const PATCHED_EXT_ACT = 'q.F.initialize(e),ce.end(),(()=>{try{const _pId=q.F.getInstance().getCascadeIdForCurrentWorkspace();if(_pId){const _f=()=>l.commands.executeCommand("workbench.action.smartFocusConversation",_pId);setTimeout(_f,800);setTimeout(_f,1800);setTimeout(_f,3000)}}catch(_e){}})()';
function getWorkbenchPath(appRoot) {
    return path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
}
function getMainJsPath(appRoot) {
    return path.join(appRoot, 'out', 'main.js');
}
function getAntigravityExtensionPath(appRoot) {
    return path.join(appRoot, 'extensions', 'antigravity', 'dist', 'extension.js');
}
function getProductJsonPath(appRoot) {
    return path.join(appRoot, 'product.json');
}
function computeSha256Base64(buf) {
    return crypto.createHash('sha256').update(buf).digest('base64').replace(/=+$/, '');
}
function updateChecksumInProductJson(appRoot, fileRelativePath, newHash) {
    const productPath = getProductJsonPath(appRoot);
    if (!fs.existsSync(productPath))
        return false;
    try {
        const raw = fs.readFileSync(productPath, 'utf8');
        const json = JSON.parse(raw);
        if (!json.checksums) {
            json.checksums = {};
        }
        json.checksums[fileRelativePath] = newHash;
        fs.writeFileSync(productPath, JSON.stringify(json, null, '\t'), 'utf8');
        return true;
    }
    catch (e) {
        console.error('Failed to update product.json:', e);
        return false;
    }
}
function setupAutoArchiveHook() {
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
import sys

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            return
        data = json.loads(raw_input)
    except Exception:
        return

    conv_id = data.get("conversation_id")
    if not conv_id:
        return

    user_home = os.path.expanduser("~")
    gemini_dir = os.path.join(user_home, ".gemini")
    logs_dir = os.path.join(gemini_dir, "antigravity-ide", "brain", conv_id, ".system_generated", "logs")
    transcript_file = os.path.join(logs_dir, "transcript_full.jsonl")

    if not os.path.exists(transcript_file):
        transcript_file = os.path.join(logs_dir, "transcript.jsonl")
        if not os.path.exists(transcript_file):
            return

    has_cleared_prefix = False
    messages = []

    try:
        with open(transcript_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    text_content = json.dumps(entry, ensure_ascii=False)
                    if "The server cleared a prefix of the conversation as it grew too large" in text_content:
                        has_cleared_prefix = True

                    step_type = entry.get("type")
                    content = entry.get("content", "")
                    if step_type == "USER_INPUT":
                        messages.append(f"### User:\\n\\n{content}\\n")
                    elif step_type == "PLANNER_RESPONSE":
                        messages.append(f"### Assistant:\\n\\n{content}\\n")
                except Exception:
                    continue
    except Exception:
        return

    if not has_cleared_prefix:
        return

    out_dir = os.path.join(gemini_dir, "conversations")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f"{conv_id}.md")

    try:
        with open(out_file, "w", encoding="utf-8") as out:
            out.write(f"# Conversation Archive: {conv_id}\\n\\n")
            out.write("> [!NOTE]\\n")
            out.write("> This conversation prefix was cleared by the server as it grew too large.\\n")
            out.write("> Full transcript preserved automatically by Antigravity Hook.\\n\\n---\\n\\n")
            out.write("\\n---\\n\\n".join(messages))
    except Exception:
        pass

if __name__ == "__main__":
    main()
`;
        const scriptPath = path.join(scriptsDir, 'archive_cleared_conversations.py');
        fs.writeFileSync(scriptPath, scriptContent, 'utf8');
        const hooksPath = path.join(configDir, 'hooks.json');
        let hooksJson = { hooks: {} };
        if (fs.existsSync(hooksPath)) {
            try {
                hooksJson = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
                if (!hooksJson.hooks)
                    hooksJson.hooks = {};
            }
            catch {
                hooksJson = { hooks: {} };
            }
        }
        const pythonCmd = 'python ~/.gemini/scripts/archive_cleared_conversations.py';
        const stopHooks = hooksJson.hooks.Stop || [];
        const alreadyRegistered = stopHooks.some((h) => (h.command && h.command.includes('archive_cleared_conversations.py')) ||
            (h.script && h.script.includes('archive_cleared_conversations.py')));
        if (!alreadyRegistered) {
            stopHooks.push({
                type: 'command',
                command: pythonCmd
            });
            hooksJson.hooks.Stop = stopHooks;
            fs.writeFileSync(hooksPath, JSON.stringify(hooksJson, null, 2), 'utf8');
        }
    }
    catch (e) {
        console.error('Failed to setup auto-archive hook:', e);
    }
}
function checkAndAutoLoadPendingCascade() {
    try {
        const homeDir = os.homedir();
        const pendingFile = path.join(homeDir, '.gemini', 'pending_workspace_cascade.json');
        if (!fs.existsSync(pendingFile))
            return;
        const raw = fs.readFileSync(pendingFile, 'utf8');
        const map = JSON.parse(raw);
        const folders = vscode.workspace.workspaceFolders || [];
        if (folders.length === 0)
            return;
        const norm = (u) => {
            try {
                return decodeURIComponent(u || '').toLowerCase().replace(/\\/g, '/').replace(/\/+$/, '');
            }
            catch {
                return String(u || '').toLowerCase().replace(/\\/g, '/').replace(/\/+$/, '');
            }
        };
        const currentUri = norm(folders[0].uri.toString());
        const currentFsPath = norm(folders[0].uri.fsPath);
        for (const [savedUri, cascadeId] of Object.entries(map)) {
            const normSaved = norm(savedUri);
            if ((normSaved === currentUri || normSaved === currentFsPath) && typeof cascadeId === 'string' && cascadeId) {
                delete map[savedUri];
                fs.writeFileSync(pendingFile, JSON.stringify(map, null, 2), 'utf8');
                const focus = () => {
                    vscode.commands.executeCommand('workbench.action.smartFocusConversation', cascadeId);
                };
                setTimeout(focus, 400);
                setTimeout(focus, 1000);
                setTimeout(focus, 2200);
                break;
            }
        }
    }
    catch (e) {
        console.error('Failed to auto-load pending cascade:', e);
    }
}
async function applyFix(silent = false) {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const mainPath = getMainJsPath(appRoot);
    const extPath = getAntigravityExtensionPath(appRoot);
    if (!fs.existsSync(wbPath)) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: File not found: ${wbPath}`);
        }
        return false;
    }
    let wbContent;
    try {
        wbContent = fs.readFileSync(wbPath, 'utf8');
    }
    catch (e) {
        if (!silent) {
            vscode.window.showErrorMessage(`AGI Chat Fix: Cannot read ${wbPath} - ${e}`);
        }
        return false;
    }
    // Create backups if not already present
    const wbBakPath = `${wbPath}.bak`;
    if (!fs.existsSync(wbBakPath)) {
        try {
            fs.copyFileSync(wbPath, wbBakPath);
        }
        catch { }
    }
    const mainBakPath = `${mainPath}.bak`;
    if (fs.existsSync(mainPath) && !fs.existsSync(mainBakPath)) {
        try {
            fs.copyFileSync(mainPath, mainBakPath);
        }
        catch { }
    }
    const extBakPath = `${extPath}.bak`;
    if (fs.existsSync(extPath) && !fs.existsSync(extBakPath)) {
        try {
            fs.copyFileSync(extPath, extBakPath);
        }
        catch { }
    }
    let wbModified = false;
    // Module 1: Clipboard & Context Menu
    if (wbContent.includes(V2_PATCHED_PSR)) {
        wbContent = wbContent.replace(V2_PATCHED_PSR, PATCHED_PSR);
        wbModified = true;
    }
    else if (wbContent.includes(V1_PATCHED_PSR)) {
        wbContent = wbContent.replace(V1_PATCHED_PSR, PATCHED_PSR);
        wbModified = true;
    }
    else if (wbContent.includes(ORIGINAL_PSR)) {
        wbContent = wbContent.replace(ORIGINAL_PSR, PATCHED_PSR);
        wbModified = true;
    }
    if (wbContent.includes(OLD_PATCHED_CM)) {
        wbContent = wbContent.replace(OLD_PATCHED_CM, PATCHED_CM);
        wbModified = true;
    }
    else if (wbContent.includes(ORIGINAL_CM)) {
        wbContent = wbContent.replace(ORIGINAL_CM, PATCHED_CM);
        wbModified = true;
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
    // Module 6: Register smartFocusConversation in workbench
    if (wbContent.includes(ORIGINAL_SMART_FOCUS_TARGET) && !wbContent.includes('smartFocusConversation')) {
        wbContent = wbContent.replace(ORIGINAL_SMART_FOCUS_TARGET, PATCHED_SMART_FOCUS_TARGET);
        wbModified = true;
    }
    if (wbModified) {
        try {
            fs.writeFileSync(wbPath, wbContent, 'utf8');
        }
        catch (e) {
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
        }
        catch (e) {
            console.warn('Failed to patch main.js:', e);
        }
    }
    // Module 6: Auto-Select Option 2 and Auto-Load Chat in extension.js
    if (fs.existsSync(extPath)) {
        try {
            let extContent = fs.readFileSync(extPath, 'utf8');
            let extModified = false;
            if (extContent.includes(ORIGINAL_QUICKPICK)) {
                extContent = extContent.replace(ORIGINAL_QUICKPICK, PATCHED_QUICKPICK);
                extModified = true;
            }
            if (extContent.includes(ORIGINAL_EXT_STORAGE)) {
                extContent = extContent.replace(ORIGINAL_EXT_STORAGE, PATCHED_EXT_STORAGE);
                extModified = true;
            }
            if (extContent.includes(ORIGINAL_EXT_ACT)) {
                extContent = extContent.replace(ORIGINAL_EXT_ACT, PATCHED_EXT_ACT);
                extModified = true;
            }
            if (extModified) {
                fs.writeFileSync(extPath, extContent, 'utf8');
            }
        }
        catch (e) {
            console.warn('Failed to patch extension.js:', e);
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
async function removeFix() {
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const mainPath = getMainJsPath(appRoot);
    const extPath = getAntigravityExtensionPath(appRoot);
    const wbBakPath = `${wbPath}.bak`;
    const mainBakPath = `${mainPath}.bak`;
    const extBakPath = `${extPath}.bak`;
    let restoredAny = false;
    if (fs.existsSync(wbBakPath)) {
        try {
            fs.copyFileSync(wbBakPath, wbPath);
            const buf = fs.readFileSync(wbPath);
            const hash = computeSha256Base64(buf);
            updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            restoredAny = true;
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to restore workbench from backup: ${e}`);
        }
    }
    if (fs.existsSync(mainBakPath) && fs.existsSync(mainPath)) {
        try {
            fs.copyFileSync(mainBakPath, mainPath);
            restoredAny = true;
        }
        catch (e) {
            console.warn('Failed to restore main.js from backup:', e);
        }
    }
    if (fs.existsSync(extBakPath) && fs.existsSync(extPath)) {
        try {
            fs.copyFileSync(extBakPath, extPath);
            restoredAny = true;
        }
        catch (e) {
            console.warn('Failed to restore extension.js from backup:', e);
        }
    }
    if (restoredAny) {
        const choice = await vscode.window.showInformationMessage('AGI Chat Fix removed! Restored original files.', 'Reload Window');
        if (choice === 'Reload Window') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return true;
    }
    vscode.window.showInformationMessage('AGI Chat Fix: No backups found to restore.');
    return false;
}
async function fixChecksumsOnly() {
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
    }
    else {
        vscode.window.showErrorMessage('Failed to update product.json checksum.');
    }
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('agi-chat-fix.apply', () => applyFix(false)), vscode.commands.registerCommand('agi-chat-fix.remove', () => removeFix()), vscode.commands.registerCommand('agi-chat-fix.fixChecksums', () => fixChecksumsOnly()), vscode.commands.registerCommand('antigravity-clipboard-fix.apply', () => applyFix(false)), vscode.commands.registerCommand('antigravity-clipboard-fix.remove', () => removeFix()), vscode.commands.registerCommand('antigravity-clipboard-fix.fixChecksums', () => fixChecksumsOnly()));
    // Auto-load pending cascade on window activation or focus
    checkAndAutoLoadPendingCascade();
    context.subscriptions.push(vscode.window.onDidChangeWindowState(state => {
        if (state.focused) {
            checkAndAutoLoadPendingCascade();
        }
    }));
    // Auto-check on startup
    const appRoot = vscode.env.appRoot;
    const wbPath = getWorkbenchPath(appRoot);
    const mainPath = getMainJsPath(appRoot);
    const extPath = getAntigravityExtensionPath(appRoot);
    if (fs.existsSync(wbPath)) {
        try {
            const wbContent = fs.readFileSync(wbPath, 'utf8');
            let needsPatch = false;
            if (wbContent.includes(V2_PATCHED_PSR) || wbContent.includes(V1_PATCHED_PSR) || (!wbContent.includes(PATCH_MARKER) && wbContent.includes(ORIGINAL_PSR))) {
                needsPatch = true;
            }
            if (wbContent.includes(ORIGINAL_B5U) || wbContent.includes(ORIGINAL_FORK_FLAG)) {
                needsPatch = true;
            }
            if (wbContent.includes(ORIGINAL_SMART_FOCUS_TARGET) && !wbContent.includes('smartFocusConversation')) {
                needsPatch = true;
            }
            if (fs.existsSync(mainPath)) {
                const mainContent = fs.readFileSync(mainPath, 'utf8');
                if (mainContent.includes(ORIGINAL_NOTIF_PAYLOAD)) {
                    needsPatch = true;
                }
            }
            if (fs.existsSync(extPath)) {
                const extContent = fs.readFileSync(extPath, 'utf8');
                if (extContent.includes(ORIGINAL_QUICKPICK)) {
                    needsPatch = true;
                }
            }
            if (needsPatch) {
                vscode.window.showInformationMessage('AGI Chat Fix: Antigravity IDE has unpatched components. Would you like to apply all fixes?', 'Apply All Fixes & Reload').then((choice) => {
                    if (choice === 'Apply All Fixes & Reload') {
                        applyFix(false);
                    }
                });
            }
            else {
                // Checksum integrity guard: ensure product.json matches so no corruption warning shows
                const buf = Buffer.from(wbContent, 'utf8');
                const hash = computeSha256Base64(buf);
                updateChecksumInProductJson(appRoot, 'vs/workbench/workbench.desktop.main.js', hash);
            }
        }
        catch {
            // Ignore startup check errors
        }
    }
}
function deactivate() { }
