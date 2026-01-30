# Changelog

All notable changes to this project will be documented in this file.

## [1.0.12] - 2024-01-30

### Fixed
- **彻底修复 ESM 兼容性问题**
  - 修复了 `uniky/plugin` 在 Vite 配置文件加载时被 `require()` 导致的 ESM 错误
  - 将 Node.js 内置模块导入改为使用 `node:` 前缀 (如 `node:fs`, `node:path`)
  - 在所有相对导入中添加 `.js` 扩展名，确保 ESM 环境下正确解析

### Changed
- **重要变更：改为发布编译后的 JavaScript 文件**
  - 从发布 TypeScript 源码改为发布编译后的 `.js` 和 `.d.ts` 文件
  - 更新 `package.json` 的 `main`、`module`、`exports` 字段指向 `dist` 目录
  - 添加 `build` 脚本和 `prepublishOnly` 钩子自动构建
  - 确保兼容各种构建工具和 Node.js 环境

### Added
- 添加了 `tsconfig.json` 配置文件，提供完整的 TypeScript 编译配置
- 在 README 中新增"故障排除"章节，包含 7 种常见 ESM 错误的解决方案
- 添加了详细的 Vite 配置示例和最佳实践说明
- 添加了本地开发使用 `npm link` 的说明

### 如何更新

在使用 `uniky` 的项目中执行：

```bash
# 如果是从 npm 安装
npm update uniky

# 如果是本地开发使用 npm link
cd /path/to/uniky
npm run build
npm link

cd /path/to/your-project
npm link uniky
```

## [1.0.11] - 2024-01-30

### Fixed
- 初步 ESM 兼容性修复（未完全解决）

### Added
- 添加了基础的 TypeScript 和 ESM 支持
- 在 README 中新增故障排除章节

### Changed
- 优化了 `package.json` 配置，添加 `sideEffects: false`

## [1.0.10] - 2024-01-30

### Initial Release
- 提供 uni-app 常用 hooks
- 提供 HTTP 请求封装
- 提供 Vite 插件：
  - `pagesDefinedPlugin`: 从 pages.json 生成类型安全的路由定义
  - `globalDefinedPlugin`: 自动收集并生成全局类型定义