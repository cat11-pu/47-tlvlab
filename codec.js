// codec.js：TLV 字段编解码。报文为十六进制字符串，格式：1 字节类型 + 1 字节长度 + 定长内容。
// 未知类型保留原始字节并在字段上标出；校验和为内容字节求和取模 256。
export const ERROR_CODES = { BAD_CHECKSUM: "E_BAD_CHECKSUM", UNKNOWN_TYPE: "E_UNKNOWN_TYPE" };

const TYPE_NAMES = { 1: "id" };

function toBytes(hex) {
  const data = [];
  for (let index = 0; index + 2 <= hex.length; index += 2) {
    const value = parseInt(hex.slice(index, index + 2), 16);
    data.push(Number.isNaN(value) ? 0 : value);
  }
  return data;
}

function toHexByte(value) {
  return value.toString(16).padStart(2, "0");
}

export function decode(bytes, expectedChecksum) {
  const data = toBytes(bytes);
  const fields = [];
  const errors = [];
  let sum = 0;
  let cursor = 0;
  // 单次线性扫描，游标只前进，不回头重扫。
  while (cursor + 2 <= data.length) {
    const type = data[cursor];
    const declaredLength = data[cursor + 1];
    const available = data.length - (cursor + 2);
    const length = Math.min(declaredLength, available);
    let value = "";
    for (let offset = 0; offset < length; offset += 1) {
      sum += data[cursor + 2 + offset];
      value += toHexByte(data[cursor + 2 + offset]);
    }
    const field = { type: type, value: value };
    if (Object.prototype.hasOwnProperty.call(TYPE_NAMES, type)) {
      field.name = TYPE_NAMES[type];
    } else {
      field.unknown = true;
      errors.push({ code: ERROR_CODES.UNKNOWN_TYPE, type: type, offset: cursor });
    }
    // 声明长度可能与实际内容不同（截断报文），非枚举保存以便逐字节编回。
    Object.defineProperty(field, "declaredLength", {
      value: declaredLength, writable: true, configurable: true, enumerable: false,
    });
    fields.push(field);
    cursor += 2 + length;
  }
  const checksum = sum % 256;
  if (expectedChecksum !== undefined && expectedChecksum !== checksum) {
    errors.push({ code: ERROR_CODES.BAD_CHECKSUM, expected: expectedChecksum, actual: checksum });
  }
  return { fields: fields, checksum: checksum, errors: errors };
}

export function encode(fields) {
  return fields.map((field) => {
    const declared = field.declaredLength !== undefined ? field.declaredLength : field.value.length / 2;
    return toHexByte(field.type) + toHexByte(declared) + field.value;
  }).join("");
}
