#!/usr/bin/env node
// ACCESS layer: adb-mcp (connector-specific; rewrite or retire if the Photoshop connector changes — engine.md Layers)
// Read / write the Camera Raw Filter on a layer through the adb-mcp proxy (same socket the MCP servers use).
// Encodes the engine.md §5 rules: read the live filter, resend EVERY key (Glow, $Rtch, $Lblr, $DMIn, …), omit $BigT.
// $BigT cannot be written: batchPlay rejects it ("ByteArray is not supported for this operation", 0367, 2026-11-23).
// Brushes whose bytes live in $BigT (crs:MaskBrushTable) are therefore lost at the next dialog session after ANY
// scripted write (0044, 9944, 0367) — so `set` refuses while such a brush exists.
//
//   node tools/ps_filter.js get <docId> <out.json> [--layer 2] [--split <prefix>]
//       Saves the full `get smartObject` response to <out.json> and prints each filter key with its size.
//       --split writes <prefix>_lcs.xml, <prefix>_rtch.xml, <prefix>_lblr.xml, … (every key except $BigT).
//   node tools/ps_filter.js set <docId> --from <out.json> [--lcs new.xml] [--key '$Lblr=new.xml' …] [--layer 2] [--index 1] [--dry]
//       Builds a `set` on filterFX from the keys of <out.json> (minus $BigT), replacing $LCs with --lcs and any
//       other existing string key with --key KEY=file if given.
//       --dry prints the key list and sizes and sends nothing. --history NAME labels the History step.
//       Refuses (exit 4) while $LCs holds a brush stored in $BigT (crs:MaskBrushTable): the write would cost that brush
//       at the next dialog session. Paint such brushes after the last scripted write, use an XMP-native mask instead
//       (gradient/radial/range/object mask), or pass --allow-brush-loss to accept repainting.
//       After sending, reads the filter back and checks every key and brush reference is still there (exit 3 if not).
//
// Notes: a timed-out write may still complete — run `get` and compare before retrying. "host is in a modal state"
// (a Photoshop/Camera Raw dialog is open) is retried for ~2 minutes. Override the proxy URL with PS_PROXY and the
// socket.io location with SOCKETIO_PATH.
const fs = require("fs");
const os = require("os");
const path = require("path");

const socketPath = process.env.SOCKETIO_PATH ||
  path.join(os.homedir(), "dev/adb-mcp/adb-proxy-socket/node_modules/socket.io-client");
const PROXY = process.env.PS_PROXY || "http://localhost:3001";

function sendBatch(commands, timeoutMs = 120000, historyName) {
  return new Promise((resolve, reject) => {
    const { io } = require(socketPath);
    const socket = io(PROXY, { transports: ["websocket"] });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error("TIMEOUT — the command may still complete in Photoshop; run `get` before retrying"));
    }, timeoutMs);
    socket.on("connect", () => socket.emit("command_packet", {
      type: "command", application: "photoshop",
      command: { application: "photoshop", action: "executeBatchPlayCommand",
                 options: historyName ? { commands, historyName } : { commands } },
    }));
    socket.on("packet_response", (d) => { clearTimeout(timer); socket.disconnect(); resolve(d); });
    socket.on("connect_error", (e) => { clearTimeout(timer); reject(e); });
  });
}

async function sendRetryModal(commands, historyName) {
  for (let i = 0; i < 6; i++) {
    const r = await sendBatch(commands, 120000, historyName);
    if (r.status === "FAILURE" && /modal state/.test(r.message || "")) {
      console.error(`Photoshop is in a modal state (a dialog is open); waiting… (${i + 1}/6)`);
      await new Promise((ok) => setTimeout(ok, 20000));
      continue;
    }
    return r;
  }
  throw new Error("still in a modal state — close the Photoshop / Camera Raw dialog");
}

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const flag = (name) => process.argv.includes(name);

// adb-mcp's executeBatchPlayCommand returns every result (a list) since 08aaca3; older builds returned the first.
const firstResult = (resp) => (Array.isArray(resp.response) ? resp.response[0] : resp.response);

function filterOf(resp) {
  const fx = firstResult(resp).smartObject.filterFX;
  return Array.isArray(fx) ? fx[0].filter : fx.filter;
}

