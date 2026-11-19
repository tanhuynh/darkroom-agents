// ACCESS layer: adb-mcp (connector-specific; rewrite or retire if the Photoshop connector changes — engine.md Layers)
const { io } = require("/Users/tanhuynh/dev/adb-mcp/adb-proxy-socket/node_modules/socket.io-client");

async function sendCommand(action, options) {
  return new Promise((resolve, reject) => {
    const socket = io("http://localhost:3001", { transports: ["websocket"] });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout sending " + action));
    }, 45000);

    socket.on("connect", () => {
      socket.emit("command_packet", {
        type: "command",
        application: "photoshop",
        command: {
          application: "photoshop",
          action: action,
          options: options
        }
      });
    });

    socket.on("packet_response", (data) => {
      clearTimeout(timer);
      socket.disconnect();
      resolve(data);
    });

    socket.on("connect_error", (err) => {
      clearTimeout(timer);
      socket.disconnect();
      reject(err);
    });
  });
}

async function renderDoc(outputPath, width = 2000) {
  console.log(`Duplicating merged and resizing to ${width}px long edge (ProPhoto 16-bit)...`);
  const prepRes = await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "duplicate",
        _target: [{ _ref: "document", _enum: "ordinal", _value: "targetEnum" }],
        merged: true
      },
      {
        _obj: "imageSize",
        width: { _unit: "pixelsUnit", _value: width },
        scaleStyles: true,
        constrainProportions: true,
        interfaceIconFrameDimmed: { _enum: "interpolationType", _value: "bicubic" }
      }
    ]
  });
  console.log("Prep result status:", prepRes.status);

  console.log(`Saving to ${outputPath}...`);
  const saveRes = await sendCommand("saveDocumentAs", {
    filePath: outputPath,
    fileType: "PNG"
  });
  console.log("Save result status:", saveRes.status);

  console.log("Closing temporary duplicate document...");
  const closeRes = await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "close",
        saving: { _enum: "yesNo", _value: "no" }
      }
    ]
  });
  console.log("Close result status:", closeRes.status);

  const docs = await sendCommand("getDocuments", {});
  console.log("Open documents now:", docs.response.map(d => `${d.name} (id: ${d.id})`));
}

const targetPath = process.argv[2] || "/Users/tanhuynh/dev/darkroom-agents/measure/0025-step4-prophoto.png";
renderDoc(targetPath).catch(err => {
  console.error("Error in renderDoc:", err);
  process.exit(1);
});
