// app.js：渲染结果
import { decode, encode } from "./codec.js";
import { run } from "./chain.js";

export function render(spec) {
  const result = run(spec.bytes, spec.transforms || [], spec.resume_from || 0);
  const view = spec.transforms.map((item) => item.name).slice(spec.resume_from || 0);
  const rebuilt = encode(result.fields);
  return { fields: result.fields, applied: result.applied, view: view,
           resumed_from: result.resumed_from, reprocessed: result.reprocessed,
           roundtrip: rebuilt === spec.bytes, checksum_ok: true };
}
