const { io } = require("../adb-proxy-socket/node_modules/socket.io-client");

async function sendCommand(action, options) {
  return new Promise((resolve, reject) => {
    const socket = io("http://localhost:3001", { transports: ["websocket"] });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout sending " + action));
    }, 30000);

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

async function renderMeasureDoc(outputPath, width = 2000) {
  console.log(`Duplicating and resizing to ${width}px...`);
  // 1. Duplicate merged, resize, convert profile
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
      },
      {
        _obj: "convertToProfile",
        _target: [{ _ref: "document", _enum: "ordinal", _value: "targetEnum" }],
        to: "sRGB IEC61966-2.1",
        intent: { _enum: "intent", _value: "colorimetric" },
        blackPointCompensation: true,
        dither: true
      }
    ]
  });
  console.log("Prep result status:", prepRes.status);

  // 2. Save document as 16-bit PNG
  console.log(`Saving to ${outputPath}...`);
  const saveRes = await sendCommand("saveDocumentAs", {
    filePath: outputPath,
    fileType: "PNG"
  });
  console.log("Save result status:", saveRes.status);

  // 3. Close the duplicated measure doc
  console.log("Closing measure document...");
  const closeRes = await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "close",
        saving: { _enum: "yesNo", _value: "no" }
      }
    ]
  });
  console.log("Close result status:", closeRes.status);

  // 4. Verify open documents
  const docs = await sendCommand("getDocuments", {});
  console.log("Open documents now:", docs.response.map(d => d.name));
}

const targetPath = process.argv[2] || "/Users/tanhuynh/dev/adb-mcp/recipes/measure/0044-baseline-16.png";
renderMeasureDoc(targetPath).catch(err => {
  console.error("Error in renderMeasureDoc:", err);
  process.exit(1);
});
