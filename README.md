# 数字提取工具（macOS 桌面端 / Tauri + React + TypeScript）

一个轻量的 macOS 桌面小工具：把从 Excel / CSV / 任意文本里复制出来的内容粘贴进去，**自动提取所有整数数字串**并实时生成可直接用于 SQL / 脚本的数组字符串（逗号分隔 / 逗号+单引号）。

## 功能

- **输入**：支持 Excel 粘贴、CSV、混合文本、空格/Tab/换行
- **解析规则**：
  - 仅提取 `0-9` 的连续序列（返回 string，保留前导零）
  - 小数点、负号等都视为分隔符（例如 `-0012` → `0012`；`12.34` → `12` 和 `34`）
  - 保留出现顺序、保留重复、不做去重
- **输出模式**：
  - `123,456,789`
  - `'123','456','789'`
- **操作**：一键复制到剪贴板、一键清空输入
- **历史记录**：
  - 自动保存最近 50 条结果（含时间戳与可编辑名称）
  - 支持重命名、删除、点击“恢复”回填
- **性能**：解析在 Web Worker 中执行，避免 UI 卡顿

## 技术栈

- 桌面端：Tauri（本地运行，无后端服务）
- 前端：React + TypeScript + Vite
- 持久化：localStorage

## 目录结构

```
src/
  components/
  hooks/
  utils/
  history/
  workers/
  App.tsx
```

## 环境要求（macOS）

- Node.js（建议用偶数版 LTS；本项目已验证可在当前环境构建）
- Rust 工具链（`rustup`)
- Xcode Command Line Tools：`xcode-select --install`

## 安装依赖

```bash
npm install
```

## 本地开发（macOS）

启动桌面应用（会自动启动前端 dev server）：

```bash
npm run tauri dev
```

只启动前端（用于调 UI）：

```bash
npm run dev
```

## 构建（macOS）

```bash
npm run tauri build
```

构建产物会输出到 Tauri 的默认目录（`src-tauri/target/...`）。

## 备注

- 解析使用手写扫描（非正则 `match`）+ Worker，确保在大量文本下也尽量稳定、不卡顿。
- 为避免极端大粘贴导致内存/性能问题，解析默认最多处理前 `5,000,000` 个字符（UI 会提示是否发生截断）。

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
