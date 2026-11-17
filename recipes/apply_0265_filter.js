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

const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000 1.000000, 0000/00/00-00:00:00        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/">
   <crs:MaskGroupBasedCorrections>
    <rdf:Seq>
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Sky Cloud Structure (FIX 1)"
       crs:CorrectionSyncID="C1000000000000000000000000000001"
       crs:LocalSaturation="0"
       crs:LocalExposure2012="-0.05"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="-0.30"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="0.10"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0.15"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/Gradient"
         crs:MaskActive="true"
         crs:MaskName="Sky Top Ramp"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M1000000000000000000000000000001"
         crs:MaskValue="1"
         crs:ZeroX="0.5"
         crs:ZeroY="0.22"
         crs:FullX="0.5"
         crs:FullY="0.03"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Cloud Highlights Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M1000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.650000 0.780000 1.000000 1.000000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Central Amphitheater Presence (FIX 2)"
       crs:CorrectionSyncID="C2000000000000000000000000000002"
       crs:LocalSaturation="0.05"
       crs:LocalExposure2012="0.10"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="0"
       crs:LocalShadows2012="0.20"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0.15"
       crs:LocalDehaze="0"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0.15"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/CircularGradient"
         crs:MaskActive="true"
         crs:MaskName="Central Bowl Area"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M2000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="0.22"
         crs:Left="0.20"
         crs:Bottom="0.62"
         crs:Right="0.70"
         crs:Angle="0"
         crs:Midpoint="50"
         crs:Roundness="0"
         crs:Feather="75"
         crs:Flipped="true"
         crs:Version="2"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Rock Midtones (Skip Crevices)"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M2000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.160000 0.260000 0.550000 0.700000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Distant Rim Clarity (TASTE 1)"
       crs:CorrectionSyncID="C3000000000000000000000000000003"
       crs:LocalSaturation="0"
       crs:LocalExposure2012="-0.025"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="0"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0.10"
       crs:LocalDehaze="0.15"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/CircularGradient"
         crs:MaskActive="true"
         crs:MaskName="Distant Rim Band"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M3000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="0.12"
         crs:Left="0.05"
         crs:Bottom="0.30"
         crs:Right="0.95"
         crs:Angle="0"
         crs:Midpoint="50"
         crs:Roundness="0"
         crs:Feather="70"
         crs:Flipped="true"
         crs:Version="2"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Rim Midtones Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M3000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.220000 0.320000 0.600000 0.750000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Right Frame Edge Calming (TASTE 2)"
       crs:CorrectionSyncID="C4000000000000000000000000000004"
       crs:LocalSaturation="-0.05"
       crs:LocalExposure2012="-0.0625"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="-0.10"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="0"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/Gradient"
         crs:MaskActive="true"
         crs:MaskName="Right Edge Ramp"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M4000000000000000000000000000001"
         crs:MaskValue="1"
         crs:ZeroX="0.84"
         crs:ZeroY="0.55"
         crs:FullX="1.00"
         crs:FullY="0.55"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Sunlit Rock Tones Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M4000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.450000 0.580000 1.000000 1.000000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
    </rdf:Seq>
   </crs:MaskGroupBasedCorrections>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;

async function main() {
  console.log("Applying Adobe Camera Raw Filter via batchPlay...");
  const applyRes = await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "select",
        _target: [{ _ref: "layer", _id: 2 }],
        makeVisible: false
      },
      {
        _obj: "Adobe Camera Raw Filter",
        $CrVe: "19.0",
        $PrVN: 6,
        $PrVe: 251920384,
        $LCs: xmp,
        _options: { dialogOptions: "dontDisplay" }
      }
    ]
  });
  console.log("Apply response status:", applyRes.status);

  // Read back smartObject filterFX on layer 2 to verify
  console.log("Reading back filterFX on layer 2...");
  const layerRes = await sendCommand("executeBatchPlayCommand", {
    commands: [
      {
        _obj: "get",
        _target: [
          { _ref: "layer", _id: 2 },
          { _ref: "document", _enum: "ordinal", _value: "targetEnum" }
        ]
      }
    ]
  });

  const layer = layerRes.response;
  if (layer && layer.smartObject && layer.smartObject.filterFX) {
    console.log("FilterFX successfully verified! Count:", layer.smartObject.filterFX.length);
    const filter = layer.smartObject.filterFX[0].filter;
    console.log("Filter name:", filter._obj);
    console.log("Filter keys:", Object.keys(filter));
    console.log("$LCs length:", filter.$LCs ? filter.$LCs.length : 0);
  } else {
    console.warn("Warning: filterFX not found in layer response", JSON.stringify(layerRes.response).substring(0, 300));
  }
}

main().catch(err => {
  console.error("Error in apply_filter:", err);
  process.exit(1);
});
