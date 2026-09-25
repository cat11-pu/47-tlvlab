// app.js：渲染结果
import { decode, encode, ERROR_CODES } from "./codec.js";
import { run } from "./chain.js";

export function render(spec) {
  const transforms = spec.transforms || [];
  const resumeFrom = spec.resume_from || 0;
  const result = run(spec.bytes, transforms, resumeFrom, spec.checksum);
  const view = transforms.map((item) => item.name).slice(resumeFrom);
  const rebuilt = encode(result.fields);
  const checksumOk = !result.errors.some((error) => error.code === ERROR_CODES.BAD_CHECKSUM);
  return { fields: result.fields, applied: result.applied, view: view,
           resumed_from: result.resumed_from, reprocessed: result.reprocessed,
           roundtrip: rebuilt === spec.bytes, checksum_ok: checksumOk };
}
