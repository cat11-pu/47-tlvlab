// chain.js：变换链（支持断点续做，resumeFrom 之前的只计数不重复应用）
import { decode } from "./codec.js";

const TRANSFORMS = {
  mask(fields, params) {
    const index = params && params.field;
    if (Number.isInteger(index) && index >= 0 && index < fields.length) {
      fields[index].value = "*".repeat(fields[index].value.length);
    }
  },
  upper(fields) {
    fields.forEach((field) => { field.value = String(field.value).toUpperCase(); });
  },
  split(fields, params) {
    const index = params && params.field;
    const at = params && params.at;
    if (!Number.isInteger(index) || !Number.isInteger(at)) return;
    const field = fields[index];
    if (!field || at <= 0 || at * 2 >= field.value.length) return;
    const right = { type: field.type, value: field.value.slice(at * 2) };
    field.value = field.value.slice(0, at * 2);
    field.length = at;
    fields.splice(index + 1, 0, right);
  },
};

export function run(bytes, transforms, resumeFrom, options) {
  const list = Array.isArray(transforms) ? transforms : [];
  const start = Math.max(0, Math.min(Number(resumeFrom) || 0, list.length));
  const parsed = decode(bytes, options);
  const fields = parsed.fields;
  const applied = [];
  let reprocessed = 0;
  list.forEach((transform, index) => {
    if (index < start) { reprocessed += 1; return; }
    const apply = TRANSFORMS[transform && transform.name];
    if (apply) apply(fields, (transform && transform.params) || {});
    applied.push(transform && transform.name);
  });
  return { fields: fields, applied: applied, resumed_from: start, reprocessed: reprocessed,
           checksum: parsed.checksum, errors: parsed.errors };
}
