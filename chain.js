// chain.js：变换链。支持从断点续做：resumeFrom 之前的变换视为已做过，
// 跳过不重复应用，跳过条数记入 reprocessed。
import { decode } from "./codec.js";

export function run(bytes, transforms, resumeFrom, expectedChecksum) {
  const parsed = decode(bytes, expectedChecksum);
  const start = Math.max(0, Math.min(resumeFrom || 0, transforms.length));
  const applied = [];
  let reprocessed = 0;
  for (let index = 0; index < transforms.length; index += 1) {
    if (index < start) {
      reprocessed += 1;
      continue;
    }
    applied.push(transforms[index].name);
  }
  return { fields: parsed.fields, checksum: parsed.checksum, errors: parsed.errors,
           applied: applied, resumed_from: start, reprocessed: reprocessed };
}
