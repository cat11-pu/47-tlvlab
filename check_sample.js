import fs from "node:fs";
import { decode, encode } from "./codec.js";
import { run } from "./chain.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/tlv.json", "utf8"));
const result = run(spec.bytes, spec.transforms || [], spec.resume_from || 0);
const view = render(spec);

emit("字段表 =", result.fields);
emit("校验和 =", result.checksum);
emit("校验是否通过 =", view.checksum_ok);
emit("应用的变换 =", result.applied);
emit("续做起点 =", result.resumed_from);
emit("重复处理的变换数 =", result.reprocessed);
emit("编回去是否与原报文一致 =", view.roundtrip);
emit("校验失败的错误码 =", spec.bad_checksum_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "字段表": [
    {
      "type": 1,
      "value": "4243024445",
      "name": "id"
    }
  ],
  "校验和": 16,
  "校验是否通过": true,
  "应用的变换": [
    "mask"
  ],
  "续做起点": 2,
  "重复处理的变换数": 2,
  "编回去是否与原报文一致": true,
  "校验失败的错误码": "E_BAD_CHECKSUM"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
