// Unit tests for tools/ps_filter.js (no Photoshop needed).  Run:  node --test tools/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const pf = require("./ps_filter.js");

const LCS_BRUSH = '<x:xmpmeta><crs:Corrections><rdf:li crs:MaskBrushTable="2200530C1D3A" crs:MaskBrushUncompressedBytes="7559"/></crs:Corrections></x:xmpmeta>';
const LCS_INLINE = '<x:xmpmeta><crs:Corrections><rdf:li><crs:CorrectionMasks><rdf:li crs:What="Mask/Paint"/></crs:CorrectionMasks></rdf:li></crs:Corrections></x:xmpmeta>';
const live = (lcs = LCS_INLINE) => ({
  _obj: "Adobe Camera Raw Filter", $CrVe: "19.0", $PrVN: 6, $PrVe: 196608,
  $LCs: lcs, $Rtch: "<rtch/>",
  $BigT: { type: "Buffer", data: [1, 2, 3, 4, 250] },
});
const getResponse = (filter, asList) => {
  const body = { smartObject: { filterFX: [{ filter }] } };
  return { status: "SUCCESS", response: asList ? [body] : body };
};

test("filterOf accepts both proxy response shapes", () => {
  for (const asList of [true, false]) assert.equal(pf.filterOf(getResponse(live(), asList)).$CrVe, "19.0");
});

test("buildFilter never sends $BigT (batchPlay rejects ByteArray in a filterFX set)", () => {
  assert.ok(!("$BigT" in pf.buildFilter(live())));
  const l = live(); l.$BigT = Buffer.from([9, 9]);       // as read straight from the socket
  assert.ok(!("$BigT" in pf.buildFilter(l)));
});

test("buildFilter resends every other key and replaces only what was asked", () => {
  const f = pf.buildFilter(live(), { lcs: "<new/>", keys: { $Rtch: "<rtch2/>" } });
  assert.deepEqual(Object.keys(f).sort(), Object.keys(live()).filter((k) => k !== "$BigT").sort());
  assert.equal(f.$LCs, "<new/>");
  assert.equal(f.$Rtch, "<rtch2/>");
  assert.equal(f.$CrVe, "19.0");
});

test("buildFilter rejects an unknown --key", () => {
  assert.throws(() => pf.buildFilter(live(), { keys: { $Nope: "x" } }), /not a key/);
});

test("preflight refuses while a $BigT-stored brush exists (0367 Mountains subtract)", () => {
  const { problems } = pf.preflight(pf.buildFilter(live(LCS_BRUSH)));
  assert.equal(problems[0].code, 4);
  assert.match(problems[0].msg, /2200530C1D3A/);
});

test("preflight allows inline brushes (dabs in $LCs survive writes)", () => {
  assert.deepEqual(pf.preflight(pf.buildFilter(live(LCS_INLINE))).problems, []);
});

test("preflight checks the NEW $LCs, so removing the brush component clears it", () => {
  assert.deepEqual(pf.preflight(pf.buildFilter(live(LCS_BRUSH), { lcs: LCS_INLINE })).problems, []);
});

test("verifyReadback passes when keys and brush refs are present", () => {
  assert.deepEqual(pf.verifyReadback(pf.buildFilter(live(LCS_BRUSH)), live(LCS_BRUSH)), []);
});

test("verifyReadback reports a missing key or a lost brush reference", () => {
  const sent = pf.buildFilter(live(LCS_BRUSH));
  const noRtch = live(LCS_BRUSH); delete noRtch.$Rtch;
  assert.match(pf.verifyReadback(sent, noRtch).join(), /key \$Rtch missing/);
  assert.match(pf.verifyReadback(sent, live(LCS_INLINE)).join(), /brush data lost: MaskBrushTable="2200530C1D3A"/);
});

// Real snapshot from case 0367 (measure/ is git-ignored; skipped when absent).
const REAL = path.join(__dirname, "..", "measure", "0367_get_before.json");
test("real 0367 snapshot: the Mountains subtract brush blocks a scripted write", { skip: !fs.existsSync(REAL) }, () => {
  const f = pf.buildFilter(pf.filterOf(JSON.parse(fs.readFileSync(REAL, "utf8"))));
  assert.ok(!("$BigT" in f));
  const { problems } = pf.preflight(f);
  assert.equal(problems.length, 1);
  assert.match(problems[0].msg, /MaskBrushTable="2200530C/);
});
