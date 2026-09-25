# tlvlab

浏览器单页工作台（原生 ES 模块，零依赖）。

## 起服务看页面

    python3 -m http.server 8000

浏览器打开 http://127.0.0.1:8000/ ，改样例点运行看结果。

## 测试

    node tests/run.js

## 场景自检

    node check_sample.js

## 接口

- `codec.decode(bytes)`：按 TLV（1 字节类型 + 1 字节长度 + 定长内容）单次线性扫描解码，
  返回 `{ fields, checksum, errors }`；未知类型保留原始字节并标 `unknown: true`，
  记 `E_UNKNOWN_TYPE` 不中断；校验和不符记 `E_BAD_CHECKSUM`。
- `codec.encode(fields)`：把字段表原样编回字节串，往返逐字节一致。
- `chain.run(bytes, transforms, resumeFrom)`：从断点续做变换，已做过的计入
  `reprocessed` 不重复应用，返回 `applied / resumed_from / reprocessed / fields / checksum`。
