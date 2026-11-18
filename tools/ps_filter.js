#!/usr/bin/env node
// Read / write the Camera Raw Filter on a layer through the adb-mcp proxy (same socket the MCP servers use).
// Encodes the engine.md §5 rules: read the live filter, resend EVERY key (Glow, $Rtch, $Lblr, $DMIn, …), omit $BigT.
//
//   node tools/ps_filter.js get <docId> <out.json> [--layer 2] [--split <prefix>]
//       Saves the full `get smartObject` response to <out.json> and prints each filter key with its size.
//       --split writes <prefix>_lcs.xml, <prefix>_rtch.xml, <prefix>_lblr.xml, … (every key except $BigT).
//   node tools/ps_filter.js set <docId> --from <out.json> [--lcs new.xml] [--layer 2] [--index 1] [--dry]
//       Builds a `set` on filterFX from the keys of <out.json> (minus $BigT), replacing $LCs with --lcs if given.
//       --dry prints the key list and sizes and sends nothing.
//
// Notes: a timed-out write may still complete — run `get` and compare before retrying. "host is in a modal state"
// (a Photoshop/Camera Raw dialog is open) is retried for ~2 minutes. Override the proxy URL with PS_PROXY and the
// socket.io location with SOCKETIO_PATH.
const fs = require("fs");
const os = require("os");
const path = require("path");

const socketPath = process.env.SOCKETIO_PATH ||
  path.join(os.homedir(), "dev/adb-mcp/adb-proxy-socket/node_modules/socket.io-client");
const { io } = require(socketPath);
const PROXY = process.env.PS_PROXY || "http://localhost:3001";

function sendBatch(commands, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const socket = io(PROXY, { transports: ["websocket"] });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error("TIMEOUT — the command may still complete in Photoshop; run `get` before retrying"));
    }, timeoutMs);
    socket.on("connect", () => socket.emit("command_packet", {
      type: "command", application: "photoshop",
      command: { application: "photoshop", action: "executeBatchPlayCommand", options: { commands } },
    }));
    socket.on("packet_response", (d) => { clearTimeout(timer); socket.disconnect(); resolve(d); });
    socket.on("connect_error", (e) => { clearTimeout(timer); reject(e); });
  });
}

async function sendRetryModal(commands) {
  for (let i = 0; i < 6; i++) {
    const r = await sendBatch(commands);
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

function filterOf(resp) {
  const fx = resp.response.smartObject.filterFX;
  return Array.isArray(fx) ? fx[0].filter : fx.filter;
}

function report(filter) {
  for (const [k, v] of Object.entries(filter)) console.log(`  ${k.padEnd(8)} ${String(typeof v === "string" ? v.length : JSON.stringify(v).length).padStart(9)}`);
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
    const filter = {};
    for (const [k, v] of Object.entries(live)) if (k !== "$BigT") filter[k] = v;
    const lcs = arg("--lcs");
    if (lcs) filter.$LCs = fs.readFileSync(lcs, "utf8");
    console.log("keys to send (every key of the live filter, $BigT omitted):");
    report(filter);
    if (flag("--dry")) return;
    const command = [{
      _obj: "set",
      _target: [{ _ref: "filterFX", _index: Number(arg("--index", 1)) }, { _ref: "layer", _id: layer }, { _ref: "document", _id: docId }],
      filterFX: { _obj: "filterFX", filter },
      _options: { dialogOptions: "dontDisplay" },
    }];
    const r = await sendRetryModal(command);
    // A SUCCESS echo is not proof: read the filter back (`get`) and render before trusting it.
    console.log(r.status === "FAILURE" ? `FAILED: ${r.message}` : "sent (echo only — verify with `get` and a render)");
  } else {
    console.error("unknown command", cmd); process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => { console.error(String(e.message || e)); process.exit(2); });
