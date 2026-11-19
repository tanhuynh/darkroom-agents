// ACCESS layer: adb-mcp (connector-specific; rewrite or retire if the Photoshop connector changes — engine.md Layers)
const { io } = require("/Users/tanhuynh/dev/adb-mcp/adb-proxy-socket/node_modules/socket.io-client");
const fs = require("fs");

async function main() {
  console.log("Connecting to proxy :3001 to read smartObject on layer 2...");
  const socket = io("http://localhost:3001", { transports: ["websocket"] });

  const timer = setTimeout(() => {
    socket.disconnect();
    console.error("Timeout waiting for packet_response");
    process.exit(1);
  }, 90000);

  socket.on("connect", () => {
    console.log("Socket connected! Sending get smartObject command...");
    socket.emit("command_packet", {
      type: "command",
      application: "photoshop",
      command: {
        application: "photoshop",
        action: "executeBatchPlayCommand",
        options: {
          commands: [
            {
              _obj: "get",
              _target: [
                { _property: "smartObject", _ref: "layer", _id: 2 }
              ]
            }
          ]
        }
      }
    });
  });

  socket.on("packet_response", (data) => {
    clearTimeout(timer);
    socket.disconnect();
    console.log("Received packet_response! Status:", data.status);
    const resp = data.response;
    if (resp && resp.smartObject && resp.smartObject.filterFX) {
      console.log("Found filterFX! Length:", resp.smartObject.filterFX.length);
      const filter = resp.smartObject.filterFX[0].filter;
      console.log("Filter _obj:", filter._obj);
      console.log("Filter keys:", Object.keys(filter));
      if (filter.$LCs) {
        console.log("$LCs length:", filter.$LCs.length);
        fs.writeFileSync("measure/0025-live-lcs.xml", filter.$LCs);
        console.log("Saved $LCs to measure/0025-live-lcs.xml");
      }
      if (filter.$Rtch) {
        console.log("$Rtch length:", filter.$Rtch.length);
        fs.writeFileSync("measure/0025-live-rtch.xml", filter.$Rtch);
        console.log("Saved $Rtch to measure/0025-live-rtch.xml");
      }
      fs.writeFileSync("measure/0025-live-filter.json", JSON.stringify(filter, null, 2));
      console.log("Saved complete filter to measure/0025-live-filter.json");
    } else {
      console.log("smartObject response structure:", Object.keys(resp || {}));
      fs.writeFileSync("measure/0025-live-layer.json", JSON.stringify(resp, null, 2));
      console.log("Saved full layer response to measure/0025-live-layer.json");
    }
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
  console.error("Error in main:", err);
  process.exit(1);
});
