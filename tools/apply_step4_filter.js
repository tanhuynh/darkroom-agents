// ACCESS layer: adb-mcp (connector-specific; rewrite or retire if the Photoshop connector changes — engine.md Layers)
const { io } = require("/Users/tanhuynh/dev/adb-mcp/adb-proxy-socket/node_modules/socket.io-client");
const fs = require("fs");

async function main() {
  console.log("Reading Step 4 XMP and live Rtch...");
  const lcs = fs.readFileSync("measure/0025-step4-lcs.xml", "utf-8");
  const rtch = fs.readFileSync("measure/0025-live-rtch.xml", "utf-8");

  console.log("Connecting to proxy :3001 to send set filterFX command...");
  const socket = io("http://localhost:3001", { transports: ["websocket"] });

  const timer = setTimeout(() => {
    socket.disconnect();
    console.error("Timeout sending command");
    process.exit(1);
  }, 45000);

  const command = {
    _obj: "set",
    _target: [
      { _ref: "filterFX", _index: 1 },
      { _ref: "layer", _id: 2 }
    ],
    filterFX: {
      _obj: "filterFX",
      filter: {
        _obj: "Adobe Camera Raw Filter",
        $CrVe: "19.0",
        $PrVN: 6,
        $PrVe: 251920384,
        $Rtch: rtch,
        $LCs: lcs
      }
    },
    _options: { dialogOptions: "dontDisplay" }
  };

  socket.on("connect", () => {
    console.log("Socket connected! Sending batchPlay command...");
    socket.emit("command_packet", {
      type: "command",
      application: "photoshop",
      command: {
        application: "photoshop",
        action: "executeBatchPlayCommand",
        options: {
          commands: [command]
        }
      }
    });
  });

  socket.on("packet_response", (data) => {
    clearTimeout(timer);
    socket.disconnect();
    console.log("Received packet_response! Status:", data.status);
    console.log("Response:", JSON.stringify(data.response));
    process.exit(0);
  });

  socket.on("connect_error", (err) => {
    clearTimeout(timer);
    socket.disconnect();
    console.error("Connect error:", err);
    process.exit(1);
  });
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