const isBinary = (v) => Buffer.isBuffer(v) || (v && typeof v === "object" && v.type === "Buffer" && Array.isArray(v.data));
const brushRefs = (lcs) => (typeof lcs === "string" ? (lcs.match(/MaskBrushTable="[^"]+"/g) || []) : []);

// $BigT (and any other binary value) cannot be sent back through batchPlay, so it is never included.
function buildFilter(live, { lcs, keys = {} } = {}) {
  const filter = {};
  for (const [k, v] of Object.entries(live)) {
    if (k === "$BigT" || isBinary(v)) continue;
    filter[k] = v;
  }
  if (lcs !== undefined) filter.$LCs = lcs;
  for (const [k, v] of Object.entries(keys)) {
    if (!(k in filter)) throw new Error(`--key ${k}: not a key of the live filter`);
    filter[k] = v;
  }
  return filter;
}

// Problems that should stop a write before it is sent.
function preflight(filter) {
  const problems = [];
  const refs = brushRefs(filter.$LCs);
  if (refs.length)
    problems.push({ code: 4, msg: `${refs.length} brush mask(s) keep their bytes in $BigT (${refs.join(", ")}), which a scripted write cannot carry — the brush would be lost at the next dialog session. Paint it after the last scripted write, replace it with a gradient/radial/range/object mask, or pass --allow-brush-loss and repaint.` });
  return { problems };
}

// Compare the read-back filter with what was sent: every key present, brush references kept.
function verifyReadback(sent, back) {
  const issues = [];
  const lost = brushRefs(sent.$LCs).filter((r) => !brushRefs(back.$LCs).includes(r));
  if (lost.length) issues.push(`brush data lost: ${lost.join(", ")}`);
  for (const k of Object.keys(sent)) if (!(k in back)) issues.push(`key ${k} missing in the read-back`);
  return issues;
}

function report(filter) {
  for (const [k, v] of Object.entries(filter)) {
    const size = Buffer.isBuffer(v) ? `${v.length} B bin` : String(typeof v === "string" ? v.length : JSON.stringify(v).length);
    console.log(`  ${k.padEnd(8)} ${size.padStart(13)}`);
  }
}

async function main() {
  const cmd = process.argv[2];
  const docId = Number(process.argv[3]);
  const layer = Number(arg("--layer", 2));
  if (!cmd || !docId) { console.error("usage: see the header of tools/ps_filter.js"); process.exit(1); }

  if (cmd === "get") {
    const out = process.argv[4];
    const r = await sendRetryModal([{ _obj: "get", _target: [{ _property: "smartObject" }, { _ref: "layer", _id: layer }, { _ref: "document", _id: docId }] }]);
    if (r.status === "FAILURE") { console.error(r.message); process.exit(1); }
    fs.writeFileSync(out, JSON.stringify(r));
    const filter = filterOf(r);
    console.log(`saved ${out}; filter keys (chars):`);
    report(filter);
    const prefix = arg("--split");
    if (prefix) {
      for (const [k, v] of Object.entries(filter)) {
        if (k === "$BigT" || typeof v !== "string" || !v.startsWith("<")) continue;
        const f = `${prefix}_${k.replace("$", "").toLowerCase()}.xml`;
        fs.writeFileSync(f, v);
        console.log("wrote", f);
      }
    }
  } else if (cmd === "set") {
    const from = arg("--from");
    if (!from) { console.error("set needs --from <get output json>"); process.exit(1); }
    const live = filterOf(JSON.parse(fs.readFileSync(from, "utf8")));
    const lcsFile = arg("--lcs");
    // --key '$Lblr=file.xml' (repeatable) replaces any other string key with the file's contents
    const keys = {};
    process.argv.forEach((a, i) => {
      if (a !== "--key") return;
      const [k, f] = process.argv[i + 1].split("=");
      keys[k] = fs.readFileSync(f, "utf8");
    });
    let filter;
    try {
      filter = buildFilter(live, { lcs: lcsFile ? fs.readFileSync(lcsFile, "utf8") : undefined, keys });
    } catch (e) { console.error(e.message); process.exit(1); }
    console.log("keys to send (every key of the live filter, $BigT omitted — batchPlay cannot write it):");
    report(filter);
    const { problems } = preflight(filter);
    for (const p of problems) {
      if (p.code === 4 && flag("--allow-brush-loss")) { console.error("WARNING (allowed): " + p.msg); continue; }
      console.error("REFUSED: " + p.msg); process.exit(p.code);
    }
    if (flag("--dry")) return;
    const command = [{
      _obj: "set",
      _target: [{ _ref: "filterFX", _index: Number(arg("--index", 1)) }, { _ref: "layer", _id: layer }, { _ref: "document", _id: docId }],
      filterFX: { _obj: "filterFX", filter },
      _options: { dialogOptions: "dontDisplay" },
    }];
    // one named, undoable history step (adb-mcp ≥ this change); older plugins ignore the name
    const r = await sendRetryModal(command, arg("--history", "AI Camera Raw Filter edit"));
    if (r.status === "FAILURE") { console.error(`FAILED: ${r.message}`); process.exit(1); }
    // A SUCCESS echo is not proof: read the filter back and check what survived (still render before trusting values).
    const back = await sendRetryModal([{ _obj: "get", _target: [{ _property: "smartObject" }, { _ref: "layer", _id: layer }, { _ref: "document", _id: docId }] }]);
    if (back.status === "FAILURE") { console.error(`sent, but read-back failed: ${back.message}`); process.exit(1); }
    const verifyOut = arg("--verify-out");
    if (verifyOut) fs.writeFileSync(verifyOut, JSON.stringify(back));
    const issues = verifyReadback(filter, filterOf(back));
    if (issues.length) { console.error("READ-BACK CHECK FAILED — undo the write in Photoshop (History: Edit Filter Effects):"); issues.forEach((i) => console.error("  - " + i)); process.exit(3); }
    console.log("sent; read-back check passed (keys and brush references present) — render to verify values");
  } else {
    console.error("unknown command", cmd); process.exit(1);
  }
  process.exit(0);
}

module.exports = { firstResult, filterOf, buildFilter, preflight, verifyReadback, brushRefs };
if (require.main === module) main().catch((e) => { console.error(String(e.message || e)); process.exit(2); });
