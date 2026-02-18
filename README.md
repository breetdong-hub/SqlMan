# SqlMan

从 Excel / CSV / 任意文本中提取整数，生成可直接用于 SQL / 脚本的数组字符串。

## 功能

- **输入**：粘贴表格、CSV、混合文本，支持空格 / Tab / 换行
- **解析规则**：
  - 仅提取 `0-9` 的连续序列（string，保留前导零）
  - 小数点、负号等视为分隔符（`-0012` → `0012`；`12.34` → `12` 和 `34`）
  - 保留顺序、重复，不去重
- **输出模式**：
  - 逗号：`123,456,789`
  - 单引号：`'123','456','789'`
- **操作**：一键复制、一键清空
- **历史记录**：最多 500 条，支持恢复、重命名、删除、搜索

## 技术栈

- 桌面端：Tauri（macOS / Windows / Linux）
- 前端：React + TypeScript + Vite
- 持久化：localStorage

## 快速开始

```bash
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

构建产物在 `src-tauri/target/release/bundle/` 下。

## 环境要求

- Node.js（LTS）
- Rust（`rustup`）
- macOS：Xcode Command Line Tools（`xcode-select --install`）
