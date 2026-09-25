import assert from "node:assert";
import { decode, encode } from "../codec.js";
import { run } from "../chain.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("decode returns fields", () => {
  assert.ok(Array.isArray(decode("abcd").fields));
});

check("decode returns checksum", () => {
  assert.strictEqual(typeof decode("abcd").checksum, "number");
});

check("encode returns text", () => {
  assert.strictEqual(typeof encode([{ type: 1, value: "ab" }]), "string");
});

check("run returns applied list", () => {
  assert.ok(Array.isArray(run("abcd", [{ name: "upper" }], 0).applied));
});

check("render exposes roundtrip flag", () => {
  assert.strictEqual(typeof render({ bytes: "abcd", transforms: [], resume_from: 0 }).roundtrip, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
