// app.js：渲染结果
import { encode, E_BAD_CHECKSUM } from "./codec.js";
import { run } from "./chain.js";

function normalizeHex(bytes) {
  if (typeof bytes === "string") return bytes.replace(/\s+/g, "").toLowerCase();
  return Array.from(bytes || [], (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function render(spec) {
  const transforms = spec.transforms || [];
  const resumeFrom = spec.resume_from || 0;
  const expected = spec.checksum !== undefined ? spec.checksum : spec.expect_checksum;
  const result = run(spec.bytes, transforms, resumeFrom, { expectChecksum: expected });
  const view = transforms.map((item) => item.name).slice(resumeFrom);
  const rebuilt = encode(result.fields);
  return { fields: result.fields, applied: result.applied, view: view,
           resumed_from: result.resumed_from, reprocessed: result.reprocessed,
           roundtrip: rebuilt === normalizeHex(spec.bytes),
           checksum_ok: !result.errors.includes(E_BAD_CHECKSUM) };
}
