import xml.etree.ElementTree as ET
import re

def main():
    with open("measure/0025-step4-lcs.xml", "r") as f:
        lcs = f.read()

    corrs = re.findall(r'CorrectionName="([^"]+)"', lcs)
    print("Base corrections:", corrs)

    # Cloned subject mask XML snippet for subtraction on the shadow side only
    subject_sub_xml = '''        <rdf:li
         crs:What="Mask/Image"
         crs:MaskActive="true"
         crs:MaskValue="1"
         crs:MaskVersion="1"
         crs:MaskSubType="1"
         crs:ReferencePoint="0.259766 0.602339"
         crs:InputDigest="08C3F896D475A2444B440C24ADA5EEA5"
         crs:InputDigestVersion="2"
         crs:LocalInputDigest="527D2ECF42D91385DDDD0484D2625153"
         crs:LocalInputDigestVersion="1"
         crs:MaskDigest="EEC9E7BF3B4A1D60B8741C59D031F35E"
         crs:WholeImageArea="0/1,0/1,1920/1,2879/1"
         crs:Origin="156,403"
         crs:FullMaskSize="2879,1920"
         crs:ModelVersion="318769633"
         crs:MaskName="Subject Subtract"
         crs:MaskBlendMode="1"
         crs:MaskInverted="false"
         crs:MaskSyncID="M50000000000000000000000000000002"/>'''

    # Correction 5: Refined Shadow-Side Burn (Pull)
    corr5 = f'''     <!-- Correction 5: Shadow-Side Burn (Refined Pull) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Shadow-Side Burn"
       crs:CorrectionSyncID="B5000000000000000000000000000005"
       crs:LocalExposure="0"
       crs:LocalHue="0"
       crs:LocalSaturation="-0.02"
       crs:LocalContrast="0"
       crs:LocalClarity="0"
       crs:LocalSharpness="0"
       crs:LocalBrightness="0"
       crs:LocalToningHue="0"
       crs:LocalToningSaturation="0"
       crs:LocalExposure2012="-0.04"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="-0.04"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="-0.03"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="0"
       crs:LocalLuminanceNoise="0"
       crs:LocalMoire="0"
       crs:LocalDefringe="0"
       crs:LocalTemperature="0"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalGrain="0"
       crs:LocalCorrectedDepth="0"
       crs:LocalGlow="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/Gradient"
         crs:MaskActive="true"
         crs:MaskName="Linear Gradient Left"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M50000000000000000000000000000001"
         crs:MaskValue="1"
         crs:ZeroX="0.32"
         crs:ZeroY="0.50"
         crs:FullX="0.02"
         crs:FullY="0.50"/>
{subject_sub_xml}
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
'''

    # Correction 6: Refined Directional Light Kiss (Push - wraps naturally onto bird)
    corr6 = f'''     <!-- Correction 6: Directional Light Kiss (Refined Push) -->
     <rdf:li>
      <rdf:Description
       crs:What="Correction"
       crs:CorrectionAmount="1"
       crs:CorrectionActive="true"
       crs:CorrectionName="Directional Light Kiss"
       crs:CorrectionSyncID="B6000000000000000000000000000006"
       crs:LocalExposure="0"
       crs:LocalHue="0"
       crs:LocalSaturation="0"
       crs:LocalContrast="0"
       crs:LocalClarity="0"
       crs:LocalSharpness="0"
       crs:LocalBrightness="0"
       crs:LocalToningHue="0"
       crs:LocalToningSaturation="0"
       crs:LocalExposure2012="0.04"
       crs:LocalContrast2012="0"
       crs:LocalHighlights2012="0.06"
       crs:LocalShadows2012="0"
       crs:LocalWhites2012="0"
       crs:LocalBlacks2012="0"
       crs:LocalClarity2012="0"
       crs:LocalDehaze="-0.04"
       crs:LocalLuminanceNoise="0"
       crs:LocalMoire="0"
       crs:LocalDefringe="0"
       crs:LocalTemperature="0.04"
       crs:LocalTint="0"
       crs:LocalTexture="0"
       crs:LocalGrain="0"
       crs:LocalCorrectedDepth="0"
       crs:LocalGlow="0"
       crs:LocalCurveRefineSaturation="100">
      <crs:CorrectionMasks>
       <rdf:Seq>
        <rdf:li
         crs:What="Mask/CircularGradient"
         crs:MaskActive="true"
         crs:MaskName="Forward Light Radial"
         crs:MaskBlendMode="0"
         crs:MaskInverted="false"
         crs:MaskSyncID="M60000000000000000000000000000001"
         crs:MaskValue="1"
         crs:Top="-0.20"
         crs:Left="0.30"
         crs:Bottom="0.75"
         crs:Right="1.20"
         crs:Angle="0"
         crs:Midpoint="50"
         crs:Roundness="0"
         crs:Feather="90"
         crs:Flipped="true"
         crs:Version="2"/>
       </rdf:Seq>
      </crs:CorrectionMasks>
      </rdf:Description>
     </rdf:li>
'''

    target_close = "</rdf:Seq>\n   </crs:MaskGroupBasedCorrections>"
    if target_close not in lcs:
        m = re.search(r'</rdf:Seq>\s*</crs:MaskGroupBasedCorrections>', lcs)
        if not m:
            raise ValueError("Could not find closing tag for MaskGroupBasedCorrections")
        target_close = m.group(0)

    new_lcs = lcs.replace(target_close, corr5 + corr6 + target_close)

    # Validate XML
    ET.fromstring(new_lcs)
    print("XML validated successfully!")
    with open("measure/0025-pushpull-v2-lcs.xml", "w") as f:
        f.write(new_lcs)
    print("Saved measure/0025-pushpull-v2-lcs.xml")

if __name__ == "__main__":
    main()
