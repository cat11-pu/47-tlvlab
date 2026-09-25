// chain.js：变换链（基线：一趟全做、不记断点）
import { decode } from "./codec.js";

export function run(bytes, transforms, resumeFrom) {
  const parsed = decode(bytes);
  return { fields: parsed.fields, applied: transforms.map((item) => item.name),
           resumed_from: 0, reprocessed: 0 };
}
