// codec.js：字段编解码（基线：按固定两字节切、不认类型）
export function decode(bytes) {
  const fields = [];
  for (let index = 0; index + 2 <= bytes.length; index += 2) {
    fields.push({ type: 0, value: bytes.slice(index, index + 2) });
  }
  return { fields: fields, checksum: 0 };
}

export function encode(fields) {
  return fields.map((field) => field.value).join("");
}
