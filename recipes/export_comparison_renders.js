const { io } = require("../adb-proxy-socket/node_modules/socket.io-client");

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

async function renderDoc(docId, outputPath, width = 2000) {
  console.log(`Selecting doc ID ${docId}...`);
  // 1. Select the target document via batchPlay
  await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "select",
        _target: [{ _ref: "document", _id: docId }]
      }
    ]
  });

  console.log(`Duplicating and resizing to ${width}px...`);
  // 2. Duplicate merged, resize, convert profile
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

  // 3. Save as 16-bit PNG
  console.log(`Saving to ${outputPath}...`);
  const saveRes = await sendCommand("saveDocumentAs", {
    filePath: outputPath,
    fileType: "PNG"
  });
  console.log("Save result status:", saveRes.status);

  // 4. Close the duplicated measure doc
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
}

async function main() {
  // Export Claude's edit (doc 91: _52_0044-Edit.tif)
  console.log("=== EXPORTING CLAUDE (_52_0044-Edit.tif) ===");
  await renderDoc(91, "/Users/tanhuynh/dev/adb-mcp/recipes/measure/0044-claude-16.png");

  // Export Gemini's edit (doc 59: _52_0044-Gemini.tif)
  console.log("=== EXPORTING GEMINI (_52_0044-Gemini.tif) ===");
  await renderDoc(59, "/Users/tanhuynh/dev/adb-mcp/recipes/measure/0044-gemini-16.png");

  // Verify open docs
  const docs = await sendCommand("getDocuments", {});
  console.log("Open documents now:", docs.response.map(d => d.name));
}

main().catch(err => {
  console.error("Error in export_comparison_renders:", err);
  process.exit(1);
});
