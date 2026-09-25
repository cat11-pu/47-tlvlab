// codec.js：TLV 字段编解码（一字节类型 + 一字节长度 + 随后定长内容）
const TYPE_NAMES = { 1: "id" };

export const E_BAD_CHECKSUM = "E_BAD_CHECKSUM";
export const E_UNKNOWN_TYPE = "E_UNKNOWN_TYPE";

function toByteArray(bytes) {
  if (typeof bytes === "string") {
    const clean = bytes.replace(/\s+/g, "");
    const out = [];
    for (let index = 0; index + 2 <= clean.length; index += 2) {
      const value = parseInt(clean.slice(index, index + 2), 16);
      out.push(Number.isNaN(value) ? 0 : value);
    }
    return out;
  }
  return Array.from(bytes || []);
}

function toHex(data) {
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// 单次线性扫描，游标只前进；长度超出剩余字节时收编到报文末尾。
// 原始长度字节挂在字段的不可枚举属性上：JSON 里仍是 {type, value, name}，
// 但 encode 能按原样写回，保证往返逐字节一致。
export function decode(bytes, options) {
  const data = toByteArray(bytes);
  const fields = [];
  const errors = [];
  let sum = 0;
  let cursor = 0;
  while (cursor < data.length) {
    const type = data[cursor];
    if (cursor + 1 >= data.length) {
      const tail = { type: type, value: "", unknown: true };
      Object.defineProperty(tail, "length", { value: null, writable: true, configurable: true });
      fields.push(tail);
      errors.push(E_UNKNOWN_TYPE);
      cursor += 1;
      continue;
    }
    const length = data[cursor + 1];
    const start = cursor + 2;
    const end = Math.min(start + length, data.length);
    for (let index = start; index < end; index += 1) sum = (sum + data[index]) % 256;
    const field = { type: type, value: toHex(data.slice(start, end)) };
    Object.defineProperty(field, "length", { value: length, writable: true, configurable: true });
    const name = TYPE_NAMES[type];
    if (name) field.name = name;
    else { field.unknown = true; errors.push(E_UNKNOWN_TYPE); }
    fields.push(field);
    cursor = start + length;
  }
  const checksum = sum % 256;
  const expected = options && options.expectChecksum;
  if (expected !== undefined && expected !== null && expected !== checksum) {
    errors.push(E_BAD_CHECKSUM);
  }
  return { fields: fields, checksum: checksum, errors: errors };
}

export function encode(fields) {
  return (fields || []).map((field) => {
    const head = toHex([field.type]);
    const content = typeof field.value === "string" ? field.value : toHex(field.value);
    if (field.length === null) return head + content;
    const length = field.length !== undefined ? field.length : content.length / 2;
    return head + toHex([length]) + content;
  }).join("");
}
