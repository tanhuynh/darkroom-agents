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
     <!-- Correction 1: Hero Contrast (FIX 1) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Hero Contrast (FIX 1)"
       crs:CorrectionSyncID="C1000000000000000000000000000001"
       crs:LocalSaturation="0.05"
       crs:LocalExposure2012="0.075"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="-0.15"
       crs:LocalShadows2012="0"
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
         crs:MaskName="Hero Amphitheater"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M1000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="0.30"
         crs:Left="0.30"
         crs:Bottom="0.56"
         crs:Right="0.60"
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
          crs:MaskName="Rock Midtones Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M1000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.200000 0.300000 0.650000 0.780000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <!-- Correction 2: Mesa Cliff Dehaze (FIX 2) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Mesa Cliff Dehaze (FIX 2)"
       crs:CorrectionSyncID="C2000000000000000000000000000002"
       crs:LocalSaturation="0"
       crs:LocalExposure2012="0"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="0"
       crs:LocalShadows2012="0.15"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0.10"
       crs:LocalDehaze="0.25"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/CircularGradient"
         crs:MaskActive="true"
         crs:MaskName="Eastern Cliff Face"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M2000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="0.21"
         crs:Left="0.48"
         crs:Bottom="0.44"
         crs:Right="0.78"
         crs:Angle="0"
         crs:Midpoint="50"
         crs:Roundness="0"
         crs:Feather="80"
         crs:Flipped="true"
         crs:Version="2"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Hazy Strata Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M2000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.350000 0.450000 0.800000 0.950000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <!-- Correction 3: Sunlit Hoodoo Tips (TASTE 1) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Sunlit Hoodoo Tips (TASTE 1)"
       crs:CorrectionSyncID="C3000000000000000000000000000003"
       crs:LocalSaturation="0.08"
       crs:LocalExposure2012="0.075"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="0"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0.10"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="0"
       crs:LocalTemperature="0.06"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/CircularGradient"
         crs:MaskActive="true"
         crs:MaskName="Sunlit Hoodoo Cluster"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M3000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="0.34"
         crs:Left="0.38"
         crs:Bottom="0.51"
         crs:Right="0.62"
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
          crs:MaskName="Sunlit Rock Tones Only"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M3000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.380000 0.500000 0.850000 0.980000"
          crs:LuminanceDepthSampleInfo="0 0.500000 1.000000"/>
         </rdf:Description>
        </rdf:li>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
     <!-- Correction 4: Foreground Calming (TASTE 2) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Foreground Calming (TASTE 2)"
       crs:CorrectionSyncID="C4000000000000000000000000000004"
       crs:LocalSaturation="0"
       crs:LocalExposure2012="-0.10"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="-0.15"
       crs:LocalShadows2012="0.10"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="0"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="-0.10"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/Gradient"
         crs:MaskActive="true"
         crs:MaskName="Bottom Pine Ramp"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M4000000000000000000000000000001"
         crs:MaskValue="1"
         crs:ZeroX="0.5"
         crs:ZeroY="0.72"
         crs:FullX="0.5"
         crs:FullY="1.00"/>
        <rdf:li>
         <rdf:Description
          crs:What="Mask/RangeMask"
          crs:MaskActive="true"
          crs:MaskName="Skip Deepest Shadow Bottoms"
          crs:MaskBlendMode="1"
          crs:MaskInverted="true"
          crs:MaskSyncID="M4000000000000000000000000000002"
          crs:MaskValue="0">
         <crs:CorrectionRangeMask
          crs:Version="4"
          crs:Type="2"
          crs:Invert="false"
          crs:SampleType="0"
          crs:LumRange="0.080000 0.180000 1.000000 1.000000"
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
